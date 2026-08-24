package com.ailead.conversion.controller;

import com.ailead.conversion.entity.Organization;
import com.ailead.conversion.entity.Role;
import com.ailead.conversion.entity.User;
import com.ailead.conversion.repository.OrganizationRepository;
import com.ailead.conversion.repository.UserRepository;
import com.ailead.conversion.security.UserPrincipal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Organization orgA;
    private Organization orgB;
    private User adminA;
    private User counselorA;
    private User counselorB;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
        organizationRepository.deleteAll();

        orgA = organizationRepository.save(new Organization(UUID.randomUUID(), "Alpha Institute", "alpha-inst", true));
        orgB = organizationRepository.save(new Organization(UUID.randomUUID(), "Beta Institute", "beta-inst", true));

        String encoded = passwordEncoder.encode("pass123");

        adminA = userRepository.save(new User(UUID.randomUUID(), orgA, "Admin Alpha", "admin@alpha.test", encoded, Role.ADMIN, true));
        counselorA = userRepository.save(new User(UUID.randomUUID(), orgA, "Counselor Alpha", "counselor@alpha.test", encoded, Role.COUNSELOR, true));
        counselorB = userRepository.save(new User(UUID.randomUUID(), orgB, "Counselor Beta", "counselor@beta.test", encoded, Role.COUNSELOR, true));
    }

    @Test
    @DisplayName("GET /api/v1/users/me returns authenticated user context")
    void testGetCurrentUser() throws Exception {
        UserPrincipal principal = UserPrincipal.create(adminA);

        mockMvc.perform(get("/api/v1/users/me").with(user(principal)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(adminA.getId().toString())))
                .andExpect(jsonPath("$.email", is("admin@alpha.test")))
                .andExpect(jsonPath("$.role", is("ADMIN")))
                .andExpect(jsonPath("$.organization.slug", is("alpha-inst")));
    }

    @Test
    @DisplayName("GET /api/v1/users returns only users from current organization (tenant isolation)")
    void testGetOrganizationUsersTenantIsolation() throws Exception {
        UserPrincipal principal = UserPrincipal.create(adminA);

        mockMvc.perform(get("/api/v1/users").with(user(principal)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].organization.id", is(orgA.getId().toString())))
                .andExpect(jsonPath("$[1].organization.id", is(orgA.getId().toString())));
    }
}
