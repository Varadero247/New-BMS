#!/usr/bin/env bash
# Backup Restore Verification Script
# Tests that the backup -> restore pipeline works end-to-end.
# Creates a real pg_dump, restores it into a temporary database, runs sanity
# checks, then cleans up.  Exits 0 on success, 1 on any failure.
#
# Usage:
#   ./scripts/verify-backup-restore.sh
#
# Environment variables (all optional):
#   BACKUP_DIR         -- directory to write the test backup   (default: ./backups)
#   PG_USER            -- postgres superuser                   (default: postgres)
#   PG_PASSWORD        -- postgres password
#   SOURCE_DB          -- database to back up                  (default: ims)
#   DOCKER_CONTAINER   -- docker container name                (default: ims-postgres)

set -euo pipefail

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="${BACKUP_DIR:-./backups}"
PG_USER="${PG_USER:-postgres}"
PG_PASSWORD="${PG_PASSWORD:-ims_secure_password_2026}"
SOURCE_DB="${SOURCE_DB:-ims}"
DOCKER_CONTAINER="${DOCKER_CONTAINER:-ims-postgres}"
TEST_DB="ims_restore_test_${TIMESTAMP}"
BACKUP_FILE="$BACKUP_DIR/restore_test_${TIMESTAMP}.sql.gz"
export DOCKER_API_VERSION="${DOCKER_API_VERSION:-1.41}"

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
PASS=0
FAIL=0

pass() {
  echo "  [PASS] $1"
  PASS=$((PASS + 1))
}

fail() {
  echo "  [FAIL] $1"
  FAIL=$((FAIL + 1))
}

info() {
  echo "  [INFO] $1"
}

# Run a single-value query inside the container, returning trimmed output.
docker_psql_query() {
  local db="$1"
  local query="$2"
  DOCKER_API_VERSION=$DOCKER_API_VERSION \
    docker exec "$DOCKER_CONTAINER" \
    psql -U "$PG_USER" -d "$db" -tAc "$query" 2>/dev/null | tr -d '[:space:]'
}

# ---------------------------------------------------------------------------
# Header
# ---------------------------------------------------------------------------
echo ""
echo "============================================"
echo "  IMS -- Backup Restore Verification"
echo "  $(date '+%Y-%m-%d %H:%M:%S')"
echo "============================================"
echo ""
echo "  Source DB  : $SOURCE_DB"
echo "  Test DB    : $TEST_DB"
echo "  Backup file: $BACKUP_FILE"
echo ""

# ---------------------------------------------------------------------------
# Step 1: Ensure backup directory exists
# ---------------------------------------------------------------------------
echo "[1/6] Creating backup directory..."
mkdir -p "$BACKUP_DIR"
pass "Backup directory ready: $BACKUP_DIR"

# ---------------------------------------------------------------------------
# Step 2: Create test backup via pg_dump inside the container
# ---------------------------------------------------------------------------
echo ""
echo "[2/6] Creating test backup (pg_dump | gzip)..."

if DOCKER_API_VERSION=$DOCKER_API_VERSION \
    docker exec "$DOCKER_CONTAINER" \
    pg_dump -U "$PG_USER" -d "$SOURCE_DB" \
    --no-owner --no-acl --clean --if-exists \
    | gzip > "$BACKUP_FILE"; then
  BACKUP_SIZE=$(du -sh "$BACKUP_FILE" 2>/dev/null | cut -f1 || echo "unknown")
  pass "Backup created: $BACKUP_FILE ($BACKUP_SIZE)"
else
  fail "pg_dump failed -- cannot continue"
  echo ""
  echo "============================================"
  echo "  RESULT: FAIL  (pass=$PASS  fail=$FAIL)"
  echo "============================================"
  exit 1
fi

# ---------------------------------------------------------------------------
# Step 3: Create temporary restore database
# ---------------------------------------------------------------------------
echo ""
echo "[3/6] Creating temporary test database: $TEST_DB..."

if DOCKER_API_VERSION=$DOCKER_API_VERSION \
    docker exec "$DOCKER_CONTAINER" \
    psql -U "$PG_USER" -d postgres \
    -c "CREATE DATABASE \"$TEST_DB\";" > /dev/null 2>&1; then
  pass "Test database created: $TEST_DB"
