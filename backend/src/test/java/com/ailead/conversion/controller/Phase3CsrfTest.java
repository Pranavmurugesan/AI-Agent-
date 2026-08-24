package com.ailead.conversion.controller;

import com.ailead.conversion.dto.CourseRequest;
import com.ailead.conversion.dto.LeadCreateRequest;
import com.ailead.conversion.entity.Organization;
import com.ailead.conversion.entity.Role;
import com.ailead.conversion.entity.User;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class Phase3CsrfTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Organization org;
    private User admin;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
        organizationRepository.deleteAll();

        org = organizationRepository.save(new Organization(UUID.randomUUID(), "CSRF Institute", "csrf-inst", true));
        admin = userRepository.save(new User(UUID.randomUUID(), org, "Admin CSRF", "admin@csrf.inst", passwordEncoder.encode("pass123"), Role.ADMIN, true));
    }

    @Test
    @DisplayName("Mutating POST /api/v1/leads without CSRF token MUST be rejected with HTTP 403 Forbidden")
    void createLead_WithoutCsrf_ShouldReturn403Forbidden() throws Exception {
        UserPrincipal principal = UserPrincipal.create(admin);
        LeadCreateRequest request = new LeadCreateRequest("Student Name", "9876543210", "s@test.com", null, null, null, null, "Note");

        mockMvc.perform(post("/api/v1/leads")
                        .with(user(principal))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Mutating POST /api/v1/courses without CSRF token MUST be rejected with HTTP 403 Forbidden")
    void createCourse_WithoutCsrf_ShouldReturn403Forbidden() throws Exception {
        UserPrincipal principal = UserPrincipal.create(admin);
        CourseRequest request = new CourseRequest("Course Without CSRF", "C-NO-CSRF", "Desc", "1 Year", BigDecimal.valueOf(20000), true);

        mockMvc.perform(post("/api/v1/courses")
                        .with(user(principal))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Mutating POST /api/v1/leads WITH valid CSRF token header and cookie MUST succeed (201 Created)")
    void createLead_WithValidCsrf_ShouldSucceed() throws Exception {
        UserPrincipal principal = UserPrincipal.create(admin);
        LeadCreateRequest request = new LeadCreateRequest("Student Name", "9876543210", "s@test.com", null, null, null, null, "Note");

        mockMvc.perform(post("/api/v1/leads")
                        .with(user(principal))
                        .with(CsrfTestUtils.csrfToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());
    }
}
