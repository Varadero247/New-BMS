#!/bin/bash
# Comprehensive test script for Automotive modules (IATF 16949)
# Tests: APQP, PPAP, Control Plans, FMEA, 8D, Customer Reqs, CSR — CRUD + Gateway

API="http://localhost:4010"
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
echo "  Automotive Modules - Comprehensive Test Suite (IATF 16949)"
echo "============================================"
echo ""

# -------------------------------------------------
echo "1. HEALTH CHECK"
echo "-------------------------------------------------"

HEALTH=$(curl -s "$API/health")
assert "GET /health - success" "true" "$(echo "$HEALTH" | jq -r '.success')"
assert_contains "GET /health - service name" "api-automotive" "$(echo "$HEALTH" | jq -r '.service')"

echo ""

# -------------------------------------------------
echo "2. APQP MODULE (Advanced Product Quality Planning)"
echo "-------------------------------------------------"

echo "  Creating APQP project..."
APQP_RESULT=$(curl -s -X POST "$API/api/apqp" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "title": "Brake Caliper Bracket - New Platform Launch",
  "partNumber": "BCB-2026-001",
  "partName": "Brake Caliper Bracket",
  "customer": "Tier1-AutoOEM",
  "programName": "EV Platform Alpha",
  "startDate": "2026-01-15",
  "targetDate": "2026-12-31",
  "teamLeader": "John Smith",
  "teamMembers": ["Alice Brown", "Bob Chen", "Carol Davis"],
  "status": "IN_PROGRESS"
}')
APQP_SUCCESS=$(echo "$APQP_RESULT" | jq -r '.success')
APQP_ID=$(echo "$APQP_RESULT" | jq -r '.data.id')
APQP_REF=$(echo "$APQP_RESULT" | jq -r '.data.refNumber')
assert "POST /apqp - success" "true" "$APQP_SUCCESS"
assert_contains "POST /apqp - has ref number" "APQP-" "$APQP_REF"
assert "POST /apqp - has 5 phases" "5" "$(echo "$APQP_RESULT" | jq -r '.data.phases | length')"

echo "  Listing APQP projects..."
APQP_LIST=$(curl -s "$API/api/apqp" -H "$AUTH")
assert "GET /apqp - success" "true" "$(echo "$APQP_LIST" | jq -r '.success')"
assert "GET /apqp - has records" "true" "$(echo "$APQP_LIST" | jq -r '(.data | length) > 0')"

echo "  Getting single APQP project..."
APQP_GET=$(curl -s "$API/api/apqp/$APQP_ID" -H "$AUTH")
assert "GET /apqp/:id - success" "true" "$(echo "$APQP_GET" | jq -r '.success')"
assert "GET /apqp/:id - correct title" "Brake Caliper Bracket - New Platform Launch" "$(echo "$APQP_GET" | jq -r '.data.title')"

