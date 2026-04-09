package com.interviewsim.repositories;

import com.interviewsim.models.Comment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CommentRepository extends MongoRepository<Comment, String> {
    List<Comment> findByCandidateIdAndRoundTypeOrderByCreatedAtDesc(String candidateId, String roundType);
    List<Comment> findByCandidateEmailAndRoundTypeOrderByCreatedAtDesc(String candidateEmail, String roundType);
    List<Comment> findByRoundTypeOrderByCreatedAtDesc(String roundType);
    void deleteByCandidateId(String candidateId);
}
