# 05. Folder Structure — CareerPilot AI

## 1. Project Root Layout

The project is structured as a clean monorepo containing isolated `client` (React SPA) and `server` (Express API) applications, alongside root orchestration configurations.

```
careerlens/
├── .env.example              # Sample environment variables template
├── .gitignore                # Git exclusion rules
├── docker-compose.yml        # Multi-container orchestration (Node API + MongoDB)
├── implementation_plan.md    # System architecture & development phases
├── package.json              # Monorepo root scripts (concurrently dev runner)
├── README.md                 # Project documentation & local setup guide
│
├── client/                   # Frontend React 19 Application (Vite)
│   ├── index.html            # SPA Entry point HTML
│   ├── package.json          # Client dependencies & build scripts
│   ├── vite.config.js        # Vite bundler & proxy configuration
│   └── src/
│       ├── App.jsx           # Main React component container
│       ├── main.jsx          # DOM rendering entry point
│       ├── api/              # Axios HTTP client & API service abstractions
│       ├── components/       # Reusable UI component hierarchy
│       ├── context/          # React Context providers (AuthContext)
│       ├── hooks/            # Custom React hooks (useAuth)
│       ├── pages/            # View components corresponding to routes
│       ├── routes/           # React Router v7 configuration & guards
│       └── styles/           # Global styles & Tailwind CSS directives
│
└── server/                   # Backend Express.js API Server
    ├── package.json          # Server dependencies & scripts
    ├── server.js             # Server entry point & graceful shutdown hooks
    ├── uploads/              # Storage directory for uploaded resume PDFs
    ├── scripts/              # Standalone maintenance scripts (e.g. scrapeJobs.js)
    └── src/
        ├── app.js            # Express application middleware pipeline setup
        ├── config/           # Database, logger, CORS, AI configuration files
        ├── controllers/      # Request handlers & HTTP response logic
        ├── jobs/             # Background node-cron schedulers & Playwright scrapers
        ├── middleware/       # Custom Express middleware (auth, rate-limit, error)
        ├── models/           # Mongoose ODM database schemas
        ├── routes/           # RESTful API route definitions
        ├── services/         # Core business logic layer
        ├── utils/            # Shared helper functions & custom AppError class
        └── validators/       # Zod input validation schemas
```

---

## 2. Directory Responsibilities & Modules

### 2.1 Server Architecture (`/server/src`)

| Folder / File | Primary Responsibility |
|---|---|
| `server.js` | Boots the HTTP server, initializes MongoDB connection, starts cron schedulers, ensures `/uploads` directory exists, and handles process signals (`SIGTERM`, `SIGINT`). |
| `src/app.js` | Configures Express security headers (Helmet), CORS, body parsers, cookie parsers, request logger (Morgan), rate limiter, static route mounting, API route binding, and global error handling middleware. |
| `src/config/` | Contains configuration instances: `db.js` (Mongoose connection), `env.js` (Environment variable validation), `logger.js` (Winston logging), `cors.js` (CORS policies), and `ai.js` (Google Generative AI SDK initialization). |
| `src/controllers/` | HTTP request controllers (`authController`, `resumeController`, `jobController`, `aiController`, `applicationController`, `alertController`, `userController`). Extract query/params/body, invoke services, and format JSON responses. |
| `src/services/` | Encapsulates all domain business logic (`authService`, `resumeService`, `jobService`, `aiService`, `applicationService`, `alertService`, `emailService`). Keeps controllers thin. |
| `src/models/` | Mongoose schema definitions: `User.js`, `Resume.js`, `Job.js`, `Application.js`, `Alert.js`, `CoverLetter.js`, `InterviewPrep.js`. Defines indexes, validation, and transformations. |
| `src/routes/` | Express routers exposing endpoints under `/api/v1/*`. Binds routes to auth middleware, Zod validators, and controller functions. |
| `src/middleware/` | Custom middleware layer: `authMiddleware.js` (JWT protection), `errorHandler.js` (Centralized error catcher), `rateLimiter.js` (Express-rate-limit instances), `upload.js` (Multer PDF filter), `validate.js` (Zod validator wrapper). |
| `src/jobs/` | Automation tasks: `scheduler.js` (node-cron registry), `scrapers/` (`baseScraper.js`, `indiaJobBoardScraper.js` using Playwright), `tasks/` (`scrapeJobs.js`, `jobAlerts.js`). |
| `src/validators/` | Zod validation schemas for request bodies (auth, job filters, alert settings). |
| `src/utils/` | Utility tools: `AppError.js` (Custom operational error class), `tokenUtils.js` (JWT signing & verification helpers). |

---

### 2.2 Client Architecture (`/client/src`)

| Folder / File | Primary Responsibility |
|---|---|
| `main.jsx` | Mounts the React root element wrapped in `BrowserRouter` and `AuthProvider`. |
| `App.jsx` | Top-level component rendering layout wrappers and `AppRoutes`. |
| `api/` | `axiosInstance.js` (Configured Axios client with automatic access token header injection and subscriber-queue token refresh on 401), plus API modules (`authApi.js`, `resumeApi.js`, `jobApi.js`, `aiApi.js`, `applicationApi.js`, `alertApi.js`). |
| `context/AuthContext.jsx` | React Context storing current user state and access token in memory; exposes `login`, `register`, `logout`, and token setters. |
| `hooks/useAuth.js` | Custom React hook giving components easy access to `AuthContext`. |
| `routes/` | `AppRoutes.jsx` (Defines public/protected client routes), `ProtectedRoute.jsx` (Guards authenticated pages, redirecting unauthenticated users to `/login`). |
| `pages/` | Page components: `Home`, `Login`, `Register`, `Dashboard`, `ResumeUpload`, `ResumeAnalysis`, `JobListings`, `JobDetail`, `CoverLetter`, `InterviewPrep`, `Applications` (Kanban Board), `AlertSettings`, `Profile`. |
| `components/` | Reusable atomic components: `common/` (`Button`, `Input`, `Spinner`), `layout/` (`Navbar`, `PageWrapper`), `jobs/` (`JobCard`), `applications/` (`KanbanBoard`), `resume/` (`ResumeUploader`, `ScoreCard`, `SkillTag`). |
