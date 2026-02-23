#!/bin/bash
# Comprehensive test script for CRM modules
# Tests: Contacts, Accounts, Deals — CRUD + Gateway

API="http://localhost:4014"
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
echo "  CRM Modules - Comprehensive Test Suite"
echo "============================================"
echo ""

# --------------------------------------------------
echo "1. AUTH CHECK"
echo "--------------------------------------------------"
AUTH_RESULT=$(curl -s "$API/api/contacts" -H "$AUTH")
assert "Auth token accepted by CRM service" "true" "$(echo "$AUTH_RESULT" | jq -r '.success')"
echo ""

# --------------------------------------------------
echo "2. ACCOUNTS MODULE"
echo "--------------------------------------------------"

echo "  Creating account..."
ACC_RESULT=$(curl -s -X POST "$API/api/accounts" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "name": "Acme Corporation",
  "type": "CUSTOMER",
  "industry": "Manufacturing",
  "phone": "+1-555-0100",
  "email": "info@acme.example.com",
  "address": "123 Industrial Park",
  "city": "Detroit",
  "state": "MI",
  "country": "USA",
  "postalCode": "48201",
  "annualRevenue": 5000000,
  "employeeCount": 250,
  "notes": "Key manufacturing client"
}')
ACC_SUCCESS=$(echo "$ACC_RESULT" | jq -r '.success')
ACC_ID=$(echo "$ACC_RESULT" | jq -r '.data.id')
assert "POST /accounts - success" "true" "$ACC_SUCCESS"
assert "POST /accounts - name set" "Acme Corporation" "$(echo "$ACC_RESULT" | jq -r '.data.name')"

echo "  Listing accounts..."
ACC_LIST=$(curl -s "$API/api/accounts" -H "$AUTH")
assert "GET /accounts - success" "true" "$(echo "$ACC_LIST" | jq -r '.success')"
assert "GET /accounts - has data array" "true" "$(echo "$ACC_LIST" | jq -r '(.data | length) >= 0')"
assert "GET /accounts - pagination present" "true" "$(echo "$ACC_LIST" | jq -r '.pagination != null')"

echo "  Getting account by ID..."
ACC_GET=$(curl -s "$API/api/accounts/$ACC_ID" -H "$AUTH")
assert "GET /accounts/:id - success" "true" "$(echo "$ACC_GET" | jq -r '.success')"
assert "GET /accounts/:id - correct name" "Acme Corporation" "$(echo "$ACC_GET" | jq -r '.data.name')"

echo "  Updating account..."
ACC_PUT=$(curl -s -X PUT "$API/api/accounts/$ACC_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "notes": "Key manufacturing client - updated Q1 2026",
  "annualRevenue": 6000000,
  "qualitySupplierScore": 88
}')
assert "PUT /accounts/:id - success" "true" "$(echo "$ACC_PUT" | jq -r '.success')"
assert "PUT /accounts/:id - revenue updated" "6000000" "$(echo "$ACC_PUT" | jq -r '.data.annualRevenue')"

echo "  Getting account sub-resources..."
ACC_CONTACTS=$(curl -s "$API/api/accounts/$ACC_ID/contacts" -H "$AUTH")
assert "GET /accounts/:id/contacts - success" "true" "$(echo "$ACC_CONTACTS" | jq -r '.success')"

ACC_DEALS=$(curl -s "$API/api/accounts/$ACC_ID/deals" -H "$AUTH")
assert "GET /accounts/:id/deals - success" "true" "$(echo "$ACC_DEALS" | jq -r '.success')"

ACC_COMPLIANCE=$(curl -s "$API/api/accounts/$ACC_ID/compliance" -H "$AUTH")
assert "GET /accounts/:id/compliance - success" "true" "$(echo "$ACC_COMPLIANCE" | jq -r '.success')"
assert "GET /accounts/:id/compliance - has riskLevel" "true" "$(echo "$ACC_COMPLIANCE" | jq -r '.data.riskLevel != null')"

TYPE_FILTER=$(curl -s "$API/api/accounts?type=CUSTOMER" -H "$AUTH")
assert "GET /accounts?type filter - success" "true" "$(echo "$TYPE_FILTER" | jq -r '.success')"

