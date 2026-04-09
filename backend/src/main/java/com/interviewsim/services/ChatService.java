package com.interviewsim.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.interviewsim.dto.ChatRequest;
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
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${app.ai.groq.api-key:}")
    private String groqApiKey;

    @Value("${app.ai.groq.model:llama-3.3-70b-versatile}")
    private String groqModel;

    public String ask(ChatRequest request) {
        String userMessage = request.getMessage() == null ? "" : request.getMessage().trim();
        String effectiveApiKey = resolveConfig("GROQ_API_KEY", groqApiKey, "");
        String effectiveModel = resolveConfig("GROQ_MODEL", groqModel, "llama-3.3-70b-versatile");

        if (effectiveApiKey.isBlank()) {
            return "AI chat is unavailable: GROQ_API_KEY is not configured.";
        }

        String systemPrompt = "You are PrepPro assistant. Note: the platform was previously called InterviewSimPro and is now renamed to PrepPro. " +
            "Help users navigate dashboard, rounds, results, analytics, leaderboard and profile. " +
                "Always refer to the platform as PrepPro. Never call it InterviewSim or InterviewSimPro in replies. " +
                "Give concise interview tips for aptitude, technical and behavioral rounds. " +
                "Never provide full coding solutions or complete answers for cheating. " +
                "Be friendly, short and practical.";

        String userPrompt = userMessage;
        if (request.getPageContext() != null && !request.getPageContext().isBlank()) {
            userPrompt = "Page Context: " + request.getPageContext() + "\nUser: " + userMessage;
        }

        Map<String, Object> body = Map.of(
            "model", effectiveModel,
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user", "content", userPrompt)
                ),
                "temperature", 0.4,
                "max_tokens", 300
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(effectiveApiKey);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(
                    "https://api.groq.com/openai/v1/chat/completions",
                    new HttpEntity<>(body, headers),
                    String.class
            );

            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode content = root.path("choices").path(0).path("message").path("content");
            if (content.isMissingNode() || content.asText().isBlank()) {
                return "AI chat is unavailable: empty response from provider.";
            }
            return content.asText();
        } catch (Exception ex) {
            return "AI chat is unavailable right now. Please verify GROQ_API_KEY, GROQ_MODEL, and internet connectivity.";
        }
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
