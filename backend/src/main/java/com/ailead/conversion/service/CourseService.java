package com.ailead.conversion.service;

import com.ailead.conversion.dto.CourseRequest;
import com.ailead.conversion.dto.CourseResponse;
import com.ailead.conversion.entity.Course;
import com.ailead.conversion.entity.Organization;
import com.ailead.conversion.repository.CourseRepository;
import com.ailead.conversion.repository.OrganizationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class CourseService {

    private final CourseRepository courseRepository;
    private final OrganizationRepository organizationRepository;

    public CourseService(CourseRepository courseRepository, OrganizationRepository organizationRepository) {
        this.courseRepository = courseRepository;
        this.organizationRepository = organizationRepository;
    }

    @Transactional(readOnly = true)
    public List<CourseResponse> getCourses(UUID organizationId, boolean includeInactive) {
        List<Course> courses = includeInactive
                ? courseRepository.findByOrganizationIdOrderByNameAsc(organizationId)
                : courseRepository.findByOrganizationIdAndActiveTrueOrderByNameAsc(organizationId);

        return courses.stream().map(CourseResponse::fromEntity).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CourseResponse getCourse(UUID organizationId, UUID courseId) {
        Course course = courseRepository.findByIdAndOrganizationId(courseId, organizationId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));
        return CourseResponse.fromEntity(course);
    }

    public CourseResponse createCourse(UUID organizationId, CourseRequest request) {
        if (courseRepository.existsByOrganizationIdAndNameIgnoreCase(organizationId, request.getName().trim())) {
            throw new IllegalArgumentException("A course with this name already exists in your organization");
        }

        Organization org = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new IllegalArgumentException("Organization not found"));

        Course course = new Course(
                UUID.randomUUID(),
                org,
                request.getName().trim(),
                request.getCode() != null ? request.getCode().trim() : null,
                request.getDescription(),
                request.getDuration(),
                request.getFee(),
                request.getActive() != null ? request.getActive() : true
        );

        Course saved = courseRepository.save(course);
        return CourseResponse.fromEntity(saved);
    }

    public CourseResponse updateCourse(UUID organizationId, UUID courseId, CourseRequest request) {
        Course course = courseRepository.findByIdAndOrganizationId(courseId, organizationId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));

        if (courseRepository.existsByOrganizationIdAndNameIgnoreCaseAndIdNot(organizationId, request.getName().trim(), courseId)) {
            throw new IllegalArgumentException("Another course with this name already exists in your organization");
        }

        course.setName(request.getName().trim());
        course.setCode(request.getCode() != null ? request.getCode().trim() : null);
        course.setDescription(request.getDescription());
        course.setDuration(request.getDuration());
        course.setFee(request.getFee());
        if (request.getActive() != null) {
            course.setActive(request.getActive());
        }

        Course saved = courseRepository.save(course);
        return CourseResponse.fromEntity(saved);
    }

    public void deleteCourse(UUID organizationId, UUID courseId) {
        Course course = courseRepository.findByIdAndOrganizationId(courseId, organizationId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));
        // Soft deactivate to avoid breaking historical leads
        course.setActive(false);
        courseRepository.save(course);
    }
}
