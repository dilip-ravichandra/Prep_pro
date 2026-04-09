package com.interviewsim.services;

import com.interviewsim.dto.CommentDto;
import com.interviewsim.models.Comment;
import com.interviewsim.repositories.CommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;

    public CommentDto addComment(CommentDto dto, String currentUserEmail, boolean isAdmin) {
        Comment comment = Comment.builder()
                .roundType(dto.getRoundType())
                .candidateId(dto.getCandidateId())
                .candidateEmail(dto.getCandidateEmail())
                .adminEmail(isAdmin ? currentUserEmail : dto.getAdminEmail())
                .message(dto.getMessage())
                .isAdminComment(isAdmin)
                .parentCommentId(dto.getParentCommentId())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        return toDto(commentRepository.save(comment));
    }

    public List<CommentDto> getComments(String candidateId, String roundType) {
        return commentRepository.findByCandidateIdAndRoundTypeOrderByCreatedAtDesc(candidateId, roundType)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public void deleteComment(String id) {
        commentRepository.deleteById(id);
    }

    private CommentDto toDto(Comment comment) {
        return CommentDto.builder()
                .id(comment.getId())
                .roundType(comment.getRoundType())
                .candidateId(comment.getCandidateId())
                .candidateEmail(comment.getCandidateEmail())
                .adminEmail(comment.getAdminEmail())
                .message(comment.getMessage())
                .isAdminComment(comment.isAdminComment())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .parentCommentId(comment.getParentCommentId())
                .build();
    }
}
