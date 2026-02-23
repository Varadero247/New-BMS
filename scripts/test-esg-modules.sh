#!/bin/bash
# Comprehensive test script for ESG modules
# Tests: Emissions, Social, Governance, ESG Reports, Targets — CRUD + Gateway

API="http://localhost:4016"
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
echo "  ESG Modules - Comprehensive Test Suite"
echo "============================================"
echo ""

# --------------------------------------------------
echo "1. AUTH CHECK"
echo "--------------------------------------------------"
AUTH_RESULT=$(curl -s "$API/api/emissions" -H "$AUTH")
assert "Auth token accepted by ESG service" "true" "$(echo "$AUTH_RESULT" | jq -r '.success')"
echo ""

# --------------------------------------------------
echo "2. EMISSIONS MODULE"
echo "--------------------------------------------------"

echo "  Creating Scope 1 emission..."
EM1_RESULT=$(curl -s -X POST "$API/api/emissions" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "scope": "SCOPE_1",
  "category": "Stationary Combustion",
  "source": "Natural gas boiler - Building A",
  "quantity": 50000,
  "unit": "kWh",
  "co2Equivalent": 9.2,
  "periodStart": "2026-01-01",
  "periodEnd": "2026-01-31",
  "methodology": "IPCC Tier 2",
  "verifiedBy": "Internal auditor"
}')
EM1_SUCCESS=$(echo "$EM1_RESULT" | jq -r '.success')
EM1_ID=$(echo "$EM1_RESULT" | jq -r '.data.id')
assert "POST /emissions (SCOPE_1) - success" "true" "$EM1_SUCCESS"
assert "POST /emissions (SCOPE_1) - scope set" "SCOPE_1" "$(echo "$EM1_RESULT" | jq -r '.data.scope')"
assert "POST /emissions (SCOPE_1) - source set" "Natural gas boiler - Building A" "$(echo "$EM1_RESULT" | jq -r '.data.source')"

echo "  Creating Scope 2 emission..."
EM2_RESULT=$(curl -s -X POST "$API/api/emissions" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "scope": "SCOPE_2",
  "category": "Purchased Electricity",
  "source": "Grid electricity - all sites",
  "quantity": 120000,
  "unit": "kWh",
  "co2Equivalent": 52.8,
  "periodStart": "2026-01-01",
  "periodEnd": "2026-01-31",
  "methodology": "Market-based method"
}')
EM2_ID=$(echo "$EM2_RESULT" | jq -r '.data.id')
assert "POST /emissions (SCOPE_2) - success" "true" "$(echo "$EM2_RESULT" | jq -r '.success')"

echo "  Creating Scope 3 emission..."
EM3_RESULT=$(curl -s -X POST "$API/api/emissions" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "scope": "SCOPE_3",
  "category": "Business Travel",
  "source": "Air travel - international",
  "quantity": 45,
  "unit": "flights",
  "co2Equivalent": 18.6,
  "periodStart": "2026-01-01",
  "periodEnd": "2026-01-31"
}')
EM3_ID=$(echo "$EM3_RESULT" | jq -r '.data.id')
assert "POST /emissions (SCOPE_3) - success" "true" "$(echo "$EM3_RESULT" | jq -r '.success')"

echo "  Getting emissions summary..."
SUMMARY=$(curl -s "$API/api/emissions/summary?year=2026" -H "$AUTH")
assert "GET /emissions/summary - success" "true" "$(echo "$SUMMARY" | jq -r '.success')"
assert "GET /emissions/summary - has byScope" "true" "$(echo "$SUMMARY" | jq -r '.data.byScope != null')"
assert "GET /emissions/summary - SCOPE_1 > 0" "true" "$(echo "$SUMMARY" | jq -r '.data.byScope.SCOPE_1 > 0')"

echo "  Getting emissions trend..."
TREND=$(curl -s "$API/api/emissions/trend?year=2026" -H "$AUTH")
assert "GET /emissions/trend - success" "true" "$(echo "$TREND" | jq -r '.success')"

echo "  Listing emissions..."
EM_LIST=$(curl -s "$API/api/emissions" -H "$AUTH")
assert "GET /emissions - success" "true" "$(echo "$EM_LIST" | jq -r '.success')"
assert "GET /emissions - has records" "true" "$(echo "$EM_LIST" | jq -r '(.data | length) > 0')"

