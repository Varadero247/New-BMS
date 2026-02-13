# Resolvex IMS - Integrated Management System

A comprehensive, multi-standard Integrated Management System covering ISO 9001, ISO 14001, ISO 45001, IATF 16949, ISO 13485, AS9100D, and PMBOK/ISO 21502 -- with 13 API services, 13 web applications, 23 shared packages, 759 API endpoints, and 283,533 lines of TypeScript.

## Tech Stack

- **Runtime**: Node.js 20+
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Express.js, TypeScript
- **Database**: PostgreSQL 16 with Prisma ORM
- **Mobile**: Capacitor (iOS/Android)
- **Monorepo**: pnpm workspaces + Turborepo
- **AI**: Anthropic Claude (Sonnet 4.5), OpenAI, Grok -- multi-provider analysis across all domains
- **Deployment**: Docker Compose with 28 containerized services (13 APIs + 13 web apps + PostgreSQL + Redis)

## Platform Metrics

| Metric | Count |
|--------|-------|
| API Services | 13 |
| Web Applications | 13 |
| Shared Packages | 23 |
| API Endpoints | 759 |
| React Components | 265 |
| Lines of TypeScript | 283,533 |
| Test Files | 184 |
| Unit Tests | ~4,600+ across ~182 suites |
| Mobile Apps | 1 (Capacitor) |

## Architecture

```
ims-monorepo/
├── apps/
│   ├── web-dashboard/          # Main IMS Dashboard (Port 3000)
│   ├── web-health-safety/      # ISO 45001 Module (Port 3001)
│   ├── web-environment/        # ISO 14001 Module (Port 3002)
│   ├── web-quality/            # ISO 9001 Module (Port 3003)
│   ├── web-settings/           # Settings & Admin (Port 3004)
│   ├── web-inventory/          # Inventory Module (Port 3005)
│   ├── web-hr/                 # HR Module (Port 3006)
│   ├── web-payroll/            # Payroll Module (Port 3007)
│   ├── web-workflows/          # Workflows Module (Port 3008)
│   ├── web-project-management/ # Project Management (Port 3009)
│   ├── web-automotive/         # IATF 16949 Module (Port 3010)
│   ├── web-medical/            # ISO 13485 Module (Port 3011)
│   ├── web-aerospace/          # AS9100D Module (Port 3012)
│   ├── api-gateway/            # API Gateway (Port 4000)
│   ├── api-health-safety/      # H&S API Service (Port 4001)
│   ├── api-environment/        # Environmental API (Port 4002)
│   ├── api-quality/            # Quality API (Port 4003)
│   ├── api-ai-analysis/        # AI Analysis API (Port 4004)
│   ├── api-inventory/          # Inventory API (Port 4005)
│   ├── api-hr/                 # HR API (Port 4006)
│   ├── api-payroll/            # Payroll API (Port 4007)
│   ├── api-workflows/          # Workflows API (Port 4008)
│   ├── api-project-management/ # Project Management API (Port 4009)
│   ├── api-automotive/         # Automotive API (Port 4010)
│   ├── api-medical/            # Medical Devices API (Port 4011)
│   ├── api-aerospace/          # Aerospace API (Port 4012)
│   └── mobile/                 # Capacitor mobile app (iOS/Android)
├── packages/
│   ├── database/               # Prisma schemas and clients (multi-domain)
│   ├── types/                  # Shared TypeScript types
│   ├── shared/                 # Shared utilities
│   ├── ui/                     # Shared UI components
│   ├── charts/                 # Chart components
│   ├── auth/                   # Authentication middleware (JWT)
│   ├── service-auth/           # Service-to-service JWT auth
│   ├── calculations/           # ISO calculation formulas
│   ├── monitoring/             # Winston logging, Prometheus metrics, health checks
│   ├── validation/             # Zod validation schemas
│   ├── resilience/             # Circuit breakers, retry logic
│   ├── audit/                  # Activity audit trail
│   ├── secrets/                # HashiCorp Vault integration
│   ├── email/                  # Email templates and sending
│   ├── file-upload/            # Multi-format file handling
│   ├── templates/              # Document and report templates
│   ├── iso-checklists/         # ISO audit checklist engine
│   ├── esig/                   # Electronic signature workflows
│   ├── spc-engine/             # Statistical Process Control engine
│   ├── cache/                  # Redis caching layer
│   ├── a11y/                   # WCAG 2.2 AA accessibility utilities
│   ├── sdk/                    # @resolvex/sdk external SDK
│   └── testing/                # Shared test utilities
├── scripts/                    # Service management & test scripts
├── docker-compose.yml
└── turbo.json
```

## Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL 16+
- Docker & Docker Compose
- Redis 7+

## Getting Started

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Setup Environment

```bash
cp .env.example .env
```

Configure your environment variables:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ims
JWT_SECRET=your-secret-key
OPENAI_API_KEY=your-openai-key          # optional
ANTHROPIC_API_KEY=your-anthropic-key    # optional
```

> **Note:** Do NOT set `CORS_ORIGIN` in `.env`. The gateway uses a built-in allowed-origins array. Setting an empty `CORS_ORIGIN=` will break all cross-origin requests.

### 3. Start Database

```bash
docker-compose up -d postgres redis
```

### 4. Setup Database

```bash
# Generate Prisma client
pnpm db:generate

# Push schema to database (use migrate diff for multi-schema safety)
pnpm db:push

# Seed with demo data
pnpm --filter @ims/database seed
```

### 5. Start Development

```bash
# Start all 26 apps (13 APIs + 13 web apps)
pnpm dev

# Or start specific modules
pnpm dev:dashboard      # Dashboard + Gateway
pnpm dev:health-safety  # H&S Module + API + Gateway
pnpm dev:environment    # Environmental Module + API + Gateway
pnpm dev:quality        # Quality Module + API + Gateway
pnpm dev:settings       # Settings + AI API + Gateway
pnpm dev:project-management  # PM Module + API + Gateway

# Start APIs only
pnpm dev:apis

# Start web apps only
pnpm dev:web
```

### Quick Start (after shutdown)

```bash
# Full startup script: kills conflicting ports, starts Docker, seeds DB, recreates tables
./scripts/startup.sh

# Start all 26 services with staggered delays
./scripts/start-all-services.sh

