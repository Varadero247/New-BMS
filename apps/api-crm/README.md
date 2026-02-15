# @ims/api-crm

**Type**: API Service (Express.js)  
**Port**: 4014  
**Standard/Domain**: CRM  
**Part of**: [Nexara IMS](../../README.md)

## Purpose

Customer relationship management service with contacts, accounts, deals, leads, campaigns, quotes, and pipeline management.

## Running standalone

```bash
pnpm --filter @ims/api-crm dev
```

## API Endpoints

- `/api/accounts`
- `/api/campaigns`
- `/api/contacts`
- `/api/deals`
- `/api/leads`
- `/api/partners`
- `/api/quotes`
- `/api/reports`

## Dependencies

- @ims/auth
- @ims/database
- @ims/monitoring
- @ims/rbac
- @ims/types
