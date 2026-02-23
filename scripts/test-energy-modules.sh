#!/bin/bash
# Comprehensive test script for Energy Management modules (ISO 50001)
# Tests: Baselines, Targets, Meters, Readings, Bills, Dashboard — CRUD + Gateway

API="http://localhost:4020"
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
echo "  Energy Management Modules - Test Suite"
echo "============================================"
echo ""

echo "1. ENERGY BASELINES MODULE"
echo "─────────────────────────────────────────"

BASELINE_RESULT=$(curl -s -X POST "$API/api/baselines" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "name": "2024 Site Energy Baseline",
  "year": 2024,
  "description": "Full-year energy consumption baseline for ISO 50001 certification",
  "totalConsumption": 2450000,
  "unit": "kWh",
  "methodology": "Meter-based measurement with normalisation for production volume and HDD"
}')
BASELINE_SUCCESS=$(echo "$BASELINE_RESULT" | jq -r '.success')
BASELINE_ID=$(echo "$BASELINE_RESULT" | jq -r '.data.id')
assert "POST /baselines - success" "true" "$BASELINE_SUCCESS"
assert "POST /baselines - has ID" "false" "$([ -z "$BASELINE_ID" ] || [ "$BASELINE_ID" = "null" ] && echo true || echo false)"

BASELINES_LIST=$(curl -s "$API/api/baselines" -H "$AUTH")
assert "GET /baselines - success" "true" "$(echo "$BASELINES_LIST" | jq -r '.success')"
assert_contains "GET /baselines - has data" '"data"' "$BASELINES_LIST"

BASELINE_GET=$(curl -s "$API/api/baselines/$BASELINE_ID" -H "$AUTH")
assert "GET /baselines/:id - success" "true" "$(echo "$BASELINE_GET" | jq -r '.success')"
assert "GET /baselines/:id - correct year" "2024" "$(echo "$BASELINE_GET" | jq -r '.data.year')"

