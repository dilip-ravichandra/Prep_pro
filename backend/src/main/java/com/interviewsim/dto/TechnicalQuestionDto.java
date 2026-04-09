package com.interviewsim.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TechnicalQuestionDto {
    private String id;
    private String question;
    private String description;
    private String language;
    private String difficulty;
    private int timeLimit;
    private List<TestCaseDto> testCases;
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
