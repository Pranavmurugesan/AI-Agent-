# Phase 3 REST API Specification

## 1. Global Conventions

- **Base URL**: `/api/v1`
- **Authentication**: `HttpOnly` cookie (`jwt_token`) attached automatically.
- **CSRF Token**: `X-XSRF-TOKEN` header required on all mutating requests (`POST`, `PUT`, `PATCH`, `DELETE`).
- **Content-Type**: `application/json`
- **Date-Time Format**: ISO-8601 UTC (`YYYY-MM-DDTHH:mm:ssZ`).
- **Standard Error Response**:
  ```json
  {
    "timestamp": "2026-08-22T10:30:00Z",
    "status": 400,
    "error": "Bad Request",
    "message": "Validation failed: Phone number is required",
    "path": "/api/v1/leads"
  }
  ```

---

## 2. Course Endpoints (`/api/v1/courses`)

### List Courses
- **Endpoint**: `GET /api/v1/courses`
- **Query Params**:
  - `includeInactive` (boolean, default: `false`, `ADMIN` only)
- **Response**: `200 OK`
  ```json
  [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "name": "NEET 1-Year Repeaters Batch",
      "code": "NEET-REP-26",
      "description": "Comprehensive coaching for NEET aspirants",
      "duration": "1 Year",
      "fee": 85000.00,
      "active": true,
      "createdAt": "2026-08-22T10:00:00Z",
      "updatedAt": "2026-08-22T10:00:00Z"
    }
  ]
  ```

### Create Course
- **Endpoint**: `POST /api/v1/courses`
- **Role**: `ADMIN`
- **Request Body**:
  ```json
  {
    "name": "JEE Advanced 2-Year Integrated",
    "code": "JEE-ADV-28",
    "description": "For Class 11 students targeting IIT-JEE",
    "duration": "2 Years",
    "fee": 150000.00,
    "active": true
  }
  ```
- **Response**: `201 Created`

### Update Course
- **Endpoint**: `PUT /api/v1/courses/{id}`
- **Role**: `ADMIN`
- **Response**: `200 OK`

### Delete / Deactivate Course
- **Endpoint**: `DELETE /api/v1/courses/{id}`
- **Role**: `ADMIN`
- **Response**: `200 OK` (Soft deactivates course if linked to existing leads)

---

## 3. Lead Endpoints (`/api/v1/leads`)

### List Leads (Filtered & Paginated)
- **Endpoint**: `GET /api/v1/leads`
- **Query Params**:
  - `page` (int, default: 0)
  - `size` (int, default: 20, max: 100)
  - `search` (string, optional - matches name, phone, email)
  - `status` (string, optional - `NEW`, `CONTACTED`, `QUALIFIED`, `FOLLOW_UP`, `CONVERTED`, `LOST`)
  - `courseId` (UUID, optional)
  - `assignedToId` (UUID, optional)
  - `source` (string, optional)
  - `priority` (string, optional)
  - `sortBy` (string, default: `createdAt`)
  - `sortDir` (string, default: `desc`)
- **Response**: `200 OK`
  ```json
  {
    "content": [
      {
        "id": "98765432-1111-2222-3333-444455556666",
        "name": "Rohan Sharma",
        "phone": "9876543210",
        "email": "rohan.sharma@example.com",
        "course": {
          "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
          "name": "NEET 1-Year Repeaters Batch"
        },
        "source": "INSTAGRAM",
        "status": "NEW",
        "priority": "HIGH",
        "assignedTo": {
          "id": "c1d2e3f4-5555-6666-7777-888899990000",
          "name": "Counselor Priya",
          "email": "priya@institute.com"
        },
        "notes": "Parent inquired about hostel facilities and fee installment plan",
        "leadScore": 75,
        "qualificationStatus": "UNQUALIFIED",
        "createdAt": "2026-08-22T10:15:00Z",
        "updatedAt": "2026-08-22T10:15:00Z"
      }
    ],
    "page": 0,
    "size": 20,
    "totalElements": 1,
    "totalPages": 1,
    "last": true
  }
  ```

### Create Lead
- **Endpoint**: `POST /api/v1/leads`
- **Request Body**:
  ```json
  {
    "name": "Ananya Patel",
    "phone": "9123456789",
    "email": "ananya.p@example.com",
    "courseId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "source": "WEBSITE",
    "priority": "MEDIUM",
    "notes": "Interested in morning batch"
  }
  ```
- **Response**: `201 Created` (or `200 OK` with `X-Deduplication: MATCHED` if existing active lead was updated).

