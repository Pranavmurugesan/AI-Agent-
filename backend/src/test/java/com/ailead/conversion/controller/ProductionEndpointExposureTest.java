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

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Verifies that test-only endpoints (e.g. /api/v1/test/**) are completely disabled / absent
 * when running under production configuration (where the "test" profile is inactive).
 */
@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:proddb;DB_CLOSE_DELAY=-1;MODE=PostgreSQL",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.flyway.enabled=true"
})
@AutoConfigureMockMvc
@ActiveProfiles("production-simulation")
class ProductionEndpointExposureTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User adminUser;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
        organizationRepository.deleteAll();

        Organization org = organizationRepository.save(new Organization(UUID.randomUUID(), "Prod Org", "prod-org", true));
        adminUser = userRepository.save(new User(UUID.randomUUID(), org, "Admin", "admin@prod.test", passwordEncoder.encode("secret"), Role.ADMIN, true));
    }

    @Test
    @DisplayName("In non-test profile, /api/v1/test/tenant-resources endpoints MUST NOT exist (404 Not Found)")
    void testEndpoints_MustNotExistInProductionConfiguration() throws Exception {
        UserPrincipal principal = UserPrincipal.create(adminUser);
        UUID randomOrgId = UUID.randomUUID();

        // Even with valid authenticated credentials, the test controller is not loaded and returns 404
        mockMvc.perform(get("/api/v1/test/tenant-resources/" + randomOrgId).with(user(principal)))
                .andExpect(status().isNotFound());
    }
}
