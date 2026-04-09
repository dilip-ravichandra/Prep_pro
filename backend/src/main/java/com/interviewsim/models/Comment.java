package com.interviewsim.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

/**
 * Comment Model
 * Allows admin to give feedback on candidate performance
 * Allows candidates to respond to feedback
 */
@Document(collection = "comments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Comment {

    @Id
    private String id;

    private String roundType;               // APTITUDE, TECHNICAL, BEHAVIORAL
    private String candidateId;             // User ID of candidate
    private String candidateEmail;          // Email for quick reference
    private String adminEmail;              // Email of admin who commented
    private String message;                 // The comment text
    private boolean isAdminComment;         // true if from admin, false if from candidate
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Optional: to track the response/thread
    private String parentCommentId;         // If this is a reply to another comment
}
