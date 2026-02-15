# @ims/api-iso37001

**Type**: API Service (Express.js)  
**Port**: 4024  
**Standard/Domain**: ISO 37001  
**Part of**: [Nexara IMS](../../README.md)

## Purpose

Anti-bribery management service implementing ISO 37001 with risk assessments, due diligence, gift registers, investigations, and training.

## Running standalone

```bash
pnpm --filter @ims/api-iso37001 dev
```

## API Endpoints

- `/api/compliance`
- `/api/due-diligence`
- `/api/gifts`
- `/api/investigations`
- `/api/policies`
- `/api/risk-assessments`
- `/api/training`

## Dependencies

- @ims/auth
- @ims/database
- @ims/monitoring
- @ims/rbac
- @ims/types
