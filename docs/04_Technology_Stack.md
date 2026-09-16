# 04. Technology Stack — CareerPilot AI

## 1. Master Technology Overview

CareerPilot AI leverages a modern JavaScript/Node.js tech stack engineered for high developer velocity, type safety, efficient asynchronous I/O, and seamless AI SDK integrations.

| Layer / Domain | Technology | Version | Purpose | Why Chosen Over Alternatives |
|---|---|---|---|---|
| **Frontend Core** | React | `^19.2.8` | UI Library for building interactive single-page application | React 19 provides superior concurrent rendering and component performance compared to Angular or Vue. |
| **Frontend Build Tool** | Vite | `^8.2.0` | Next-gen frontend tooling and development server | Extremely fast Hot Module Replacement (HMR) and optimized Rollup bundling compared to Webpack/Create-React-App. |
| **Routing** | React Router DOM | `^7.18.2` | Declarative client-side routing & nested route protection | Industry standard for React SPAs; handles layout wrapping and protected route guards efficiently. |
| **Styling & UI** | Tailwind CSS | `^4.3.3` | Utility-first CSS framework | Utility classes allow rapid UI development without stylesheet bloat; version 4 uses modern CSS engine optimizations. |
| **Icons** | Lucide React | `^1.30.0` | Modern, lightweight SVG icon suite | Modular, tree-shakeable icons with consistent visual aesthetics compared to FontAwesome. |
| **HTTP Client** | Axios | `^1.19.0` | Promise-based HTTP client for browser & node | Interceptors provide clean hooks for automatic access token attachment and silent refresh retry queues. |
| **Backend Runtime** | Node.js | `>=18.0.0` | Asynchronous event-driven JavaScript runtime | Non-blocking I/O model handles concurrent API calls, background scrapers, and LLM requests gracefully. |
| **Web Framework** | Express.js | `^4.21.2` | Lightweight HTTP server framework | Minimalist, unopinionated architecture allowing flexible custom middleware pipeline composition. |
| **Database** | MongoDB | `>=6.0` | NoSQL document database | Schema flexibility fits heterogeneous job listings and complex nested resume JSON objects without rigid SQL joins. |
| **ORM / ODM** | Mongoose | `^8.9.5` | Object Data Modeling (ODM) library for MongoDB | Provides schema validation, middleware hooks (pre-save password hashing), text indexes, and population. |
| **AI Subsystem** | Google Generative AI SDK | `^0.24.1` | Native SDK for Google Gemini models | Access to `gemini-flash-latest` & `gemini-1.5-pro`; cost-effective, high context window, strict JSON schema output. |
| **Web Scraping** | Playwright | `^1.62.1` | Headless browser automation library | Capable of executing client-side JS rendering on complex job portals (Naukri, Foundit) better than Axios/Cheerio. |
| **Background Scheduler** | node-cron | `^4.6.0` | Pure JS task scheduler using crontab syntax | Eliminates the need for external cron daemons; runs in-process inside the Express node engine. |
| **Document Parsing** | pdf-parse | `^2.4.5` | Node.js buffer parser for PDF documents | Lightweight, dependency-free text extraction from uploaded resume PDF files. |
| **File Uploads** | Multer | `^1.4.5-lts.1` | Middleware for handling `multipart/form-data` | Direct memory/disk stream control with strict MIME type and file size limits. |
| **Security Headers** | Helmet | `^8.0.0` | Express security middleware | Automatically sets protective HTTP headers (`X-Frame-Options`, `Content-Security-Policy`, etc.). |
| **Rate Limiting** | express-rate-limit | `^7.5.0` | API rate-limiting middleware | Prevents Brute-force auth attacks and protects Gemini API tokens from abuse. |
| **Authentication** | JSONWebToken (JWT) + bcryptjs | `^9.0.2` / `^2.4.3` | Stateless token generation & password hashing | Industry-standard salt rounds (12) for security combined with dual-token rotation mechanics. |
| **Validation** | Zod | `^3.24.1` | TypeScript-first schema validation | Declarative input sanitization and strict validation for request bodies before controller execution. |
| **Email Service** | Nodemailer | `^9.0.5` | Unicode-friendly email sender | Simple integration with SMTP services (Gmail, SendGrid, Mailgun) for scheduled job digests. |

---

## 2. Deep Dive: Architectural Justifications

### 2.1 Why MongoDB (Mongoose) over PostgreSQL?
- **Nested Semi-Structured Data**: Resume parsing produces deeply nested structure (work experience arrays, skills categorization, ATS evaluation objects). Relational SQL normalization would require 6+ joined tables (`resumes`, `experiences`, `educations`, `skills`, `projects`, `ats_feedbacks`). MongoDB handles this in a single atomic JSON document.
- **Dynamic Scraper Schemas**: Job listings scraped from different job portals contain varying optional metadata (salary ranges, remote flags, experience levels). MongoDB fields can be easily omitted or added without running costly database migrations.
- **Built-in Search & TTL Indexes**: Native text indexes enable fast multi-field keyword searching (`title`, `description`, `company.name`), while TTL indexes automatically purge expired jobs (`expiresAt`).

### 2.2 Why Google Gemini API over OpenAI GPT-4?
- **Cost Efficiency**: Gemini Flash provides high token throughput at a fraction of GPT-4o costs, ideal for real-time document parsing and mass matching.
- **Native JSON Schema Mode**: Setting `responseMimeType: 'application/json'` guarantees strict JSON compliance without needing brittle regex regex parsing or markdown stripping.
- **Large Context Window**: Handles raw multi-page resume text without truncation or context loss.

### 2.3 Why Playwright over Cheerio / Puppeteer?
- **JavaScript Rendering Support**: Modern job portals (Naukri, Foundit, LinkedIn) rely heavily on React/Angular client-side rendering. Static HTML scrapers like Cheerio fail to render these cards.
- **Cross-Browser Engine & Stability**: Playwright provides better auto-waiting features and resilient locator selectors compared to legacy Puppeteer implementations.
