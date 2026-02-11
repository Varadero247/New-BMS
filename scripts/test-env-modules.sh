#!/bin/bash
# Comprehensive test script for Environment modules
# Tests: Aspects, Events, Legal, Objectives, Actions, CAPA — CRUD + Gateway

set -e

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
ORIGIN="Origin: http://localhost:3002"

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
echo "  Environment Modules - Comprehensive Test Suite"
echo "============================================"
echo ""

# ─────────────────────────────────────────────
echo "1. ASPECTS MODULE"
echo "─────────────────────────────────────────"

# 1a. POST - Create aspect
echo "  Creating environmental aspect..."
ASP_RESULT=$(curl -s -X POST "$GW/api/environment/aspects" -H "$AUTH" -H "$ORIGIN" -H "Content-Type: application/json" -d '{
  "activityProcess":"Manufacturing Process A - Metal Finishing",
  "activityCategory":"PRODUCTION",
  "department":"Manufacturing",
  "location":"Building 2, Ground Floor",
  "aspect":"Air emissions from solvent-based coating",
  "impact":"Air pollution and VOC release to atmosphere",
  "impactDirection":"ADVERSE",
  "scaleOfImpact":"LOCAL",
  "scoreSeverity":4,
  "scoreProbability":3,
  "scoreDuration":2,
  "scoreExtent":2,
  "scoreReversibility":3,
  "scoreRegulatory":4,
  "scoreStakeholder":2,
  "existingControls":"Extraction fans with activated carbon filters",
  "responsiblePerson":"Env Manager"
}')
ASP_SUCCESS=$(echo "$ASP_RESULT" | jq -r '.success')
ASP_ID=$(echo "$ASP_RESULT" | jq -r '.data.id')
ASP_REF=$(echo "$ASP_RESULT" | jq -r '.data.referenceNumber')
ASP_SCORE=$(echo "$ASP_RESULT" | jq -r '.data.significanceScore')
assert "POST /aspects - success" "true" "$ASP_SUCCESS"
assert_contains "POST /aspects - has ref number" "ENV-ASP-" "$ASP_REF"
assert "POST /aspects - significance score calculated" "true" "$([ "$ASP_SCORE" -gt 0 ] && echo true || echo false)"

# 1b. GET - List aspects
echo "  Listing aspects..."
LIST_RESULT=$(curl -s "$GW/api/environment/aspects" -H "$AUTH" -H "$ORIGIN")
assert "GET /aspects - success" "true" "$(echo "$LIST_RESULT" | jq -r '.success')"
ASP_COUNT=$(echo "$LIST_RESULT" | jq -r '.data | length')
assert "GET /aspects - has records" "true" "$([ "$ASP_COUNT" -gt 0 ] && echo true || echo false)"

# 1c. GET - Single aspect
echo "  Getting single aspect..."
GET_RESULT=$(curl -s "$GW/api/environment/aspects/$ASP_ID" -H "$AUTH" -H "$ORIGIN")
assert "GET /aspects/:id - success" "true" "$(echo "$GET_RESULT" | jq -r '.success')"
assert_contains "GET /aspects/:id - correct activity" "Metal Finishing" "$(echo "$GET_RESULT" | jq -r '.data.activityProcess')"

# 1d. PUT - Update aspect
echo "  Updating aspect..."
PUT_RESULT=$(curl -s -X PUT "$GW/api/environment/aspects/$ASP_ID" -H "$AUTH" -H "$ORIGIN" -H "Content-Type: application/json" -d '{"status":"UNDER_REVIEW","scoreSeverity":5}')
assert "PUT /aspects/:id - success" "true" "$(echo "$PUT_RESULT" | jq -r '.success')"
assert "PUT /aspects/:id - status updated" "UNDER_REVIEW" "$(echo "$PUT_RESULT" | jq -r '.data.status')"

