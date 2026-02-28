# Slide Deck Outline — Module 7: Platform Update Management

**Slides**: ~22
**Duration**: 60 minutes

---

## Slide Structure

| # | Slide Title | Type | Key Content |
|---|-------------|------|-------------|
| 1 | Module 7: Platform Update Management | Title | "A calm, planned update is a boring update. That's the goal." |
| 2 | Update Lifecycle | Flow diagram | Release → Staging Gate → Production Gate → Deployed |
| 3 | Update Types | Comparison table | Patch (48h) / Minor (2w) / Major (4w + training); breaking change indicator |
| 4 | Notification Channels | List | Email / Admin Console banner / Slack / Changelog |
| 5 | Pre-Update Checklist: Points 1–6 | Checklist | Read changelog / Verify backup / Staging tested / Automated tests / Smoke tests / Maintenance window |
| 6 | Pre-Update Checklist: Points 7–12 | Checklist | Notify users / Change ticket / Rollback plan / Second admin / Support standby / Monitoring open |
| 7 | Applying the Update | Screenshot | Admin console update UI with status indicators |
| 8 | Monitoring During Update | Dashboard screenshot | Grafana: error rate / latency / health check indicators |
| 9 | Update Status Indicators | Status table | 🟡 Updating / ✅ Deployed / ❌ Failed / ⚠️ Degraded |
| 10 | Post-Update Validation | 4-step list | Health check / Smoke tests / Error dashboard / Audit log |
| 11 | Rollback SLA | Timer graphic | 30 minutes from incident confirmation |
| 12 | Auto-Rollback Triggers | Threshold graphic | Health check fails ×3 / Error rate > 5% for 2 min / Migration fails |
| 13 | Manual Rollback Steps | Numbered steps | 5 steps in admin console |
| 14 | Rollback Verification | Code block | curl /api/health; expected version; audit log check |
| 15 | Post-Rollback Actions | 4-item list | Notify Support / Update change ticket / Collect diagnostics / Schedule post-mortem |
| 16 | Feature Flags: What Are They? | Explainer | Independent of deployment; per-org/role/percentage |
| 17 | Feature Flag Management | Screenshot | Admin console feature flags table |
| 18 | Feature Flag Use Cases | Table | 4 scenarios: disable unstable feature / premium tier / A/B test / per-org disable |
| 19 | Feature Flag Lifecycle | Flow | Created → Partial rollout → Full rollout → Removed from code |
| 20 | Change Management Integration | Form screenshot | Required fields for platform update change ticket |
| 21 | Module 7: Key Takeaways | Summary | 6 takeaways |
| 22 | LAB-07 Instructions + Assessment Preview | Lab + transition | Update plan exercise; then assessment preview at 14:15 |
