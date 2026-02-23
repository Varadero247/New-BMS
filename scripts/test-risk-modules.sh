#!/bin/bash
# Comprehensive test script for Risk Management modules
# Tests: Risk Register, Actions, Controls, Treatments, KRI, Dashboard — CRUD + Gateway

API="http://localhost:4027"
GW="http://localhost:4000"
PASS=0
FAIL=0
TOTAL=0

# Get auth token
TOKEN=$(echo '{"email":"admin@ims.local","password":"admin123"}' | curl -s "$GW/api/v1/auth/login" -H 'Content-Type: application/json' -d @- | jq -r '.data.accessToken')

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo "FATAL: Could not get auth token"
  exit 1
fi

AUTH="Authorization: Bearer $TOKEN"

assert() {
  local name="$1"
  local expected="$2"
  local actual="$3"
  TOTAL=$((TOTAL + 1))
  if [ "$actual" = "$expected" ]; then
    echo "  PASS: $name"
    PASS=$((PASS + 1))
  else
    echo "  FAIL: $name (expected=$expected, got=$actual)"
    FAIL=$((FAIL + 1))
  fi
}

assert_contains() {
  local name="$1"
  local expected="$2"
  local actual="$3"
  TOTAL=$((TOTAL + 1))
  if echo "$actual" | grep -q "$expected"; then
    echo "  PASS: $name"
    PASS=$((PASS + 1))
  else
    echo "  FAIL: $name (expected to contain '$expected', got '$actual')"
    FAIL=$((FAIL + 1))
  fi
}

echo "============================================"
echo "  Risk Management Modules - Test Suite"
echo "============================================"
echo ""

# ─────────────────────────────────────────────
echo "1. RISK REGISTER MODULE"
echo "─────────────────────────────────────────"

# 1a. POST - Create risk
echo "  Creating risk..."
RISK_RESULT=$(curl -s -X POST "$API/api/risks" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "title": "Supply chain disruption risk",
  "description": "Critical supplier dependency may cause production halts",
  "category": "OPERATIONAL",
  "subcategory": "Supply Chain",
  "likelihood": 3,
  "impact": 4,
  "riskScore": 12,
  "riskLevel": "HIGH",
  "owner": "John Smith",
  "ownerEmail": "john.smith@example.com",
  "reviewDate": "2026-06-01T00:00:00.000Z",
  "status": "OPEN"
}')
RISK_SUCCESS=$(echo "$RISK_RESULT" | jq -r '.success')
RISK_ID=$(echo "$RISK_RESULT" | jq -r '.data.id')
assert "POST /risks - success" "true" "$RISK_SUCCESS"
assert "POST /risks - has ID" "false" "$([ -z "$RISK_ID" ] || [ "$RISK_ID" = "null" ] && echo true || echo false)"

# 1b. GET - List risks
RISKS_LIST=$(curl -s "$API/api/risks" -H "$AUTH")
assert "GET /risks - success" "true" "$(echo "$RISKS_LIST" | jq -r '.success')"
assert_contains "GET /risks - has data array" '"data"' "$RISKS_LIST"

# 1c. GET by ID
RISK_GET=$(curl -s "$API/api/risks/$RISK_ID" -H "$AUTH")
assert "GET /risks/:id - success" "true" "$(echo "$RISK_GET" | jq -r '.success')"
assert "GET /risks/:id - correct title" "Supply chain disruption risk" "$(echo "$RISK_GET" | jq -r '.data.title')"

