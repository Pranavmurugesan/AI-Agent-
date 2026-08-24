package com.ailead.conversion.repository;

import com.ailead.conversion.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CourseRepository extends JpaRepository<Course, UUID> {

    List<Course> findByOrganizationIdAndActiveTrueOrderByNameAsc(UUID organizationId);

    List<Course> findByOrganizationIdOrderByNameAsc(UUID organizationId);

    Optional<Course> findByIdAndOrganizationId(UUID id, UUID organizationId);

    boolean existsByOrganizationIdAndNameIgnoreCase(UUID organizationId, String name);

    boolean existsByOrganizationIdAndNameIgnoreCaseAndIdNot(UUID organizationId, String name, UUID id);
}
