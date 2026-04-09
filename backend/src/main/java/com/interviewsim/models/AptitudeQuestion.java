package com.interviewsim.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.List;

/**
 * AptitudeQuestion Model
 * Stores MCQ questions with options created by admin
 */
@Document(collection = "aptitude_questions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AptitudeQuestion {

    @Id
    private String id;

    private String question;              // Question text
    private List<String> options;         // A, B, C, D options
    private int correctAnswer;            // Index of correct option (0-3)
    private String difficulty;            // Easy, Medium, Hard
    private String topic;                 // Topic for organization (e.g., Arrays, Loops)
    private String createdBy;             // Admin email who created it
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
