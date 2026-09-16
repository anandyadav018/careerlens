# 03. System Architecture — CareerPilot AI

## 1. High-Level Architecture Overview

CareerPilot AI follows a **Three-Tier Service-Oriented Monolith** pattern. The system isolates client presentation, API processing/business logic, background automation, and persistent data storage while maintaining deployment simplicity.

```mermaid
graph TB
    subgraph PresentationTier ["Presentation Tier (Frontend)"]
        Client["React 19 SPA (Vite)"]
        Router["React Router v7"]
        Axios["Axios (Interceptors + Auto Token Refresh)"]
        AuthContext["Auth Context & Memory Token State"]
    end

    subgraph ApplicationTier ["Application Tier (Backend API)"]
        Express["Express Server (Port 5000)"]
        Security["Security: Helmet + CORS + Rate Limiter"]
        AuthMW["Auth Middleware (Bearer JWT)"]
        ValidatorMW["Zod Input Validation"]
        
        subgraph Controllers ["Controllers"]
          AuthController["Auth Controller"]
          ResumeController["Resume Controller"]
          JobController["Job Controller"]
          AIController["AI Controller"]
          AppController["Application Controller"]
        end
        
        subgraph Services ["Service Layer"]
          AuthService["Auth Service"]
          ResumeService["Resume Service"]
          JobService["Job Service"]
          AIService["AI Service"]
          AppService["Application Service"]
          AlertService["Alert Service"]
        end
    end

    subgraph BackgroundTier ["Background & Automated Workers"]
        Scheduler["node-cron Scheduler"]
        ScraperEngine["Playwright Scraper (10 India Boards)"]
        EmailEngine["Nodemailer Email Transporter"]
    end

    subgraph DataTier ["Data & Storage Tier"]
        MongoDB[(MongoDB Database)]
        LocalUploads["Local Disk Uploads (/uploads/resumes)"]
    end

    subgraph ExternalServices ["External API Tier"]
        GeminiAPI["Google Gemini AI API (gemini-flash-latest / 1.5-pro)"]
        JobWebsites["Public Job Portals (Naukri, Foundit, Shine, LinkedIn)"]
        SMTPHost["SMTP Server (Gmail/SendGrid)"]
    end

    Client -->|HTTP/REST| Express
    Express --> Security --> AuthMW --> ValidatorMW
    ValidatorMW --> Controllers
    Controllers --> Services
    
    Services --> MongoDB
    ResumeService --> LocalUploads
    AIService -->|GoogleGenerativeAI SDK| GeminiAPI
    
    Scheduler -->|Every 6 Hours| ScraperEngine
    Scheduler -->|Daily at 8 AM| AlertService
    ScraperEngine -->|Scrape DOM| JobWebsites
    ScraperEngine -->|Upsert Jobs| MongoDB
    AlertService -->|Send Digest| EmailEngine --> SMTPHost
```

---

## 2. Detailed Data Flow Architecture

### Client → Server → Database Interaction Flow

1. **Request Dispatch**: The React frontend triggers an asynchronous API call via the custom `axiosInstance`.
2. **Security & Interception**:
   - Helmet injects secure HTTP headers (`X-Frame-Options`, `X-Content-Type-Options`, etc.).
   - CORS middleware verifies origin (`http://localhost:5173`).
   - Rate limiting middleware restricts client IP requests (100 req / 15 mins).
3. **Authentication Verification**: `authMiddleware.js` extracts the `Bearer <token>` from headers, decodes the JWT using `JWT_ACCESS_SECRET`, and fetches the corresponding User object from MongoDB.
4. **Validation**: Zod schema middleware verifies request payload schemas.
5. **Business Logic Execution**: Controller delegates execution to the dedicated Service class (`authService`, `resumeService`, `aiService`, etc.).
6. **Persistence**: Service interacts with Mongoose ODM models to perform CRUD operations on MongoDB.
7. **Response Serialization**: Mongoose `toJSON` transforms strip sensitive keys (`password`, `refreshToken`, `__v`) before returning a unified JSON envelope: `{ success: true, data: { ... } }`.

---

## 3. Key Subsystem Sequence Diagrams

