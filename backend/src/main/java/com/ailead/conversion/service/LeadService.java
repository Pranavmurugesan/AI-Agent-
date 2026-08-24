package com.ailead.conversion.service;

import com.ailead.conversion.dto.*;
import com.ailead.conversion.entity.*;
import com.ailead.conversion.repository.CourseRepository;
import com.ailead.conversion.repository.LeadRepository;
import com.ailead.conversion.repository.OrganizationRepository;
import com.ailead.conversion.repository.UserRepository;
import com.ailead.conversion.security.UserPrincipal;
import com.ailead.conversion.util.PhoneUtils;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class LeadService {

    private final LeadRepository leadRepository;
    private final OrganizationRepository organizationRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final LeadActivityService activityService;

    public LeadService(LeadRepository leadRepository, OrganizationRepository organizationRepository,
                       CourseRepository courseRepository, UserRepository userRepository,
                       LeadActivityService activityService) {
        this.leadRepository = leadRepository;
        this.organizationRepository = organizationRepository;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.activityService = activityService;
    }

    public LeadResponse createLead(UUID organizationId, LeadCreateRequest request, UserPrincipal principal) {
        if (!PhoneUtils.isValid(request.getPhone())) {
            throw new IllegalArgumentException("Invalid phone number format");
        }

        Organization org = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new IllegalArgumentException("Organization not found"));

        String normalizedPhone = PhoneUtils.normalize(request.getPhone());

        // Deduplication Check
        Optional<Lead> existingOpt = leadRepository.findFirstByOrganizationIdAndNormalizedPhoneAndDeletedFalseOrderByCreatedAtDesc(
                organizationId, normalizedPhone
        );

        User currentUser = principal != null ? userRepository.findById(principal.getId()).orElse(null) : null;

        if (existingOpt.isPresent()) {
            Lead existingLead = existingOpt.get();

            // Reopening / deduplication rules:
            if (existingLead.getStatus() == LeadStatus.LOST) {
                // Rule: LOST + new inquiry -> reopen as NEW and record REOPENED activity
                existingLead.setStatus(LeadStatus.NEW);
                existingLead.setUpdatedAt(Instant.now());
                if (request.getNotes() != null && !request.getNotes().isBlank()) {
                    existingLead.setNotes(existingLead.getNotes() != null
                            ? existingLead.getNotes() + "\n[Reopened Note]: " + request.getNotes()
                            : request.getNotes());
                }
                Lead saved = leadRepository.save(existingLead);

                activityService.recordActivity(
                        saved,
                        currentUser,
                        ActivityType.REOPENED,
                        "Lead reopened from new inquiry via " + request.getSource(),
                        request.getNotes(),
                        "{\"previousStatus\":\"LOST\",\"newStatus\":\"NEW\",\"source\":\"" + request.getSource() + "\"}"
                );
                return LeadResponse.fromEntity(saved);

            } else if (existingLead.getStatus() == LeadStatus.CONVERTED) {
                // Rule: CONVERTED must NEVER automatically revert to NEW. Preserve converted record and append activity.
                activityService.recordActivity(
                        existingLead,
                        currentUser,
                        ActivityType.MESSAGE_LOGGED,
                        "New inquiry received from already converted student via " + request.getSource(),
                        request.getNotes(),
                        "{\"status\":\"CONVERTED\",\"source\":\"" + request.getSource() + "\"}"
                );
                return LeadResponse.fromEntity(existingLead);

            } else {
                // Active lead (NEW, CONTACTED, QUALIFIED, FOLLOW_UP)
                if (existingLead.getCourse() == null && request.getCourseId() != null) {
                    Course course = courseRepository.findByIdAndOrganizationId(request.getCourseId(), organizationId).orElse(null);
                    existingLead.setCourse(course);
                }
                Lead saved = leadRepository.save(existingLead);

                activityService.recordActivity(
                        saved,
                        currentUser,
                        ActivityType.MESSAGE_LOGGED,
                        "Additional inquiry received via " + request.getSource(),
                        request.getNotes(),
                        "{\"source\":\"" + request.getSource() + "\"}"
                );
                return LeadResponse.fromEntity(saved);
            }
        }

        // New Lead Creation
        Course course = null;
        if (request.getCourseId() != null) {
            course = courseRepository.findByIdAndOrganizationId(request.getCourseId(), organizationId)
                    .orElseThrow(() -> new IllegalArgumentException("Course not found in your organization"));
        }

        User assignedTo = null;
        if (request.getAssignedToUserId() != null) {
            assignedTo = userRepository.findByIdAndOrganizationId(request.getAssignedToUserId(), organizationId)
                    .orElseThrow(() -> new IllegalArgumentException("Assigned user not found in your organization"));
        }

        Lead lead = new Lead(
                UUID.randomUUID(),
                org,
                request.getName().trim(),
                request.getPhone().trim(),
                request.getEmail() != null ? request.getEmail().trim().toLowerCase() : null,
                course,
                request.getSource() != null ? request.getSource() : LeadSource.WEBSITE,
                LeadStatus.NEW,
                request.getPriority() != null ? request.getPriority() : LeadPriority.MEDIUM,
                assignedTo,
                request.getNotes()
        );

        Lead saved = leadRepository.save(lead);

        activityService.recordActivity(
                saved,
                currentUser,
                ActivityType.CREATED,
                "Lead created via " + saved.getSource(),
                saved.getNotes(),
                "{\"source\":\"" + saved.getSource() + "\",\"priority\":\"" + saved.getPriority() + "\"}"
        );

        if (assignedTo != null) {
            activityService.recordActivity(
                    saved,
                    currentUser,
                    ActivityType.ASSIGNED,
                    "Assigned to " + assignedTo.getName(),
                    null,
                    "{\"assignedToId\":\"" + assignedTo.getId() + "\",\"assignedToName\":\"" + assignedTo.getName() + "\"}"
            );
        }

        return LeadResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public LeadPageResponse getLeads(UUID organizationId, String search, LeadStatus status,
                                    UUID courseId, UUID assignedToId, LeadSource source,
                                    LeadPriority priority, int page, int size,
                                    String sortBy, String sortDir, UserPrincipal principal) {

        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        String sortProperty = (sortBy == null || sortBy.isBlank()) ? "createdAt" : sortBy;
        Pageable pageable = PageRequest.of(page, Math.min(size, 100), Sort.by(direction, sortProperty));

        Specification<Lead> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Multi-tenant isolation & soft delete
            predicates.add(cb.equal(root.get("organization").get("id"), organizationId));
            predicates.add(cb.isFalse(root.get("deleted")));

            // Role-based visibility for Counselors
            if (principal.getRole() == Role.COUNSELOR) {
                // Counselors see leads assigned to them or unassigned leads
                Predicate assignedToMe = cb.equal(root.get("assignedTo").get("id"), principal.getId());
                Predicate unassigned = cb.isNull(root.get("assignedTo"));
                predicates.add(cb.or(assignedToMe, unassigned));
            } else if (assignedToId != null) {
                predicates.add(cb.equal(root.get("assignedTo").get("id"), assignedToId));
            }

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (courseId != null) {
                predicates.add(cb.equal(root.get("course").get("id"), courseId));
            }
            if (source != null) {
                predicates.add(cb.equal(root.get("source"), source));
            }
            if (priority != null) {
                predicates.add(cb.equal(root.get("priority"), priority));
            }

            if (search != null && !search.isBlank()) {
                String searchLower = "%" + search.trim().toLowerCase() + "%";
                String normalizedSearch = "%" + PhoneUtils.normalize(search) + "%";
                Predicate nameMatch = cb.like(cb.lower(root.get("name")), searchLower);
                Predicate emailMatch = cb.like(cb.lower(root.get("email")), searchLower);
                Predicate phoneMatch = cb.like(root.get("phone"), "%" + search.trim() + "%");
                Predicate normPhoneMatch = cb.like(root.get("normalizedPhone"), normalizedSearch);

                predicates.add(cb.or(nameMatch, emailMatch, phoneMatch, normPhoneMatch));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Lead> leadPage = leadRepository.findAll(spec, pageable);
        List<LeadResponse> dtos = leadPage.getContent().stream().map(LeadResponse::fromEntity).collect(Collectors.toList());

        return new LeadPageResponse(
                dtos,
                leadPage.getNumber(),
                leadPage.getSize(),
                leadPage.getTotalElements(),
                leadPage.getTotalPages(),
                leadPage.isLast()
        );
    }

    @Transactional(readOnly = true)
    public LeadResponse getLead(UUID organizationId, UUID leadId, UserPrincipal principal) {
        Lead lead = leadRepository.findByIdAndOrganizationIdAndDeletedFalse(leadId, organizationId)
                .orElseThrow(() -> new IllegalArgumentException("Lead not found"));

        if (principal.getRole() == Role.COUNSELOR && lead.getAssignedTo() != null && !lead.getAssignedTo().getId().equals(principal.getId())) {
            throw new AccessDeniedException("You can only access leads assigned to you");
        }

        return LeadResponse.fromEntity(lead);
    }

    public LeadResponse updateLead(UUID organizationId, UUID leadId, LeadUpdateRequest request, UserPrincipal principal) {
        Lead lead = leadRepository.findByIdAndOrganizationIdAndDeletedFalse(leadId, organizationId)
                .orElseThrow(() -> new IllegalArgumentException("Lead not found"));

        if (principal.getRole() == Role.COUNSELOR && lead.getAssignedTo() != null && !lead.getAssignedTo().getId().equals(principal.getId())) {
            throw new AccessDeniedException("You can only update leads assigned to you");
        }

        lead.setName(request.getName().trim());
        lead.setPhone(request.getPhone().trim());
        lead.setEmail(request.getEmail() != null ? request.getEmail().trim().toLowerCase() : null);
        lead.setNotes(request.getNotes());

        if (request.getSource() != null) {
            lead.setSource(request.getSource());
        }
        if (request.getPriority() != null) {
            lead.setPriority(request.getPriority());
        }

        if (request.getCourseId() != null) {
            Course course = courseRepository.findByIdAndOrganizationId(request.getCourseId(), organizationId)
                    .orElseThrow(() -> new IllegalArgumentException("Course not found in your organization"));
            lead.setCourse(course);
        } else {
            lead.setCourse(null);
        }

        Lead saved = leadRepository.save(lead);

        User currentUser = userRepository.findById(principal.getId()).orElse(null);
        activityService.recordActivity(
                saved,
                currentUser,
                ActivityType.NOTE_ADDED,
                "Lead details updated by " + principal.getUsername(),
                null,
                null
        );

        return LeadResponse.fromEntity(saved);
    }

    public LeadResponse updateLeadStatus(UUID organizationId, UUID leadId, LeadStatusUpdateRequest request, UserPrincipal principal) {
        Lead lead = leadRepository.findByIdAndOrganizationIdAndDeletedFalse(leadId, organizationId)
                .orElseThrow(() -> new IllegalArgumentException("Lead not found"));

        if (principal.getRole() == Role.COUNSELOR && lead.getAssignedTo() != null && !lead.getAssignedTo().getId().equals(principal.getId())) {
            throw new AccessDeniedException("You can only change status for leads assigned to you");
        }

        LeadStatus oldStatus = lead.getStatus();
        LeadStatus newStatus = request.getStatus();

        if (oldStatus == LeadStatus.CONVERTED && newStatus != LeadStatus.CONVERTED) {
            throw new IllegalArgumentException("A CONVERTED lead cannot automatically transition back to an earlier pipeline state");
        }

        lead.setStatus(newStatus);
        Lead saved = leadRepository.save(lead);

        User currentUser = userRepository.findById(principal.getId()).orElse(null);
        ActivityType activityType = newStatus == LeadStatus.CONVERTED ? ActivityType.CONVERTED
                : (newStatus == LeadStatus.LOST ? ActivityType.LOST : ActivityType.STATUS_CHANGED);

        activityService.recordActivity(
                saved,
                currentUser,
                activityType,
                "Status changed from " + oldStatus + " to " + newStatus,
                request.getRemarks(),
                "{\"fromStatus\":\"" + oldStatus + "\",\"toStatus\":\"" + newStatus + "\"}"
        );

        return LeadResponse.fromEntity(saved);
    }

    public LeadResponse assignLead(UUID organizationId, UUID leadId, LeadAssignRequest request, UserPrincipal principal) {
        Lead lead = leadRepository.findByIdAndOrganizationIdAndDeletedFalse(leadId, organizationId)
                .orElseThrow(() -> new IllegalArgumentException("Lead not found"));

        User previousAssignee = lead.getAssignedTo();
        User newAssignee = null;

        if (request.getAssignedToUserId() != null) {
            newAssignee = userRepository.findByIdAndOrganizationId(request.getAssignedToUserId(), organizationId)
                    .orElseThrow(() -> new IllegalArgumentException("Assigned counselor not found in your organization"));
        }

        lead.setAssignedTo(newAssignee);
        Lead saved = leadRepository.save(lead);

        User currentUser = userRepository.findById(principal.getId()).orElse(null);
        String summary = newAssignee != null
                ? "Assigned to " + newAssignee.getName() + " by " + principal.getUsername()
                : "Unassigned by " + principal.getUsername();

        String metadata = String.format("{\"fromAssigneeId\":%s,\"toAssigneeId\":%s}",
                previousAssignee != null ? "\"" + previousAssignee.getId() + "\"" : "null",
                newAssignee != null ? "\"" + newAssignee.getId() + "\"" : "null");

        activityService.recordActivity(
                saved,
                currentUser,
                ActivityType.ASSIGNED,
                summary,
                request.getRemarks(),
                metadata
        );

        return LeadResponse.fromEntity(saved);
    }

    public void softDeleteLead(UUID organizationId, UUID leadId, UserPrincipal principal) {
        Lead lead = leadRepository.findByIdAndOrganizationIdAndDeletedFalse(leadId, organizationId)
                .orElseThrow(() -> new IllegalArgumentException("Lead not found"));

        lead.setDeleted(true);
        lead.setDeletedAt(Instant.now());
        leadRepository.save(lead);

        User currentUser = userRepository.findById(principal.getId()).orElse(null);
        activityService.recordActivity(
                lead,
                currentUser,
                ActivityType.NOTE_ADDED,
                "Lead soft-deleted by Admin " + principal.getUsername(),
                null,
                "{\"deleted\":true}"
        );
    }
}
