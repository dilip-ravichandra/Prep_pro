package com.interviewsim.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "behavioral_video_submissions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BehavioralVideoSubmission {

    @Id
    private String id;

    private String userId;
    private String candidateName;
    private String candidateEmail;

    private String questionId;
    private String question;

    private String videoPath;
    private String videoUrl;
    private String audioPath;

    private String transcript;

    private double contentScore;
    private double facePresenceScore;
    private double finalScore;
    private boolean suspicious;

    private List<String> strengths;
    private List<String> weaknesses;
    private List<String> suggestions;

    private LocalDateTime submittedAt;
}
