#!/bin/bash
# Comprehensive integration test script for ISO 42001 (AI Management) modules
# Tests: AI Systems, Controls, Impact Assessments, Risk Assessments, Incidents, Policies

API="http://localhost:4023"
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
echo "  ISO 42001 Modules - Integration Test Suite"
echo "============================================"
echo ""

echo "1. AI SYSTEMS MODULE"
echo "─────────────────────────────────────────"

echo "  Creating AI system..."
SYS_RESULT=$(curl -s -X POST "$API/api/ai-systems" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "name": "Customer Churn Prediction Model",
  "description": "Machine learning model predicting customer churn probability based on usage patterns",
  "category": "MACHINE_LEARNING",
  "riskTier": "HIGH",
  "purpose": "Predict customers at risk of cancellation to enable proactive retention",
  "vendor": "Internal",
  "version": "2.3.1",
  "owner": "Data Science Team",
  "department": "Product Analytics",
  "dataTypes": "Usage logs, login frequency, feature adoption, support tickets",
  "userBase": "Customer Success team (50 users)"
}')
SYS_ID=$(echo "$SYS_RESULT" | jq -r '.data.id')
SYS_REF=$(echo "$SYS_RESULT" | jq -r '.data.reference')
assert "POST /ai-systems - success" "true" "$(echo "$SYS_RESULT" | jq -r '.success')"
assert_contains "POST /ai-systems - reference starts with AI42-SYS" "AI42-SYS" "$SYS_REF"
assert "POST /ai-systems - default status ACTIVE" "ACTIVE" "$(echo "$SYS_RESULT" | jq -r '.data.status')"
assert "POST /ai-systems - riskTier HIGH stored" "HIGH" "$(echo "$SYS_RESULT" | jq -r '.data.riskTier')"

echo "  Creating second AI system (GENERATIVE_AI, UNACCEPTABLE)..."
SYS2_RESULT=$(curl -s -X POST "$API/api/ai-systems" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "name": "Automated Content Generator",
  "description": "Generative AI system for producing marketing copy and product descriptions",
  "category": "GENERATIVE_AI",
  "riskTier": "UNACCEPTABLE",
  "vendor": "OpenAI",
  "version": "GPT-4",
  "department": "Marketing"
}')
SYS2_ID=$(echo "$SYS2_RESULT" | jq -r '.data.id')
assert "POST /ai-systems second - success" "true" "$(echo "$SYS2_RESULT" | jq -r '.success')"
assert "POST /ai-systems UNACCEPTABLE tier stored" "UNACCEPTABLE" "$(echo "$SYS2_RESULT" | jq -r '.data.riskTier')"

echo "  Listing AI systems..."
LIST_RESULT=$(curl -s "$API/api/ai-systems" -H "$AUTH")
assert "GET /ai-systems - success" "true" "$(echo "$LIST_RESULT" | jq -r '.success')"
assert "GET /ai-systems - has records" "true" "$(echo "$LIST_RESULT" | jq -r '(.data | length) > 0')"
assert "GET /ai-systems - pagination present" "true" "$(echo "$LIST_RESULT" | jq -r '.pagination != null')"

FILTER_RESULT=$(curl -s "$API/api/ai-systems?riskTier=HIGH" -H "$AUTH")
assert "GET /ai-systems?riskTier=HIGH - success" "true" "$(echo "$FILTER_RESULT" | jq -r '.success')"

CAT_RESULT=$(curl -s "$API/api/ai-systems?category=MACHINE_LEARNING" -H "$AUTH")
assert "GET /ai-systems?category filter - success" "true" "$(echo "$CAT_RESULT" | jq -r '.success')"

SEARCH_RESULT=$(curl -s "$API/api/ai-systems?search=Churn" -H "$AUTH")
assert "GET /ai-systems?search - finds result" "true" "$(echo "$SEARCH_RESULT" | jq -r '(.data | length) > 0')"

echo "  Getting single AI system..."
GET_RESULT=$(curl -s "$API/api/ai-systems/$SYS_ID" -H "$AUTH")
assert "GET /ai-systems/:id - success" "true" "$(echo "$GET_RESULT" | jq -r '.success')"
assert "GET /ai-systems/:id - correct name" "Customer Churn Prediction Model" "$(echo "$GET_RESULT" | jq -r '.data.name')"

NOT_FOUND=$(curl -s "$API/api/ai-systems/00000000-0000-0000-0000-000000000999" -H "$AUTH")
assert "GET /ai-systems/:id - 404 NOT_FOUND" "NOT_FOUND" "$(echo "$NOT_FOUND" | jq -r '.error.code')"