echo "  Getting emission by ID..."
EM_GET=$(curl -s "$API/api/emissions/$EM1_ID" -H "$AUTH")
assert "GET /emissions/:id - success" "true" "$(echo "$EM_GET" | jq -r '.success')"
assert "GET /emissions/:id - correct scope" "SCOPE_1" "$(echo "$EM_GET" | jq -r '.data.scope')"

echo "  Updating emission..."
EM_PUT=$(curl -s -X PUT "$API/api/emissions/$EM1_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "quantity": 52000,
  "co2Equivalent": 9.6,
  "verifiedBy": "External auditor - SGS"
}')
assert "PUT /emissions/:id - success" "true" "$(echo "$EM_PUT" | jq -r '.success')"
assert "PUT /emissions/:id - quantity updated" "52000" "$(echo "$EM_PUT" | jq -r '.data.quantity')"

echo "  Filtering emissions..."
SCOPE_FILTER=$(curl -s "$API/api/emissions?scope=SCOPE_2" -H "$AUTH")
assert "GET /emissions?scope filter - success" "true" "$(echo "$SCOPE_FILTER" | jq -r '.success')"

VAL_EM=$(curl -s -X POST "$API/api/emissions" -H "$AUTH" -H "Content-Type: application/json" -d '{"scope":"SCOPE_1"}')
assert "POST /emissions - validation error (missing required fields)" "VALIDATION_ERROR" "$(echo "$VAL_EM" | jq -r '.error.code')"

echo ""

# --------------------------------------------------
echo "3. SOCIAL MODULE"
echo "--------------------------------------------------"

echo "  Creating social metric..."
SOC_RESULT=$(curl -s -X POST "$API/api/social" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "category": "DIVERSITY",
  "metric": "Female employees percentage",
  "value": 42.5,
  "unit": "%",
  "periodStart": "2026-01-01",
  "periodEnd": "2026-03-31",
  "notes": "Q1 2026 diversity metric"
}')
SOC_SUCCESS=$(echo "$SOC_RESULT" | jq -r '.success')
SOC_ID=$(echo "$SOC_RESULT" | jq -r '.data.id')
assert "POST /social - success" "true" "$SOC_SUCCESS"
assert "POST /social - category DIVERSITY" "DIVERSITY" "$(echo "$SOC_RESULT" | jq -r '.data.category')"
assert "POST /social - value set" "42.5" "$(echo "$SOC_RESULT" | jq -r '.data.value')"

echo "  Creating H&S social metric..."
SOC2_RESULT=$(curl -s -X POST "$API/api/social" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "category": "HEALTH_SAFETY",
  "metric": "Lost Time Injury Frequency Rate",
  "value": 1.2,
  "unit": "per million hours",
  "periodStart": "2026-01-01",
  "periodEnd": "2026-03-31"
}')
SOC2_ID=$(echo "$SOC2_RESULT" | jq -r '.data.id')
assert "POST /social (H&S metric) - success" "true" "$(echo "$SOC2_RESULT" | jq -r '.success')"

echo "  Listing social metrics..."
SOC_LIST=$(curl -s "$API/api/social" -H "$AUTH")
assert "GET /social - success" "true" "$(echo "$SOC_LIST" | jq -r '.success')"
assert "GET /social - has records" "true" "$(echo "$SOC_LIST" | jq -r '(.data | length) > 0')"

echo "  Getting social metric by ID..."
SOC_GET=$(curl -s "$API/api/social/$SOC_ID" -H "$AUTH")
assert "GET /social/:id - success" "true" "$(echo "$SOC_GET" | jq -r '.success')"

echo "  Updating social metric..."
SOC_PUT=$(curl -s -X PUT "$API/api/social/$SOC_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "value": 43.2,
  "notes": "Q1 2026 revised diversity metric after recount"
}')
assert "PUT /social/:id - success" "true" "$(echo "$SOC_PUT" | jq -r '.success')"
assert "PUT /social/:id - value updated" "43.2" "$(echo "$SOC_PUT" | jq -r '.data.value')"

SOC_SUMMARY=$(curl -s "$API/api/social/workforce" -H "$AUTH")
assert "GET /social/workforce summary - success" "true" "$(echo "$SOC_SUMMARY" | jq -r '.success')"

CAT_FILTER=$(curl -s "$API/api/social?category=DIVERSITY" -H "$AUTH")
assert "GET /social?category filter - success" "true" "$(echo "$CAT_FILTER" | jq -r '.success')"

echo ""

# --------------------------------------------------
echo "4. ESG REPORTS MODULE"
echo "--------------------------------------------------"

