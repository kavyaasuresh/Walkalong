package com.walkalong.backend.controller;


import com.walkalong.backend.entity.Stream;
import com.walkalong.backend.repository.StreamRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/streams")
@CrossOrigin
public class StreamController {


    private final StreamRepository streamRepository;


    public StreamController(StreamRepository streamRepository) {
        this.streamRepository = streamRepository;
    }


    @PostMapping
    public Stream createStream(@RequestBody Stream stream) {
        return streamRepository.save(stream);
    }
    @GetMapping
    public List<Stream> getAllStreams() {
        return streamRepository.findAll();
    }

    @DeleteMapping("/{id}")
    public org.springframework.http.ResponseEntity<?> deleteStream(@PathVariable Long id) {
        try {
            if (!streamRepository.existsById(id)) {
                return org.springframework.http.ResponseEntity.notFound().build();
            }
            streamRepository.deleteById(id);
            return org.springframework.http.ResponseEntity.ok().build();
        } catch (Exception e) {
            return org.springframework.http.ResponseEntity.status(500)
                .body("Error deleting stream: " + e.getMessage());
        }
    }
}