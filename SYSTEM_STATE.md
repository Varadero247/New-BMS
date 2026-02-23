# IMS System State — Single Source of Truth

> Last updated: 2026-02-23 (phase65)

## Summary

| Category                 | Count                                  |
| ------------------------ | -------------------------------------- |
| API Services             | 42 (+ 1 main API)                      |
| Web Applications         | 44                                     |
| Shared Packages          | 61                                     |
| Prisma Schemas           | 44                                     |
| Database Tables (models) | ~590                                   |
| Scripts                  | 28                                     |
| Unit Tests               | 173,665 across 711 suites (all passing) |
| Integration Test Scripts | 9 (+ 1 finance)                        |

---

## API Services (42 + 1)

| Service            | Directory                      | Port | Standard/Domain                                      | Prisma Schema               |
| ------------------ | ------------------------------ | ---- | ---------------------------------------------------- | --------------------------- |
| Main API           | `apps/api/`                    | —    | Legacy dashboard routes                              | —                           |
| Gateway            | `apps/api-gateway/`            | 4000 | Auth, routing, roles, notifications, MSP, compliance | `core.prisma`               |
| Health & Safety    | `apps/api-health-safety/`      | 4001 | ISO 45001:2018                                       | `health-safety.prisma`      |
| Environment        | `apps/api-environment/`        | 4002 | ISO 14001:2015                                       | `environment.prisma`        |
| Quality            | `apps/api-quality/`            | 4003 | ISO 9001:2015                                        | `quality.prisma`            |
| AI Analysis        | `apps/api-ai-analysis/`        | 4004 | Multi-provider AI, assistant Q&A                     | `ai.prisma`                 |
| Inventory          | `apps/api-inventory/`          | 4005 | Stock management                                     | `inventory.prisma`          |
| HR                 | `apps/api-hr/`                 | 4006 | Human Resources                                      | `hr.prisma`                 |
| Payroll            | `apps/api-payroll/`            | 4007 | Payroll & tax                                        | `payroll.prisma`            |
| Workflows          | `apps/api-workflows/`          | 4008 | Process automation                                   | `workflows.prisma`          |
| Project Management | `apps/api-project-management/` | 4009 | PMBOK / ISO 21502                                    | `project-management.prisma` |
| Automotive         | `apps/api-automotive/`         | 4010 | IATF 16949                                           | `automotive.prisma`         |
| Medical            | `apps/api-medical/`            | 4011 | ISO 13485                                            | `medical.prisma`            |
| Aerospace          | `apps/api-aerospace/`          | 4012 | AS9100D                                              | `aerospace.prisma`          |
| Finance            | `apps/api-finance/`            | 4013 | Financial management                                 | `finance.prisma`            |
| CRM                | `apps/api-crm/`                | 4014 | Customer relationship                                | `crm.prisma`                |
| InfoSec            | `apps/api-infosec/`            | 4015 | ISO 27001                                            | `infosec.prisma`            |
| ESG                | `apps/api-esg/`                | 4016 | ESG reporting                                        | `esg.prisma`                |
| CMMS               | `apps/api-cmms/`               | 4017 | Maintenance management                               | `cmms.prisma`               |
| Portal             | `apps/api-portal/`             | 4018 | Customer/supplier portals                            | `portal.prisma`             |
| Food Safety        | `apps/api-food-safety/`        | 4019 | HACCP / ISO 22000                                    | `food-safety.prisma`        |
| Energy             | `apps/api-energy/`             | 4020 | ISO 50001                                            | `energy.prisma`             |
| Analytics          | `apps/api-analytics/`          | 4021 | Business intelligence                                | `analytics.prisma`          |
| Field Service      | `apps/api-field-service/`      | 4022 | Field operations                                     | `field-service.prisma`      |
| ISO 42001          | `apps/api-iso42001/`           | 4023 | AI Management System                                 | `iso42001.prisma`           |
| ISO 37001          | `apps/api-iso37001/`           | 4024 | Anti-Bribery                                         | `iso37001.prisma`           |
| Marketing          | `apps/api-marketing/`          | 4025 | Sales & marketing automation                         | `marketing.prisma`          |
| Partners           | `apps/api-partners/`           | 4026 | Partner portal API                                   | `marketing.prisma`          |
| Risk (ERM)         | `apps/api-risk/`               | 4027 | ISO 31000:2018 Enterprise Risk Management            | `risk.prisma` (10 models)   |
| Training           | `apps/api-training/`           | 4028 | Competence management                                | `training.prisma`           |
| Suppliers          | `apps/api-suppliers/`          | 4029 | Supplier management                                  | `suppliers.prisma`          |
| Assets             | `apps/api-assets/`             | 4030 | Asset management                                     | `assets.prisma`             |
| Documents          | `apps/api-documents/`          | 4031 | Document control                                     | `documents.prisma`          |
| Complaints         | `apps/api-complaints/`         | 4032 | Complaint management                                 | `complaints.prisma`         |
| Contracts          | `apps/api-contracts/`          | 4033 | Contract lifecycle                                   | `contracts.prisma`          |
| Permit to Work     | `apps/api-ptw/`                | 4034 | PTW management                                       | `ptw.prisma`                |
| Regulatory Monitor | `apps/api-reg-monitor/`        | 4035 | Regulatory change tracking                           | `reg-monitor.prisma`        |
| Incidents          | `apps/api-incidents/`          | 4036 | Incident management                                  | `incidents.prisma`          |
| Audits             | `apps/api-audits/`             | 4037 | Audit programme                                      | `audits.prisma`             |
| Mgmt Review        | `apps/api-mgmt-review/`        | 4038 | Management review                                    | `mgmt-review.prisma`        |
| Setup Wizard       | `apps/api-setup-wizard/`       | 4039 | Guided setup wizard                                  | `wizard.prisma`             |
| Chemicals          | `apps/api-chemicals/`          | 4040 | ISO 11014, COSHH, GHS/CLP, REACH                     | `chemicals.prisma`          |
| Emergency          | `apps/api-emergency/`          | 4041 | ISO 22320, ISO 22301, FSO 2005, BSA 2022             | `emergency.prisma`          |

