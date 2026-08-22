package com.ailead.conversion.controller;

import com.ailead.conversion.dto.LoginRequest;
import com.ailead.conversion.dto.RegisterRequest;
import com.ailead.conversion.entity.Organization;
import com.ailead.conversion.entity.Role;
import com.ailead.conversion.entity.User;
import com.ailead.conversion.repository.OrganizationRepository;
import com.ailead.conversion.repository.UserRepository;
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

import java.util.UUID;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerTest {

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
    @DisplayName("Registration should create organization and admin user, set HttpOnly cookie, omit JWT from JSON, and omit passwordHash")
    void register_ShouldCreateOrganizationAndAdminUser() throws Exception {
        RegisterRequest request = new RegisterRequest(
                "Alpha Coaching",
                "alpha-coaching",
                "Pranav Admin",
                "admin@alpha.test",
                "password123"
        );

        mockMvc.perform(post("/api/v1/auth/register")
                        .with(CsrfTestUtils.csrfToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(header().string("Set-Cookie", containsString("jwt_token=")))
                .andExpect(header().string("Set-Cookie", containsString("HttpOnly")))
                .andExpect(header().string("Set-Cookie", containsString("SameSite=Lax")))
                .andExpect(jsonPath("$.token").doesNotExist())
                .andExpect(jsonPath("$.jwt").doesNotExist())
                .andExpect(jsonPath("$.user.email").value("admin@alpha.test"))
                .andExpect(jsonPath("$.user.role").value("ADMIN"))
                .andExpect(jsonPath("$.user.organization.slug").value("alpha-coaching"))
                .andExpect(jsonPath("$.user.passwordHash").doesNotExist())
                .andExpect(jsonPath("$.user.password").doesNotExist());
    }

    @Test
    @DisplayName("Login should authenticate active user, set HttpOnly cookie, omit JWT from JSON, and return User info")
    void login_ShouldAuthenticateAndReturnJwtCookie() throws Exception {
        Organization org = organizationRepository.save(new Organization(UUID.randomUUID(), "Beta Academy", "beta-academy", true));
        userRepository.save(new User(UUID.randomUUID(), org, "Counselor Beta", "counselor@beta.test", passwordEncoder.encode("secretPass123"), Role.COUNSELOR, true));

        LoginRequest loginRequest = new LoginRequest("beta-academy", "counselor@beta.test", "secretPass123");

        mockMvc.perform(post("/api/v1/auth/login")
                        .with(CsrfTestUtils.csrfToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(header().string("Set-Cookie", containsString("jwt_token=")))
                .andExpect(header().string("Set-Cookie", containsString("HttpOnly")))
                .andExpect(header().string("Set-Cookie", containsString("SameSite=Lax")))
                .andExpect(jsonPath("$.token").doesNotExist())
                .andExpect(jsonPath("$.jwt").doesNotExist())
                .andExpect(jsonPath("$.user.role").value("COUNSELOR"))
                .andExpect(jsonPath("$.user.passwordHash").doesNotExist())
                .andExpect(jsonPath("$.user.password").doesNotExist());
    }

    @Test
    @DisplayName("Inactive user should be rejected during login with HTTP 401")
    void login_InactiveUser_ShouldReturn401() throws Exception {
        Organization org = organizationRepository.save(new Organization(UUID.randomUUID(), "Gamma Institute", "gamma-inst", true));
        userRepository.save(new User(UUID.randomUUID(), org, "Inactive User", "disabled@gamma.test", passwordEncoder.encode("secretPass123"), Role.STAFF, false));

        LoginRequest loginRequest = new LoginRequest("gamma-inst", "disabled@gamma.test", "secretPass123");

        mockMvc.perform(post("/api/v1/auth/login")
                        .with(CsrfTestUtils.csrfToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Account or organization is inactive"));
    }

    @Test
    @DisplayName("Logout should clear jwt_token cookie with Max-Age=0")
    void logout_ShouldClearJwtCookie() throws Exception {
        mockMvc.perform(post("/api/v1/auth/logout")
                        .with(CsrfTestUtils.csrfToken()))
                .andExpect(status().isOk())
                .andExpect(header().string("Set-Cookie", containsString("Max-Age=0")));
    }
}
