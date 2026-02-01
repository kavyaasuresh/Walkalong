package com.walkalong.backend.repository;


import com.walkalong.backend.entity.LearningTask;
import com.walkalong.backend.entity.TaskType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface TaskRepository extends JpaRepository<LearningTask, Long> {
    List<LearningTask> findByTypeAndAssignedDate(TaskType type, LocalDate date);
}