---

## Web Applications (44)

| Application        | Directory                      | Port | Domain                                                                                                                                                                                         |
| ------------------ | ------------------------------ | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dashboard          | `apps/web-dashboard/`          | 3000 | Main dashboard, ROI calculator, Welcome Discovery Wizard                                                                                                                                       |
| Health & Safety    | `apps/web-health-safety/`      | 3001 | ISO 45001                                                                                                                                                                                      |
| Environment        | `apps/web-environment/`        | 3002 | ISO 14001                                                                                                                                                                                      |
| Quality            | `apps/web-quality/`            | 3003 | ISO 9001                                                                                                                                                                                       |
| Settings           | `apps/web-settings/`           | 3004 | Admin & RBAC                                                                                                                                                                                   |
| Inventory          | `apps/web-inventory/`          | 3005 | Stock management                                                                                                                                                                               |
| HR                 | `apps/web-hr/`                 | 3006 | Human Resources                                                                                                                                                                                |
| Payroll            | `apps/web-payroll/`            | 3007 | Payroll                                                                                                                                                                                        |
| Workflows          | `apps/web-workflows/`          | 3008 | Process automation                                                                                                                                                                             |
| Project Management | `apps/web-project-management/` | 3009 | PMBOK                                                                                                                                                                                          |
| Automotive         | `apps/web-automotive/`         | 3010 | IATF 16949                                                                                                                                                                                     |
| Medical            | `apps/web-medical/`            | 3011 | ISO 13485                                                                                                                                                                                      |
| Aerospace          | `apps/web-aerospace/`          | 3012 | AS9100D                                                                                                                                                                                        |
| Finance            | `apps/web-finance/`            | 3013 | Financial management                                                                                                                                                                           |
| CRM                | `apps/web-crm/`                | 3014 | CRM                                                                                                                                                                                            |
| InfoSec            | `apps/web-infosec/`            | 3015 | ISO 27001                                                                                                                                                                                      |
| ESG                | `apps/web-esg/`                | 3016 | ESG reporting                                                                                                                                                                                  |
| CMMS               | `apps/web-cmms/`               | 3017 | Maintenance                                                                                                                                                                                    |
| Customer Portal    | `apps/web-customer-portal/`    | 3018 | External customers                                                                                                                                                                             |
| Supplier Portal    | `apps/web-supplier-portal/`    | 3019 | External suppliers                                                                                                                                                                             |
| Food Safety        | `apps/web-food-safety/`        | 3020 | HACCP                                                                                                                                                                                          |
| Energy             | `apps/web-energy/`             | 3021 | ISO 50001                                                                                                                                                                                      |
| Analytics          | `apps/web-analytics/`          | 3022 | Business intelligence                                                                                                                                                                          |
| Field Service      | `apps/web-field-service/`      | 3023 | Field operations                                                                                                                                                                               |
| ISO 42001          | `apps/web-iso42001/`           | 3024 | AI Management                                                                                                                                                                                  |
| ISO 37001          | `apps/web-iso37001/`           | 3025 | Anti-Bribery                                                                                                                                                                                   |
| Marketing          | `apps/web-marketing/`          | 3030 | Landing page, ROI calculator, chatbot                                                                                                                                                          |
| Partners Portal    | `apps/web-partners/`           | 3026 | Partner referral portal                                                                                                                                                                        |
| Admin Dashboard    | `apps/web-admin/`              | 3027 | Founder growth dashboard                                                                                                                                                                       |
| Risk (ERM)         | `apps/web-risk/`               | 3031 | ISO 31000 Enterprise Risk Management (15 pages: dashboard, risks, risks/new, risks/[id], reviews, CAPA, heat-map, appetite, bowtie, kri, actions, analytics, categories, login)                |
| Training           | `apps/web-training/`           | 3032 | Competence management (8 pages: dashboard, records, courses, competencies, matrix, TNA, inductions, login)                                                                                     |
| Suppliers          | `apps/web-suppliers/`          | 3033 | Supplier management (8 pages: dashboard, suppliers, scorecards, documents, spend, approval, categories, login)                                                                                 |
| Assets             | `apps/web-assets/`             | 3034 | Asset management (8 pages: dashboard, assets, work-orders, calibrations, inspections, locations, depreciation, login)                                                                          |
| Documents          | `apps/web-documents/`          | 3035 | Document control (7 pages: dashboard, documents, versions, approvals, read-receipts, search, login)                                                                                            |
| Complaints         | `apps/web-complaints/`         | 3036 | Complaint management (7 pages: dashboard, complaints, actions, communications, SLA, regulatory, login)                                                                                         |
| Contracts          | `apps/web-contracts/`          | 3037 | Contract lifecycle (8 pages: dashboard, contracts, approvals, notices, clauses, renewals, AI extraction, login)                                                                                |
| Fin. Compliance    | `apps/web-finance-compliance/` | 3038 | Financial compliance (6 pages: dashboard, controls, HMRC calendar, IR35, SoD matrix, login)                                                                                                    |
| Permit to Work     | `apps/web-ptw/`                | 3039 | PTW management (6 pages: dashboard, permits, method-statements, toolbox-talks, conflicts, login)                                                                                               |
| Regulatory Monitor | `apps/web-reg-monitor/`        | 3040 | Reg change tracking (5 pages: dashboard, regulations, alerts, impact-assessments, compliance-calendar)                                                                                         |
| Incidents          | `apps/web-incidents/`          | 3041 | Incident management (6 pages: dashboard, incidents, investigation, RIDDOR, timeline, login)                                                                                                    |
| Audits             | `apps/web-audits/`             | 3042 | Audit programme (7 pages: dashboard, audits, findings, checklists, programmes, pre-audit, login)                                                                                               |
| Mgmt Review        | `apps/web-mgmt-review/`        | 3043 | Management review (5 pages: dashboard, reviews, actions, agenda, login)                                                                                                                        |
| Chemicals          | `apps/web-chemicals/`          | 3044 | Chemical management (12 pages: dashboard, register, register/[id], coshh, coshh/new, coshh/[id], sds, inventory, monitoring, incidents, disposal, login)                                       |
| Emergency          | `apps/web-emergency/`          | 3045 | Fire, Emergency & Disaster Management (13 pages: dashboard, premises, premises/[id], fra, fra/new, incidents, incidents/declare, incidents/[id], bcp, bcp/new, peep, drills, equipment, login) |

