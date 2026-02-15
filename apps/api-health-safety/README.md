# @ims/api-health-safety

**Type**: API Service (Express.js)  
**Port**: 4001  
**Standard/Domain**: ISO 45001  
**Part of**: [Nexara IMS](../../README.md)

## Purpose

Health and safety management service implementing ISO 45001 requirements including risk assessments, incident reporting, CAPA, legal compliance tracking, and training management.

## Running standalone

```bash
pnpm --filter @ims/api-health-safety dev
```

## API Endpoints

- `/api/actions`
- `/api/capa`
- `/api/communications`
- `/api/incidents`
- `/api/legal`
- `/api/management-reviews`
- `/api/metrics`
- `/api/objectives`
- `/api/risks`
- `/api/training`

## Dependencies

- @ims/auth
- @ims/calculations
- @ims/database
- @ims/monitoring
- @ims/rbac
- @ims/types
