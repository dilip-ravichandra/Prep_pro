package com.interviewsim.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

// ═══════════════════════════════════════════════════════════════
//  APTITUDE QUESTION
// ═══════════════════════════════════════════════════════════════
@Document(collection = "aptitude_questions_legacy")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
class LegacyAptitudeQuestion {

    @Id
    private String id;
    private int questionNumber;     // 1-10
    private String question;
    private List<String> options;   // 4 options
    private int correctIndex;       // 0-3
    private String category;        // "Quantitative", "Logical", "Verbal", "Pattern"
    private String difficulty;      // "Easy", "Medium", "Hard"
    private String explanation;     // shown after answer is revealed
}


// ═══════════════════════════════════════════════════════════════
//  TECHNICAL PROBLEM
// ═══════════════════════════════════════════════════════════════
@Document(collection = "technical_problems_legacy")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
class LegacyTechnicalProblem {

    @Id
    private String id;
    private int problemNumber;    // 1-3
    private String title;
    private String difficulty;    // "Easy", "Medium", "Hard"
    private List<String> tags;   // ["Array", "HashMap"]
    private String description;
    private List<TestCase> examples;
    private List<TestCase> hiddenTestCases;
    private String starterCode;   // Java starter code shown to user
    private String solutionCode;  // reference solution (not shown)
    private String hint;
    private String oopsConcept;   // Which OOPs concept this problem illustrates
    private String timeComplexity;
    private String spaceComplexity;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TestCase {
        private String input;
        private String expectedOutput;
        private boolean isHidden;
    }
}


// ═══════════════════════════════════════════════════════════════
//  BEHAVIORAL QUESTION
// ═══════════════════════════════════════════════════════════════
@Document(collection = "behavioral_questions_legacy")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
class LegacyBehavioralQuestion {

    @Id
    private String id;
    private int questionNumber;    // 1-6
    private String question;
    private String category;       // "Self-Introduction", "Conflict", "Goals", "Strengths"
    private String idealAnswerTips; // Tips to display in feedback
    private String starMethod;      // STAR method breakdown
    private int maxDurationSeconds; // Recommended answer duration (120 = 2 mins)
}
