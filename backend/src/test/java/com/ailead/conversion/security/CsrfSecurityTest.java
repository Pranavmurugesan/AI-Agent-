package com.ailead.conversion.security;

import com.ailead.conversion.dto.LoginRequest;
import com.ailead.conversion.dto.RegisterRequest;
import com.ailead.conversion.entity.Organization;
import com.ailead.conversion.entity.Role;
import com.ailead.conversion.entity.User;
import com.ailead.conversion.repository.OrganizationRepository;
import com.ailead.conversion.repository.UserRepository;
import com.ailead.conversion.util.CsrfTestUtils;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
class CsrfSecurityTest {

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

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
        organizationRepository.deleteAll();
    }

    @Test
    @DisplayName("Safe GET requests (e.g. /api/v1/health, /api/v1/auth/csrf) must NOT require CSRF token")
    void safeGetRequests_DoNotRequireCsrfToken() throws Exception {
        mockMvc.perform(get("/api/v1/health"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/auth/csrf"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty());
    }

    @Test
    @DisplayName("State-changing request (POST /api/v1/auth/register) WITHOUT CSRF token MUST be rejected with HTTP 403 Forbidden")
    void stateChangingRequest_WithoutCsrf_ShouldReturn403Forbidden() throws Exception {
        RegisterRequest request = new RegisterRequest(
                "Csrf Test Org",
                "csrf-test-org",
                "Admin User",
                "admin@csrf.test",
                "password123"
        );

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("State-changing request with INVALID CSRF token header MUST be rejected with HTTP 403 Forbidden")
    void stateChangingRequest_WithInvalidCsrf_ShouldReturn403Forbidden() throws Exception {
        RegisterRequest request = new RegisterRequest(
                "Csrf Test Org",
                "csrf-test-org",
                "Admin User",
                "admin@csrf.test",
                "password123"
        );

        mockMvc.perform(post("/api/v1/auth/register")
                        .header("X-XSRF-TOKEN", "invalid-csrf-token-12345")
                        .cookie(new Cookie("XSRF-TOKEN", "different-or-fake-token"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("State-changing request with VALID CSRF token header and cookie MUST succeed (201 Created)")
    void stateChangingRequest_WithValidCsrfHeader_ShouldSucceed() throws Exception {
        RegisterRequest request = new RegisterRequest(
                "Csrf Test Org",
                "csrf-test-org",
                "Admin User",
                "admin@csrf.test",
                "password123"
        );

        mockMvc.perform(post("/api/v1/auth/register")
                        .with(CsrfTestUtils.csrfToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message").value("Registration successful"))
                .andExpect(jsonPath("$.user.email").value("admin@csrf.test"));
    }

    @Test
    @DisplayName("SPA Cookie-Header flow: Obtain CSRF from GET and submit via X-XSRF-TOKEN header to /api/v1/auth/login")
    void spaCookieHeaderFlow_ShouldAuthenticateSuccessfully() throws Exception {
        Organization org = organizationRepository.save(new Organization(UUID.randomUUID(), "Spa Org", "spa-org", true));
        userRepository.save(new User(UUID.randomUUID(), org, "Spa User", "spa@user.test", passwordEncoder.encode("secretPassword123"), Role.ADMIN, true));

        // 1. First GET request initializes XSRF-TOKEN
        MvcResult csrfResult = mockMvc.perform(get("/api/v1/auth/csrf"))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode json = objectMapper.readTree(csrfResult.getResponse().getContentAsString());
        String rawToken = json.get("token").asText();
        String headerName = json.has("headerName") ? json.get("headerName").asText() : "X-XSRF-TOKEN";

        LoginRequest loginRequest = new LoginRequest("spa-org", "spa@user.test", "secretPassword123");

        // 2. Perform POST with the cookie and header
        mockMvc.perform(post("/api/v1/auth/login")
                        .cookie(new Cookie("XSRF-TOKEN", rawToken))
                        .header(headerName, rawToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Login successful"))
                .andExpect(jsonPath("$.user.email").value("spa@user.test"));
    }
}
