package com.ailead.conversion.dto;

import com.ailead.conversion.entity.LeadPriority;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.UUID;

public class FollowUpCreateRequest {

    private UUID assignedToUserId; // Nullable -> defaults to authenticated user or assigned counselor

    @NotNull(message = "Scheduled date/time is required")
    private Instant scheduledAt;

    private LeadPriority priority = LeadPriority.MEDIUM;

    private String notes;

    public FollowUpCreateRequest() {
    }

    public FollowUpCreateRequest(UUID assignedToUserId, Instant scheduledAt, LeadPriority priority, String notes) {
        this.assignedToUserId = assignedToUserId;
        this.scheduledAt = scheduledAt;
        this.priority = priority != null ? priority : LeadPriority.MEDIUM;
        this.notes = notes;
    }

    public UUID getAssignedToUserId() {
        return assignedToUserId;
    }

    public void setAssignedToUserId(UUID assignedToUserId) {
        this.assignedToUserId = assignedToUserId;
    }

    public Instant getScheduledAt() {
        return scheduledAt;
    }

    public void setScheduledAt(Instant scheduledAt) {
        this.scheduledAt = scheduledAt;
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
}
