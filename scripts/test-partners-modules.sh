#!/bin/bash
# Comprehensive integration test script for Partners API modules
# Tests: Auth (register/login), Deals, Directory, Commission, Profile

API="http://localhost:4026"
GW="http://localhost:4000"
PASS=0
FAIL=0
TOTAL=0

# Generate a unique email to avoid conflicts on repeated runs
TIMESTAMP=$(date +%s)
PARTNER_EMAIL="test.partner.${TIMESTAMP}@integrationtest.com"
PARTNER_PASS="SecurePass123!XYZ"
PARTNER_NAME="Integration Test Partner"
PARTNER_COMPANY="Test Consulting Ltd"

# Get IMS admin token for gateway checks
TOKEN=$(echo '{"email":"admin@ims.local","password":"admin123"}' | curl -s "$GW/api/v1/auth/login" -H 'Content-Type: application/json' -d @- | jq -r '.data.accessToken')
if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo "FATAL: Could not get IMS admin auth token"
  exit 1
fi
ADMIN_AUTH="Authorization: Bearer $TOKEN"

assert() {
  local name="$1" expected="$2" actual="$3"
  TOTAL=$((TOTAL + 1))
  if [ "$actual" = "$expected" ]; then
    echo "  PASS: $name"; PASS=$((PASS + 1))
  else
    echo "  FAIL: $name (expected=$expected, got=$actual)"; FAIL=$((FAIL + 1))
  fi
}
assert_contains() {
  local name="$1" expected="$2" actual="$3"
  TOTAL=$((TOTAL + 1))
  if echo "$actual" | grep -q "$expected"; then
    echo "  PASS: $name"; PASS=$((PASS + 1))
  else
    echo "  FAIL: $name (expected to contain '$expected', got '$actual')"; FAIL=$((FAIL + 1))
  fi
}

echo "============================================"
echo "  Partners Modules - Integration Test Suite"
echo "============================================"
echo ""

echo "1. AUTH MODULE — REGISTER & LOGIN"
echo "─────────────────────────────────────────"

echo "  Registering new partner..."
REG_RESULT=$(curl -s -X POST "$API/api/auth/register" -H "Content-Type: application/json" -d "{
  \"email\": \"$PARTNER_EMAIL\",
  \"password\": \"$PARTNER_PASS\",
  \"name\": \"$PARTNER_NAME\",
  \"company\": \"$PARTNER_COMPANY\",
  \"phone\": \"+44 7700 900123\",
  \"isoSpecialisms\": [\"ISO 9001\", \"ISO 14001\", \"ISO 27001\"]
}")
REG_SUCCESS=$(echo "$REG_RESULT" | jq -r '.success')
REG_ID=$(echo "$REG_RESULT" | jq -r '.data.partner.id')
REG_TOKEN=$(echo "$REG_RESULT" | jq -r '.data.token')
REG_REF=$(echo "$REG_RESULT" | jq -r '.data.partner.referralCode')
assert "POST /auth/register - success" "true" "$REG_SUCCESS"
assert "POST /auth/register - has partner id" "true" "$([ -n "$REG_ID" ] && [ "$REG_ID" != "null" ] && echo true || echo false)"
assert "POST /auth/register - has JWT token" "true" "$([ -n "$REG_TOKEN" ] && [ "$REG_TOKEN" != "null" ] && echo true || echo false)"
assert "POST /auth/register - has referralCode" "true" "$([ -n "$REG_REF" ] && [ "$REG_REF" != "null" ] && echo true || echo false)"
assert "POST /auth/register - default tier REFERRAL" "REFERRAL" "$(echo "$REG_RESULT" | jq -r '.data.partner.tier')"
assert "POST /auth/register - default status PENDING" "PENDING" "$(echo "$REG_RESULT" | jq -r '.data.partner.status')"

PARTNER_AUTH="Authorization: Bearer $REG_TOKEN"

echo "  Registering duplicate partner (conflict)..."
DUP_RESULT=$(curl -s -X POST "$API/api/auth/register" -H "Content-Type: application/json" -d "{
  \"email\": \"$PARTNER_EMAIL\",
  \"password\": \"$PARTNER_PASS\",
  \"name\": \"Duplicate\",
  \"company\": \"Dup Co\"
}")
assert "POST /auth/register duplicate - 409 ALREADY_EXISTS" "ALREADY_EXISTS" "$(echo "$DUP_RESULT" | jq -r '.error.code')"

