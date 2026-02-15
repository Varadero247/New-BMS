# @ims/api-aerospace

**Type**: API Service (Express.js)  
**Port**: 4012  
**Standard/Domain**: AS9100  
**Part of**: [Nexara IMS](../../README.md)

## Purpose

Aerospace quality service implementing AS9100 with FAI, special processes, FOD prevention, configuration management, and counterfeit part prevention.

## Running standalone

```bash
pnpm --filter @ims/api-aerospace dev
```

## API Endpoints

- `/api/audits`
- `/api/baselines`
- `/api/changes`
- `/api/compliance-tracker`
- `/api/configuration`
- `/api/counterfeit`
- `/api/fai`
- `/api/fod`
- `/api/human-factors`
- `/api/oasis`
- `/api/product-safety`
- `/api/special-processes`
- `/api/workorders`

## Dependencies

- @ims/audit
- @ims/auth
- @ims/database
- @ims/esig
- @ims/monitoring
- @ims/rbac
- @ims/service-auth
- @ims/shared
- @ims/types
- @ims/validation
