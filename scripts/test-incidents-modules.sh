#!/bin/bash
# Comprehensive test script for Incidents modules
# Tests: Incidents, Investigation, Actions, RIDDOR — CRUD + Gateway

set -e

API="http://localhost:4036"
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
echo "  Incidents Modules - Comprehensive Test Suite"
echo "============================================"
echo ""

# ─────────────────────────────────────────────
echo "1. INCIDENTS MODULE"
echo "─────────────────────────────────────────"

# 1a. POST - Create incident
echo "  Creating incident..."
INC_RESULT=$(curl -s -X POST "$API/api/incidents" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "title": "Slip on wet floor in canteen area",
  "description": "Employee slipped on recently mopped floor near serving area and fell hitting head on table edge",
  "type": "INJURY",
  "severity": "MODERATE",
  "status": "REPORTED",
  "dateOccurred": "2026-02-10",
  "timeOccurred": "12:35",
  "location": "Canteen Area B",
  "department": "Administration",
  "reportedByName": "Bob Jones",
  "injuredPerson": "Jane Doe",
  "injuredPersonRole": "Admin Assistant",
  "injuryType": "Concussion",
  "bodyPart": "Head",
  "hospitalized": false,
  "daysLost": 3,
  "witnesses": ["Bob Jones", "Sarah Lee"],
  "immediateActions": "First aid applied, area cordoned off, wet floor signs placed",
  "riddorReportable": "NO"
}')
INC_SUCCESS=$(echo "$INC_RESULT" | jq -r '.success')
INC_ID=$(echo "$INC_RESULT" | jq -r '.data.id')
INC_REF=$(echo "$INC_RESULT" | jq -r '.data.referenceNumber')
assert "POST /incidents - success" "true" "$INC_SUCCESS"
assert_contains "POST /incidents - has ref number INC-" "INC-" "$INC_REF"
assert "POST /incidents - severity MODERATE" "MODERATE" "$(echo "$INC_RESULT" | jq -r '.data.severity')"
assert "POST /incidents - status REPORTED" "REPORTED" "$(echo "$INC_RESULT" | jq -r '.data.status')"

# 1b. POST - Second incident (MAJOR)
echo "  Creating second incident..."
INC2_RESULT=$(curl -s -X POST "$API/api/incidents" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "title": "Forklift collision with pedestrian in warehouse",
  "description": "Forklift truck operator failed to check mirrors before reversing and struck a pedestrian",
  "type": "INJURY",
  "severity": "MAJOR",
  "status": "REPORTED",
  "dateOccurred": "2026-02-12",
  "location": "Warehouse Zone C",
  "department": "Logistics",
  "riddorReportable": "YES",
  "hospitalized": true,
  "daysLost": 14
}')
INC2_ID=$(echo "$INC2_RESULT" | jq -r '.data.id')
assert "POST /incidents second - success" "true" "$(echo "$INC2_RESULT" | jq -r '.success')"
assert "POST /incidents second - MAJOR severity" "MAJOR" "$(echo "$INC2_RESULT" | jq -r '.data.severity')"
assert "POST /incidents second - RIDDOR YES" "YES" "$(echo "$INC2_RESULT" | jq -r '.data.riddorReportable')"

# 1c. POST - Near miss incident
echo "  Creating near miss incident..."
INC3_RESULT=$(curl -s -X POST "$API/api/incidents" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "title": "Near miss falling object in storage room",
  "description": "Unsecured shelf bracket gave way, items fell narrowly missing a worker",
  "type": "NEAR_MISS",
  "severity": "MINOR",
  "status": "REPORTED",
  "dateOccurred": "2026-02-14",
  "location": "Storage Room 3",
  "riddorReportable": "NO"
}')
INC3_ID=$(echo "$INC3_RESULT" | jq -r '.data.id')
assert "POST /incidents near miss - success" "true" "$(echo "$INC3_RESULT" | jq -r '.success')"
assert "POST /incidents near miss - type NEAR_MISS" "NEAR_MISS" "$(echo "$INC3_RESULT" | jq -r '.data.type')"

# 1d. GET - List incidents
echo "  Listing incidents..."
LIST_RESULT=$(curl -s "$API/api/incidents" -H "$AUTH")
assert "GET /incidents - success" "true" "$(echo "$LIST_RESULT" | jq -r '.success')"
INC_COUNT=$(echo "$LIST_RESULT" | jq -r '.data | length')
assert "GET /incidents - has records" "true" "$([ "$INC_COUNT" -gt 0 ] && echo true || echo false)"
assert_contains "GET /incidents - pagination present" "total" "$(echo "$LIST_RESULT")"

# 1e. GET - Single incident
echo "  Getting single incident..."
GET_RESULT=$(curl -s "$API/api/incidents/$INC_ID" -H "$AUTH")
assert "GET /incidents/:id - success" "true" "$(echo "$GET_RESULT" | jq -r '.success')"
assert "GET /incidents/:id - correct title" "Slip on wet floor in canteen area" "$(echo "$GET_RESULT" | jq -r '.data.title')"
assert "GET /incidents/:id - correct location" "Canteen Area B" "$(echo "$GET_RESULT" | jq -r '.data.location')"

