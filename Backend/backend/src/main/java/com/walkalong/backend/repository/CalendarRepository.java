package com.walkalong.backend.repository;

import com.walkalong.backend.entity.CalendarEntry;
import com.walkalong.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CalendarRepository extends JpaRepository<CalendarEntry,Long> {
    List<CalendarEntry> findByUserAndStudiedTrue(User user);
}