# 1e. Filter by significant
FILTER_RESULT=$(curl -s "$GW/api/environment/aspects?significant=true" -H "$AUTH" -H "$ORIGIN")
assert "GET /aspects?significant filter" "true" "$(echo "$FILTER_RESULT" | jq -r '.success')"

# 1f. Validation error
VAL_RESULT=$(curl -s -X POST "$GW/api/environment/aspects" -H "$AUTH" -H "$ORIGIN" -H "Content-Type: application/json" -d '{"activityProcess":""}')
assert "POST /aspects - validation error" "VALIDATION_ERROR" "$(echo "$VAL_RESULT" | jq -r '.error.code')"

# 1g. 404
NOT_FOUND=$(curl -s "$GW/api/environment/aspects/nonexistent-id" -H "$AUTH" -H "$ORIGIN")
assert "GET /aspects/:id - 404" "NOT_FOUND" "$(echo "$NOT_FOUND" | jq -r '.error.code')"

echo ""

# ─────────────────────────────────────────────
echo "2. EVENTS MODULE"
echo "─────────────────────────────────────────"

# 2a. POST - Create event
echo "  Creating environmental event..."
EVT_RESULT=$(curl -s -X POST "$GW/api/environment/events" -H "$AUTH" -H "$ORIGIN" -H "Content-Type: application/json" -d '{
  "eventType":"SPILL",
  "severity":"MODERATE",
  "dateOfEvent":"2026-02-10",
  "location":"Warehouse Loading Bay",
  "department":"Logistics",
  "reportedBy":"John Smith",
  "description":"Hydraulic oil leak from forklift truck spilled approximately 20 litres onto concrete surface near drain",
  "substanceInvolved":"Hydraulic Oil ISO 46",
  "quantityReleased":20,
  "quantityUnit":"litres",
  "areaSecured":true,
  "immediateActions":"Spill kit deployed, drain cover placed",
  "spillKitUsed":true,
  "waterCourseImpact":false
}')
EVT_SUCCESS=$(echo "$EVT_RESULT" | jq -r '.success')
EVT_ID=$(echo "$EVT_RESULT" | jq -r '.data.id')
EVT_REF=$(echo "$EVT_RESULT" | jq -r '.data.referenceNumber')
assert "POST /events - success" "true" "$EVT_SUCCESS"
assert_contains "POST /events - has ref number" "ENV-EVT-" "$EVT_REF"
assert "POST /events - default status REPORTED" "REPORTED" "$(echo "$EVT_RESULT" | jq -r '.data.status')"

# 2b. GET - List events
echo "  Listing events..."
LIST_RESULT=$(curl -s "$GW/api/environment/events" -H "$AUTH" -H "$ORIGIN")
assert "GET /events - success" "true" "$(echo "$LIST_RESULT" | jq -r '.success')"
assert "GET /events - has records" "true" "$(echo "$LIST_RESULT" | jq -r '(.data | length) > 0')"

# 2c. GET - Single event
echo "  Getting single event..."
GET_RESULT=$(curl -s "$GW/api/environment/events/$EVT_ID" -H "$AUTH" -H "$ORIGIN")
assert "GET /events/:id - success" "true" "$(echo "$GET_RESULT" | jq -r '.success')"

# 2d. PUT - Update event
echo "  Updating event..."
PUT_RESULT=$(curl -s -X PUT "$GW/api/environment/events/$EVT_ID" -H "$AUTH" -H "$ORIGIN" -H "Content-Type: application/json" -d '{"status":"INVESTIGATING","investigationLead":"Env Manager"}')
assert "PUT /events/:id - success" "true" "$(echo "$PUT_RESULT" | jq -r '.success')"
assert "PUT /events/:id - status updated" "INVESTIGATING" "$(echo "$PUT_RESULT" | jq -r '.data.status')"

# 2e. Filter by severity
FILTER_RESULT=$(curl -s "$GW/api/environment/events?severity=MODERATE" -H "$AUTH" -H "$ORIGIN")
assert "GET /events?severity filter" "true" "$(echo "$FILTER_RESULT" | jq -r '.success')"

