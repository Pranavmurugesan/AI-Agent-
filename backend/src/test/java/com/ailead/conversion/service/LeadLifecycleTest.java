package com.ailead.conversion.service;

import com.ailead.conversion.dto.LeadCreateRequest;
import com.ailead.conversion.dto.LeadResponse;
import com.ailead.conversion.dto.LeadStatusUpdateRequest;
import com.ailead.conversion.entity.*;
import com.ailead.conversion.repository.*;
import com.ailead.conversion.security.UserPrincipal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class LeadLifecycleTest {

    @Autowired
    private LeadService leadService;

    @Autowired
    private LeadActivityService activityService;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private LeadRepository leadRepository;

    @Autowired
    private LeadActivityRepository activityRepository;

    private Organization org;
    private User adminUser;
    private UserPrincipal adminPrincipal;
    private Course course;

    @BeforeEach
    void setUp() {
        activityRepository.deleteAll();
        leadRepository.deleteAll();
        courseRepository.deleteAll();
        userRepository.deleteAll();
        organizationRepository.deleteAll();

        org = organizationRepository.save(new Organization(UUID.randomUUID(), "Apex Coaching", "apex-coaching", true));
        adminUser = userRepository.save(new User(UUID.randomUUID(), org, "Admin User", "admin@apex.test", "hash123", Role.ADMIN, true));
        adminPrincipal = UserPrincipal.create(adminUser);
        course = courseRepository.save(new Course(UUID.randomUUID(), org, "NEET Foundation", "NEET-FDN", "Desc", "1 Year", null, true));
    }

    @Test
    @DisplayName("Equivalent Indian phone formats should deduplicate to the same lead and append activity")
    void deduplication_EquivalentPhones_ShouldAppendToSameLead() {
        // Step 1: Initial inquiry from Instagram
        LeadCreateRequest req1 = new LeadCreateRequest(
                "Rohan Verma", "+91 98765 43210", "rohan@test.com",
                course.getId(), LeadSource.INSTAGRAM, LeadPriority.MEDIUM, null, "Inquired about fees"
        );
        LeadResponse lead1 = leadService.createLead(org.getId(), req1, adminPrincipal);
        assertEquals("9876543210", lead1.getNormalizedPhone());
        assertEquals(LeadStatus.NEW, lead1.getStatus());

        // Step 2: Second inquiry from Website with different phone formatting
        LeadCreateRequest req2 = new LeadCreateRequest(
                "Rohan Verma", "09876543210", "rohan@test.com",
                course.getId(), LeadSource.WEBSITE, LeadPriority.HIGH, null, "Filled website demo form"
        );
        LeadResponse lead2 = leadService.createLead(org.getId(), req2, adminPrincipal);

        // Must return the SAME lead ID
        assertEquals(lead1.getId(), lead2.getId());

        // Verify activities
        List<LeadActivity> activities = activityRepository.findByOrganizationIdAndLeadIdOrderByCreatedAtDesc(org.getId(), lead1.getId());
        assertEquals(2, activities.size());
        assertEquals(ActivityType.MESSAGE_LOGGED, activities.get(0).getType());
        assertEquals(ActivityType.CREATED, activities.get(1).getType());
    }

    @Test
    @DisplayName("LOST lead receiving a new inquiry MUST be reopened as NEW with REOPENED activity")
    void lostLead_ReceivingNewInquiry_ShouldReopenAsNew() {
        // Create lead and mark as LOST
        LeadCreateRequest req1 = new LeadCreateRequest(
                "Sneha Roy", "9123456789", "sneha@test.com",
                course.getId(), LeadSource.FACEBOOK, LeadPriority.LOW, null, "Initial chat"
        );
        LeadResponse created = leadService.createLead(org.getId(), req1, adminPrincipal);

        leadService.updateLeadStatus(org.getId(), created.getId(), new LeadStatusUpdateRequest(LeadStatus.LOST, "Student joined competitor"), adminPrincipal);

        Lead lostLead = leadRepository.findById(created.getId()).orElseThrow();
        assertEquals(LeadStatus.LOST, lostLead.getStatus());

        // New inquiry comes in 2 weeks later
        LeadCreateRequest req2 = new LeadCreateRequest(
                "Sneha Roy", "+91-9123456789", "sneha@test.com",
                course.getId(), LeadSource.WHATSAPP, LeadPriority.URGENT, null, "Looking for crash course batch"
        );
        LeadResponse reopened = leadService.createLead(org.getId(), req2, adminPrincipal);

        assertEquals(created.getId(), reopened.getId());
        assertEquals(LeadStatus.NEW, reopened.getStatus());

        List<LeadActivity> activities = activityRepository.findByOrganizationIdAndLeadIdOrderByCreatedAtDesc(org.getId(), created.getId());
        assertEquals(ActivityType.REOPENED, activities.get(0).getType());
    }

    @Test
    @DisplayName("CONVERTED lead receiving a new inquiry MUST NOT automatically revert to NEW")
    void convertedLead_ReceivingNewInquiry_MustNotRevertToNew() {
        // Create lead and transition to CONVERTED
        LeadCreateRequest req1 = new LeadCreateRequest(
                "Amit Patel", "9988776655", "amit@test.com",
                course.getId(), LeadSource.WALK_IN, LeadPriority.HIGH, null, "Paid admission fee"
        );
        LeadResponse created = leadService.createLead(org.getId(), req1, adminPrincipal);
        leadService.updateLeadStatus(org.getId(), created.getId(), new LeadStatusUpdateRequest(LeadStatus.CONVERTED, "Enrolled in NEET batch"), adminPrincipal);

        Lead convertedLead = leadRepository.findById(created.getId()).orElseThrow();
        assertEquals(LeadStatus.CONVERTED, convertedLead.getStatus());

        // New inquiry comes in (e.g. asking for additional course)
        LeadCreateRequest req2 = new LeadCreateRequest(
                "Amit Patel", "+91 9988776655", "amit@test.com",
                course.getId(), LeadSource.WEBSITE, LeadPriority.HIGH, null, "Interested in test series add-on"
        );
        LeadResponse res = leadService.createLead(org.getId(), req2, adminPrincipal);

        // Status MUST remain CONVERTED
        assertEquals(created.getId(), res.getId());
        assertEquals(LeadStatus.CONVERTED, res.getStatus());

        List<LeadActivity> activities = activityRepository.findByOrganizationIdAndLeadIdOrderByCreatedAtDesc(org.getId(), created.getId());
        assertEquals(ActivityType.MESSAGE_LOGGED, activities.get(0).getType());
    }

    @Test
    @DisplayName("Soft-deleted lead should be excluded from normal queries while preserving activity timeline")
    void softDelete_ShouldExcludeFromQueriesAndPreserveActivities() {
        LeadCreateRequest req = new LeadCreateRequest(
                "Karan Mehta", "9876500000", "karan@test.com",
                course.getId(), LeadSource.WEBSITE, LeadPriority.LOW, null, "Test lead"
        );
        LeadResponse created = leadService.createLead(org.getId(), req, adminPrincipal);

        // Soft delete lead
        leadService.softDeleteLead(org.getId(), created.getId(), adminPrincipal);

        // Verify normal find excludes deleted lead
        assertTrue(leadRepository.findByIdAndOrganizationIdAndDeletedFalse(created.getId(), org.getId()).isEmpty());

        // Verify activities still exist in database
        List<LeadActivity> activities = activityRepository.findByOrganizationIdAndLeadIdOrderByCreatedAtDesc(org.getId(), created.getId());
        assertFalse(activities.isEmpty());
    }
}
