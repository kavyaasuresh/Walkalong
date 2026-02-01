package com.walkalong.backend.repository;

import com.walkalong.backend.entity.Stream;
import org.springframework.data.jpa.repository.JpaRepository;


public interface StreamRepository extends JpaRepository<Stream, Long> {
}