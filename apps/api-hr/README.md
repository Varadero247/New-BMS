# @ims/api-hr

**Type**: API Service (Express.js)  
**Port**: 4006  
**Standard/Domain**: Human Resources  
**Part of**: [Nexara IMS](../../README.md)

## Purpose

Human resources service managing employees, departments, leave, attendance, recruitment, performance reviews, training, and organisational charts.

## Running standalone

```bash
pnpm --filter @ims/api-hr dev
```

## API Endpoints

- `/api/attendance`
- `/api/certifications`
- `/api/departments`
- `/api/documents`
- `/api/employees`
- `/api/goals`
- `/api/leave`
- `/api/org-chart`
- `/api/performance`
- `/api/recruitment`
- `/api/training`

## Dependencies

- @ims/auth
- @ims/database
- @ims/monitoring
- @ims/rbac
- @ims/service-auth
- @ims/shared
- @ims/types
- @ims/validation
