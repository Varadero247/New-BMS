# NEXARA IMS PLATFORM — DOCUMENTATION INDEX

**Updated:** February 23, 2026
**Total documentation:** ~215 KB primary references + 50+ supporting docs + 16 UAT test plans

---

## Primary Reference Documents (Generated Feb 21, 2026)

| Document | Lines | Size | Description |
|----------|-------|------|-------------|
| [NEXARA_IMS_PLATFORM_SOP_COMPLETE.md](./NEXARA_IMS_PLATFORM_SOP_COMPLETE.md) | 2,578 | 93 KB | Complete Standard Operating Procedures — architecture, all 42 services, SOPs for every module, deployment, monitoring, security, troubleshooting, development guidelines, testing |
| [NEXARA_FEATURE_CATALOG.md](./NEXARA_FEATURE_CATALOG.md) | 1,300 | 56 KB | Full business capabilities matrix — every feature with exact HTTP endpoints for all 42 services (2,558 endpoints total) |
| [DATABASE_SCHEMA_REFERENCE.md](./DATABASE_SCHEMA_REFERENCE.md) | 1,953 | 65 KB | Complete database reference — all 44 schemas, 606 models with field definitions, 781 enums, migration commands |

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
| [LOGGING_GUIDE.md](./LOGGING_GUIDE.md) | Structured logging patterns, correlation IDs, jq examples |
| [MUTATION_TESTING.md](./MUTATION_TESTING.md) | Stryker mutation testing — how to run, interpret scores, add packages |
| [TRACING.md](./TRACING.md) | OpenTelemetry distributed tracing — setup, custom spans, production |
| [STRATEGIC_RECOMMENDATIONS_REPORT.md](./STRATEGIC_RECOMMENDATIONS_REPORT.md) | Implemented and deferred strategic recommendations |
| [NON_CODEABLE_ITEMS.md](./NON_CODEABLE_ITEMS.md) | Items requiring human/ops intervention before production launch |
| [MODULE_STATUS.md](./MODULE_STATUS.md) | Full module status matrix — all 42 services with endpoints and standards |

---

## UAT Test Plans (docs/uat/)

16 User Acceptance Test plans covering all major modules (25 BDD test cases each, 400 total):

| Document | Module | Standard | Port |
|----------|--------|----------|------|
| [UAT_HEALTH_SAFETY.md](./uat/UAT_HEALTH_SAFETY.md) | Health & Safety | ISO 45001:2018 | 4001 |
| [UAT_ENVIRONMENT.md](./uat/UAT_ENVIRONMENT.md) | Environment | ISO 14001:2015 | 4002 |
| [UAT_QUALITY.md](./uat/UAT_QUALITY.md) | Quality Management | ISO 9001:2015 | 4003 |
| [UAT_FINANCE.md](./uat/UAT_FINANCE.md) | Finance | — | 4013 |
| [UAT_INFOSEC.md](./uat/UAT_INFOSEC.md) | Information Security | ISO 27001:2022 | 4015 |
| [UAT_ESG.md](./uat/UAT_ESG.md) | ESG Reporting | GRI/SASB/TCFD | 4016 |
| [UAT_RISK.md](./uat/UAT_RISK.md) | Enterprise Risk | — | 4027 |
| [UAT_HR.md](./uat/UAT_HR.md) | Human Resources | — | 4006 |
| [UAT_FOOD_SAFETY.md](./uat/UAT_FOOD_SAFETY.md) | Food Safety | ISO 22000/HACCP | 4019 |
| [UAT_ENERGY.md](./uat/UAT_ENERGY.md) | Energy Management | ISO 50001:2018 | 4020 |
| [UAT_FIELD_SERVICE.md](./uat/UAT_FIELD_SERVICE.md) | Field Service | — | 4022 |
| [UAT_INCIDENTS.md](./uat/UAT_INCIDENTS.md) | Incident Management | — | 4036 |
| [UAT_AUDITS.md](./uat/UAT_AUDITS.md) | Audit Management | — | 4037 |
| [UAT_AUTOMOTIVE.md](./uat/UAT_AUTOMOTIVE.md) | Automotive | IATF 16949 | 4010 |
| [UAT_MEDICAL.md](./uat/UAT_MEDICAL.md) | Medical Devices | ISO 13485 | 4011 |
| [UAT_AEROSPACE.md](./uat/UAT_AEROSPACE.md) | Aerospace | AS9100D | 4012 |

---

## Root-Level Reference Files

| File | Description |
|------|-------------|
| [SYSTEM_STATE.md](../SYSTEM_STATE.md) | Single source of truth for all services, packages, schemas |
| [QUICK_REFERENCE.md](../QUICK_REFERENCE.md) | Quick reference card — ports, commands, patterns |
| [CLAUDE.md](../CLAUDE.md) | Development guidelines and known issue fixes |
| [renovate.json](../renovate.json) | Renovate bot config — auto-merge patches, grouped deps |
| [stryker.*.config.mjs](../stryker.auth.config.mjs) | Stryker mutation testing configs (auth/security/rbac/finance/validation) |

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
| API Microservices | 42 |
| Web Applications | 44 |
| Shared NPM Packages | 63 |
| Prisma Schemas | 44 |
| Database Models | 606 |
| Database Enums | 781 |
| REST API Endpoints | 2,558 |
| Unit Tests | 17,410 / 655 suites |
| Code Score | 100/100 |
| ISO Standards Supported | 16+ |

*Updated: February 21, 2026*