### Get Lead Details
- **Endpoint**: `GET /api/v1/leads/{id}`
- **Response**: `200 OK` (Full lead details with course, assignee, and pending follow-ups).

### Update Lead Pipeline Status
- **Endpoint**: `PATCH /api/v1/leads/{id}/status`
- **Roles**: `ADMIN`, `COUNSELOR`
- **Request Body**:
  ```json
  {
    "status": "QUALIFIED",
    "remarks": "Verified student has 85% in 12th Board, budget confirmed"
  }
  ```
- **Response**: `200 OK`

### Assign / Reassign Lead
- **Endpoint**: `POST /api/v1/leads/{id}/assign`
- **Role**: `ADMIN`
- **Request Body**:
  ```json
  {
    "assignedToUserId": "c1d2e3f4-5555-6666-7777-888899990000",
    "remarks": "Assigned to medical admissions counselor"
  }
  ```
- **Response**: `200 OK`

### Soft Delete Lead
- **Endpoint**: `DELETE /api/v1/leads/{id}`
- **Role**: `ADMIN`
- **Response**: `200 OK`

---

## 4. Activity Timeline Endpoints (`/api/v1/leads/{id}/activities`)

### Get Lead Activity Timeline
- **Endpoint**: `GET /api/v1/leads/{id}/activities`
- **Response**: `200 OK`
  ```json
  [
    {
      "id": "e1f2a3b4-1234-5678-90ab-cdef12345678",
      "type": "STATUS_CHANGED",
      "summary": "Status changed from CONTACTED to QUALIFIED",
      "details": "Verified student has 85% in 12th Board",
      "metadata": "{\"fromStatus\":\"CONTACTED\",\"toStatus\":\"QUALIFIED\"}",
      "performedBy": {
        "id": "c1d2e3f4-5555-6666-7777-888899990000",
        "name": "Counselor Priya"
      },
      "createdAt": "2026-08-22T11:00:00Z"
    }
  ]
  ```

### Log Manual Activity
- **Endpoint**: `POST /api/v1/leads/{id}/activities`
- **Request Body**:
  ```json
  {
    "type": "CALL_LOGGED",
    "summary": "Phone Call with Parent",
    "details": "Spoke with father Mr. Patel. Agreed to attend campus demo on Saturday."
  }
  ```
- **Response**: `201 Created`

---

## 5. Follow-Up Endpoints (`/api/v1/follow-ups` & `/api/v1/leads/{id}/follow-ups`)

### List Follow-Ups
- **Endpoint**: `GET /api/v1/follow-ups`
- **Query Params**:
  - `status` (string, optional: `PENDING`, `COMPLETED`, `CANCELLED`, `OVERDUE`)
  - `todayOnly` (boolean, default: `false`)
  - `assignedToId` (UUID, optional)
- **Response**: `200 OK`

### Schedule Follow-Up
- **Endpoint**: `POST /api/v1/leads/{id}/follow-ups`
- **Request Body**:
  ```json
  {
    "assignedToUserId": "c1d2e3f4-5555-6666-7777-888899990000",
    "scheduledAt": "2026-08-24T09:30:00Z",
    "priority": "HIGH",
    "notes": "Follow up regarding scholarship test registration"
  }
  ```
- **Response**: `201 Created`

### Mark Follow-Up Completed
- **Endpoint**: `PATCH /api/v1/follow-ups/{id}/complete`
- **Request Body**:
  ```json
  {
    "outcomeNotes": "Student registered for scholarship test and paid application fee"
  }
  ```
- **Response**: `200 OK`

---

## 6. Dashboard Metrics Endpoint (`/api/v1/dashboard/metrics`)

- **Endpoint**: `GET /api/v1/dashboard/metrics`
- **Response**: `200 OK`
  ```json
  {
    "totalLeads": 142,
    "pipeline": {
      "newCount": 38,
      "contactedCount": 45,
      "qualifiedCount": 26,
      "followUpCount": 18,
      "convertedCount": 12,
      "lostCount": 3
    },
    "followUps": {
      "todayPending": 8,
      "overdue": 2,
      "completedToday": 6
    },
    "conversionRatePercent": 8.45,
    "sources": [
      { "source": "INSTAGRAM", "count": 52 },
      { "source": "WEBSITE", "count": 41 },
      { "source": "WHATSAPP", "count": 28 },
      { "source": "WALK_IN", "count": 15 },
      { "source": "REFERRAL", "count": 6 }
    ]
  }
  ```
