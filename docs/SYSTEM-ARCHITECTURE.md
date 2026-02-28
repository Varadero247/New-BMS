# IMS System Architecture Documentation

---
> **CONFIDENTIAL — TRADE SECRET**
> This document is the property of Nexara DMCC and contains confidential and
> proprietary information. Unauthorised disclosure is prohibited.
> © 2026 Nexara DMCC. All rights reserved.
---


## Overview

The Integrated Management System (IMS) is a comprehensive microservices-based platform for managing organizational compliance across multiple ISO standards (ISO 9001, ISO 14001, ISO 45001). The system consists of 89 services: 43 backend APIs and 45 frontend web applications, plus 1 main API.

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                                    Web Applications (26)                                   │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐                │
│  │Dashboard│ │Health   │ │Environ- │ │Quality  │ │Settings │ │Inventory│                │
│  │  :3000  │ │Safety   │ │ment     │ │  :3003  │ │  :3004  │ │  :3005  │                │
│  └─────────┘ │  :3001  │ │  :3002  │ └─────────┘ └─────────┘ └─────────┘                │
│              └─────────┘ └─────────┘                                                     │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐                │
│  │   HR    │ │ Payroll │ │Workflows│ │Proj Mgmt│ │Automotve│ │ Medical │                │
│  │  :3006  │ │  :3007  │ │  :3008  │ │  :3009  │ │  :3010  │ │  :3011  │                │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘                │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐                │
│  │Aerospace│ │ Finance │ │  CRM    │ │ InfoSec │ │  ESG    │ │  CMMS   │                │
│  │  :3012  │ │  :3013  │ │  :3014  │ │  :3015  │ │  :3016  │ │  :3017  │                │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘                │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐                │
│  │Customer │ │Supplier │ │Food     │ │ Energy  │ │Analytics│ │Field    │                │
│  │Portal   │ │Portal   │ │Safety   │ │  :3021  │ │  :3022  │ │Service  │                │
│  │  :3018  │ │  :3019  │ │  :3020  │ └─────────┘ └─────────┘ │  :3023  │                │
│  └─────────┘ └─────────┘ └─────────┘                         └─────────┘                │
│  ┌─────────┐ ┌─────────┐                                                                │
│  │ISO 42001│ │ISO 37001│                                                                │
│  │  :3024  │ │  :3025  │                                                                │
│  └─────────┘ └─────────┘                                                                │
└──────────────────────────────────────────────────────────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                                  API Gateway (:4000)                                      │
│  ┌────────────────────────────────────────────────────────────────────────────────────┐  │
│  │  • Authentication & Authorization (JWT + RBAC)                                      │  │
│  │  • Rate Limiting (100 req/15min)                                                    │  │
│  │  • Request Routing & Proxying                                                       │  │
│  │  • CORS Configuration                                                               │  │
│  │  • Monitoring: /health, /metrics                                                    │  │
│  └────────────────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                                  Domain Services (25)                                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │
│  │Health-Safety│ │ Environment │ │   Quality   │ │ AI Analysis │ │  Inventory  │        │
│  │   :4001     │ │   :4002     │ │   :4003     │ │   :4004     │ │   :4005     │        │
│  │  ISO 45001  │ │  ISO 14001  │ │  ISO 9001   │ │   OpenAI    │ │   Stock     │        │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │
│  │     HR      │ │   Payroll   │ │  Workflows  │ │  Proj Mgmt  │ │ Automotive  │        │
│  │   :4006     │ │   :4007     │ │   :4008     │ │   :4009     │ │   :4010     │        │
│  │  Employees  │ │   Salary    │ │  Approvals  │ │   PMBOK     │ │ IATF 16949  │        │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │
│  │   Medical   │ │  Aerospace  │ │   Finance   │ │     CRM     │ │   InfoSec   │        │
│  │   :4011     │ │   :4012     │ │   :4013     │ │   :4014     │ │   :4015     │        │
│  │  ISO 13485  │ │  AS9100D    │ │  Accounting │ │  Customers  │ │  ISO 27001  │        │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │
│  │     ESG     │ │    CMMS     │ │   Portal    │ │ Food Safety │ │   Energy    │        │
│  │   :4016     │ │   :4017     │ │   :4018     │ │   :4019     │ │   :4020     │        │
│  │  Reporting  │ │ Maintenance │ │  Multi-org  │ │ HACCP/22000 │ │  ISO 50001  │        │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                                       │
│  │  Analytics  │ │Field Service│ │  ISO 42001  │ ┌─────────────┐                        │
│  │   :4021     │ │   :4022     │ │   :4023     │ │  ISO 37001  │                        │
│  │  Dashboards │ │  Mobile Ops │ │AI Management│ │   :4024     │                        │
│  └─────────────┘ └─────────────┘ └─────────────┘ │ Anti-Bribery│                        │
│                                                   └─────────────┘                        │
└──────────────────────────────────────────────────────────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                                     Data Layer                                            │
│  ┌────────────────────────────────────────────────────────────────────────────────────┐  │
│  │                         PostgreSQL Database (:5432)                                  │  │
│  │                    Prisma ORM (20+ domain schemas)                                  │  │
│  └────────────────────────────────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────────────────────────────────┐  │
│  │                            Redis (:6379)                                            │  │
│  │                    Caching, Sessions, Rate Limiting                                 │  │
│  └────────────────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