BASELINE_PATCH=$(curl -s -X PATCH "$API/api/baselines/$BASELINE_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{"status":"ACTIVE"}')
assert "PATCH /baselines/:id - success" "true" "$(echo "$BASELINE_PATCH" | jq -r '.success')"

echo ""
echo "2. ENERGY TARGETS MODULE"
echo "─────────────────────────────────────────"

TARGETS_LIST=$(curl -s "$API/api/targets" -H "$AUTH")
assert "GET /targets - success" "true" "$(echo "$TARGETS_LIST" | jq -r '.success')"

TARGET_RESULT=$(curl -s -X POST "$API/api/targets" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "name": "2026 Energy Reduction Target",
  "year": 2026,
  "targetReduction": 10,
  "unit": "PERCENTAGE",
  "baselineYear": 2024,
  "targetConsumption": 2205000,
  "status": "ACTIVE"
}')
assert "POST /targets - success" "true" "$(echo "$TARGET_RESULT" | jq -r '.success')"
TARGET_ID=$(echo "$TARGET_RESULT" | jq -r '.data.id')

if [ -n "$TARGET_ID" ] && [ "$TARGET_ID" != "null" ]; then
  TARGET_GET=$(curl -s "$API/api/targets/$TARGET_ID" -H "$AUTH")
  assert "GET /targets/:id - success" "true" "$(echo "$TARGET_GET" | jq -r '.success')"
  TARGET_PATCH=$(curl -s -X PATCH "$API/api/targets/$TARGET_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{"targetReduction":12}')
  assert "PATCH /targets/:id - success" "true" "$(echo "$TARGET_PATCH" | jq -r '.success')"
fi

echo ""
echo "3. ENERGY METERS MODULE"
echo "─────────────────────────────────────────"

METERS_LIST=$(curl -s "$API/api/meters" -H "$AUTH")
assert "GET /meters - success" "true" "$(echo "$METERS_LIST" | jq -r '.success')"

METER_RESULT=$(curl -s -X POST "$API/api/meters" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "name": "Main Electricity Meter",
  "location": "Main Distribution Board — Ground Floor",
  "meterType": "ELECTRICITY",
  "unit": "kWh",
  "serialNumber": "ELEC-2024-001",
  "isActive": true
}')
assert "POST /meters - success" "true" "$(echo "$METER_RESULT" | jq -r '.success')"
METER_ID=$(echo "$METER_RESULT" | jq -r '.data.id')

echo ""
echo "4. ENERGY READINGS MODULE"
echo "─────────────────────────────────────────"

READINGS_LIST=$(curl -s "$API/api/readings" -H "$AUTH")
assert "GET /readings - success" "true" "$(echo "$READINGS_LIST" | jq -r '.success')"

if [ -n "$METER_ID" ] && [ "$METER_ID" != "null" ]; then
  READING_RESULT=$(curl -s -X POST "$API/api/readings" -H "$AUTH" -H "Content-Type: application/json" -d '{
    "meterId": "'"$METER_ID"'",
    "reading": 245678,
    "readingDate": "2026-02-01T08:00:00.000Z",
    "readBy": "Facilities Manager",
    "notes": "Monthly meter read"
  }')
  assert "POST /readings - success" "true" "$(echo "$READING_RESULT" | jq -r '.success')"
fi

echo ""
echo "5. ENERGY BILLS MODULE"
echo "─────────────────────────────────────────"

BILLS_LIST=$(curl -s "$API/api/bills" -H "$AUTH")
assert "GET /bills - success" "true" "$(echo "$BILLS_LIST" | jq -r '.success')"

echo ""
echo "6. ENERGY AUDITS MODULE"
echo "─────────────────────────────────────────"

ENERGY_AUDITS=$(curl -s "$API/api/audits" -H "$AUTH")
assert "GET /audits - success" "true" "$(echo "$ENERGY_AUDITS" | jq -r '.success')"

echo ""
echo "7. ENERGY COMPLIANCE MODULE"
echo "─────────────────────────────────────────"

COMPLIANCE=$(curl -s "$API/api/compliance" -H "$AUTH")
assert "GET /compliance - success" "true" "$(echo "$COMPLIANCE" | jq -r '.success')"

echo ""
echo "8. ENERGY DASHBOARD"
echo "─────────────────────────────────────────"

DASHBOARD=$(curl -s "$API/api/dashboard" -H "$AUTH")
assert "GET /dashboard - success" "true" "$(echo "$DASHBOARD" | jq -r '.success')"
assert_contains "GET /dashboard - has data" '"data"' "$DASHBOARD"

echo ""
echo "9. ENERGY REPORTS MODULE"
echo "─────────────────────────────────────────"

REPORTS=$(curl -s "$API/api/reports" -H "$AUTH")
assert "GET /reports - success" "true" "$(echo "$REPORTS" | jq -r '.success')"

echo ""
echo "10. GATEWAY ROUTING"
echo "─────────────────────────────────────────"

GW_RESULT=$(curl -s "$GW/api/energy/baselines" -H "$AUTH")
assert "Gateway /api/energy/baselines - success" "true" "$(echo "$GW_RESULT" | jq -r '.success')"

echo ""
echo "11. DELETE OPERATIONS"
echo "─────────────────────────────────────────"

if [ -n "$TARGET_ID" ] && [ "$TARGET_ID" != "null" ]; then
  DEL_TARGET=$(curl -s -X DELETE "$API/api/targets/$TARGET_ID" -H "$AUTH")
  assert "DELETE /targets/:id - success" "true" "$(echo "$DEL_TARGET" | jq -r '.success')"
fi

DEL_BASELINE=$(curl -s -X DELETE "$API/api/baselines/$BASELINE_ID" -H "$AUTH")
assert "DELETE /baselines/:id - success" "true" "$(echo "$DEL_BASELINE" | jq -r '.success')"

VERIFY=$(curl -s "$API/api/baselines/$BASELINE_ID" -H "$AUTH")
assert "Deleted baseline returns 404" "NOT_FOUND" "$(echo "$VERIFY" | jq -r '.error.code')"

echo ""
echo "============================================"
echo "  RESULTS: $PASS passed, $FAIL failed (out of $TOTAL)"
echo "============================================"

if [ $FAIL -gt 0 ]; then
  exit 1
fi
