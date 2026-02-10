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
- H&S: 5 modules fully implemented (Risks, Incidents, Legal, Objectives, CAPA)
- HR: 8 modules fully implemented (Employees, Attendance, Departments, Leave, Performance, Recruitment, Training, Documents) — 40+ endpoints
- Payroll: 6 modules fully implemented (Payroll, Salary, Benefits, Loans, Expenses, Tax) — 35+ endpoints
- AI: 5 Claude Sonnet 4.5 routes for H&S analysis
- Tests: 117 Jest unit tests + 70 integration tests passing
- Auth: JWT + CSRF double-submit cookie
- Login pages built for all web apps
