# IMS Platform — Comprehensive Project Status Report

**Date:** 2026-02-13
**Branch:** `main`

---

## 1. Executive Summary

The Integrated Management System (IMS) is a fully-built enterprise SaaS platform covering 12+ ISO standards across 15+ business domains. All 12 build phases (0-11) are complete. The platform consists of **25 API services**, **26 web applications**, and **39 shared packages**, totalling **1,302,706 lines of TypeScript** across **1,834 source files**.

---

## 2. Architecture Overview

### 2.1 Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 18, Tailwind CSS |
| Backend | Express.js, Node.js |
| Database | PostgreSQL 16, 25 Prisma schemas, 411 models |
| Cache | Redis 7 |
| Auth | JWT (Bearer token), RBAC (39 roles, 17 modules) |
| Infra | Docker Compose, pnpm monorepo |
| Testing | Jest, supertest, bash/curl integration scripts |

### 2.2 Codebase Size

| Metric | Count |
|--------|-------|
| Total TypeScript lines | **1,302,706** |
| API service code (non-test) | 84,025 lines |
| Web application code | 124,522 lines |
| Shared package code (non-test) | 932,854 lines |
| Test code | 142,914 lines |
| Source files (.ts/.tsx) | 1,834 |

---

## 3. Backend Services (25 APIs)

### 3.1 Service Inventory

| # | Service | Port | Domain / ISO Standard | Route Files | Schema Models |
|---|---------|------|-----------------------|-------------|---------------|
| 1 | api-gateway | 4000 | Auth, routing, roles, MSP, compliance | 17 | 19 (core) |
| 2 | api-health-safety | 4001 | ISO 45001:2018 | 9 | 18 |
| 3 | api-environment | 4002 | ISO 14001:2015 | 12 | 24 |
| 4 | api-quality | 4003 | ISO 9001:2015 | 26 | 35 |
| 5 | api-ai-analysis | 4004 | Multi-provider AI | 4 | 11 |
| 6 | api-inventory | 4005 | Stock management | 6 | 12 |
| 7 | api-hr | 4006 | Human Resources | 8 | 27 |
| 8 | api-payroll | 4007 | Payroll & tax | 8 | 14 |
| 9 | api-workflows | 4008 | Process automation | 7 | 17 |
| 10 | api-project-management | 4009 | PMBOK / ISO 21502 | 13 | 16 |
| 11 | api-automotive | 4010 | IATF 16949 | 7 | 18 |
| 12 | api-medical | 4011 | ISO 13485 | 8 | 27 |
| 13 | api-aerospace | 4012 | AS9100D | 5 | 11 |
| 14 | api-finance | 4013 | Financial management | 7 | 23 |
| 15 | api-crm | 4014 | Customer relationship | 8 | 17 |
| 16 | api-infosec | 4015 | ISO 27001 | 7 | 14 |
| 17 | api-esg | 4016 | ESG reporting | 14 | 15 |
| 18 | api-cmms | 4017 | Maintenance management | 12 | 16 |
| 19 | api-portal | 4018 | Customer/supplier portals | 16 | 12 |
| 20 | api-food-safety | 4019 | HACCP / ISO 22000 | 14 | 14 |
| 21 | api-energy | 4020 | ISO 50001 | 12 | 12 |
| 22 | api-analytics | 4021 | Business intelligence | 9 | 10 |
| 23 | api-field-service | 4022 | Field operations | 13 | 14 |
| 24 | api-iso42001 | 4023 | AI Management System | 9 | 9 |
| 25 | api-iso37001 | 4024 | Anti-Bribery | 6 | 6 |

**Total: 257 route files, 411 database models across 25 Prisma schemas**

### 3.2 Gateway Architecture

- All routes available under both `/api/` and `/api/v1/` prefixes
- 12 local route groups handled directly by gateway (auth, users, dashboard, sessions, reports, notifications, organisations/MSP, compliance/regulatory, roles, access-log, CSRF, templates)
- 24 proxy targets routing to downstream services
- RBAC middleware (`attachPermissions()`) on all 24 downstream services
- Body re-serialization in `onProxyReq` for POST/PUT/PATCH through proxy

