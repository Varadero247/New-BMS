# @ims/api-gateway

**Type**: API Service (Express.js)  
**Port**: 4000  
**Standard/Domain**: Auth, Routing, Sessions  
**Part of**: [Nexara IMS](../../README.md)

## Purpose

Central API gateway handling authentication, session management, CORS, rate limiting, and request proxying to all downstream services.

## Running standalone

```bash
pnpm --filter @ims/api-gateway dev
```

## API Endpoints

- `/api/activity`
- `/api/api-keys`
- `/api/audit`
- `/api/auth`
- `/api/automation-rules`
- `/api/certifications`
- `/api/changelog`
- `/api/comments`
- `/api/compliance`
- `/api/compliance-calendar`
- `/api/compliance-scores`
- `/api/dashboard`
- `/api/dpa`
- `/api/dsar`
- `/api/feature-flags`
- `/api/gdpr`
- `/api/import`
- `/api/ip-allowlist`
- `/api/msp`
- `/api/notifications`
- `/api/nps`
- `/api/openapi`
- `/api/presence`
- `/api/reports`
- `/api/roles`
- `/api/saml`
- `/api/scheduled-reports`
- `/api/scim`
- `/api/security-controls`
- `/api/sessions`
- `/api/status`
- `/api/tasks`
- `/api/templates`
- `/api/unified-audit`
- `/api/users`
- `/api/v1`
- `/api/v1`
- `/api/webhooks`

## Dependencies

- @ims/activity
- @ims/audit
- @ims/auth
- @ims/csv-import
- @ims/database
- @ims/dpa
- @ims/dsar
- @ims/email
- @ims/esig
- @ims/iso-checklists
- @ims/monitoring
- @ims/notifications
- @ims/openapi
- @ims/rbac
- @ims/scheduled-reports
- @ims/secrets
- @ims/service-auth
- @ims/shared
- @ims/templates
- @ims/types
- @ims/validation
