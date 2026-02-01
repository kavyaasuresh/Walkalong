package com.walkalong.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
public class LearningTask {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Enumerated(EnumType.STRING)
    private TaskType type; // DAILY, WEEKLY, MONTHLY

    @ManyToOne
    @JoinColumn(name = "stream_id")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties("tasks")
    private Stream stream;

    @Enumerated(EnumType.STRING)
    private TaskStatus status; // PENDING, COMPLETED, SKIPPED

    private LocalDate assignedDate;
    private LocalDate completedDate;
    private Integer duration; // in minutes
    private Integer points;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    public LearningTask() {
        this.points = 10; // Default points
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public TaskType getType() { return type; }
    public void setType(TaskType type) { this.type = type; }

    public Stream getStream() { return stream; }
    public void setStream(Stream stream) { this.stream = stream; }

    public TaskStatus getStatus() { return status; }
    public void setStatus(TaskStatus status) { this.status = status; }

    public LocalDate getAssignedDate() { return assignedDate; }
    public void setAssignedDate(LocalDate assignedDate) { this.assignedDate = assignedDate; }

    public LocalDate getCompletedDate() { return completedDate; }
    public void setCompletedDate(LocalDate completedDate) { this.completedDate = completedDate; }

    public Integer getDuration() { return duration; }
    public void setDuration(Integer duration) { this.duration = duration; }

    public Integer getPoints() { return points; }
    public void setPoints(Integer points) { this.points = points; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}