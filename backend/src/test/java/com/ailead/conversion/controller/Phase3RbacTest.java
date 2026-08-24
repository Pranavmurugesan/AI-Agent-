package com.ailead.conversion.controller;

import com.ailead.conversion.dto.CourseRequest;
import com.ailead.conversion.dto.LeadAssignRequest;
import com.ailead.conversion.dto.LeadCreateRequest;
import com.ailead.conversion.dto.LeadStatusUpdateRequest;
import com.ailead.conversion.entity.*;
import com.ailead.conversion.repository.CourseRepository;
import com.ailead.conversion.repository.LeadRepository;
import com.ailead.conversion.repository.OrganizationRepository;
import com.ailead.conversion.repository.UserRepository;
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
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class Phase3RbacTest {

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
    private PasswordEncoder passwordEncoder;

    private Organization org;
    private User admin;
    private User counselor;
    private User staff;
    private Course course;
    private Lead lead;

    @BeforeEach
    void setUp() {
        leadRepository.deleteAll();
        courseRepository.deleteAll();
        userRepository.deleteAll();
        organizationRepository.deleteAll();

        org = organizationRepository.save(new Organization(UUID.randomUUID(), "Test Institute", "test-inst", true));
        admin = userRepository.save(new User(UUID.randomUUID(), org, "Admin User", "admin@test.inst", passwordEncoder.encode("pass123"), Role.ADMIN, true));
        counselor = userRepository.save(new User(UUID.randomUUID(), org, "Counselor User", "counselor@test.inst", passwordEncoder.encode("pass123"), Role.COUNSELOR, true));
        staff = userRepository.save(new User(UUID.randomUUID(), org, "Staff User", "staff@test.inst", passwordEncoder.encode("pass123"), Role.STAFF, true));

        course = courseRepository.save(new Course(UUID.randomUUID(), org, "Test Course", "TC-1", "Description", "6 Months", BigDecimal.valueOf(30000), true));
        lead = leadRepository.save(new Lead(UUID.randomUUID(), org, "Student One", "9876512345", "one@test.com", course, LeadSource.WEBSITE, LeadStatus.NEW, LeadPriority.MEDIUM, counselor, "Note"));
    }

    @Test
    @DisplayName("ADMIN can create course, assign counselor, and delete lead (200/201 OK)")
    void admin_CanPerformAllPrivilegedOperations() throws Exception {
        UserPrincipal adminPrincipal = UserPrincipal.create(admin);

        // Create Course
        CourseRequest courseReq = new CourseRequest("New Course", "NC-1", "Desc", "1 Year", BigDecimal.valueOf(40000), true);
        mockMvc.perform(post("/api/v1/courses")
                        .with(user(adminPrincipal))
                        .with(CsrfTestUtils.csrfToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(courseReq)))
                .andExpect(status().isCreated());

        // Assign Counselor
        LeadAssignRequest assignReq = new LeadAssignRequest(counselor.getId(), "Assigned by admin");
        mockMvc.perform(post("/api/v1/leads/" + lead.getId() + "/assign")
                        .with(user(adminPrincipal))
                        .with(CsrfTestUtils.csrfToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(assignReq)))
                .andExpect(status().isOk());

        // Delete Lead
        mockMvc.perform(delete("/api/v1/leads/" + lead.getId())
                        .with(user(adminPrincipal))
                        .with(CsrfTestUtils.csrfToken()))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("COUNSELOR cannot create course, assign counselors, or delete leads (403 Forbidden)")
    void counselor_CannotPerformAdminOperations() throws Exception {
        UserPrincipal counselorPrincipal = UserPrincipal.create(counselor);

        // Course Creation -> 403
        CourseRequest courseReq = new CourseRequest("Counselor Course", "CC-1", "Desc", "1 Year", BigDecimal.valueOf(40000), true);
        mockMvc.perform(post("/api/v1/courses")
                        .with(user(counselorPrincipal))
                        .with(CsrfTestUtils.csrfToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(courseReq)))
                .andExpect(status().isForbidden());

        // Lead Assignment -> 403
        LeadAssignRequest assignReq = new LeadAssignRequest(admin.getId(), "Counselor trying to reassign");
        mockMvc.perform(post("/api/v1/leads/" + lead.getId() + "/assign")
                        .with(user(counselorPrincipal))
                        .with(CsrfTestUtils.csrfToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(assignReq)))
                .andExpect(status().isForbidden());

        // Lead Deletion -> 403
        mockMvc.perform(delete("/api/v1/leads/" + lead.getId())
                        .with(user(counselorPrincipal))
                        .with(CsrfTestUtils.csrfToken()))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("STAFF cannot manage courses, assign counselors, or delete leads (403 Forbidden)")
    void staff_CannotPerformPrivilegedOperations() throws Exception {
        UserPrincipal staffPrincipal = UserPrincipal.create(staff);

        // Delete Course -> 403
        mockMvc.perform(delete("/api/v1/courses/" + course.getId())
                        .with(user(staffPrincipal))
                        .with(CsrfTestUtils.csrfToken()))
                .andExpect(status().isForbidden());

        // Assign Lead -> 403
        LeadAssignRequest assignReq = new LeadAssignRequest(counselor.getId(), "Staff trying to assign");
        mockMvc.perform(post("/api/v1/leads/" + lead.getId() + "/assign")
                        .with(user(staffPrincipal))
                        .with(CsrfTestUtils.csrfToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(assignReq)))
                .andExpect(status().isForbidden());

        // Delete Lead -> 403
        mockMvc.perform(delete("/api/v1/leads/" + lead.getId())
                        .with(user(staffPrincipal))
                        .with(CsrfTestUtils.csrfToken()))
                .andExpect(status().isForbidden());
    }
}
