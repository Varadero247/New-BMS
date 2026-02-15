# @ims/api-iso42001

**Type**: API Service (Express.js)  
**Port**: 4023  
**Standard/Domain**: ISO 42001  
**Part of**: [Nexara IMS](../../README.md)

## Purpose

AI management system service implementing ISO 42001 with AI system registry, impact assessments, controls, monitoring, and incident tracking.

## Running standalone

```bash
pnpm --filter @ims/api-iso42001 dev
```

## API Endpoints

- `/api/ai-systems`
- `/api/audit-log`
- `/api/controls`
- `/api/human-review`
- `/api/impact-assessments`
- `/api/incidents`
- `/api/monitoring`
- `/api/policies`
- `/api/risk-assessments`
- `/api/self-declaration`

## Dependencies

- @ims/auth
- @ims/database
- @ims/monitoring
- @ims/rbac
- @ims/types
