package com.walkalong.backend.controller;

import com.walkalong.backend.entity.LearningTask;
import com.walkalong.backend.entity.TaskStatus;
import com.walkalong.backend.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "*")
public class TaskController {

    @Autowired
    private TaskRepository taskRepository;

    @PostMapping
    public LearningTask createTask(@RequestBody LearningTask task) {
        if (task.getStatus() == null) task.setStatus(TaskStatus.PENDING);
        if (task.getPoints() == null) task.setPoints(10); // Default if not sent
        task.setAssignedDate(LocalDate.now());
        return taskRepository.save(task);
    }

    @GetMapping
    public List<LearningTask> getAllTasks() {
        return taskRepository.findAll();
    }

    @PutMapping("/{id}/status")
    public LearningTask updateStatus(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        LearningTask task = taskRepository.findById(id).orElseThrow();
        String statusStr = payload.get("status");
        TaskStatus status = TaskStatus.valueOf(statusStr);
        
        // Logic for deductions can go here if we were updating a User entity immediately
        // For now, we rely on the state of the task to calculate total points on the frontend/dashboard
        
        task.setStatus(status);
        if (status == TaskStatus.COMPLETED) {
            task.setCompletedDate(LocalDate.now());
        } else {
            task.setCompletedDate(null); // Reset if moved back to Pending/Skipped
        }
        return taskRepository.save(task);
    }

    @DeleteMapping("/{id}")
    public void deleteTask(@PathVariable Long id) {
        taskRepository.deleteById(id);
    }
}