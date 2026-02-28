# Nexara IMS Administrator Training — Participant Handbook

**Name**: ________________________________________________
**Organisation**: ________________________________________________
**Date**: ________________________________________________
**Facilitator**: ________________________________________________
**Cohort**: ________________________________________________

---

# Welcome

This handbook is your personal workbook for the two-day Nexara IMS Administrator Training Programme. It contains:
- Full content for all 7 modules (condensed reference versions)
- Note-taking space throughout
- Lab exercise briefs
- Assessment preparation checklists

Keep it after the programme. It is your ongoing reference guide as a Nexara Certified Platform Administrator.

---

# How to Use This Handbook

- **During sessions**: Use the "My Notes" sections to capture insights specific to your organisation
- **During labs**: Follow the lab briefs; your handbook has the key commands and procedures
- **After the programme**: Use as a reference when you encounter administrative tasks back at work
- **For assessment prep**: The "Module Summary" section at the end of each chapter is your revision guide

---

# Programme Overview

## Two-Day Schedule

| Day | Theme | Modules |
|-----|-------|---------|
| Day 1 | Platform Foundations & User Governance | User Management, Roles, Module Activation, Integrations |
| Day 2 | Operations, Security & Maintenance | Audit Logs, Backup/Restore, Platform Updates + Assessment |

## Learning Outcomes

By the end of this programme you will be able to:
1. Configure and manage users via both manual and SCIM auto-provisioning
2. Design and implement a role matrix enforcing least-privilege across all modules
3. Activate, configure, and troubleshoot IMS modules
4. Create and audit all integration types: API keys, OAuth, SAML, webhooks
5. Navigate, filter, and export audit logs for compliance and security investigations
6. Execute backup and restore procedures including disaster recovery
7. Plan, apply, monitor, and roll back platform updates

---

# Day 1 — Platform Foundations & User Governance

---

## Module 1: User Management & SCIM Provisioning

### 1.1 User Account States

| State | Description | My Notes |
|-------|-------------|----------|
| Active | Can log in | |
| Inactive | No login; data retained | |
| Suspended | Temp block | |
| Pending | Invited; not accepted | |
| Deleted | Soft-deleted; 90-day retention | |

**My deprovisioning process today:**
_______________________________________________
_______________________________________________

**Target process after this training:**
_______________________________________________
_______________________________________________

### 1.2 SCIM 2.0 Key Facts

- Base URL: `https://{instance}.nexara.io/scim/v2`
- Auth: Bearer token (rotate annually)
- Key endpoints: `/Users`, `/Groups`
- Token location: Admin Console → Integrations → SCIM

**Our IdP**: _______________________________________________
**SCIM configured?** Yes / No / Planned

**SCIM questions for my organisation:**
_______________________________________________
_______________________________________________
_______________________________________________

### 1.3 SCIM HTTP Response Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200/201 | Success | None |
| 401 | Invalid token | Rotate token |
| 409 | Duplicate email | Remove duplicate |
| 422 | Invalid field | Check mapping |
| 429 | Rate limited | Reduce frequency |

### 1.4 My Notes — Module 1

_______________________________________________
_______________________________________________
_______________________________________________
_______________________________________________
_______________________________________________
_______________________________________________
_______________________________________________

---

## Module 2: Role & Permission Configuration

### 2.1 Permission Levels Summary

| Level | Name | What I can do |
|-------|------|--------------|
| 0 | NONE | No access |
| 1 | VIEW | Read only |
| 2 | COMMENT | Read + comment |
| 3 | CREATE | + Create records |
| 4 | EDIT | + Modify records |
| 5 | DELETE | + Archive/delete |
| 6 | ADMIN | + Module settings |

### 2.2 Key Roles in My Organisation

*Fill in after the role matrix exercise:*

| Role | Who holds it | Modules they need |
|------|-------------|-------------------|
| | | |
| | | |
| | | |
| | | |
| | | |

