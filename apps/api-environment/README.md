# @ims/api-environment

**Type**: API Service (Express.js)  
**Port**: 4002  
**Standard/Domain**: ISO 14001  
**Part of**: [Nexara IMS](../../README.md)

## Purpose

Environmental management service implementing ISO 14001 for environmental aspects, events, CAPA, legal compliance, lifecycle analysis, and objectives tracking.

## Running standalone

```bash
pnpm --filter @ims/api-environment dev
```

## API Endpoints

- `/api/actions`
- `/api/aspects`
- `/api/audits`
- `/api/capa`
- `/api/communications`
- `/api/emergency`
- `/api/esg`
- `/api/events`
- `/api/legal`
- `/api/lifecycle`
- `/api/management-reviews`
- `/api/objectives`
- `/api/training`

## Dependencies

- @ims/auth
- @ims/calculations
- @ims/database
- @ims/monitoring
- @ims/rbac
- @ims/types
