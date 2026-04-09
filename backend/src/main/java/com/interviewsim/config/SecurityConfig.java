package com.interviewsim.config;

import com.interviewsim.security.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * SecurityConfig — Complete Spring Security configuration.
 *
 * Security Features:
 * - BCrypt password hashing (never store plain text)
 * - JWT stateless authentication (no sessions)
 * - CORS configured for React frontend
 * - Route-level authorization
 * - Public routes: /api/auth/** (login, register)
 * - Protected routes: everything else requires valid JWT
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;

    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Disable CSRF (using JWT, not session cookies)
            .csrf(AbstractHttpConfigurer::disable)

            // Configure CORS
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // Route authorization rules
            .authorizeHttpRequests(auth -> auth
                // Public routes — no JWT needed
                .requestMatchers(
                    "/api/auth/register",
                    "/api/auth/login",
                    "/api/auth/forgot-password",
                    "/api/auth/reset-password",
                    "/api/auth/health",
                    "/api/chat",
                    "/api/public/videos/**",
                    "/api/admin-auth/login",
                    "/api/admin-auth/forgot-password",
                    "/api/admin-auth/reset-password"
                ).permitAll()

                .requestMatchers("/api/admin-auth/me").hasRole("ADMIN")

                // Role-based routes
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/user/**").hasAnyRole("ADMIN", "CANDIDATE")

                // باقي endpoints → authenticated users
                .requestMatchers("/api/**").authenticated()

                // Fallback
                .anyRequest().permitAll()
            )

            // Stateless session — JWT handles auth, no server-side sessions
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            // Use our custom auth provider
            .authenticationProvider(authenticationProvider())

            // Add JWT filter BEFORE Spring's default UsernamePasswordAuthenticationFilter
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(allowedOrigins));
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        config.setAllowedHeaders(Arrays.asList(
            "Authorization", "Content-Type", "X-Requested-With", "Accept", "Origin"
        ));
        config.setExposedHeaders(List.of("Authorization"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        // BCrypt with strength 12 — strong hashing, ~300ms per hash (prevents brute force)
        return new BCryptPasswordEncoder(12);
    }
}
