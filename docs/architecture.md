# System Architecture — AI Lead Conversion System

## Overview

The **AI Lead Conversion System** is a production-oriented SaaS application designed specifically for **Indian coaching and training institutes**. Its primary objective is to capture incoming student enquiries, qualify leads using AI, perform automated follow-ups, and convert student prospects into enrolled institute customers.

---

## High-Level Architecture (Phase 1 Foundation)

```text
                              USER (Browser)
                                    │
                                    ▼
                         React Frontend (Vite)
                     (Port 5173 / Production Web)
                                    │
                                    │ HTTP / REST (/api/v1/health)
                                    ▼
                        Spring Boot REST API
                             (Port 8080)
                                    │
              ┌─────────────────────┴─────────────────────┐
              │                                           │
       Business Services                              PostgreSQL 16
   (Controller, DTO, Exception)                   (Port 5432 / Docker)
              │
              ▼
       Future AI Layer (Phase 5+)
              │
       Future n8n Layer (Phase 7+)
              │
       Future WhatsApp Integration (Phase 8+)
```

---

## Core Components

### 1. Frontend Layer (`/frontend`)
- **Technology**: React 18, TypeScript, Tailwind CSS, Vite.
- **Role**: Single Page Application (SPA) providing an institute dashboard layout (Sidebar, Navbar, Main Content Area).
- **Communication**: Centralized API abstraction (`services/api.ts`) connecting to the backend via `fetch` with error resilience, loading indicators, and retry triggers.

### 2. Backend Layer (`/backend`)
- **Technology**: Java 21, Spring Boot 3.4, Spring Web, Spring Data JPA, Spring Validation.
- **Role**: Layered REST API managing request routing, global exception handling, input validation, and business logic.
- **Health Monitoring**: Exposes `GET /api/v1/health` returning `{"status": "UP", "service": "AI Lead Conversion System"}`.
- **CORS & Security**: Externalized CORS allowed origins via `app.cors.allowed-origins`.

### 3. Database Layer (`/database`)
- **Technology**: PostgreSQL 16 (hosted via Docker Compose or native service on port `5432`).
- **Configuration**: Strictly environment variable driven (`DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`).
- **Connection Proof**: JPA context connection verified during application startup.

### 4. Future System Integrations (Deferred Boundary)
- **AI Layer (Phase 5-6)**: LLM integration, qualification prompt pipelines, agentic lead classification.
- **Automation Layer (Phase 7)**: Reserved under `/automation` directory for n8n workflow configurations.
- **Messaging Layer (Phase 8)**: WhatsApp Business API integration for Indian coaching institute student communication.
