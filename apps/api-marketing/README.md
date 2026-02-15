# @ims/api-marketing

**Type**: API Service (Express.js)  
**Port**: 4025  
**Standard/Domain**: Marketing Automation  
**Part of**: [Nexara IMS](../../README.md)

## Purpose

Marketing automation service with lead management, onboarding sequences, health scores, ROI calculator, chatbot, renewal and winback campaigns.

## Running standalone

```bash
pnpm --filter @ims/api-marketing dev
```

## API Endpoints

- `/api/chat`
- `/api/digest`
- `/api/expansion`
- `/api/growth`
- `/api/health-score`
- `/api/leads`
- `/api/linkedin-tracker`
- `/api/onboarding`
- `/api/partner-onboarding`
- `/api/prospect-research`
- `/api/renewal`
- `/api/roi`
- `/api/stripe-webhooks`
- `/api/winback`

## Dependencies

- @ims/auth
- @ims/database
- @ims/email
- @ims/monitoring
- @ims/rbac
- @ims/types
- @ims/validation