---

## Shared Packages (61)

| Package                      | Directory                         | Description                                                                               |
| ---------------------------- | --------------------------------- | ----------------------------------------------------------------------------------------- |
| `@ims/a11y`                  | `packages/a11y/`                  | WCAG 2.2 AA accessibility utilities                                                       |
| `@ims/activity`              | `packages/activity/`              | Activity feed & timeline                                                                  |
| `@ims/audit`                 | `packages/audit/`                 | Activity audit trail                                                                      |
| `@ims/auth`                  | `packages/auth/`                  | JWT authentication middleware                                                             |
| `@ims/automation-rules`      | `packages/automation-rules/`      | Automation rule engine                                                                    |
| `@ims/benchmarks`            | `packages/benchmarks/`            | Performance benchmarks                                                                    |
| `@ims/cache`                 | `packages/cache/`                 | Redis caching layer                                                                       |
| `@ims/calculations`          | `packages/calculations/`          | ISO calculation formulas                                                                  |
| `@ims/changelog`             | `packages/changelog/`             | Change log tracking                                                                       |
| `@ims/charts`                | `packages/charts/`                | Chart components                                                                          |
| `@ims/comments`              | `packages/comments/`              | Threaded comments                                                                         |
| `@ims/csv-import`            | `packages/csv-import/`            | CSV data import                                                                           |
| `@ims/database`              | `packages/database/`              | Prisma schemas and clients (multi-domain)                                                 |
| `@ims/dpa`                   | `packages/dpa/`                   | Data processing agreements                                                                |
| `@ims/dsar`                  | `packages/dsar/`                  | Data subject access requests                                                              |
| `@ims/email`                 | `packages/email/`                 | Email templates and sending                                                               |
| `@ims/emission-factors`      | `packages/emission-factors/`      | GHG emission factor database                                                              |
| `@ims/esig`                  | `packages/esig/`                  | Electronic signature workflows                                                            |
| `@ims/event-bus`             | `packages/event-bus/`             | Cross-service event bus                                                                   |
| `@ims/feature-flags`         | `packages/feature-flags/`         | Feature flag management                                                                   |
| `@ims/file-upload`           | `packages/file-upload/`           | Multi-format file handling                                                                |
| `@ims/finance-calculations`  | `packages/finance-calculations/`  | Financial calculation engine                                                              |
| `@ims/hubspot-client`        | `packages/hubspot-client/`        | HubSpot CRM integration                                                                   |
| `@ims/i18n`                  | `packages/i18n/`                  | Internationalisation (4 locales, 9 namespaces, locale switcher)                           |
| `@ims/intercom-client`       | `packages/intercom-client/`       | Intercom integration                                                                      |
| `@ims/iso-checklists`        | `packages/iso-checklists/`        | ISO audit checklist engine                                                                |
| `@ims/monitoring`            | `packages/monitoring/`            | Winston logging, Prometheus metrics, health checks                                        |
| `@ims/nlq`                   | `packages/nlq/`                   | Natural language query engine (30+ additional patterns, AI fallback)                      |
| `@ims/notifications`         | `packages/notifications/`         | WebSocket real-time notifications                                                         |
| `@ims/nps`                   | `packages/nps/`                   | Net Promoter Score surveys                                                                |
| `@ims/oee-engine`            | `packages/oee-engine/`            | Overall Equipment Effectiveness engine                                                    |
| `@ims/openapi`               | `packages/openapi/`               | OpenAPI spec generation (Scalar UI at GET /api/docs)                                      |
| `@ims/pdf-generator`         | `packages/pdf-generator/`         | PDF report generation                                                                     |
| `@ims/performance`           | `packages/performance/`           | k6 load tests, Lighthouse CI, WCAG audit                                                  |
| `@ims/plan-guard`            | `packages/plan-guard/`            | Subscription plan enforcement                                                             |
| `@ims/portal-auth`           | `packages/portal-auth/`           | Portal authentication (customer/supplier)                                                 |
| `@ims/presence`              | `packages/presence/`              | User presence/online status                                                               |
| `@ims/pwa`                   | `packages/pwa/`                   | PWA (offline sync, push notifications, camera, geolocation, install, useOfflineForm hook) |
| `@ims/rbac`                  | `packages/rbac/`                  | Role-based access control (39 roles, 17 modules)                                          |
| `@ims/readiness`             | `packages/readiness/`             | Service readiness checks                                                                  |
| `@ims/regulatory-feed`       | `packages/regulatory-feed/`       | Live regulatory change feed                                                               |
| `@ims/resilience`            | `packages/resilience/`            | Circuit breakers, retry logic                                                             |
| `@ims/scheduled-reports`     | `packages/scheduled-reports/`     | Scheduled report generation                                                               |
| `@ims/sdk`                   | `packages/sdk/`                   | @ims/sdk external SDK                                                                     |
| `@ims/secrets`               | `packages/secrets/`               | HashiCorp Vault integration                                                               |
| `@ims/sentry`                | `packages/sentry/`                | Sentry error tracking integration (initSentry, sentryErrorHandler, auth header stripping) |
| `@ims/service-auth`          | `packages/service-auth/`          | Service-to-service JWT auth                                                               |
| `@ims/shared`                | `packages/shared/`                | Shared utilities                                                                          |
| `@ims/spc-engine`            | `packages/spc-engine/`            | Statistical Process Control engine                                                        |
| `@ims/standards-convergence` | `packages/standards-convergence/` | Cross-standard mapping engine                                                             |
| `@ims/status`                | `packages/status/`                | System status page                                                                        |
| `@ims/stripe-client`         | `packages/stripe-client/`         | Stripe payment integration                                                                |
| `@ims/tasks`                 | `packages/tasks/`                 | Background task queue                                                                     |
| `@ims/tax-engine`            | `packages/tax-engine/`            | Multi-jurisdiction tax calculation                                                        |
| `@ims/templates`             | `packages/templates/`             | 192 built-in document/report templates                                                    |
| `@ims/testing`               | `packages/testing/`               | Shared test utilities                                                                     |
| `@ims/theming`               | `packages/theming/`               | White-label theming (CSS var overrides, MSP branding)                                     |
| `@ims/types`                 | `packages/types/`                 | Shared TypeScript types                                                                   |
| `@ims/ui`                    | `packages/ui/`                    | React component library (76 components, 76 Storybook stories)                             |
| `@ims/validation`            | `packages/validation/`            | Zod validation schemas                                                                    |
| `@ims/webhooks`              | `packages/webhooks/`              | Webhook delivery & management                                                             |

