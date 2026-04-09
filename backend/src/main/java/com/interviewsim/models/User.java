package com.interviewsim.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

/**
 * User Model — Demonstrates ENCAPSULATION (OOPs Pillar 1)
 * All fields are private; access is through getters/setters via @Data
 * Sensitive data (password) is never returned in API responses
 */
@Document(collection = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    private String id;

    private String name;

    @Indexed(unique = true)
    private String email;

    // Password is always stored as BCrypt hash — never plain text
    private String password;

    private String college;

    private Role role;

    private int streakDays;

    private int totalPoints;

    private List<String> earnedBadges;

    private String resumeFileName;

    private String resumePath;

    private LocalDateTime resumeUploadedAt;

    private LocalDateTime joinedAt;

    private LocalDateTime lastLoginAt;

    // Override toString to never expose password — security best practice
    @Override
    public String toString() {
        return "User{id='" + id + "', name='" + name + "', email='" + email +
               "', college='" + college + "', role='" + role + "'}";
    }
}
