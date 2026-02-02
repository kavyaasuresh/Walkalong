package com.walkalong.backend.repository;

import com.walkalong.backend.entity.AnswerSubmission;
import com.walkalong.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AnswerSubmissionRepository extends JpaRepository<AnswerSubmission, Long> {
    List<AnswerSubmission> findByUserOrderBySubmittedAtDesc(User user);
}