# 1d. PATCH - Update risk
RISK_PATCH=$(curl -s -X PATCH "$API/api/risks/$RISK_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{"status":"IN_REVIEW","likelihood":2}')
assert "PATCH /risks/:id - success" "true" "$(echo "$RISK_PATCH" | jq -r '.success')"

echo ""
echo "2. RISK ACTIONS MODULE"
echo "─────────────────────────────────────────"

# 2a. GET actions for risk
ACTIONS_LIST=$(curl -s "$API/api/risks/$RISK_ID/actions" -H "$AUTH")
assert "GET /risks/:id/actions - success" "true" "$(echo "$ACTIONS_LIST" | jq -r '.success')"

echo ""
echo "3. RISK CONTROLS MODULE"
echo "─────────────────────────────────────────"

# 3a. GET controls list
CONTROLS_LIST=$(curl -s "$API/api/controls" -H "$AUTH")
assert "GET /controls - success" "true" "$(echo "$CONTROLS_LIST" | jq -r '.success')"
assert_contains "GET /controls - has data" '"data"' "$CONTROLS_LIST"

# 3b. POST - Create control
CTRL_RESULT=$(curl -s -X POST "$API/api/controls" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "title": "Supplier diversification programme",
  "description": "Maintain at least 3 approved suppliers per critical component",
  "controlType": "PREVENTIVE",
  "category": "OPERATIONAL",
  "owner": "Procurement Manager",
  "status": "ACTIVE",
  "effectiveness": "EFFECTIVE"
}')
assert "POST /controls - success" "true" "$(echo "$CTRL_RESULT" | jq -r '.success')"
CTRL_ID=$(echo "$CTRL_RESULT" | jq -r '.data.id')

# 3c. PATCH control
if [ -n "$CTRL_ID" ] && [ "$CTRL_ID" != "null" ]; then
  CTRL_PATCH=$(curl -s -X PATCH "$API/api/controls/$CTRL_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{"effectiveness":"PARTIALLY_EFFECTIVE"}')
  assert "PATCH /controls/:id - success" "true" "$(echo "$CTRL_PATCH" | jq -r '.success')"
fi

echo ""
echo "4. RISK TREATMENTS MODULE"
echo "─────────────────────────────────────────"

# 4a. GET treatments
TREATMENTS_LIST=$(curl -s "$API/api/treatments" -H "$AUTH")
assert "GET /treatments - success" "true" "$(echo "$TREATMENTS_LIST" | jq -r '.success')"

# 4b. POST treatment
TREAT_RESULT=$(curl -s -X POST "$API/api/treatments" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "riskId": "'"$RISK_ID"'",
  "treatment": "MITIGATE",
  "description": "Establish dual-source procurement for all tier-1 components",
  "owner": "Supply Chain Director",
  "targetDate": "2026-09-30T00:00:00.000Z",
  "estimatedCost": 50000,
  "status": "PLANNED"
}')
assert "POST /treatments - success" "true" "$(echo "$TREAT_RESULT" | jq -r '.success')"

echo ""
echo "5. KRI MODULE"
echo "─────────────────────────────────────────"

# 5a. GET KRIs
KRI_LIST=$(curl -s "$API/api/kri" -H "$AUTH")
assert "GET /kri - success" "true" "$(echo "$KRI_LIST" | jq -r '.success')"

# 5b. POST KRI
KRI_RESULT=$(curl -s -X POST "$API/api/kri" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "name": "Supplier Concentration Ratio",
  "description": "Percentage of spend with top 3 suppliers",
  "unit": "PERCENTAGE",
  "frequency": "MONTHLY",
  "threshold": 60,
  "thresholdDirection": "ABOVE",
  "owner": "CFO",
  "status": "ACTIVE"
}')
assert "POST /kri - success" "true" "$(echo "$KRI_RESULT" | jq -r '.success')"

echo ""
echo "6. RISK DASHBOARD MODULE"
echo "─────────────────────────────────────────"

DASHBOARD=$(curl -s "$API/api/dashboard" -H "$AUTH")
assert "GET /dashboard - success" "true" "$(echo "$DASHBOARD" | jq -r '.success')"
assert_contains "GET /dashboard - has data" '"data"' "$DASHBOARD"

echo ""
echo "7. RISK ANALYTICS"
echo "─────────────────────────────────────────"

ANALYTICS=$(curl -s "$API/api/analytics" -H "$AUTH")
assert "GET /analytics - success" "true" "$(echo "$ANALYTICS" | jq -r '.success')"

echo ""
echo "8. RISK APPETITE"
echo "─────────────────────────────────────────"

APPETITE=$(curl -s "$API/api/appetite" -H "$AUTH")
assert "GET /appetite - success" "true" "$(echo "$APPETITE" | jq -r '.success')"

echo ""
echo "9. RISK CATEGORIES"
echo "─────────────────────────────────────────"

CATEGORIES=$(curl -s "$API/api/categories" -H "$AUTH")
assert "GET /categories - success" "true" "$(echo "$CATEGORIES" | jq -r '.success')"

echo ""
echo "10. DELETE OPERATIONS"
echo "─────────────────────────────────────────"

if [ -n "$CTRL_ID" ] && [ "$CTRL_ID" != "null" ]; then
  DEL_CTRL=$(curl -s -X DELETE "$API/api/controls/$CTRL_ID" -H "$AUTH")
  assert "DELETE /controls/:id - success" "true" "$(echo "$DEL_CTRL" | jq -r '.success')"
fi

DEL_RISK=$(curl -s -X DELETE "$API/api/risks/$RISK_ID" -H "$AUTH")
assert "DELETE /risks/:id - success" "true" "$(echo "$DEL_RISK" | jq -r '.success')"

VERIFY=$(curl -s "$API/api/risks/$RISK_ID" -H "$AUTH")
assert "Deleted risk returns 404" "NOT_FOUND" "$(echo "$VERIFY" | jq -r '.error.code')"

echo ""
echo "============================================"
echo "  RESULTS: $PASS passed, $FAIL failed (out of $TOTAL)"
echo "============================================"

if [ $FAIL -gt 0 ]; then
  exit 1
fi
