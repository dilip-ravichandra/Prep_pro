package com.interviewsim.services;

import com.interviewsim.dto.AdminQuestionRequest;
import com.interviewsim.dto.AdminSubmissionUpdateRequest;
import com.interviewsim.dto.CandidateSubmissionRow;
import com.interviewsim.models.AdminQuestion;
import com.interviewsim.models.Submission;
import com.interviewsim.repositories.AdminQuestionRepository;
import com.interviewsim.repositories.SubmissionRepository;
import com.interviewsim.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final AdminQuestionRepository adminQuestionRepository;
    private final UserRepository userRepository;
    private final SubmissionRepository submissionRepository;

    public AdminQuestion addQuestion(AdminQuestionRequest request) {
        AdminQuestion q = AdminQuestion.builder()
                .question(request.getQuestion())
                .type(request.getType().toUpperCase(Locale.ROOT))
                .language(request.getLanguage().toUpperCase(Locale.ROOT))
                .difficulty(request.getDifficulty())
                .createdAt(LocalDateTime.now())
                .build();
        return adminQuestionRepository.save(q);
    }

    public List<AdminQuestion> getQuestions() {
        return adminQuestionRepository.findAll();
    }

    public AdminQuestion getQuestionById(String id) {
        return adminQuestionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Question not found"));
    }

    public AdminQuestion updateQuestion(String id, AdminQuestionRequest request) {
        AdminQuestion existing = getQuestionById(id);
        existing.setQuestion(request.getQuestion());
        existing.setType(request.getType().toUpperCase(Locale.ROOT));
        existing.setLanguage(request.getLanguage().toUpperCase(Locale.ROOT));
        existing.setDifficulty(request.getDifficulty());
        return adminQuestionRepository.save(existing);
    }

    public void deleteQuestion(String id) {
        if (!adminQuestionRepository.existsById(id)) {
            throw new RuntimeException("Question not found");
        }
        adminQuestionRepository.deleteById(id);
    }

    public Submission createSubmission(String userId, String questionId, String code) {
        if (!adminQuestionRepository.existsById(questionId)) {
            throw new RuntimeException("Question not found");
        }
        Submission submission = Submission.builder()
                .userId(userId)
                .questionId(questionId)
                .code(code)
                .score(0)
                .feedback("Pending admin review")
                .submittedAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        return submissionRepository.save(submission);
    }

    public List<CandidateSubmissionRow> getSubmissions() {
        List<Submission> submissions = submissionRepository.findAllByOrderBySubmittedAtDesc();
        if (submissions.isEmpty()) return new ArrayList<>();

        Map<String, String> questionById = adminQuestionRepository.findAll().stream()
                .collect(Collectors.toMap(AdminQuestion::getId, AdminQuestion::getQuestion));

        List<CandidateSubmissionRow> rows = new ArrayList<>();
        for (Submission s : submissions) {
            String name = userRepository.findById(s.getUserId()).map(u -> u.getName()).orElse("Unknown Candidate");
            rows.add(CandidateSubmissionRow.builder()
                    .submissionId(s.getId())
                    .questionId(s.getQuestionId())
                    .candidateName(name)
                    .question(questionById.getOrDefault(s.getQuestionId(), "Unknown Question"))
                    .submitted(s.getCode())
                    .score(s.getScore())
                    .feedback(s.getFeedback())
                    .build());
        }
        return rows;
    }

    public Submission getSubmissionById(String id) {
        return submissionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Submission not found"));
    }

    public Submission updateSubmission(String id, AdminSubmissionUpdateRequest request) {
        Submission submission = getSubmissionById(id);
        if (request.getScore() != null) submission.setScore(request.getScore());
        submission.setFeedback(request.getFeedback());
        submission.setUpdatedAt(LocalDateTime.now());
        return submissionRepository.save(submission);
    }

    public void deleteSubmission(String id) {
        if (!submissionRepository.existsById(id)) {
            throw new RuntimeException("Submission not found");
        }
        submissionRepository.deleteById(id);
    }
}