---

## Prisma Schemas (44)

| Schema             | File                        | Models         | Domain                                                                                                                                                  |
| ------------------ | --------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Core               | `core.prisma`               | 19             | Users, sessions, audit, API keys, templates                                                                                                             |
| Health & Safety    | `health-safety.prisma`      | 18             | ISO 45001                                                                                                                                               |
| Environment        | `environment.prisma`        | 24             | ISO 14001                                                                                                                                               |
| Quality            | `quality.prisma`            | 30             | ISO 9001                                                                                                                                                |
| AI                 | `ai.prisma`                 | 11             | Analysis, insights, embeddings                                                                                                                          |
| Inventory          | `inventory.prisma`          | 12             | Products, warehouses, stock                                                                                                                             |
| HR                 | `hr.prisma`                 | 27             | Employees, departments, training                                                                                                                        |
| Payroll            | `payroll.prisma`            | 14             | Runs, payslips, tax                                                                                                                                     |
| Workflows          | `workflows.prisma`          | 17             | Definitions, instances, tasks                                                                                                                           |
| Project Management | `project-management.prisma` | 16             | Projects, sprints, timesheets                                                                                                                           |
| Automotive         | `automotive.prisma`         | 18             | IATF 16949                                                                                                                                              |
| Medical            | `medical.prisma`            | 27             | ISO 13485                                                                                                                                               |
| Aerospace          | `aerospace.prisma`          | 11             | AS9100D                                                                                                                                                 |
| Finance            | `finance.prisma`            | 23             | Accounts, transactions, budgets                                                                                                                         |
| CRM                | `crm.prisma`                | 17             | Contacts, opportunities, campaigns                                                                                                                      |
| InfoSec            | `infosec.prisma`            | 14             | ISO 27001                                                                                                                                               |
| ESG                | `esg.prisma`                | 15             | Environmental, social, governance                                                                                                                       |
| CMMS               | `cmms.prisma`               | 16             | Work orders, assets, maintenance                                                                                                                        |
| Portal             | `portal.prisma`             | 12             | Portal users, documents                                                                                                                                 |
| Food Safety        | `food-safety.prisma`        | 14             | HACCP, ISO 22000                                                                                                                                        |
| Energy             | `energy.prisma`             | 12             | ISO 50001                                                                                                                                               |
| Analytics          | `analytics.prisma`          | 10             | Dashboards, reports, datasets                                                                                                                           |
| Field Service      | `field-service.prisma`      | 14             | Work orders, dispatch                                                                                                                                   |
| ISO 42001          | `iso42001.prisma`           | 7              | AI Management System                                                                                                                                    |
| ISO 37001          | `iso37001.prisma`           | 6              | Anti-Bribery                                                                                                                                            |
| Marketing          | `marketing.prisma`          | 13             | Leads, partners, deals, health scores                                                                                                                   |
| Risk (ERM)         | `risk.prisma`               | 10             | ISO 31000:2018 — RiskRegister, RiskReview, RiskCapa, RiskControl, RiskKri, RiskKriReading, RiskAction, RiskBowtie, RiskAppetiteStatement, RiskFramework |
| Training           | `training.prisma`           | 5              | Courses, records, competencies, matrix, TNA                                                                                                             |
| Suppliers          | `suppliers.prisma`          | 4              | Suppliers, scorecards, documents, spend                                                                                                                 |
| Assets             | `assets.prisma`             | 4              | Register, work orders, calibration, inspection                                                                                                          |
| Documents          | `documents.prisma`          | 4              | Documents, versions, approvals, read receipts                                                                                                           |
| Complaints         | `complaints.prisma`         | 3              | Complaints, actions, communications                                                                                                                     |
| Contracts          | `contracts.prisma`          | 4              | Contracts, approvals, notices, clauses                                                                                                                  |
| PTW                | `ptw.prisma`                | 3              | Permits, method statements, toolbox talks                                                                                                               |
| Reg Monitor        | `reg-monitor.prisma`        | 3              | Changes, legal register, obligations                                                                                                                    |
| Incidents          | `incidents.prisma`          | 1              | Incidents (30+ fields, RIDDOR)                                                                                                                          |
| Audits             | `audits.prisma`             | 4              | Audits, findings, checklists, programmes                                                                                                                |
| Mgmt Review        | `mgmt-review.prisma`        | 1              | Management reviews (AI agenda)                                                                                                                          |
| Wizard             | `wizard.prisma`             | 2              | Setup wizard state + steps                                                                                                                              |
| Platform           | `platform.prisma`           | 23             | Feature flags, webhooks, automation, NPS, status                                                                                                        |
| Partner Portal     | `partner-portal.prisma`     | 4              | Support tickets, messages, collateral, referrals                                                                                                        |
| Chemicals          | `chemicals.prisma`          | 10             | Chemical register, SDS, COSHH, inventory, monitoring, disposal, incidents                                                                               |
| Emergency          | `emergency.prisma`          | 16             | Premises, FRA, incidents, BCP, wardens, PEEP, equipment, drills                                                                                         |
| Marketplace        | `marketplace.prisma`        | 4              | Plugins, versions, installs, webhook subscriptions                                                                                                      |
| **Total**          |                             | **589 models** |                                                                                                                                                         |

