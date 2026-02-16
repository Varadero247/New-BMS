# Module Status

Last updated: 2026-02-15

## API Services

| Module | Standard | API Service | Port | Status | Endpoints | Tests | Last Updated |
|--------|----------|-------------|------|--------|-----------|-------|--------------|
| Health & Safety | ISO 45001:2018 | api-health-safety | 4001 | Active | 52 | 266 | 2026-02-13 |
| Environmental | ISO 14001:2015 | api-environment | 4002 | Active | 77 | 442 | 2026-02-13 |
| Quality | ISO 9001:2015 | api-quality | 4003 | Active | 125 | 789 | 2026-02-13 |
| AI Analysis | Multi-provider | api-ai-analysis | 4004 | Active | 10 | 75 | 2026-02-13 |
| Inventory | Asset Management | api-inventory | 4005 | Active | 34 | 160 | 2026-02-13 |
| HR | HRM | api-hr | 4006 | Active | 79 | 305 | 2026-02-13 |
| Payroll | Payroll | api-payroll | 4007 | Active | 39 | 163 | 2026-02-13 |
| Workflows | BPM | api-workflows | 4008 | Active | 61 | 231 | 2026-02-13 |
| Dashboard | IMS Aggregator | api | 4025 | Active | - | - | 2026-02-14 |
| Project Management | PMBOK/ISO 21502 | api-project-management | 4009 | Active | 65 | 230 | 2026-02-13 |
| Automotive | IATF 16949 | api-automotive | 4010 | Active | 43 | 502 | 2026-02-13 |
| Medical Devices | ISO 13485 | api-medical | 4011 | Active | 66 | 584 | 2026-02-13 |
| Aerospace | AS9100D | api-aerospace | 4012 | Active | 41 | 338 | 2026-02-13 |
| Gateway | Cross-cutting | api-gateway | 4000 | Active | 67 | 454 | 2026-02-13 |
| Finance | Financial Management | api-finance | 4013 | Active | 35 | 321 | 2026-02-13 |
| CRM | Customer Relationship | api-crm | 4014 | Active | 40 | 180 | 2026-02-13 |
| InfoSec | ISO 27001 | api-infosec | 4015 | Active | 35 | 175 | 2026-02-13 |
| ESG | ESG Reporting | api-esg | 4016 | Active | 70 | 207 | 2026-02-13 |
| CMMS | Maintenance | api-cmms | 4017 | Active | 60 | 226 | 2026-02-13 |
| Portal | Customer/Supplier | api-portal | 4018 | Active | 80 | 168 | 2026-02-13 |
| Food Safety | HACCP/ISO 22000 | api-food-safety | 4019 | Active | 70 | 241 | 2026-02-13 |
| Energy | ISO 50001 | api-energy | 4020 | Active | 60 | 196 | 2026-02-13 |
| Analytics | Business Intelligence | api-analytics | 4021 | Active | 45 | 142 | 2026-02-13 |
| Field Service | Field Operations | api-field-service | 4022 | Active | 65 | 189 | 2026-02-13 |
| ISO 42001 | AI Management | api-iso42001 | 4023 | Active | 35 | 120 | 2026-02-13 |
| ISO 37001 | Anti-Bribery | api-iso37001 | 4024 | Active | 30 | 105 | 2026-02-13 |
| Marketing | Sales Automation | api-marketing | 4025 | Active | 65 | 125 | 2026-02-15 |
| Partners | Partner Portal | api-partners | 4026 | Active | 20 | 35 | 2026-02-15 |
| Risk & CAPA | ISO 31000 | api-risk | 4027 | Active | 15 | 18 | 2026-02-15 |
| Training | Competence Mgmt | api-training | 4028 | Active | 14 | 12 | 2026-02-15 |
| Suppliers | Supplier Mgmt | api-suppliers | 4029 | Active | 16 | 12 | 2026-02-15 |
| Assets | Asset Mgmt | api-assets | 4030 | Active | 14 | 12 | 2026-02-15 |
| Documents | Document Control | api-documents | 4031 | Active | 12 | 12 | 2026-02-15 |
| Complaints | Complaint Mgmt | api-complaints | 4032 | Active | 14 | 12 | 2026-02-15 |
| Contracts | Contract Lifecycle | api-contracts | 4033 | Active | 14 | 12 | 2026-02-15 |
| Permit to Work | PTW Management | api-ptw | 4034 | Active | 10 | 12 | 2026-02-15 |
| Regulatory Monitor | Reg Change Tracking | api-reg-monitor | 4035 | Active | 6 | 6 | 2026-02-15 |
| Incidents | Incident Mgmt | api-incidents | 4036 | Active | 10 | 6 | 2026-02-15 |
| Audits | Audit Programme | api-audits | 4037 | Active | 12 | 12 | 2026-02-15 |
| Mgmt Review | Management Review | api-mgmt-review | 4038 | Active | 6 | 6 | 2026-02-15 |

**Total: 39 services | ~1,626 endpoints | ~11,567 tests**

## Shared Packages

