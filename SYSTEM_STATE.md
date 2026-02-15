# IMS System State — Single Source of Truth

> Last updated: 2026-02-15

## Summary

| Category | Count |
|----------|-------|
| API Services | 39 (+ 1 main API) |
| Web Applications | 43 |
| Shared Packages | 42 |
| Prisma Schemas | 38 |
| Database Tables | 595 total |
| Scripts | 20 |
| Unit Tests | ~8,169+ across 360+ suites |
| Integration Test Scripts | 9 (+ 1 finance) |

---

## API Services (39 + 1)

| Service | Directory | Port | Standard/Domain | Prisma Schema |
|---------|-----------|------|-----------------|---------------|
| Main API | `apps/api/` | — | Legacy dashboard routes | — |
| Gateway | `apps/api-gateway/` | 4000 | Auth, routing, roles, notifications, MSP, compliance | `core.prisma` |
| Health & Safety | `apps/api-health-safety/` | 4001 | ISO 45001:2018 | `health-safety.prisma` |
| Environment | `apps/api-environment/` | 4002 | ISO 14001:2015 | `environment.prisma` |
| Quality | `apps/api-quality/` | 4003 | ISO 9001:2015 | `quality.prisma` |
| AI Analysis | `apps/api-ai-analysis/` | 4004 | Multi-provider AI | `ai.prisma` |
| Inventory | `apps/api-inventory/` | 4005 | Stock management | `inventory.prisma` |
| HR | `apps/api-hr/` | 4006 | Human Resources | `hr.prisma` |
| Payroll | `apps/api-payroll/` | 4007 | Payroll & tax | `payroll.prisma` |
| Workflows | `apps/api-workflows/` | 4008 | Process automation | `workflows.prisma` |
| Project Management | `apps/api-project-management/` | 4009 | PMBOK / ISO 21502 | `project-management.prisma` |
| Automotive | `apps/api-automotive/` | 4010 | IATF 16949 | `automotive.prisma` |
| Medical | `apps/api-medical/` | 4011 | ISO 13485 | `medical.prisma` |
| Aerospace | `apps/api-aerospace/` | 4012 | AS9100D | `aerospace.prisma` |
| Finance | `apps/api-finance/` | 4013 | Financial management | `finance.prisma` |
| CRM | `apps/api-crm/` | 4014 | Customer relationship | `crm.prisma` |
| InfoSec | `apps/api-infosec/` | 4015 | ISO 27001 | `infosec.prisma` |
| ESG | `apps/api-esg/` | 4016 | ESG reporting | `esg.prisma` |
| CMMS | `apps/api-cmms/` | 4017 | Maintenance management | `cmms.prisma` |
| Portal | `apps/api-portal/` | 4018 | Customer/supplier portals | `portal.prisma` |
| Food Safety | `apps/api-food-safety/` | 4019 | HACCP / ISO 22000 | `food-safety.prisma` |
| Energy | `apps/api-energy/` | 4020 | ISO 50001 | `energy.prisma` |
| Analytics | `apps/api-analytics/` | 4021 | Business intelligence | `analytics.prisma` |
| Field Service | `apps/api-field-service/` | 4022 | Field operations | `field-service.prisma` |
| ISO 42001 | `apps/api-iso42001/` | 4023 | AI Management System | `iso42001.prisma` |
| ISO 37001 | `apps/api-iso37001/` | 4024 | Anti-Bribery | `iso37001.prisma` |
| Marketing | `apps/api-marketing/` | 4025 | Sales & marketing automation | `marketing.prisma` |
| Partners | `apps/api-partners/` | 4026 | Partner portal API | `marketing.prisma` |
| Risk & CAPA | `apps/api-risk/` | 4027 | ISO 31000 Risk Management | `risk.prisma` |
| Training | `apps/api-training/` | 4028 | Competence management | `training.prisma` |
| Suppliers | `apps/api-suppliers/` | 4029 | Supplier management | `suppliers.prisma` |
| Assets | `apps/api-assets/` | 4030 | Asset management | `assets.prisma` |
| Documents | `apps/api-documents/` | 4031 | Document control | `documents.prisma` |
| Complaints | `apps/api-complaints/` | 4032 | Complaint management | `complaints.prisma` |
| Contracts | `apps/api-contracts/` | 4033 | Contract lifecycle | `contracts.prisma` |
| Permit to Work | `apps/api-ptw/` | 4034 | PTW management | `ptw.prisma` |
| Regulatory Monitor | `apps/api-reg-monitor/` | 4035 | Regulatory change tracking | `reg-monitor.prisma` |
| Incidents | `apps/api-incidents/` | 4036 | Incident management | `incidents.prisma` |
| Audits | `apps/api-audits/` | 4037 | Audit programme | `audits.prisma` |
| Mgmt Review | `apps/api-mgmt-review/` | 4038 | Management review | `mgmt-review.prisma` |

