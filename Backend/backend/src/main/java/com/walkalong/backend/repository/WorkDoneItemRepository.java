package com.walkalong.backend.repository;

import com.walkalong.backend.entity.WorkDoneEntry;
import com.walkalong.backend.entity.WorkDoneItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorkDoneItemRepository extends JpaRepository<WorkDoneItem, Long> {
    List<WorkDoneItem> findByWorkDoneEntry(WorkDoneEntry entry);
}
