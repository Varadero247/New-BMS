#!/bin/bash
# Comprehensive test script for InfoSec modules
# Tests: Assets, Controls, Risks — CRUD + Gateway

API="http://localhost:4015"
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
echo "  InfoSec Modules - Comprehensive Test Suite"
echo "============================================"
echo ""

# --------------------------------------------------
echo "1. AUTH CHECK"
echo "--------------------------------------------------"
AUTH_RESULT=$(curl -s "$API/api/assets" -H "$AUTH")
assert "Auth token accepted by InfoSec service" "true" "$(echo "$AUTH_RESULT" | jq -r '.success')"
echo ""

# --------------------------------------------------
echo "2. INFORMATION ASSETS MODULE"
echo "--------------------------------------------------"

echo "  Creating information asset..."
ASSET_RESULT=$(curl -s -X POST "$API/api/assets" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "name": "Customer Database Server",
  "type": "HARDWARE",
  "classification": "CONFIDENTIAL",
  "description": "Primary PostgreSQL server holding all customer PII and transaction data",
  "owner": "IT Director",
  "custodian": "Systems Administrator",
  "location": "Data Centre Rack 12A",
  "riskLevel": "HIGH"
}')
ASSET_SUCCESS=$(echo "$ASSET_RESULT" | jq -r '.success')
ASSET_ID=$(echo "$ASSET_RESULT" | jq -r '.data.id')
assert "POST /assets - success" "true" "$ASSET_SUCCESS"
assert "POST /assets - name set" "Customer Database Server" "$(echo "$ASSET_RESULT" | jq -r '.data.name')"
assert "POST /assets - classification CONFIDENTIAL" "CONFIDENTIAL" "$(echo "$ASSET_RESULT" | jq -r '.data.classification')"
assert_contains "POST /assets - has refNumber IA-" "IA-" "$(echo "$ASSET_RESULT" | jq -r '.data.refNumber')"
assert "POST /assets - status ACTIVE by default" "ACTIVE" "$(echo "$ASSET_RESULT" | jq -r '.data.status')"

echo "  Creating second asset..."
ASSET2_RESULT=$(curl -s -X POST "$API/api/assets" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "name": "HR Payroll Application",
  "type": "SOFTWARE",
  "classification": "RESTRICTED",
  "description": "Payroll processing and employee data management system",
  "owner": "HR Director",
  "riskLevel": "CRITICAL"
}')
ASSET2_ID=$(echo "$ASSET2_RESULT" | jq -r '.data.id')
assert "POST /assets (second) - success" "true" "$(echo "$ASSET2_RESULT" | jq -r '.success')"

echo "  Listing assets..."
ASSET_LIST=$(curl -s "$API/api/assets" -H "$AUTH")
assert "GET /assets - success" "true" "$(echo "$ASSET_LIST" | jq -r '.success')"
assert "GET /assets - has records" "true" "$(echo "$ASSET_LIST" | jq -r '(.data | length) > 0')"
assert "GET /assets - pagination present" "true" "$(echo "$ASSET_LIST" | jq -r '.pagination != null')"

echo "  Getting asset by ID..."
ASSET_GET=$(curl -s "$API/api/assets/$ASSET_ID" -H "$AUTH")
assert "GET /assets/:id - success" "true" "$(echo "$ASSET_GET" | jq -r '.success')"
assert "GET /assets/:id - correct name" "Customer Database Server" "$(echo "$ASSET_GET" | jq -r '.data.name')"

echo "  Updating asset..."
ASSET_PUT=$(curl -s -X PUT "$API/api/assets/$ASSET_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "status": "UNDER_REVIEW",
  "description": "Primary PostgreSQL server - under security review Q1 2026"
}')
assert "PUT /assets/:id - success" "true" "$(echo "$ASSET_PUT" | jq -r '.success')"
assert "PUT /assets/:id - status updated" "UNDER_REVIEW" "$(echo "$ASSET_PUT" | jq -r '.data.status')"

