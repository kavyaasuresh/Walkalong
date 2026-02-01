package com.walkalong.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "mood_entries")
public class MoodEntry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate date;
    private String mood; // MOTIVATED, NEUTRAL, LOW
    private String notes;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}