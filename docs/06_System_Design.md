# 06. System Design — CareerPilot AI

## 1. Architectural Patterns Applied

CareerPilot AI incorporates established software engineering design patterns to ensure clean separation of concerns, maintainability, and high scalability:

### 1.1 Controller-Service-Model (CSM) Layering
The backend separates HTTP request parsing, core business logic, and database persistence into distinct architectural layers:
- **Controller Layer (`src/controllers/`)**: Purely handles HTTP protocol mechanics (extracting `req.body`, `req.params`, `req.query`), calling services, and writing standardized JSON HTTP responses (`res.status(200).json(...)`). Controllers contain no business logic or database queries.
- **Service Layer (`src/services/`)**: Contains all core business logic (e.g. calculation of match scores, orchestration of LLM requests, formatting data arrays). Services are reusable and decoupled from Express `req`/`res` objects.
- **Model Layer (`src/models/`)**: Defines Mongoose schemas, document methods (`comparePassword`), hooks (`pre('save')`), and MongoDB index configurations.

### 1.2 Interceptor Pattern (Frontend Axios Queue)
The client API layer employs the **Axios Interceptor Pattern** in `axiosInstance.js`:
- **Request Interceptor**: Automatically injects the short-lived JWT Bearer token from memory into the `Authorization` header of outgoing HTTP requests.
- **Response Interceptor & Refresh Subscriber Queue**: When a `401 Unauthorized` status is received, the interceptor pauses concurrent failed requests, initiates a token refresh via `/auth/refresh` using httpOnly cookies, and upon receiving a new access token, drains the subscriber queue by retrying all paused requests seamlessly.

### 1.3 Singleton Pattern
- **AI Instance (`src/config/ai.js`)**: Encapsulates initialization of `GoogleGenerativeAI` to reuse a single SDK instance across service calls.
- **Winston Logger (`src/config/logger.js`)**: Exports a unified application logger instance for consistent structured log formatting across environments.

### 1.4 Middleware Chain of Responsibility
Express processes requests through an ordered chain of middleware:
1. `helmet()` (Security headers)
2. `cors()` (Cross-Origin Resource Sharing)
3. `express.json()` (Body parsing)
4. `cookieParser()` (Cookie extraction)
5. `morgan()` (HTTP logging)
6. `generalLimiter` (Rate limiting)
7. `authMiddleware.protect` (JWT validation)
8. `validate(schema)` (Zod request validation)
9. `errorHandler` (Centralized operational error catcher)

---

## 2. Component Architecture & State Management

### 2.1 State Architecture
The frontend balances global state and component-local state to avoid over-engineering:
- **Global Auth State (`AuthContext.jsx`)**: Holds `user` object and `accessToken` in memory. Provides authentication state globally without persisting sensitive tokens in `localStorage` or `sessionStorage` (preventing XSS access).
- **Page-Local State**: Search filters, active tabs, form inputs, and modal toggles are maintained locally using React `useState` and `useReducer` hooks.
- **Optimistic Updates**: Application status shifts on the Kanban board UI (`Applications.jsx`) trigger immediate UI state reflection, falling back if the background API request fails.

### 2.2 Component Hierarchy & Reusability
- **Atomic Common Components**: Reusable UI elements (`Button`, `Input`, `Spinner`, `SkillTag`, `ScoreCard`) receive properties via props and maintain consistent styling through Tailwind CSS classes.
- **Structural Layout Components**: `Navbar` handles navigation links and user session badges; `PageWrapper` standardizes layout constraints and page paddings.

---

## 3. Error Handling Architecture

Systemic error handling is implemented end-to-end to prevent unhandled exceptions and maintain clear API responses:

### 3.1 Custom Operational Error Class (`AppError.js`)
Extends Node's native `Error` object to capture HTTP status codes and operational flags:
```javascript
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // Distinguishes operational errors from programming bugs
    Error.captureStackTrace(this, this.constructor);
  }
}
```

### 3.2 Centralized Error Middleware (`errorHandler.js`)
Catches all errors passed to `next(err)` and returns formatted JSON responses:
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid email or password",
    "details": []
  }
}
```
Special handling is included for Mongoose validation errors (`ValidationError`), duplicate key errors (`11000`), and JWT errors (`JsonWebTokenError`, `TokenExpiredError`).

---

## 4. Scalability & Resilience Considerations

1. **Stateless API Design**: The Express server retains no session state in process memory. JWT tokens and database persistence enable horizontal scaling behind a load balancer (e.g. NGINX or AWS ALB).
2. **Database Indexing**: Compound indexes on Mongoose schemas (`{ userId: 1, isActive: 1 }`, `{ externalId: 1, source: 1 }`) ensure search query performance remains sub-millisecond even as table collections expand.
3. **Graceful Shutdown Hooks**: `server.js` listens to `SIGTERM` and `SIGINT` signals, closing the HTTP server and draining active MongoDB connections safely before process exit.
