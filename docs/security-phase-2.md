# Phase 2 Security Architecture, Threat Model & Mitigation Strategy

## Overview

This document defines the Security Architecture and Threat Model for **Phase 2 — Authentication & Multi-Tenancy** of the **AI Lead Conversion System**. The application serves **Indian Coaching and Training Institutes** in a multi-tenant SaaS environment.

Core Multi-Tenancy Invariant: **Data belonging to Organization A MUST NEVER be accessible or mutable by users belonging to Organization B.**

---

## 1. Explicit CSRF Protection Architecture (SPA + HttpOnly Cookie Auth)

### Threat Analysis & Why CORS Preflight Alone is Insufficient
In cookie-based authentication, the browser automatically attaches the `HttpOnly` authentication cookie (`jwt_token`) to requests matching the target origin/path. Although CORS preflight blocks cross-origin JavaScript from reading the response body of unauthorized domains, **it does not prevent simple cross-site requests or certain top-level navigations/form submissions from triggering state changes** if cookies are attached.

Therefore, the system implements **explicit, Defense-in-Depth Spring Security CSRF Protection** specifically configured for Single Page Applications (SPA).

### Architecture Components:
1. **`CookieCsrfTokenRepository.withHttpOnlyFalse()`**:
   - Stores the CSRF token in an un-HttpOnly cookie named `XSRF-TOKEN` (Path `/`).
   - Client-side JavaScript (React SPA) can read `XSRF-TOKEN` via `document.cookie` while the authentication `jwt_token` cookie remains strictly `HttpOnly`.

2. **`SpaCsrfTokenRequestHandler` & XOR BREACH Protection**:
   - Implements Spring Security 6 SPA CSRF handling.
   - Delegates token storage to `XorCsrfTokenRequestAttributeHandler` to protect against BREACH compression attacks.
   - Resolves incoming raw tokens submitted in request headers (`X-XSRF-TOKEN` or `X-CSRF-TOKEN`) for state-changing requests.

3. **`CsrfCookieFilter`**:
   - `OncePerRequestFilter` placed immediately after `CsrfFilter` in the Spring Security filter chain.
   - Evaluates deferred CSRF tokens, forcing the `XSRF-TOKEN` cookie to be committed in HTTP responses.

4. **HTTP Method Strategy**:
   - **Safe Methods (`GET`, `HEAD`, `OPTIONS`, `TRACE`)**: Exempt from CSRF verification.
   - **Mutating Methods (`POST`, `PUT`, `PATCH`, `DELETE`)**: Strictly require a valid CSRF token header matching the cookie. Missing or mismatched tokens receive HTTP `403 Forbidden`.

5. **Token Initialization Endpoint**:
   - `GET /api/v1/auth/csrf`: Explicitly exposes the CSRF token and header name to frontend clients upon bootstrapping.

6. **Frontend Integration (`frontend/src/services/api.ts`)**:
   - Utility extracts `XSRF-TOKEN` from `document.cookie`.
   - All state-changing requests automatically attach `X-XSRF-TOKEN: <token>` header.
   - `credentials: 'include'` is configured on all fetch calls.

---

## 2. Token Storage Architecture & Cookie Security

### HttpOnly Authentication Cookie
- **Cookie Name**: `jwt_token`
- **Attributes**:
  - `HttpOnly`: Enforced. Client-side JavaScript (`document.cookie`) cannot read or access the JWT token, neutralizing XSS token exfiltration attacks.
  - `SameSite=Lax`: Restricts cookie transmission on cross-site requests while permitting top-level navigations.
  - `Secure`: Controlled via `app.jwt.cookie-secure` (enabled in production HTTPS environments).
  - `Path=/`: Scoped to entire application path.
- **Zero Token in JSON**: `AuthResponse` returns only `message`, `expiresInMs`, and safe `UserResponse` metadata. The raw JWT string is **never** included in the JSON response body.
- **Zero Token Logging**: The JWT token string is never written to log files or exception traces.
- **Logout Strategy**: `POST /api/v1/auth/logout` explicitly clears the session with `Set-Cookie: jwt_token=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`.

---

## 3. Empirical BCrypt Benchmark & Work Factor Selection

### Development Environment Benchmark Results (Java 23, Windows x64)

The password hashing latency was empirically benchmarked across standard BCrypt strength factors using `BCryptBenchmarkTest.java`:

