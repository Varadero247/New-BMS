# @ims/api-quality

**Type**: API Service (Express.js)  
**Port**: 4003  
**Standard/Domain**: ISO 9001  
**Part of**: [Nexara IMS](../../README.md)

## Purpose

Quality management service implementing ISO 9001 with audits, nonconformances, CAPA, calibrations, FMEA, document control, evidence packs, and supplier management.

## Running standalone

```bash
pnpm --filter @ims/api-quality dev
```

## API Endpoints

- `/api/actions`
- `/api/audits`
- `/api/calibrations`
- `/api/capa`
- `/api/changes`
- `/api/ci`
- `/api/competences`
- `/api/context-factors`
- `/api/counterfeit`
- `/api/customer-satisfaction`
- `/api/design-development`
- `/api/documents`
- `/api/evidence-pack`
- `/api/fmea`
- `/api/headstart`
- `/api/improvements`
- `/api/investigations`
- `/api/issues`
- `/api/legal`
- `/api/management-reviews`
- `/api/metrics`
- `/api/nonconformances`
- `/api/objectives`
- `/api/opportunities`
- `/api/parties`
- `/api/policy`
- `/api/processes`
- `/api/product-safety`
- `/api/raci`
- `/api/releases`
- `/api/risk-register`
- `/api/risks`
- `/api/scope`
- `/api/suppliers`
- `/api/training`

## Dependencies

- @ims/auth
- @ims/calculations
- @ims/database
- @ims/monitoring
- @ims/rbac
- @ims/types
