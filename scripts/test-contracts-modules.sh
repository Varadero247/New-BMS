#!/bin/bash
# Comprehensive test script for Contracts modules
# Tests: Contracts, Clauses, Approvals, Renewals, Dashboard

API="http://localhost:4033"
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
echo "  Contracts Modules - Comprehensive Test Suite"
echo "============================================"
echo ""

# ─────────────────────────────────────────────
echo "1. CONTRACTS MODULE"
echo "─────────────────────────────────────────"

# 1a. POST - Create supplier contract
echo "  Creating supplier contract..."
CON_RESULT=$(curl -s -X POST "$API/api/contracts" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "title": "Annual Maintenance Services Agreement - Acme Engineering Ltd",
  "description": "Annual contract for provision of HVAC maintenance, mechanical engineering and facilities support services across all sites",
  "type": "SUPPLIER",
  "status": "ACTIVE",
  "counterparty": "Acme Engineering Ltd",
  "counterpartyContact": "contracts@acme-eng.com",
  "value": 125000.00,
  "currency": "GBP",
  "startDate": "2026-01-01",
  "endDate": "2026-12-31",
  "renewalDate": "2026-10-01",
  "autoRenew": false,
  "noticePeriodDays": 90,
  "paymentTerms": "Net 30 days",
  "owner": "admin@ims.local",
  "ownerName": "Facilities Manager",
  "department": "Facilities",
  "tags": ["maintenance", "hvac", "facilities"],
  "notes": "KPIs reviewed quarterly. SLA: 4hr response for critical issues."
}')
CON_SUCCESS=$(echo "$CON_RESULT" | jq -r '.success')
CON_ID=$(echo "$CON_RESULT" | jq -r '.data.id')
CON_REF=$(echo "$CON_RESULT" | jq -r '.data.referenceNumber')
assert "POST /contracts - success" "true" "$CON_SUCCESS"
assert_contains "POST /contracts - has ref number" "CON-" "$CON_REF"
assert "POST /contracts - status ACTIVE" "ACTIVE" "$(echo "$CON_RESULT" | jq -r '.data.status')"
assert "POST /contracts - type SUPPLIER" "SUPPLIER" "$(echo "$CON_RESULT" | jq -r '.data.type')"
assert "POST /contracts - value correct" "125000" "$(echo "$CON_RESULT" | jq -r '.data.value')"

# 1b. POST - Create NDA contract
echo "  Creating NDA contract..."
CON2_RESULT=$(curl -s -X POST "$API/api/contracts" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "title": "Non-Disclosure Agreement - TechPartner Solutions",
  "description": "Mutual NDA for collaborative software development project",
  "type": "NDA",
  "status": "DRAFT",
  "counterparty": "TechPartner Solutions",
  "currency": "USD",
  "noticePeriodDays": 30,
  "department": "IT"
}')
CON2_ID=$(echo "$CON2_RESULT" | jq -r '.data.id')
assert "POST /contracts - NDA success" "true" "$(echo "$CON2_RESULT" | jq -r '.success')"
assert "POST /contracts - NDA type correct" "NDA" "$(echo "$CON2_RESULT" | jq -r '.data.type')"
assert "POST /contracts - NDA status DRAFT" "DRAFT" "$(echo "$CON2_RESULT" | jq -r '.data.status')"

# 1c. GET - List contracts
echo "  Listing contracts..."
LIST_RESULT=$(curl -s "$API/api/contracts" -H "$AUTH")
assert "GET /contracts - success" "true" "$(echo "$LIST_RESULT" | jq -r '.success')"
assert "GET /contracts - has pagination" "true" "$(echo "$LIST_RESULT" | jq -r '.pagination != null')"
CON_COUNT=$(echo "$LIST_RESULT" | jq -r '.data | length')
assert "GET /contracts - has records" "true" "$([ "$CON_COUNT" -gt 0 ] && echo true || echo false)"

# 1d. GET - Single contract
echo "  Getting single contract..."
GET_RESULT=$(curl -s "$API/api/contracts/$CON_ID" -H "$AUTH")
assert "GET /contracts/:id - success" "true" "$(echo "$GET_RESULT" | jq -r '.success')"
assert "GET /contracts/:id - counterparty correct" "Acme Engineering Ltd" "$(echo "$GET_RESULT" | jq -r '.data.counterparty')"
assert "GET /contracts/:id - currency GBP" "GBP" "$(echo "$GET_RESULT" | jq -r '.data.currency')"

