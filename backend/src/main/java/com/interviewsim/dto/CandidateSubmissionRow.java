package com.interviewsim.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CandidateSubmissionRow {
    private String submissionId;
    private String questionId;
    private String candidateName;
    private String question;
    private String submitted;
    private double score;
    private String feedback;
}
