# @ims/api-infosec

**Type**: API Service (Express.js)  
**Port**: 4015  
**Standard/Domain**: ISO 27001  
**Part of**: [Nexara IMS](../../README.md)

## Purpose

Information security service implementing ISO 27001 with risk assessments, security controls, incident management, and privacy/GDPR compliance.

## Running standalone

```bash
pnpm --filter @ims/api-infosec dev
```

## API Endpoints

- `/api/assets`
- `/api/audits`
- `/api/controls`
- `/api/incidents`
- `/api/privacy`
- `/api/risks`
- `/api/scope`

## Dependencies

- @ims/auth
- @ims/database
- @ims/monitoring
- @ims/rbac
- @ims/service-auth
- @ims/shared
- @ims/types
- @ims/validation
