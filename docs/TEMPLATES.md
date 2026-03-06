# Template Library — Developer Guide

---
> **CONFIDENTIAL — TRADE SECRET**
> This document is the property of Nexara DMCC and contains confidential and
> proprietary information. Unauthorised disclosure is prohibited.
> © 2026 Nexara DMCC. All rights reserved.
---


## Overview

The IMS Template Library provides 192 built-in templates across 34 modules, plus 18 Risk Management DOCX compliance templates. Templates are managed centrally via the API Gateway and stored in the core PostgreSQL database. The platform has 43 API services + api-search (4050), 45 web apps, and 396 shared packages — templates integrate with 12 of the 44 web frontends.

## Architecture

```
packages/templates/          — @ims/templates package (types, renderer, exporter, seed data)
packages/database/           — Prisma models (Template, TemplateVersion, TemplateInstance)
apps/api-gateway/            — REST API (12 endpoints at /api/v1/templates)
apps/web-*/                  — Frontend pages (12 apps with /templates route)
```

### Key Design Decisions

- **Gateway-hosted**: Templates are cross-module, so all routes live on the gateway (port 4000), not individual services.
- **core.prisma**: Template models are in the core schema alongside User, AuditLog, etc.
- **HTML export**: Uses inline-CSS HTML strings (no Puppeteer/Chromium needed for Alpine containers).
- **Gateway client**: Each frontend has a `src/lib/gateway.ts` axios client pointed at `http://localhost:4000/api/v1`.

## Database Models

### Template

Primary template definition with fields, metadata, and versioning.

| Field      | Type             | Description                         |
| ---------- | ---------------- | ----------------------------------- |
| code       | String (unique)  | `TPL-{MODULE}-{NNN}` format         |
| name       | String           | Template display name               |
| module     | TemplateModule   | One of 34 modules                   |
| category   | TemplateCategory | One of 17 categories                |
| status     | TemplateStatus   | DRAFT, ACTIVE, DEPRECATED, ARCHIVED |
| version    | Int              | Auto-incremented on update          |
| fields     | Json             | Array of FieldDefinition            |
| isBuiltIn  | Boolean          | true for seed templates             |
| usageCount | Int              | Incremented when template is used   |

### TemplateVersion

Snapshot of a template before each update (automatic versioning).

### TemplateInstance

Record of a filled-out template (created via POST /:id/use).

## API Reference

Base URL: `http://localhost:4000/api/v1/templates`

All endpoints require Bearer token authentication.

| Method | Path                            | Auth                          | Description                                                           |
| ------ | ------------------------------- | ----------------------------- | --------------------------------------------------------------------- |
| GET    | `/`                             | USER+                         | List templates (filter: module, category, status, search, page/limit) |
| GET    | `/stats`                        | USER+                         | Usage statistics per module/category                                  |
| GET    | `/search?q=`                    | USER+                         | Full-text search                                                      |
| GET    | `/:id`                          | USER+                         | Single template with full fields                                      |
| POST   | `/`                             | MANAGER+                      | Create custom template                                                |
| PUT    | `/:id`                          | MANAGER+                      | Update (auto-versions current state)                                  |
| DELETE | `/:id`                          | MANAGER+ (ADMIN for built-in) | Soft-delete                                                           |
| POST   | `/:id/clone`                    | MANAGER+                      | Clone template (new code, isBuiltIn=false)                            |
| POST   | `/:id/use`                      | USER+                         | Create instance (increments usageCount)                               |
| GET    | `/:id/versions`                 | USER+                         | Version history                                                       |
| POST   | `/:id/versions/:v/restore`      | MANAGER+                      | Restore prior version                                                 |
| GET    | `/:id/export?format=html\|json` | USER+                         | Download as HTML or JSON                                              |

### Response Shape

```json
{ "success": true, "data": [...], "pagination": { "page": 1, "limit": 20, "total": 67, "pages": 4 } }
```

## Field Types

| Type        | Renders As                      | Notes                                 |
| ----------- | ------------------------------- | ------------------------------------- |
| text        | `<input type="text">`           | Single line                           |
| textarea    | `<textarea>`                    | Multi-line                            |
| number      | `<input type="number">`         | With min/max validation               |
| date        | `<input type="date">`           |                                       |
| datetime    | `<input type="datetime-local">` |                                       |
| select      | `<select>`                      | Single choice from options[]          |
| multiselect | Multi-checkbox group            | Multiple choices                      |
| checkbox    | `<input type="checkbox">`       | Boolean                               |
| radio       | Radio button group              | Single choice                         |
| email       | `<input type="email">`          |                                       |
| url         | `<input type="url">`            |                                       |
| tel         | `<input type="tel">`            |                                       |
| signature   | Signature field                 |                                       |
| file        | File upload                     |                                       |
| section     | `<h3>` divider                  | Visual grouping, no data              |
| table       | Repeatable row group            | Uses columns[] for column definitions |
| rating      | 1-5 star rating                 |                                       |

## Adding a New Template

1. Create or edit the seed file in `packages/templates/src/seeds/{module}.ts`
2. Add your template to the exported array:

