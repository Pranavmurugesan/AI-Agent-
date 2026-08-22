package com.ailead.conversion.dto;

import com.ailead.conversion.entity.Organization;

import java.time.Instant;
import java.util.UUID;

public class OrganizationResponse {
    private UUID id;
    private String name;
    private String slug;
    private boolean active;
    private Instant createdAt;

    public OrganizationResponse() {
    }

    public OrganizationResponse(UUID id, String name, String slug, boolean active, Instant createdAt) {
        this.id = id;
        this.name = name;
        this.slug = slug;
        this.active = active;
        this.createdAt = createdAt;
    }

    public static OrganizationResponse fromEntity(Organization organization) {
        if (organization == null) return null;
        return new OrganizationResponse(
                organization.getId(),
                organization.getName(),
                organization.getSlug(),
                organization.isActive(),
                organization.getCreatedAt()
        );
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
