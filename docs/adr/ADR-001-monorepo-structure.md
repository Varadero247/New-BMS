# ADR-001: Monorepo with pnpm Workspaces and Turborepo

---
> **CONFIDENTIAL — TRADE SECRET**
> This document is the property of Nexara DMCC and contains confidential and
> proprietary information. Unauthorised disclosure is prohibited.
> © 2026 Nexara DMCC. All rights reserved.
---


**Date**: 2026-02-01
**Status**: Accepted

## Context

The IMS platform consists of 43 API services + api-search (4050), 44 web applications, and 391 shared packages. The team needed to decide between:

1. **Polyrepo** — each service/app in its own Git repository
2. **Monorepo** — all services, apps, and packages in one repository

## Decision

Use a **monorepo** managed with **pnpm workspaces** and **Turborepo** for task orchestration.

- `pnpm-workspace.yaml` declares workspace globs: `apps/*`, `packages/*`
- `turbo.json` defines the build/test/lint pipeline with dependency caching
- Shared packages (e.g., `@ims/auth`, `@ims/ui`, `@ims/database`) are referenced via `workspace:*` protocol

## Consequences

**Positive:**
- Single `pnpm install` installs all dependencies across 147 packages
- Shared code changes (e.g., `@ims/auth`) are immediately reflected across all consumers — no publishing step
- Turborepo caches build/test outputs; unchanged packages are skipped on re-runs
- Atomic commits spanning multiple services (e.g., a schema change + API update + frontend update) are easy
- Single CI pipeline covers the entire platform

**Negative:**
- `pnpm install` on the full monorepo requires significant memory (~8 GB) and may hit file descriptor limits (fix: `ulimit -n 65536`)
- All developers must check out the entire codebase (~590 tables, 1,196,395 tests)
- A faulty shared package can break many services simultaneously — requires disciplined versioning of internal packages

**Mitigations:**
- `.npmrc` sets `node-linker=hoisted` to reduce symlink depth
- `turbo.json` uses `pipeline.dependsOn` to ensure packages build before their consumers
- `pnpm --filter <package>` allows working on a single service without running the full suite
