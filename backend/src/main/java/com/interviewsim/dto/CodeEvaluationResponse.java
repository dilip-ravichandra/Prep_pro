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
public class CodeEvaluationResponse {
    private double score;
    private boolean isCorrect;
    private List<String> errors;
    private List<String> suggestions;
    private String fixedCode;
    private String submissionId;
}
