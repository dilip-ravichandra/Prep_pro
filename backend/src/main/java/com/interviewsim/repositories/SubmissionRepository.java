package com.interviewsim.repositories;

import com.interviewsim.models.Submission;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubmissionRepository extends MongoRepository<Submission, String> {
    List<Submission> findAllByOrderBySubmittedAtDesc();
    List<Submission> findByUserIdOrderBySubmittedAtDesc(String userId);
}
