# IMS Security Documentation

This document describes the security measures implemented in the Integrated Management System (IMS).

## Table of Contents

1. [Secrets Management](#secrets-management)
2. [Authentication Security](#authentication-security)
3. [Rate Limiting](#rate-limiting)
4. [Session Management](#session-management)
5. [Security Checklist](#security-checklist)

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

## Security Headers

The API Gateway uses helmet.js which sets these headers:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `X-XSS-Protection: 0` (modern browsers use CSP instead)
- `Strict-Transport-Security` (when HTTPS enabled)
- `Content-Security-Policy`

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
- [ ] Audit logging to separate store
- [ ] IP allowlisting for admin endpoints
- [ ] Secret rotation automation
- [ ] Penetration testing
