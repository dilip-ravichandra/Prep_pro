package com.interviewsim.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "submissions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Submission {
    @Id
    private String id;
    private String userId;
    private String questionId;
    private String language;
    private String problemStatement;
    private String code;
    private double score;
    private boolean isCorrect;
    private List<String> errors;
    private List<String> suggestions;
    private String fixedCode;
    private String feedback;
    private LocalDateTime submittedAt;
    private LocalDateTime updatedAt;
}