| Package | Description | Tests |
|---------|-------------|-------|
| @ims/database | Prisma schemas and clients | - |
| @ims/auth | JWT authentication middleware | 108 |
| @ims/service-auth | RBAC ownership middleware | 63 |
| @ims/shared | Shared types (ApiResponse, AuthUser, PaginatedResponse) | 22 |
| @ims/validation | Zod validation schemas | 104 |
| @ims/monitoring | Winston logging, Prometheus metrics, health checks | 44 |
| @ims/audit | Activity audit trail | 51 |
| @ims/templates | Template library (184 templates, renderer, exporter) | - |
| @ims/iso-checklists | ISO audit checklists engine | 101 |
| @ims/esig | Electronic signatures (21 CFR Part 11) | 103 |
| @ims/spc-engine | Statistical Process Control (X-bar R, P-chart, IMR) | 177 |
| @ims/resilience | Circuit breakers, retry logic | 71 |
| @ims/cache | Redis caching with cursor pagination | - |
| @ims/a11y | WCAG 2.2 AA accessibility | - |
| @ims/secrets | HashiCorp Vault integration | 64 |
| @ims/email | Email templates and sending | - |
| @ims/file-upload | Multi-format file handling | 62 |
| @ims/calculations | ISO calculation formulas | - |
| @ims/types | Shared TypeScript types | - |
| @ims/ui | Shared UI components | - |
| @ims/charts | Chart components | - |
| @ims/sdk | @nexara/sdk NPM package | - |
| @ims/testing | Test utilities | - |

| @ims/rbac | Role-based access control (39 roles, 17 modules) | 65 |
| @ims/notifications | WebSocket notifications + bell component | 31 |
| @ims/pwa | PWA offline support (service worker, sync queue) | 33 |
| @ims/performance | Load tests, Lighthouse CI, WCAG 2.2 AA | 10 |
| @ims/finance-calculations | Financial calculation engine | - |
| @ims/emission-factors | GHG emission factor database | - |
| @ims/oee-engine | Overall Equipment Effectiveness engine | - |
| @ims/portal-auth | Portal authentication | - |
| @ims/nlq | Natural language query engine | - |
| @ims/tax-engine | Multi-jurisdiction tax calculation | 35 |
| @ims/event-bus | Inter-service event bus | - |
| @ims/standards-convergence | Standards overlap analysis | - |
| @ims/pdf-generator | PDF document generation | - |
| @ims/regulatory-feed | Regulatory update feeds | - |
| @ims/benchmarks | Performance benchmarking | - |

**Total: 39 packages | ~1,109 package-level tests**

## Standards Compliance Matrix

| Standard | Clause | Description | Status | Module |
|----------|--------|-------------|--------|--------|
| ISO 9001:2015 | 4.1-4.4 | Context of the Organization | Implemented | Quality |
| ISO 9001:2015 | 5.1-5.3 | Leadership | Implemented | Quality |
| ISO 9001:2015 | 6.1-6.3 | Planning | Implemented | Quality |
| ISO 9001:2015 | 7.1-7.5 | Support | Implemented | Quality |
| ISO 9001:2015 | 8.1-8.7 | Operation (NCR, CAPA, Documents, Audits, FMEA, Suppliers) | Implemented | Quality |
| ISO 9001:2015 | 9.1-9.3 | Performance Evaluation | Implemented | Quality |
| ISO 9001:2015 | 10.1-10.3 | Improvement | Implemented | Quality |
| ISO 14001:2015 | 6.1.2 | Environmental Aspects | Implemented | Environment |
| ISO 14001:2015 | 6.1.3 | Compliance Obligations | Implemented | Environment |
| ISO 14001:2015 | 6.2 | Objectives & Planning | Implemented | Environment |
| ISO 14001:2015 | 8.1 | Operational Planning | Implemented | Environment |
| ISO 14001:2015 | 8.2 | Emergency Preparedness | Implemented | Environment |
| ISO 14001:2015 | 9.1 | Monitoring & Measurement | Implemented | Environment |
| ISO 14001:2015 | 9.3 | Management Review | Implemented | Environment |
| ISO 45001:2018 | 6.1 | Hazard Identification & Risk Assessment | Implemented | H&S |
| ISO 45001:2018 | 6.2 | OH&S Objectives | Implemented | H&S |
| ISO 45001:2018 | 8.1.1 | Elimination of Hazards | Implemented | H&S |
| ISO 45001:2018 | 8.2 | Emergency Preparedness | Implemented | H&S |
| ISO 45001:2018 | 9.3 | Management Review | Implemented | H&S |
| ISO 45001:2018 | 10.2 | Incident Investigation | Implemented | H&S |
| IATF 16949 | 8.3 | APQP Product Design | Implemented | Automotive |
| IATF 16949 | 8.3.4 | PPAP Production Part Approval | Implemented | Automotive |
| IATF 16949 | 8.5.6 | Control Plans | Implemented | Automotive |
| IATF 16949 | 9.1.1 | SPC Statistical Process Control | Implemented | Automotive |
| IATF 16949 | 7.1.5 | MSA Measurement Systems Analysis | Implemented | Automotive |
| ISO 13485 | 7.3 | Design & Development | Implemented | Medical |
| ISO 13485 | 8.2.2 | Complaint Handling | Implemented | Medical |
| ISO 13485 | 8.5 | PMS Post-Market Surveillance | Implemented | Medical |
| ISO 14971 | 4-10 | Risk Management | Implemented | Medical |
| AS9100D | 8.5.1 | First Article Inspection (AS9102C) | Implemented | Aerospace |
| AS9100D | 8.1.4 | Configuration Management | Implemented | Aerospace |
| AS9100D | 8.5.2 | Key Characteristics | Implemented | Aerospace |
| ISO 27001 | A.5-A.18 | Information Security Controls | Implemented | InfoSec |
| ISO 22000 | 7-8 | HACCP & Food Safety | Implemented | Food Safety |
| ISO 50001 | 4-10 | Energy Management | Implemented | Energy |
| ISO 42001 | 4-10 | AI Management System | Implemented | ISO 42001 |
| ISO 37001 | 4-10 | Anti-Bribery Management | Implemented | ISO 37001 |
| GRI/SASB/TCFD | - | ESG Reporting Frameworks | Implemented | ESG |
