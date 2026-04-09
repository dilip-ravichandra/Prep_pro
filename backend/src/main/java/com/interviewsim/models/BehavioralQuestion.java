package com.interviewsim.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

/**
 * BehavioralQuestion Model
 * Stores questions for behavioral round where candidates record video responses
 */
@Document(collection = "behavioral_questions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BehavioralQuestion {

    @Id
    private String id;

    private String question;              // Question text that candidate will answer on video
    private String description;           // Additional context/guidance
    private int videoDurationSeconds;     // Expected video duration (e.g., 120 for 2 minutes)
    private String difficulty;            // Easy, Medium, Hard
    private String createdBy;             // Admin email who created it
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
