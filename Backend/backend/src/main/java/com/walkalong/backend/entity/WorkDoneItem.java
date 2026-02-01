package com.walkalong.backend.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "work_done_items")
public class WorkDoneItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String description;
    private Integer points;
    private String category; // Optional: categorize work (Study, Project, Reading, etc.)
    private Boolean completed;

    @ManyToOne
    @JoinColumn(name = "work_done_entry_id")
    @JsonBackReference
    private WorkDoneEntry workDoneEntry;
}
