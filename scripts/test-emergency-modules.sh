#!/bin/bash
# Comprehensive test script for Emergency modules
# Tests: BCP, Drills, Incidents, Premises — CRUD + Gateway

set -e

API="http://localhost:4041"
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
echo "  Emergency Modules - Comprehensive Test Suite"
echo "============================================"
echo ""

# ─────────────────────────────────────────────
echo "1. PREMISES MODULE (prerequisite)"
echo "─────────────────────────────────────────"

# 1a. POST - Create premises first (needed for drills and BCP)
echo "  Creating premises..."
PREM_RESULT=$(curl -s -X POST "$API/api/premises" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "name": "Main Production Facility",
  "address": "123 Industrial Estate, Birmingham, B1 1AA",
  "type": "MANUFACTURING",
  "maxOccupancy": 350,
  "normalOccupancy": 220,
  "emergencyContactName": "Site Security",
  "emergencyContactPhone": "0800 123 4567",
  "assemblyPoints": ["Car Park A — North End", "Car Park B — East Side"],
  "fireWarden": "John Smith",
  "firstAidOfficer": "Mary Jones",
  "notes": "3-storey production facility with attached warehousing"
}')
PREM_SUCCESS=$(echo "$PREM_RESULT" | jq -r '.success')
PREM_ID=$(echo "$PREM_RESULT" | jq -r '.data.id')
assert "POST /premises - success" "true" "$PREM_SUCCESS"
assert "POST /premises - name stored" "Main Production Facility" "$(echo "$PREM_RESULT" | jq -r '.data.name')"

# 1b. GET - List premises
PREM_LIST=$(curl -s "$API/api/premises" -H "$AUTH")
assert "GET /premises - success" "true" "$(echo "$PREM_LIST" | jq -r '.success')"
assert "GET /premises - has records" "true" "$(echo "$PREM_LIST" | jq -r '(.data | length) > 0')"

# 1c. GET - Single premises
PREM_GET=$(curl -s "$API/api/premises/$PREM_ID" -H "$AUTH")
assert "GET /premises/:id - success" "true" "$(echo "$PREM_GET" | jq -r '.success')"

echo ""

# ─────────────────────────────────────────────
echo "2. BCP MODULE"
echo "─────────────────────────────────────────"

# 2a. POST - Create BCP
echo "  Creating business continuity plan..."
BCP_RESULT=$(curl -s -X POST "$API/api/bcp" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "title": "Fire and Explosion Emergency Business Continuity Plan",
  "version": "3.2",
  "emergencyTypes": ["FIRE", "EXPLOSION"],
  "scopeDescription": "Covers all production and warehousing operations at the main site in the event of fire or explosion",
  "businessFunctions": ["Production", "Dispatch", "Quality Control", "Customer Services"],
  "crisisTeamLead": "Operations Director",
  "crisisTeamLeadPhone": "+44 7700 900123",
  "crisisTeamMeetingPoint": "Car Park A — Emergency Command Post",
  "activationCriteria": "Activate when fire alarm sounds and evacuation is confirmed, or when explosion is reported affecting any building",
  "activationProcess": "1. Evacuate all personnel\n2. Account for all staff at assembly point\n3. Notify emergency services\n4. Convene crisis team at command post\n5. Assess damage and activate relevant recovery streams",
  "deactivationProcess": "Deactivate only when emergency services confirm site is safe and crisis team approves return",
  "staffCommunicationPlan": "Group SMS via emergency notification system, cascade through line managers",
  "customerCommPlan": "Customer services to notify key accounts within 2 hours of activation",
  "supplierCommPlan": "Procurement to notify critical suppliers of potential disruption within 4 hours",
  "itRecoveryApproach": "Failover to cloud backup within 4 hours, secondary site operational within 24 hours",
  "reviewDate": "2027-01-15"
}')
BCP_SUCCESS=$(echo "$BCP_RESULT" | jq -r '.success')
BCP_ID=$(echo "$BCP_RESULT" | jq -r '.data.id')
BCP_REF=$(echo "$BCP_RESULT" | jq -r '.data.planReference')
assert "POST /bcp - success" "true" "$BCP_SUCCESS"
assert_contains "POST /bcp - has plan reference BCP-" "BCP-" "$BCP_REF"
assert "POST /bcp - title stored" "Fire and Explosion Emergency Business Continuity Plan" "$(echo "$BCP_RESULT" | jq -r '.data.title')"
assert "POST /bcp - version stored" "3.2" "$(echo "$BCP_RESULT" | jq -r '.data.version')"

