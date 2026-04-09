package com.interviewsim.repositories;

import com.interviewsim.models.BehavioralVideoSubmission;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BehavioralVideoSubmissionRepository extends MongoRepository<BehavioralVideoSubmission, String> {
    List<BehavioralVideoSubmission> findAllByOrderBySubmittedAtDesc();
    List<BehavioralVideoSubmission> findByUserIdOrderBySubmittedAtDesc(String userId);
}