## Service Details

### API Services

| Service                | Port | Description                         | Key Features                                                                                                                                                                                                                            |
| ---------------------- | ---- | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **API Gateway**        | 4000 | Central entry point                 | Auth, routing, rate limiting, proxying                                                                                                                                                                                                  |
| **Health & Safety**    | 4001 | ISO 45001 compliance                | Risk assessments, incidents, safety training                                                                                                                                                                                            |
| **Environment**        | 4002 | ISO 14001 compliance                | Aspects & Impacts, Events, Legal Register, Objectives, Actions, CAPA (6 modules, 11 DB tables)                                                                                                                                          |
| **Quality**            | 4003 | ISO 9001 compliance                 | 18 Qual-prefixed models, 15 API routes: Parties, Issues, Risks, Opportunities, Processes, NCRs, Actions, Documents, CAPA (5-Why/Fishbone/8D), Legal, FMEA (RPN calc), Improvements (PDCA), Suppliers (IMS scoring), Changes, Objectives |
| **AI Analysis**        | 4004 | AI-powered insights                 | OpenAI integration, trend analysis                                                                                                                                                                                                      |
| **Inventory**          | 4005 | Stock management                    | Products, warehouses, transactions                                                                                                                                                                                                      |
| **HR**                 | 4006 | Human resources                     | Employees, attendance, recruitment                                                                                                                                                                                                      |
| **Payroll**            | 4007 | Payroll processing                  | Salaries, benefits, expenses                                                                                                                                                                                                            |
| **Workflows**          | 4008 | Process automation                  | Approvals, task management                                                                                                                                                                                                              |
| **Project Management** | 4009 | PMBOK/ISO 21502 compliance          | 14 models, 12 API routes: Projects, Tasks, Milestones, Risks, Issues, Changes, Resources, Stakeholders, Documents, Sprints, Timesheets, Reports                                                                                         |
| **Automotive**         | 4010 | IATF 16949 compliance               | Automotive quality management, LPA, PPAP, control plans                                                                                                                                                                                 |
| **Medical**            | 4011 | ISO 13485 compliance                | Medical device quality, design controls, CAPA                                                                                                                                                                                           |
| **Aerospace**          | 4012 | AS9100D compliance                  | Aerospace quality, special processes, FAI                                                                                                                                                                                               |
| **Finance**            | 4013 | Financial management                | Accounts, journals, invoices, budgets, reporting                                                                                                                                                                                        |
| **CRM**                | 4014 | Customer relationship management    | Contacts, deals, pipelines, activities                                                                                                                                                                                                  |
| **InfoSec**            | 4015 | ISO 27001 compliance                | Information security, risk treatment, controls                                                                                                                                                                                          |
| **ESG**                | 4016 | ESG reporting                       | Environmental, social, governance metrics                                                                                                                                                                                               |
| **CMMS**               | 4017 | Maintenance management              | Work orders, assets, preventive maintenance                                                                                                                                                                                             |
| **Portal**             | 4018 | Multi-organization portal           | Customer/supplier portal backend                                                                                                                                                                                                        |
| **Food Safety**        | 4019 | HACCP/ISO 22000 compliance          | Hazard analysis, CCPs, monitoring, verification                                                                                                                                                                                         |
| **Energy**             | 4020 | ISO 50001 compliance                | Energy management, baselines, EnPIs                                                                                                                                                                                                     |
| **Analytics**          | 4021 | Business intelligence               | Dashboards, reports, KPIs, trend analysis                                                                                                                                                                                               |
| **Field Service**      | 4022 | Field operations                    | Work orders, scheduling, mobile dispatch                                                                                                                                                                                                |
| **ISO 42001**          | 4023 | AI Management System                | AI risk assessment, algorithm registry, compliance                                                                                                                                                                                      |
| **ISO 37001**          | 4024 | Anti-Bribery Management             | Due diligence, gift registry, whistleblowing                                                                                                                                                                                            |
| **Marketing**          | 4025 | Sales & marketing automation        | ROI calculator, chatbot, leads, onboarding, health-score                                                                                                                                                                                |
| **Partners**           | 4026 | Partner portal API                  | Auth, profile, deals, payouts, referrals, commission                                                                                                                                                                                    |
| **Risk (ERM)**         | 4027 | ISO 31000:2018 Enterprise Risk Mgmt | 10 models, 13 routes: risks, controls, KRIs, actions, bow-tie, appetite, analytics, dashboard                                                                                                                                           |
| **Training**           | 4028 | Competence management               | Courses, records, competencies, matrix, TNA                                                                                                                                                                                             |
| **Suppliers**          | 4029 | Supplier management                 | Suppliers, scorecards, documents, spend                                                                                                                                                                                                 |
| **Assets**             | 4030 | Asset management                    | Register, work orders, calibration, inspection                                                                                                                                                                                          |
| **Documents**          | 4031 | Document control                    | Documents, versions, approvals, read receipts                                                                                                                                                                                           |
| **Complaints**         | 4032 | Complaint management                | Complaints, actions, communications                                                                                                                                                                                                     |
| **Contracts**          | 4033 | Contract lifecycle                  | Contracts, approvals, notices, clauses                                                                                                                                                                                                  |
| **PTW**                | 4034 | Permit to Work                      | Permits, method statements, toolbox talks                                                                                                                                                                                               |
| **Reg Monitor**        | 4035 | Regulatory monitoring               | Changes, legal register, obligations                                                                                                                                                                                                    |
| **Incidents**          | 4036 | Incident management                 | Incidents, RIDDOR reporting                                                                                                                                                                                                             |
| **Audits**             | 4037 | Audit management                    | Audits, findings, checklists, programmes                                                                                                                                                                                                |
| **Mgmt Review**        | 4038 | Management review                   | Reviews with AI-generated agenda                                                                                                                                                                                                        |
| **Setup Wizard**       | 4039 | Setup wizard                        | Status, init, steps, complete, skip                                                                                                                                                                                                     |
| **Chemicals**          | 4040 | Chemical management                 | COSHH, SDS, GHS, inventory, monitoring                                                                                                                                                                                                  |
| **Emergency**          | 4041 | Fire & emergency                    | FRA, BCP, PEEP, wardens, drills, equipment                                                                                                                                                                                              |

