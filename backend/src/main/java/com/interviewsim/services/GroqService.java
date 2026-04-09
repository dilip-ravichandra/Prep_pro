package com.interviewsim.services;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.interviewsim.dto.CodeEvaluationRequest;
import com.interviewsim.dto.CodeEvaluationResponse;
import com.interviewsim.models.Submission;
import com.interviewsim.repositories.SubmissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class GroqService {

    private final ObjectMapper objectMapper;
    private final SubmissionRepository submissionRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${app.ai.groq.api-key:}")
    private String groqApiKey;

    @Value("${app.ai.groq.model:llama-3.3-70b-versatile}")
    private String groqModel;

    public CodeEvaluationResponse evaluateCode(String userId, CodeEvaluationRequest request) {
        groqApiKey = resolveConfig("GROQ_API_KEY", groqApiKey, "");
        groqModel = resolveConfig("GROQ_MODEL", groqModel, "llama-3.3-70b-versatile");

        CodeEvaluationResponse evaluation = callGroq(request);

        Submission submission = Submission.builder()
                .userId(userId)
                .questionId(request.getQuestionId())
                .language(request.getLanguage())
                .problemStatement(request.getProblemStatement())
                .code(request.getUserCode())
                .score(evaluation.getScore())
                .isCorrect(evaluation.isCorrect())
                .errors(evaluation.getErrors())
                .suggestions(evaluation.getSuggestions())
                .fixedCode(evaluation.getFixedCode())
                .feedback(buildFeedback(evaluation))
                .submittedAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Submission saved = submissionRepository.save(submission);
        evaluation.setSubmissionId(saved.getId());
        return evaluation;
    }

    public Map<String, Object> generateAptitudeMcq(String topic, String difficulty) {
        groqApiKey = resolveConfig("GROQ_API_KEY", groqApiKey, "");
        groqModel = resolveConfig("GROQ_MODEL", groqModel, "llama-3.3-70b-versatile");

        if (groqApiKey == null || groqApiKey.isBlank()) {
            return fallbackMcq(topic, difficulty);
        }

        String systemPrompt = "You are an expert aptitude question generator. "
                + "Return ONLY valid JSON with this exact structure: "
                + "{\"question\":\"...\",\"options\":[\"...\",\"...\",\"...\",\"...\"],\"correctAnswer\":0,\"explanation\":\"...\"}. "
                + "Rules: exactly 4 options, only one correct option, correctAnswer must be integer 0-3.";

        String userPrompt = "Generate one " + difficulty + " aptitude MCQ on topic: " + topic;

        Map<String, Object> body = Map.of(
                "model", groqModel,
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user", "content", userPrompt)
                ),
                "temperature", 0.4,
                "max_tokens", 500
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(groqApiKey);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(
                    "https://api.groq.com/openai/v1/chat/completions",
                    new HttpEntity<>(body, headers),
                    String.class
            );

            JsonNode root = objectMapper.readTree(response.getBody());
            String content = root.path("choices").path(0).path("message").path("content").asText("");
            if (content.isBlank()) return fallbackMcq(topic, difficulty);

            String jsonContent = extractJson(content);
            Map<String, Object> parsed = objectMapper.readValue(jsonContent, new TypeReference<>() {});

            Object optionsObj = parsed.get("options");
            List<String> options = (optionsObj instanceof List<?> list)
                    ? list.stream().map(String::valueOf).toList()
                    : List.of("Option A", "Option B", "Option C", "Option D");

            int correctAnswer = 0;
            Object correctObj = parsed.get("correctAnswer");
            if (correctObj instanceof Number n) correctAnswer = n.intValue();

            Map<String, Object> result = new HashMap<>();
            result.put("question", String.valueOf(parsed.getOrDefault("question", "Generated question")));
            result.put("options", options.size() == 4 ? options : List.of("Option A", "Option B", "Option C", "Option D"));
            result.put("correctAnswer", Math.max(0, Math.min(3, correctAnswer)));
            result.put("difficulty", difficulty);
            result.put("topic", topic);
            result.put("explanation", String.valueOf(parsed.getOrDefault("explanation", "")));
            return result;
        } catch (Exception ex) {
            return fallbackMcq(topic, difficulty);
        }
    }

    private CodeEvaluationResponse callGroq(CodeEvaluationRequest request) {
        if (groqApiKey == null || groqApiKey.isBlank()) {
            return fallback("Groq API key is not configured");
        }

        String systemPrompt = "You are an expert coding interviewer.\n\n"
            + "Evaluate the given code strictly.\n\n"
            + "Input:\n"
            + "- Language: {language}\n"
            + "- Problem: {problem}\n"
            + "- Code: {code}\n\n"
            + "Tasks:\n"
            + "1. Check correctness\n"
            + "2. Identify syntax/logical errors\n"
            + "3. Suggest improvements\n"
            + "4. Fix the code if incorrect\n"
            + "5. Give score out of 100\n\n"
            + "Rules:\n"
            + "- Be accurate, not optimistic\n"
            + "- Do not assume code runs\n"
            + "- Be strict like real interviewer\n\n"
            + "Output ONLY in JSON:\n"
            + "{\n"
            + "  \"score\": number,\n"
            + "  \"isCorrect\": boolean,\n"
            + "  \"errors\": [],\n"
            + "  \"suggestions\": [],\n"
            + "  \"fixedCode\": \"\"\n"
            + "}";

        String userPrompt = "Language: " + request.getLanguage() + "\n" +
                "Problem Statement:\n" + request.getProblemStatement() + "\n\n" +
                "User Code:\n" + request.getUserCode() + "\n\n" +
                "Evaluate correctness, likely runtime/syntax issues, and provide concise suggestions and fixed code.";

        Map<String, Object> body = Map.of(
                "model", groqModel,
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user", "content", userPrompt)
                ),
                "temperature", 0.1,
                "max_tokens", 800
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(groqApiKey);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(
                    "https://api.groq.com/openai/v1/chat/completions",
                    new HttpEntity<>(body, headers),
                    String.class
            );

            JsonNode root = objectMapper.readTree(response.getBody());
            String content = root.path("choices").path(0).path("message").path("content").asText("");
            if (content.isBlank()) return fallback("Empty Groq response");

            String jsonContent = extractJson(content);
            Map<String, Object> parsed = objectMapper.readValue(jsonContent, new TypeReference<>() {});

            double score = toDouble(parsed.get("score"));
            boolean isCorrect = toBoolean(parsed.get("isCorrect"));
            List<String> errors = toStringList(parsed.get("errors"));
            List<String> suggestions = toStringList(parsed.get("suggestions"));
            String fixedCode = parsed.get("fixedCode") == null ? "" : String.valueOf(parsed.get("fixedCode"));

            return CodeEvaluationResponse.builder()
                    .score(Math.max(0, Math.min(100, score)))
                    .isCorrect(isCorrect)
                    .errors(errors)
                    .suggestions(suggestions)
                    .fixedCode(fixedCode)
                    .build();
        } catch (Exception ex) {
            return fallback("Evaluation failed");
        }
    }

    private String buildFeedback(CodeEvaluationResponse eval) {
        if (eval.isCorrect()) {
            return "Looks correct. Score: " + Math.round(eval.getScore());
        }
        if (eval.getErrors() != null && !eval.getErrors().isEmpty()) {
            return "Issues found: " + eval.getErrors().get(0);
        }
        return "Needs improvement.";
    }

    private CodeEvaluationResponse fallback(String reason) {
        return CodeEvaluationResponse.builder()
                .score(0)
                .isCorrect(false)
                .errors(List.of(reason))
                .suggestions(List.of("Try again after fixing syntax and logic."))
                .fixedCode("")
                .build();
    }

    private Map<String, Object> fallbackMcq(String topic, String difficulty) {
        Map<String, Object> result = new HashMap<>();
        result.put("question", "Sample " + difficulty + " question on " + topic + ": What is the next number in the sequence 2, 4, 8, 16, ?");
        result.put("options", List.of("18", "24", "32", "30"));
        result.put("correctAnswer", 2);
        result.put("difficulty", difficulty);
        result.put("topic", topic);
        result.put("explanation", "The sequence doubles each step.");
        return result;
    }

    private String extractJson(String content) {
        String trimmed = content.trim();
        if (trimmed.startsWith("```")) {
            int firstBrace = trimmed.indexOf('{');
            int lastBrace = trimmed.lastIndexOf('}');
            if (firstBrace >= 0 && lastBrace > firstBrace) {
                return trimmed.substring(firstBrace, lastBrace + 1);
            }
        }
        return trimmed;
    }

    private double toDouble(Object value) {
        if (value == null) return 0;
        if (value instanceof Number n) return n.doubleValue();
        try {
            return Double.parseDouble(String.valueOf(value));
        } catch (Exception ignored) {
            return 0;
        }
    }

    private boolean toBoolean(Object value) {
        if (value instanceof Boolean b) return b;
        return "true".equalsIgnoreCase(String.valueOf(value));
    }

    private List<String> toStringList(Object value) {
        if (value instanceof List<?> list) {
            return list.stream().map(String::valueOf).toList();
        }
        return List.of();
    }

    private String resolveConfig(String key, String injectedValue, String defaultValue) {
        String value = normalizeValue(injectedValue);
        if (!value.isBlank()) return value;

        value = normalizeValue(System.getenv(key));
        if (!value.isBlank()) return value;

        value = normalizeValue(readFromDotEnv(key));
        if (!value.isBlank()) return value;

        return defaultValue == null ? "" : defaultValue;
    }

    private String readFromDotEnv(String key) {
        Set<Path> candidates = new LinkedHashSet<>();
        Path currentDir = Path.of(System.getProperty("user.dir", ".")).toAbsolutePath().normalize();
        candidates.add(currentDir.resolve(".env"));
        candidates.add(currentDir.resolve("..").resolve(".env").normalize());
        candidates.add(Path.of(".env").toAbsolutePath().normalize());
        candidates.add(Path.of("..", ".env").toAbsolutePath().normalize());

        for (Path path : candidates) {
            if (!Files.exists(path)) continue;
            try {
                for (String line : Files.readAllLines(path)) {
                    String trimmed = line.trim();
                    if (trimmed.isEmpty() || trimmed.startsWith("#") || !trimmed.contains("=")) continue;

                    int eq = trimmed.indexOf('=');
                    String envKey = trimmed.substring(0, eq).trim();
                    if (!envKey.equals(key)) continue;

                    String envValue = trimmed.substring(eq + 1).trim();
                    return normalizeValue(envValue);
                }
            } catch (IOException ignored) {
                // Ignore unreadable .env files and continue.
            }
        }
        return "";
    }

    private String normalizeValue(String raw) {
        if (raw == null) return "";
        String value = raw.trim();
        if (value.length() >= 2) {
            boolean doubleQuoted = value.startsWith("\"") && value.endsWith("\"");
            boolean singleQuoted = value.startsWith("'") && value.endsWith("'");
            if (doubleQuoted || singleQuoted) {
                value = value.substring(1, value.length() - 1).trim();
            }
        }
        return value;
    }
}