# 2b. POST - Second BCP (pandemic)
echo "  Creating pandemic BCP..."
BCP2_RESULT=$(curl -s -X POST "$API/api/bcp" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "title": "Pandemic Response Business Continuity Plan",
  "version": "2.0",
  "emergencyTypes": ["PANDEMIC"],
  "scopeDescription": "Organisation-wide pandemic response covering all operations and remote working protocols",
  "businessFunctions": ["All departments"],
  "crisisTeamLead": "Chief Executive Officer",
  "activationCriteria": "WHO pandemic declaration or UK Government Level 4 or 5 response activation",
  "reviewDate": "2027-03-01"
}')
BCP2_ID=$(echo "$BCP2_RESULT" | jq -r '.data.id')
assert "POST /bcp pandemic - success" "true" "$(echo "$BCP2_RESULT" | jq -r '.success')"

# 2c. GET - List BCPs
echo "  Listing BCPs..."
BCP_LIST=$(curl -s "$API/api/bcp" -H "$AUTH")
assert "GET /bcp - success" "true" "$(echo "$BCP_LIST" | jq -r '.success')"
BCP_COUNT=$(echo "$BCP_LIST" | jq -r '.data | length')
assert "GET /bcp - has records" "true" "$([ "$BCP_COUNT" -gt 0 ] && echo true || echo false)"

# 2d. GET - Single BCP
echo "  Getting single BCP..."
BCP_GET=$(curl -s "$API/api/bcp/$BCP_ID" -H "$AUTH")
assert "GET /bcp/:id - success" "true" "$(echo "$BCP_GET" | jq -r '.success')"
assert "GET /bcp/:id - correct version" "3.2" "$(echo "$BCP_GET" | jq -r '.data.version')"

# 2e. PUT - Update BCP
echo "  Updating BCP..."
BCP_PUT=$(curl -s -X PUT "$API/api/bcp/$BCP_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "version": "3.3",
  "itRecoveryApproach": "Failover to cloud backup within 2 hours (improved SLA), secondary site operational within 12 hours"
}')
assert "PUT /bcp/:id - success" "true" "$(echo "$BCP_PUT" | jq -r '.success')"
assert "PUT /bcp/:id - version updated" "3.3" "$(echo "$BCP_PUT" | jq -r '.data.version')"

# 2f. POST - Activate BCP
echo "  Activating BCP..."
BCP_ACT=$(curl -s -X POST "$API/api/bcp/$BCP_ID/activate" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "activationReason": "Major fire confirmed in Warehouse Zone B — full evacuation in progress"
}')
assert "POST /bcp/:id/activate - success" "true" "$(echo "$BCP_ACT" | jq -r '.success')"

# 2g. GET - Due for review
DUE_RESULT=$(curl -s "$API/api/bcp/due-review?days=500" -H "$AUTH")
assert "GET /bcp/due-review - success" "true" "$(echo "$DUE_RESULT" | jq -r '.success')"

# 2h. Validation error (missing title)
BCP_VAL=$(curl -s -X POST "$API/api/bcp" -H "$AUTH" -H "Content-Type: application/json" -d '{"version":"1.0","reviewDate":"2027-01-01"}')
assert "POST /bcp - validation error missing title" "VALIDATION_ERROR" "$(echo "$BCP_VAL" | jq -r '.error.code')"

# 2i. 404 for unknown BCP
BCP_NF=$(curl -s "$API/api/bcp/nonexistent-id-xyz" -H "$AUTH")
assert "GET /bcp/:id - 404 for unknown" "NOT_FOUND" "$(echo "$BCP_NF" | jq -r '.error.code')"

echo ""

# ─────────────────────────────────────────────
echo "3. DRILLS MODULE"
echo "─────────────────────────────────────────"