---

## 4. Frontend Applications (26 Web Apps)

### 4.1 Application Inventory

| # | Application | Port | Pages | Client Pages | Domain |
|---|-------------|------|-------|-------------|--------|
| 1 | web-dashboard | 3000 | 8 | 6 | Main dashboard |
| 2 | web-health-safety | 3001 | 13 | 9 | ISO 45001 |
| 3 | web-environment | 3002 | 14 | 11 | ISO 14001 |
| 4 | web-quality | 3003 | 32 | 24 | ISO 9001 |
| 5 | web-settings | 3004 | 13 | 1 | Admin & RBAC |
| 6 | web-inventory | 3005 | 11 | 3 | Stock management |
| 7 | web-hr | 3006 | 15 | 4 | Human Resources |
| 8 | web-payroll | 3007 | 12 | 3 | Payroll |
| 9 | web-workflows | 3008 | 10 | 3 | Process automation |
| 10 | web-project-management | 3009 | 16 | 3 | PMBOK |
| 11 | web-automotive | 3010 | 14 | 12 | IATF 16949 |
| 12 | web-medical | 3011 | 16 | 14 | ISO 13485 |
| 13 | web-aerospace | 3012 | 15 | 13 | AS9100D |
| 14 | web-finance | 3013 | 16 | 1 | Financial management |
| 15 | web-crm | 3014 | 14 | 1 | CRM |
| 16 | web-infosec | 3015 | 16 | 5 | ISO 27001 |
| 17 | web-esg | 3016 | 17 | 2 | ESG reporting |
| 18 | web-cmms | 3017 | 16 | 2 | Maintenance |
| 19 | web-customer-portal | 3018 | 8 | 1 | External customers |
| 20 | web-supplier-portal | 3019 | 8 | 1 | External suppliers |
| 21 | web-food-safety | 3020 | 17 | 1 | HACCP |
| 22 | web-energy | 3021 | 15 | 1 | ISO 50001 |
| 23 | web-analytics | 3022 | 12 | 1 | Business intelligence |
| 24 | web-field-service | 3023 | 16 | 1 | Field operations |
| 25 | web-iso42001 | 3024 | 14 | 0 | AI Management |
| 26 | web-iso37001 | 3025 | 10 | 0 | Anti-Bribery |

**Totals: 354 page.tsx files, 122 client.tsx files across 26 web apps**

### 4.2 UI Component Library (`@ims/ui`)

- **76 React components** (Card, Modal, Badge, Gauge, Button, Input, Select, Table, Tabs, Sidebar, PageHeader, Spinner, ExportDropdown, Toast, Breadcrumbs, ProgressBar, Stepper, GlobalSearch, DataTable, NotificationCentre, Avatar, Tooltip, Skeleton, Alert, DropdownMenu, StatCard, Timeline, SignatureCapture, PhotoCapture, GhsPictogram, CommandPalette, HumanReviewGate, OfflineInspectionForm, etc.)
- **76 Storybook stories** with full component coverage, autodocs, dark/light theme toggle
- Built with CVA + clsx + tailwind-merge
- Storybook v8.6 with Tailwind CSS v3 integration and Nexara theme presets

---

## 5. Shared Packages (39)

| Category | Packages |
|----------|----------|
| **Core Infrastructure** | `@ims/auth`, `@ims/database`, `@ims/monitoring`, `@ims/cache`, `@ims/resilience`, `@ims/secrets`, `@ims/service-auth`, `@ims/event-bus` |
| **Business Logic** | `@ims/rbac`, `@ims/calculations`, `@ims/finance-calculations`, `@ims/tax-engine`, `@ims/emission-factors`, `@ims/oee-engine`, `@ims/spc-engine`, `@ims/iso-checklists`, `@ims/standards-convergence` |
| **Frontend** | `@ims/ui`, `@ims/charts`, `@ims/pwa`, `@ims/a11y`, `@ims/i18n` |
| **Platform Features** | `@ims/templates` (67 templates), `@ims/notifications`, `@ims/nlq`, `@ims/regulatory-feed`, `@ims/portal-auth`, `@ims/esig`, `@ims/pdf-generator`, `@ims/file-upload`, `@ims/email`, `@ims/audit` |
| **DevOps & Quality** | `@ims/testing`, `@ims/performance`, `@ims/benchmarks`, `@ims/validation`, `@ims/types`, `@ims/shared`, `@ims/sdk` |

