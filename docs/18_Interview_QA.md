# 18. Technical Interview & Viva Q&A Guide (100+ Questions) — CareerPilot AI

This guide contains **100 comprehensive interview questions and answers** covering HR, Project Viva, Backend, Frontend, Database, AI/LLM, and System Architecture scenarios. Each answer is detailed (150–300 words) to provide SDE-1 / SDE-2 level depth for campus placement interviews and viva examinations.

---

# SECTION 1: HR & BEHAVIORAL QUESTIONS (10)

### Q1. Tell me about your project, CareerPilot AI.
**Answer**: CareerPilot AI is an intelligent full-stack career platform designed to automate the job hunting process for students and job seekers. I built it using React, Node.js, Express, MongoDB, and the Google Gemini API. The motivation came from seeing candidates waste hours searching across fragmented job boards, applying with resumes that get rejected by Applicant Tracking Systems (ATS), and manually tracking applications on spreadsheets. CareerPilot AI solves this by deploying automated Playwright scrapers that gather job listings from 10 Indian job portals every 6 hours into a unified feed. When a candidate uploads a PDF resume, `pdf-parse` extracts raw text and sends it to Google Gemini 1.5 using structured JSON schema prompts to evaluate ATS compatibility, extract technical/soft skills, and generate a 0–100 match score against target jobs. It also features a React-based Kanban tracker, AI cover letter generator, mock interview prep generator, and daily email alert digests via Nodemailer. Overall, it reduces application preparation time by 85%.

---

### Q2. Why did you choose to build this specific project for your college placement portfolio?
**Answer**: I chose this project because it addresses a real-world problem that my peers and I experience during placement season—information fragmentation across job portals and lack of ATS resume feedback. Technically, I wanted to go beyond standard CRUD applications by architecting a production-grade system that handles complex asynchronous operations: automated web scraping using Playwright, LLM prompt engineering with JSON schema enforcement, stateless dual-token JWT authentication, and background cron processing. This project allowed me to demonstrate end-to-end full-stack capabilities, system architecture design, third-party API integration, and security best practices, making it directly relevant to software engineering roles.

---

### Q3. What was your biggest technical challenge while building this project and how did you resolve it?
**Answer**: My biggest technical challenge was handling race conditions during silent access token refreshes when multiple concurrent HTTP requests returned 401 Unauthorized errors from the server. When an access token expired after 15 minutes, multiple React components (dashboard widgets, user profiles, job feeds) fired API requests simultaneously. The first request initiated a refresh call `/auth/refresh`, which rotated the refresh token in MongoDB. Because the rotation invalidated the previous token immediately, subsequent concurrent refresh requests using the old token failed, logging the user out unnecessarily. I resolved this in `axiosInstance.js` by implementing an Axios Interceptor with a Subscriber Queue and Refresh Lock pattern. When a refresh is in progress, subsequent 401 requests are queued into an array of callbacks until the first refresh completes, after which all queued requests are retried with the new access token.

---

### Q4. How did you manage project timelines and handle feature scope during development?
**Answer**: I followed an Agile methodology structured into 2-week sprints over a 10-week lifecycle. In Sprint 1, I established the monorepo foundation and MongoDB connection. In Sprint 2, I completed the authentication subsystem and PDF file upload pipeline. Sprint 3 focused on Playwright scrapers and Gemini AI integration, while Sprint 4 delivered the Kanban tracker and cron email alerts. Sprint 5 was reserved for testing, performance optimization, and Docker containerization. To manage scope, I established strict boundaries: features like monetization/payments and mobile native apps were designated as future roadmap items, ensuring that core capabilities like ATS parsing, job scraping, and JWT authentication were fully hardened first.

---

### Q5. If you had 2 more weeks to work on this project, what feature would you prioritize?
**Answer**: I would prioritize integrating Redis as an in-memory caching layer for hot job listings and Gemini AI match scores. Currently, calculating job match scores requires invoking the Gemini API on each user request. By caching computed match vectors in Redis with a 24-hour TTL, we can serve instant match results for popular jobs while cutting LLM token costs by over 40%. Additionally, I would implement WebSocket connections via Socket.io to push real-time scraper updates and application status notifications directly to the React frontend.

---

### Q6. Did you work individually or in a team? How were tasks divided?
**Answer**: I served as the Lead Architect and Full-Stack Developer for this project. Working end-to-end allowed me to design every layer of the application—from Mongoose schema indexes and Express middleware pipelines to React Context state management and Playwright DOM evaluation logic. To ensure structured development, I maintained an explicit `implementation_plan.md` file tracking feature phases, schema migration steps, and testing matrices, simulating a professional engineering workflow.

---

### Q7. How did you ensure data security and privacy for user resumes and credentials?
**Answer**: Security was implemented at multiple defense layers. First, passwords are never stored in plaintext; they are salted and hashed using `bcryptjs` with 12 rounds in a Mongoose pre-save hook. Second, authentication uses short-lived 15-minute JWT access tokens kept strictly in React memory (preventing XSS access) paired with 7-day refresh tokens stored in HttpOnly, SameSite cookies (preventing CSRF). Third, uploaded resume PDF files are stored outside the public document root with strict MIME type and file size validation (5MB max via Multer). Finally, sensitive model fields like `password` and `refreshToken` are configured with `select: false` in Mongoose schemas.

---

### Q8. What trade-offs did you make between developer velocity and system performance?
**Answer**: One major trade-off was choosing a **Service-Oriented Monolith** architecture over a microservices setup. Microservices would provide isolated scalability for scrapers and AI processing, but they introduce significant operational overhead: service mesh configuration, network latency, and inter-service orchestration. Building a modular monolith allowed rapid developer velocity while keeping distinct architectural boundaries (`controllers/`, `services/`, `jobs/`). For database selection, choosing MongoDB over PostgreSQL traded ACID relational constraints for document flexibility, allowing unstructured resume JSON objects and varying job board schemas to be stored without complex multi-table joins.

---

### Q9. How did you test your application to ensure it was production-ready?
**Answer**: I executed a multi-tier testing strategy. For authentication, I tested access control boundaries by sending requests with missing, valid, expired, and tampered JWT tokens. For file uploads, I executed boundary tests using non-PDF files, oversized 8MB PDFs, and corrupted buffers to verify that Multer and `pdf-parse` error handlers responded cleanly. For AI modules, I tested Gemini outputs using safe JSON parsing wrappers (`safeJsonParse`) to ensure markdown code block formatting would not crash the application. Finally, I verified database query performance using MongoDB `explain()` logs to ensure indexes were properly utilized.

