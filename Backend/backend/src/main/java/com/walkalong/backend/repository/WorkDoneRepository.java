package com.walkalong.backend.repository;

import com.walkalong.backend.entity.User;
import com.walkalong.backend.entity.WorkDoneEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface WorkDoneRepository extends JpaRepository<WorkDoneEntry, Long> {
    List<WorkDoneEntry> findByUserOrderByDateDesc(User user);
    
    List<WorkDoneEntry> findByUserAndDateBetweenOrderByDateAsc(User user, LocalDate start, LocalDate end);
    
    Optional<WorkDoneEntry> findByUserAndDate(User user, LocalDate date);
    
    @Query("SELECT COALESCE(SUM(w.totalPoints), 0) FROM WorkDoneEntry w WHERE w.user = ?1")
    Integer getTotalPointsByUser(User user);
    
    @Query("SELECT COALESCE(SUM(w.totalPoints), 0) FROM WorkDoneEntry w WHERE w.user = ?1 AND w.date BETWEEN ?2 AND ?3")
    Integer getPointsByUserAndDateRange(User user, LocalDate start, LocalDate end);
}