echo "  Registration validation error (weak password)..."
REG_VAL=$(curl -s -X POST "$API/api/auth/register" -H "Content-Type: application/json" -d '{
  "email": "test@example.com",
  "password": "weak",
  "name": "Test",
  "company": "Test Co"
}')
assert "POST /auth/register - validation error on weak password" "VALIDATION_ERROR" "$(echo "$REG_VAL" | jq -r '.error.code')"

echo "  Logging in with partner credentials..."
LOGIN_RESULT=$(curl -s -X POST "$API/api/auth/login" -H "Content-Type: application/json" -d "{
  \"email\": \"$PARTNER_EMAIL\",
  \"password\": \"$PARTNER_PASS\"
}")
LOGIN_SUCCESS=$(echo "$LOGIN_RESULT" | jq -r '.success')
LOGIN_TOKEN=$(echo "$LOGIN_RESULT" | jq -r '.data.token')
assert "POST /auth/login - success" "true" "$LOGIN_SUCCESS"
assert "POST /auth/login - has JWT token" "true" "$([ -n "$LOGIN_TOKEN" ] && [ "$LOGIN_TOKEN" != "null" ] && echo true || echo false)"
assert "POST /auth/login - email matches" "$PARTNER_EMAIL" "$(echo "$LOGIN_RESULT" | jq -r '.data.partner.email')"

PARTNER_AUTH="Authorization: Bearer $LOGIN_TOKEN"

echo "  Login with wrong password (401)..."
BAD_LOGIN=$(curl -s -X POST "$API/api/auth/login" -H "Content-Type: application/json" -d "{
  \"email\": \"$PARTNER_EMAIL\",
  \"password\": \"WrongPassword999!\"
}")
assert "POST /auth/login wrong password - INVALID_CREDENTIALS" "INVALID_CREDENTIALS" "$(echo "$BAD_LOGIN" | jq -r '.error.code')"

echo "  Login with non-existent account (401)..."
NO_ACCT=$(curl -s -X POST "$API/api/auth/login" -H "Content-Type: application/json" -d '{
  "email": "doesnotexist@noreply.com",
  "password": "AnyPassword123!"
}')
assert "POST /auth/login unknown email - INVALID_CREDENTIALS" "INVALID_CREDENTIALS" "$(echo "$NO_ACCT" | jq -r '.error.code')"

echo ""
echo "2. DEALS MODULE"
echo "─────────────────────────────────────────"

echo "  Creating deal..."
DEAL_RESULT=$(curl -s -X POST "$API/api/deals" -H "$PARTNER_AUTH" -H "Content-Type: application/json" -d '{
  "companyName": "Horizon Manufacturing Ltd",
  "contactName": "Maria Santos",
  "contactEmail": "m.santos@horizon-mfg.com",
  "estimatedUsers": 75,
  "isoStandards": ["ISO 9001", "ISO 14001", "ISO 45001"],
  "estimatedACV": 26100,
  "notes": "Prospect needs ISO 9001 and 14001. Currently using paper-based processes. High propensity to buy."
}')
DEAL_ID=$(echo "$DEAL_RESULT" | jq -r '.data.id')
DEAL_STATUS=$(echo "$DEAL_RESULT" | jq -r '.data.status')
DEAL_COMMISSION=$(echo "$DEAL_RESULT" | jq -r '.data.commissionRate')
assert "POST /deals - success" "true" "$(echo "$DEAL_RESULT" | jq -r '.success')"
assert "POST /deals - default status SUBMITTED" "SUBMITTED" "$DEAL_STATUS"
assert "POST /deals - commissionRate assigned (REFERRAL tier = 0.25)" "0.25" "$DEAL_COMMISSION"
assert "POST /deals - has deal id" "true" "$([ -n "$DEAL_ID" ] && [ "$DEAL_ID" != "null" ] && echo true || echo false)"

