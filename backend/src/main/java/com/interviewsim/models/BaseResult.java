package com.interviewsim.models;

import lombok.Data;
import java.time.LocalDateTime;

/**
 * BaseResult — Demonstrates ABSTRACTION + INHERITANCE (OOPs Pillars 2 & 3)
 *
 * This abstract class defines the COMMON structure for all round results.
 * Each concrete subclass (AptitudeResult, TechnicalResult, BehavioralResult)
 * INHERITS these fields and OVERRIDES evaluate() with its own logic.
 *
 * This is exactly how you should explain it to your professor:
 * "BaseResult is an abstract class. AptitudeResult extends it and provides
 *  a concrete implementation of evaluate(), which is different from
 *  TechnicalResult's evaluate() — demonstrating runtime polymorphism."
 */
@Data
public abstract class BaseResult {

    protected String userId;
    protected String roundType;      // "APTITUDE", "TECHNICAL", "BEHAVIORAL"
    protected int score;             // raw score
    protected int totalPossible;     // max possible score
    protected double percentage;     // calculated percentage
    protected String grade;          // A+, B+, C+, D
    protected long timeTakenSeconds; // how long they took
    protected LocalDateTime completedAt;

    /**
     * Abstract method — each round type implements its own evaluation logic.
     * This is POLYMORPHISM: same method name, different behavior per subclass.
     */
    public abstract void evaluate();

    /**
     * Common grade calculation logic shared by ALL result types.
     * Demonstrates code reuse through inheritance.
     */
    protected String calculateGrade(double pct) {
        if (pct >= 85) return "A+";
        if (pct >= 70) return "B+";
        if (pct >= 55) return "C+";
        return "D";
    }

    /**
     * Common percentage calculation
     */
    protected double calculatePercentage(int score, int total) {
        if (total == 0) return 0;
        return Math.round((score * 100.0 / total) * 10.0) / 10.0;
    }
}
