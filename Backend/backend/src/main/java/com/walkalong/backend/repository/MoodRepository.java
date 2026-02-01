package com.walkalong.backend.repository;

import com.walkalong.backend.entity.MoodEntry;
import com.walkalong.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MoodRepository extends JpaRepository<MoodEntry, Long> {
    List<MoodEntry> findByUserOrderByDateDesc(User user);
}
