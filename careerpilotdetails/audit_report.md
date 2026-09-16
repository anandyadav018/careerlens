# CareerPilot AI — Final Senior Engineering Audit

## Audit Scope
Full project comparison against [implementation_plan.md](file:///Users/anandyadav/Desktop/projects/careerlens/implementation_plan.md), plus runtime verification from server logs.

---

## 🔴 Critical Issues (Blocking / Crashing)

### 1. `gemini-1.5-flash` model may not support `responseMimeType: 'application/json'`
**File:** [aiService.js](file:///Users/anandyadav/Desktop/projects/careerlens/server/src/services/aiService.js)
**Problem:** The `@google/generative-ai` SDK version installed may not fully support `responseMimeType` with flash models. Need to add a JSON-extraction fallback to handle cases where Gemini returns markdown-wrapped JSON.
**Fix:** Add a `safeJsonParse` helper that strips markdown fences before parsing.

### 2. Duplicate Mongoose index warning on User model
**File:** [User.js](file:///Users/anandyadav/Desktop/projects/careerlens/server/src/models/User.js#L96)
**Problem:** `email` has `unique: true` in the schema definition (line 24) AND `userSchema.index({ email: 1 })` (line 96). This produces a noisy warning on every server start.
**Fix:** Remove the manual `userSchema.index()` call since `unique: true` already creates the index.

### 3. `applicationService.getApplicationStats` uses raw `userId` string instead of ObjectId
**File:** [applicationService.js](file:///Users/anandyadav/Desktop/projects/careerlens/server/src/services/applicationService.js#L100)
**Problem:** The `$match` in the aggregate pipeline receives `userId` as a string, but MongoDB `$match` requires an ObjectId for matching `_id` references. This means the stats aggregation always returns zero results.
**Fix:** Cast `userId` to `mongoose.Types.ObjectId`.

---

## 🟡 Missing Features (Plan Compliance)

### 4. Missing `GET /applications/stats` route
**File:** [applicationRoutes.js](file:///Users/anandyadav/Desktop/projects/careerlens/server/src/routes/applicationRoutes.js)
**Problem:** Plan §6.5 specifies `GET /applications/stats`. The service method exists but there is no route or controller function wired up.
**Fix:** Add `getApplicationStats` to the controller and wire the route.

### 5. Missing `applicationValidator.js` and `alertValidator.js`
**Files:** `server/src/validators/`
**Problem:** Plan §3 specifies `applicationValidator.js` and `alertValidator.js`. Neither exists. Routes accept unvalidated input.
**Fix:** Create Zod validators for both resources.

### 6. Missing `shared/` directory (skillTaxonomy, jobCategories, applicationStatuses)
**Problem:** Plan §3 specifies a `shared/` directory with `skillTaxonomy.js`, `jobCategories.js`, and `applicationStatuses.js`. This directory exists but is likely empty or minimal.
**Fix:** Create the shared constants files.

### 7. `sort` param crashes in `jobService.searchJobs` when undefined
**File:** [jobService.js](file:///Users/anandyadav/Desktop/projects/careerlens/server/src/services/jobService.js#L83)
**Problem:** `sort.startsWith('-')` is called without checking if `sort` is defined, which throws `TypeError: Cannot read properties of undefined`.
**Fix:** Default `sort` to `'-postedAt'` if not provided.

---

## 🟢 Polish & Quality Issues

### 8. `preferences.salaryRange.currency` defaults to `'USD'` instead of `'INR'`
**File:** [User.js](file:///Users/anandyadav/Desktop/projects/careerlens/server/src/models/User.js#L55)
**Fix:** Change default to `'INR'` to match the frontend Rupee formatting.

### 9. Missing `Profile` link in Navbar
**File:** [Navbar.jsx](file:///Users/anandyadav/Desktop/projects/careerlens/client/src/components/layout/Navbar.jsx)
**Problem:** Profile page exists and is routed, but there's no navigation link in the navbar.
**Fix:** Add a Profile link (user avatar/name click → `/profile`).

### 10. No `Recommendations` page exists (plan §3 lists `Recommendations.jsx`)
**File:** Plan §3 folder structure
**Problem:** The plan lists a `Recommendations.jsx` page. Currently recommendations are embedded in the Dashboard, which is acceptable. No action needed unless user wants a dedicated page.
**Status:** ✅ Acceptable (recommendations shown in Dashboard)

### 11. Frontend `alertApi.js` `toggleAlert` sends PATCH but controller may not handle it
**File:** [alertRoutes.js](file:///Users/anandyadav/Desktop/projects/careerlens/server/src/routes/alertRoutes.js)
**Problem:** Need to verify the toggle route is properly wired.
**Fix:** Verify and fix the route.

---

## 📋 Execution Plan

I will now fix issues **1–9** and **11** in order of severity. Issue 10 is acceptable as-is.

| # | Fix | Files Changed |
|---|-----|---------------|
| 1 | Add `safeJsonParse` to aiService | `aiService.js` |
| 2 | Remove duplicate email index | `User.js` |
| 3 | Cast userId to ObjectId in stats aggregation | `applicationService.js` |
| 4 | Add `GET /stats` route for applications | `applicationController.js`, `applicationRoutes.js` |
| 5 | Create missing validators | `applicationValidator.js`, `alertValidator.js` |
| 6 | Create shared constants | `shared/constants/` |
| 7 | Default sort param in jobService | `jobService.js` |
| 8 | Change salary currency default to INR | `User.js` |
| 9 | Add Profile link to Navbar | `Navbar.jsx` |
| 11 | Verify alert toggle route | `alertRoutes.js`, `alertController.js` |
