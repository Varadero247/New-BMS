# @ims/api-field-service

**Type**: API Service (Express.js)  
**Port**: 4022  
**Standard/Domain**: Field Service  
**Part of**: [Nexara IMS](../../README.md)

## Purpose

Field service management with job dispatching, technician scheduling, route optimisation, contracts, invoicing, and time tracking.

## Running standalone

```bash
pnpm --filter @ims/api-field-service dev
```

## API Endpoints

- `/api/checklists`
- `/api/contracts`
- `/api/customers`
- `/api/invoices`
- `/api/job-notes`
- `/api/jobs`
- `/api/kpis`
- `/api/parts-used`
- `/api/routes`
- `/api/schedules`
- `/api/sites`
- `/api/technicians`
- `/api/time-entries`

## Dependencies

- @ims/auth
- @ims/database
- @ims/monitoring
- @ims/rbac
- @ims/types
