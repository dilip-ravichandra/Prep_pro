package com.interviewsim;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * PrepPro - Main Application Entry Point
 *
 * OOPs Architecture:
 * - Abstraction   : Service interfaces hide implementation details
 * - Encapsulation : All fields private, accessed via getters/setters
 * - Inheritance   : BaseResult extended by AptitudeResult, TechnicalResult, BehavioralResult
 * - Polymorphism  : evaluate() behaves differently per round type
 */
@SpringBootApplication
public class InterviewSimApplication {
    public static void main(String[] args) {
        SpringApplication.run(InterviewSimApplication.class, args);
        System.out.println("╔══════════════════════════════════════════╗");
        System.out.println("║   PrepPro Backend Running ✓              ║");
        System.out.println("║   http://localhost:8080                   ║");
        System.out.println("╚══════════════════════════════════════════╝");
    }
}