SEARCH_RESULT=$(curl -s "$API/api/accounts?search=Acme" -H "$AUTH")
assert "GET /accounts?search - success" "true" "$(echo "$SEARCH_RESULT" | jq -r '.success')"

VAL_RESULT=$(curl -s -X POST "$API/api/accounts" -H "$AUTH" -H "Content-Type: application/json" -d '{"industry":"Tech"}')
assert "POST /accounts - validation error (missing name+type)" "VALIDATION_ERROR" "$(echo "$VAL_RESULT" | jq -r '.error.code')"

echo ""

# --------------------------------------------------
echo "3. CONTACTS MODULE"
echo "--------------------------------------------------"

echo "  Creating contact..."
CON_RESULT=$(curl -s -X POST "$API/api/contacts" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@acme.example.com",
  "phone": "+1-555-0101",
  "jobTitle": "Procurement Manager",
  "department": "Purchasing",
  "source": "REFERRAL",
  "city": "Detroit",
  "country": "USA",
  "notes": "Primary procurement contact at Acme"
}')
CON_SUCCESS=$(echo "$CON_RESULT" | jq -r '.success')
CON_ID=$(echo "$CON_RESULT" | jq -r '.data.id')
assert "POST /contacts - success" "true" "$CON_SUCCESS"
assert "POST /contacts - firstName set" "Jane" "$(echo "$CON_RESULT" | jq -r '.data.firstName')"
assert "POST /contacts - email set" "jane.smith@acme.example.com" "$(echo "$CON_RESULT" | jq -r '.data.email')"

CON2_RESULT=$(curl -s -X POST "$API/api/contacts" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "firstName": "Bob",
  "lastName": "Johnson",
  "email": "bob.johnson@acme.example.com",
  "jobTitle": "CEO",
  "source": "INBOUND"
}')
CON2_ID=$(echo "$CON2_RESULT" | jq -r '.data.id')
assert "POST /contacts (second contact) - success" "true" "$(echo "$CON2_RESULT" | jq -r '.success')"

echo "  Listing contacts..."
CON_LIST=$(curl -s "$API/api/contacts" -H "$AUTH")
assert "GET /contacts - success" "true" "$(echo "$CON_LIST" | jq -r '.success')"
assert "GET /contacts - has records" "true" "$(echo "$CON_LIST" | jq -r '(.data | length) > 0')"
assert "GET /contacts - pagination total > 0" "true" "$(echo "$CON_LIST" | jq -r '.pagination.total > 0')"

echo "  Getting contact by ID..."
CON_GET=$(curl -s "$API/api/contacts/$CON_ID" -H "$AUTH")
assert "GET /contacts/:id - success" "true" "$(echo "$CON_GET" | jq -r '.success')"
assert "GET /contacts/:id - correct email" "jane.smith@acme.example.com" "$(echo "$CON_GET" | jq -r '.data.email')"

echo "  Updating contact..."
CON_PUT=$(curl -s -X PUT "$API/api/contacts/$CON_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "jobTitle": "Senior Procurement Manager",
  "mobile": "+1-555-0199"
}')
assert "PUT /contacts/:id - success" "true" "$(echo "$CON_PUT" | jq -r '.success')"
assert "PUT /contacts/:id - title updated" "Senior Procurement Manager" "$(echo "$CON_PUT" | jq -r '.data.jobTitle')"

echo "  Logging contact activity..."
ACT_RESULT=$(curl -s -X POST "$API/api/contacts/$CON_ID/activities" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "type": "CALL",
  "subject": "Initial discovery call",
  "description": "Discussed procurement requirements for Q2",
  "duration": 30,
  "outcome": "Positive - will follow up with proposal"
}')
assert "POST /contacts/:id/activities - success" "true" "$(echo "$ACT_RESULT" | jq -r '.success')"
assert "POST /contacts/:id/activities - type CALL" "CALL" "$(echo "$ACT_RESULT" | jq -r '.data.type')"

ACT_LIST=$(curl -s "$API/api/contacts/$CON_ID/activities" -H "$AUTH")
assert "GET /contacts/:id/activities - success" "true" "$(echo "$ACT_LIST" | jq -r '.success')"
assert "GET /contacts/:id/activities - has records" "true" "$(echo "$ACT_LIST" | jq -r '(.data | length) > 0')"

