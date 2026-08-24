package com.ailead.conversion.controller;

import com.ailead.conversion.dto.DashboardMetricsResponse;
import com.ailead.conversion.security.UserPrincipal;
import com.ailead.conversion.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/metrics")
    public ResponseEntity<DashboardMetricsResponse> getMetrics(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(dashboardService.getMetrics(principal.getOrganizationId(), principal));
    }
}
