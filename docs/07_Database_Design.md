# 07. Database Design — CareerPilot AI

## 1. Entity-Relationship (ER) Diagram

The database uses MongoDB with Mongoose Object Data Modeling (ODM). Relationships are modeled using Mongoose `ObjectId` references (`ref`) and embedded sub-documents.

```mermaid
erDiagram
    USER ||--o{ RESUME : "uploads / owns"
    USER ||--o{ APPLICATION : "tracks"
    USER ||--o{ ALERT : "configures"
    USER ||--o{ COVERLETTER : "generates"
    USER ||--o{ INTERVIEWPREP : "prepares"
    
    JOB ||--o{ APPLICATION : "referenced by"
    JOB ||--o{ COVERLETTER : "referenced by"
    JOB ||--o{ INTERVIEWPREP : "referenced by"
    JOB }o--o{ ALERT : "matches"
    
    RESUME ||--o{ APPLICATION : "used in"
    RESUME ||--o{ COVERLETTER : "source for"

    USER {
        ObjectId _id PK
        String firstName
        String lastName
        String email UK
        String password
        String refreshToken
        Object preferences
        Boolean isEmailVerified
        Date lastLoginAt
        Date createdAt
    }

    RESUME {
        ObjectId _id PK
        ObjectId userId FK
        String fileName
        String fileUrl
        Number fileSize
        String rawText
        Object parsedData
        Object skills
        Object aiAnalysis
        Boolean isActive
        Number version
    }

    JOB {
        ObjectId _id PK
        String externalId UK
        String source UK
        String sourceUrl
        String title
        Object company
        Object location
        String description
        Array requirements
        Array skills
        Object salary
        Date expiresAt TTL
    }

    APPLICATION {
        ObjectId _id PK
        ObjectId userId FK
        ObjectId jobId FK
        Object jobSnapshot
        ObjectId resumeId FK
        ObjectId coverLetterId FK
        String status
        String notes
        Array statusHistory
        Number matchScore
    }

    ALERT {
        ObjectId _id PK
        ObjectId userId FK
        String name
        Array keywords
        Array locations
        Array jobTypes
        String frequency
        Boolean isActive
        Array matchedJobIds FK
    }

    COVERLETTER {
        ObjectId _id PK
        ObjectId userId FK
        ObjectId resumeId FK
        ObjectId jobId FK
        String companyName
        String roleName
        String generatedContent
        String editedContent
        String aiModel
    }

    INTERVIEWPREP {
        ObjectId _id PK
        ObjectId userId FK
        ObjectId jobId FK
        String jobTitle
        String companyName
        Array questions
        Array userSkills
        String aiModel
    }
```

---

## 2. Collection Schemas & Specifications

### 2.1 `users` Collection

Stores account identity, authentication secrets, profile metadata, and target career preferences.

| Field Name | Type | Constraints | Description |
|---|---|---|---|
| `_id` | `ObjectId` | Primary Key | Auto-generated unique identifier |
| `firstName` | `String` | Required, trim, max 50 | User's first name |
| `lastName` | `String` | Required, trim, max 50 | User's last name |
| `email` | `String` | Required, Unique, Lowercase, Regex Match | Primary email login identifier |
| `password` | `String` | Required, Min 8 chars, `select: false` | bcrypt hashed password string |
| `avatar` | `String` | Default: `""` | URL/path to profile avatar image |
| `headline` | `String` | Max 120 chars | Professional tagline (e.g. "Full Stack Engineer") |
| `location` | `Object` | Embedded (`city`, `state`, `country`) | Geographical location |
| `preferences` | `Object` | Embedded sub-document | Desired roles, locations, salary range, job types, remote preference |
| `refreshToken` | `String` | `select: false` | Stored JWT refresh token string |
| `isEmailVerified` | `Boolean` | Default: `false` | Email verification flag |
| `lastLoginAt` | `Date` | Date timestamp | Last user authentication timestamp |
| `createdAt` / `updatedAt` | `Date` | Mongoose timestamps | Creation & update timestamps |

---

### 2.2 `resumes` Collection

Stores uploaded file metadata, raw text buffers extracted via `pdf-parse`, and structured ATS JSON analysis returned from Gemini.

