# Security

## Authentication

- JWT-based authentication (HS256 algorithm)
- Access token: 15-minute expiry
- Refresh token: 7-day expiry
- Password policy: NIST SP 800-63B compliant
  - Minimum 12 characters
  - Must contain: uppercase, lowercase, digit, special character
  - Maximum 72 characters (bcrypt limit)
  - Passwords hashed using bcrypt with salt rounds of 10
  - Passwords are never logged or exposed in API responses
- Login endpoint: `POST /api/auth/login`
- Token stored client-side in `localStorage`
- Sent as `Authorization: Bearer <token>` header
- Authentication flow:
  1. User submits credentials to `/api/auth/login`
  2. Server validates credentials against the database
  3. On success, a JWT access token is created and returned
  4. Subsequent requests include the token in the `Authorization: Bearer <token>` header
  5. Server validates JWT signature, expiry, and session existence

## Authorization (RBAC)

- Role-based access control: `USER`, `MANAGER`, `ADMIN`
- Middleware stack per route:
  - `authenticate` -- validates JWT
  - `requireRole('MANAGER', 'ADMIN')` -- role gate
  - `checkOwnership(model)` -- ensures users can only access their own records
  - `scopeToUser` -- automatically filters queries to the user's records
- Coverage: 107 out of 117 route files use RBAC middleware (91% coverage)
- All 13 API services have RBAC applied
- Account lockout: after 5 failed login attempts, the account is locked for 30 minutes (HTTP 423 Locked)

## Service-to-Service Authentication

- Inter-service communication uses short-lived JWT tokens signed with `SERVICE_SECRET`
- `optionalServiceAuth` middleware on downstream services validates inbound service tokens
- Gateway forwards auth context to proxied services
- Service tokens include: `serviceId`, `serviceName`, `permissions[]`, `iat`, `exp` (5-minute default expiry)
- Package: `@ims/service-auth`

```typescript
import { generateServiceToken, requireServiceAuth, addServiceTokenToProxy } from '@ims/service-auth';

// Generate token for outbound requests
const token = generateServiceToken('api-hr', ['hr:read', 'hr:write']);

// Middleware to validate incoming service requests
app.use('/internal', requireServiceAuth(['hr:read']));

// Add token to proxy requests automatically
createProxyMiddleware({
  target: 'http://api-hr:4006',
  onProxyReq: addServiceTokenToProxy('api-gateway'),
});
```

## Secrets Management

- HashiCorp Vault integration via `@ims/secrets` package
- All API keys stored as environment variables, not in code
- `.env.example` contains `CHANGE_ME` placeholders
- 0 hardcoded secrets in codebase
- Secret generation: `./scripts/generate-secrets.sh` produces cryptographically secure values for `JWT_SECRET`, `JWT_REFRESH_SECRET`, `POSTGRES_PASSWORD`, `REDIS_PASSWORD`, and `SESSION_SECRET`
- Secret verification: `./scripts/verify-secrets.sh --production` validates all secrets before deployment
- Startup validation: in production, invalid secrets cause immediate exit (exit code 1); in development, warnings are logged and the service continues
- Vault configuration (optional):

```bash
USE_VAULT=true
VAULT_ADDR=http://vault.internal:8200
VAULT_TOKEN=s.abcdefghijklmnop
VAULT_NAMESPACE=admin
VAULT_SECRET_PATH=secret/data/ims
VAULT_TIMEOUT=5000
```

- Secrets are cached in-memory for 5 minutes to reduce Vault API calls

## Data Protection

- Soft-delete: all record deletions set a `deletedAt` timestamp
- All `findMany`/`findFirst` queries filter `WHERE deletedAt IS NULL`
- GDPR compliance module:
  - Data export: `GET /api/v1/gdpr/export`
  - Data erasure: `POST /api/v1/gdpr/erasure`
  - Retention policies: `GET /api/v1/gdpr/retention` and `POST /api/v1/gdpr/retention`
  - Right to be forgotten
- Data ownership scoping via `scopeToUser` middleware

## API Security

- Rate limiting: 100 requests per 15 minutes (Redis-backed, falls back to in-memory)
  - `/api/auth/login`: 5 requests per 15 minutes (per IP + email)
  - `/api/auth/register`: 3 requests per 1 hour (per IP)
  - `/api/auth/forgot-password`: 3 requests per 15 minutes (per IP + email)
  - Rate-limited responses include `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`, and `Retry-After` headers
- CORS: whitelist-based origin validation (hardcoded allowed-origins array in the gateway; `CORS_ORIGIN` must NOT be set in `.env`)
- Helmet.js security headers:
  - `Strict-Transport-Security`: `max-age=31536000; includeSubDomains; preload` (production)
  - `Content-Security-Policy`: strict policy with `default-src 'self'` (production)
  - `X-Content-Type-Options`: `nosniff`
  - `X-Frame-Options`: `DENY`
  - `X-XSS-Protection`: `1; mode=block`
  - `X-DNS-Prefetch-Control`: `off`
  - `Referrer-Policy`: `strict-origin-when-cross-origin`
  - `Cross-Origin-Opener-Policy`: `same-origin`
  - `Cross-Origin-Resource-Policy`: `cross-origin`
  - `X-Permitted-Cross-Domain-Policies`: `none`
  - `Permissions-Policy`: restricts camera, microphone, geolocation, payment, USB, accelerometer
  - Cache control: `no-store, no-cache, must-revalidate, proxy-revalidate` on all API responses
- Input validation via Zod schemas on all endpoints
- SQL injection prevention via Prisma ORM parameterized queries
- XSS prevention via input sanitization middleware (`@ims/validation` package)
  - Detects and blocks: `<script>` tags, `javascript:` URLs, event handlers, `data:` URLs, expression functions
  - SQL injection pattern detection: `UNION SELECT`, `OR 1=1`, comment attacks, `DROP TABLE`, string escapes

## ISO 27001 Controls

- Annex A mapping available via `GET /api/v1/security/iso27001/annex-a`
- Security controls API: `GET /api/v1/security/controls`
- RBAC matrix: `GET /api/v1/security/rbac/matrix`

## Audit Trail

- `@ims/audit` package logs all create/update/delete operations
- Correlation ID tracking via `@ims/monitoring`
- Winston structured logging across all services
- Automatic redaction of sensitive fields: `password`, `passwordHash`, `token`, `accessToken`, `refreshToken`, `secret`, `apiKey`, `privateKey`, `ssn`, `creditCard`, `pin`, `otp`
- Audit log retention: 365 days by default with automatic cleanup
- Query capabilities: entity history, user activity, and custom queries with pagination

## Resilience

- Circuit breaker pattern (`@ims/resilience`): opens at 50% error threshold, resets after 30 seconds
- Retry with exponential backoff: configurable max retries, base delay, and backoff factor
- Bulkhead pattern: limits concurrent operations to prevent cascade failures

## Vulnerability Reporting

- Report security vulnerabilities to: **security@resolvex.io**
- Do not create public GitHub issues for security vulnerabilities
- We aim to respond within 48 hours

## Incident Response

1. **Immediate**: revoke all sessions (`DELETE FROM sessions;`)
2. **Reset secrets**: `./scripts/generate-secrets.sh --force`
3. **Restart services** to pick up new secrets
4. **Review audit logs** for suspicious activity
5. **Notify users** if their data may have been compromised

## Security Score

- Current: **91/100**
- RBAC coverage: 91% (107/117 route files)
- Soft-delete enforcement: active on all models
- Secrets management: all externalized
- Input validation: 100% (Zod on all endpoints)
