# Answer Key — FACILITATOR ONLY

**DO NOT DISTRIBUTE TO PARTICIPANTS**

---

## Pre-Assessment Answers (Diagnostic — for facilitator reference only)

| Q | Answer | Notes |
|---|--------|-------|
| 1 | B | System for Cross-domain Identity Management |
| 2 | B | Removing access when leaving |
| 3 | A | Minimum required permissions |
| 4 | B | JSON Web Token |
| 5 | B | Cumulative model |
| 6 | C | Named accounts, min permissions |
| 7 | B | Most permissive wins |
| 8 | B | Explicit denial overrides role grants |
| 9 | B | Authenticate programmatic access |
| 10 | B | Azure AD, Okta etc. = IdP |
| 11 | B | HTTP callback, push events |
| 12 | C | Verify authenticity and integrity |
| 13 | B | Cannot modify past events |
| 14 | C | Login = AUTH event |
| 15 | D | 7 years (ISO 27001 / GDPR) |
| 16 | B | Forward to SIEM for monitoring |
| 17 | B | pg_dump creates backups |
| 18 | B | Max acceptable data loss in time |
| 19 | D | Removes/changes API = breaking |
| 20 | B | Toggle independent of deployment |

*Use pre-assessment results to identify knowledge gaps, not to grade participants.*

---

## Day 1 Formative Assessment Answers

| Q | Answer | Explanation |
|---|--------|-------------|
| 1 | B | HTTP 409 = Conflict; email already exists |
| 2 | C | `SCIM_USER_DEACTIVATE` is the specific deprovisioning event |
| 3 | B | Pending = invitation not accepted; resend invitation |
| 4 | C | Temporary Access Grant is the correct tool; never permanently assign |
| 5 | B | Most permissive wins: EDIT > VIEW |
| 6 | B | DENY overrides all role grants for that namespace |
| 7 | B | Module Registry → Dependencies tab shows requirements |
| 8 | C | Reset to INACTIVE → activate dependency → re-activate |
| 9 | B | Hard = required; soft = recommended but not blocking |
| 10 | B | Minimum scope (`read:analytics`), IP restricted, with expiry |
| 11 | B | ACS URL is where IdP POSTs assertions |
| 12 | B | HMAC-SHA256 of raw body with shared secret |
| 13 | B | Ask for specifics; grant minimum required |
| 14 | C | Annual minimum; rotate on suspected compromise |
| 15 | C | Inspect delivery logs for HTTP response codes first |

**Scoring guide:**
- 11–15: Advance badge (green)
- 8–10: Review note (amber) — focus extra attention in Day 2
- 0–7: Support flag (red) — 1:1 check-in during Day 2 break

---

## Summative Assessment — Part A Answers

| Q | Answer | Module |
|---|--------|--------|
| 1 | B | User Management |
| 2 | B | User Management |
| 3 | C | User Management |
| 4 | B | User Management |
| 5 | C | User Management |
| 6 | C | User Management |
| 7 | B | User Management |
| 8 | B | User Management |
| 9 | C | Roles & Permissions |
| 10 | B | Roles & Permissions |
| 11 | B | Roles & Permissions |
| 12 | C | Roles & Permissions |
| 13 | B | Roles & Permissions |
| 14 | B | Roles & Permissions |
| 15 | B | Roles & Permissions |
| 16 | B | Roles & Permissions |
| 17 | B | Module Activation |
| 18 | B | Module Activation |
| 19 | C | Module Activation |
| 20 | B | Module Activation |
| 21 | C | Module Activation |
| 22 | B | Module Activation |
| 23 | C | Integration Management |
| 24 | B | Integration Management |
| 25 | B | Integration Management |
| 26 | B | Integration Management |
| 27 | B | Integration Management |
| 28 | C | Integration Management |
| 29 | B | Audit Log |
| 30 | B | Audit Log |
| 31 | B | Audit Log |
| 32 | B | Audit Log |
| 33 | B | Audit Log |
| 34 | B | Audit Log |
| 35 | B | Backup & Restore |
| 36 | B | Backup & Restore |
| 37 | B | Backup & Restore |
| 38 | C | Backup & Restore |
| 39 | B | Platform Updates |
| 40 | C | Platform Updates |

