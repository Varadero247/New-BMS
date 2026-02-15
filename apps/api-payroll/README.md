# @ims/api-payroll

**Type**: API Service (Express.js)  
**Port**: 4007  
**Standard/Domain**: Payroll Processing  
**Part of**: [Nexara IMS](../../README.md)

## Purpose

Payroll processing service with salary management, tax calculations, multi-jurisdiction support, benefits, expenses, and loan tracking.

## Running standalone

```bash
pnpm --filter @ims/api-payroll dev
```

## API Endpoints

- `/api/benefits`
- `/api/expenses`
- `/api/jurisdictions`
- `/api/loans`
- `/api/payroll`
- `/api/salary`
- `/api/tax`
- `/api/tax-calculator`

## Dependencies

- @ims/auth
- @ims/database
- @ims/monitoring
- @ims/rbac
- @ims/service-auth
- @ims/shared
- @ims/types
- @ims/validation
