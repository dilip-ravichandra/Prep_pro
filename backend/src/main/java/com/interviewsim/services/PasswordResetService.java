package com.interviewsim.services;

import com.interviewsim.dto.AuthResponse;
import com.interviewsim.dto.UserDto;
import com.interviewsim.models.User;
import com.interviewsim.repositories.UserRepository;
import com.interviewsim.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @Value("${admin.auth.email:diliprbtech24@rvu.edu.in}")
    private String adminEmail;

    public void sendResetLink(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (isAdminEmail(user.getEmail())) {
            throw new RuntimeException("Use the admin forgot password page for admin accounts.");
        }

        String token = jwtUtil.generatePasswordResetToken(user.getEmail());
        String resetLink = frontendUrl + "/reset-password?token=" + token;
        emailService.sendPasswordResetEmail(user.getEmail(), resetLink);
    }

    public void sendAdminResetLink(String email) {
        if (!isAdminEmail(email)) {
            throw new RuntimeException("Invalid admin account.");
        }

        User admin = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        String token = jwtUtil.generatePasswordResetToken(admin.getEmail());
        String resetLink = frontendUrl + "/admin/reset-password?token=" + token;
        emailService.sendPasswordResetEmail(admin.getEmail(), resetLink);
    }

    public AuthResponse resetPassword(String token, String newPassword) {
        String email = jwtUtil.extractEmailFromPasswordResetToken(token);
        if (!jwtUtil.isPasswordResetTokenValid(token, email)) {
            throw new RuntimeException("Invalid or expired reset token");
        }

        if (isAdminEmail(email)) {
            throw new RuntimeException("Use the admin reset password page for admin accounts.");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setPassword(passwordEncoder.encode(newPassword));
        User saved = userRepository.save(user);
        return createAuthResponse(saved);
    }

    public AuthResponse resetAdminPassword(String token, String newPassword) {
        String email = jwtUtil.extractEmailFromPasswordResetToken(token);
        if (!jwtUtil.isPasswordResetTokenValid(token, email) || !isAdminEmail(email)) {
            throw new RuntimeException("Invalid or expired reset token");
        }

        User admin = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        admin.setPassword(passwordEncoder.encode(newPassword));
        User saved = userRepository.save(admin);
        return createAuthResponse(saved);
    }

    private boolean isAdminEmail(String email) {
        return email != null && adminEmail != null && email.equalsIgnoreCase(adminEmail);
    }

        private AuthResponse createAuthResponse(User user) {
        UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
            .username(user.getEmail())
            .password(user.getPassword())
            .roles(user.getRole().name())
            .build();

        String token = jwtUtil.generateToken(userDetails, user.getRole().name());

        UserDto userDto = UserDto.builder()
            .id(user.getId())
            .name(user.getName())
            .email(user.getEmail())
            .college(user.getCollege())
            .role(user.getRole().name())
            .streakDays(user.getStreakDays())
            .totalPoints(user.getTotalPoints())
            .earnedBadges(user.getEarnedBadges() != null ? user.getEarnedBadges() : new ArrayList<>())
            .resumeFileName(user.getResumeFileName())
            .build();

        return AuthResponse.builder()
            .token(token)
            .tokenType("Bearer")
            .user(userDto)
            .build();
        }
}
