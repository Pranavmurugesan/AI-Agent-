# Product Evolution Roadmap — AI Lead Conversion System

Target Market: **Indian Coaching and Training Institutes**

---

## 10-Phase Evolution Strategy

### Phase 1 — Project Foundation [COMPLETED]
- Establish clean, modular workspace layout (`/backend`, `/frontend`, `/docs`, `/automation`).
- Configure Java 21 Spring Boot REST API + React Vite TypeScript Frontend + PostgreSQL.
- Implement `GET /api/v1/health` endpoint returning JSON status.
- Implement centralized frontend API service with live status indicator (`Connected` / `Unavailable`).
- Implement global exception handling, externalized environment config (`.env.example`), and zero-secret Git tracking.

### Phase 2 — Authentication & Multi-Tenancy
- Institute User registration & login (JWT authentication).
- Multi-tenant organization isolation for coaching institutes.
- Role-based access control (Institute Admin, Counselor, Staff).

### Phase 3 — Lead Capture & Management
- Enquiries & Leads DB schema (Lead, Course, Campus, Source).
- REST APIs for creating, listing, and filtering student enquiries.
- Webhook endpoints for Indian ad platforms (Meta Ads, Google Forms, Website widgets).

### Phase 4 — Communication & Conversation Tracking
- Conversation schema & message history log.
- Institute counselor manual chat interface.
- Lead status workflow (New, Contacted, Qualified, Trial Scheduled, Enrolled, Dropped).

### Phase 5 — AI Core & Knowledge Base
- RAG (Retrieval-Augmented Generation) pipeline for institute course details, fee structures, batch timings, FAQs.
- Vector database integration for instant institute knowledge retrieval.

### Phase 6 — AI Qualifier Agent
- Automated lead qualification bot evaluating student intent, budget, batch preference, and urgency.
- Lead score generation (Hot / Warm / Cold).

### Phase 7 — n8n Workflow Automation
- n8n integration using `/automation` workflow specs.
- Event-driven lead dispatch and CRM synchronization.

### Phase 8 — WhatsApp Business Integration
- WhatsApp API webhooks for automated student messages in India.
- Instant automated replies upon receiving new WhatsApp student enquiries.

### Phase 9 — Institute Analytics & Conversion Dashboard
- Enrolment conversion metrics, counselor performance, AI response latency analytics.
- Daily student enquiry reports.

### Phase 10 — Production Deployment & Hardening
- Production Docker containerization, Kubernetes/Cloud deployment.
- CI/CD pipeline, SSL/TLS, rate limiting, and production monitoring.