# 3a. POST - Create evacuation drill record for premises
echo "  Creating evacuation drill..."
DRILL_RESULT=$(curl -s -X POST "$API/api/drills/premises/$PREM_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "drillDate": "2026-02-18",
  "drillType": "Full Fire Evacuation Drill",
  "evacuationType": "FULL_EVACUATION",
  "alarmedOrSilent": "Alarmed",
  "totalPersonsEvacuated": 218,
  "evacuationTimeMinutes": 4.5,
  "targetTimeMinutes": 4.0,
  "targetAchieved": false,
  "issuesIdentified": [
    "Stairwell B blocked by delivery pallet — took 90 seconds to clear",
    "3 persons not at assembly point after 4 minutes — located in toilet block"
  ],
  "assemblyPointReached": true,
  "rollCallCompleted": true,
  "rollCallTimeMinutes": 6.5,
  "peepEvacuationTested": true,
  "peepIssues": "PEEP for user in office 2.14 not tested — evacuee was absent on day",
  "correctiveActions": "1. Remove stairwell B pallet storage immediately\n2. Add toilet blocks to warden sweep list\n3. Re-run PEEP for office 2.14 user within 14 days",
  "completedBy": "Fire Safety Manager",
  "witnesses": ["H&S Manager", "Operations Director"]
}')
DRILL_SUCCESS=$(echo "$DRILL_RESULT" | jq -r '.success')
DRILL_ID=$(echo "$DRILL_RESULT" | jq -r '.data.id')
assert "POST /drills/premises/:id - success" "true" "$DRILL_SUCCESS"
assert "POST /drills/premises/:id - evacuationType stored" "FULL_EVACUATION" "$(echo "$DRILL_RESULT" | jq -r '.data.evacuationType')"
assert "POST /drills/premises/:id - targetAchieved false" "false" "$(echo "$DRILL_RESULT" | jq -r '.data.targetAchieved')"
assert "POST /drills/premises/:id - persons evacuated stored" "218" "$(echo "$DRILL_RESULT" | jq -r '.data.totalPersonsEvacuated')"

# 3b. POST - Second drill (successful)
echo "  Creating second evacuation drill..."
DRILL2_RESULT=$(curl -s -X POST "$API/api/drills/premises/$PREM_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "drillDate": "2026-05-14",
  "drillType": "Partial Evacuation Drill — Ground Floor Only",
  "evacuationType": "PARTIAL_EVACUATION",
  "alarmedOrSilent": "Silent",
  "totalPersonsEvacuated": 85,
  "evacuationTimeMinutes": 2.8,
  "targetTimeMinutes": 3.0,
  "targetAchieved": true,
  "issuesIdentified": [],
  "assemblyPointReached": true,
  "rollCallCompleted": true,
  "rollCallTimeMinutes": 4.2,
  "peepEvacuationTested": false,
  "completedBy": "Fire Safety Manager"
}')
DRILL2_ID=$(echo "$DRILL2_RESULT" | jq -r '.data.id')
assert "POST /drills second - success" "true" "$(echo "$DRILL2_RESULT" | jq -r '.success')"
assert "POST /drills second - targetAchieved true" "true" "$(echo "$DRILL2_RESULT" | jq -r '.data.targetAchieved')"

# 3c. GET - List drills for premises
echo "  Listing drills for premises..."
DRILL_LIST=$(curl -s "$API/api/drills/premises/$PREM_ID" -H "$AUTH")
assert "GET /drills/premises/:id - success" "true" "$(echo "$DRILL_LIST" | jq -r '.success')"
DRILL_COUNT=$(echo "$DRILL_LIST" | jq -r '.data | length')
assert "GET /drills/premises/:id - has records" "true" "$([ "$DRILL_COUNT" -gt 0 ] && echo true || echo false)"

# 3d. PUT - Update drill record
echo "  Updating drill record..."
DRILL_PUT=$(curl -s -X PUT "$API/api/drills/$DRILL_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "correctiveActions": "1. Remove stairwell B pallet storage — COMPLETED\n2. Add toilet blocks to warden sweep list — COMPLETED\n3. Re-run PEEP for office 2.14 user — COMPLETED 2026-02-25",
  "peepIssues": "PEEP re-tested 2026-02-25 — successful evacuation in 3.5 minutes"
}')
assert "PUT /drills/:id - success" "true" "$(echo "$DRILL_PUT" | jq -r '.success')"

