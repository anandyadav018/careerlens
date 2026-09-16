# 17. Resume Bullet Points & Portfolio Descriptions — CareerPilot AI

This document provides ATS-optimized, high-impact project descriptions formatted specifically for developer resumes, LinkedIn portfolio sections, and placement profiles.

---

## 1. Short Resume Summaries

### 30-Word Version (For Concise Resume Layouts)
> *"Architected **CareerPilot AI**, an AI-powered career platform built with React, Node.js, Express, and MongoDB. Integrated Google Gemini LLMs for automated PDF resume ATS scoring, job match calculation, and tailored cover letter generation."*

---

### 50-Word Version (For Detailed Resume Projects Section)
> *"Engineered **CareerPilot AI**, a full-stack career platform using React, Node.js, Express, and MongoDB. Built Playwright scrapers automating job collection from 10 Indian portals, integrated Google Gemini LLMs for PDF resume ATS scoring and skill gap analysis, and implemented secure dual-token JWT authentication with HttpOnly cookies."*

---

## 2. ATS-Optimized Bullet Points (Quantified & Action-Oriented)

Select 3 to 4 bullets for your software engineering resume:

- **Full-Stack Architecture & Security**: *"Architected a full-stack MERN application utilizing React 19, Node.js, and Express; secured authentication via short-lived JWT access tokens in memory, HttpOnly refresh cookies, and bcrypt password salting (12 rounds)."*
- **Generative AI & Document Processing**: *"Integrated Google Gemini 1.5 LLM APIs with strict JSON Schema directives and `pdf-parse` to extract resume skills, evaluate ATS compatibility scores, compute job-to-resume match percentages, and generate tailored cover letters in <3 seconds."*
- **Web Scraping & Background Automation**: *"Engineered headless Playwright web scrapers and `node-cron` schedulers to aggregate real-time listings across 10 Indian job portals (Naukri, Foundit, LinkedIn India); implemented Mongoose compound indexes and TTL auto-purge routines."*
- **State Management & Operational Resilience**: *"Constructed an interactive React Kanban application tracker with Axios subscriber-queue refresh interceptors to handle 401 token rotations seamlessly without user session interruption."*

---

## 3. LinkedIn Project Description

**Project Title**: CareerPilot AI — AI-Powered Career Platform & Job Aggregator

**Associated with**: BMS Institute of Technology and Management (BMSIT) / Personal Portfolio

**Skills**: Node.js, Express.js, React.js, MongoDB, Mongoose, Google Gemini API, Playwright, JWT, Web Scraping, REST APIs, Tailwind CSS.

**Description**:
CareerPilot AI is an intelligent full-stack career platform engineered to streamline the placement and job application workflow for software engineers:

Key Technical Highlights:
- 🤖 **AI ATS Engine**: Leverages Google Gemini LLM SDK (`gemini-flash-latest` & `gemini-1.5-pro`) to analyze uploaded PDF resumes, calculate ATS compatibility scores, extract skill vectors, and generate tailored cover letters.
- 🕷️ **Multi-Source Web Aggregator**: Uses Playwright headless scrapers on 6-hour cron schedules to automatically fetch and normalize job listings from 10 major Indian job portals (Naukri, Foundit, Shine, Cutshort, etc.).
- 🔐 **Zero-Trust Security**: Implements dual-token JWT rotation with memory access tokens and HttpOnly refresh cookies, Zod request validation, and rate-limiting middleware.
- 📋 **Kanban Application Tracker**: Interactive React interface managing applications across 7 status lifecycle stages with automated daily email alerts via Nodemailer.
