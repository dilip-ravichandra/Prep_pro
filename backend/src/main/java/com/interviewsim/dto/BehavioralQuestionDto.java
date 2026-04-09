package com.interviewsim.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BehavioralQuestionDto {
    private String id;
    private String question;
    private String description;
    private int videoDurationSeconds;
    private String difficulty;
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
