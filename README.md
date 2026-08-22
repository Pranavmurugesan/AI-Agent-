# AI Lead Conversion System

> A production-oriented SaaS application designed to capture customer enquiries, qualify leads using AI, automate follow-ups, and help businesses convert more student prospects into enrolled customers.

**Initial Target Market**: Indian coaching and training institutes.

---

## Current Status: Phase 1 — Project Foundation

Phase 1 establishes a clean, scalable technical foundation for the system:

```text
React Frontend (Vite + TypeScript + Tailwind CSS)
       ↓ (HTTP REST / API Service Layer)
Spring Boot REST API (Java 21 + Spring Web + Validation)
       ↓ (Spring Data JPA)
PostgreSQL 16 (Docker Compose / Local Service)
       ↓
Git / GitHub Repository
```

---

## Technology Stack

### Backend
- **Language & Runtime**: Java 21 (JDK 23 runtime)
- **Framework**: Spring Boot 3.4.3 (Spring Web, Spring Validation, Spring Data JPA)
- **Database Driver**: PostgreSQL JDBC Driver
- **Testing**: JUnit 5, Spring Boot Test, MockMvc, H2 (test profile)
- **Build Tool**: Apache Maven 3.9+

### Frontend
- **Framework**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, PostCSS, Lucide Icons
- **HTTP Layer**: Centralized `ApiService` class (`services/api.ts`)

### Infrastructure & Operations
- **Database**: PostgreSQL 16 Alpine
- **Containerization**: Docker Compose (`docker-compose.yml`)
- **Version Control**: Git

---

## Project Structure

```text
ai-lead-conversion-system/
│
├── backend/                  # Spring Boot 3.4 Java 21 REST API
│   ├── src/
│   │   ├── main/java/com/ailead/conversion/
│   │   │   ├── controller/   # HealthController (GET /api/v1/health)
│   │   │   ├── service/      # Business logic services placeholder
│   │   │   ├── repository/   # Data repositories placeholder
│   │   │   ├── entity/       # JPA Entities placeholder
│   │   │   ├── dto/          # HealthResponse DTO
│   │   │   ├── config/       # CorsConfig
│   │   │   ├── exception/    # GlobalExceptionHandler & ErrorResponse
│   │   │   └── util/         # Utility classes
│   │   └── resources/        # application.yml (Environment-driven config)
│   └── pom.xml               # Maven build specification
│
├── frontend/                 # React 18 TypeScript Single Page Application
│   ├── src/
│   │   ├── components/       # Navbar, Sidebar, HealthWidget, StatCard
│   │   ├── pages/            # DashboardPage
│   │   ├── layouts/          # DashboardLayout
│   │   ├── services/         # Centralized api.ts service abstraction
│   │   ├── hooks/            # useHealthCheck.ts custom hook
│   │   ├── types/            # api.ts TypeScript interfaces
│   │   └── index.css         # Tailwind directives & glassmorphism utilities
│   ├── index.html            # Entry HTML
│   └── vite.config.ts        # Vite dev server & API proxy setup
│
├── docs/                     # Architectural & operational documentation
│   ├── architecture.md       # High-level architecture diagram & component breakdown
│   ├── roadmap.md            # 10-phase SaaS evolution roadmap
│   └── development.md        # Local setup, testing, and git workflow
│
├── automation/               # Reserved for future n8n workflow configurations
│   └── .gitkeep
│
├── .env.example              # Documented environment variable template (No secrets)
├── .gitignore                # Filters .env, node_modules, target, dist, IDE files
├── docker-compose.yml        # Local PostgreSQL 16 container service
└── README.md                 # Root project documentation
```

---

## Prerequisites

- **Java Development Kit (JDK)**: 21 or higher
- **Apache Maven**: 3.8+
- **Node.js**: 18.0+
- **npm**: 9.0+
- **Docker & Docker Compose** (or native PostgreSQL 16 service)
- **Git**: 2.30+

---

## Local Quickstart Guide

### 1. Clone & Configure Environment

```bash
# Clone the repository
git clone <repository-url>
cd "Ai Agent Project"

# Copy template environment variables to local .env
cp .env.example .env
```

Verify `.env` configuration:
```env
SERVER_PORT=8080
CORS_ALLOWED_ORIGINS=http://localhost:5173
DATABASE_URL=jdbc:postgresql://localhost:5432/ailead_db
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres_secret_pass
```

### 2. Start PostgreSQL

```bash
# Using Docker Compose:
docker compose up -d

# Or ensure your local PostgreSQL service is running on port 5432 with database `ailead_db`.
```

### 3. Start Backend REST API

```bash
cd backend
mvn spring-boot:run
```

The Spring Boot backend will start on `http://localhost:8080`.

Verify health endpoint:
```bash
curl http://localhost:8080/api/v1/health
```

Output:
```json
{
  "status": "UP",
  "service": "AI Lead Conversion System"
}
```

### 4. Start Frontend Application

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

Open your browser at `http://localhost:5173`. You will see the institute dashboard shell displaying **Backend Status: Connected**.

---

## API Documentation

### Health Endpoint

```http
GET /api/v1/health
```

#### Response (HTTP 200 OK)
```json
{
  "status": "UP",
  "service": "AI Lead Conversion System"
}
```

---

## Running Automated Verification & Tests

### Backend Unit & Integration Tests
```bash
cd backend
mvn clean test
```

### Backend Production Build
```bash
cd backend
mvn package
```

### Frontend Type Check & Build
```bash
cd frontend
npm run build
```

---

## Product Roadmap (Future Phases)

- **Phase 1 — Project Foundation** *(Current)*: Architecture, Health API, React shell, DB setup.
- **Phase 2 — Authentication & Multi-Tenancy**: Organization isolation & counselor login.
- **Phase 3 — Lead Capture & Management**: Student enquiry intake & lead database.
- **Phase 4 — Conversations & Follow-ups**: Interaction logs & status workflow.
- **Phase 5 — AI Core & Knowledge Base**: RAG pipeline for institute courses & fees.
- **Phase 6 — AI Qualification Agent**: Bot evaluating student intent & lead score.
- **Phase 7 — n8n Automation**: Event-driven CRM sync & workflow dispatch.
- **Phase 8 — WhatsApp Business Integration**: Automated messaging for Indian institutes.
- **Phase 9 — Analytics & Reporting**: Conversion metrics & dashboard.
- **Phase 10 — Production & Hardening**: Kubernetes, SSL/TLS, CI/CD pipeline.
