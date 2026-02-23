#!/bin/bash
# Comprehensive test script for Food Safety modules (ISO 22000 / HACCP)
# Tests: CCPs, Allergens, Products, Audits, Monitoring, Dashboard — CRUD + Gateway

API="http://localhost:4019"
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
echo "  Food Safety Modules - Test Suite"
echo "============================================"
echo ""

echo "1. CRITICAL CONTROL POINTS (CCP) MODULE"
echo "─────────────────────────────────────────"

CCP_RESULT=$(curl -s -X POST "$API/api/ccps" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "name": "Pasteurisation Temperature Control",
  "processStep": "Thermal Processing",
  "criticalLimit": "Minimum 72°C for 15 seconds",
  "monitoringMethod": "Continuous temperature probe with data logger",
  "monitoringFrequency": "CONTINUOUS",
  "correctiveAction": "Stop production, quarantine product, investigate root cause",
  "verificationMethod": "Calibrated thermometer check every shift",
  "recordKeeping": "Temperature log FS-CCP-001, reviewed daily by QC",
  "isActive": true
}')
CCP_SUCCESS=$(echo "$CCP_RESULT" | jq -r '.success')
CCP_ID=$(echo "$CCP_RESULT" | jq -r '.data.id')
assert "POST /ccps - success" "true" "$CCP_SUCCESS"
assert "POST /ccps - has ID" "false" "$([ -z "$CCP_ID" ] || [ "$CCP_ID" = "null" ] && echo true || echo false)"

CCPS_LIST=$(curl -s "$API/api/ccps" -H "$AUTH")
assert "GET /ccps - success" "true" "$(echo "$CCPS_LIST" | jq -r '.success')"
assert_contains "GET /ccps - has data" '"data"' "$CCPS_LIST"

CCP_GET=$(curl -s "$API/api/ccps/$CCP_ID" -H "$AUTH")
assert "GET /ccps/:id - success" "true" "$(echo "$CCP_GET" | jq -r '.success')"
assert "GET /ccps/:id - correct name" "Pasteurisation Temperature Control" "$(echo "$CCP_GET" | jq -r '.data.name')"

