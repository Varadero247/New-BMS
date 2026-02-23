# ADR-002: Centralised API Gateway with http-proxy-middleware

**Date**: 2026-02-01
**Status**: Accepted

## Context

With 41 downstream API services, the frontend applications need a single entry point for:
- Authentication and authorisation
- CORS handling
- Rate limiting
- Request routing
- Audit logging

Options considered:
1. **Each frontend talks directly to each service** — 41 different ports, no centralised auth
2. **Nginx reverse proxy** — good for routing but no application-level logic
3. **Custom Express gateway** (`apps/api-gateway`) — full control over auth middleware, proxying, and business logic
4. **API Gateway service (Kong, AWS API Gateway)** — external dependency, operational overhead

## Decision

Build a **custom Express.js gateway** at port 4000 using `http-proxy-middleware`.

- All frontend requests go to `http://localhost:4000/api/*`
- The gateway runs `authenticate` middleware on all protected routes
- `proxyRoute()` helper creates proxy entries: `/api/<domain>/*` → `http://api-<domain>:<port>/api/*`
- `pathRewrite` strips the domain prefix before forwarding (e.g., `/api/health-safety/incidents` → `/api/incidents`)
- CORS is handled exclusively at the gateway; downstream services use `cors({ origin: true, credentials: true })`

## Consequences

**Positive:**
- Single auth check point — downstream services trust the gateway (no JWT verification in each service)
- Frontends need only one base URL (`NEXT_PUBLIC_API_URL=http://localhost:4000`)
- Rate limiting (Redis-backed) and audit logging are centralised
- CORS is configured once, not in 41 places

**Negative:**
- Gateway is a single point of failure — mitigated by K8s HPA (min 2 replicas)
- All traffic flows through one process — gateway must be performant
- `express.json()` before proxy middleware requires `onProxyReq` to re-serialise `req.body` for POST/PUT/PATCH requests (known gotcha — see CLAUDE.md)
- `featureFlagsRouter` mounted at `/api` intercepts all routes; must use per-route `authenticate` not `router.use(authenticate)` globally

**Key implementation detail:**
Raw `cors()` middleware must be registered **before** Helmet in `apps/api-gateway/src/index.ts`. Helmet's `crossOriginResourcePolicy` must be set to `'cross-origin'`. The gateway strips downstream CORS headers via `onProxyRes` to prevent duplicate header conflicts.
