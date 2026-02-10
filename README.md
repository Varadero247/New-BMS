# IMS - Integrated Management System

A modular Integrated Management System for ISO compliance (ISO 45001, ISO 14001, ISO 9001) with separate applications for Health & Safety, Environmental, and Quality management.

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Express.js, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Mobile**: Capacitor (iOS/Android)
- **Monorepo**: pnpm workspaces + Turborepo
- **AI**: Anthropic Claude (Sonnet 4.5) for H&S analysis, OpenAI, Grok
- **Deployment**: Docker Compose with 18 containerized services

## Architecture

```
ims-monorepo/
├── apps/
│   ├── web-dashboard/       # Main IMS Dashboard (Port 3000)
│   ├── web-health-safety/   # ISO 45001 Module (Port 3001)
│   ├── web-environment/     # ISO 14001 Module (Port 3002)
│   ├── web-quality/         # ISO 9001 Module (Port 3003)
│   ├── web-settings/        # Settings & Admin (Port 3004)
│   ├── api-gateway/         # API Gateway (Port 4000)
│   ├── api-health-safety/   # H&S API Service (Port 4001)
│   ├── api-environment/     # Environmental API (Port 4002)
│   ├── api-quality/         # Quality API (Port 4003)
│   ├── api-ai-analysis/     # AI Analysis API (Port 4004)
│   └── mobile/              # Capacitor mobile app
├── packages/
│   ├── database/            # Prisma schemas and clients (core + H&S)
│   ├── types/               # Shared TypeScript types
│   ├── ui/                  # Shared UI components
│   ├── charts/              # Chart components
│   ├── auth/                # Authentication middleware (JWT)
│   ├── calculations/        # ISO calculation formulas
│   ├── monitoring/          # Winston logging, Prometheus metrics, health checks
│   ├── validation/          # Zod validation schemas
│   ├── resilience/          # Circuit breakers, retry logic
│   ├── audit/               # Activity audit trail
│   ├── secrets/             # HashiCorp Vault integration
│   ├── email/               # Email templates and sending
│   └── file-upload/         # Multi-format file handling
├── scripts/                 # Service management & test scripts
├── docker-compose.yml
└── turbo.json
```

## Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL 16+
- Docker (optional)

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
OPENAI_API_KEY=your-openai-key (optional)
ANTHROPIC_API_KEY=your-anthropic-key (optional)
```

### 3. Start Database

```bash
docker-compose up -d postgres redis
```

### 4. Setup Database

```bash
# Generate Prisma client
pnpm db:generate

# Push schema to database
pnpm db:push

# Seed with demo data
pnpm --filter @ims/database seed
```

### 5. Start Development

```bash
# Start all apps
pnpm dev

# Or start specific modules
pnpm dev:dashboard      # Dashboard + Gateway
pnpm dev:health-safety  # H&S Module + API + Gateway
pnpm dev:environment    # Environmental Module + API + Gateway
pnpm dev:quality        # Quality Module + API + Gateway
pnpm dev:settings       # Settings + AI API + Gateway

# Start APIs only
pnpm dev:apis

# Start web apps only
pnpm dev:web
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
| `pnpm build` | Build all apps |
| `pnpm build:packages` | Build shared packages only |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:push` | Push schema to database |
| `pnpm db:migrate` | Run database migrations |
| `pnpm db:studio` | Open Prisma Studio |

## Module Overview

### Health & Safety (ISO 45001) — Fully Implemented

5 modules with full CRUD APIs, AI integration (Claude Sonnet 4.5), and interactive frontends:

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

### Environmental (ISO 14001)
- Aspects & Impacts Register
- Environmental event tracking
- Significance calculations
- Environmental indicators
- Compliance obligations

### Quality (ISO 9001)
- Process Register
- Nonconformance management
- Quality metrics (COPQ, DPMO, Sigma, FPY)
- Customer complaints
- Corrective actions

### AI Analysis (Claude Sonnet 4.5)
- Risk controls generation (ISO 45001 Hierarchy of Controls)
- Incident root cause analysis (5-Why, ICAM methodology)
- Legal compliance assessment (UK/EU OHS legislation)
- SMART objective generation with KPIs and milestones
- CAPA root cause + corrective/preventive action generation
- Fishbone diagrams, Bow-Tie analysis, Pareto analysis

## API Gateway Routes

| Route | Target |
|-------|--------|
| `/api/auth/*` | Local (Gateway) |
| `/api/users/*` | Local (Gateway) |
| `/api/dashboard/*` | Local (Gateway) |
| `/api/health-safety/*` | api-health-safety:4001 (risks, incidents, legal, objectives, capa) |
| `/api/environment/*` | api-environment:4002 |
| `/api/quality/*` | api-quality:4003 |
| `/api/ai/*` | api-ai-analysis:4004 |

## Demo Credentials

```
Email: admin@ims.local
Password: admin123
```

## Docker Deployment

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

## Adding New Modules

To add a new module (e.g., Sales CRM):

1. Create web app: `apps/web-sales/`
2. Create API service: `apps/api-sales/`
3. Add routes to API gateway
4. Add navigation links in dashboard sidebar
5. Update docker-compose.yml
6. Run `pnpm install`

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
// Import UI components
import { Button, Card, Badge } from '@ims/ui';

// Import charts
import { ComplianceGauge, RiskMatrix } from '@ims/charts';

// Import calculations
import { calculateRiskScore, calculateLTIFR } from '@ims/calculations';

// Import types
import { Risk, Incident, HSLegalRequirement, OhsObjective, Capa } from '@ims/types';

// Import monitoring
import { createLogger, metricsMiddleware, createHealthCheck } from '@ims/monitoring';
```

## Testing

```bash
# Run all Jest unit tests (117 tests across 5 suites)
pnpm test

# Run H&S integration tests (70 tests)
./scripts/test-hs-modules.sh

# Run specific test suite
npx jest --config jest.config.js apps/api-health-safety/__tests__/risks.api.test.ts
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
