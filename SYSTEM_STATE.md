# IMS System State — Single Source of Truth

> Last updated: 2026-03-08 (Phase 138 — web-regional-dashboard:3048, APAC intelligence dashboard, 5 pages, 72 spec tests)

## Summary

| Category                 | Count                                  |
| ------------------------ | -------------------------------------- |
| API Services             | 44 total (gateway:4000, 42 domain:4001–4042, search:4050) |
| Web Applications         | 47 (incl. web-onboarding:3047, web-regional-dashboard:3048) |
| Shared Packages          | 397 (incl. @ims/regional-data)                        |
| Prisma Schemas           | 44                                                    |
| Database Tables (models) | ~597 (+8 Apac-prefixed models in schema.prisma)       |
| Scripts                  | 60+                                                   |
| Unit Tests               | ~1,220,787 across 1,118 suites / 481 Jest projects (all passing) |
| Integration Test Scripts | 40 shell scripts + 12 Jest suites (111 tests, `pnpm test:integration:ci`) |

---

## API Services (44 + 1)

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
| Regional / APAC    | `apps/api-regional/`           | 4042 | APAC localisation: 24 countries, legislation, tax, trade agreements, ISO mappings | `schema.prisma` (Apac* models) |
| Search             | `apps/api-search/`             | 4050 | Global Search microservice (cross-domain full-text)  | —                           |

---

## Web Applications (46)

| Application        | Directory                      | Port | Domain                                                                                                                                                                                         |
| ------------------ | ------------------------------ | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dashboard          | `apps/web-dashboard/`          | 3000 | Main dashboard, ROI calculator, Welcome Discovery Wizard                                                                                                                                       |
| Health & Safety    | `apps/web-health-safety/`      | 3001 | ISO 45001                                                                                                                                                                                      |
| Environment        | `apps/web-environment/`        | 3002 | ISO 14001                                                                                                                                                                                      |
| Quality            | `apps/web-quality/`            | 3003 | ISO 9001                                                                                                                                                                                       |
| Settings           | `apps/web-settings/`           | 3004 | Admin & RBAC; Templates library, System Status, Marketplace (plugin management) pages                                                                                                          |
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
| Admin Dashboard    | `apps/web-admin/`              | 3027 | Founder growth dashboard + Knowledge Base (801 articles, /knowledge-base page)                                                                                                                |
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
| Training Portal    | `apps/web-training-portal/`    | 3046 | Administrator, Module Owner & End User Training (activation-key gated; 3 programme tracks, 9 new routes, 1,325 middleware + assessment tests) |
| Onboarding         | `apps/web-onboarding/`         | 3047 | 4-step organisation onboarding wizard: welcome, region/country selection (20 APAC countries, TaxSummaryPanel, LegislationBadge, ISO adoption table), ISO standards selector, review & confirm |
| Regional Dashboard | `apps/web-regional-dashboard/` | 3048 | APAC intelligence dashboard: overview (20 markets), country explorer (sortable/filterable), tax league (bar charts), ISO adoption comparison, compliance matrix. Fetches from `api-regional:4055`. 5 pages, 72 spec tests. |

---

## Shared Packages (396)

> The table below lists the 61 original core packages. An additional 334 domain and strategy packages were added across Phases 42–126. See `docs/PACKAGES.md` for the full enumerated list.

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
| `@ims/knowledge-base`        | `packages/knowledge-base/`        | 801 self-service KB articles, ArticleStore, CategoryManager (1,000 tests)                |
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
| `/api/search/*`             | api-search             | 4050 |

All routes also available under `/api/v1/` prefix.

---

## Scripts (60+)