---

## Web Applications (43)

| Application | Directory | Port | Domain |
|-------------|-----------|------|--------|
| Dashboard | `apps/web-dashboard/` | 3000 | Main dashboard |
| Health & Safety | `apps/web-health-safety/` | 3001 | ISO 45001 |
| Environment | `apps/web-environment/` | 3002 | ISO 14001 |
| Quality | `apps/web-quality/` | 3003 | ISO 9001 |
| Settings | `apps/web-settings/` | 3004 | Admin & RBAC |
| Inventory | `apps/web-inventory/` | 3005 | Stock management |
| HR | `apps/web-hr/` | 3006 | Human Resources |
| Payroll | `apps/web-payroll/` | 3007 | Payroll |
| Workflows | `apps/web-workflows/` | 3008 | Process automation |
| Project Management | `apps/web-project-management/` | 3009 | PMBOK |
| Automotive | `apps/web-automotive/` | 3010 | IATF 16949 |
| Medical | `apps/web-medical/` | 3011 | ISO 13485 |
| Aerospace | `apps/web-aerospace/` | 3012 | AS9100D |
| Finance | `apps/web-finance/` | 3013 | Financial management |
| CRM | `apps/web-crm/` | 3014 | CRM |
| InfoSec | `apps/web-infosec/` | 3015 | ISO 27001 |
| ESG | `apps/web-esg/` | 3016 | ESG reporting |
| CMMS | `apps/web-cmms/` | 3017 | Maintenance |
| Customer Portal | `apps/web-customer-portal/` | 3018 | External customers |
| Supplier Portal | `apps/web-supplier-portal/` | 3019 | External suppliers |
| Food Safety | `apps/web-food-safety/` | 3020 | HACCP |
| Energy | `apps/web-energy/` | 3021 | ISO 50001 |
| Analytics | `apps/web-analytics/` | 3022 | Business intelligence |
| Field Service | `apps/web-field-service/` | 3023 | Field operations |
| ISO 42001 | `apps/web-iso42001/` | 3024 | AI Management |
| ISO 37001 | `apps/web-iso37001/` | 3025 | Anti-Bribery |
| Marketing | `apps/web-marketing/` | 3030 | Landing page, ROI calculator, chatbot |
| Partners Portal | `apps/web-partners/` | 3026 | Partner referral portal |
| Admin Dashboard | `apps/web-admin/` | 3027 | Founder growth dashboard |
| Risk & CAPA | `apps/web-risk/` | 3031 | Risk management |
| Training | `apps/web-training/` | 3032 | Competence management |
| Suppliers | `apps/web-suppliers/` | 3033 | Supplier management |
| Assets | `apps/web-assets/` | 3034 | Asset management |
| Documents | `apps/web-documents/` | 3035 | Document control |
| Complaints | `apps/web-complaints/` | 3036 | Complaint management |
| Contracts | `apps/web-contracts/` | 3037 | Contract lifecycle |
| Fin. Compliance | `apps/web-finance-compliance/` | 3038 | Financial compliance |
| Permit to Work | `apps/web-ptw/` | 3039 | PTW management |
| Regulatory Monitor | `apps/web-reg-monitor/` | 3040 | Reg change tracking |
| Incidents | `apps/web-incidents/` | 3041 | Incident management |
| Audits | `apps/web-audits/` | 3042 | Audit programme |
| Mgmt Review | `apps/web-mgmt-review/` | 3043 | Management review |

