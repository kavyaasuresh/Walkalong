package com.walkalong.backend.controller;

import com.walkalong.backend.entity.CalendarEntry;
import com.walkalong.backend.entity.User;
import com.walkalong.backend.repository.CalendarRepository;
import com.walkalong.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/calendar")
@CrossOrigin(origins = "*")
public class CalendarController {

    @Autowired
    private CalendarRepository calendarRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/studied-days")
    public List<String> getStudiedDays() {
        // TODO: Get user from authentication context
        User user = userRepository.findAll().stream().findFirst().orElse(null);
        
        if (user == null) {
            return List.of();
        }
        
        List<CalendarEntry> entries = calendarRepository.findByUserAndStudiedTrue(user);
        
        // Convert LocalDate to ISO String format for frontend
        return entries.stream()
            .map(entry -> entry.getDate().toString())
            .collect(Collectors.toList());
    }

    @PostMapping("/mark-studied")
    public CalendarEntry markStudied(@RequestBody CalendarEntry entry) {
        // TODO: Get user from authentication context
        User user = userRepository.findAll().stream().findFirst().orElse(null);
        entry.setUser(user);
        entry.setStudied(true);
        
        if (entry.getDate() == null) {
            entry.setDate(LocalDate.now());
        }
        
        return calendarRepository.save(entry);
    }
}
