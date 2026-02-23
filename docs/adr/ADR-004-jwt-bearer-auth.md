# ADR-004: JWT Bearer Token Auth Stored in localStorage

**Date**: 2026-02-05
**Status**: Accepted

## Context

The platform needs authentication for 44 web applications and the API gateway. Options:

1. **Session cookies (httpOnly)** — XSS-resistant, but requires CSRF protection and same-origin constraints
2. **JWT in httpOnly cookie** — more secure than localStorage, but complex CORS with `credentials: true`
3. **JWT Bearer in localStorage** — simpler CORS, explicit header attachment, vulnerable to XSS
4. **OAuth 2.0 / OIDC** — external IdP dependency, more complex setup

## Decision

Use **JWT Bearer tokens stored in `localStorage`**, sent as `Authorization: Bearer <token>` on every request.

- Login: `POST /api/auth/login` → `{ data: { accessToken, refreshToken } }`
- `accessToken` stored as `localStorage.getItem('token')`
- All API clients attach the token via axios interceptor:
  ```typescript
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
  ```
- Refresh: `POST /api/auth/refresh` — rate limited to 20 req/15 min
- Gateway verifies the JWT on every proxied request; downstream services trust the gateway

## Consequences

**Positive:**
- Simple CORS — no `withCredentials: true`, no cookie constraints across 44 origins
- Works in all browsers without special CORS preflight for cookies
- Each web app independently attaches the token; no shared session infrastructure required
- Stateless — any gateway replica can verify the token (no session store needed for auth itself)

**Negative:**
- localStorage is accessible to JavaScript — XSS attack can steal the token. **Mitigation**: RASP middleware (SQL/XSS/command injection detection) on the gateway
- No automatic expiry on browser close (unlike session cookies). **Mitigation**: short `accessToken` TTL (15 min) + refresh token rotation
- Logout must explicitly clear `localStorage.removeItem('token')` on every tab

**Do NOT add:**
- `withCredentials: true` on axios (breaks CORS with wildcard `*` allowed origins)
- CSRF token fetching (the Bearer token is the CSRF protection — it cannot be sent by a third-party site's form)
- `localStorage.setItem('nexara-theme', ...)` conflicts with `localStorage.setItem('token', ...)` — they use different keys, but theme storage uses `'nexara-theme'` key to avoid collisions (see CLAUDE.md)
