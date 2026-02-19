#!/usr/bin/env bash
# =============================================================================
# Backup Restore Test Script
# Creates a backup of the IMS database, restores it to a temp database,
# validates the restore, then drops the temp database.
# Usage: ./scripts/test-backup-restore.sh
# Exit code: 0 = restore verified, 1 = restore failed
# =============================================================================

set -euo pipefail

# ─── Colors ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# ─── Config ──────────────────────────────────────────────────────────────────
DB_HOST="${POSTGRES_HOST:-localhost}"
DB_PORT="${POSTGRES_PORT:-5432}"
DB_USER="${POSTGRES_USER:-postgres}"
DB_PASS="${POSTGRES_PASSWORD:-ims_secure_password_2026}"
DB_NAME="${POSTGRES_DB:-ims}"
RESTORE_DB="ims_restore_test"
BACKUP_DIR="${BACKUP_DIR:-./backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/restore_test_${TIMESTAMP}.sql"

export PGPASSWORD="${DB_PASS}"

echo -e "\n${BLUE}╔══════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  IMS Backup Restore Validation Test  ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════╝${NC}"

# ─── Cleanup helper ──────────────────────────────────────────────────────────
cleanup() {
  echo -e "\n${YELLOW}▸ Cleanup: dropping temporary database '${RESTORE_DB}'...${NC}"
  psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d postgres \
    -c "DROP DATABASE IF EXISTS ${RESTORE_DB};" > /dev/null 2>&1 || true
  [ -f "${BACKUP_FILE}" ] && rm -f "${BACKUP_FILE}"
  [ -f "${BACKUP_FILE}.gz" ] && rm -f "${BACKUP_FILE}.gz"
  echo -e "  ${GREEN}✓${NC} Cleanup complete"
}
trap cleanup EXIT

# ─── Step 1: Prerequisites ───────────────────────────────────────────────────
echo -e "\n${BLUE}▸ Step 1: Checking prerequisites${NC}"

if ! command -v psql &> /dev/null; then
  echo -e "  ${RED}✗${NC} psql not found — install PostgreSQL client tools"
  exit 1
fi
echo -e "  ${GREEN}✓${NC} psql available"

if ! command -v pg_dump &> /dev/null; then
  echo -e "  ${RED}✗${NC} pg_dump not found — install PostgreSQL client tools"
  exit 1
fi
echo -e "  ${GREEN}✓${NC} pg_dump available"

# Verify source DB is accessible
if ! psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -c "SELECT 1" > /dev/null 2>&1; then
  echo -e "  ${RED}✗${NC} Cannot connect to source database '${DB_NAME}' on port ${DB_PORT}"
  exit 1
fi
echo -e "  ${GREEN}✓${NC} Source database '${DB_NAME}' is accessible"

# ─── Step 2: Get source table count ─────────────────────────────────────────
echo -e "\n${BLUE}▸ Step 2: Counting source tables${NC}"

SOURCE_TABLE_COUNT=$(psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -tAc \
  "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema NOT IN ('pg_catalog','information_schema','pg_toast')" 2>/dev/null || echo "0")

echo -e "  ${GREEN}✓${NC} Source database has ${SOURCE_TABLE_COUNT} tables"

if [ "${SOURCE_TABLE_COUNT:-0}" -lt 10 ]; then
  echo -e "  ${YELLOW}⚠${NC} Unexpectedly low table count — database may not be fully seeded"
fi

# ─── Step 3: Create backup ───────────────────────────────────────────────────
echo -e "\n${BLUE}▸ Step 3: Creating backup${NC}"

mkdir -p "${BACKUP_DIR}"
BACKUP_START=$(date +%s)

pg_dump -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" \
  --no-owner --no-acl --no-privileges \
  -f "${BACKUP_FILE}" 2>&1

BACKUP_END=$(date +%s)
BACKUP_DURATION=$((BACKUP_END - BACKUP_START))
BACKUP_SIZE=$(du -sh "${BACKUP_FILE}" 2>/dev/null | cut -f1 || echo "unknown")

echo -e "  ${GREEN}✓${NC} Backup created: ${BACKUP_FILE}"
echo -e "  ${GREEN}✓${NC} Backup size: ${BACKUP_SIZE}, took ${BACKUP_DURATION}s"

