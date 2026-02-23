#!/bin/bash
# Comprehensive test script for Chemicals modules
# Tests: Chemicals register, COSHH assessments, SDS — CRUD + Gateway

set -e

API="http://localhost:4040"
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
echo "  Chemicals Modules - Comprehensive Test Suite"
echo "============================================"
echo ""

# ─────────────────────────────────────────────
echo "1. CHEMICALS REGISTER MODULE"
echo "─────────────────────────────────────────"

# 1a. POST - Create a non-CMR chemical
echo "  Creating chemical (non-CMR)..."
CHEM_RESULT=$(curl -s -X POST "$API/api/chemicals" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "productName": "Industrial Degreaser Plus",
  "chemicalName": "2-Butoxyethanol solution 20%",
  "casNumber": "111-76-2",
  "ecNumber": "203-905-0",
  "signalWord": "WARNING",
  "pictograms": ["GHS07_IRRITANT_HARMFUL", "GHS09_ENVIRONMENTAL"],
  "hazardStatements": ["H302 Harmful if swallowed", "H312 Harmful in contact with skin", "H332 Harmful if inhaled"],
  "precautionaryStmts": ["P260 Do not breathe vapours", "P270 Do not eat, drink or smoke when using", "P273 Avoid release to the environment"],
  "physicalState": "LIQUID",
  "colour": "Clear yellow",
  "odour": "Ether-like",
  "flashPoint": 61.0,
  "storageClass": "CLASS_3_FLAMMABLE_LIQUID",
  "requiresVentilation": true,
  "requiresFireproof": true,
  "maxQuantityOnsite": 200.0,
  "maxQuantityUnit": "litres",
  "wasteClassification": "HAZARDOUS",
  "disposalRoute": "Licensed hazardous waste contractor collection",
  "supplier": "ChemSupply UK Ltd",
  "isCarcinogen": false,
  "isMutagen": false,
  "isReprotoxic": false
}')
CHEM_SUCCESS=$(echo "$CHEM_RESULT" | jq -r '.success')
CHEM_ID=$(echo "$CHEM_RESULT" | jq -r '.data.id')
assert "POST /chemicals - success" "true" "$CHEM_SUCCESS"
assert "POST /chemicals - productName stored" "Industrial Degreaser Plus" "$(echo "$CHEM_RESULT" | jq -r '.data.productName')"
assert "POST /chemicals - isCmr false for non-CMR" "false" "$(echo "$CHEM_RESULT" | jq -r '.data.isCmr')"
assert "POST /chemicals - signalWord WARNING" "WARNING" "$(echo "$CHEM_RESULT" | jq -r '.data.signalWord')"

# 1b. POST - Create a CMR chemical (carcinogen)
echo "  Creating CMR chemical (carcinogen)..."
CHEM2_RESULT=$(curl -s -X POST "$API/api/chemicals" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "productName": "Primer Coat Red Oxide",
  "chemicalName": "Iron(III) oxide with chromate pigments",
  "casNumber": "1333-86-4",
  "signalWord": "DANGER",
  "pictograms": ["GHS06_TOXIC", "GHS08_HEALTH_HAZARD"],
  "physicalState": "SOLID_FINE_POWDER",
  "storageClass": "CLASS_9_OTHER_HAZARDOUS",
  "isCarcinogen": true,
  "isMutagen": false,
  "isReprotoxic": false,
  "isSvhc": true,
  "requiresVentilation": true,
  "wasteClassification": "HAZARDOUS"
}')
CHEM2_ID=$(echo "$CHEM2_RESULT" | jq -r '.data.id')
assert "POST /chemicals CMR - success" "true" "$(echo "$CHEM2_RESULT" | jq -r '.success')"
assert "POST /chemicals CMR - isCmr auto-set true" "true" "$(echo "$CHEM2_RESULT" | jq -r '.data.isCmr')"
assert "POST /chemicals CMR - healthSurveillanceReq auto-set" "true" "$(echo "$CHEM2_RESULT" | jq -r '.data.healthSurveillanceReq')"

# 1c. POST - Non-hazardous chemical
echo "  Creating non-hazardous chemical..."
CHEM3_RESULT=$(curl -s -X POST "$API/api/chemicals" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "productName": "Distilled Water",
  "chemicalName": "Water H2O",
  "casNumber": "7732-18-5",
  "signalWord": "NONE",
  "physicalState": "LIQUID",
  "storageClass": "NON_HAZARDOUS",
  "isCarcinogen": false,
  "isMutagen": false,
  "isReprotoxic": false,
  "wasteClassification": "NON_HAZARDOUS"
}')
CHEM3_ID=$(echo "$CHEM3_RESULT" | jq -r '.data.id')
assert "POST /chemicals non-hazardous - success" "true" "$(echo "$CHEM3_RESULT" | jq -r '.success')"

