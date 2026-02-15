# @ims/api-analytics

**Type**: API Service (Express.js)  
**Port**: 4021  
**Standard/Domain**: Analytics & Reporting  
**Part of**: [Nexara IMS](../../README.md)

## Purpose

Analytics and reporting service with dashboards, KPIs, board packs, predictions, anomaly detection, benchmarks, and executive summaries.

## Running standalone

```bash
pnpm --filter @ims/api-analytics dev
```

## API Endpoints

- `/api/alerts`
- `/api/anomalies`
- `/api/benchmarks`
- `/api/board-packs`
- `/api/cashflow`
- `/api/certifications`
- `/api/competitors`
- `/api/contracts`
- `/api/dashboards`
- `/api/datasets`
- `/api/dsars`
- `/api/executive`
- `/api/expenses`
- `/api/exports`
- `/api/feature-requests`
- `/api/gdpr`
- `/api/kpis`
- `/api/meetings`
- `/api/monthly-review`
- `/api/predictions`
- `/api/queries`
- `/api/release-notes`
- `/api/reports`
- `/api/schedules`
- `/api/unified-risks`
- `/api/uptime`
- `/api/webhooks`

## Dependencies

- @ims/auth
- @ims/database
- @ims/email
- @ims/hubspot-client
- @ims/monitoring
- @ims/rbac
- @ims/stripe-client
- @ims/types