# 1e. PUT - Update contract
echo "  Updating contract..."
PUT_RESULT=$(curl -s -X PUT "$API/api/contracts/$CON_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "notes": "KPIs reviewed quarterly. SLA: 4hr response for critical, 24hr for major. Performance review scheduled Q2 2026."
}')
assert "PUT /contracts/:id - success" "true" "$(echo "$PUT_RESULT" | jq -r '.success')"
assert_contains "PUT /contracts/:id - notes updated" "Q2 2026" "$(echo "$PUT_RESULT" | jq -r '.data.notes')"

# 1f. GET - Filter by status
echo "  Filtering by status..."
FILTER_STATUS=$(curl -s "$API/api/contracts?status=ACTIVE" -H "$AUTH")
assert "GET /contracts?status=ACTIVE" "true" "$(echo "$FILTER_STATUS" | jq -r '.success')"
assert "GET /contracts?status - finds result" "true" "$(echo "$FILTER_STATUS" | jq -r '(.data | length) > 0')"

# 1g. GET - Search contracts
SEARCH_RESULT=$(curl -s "$API/api/contracts?search=Maintenance" -H "$AUTH")
assert "GET /contracts?search - success" "true" "$(echo "$SEARCH_RESULT" | jq -r '.success')"
assert "GET /contracts?search - finds result" "true" "$(echo "$SEARCH_RESULT" | jq -r '(.data | length) > 0')"

# 1h. Validation error - missing title
VAL_RESULT=$(curl -s -X POST "$API/api/contracts" -H "$AUTH" -H "Content-Type: application/json" -d '{"type":"SUPPLIER"}')
assert "POST /contracts - validation error" "VALIDATION_ERROR" "$(echo "$VAL_RESULT" | jq -r '.error.code')"

# 1i. 404 not found
NOT_FOUND=$(curl -s "$API/api/contracts/00000000-0000-0000-0000-000000000999" -H "$AUTH")
assert "GET /contracts/:id - 404" "NOT_FOUND" "$(echo "$NOT_FOUND" | jq -r '.error.code')"

echo ""

# ─────────────────────────────────────────────
echo "2. CLAUSES MODULE"
echo "─────────────────────────────────────────"

# 2a. POST - Create key clause
echo "  Creating contract clause..."
CL_RESULT=$(curl -s -X POST "$API/api/clauses" -H "$AUTH" -H "Content-Type: application/json" -d "{
  \"contractId\": \"$CON_ID\",
  \"title\": \"Liability and Indemnification\",
  \"content\": \"The Supplier shall indemnify and hold harmless the Customer from any claims, losses, damages arising from negligence or breach of contract. Maximum liability is capped at the annual contract value.\",
  \"clauseNumber\": \"7.1\",
  \"category\": \"Liability\",
  \"isKey\": true
}")
CL_SUCCESS=$(echo "$CL_RESULT" | jq -r '.success')
CL_ID=$(echo "$CL_RESULT" | jq -r '.data.id')
CL_REF=$(echo "$CL_RESULT" | jq -r '.data.referenceNumber')
assert "POST /clauses - success" "true" "$CL_SUCCESS"
assert_contains "POST /clauses - has ref number" "CCL-" "$CL_REF"
assert "POST /clauses - isKey true" "true" "$(echo "$CL_RESULT" | jq -r '.data.isKey')"
assert "POST /clauses - clauseNumber correct" "7.1" "$(echo "$CL_RESULT" | jq -r '.data.clauseNumber')"

# 2b. POST - Create second clause
echo "  Creating second clause..."
CL2_RESULT=$(curl -s -X POST "$API/api/clauses" -H "$AUTH" -H "Content-Type: application/json" -d "{
  \"contractId\": \"$CON_ID\",
  \"title\": \"Service Level Agreement\",
  \"content\": \"Response times: Critical - 4 hours, Major - 24 hours, Minor - 5 business days. Failure to meet SLA results in service credit of 5% per breach.\",
  \"clauseNumber\": \"5.2\",
  \"category\": \"SLA\",
  \"isKey\": true
}")
CL2_ID=$(echo "$CL2_RESULT" | jq -r '.data.id')
assert "POST /clauses - second clause success" "true" "$(echo "$CL2_RESULT" | jq -r '.success')"
assert "POST /clauses - second clause category SLA" "SLA" "$(echo "$CL2_RESULT" | jq -r '.data.category')"

# 2c. GET - List clauses
echo "  Listing clauses..."
CL_LIST=$(curl -s "$API/api/clauses" -H "$AUTH")
assert "GET /clauses - success" "true" "$(echo "$CL_LIST" | jq -r '.success')"
assert "GET /clauses - has records" "true" "$(echo "$CL_LIST" | jq -r '(.data | length) > 0')"