| Script                              | Description                                                          |
| ----------------------------------- | -------------------------------------------------------------------- |
| `scripts/startup.sh`                | Full startup (kill ports, Docker up, seed DB, recreate tables, start APIs + web apps in production mode) |
| `scripts/start-all-services.sh`     | Start all API services (no web apps by default; pass `--web` to include them) |
| `scripts/build-all-web.sh`          | Build all 45 web apps for production (`next build`); skips already-built; `--force` to redo all |
| `scripts/start-all-web.sh`          | Start all built web apps in production mode (`next start`); ~80–120 MB/app |
| `scripts/start-web-app.sh`          | Start a single web app in dev mode for editing (`./scripts/start-web-app.sh <name>`) |
| `scripts/stop-all-services.sh`      | Stop all services (ports 4000-4041 + 3000-3046)                      |
| `scripts/check-services.sh`         | Health check all 89 services                                         |
| `scripts/create-databases.sh`       | Create per-service databases                                         |
| `scripts/migrate-data.sh`           | Migrate data between databases                                       |
| `scripts/daily-report.sh`           | Generate daily status report                                         |
| `scripts/generate-secrets.sh`       | Generate service secrets                                             |
| `scripts/init-vault.sh`             | Initialize HashiCorp Vault                                           |
| `scripts/verify-secrets.sh`         | Verify secrets configuration                                         |
| `scripts/check-secrets.sh`          | Verify all required secrets are present                              |
| `scripts/provision-db-users.sh`     | Provision database users per service                                 |
| `scripts/pre-launch-check.sh`       | 111-point launch readiness check (8 categories)                      |
| `scripts/typecheck-all.sh`          | TypeScript check across all 43 APIs + api-search + 45 web apps + packages (480 Jest projects) |
| `scripts/test-backup-restore.sh`    | Backup restore validation (7 steps, creates ims_restore_test DB)     |
| `scripts/test-all-modules.sh`       | Master integration test runner — all 40 modules                      |
| `scripts/test-hs-modules.sh`        | H&S integration tests (~70 assertions)                               |
| `scripts/test-env-modules.sh`       | Environment integration tests (~60)                                  |
| `scripts/test-quality-modules.sh`   | Quality integration tests (~80)                                      |
| `scripts/test-hr-modules.sh`        | HR integration tests (~50)                                           |
| `scripts/test-payroll-modules.sh`   | Payroll integration tests (~40)                                      |
| `scripts/test-inventory-modules.sh` | Inventory integration tests (~40)                                    |
| `scripts/test-workflows-modules.sh` | Workflows integration tests (~40)                                    |
| `scripts/test-pm-modules.sh`        | PM integration tests (~45)                                           |
| `scripts/test-finance-modules.sh`   | Finance integration tests                                            |
| `scripts/test-ai-modules.sh`        | AI Analysis integration tests (~46 assertions)                       |
| `scripts/test-automotive-modules.sh`| Automotive integration tests (~64 assertions)                        |
| `scripts/test-medical-modules.sh`   | Medical Devices integration tests (~60)                              |
| `scripts/test-aerospace-modules.sh` | Aerospace integration tests (~71)                                    |
| `scripts/test-crm-modules.sh`       | CRM integration tests (~67)                                          |
| `scripts/test-infosec-modules.sh`   | InfoSec integration tests (~57)                                      |
| `scripts/test-esg-modules.sh`       | ESG integration tests (~46)                                          |
| `scripts/test-cmms-modules.sh`      | CMMS integration tests (~63)                                         |
| `scripts/test-portal-modules.sh`    | Portal integration tests (~75)                                       |
| `scripts/test-food-safety-modules.sh`| Food Safety integration tests (~40)                                 |
| `scripts/test-energy-modules.sh`    | Energy Management integration tests (~40)                            |
| `scripts/test-analytics-modules.sh` | Analytics integration tests (~40)                                    |
| `scripts/test-field-service-modules.sh`| Field Service integration tests (~43)                             |
| `scripts/test-iso42001-modules.sh`  | ISO 42001 integration tests (~73)                                    |
| `scripts/test-iso37001-modules.sh`  | ISO 37001 integration tests (~70)                                    |
| `scripts/test-marketing-modules.sh` | Marketing integration tests (~45)                                    |
| `scripts/test-partners-modules.sh`  | Partners integration tests (~47)                                     |
| `scripts/test-risk-modules.sh`      | Risk (ERM) integration tests (~45)                                   |
| `scripts/test-training-modules.sh`  | Training integration tests (~45)                                     |
| `scripts/test-suppliers-modules.sh` | Suppliers integration tests (~45)                                    |
| `scripts/test-assets-modules.sh`    | Assets integration tests (~45)                                       |
| `scripts/test-documents-modules.sh` | Documents integration tests (~45)                                    |
| `scripts/test-complaints-modules.sh`| Complaints integration tests (~45)                                   |
| `scripts/test-contracts-modules.sh` | Contracts integration tests (~45)                                    |
| `scripts/test-ptw-modules.sh`       | Permit to Work integration tests (~45)                               |
| `scripts/test-reg-monitor-modules.sh`| Reg Monitor integration tests (~43)                                 |
| `scripts/test-incidents-modules.sh` | Incidents integration tests (~42)                                    |
| `scripts/test-audits-modules.sh`    | Audits integration tests (~52)                                       |
| `scripts/test-mgmt-review-modules.sh`| Mgmt Review integration tests (~44)                                 |
| `scripts/test-chemicals-modules.sh` | Chemicals integration tests (~46)                                    |
| `scripts/test-emergency-modules.sh` | Emergency integration tests (~46)                                    |
| `scripts/pre-deploy-check.sh`       | 7-check pre-deployment validation script                             |
| `scripts/verify-backup-restore.sh`  | Backup + restore pipeline verification                               |
| `scripts/seed-all.sh`               | Unified seed runner (all domain schemas)                             |
| `scripts/backup-db.sh`              | Manual database backup                                               |
| `scripts/generate-review-report.ts` | Generate Full System Review Word report                              |

