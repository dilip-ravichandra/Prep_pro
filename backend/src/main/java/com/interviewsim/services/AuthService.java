package com.interviewsim.services;

import com.interviewsim.dto.*;
import com.interviewsim.models.Role;
import com.interviewsim.models.User;
import com.interviewsim.repositories.UserRepository;
import com.interviewsim.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.Set;

/**
 * AuthService — Handles ALL authentication logic.
 *
 * Demonstrates ABSTRACTION (OOPs Pillar 4):
 * Controllers call register() and login() without knowing
 * HOW BCrypt hashing, JWT generation, or MongoDB storage works.
 * All that complexity is hidden (abstracted) inside this service.
 *
 * Demonstrates ENCAPSULATION (OOPs Pillar 1):
 * Password hashing, token building — private implementation details
 * exposed only through clean public method signatures.
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    @Value("${admin.auth.email:admin@interviewsim.local}")
    private String adminEmail;

    @Value("${admin.auth.password:}")
    private String adminPassword;

    @Value("${admin.auth.password-bcrypt:}")
    private String adminPasswordBcrypt;

    // ─── Registration ────────────────────────────────────────────

    public AuthResponse register(RegisterRequest request) {
        String email = normalizeCredential(request.getEmail());
        String password = normalizeCredential(request.getPassword());

        if (isAdminEmail(email)) {
            throw new RuntimeException("This email is reserved for admin portal.");
        }

        // Check duplicate email
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already registered. Please sign in.");
        }

        // Build User object — password is ALWAYS hashed before saving
        User user = User.builder()
                .name(request.getName())
                .email(email)
                .password(passwordEncoder.encode(password))  // BCrypt hash
                .college(request.getCollege() != null ? request.getCollege() : "Not specified")
                .role(Role.CANDIDATE)
                .streakDays(0)
                .totalPoints(0)
                .earnedBadges(new ArrayList<>())
                .joinedAt(LocalDateTime.now())
                .lastLoginAt(LocalDateTime.now())
                .build();

        User savedUser = userRepository.save(user);

        // Generate JWT token
        UserDetails userDetails = buildUserDetails(savedUser);
        String token = jwtUtil.generateToken(userDetails, savedUser.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .user(mapToUserDto(savedUser))
                .build();
    }

    // ─── Login ───────────────────────────────────────────────────

    public AuthResponse login(LoginRequest request) {
        String email = normalizeCredential(request.getEmail());
        String password = normalizeCredential(request.getPassword());

        if (isAdminEmail(email)) {
            throw new RuntimeException("Use admin login page to sign in as admin.");
        }

        // Spring Security handles password verification
        // Throws exception if credentials are wrong — automatically
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                request.getEmail(),
                password
            )
        );

            User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() == Role.ADMIN) {
            throw new RuntimeException("Use admin login page to sign in as admin.");
        }

        // Update last login time
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        UserDetails userDetails = buildUserDetails(user);
        String token = jwtUtil.generateToken(userDetails, user.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .user(mapToUserDto(user))
                .build();
    }

    public AuthResponse adminLogin(LoginRequest request) {
        String email = normalizeCredential(request.getEmail());
        String password = normalizeCredential(request.getPassword());
        String effectiveAdminEmail = getEffectiveAdminEmail();
        log.debug("Admin login attempt. requestEmail={}, configuredAdminEmail={}, hasPlainPassword={}, hasBcryptPassword={}",
            email,
                effectiveAdminEmail,
                getEffectiveAdminPassword() != null && !getEffectiveAdminPassword().isBlank(),
                getEffectiveAdminPasswordBcrypt() != null && !getEffectiveAdminPasswordBcrypt().isBlank());

        if (!isAdminEmail(email)) {
            log.debug("Admin login denied: request email does not match configured admin email.");
            throw new RuntimeException("Invalid admin credentials.");
        }

        User adminUser = userRepository.findByEmail(effectiveAdminEmail).orElse(null);

        if (adminUser != null) {
            boolean passwordMatchesStored = adminUser.getPassword() != null
                    && !adminUser.getPassword().isBlank()
                    && passwordEncoder.matches(password, adminUser.getPassword());

            log.debug("Admin user exists. passwordMatchesStored={}", passwordMatchesStored);

            if (!passwordMatchesStored && !isValidAdminPassword(password)) {
                log.debug("Admin login denied: provided password matched neither stored hash nor configured admin password.");
                throw new RuntimeException("Invalid admin credentials.");
            }
        } else {
            if (!isValidAdminPassword(password)) {
                log.debug("Admin user missing and provided password does not match configured admin password.");
                throw new RuntimeException("Invalid admin credentials.");
            }

            adminUser = User.builder()
                    .name("Administrator")
                    .email(effectiveAdminEmail)
                    .password(passwordEncoder.encode(resolveAdminSeedPassword(password)))
                    .college("Admin Portal")
                    .role(Role.ADMIN)
                    .streakDays(0)
                    .totalPoints(0)
                    .earnedBadges(new ArrayList<>())
                    .joinedAt(LocalDateTime.now())
                    .lastLoginAt(LocalDateTime.now())
                    .build();
        }

        adminUser.setRole(Role.ADMIN);
        adminUser.setLastLoginAt(LocalDateTime.now());
        if (adminUser.getPassword() == null || adminUser.getPassword().isBlank()) {
            adminUser.setPassword(passwordEncoder.encode(resolveAdminSeedPassword(password)));
        }
        if (adminUser.getName() == null || adminUser.getName().isBlank()) {
            adminUser.setName("Administrator");
        }

        User saved = userRepository.save(adminUser);
        UserDetails userDetails = buildUserDetails(saved);
        String token = jwtUtil.generateToken(userDetails, Role.ADMIN.name());

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .user(mapToUserDto(saved))
                .build();
    }

    public UserDto getAdminProfile(String email) {
        if (!isAdminEmail(email)) {
            throw new RuntimeException("Admin not found");
        }

        User adminUser = userRepository.findByEmail(getEffectiveAdminEmail())
                .orElseThrow(() -> new RuntimeException("Admin account is not initialized"));

        if (adminUser.getRole() != Role.ADMIN) {
            throw new RuntimeException("Invalid admin account");
        }
        return mapToUserDto(adminUser);
    }

    // ─── Private Helpers ─────────────────────────────────────────

    private UserDetails buildUserDetails(User user) {
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
            .roles(user.getRole().name())
                .build();
    }

    public UserDto mapToUserDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .college(user.getCollege())
                .role(user.getRole().name())
                .streakDays(user.getStreakDays())
                .totalPoints(user.getTotalPoints())
                .earnedBadges(user.getEarnedBadges())
                .resumeFileName(user.getResumeFileName())
                .build();
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User saveUser(User user) {
        return userRepository.save(user);
    }

    public boolean isAdminEmail(String email) {
        String effectiveEmail = getEffectiveAdminEmail();
        return email != null && effectiveEmail != null && !effectiveEmail.isBlank() && email.equalsIgnoreCase(effectiveEmail);
    }

    private boolean isValidAdminPassword(String rawPassword) {
        if (rawPassword == null || rawPassword.isBlank()) return false;

        String effectiveBcrypt = getEffectiveAdminPasswordBcrypt();
        String effectivePlain = getEffectiveAdminPassword();

        if (effectiveBcrypt != null && !effectiveBcrypt.isBlank()) {
            return passwordEncoder.matches(rawPassword, effectiveBcrypt);
        }
        return effectivePlain != null && !effectivePlain.isBlank() && effectivePlain.equals(rawPassword);
    }

    private String resolveAdminSeedPassword(String fallbackRawPassword) {
        String effectivePlain = getEffectiveAdminPassword();
        if (effectivePlain != null && !effectivePlain.isBlank()) return effectivePlain;
        return fallbackRawPassword;
    }

    private String getEffectiveAdminEmail() {
        return resolveConfig("ADMIN_AUTH_EMAIL", adminEmail, "admin@interviewsim.local");
    }

    private String getEffectiveAdminPassword() {
        return resolveConfig("ADMIN_AUTH_PASSWORD", adminPassword, "");
    }

    private String getEffectiveAdminPasswordBcrypt() {
        return resolveConfig("ADMIN_AUTH_PASSWORD_BCRYPT", adminPasswordBcrypt, "");
    }

    private String resolveConfig(String key, String injectedValue, String defaultValue) {
        String value = normalizeValue(injectedValue);
        if (!value.isBlank()) return value;

        value = normalizeValue(System.getenv(key));
        if (!value.isBlank()) return value;

        value = normalizeValue(readFromDotEnv(key));
        if (!value.isBlank()) return value;

        return defaultValue == null ? "" : defaultValue;
    }

    private String readFromDotEnv(String key) {
        Set<Path> candidates = new LinkedHashSet<>();
        Path currentDir = Path.of(System.getProperty("user.dir", ".")).toAbsolutePath().normalize();
        candidates.add(currentDir.resolve(".env"));
        candidates.add(currentDir.resolve("..").resolve(".env").normalize());
        candidates.add(Path.of(".env").toAbsolutePath().normalize());
        candidates.add(Path.of("..", ".env").toAbsolutePath().normalize());

        for (Path path : candidates) {
            if (!Files.exists(path)) continue;
            try {
                for (String line : Files.readAllLines(path)) {
                    String trimmed = line.trim();
                    if (trimmed.isEmpty() || trimmed.startsWith("#") || !trimmed.contains("=")) continue;

                    int eq = trimmed.indexOf('=');
                    String envKey = trimmed.substring(0, eq).trim();
                    if (!envKey.equals(key)) continue;

                    String envValue = trimmed.substring(eq + 1).trim();
                    return normalizeValue(envValue);
                }
            } catch (IOException ignored) {
                // Ignore unreadable .env files and continue.
            }
        }
        return "";
    }

    private String normalizeValue(String raw) {
        if (raw == null) return "";
        String value = raw.trim();
        if (value.length() >= 2) {
            boolean doubleQuoted = value.startsWith("\"") && value.endsWith("\"");
            boolean singleQuoted = value.startsWith("'") && value.endsWith("'");
            if (doubleQuoted || singleQuoted) {
                value = value.substring(1, value.length() - 1).trim();
            }
        }
        return value;
    }

    private String normalizeCredential(String raw) {
        return raw == null ? "" : raw.trim();
    }
}
