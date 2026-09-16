# MASTER Placement & Interview Revision Guide — CareerPilot AI

> **The Ultimate Cheat Sheet for Technical Interviews, HR Rounds & College Project Viva**

---

## 1. Project Explanations by Time Limit

### ⚡ 2-Minute Elevator Pitch (For HR & Initial Introductions)
> *"CareerPilot AI is an intelligent full-stack career platform built with React, Node.js, Express, MongoDB, and Google Gemini API. It solves the fragmentation and ATS rejection problems faced by job seekers. The platform deploys automated Playwright scrapers every 6 hours to fetch listings from 10 Indian job portals like Naukri, Foundit, and LinkedIn India into a centralized feed. When a candidate uploads a PDF resume, the system parses the text using `pdf-parse` and submits it to Google Gemini LLM using structured JSON schemas to calculate ATS compatibility scores, extract skills, compute job match percentages, and generate tailored cover letters and mock interview questions. Built with dual-token JWT authentication, HttpOnly cookies, and background cron email alerts, CareerPilot AI automates a candidate's daily placement workflow end-to-end."*

---

### ⏱️ 5-Minute Technical Summary (For Tech Leads & SDE-1 Interviews)
> *"CareerPilot AI is built as a three-tier service-oriented monolith. 
> 
> On the **Frontend**, it uses a React 19 Single Page Application built with Vite and Tailwind CSS. State management combines local component hooks with a global `AuthContext` that retains access tokens purely in memory to prevent XSS attacks. Network requests use custom Axios interceptors with a subscriber-queue lock that handles silent `401 Unauthorized` token refreshes seamlessly.
> 
> On the **Backend**, it runs a Node.js Express server structured in Controller-Service-Model layers. Security middleware includes Helmet, CORS, IP rate-limiting, and Zod input validation. Authentication features dual-token rotation: short-lived 15-minute JWT access tokens and long-lived 7-day refresh tokens stored in HttpOnly cookies and MongoDB.
> 
> On the **Data & Automation Layer**, Mongoose manages 7 MongoDB collections with compound unique indexes, text search indexes, and TTL auto-purge indexes. Background `node-cron` schedulers execute Playwright headless browser scrapers across 10 Indian job boards and trigger daily Nodemailer email digests.
> 
> For **AI Integrations**, it uses `@google/generative-ai` SDK (`gemini-flash-latest` & `gemini-1.5-pro`) configured with `responseMimeType: 'application/json'` and low temperature (0.2) to ensure deterministic ATS scoring, skill gap analysis, and cover letter copywriting."*

---

### ⌛ 10-Minute Deep-Dive Architecture & Implementation Walkthrough
*(Refer to complete breakdown in `03_Architecture.md`, `06_System_Design.md`, and `11_Implementation.md`)*

---

## 2. Core Technical Summaries

### Architecture Summary
- **Style**: Three-Tier Service-Oriented Monolith.
- **Layers**: React SPA Frontend -> Express REST API -> MongoDB Persistence & Gemini AI SDK.
- **Security**: In-memory Access Tokens (15m) + HttpOnly Refresh Cookie (7d) + Bcrypt (12 rounds) + Helmet + Zod Validation.

### Database Summary
- **Database**: MongoDB (Mongoose ODM).
- **Collections (7)**: `users`, `resumes`, `jobs`, `applications`, `alerts`, `coverletters`, `interviewpreps`.
- **Key Indexes**: Compound Unique `{ externalId: 1, source: 1 }` on `Job`; Text Index on `{ title, description, company }`; TTL Index on `Job.expiresAt` (7 days auto-delete).

### API Summary
- **Base URL**: `/api/v1`
- **Key Routes**: `/auth/*`, `/resumes/*`, `/jobs/*`, `/ai/*`, `/applications/*`, `/alerts/*`.
- **Response Standard**: `{ success: true, data: { ... } }` or `{ success: false, error: { code, message } }`.

### AI Subsystem Summary
- **Provider**: Google Generative AI SDK (`gemini-flash-latest` for parsing/scoring, `gemini-1.5-pro` for cover letters).
- **Key Technique**: Enforced `responseMimeType: 'application/json'` with low temperature (0.2) and `safeJsonParse` regex sanitization.