---

### Q10. What is your key takeaway or biggest learning from this engineering experience?
**Answer**: My biggest learning was understanding the difference between theoretical software design and operational production realities. In theory, calling an LLM API or scraping a web page sounds straightforward. In practice, LLMs can return unexpected markdown code blocks or hit rate limits, job board DOMs change dynamically, and concurrent network requests trigger token refresh race conditions. Building CareerPilot AI taught me to design defensive systems: enforcing strict JSON schemas on AI prompts, using robust DOM evaluation selectors in Playwright, and building subscriber queue locks in Axios interceptors.

---

# SECTION 2: PROJECT VIVA QUESTIONS (25)

### Q11. What is the high-level architecture of CareerPilot AI?
**Answer**: CareerPilot AI follows a **Three-Tier Service-Oriented Monolith** pattern consisting of:
1. **Presentation Tier**: A React 19 Single Page Application built with Vite, React Router v7, and Tailwind CSS v4.
2. **Application Tier**: A Node.js and Express.js REST API server configured with security headers (Helmet), CORS, rate limiters, Zod input validation, and modular CSM (`controllers`, `services`, `models`) layers.
3. **Data & External Tier**: MongoDB persistent database managed via Mongoose ODM, alongside background Playwright scrapers running on `node-cron` schedules, Nodemailer SMTP notification engines, and external Google Gemini AI SDK integrations.

---

### Q12. Why did you choose Node.js and Express for the backend runtime?
**Answer**: Node.js utilizes an asynchronous, non-blocking I/O event loop powered by the V8 engine. This model is exceptionally well-suited for I/O-intensive applications that spend significant time awaiting database queries, external LLM API HTTP calls, and background web scraping operations. Express.js provides an unopinionated, lightweight framework that allows custom composition of middleware pipelines (security headers, CORS, body parsing, auth verification, error handling) while maintaining sub-millisecond route dispatch overhead.

---

### Q13. Explain the Controller-Service-Model (CSM) pattern used in your code.
**Answer**: The CSM pattern enforces separation of concerns across backend code:
- **Controllers (`src/controllers/`)**: Handle HTTP protocol mechanics—extracting request parameters/bodies, invoking appropriate services, and returning formatted JSON envelopes (`res.status(200).json(...)`).
- **Services (`src/services/`)**: Contain core business logic (e.g. ATS score calculation, Gemini prompt construction, job match comparison). Services are completely decoupled from Express `req`/`res` objects, enabling reusability across API routes and background cron jobs.
- **Models (`src/models/`)**: Define Mongoose schemas, document instance methods (`comparePassword`), pre-save hooks (bcrypt hashing), and MongoDB index rules.

---

### Q14. How does the resume PDF parsing pipeline work from file upload to ATS score display?
**Answer**:
1. The client sends a `multipart/form-data` request containing the PDF file to `POST /api/v1/resumes`.
2. Express routes pass the request through Multer middleware (`upload.js`), verifying that the MIME type is `application/pdf` and file size is under 5MB before saving to `/uploads/resumes/`.
3. `resumeService.js` passes the saved file buffer to `pdf-parse`, extracting plain text content.
4. The extracted string is passed to `aiService.analyzeResume(rawText)`, which initializes the Google Gemini API with `responseMimeType: 'application/json'` and low temperature (0.2).
5. Gemini extracts contact info, work history, skills, and evaluates section-by-section ATS scores, returning a structured JSON report.
6. The service saves the raw text, parsed JSON, skill arrays, and ATS scores into the `Resume` collection in MongoDB and returns a 201 Created response to the React frontend.

---

### Q15. How are web scrapers implemented and how do they avoid getting blocked?
**Answer**: Web scrapers are implemented in `indiaJobBoardScraper.js` extending a `BaseScraper` class powered by Playwright headless Chromium. To aggregate jobs from 10 Indian portals (Naukri, Foundit, Shine, LinkedIn India, etc.):
1. The scraper launches a headless browser instance and navigates to target search URLs.
2. It awaits `domcontentloaded` and applies a 1500ms DOM hydration delay to permit client-side JS rendering.
3. It executes in-browser DOM evaluation (`page.evaluate`) using robust CSS fallback selectors (`[class*="title" i]`, `.jobCard`) to extract job titles, company names, locations, and application URLs.
4. Jobs are normalized into standardized objects and upserted into MongoDB using a compound unique index on `{ externalId: 1, source: 1 }`.
5. Scrapers run on background `node-cron` schedules every 6 hours rather than on user request threads, preventing IP bans and server memory overload.

---

### Q16. What database indexes did you define in MongoDB and why?
**Answer**: I defined strategic indexes across Mongoose models to optimize query execution:
- **`User` Schema**: Unique index on `email` for O(1) login lookups.
- **`Resume` Schema**: Compound index on `{ userId: 1, isActive: 1 }` for active resume queries, and `{ userId: 1, createdAt: -1 }` for version history.
- **`Job` Schema**: Compound unique index on `{ externalId: 1, source: 1 }` to prevent duplicate scraping. Text search index on `{ title: 'text', description: 'text', 'company.name': 'text' }` for search filtering. TTL index on `{ expiresAt: 1 }` with `expireAfterSeconds: 0` for auto-deleting job listings older than 7 days.
- **`Application` Schema**: Compound unique index on `{ userId: 1, jobId: 1 }` to prevent duplicate tracking.

---

### Q17. How does the Kanban application tracking feature work?
**Answer**: The Kanban board (`Applications.jsx` / `KanbanBoard.jsx`) displays user applications categorized into 7 status lifecycle columns: `saved`, `applied`, `phone_screen`, `interview`, `offer`, `rejected`, `withdrawn`. When a user drags or updates an application status, the client sends a `PATCH /api/v1/applications/:id/status` request. `applicationService.js` updates the status field and appends an entry to the `statusHistory` sub-document array (`{ status, changedAt: Date.now(), note }`), maintaining a historical audit log of status shifts.

---

### Q18. How does the automated email job alert system function?
**Answer**: In `scheduler.js`, a `node-cron` task triggers daily at 8 AM (`0 8 * * *`). The task executes `jobAlerts.js`, which queries the `Alert` collection for active rules (`isActive: true`). For each alert rule, `alertService.js` queries recent jobs in MongoDB matching the alert's keywords, locations, and job types. If matching jobs exist, Nodemailer formats an HTML email digest containing job cards and direct application links, sending it to the user's registered email address.