# 1d. GET - List chemicals
echo "  Listing chemicals..."
LIST_RESULT=$(curl -s "$API/api/chemicals" -H "$AUTH")
assert "GET /chemicals - success" "true" "$(echo "$LIST_RESULT" | jq -r '.success')"
CHEM_COUNT=$(echo "$LIST_RESULT" | jq -r '.data | length')
assert "GET /chemicals - has records" "true" "$([ "$CHEM_COUNT" -gt 0 ] && echo true || echo false)"
assert_contains "GET /chemicals - pagination present" "total" "$(echo "$LIST_RESULT")"

# 1e. GET - Single chemical
echo "  Getting single chemical..."
GET_RESULT=$(curl -s "$API/api/chemicals/$CHEM_ID" -H "$AUTH")
assert "GET /chemicals/:id - success" "true" "$(echo "$GET_RESULT" | jq -r '.success')"
assert "GET /chemicals/:id - correct CAS number" "111-76-2" "$(echo "$GET_RESULT" | jq -r '.data.casNumber')"

# 1f. PUT - Update chemical
echo "  Updating chemical..."
PUT_RESULT=$(curl -s -X PUT "$API/api/chemicals/$CHEM_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "maxQuantityOnsite": 100.0,
  "requiresSecondaryContainment": true,
  "notes": "Reduced maximum onsite quantity following risk review"
}')
assert "PUT /chemicals/:id - success" "true" "$(echo "$PUT_RESULT" | jq -r '.success')"
assert "PUT /chemicals/:id - quantity updated" "100" "$(echo "$PUT_RESULT" | jq -r '.data.maxQuantityOnsite')"

# 1g. GET - Search chemicals
SEARCH_RESULT=$(curl -s "$API/api/chemicals?search=Degreaser" -H "$AUTH")
assert "GET /chemicals?search=Degreaser - success" "true" "$(echo "$SEARCH_RESULT" | jq -r '.success')"

# 1h. GET - Filter by CMR
CMR_RESULT=$(curl -s "$API/api/chemicals?cmr=true" -H "$AUTH")
assert "GET /chemicals?cmr=true - success" "true" "$(echo "$CMR_RESULT" | jq -r '.success')"
assert "GET /chemicals?cmr=true - returns CMR chemicals" "true" "$(echo "$CMR_RESULT" | jq -r '(.data | length) > 0')"

# 1i. GET - Expiry alerts
ALERTS_RESULT=$(curl -s "$API/api/chemicals/alerts/expiry" -H "$AUTH")
assert "GET /chemicals/alerts/expiry - success" "true" "$(echo "$ALERTS_RESULT" | jq -r '.success')"

# 1j. GET - Incompatibility alerts
INCOMPAT_RESULT=$(curl -s "$API/api/chemicals/alerts/incompatible" -H "$AUTH")
assert "GET /chemicals/alerts/incompatible - success" "true" "$(echo "$INCOMPAT_RESULT" | jq -r '.success')"

# 1k. 404 for unknown ID
NOT_FOUND=$(curl -s "$API/api/chemicals/nonexistent-id-xyz" -H "$AUTH")
assert "GET /chemicals/:id - 404 for unknown" "NOT_FOUND" "$(echo "$NOT_FOUND" | jq -r '.error.code')"

# 1l. Validation error (missing required fields)
VAL_RESULT=$(curl -s -X POST "$API/api/chemicals" -H "$AUTH" -H "Content-Type: application/json" -d '{"productName":"Test"}')
assert "POST /chemicals - validation error missing chemicalName" "VALIDATION_ERROR" "$(echo "$VAL_RESULT" | jq -r '.error.code')"

echo ""

# ─────────────────────────────────────────────
echo "2. COSHH ASSESSMENTS MODULE"
echo "─────────────────────────────────────────"

