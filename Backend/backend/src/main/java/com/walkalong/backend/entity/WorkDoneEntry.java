package com.walkalong.backend.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "work_done_entries")
public class WorkDoneEntry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate date;
    private String dayOfWeek;

    @OneToMany(mappedBy = "workDoneEntry", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<WorkDoneItem> items = new ArrayList<>();

    private Integer satisfactionLevel; // 1-5 scale
    private Integer totalPoints;
    private String notes; // Optional daily notes

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    public void calculateTotalPoints() {
        this.totalPoints = items.stream()
            .mapToInt(item -> item.getPoints() != null ? item.getPoints() : 0)
            .sum();
    }
}