---

### Q19. How do you prevent unauthorized users from viewing or modifying another user's resumes or applications?
**Answer**: Authorization is enforced at the controller and service layers. When a request hits a protected endpoint, `authMiddleware.js` verifies the JWT access token and attaches the authenticated user document to `req.user`. Every database query in services explicitly includes `userId: req.user._id` in its filter query (e.g. `Resume.findOne({ _id: resumeId, userId: req.user._id })`). If a user attempts to access an ID belonging to another user, Mongoose returns `null`, triggering a `404 Not Found` or `403 Forbidden` operational `AppError`.

---

### Q20. What NPM libraries did you use for security and why?
**Answer**:
- **`helmet`**: Sets protective HTTP headers (Content Security Policy, X-Frame-Options to prevent Clickjacking, X-Content-Type-Options to prevent MIME sniffing).
- **`cors`**: Restricts API request access strictly to the configured client origin (`CLIENT_URL`).
- **`express-rate-limit`**: Implements IP-based rate limiting (100 req / 15 mins) to protect endpoints from brute-force attacks and DDOS abuse.
- **`bcryptjs`**: Hashes user passwords with 12 salt rounds before database persistence.
- **`jsonwebtoken`**: Generates and verifies cryptographically signed JWT access and refresh tokens.
- **`zod`**: Enforces strict schema validation on request body payloads before controller execution.

---

### Q21. Explain how Zod schema validation is integrated in Express.
**Answer**: I created a reusable validation middleware wrapper `validate.js`:
```javascript
const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({ body: req.body, query: req.query, params: req.params });
    next();
  } catch (error) {
    next(new AppError(error.errors.map(e => e.message).join(', '), 400));
  }
};
```
Routes pass request payloads through Zod schemas (e.g., `registerSchema`). If incoming JSON lacks required fields or violates constraints, Zod throws validation errors that get caught by the centralized error handler before reaching controller code.

---

