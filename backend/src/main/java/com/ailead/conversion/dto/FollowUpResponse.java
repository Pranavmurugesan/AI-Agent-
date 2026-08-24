package com.ailead.conversion.dto;

import com.ailead.conversion.entity.FollowUp;
import com.ailead.conversion.entity.FollowUpStatus;
import com.ailead.conversion.entity.LeadPriority;
import java.time.Instant;
import java.util.UUID;

public class FollowUpResponse {

    private UUID id;
    private UUID leadId;
    private String leadName;
    private String leadPhone;
    private UserSummaryDto assignedTo;
    private Instant scheduledAt;
    private FollowUpStatus status;
    private LeadPriority priority;
    private String notes;
    private String outcomeNotes;
    private Instant completedAt;
    private boolean overdue;
    private Instant createdAt;
    private Instant updatedAt;

    public FollowUpResponse() {
    }

    public static FollowUpResponse fromEntity(FollowUp followUp) {
        if (followUp == null) return null;
        FollowUpResponse response = new FollowUpResponse();
        response.setId(followUp.getId());
        response.setLeadId(followUp.getLead().getId());
        response.setLeadName(followUp.getLead().getName());
        response.setLeadPhone(followUp.getLead().getPhone());
        if (followUp.getAssignedTo() != null) {
            response.setAssignedTo(new UserSummaryDto(
                    followUp.getAssignedTo().getId(),
                    followUp.getAssignedTo().getName(),
                    followUp.getAssignedTo().getEmail(),
                    followUp.getAssignedTo().getRole().name()
            ));
        }
        response.setScheduledAt(followUp.getScheduledAt());
        response.setStatus(followUp.getStatus());
        response.setPriority(followUp.getPriority());
        response.setNotes(followUp.getNotes());
        response.setOutcomeNotes(followUp.getOutcomeNotes());
        response.setCompletedAt(followUp.getCompletedAt());
        response.setOverdue(followUp.getStatus() == FollowUpStatus.PENDING && followUp.getScheduledAt().isBefore(Instant.now()));
        response.setCreatedAt(followUp.getCreatedAt());
        response.setUpdatedAt(followUp.getUpdatedAt());
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

    public String getLeadName() {
        return leadName;
    }

    public void setLeadName(String leadName) {
        this.leadName = leadName;
    }

    public String getLeadPhone() {
        return leadPhone;
    }

    public void setLeadPhone(String leadPhone) {
        this.leadPhone = leadPhone;
    }

    public UserSummaryDto getAssignedTo() {
        return assignedTo;
    }

    public void setAssignedTo(UserSummaryDto assignedTo) {
        this.assignedTo = assignedTo;
    }

    public Instant getScheduledAt() {
        return scheduledAt;
    }

    public void setScheduledAt(Instant scheduledAt) {
        this.scheduledAt = scheduledAt;
    }

    public FollowUpStatus getStatus() {
        return status;
    }

    public void setStatus(FollowUpStatus status) {
        this.status = status;
    }

    public LeadPriority getPriority() {
        return priority;
    }

    public void setPriority(LeadPriority priority) {
        this.priority = priority;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getOutcomeNotes() {
        return outcomeNotes;
    }

    public void setOutcomeNotes(String outcomeNotes) {
        this.outcomeNotes = outcomeNotes;
    }

    public Instant getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(Instant completedAt) {
        this.completedAt = completedAt;
    }

    public boolean isOverdue() {
        return overdue;
    }

    public void setOverdue(boolean overdue) {
        this.overdue = overdue;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
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
