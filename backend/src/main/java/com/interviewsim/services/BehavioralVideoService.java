package com.interviewsim.services;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.interviewsim.dto.BehavioralVideoSubmissionResponse;
import com.interviewsim.models.BehavioralQuestion;
import com.interviewsim.models.BehavioralVideoSubmission;
import com.interviewsim.models.User;
import com.interviewsim.repositories.BehavioralQuestionRepository;
import com.interviewsim.repositories.BehavioralVideoSubmissionRepository;
import com.interviewsim.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BehavioralVideoService {

    private final BehavioralVideoSubmissionRepository submissionRepository;
    private final BehavioralQuestionRepository behavioralQuestionRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${app.upload.video-dir:uploads/videos}")
    private String videoUploadDir;

    @Value("${app.upload.audio-dir:uploads/audio}")
    private String audioUploadDir;

    @Value("${app.ai.groq.api-key:}")
    private String groqApiKey;

    @Value("${app.ai.groq.model:llama-3.3-70b-versatile}")
    private String groqModel;

    @Value("${app.ai.whisper.model:whisper-large-v3-turbo}")
    private String whisperModel;

    @Value("${app.ffmpeg.path:ffmpeg}")
    private String ffmpegPath;

    public BehavioralVideoSubmissionResponse submit(String userId, String questionId, double facePresenceScore, MultipartFile videoFile) {
        if (videoFile == null || videoFile.isEmpty()) {
            throw new RuntimeException("Video file is required.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found."));

        String questionText = resolveQuestionText(questionId);

        Path videoPath = storeFile(videoFile, Paths.get(videoUploadDir));
        Path audioPath = extractAudio(videoPath);

        String transcript = transcribeAudio(audioPath);
        EvaluationResult eval = evaluateBehavioralAnswer(questionText, transcript);

        double safeFaceScore = Math.max(0, Math.min(100, facePresenceScore));
        double finalScore = Math.round((eval.score * 0.7 + safeFaceScore * 0.3) * 10.0) / 10.0;
        if (eval.score <= 10) {
            // Clearly off-topic/very poor content should remain in 0-10 overall range.
            finalScore = Math.round(eval.score * 10.0) / 10.0;
        } else if (eval.score <= 25) {
            // Low relevance content should not be boosted too much by camera presence.
            finalScore = Math.min(finalScore, 25.0);
        }
        // Additional penalty if camera presence is very low (suspicious cheating/looking away)
        if (safeFaceScore < 50) {
            finalScore = Math.min(finalScore, 20.0);
            eval.weaknesses.add("Insufficient camera presence detected - possible cheating or distraction.");
        }
        boolean suspicious = safeFaceScore < 70 || eval.score <= 20;

        BehavioralVideoSubmission saved = submissionRepository.save(BehavioralVideoSubmission.builder()
                .userId(userId)
                .candidateName(user.getName())
                .candidateEmail(user.getEmail())
                .questionId(questionId)
                .question(questionText)
                .videoPath(videoPath.toString())
                .videoUrl("/api/public/videos/" + videoPath.getFileName())
                .audioPath(audioPath != null ? audioPath.toString() : null)
                .transcript(transcript)
                .contentScore(eval.score)
                .facePresenceScore(safeFaceScore)
                .finalScore(finalScore)
                .suspicious(suspicious)
                .strengths(eval.strengths)
                .weaknesses(eval.weaknesses)
                .suggestions(eval.suggestions)
                .submittedAt(LocalDateTime.now())
                .build());

        return BehavioralVideoSubmissionResponse.builder()
                .submissionId(saved.getId())
                .questionId(saved.getQuestionId())
                .question(saved.getQuestion())
                .videoUrl(saved.getVideoUrl())
                .transcript(saved.getTranscript())
                .contentScore(saved.getContentScore())
                .facePresenceScore(saved.getFacePresenceScore())
                .finalScore(saved.getFinalScore())
                .suspicious(saved.isSuspicious())
                .strengths(saved.getStrengths())
                .weaknesses(saved.getWeaknesses())
                .suggestions(saved.getSuggestions())
                .build();
    }

    public List<BehavioralVideoSubmission> getAllSubmissions() {
        return submissionRepository.findAllByOrderBySubmittedAtDesc();
    }

    public Resource loadVideo(String fileName) {
        try {
            Path file = Paths.get(videoUploadDir).resolve(fileName).normalize();
            Resource resource = new UrlResource(file.toUri());
            if (!resource.exists()) {
                throw new RuntimeException("Video not found.");
            }
            return resource;
        } catch (Exception ex) {
            throw new RuntimeException("Failed to load video.");
        }
    }

    private String resolveQuestionText(String questionId) {
        if (questionId == null || questionId.isBlank()) return "Behavioral interview response";

        return behavioralQuestionRepository.findById(questionId)
                .map(BehavioralQuestion::getQuestion)
                .orElseGet(() -> {
                    Map<String, String> fallback = Map.of(
                            "0", "Tell me about yourself and what drives you toward this role.",
                            "1", "Describe a challenging technical project. What was your approach and outcome?",
                            "2", "Where do you see yourself professionally in 5 years?",
                            "3", "Tell me about a conflict with a team member and how you resolved it.",
                            "4", "What are your strongest technical skills and what areas are you actively improving?",
                            "5", "Why should we hire you over other qualified candidates?"
                    );
                    return fallback.getOrDefault(questionId, "Behavioral interview response");
                });
    }

    private Path storeFile(MultipartFile file, Path targetDir) {
        try {
            Files.createDirectories(targetDir);
            String original = file.getOriginalFilename() == null ? "video.webm" : file.getOriginalFilename();
            String ext = original.contains(".") ? original.substring(original.lastIndexOf('.')) : ".webm";
            String safeExt = ext.toLowerCase(Locale.ROOT);
            String fileName = UUID.randomUUID() + safeExt;
            Path target = targetDir.resolve(fileName).normalize();
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            return target;
        } catch (IOException ex) {
            throw new RuntimeException("Failed to store uploaded video.");
        }
    }

    private Path extractAudio(Path videoPath) {
        try {
            Files.createDirectories(Paths.get(audioUploadDir));
            String baseName = videoPath.getFileName().toString();
            int dot = baseName.lastIndexOf('.');
            if (dot > 0) baseName = baseName.substring(0, dot);
            Path audioPath = Paths.get(audioUploadDir).resolve(baseName + ".mp3");

            String configured = resolveConfig("FFMPEG_PATH", ffmpegPath, "ffmpeg");
            List<String> ffmpegCandidates = List.of(
                    configured,
                    "ffmpeg",
                    "C:\\Users\\HP\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-8.1-full_build\\bin\\ffmpeg.exe"
            );

            for (String ffmpeg : ffmpegCandidates) {
                if (ffmpeg == null || ffmpeg.isBlank()) continue;

                try {
                    ProcessBuilder pb = new ProcessBuilder(
                            ffmpeg,
                            "-y",
                            "-i", videoPath.toString(),
                            "-vn",
                            "-acodec", "libmp3lame",
                            audioPath.toString()
                    );
                    pb.redirectErrorStream(true);
                    Process process = pb.start();
                    int exit = process.waitFor();
                    if (exit == 0 && Files.exists(audioPath)) {
                        return audioPath;
                    }
                } catch (Exception ignored) {
                    // Try next ffmpeg candidate.
                }
            }

            return null;
        } catch (Exception ex) {
            return null;
        }
    }

    private String transcribeAudio(Path audioPath) {
        if (audioPath == null || !Files.exists(audioPath)) {
            return "";
        }
        String effectiveApiKey = resolveConfig("GROQ_API_KEY", groqApiKey, "");
        String effectiveWhisperModel = resolveConfig("WHISPER_MODEL", whisperModel, "whisper-large-v3-turbo");

        if (effectiveApiKey.isBlank()) {
            return "";
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(effectiveApiKey);
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("model", effectiveWhisperModel);
            body.add("file", new FileSystemResource(audioPath));

            ResponseEntity<String> response = restTemplate.postForEntity(
                    "https://api.groq.com/openai/v1/audio/transcriptions",
                    new HttpEntity<>(body, headers),
                    String.class
            );

            JsonNode root = objectMapper.readTree(response.getBody());
            return root.path("text").asText("").trim();
        } catch (Exception ex) {
            return "";
        }
    }

    private EvaluationResult evaluateBehavioralAnswer(String question, String transcript) {
        if (transcript == null || transcript.isBlank()) {
            return EvaluationResult.fallback("Transcript unavailable. Please ensure microphone and FFmpeg are working.");
        }

        // Check for common excuse patterns FIRST
        String lowerTranscript = transcript.toLowerCase();
        List<String> excusePhrases = List.of(
                "i lost", "i forgot", "i don't remember", "i didn't save", 
                "i don't have", "not interesting", "not very interesting",
                "boring", "i don't know", "i can't recall", "i have nothing"
        );
        List<String> matchedExcuses = new ArrayList<>();
        for (String phrase : excusePhrases) {
            if (lowerTranscript.contains(phrase)) {
                matchedExcuses.add(phrase);
            }
        }
        if (!matchedExcuses.isEmpty()) {
            return EvaluationResult.fallback("Answer contains excuses or lacks substance (" + String.join(", ", matchedExcuses) + 
                    "). Provide concrete, specific examples from your actual experience.");
        }

        // Check for insufficient answer length
        String[] words = transcript.trim().split("\\s+");
        if (words.length < 30) {
            return EvaluationResult.fallback("Answer is too brief. Provide a substantial response (minimum 30 words) with specific examples and details.");
        }

        String effectiveApiKey = resolveConfig("GROQ_API_KEY", groqApiKey, "");
        String effectiveModel = resolveConfig("GROQ_MODEL", groqModel, "llama-3.3-70b-versatile");

        if (effectiveApiKey.isBlank()) {
            return EvaluationResult.fallback("AI evaluation unavailable because GROQ_API_KEY is missing.");
        }

        String systemPrompt = "You are an expert behavioral interviewer. Return ONLY valid JSON with keys: " +
            "score (0-100 number), relevanceScore (0-100 number), strengths (string array), weaknesses (string array), suggestions (string array). " +
            "Scoring policy is strict: If the answer is clearly off-topic to the question (example: question asks career/role and answer is mostly about pet stories), " +
            "set relevanceScore to 0-15 and score to 0-10. " +
            "If mostly off-topic, keep score <= 25. " +
            "PENALIZE HEAVILY: vague answers, excuses (lost projects, forgot details, nothing to show), lack of specific examples, or dismissive tone (boring/uninteresting). " +
            "If answer is vague or contains excuses, score 5-20. " +
            "DETECT CHEATING: Look for copied/generic phrases, lack of personalization, ChatGPT-like structure, suspiciously polished language, or canned responses. " +
            "If answer appears copied or generic, score 5-25 and add weakness about lack of authenticity. " +
            "If partially relevant but weak, score 26-50. " +
            "If relevant and clear with concrete examples and authentic voice, score 51-100.";
        String userPrompt = "Question: " + question + "\n\nTranscript (word count: " + words.length + "): " + transcript + "\n\n" +
            "Evaluate relevance, clarity, structure, depth, specificity, authenticity, and completeness. " +
            "Penalize vague, excuse-based, or low-effort answers. " +
            "Look for concrete examples, metrics, and professional substance. " +
            "IMPORTANT: Detect if this sounds copied from the web or ChatGPT. Look for generic phrases, overly polished structure, lack of personal voice, or canned responses.";

        Map<String, Object> body = Map.of(
            "model", effectiveModel,
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user", "content", userPrompt)
                ),
                "temperature", 0.2,
                "max_tokens", 600
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
            String content = root.path("choices").path(0).path("message").path("content").asText("");
            if (content.isBlank()) {
                return EvaluationResult.fallback("AI returned an empty evaluation.");
            }

            String jsonContent = extractJson(content);
            Map<String, Object> parsed = objectMapper.readValue(jsonContent, new TypeReference<>() {});

            double score = Math.max(0, Math.min(100, toDouble(parsed.get("score"))));
            double relevanceScore = Math.max(0, Math.min(100, toDouble(parsed.get("relevanceScore"))));
            List<String> strengths = toStringList(parsed.get("strengths"));
            List<String> weaknesses = toStringList(parsed.get("weaknesses"));
            List<String> suggestions = toStringList(parsed.get("suggestions"));

            // Hard guardrail: clearly off-topic answers must not receive high scores.
            if (relevanceScore <= 15) {
                score = Math.min(score, 10);
                weaknesses = prependIfMissing(weaknesses, "Answer is largely unrelated to the asked interview question.");
                suggestions = prependIfMissing(suggestions, "Stay on-topic and directly answer the question using concrete professional examples.");
            } else if (relevanceScore <= 30) {
                score = Math.min(score, 25);
                weaknesses = prependIfMissing(weaknesses, "Answer has low relevance to the question.");
            }

            if (strengths.isEmpty()) strengths = List.of("Answer addresses key points from the question.");
            if (weaknesses.isEmpty()) weaknesses = List.of("Could provide more quantified impact.");
            if (suggestions.isEmpty()) suggestions = List.of("Use STAR format and include measurable outcomes.");

            return new EvaluationResult(score, strengths, weaknesses, suggestions);
        } catch (Exception ex) {
            return EvaluationResult.fallback("AI evaluation failed. Please retry in a moment.");
        }
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

    private List<String> toStringList(Object value) {
        if (value instanceof List<?> list) {
            List<String> out = new ArrayList<>();
            for (Object o : list) out.add(String.valueOf(o));
            return out;
        }
        return new ArrayList<>();
    }

    private List<String> prependIfMissing(List<String> list, String message) {
        List<String> out = new ArrayList<>();
        if (list != null) out.addAll(list);
        boolean exists = out.stream().anyMatch(v -> v != null && v.equalsIgnoreCase(message));
        if (!exists) {
            out.add(0, message);
        }
        return out;
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

    private record EvaluationResult(double score, List<String> strengths, List<String> weaknesses, List<String> suggestions) {
        private static EvaluationResult fallback(String reason) {
            return new EvaluationResult(
                    50,
                    List.of("You attempted the answer with available input."),
                    List.of(reason),
                    List.of("Retry with clearer audio and structured response.")
            );
        }
    }
}
