# NEXARA IMS PLATFORM — DOCUMENTATION INDEX

---
> **CONFIDENTIAL — TRADE SECRET**
> This document is the property of Nexara DMCC and contains confidential and
> proprietary information. Unauthorised disclosure is prohibited.
> © 2026 Nexara DMCC. All rights reserved.
---


**Updated:** February 23, 2026
**Total documentation:** ~215 KB primary references + 50+ supporting docs + 40 UAT test plans

---

## Primary Reference Documents (Updated Feb 27, 2026)

| Document | Lines | Size | Description |
|----------|-------|------|-------------|
| [NEXARA_IMS_PLATFORM_SOP_COMPLETE.md](./NEXARA_IMS_PLATFORM_SOP_COMPLETE.md) | 2,578 | 93 KB | Complete Standard Operating Procedures — architecture, all 43 services + api-search, SOPs for every module, deployment, monitoring, security, troubleshooting, development guidelines, testing |
| [NEXARA_FEATURE_CATALOG.md](./NEXARA_FEATURE_CATALOG.md) | 1,300 | 56 KB | Full business capabilities matrix — every feature with exact HTTP endpoints for all 43 services + api-search (2,558+ endpoints total) |
| [DATABASE_SCHEMA_REFERENCE.md](./DATABASE_SCHEMA_REFERENCE.md) | 1,953 | 65 KB | Complete database reference — all 44 schemas, ~590 models with field definitions, 781+ enums, migration commands |

---

## Existing Documentation

| Document | Description |
|----------|-------------|
| [API_REFERENCE.md](./API_REFERENCE.md) | Full API reference for all services |
| [CODE_EVALUATION_REPORT.md](./CODE_EVALUATION_REPORT.md) | Score: 100/100 — security, architecture, code quality |
| [DATABASE_ARCHITECTURE.md](./DATABASE_ARCHITECTURE.md) | Database design overview (25 schemas) |
| [DATABASE_SCHEMA_NOTES.md](./DATABASE_SCHEMA_NOTES.md) | Schema recreation, missing columns, OpenSSL issues |
| [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) | Step-by-step deployment guide |
| [FIXES_LOG.md](./FIXES_LOG.md) | Detailed change log (Sessions 1-12, Phases 0-11) |
| [LAUNCH_READINESS_FINAL_REPORT.md](./LAUNCH_READINESS_FINAL_REPORT.md) | Launch readiness: 70/111 checks passed |
| [SECURITY.md](./SECURITY.md) | Security implementation details |
| [SYSTEM-ARCHITECTURE.md](./SYSTEM-ARCHITECTURE.md) | System architecture overview |
| [TEMPLATES.md](./TEMPLATES.md) | 192 built-in template library guide |
| [DEVELOPER_ONBOARDING.md](./DEVELOPER_ONBOARDING.md) | New developer setup guide — prerequisites, architecture, common gotchas |
| [LOGGING_GUIDE.md](./LOGGING_GUIDE.md) | Structured logging patterns, correlation IDs, jq examples |
| [MUTATION_TESTING.md](./MUTATION_TESTING.md) | Stryker mutation testing — how to run, interpret scores, add packages |
| [RUNBOOK.md](./RUNBOOK.md) | Operational runbook — alert response, incident procedures, deployment |
| [TESTING_GUIDE.md](./TESTING_GUIDE.md) | All 7 test layers — unit, integration, mutation, load, coverage, Lighthouse, UAT |
| [TRACING.md](./TRACING.md) | OpenTelemetry distributed tracing — setup, custom spans, production |
| [STRATEGIC_RECOMMENDATIONS_REPORT.md](./STRATEGIC_RECOMMENDATIONS_REPORT.md) | Implemented and deferred strategic recommendations |
| [NON_CODEABLE_ITEMS.md](./NON_CODEABLE_ITEMS.md) | Items requiring human/ops intervention before production launch |
| [MODULE_STATUS.md](./MODULE_STATUS.md) | Full module status matrix — all 43 services + api-search with endpoints and standards |

---

## UAT Test Plans (docs/uat/)

40 User Acceptance Test plans — full coverage of all 40 functional API services (25 BDD test cases each, 1,000 total):

