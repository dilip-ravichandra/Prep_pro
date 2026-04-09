package com.interviewsim.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TechnicalRunRequest {
    private int problemIndex;
    private String code;
}
