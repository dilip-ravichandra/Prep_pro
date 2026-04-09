package com.interviewsim.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BehavioralResultResponse {
    private double avgOverall;
    private double avgConfidence;
    private double avgClarity;
    private int questionsAnswered;
    private int totalQuestions;
    private double percentage;
    private String grade;
    private List<QuestionFeedback> perQuestionFeedback;
    private List<String> recommendations;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionFeedback {
        private int questionIndex;
        private double overallScore;
        private double confidenceScore;
        private double clarityScore;
        private String tip;
    }
}
