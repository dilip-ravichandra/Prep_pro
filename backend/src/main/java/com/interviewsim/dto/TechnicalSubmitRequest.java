package com.interviewsim.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TechnicalSubmitRequest {
    private Map<Integer, String> codes;
    private Map<Integer, Boolean> solved;
    private int problemCount;
    private long timeTakenSeconds;
}
