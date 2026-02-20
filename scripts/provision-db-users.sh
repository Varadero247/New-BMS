#!/usr/bin/env bash
# =============================================================================
# IMS: Provision per-service PostgreSQL database users
# FINDING-012: Implement least-privilege DB access (ISO 27001 A.9.4 / CWE-250)
#
# USAGE:
#   PGPASSWORD=<superuser-password> ./scripts/provision-db-users.sh [--dry-run]
#
# PREREQUISITES:
#   - PostgreSQL superuser credentials in environment
#   - Database 'ims' must exist and be seeded
#
# ENVIRONMENT VARIABLES:
#   PGHOST      PostgreSQL host (default: localhost)
#   PGPORT      PostgreSQL port (default: 5432)
#   PGUSER      PostgreSQL superuser (default: postgres)
#   PGPASSWORD  PostgreSQL password (required)
#   PGDATABASE  Database name (default: ims)
# =============================================================================

set -euo pipefail

PGHOST="${PGHOST:-localhost}"
PGPORT="${PGPORT:-5432}"
PGUSER="${PGUSER:-postgres}"
PGDATABASE="${PGDATABASE:-ims}"
DRY_RUN="${1:-}"

if [ -z "${PGPASSWORD:-}" ]; then
    echo "ERROR: PGPASSWORD environment variable is required"
    exit 1
fi

echo "=== IMS Per-Service DB User Provisioning ==="
echo "Host:     $PGHOST:$PGPORT"
echo "Database: $PGDATABASE"
echo "User:     $PGUSER"
echo ""

if [ "$DRY_RUN" = "--dry-run" ]; then
    echo "DRY RUN — showing SQL that would be executed:"
    echo ""
    cat "$(dirname "$0")/create-db-users.sql"
    exit 0
fi

echo "Applying per-service DB user grants..."
PGPASSWORD="$PGPASSWORD" psql \
    -h "$PGHOST" \
    -p "$PGPORT" \
    -U "$PGUSER" \
    -d "$PGDATABASE" \
    -v ON_ERROR_STOP=0 \
    -f "$(dirname "$0")/create-db-users.sql"

echo ""
echo "=== Post-Provisioning Steps ==="
echo ""
echo "1. Set per-service passwords (replace with secure values):"
echo "   psql -U postgres -d ims -c \"ALTER ROLE ims_hr WITH PASSWORD 'secure-password-here';\""
echo ""
echo "2. Update each service's DATABASE_URL in their .env file:"
echo "   apps/api-hr/.env:      HR_DATABASE_URL=postgresql://ims_hr:<password>@localhost:5432/ims"
echo "   apps/api-payroll/.env: PAYROLL_DATABASE_URL=postgresql://ims_payroll:<password>@localhost:5432/ims"
echo "   ... (see docs/DATABASE_ARCHITECTURE.md for full mapping)"
echo ""
echo "3. Verify access restrictions:"
echo "   psql -U ims_hr -d ims -c \"SELECT 1 FROM hr_employees LIMIT 1;\"   # Should work"
echo "   psql -U ims_hr -d ims -c \"SELECT 1 FROM payroll_payslips LIMIT 1;\" # Should FAIL"
echo ""
echo "Done."
