# @ims/api-esg

**Type**: API Service (Express.js)  
**Port**: 4016  
**Standard/Domain**: ESG / CSRD  
**Part of**: [Nexara IMS](../../README.md)

## Purpose

ESG and CSRD reporting service tracking emissions, energy, water, waste, social metrics, governance, materiality, and sustainability frameworks.

## Running standalone

```bash
pnpm --filter @ims/api-esg dev
```

## API Endpoints

- `/api/audits`
- `/api/emissions`
- `/api/energy`
- `/api/frameworks`
- `/api/governance`
- `/api/initiatives`
- `/api/materiality`
- `/api/metrics`
- `/api/reports`
- `/api/social`
- `/api/stakeholders`
- `/api/targets`
- `/api/waste`
- `/api/water`

## Dependencies

- @ims/auth
- @ims/database
- @ims/monitoring
- @ims/rbac
- @ims/types
