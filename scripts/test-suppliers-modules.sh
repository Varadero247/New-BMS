#!/bin/bash
# Comprehensive test script for Supplier Management modules
# Tests: Suppliers, Assessments, Performance, Contracts, Categories — CRUD + Gateway

API="http://localhost:4029"
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
echo "  Supplier Management Modules - Test Suite"
echo "============================================"
echo ""

# ─────────────────────────────────────────────
echo "1. SUPPLIERS MODULE"
echo "─────────────────────────────────────────"

SUP_RESULT=$(curl -s -X POST "$API/api/suppliers" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "name": "Acme Industrial Supplies Ltd",
  "tradingName": "Acme Industrial",
  "registrationNo": "12345678",
  "status": "PROSPECTIVE",
  "tier": "HIGH",
  "category": "Raw Materials",
  "primaryContact": "Bob Williams",
  "email": "bob.williams@acme-industrial.com",
  "phone": "+44 20 1234 5678",
  "country": "United Kingdom",
  "city": "Birmingham"
}')
SUP_SUCCESS=$(echo "$SUP_RESULT" | jq -r '.success')
SUP_ID=$(echo "$SUP_RESULT" | jq -r '.data.id')
assert "POST /suppliers - success" "true" "$SUP_SUCCESS"
assert "POST /suppliers - has ID" "false" "$([ -z "$SUP_ID" ] || [ "$SUP_ID" = "null" ] && echo true || echo false)"

SUPS_LIST=$(curl -s "$API/api/suppliers" -H "$AUTH")
assert "GET /suppliers - success" "true" "$(echo "$SUPS_LIST" | jq -r '.success')"
assert_contains "GET /suppliers - has pagination" '"pagination"' "$SUPS_LIST"

SUP_GET=$(curl -s "$API/api/suppliers/$SUP_ID" -H "$AUTH")
assert "GET /suppliers/:id - success" "true" "$(echo "$SUP_GET" | jq -r '.success')"
assert "GET /suppliers/:id - correct name" "Acme Industrial Supplies Ltd" "$(echo "$SUP_GET" | jq -r '.data.name')"

