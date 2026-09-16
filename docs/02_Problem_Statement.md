# 02. Problem Statement — CareerPilot AI

## 1. Background & Existing Problems

The modern recruitment landscape operates primarily through digital channels and automated filtering engines. However, the candidate experience remains highly fragmented, inefficient, and opaque:

1. **Market Fragmentation**: Job opportunities are split across generic job boards (Indeed, LinkedIn), specialized tech portals (Cutshort, Hirist), Indian job aggregators (Naukri, Foundit, Shine, TimesJobs), and internship platforms (Internshala, Freshersworld). Candidates are forced to maintain dozens of browser tabs and search keywords repeatedly across disparate sites.
2. **Automated ATS Filtering**: Organizations utilize Applicant Tracking Systems (ATS) to filter candidate submissions. Resumes lacking explicit keyword matches, standard section formatting, or proper skills categorization are rejected automatically, leaving job seekers with no feedback on why they were disqualified.
3. **Application Fatigue & Low Personalization**: Candidates spend hours manually drafting cover letters and preparing for interview questions for each company. Due to time constraints, many revert to generic templates, significantly dropping their response rates.
4. **Lack of Centralized Tracking**: Job seekers use ad-hoc spreadsheets or memory to track applied jobs, follow-up dates, interviewer contacts, and application statuses.

---

## 2. Why Existing Solutions Are Insufficient

| Existing Solution | Limitations | CareerPilot AI Advantage |
|---|---|---|
| **Traditional Job Boards** (LinkedIn, Naukri) | Siloed data; no cross-platform aggregation; basic keyword matching without AI synthesis. | Aggregates 10+ job sources into a unified database with standardized schemas. |
| **Generic Resume Builders** (Canva, Resume.io) | Focus on visual formatting rather than semantic ATS parsing or AI keyword extraction. | Evaluates resumes using Google Gemini LLM against ATS standards and returns JSON analysis. |
| **Standalone AI Copywriting Tools** (ChatGPT) | Require manual copy-pasting of resume text and job descriptions; no direct system context. | Seamlessly links stored user resume models with selected job documents for 1-click generation. |
| **Spreadsheets (Excel/Notion)** | Manual data entry; no automated deadline reminders or automated match scoring. | Integrated Kanban board auto-populates job metadata and tracks status histories. |

---

## 3. Proposed Solution: CareerPilot AI

CareerPilot AI provides an end-to-end web platform built on a 3-tier Node.js/Express + React architecture:

- **Automated Data Ingestion**: Playwright headless scrapers run in background worker threads, executing dom-evaluation tasks across Indian job portals to normalize job listings into MongoDB.
- **AI-Powered Intelligent Document Processing**: Uploaded PDF resumes pass through `pdf-parse` to extract raw string buffers, which are submitted to Google Gemini API (`gemini-flash-latest`) using structured JSON Schema directives (`responseMimeType: 'application/json'`).
- **Semantic Job-to-Resume Matching**: An algorithmic AI comparator maps candidate skills and experience against job posting requirements to produce a 0–100 match percentage and skill gap analysis.
- **Automated Workflow Tools**: Features one-click AI cover letter generation, tailored technical/behavioral interview question generation, and automated daily email notifications for saved job criteria via Nodemailer and `node-cron`.

---

## 4. Project Objectives

1. **Automation**: Eliminate manual searching by aggregating 100+ fresh job listings every 6 hours.
2. **Quantifiable Feedback**: Provide instant ATS score (0–100) and section-by-section breakdown (Summary, Experience, Skills, Education, Formatting).
3. **Efficiency**: Reduce cover letter generation time from 20 minutes to under 3 seconds using LLM prompt pipelines.
4. **Reliable Security**: Implement state-of-the-art authentication using short-lived JWT access tokens, long-lived httpOnly refresh cookies, password salting with `bcryptjs` (12 rounds), and Zod input validation.

---

## 5. System Scope

### In Scope
- Web application interface (React 19, Tailwind CSS 4, Vite).
- RESTful API server (Node.js, Express, Mongoose).
- Authentication subsystem (JWT Access/Refresh token rotation, cookie management).
- PDF file uploading, validation, and storage (Multer).
- LLM Integration (Google Generative AI SDK, JSON Schema response parsing).
- Automated Web Scraping (Playwright headless browser, DOM extraction, `node-cron`).
- Email Notification Engine (Nodemailer, HTML email templates).
- Application Tracking (Mongoose relational schemas, status history logging).

### Out of Scope / Explicit Limitations
- **Payments / Monetary Transactions**: Currently no monetization or payment gateway (Stripe/Razorpay) is integrated into the source code; the service is open/free access.
- **QR Code Verification**: QR code generation/scanning for physical check-in is not part of this career platform's feature scope.
- **Native Mobile Apps**: Mobile responsive web application only (no iOS/Android native binaries).
- **Third-Party Job Board Anti-Bot Protections**: Scrapers operate on public search pages; website layout changes by external job boards may require scraper selector maintenance.