echo "  Updating AI system..."
UPD_RESULT=$(curl -s -X PUT "$API/api/ai-systems/$SYS_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "status": "UNDER_REVIEW", "version": "2.4.0",
  "notes": "Undergoing quarterly review before re-certification"
}')
assert "PUT /ai-systems/:id - success" "true" "$(echo "$UPD_RESULT" | jq -r '.success')"
assert "PUT /ai-systems/:id - status updated to UNDER_REVIEW" "UNDER_REVIEW" "$(echo "$UPD_RESULT" | jq -r '.data.status')"
assert "PUT /ai-systems/:id - version updated to 2.4.0" "2.4.0" "$(echo "$UPD_RESULT" | jq -r '.data.version')"

VAL_RESULT=$(curl -s -X POST "$API/api/ai-systems" -H "$AUTH" -H "Content-Type: application/json" -d '{"name":""}')
assert "POST /ai-systems - validation error on empty name" "VALIDATION_ERROR" "$(echo "$VAL_RESULT" | jq -r '.error.code')"

echo ""
echo "2. RISK ASSESSMENTS MODULE"
echo "─────────────────────────────────────────"

echo "  Creating risk assessment..."
RSK_RESULT=$(curl -s -X POST "$API/api/risk-assessments" -H "$AUTH" -H "Content-Type: application/json" -d "{
  \"systemId\": \"$SYS_ID\",
  \"title\": \"Bias in training data leading to unfair churn predictions\",
  \"description\": \"Training dataset may under-represent certain demographics, leading to biased predictions\",
  \"category\": \"BIAS_DISCRIMINATION\",
  \"likelihood\": \"POSSIBLE\",
  \"impact\": \"MAJOR\",
  \"riskOwner\": \"Data Ethics Lead\",
  \"existingControls\": \"Manual review of model outputs quarterly\"
}")
RSK_ID=$(echo "$RSK_RESULT" | jq -r '.data.id')
RSK_REF=$(echo "$RSK_RESULT" | jq -r '.data.reference')
assert "POST /risk-assessments - success" "true" "$(echo "$RSK_RESULT" | jq -r '.success')"
assert_contains "POST /risk-assessments - reference AI42-RSK" "AI42-RSK" "$RSK_REF"
assert "POST /risk-assessments - score 12 (POSSIBLE=3 x MAJOR=4)" "12" "$(echo "$RSK_RESULT" | jq -r '.data.riskScore')"
assert "POST /risk-assessments - level HIGH for score 12" "HIGH" "$(echo "$RSK_RESULT" | jq -r '.data.riskLevel')"
assert "POST /risk-assessments - default status IDENTIFIED" "IDENTIFIED" "$(echo "$RSK_RESULT" | jq -r '.data.status')"

echo "  Creating CRITICAL risk..."
RSK2_RESULT=$(curl -s -X POST "$API/api/risk-assessments" -H "$AUTH" -H "Content-Type: application/json" -d "{
  \"systemId\": \"$SYS_ID\",
  \"title\": \"Systemic failure causing mass incorrect churn flags\",
  \"category\": \"ROBUSTNESS_RELIABILITY\",
  \"likelihood\": \"ALMOST_CERTAIN\",
  \"impact\": \"CATASTROPHIC\"
}")
RSK2_ID=$(echo "$RSK2_RESULT" | jq -r '.data.id')
assert "POST /risk-assessments CRITICAL - score 25" "25" "$(echo "$RSK2_RESULT" | jq -r '.data.riskScore')"
assert "POST /risk-assessments CRITICAL - level CRITICAL" "CRITICAL" "$(echo "$RSK2_RESULT" | jq -r '.data.riskLevel')"

echo "  Listing risk assessments..."
LIST_RSK=$(curl -s "$API/api/risk-assessments" -H "$AUTH")
assert "GET /risk-assessments - success" "true" "$(echo "$LIST_RSK" | jq -r '.success')"
assert "GET /risk-assessments - has records" "true" "$(echo "$LIST_RSK" | jq -r '(.data | length) > 0')"

SYS_RSK=$(curl -s "$API/api/risk-assessments?systemId=$SYS_ID" -H "$AUTH")
assert "GET /risk-assessments?systemId filter - success" "true" "$(echo "$SYS_RSK" | jq -r '.success')"

