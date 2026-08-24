package com.ailead.conversion.service;

import com.ailead.conversion.dto.ActivityLogRequest;
import com.ailead.conversion.dto.ActivityResponse;
import com.ailead.conversion.entity.ActivityType;
import com.ailead.conversion.entity.Lead;
import com.ailead.conversion.entity.LeadActivity;
import com.ailead.conversion.entity.Role;
import com.ailead.conversion.entity.User;
import com.ailead.conversion.repository.LeadActivityRepository;
import com.ailead.conversion.repository.LeadRepository;
import com.ailead.conversion.repository.UserRepository;
import com.ailead.conversion.security.UserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class LeadActivityService {

    private final LeadActivityRepository activityRepository;
    private final LeadRepository leadRepository;
    private final UserRepository userRepository;

    public LeadActivityService(LeadActivityRepository activityRepository, LeadRepository leadRepository, UserRepository userRepository) {
        this.activityRepository = activityRepository;
        this.leadRepository = leadRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<ActivityResponse> getLeadActivities(UUID organizationId, UUID leadId, UserPrincipal principal) {
        Lead lead = leadRepository.findByIdAndOrganizationId(leadId, organizationId)
                .orElseThrow(() -> new IllegalArgumentException("Lead not found"));

        // Scoping check for counselors: only view activities for assigned leads or unassigned leads
        if (principal.getRole() == Role.COUNSELOR && lead.getAssignedTo() != null && !lead.getAssignedTo().getId().equals(principal.getId())) {
            throw new org.springframework.security.access.AccessDeniedException("You can only view activities of leads assigned to you");
        }

        List<LeadActivity> activities = activityRepository.findByOrganizationIdAndLeadIdOrderByCreatedAtDesc(organizationId, leadId);
        return activities.stream().map(ActivityResponse::fromEntity).collect(Collectors.toList());
    }

    public LeadActivity recordActivity(Lead lead, User performedBy, ActivityType type, String summary, String details, String metadata) {
        LeadActivity activity = new LeadActivity(
                UUID.randomUUID(),
                lead.getOrganization(),
                lead,
                performedBy,
                type,
                summary,
                details,
                metadata
        );
        return activityRepository.save(activity);
    }

    public ActivityResponse logManualActivity(UUID organizationId, UUID leadId, ActivityLogRequest request, UserPrincipal principal) {
        Lead lead = leadRepository.findByIdAndOrganizationIdAndDeletedFalse(leadId, organizationId)
                .orElseThrow(() -> new IllegalArgumentException("Lead not found"));

        if (principal.getRole() == Role.COUNSELOR && lead.getAssignedTo() != null && !lead.getAssignedTo().getId().equals(principal.getId())) {
            throw new org.springframework.security.access.AccessDeniedException("You can only log activities on leads assigned to you");
        }

        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        LeadActivity activity = recordActivity(
                lead,
                user,
                request.getType(),
                request.getSummary().trim(),
                request.getDetails(),
                request.getMetadata()
        );

        return ActivityResponse.fromEntity(activity);
    }
}