---

## Gateway Routing (39 proxy targets + local routes)

### Local Routes (handled by gateway)

| Route                    | Description                                                      |
| ------------------------ | ---------------------------------------------------------------- |
| `/api/auth/*`            | Login, registration, token refresh                               |
| `/api/users/*`           | User management                                                  |
| `/api/dashboard/*`       | Dashboard aggregation, compliance calendar/scores                |
| `/api/sessions/*`        | Session management                                               |
| `/api/reports/*`         | Report generation                                                |
| `/api/notifications/*`   | WebSocket notifications                                          |
| `/api/organisations/*`   | MSP mode                                                         |
| `/api/compliance/*`      | Regulatory feed                                                  |
| `/api/roles/*`           | Role management                                                  |
| `/api/access-log/*`      | Access audit log                                                 |
| `/api/csrf-token`        | CSRF token                                                       |
| `/api/v1/templates/*`    | Template library (192 templates)                                 |
| `/api/marketplace/*`     | Plugin marketplace (10 endpoints)                                |
| `/api/docs`              | OpenAPI Scalar UI explorer                                       |
| `/api/docs/openapi.json` | OpenAPI JSON spec                                                |
| `/api/cookie-consent`    | Cookie consent preferences                                       |
| `/api/auth/saml/*`       | SAML SSO (AuthnRequest, callback with XML parsing, IdP metadata) |
| `/api/scim/*`            | SCIM user/group provisioning (filter queries, Groups endpoint)   |

### Proxy Routes (v1 + legacy)