| Document | Module | Standard | Port |
|----------|--------|----------|------|
| [UAT_AI_ANALYSIS.md](./uat/UAT_AI_ANALYSIS.md) | AI Analysis | — | 4004 |
| [UAT_ANALYTICS.md](./uat/UAT_ANALYTICS.md) | Analytics | — | 4021 |
| [UAT_AEROSPACE.md](./uat/UAT_AEROSPACE.md) | Aerospace | AS9100D | 4012 |
| [UAT_ASSETS.md](./uat/UAT_ASSETS.md) | Asset Management | — | 4030 |
| [UAT_AUDITS.md](./uat/UAT_AUDITS.md) | Audit Management | — | 4037 |
| [UAT_AUTOMOTIVE.md](./uat/UAT_AUTOMOTIVE.md) | Automotive | IATF 16949 | 4010 |
| [UAT_CHEMICALS.md](./uat/UAT_CHEMICALS.md) | Chemicals (COSHH) | REACH/COSHH | 4040 |
| [UAT_CMMS.md](./uat/UAT_CMMS.md) | CMMS | — | 4017 |
| [UAT_COMPLAINTS.md](./uat/UAT_COMPLAINTS.md) | Complaints | — | 4032 |
| [UAT_CONTRACTS.md](./uat/UAT_CONTRACTS.md) | Contracts | — | 4033 |
| [UAT_CRM.md](./uat/UAT_CRM.md) | CRM | — | 4014 |
| [UAT_DOCUMENTS.md](./uat/UAT_DOCUMENTS.md) | Document Control | — | 4031 |
| [UAT_EMERGENCY.md](./uat/UAT_EMERGENCY.md) | Emergency Management | — | 4041 |
| [UAT_ENERGY.md](./uat/UAT_ENERGY.md) | Energy Management | ISO 50001:2018 | 4020 |
| [UAT_ENVIRONMENT.md](./uat/UAT_ENVIRONMENT.md) | Environment | ISO 14001:2015 | 4002 |
| [UAT_ESG.md](./uat/UAT_ESG.md) | ESG Reporting | GRI/SASB/TCFD | 4016 |
| [UAT_FIELD_SERVICE.md](./uat/UAT_FIELD_SERVICE.md) | Field Service | — | 4022 |
| [UAT_FINANCE.md](./uat/UAT_FINANCE.md) | Finance | — | 4013 |
| [UAT_FOOD_SAFETY.md](./uat/UAT_FOOD_SAFETY.md) | Food Safety | ISO 22000/HACCP | 4019 |
| [UAT_HEALTH_SAFETY.md](./uat/UAT_HEALTH_SAFETY.md) | Health & Safety | ISO 45001:2018 | 4001 |
| [UAT_HR.md](./uat/UAT_HR.md) | Human Resources | — | 4006 |
| [UAT_INCIDENTS.md](./uat/UAT_INCIDENTS.md) | Incident Management | — | 4036 |
| [UAT_INFOSEC.md](./uat/UAT_INFOSEC.md) | Information Security | ISO 27001:2022 | 4015 |
| [UAT_INVENTORY.md](./uat/UAT_INVENTORY.md) | Inventory | — | 4005 |
| [UAT_ISO37001.md](./uat/UAT_ISO37001.md) | Anti-Bribery | ISO 37001:2016 | 4024 |
| [UAT_ISO42001.md](./uat/UAT_ISO42001.md) | AI Management | ISO 42001:2023 | 4023 |
| [UAT_MARKETING.md](./uat/UAT_MARKETING.md) | Marketing | — | 4025 |
| [UAT_MEDICAL.md](./uat/UAT_MEDICAL.md) | Medical Devices | ISO 13485 | 4011 |
| [UAT_MGMT_REVIEW.md](./uat/UAT_MGMT_REVIEW.md) | Management Review | ISO 9001 §9.3 | 4038 |
| [UAT_PARTNERS.md](./uat/UAT_PARTNERS.md) | Partners Portal | — | 4026 |
| [UAT_PAYROLL.md](./uat/UAT_PAYROLL.md) | Payroll | — | 4007 |
| [UAT_PORTAL.md](./uat/UAT_PORTAL.md) | Customer Portal | — | 4018 |
| [UAT_PROJECT_MANAGEMENT.md](./uat/UAT_PROJECT_MANAGEMENT.md) | Project Management | — | 4009 |
| [UAT_PTW.md](./uat/UAT_PTW.md) | Permit to Work | — | 4034 |
| [UAT_QUALITY.md](./uat/UAT_QUALITY.md) | Quality Management | ISO 9001:2015 | 4003 |
| [UAT_REG_MONITOR.md](./uat/UAT_REG_MONITOR.md) | Regulatory Monitor | — | 4035 |
| [UAT_RISK.md](./uat/UAT_RISK.md) | Enterprise Risk | — | 4027 |
| [UAT_SUPPLIERS.md](./uat/UAT_SUPPLIERS.md) | Suppliers | — | 4029 |
| [UAT_TRAINING.md](./uat/UAT_TRAINING.md) | Training | — | 4028 |
| [UAT_WORKFLOWS.md](./uat/UAT_WORKFLOWS.md) | Workflows | — | 4008 |

