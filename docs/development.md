# Local Development Guide — AI Lead Conversion System

This guide outlines step-by-step instructions for running, testing, and developing the **AI Lead Conversion System** locally.

---

## System Requirements

- **Java**: JDK 21+ (Compatible with JDK 23)
- **Maven**: Apache Maven 3.8+
- **Node.js**: Node.js v18+ (Tested on v22.20.0)
- **NPM**: npm 9+
- **PostgreSQL**: PostgreSQL 16 (via Docker Compose or local PostgreSQL service)
- **Git**: Git 2.30+

---

## 1. Environment Setup

Copy `.env.example` to `.env` at the project root:

```bash
cp .env.example .env
```

Verify/update environment values in `.env`:
```env
SERVER_PORT=8080
CORS_ALLOWED_ORIGINS=http://localhost:5173
DATABASE_URL=jdbc:postgresql://localhost:5432/ailead_db
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres_secret_pass
```

---

## 2. PostgreSQL Setup

### Option A: Via Docker Compose (Recommended)
```bash
docker compose up -d
```

### Option B: Native Local PostgreSQL Service
1. Ensure local PostgreSQL service (`postgresql-x64-15` or `16`) is running on port `5432`.
2. Create database `ailead_db`:
   ```sql
   CREATE DATABASE ailead_db;
   ```

---

## 3. Running the Backend (Spring Boot API)

Navigate to the `backend/` directory:

```bash
cd backend
mvn spring-boot:run
```

The Spring Boot REST API starts on `http://localhost:8080`.

Verify health endpoint directly in terminal or browser:
```bash
curl http://localhost:8080/api/v1/health
```

Expected Output:
```json
{
  "status": "UP",
  "service": "AI Lead Conversion System"
}
```

---

## 4. Running the Frontend (React + Vite)

Navigate to the `frontend/` directory:

```bash
cd frontend
npm install
npm run dev
```

Open your browser at `http://localhost:5173`.

---

## 5. Running Automated Tests & Verification

### Backend Tests
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

## 6. Git Workflow Rules

1. **Never commit secrets**: Verify `.env` is ignored before staging.
2. **Never commit generated files**: Verify `backend/target/` and `frontend/node_modules/` or `frontend/dist/` are ignored.
3. **Commit convention**: Use conventional commits (e.g. `feat: establish phase 1 project foundation`).
