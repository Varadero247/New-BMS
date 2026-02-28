# Module 6 — Backup & Restore Procedures

**Duration**: 90 minutes
**Position**: Day 2, 10:45–12:15
**CPD Hours**: 1.5

---

## Learning Objectives

1. Explain the IMS backup architecture including full, incremental, and WAL-archive strategies
2. Execute a manual pg_dump backup and verify integrity
3. Configure automated backup schedules with retention policies
4. Perform a restore from backup into a target environment
5. Evaluate a backup audit report and identify gaps

---

## 1. Backup Architecture

The IMS uses PostgreSQL as its primary data store. Backups operate at three levels:

| Level | Method | Frequency | Granularity |
|-------|--------|-----------|-------------|
| **Full** | pg_dump | Daily | Entire database |
| **Incremental** | pg_dump schema-specific | Hourly | Changed schemas only |
| **WAL Archive** | Continuous WAL shipping | Continuous | Per-transaction |

**Recovery Point Objective (RPO)**: ≤ 1 hour (hourly incremental) or ≤ 5 minutes with WAL archiving enabled.

**Recovery Time Objective (RTO)**: ≤ 4 hours for full restore; ≤ 1 hour for schema-level restore.

---

## 2. Manual pg_dump Backup

### Full Database Backup

```bash
PGPASSWORD=your_password pg_dump \
  -h localhost \
  -U postgres \
  -d ims \
  --format=custom \
  --file=/backups/ims_$(date +%Y%m%d_%H%M%S).dump \
  --verbose \
  --no-password
```

**Options explained:**
- `--format=custom`: Binary format; supports parallel restore; compressed
- `--file`: Output file path with timestamp
- `--verbose`: Print table names as they are dumped

### Schema-Specific Backup (Safe for Multi-Schema Systems)

```bash
PGPASSWORD=your_password pg_dump \
  -h localhost \
  -U postgres \
  -d ims \
  --schema=public \
  --schema=hs \
  --schema=env \
  --format=custom \
  --file=/backups/ims_hs_env_$(date +%Y%m%d_%H%M%S).dump
```

**Critical**: In the IMS multi-schema architecture, **never use `pg_restore` without `--schema`** — it may attempt to restore tables from other schemas.

### Backup Integrity Verification

Always verify a backup immediately after creation:

```bash
# Check backup file size (should be non-zero and reasonable)
ls -lh /backups/ims_20260228_090000.dump

# Generate SHA-256 checksum
sha256sum /backups/ims_20260228_090000.dump > /backups/ims_20260228_090000.dump.sha256

# Verify checksum
sha256sum --check /backups/ims_20260228_090000.dump.sha256

# Test-restore to /dev/null (validates file structure without restoring)
pg_restore --list /backups/ims_20260228_090000.dump > /dev/null && echo "Backup valid"
```

---

## 3. Automated Backup Schedule

### Recommended Schedule

| Job | Frequency | Retention | Storage |
|-----|-----------|-----------|---------|
| Full database dump | Daily at 01:00 | 7 days local, 30 days warm | Local SSD + cloud |
| Incremental schema dump | Every 4 hours | 48 hours local | Local SSD |
| WAL archive | Continuous | 7 days | Object storage (S3/GCS/ABS) |
| Offsite replication | Daily at 03:00 | 365 days | Offsite cloud bucket |

### Configuring via IMS Admin Console

**Path**: Admin Console → Settings → Backups → Schedule

Fields:
- `fullBackupTime`: cron expression (e.g., `0 1 * * *` for 01:00 daily)
- `incrementalFrequency`: hours between incremental backups (1–24)
- `retentionDays.local`: local hot storage retention (7 recommended)
- `retentionDays.warm`: warm storage retention (30 recommended)
- `retentionDays.cold`: cold/offsite retention (365 recommended)
- `storageProvider`: `local`, `s3`, `gcs`, `azure`
- `notifyOnFailure`: admin email(s) for backup failure alerts

### Configuring WAL Archiving (Advanced)

Edit `postgresql.conf`:
```
wal_level = replica
archive_mode = on
archive_command = 'aws s3 cp %p s3://nexara-ims-wal/%f'
```

Or configure via Admin Console → Settings → Backups → WAL Archive.

---

## 4. Restore Procedure

### Pre-Restore Checklist

