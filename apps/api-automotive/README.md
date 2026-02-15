# @ims/api-automotive

**Type**: API Service (Express.js)  
**Port**: 4010  
**Standard/Domain**: IATF 16949  
**Part of**: [Nexara IMS](../../README.md)

## Purpose

Automotive quality service implementing IATF 16949 with APQP, PPAP, FMEA, SPC, MSA, 8D problem solving, and layered process audits.

## Running standalone

```bash
pnpm --filter @ims/api-automotive dev
```

## API Endpoints

- `/api/apqp`
- `/api/control-plans`
- `/api/csr`
- `/api/customer-reqs`
- `/api/eight-d`
- `/api/fmea`
- `/api/lpa`
- `/api/msa`
- `/api/ppap`
- `/api/spc`

## Dependencies

- @ims/audit
- @ims/auth
- @ims/database
- @ims/esig
- @ims/monitoring
- @ims/rbac
- @ims/service-auth
- @ims/shared
- @ims/spc-engine
- @ims/types
- @ims/validation
