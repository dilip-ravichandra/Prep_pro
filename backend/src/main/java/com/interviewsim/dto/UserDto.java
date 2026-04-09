package com.interviewsim.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private String id;
    private String name;
    private String email;
    private String college;
    private String role;
    private int streakDays;
    private int totalPoints;
    private List<String> earnedBadges;
    private String resumeFileName;
}
