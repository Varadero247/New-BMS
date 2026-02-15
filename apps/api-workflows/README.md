# @ims/api-workflows

**Type**: API Service (Express.js)  
**Port**: 4008  
**Standard/Domain**: Workflow Automation  
**Part of**: [Nexara IMS](../../README.md)

## Purpose

Workflow automation service providing visual workflow builder, approval chains, task assignment, and webhook-triggered automations.

## Running standalone

```bash
pnpm --filter @ims/api-workflows dev
```

## API Endpoints

- `/api/approvals`
- `/api/automation`
- `/api/definitions`
- `/api/instances`
- `/api/tasks`
- `/api/templates`
- `/api/webhooks`

## Dependencies

- @ims/auth
- @ims/database
- @ims/monitoring
- @ims/rbac
- @ims/service-auth
- @ims/shared
- @ims/validation
