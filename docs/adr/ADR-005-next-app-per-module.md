# ADR-005: Separate Next.js App Per Functional Module

---
> **CONFIDENTIAL — TRADE SECRET**
> This document is the property of Nexara DMCC and contains confidential and
> proprietary information. Unauthorised disclosure is prohibited.
> © 2026 Nexara DMCC. All rights reserved.
---


**Date**: 2026-02-08
**Status**: Accepted

## Context

The IMS platform covers 40+ distinct functional domains (health & safety, environment, quality, finance, HR, etc.). Frontend architecture options:

1. **Single Next.js app** — one monolithic frontend, all modules as routes
2. **Module federation (Webpack)** — micro-frontends sharing runtime
3. **Separate Next.js app per module** — independent deployments, independent ports
4. **Iframe embedding** — isolated modules within a shell app

## Decision

Use **one Next.js 15 (App Router) application per functional module**, deployed on separate ports.

- 44 web apps: `web-dashboard` (3000), `web-health-safety` (3001), `web-environment` (3002), … `web-emergency` (3045)
- Each app is fully independent — separate `package.json`, `next.config.js`, `tailwind.config.js`
- Shared components via `@ims/ui` package (shadcn/ui-based component library)
- Shared utilities via `@ims/shared`, `@ims/auth-client`, etc.
- Navigation between modules is done via standard `<a href>` links (no client-side cross-app routing)

## Consequences

**Positive:**
- Complete module isolation — a bug in the finance app cannot crash the H&S app
- Independent deployments — a new version of `web-quality` can be deployed without touching other apps
- Teams can own their module end-to-end without merge conflicts in shared app files
- Build times: Turborepo rebuilds only changed apps; a change to `web-finance` doesn't rebuild all 43 others
- Each app can choose its own data-fetching strategy without affecting others

**Negative:**
- 44 Next.js processes in development consume significant RAM (~200 MB each = ~8 GB total). **Mitigation**: run only relevant apps during development with `pnpm dev --filter=web-health-safety`
- No client-side navigation between modules (full page reload on module switch). **Accepted trade-off** for isolation
- Shared UI changes (e.g., a Modal prop rename) require updating all 44 apps. **Mitigation**: CLAUDE.md documents critical prop names (e.g., `isOpen` not `open`)
- Port management: each app hardcodes its port in `package.json` dev script (`next dev --port 3001`). Port collisions must be managed manually.