### Web Applications

| Application            | Port | Description                                     |
| ---------------------- | ---- | ----------------------------------------------- |
| **Dashboard**          | 3000 | Main dashboard, ROI calculator, analytics       |
| **Health & Safety**    | 3001 | Safety management interface                     |
| **Environment**        | 3002 | Environmental management                        |
| **Quality**            | 3003 | Quality management system                       |
| **Settings**           | 3004 | System configuration                            |
| **Inventory**          | 3005 | Inventory management                            |
| **HR**                 | 3006 | HR management                                   |
| **Payroll**            | 3007 | Payroll management                              |
| **Workflows**          | 3008 | Workflow management                             |
| **Project Management** | 3009 | Project management                              |
| **Automotive**         | 3010 | Automotive quality management                   |
| **Medical**            | 3011 | Medical device quality                          |
| **Aerospace**          | 3012 | Aerospace quality management                    |
| **Finance**            | 3013 | Financial management                            |
| **CRM**                | 3014 | Customer relationship management                |
| **InfoSec**            | 3015 | Information security management                 |
| **ESG**                | 3016 | ESG reporting & metrics                         |
| **CMMS**               | 3017 | Maintenance management                          |
| **Customer Portal**    | 3018 | Customer-facing portal                          |
| **Supplier Portal**    | 3019 | Supplier-facing portal                          |
| **Food Safety**        | 3020 | Food safety management                          |
| **Energy**             | 3021 | Energy management                               |
| **Analytics**          | 3022 | Business analytics dashboards                   |
| **Field Service**      | 3023 | Field service management                        |
| **ISO 42001**          | 3024 | AI management system                            |
| **ISO 37001**          | 3025 | Anti-bribery management                         |
| **Partners Portal**    | 3026 | Partner referral portal                         |
| **Admin Dashboard**    | 3027 | Founder growth dashboard                        |
| **Marketing**          | 3030 | Landing pages, ROI calculator, chatbot          |
| **Risk (ERM)**         | 3031 | ISO 31000 Enterprise Risk Management (15 pages) |
| **Training**           | 3032 | Competence management                           |
| **Suppliers**          | 3033 | Supplier management                             |
| **Assets**             | 3034 | Asset management                                |
| **Documents**          | 3035 | Document control                                |
| **Complaints**         | 3036 | Complaint management                            |
| **Contracts**          | 3037 | Contract lifecycle                              |
| **Fin Compliance**     | 3038 | Financial compliance                            |
| **PTW**                | 3039 | Permit to Work                                  |
| **Reg Monitor**        | 3040 | Regulatory monitoring                           |
| **Incidents**          | 3041 | Incident management                             |
| **Audits**             | 3042 | Audit management                                |
| **Mgmt Review**        | 3043 | Management review                               |
| **Chemicals**          | 3044 | Chemical management                             |
| **Emergency**          | 3045 | Fire & emergency management                     |
| **Training Portal**    | 3046 | Activation-key-gated training portal             |

