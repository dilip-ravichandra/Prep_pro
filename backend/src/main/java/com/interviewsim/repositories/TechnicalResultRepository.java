package com.interviewsim.repositories;

import com.interviewsim.models.TechnicalResult;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TechnicalResultRepository extends MongoRepository<TechnicalResult, String> {
    List<TechnicalResult> findByUserIdOrderByCompletedAtDesc(String userId);
    Optional<TechnicalResult> findTopByUserIdOrderByCompletedAtDesc(String userId);
}
