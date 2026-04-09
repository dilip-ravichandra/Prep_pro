package com.interviewsim.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CandidateSubmitRequest {
    @NotBlank(message = "QuestionId is required")
    private String questionId;

    @NotBlank(message = "Code/answer is required")
    private String code;
}
