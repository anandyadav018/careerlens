# 16. Future Enhancements & Roadmap — CareerPilot AI

This document outlines 15 strategic technical enhancements planned for future iterations of CareerPilot AI, detailing the proposed architectural approach and engineering requirements for each.

---

## 1. Top 15 Technical Enhancements

### 1. Monetization & Payment Gateway Integration (Razorpay / Stripe)
- **Goal**: Introduce premium subscription tiers (e.g. unlimited AI cover letters, priority job alert digests).
- **Implementation Approach**: Integrate Razorpay/Stripe Webhook SDK. Add `subscription` field to `User` schema (`tier: 'free' | 'pro'`). Use Express webhooks to listen for `payment.captured` events and atomically update user access rights.

### 2. Offline Signed QR Verification for Campus Placement Drives
- **Goal**: Enable placement officers to verify student check-ins at physical college campus drives offline.
- **Implementation Approach**: Use `qrcode` npm package to generate cryptographically signed JWT strings embedded in QR images. Build a scanner interface utilizing HTML5 camera APIs to decode student identity offline.

### 3. Redis In-Memory Caching Layer
- **Goal**: Accelerate job listing query speeds and cache expensive Gemini match scores.
- **Implementation Approach**: Deploy Redis cluster. Intercept `jobService.getJobs()` queries with `redisClient.get(cacheKey)`. Store computed match scores with a 24-hour TTL (`EX 86400`) to cut Gemini API token costs by 40%.

### 4. Real-Time Notifications via WebSockets / SSE
- **Goal**: Push instant notifications when job alerts match new listings or scraper tasks complete.
- **Implementation Approach**: Integrate `Socket.io` or Server-Sent Events (SSE) into Express. Establish persistent client WebSocket connections in React to broadcast event payloads (`JOB_MATCH_FOUND`).

### 5. Vector Database & Semantic Embedding Search (Pinecone / Qdrant)
- **Goal**: Replace simple keyword/text database matching with high-dimensional semantic search.
- **Implementation Approach**: Convert resume skill profiles and job descriptions into vector embeddings using Google Text Embedding API (`text-embedding-004`). Query Pinecone index using cosine similarity to return top semantic matches.

### 6. AI Interactive Audio Mock Interviewer
- **Goal**: Conduct voice-based mock interviews with real-time speech evaluation.
- **Implementation Approach**: Use Web Speech API or OpenAI Whisper for speech-to-text transcription. Feed user audio transcript into Gemini 1.5 Flash, generating streaming audio responses using ElevenLabs / Web Speech Synthesis API.

### 7. OAuth2 Social Logins (Google & LinkedIn Sign-In)
- **Goal**: Simplify user onboarding with one-click social authentication.
- **Implementation Approach**: Integrate `passport-google-oauth20` and `passport-linkedin-oauth2`. Link Google/LinkedIn profile IDs to the Mongoose `User` schema.

### 8. Recruiter & Placement Officer Admin Dashboard
- **Goal**: Allow college placement departments to track student placement rates and export analytics.
- **Implementation Approach**: Create `/admin` RBAC role. Build aggregate data pipelines in Mongoose (`User.aggregate([...])`) to visualize placement percentages, active applications, and skill gaps across student cohorts.

### 9. Multi-Language Resume & Cover Letter Localization
- **Goal**: Support global job markets by translating resumes and cover letters into target languages (German, French, Japanese, Hindi).
- **Implementation Approach**: Add localization prompts to `aiService.js` utilizing Gemini multi-lingual translation capabilities.

### 10. Mobile Native Application (React Native)
- **Goal**: Provide native iOS and Android experiences with mobile push notifications.
- **Implementation Approach**: Port React 19 web components to React Native / Expo, reusing existing Axios API service layers and Auth Context state mechanics.

### 11. Push Notifications via Firebase Cloud Messaging (FCM)
- **Goal**: Deliver native mobile/browser push alerts for deadline reminders and new job matches.
- **Implementation Approach**: Register FCM Web SDK on client; store user FCM device tokens in Mongoose `User` document; trigger background push messages from `alertService.js`.

### 12. Automated Job Application Browser Extension
- **Goal**: Auto-fill candidate resume data into external job board forms (LinkedIn Easy Apply, Workday).
- **Implementation Approach**: Build a Chrome Extension (Manifest V3) accessing stored `parsedData` from CareerPilot API to inject form inputs into target DOM fields automatically.

### 13. Salary Insights & Offer Negotiation Assistant
- **Goal**: Predict target salary benchmarks and generate AI negotiation counter-offer emails.
- **Implementation Approach**: Train regression models on scraped salary data (`salary.min`, `salary.max`); build LLM prompt templates in `aiService.js` for salary negotiation email drafting.

### 14. Automated LaTeX Resume PDF Compiler
- **Goal**: Allow candidates to export AI-improved resumes into beautifully typeset LaTeX PDF formats.
- **Implementation Approach**: Embed `node-latex` or compile LaTeX templates on backend servers using `pdflatex` containers, serving clean downloadable PDFs to the user.

### 15. Microservices Migration with Apache Kafka / RabbitMQ
- **Goal**: Decouple heavy web scrapers and AI batch processing from the main HTTP API server.
- **Implementation Approach**: Extract Playwright scrapers into isolated worker microservices communicating asynchronously via Kafka event topics (`job.scraped`, `ai.analysis.requested`).
