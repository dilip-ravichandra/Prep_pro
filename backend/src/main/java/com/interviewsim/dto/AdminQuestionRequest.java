package com.interviewsim.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AdminQuestionRequest {
    @NotBlank(message = "Question is required")
    private String question;

    @NotBlank(message = "Type is required")
    private String type;

    @NotBlank(message = "Language is required")
    private String language;

    @NotBlank(message = "Difficulty is required")
    private String difficulty;
}