SUP_PATCH=$(curl -s -X PATCH "$API/api/suppliers/$SUP_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{"status":"APPROVED","tier":"CRITICAL"}')
assert "PATCH /suppliers/:id - success" "true" "$(echo "$SUP_PATCH" | jq -r '.success')"

echo ""
echo "2. SUPPLIER ASSESSMENTS MODULE"
echo "─────────────────────────────────────────"

ASSESS_LIST=$(curl -s "$API/api/assessments" -H "$AUTH")
assert "GET /assessments - success" "true" "$(echo "$ASSESS_LIST" | jq -r '.success')"

ASSESS_RESULT=$(curl -s -X POST "$API/api/assessments" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "supplierId": "'"$SUP_ID"'",
  "assessmentType": "INITIAL",
  "score": 78,
  "rating": "ACCEPTABLE",
  "assessedBy": "Procurement Team",
  "assessmentDate": "2026-02-01T00:00:00.000Z",
  "nextReviewDate": "2026-08-01T00:00:00.000Z",
  "notes": "Initial assessment completed - meets minimum requirements",
  "status": "COMPLETED"
}')
assert "POST /assessments - success" "true" "$(echo "$ASSESS_RESULT" | jq -r '.success')"
ASSESS_ID=$(echo "$ASSESS_RESULT" | jq -r '.data.id')

if [ -n "$ASSESS_ID" ] && [ "$ASSESS_ID" != "null" ]; then
  ASSESS_GET=$(curl -s "$API/api/assessments/$ASSESS_ID" -H "$AUTH")
  assert "GET /assessments/:id - success" "true" "$(echo "$ASSESS_GET" | jq -r '.success')"
fi

echo ""
echo "3. SUPPLIER PERFORMANCE MODULE"
echo "─────────────────────────────────────────"

PERF_LIST=$(curl -s "$API/api/performance" -H "$AUTH")
assert "GET /performance - success" "true" "$(echo "$PERF_LIST" | jq -r '.success')"

PERF_RESULT=$(curl -s -X POST "$API/api/performance" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "supplierId": "'"$SUP_ID"'",
  "period": "2026-Q1",
  "onTimeDelivery": 95,
  "qualityScore": 88,
  "responsiveness": 4,
  "overallScore": 91,
  "notes": "Q1 2026 performance review"
}')
assert "POST /performance - success" "true" "$(echo "$PERF_RESULT" | jq -r '.success')"

echo ""
echo "4. SUPPLIER CATEGORIES MODULE"
echo "─────────────────────────────────────────"

CATS_LIST=$(curl -s "$API/api/categories" -H "$AUTH")
assert "GET /categories - success" "true" "$(echo "$CATS_LIST" | jq -r '.success')"

CAT_RESULT=$(curl -s -X POST "$API/api/categories" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "name": "Raw Materials",
  "description": "Primary raw materials for production",
  "criticality": "HIGH",
  "isActive": true
}')
assert "POST /categories - success" "true" "$(echo "$CAT_RESULT" | jq -r '.success')"
CAT_ID=$(echo "$CAT_RESULT" | jq -r '.data.id')

echo ""
echo "5. SUPPLIER CONTRACTS MODULE"
echo "─────────────────────────────────────────"

CONTS_LIST=$(curl -s "$API/api/contracts" -H "$AUTH")
assert "GET /contracts - success" "true" "$(echo "$CONTS_LIST" | jq -r '.success')"

CONT_RESULT=$(curl -s -X POST "$API/api/contracts" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "supplierId": "'"$SUP_ID"'",
  "contractType": "SUPPLY_AGREEMENT",
  "title": "Annual Supply Agreement 2026",
  "startDate": "2026-01-01T00:00:00.000Z",
  "endDate": "2026-12-31T00:00:00.000Z",
  "value": 250000,
  "currency": "GBP",
  "status": "ACTIVE"
}')
assert "POST /contracts - success" "true" "$(echo "$CONT_RESULT" | jq -r '.success')"

echo ""
echo "6. SUPPLIER DASHBOARD"
echo "─────────────────────────────────────────"

DASHBOARD=$(curl -s "$API/api/dashboard" -H "$AUTH")
assert "GET /dashboard - success" "true" "$(echo "$DASHBOARD" | jq -r '.success')"
assert_contains "GET /dashboard - has data" '"data"' "$DASHBOARD"

echo ""
echo "7. SUPPLIER RISK MODULE"
echo "─────────────────────────────────────────"

RISK_LIST=$(curl -s "$API/api/risk" -H "$AUTH")
assert "GET /risk - success" "true" "$(echo "$RISK_LIST" | jq -r '.success')"

echo ""
echo "8. SUPPLIER APPROVAL MODULE"
echo "─────────────────────────────────────────"

APPROVAL_LIST=$(curl -s "$API/api/approval" -H "$AUTH")
assert "GET /approval - success" "true" "$(echo "$APPROVAL_LIST" | jq -r '.success')"

echo ""
echo "9. GATEWAY ROUTING"
echo "─────────────────────────────────────────"

GW_RESULT=$(curl -s "$GW/api/suppliers/suppliers" -H "$AUTH")
assert "Gateway /api/suppliers/suppliers - success" "true" "$(echo "$GW_RESULT" | jq -r '.success')"

echo ""
echo "10. DELETE OPERATIONS"
echo "─────────────────────────────────────────"

if [ -n "$ASSESS_ID" ] && [ "$ASSESS_ID" != "null" ]; then
  DEL_ASSESS=$(curl -s -X DELETE "$API/api/assessments/$ASSESS_ID" -H "$AUTH")
  assert "DELETE /assessments/:id - success" "true" "$(echo "$DEL_ASSESS" | jq -r '.success')"
fi

DEL_SUP=$(curl -s -X DELETE "$API/api/suppliers/$SUP_ID" -H "$AUTH")
assert "DELETE /suppliers/:id - success" "true" "$(echo "$DEL_SUP" | jq -r '.success')"

VERIFY=$(curl -s "$API/api/suppliers/$SUP_ID" -H "$AUTH")
assert "Deleted supplier returns 404" "NOT_FOUND" "$(echo "$VERIFY" | jq -r '.error.code')"

echo ""
echo "============================================"
echo "  RESULTS: $PASS passed, $FAIL failed (out of $TOTAL)"
echo "============================================"

if [ $FAIL -gt 0 ]; then
  exit 1
fi
