# IMS System Architecture Documentation

## Overview

The Integrated Management System (IMS) is a comprehensive microservices-based platform for managing organizational compliance across multiple ISO standards (ISO 9001, ISO 14001, ISO 45001). The system consists of 18 services: 9 backend APIs and 9 frontend web applications.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Web Applications                                │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐               │
│  │Dashboard│ │Health   │ │Environ- │ │Quality  │ │Settings │               │
│  │  :3000  │ │Safety   │ │ment     │ │  :3003  │ │  :3004  │               │
│  └────┬────┘ │  :3001  │ │  :3002  │ └────┬────┘ └────┬────┘               │
│       │      └────┬────┘ └────┬────┘      │           │                    │
│  ┌────┴────┐ ┌────┴────┐ ┌────┴────┐ ┌────┴────┐ ┌────┴────┐               │
│  │Inventory│ │   HR    │ │ Payroll │ │Workflows│ │         │               │
│  │  :3005  │ │  :3006  │ │  :3007  │ │  :3008  │ │         │               │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └─────────┘               │
└───────┼──────────┼──────────┼──────────┼────────────────────────────────────┘
        │          │          │          │
        └──────────┴──────────┴──────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           API Gateway (:4000)                                │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  • Authentication & Authorization (JWT)                               │   │
│  │  • Rate Limiting (100 req/15min)                                      │   │
│  │  • Request Routing & Proxying                                         │   │
│  │  • CORS Configuration                                                 │   │
│  │  • Monitoring: /health, /metrics                                      │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Domain Services                                    │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │Health-Safety│ │ Environment │ │   Quality   │ │ AI Analysis │           │
│  │   :4001     │ │   :4002     │ │   :4003     │ │   :4004     │           │
│  │  ISO 45001  │ │  ISO 14001  │ │  ISO 9001   │ │   OpenAI    │           │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │  Inventory  │ │     HR      │ │   Payroll   │ │  Workflows  │           │
│  │   :4005     │ │   :4006     │ │   :4007     │ │   :4008     │           │
│  │   Stock     │ │  Employees  │ │   Salary    │ │  Approvals  │           │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Data Layer                                      │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                    PostgreSQL Database (:5432)                        │   │
│  │                         Prisma ORM                                    │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Service Details

### API Services

| Service | Port | Description | Key Features |
|---------|------|-------------|--------------|
| **API Gateway** | 4000 | Central entry point | Auth, routing, rate limiting, proxying |
| **Health & Safety** | 4001 | ISO 45001 compliance | Risk assessments, incidents, safety training |
| **Environment** | 4002 | ISO 14001 compliance | Aspects & Impacts, Events, Legal Register, Objectives, Actions, CAPA (6 modules, 11 DB tables) |
| **Quality** | 4003 | ISO 9001 compliance | 18 Qual-prefixed models, 15 API routes: Parties, Issues, Risks, Opportunities, Processes, NCRs, Actions, Documents, CAPA (5-Why/Fishbone/8D), Legal, FMEA (RPN calc), Improvements (PDCA), Suppliers (IMS scoring), Changes, Objectives |
| **AI Analysis** | 4004 | AI-powered insights | OpenAI integration, trend analysis |
| **Inventory** | 4005 | Stock management | Products, warehouses, transactions |
| **HR** | 4006 | Human resources | Employees, attendance, recruitment |
| **Payroll** | 4007 | Payroll processing | Salaries, benefits, expenses |
| **Workflows** | 4008 | Process automation | Approvals, task management |

### Web Applications

| Application | Port | Description |
|-------------|------|-------------|
| **Dashboard** | 3000 | Main dashboard & analytics |
| **Health & Safety** | 3001 | Safety management interface |
| **Environment** | 3002 | Environmental management |
| **Quality** | 3003 | Quality management system |
| **Settings** | 3004 | System configuration |
| **Inventory** | 3005 | Inventory management |
| **HR** | 3006 | HR management |
| **Payroll** | 3007 | Payroll management |
| **Workflows** | 3008 | Workflow management |

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
# Start all 18 services
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

Total services running: 18 / 18
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
- **Logging**: Winston
- **Metrics**: prom-client (Prometheus)

### Shared Packages

| Package | Description |
|---------|-------------|
| `@ims/database` | Prisma client & schema |
| `@ims/auth` | JWT utilities |
| `@ims/types` | Shared TypeScript types |
| `@ims/ui` | React component library |
| `@ims/charts` | Chart components |
| `@ims/monitoring` | Logging, metrics, health checks |
| `@ims/calculations` | Business logic utilities |

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

## Environment Configuration

### Required Variables

```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/ims"

# Authentication
JWT_SECRET="your-secret-key-min-32-chars"

# Service URLs (for gateway)
HEALTH_SAFETY_URL=http://localhost:4001
ENVIRONMENT_URL=http://localhost:4002
QUALITY_URL=http://localhost:4003
AI_ANALYSIS_URL=http://localhost:4004
INVENTORY_URL=http://localhost:4005
HR_URL=http://localhost:4006
PAYROLL_URL=http://localhost:4007
WORKFLOWS_URL=http://localhost:4008

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

*Last Updated: February 11, 2026*
