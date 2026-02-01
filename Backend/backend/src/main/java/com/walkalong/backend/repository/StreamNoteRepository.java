package com.walkalong.backend.repository;

import com.walkalong.backend.entity.StreamNote;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StreamNoteRepository extends JpaRepository<StreamNote, Long> {
    List<StreamNote> findByStreamId(Long streamId);
}
