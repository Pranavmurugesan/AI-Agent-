package com.ailead.conversion.dto;

import com.ailead.conversion.entity.Course;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public class CourseResponse {

    private UUID id;
    private String name;
    private String code;
    private String description;
    private String duration;
    private BigDecimal fee;
    private boolean active;
    private Instant createdAt;
    private Instant updatedAt;

    public CourseResponse() {
    }

    public CourseResponse(UUID id, String name, String code, String description, String duration, BigDecimal fee, boolean active, Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.name = name;
        this.code = code;
        this.description = description;
        this.duration = duration;
        this.fee = fee;
        this.active = active;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static CourseResponse fromEntity(Course course) {
        if (course == null) return null;
        return new CourseResponse(
                course.getId(),
                course.getName(),
                course.getCode(),
                course.getDescription(),
                course.getDuration(),
                course.getFee(),
                course.isActive(),
                course.getCreatedAt(),
                course.getUpdatedAt()
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

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getDuration() {
        return duration;
    }

    public void setDuration(String duration) {
        this.duration = duration;
    }

    public BigDecimal getFee() {
        return fee;
    }

    public void setFee(BigDecimal fee) {
        this.fee = fee;
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

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
