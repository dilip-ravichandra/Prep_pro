package com.interviewsim.repositories;

import com.interviewsim.models.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    List<User> findAllByEmailIgnoreCase(String email);
    boolean existsByEmail(String email);

    @Query("{ 'totalPoints': { $gt: ?0 } }")
    List<User> findUsersWithPointsGreaterThan(int points);

    List<User> findTop10ByOrderByTotalPointsDesc();
}
