# Architecture Decision Records

This directory contains Architecture Decision Records (ADRs) — lightweight documents that capture important architectural decisions, their context, and their consequences.

## Format

Each ADR follows this structure:
- **Status**: Proposed / Accepted / Deprecated / Superseded
- **Context**: The situation that prompted the decision
- **Decision**: What was decided
- **Consequences**: The resulting trade-offs

## Index

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| [ADR-001](ADR-001-monorepo-structure.md) | Monorepo with pnpm workspaces | Accepted | 2026-02-01 |
| [ADR-002](ADR-002-api-gateway-pattern.md) | Centralised API gateway with http-proxy-middleware | Accepted | 2026-02-01 |
| [ADR-003](ADR-003-multi-schema-database.md) | One Prisma schema per domain (44 schemas) | Accepted | 2026-02-05 |
| [ADR-004](ADR-004-jwt-bearer-auth.md) | JWT Bearer token auth stored in localStorage | Accepted | 2026-02-05 |
| [ADR-005](ADR-005-next-app-per-module.md) | Separate Next.js app per functional module | Accepted | 2026-02-08 |
| [ADR-006](ADR-006-no-shared-db-connection.md) | One DB connection pool per service (connection_limit=1) | Accepted | 2026-02-19 |

## Creating a New ADR

Copy the template below and save as `ADR-NNN-short-title.md`:

```markdown
# ADR-NNN: Title

**Date**: YYYY-MM-DD
**Status**: Proposed

## Context
...

## Decision
...

## Consequences
...
```