echo "  Creating second deal..."
DEAL2_RESULT=$(curl -s -X POST "$API/api/deals" -H "$PARTNER_AUTH" -H "Content-Type: application/json" -d '{
  "companyName": "Coastal Seafood Ltd",
  "contactName": "James O Brien",
  "contactEmail": "jobs@coastal-seafood.co.uk",
  "estimatedUsers": 30,
  "isoStandards": ["ISO 22000", "ISO 9001"],
  "estimatedACV": 10440,
  "notes": "Food safety compliance driven by export requirements to EU market."
}')
DEAL2_ID=$(echo "$DEAL2_RESULT" | jq -r '.data.id')
assert "POST /deals second - success" "true" "$(echo "$DEAL2_RESULT" | jq -r '.success')"

echo "  Listing deals..."
DEALS_LIST=$(curl -s "$API/api/deals" -H "$PARTNER_AUTH")
assert "GET /deals - success" "true" "$(echo "$DEALS_LIST" | jq -r '.success')"
assert "GET /deals - has deals array" "true" "$(echo "$DEALS_LIST" | jq -r '.data.deals | type == \"array\"')"
assert "GET /deals - has summary stats" "true" "$(echo "$DEALS_LIST" | jq -r '.data.summary != null')"
assert "GET /deals - submitted count positive" "true" "$(echo "$DEALS_LIST" | jq -r '.data.summary.submitted >= 1')"

DEALS_FILTERED=$(curl -s "$API/api/deals?status=SUBMITTED" -H "$PARTNER_AUTH")
assert "GET /deals?status=SUBMITTED filter - success" "true" "$(echo "$DEALS_FILTERED" | jq -r '.success')"

echo "  Updating deal status (SUBMITTED -> IN_DEMO)..."
PATCH_DEAL=$(curl -s -X PATCH "$API/api/deals/$DEAL_ID/status" -H "$PARTNER_AUTH" -H "Content-Type: application/json" -d '{"status":"IN_DEMO"}')
assert "PATCH /deals/:id/status IN_DEMO - success" "true" "$(echo "$PATCH_DEAL" | jq -r '.success')"
assert "PATCH /deals/:id/status - status updated to IN_DEMO" "IN_DEMO" "$(echo "$PATCH_DEAL" | jq -r '.data.status')"

echo "  Updating deal status (IN_DEMO -> NEGOTIATING)..."
PATCH_DEAL2=$(curl -s -X PATCH "$API/api/deals/$DEAL_ID/status" -H "$PARTNER_AUTH" -H "Content-Type: application/json" -d '{"status":"NEGOTIATING"}')
assert "PATCH /deals/:id/status NEGOTIATING - success" "true" "$(echo "$PATCH_DEAL2" | jq -r '.success')"

echo "  Closing deal WON with ACV..."
CLOSE_DEAL=$(curl -s -X PATCH "$API/api/deals/$DEAL_ID/status" -H "$PARTNER_AUTH" -H "Content-Type: application/json" -d '{"status":"CLOSED_WON","actualACV":26100}')
assert "PATCH /deals/:id/status CLOSED_WON - success" "true" "$(echo "$CLOSE_DEAL" | jq -r '.success')"
assert "PATCH /deals CLOSED_WON - closedAt set" "true" "$(echo "$CLOSE_DEAL" | jq -r '.data.closedAt != null')"
assert "PATCH /deals CLOSED_WON - commissionValue calculated" "true" "$(echo "$CLOSE_DEAL" | jq -r '(.data.commissionValue // 0) > 0')"

echo "  Invalid state transition (CLOSED_WON -> IN_DEMO)..."
INVALID_TRANS=$(curl -s -X PATCH "$API/api/deals/$DEAL_ID/status" -H "$PARTNER_AUTH" -H "Content-Type: application/json" -d '{"status":"IN_DEMO"}')
assert "PATCH /deals invalid transition - INVALID_TRANSITION error" "INVALID_TRANSITION" "$(echo "$INVALID_TRANS" | jq -r '.error.code')"

echo "  Unauthenticated deals request (401)..."
UNAUTH_DEALS=$(curl -s "$API/api/deals")
assert "GET /deals unauthenticated - UNAUTHORIZED" "UNAUTHORIZED" "$(echo "$UNAUTH_DEALS" | jq -r '.error.code')"

echo ""
echo "3. COMMISSION MODULE"
echo "─────────────────────────────────────────"

