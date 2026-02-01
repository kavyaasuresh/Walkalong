package com.walkalong.backend.service;

import com.walkalong.backend.entity.LearningTask;
import com.walkalong.backend.entity.TaskType;
import com.walkalong.backend.repository.TaskRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.WeekFields;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
public class ViewPlanService {


    private final TaskRepository taskRepository;


    public ViewPlanService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }


    public List<LearningTask> getDailyTasks(LocalDate date) {
        return taskRepository.findAll().stream()
                .filter(t -> t.getType() == TaskType.DAILY)
                .filter(t -> t.getAssignedDate() != null && t.getAssignedDate().equals(date))
                .collect(Collectors.toList());
    }

    public List<LearningTask> getWeeklyTasks(LocalDate date) {
        int targetWeek = date.get(WeekFields.of(Locale.getDefault()).weekOfWeekBasedYear());
        return taskRepository.findAll().stream()
                .filter(t -> t.getType() == TaskType.WEEKLY)
                .filter(t -> t.getAssignedDate() != null && t.getAssignedDate().get(WeekFields.of(Locale.getDefault()).weekOfWeekBasedYear()) == targetWeek)
                .collect(Collectors.toList());
    }
    
    public List<LearningTask> getMonthlyTasks(LocalDate date) {
        int targetMonth = date.getMonthValue();
        return taskRepository.findAll().stream()
                .filter(t -> t.getType() == TaskType.MONTHLY)
                .filter(t -> t.getAssignedDate() != null && t.getAssignedDate().getMonthValue() == targetMonth)
                .collect(Collectors.toList());
    }
}