| BCrypt Strength | Avg Hash Time (ms) | Avg Verify Time (ms) | Brute-Force Resistance | DoS / CPU Starvation Risk |
| :--- | :--- | :--- | :--- | :--- |
| **Strength 10 (Selected)** | **~140.5 ms** | **~140.3 ms** | **High** (~7 hashes/sec/core) | **Low** (Safe for concurrent login traffic) |
| **Strength 11** | ~275.4 ms | ~275.5 ms | Very High (~3.6 hashes/sec/core) | Medium (Elevated thread saturation risk) |
| **Strength 12** | ~548.6 ms | ~548.3 ms | Extremely High (~1.8 hashes/sec/core)| High (Severe bottleneck under burst logins) |

### Rational for Strength Factor 10:
- **Brute-Force Resistance**: At ~140ms per verification, an attacker attempting an offline dictionary attack on a stolen hash is limited to fewer than 8 guesses per second per CPU core, rendering brute force computationally intractable.
- **DoS Prevention & Thread Protection**: A 140ms computation window prevents CPU thread exhaustion during concurrent login spikes from coaching institute staff without sacrificing cryptographic security.

---

## 4. Tenant Test Endpoint Isolation & Production Safety

### Strict Test-Only Isolation
- **Location**: `TenantTestController.java` is strictly located in test sources: `backend/src/test/java/com/ailead/conversion/controller/TenantTestController.java`.
- **Profile Guard**: Annotated with `@Profile("test")` so it is never instantiated outside active test executions.
- **Production Build Guarantee**: Because it resides in `src/test/java`, Maven never compiles or packages `TenantTestController` into the production artifact (`.jar`).
- **Production Endpoint Exposure Test**: `ProductionEndpointExposureTest.java` validates that `/api/v1/test/tenant-resources/**` returns `404 Not Found` in production profiles.

---

## 5. Threat Matrix & Mitigation Controls

| # | Threat Vector | Attack Scenario | Mitigation Control | Verification Test |
| :- | :--- | :--- | :--- | :--- |
| 1 | **CSRF Form Submission** | Cross-origin site triggers state change via browser-attached cookies | Spring Security `CookieCsrfTokenRepository` + `SpaCsrfTokenRequestHandler` enforcing `X-XSRF-TOKEN` header on mutating requests | `CsrfSecurityTest.java` |
| 2 | **Cross-Tenant IDOR (Path)** | Org A user accesses `/organizations/{orgBId}` | Tenant verification ensures path UUID matches authenticated user's `organizationId` from `SecurityContext` | `TenantIsolationTest.java` |
| 3 | **Cross-Tenant IDOR (Query/Body)**| Org A user passes Org B ID in query string or JSON payload | Server ignores client-supplied tenant overrides; resolves tenant strictly from DB authority | `TenantIsolationTest.java` |
| 4 | **Credential Stuffing** | Rapid automated password guessing | BCrypt strength 10 (~140ms cost factor); non-enumerating generic error messages ("Invalid credentials") | `AuthControllerTest.java`, `BCryptBenchmarkTest.java` |
| 5 | **Privilege Escalation** | `STAFF` or `COUNSELOR` attempts admin organization updates | Method-level security (`@PreAuthorize("hasRole('ADMIN')")`) | `SecurityConfigTest.java` |
| 6 | **JWT Forgery & Tampering** | Attacker crafts forged JWT with modified claims | HMAC-SHA256 signature verification against 256-bit secret loaded from environment | `SecurityConfigTest.java` |
| 7 | **Token Expiration** | Attacker reuses captured stale token | Strict expiration timestamp (`exp` claim) validated by `JwtAuthenticationFilter` on every request | `SecurityConfigTest.java` |
| 8 | **Inactive Account Access** | Suspended user or disabled institute attempts login | Active status checks on both User and Organization prior to token verification/issuance | `AuthControllerTest.java`, `SecurityConfigTest.java` |
| 9 | **Password / Hash Exposure**| Hashes leaked in API responses or logs | DTO projection (`UserResponse`) completely omits password fields; stack traces suppressed in production | `AuthControllerTest.java` |
| 10| **Test Endpoint Exposure**| Attackers discover diagnostic/test endpoints in production | Test controllers isolated in `src/test/java` with `@Profile("test")`; returns HTTP 404 in production | `ProductionEndpointExposureTest.java` |
