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
public class AptitudeQuestionDto {
    private String id;
    private String question;
    private List<String> options;
    private int correctAnswer;
    private String difficulty;
    private String topic;
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
