package com.ailead.conversion.dto;

import java.util.UUID;

public class LeadAssignRequest {

    private UUID assignedToUserId; // Nullable if unassigning
    private String remarks;

    public LeadAssignRequest() {
    }

    public LeadAssignRequest(UUID assignedToUserId, String remarks) {
        this.assignedToUserId = assignedToUserId;
        this.remarks = remarks;
    }

    public UUID getAssignedToUserId() {
        return assignedToUserId;
    }

    public void setAssignedToUserId(UUID assignedToUserId) {
        this.assignedToUserId = assignedToUserId;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}