echo "  Filtering assets..."
TYPE_FILTER=$(curl -s "$API/api/assets?type=HARDWARE" -H "$AUTH")
assert "GET /assets?type filter - success" "true" "$(echo "$TYPE_FILTER" | jq -r '.success')"

CLASS_FILTER=$(curl -s "$API/api/assets?classification=CONFIDENTIAL" -H "$AUTH")
assert "GET /assets?classification filter - success" "true" "$(echo "$CLASS_FILTER" | jq -r '.success')"

RISK_FILTER=$(curl -s "$API/api/assets?riskLevel=CRITICAL" -H "$AUTH")
assert "GET /assets?riskLevel filter - success" "true" "$(echo "$RISK_FILTER" | jq -r '.success')"

VAL_ASSET=$(curl -s -X POST "$API/api/assets" -H "$AUTH" -H "Content-Type: application/json" -d '{"name":"Test"}')
assert "POST /assets - validation error (missing type+classification)" "VALIDATION_ERROR" "$(echo "$VAL_ASSET" | jq -r '.error.code')"

NOT_FOUND=$(curl -s "$API/api/assets/00000000-0000-0000-0000-000000000099" -H "$AUTH")
assert "GET /assets/:id - 404 for missing asset" "NOT_FOUND" "$(echo "$NOT_FOUND" | jq -r '.error.code')"

echo ""

# --------------------------------------------------
echo "3. CONTROLS MODULE"
echo "--------------------------------------------------"

echo "  Listing controls..."
CTRL_LIST=$(curl -s "$API/api/controls" -H "$AUTH")
assert "GET /controls - success" "true" "$(echo "$CTRL_LIST" | jq -r '.success')"
assert "GET /controls - has data array" "true" "$(echo "$CTRL_LIST" | jq -r '.data != null')"

echo "  Getting Statement of Applicability..."
SOA_RESULT=$(curl -s "$API/api/controls/soa" -H "$AUTH")
assert "GET /controls/soa - success" "true" "$(echo "$SOA_RESULT" | jq -r '.success')"
assert "GET /controls/soa - has data array" "true" "$(echo "$SOA_RESULT" | jq -r '.data != null')"

echo "  Filtering controls by domain..."
DOMAIN_FILTER=$(curl -s "$API/api/controls?domain=ACCESS_CONTROL" -H "$AUTH")
assert "GET /controls?domain filter - success" "true" "$(echo "$DOMAIN_FILTER" | jq -r '.success')"

STATUS_FILTER=$(curl -s "$API/api/controls?implementationStatus=NOT_IMPLEMENTED" -H "$AUTH")
assert "GET /controls?implementationStatus filter - success" "true" "$(echo "$STATUS_FILTER" | jq -r '.success')"

APPL_FILTER=$(curl -s "$API/api/controls?applicability=APPLICABLE" -H "$AUTH")
assert "GET /controls?applicability filter - success" "true" "$(echo "$APPL_FILTER" | jq -r '.success')"

echo "  Testing control detail..."
CTRL_LIST2=$(curl -s "$API/api/controls?limit=1" -H "$AUTH")
CTRL_ID=$(echo "$CTRL_LIST2" | jq -r '.data[0].id // empty')
if [ -n "$CTRL_ID" ] && [ "$CTRL_ID" != "null" ]; then
  CTRL_GET=$(curl -s "$API/api/controls/$CTRL_ID" -H "$AUTH")
  assert "GET /controls/:id - success" "true" "$(echo "$CTRL_GET" | jq -r '.success')"

  echo "  Updating control status..."
  CTRL_STATUS=$(curl -s -X PUT "$API/api/controls/$CTRL_ID/status" -H "$AUTH" -H "Content-Type: application/json" -d '{
    "applicability": "APPLICABLE",
    "justification": "Required for ISO 27001 compliance"
  }')
  assert "PUT /controls/:id/status - success" "true" "$(echo "$CTRL_STATUS" | jq -r '.success')"

  CTRL_IMPL=$(curl -s -X PUT "$API/api/controls/$CTRL_ID/implementation" -H "$AUTH" -H "Content-Type: application/json" -d '{
    "implementationStatus": "PARTIALLY_IMPLEMENTED",
    "implementationNotes": "Policy drafted, technical controls 50% complete",
    "implementationDate": "2026-01-15"
  }')
  assert "PUT /controls/:id/implementation - success" "true" "$(echo "$CTRL_IMPL" | jq -r '.success')"
