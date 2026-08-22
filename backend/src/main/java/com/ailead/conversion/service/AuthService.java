package com.ailead.conversion.service;

import com.ailead.conversion.dto.AuthResponse;
import com.ailead.conversion.dto.LoginRequest;
import com.ailead.conversion.dto.RegisterRequest;
import com.ailead.conversion.dto.UserResponse;
import com.ailead.conversion.entity.Organization;
import com.ailead.conversion.entity.Role;
import com.ailead.conversion.entity.User;
import com.ailead.conversion.repository.OrganizationRepository;
import com.ailead.conversion.repository.UserRepository;
import com.ailead.conversion.security.JwtAuthenticationFilter;
import com.ailead.conversion.security.JwtTokenProvider;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Locale;
import java.util.UUID;

@Service
public class AuthService {

    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    @org.springframework.beans.factory.annotation.Value("${app.jwt.cookie-secure:false}")
    private boolean cookieSecure;

    public AuthService(OrganizationRepository organizationRepository,
                       UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider tokenProvider) {
        this.organizationRepository = organizationRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request, HttpServletResponse response) {
        String slug = request.getOrganizationSlug();
        if (slug == null || slug.isBlank()) {
            slug = generateSlug(request.getOrganizationName());
        } else {
            slug = slug.toLowerCase(Locale.ROOT).trim().replaceAll("[^a-z0-9-]", "-");
        }

        if (organizationRepository.existsBySlug(slug)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Organization slug already exists: " + slug);
        }

        String normalizedEmail = request.getEmail().toLowerCase(Locale.ROOT).trim();

        // 1. Create Organization
        Organization organization = new Organization(UUID.randomUUID(), request.getOrganizationName().trim(), slug, true);
        organization = organizationRepository.save(organization);

        // 2. Create Admin User
        String passwordHash = passwordEncoder.encode(request.getPassword());
        User adminUser = new User(
                UUID.randomUUID(),
                organization,
                request.getName().trim(),
                normalizedEmail,
                passwordHash,
                Role.ADMIN,
                true
        );
        adminUser = userRepository.save(adminUser);

        // 3. Issue Token & Set HttpOnly Cookie (JWT is NOT exposed in response body)
        String token = tokenProvider.generateToken(adminUser.getId());
        setJwtCookie(response, token, (int) (tokenProvider.getExpirationMs() / 1000));

        return new AuthResponse("Registration successful", tokenProvider.getExpirationMs(), UserResponse.fromEntity(adminUser));
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request, HttpServletResponse response) {
        String slug = request.getOrganizationSlug().toLowerCase(Locale.ROOT).trim();
        String normalizedEmail = request.getEmail().toLowerCase(Locale.ROOT).trim();

        User user = userRepository.findByOrganizationSlugAndEmail(slug, normalizedEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        if (!user.isActive() || !user.getOrganization().isActive()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Account or organization is inactive");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        // Issue Token & Set HttpOnly Cookie (JWT is NOT exposed in response body)
        String token = tokenProvider.generateToken(user.getId());
        setJwtCookie(response, token, (int) (tokenProvider.getExpirationMs() / 1000));

        return new AuthResponse("Login successful", tokenProvider.getExpirationMs(), UserResponse.fromEntity(user));
    }

    public void logout(HttpServletResponse response) {
        setJwtCookie(response, "", 0);
    }

    private void setJwtCookie(HttpServletResponse response, String token, int maxAgeSeconds) {
        if (response != null) {
            String secureAttr = cookieSecure ? "; Secure" : "";
            // SameSite=Lax + HttpOnly + Secure attribute header for browser XSS/CSRF protection
            response.addHeader("Set-Cookie", String.format(
                    "%s=%s; Path=/; Max-Age=%d; HttpOnly; SameSite=Lax%s",
                    JwtAuthenticationFilter.COOKIE_NAME, token, maxAgeSeconds, secureAttr));
        }
    }

    private String generateSlug(String input) {
        if (input == null) return "org-" + UUID.randomUUID().toString().substring(0, 8);
        String slug = input.toLowerCase(Locale.ROOT).trim().replaceAll("[^a-z0-9]", "-").replaceAll("-+", "-");
        if (slug.startsWith("-")) slug = slug.substring(1);
        if (slug.endsWith("-")) slug = slug.substring(0, slug.length() - 1);
        if (slug.isEmpty()) slug = "org-" + UUID.randomUUID().toString().substring(0, 8);
        return slug;
    }
}
