package com.ailead.conversion.controller;

import com.ailead.conversion.entity.Organization;
import com.ailead.conversion.entity.Role;
import com.ailead.conversion.entity.User;
import com.ailead.conversion.repository.OrganizationRepository;
import com.ailead.conversion.repository.UserRepository;
import com.ailead.conversion.security.JwtTokenProvider;
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

import java.util.Map;
import java.util.UUID;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class TenantIsolationTest {

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

    @Autowired
    private JwtTokenProvider tokenProvider;

    private User userOrgA;
    private User userOrgB;
    private Organization orgA;
    private Organization orgB;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
        organizationRepository.deleteAll();

        orgA = organizationRepository.save(new Organization(UUID.randomUUID(), "Alpha Academy", "alpha-academy", true));
        orgB = organizationRepository.save(new Organization(UUID.randomUUID(), "Beta Institute", "beta-institute", true));

        userOrgA = userRepository.save(new User(UUID.randomUUID(), orgA, "User Alpha", "user@alpha.test", passwordEncoder.encode("pass123"), Role.ADMIN, true));
        userOrgB = userRepository.save(new User(UUID.randomUUID(), orgB, "User Beta", "user@beta.test", passwordEncoder.encode("pass123"), Role.ADMIN, true));
    }

    @Test
    @DisplayName("Org A User accessing Org A resources via GET, POST, PUT, PATCH, DELETE should be ALLOWED (200 OK)")
    void orgA_AccessingOrgAResources_ShouldBeAllowed() throws Exception {
        UserPrincipal principalA = UserPrincipal.create(userOrgA);
        UUID orgAId = orgA.getId();

        mockMvc.perform(get("/api/v1/test/tenant-resources/" + orgAId).with(user(principalA)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.method").value("GET"));

        mockMvc.perform(post("/api/v1/test/tenant-resources/" + orgAId).with(user(principalA)).with(CsrfTestUtils.csrfToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.method").value("POST"));

        mockMvc.perform(put("/api/v1/test/tenant-resources/" + orgAId).with(user(principalA)).with(CsrfTestUtils.csrfToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.method").value("PUT"));

        mockMvc.perform(patch("/api/v1/test/tenant-resources/" + orgAId).with(user(principalA)).with(CsrfTestUtils.csrfToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.method").value("PATCH"));

        mockMvc.perform(delete("/api/v1/test/tenant-resources/" + orgAId).with(user(principalA)).with(CsrfTestUtils.csrfToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.method").value("DELETE"));
    }

    @Test
    @DisplayName("Org A User accessing Org B resources via GET, POST, PUT, PATCH, DELETE should be DENIED (403 Forbidden)")
    void orgA_AccessingOrgBResources_ShouldBeDenied() throws Exception {
        UserPrincipal principalA = UserPrincipal.create(userOrgA);
        UUID orgBId = orgB.getId();

        mockMvc.perform(get("/api/v1/test/tenant-resources/" + orgBId).with(user(principalA)))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/v1/test/tenant-resources/" + orgBId).with(user(principalA)).with(CsrfTestUtils.csrfToken()))
                .andExpect(status().isForbidden());

        mockMvc.perform(put("/api/v1/test/tenant-resources/" + orgBId).with(user(principalA)).with(CsrfTestUtils.csrfToken()))
                .andExpect(status().isForbidden());

        mockMvc.perform(patch("/api/v1/test/tenant-resources/" + orgBId).with(user(principalA)).with(CsrfTestUtils.csrfToken()))
                .andExpect(status().isForbidden());

        mockMvc.perform(delete("/api/v1/test/tenant-resources/" + orgBId).with(user(principalA)).with(CsrfTestUtils.csrfToken()))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Org B User accessing Org A resources via GET, POST, PUT, PATCH, DELETE should be DENIED (403 Forbidden)")
    void orgB_AccessingOrgAResources_ShouldBeDenied() throws Exception {
        UserPrincipal principalB = UserPrincipal.create(userOrgB);
        UUID orgAId = orgA.getId();

        mockMvc.perform(get("/api/v1/test/tenant-resources/" + orgAId).with(user(principalB)))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/v1/test/tenant-resources/" + orgAId).with(user(principalB)).with(CsrfTestUtils.csrfToken()))
                .andExpect(status().isForbidden());

        mockMvc.perform(put("/api/v1/test/tenant-resources/" + orgAId).with(user(principalB)).with(CsrfTestUtils.csrfToken()))
                .andExpect(status().isForbidden());

        mockMvc.perform(patch("/api/v1/test/tenant-resources/" + orgAId).with(user(principalB)).with(CsrfTestUtils.csrfToken()))
                .andExpect(status().isForbidden());

        mockMvc.perform(delete("/api/v1/test/tenant-resources/" + orgAId).with(user(principalB)).with(CsrfTestUtils.csrfToken()))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Path IDOR manipulation (Org A user calling GET /api/v1/organizations/{orgBId}) should be DENIED (403 Forbidden)")
    void idor_PathManipulation_ShouldBeDenied() throws Exception {
        UserPrincipal principalA = UserPrincipal.create(userOrgA);

        mockMvc.perform(get("/api/v1/organizations/" + orgB.getId()).with(user(principalA)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Query IDOR manipulation (Org A user sending ?organizationId=orgBId) should be DENIED (403 Forbidden)")
    void idor_QueryManipulation_ShouldBeDenied() throws Exception {
        UserPrincipal principalA = UserPrincipal.create(userOrgA);

        mockMvc.perform(get("/api/v1/test/tenant-resources/query-check")
                        .param("organizationId", orgB.getId().toString())
                        .with(user(principalA)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Query Match (Org A user sending ?organizationId=orgAId) should be ALLOWED (200 OK)")
    void queryMatch_ValidTenant_ShouldBeAllowed() throws Exception {
        UserPrincipal principalA = UserPrincipal.create(userOrgA);

        mockMvc.perform(get("/api/v1/test/tenant-resources/query-check")
                        .param("organizationId", orgA.getId().toString())
                        .with(user(principalA)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.method").value("QUERY_CHECK"));
    }

    @Test
    @DisplayName("Body IDOR manipulation (Org A user sending Org B organizationId in body) should be DENIED (403 Forbidden)")
    void idor_BodyManipulation_ShouldBeDenied() throws Exception {
        UserPrincipal principalA = UserPrincipal.create(userOrgA);
        Map<String, String> payload = Map.of("organizationId", orgB.getId().toString());

        mockMvc.perform(post("/api/v1/test/tenant-resources/body-check")
                        .with(user(principalA))
                        .with(CsrfTestUtils.csrfToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("GET /api/v1/organizations/me should return strictly the authenticated user's organization")
    void getOrganizationMe_ShouldReturnAuthenticatedUserTenantOnly() throws Exception {
        UserPrincipal principalA = UserPrincipal.create(userOrgA);

        mockMvc.perform(get("/api/v1/organizations/me").with(user(principalA)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(orgA.getId().toString()))
                .andExpect(jsonPath("$.slug").value("alpha-academy"));

        UserPrincipal principalB = UserPrincipal.create(userOrgB);

        mockMvc.perform(get("/api/v1/organizations/me").with(user(principalB)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(orgB.getId().toString()))
                .andExpect(jsonPath("$.slug").value("beta-institute"));
    }
}