## Monitoring System

### Overview

The `@ims/monitoring` package provides observability across all API services.

### Components

#### 1. Structured Logging (`createLogger`)

```typescript
import { createLogger } from '@ims/monitoring';

const logger = createLogger('service-name');

logger.info('Server started', { port: 4000 });
logger.error('Database error', { error: err.message });
logger.warn('High memory usage', { percentage: 95 });
```

**Features:**

- JSON structured output for log aggregation
- File rotation: `{service}-error.log` and `{service}-combined.log`
- Console output with colors and timestamps
- Correlation ID inclusion for request tracing
- Log levels: error, warn, info, http, verbose, debug

#### 2. Prometheus Metrics (`metricsMiddleware`, `metricsHandler`)

```typescript
import { metricsMiddleware, metricsHandler } from '@ims/monitoring';

app.use(metricsMiddleware('service-name'));
app.get('/metrics', metricsHandler);
```

**Exposed Metrics:**
| Metric | Type | Description |
|--------|------|-------------|
| `http_request_duration_seconds` | Histogram | Request latency by method/route/status |
| `http_requests_total` | Counter | Total requests by method/route/status |
| `http_requests_active` | Gauge | Currently processing requests |
| `database_query_duration_seconds` | Histogram | Database query latency |
| `process_*` | Various | Node.js process metrics (CPU, memory, etc.) |

