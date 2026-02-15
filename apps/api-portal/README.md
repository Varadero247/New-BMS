# @ims/api-portal

**Type**: API Service (Express.js)  
**Port**: 4018  
**Standard/Domain**: Customer/Supplier Portal  
**Part of**: [Nexara IMS](../../README.md)

## Purpose

Customer and supplier portal service providing self-service access to documents, orders, complaints, tickets, NPS surveys, and scorecards.

## Running standalone

```bash
pnpm --filter @ims/api-portal dev
```

## API Endpoints

- `/api/customer-complaints`
- `/api/customer-documents`
- `/api/customer-invoices`
- `/api/customer-nps`
- `/api/portal-announcements`
- `/api/portal-approvals`
- `/api/portal-notifications`
- `/api/portal-orders`
- `/api/portal-quality`
- `/api/portal-scorecards`
- `/api/portal-tickets`
- `/api/portal-users`
- `/api/supplier-documents`
- `/api/supplier-ncrs`
- `/api/supplier-orders`
- `/api/supplier-register`

## Dependencies

- @ims/auth
- @ims/database
- @ims/monitoring
- @ims/rbac
- @ims/types