| Route Pattern               | Target Service         | Port |
| --------------------------- | ---------------------- | ---- |
| `/api/health-safety/*`      | api-health-safety      | 4001 |
| `/api/environment/*`        | api-environment        | 4002 |
| `/api/quality/*`            | api-quality            | 4003 |
| `/api/ai/*`                 | api-ai-analysis        | 4004 |
| `/api/inventory/*`          | api-inventory          | 4005 |
| `/api/hr/*`                 | api-hr                 | 4006 |
| `/api/payroll/*`            | api-payroll            | 4007 |
| `/api/workflows/*`          | api-workflows          | 4008 |
| `/api/project-management/*` | api-project-management | 4009 |
| `/api/automotive/*`         | api-automotive         | 4010 |
| `/api/medical/*`            | api-medical            | 4011 |
| `/api/aerospace/*`          | api-aerospace          | 4012 |
| `/api/finance/*`            | api-finance            | 4013 |
| `/api/crm/*`                | api-crm                | 4014 |
| `/api/infosec/*`            | api-infosec            | 4015 |
| `/api/esg/*`                | api-esg                | 4016 |
| `/api/cmms/*`               | api-cmms               | 4017 |
| `/api/portal/*`             | api-portal             | 4018 |
| `/api/food-safety/*`        | api-food-safety        | 4019 |
| `/api/energy/*`             | api-energy             | 4020 |
| `/api/analytics/*`          | api-analytics          | 4021 |
| `/api/field-service/*`      | api-field-service      | 4022 |
| `/api/iso42001/*`           | api-iso42001           | 4023 |
| `/api/iso37001/*`           | api-iso37001           | 4024 |
| `/api/marketing/*`          | api-marketing          | 4025 |
| `/api/partners/*`           | api-partners           | 4026 |
| `/api/risk/*`               | api-risk               | 4027 |
| `/api/training/*`           | api-training           | 4028 |
| `/api/suppliers/*`          | api-suppliers          | 4029 |
| `/api/assets/*`             | api-assets             | 4030 |
| `/api/documents/*`          | api-documents          | 4031 |
| `/api/complaints/*`         | api-complaints         | 4032 |
| `/api/contracts/*`          | api-contracts          | 4033 |
| `/api/ptw/*`                | api-ptw                | 4034 |
| `/api/reg-monitor/*`        | api-reg-monitor        | 4035 |
| `/api/incidents/*`          | api-incidents          | 4036 |
| `/api/audits/*`             | api-audits             | 4037 |
| `/api/mgmt-review/*`        | api-mgmt-review        | 4038 |
| `/api/wizard/*`             | api-setup-wizard       | 4039 |
| `/api/chemicals/*`          | api-chemicals          | 4040 |
| `/api/emergency/*`          | api-emergency          | 4041 |

All routes also available under `/api/v1/` prefix.

---

## Scripts (28)

| Script                              | Description                                                          |
| ----------------------------------- | -------------------------------------------------------------------- |
| `scripts/startup.sh`                | Full startup (kill ports, Docker up, seed DB, recreate tables)       |
| `scripts/start-all-services.sh`     | Start all 86 services with staggered delays                          |
| `scripts/stop-all-services.sh`      | Stop all services (ports 4000-4041 + 3000-3045)                      |
| `scripts/check-services.sh`         | Health check all 86 services                                         |
| `scripts/create-databases.sh`       | Create per-service databases                                         |
| `scripts/migrate-data.sh`           | Migrate data between databases                                       |
| `scripts/daily-report.sh`           | Generate daily status report                                         |
| `scripts/generate-secrets.sh`       | Generate service secrets                                             |
| `scripts/init-vault.sh`             | Initialize HashiCorp Vault                                           |
| `scripts/verify-secrets.sh`         | Verify secrets configuration                                         |
| `scripts/check-secrets.sh`          | Verify all required secrets are present                              |
| `scripts/provision-db-users.sh`     | Provision database users per service                                 |
| `scripts/pre-launch-check.sh`       | 111-point launch readiness check (8 categories)                      |
| `scripts/typecheck-all.sh`          | TypeScript check across all 42 APIs + 44 web apps + packages         |
| `scripts/test-backup-restore.sh`    | Backup restore validation (7 steps, creates ims_restore_test DB)     |
| `scripts/test-all-modules.sh`       | Run all integration tests (master runner)                            |
| `scripts/test-hs-modules.sh`        | H&S integration tests (~70 assertions)                               |
| `scripts/test-env-modules.sh`       | Environment integration tests (~60)                                  |
| `scripts/test-quality-modules.sh`   | Quality integration tests (~80)                                      |
| `scripts/test-hr-modules.sh`        | HR integration tests (~50)                                           |
| `scripts/test-payroll-modules.sh`   | Payroll integration tests (~40)                                      |
| `scripts/test-inventory-modules.sh` | Inventory integration tests (~40)                                    |
| `scripts/test-workflows-modules.sh` | Workflows integration tests (~40)                                    |
| `scripts/test-pm-modules.sh`        | PM integration tests (~45)                                           |
| `scripts/test-finance-modules.sh`   | Finance integration tests                                            |
| `scripts/seed-all.sh`               | Unified seed runner (all domain schemas)                             |
| `scripts/backup-db.sh`              | Manual database backup                                               |
| `scripts/generate-review-report.ts` | Generate Full System Review Word report                              |

---

## Test Coverage

### Unit Tests (674 suites — all passing)

All 674 Jest test suites pass with 0 failures as of 2026-02-22. Every `.test.ts` file across all 42 API services, 44 web apps, and 61 packages has ≥35 tests (25,287 total). Full breakdown by service is approximate:

| Category               | Suites (approx) | Tests (approx) |
| ---------------------- | --------------- | -------------- |
| API services (42)      | ~420            | ~14,700        |
| Web apps (44)          | ~90             | ~3,200         |
| Shared packages (61)   | ~164            | ~3,896         |
| **Total**              | **674**         | **21,796**     |

Notable suites: api-quality (~994), api-medical (~871), api-gateway (~861+), api-finance (~456), api-environment (~442), api-aerospace (~553), api-automotive (~502), api-hr (~355), api-payroll (~303).

### Integration Tests (9 scripts, ~465+ assertions)

