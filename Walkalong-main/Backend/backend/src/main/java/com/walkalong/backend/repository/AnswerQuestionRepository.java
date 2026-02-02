package com.walkalong.backend.repository;

import com.walkalong.backend.entity.AnswerQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AnswerQuestionRepository extends JpaRepository<AnswerQuestion, Long> {
}
