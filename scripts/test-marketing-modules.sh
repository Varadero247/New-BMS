#!/bin/bash
# Comprehensive integration test script for Marketing API modules
# Tests: Leads, ROI Calculator, Growth Metrics, Health Score, Expansion, Digest

API="http://localhost:4025"
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
echo "  Marketing Modules - Integration Test Suite"
echo "============================================"
echo ""

echo "1. HEALTH CHECK"
echo "─────────────────────────────────────────"

HEALTH=$(curl -s "$API/health")
assert "GET /health - service healthy" "true" "$(echo "$HEALTH" | jq -r '.status == "healthy" or .status == "ok"')"

echo ""
echo "2. ROI CALCULATOR MODULE"
echo "─────────────────────────────────────────"

echo "  Calculating ROI (no auth required - public endpoint)..."
ROI_RESULT=$(curl -s -X POST "$API/api/roi/calculate" -H "Content-Type: application/json" -d '{
  "companyName": "Acme Manufacturing Ltd",
  "name": "John Smith",
  "email": "john.smith.test.roi@example.com",
  "jobTitle": "Quality Manager",
  "employeeCount": "251-1000",
  "isoCount": 4,
  "currentSpend": 45000,
  "industry": "Manufacturing"
}')
assert "POST /roi/calculate - success" "true" "$(echo "$ROI_RESULT" | jq -r '.success')"
assert "POST /roi/calculate - returns totalROI" "true" "$(echo "$ROI_RESULT" | jq -r '.data.totalROI > 0')"
assert "POST /roi/calculate - returns annualCost" "true" "$(echo "$ROI_RESULT" | jq -r '.data.annualCost > 0')"
assert "POST /roi/calculate - isoCount 4 gives Enterprise tier" "Enterprise" "$(echo "$ROI_RESULT" | jq -r '.data.recommendedTier')"
assert "POST /roi/calculate - Enterprise pricePerUser 19" "19" "$(echo "$ROI_RESULT" | jq -r '.data.pricePerUser')"
assert "POST /roi/calculate - timeSavingAnnual positive" "true" "$(echo "$ROI_RESULT" | jq -r '.data.timeSavingAnnual > 0')"

echo "  Calculating ROI for small company (Professional tier)..."
ROI2_RESULT=$(curl -s -X POST "$API/api/roi/calculate" -H "Content-Type: application/json" -d '{
  "companyName": "Small Startup Inc",
  "name": "Jane Doe",
  "email": "jane.doe.test.roi2@example.com",
  "isoCount": 2
}')
assert "POST /roi/calculate Professional tier (isoCount<4)" "Professional" "$(echo "$ROI2_RESULT" | jq -r '.data.recommendedTier')"
assert "POST /roi/calculate Professional pricePerUser 29" "29" "$(echo "$ROI2_RESULT" | jq -r '.data.pricePerUser')"

echo "  ROI validation error..."
ROI_VAL=$(curl -s -X POST "$API/api/roi/calculate" -H "Content-Type: application/json" -d '{"companyName":"Test"}')
assert "POST /roi/calculate - validation error (missing name/email)" "VALIDATION_ERROR" "$(echo "$ROI_VAL" | jq -r '.error.code')"

echo "  Getting ROI history (authenticated)..."
ROI_HIST=$(curl -s "$API/api/roi/history" -H "$AUTH")
assert "GET /roi/history - success" "true" "$(echo "$ROI_HIST" | jq -r '.success')"
assert "GET /roi/history - returns array" "true" "$(echo "$ROI_HIST" | jq -r '.data | type == \"array\"')"

echo ""
echo "3. LEADS MODULE"
echo "─────────────────────────────────────────"

echo "  Capturing lead (public endpoint)..."
LEAD_RESULT=$(curl -s -X POST "$API/api/leads/capture" -H "Content-Type: application/json" -d '{
  "email": "leads.test.integration@example.com",
  "name": "Alice Johnson",
  "company": "Global Corp Ltd",
  "jobTitle": "Compliance Director",
  "source": "LANDING_PAGE",
  "industry": "Financial Services",
  "employeeCount": "1001-5000",
  "isoCount": 6,
  "roiEstimate": 175000
}')
assert "POST /leads/capture - success" "true" "$(echo "$LEAD_RESULT" | jq -r '.success')"
assert "POST /leads/capture - captured true" "true" "$(echo "$LEAD_RESULT" | jq -r '.data.captured')"

