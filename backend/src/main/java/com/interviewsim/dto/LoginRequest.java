package com.interviewsim.dto;

import com.fasterxml.jackson.annotation.JsonSetter;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;

    @JsonSetter("email")
    public void setEmail(String email) {
        this.email = email == null ? null : email.trim();
    }

    @JsonSetter("password")
    public void setPassword(String password) {
        this.password = password == null ? null : password.trim();
    }
}