### Challenges Summary
1. **Dynamic DOM Scraping**: Resolved by upgrading from static Axios/Cheerio to Playwright headless Chromium DOM evaluation.
2. **Gemini Code Block Formatting**: Resolved using `safeJsonParse` backtick stripping.
3. **Token Refresh Race Conditions**: Resolved via Axios interceptor Subscriber Queue & Refresh Lock pattern.

---

## 3. Top 25 Interview Questions & Quick Answers

| # | Question Summary | Quick Recall Answer |
|---|---|---|
| 1 | **What is the tech stack?** | React 19, Vite, Tailwind CSS, Node.js, Express, MongoDB (Mongoose), Google Gemini API, Playwright, JWT. |
| 2 | **Why MongoDB over SQL?** | Handles nested resume ATS JSON objects and varying scraper job schemas without rigid multi-table SQL joins. |
| 3 | **Why Gemini over GPT-4?** | Cost-effective, high context window, native strict `application/json` schema mode. |
| 4 | **How does Auth work?** | Dual-token JWT: Short-lived access token in React memory; long-lived refresh token in HttpOnly cookie & MongoDB. |
| 5 | **How are passwords stored?** | Salted and hashed using `bcryptjs` with 12 salt rounds inside a Mongoose `pre('save')` hook. |
| 6 | **What prevents XSS?** | Access tokens are held in memory variables (not `localStorage`); input validation with Zod. |
| 7 | **What prevents CSRF?** | Refresh token cookie configured with `httpOnly: true` and `sameSite: 'lax'`. |
| 8 | **How are PDF resumes parsed?** | Multer validates file -> `pdf-parse` extracts raw text -> Gemini API converts text to structured ATS JSON. |
| 9 | **How do scrapers work?** | Playwright headless Chromium navigates 10 Indian job portals, evaluates DOM selectors, and upserts into MongoDB. |
| 10 | **How are duplicate jobs prevented?** | Compound unique database index on `Job` schema: `{ externalId: 1, source: 1 }`. |
| 11 | **How are old jobs cleaned up?** | Mongoose TTL index on `Job.expiresAt` automatically purges listings after 7 days. |
| 12 | **What is node-cron used for?** | Runs job scrapers every 6 hours (`0 */6 * * *`) and sends email alert digests daily at 8 AM (`0 8 * * *`). |
| 13 | **How does the Kanban tracker update?** | React component fires `PATCH /applications/:id/status`; service updates state and appends to `statusHistory` array. |
| 14 | **What is Zod?** | TypeScript-first schema validator used in Express middleware to sanitize body/query params before controllers run. |
| 15 | **What is Helmet?** | Express middleware that sets protective HTTP security headers (`X-Frame-Options`, CSP, etc.). |
| 16 | **How do Axios interceptors work?** | Request interceptor injects Bearer token; response interceptor queues failed 401s during silent refresh. |
| 17 | **Why use `safeJsonParse`?** | Strips markdown triple backticks (```json) returned by LLMs before running `JSON.parse()`. |
| 18 | **What is Temperature in Gemini?** | Controls AI output randomness: 0.2 used for factual ATS parsing; 0.7 used for creative cover letter writing. |
| 19 | **How is CORS configured?** | Express `cors` middleware configured with `origin: CLIENT_URL` and `credentials: true`. |
| 20 | **What is `AppError`?** | Custom class extending native `Error` with `statusCode` and `isOperational` flags for centralized handling. |
| 21 | **How do protected client routes work?** | `ProtectedRoute.jsx` checks `AuthContext`; redirects to `/login` if unauthenticated or renders `<Outlet />`. |
| 22 | **How is email sent?** | Nodemailer creates an SMTP transport sending HTML email digests populated with matched jobs from MongoDB. |
| 23 | **How does `server.js` shutdown gracefully?** | Listens for `SIGTERM`/`SIGINT`, closes HTTP server listener, and drains MongoDB connections cleanly. |
| 24 | **How to scale to 100k users?** | Load-balance Express API nodes, add Redis caching layer, sharded MongoDB read-replicas, and message queues. |
| 25 | **What is your key engineering takeaway?** | Designing defensive systems—enforcing strict JSON schemas on AI, handling token race conditions, and indexing queries. |
