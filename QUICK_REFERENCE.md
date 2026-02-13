# IMS Quick Reference Card

## Start All Services (Docker)
```bash
cd /home/dyl/New-BMS
docker compose up -d                    # Start all 54 services
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

### API Services (ports 4000-4024)
| Service | Port | Standard/Domain |
|---------|------|-----------------|
| Gateway | 4000 | Auth, routing, templates, RBAC |
| Health & Safety | 4001 | ISO 45001 |
| Environment | 4002 | ISO 14001 |
| Quality | 4003 | ISO 9001 |
| AI Analysis | 4004 | Multi-provider AI |
| Inventory | 4005 | Stock management |
| HR | 4006 | Human Resources |
| Payroll | 4007 | Payroll & tax |
| Workflows | 4008 | Process automation |
| Project Management | 4009 | PMBOK / ISO 21502 |
| Automotive | 4010 | IATF 16949 |
| Medical | 4011 | ISO 13485 |
| Aerospace | 4012 | AS9100D |
| Finance | 4013 | Financial management |
| CRM | 4014 | Customer relationship |
| InfoSec | 4015 | ISO 27001 |
| ESG | 4016 | ESG reporting |
| CMMS | 4017 | Maintenance |
| Portal | 4018 | Customer/supplier |
| Food Safety | 4019 | HACCP / ISO 22000 |
| Energy | 4020 | ISO 50001 |
| Analytics | 4021 | Business intelligence |
| Field Service | 4022 | Field operations |
| ISO 42001 | 4023 | AI Management |
| ISO 37001 | 4024 | Anti-Bribery |

### Web Applications (ports 3000-3025)
| Application | Port | Domain |
|-------------|------|--------|
| Dashboard | 3000 | Main dashboard |
| Health & Safety | 3001 | ISO 45001 |
| Environment | 3002 | ISO 14001 |
| Quality | 3003 | ISO 9001 |
| Settings | 3004 | Admin & RBAC |
| Inventory | 3005 | Stock management |
| HR | 3006 | Human Resources |
| Payroll | 3007 | Payroll |
| Workflows | 3008 | Process automation |
| Project Management | 3009 | PMBOK |
| Automotive | 3010 | IATF 16949 |
| Medical | 3011 | ISO 13485 |
| Aerospace | 3012 | AS9100D |
| Finance | 3013 | Financial management |
| CRM | 3014 | CRM |
| InfoSec | 3015 | ISO 27001 |
| ESG | 3016 | ESG reporting |
| CMMS | 3017 | Maintenance |
| Customer Portal | 3018 | External customers |
| Supplier Portal | 3019 | External suppliers |
| Food Safety | 3020 | HACCP |
| Energy | 3021 | ISO 50001 |
| Analytics | 3022 | Business intelligence |
| Field Service | 3023 | Field operations |
| ISO 42001 | 3024 | AI Management |
| ISO 37001 | 3025 | Anti-Bribery |

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
pnpm test                                # All Jest tests (~5,450+ across 200+ suites)
./scripts/test-all-modules.sh            # All integration tests (master runner, 9 modules)
./scripts/test-hs-modules.sh             # H&S integration tests (~70)
./scripts/test-env-modules.sh            # Environment integration tests (~60)
./scripts/test-quality-modules.sh        # Quality integration tests (~80)
./scripts/test-hr-modules.sh             # HR integration tests (~50)
./scripts/test-payroll-modules.sh        # Payroll integration tests (~40)
./scripts/test-inventory-modules.sh      # Inventory integration tests (~40)
./scripts/test-workflows-modules.sh      # Workflows integration tests (~40)
./scripts/test-pm-modules.sh             # PM integration tests (~45)
./scripts/test-finance-modules.sh        # Finance integration tests (~40)
./scripts/check-services.sh              # Service health checks (52 services)
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

## Current Status (Feb 13, 2026)
- 54 Docker containers (25 APIs + 26 web apps + PostgreSQL + Redis + main API)
- **All 25 modules fully implemented** across Phases 0-11:
  - **Core 10**: H&S, Environment, Quality, HR, Payroll, Inventory, Workflows, PM, AI, Automotive, Medical, Aerospace
  - **Phase 2-11**: Finance, CRM, InfoSec, ESG, CMMS, Portals (Customer + Supplier), Food Safety, Energy, Analytics, Field Service, ISO 42001, ISO 37001
  - **Platform**: RBAC (39 roles), WebSocket notifications, visual workflow builder, PWA offline, performance baseline
  - **Differentiators**: Evidence pack generator, headstart tool, MSP mode, regulatory feed
- 25 Prisma schemas, 373 database models
- 39 shared packages
- Tests: ~5,450+ Jest tests (200+ suites) + 9 integration test scripts (~465+ assertions) -- all passing
- CI/CD: GitHub Actions workflow (daily + push/PR), Lint PASS, Build PASS, Test PASS
- Auth: JWT Bearer token + RBAC + account lockout + optional CSRF double-submit cookie
- Login pages built for all 26 web apps
- 67 built-in templates across 11 modules