# 2a. POST - Create COSHH assessment for the degreaser
echo "  Creating COSHH assessment..."
COSHH_RESULT=$(curl -s -X POST "$API/api/coshh" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "chemicalId": "'"$CHEM_ID"'",
  "activityDescription": "Degreasing of metal components before painting in spray booth area",
  "locationBuilding": "Production Building A",
  "locationRoom": "Spray Booth 1",
  "locationSite": "Main Site",
  "personsExposed": ["Spray Painter", "Production Supervisor"],
  "estimatedPersonsNum": 4,
  "includesContractors": false,
  "includesVulnerable": false,
  "exposureRoutes": ["INHALATION", "SKIN_ABSORPTION"],
  "quantityUsed": 5.0,
  "quantityUnit": "litres per shift",
  "frequencyOfUse": "Daily",
  "durationPerUseMinutes": 30,
  "exposureDurationHrDay": 2.0,
  "inherentLikelihood": 3,
  "inherentSeverity": 3,
  "controlMeasures": {
    "elimination": "Cannot substitute — essential process requirement",
    "engineering": "LEV extraction system in spray booth, closed spray system",
    "administrative": "Restricted access to spray booth during operation, SOP in place",
    "ppe": "Nitrile gloves, chemical splash goggles, half-face respirator with A2P3 filter"
  },
  "respiratoryProtection": "Half-face respirator with A2P3 filter cartridge",
  "rpeClass": "HALF_MASK",
  "handProtectionGlove": "Nitrile 0.4mm minimum thickness",
  "gloveBreakthroughTime": ">480 minutes",
  "eyeProtection": "Chemical splash goggles EN166",
  "residualLikelihood": 1,
  "residualSeverity": 2,
  "residualRiskAccepted": true,
  "healthSurveillanceReq": false,
  "wasteDisposalMethod": "Segregate contaminated rags in labelled hazardous waste containers",
  "substitutionConsidered": true,
  "substitutionOutcome": "Alternative water-based degreasers trialled but insufficient performance for aluminium substrates",
  "assessorName": "H&S Manager",
  "assessorJobTitle": "Health and Safety Manager",
  "assessmentDate": "2026-02-01T09:00:00+00:00",
  "reviewDate": "2027-02-01T09:00:00+00:00",
  "reviewTriggers": ["Annual review", "Change in process", "New chemical", "After any incident"]
}')
COSHH_SUCCESS=$(echo "$COSHH_RESULT" | jq -r '.success')
COSHH_ID=$(echo "$COSHH_RESULT" | jq -r '.data.id')
COSHH_REF=$(echo "$COSHH_RESULT" | jq -r '.data.referenceNumber')
assert "POST /coshh - success" "true" "$COSHH_SUCCESS"
assert_contains "POST /coshh - has ref COSHH-" "COSHH-" "$COSHH_REF"
assert "POST /coshh - residualRiskAccepted true" "true" "$(echo "$COSHH_RESULT" | jq -r '.data.residualRiskAccepted')"
assert "POST /coshh - rpeClass stored" "HALF_MASK" "$(echo "$COSHH_RESULT" | jq -r '.data.rpeClass')"

# 2b. GET - List COSHH assessments
echo "  Listing COSHH assessments..."
CL_RESULT=$(curl -s "$API/api/coshh" -H "$AUTH")
assert "GET /coshh - success" "true" "$(echo "$CL_RESULT" | jq -r '.success')"
assert "GET /coshh - has records" "true" "$(echo "$CL_RESULT" | jq -r '(.data | length) > 0')"

# 2c. GET - Single COSHH assessment
echo "  Getting single COSHH assessment..."
CG_RESULT=$(curl -s "$API/api/coshh/$COSHH_ID" -H "$AUTH")
assert "GET /coshh/:id - success" "true" "$(echo "$CG_RESULT" | jq -r '.success')"
assert "GET /coshh/:id - includes chemical" "true" "$(echo "$CG_RESULT" | jq -r '.data.chemical != null')"

# 2d. PUT - Update COSHH assessment
echo "  Updating COSHH assessment..."
CP_RESULT=$(curl -s -X PUT "$API/api/coshh/$COSHH_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "residualLikelihood": 1,
  "residualSeverity": 1,
  "notes": "Updated following installation of improved LEV system — risk further reduced"
}')
assert "PUT /coshh/:id - success" "true" "$(echo "$CP_RESULT" | jq -r '.success')"

