package com.ailead.conversion.repository;

import com.ailead.conversion.entity.Lead;
import com.ailead.conversion.entity.LeadSource;
import com.ailead.conversion.entity.LeadStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LeadRepository extends JpaRepository<Lead, UUID>, JpaSpecificationExecutor<Lead> {

    Optional<Lead> findByIdAndOrganizationIdAndDeletedFalse(UUID id, UUID organizationId);

    Optional<Lead> findByIdAndOrganizationId(UUID id, UUID organizationId);

    Optional<Lead> findFirstByOrganizationIdAndNormalizedPhoneAndDeletedFalseOrderByCreatedAtDesc(UUID organizationId, String normalizedPhone);

    long countByOrganizationIdAndDeletedFalse(UUID organizationId);

    long countByOrganizationIdAndStatusAndDeletedFalse(UUID organizationId, LeadStatus status);

    long countByOrganizationIdAndAssignedToIdAndDeletedFalse(UUID organizationId, UUID assignedToId);

    long countByOrganizationIdAndAssignedToIdAndStatusAndDeletedFalse(UUID organizationId, UUID assignedToId, LeadStatus status);

    @Query("SELECT l.source AS source, COUNT(l) AS count FROM Lead l WHERE l.organization.id = :orgId AND l.deleted = false GROUP BY l.source")
    List<Object[]> countBySourceGroupByOrganizationId(@Param("orgId") UUID orgId);
}
