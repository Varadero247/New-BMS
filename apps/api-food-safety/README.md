# @ims/api-food-safety

**Type**: API Service (Express.js)  
**Port**: 4019  
**Standard/Domain**: ISO 22000  
**Part of**: [Nexara IMS](../../README.md)

## Purpose

Food safety management service implementing ISO 22000/HACCP with CCPs, hazards, allergens, traceability, recalls, and sanitation management.

## Running standalone

```bash
pnpm --filter @ims/api-food-safety dev
```

## API Endpoints

- `/api/allergens`
- `/api/audits`
- `/api/ccps`
- `/api/environmental-monitoring`
- `/api/food-defense`
- `/api/hazards`
- `/api/monitoring`
- `/api/ncrs`
- `/api/products`
- `/api/recalls`
- `/api/sanitation`
- `/api/suppliers`
- `/api/traceability`
- `/api/training`

## Dependencies

- @ims/auth
- @ims/database
- @ims/monitoring
- @ims/rbac
- @ims/types
