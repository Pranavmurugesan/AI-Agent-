package com.ailead.conversion.dto;

import com.ailead.conversion.entity.ActivityType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class ActivityLogRequest {

    @NotNull(message = "Activity type is required")
    private ActivityType type;

    @NotBlank(message = "Summary is required")
    @Size(max = 255, message = "Summary must not exceed 255 characters")
    private String summary;

    private String details;

    private String metadata;

    public ActivityLogRequest() {
    }

    public ActivityLogRequest(ActivityType type, String summary, String details, String metadata) {
        this.type = type;
        this.summary = summary;
        this.details = details;
        this.metadata = metadata;
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
}