CCP_PATCH=$(curl -s -X PATCH "$API/api/ccps/$CCP_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{"monitoringFrequency":"HOURLY"}')
assert "PATCH /ccps/:id - success" "true" "$(echo "$CCP_PATCH" | jq -r '.success')"

echo ""
echo "2. ALLERGENS MODULE"
echo "─────────────────────────────────────────"

ALLERGENS_LIST=$(curl -s "$API/api/allergens" -H "$AUTH")
assert "GET /allergens - success" "true" "$(echo "$ALLERGENS_LIST" | jq -r '.success')"

ALLERGEN_RESULT=$(curl -s -X POST "$API/api/allergens" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "name": "Peanuts",
  "description": "Peanut-containing ingredients requiring strict segregation",
  "category": "NUTS",
  "severity": "HIGH",
  "declarationRequired": true
}')
assert "POST /allergens - success" "true" "$(echo "$ALLERGEN_RESULT" | jq -r '.success')"
ALLERGEN_ID=$(echo "$ALLERGEN_RESULT" | jq -r '.data.id')

if [ -n "$ALLERGEN_ID" ] && [ "$ALLERGEN_ID" != "null" ]; then
  ALLERGEN_GET=$(curl -s "$API/api/allergens/$ALLERGEN_ID" -H "$AUTH")
  assert "GET /allergens/:id - success" "true" "$(echo "$ALLERGEN_GET" | jq -r '.success')"
fi

echo ""
echo "3. PRODUCTS MODULE"
echo "─────────────────────────────────────────"

PRODUCTS_LIST=$(curl -s "$API/api/products" -H "$AUTH")
assert "GET /products - success" "true" "$(echo "$PRODUCTS_LIST" | jq -r '.success')"

PRODUCT_RESULT=$(curl -s -X POST "$API/api/products" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "name": "Organic Greek Yoghurt 500g",
  "category": "DAIRY",
  "description": "Full-fat strained yoghurt, organic certified",
  "shelfLifeDays": 21,
  "storageConditions": "Refrigerated 2-4°C",
  "isActive": true
}')
assert "POST /products - success" "true" "$(echo "$PRODUCT_RESULT" | jq -r '.success')"
PRODUCT_ID=$(echo "$PRODUCT_RESULT" | jq -r '.data.id')

if [ -n "$PRODUCT_ID" ] && [ "$PRODUCT_ID" != "null" ]; then
  PROD_PATCH=$(curl -s -X PATCH "$API/api/products/$PRODUCT_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{"shelfLifeDays":28}')
  assert "PATCH /products/:id - success" "true" "$(echo "$PROD_PATCH" | jq -r '.success')"
fi

echo ""
echo "4. FOOD SAFETY AUDITS MODULE"
echo "─────────────────────────────────────────"

AUDITS_LIST=$(curl -s "$API/api/audits" -H "$AUTH")
assert "GET /audits - success" "true" "$(echo "$AUDITS_LIST" | jq -r '.success')"

AUDIT_RESULT=$(curl -s -X POST "$API/api/audits" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "title": "BRC Global Standard Audit 2026",
  "auditType": "EXTERNAL",
  "scheduledDate": "2026-06-15T09:00:00.000Z",
  "auditorName": "BRC Certification Body",
  "scope": "Full site audit against BRC Issue 9",
  "status": "PLANNED"
}')
assert "POST /audits - success" "true" "$(echo "$AUDIT_RESULT" | jq -r '.success')"
AUDIT_ID=$(echo "$AUDIT_RESULT" | jq -r '.data.id')

if [ -n "$AUDIT_ID" ] && [ "$AUDIT_ID" != "null" ]; then
  AUDIT_GET=$(curl -s "$API/api/audits/$AUDIT_ID" -H "$AUTH")
  assert "GET /audits/:id - success" "true" "$(echo "$AUDIT_GET" | jq -r '.success')"
fi

echo ""
echo "5. HAZARDS MODULE"
echo "─────────────────────────────────────────"

HAZARDS_LIST=$(curl -s "$API/api/hazards" -H "$AUTH")
assert "GET /hazards - success" "true" "$(echo "$HAZARDS_LIST" | jq -r '.success')"

echo ""
echo "6. ENVIRONMENTAL MONITORING MODULE"
echo "─────────────────────────────────────────"

ENV_MON_LIST=$(curl -s "$API/api/environmental-monitoring" -H "$AUTH")
assert "GET /environmental-monitoring - success" "true" "$(echo "$ENV_MON_LIST" | jq -r '.success')"

echo ""
echo "7. FOOD SAFETY DASHBOARD"
echo "─────────────────────────────────────────"

DASHBOARD=$(curl -s "$API/api/dashboard" -H "$AUTH")
assert "GET /dashboard - success" "true" "$(echo "$DASHBOARD" | jq -r '.success')"
assert_contains "GET /dashboard - has data" '"data"' "$DASHBOARD"

echo ""
echo "8. HACCP FLOW MODULE"
echo "─────────────────────────────────────────"

HACCP_FLOW=$(curl -s "$API/api/haccp-flow" -H "$AUTH")
assert "GET /haccp-flow - success" "true" "$(echo "$HACCP_FLOW" | jq -r '.success')"

echo ""
echo "9. GATEWAY ROUTING"
echo "─────────────────────────────────────────"

GW_RESULT=$(curl -s "$GW/api/food-safety/ccps" -H "$AUTH")
assert "Gateway /api/food-safety/ccps - success" "true" "$(echo "$GW_RESULT" | jq -r '.success')"

echo ""
echo "10. DELETE OPERATIONS"
echo "─────────────────────────────────────────"

if [ -n "$ALLERGEN_ID" ] && [ "$ALLERGEN_ID" != "null" ]; then
  DEL_ALLERGEN=$(curl -s -X DELETE "$API/api/allergens/$ALLERGEN_ID" -H "$AUTH")
  assert "DELETE /allergens/:id - success" "true" "$(echo "$DEL_ALLERGEN" | jq -r '.success')"
fi

DEL_CCP=$(curl -s -X DELETE "$API/api/ccps/$CCP_ID" -H "$AUTH")
assert "DELETE /ccps/:id - success" "true" "$(echo "$DEL_CCP" | jq -r '.success')"

VERIFY=$(curl -s "$API/api/ccps/$CCP_ID" -H "$AUTH")
assert "Deleted CCP returns 404" "NOT_FOUND" "$(echo "$VERIFY" | jq -r '.error.code')"

echo ""
echo "============================================"
echo "  RESULTS: $PASS passed, $FAIL failed (out of $TOTAL)"
echo "============================================"

if [ $FAIL -gt 0 ]; then
  exit 1
fi
