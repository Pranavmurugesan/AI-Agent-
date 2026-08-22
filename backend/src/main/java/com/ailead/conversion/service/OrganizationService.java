package com.ailead.conversion.service;

import com.ailead.conversion.dto.OrganizationResponse;
import com.ailead.conversion.entity.Organization;
import com.ailead.conversion.repository.OrganizationRepository;
import com.ailead.conversion.security.UserPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@Service
public class OrganizationService {

    private final OrganizationRepository organizationRepository;

    public OrganizationService(OrganizationRepository organizationRepository) {
        this.organizationRepository = organizationRepository;
    }

    @Transactional(readOnly = true)
    public OrganizationResponse getCurrentOrganization(UserPrincipal principal) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthenticated");
        }

        Organization organization = organizationRepository.findById(principal.getOrganizationId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Organization not found"));

        return OrganizationResponse.fromEntity(organization);
    }

    @Transactional(readOnly = true)
    public OrganizationResponse getOrganizationForTenant(UUID targetOrgId, UserPrincipal principal) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthenticated");
        }

        // Strict Tenant Isolation Rule: Reject cross-tenant requests if targetOrgId does not match principal's orgId
        if (!principal.getOrganizationId().equals(targetOrgId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cross-tenant access denied");
        }

        Organization organization = organizationRepository.findById(targetOrgId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Organization not found"));

        return OrganizationResponse.fromEntity(organization);
    }
}