# 1f. PUT - Update incident status
echo "  Updating incident..."
PUT_RESULT=$(curl -s -X PUT "$API/api/incidents/$INC_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "status": "ACKNOWLEDGED",
  "correctiveActions": "Replace worn floor matting, implement mandatory wet floor signage protocol"
}')
assert "PUT /incidents/:id - success" "true" "$(echo "$PUT_RESULT" | jq -r '.success')"
assert "PUT /incidents/:id - status ACKNOWLEDGED" "ACKNOWLEDGED" "$(echo "$PUT_RESULT" | jq -r '.data.status')"

# 1g. GET - Filter by status
FILTER_RESULT=$(curl -s "$API/api/incidents?status=REPORTED" -H "$AUTH")
assert "GET /incidents?status=REPORTED - success" "true" "$(echo "$FILTER_RESULT" | jq -r '.success')"

# 1h. GET - Search incidents
SEARCH_RESULT=$(curl -s "$API/api/incidents?search=canteen" -H "$AUTH")
assert "GET /incidents?search=canteen - success" "true" "$(echo "$SEARCH_RESULT" | jq -r '.success')"

# 1i. 404 for unknown ID
NOT_FOUND=$(curl -s "$API/api/incidents/nonexistent-id-xyz" -H "$AUTH")
assert "GET /incidents/:id - 404 for unknown" "NOT_FOUND" "$(echo "$NOT_FOUND" | jq -r '.error.code')"

# 1j. Validation error (missing required fields)
VAL_RESULT=$(curl -s -X POST "$API/api/incidents" -H "$AUTH" -H "Content-Type: application/json" -d '{"title":"Test"}')
assert "POST /incidents - validation error missing dateOccurred" "VALIDATION_ERROR" "$(echo "$VAL_RESULT" | jq -r '.error.code')"

echo ""

# ─────────────────────────────────────────────
echo "2. INVESTIGATION MODULE"
echo "─────────────────────────────────────────"

# 2a. POST - Assign investigator
echo "  Assigning investigator to incident..."
ASSIGN_RESULT=$(curl -s -X POST "$API/api/investigation/$INC2_ID/assign" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "investigator": "health-safety-manager",
  "investigatorName": "Robert Chen"
}')
assert "POST /investigation/:id/assign - success" "true" "$(echo "$ASSIGN_RESULT" | jq -r '.success')"
assert "POST /investigation/:id/assign - status INVESTIGATING" "INVESTIGATING" "$(echo "$ASSIGN_RESULT" | jq -r '.data.status')"
assert "POST /investigation/:id/assign - investigator set" "Robert Chen" "$(echo "$ASSIGN_RESULT" | jq -r '.data.investigatorName')"

# 2b. PUT - Submit investigation report
echo "  Submitting investigation report..."
REPORT_RESULT=$(curl -s -X PUT "$API/api/investigation/$INC2_ID/report" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "rootCause": "Inadequate pedestrian segregation in warehouse — no physical barriers between forklift routes and pedestrian walkways",
  "contributingFactors": "Lack of mirror at blind corner, no spotter required for reversing operations, inadequate induction training for new operators",
  "correctiveActions": "Install physical barriers on all forklift routes, install convex mirrors at all blind corners, implement banksman requirement for all reversing manoeuvres",
  "preventiveActions": "Monthly forklift safety audits, annual refresher training for all operators, CCTV installation in warehouse zones",
  "report": "Investigation findings conclude that systemic failure in pedestrian segregation led to this incident. Immediate corrective actions implemented. Full review of warehouse traffic management plan required."
}')
assert "PUT /investigation/:id/report - success" "true" "$(echo "$REPORT_RESULT" | jq -r '.success')"
assert "PUT /investigation/:id/report - status ROOT_CAUSE_ANALYSIS" "ROOT_CAUSE_ANALYSIS" "$(echo "$REPORT_RESULT" | jq -r '.data.status')"
assert "PUT /investigation/:id/report - root cause stored" "true" "$(echo "$REPORT_RESULT" | jq -r '.data.rootCause != null')"

# 2c. Validation on assign (missing investigator)
ASSIGN_VAL=$(curl -s -X POST "$API/api/investigation/$INC_ID/assign" -H "$AUTH" -H "Content-Type: application/json" -d '{}')
assert "POST /investigation/:id/assign - validation error" "VALIDATION_ERROR" "$(echo "$ASSIGN_VAL" | jq -r '.error.code')"

echo ""

# ─────────────────────────────────────────────
echo "3. ACTIONS MODULE"
echo "─────────────────────────────────────────"

# 3a. GET - Get actions for incident
echo "  Getting actions for incident..."
ACTIONS_RESULT=$(curl -s "$API/api/actions/$INC_ID" -H "$AUTH")
assert "GET /actions/:incidentId - success" "true" "$(echo "$ACTIONS_RESULT" | jq -r '.success')"