### 2.3 Least-Privilege Audit Checklist

When reviewing role assignments quarterly:
- [ ] No more than 2 users with SUPER_ADMIN
- [ ] ADMIN on `platform` namespace only for IT roles
- [ ] External roles (CUSTOMER, SUPPLIER) have CREATE or below
- [ ] Temporary access grants have expiry dates set
- [ ] DENY overrides are documented

### 2.4 My Notes — Module 2

_______________________________________________
_______________________________________________
_______________________________________________
_______________________________________________
_______________________________________________
_______________________________________________

---

## Module 3: Module Activation & Configuration

### 3.1 Activation Sequence for My Organisation

*Plan the wave-based activation here:*

**Wave 1 (Foundation):**
_______________________________________________

**Wave 2 (Operational):**
_______________________________________________

**Wave 3 (Advanced):**
_______________________________________________

**Wave 4 (Portals/Specialist):**
_______________________________________________

### 3.2 Activation Failure Troubleshooting

1. Check: Admin Console → Audit Log → Filter: `MODULE_ACTIVATION_FAILED`
2. Common causes: dependency not met, license expired, config invalid
3. Action: Reset to INACTIVE before retrying

### 3.3 My Notes — Module 3

_______________________________________________
_______________________________________________
_______________________________________________
_______________________________________________
_______________________________________________
_______________________________________________

---

## Module 4: Integration Management

### 4.1 API Key Best Practices

- [ ] Set expiry date (max 365 days)
- [ ] Minimum required scopes only
- [ ] IP allow-list configured
- [ ] Name includes: system name + purpose
- [ ] Rotation procedure documented

**Current API integrations in my organisation:**

| Integration | Scope needed | Expiry policy |
|-------------|-------------|---------------|
| | | |
| | | |
| | | |

### 4.2 SAML SSO Configuration Checklist

- [ ] IMS SP metadata exported
- [ ] IdP application created
- [ ] ACS URL configured: `https://{instance}.nexara.io/saml/callback`
- [ ] Attribute mapping complete (email, givenName, surname, groups)
- [ ] Group-to-role mapping configured
- [ ] SSO test passed

### 4.3 Webhook HMAC Verification Pattern

```javascript
const crypto = require('crypto');
const sig = req.headers['x-nexara-signature'];
const expected = 'sha256=' + crypto
  .createHmac('sha256', webhookSecret)
  .update(req.rawBody).digest('hex');
// Use timingSafeEqual to prevent timing attacks
```

### 4.4 Integration Audit Red Flags

- API keys with no expiry date
- OAuth clients with `write:all` or `admin:*`
- Webhooks with > 20% failure rate
- Inactive webhooks (0 deliveries in 90 days)
- SAML metadata older than 12 months

### 4.5 My Notes — Module 4

_______________________________________________
_______________________________________________
_______________________________________________
_______________________________________________
_______________________________________________
_______________________________________________

---

## Day 1 Assessment Preparation

**Before the formative assessment, confirm you can:**
- [ ] Describe the 5 user account states
- [ ] Explain the 7 permission levels
- [ ] Name the SCIM endpoints and auth method
- [ ] List 3 hard module dependencies
- [ ] Explain webhook HMAC-SHA256 signing

---

# Day 2 — Operations, Security & Maintenance

---

## Module 5: Audit Log Review

### 5.1 Audit Event Schema

Every event contains: `id`, `timestamp`, `actor`, `action`, `target`, `outcome`, `sessionId`, `metadata`, `hash`

### 5.2 Event Categories Quick Reference

| Category | Covers |
|----------|--------|
| AUTH | Login, logout, MFA, token events |
| DATA | Create, update, delete, export |
| ADMIN | User/role/module/org changes |
| INTEGRATION | API key, OAuth, SAML, webhook, SCIM |
| SYSTEM | Backup, restore, update, alert |

