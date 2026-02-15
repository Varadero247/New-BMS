# @ims/api-inventory

**Type**: API Service (Express.js)  
**Port**: 4005  
**Standard/Domain**: Inventory Management  
**Part of**: [Nexara IMS](../../README.md)

## Purpose

Inventory management service for products, warehouses, stock levels, transactions, adjustments, and supplier tracking.

## Running standalone

```bash
pnpm --filter @ims/api-inventory dev
```

## API Endpoints

- `/api/adjustments`
- `/api/categories`
- `/api/inventory`
- `/api/products`
- `/api/reports`
- `/api/stock-levels`
- `/api/suppliers`
- `/api/transactions`
- `/api/warehouses`

## Dependencies

- @ims/auth
- @ims/calculations
- @ims/database
- @ims/monitoring
- @ims/rbac
- @ims/service-auth
- @ims/shared
- @ims/types
- @ims/validation