echo "  Capturing lead via LinkedIn source..."
LEAD2_RESULT=$(curl -s -X POST "$API/api/leads/capture" -H "Content-Type: application/json" -d '{
  "email": "linkedin.test.integration@example.com",
  "name": "Bob Williams",
  "source": "LINKEDIN",
  "company": "Williams Consulting"
}')
assert "POST /leads/capture LinkedIn - success" "true" "$(echo "$LEAD2_RESULT" | jq -r '.success')"

echo "  Lead capture validation error (invalid email)..."
LEAD_VAL=$(curl -s -X POST "$API/api/leads/capture" -H "Content-Type: application/json" -d '{
  "email": "not-an-email",
  "name": "Test",
  "source": "LANDING_PAGE"
}')
assert "POST /leads/capture - validation error on invalid email" "VALIDATION_ERROR" "$(echo "$LEAD_VAL" | jq -r '.error.code')"

echo "  Listing leads (authenticated)..."
LEADS_LIST=$(curl -s "$API/api/leads" -H "$AUTH")
assert "GET /leads - success" "true" "$(echo "$LEADS_LIST" | jq -r '.success')"
assert "GET /leads - has leads array" "true" "$(echo "$LEADS_LIST" | jq -r '.data.leads | type == \"array\"')"
assert "GET /leads - total count present" "true" "$(echo "$LEADS_LIST" | jq -r '.data.total >= 0')"

LEADS_FILTER=$(curl -s "$API/api/leads?source=LANDING_PAGE" -H "$AUTH")
assert "GET /leads?source=LANDING_PAGE filter - success" "true" "$(echo "$LEADS_FILTER" | jq -r '.success')"

LEADS_PAGED=$(curl -s "$API/api/leads?page=1&limit=10" -H "$AUTH")
assert "GET /leads pagination - success" "true" "$(echo "$LEADS_PAGED" | jq -r '.success')"

echo ""
echo "4. GROWTH METRICS MODULE"
echo "─────────────────────────────────────────"

echo "  Fetching growth metrics..."
GROWTH_RESULT=$(curl -s "$API/api/growth/metrics" -H "$AUTH")
assert "GET /growth/metrics - success" "true" "$(echo "$GROWTH_RESULT" | jq -r '.success')"
assert "GET /growth/metrics - has leads data" "true" "$(echo "$GROWTH_RESULT" | jq -r '.data.leads != null')"
assert "GET /growth/metrics - leads.total numeric" "true" "$(echo "$GROWTH_RESULT" | jq -r '.data.leads.total >= 0')"
assert "GET /growth/metrics - has health data" "true" "$(echo "$GROWTH_RESULT" | jq -r '.data.health != null')"
assert "GET /growth/metrics - has partners data" "true" "$(echo "$GROWTH_RESULT" | jq -r '.data.partners != null')"
assert "GET /growth/metrics - has renewals data" "true" "$(echo "$GROWTH_RESULT" | jq -r '.data.renewals != null')"
assert "GET /growth/metrics - has winBacks data" "true" "$(echo "$GROWTH_RESULT" | jq -r '.data.winBacks != null')"

echo ""
echo "5. HEALTH SCORE MODULE"
echo "─────────────────────────────────────────"

echo "  Fetching health score for non-existent user (404)..."
HS_404=$(curl -s "$API/api/health-score/user/nonexistent-user-id" -H "$AUTH")
assert "GET /health-score/user/:userId - 404 for unknown user" "NOT_FOUND" "$(echo "$HS_404" | jq -r '.error.code')"

