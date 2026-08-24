package com.ailead.conversion.repository;

import com.ailead.conversion.entity.FollowUp;
import com.ailead.conversion.entity.FollowUpStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FollowUpRepository extends JpaRepository<FollowUp, UUID>, JpaSpecificationExecutor<FollowUp> {

    Optional<FollowUp> findByIdAndOrganizationId(UUID id, UUID organizationId);

    List<FollowUp> findByOrganizationIdAndLeadIdOrderByScheduledAtDesc(UUID organizationId, UUID leadId);

    List<FollowUp> findByOrganizationIdAndAssignedToIdOrderByScheduledAtAsc(UUID organizationId, UUID assignedToId);

    List<FollowUp> findByOrganizationIdOrderByScheduledAtAsc(UUID organizationId);

    long countByOrganizationIdAndStatusAndScheduledAtBetween(UUID organizationId, FollowUpStatus status, Instant start, Instant end);

    long countByOrganizationIdAndStatusAndScheduledAtBefore(UUID organizationId, FollowUpStatus status, Instant before);

    long countByOrganizationIdAndStatusAndCompletedAtBetween(UUID organizationId, FollowUpStatus status, Instant start, Instant end);

    long countByOrganizationIdAndAssignedToIdAndStatusAndScheduledAtBetween(UUID organizationId, UUID assignedToId, FollowUpStatus status, Instant start, Instant end);

    long countByOrganizationIdAndAssignedToIdAndStatusAndScheduledAtBefore(UUID organizationId, UUID assignedToId, FollowUpStatus status, Instant before);

    long countByOrganizationIdAndAssignedToIdAndStatusAndCompletedAtBetween(UUID organizationId, UUID assignedToId, FollowUpStatus status, Instant start, Instant end);
}
