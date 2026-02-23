#!/bin/bash
# Comprehensive integration test script for ISO 37001 (Anti-Bribery) modules
# Tests: Gifts, Due Diligence, Risk Assessments, Policies, Investigations, Compliance

API="http://localhost:4024"
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
echo "  ISO 37001 Modules - Integration Test Suite"
echo "============================================"
echo ""

echo "1. GIFTS & HOSPITALITY MODULE"
echo "─────────────────────────────────────────"

echo "  Creating gift record (RECEIVED from government official)..."
GFT_RESULT=$(curl -s -X POST "$API/api/gifts" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "description": "Luxury watch received from Ministry of Trade representative during contract negotiations",
  "giftType": "GIFT",
  "direction": "RECEIVED",
  "value": 1250.00,
  "currency": "GBP",
  "recipientOrGiver": "Mr. James Okonkwo",
  "date": "2026-02-15",
  "organization": "Ministry of Trade",
  "position": "Senior Procurement Director",
  "governmentOfficial": true,
  "reason": "Gift given at conclusion of procurement meeting",
  "employeeName": "Sarah Mitchell",
  "department": "Government Relations"
}')
GFT_ID=$(echo "$GFT_RESULT" | jq -r '.data.id')
GFT_REF=$(echo "$GFT_RESULT" | jq -r '.data.referenceNumber')
assert "POST /gifts - success" "true" "$(echo "$GFT_RESULT" | jq -r '.success')"
assert_contains "POST /gifts - reference starts with AB-GFT" "AB-GFT" "$GFT_REF"
assert "POST /gifts - default status PENDING" "PENDING" "$(echo "$GFT_RESULT" | jq -r '.data.status')"
assert "POST /gifts - governmentOfficial true" "true" "$(echo "$GFT_RESULT" | jq -r '.data.governmentOfficial')"

echo "  Creating hospitality record (GIVEN to commercial partner)..."
GFT2_RESULT=$(curl -s -X POST "$API/api/gifts" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "description": "Business dinner at restaurant for potential client",
  "giftType": "HOSPITALITY",
  "direction": "GIVEN",
  "value": 380.00,
  "currency": "USD",
  "recipientOrGiver": "Tech Corp procurement team (4 people)",
  "date": "2026-02-18",
  "organization": "Tech Corp Ltd",
  "position": "Procurement Team",
  "governmentOfficial": false,
  "reason": "Business development dinner to discuss partnership opportunities",
  "employeeName": "David Chen",
  "department": "Sales"
}')
GFT2_ID=$(echo "$GFT2_RESULT" | jq -r '.data.id')
assert "POST /gifts hospitality - success" "true" "$(echo "$GFT2_RESULT" | jq -r '.success')"
assert "POST /gifts hospitality - giftType HOSPITALITY" "HOSPITALITY" "$(echo "$GFT2_RESULT" | jq -r '.data.giftType')"
assert "POST /gifts hospitality - governmentOfficial false" "false" "$(echo "$GFT2_RESULT" | jq -r '.data.governmentOfficial')"

echo "  Listing gifts..."
LIST_GFT=$(curl -s "$API/api/gifts" -H "$AUTH")
assert "GET /gifts - success" "true" "$(echo "$LIST_GFT" | jq -r '.success')"
assert "GET /gifts - has records" "true" "$(echo "$LIST_GFT" | jq -r '(.data | length) > 0')"
assert "GET /gifts - pagination present" "true" "$(echo "$LIST_GFT" | jq -r '.pagination != null')"

RECV_FILTER=$(curl -s "$API/api/gifts?direction=RECEIVED" -H "$AUTH")
assert "GET /gifts?direction=RECEIVED filter - success" "true" "$(echo "$RECV_FILTER" | jq -r '.success')"

TYPE_FILTER=$(curl -s "$API/api/gifts?giftType=HOSPITALITY" -H "$AUTH")
assert "GET /gifts?giftType filter - success" "true" "$(echo "$TYPE_FILTER" | jq -r '.success')"

echo "  Getting single gift record..."
GET_GFT=$(curl -s "$API/api/gifts/$GFT_ID" -H "$AUTH")
assert "GET /gifts/:id - success" "true" "$(echo "$GET_GFT" | jq -r '.success')"
assert "GET /gifts/:id - correct description" "Luxury watch received from Ministry of Trade representative during contract negotiations" "$(echo "$GET_GFT" | jq -r '.data.description')"