| Script                    | Module             | Assertions |
| ------------------------- | ------------------ | ---------- |
| test-hs-modules.sh        | Health & Safety    | ~70        |
| test-env-modules.sh       | Environment        | ~60        |
| test-quality-modules.sh   | Quality            | ~80        |
| test-hr-modules.sh        | HR                 | ~50        |
| test-payroll-modules.sh   | Payroll            | ~40        |
| test-inventory-modules.sh | Inventory          | ~40        |
| test-workflows-modules.sh | Workflows          | ~40        |
| test-pm-modules.sh        | Project Management | ~45        |
| test-finance-modules.sh   | Finance            | ~40        |

---

## Build Phases (all completed)

| Phase    | Focus                                         | Key Deliverables                                                                                                                                                                                                                                                                              |
| -------- | --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase 0  | Platform Hardening                            | RBAC retrofit, WebSocket notifications, workflow builder, PWA, performance baseline                                                                                                                                                                                                           |
| Phase 1  | RBAC                                          | @ims/rbac package (39 roles, 17 modules, 7 permission levels)                                                                                                                                                                                                                                 |
| Phase 2  | Finance                                       | api-finance, web-finance                                                                                                                                                                                                                                                                      |
| Phase 3  | CRM + InfoSec                                 | api-crm, web-crm, api-infosec, web-infosec                                                                                                                                                                                                                                                    |
| Phase 4  | ESG                                           | api-esg, web-esg                                                                                                                                                                                                                                                                              |
| Phase 5  | CMMS                                          | api-cmms, web-cmms                                                                                                                                                                                                                                                                            |
| Phase 6  | Portals                                       | api-portal, web-customer-portal, web-supplier-portal                                                                                                                                                                                                                                          |
| Phase 7a | Food Safety                                   | api-food-safety, web-food-safety                                                                                                                                                                                                                                                              |
| Phase 7b | Energy                                        | api-energy, web-energy                                                                                                                                                                                                                                                                        |
| Phase 8  | Analytics                                     | api-analytics, web-analytics                                                                                                                                                                                                                                                                  |
| Phase 9  | Payroll Localisation                          | Jurisdictions, tax calculator routes                                                                                                                                                                                                                                                          |
| Phase 10 | Field Service                                 | api-field-service, web-field-service                                                                                                                                                                                                                                                          |
| Phase 11 | Unique Differentiators                        | Evidence packs, headstart tool, MSP mode, regulatory feed, ISO 42001, ISO 37001                                                                                                                                                                                                               |
| Phase 12 | Sales & Marketing Automation                  | api-marketing, api-partners, web-partners, web-admin, ROI calculator, chatbot, partner portal, growth dashboard                                                                                                                                                                               |
| Phase 13 | Fire, Emergency & Disaster Management         | api-emergency, web-emergency, emergency.prisma (16 models), 9 route files, 216 tests, 26 DOCX templates, FSO 2005 FRA wizard                                                                                                                                                                  |
| Phase 14 | Welcome Discovery Wizard                      | 7-step onboarding modal in web-dashboard, AI assistant endpoint (/api/ai/assistant), TourManager integration, OnboardingChecklist, sidebar re-entry, 12 new tests                                                                                                                             |
| Phase 15 | Platform Enhancements (Feb 18)                | Sentry integration (all 42 APIs), OpenAPI Scalar UI, SAML SSO (AuthnRequest XML + Response parsing + IdP metadata), SCIM (filter queries + Groups), NLQ 30+ patterns with AI fallback, useOfflineForm() hook, guided tours (quality + H&S dashboards), cookie consent (dashboard + marketing) |
| Phase 16 | Security Hardening + TODO Resolution (Feb 18) | orgId multi-tenant scoping on 60+ routes (20 services), sanitised error messages, multi-field search, sidebar NEXT_PUBLIC_APP_BASE_URL, Prisma cascade/soft-delete schema improvements, payroll→HR cross-service integration (real calculation), SAML RSA signature crypto verification       |
| Code Eval Phase 1 | 100% Score Sprint — Security & Architecture (Feb 20) | JWT key rotation, magic link auth, adaptive risk scoring, continuous verification, RASP middleware, behavioral analytics, adaptive timeout, response compression, dashboard metrics. Score: 87→91/100. Tests: 12,960.                                                                         |
| Code Eval Phase 2 | 100% Score Sprint — SIEM & Rate Limiting (Feb 20) | SIEM event correlation engine (6 built-in rules), envelope encryption (DEK/KEK + key rotation), per-user tier-based rate limiting (RFC 6585), property-based tests (fast-check), 4 k6 load test scenarios. Score: 91→97/100. Tests: 13,060.                                               |
| Code Eval Phase 3 | 100% Score Sprint — Resilience & Credential Scan (Feb 20) | Credential/secret leak scanner (request + response middleware, 8 pattern types), graceful shutdown utility (in-flight draining, signal handlers), request hedging (`withHedging`/`withHedgingDetailed`/`RequestHedger`). Score: 97→100/100. Tests: 13,116.                               |
| Sessions 19-20 | Package test coverage + i18n/audit/notifications/email (Feb 20) | `@ims/templates` first test suite (77 tests), `@ims/i18n` message key parity (29 tests), `@ims/audit` EnhancedAuditService (31 tests), `@ims/notifications` bell + WS server (49 tests), `@ims/email` 8 template modules (63 tests), `@ims/shared` cursor-pagination + validation (55 tests). Tests: 13,543→13,598. |
| Sessions 21-22 | TypeScript clean sweep + CI hardening (Feb 20) | 0 TypeScript errors across all 42 APIs + 44 web apps + packages (148 projects). Fixed TS6059 rootDir in 8 packages, TS2688 uuid stub in dpa/dsar/scheduled-reports. CI: real `pnpm typecheck` replaces no-op. Dependency vulns: 17→7. Tests: 13,598.                                   |
| Sessions 23-24 | All 61 packages with test suites + Jest config cleanup (Feb 20-21) | Added suites for 15 previously-untested packages (sdk, openapi, hubspot-client, intercom-client, stripe-client, presence, types, ui-utilities, comments, cache, dpa, dsar, scheduled-reports, testing, charts). Removed invalid per-project Jest options. Tests: 14,130 / 646 suites.  |
| Sessions 25+  | In-memory → Prisma migrations + E2E + thin-file sweep (Feb 21) | 7 in-memory Maps migrated to Prisma (msp, api-keys, unified-audit, saml, scim, evidence-pack, headstart). 48 Playwright E2E specs (195 tests). Gateway security + cross-service integration + event-bus suites. Every `.test.ts` brought to ≥20 tests. Final: **17,361 / 652 suites**. |
| Phases 18-21  | Frontend Gap Closure (Feb 22) | Systematic audit of all 42 API services. 58 new frontend pages across 12 apps (web-health-safety, web-environment, web-esg, web-quality, web-finance, web-infosec, web-chemicals, web-aerospace, web-emergency, web-medical, web-admin, web-customer-portal, web-partners). Sidebar navigation updated for all affected apps. Tests: 17,853 / 674 suites. |
| Phases 22-23  | Test Expansion to ≥28 per file (Feb 22) | Two-pass expansion: 302 files at exactly 20 tests → 28-37 each (pass 1); 145 files at 21-27 tests → ≥28 each (pass 2). 18 parallel agent batches per pass. Zero files below 28 tests remaining. Final: **21,796 / 674 suites**. |
| Phase 24      | TypeScript Zero-Error Sweep (Feb 22) | Fixed TS2345 in `web-dashboard/src/lib/roi/calculations.test.ts` (literal widening on `numberOfAudits`). 0 TS errors across all 42 APIs + 44 web apps + packages. |
| Phase 25      | Test Expansion to ≥35 per file (Feb 22) | Expanded all 492 files with ≤30 tests → ≥35 each. 41 parallel batches. +3,080 tests. Final: **24,876 / 674 suites**. |
| Phase 26      | Test Expansion — final sweep (Feb 22) | Expanded remaining 93 files (29-34 tests) → ≥35 each. 7 parallel agents. +411 tests. Fixed 4 failing suites post-expansion (saml/compliance/v1/incidents). Final: **25,287 / 674 suites**. |

