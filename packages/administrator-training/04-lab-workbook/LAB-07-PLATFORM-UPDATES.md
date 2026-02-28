# LAB-07 — Update Plan & Rollback Scenario

**Module**: 7
**Duration**: 20 minutes
**Mode**: Scenario-based (planning exercise)

---

## Scenario

**Context**: Nexara has released IMS version 2.15.0 (minor update). The changelog includes:

- **New**: AI-powered incident risk prediction (feature flag: `ai.incident-prediction`, off by default)
- **Updated**: Audit log export now supports JSON Lines format
- **Fixed**: SCIM provisioning occasionally duplicated user records (fix includes a DB migration)
- **Deprecated**: Legacy `/api/v0/*` endpoints (will be removed in v3.0.0)
- **Breaking change**: Webhook signature algorithm changed from SHA-1 to SHA-256 (as of this release)

Your production system is currently on v2.14.3. You must plan and execute the update.

---

## Part A: Pre-Update Checklist (7 min)

Work through the 12-point checklist for this specific update:

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 1 | Changelog read | | Note: SHA-256 webhook change is breaking |
| 2 | Backup completed and verified | | |
| 3 | Staging on target version | | |
| 4 | Automated tests passed | | |
| 5 | Smoke tests passed | | |
| 6 | Maintenance window scheduled | | |
| 7 | Users notified 24h in advance | | |
| 8 | Change ticket raised and approved | | |
| 9 | Rollback plan documented | | Fill in below |
| 10 | Second admin available | | |
| 11 | Nexara Support on standby | | Not needed for minor update |
| 12 | Monitoring dashboards open | | |

**Rollback plan for v2.15.0:**

If the update fails, what specific actions would you take?

1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

**Breaking change action required** (webhook SHA-256):

Before applying the update, what must you communicate to all teams that have active webhooks?

_______________________________________________
_______________________________________________

---

## Part B: Rollback Scenario (8 min)

**Situation**: You applied v2.15.0 at 14:00. It is now 14:23.

Your monitoring dashboard shows:
- Error rate: 8.3% (normally < 0.1%)
- P99 latency: 4,200ms (normally 250ms)
- Health check: 2 of 3 API pods reporting DEGRADED

The incident investigation reveals: the SCIM deduplication migration failed partway through, leaving the user table in an inconsistent state.

**Your tasks:**

1. **Declare**: Write the incident declaration you would post to your communication channel:

   *Template*: "IMS platform incident — [DATE] [TIME]. [Impact description]. Engineering team investigating. Next update in 30 minutes."

   Your declaration: _______________________________________________
   _______________________________________________

2. **Initiate rollback**: List the exact steps (UI or CLI) to roll back to v2.14.3:

   Step 1: _______________________________________________
   Step 2: _______________________________________________
   Step 3: _______________________________________________

3. **Post-rollback validation**: What 3 things would you check immediately after rollback completes?

   1. _______________________________________________
   2. _______________________________________________
   3. _______________________________________________

4. **Root cause**: Based on the evidence, what was the most likely root cause?

   _______________________________________________

---

## Part C: Feature Flag Management (5 min)

The AI incident prediction feature (`ai.incident-prediction`) is off by default but your Head of Health & Safety wants to enable it immediately as a pilot for one team.

**Design a controlled rollout:**

| Decision | Your choice | Reason |
|----------|------------|--------|
| Enable globally or per-org? | | |
| Enable for all users or specific role? | | |
| Rollout percentage to start | | |
| Duration of pilot before full rollout | | |
| How will you measure success? | | |
| What would trigger you to disable the flag? | | |

---

## Debrief Questions

1. Why is a minor update that includes a DB migration higher-risk than a patch?
2. The auto-rollback didn't trigger even though error rate hit 8.3%. What configuration might explain this?
3. Webhooks are broken after the update because consuming systems still use SHA-1 verification. Is a platform rollback the right fix? What else could you do?
