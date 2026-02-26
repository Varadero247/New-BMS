# @ims/web-dashboard

**Type**: Web App (Next.js 15)  
**Port**: 3000  
**Standard/Domain**: Main Dashboard  
**Part of**: [Nexara IMS](../../README.md)

## Purpose

Main dashboard providing an aggregated view of compliance scores, audit trails, executive summaries, and system status across all IMS modules.

## Running standalone

```bash
pnpm --filter @ims/web-dashboard dev
```

## Key Pages

- `/audit-trail`
- `/compliance-calendar`
- `/compliance-scores`
- `/executive-summary`
- `/login`
- `/system-status`
- `/templates`

## Dependencies

- @ims/charts
- @ims/i18n
- @ims/types
- @ims/ui