---

## Shared Packages (42)

| Package | Directory | Description |
|---------|-----------|-------------|
| `@ims/a11y` | `packages/a11y/` | WCAG 2.2 AA accessibility utilities |
| `@ims/audit` | `packages/audit/` | Activity audit trail |
| `@ims/auth` | `packages/auth/` | JWT authentication middleware |
| `@ims/benchmarks` | `packages/benchmarks/` | Performance benchmarks |
| `@ims/cache` | `packages/cache/` | Redis caching layer |
| `@ims/calculations` | `packages/calculations/` | ISO calculation formulas |
| `@ims/charts` | `packages/charts/` | Chart components |
| `@ims/database` | `packages/database/` | Prisma schemas and clients (multi-domain) |
| `@ims/email` | `packages/email/` | Email templates and sending |
| `@ims/emission-factors` | `packages/emission-factors/` | GHG emission factor database |
| `@ims/esig` | `packages/esig/` | Electronic signature workflows |
| `@ims/event-bus` | `packages/event-bus/` | Cross-service event bus |
| `@ims/file-upload` | `packages/file-upload/` | Multi-format file handling |
| `@ims/finance-calculations` | `packages/finance-calculations/` | Financial calculation engine |
| `@ims/iso-checklists` | `packages/iso-checklists/` | ISO audit checklist engine |
| `@ims/monitoring` | `packages/monitoring/` | Winston logging, Prometheus metrics, health checks |
| `@ims/nlq` | `packages/nlq/` | Natural language query engine |
| `@ims/notifications` | `packages/notifications/` | WebSocket real-time notifications |
| `@ims/oee-engine` | `packages/oee-engine/` | Overall Equipment Effectiveness engine |
| `@ims/pdf-generator` | `packages/pdf-generator/` | PDF report generation |
| `@ims/performance` | `packages/performance/` | k6 load tests, Lighthouse CI, WCAG audit |
| `@ims/portal-auth` | `packages/portal-auth/` | Portal authentication (customer/supplier) |
| `@ims/pwa` | `packages/pwa/` | Progressive Web App (service worker, offline sync) |
| `@ims/rbac` | `packages/rbac/` | Role-based access control (39 roles, 17 modules) |
| `@ims/regulatory-feed` | `packages/regulatory-feed/` | Live regulatory change feed |
| `@ims/resilience` | `packages/resilience/` | Circuit breakers, retry logic |
| `@ims/sdk` | `packages/sdk/` | @nexara/sdk external SDK |
| `@ims/secrets` | `packages/secrets/` | HashiCorp Vault integration |
| `@ims/service-auth` | `packages/service-auth/` | Service-to-service JWT auth |
| `@ims/shared` | `packages/shared/` | Shared utilities |
| `@ims/spc-engine` | `packages/spc-engine/` | Statistical Process Control engine |
| `@ims/standards-convergence` | `packages/standards-convergence/` | Cross-standard mapping engine |
| `@ims/tax-engine` | `packages/tax-engine/` | Multi-jurisdiction tax calculation |
| `@ims/templates` | `packages/templates/` | 110 built-in document/report templates |
| `@ims/testing` | `packages/testing/` | Shared test utilities |
| `@ims/types` | `packages/types/` | Shared TypeScript types |
| `@ims/ui` | `packages/ui/` | React component library |
| `@ims/validation` | `packages/validation/` | Zod validation schemas |

---

## Prisma Schemas (38)