else
  assert "GET /controls/:id - controls available" "true" "false"
  assert "PUT /controls/:id/status - controls available" "true" "false"
  assert "PUT /controls/:id/implementation - controls available" "true" "false"
fi

echo ""

# --------------------------------------------------
echo "4. RISK ASSESSMENT MODULE"
echo "--------------------------------------------------"

echo "  Creating information security risk..."
RISK_RESULT=$(curl -s -X POST "$API/api/risks" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "title": "Unauthorised access to customer database",
  "description": "Risk of external attacker gaining access to customer PII via SQL injection vulnerability",
  "threat": "External attacker exploiting SQL injection",
  "vulnerability": "Unpatched web application with SQL injection weakness",
  "likelihood": 3,
  "impact": 5,
  "category": "CYBER",
  "owner": "CISO"
}')
RISK_SUCCESS=$(echo "$RISK_RESULT" | jq -r '.success')
RISK_ID=$(echo "$RISK_RESULT" | jq -r '.data.id')
assert "POST /risks - success" "true" "$RISK_SUCCESS"
assert "POST /risks - title set" "Unauthorised access to customer database" "$(echo "$RISK_RESULT" | jq -r '.data.title')"
assert_contains "POST /risks - has refNumber ISR-" "ISR-" "$(echo "$RISK_RESULT" | jq -r '.data.refNumber')"
assert "POST /risks - riskScore calculated (3*5=15)" "15" "$(echo "$RISK_RESULT" | jq -r '.data.riskScore')"
assert "POST /risks - riskLevel HIGH for score 15" "HIGH" "$(echo "$RISK_RESULT" | jq -r '.data.riskLevel')"

echo "  Creating second risk..."
RISK2_RESULT=$(curl -s -X POST "$API/api/risks" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "title": "Phishing attack on staff",
  "description": "Employees may fall victim to phishing emails leading to credential theft",
  "threat": "Phishing email campaign",
  "vulnerability": "Insufficient security awareness training",
  "likelihood": 4,
  "impact": 3,
  "category": "SOCIAL_ENGINEERING",
  "owner": "IT Security Manager"
}')
RISK2_ID=$(echo "$RISK2_RESULT" | jq -r '.data.id')
assert "POST /risks (second) - success" "true" "$(echo "$RISK2_RESULT" | jq -r '.success')"

echo "  Listing risks..."
RISK_LIST=$(curl -s "$API/api/risks" -H "$AUTH")
assert "GET /risks - success" "true" "$(echo "$RISK_LIST" | jq -r '.success')"
assert "GET /risks - has records" "true" "$(echo "$RISK_LIST" | jq -r '(.data | length) > 0')"

echo "  Getting risk by ID..."
RISK_GET=$(curl -s "$API/api/risks/$RISK_ID" -H "$AUTH")
assert "GET /risks/:id - success" "true" "$(echo "$RISK_GET" | jq -r '.success')"
assert "GET /risks/:id - correct title" "Unauthorised access to customer database" "$(echo "$RISK_GET" | jq -r '.data.title')"

echo "  Updating risk..."
RISK_PUT=$(curl -s -X PUT "$API/api/risks/$RISK_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "status": "ASSESSED",
  "owner": "CISO - updated"
}')
assert "PUT /risks/:id - success" "true" "$(echo "$RISK_PUT" | jq -r '.success')"
assert "PUT /risks/:id - status updated" "ASSESSED" "$(echo "$RISK_PUT" | jq -r '.data.status')"

