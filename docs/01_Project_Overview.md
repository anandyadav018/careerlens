# 01. Project Overview — CareerPilot AI

## Executive Summary

**CareerPilot AI** (also referenced as **CareerLens**) is a full-stack, AI-powered career platform designed to bridge the gap between job seekers and competitive job opportunities. By integrating multi-source automated web scraping, Intelligent Document Processing (IDP) via Google Gemini LLMs, and real-time job-to-resume match scoring, CareerPilot AI automates the job search workflow, optimizes resumes for Applicant Tracking Systems (ATS), generates hyper-tailored cover letters, provides interactive mock interview preparation, and alerts users to matching job opportunities.

---

## 60-Second Elevator Pitch

> *"CareerPilot AI is an intelligent career platform built using React, Node.js, Express, MongoDB, and Google Gemini API. Traditional job hunting requires candidates to manually search multiple job boards, guess how well their resume aligns with job descriptions, write tailored cover letters from scratch, and manually track applications. CareerPilot AI solves this by aggregating real-time job listings from 10 Indian job boards using automated Playwright scrapers. It parses uploaded PDF resumes, performs deep ATS keyword and skill analysis using Gemini 1.5 LLM models, calculates job-to-resume match scores, and automatically generates custom cover letters and mock interview questions. Built with dual-token JWT authentication, optimistic client state management, and scheduled email alerts, CareerPilot AI transforms a manual 3-hour daily application process into a 5-minute automated workflow."*

---

## Project Abstract

In the modern hiring ecosystem, Applicant Tracking Systems (ATS) automatically filter out up to 75% of resume submissions before a human recruiter reviews them. Candidates face significant friction: manually searching across fragmented job boards (Naukri, Foundit, Shine, LinkedIn India, etc.), tailoring resumes and cover letters for each application, preparing for role-specific interview questions, and tracking application statuses across spreadsheets.

CareerPilot AI addresses these challenges through a centralized, three-tier architecture:
1. **Aggregator Engine**: Playwright headless scrapers run on `node-cron` schedules to fetch listings from major Indian job portals.
2. **AI Document Processing & Matching Engine**: Utilizes PDF parsing (`pdf-parse`) and Google Gemini AI (`gemini-flash-latest` / `gemini-1.5-pro`) with strict JSON schema enforcement to parse resumes, compute ATS scores, extract skills (technical, soft, tools), and generate match scores against target jobs.
3. **Application & Career Assistant**: An interactive React-based Kanban tracker manages applications across lifecycle stages (`saved`, `applied`, `phone_screen`, `interview`, `offer`, `rejected`), paired with AI-driven cover letter generation and interview preparation tools.

---

## Real-World Problem Statement

1. **Information Fragmentation**: Job opportunities are scattered across multiple job portals (Naukri, Foundit, TimesJobs, Freshersworld, Cutshort, Hirist, Indeed India, LinkedIn). Candidates waste hours checking each platform individually.
2. **The "ATS Black Hole"**: Unformatted or keyword-deficient resumes get rejected by automated screening tools without candidate feedback.
3. **Low Application Efficiency**: Writing customized cover letters and preparing relevant interview responses for dozens of job applications consumes tens of hours weekly.
4. **Disorganized Tracking**: Candidates lack visibility into application follow-up dates, interviewer contacts, and status progressions.

---

## Target Audience & Primary Stakeholders

- **Graduating Students & Entry-Level Job Seekers**: Require ATS resume feedback, skill gap analysis, and tailored interview prep for campus and off-campus placements.
- **Experienced Professionals**: Need rapid job aggregation, automated resume-to-job matching, and structured application tracking.
- **Campus Placement Cells & Career Coaches**: Can utilize ATS scoring metrics to guide candidates toward higher resume pass rates.

---

## Core Key Features

| Feature | Technical Implementation | Value Delivered |
|---|---|---|
| **Resume Parsing & ATS Scoring** | `pdf-parse` + Gemini API (`application/json` output schema) | Extracts contact info, work history, skills; generates ATS score (0–100) with section breakdown. |
| **Multi-Source Job Aggregator** | Playwright headless scrapers + `node-cron` (6-hour frequency) | Automatically aggregates listings from Naukri, Foundit, Shine, TimesJobs, Internshala, Cutshort, etc. |
| **Smart Job Match Scoring** | Gemini AI algorithm comparing resume JSON vs Job Requirements | Provides 0–100% match score, matched vs missing skills, and actionable feedback. |
| **Interactive Kanban Tracker** | React 19 + Axios + Mongoose `Application` schema | Visual drag-and-drop or status shift across 7 stages (`saved` → `offer`/`rejected`). |
| **AI Cover Letter Generator** | Gemini 1.5 Pro prompt engineering with candidate context | Generates professional, zero-placeholder cover letters tailored to specific company & position. |
| **Role-Specific Mock Interview Prep** | Gemini AI structured output (Technical, Behavioral, System Design) | Delivers 5 targeted interview questions with answering strategies and difficulty tags. |
| **Automated Email Job Alerts** | `node-cron` + Nodemailer + Mongoose `Alert` matching | Sends daily email digests of jobs matching custom user criteria (keywords, location, salary). |

---

## Expected Outcomes & Success Metrics

- **80% Reduction in Job Search Time**: Consolidated job listings remove the need for manual site-hopping.
- **35% Increase in ATS Pass Rate**: Instant feedback on missing keywords and structural gaps improves resume visibility.
- **Under 30 Seconds for Custom Applications**: Automated cover letter generation and interview prep significantly lower application effort per position.