### 3.1 Authentication & Token Refresh Flow

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant React as React SPA (AuthContext)
    participant Axios as Axios Interceptor
    participant Express as Express API
    participant JWT as TokenUtils
    participant DB as MongoDB (User Schema)

    User->>React: Enters Email & Password
    React->>Express: POST /api/v1/auth/login
    Express->>DB: Find User by Email (+password)
    DB-->>Express: User document
    Express->>Express: bcrypt.compare(password, hash)
    Express->>JWT: generateTokenPair(user)
    JWT-->>Express: { accessToken, refreshToken }
    Express->>DB: Save hashed refreshToken to User document
    Express-->>React: Set httpOnly Cookie (refreshToken)<br/>JSON Body: { accessToken, user }
    React->>React: Store accessToken in memory & update state

    Note over React, Express: Access Token Expire (15 mins)

    React->>Express: GET /api/v1/jobs (Expired Access Token)
    Express-->>Axios: 401 Unauthorized (TokenExpiredError)
    Axios->>Express: POST /api/v1/auth/refresh (with httpOnly Cookie)
    Express->>JWT: verifyRefreshToken(token)
    Express->>DB: Verify token matches user.refreshToken
    Express->>JWT: generateTokenPair(user) (Token Rotation)
    Express->>DB: Update stored refreshToken
    Express-->>Axios: New accessToken & set new httpOnly Cookie
    Axios->>Express: Retry original GET /api/v1/jobs request
    Express-->>React: 200 OK (Job data returned seamlessly)
```

---

### 3.2 Resume Upload, PDF Parsing & AI ATS Analysis Flow

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Client as React Resume Upload Component
    participant Multer as Express Multer Middleware
    participant PDFParse as pdf-parse Engine
    participant ResumeSvc as ResumeService
    participant AISvc as AIService
    participant Gemini as Google Gemini API
    participant DB as MongoDB

    User->>Client: Uploads Resume PDF file (e.g. resume.pdf)
    Client->>Multer: POST /api/v1/resumes (multipart/form-data)
    Multer->>Multer: Validate file type (PDF/DOCX) & size (<5MB)
    Multer->>Multer: Save file to /uploads/resumes/
    Multer->>PDFParse: Pass File Buffer
    PDFParse-->>ResumeSvc: Extracted raw text string
    ResumeSvc->>AISvc: analyzeResume(rawText)
    AISvc->>Gemini: generateContent(Prompt + Raw Text)<br/>Configured with JSON Schema & Temperature 0.2
    Gemini-->>AISvc: Returns JSON Object (parsedData, skills, aiAnalysis)
    AISvc-->>ResumeSvc: Structured ATS Report & Skill Arrays
    ResumeSvc->>DB: Create Resume Document (userId, rawText, parsedData, skills, aiAnalysis)
    DB-->>Client: 201 Created (Resume + Full ATS Analysis)
```

---

### 3.3 Automated Web Scraping & Background Processing Flow

```mermaid
sequenceDiagram
    autonumber
    participant Cron as node-cron Scheduler
    participant ScrapeTask as ScrapeJobs Task
    participant Scraper as IndiaJobBoardScraper (Playwright)
    participant Portals as Public Job Boards (Naukri, Foundit, etc.)
    participant DB as MongoDB (Job Model)

    Cron->>ScrapeTask: Trigger every 6 hours ('0 */6 * * *')
    ScrapeTask->>Scraper: Iterate enabled JOB_SOURCES
    loop For each source (e.g., Naukri, Foundit, LinkedIn)
        Scraper->>Scraper: Launch Headless Browser (Playwright)
        Scraper->>Portals: page.goto(Search URL)
        Portals-->>Scraper: HTML Content
        Scraper->>Scraper: Evaluate DOM selectors (.job-card, .title, etc.)
        Scraper->>Scraper: Normalize raw job payload & extract skills
        Scraper->>DB: Job.bulkWrite() / updateOne(upsert: true, externalId)
    end
    Scraper-->>Cron: Task Complete (Logged to Winston)
```

---

## 4. Architectural Trade-offs & Decisions

1. **Service-Oriented Monolith vs. Microservices**:
   - *Decision*: Built as a unified Node.js monolith with distinct modular boundaries (`controllers/`, `services/`, `jobs/`).
   - *Rationale*: Avoids distributed system complexity, network latency, and orchestration overhead for campus project deployment while maintaining high maintainability.
2. **In-Memory Access Tokens + httpOnly Refresh Cookies**:
   - *Decision*: Access tokens are stored purely in React memory state (not localStorage) to prevent Cross-Site Scripting (XSS) token theft. Long-lived refresh tokens reside in HttpOnly, SameSite cookies to protect against CSRF.
3. **Structured LLM JSON Generation**:
   - *Decision*: Configured Gemini API with `responseMimeType: 'application/json'` and low temperature (0.2) instead of freeform text generation.
   - *Rationale*: Guarantees zero downstream JSON parsing failures and deterministic model outputs.