# 2f. Validation error
VAL_RESULT=$(curl -s -X POST "$GW/api/environment/events" -H "$AUTH" -H "$ORIGIN" -H "Content-Type: application/json" -d '{"eventType":"SPILL"}')
assert "POST /events - validation error" "VALIDATION_ERROR" "$(echo "$VAL_RESULT" | jq -r '.error.code')"

echo ""

# ─────────────────────────────────────────────
echo "3. LEGAL MODULE"
echo "─────────────────────────────────────────"

# 3a. POST - Create legal obligation
echo "  Creating legal obligation..."
LEG_RESULT=$(curl -s -X POST "$GW/api/environment/legal" -H "$AUTH" -H "$ORIGIN" -H "Content-Type: application/json" -d '{
  "obligationType":"PRIMARY_LEGISLATION",
  "title":"Environmental Protection Act 1990",
  "jurisdiction":"UK",
  "regulatoryBody":"Environment Agency",
  "legislationReference":"EPA 1990",
  "description":"Duty of care for waste management and pollution prevention",
  "applicableActivities":"All manufacturing and waste handling processes",
  "responsiblePerson":"Environmental Manager"
}')
LEG_SUCCESS=$(echo "$LEG_RESULT" | jq -r '.success')
LEG_ID=$(echo "$LEG_RESULT" | jq -r '.data.id')
LEG_REF=$(echo "$LEG_RESULT" | jq -r '.data.referenceNumber')
assert "POST /legal - success" "true" "$LEG_SUCCESS"
assert_contains "POST /legal - has ref number" "ENV-LEG-" "$LEG_REF"
assert "POST /legal - default compliance NOT_ASSESSED" "NOT_ASSESSED" "$(echo "$LEG_RESULT" | jq -r '.data.complianceStatus')"

# 3b. GET - List legal
echo "  Listing legal obligations..."
LIST_RESULT=$(curl -s "$GW/api/environment/legal" -H "$AUTH" -H "$ORIGIN")
assert "GET /legal - success" "true" "$(echo "$LIST_RESULT" | jq -r '.success')"
assert "GET /legal - has records" "true" "$(echo "$LIST_RESULT" | jq -r '(.data | length) > 0')"

# 3c. GET - Single legal
echo "  Getting single legal obligation..."
GET_RESULT=$(curl -s "$GW/api/environment/legal/$LEG_ID" -H "$AUTH" -H "$ORIGIN")
assert "GET /legal/:id - success" "true" "$(echo "$GET_RESULT" | jq -r '.success')"

# 3d. PUT - Update compliance status
echo "  Updating compliance status..."
PUT_RESULT=$(curl -s -X PUT "$GW/api/environment/legal/$LEG_ID" -H "$AUTH" -H "$ORIGIN" -H "Content-Type: application/json" -d '{"complianceStatus":"COMPLIANT","complianceEvidence":"Annual compliance audit passed"}')
assert "PUT /legal/:id - success" "true" "$(echo "$PUT_RESULT" | jq -r '.success')"
assert "PUT /legal/:id - compliance updated" "COMPLIANT" "$(echo "$PUT_RESULT" | jq -r '.data.complianceStatus')"

# 3e. Filter by complianceStatus
FILTER_RESULT=$(curl -s "$GW/api/environment/legal?complianceStatus=COMPLIANT" -H "$AUTH" -H "$ORIGIN")
assert "GET /legal?complianceStatus filter" "true" "$(echo "$FILTER_RESULT" | jq -r '.success')"

# 3f. Validation error (missing required fields)
VAL_RESULT=$(curl -s -X POST "$GW/api/environment/legal" -H "$AUTH" -H "$ORIGIN" -H "Content-Type: application/json" -d '{"title":"Test"}')
assert "POST /legal - validation (missing required)" "VALIDATION_ERROR" "$(echo "$VAL_RESULT" | jq -r '.error.code')"

echo ""

