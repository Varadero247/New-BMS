# Module 1 — User Management & SCIM Provisioning

**Duration**: 90 minutes
**Position**: Day 1, 09:00–10:30
**CPD Hours**: 1.5

---

## Learning Objectives

On completion of this module, participants will be able to:

1. Describe the full IMS user lifecycle from creation through deactivation
2. Execute bulk user import via CSV with field mapping and error remediation
3. Configure SCIM 2.0 provisioning with an external Identity Provider
4. Diagnose common SCIM provisioning failures
5. Design a user governance policy for their organisation

---

## 1. User Account States

The IMS recognises five user account states:

| State | Description | Who can set it |
|-------|-------------|----------------|
| **Active** | User can log in and access assigned modules | Org Admin, Super Admin |
| **Inactive** | User cannot log in; data retained; SCIM deprovisioning trigger | Org Admin, Super Admin |
| **Suspended** | Temporary access block; retains role assignments | Org Admin, Super Admin |
| **Pending** | Invited but not yet accepted; account not activated | System (invitation) |
| **Deleted** | Soft-deleted; 90-day data retention then hard purge | Super Admin only |

**Important**: Deactivating a user does not delete their data. Use the Deleted state only when GDPR erasure is required.

---

## 2. User Lifecycle Flow

```
Invite sent → [Pending]
         ↓ (user accepts)
        [Active] ←→ [Suspended]
         ↓ (admin action or SCIM deprovision)
        [Inactive]
         ↓ (GDPR erasure request)
        [Deleted]
```

### Provisioning Methods

| Method | Best For |
|--------|----------|
| Manual creation (admin console) | ≤ 10 users |
| CSV bulk import | 10–500 users |
| API batch create (`POST /api/users/batch`) | 500+ users, programmatic |
| SCIM 2.0 auto-provisioning | Ongoing, IdP-managed |

---

## 3. Manual User Creation

**Path**: Admin Console → Users → New User

**Required fields:**
- `email` — must be unique across the organisation
- `firstName`, `lastName`
- `role` — at least one role must be assigned at creation

**Optional fields:**
- `displayName` — defaults to `firstName + lastName`
- `department`, `jobTitle`, `phoneNumber`
- `locale` — defaults to organisation default
- `timezone` — defaults to organisation timezone

**Note**: Passwords are never set by admins. The invitation email contains a one-time setup link (valid 72 hours).

---

## 4. Bulk CSV Import

### CSV Format

```csv
email,firstName,lastName,role,department,jobTitle
alice@example.com,Alice,Smith,MODULE_ADMIN,IT,Systems Administrator
bob@example.com,Bob,Jones,AUDITOR,Compliance,Internal Auditor
```

**Field mapping rules:**
- `email`: required; must be unique
- `role`: must match an existing IMS role identifier (case-sensitive)
- All other fields: optional; unmapped columns are ignored

### Import Process

1. Navigate to **Users → Import → Upload CSV**
2. Map CSV columns to IMS fields
3. Review validation preview (errors highlighted row-by-row)
4. Fix errors in the CSV and re-upload, or skip errored rows
5. Confirm import
6. Invitation emails sent automatically to all successfully imported users

### Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `EMAIL_DUPLICATE` | Email already exists in the system | Remove row or update existing user |
| `ROLE_NOT_FOUND` | Role identifier typo | Check role identifiers in Roles → All Roles |
| `EMAIL_INVALID` | Malformed email address | Correct in CSV |
| `REQUIRED_FIELD_MISSING` | email, firstName, or lastName blank | Add missing value |

---

## 5. SCIM 2.0 Provisioning

### What is SCIM?

SCIM (System for Cross-domain Identity Management) is an open standard protocol (RFC 7642-7644) that allows an Identity Provider (IdP) such as Azure AD or Okta to automatically create, update, and deactivate IMS user accounts.

**Benefits:**
- Eliminates manual onboarding/offboarding
- Real-time account state sync (joiner/mover/leaver)
- Group-to-role mapping
- Reduces security risk from orphaned accounts

### IMS SCIM Endpoints

| Endpoint | Method | Action |
|----------|--------|--------|
| `/scim/v2/Users` | GET | List all provisioned users |
| `/scim/v2/Users` | POST | Create user |
| `/scim/v2/Users/{id}` | GET | Get user |
| `/scim/v2/Users/{id}` | PUT | Replace user (full update) |
| `/scim/v2/Users/{id}` | PATCH | Partial user update |
| `/scim/v2/Users/{id}` | DELETE | Deprovision user (sets state → Inactive) |
| `/scim/v2/Groups` | GET/POST/PUT/PATCH/DELETE | Group management |

**Base URL**: `https://your-instance.nexara.io/scim/v2`

### SCIM Authentication

All SCIM requests require a **Bearer token** issued from:
Admin Console → Settings → Integrations → SCIM → Generate Token