---

## Root-Level Reference Files

| File | Description |
|------|-------------|
| [SYSTEM_STATE.md](../SYSTEM_STATE.md) | Single source of truth for all services, packages, schemas |
| [QUICK_REFERENCE.md](../QUICK_REFERENCE.md) | Quick reference card — ports, commands, patterns |
| [CLAUDE.md](../CLAUDE.md) | Development guidelines and known issue fixes |
| [renovate.json](../renovate.json) | Renovate bot config — auto-merge patches, grouped deps |
| [stryker.*.config.mjs](../stryker.auth.config.mjs) | Stryker mutation testing configs (auth/security/rbac/finance/validation) |
| [CHANGELOG.md](../CHANGELOG.md) | Milestone history v0.5.0 → v0.9.0+ |
| [CONTRIBUTING.md](../CONTRIBUTING.md) | How to add modules, code standards, PR process |

---

## Architecture Decision Records (docs/adr/)

6 ADRs capturing key architectural decisions:

| ADR | Title | Status |
|-----|-------|--------|
| [ADR-001](./adr/ADR-001-monorepo-structure.md) | Monorepo with pnpm workspaces + Turborepo | Accepted |
| [ADR-002](./adr/ADR-002-api-gateway-pattern.md) | Centralised API gateway with http-proxy-middleware | Accepted |
| [ADR-003](./adr/ADR-003-multi-schema-database.md) | One Prisma schema per domain (44 schemas) | Accepted |
| [ADR-004](./adr/ADR-004-jwt-bearer-auth.md) | JWT Bearer token auth stored in localStorage | Accepted |
| [ADR-005](./adr/ADR-005-next-app-per-module.md) | Separate Next.js app per functional module | Accepted |
| [ADR-006](./adr/ADR-006-no-shared-db-connection.md) | connection_limit=1 per service | Accepted |

---

## Infrastructure (deploy/)

| Path | Description |
|------|-------------|
| `deploy/k8s/base/` | Kubernetes base manifests — namespace, deployments, services, ingress, HPA (42 services), PDB (42 services), monitoring, ServiceMonitors (43 CRDs) |
| `deploy/k8s/overlays/` | Environment-specific overlays (dev, staging, prod) |
| `deploy/monitoring/grafana/dashboards/` | Grafana dashboards — `ims-overview.json`, `api-performance.json`, `security-events.json`, `slo-overview.json` |
| `deploy/monitoring/grafana/provisioning/` | Auto-provisioning — datasources (Prometheus, Alertmanager), dashboards, alerting (rules, contact-points, notification-policy) |
| `deploy/monitoring/prometheus/` | Prometheus config + alert rules (19 rules with runbook_url + multi-window SLO burn rate) |
| `deploy/monitoring/prometheus/rules/` | Recording rules — pre-computed request rates, latency P50/P95/P99, SLO availability (5m/30m/1h/6h/1d), security metrics |
| `deploy/monitoring/alertmanager/` | Alertmanager routing + contact points (critical/warning/security receivers with Slack + email) |
| `deploy/monitoring/otel/` | OpenTelemetry Collector config (Jaeger + Tempo + Prometheus) |

## GitHub Repository (.github/)

