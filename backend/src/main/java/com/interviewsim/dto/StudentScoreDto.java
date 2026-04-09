package com.interviewsim.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Student Leaderboard Response DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentScoreDto {
    private String id;
    private String name;
    private String email;
    private String college;
    private Integer aptitudeScore;
    private Integer technicalScore;
    private Integer behavioralScore;
    private Integer totalScore;
}
