# @ims/api-energy

**Type**: API Service (Express.js)  
**Port**: 4020  
**Standard/Domain**: ISO 50001  
**Part of**: [Nexara IMS](../../README.md)

## Purpose

Energy management service implementing ISO 50001 with meters, baselines, EnPIs, SEUs, energy bills, readings, and improvement projects.

## Running standalone

```bash
pnpm --filter @ims/api-energy dev
```

## API Endpoints

- `/api/alerts`
- `/api/audits`
- `/api/baselines`
- `/api/bills`
- `/api/compliance`
- `/api/enpis`
- `/api/meters`
- `/api/projects`
- `/api/readings`
- `/api/reports`
- `/api/seus`
- `/api/targets`

## Dependencies

- @ims/auth
- @ims/database
- @ims/monitoring
- @ims/rbac
- @ims/types