Tokens are long-lived (365 days by default). Rotate annually or after any suspected compromise.

### Configuring Azure AD SCIM

1. In Azure AD: **Enterprise Applications → New Application → Create your own → SCIM provisioning**
2. Set **Tenant URL**: `https://your-instance.nexara.io/scim/v2`
3. Set **Secret Token**: paste the SCIM bearer token
4. Test connection (Azure AD sends a `GET /scim/v2/Users` request)
5. Configure **Attribute Mappings**:
   - `userPrincipalName` → `emails[type eq "work"].value`
   - `givenName` → `name.givenName`
   - `surname` → `name.familyName`
   - `displayName` → `displayName`
   - `jobTitle` → `title`
   - `department` → `urn:ietf:params:scim:schemas:extension:enterprise:2.0:User:department`
6. Configure **Scope**: Sync only users in the assigned group (recommended)
7. Enable provisioning; first cycle runs within 40 minutes

### Configuring Okta SCIM

1. In Okta: **Applications → Browse App Catalog → SCIM 2.0** (or custom SCIM app)
2. Set **SCIM Connector Base URL**: `https://your-instance.nexara.io/scim/v2`
3. Set **Unique identifier field**: `email`
4. Enable: **Import Users**, **Push New Users**, **Push Profile Updates**, **Push Groups**
5. Authorisation: **HTTP Header** → `Authorization: Bearer <token>`
6. Test SCIM connection

---

## 6. SCIM Event Logs

All SCIM operations are logged in:
Admin Console → Audit Log → Filter by Category: Integration → Subtype: SCIM

### Common SCIM Log Events

| Event | Meaning |
|-------|---------|
| `SCIM_USER_CREATE` | IdP provisioned a new user |
| `SCIM_USER_UPDATE` | IdP updated a user attribute |
| `SCIM_USER_DEACTIVATE` | IdP deprovisioned user (account → Inactive) |
| `SCIM_GROUP_CREATE` | IdP created a group |
| `SCIM_GROUP_MEMBER_ADD` | User added to group (triggers role assignment) |
| `SCIM_GROUP_MEMBER_REMOVE` | User removed from group (triggers role removal) |
| `SCIM_AUTH_FAILED` | Invalid or expired SCIM token |

### Diagnosing Provisioning Failures

**Symptom**: New users not appearing in IMS after IdP assignment

**Checklist:**
1. Check SCIM event log for `SCIM_AUTH_FAILED` → Token may be expired or wrong
2. Check for `HTTP 422` responses in IdP provisioning logs → Validation error; check attribute mapping
3. Verify the user is in scope (not filtered out by assignment rules)
4. Check `SCIM_USER_CREATE` event exists but user is in `Pending` state → Invitation email issue

**HTTP Response Codes:**

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | None required |
| 201 | Created | None required |
| 400 | Bad request | Check attribute mapping |
| 401 | Unauthorised | Rotate and re-enter SCIM token |
| 409 | Conflict | Email already exists |
| 422 | Unprocessable entity | Required field missing or invalid value |
| 429 | Rate limited | Reduce provisioning frequency |
| 503 | Service unavailable | IMS temporarily unavailable; retry |

---

## 7. Group-to-Role Mapping

When IdP groups are synced via SCIM, map them to IMS roles:

**Path**: Admin Console → Integrations → SCIM → Group Mappings

| IdP Group | IMS Role |
|-----------|---------|
| `IMS-Admins` | `ORG_ADMIN` |
| `IMS-HS-Managers` | `HS_MANAGER` |
| `IMS-Viewers` | `VIEWER` |
| `IMS-Auditors` | `AUDITOR` |

**Rule**: Group membership is additive — a user in multiple groups receives all mapped roles.

---

## 8. User Governance Best Practices

### Naming Conventions
- Use `firstname.lastname@domain.com` as the canonical email format
- Avoid generic accounts: `admin@`, `it@` — use named accounts only
- Document shared service accounts in the integration registry

### Deprovisioning Policy
- Leavers: deprovision within **24 hours** of confirmed departure
- Role changes: update within **48 hours**
- Stale accounts (no login > 90 days): review quarterly; deactivate if not required

### Quarterly Account Audit
- Export user list: Admin Console → Users → Export
- Cross-reference against HR system
- Deactivate orphaned accounts
- Review and validate role assignments against current job functions

---

## Module 1 Summary

| Topic | Key Takeaway |
|-------|-------------|
| User states | 5 states; Inactive ≠ Deleted |
| Provisioning | SCIM preferred for 100+ users |
| SCIM endpoints | `/scim/v2/Users`, `/scim/v2/Groups` |
| Auth | Bearer token, rotate annually |
| Group mapping | IdP groups → IMS roles |
| Governance | 24-hour deprovisioning SLA for leavers |

---

*Proceed to LAB-01 for hands-on practice.*