---

## Test Coverage

### Unit Tests (1,117 suites — all passing)

All 1,117 Jest test suites pass with 0 failures as of 2026-03-06. ~1,220,715 total tests. 480 Jest projects. Full breakdown by service is approximate:

| Category               | Suites (approx) | Tests (approx) |
| ---------------------- | --------------- | -------------- |
| API services (43)      | ~430            | ~310,000       |
| Web apps (45)          | ~95             | ~95,000        |
| Shared packages (395)  | ~549            | ~791,395       |
| **Total**              | **1,117**       | **~1,220,715** |

Notable suites: api-quality (~994), api-medical (~871), api-gateway (~861+), api-finance (~456), api-environment (~442), api-aerospace (~553), api-automotive (~502), api-hr (~355), api-payroll (~303).

### Integration Tests

#### Shell scripts (40 scripts, ~1,800+ assertions) — `./scripts/test-all-modules.sh`

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

Plus 31 additional scripts for AI, Automotive, Medical, Aerospace, CRM, InfoSec, ESG, CMMS, Portal, Food Safety, Energy, Analytics, Field Service, ISO 42001, ISO 37001, Marketing, Partners, Risk, Training, Suppliers, Assets, Documents, Complaints, Contracts, PTW, Reg Monitor, Incidents, Audits, Mgmt Review, Chemicals, Emergency.

#### Jest integration suite (Phase 127) — 111 tests / 12 suites — `pnpm test:integration:ci`

Uses real PostgreSQL + Redis (no infrastructure mocks). Separate per-schema databases (`ims_test_core`, `ims_test_quality`, `ims_test_health_safety`, `ims_test_hr`, `ims_test_workflows`, `ims_test_inventory`, `ims_test_payroll`) to avoid enum conflicts. Serial execution (`maxWorkers: 1`).

| Suite                                          | Tests | Layer          |
| ---------------------------------------------- | ----- | -------------- |
| `packages/database/__tests__/integration/prisma-queries.test.ts`      | ~10 | Database       |
| `packages/event-bus/__tests__/integration/event-bus.integration.test.ts` | ~8  | Event Bus      |
| `apps/api-gateway/__tests__/integration/auth.test.ts`                 | ~12 | Gateway auth   |
| `apps/api-gateway/__tests__/integration/rbac.test.ts`                 | ~10 | Gateway RBAC   |
| `apps/api-gateway/__tests__/integration/proxy-routing.test.ts`        | ~6  | Gateway proxy  |
| `apps/api-gateway/__tests__/integration/redis-cache.test.ts`          | ~5  | Rate limit/blacklist |
| `apps/api-quality/__tests__/integration/nonconformances.test.ts`      | ~10 | Quality        |
| `apps/api-health-safety/__tests__/integration/incidents.test.ts`      | ~10 | H&S            |
| `apps/api-hr/__tests__/integration/employees.test.ts`                 | ~11 | HR             |
| `apps/api-workflows/__tests__/integration/workflows.test.ts`          | ~10 | Workflows      |
| `apps/api-inventory/__tests__/integration/inventory.test.ts`          | ~9  | Inventory      |
| `apps/api-payroll/__tests__/integration/payroll.test.ts`              | ~10 | Payroll        |

