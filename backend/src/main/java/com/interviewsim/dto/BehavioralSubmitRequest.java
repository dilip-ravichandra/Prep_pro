package com.interviewsim.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BehavioralSubmitRequest {
    private List<QuestionResponse> responses;
    private long totalTimeTakenSeconds;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionResponse {
        private int questionIndex;
        private long durationSeconds;
        private boolean answered;
    }
}
