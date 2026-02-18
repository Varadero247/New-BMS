# API Reference — Nexara IMS

## Overview

All API traffic flows through the gateway at **port 4000**. Base URL: `http://localhost:4000/api` (also available as `/api/v1`).

---

## Authentication

### Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@ims.local",
  "password": "admin123"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "uuid",
      "email": "admin@ims.local",
      "role": "ADMIN",
      "firstName": "Admin",
      "lastName": "User"
    }
  }
}
```

### Using the Token

All authenticated requests require the header:

```
Authorization: Bearer <token>
```

### Auth Endpoints

| Method | Path                | Description                |
| ------ | ------------------- | -------------------------- |
| POST   | `/api/auth/login`   | Authenticate and get token |
| POST   | `/api/auth/logout`  | Invalidate session         |
| POST   | `/api/auth/refresh` | Refresh token              |
| GET    | `/api/auth/me`      | Get current user profile   |

---

## Response Envelope

All responses follow this format:

```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid credentials"
  }
}
```

---

## Error Codes

| Code               | HTTP Status | Description                   |
| ------------------ | ----------- | ----------------------------- |
| `UNAUTHORIZED`     | 401         | Missing or invalid token      |
| `FORBIDDEN`        | 403         | Insufficient RBAC permissions |
| `NOT_FOUND`        | 404         | Resource not found            |
| `VALIDATION_ERROR` | 400         | Request validation failed     |
| `INTERNAL_ERROR`   | 500         | Server error                  |
| `RATE_LIMITED`     | 429         | Too many requests             |
| `TOKEN_INVALID`    | 401         | JWT verification failed       |
| `TOKEN_EXPIRED`    | 401         | JWT expired                   |

---

## Service Proxy Routes

| Gateway Path                | Service                | Port |
| --------------------------- | ---------------------- | ---- |
| `/api/health-safety/*`      | api-health-safety      | 4001 |
| `/api/environment/*`        | api-environment        | 4002 |
| `/api/quality/*`            | api-quality            | 4003 |
| `/api/ai/*`                 | api-ai-analysis        | 4004 |
| `/api/inventory/*`          | api-inventory          | 4005 |
| `/api/hr/*`                 | api-hr                 | 4006 |
| `/api/payroll/*`            | api-payroll            | 4007 |
| `/api/workflows/*`          | api-workflows          | 4008 |
| `/api/project-management/*` | api-project-management | 4009 |
| `/api/automotive/*`         | api-automotive         | 4010 |
| `/api/medical/*`            | api-medical            | 4011 |
| `/api/aerospace/*`          | api-aerospace          | 4012 |
| `/api/finance/*`            | api-finance            | 4013 |
| `/api/crm/*`                | api-crm                | 4014 |
| `/api/infosec/*`            | api-infosec            | 4015 |
| `/api/esg/*`                | api-esg                | 4016 |
| `/api/cmms/*`               | api-cmms               | 4017 |
| `/api/portal/*`             | api-portal             | 4018 |
| `/api/food-safety/*`        | api-food-safety        | 4019 |
| `/api/energy/*`             | api-energy             | 4020 |
| `/api/analytics/*`          | api-analytics          | 4021 |
| `/api/field-service/*`      | api-field-service      | 4022 |
| `/api/iso42001/*`           | api-iso42001           | 4023 |
| `/api/iso37001/*`           | api-iso37001           | 4024 |
| `/api/marketing/*`          | api-marketing          | 4025 |
| `/api/partners/*`           | api-partners           | 4026 |

### Gateway-Local Routes

These are handled directly by the gateway (not proxied):

`/api/auth/*`, `/api/users/*`, `/api/dashboard/*`, `/api/notifications/*`, `/api/organisations/*`, `/api/compliance/*`, `/api/roles/*`, `/api/activity/*`, `/api/presence/*`, `/api/feature-flags/*`, `/api/comments/*`, `/api/tasks/*`, `/api/api-keys/*`, `/api/certifications/*`, `/api/saml/*`, `/api/scim/*`, `/api/changelog/*`, `/api/nps/*`, `/api/automation-rules/*`, `/api/webhooks/*`, `/api/status/*`, `/api/import/*`, `/api/openapi/*`, `/api/scheduled-reports/*`, `/api/dsar/*`, `/api/dpa/*`

---

## Rate Limiting

Redis-backed rate limiting:

| Limiter | Window | Limit        | Applies To               |
| ------- | ------ | ------------ | ------------------------ |
| Auth    | 15 min | 5 requests   | Login/register endpoints |
| API     | 15 min | 100 requests | All other API endpoints  |

Rate limit headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

---

## Inter-Service Authentication

Services authenticate to each other using `@ims/service-auth`:

- Gateway generates a service JWT at startup (refreshed every 50 min)
- Added as `X-Service-Token` header on proxied requests
- Downstream services verify this to distinguish service-to-service calls

---

## Health Check

```bash
GET /health
# No authentication required

curl http://localhost:4000/health
# { "status": "ok", "service": "api-gateway", "uptime": 12345 }
```

---

## CORS

- Gateway maintains an explicit origin allowlist (localhost:3000-3030)
- Configurable via `ALLOWED_ORIGINS` env var (comma-separated)
- Credentials supported (cookies, Authorization header)
- Never set `CORS_ORIGIN=` in `.env` — it overrides the allowlist

---

## Request Tracing

The gateway adds an `X-Correlation-ID` header to all requests via `@ims/monitoring`. This ID is propagated to downstream services for log correlation.
