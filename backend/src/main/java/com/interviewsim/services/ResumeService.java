package com.interviewsim.services;

import com.interviewsim.models.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;

@Service
public class ResumeService {

    private static final long MAX_RESUME_SIZE = 150L * 1024 * 1024;

    private static final Set<String> ALLOWED_MIME_TYPES = Set.of(
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    @Value("${app.upload.resume-dir:uploads/resumes}")
    private String resumeDir;

    public Map<String, Object> uploadResume(User user, MultipartFile file) {
        validateFile(file);

        try {
            Path uploadRoot = Paths.get(resumeDir).toAbsolutePath().normalize();
            Files.createDirectories(uploadRoot);

            if (user.getResumePath() != null && !user.getResumePath().isBlank()) {
                Path oldPath = Paths.get(user.getResumePath()).toAbsolutePath().normalize();
                if (Files.exists(oldPath)) {
                    Files.delete(oldPath);
                }
            }

            String extension = getExtension(file.getOriginalFilename());
            String generatedName = "resume_" + user.getId() + "_" + System.currentTimeMillis() + extension;
            Path destination = uploadRoot.resolve(generatedName).normalize();
            Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);

            user.setResumeFileName(file.getOriginalFilename());
            user.setResumePath(destination.toString());
            user.setResumeUploadedAt(LocalDateTime.now());

            return buildResumeInfo(user);
        } catch (IOException e) {
            throw new RuntimeException("Could not upload resume. Please try again.");
        }
    }

    public Map<String, Object> getResumeInfo(User user) {
        return buildResumeInfo(user);
    }

    public Resource loadResume(User user) {
        try {
            if (user.getResumePath() == null || user.getResumePath().isBlank()) {
                throw new IllegalArgumentException("Resume not found.");
            }

            Path path = Paths.get(user.getResumePath()).toAbsolutePath().normalize();
            if (!Files.exists(path)) {
                throw new IllegalArgumentException("Resume file not found on server.");
            }

            Resource resource = new UrlResource(path.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new IllegalArgumentException("Resume file is not readable.");
            }
            return resource;
        } catch (IOException e) {
            throw new RuntimeException("Unable to read resume.");
        }
    }

    public String detectContentType(User user) {
        try {
            if (user.getResumePath() == null || user.getResumePath().isBlank()) {
                return "application/octet-stream";
            }
            String type = Files.probeContentType(Paths.get(user.getResumePath()));
            return type != null ? type : "application/octet-stream";
        } catch (IOException ignored) {
            return "application/octet-stream";
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Please select a file to upload.");
        }

        if (file.getSize() > MAX_RESUME_SIZE) {
            throw new IllegalArgumentException("File size must be less than or equal to 150MB.");
        }

        String contentType = file.getContentType();
        String ext = getExtension(file.getOriginalFilename()).toLowerCase();
        boolean extAllowed = ext.equals(".pdf") || ext.equals(".doc") || ext.equals(".docx");

        if ((contentType == null || !ALLOWED_MIME_TYPES.contains(contentType)) && !extAllowed) {
            throw new IllegalArgumentException("Invalid file format. Only PDF, DOC, and DOCX are allowed.");
        }
    }

    private String getExtension(String originalFilename) {
        if (originalFilename == null) return "";
        int idx = originalFilename.lastIndexOf('.');
        if (idx < 0) return "";
        return originalFilename.substring(idx);
    }

    private Map<String, Object> buildResumeInfo(User user) {
        Map<String, Object> data = new LinkedHashMap<>();
        boolean hasResume = user.getResumePath() != null && !user.getResumePath().isBlank();
        data.put("hasResume", hasResume);
        data.put("fileName", hasResume ? user.getResumeFileName() : null);
        data.put("uploadedAt", hasResume ? user.getResumeUploadedAt() : null);
        return data;
    }
}
