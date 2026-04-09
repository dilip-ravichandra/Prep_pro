package com.interviewsim.services;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendPasswordResetEmail(String to, String resetLink) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject("PrepPro - Reset your password");
        message.setText("We received a request to reset your password.\n\n" +
                "Click this link to reset: " + resetLink + "\n\n" +
            "This link will expire in 2 minutes.\n" +
                "If you did not request this, please ignore this email.");
        mailSender.send(message);
    }
}