### 5.3 Investigation Workflow

1. Define the incident time window
2. Filter by actor (if known) or by event type
3. Look for `*_FAILURE` events → entry points
4. Pivot to DATA events → what was accessed/changed
5. Check IP address against known locations
6. Export findings for incident report

### 5.4 My Notes — Module 5

_______________________________________________
_______________________________________________
_______________________________________________
_______________________________________________

---

## Module 6: Backup & Restore

### 6.1 Backup Commands Reference

```bash
# Backup (full)
pg_dump -h HOST -U postgres -d ims \
  --format=custom --file=ims_YYYYMMDD.dump

# Verify
sha256sum ims_YYYYMMDD.dump
pg_restore --list ims_YYYYMMDD.dump > /dev/null

# Restore
pg_restore -h HOST -U postgres -d ims \
  --clean --if-exists --no-owner ims_YYYYMMDD.dump
```

### 6.2 Backup Schedule for My Organisation

| Job | Frequency | Retention | Storage location |
|-----|-----------|-----------|-----------------|
| Full | | | |
| Incremental | | | |
| WAL archive | | | |
| Offsite | | | |

### 6.3 DR Runbook (8 Steps)

1. Declare DR incident
2. Notify stakeholders + Nexara Support
3. Identify most recent clean backup
4. Provision DR environment
5. Restore from backup
6. Validate restore
7. Update DNS / load balancer
8. Notify users: service restored

### 6.4 My Notes — Module 6

_______________________________________________
_______________________________________________
_______________________________________________
_______________________________________________

---

## Module 7: Platform Update Management

### 7.1 Pre-Update Checklist (Condensed)

- [ ] Changelog read
- [ ] Backup verified
- [ ] Staging tested
- [ ] Maintenance window set + users notified
- [ ] Change ticket approved
- [ ] Rollback plan documented
- [ ] Monitoring open

### 7.2 Rollback Procedure

1. Admin Console → Settings → Platform Updates → Rollback
2. Confirm reason
3. Wait 30–90 seconds for rollback
4. Verify version: `GET /api/health`
5. Notify Nexara Support
6. Update change ticket
7. Schedule post-mortem

### 7.3 Feature Flag Governance

- [ ] All flags have expiry dates
- [ ] Quarterly flag review scheduled
- [ ] Flag changes logged in change management
- [ ] Gradual rollout used for new features

### 7.4 My Notes — Module 7

_______________________________________________
_______________________________________________
_______________________________________________
_______________________________________________

---

## Assessment Preparation — Summative

**Part A: 40 MCQ — Topic weightings:**
- User Management: ~8 questions
- Roles & Permissions: ~8 questions
- Module Activation: ~6 questions
- Integration Management: ~6 questions
- Audit Logs: ~6 questions
- Backup & Restore: ~4 questions
- Platform Updates: ~2 questions

**Part B: 3 Scenarios**
- Scenario A: SCIM outage investigation and remediation
- Scenario B: Privilege escalation — contain and report
- Scenario C: Failed update rollback — recovery procedure

**Pass criteria**: 75% (38/55 marks). Distinction: 90% (50/55 marks).

---

## My 30-Day Action Plan

*Three specific actions I will take within 30 days:*

**Action 1:**
_______________________________________________
**Target date**: _______________________________________________
**Success measure**: _______________________________________________

**Action 2:**
_______________________________________________
**Target date**: _______________________________________________
**Success measure**: _______________________________________________

**Action 3:**
_______________________________________________
**Target date**: _______________________________________________
**Success measure**: _______________________________________________

---

## Useful Contacts

| Contact | Name | Email |
|---------|------|-------|
| Nexara Support | | support@nexara.io |
| Account Manager | | |
| Internal IT contact | | |
| Change management approver | | |

---

*© 2026 Nexara DMCC. This handbook is licensed for use by the registered participant only. Do not copy or distribute.*
