package com.interviewsim.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CodeRunResponse {
    private boolean passed;
    private int testsPassed;
    private int testsTotal;
    private String output;
    private String error;
    private long runtimeMs;
    private String memoryUsed;
    private String complexity;
}