| Path | Description |
|------|-------------|
| `.github/SECURITY.md` | Vulnerability disclosure policy, severity classification (CVSS), scope, supported versions |
| `.github/CODEOWNERS` | Maps all 44 apps + packages to 12 team groups (hse, security, quality, finance, hr, devops, ai, etc.) |
| `.github/PULL_REQUEST_TEMPLATE.md` | PR checklist with testing requirements (≥110 tests/file) and project-specific code checks |
| `.github/ISSUE_TEMPLATE/bug_report.yml` | Structured bug report with affected-module dropdown (all 40+ services) |
| `.github/ISSUE_TEMPLATE/feature_request.yml` | Feature request with problem, solution, acceptance criteria fields |
| `.github/workflows/ci.yml` | PR/push: lint, typecheck, unit tests (with Redis + Postgres services), build, E2E, accessibility |
| `.github/workflows/cd.yml` | Main push: Docker build/push for 43+ services, staging smoke test, post-deploy validation |
| `.github/workflows/security.yml` | Weekly + PR: dependency audit, CodeQL, TruffleHog secrets, Trivy container scan, Semgrep SAST, ZAP DAST |
| `.github/workflows/tests.yml` | Daily 6am: unit tests + lint + typecheck |
| `.github/workflows/dependency-review.yml` | PR: blocks merges with HIGH/CRITICAL CVEs; enforces allowed license list |
| `.github/workflows/stale.yml` | Daily: marks issues stale at 45d, PRs at 30d; exempt for pinned/in-progress/blocked |
| `.github/workflows/release.yml` | Tag push (v*.*.*): validates, builds multi-arch Docker images, creates GitHub release, deploys staging |

---

## Quick Navigation

### By Audience

**Developers:**
- Architecture → [SOP §2](./NEXARA_IMS_PLATFORM_SOP_COMPLETE.md#2-system-architecture)
- Development guidelines → [SOP §13](./NEXARA_IMS_PLATFORM_SOP_COMPLETE.md#13-development-guidelines)
- Testing → [SOP §14](./NEXARA_IMS_PLATFORM_SOP_COMPLETE.md#14-testing-procedures)
- Database → [DATABASE_SCHEMA_REFERENCE.md](./DATABASE_SCHEMA_REFERENCE.md)
- API endpoints → [NEXARA_FEATURE_CATALOG.md](./NEXARA_FEATURE_CATALOG.md)

**Operations / DevOps:**
- Deployment → [SOP §9](./NEXARA_IMS_PLATFORM_SOP_COMPLETE.md#9-deployment-procedures)
- Monitoring → [SOP §10](./NEXARA_IMS_PLATFORM_SOP_COMPLETE.md#10-monitoring--operations)
- Troubleshooting → [SOP §12](./NEXARA_IMS_PLATFORM_SOP_COMPLETE.md#12-troubleshooting-guide)
- Scripts → [SOP Appendix A](./NEXARA_IMS_PLATFORM_SOP_COMPLETE.md#appendix-a-scripts-reference)

**Security:**
- Security procedures → [SOP §11](./NEXARA_IMS_PLATFORM_SOP_COMPLETE.md#11-security-procedures)
- Full security detail → [SECURITY.md](./SECURITY.md)

**Business / Compliance:**
- Module SOPs → [SOP §7](./NEXARA_IMS_PLATFORM_SOP_COMPLETE.md#7-module-specific-sops)
- Feature capabilities → [NEXARA_FEATURE_CATALOG.md](./NEXARA_FEATURE_CATALOG.md)
- Standards coverage → [SOP §1.4](./NEXARA_IMS_PLATFORM_SOP_COMPLETE.md#14-standards--compliance-coverage)

---

## Platform Statistics Summary

| Metric | Value |
|--------|-------|
| API Microservices | 43 + api-search (4050) |
| Web Applications | 44 |
| Shared NPM Packages | 392 |
| Prisma Schemas | 44 |
| Database Models | ~590 |
| Database Enums | 781 |
| REST API Endpoints | 2,558 |
| Unit Tests | ~1,202,000 / ~1,084 suites / 438 projects |
| Code Score | 100/100 |
| ISO Standards Supported | 16+ |
| GitHub Workflows | 7 |
| Grafana Dashboards | 4 |
| Prometheus Alert Rules | 19 |
| Prometheus Recording Rules | 23 |
| K8s HPA Resources | 42 |
| K8s PDB Resources | 42 |
| UAT Test Plans | 40 (1,000 BDD test cases) |
| ADRs | 6 |

*Updated: February 28, 2026*