---

## 6. Database Architecture

- **Engine:** PostgreSQL 16 (Docker)
- **ORM:** Prisma with 25 domain-specific schemas
- **Total models:** 411
- **Migration strategy:** `prisma migrate diff` piped to `psql` (avoids cross-schema drops)
- **Binary targets:** `["native", "linux-musl-openssl-3.0.x"]` for container compatibility

| Schema | Models | Domain |
|--------|--------|--------|
| core | 19 | Users, sessions, audit, API keys, templates |
| health-safety | 18 | ISO 45001 |
| environment | 24 | ISO 14001 |
| quality | 35 | ISO 9001 |
| hr | 27 | Human Resources |
| medical | 27 | ISO 13485 |
| finance | 23 | Financial management |
| automotive | 18 | IATF 16949 |
| workflows | 17 | Process automation |
| crm | 17 | CRM |
| cmms | 16 | Maintenance |
| project-management | 16 | PMBOK |
| esg | 15 | ESG |
| infosec | 14 | ISO 27001 |
| food-safety | 14 | HACCP |
| field-service | 14 | Field operations |
| payroll | 14 | Payroll & tax |
| inventory | 12 | Stock management |
| portal | 12 | Portals |
| energy | 12 | ISO 50001 |
| ai | 11 | Analysis & insights |
| aerospace | 11 | AS9100D |
| analytics | 10 | Business intelligence |
| iso42001 | 9 | AI Management |
| iso37001 | 6 | Anti-Bribery |

---

## 7. Test Coverage

### 7.1 Unit Tests

| Service | Tests (approx) |
|---------|----------------|
| api-quality | ~789 |
| api-medical | ~584 |
| api-automotive | ~502 |
| api-gateway | ~454 |
| api-environment | ~442 |
| api-aerospace | ~338 |
| api-finance | ~321 |
| api-hr | ~305 |
| api-health-safety | ~266 |
| api-food-safety | ~241 |
| api-workflows | ~231 |
| api-project-management | ~230 |
| api-cmms | ~226 |
| api-esg | ~207 |
| api-energy | ~196 |
| api-field-service | ~189 |
| api-portal | ~168 |
| api-payroll | ~163 |
| api-crm | ~160 |
| api-inventory | ~160 |
| api-analytics | ~142 |
| api-infosec | ~140 |
| api-ai-analysis | ~75 |
| api-iso42001 | ~70 |
| api-iso37001 | ~60 |
| Shared packages | ~948 |
| **Total** | **~5,450+** |

### 7.2 Integration Tests

- **9 bash/curl scripts** covering H&S, Environment, Quality, HR, Payroll, Inventory, Workflows, PM, Finance
- **~465+ assertions** total

### 7.3 Test Infrastructure

- 142,914 lines of test code across 342 test files
- Mock pattern: `jest.mock('../src/prisma')`, `jest.mock('@ims/auth')`, `jest.mock('@ims/monitoring')`
- All 24 API services have RBAC middleware coverage

---

## 8. Infrastructure & DevOps

### 8.1 Docker Compose

- **36 service definitions** (postgres, redis, 25 APIs, 9 web apps)
- All remaining web apps run via `pnpm dev` with startup scripts

### 8.2 Scripts (20)

| Script | Purpose |
|--------|---------|
| `startup.sh` | Full startup (kill ports, Docker up, seed DB, recreate tables) |
| `start-all-services.sh` | Start all 52 services with staggered delays |
| `stop-all-services.sh` | Stop all services (ports 4000-4024 + 3000-3025) |
| `check-services.sh` | Health check all 52 services |
| `test-all-modules.sh` | Master integration test runner (9 modules) |
| `generate-secrets.sh` | Generate service secrets |
| `daily-report.sh` | Generate daily status report |
| + 13 more | DB creation, migration, Vault init, per-module tests |

### 8.3 Security

