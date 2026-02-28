# LAB-06 — Backup & Restore Sequence

**Module**: 6
**Duration**: 35 minutes
**Mode**: Live (hosted sandbox with terminal access)

---

## Scenario

Today you are completing your first backup verification cycle for Nexara Training Co.'s IMS instance. Your tasks:
1. Run a manual full backup
2. Verify its integrity
3. Restore it to a test environment
4. Validate the restore
5. Document the procedure for your DR runbook

---

## Part A: Manual Backup (10 min)

### Step 1: Connect to the Lab Terminal

In the admin console: **Admin Console → Settings → Lab Terminal** (opens a browser-based terminal)

Or: SSH to `lab-terminal.training.nexara.io` with your provided credentials.

### Step 2: Run the Backup

```bash
# Set variables
PGPASSWORD=ims_secure_password_2026
DB_HOST=localhost
DB_NAME=ims
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="/tmp/ims_backup_${TIMESTAMP}.dump"

# Full backup
PGPASSWORD=$PGPASSWORD pg_dump \
  -h $DB_HOST \
  -U postgres \
  -d $DB_NAME \
  --format=custom \
  --file=$BACKUP_FILE \
  --verbose

echo "Backup completed: $BACKUP_FILE"
ls -lh $BACKUP_FILE
```

**Record:**

| Item | Value |
|------|-------|
| Backup file path | |
| File size | |
| Backup duration (seconds) | |

### Step 3: Generate and Store Checksum

```bash
sha256sum $BACKUP_FILE > ${BACKUP_FILE}.sha256
cat ${BACKUP_FILE}.sha256
```

**Record checksum (first 16 characters):** _______________

---

## Part B: Verify Backup Integrity (5 min)

```bash
# Verify checksum
sha256sum --check ${BACKUP_FILE}.sha256

# Validate file structure (does not restore data)
pg_restore --list $BACKUP_FILE > /dev/null && echo "✓ Backup structure valid"

# List tables in backup
pg_restore --list $BACKUP_FILE | grep "TABLE DATA" | head -10
```

**Verification result:** _______________________________________________

---

## Part C: Restore to Test Database (15 min)

### Step 1: Create Target Database

```bash
PGPASSWORD=$PGPASSWORD createdb \
  -h $DB_HOST \
  -U postgres \
  ims_restore_test
```

### Step 2: Restore

```bash
PGPASSWORD=$PGPASSWORD pg_restore \
  -h $DB_HOST \
  -U postgres \
  -d ims_restore_test \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  --verbose \
  $BACKUP_FILE

echo "Restore complete"
```

**Record restore duration:** _______________

### Step 3: Validate Restore

```bash
# Check table counts
PGPASSWORD=$PGPASSWORD psql -h $DB_HOST -U postgres -d ims_restore_test \
  -c "SELECT schemaname, tablename, n_live_tup as rows
      FROM pg_stat_user_tables
      WHERE n_live_tup > 0
      ORDER BY n_live_tup DESC
      LIMIT 10;"
```

**Do the row counts look reasonable?** Yes / No

**Any tables with unexpectedly 0 rows?** _______________

### Step 4: Clean Up

```bash
PGPASSWORD=$PGPASSWORD dropdb -h $DB_HOST -U postgres ims_restore_test
echo "Test database removed"
```

---

## Part D: Document for DR Runbook (5 min)

Fill in your organisation's DR runbook template:

| Field | Your entry |
|-------|-----------|
| Backup file naming convention | |
| Backup storage location | |
| Checksum file location | |
| Who executes restore (role) | |
| Who authorises restore (role) | |
| Restore target environment | |
| Restore validation steps | |
| Maximum acceptable restore time (RTO) | |

---

## Debrief Questions

1. What is the difference between `pg_dump --format=custom` and `--format=plain`?
2. Why do we use `--no-owner` and `--no-privileges` during restore?
3. If the checksum verification failed, what would you do?
4. How would PITR differ from this pg_dump restore procedure?