# 2e. POST - Sign off COSHH assessment (assessor)
echo "  Signing off COSHH assessment..."
SIGN_RESULT=$(curl -s -X POST "$API/api/coshh/$COSHH_ID/sign-off" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "role": "assessor",
  "name": "Dr. Robert Chen"
}')
assert "POST /coshh/:id/sign-off assessor - success" "true" "$(echo "$SIGN_RESULT" | jq -r '.success')"
assert "POST /coshh/:id/sign-off - assessorName stored" "Dr. Robert Chen" "$(echo "$SIGN_RESULT" | jq -r '.data.assessorName')"
assert "POST /coshh/:id/sign-off - assessorSignedAt set" "true" "$(echo "$SIGN_RESULT" | jq -r '.data.assessorSignedAt != null')"

# 2f. POST - Sign off supervisor
SIGN2_RESULT=$(curl -s -X POST "$API/api/coshh/$COSHH_ID/sign-off" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "role": "supervisor",
  "name": "Sarah Williams"
}')
assert "POST /coshh/:id/sign-off supervisor - success" "true" "$(echo "$SIGN2_RESULT" | jq -r '.success')"

# 2g. GET - Due for review
DUE_RESULT=$(curl -s "$API/api/coshh/due-review?days=400" -H "$AUTH")
assert "GET /coshh/due-review - success" "true" "$(echo "$DUE_RESULT" | jq -r '.success')"

# 2h. 404 for unknown COSHH
CNF_RESULT=$(curl -s "$API/api/coshh/nonexistent-id-xyz" -H "$AUTH")
assert "GET /coshh/:id - 404 for unknown" "NOT_FOUND" "$(echo "$CNF_RESULT" | jq -r '.error.code')"

# 2i. Validation error missing activityDescription
CV_RESULT=$(curl -s -X POST "$API/api/coshh" -H "$AUTH" -H "Content-Type: application/json" -d '{"chemicalId":"some-id","inherentLikelihood":1,"inherentSeverity":1,"residualLikelihood":1,"residualSeverity":1}')
assert "POST /coshh - validation error missing activityDescription" "VALIDATION_ERROR" "$(echo "$CV_RESULT" | jq -r '.error.code')"

echo ""

# ─────────────────────────────────────────────
echo "3. SDS MODULE"
echo "─────────────────────────────────────────"

# 3a. GET - List SDS records
echo "  Listing SDS records..."
SDS_LIST=$(curl -s "$API/api/sds" -H "$AUTH")
assert "GET /sds - success" "true" "$(echo "$SDS_LIST" | jq -r '.success')"

# 3b. GET - SDS overdue
echo "  Getting overdue SDS..."
SDS_OVR=$(curl -s "$API/api/sds/overdue" -H "$AUTH")
assert "GET /sds/overdue - success" "true" "$(echo "$SDS_OVR" | jq -r '.success')"

echo ""

# ─────────────────────────────────────────────
echo "4. GATEWAY PROXY"
echo "─────────────────────────────────────────"

echo "  Testing all routes through gateway..."
for ROUTE in chemicals coshh sds inventory; do
  GW_RESULT=$(curl -s "$GW/api/chemicals/$ROUTE" -H "$AUTH")
  assert "Gateway /api/chemicals/$ROUTE" "true" "$(echo "$GW_RESULT" | jq -r '.success')"
done

echo ""

# ─────────────────────────────────────────────
echo "5. DELETE CLEANUP"
echo "─────────────────────────────────────────"

DEL_CHEM=$(curl -s -X DELETE "$API/api/chemicals/$CHEM_ID" -H "$AUTH")
assert "DELETE /chemicals/:id - success" "true" "$(echo "$DEL_CHEM" | jq -r '.success')"

DEL_CHEM2=$(curl -s -X DELETE "$API/api/chemicals/$CHEM2_ID" -H "$AUTH")
assert "DELETE /chemicals/:id CMR - success" "true" "$(echo "$DEL_CHEM2" | jq -r '.success')"

DEL_CHEM3=$(curl -s -X DELETE "$API/api/chemicals/$CHEM3_ID" -H "$AUTH")
assert "DELETE /chemicals/:id non-hazardous - success" "true" "$(echo "$DEL_CHEM3" | jq -r '.success')"

VERIFY=$(curl -s "$API/api/chemicals/$CHEM_ID" -H "$AUTH")
assert "Deleted chemical returns NOT_FOUND" "NOT_FOUND" "$(echo "$VERIFY" | jq -r '.error.code')"

echo ""
echo "============================================"
echo "  RESULTS: $PASS passed, $FAIL failed (out of $TOTAL)"
echo "============================================"

if [ $FAIL -gt 0 ]; then
  exit 1
fi
