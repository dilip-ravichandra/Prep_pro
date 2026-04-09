package com.interviewsim.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "behavioral_results")
@Data
@EqualsAndHashCode(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BehavioralResult extends BaseResult {

    @Id
    private String id;

    private List<QuestionScore> questionScores;

    private double avgConfidence;
    private double avgClarity;
    private double avgOverall;
    private int questionsAnswered;
    private int totalQuestions;

    @Override
    public void evaluate() {
        this.roundType = "BEHAVIORAL";
        this.totalPossible = totalQuestions;
        this.score = questionsAnswered;

        if (questionScores != null && !questionScores.isEmpty()) {
            this.avgOverall = questionScores.stream().mapToDouble(QuestionScore::getOverallScore).average().orElse(0);
            this.avgConfidence = questionScores.stream().mapToDouble(QuestionScore::getConfidenceScore).average().orElse(0);
            this.avgClarity = questionScores.stream().mapToDouble(QuestionScore::getClarityScore).average().orElse(0);
        }

        this.percentage = Math.round(avgOverall * 10.0) / 10.0;
        this.grade = calculateGrade(percentage);
        this.completedAt = LocalDateTime.now();
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionScore {
        private int questionIndex;
        private double overallScore;
        private double confidenceScore;
        private double clarityScore;
        private long durationSeconds;
    }
}
