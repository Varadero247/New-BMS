#!/usr/bin/env bash
# =============================================================================
# scripts/rotate-secrets.sh
# JWT and session secret rotation for the Nexara IMS platform.
#
# What this does:
#   1. Generates new JWT_SECRET and JWT_REFRESH_SECRET values
#   2. Updates the root .env file and all 42 API service .env files
#   3. Prints a summary of what was changed (no secrets printed to stdout)
#   4. Instructs operator to restart services
#
# Usage:
#   ./scripts/rotate-secrets.sh [--dry-run] [--apply]
#
# IMPORTANT: After rotation, ALL active JWT tokens will be invalidated.
#            All logged-in users will need to re-authenticate.
# =============================================================================

set -euo pipefail

# ─── Args ────────────────────────────────────────────────────────────────────
DRY_RUN=false
APPLY=false

for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=true ;;
    --apply)   APPLY=true ;;
    *)
      echo "Unknown argument: $arg"
      echo "Usage: $0 [--dry-run] [--apply]"
      exit 1
      ;;
  esac
done

if [[ "$DRY_RUN" == "false" && "$APPLY" == "false" ]]; then
  echo "ERROR: You must specify either --dry-run or --apply"
  echo "  --dry-run  Show what would change without modifying any files"
  echo "  --apply    Generate new secrets and update all .env files"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "==================================================================="
echo "  Nexara IMS — JWT Secret Rotation"
echo "==================================================================="
echo ""
echo "  This script rotates JWT_SECRET and JWT_REFRESH_SECRET across all"
echo "  42 API service .env files."
echo ""
echo "  ⚠️  After rotation, all active sessions will be invalidated."
echo "     Users will need to log in again."
echo ""

# ─── Generate new secrets ────────────────────────────────────────────────────
NEW_JWT_SECRET=$(openssl rand -hex 64)
NEW_JWT_REFRESH_SECRET=$(openssl rand -hex 64)

JWT_SECRET_SUFFIX="${NEW_JWT_SECRET: -8}"
REFRESH_SECRET_SUFFIX="${NEW_JWT_REFRESH_SECRET: -8}"

echo "  New JWT_SECRET:         ...${JWT_SECRET_SUFFIX} (128 hex chars)"
echo "  New JWT_REFRESH_SECRET: ...${REFRESH_SECRET_SUFFIX} (128 hex chars)"
echo ""

# ─── Find all .env files ─────────────────────────────────────────────────────
ENV_FILES=()

# Root .env
[[ -f "$REPO_ROOT/.env" ]] && ENV_FILES+=("$REPO_ROOT/.env")

# All API service .env files
while IFS= read -r -d '' f; do
  ENV_FILES+=("$f")
done < <(find "$REPO_ROOT/apps" -maxdepth 3 -name ".env" -print0 | sort -z)

# packages/database .env
[[ -f "$REPO_ROOT/packages/database/.env" ]] && ENV_FILES+=("$REPO_ROOT/packages/database/.env")

UPDATED=0
SKIPPED=0

echo "  Scanning ${#ENV_FILES[@]} .env files..."
echo ""

for ENV_FILE in "${ENV_FILES[@]}"; do
  REL_PATH="${ENV_FILE#$REPO_ROOT/}"

  HAS_JWT=false
  HAS_REFRESH=false

  grep -q "^JWT_SECRET=" "$ENV_FILE" 2>/dev/null && HAS_JWT=true
  grep -q "^JWT_REFRESH_SECRET=" "$ENV_FILE" 2>/dev/null && HAS_REFRESH=true

  if [[ "$HAS_JWT" == "false" && "$HAS_REFRESH" == "false" ]]; then
    SKIPPED=$((SKIPPED + 1))
    continue
  fi

  echo "  ✔ $REL_PATH"
  [[ "$HAS_JWT" == "true" ]] && echo "    JWT_SECRET found"
  [[ "$HAS_REFRESH" == "true" ]] && echo "    JWT_REFRESH_SECRET found"

  if [[ "$DRY_RUN" == "false" ]]; then
    # Backup the file
    cp "$ENV_FILE" "${ENV_FILE}.bak.$(date +%Y%m%d%H%M%S)"

    # Replace JWT_SECRET (not JWT_REFRESH_SECRET) on exact match
    if [[ "$HAS_JWT" == "true" ]]; then
      # Use a temporary file approach to avoid sed portability issues
      TMPFILE=$(mktemp)
      while IFS= read -r line; do
        if [[ "$line" =~ ^JWT_SECRET= ]]; then
          echo "JWT_SECRET=${NEW_JWT_SECRET}"
        else
          echo "$line"
        fi
      done < "$ENV_FILE" > "$TMPFILE"
      mv "$TMPFILE" "$ENV_FILE"
    fi

    if [[ "$HAS_REFRESH" == "true" ]]; then
      TMPFILE=$(mktemp)
      while IFS= read -r line; do
        if [[ "$line" =~ ^JWT_REFRESH_SECRET= ]]; then
          echo "JWT_REFRESH_SECRET=${NEW_JWT_REFRESH_SECRET}"
        else
          echo "$line"
        fi
      done < "$ENV_FILE" > "$TMPFILE"
      mv "$TMPFILE" "$ENV_FILE"
    fi
  fi

  UPDATED=$((UPDATED + 1))
done

echo ""
echo "-------------------------------------------------------------------"
if [[ "$DRY_RUN" == "true" ]]; then
  echo "  DRY RUN — No files were modified."
  echo "  ${UPDATED} files would be updated, ${SKIPPED} files skipped."
else
  echo "  ✅ Rotation complete."
  echo "  ${UPDATED} files updated, ${SKIPPED} files skipped."
  echo ""
  echo "  Backup files created with .bak.YYYYMMDDHHMMSS suffix."
  echo "  To clean up backups: find . -name '*.bak.*' -delete"
  echo ""
  echo "  NEXT STEPS:"
  echo "  1. Restart all 42 API services (or rolling restart in K8s):"
  echo "     Docker:  docker compose restart"
  echo "     K8s:     kubectl rollout restart deployment -n ims"
  echo ""
  echo "  2. Verify services are healthy:"
  echo "     ./scripts/check-services.sh"
  echo ""
  echo "  3. Test authentication:"
  echo "     curl -X POST http://localhost:4000/api/auth/login \\"
  echo "       -H 'Content-Type: application/json' \\"
  echo "       -d '{\"email\":\"admin@ims.local\",\"password\":\"admin123\"}'"
  echo ""
  echo "  4. If K8s, update the ims-secrets Secret:"
  echo "     kubectl patch secret ims-secrets -n ims \\"
  echo "       -p '{\"stringData\":{\"JWT_SECRET\":\"<new-value>\",\"JWT_REFRESH_SECRET\":\"<new-value>\"}}'"
fi
echo "==================================================================="
