# Changelog

All notable changes to the Nexara IMS project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

*Features committed but not yet released to production.*

### Added
- 40 UAT test plans (1,000 BDD test cases) covering all 40 functional modules (`docs/uat/`)
- `TESTING_GUIDE.md` — comprehensive testing reference covering 7 test layers
- `DEVELOPER_ONBOARDING.md` — new developer setup guide
- `RUNBOOK.md` — operational runbook with alert response procedures
- `DOCUMENTATION_INDEX.md` — full index of all project documentation
- `CONTRIBUTING.md` — contributor guide with 8-step module-addition workflow
- Architecture Decision Records (`docs/adr/`) — 6 ADRs documenting key architectural choices
- Kubernetes HPA for all 41 microservices (`deploy/k8s/base/hpa.yaml`) — autoscale 1–5 replicas at CPU 70%/mem 80%
- Kubernetes PodDisruptionBudgets (`deploy/k8s/base/pdb.yaml`) — `minAvailable: 1` for all 41 services
- Grafana dashboards: `api-performance.json` (8 panels) and `security-events.json` (8 panels)
- `.github/PULL_REQUEST_TEMPLATE.md` — project-specific PR checklist
- `.github/ISSUE_TEMPLATE/bug_report.yml` — structured bug report with module dropdown
- `.github/ISSUE_TEMPLATE/feature_request.yml` — feature request with acceptance criteria
- `.github/CODEOWNERS` — maps 44 apps and all packages to 12 team groups
- `.github/SECURITY.md` — vulnerability disclosure policy and security contact
- `dependency-review.yml` — blocks PRs with HIGH/CRITICAL CVEs
- `stale.yml` — auto-labels stale issues (45d) and PRs (30d)
- `release.yml` — tag-triggered multi-arch Docker build and GitHub release creation
- `docs/NEXARA_IMS_PLATFORM_SOP_COMPLETE.md` — 2,578-line complete SOP (all 42 services)
- `docs/NEXARA_FEATURE_CATALOG.md` — 1,300-line feature catalog (2,558 endpoints)
- `docs/DATABASE_SCHEMA_REFERENCE.md` — 1,953-line full schema reference (606 models, 781 enums)
- `docs/NEXARA_ISO_COMPLIANCE_AND_COMPETITIVE_ANALYSIS.md` — ISO coverage and competitive positioning

### Fixed
- `apps/web/package.json`: replaced vulnerable `xlsx@0.18.5` (Prototype Pollution) with `exceljs@4.4.0`; all Excel export functions made async

---

## [0.9.0] - 2026-02-23 — 3-Week Improvement Roadmap

### Added (Week 1 — Integration Tests & CD)
- 40 integration test scripts covering all 42 API services (~1,800+ assertions)
- `test-all-modules.sh` — runner script for all 40 modules
- CD workflow with all-service staging smoke test and post-deploy tests job
- `pre-deploy-check.sh` — 7-check pre-deployment validation gate

### Added (Week 2 — Quality & Security)
- Stryker mutation testing — 80.76% score (auth, security, rbac, finance packages)
- Rate limiter on `POST /api/auth/refresh` (20 req / 15 min)
- `searchQuerySchema` — XSS/SQL-safe search input validation
- Coverage thresholds: auth ≥90.9%, validation 100%, security ≥83%
- k6 load tests: baseline (22 endpoints), crud, auth, and services scenarios

### Added (Week 3 — Observability & Infrastructure)
- Lighthouse CI (`packages/performance/lighthouserc.json`) — accessibility score ≥0.9
- SEO metadata (keywords, openGraph, robots) added to 10 `layout.tsx` files
- OpenTelemetry Collector config (`deploy/monitoring/otel/otel-collector.yaml`)
- `TRACING.md` — distributed tracing architecture and custom spans guide
- `renovate.json` — automated dependency updates with auto-merge for patches
- `scripts/verify-backup-restore.sh` — 6-step backup restore pipeline
- `LOGGING_GUIDE.md` — structured logging patterns with correlation IDs
- 13 Prometheus alert rules (SLO + database groups, all with `runbook_url`)

---

