#!/bin/bash
# Comprehensive test script for Asset Management modules
# Tests: Assets, Calibrations, Inspections, Maintenance, Lifecycle — CRUD + Gateway

API="http://localhost:4030"
GW="http://localhost:4000"
PASS=0
FAIL=0
TOTAL=0

TOKEN=$(echo '{"email":"admin@ims.local","password":"admin123"}' | curl -s "$GW/api/v1/auth/login" -H 'Content-Type: application/json' -d @- | jq -r '.data.accessToken')

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo "FATAL: Could not get auth token"
  exit 1
fi

AUTH="Authorization: Bearer $TOKEN"

assert() {
  local name="$1"; local expected="$2"; local actual="$3"
  TOTAL=$((TOTAL + 1))
  if [ "$actual" = "$expected" ]; then
    echo "  PASS: $name"; PASS=$((PASS + 1))
  else
    echo "  FAIL: $name (expected=$expected, got=$actual)"; FAIL=$((FAIL + 1))
  fi
}

assert_contains() {
  local name="$1"; local expected="$2"; local actual="$3"
  TOTAL=$((TOTAL + 1))
  if echo "$actual" | grep -q "$expected"; then
    echo "  PASS: $name"; PASS=$((PASS + 1))
  else
    echo "  FAIL: $name (expected to contain '$expected')"; FAIL=$((FAIL + 1))
  fi
}

echo "============================================"
echo "  Asset Management Modules - Test Suite"
echo "============================================"
echo ""

# ─────────────────────────────────────────────
echo "1. ASSETS MODULE"
echo "─────────────────────────────────────────"

ASSET_RESULT=$(curl -s -X POST "$API/api/assets" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "name": "CNC Milling Machine XR-500",
  "description": "5-axis CNC milling machine for precision parts manufacturing",
  "assetTag": "MACH-2024-001",
  "serialNumber": "XR500-SN-78921",
  "category": "Production Equipment",
  "location": "Workshop Bay 3",
  "department": "Manufacturing",
  "status": "ACTIVE",
  "condition": "GOOD",
  "manufacturer": "TechMach GmbH",
  "model": "XR-500",
  "purchaseDate": "2024-03-15",
  "purchaseCost": 125000,
  "currentValue": 108000
}')
ASSET_SUCCESS=$(echo "$ASSET_RESULT" | jq -r '.success')
ASSET_ID=$(echo "$ASSET_RESULT" | jq -r '.data.id')
assert "POST /assets - success" "true" "$ASSET_SUCCESS"
assert "POST /assets - has ID" "false" "$([ -z "$ASSET_ID" ] || [ "$ASSET_ID" = "null" ] && echo true || echo false)"

ASSETS_LIST=$(curl -s "$API/api/assets" -H "$AUTH")
assert "GET /assets - success" "true" "$(echo "$ASSETS_LIST" | jq -r '.success')"
assert_contains "GET /assets - has pagination" '"pagination"' "$ASSETS_LIST"

ASSET_GET=$(curl -s "$API/api/assets/$ASSET_ID" -H "$AUTH")
assert "GET /assets/:id - success" "true" "$(echo "$ASSET_GET" | jq -r '.success')"
assert "GET /assets/:id - correct name" "CNC Milling Machine XR-500" "$(echo "$ASSET_GET" | jq -r '.data.name')"

