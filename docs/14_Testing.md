# 14. Testing & Verification Strategy — CareerPilot AI

## 1. Quality Assurance Overview

CareerPilot AI underwent multi-tier manual and structural testing to ensure system reliability across authentication boundaries, file upload validation, external API integrations, background scrapers, and frontend UI routing.

---

## 2. Test Execution Matrix

### 2.1 Authentication & Security Testing

| Test Case ID | Test Description | Input Data | Expected Result | Pass / Fail |
|---|---|---|---|---|
| **AUTH-01** | User Registration with valid credentials | `{ firstName: "Anand", email: "test@example.com", password: "Password123" }` | 201 Created; returns User JSON & Access Token; sets HttpOnly refresh cookie. | PASS |
| **AUTH-02** | User Registration with existing email | `{ email: "test@example.com" }` | 409 Conflict; returns `"An account with this email already exists"`. | PASS |
| **AUTH-03** | Registration Password Short (<8 chars) | `{ password: "short" }` | 400 Bad Request; Zod schema validation error. | PASS |
| **AUTH-04** | Access Protected Route with valid token | `Authorization: Bearer <valid_token>` | 200 OK; returns requested data. | PASS |
| **AUTH-05** | Access Protected Route with expired token | `Authorization: Bearer <expired_token>` | 401 Unauthorized; Axios interceptor triggers silent refresh. | PASS |
| **AUTH-06** | Access Protected Route without token | `Authorization: null` | 401 Unauthorized; returns `"Not authenticated. Please log in."`. | PASS |
| **AUTH-07** | Refresh Token with valid HttpOnly cookie | `Cookie: refreshToken=<valid>` | 200 OK; returns new Access Token and rotates refresh cookie. | PASS |

---

### 2.2 Resume Upload & AI Analysis Testing

| Test Case ID | Test Description | Input Data | Expected Result | Pass / Fail |
|---|---|---|---|---|
| **RES-01** | Upload valid PDF Resume (<5MB) | `sample_resume.pdf` (2.1MB) | 201 Created; `pdf-parse` extracts text; Gemini returns valid ATS score & skill vectors. | PASS |
| **RES-02** | Upload non-PDF file (.exe / .png) | `malicious_script.exe` | 400 Bad Request; Multer file filter rejects upload (`"Only PDF and DOCX files are allowed"`). | PASS |
| **RES-03** | Upload oversized PDF (>5MB) | `huge_portfolio.pdf` (8.4MB) | 400 Bad Request; Multer limit error (`"File size exceeds 5MB limit"`). | PASS |
| **RES-04** | Gemini API Key Missing | `GEMINI_API_KEY=""` | 500 Internal Server Error; caught operational `AppError("AI provider is not configured")`. | PASS |

---

### 2.3 Web Scraping & Background Worker Testing

| Test Case ID | Test Description | Input Data | Expected Result | Pass / Fail |
|---|---|---|---|---|
| **SCR-01** | Playwright Scraper Execution | Source: `naukri`, `foundit` | Scraper launches Chromium, navigates search URLs, extracts >10 jobs, upserts into MongoDB without duplicates. | PASS |
| **SCR-02** | Duplicate Job Prevention | Run scraper twice on same URL | `Job.index({ externalId: 1, source: 1 })` prevents duplicate documents. | PASS |
| **SCR-03** | Job TTL Expiration | `expiresAt = Date.now()` | MongoDB TTL index purges expired job document automatically after 7 days. | PASS |

---

## 3. Manual Testing Checklist for Placement Viva

- [x] **Auth Check**: Register a new user account, refresh the browser page, verify session persists (via `/auth/refresh` silent call).
- [x] **Logout Check**: Click Logout button, verify refresh cookie is cleared and user is redirected to `/login`.
- [x] **Protected Guard Check**: Attempt to navigate directly to `http://localhost:5173/dashboard` while unauthenticated; verify redirect to `/login`.
- [x] **Resume ATS Test**: Upload a resume PDF, inspect the resulting overall ATS score, section breakdown ratings, and extracted technical skills tags.
- [x] **Job Matching Test**: Browse job listings, click "Calculate Match Score", verify percentage match and missing skills feedback card.
- [x] **Cover Letter Generation**: Click "Generate Cover Letter", verify company and candidate context are correctly merged with zero `[Name]` placeholders.
- [x] **Kanban Status Shift**: Drag or update application status from "Saved" to "Applied", verify status badge updates instantly.