# ─────────────────────────────────────────────
echo "4. OBJECTIVES MODULE"
echo "─────────────────────────────────────────"

# 4a. POST - Create with milestones
echo "  Creating objective with milestones..."
OBJ_RESULT=$(curl -s -X POST "$GW/api/environment/objectives" -H "$AUTH" -H "$ORIGIN" -H "Content-Type: application/json" -d '{
  "title":"Reduce carbon emissions by 25% by end of 2026",
  "objectiveStatement":"Achieve a 25% reduction in Scope 1 and 2 carbon emissions against 2024 baseline",
  "category":"CARBON_REDUCTION",
  "owner":"Sustainability Director",
  "targetDate":"2026-12-31",
  "kpiDescription":"Total CO2e emissions in tonnes",
  "baselineValue":1000,
  "targetValue":750,
  "currentValue":950,
  "unit":"tonnes CO2e",
  "department":"Operations",
  "milestones":[
    {"title":"Complete energy audit","dueDate":"2026-03-31"},
    {"title":"Install solar panels","dueDate":"2026-06-30"},
    {"title":"Switch fleet to EV","dueDate":"2026-09-30"}
  ]
}')
OBJ_SUCCESS=$(echo "$OBJ_RESULT" | jq -r '.success')
OBJ_ID=$(echo "$OBJ_RESULT" | jq -r '.data.id')
OBJ_REF=$(echo "$OBJ_RESULT" | jq -r '.data.referenceNumber')
OBJ_MILESTONES=$(echo "$OBJ_RESULT" | jq -r '.data.milestones | length')
assert "POST /objectives - success" "true" "$OBJ_SUCCESS"
assert_contains "POST /objectives - has ref number" "ENV-OBJ-" "$OBJ_REF"
assert "POST /objectives - 3 milestones created" "3" "$OBJ_MILESTONES"
assert "POST /objectives - default status NOT_STARTED" "NOT_STARTED" "$(echo "$OBJ_RESULT" | jq -r '.data.status')"

# 4b. GET - List with milestones
echo "  Listing objectives..."
LIST_RESULT=$(curl -s "$GW/api/environment/objectives" -H "$AUTH" -H "$ORIGIN")
assert "GET /objectives - success" "true" "$(echo "$LIST_RESULT" | jq -r '.success')"
assert "GET /objectives - includes milestones" "true" "$(echo "$LIST_RESULT" | jq -r '.data[0].milestones != null')"

# 4c. GET - Single
echo "  Getting single objective..."
GET_RESULT=$(curl -s "$GW/api/environment/objectives/$OBJ_ID" -H "$AUTH" -H "$ORIGIN")
assert "GET /objectives/:id - success" "true" "$(echo "$GET_RESULT" | jq -r '.success')"

# 4d. PATCH milestone (toggle completed)
echo "  Completing milestone..."
MILE_ID_1=$(echo "$OBJ_RESULT" | jq -r '.data.milestones[0].id')
MS_PATCH=$(curl -s -X PATCH "$GW/api/environment/objectives/$OBJ_ID/milestones/$MILE_ID_1" -H "$AUTH" -H "$ORIGIN" -H "Content-Type: application/json" -d '{"completed":true}')
assert "PATCH milestone completed - success" "true" "$(echo "$MS_PATCH" | jq -r '.success')"
assert "PATCH milestone - completedDate set" "true" "$(echo "$MS_PATCH" | jq -r '.data.completedDate != null')"

# 4e. PUT - Update objective status
echo "  Updating objective status..."
PUT_RESULT=$(curl -s -X PUT "$GW/api/environment/objectives/$OBJ_ID" -H "$AUTH" -H "$ORIGIN" -H "Content-Type: application/json" -d '{"status":"ON_TRACK"}')
assert "PUT /objectives/:id - status updated" "ON_TRACK" "$(echo "$PUT_RESULT" | jq -r '.data.status')"

