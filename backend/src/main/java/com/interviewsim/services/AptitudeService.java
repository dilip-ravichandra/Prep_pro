package com.interviewsim.services;

import com.interviewsim.dto.AptitudeResultResponse;
import com.interviewsim.dto.AptitudeSubmitRequest;
import com.interviewsim.models.AptitudeQuestion;
import com.interviewsim.models.AptitudeResult;
import com.interviewsim.repositories.AptitudeQuestionRepository;
import com.interviewsim.repositories.AptitudeResultRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AptitudeService {

    private final AptitudeResultRepository aptitudeResultRepository;
    private final AptitudeQuestionRepository aptitudeQuestionRepository;

    public AptitudeResultResponse evaluate(String userId, AptitudeSubmitRequest request) {
        Map<Integer, Integer> submitted = request.getAnswers() == null ? new HashMap<>() : request.getAnswers();
        List<String> questionIds = request.getQuestionIds() == null ? List.of() : request.getQuestionIds();
        Map<Integer, Boolean> correctness = new HashMap<>();
        Map<String, List<Boolean>> categoryResults = new HashMap<>();

        int totalQuestions = request.getQuestionCount() > 0 ? request.getQuestionCount() : questionIds.size();
        if (totalQuestions <= 0) {
            totalQuestions = 10;
        }

        Map<String, AptitudeQuestion> questionsById = aptitudeQuestionRepository.findAllById(questionIds).stream()
                .collect(Collectors.toMap(AptitudeQuestion::getId, q -> q, (a, b) -> a, HashMap::new));

        int correct = 0;
        int wrong = 0;
        int skipped = 0;

        for (int i = 0; i < totalQuestions; i++) {
            String category = resolveCategory(i, questionIds, questionsById);
            categoryResults.computeIfAbsent(category, k -> new ArrayList<>());

            Integer submittedAnswer = submitted.get(i);
            if (submittedAnswer == null) {
                skipped++;
                correctness.put(i, false);
                categoryResults.get(category).add(false);
                continue;
            }

            Integer correctAnswer = resolveCorrectAnswer(i, questionIds, questionsById);
            boolean isCorrect = correctAnswer != null && correctAnswer.equals(submittedAnswer);
            correctness.put(i, isCorrect);
            categoryResults.get(category).add(isCorrect);
            if (isCorrect) correct++; else wrong++;
        }

        Map<String, Double> catScores = new HashMap<>();
        categoryResults.forEach((cat, results) -> {
            long passed = results.stream().filter(Boolean::booleanValue).count();
            catScores.put(cat, Math.round(passed * 100.0 / results.size() * 10.0) / 10.0);
        });

        double pct = Math.round(correct * 100.0 / Math.max(1, totalQuestions) * 10.0) / 10.0;

        AptitudeResult result = AptitudeResult.builder()
                .answers(submitted)
                .correctCount(correct)
                .wrongCount(wrong)
                .skippedCount(skipped)
                .categoryScores(catScores)
                .build();
        result.setUserId(userId);
        result.setTotalPossible(totalQuestions);
        result.evaluate();
        aptitudeResultRepository.save(result);

        return AptitudeResultResponse.builder()
                .correctCount(correct)
                .wrongCount(wrong)
                .skippedCount(skipped)
                .totalQuestions(totalQuestions)
                .percentage(pct)
                .grade(result.getGrade())
                .timeTakenSeconds(request.getTimeTakenSeconds())
                .categoryScores(catScores)
                .answerCorrectness(correctness)
                .recommendations(buildAptitudeRecommendations(catScores))
                .build();
    }

    private Integer resolveCorrectAnswer(int index, List<String> questionIds, Map<String, AptitudeQuestion> questionsById) {
        if (index < questionIds.size()) {
            AptitudeQuestion question = questionsById.get(questionIds.get(index));
            if (question != null) {
                return question.getCorrectAnswer();
            }
        }
        return legacyCorrectAnswer(index);
    }

    private String resolveCategory(int index, List<String> questionIds, Map<String, AptitudeQuestion> questionsById) {
        if (index < questionIds.size()) {
            AptitudeQuestion question = questionsById.get(questionIds.get(index));
            if (question != null) {
                if (question.getTopic() != null && !question.getTopic().isBlank()) return question.getTopic();
                if (question.getDifficulty() != null && !question.getDifficulty().isBlank()) return question.getDifficulty();
            }
        }
        return legacyCategory(index);
    }

    private Integer legacyCorrectAnswer(int index) {
        return switch (index) {
            case 0, 1, 2, 3, 5 -> 1;
            case 4 -> 2;
            case 6 -> 2;
            case 7, 8, 9 -> 1;
            default -> null;
        };
    }

    private String legacyCategory(int index) {
        return switch (index) {
            case 0 -> "Quantitative";
            case 1 -> "Pattern";
            case 2 -> "Work & Time";
            case 3 -> "Percentage";
            case 4 -> "Verbal";
            case 5 -> "Logical";
            case 6 -> "Pattern";
            case 7 -> "Profit & Loss";
            case 8 -> "Logical";
            case 9 -> "Ratio";
            default -> "General";
        };
    }

    private List<String> buildAptitudeRecommendations(Map<String, Double> catScores) {
        List<String> recs = new ArrayList<>();
        catScores.forEach((cat, score) -> {
            if (score < 70) {
                recs.add("Focus on " + cat + " — score was " + score + "%. Practice 10 problems daily.");
            }
        });
        if (recs.isEmpty()) {
            recs.add("Great performance! Review any wrong answers and maintain your speed.");
        }
        return recs;
    }
}
