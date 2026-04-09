package com.interviewsim.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AdminSubmissionUpdateRequest {
    private Double score;

    @NotBlank(message = "Feedback is required")
    private String feedback;
}
