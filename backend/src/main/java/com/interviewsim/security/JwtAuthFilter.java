package com.interviewsim.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * JwtAuthFilter — Runs on EVERY incoming HTTP request.
 *
 * Flow:
 * 1. Extract "Authorization: Bearer <token>" header
 * 2. Validate JWT token
 * 3. Load user from MongoDB
 * 4. Set authentication in Spring Security context
 * 5. Continue filter chain
 *
 * If token is missing/invalid, request continues unauthenticated
 * and Spring Security will reject it at the controller level.
 */
@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        // No Authorization header or not Bearer token — skip JWT processing
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String jwt = authHeader.substring(7); // Remove "Bearer " prefix
        final String userEmail;

        try {
            userEmail = jwtUtil.extractUsername(jwt);
        } catch (Exception e) {
            // Invalid token format — continue without setting auth
            filterChain.doFilter(request, response);
            return;
        }

        // Only authenticate if not already authenticated
        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);

            if (jwtUtil.isTokenValid(jwt, userDetails)) {
                String role = jwtUtil.extractRole(jwt);
                List<SimpleGrantedAuthority> authorities = userDetails.getAuthorities().stream()
                        .map(a -> new SimpleGrantedAuthority(a.getAuthority()))
                        .toList();

                if (role != null && !role.isBlank()) {
                    authorities = List.of(new SimpleGrantedAuthority("ROLE_" + role));
                }

                UsernamePasswordAuthenticationToken authToken =
                    new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        authorities
                    );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        filterChain.doFilter(request, response);
    }
}
