#!/bin/bash
# Comprehensive test script for AI Analysis modules
# Tests: Analyses, Analyze, Assistant, Compliance, Settings — CRUD + Gateway

API="http://localhost:4004"
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
echo "  AI Analysis Modules - Comprehensive Test Suite"
echo "============================================"
echo ""

# -------------------------------------------------
echo "1. HEALTH CHECK"
echo "-------------------------------------------------"

HEALTH=$(curl -s "$API/health")
assert "GET /health - success" "true" "$(echo "$HEALTH" | jq -r '.success')"
assert_contains "GET /health - service name" "api-ai-analysis" "$(echo "$HEALTH" | jq -r '.service')"

echo ""

# -------------------------------------------------
echo "2. AI SETTINGS MODULE"
echo "-------------------------------------------------"

echo "  Getting AI settings..."
SETTINGS=$(curl -s "$API/api/settings" -H "$AUTH")
assert "GET /settings - success" "true" "$(echo "$SETTINGS" | jq -r '.success')"
assert "GET /settings - data present" "true" "$(echo "$SETTINGS" | jq -r '.data != null')"

echo "  Configuring AI settings..."
SET_RESULT=$(curl -s -X POST "$API/api/settings" -H "$AUTH" -H "Content-Type: application/json" -d '{"provider":"OPENAI","model":"gpt-4o-mini","apiKey":"test-api-key-placeholder","defaultPrompt":"Analyse this record against ISO standards."}')
assert "POST /settings - success" "true" "$(echo "$SET_RESULT" | jq -r '.success')"
assert "POST /settings - provider set" "OPENAI" "$(echo "$SET_RESULT" | jq -r '.data.provider')"
assert "POST /settings - model set" "gpt-4o-mini" "$(echo "$SET_RESULT" | jq -r '.data.model')"
assert "POST /settings - apiKey masked (hasApiKey true)" "true" "$(echo "$SET_RESULT" | jq -r '.data.hasApiKey')"

echo ""

# -------------------------------------------------
echo "3. ANALYSES MODULE"
echo "-------------------------------------------------"

echo "  Listing analyses..."
LIST_RESULT=$(curl -s "$API/api/analyses" -H "$AUTH")
assert "GET /analyses - success" "true" "$(echo "$LIST_RESULT" | jq -r '.success')"
assert "GET /analyses - has meta" "true" "$(echo "$LIST_RESULT" | jq -r '.meta != null')"
assert "GET /analyses - meta has total" "true" "$(echo "$LIST_RESULT" | jq -r '.meta.total >= 0')"
assert "GET /analyses - data is array" "true" "$(echo "$LIST_RESULT" | jq -r '(.data | type) == "array"')"

echo "  Filtering analyses..."
FILTER_RESULT=$(curl -s "$API/api/analyses?sourceType=INCIDENT" -H "$AUTH")
assert "GET /analyses?sourceType filter - success" "true" "$(echo "$FILTER_RESULT" | jq -r '.success')"

STATUS_RESULT=$(curl -s "$API/api/analyses?status=PENDING" -H "$AUTH")
assert "GET /analyses?status filter - success" "true" "$(echo "$STATUS_RESULT" | jq -r '.success')"

PAGE_RESULT=$(curl -s "$API/api/analyses?page=1&limit=5" -H "$AUTH")
assert "GET /analyses pagination - success" "true" "$(echo "$PAGE_RESULT" | jq -r '.success')"
assert "GET /analyses pagination - limit respected" "true" "$(echo "$PAGE_RESULT" | jq -r '.meta.limit == 5')"

echo "  Testing 404 for unknown analysis..."
NOT_FOUND=$(curl -s "$API/api/analyses/00000000-0000-0000-0000-000000000999" -H "$AUTH")
assert "GET /analyses/:id - 404 not found" "NOT_FOUND" "$(echo "$NOT_FOUND" | jq -r '.error.code')"

echo ""

# -------------------------------------------------
echo "4. ANALYZE ENDPOINT"
echo "-------------------------------------------------"