Before any restore:
- [ ] Confirm backup file exists and checksum matches
- [ ] Confirm target environment (production, staging, DR)
- [ ] Notify affected users (scheduled maintenance window)
- [ ] Document the restore request in the change management system
- [ ] Confirm rollback plan if restore fails

### Restore to Staging Environment

```bash
# Step 1: Create empty target database
createdb -h staging-db -U postgres ims_restore

# Step 2: Restore from backup
pg_restore \
  -h staging-db \
  -U postgres \
  -d ims_restore \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  /backups/ims_20260228_090000.dump

# Step 3: Verify row counts
psql -h staging-db -U postgres -d ims_restore \
  -c "SELECT schemaname, tablename, n_live_tup FROM pg_stat_user_tables ORDER BY n_live_tup DESC LIMIT 20;"
```

### Restore to Production (DR Scenario)

**Warning**: Production restore must be authorised by two named administrators. Log the authorisation in the change management system.

```bash
# Step 1: Stop all application services
systemctl stop nexara-api-* nexara-web-*

# Step 2: Drop and recreate production database
psql -h prod-db -U postgres -c "DROP DATABASE ims WITH (FORCE);"
psql -h prod-db -U postgres -c "CREATE DATABASE ims;"

# Step 3: Restore
pg_restore \
  -h prod-db \
  -U postgres \
  -d ims \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  /backups/ims_20260228_090000.dump

# Step 4: Run Prisma migrations (to ensure schema consistency)
cd /opt/nexara && npx prisma migrate deploy --schema=prisma/schemas/core.prisma

# Step 5: Start services
systemctl start nexara-api-* nexara-web-*

# Step 6: Run smoke tests
curl -f http://localhost:4000/health && echo "Gateway healthy"
```

---

## 5. Disaster Recovery Runbook

### DR Invocation Criteria

Invoke the DR procedure when:
- Production database is inaccessible for > 30 minutes
- Data corruption detected in production
- Ransomware or destructive attack confirmed
- Catastrophic infrastructure failure

### DR Runbook Steps

| Step | Action | Responsible | SLA |
|------|--------|-------------|-----|
| 1 | Declare DR incident in change management | IT Manager | T+0 |
| 2 | Notify stakeholders and Nexara Support | IT Manager | T+5 min |
| 3 | Identify most recent clean backup | Database Admin | T+10 min |
| 4 | Provision DR environment (if not pre-provisioned) | Infrastructure | T+20 min |
| 5 | Restore from backup | Database Admin | T+60 min |
| 6 | Validate restore (row counts, application smoke tests) | QA / Admin | T+75 min |
| 7 | Update DNS / load balancer to DR environment | Infrastructure | T+80 min |
| 8 | Notify users: service restored | IT Manager | T+85 min |
| 9 | Post-incident review scheduled | IT Manager | T+24 hours |

### Point-in-Time Recovery (PITR)

If WAL archiving is enabled and you need to recover to a specific moment (e.g., just before a destructive operation at 14:27):

```bash
# In recovery.conf (PostgreSQL 11) or postgresql.conf (PostgreSQL 12+):
restore_command = 'aws s3 cp s3://nexara-ims-wal/%f %p'
recovery_target_time = '2026-02-28 14:26:59'
recovery_target_action = 'promote'
```

---

## 6. Backup Audit Report

**Path**: Admin Console → Settings → Backups → Audit Report

The report shows for the last 30 days:
- Daily backup success/failure count and timing
- File sizes and compression ratio
- Checksum verification results
- Offsite replication status
- Last successful restore test date

### Red Flags in Backup Audit Report

| Red Flag | Action |
|----------|--------|
| Any daily backup failure | Investigate immediately; re-run manual backup |
| Backup file size drop > 20% vs. prior day | Potential data loss; investigate |
| Checksum mismatch | Do not use this backup; investigate storage corruption |
| Offsite replication gap > 48 hours | Check storage provider connectivity |
| No restore test in > 30 days | Schedule test-restore to staging this week |

---

## Module 6 Summary

| Topic | Key Takeaway |
|-------|-------------|
| Architecture | Full daily + incremental hourly + WAL continuous |
| pg_dump | Custom format; schema-specific; verify with SHA-256 |
| Schedule | Automate; 7-day hot / 30-day warm / 365-day cold retention |
| Restore | Pre-restore checklist; two-admin authorisation for production |
| DR | 8-step runbook; RTO ≤ 4 hours |
| Audit | Monthly review; any failure = immediate action |

---

*Proceed to LAB-06 for hands-on backup and restore sequence.*
