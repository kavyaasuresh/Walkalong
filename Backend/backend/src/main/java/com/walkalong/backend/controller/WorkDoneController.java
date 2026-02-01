package com.walkalong.backend.controller;

import com.walkalong.backend.entity.User;
import com.walkalong.backend.entity.WorkDoneEntry;
import com.walkalong.backend.entity.WorkDoneItem;
import com.walkalong.backend.repository.UserRepository;
import com.walkalong.backend.repository.WorkDoneRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.TextStyle;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/workdone")
@CrossOrigin(origins = "*")
public class WorkDoneController {

    @Autowired
    private WorkDoneRepository workDoneRepository;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser() {
        // TODO: Get user from authentication context
        // For now, return first user or create a default one
        return userRepository.findAll().stream().findFirst().orElseGet(() -> {
            User defaultUser = new User();
            defaultUser.setUsername("defaultUser");
            defaultUser.setEmail("default@example.com");
            defaultUser.setPassword("defaultPassword"); // Add required password
            return userRepository.save(defaultUser);
        });
    }

    // Get all entries for user
    @GetMapping
    public List<WorkDoneEntry> getAllEntries() {
        User user = getCurrentUser();
        if (user == null) return List.of();
        return workDoneRepository.findByUserOrderByDateDesc(user);
    }

    // Get specific entry by ID
    @GetMapping("/{id}")
    public ResponseEntity<WorkDoneEntry> getEntry(@PathVariable Long id) {
        return workDoneRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    // Get entry by date
    @GetMapping("/date/{date}")
    public ResponseEntity<WorkDoneEntry> getEntryByDate(@PathVariable String date) {
        User user = getCurrentUser();
        if (user == null) return ResponseEntity.notFound().build();
        
        LocalDate localDate = LocalDate.parse(date);
        return workDoneRepository.findByUserAndDate(user, localDate)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.ok(createEmptyEntry(localDate)));
    }

    // Get entries for a week
    @GetMapping("/week")
    public List<WorkDoneEntry> getWeekEntries(@RequestParam String startDate) {
        User user = getCurrentUser();
        if (user == null) return List.of();
        
        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = start.plusDays(6);
        return workDoneRepository.findByUserAndDateBetweenOrderByDateAsc(user, start, end);
    }

    // Create new entry
    @PostMapping
    public WorkDoneEntry createEntry(@RequestBody WorkDoneEntry entry) {
        User user = getCurrentUser();
        entry.setUser(user);
        
        if (entry.getDate() == null) {
            entry.setDate(LocalDate.now());
        }
        
        // Set day of week
        entry.setDayOfWeek(entry.getDate().getDayOfWeek()
            .getDisplayName(TextStyle.FULL, Locale.ENGLISH));
        
        // Link items to entry
        if (entry.getItems() != null) {
            for (WorkDoneItem item : entry.getItems()) {
                item.setWorkDoneEntry(entry);
            }
        }
        
        // Calculate total points
        entry.calculateTotalPoints();
        
        return workDoneRepository.save(entry);
    }

    // Update entry
    @PutMapping("/{id}")
    public ResponseEntity<WorkDoneEntry> updateEntry(@PathVariable Long id, @RequestBody WorkDoneEntry updatedEntry) {
        return workDoneRepository.findById(id)
            .map(entry -> {
                entry.setDate(updatedEntry.getDate());
                entry.setDayOfWeek(updatedEntry.getDate().getDayOfWeek()
                    .getDisplayName(TextStyle.FULL, Locale.ENGLISH));
                entry.setSatisfactionLevel(updatedEntry.getSatisfactionLevel());
                entry.setNotes(updatedEntry.getNotes());
                
                // Clear and re-add items
                entry.getItems().clear();
                if (updatedEntry.getItems() != null) {
                    for (WorkDoneItem item : updatedEntry.getItems()) {
                        item.setWorkDoneEntry(entry);
                        entry.getItems().add(item);
                    }
                }
                
                entry.calculateTotalPoints();
                return ResponseEntity.ok(workDoneRepository.save(entry));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    // Delete entry
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEntry(@PathVariable Long id) {
        if (!workDoneRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        workDoneRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // Get points summary
    @GetMapping("/points/summary")
    public Map<String, Object> getPointsSummary() {
        User user = getCurrentUser();
        Map<String, Object> summary = new HashMap<>();
        
        if (user == null) {
            summary.put("totalPoints", 0);
            summary.put("weeklyPoints", 0);
            summary.put("breakdown", List.of());
            return summary;
        }
        
        Integer totalPoints = workDoneRepository.getTotalPointsByUser(user);
        summary.put("totalPoints", totalPoints != null ? totalPoints : 0);
        
        // This week's points
        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        Integer weeklyPoints = workDoneRepository.getPointsByUserAndDateRange(user, weekStart, today);
        summary.put("weeklyPoints", weeklyPoints != null ? weeklyPoints : 0);
        
        // Breakdown by recent entries
        List<WorkDoneEntry> recentEntries = workDoneRepository.findByUserOrderByDateDesc(user);
        List<Map<String, Object>> breakdown = recentEntries.stream()
            .limit(10)
            .map(entry -> {
                Map<String, Object> entryData = new HashMap<>();
                entryData.put("date", entry.getDate().toString());
                entryData.put("dayOfWeek", entry.getDayOfWeek());
                entryData.put("points", entry.getTotalPoints());
                entryData.put("itemCount", entry.getItems() != null ? entry.getItems().size() : 0);
                return entryData;
            })
            .collect(Collectors.toList());
        summary.put("breakdown", breakdown);
        
        return summary;
    }

    // Get weekly satisfaction data
    @GetMapping("/satisfaction/weekly")
    public List<Map<String, Object>> getWeeklySatisfaction(@RequestParam(required = false) String startDate) {
        User user = getCurrentUser();
        if (user == null) return List.of();
        
        LocalDate start;
        if (startDate != null) {
            start = LocalDate.parse(startDate);
        } else {
            start = LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        }
        LocalDate end = start.plusDays(6);
        
        List<WorkDoneEntry> entries = workDoneRepository.findByUserAndDateBetweenOrderByDateAsc(user, start, end);
        
        // Create a map for quick lookup
        Map<LocalDate, WorkDoneEntry> entryMap = entries.stream()
            .collect(Collectors.toMap(WorkDoneEntry::getDate, e -> e, (a, b) -> a));
        
        // Build response for each day of the week
        List<Map<String, Object>> result = new ArrayList<>();
        for (int i = 0; i < 7; i++) {
            LocalDate day = start.plusDays(i);
            Map<String, Object> dayData = new HashMap<>();
            dayData.put("date", day.toString());
            dayData.put("day", day.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH));
            
            WorkDoneEntry entry = entryMap.get(day);
            if (entry != null) {
                dayData.put("satisfaction", entry.getSatisfactionLevel());
                dayData.put("points", entry.getTotalPoints());
                dayData.put("hasEntry", true);
            } else {
                dayData.put("satisfaction", 0);
                dayData.put("points", 0);
                dayData.put("hasEntry", false);
            }
            result.add(dayData);
        }
        
        return result;
    }

    private WorkDoneEntry createEmptyEntry(LocalDate date) {
        WorkDoneEntry entry = new WorkDoneEntry();
        entry.setDate(date);
        entry.setDayOfWeek(date.getDayOfWeek().getDisplayName(TextStyle.FULL, Locale.ENGLISH));
        entry.setItems(new ArrayList<>());
        entry.setSatisfactionLevel(3);
        entry.setTotalPoints(0);
        return entry;
    }
}
