package com.interviewsim.services;

import com.interviewsim.models.User;
import com.interviewsim.repositories.UserRepository;
import com.interviewsim.repositories.AptitudeResultRepository;
import com.interviewsim.repositories.TechnicalResultRepository;
import com.interviewsim.repositories.BehavioralResultRepository;
import com.interviewsim.models.AptitudeResult;
import com.interviewsim.models.TechnicalResult;
import com.interviewsim.models.BehavioralResult;
import com.interviewsim.dto.StudentScoreDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminLeaderboardService {

    private final UserRepository userRepository;
    private final AptitudeResultRepository aptitudeResultRepository;
    private final TechnicalResultRepository technicalResultRepository;
    private final BehavioralResultRepository behavioralResultRepository;

    /**
     * Get all students with their aggregate scores across all rounds
     */
    public List<StudentScoreDto> getStudentLeaderboard() {
        List<User> allCandidates = userRepository.findAll().stream()
                .filter(u -> u.getRole() != null && u.getRole().name().equals("CANDIDATE"))
                .collect(Collectors.toList());

        return allCandidates.stream()
                .map(this::buildStudentScore)
                .collect(Collectors.toList());
    }

    /**
     * Build student score DTO with aggregated scores
     */
    private StudentScoreDto buildStudentScore(User user) {
        // Get latest scores from each round
        AptitudeResult aptResult = aptitudeResultRepository.findTopByUserIdOrderByCompletedAtDesc(user.getId()).orElse(null);
        TechnicalResult techResult = technicalResultRepository.findTopByUserIdOrderByCompletedAtDesc(user.getId()).orElse(null);
        BehavioralResult behavResult = behavioralResultRepository.findTopByUserIdOrderByCompletedAtDesc(user.getId()).orElse(null);

        int aptitudeScore = aptResult != null ? aptResult.getScore() : 0;
        int technicalScore = techResult != null ? techResult.getScore() : 0;
        int behavioralScore = behavResult != null ? behavResult.getScore() : 0;
        int totalScore = aptitudeScore + technicalScore + behavioralScore;

        return StudentScoreDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .college(user.getCollege())
                .aptitudeScore(aptitudeScore > 0 ? aptitudeScore : null)
                .technicalScore(technicalScore > 0 ? technicalScore : null)
                .behavioralScore(behavioralScore > 0 ? behavioralScore : null)
                .totalScore(totalScore > 0 ? totalScore : null)
                .build();
    }
}
