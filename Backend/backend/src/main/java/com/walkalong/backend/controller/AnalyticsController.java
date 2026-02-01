package com.walkalong.backend.controller;
import com.walkalong.backend.service.AnalyticsService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;


@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin
public class AnalyticsController {


    private final AnalyticsService analyticsService;


    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }


    @GetMapping

    public Map<String, Object> getDashboardData() {
        Map<String, Object> data = new HashMap<>();
        data.put("totalTasks", analyticsService.getTotalTasks());
        data.put("completedTasks", analyticsService.getCompletedTasks());
        data.put("learningRate", analyticsService.getLearningRate());
        return data;
    }
}