---

## Part B — Marking Rubric

### Scenario A: SCIM Outage (5 marks)

**1 mark**: First step is to check IMS Audit Log → Category: INTEGRATION → Event: SCIM_USER_CREATE or SCIM_AUTH_FAILED

**1 mark**: Identifies that HTTP 401 on SCIM requests indicates an expired or rotated SCIM bearer token (OR correctly identifies another error code with plausible explanation — e.g. 422 with attribute mapping issue)

**1 mark**: Describes checking the Azure AD provisioning logs for error codes / connecting to the SCIM endpoint manually with curl to test the token

**1 mark**: Correct remediation:
- If 401: Generate new SCIM token in IMS; update Azure AD SCIM config; re-test
- If 422: Fix attribute mapping; force re-sync
- If other: Appropriate to identified cause

**1 mark**: To provision the 12 users without waiting for automated cycle:
- Option 1: Force a manual sync from Azure AD ("Provision on Demand" for each user)
- Option 2: Manually import via CSV as interim measure
- Option 3: Via IMS API: `POST /scim/v2/Users` for each user

*Accept any technically correct combination. Award partial marks (0.5) for partially correct answers.*

---

### Scenario B: Privilege Escalation (5 marks)

**1 mark**: Correctly identifies audit events to look for:
- `ROLE_ASSIGNED` to Karen's account (actor = someone else?) OR
- `PERMISSION_OVERRIDE` on hr namespace for Karen
- With timestamp showing access was granted before the export

**1 mark**: Distinguishes account compromise vs insider:
- Compromise evidence: unexpected IP address, unusual access time, prior failed logins
- Insider evidence: known IP, normal business hours, history of privilege requests
- (Accept either; reward for structured reasoning)

**1 mark**: Immediate containment (in priority order):
1. Suspend Karen's account immediately
2. Revoke any active sessions (force logout)
3. Remove the escalated role/permission
4. Preserve all audit log evidence (do not clear)

**1 mark**: Data protection obligation:
- HR records containing names, salaries, personal data = personal data under GDPR
- 72-hour notification window to supervisory authority (ICO in UK, etc.)
- Affected individuals may need notification if high risk

**1 mark**: Post-incident actions:
- Root cause analysis (how was the role escalated? Who authorised it?)
- Remediation: fix the process gap that allowed self-escalation
- Document in incident register
- Schedule review of all PERMISSION_OVERRIDE events in last 90 days

---

### Scenario C: Failed Update Rollback (5 marks)

**1 mark**: First priority actions:
1. Declare incident in change management system
2. Notify stakeholders (IT Manager, operations teams) immediately
3. Do NOT wait — time started at 09:34

**1 mark**: Auto-rollback analysis:
- Auto-rollback triggers after health check fails × 3 AND/OR error rate > 5% for 2 consecutive minutes
- At 09:34 the condition may only have existed for < 2 minutes when first noted
- Manual rollback is required because auto-rollback did not trigger within the 30-min window
- (Accept any technically accurate explanation)

**1 mark**: Manual rollback steps:
1. Admin Console → Settings → Platform Updates → [v2.16.0] → Rollback
2. Confirm rollback reason (dropdown + text)
3. Wait 30–90 seconds for rollback to complete
4. Verify: `GET /api/health` returns v2.15.x and `{"status":"healthy"}`

**1 mark**: Post-rollback validation:
1. Health check returns healthy on all pods
2. Error rate returns to baseline (< 0.1%)
3. Core smoke tests pass (login, create record, run report)
4. Check rollback audit log event: `UPDATE_ROLLED_BACK`

**1 mark**: Post-mortem requirements:
- Schedule within 48 hours of incident
- Attendees: IT Manager, whoever applied the update, Nexara Support rep
- Document: root cause, timeline, impact, action items
- Update change ticket: status → Rolled Back
- Notify Nexara Support with diagnostic data

---

## Grade Boundaries

| Mark range | Grade | Certificate |
|-----------|-------|-------------|
| 0–41 | Fail | No certificate; retake required |
| 42–49 | Pass | Nexara Certified Platform Administrator |
| 50–55 | Distinction | Nexara Certified Platform Administrator with Distinction |