echo "  Applying treatment plan..."
TREAT_RESULT=$(curl -s -X POST "$API/api/risks/$RISK_ID/treatment" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "treatment": "MITIGATE",
  "treatmentPlan": "1. Patch all web applications. 2. Deploy WAF. 3. Conduct penetration test. 4. Enable database activity monitoring.",
  "residualLikelihood": 2,
  "residualImpact": 4
}')
assert "POST /risks/:id/treatment - success" "true" "$(echo "$TREAT_RESULT" | jq -r '.success')"
assert "POST /risks/:id/treatment - treatment set" "MITIGATE" "$(echo "$TREAT_RESULT" | jq -r '.data.treatment')"

echo "  Filtering risks..."
LEVEL_FILTER=$(curl -s "$API/api/risks?riskLevel=HIGH" -H "$AUTH")
assert "GET /risks?riskLevel filter - success" "true" "$(echo "$LEVEL_FILTER" | jq -r '.success')"

STATUS_FILTER=$(curl -s "$API/api/risks?status=ASSESSED" -H "$AUTH")
assert "GET /risks?status filter - success" "true" "$(echo "$STATUS_FILTER" | jq -r '.success')"

HEAT_MAP=$(curl -s "$API/api/risks/heat-map" -H "$AUTH")
assert "GET /risks/heat-map - success" "true" "$(echo "$HEAT_MAP" | jq -r '.success')"

VAL_RISK=$(curl -s -X POST "$API/api/risks" -H "$AUTH" -H "Content-Type: application/json" -d '{"title":"Test"}')
assert "POST /risks - validation error (missing required fields)" "VALIDATION_ERROR" "$(echo "$VAL_RISK" | jq -r '.error.code')"

NOT_FOUND_R=$(curl -s "$API/api/risks/00000000-0000-0000-0000-000000000099" -H "$AUTH")
assert "GET /risks/:id - 404 for missing risk" "NOT_FOUND" "$(echo "$NOT_FOUND_R" | jq -r '.error.code')"

echo ""

# --------------------------------------------------
echo "5. GATEWAY PROXY"
echo "--------------------------------------------------"

echo "  Testing routes through gateway..."
for ROUTE in assets controls risks; do
  GW_RESULT=$(curl -s "$GW/api/infosec/$ROUTE" -H "$AUTH")
  assert "Gateway /api/infosec/$ROUTE - success" "true" "$(echo "$GW_RESULT" | jq -r '.success')"
done

echo ""

# --------------------------------------------------
echo "6. DELETE OPERATIONS"
echo "--------------------------------------------------"

DEL_ASSET=$(curl -s -X DELETE "$API/api/assets/$ASSET_ID" -H "$AUTH")
assert "DELETE /assets/:id - success" "true" "$(echo "$DEL_ASSET" | jq -r '.success')"

DEL_ASSET2=$(curl -s -X DELETE "$API/api/assets/$ASSET2_ID" -H "$AUTH")
assert "DELETE /assets/:id (second) - success" "true" "$(echo "$DEL_ASSET2" | jq -r '.success')"

DEL_RISK=$(curl -s -X DELETE "$API/api/risks/$RISK_ID" -H "$AUTH")
assert "DELETE /risks/:id - success" "true" "$(echo "$DEL_RISK" | jq -r '.success')"

DEL_RISK2=$(curl -s -X DELETE "$API/api/risks/$RISK2_ID" -H "$AUTH")
assert "DELETE /risks/:id (second) - success" "true" "$(echo "$DEL_RISK2" | jq -r '.success')"

VERIFY=$(curl -s "$API/api/assets/$ASSET_ID" -H "$AUTH")
assert "Deleted asset returns 404" "NOT_FOUND" "$(echo "$VERIFY" | jq -r '.error.code')"

echo ""
echo "============================================"
echo "  RESULTS: $PASS passed, $FAIL failed (out of $TOTAL)"
echo "============================================"

if [ $FAIL -gt 0 ]; then
  exit 1
fi
