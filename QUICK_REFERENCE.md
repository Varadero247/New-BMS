# IMS Quick Reference Card

## Start All Services (Docker)

```bash
cd /home/dyl/New-BMS
docker compose up -d                    # Start all containers
docker compose logs -f web-health-safety  # Follow specific service logs
docker compose down                     # Stop all services
```

## Rebuild After Code Changes

```bash
docker compose build --no-cache api-health-safety web-health-safety
docker compose up -d api-health-safety web-health-safety
```

## Login

```
URL:      http://localhost:3000 (Dashboard) or http://localhost:3001 (H&S)
Email:    admin@ims.local
Password: admin123
```

## Health Checks

```bash
curl http://localhost:4000/health        # API Gateway
curl http://localhost:4001/health        # H&S API
curl http://localhost:4002/health        # Environment API
curl http://localhost:4003/health        # Quality API
curl http://localhost:4004/health        # AI Analysis API
curl http://localhost:4009/health        # PM API
curl http://localhost:4013/health        # Finance API
curl http://localhost:4016/health        # ESG API
curl http://localhost:4019/health        # Food Safety API
curl http://localhost:4024/health        # ISO 37001 API
```

## Service Ports

### API Services (ports 4000-4041)

| Service             | Port | Standard/Domain                     |
| ------------------- | ---- | ----------------------------------- |
| Gateway             | 4000 | Auth, routing, templates, RBAC      |
| Health & Safety     | 4001 | ISO 45001                           |
| Environment         | 4002 | ISO 14001                           |
| Quality             | 4003 | ISO 9001                            |
| AI Analysis         | 4004 | Multi-provider AI                   |
| Inventory           | 4005 | Stock management                    |
| HR                  | 4006 | Human Resources                     |
| Payroll             | 4007 | Payroll & tax                       |
| Workflows           | 4008 | Process automation                  |
| Project Management  | 4009 | PMBOK / ISO 21502                   |
| Automotive          | 4010 | IATF 16949                          |
| Medical             | 4011 | ISO 13485                           |
| Aerospace           | 4012 | AS9100D                             |
| Finance             | 4013 | Financial management                |
| CRM                 | 4014 | Customer relationship               |
| InfoSec             | 4015 | ISO 27001                           |
| ESG                 | 4016 | ESG reporting                       |
| CMMS                | 4017 | Maintenance                         |
| Portal              | 4018 | Customer/supplier                   |
| Food Safety         | 4019 | HACCP / ISO 22000                   |
| Energy              | 4020 | ISO 50001                           |
| Analytics           | 4021 | Business intelligence               |
| Field Service       | 4022 | Field operations                    |
| ISO 42001           | 4023 | AI Management                       |
| ISO 37001           | 4024 | Anti-Bribery                        |
| Marketing           | 4025 | Sales automation                    |
| Partners            | 4026 | Partner portal                      |
| Risk (ERM)          | 4027 | ISO 31000:2018 Enterprise Risk Mgmt |
| Training            | 4028 | Competence management               |
| Suppliers           | 4029 | Supplier management                 |
| Assets              | 4030 | Asset management                    |
| Documents           | 4031 | Document control                    |
| Complaints          | 4032 | Complaint management                |
| Contracts           | 4033 | Contract lifecycle                  |
| Permit to Work      | 4034 | PTW management                      |
| Regulatory Monitor  | 4035 | Reg change tracking                 |
| Incidents           | 4036 | Incident management                 |
| Audits              | 4037 | Audit programme                     |
| Mgmt Review         | 4038 | Management review                   |
| Setup Wizard        | 4039 | Guided setup wizard                 |
| Chemical Management | 4040 | COSHH / chemical safety             |
| Emergency           | 4041 | ISO 22320 / ISO 22301               |

### Web Applications (ports 3000-3045)