echo "  Posting analyze request - environmental aspect..."
ANA_RESULT=$(curl -s -X POST "$API/api/analyze" -H "$AUTH" -H "Content-Type: application/json" -d '{"type":"ENVIRONMENTAL_ASPECT","context":{"aspectTitle":"Chemical waste disposal from manufacturing","activity":"Production line operations","impact":"Potential soil contamination","severity":4,"probability":3}}')
assert "POST /analyze (ENVIRONMENTAL_ASPECT) - success" "true" "$(echo "$ANA_RESULT" | jq -r '.success')"
assert "POST /analyze - has data" "true" "$(echo "$ANA_RESULT" | jq -r '.data != null')"

echo "  Posting analyze request - legal references..."
ANA2_RESULT=$(curl -s -X POST "$API/api/analyze" -H "$AUTH" -H "Content-Type: application/json" -d '{"type":"LEGAL_REFERENCES","context":{"regulation":"COSHH Regulations 2002","industry":"Manufacturing","jurisdiction":"United Kingdom"}}')
assert "POST /analyze (LEGAL_REFERENCES) - success" "true" "$(echo "$ANA2_RESULT" | jq -r '.success')"

echo "  Posting analyze request - project risk..."
ANA3_RESULT=$(curl -s -X POST "$API/api/analyze" -H "$AUTH" -H "Content-Type: application/json" -d '{"type":"PROJECT_RISK_ANALYSIS","context":{"projectName":"ERP Implementation","projectValue":500000,"duration":"18 months"}}')
assert "POST /analyze (PROJECT_RISK_ANALYSIS) - success" "true" "$(echo "$ANA3_RESULT" | jq -r '.success')"

echo "  Posting analyze request - HR job description..."
ANA4_RESULT=$(curl -s -X POST "$API/api/analyze" -H "$AUTH" -H "Content-Type: application/json" -d '{"type":"HR_JOB_DESCRIPTION","context":{"jobTitle":"Health and Safety Manager","department":"Operations","responsibilities":"Manage H&S compliance"}}')
assert "POST /analyze (HR_JOB_DESCRIPTION) - success" "true" "$(echo "$ANA4_RESULT" | jq -r '.success')"

echo "  Posting analyze request - automotive PPAP..."
ANA5_RESULT=$(curl -s -X POST "$API/api/analyze" -H "$AUTH" -H "Content-Type: application/json" -d '{"type":"AUTOMOTIVE_PPAP_READINESS","context":{"partNumber":"PN-12345","customer":"OEM-Manufacturer","submissionLevel":3}}')
assert "POST /analyze (AUTOMOTIVE_PPAP_READINESS) - success" "true" "$(echo "$ANA5_RESULT" | jq -r '.success')"

echo "  Testing analyze validation error..."
INVALID_HTTP=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API/api/analyze" -H "$AUTH" -H "Content-Type: application/json" -d '{"type":"BAD_TYPE_XYZ","context":{}}')
assert "POST /analyze - invalid type returns 400" "400" "$INVALID_HTTP"

echo "  Testing analyze missing fields..."
MISSING_RESULT=$(curl -s -X POST "$API/api/analyze" -H "$AUTH" -H "Content-Type: application/json" -d '{}')
assert "POST /analyze - missing type returns error" "false" "$(echo "$MISSING_RESULT" | jq -r '.success')"

echo "  Posting analyze request - medical complaint triage..."
ANA6_RESULT=$(curl -s -X POST "$API/api/analyze" -H "$AUTH" -H "Content-Type: application/json" -d '{"type":"MEDICAL_COMPLAINT_MDR_TRIAGE","context":{"deviceName":"Infusion Pump","complaintType":"Malfunction","patientImpact":"Minor injury reported"}}')
assert "POST /analyze (MEDICAL_COMPLAINT_MDR_TRIAGE) - success" "true" "$(echo "$ANA6_RESULT" | jq -r '.success')"

echo ""

# -------------------------------------------------
echo "5. ASSISTANT MODULE"
echo "-------------------------------------------------"

echo "  Asking assistant about modules..."
ASS1=$(curl -s -X POST "$API/api/assistant" -H "$AUTH" -H "Content-Type: application/json" -d '{"question":"how many modules does Nexara have?"}')
assert "POST /assistant (modules question) - success" "true" "$(echo "$ASS1" | jq -r '.success')"
assert "POST /assistant - has answer" "true" "$(echo "$ASS1" | jq -r '.data.answer != null')"
assert "POST /assistant - has suggestedModules array" "true" "$(echo "$ASS1" | jq -r '(.data.suggestedModules | type) == "array"')"

