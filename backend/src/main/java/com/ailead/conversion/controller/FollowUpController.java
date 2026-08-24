package com.ailead.conversion.controller;

import com.ailead.conversion.dto.FollowUpCompleteRequest;
import com.ailead.conversion.dto.FollowUpCreateRequest;
import com.ailead.conversion.dto.FollowUpResponse;
import com.ailead.conversion.entity.FollowUpStatus;
import com.ailead.conversion.security.UserPrincipal;
import com.ailead.conversion.service.FollowUpService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
public class FollowUpController {

    private final FollowUpService followUpService;

    public FollowUpController(FollowUpService followUpService) {
        this.followUpService = followUpService;
    }

    @GetMapping("/api/v1/follow-ups")
    public ResponseEntity<List<FollowUpResponse>> getFollowUps(
            @RequestParam(name = "status", required = false) FollowUpStatus status,
            @RequestParam(name = "todayOnly", defaultValue = "false") Boolean todayOnly,
            @RequestParam(name = "assignedToId", required = false) UUID assignedToId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(followUpService.getFollowUps(principal.getOrganizationId(), status, todayOnly, assignedToId, principal));
    }

    @PostMapping("/api/v1/leads/{leadId}/follow-ups")
    public ResponseEntity<FollowUpResponse> createFollowUp(
            @PathVariable("leadId") UUID leadId,
            @Valid @RequestBody FollowUpCreateRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        FollowUpResponse response = followUpService.createFollowUp(principal.getOrganizationId(), leadId, request, principal);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PatchMapping("/api/v1/follow-ups/{id}/complete")
    public ResponseEntity<FollowUpResponse> completeFollowUp(
            @PathVariable("id") UUID id,
            @RequestBody(required = false) FollowUpCompleteRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(followUpService.completeFollowUp(principal.getOrganizationId(), id, request, principal));
    }

    @PatchMapping("/api/v1/follow-ups/{id}/cancel")
    public ResponseEntity<FollowUpResponse> cancelFollowUp(
            @PathVariable("id") UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(followUpService.cancelFollowUp(principal.getOrganizationId(), id, principal));
    }
}
