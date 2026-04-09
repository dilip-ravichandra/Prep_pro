package com.interviewsim.repositories;

import com.interviewsim.models.TechnicalQuestion;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TechnicalQuestionRepository extends MongoRepository<TechnicalQuestion, String> {
    List<TechnicalQuestion> findByCreatedByOrderByCreatedAtDesc(String createdBy);
    void deleteByCreatedBy(String createdBy);
}