# 4f. Filter by category
FILTER_RESULT=$(curl -s "$GW/api/environment/objectives?category=CARBON_REDUCTION" -H "$AUTH" -H "$ORIGIN")
assert "GET /objectives?category filter" "true" "$(echo "$FILTER_RESULT" | jq -r '.success')"

echo ""

# ─────────────────────────────────────────────
echo "5. ACTIONS MODULE"
echo "─────────────────────────────────────────"

# 5a. POST - Create action
echo "  Creating environmental action..."
ACT_RESULT=$(curl -s -X POST "$GW/api/environment/actions" -H "$AUTH" -H "$ORIGIN" -H "Content-Type: application/json" -d '{
  "title":"Install secondary containment for chemical storage",
  "actionType":"PREVENTIVE",
  "priority":"HIGH",
  "source":"ASPECT_REVIEW",
  "description":"Install bunded secondary containment around all chemical storage areas to prevent ground contamination",
  "assignedTo":"Facilities Manager",
  "dueDate":"2026-04-30",
  "department":"Facilities",
  "expectedOutcome":"Zero risk of ground contamination from chemical leaks"
}')
ACT_SUCCESS=$(echo "$ACT_RESULT" | jq -r '.success')
ACT_ID=$(echo "$ACT_RESULT" | jq -r '.data.id')
ACT_REF=$(echo "$ACT_RESULT" | jq -r '.data.referenceNumber')
assert "POST /actions - success" "true" "$ACT_SUCCESS"
assert_contains "POST /actions - has ref number" "ENV-ACT-" "$ACT_REF"
assert "POST /actions - default status OPEN" "OPEN" "$(echo "$ACT_RESULT" | jq -r '.data.status')"

# 5b. GET - List actions
echo "  Listing actions..."
LIST_RESULT=$(curl -s "$GW/api/environment/actions" -H "$AUTH" -H "$ORIGIN")
assert "GET /actions - success" "true" "$(echo "$LIST_RESULT" | jq -r '.success')"
ACT_COUNT=$(echo "$LIST_RESULT" | jq -r '.data | length')
assert "GET /actions - has records" "true" "$([ "$ACT_COUNT" -gt 0 ] && echo true || echo false)"

# 5c. GET - Single action
echo "  Getting single action..."
GET_RESULT=$(curl -s "$GW/api/environment/actions/$ACT_ID" -H "$AUTH" -H "$ORIGIN")
assert "GET /actions/:id - success" "true" "$(echo "$GET_RESULT" | jq -r '.success')"

# 5d. PUT - Update action (complete it)
echo "  Completing action..."
PUT_RESULT=$(curl -s -X PUT "$GW/api/environment/actions/$ACT_ID" -H "$AUTH" -H "$ORIGIN" -H "Content-Type: application/json" -d '{"status":"COMPLETED","percentComplete":100}')
assert "PUT /actions/:id - success" "true" "$(echo "$PUT_RESULT" | jq -r '.success')"
assert "PUT /actions/:id - status COMPLETED" "COMPLETED" "$(echo "$PUT_RESULT" | jq -r '.data.status')"
assert "PUT /actions/:id - completionDate auto-set" "true" "$(echo "$PUT_RESULT" | jq -r '.data.completionDate != null')"

# 5e. Filter by priority
FILTER_RESULT=$(curl -s "$GW/api/environment/actions?priority=HIGH" -H "$AUTH" -H "$ORIGIN")
assert "GET /actions?priority filter" "true" "$(echo "$FILTER_RESULT" | jq -r '.success')"

# 5f. Validation error
VAL_RESULT=$(curl -s -X POST "$GW/api/environment/actions" -H "$AUTH" -H "$ORIGIN" -H "Content-Type: application/json" -d '{"title":""}')
assert "POST /actions - validation error" "VALIDATION_ERROR" "$(echo "$VAL_RESULT" | jq -r '.error.code')"

echo ""

# ─────────────────────────────────────────────
echo "6. CAPA MODULE"
echo "─────────────────────────────────────────"

