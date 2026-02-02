package com.walkalong.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "answer_submissions")
public class AnswerSubmission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "question_id")
    private AnswerQuestion question;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private String pdfPath;
    private Integer timeTakenMinutes;

    @Enumerated(EnumType.STRING)
    private SubmissionStatus status = SubmissionStatus.SUBMITTED;

    private LocalDateTime submittedAt = LocalDateTime.now();

    private Long parentSubmissionId; // Null if it's the first attempt

    public enum SubmissionStatus {
        SUBMITTED, REVIEWED
    }
}
