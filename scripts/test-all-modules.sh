#!/bin/bash
# Master test runner - runs ALL integration test scripts sequentially
# Tracks pass/fail per module and prints a summary table at the end

set -o pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Module test scripts in order
MODULES=(
  "test-hs-modules.sh:Health & Safety"
  "test-env-modules.sh:Environment"
  "test-quality-modules.sh:Quality"
  "test-hr-modules.sh:HR"
  "test-payroll-modules.sh:Payroll"
  "test-inventory-modules.sh:Inventory"
  "test-workflows-modules.sh:Workflows"
  "test-pm-modules.sh:Project Management"
)

TOTAL_MODULES=0
PASSED_MODULES=0
FAILED_MODULES=0
SKIPPED_MODULES=0

# Arrays to track results
declare -a MODULE_NAMES
declare -a MODULE_RESULTS
declare -a MODULE_DETAILS

echo "============================================================"
echo "  IMS — Master Integration Test Runner"
echo "============================================================"
echo ""
echo "  Running $(echo ${#MODULES[@]}) module test suites..."
echo ""

for entry in "${MODULES[@]}"; do
  SCRIPT="${entry%%:*}"
  NAME="${entry##*:}"
  TOTAL_MODULES=$((TOTAL_MODULES + 1))
  MODULE_NAMES+=("$NAME")

  SCRIPT_PATH="$SCRIPT_DIR/$SCRIPT"

  echo "────────────────────────────────────────────────────────────"
  echo "  Module: $NAME ($SCRIPT)"
  echo "────────────────────────────────────────────────────────────"

  if [ ! -f "$SCRIPT_PATH" ]; then
    echo "  SKIPPED: Script not found at $SCRIPT_PATH"
    echo ""
    MODULE_RESULTS+=("SKIP")
    MODULE_DETAILS+=("Script not found")
    SKIPPED_MODULES=$((SKIPPED_MODULES + 1))
    continue
  fi

  if [ ! -x "$SCRIPT_PATH" ]; then
    chmod +x "$SCRIPT_PATH"
  fi

  # Run the script and capture output + exit code
  OUTPUT=$("$SCRIPT_PATH" 2>&1)
  EXIT_CODE=$?

  echo "$OUTPUT"
  echo ""

  # Extract the results line from output (e.g., "RESULTS: 70 passed, 0 failed (out of 70)")
  RESULTS_LINE=$(echo "$OUTPUT" | grep -o 'RESULTS:.*' | tail -1)

  if [ $EXIT_CODE -eq 0 ]; then
    MODULE_RESULTS+=("PASS")
    MODULE_DETAILS+=("$RESULTS_LINE")
    PASSED_MODULES=$((PASSED_MODULES + 1))
  else
    MODULE_RESULTS+=("FAIL")
    MODULE_DETAILS+=("$RESULTS_LINE")
    FAILED_MODULES=$((FAILED_MODULES + 1))
  fi
done

echo ""
echo "============================================================"
echo "  MASTER TEST SUMMARY"
echo "============================================================"
echo ""
printf "  %-20s %-10s %s\n" "MODULE" "RESULT" "DETAILS"
printf "  %-20s %-10s %s\n" "────────────────────" "──────────" "──────────────────────────────────"

for i in "${!MODULE_NAMES[@]}"; do
  RESULT="${MODULE_RESULTS[$i]}"
  case "$RESULT" in
    PASS) INDICATOR="PASS" ;;
    FAIL) INDICATOR="FAIL" ;;
    SKIP) INDICATOR="SKIP" ;;
    *)    INDICATOR="????" ;;
  esac
  printf "  %-20s %-10s %s\n" "${MODULE_NAMES[$i]}" "$INDICATOR" "${MODULE_DETAILS[$i]}"
done

echo ""
echo "  ────────────────────────────────────────────────────────"
printf "  Modules: %d total, %d passed, %d failed, %d skipped\n" \
  "$TOTAL_MODULES" "$PASSED_MODULES" "$FAILED_MODULES" "$SKIPPED_MODULES"
echo "============================================================"

if [ $FAILED_MODULES -gt 0 ]; then
  echo ""
  echo "  Some modules had failures. Exit code: 1"
  exit 1
fi

echo ""
echo "  All modules passed!"
exit 0