- JWT Bearer token authentication
- RBAC with 39 roles, 17 modules, 7 permission levels
- CORS with explicit origin allowlist on gateway
- Helmet security headers
- CSRF protection (toggleable)
- Service-to-service JWT auth (`@ims/service-auth`)
- Electronic signatures (`@ims/esig`)
- HashiCorp Vault integration (`@ims/secrets`)

---

## 9. ISO Standards Coverage

| Standard | Module | Status |
|----------|--------|--------|
| ISO 9001:2015 | Quality Management | Complete |
| ISO 14001:2015 | Environmental Management | Complete |
| ISO 45001:2018 | Occupational H&S | Complete |
| ISO 13485:2016 | Medical Devices QMS | Complete |
| ISO 27001:2022 | Information Security | Complete |
| ISO 22000:2018 | Food Safety (HACCP) | Complete |
| ISO 50001:2018 | Energy Management | Complete |
| ISO 42001:2023 | AI Management System | Complete |
| ISO 37001:2016 | Anti-Bribery | Complete |
| IATF 16949:2016 | Automotive Quality | Complete |
| AS9100D | Aerospace Quality | Complete |
| ISO 21502 | Project Management | Complete |

---

## 10. Build Phase Completion

| Phase | Focus | Key Deliverables | Status |
|-------|-------|-----------------|--------|
| 0 | Platform Hardening | RBAC retrofit, WebSocket notifications, workflow builder, PWA, performance baseline | Done |
| 1 | RBAC | @ims/rbac (39 roles, 17 modules, 7 levels) | Done |
| 2 | Finance | api-finance (7 routes, 321 tests), web-finance | Done |
| 3 | CRM + InfoSec | api-crm (8 routes), api-infosec (7 routes) | Done |
| 4 | ESG | api-esg (14 routes, 207 tests), web-esg | Done |
| 5 | CMMS | api-cmms (12 routes, 226 tests), web-cmms | Done |
| 6 | Portals | api-portal (16 routes, 168 tests), customer + supplier portals | Done |
| 7a | Food Safety | api-food-safety (14 routes, 241 tests), web-food-safety | Done |
| 7b | Energy | api-energy (12 routes, 196 tests), web-energy | Done |
| 8 | Analytics | api-analytics (9 routes, 142 tests), web-analytics | Done |
| 9 | Payroll Localisation | Jurisdictions, tax calculator (140 tests) | Done |
| 10 | Field Service | api-field-service (13 routes, 189 tests), web-field-service | Done |
| 11 | Differentiators | Evidence packs, headstart tool, MSP mode, regulatory feed, ISO 42001, ISO 37001 | Done |

---

## 11. Summary Statistics

| Metric | Value |
|--------|-------|
| Total TypeScript lines | **1,302,706** |
| Source files (.ts/.tsx) | **1,834** |
| API services | **25** |
| Web applications | **26** |
| Shared packages | **39** |
| API route files | **257** |
| Database models | **411** |
| Prisma schemas | **25** |
| Frontend pages (page.tsx) | **354** |
| Rich client pages (client.tsx) | **122** |
| Unit test files | **342** |
| Unit tests | **~5,450+** |
| Test code lines | **142,914** |
| UI components | **40** |
| Storybook stories | **38** |
| Document templates | **67** |
| RBAC roles | **39** |
| ISO standards covered | **12** |
| Docker Compose services | **36** |
| Build phases completed | **12/12** |

---

## 12. Known Issues & Configuration Notes

1. **Port conflicts on restart** — kill host PostgreSQL/Redis before Docker up
2. **Multi-schema Prisma** — use `migrate diff` + `psql`, never `db push`
3. **Docker API version** — must set `DOCKER_API_VERSION=1.41`
4. **Prisma in containers** — requires `linux-musl-openssl-3.0.x` binary target
5. **CORS** — do not set `CORS_ORIGIN=` in `.env` (breaks allowlist)
6. **CSRF** — set `CSRF_ENABLED=false` for development
7. **Gateway proxy** — `onProxyReq` must re-serialize `req.body`
8. **Modal component** — uses `isOpen` prop, not `open`
9. **Express route ordering** — named routes must come before `/:id`
