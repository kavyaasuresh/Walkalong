package com.walkalong.backend.repository;

import com.walkalong.backend.entity.AnswerReview;
import com.walkalong.backend.entity.AnswerSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface AnswerReviewRepository extends JpaRepository<AnswerReview, Long> {
    Optional<AnswerReview> findBySubmission(AnswerSubmission submission);
}
