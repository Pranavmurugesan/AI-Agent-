package com.ailead.conversion.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public class CourseRequest {

    @NotBlank(message = "Course name is required")
    @Size(max = 150, message = "Course name must not exceed 150 characters")
    private String name;

    @Size(max = 50, message = "Course code must not exceed 50 characters")
    private String code;

    private String description;

    @Size(max = 100, message = "Duration must not exceed 100 characters")
    private String duration;

    @PositiveOrZero(message = "Fee must be a positive number or zero")
    private BigDecimal fee;

    private Boolean active;

    public CourseRequest() {
    }

    public CourseRequest(String name, String code, String description, String duration, BigDecimal fee, Boolean active) {
        this.name = name;
        this.code = code;
        this.description = description;
        this.duration = duration;
        this.fee = fee;
        this.active = active;
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

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}
