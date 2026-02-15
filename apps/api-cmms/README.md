# @ims/api-cmms

**Type**: API Service (Express.js)  
**Port**: 4017  
**Standard/Domain**: CMMS  
**Part of**: [Nexara IMS](../../README.md)

## Purpose

Computerised maintenance management service with assets, work orders, preventive maintenance, parts inventory, inspections, and downtime tracking.

## Running standalone

```bash
pnpm --filter @ims/api-cmms dev
```

## API Endpoints

- `/api/assets`
- `/api/checklists`
- `/api/downtime`
- `/api/inspections`
- `/api/kpis`
- `/api/locations`
- `/api/meters`
- `/api/parts`
- `/api/preventive-plans`
- `/api/requests`
- `/api/scheduler`
- `/api/vendors`
- `/api/work-orders`

## Dependencies

- @ims/auth
- @ims/database
- @ims/monitoring
- @ims/rbac
- @ims/types