SEARCH_CON=$(curl -s "$API/api/contacts?search=Jane" -H "$AUTH")
assert "GET /contacts?search - success" "true" "$(echo "$SEARCH_CON" | jq -r '.success')"

SOURCE_FILTER=$(curl -s "$API/api/contacts?source=REFERRAL" -H "$AUTH")
assert "GET /contacts?source filter - success" "true" "$(echo "$SOURCE_FILTER" | jq -r '.success')"

VAL_CON=$(curl -s -X POST "$API/api/contacts" -H "$AUTH" -H "Content-Type: application/json" -d '{"firstName":"Test","lastName":"User","email":"not-an-email"}')
assert "POST /contacts - validation error (bad email)" "VALIDATION_ERROR" "$(echo "$VAL_CON" | jq -r '.error.code')"

NOT_FOUND=$(curl -s "$API/api/contacts/00000000-0000-0000-0000-000000000099" -H "$AUTH")
assert "GET /contacts/:id - 404 for missing contact" "NOT_FOUND" "$(echo "$NOT_FOUND" | jq -r '.error.code')"

echo ""

# --------------------------------------------------
echo "4. DEALS MODULE"
echo "--------------------------------------------------"

echo "  Creating deal..."
DEAL_RESULT=$(curl -s -X POST "$API/api/deals" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "title": "Acme Annual Software License",
  "value": 125000,
  "currency": "USD",
  "probability": 65,
  "assignedTo": "sales@ims.local",
  "source": "INBOUND",
  "notes": "Annual renewal with upsell opportunity"
}')
DEAL_SUCCESS=$(echo "$DEAL_RESULT" | jq -r '.success')
DEAL_ID=$(echo "$DEAL_RESULT" | jq -r '.data.id')
assert "POST /deals - success" "true" "$DEAL_SUCCESS"
assert "POST /deals - title set" "Acme Annual Software License" "$(echo "$DEAL_RESULT" | jq -r '.data.title')"
assert "POST /deals - status OPEN by default" "OPEN" "$(echo "$DEAL_RESULT" | jq -r '.data.status')"
assert_contains "POST /deals - has refNumber DEAL-" "DEAL-" "$(echo "$DEAL_RESULT" | jq -r '.data.refNumber')"

echo "  Getting deal sub-resources..."
PIPE_LIST=$(curl -s "$API/api/deals/pipelines" -H "$AUTH")
assert "GET /deals/pipelines - success" "true" "$(echo "$PIPE_LIST" | jq -r '.success')"

FORECAST=$(curl -s "$API/api/deals/forecast" -H "$AUTH")
assert "GET /deals/forecast - success" "true" "$(echo "$FORECAST" | jq -r '.success')"
assert "GET /deals/forecast - has dealCount" "true" "$(echo "$FORECAST" | jq -r '.data.dealCount >= 0')"
assert "GET /deals/forecast - has weightedValue" "true" "$(echo "$FORECAST" | jq -r '.data.weightedValue >= 0')"

BOARD=$(curl -s "$API/api/deals/board" -H "$AUTH")
assert "GET /deals/board - success" "true" "$(echo "$BOARD" | jq -r '.success')"

echo "  Listing deals..."
DEAL_LIST=$(curl -s "$API/api/deals" -H "$AUTH")
assert "GET /deals - success" "true" "$(echo "$DEAL_LIST" | jq -r '.success')"
assert "GET /deals - has records" "true" "$(echo "$DEAL_LIST" | jq -r '(.data | length) > 0')"

echo "  Getting deal by ID..."
DEAL_GET=$(curl -s "$API/api/deals/$DEAL_ID" -H "$AUTH")
assert "GET /deals/:id - success" "true" "$(echo "$DEAL_GET" | jq -r '.success')"
assert "GET /deals/:id - correct title" "Acme Annual Software License" "$(echo "$DEAL_GET" | jq -r '.data.title')"

echo "  Updating deal..."
DEAL_PUT=$(curl -s -X PUT "$API/api/deals/$DEAL_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "value": 135000,
  "probability": 75,
  "notes": "Upsell confirmed - premium tier"
}')
assert "PUT /deals/:id - success" "true" "$(echo "$DEAL_PUT" | jq -r '.success')"
assert "PUT /deals/:id - value updated" "135000" "$(echo "$DEAL_PUT" | jq -r '.data.value')"