echo "  Getting commission summary..."
COMM_SUMM=$(curl -s "$API/api/commission/summary" -H "$PARTNER_AUTH")
assert "GET /commission/summary - success" "true" "$(echo "$COMM_SUMM" | jq -r '.success')"
assert "GET /commission/summary - has totalEarned" "true" "$(echo "$COMM_SUMM" | jq -r '.data.totalEarned >= 0')"
assert "GET /commission/summary - has pendingPayout" "true" "$(echo "$COMM_SUMM" | jq -r '.data.pendingPayout >= 0')"
assert "GET /commission/summary - has dealsWon count" "true" "$(echo "$COMM_SUMM" | jq -r '.data.dealsWon >= 0')"

echo "  Getting commission history..."
COMM_HIST=$(curl -s "$API/api/commission/history" -H "$PARTNER_AUTH")
assert "GET /commission/history - success" "true" "$(echo "$COMM_HIST" | jq -r '.success')"

echo ""
echo "4. DIRECTORY MODULE"
echo "─────────────────────────────────────────"

echo "  Listing partner directory..."
DIR_RESULT=$(curl -s "$API/api/directory" -H "$PARTNER_AUTH")
assert "GET /directory - success" "true" "$(echo "$DIR_RESULT" | jq -r '.success')"
assert "GET /directory - returns array" "true" "$(echo "$DIR_RESULT" | jq -r '.data | type == \"array\"')"

echo "  Filtering directory by tier..."
DIR_FILTER=$(curl -s "$API/api/directory?tier=REFERRAL" -H "$PARTNER_AUTH")
assert "GET /directory?tier=REFERRAL filter - success" "true" "$(echo "$DIR_FILTER" | jq -r '.success')"

echo "  Searching directory..."
DIR_SEARCH=$(curl -s "$API/api/directory?search=Test" -H "$PARTNER_AUTH")
assert "GET /directory?search filter - success" "true" "$(echo "$DIR_SEARCH" | jq -r '.success')"

echo "  Getting specific partner from directory..."
DIR_PARTNER=$(curl -s "$API/api/directory/$REG_ID" -H "$PARTNER_AUTH")
assert "GET /directory/:id - success" "true" "$(echo "$DIR_PARTNER" | jq -r '.success')"
assert "GET /directory/:id - correct partner name" "$PARTNER_NAME" "$(echo "$DIR_PARTNER" | jq -r '.data.name')"

echo "  Unauthenticated directory request (401)..."
UNAUTH_DIR=$(curl -s "$API/api/directory")
assert "GET /directory unauthenticated - UNAUTHORIZED" "UNAUTHORIZED" "$(echo "$UNAUTH_DIR" | jq -r '.error.code')"

echo ""
echo "5. GATEWAY PROXY"
echo "─────────────────────────────────────────"

echo "  Testing partners routes through gateway..."
GW_AUTH_REGISTER=$(curl -s -X POST "$GW/api/partners/auth/register" -H "Content-Type: application/json" -d '{
  "email": "gw.test.partner.unique@integrationtest.com",
  "password": "SecurePass456!ABC",
  "name": "GW Test Partner",
  "company": "GW Test Co"
}')
assert "Gateway POST /api/partners/auth/register - success" "true" "$(echo "$GW_AUTH_REGISTER" | jq -r '.success')"

GW_DIR=$(curl -s "$GW/api/partners/directory" -H "$PARTNER_AUTH")
assert "Gateway GET /api/partners/directory - success" "true" "$(echo "$GW_DIR" | jq -r '.success')"

GW_DEALS=$(curl -s "$GW/api/partners/deals" -H "$PARTNER_AUTH")
assert "Gateway GET /api/partners/deals - success" "true" "$(echo "$GW_DEALS" | jq -r '.success')"

GW_COMM=$(curl -s "$GW/api/partners/commission/summary" -H "$PARTNER_AUTH")
assert "Gateway GET /api/partners/commission/summary - success" "true" "$(echo "$GW_COMM" | jq -r '.success')"

echo ""
echo "============================================"
echo "  RESULTS: $PASS passed, $FAIL failed (out of $TOTAL)"
echo "============================================"

if [ $FAIL -gt 0 ]; then
  exit 1
fi
