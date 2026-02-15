# @ims/api-medical

**Type**: API Service (Express.js)  
**Port**: 4011  
**Standard/Domain**: ISO 13485  
**Part of**: [Nexara IMS](../../README.md)

## Purpose

Medical device quality service implementing ISO 13485 with design controls, CAPA, complaints, UDI, traceability, and regulatory submissions.

## Running standalone

```bash
pnpm --filter @ims/api-medical dev
```

## API Endpoints

- `/api/capa`
- `/api/complaints`
- `/api/design-controls`
- `/api/dmr-dhr`
- `/api/pms`
- `/api/risk-management`
- `/api/software`
- `/api/submissions`
- `/api/traceability`
- `/api/udi`
- `/api/validation`
- `/api/verification`

## Dependencies

- @ims/auth
- @ims/database
- @ims/monitoring
- @ims/rbac
- @ims/service-auth
- @ims/shared
- @ims/types
- @ims/validation