---

## Full System Review v3 (Feb 17, 2026)

7-phase comprehensive system review executed across the entire IMS codebase. Commit: `95b2f0b`.

| Phase                    | Scope                         | Result                                                                                                                       |
| ------------------------ | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Phase 0: Orientation     | Codebase inventory            | 42 API services, 44 web apps, 60 packages, 44+ Prisma schemas, 600+ models confirmed                                         |
| Phase 1: Architecture    | Gateway proxy & health checks | 11/11 gateway proxy tests PASS, 15/15 health checks PASS, CORS/headers verified                                              |
| Phase 2: Software Design | Code quality & validation     | Fixed 1 missing try/catch (`headstart.ts`), 1 unbounded `findMany` (`aerospace/audits.ts`), added Zod validation to 7 routes |
| Phase 2B: Functionality  | CRUD lifecycle testing        | CRUD lifecycle verified, auth enforcement (401), input validation, pagination                                                |
| Phase 3: Security        | Security audit                | No hardcoded secrets, rate limiting verified (blocks at attempt 6), all security headers present, `X-Powered-By` stripped    |
| Phase 5: Testing         | Unit test execution           | 12,371 tests across 579 suites — ALL PASSING                                                                                 |
| Phase 5B: UI/UX          | Frontend consistency          | 44/44 `error.tsx`, `not-found.tsx`, `loading.tsx` (100% coverage), 458 correct `Modal isOpen` usages, 0 violations           |
| Phase 6: Reporting       | Documentation                 | Generated `docs/Full_System_Review_v3_Report.docx` (10-page Word report)                                                     |
| Phase 7: Commit          | Version control               | Committed as `95b2f0b`                                                                                                       |

### Fixes Applied During Review

- `apps/api-quality/src/routes/headstart.ts` — Added missing try/catch error handling
- `apps/api-aerospace/src/routes/audits.ts` — Added pagination limit to unbounded `findMany`
- 7 routes across multiple services — Added Zod request body validation

### Artifacts

- `docs/Full_System_Review_v3_Report.docx` — Full 10-page Word report
- `scripts/generate-review-report.ts` — Script to regenerate the review report

---

## Environment Files

| File                 | Location           | Purpose                                                 |
| -------------------- | ------------------ | ------------------------------------------------------- |
| `.env`               | Root               | Global environment (DATABASE_URL, JWT_SECRET, API keys) |
| `.env`               | Each `apps/api-*/` | Per-service PORT, DATABASE_URL                          |
| `docker-compose.yml` | Root               | All containerized services                              |

### Database Credentials (Docker)

- User: `postgres`
- Password: `${POSTGRES_PASSWORD}`
- Port: `5432`
- Database: `ims`

### Database Hardening

- 342 `deletedAt` indexes added across all schemas for soft-delete query performance
- 301 `orgId` fields added across schemas for multi-tenant data isolation