echo "  Asking assistant about ISO standards..."
ASS2=$(curl -s -X POST "$API/api/assistant" -H "$AUTH" -H "Content-Type: application/json" -d '{"question":"what iso standards does Nexara support?"}')
assert "POST /assistant (ISO standards) - success" "true" "$(echo "$ASS2" | jq -r '.success')"
assert_contains "POST /assistant (ISO standards) - answer has ISO content" "ISO" "$(echo "$ASS2" | jq -r '.data.answer')"

echo "  Asking assistant about CAPA..."
ASS3=$(curl -s -X POST "$API/api/assistant" -H "$AUTH" -H "Content-Type: application/json" -d '{"question":"what is capa and how does it work?","context":"Quality management context"}')
assert "POST /assistant (CAPA) - success" "true" "$(echo "$ASS3" | jq -r '.success')"
assert_contains "POST /assistant (CAPA) - answer mentions CAPA" "CAPA" "$(echo "$ASS3" | jq -r '.data.answer')"

echo "  Asking assistant about risk module..."
ASS4=$(curl -s -X POST "$API/api/assistant" -H "$AUTH" -H "Content-Type: application/json" -d '{"question":"how does risk management integrate with incidents?"}')
assert "POST /assistant (risk integration) - success" "true" "$(echo "$ASS4" | jq -r '.success')"

echo "  Asking assistant about templates..."
ASS5=$(curl -s -X POST "$API/api/assistant" -H "$AUTH" -H "Content-Type: application/json" -d '{"question":"what templates are available in the system?"}')
assert "POST /assistant (templates) - success" "true" "$(echo "$ASS5" | jq -r '.success')"
assert_contains "POST /assistant (templates) - mentions templates" "template" "$(echo "$ASS5" | jq -r '.data.answer' | tr '[:upper:]' '[:lower:]')"

echo "  Asking how to get started..."
ASS6=$(curl -s -X POST "$API/api/assistant" -H "$AUTH" -H "Content-Type: application/json" -d '{"question":"how do i get started with Nexara?"}')
assert "POST /assistant (get started) - success" "true" "$(echo "$ASS6" | jq -r '.success')"

echo "  Testing assistant validation - empty question..."
VAL_ASS=$(curl -s -X POST "$API/api/assistant" -H "$AUTH" -H "Content-Type: application/json" -d '{"question":""}')
assert "POST /assistant - empty question returns error" "false" "$(echo "$VAL_ASS" | jq -r '.success')"

echo "  Testing assistant validation - missing question..."
MISS_ASS=$(curl -s -X POST "$API/api/assistant" -H "$AUTH" -H "Content-Type: application/json" -d '{}')
assert "POST /assistant - missing question returns error" "false" "$(echo "$MISS_ASS" | jq -r '.success')"

echo ""

# -------------------------------------------------
echo "6. COMPLIANCE MODULE"
echo "-------------------------------------------------"

echo "  Testing gap analysis..."
GAP_RESULT=$(curl -s -X POST "$API/api/compliance/gap-analysis" -H "$AUTH" -H "Content-Type: application/json" -d '{"standards":["ISO 9001","ISO 14001"],"currentEvidence":[{"clause":"4.1","evidence":"Context document exists","status":"COMPLIANT"},{"clause":"6.1","evidence":"Risk register maintained","status":"PARTIAL"}],"organisationContext":"Manufacturing company"}')
GAP_CODE=$(echo "$GAP_RESULT" | jq -r '.error.code // "none"')
GAP_OK=$([ "$GAP_CODE" = "NO_AI_CONFIG" ] && echo "true" || echo "$GAP_RESULT" | jq -r '.success')
assert "POST /compliance/gap-analysis - valid response (success or NO_AI_CONFIG)" "true" "$GAP_OK"

