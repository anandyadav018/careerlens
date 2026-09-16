# 09. Authentication & Security Subsystem — CareerPilot AI

## 1. Authentication Architecture Overview

CareerPilot AI enforces a dual-token JWT (JSON Web Token) authentication architecture paired with HTTP-only cookie distribution. This design balances security against Cross-Site Scripting (XSS) and Cross-Site Request Forgery (CSRF) attacks with stateless API scalability.

```mermaid
sequenceDiagram
    autonumber
    actor Client as React Client (AuthContext)
    participant AuthMW as Express Auth Middleware
    participant Controller as Auth Controller
    participant Service as Auth Service
    participant JWT as TokenUtils
    participant DB as MongoDB (User Model)

    rect rgb(240, 248, 255)
        Note over Client, DB: User Login & Token Issuance
        Client->>Controller: POST /api/v1/auth/login { email, password }
        Controller->>Service: login({ email, password })
        Service->>DB: User.findOne({ email }).select('+password')
        DB-->>Service: User document with password hash
        Service->>DB: user.comparePassword(password) (bcrypt.compare)
        Service->>JWT: generateTokenPair(user)
        JWT-->>Service: { accessToken (15m), refreshToken (7d) }
        Service->>DB: user.refreshToken = refreshToken; user.save()
        Service-->>Controller: { user, accessToken, refreshToken }
        Controller-->>Client: HTTP 200 OK<br/>Set-Cookie: refreshToken (HttpOnly, SameSite)<br/>Body: { accessToken, user }
        Client->>Client: Store accessToken in React Memory (AuthContext)
    end

    rect rgb(255, 250, 240)
        Note over Client, DB: Protected Route Access
        Client->>AuthMW: GET /api/v1/resumes<br/>Header: Authorization: Bearer <accessToken>
        AuthMW->>JWT: verifyAccessToken(token)
        JWT-->>AuthMW: Decoded payload { userId, email }
        AuthMW->>DB: User.findById(userId)
        DB-->>AuthMW: User document
        AuthMW->>Controller: Set req.user = user; call next()
        Controller-->>Client: HTTP 200 OK (Protected Data)
    end
```

---

## 2. Security Mechanics & Token Strategy

### 2.1 Dual Token Breakdown

| Token Type | Storage Location | Lifetime | Signing Secret | Purpose |
|---|---|---|---|---|
| **Access Token** | In-Memory (React Context state) | 15 Minutes | `JWT_ACCESS_SECRET` | Authorizes short-lived REST API requests via `Authorization: Bearer <token>` header. |
| **Refresh Token** | HttpOnly Cookie + MongoDB User Document | 7 Days | `JWT_REFRESH_SECRET` | Used exclusively to request new access token pairs via `POST /api/v1/auth/refresh`. |

### 2.2 Why In-Memory Access Tokens?
Storing access tokens in `localStorage` or `sessionStorage` leaves them vulnerable to malicious third-party scripts (XSS attacks). CareerPilot AI keeps access tokens strictly inside Javascript variable memory in `AuthContext.jsx`. If the browser tab is reloaded, Axios silently invokes `/auth/refresh` using the persistent HttpOnly cookie to restore session state seamlessly.

### 2.3 Refresh Token Rotation & Security Rules
1. **HttpOnly & SameSite Cookie**: Set with flags `httpOnly: true`, `sameSite: 'lax'` (or `'strict'` in production), preventing client-side JavaScript access.
2. **Database Verification**: When `/auth/refresh` is called, the server verifies both token signature AND checks if the submitted token matches the stored `user.refreshToken` string in MongoDB.
3. **Token Rotation**: Every refresh request revokes the old refresh token and issues a brand-new token pair, mitigating replay attacks.

---

## 3. Implementation Code Breakdown

### 3.1 Password Hashing (`src/models/User.js`)
Passwords are auto-hashed before database save using a Mongoose pre-save hook:
```javascript
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12); // 12 rounds salt cost factor
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
```

### 3.2 Request Guard Middleware (`src/middleware/authMiddleware.js`)
Validates incoming access tokens on protected Express routes:
```javascript
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) throw new AppError('Not authenticated. Please log in.', 401);

  const decoded = verifyAccessToken(token);
  const user = await User.findById(decoded.userId).select('-password');
  if (!user) throw new AppError('User belonging to token no longer exists.', 401);

  req.user = user;
  next();
};
```

### 3.3 Client Protected Route Component (`client/src/routes/ProtectedRoute.jsx`)
Guards React SPA view transitions:
```jsx
const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};
```