**Buckets:** 0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10 seconds

#### 3. Correlation IDs (`correlationIdMiddleware`)

```typescript
import { correlationIdMiddleware, getCorrelationId } from '@ims/monitoring';

app.use(correlationIdMiddleware());

// In route handlers:
const correlationId = getCorrelationId(req);
logger.info('Processing request', { correlationId });
```

**Behavior:**

- Reads `x-correlation-id` header from incoming requests
- Generates UUID v4 if not present
- Attaches to `req.correlationId`
- Adds to response headers for tracing

#### 4. Health Checks (`createHealthCheck`)

```typescript
import { createHealthCheck } from '@ims/monitoring';
import { prisma } from '@ims/database';

app.get('/health', createHealthCheck('service-name', prisma, '1.0.0'));
```

**Response Format:**

```json
{
  "status": "healthy",
  "service": "api-hr",
  "timestamp": "2026-02-06T17:11:24.357Z",
  "uptime": 3600,
  "version": "1.0.0",
  "checks": {
    "database": "up",
    "memory": {
      "used": 150,
      "total": 256,
      "percentage": 58
    }
  }
}
```

**Status Values:**

- `healthy`: All checks pass, memory < 90%
- `degraded`: Memory > 90% but database up
- `unhealthy`: Database down (returns HTTP 503)

## Authentication

### JWT Token Flow

```
┌──────────┐     POST /api/auth/login      ┌──────────────┐
│  Client  │ ─────────────────────────────▶│  API Gateway │
└──────────┘     {email, password}         └──────┬───────┘
     │                                            │
     │                                            ▼
     │                                     ┌──────────────┐
     │                                     │   Validate   │
     │                                     │  Credentials │
     │                                     └──────┬───────┘
     │                                            │
     │         {token, user}                      │
     │◀───────────────────────────────────────────┘
     │
     │     GET /api/*, Authorization: Bearer <token>
     │────────────────────────────────────────────▶
```

### Token Structure

- Algorithm: HS256
- Expiration: 24 hours
- Payload: `{ userId, email, role }`

### Protected Routes

All `/api/*` routes (except `/api/auth/*`) require valid JWT token.

## Service Management

### Scripts

```bash
# Start all 52 services
./scripts/start-all-services.sh

# Stop all services
./scripts/stop-all-services.sh

# Check service status
./scripts/check-services.sh
```

### Start Script Behavior

1. Starts API Gateway first (3s delay)
2. Starts all domain APIs in parallel (3s delay)
3. Starts web apps sequentially (2s between each to avoid port conflicts)
4. Logs output to `/logs/{service}-{timestamp}.log`

### Check Script Output

```
Checking IMS Services...

API Services:
[OK] API Gateway (port 4000) - healthy
[OK] Health & Safety API (port 4001) - healthy
...

Web Applications:
[OK] Dashboard (port 3000) - running
...

Total services running: 52 / 52
```

## Technology Stack

### Backend

- **Runtime**: Node.js 20+
- **Framework**: Express.js 4.x
- **Language**: TypeScript 5.x
- **ORM**: Prisma
- **Database**: PostgreSQL 15+

### Frontend

- **Framework**: Next.js 15
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **State**: Zustand, TanStack Query
- **Charts**: Chart.js, Recharts

### DevOps

