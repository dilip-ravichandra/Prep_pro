package com.interviewsim.config;

import com.interviewsim.models.Role;
import com.interviewsim.models.User;
import com.interviewsim.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class AdminBootstrapper implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${admin.auth.email}")
    private String adminEmail;

    @Value("${admin.auth.password}")
    private String adminPassword;

    @Override
    public void run(String... args) {
        if (adminEmail == null || adminEmail.isBlank() || adminPassword == null || adminPassword.isBlank()) {
            return;
        }

        List<User> matches = userRepository.findAllByEmailIgnoreCase(adminEmail);
        User admin = matches.isEmpty() ? User.builder().email(adminEmail).build() : matches.get(0);

        if (matches.size() > 1) {
            for (int i = 1; i < matches.size(); i++) {
                userRepository.deleteById(matches.get(i).getId());
            }
        }

        boolean isNewAdmin = admin.getId() == null;

        if (admin.getName() == null || admin.getName().isBlank()) {
            admin.setName("dil");
        }

        admin.setEmail(adminEmail);
        admin.setCollege("Admin Portal");
        admin.setRole(Role.ADMIN);
        admin.setStreakDays(0);
        admin.setTotalPoints(0);
        if (admin.getEarnedBadges() == null) {
            admin.setEarnedBadges(new ArrayList<>());
        }
        if (admin.getJoinedAt() == null) {
            admin.setJoinedAt(LocalDateTime.now());
        }

        // Only seed the password when creating the admin record or when the stored
        // password is missing. This allows forgot-password resets to remain valid
        // across application restarts.
        if (isNewAdmin || admin.getPassword() == null || admin.getPassword().isBlank()) {
            admin.setPassword(passwordEncoder.encode(adminPassword));
        }

        if (admin.getLastLoginAt() == null) {
            admin.setLastLoginAt(LocalDateTime.now());
        }

        userRepository.save(admin);
    }
}