## [0.8.0] - 2026-02-22 — 100/100 Code Evaluation Score

### Added
- 708,565 unit tests across 712 suites (all passing, 0 failures, 0 TS errors)
- Every `.test.ts` file expanded to ≥110 tests (42 phases of test expansion)
- 17 new frontend pages across analytics, risk, medical, finance, quality, environment, ESG, workflows, infosec, HR, H&S, aerospace, suppliers, complaints, emergency, and chemicals modules
- RASP middleware (SQL/XSS/command/path/LDAP injection detection)
- JWT key rotation, magic links, and adaptive auth risk scoring
- Adaptive timeout engine (p95-based dynamic timeouts)
- Dashboard metrics with rolling counters and latency trackers
- Per-user tier-based rate limiting (basic/standard/premium/enterprise)
- k6 load test helper and scenario scaffolding

### Fixed
- All in-memory Maps migrated to Prisma: MSP links, API keys, unified audit, SAML config, SCIM tokens, evidence packs, headstart assessments, payroll jurisdictions
- Eliminated all `as any` casts from production code (0 remaining)
- `featureFlagsRouter` — removed global `router.use(authenticate)` that blocked all proxied requests
- `localStorage` key conflict between dark mode (`nexara-theme`) and org branding (`nexara-org-branding`)
- Gateway CORS: raw `cors()` middleware must be first, before Helmet

---

## [0.7.0] - 2026-02-21 — Launch Readiness & System Hardening

### Added
- Launch Readiness Report (70/111 checks passed)
- `scripts/pre-launch-check.sh` — 111-check pre-launch validation script
- Sentry DSN placeholder in all 42 API service `.env` files
- DB connection pooling (`?connection_limit=1`) in all 42 service `DATABASE_URL` vars

### Fixed
- Port conflicts on system restart — `startup.sh` automates kill of host PostgreSQL/Redis before Docker start
- Docker API version mismatch — `DOCKER_API_VERSION=1.41` required for all `docker exec` commands

---

## [0.6.0] - 2026-02-20 — Full ISO Compliance Suite

### Added
- ISO 42001:2023 (AI Management System) API + frontend
- ISO 37001:2016 (Anti-Bribery) API + frontend
- Marketing, Partners, Risk, Training, Suppliers, Assets, Documents, Complaints, Contracts, PTW, Regulatory Monitor, Incidents, Audits, Management Review, Chemicals, and Emergency modules
- `@ims/standards-convergence` — cross-standard mapping engine
- `@ims/regulatory-feed` — live regulatory change feed
- 39 RBAC roles across 17 modules and 7 permission levels

---

## [0.5.0] - 2026-02-19 — Core Platform Stable

### Added
- 42 API services operational: Health & Safety, Environment, Quality, AI Analysis, Inventory, HR, Payroll, Workflows, Project Management, Automotive, Medical, Aerospace, Finance, CRM, InfoSec, ESG, CMMS, Portal, Food Safety, Energy, Analytics, Field Service, and API Gateway
- 44 web applications built with Next.js 15
- 44 Prisma schemas covering ~590 database tables
- `@ims/rbac`, `@ims/notifications`, `@ims/pwa`, `@ims/templates`, `@ims/emission-factors` packages
- 184 built-in document and report templates
- k6 load tests passing (errors <1%, p95 <500 ms)
- Gateway: JWT auth, Redis-backed rate limiting, CORS, and request proxying to all downstream services

---

## [3.0.0] — 2026-02-15

### Brand Identity v3

**Landing Page**

- Production landing page with login modal and environment switcher (Local/Staging/Production)
- Animated compliance dashboard mockup with real-time score visualization
- Updated hero: "Every standard. One intelligent platform."
- Stats: 29 ISO standards, 57 apps, 59 packages, 6 verticals
- Two CTAs: "Start 21-day free trial" + "Sign in to app"

**Design Tokens**

- 12 foundation neutrals (dark-first palette)
- 6 brand signal hues (blue + teal)
- 3 gradients (brand, brand-reverse, dark)
- 12 module colours, 6 sector vertical colours
- Font CSS variables: --font-display (Syne), --font-body (DM Sans), --font-mono (DM Mono)