| Schema | File | Models | Domain |
|--------|------|--------|--------|
| Core | `core.prisma` | 19 | Users, sessions, audit, API keys, templates |
| Health & Safety | `health-safety.prisma` | 18 | ISO 45001 |
| Environment | `environment.prisma` | 24 | ISO 14001 |
| Quality | `quality.prisma` | 30 | ISO 9001 |
| AI | `ai.prisma` | 11 | Analysis, insights, embeddings |
| Inventory | `inventory.prisma` | 12 | Products, warehouses, stock |
| HR | `hr.prisma` | 27 | Employees, departments, training |
| Payroll | `payroll.prisma` | 14 | Runs, payslips, tax |
| Workflows | `workflows.prisma` | 17 | Definitions, instances, tasks |
| Project Management | `project-management.prisma` | 16 | Projects, sprints, timesheets |
| Automotive | `automotive.prisma` | 18 | IATF 16949 |
| Medical | `medical.prisma` | 27 | ISO 13485 |
| Aerospace | `aerospace.prisma` | 11 | AS9100D |
| Finance | `finance.prisma` | 23 | Accounts, transactions, budgets |
| CRM | `crm.prisma` | 17 | Contacts, opportunities, campaigns |
| InfoSec | `infosec.prisma` | 14 | ISO 27001 |
| ESG | `esg.prisma` | 15 | Environmental, social, governance |
| CMMS | `cmms.prisma` | 16 | Work orders, assets, maintenance |
| Portal | `portal.prisma` | 12 | Portal users, documents |
| Food Safety | `food-safety.prisma` | 14 | HACCP, ISO 22000 |
| Energy | `energy.prisma` | 12 | ISO 50001 |
| Analytics | `analytics.prisma` | 10 | Dashboards, reports, datasets |
| Field Service | `field-service.prisma` | 14 | Work orders, dispatch |
| ISO 42001 | `iso42001.prisma` | 7 | AI Management System |
| ISO 37001 | `iso37001.prisma` | 6 | Anti-Bribery |
| Marketing | `marketing.prisma` | 13 | Leads, partners, deals, health scores |
| Risk | `risk.prisma` | 3 | Risk registers, reviews, CAPA |
| Training | `training.prisma` | 5 | Courses, records, competencies, matrix, TNA |
| Suppliers | `suppliers.prisma` | 4 | Suppliers, scorecards, documents, spend |
| Assets | `assets.prisma` | 4 | Register, work orders, calibration, inspection |
| Documents | `documents.prisma` | 4 | Documents, versions, approvals, read receipts |
| Complaints | `complaints.prisma` | 3 | Complaints, actions, communications |
| Contracts | `contracts.prisma` | 4 | Contracts, approvals, notices, clauses |
| PTW | `ptw.prisma` | 3 | Permits, method statements, toolbox talks |
| Reg Monitor | `reg-monitor.prisma` | 3 | Changes, legal register, obligations |
| Incidents | `incidents.prisma` | 1 | Incidents (30+ fields, RIDDOR) |
| Audits | `audits.prisma` | 4 | Audits, findings, checklists, programmes |
| Mgmt Review | `mgmt-review.prisma` | 1 | Management reviews (AI agenda) |
| **Total** | | **595 tables** | |

---

## Gateway Routing (37 proxy targets + local routes)

### Local Routes (handled by gateway)
| Route | Description |
|-------|-------------|
| `/api/auth/*` | Login, registration, token refresh |
| `/api/users/*` | User management |
| `/api/dashboard/*` | Dashboard aggregation, compliance calendar/scores |
| `/api/sessions/*` | Session management |
| `/api/reports/*` | Report generation |
| `/api/notifications/*` | WebSocket notifications |
| `/api/organisations/*` | MSP mode |
| `/api/compliance/*` | Regulatory feed |
| `/api/roles/*` | Role management |
| `/api/access-log/*` | Access audit log |
| `/api/csrf-token` | CSRF token |
| `/api/v1/templates/*` | Template library (110 templates) |

