package com.ailead.conversion.controller;

import com.ailead.conversion.dto.OrganizationResponse;
import com.ailead.conversion.security.UserPrincipal;
import com.ailead.conversion.service.OrganizationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/organizations")
public class OrganizationController {

    private final OrganizationService organizationService;

    public OrganizationController(OrganizationService organizationService) {
        this.organizationService = organizationService;
    }

    @GetMapping("/me")
    public ResponseEntity<OrganizationResponse> getCurrentOrganization(@AuthenticationPrincipal UserPrincipal principal) {
        OrganizationResponse response = organizationService.getCurrentOrganization(principal);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{organizationId}")
    public ResponseEntity<OrganizationResponse> getOrganizationById(
            @PathVariable UUID organizationId,
            @AuthenticationPrincipal UserPrincipal principal) {
        OrganizationResponse response = organizationService.getOrganizationForTenant(organizationId, principal);
        return ResponseEntity.ok(response);
    }
}