CAT_RSK=$(curl -s "$API/api/risk-assessments?category=BIAS_DISCRIMINATION" -H "$AUTH")
assert "GET /risk-assessments?category filter - success" "true" "$(echo "$CAT_RSK" | jq -r '.success')"

GET_RSK=$(curl -s "$API/api/risk-assessments/$RSK_ID" -H "$AUTH")
assert "GET /risk-assessments/:id - success" "true" "$(echo "$GET_RSK" | jq -r '.success')"
assert "GET /risk-assessments/:id - includes system info" "true" "$(echo "$GET_RSK" | jq -r '.data.system != null')"

echo "  Updating risk assessment..."
UPD_RSK=$(curl -s -X PUT "$API/api/risk-assessments/$RSK_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{"status":"MITIGATED","likelihood":"UNLIKELY","impact":"MODERATE"}')
assert "PUT /risk-assessments/:id - success" "true" "$(echo "$UPD_RSK" | jq -r '.success')"
assert "PUT /risk-assessments/:id - recalculated score 6 (UNLIKELY=2 x MODERATE=3)" "6" "$(echo "$UPD_RSK" | jq -r '.data.riskScore')"
assert "PUT /risk-assessments/:id - recalculated level MEDIUM" "MEDIUM" "$(echo "$UPD_RSK" | jq -r '.data.riskLevel')"

echo ""
echo "3. IMPACT ASSESSMENTS MODULE"
echo "─────────────────────────────────────────"

echo "  Creating impact assessment..."
IMP_RESULT=$(curl -s -X POST "$API/api/impact-assessments" -H "$AUTH" -H "Content-Type: application/json" -d "{
  \"systemId\": \"$SYS_ID\",
  \"title\": \"Initial impact assessment for customer churn model v2\",
  \"description\": \"Comprehensive assessment of societal, economic and human rights impacts\",
  \"impactLevel\": \"SIGNIFICANT\",
  \"assessmentType\": \"INITIAL\",
  \"scope\": \"All customer accounts in EMEA region\",
  \"methodology\": \"Stakeholder interviews, literature review, bias auditing\",
  \"humanRightsImpact\": \"Potential for discriminatory treatment of vulnerable customer groups\",
  \"economicImpact\": \"Estimated 12% improvement in customer retention rates\",
  \"mitigationMeasures\": \"Fairness constraints in model training, regular bias audits\",
  \"assessor\": \"Dr. Sarah Ethics\"
}")
IMP_ID=$(echo "$IMP_RESULT" | jq -r '.data.id')
IMP_REF=$(echo "$IMP_RESULT" | jq -r '.data.reference')
assert "POST /impact-assessments - success" "true" "$(echo "$IMP_RESULT" | jq -r '.success')"
assert_contains "POST /impact-assessments - reference AI42-IMP" "AI42-IMP" "$IMP_REF"
assert "POST /impact-assessments - default status DRAFT" "DRAFT" "$(echo "$IMP_RESULT" | jq -r '.data.status')"
assert "POST /impact-assessments - impactLevel SIGNIFICANT" "SIGNIFICANT" "$(echo "$IMP_RESULT" | jq -r '.data.impactLevel')"

echo "  Listing impact assessments..."
LIST_IMP=$(curl -s "$API/api/impact-assessments" -H "$AUTH")
assert "GET /impact-assessments - success" "true" "$(echo "$LIST_IMP" | jq -r '.success')"
assert "GET /impact-assessments - has records" "true" "$(echo "$LIST_IMP" | jq -r '(.data | length) > 0')"

LVL_FILTER=$(curl -s "$API/api/impact-assessments?impactLevel=SIGNIFICANT" -H "$AUTH")
assert "GET /impact-assessments?impactLevel filter - success" "true" "$(echo "$LVL_FILTER" | jq -r '.success')"

SYS_IMP=$(curl -s "$API/api/impact-assessments?systemId=$SYS_ID" -H "$AUTH")
assert "GET /impact-assessments?systemId filter - success" "true" "$(echo "$SYS_IMP" | jq -r '.success')"

GET_IMP=$(curl -s "$API/api/impact-assessments/$IMP_ID" -H "$AUTH")
assert "GET /impact-assessments/:id - success" "true" "$(echo "$GET_IMP" | jq -r '.success')"
assert "GET /impact-assessments/:id - includes system info" "true" "$(echo "$GET_IMP" | jq -r '.data.system != null')"

echo "  Updating impact assessment..."
UPD_IMP=$(curl -s -X PUT "$API/api/impact-assessments/$IMP_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{"status":"IN_PROGRESS","findings":"Bias detected in predictions for customers over age 65."}')
assert "PUT /impact-assessments/:id - success" "true" "$(echo "$UPD_IMP" | jq -r '.success')"
assert "PUT /impact-assessments/:id - status IN_PROGRESS" "IN_PROGRESS" "$(echo "$UPD_IMP" | jq -r '.data.status')"

echo "  Approving impact assessment..."
APPROVE_IMP=$(curl -s -X PUT "$API/api/impact-assessments/$IMP_ID/approve" -H "$AUTH")
assert "PUT /impact-assessments/:id/approve - success" "true" "$(echo "$APPROVE_IMP" | jq -r '.success')"
assert "PUT /impact-assessments/:id/approve - status APPROVED" "APPROVED" "$(echo "$APPROVE_IMP" | jq -r '.data.status')"
assert "PUT /impact-assessments/:id/approve - approvedAt set" "true" "$(echo "$APPROVE_IMP" | jq -r '.data.approvedAt != null')"

DOUBLE_APPROVE=$(curl -s -X PUT "$API/api/impact-assessments/$IMP_ID/approve" -H "$AUTH")
assert "PUT approve already-approved - 400 ALREADY_APPROVED" "ALREADY_APPROVED" "$(echo "$DOUBLE_APPROVE" | jq -r '.error.code')"

echo ""
echo "4. CONTROLS MODULE"
echo "─────────────────────────────────────────"

echo "  Getting Statement of Applicability..."
SOA_RESULT=$(curl -s "$API/api/controls/soa" -H "$AUTH")
assert "GET /controls/soa - success" "true" "$(echo "$SOA_RESULT" | jq -r '.success')"
assert "GET /controls/soa - has controls array" "true" "$(echo "$SOA_RESULT" | jq -r '(.data.controls | length) > 0')"
assert "GET /controls/soa - has summary" "true" "$(echo "$SOA_RESULT" | jq -r '.data.summary != null')"
assert "GET /controls/soa - totalControls positive" "true" "$(echo "$SOA_RESULT" | jq -r '.data.summary.totalControls > 0')"

LIST_CTRL=$(curl -s "$API/api/controls" -H "$AUTH")
assert "GET /controls - success" "true" "$(echo "$LIST_CTRL" | jq -r '.success')"

DOM_FILTER=$(curl -s "$API/api/controls?domain=AI_POLICY" -H "$AUTH")
assert "GET /controls?domain=AI_POLICY filter - success" "true" "$(echo "$DOM_FILTER" | jq -r '.success')"

echo ""
echo "5. INCIDENTS MODULE"
echo "─────────────────────────────────────────"

echo "  Creating AI incident..."
INC_RESULT=$(curl -s -X POST "$API/api/incidents" -H "$AUTH" -H "Content-Type: application/json" -d "{
  \"systemId\": \"$SYS_ID\",
  \"title\": \"Model producing biased churn scores for APAC region\",
  \"description\": \"Users in APAC region are predicted as high churn at 3x the rate of EU users with equivalent usage\",
  \"severity\": \"HIGH\",
  \"incidentDate\": \"2026-02-20\",
  \"category\": \"BIAS_INCIDENT\",
  \"affectedParties\": \"~2400 APAC customer accounts\",
  \"immediateAction\": \"Suspended automated outreach for APAC segment\",
  \"reportedBy\": \"Regional CS Lead\"
}")
INC_ID=$(echo "$INC_RESULT" | jq -r '.data.id')
assert "POST /incidents - success" "true" "$(echo "$INC_RESULT" | jq -r '.success')"
assert_contains "POST /incidents - reference contains AI42" "AI42" "$(echo "$INC_RESULT" | jq -r '.data.reference')"
assert "POST /incidents - default status REPORTED" "REPORTED" "$(echo "$INC_RESULT" | jq -r '.data.status')"

LIST_INC=$(curl -s "$API/api/incidents" -H "$AUTH")
assert "GET /incidents - success" "true" "$(echo "$LIST_INC" | jq -r '.success')"
assert "GET /incidents - has records" "true" "$(echo "$LIST_INC" | jq -r '(.data | length) > 0')"

GET_INC=$(curl -s "$API/api/incidents/$INC_ID" -H "$AUTH")
assert "GET /incidents/:id - success" "true" "$(echo "$GET_INC" | jq -r '.success')"

UPD_INC=$(curl -s -X PUT "$API/api/incidents/$INC_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{"status":"INVESTIGATING"}')
assert "PUT /incidents/:id - status INVESTIGATING" "INVESTIGATING" "$(echo "$UPD_INC" | jq -r '.data.status')"

echo ""
echo "6. POLICIES MODULE"
echo "─────────────────────────────────────────"

echo "  Creating AI policy..."
POL_RESULT=$(curl -s -X POST "$API/api/policies" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "title": "AI Ethics and Governance Policy",
  "content": "This policy establishes principles and requirements for ethical AI development and deployment. All AI systems must undergo risk assessment prior to deployment. High-risk systems require additional human oversight. Bias testing is mandatory for customer-facing AI.",
  "policyType": "AI_GOVERNANCE",
  "version": "1.0",
  "owner": "Chief AI Officer",
  "department": "Technology",
  "effectiveDate": "2026-01-01",
  "reviewDate": "2027-01-01"
}')
POL_ID=$(echo "$POL_RESULT" | jq -r '.data.id')
assert "POST /policies - success" "true" "$(echo "$POL_RESULT" | jq -r '.success')"
assert_contains "POST /policies - reference contains AI42" "AI42" "$(echo "$POL_RESULT" | jq -r '.data.reference')"

LIST_POL=$(curl -s "$API/api/policies" -H "$AUTH")
assert "GET /policies - success" "true" "$(echo "$LIST_POL" | jq -r '.success')"
assert "GET /policies - has records" "true" "$(echo "$LIST_POL" | jq -r '(.data | length) > 0')"

GET_POL=$(curl -s "$API/api/policies/$POL_ID" -H "$AUTH")
assert "GET /policies/:id - success" "true" "$(echo "$GET_POL" | jq -r '.success')"
assert "GET /policies/:id - correct title" "AI Ethics and Governance Policy" "$(echo "$GET_POL" | jq -r '.data.title')"

echo ""
echo "7. GATEWAY PROXY"
echo "─────────────────────────────────────────"

echo "  Testing all routes through gateway..."
for ROUTE in ai-systems risk-assessments impact-assessments controls policies incidents; do
  RESULT=$(curl -s "$GW/api/iso42001/$ROUTE" -H "$AUTH")
  assert "Gateway /api/iso42001/$ROUTE - success" "true" "$(echo "$RESULT" | jq -r '.success')"
done

echo ""
echo "8. DELETE OPERATIONS (cleanup)"
echo "─────────────────────────────────────────"

DEL_IMP=$(curl -s -X DELETE "$API/api/impact-assessments/$IMP_ID" -H "$AUTH")
assert "DELETE /impact-assessments/:id - success" "true" "$(echo "$DEL_IMP" | jq -r '.success')"

VERIFY_IMP=$(curl -s "$API/api/impact-assessments/$IMP_ID" -H "$AUTH")
assert "Deleted impact assessment returns 404" "NOT_FOUND" "$(echo "$VERIFY_IMP" | jq -r '.error.code')"

DEL_RSK=$(curl -s -X DELETE "$API/api/risk-assessments/$RSK_ID" -H "$AUTH")
assert "DELETE /risk-assessments/:id - success" "true" "$(echo "$DEL_RSK" | jq -r '.success')"

DEL_RSK2=$(curl -s -X DELETE "$API/api/risk-assessments/$RSK2_ID" -H "$AUTH")
assert "DELETE /risk-assessments second - success" "true" "$(echo "$DEL_RSK2" | jq -r '.success')"

DEL_SYS=$(curl -s -X DELETE "$API/api/ai-systems/$SYS_ID" -H "$AUTH")
assert "DELETE /ai-systems/:id - success" "true" "$(echo "$DEL_SYS" | jq -r '.success')"
assert "DELETE /ai-systems/:id - deleted flag true" "true" "$(echo "$DEL_SYS" | jq -r '.data.deleted')"

VERIFY_SYS=$(curl -s "$API/api/ai-systems/$SYS_ID" -H "$AUTH")
assert "Deleted AI system returns 404" "NOT_FOUND" "$(echo "$VERIFY_SYS" | jq -r '.error.code')"

DEL_SYS2=$(curl -s -X DELETE "$API/api/ai-systems/$SYS2_ID" -H "$AUTH")
assert "DELETE /ai-systems second - success" "true" "$(echo "$DEL_SYS2" | jq -r '.success')"

echo ""
echo "============================================"
echo "  RESULTS: $PASS passed, $FAIL failed (out of $TOTAL)"
echo "============================================"

if [ $FAIL -gt 0 ]; then
  exit 1
fi
