package com.ailead.conversion.controller;

import com.ailead.conversion.dto.*;
import com.ailead.conversion.entity.*;
import com.ailead.conversion.repository.*;
import com.ailead.conversion.security.UserPrincipal;
import com.ailead.conversion.util.CsrfTestUtils;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Complete End-to-End Business Workflow Validation Test for Phase 3:
 * 1. Admin logs in, creates courses, views course catalog
 * 2. Counselor creates lead, adds interaction activity, updates funnel status
 * 3. Counselor schedules follow-up task, completes it with outcome notes
 * 4. Lead is converted to CONVERTED status (enrolled)
 * 5. Dashboard metrics reflect real-time live counts and conversion statistics
 * 6. Tenant isolation and RBAC checks verify strict security boundaries
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class Phase3EndToEndWorkflowTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

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

    @Autowired
    private FollowUpRepository followUpRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Organization apexInstitute;
    private Organization rivalInstitute;

    private User apexAdmin;
    private User apexCounselor;
    private User apexStaff;

    private User rivalAdmin;
    private User rivalCounselor;

    private UserPrincipal adminPrincipal;
    private UserPrincipal counselorPrincipal;
    private UserPrincipal staffPrincipal;
    private UserPrincipal rivalCounselorPrincipal;

    @BeforeEach
    void setUp() {
        followUpRepository.deleteAll();
        activityRepository.deleteAll();
        leadRepository.deleteAll();
        courseRepository.deleteAll();
        userRepository.deleteAll();
        organizationRepository.deleteAll();

        // Institute A: Apex Coaching Institute
        apexInstitute = organizationRepository.save(new Organization(UUID.randomUUID(), "Apex Coaching Institute", "apex-coaching", true));
        apexAdmin = userRepository.save(new User(UUID.randomUUID(), apexInstitute, "Pranav Director", "pranav@apex.test", passwordEncoder.encode("adminPass123"), Role.ADMIN, true));
        apexCounselor = userRepository.save(new User(UUID.randomUUID(), apexInstitute, "Raahul Counselor", "raahul@apex.test", passwordEncoder.encode("counselorPass123"), Role.COUNSELOR, true));
        apexStaff = userRepository.save(new User(UUID.randomUUID(), apexInstitute, "Staff Member", "staff@apex.test", passwordEncoder.encode("staffPass123"), Role.STAFF, true));

        // Institute B: Rival Academy
        rivalInstitute = organizationRepository.save(new Organization(UUID.randomUUID(), "Rival Academy", "rival-acad", true));
        rivalAdmin = userRepository.save(new User(UUID.randomUUID(), rivalInstitute, "Rival Director", "director@rival.test", passwordEncoder.encode("rivalPass123"), Role.ADMIN, true));
        rivalCounselor = userRepository.save(new User(UUID.randomUUID(), rivalInstitute, "Rival Counselor", "counselor@rival.test", passwordEncoder.encode("rivalPass123"), Role.COUNSELOR, true));

        adminPrincipal = UserPrincipal.create(apexAdmin);
        counselorPrincipal = UserPrincipal.create(apexCounselor);
        staffPrincipal = UserPrincipal.create(apexStaff);
        rivalCounselorPrincipal = UserPrincipal.create(rivalCounselor);
    }

    @Test
    @DisplayName("Complete End-to-End Business Flow: Admin -> Course -> Counselor -> Lead -> Activity -> Follow-up -> Conversion -> Dashboard")
    void testCompleteInstituteBusinessWorkflow() throws Exception {
        // -------------------------------------------------------------
        // STEP 1: Admin Creates Courses
        // -------------------------------------------------------------
        CourseRequest neetCourseReq = new CourseRequest(
                "NEET 2-Year Target Batch 2027",
                "NEET-2027",
                "Comprehensive PCB batch for 11th standard students",
                "2 Years",
                BigDecimal.valueOf(125000.00),
                true
        );

        MvcResult courseResult = mockMvc.perform(post("/api/v1/courses")
                        .with(user(adminPrincipal))
                        .with(CsrfTestUtils.csrfToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(neetCourseReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("NEET 2-Year Target Batch 2027"))
                .andExpect(jsonPath("$.code").value("NEET-2027"))
                .andExpect(jsonPath("$.fee").value(125000.00))
                .andReturn();

        CourseResponse createdCourse = objectMapper.readValue(courseResult.getResponse().getContentAsString(), CourseResponse.class);
        assertNotNull(createdCourse.getId());

        // -------------------------------------------------------------
        // STEP 2: Counselor Creates a New Lead
        // -------------------------------------------------------------
        LeadCreateRequest leadCreateReq = new LeadCreateRequest(
                "Aditya Sharma",
                "+91 9876543210",
                "aditya.sharma@gmail.com",
                createdCourse.getId(),
                LeadSource.INSTAGRAM,
                LeadPriority.HIGH,
                apexCounselor.getId(),
                "Parent called inquiring about hostel facility and scholarship test"
        );

        MvcResult leadResult = mockMvc.perform(post("/api/v1/leads")
                        .with(user(counselorPrincipal))
                        .with(CsrfTestUtils.csrfToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(leadCreateReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Aditya Sharma"))
                .andExpect(jsonPath("$.phone").value("+91 9876543210"))
                .andExpect(jsonPath("$.normalizedPhone").value("9876543210"))
                .andExpect(jsonPath("$.status").value("NEW"))
                .andExpect(jsonPath("$.course.name").value("NEET 2-Year Target Batch 2027"))
                .andReturn();

        LeadResponse createdLead = objectMapper.readValue(leadResult.getResponse().getContentAsString(), LeadResponse.class);
        UUID leadId = createdLead.getId();

        // -------------------------------------------------------------
        // STEP 3: Deduplication check with different phone format
        // -------------------------------------------------------------
        LeadCreateRequest duplicateInquiry = new LeadCreateRequest(
                "Aditya Sharma",
                "09876543210", // 11-digit zero prefix format
                "aditya.sharma@gmail.com",
                createdCourse.getId(),
                LeadSource.WEBSITE,
                LeadPriority.URGENT,
                null,
                "Student submitted online demo registration form"
        );

        MvcResult dedupResult = mockMvc.perform(post("/api/v1/leads")
                        .with(user(counselorPrincipal))
                        .with(CsrfTestUtils.csrfToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(duplicateInquiry)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(leadId.toString())) // Returns same lead
                .andReturn();

        // -------------------------------------------------------------
        // STEP 4: Counselor Logs a Phone Call Activity
        // -------------------------------------------------------------
        ActivityLogRequest callActivity = new ActivityLogRequest(
                ActivityType.CALL_LOGGED,
                "Detailed counseling call with student and father",
                "Discussed syllabus coverage, doubt resolution sessions, and batch schedule. Father requested 10% fee waiver.",
                "{\"callDurationSeconds\":420}"
        );

        mockMvc.perform(post("/api/v1/leads/" + leadId + "/activities")
                        .with(user(counselorPrincipal))
                        .with(CsrfTestUtils.csrfToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(callActivity)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.type").value("CALL_LOGGED"))
                .andExpect(jsonPath("$.summary").value("Detailed counseling call with student and father"));

        // -------------------------------------------------------------
        // STEP 5: Counselor Updates Lead Status to QUALIFIED
        // -------------------------------------------------------------
        LeadStatusUpdateRequest statusUpdate = new LeadStatusUpdateRequest(
                LeadStatus.QUALIFIED,
                "Student scored 92% in 10th board; eligible for admission"
        );

        mockMvc.perform(patch("/api/v1/leads/" + leadId + "/status")
                        .with(user(counselorPrincipal))
                        .with(CsrfTestUtils.csrfToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(statusUpdate)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("QUALIFIED"));

        // -------------------------------------------------------------
        // STEP 6: Counselor Schedules a Follow-Up Task
        // -------------------------------------------------------------
        Instant tomorrow = Instant.now().plus(1, ChronoUnit.DAYS);
        FollowUpCreateRequest followUpReq = new FollowUpCreateRequest(
                apexCounselor.getId(),
                tomorrow,
                LeadPriority.HIGH,
                "Callback regarding fee concession approval from Director"
        );

        MvcResult followUpResult = mockMvc.perform(post("/api/v1/leads/" + leadId + "/follow-ups")
                        .with(user(counselorPrincipal))
                        .with(CsrfTestUtils.csrfToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(followUpReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.priority").value("HIGH"))
                .andReturn();

        FollowUpResponse createdFollowUp = objectMapper.readValue(followUpResult.getResponse().getContentAsString(), FollowUpResponse.class);
        UUID followUpId = createdFollowUp.getId();

        // -------------------------------------------------------------
        // STEP 7: Counselor Completes the Follow-Up Task
        // -------------------------------------------------------------
        FollowUpCompleteRequest completeReq = new FollowUpCompleteRequest(
                "Informed father about 5% merit scholarship approval. Father agreed to enroll."
        );

        mockMvc.perform(patch("/api/v1/follow-ups/" + followUpId + "/complete")
                        .with(user(counselorPrincipal))
                        .with(CsrfTestUtils.csrfToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(completeReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"))
                .andExpect(jsonPath("$.outcomeNotes").value("Informed father about 5% merit scholarship approval. Father agreed to enroll."));

        // -------------------------------------------------------------
        // STEP 8: Convert Lead to CONVERTED
        // -------------------------------------------------------------
        LeadStatusUpdateRequest convertUpdate = new LeadStatusUpdateRequest(
                LeadStatus.CONVERTED,
                "Student paid first installment of Rs. 40,000 via UPI. Enrolled in Batch A."
        );

        mockMvc.perform(patch("/api/v1/leads/" + leadId + "/status")
                        .with(user(counselorPrincipal))
                        .with(CsrfTestUtils.csrfToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(convertUpdate)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CONVERTED"));

        // Verify converted lead cannot be demoted back to NEW
        LeadStatusUpdateRequest invalidRevert = new LeadStatusUpdateRequest(
                LeadStatus.NEW,
                "Attempting to revert converted student"
        );

        mockMvc.perform(patch("/api/v1/leads/" + leadId + "/status")
                        .with(user(counselorPrincipal))
                        .with(CsrfTestUtils.csrfToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRevert)))
                .andExpect(status().isBadRequest());

        // -------------------------------------------------------------
        // STEP 9: Verify Dashboard Analytics Metrics
        // -------------------------------------------------------------
        mockMvc.perform(get("/api/v1/dashboard/metrics")
                        .with(user(adminPrincipal)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalLeads").value(1))
                .andExpect(jsonPath("$.pipeline.convertedCount").value(1))
                .andExpect(jsonPath("$.pipeline.newCount").value(0))
                .andExpect(jsonPath("$.conversionRatePercent").value(100.0))
                .andExpect(jsonPath("$.followUps.completedToday").value(1))
                .andExpect(jsonPath("$.sources[0].source").value("INSTAGRAM"))
                .andExpect(jsonPath("$.sources[0].count").value(1));

        // -------------------------------------------------------------
        // STEP 10: Verify Activity Audit Timeline
        // -------------------------------------------------------------
        mockMvc.perform(get("/api/v1/leads/" + leadId + "/activities")
                        .with(user(counselorPrincipal)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()", greaterThanOrEqualTo(5)));
    }

    @Test
    @DisplayName("Security Boundary: Unauthenticated request to /api/v1/leads returns 401")
    void unauthenticatedRequest_Returns401() throws Exception {
        mockMvc.perform(get("/api/v1/leads"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.error").value("Unauthorized"));
    }

    @Test
    @DisplayName("Security Boundary: Missing CSRF token on POST returns 403 Forbidden")
    void missingCsrf_Returns403() throws Exception {
        LeadCreateRequest req = new LeadCreateRequest("Test", "9876543210", null, null, null, null, null, null);

        mockMvc.perform(post("/api/v1/leads")
                        .with(user(adminPrincipal))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Cross-Tenant Boundary: Rival counselor cannot access or modify Apex Institute's leads or follow-ups")
    void rivalTenant_CannotAccessApexResources() throws Exception {
        // Create course and lead in Apex
        Course course = courseRepository.save(new Course(UUID.randomUUID(), apexInstitute, "Apex JEE", "AJ-1", "Desc", "1 Year", BigDecimal.valueOf(50000), true));
        Lead lead = leadRepository.save(new Lead(UUID.randomUUID(), apexInstitute, "Apex Student", "9112233445", "apex@student.test", course, LeadSource.WEBSITE, LeadStatus.NEW, LeadPriority.MEDIUM, apexCounselor, "Confidential"));
        FollowUp followUp = followUpRepository.save(new FollowUp(UUID.randomUUID(), apexInstitute, lead, apexCounselor, Instant.now().plus(1, ChronoUnit.DAYS), FollowUpStatus.PENDING, LeadPriority.HIGH, "Confidential"));

        // Rival counselor trying to view Apex Lead -> 400 Bad Request / Not Found
        mockMvc.perform(get("/api/v1/leads/" + lead.getId())
                        .with(user(rivalCounselorPrincipal)))
                .andExpect(status().isBadRequest());

        // Rival counselor trying to view Apex Lead Activities -> 400 Bad Request / Not Found
        mockMvc.perform(get("/api/v1/leads/" + lead.getId() + "/activities")
                        .with(user(rivalCounselorPrincipal)))
                .andExpect(status().isBadRequest());

        // Rival counselor trying to complete Apex FollowUp -> 400 Bad Request / Not Found
        mockMvc.perform(patch("/api/v1/follow-ups/" + followUp.getId() + "/complete")
                        .with(user(rivalCounselorPrincipal))
                        .with(CsrfTestUtils.csrfToken()))
                .andExpect(status().isBadRequest());
    }
}
