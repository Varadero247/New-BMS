# NEXARA IMS PLATFORM — STANDARD OPERATING PROCEDURES (SOP)

---
> **CONFIDENTIAL — TRADE SECRET**
> This document is the property of Nexara DMCC and contains confidential and
> proprietary information. Unauthorised disclosure is prohibited.
> © 2026 Nexara DMCC. All rights reserved.
---

## Complete Technical & Operational Reference Manual

**Document Version:** 2.0
**Last Updated:** February 27, 2026 (Phase 124 — 391 packages, ~1,202,000 tests)
**Classification:** Internal Use Only
**Repository:** `/home/dyl/New-BMS`

---

## TABLE OF CONTENTS

1. [Platform Overview](#1-platform-overview)
2. [System Architecture](#2-system-architecture)
3. [API Service Inventory (43 Services + api-search)](#3-api-service-inventory)
4. [Web Application Inventory (44 Apps)](#4-web-application-inventory)
5. [Shared Package Reference (391 Packages)](#5-shared-package-reference)
6. [Database Schema Reference](#6-database-schema-reference)
7. [Module-Specific SOPs](#7-module-specific-sops)
8. [API Reference](#8-api-reference)
9. [Deployment Procedures](#9-deployment-procedures)
10. [Monitoring & Operations](#10-monitoring--operations)
11. [Security Procedures](#11-security-procedures)
12. [Troubleshooting Guide](#12-troubleshooting-guide)
13. [Development Guidelines](#13-development-guidelines)
14. [Testing Procedures](#14-testing-procedures)

---

## 1. PLATFORM OVERVIEW

### 1.1 What is Nexara IMS?

Nexara is an **Integrated Management System (IMS)** built for regulated industries. It unifies quality, environmental, health & safety, food safety, aerospace, automotive, medical, financial compliance, HR, and 20+ other management domains into a single multi-tenant SaaS platform.

### 1.2 Key Statistics (February 27, 2026 — Phase 124)

| Metric | Count |
|--------|-------|
| API Microservices | 43 + api-search (4050) |
| Web Applications (Next.js) | 44 |
| Shared NPM Packages | 391 |
| Prisma Database Schemas | 44 |
| Database Models | ~590 |
| Database Enums | 781+ |
| REST API Endpoints | 2,558+ |
| Unit Test Files | ~1,084 suites |
| Unit Test Cases | ~1,202,000 |
| Node.js Requirement | ≥ 20.0.0 |
| Package Manager | pnpm ≥ 9.0.0 |
| Code Evaluation Score | 100/100 |

### 1.3 Technology Stack

**Backend:**
- Runtime: Node.js 20+
- Language: TypeScript (strict mode, 0 `as any` in production)
- Framework: Express.js
- ORM: Prisma 5.22.0
- Database: PostgreSQL 16 (Docker)
- Cache / Rate Limiting: Redis 7 (Docker)
- Architecture: Microservices with API Gateway pattern

**Frontend:**
- Framework: Next.js 15
- UI Library: React 18+
- Component Library: `@ims/ui` (155 components)
- Styling: Tailwind CSS
- Language: TypeScript
- State: React Context + custom hooks
- PWA: `@ims/pwa` (service worker, offline sync)

**Infrastructure:**
- Containerization: Docker / Docker Compose
- Orchestration: Kubernetes (production, `/k8s/`)
- CI/CD: GitHub Actions (4 workflows: ci.yml, cd.yml, security.yml, tests.yml)
- Monitoring: Prometheus + Winston + OpenTelemetry
- Error Tracking: Sentry (placeholder DSN, fill before go-live)
- Backups: Daily PostgreSQL backups via `prodrigestivill/postgres-backup-local`

### 1.4 Standards & Compliance Coverage

| Standard | Module |
|----------|--------|
| ISO 9001:2015 | Quality Management (`api-quality`) |
| ISO 14001:2015 | Environmental Management (`api-environment`) |
| ISO 45001:2018 | Health & Safety (`api-health-safety`) |
| ISO 27001:2022 | Information Security (`api-infosec`) |
| ISO 13485:2016 | Medical Devices (`api-medical`) |
| ISO 22000:2018 + HACCP | Food Safety (`api-food-safety`) |
| ISO 42001:2023 | AI Management (`api-iso42001`) |
| ISO 37001:2016 | Anti-Bribery (`api-iso37001`) |
| IATF 16949:2016 | Automotive Quality (`api-automotive`) |
| AS9100D | Aerospace Quality (`api-aerospace`) |
| ISO 50001:2018 | Energy Management (`api-energy`) |
| GRI / TCFD / SASB | ESG Reporting (`api-esg`) |
| 21 CFR Part 11 | Electronic Signatures (`@ims/esig`) |
| GDPR | Data Protection (`api-gateway` DSAR/DPA routes) |
| RIDDOR | Incident Reporting (`api-incidents`) |
| CDM Regulations | Permit to Work (`api-ptw`) |

---

## 2. SYSTEM ARCHITECTURE

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER                              │
│  ┌───────────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │ 44 Web Apps   │  │ Mobile   │  │   SDK    │  │  Webhooks    │  │
│  │ (Next.js 15)  │  │ PWA      │  │  v2.0    │  │  Consumers   │  │
│  │ ports 3000-   │  │          │  │          │  │              │  │
│  │ 3045          │  │          │  │          │  │              │  │
│  └───────┬───────┘  └────┬─────┘  └────┬─────┘  └──────┬───────┘  │
└──────────┼───────────────┼─────────────┼────────────────┼──────────┘
           └───────────────┴─────────────┴────────────────┘
                                   │ HTTPS
           ┌───────────────────────▼──────────────────────┐
           │          API GATEWAY (port 4000)             │
           │  ┌──────────────────────────────────────┐   │
           │  │ Middleware Stack (in order):           │   │
           │  │ 1. CORS (raw, before Helmet)           │   │
           │  │ 2. Helmet (security headers)           │   │
           │  │ 3. gzip Compression                   │   │
           │  │ 4. Correlation ID injection            │   │
           │  │ 5. Request logging (Winston)           │   │
           │  │ 6. Prometheus metrics                  │   │
           │  │ 7. CSRF protection (CSRF_ENABLED)      │   │
           │  │ 8. Rate Limiting (Redis-backed)        │   │
           │  │ 9. IP Allowlist check                  │   │
           │  │ 10. JWT Authentication                 │   │
           │  │ 11. RBAC permission check              │   │
           │  │ 12. Circuit Breaker                    │   │
           │  │ 13. Proxy to downstream service        │   │
           │  └──────────────────────────────────────┘   │
           │                                              │
           │  Local Routes (handled directly):            │
           │  /api/auth, /api/users, /api/dashboard       │
           │  /api/roles, /api/notifications              │
           │  /api/compliance, /api/sessions              │
           │  /api/reports, /api/tasks, /api/comments     │
           │  /api/webhooks, /api/templates               │
           │  /api/saml, /api/scim, /api/api-keys         │
           │  /api/gdpr, /api/dsar, /api/dpa              │
           │  /api/esignature, /api/marketplace           │
           │  /api/status, /api/openapi                   │
           └───────────────────────┬──────────────────────┘
                                   │
           ┌───────────────────────▼──────────────────────┐
           │          42 MICROSERVICES (ports 4001-4041)  │
           │  Each service: Express.js + Prisma + Auth    │
           │  All behind Gateway proxy (path rewrites)    │
           └───────────────────────┬──────────────────────┘
                                   │
           ┌───────────────────────▼──────────────────────┐
           │                 DATA LAYER                    │
           │  PostgreSQL 16 (port 5432)                   │
           │    44 schemas, ~590 models, 781+ enums         │
           │    connection_limit=1 per service (~43+ total) │
           │                                              │
           │  Redis 7 (port 6379)                         │
           │    Rate limit counters (persistent)           │
           │    Session cache                              │
           │    Circuit breaker state                      │
           └──────────────────────────────────────────────┘
```

### 2.2 Request Lifecycle

1. **Client** sends HTTPS request to Gateway (port 4000)
2. **CORS** — Gateway sets `Access-Control-Allow-Origin` from allowed-origins array (NOT from env var)
3. **Authentication** — JWT verified; `req.user` populated (`{ id, email, role, orgId }`)
4. **Rate Limiting** — Redis-backed; Auth: 5 req/15min; API: 100 req/15min; Per-user: tier-based
5. **Routing** — Local routes handled directly; others proxied to downstream service
6. **Proxy** — `http-proxy-middleware` rewrites path, re-serializes body, strips CORS headers
7. **Downstream** — Service validates, queries Prisma, returns `{ success, data }` envelope
8. **Circuit Breaker** — If service is OPEN, serves stale LRU cache (GET/HEAD) or 503 (POST/PUT/PATCH)
9. **Response** — Client receives JSON: `{ success: true, data: { ... } }`

### 2.3 Authentication Flow

```
POST /api/auth/login
  ↓ Validate credentials (bcrypt)
  ↓ Check account lockout (Redis sliding window)
  ↓ Assess login risk (IP, device, time, geo)
  ↓ If HIGH risk → step-up MFA required
  ↓ Generate JWT access token (15min) + refresh token (7 days)
  ↓ Store refresh token hash in DB (Session model)
  ↓ Return { accessToken, refreshToken, user }

Frontend: store accessToken in localStorage as 'token'
Every API request: Authorization: Bearer <token>
Token refresh: POST /api/auth/refresh with refreshToken body
```

### 2.4 Response Envelope Format

All API responses follow this standard shape:

```json
{
  "success": true,
  "data": { ... },
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

Error responses:
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [ ... ]
}
```

---

## 3. API SERVICE INVENTORY

### 3.1 Summary Table

| Service | Port | Routes | Endpoints | Test Files | Description |
|---------|------|--------|-----------|------------|-------------|
| api-gateway | 4000 | 40 | 207 | 57 | Central API gateway, auth, routing |
| api-health-safety | 4001 | 10 | 59 | 11 | ISO 45001 H&S management |
| api-environment | 4002 | 13 | 85 | 15 | ISO 14001 environmental management |
| api-quality | 4003 | 36 | 213 | 39 | ISO 9001 quality management system |
| api-ai-analysis | 4004 | 7 | 15 | 8 | AI/ML analysis and insights |
| api-inventory | 4005 | 9 | 45 | 9 | Inventory and stock management |
| api-hr | 4006 | 12 | 100 | 12 | Human resources management |
| api-payroll | 4007 | 8 | 45 | 8 | Payroll and compensation |
| api-workflows | 4008 | 8 | 64 | 8 | Workflow automation engine |
| api-project-management | 4009 | 13 | 65 | 13 | Project and portfolio management |
| api-automotive | 4010 | 12 | 71 | 18 | IATF 16949 automotive quality |
| api-medical | 4011 | 15 | 104 | 22 | ISO 13485 medical devices |
| api-aerospace | 4012 | 13 | 101 | 16 | AS9100D aerospace quality |
| api-finance | 4013 | 16 | 135 | 16 | Financial management and compliance |
| api-crm | 4014 | 9 | 59 | 9 | Customer relationship management |
| api-infosec | 4015 | 7 | 48 | 7 | ISO 27001 information security |
| api-esg | 4016 | 17 | 86 | 17 | ESG reporting (GRI/TCFD/SASB) |
| api-cmms | 4017 | 13 | 88 | 13 | Computerized maintenance management |
| api-portal | 4018 | 16 | 54 | 16 | Customer/supplier portal |
| api-food-safety | 4019 | 16 | 91 | 16 | ISO 22000 / HACCP food safety |
| api-energy | 4020 | 13 | 77 | 13 | ISO 50001 energy management |
| api-analytics | 4021 | 31 | 139 | 46 | Business intelligence and analytics |
| api-field-service | 4022 | 13 | 86 | 13 | Field service management |
| api-iso42001 | 4023 | 10 | 60 | 10 | ISO 42001 AI management system |
| api-iso37001 | 4024 | 7 | 46 | 7 | ISO 37001 anti-bribery |
| api-marketing | 4025 | 14 | 33 | 14 | Marketing and growth analytics |
| api-partners | 4026 | 8 | 22 | 8 | Partner portal and management |
| api-risk | 4027 | 13 | 55 | 13 | Enterprise risk management |
| api-training | 4028 | 7 | 27 | 7 | Training and competency management |
| api-suppliers | 4029 | 8 | 25 | 8 | Supplier management |
| api-assets | 4030 | 7 | 23 | 7 | Asset lifecycle management |
| api-documents | 4031 | 6 | 22 | 6 | Document control |
| api-complaints | 4032 | 7 | 19 | 7 | Complaints management |
| api-contracts | 4033 | 7 | 23 | 7 | Contract lifecycle management |
| api-ptw | 4034 | 5 | 17 | 5 | Permit to work |
| api-reg-monitor | 4035 | 4 | 16 | 4 | Regulatory change monitoring |
| api-incidents | 4036 | 5 | 11 | 5 | Incident management (RIDDOR) |
| api-audits | 4037 | 6 | 22 | 6 | Audit management |
| api-mgmt-review | 4038 | 3 | 7 | 3 | Management review |
| api-setup-wizard | 4039 | 1 | 5 | 1 | Onboarding wizard |
| api-chemicals | 4040 | 8 | 38 | 9 | Chemical / COSHH management |
| api-emergency | 4041 | 9 | 50 | 10 | Emergency preparedness (BCP/DRP) |

### 3.2 Service Details

#### API Gateway (port 4000)

**Purpose:** Single entry point for all client requests. Handles auth, rate limiting, CORS, routing, circuit breaking, and 40+ local feature routes.

**Local Route Modules:**
- `auth.ts` — Login, logout, register, token refresh, password reset
- `users.ts` — User CRUD, profile management
- `dashboard.ts` — Dashboard KPI aggregation
- `roles.ts` — Custom role management (RBAC)
- `notifications.ts` — In-app notification delivery
- `compliance.ts` — Cross-module compliance summary
- `compliance-calendar.ts` — Regulatory deadline calendar
- `compliance-scores.ts` — Per-module compliance scoring
- `sessions.ts` — Active session management
- `reports.ts` — Cross-module report generation
- `tasks.ts` — Cross-module task management
- `comments.ts` — Threaded comments (any entity)
- `templates.ts` — 192 built-in document templates
- `webhooks.ts` — Outbound webhook management
- `api-keys.ts` — API key issuance and management (Prisma-backed)
- `saml.ts` — SAML 2.0 SSO configuration (Prisma-backed)
- `scim.ts` — SCIM 2.0 user provisioning (Prisma-backed)
- `msp.ts` — MSP multi-tenant links (Prisma-backed)
- `unified-audit.ts` — Cross-service audit plans (Prisma-backed)
- `gdpr.ts` — GDPR cookie consent management
- `dsar.ts` — Data Subject Access Requests
- `dpa.ts` — Data Processing Agreements
- `esignature.ts` — Electronic signature workflow (21 CFR Part 11)
- `marketplace.ts` — App marketplace integrations
- `nps.ts` — Net Promoter Score surveys
- `presence.ts` — Real-time user presence (WebSocket)
- `activity.ts` — Activity feed and audit log
- `feature-flags.ts` — Feature flag management
- `certifications.ts` — ISO certification tracking
- `ip-allowlist.ts` — IP allowlist management
- `changelog.ts` — Platform changelog
- `scheduled-reports.ts` — Automated report scheduling
- `automation-rules.ts` — No-code automation rules
- `status.ts` — Platform status page
- `openapi.ts` — OpenAPI specification serving
- `import.ts` — Bulk CSV import
- `security-controls.ts` — Security control dashboard
- `audit.ts` — Audit log queries
- `v1.ts` — Versioned API prefix routing

**Middleware Stack (in order):**
1. `cors` — Raw CORS (FIRST, before Helmet)
2. `helmet` — Security headers (crossOriginResourcePolicy: 'cross-origin')
3. `compression` — gzip/deflate (Node.js zlib, no deps)
4. `correlationIdMiddleware` — X-Correlation-ID injection
5. `metricsMiddleware` — Prometheus request metrics
6. `express.json()` — Body parsing
7. `csrf` — CSRF protection (disable: `CSRF_ENABLED=false`)
8. `rateLimiter` — Redis-backed rate limits
9. `orgRateLimiter` — Per-organization rate limits
10. `ipAllowlist` — IP allowlist enforcement
11. `accountLockout` — Brute-force protection
12. `authenticate` — JWT verification (per-route)
13. `createProxyCircuitBreaker` — Circuit breaker per service
14. `createServiceProxy` — http-proxy-middleware

**Key Configuration (`.env`):**
```
PORT=4000
JWT_SECRET=<shared-secret-must-match-all-services>
REDIS_URL=redis://localhost:6379
DATABASE_URL=postgresql://postgres:<pass>@localhost:5432/ims?connection_limit=1
CSRF_ENABLED=false
SERVICE_HEALTH_SAFETY_URL=http://localhost:4001
SERVICE_ENVIRONMENT_URL=http://localhost:4002
SERVICE_QUALITY_URL=http://localhost:4003
... (one per service)
```

---

#### Health & Safety Service (port 4001)

**Standard:** ISO 45001:2018
**Schema:** `health-safety.prisma` (18 models, 31 enums)

**Route Modules:**
- `incidents.ts` — Incident reporting (RIDDOR), near-miss, first aid
- `risks.ts` — Hazard identification and risk assessment (HIRA)
- `capa.ts` — Corrective and preventive actions
- `actions.ts` — Action tracking and assignment
- `metrics.ts` — Safety KPIs (LTI rate, frequency rate, severity rate)
- `objectives.ts` — OHS objectives and milestones
- `legal.ts` — Legal and regulatory requirements register
- `communications.ts` — Safety communications and toolbox talks
- `training.ts` — Safety training records
- `management-reviews.ts` — OHS management review meetings

**Database Models:** `Incident`, `Risk`, `Hazard`, `HSAction`, `FiveWhyAnalysis`, `FishboneAnalysis`, `BowTieAnalysis`, `SafetyMetric`, `SafetyPermit`, `SafetyInspection`, `LegalRequirement`, `OhsObjective`, `ObjectiveMilestone`, `Capa`, `CapaAction`, `HSManagementReview`, `HSMRAction`, `HSCommunication`

---

#### Environment Service (port 4002)

**Standard:** ISO 14001:2015
**Schema:** `environment.prisma` (25 models, 52 enums)

**Route Modules:**
- `aspects.ts` — Environmental aspects and impacts register
- `events.ts` — Environmental incidents and spills
- `legal.ts` — Environmental legal obligations
- `objectives.ts` — Environmental objectives and milestones
- `actions.ts` — Environmental action plans
- `capa.ts` — Environmental CAPAs
- `audits.ts` — Environmental audits
- `communications.ts` — Environmental communications
- `emergency.ts` — Environmental emergency response
- `esg.ts` — ESG-linked environmental data
- `lifecycle.ts` — Product lifecycle assessments
- `management-reviews.ts` — Environmental management reviews
- `training.ts` — Environmental awareness training

**Significance Scoring Formula:**
```
score = severity×1.5 + probability×1.5 + duration + extent + reversibility + regulatory + stakeholder
Threshold ≥ 15 = Significant Aspect
```

---

#### Quality Management Service (port 4003)

**Standards:** ISO 9001:2015
**Schema:** `quality.prisma` (44 models, 95 enums) — largest schema

**Route Modules:**
- `nonconformances.ts` — Non-conformance reports (NCR)
- `capa.ts` — Corrective and preventive actions
- `documents.ts` — Document control
- `audits.ts` — Internal and external audits
- `risks.ts` — Quality risk register
- `opportunities.ts` — Continual improvement opportunities
- `issues.ts` — Context issues (SWOT/PESTLE)
- `parties.ts` — Interested parties register
- `objectives.ts` — Quality objectives
- `processes.ts` — Process map and monitoring
- `metrics.ts` — Quality KPIs and SPC data
- `investigations.ts` — Root cause investigation
- `improvements.ts` — Improvement register (CI)
- `legal.ts` — Legal and regulatory compliance
- `competences.ts` — Competence and training records
- `management-reviews.ts` — Management review meetings
- `suppliers.ts` — Supplier qualification and monitoring
- `changes.ts` — Change management
- `fmea.ts` — Failure Mode & Effects Analysis
- `ci.ts` — Continual improvement tracking
- `calibrations.ts` — Measurement equipment calibration
- `context-factors.ts` — Organizational context
- `design-development.ts` — Design and development planning
- `product-safety.ts` — Product safety incidents and recalls
- `counterfeit.ts` — Counterfeit part management
- `customer-satisfaction.ts` — Customer satisfaction surveys
- `raci.ts` — RACI responsibility matrix
- `releases.ts` — Product/service releases
- `risk-register.ts` — Enterprise quality risks
- `scope.ts` — QMS scope definition
- `policy.ts` — Quality policy management
- `evidence-pack.ts` — Certification evidence packages (Prisma-backed)
- `headstart.ts` — ISO headstart assessments (Prisma-backed)
- `template-generator.ts` — AI-powered document generation
- `actions.ts` — Action tracking
- `training.ts` — Quality training records

**Database Models (44):** `QualInterestedParty`, `QualIssue`, `QualRisk`, `QualOpportunity`, `QualProcess`, `QualNonConformance`, `QualAction`, `QualDocument`, `QualCapa`, `QualCapaAction`, `QualLegal`, `QualFmea`, `QualFmeaRow`, `QualImprovement`, `QualSupplier`, `QualChange`, `QualObjective`, `QualMilestone`, `CustomerSurvey`, `SurveyQuestion`, `SurveyResponse`, `QuestionAnswer`, `CounterfeitReport`, `ApprovedSource`, `QuarantineRecord`, `QualDesignProject`, `QualDesignStageDoc`, `SafetyCharacteristic`, `ProductSafetyIncident`, `ProductRecall`, `QualCalibration`, `QualCompetence`, `QualRaci`, `QualRelease`, `QualManagementReview`, `QualAudit`, `QualTraining`, `QualMetric`, `QualInvestigation`, `QualContinuousImprovement`, `QualRiskRegister`, `QualGeneratedTemplate`, `QualEvidencePack`, `QualHeadstartAssessment`

---

#### AI Analysis Service (port 4004)

**Schema:** `ai.prisma` (11 models, 11 enums)

**Route Modules:**
- `analysis.ts` — AI-powered text analysis (OpenAI / Anthropic)
- `nlq.ts` — Natural language database queries
- `assistant.ts` — Conversational AI assistant
- `predictions.ts` — Predictive analytics and trend forecasting
- `recommendations.ts` — AI-driven action recommendations
- `insights.ts` — Automated insight generation
- `classification.ts` — Document classification

---

#### Inventory Service (port 4005)

**Schema:** `inventory.prisma` (12 models, 12 enums)

**Route Modules:** `inventory.ts`, `products.ts`, `categories.ts`, `warehouses.ts`, `stock-levels.ts`, `adjustments.ts`, `transactions.ts`, `suppliers.ts`, `reports.ts`

---

#### HR Service (port 4006)

**Schema:** `hr.prisma` (27 models, 33 enums)

**Route Modules:** `employees.ts`, `departments.ts`, `recruitment.ts`, `leave.ts`, `attendance.ts`, `performance.ts`, `goals.ts`, `training.ts`, `certifications.ts`, `documents.ts`, `gdpr.ts`, `org-chart.ts`

---

#### Payroll Service (port 4007)

**Schema:** `payroll.prisma` (15 models, 20 enums)

**Route Modules:** `payroll.ts`, `salary.ts`, `tax.ts`, `tax-calculator.ts`, `expenses.ts`, `benefits.ts`, `loans.ts`, `jurisdictions.ts` (Prisma-backed — `PayrollJurisdiction` model)

---

#### Workflows Service (port 4008)

**Schema:** `workflows.prisma` (17 models, 29 enums)

**Route Modules:** `definitions.ts`, `instances.ts`, `tasks.ts`, `approvals.ts`, `templates.ts`, `automation.ts`, `admin.ts`, `webhooks.ts`

---

#### Project Management Service (port 4009)

**Schema:** `project-management.prisma` (16 models, 35 enums)

**Route Modules:** `projects.ts`, `tasks.ts`, `milestones.ts`, `issues.ts`, `risks.ts`, `changes.ts`, `resources.ts`, `timesheets.ts`, `documents.ts`, `stakeholders.ts`, `benefits.ts`, `reports.ts`, `sprints.ts`

---

#### Automotive Service (port 4010)

**Standard:** IATF 16949:2016
**Schema:** `automotive.prisma` (23 models, 26 enums)

**Route Modules:** `apqp.ts`, `ppap.ts`, `fmea.ts`, `spc.ts`, `msa.ts`, `control-plans.ts`, `eight-d.ts`, `lpa.ts`, `csr.ts`, `customer-reqs.ts`, `supplier-dev.ts`, `templates.ts`

**Key Features:** APQP phase gate management, PPAP submission packages (18 elements), DFMEA/PFMEA with RPN scoring, Statistical Process Control (SPC) with `@ims/spc-engine`, Measurement System Analysis (MSA), 8D problem solving, Layered Process Audits (LPA), Control plans with reaction plans.

---

#### Medical Devices Service (port 4011)

**Standard:** ISO 13485:2016, 21 CFR Part 820
**Schema:** `medical.prisma` (31 models, 44 enums)

**Route Modules:** `device-records.ts`, `design-controls.ts`, `dhf.ts`, `dmr-dhr.ts`, `risk-management.ts`, `capa.ts`, `complaints.ts`, `pms.ts`, `software.ts`, `traceability.ts`, `udi.ts`, `validation.ts`, `verification.ts`, `suppliers.ts`, `submissions.ts`

**Key Features:** Device History File (DHF), Design History Record (DHR/DMR), Design Controls (V-model), UDI (Unique Device Identification), Post-Market Surveillance (PMS), 510k/CE submission tracking, ISO 14971 risk management, Software validation (IEC 62304 lifecycle).

---

#### Aerospace Service (port 4012)

**Standard:** AS9100D, EN9100:2018
**Schema:** `aerospace.prisma` (24 models, 54 enums)

**Route Modules:** `audits.ts`, `baselines.ts`, `changes.ts`, `compliance-tracker.ts`, `configuration.ts`, `counterfeit.ts`, `fai.ts`, `fod.ts`, `human-factors.ts`, `oasis.ts`, `product-safety.ts`, `special-processes.ts`, `workorders.ts`

**Key Features:** First Article Inspection (FAI) per AS9102B, Foreign Object Damage/Debris (FOD) prevention, Configuration management, Counterfeit parts detection, OASIS registration management, Special processes control (NADCAP), Human factors risk assessment.

---

#### Finance Service (port 4013)

**Schema:** `finance.prisma` (27 models, 18 enums)

**Route Modules:** `accounts.ts`, `invoices.ts`, `purchase-orders.ts`, `payables.ts`, `banking.ts`, `budgets.ts`, `journal.ts`, `customers.ts`, `suppliers.ts`, `tax.ts`, `hmrc-calendar.ts`, `ir35.ts`, `controls.ts`, `sod-matrix.ts`, `integrations.ts`, `reports.ts`

**Key Features:** Chart of accounts (double-entry bookkeeping), AR/AP management, Bank reconciliation, Budget vs actual tracking, Journal entries, Tax compliance (VAT/IR35/MTD), HMRC Making Tax Digital calendar, Segregation of Duties matrix, Financial controls (SOX-aligned).

---

#### CRM Service (port 4014)

**Schema:** `crm.prisma` (17 models, 16 enums)

**Route Modules:** `accounts.ts`, `contacts.ts`, `leads.ts`, `deals.ts`, `campaigns.ts`, `quotes.ts`, `partners.ts`, `forecast.ts`, `reports.ts`

---

#### Information Security Service (port 4015)

**Standard:** ISO 27001:2022
**Schema:** `infosec.prisma` (14 models, 26 enums)

**Route Modules:** `controls.ts`, `assets.ts`, `risks.ts`, `incidents.ts`, `audits.ts`, `privacy.ts`, `scope.ts`

**Key Features:** ISO 27001 Annex A control tracking (93 controls), Information asset register, Information security risk register, Security incident response, Privacy impact assessments, ISMS scope definition.

---

#### ESG Service (port 4016)

**Frameworks:** GRI, TCFD, SASB, UN SDGs
**Schema:** `esg.prisma` (17 models, 18 enums)

**Route Modules:** `emissions.ts`, `scope-emissions.ts`, `energy.ts`, `water.ts`, `waste.ts`, `social.ts`, `governance.ts`, `metrics.ts`, `targets.ts`, `frameworks.ts`, `materiality.ts`, `stakeholders.ts`, `initiatives.ts`, `esg-reports.ts`, `defra-factors.ts`, `audits.ts`, `reports.ts`

**Key Features:** Scope 1/2/3 GHG emissions tracking, DEFRA emission factors database, GRI Standards reporting, TCFD climate-related disclosures, SASB industry metrics, UN SDG alignment, Materiality assessment, ESG report generation.

---

#### CMMS Service (port 4017)

**Schema:** `cmms.prisma` (16 models, 16 enums)

**Route Modules:** `assets.ts`, `work-orders.ts`, `preventive-plans.ts`, `requests.ts`, `inspections.ts`, `checklists.ts`, `parts.ts`, `vendors.ts`, `meters.ts`, `locations.ts`, `downtime.ts`, `scheduler.ts`, `kpis.ts`

**Key Features:** Asset register with hierarchy, Preventive maintenance scheduling, Work order management, Maintenance request portal, Inspection checklists, Spare parts inventory, OEE calculation (`@ims/oee-engine`), MTBF/MTTR tracking, Downtime analysis.

---

#### Portal Service (port 4018)

**Schema:** `portal.prisma` (12 models, 17 enums)

**Route Modules:** Customer portal routes, supplier portal routes, authentication, document sharing, NCR submission, survey responses.

---

#### Food Safety Service (port 4019)

**Standards:** ISO 22000:2018, FSSC 22000, HACCP
**Schema:** `food-safety.prisma` (14 models, 22 enums)

**Route Modules:** `haccp-flow.ts`, `hazards.ts`, `ccps.ts`, `monitoring.ts`, `products.ts`, `allergens.ts`, `traceability.ts`, `recalls.ts`, `sanitation.ts`, `environmental-monitoring.ts`, `food-defense.ts`, `suppliers.ts`, `audits.ts`, `ncrs.ts`, `training.ts`, `dashboard.ts`

**Key Features:** HACCP plan builder (7 HACCP principles), CCP monitoring with limits, Allergen management matrix, Full lot traceability (forwards/backwards), Product recall coordination, Environmental monitoring program, Food defense assessments, Sanitation verification records.

---

#### Energy Service (port 4020)

**Standard:** ISO 50001:2018
**Schema:** `energy.prisma` (12 models, 17 enums)

**Route Modules:** `meters.ts`, `readings.ts`, `baselines.ts`, `seus.ts`, `targets.ts`, `enpis.ts`, `projects.ts`, `audits.ts`, `bills.ts`, `compliance.ts`, `alerts.ts`, `reports.ts`, `dashboard.ts`

**Key Features:** Energy meter hierarchy, Automated reading collection, Energy baseline (EnB) establishment, Significant Energy Uses (SEUs) identification, Energy Performance Indicators (EnPIs), Energy improvement projects tracking, ENERGY STAR/ISO 50001 compliance checks.

---

#### Analytics Service (port 4021)

**Schema:** `analytics.prisma` (40 models, 22 enums) — second-largest schema

**Route Modules:** `dashboards.ts`, `kpis.ts`, `reports.ts`, `datasets.ts`, `queries.ts`, `nlq.ts`, `predictions.ts`, `anomalies.ts`, `benchmarks.ts`, `alerts.ts`, `schedules.ts`, `exports.ts`, `executive.ts`, `board-packs.ts`, `unified-risks.ts`, `uptime.ts`, `cashflow.ts`, `contracts.ts`, `expenses.ts`, `monthly-review.ts`, `competitors.ts`, `meetings.ts`, `dsars.ts`, `gdpr.ts`, `certifications.ts`, `feature-requests.ts`, `release-notes.ts`, `webhooks/`

---

#### Field Service Service (port 4022)

**Schema:** `field-service.prisma` (14 models, 12 enums)

**Route Modules:** `jobs.ts`, `technicians.ts`, `schedules.ts`, `customers.ts`, `sites.ts`, `contracts.ts`, `invoices.ts`, `parts-used.ts`, `time-entries.ts`, `checklists.ts`, `job-notes.ts`, `routes.ts`, `kpis.ts`

---

#### ISO 42001 Service (port 4023) — AI Management System

**Standard:** ISO 42001:2023
**Schema:** `iso42001.prisma` (10 models, 18 enums)

**Route Modules:** `ai-systems.ts`, `risk-assessments.ts`, `controls.ts`, `impact-assessments.ts`, `policies.ts`, `monitoring.ts`, `incidents.ts`, `human-review.ts`, `audit-log.ts`, `self-declaration.ts`

---

#### ISO 37001 Service (port 4024) — Anti-Bribery

**Standard:** ISO 37001:2016
**Schema:** `iso37001.prisma` (7 models, 15 enums)

**Route Modules:** `policies.ts`, `risk-assessments.ts`, `due-diligence.ts`, `gifts.ts`, `investigations.ts`, `compliance.ts`, `training.ts`

---

#### Marketing Service (port 4025)

**Schema:** `marketing.prisma` (13 models, 9 enums)

**Route Modules:** `leads.ts`, `growth.ts`, `roi.ts`, `health-score.ts`, `onboarding.ts`, `renewal.ts`, `winback.ts`, `expansion.ts`, `prospect-research.ts`, `linkedin-tracker.ts`, `partner-onboarding.ts`, `digest.ts`, `chat.ts`, `stripe-webhooks.ts`

---

#### Partners Service (port 4026)

**Schema:** `partner-portal.prisma` (4 models, 5 enums)

**Route Modules:** `auth.ts` (with intentional ephemeral loginAttempts Map for rate limiting), `partners.ts`, `referrals.ts`, `commissions.ts`, `resources.ts`, `leads.ts`, `analytics.ts`, `support.ts`

---

#### Risk Service (port 4027)

**Schema:** `risk.prisma` (10 models, 16 enums)

**Route Modules:** `risks.ts`, `categories.ts`, `controls.ts`, `treatments.ts`, `reviews.ts`, `actions.ts`, `capa.ts`, `bowtie.ts`, `heat-map.ts`, `kri.ts`, `appetite.ts`, `analytics.ts`, `dashboard.ts`

**Key Features:** Enterprise risk register, Bow-tie analysis, Risk heat map visualizations, Key Risk Indicators (KRIs), Risk appetite framework, Risk treatment plans, ISO 31000 aligned.

---

#### Training Service (port 4028)

**Schema:** `training.prisma` (5 models, 5 enums)

**Route Modules:** `courses.ts`, `records.ts`, `competencies.ts`, `matrix.ts`, `tna.ts`, `inductions.ts`, `dashboard.ts`

---

#### Suppliers Service (port 4029)

**Schema:** `suppliers.prisma` (4 models, 4 enums)

**Route Modules:** `suppliers.ts`, `qualifications.ts`, `assessments.ts`, `performance.ts`, `audits.ts`, `documents.ts`, `ncrs.ts`, `approvals.ts`

---

#### Assets Service (port 4030)

**Schema:** `assets.prisma` (4 models, 5 enums)

**Route Modules:** `assets.ts`, `categories.ts`, `movements.ts`, `depreciation.ts`, `disposals.ts`, `maintenance.ts`, `reports.ts`

---

#### Documents Service (port 4031)

**Schema:** `documents.prisma` (4 models, 3 enums)

**Route Modules:** `documents.ts`, `versions.ts`, `categories.ts`, `permissions.ts`, `search.ts`, `templates.ts`

---

#### Complaints Service (port 4032)

**Schema:** `complaints.prisma` (3 models, 4 enums)

**Route Modules:** `complaints.ts`, `investigations.ts`, `resolutions.ts`, `analytics.ts`, `escalations.ts`, `satisfaction.ts`, `reports.ts`

---

#### Contracts Service (port 4033)

**Schema:** `contracts.prisma` (4 models, 4 enums)

**Route Modules:** `contracts.ts`, `clauses.ts`, `renewals.ts`, `obligations.ts`, `signatories.ts`, `amendments.ts`, `reports.ts`

---

#### Permit to Work Service (port 4034)

**Schema:** `ptw.prisma` (3 models, 3 enums)

**Route Modules:** `permits.ts`, `isolations.ts`, `reviews.ts`, `templates.ts`, `approvals.ts`

---

#### Regulatory Monitor Service (port 4035)

**Schema:** `reg-monitor.prisma` (3 models, 3 enums)

**Route Modules:** `regulations.ts`, `alerts.ts`, `obligations.ts`, `assessments.ts`

---

#### Incidents Service (port 4036)

**Schema:** `incidents.prisma` (1 model, 4 enums)

**Route Modules:** `incidents.ts`, `investigation.ts`, `riddor.ts`, `timeline.ts`, `dashboard.ts`

---

#### Audits Service (port 4037)

**Schema:** `audits.prisma` (4 models, 4 enums)

**Route Modules:** `audits.ts`, `findings.ts`, `checklists.ts`, `schedules.ts`, `reports.ts`, `nonconformances.ts`

---

#### Management Review Service (port 4038)

**Schema:** `mgmt-review.prisma` (1 model, 1 enum)

**Route Modules:** `reviews.ts`, `agenda.ts`, `minutes.ts`

---

#### Setup Wizard Service (port 4039)

**Schema:** `wizard.prisma` (2 models, 2 enums)

**Route Modules:** `wizard.ts` (5 endpoints — onboarding steps)

---

#### Chemicals Service (port 4040)

**Standard:** COSHH Regulations 2002
**Schema:** `chemicals.prisma` (9 models, 17 enums)

**Route Modules:** `chemicals.ts`, `sds.ts`, `coshh.ts`, `inventory.ts`, `disposal.ts`, `monitoring.ts`, `incidents.ts`, `analytics.ts`

**Key Features:** Chemical inventory register, Safety Data Sheet (SDS) management, COSHH risk assessments, Exposure monitoring records, Hazardous waste disposal tracking, GHS hazard classification.

---

#### Emergency Service (port 4041)

**Schema:** `emergency.prisma` (16 models, 10 enums)

**Route Modules:** `incidents.ts`, `bcp.ts`, `drills.ts`, `equipment.ts`, `wardens.ts`, `premises.ts`, `peep.ts`, `fireRiskAssessment.ts`, `analytics.ts`

**Key Features:** Business Continuity Plans (BCP), Disaster Recovery Plans (DRP), Emergency drills scheduling, Emergency equipment register, Fire warden management, PEEP (Personal Emergency Evacuation Plans), Fire risk assessments, Emergency contact management.

---

## 4. WEB APPLICATION INVENTORY

### 4.1 Summary Table

| App | Port | Pages | Components | Purpose |
|-----|------|-------|------------|---------|
| web-dashboard | 3000 | 11 | 19 | Main IMS dashboard |
| web-health-safety | 3001 | 13 | 2 | H&S module UI |
| web-environment | 3002 | 15 | 2 | Environmental module UI |
| web-quality | 3003 | 39 | 10 | Quality management UI (largest) |
| web-settings | 3004 | 26 | 2 | Platform settings and admin |
| web-inventory | 3005 | 11 | 2 | Inventory management UI |
| web-hr | 3006 | 15 | 1 | Human resources UI |
| web-payroll | 3007 | 14 | 1 | Payroll UI |
| web-workflows | 3008 | 13 | 1 | Workflow management UI |
| web-project-management | 3009 | 16 | 2 | Project management UI |
| web-automotive | 3010 | 14 | 2 | Automotive quality UI |
| web-medical | 3011 | 17 | 2 | Medical device UI |
| web-aerospace | 3012 | 15 | 2 | Aerospace quality UI |
| web-finance | 3013 | 16 | 1 | Finance management UI |
| web-crm | 3014 | 15 | 1 | CRM UI |
| web-infosec | 3015 | 19 | 1 | InfoSec management UI |
| web-esg | 3016 | 17 | 1 | ESG reporting UI |
| web-cmms | 3017 | 16 | 1 | CMMS UI |
| web-customer-portal | 3018 | 8 | 1 | External customer portal |
| web-supplier-portal | 3019 | 8 | 1 | External supplier portal |
| web-food-safety | 3020 | 17 | 1 | Food safety UI |
| web-energy | 3021 | 15 | 1 | Energy management UI |
| web-analytics | 3022 | 15 | 1 | Analytics and BI UI |
| web-field-service | 3023 | 16 | 1 | Field service UI |
| web-iso42001 | 3024 | 16 | 1 | ISO 42001 AI management UI |
| web-iso37001 | 3025 | 10 | 1 | ISO 37001 anti-bribery UI |
| web-partners | 3026 | 10 | 1 | Partners portal UI |
| web-admin | 3027 | 12 | 1 | Platform administration |
| web-marketing | 3030 | 4 | 14 | Marketing analytics UI |
| web-risk | 3031 | 13 | 1 | Risk management UI |
| web-training | 3032 | 8 | 1 | Training management UI |
| web-suppliers | 3033 | 8 | 1 | Supplier management UI |
| web-assets | 3034 | 8 | 1 | Asset management UI |
| web-documents | 3035 | 7 | 1 | Document control UI |
| web-complaints | 3036 | 7 | 1 | Complaints management UI |
| web-contracts | 3037 | 8 | 1 | Contracts management UI |
| web-finance-compliance | 3038 | 6 | 1 | Financial compliance UI |
| web-ptw | 3039 | 6 | 1 | Permit to work UI |
| web-reg-monitor | 3040 | 5 | 1 | Regulatory monitoring UI |
| web-incidents | 3041 | 6 | 1 | Incident management UI |
| web-audits | 3042 | 7 | 1 | Audit management UI |
| web-mgmt-review | 3043 | 4 | 1 | Management review UI |
| web-chemicals | 3044 | 12 | 1 | Chemicals/COSHH UI |
| web-emergency | 3045 | 14 | 1 | Emergency management UI |

### 4.2 Frontend Architecture Patterns

**API Client Pattern (all web apps):**
```typescript
// lib/api.ts — standard pattern
export const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api/<module>`,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

**IMPORTANT — Never add:**
- `withCredentials: true` (breaks non-wildcard CORS)
- CSRF token fetching (JWT Bearer is sufficient)

**Modal Component:**
```tsx
// CORRECT — uses isOpen (NOT open)
<Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Title" size="lg">
```

**Data Access Pattern:**
```typescript
// API wraps data: response.data = axios; .data = API envelope
const items = response.data.data;       // actual payload
const total = response.data.pagination?.total;
```

**Dark Mode:** stored in `localStorage` as key `'nexara-theme'`
**Org Branding:** stored in `localStorage` as key `'nexara-org-branding'`
**Auth Token:** stored in `localStorage` as key `'token'`

---

## 5. SHARED PACKAGE REFERENCE

### 5.1 Core Infrastructure Packages

| Package | Version | Description |
|---------|---------|-------------|
| `@ims/auth` | 1.0.0 | JWT utilities, password hashing, adaptive auth risk scoring, magic links, key rotation |
| `@ims/database` | 1.0.0 | Prisma client re-exports (44 domain schemas) |
| `@ims/monitoring` | 1.0.0 | Winston logger, Prometheus metrics, health checks, OpenTelemetry tracing |
| `@ims/shared` | 1.0.0 | Error handler middleware, pagination, graceful shutdown, ID validation |
| `@ims/rbac` | 1.0.0 | Role-based access control (39 roles, 17 modules, 7 permission levels) |
| `@ims/security` | 1.0.0 | RASP middleware (injection detection), behavioral analytics, SIEM engine, envelope encryption |
| `@ims/resilience` | 1.0.0 | Circuit breaker (opossum), adaptive timeouts (p95-based) |
| `@ims/validation` | 1.0.0 | Zod schemas, sanitization, property-based tests |
| `@ims/types` | 1.0.0 | Shared TypeScript type definitions |
| `@ims/service-auth` | 1.0.0 | Service-to-service JWT authentication |

### 5.2 Business Logic Packages

| Package | Version | Description |
|---------|---------|-------------|
| `@ims/templates` | 1.0.0 | 192 built-in document templates across 34 modules |
| `@ims/emission-factors` | 1.0.0 | GHG emission factor database (DEFRA, EPA, IPCC) |
| `@ims/finance-calculations` | 1.0.0 | Financial calculation engine (depreciation, NPV, IRR) |
| `@ims/tax-engine` | 1.0.0 | Multi-jurisdiction tax calculation (VAT, GST, sales tax) |
| `@ims/oee-engine` | 1.0.0 | OEE (Availability × Performance × Quality) calculation |
| `@ims/spc-engine` | 1.0.0 | Statistical Process Control charts (Xbar-R, Xbar-S, P, C, U) |
| `@ims/nlq` | 1.0.0 | Natural language query engine (SQL generation from plain English) |
| `@ims/calculations` | 1.0.0 | General calculation utilities |
| `@ims/automation-rules` | 1.0.0 | No-code automation rule templates and execution engine |
| `@ims/iso-checklists` | 1.0.0 | ISO standard audit checklists |
| `@ims/standards-convergence` | 1.0.0 | Cross-standard mapping engine (common controls across ISO standards) |

### 5.3 Integration & Communication Packages

| Package | Version | Description |
|---------|---------|-------------|
| `@ims/notifications` | 1.0.0 | Multi-channel notifications (in-app, email, push, SMS, WebSocket) |
| `@ims/event-bus` | 1.0.0 | Cross-service event bus (publish/subscribe) |
| `@ims/webhooks` | 1.0.0 | Outbound webhook delivery with retry logic |
| `@ims/email` | 1.0.0 | Email delivery (SMTP/Nodemailer) with templates |
| `@ims/hubspot-client` | 1.0.0 | HubSpot CRM integration client |
| `@ims/intercom-client` | 1.0.0 | Intercom support widget client |
| `@ims/stripe-client` | 1.0.0 | Stripe billing integration |
| `@ims/regulatory-feed` | 1.0.0 | Live regulatory change feed ingestion |

### 5.4 Security Packages

| Package | Version | Description |
|---------|---------|-------------|
| `@ims/security` | 1.0.0 | RASP (SQL/XSS/command/path/LDAP injection detection), behavioral analytics, SIEM event correlation, envelope encryption (DEK/KEK) |
| `@ims/encryption` | 1.0.0 | AES-256-GCM encryption utilities |
| `@ims/secrets` | 1.0.0 | Secret management (Vault integration) |
| `@ims/esig` | 1.0.0 | Electronic signatures (21 CFR Part 11 compliant) |
| `@ims/audit` | 1.0.0 | Immutable audit trail utilities |
| `@ims/dpa` | 1.0.0 | Data Processing Agreement management |
| `@ims/dsar` | 1.0.0 | Data Subject Access Request handling |

### 5.5 UI / Frontend Packages

| Package | Version | Description |
|---------|---------|-------------|
| `@ims/ui` | 1.0.0 | 155 React components (Modal, Table, Form, Charts, etc.) |
| `@ims/theming` | 1.0.0 | Theme system (dark/light mode, org branding) |
| `@ims/i18n` | 1.0.0 | Internationalization (React context, no page reload) |
| `@ims/charts` | 1.0.0 | Chart components (Recharts-based) |
| `@ims/pwa` | 1.0.0 | Progressive Web App (service worker, offline sync, push notifications) |
| `@ims/pdf-generator` | 1.0.0 | PDF generation (reports, certificates) |
| `@ims/a11y` | 1.0.0 | Accessibility utilities (WCAG 2.1 AA) |

### 5.6 Platform & DevOps Packages

| Package | Version | Description |
|---------|---------|-------------|
| `@ims/monitoring` | 1.0.0 | Prometheus metrics, Winston logger, health checks, distributed tracing |
| `@ims/sentry` | 1.0.0 | Sentry error tracking integration |
| `@ims/status` | 1.0.0 | Platform status monitoring and health aggregation |
| `@ims/feature-flags` | 1.0.0 | Feature flag management |
| `@ims/performance` | 1.0.0 | k6 load tests, Lighthouse CI, WCAG audit |
| `@ims/benchmarks` | 1.0.0 | Performance benchmarking utilities |
| `@ims/testing` | 1.0.0 | Shared test utilities and factories |
| `@ims/openapi` | 1.0.0 | OpenAPI specification generation |
| `@ims/sdk` | 2.0.0 | Nexara Enterprise Developer SDK |

### 5.7 Key Package APIs

#### @ims/auth
```typescript
// JWT
generateToken(payload, options?) → string
generateRefreshToken(payload) → string
verifyToken(token) → JWTPayload
refreshAccessToken(refreshToken) → TokenPairResult

// Password
hashPassword(password) → Promise<string>
comparePassword(password, hash) → Promise<boolean>

// Adaptive Auth (risk scoring)
assessLoginRisk(ctx: { ip, email, userAgent, location }) → { score, action: 'ALLOW'|'STEP_UP_MFA'|'BLOCK', factors }

// Magic Links
generateMagicLink(email) → { rawToken, hashedToken, expiresAt }
verifyMagicLinkToken(rawToken, record) → boolean

// Key Rotation
jwtKeyManager.rotateKey() → void
jwtKeyManager.sign(payload) → string
jwtKeyManager.verify(token) → JWTPayload
```

#### @ims/monitoring
```typescript
// Logger
createLogger(service: string) → winston.Logger

// Metrics middleware
metricsMiddleware  // Express middleware
metricsHandler     // GET /metrics endpoint
correlationIdMiddleware  // X-Correlation-ID
createHealthCheck(checks) → Express handler

// Counters
authFailuresTotal.inc({ reason, service })
rateLimitExceededTotal.inc({ limiter, service })

// Rate Limiter
createDownstreamRateLimiter() → express-rate-limit (500 req/15min)

// Dashboard Metrics
RollingCounter, LatencyTracker
DashboardMetrics.snapshot() → { health, kpis }
```

#### @ims/rbac
```typescript
// Middleware
requirePermission(module, level) → Express middleware
attachPermissions → Express middleware
requireOwnership(getResourceOwnerId) → Express middleware

// Helpers
resolvePermissions(user) → ResolvedPermissions
hasPermission(permissions, module, level) → boolean
scopeByPermission(query, permissions, module) → query
```

#### @ims/security
```typescript
// RASP
createRasp({ threats: ['sql', 'xss', 'command', 'path', 'ldap'], onThreat?, monitorOnly? })
// Mount EARLY in Express chain

// Behavioral Analytics
buildProfile(userId, events) → BehaviorProfile
detectAnomaly(profile, event) → AnomalyResult

// SIEM
globalSiem.ingest(event: SiemEvent) → void
globalSiem.on('alert', (alert: SiemAlert) => { ... })

// Envelope Encryption
encryptWithDek(plaintext, dek) → EncryptedPayload
decryptWithDek(payload, dek) → string
rotateKek(oldKek, newKek, encryptedDeks) → newEncryptedDeks
```

---

## 6. DATABASE SCHEMA REFERENCE

### 6.1 Schema Overview

| Schema | Models | Enums | Service |
|--------|--------|-------|---------|
| core | 26 | 20 | Gateway (users, sessions, audit, templates, API keys, SAML, SCIM) |
| quality | 44 | 95 | api-quality |
| analytics | 40 | 22 | api-analytics |
| medical | 31 | 44 | api-medical |
| health-safety | 18 | 31 | api-health-safety |
| environment | 25 | 52 | api-environment |
| hr | 27 | 33 | api-hr |
| finance | 27 | 18 | api-finance |
| aerospace | 24 | 54 | api-aerospace |
| automotive | 23 | 26 | api-automotive |
| platform | 23 | 0 | multi-service shared |
| esg | 17 | 18 | api-esg |
| workflows | 17 | 29 | api-workflows |
| crm | 17 | 16 | api-crm |
| emergency | 16 | 10 | api-emergency |
| food-safety | 14 | 22 | api-food-safety |
| infosec | 14 | 26 | api-infosec |
| field-service | 14 | 12 | api-field-service |
| cmms | 16 | 16 | api-cmms |
| payroll | 15 | 20 | api-payroll |
| energy | 12 | 17 | api-energy |
| portal | 12 | 17 | api-portal |
| inventory | 12 | 12 | api-inventory |
| project-management | 16 | 35 | api-project-management |
| chemicals | 9 | 17 | api-chemicals |
| risk | 10 | 16 | api-risk |
| iso42001 | 10 | 18 | api-iso42001 |
| marketing | 13 | 9 | api-marketing |
| marketplace | 4 | 3 | gateway |
| ai | 11 | 11 | api-ai-analysis |
| iso37001 | 7 | 15 | api-iso37001 |
| training | 5 | 5 | api-training |
| assets | 4 | 5 | api-assets |
| documents | 4 | 3 | api-documents |
| complaints | 3 | 4 | api-complaints |
| contracts | 4 | 4 | api-contracts |
| audits | 4 | 4 | api-audits |
| suppliers | 4 | 4 | api-suppliers |
| partner-portal | 4 | 5 | api-partners |
| ptw | 3 | 3 | api-ptw |
| reg-monitor | 3 | 3 | api-reg-monitor |
| wizard | 2 | 2 | api-setup-wizard |
| mgmt-review | 1 | 1 | api-mgmt-review |
| incidents | 1 | 4 | api-incidents |

### 6.2 Core Schema (User & Auth Models)

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String
  firstName     String
  lastName      String
  role          UserRole
  orgId         String?
  isActive      Boolean   @default(true)
  mfaEnabled    Boolean   @default(false)
  lastLoginAt   DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Session {
  id             String   @id @default(cuid())
  userId         String
  refreshToken   String   @unique
  expiresAt      DateTime
  ipAddress      String?
  userAgent      String?
  createdAt      DateTime @default(now())
}

model AuditLog {
  id         String   @id @default(cuid())
  userId     String?
  action     String
  resource   String
  resourceId String?
  details    Json?
  ipAddress  String?
  createdAt  DateTime @default(now())
}

model ApiKey {
  id          String    @id @default(cuid())
  name        String
  keyHash     String    @unique
  keyPrefix   String
  userId      String
  scopes      String[]
  expiresAt   DateTime?
  lastUsedAt  DateTime?
  createdAt   DateTime  @default(now())
}

model SamlConfig { ... }   // SAML 2.0 SSO per org
model ScimToken  { ... }   // SCIM 2.0 provisioning tokens
model ScimUser   { ... }   // SCIM provisioned users
model ScimGroup  { ... }   // SCIM provisioned groups
model MspLink    { ... }   // MSP multi-tenant links
model UnifiedAuditPlan { ... }  // Cross-service audit plans
```

### 6.3 Database Configuration (CRITICAL)

```bash
# Active database connection
Host: localhost (port 5432)
User: postgres
Password: ims_secure_password_2026  # set in .env, NEVER hardcode
Database: ims

# Per-service env var naming
HEALTH_SAFETY_DATABASE_URL=postgresql://postgres:...@localhost:5432/ims?connection_limit=1
ENVIRONMENT_DATABASE_URL=...
QUALITY_DATABASE_URL=...
# (etc. — each service has its OWN named env var, NOT DATABASE_URL)

# Connection pooling
connection_limit=1  # per service, 43+ services × 1 = 43+ connections (within max_connections=100)
```

### 6.4 Safe Schema Migration Process

```bash
# SAFE: Only CREATE statements, no DROP
npx prisma migrate diff \
  --from-empty \
  --to-schema-datamodel=packages/database/prisma/schemas/<domain>.prisma \
  --script | PGPASSWORD=ims_secure_password_2026 psql -h localhost -U postgres -d ims -v ON_ERROR_STOP=0

# Add columns safely (no DROP risk)
ALTER TABLE <table> ADD COLUMN IF NOT EXISTS <col> <type>;

# Extend enum
ALTER TYPE "<EnumName>" ADD VALUE IF NOT EXISTS '<NewValue>';

# Regenerate Prisma client (ALWAYS use 5.22.0)
npx prisma@5.22.0 generate --schema=packages/database/prisma/schemas/<domain>.prisma
# Client generated to: packages/database/generated/<domain>/

# NEVER use: prisma db push (drops other schemas' tables)
# NEVER use: --from-url (may include DROP statements)
```

---

## 7. MODULE-SPECIFIC SOPS

### SOP-QM-001: Creating a Non-Conformance Report (NCR)

**Objective:** Document, investigate, and resolve quality issues
**Standard:** ISO 9001:2015 Clause 10.2
**Trigger:** Any deviation from specification, customer requirement, or QMS procedure

**Step 1 — Initiate NCR**
1. Login → Quality → Non-Conformances → **Create NCR**
2. Select Type: `Product` | `Process` | `System` | `Supplier`
3. Fill mandatory fields:
   - **Title**: Brief description (≤100 chars)
   - **Description**: Full details of what was found
   - **Severity**: `MINOR` | `MAJOR` | `CRITICAL`
   - **Source**: `INTERNAL` | `CUSTOMER` | `SUPPLIER` | `AUDIT`
   - **Date Detected**: (auto-populated, editable)
   - **Department**: Select from list
4. Upload photos/evidence files
5. Set responsible person and target close date

**Step 2 — Investigation**
- Responsible person receives email notification
- Navigate to NCR → **Start Investigation**
- Complete Root Cause Analysis using tool: `5-Why` | `Fishbone` | `8D` | `Is/Is Not`
- Document: Containment action (immediate fix), Root cause, Proposed corrective action

**Step 3 — Approval**
- Submit investigation → Quality Manager notified
- Manager reviews → **Approve** (CAPA auto-created) | **Reject** (returned with comments)

**Step 4 — CAPA Implementation**
- See SOP-QM-002 for CAPA workflow
- Link NCR to CAPA (auto-linked if approved from NCR)

**Step 5 — Verification & Close**
- After corrective action: verify effectiveness (minimum 30 days observation)
- Record evidence of effectiveness
- Close NCR → status: `CLOSED`

**API Calls:**
```bash
POST /api/quality/nonconformances  # Create NCR
GET  /api/quality/nonconformances/:id  # Get NCR
PUT  /api/quality/nonconformances/:id  # Update NCR
POST /api/quality/nonconformances/:id/actions  # Add action
```

---

### SOP-QM-002: CAPA Management

**Objective:** Implement corrective/preventive actions to prevent recurrence
**Standard:** ISO 9001:2015 Clause 10.2

**CAPA Sources:**
- NCR approval (auto-created)
- Audit finding
- Customer complaint
- Management review input
- Risk assessment
- Proactive improvement idea

**Steps:**
1. **Create CAPA** → type: `CORRECTIVE` | `PREVENTIVE` | `IMPROVEMENT`
2. **Define action plan** → tasks, owners, target dates, resources
3. **Implement** → update task progress, upload evidence
4. **Verify effectiveness** → 30-90 day monitoring period
5. **Close** → if effective; or **Reopen** → revise plan if not effective

---

### SOP-QM-003: Document Control

**Objective:** Ensure controlled documents are current and accessible
**Standard:** ISO 9001:2015 Clause 7.5

**Document Lifecycle:**
```
Draft → Review → Approval → Published (Active) → Revision → Obsolete
```

**Creating a Document:**
1. Quality → Documents → **Create Document**
2. Select type: `Policy` | `Procedure` | `Work Instruction` | `Form` | `Specification`
3. Set: Document ID (auto or manual), Title, Owner, Dept, Review date
4. Upload file (PDF/DOCX/XLSX)
5. Submit for approval → reviewer notified
6. On approval: version `1.0`, status: `CONTROLLED`

**Revising a Document:**
1. Open document → **Revise**
2. Upload new version
3. Document revision notes (what changed, why)
4. Version auto-increments: `1.0 → 1.1` (minor) or `2.0` (major)
5. Re-approve → previous version becomes `OBSOLETE` (read-only)

**Access Control:** Documents have permission levels. Restricted docs visible only to assigned roles/departments. Full download audit trail.

---

### SOP-QM-004: Internal Audit Management

**Objective:** Conduct systematic internal audits
**Standard:** ISO 9001:2015 Clause 9.2

**Annual Audit Programme Steps:**
1. Create Annual Audit Schedule (Quality → Audits → Schedule)
2. Per audit: Set scope, criteria, date, lead auditor
3. Notify auditee (auto-email)
4. Conduct audit: record findings (Conformance/Minor NC/Major NC/Observation)
5. Issue draft report → auditee review
6. Finalise report → create CAPAs for NCs
7. Track CAPA closure → audit close-out

---

### SOP-HS-001: Incident Reporting

**Objective:** Report, investigate, and prevent workplace incidents
**Standard:** ISO 45001:2018 Clause 10.2 + RIDDOR 2013

**Incident Types:**
- `ACCIDENT` — Injury or ill health occurred
- `NEAR_MISS` — Almost occurred but no injury
- `DANGEROUS_OCCURRENCE` — Specified dangerous event (RIDDOR reportable)
- `FIRST_AID` — First aid treatment given only

**Steps:**
1. H&S → Incidents → **Report Incident** (within 24 hours)
2. Fill: Date, time, location, persons involved, description, immediate actions taken
3. Select injury type and body part (if injury)
4. System auto-checks RIDDOR reportability:
   - Over-7-day incapacitation → RIDDOR reportable
   - Specified injury → RIDDOR reportable
   - Dangerous occurrence → RIDDOR reportable
5. If RIDDOR reportable: system generates F2508 form for HSE submission
6. Assign investigator → begin investigation (5-Why or Fishbone analysis)
7. Root cause → corrective actions → verify effectiveness

**API Calls:**
```bash
POST /api/incidents/incidents  # Report incident
GET  /api/incidents/riddor     # RIDDOR reportable list
POST /api/incidents/investigation  # Submit investigation
```

---

### SOP-HS-002: Risk Assessment (HIRA)

**Objective:** Identify hazards and assess occupational health and safety risks
**Standard:** ISO 45001:2018 Clause 6.1.2

**Procedure:**
1. H&S → Risk Assessments → **New Assessment**
2. Select: Department, Activity, Work Type
3. Identify hazards (use hazard library or free-text)
4. For each hazard:
   - **Likelihood** (1-5): Very Unlikely → Almost Certain
   - **Severity** (1-5): Negligible → Catastrophic
   - **Risk Score** = Likelihood × Severity
   - If score ≥ 15: `HIGH` risk → immediate action required
5. Define control measures (hierarchy: Eliminate → Substitute → Engineer → Admin → PPE)
6. Re-assess residual risk after controls
7. Assign review date (annual minimum)
8. Get sign-off from responsible manager

---

### SOP-HS-003: Permit to Work (PTW)

**Objective:** Control high-risk work activities
**Standard:** CDM Regulations 2015

**Work Types Requiring PTW:**
- Hot work (welding, grinding, cutting)
- Confined space entry
- Working at height (>2m)
- Electrical isolation
- Excavation work
- Hazardous substances

**PTW Workflow:**
1. PTW → Permits → **Request Permit**
2. Fill: Work description, location, start/end time, workers involved, hazards, controls
3. List required isolations and precautions
4. Submit → Safety Officer reviews
5. Safety Officer approves/rejects (with conditions)
6. On approval: permit issued with reference number
7. Work can commence
8. On completion: permit closed by permit holder
9. Final sign-off by Safety Officer (post-work inspection)

---

### SOP-ENV-001: Environmental Aspects & Impacts

**Objective:** Identify and evaluate significant environmental aspects
**Standard:** ISO 14001:2015 Clause 6.1.2

**Procedure:**
1. Environment → Aspects → **New Aspect**
2. Define: Activity, process or product giving rise to aspect
3. Identify environmental aspect (e.g., energy use, water discharge, waste generation)
4. Identify environmental impact (e.g., climate change, water pollution)
5. Assess significance using scoring matrix:
   - Severity (1-5), Probability (1-5), Duration (1-3), Extent (1-3), Reversibility (1-3), Regulatory concern (0/2), Stakeholder concern (0/2)
   - Formula: `score = severity×1.5 + probability×1.5 + duration + extent + reversibility + regulatory + stakeholder`
   - Score ≥ 15 → **Significant Aspect** (requires objective/target)
6. Set controls and monitoring requirements
7. Review annually or when significant change occurs

---

### SOP-AF-001: Automotive PPAP Submission

**Objective:** Obtain customer approval for new or modified parts
**Standard:** IATF 16949:2016 + AIAG PPAP 4th Edition

**PPAP Submission Levels:**
- Level 1: Part Submission Warrant only
- Level 2: PSW + limited supporting data
- Level 3: PSW + complete supporting data (most common)
- Level 4: PSW + other requirements defined by customer
- Level 5: PSW + parts + complete data — reviewed at supplier

**18 PPAP Elements:**
1. Design Documentation
2. Design FMEA
3. Process Flow Diagram
4. Process FMEA
5. Control Plan
6. Measurement System Analysis (MSA)
7. Dimensional Results
8. Material/Performance Test Results
9. Initial Process Studies (SPC/Cpk)
10. Qualified Laboratory Documentation
11. Appearance Approval Report
12. Sample Production Parts
13. Master Sample
14. Checking Aids
15. Customer-Specific Requirements
16. Part Submission Warrant (PSW)
17. Bulk Material Requirements
18. Records Retention

**Steps:**
1. Automotive → PPAP → **New Submission**
2. Select submission level, part number, revision
3. Complete all 18 elements (upload documents, link data)
4. Submit to customer portal
5. Track status: `SUBMITTED` → `APPROVED` | `REJECTED` | `INTERIM_APPROVAL`

---

### SOP-MD-001: Medical Device Design Control

**Objective:** Manage the design and development process for medical devices
**Standard:** ISO 13485:2016 Clause 7.3, 21 CFR Part 820.30

**Design Control Stages:**
1. **Planning** → design plan, inputs, outputs, verification/validation methods
2. **Design Inputs** → user needs, intended use, performance requirements, safety requirements
3. **Design Outputs** → drawings, specifications, manufacturing procedures
4. **Design Review** → formal review at each stage, multi-disciplinary team
5. **Verification** → objective evidence outputs meet inputs
6. **Validation** → confirms device meets intended use in simulated/actual use
7. **Transfer** → transition from development to production
8. **Changes** → controlled change management with impact assessment
9. **DHF** → Design History File — all records maintained

**Risk Management Integration:**
- ISO 14971 risk analysis at each design stage
- Hazard identification, risk estimation, risk evaluation, risk controls
- Residual risk acceptability criteria

---

### SOP-FS-001: HACCP Plan Development

**Objective:** Identify and control food safety hazards
**Standard:** ISO 22000:2018, Codex Alimentarius HACCP Principles

**7 HACCP Principles:**

**Principle 1 — Hazard Analysis:**
1. Food Safety → HACCP → **New HACCP Plan**
2. Map process flow (receive → store → process → cook → cool → package → ship)
3. For each step, identify hazards: `BIOLOGICAL` | `CHEMICAL` | `PHYSICAL` | `ALLERGEN`
4. Assess significance: severity × likelihood

**Principle 2 — Identify Critical Control Points (CCPs):**
- Use CCP Decision Tree (4 questions)
- Mark each hazard as CCP or OPRP

**Principle 3 — Establish Critical Limits:**
- Set measurable limits (e.g., cook temp ≥ 75°C for 15 seconds)
- Set monitoring frequency

**Principle 4 — Establish Monitoring System:**
- Who monitors, how, when
- Monitoring records linked to each CCP

**Principle 5 — Establish Corrective Actions:**
- For each CCP: what to do when limit exceeded
- Product disposition procedure

**Principle 6 — Establish Verification:**
- Periodic validation of HACCP plan effectiveness
- Review of monitoring records, CCP audits

**Principle 7 — Establish Documentation:**
- All HACCP records stored and retrievable
- 5-year minimum retention (3 years for perishable)

---

### SOP-AE-001: First Article Inspection (FAI)

**Objective:** Verify conformance of first production article
**Standard:** AS9102B Revision B

**FAI Steps:**
1. Aerospace → FAI → **New FAI**
2. Link to part number, revision, manufacturing order
3. Complete three FAI sections:
   - **Section 1:** Design Documentation (drawing, change history)
   - **Section 2:** Product Accounting (part marking, serialization)
   - **Section 3:** Characteristic Accountability (all design characteristics measured)
4. Record actual measurements vs. nominal + tolerance
5. Review with customer if required
6. Approval: `APPROVED` | `APPROVED WITH EXCEPTION` | `REJECTED`
7. Retain FAI documentation with part records

---

### SOP-FIN-001: Month-End Close

**Objective:** Complete monthly financial reporting cycle
**Standard:** UK GAAP / IFRS (as applicable)

**Steps:**
1. Finance → Accounts → **Month-End Checklist**
2. **Day 1-3:** Post all invoices and expenses
3. **Day 4:** Bank reconciliation (all accounts)
4. **Day 5:** Journal entries (accruals, prepayments, depreciation)
5. **Day 6:** Intercompany eliminations (if applicable)
6. **Day 7:** Run Trial Balance, P&L, Balance Sheet
7. **Day 8:** Variance analysis vs. budget
8. **Day 9:** Management accounts pack
9. **Day 10:** Board review and sign-off

---

### SOP-ESG-001: ESG Reporting

**Objective:** Collect, calculate, and report ESG metrics
**Frameworks:** GRI Standards, TCFD, SASB, UN SDGs

**Scope 1/2/3 Emissions Process:**
1. ESG → Emissions → **Add Emissions Data**
2. **Scope 1** (direct): Combustion of fuels (gas, diesel, petrol), process emissions, refrigerant leaks
3. **Scope 2** (indirect, energy): Electricity, heat, steam purchased — use location-based OR market-based
4. **Scope 3** (value chain): Business travel, commuting, purchased goods, supply chain, waste, water
5. Apply DEFRA emission factors (auto-populated by `@ims/emission-factors`)
6. Calculate: Activity Data × Emission Factor = tCO₂e
7. Review dashboard: Scope breakdown, year-on-year trends
8. Generate report: ESG → Reports → **Generate GRI/TCFD Report**

---

### SOP-SEC-001: Security Incident Response

**Objective:** Respond to information security incidents
**Standard:** ISO 27001:2022 Clause 6.1.3

**Severity Classification:**
- **P1 Critical:** Data breach, ransomware, complete system compromise
- **P2 High:** Unauthorized access, malware detected, significant data loss
- **P3 Medium:** Phishing attempt (successful), vulnerability exploitation
- **P4 Low:** Failed login attempts, suspicious activity

**Response Steps:**
1. InfoSec → Incidents → **Report Security Incident**
2. Classify severity, contain immediately (isolate affected systems)
3. Notify: CISO (P1/P2 within 1 hour), DPO (if personal data breach)
4. For personal data breach: GDPR 72-hour notification window to ICO starts now
5. Evidence collection: logs, forensic snapshots
6. Root cause investigation
7. Remediation and recovery
8. Post-incident review (within 5 business days)
9. Lessons learned → update controls

---

### SOP-RISK-001: Enterprise Risk Management

**Objective:** Identify, assess, and manage enterprise risks
**Standard:** ISO 31000:2018

**Risk Assessment Process:**
1. Risk → Risks → **New Risk**
2. Define: Risk title, description, category, owner
3. Assess **inherent risk** (before controls):
   - Likelihood (1-5): Rare → Almost Certain
   - Impact (1-5): Negligible → Catastrophic
   - Inherent score = Likelihood × Impact
4. Document existing controls
5. Assess **residual risk** (after controls)
6. If residual score ≥ 15: risk **appetite exceeded** → treatment required
7. Select treatment: `AVOID` | `REDUCE` | `TRANSFER` | `ACCEPT`
8. Assign treatment actions with owners and dates
9. Review quarterly (minimum)
10. View Bow-Tie analysis (Risk → Bowtie → select risk)

---

### SOP-CHEM-001: COSHH Assessment

**Objective:** Assess and control exposure to hazardous substances
**Standard:** COSHH Regulations 2002

**Steps:**
1. Chemicals → COSHH → **New Assessment**
2. Link to chemical from inventory (SDS auto-populated)
3. Describe: work activity, who is exposed, how often, duration
4. Identify hazards from SDS (H-statements)
5. Assess exposure route: `INHALATION` | `SKIN_CONTACT` | `INGESTION` | `INJECTION`
6. Compare against WEL (Workplace Exposure Limit) if applicable
7. Select control measures (hierarchy: substitute → enclose → LEV → PPE)
8. Set monitoring requirements (if WEL-relevant)
9. Health surveillance requirements (if applicable)
10. Review date (minimum annual or on change)

---

## 8. API REFERENCE

### 8.1 Authentication Endpoints

```
POST   /api/auth/login                 # Authenticate user
POST   /api/auth/logout                # Invalidate token
POST   /api/auth/refresh               # Refresh access token
POST   /api/auth/register              # Register new user
POST   /api/auth/forgot-password       # Initiate password reset
POST   /api/auth/reset-password        # Complete password reset
POST   /api/auth/verify-email          # Email verification
POST   /api/auth/mfa/setup             # Setup MFA (TOTP)
POST   /api/auth/mfa/verify            # Verify MFA code
POST   /api/auth/magic-link            # Request magic link
GET    /api/auth/me                    # Get current user profile
PUT    /api/auth/me                    # Update profile
```

**Login Request:**
```json
POST /api/auth/login
{
  "email": "admin@ims.local",
  "password": "admin123"
}
```

**Login Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJ...",
    "expiresIn": 900,
    "user": {
      "id": "clx...",
      "email": "admin@ims.local",
      "firstName": "Admin",
      "lastName": "User",
      "role": "SYSTEM_ADMIN"
    }
  }
}
```

### 8.2 Standard CRUD Pattern

All resources follow consistent REST patterns:

```
GET    /api/<module>/<resource>           # List (paginated)
POST   /api/<module>/<resource>           # Create
GET    /api/<module>/<resource>/:id       # Get by ID
PUT    /api/<module>/<resource>/:id       # Full update
PATCH  /api/<module>/<resource>/:id       # Partial update
DELETE /api/<module>/<resource>/:id       # Delete (soft or hard)
GET    /api/<module>/<resource>/stats     # Statistics
GET    /api/<module>/<resource>/export    # Export (CSV/PDF)
```

**Pagination Parameters:**
```
?page=1&limit=20&sortBy=createdAt&sortOrder=desc&search=term
```

**Pagination Response:**
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

### 8.3 Authorization Headers

```http
Authorization: Bearer <JWT_access_token>
Content-Type: application/json
X-Correlation-ID: <uuid>  (auto-injected by gateway)
```

### 8.4 Error Response Codes

| Code | Meaning | Common Cause |
|------|---------|--------------|
| 400 | Bad Request | Validation error (Zod schema) |
| 401 | Unauthorized | Missing or invalid JWT |
| 403 | Forbidden | Insufficient RBAC permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate unique constraint (Prisma P2002) |
| 422 | Unprocessable | Business logic violation |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Unhandled exception |
| 503 | Service Unavailable | Circuit breaker OPEN |

### 8.5 Quality Module API Examples

```bash
# List NCRs
GET /api/quality/nonconformances?page=1&limit=20&severity=MAJOR

# Create NCR
POST /api/quality/nonconformances
{
  "title": "Dimensional defect on Part A",
  "description": "Part outside tolerance on diameter",
  "severity": "MAJOR",
  "source": "INTERNAL",
  "departmentId": "dept-123"
}

# Create CAPA
POST /api/quality/capa
{
  "title": "Prevent dimensional defects",
  "type": "CORRECTIVE",
  "priority": "HIGH",
  "ncrId": "ncr-uuid",
  "targetDate": "2026-03-21"
}

# List risk register
GET /api/quality/risk-register

# Get audit details
GET /api/quality/audits/uuid-123
```

---

## 9. DEPLOYMENT PROCEDURES

### 9.1 Local Development Setup

**Prerequisites:**
```
Node.js >= 20.0.0
pnpm >= 9.0.0
Docker + Docker Compose
PostgreSQL 16 (via Docker)
Redis 7 (via Docker)
```

**Steps:**
```bash
# 1. Clone and install
cd /home/dyl/New-BMS
pnpm install

# 2. Start infrastructure
docker compose up -d postgres redis

# 3. Set environment variables
cp apps/api-gateway/.env.example apps/api-gateway/.env
# Edit each service's .env file with DB password, JWT secret, etc.

# 4. Seed database
./scripts/seed-all.sh

# 5. Start all 88 services (43 API + api-search + 44 web)
./scripts/start-all-services.sh

# 6. Check health
./scripts/check-services.sh

# 7. Full startup (handles port conflicts, Docker issues)
./scripts/startup.sh
```

### 9.2 Service Start/Stop Commands

```bash
# Start individual API service
cd apps/api-quality && npx tsx src/index.ts &

# Start individual web app
cd apps/web-quality && pnpm dev &

# Stop all services
./scripts/stop-all-services.sh

# Pre-launch validation (111 checks)
./scripts/pre-launch-check.sh

# Backup database
./scripts/backup-db.sh
```

### 9.3 Port Conflict Resolution

```bash
# Clear Redis rate limit state (if Redis conflicts)
DOCKER_API_VERSION=1.41 docker exec ims-redis redis-cli -a <REDIS_PASSWORD> FLUSHALL

# Kill processes on specific port
sudo fuser -k 4001/tcp

# Stop host PostgreSQL/Redis (free ports for Docker)
sudo systemctl stop postgresql redis 2>/dev/null
sudo fuser -k 5432/tcp 6379/tcp 2>/dev/null
```

### 9.4 Environment Variables Reference

**Gateway `.env` (critical settings):**
```ini
PORT=4000
NODE_ENV=development
JWT_SECRET=<strong-256-bit-secret>       # MUST match all services
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
DATABASE_URL=postgresql://postgres:ims_secure_password_2026@localhost:5432/ims?connection_limit=1
REDIS_URL=redis://:${REDIS_PASSWORD}@localhost:6379
CSRF_ENABLED=false                        # Development; enable in production
SENTRY_DSN=                              # Fill with real DSN pre-launch
SENTRY_TRACES_SAMPLE_RATE=0.1
# Service URLs (one per downstream service)
SERVICE_HEALTH_SAFETY_URL=http://localhost:4001
SERVICE_ENVIRONMENT_URL=http://localhost:4002
# ... (42 total)
```

**Do NOT set `CORS_ORIGIN=` in gateway .env** — it overrides the built-in allowed-origins array and breaks all cross-origin requests.

### 9.5 Kubernetes Production Deployment

```bash
# Production overlay
kubectl apply -k k8s/overlays/production/

# Check deployment status
kubectl get pods -n ims-production

# View logs
kubectl logs -f deployment/api-gateway -n ims-production

# Enable OpenTelemetry (production)
OTEL_TRACING_ENABLED=true  # set in production overlay
```

### 9.6 Docker Compose (Development)

```bash
# Start infrastructure only
docker compose up -d postgres redis backup

# Full stack (infrastructure + monitoring)
docker compose -f docker-compose.yml -f docker-compose.monitoring.yml up -d

# With Vault (secrets management)
docker compose -f docker-compose.yml -f docker-compose.vault.yml up -d

# Check logs
docker compose logs -f postgres
DOCKER_API_VERSION=1.41 docker exec ims-postgres psql -U postgres -d ims -c "\dt" | head -20
```

---

## 10. MONITORING & OPERATIONS

### 10.1 Health Checks

All services expose:
```
GET /health
```

Response:
```json
{
  "status": "healthy",
  "service": "api-quality",
  "version": "1.0.0",
  "uptime": 3600,
  "timestamp": "2026-02-21T12:00:00.000Z",
  "dependencies": {
    "database": "connected",
    "redis": "connected"
  }
}
```

Check all 43+ services:
```bash
./scripts/check-services.sh
# or individually:
curl -s http://localhost:4003/health | jq .
```

### 10.2 Prometheus Metrics

All services expose:
```
GET /metrics
```

**Key Metrics:**
```
http_requests_total{method, route, status_code, service}
http_request_duration_seconds{quantile, method, route, service}
auth_failures_total{reason, service}
rate_limit_exceeded_total{limiter, service}
prisma_query_duration_seconds{operation, model}
```

**Alerting Rules** (configured in `monitoring/prometheus/alerts.yml`):
- `HighErrorRate`: >5% 5xx responses over 5min
- `HighLatency`: p95 >500ms over 5min
- `ServiceDown`: Health check failing >1min
- `HighAuthFailures`: >10 auth failures/min

### 10.3 Logging

All services use `createLogger(service)` from `@ims/monitoring`:

```typescript
const logger = createLogger('api-quality');
logger.info('NCR created', { ncrId, userId, orgId });
logger.error('Database error', { error, stack });
logger.warn('Rate limit approaching', { ip, count });
```

Log format: JSON, includes `correlationId`, `service`, `timestamp`, `level`.

### 10.4 Pre-Launch Validation

```bash
./scripts/pre-launch-check.sh
# Runs 111 checks:
# - All 43 API services + api-search healthy
# - All 44 web apps running
# - JWT secret configured
# - Database connected
# - Redis connected
# - Audit trail enabled
# - 41 expected warnings (NODE_ENV, SENTRY_DSN, web apps in dev)
```

### 10.5 Database Backup & Restore

```bash
# Backup (runs daily automatically via Docker)
./scripts/backup-db.sh
# Backups stored in ./backups/

# Restore (test procedure)
./scripts/test-backup-restore.sh
# Creates ims_restore_test database, validates integrity (7-step check)

# Manual restore
PGPASSWORD=ims_secure_password_2026 psql -h localhost -U postgres -d ims < backup.sql
```

---

## 11. SECURITY PROCEDURES

### 11.1 Authentication & Authorization

**JWT Configuration:**
- Access token: 15 minutes expiry (HS256 or RS256 with key rotation)
- Refresh token: 7 days expiry, stored hashed in DB
- Key rotation: `jwtKeyManager.rotateKey()` — new tokens use new key, old tokens still verified during transition
- Account lockout: 5 failed attempts → 15-minute lockout (Redis sliding window)
- Adaptive risk scoring: assesses IP, device fingerprint, geo-location, time

**RBAC — 39 Platform Roles:**
- `SYSTEM_ADMIN` — Full platform access
- `TENANT_ADMIN` — Full org access
- Domain managers: `QUALITY_MANAGER`, `ENV_MANAGER`, `HSE_MANAGER`, `FINANCE_MANAGER`, etc.
- Domain officers/engineers (read-write, no admin)
- `AUDITOR` — Read-only, cross-domain
- `VIEWER` — Read-only
- Plus custom roles via `CustomRole` model in core schema

**17 Permission Modules × 7 Permission Levels:**
```
NONE → VIEW → CREATE → EDIT → DELETE → APPROVE → ADMIN
```

### 11.2 RASP (Runtime Application Self-Protection)

The `@ims/security` RASP middleware blocks at runtime:
```typescript
createRasp({
  threats: ['sql', 'xss', 'command', 'path', 'ldap'],
  onThreat: (threat) => { logger.error('RASP blocked', threat); },
  monitorOnly: false
})
```

**Detection patterns:**
- SQL injection: `'; DROP TABLE`, `' OR '1'='1`, `UNION SELECT`, etc.
- XSS: `<script>`, `javascript:`, `onerror=`, etc.
- Command injection: `; ls -la`, `| cat /etc/passwd`, backticks
- Path traversal: `../../../etc/passwd`, URL-encoded variants
- LDAP injection: `*)(uid=*)`, `\00`

### 11.3 SIEM Event Correlation

```typescript
// 6 built-in detection rules:
// 1. BruteForce: ≥5 failed logins/5min from same IP
// 2. AccountTakeover: login from unusual geo after password change
// 3. DataExfiltration: high-volume data requests
// 4. PrivilegeEscalation: unusual admin operations
// 5. APIAbuse: >100 requests/min from single user
// 6. SuspiciousAgent: known bad user agents
```

### 11.4 Data Protection

- **Encryption at rest:** PostgreSQL TDE (production)
- **Envelope encryption:** `@ims/security` DEK/KEK pattern for PII fields
- **Encryption in transit:** TLS 1.2+ (HTTPS enforced in production)
- **GDPR compliance:** DSAR workflow, right to erasure, data retention policies
- **Audit trail:** Immutable audit log (`EnhancedAuditTrail` model) for all CRUD operations
- **Electronic signatures:** 21 CFR Part 11 compliant (tamper-evident, non-repudiation)

### 11.5 Security Controls Checklist

- OWASP ZAP DAST scanning (`.github/workflows/security.yml`)
- Dependency audit (`pnpm audit`)
- SBOM generation
- IP allowlist (per-org)
- API rate limiting (Redis-backed, persistent)
- CSRF protection (cookie-based in production)
- Content Security Policy (via Helmet)
- Secrets management (`@ims/secrets`, Vault integration)
- `.zap/rules.tsv` — false positive suppressions

### 11.6 Penetration Testing Procedures

1. Obtain written authorization from system owner
2. Define scope: in-scope URLs/IPs, excluded systems
3. Run OWASP ZAP baseline scan: `docker run -t owasp/zap2docker-stable zap-baseline.py -t <url>`
4. Review findings against `.zap/rules.tsv` suppressions
5. Create `InfoSec → Security Incidents` for all findings P1-P3
6. Re-test after remediation
7. Issue penetration test report

---

## 12. TROUBLESHOOTING GUIDE

### 12.1 Service Won't Start

```bash
# Check port availability
ss -tlnp | grep 4003

# Check logs
cd apps/api-quality && npx tsx src/index.ts 2>&1 | head -50

# Common causes:
# 1. Port already in use → fuser -k <port>/tcp
# 2. Missing .env file → cp .env.example .env
# 3. Database connection failed → check DATABASE_URL
# 4. JWT_SECRET missing → add to .env
# 5. Prisma client not generated → npx prisma@5.22.0 generate --schema=...
```

### 12.2 JWT Token Invalid (TOKEN_INVALID)

**Root cause:** `JWT_SECRET` mismatch between gateway and downstream service.

```bash
# Verify all services use same secret
grep "JWT_SECRET" apps/api-gateway/.env apps/api-quality/.env

# They MUST match — correct secret is in root .env
# Copy from root .env to all service .env files
```

### 12.3 Database Connection Failed

```bash
# Test connection
PGPASSWORD=ims_secure_password_2026 psql -h localhost -p 5432 -U postgres -d ims -c "SELECT 1"

# Check Docker container
DOCKER_API_VERSION=1.41 docker ps | grep postgres

# Common fixes:
# - Stop host postgres: sudo systemctl stop postgresql
# - Free port: sudo fuser -k 5432/tcp
# - Restart container: docker compose restart postgres
```

### 12.4 Redis Rate Limit Stuck

```bash
# Clear all rate limit state
DOCKER_API_VERSION=1.41 docker exec ims-redis redis-cli -a <REDIS_PASSWORD> FLUSHALL

# Inspect specific key
DOCKER_API_VERSION=1.41 docker exec ims-redis redis-cli -a <REDIS_PASSWORD> KEYS "rate:*"
```

### 12.5 Frontend 401 / API Errors

```bash
# Check localStorage token
# In browser console:
localStorage.getItem('token')

# Re-authenticate:
# 1. Navigate to /login
# 2. Login with admin@ims.local / admin123
# 3. Token stored automatically

# Check API URL config
cat apps/web-quality/.env.local
# NEXT_PUBLIC_API_URL should be http://localhost:4000
```

### 12.6 Prisma Migration Fails

```bash
# Safe approach (CREATE only, no DROP):
npx prisma migrate diff \
  --from-empty \
  --to-schema-datamodel=packages/database/prisma/schemas/quality.prisma \
  --script > /tmp/migrate.sql

# Review SQL before applying:
cat /tmp/migrate.sql | grep -i "DROP"  # Should be empty

# Apply:
PGPASSWORD=ims_secure_password_2026 psql -h localhost -U postgres -d ims < /tmp/migrate.sql
```

### 12.7 Circuit Breaker Open (503)

```bash
# Circuit breaker resets automatically after resetTimeout (30s default)
# Check circuit breaker state via metrics:
curl http://localhost:4000/metrics | grep circuit_breaker

# Force reset (if needed):
# 1. Fix the downstream service health issue
# 2. Wait for resetTimeout, or restart gateway
```

### 12.8 CORS Errors

```bash
# Check gateway CORS config
grep "CORS_ORIGIN" apps/api-gateway/.env
# Should NOT have CORS_ORIGIN set (must be empty or absent)

# Verify downstream services use:
# cors({ origin: true, credentials: true })

# Gateway must have CORS as FIRST middleware before Helmet
```

### 12.9 Test Failures

```bash
# Run all tests
pnpm test

# Run specific service tests
cd apps/api-quality && pnpm test

# Run with verbose output
pnpm test --verbose

# Common fixes:
# 1. UUID validation: use '00000000-0000-0000-0000-000000000001' format
# 2. Prometheus mock: add authFailuresTotal + rateLimitExceededTotal to @ims/monitoring mock
# 3. Prisma mock: target '../src/prisma' not '@ims/database'
# 4. Modal prop: isOpen not open
```

---

## 13. DEVELOPMENT GUIDELINES

### 13.1 Code Standards

- **Language:** TypeScript strict mode (`"strict": true`)
- **No `as any`:** Zero `as any` in production code — use proper type guards and Prisma types
- **Error handling:** All services use `errorHandler()` from `@ims/shared`
- **Async:** Always use `async/await`, never raw `.then()/.catch()` chains
- **Validation:** All inputs validated with Zod schemas at route entry
- **Logging:** Use `createLogger(service)` — never `console.log` in production

### 13.2 Adding a New API Endpoint

```typescript
// 1. Define Zod schema
const createItemSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
});

// 2. Route handler
router.post('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createItemSchema.parse(req.body);
    const item = await prisma.item.create({ data });
    res.json({ success: true, data: item });
  } catch (error) {
    next(error);  // errorHandler() catches and formats
  }
});
```

### 13.3 Adding a New Service

1. Create `apps/api-<name>/` directory
2. Copy structure from an existing service (`apps/api-assets/` is simplest)
3. Update `package.json` with service name and port
4. Create `.env` file with required variables
5. Add Prisma schema to `packages/database/prisma/schemas/<name>.prisma`
6. Generate Prisma client: `npx prisma@5.22.0 generate --schema=...`
7. Create `src/prisma.ts` re-exporting domain client
8. Register proxy in gateway `src/index.ts`
9. Add port to gateway `.env` as `SERVICE_<NAME>_URL`
10. Write test file in `apps/api-<name>/__tests__/`
11. Add to `jest.config.js` projects list

### 13.4 Prisma Client Pattern

```typescript
// src/prisma.ts (each service)
export { prisma } from '@ims/database/<domain>';

// Route file
import { prisma } from '../prisma';

// Test file (CORRECT mock target)
jest.mock('../src/prisma', () => ({
  prisma: {
    item: {
      findMany: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    }
  }
}));
```

### 13.5 RBAC Pattern

```typescript
// Protect route with permission check
import { requirePermission } from '@ims/rbac';

router.get('/',
  authenticate,
  requirePermission('quality', 'VIEW'),
  async (req, res, next) => { ... }
);

router.post('/',
  authenticate,
  requirePermission('quality', 'CREATE'),
  async (req, res, next) => { ... }
);

router.delete('/:id',
  authenticate,
  requirePermission('quality', 'DELETE'),
  async (req, res, next) => { ... }
);
```

### 13.6 Git Workflow

```bash
# Feature development
git checkout -b feature/<description>

# Commit style
git commit -m "feat(quality): add FMEA export endpoint"
git commit -m "fix(gateway): correct CORS middleware ordering"
git commit -m "test(health-safety): expand incident route coverage"
git commit -m "docs: update API reference for medical module"

# Main branch: feature/100-percent-score (current)
# Production branch: main
```

---

## 14. TESTING PROCEDURES

### 14.1 Unit Testing

**Framework:** Jest + ts-jest + Supertest

```bash
# Run all tests
pnpm test

# Run specific suite
cd apps/api-quality && pnpm test

# Run with coverage
pnpm test --coverage

# Run single file
pnpm test -- --testPathPattern="nonconformances"

# Watch mode (development)
pnpm test --watch
```

**Current Status:** ~1,202,000 tests / ~1,084 suites / 438 projects — ALL PASSING

**Test Structure:**
```typescript
import request from 'supertest';
import express from 'express';

// Mock dependencies
jest.mock('../src/prisma', () => ({
  prisma: { ncr: { findMany: jest.fn() } }
}));

jest.mock('@ims/auth', () => ({
  authenticate: (req, res, next) => {
    req.user = { id: 'user-1', email: 'test@test.com', role: 'QUALITY_MANAGER' };
    next();
  }
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn() }),
  metricsMiddleware: (req, res, next) => next(),
  authFailuresTotal: { inc: jest.fn() },
  rateLimitExceededTotal: { inc: jest.fn() },
}));

describe('NCR Routes', () => {
  it('GET / returns paginated NCRs', async () => {
    (prisma.ncr.findMany as jest.Mock).mockResolvedValue([{ id: '1', title: 'Test NCR' }]);
    const res = await request(app).get('/').set('Authorization', 'Bearer test');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });
});
```

### 14.2 Integration Testing

```bash
# All modules
./scripts/test-all-modules.sh   # 9 modules, ~465+ assertions

# Individual modules
./scripts/test-hs-modules.sh     # H&S (~70 assertions)
./scripts/test-env-modules.sh    # Environment (~60)
./scripts/test-quality-modules.sh # Quality (~80)
./scripts/test-hr-modules.sh     # HR (~50)
./scripts/test-payroll-modules.sh # Payroll (~40)
./scripts/test-inventory-modules.sh # Inventory (~40)
./scripts/test-workflows-modules.sh # Workflows (~40)
./scripts/test-pm-modules.sh     # PM (~45)
./scripts/test-finance-modules.sh # Finance (~40)
```

### 14.3 Load Testing (k6)

```bash
# Prerequisites: k6 installed
# Scenarios in tests/load/scenarios/

# Baseline test
k6 run tests/load/scenarios/baseline.js

# Stress test
k6 run tests/load/scenarios/stress.js

# Soak test (24h endurance)
k6 run tests/load/scenarios/soak.js

# Spike test
k6 run tests/load/scenarios/spike.js

# Thresholds (must pass):
# - errors: <5%
# - http_req_failed: <5%
# - p95 < 500ms (pagination)
# - p95 < 1000ms (bulk operations)
# - p95 < 300ms (filtered queries)
```

### 14.4 E2E Testing (Playwright)

```bash
# 48 spec files, 195 tests covering all 44 modules
npx playwright test

# Run specific module
npx playwright test tests/e2e/quality.spec.ts

# With UI
npx playwright test --ui
```

### 14.5 TypeScript Checks

```bash
# Check all services (no errors expected)
for dir in apps/api-*/ apps/web-*/; do
  npx tsc -p "$dir/tsconfig.json" --noEmit 2>&1 | grep "error TS" | head -5
done

# Check specific service
cd apps/api-quality && npx tsc --noEmit
```

### 14.6 Security Testing

```bash
# OWASP ZAP baseline (runs in CI via .github/workflows/security.yml)
docker run -t owasp/zap2docker-stable \
  zap-baseline.py -t http://localhost:4000 \
  -c .zap/rules.tsv

# Dependency audit
pnpm audit

# Check for known vulnerabilities
pnpm audit --audit-level=high
```

---

## APPENDIX A: SCRIPTS REFERENCE

| Script | Purpose |
|--------|---------|
| `./scripts/startup.sh` | Full system startup (handles port conflicts, Docker, seeds) |
| `./scripts/start-all-services.sh` | Start all 88 services (43 API + api-search + 44 web) |
| `./scripts/stop-all-services.sh` | Gracefully stop all services |
| `./scripts/check-services.sh` | Health check all 51+ services |
| `./scripts/pre-launch-check.sh` | 111-point pre-launch validation |
| `./scripts/seed-all.sh` | Seed all database schemas with initial data |
| `./scripts/backup-db.sh` | Backup PostgreSQL database |
| `./scripts/test-backup-restore.sh` | 7-step backup restore validation |
| `./scripts/test-all-modules.sh` | Run all integration tests |
| `./scripts/create-db-users.sql` | Create per-service PostgreSQL roles (run first in prod) |
| `./scripts/enable-rls.sql` | Enable RLS on all 674 tables (idempotent) |
| `./scripts/generate-review-report.ts` | Generate Full System Review Word report |

---

## APPENDIX B: KEY FILE PATHS

| Path | Purpose |
|------|---------|
| `apps/api-gateway/src/index.ts` | Gateway entry point, all proxy routing |
| `apps/api-gateway/src/routes/auth.ts` | Authentication routes |
| `packages/database/prisma/schemas/` | All 44 Prisma schemas |
| `packages/database/generated/` | Generated Prisma clients (per domain) |
| `packages/ui/src/modal.tsx` | UI Modal component (use `isOpen` prop) |
| `packages/monitoring/src/metrics.ts` | All Prometheus metrics |
| `packages/rbac/src/roles.ts` | 39 RBAC role definitions |
| `packages/security/src/rasp.ts` | RASP injection detection |
| `packages/auth/src/jwt.ts` | JWT utilities |
| `packages/shared/src/index.ts` | Shared middleware and utilities |
| `packages/templates/src/` | 192 document templates (34 modules) |
| `docker-compose.yml` | Infrastructure (postgres, redis, backup) |
| `docker-compose.monitoring.yml` | Prometheus, Grafana, alertmanager |
| `docker-compose.vault.yml` | HashiCorp Vault secrets management |
| `.github/workflows/ci.yml` | CI pipeline |
| `.github/workflows/security.yml` | OWASP ZAP + SBOM + dependency audit |
| `k8s/overlays/production/` | Kubernetes production configuration |
| `docs/LAUNCH_READINESS_FINAL_REPORT.md` | Launch readiness: 70/111 PASSED |
| `docs/CODE_EVALUATION_REPORT.md` | Code evaluation: 100/100 |
| `docs/DATABASE_SCHEMA_NOTES.md` | Schema recreation and migration notes |
| `docs/API_REFERENCE.md` | Detailed API reference (all services) |
| `docs/SECURITY.md` | Security implementation details |
| `SYSTEM_STATE.md` | Single source of truth for all services |
| `QUICK_REFERENCE.md` | Quick reference card |

---

## APPENDIX C: TEST CREDENTIALS

| Role | Email | Password | Access |
|------|-------|----------|--------|
| System Admin | admin@ims.local | admin123 | Full platform |
| Quality Manager | quality@ims.local | test123 | Quality module |
| H&S Manager | hse@ims.local | test123 | H&S module |
| Environmental Manager | env@ims.local | test123 | Environment module |

**Note:** Change all passwords before production deployment.

---

## APPENDIX D: DOCKER COMMANDS REFERENCE

```bash
# All docker exec commands MUST use DOCKER_API_VERSION=1.41
export DOCKER_API_VERSION=1.41

# PostgreSQL queries
docker exec ims-postgres psql -U postgres -d ims -c "SELECT count(*) FROM pg_tables WHERE schemaname='public'"

# Redis inspection
docker exec ims-redis redis-cli -a <REDIS_PASSWORD> INFO keyspace

# Container status
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# View PostgreSQL table list
docker exec ims-postgres psql -U postgres -d ims -c "\dt" | wc -l
```

---

*Document generated: February 21, 2026*
*Platform version: 1.0.0 (feature/100-percent-score branch)*
*Score: 100/100 — Security: 100 | Architecture: 100 | Code Quality: 100*
