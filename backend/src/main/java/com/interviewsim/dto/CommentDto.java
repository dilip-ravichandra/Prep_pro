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
public class CommentDto {
    private String id;
    private String roundType;
    private String candidateId;
    private String candidateEmail;
    private String adminEmail;
    private String message;
    private boolean isAdminComment;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String parentCommentId;
}