# 2d. GET - Single clause
echo "  Getting single clause..."
CL_GET=$(curl -s "$API/api/clauses/$CL_ID" -H "$AUTH")
assert "GET /clauses/:id - success" "true" "$(echo "$CL_GET" | jq -r '.success')"
assert "GET /clauses/:id - title correct" "Liability and Indemnification" "$(echo "$CL_GET" | jq -r '.data.title')"

# 2e. PUT - Update clause
echo "  Updating clause..."
CL_PUT=$(curl -s -X PUT "$API/api/clauses/$CL_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "content": "The Supplier shall indemnify and hold harmless the Customer from any claims, losses, damages arising from negligence or breach of contract. Maximum liability is capped at twice the annual contract value.",
  "isKey": true
}')
assert "PUT /clauses/:id - success" "true" "$(echo "$CL_PUT" | jq -r '.success')"
assert_contains "PUT /clauses/:id - content updated" "twice" "$(echo "$CL_PUT" | jq -r '.data.content')"

# 2f. GET - Search clauses
CL_SEARCH=$(curl -s "$API/api/clauses?search=Liability" -H "$AUTH")
assert "GET /clauses?search - success" "true" "$(echo "$CL_SEARCH" | jq -r '.success')"

# 2g. Validation - missing contractId
VAL_CL=$(curl -s -X POST "$API/api/clauses" -H "$AUTH" -H "Content-Type: application/json" -d '{"title":"Test Clause"}')
assert "POST /clauses - validation error (missing contractId)" "VALIDATION_ERROR" "$(echo "$VAL_CL" | jq -r '.error.code')"

# 2h. 404 clause
CL_404=$(curl -s "$API/api/clauses/00000000-0000-0000-0000-000000000999" -H "$AUTH")
assert "GET /clauses/:id - 404" "NOT_FOUND" "$(echo "$CL_404" | jq -r '.error.code')"

echo ""

# ─────────────────────────────────────────────
echo "3. APPROVALS MODULE"
echo "─────────────────────────────────────────"

# 3a. POST - Create contract approval
echo "  Creating contract approval..."
CAP_RESULT=$(curl -s -X POST "$API/api/approvals" -H "$AUTH" -H "Content-Type: application/json" -d "{
  \"contractId\": \"$CON_ID\",
  \"approver\": \"legal@ims.local\",
  \"approverName\": \"Legal Counsel\",
  \"status\": \"PENDING\",
  \"comments\": \"Under legal review - checking indemnification clauses\"
}")
CAP_SUCCESS=$(echo "$CAP_RESULT" | jq -r '.success')
CAP_ID=$(echo "$CAP_RESULT" | jq -r '.data.id')
CAP_REF=$(echo "$CAP_RESULT" | jq -r '.data.referenceNumber')
assert "POST /approvals - success" "true" "$CAP_SUCCESS"
assert_contains "POST /approvals - has ref number" "CAP-" "$CAP_REF"
assert "POST /approvals - status PENDING" "PENDING" "$(echo "$CAP_RESULT" | jq -r '.data.status')"
assert "POST /approvals - linked to contract" "$CON_ID" "$(echo "$CAP_RESULT" | jq -r '.data.contractId')"

# 3b. GET - List approvals
echo "  Listing approvals..."
CAP_LIST=$(curl -s "$API/api/approvals" -H "$AUTH")
assert "GET /approvals - success" "true" "$(echo "$CAP_LIST" | jq -r '.success')"
assert "GET /approvals - has records" "true" "$(echo "$CAP_LIST" | jq -r '(.data | length) > 0')"

# 3c. GET - Single approval
echo "  Getting single approval..."
CAP_GET=$(curl -s "$API/api/approvals/$CAP_ID" -H "$AUTH")
assert "GET /approvals/:id - success" "true" "$(echo "$CAP_GET" | jq -r '.success')"
assert "GET /approvals/:id - approverName correct" "Legal Counsel" "$(echo "$CAP_GET" | jq -r '.data.approverName')"

# 3d. PUT - Approve contract
echo "  Approving contract..."
CAP_PUT=$(curl -s -X PUT "$API/api/approvals/$CAP_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "status": "APPROVED",
  "comments": "Legal review complete. Indemnification clauses are acceptable. Approved for execution.",
  "decidedAt": "2026-02-23"
}')
assert "PUT /approvals/:id - success" "true" "$(echo "$CAP_PUT" | jq -r '.success')"
assert "PUT /approvals/:id - status APPROVED" "APPROVED" "$(echo "$CAP_PUT" | jq -r '.data.status')"

