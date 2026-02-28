# Architecture — Nexara IMS

---
> **CONFIDENTIAL — TRADE SECRET**
> This document is the property of Nexara DMCC and contains confidential and
> proprietary information. Unauthorised disclosure is prohibited.
> © 2026 Nexara DMCC. All rights reserved.
---


## System Overview

```
                                    ┌──────────────────────┐
                                    │      Browser         │
                                    └──────────┬───────────┘
                                               │
                          ┌────────────────────┼────────────────────┐
                          │                    │                    │
                 ┌────────▼────────┐  ┌───────▼────────┐  ┌───────▼────────┐
                 │  web-dashboard  │  │  web-quality   │  │  web-*         │
                 │  :3000          │  │  :3003         │  │  :3001-3030    │
                 └────────┬────────┘  └───────┬────────┘  └───────┬────────┘
                          │                    │                    │
                          └────────────────────┼────────────────────┘
                                               │
                                    ┌──────────▼───────────┐
                                    │    API Gateway        │
                                    │    :4000              │
                                    │    (Auth, CORS, Proxy)│
                                    └──────────┬───────────┘
                                               │
              ┌──────────┬─────────┬───────────┼──────────┬──────────┬──────────┐
              │          │         │           │          │          │          │
         ┌────▼───┐ ┌───▼────┐ ┌──▼───┐ ┌────▼───┐ ┌───▼────┐ ┌──▼───┐     ...
         │ H&S    │ │ Env    │ │ Qual │ │ Finance│ │ CRM    │ │ ESG  │  25 more
         │ :4001  │ │ :4002  │ │ :4003│ │ :4013  │ │ :4014  │ │ :4016│  services
         └────┬───┘ └───┬────┘ └──┬───┘ └────┬───┘ └───┬────┘ └──┬───┘
              │         │         │           │         │          │
              └─────────┴─────────┴───────────┼─────────┴──────────┘
                                              │
                                   ┌──────────▼───────────┐
                                   │    PostgreSQL :5432   │
                                   │    Database: ims      │
                                   │    500+ tables        │
                                   └──────────────────────┘
                                              │
                                   ┌──────────▼───────────┐
                                   │    Redis :6379        │
                                   │    Rate limiting,     │
                                   │    caching, events    │
                                   └──────────────────────┘
```

## Monorepo Topology

```
New-BMS/
├── apps/           # Deployable applications
│   ├── api-*       # 43 Express.js API services + api-search (4050)
│   ├── web-*       # 44 Next.js 15 web applications
│   └── mobile/     # React Native (excluded from dev)
├── packages/       # 392 shared libraries
│   ├── database/   # Prisma schemas + generated clients
│   ├── auth/       # JWT verification middleware
│   ├── rbac/       # Role-based access control
│   ├── ui/         # React component library
│   ├── monitoring/ # Logging, metrics, health checks
│   └── ...         # 386 more packages
└── scripts/        # Operational scripts
```

**Philosophy:** Apps are deployable units that import from packages. Packages are shared libraries that never import from apps. This ensures a clean dependency tree.

## Turborepo Pipeline

```json
{
  "build": { "dependsOn": ["^build"] },
  "dev": { "cache": false, "persistent": true, "dependsOn": ["^build"] },
  "test": { "dependsOn": ["^build"] },
  "lint": { "dependsOn": ["^build"] }
}
```

Build order: `database` → `types` → `shared` → `auth` → `monitoring` → domain packages → apps.

## Authentication Flow

```
Client                    Gateway (:4000)              PostgreSQL
  │                            │                            │
  │  POST /api/auth/login      │                            │
  │  { email, password }       │                            │
  │───────────────────────────>│                            │
  │                            │  SELECT user by email      │
  │                            │───────────────────────────>│
  │                            │  user row                  │
  │                            │<───────────────────────────│
  │                            │                            │
  │                            │  bcrypt.compare(password)  │
  │                            │  jwt.sign({ userId,        │
  │                            │    email, role })           │
  │                            │  INSERT session             │
  │                            │───────────────────────────>│
  │                            │                            │
  │  { accessToken }           │                            │
  │<───────────────────────────│                            │
  │                            │                            │
  │  GET /api/health-safety/*  │                            │
  │  Authorization: Bearer JWT │                            │
  │───────────────────────────>│                            │
  │                            │  jwt.verify(token)         │
  │                            │  attachPermissions()       │
  │                            │  proxy to :4001            │
  │                            │  + X-Service-Token         │
```

- **User JWTs** are signed by the gateway with `JWT_SECRET` and verified by all services using the same secret
- **Service JWTs** are generated by `@ims/service-auth` for inter-service calls (1h expiry, auto-refresh every 50min)
- `JWT_SECRET` must be identical across all services

## Gateway Proxy Routing

All traffic enters through the gateway on port 4000. Routes handled locally:

- `/api/auth/*`, `/api/users/*`, `/api/dashboard/*`, `/api/notifications/*`
- `/api/organisations/*`, `/api/compliance/*`, `/api/roles/*`
- `/api/activity/*`, `/api/presence/*`, `/api/feature-flags/*`
- Plus 15+ more local route groups (comments, tasks, webhooks, etc.)

Proxied routes:

| Path                        | Target                 | Port |
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

All routes also available under `/api/v1/` prefix.

**Proxy behaviour:**

- Path rewriting strips the service prefix (`/api/health-safety/risks` → `/api/risks`)
- `onProxyReq` re-serializes `req.body` to prevent POST/PUT hanging
- `X-Service-Token` header injected for inter-service auth
- `onProxyRes` strips downstream CORS headers to prevent conflicts

## Package Dependency Hierarchy

```
Layer 0 (no deps)     database
                          │
Layer 1                 types
                          │
Layer 2                shared
                          │
Layer 3            auth    monitoring
                     │         │
Layer 4         rbac    service-auth    validation
                     │         │              │
Layer 5     [domain packages: email, webhooks, cache,
             templates, calculations, tax-engine, ...]
                          │
Layer 6     [apps: api-*, web-*]
```

## Database Schema Overview

- 27 domain-specific Prisma schemas in `packages/database/prisma/schemas/`
- Each schema generates its own client to `packages/database/generated/<domain>/`
- Each API service has a `src/prisma.ts` that re-exports from `@ims/database/<domain>`
- 500+ tables across all schemas, all in the same PostgreSQL database

## Environment Variable Hierarchy

1. Root `.env` — shared variables (JWT_SECRET, DATABASE_URL, REDIS_URL)
2. App `.env` — per-service overrides (PORT, service-specific DATABASE_URL)
3. Code defaults — fallback values in source code

## CORS Strategy

- Gateway handles CORS for all services via an explicit origin allowlist
- Raw CORS middleware runs FIRST (before Helmet)
- Downstream services use `cors({ origin: true })` to reflect
- Gateway strips downstream CORS headers via `onProxyRes`
- Never set `CORS_ORIGIN=` in `.env` (empty value breaks all CORS)

## Rate Limiting

Redis-backed (`ims-redis:6379`):

| Limiter | Window | Max Requests |
| ------- | ------ | ------------ |
| Auth    | 15 min | 5            |
| API     | 15 min | 100          |

Rate limits persist across gateway restarts (stored in Redis).

## RBAC Model

`@ims/rbac` provides role-based access control:

- 39 roles across 17 modules with 7 permission levels
- `attachPermissions()` middleware on every API route
- Permission levels: `none`, `view`, `create`, `edit`, `delete`, `approve`, `admin`
