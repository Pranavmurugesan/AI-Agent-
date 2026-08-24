package com.ailead.conversion.dto;

import com.ailead.conversion.entity.ActivityType;
import com.ailead.conversion.entity.LeadActivity;
import java.time.Instant;
import java.util.UUID;

public class ActivityResponse {

    private UUID id;
    private UUID leadId;
    private ActivityType type;
    private String summary;
    private String details;
    private String metadata;
    private UserSummaryDto performedBy;
    private Instant createdAt;

    public ActivityResponse() {
    }

    public static ActivityResponse fromEntity(LeadActivity activity) {
        if (activity == null) return null;
        ActivityResponse response = new ActivityResponse();
        response.setId(activity.getId());
        response.setLeadId(activity.getLead().getId());
        response.setType(activity.getType());
        response.setSummary(activity.getSummary());
        response.setDetails(activity.getDetails());
        response.setMetadata(activity.getMetadata());
        if (activity.getPerformedBy() != null) {
            response.setPerformedBy(new UserSummaryDto(
                    activity.getPerformedBy().getId(),
                    activity.getPerformedBy().getName(),
                    activity.getPerformedBy().getEmail(),
                    activity.getPerformedBy().getRole().name()
            ));
        }
        response.setCreatedAt(activity.getCreatedAt());
        return response;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getLeadId() {
        return leadId;
    }

    public void setLeadId(UUID leadId) {
        this.leadId = leadId;
    }

    public ActivityType getType() {
        return type;
    }

    public void setType(ActivityType type) {
        this.type = type;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public String getMetadata() {
        return metadata;
    }

    public void setMetadata(String metadata) {
        this.metadata = metadata;
    }

    public UserSummaryDto getPerformedBy() {
        return performedBy;
    }

    public void setPerformedBy(UserSummaryDto performedBy) {
        this.performedBy = performedBy;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public static class UserSummaryDto {
        private UUID id;
        private String name;
        private String email;
        private String role;

        public UserSummaryDto() {}
        public UserSummaryDto(UUID id, String name, String email, String role) {
            this.id = id;
            this.name = name;
            this.email = email;
            this.role = role;
        }

        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
    }
}
