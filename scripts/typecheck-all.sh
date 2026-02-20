#!/usr/bin/env bash
# typecheck-all.sh — Run TypeScript checks across all API services, web apps, and packages.
# Exits 0 if all pass, 1 if any errors found.

set -euo pipefail

ERRORS=0
CHECKED=0

check() {
  local dir="$1"
  if [ -f "$dir/tsconfig.json" ]; then
    result=$(npx tsc --noEmit --project "$dir/tsconfig.json" 2>&1)
    CHECKED=$((CHECKED + 1))
    if [ -n "$result" ]; then
      echo "❌  $dir"
      echo "$result" | head -5
      ERRORS=$((ERRORS + 1))
    fi
  fi
}

echo "Checking TypeScript across all API services, web apps, and packages..."
echo ""

for dir in apps/api-*/; do
  check "$dir"
done

for dir in apps/web-*/; do
  check "$dir"
done

for dir in packages/*/; do
  check "$dir"
done

echo ""
echo "Checked: $CHECKED projects"

if [ "$ERRORS" -gt 0 ]; then
  echo "❌  TypeScript errors found in $ERRORS project(s)"
  exit 1
else
  echo "✅  0 TypeScript errors"
  exit 0
fi
