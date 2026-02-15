# @ims/api-partners

**Type**: API Service (Express.js)  
**Port**: 4026  
**Standard/Domain**: Partner Management  
**Part of**: [Nexara IMS](../../README.md)

## Purpose

Partner management service with partner authentication, deal registration, referral tracking, and payout management.

## Running standalone

```bash
pnpm --filter @ims/api-partners dev
```

## API Endpoints

- `/api/auth`
- `/api/deals`
- `/api/payouts`
- `/api/profile`

## Dependencies

- @ims/database
- @ims/monitoring
- @ims/types
- @ims/validation
