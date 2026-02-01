package com.walkalong.backend.controller;

import com.walkalong.backend.entity.MoodEntry;
import com.walkalong.backend.entity.User;
import com.walkalong.backend.repository.MoodRepository;
import com.walkalong.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mood")
@CrossOrigin(origins = "*")
public class MoodController {

    @Autowired
    private MoodRepository moodRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    public MoodEntry saveMood(@RequestBody MoodEntry entry) {
        // TODO: Get user from authentication context
        User user = userRepository.findAll().stream().findFirst().orElse(null);
        entry.setUser(user);
        return moodRepository.save(entry);
    }

    @GetMapping("/history")
    public List<MoodEntry> getHistory() {
        // TODO: Filter by authenticated user
        User user = userRepository.findAll().stream().findFirst().orElse(null);
        if (user != null) {
            return moodRepository.findByUserOrderByDateDesc(user);
        }
        return List.of();
    }
}
