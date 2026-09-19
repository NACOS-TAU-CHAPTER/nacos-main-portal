# Production Security Audit & Hardening Plan

## Executive Summary

**Overall Security Grade**: B+ (Good foundation, needs production hardening)

Your application has a solid security foundation with:
- ✅ JWT authentication
- ✅ Role-based access control (RBAC)
- ✅ Rate limiting on critical endpoints
- ✅ Input validation with express-validator
- ✅ XSS protection via HTML entity escaping
- ✅ CORS configuration
- ✅ Helmet security headers
- ✅ Audit logging

**Critical Gaps** (Must Fix):
1. ❌ No HTTPS enforcement
2. ❌ Missing CSRF protection
3. ❌ Weak session security
4. ❌ No SQL injection prevention verification
5. ❌ Missing security headers (CSP, HSTS)
6. ❌ No request size limits per route
7. ❌ Insufficient logging and monitoring
8. ❌ No WAF or DDoS protection

---

## Current Security Features (✅ Good)

### 1. Authentication & Authorization
**Status**: ✅ **Strong**

```javascript
// ✅ Multi-layer auth
- JWT token verification (Bearer tokens + session cookies)
- Admin/Super Admin role checks
- Banned/rejected user blocking
- Auto-seeding of admin roles
```

**Strengths**:
- Service role key used for admin operations (bypasses RLS)
- Token verification via both `auth.admin.getUser` and `auth.getUser` fallback
- Cookie and header support for flexibility

**Recommendations**:
- Add token rotation/refresh mechanism
- Implement token blacklisting for logout
- Add MFA for admin accounts (future enhancement)

### 2. Rate Limiting
**Status**: ✅ **Good** (needs tuning)

```javascript
// Current limits:
- Global: 100 req/15 min
- Auth: 5 attempts/15 min
- Registration: 3 attempts/1 hour
- Voting: 5 votes/24 hours
- Upload: 20 uploads/1 hour
- Directory: 60 req/1 min per user
```

**Recommendations**:
- ✅ Already well-configured
- Consider adding per-user rate limits for sensitive operations
- Add Redis-backed rate limiting for distributed systems (Railway multi-instance)

### 3. Input Validation
**Status**: ✅ **Strong**

```javascript
// ✅ express-validator chains for:
- Email format (@tau.edu.ng)
- Password strength (8+ chars, uppercase, lowercase, digit, special)
- Matric number formats
- Phone numbers (Nigerian format)
- Social media URLs
- Array sizes and content
```

**Strengths**:
- Comprehensive validation chains
- Custom validators for domain-specific fields
- Structured error responses

**Gap**: Not all routes use these validators (some still have inline checks)

### 4. XSS Protection
**Status**: ✅ **Good**

```javascript
// ✅ HTML entity escaping via sanitizeRequestBody
- Escapes: &, <, >, ", ', /
- Skips: URLs, passwords, tokens
- Applies to: body, query, params
```

**Recommendations**:
- Add Content Security Policy (CSP) headers
- Consider using DOMPurify for rich text fields
- Validate file upload types more strictly

### 5. CORS Configuration
**Status**: ✅ **Good**

```javascript
// Allowed origins:
- Production: nacos-tau-portal.netlify.app
- Localhost: 5000, 5500, 8080, 3000
- Custom FRONTEND_URL from env
```

**Recommendations**:
- ✅ Already properly configured
- Consider removing localhost origins in production build
- Add CORS preflight caching

---

## Critical Security Gaps (❌ Must Fix)

### 1. HTTPS Enforcement
**Status**: ❌ **CRITICAL**

**Issue**: No redirect from HTTP to HTTPS, no HSTS header

**Risk**: Man-in-the-middle attacks, token interception

**Fix**:
```javascript
// Add to server.js (after helmet)
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      return res.redirect(`https://${req.header('host')}${req.url}`);
    }
    next();
  });
}

// Update helmet config
app.use(helmet({
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net", "cdnjs.cloudflare.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
      fontSrc: ["'self'", "fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", process.env.SUPABASE_URL],
    }
  },
  crossOriginEmbedderPolicy: false
}));
```

### 2. CSRF Protection
**Status**: ❌ **HIGH PRIORITY**

**Issue**: No CSRF tokens for state-changing operations

**Risk**: Cross-site request forgery attacks

**Fix**:
```javascript
// Install: npm install csurf cookie-parser
const csrf = require('csurf');
const cookieParser = require('cookie-parser');

// Add after express.json()
app.use(cookieParser());
const csrfProtection = csrf({ 
  cookie: { 
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  } 
});

// Add to state-changing routes
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Apply to POST/PUT/DELETE routes
app.use('/api/admin', csrfProtection);
app.use('/api/voting/vote', csrfProtection);
app.use('/api/payments', csrfProtection);
```

**Frontend Changes**:
```javascript
// Fetch CSRF token on app init
const csrfToken = await fetch('/api/csrf-token').then(r => r.json());