NOT_FOUND=$(curl -s "$API/api/gifts/00000000-0000-0000-0000-000000000999" -H "$AUTH")
assert "GET /gifts/:id - 404 NOT_FOUND" "NOT_FOUND" "$(echo "$NOT_FOUND" | jq -r '.error.code')"

echo "  Updating gift record..."
UPD_GFT=$(curl -s -X PUT "$API/api/gifts/$GFT_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "notes": "Legal team notified. Compliance review in progress. Gift is held in company safe pending decision."
}')
assert "PUT /gifts/:id - success" "true" "$(echo "$UPD_GFT" | jq -r '.success')"

echo "  Approving hospitality record..."
APPROVE_GFT=$(curl -s -X PUT "$API/api/gifts/$GFT2_ID/approve" -H "$AUTH")
assert "PUT /gifts/:id/approve - success" "true" "$(echo "$APPROVE_GFT" | jq -r '.success')"
assert "PUT /gifts/:id/approve - status APPROVED" "APPROVED" "$(echo "$APPROVE_GFT" | jq -r '.data.status')"
assert "PUT /gifts/:id/approve - approvedAt set" "true" "$(echo "$APPROVE_GFT" | jq -r '.data.approvedAt != null')"

echo "  Declining government official gift..."
DECLINE_GFT=$(curl -s -X PUT "$API/api/gifts/$GFT_ID/decline" -H "$AUTH")
assert "PUT /gifts/:id/decline - success" "true" "$(echo "$DECLINE_GFT" | jq -r '.success')"
assert "PUT /gifts/:id/decline - status DECLINED" "DECLINED" "$(echo "$DECLINE_GFT" | jq -r '.data.status')"

echo ""
echo "2. DUE DILIGENCE MODULE"
echo "─────────────────────────────────────────"

echo "  Creating due diligence assessment..."
DD_RESULT=$(curl -s -X POST "$API/api/due-diligence" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "thirdPartyName": "Global Logistics Partners SA",
  "thirdPartyType": "AGENT",
  "level": "ENHANCED",
  "country": "Nigeria",
  "industry": "Logistics and Freight",
  "contactName": "Emmanuel Adeyemi",
  "contactEmail": "e.adeyemi@glp-sa.com",
  "contractValue": 2500000,
  "currency": "USD",
  "riskLevel": "HIGH",
  "scopeOfEngagement": "Customs clearance and last-mile delivery services for West Africa region",
  "notes": "Agent operates in high-risk jurisdiction. Enhanced due diligence required per policy."
}')
DD_ID=$(echo "$DD_RESULT" | jq -r '.data.id')
DD_REF=$(echo "$DD_RESULT" | jq -r '.data.referenceNumber')
assert "POST /due-diligence - success" "true" "$(echo "$DD_RESULT" | jq -r '.success')"
assert_contains "POST /due-diligence - reference starts with AB-DD" "AB-DD" "$DD_REF"
assert "POST /due-diligence - default status PENDING" "PENDING" "$(echo "$DD_RESULT" | jq -r '.data.status')"
assert "POST /due-diligence - thirdPartyType AGENT" "AGENT" "$(echo "$DD_RESULT" | jq -r '.data.thirdPartyType')"

echo "  Creating basic due diligence..."
DD2_RESULT=$(curl -s -X POST "$API/api/due-diligence" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "thirdPartyName": "Office Supplies Direct Ltd",
  "thirdPartyType": "SUPPLIER",
  "level": "BASIC",
  "country": "United Kingdom",
  "industry": "Office Supplies",
  "riskLevel": "LOW"
}')
DD2_ID=$(echo "$DD2_RESULT" | jq -r '.data.id')
assert "POST /due-diligence basic - success" "true" "$(echo "$DD2_RESULT" | jq -r '.success')"
assert "POST /due-diligence basic - level BASIC" "BASIC" "$(echo "$DD2_RESULT" | jq -r '.data.level')"

echo "  Listing due diligence assessments..."
LIST_DD=$(curl -s "$API/api/due-diligence" -H "$AUTH")
assert "GET /due-diligence - success" "true" "$(echo "$LIST_DD" | jq -r '.success')"
assert "GET /due-diligence - has records" "true" "$(echo "$LIST_DD" | jq -r '(.data | length) > 0')"

