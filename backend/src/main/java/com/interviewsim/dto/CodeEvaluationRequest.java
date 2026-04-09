package com.interviewsim.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CodeEvaluationRequest {
    private String questionId;

    @NotBlank(message = "Language is required")
    private String language;

    @NotBlank(message = "Problem statement is required")
    private String problemStatement;

    @NotBlank(message = "User code is required")
    private String userCode;
}