# 3e. GET - Drill analytics
echo "  Getting drill analytics..."
ANALYTICS_RESULT=$(curl -s "$API/api/drills/analytics" -H "$AUTH")
assert "GET /drills/analytics - success" "true" "$(echo "$ANALYTICS_RESULT" | jq -r '.success')"

# 3f. Validation error (missing drillDate)
DRILL_VAL=$(curl -s -X POST "$API/api/drills/premises/$PREM_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{"drillType":"Test"}')
assert "POST /drills - validation error missing drillDate" "VALIDATION_ERROR" "$(echo "$DRILL_VAL" | jq -r '.error.code')"

echo ""

# ─────────────────────────────────────────────
echo "4. EMERGENCY INCIDENTS MODULE"
echo "─────────────────────────────────────────"

# 4a. POST - Declare emergency incident
echo "  Declaring emergency incident..."
EI_RESULT=$(curl -s -X POST "$API/api/incidents" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "emergencyType": "FIRE",
  "severity": "MAJOR",
  "premisesId": "'"$PREM_ID"'",
  "title": "Fire in Warehouse Zone B — Pallet Stack Ignition",
  "description": "Electrical fault in forklift charging station caused fire to spread to adjacent pallet stack. Fire alarm activated, evacuation underway.",
  "evacuationOrdered": true,
  "evacuationType": "FULL_EVACUATION"
}')
EI_SUCCESS=$(echo "$EI_RESULT" | jq -r '.success')
EI_ID=$(echo "$EI_RESULT" | jq -r '.data.id')
assert "POST /incidents declare - success" "true" "$EI_SUCCESS"
assert "POST /incidents declare - emergencyType FIRE" "FIRE" "$(echo "$EI_RESULT" | jq -r '.data.emergencyType')"
assert "POST /incidents declare - severity MAJOR" "MAJOR" "$(echo "$EI_RESULT" | jq -r '.data.severity')"
assert "POST /incidents declare - evacuationOrdered true" "true" "$(echo "$EI_RESULT" | jq -r '.data.evacuationOrdered')"

# 4b. GET - List emergency incidents
echo "  Listing emergency incidents..."
EI_LIST=$(curl -s "$API/api/incidents" -H "$AUTH")
assert "GET /incidents (emergency) - success" "true" "$(echo "$EI_LIST" | jq -r '.success')"
assert "GET /incidents (emergency) - has records" "true" "$(echo "$EI_LIST" | jq -r '(.data | length) > 0')"

# 4c. GET - Single emergency incident
echo "  Getting single emergency incident..."
EI_GET=$(curl -s "$API/api/incidents/$EI_ID" -H "$AUTH")
assert "GET /incidents/:id (emergency) - success" "true" "$(echo "$EI_GET" | jq -r '.success')"

# 4d. PUT - Update incident status
echo "  Updating emergency incident..."
EI_PUT=$(curl -s -X PUT "$API/api/incidents/$EI_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "status": "CONTAINED",
  "description": "Fire contained to Zone B by fire brigade. No casualties. Building structurally sound."
}')
assert "PUT /incidents/:id (emergency) - success" "true" "$(echo "$EI_PUT" | jq -r '.success')"
assert "PUT /incidents/:id (emergency) - status CONTAINED" "CONTAINED" "$(echo "$EI_PUT" | jq -r '.data.status')"

echo ""

# ─────────────────────────────────────────────
echo "5. GATEWAY PROXY"
echo "─────────────────────────────────────────"

echo "  Testing all routes through gateway..."
for ROUTE in premises incidents bcp; do
  GW_RESULT=$(curl -s "$GW/api/emergency/$ROUTE" -H "$AUTH")
  assert "Gateway /api/emergency/$ROUTE" "true" "$(echo "$GW_RESULT" | jq -r '.success')"
done

echo ""

# ─────────────────────────────────────────────
echo "6. DELETE CLEANUP"
echo "─────────────────────────────────────────"

DEL_BCP=$(curl -s -X DELETE "$API/api/bcp/$BCP2_ID" -H "$AUTH")
assert "DELETE /bcp/:id cleanup" "true" "$(echo "$DEL_BCP" | jq -r '.success')"

echo ""
echo "============================================"
echo "  RESULTS: $PASS passed, $FAIL failed (out of $TOTAL)"
echo "============================================"

if [ $FAIL -gt 0 ]; then
  exit 1
fi