# 3b. POST - Add corrective action
echo "  Adding corrective action..."
ADD_ACT=$(curl -s -X POST "$API/api/actions/$INC_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "description": "Replace all worn anti-slip matting in canteen within 7 days",
  "assignedTo": "facilities-manager",
  "dueDate": "2026-02-17",
  "actionType": "CORRECTIVE"
}')
assert "POST /actions/:incidentId - success" "true" "$(echo "$ADD_ACT" | jq -r '.success')"
assert "POST /actions/:incidentId - actionType CORRECTIVE" "CORRECTIVE" "$(echo "$ADD_ACT" | jq -r '.data.actionType')"

# 3c. POST - Add preventive action
echo "  Adding preventive action..."
ADD_PREV=$(curl -s -X POST "$API/api/actions/$INC_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "description": "Implement mandatory wet floor sign placement procedure for all cleaning operations",
  "assignedTo": "h-s-manager",
  "dueDate": "2026-02-20",
  "actionType": "PREVENTIVE"
}')
assert "POST /actions/:incidentId preventive - success" "true" "$(echo "$ADD_PREV" | jq -r '.success')"

# 3d. POST - Add immediate action
echo "  Adding immediate action..."
ADD_IMM=$(curl -s -X POST "$API/api/actions/$INC_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "description": "Close canteen Area B until anti-slip matting replaced",
  "actionType": "IMMEDIATE"
}')
assert "POST /actions/:incidentId immediate - success" "true" "$(echo "$ADD_IMM" | jq -r '.success')"

# 3e. PUT - Update action status
echo "  Updating action status..."
STATUS_UPD=$(curl -s -X PUT "$API/api/actions/$INC_ID/status" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "status": "COMPLETED"
}')
assert "PUT /actions/:incidentId/status - success" "true" "$(echo "$STATUS_UPD" | jq -r '.success')"

# 3f. Validation error on add action (missing description)
ACT_VAL=$(curl -s -X POST "$API/api/actions/$INC_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{}')
assert "POST /actions/:incidentId - validation error missing description" "VALIDATION_ERROR" "$(echo "$ACT_VAL" | jq -r '.error.code')"

echo ""

# ─────────────────────────────────────────────
echo "4. PAGINATION AND ADVANCED FILTERS"
echo "─────────────────────────────────────────"

echo "  Testing pagination..."
PAGE_RESULT=$(curl -s "$API/api/incidents?page=1&limit=5" -H "$AUTH")
assert "GET /incidents?page=1&limit=5 - success" "true" "$(echo "$PAGE_RESULT" | jq -r '.success')"
assert "GET /incidents - pagination.page is 1" "1" "$(echo "$PAGE_RESULT" | jq -r '.pagination.page')"

echo "  Testing type filter..."
TYPE_RESULT=$(curl -s "$API/api/incidents?status=ROOT_CAUSE_ANALYSIS" -H "$AUTH")
assert "GET /incidents?status=ROOT_CAUSE_ANALYSIS - success" "true" "$(echo "$TYPE_RESULT" | jq -r '.success')"

echo ""

# ─────────────────────────────────────────────
echo "5. GATEWAY PROXY"
echo "─────────────────────────────────────────"

echo "  Testing all routes through gateway..."
for ROUTE in incidents dashboard riddor; do
  GW_RESULT=$(curl -s "$GW/api/incidents/$ROUTE" -H "$AUTH")
  assert "Gateway /api/incidents/$ROUTE" "true" "$(echo "$GW_RESULT" | jq -r '.success')"
done

echo ""

# ─────────────────────────────────────────────
echo "6. DELETE CLEANUP"
echo "─────────────────────────────────────────"

DEL_INC=$(curl -s -X DELETE "$API/api/incidents/$INC_ID" -H "$AUTH")
assert "DELETE /incidents/:id - success" "true" "$(echo "$DEL_INC" | jq -r '.success')"

DEL_INC2=$(curl -s -X DELETE "$API/api/incidents/$INC2_ID" -H "$AUTH")
assert "DELETE /incidents/:id second - success" "true" "$(echo "$DEL_INC2" | jq -r '.success')"

DEL_INC3=$(curl -s -X DELETE "$API/api/incidents/$INC3_ID" -H "$AUTH")
assert "DELETE /incidents/:id third - success" "true" "$(echo "$DEL_INC3" | jq -r '.success')"

VERIFY=$(curl -s "$API/api/incidents/$INC_ID" -H "$AUTH")
assert "Deleted incident returns NOT_FOUND" "NOT_FOUND" "$(echo "$VERIFY" | jq -r '.error.code')"

echo ""
echo "============================================"
echo "  RESULTS: $PASS passed, $FAIL failed (out of $TOTAL)"
echo "============================================"

if [ $FAIL -gt 0 ]; then
  exit 1
fi