- **Monorepo**: Turborepo
- **Package Manager**: pnpm
- **Build Tool**: tsup (all API services and shared packages)
- **Testing**: Jest (~1,203,000 tests across ~1,085 suites / 439 projects), 40 integration test scripts (~1,800+ assertions), CI via GitHub Actions
- **Containerization**: Docker Compose (43 APIs + api-search:4050 + 45 web apps + PostgreSQL + Redis + main API)
- **Logging**: Winston
- **Metrics**: prom-client (Prometheus)

### Shared Packages

| Package                      | Description                                         |
| ---------------------------- | --------------------------------------------------- |
| `@ims/database`              | Prisma client & schema                              |
| `@ims/auth`                  | JWT utilities                                       |
| `@ims/types`                 | Shared TypeScript types                             |
| `@ims/ui`                    | React component library                             |
| `@ims/charts`                | Chart components                                    |
| `@ims/monitoring`            | Logging, metrics, health checks                     |
| `@ims/calculations`          | Business logic utilities                            |
| `@ims/rbac`                  | Role-based access control (39 roles, 17 modules)    |
| `@ims/notifications`         | WebSocket notifications & notification bell         |
| `@ims/pwa`                   | Progressive web app (service worker, offline cache) |
| `@ims/performance`           | k6 load tests, Lighthouse CI, WCAG 2.2 AA           |
| `@ims/benchmarks`            | Performance benchmarking utilities                  |
| `@ims/emission-factors`      | ESG emission factor database                        |
| `@ims/event-bus`             | Inter-service event communication                   |
| `@ims/finance-calculations`  | Financial computation library                       |
| `@ims/nlq`                   | Natural language query engine                       |
| `@ims/oee-engine`            | Overall equipment effectiveness calculations        |
| `@ims/pdf-generator`         | PDF report generation                               |
| `@ims/portal-auth`           | Portal-specific authentication                      |
| `@ims/regulatory-feed`       | Regulatory update feed ingestion                    |
| `@ims/standards-convergence` | Cross-standard mapping & convergence                |
| `@ims/tax-engine`            | Multi-jurisdiction tax calculations                 |
| `@ims/templates`             | Template library (192 built-in templates)           |

## API Endpoints

### Common Patterns

All APIs follow RESTful conventions:

```
GET    /api/{resource}          # List all
GET    /api/{resource}/:id      # Get one
POST   /api/{resource}          # Create
PUT    /api/{resource}/:id      # Update
DELETE /api/{resource}/:id      # Delete
GET    /api/{resource}/stats    # Statistics
```

### Response Format

**Success:**

```json
{
  "success": true,
  "data": { ... }
}
```

**Error:**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data"
  }
}
```

### Key Endpoints by Service

#### API Gateway (4000)

- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration
- `GET /api/users/me` - Current user profile
- `GET /api/dashboard/stats` - Dashboard statistics

#### HR API (4006)

- `GET /api/employees` - List employees
- `GET /api/employees/stats` - Employee statistics
- `GET /api/attendance/summary` - Attendance summary
- `GET /api/recruitment/stats` - Recruitment pipeline
- `GET /api/training/stats` - Training statistics

#### Quality API (4003)

- `GET /api/parties` - Interested parties register
- `GET /api/issues` - Internal/external issues
- `GET /api/risks` - Risk register (probability × consequence)
- `GET /api/opportunities` - Opportunity register
- `GET /api/processes` - Process register (turtle diagram)
- `GET /api/nonconformances` - NCR with containment & RCA
- `GET /api/actions` - Action register with verification
- `GET /api/documents` - Document control with versioning
- `GET /api/capa` - CAPA with 5-Why/Fishbone/8D + nested actions
- `GET /api/legal` - Legal/compliance register
- `GET /api/fmea` - FMEA with nested rows (S×O×D RPN)
- `GET /api/improvements` - Continual improvement (PDCA)
- `GET /api/suppliers` - Supplier quality (IMS 3-ring scoring)
- `GET /api/changes` - Change management (impact assessment)
- `GET /api/objectives` - Objectives with nested milestones

#### PM API (4009)

- `GET /api/projects` - List projects
- `GET /api/projects/stats` - Project statistics
- `GET /api/tasks` - List tasks
- `GET /api/milestones` - List milestones
- `GET /api/risks` - List project risks
- `GET /api/issues` - List project issues
- `GET /api/changes` - List change requests
- `GET /api/resources` - List resources
- `GET /api/stakeholders` - List stakeholders
- `GET /api/sprints` - List sprints
- `GET /api/timesheets` - List timesheets
- `GET /api/reports` - List status reports

## Environment Configuration

### Required Variables

```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/ims"

