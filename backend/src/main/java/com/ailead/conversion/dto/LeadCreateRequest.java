package com.ailead.conversion.dto;

import com.ailead.conversion.entity.LeadPriority;
import com.ailead.conversion.entity.LeadSource;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public class LeadCreateRequest {

    @NotBlank(message = "Student/Contact name is required")
    @Size(max = 150, message = "Name must not exceed 150 characters")
    private String name;

    @NotBlank(message = "Phone number is required")
    @Size(min = 7, max = 50, message = "Phone must be between 7 and 50 characters")
    private String phone;

    @Email(message = "Email format is invalid")
    @Size(max = 255, message = "Email must not exceed 255 characters")
    private String email;

    private UUID courseId;

    private LeadSource source = LeadSource.WEBSITE;

    private LeadPriority priority = LeadPriority.MEDIUM;

    private UUID assignedToUserId;

    private String notes;

    public LeadCreateRequest() {
    }

    public LeadCreateRequest(String name, String phone, String email, UUID courseId, LeadSource source,
                             LeadPriority priority, UUID assignedToUserId, String notes) {
        this.name = name;
        this.phone = phone;
        this.email = email;
        this.courseId = courseId;
        this.source = source != null ? source : LeadSource.WEBSITE;
        this.priority = priority != null ? priority : LeadPriority.MEDIUM;
        this.assignedToUserId = assignedToUserId;
        this.notes = notes;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public UUID getCourseId() {
        return courseId;
    }

    public void setCourseId(UUID courseId) {
        this.courseId = courseId;
    }

    public LeadSource getSource() {
        return source;
    }

    public void setSource(LeadSource source) {
        this.source = source;
    }

    public LeadPriority getPriority() {
        return priority;
    }

    public void setPriority(LeadPriority priority) {
        this.priority = priority;
    }

    public UUID getAssignedToUserId() {
        return assignedToUserId;
    }

    public void setAssignedToUserId(UUID assignedToUserId) {
        this.assignedToUserId = assignedToUserId;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
