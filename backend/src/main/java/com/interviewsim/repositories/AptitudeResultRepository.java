package com.interviewsim.repositories;

import com.interviewsim.models.AptitudeResult;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AptitudeResultRepository extends MongoRepository<AptitudeResult, String> {
    List<AptitudeResult> findByUserIdOrderByCompletedAtDesc(String userId);
    Optional<AptitudeResult> findTopByUserIdOrderByCompletedAtDesc(String userId);

    @Query("{ 'percentage': { $exists: true } }")
    List<AptitudeResult> findAllWithPercentage();
}
