## Summary

<!-- Describe what this PR changes and why. 1-3 sentences. -->

## Type of Change

- [ ] Bug fix
- [ ] New feature / enhancement
- [ ] New API service or web app
- [ ] Refactor (no functional change)
- [ ] Documentation
- [ ] Infrastructure / CI/CD
- [ ] Security fix
- [ ] Dependency update

## Testing

- [ ] `pnpm test` passes (~1,220,715+ unit tests, 0 failures)
- [ ] `pnpm typecheck` passes (0 TypeScript errors)
- [ ] New/changed code has ≥1,000 tests per `.test.ts` file
- [ ] Integration test added/updated in `scripts/test-<module>-modules.sh`
- [ ] No `as any` introduced in production code

## Checklist

- [ ] Prisma schema changes use `migrate diff | psql` (not `prisma db push`)
- [ ] New API routes follow `{ success, data }` response shape
- [ ] New Modal usage uses `isOpen` prop (not `open`)
- [ ] No `CORS_ORIGIN` added to `.env` files
- [ ] `binaryTargets` includes `linux-musl-openssl-3.0.x` (if new Prisma schema)
- [ ] CHANGELOG.md `[Unreleased]` section updated (for features/fixes)

## Related Issues

<!-- Closes #NNN -->
