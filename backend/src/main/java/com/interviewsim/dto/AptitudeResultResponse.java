package com.interviewsim.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AptitudeResultResponse {
    private int correctCount;
    private int wrongCount;
    private int skippedCount;
    private int totalQuestions;
    private double percentage;
    private String grade;
    private long timeTakenSeconds;
    private Map<String, Double> categoryScores;
    private Map<Integer, Boolean> answerCorrectness;
    private List<String> recommendations;
}