| Field Name | Type | Constraints | Description |
|---|---|---|---|
| `_id` | `ObjectId` | Primary Key | Resume record ID |
| `userId` | `ObjectId` | FK -> `users._id`, Required, Indexed | Owner user ID |
| `fileName` | `String` | Required | Original uploaded PDF filename |
| `fileUrl` | `String` | Required | System file storage path (`uploads/resumes/...`) |
| `fileSize` | `String`/`Number` | Required | Size in bytes |
| `rawText` | `String` | Required | Raw extracted plain text content |
| `parsedData` | `Object` | Nested Schema | Structured name, email, phone, experience, education, projects |
| `skills` | `Object` | Embedded arrays | Categorized technical, soft, tools, languages arrays |
| `aiAnalysis` | `Object` | Embedded object | Scores (overallScore, atsScore), section feedback, strengths, improvements, missing keywords |
| `isActive` | `Boolean` | Default: `false` | Flag indicating primary active resume for job matching |
| `version` | `Number` | Default: `1` | Resume revision counter |

**Indexes**:
- `{ userId: 1, isActive: 1 }` (Fast lookup for active resume)
- `{ userId: 1, createdAt: -1 }` (Sorting user's uploaded versions)

---

### 2.3 `jobs` Collection

Normalized job listing repository aggregated from external job portals via Playwright scrapers.

| Field Name | Type | Constraints | Description |
|---|---|---|---|
| `_id` | `ObjectId` | Primary Key | Job record ID |
| `externalId` | `String` | Required | Base64 encoded external job URL identifier |
| `source` | `String` | Required | Source portal ('naukri', 'foundit', 'shine', 'linkedin_india', etc.) |
| `sourceUrl` | `String` | Required | Original job application link |
| `title` | `String` | Required, Trim | Job title designation |
| `company` | `Object` | Embedded (`name`, `logo`, `url`) | Company profile data |
| `location` | `Object` | Embedded (`city`, `state`, `country`, `isRemote`) | Job location details |
| `description` | `String` | Required | Full raw or sanitized job description |
| `requirements` | `[String]` | Array of strings | Requirement bullet points |
| `skills` | `[String]` | Indexed Array | Extracted skill tags for filtering |
| `salary` | `Object` | Embedded (`min`, `max`, `currency`, `period`) | Compensation metadata |
| `postedAt` | `Date` | Default: `Date.now` | Job posting timestamp |
| `scrapedAt` | `Date` | Default: `Date.now` | Scraper ingestion timestamp |
| `expiresAt` | `Date` | TTL Index (`expireAfterSeconds: 0`) | Expiration timestamp (default +7 days) |

**Indexes**:
- Compound Unique: `{ externalId: 1, source: 1 }` (Prevents duplicate scraping)
- Text Search: `{ title: 'text', description: 'text', 'company.name': 'text' }`
- TTL Index: `{ expiresAt: 1 }` (Automated data cleanup after 7 days)

---

### 2.4 `applications` Collection

Tracks user applications across Kanban status stages.

| Field Name | Type | Constraints | Description |
|---|---|---|---|
| `_id` | `ObjectId` | Primary Key | Application tracking ID |
| `userId` | `ObjectId` | FK -> `users._id`, Required, Indexed | Applicant user ID |
| `jobId` | `ObjectId` | FK -> `jobs._id`, Required | Target job ID |
| `jobSnapshot` | `Object` | Embedded | Snapshot of title, company, location, sourceUrl |
| `resumeId` | `ObjectId` | FK -> `resumes._id` | Attached resume version ID |
| `coverLetterId` | `ObjectId` | FK -> `coverletters._id` | Associated cover letter ID |
| `status` | `String` | Enum: `['saved', 'applied', 'phone_screen', 'interview', 'offer', 'rejected', 'withdrawn']` | Kanban board column state |
| `statusHistory` | `[Object]` | Array of `{ status, changedAt, note }` | Audit trail of status transitions |
| `matchScore` | `Number` | 0 - 100 | Saved job match score percentage |

**Indexes**:
- Compound Unique: `{ userId: 1, jobId: 1 }` (Prevents saving duplicate jobs)

---

### 2.5 `alerts` Collection

Saves user alert rules for automated daily email digests.

| Field Name | Type | Constraints | Description |
|---|---|---|---|
| `_id` | `ObjectId` | Primary Key | Alert rule ID |
| `userId` | `ObjectId` | FK -> `users._id`, Required, Indexed | User ID |
| `name` | `String` | Required | Alert name (e.g. "React Roles in Bangalore") |
| `keywords` | `[String]` | Array | Target query keywords |
| `frequency` | `String` | Enum: `['instant', 'daily', 'weekly']` | Dispatch frequency |
| `isActive` | `Boolean` | Default: `true` | Active toggle flag |

**Indexes**:
- `{ isActive: 1, frequency: 1 }` (Used by background node-cron worker)
