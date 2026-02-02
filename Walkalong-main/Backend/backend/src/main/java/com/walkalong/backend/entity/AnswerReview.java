package com.walkalong.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "answer_reviews")
public class AnswerReview {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "submission_id")
    private AnswerSubmission submission;

    private Integer score;

    @Column(columnDefinition = "TEXT")
    private String strengths;

    @Column(columnDefinition = "TEXT")
    private String weaknesses;

    @Column(columnDefinition = "TEXT")
    private String suggestions;

    @Enumerated(EnumType.STRING)
    private Verdict verdict;

    private LocalDateTime reviewedAt = LocalDateTime.now();

    public enum Verdict {
        REWRITE, AVERAGE, GOOD, EXCELLENT
    }
}