### Proxy Routes (v1 + legacy)
| Route Pattern | Target Service | Port |
|---------------|---------------|------|
| `/api/health-safety/*` | api-health-safety | 4001 |
| `/api/environment/*` | api-environment | 4002 |
| `/api/quality/*` | api-quality | 4003 |
| `/api/ai/*` | api-ai-analysis | 4004 |
| `/api/inventory/*` | api-inventory | 4005 |
| `/api/hr/*` | api-hr | 4006 |
| `/api/payroll/*` | api-payroll | 4007 |
| `/api/workflows/*` | api-workflows | 4008 |
| `/api/project-management/*` | api-project-management | 4009 |
| `/api/automotive/*` | api-automotive | 4010 |
| `/api/medical/*` | api-medical | 4011 |
| `/api/aerospace/*` | api-aerospace | 4012 |
| `/api/finance/*` | api-finance | 4013 |
| `/api/crm/*` | api-crm | 4014 |
| `/api/infosec/*` | api-infosec | 4015 |
| `/api/esg/*` | api-esg | 4016 |
| `/api/cmms/*` | api-cmms | 4017 |
| `/api/portal/*` | api-portal | 4018 |
| `/api/food-safety/*` | api-food-safety | 4019 |
| `/api/energy/*` | api-energy | 4020 |
| `/api/analytics/*` | api-analytics | 4021 |
| `/api/field-service/*` | api-field-service | 4022 |
| `/api/iso42001/*` | api-iso42001 | 4023 |
| `/api/iso37001/*` | api-iso37001 | 4024 |
| `/api/marketing/*` | api-marketing | 4025 |
| `/api/partners/*` | api-partners | 4026 |
| `/api/risk/*` | api-risk | 4027 |
| `/api/training/*` | api-training | 4028 |
| `/api/suppliers/*` | api-suppliers | 4029 |
| `/api/assets/*` | api-assets | 4030 |
| `/api/documents/*` | api-documents | 4031 |
| `/api/complaints/*` | api-complaints | 4032 |
| `/api/contracts/*` | api-contracts | 4033 |
| `/api/ptw/*` | api-ptw | 4034 |
| `/api/reg-monitor/*` | api-reg-monitor | 4035 |
| `/api/incidents/*` | api-incidents | 4036 |
| `/api/audits/*` | api-audits | 4037 |
| `/api/mgmt-review/*` | api-mgmt-review | 4038 |

All routes also available under `/api/v1/` prefix.

---

## Scripts (20)

| Script | Description |
|--------|-------------|
| `scripts/startup.sh` | Full startup (kill ports, Docker up, seed DB, recreate tables) |
| `scripts/start-all-services.sh` | Start all 56 services with staggered delays |
| `scripts/stop-all-services.sh` | Stop all services (ports 4000-4026 + 3000-3030) |
| `scripts/check-services.sh` | Health check all 56 services |
| `scripts/create-databases.sh` | Create per-service databases |
| `scripts/migrate-data.sh` | Migrate data between databases |
| `scripts/daily-report.sh` | Generate daily status report |
| `scripts/generate-secrets.sh` | Generate service secrets |
| `scripts/init-vault.sh` | Initialize HashiCorp Vault |
| `scripts/verify-secrets.sh` | Verify secrets configuration |
| `scripts/test-all-modules.sh` | Run all integration tests (master runner) |
| `scripts/test-hs-modules.sh` | H&S integration tests (~70 assertions) |
| `scripts/test-env-modules.sh` | Environment integration tests (~60) |
| `scripts/test-quality-modules.sh` | Quality integration tests (~80) |
| `scripts/test-hr-modules.sh` | HR integration tests (~50) |
| `scripts/test-payroll-modules.sh` | Payroll integration tests (~40) |
| `scripts/test-inventory-modules.sh` | Inventory integration tests (~40) |
| `scripts/test-workflows-modules.sh` | Workflows integration tests (~40) |
| `scripts/test-pm-modules.sh` | PM integration tests (~45) |
| `scripts/test-finance-modules.sh` | Finance integration tests |

