package com.interviewsim.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "admin_questions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminQuestion {
    @Id
    private String id;
    private String question;
    private String type;       // APTITUDE | TECHNICAL | BEHAVIORAL
    private String language;   // JAVA | PYTHON
    private String difficulty;
    private LocalDateTime createdAt;
}
