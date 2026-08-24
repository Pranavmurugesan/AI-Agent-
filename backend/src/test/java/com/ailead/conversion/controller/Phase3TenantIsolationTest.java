package com.ailead.conversion.controller;

import com.ailead.conversion.dto.CourseRequest;
import com.ailead.conversion.dto.LeadAssignRequest;
import com.ailead.conversion.dto.LeadCreateRequest;
import com.ailead.conversion.dto.LeadUpdateRequest;
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

import java.math.BigDecimal;
import java.util.UUID;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class Phase3TenantIsolationTest {

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

    private Organization orgA;
    private Organization orgB;
    private User adminA;
    private User adminB;
    private Course courseA;
    private Course courseB;
    private Lead leadA;
    private Lead leadB;

    @BeforeEach
    void setUp() {
        followUpRepository.deleteAll();
        activityRepository.deleteAll();
        leadRepository.deleteAll();
        courseRepository.deleteAll();
        userRepository.deleteAll();
        organizationRepository.deleteAll();

        orgA = organizationRepository.save(new Organization(UUID.randomUUID(), "Alpha Institute", "alpha-inst", true));
        orgB = organizationRepository.save(new Organization(UUID.randomUUID(), "Beta Academy", "beta-acad", true));

        adminA = userRepository.save(new User(UUID.randomUUID(), orgA, "Admin Alpha", "admin@alpha.test", passwordEncoder.encode("pass123"), Role.ADMIN, true));
        adminB = userRepository.save(new User(UUID.randomUUID(), orgB, "Admin Beta", "admin@beta.test", passwordEncoder.encode("pass123"), Role.ADMIN, true));

        courseA = courseRepository.save(new Course(UUID.randomUUID(), orgA, "Course Alpha", "CA-1", "Alpha Course", "1 Year", BigDecimal.valueOf(50000), true));
        courseB = courseRepository.save(new Course(UUID.randomUUID(), orgB, "Course Beta", "CB-1", "Beta Course", "1 Year", BigDecimal.valueOf(60000), true));

        leadA = leadRepository.save(new Lead(UUID.randomUUID(), orgA, "Student Alpha", "9876500001", "student@alpha.test", courseA, LeadSource.WEBSITE, LeadStatus.NEW, LeadPriority.HIGH, adminA, "Note A"));
        leadB = leadRepository.save(new Lead(UUID.randomUUID(), orgB, "Student Beta", "9876500002", "student@beta.test", courseB, LeadSource.INSTAGRAM, LeadStatus.NEW, LeadPriority.MEDIUM, adminB, "Note B"));
    }

    @Test
    @DisplayName("Org A admin accessing Org B course details by ID should return HTTP 400 or 404 (Not Found)")
    void getCourse_CrossTenant_ShouldReturn400Or404() throws Exception {
        UserPrincipal principalA = UserPrincipal.create(adminA);

        mockMvc.perform(get("/api/v1/courses/" + courseB.getId()).with(user(principalA)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Org A admin accessing Org B lead details by ID should return HTTP 400 (Not Found in Org)")
    void getLead_CrossTenant_ShouldReturn400() throws Exception {
        UserPrincipal principalA = UserPrincipal.create(adminA);

        mockMvc.perform(get("/api/v1/leads/" + leadB.getId()).with(user(principalA)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Org A admin updating Org B lead should return HTTP 400 (Denied)")
    void updateLead_CrossTenant_ShouldReturn400() throws Exception {
        UserPrincipal principalA = UserPrincipal.create(adminA);
        LeadUpdateRequest request = new LeadUpdateRequest("Hacked Name", "9876500002", "hacked@test.com", null, LeadSource.OTHER, LeadPriority.LOW, "Malicious note");

        mockMvc.perform(put("/api/v1/leads/" + leadB.getId())
                        .with(user(principalA))
                        .with(CsrfTestUtils.csrfToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Org A admin attempting to assign lead to Org B counselor should return HTTP 400")
    void assignLead_CrossTenantCounselor_ShouldReturn400() throws Exception {
        UserPrincipal principalA = UserPrincipal.create(adminA);
        LeadAssignRequest request = new LeadAssignRequest(adminB.getId(), "Cross-tenant assign attempt");

        mockMvc.perform(post("/api/v1/leads/" + leadA.getId() + "/assign")
                        .with(user(principalA))
                        .with(CsrfTestUtils.csrfToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Assigned counselor not found in your organization"));
    }

    @Test
    @DisplayName("Org A user creating lead with Org B courseId should return HTTP 400")
    void createLead_CrossTenantCourse_ShouldReturn400() throws Exception {
        UserPrincipal principalA = UserPrincipal.create(adminA);
        LeadCreateRequest request = new LeadCreateRequest(
                "New Student", "9111222333", "new@test.com",
                courseB.getId(), LeadSource.WEBSITE, LeadPriority.HIGH, null, "Linking to Org B course"
        );

        mockMvc.perform(post("/api/v1/leads")
                        .with(user(principalA))
                        .with(CsrfTestUtils.csrfToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Course not found in your organization"));
    }

    @Test
    @DisplayName("Org A admin deleting Org B lead should return HTTP 400")
    void deleteLead_CrossTenant_ShouldReturn400() throws Exception {
        UserPrincipal principalA = UserPrincipal.create(adminA);

        mockMvc.perform(delete("/api/v1/leads/" + leadB.getId())
                        .with(user(principalA))
                        .with(CsrfTestUtils.csrfToken()))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Courses list should strictly return only authenticated organization's courses")
    void getCourses_ShouldReturnOnlyAuthenticatedOrgCourses() throws Exception {
        UserPrincipal principalA = UserPrincipal.create(adminA);

        mockMvc.perform(get("/api/v1/courses").with(user(principalA)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].name").value("Course Alpha"));
    }
}
