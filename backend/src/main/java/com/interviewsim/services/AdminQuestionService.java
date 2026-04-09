package com.interviewsim.services;

import com.interviewsim.models.AptitudeQuestion;
import com.interviewsim.models.TechnicalQuestion;
import com.interviewsim.models.BehavioralQuestion;
import com.interviewsim.models.TestCase;
import com.interviewsim.repositories.AptitudeQuestionRepository;
import com.interviewsim.repositories.TechnicalQuestionRepository;
import com.interviewsim.repositories.BehavioralQuestionRepository;
import com.interviewsim.dto.AptitudeQuestionDto;
import com.interviewsim.dto.TechnicalQuestionDto;
import com.interviewsim.dto.BehavioralQuestionDto;
import com.interviewsim.dto.TestCaseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminQuestionService {

    private final AptitudeQuestionRepository aptitudeQuestionRepository;
    private final TechnicalQuestionRepository technicalQuestionRepository;
    private final BehavioralQuestionRepository behavioralQuestionRepository;

    // ════════════════════ APTITUDE QUESTIONS ════════════════════

    public List<AptitudeQuestionDto> getAptitudeQuestions(String adminEmail) {
        return aptitudeQuestionRepository.findByCreatedByOrderByCreatedAtDesc(adminEmail)
                .stream()
                .map(this::mapToAptitudeDto)
                .collect(Collectors.toList());
    }

    public AptitudeQuestionDto createAptitudeQuestion(AptitudeQuestionDto dto, String adminEmail) {
        AptitudeQuestion question = AptitudeQuestion.builder()
                .question(dto.getQuestion())
                .options(dto.getOptions())
                .correctAnswer(dto.getCorrectAnswer())
                .difficulty(dto.getDifficulty())
                .topic(dto.getTopic())
                .createdBy(adminEmail)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        AptitudeQuestion saved = aptitudeQuestionRepository.save(question);
        return mapToAptitudeDto(saved);
    }

    public AptitudeQuestionDto updateAptitudeQuestion(String id, AptitudeQuestionDto dto, String adminEmail) {
        AptitudeQuestion question = aptitudeQuestionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Question not found."));

        question.setQuestion(dto.getQuestion());
        question.setOptions(dto.getOptions());
        question.setCorrectAnswer(dto.getCorrectAnswer());
        question.setDifficulty(dto.getDifficulty());
        question.setTopic(dto.getTopic());
        question.setUpdatedAt(LocalDateTime.now());

        AptitudeQuestion updated = aptitudeQuestionRepository.save(question);
        return mapToAptitudeDto(updated);
    }

    public void deleteAptitudeQuestion(String id) {
        aptitudeQuestionRepository.deleteById(id);
    }

    public void clearAllAptitudeQuestions(String adminEmail) {
        aptitudeQuestionRepository.deleteByCreatedBy(adminEmail);
    }

    private AptitudeQuestionDto mapToAptitudeDto(AptitudeQuestion question) {
        return AptitudeQuestionDto.builder()
                .id(question.getId())
                .question(question.getQuestion())
                .options(question.getOptions())
                .correctAnswer(question.getCorrectAnswer())
                .difficulty(question.getDifficulty())
                .topic(question.getTopic())
                .createdBy(question.getCreatedBy())
                .createdAt(question.getCreatedAt())
                .updatedAt(question.getUpdatedAt())
                .build();
    }

    // ════════════════════ TECHNICAL QUESTIONS ════════════════════

    public List<TechnicalQuestionDto> getTechnicalQuestions(String adminEmail) {
        return technicalQuestionRepository.findByCreatedByOrderByCreatedAtDesc(adminEmail)
                .stream()
                .map(this::mapToTechnicalDto)
                .collect(Collectors.toList());
    }

    public TechnicalQuestionDto createTechnicalQuestion(TechnicalQuestionDto dto, String adminEmail) {
        TechnicalQuestion question = TechnicalQuestion.builder()
                .question(dto.getQuestion())
                .description(dto.getDescription())
                .language(dto.getLanguage())
                .difficulty(dto.getDifficulty())
                .timeLimit(dto.getTimeLimit())
                .testCases(toModelTestCases(dto.getTestCases()))
                .createdBy(adminEmail)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        TechnicalQuestion saved = technicalQuestionRepository.save(question);
        return mapToTechnicalDto(saved);
    }

    public TechnicalQuestionDto updateTechnicalQuestion(String id, TechnicalQuestionDto dto, String adminEmail) {
        TechnicalQuestion question = technicalQuestionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Question not found."));

        question.setQuestion(dto.getQuestion());
        question.setDescription(dto.getDescription());
        question.setLanguage(dto.getLanguage());
        question.setDifficulty(dto.getDifficulty());
        question.setTimeLimit(dto.getTimeLimit());
        question.setTestCases(toModelTestCases(dto.getTestCases()));
        question.setUpdatedAt(LocalDateTime.now());

        TechnicalQuestion updated = technicalQuestionRepository.save(question);
        return mapToTechnicalDto(updated);
    }

    public void deleteTechnicalQuestion(String id) {
        technicalQuestionRepository.deleteById(id);
    }

    public void clearAllTechnicalQuestions(String adminEmail) {
        technicalQuestionRepository.deleteByCreatedBy(adminEmail);
    }

    private TechnicalQuestionDto mapToTechnicalDto(TechnicalQuestion question) {
        return TechnicalQuestionDto.builder()
                .id(question.getId())
                .question(question.getQuestion())
                .description(question.getDescription())
                .language(question.getLanguage())
                .difficulty(question.getDifficulty())
                .timeLimit(question.getTimeLimit())
                .testCases(toDtoTestCases(question.getTestCases()))
                .createdBy(question.getCreatedBy())
                .createdAt(question.getCreatedAt())
                .updatedAt(question.getUpdatedAt())
                .build();
    }

            private List<TestCase> toModelTestCases(List<TestCaseDto> dtoCases) {
            if (dtoCases == null) return List.of();
            return dtoCases.stream()
                .map(tc -> TestCase.builder()
                    .input(tc.getInput())
                    .output(tc.getOutput())
                    .explanation(tc.getExplanation())
                    .build())
                .collect(Collectors.toList());
            }

            private List<TestCaseDto> toDtoTestCases(List<TestCase> modelCases) {
            if (modelCases == null) return List.of();
            return modelCases.stream()
                .map(tc -> TestCaseDto.builder()
                    .input(tc.getInput())
                    .output(tc.getOutput())
                    .explanation(tc.getExplanation())
                    .build())
                .collect(Collectors.toList());
            }

    // ════════════════════ BEHAVIORAL QUESTIONS ════════════════════

    public List<BehavioralQuestionDto> getBehavioralQuestions(String adminEmail) {
        return behavioralQuestionRepository.findByCreatedByOrderByCreatedAtDesc(adminEmail)
                .stream()
                .map(this::mapToBehavioralDto)
                .collect(Collectors.toList());
    }

    public BehavioralQuestionDto createBehavioralQuestion(BehavioralQuestionDto dto, String adminEmail) {
        BehavioralQuestion question = BehavioralQuestion.builder()
                .question(dto.getQuestion())
                .description(dto.getDescription())
                .videoDurationSeconds(dto.getVideoDurationSeconds())
                .difficulty(dto.getDifficulty())
                .createdBy(adminEmail)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        BehavioralQuestion saved = behavioralQuestionRepository.save(question);
        return mapToBehavioralDto(saved);
    }

    public BehavioralQuestionDto updateBehavioralQuestion(String id, BehavioralQuestionDto dto, String adminEmail) {
        BehavioralQuestion question = behavioralQuestionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Question not found."));

        question.setQuestion(dto.getQuestion());
        question.setDescription(dto.getDescription());
        question.setVideoDurationSeconds(dto.getVideoDurationSeconds());
        question.setDifficulty(dto.getDifficulty());
        question.setUpdatedAt(LocalDateTime.now());

        BehavioralQuestion updated = behavioralQuestionRepository.save(question);
        return mapToBehavioralDto(updated);
    }

    public void deleteBehavioralQuestion(String id) {
        behavioralQuestionRepository.deleteById(id);
    }

    public void clearAllBehavioralQuestions(String adminEmail) {
        behavioralQuestionRepository.deleteByCreatedBy(adminEmail);
    }

    private BehavioralQuestionDto mapToBehavioralDto(BehavioralQuestion question) {
        return BehavioralQuestionDto.builder()
                .id(question.getId())
                .question(question.getQuestion())
                .description(question.getDescription())
                .videoDurationSeconds(question.getVideoDurationSeconds())
                .difficulty(question.getDifficulty())
                .createdBy(question.getCreatedBy())
                .createdAt(question.getCreatedAt())
                .updatedAt(question.getUpdatedAt())
                .build();
    }
}