# 6a. POST - Create CAPA with actions
echo "  Creating CAPA with actions..."
CAPA_RESULT=$(curl -s -X POST "$GW/api/environment/capa" -H "$AUTH" -H "$ORIGIN" -H "Content-Type: application/json" -d '{
  "capaType":"CORRECTIVE",
  "title":"Recurring oil spills at loading bay",
  "severity":"MAJOR",
  "triggerSource":"ENVIRONMENTAL_EVENT",
  "description":"Three oil spill events at loading bay in past 6 months indicate systemic failure",
  "initiatedBy":"Env Manager",
  "responsiblePerson":"Operations Director",
  "targetClosureDate":"2026-04-30",
  "problemStatement":"Repeated hydraulic oil leaks from ageing forklift fleet",
  "rootCauseStatement":"Fleet maintenance schedule is inadequate for ageing equipment",
  "capaActions":[
    {"description":"Commission independent fleet condition survey","assignedTo":"Fleet Manager","dueDate":"2026-03-01","priority":"HIGH"},
    {"description":"Replace worst-condition forklifts","assignedTo":"Procurement","dueDate":"2026-03-31"}
  ]
}')
CAPA_SUCCESS=$(echo "$CAPA_RESULT" | jq -r '.success')
CAPA_ID=$(echo "$CAPA_RESULT" | jq -r '.data.id')
CAPA_REF=$(echo "$CAPA_RESULT" | jq -r '.data.referenceNumber')
CAPA_ACTIONS=$(echo "$CAPA_RESULT" | jq -r '.data.capaActions | length')
assert "POST /capa - success" "true" "$CAPA_SUCCESS"
assert_contains "POST /capa - has ref number" "ENV-CAPA-" "$CAPA_REF"
assert "POST /capa - 2 actions created" "2" "$CAPA_ACTIONS"
assert "POST /capa - default status INITIATED" "INITIATED" "$(echo "$CAPA_RESULT" | jq -r '.data.status')"

# 6b. GET - List with actions
echo "  Listing CAPAs..."
LIST_RESULT=$(curl -s "$GW/api/environment/capa" -H "$AUTH" -H "$ORIGIN")
assert "GET /capa - success" "true" "$(echo "$LIST_RESULT" | jq -r '.success')"
assert "GET /capa - includes capaActions" "true" "$(echo "$LIST_RESULT" | jq -r '.data[0].capaActions != null')"

# 6c. GET - Single
echo "  Getting single CAPA..."
GET_RESULT=$(curl -s "$GW/api/environment/capa/$CAPA_ID" -H "$AUTH" -H "$ORIGIN")
assert "GET /capa/:id - success" "true" "$(echo "$GET_RESULT" | jq -r '.success')"

# 6d. POST - Add action
echo "  Adding action to CAPA..."
CAPA_ACT_RESULT=$(curl -s -X POST "$GW/api/environment/capa/$CAPA_ID/actions" -H "$AUTH" -H "$ORIGIN" -H "Content-Type: application/json" -d '{"description":"Implement preventive maintenance schedule","assignedTo":"Maintenance Manager","dueDate":"2026-04-15"}')
assert "POST /capa/:id/actions - success" "true" "$(echo "$CAPA_ACT_RESULT" | jq -r '.success')"
CAPA_ACT_ID=$(echo "$CAPA_ACT_RESULT" | jq -r '.data.id')

# 6e. PUT - Update action status
echo "  Completing CAPA action..."
ACT_PUT=$(curl -s -X PUT "$GW/api/environment/capa/$CAPA_ID/actions/$CAPA_ACT_ID" -H "$AUTH" -H "$ORIGIN" -H "Content-Type: application/json" -d '{"status":"COMPLETED"}')
assert "PUT /capa/:id/actions/:aid - completed" "COMPLETED" "$(echo "$ACT_PUT" | jq -r '.data.status')"
assert "PUT action - completedDate auto-set" "true" "$(echo "$ACT_PUT" | jq -r '.data.completedDate != null')"

