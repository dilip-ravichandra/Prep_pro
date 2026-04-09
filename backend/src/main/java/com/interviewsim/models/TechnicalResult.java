package com.interviewsim.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.Map;

@Document(collection = "technical_results")
@Data
@EqualsAndHashCode(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TechnicalResult extends BaseResult {

    @Id
    private String id;

    private Map<Integer, String> submittedCodes;
    private Map<Integer, Boolean> problemsPassed;
    private int problemsSolved;
    private int totalProblems;

    @Override
    public void evaluate() {
        this.roundType = "TECHNICAL";
        this.totalPossible = totalProblems;
        this.score = problemsSolved;
        this.percentage = calculatePercentage(problemsSolved, totalProblems);
        this.grade = calculateGrade(percentage);
        this.completedAt = LocalDateTime.now();
    }
}