echo "  Getting org health score summary..."
HS_ORG=$(curl -s "$API/api/health-score/org/test-org-integration" -H "$AUTH")
assert "GET /health-score/org/:orgId - success" "true" "$(echo "$HS_ORG" | jq -r '.success')"
assert "GET /health-score/org/:orgId - has totalUsers" "true" "$(echo "$HS_ORG" | jq -r '.data.totalUsers >= 0')"
assert "GET /health-score/org/:orgId - has distribution" "true" "$(echo "$HS_ORG" | jq -r '.data.distribution != null')"

echo "  Triggering health score recalculation..."
HS_RECALC=$(curl -s -X POST "$API/api/health-score/recalculate" -H "$AUTH" -H "Content-Type: application/json" -d '{"orgId":"test-org-integration"}')
assert "POST /health-score/recalculate - success" "true" "$(echo "$HS_RECALC" | jq -r '.success')"
assert_contains "POST /health-score/recalculate - message present" "recalculation" "$(echo "$HS_RECALC" | jq -r '.data.message')"

echo ""
echo "6. EXPANSION MODULE"
echo "─────────────────────────────────────────"

echo "  Getting expansion triggers..."
EXP_TRIGGERS=$(curl -s "$API/api/expansion/triggers" -H "$AUTH")
assert "GET /expansion/triggers - success" "true" "$(echo "$EXP_TRIGGERS" | jq -r '.success')"
assert "GET /expansion/triggers - returns array" "true" "$(echo "$EXP_TRIGGERS" | jq -r '.data | type == \"array\"')"

echo "  Checking expansion opportunities..."
EXP_CHECK=$(curl -s -X POST "$API/api/expansion/check" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "orgId": "test-org-integration",
  "thresholds": {"userLimit": 5, "moduleLimit": 3}
}')
assert "POST /expansion/check - success" "true" "$(echo "$EXP_CHECK" | jq -r '.success')"
assert "POST /expansion/check - has data" "true" "$(echo "$EXP_CHECK" | jq -r '.data != null')"

echo ""
echo "7. DIGEST MODULE"
echo "─────────────────────────────────────────"

echo "  Triggering daily digest..."
DIGEST_RESULT=$(curl -s -X POST "$API/api/digest/trigger" -H "$AUTH" -H "Content-Type: application/json" -d '{}')
assert "POST /digest/trigger - success" "true" "$(echo "$DIGEST_RESULT" | jq -r '.success')"
assert "POST /digest/trigger - has date in data" "true" "$(echo "$DIGEST_RESULT" | jq -r '.data.date != null')"
assert "POST /digest/trigger - has yesterday stats" "true" "$(echo "$DIGEST_RESULT" | jq -r '.data.yesterday != null')"
assert "POST /digest/trigger - has today stats" "true" "$(echo "$DIGEST_RESULT" | jq -r '.data.today != null')"
assert "POST /digest/trigger - newLeads count numeric" "true" "$(echo "$DIGEST_RESULT" | jq -r '.data.yesterday.newLeads >= 0')"

echo ""
echo "8. GATEWAY PROXY"
echo "─────────────────────────────────────────"

echo "  Testing routes through gateway..."
GW_ROI=$(curl -s -X POST "$GW/api/marketing/roi/calculate" -H "Content-Type: application/json" -d '{"companyName":"GW Test","name":"Test User","email":"gw.roi.test@example.com","isoCount":3}')
assert "Gateway POST /api/marketing/roi/calculate - success" "true" "$(echo "$GW_ROI" | jq -r '.success')"

GW_GROWTH=$(curl -s "$GW/api/marketing/growth/metrics" -H "$AUTH")
assert "Gateway GET /api/marketing/growth/metrics - success" "true" "$(echo "$GW_GROWTH" | jq -r '.success')"

GW_LEADS=$(curl -s "$GW/api/marketing/leads" -H "$AUTH")
assert "Gateway GET /api/marketing/leads - success" "true" "$(echo "$GW_LEADS" | jq -r '.success')"

echo ""
echo "============================================"
echo "  RESULTS: $PASS passed, $FAIL failed (out of $TOTAL)"
echo "============================================"

if [ $FAIL -gt 0 ]; then
  exit 1
fi
