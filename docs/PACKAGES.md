# Shared Packages Reference — Nexara IMS

59 shared packages in `packages/`. All use `@ims/*` scope except the public SDK (`@nexara/sdk`).

---

## Package Directory

### Core Infrastructure

| Package | Purpose | Key Exports |
|---------|---------|-------------|
| `@ims/database` | Prisma client + 200+ model schemas | `prisma`, domain-specific clients |
| `@ims/types` | Shared TypeScript types and enums | Type definitions |
| `@ims/shared` | Common utilities | Formatters, validators, constants |
| `@ims/auth` | JWT authentication middleware | `authenticateToken`, `verifyToken` |
| `@ims/service-auth` | Inter-service JWT auth | `generateServiceToken`, `verifyServiceToken` |
| `@ims/monitoring` | Logging, metrics, health checks | `createLogger`, `metricsMiddleware`, `metricsHandler`, `correlationIdMiddleware`, `createHealthCheck` |
| `@ims/validation` | Zod validation schemas | Schema definitions for requests |
| `@ims/secrets` | Secrets management | `validateStartupSecrets` |

### Access Control and Security

| Package | Purpose | Key Exports |
|---------|---------|-------------|
| `@ims/rbac` | Role-based access control (39 roles, 17 modules) | `attachPermissions`, role definitions |
| `@ims/portal-auth` | Portal authentication (customer/supplier) | Portal auth middleware |
| `@ims/dpa` | Data Processing Agreements | DPA management |
| `@ims/dsar` | Data Subject Access Requests (GDPR) | DSAR handling |
| `@ims/esig` | Electronic signature capture | Signature verification |

### Communication

| Package | Purpose | Key Exports |
|---------|---------|-------------|
| `@ims/email` | Email sending via Nodemailer | `sendEmail`, templates |
| `@ims/notifications` | WebSocket real-time notifications | Notification bell component |
| `@ims/webhooks` | Outbound webhook delivery | Webhook dispatcher |
| `@ims/event-bus` | Cross-service event bus (Redis Streams) | `NEXARA_EVENTS`, publisher, subscriber |

### UI and Frontend

| Package | Purpose | Key Exports |
|---------|---------|-------------|
| `@ims/ui` | React component library (76 components, 76 Storybook stories) | `Modal`, `Button`, `Table`, `DataTable`, `SignatureCapture`, etc. |
| `@ims/charts` | Recharts wrapper components | Chart configurations |
| `@ims/i18n` | Internationalisation | `I18nProvider`, `useTranslation` |
| `@ims/pwa` | Progressive Web App utilities | Service worker, offline sync |
| `@ims/a11y` | Accessibility testing (axe-core WCAG 2.2 AA) | Audit runner |

### Domain Engines

| Package | Purpose | Key Exports |
|---------|---------|-------------|
| `@ims/calculations` | Risk scoring, compliance calculations | Scoring functions |
| `@ims/tax-engine` | Multi-jurisdiction tax calculation | Tax calculators |
| `@ims/finance-calculations` | Financial utilities | Depreciation, ratios |
| `@ims/emission-factors` | GHG emission factor database | Emission data |
| `@ims/oee-engine` | Overall Equipment Effectiveness | OEE calculations |
| `@ims/spc-engine` | Statistical Process Control | Control charts, Cp/Cpk |
| `@ims/nlq` | Natural language query engine | Query parser |
| `@ims/readiness` | Audit readiness scoring | Readiness engine |

### Compliance and Standards

| Package | Purpose | Key Exports |
|---------|---------|-------------|
| `@ims/iso-checklists` | ISO clause checklists | Checklist data |
| `@ims/standards-convergence` | Cross-standard mapping (Annex SL) | Convergence engine |
| `@ims/regulatory-feed` | Live regulatory change feed | Feed processor |
| `@ims/templates` | 192 built-in document/report templates | Template renderer |

### Data and Integration

| Package | Purpose | Key Exports |
|---------|---------|-------------|
| `@ims/csv-import` | CSV parsing and import | CSV parser |
| `@ims/file-upload` | File upload handling (S3-compatible) | Upload middleware |
| `@ims/pdf-generator` | PDF generation from templates | PDF builder |
| `@ims/cache` | Redis cache utilities | `get`, `set`, `invalidate` |
| `@ims/openapi` | OpenAPI/Swagger spec generation | Spec builder |

### External Service Clients

| Package | Purpose | Key Exports |
|---------|---------|-------------|
| `@ims/hubspot-client` | HubSpot CRM API | HubSpot client |
| `@ims/stripe-client` | Stripe payment API | Stripe client |
| `@ims/intercom-client` | Intercom messaging API | Intercom client |

### Automation and Operations

| Package | Purpose | Key Exports |
|---------|---------|-------------|
| `@ims/automation-rules` | Rule engine for automated workflows | Rule evaluator |
| `@ims/scheduled-reports` | Cron-based report generation | Report scheduler |
| `@ims/feature-flags` | Feature flag system | Flag evaluator |
| `@ims/plan-guard` | Subscription plan enforcement | Plan checker |
| `@ims/resilience` | Circuit breakers, retry logic | Circuit breaker |

### Activity and Tracking

| Package | Purpose | Key Exports |
|---------|---------|-------------|
| `@ims/audit` | Audit trail middleware | Audit logger |
| `@ims/activity` | Activity logging middleware | Activity tracker |
| `@ims/presence` | Real-time user presence | Presence tracker |
| `@ims/nps` | NPS survey system | Survey collector |
| `@ims/comments` | Threaded comments | Comment system |
| `@ims/changelog` | Changelog management | Changelog CRUD |
| `@ims/tasks` | Task management | Task primitives |
| `@ims/status` | System status page data | Status checker |

### Testing and Performance

| Package | Purpose | Key Exports |
|---------|---------|-------------|
| `@ims/testing` | Shared test utilities and fixtures | Test helpers |
| `@ims/performance` | k6 load tests, Lighthouse CI, WCAG | Test runners |
| `@ims/benchmarks` | Performance benchmarking | Benchmark runner |

### Public SDK

| Package | Purpose | Key Exports |
|---------|---------|-------------|
| `@nexara/sdk` | Public SDK for external integrations | `NexaraClient`, `NexaraConfig` |

---

## Creating a New Package

```
packages/my-package/
├── src/
│   └── index.ts
├── package.json
├── tsconfig.json
└── __tests__/
    └── my-package.test.ts
```

### package.json template

```json
{
  "name": "@ims/my-package",
  "version": "1.0.0",
  "main": "dist/index.js",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts",
  "scripts": {
    "dev": "tsup src/index.ts --format cjs,esm --watch --no-dts",
    "build": "tsup src/index.ts --format cjs,esm --dts --clean",
    "test": "jest"
  },
  "devDependencies": {
    "tsup": "^8.0.0",
    "typescript": "^5.0.0"
  }
}
```

### Adding to Consuming Apps

In the app's `package.json`:

```json
{
  "dependencies": {
    "@ims/my-package": "workspace:*"
  }
}
```

Then run `pnpm install` to link the workspace package.

### Import Example

```typescript
import { myFunction } from '@ims/my-package';
```