RL_FILTER=$(curl -s "$API/api/due-diligence?riskLevel=HIGH" -H "$AUTH")
assert "GET /due-diligence?riskLevel=HIGH filter - success" "true" "$(echo "$RL_FILTER" | jq -r '.success')"

TYPE_FILTER_DD=$(curl -s "$API/api/due-diligence?thirdPartyType=AGENT" -H "$AUTH")
assert "GET /due-diligence?thirdPartyType filter - success" "true" "$(echo "$TYPE_FILTER_DD" | jq -r '.success')"

echo "  Getting single due diligence assessment..."
GET_DD=$(curl -s "$API/api/due-diligence/$DD_ID" -H "$AUTH")
assert "GET /due-diligence/:id - success" "true" "$(echo "$GET_DD" | jq -r '.success')"
assert "GET /due-diligence/:id - correct third party name" "Global Logistics Partners SA" "$(echo "$GET_DD" | jq -r '.data.thirdPartyName')"

echo "  Updating due diligence..."
UPD_DD=$(curl -s -X PUT "$API/api/due-diligence/$DD_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "notes": "Initial screening complete. Proceeding to enhanced checks. PEP screening clear. Adverse media: 2 minor findings."
}')
assert "PUT /due-diligence/:id - success" "true" "$(echo "$UPD_DD" | jq -r '.success')"

echo "  Completing due diligence with findings..."
COMPLETE_DD=$(curl -s -X PUT "$API/api/due-diligence/$DD_ID/complete" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "findings": "Enhanced due diligence completed. No PEP connections found. Two minor adverse media items identified relating to delayed customs clearances in 2024. No evidence of corrupt practices. Recommend approval with conditions.",
  "riskLevel": "MEDIUM",
  "recommendation": "APPROVE_WITH_CONDITIONS",
  "conditions": "Annual re-assessment required. Contractual anti-bribery clauses mandatory. Senior management sign-off on each transaction above $500k."
}')
assert "PUT /due-diligence/:id/complete - success" "true" "$(echo "$COMPLETE_DD" | jq -r '.success')"
assert "PUT /due-diligence/:id/complete - status COMPLETED" "COMPLETED" "$(echo "$COMPLETE_DD" | jq -r '.data.status')"
assert "PUT /due-diligence/:id/complete - completedAt set" "true" "$(echo "$COMPLETE_DD" | jq -r '.data.completedAt != null')"

echo ""
echo "3. RISK ASSESSMENTS MODULE"
echo "─────────────────────────────────────────"

echo "  Creating bribery risk assessment..."
RSK_RESULT=$(curl -s -X POST "$API/api/risk-assessments" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "title": "Bribery risk in West Africa customs clearance operations",
  "description": "Assessment of facilitation payment risks when using agents for customs clearance in high-risk jurisdictions",
  "category": "FACILITATION_PAYMENTS",
  "businessFunction": "Supply Chain Operations",
  "likelihood": 4,
  "impact": 5,
  "country": "Nigeria",
  "existingControls": "Agent contract includes anti-bribery clause. Annual training for procurement staff.",
  "owner": "Chief Compliance Officer",
  "notes": "Reviewed in light of recent industry enforcement actions in West Africa"
}')
RSK_ID=$(echo "$RSK_RESULT" | jq -r '.data.id')
RSK_REF=$(echo "$RSK_RESULT" | jq -r '.data.referenceNumber')
RSK_SCORE=$(echo "$RSK_RESULT" | jq -r '.data.riskScore')
RSK_LEVEL=$(echo "$RSK_RESULT" | jq -r '.data.riskLevel')
assert "POST /risk-assessments - success" "true" "$(echo "$RSK_RESULT" | jq -r '.success')"
assert_contains "POST /risk-assessments - reference starts with AB-RSK" "AB-RSK" "$RSK_REF"
assert "POST /risk-assessments - riskScore 20 (4x5)" "20" "$RSK_SCORE"
assert "POST /risk-assessments - riskLevel CRITICAL" "CRITICAL" "$RSK_LEVEL"
assert "POST /risk-assessments - default status IDENTIFIED" "IDENTIFIED" "$(echo "$RSK_RESULT" | jq -r '.data.status')"

