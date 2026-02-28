# Nexara IMS — Administrator Quick Reference Card

*Laminated one-pager for day-to-day administration*

---

## Service Ports (Key Services)

| Service | Port | URL |
|---------|------|-----|
| API Gateway | 4000 | `http://localhost:4000` |
| Admin Console | 3027 | `http://localhost:3027` |
| Health & Safety | 4001 / 3001 | |
| Environment | 4002 / 3002 | |
| Quality | 4003 / 3003 | |
| HR | 4006 / 3006 | |
| Finance | 4013 / 3013 | |
| InfoSec | 4015 / 3015 | |
| Dashboard | — | `http://localhost:3000` |
| Training Portal | — | `http://localhost:3046` |

---

## SCIM Endpoints

| Action | Method | Endpoint |
|--------|--------|----------|
| List users | GET | `/scim/v2/Users` |
| Create user | POST | `/scim/v2/Users` |
| Update user | PUT/PATCH | `/scim/v2/Users/{id}` |
| Deprovision user | DELETE | `/scim/v2/Users/{id}` |
| List groups | GET | `/scim/v2/Groups` |

**Auth**: `Authorization: Bearer {SCIM_TOKEN}`

---

## Permission Levels

| Level | Name | Can do |
|-------|------|--------|
| 0 | NONE | No access |
| 1 | VIEW | Read only |
| 2 | COMMENT | Read + comment |
| 3 | CREATE | + Create records |
| 4 | EDIT | + Edit records |
| 5 | DELETE | + Delete records |
| 6 | ADMIN | + Module config |

---

## Key Admin Roles

| Role | Identifier |
|------|-----------|
| Super Administrator | `SUPER_ADMIN` |
| Organisation Admin | `ORG_ADMIN` |
| Module Admin | `MODULE_ADMIN` |
| Auditor (read-all) | `AUDITOR` |
| Viewer (read-assigned) | `VIEWER` |

---

## Audit Event Categories

| Code | Category |
|------|----------|
| AUTH | Authentication events |
| DATA | Data CRUD operations |
| ADMIN | User/role/module changes |
| INTEGRATION | API/OAuth/SCIM/Webhook |
| SYSTEM | Backup/update/alert |

---

## Backup Commands

```bash
# Full backup
pg_dump -h localhost -U postgres -d ims \
  --format=custom \
  --file=/backups/ims_$(date +%Y%m%d_%H%M%S).dump

# Verify
sha256sum /backups/ims_YYYYMMDD.dump

# Restore
pg_restore -h localhost -U postgres -d ims \
  --clean --if-exists --no-owner \
  /backups/ims_YYYYMMDD.dump
```

---

## Update Pre-Checklist (12 points)

1. Read changelog
2. Backup verified
3. Staging on target version
4. Automated tests passed
5. Smoke tests passed
6. Maintenance window scheduled
7. Users notified (24h)
8. Change ticket raised
9. Rollback plan documented
10. Second admin available
11. Nexara Support on standby (major)
12. Monitoring dashboards open

---

## Rollback SLA

**30 minutes** from incident confirmation to rollback initiation.

Auto-rollback triggers:
- Health check fails × 3
- Error rate > 5% for 2 min
- Migration fails

---

## Pass/Fail Criteria

| Grade | Score |
|-------|-------|
| Fail | < 75% |
| Pass | 75–89% |
| Distinction | ≥ 90% |

---

## Quick Links

- Admin Console: `/admin`
- Audit Log: `/admin/audit-log`
- Module Registry: `/admin/modules`
- Integrations: `/admin/integrations`
- Backups: `/admin/settings/backups`
- Platform Updates: `/admin/settings/updates`
- Feature Flags: `/admin/settings/flags`

---

*© 2026 Nexara DMCC — For certified administrators only*
