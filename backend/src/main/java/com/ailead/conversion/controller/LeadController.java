package com.ailead.conversion.controller;

import com.ailead.conversion.dto.*;
import com.ailead.conversion.entity.LeadPriority;
import com.ailead.conversion.entity.LeadSource;
import com.ailead.conversion.entity.LeadStatus;
import com.ailead.conversion.security.UserPrincipal;
import com.ailead.conversion.service.LeadService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/leads")
public class LeadController {

    private final LeadService leadService;

    public LeadController(LeadService leadService) {
        this.leadService = leadService;
    }

    @GetMapping
    public ResponseEntity<LeadPageResponse> getLeads(
            @RequestParam(name = "search", required = false) String search,
            @RequestParam(name = "status", required = false) LeadStatus status,
            @RequestParam(name = "courseId", required = false) UUID courseId,
            @RequestParam(name = "assignedToId", required = false) UUID assignedToId,
            @RequestParam(name = "source", required = false) LeadSource source,
            @RequestParam(name = "priority", required = false) LeadPriority priority,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size,
            @RequestParam(name = "sortBy", defaultValue = "createdAt") String sortBy,
            @RequestParam(name = "sortDir", defaultValue = "desc") String sortDir,
            @AuthenticationPrincipal UserPrincipal principal) {

        LeadPageResponse response = leadService.getLeads(
                principal.getOrganizationId(),
                search, status, courseId, assignedToId, source, priority,
                page, size, sortBy, sortDir, principal
        );
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<LeadResponse> createLead(
            @Valid @RequestBody LeadCreateRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        LeadResponse response = leadService.createLead(principal.getOrganizationId(), request, principal);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<LeadResponse> getLead(
            @PathVariable("id") UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(leadService.getLead(principal.getOrganizationId(), id, principal));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LeadResponse> updateLead(
            @PathVariable("id") UUID id,
            @Valid @RequestBody LeadUpdateRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(leadService.updateLead(principal.getOrganizationId(), id, request, principal));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'COUNSELOR')")
    public ResponseEntity<LeadResponse> updateLeadStatus(
            @PathVariable("id") UUID id,
            @Valid @RequestBody LeadStatusUpdateRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(leadService.updateLeadStatus(principal.getOrganizationId(), id, request, principal));
    }

    @PostMapping("/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<LeadResponse> assignLead(
            @PathVariable("id") UUID id,
            @RequestBody LeadAssignRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(leadService.assignLead(principal.getOrganizationId(), id, request, principal));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteLead(
            @PathVariable("id") UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {
        leadService.softDeleteLead(principal.getOrganizationId(), id, principal);
        return ResponseEntity.ok(Map.of("message", "Lead soft-deleted successfully"));
    }
}