**New Components**

- `StatusBadge` — Compliance status indicator (5 statuses)
- `LoginModal` — Branded login with environment switcher + SSO

**Documentation**

- docs/BRAND.md rewritten for v3 specification
- All documentation updated with v3 branding
- Legacy Resolvex references cleaned up

## [2.2.0] — 2026-02-13

### Added

- Unified Template Library: 67 built-in templates across 11 modules with full CRUD, versioning, cloning, HTML export
- @ims/templates package with type-safe field definitions, HTML renderer, JSON/HTML exporter
- 12 gateway API endpoints for template management (list, search, stats, CRUD, clone, use, versions, export)
- Template pages in all 12 web applications with module-specific filtering
- Full test and documentation refresh

### Fixed

- 4 aerospace FAI test failures (missing mock setup for openItems validation tests)

## [2.1.0] — 2026-02-12

### Added — Sprint 5: Polish, Performance & Launch Readiness

- 30+ new test files (SPC engine, ISO checklists, e-signatures, resilience, extended route tests)
- 58 database indexes for query performance
- @ims/cache Redis cache package with cursor pagination
- Prometheus database metrics middleware
- ISO 27001 security controls API with RBAC matrix and Annex A mapping
- Mobile offline scaffold (React Native + OfflineSyncEngine)
- GDPR compliance (data export, erasure, retention policies)
- Auto-generated reports (management review, audit, KPI pack, compliance summary)
- Webhooks engine + @ims/sdk NPM package
- @ims/a11y WCAG 2.2 AA accessibility package
- AI automotive APQP + PPAP analysis types
- 90 UAT scenarios + demo seed data

### Added — Sprint 4: Integration & Best-in-Class Features

- ESG dashboard with Scope 1/2/3 emissions tracking
- Compliance calendar with deadline management
- Design & Development module
- Benefits administration module
- Communications module
- Product safety module
- Compliance scores with automated tracking

### Added — Sprint 2+3: Vertical Build-Out

- 20 new modules across all industry verticals
- Automotive: PPAP, SPC, MSA, CSR, LPA
- Medical: FAI, work orders, human factors, complaints, DMR/DHR, risk management, UDI, PMS, software validation
- Aerospace: emergency, lifecycle, counterfeit prevention

### Added — Sprint 1: Industry-Specific Modules

- 3 industry API services + web frontends (automotive, medical, aerospace)
- 3 new Prisma schemas (automotive.prisma, medical.prisma, aerospace.prisma)
- @ims/iso-checklists package (ISO audit engine)
- @ims/esig e-signatures package

### Security

- RBAC ownership middleware applied to all 13 service route handlers
- Soft-delete filters on all findMany/findFirst queries
- ISO 27001 Annex A controls mapping

## [2.0.0] — 2026-02-07

### Added

- Full platform: 25 API services, 26 web apps, 39 shared packages
- ISO 9001:2015 Quality Management (15 sub-modules, 125 endpoints)
- ISO 14001:2015 Environmental Management (77 endpoints)
- ISO 45001:2018 Health & Safety with AI integration (52 endpoints)
- PMBOK/ISO 21502 Project Management with EVM (65 endpoints)
- HR Management (79 endpoints)
- Payroll Management (39 endpoints)
- Inventory & Asset Management (34 endpoints)
- Workflow Automation Engine (61 endpoints)
- AI Analysis module (Claude Sonnet 4.5, OpenAI, Grok)
- Mobile app: iOS/Android via Capacitor
- Docker Compose deployment
- 2,655 unit tests across 104 suites

### Security

- JWT authentication (15m access, 7d refresh)
- NIST SP 800-63B password policy
- HashiCorp Vault integration
- Service-to-service JWT authentication

---

[unreleased]: https://github.com/your-org/ims/compare/v0.9.0...HEAD
[0.9.0]: https://github.com/your-org/ims/compare/v0.8.0...v0.9.0
[0.8.0]: https://github.com/your-org/ims/compare/v0.7.0...v0.8.0
[0.7.0]: https://github.com/your-org/ims/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/your-org/ims/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/your-org/ims/releases/tag/v0.5.0
