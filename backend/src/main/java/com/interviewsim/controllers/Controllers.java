package com.interviewsim.controllers;

import com.interviewsim.dto.*;
import com.interviewsim.models.AptitudeQuestion;
import com.interviewsim.models.BehavioralQuestion;
import com.interviewsim.models.TechnicalQuestion;
import com.interviewsim.models.User;
import com.interviewsim.repositories.AptitudeQuestionRepository;
import com.interviewsim.repositories.AptitudeResultRepository;
import com.interviewsim.repositories.BehavioralQuestionRepository;
import com.interviewsim.repositories.BehavioralResultRepository;
import com.interviewsim.repositories.TechnicalQuestionRepository;
import com.interviewsim.repositories.TechnicalResultRepository;
import com.interviewsim.repositories.UserRepository;
import com.interviewsim.services.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

// ═══════════════════════════════════════════════════════════════
//  AUTH CONTROLLER — /api/auth
// ═══════════════════════════════════════════════════════════════
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origins}")
class AuthController {

    private final AuthService authService;
    private final PasswordResetService passwordResetService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        try {
            AuthResponse response = authService.register(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Registration successful! Welcome to PrepPro."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(ApiResponse.success(response, "Login successful!"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("Invalid email or password."));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDto>> getCurrentUser() {
        String email = getCurrentUserEmail();
        try {
            var user = authService.getUserByEmail(email);
            return ResponseEntity.ok(ApiResponse.success(authService.mapToUserDto(user), "Profile fetched."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("User not found."));
        }
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("PrepPro Backend is running ✓");
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        try {
            passwordResetService.sendResetLink(request.getEmail());
            return ResponseEntity.ok(ApiResponse.success(null, "Password reset link sent to your email."));
        } catch (Exception e) {
            String message = (e.getMessage() == null || e.getMessage().isBlank())
                    ? "Unable to send reset link."
                    : e.getMessage();
            return ResponseEntity.badRequest().body(ApiResponse.error(message));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<AuthResponse>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        try {
            AuthResponse response = passwordResetService.resetPassword(request.getToken(), request.getNewPassword());
            return ResponseEntity.ok(ApiResponse.success(response, "Password reset successful."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid or expired token."));
        }
    }

    private String getCurrentUserEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth.getName();
    }
}

@RestController
@RequestMapping("/api/admin-auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origins}")
class AdminAuthController {

    private final AuthService authService;
    private final PasswordResetService passwordResetService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.adminLogin(request);
            return ResponseEntity.ok(ApiResponse.success(response, "Admin login successful."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("Invalid admin credentials."));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDto>> getCurrentAdmin() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        try {
            UserDto user = authService.getAdminProfile(email);
            return ResponseEntity.ok(ApiResponse.success(user, "Admin profile fetched."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("Unauthorized."));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        try {
            passwordResetService.sendAdminResetLink(request.getEmail());
            return ResponseEntity.ok(ApiResponse.success(null, "Admin password reset link sent to your email."));
        } catch (Exception e) {
            String message = (e.getMessage() == null || e.getMessage().isBlank())
                    ? "Unable to send admin reset link."
                    : e.getMessage();
            return ResponseEntity.badRequest().body(ApiResponse.error(message));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<AuthResponse>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        try {
            AuthResponse response = passwordResetService.resetAdminPassword(request.getToken(), request.getNewPassword());
            return ResponseEntity.ok(ApiResponse.success(response, "Admin password reset successful."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid or expired token."));
        }
    }
}

// ═══════════════════════════════════════════════════════════════
//  ADMIN QUESTION CONTROLLER — /api/admin/questions
// ═══════════════════════════════════════════════════════════════
@RestController
@RequestMapping("/api/admin/questions")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origins}")
class AdminQuestionController {

    private final AdminQuestionService adminQuestionService;
    private final GroqService groqService;

    private String getAdminEmail() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    // ──── APTITUDE QUESTIONS ────
    @GetMapping("/aptitude")
    public ResponseEntity<ApiResponse<List<AptitudeQuestionDto>>> getAptitudeQuestions() {
        try {
            String adminEmail = getAdminEmail();
            List<AptitudeQuestionDto> questions = adminQuestionService.getAptitudeQuestions(adminEmail);
            return ResponseEntity.ok(ApiResponse.success(questions, "Aptitude questions fetched."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/aptitude")
    public ResponseEntity<ApiResponse<AptitudeQuestionDto>> createAptitudeQuestion(@Valid @RequestBody AptitudeQuestionDto dto) {
        try {
            String adminEmail = getAdminEmail();
            AptitudeQuestionDto created = adminQuestionService.createAptitudeQuestion(dto, adminEmail);
            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(created, "Aptitude question created."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/aptitude/{id}")
    public ResponseEntity<ApiResponse<AptitudeQuestionDto>> updateAptitudeQuestion(@PathVariable String id, @Valid @RequestBody AptitudeQuestionDto dto) {
        try {
            String adminEmail = getAdminEmail();
            AptitudeQuestionDto updated = adminQuestionService.updateAptitudeQuestion(id, dto, adminEmail);
            return ResponseEntity.ok(ApiResponse.success(updated, "Aptitude question updated."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/aptitude/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAptitudeQuestion(@PathVariable String id) {
        try {
            adminQuestionService.deleteAptitudeQuestion(id);
            return ResponseEntity.ok(ApiResponse.success(null, "Aptitude question deleted."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/aptitude")
    public ResponseEntity<ApiResponse<Void>> clearAptitudeQuestions() {
        try {
            String adminEmail = getAdminEmail();
            adminQuestionService.clearAllAptitudeQuestions(adminEmail);
            return ResponseEntity.ok(ApiResponse.success(null, "All aptitude questions cleared."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/aptitude/generate-ai")
    public ResponseEntity<ApiResponse<Map<String, Object>>> generateAIQuestion(@RequestBody Map<String, String> request) {
        try {
            String topic = request.get("topic");
            String difficulty = request.getOrDefault("difficulty", "Medium");
            Map<String, Object> result = groqService.generateAptitudeMcq(topic, difficulty);
            return ResponseEntity.ok(ApiResponse.success(result, "AI question generated."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    // ──── TECHNICAL QUESTIONS ────
    @GetMapping("/technical")
    public ResponseEntity<ApiResponse<List<TechnicalQuestionDto>>> getTechnicalQuestions() {
        try {
            String adminEmail = getAdminEmail();
            List<TechnicalQuestionDto> questions = adminQuestionService.getTechnicalQuestions(adminEmail);
            return ResponseEntity.ok(ApiResponse.success(questions, "Technical questions fetched."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/technical")
    public ResponseEntity<ApiResponse<TechnicalQuestionDto>> createTechnicalQuestion(@Valid @RequestBody TechnicalQuestionDto dto) {
        try {
            String adminEmail = getAdminEmail();
            TechnicalQuestionDto created = adminQuestionService.createTechnicalQuestion(dto, adminEmail);
            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(created, "Technical question created."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/technical/{id}")
    public ResponseEntity<ApiResponse<TechnicalQuestionDto>> updateTechnicalQuestion(@PathVariable String id, @Valid @RequestBody TechnicalQuestionDto dto) {
        try {
            String adminEmail = getAdminEmail();
            TechnicalQuestionDto updated = adminQuestionService.updateTechnicalQuestion(id, dto, adminEmail);
            return ResponseEntity.ok(ApiResponse.success(updated, "Technical question updated."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/technical/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTechnicalQuestion(@PathVariable String id) {
        try {
            adminQuestionService.deleteTechnicalQuestion(id);
            return ResponseEntity.ok(ApiResponse.success(null, "Technical question deleted."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/technical")
    public ResponseEntity<ApiResponse<Void>> clearTechnicalQuestions() {
        try {
            String adminEmail = getAdminEmail();
            adminQuestionService.clearAllTechnicalQuestions(adminEmail);
            return ResponseEntity.ok(ApiResponse.success(null, "All technical questions cleared."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    // ──── BEHAVIORAL QUESTIONS ────
    @GetMapping("/behavioral")
    public ResponseEntity<ApiResponse<List<BehavioralQuestionDto>>> getBehavioralQuestions() {
        try {
            String adminEmail = getAdminEmail();
            List<BehavioralQuestionDto> questions = adminQuestionService.getBehavioralQuestions(adminEmail);
            return ResponseEntity.ok(ApiResponse.success(questions, "Behavioral questions fetched."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/behavioral")
    public ResponseEntity<ApiResponse<BehavioralQuestionDto>> createBehavioralQuestion(@Valid @RequestBody BehavioralQuestionDto dto) {
        try {
            String adminEmail = getAdminEmail();
            BehavioralQuestionDto created = adminQuestionService.createBehavioralQuestion(dto, adminEmail);
            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(created, "Behavioral question created."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/behavioral/{id}")
    public ResponseEntity<ApiResponse<BehavioralQuestionDto>> updateBehavioralQuestion(@PathVariable String id, @Valid @RequestBody BehavioralQuestionDto dto) {
        try {
            String adminEmail = getAdminEmail();
            BehavioralQuestionDto updated = adminQuestionService.updateBehavioralQuestion(id, dto, adminEmail);
            return ResponseEntity.ok(ApiResponse.success(updated, "Behavioral question updated."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/behavioral/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBehavioralQuestion(@PathVariable String id) {
        try {
            adminQuestionService.deleteBehavioralQuestion(id);
            return ResponseEntity.ok(ApiResponse.success(null, "Behavioral question deleted."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/behavioral")
    public ResponseEntity<ApiResponse<Void>> clearBehavioralQuestions() {
        try {
            String adminEmail = getAdminEmail();
            adminQuestionService.clearAllBehavioralQuestions(adminEmail);
            return ResponseEntity.ok(ApiResponse.success(null, "All behavioral questions cleared."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}

// ═══════════════════════════════════════════════════════════════
//  ADMIN LEADERBOARD CONTROLLER — /api/admin/leaderboard
// ═══════════════════════════════════════════════════════════════
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origins}")
class AdminLeaderboardController {

    private final AdminLeaderboardService adminLeaderboardService;

    @GetMapping("/leaderboard")
    public ResponseEntity<ApiResponse<List<StudentScoreDto>>> getStudentLeaderboard() {
        try {
            List<StudentScoreDto> leaderboard = adminLeaderboardService.getStudentLeaderboard();
            return ResponseEntity.ok(ApiResponse.success(leaderboard, "Student leaderboard fetched."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}

// ═══════════════════════════════════════════════════════════════
//  COMMENTS CONTROLLER — /api/comments
// ═══════════════════════════════════════════════════════════════
@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origins}")
class CommentsController {

    private final CommentService commentService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CommentDto>>> getComments(
            @RequestParam String candidateId,
            @RequestParam String roundType
    ) {
        try {
            List<CommentDto> comments = commentService.getComments(candidateId, roundType);
            return ResponseEntity.ok(ApiResponse.success(comments, "Comments fetched."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CommentDto>> addComment(@RequestBody CommentDto dto) {
        try {
            String currentEmail = SecurityContextHolder.getContext().getAuthentication().getName();
            User me = userRepository.findByEmail(currentEmail).orElse(null);
            boolean isAdmin = me != null && me.getRole() != null && "ADMIN".equals(me.getRole().name());

            CommentDto saved = commentService.addComment(dto, currentEmail, isAdmin);
            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(saved, "Comment added."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteComment(@PathVariable String id) {
        try {
            commentService.deleteComment(id);
            return ResponseEntity.ok(ApiResponse.success(null, "Comment deleted."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origins}")
class ChatController {

    private final ChatService chatService;

    @PostMapping
    public ResponseEntity<ApiResponse<ChatResponse>> chat(@Valid @RequestBody ChatRequest request) {
        String reply = chatService.ask(request);
        return ResponseEntity.ok(ApiResponse.success(ChatResponse.builder().reply(reply).build(), "OK"));
    }
}

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origins}")
class UserController {

    private final AdminService adminService;
    private final AuthService authService;
    private final GroqService groqService;
    private final ResumeService resumeService;
    private final BehavioralVideoService behavioralVideoService;

    @GetMapping("/ping")
    public ResponseEntity<ApiResponse<String>> pingUser() {
        return ResponseEntity.ok(ApiResponse.success("User route accessible", "OK"));
    }

    @PostMapping("/submit")
    public ResponseEntity<ApiResponse<Map<String, Object>>> submit(@Valid @RequestBody CandidateSubmitRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        String userId = authService.getUserByEmail(email).getId();
        var saved = adminService.createSubmission(userId, request.getQuestionId(), request.getCode());

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("id", saved.getId());
        payload.put("userId", saved.getUserId());
        payload.put("questionId", saved.getQuestionId());
        payload.put("score", saved.getScore());
        payload.put("feedback", saved.getFeedback());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(payload, "Submission saved."));
    }

    @PostMapping("/evaluate")
    public ResponseEntity<ApiResponse<CodeEvaluationResponse>> evaluate(@Valid @RequestBody CodeEvaluationRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        String userId = authService.getUserByEmail(email).getId();
        CodeEvaluationResponse response = groqService.evaluateCode(userId, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Evaluation complete."));
    }

    @PostMapping(value = "/upload-resume", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Map<String, Object>>> uploadResume(@RequestPart("file") MultipartFile file) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            User user = authService.getUserByEmail(email);

            Map<String, Object> resumeInfo = resumeService.uploadResume(user, file);
            authService.saveUser(user);
            return ResponseEntity.ok(ApiResponse.success(resumeInfo, "Resume uploaded successfully."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to upload resume."));
        }
    }

    @GetMapping("/resume")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getResume() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = authService.getUserByEmail(email);
        return ResponseEntity.ok(ApiResponse.success(resumeService.getResumeInfo(user), "Resume info fetched."));
    }

    @GetMapping("/resume/download")
    public ResponseEntity<?> downloadResume() {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            User user = authService.getUserByEmail(email);
            Resource resource = resumeService.loadResume(user);
            String contentType = resumeService.detectContentType(user);

            return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + user.getResumeFileName() + "\"")
                .body(resource);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.error("Failed to download resume."));
        }
    }

    @PostMapping(value = "/behavioral-submit", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<BehavioralVideoSubmissionResponse>> submitBehavioralVideo(
            @RequestPart("video") MultipartFile video,
            @RequestParam("questionId") String questionId,
            @RequestParam("facePresenceScore") double facePresenceScore) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            String userId = authService.getUserByEmail(email).getId();
            BehavioralVideoSubmissionResponse result = behavioralVideoService.submit(userId, questionId, facePresenceScore, video);
            return ResponseEntity.ok(ApiResponse.success(result, "Behavioral video submitted."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origins}")
class PublicMediaController {

    private final BehavioralVideoService behavioralVideoService;

    @GetMapping("/videos/{fileName:.+}")
    public ResponseEntity<Resource> getVideo(@PathVariable String fileName) {
        Resource resource = behavioralVideoService.loadVideo(fileName);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }
}

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origins}")
class AdminController {

    private final AdminService adminService;
    private final BehavioralVideoService behavioralVideoService;

    @GetMapping("/ping")
    public ResponseEntity<ApiResponse<String>> pingAdmin() {
        return ResponseEntity.ok(ApiResponse.success("Admin route accessible", "OK"));
    }

    @PostMapping("/questions")
    public ResponseEntity<ApiResponse<Map<String, Object>>> addQuestion(@Valid @RequestBody AdminQuestionRequest request) {
        var saved = adminService.addQuestion(request);
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("id", saved.getId());
        payload.put("question", saved.getQuestion());
        payload.put("type", saved.getType());
        payload.put("language", saved.getLanguage());
        payload.put("difficulty", saved.getDifficulty());
        payload.put("createdAt", saved.getCreatedAt());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(payload, "Question added."));
    }

    @GetMapping("/questions")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getQuestions() {
        List<Map<String, Object>> items = new ArrayList<>();
        for (var q : adminService.getQuestions()) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", q.getId());
            m.put("type", q.getType());
            m.put("question", q.getQuestion());
            m.put("language", q.getLanguage());
            m.put("difficulty", q.getDifficulty());
            items.add(m);
        }
        return ResponseEntity.ok(ApiResponse.success(items, "Questions fetched."));
    }

    @PutMapping("/questions/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateQuestion(
            @PathVariable String id,
            @Valid @RequestBody AdminQuestionRequest request) {
        var q = adminService.updateQuestion(id, request);
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("id", q.getId());
        payload.put("type", q.getType());
        payload.put("question", q.getQuestion());
        payload.put("language", q.getLanguage());
        payload.put("difficulty", q.getDifficulty());
        return ResponseEntity.ok(ApiResponse.success(payload, "Question updated."));
    }

    @DeleteMapping("/questions/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteQuestion(@PathVariable String id) {
        adminService.deleteQuestion(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Question deleted."));
    }

    @GetMapping("/submissions")
    public ResponseEntity<ApiResponse<List<CandidateSubmissionRow>>> getSubmissions() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getSubmissions(), "Submissions fetched."));
    }

    @GetMapping("/behavioral-submissions")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getBehavioralSubmissions() {
        List<Map<String, Object>> rows = new ArrayList<>();
        behavioralVideoService.getAllSubmissions().forEach(s -> {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", s.getId());
            row.put("userId", s.getUserId());
            row.put("candidateName", s.getCandidateName());
            row.put("candidateEmail", s.getCandidateEmail());
            row.put("questionId", s.getQuestionId());
            row.put("question", s.getQuestion());
            row.put("videoUrl", s.getVideoUrl());
            row.put("transcript", s.getTranscript());
            row.put("contentScore", s.getContentScore());
            row.put("facePresenceScore", s.getFacePresenceScore());
            row.put("score", s.getFinalScore());
            row.put("isSuspicious", s.isSuspicious());
            row.put("strengths", s.getStrengths());
            row.put("weaknesses", s.getWeaknesses());
            row.put("suggestions", s.getSuggestions());
            row.put("submittedAt", s.getSubmittedAt());
            rows.add(row);
        });
        return ResponseEntity.ok(ApiResponse.success(rows, "Behavioral submissions fetched."));
    }

    @PutMapping("/submissions/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateSubmission(
            @PathVariable String id,
            @Valid @RequestBody AdminSubmissionUpdateRequest request) {
        var s = adminService.updateSubmission(id, request);
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("id", s.getId());
        payload.put("questionId", s.getQuestionId());
        payload.put("score", s.getScore());
        payload.put("feedback", s.getFeedback());
        return ResponseEntity.ok(ApiResponse.success(payload, "Submission updated."));
    }

    @DeleteMapping("/submissions/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSubmission(@PathVariable String id) {
        adminService.deleteSubmission(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Submission deleted."));
    }
}


// ═══════════════════════════════════════════════════════════════
//  APTITUDE CONTROLLER — /api/aptitude
// ═══════════════════════════════════════════════════════════════
@RestController
@RequestMapping("/api/aptitude")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origins}")
class AptitudeController {

    private final AptitudeService aptitudeService;
    private final AuthService authService;
    private final AptitudeQuestionRepository aptitudeQuestionRepository;

    private static final int APTITUDE_LIMIT = 20;

    @GetMapping("/questions")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getQuestions() {
        List<Map<String, Object>> questions = buildRandomAptitudeQuestions();
        return ResponseEntity.ok(ApiResponse.success(questions, "Questions fetched."));
    }

    @PostMapping("/submit")
    public ResponseEntity<ApiResponse<AptitudeResultResponse>> submit(
            @RequestBody AptitudeSubmitRequest request) {
        String userId = getCurrentUserId();
        AptitudeResultResponse result = aptitudeService.evaluate(userId, request);
        return ResponseEntity.ok(ApiResponse.success(result, "Aptitude round evaluated!"));
    }

    private List<Map<String, Object>> buildRandomAptitudeQuestions() {
        List<AptitudeQuestion> questions = new ArrayList<>(aptitudeQuestionRepository.findAll());
        if (questions.isEmpty()) {
            return buildLegacyAptitudeQuestionsPayload();
        }

        Collections.shuffle(questions);
        return questions.stream()
                .limit(APTITUDE_LIMIT)
                .map(this::mapAptitudeQuestion)
                .toList();
    }

    private Map<String, Object> mapAptitudeQuestion(AptitudeQuestion q) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("id", q.getId());
        item.put("question", q.getQuestion());
        item.put("category", q.getTopic() != null && !q.getTopic().isBlank() ? q.getTopic() : "Aptitude");
        item.put("difficulty", q.getDifficulty() == null ? "Medium" : q.getDifficulty());
        item.put("options", q.getOptions() == null ? List.of() : q.getOptions());
        return item;
    }

    private List<Map<String, Object>> buildLegacyAptitudeQuestionsPayload() {
        String[][] data = {
                {"A train travels 120 km in 2 hrs. Find speed.", "Quantitative", "Easy"},
                {"Next in series: 2, 6, 12, 20, 30, ?", "Pattern", "Easy"},
                {"A does work in 10 days, B in 15. Together?", "Work & Time", "Medium"},
                {"What is 15% of 240?", "Percentage", "Easy"},
                {"Odd one out: Apple, Mango, Potato, Grape", "Verbal", "Easy"},
                {"5 machines → 5 items in 5 min. 100 machines → 100 items in?", "Logical", "Hard"},
                {"Fibonacci: 1, 1, 2, 3, 5, 8, ?", "Pattern", "Easy"},
                {"CP = ₹800, Profit = 20%. SP?", "Profit & Loss", "Easy"},
                {"All roses are flowers. Some flowers fade. Therefore:", "Logical", "Medium"},
                {"40L mixture, milk:water = 3:1. Litres of milk?", "Ratio", "Medium"}
        };
        String[][][] opts = {
                {{"50 km/h", "60 km/h", "70 km/h", "80 km/h"}},
                {{"40", "42", "44", "46"}},
                {{"5 days", "6 days", "7 days", "8 days"}},
                {{"32", "36", "38", "40"}},
                {{"Apple", "Mango", "Potato", "Grape"}},
                {{"1 min", "5 min", "10 min", "100 min"}},
                {{"11", "12", "13", "14"}},
                {{"₹900", "₹960", "₹980", "₹1000"}},
                {{"All roses fade", "Some roses may fade", "No roses fade", "Cannot determine"}},
                {{"25 L", "30 L", "35 L", "28 L"}}
        };
        List<Map<String, Object>> payload = new ArrayList<>();
        for (int i = 0; i < data.length; i++) {
            Map<String, Object> q = new LinkedHashMap<>();
            q.put("id", String.valueOf(i));
            q.put("question", data[i][0]);
            q.put("category", data[i][1]);
            q.put("difficulty", data[i][2]);
            q.put("options", Arrays.asList(opts[i][0]));
            payload.add(q);
        }
        return payload;
    }

    private String getCurrentUserId() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return authService.getUserByEmail(email).getId();
    }
}


// ═══════════════════════════════════════════════════════════════
//  TECHNICAL CONTROLLER — /api/technical
// ═══════════════════════════════════════════════════════════════
@RestController
@RequestMapping("/api/technical")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origins}")
class TechnicalController {

    private final TechnicalService technicalService;
    private final AuthService authService;
    private final TechnicalQuestionRepository technicalQuestionRepository;

    private static final int TECHNICAL_LIMIT = 3;

    @GetMapping("/problems")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getProblems() {
        List<Map<String, Object>> problems = buildRandomTechnicalProblems();
        return ResponseEntity.ok(ApiResponse.success(problems, "Problems fetched."));
    }

    @PostMapping("/run")
    public ResponseEntity<ApiResponse<CodeRunResponse>> runCode(
            @RequestBody TechnicalRunRequest request) {
        String userId = getCurrentUserId();
        CodeRunResponse result = technicalService.runCode(userId, request);
        return ResponseEntity.ok(ApiResponse.success(result, "Code executed."));
    }

    @PostMapping("/submit")
    public ResponseEntity<ApiResponse<Object>> submitAll(
            @RequestBody TechnicalSubmitRequest request) {
        String userId = getCurrentUserId();
        Object result = technicalService.submitAll(userId, request);
        return ResponseEntity.ok(ApiResponse.success(result, "Technical round submitted!"));
    }

    private List<Map<String, Object>> buildRandomTechnicalProblems() {
        List<TechnicalQuestion> questions = new ArrayList<>(technicalQuestionRepository.findAll());
        if (questions.isEmpty()) {
            return buildLegacyTechnicalProblemsPayload();
        }

        Collections.shuffle(questions);
        return questions.stream()
                .limit(TECHNICAL_LIMIT)
                .map(this::mapTechnicalQuestion)
                .toList();
    }

    private Map<String, Object> mapTechnicalQuestion(TechnicalQuestion q) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("id", q.getId());
        item.put("title", q.getQuestion());
        item.put("difficulty", q.getDifficulty() == null ? "Medium" : q.getDifficulty());
        item.put("tags", List.of(
                q.getLanguage() == null || q.getLanguage().isBlank() ? "Coding" : q.getLanguage(),
                q.getDifficulty() == null || q.getDifficulty().isBlank() ? "Problem Solving" : q.getDifficulty()
        ));
        item.put("description", q.getDescription() == null ? q.getQuestion() : q.getDescription());
        item.put("examples", toTechnicalExamples(q.getTestCases()));
        item.put("starterCode", buildStarterCode(q.getLanguage()));
        item.put("hint", q.getDescription() == null || q.getDescription().isBlank() ? "Write a clean solution and test edge cases." : "Use the problem statement and sample cases to guide your solution.");
        item.put("oopsConcept", "Encapsulation: keep solution logic inside one method or class.");
        return item;
    }

    private List<Map<String, Object>> toTechnicalExamples(List<com.interviewsim.models.TestCase> cases) {
        if (cases == null || cases.isEmpty()) return List.of();
        List<Map<String, Object>> examples = new ArrayList<>();
        for (var tc : cases.stream().limit(2).toList()) {
            Map<String, Object> ex = new LinkedHashMap<>();
            ex.put("input", tc.getInput());
            ex.put("output", tc.getOutput());
            examples.add(ex);
        }
        return examples;
    }

    private String buildStarterCode(String language) {
        return switch (language == null ? "" : language.toUpperCase()) {
            case "PYTHON" -> "def solve():\n    # Write your solution here\n    pass";
            case "CPP", "C++" -> "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    return 0;\n}";
            case "C" -> "#include <stdio.h>\n\nint main() {\n    // Write your solution here\n    return 0;\n}";
            case "JAVASCRIPT" -> "function solve() {\n  // Write your solution here\n}";
            default -> "public class Solution {\n  // Write your solution here\n}";
        };
    }

    private List<Map<String, Object>> buildLegacyTechnicalProblemsPayload() {
        return List.of(
            Map.of("id", 0, "title", "Two Sum", "difficulty", "Easy",
                   "tags", List.of("Array", "HashMap"),
                   "description", "Given array nums and target, return indices of two numbers that add to target.",
                   "examples", List.of(
                       Map.of("input","nums=[2,7,11,15], target=9","output","[0,1]"),
                       Map.of("input","nums=[3,2,4], target=6","output","[1,2]")
                   ),
                   "starterCode", "public int[] twoSum(int[] nums, int target) {\n  // Write your solution here\n  \n}",
                   "hint", "Use a HashMap. For each element, check if (target - element) exists in map.",
                   "oopsConcept", "Encapsulation: solution logic encapsulated in a method. Java Collections (Polymorphism via Map interface)."),
            Map.of("id", 1, "title", "Valid Palindrome", "difficulty", "Easy",
                   "tags", List.of("String", "Two Pointer"),
                   "description", "After lowercasing and removing non-alphanumeric chars, check if string reads same forward and backward.",
                   "examples", List.of(
                       Map.of("input","s=\"A man, a plan, a canal: Panama\"","output","true"),
                       Map.of("input","s=\"race a car\"","output","false")
                   ),
                   "starterCode", "public boolean isPalindrome(String s) {\n  // Write your solution here\n  \n}",
                   "hint", "Two pointers from both ends. Skip non-alphanumeric chars. Compare lowercase.",
                   "oopsConcept", "Abstraction: complex char-level logic hidden inside a clean boolean method."),
            Map.of("id", 2, "title", "Maximum Subarray", "difficulty", "Medium",
                   "tags", List.of("Array", "DP", "Kadane's"),
                   "description", "Find the contiguous subarray with the largest sum and return its sum.",
                   "examples", List.of(
                       Map.of("input","nums=[-2,1,-3,4,-1,2,1,-5,4]","output","6"),
                       Map.of("input","nums=[1]","output","1")
                   ),
                   "starterCode", "public int maxSubArray(int[] nums) {\n  // Write your solution here\n  \n}",
                   "hint", "Kadane's Algorithm: at each index, extend current subarray OR start fresh.",
                   "oopsConcept", "Single Responsibility Principle: one method, one job — compute maximum subarray sum.")
        );
    }

    private String getCurrentUserId() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return authService.getUserByEmail(email).getId();
    }
}


// ═══════════════════════════════════════════════════════════════
//  BEHAVIORAL CONTROLLER — /api/behavioral
// ═══════════════════════════════════════════════════════════════
@RestController
@RequestMapping("/api/behavioral")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origins}")
class BehavioralController {

    private final BehavioralService behavioralService;
    private final AuthService authService;
    private final BehavioralQuestionRepository behavioralQuestionRepository;

    private static final int BEHAVIORAL_LIMIT = 6;

    @GetMapping("/questions")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getQuestions() {
        List<Map<String, Object>> questions = buildRandomBehavioralQuestions();
        return ResponseEntity.ok(ApiResponse.success(questions, "Questions fetched."));
    }

    @PostMapping("/submit")
    public ResponseEntity<ApiResponse<BehavioralResultResponse>> submit(
            @RequestBody BehavioralSubmitRequest request) {
        String userId = getCurrentUserId();
        BehavioralResultResponse result = behavioralService.evaluate(userId, request);
        return ResponseEntity.ok(ApiResponse.success(result, "Behavioral round evaluated!"));
    }

    private String getCurrentUserId() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return authService.getUserByEmail(email).getId();
    }

    private List<Map<String, Object>> buildRandomBehavioralQuestions() {
        List<BehavioralQuestion> questions = new ArrayList<>(behavioralQuestionRepository.findAll());
        if (questions.isEmpty()) {
            return buildLegacyBehavioralQuestionsPayload();
        }

        Collections.shuffle(questions);
        return questions.stream()
                .limit(BEHAVIORAL_LIMIT)
                .map(this::mapBehavioralQuestion)
                .toList();
    }

    private Map<String, Object> mapBehavioralQuestion(BehavioralQuestion q) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", q.getId());
        row.put("question", q.getQuestion());
        row.put("category", q.getDifficulty() == null ? "Behavioral" : q.getDifficulty());
        row.put("videoDurationSeconds", q.getVideoDurationSeconds() > 0 ? q.getVideoDurationSeconds() : 120);
        return row;
    }

    private List<Map<String, Object>> buildLegacyBehavioralQuestionsPayload() {
        return List.of(
                Map.of("id", "0", "question", "Tell me about yourself and what drives you toward this role.", "category", "Self-Introduction", "videoDurationSeconds", 120),
                Map.of("id", "1", "question", "Describe a challenging technical project. What was your approach and outcome?", "category", "Technical Experience", "videoDurationSeconds", 120),
                Map.of("id", "2", "question", "Where do you see yourself professionally in 5 years?", "category", "Goals", "videoDurationSeconds", 120),
                Map.of("id", "3", "question", "Tell me about a conflict with a team member and how you resolved it.", "category", "Conflict Resolution", "videoDurationSeconds", 120),
                Map.of("id", "4", "question", "What are your strongest technical skills and what areas are you actively improving?", "category", "Self-Awareness", "videoDurationSeconds", 120),
                Map.of("id", "5", "question", "Why should we hire you over other qualified candidates?", "category", "Value Proposition", "videoDurationSeconds", 120)
        );
    }
}


// ═══════════════════════════════════════════════════════════════
//  LEADERBOARD CONTROLLER — /api/leaderboard
// ═══════════════════════════════════════════════════════════════
@RestController
@RequestMapping("/api/leaderboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origins}")
class LeaderboardController {

    private final UserRepository userRepository;
    private final AptitudeResultRepository aptitudeResultRepository;
    private final TechnicalResultRepository technicalResultRepository;
    private final BehavioralResultRepository behavioralResultRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getLeaderboard() {
        List<User> users = userRepository.findAll();

        List<Map<String, Object>> ranked = new ArrayList<>();
        for (User u : users) {
            String userId = u.getId();

            List<Double> roundScores = new ArrayList<>();
            aptitudeResultRepository.findTopByUserIdOrderByCompletedAtDesc(userId)
                .ifPresent(r -> roundScores.add(r.getPercentage()));
            technicalResultRepository.findTopByUserIdOrderByCompletedAtDesc(userId)
                .ifPresent(r -> roundScores.add(r.getPercentage()));
            behavioralResultRepository.findTopByUserIdOrderByCompletedAtDesc(userId)
                .ifPresent(r -> roundScores.add(r.getPercentage()));

            int completedRounds = roundScores.size();
            boolean hasRoundScores = completedRounds > 0;
            boolean hasPoints = u.getTotalPoints() > 0;
            if (!hasRoundScores && !hasPoints) continue;

            double computedScore = hasRoundScores
                ? roundScores.stream().mapToDouble(Double::doubleValue).average().orElse(0)
                : Math.min(100, u.getTotalPoints());
            int score = (int) Math.round(computedScore);

            Map<String, Object> e = new LinkedHashMap<>();
            e.put("userId", userId);
            e.put("name", u.getName());
            e.put("email", u.getEmail());
            e.put("college", u.getCollege() == null || u.getCollege().isBlank() ? "—" : u.getCollege());
            e.put("score", score);
            e.put("completedRounds", completedRounds);
            ranked.add(e);
        }

        ranked.sort((a, b) -> {
            int scoreCmp = Integer.compare((Integer) b.get("score"), (Integer) a.get("score"));
            if (scoreCmp != 0) return scoreCmp;
            int roundsCmp = Integer.compare((Integer) b.get("completedRounds"), (Integer) a.get("completedRounds"));
            if (roundsCmp != 0) return roundsCmp;
            String nameA = String.valueOf(a.get("name"));
            String nameB = String.valueOf(b.get("name"));
            return nameA.compareToIgnoreCase(nameB);
        });

        List<Map<String, Object>> lb = new ArrayList<>();
        int limit = Math.min(50, ranked.size());
        for (int i = 0; i < limit; i++) {
            Map<String, Object> r = ranked.get(i);
            lb.add(buildEntry(
                i + 1,
                (String) r.get("userId"),
                (String) r.get("name"),
                (String) r.get("email"),
                (String) r.get("college"),
                (Integer) r.get("score")
            ));
        }

        return ResponseEntity.ok(ApiResponse.success(lb, "Leaderboard fetched."));
    }

    private Map<String, Object> buildEntry(int rank, String userId, String name, String email, String college, int score) {
        Map<String, Object> e = new LinkedHashMap<>();
        e.put("rank", rank);
        e.put("userId", userId);
        e.put("name", name);
        e.put("email", email);
        e.put("college", college);
        e.put("score", score);
        e.put("badge", rank == 1 ? "🥇" : rank == 2 ? "🥈" : rank == 3 ? "🥉" : "");
        return e;
    }
}
