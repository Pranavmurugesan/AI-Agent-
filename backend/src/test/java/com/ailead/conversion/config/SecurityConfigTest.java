package com.ailead.conversion.config;

import com.ailead.conversion.entity.Organization;
import com.ailead.conversion.entity.Role;
import com.ailead.conversion.entity.User;
import com.ailead.conversion.repository.OrganizationRepository;
import com.ailead.conversion.repository.UserRepository;
import com.ailead.conversion.security.JwtAuthenticationFilter;
import com.ailead.conversion.security.JwtTokenProvider;
import com.ailead.conversion.security.UserPrincipal;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SecurityConfigTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    private User adminUser;
    private User counselorUser;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
        organizationRepository.deleteAll();

        Organization org = organizationRepository.save(new Organization(UUID.randomUUID(), "Test Academy", "test-academy", true));
        adminUser = userRepository.save(new User(UUID.randomUUID(), org, "Admin User", "admin@test.com", passwordEncoder.encode("pass"), Role.ADMIN, true));
        counselorUser = userRepository.save(new User(UUID.randomUUID(), org, "Counselor User", "counselor@test.com", passwordEncoder.encode("pass"), Role.COUNSELOR, true));
    }

    @Test
    @DisplayName("Unauthenticated request to protected endpoint should return HTTP 401 Unauthorized")
    void unauthenticatedRequest_ShouldReturn401() throws Exception {
        mockMvc.perform(get("/api/v1/users/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Malformed JWT in HttpOnly cookie should return HTTP 401 Unauthorized")
    void malformedJwt_ShouldReturn401() throws Exception {
        mockMvc.perform(get("/api/v1/users/me")
                        .cookie(new Cookie(JwtAuthenticationFilter.COOKIE_NAME, "invalid.malformed.jwt")))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("JWT signed with an invalid signature key should return HTTP 401 Unauthorized")
    void invalidSignatureJwt_ShouldReturn401() throws Exception {
        String badSecret = "WrongSecretKey12345678901234567890123456789012";
        String tokenWithBadSignature = Jwts.builder()
                .subject(adminUser.getId().toString())
                .expiration(new Date(System.currentTimeMillis() + 60000))
                .signWith(Keys.hmacShaKeyFor(badSecret.getBytes(StandardCharsets.UTF_8)), Jwts.SIG.HS256)
                .compact();

        mockMvc.perform(get("/api/v1/users/me")
                        .cookie(new Cookie(JwtAuthenticationFilter.COOKIE_NAME, tokenWithBadSignature)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Expired JWT token should return HTTP 401 Unauthorized")
    void expiredJwt_ShouldReturn401() throws Exception {
        String secret = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";
        String expiredToken = Jwts.builder()
                .subject(adminUser.getId().toString())
                .expiration(new Date(System.currentTimeMillis() - 10000)) // 10s in the past
                .signWith(Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8)), Jwts.SIG.HS256)
                .compact();

        mockMvc.perform(get("/api/v1/users/me")
                        .cookie(new Cookie(JwtAuthenticationFilter.COOKIE_NAME, expiredToken)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Inactive user presenting a valid JWT should return HTTP 401 Unauthorized")
    void inactiveUserWithValidJwt_ShouldReturn401() throws Exception {
        adminUser.setActive(false);
        userRepository.save(adminUser);

        String validToken = tokenProvider.generateToken(adminUser.getId());

        mockMvc.perform(get("/api/v1/users/me")
                        .cookie(new Cookie(JwtAuthenticationFilter.COOKIE_NAME, validToken)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Inactive organization presenting a valid JWT should return HTTP 401 Unauthorized")
    void inactiveOrgWithValidJwt_ShouldReturn401() throws Exception {
        Organization org = adminUser.getOrganization();
        org.setActive(false);
        organizationRepository.save(org);

        String validToken = tokenProvider.generateToken(adminUser.getId());

        mockMvc.perform(get("/api/v1/users/me")
                        .cookie(new Cookie(JwtAuthenticationFilter.COOKIE_NAME, validToken)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("COUNSELOR role attempting ADMIN-only endpoint should return HTTP 403 Forbidden")
    void counselorRole_AccessingAdminEndpoint_ShouldReturn403() throws Exception {
        UserPrincipal counselorPrincipal = UserPrincipal.create(counselorUser);

        mockMvc.perform(get("/api/v1/test/tenant-resources/admin-only").with(user(counselorPrincipal)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("ADMIN role attempting ADMIN-only endpoint should be ALLOWED (200 OK)")
    void adminRole_AccessingAdminEndpoint_ShouldBeAllowed() throws Exception {
        UserPrincipal adminPrincipal = UserPrincipal.create(adminUser);

        mockMvc.perform(get("/api/v1/test/tenant-resources/admin-only").with(user(adminPrincipal)))
                .andExpect(status().isOk());
    }
}
