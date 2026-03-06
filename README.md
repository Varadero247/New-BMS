# Nexara IMS

**Enterprise Integrated Management System**

[![Node 20](https://img.shields.io/badge/Node-20.x-339933?logo=node.js)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-workspace-F69220?logo=pnpm)](https://pnpm.io/)
[![Turborepo](https://img.shields.io/badge/Turborepo-2.7.5-0099FF?logo=turborepo)](https://turbo.build/)
[![Next.js 15](https://img.shields.io/badge/Next.js-15-000000?logo=next.js)](https://nextjs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22.0-2D3748?logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-4169E1?logo=postgresql)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-6+-DC382D?logo=redis)](https://redis.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/Tests-1%2C196%2C395%20passing-brightgreen)](docs/TESTING_GUIDE.md)
[![Code Score](https://img.shields.io/badge/Code%20Score-100%2F100-brightgreen)](docs/CODE_EVALUATION_REPORT.md)
[![Mutation Score](https://img.shields.io/badge/Mutation-80.76%25-yellow)](docs/MUTATION_TESTING.md)

Nexara IMS is a unified compliance intelligence platform that brings 29 ISO standards, ESG reporting, and regulatory compliance into a single AI-powered management system. Built as a monorepo with 29 ISO standards · 43 APIs · 45 web apps · 396 packages · 6 verticals, it provides enterprise-grade tooling for health & safety, environmental management, quality assurance, finance, HR, CRM, and sector-specific compliance across automotive, aerospace, medical devices, food safety, and energy.

---

> **Warning**
> **EMFILE Fix Required**: This monorepo opens 3,000+ file watchers. Before running anything, increase your file descriptor limit:
>
> ```bash
> # Add to ~/.bashrc or ~/.zshrc (do this ONCE, before anything else)
> echo "ulimit -n 65536" >> ~/.bashrc && source ~/.bashrc
> ```
>
> Without this, you will get `Error: EMFILE: too many open files` immediately.

---

## Quick Start

```bash
# 1. Clone
git clone <repo-url> && cd New-BMS

# 2. Install dependencies
pnpm install

# 3. Set up environment
cp .env.example .env   # Then edit .env with your database credentials

# 4. Set up database
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/ims?schema=public" \
  npx prisma@5.22.0 db push --schema=packages/database/prisma/schema.prisma
npx prisma@5.22.0 generate --schema=packages/database/prisma/schema.prisma
npx tsx packages/database/prisma/seed.ts

# 5. Start development
ulimit -n 65536 && pnpm dev --filter='!@ims/mobile'
```

Default login credentials after seeding:

| Email             | Password | Role    |
| ----------------- | -------- | ------- |
| admin@ims.local   | admin123 | ADMIN   |
| manager@ims.local | admin123 | MANAGER |
| auditor@ims.local | admin123 | AUDITOR |

## Service Directory

### API Services (Express.js)

| Service                | Port | Domain                                 |
| ---------------------- | ---- | -------------------------------------- |
| api-gateway            | 4000 | Auth, routing, sessions, proxying      |
| api-health-safety      | 4001 | ISO 45001 — Health & Safety            |
| api-environment        | 4002 | ISO 14001 — Environmental Management   |
| api-quality            | 4003 | ISO 9001 — Quality Management          |
| api-ai-analysis        | 4004 | AI/ML Analysis Engine                  |
| api-inventory          | 4005 | Inventory Management                   |
| api-hr                 | 4006 | Human Resources                        |
| api-payroll            | 4007 | Payroll Processing                     |
| api-workflows          | 4008 | Workflow Automation                    |
| api-project-management | 4009 | Project Management                     |
| api-automotive         | 4010 | IATF 16949 — Automotive                |
| api-medical            | 4011 | ISO 13485 — Medical Devices            |
| api-aerospace          | 4012 | AS9100 — Aerospace                     |
| api-finance            | 4013 | Finance Management                     |
| api-crm                | 4014 | Customer Relationship Management       |
| api-infosec            | 4015 | ISO 27001 — Information Security       |
| api-esg                | 4016 | ESG / CSRD Reporting                   |
| api-cmms               | 4017 | CMMS / Asset Management                |
| api-portal             | 4018 | Customer & Supplier Portal             |
| api-food-safety        | 4019 | ISO 22000 — Food Safety                |
| api-energy             | 4020 | ISO 50001 — Energy Management          |
| api-analytics          | 4021 | Analytics & Reporting                  |
| api-field-service      | 4022 | Field Service Management               |
| api-iso42001           | 4023 | ISO 42001 — AI Management              |
| api-iso37001           | 4024 | ISO 37001 — Anti-Bribery               |
| api-marketing          | 4025 | Marketing Automation                   |
| api-partners           | 4026 | Partner Management                     |
| api-risk               | 4027 | ISO 31000 — Enterprise Risk Management |
| api-training           | 4028 | Training & Competency Management       |
| api-suppliers          | 4029 | Supplier Management                    |
| api-assets             | 4030 | Asset Management                       |
| api-documents          | 4031 | Document Management                    |
| api-complaints         | 4032 | Complaints Management                  |
| api-contracts          | 4033 | Contract Management                    |
| api-ptw                | 4034 | Permit to Work                         |
| api-reg-monitor        | 4035 | Regulatory Monitor                     |
| api-incidents          | 4036 | Incident Management                    |
| api-audits             | 4037 | Audit Management                       |
| api-mgmt-review        | 4038 | Management Review                      |
| api-setup-wizard       | 4039 | Setup Wizard                           |
| api-chemicals          | 4040 | Chemical Management (COSHH/GHS)        |
| api-emergency          | 4041 | Fire, Emergency & Disaster Management  |
| api-search             | 4050 | Global Search microservice             |

### Web Applications (Next.js 15)

| App                    | Port | Domain                                |
| ---------------------- | ---- | ------------------------------------- |
| web-dashboard          | 3000 | Main Dashboard                        |
| web-health-safety      | 3001 | Health & Safety                       |
| web-environment        | 3002 | Environmental Management              |
| web-quality            | 3003 | Quality Management                    |
| web-settings           | 3004 | System Settings                       |
| web-inventory          | 3005 | Inventory                             |
| web-hr                 | 3006 | Human Resources                       |
| web-payroll            | 3007 | Payroll                               |
| web-workflows          | 3008 | Workflows                             |
| web-project-management | 3009 | Project Management                    |
| web-automotive         | 3010 | Automotive (IATF 16949)               |
| web-medical            | 3011 | Medical Devices                       |
| web-aerospace          | 3012 | Aerospace (AS9100)                    |
| web-finance            | 3013 | Finance                               |
| web-crm                | 3014 | CRM                                   |
| web-infosec            | 3015 | InfoSec (ISO 27001)                   |
| web-esg                | 3016 | ESG Reporting                         |
| web-cmms               | 3017 | CMMS                                  |
| web-customer-portal    | 3018 | Customer Portal                       |
| web-supplier-portal    | 3019 | Supplier Portal                       |
| web-food-safety        | 3020 | Food Safety                           |
| web-energy             | 3021 | Energy Management                     |
| web-analytics          | 3022 | Analytics                             |
| web-field-service      | 3023 | Field Service                         |
| web-iso42001           | 3024 | AI Management                         |
| web-iso37001           | 3025 | Anti-Bribery                          |
| web-partners           | 3026 | Partner Portal                        |
| web-admin              | 3027 | Admin Dashboard                       |
| web-marketing          | 3030 | Marketing Site                        |
| web-risk               | 3031 | Enterprise Risk Management            |
| web-training           | 3032 | Training & Competency                 |
| web-suppliers          | 3033 | Supplier Management                   |
| web-assets             | 3034 | Asset Management                      |
| web-documents          | 3035 | Document Management                   |
| web-complaints         | 3036 | Complaints Management                 |
| web-contracts          | 3037 | Contract Management                   |
| web-finance-compliance | 3038 | Financial Compliance                  |
| web-ptw                | 3039 | Permit to Work                        |
| web-reg-monitor        | 3040 | Regulatory Monitor                    |
| web-incidents          | 3041 | Incident Management                   |
| web-audits             | 3042 | Audit Management                      |
| web-mgmt-review        | 3043 | Management Review                     |
| web-chemicals          | 3044 | Chemical Management                   |
| web-emergency          | 3045 | Fire, Emergency & Disaster Management |
| web-training-portal    | 3046 | Training Portal (activation-key gated) |

## ISO Standards Coverage

| Standard                   | Module             | Domain                            |
| -------------------------- | ------------------ | --------------------------------- |
| ISO 9001:2015              | Quality            | Quality Management Systems        |
| ISO 14001:2015             | Environment        | Environmental Management          |
| ISO 45001:2018             | Health & Safety    | Occupational Health & Safety      |
| ISO 27001:2022             | InfoSec            | Information Security              |
| ISO 22000:2018             | Food Safety        | Food Safety Management            |
| ISO 13485:2016             | Medical            | Medical Device Quality            |
| ISO 42001:2023             | AI Management      | AI Management Systems             |
| ISO 37001:2016             | Anti-Bribery       | Anti-Bribery Management           |
| ISO 50001:2018             | Energy             | Energy Management                 |
| IATF 16949:2016            | Automotive         | Automotive Quality                |
| AS9100 Rev D               | Aerospace          | Aerospace Quality                 |
| ESG / CSRD                 | ESG                | Environmental, Social, Governance |
| GDPR                       | InfoSec / Settings | Data Protection                   |
| + 16 additional frameworks | Various            | Sector-specific compliance        |

## Project Structure

```
New-BMS/
├── apps/
│   ├── api-gateway/          # Central API gateway (port 4000)
│   ├── api-health-safety/    # H&S API service (port 4001)
│   ├── api-environment/      # Environment API (port 4002)
│   ├── api-quality/          # Quality API (port 4003)
│   ├── api-*/                # ... 38 more API services
│   ├── web-dashboard/        # Main dashboard (port 3000)
│   ├── web-health-safety/    # H&S frontend (port 3001)
│   ├── web-*/                # ... 42 more web apps
│   └── mobile/               # Mobile app (excluded from dev)
├── packages/
│   ├── database/             # Prisma schemas + generated clients
│   ├── auth/                 # JWT authentication
│   ├── rbac/                 # Role-based access control
│   ├── ui/                   # Shared UI components (shadcn/ui)
│   ├── monitoring/           # Health checks, metrics, logging
│   ├── email/                # Email templates + sending
│   ├── event-bus/            # Cross-service event system
│   ├── sdk/                  # @ims/sdk public SDK
│   └── .../                  # 396 total shared packages
├── scripts/
│   ├── startup.sh            # Full system startup
│   ├── start-all-services.sh # Start all 89 services
│   ├── stop-all-services.sh  # Stop all services
│   └── check-services.sh     # Health check all services
├── docs/                     # Documentation
├── turbo.json                # Turborepo pipeline config
├── pnpm-workspace.yaml       # pnpm workspace definition
└── package.json              # Root scripts and dependencies
```

## Environment Setup

See [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) for the complete development environment guide.

## Documentation

| Document                                                      | Description                                              |
| ------------------------------------------------------------- | -------------------------------------------------------- |
| [DEVELOPER_ONBOARDING.md](docs/DEVELOPER_ONBOARDING.md)      | New developer setup — Day 1 guide, architecture, gotchas |
| [TESTING_GUIDE.md](docs/TESTING_GUIDE.md)                    | All 7 test layers — unit, integration, load, UAT, E2E    |
| [RUNBOOK.md](docs/RUNBOOK.md)                                 | Operational runbook — alerts, incidents, deployment      |
| [SYSTEM-ARCHITECTURE.md](docs/SYSTEM-ARCHITECTURE.md)        | System architecture, diagrams, and design decisions      |
| [API_REFERENCE.md](docs/API_REFERENCE.md)                    | Full API reference for all 43 services + api-search      |
| [DEPLOYMENT_CHECKLIST.md](docs/DEPLOYMENT_CHECKLIST.md)      | Production deployment and restart procedure              |
| [SECURITY.md](docs/SECURITY.md)                              | Security implementation details                          |
| [MUTATION_TESTING.md](docs/MUTATION_TESTING.md)              | Stryker mutation testing guide (80.76% score)            |
| [DOCUMENTATION_INDEX.md](docs/DOCUMENTATION_INDEX.md)        | Full index of all project documentation                  |
| [CONTRIBUTING.md](CONTRIBUTING.md)                           | How to contribute — new modules, code standards, PRs     |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to add new modules, code standards, testing requirements, and PR checklist.

## License

Proprietary. All rights reserved.

---

_Nexara IMS — Every standard. One intelligent platform._
