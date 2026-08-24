# Phase 3 Security Architecture, Threat Model & Multi-Tenancy Controls

## Overview

This document specifies the security controls, tenant isolation guarantees, and Role-Based Access Control (RBAC) rules for **Phase 3 — Core Lead Management Engine**.

Core Multi-Tenancy Invariant: **Organization A MUST NEVER be able to read, create, modify, assign, or delete leads, courses, activities, or follow-ups belonging to Organization B.**

---

## 1. Server-Authoritative Multi-Tenancy Architecture

All Phase 3 entities (`Course`, `Lead`, `LeadActivity`, `FollowUp`) are strictly bound to an `Organization`.

```
                    ┌────────────────────────┐
                    │ Incoming HTTP Request  │
                    └───────────┬────────────┘
                                │
                 [JwtAuthenticationFilter]
                                │
             Extracts userId from valid JWT cookie
                                │
             Loads User + Organization from Database
                                │
                 [SecurityContextHolder]
             Holds UserPrincipal(orgId, role)
                                │
                 [REST Controller Layer]
        @AuthenticationPrincipal UserPrincipal principal
                                │
                 [Domain Service Layer]
    Forces tenant scoping: repository.findByOrgIdAndId(orgId, id)
```

### Prevention of Client Override (Anti-IDOR)
1. **No URL/Header Overrides**: No client-provided `organizationId` parameter in route paths, query parameters, request bodies, or custom headers is ever accepted or trusted for scoping.
2. **Database Isolation**:
   - `LeadRepository.findByIdAndOrganizationId(leadId, orgId)`
   - `CourseRepository.findByIdAndOrganizationId(courseId, orgId)`
   - `FollowUpRepository.findByIdAndOrganizationId(followUpId, orgId)`
   - `LeadActivityRepository.findByLeadIdAndOrganizationId(leadId, orgId)`
3. **Cross-Tenant Entity Validation**:
   - When a lead is assigned to a counselor (`assignedToUserId`), the service validates that `assignedUser.organization.id == principal.organizationId`.
   - When a course is linked to a lead (`courseId`), the service validates that `course.organization.id == principal.organizationId`.
   - Passing foreign UUIDs results in HTTP `400 Bad Request` or `404 Not Found` (never cross-tenant leakage).

---

## 2. RBAC Permission Matrix

Phase 3 enforces strict role segregation across `ADMIN`, `COUNSELOR`, and `STAFF`:

| Endpoint / Operation | HTTP Method | `ADMIN` | `COUNSELOR` | `STAFF` | Security Enforcement |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **List Courses** | `GET /api/v1/courses` | Allowed | Allowed | Allowed | Scoped to `principal.orgId` |
| **Create Course** | `POST /api/v1/courses` | Allowed | Denied (403) | Denied (403) | `@PreAuthorize("hasRole('ADMIN')")` |
| **Update Course** | `PUT /api/v1/courses/{id}` | Allowed | Denied (403) | Denied (403) | `@PreAuthorize("hasRole('ADMIN')")` |
| **Delete Course** | `DELETE /api/v1/courses/{id}` | Allowed | Denied (403) | Denied (403) | `@PreAuthorize("hasRole('ADMIN')")` |
| **List Leads** | `GET /api/v1/leads` | All Org Leads | Assigned / Unassigned Only | All Org Leads (Read) | Service query filtering |
| **Create Lead** | `POST /api/v1/leads` | Allowed | Allowed | Allowed | Authenticated users |
| **Get Lead Details** | `GET /api/v1/leads/{id}` | Allowed | Assigned Only (403 otherwise)| Allowed | Tenant + Role check |
| **Update Lead Info** | `PUT /api/v1/leads/{id}` | Allowed | Assigned Only | Allowed | Tenant + Role check |
| **Update Lead Status** | `PATCH /api/v1/leads/{id}/status`| Allowed | Assigned Only | Denied (403) | `@PreAuthorize("hasAnyRole('ADMIN', 'COUNSELOR')")` |
| **Assign Counselor** | `POST /api/v1/leads/{id}/assign` | Allowed | Denied (403) | Denied (403) | `@PreAuthorize("hasRole('ADMIN')")` |
| **Delete Lead** | `DELETE /api/v1/leads/{id}` | Allowed | Denied (403) | Denied (403) | `@PreAuthorize("hasRole('ADMIN')")` |
| **List Activities** | `GET /api/v1/leads/{id}/activities` | Allowed | Assigned Only | Allowed | Tenant + Role check |
| **Add Activity Note** | `POST /api/v1/leads/{id}/activities`| Allowed | Assigned Only | Allowed | Tenant + Role check |
| **List Follow-ups** | `GET /api/v1/follow-ups` | All Org Tasks | Assigned Tasks Only | All Org Tasks | Service query filtering |
| **Create Follow-up** | `POST /api/v1/leads/{id}/follow-ups`| Allowed | Allowed | Allowed | Tenant check |
| **Complete Follow-up**| `PATCH /api/v1/follow-ups/{id}/complete`| Allowed | Assigned Only | Assigned Only | Tenant + Assignee check |
| **Dashboard Metrics** | `GET /api/v1/dashboard/metrics` | Full Org Metrics | Personal Metrics | Overview Metrics | Service query projection |

---

## 3. Threat Model & Mitigation Strategy

| # | Threat Vector | Attack Scenario | Mitigation Control | Test Validation |
| :- | :--- | :--- | :--- | :--- |
| 1 | **Cross-Tenant Lead IDOR** | Org A counselor accesses `/api/v1/leads/{orgBLeadId}` | Scoped JPA lookup with `organization_id` returns HTTP `404 Not Found` / `403 Forbidden` | `Phase3TenantIsolationTest.java` |
| 2 | **Cross-Tenant Counselor Injection** | Org A admin assigns lead to counselor from Org B | Service explicitly verifies `assignee.organization.id == principal.orgId` before save | `Phase3TenantIsolationTest.java` |
| 3 | **Cross-Tenant Course Association** | Org A user links lead to Org B course | Service checks `course.organization.id == principal.orgId` | `Phase3TenantIsolationTest.java` |
| 4 | **Unauthorized Status Transition** | `STAFF` user changes pipeline to `CONVERTED` | Method security `@PreAuthorize` restricts status updates to `ADMIN` and `COUNSELOR` | `Phase3RbacTest.java` |
| 5 | **Counselor Privilege Escalation** | Counselor attempts to reassign leads across peers | Assignment API restricted to `ADMIN` role | `Phase3RbacTest.java` |
| 6 | **Cross-Site Request Forgery (CSRF)** | Malicious website triggers unauthorized lead deletion | Continued Phase 2 CSRF defense: `XSRF-TOKEN` cookie + `X-XSRF-TOKEN` header validation | `Phase3CsrfTest.java` |
| 7 | **SQL Injection via Filters** | Malicious search query passed in lead filter string | Spring Data JPA parameter binding with CriteriaBuilder / typed JPQL | `LeadRepositoryTest.java` |
| 8 | **Soft-Delete Data Leakage** | Deleted lead appearing in search or reports | Repository methods filter out `deleted = true` by default | `LeadServiceTest.java` |