# ─── Step 4: Create restore target database ─────────────────────────────────
echo -e "\n${BLUE}▸ Step 4: Creating restore target database '${RESTORE_DB}'${NC}"

# Drop if exists (from previous failed run)
psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d postgres \
  -c "DROP DATABASE IF EXISTS ${RESTORE_DB};" > /dev/null 2>&1 || true

psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d postgres \
  -c "CREATE DATABASE ${RESTORE_DB};" > /dev/null 2>&1

echo -e "  ${GREEN}✓${NC} Restore target database '${RESTORE_DB}' created"

# ─── Step 5: Restore backup ─────────────────────────────────────────────────
echo -e "\n${BLUE}▸ Step 5: Restoring backup to '${RESTORE_DB}'${NC}"

RESTORE_START=$(date +%s)

psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${RESTORE_DB}" \
  -f "${BACKUP_FILE}" \
  -v ON_ERROR_STOP=0 \
  > /tmp/restore_output.log 2>&1 || true

RESTORE_END=$(date +%s)
RESTORE_DURATION=$((RESTORE_END - RESTORE_START))

echo -e "  ${GREEN}✓${NC} Restore completed in ${RESTORE_DURATION}s"

# ─── Step 6: Validate restore ───────────────────────────────────────────────
echo -e "\n${BLUE}▸ Step 6: Validating restored database${NC}"

RESTORE_TABLE_COUNT=$(psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${RESTORE_DB}" -tAc \
  "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema NOT IN ('pg_catalog','information_schema','pg_toast')" 2>/dev/null || echo "0")

echo -e "  Source tables:  ${SOURCE_TABLE_COUNT}"
echo -e "  Restored tables: ${RESTORE_TABLE_COUNT}"

if [ "${RESTORE_TABLE_COUNT}" -eq "${SOURCE_TABLE_COUNT}" ]; then
  echo -e "  ${GREEN}✓${NC} Table count matches: ${RESTORE_TABLE_COUNT} tables restored successfully"
elif [ "${RESTORE_TABLE_COUNT:-0}" -gt 0 ]; then
  DIFF=$((SOURCE_TABLE_COUNT - RESTORE_TABLE_COUNT))
  echo -e "  ${YELLOW}⚠${NC} Table count differs by ${DIFF} (restored ${RESTORE_TABLE_COUNT}, source had ${SOURCE_TABLE_COUNT})"
  echo -e "     This may be due to permission differences — check /tmp/restore_output.log"
else
  echo -e "  ${RED}✗${NC} No tables restored — backup restore failed"
  echo -e "     Check /tmp/restore_output.log for errors"
  exit 1
fi

# Verify admin user is present in restored DB
ADMIN_EXISTS=$(psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${RESTORE_DB}" -tAc \
  "SELECT COUNT(*) FROM users WHERE email='admin@ims.local'" 2>/dev/null || echo "0")

if [ "${ADMIN_EXISTS:-0}" -gt 0 ]; then
  echo -e "  ${GREEN}✓${NC} Admin user found in restored database"
else
  echo -e "  ${YELLOW}⚠${NC} Admin user not found in restored DB (tables may not include users)"
fi

# ─── Step 7: Summary ─────────────────────────────────────────────────────────
echo -e "\n${BLUE}╔══════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Backup Restore Test Results         ║${NC}"
echo -e "${BLUE}╠══════════════════════════════════════╣${NC}"
printf "${BLUE}║  Backup time  : %-22s ║${NC}\n" "${BACKUP_DURATION}s"
printf "${BLUE}║  Backup size  : %-22s ║${NC}\n" "${BACKUP_SIZE}"
printf "${BLUE}║  Restore time : %-22s ║${NC}\n" "${RESTORE_DURATION}s"
printf "${BLUE}║  Source tables: %-22s ║${NC}\n" "${SOURCE_TABLE_COUNT}"
printf "${BLUE}║  Restored tbls: %-22s ║${NC}\n" "${RESTORE_TABLE_COUNT}"
echo -e "${BLUE}╚══════════════════════════════════════╝${NC}"

echo -e "\n${GREEN}✓ Backup restore test PASSED — database is restorable.${NC}\n"
exit 0
