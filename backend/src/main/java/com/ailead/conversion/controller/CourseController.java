package com.ailead.conversion.controller;

import com.ailead.conversion.dto.CourseRequest;
import com.ailead.conversion.dto.CourseResponse;
import com.ailead.conversion.security.UserPrincipal;
import com.ailead.conversion.service.CourseService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/courses")
public class CourseController {

    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    @GetMapping
    public ResponseEntity<List<CourseResponse>> getCourses(
            @RequestParam(name = "includeInactive", defaultValue = "false") boolean includeInactive,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(courseService.getCourses(principal.getOrganizationId(), includeInactive));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CourseResponse> getCourse(
            @PathVariable("id") UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(courseService.getCourse(principal.getOrganizationId(), id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CourseResponse> createCourse(
            @Valid @RequestBody CourseRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        CourseResponse response = courseService.createCourse(principal.getOrganizationId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CourseResponse> updateCourse(
            @PathVariable("id") UUID id,
            @Valid @RequestBody CourseRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(courseService.updateCourse(principal.getOrganizationId(), id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteCourse(
            @PathVariable("id") UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {
        courseService.deleteCourse(principal.getOrganizationId(), id);
        return ResponseEntity.ok(Map.of("message", "Course deactivated successfully"));
    }
}