echo "  Creating low risk assessment..."
RSK2_RESULT=$(curl -s -X POST "$API/api/risk-assessments" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "title": "Minor gifts risk in domestic sales team",
  "category": "GIFTS_HOSPITALITY",
  "businessFunction": "Domestic Sales",
  "likelihood": 2,
  "impact": 2
}')
RSK2_ID=$(echo "$RSK2_RESULT" | jq -r '.data.id')
assert "POST /risk-assessments LOW - success" "true" "$(echo "$RSK2_RESULT" | jq -r '.success')"
assert "POST /risk-assessments LOW - riskScore 4 (2x2)" "4" "$(echo "$RSK2_RESULT" | jq -r '.data.riskScore')"
assert "POST /risk-assessments LOW - riskLevel LOW" "LOW" "$(echo "$RSK2_RESULT" | jq -r '.data.riskLevel')"

echo "  Listing risk assessments..."
LIST_RSK=$(curl -s "$API/api/risk-assessments" -H "$AUTH")
assert "GET /risk-assessments - success" "true" "$(echo "$LIST_RSK" | jq -r '.success')"
assert "GET /risk-assessments - has records" "true" "$(echo "$LIST_RSK" | jq -r '(.data | length) > 0')"

CAT_RSK=$(curl -s "$API/api/risk-assessments?category=FACILITATION_PAYMENTS" -H "$AUTH")
assert "GET /risk-assessments?category filter - success" "true" "$(echo "$CAT_RSK" | jq -r '.success')"

LVL_RSK=$(curl -s "$API/api/risk-assessments?riskLevel=CRITICAL" -H "$AUTH")
assert "GET /risk-assessments?riskLevel filter - success" "true" "$(echo "$LVL_RSK" | jq -r '.success')"

GET_RSK=$(curl -s "$API/api/risk-assessments/$RSK_ID" -H "$AUTH")
assert "GET /risk-assessments/:id - success" "true" "$(echo "$GET_RSK" | jq -r '.success')"
assert "GET /risk-assessments/:id - correct title" "Bribery risk in West Africa customs clearance operations" "$(echo "$GET_RSK" | jq -r '.data.title')"