# Authentication
JWT_SECRET="${JWT_SECRET}"

# Service URLs (for gateway)
HEALTH_SAFETY_URL=http://localhost:4001
ENVIRONMENT_URL=http://localhost:4002
QUALITY_URL=http://localhost:4003
AI_ANALYSIS_URL=http://localhost:4004
INVENTORY_URL=http://localhost:4005
HR_URL=http://localhost:4006
PAYROLL_URL=http://localhost:4007
WORKFLOWS_URL=http://localhost:4008
PROJECT_MANAGEMENT_URL=http://localhost:4009
AUTOMOTIVE_URL=http://localhost:4010
MEDICAL_URL=http://localhost:4011
AEROSPACE_URL=http://localhost:4012
FINANCE_URL=http://localhost:4013
CRM_URL=http://localhost:4014
INFOSEC_URL=http://localhost:4015
ESG_URL=http://localhost:4016
CMMS_URL=http://localhost:4017
PORTAL_URL=http://localhost:4018
FOOD_SAFETY_URL=http://localhost:4019
ENERGY_URL=http://localhost:4020
ANALYTICS_URL=http://localhost:4021
FIELD_SERVICE_URL=http://localhost:4022
ISO42001_URL=http://localhost:4023
ISO37001_URL=http://localhost:4024

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### Per-Service Configuration

Each API service has its own `.env` file with:

```env
PORT=400X
DATABASE_URL="..."
JWT_SECRET="..."
NODE_ENV=development
```

## Development

### Quick Start

```bash
# Install dependencies
pnpm install

# Generate Prisma client
pnpm db:generate

# Start all services
./scripts/start-all-services.sh

# Or start individual service
pnpm --filter @ims/api-gateway dev
```

### Building

```bash
# Build all packages
pnpm build

# Build specific service
pnpm --filter @ims/api-hr build
```

## Monitoring Integration Guide

### Adding Monitoring to a New Service

1. Add dependency:

```json
{
  "dependencies": {
    "@ims/monitoring": "workspace:*"
  }
}
```

2. Import and configure:

```typescript
import {
  createLogger,
  metricsMiddleware,
  metricsHandler,
  correlationIdMiddleware,
  createHealthCheck,
} from '@ims/monitoring';
import { prisma } from '@ims/database';

const logger = createLogger('my-service');

// Add middleware
app.use(correlationIdMiddleware());
app.use(metricsMiddleware('my-service'));

// Add endpoints
app.get('/health', createHealthCheck('my-service', prisma, '1.0.0'));
app.get('/metrics', metricsHandler);
```

3. Use logger instead of console:

```typescript
logger.info('Message', { key: 'value' });
logger.error('Error occurred', { error: err.message });
```

## Troubleshooting

### Common Issues

**Port Already in Use**

```bash
# Find process using port
lsof -i :4000
# Or use ss
ss -tlnp | grep 4000
# Kill process
kill -9 <PID>
```

**Services Not Starting**

```bash
# Check logs
tail -f logs/api-gateway-*.log

# Verify database connection
psql $DATABASE_URL -c "SELECT 1"
```

**Health Check Degraded**

- Memory > 90%: Consider increasing Node.js heap size
- Database down: Check PostgreSQL connection

---

_Last Updated: February 27, 2026_