ASSET_PATCH=$(curl -s -X PATCH "$API/api/assets/$ASSET_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{"condition":"EXCELLENT","location":"Workshop Bay 4"}')
assert "PATCH /assets/:id - success" "true" "$(echo "$ASSET_PATCH" | jq -r '.success')"

echo ""
echo "2. CALIBRATIONS MODULE"
echo "─────────────────────────────────────────"

CAL_LIST=$(curl -s "$API/api/calibrations" -H "$AUTH")
assert "GET /calibrations - success" "true" "$(echo "$CAL_LIST" | jq -r '.success')"

CAL_RESULT=$(curl -s -X POST "$API/api/calibrations" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "assetId": "'"$ASSET_ID"'",
  "calibrationType": "SCHEDULED",
  "calibrationDate": "2026-02-01T00:00:00.000Z",
  "nextDueDate": "2026-08-01T00:00:00.000Z",
  "calibratedBy": "Calibration Lab Ltd",
  "certificateNo": "CAL-2026-0042",
  "result": "PASSED",
  "notes": "All measurements within tolerance"
}')
assert "POST /calibrations - success" "true" "$(echo "$CAL_RESULT" | jq -r '.success')"
CAL_ID=$(echo "$CAL_RESULT" | jq -r '.data.id')

if [ -n "$CAL_ID" ] && [ "$CAL_ID" != "null" ]; then
  CAL_GET=$(curl -s "$API/api/calibrations/$CAL_ID" -H "$AUTH")
  assert "GET /calibrations/:id - success" "true" "$(echo "$CAL_GET" | jq -r '.success')"
  CAL_PATCH=$(curl -s -X PATCH "$API/api/calibrations/$CAL_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{"notes":"Updated calibration notes"}')
  assert "PATCH /calibrations/:id - success" "true" "$(echo "$CAL_PATCH" | jq -r '.success')"
fi

echo ""
echo "3. INSPECTIONS MODULE"
echo "─────────────────────────────────────────"

INSP_LIST=$(curl -s "$API/api/inspections" -H "$AUTH")
assert "GET /inspections - success" "true" "$(echo "$INSP_LIST" | jq -r '.success')"

INSP_RESULT=$(curl -s -X POST "$API/api/inspections" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "assetId": "'"$ASSET_ID"'",
  "inspectionType": "ROUTINE",
  "inspectedBy": "Maintenance Supervisor",
  "inspectionDate": "2026-02-10T00:00:00.000Z",
  "result": "SATISFACTORY",
  "notes": "All safety guards in place, lubrication completed",
  "status": "COMPLETED"
}')
assert "POST /inspections - success" "true" "$(echo "$INSP_RESULT" | jq -r '.success')"
INSP_ID=$(echo "$INSP_RESULT" | jq -r '.data.id')

if [ -n "$INSP_ID" ] && [ "$INSP_ID" != "null" ]; then
  INSP_GET=$(curl -s "$API/api/inspections/$INSP_ID" -H "$AUTH")
  assert "GET /inspections/:id - success" "true" "$(echo "$INSP_GET" | jq -r '.success')"
fi

echo ""
echo "4. MAINTENANCE MODULE"
echo "─────────────────────────────────────────"

MAINT_LIST=$(curl -s "$API/api/maintenance" -H "$AUTH")
assert "GET /maintenance - success" "true" "$(echo "$MAINT_LIST" | jq -r '.success')"

MAINT_RESULT=$(curl -s -X POST "$API/api/maintenance" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "assetId": "'"$ASSET_ID"'",
  "maintenanceType": "PREVENTIVE",
  "title": "6-month preventive maintenance",
  "description": "Full lubrication, belt tension check, coolant replacement",
  "scheduledDate": "2026-03-01T00:00:00.000Z",
  "assignedTo": "Maintenance Team A",
  "estimatedDuration": 480,
  "estimatedCost": 1200,
  "priority": "HIGH",
  "status": "SCHEDULED"
}')
assert "POST /maintenance - success" "true" "$(echo "$MAINT_RESULT" | jq -r '.success')"
MAINT_ID=$(echo "$MAINT_RESULT" | jq -r '.data.id')

if [ -n "$MAINT_ID" ] && [ "$MAINT_ID" != "null" ]; then
  MAINT_PATCH=$(curl -s -X PATCH "$API/api/maintenance/$MAINT_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{"status":"IN_PROGRESS"}')
  assert "PATCH /maintenance/:id - status update" "true" "$(echo "$MAINT_PATCH" | jq -r '.success')"
fi

echo ""
echo "5. ASSET DEPRECIATION MODULE"
echo "─────────────────────────────────────────"

DEPR_LIST=$(curl -s "$API/api/depreciation" -H "$AUTH")
assert "GET /depreciation - success" "true" "$(echo "$DEPR_LIST" | jq -r '.success')"

echo ""
echo "6. ASSET DASHBOARD"
echo "─────────────────────────────────────────"

DASHBOARD=$(curl -s "$API/api/dashboard" -H "$AUTH")
assert "GET /dashboard - success" "true" "$(echo "$DASHBOARD" | jq -r '.success')"
assert_contains "GET /dashboard - has data" '"data"' "$DASHBOARD"

echo ""
echo "7. ASSET LIFECYCLE MODULE"
echo "─────────────────────────────────────────"

LIFECYCLE=$(curl -s "$API/api/lifecycle" -H "$AUTH")
assert "GET /lifecycle - success" "true" "$(echo "$LIFECYCLE" | jq -r '.success')"

echo ""
echo "8. ASSET TRACKING MODULE"
echo "─────────────────────────────────────────"

TRACKING=$(curl -s "$API/api/tracking" -H "$AUTH")
assert "GET /tracking - success" "true" "$(echo "$TRACKING" | jq -r '.success')"

echo ""
echo "9. GATEWAY ROUTING"
echo "─────────────────────────────────────────"

GW_RESULT=$(curl -s "$GW/api/assets/assets" -H "$AUTH")
assert "Gateway /api/assets/assets - success" "true" "$(echo "$GW_RESULT" | jq -r '.success')"

echo ""
echo "10. DELETE OPERATIONS"
echo "─────────────────────────────────────────"

if [ -n "$CAL_ID" ] && [ "$CAL_ID" != "null" ]; then
  DEL_CAL=$(curl -s -X DELETE "$API/api/calibrations/$CAL_ID" -H "$AUTH")
  assert "DELETE /calibrations/:id - success" "true" "$(echo "$DEL_CAL" | jq -r '.success')"
fi

if [ -n "$INSP_ID" ] && [ "$INSP_ID" != "null" ]; then
  DEL_INSP=$(curl -s -X DELETE "$API/api/inspections/$INSP_ID" -H "$AUTH")
  assert "DELETE /inspections/:id - success" "true" "$(echo "$DEL_INSP" | jq -r '.success')"
fi

DEL_ASSET=$(curl -s -X DELETE "$API/api/assets/$ASSET_ID" -H "$AUTH")
assert "DELETE /assets/:id - success" "true" "$(echo "$DEL_ASSET" | jq -r '.success')"

VERIFY=$(curl -s "$API/api/assets/$ASSET_ID" -H "$AUTH")
assert "Deleted asset returns 404" "NOT_FOUND" "$(echo "$VERIFY" | jq -r '.error.code')"

echo ""
echo "============================================"
echo "  RESULTS: $PASS passed, $FAIL failed (out of $TOTAL)"
echo "============================================"

if [ $FAIL -gt 0 ]; then
  exit 1
fi
