package com.walkalong.backend.service;


import com.walkalong.backend.entity.TaskStatus;
import com.walkalong.backend.repository.TaskRepository;
import org.springframework.stereotype.Service;
@Service
public class AnalyticsService {


    private final TaskRepository taskRepository;


    public AnalyticsService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }


    public long getTotalTasks() {
        return taskRepository.count();
    }


    public long getCompletedTasks() {
        return taskRepository.findAll().stream()
                .filter(t -> t.getStatus() == TaskStatus.COMPLETED)
                .count();
    }
    public double getLearningRate() {
        long total = getTotalTasks();
        if (total == 0) return 0;
        return (double) getCompletedTasks() / total;
    }
}