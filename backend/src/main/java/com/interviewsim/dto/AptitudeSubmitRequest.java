package com.interviewsim.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AptitudeSubmitRequest {
    private Map<Integer, Integer> answers;
    private List<String> questionIds;
    private int questionCount;
    private long timeTakenSeconds;
}
