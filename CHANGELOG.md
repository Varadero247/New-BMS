# Changelog

All notable changes to the Nexara IMS project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
- Webhooks engine + @nexara/sdk NPM package
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
