package com.interviewsim.repositories;

import com.interviewsim.models.BehavioralQuestion;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BehavioralQuestionRepository extends MongoRepository<BehavioralQuestion, String> {
    List<BehavioralQuestion> findByCreatedByOrderByCreatedAtDesc(String createdBy);
    void deleteByCreatedBy(String createdBy);
}