echo "  Generating ESG report..."
RPT_RESULT=$(curl -s -X POST "$API/api/esg-reports/generate" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "title": "Annual ESG Report 2025",
  "framework": "GRI",
  "period": "2025"
}')
RPT_SUCCESS=$(echo "$RPT_RESULT" | jq -r '.success')
RPT_ID=$(echo "$RPT_RESULT" | jq -r '.data.id')
assert "POST /esg-reports/generate - success" "true" "$RPT_SUCCESS"
assert "POST /esg-reports/generate - aiGenerated true" "true" "$(echo "$RPT_RESULT" | jq -r '.data.aiGenerated')"
assert "POST /esg-reports/generate - reportType GRI" "GRI" "$(echo "$RPT_RESULT" | jq -r '.data.reportType')"
assert_contains "POST /esg-reports/generate - has referenceNumber ESGR-" "ESGR-" "$(echo "$RPT_RESULT" | jq -r '.data.referenceNumber')"

echo "  Generating second report..."
RPT2_RESULT=$(curl -s -X POST "$API/api/esg-reports/generate" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "framework": "TCFD",
  "period": "2025-Q4"
}')
RPT2_ID=$(echo "$RPT2_RESULT" | jq -r '.data.id')
assert "POST /esg-reports/generate (TCFD) - success" "true" "$(echo "$RPT2_RESULT" | jq -r '.success')"
assert "POST /esg-reports/generate (TCFD) - reportType TCFD" "TCFD" "$(echo "$RPT2_RESULT" | jq -r '.data.reportType')"

echo "  Listing ESG reports..."
RPT_LIST=$(curl -s "$API/api/esg-reports" -H "$AUTH")
assert "GET /esg-reports - success" "true" "$(echo "$RPT_LIST" | jq -r '.success')"
assert "GET /esg-reports - has records" "true" "$(echo "$RPT_LIST" | jq -r '(.data | length) > 0')"

VAL_RPT=$(curl -s -X POST "$API/api/esg-reports/generate" -H "$AUTH" -H "Content-Type: application/json" -d '{"title":"Test"}')
assert "POST /esg-reports/generate - validation error (missing framework+period)" "VALIDATION_ERROR" "$(echo "$VAL_RPT" | jq -r '.error.code')"

echo ""

# --------------------------------------------------
echo "5. GATEWAY PROXY"
echo "--------------------------------------------------"

echo "  Testing routes through gateway..."
for ROUTE in emissions social esg-reports; do
  GW_RESULT=$(curl -s "$GW/api/esg/$ROUTE" -H "$AUTH")
  assert "Gateway /api/esg/$ROUTE - success" "true" "$(echo "$GW_RESULT" | jq -r '.success')"
done

echo ""

# --------------------------------------------------
echo "6. DELETE OPERATIONS"
echo "--------------------------------------------------"

DEL_EM1=$(curl -s -X DELETE "$API/api/emissions/$EM1_ID" -H "$AUTH")
assert "DELETE /emissions/:id (SCOPE_1) - success" "true" "$(echo "$DEL_EM1" | jq -r '.success')"

DEL_EM2=$(curl -s -X DELETE "$API/api/emissions/$EM2_ID" -H "$AUTH")
assert "DELETE /emissions/:id (SCOPE_2) - success" "true" "$(echo "$DEL_EM2" | jq -r '.success')"

DEL_EM3=$(curl -s -X DELETE "$API/api/emissions/$EM3_ID" -H "$AUTH")
assert "DELETE /emissions/:id (SCOPE_3) - success" "true" "$(echo "$DEL_EM3" | jq -r '.success')"

DEL_SOC=$(curl -s -X DELETE "$API/api/social/$SOC_ID" -H "$AUTH")
assert "DELETE /social/:id - success" "true" "$(echo "$DEL_SOC" | jq -r '.success')"

DEL_SOC2=$(curl -s -X DELETE "$API/api/social/$SOC2_ID" -H "$AUTH")
assert "DELETE /social/:id (second) - success" "true" "$(echo "$DEL_SOC2" | jq -r '.success')"

VERIFY=$(curl -s "$API/api/emissions/$EM1_ID" -H "$AUTH")
assert "Deleted emission returns 404" "NOT_FOUND" "$(echo "$VERIFY" | jq -r '.error.code')"

echo ""
echo "============================================"
echo "  RESULTS: $PASS passed, $FAIL failed (out of $TOTAL)"
echo "============================================"

if [ $FAIL -gt 0 ]; then
  exit 1
fi