// Include in all state-changing requests
fetch('/api/admin/events', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'CSRF-Token': csrfToken.csrfToken
  },
  body: JSON.stringify(data)
});
```

### 3. SQL Injection Prevention
**Status**: ⚠️ **NEEDS VERIFICATION**

**Issue**: Using Supabase client (should be safe, but needs audit)

**Current**: All queries use Supabase JS client (parameterized)

**Risk**: Low (Supabase client prevents SQL injection by design)

**Verification Needed**:
- Audit all raw SQL in migrations
- Check for string concatenation in queries
- Verify RLS policies don't use unsanitized input

**Example - Good**:
```javascript
// ✅ Safe (parameterized)
supabase.from('students').select('*').eq('id', userId)

// ❌ Unsafe (if we ever did this)
supabase.rpc('custom_query', { sql: `SELECT * FROM students WHERE name = '${userInput}'` })
```

**Action**: Code review of all routes for string interpolation in queries

### 4. Session Security
**Status**: ⚠️ **MEDIUM PRIORITY**

**Issue**: JWT tokens never expire from client perspective

**Fix**:
```javascript
// Add token refresh endpoint
app.post('/api/auth/refresh', async (req, res) => {
  const { refresh_token } = req.body;
  
  const { data, error } = await supabase.auth.refreshSession({
    refresh_token
  });
  
  if (error) {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
  
  res.json({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_at: data.session.expires_at
  });
});

// Add logout blacklist (requires Redis)
const blacklist = new Set(); // Use Redis in production

app.post('/api/auth/logout', authenticate, async (req, res) => {
  const token = extractToken(req);
  blacklist.add(token);
  // Set expiry in Redis: SETEX token 3600 "blacklisted"
  res.json({ success: true });
});

// Check blacklist in authenticate middleware
if (blacklist.has(token)) {
  return res.status(401).json({ error: 'Token has been revoked' });
}
```

### 5. File Upload Security
**Status**: ⚠️ **MEDIUM PRIORITY**

**Current**: Upload middleware exists, needs hardening

**Gaps**:
- No file type validation beyond MIME check
- No malware scanning
- No file size limits per route
- No quarantine for suspicious uploads

**Fix**:
```javascript
// Add to middleware/upload.js
const fileType = require('file-type');
const { fromBuffer } = fileType;

// Validate actual file type (not just extension)
async function validateFileType(buffer, allowedTypes) {
  const type = await fromBuffer(buffer);
  if (!type || !allowedTypes.includes(type.mime)) {
    throw new Error(`File type ${type?.mime} not allowed`);
  }
}

// Add per-route size limits
const uploadLimits = {
  profilePicture: 5 * 1024 * 1024, // 5MB
  pastQuestions: 50 * 1024 * 1024, // 50MB
  paymentProof: 2 * 1024 * 1024 // 2MB
};

// Scan for malicious content (basic)
function scanForMaliciousContent(buffer) {
  // Check for PHP tags
  if (buffer.toString().includes('<?php')) {
    throw new Error('Potentially malicious file detected');
  }
  // Add more checks...
}
```

### 6. Logging & Monitoring
**Status**: ⚠️ **NEEDS ENHANCEMENT**

**Current**: Morgan logging + audit middleware

**Gaps**:
- No structured logging (Winston/Pino)
- No log aggregation (CloudWatch, Datadog, Sentry)
- No security event alerts
- No anomaly detection

**Fix**:
```javascript
// Install: npm install winston pino pino-pretty @sentry/node
const winston = require('winston');
const Sentry = require('@sentry/node');

// Initialize Sentry
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1
  });
  app.use(Sentry.Handlers.requestHandler());
}

// Structured logging
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Log security events
logger.warn({
  event: 'FAILED_LOGIN',
  email: req.body.email,
  ip: req.ip,
  timestamp: new Date()
});

// Add Sentry error handler (before other error handlers)
app.use(Sentry.Handlers.errorHandler());
```

### 7. Environment & Secrets Management
**Status**: ⚠️ **NEEDS REVIEW**

**Current**: `.env` file (not committed)

**Risks**:
- Secrets in logs
- Secrets in error messages
- No secret rotation
- No encryption at rest

**Recommendations**:
```javascript
// Never log secrets
const sanitizeEnv = (env) => {
  const redacted = { ...env };
  const secretKeys = ['PASSWORD', 'SECRET', 'KEY', 'TOKEN', 'DSN'];
  Object.keys(redacted).forEach(key => {
    if (secretKeys.some(s => key.includes(s))) {
      redacted[key] = '***REDACTED***';
    }
  });
  return redacted;
};

console.log('Environment:', sanitizeEnv(process.env));