# 3e. GET - Filter approvals by status
CAP_FILTER=$(curl -s "$API/api/approvals?status=APPROVED" -H "$AUTH")
assert "GET /approvals?status=APPROVED" "true" "$(echo "$CAP_FILTER" | jq -r '.success')"

# 3f. Validation - missing approver
VAL_CAP=$(curl -s -X POST "$API/api/approvals" -H "$AUTH" -H "Content-Type: application/json" -d "{\"contractId\":\"$CON_ID\"}")
assert "POST /approvals - validation error (missing approver)" "VALIDATION_ERROR" "$(echo "$VAL_CAP" | jq -r '.error.code')"

# 3g. 404 approval
CAP_404=$(curl -s "$API/api/approvals/00000000-0000-0000-0000-000000000999" -H "$AUTH")
assert "GET /approvals/:id - 404" "NOT_FOUND" "$(echo "$CAP_404" | jq -r '.error.code')"

echo ""

# ─────────────────────────────────────────────
echo "4. RENEWALS MODULE"
echo "─────────────────────────────────────────"

# 4a. GET - List renewals due within 30 days
echo "  Checking renewals due soon..."
RENEW_RESULT=$(curl -s "$API/api/renewals" -H "$AUTH")
assert "GET /renewals - success" "true" "$(echo "$RENEW_RESULT" | jq -r '.success')"
# This endpoint lists ACTIVE contracts with renewalDate within 30 days
# The contract we created has renewalDate 2026-10-01 so it won't appear here.
# Just assert we get a valid response.
assert "GET /renewals - returns array" "true" "$(echo "$RENEW_RESULT" | jq -r '(.data | type) == "array"')"

echo ""

# ─────────────────────────────────────────────
echo "5. DASHBOARD MODULE"
echo "─────────────────────────────────────────"

# 5a. Get stats
echo "  Getting dashboard stats..."
STATS=$(curl -s "$API/api/dashboard/stats" -H "$AUTH")
assert "GET /dashboard/stats - success" "true" "$(echo "$STATS" | jq -r '.success')"
assert "GET /dashboard/stats - has totalContracts" "true" "$(echo "$STATS" | jq -r '.data.totalContracts != null')"
assert "GET /dashboard/stats - totalContracts > 0" "true" "$(echo "$STATS" | jq -r '.data.totalContracts > 0')"

echo ""

# ─────────────────────────────────────────────
echo "6. GATEWAY PROXY"
echo "─────────────────────────────────────────"

echo "  Testing routes through gateway..."
for ROUTE in contracts clauses approvals renewals; do
  RESULT=$(curl -s "$GW/api/contracts/$ROUTE" -H "$AUTH")
  assert "Gateway /api/contracts/$ROUTE" "true" "$(echo "$RESULT" | jq -r '.success')"
done

echo ""

# ─────────────────────────────────────────────
echo "7. DELETE OPERATIONS"
echo "─────────────────────────────────────────"

echo "  Deleting test records..."
DEL_CAP=$(curl -s -X DELETE "$API/api/approvals/$CAP_ID" -H "$AUTH")
assert "DELETE /approvals/:id" "true" "$(echo "$DEL_CAP" | jq -r '.success')"

DEL_CL=$(curl -s -X DELETE "$API/api/clauses/$CL_ID" -H "$AUTH")
assert "DELETE /clauses/:id" "true" "$(echo "$DEL_CL" | jq -r '.success')"

DEL_CL2=$(curl -s -X DELETE "$API/api/clauses/$CL2_ID" -H "$AUTH")
assert "DELETE /clauses/:id (second)" "true" "$(echo "$DEL_CL2" | jq -r '.success')"

DEL_CON=$(curl -s -X DELETE "$API/api/contracts/$CON_ID" -H "$AUTH")
assert "DELETE /contracts/:id" "true" "$(echo "$DEL_CON" | jq -r '.success')"

DEL_CON2=$(curl -s -X DELETE "$API/api/contracts/$CON2_ID" -H "$AUTH")
assert "DELETE /contracts/:id (second)" "true" "$(echo "$DEL_CON2" | jq -r '.success')"

VERIFY_404=$(curl -s "$API/api/contracts/$CON_ID" -H "$AUTH")
assert "Deleted contract returns 404" "NOT_FOUND" "$(echo "$VERIFY_404" | jq -r '.error.code')"

echo ""
echo "============================================"
echo "  RESULTS: $PASS passed, $FAIL failed (out of $TOTAL)"
echo "============================================"

if [ $FAIL -gt 0 ]; then
  exit 1
fi
