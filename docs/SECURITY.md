# IMS Security Documentation

This document describes the security measures implemented in the Integrated Management System (IMS).

## Table of Contents

1. [Secrets Management](#secrets-management)
2. [Authentication Security](#authentication-security)
3. [Rate Limiting](#rate-limiting)
4. [Session Management](#session-management)
5. [Input Validation & Sanitization](#input-validation--sanitization)
6. [CSRF Protection](#csrf-protection)
7. [File Upload Security](#file-upload-security)
8. [Audit Logging](#audit-logging)
9. [Security Headers](#security-headers)
10. [Security Checklist](#security-checklist)

---

## Secrets Management

### Overview

All sensitive configuration values (secrets) are managed through environment variables. No secrets are hardcoded in the codebase.

### Secret Generation

Use the provided script to generate secure secrets:

```bash
./scripts/generate-secrets.sh
```

This generates cryptographically secure values for:
- `JWT_SECRET` - 64+ character secret for signing access tokens
- `JWT_REFRESH_SECRET` - 64+ character secret for signing refresh tokens
- `POSTGRES_PASSWORD` - Secure database password
- `REDIS_PASSWORD` - Secure Redis password
- `SESSION_SECRET` - Session signing secret

### Secret Verification

Verify your secrets are properly configured:

```bash
# Development check (warnings only)
./scripts/verify-secrets.sh

# Production check (strict - will exit 1 on failure)
./scripts/verify-secrets.sh --production
```

### Secret Requirements

| Secret | Minimum Length | Additional Requirements |
|--------|---------------|------------------------|
| JWT_SECRET | 64 chars | No placeholder values |
| JWT_REFRESH_SECRET | 64 chars | Optional but recommended |
| POSTGRES_PASSWORD | 16 chars | Mixed case, numbers |
| REDIS_PASSWORD | 16 chars | Any characters |

### Startup Validation

The API Gateway validates secrets on startup:
- In **development**: Warnings are logged, service continues
- In **production**: Invalid secrets cause immediate exit (exit code 1)

### Files

- `.env` - Local secrets (NEVER commit)
- `.env.example` - Template with placeholder values (safe to commit)
- `packages/secrets/` - Secret validation utilities

---

## Authentication Security

### JWT Tokens

- **Algorithm**: HS256
- **Access Token Expiry**: 7 days (configurable via `JWT_EXPIRES_IN`)
- **Refresh Token Expiry**: 30 days (configurable via `JWT_REFRESH_EXPIRES_IN`)

### Password Security

- Hashed using bcrypt with salt rounds of 10
- Minimum password length: 8 characters
- Passwords are never logged or exposed in responses

### Authentication Flow

1. User submits credentials to `/api/auth/login`
2. Server validates credentials against database
3. On success:
   - Creates JWT token
   - Creates session record in database
   - Returns token to client
4. Subsequent requests include `Authorization: Bearer <token>` header
5. Server validates both JWT signature AND session existence in database

---

## Rate Limiting

### Endpoints

| Endpoint | Limit | Window | Notes |
|----------|-------|--------|-------|
| `/api/auth/login` | 5 requests | 15 minutes | Per IP + email |
| `/api/auth/register` | 3 requests | 1 hour | Per IP |
| `/api/auth/forgot-password` | 3 requests | 15 minutes | Per IP + email |
| `/api/*` (general) | 100 requests | 15 minutes | Per IP |

### Account Lockout

After 5 failed login attempts:
- Account is locked for 30 minutes
- HTTP 423 (Locked) response returned
- Lockout counter resets on successful login

### Response Headers

Rate-limited responses include:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests in window
- `X-RateLimit-Reset`: Time when limit resets
- `Retry-After`: Seconds until retry is allowed (when limited)

### Storage

Rate limiting uses Redis when available, falling back to in-memory storage:
- **Redis**: Distributed, persists across restarts
- **In-memory**: Single-instance only, clears on restart

---

## Session Management

### Session Model

```prisma
model Session {
  id             String   @id
  userId         String
  token          String   @unique
  expiresAt      DateTime
  lastActivityAt DateTime
  userAgent      String?
  ipAddress      String?
  createdAt      DateTime
}
```

### Session Validation

Every authenticated request:
1. Validates JWT signature and expiry
2. Checks session exists in database
3. Verifies session hasn't expired
4. Confirms user is still active
5. Updates `lastActivityAt` timestamp

### Session Revocation

Users can manage their sessions via API:

```bash
# List all sessions
GET /api/sessions

# Revoke specific session (logout from device)
DELETE /api/sessions/:id

# Revoke all other sessions (logout everywhere else)
DELETE /api/sessions
```

### Session Cleanup

Expired sessions are automatically cleaned up:
- Cleanup job runs every hour
- Removes sessions where `expiresAt < now()`

---

## Security Checklist

### Before Deployment

- [ ] Run `./scripts/generate-secrets.sh` to create secure secrets
- [ ] Run `./scripts/verify-secrets.sh --production` to validate
- [ ] Verify `.env` is in `.gitignore`
- [ ] Ensure `NODE_ENV=production` in production
- [ ] Configure Redis for distributed rate limiting
- [ ] Review CORS origins (`CORS_ORIGIN` env var)
- [ ] Enable HTTPS (via reverse proxy)

### Code Review

- [ ] No secrets in code (grep for patterns like `password=`)
- [ ] No secrets in logs (audit log statements)
- [ ] No secrets in error messages
- [ ] Input validation on all endpoints
- [ ] SQL injection protection (using Prisma ORM)
- [ ] XSS protection (helmet.js enabled)

### Testing

```bash
# Run all security-related tests
pnpm test

# Test rate limiting
for i in {1..6}; do
  curl -X POST http://localhost:4000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
done
# 6th request should return 429 (rate limited)

# Test session validation
# 1. Login and get token
# 2. Delete session from database
# 3. Use token - should get 401 SESSION_EXPIRED
```

---

## Input Validation & Sanitization

### Overview

All user input is validated and sanitized before processing to prevent XSS, SQL injection, and other injection attacks.

### Sanitization Package (`@ims/validation`)

```typescript
import { sanitizeString, sanitizeHtml, sanitizeEmail, containsXss, containsSqlInjection } from '@ims/validation';

// Basic string sanitization (removes HTML, null bytes)
const clean = sanitizeString(userInput, { maxLength: 255 });

// HTML sanitization with allowed tags
const safeHtml = sanitizeHtml(richText, { allowedTags: ['b', 'i', 'p'] });

// Email normalization
const email = sanitizeEmail('USER@Example.COM'); // 'user@example.com'

// Threat detection
if (containsXss(input)) { /* reject request */ }
if (containsSqlInjection(input)) { /* reject request */ }
```

### Middleware

```typescript
import { sanitizeMiddleware, validateMiddleware } from '@ims/validation';

// Auto-sanitize all request bodies
app.use(sanitizeMiddleware());

// Validate with Zod schema + sanitization
app.post('/api/users', validateMiddleware(createUserSchema), handler);
```

### XSS Detection Patterns

The following patterns are detected and blocked:
- `<script>` tags
- `javascript:` URLs
- Event handlers (`onclick`, `onerror`, etc.)
- `data:` URLs in dangerous contexts
- Expression functions (`expression()`, `url()`)

### SQL Injection Detection

Common SQL injection patterns are detected:
- `UNION SELECT`
- `OR 1=1`, `AND 1=1`
- Comment attacks (`--`, `/**/`)
- `DROP TABLE`, `DELETE FROM`
- String escapes (`'`, `"`)

---

## CSRF Protection

### Overview

Cross-Site Request Forgery (CSRF) protection uses the double-submit cookie pattern.

### Configuration

Enable CSRF protection by setting:

```bash
CSRF_ENABLED=true
```

### How It Works

1. Client requests a CSRF token: `GET /api/csrf-token`
2. Server sets `_csrf` cookie and returns token in response
3. Client includes token in `X-CSRF-Token` header for state-changing requests
4. Server validates cookie token matches header token

### Implementation

```typescript
// Get CSRF token (client-side)
const response = await fetch('/api/csrf-token', { credentials: 'include' });
const { csrfToken } = await response.json();

// Include in subsequent requests
await fetch('/api/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken,
  },
  credentials: 'include',
  body: JSON.stringify(data),
});
```

### Excluded Methods

Safe methods are excluded from CSRF validation:
- GET
- HEAD
- OPTIONS

---

## File Upload Security

### Overview

File uploads are validated for type, size, and content to prevent malicious file uploads.

### Package (`@ims/file-upload`)

```typescript
import { createUploader, uploadSingle, validateFileContent } from '@ims/file-upload';

// Create configured uploader
const uploader = createUploader({
  destination: './uploads',
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf'],
});

// Single file upload middleware
app.post('/api/documents', uploadSingle('file'), handler);
```

### Validation Layers

1. **MIME Type Validation**: Only allowed MIME types accepted
2. **Extension Validation**: File extension must match MIME type
3. **Magic Byte Analysis**: File content checked for executable signatures
4. **Size Limits**: Configurable maximum file size

### Dangerous File Detection

The following signatures are blocked:
- Windows executables (MZ header: `0x4D5A`)
- Linux executables (ELF header: `0x7F454C46`)
- Shell scripts (`#!/`, `#!`)

### Secure Filename Generation

Uploaded files are renamed to prevent path traversal:
- Original: `../../../etc/passwd`
- Secure: `a3b2c1d4e5f6.png`

---

## Audit Logging

### Overview

All security-relevant actions are logged with automatic sensitive field redaction.

### Package (`@ims/audit`)

```typescript
import { createAuditService, AuditAction, AuditEntity } from '@ims/audit';

const auditService = createAuditService(prisma);

// Log CRUD operations
await auditService.logCreate('User', userId, userData, { userId: adminId });
await auditService.logUpdate('User', userId, oldData, newData, { userId: adminId });
await auditService.logDelete('User', userId, userData, { userId: adminId });

// Log authentication events
await auditService.logAuth('LOGIN', userId, { ipAddress, success: true });
await auditService.logAuth('LOGIN_FAILED', undefined, { ipAddress, reason: 'Invalid password' });
```

### Automatic Redaction

The following fields are automatically redacted in audit logs:
- `password`, `passwordHash`
- `token`, `accessToken`, `refreshToken`
- `secret`, `apiKey`, `privateKey`
- `ssn`, `creditCard`
- `pin`, `otp`

### Query Audit Logs

```typescript
// Get entity history
const history = await auditService.getEntityHistory('User', userId);

// Get user activity
const activity = await auditService.getUserActivity(userId, {
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-12-31'),
});

// Custom queries
const logs = await auditService.query({
  entity: 'User',
  action: 'UPDATE',
  page: 1,
  limit: 50,
});
```

### Retention

Audit logs are retained for 365 days by default. Cleanup runs automatically:

```typescript
const deletedCount = await auditService.cleanup();
```

---

## Security Headers

### Overview

The API Gateway uses Helmet.js with strict security headers plus additional custom headers.

### Helmet Configuration

| Header | Value | Purpose |
|--------|-------|---------|
| `X-Content-Type-Options` | `nosniff` | Prevent MIME type sniffing |
| `X-Frame-Options` | `DENY` | Prevent clickjacking |
| `X-XSS-Protection` | `1; mode=block` | Legacy XSS protection |
| `X-DNS-Prefetch-Control` | `off` | Prevent DNS prefetch leakage |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Control referrer information |
| `Cross-Origin-Opener-Policy` | `same-origin` | Isolate browsing context |
| `Cross-Origin-Resource-Policy` | `same-origin` | Block cross-origin resource loads |
| `X-Permitted-Cross-Domain-Policies` | `none` | Block Adobe cross-domain policies |

### HSTS (Production Only)

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

Forces HTTPS for 1 year, including all subdomains.

### Content Security Policy (Production Only)

```
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline';
img-src 'self' data: blob:;
font-src 'self' https://fonts.gstatic.com;
frame-ancestors 'none';
form-action 'self';
base-uri 'self';
object-src 'none';
upgrade-insecure-requests;
block-all-mixed-content;
```

### Permissions Policy

Restricts browser features to prevent unauthorized access:

```
accelerometer=(), camera=(), geolocation=(), microphone=(),
payment=(), usb=(), fullscreen=(self)
```

### Cache Control for API Responses

API responses include headers to prevent caching of sensitive data:

```
Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate
Pragma: no-cache
Expires: 0
Surrogate-Control: no-store
```

---

## Incident Response

If you suspect a security breach:

1. **Immediate**: Revoke all sessions
   ```sql
   DELETE FROM sessions;
   ```

2. **Reset secrets**:
   ```bash
   ./scripts/generate-secrets.sh --force
   ```

3. **Restart services** to pick up new secrets

4. **Audit logs** for suspicious activity

5. **Notify users** if their data may have been compromised

---

## Future Improvements

- [ ] Multi-factor authentication (MFA)
- [ ] API key authentication for service-to-service
- [ ] IP allowlisting for admin endpoints
- [ ] Secret rotation automation
- [ ] Penetration testing
- [ ] Web Application Firewall (WAF)
- [ ] Security Information and Event Management (SIEM) integration
