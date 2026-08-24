package com.ailead.conversion.dto;

import com.ailead.conversion.entity.Lead;
import com.ailead.conversion.entity.LeadPriority;
import com.ailead.conversion.entity.LeadSource;
import com.ailead.conversion.entity.LeadStatus;
import java.time.Instant;
import java.util.UUID;

public class LeadResponse {

    private UUID id;
    private String name;
    private String phone;
    private String normalizedPhone;
    private String email;
    private CourseSummaryDto course;
    private LeadSource source;
    private LeadStatus status;
    private LeadPriority priority;
    private UserSummaryDto assignedTo;
    private String notes;
    private Instant createdAt;
    private Instant updatedAt;

    public LeadResponse() {
    }

    public static LeadResponse fromEntity(Lead lead) {
        if (lead == null) return null;
        LeadResponse response = new LeadResponse();
        response.setId(lead.getId());
        response.setName(lead.getName());
        response.setPhone(lead.getPhone());
        response.setNormalizedPhone(lead.getNormalizedPhone());
        response.setEmail(lead.getEmail());
        if (lead.getCourse() != null) {
            response.setCourse(new CourseSummaryDto(
                    lead.getCourse().getId(),
                    lead.getCourse().getName(),
                    lead.getCourse().getCode(),
                    lead.getCourse().getFee()
            ));
        }
        response.setSource(lead.getSource());
        response.setStatus(lead.getStatus());
        response.setPriority(lead.getPriority());
        if (lead.getAssignedTo() != null) {
            response.setAssignedTo(new UserSummaryDto(
                    lead.getAssignedTo().getId(),
                    lead.getAssignedTo().getName(),
                    lead.getAssignedTo().getEmail(),
                    lead.getAssignedTo().getRole().name()
            ));
        }
        response.setNotes(lead.getNotes());
        response.setCreatedAt(lead.getCreatedAt());
        response.setUpdatedAt(lead.getUpdatedAt());
        return response;
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

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getNormalizedPhone() {
        return normalizedPhone;
    }

    public void setNormalizedPhone(String normalizedPhone) {
        this.normalizedPhone = normalizedPhone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public CourseSummaryDto getCourse() {
        return course;
    }

    public void setCourse(CourseSummaryDto course) {
        this.course = course;
    }

    public LeadSource getSource() {
        return source;
    }

    public void setSource(LeadSource source) {
        this.source = source;
    }

    public LeadStatus getStatus() {
        return status;
    }

    public void setStatus(LeadStatus status) {
        this.status = status;
    }

    public LeadPriority getPriority() {
        return priority;
    }

    public void setPriority(LeadPriority priority) {
        this.priority = priority;
    }

    public UserSummaryDto getAssignedTo() {
        return assignedTo;
    }

    public void setAssignedTo(UserSummaryDto assignedTo) {
        this.assignedTo = assignedTo;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
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

    public static class CourseSummaryDto {
        private UUID id;
        private String name;
        private String code;
        private java.math.BigDecimal fee;

        public CourseSummaryDto() {}
        public CourseSummaryDto(UUID id, String name, String code, java.math.BigDecimal fee) {
            this.id = id;
            this.name = name;
            this.code = code;
            this.fee = fee;
        }

        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
        public java.math.BigDecimal getFee() { return fee; }
        public void setFee(java.math.BigDecimal fee) { this.fee = fee; }
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
