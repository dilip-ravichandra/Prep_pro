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
public class BehavioralVideoSubmissionResponse {
    private String submissionId;
    private String questionId;
    private String question;
    private String videoUrl;
    private String transcript;
    private double contentScore;
    private double facePresenceScore;
    private double finalScore;
    private boolean suspicious;
    private List<String> strengths;
    private List<String> weaknesses;
    private List<String> suggestions;
}