else
  fail "Failed to create test database $TEST_DB"
  rm -f "$BACKUP_FILE"
  echo ""
  echo "============================================"
  echo "  RESULT: FAIL  (pass=$PASS  fail=$FAIL)"
  echo "============================================"
  exit 1
fi

# ---------------------------------------------------------------------------
# Step 4: Restore backup into test database
# ---------------------------------------------------------------------------
echo ""
echo "[4/6] Restoring backup into $TEST_DB..."

RESTORE_LOG="/tmp/ims_restore_${TIMESTAMP}.txt"
RESTORE_EXIT=0
zcat "$BACKUP_FILE" | \
  DOCKER_API_VERSION=$DOCKER_API_VERSION \
  docker exec -i "$DOCKER_CONTAINER" \
  psql -U "$PG_USER" -d "$TEST_DB" -v ON_ERROR_STOP=0 \
  > "$RESTORE_LOG" 2>&1 || RESTORE_EXIT=$?

RESTORE_ERRORS=$(grep -c "^ERROR:" "$RESTORE_LOG" 2>/dev/null || true)

if [ "$RESTORE_ERRORS" -eq 0 ]; then
  pass "Restore completed with 0 SQL ERRORs (psql exit=$RESTORE_EXIT)"
else
  fail "Restore produced $RESTORE_ERRORS SQL ERROR(s) -- see $RESTORE_LOG"
fi

# ---------------------------------------------------------------------------
# Step 5: Sanity checks on restored database
# ---------------------------------------------------------------------------
echo ""
echo "[5/6] Running sanity checks on restored database..."

# 5a: Table count > 0
TABLE_COUNT=$(docker_psql_query "$TEST_DB" \
  "SELECT count(*) FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE';")

if [ -n "$TABLE_COUNT" ] && [ "$TABLE_COUNT" -gt 0 ] 2>/dev/null; then
  pass "Table count in restored DB: $TABLE_COUNT (> 0)"
else
  fail "Table count is 0 or unreadable -- restore may have failed silently"
fi

# 5b: Key tables exist (warn-only -- not every schema has these at the public level)
KEY_TABLES=("users" "organisations")
for tbl in "${KEY_TABLES[@]}"; do
  EXISTS=$(docker_psql_query "$TEST_DB" \
    "SELECT count(*) FROM information_schema.tables \
     WHERE table_schema='public' AND table_name='$tbl';")
  if [ "$EXISTS" = "1" ]; then
    pass "Key table exists: $tbl"
  else
    info "Table not found in public schema: $tbl (may use a different schema)"
  fi
done

# 5c: Row count query on any public table (proves connectivity and basic read)
SAMPLE_TABLE=$(docker_psql_query "$TEST_DB" \
  "SELECT table_name FROM information_schema.tables \
   WHERE table_schema='public' AND table_type='BASE TABLE' LIMIT 1;")

if [ -n "$SAMPLE_TABLE" ]; then
  ROW_COUNT=$(docker_psql_query "$TEST_DB" "SELECT count(*) FROM \"$SAMPLE_TABLE\";")
  pass "Row count query on sample table '$SAMPLE_TABLE': $ROW_COUNT rows"
else
  fail "Could not find any table to query in the restored DB"
fi

# ---------------------------------------------------------------------------
# Step 6: Cleanup
# ---------------------------------------------------------------------------
echo ""
echo "[6/6] Cleaning up..."

if DOCKER_API_VERSION=$DOCKER_API_VERSION \
    docker exec "$DOCKER_CONTAINER" \
    psql -U "$PG_USER" -d postgres \
    -c "DROP DATABASE IF EXISTS \"$TEST_DB\";" > /dev/null 2>&1; then
  pass "Test database dropped: $TEST_DB"
else
  fail "Failed to drop test database $TEST_DB -- remove manually"
fi

rm -f "$BACKUP_FILE" "$RESTORE_LOG"
pass "Temporary files removed"

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------
echo ""
echo "============================================"
if [ "$FAIL" -eq 0 ]; then
  echo "  RESULT: PASS  (pass=$PASS  fail=$FAIL)"
else
  echo "  RESULT: FAIL  (pass=$PASS  fail=$FAIL)"
fi
echo "============================================"
echo ""

[ "$FAIL" -eq 0 ]