echo "  Updating risk assessment..."
UPD_RSK=$(curl -s -X PUT "$API/api/risk-assessments/$RSK_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{"likelihood":3,"impact":4}')
assert "PUT /risk-assessments/:id - success" "true" "$(echo "$UPD_RSK" | jq -r '.success')"
assert "PUT /risk-assessments/:id - recalculated score 12 (3x4)" "12" "$(echo "$UPD_RSK" | jq -r '.data.riskScore')"
assert "PUT /risk-assessments/:id - recalculated level HIGH" "HIGH" "$(echo "$UPD_RSK" | jq -r '.data.riskLevel')"

echo "  Adding mitigation plan..."
MITIGATE_RSK=$(curl -s -X PUT "$API/api/risk-assessments/$RSK_ID/mitigate" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "mitigationPlan": "Deploy dedicated compliance monitor in West Africa. Implement pre-approval process for all agent payments above $10k. Quarterly audit of agent expense claims.",
  "residualLikelihood": 2,
  "residualImpact": 3,
  "controlsAdded": "Real-time payment monitoring system, compliance monitor role created",
  "mitigationOwner": "West Africa Compliance Manager"
}')
assert "PUT /risk-assessments/:id/mitigate - success" "true" "$(echo "$MITIGATE_RSK" | jq -r '.success')"
assert "PUT /risk-assessments/:id/mitigate - status MITIGATED" "MITIGATED" "$(echo "$MITIGATE_RSK" | jq -r '.data.status')"
assert "PUT /risk-assessments/:id/mitigate - residualRiskScore 6 (2x3)" "6" "$(echo "$MITIGATE_RSK" | jq -r '.data.residualRiskScore')"
assert "PUT /risk-assessments/:id/mitigate - residualRiskLevel MEDIUM" "MEDIUM" "$(echo "$MITIGATE_RSK" | jq -r '.data.residualRiskLevel')"

echo ""
echo "4. POLICIES MODULE"
echo "─────────────────────────────────────────"

echo "  Creating anti-bribery policy..."
POL_RESULT=$(curl -s -X POST "$API/api/policies" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "title": "Anti-Bribery and Corruption Policy",
  "content": "This policy sets out our zero-tolerance approach to bribery and corruption. No employee or associated person may offer, give, request or accept any bribe or corrupt payment. This includes facilitation payments to government officials. All gifts and hospitality must be recorded and approved. Third parties must sign our anti-bribery addendum before engagement.",
  "policyType": "ANTI_BRIBERY_POLICY",
  "version": "3.1",
  "effectiveDate": "2026-01-01",
  "reviewDate": "2027-01-01",
  "scope": "All employees, contractors, agents and associated persons worldwide",
  "owner": "Chief Compliance Officer"
}')
POL_ID=$(echo "$POL_RESULT" | jq -r '.data.id')
assert "POST /policies - success" "true" "$(echo "$POL_RESULT" | jq -r '.success')"
assert_contains "POST /policies - reference contains AB" "AB" "$(echo "$POL_RESULT" | jq -r '.data.reference')"

LIST_POL=$(curl -s "$API/api/policies" -H "$AUTH")
assert "GET /policies - success" "true" "$(echo "$LIST_POL" | jq -r '.success')"
assert "GET /policies - has records" "true" "$(echo "$LIST_POL" | jq -r '(.data | length) > 0')"

GET_POL=$(curl -s "$API/api/policies/$POL_ID" -H "$AUTH")
assert "GET /policies/:id - success" "true" "$(echo "$GET_POL" | jq -r '.success')"
assert "GET /policies/:id - correct title" "Anti-Bribery and Corruption Policy" "$(echo "$GET_POL" | jq -r '.data.title')"
assert "GET /policies/:id - correct policyType" "ANTI_BRIBERY_POLICY" "$(echo "$GET_POL" | jq -r '.data.policyType')"

echo ""
echo "5. GATEWAY PROXY"
echo "─────────────────────────────────────────"

echo "  Testing all routes through gateway..."
for ROUTE in gifts due-diligence risk-assessments policies; do
  RESULT=$(curl -s "$GW/api/iso37001/$ROUTE" -H "$AUTH")
  assert "Gateway /api/iso37001/$ROUTE - success" "true" "$(echo "$RESULT" | jq -r '.success')"
done

echo ""
echo "6. DELETE OPERATIONS (cleanup)"
echo "─────────────────────────────────────────"

DEL_GFT=$(curl -s -X DELETE "$API/api/gifts/$GFT_ID" -H "$AUTH")
assert "DELETE /gifts/:id - success" "true" "$(echo "$DEL_GFT" | jq -r '.success')"

DEL_GFT2=$(curl -s -X DELETE "$API/api/gifts/$GFT2_ID" -H "$AUTH")
assert "DELETE /gifts second - success" "true" "$(echo "$DEL_GFT2" | jq -r '.success')"

VERIFY_GFT=$(curl -s "$API/api/gifts/$GFT_ID" -H "$AUTH")
assert "Deleted gift returns 404" "NOT_FOUND" "$(echo "$VERIFY_GFT" | jq -r '.error.code')"

DEL_DD=$(curl -s -X DELETE "$API/api/due-diligence/$DD_ID" -H "$AUTH")
assert "DELETE /due-diligence/:id - success" "true" "$(echo "$DEL_DD" | jq -r '.success')"

DEL_DD2=$(curl -s -X DELETE "$API/api/due-diligence/$DD2_ID" -H "$AUTH")
assert "DELETE /due-diligence second - success" "true" "$(echo "$DEL_DD2" | jq -r '.success')"

VERIFY_DD=$(curl -s "$API/api/due-diligence/$DD_ID" -H "$AUTH")
assert "Deleted due diligence returns 404" "NOT_FOUND" "$(echo "$VERIFY_DD" | jq -r '.error.code')"

DEL_RSK=$(curl -s -X DELETE "$API/api/risk-assessments/$RSK_ID" -H "$AUTH")
assert "DELETE /risk-assessments/:id - success" "true" "$(echo "$DEL_RSK" | jq -r '.success')"

DEL_RSK2=$(curl -s -X DELETE "$API/api/risk-assessments/$RSK2_ID" -H "$AUTH")
assert "DELETE /risk-assessments second - success" "true" "$(echo "$DEL_RSK2" | jq -r '.success')"

VERIFY_RSK=$(curl -s "$API/api/risk-assessments/$RSK_ID" -H "$AUTH")
assert "Deleted risk assessment returns 404" "NOT_FOUND" "$(echo "$VERIFY_RSK" | jq -r '.error.code')"

echo ""
echo "============================================"
echo "  RESULTS: $PASS passed, $FAIL failed (out of $TOTAL)"
echo "============================================"

if [ $FAIL -gt 0 ]; then
  exit 1
fi
