package com.interviewsim.repositories;

import com.interviewsim.models.AptitudeQuestion;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AptitudeQuestionRepository extends MongoRepository<AptitudeQuestion, String> {
    List<AptitudeQuestion> findByCreatedByOrderByCreatedAtDesc(String createdBy);
    void deleteByCreatedBy(String createdBy);
}
