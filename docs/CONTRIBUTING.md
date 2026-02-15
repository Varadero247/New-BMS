# Contributing — Nexara IMS

## Branch Naming

| Prefix | Purpose |
|--------|---------|
| `feature/*` | New features |
| `fix/*` | Bug fixes |
| `docs/*` | Documentation changes |
| `chore/*` | Maintenance, dependencies |
| `test/*` | Test additions or fixes |
| `refactor/*` | Code refactoring |

## Commit Format

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(scope): description
fix(scope): description
docs(scope): description
chore(scope): description
test(scope): description
refactor(scope): description
```

Common scopes: `gateway`, `health-safety`, `environment`, `quality`, `finance`, `crm`, `infosec`, `esg`, `cmms`, `portal`, `food-safety`, `energy`, `analytics`, `field-service`, `iso42001`, `iso37001`, `marketing`, `partners`, `database`, `auth`, `rbac`, `ui`, `monitoring`.

## PR Checklist

- [ ] TypeScript compiles without errors (`pnpm turbo build`)
- [ ] No new ESLint warnings/errors
- [ ] Tests pass for affected services (`pnpm --filter @ims/[service] test`)
- [ ] New endpoints have corresponding test coverage
- [ ] RBAC permissions checked (`attachPermissions` middleware applied)
- [ ] Documentation updated if API changed
- [ ] No hardcoded secrets or passwords in committed files

## Code Style

- TypeScript strict mode
- Explicit return types on exported functions
- Zod for all runtime validation (request bodies, query params)
- Response envelope: `{ success: boolean, data: T | null, error: Error | null }`
- Use `@ims/monitoring` logger — never raw `console.log` in services
- `@ims/ui` Modal uses `isOpen` prop (not `open`)
- Frontend accesses API data via `response.data.data` (axios `.data` + API `.data`)

## Adding a New ISO Standard Module

1. Create `apps/api-[standard]/` — Express.js service from template
2. Create `apps/web-[standard]/` — Next.js 14 App Router from template
3. Add Prisma models to `packages/database/prisma/schemas/[standard].prisma`
4. Register port in gateway `SERVICES` config and proxy routes
5. Add CORS origin for the new web app port in gateway
6. Add to `scripts/start-all-services.sh` and `scripts/check-services.sh`
7. Write unit tests (mock prisma, auth, monitoring — see [TESTING.md](TESTING.md))
8. Update documentation (this repo's docs + service README)

## Review Process

- All PRs require at least one approval
- CI must pass (build + test)
- Squash merge to `main`
