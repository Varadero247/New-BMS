# @ims/api-finance

**Type**: API Service (Express.js)  
**Port**: 4013  
**Standard/Domain**: Finance Management  
**Part of**: [Nexara IMS](../../README.md)

## Purpose

Finance management service with general ledger, invoicing, budgets, purchase orders, tax management, banking, and financial reporting.

## Running standalone

```bash
pnpm --filter @ims/api-finance dev
```

## API Endpoints

- `/api/accounts`
- `/api/banking`
- `/api/budgets`
- `/api/customers`
- `/api/integrations`
- `/api/invoices`
- `/api/journal`
- `/api/payables`
- `/api/purchase-orders`
- `/api/reports`
- `/api/suppliers`
- `/api/tax`

## Dependencies

- @ims/auth
- @ims/database
- @ims/monitoring
- @ims/rbac
- @ims/types