| Application         | Port | Domain                                |
| ------------------- | ---- | ------------------------------------- |
| Dashboard           | 3000 | Main dashboard, ROI calculator        |
| Health & Safety     | 3001 | ISO 45001                             |
| Environment         | 3002 | ISO 14001                             |
| Quality             | 3003 | ISO 9001                              |
| Settings            | 3004 | Admin & RBAC                          |
| Inventory           | 3005 | Stock management                      |
| HR                  | 3006 | Human Resources                       |
| Payroll             | 3007 | Payroll                               |
| Workflows           | 3008 | Process automation                    |
| Project Management  | 3009 | PMBOK                                 |
| Automotive          | 3010 | IATF 16949                            |
| Medical             | 3011 | ISO 13485                             |
| Aerospace           | 3012 | AS9100D                               |
| Finance             | 3013 | Financial management                  |
| CRM                 | 3014 | CRM                                   |
| InfoSec             | 3015 | ISO 27001                             |
| ESG                 | 3016 | ESG reporting                         |
| CMMS                | 3017 | Maintenance                           |
| Customer Portal     | 3018 | External customers                    |
| Supplier Portal     | 3019 | External suppliers                    |
| Food Safety         | 3020 | HACCP                                 |
| Energy              | 3021 | ISO 50001                             |
| Analytics           | 3022 | Business intelligence                 |
| Field Service       | 3023 | Field operations                      |
| ISO 42001           | 3024 | AI Management                         |
| ISO 37001           | 3025 | Anti-Bribery                          |
| Partners Portal     | 3026 | Partner portal                        |
| Admin Dashboard     | 3027 | Admin dashboard                       |
| Marketing           | 3030 | Marketing site                        |
| Risk (ERM)          | 3031 | ISO 31000:2018 (15 pages)             |
| Training            | 3032 | Competence management                 |
| Suppliers           | 3033 | Supplier management                   |
| Assets              | 3034 | Asset management                      |
| Documents           | 3035 | Document control                      |
| Complaints          | 3036 | Complaint management                  |
| Contracts           | 3037 | Contract lifecycle                    |
| Fin. Compliance     | 3038 | Financial compliance                  |
| Permit to Work      | 3039 | PTW management                        |
| Regulatory Monitor  | 3040 | Reg change tracking                   |
| Incidents           | 3041 | Incident management                   |
| Audits              | 3042 | Audit programme                       |
| Mgmt Review         | 3043 | Management review                     |
| Chemical Management | 3044 | Chemical safety management            |
| Emergency           | 3045 | Fire, emergency & disaster management |

## H&S API Endpoints (via Gateway)

```bash
curl http://localhost:4000/api/health-safety/risks
curl http://localhost:4000/api/health-safety/incidents
curl http://localhost:4000/api/health-safety/legal
curl http://localhost:4000/api/health-safety/objectives
curl http://localhost:4000/api/health-safety/capa
```

## HR API Endpoints (via Gateway)

```bash
curl http://localhost:4000/api/hr/employees
curl http://localhost:4000/api/hr/employees/org-chart
curl http://localhost:4000/api/hr/employees/stats
curl http://localhost:4000/api/hr/attendance
curl http://localhost:4000/api/hr/departments
curl http://localhost:4000/api/hr/leave/requests
curl http://localhost:4000/api/hr/performance/reviews
curl http://localhost:4000/api/hr/recruitment/jobs
curl http://localhost:4000/api/hr/training/courses
curl http://localhost:4000/api/hr/documents
```

## Payroll API Endpoints (via Gateway)

```bash
curl http://localhost:4000/api/payroll/runs
curl http://localhost:4000/api/payroll/payslips
curl http://localhost:4000/api/payroll/stats
curl http://localhost:4000/api/salary/component-types
curl http://localhost:4000/api/benefits/plans
curl http://localhost:4000/api/loans
curl http://localhost:4000/api/expenses
curl http://localhost:4000/api/tax/filings
curl http://localhost:4000/api/tax/brackets
curl http://localhost:4000/api/payroll/jurisdictions
curl http://localhost:4000/api/payroll/tax-calculator
```

## Environment API Endpoints (via Gateway)

```bash
curl http://localhost:4000/api/environment/aspects       # Aspects & Impacts (ISO 14001 Clause 6.1.2)
curl http://localhost:4000/api/environment/events        # Environmental Events
curl http://localhost:4000/api/environment/legal         # Legal Register (ISO 14001 Clause 6.1.3)
curl http://localhost:4000/api/environment/objectives    # Objectives & Targets (ISO 14001 Clause 6.2)
curl http://localhost:4000/api/environment/actions       # Environmental Actions
curl http://localhost:4000/api/environment/capa          # CAPA Management (ISO 14001 Clause 10.2)
```

## Quality API Endpoints (via Gateway) -- ISO 9001:2015

```bash
# COTO Log (Context of the Organisation)
curl http://localhost:4000/api/quality/parties            # Interested Parties
curl http://localhost:4000/api/quality/issues             # Internal/External Issues
curl http://localhost:4000/api/quality/risks              # Risk Register
curl http://localhost:4000/api/quality/opportunities      # Opportunity Register

# Core QMS
curl http://localhost:4000/api/quality/processes          # Process Register (Turtle Diagram)
curl http://localhost:4000/api/quality/nonconformances    # NCR with RCA
curl http://localhost:4000/api/quality/actions            # Action Register
curl http://localhost:4000/api/quality/documents          # Document Control
curl http://localhost:4000/api/quality/capa               # CAPA (5-Why/Fishbone/8D)

# Module Routes
curl http://localhost:4000/api/quality/legal              # Legal/Compliance Register
curl http://localhost:4000/api/quality/fmea               # FMEA (RPN: S*O*D)
curl http://localhost:4000/api/quality/improvements       # Continual Improvement (PDCA)
curl http://localhost:4000/api/quality/suppliers           # Supplier Quality (IMS Scoring)
curl http://localhost:4000/api/quality/changes            # Change Management
curl http://localhost:4000/api/quality/objectives         # Quality Objectives + Milestones
curl http://localhost:4000/api/quality/evidence-pack      # Evidence Pack Generator
curl http://localhost:4000/api/quality/headstart          # Headstart Tool
```

