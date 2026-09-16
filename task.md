# CareerLens Execution Tasks

## Backend
- [x] 1A. Job.js — change TTL from 7 days to 24 hours (auto-expire fresh listings)
- [x] 1B. db.js — remove sample job seeding (keep user seed only)
- [x] 1C. baseScraper.js — stealth mode upgrades (UA rotation, locale spoofing, resource blocking)
- [x] 1D. indiaJobBoardScraper.js — complete rewrite (Internshala, TimesJobs, Indeed India, Shine)
- [x] 1E. scrapers/index.js — remove DemoScraper, India-only defaults
- [x] 1F. scheduler.js — enable startup scrape after 15s
- [x] 1G. Resume.js — flexible string dates & GPA types to avoid Mongoose CastError
- [x] 1H. aiService.js — multi-model fallback chain (`gemini-3.1-flash-lite`, `gemini-flash-lite-latest`), exponential backoff, robust JSON parser, and local ATS heuristic engine

## Frontend
- [x] 2A. JobListings.jsx — full rewrite (fixed API response parsing, pill filter design system)
- [x] 2B. FreshJobs.jsx — fixed response parsing (res.data)
- [x] 2C. JobCard.jsx — full redesign using design system
- [x] 2D. Home.jsx — polished landing page with Indian social proof and stats
- [x] 2E. ResumeUpload.jsx & ResumeAnalysis.jsx — verified and working with live Gemini extraction
