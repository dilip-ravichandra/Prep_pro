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

@Document(collection = "aptitude_results")
@Data
@EqualsAndHashCode(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AptitudeResult extends BaseResult {

    @Id
    private String id;

    private Map<Integer, Integer> answers;
    private Map<String, Double> categoryScores;

    private int correctCount;
    private int wrongCount;
    private int skippedCount;

    @Override
    public void evaluate() {
        this.roundType = "APTITUDE";
        this.totalPossible = totalPossible > 0 ? totalPossible : 10;
        this.score = correctCount;
        this.percentage = calculatePercentage(correctCount, totalPossible);
        this.grade = calculateGrade(percentage);
        this.completedAt = LocalDateTime.now();
    }
}
