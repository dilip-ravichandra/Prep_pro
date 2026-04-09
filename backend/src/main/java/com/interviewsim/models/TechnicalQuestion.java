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
 * TechnicalQuestion Model
 * Stores coding problems with test cases created by admin
 */
@Document(collection = "technical_questions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TechnicalQuestion {

    @Id
    private String id;

    private String question;                    // Problem title
    private String description;                 // Full problem description
    private String language;                    // Java, Python, C++, JavaScript, C, C#
    private String difficulty;                  // Easy, Medium, Hard
    private int timeLimit;                      // In minutes
    private List<TestCase> testCases;          // Sample inputs and expected outputs
    private String createdBy;                  // Admin email who created it
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