## Inventory API Endpoints (via Gateway)

```bash
curl http://localhost:4000/api/inventory/products
curl http://localhost:4000/api/inventory/products/low-stock
curl http://localhost:4000/api/inventory/inventory
curl http://localhost:4000/api/inventory/inventory/summary
curl http://localhost:4000/api/inventory/warehouses
curl http://localhost:4000/api/inventory/categories
curl http://localhost:4000/api/inventory/inventory/transactions
curl http://localhost:4000/api/inventory/suppliers
```

## Workflows API Endpoints (via Gateway)

```bash
curl http://localhost:4000/api/workflows/templates
curl http://localhost:4000/api/workflows/definitions
curl http://localhost:4000/api/workflows/instances
curl http://localhost:4000/api/workflows/instances/stats/summary
curl http://localhost:4000/api/workflows/tasks
curl http://localhost:4000/api/workflows/approvals/requests
curl http://localhost:4000/api/workflows/automation/rules
```

## PM API Endpoints (via Gateway)

```bash
curl http://localhost:4000/api/v1/project-management/projects
curl http://localhost:4000/api/v1/project-management/tasks
curl http://localhost:4000/api/v1/project-management/milestones
curl http://localhost:4000/api/v1/project-management/risks
curl http://localhost:4000/api/v1/project-management/issues
curl http://localhost:4000/api/v1/project-management/changes
curl http://localhost:4000/api/v1/project-management/resources
curl http://localhost:4000/api/v1/project-management/stakeholders
curl http://localhost:4000/api/v1/project-management/documents
curl http://localhost:4000/api/v1/project-management/sprints
curl http://localhost:4000/api/v1/project-management/timesheets
curl http://localhost:4000/api/v1/project-management/reports
```

## Gateway Local Endpoints

```bash
curl http://localhost:4000/api/dashboard/stats           # Dashboard data
curl http://localhost:4000/api/dashboard/compliance       # Compliance scores
curl http://localhost:4000/api/csrf-token                 # CSRF token
curl -X POST http://localhost:4000/api/auth/login         # Login
curl http://localhost:4000/api/notifications              # WebSocket notifications
curl http://localhost:4000/api/roles                      # RBAC role management
curl http://localhost:4000/api/organisations/msp-dashboard # MSP mode
curl http://localhost:4000/api/compliance/regulations      # Regulatory feed
```

## Run Tests

```bash
pnpm test                                # All Jest tests (708,565 across 712 suites — all passing)
./scripts/test-all-modules.sh            # All integration tests (master runner, 40 modules, ~1,800+ assertions)
./scripts/test-hs-modules.sh             # H&S integration tests (~70)
./scripts/test-env-modules.sh            # Environment integration tests (~60)
./scripts/test-quality-modules.sh        # Quality integration tests (~80)
./scripts/test-hr-modules.sh             # HR integration tests (~50)
./scripts/test-payroll-modules.sh        # Payroll integration tests (~40)
./scripts/test-inventory-modules.sh      # Inventory integration tests (~40)
./scripts/test-workflows-modules.sh      # Workflows integration tests (~40)
./scripts/test-pm-modules.sh             # PM integration tests (~45)
./scripts/test-finance-modules.sh        # Finance integration tests (~40)
# Plus 30 more: test-ai/automotive/medical/aerospace/crm/infosec/esg/cmms/portal
#               test-food-safety/energy/analytics/field-service
#               test-iso42001/iso37001/marketing/partners/risk/training
#               test-suppliers/assets/documents/complaints/contracts/ptw
#               test-reg-monitor/incidents/audits/mgmt-review/chemicals/emergency
pnpm test:mutation                        # Stryker mutation testing (packages/validation)
pnpm test:mutation:all                    # Stryker all — auth/security/rbac/finance/validation
pnpm test:load                            # k6 baseline smoke test (22 endpoints, 10 VUs, 1 min)
pnpm test:load:all                        # k6 baseline + crud + services
./scripts/check-services.sh              # Service health checks (86 services)
./scripts/pre-launch-check.sh            # 111-point launch readiness check
./scripts/pre-deploy-check.sh            # 7-check pre-deployment validation
./scripts/verify-backup-restore.sh       # Backup + restore verification
./scripts/typecheck-all.sh               # TypeScript check all 148 projects
./scripts/seed-all.sh                    # Seed all database schemas
./scripts/backup-db.sh                   # Backup PostgreSQL database
```