# Check all services are healthy
./scripts/check-services.sh
```

## Standards Supported

| Standard | Domain | API Service | Endpoints |
|----------|--------|-------------|-----------|
| ISO 9001:2015 | Quality Management | api-quality (4003) | 125 |
| ISO 14001:2015 | Environmental Management | api-environment (4002) | 77 |
| ISO 45001:2018 | Health & Safety | api-health-safety (4001) | 52 |
| PMBOK / ISO 21502 | Project Management | api-project-management (4009) | 65 |
| IATF 16949 | Automotive Quality | api-automotive (4010) | 43 |
| ISO 13485 | Medical Devices | api-medical (4011) | 66 |
| AS9100D | Aerospace Quality | api-aerospace (4012) | 41 |

## Module Overview

| Module | Standard | API Port | Endpoints | Tests (suites) | Key Features |
|--------|----------|----------|-----------|----------------|--------------|
| **Gateway** | -- | 4000 | 67 | 454 (19) | Auth, dashboard, templates, reports, security, GDPR, webhooks, ESG, compliance |
| **Health & Safety** | ISO 45001 | 4001 | 52 | 266 (10) | Risk register, incidents, legal, objectives, CAPA, RIDDOR, safety metrics |
| **Environment** | ISO 14001 | 4002 | 77 | 442 (14) | Aspects, events, legal, objectives, actions, CAPA, significance scoring |
| **Quality** | ISO 9001 | 4003 | 125 | 789 (22) | NCRs, CAPA 8D, audits, FMEA, CI, suppliers, documents, training, change mgmt |
| **AI Analysis** | Multi-provider | 4004 | 10 | 75 (5) | Claude/OpenAI/Grok, 23+ analysis types across all domains |
| **Inventory** | -- | 4005 | 34 | 160 (6) | Products, warehouses, categories, transactions, suppliers |
| **HR** | -- | 4006 | 79 | 305 (8) | Employees, attendance, leave, recruitment, training, performance |
| **Payroll** | -- | 4007 | 39 | 163 (6) | Payroll runs, salary, benefits, loans, expenses, tax |
| **Workflows** | -- | 4008 | 61 | 231 (7) | Templates, definitions, instances, tasks, approvals, automation |
| **Project Mgmt** | PMBOK/ISO 21502 | 4009 | 65 | 230 (13) | Projects, WBS, milestones, risks, issues, sprints, timesheets, EVM |
| **Automotive** | IATF 16949 | 4010 | 43 | 502 (12) | APQP, PPAP, FMEA, Control Plans, MSA, SPC, LPA, CSR |
| **Medical** | ISO 13485 | 4011 | 66 | 584 (14) | DHF, DMR/DHR, Complaints, PMS, Risk Mgmt, UDI, Software Validation |
| **Aerospace** | AS9100D | 4012 | 41 | 338 (8) | FAI AS9102C, Configuration Mgmt, Work Orders, Human Factors, OASIS |

### Health & Safety (ISO 45001:2018)

52 endpoints, 266 tests. Full CRUD APIs with AI integration (Claude Sonnet 4.5):

| Module | API Route | AI Feature |
|--------|-----------|------------|
| **Risk Register** | `/api/risks` | Hierarchy of Controls generation |
| **Incident Register** | `/api/incidents` | 5-Why root cause analysis (ICAM) |
| **Legal Register** | `/api/legal` | Compliance assessment (UK/EU legislation) |
| **OHS Objectives** | `/api/objectives` | SMART objective + KPI generation |
| **CAPA Management** | `/api/capa` | Root cause + corrective/preventive actions |

Key features:
- Auto reference numbers (HS-001, LR-001, OBJ-001, CAPA-001, INC-YYMM-XXXX)
- Auto RIDDOR detection for Critical/Major incidents
- Auto investigation due dates by severity
- Auto CAPA target dates by priority
- Milestone-based objective progress tracking
- Real-time dashboard with stats from all 5 modules
- Safety metrics (LTIFR, TRIR, Severity Rate)

### Environmental (ISO 14001:2015)

77 endpoints, 442 tests. 6 API route modules:

| Module | API Route | Key Features |
|--------|-----------|-------------|
| **Aspects & Impacts** | `/api/aspects` | Significance scoring, review tracking |
| **Events** | `/api/events` | 5 event types, auto ref# ENV-EVT-YYYY-NNN, investigation |
| **Legal Register** | `/api/legal` | 9 obligation types, 5 compliance statuses |
| **Objectives** | `/api/objectives` | Progress tracking, auto % calculation |
| **Actions** | `/api/actions` | Environmental action plans |
| **CAPA** | `/api/capa` | Corrective and preventive actions |

### Quality (ISO 9001:2015)

125 endpoints, 789 tests. 15 API route modules:

| Module | API Route | Key Features |
|--------|-----------|-------------|
| **Non-conformances** | `/api/nonconformances` | 7 NC types, auto ref# NC-YYMM-XXXX |
| **Actions** | `/api/actions` | Corrective/preventive, auto ref# ACT-YYMM-XXXX |
| **Processes** | `/api/processes` | L*S*D scoring, KPIs |
| **CAPA 8D** | `/api/capas` | Full 8D methodology (D1-D8) |
| **Audits** | `/api/audits` | 9 types, checklists, findings, schedules |
| **Investigations** | `/api/investigations` | Timeline, root causes, recommendations |
| **Documents** | `/api/documents` | Version control, multi-level approval, distribution |
| **Risk Register** | `/api/qms-risks` | 11 categories, assessments, controls, treatments |
| **FMEA** | `/api/fmea` | DFMEA/PFMEA, RPN calculation |
| **CI** | `/api/ci` | DMAIC, Kaizen, 5S, employee ideas, standard work |
| **Training** | `/api/training` | Courses, competency matrix, certifications |
| **Suppliers** | `/api/suppliers` | Qualification, scorecards, NCRs, PPAP |
| **Change Mgmt** | `/api/change-requests` | CCB approval, impact assessment |
| **Templates** | `/api/templates` | Pre-built ISO 9001 templates |
| **Metrics** | `/api/metrics/quality` | COPQ, DPMO, FPY, Sigma |

### Automotive (IATF 16949)

43 endpoints, 502 tests. Industry-specific quality for automotive:

- APQP (Advanced Product Quality Planning)
- PPAP (Production Part Approval Process)
- FMEA (Failure Mode and Effects Analysis)
- Control Plans, MSA, SPC
- Layered Process Audits (LPA)
- Customer-Specific Requirements (CSR)

### Medical Devices (ISO 13485)

66 endpoints, 584 tests. Full medical device quality management:

- Design History File (DHF)
- Device Master Record / Device History Record (DMR/DHR)
- Complaint Handling and CAPA
- Post-Market Surveillance (PMS)
- Risk Management (ISO 14971)
- Unique Device Identification (UDI)
- Software Validation (IEC 62304)

### Aerospace (AS9100D)

41 endpoints, 338 tests. Aerospace quality management:

- First Article Inspection per AS9102C
- Configuration Management
- Work Orders
- Human Factors
- OASIS integration

### Inventory

34 endpoints, 160 tests:

| Module | API Route | Key Features |
|--------|-----------|-------------|
| **Products** | `/api/products` | SKU/barcode, low stock alerts, optimistic locking |
| **Inventory** | `/api/inventory` | Adjustments, transfers, receive/issue goods |
| **Warehouses** | `/api/warehouses` | Multi-warehouse, capacity tracking |
| **Categories** | `/api/categories` | Hierarchical with circular reference prevention |
| **Transactions** | `/api/inventory/transactions` | Full audit trail, 11 types |
| **Suppliers** | `/api/suppliers` | Ratings, payment terms |

### Workflows

61 endpoints, 231 tests:

| Module | API Route | Key Features |
|--------|-----------|-------------|
| **Templates** | `/api/templates` | 11 categories, 15 industry types |
| **Definitions** | `/api/definitions` | Nodes/edges, triggers, versioning |
| **Instances** | `/api/instances` | Start/advance/complete, SLA tracking |
| **Tasks** | `/api/tasks` | 8 types, claim/complete/reassign |
| **Approvals** | `/api/approvals` | Multi-level chains, 10 request types |
| **Automation** | `/api/automation` | Rules, 6 triggers, 10 actions, retry |

### HR Management

79 endpoints, 305 tests:

| Module | API Route | Key Features |
|--------|-----------|-------------|
| **Employees** | `/api/employees` | CRUD, org chart, stats, subordinate hierarchy |
| **Attendance** | `/api/attendance` | Clock-in/out, late calc, shift management |
| **Departments** | `/api/departments` | Tree structure, positions, soft delete |
| **Leave** | `/api/leave` | Types, requests, approval, balances, calendar |
| **Performance** | `/api/performance` | Cycles, reviews, goals, progress tracking |
| **Recruitment** | `/api/recruitment` | Jobs, applicants, interviews, evaluations |
| **Training** | `/api/training` | Courses, sessions, enrollments, certifications |
| **Documents** | `/api/documents` | Upload, e-sign, qualifications, assets |

### Payroll

39 endpoints, 163 tests:

| Module | API Route | Key Features |
|--------|-----------|-------------|
| **Payroll** | `/api/payroll` | Run lifecycle, payslip generation, stats |
| **Salary** | `/api/salary` | Component types, employee salary records |
| **Benefits** | `/api/benefits` | Plans, enrollment, termination |
| **Loans** | `/api/loans` | Approval workflow, repayment schedules |
| **Expenses** | `/api/expenses` | Submit, approve, reimburse, reports |
| **Tax** | `/api/tax` | Filings, brackets, payments, summaries |

### Project Management (PMBOK/ISO 21502)

65 endpoints, 230 tests:

| Module | API Route | Key Features |
|--------|-----------|-------------|
| **Projects** | `/api/projects` | PMBOK lifecycle, RAG status, budget tracking |
| **Tasks** | `/api/tasks` | WBS, dependencies, critical path, Gantt |
| **Milestones** | `/api/milestones` | Deliverables, auto-status, phase gates |
| **Risks** | `/api/risks` | Probability x Impact scoring, response plans |
| **Issues** | `/api/issues` | Priority matrix, resolution tracking |
| **Changes** | `/api/changes` | CCB approval, impact assessment |
| **Resources** | `/api/resources` | Allocation, utilization, cost rates |
| **Stakeholders** | `/api/stakeholders` | Power/Interest matrix, engagement strategy |
| **Documents** | `/api/documents` | Version control, categories |
| **Sprints** | `/api/sprints` | Agile ceremonies, velocity, burndown |
| **Timesheets** | `/api/timesheets` | Time tracking, cost calculation, approval |
| **Reports** | `/api/reports` | Status reports, RAG dashboards, EVM |

### AI Analysis (Multi-Provider: Claude, OpenAI, Grok)

10 endpoints, 75 tests. 23+ analysis types across all domains:

- **H&S**: Risk controls (Hierarchy of Controls), incident root cause (5-Why, ICAM), legal compliance, SMART objectives, CAPA generation
- **HR**: Job descriptions, performance insights, leave analysis, onboarding, certifications
- **Payroll**: Validation, salary benchmarks, expense checks, loan calculator, payslip anomaly detection
- **PM**: Project charter, WBS generation, critical path, 3-point estimation, resource leveling, risk analysis, EVM, stakeholder strategy, health check, sprint planning, lessons learned
- **Automotive**: APQP + PPAP analysis

## API Gateway Routing

All traffic flows through the API Gateway on port 4000, which handles authentication, rate limiting, CORS, and proxying to downstream services.

| Route Pattern | Target | Description |
|---------------|--------|-------------|
| `/api/auth/*` | Local (Gateway) | Login, registration, token refresh |
| `/api/users/*` | Local (Gateway) | User management |
| `/api/dashboard/*` | Local (Gateway) | Dashboard aggregation |
| `/api/v1/templates/*` | Local (Gateway) | Report templates |
| `/api/health-safety/*` | api-health-safety:4001 | ISO 45001 -- risks, incidents, legal, objectives, CAPA |
| `/api/environment/*` | api-environment:4002 | ISO 14001 -- aspects, events, legal, objectives, actions, CAPA |
| `/api/quality/*` | api-quality:4003 | ISO 9001 -- NCRs, CAPA 8D, audits, FMEA, CI, suppliers, 125 endpoints |
| `/api/ai/*` | api-ai-analysis:4004 | Multi-provider AI analysis |
| `/api/inventory/*` | api-inventory:4005 | Inventory management |
| `/api/hr/*` | api-hr:4006 | HR -- employees, attendance, leave, recruitment, training, performance |
| `/api/payroll/*` | api-payroll:4007 | Payroll -- runs, salary, benefits, loans, expenses, tax |
| `/api/workflows/*` | api-workflows:4008 | Workflow engine -- definitions, instances, tasks, approvals, automation |
| `/api/v1/project-management/*` | api-project-management:4009 | PMBOK -- projects, tasks, milestones, risks, sprints, timesheets |
| `/api/automotive/*` | api-automotive:4010 | IATF 16949 -- APQP, PPAP, FMEA, SPC, MSA, LPA, CSR |
| `/api/medical/*` | api-medical:4011 | ISO 13485 -- DHF, DMR/DHR, complaints, PMS, UDI |
| `/api/aerospace/*` | api-aerospace:4012 | AS9100D -- FAI, config mgmt, work orders, human factors |

## Security

- **Authentication**: JWT Bearer tokens via `Authorization` header, stored in `localStorage`
- **RBAC**: Role-based access control with ownership checks and scope-to-user middleware
- **NIST Password Policy**: Enforced password complexity requirements
- **Service-to-Service Auth**: Internal JWT tokens between microservices (`@ims/service-auth`)
- **Soft Delete**: Records are soft-deleted (never permanently removed) with automatic query filtering
- **Rate Limiting**: 100 requests per 15 minutes per IP, persisted in Redis
- **CORS**: Gateway handles CORS with an explicit allowed-origins list; downstream services reflect
- **ISO 27001**: Security controls API with RBAC matrix and Annex A mapping
- **GDPR**: Data export, erasure, and retention policy endpoints
- **Audit Trail**: All mutations are logged via `@ims/audit`

## Docker Deployment

28 containerized services: 13 API services + 13 web applications + PostgreSQL + Redis.

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Start specific services
docker-compose up -d api-gateway web-dashboard
```

> **Note:** All Prisma generator blocks include `binaryTargets = ["native", "linux-musl-openssl-3.0.x"]` for Alpine container compatibility.

## Demo Credentials

```
Email: admin@ims.local
Password: admin123
```

## Testing

### Unit Tests (~4,600+ tests across ~182 suites)

```bash
# Run all Jest unit tests
pnpm test

# Run specific test suite
npx jest --config jest.config.js apps/api-health-safety/__tests__/risks.api.test.ts
```

Test distribution by service:

| Service | Tests | Suites |
|---------|-------|--------|
| api-gateway | 454 | 19 |
| api-quality | 789 | 22 |
| api-medical | 584 | 14 |
| api-automotive | 502 | 12 |
| api-environment | 442 | 14 |
| api-aerospace | 338 | 8 |
| api-hr | 305 | 8 |
| api-health-safety | 266 | 10 |
| api-workflows | 231 | 7 |
| api-project-management | 230 | 13 |
| api-payroll | 163 | 6 |
| api-inventory | 160 | 6 |
| api-ai-analysis | 75 | 5 |
| **Shared packages** | **948** | **--** |

Package test breakdown: auth (108), spc-engine (177), validation (104), esig (103), iso-checklists (101), resilience (71), secrets (64), service-auth (63), file-upload (62), audit (51), monitoring (44).

### Integration Tests (~425 assertions)

```bash
# Run all integration tests (8 modules)
./scripts/test-all-modules.sh

# Run per-module integration tests
./scripts/test-hs-modules.sh        # H&S (~70 assertions)
./scripts/test-env-modules.sh       # Environment (~60)
./scripts/test-quality-modules.sh   # Quality (~80)
./scripts/test-hr-modules.sh        # HR (~50)
./scripts/test-payroll-modules.sh   # Payroll (~40)
./scripts/test-inventory-modules.sh # Inventory (~40)
./scripts/test-workflows-modules.sh # Workflows (~40)
./scripts/test-pm-modules.sh        # PM (~45)
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in development mode |
| `pnpm dev:dashboard` | Start dashboard with gateway |
| `pnpm dev:health-safety` | Start H&S module with APIs |
| `pnpm dev:environment` | Start Environmental module with APIs |
| `pnpm dev:quality` | Start Quality module with APIs |
| `pnpm dev:settings` | Start Settings module with APIs |
| `pnpm dev:project-management` | Start PM module with APIs |
| `pnpm build` | Build all apps |
| `pnpm build:packages` | Build shared packages only |
| `pnpm test` | Run all unit tests |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:push` | Push schema to database |
| `pnpm db:migrate` | Run database migrations |
| `pnpm db:studio` | Open Prisma Studio |
| `./scripts/startup.sh` | Full startup (ports, Docker, seed, tables) |
| `./scripts/start-all-services.sh` | Start all 26 services |
| `./scripts/stop-all-services.sh` | Stop all services |
| `./scripts/check-services.sh` | Health check all services |
| `./scripts/test-all-modules.sh` | Run all integration tests |

## Package Development

### Building packages

```bash
# Build all packages
pnpm build:packages

# Build specific package
pnpm --filter @ims/ui build
```

### Using shared packages

```typescript
// UI components
import { Button, Card, Badge, Modal } from '@ims/ui';

// Charts
import { ComplianceGauge, RiskMatrix } from '@ims/charts';

// Calculations
import { calculateRiskScore, calculateLTIFR } from '@ims/calculations';

// Types
import { Risk, Incident, HSLegalRequirement, OhsObjective, Capa } from '@ims/types';

// Monitoring (Winston logging, Prometheus metrics, health checks)
import { createLogger, metricsMiddleware, createHealthCheck } from '@ims/monitoring';

// Validation (Zod schemas)
import { riskSchema, incidentSchema } from '@ims/validation';

// Electronic signatures
import { createSignatureWorkflow } from '@ims/esig';

// SPC engine
import { calculateCpk, xBarRChart } from '@ims/spc-engine';

// ISO audit checklists
import { getChecklist } from '@ims/iso-checklists';

// Accessibility
import { checkA11y } from '@ims/a11y';
```

## Mobile Development

### iOS

```bash
cd apps/mobile
pnpm build
npx cap add ios
npx cap open ios
```

### Android

```bash
cd apps/mobile
pnpm build
npx cap add android
npx cap open android
```

## License

MIT
