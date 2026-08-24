package com.ailead.conversion.dto;

import com.ailead.conversion.entity.LeadStatus;
import jakarta.validation.constraints.NotNull;

public class LeadStatusUpdateRequest {

    @NotNull(message = "Status is required")
    private LeadStatus status;

    private String remarks;

    public LeadStatusUpdateRequest() {
    }

    public LeadStatusUpdateRequest(LeadStatus status, String remarks) {
        this.status = status;
        this.remarks = remarks;
    }

    public LeadStatus getStatus() {
        return status;
    }

    public void setStatus(LeadStatus status) {
        this.status = status;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}