// Use Railway/Netlify secret management
// Rotate secrets quarterly
// Use different secrets per environment (dev/staging/prod)
```

---

## Production Hardening Checklist

### Phase 1: Critical Security (Week 1)
- [ ] Implement HTTPS redirect and HSTS header
- [ ] Add CSRF protection for state-changing routes
- [ ] Configure Content Security Policy (CSP)
- [ ] Add structured logging with Sentry
- [ ] Review all SQL queries for injection risks
- [ ] Implement token refresh mechanism
- [ ] Add file upload validation (file type, size, malware scan)

### Phase 2: Enhanced Security (Week 2)
- [ ] Implement Redis-backed rate limiting
- [ ] Add token blacklisting for logout
- [ ] Set up log aggregation (CloudWatch/Datadog)
- [ ] Add security monitoring and alerts
- [ ] Implement API versioning
- [ ] Add request/response schemas with JSON Schema
- [ ] Set up automated security scanning (Snyk, npm audit)

### Phase 3: Advanced Security (Week 3)
- [ ] Add WAF (Cloudflare, AWS WAF)
- [ ] Implement DDoS protection
- [ ] Add honeypot endpoints for bot detection
- [ ] Implement IP whitelisting for admin panel
- [ ] Add MFA for admin accounts
- [ ] Set up security incident response plan
- [ ] Conduct penetration testing

### Phase 4: Compliance & Auditing (Week 4)
- [ ] GDPR compliance review
- [ ] Add data retention policies
- [ ] Implement right-to-deletion endpoint
- [ ] Add privacy policy acceptance tracking
- [ ] Set up regular security audits
- [ ] Document security architecture
- [ ] Create security runbook

---

## Immediate Action Items (Today)

### 1. Update Helmet Configuration
```bash
# File: backend/server.js
# Add CSP and HSTS
```

### 2. Add HTTPS Redirect
```bash
# File: backend/server.js
# Add production HTTPS enforcement
```

### 3. Install Security Dependencies
```bash
cd backend
npm install --save csurf cookie-parser winston @sentry/node helmet-csp
```

### 4. Configure Sentry
```bash
# Add to Railway env vars:
SENTRY_DSN=your_sentry_dsn_here
LOG_LEVEL=info
```

### 5. Update CORS for Production
```bash
# Remove localhost origins in production
```

---

## Security Testing Checklist

### Manual Testing
- [ ] Try SQL injection in all input fields
- [ ] Test XSS payloads in text fields
- [ ] Attempt CSRF attacks
- [ ] Test rate limiting by flooding endpoints
- [ ] Try path traversal in file uploads
- [ ] Test authentication bypass techniques
- [ ] Verify RBAC (try accessing admin routes as student)
- [ ] Test session fixation attacks
- [ ] Try uploading malicious files
- [ ] Test for information disclosure in errors

### Automated Testing
```bash
# Run npm audit
npm audit --production

# Install and run OWASP dependency check
npm install -g snyk
snyk test

# Run security linter
npm install -g eslint-plugin-security
eslint --plugin security backend/

# Run OWASP ZAP scan
docker run -t owasp/zap2docker-stable zap-baseline.py -t https://your-api.railway.app
```

---

## Monitoring & Alerts

### Critical Events to Monitor
1. Failed login attempts (>5 in 5 minutes from same IP)
2. Admin access from new IPs
3. Rate limit violations
4. File upload rejections
5. SQL error messages
6. 500 errors spike
7. Unusual API patterns
8. CSRF token failures

### Alert Thresholds
```javascript
{
  "failed_logins": { "threshold": 5, "window": "5m" },
  "rate_limit_hits": { "threshold": 10, "window": "1m" },
  "500_errors": { "threshold": 10, "window": "5m" },
  "upload_rejections": { "threshold": 5, "window": "1m" }
}
```

---

## Security Documentation Requirements

### Must Document
1. Authentication flow diagram
2. Authorization matrix (role permissions)
3. Data flow diagrams
4. API endpoint security requirements
5. Incident response procedures
6. Secret rotation schedule
7. Backup and recovery procedures
8. Security training for developers

---

## Risk Assessment

| Risk | Likelihood | Impact | Priority | Mitigation |
|------|-----------|--------|----------|------------|
| XSS Attack | Medium | High | P1 | CSP + Escaping (Done) |
| SQL Injection | Low | Critical | P1 | Supabase client (Safe) |
| CSRF | High | High | P0 | Add CSRF tokens |
| Session Hijack | Medium | High | P1 | HTTPS + Secure cookies |
| DDoS | High | Medium | P2 | Rate limiting + WAF |
| Data Breach | Low | Critical | P1 | Encryption + Access control |
| File Upload Exploit | Medium | High | P1 | Type validation + Scan |
| Account Takeover | Low | Critical | P1 | MFA + Strong passwords |

---

## Cost Estimate

### Free/Low Cost
- ✅ Helmet, CSRF, Input validation (already in package.json)
- ✅ Sentry free tier (10k events/month)
- ✅ Railway security features (included)
- ✅ Cloudflare free tier (DDoS protection)

### Paid (Optional)
- Redis for rate limiting: $5-10/month (Upstash free tier available)
- Sentry paid: $26/month (if you exceed free tier)
- Cloudflare Pro: $20/month (advanced WAF)
- Penetration testing: $500-2000 one-time

**Total Monthly: $0-35** (can start with free tiers)

---

## Next Steps

1. **Review this document** with your team
2. **Prioritize** which phase to tackle first
3. **I can implement** any of these features - just let me know what to start with
4. **Test thoroughly** after each change
5. **Deploy gradually** (test in dev → staging → production)

**Recommendation**: Start with Phase 1 (Critical Security) this week.

Would you like me to implement any of these security enhancements now?

