package com.interviewsim.exceptions;

import com.interviewsim.dto.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

/**
 * GlobalExceptionHandler — Demonstrates ABSTRACTION (OOPs)
 *
 * All error handling is abstracted into one place.
 * Controllers never deal with try-catch for common errors.
 * Clean separation of concerns — each layer does its own job.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    // ─── Validation Errors (missing/invalid fields) ──────────────
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidationErrors(
            MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String field = ((FieldError) error).getField();
            String message = error.getDefaultMessage();
            errors.put(field, message);
        });
        return ResponseEntity.badRequest()
            .body(ApiResponse.<Map<String, String>>builder()
                .success(false)
                .message("Validation failed. Please check your input.")
                .data(errors)
                .build());
    }

    // ─── Bad Credentials (wrong password) ────────────────────────
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiResponse<Void>> handleBadCredentials(BadCredentialsException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(ApiResponse.error("Invalid email or password."));
    }

    // ─── Runtime / Business Logic Errors ─────────────────────────
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiResponse<Void>> handleRuntimeException(RuntimeException ex) {
        return ResponseEntity.badRequest()
            .body(ApiResponse.error(ex.getMessage()));
    }

    // ─── Fallback for any unhandled exception ─────────────────────
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGenericException(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ApiResponse.error("Something went wrong. Please try again."));
    }
}
