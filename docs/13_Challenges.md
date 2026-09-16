# 13. Technical Challenges & Solutions — CareerPilot AI

This document details 5 critical engineering challenges encountered during the development of CareerPilot AI, extracted directly from code implementations.

---

## Challenge 1: Handling Dynamic Client-Rendered DOMs in Job Web Scraping

### Problem
When collecting job listings from Indian job portals (Naukri, Foundit, Shine, LinkedIn India), standard HTML parsers (`axios` + `cheerio`) returned empty arrays because job cards are dynamically rendered using client-side React/Angular applications.

### Why It Happened
Static HTTP GET requests fetch initial HTML skeletons prior to JavaScript execution. Critical elements (`.srp-jobtuple-wrapper`, `.card-apply-content`, `.jobCard`) do not exist in the raw response body.

### Solution (Implemented in `indiaJobBoardScraper.js`)
Migrated to **Playwright headless browser automation** (`BaseScraper`). The scraper launches a Chromium instance, navigates to target search URLs, awaits `domcontentloaded`, enforces a 1500ms DOM hydration pause, and executes in-browser DOM evaluation functions (`page.evaluate`):

```javascript
await this.page.goto(this.baseUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
await this.page.waitForTimeout(1500);
const jobs = await this.page.evaluate(({ cardSelector }) => {
  const cards = Array.from(document.querySelectorAll(cardSelector));
  return cards.map((card, index) => {
    // Extract title, company, location, and absolute URL
  });
}, { cardSelector: this.board.cards });
```

### Key Learning
Dynamic web scraping requires full browser engine rendering. Standardizing selectors across heterogeneous sites requires fallback CSS queries (`card.querySelector('h1, h2, h3, [class*="title" i]')`).

---

## Challenge 2: Gemini LLM Markdown Code Fence Wrappers breaking JSON.parse()

### Problem
Google Gemini API occasionally returned JSON responses wrapped in markdown code fences (` ```json { ... } ``` `), causing standard `JSON.parse()` calls in `aiService.js` to throw syntax errors (`Unexpected token '` in JSON at position 0`).

### Why It Happened
Generative LLMs are trained to format structured output inside markdown blocks for display. Even when prompting for raw JSON, LLMs may prepend code block indicators.

### Solution (Implemented in `aiService.js`)
Developed a custom `safeJsonParse` utility function combined with Gemini SDK's strict JSON schema mode (`responseMimeType: 'application/json'`):

```javascript
const safeJsonParse = (text) => {
  try {
    const cleanText = text.replace(/^```(json)?\n?/i, '').replace(/\n?```$/i, '').trim();
    return JSON.parse(cleanText);
  } catch (err) {
    throw new Error('Failed to parse AI response as JSON: ' + err.message);
  }
};
```

### Key Learning
Never assume raw string responses from LLMs are clean JSON. Always implement sanitizer wrappers and enforce low model temperature parameters (`temperature: 0.2`).

---

## Challenge 3: Race Conditions & Deadlocks during Silent Token Refresh

### Problem
When an access token expired (15-minute lifespan), multiple concurrent React component requests (e.g. fetching user profile, resumes, and job listings simultaneously) returned `401 Unauthorized`. Each component independently attempted to call `/auth/refresh`, resulting in token invalidation race conditions.

### Why It Happened
With refresh token rotation enabled, the first refresh request invalidates the old refresh token stored in MongoDB. Subsequent concurrent refresh requests using the old token were rejected as invalid.

### Solution (Implemented in `axiosInstance.js`)
Implemented a **Subscriber Queue & Refresh Lock Pattern** in the Axios response interceptor:

```javascript
let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (cb) => refreshSubscribers.push(cb);
const onRefreshed = (token) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(axiosInstance(originalRequest));
          });
        });
      }
      originalRequest._retry = true;
      isRefreshing = true;
      try {
        const { data } = await axiosInstance.post('/auth/refresh');
        const newAccessToken = data.data.accessToken;
        setAccessToken(newAccessToken);
        isRefreshing = false;
        onRefreshed(newAccessToken);
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        window.dispatchEvent(new Event('auth:logout'));
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
```

### Key Learning
Token refresh logic in single-page applications must be synchronized globally across API calls to prevent invalidation cascades.

---

## Challenge 4: Memory Leak & Process Exhaustion from Scraping on Server Reloads

### Problem
During local development, updating backend code triggered `nodemon` hot reloads. If a scraper task executed upon server startup, launching multiple Playwright browser instances overwhelmed system memory, causing Node.js process crashes (`JavaScript heap out of memory`).

### Why It Happened
`nodemon` restarts the Express server process without waiting for child browser instances spawned by Playwright to shut down gracefully.

### Solution (Implemented in `scheduler.js` & `server.js`)
Disabled immediate startup scrapers in development mode, isolated scrapers to explicit `cron` intervals (`'0 */6 * * *'`), and added process signal termination hooks (`SIGTERM`/`SIGINT`) in `server.js` to force close browser and database instances before exit.

### Key Learning
Background browser automation tasks must be explicitly decoupled from the primary web application request-response lifecycle.

---

## Challenge 5: PDF Resume Text Extraction & Garbage Characters

### Problem
Parsing multi-column or heavily formatted PDF resumes using `pdf-parse` occasionally produced garbled character streams or missing whitespace, degrading Gemini ATS keyword recognition.

### Why It Happened
PDF files store text as visual absolute positioning elements rather than continuous semantic text flows.

### Solution (Implemented in `resumeService.js` & `aiService.js`)
Implemented text pre-cleaning before dispatching prompts to Gemini, and instructed Gemini to infer structure and formatting quality (`sections.formatting.feedback`) from text flow rather than relying on strict visual coordinates.

### Key Learning
Combining basic string normalization with LLM contextual reasoning provides higher extraction accuracy than rigid regex patterns when dealing with unstructured PDF documents.