echo "  Updating APQP project..."
APQP_PUT=$(curl -s -X PUT "$API/api/apqp/$APQP_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{"status":"IN_PROGRESS","teamLeader":"Jane Smith"}')
assert "PUT /apqp/:id - success" "true" "$(echo "$APQP_PUT" | jq -r '.success')"
assert "PUT /apqp/:id - leader updated" "Jane Smith" "$(echo "$APQP_PUT" | jq -r '.data.teamLeader')"

echo "  Getting APQP status report..."
APQP_REPORT=$(curl -s "$API/api/apqp/$APQP_ID/status-report" -H "$AUTH")
assert "GET /apqp/:id/status-report - success" "true" "$(echo "$APQP_REPORT" | jq -r '.success')"

echo "  Filtering APQP by status..."
APQP_FILTER=$(curl -s "$API/api/apqp?status=IN_PROGRESS" -H "$AUTH")
assert "GET /apqp?status filter - success" "true" "$(echo "$APQP_FILTER" | jq -r '.success')"

echo "  Testing APQP 404..."
APQP_404=$(curl -s "$API/api/apqp/00000000-0000-0000-0000-000000000999" -H "$AUTH")
assert "GET /apqp/:id - 404" "NOT_FOUND" "$(echo "$APQP_404" | jq -r '.error.code')"

echo ""

# -------------------------------------------------
echo "3. FMEA MODULE (Failure Mode and Effects Analysis)"
echo "-------------------------------------------------"

echo "  Creating FMEA study..."
FMEA_RESULT=$(curl -s -X POST "$API/api/fmea" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "title": "Brake Caliper Bracket PFMEA",
  "fmeaType": "PFMEA",
  "partNumber": "BCB-2026-001",
  "partName": "Brake Caliper Bracket",
  "customer": "Tier1-AutoOEM",
  "revision": "A",
  "preparedBy": "John Smith",
  "reviewedBy": "Jane Smith",
  "scope": "Stamping and welding operations for brake caliper bracket"
}')
FMEA_SUCCESS=$(echo "$FMEA_RESULT" | jq -r '.success')
FMEA_ID=$(echo "$FMEA_RESULT" | jq -r '.data.id')
FMEA_REF=$(echo "$FMEA_RESULT" | jq -r '.data.refNumber')
assert "POST /fmea - success" "true" "$FMEA_SUCCESS"
assert_contains "POST /fmea - has ref number" "FMEA-" "$FMEA_REF"
assert "POST /fmea - type is PFMEA" "PFMEA" "$(echo "$FMEA_RESULT" | jq -r '.data.fmeaType')"

echo "  Adding FMEA item..."
ITEM_RESULT=$(curl -s -X POST "$API/api/fmea/$FMEA_ID/items" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "itemNumber": 1,
  "processStep": "Stamping",
  "function": "Form bracket to specified geometry",
  "failureMode": "Dimensional non-conformance",
  "failureEffect": "Incorrect fit causing brake system failure",
  "severity": 9,
  "potentialCauses": "Tool wear, incorrect die setup",
  "occurrence": 3,
  "currentControls": "SPC monitoring, first-off inspection",
  "detection": 2,
  "recommendedAction": "Implement 100% vision system inspection",
  "responsibility": "Process Engineer",
  "targetDate": "2026-06-30"
}')
assert "POST /fmea/:id/items - success" "true" "$(echo "$ITEM_RESULT" | jq -r '.success')"
ITEM_ID=$(echo "$ITEM_RESULT" | jq -r '.data.id')
RPN=$(echo "$ITEM_RESULT" | jq -r '.data.rpn')
assert "POST /fmea item - RPN calculated (9*3*2=54)" "54" "$RPN"

echo "  Listing FMEA studies..."
FMEA_LIST=$(curl -s "$API/api/fmea" -H "$AUTH")
assert "GET /fmea - success" "true" "$(echo "$FMEA_LIST" | jq -r '.success')"
assert "GET /fmea - has records" "true" "$(echo "$FMEA_LIST" | jq -r '(.data | length) > 0')"

echo "  Getting single FMEA study..."
FMEA_GET=$(curl -s "$API/api/fmea/$FMEA_ID" -H "$AUTH")
assert "GET /fmea/:id - success" "true" "$(echo "$FMEA_GET" | jq -r '.success')"
assert "GET /fmea/:id - includes items" "true" "$(echo "$FMEA_GET" | jq -r '.data.items != null')"

echo "  Updating FMEA study..."
FMEA_PUT=$(curl -s -X PUT "$API/api/fmea/$FMEA_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{"status":"IN_REVIEW","revision":"B"}')
assert "PUT /fmea/:id - success" "true" "$(echo "$FMEA_PUT" | jq -r '.success')"
assert "PUT /fmea/:id - status updated" "IN_REVIEW" "$(echo "$FMEA_PUT" | jq -r '.data.status')"

echo "  Filtering FMEA by type..."
FMEA_FILTER=$(curl -s "$API/api/fmea?fmeaType=PFMEA" -H "$AUTH")
assert "GET /fmea?fmeaType filter - success" "true" "$(echo "$FMEA_FILTER" | jq -r '.success')"

echo ""

# -------------------------------------------------
echo "4. PPAP MODULE (Production Part Approval Process)"
echo "-------------------------------------------------"

echo "  Creating PPAP project..."
PPAP_RESULT=$(curl -s -X POST "$API/api/ppap" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "partNumber": "BCB-2026-001",
  "partName": "Brake Caliper Bracket",
  "customer": "Tier1-AutoOEM",
  "submissionLevel": 3
}')
PPAP_SUCCESS=$(echo "$PPAP_RESULT" | jq -r '.success')
PPAP_ID=$(echo "$PPAP_RESULT" | jq -r '.data.id')
PPAP_REF=$(echo "$PPAP_RESULT" | jq -r '.data.refNumber')
assert "POST /ppap - success" "true" "$PPAP_SUCCESS"
assert_contains "POST /ppap - has ref number" "PPAP-" "$PPAP_REF"
assert "POST /ppap - submission level 3" "3" "$(echo "$PPAP_RESULT" | jq -r '.data.submissionLevel')"
assert "POST /ppap - has 18 elements" "18" "$(echo "$PPAP_RESULT" | jq -r '.data.elements | length')"

echo "  Listing PPAP projects..."
PPAP_LIST=$(curl -s "$API/api/ppap" -H "$AUTH")
assert "GET /ppap - success" "true" "$(echo "$PPAP_LIST" | jq -r '.success')"
assert "GET /ppap - has records" "true" "$(echo "$PPAP_LIST" | jq -r '(.data | length) > 0')"

echo "  Getting single PPAP project..."
PPAP_GET=$(curl -s "$API/api/ppap/$PPAP_ID" -H "$AUTH")
assert "GET /ppap/:id - success" "true" "$(echo "$PPAP_GET" | jq -r '.success')"
assert "GET /ppap/:id - submission level 3" "3" "$(echo "$PPAP_GET" | jq -r '.data.submissionLevel')"

echo "  Checking PPAP readiness..."
PPAP_READY=$(curl -s "$API/api/ppap/$PPAP_ID/readiness" -H "$AUTH")
assert "GET /ppap/:id/readiness - success" "true" "$(echo "$PPAP_READY" | jq -r '.success')"

echo ""

# -------------------------------------------------
echo "5. 8D MODULE (Eight Disciplines Problem Solving)"
echo "-------------------------------------------------"

echo "  Creating 8D report..."
EIGHTD_RESULT=$(curl -s -X POST "$API/api/8d" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "title": "Dimensional non-conformance on BCB-2026-001",
  "problemStatement": "Customer returned 50 brackets due to out-of-spec hole diameter on feature F3, affecting brake system assembly at customer plant",
  "customer": "Tier1-AutoOEM",
  "partNumber": "BCB-2026-001",
  "partName": "Brake Caliper Bracket",
  "severity": "HIGH",
  "teamLeader": "John Smith",
  "teamMembers": ["Alice Brown", "Bob Chen", "Carol Davis", "Dave Evans"]
}')
EIGHTD_SUCCESS=$(echo "$EIGHTD_RESULT" | jq -r '.success')
EIGHTD_ID=$(echo "$EIGHTD_RESULT" | jq -r '.data.id')
EIGHTD_REF=$(echo "$EIGHTD_RESULT" | jq -r '.data.refNumber')
assert "POST /8d - success" "true" "$EIGHTD_SUCCESS"
assert_contains "POST /8d - has ref number" "8D-" "$EIGHTD_REF"
assert "POST /8d - initial status D1" "D1_TEAM_FORMATION" "$(echo "$EIGHTD_RESULT" | jq -r '.data.status')"

echo "  Listing 8D reports..."
EIGHTD_LIST=$(curl -s "$API/api/8d" -H "$AUTH")
assert "GET /8d - success" "true" "$(echo "$EIGHTD_LIST" | jq -r '.success')"
assert "GET /8d - has records" "true" "$(echo "$EIGHTD_LIST" | jq -r '(.data | length) > 0')"

echo "  Getting single 8D report..."
EIGHTD_GET=$(curl -s "$API/api/8d/$EIGHTD_ID" -H "$AUTH")
assert "GET /8d/:id - success" "true" "$(echo "$EIGHTD_GET" | jq -r '.success')"

echo "  Getting 8D stats..."
EIGHTD_STATS=$(curl -s "$API/api/8d/stats" -H "$AUTH")
assert "GET /8d/stats - success" "true" "$(echo "$EIGHTD_STATS" | jq -r '.success')"

echo "  Updating 8D report..."
EIGHTD_PUT=$(curl -s -X PUT "$API/api/8d/$EIGHTD_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{"status":"D3_CONTAINMENT","d3ContainmentAction":"100% inspection of all shipped brackets, customer sort of in-field stock","d3CompletedDate":"2026-02-24"}')
assert "PUT /8d/:id - success" "true" "$(echo "$EIGHTD_PUT" | jq -r '.success')"
assert "PUT /8d/:id - status progressed" "D3_CONTAINMENT" "$(echo "$EIGHTD_PUT" | jq -r '.data.status')"

echo "  Filtering 8D by severity..."
EIGHTD_FILTER=$(curl -s "$API/api/8d?severity=HIGH" -H "$AUTH")
assert "GET /8d?severity filter - success" "true" "$(echo "$EIGHTD_FILTER" | jq -r '.success')"

echo ""

# -------------------------------------------------
echo "6. CUSTOMER REQUIREMENTS MODULE"
echo "-------------------------------------------------"

echo "  Creating customer requirement..."
CST_REQ_RESULT=$(curl -s -X POST "$API/api/customer-reqs" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "customer": "Tier1-AutoOEM",
  "requirementCode": "CSR-OEM-001",
  "title": "PPAP submission required for all new parts",
  "description": "All new or changed production parts must be submitted with PPAP Level 3 documentation before SOP",
  "category": "QUALITY",
  "mandatory": true,
  "effectiveDate": "2026-01-01",
  "source": "Customer Specific Requirements Document Rev 5",
  "applicableParts": ["BCB-2026-001", "BCB-2026-002"]
}')
CST_REQ_SUCCESS=$(echo "$CST_REQ_RESULT" | jq -r '.success')
CST_REQ_ID=$(echo "$CST_REQ_RESULT" | jq -r '.data.id')
assert "POST /customer-reqs - success" "true" "$CST_REQ_SUCCESS"
assert "POST /customer-reqs - customer set" "Tier1-AutoOEM" "$(echo "$CST_REQ_RESULT" | jq -r '.data.customer')"

echo "  Listing customer requirements..."
CST_LIST=$(curl -s "$API/api/customer-reqs" -H "$AUTH")
assert "GET /customer-reqs - success" "true" "$(echo "$CST_LIST" | jq -r '.success')"
assert "GET /customer-reqs - has records" "true" "$(echo "$CST_LIST" | jq -r '(.data | length) > 0')"

echo "  Getting customer list..."
CST_CUSTOMERS=$(curl -s "$API/api/customer-reqs/customers" -H "$AUTH")
assert "GET /customer-reqs/customers - success" "true" "$(echo "$CST_CUSTOMERS" | jq -r '.success')"

echo "  Getting compliance summary..."
CST_SUMMARY=$(curl -s "$API/api/customer-reqs/compliance-summary" -H "$AUTH")
assert "GET /customer-reqs/compliance-summary - success" "true" "$(echo "$CST_SUMMARY" | jq -r '.success')"

echo "  Getting single requirement..."
CST_GET=$(curl -s "$API/api/customer-reqs/$CST_REQ_ID" -H "$AUTH")
assert "GET /customer-reqs/:id - success" "true" "$(echo "$CST_GET" | jq -r '.success')"

echo "  Updating customer requirement..."
CST_PUT=$(curl -s -X PUT "$API/api/customer-reqs/$CST_REQ_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{"complianceStatus":"COMPLIANT","notes":"PPAP package submitted and approved by customer"}')
assert "PUT /customer-reqs/:id - success" "true" "$(echo "$CST_PUT" | jq -r '.success')"

echo ""

# -------------------------------------------------
echo "7. CSR MODULE (Customer Specific Requirements)"
echo "-------------------------------------------------"

echo "  Getting OEM list..."
CSR_OEMS=$(curl -s "$API/api/csr/oems" -H "$AUTH")
assert "GET /csr/oems - success" "true" "$(echo "$CSR_OEMS" | jq -r '.success')"
assert "GET /csr/oems - has OEM list" "true" "$(echo "$CSR_OEMS" | jq -r '(.data | length) > 0')"

echo "  Getting compliance gaps..."
CSR_GAPS=$(curl -s "$API/api/csr/gaps" -H "$AUTH")
assert "GET /csr/gaps - success" "true" "$(echo "$CSR_GAPS" | jq -r '.success')"

echo ""

# -------------------------------------------------
echo "8. CONTROL PLANS MODULE"
echo "-------------------------------------------------"

echo "  Creating control plan..."
CP_RESULT=$(curl -s -X POST "$API/api/control-plans" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "partNumber": "BCB-2026-001",
  "partName": "Brake Caliper Bracket",
  "customer": "Tier1-AutoOEM",
  "planType": "PRODUCTION",
  "revision": "A",
  "preparedBy": "John Smith",
  "approvedBy": "Jane Smith"
}')
CP_SUCCESS=$(echo "$CP_RESULT" | jq -r '.success')
CP_ID=$(echo "$CP_RESULT" | jq -r '.data.id')
assert "POST /control-plans - success" "true" "$CP_SUCCESS"
assert "POST /control-plans - part number set" "BCB-2026-001" "$(echo "$CP_RESULT" | jq -r '.data.partNumber')"

echo "  Listing control plans..."
CP_LIST=$(curl -s "$API/api/control-plans" -H "$AUTH")
assert "GET /control-plans - success" "true" "$(echo "$CP_LIST" | jq -r '.success')"
assert "GET /control-plans - has records" "true" "$(echo "$CP_LIST" | jq -r '(.data | length) > 0')"

echo "  Getting single control plan..."
CP_GET=$(curl -s "$API/api/control-plans/$CP_ID" -H "$AUTH")
assert "GET /control-plans/:id - success" "true" "$(echo "$CP_GET" | jq -r '.success')"

echo ""

# -------------------------------------------------
echo "9. DELETE OPERATIONS"
echo "-------------------------------------------------"

echo "  Deleting test records..."
DEL_APQP=$(curl -s -X DELETE "$API/api/apqp/$APQP_ID" -H "$AUTH")
assert "DELETE /apqp/:id" "true" "$(echo "$DEL_APQP" | jq -r '.success')"

DEL_FMEA=$(curl -s -X DELETE "$API/api/fmea/$FMEA_ID" -H "$AUTH")
assert "DELETE /fmea/:id" "true" "$(echo "$DEL_FMEA" | jq -r '.success')"

DEL_8D=$(curl -s -X DELETE "$API/api/8d/$EIGHTD_ID" -H "$AUTH")
assert "DELETE /8d/:id" "true" "$(echo "$DEL_8D" | jq -r '.success')"

DEL_CST=$(curl -s -X DELETE "$API/api/customer-reqs/$CST_REQ_ID" -H "$AUTH")
assert "DELETE /customer-reqs/:id" "true" "$(echo "$DEL_CST" | jq -r '.success')"

echo "  Verifying deletes..."
VERIFY_APQP=$(curl -s "$API/api/apqp/$APQP_ID" -H "$AUTH")
assert "Deleted APQP returns 404" "NOT_FOUND" "$(echo "$VERIFY_APQP" | jq -r '.error.code')"

VERIFY_FMEA=$(curl -s "$API/api/fmea/$FMEA_ID" -H "$AUTH")
assert "Deleted FMEA returns 404" "NOT_FOUND" "$(echo "$VERIFY_FMEA" | jq -r '.error.code')"

echo ""

# -------------------------------------------------
echo "10. GATEWAY PROXY"
echo "-------------------------------------------------"

echo "  Testing routes through gateway..."
for ROUTE in apqp ppap fmea 8d customer-reqs; do
  RESULT=$(curl -s "$GW/api/automotive/$ROUTE" -H "$AUTH")
  assert "Gateway /api/automotive/$ROUTE" "true" "$(echo "$RESULT" | jq -r '.success')"
done

echo ""
echo "============================================"
echo "  RESULTS: $PASS passed, $FAIL failed (out of $TOTAL)"
echo "============================================"

if [ $FAIL -gt 0 ]; then
  exit 1
fi
