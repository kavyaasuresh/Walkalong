package com.walkalong.backend.controller;

import com.walkalong.backend.entity.LearningTask;
import com.walkalong.backend.service.ViewPlanService;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/view-plan")
@CrossOrigin
public class ViewPlanController {


    private final ViewPlanService viewPlanService;


    public ViewPlanController(ViewPlanService viewPlanService) {
        this.viewPlanService = viewPlanService;
    }


    @GetMapping("/daily")
    public List<LearningTask> getDailyPlan(@RequestParam(required = false) LocalDate date) {
        return viewPlanService.getDailyTasks(date != null ? date : LocalDate.now());
    }


    @GetMapping("/weekly")
    public List<LearningTask> getWeeklyPlan(@RequestParam(required = false) LocalDate date) {
        return viewPlanService.getWeeklyTasks(date != null ? date : LocalDate.now());
    }


    @GetMapping("/monthly")
    public List<LearningTask> getMonthlyPlan(@RequestParam(required = false) LocalDate date) {
        return viewPlanService.getMonthlyTasks(date != null ? date : LocalDate.now());
    }
}