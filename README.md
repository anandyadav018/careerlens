# CareerLens AI

An AI-powered career platform that intelligently matches your resume to job opportunities, tracks your applications, and provides personalized AI-generated cover letters and interview prep.

## 🚀 Features

- **Resume Parsing & AI Analysis**: Upload your PDF resume, extract text, and get instant ATS scoring, skill extraction, and improvement suggestions via Gemini API.
- **Job Aggregator Engine**: Automated Playwright scrapers gather fresh job postings every 24 hours.
- **Smart Matching**: Compares your resume skills with job requirements to generate a real-time "Match Score".
- **Application Tracker**: Interactive Kanban board to manage applications from "Saved" to "Offer".
- **AI Career Tools**: Generate highly tailored cover letters and mock interview questions based on the specific job description and your unique background.
- **Job Alerts**: Receive daily email digests of new jobs that match your saved criteria.

## 🛠 Tech Stack

- **Frontend**: React, Tailwind CSS, Lucide Icons, Vite
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **AI**: Google Gemini API (gemini-1.5-pro, gemini-1.5-flash)
- **Background Jobs**: Node-cron, Playwright (Scraping), Nodemailer (Emails)

## 🚀 How to Run the Project Locally

### 1. Start the Backend API
The backend requires Node.js and a running MongoDB instance.
```bash
cd server
npm install
npm run dev
```
*The API will start on **http://localhost:5001** (check `server/.env` if you need to change this).*

### India job sources

The job collector is configured for Naukri, Foundit, Shine, TimesJobs, Freshersworld, Internshala, Cutshort, Hirist, Indeed India, and LinkedIn India. It refreshes every six hours. To enable only selected sources, add this to `server/.env`:

```env
JOB_SOURCES=naukri,foundit,internshala,cutshort
```

You can import current listings on demand with `cd server && npm run jobs:sync`.

### 2. Start the Frontend App
The frontend requires Node.js and uses Vite.
```bash
cd client
npm install
npm run dev
```
*The web app will be available at **http://localhost:5173**.*

## 📦 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB instance (local or Atlas)
- Gemini API Key

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd careerlens
```

### 2. Backend Setup
```bash
cd server
npm install
cp ../.env.example .env
# Edit .env with your MongoDB URI and Gemini API key
npm run dev
```

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev
```

### 4. Running with Docker (Optional)
```bash
docker-compose up --build
```

## 🏗 System Architecture

CareerLens AI is built as a service-oriented monolith. 
See the [Implementation Plan](./implementation_plan.md) for full architectural details, database schemas, and data flows.
