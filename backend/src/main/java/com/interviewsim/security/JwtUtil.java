package com.interviewsim.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

/**
 * JwtUtil — Demonstrates ENCAPSULATION (OOPs)
 * All JWT logic is encapsulated in this class.
 * External code only calls generateToken() and validateToken() —
 * internal signing, key management, claims parsing are all hidden.
 */
@Component
public class JwtUtil {

    @Value("${app.jwt.secret}")
    private String secretKey;

    @Value("${app.jwt.expiration}")
    private long jwtExpiration;

    @Value("${app.jwt.reset-expiration:120000}")
    private long resetTokenExpiration;

    // ─── Token Generation ───────────────────────────────────────

    public String generateToken(UserDetails userDetails) {
        return generateToken(new HashMap<>(), userDetails);
    }

    public String generateToken(UserDetails userDetails, String role) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", role);
        return generateToken(claims, userDetails);
    }

    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        return buildToken(extraClaims, userDetails, jwtExpiration);
    }

    public String generatePasswordResetToken(String email) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("type", "PASSWORD_RESET");
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(email)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + resetTokenExpiration))
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String extractEmailFromPasswordResetToken(String token) {
        return extractUsername(token);
    }

    public boolean isPasswordResetTokenValid(String token, String email) {
        try {
            Claims claims = extractAllClaims(token);
            String type = claims.get("type", String.class);
            return email.equals(claims.getSubject())
                    && "PASSWORD_RESET".equals(type)
                    && !isTokenExpired(token);
        } catch (Exception ex) {
            return false;
        }
    }

    private String buildToken(Map<String, Object> claims, UserDetails userDetails, long expiration) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // ─── Token Validation ───────────────────────────────────────

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    // ─── Claims Extraction ──────────────────────────────────────

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public String extractRole(String token) {
        return extractClaim(token, claims -> claims.get("role", String.class));
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private Key getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(
            java.util.Base64.getEncoder().encodeToString(secretKey.getBytes())
        );
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
