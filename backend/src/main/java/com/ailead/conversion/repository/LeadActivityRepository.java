package com.ailead.conversion.repository;

import com.ailead.conversion.entity.LeadActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LeadActivityRepository extends JpaRepository<LeadActivity, UUID> {

    List<LeadActivity> findByOrganizationIdAndLeadIdOrderByCreatedAtDesc(UUID organizationId, UUID leadId);
}
