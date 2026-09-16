# 08. API Documentation — CareerPilot AI

## 1. Overview & Standard API Conventions

All API endpoints are exposed under the base URL prefix: `/api/v1`

### Standard Response Envelope

#### Success Response Format
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

#### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE_NAME",
    "message": "Human readable error summary",
    "details": []
  }
}
```

---

## 2. Authentication Endpoints (`/api/v1/auth`)

### 2.1 `POST /api/v1/auth/register`
- **Description**: Registers a new user account, hashes password via bcrypt, generates JWT access/refresh token pair, and sets refresh token in an HttpOnly cookie.
- **Auth Required**: No (Public)
- **Validation**: Zod schema (`firstName`, `lastName`, `email`, `password` min 8 chars).
- **Request Body**:
  ```json
  {
    "firstName": "Anand",
    "lastName": "Yadav",
    "email": "anand@example.com",
    "password": "SecurePassword123"
  }
  ```
- **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "_id": "66bc10f2a412890012ab34cd",
        "firstName": "Anand",
        "lastName": "Yadav",
        "email": "anand@example.com",
        "isEmailVerified": false
      },
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```
- **Error Codes**: `400 BAD_REQUEST` (validation error), `409 CONFLICT` (email already exists).

---

### 2.2 `POST /api/v1/auth/login`
- **Description**: Authenticates user credentials, sets refresh token HttpOnly cookie, returns access token in body.
- **Auth Required**: No (Public)
- **Request Body**:
  ```json
  {
    "email": "anand@example.com",
    "password": "SecurePassword123"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "user": { "_id": "...", "email": "anand@example.com" },
      "accessToken": "eyJhbGci..."
    }
  }
  ```
- **Error Codes**: `401 UNAUTHORIZED` (invalid credentials).

---

### 2.3 `POST /api/v1/auth/refresh`
- **Description**: Validates the HttpOnly refresh token cookie, rotates token pair, and returns a new access token.
- **Auth Required**: Refresh Cookie
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "accessToken": "eyJhbGci..."
    }
  }
  ```
- **Error Codes**: `401 UNAUTHORIZED` (missing/invalid refresh token).

---

### 2.4 `POST /api/v1/auth/logout`
- **Description**: Clears refresh token stored in DB and removes HttpOnly cookie.
- **Auth Required**: Yes (`Bearer <accessToken>`)
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Logged out successfully"
  }
  ```

---

## 3. Resume Endpoints (`/api/v1/resumes`)

### 3.1 `POST /api/v1/resumes`
- **Description**: Uploads a resume PDF (`multipart/form-data`), extracts plain text via `pdf-parse`, submits to Gemini AI for ATS analysis, and persists record in MongoDB.
- **Auth Required**: Yes (`Bearer <accessToken>`)
- **Request Format**: `multipart/form-data` with field `resume` containing PDF/DOCX file (<5MB).
- **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "66bc2100a412890012ab35ee",
      "fileName": "Anand_Resume.pdf",
      "fileUrl": "uploads/resumes/1723980000-Anand_Resume.pdf",
      "skills": {
        "technical": ["React", "Node.js", "Express", "MongoDB", "Python"],
        "soft": ["Problem Solving", "Team Collaboration"],
        "tools": ["Git", "Docker", "VS Code"]
      },
      "aiAnalysis": {
        "overallScore": 88,
        "atsScore": 85,
        "sections": {
          "summary": { "score": 90, "feedback": "Strong concise summary." }
        },
        "strengths": ["Quantified bullet points", "Clear technical breakdown"],
        "improvements": ["Add GitHub project links"]
      }
    }
  }
  ```

---

### 3.2 `GET /api/v1/resumes`
- **Description**: Retrieves all uploaded resumes for the current logged-in user.
- **Auth Required**: Yes

### 3.3 `GET /api/v1/resumes/:id`
- **Description**: Retrieves detailed resume record including parsed data and ATS report.
- **Auth Required**: Yes

### 3.4 `PATCH /api/v1/resumes/:id/active`
- **Description**: Sets target resume as the active resume for job matching logic.
- **Auth Required**: Yes

---

## 4. Job Endpoints (`/api/v1/jobs`)

### 4.1 `GET /api/v1/jobs`
- **Description**: Fetches paginated, searchable job listings scraped from Indian job portals.
- **Auth Required**: No / Optional Auth
- **Query Parameters**: `search`, `location`, `jobType`, `isRemote`, `page` (default 1), `limit` (default 20).
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "jobs": [
        {
          "_id": "66bc3300a412890012ab3999",
          "title": "Software Engineer",
          "company": { "name": "Tech Corp" },
          "location": { "city": "Bengaluru", "isRemote": true },
          "skills": ["JavaScript", "React", "Node.js"],
          "source": "naukri",
          "sourceUrl": "https://www.naukri.com/..."
        }
      ],
      "pagination": { "total": 150, "page": 1, "pages": 8 }
    }
  }
  ```

---

## 5. AI Endpoints (`/api/v1/ai`)

### 5.1 `POST /api/v1/ai/match-job`
- **Description**: Calculates AI match percentage and skill gap between candidate active resume and a target job ID.
- **Auth Required**: Yes
- **Request Body**: `{ "jobId": "66bc3300a412890012ab3999" }`
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "matchScore": 82,
      "matchedSkills": ["React", "Node.js", "MongoDB"],
      "missingSkills": ["Docker", "TypeScript"],
      "feedback": "Strong overlap in core MERN stack requirements; candidate lacks Docker containerization experience specified in requirements."
    }
  }
  ```

---

### 5.2 `POST /api/v1/ai/cover-letter`
- **Description**: Generates a tailored cover letter using Gemini 1.5 Pro based on user's active resume and target job posting.
- **Auth Required**: Yes
- **Request Body**: `{ "jobId": "66bc3300a412890012ab3999" }`
- **Success Response (200 OK)**: Returns generated text document and stores record in `coverletters` collection.

---

### 5.3 `POST /api/v1/ai/interview-prep`
- **Description**: Generates 5 tailored technical, behavioral, and system design interview questions with hints for target job.
- **Auth Required**: Yes
- **Request Body**: `{ "jobId": "66bc3300a412890012ab3999" }`

---

## 6. Application Tracker Endpoints (`/api/v1/applications`)

### 6.1 `GET /api/v1/applications`
- **Description**: Retrieves applicant's tracked jobs grouped or filtered by status for the Kanban board.
- **Auth Required**: Yes

### 6.2 `POST /api/v1/applications`
- **Description**: Saves or tracks a job under a status (`saved`, `applied`, `interview`, etc.).
- **Auth Required**: Yes

### 6.3 `PATCH /api/v1/applications/:id/status`
- **Description**: Updates application Kanban status (e.g. from `applied` to `interview`) and appends item to `statusHistory`.
- **Auth Required**: Yes
