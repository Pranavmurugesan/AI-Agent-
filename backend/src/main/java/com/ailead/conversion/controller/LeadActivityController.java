package com.ailead.conversion.controller;

import com.ailead.conversion.dto.ActivityLogRequest;
import com.ailead.conversion.dto.ActivityResponse;
import com.ailead.conversion.security.UserPrincipal;
import com.ailead.conversion.service.LeadActivityService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/leads/{leadId}/activities")
public class LeadActivityController {

    private final LeadActivityService activityService;

    public LeadActivityController(LeadActivityService activityService) {
        this.activityService = activityService;
    }

    @GetMapping
    public ResponseEntity<List<ActivityResponse>> getLeadActivities(
            @PathVariable("leadId") UUID leadId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(activityService.getLeadActivities(principal.getOrganizationId(), leadId, principal));
    }

    @PostMapping
    public ResponseEntity<ActivityResponse> logActivity(
            @PathVariable("leadId") UUID leadId,
            @Valid @RequestBody ActivityLogRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        ActivityResponse response = activityService.logManualActivity(principal.getOrganizationId(), leadId, request, principal);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
