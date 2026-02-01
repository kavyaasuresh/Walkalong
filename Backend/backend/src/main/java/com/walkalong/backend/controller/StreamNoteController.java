package com.walkalong.backend.controller;

import com.walkalong.backend.entity.Stream;
import com.walkalong.backend.entity.StreamNote;
import com.walkalong.backend.repository.StreamNoteRepository;
import com.walkalong.backend.repository.StreamRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stream-notes")
@CrossOrigin(origins = "*")
public class StreamNoteController {

    @Autowired
    private StreamNoteRepository streamNoteRepository;
    
    @Autowired
    private StreamRepository streamRepository;

    @GetMapping("/stream/{streamId}")
    public List<StreamNote> getNotesByStream(@PathVariable Long streamId) {
        return streamNoteRepository.findByStreamId(streamId);
    }

    @PostMapping
    public StreamNote createNote(@RequestBody StreamNote note) {
        // Ensure stream reference is loaded if only ID is sent, or rely on Hibernate
        return streamNoteRepository.save(note);
    }

    @DeleteMapping("/{id}")
    public void deleteNote(@PathVariable Long id) {
        streamNoteRepository.deleteById(id);
    }
}