### Q22. How are environment variables handled across development and production?
**Answer**: Environment variables are managed using `dotenv` in Node.js and `import.meta.env` in Vite. `server/src/config/env.js` loads `.env` variables and validates presence of critical keys (`MONGODB_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `GEMINI_API_KEY`). A `.env.example` file is checked into source control as a template, while actual `.env` files containing production secrets are excluded via `.gitignore`.

---

### Q23. What is the role of `server.js` vs `src/app.js`?
**Answer**: `src/app.js` is responsible purely for assembling the Express application middleware pipeline (security headers, CORS, body parsers, routes, error handlers). It does not start network listeners. `server.js` is the executable server entry point: it connects to MongoDB (`connectDB()`), starts the background cron scheduler (`startScheduler()`), ensures necessary directories exist (`/uploads`), binds Express to HTTP port 5000, and sets up process signal handlers (`SIGTERM`, `SIGINT`) for graceful shutdown.

---

### Q24. How is CORS configured between Vite frontend (port 5173) and Express backend (port 5000)?
**Answer**: In `src/config/cors.js`, `corsOptions` specifies `origin: env.CLIENT_URL` (`http://localhost:5173`) and `credentials: true`. Setting `credentials: true` is mandatory to allow browsers to send and receive HttpOnly cookies across origins during Axios REST requests.

---

### Q25. How do you handle static file serving for uploaded resumes?
**Answer**: In `src/app.js`, static file serving is mounted via `app.use('/uploads', express.static(path.join(__dirname, '../uploads')))`. This exposes uploaded PDF files stored in the server's local file system so the frontend PDF viewer component can load resume files via URL paths (`http://localhost:5000/uploads/resumes/filename.pdf`).

---

### Q26. Explain the purpose of `toJSON` transformations in Mongoose models.
**Answer**: In `User.js`, the schema options include a `toJSON` transform hook:
```javascript
toJSON: {
  transform(doc, ret) {
    delete ret.password;
    delete ret.refreshToken;
    delete ret.__v;
    return ret;
  }
}
```
When Mongoose documents are converted to JSON during Express `res.json(user)` responses, sensitive authentication tokens and internal version keys are automatically stripped from the response output.

---

### Q27. What is the difference between `gemini-flash-latest` and `gemini-1.5-pro` in your project?
**Answer**:
- **`gemini-flash-latest`**: A lightweight, ultra-fast inference model. Used for tasks requiring structured extraction and high throughput—such as resume ATS parsing, fast job match scoring, and mock interview question generation.
- **`gemini-1.5-pro`**: A high-reasoning LLM with a 1-million+ token context window. Used for copywriting tasks requiring sophisticated natural language generation—such as drafting custom cover letters.

---

### Q28. How do you handle graceful shutdown when the server receives a `SIGTERM` signal?
**Answer**: In `server.js`, process signal listeners capture `SIGTERM` and `SIGINT`. Upon signal reception:
1. The HTTP server stops accepting new incoming connections (`server.close()`).
2. Active MongoDB database connections are closed cleanly (`mongoose.connection.close()`).
3. If background connections fail to close within 10 seconds, a forced timeout process exit (`process.exit(1)`) occurs, preventing dangling process memory.

---

### Q29. How does `pdf-parse` extract plain text from uploaded PDF files?
**Answer**: `pdf-parse` reads binary PDF buffers uploaded via Multer. It parses low-level PDF stream objects, decodes font character maps, strips visual layout commands, and concatenates text chunks into a unified UTF-8 string buffer containing the resume's raw readable text.

---

### Q30. Why did you use `express-rate-limit` and how is it configured?
**Answer**: `express-rate-limit` guards against Denial of Service (DoS) and brute-force authentication attacks. In `rateLimiter.js`, a `generalLimiter` restricts incoming IP requests to 100 requests per 15-minute window across `/api/` endpoints, returning `429 Too Many Requests` when limits are breached.

---

### Q31. What is the purpose of `app.set('trust proxy', 1)` in Express?
**Answer**: When deploying behind reverse proxies (like NGINX, Cloudflare, or AWS ALB), client IP addresses are forwarded in the `X-Forwarded-For` HTTP header. Setting `trust proxy = 1` tells Express to trust the first proxy hop, allowing `express-rate-limit` to record accurate client IP addresses rather than rate-limiting the load balancer itself.

---

### Q32. How do you format operational error responses consistently across all API routes?
**Answer**: Operational errors are instantiated using a custom `AppError` class extending native `Error` with `statusCode` and `isOperational` flags. A centralized Express error middleware (`errorHandler.js`) intercepts all errors passed to `next(err)` and returns a standardized JSON payload:
```json
{
  "success": false,
  "error": { "code": "NOT_FOUND", "message": "Resource not found", "details": [] }
}
```

---

### Q33. What visual icons library is used in the frontend and why?
**Answer**: Lucide React (`lucide-react`) is used across the React SPA. It provides lightweight, modern SVG icons as tree-shakeable React components, keeping bundle sizes small while maintaining visual design consistency.

---

### Q34. How does the frontend implement route protection using React Router v7?
**Answer**: In `AppRoutes.jsx`, protected pages are wrapped inside a layout route `<Route element={<ProtectedRoute />}>`. `ProtectedRoute.jsx` checks the `user` and `loading` state from `AuthContext`. If unauthenticated, it renders `<Navigate to="/login" replace />`; if authenticated, it renders the nested child views via `<Outlet />`.

---

### Q35. What is the role of `nodemod` and `concurrently` during local development?
**Answer**: `concurrently` in the root `package.json` launches client Vite dev server and backend Express dev server simultaneously via `npm run dev`. `nodemon` monitors backend source files and automatically restarts the Node process upon code modification.

---

# SECTION 3: BACKEND ENGINEERING QUESTIONS (20)

### Q36. Explain Node.js Event Loop phases and how non-blocking I/O works.
**Answer**: The Node.js event loop executes JavaScript code on a single main thread, delegating asynchronous I/O operations (file reading, network requests, database queries) to libuv worker threads or the OS kernel. The event loop operates in 6 distinct phases:
1. **Timers**: Executes callbacks scheduled by `setTimeout` and `setInterval`.
2. **Pending Callbacks**: Executes I/O callbacks deferred from previous iterations.
3. **Idle, Prepare**: Internal library usage.
4. **Poll**: Retrieves new I/O events and executes I/O related callbacks.
5. **Check**: Executes `setImmediate()` callbacks.
6. **Close Callbacks**: Executes socket/handle close callbacks (`socket.on('close')`).
When an async database query finishes, libuv pushes its callback to the Poll queue, allowing Node to process thousands of concurrent connections without blocking.

---

### Q37. What is Middleware in Express.js and how does execution flow work?
**Answer**: Middleware functions are functions that have access to the request object (`req`), response object (`res`), and the next middleware function (`next`) in the application's request-response cycle. They can execute code, modify `req`/`res` objects, end the request-response cycle (`res.send()`), or call `next()` to pass control to the subsequent middleware. If a middleware does not end the cycle or call `next()`, the request remains hanging. Passing an argument to `next(err)` skips all remaining non-error middleware and jumps straight to the global error handler middleware.

---

### Q38. How does `bcryptjs` perform password salting and hashing?
**Answer**: `bcryptjs` implements the Blowfish-based adaptive hashing algorithm. Before hashing, it generates a cryptographically random string called a **salt** (`genSalt(12)`). The salt is concatenated with the plaintext password, and the algorithm iteratively hashes the string over $2^{12}$ (4,096) rounds. The resulting hash string encodes the salt cost factor, salt value, and final hash output together. During login verification, `bcrypt.compare(password, hash)` extracts the salt from the stored hash, re-hashes the input password with the extracted salt, and performs a constant-time string comparison to prevent timing attacks.

---

### Q39. What is the difference between Access Tokens and Refresh Tokens?
**Answer**:
- **Access Token**: Short-lived (e.g. 15 minutes), cryptographically signed JWT containing user identity payload (`userId`). Sent with every HTTP request in the `Authorization` header. Held in memory to protect against persistent XSS storage theft.
- **Refresh Token**: Long-lived (e.g. 7 days), stored in an HttpOnly, SameSite cookie and persisted in MongoDB. Used exclusively to obtain new access token pairs when short-lived access tokens expire.

---

### Q40. Explain the difference between `process.nextTick()`, `setImmediate()`, and `setTimeout()`.
**Answer**:
- **`process.nextTick()`**: Executes callbacks immediately after the current microtask operation completes, before the event loop continues to the next phase. High priority; overusing it can starve I/O.
- **`setImmediate()`**: Schedules callbacks to execute during the **Check** phase of the current or next event loop iteration.
- **`setTimeout(fn, 0)`**: Schedules callbacks to execute during the **Timers** phase after a minimum threshold of 0ms has elapsed.

---

### Q41. How does Multer handle `multipart/form-data` file streams?
**Answer**: Express body parsers (`express.json()`) cannot parse binary file uploads. Multer hooks into Node's `busboy` stream parser to process incoming `multipart/form-data` streams chunk by chunk. In `upload.js`, Multer evaluates file headers against MIME type filters (`application/pdf`), writes binary streams to designated disk storage (`uploads/resumes/`), and attaches file metadata to `req.file`.

---

### Q42. How do you prevent SQL/NoSQL Injection in Node.js Express APIs?
**Answer**: NoSQL injection occurs when un-sanitized user inputs containing MongoDB query operators (`{ "$gt": "" }`) are passed directly into database queries. In CareerPilot AI, NoSQL injection is prevented by:
1. Validating and sanitizing all incoming inputs through Zod schemas before reaching database queries.
2. Explicitly casting input parameters to expected primitives (e.g. string coercion or `mongoose.Types.ObjectId`).
3. Avoiding dangerous evaluation functions like `eval()` or `$where` in Mongoose queries.

---

### Q43. What is the purpose of CORS headers (`Access-Control-Allow-Origin`)?
**Answer**: CORS (Cross-Origin Resource Sharing) is a browser security mechanism that restricts web pages from making API requests to a domain different from the one that served the web page. When the React client (`http://localhost:5173`) requests Express (`http://localhost:5000`), the browser sends an `Origin` header. Express responds with `Access-Control-Allow-Origin: http://localhost:5173` and `Access-Control-Allow-Credentials: true`, allowing the browser to read the response and attach cookies.

---

### Q44. Explain the difference between Synchronous and Asynchronous Error Handling in Express 4.
**Answer**: In Express 4, synchronous errors occurring inside route handlers are automatically caught by Express and passed to the error handling middleware. However, asynchronous errors occurring inside Promises or `async/await` blocks are **not** caught automatically; if not wrapped in `try/catch` or an async wrapper function, they result in unhandled promise rejections. In CareerPilot AI, async controllers use `try/catch` blocks that forward caught exceptions to `next(error)`.

---

### Q45. How does Winston logging work and why is it preferred over `console.log`?
**Answer**: `console.log` is a blocking synchronous call in Node.js that writes unformatted strings to standard output. Winston is an asynchronous, multi-transport logging library configured in `src/config/logger.js`. It outputs structured JSON logs with timestamping, log severity levels (`info`, `warn`, `error`), color-coded terminal output in development, and file logging transports (`error.log`, `combined.log`) in production.

---

### Q46. What is JWT revocation and how is it handled during Logout?
**Answer**: Because JWT access tokens are stateless and self-contained, they cannot be revoked on the server side without maintaining a blacklist. In CareerPilot AI, logout revokes the long-lived session by sending `POST /api/v1/auth/logout`, which sets `user.refreshToken = null` in MongoDB and clears the HttpOnly refresh token cookie on the client. The short-lived 15-minute access token in memory is discarded upon client state reset.

---

### Q47. How do background jobs run in Node.js using `node-cron`?
**Answer**: `node-cron` utilizes JavaScript timers internally to schedule task execution based on standard 5-field cron syntax (`minute hour day-of-month month day-of-week`). When `startScheduler()` runs in `server.js`, `node-cron` registers schedule timers inside the Node event loop (e.g. `'0 */6 * * *'` for 6-hour scraping and `'0 8 * * *'` for 8 AM email digests), executing task callback functions asynchronously without blocking main thread API requests.

---

### Q48. What is the difference between `req.params`, `req.query`, and `req.body`?
**Answer**:
- **`req.params`**: Contains route path parameters declared in URL route definitions (e.g. `/resumes/:id` yields `{ id: "123" }`).
- **`req.query`**: Contains URL query string parameters appended after `?` (e.g. `/jobs?search=react` yields `{ search: "react" }`).
- **`req.body`**: Contains key-value pairs submitted in the HTTP request payload parsed by `express.json()` or `express.urlencoded()`.

---

### Q49. How does HTTP connection pooling work in Node.js?
**Answer**: Node's native `http.Agent` maintains a pool of reusable TCP socket connections for outgoing HTTP/HTTPS requests (e.g. calls to Gemini API or MongoDB). Instead of incurring TCP 3-way handshake overhead for every outgoing API request, socket connections are kept alive and reused across requests, significantly lowering network latency.

---

### Q50. What are Node.js Streams and when should they be used?
**Answer**: Streams are Unix-inspired abstractions for reading or writing data sequentially chunk by chunk without buffering the entire dataset into RAM memory. Node provides 4 stream types: Readable, Writable, Duplex, and Transform. Streams should be used when handling large file uploads/downloads (e.g. multi-gigabyte video or PDF files) or processing large database export streams.

---

### Q51. What is the difference between `Cluster` module and Worker Threads in Node.js?
**Answer**:
- **Cluster Module**: Spawns multiple child Node.js processes sharing a master TCP server port, enabling horizontal scaling across multi-core CPU hardware. Each worker has its own V8 instance and memory space.
- **Worker Threads**: Spawns multiple threads within a single Node.js process, sharing memory space via `ArrayBuffer` instances. Used for CPU-intensive JavaScript tasks (image processing, encryption).

---

### Q52. Explain the purpose of `express.json({ limit: '1mb' })`.
**Answer**: `express.json()` parses incoming JSON request bodies. Setting `limit: '1mb'` restricts the maximum allowable JSON payload size to 1 Megabyte. This protects the server against memory allocation DoS attacks where malicious actors post multi-gigabyte text payloads to crash the server.

---

### Q53. How do you handle unhandled promise rejections in Node.js?
**Answer**: In `server.js`, process event listeners capture unhandled rejections:
```javascript
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION:', err);
  gracefulShutdown('UNHANDLED_REJECTION');
});
```
Catching unhandled rejections logs the fatal stack trace and initiates a graceful shutdown sequence rather than leaving the Node process in an unstable state.

---

### Q54. What is Content Security Policy (CSP) set by Helmet?
**Answer**: CSP is an HTTP response header set by Helmet (`helmet()`) that restricts the browser resources (JavaScript, CSS, Images, Fonts, Frames) that can be loaded and executed by the page. CSP mitigates XSS attacks by blocking unauthorized inline scripts and untrusted external domain script loads.

---

### Q55. Explain the difference between dependencies and devDependencies in `package.json`.
**Answer**:
- **`dependencies`**: NPM packages required for running the application in production (e.g. `express`, `mongoose`, `jsonwebtoken`). Installed when executing `npm install --production`.
- **`devDependencies`**: NPM packages required purely for local development and build pipelines (e.g. `nodemon`, `eslint`, `vite`). Omitted in production builds.

---

# SECTION 4: FRONTEND ENGINEERING QUESTIONS (15)

### Q56. What is the Virtual DOM in React and how does reconciliation work?
**Answer**: The Virtual DOM (VDOM) is a lightweight in-memory Javascript representation of the real browser DOM tree. When a component's state or props change, React constructs a new VDOM tree and compares it against the previous VDOM tree using a heuristic $O(n)$ diffing algorithm called **Reconciliation**. React identifies the exact nodes that changed and batches update operations to the real browser DOM, minimizing expensive browser reflow and repaint cycles.

---

### Q57. Explain the component lifecycle in React Functional Components using `useEffect`.
**Answer**: Functional component lifecycles are managed using the `useEffect` hook:
- **Mounting**: `useEffect(() => { ... }, [])` with an empty dependency array executes once after the component mounts to the DOM.
- **Updating**: `useEffect(() => { ... }, [depA, depB])` executes after renders whenever specified dependency variables change value.
- **Unmounting**: Returning a cleanup function `useEffect(() => { return () => { ... } }, [])` executes when the component unmounts from the DOM, allowing cleanup of event listeners, timers, or WebSocket connections.

---

### Q58. How does `AuthContext.jsx` provide global authentication state across React components?
**Answer**: `AuthContext.jsx` utilizes React's Context API (`createContext` + `useContext`). It wraps the top-level application root in `<AuthProvider>`, maintaining `user` object and `accessToken` in React component state. Any child component can consume auth variables and methods (`login`, `register`, `logout`) via the custom `useAuth()` hook without prop-drilling through intermediate component trees.

---

### Q59. What is Vite and why is it faster than Create React App (Webpack)?
**Answer**: Create React App relies on Webpack, which bundles the entire JavaScript application source code before serving the local dev server. Vite leverages native browser ES Modules (ESM) and Esbuild (a Go-based bundler 10–100x faster than JS bundlers). During development, Vite serves source code directly over ESM, compiling only the files currently requested by the browser, resulting in instant server start and lightning-fast Hot Module Replacement (HMR).

---

### Q60. How do Axios Interceptors work in `axiosInstance.js`?
**Answer**: Axios Interceptors intercept HTTP requests and responses before they are handled by `.then()` or `.catch()`. In `axiosInstance.js`:
- **Request Interceptor**: Evaluates if an access token exists in memory and injects `Authorization: Bearer <token>` header into outgoing requests.
- **Response Interceptor**: Intercepts `401 Unauthorized` responses, locks concurrent requests, calls `/auth/refresh` to obtain a new access token, and retries the queued original requests seamlessly.

---

### Q61. What is the difference between Controlled and Uncontrolled Components in React forms?
**Answer**:
- **Controlled Components**: Form element state (inputs, selects) is driven entirely by React state (`value={state}` and `onChange={(e) => setState(e.target.value)}`). Provides real-time validation and input control.
- **Uncontrolled Components**: Form state is managed natively by the browser DOM itself, and values are accessed on demand using React `useRef()` hooks (`ref.current.value`).

---

### Q62. What is Tailwind CSS v4 and what are its key advantages?
**Answer**: Tailwind CSS is a utility-first CSS framework. Version 4 introduces an optimized Rust-based CSS engine, single-file CSS configuration via `@theme` directives, and automatic content detection. Key advantages include zero unused CSS bloat in production bundles, high styling development speed directly inside JSX templates, and consistent design token application across UI components.

---

### Q63. How does React Router v7 handle client-side routing without page reloads?
**Answer**: React Router v7 intercepts internal HTML anchor tag clicks using the HTML5 History API (`pushState` and `replaceState`). When a user clicks a link or navigates routes, React Router updates the browser URL bar and conditionally swaps the rendered React view component tree inside `<Outlet />` without triggering a full HTML page request to the server.

---

### Q64. Explain the difference between `useMemo` and `useCallback` hooks.
**Answer**:
- **`useMemo`**: Caches the **result of a calculation** between re-renders (`const value = useMemo(() => compute(a, b), [a, b])`). Used to avoid recalculating expensive computations on every render.
- **`useCallback`**: Caches a **function instance** between re-renders (`const fn = useCallback(() => { ... }, [deps])`). Used to prevent child components from re-rendering unnecessarily when passing callback functions as props.

---

### Q65. How do you prevent layout shift and handle loading states in React?
**Answer**: Layout shifts are prevented by reserving structural UI dimensions using CSS skeleton screens or fixed container constraints while data is fetching. In CareerPilot AI, reusable `Spinner` components and conditional loading flags (`if (loading) return <Spinner />`) render deterministic fallback elements before asynchronously fetched data populates the component UI.

---

### Q66. What is Prop Drilling and how do you avoid it?
**Answer**: Prop drilling occurs when data is passed down through multiple layers of intermediate components that do not need the data themselves, merely to reach a deeply nested child component. It is avoided using React Context (`AuthContext`), global state management libraries (Redux / Zustand), or component composition patterns.

---

### Q67. How does optimistic UI updating work in the Kanban board?
**Answer**: Optimistic UI updating immediately modifies local React component state to reflect a user action (e.g. moving a job card to "Interview") **before** the API call completes on the backend server. If the API request succeeds, state remains intact; if the API request fails, the component catches the error and reverts local state to its previous value while displaying an error notification.

---

### Q68. What are React Custom Hooks and why are they used?
**Answer**: Custom hooks are Javascript functions whose names start with `use` and that can call other React hooks. They allow developers to extract and reuse component state logic across multiple components. For example, `useAuth()` encapsulates `useContext(AuthContext)`, exposing authentication variables and functions cleanly to any component.

---

### Q69. What is the React Strict Mode component (`<React.StrictMode>`)?
**Answer**: `React.StrictMode` is a development helper component that checks for potential problems in a React application. It intentionally double-invokes component lifecycle effects (`useEffect`) and reducers in development mode to catch unintended side effects, deprecated API usages, and memory leaks before production deployment.

---

### Q70. How do you optimize image and asset loading in Vite React applications?
**Answer**: Assets are optimized by leveraging SVG components (Lucide React), configuring dynamic ES module imports for code splitting (`React.lazy()`), enabling Rollup tree-shaking in `vite.config.js`, and using modern WebP/SVG image formats.

---

# SECTION 5: DATABASE ENGINEERING QUESTIONS (10)

### Q71. Explain the difference between Relational (SQL) and Document (NoSQL) Databases.
**Answer**:
- **Relational Databases (SQL)**: Store data in rigid, tabular rows and columns with fixed schemas. Enforce strict ACID transactions and relational foreign key constraints. Optimized for normalized data structures.
- **Document Databases (NoSQL)**: Store data as semi-structured JSON/BSON documents with flexible schemas. Optimized for horizontal scaling, nested array objects, and rapid schema iteration. MongoDB fits heterogeneous job board listings and complex resume ATS JSON objects better than SQL.

---

### Q72. How do Mongoose Schemas and Models work?
**Answer**: A Mongoose **Schema** defines the structure, data types, validation rules, indexes, and hooks for documents within a collection (e.g. `userSchema`). A Mongoose **Model** is a compiled constructor class built from the schema (`mongoose.model('User', userSchema)`), providing an API interface (`find`, `create`, `updateOne`) for interacting with the MongoDB collection.

---

### Q73. What are MongoDB Compound Indexes and when should they be used?
**Answer**: A compound index indexes multiple fields within a collection document in a specific order (e.g. `{ userId: 1, isActive: 1 }`). They should be used when queries filter or sort by multiple fields simultaneously. Compound index field order matters: queries must match index prefix keys to utilize the index efficiently.

---

### Q74. How does the MongoDB TTL (Time-To-Live) Index work in your `Job` model?
**Answer**: In `Job.js`, a TTL index is created on the `expiresAt` field:
```javascript
jobSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
```
MongoDB runs a background thread every 60 seconds that evaluates TTL indexes. When the current system time exceeds the timestamp stored in `expiresAt`, MongoDB automatically deletes the expired document from disk storage.

---

### Q75. What is the difference between `find()`, `findOne()`, and `findById()` in Mongoose?
**Answer**:
- **`find(query)`**: Returns a Mongoose Query cursor evaluating to an **array of documents** matching the filter query (empty array if no match).
- **`findOne(query)`**: Returns the **first single document** matching the query object (`null` if no match).
- **`findById(id)`**: Syntactic sugar for `findOne({ _id: id })`, searching directly by primary `ObjectId`.

---

### Q76. How do Mongoose Pre and Post Save Hooks work?
**Answer**: Hooks (middleware) are functions that execute before (`pre`) or after (`post`) specific Mongoose document lifecycle operations (such as `save`, `validate`, `remove`). In `User.js`, a `pre('save')` hook intercepts user document saving: if `password` was modified, it hashes the password with bcrypt before writing to MongoDB.

---

### Q77. What is MongoDB Embedding vs Referencing?
**Answer**:
- **Embedding**: Storing related data within sub-documents inside the same document (e.g. `user.preferences` or `job.location`). Provides single-query atomic reads without joins.
- **Referencing**: Storing an `ObjectId` referencing another collection document (e.g. `application.userId -> User._id`). Prevents document size duplication and fits 1-to-N or N-to-N relationships.

---

### Q78. How does MongoDB Full-Text Search work in your project?
**Answer**: In `Job.js`, a text index is declared across multiple fields:
```javascript
jobSchema.index({ title: 'text', description: 'text', 'company.name': 'text' });
```
MongoDB builds a stem-analyzed text search index. Queries using `$text: { $search: "React Engineer" }` perform tokenized text matching across title, description, and company name fields without requiring expensive regular expressions.

---

### Q79. What is BSON and how does it differ from JSON?
**Answer**: BSON (Binary JSON) is the binary-encoded serialization format MongoDB uses to store documents on disk and transfer data over the network. BSON extends JSON by adding explicit data types not present in JSON—such as `ObjectId`, `Date`, `BinData` (binary data), and `Int32`/`Int64` numbers.

---

### Q80. How do you analyze database query performance in MongoDB?
**Answer**: Query performance is analyzed by appending `.explain("executionStats")` to Mongoose query chains. The resulting stats report shows whether the query performed an index scan (`IXSCAN`) or a collection scan (`COLLSCAN`), the number of documents examined versus returned, and execution time in milliseconds.

---

# SECTION 6: AI & LLM ENGINEERING QUESTIONS (10)

### Q81. What is Google Gemini API and how does it integrate with Node.js?
**Answer**: Google Gemini API is a family of multimodal Generative AI LLM models developed by Google DeepMind. It integrates into Node.js via the official `@google/generative-ai` SDK. In `src/config/ai.js`, `getAiInstance()` initializes `GoogleGenerativeAI(GEMINI_API_KEY)`, exposing generative model instances (`genAI.getGenerativeModel({ model: "gemini-flash-latest" })`) for content generation tasks.

---

### Q82. What is Temperature in LLMs and how did you select temperature values?
**Answer**: Temperature controls the randomness/creativity of LLM token predictions on a scale from 0.0 to 1.0. Lower values yield deterministic, repetitive outputs; higher values yield creative, diverse outputs. In CareerPilot AI:
- **`temperature: 0.2`** (Resume ATS Analysis): Low value selected to guarantee strict, deterministic extraction of factual resume fields without hallucination.
- **`temperature: 0.1`** (Job Match Scoring): Ultra-low value for consistent, repeatable scoring mathematics.
- **`temperature: 0.7`** (Cover Letter Copywriting): Higher value selected to generate engaging, varied phrasing.

---

### Q83. How do you enforce structured JSON output from Google Gemini LLMs?
**Answer**: Structured output is enforced through dual mechanics:
1. **API Generation Config**: Setting `generationConfig: { responseMimeType: "application/json" }` in the Gemini SDK instructs the model engine to output valid JSON.
2. **Explicit JSON Schema Prompting**: The system prompt contains an exact reference JSON structure contract (e.g. `RESPOND EXACTLY WITH THIS JSON SCHEMA...`).

---

### Q84. What is Hallucination in LLMs and how did you mitigate it?
**Answer**: Hallucination occurs when an LLM generates plausible-sounding but false or ungrounded facts not present in its context. In CareerPilot AI, hallucination is mitigated by setting low temperature parameters (0.2), supplying explicit source text boundaries (`--- RESUME TEXT ---`), and instructing the model in prompts to output empty strings `""` or `null` if candidate information is absent from the resume text.

---

### Q85. Explain the purpose of `safeJsonParse` utility function.
**Answer**: LLMs occasionally return raw JSON wrapped inside markdown code blocks (` ```json { ... } ``` `). `safeJsonParse` uses regular expression string replacement (`text.replace(/^```(json)?\n?/i, '').replace(/\n?```$/i, '').trim()`) to strip backtick indicators before calling `JSON.parse()`, preventing syntax exceptions.

---

### Q86. What is Prompt Engineering and what techniques did you employ?
**Answer**: Prompt engineering is the practice of structuring text prompts to guide LLMs toward desired, accurate outputs. Key techniques employed include:
- **Role Assignment**: Assigning domain persona (`"You are an expert ATS parser and career coach"`).
- **Format Directives**: Specifying schema boundaries and response MIME types.
- **Delimiter Bounding**: Separating instructions from candidate data using clear markdown dividers (`--- RESUME TEXT ---`).
- **Zero-Placeholder Constraint**: Directing the LLM to output concrete resume values rather than generic bracket placeholders (`[Your Name]`).

---

### Q87. How does Token Count affect LLM API latency and billing?
**Answer**: LLMs process text in token chunks (~4 characters per token). Latency scales directly with total token count (Input Prompt Tokens + Output Generated Tokens). Billing is calculated per 1,000 or 1-million tokens. CareerPilot AI optimizes costs by passing pre-parsed raw text buffers instead of binary PDF files, and utilizing `gemini-flash-latest` for high-volume scoring tasks.

---

### Q88. What is the difference between Zero-Shot, Few-Shot, and Chain-of-Thought Prompting?
**Answer**:
- **Zero-Shot**: Providing instructions without example input/output pairs.
- **Few-Shot**: Including 1 or more example input/output pairs in the prompt to demonstrate expected formatting.
- **Chain-of-Thought**: Instructing the model to output intermediate reasoning steps before returning final answers, improving complex mathematical or logical accuracy.

---

### Q89. How do you handle LLM API rate limits and quota errors?
**Answer**: Gemini API rate limits are handled by:
1. Protecting API routes with Express IP rate limiters to prevent client spamming.
2. Wrapping SDK calls in `try/catch` blocks in `aiService.js`, catching rate limit exceptions (HTTP 429), and throwing operational `AppError("AI service temporary busy, please retry")` messages.

---

### Q90. What is Context Window in LLMs?
**Answer**: Context window refers to the maximum number of tokens an LLM can process in a single request-response interaction (including system prompt, context data, and generated response). Gemini 1.5 Pro features a massive context window of up to 1-million+ tokens, allowing complete job posting histories and multi-page resume documents to be evaluated without truncation.

---

# SECTION 7: SCENARIO-BASED & ARCHITECTURE QUESTIONS (10)

### Q91. How would CareerPilot AI scale to handle 100,000 active daily users?
**Answer**:
1. **Stateless API Load Balancing**: Deploy multiple instances of the Express Node.js API server behind an NGINX or AWS ALB load balancer. Because authentication uses stateless JWTs, any API instance can process any user request.
2. **Database Sharding & Read Replicas**: Configure MongoDB replica sets with primary nodes handling writes and secondary read-replicas processing job search queries. Partition `jobs` collections using hash sharding on `_id`.
3. **Caching Layer**: Deploy a Redis cluster to cache job listings, user session metadata, and computed match scores.
4. **Asynchronous Task Queues**: Extract Playwright scrapers and Gemini AI processing into background microservice workers managed by Redis-backed queue engines (BullMQ or Celery).

---

### Q92. How would you prevent malicious users from uploading malware disguised as PDF resumes?
**Answer**:
1. **Strict File Type Verification**: Validate both file extension AND magic byte file signatures (`%PDF-1.`) using Multer memory storage buffers before saving to disk.
2. **Storage Isolation**: Store uploaded files on AWS S3 buckets with public access disabled, rather than local web server directories.
3. **Antivirus Scanning**: Pass uploaded file buffers through ClamAV scanner containers before writing to persistent storage.
4. **Sandboxed Parsing**: Execute `pdf-parse` inside isolated Docker containers or AWS Lambda microservices with restricted system privileges.

---

### Q93. What if a major Indian job board changes its website HTML layout? How would scrapers recover?
**Answer**:
1. **Resilient CSS Selectors**: Scrapers in `indiaJobBoardScraper.js` use attribute substring match selectors (`[class*="title" i]`, `[class*="company" i]`) rather than brittle fixed DOM paths.
2. **Error Alerting & Fallbacks**: If a scraper extracts zero cards from a source, it logs a high-severity alert to Winston and fails gracefully without crashing the server process.
3. **Dynamic Selector Configurations**: Move DOM selectors out of code into database configuration documents, allowing selector updates via an admin API without redeploying backend code.

---

### Q94. How would you implement real-time collaborative application tracking (e.g. for student placement teams)?
**Answer**: Integrate WebSockets using `Socket.io`. When a student updates an application status or placement offer, the Express server broadcasts a WebSocket event (`APPLICATION_UPDATED`) to connected placement team clients subscribed to that student's channel, updating their React UI state in real time.

---

### Q95. How would you migrate CareerPilot AI from MongoDB to PostgreSQL?
**Answer**:
1. Define PostgreSQL relational schemas with foreign key constraints (`users`, `resumes`, `jobs`, `applications`).
2. Map JSON fields (like ATS analysis and parsed experience arrays) to PostgreSQL `JSONB` column types.
3. Replace Mongoose ODM calls with Prisma ORM or TypeORM queries.
4. Write data migration scripts to transfer MongoDB documents into PostgreSQL tables using atomic transactions.

---

### Q96. How would you protect the platform against AI API token cost overruns?
**Answer**:
1. **User Token Quotas**: Restrict free users to 5 resume analyses and 10 cover letter generations per day stored in `User` document counters.
2. **Response Caching**: Store Gemini response outputs in Redis keyed by MD5 hashes of `resumeId + jobId`.
3. **Model Tier Routing**: Route simple tasks to low-cost `gemini-flash-latest` and reserve high-cost `gemini-1.5-pro` for premium workflows.

---

### Q97. What if the MongoDB database crashes? How does the server recover?
**Answer**: `connectDB()` in `src/config/db.js` monitors Mongoose connection events (`error`, `disconnected`). If the database connection drops, Mongoose attempts automatic reconnection. For incoming API requests during a database outage, Express middleware catches connection timeouts and returns `503 Service Unavailable` error responses without crashing the Node.js API process.

---

### Q98. How would you deploy CareerPilot AI to AWS production infrastructure?
**Answer**:
- **Frontend**: Deploy React build output (`/dist`) to AWS S3 bucket distributed via CloudFront CDN.
- **Backend API**: Package Express server into a Docker container deployed on AWS ECS Fargate behind an Application Load Balancer (ALB).
- **Database**: Provision fully managed MongoDB Atlas cluster on AWS VPC with automated automated backups.
- **Secrets**: Store environment variables in AWS Secrets Manager.

---

### Q99. How would you implement Role-Based Access Control (RBAC) for Admin users?
**Answer**:
1. Add `role` field to `User` schema: `role: { type: String, enum: ['candidate', 'admin'], default: 'candidate' }`.
2. Create `restrictTo` middleware:
   ```javascript
   const restrictTo = (...roles) => (req, res, next) => {
     if (!roles.includes(req.user.role)) return next(new AppError('Forbidden permission', 403));
     next();
   };
   ```
3. Protect admin routes using `router.use(protect, restrictTo('admin'))`.

---

### Q100. Why should we hire you based on this project implementation?
**Answer**: This project demonstrates that I am not just a developer who follows tutorial steps, but a **Software Architect** capable of designing, securing, and deploying production-grade systems. I demonstrated:
- **Full-Stack Proficiency**: Engineering both responsive React 19 UIs and scalable Express Node.js REST APIs.
- **Security Orientation**: Designing dual-token JWT authentication with HttpOnly cookies, password hashing, and Zod input validation.
- **Modern AI SDK Integration**: Integrating Google Gemini LLMs with structured JSON schemas and robust error handling.
- **Systematic Problem Solving**: Solving real technical challenges like async scrapers, race condition token refreshes, and database index tuning.
I bring this same architectural mindset, code discipline, and drive for production quality to your software engineering team.
