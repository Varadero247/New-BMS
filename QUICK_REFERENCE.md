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
# Risks
curl http://localhost:4000/api/health-safety/risks
# Incidents
curl http://localhost:4000/api/health-safety/incidents
# Legal Requirements
curl http://localhost:4000/api/health-safety/legal
# OHS Objectives
curl http://localhost:4000/api/health-safety/objectives
# CAPA
curl http://localhost:4000/api/health-safety/capa
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
- AI: 5 Claude Sonnet 4.5 routes for H&S analysis
- Tests: 117 Jest unit tests + 70 integration tests passing
- Auth: JWT + CSRF double-submit cookie
- Login pages built for all web apps