echo "  Testing gap analysis validation..."
GAP_VAL=$(curl -s -X POST "$API/api/compliance/gap-analysis" -H "$AUTH" -H "Content-Type: application/json" -d '{"standards":[],"currentEvidence":[]}')
assert "POST /compliance/gap-analysis - empty standards = VALIDATION_ERROR" "VALIDATION_ERROR" "$(echo "$GAP_VAL" | jq -r '.error.code')"

echo "  Testing predictive risk analysis..."
PRED_RESULT=$(curl -s -X POST "$API/api/compliance/predictive-risk" -H "$AUTH" -H "Content-Type: application/json" -d '{"historicalIncidents":[{"type":"SLIP_TRIP_FALL","severity":"MINOR","date":"2026-01-15","department":"Warehouse"},{"type":"EQUIPMENT_FAULT","severity":"MODERATE","date":"2026-02-10","department":"Production"}],"timeframeMonths":6}')
PRED_CODE=$(echo "$PRED_RESULT" | jq -r '.error.code // "none"')
PRED_OK=$([ "$PRED_CODE" = "NO_AI_CONFIG" ] && echo "true" || echo "$PRED_RESULT" | jq -r '.success')
assert "POST /compliance/predictive-risk - valid response" "true" "$PRED_OK"

echo "  Testing predictive risk validation..."
PRED_VAL=$(curl -s -X POST "$API/api/compliance/predictive-risk" -H "$AUTH" -H "Content-Type: application/json" -d '{"historicalIncidents":[]}')
assert "POST /compliance/predictive-risk - empty incidents = VALIDATION_ERROR" "VALIDATION_ERROR" "$(echo "$PRED_VAL" | jq -r '.error.code')"

echo "  Testing semantic search..."
SEARCH_RESULT=$(curl -s -X POST "$API/api/compliance/search" -H "$AUTH" -H "Content-Type: application/json" -d '{"query":"chemical waste disposal environmental compliance","limit":10}')
SEARCH_CODE=$(echo "$SEARCH_RESULT" | jq -r '.error.code // "none"')
SEARCH_OK=$([ "$SEARCH_CODE" = "NO_AI_CONFIG" ] && echo "true" || echo "$SEARCH_RESULT" | jq -r '.success')
assert "POST /compliance/search - valid response" "true" "$SEARCH_OK"

echo "  Testing search validation..."
SEARCH_VAL=$(curl -s -X POST "$API/api/compliance/search" -H "$AUTH" -H "Content-Type: application/json" -d '{"query":"ab"}')
assert "POST /compliance/search - short query = VALIDATION_ERROR" "VALIDATION_ERROR" "$(echo "$SEARCH_VAL" | jq -r '.error.code')"

echo ""

# -------------------------------------------------
echo "7. GATEWAY PROXY"
echo "-------------------------------------------------"

echo "  Testing all routes through gateway..."
for ROUTE in analyses settings assistant; do
  RESULT=$(curl -s "$GW/api/ai/$ROUTE" -H "$AUTH")
  assert "Gateway /api/ai/$ROUTE" "true" "$(echo "$RESULT" | jq -r '.success')"
done

GW_ANA=$(curl -s -X POST "$GW/api/ai/analyze" -H "$AUTH" -H "Content-Type: application/json" -d '{"type":"ENVIRONMENTAL_ASPECT","context":{"aspectTitle":"test aspect"}}')
assert "Gateway POST /api/ai/analyze" "true" "$(echo "$GW_ANA" | jq -r '.success')"

echo ""

# -------------------------------------------------
echo "8. AUTH PROTECTION"
echo "-------------------------------------------------"

echo "  Testing unauthenticated access..."
NO_AUTH=$(curl -s "$API/api/analyses")
assert "GET /analyses without auth - rejected" "false" "$(echo "$NO_AUTH" | jq -r '.success')"

NO_AUTH_POST=$(curl -s -X POST "$API/api/analyze" -H "Content-Type: application/json" -d '{"type":"LEGAL_REFERENCES","context":{}}')
assert "POST /analyze without auth - rejected" "false" "$(echo "$NO_AUTH_POST" | jq -r '.success')"

echo ""
echo "============================================"
echo "  RESULTS: $PASS passed, $FAIL failed (out of $TOTAL)"
echo "============================================"

if [ $FAIL -gt 0 ]; then
  exit 1
fi
