# IMS Quick Reference Card

## Start All Services (Docker)
```bash
cd /home/dyl/New-BMS
docker compose up -d                    # Start all 18 services
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
```

## Service Ports
| Service | API Port | Web Port |
|---------|----------|----------|
| Gateway/Dashboard | 4000 | 3000 |
| Health & Safety | 4001 | 3001 |
| Environment | 4002 | 3002 |
| Quality | 4003 | 3003 |
| AI Analysis | 4004 | — |
| Inventory | 4005 | 3005 |
| HR | 4006 | 3006 |
| Payroll | 4007 | 3007 |
| Workflows | 4008 | 3008 |
| Settings | — | 3004 |

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
```

## Environment API Endpoints (via Gateway)
```bash
curl http://localhost:4000/api/environment/risks        # Aspects & Impacts
curl http://localhost:4000/api/environment/incidents     # Environmental Events
curl http://localhost:4000/api/environment/legal         # Legal Register
curl http://localhost:4000/api/environment/objectives    # Objectives
```

## Quality API Endpoints (via Gateway)
```bash
curl http://localhost:4000/api/quality/nonconformances
curl http://localhost:4000/api/quality/actions
curl http://localhost:4000/api/quality/processes
curl http://localhost:4000/api/quality/capas             # 8D CAPA
curl http://localhost:4000/api/quality/audits
curl http://localhost:4000/api/quality/documents
curl http://localhost:4000/api/quality/qms-risks
curl http://localhost:4000/api/quality/fmea
curl http://localhost:4000/api/quality/ci/projects       # Continuous Improvement
curl http://localhost:4000/api/quality/suppliers/qualifications
curl http://localhost:4000/api/quality/change-requests
curl http://localhost:4000/api/quality/training/courses
curl http://localhost:4000/api/quality/metrics/quality
curl http://localhost:4000/api/quality/templates
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

## Gateway Local Endpoints
```bash
curl http://localhost:4000/api/dashboard/stats           # Dashboard data
curl http://localhost:4000/api/dashboard/compliance       # Compliance scores
curl http://localhost:4000/api/csrf-token                 # CSRF token
curl -X POST http://localhost:4000/api/auth/login         # Login
```

## Run Tests
```bash
pnpm test                                # All Jest tests (117)
./scripts/test-hs-modules.sh             # Integration tests (70)
./scripts/check-services.sh              # Service health checks
```

## Database
```bash
# Push schema changes
cd packages/database
npx prisma db push --schema=prisma/schemas/health-safety.prisma
npx prisma generate --schema=prisma/schemas/health-safety.prisma

# Open Prisma Studio
npx prisma studio --schema=prisma/schemas/health-safety.prisma
```

## Current Status (Feb 10, 2026)
- 18 Docker services running (9 APIs + 9 web apps)
- **All 9 modules fully implemented**:
  - H&S: 5 sub-modules (Risks, Incidents, Legal, Objectives, CAPA) + 5 AI routes
  - Environment: 4 sub-modules (Aspects, Events, Legal, Objectives) + 8 DB models
  - Quality: 15 sub-modules (NCRs, CAPA 8D, Audits, Documents, FMEA, CI, Suppliers, etc.) — 100+ endpoints
  - HR: 8 sub-modules (Employees, Attendance, Departments, Leave, Performance, Recruitment, Training, Documents) — 40+ endpoints
  - Payroll: 6 sub-modules (Payroll, Salary, Benefits, Loans, Expenses, Tax) — 35+ endpoints
  - Inventory: 6 sub-modules (Products, Inventory, Warehouses, Categories, Transactions, Suppliers) — 25+ endpoints
  - Workflows: 6 sub-modules (Templates, Definitions, Instances, Tasks, Approvals, Automation) — 57+ endpoints
  - AI Analysis: Central analysis service + 5 H&S-specific AI routes (Claude Sonnet 4.5)
  - Gateway: Auth, users, sessions, dashboard, CSRF — 20+ local endpoints
- Tests: 117 Jest unit tests + 70 integration tests passing
- Auth: JWT + CSRF double-submit cookie + account lockout
- Login pages built for all 9 web apps
- Total API endpoints: 350+