echo "  Closing deal as WON..."
WON_RESULT=$(curl -s -X PUT "$API/api/deals/$DEAL_ID/won" -H "$AUTH" -H "Content-Type: application/json" -d '{}')
assert "PUT /deals/:id/won - success" "true" "$(echo "$WON_RESULT" | jq -r '.success')"
assert "PUT /deals/:id/won - status WON" "WON" "$(echo "$WON_RESULT" | jq -r '.data.status')"
assert "PUT /deals/:id/won - probability set to 100" "100" "$(echo "$WON_RESULT" | jq -r '.data.probability')"

echo "  Creating second deal for LOST test..."
DEAL2_RESULT=$(curl -s -X POST "$API/api/deals" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "title": "Lost Opportunity Test",
  "value": 25000,
  "currency": "USD"
}')
DEAL2_ID=$(echo "$DEAL2_RESULT" | jq -r '.data.id')
assert "POST /deals (second) - success" "true" "$(echo "$DEAL2_RESULT" | jq -r '.success')"

LOST_RESULT=$(curl -s -X PUT "$API/api/deals/$DEAL2_ID/lost" -H "$AUTH" -H "Content-Type: application/json" -d '{"lostReason":"Budget constraints for Q1 2026"}')
assert "PUT /deals/:id/lost - success" "true" "$(echo "$LOST_RESULT" | jq -r '.success')"
assert "PUT /deals/:id/lost - status LOST" "LOST" "$(echo "$LOST_RESULT" | jq -r '.data.status')"
assert "PUT /deals/:id/lost - probability set to 0" "0" "$(echo "$LOST_RESULT" | jq -r '.data.probability')"

STATUS_FILTER=$(curl -s "$API/api/deals?status=WON" -H "$AUTH")
assert "GET /deals?status=WON filter - success" "true" "$(echo "$STATUS_FILTER" | jq -r '.success')"

DEAL_VAL=$(curl -s -X POST "$API/api/deals" -H "$AUTH" -H "Content-Type: application/json" -d '{"currency":"USD"}')
assert "POST /deals - validation error (missing title+value)" "VALIDATION_ERROR" "$(echo "$DEAL_VAL" | jq -r '.error.code')"

echo ""

# --------------------------------------------------
echo "5. GATEWAY PROXY"
echo "--------------------------------------------------"

echo "  Testing routes through gateway..."
for ROUTE in contacts accounts deals; do
  GW_RESULT=$(curl -s "$GW/api/crm/$ROUTE" -H "$AUTH")
  assert "Gateway /api/crm/$ROUTE - success" "true" "$(echo "$GW_RESULT" | jq -r '.success')"
done

echo ""

# --------------------------------------------------
echo "6. DELETE OPERATIONS"
echo "--------------------------------------------------"

DEL_CON=$(curl -s -X DELETE "$API/api/contacts/$CON_ID" -H "$AUTH")
assert "DELETE /contacts/:id - success" "true" "$(echo "$DEL_CON" | jq -r '.success')"

DEL_CON2=$(curl -s -X DELETE "$API/api/contacts/$CON2_ID" -H "$AUTH")
assert "DELETE /contacts/:id (second) - success" "true" "$(echo "$DEL_CON2" | jq -r '.success')"

DEL_ACC=$(curl -s -X DELETE "$API/api/accounts/$ACC_ID" -H "$AUTH")
assert "DELETE /accounts/:id - success" "true" "$(echo "$DEL_ACC" | jq -r '.success')"

VERIFY=$(curl -s "$API/api/contacts/$CON_ID" -H "$AUTH")
assert "Deleted contact returns 404" "NOT_FOUND" "$(echo "$VERIFY" | jq -r '.error.code')"

VERIFY_ACC=$(curl -s "$API/api/accounts/$ACC_ID" -H "$AUTH")
assert "Deleted account returns 404" "NOT_FOUND" "$(echo "$VERIFY_ACC" | jq -r '.error.code')"

echo ""
echo "============================================"
echo "  RESULTS: $PASS passed, $FAIL failed (out of $TOTAL)"
echo "============================================"

if [ $FAIL -gt 0 ]; then
  exit 1
fi