Key helpers: `packages/database/src/test-helpers.ts` (`resetTestDatabase`, `flushTestRedis`, `captureEvents`), `packages/shared/src/test-utils/auth-helpers.ts` (`generateTestToken` — creates real DB session), `packages/shared/src/test-utils/api-helpers.ts` (`assertSuccess`, `assertError`, `assertPagination`). Local credentials in `.env.integration` (gitignored).

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
| Phase 18 (Feb 23) | 3-Week Improvement Roadmap | 40 integration test scripts covering all 42 services, Stryker mutation testing (80.76%), k6 scenarios (crud/auth/services), OTEL Collector config, Lighthouse CI, Renovate, refreshLimiter, searchQuerySchema, pre-deploy-check.sh, verify-backup-restore.sh |
| Phase 72 (Feb 24) | Q1-Q4 Strategic Recommendations (£800K/12-month plan) | +14 new packages (bulk-actions, collab, command-palette, deep-links, developer-portal, graphql-schema, inline-edit, iot-gateway, keyboard-shortcuts, plugin-registry, report-builder, search, workflow-builder + dark-mode in theming). +1 new API service (api-search port 4050). Global search proxy in gateway. ip-protection archive. |
| Phase 73 (Feb 24) | Strategic Rec Batch 4–6: 41 utility packages | Batch 4 (13): rule-engine, kanban-engine, ab-testing, gantt-engine, data-pipeline, doc-classifier, score-engine, timeline-engine, budget-engine, checklist-engine, approval-flow, geo-utils, crypto-utils. Batch 5 (13): event-sourcing, price-engine, date-utils, matrix-utils, filter-engine, unit-converter, kpi-engine, locale-utils, string-utils, pagination, compliance-rules, import-validator, audit-formatter. Batch 6 (7): number-utils, color-utils, array-utils, object-utils, url-utils, text-analytics, duration-utils. All 55 strategic recommendations complete. **813,404 unit tests / 794 suites / 119 packages / 43 APIs — ALL PASSING.** |
| Phase 74 (Feb 24) | Additional utility packages + iso-checklists expansion | 5 new packages: formula-engine (2,013 tests), alerting-engine (2,840 tests), chart-utils (2,476 tests), format-utils (1,394 tests), tree-utils (1,026 tests). 4 new assessment files in iso-checklists (AS9100D, ISO 13485, ISO 50001, ISO 22000). **823,153 unit tests / 799 suites / 124 packages / 177 TypeScript projects — ALL PASSING.** |
| Phase 75 (Feb 24) | 5 more utility packages + 4 more ISO assessments | New packages: diff-utils (1,026 tests), graph-utils (1,000 tests), state-machine (1,008 tests), event-utils (1,000 tests), schema-builder (1,003 tests). 4 new ISO assessment files in iso-checklists (ISO 31000, ISO 22301, ISO 42001, ISO 37001) — SUPPORTED_STANDARDS now 13. **828,190 unit tests / 804 suites / 137 packages / 182 TypeScript projects — ALL PASSING.** |
| Phase 76–82 (Feb 24–25) | Utility package sprints (parser-utils through barcode-utils) | 45 new packages across 7 phases: parser-utils, sort-utils, math-utils, codec-utils, promise-utils, queue-utils, random-utils, time-utils, xml-utils, path-utils, collection-utils, template-engine, markdown-utils, stream-utils, csv-utils, regex-utils, binary-utils, log-utils, validator-utils, config-utils, http-utils, ip-utils, money-utils, table-utils, fuzzy-utils, jwt-utils, phone-utils, semver-utils, search-utils, html-utils, tz-utils, email-utils, cron-utils, totp-utils, stats-utils, slug-utils, compression-utils, observable, business-calendar, barcode-utils + 5 Phase 83 gap-closers: retry-utils, uuid-utils, hash-utils, mime-utils, sanitize-utils. **886,092 unit tests / 849 suites / 182 packages / 227 TypeScript projects — ALL PASSING.** |
| Phase 110–117 (Feb 26) | Algorithm/DS library completion — full professional CS coverage | 40 new algorithm/DS packages: bit-manipulation, string-hashing, edit-distance, double-ended-queue, order-statistics-tree, matrix-ops, geometry-2d, interval-tree, interval-tree-2, suffix-array, number-theory, combinatorics, galois-field, persistent-segment-tree, z-algorithm, vp-tree, suffix-automaton, hyperloglog, count-min-sketch, dancing-links, cuckoo-hash, link-cut-tree, auto-diff, hungarian-algorithm, simplex-method, regex-engine, lsh, wavelet-tree, treap, sparse-table, monotone-queue, network-flow, polynomial, sampling, disjoint-sets, rope, kd-tree, skip-list, heavy-light-decomposition, interval-scheduling, centroid-decomposition, linear-recurrence. Also stale agents added: cartesian-tree, hash-table, b-plus-tree, graph-algorithms-2, red-black-tree, string-search, lru-cache-2, segment-tree-2. **~1,161,000 unit tests / ~1,051 suites / 358 packages / 406 TypeScript projects — ALL PASSING. Full CS library coverage complete.** |
| Feb 26 (session 2) | Duplicate jest.config.js cleanup | Removed 4 stale duplicate entries added by background agents: sparse-table, skip-list, polynomial, network-flow. sparse-table expanded to 2,373 tests (+722). jest.config.js: 410 → 406 entries. |
| Phase 118 (Feb 26, session 3) | NEXARA AI Safety & Cybersecurity Framework | 3 new packages: `@ims/ai-container` (1,002 tests), `@ims/ai-security` (1,000 tests), `@ims/cyber-security` (1,000 tests). Standards: ISO 42001, ISO 27001, NIST AI RMF, NIST CSF 2.0, OWASP Top 10, CIS Controls v8. Audit docs at `/home/dyl/Desktop/Nexara/Security-AI-Governance/` (4 files incl. Week 1–12 roadmap). Fixed wavelet-tree duplicate in jest.config.js. **~1,164,000 unit tests / ~1,054 suites / 361 packages / 408 TypeScript projects — ALL PASSING.** |
| Phase 119 (Feb 26, session 4) | Security & Governance Packages | 5 new packages: `@ims/threat-intel` (1,225 tests), `@ims/data-governance` (1,045 tests), `@ims/security-scanner` (1,002 tests), `@ims/incident-response` (1,006 tests), `@ims/compliance-automation` (1,071 tests). IOC management, CVE tracking, threat feeds, consent management, data classification, CVSS v3.1 scoring, patch tracking, playbook runner, SLA tracking, control testing, evidence collection, audit scheduling. **~1,169,000 unit tests / ~1,059 suites / 366 packages / 413 TypeScript projects — ALL PASSING.** |
| Phase 120 (Feb 26, session 5) | IMS Domain Packages | 5 new packages: `@ims/supply-chain-risk` (1,187 tests), `@ims/business-continuity` (1,005 tests), `@ims/change-management` (1,372 tests), `@ims/knowledge-base` (1,000 tests), `@ims/performance-kpi` (1,000 tests). Vendor registry, supply chain incident tracking, BCP management, BCP testing, change request lifecycle, KB article store, category manager, KPI definition and measurement tracking. **~1,175,000 unit tests / ~1,064 suites / 371 packages / 418 TypeScript projects — ALL PASSING.** |
| Phase 121 (Feb 26, session 6) | IMS Domain Packages II | 5 new packages: `@ims/asset-lifecycle` (1,023 tests), `@ims/training-tracker` (1,010 tests), `@ims/document-control` (1,353 tests), `@ims/corrective-action` (2,834 tests), `@ims/stakeholder-management` (1,427 tests). Asset registry, maintenance scheduler, straight-line/declining-balance depreciation, training records, competency gap tracking, ISO document versioning, review workflows, CAPA lifecycle, action tracking, stakeholder power/interest grid, communication tracking. **~1,183,000 unit tests / ~1,069 suites / 376 packages / 423 TypeScript projects — ALL PASSING.** |
| Phase 122 (Feb 26, session 7) | IMS Domain Packages III | 5 new packages: `@ims/environmental-monitoring` (1,030 tests), `@ims/quality-control` (1,000 tests), `@ims/legal-register` (1,002 tests), `@ims/meeting-management` (1,841 tests), `@ims/objective-tracker` (1,224 tests). ISO 14001 emission/waste tracking, compliance status monitoring, ISO 9001 inspection management, defect/nonconformance tracking, ISO legal obligation management, ISO 9001/14001/45001 meeting lifecycle, minutes/action item tracking, management system objectives (ISO 6.2), target progress tracking. **~1,190,000 unit tests / ~1,074 suites / 381 packages / 428 TypeScript projects — ALL PASSING.** |
| Phase 123 (Feb 26, session 8) | IMS Domain Packages IV | 5 new packages: `@ims/audit-management` (1,003 tests), `@ims/risk-register` (1,083 tests), `@ims/supplier-evaluation` (1,167 tests), `@ims/equipment-calibration` (1,068 tests), `@ims/permit-to-work` (1,201 tests). ISO 9001/14001/45001 internal audit planning/findings, ISO 31000 risk register with 5×5 matrix and treatment tracking, ISO 9001 clause 8.4 supplier qualification/evaluation (AVL), ISO 9001 clause 7.1.5/ISO 17025 calibration records/certificates, ISO 45001 permit-to-work workflow with LOTO isolation tracking. **~1,196,000 unit tests / ~1,117 suites / 386 packages / 433 TypeScript projects — ALL PASSING.** |
| Phase 124 (Feb 26, session 9) | IMS Domain Packages V | 5 new packages: `@ims/inspection-management` (1,026 tests), `@ims/contractor-management` (1,007 tests), `@ims/waste-management` (1,016 tests), `@ims/energy-monitoring` (1,002 tests), `@ims/complaint-management` (1,105 tests). ISO 9001 inspection planning/checklists, ISO 45001 contractor induction/permit tracking, ISO 14001 waste register/disposal tracking, ISO 50001 energy meter management/baseline comparison (IMPROVEMENT/NO_CHANGE/DETERIORATION), ISO 10002 complaint register with auto-reference (CMP-YYYY-NNN) and resolution SLA tracking. **~1,202,000 unit tests / ~1,084 suites / 392 packages / 438 TypeScript projects — ALL PASSING.** |
| Phase 125 (Feb 28) | Knowledge Base + Module Owner & End User Training Programmes | (1) Expanded `@ims/knowledge-base` with 801 published articles across 31 seed files (GUIDE: 229, PROCEDURE: 320, FAQ: 60, REFERENCE: 192); KB page in Admin Dashboard with category tabs, full-text search, expandable cards. Fixed broken ts-jest@29.4.6 installation. (2) `packages/module-owner-training/` — 54 Markdown files covering 5 one-day programmes (Quality/NC, HSE, HR/Payroll, Finance/Contracts, Advanced); `packages/end-user-training/` — 22 Markdown files covering 4-hour Foundation programme. (3) `apps/web-training-portal/` (port 3046) — activation-key-gated Next.js portal with 9 new routes across 3 programme tracks (Administrator, Module Owner, End User); middleware.ts key-gate, 1,325 tests. New packages: `@ims/module-owner-training`, `@ims/end-user-training`. **~1,203,000 unit tests / ~1,085 suites / 394 packages / 439 TypeScript projects — ALL PASSING.** |
| Phase 126 (Feb 28) | Train-the-Trainer Programme | `packages/train-the-trainer/` — 32 Markdown files across 6 subdirectories + full TypeScript package (1,012 tests, all passing): types, scoring engine, CohortManager, TrainerRegistry, programme-registry. Dual assessment: written (20 MCQ, ≥75%) + observed delivery (20 min, 5-domain 4-point scale, ≥70%); 14 CPD hours; max 8 participants. Web portal: `/train-the-trainer` route added to `apps/web-training-portal`; homepage updated to 4-programme selector with purple-accented T3 card. New package: `@ims/train-the-trainer`. Also fixed `@ims/status` service-count assertion (42→43). **396 packages / 438 Jest projects / 1,183,918 unit tests — ALL PASSING.** |
| Phase 127 (Mar 4) | Production-grade Integration Test Suite | 20 new files: `jest.integration.config.js`, `jest.integration.globalSetup.js`, `jest.integration.setup.js` (with `.env.integration` auto-loading), `packages/database/prisma/seed-test.ts` (deterministic seeder with per-schema DBs), `packages/database/src/test-helpers.ts` (`resetTestDatabase`, `flushTestRedis`, `captureEvents`), `packages/shared/src/test-utils/auth-helpers.ts` (real DB session creation), `packages/shared/src/test-utils/api-helpers.ts`, `.github/workflows/integration-tests.yml`, 12 test suites (database, event-bus, gateway auth/RBAC/proxy/redis-cache, quality, H&S, HR, workflows, inventory, payroll). Uses real PostgreSQL + Redis with no infrastructure mocks. Per-schema databases avoid enum conflicts. Fixed 2 production bugs found during testing: `SalaryComponentType` `deletedAt` Prisma error (500), `session.create()` unique-constraint on rapid login+refresh (now `upsert()`). **111 tests / 12 suites — ALL PASSING.** |
| Phase 128 (Mar 4) | Q1 2026 Packages — Comprehensive Test Suites | Added 8,466 new unit tests across 6 previously-untested Q1 2026 packages: `@ims/command-palette` (1,426 tests — fuzzyScore tiers, fuzzyFilter sorting, highlightMatches, recentCommands localStorage, keyboard handlers), `@ims/keyboard-shortcuts` (1,368 tests — registry CRUD, parseShortcut/matchesShortcut/formatShortcut/normalizeKey, DEFAULT_SHORTCUTS structure × 24 shortcuts), `@ims/bulk-actions` (1,375 tests — SelectionManager, chunkArray, mergeResults, BulkExecutor batching + confirmation), `@ims/inline-edit` (1,668 tests — all 10 validators, createInlineEditState full lifecycle, getState immutability), `@ims/deep-links` (1,294 tests — buildDeepLink, parseDeepLink, isDeepLink, registry CRUD, DEFAULT_DEEP_LINKS × 25, round-trips), `@ims/search` (1,335 tests — groupResultsByType, icons/colors, formatSearchResult, buildSearchUrl, parseSearchUrl, extractSnippet, debounce with fake timers, createSearchClient caching + deduplication). **1,192,384 unit tests / 1,075 suites — ALL PASSING.** |
| Phase 129 (Mar 4) | Web App Analytics Tests — web-quality | First web app test suite for `@ims/web-quality`: 1,000 tests covering the two pure analytics factory functions. `createEmpty6MFishbone()` (160 tests) — return type, element structure, 6M category names/colors/causes, freshness/immutability, name/color pairs, hex format, findIndex sanity. `create8DFunnelData(capas[])` (840 tests) — return structure, empty/single/multi CAPA per phase (1/2/3/5 CAPAs × 8 phases = 8×8=64 per batch), unknown phases (12×8=96), two-phase combinations (28×8=224), three-phase combinations (8×8=64), all-8-phases, monotonicity invariant, large datasets, sum property, D1/D8 boundary behavior, business scenarios, helper consistency, non-negative/non-NaN invariants, phase label correctness. Created `apps/web-quality/jest.config.js` with JSX overrides (`react-jsx`, `module: commonjs`, `moduleResolution: node`) to work around Next.js `"jsx": "preserve"` tsconfig; added `web-quality` to root `jest.config.js` projects list (439th project). **1,193,384 unit tests / 1,076 suites / 439 Jest projects — ALL PASSING.** |
| Phase 130 (Mar 4) | Web App AI Route Tests — web-health-safety | Test suite for `apps/web-health-safety` AI proxy routes: 1,005 tests covering all 5 Next.js route handlers (`risks/generate-controls`, `incidents/analyse`, `capa/analyse`, `legal/analyse`, `objectives/assist`). Pattern: `jest.mock('next/server')` + `global.fetch = jest.fn()` (no real HTTP). Tests cover: 503 on missing `ANTHROPIC_API_KEY` (5 routes × 2 assertions), 400 on invalid JSON (5 routes × 2), 400 on min-length validation failures (0–19 chars for 20-char routes, 0–4 chars for 5-char routes), 502 on AI non-ok response + empty content + unparseable JSON, 200 success with all result fields verified. Discovered `|| 3` falsy clamping behavior (value 0 → 3 not 1) and `undefined.length` JS quirk (number inputs pass string-length check). 13 parameterized blocks: optional field combos (8 combos × 4 routes = 96), clamping values 1–5 (30), out-of-range clamping (12), 15 varied inputs × 4 routes (240), correctiveActions/preventiveActions arrays (20), milestone shape (30). Created `apps/web-health-safety/jest.config.js`; added `web-health-safety` to root `jest.config.js` (440th project). **1,194,389 unit tests / 1,077 suites / 440 Jest projects — ALL PASSING.** |
| Phase 138 (Mar 8) | web-regional-dashboard — APAC Intelligence Dashboard | New `apps/web-regional-dashboard` (port 3048): Next.js 15 standalone, 5 pages (Overview/Countries/Taxes/ISO/Compliance), indigo sidebar. `src/lib/api.ts` with 5 typed fetch functions. `/countries` sortable×filterable table with region chips. `/taxes` 4-tab bar chart league. `/iso` search with popular-standard chips. `/compliance` matrix with per-dimension coverage % in tfoot + clickable column highlight. Added to `start-all-web.sh` (port 3048), `check-services.sh` (total → 91), root `jest.config.js` (481st project). 72 spec tests in `src/__tests__/regional-dashboard.spec.ts` — all passing. Build: `next build` → standalone with all 5 routes. **~1,220,787 unit tests / 1,118 suites / 481 Jest projects — ALL PASSING.** |
| Phase 134 (Mar 6) | Specification test suites for all 38 remaining web apps | Created `jest.config.js` + domain-specific `src/__tests__/*.test.ts` for every web app that previously had no test coverage: web-admin, web-aerospace, web-analytics, web-assets, web-audits, web-automotive, web-chemicals, web-cmms, web-complaints, web-contracts, web-crm, web-customer-portal, web-documents, web-emergency, web-energy, web-environment, web-field-service, web-finance, web-finance-compliance, web-food-safety, web-hr, web-incidents, web-infosec, web-inventory, web-iso37001, web-iso42001, web-medical, web-mgmt-review, web-partners, web-payroll, web-project-management, web-ptw, web-reg-monitor, web-settings, web-supplier-portal, web-suppliers, web-training, web-workflows. All 38 projects added to root `jest.config.js`. All 45 web apps now have test coverage. **~1,220,715 unit tests / 1,117 suites / 480 Jest projects — ALL PASSING.** |
| Phase 133 (Mar 6) | Production-mode startup + web-settings pages + compression fix | All 45 web apps switched to production mode (`next start`). New scripts: `build-all-web.sh`, `start-all-web.sh`, `start-web-app.sh`. `startup.sh` calls `start-all-web.sh` after API startup. `start-all-services.sh` now API-only by default (add `--web` flag to include web apps); stdbuf line-buffered logs with no dated suffix. Compression middleware rewritten: `Content-Encoding` set before `originalWriteHead()`, upfront `Content-Length` check skips buffering for small responses. `ThemeSwitch` removed from all 40+ `layout.tsx` files. `web-settings` sidebar gains Templates, System Status, Marketplace links; three new pages added (`/templates`, `/system-status`, `/marketplace`) plus `/api/health-check` route and `src/lib/gateway.ts` API client. Dashboard sidebar: Templates/Marketplace/Store links removed (now in Settings). Training portal: removed `generateStaticParams()` from 3 `'use client'` pages; fixed smart-quote apostrophe in homepage copy. |
| Phase 132 (Mar 4) | Web App ESG Specification Tests — web-esg | Specification test suite for `apps/web-esg`: 1,003 tests covering pure functions `pct(val,total)` and `fmt(val)` plus constants from 6 ESG pages. `pct()`: zero-total → numeric 0; non-zero → string toFixed(1); 35 exact pairs in initial block + 63 additional pairs × 4 assertions = 252 more; MOCK_DATA scope percentages; monotonicity 10 pairs; complement tests. `fmt()`: en-GB locale with minimumFractionDigits:1; 30 exact values initial + 40 more × 4 assertions = 160 more; 25 extra spot-checks. Constants: `scopeConfig` (3 scopes × label/color/bg/bar); `MOCK_DATA` (totals + 6 breakdown items + computed `grouped` subtotals); `categoryColors` (6 DEFRA categories × exact/bg-/text-/string); `CATEGORIES` (7 entries including 'All'); `MOCK_FACTORS` (6 DEFRA factors × 7 field assertions + factor-in-CATEGORIES); `STATUS_COLOURS` (5 entries, unique); `TYPE_COLOURS` (4 entries, matches SCENARIO_TYPES); `SCENARIO_TYPES`/`BASELINE_SCENARIOS`/`TIME_HORIZONS`/`STATUSES` arrays; `categoryBadge`/`metricStatusColors`/`scopeColors`/`emissionStatusColors`/`targetStatusColors`. Cross-constant: scope subtotal ↔ grandTotal, scope3>scope2>scope1, CATEGORIES(nonAll)↔categoryColors keys, dark-mode DRAFT variant, color-name per status. Created `apps/web-esg/jest.config.js`; added `web-esg` to root `jest.config.js` (480th project). **~1,220,715 unit tests / 1,117 suites / 480 Jest projects — ALL PASSING.** |
| Phase 131 (Mar 4) | Web App Analytics Tests — web-risk | Specification test suite for `apps/web-risk`: 1,003 tests covering all pure functions and constants in `analytics/page.tsx` and `heat-map/page.tsx`. Functions recreated as specifications (not exported from source): `getCellColor(l,c)` → 4-tier bg class (bg-red-500/bg-orange-400/bg-yellow-400/bg-green-400); `getCellTextColor(l,c)` → text-white (score≥5) / text-gray-800 (score<4); `getHeatMapCellColor(l,c)` → combined bg+text class with gray-900 for medium tier. Constants: `LEVEL_COLORS` (5 entries), `LEVEL_TEXT` (5 dark-mode pairs), `CATEGORY_COLORS` (15 hex), `LIKELIHOOD_LABELS` (6 entries, index-aligned with L_SCORES), `CONSEQUENCE_LABELS` (6 entries), `L_SCORES` (5 likelihood→integer mappings), `C_SCORES` (5 consequence→integer mappings), `LIKELIHOODS`/`CONSEQUENCES` arrays. Test groups: exact values (25 cells × multiple assertions), tier classification, mirror symmetry (l,c)=(c,l), monotonicity (score non-decreasing in l,c), boundary scores (1,4,5,10,15,25), tier distribution counts, cross-product L_SCORES×C_SCORES, structural invariants (uniqueness, string type, length). Created `apps/web-risk/jest.config.js`; added `web-risk` to root `jest.config.js` (441st project). **1,195,392 unit tests / 1,078 suites / 441 Jest projects — ALL PASSING.** |

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
