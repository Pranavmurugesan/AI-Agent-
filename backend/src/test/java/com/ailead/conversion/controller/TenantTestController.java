package com.ailead.conversion.controller;

import com.ailead.conversion.security.UserPrincipal;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.UUID;

/**
 * Test-only mock controller strictly isolated to src/test/java and guarded by @Profile("test").
 * This controller is NOT compiled into the production artifact and is never exposed in production.
 */
@RestController
@RequestMapping("/api/v1/test/tenant-resources")
@Profile("test")
public class TenantTestController {

    private void enforceTenantMatch(UUID targetOrgId, UserPrincipal principal) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthenticated");
        }
        if (!principal.getOrganizationId().equals(targetOrgId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cross-tenant access denied");
        }
    }

    @GetMapping("/{targetOrgId}")
    public ResponseEntity<Map<String, String>> testGet(
            @PathVariable UUID targetOrgId,
            @AuthenticationPrincipal UserPrincipal principal) {
        enforceTenantMatch(targetOrgId, principal);
        return ResponseEntity.ok(Map.of("status", "SUCCESS", "method", "GET", "tenantId", targetOrgId.toString()));
    }

    @PostMapping("/{targetOrgId}")
    public ResponseEntity<Map<String, String>> testPost(
            @PathVariable UUID targetOrgId,
            @AuthenticationPrincipal UserPrincipal principal) {
        enforceTenantMatch(targetOrgId, principal);
        return ResponseEntity.ok(Map.of("status", "SUCCESS", "method", "POST", "tenantId", targetOrgId.toString()));
    }

    @PutMapping("/{targetOrgId}")
    public ResponseEntity<Map<String, String>> testPut(
            @PathVariable UUID targetOrgId,
            @AuthenticationPrincipal UserPrincipal principal) {
        enforceTenantMatch(targetOrgId, principal);
        return ResponseEntity.ok(Map.of("status", "SUCCESS", "method", "PUT", "tenantId", targetOrgId.toString()));
    }

    @PatchMapping("/{targetOrgId}")
    public ResponseEntity<Map<String, String>> testPatch(
            @PathVariable UUID targetOrgId,
            @AuthenticationPrincipal UserPrincipal principal) {
        enforceTenantMatch(targetOrgId, principal);
        return ResponseEntity.ok(Map.of("status", "SUCCESS", "method", "PATCH", "tenantId", targetOrgId.toString()));
    }

    @DeleteMapping("/{targetOrgId}")
    public ResponseEntity<Map<String, String>> testDelete(
            @PathVariable UUID targetOrgId,
            @AuthenticationPrincipal UserPrincipal principal) {
        enforceTenantMatch(targetOrgId, principal);
        return ResponseEntity.ok(Map.of("status", "SUCCESS", "method", "DELETE", "tenantId", targetOrgId.toString()));
    }

    @PostMapping("/body-check")
    public ResponseEntity<Map<String, String>> testBodyIdor(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthenticated");
        }
        String targetOrgIdStr = body.get("organizationId");
        if (targetOrgIdStr != null) {
            UUID targetOrgId = UUID.fromString(targetOrgIdStr);
            enforceTenantMatch(targetOrgId, principal);
        }
        return ResponseEntity.ok(Map.of("status", "SUCCESS", "method", "BODY_CHECK"));
    }

    @GetMapping("/query-check")
    public ResponseEntity<Map<String, String>> testQueryIdor(
            @RequestParam UUID organizationId,
            @AuthenticationPrincipal UserPrincipal principal) {
        enforceTenantMatch(organizationId, principal);
        return ResponseEntity.ok(Map.of("status", "SUCCESS", "method", "QUERY_CHECK", "tenantId", organizationId.toString()));
    }

    @GetMapping("/admin-only")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> testAdminOnly(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(Map.of("status", "SUCCESS", "role", principal.getRole().name()));
    }
}