# 6f. PUT - Update CAPA status
echo "  Updating CAPA status..."
PUT_RESULT=$(curl -s -X PUT "$GW/api/environment/capa/$CAPA_ID" -H "$AUTH" -H "$ORIGIN" -H "Content-Type: application/json" -d '{"status":"ROOT_CAUSE_ANALYSIS","progressNotes":"RCA in progress using 5 Why method"}')
assert "PUT /capa/:id - status updated" "ROOT_CAUSE_ANALYSIS" "$(echo "$PUT_RESULT" | jq -r '.data.status')"

# 6g. Filter by capaType
FILTER_RESULT=$(curl -s "$GW/api/environment/capa?capaType=CORRECTIVE" -H "$AUTH" -H "$ORIGIN")
assert "GET /capa?capaType filter" "true" "$(echo "$FILTER_RESULT" | jq -r '.success')"

# 6h. Filter by severity
SEV_RESULT=$(curl -s "$GW/api/environment/capa?severity=MAJOR" -H "$AUTH" -H "$ORIGIN")
assert "GET /capa?severity filter" "true" "$(echo "$SEV_RESULT" | jq -r '.success')"

echo ""

# ─────────────────────────────────────────────
echo "7. GATEWAY PROXY"
echo "─────────────────────────────────────────"

echo "  Testing all routes through gateway..."
for ROUTE in aspects events legal objectives actions capa; do
  RESULT=$(curl -s "$GW/api/environment/$ROUTE" -H "$AUTH" -H "$ORIGIN")
  assert "Gateway /api/environment/$ROUTE" "true" "$(echo "$RESULT" | jq -r '.success')"
done

echo ""

# ─────────────────────────────────────────────
echo "8. DELETE OPERATIONS"
echo "─────────────────────────────────────────"

# Delete test records (cleanup)
DEL_ASP=$(curl -s -X DELETE "$GW/api/environment/aspects/$ASP_ID" -H "$AUTH" -H "$ORIGIN")
assert "DELETE /aspects/:id" "true" "$(echo "$DEL_ASP" | jq -r '.success')"

DEL_EVT=$(curl -s -X DELETE "$GW/api/environment/events/$EVT_ID" -H "$AUTH" -H "$ORIGIN")
assert "DELETE /events/:id" "true" "$(echo "$DEL_EVT" | jq -r '.success')"

DEL_LEG=$(curl -s -X DELETE "$GW/api/environment/legal/$LEG_ID" -H "$AUTH" -H "$ORIGIN")
assert "DELETE /legal/:id" "true" "$(echo "$DEL_LEG" | jq -r '.success')"

DEL_OBJ=$(curl -s -X DELETE "$GW/api/environment/objectives/$OBJ_ID" -H "$AUTH" -H "$ORIGIN")
assert "DELETE /objectives/:id (cascade milestones)" "true" "$(echo "$DEL_OBJ" | jq -r '.success')"

DEL_ACT=$(curl -s -X DELETE "$GW/api/environment/actions/$ACT_ID" -H "$AUTH" -H "$ORIGIN")
assert "DELETE /actions/:id" "true" "$(echo "$DEL_ACT" | jq -r '.success')"

DEL_CAPA=$(curl -s -X DELETE "$GW/api/environment/capa/$CAPA_ID" -H "$AUTH" -H "$ORIGIN")
assert "DELETE /capa/:id (cascade capaActions)" "true" "$(echo "$DEL_CAPA" | jq -r '.success')"

# Verify deletes
VERIFY_404=$(curl -s "$GW/api/environment/aspects/$ASP_ID" -H "$AUTH" -H "$ORIGIN")
assert "Deleted aspect returns 404" "NOT_FOUND" "$(echo "$VERIFY_404" | jq -r '.error.code')"

echo ""
echo "============================================"
echo "  RESULTS: $PASS passed, $FAIL failed (out of $TOTAL)"
echo "============================================"

if [ $FAIL -gt 0 ]; then
  exit 1
fi