```typescript
{
  code: 'TPL-HS-009',
  name: 'Fire Risk Assessment',
  description: 'Assessment of fire hazards and controls',
  module: 'HEALTH_SAFETY',
  category: 'RISK_ASSESSMENT',
  tags: ['fire', 'risk', 'assessment'],
  fields: [
    { id: 'section_info', label: 'Assessment Information', type: 'section' },
    { id: 'assessor', label: 'Assessor Name', type: 'text', required: true },
    { id: 'date', label: 'Assessment Date', type: 'date', required: true },
    { id: 'location', label: 'Location', type: 'text', required: true },
    // ... more fields
  ],
}
```

3. Rebuild the package: `pnpm build --filter=@ims/templates`
4. Re-seed: `npx tsx packages/database/prisma/seed-templates.ts`

## Template Codes by Module

| Module              | Prefix   | Count   | Range   |
| ------------------- | -------- | ------- | ------- |
| Health & Safety     | TPL-HS   | 8       | 001-008 |
| Environment         | TPL-ENV  | 9       | 001-009 |
| Quality             | TPL-QMS  | 10      | 001-010 |
| Automotive          | TPL-AUTO | 11      | 001-011 |
| Medical             | TPL-MED  | 9       | 001-009 |
| Aerospace           | TPL-AERO | 8       | 001-008 |
| HR                  | TPL-HR   | 5       | 001-005 |
| Workflows           | TPL-WF   | 2       | 001-002 |
| Project Management  | TPL-PM   | 10      | 001-010 |
| Inventory           | TPL-INV  | 2       | 001-002 |
| Payroll             | TPL-PAY  | 5       | 001-005 |
| CRM                 | TPL-CRM  | 5       | 001-005 |
| Finance             | TPL-FIN  | 5       | 001-005 |
| InfoSec             | TPL-SEC  | 5       | 001-005 |
| ISO 37001           | TPL-AB   | 5       | 001-005 |
| ISO 42001           | TPL-AI   | 5       | 001-005 |
| ESG                 | TPL-ESG  | 5       | 001-005 |
| CMMS                | TPL-MNT  | 5       | 001-005 |
| Food Safety         | TPL-FS   | 5       | 001-005 |
| Energy              | TPL-ENR  | 5       | 001-005 |
| Field Service       | TPL-FSV  | 5       | 001-005 |
| Analytics           | TPL-ANL  | 5       | 001-005 |
| Risk                | TPL-RISK | 4       | 001-004 |
| Training            | TPL-TRN  | 4       | 001-004 |
| Suppliers           | TPL-SUP  | 3       | 001-003 |
| Assets              | TPL-AST  | 3       | 001-003 |
| Documents           | TPL-DOC  | 3       | 001-003 |
| Complaints          | TPL-CMP  | 3       | 001-003 |
| Contracts           | TPL-CON  | 3       | 001-003 |
| PTW                 | TPL-PTW  | 3       | 001-003 |
| Incidents           | TPL-INC  | 3       | 001-003 |
| Audits              | TPL-AUD  | 4       | 001-004 |
| Management Review   | TPL-MR   | 3       | 001-003 |
| Chemical Management | TPL-CHEM | 8       | 001-008 |
| **Total**           |          | **192** |         |

### DOCX Compliance Templates (docs/compliance-templates/)

In addition to the UI template forms above, the following DOCX compliance document templates are provided:

#### Risk Management (docs/compliance-templates/risk-management/) — 18 files

| Code       | Type      | Title                             |
| ---------- | --------- | --------------------------------- |
| RM-POL-001 | Policy    | Risk Management Policy            |
| RM-POL-002 | Policy    | Risk Appetite Statement           |
| RM-PRO-001 | Procedure | Risk Assessment Procedure         |
| RM-PRO-002 | Procedure | Risk Treatment Procedure          |
| RM-PRO-003 | Procedure | KRI Monitoring Procedure          |
| RM-PRO-004 | Procedure | Bow-Tie Analysis Procedure        |
| RM-PRO-005 | Procedure | Risk Review & Reporting Procedure |
| RM-FRM-001 | Form      | Risk Register Entry Form          |
| RM-FRM-002 | Form      | Risk Assessment Workshop Record   |
| RM-FRM-003 | Form      | Control Assessment Form           |
| RM-FRM-004 | Form      | Bow-Tie Analysis Diagram Form     |
| RM-FRM-005 | Form      | KRI Record Form                   |
| RM-FRM-006 | Form      | Risk Review Record Form           |
| RM-FRM-007 | Form      | Risk Treatment Action Form        |
| RM-REP-001 | Report    | Enterprise Risk Report            |
| RM-REP-002 | Report    | Risk Heat Map Report              |
| RM-REP-003 | Report    | KRI Monitoring Report             |
| RM-PLN-001 | Plan      | Risk Treatment Plan               |

Generate with: `node scripts/generate-risk-templates.mjs`

## Seeding

```bash
# Build the templates package first
pnpm build --filter=@ims/templates

# Run the seed script
npx tsx packages/database/prisma/seed-templates.ts
```

The seeder uses upsert logic — it creates new templates and updates existing built-in ones.

## Testing

```bash
# Run gateway template tests (34 tests)
pnpm test --filter=api-gateway -- --testPathPattern=templates
```
