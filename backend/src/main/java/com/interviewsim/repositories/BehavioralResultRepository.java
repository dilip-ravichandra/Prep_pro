package com.interviewsim.repositories;

import com.interviewsim.models.BehavioralResult;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BehavioralResultRepository extends MongoRepository<BehavioralResult, String> {
    List<BehavioralResult> findByUserIdOrderByCompletedAtDesc(String userId);
    Optional<BehavioralResult> findTopByUserIdOrderByCompletedAtDesc(String userId);
}