---

## Test Coverage

### Unit Tests by Service (alphabetical)

| Service | Test Files | Tests (approx) |
|---------|-----------|----------------|
| api-aerospace | 8 | ~338 |
| api-ai-analysis | 5 | ~75 |
| api-analytics | 13 | ~174 |
| api-automotive | 13 | ~502 |
| api-cmms | 12 | ~213 |
| api-crm | 8 | ~283 |
| api-energy | 12 | ~196 |
| api-environment | 14 | ~442 |
| api-esg | 14 | ~207 |
| api-field-service | 13 | ~189 |
| api-finance | 7 | ~321 |
| api-food-safety | 14 | ~241 |
| api-gateway | 38 | ~725 |
| api-health-safety | 10 | ~266 |
| api-hr | 8 | ~305 |
| api-infosec | 7 | ~227 |
| api-inventory | 6 | ~160 |
| api-iso37001 | 6 | ~156 |
| api-iso42001 | 9 | ~221 |
| api-medical | 14 | ~584 |
| api-payroll | 8 | ~303 |
| api-portal | 16 | ~168 |
| api-project-management | 13 | ~230 |
| api-marketing | 13 | ~125 |
| api-partners | 3 | ~35 |
| api-quality | 29 | ~994 |
| api-workflows | 7 | ~231 |
| **Shared packages** | — | ~948 |
| **Total** | **325+** | **~8,037** |

### Integration Tests (9 scripts, ~465+ assertions)

| Script | Module | Assertions |
|--------|--------|------------|
| test-hs-modules.sh | Health & Safety | ~70 |
| test-env-modules.sh | Environment | ~60 |
| test-quality-modules.sh | Quality | ~80 |
| test-hr-modules.sh | HR | ~50 |
| test-payroll-modules.sh | Payroll | ~40 |
| test-inventory-modules.sh | Inventory | ~40 |
| test-workflows-modules.sh | Workflows | ~40 |
| test-pm-modules.sh | Project Management | ~45 |
| test-finance-modules.sh | Finance | ~40 |

---

## Build Phases (all completed)

| Phase | Focus | Key Deliverables |
|-------|-------|-----------------|
| Phase 0 | Platform Hardening | RBAC retrofit, WebSocket notifications, workflow builder, PWA, performance baseline |
| Phase 1 | RBAC | @ims/rbac package (39 roles, 17 modules, 7 permission levels) |
| Phase 2 | Finance | api-finance, web-finance |
| Phase 3 | CRM + InfoSec | api-crm, web-crm, api-infosec, web-infosec |
| Phase 4 | ESG | api-esg, web-esg |
| Phase 5 | CMMS | api-cmms, web-cmms |
| Phase 6 | Portals | api-portal, web-customer-portal, web-supplier-portal |
| Phase 7a | Food Safety | api-food-safety, web-food-safety |
| Phase 7b | Energy | api-energy, web-energy |
| Phase 8 | Analytics | api-analytics, web-analytics |
| Phase 9 | Payroll Localisation | Jurisdictions, tax calculator routes |
| Phase 10 | Field Service | api-field-service, web-field-service |
| Phase 11 | Unique Differentiators | Evidence packs, headstart tool, MSP mode, regulatory feed, ISO 42001, ISO 37001 |
| Phase 12 | Sales & Marketing Automation | api-marketing, api-partners, web-partners, web-admin, ROI calculator, chatbot, partner portal, growth dashboard |

---

## Environment Files

| File | Location | Purpose |
|------|----------|---------|
| `.env` | Root | Global environment (DATABASE_URL, JWT_SECRET, API keys) |
| `.env` | Each `apps/api-*/` | Per-service PORT, DATABASE_URL |
| `docker-compose.yml` | Root | All containerized services |

### Database Credentials (Docker)
- User: `postgres`
- Password: `${POSTGRES_PASSWORD}`
- Port: `5432`
- Database: `ims`