## Database

```bash
# Push schema changes (use migrate diff for multi-schema safety)
cd packages/database

# Generic pattern for any schema:
npx prisma migrate diff --from-empty \
  --to-schema-datamodel=prisma/schemas/<domain>.prisma --script | \
  PGPASSWORD=${POSTGRES_PASSWORD} psql -h localhost -p 5432 -U postgres -d ims -v ON_ERROR_STOP=0

# Generate Prisma client
npx prisma generate --schema=prisma/schemas/<domain>.prisma

# Open Prisma Studio
npx prisma studio --schema=prisma/schemas/health-safety.prisma
```

## Current Status (Feb 23, 2026)

- 42 API services + 44 web apps + PostgreSQL + Redis + main API
- **All 42 modules fully implemented** across Phases 0-17:
  - **Core**: H&S, Environment, Quality, HR, Payroll, Inventory, Workflows, PM, AI, Automotive, Medical, Aerospace
  - **Phase 2-11**: Finance, CRM, InfoSec, ESG, CMMS, Portals (Customer + Supplier), Food Safety, Energy, Analytics, Field Service, ISO 42001, ISO 37001
  - **Phase 12**: Marketing, Partners, Admin Dashboard, Setup Wizard
  - **Phase 13**: Risk (ERM), Training, Suppliers, Assets, Documents, Complaints, Contracts, PTW, Reg Monitor, Incidents, Audits, Mgmt Review, Chemicals, Emergency
  - **Phase 14**: Welcome Discovery Wizard (7-step onboarding, AI assistant, dashboard tour, onboarding checklist)
  - **Phase 15-16**: SAML SSO, SCIM provisioning, OpenAPI Scalar UI, NLQ AI fallback, security hardening, multi-tenant orgId scoping
  - **Platform**: RBAC (39 roles), WebSocket notifications, visual workflow builder, PWA offline, performance baseline, i18n (4 locales), white-label theming, marketplace
  - **Differentiators**: Evidence pack generator, headstart tool, MSP mode, regulatory feed
- 44 Prisma schemas, ~589 database models
- 61 shared packages (all with test suites)
- **Phase 17**: Compliance gap closure — ISO 45001 MOC/Contractors/Worker Consultation, HIPAA Privacy/Security/Breach, COSHH Regs 11/14/18, GRI 2-26/2-29/414-1, TCFD, ISO 27001:2022 A.5.7/A.5.23/A.8.12, AS9100D 8.5.1.2 (Nadcap/Process Parameters). 20 new route files, 15 new frontend pages, 443 new tests.
- **Tests**: **708,565 Jest tests (712 suites)** + 40 integration test scripts (~1,800+ assertions) — ALL PASSING, 0 failures
- **TypeScript**: 0 errors across all 42 APIs + 44 web apps + 61 packages (148 projects)
- **E2E**: 48 Playwright spec files, 195 tests across all 44 modules
- **Code Evaluation**: 100/100 composite score (Security 100, Architecture 100, Code Quality 100)
- **Mutation Testing**: Stryker 80.76% score (above 80% high threshold) — auth/security/rbac/finance configs
- **Coverage**: auth ≥90.9% funcs, validation 100% funcs, security ≥83% — all packages meet 85%/80% thresholds
- CI/CD: GitHub Actions workflow (daily + push/PR), Lint PASS, Build PASS, Test PASS, Typecheck PASS
- Auth: JWT Bearer token + RBAC + account lockout + refresh rate limit (20/15min) + optional CSRF
- Login pages built for all 44 web apps
- 192 built-in templates across 34 modules
- **Launch Readiness**: Pre-launch check 70/111 PASSED, 0 failures (41 expected dev warnings)
- **DB Connection Pool**: `connection_limit=1` set in all DATABASE_URL vars — all 42 services run under 100 connections total (lazy connect)
- **Sentry**: `initSentry()` wired in all 42 API services — configure `SENTRY_DSN` in .env for error monitoring
- **k6 Load Tests**: All thresholds pass — `errors: 0.71%`, `http_req_failed: 0.94%` (both < 5%)
- **OpenTelemetry**: `initTracing()` in all 42 services — OTEL Collector config at `deploy/monitoring/otel/`
- **Renovate**: Auto-merge patches, grouped dependencies, vulnerability alerts — `renovate.json` at root
- **Lighthouse CI**: `packages/performance/lighthouserc.json` — accessibility error <0.9, performance warn <0.8
- **SEO**: keywords/openGraph/robots metadata in 10 key layout.tsx files
