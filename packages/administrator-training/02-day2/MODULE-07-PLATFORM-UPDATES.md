# Module 7 — Platform Update Management

**Duration**: 60 minutes
**Position**: Day 2, 13:00–14:00
**CPD Hours**: 1.0

---

## Learning Objectives

1. Describe the Nexara IMS update lifecycle through release, staging, and production gates
2. Plan a platform update using the pre-update checklist and change management process
3. Monitor an update deployment using health checks and error dashboards
4. Execute an emergency rollback within the 30-minute SLA
5. Manage feature flags to enable/disable features independently of deployment

---

## 1. Update Lifecycle

The Nexara IMS follows a structured update lifecycle:

```
[Release]  →  [Staging Gate]  →  [Production Gate]  →  [Deployed]
    ↓                ↓                    ↓
Changelog      Automated tests      Manual sign-off
  published    + smoke tests        + pre-update
                                      checklist
```

### Update Types

| Type | Version bump | Breaking changes? | Notice period |
|------|-------------|-------------------|---------------|
| **Patch** | x.y.Z | Never | 48 hours |
| **Minor** | x.Y.z | Deprecated features only | 2 weeks |
| **Major** | X.y.z | Yes (migration required) | 4 weeks + training |

### Notification Channels

- Email to all Org Admins (automated from Nexara release system)
- Admin Console banner: "Platform update available: v2.14.3 — [View changelog]"
- Training portal release notes section
- Nexara customer Slack channel (if subscribed)

---

## 2. Pre-Update Checklist (12 Points)

Before applying any update to production, complete the following:

| # | Check | Tool |
|---|-------|------|
| 1 | Read the full changelog (all breaking changes noted) | Release notes |
| 2 | Verify backup completed and checksum valid | Admin Console → Backups |
| 3 | Confirm staging environment is running the target version | Staging admin console |
| 4 | All automated tests passed on staging | Staging CI/CD pipeline |
| 5 | Smoke tests passed on staging (key user journeys) | Manual test |
| 6 | Schedule maintenance window (minimum 30 min) | Calendar + user notification |
| 7 | Notify affected users 24h in advance | Email / in-app notification |
| 8 | Change management ticket raised and approved | Change management system |
| 9 | Rollback plan documented | Change ticket |
| 10 | Second administrator available for dual-auth (major updates) | Roster |
| 11 | Nexara Support on standby (for major updates) | Support ticket pre-opened |
| 12 | Monitoring dashboards open and baseline metrics noted | Grafana / admin console |

---

## 3. Applying an Update

**Path**: Admin Console → Settings → Platform Updates → [Available Update] → Apply

### Update Process (Automated)

1. Pre-update validation runs (30–60 seconds)
2. Current state snapshot taken (partial backup for quick rollback)
3. Database migrations applied
4. Application containers updated (zero-downtime rolling deployment)
5. Post-update smoke tests run automatically
6. Update marked as `DEPLOYED` or `FAILED`

### Monitoring During Update

**Path**: Admin Console → Settings → Platform Updates → [Current Update] → Deployment Status

| Indicator | Meaning |
|-----------|---------|
| 🟡 Updating | In progress |
| ✅ Deployed | Successful |
| ❌ Failed | Automatic rollback triggered |
| ⚠️ Degraded | Deployed but health checks failing — manual action needed |

**Grafana Dashboard** (if configured): Watch error rate, request latency, and service health during update.

---

## 4. Post-Update Validation

Run within 30 minutes of deployment:

1. **Health check all services:**
   ```bash
   curl https://your-instance.nexara.io/api/health
   ```
   Expected: `{ "status": "healthy", "version": "2.14.3" }`

2. **Smoke test key user journeys:**
   - Login and dashboard load
   - Create a test incident record
   - Run an audit log query
   - Export a report

3. **Check error dashboards** for elevated 5xx rates

4. **Review post-update audit log** entries: `UPDATE_APPLIED` event should show version, timestamp, and actor.

---

## 5. Emergency Rollback Procedure

**Rollback SLA**: Initiated within 30 minutes of confirming an update failure.

### Automatic Rollback Triggers

The platform auto-rolls-back if, within 10 minutes of deployment:
- Health check fails 3 consecutive times
- Error rate exceeds 5% for 2 consecutive minutes
- Database migration fails

### Manual Rollback Steps

**Path**: Admin Console → Settings → Platform Updates → [Current Version] → Rollback

1. Click **Initiate Rollback**
2. Confirm reason (dropdown + free text)
3. System restores to prior version snapshot (30–90 seconds)
4. Post-rollback health check runs
5. Users notified: "Platform maintenance has been completed"

### Rollback Verification

```bash
# Confirm version rolled back
curl https://your-instance.nexara.io/api/health | jq '.version'
# Should return previous version number

# Check rollback event in audit log
# Event: UPDATE_ROLLED_BACK
```

### Post-Rollback Actions

1. Notify Nexara Support with rollback reason
2. Update change management ticket: status → Rolled Back
3. Collect diagnostic data: error logs, deployment logs
4. Schedule post-mortem within 48 hours

---

## 6. Feature Flags

Feature flags allow specific features to be enabled or disabled **independently of code deployment**. This enables:
- Gradual feature rollout (10% → 50% → 100%)
- A/B testing
- Emergency disable of a specific feature without rollback
- Per-organisation feature access control

### Feature Flag Management

**Path**: Admin Console → Settings → Feature Flags

| Column | Description |
|--------|-------------|
| Flag Name | Feature identifier |
| Status | Enabled / Disabled / Partial |
| Scope | Global / Per-organisation / Per-role |
| Rollout % | Percentage of eligible users seeing the feature |
| Expiry | When the flag is automatically removed (if temporary) |

### Common Use Cases

| Scenario | Flag Action |
|----------|-------------|
| New analytics dashboard is unstable | Disable `analytics.new-dashboard` globally |
| Roll out AI features to premium tier only | Enable `ai.nlq` with scope: `ORG_TIER=ENTERPRISE` |
| A/B test new incident form | Set `incidents.new-form` to 50% rollout |
| Client reports issue with specific feature | Disable `feature.X` for that org only |

### Flag Lifecycle

```
Created (disabled) → Enabled (partial rollout) → Full rollout → Flag removed from code
```

**Warning**: Flags accumulate technical debt. Every flag should have an expiry date. Review and remove expired flags quarterly.

---

## 7. Change Management Integration

All platform updates must be logged in the IMS Change Management module:

**Required fields:**
- Change type: `Platform Update`
- Version from / version to
- Planned date and maintenance window
- Risk assessment (Low/Medium/High based on update type)
- Rollback plan
- Approval: IT Manager sign-off
- Post-change review date (within 5 business days)

---

## Module 7 Summary

| Topic | Key Takeaway |
|-------|-------------|
| Update types | Patch (48h notice) → Minor (2w) → Major (4w + training) |
| Pre-update | 12-point checklist; always backup first |
| Monitoring | Watch health, error rate, latency during deployment |
| Rollback SLA | 30 minutes; auto-triggers on health check failure |
| Feature flags | Independent of deployment; set expiry; review quarterly |
| Change management | Every update logged; approval required; post-review scheduled |

---

*Proceed to LAB-07 for the update plan and rollback scenario exercise.*
