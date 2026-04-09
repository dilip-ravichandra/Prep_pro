package com.interviewsim.repositories;

import com.interviewsim.models.AdminQuestion;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AdminQuestionRepository extends MongoRepository<AdminQuestion, String> {
}
