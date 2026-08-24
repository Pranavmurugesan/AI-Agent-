package com.ailead.conversion.service;

import com.ailead.conversion.dto.FollowUpCompleteRequest;
import com.ailead.conversion.dto.FollowUpCreateRequest;
import com.ailead.conversion.dto.FollowUpResponse;
import com.ailead.conversion.entity.*;
import com.ailead.conversion.repository.FollowUpRepository;
import com.ailead.conversion.repository.LeadRepository;
import com.ailead.conversion.repository.UserRepository;
import com.ailead.conversion.security.UserPrincipal;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class FollowUpService {

    private final FollowUpRepository followUpRepository;
    private final LeadRepository leadRepository;
    private final UserRepository userRepository;
    private final LeadActivityService activityService;

    public FollowUpService(FollowUpRepository followUpRepository, LeadRepository leadRepository,
                           UserRepository userRepository, LeadActivityService activityService) {
        this.followUpRepository = followUpRepository;
        this.leadRepository = leadRepository;
        this.userRepository = userRepository;
        this.activityService = activityService;
    }

    @Transactional(readOnly = true)
    public List<FollowUpResponse> getFollowUps(UUID organizationId, FollowUpStatus status,
                                              Boolean todayOnly, UUID assignedToId, UserPrincipal principal) {
        Specification<FollowUp> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("organization").get("id"), organizationId));

            if (principal.getRole() == Role.COUNSELOR) {
                // Counselor sees only their assigned follow-ups
                predicates.add(cb.equal(root.get("assignedTo").get("id"), principal.getId()));
            } else if (assignedToId != null) {
                predicates.add(cb.equal(root.get("assignedTo").get("id"), assignedToId));
            }

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            if (Boolean.TRUE.equals(todayOnly)) {
                Instant startOfDay = Instant.now().truncatedTo(ChronoUnit.DAYS);
                Instant endOfDay = startOfDay.plus(1, ChronoUnit.DAYS);
                predicates.add(cb.between(root.get("scheduledAt"), startOfDay, endOfDay));
            }

            query.orderBy(cb.asc(root.get("scheduledAt")));
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return followUpRepository.findAll(spec).stream().map(FollowUpResponse::fromEntity).collect(Collectors.toList());
    }

    public FollowUpResponse createFollowUp(UUID organizationId, UUID leadId, FollowUpCreateRequest request, UserPrincipal principal) {
        Lead lead = leadRepository.findByIdAndOrganizationIdAndDeletedFalse(leadId, organizationId)
                .orElseThrow(() -> new IllegalArgumentException("Lead not found"));

        UUID targetAssigneeId = request.getAssignedToUserId() != null ? request.getAssignedToUserId()
                : (lead.getAssignedTo() != null ? lead.getAssignedTo().getId() : principal.getId());

        User assignee = userRepository.findByIdAndOrganizationId(targetAssigneeId, organizationId)
                .orElseThrow(() -> new IllegalArgumentException("Assigned counselor not found in your organization"));

        FollowUp followUp = new FollowUp(
                UUID.randomUUID(),
                lead.getOrganization(),
                lead,
                assignee,
                request.getScheduledAt(),
                FollowUpStatus.PENDING,
                request.getPriority(),
                request.getNotes()
        );

        FollowUp saved = followUpRepository.save(followUp);

        User currentUser = userRepository.findById(principal.getId()).orElse(null);
        activityService.recordActivity(
                lead,
                currentUser,
                ActivityType.FOLLOW_UP_SCHEDULED,
                "Follow-up scheduled for " + saved.getScheduledAt() + " with " + assignee.getName(),
                request.getNotes(),
                "{\"followUpId\":\"" + saved.getId() + "\",\"scheduledAt\":\"" + saved.getScheduledAt() + "\"}"
        );

        return FollowUpResponse.fromEntity(saved);
    }

    public FollowUpResponse completeFollowUp(UUID organizationId, UUID followUpId, FollowUpCompleteRequest request, UserPrincipal principal) {
        FollowUp followUp = followUpRepository.findByIdAndOrganizationId(followUpId, organizationId)
                .orElseThrow(() -> new IllegalArgumentException("Follow-up not found"));

        if (principal.getRole() == Role.COUNSELOR && !followUp.getAssignedTo().getId().equals(principal.getId())) {
            throw new AccessDeniedException("You can only complete follow-ups assigned to you");
        }

        followUp.setStatus(FollowUpStatus.COMPLETED);
        followUp.setCompletedAt(Instant.now());
        if (request != null && request.getOutcomeNotes() != null) {
            followUp.setOutcomeNotes(request.getOutcomeNotes());
        }

        FollowUp saved = followUpRepository.save(followUp);

        User currentUser = userRepository.findById(principal.getId()).orElse(null);
        activityService.recordActivity(
                followUp.getLead(),
                currentUser,
                ActivityType.FOLLOW_UP_COMPLETED,
                "Follow-up completed: " + (followUp.getOutcomeNotes() != null ? followUp.getOutcomeNotes() : "No remarks"),
                followUp.getOutcomeNotes(),
                "{\"followUpId\":\"" + saved.getId() + "\"}"
        );

        return FollowUpResponse.fromEntity(saved);
    }

    public FollowUpResponse cancelFollowUp(UUID organizationId, UUID followUpId, UserPrincipal principal) {
        FollowUp followUp = followUpRepository.findByIdAndOrganizationId(followUpId, organizationId)
                .orElseThrow(() -> new IllegalArgumentException("Follow-up not found"));

        if (principal.getRole() == Role.COUNSELOR && !followUp.getAssignedTo().getId().equals(principal.getId())) {
            throw new AccessDeniedException("You can only cancel follow-ups assigned to you");
        }

        followUp.setStatus(FollowUpStatus.CANCELLED);
        FollowUp saved = followUpRepository.save(followUp);

        User currentUser = userRepository.findById(principal.getId()).orElse(null);
        activityService.recordActivity(
                followUp.getLead(),
                currentUser,
                ActivityType.FOLLOW_UP_CANCELLED,
                "Follow-up cancelled",
                null,
                "{\"followUpId\":\"" + saved.getId() + "\"}"
        );

        return FollowUpResponse.fromEntity(saved);
    }
}
