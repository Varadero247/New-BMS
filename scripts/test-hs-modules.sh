#!/bin/bash
# Comprehensive test script for H&S modules
# Tests: Incidents, Legal, Objectives, CAPA — CRUD + Gateway + Frontend

set -e

API="http://localhost:4001"
GW="http://localhost:4000"
WEB="http://localhost:3001"
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
echo "  H&S Modules - Comprehensive Test Suite"
echo "============================================"
echo ""

# ─────────────────────────────────────────────
echo "1. INCIDENTS MODULE"
echo "─────────────────────────────────────────"

# 1a. POST - Create incident
echo "  Creating incident..."
INC_RESULT=$(curl -s -X POST "$API/api/incidents" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "title":"Slip on wet floor in canteen",
  "description":"Employee slipped on recently mopped floor near serving area, fell and hit head on table edge",
  "type":"INJURY",
  "severity":"MODERATE",
  "location":"Canteen Area B",
  "dateOccurred":"2026-02-10",
  "injuredPersonName":"Jane Doe",
  "injuredPersonRole":"Admin Assistant",
  "employmentType":"Employee",
  "injuryType":"Concussion",
  "bodyPart":"Head",
  "lostTime":true,
  "daysLost":3,
  "witnesses":"Bob Jones, Sarah Lee"
}')
INC_SUCCESS=$(echo "$INC_RESULT" | jq -r '.success')
INC_ID=$(echo "$INC_RESULT" | jq -r '.data.id')
INC_REF=$(echo "$INC_RESULT" | jq -r '.data.referenceNumber')
assert "POST /incidents - success" "true" "$INC_SUCCESS"
assert_contains "POST /incidents - has ref number" "INC-" "$INC_REF"
assert "POST /incidents - MODERATE severity should NOT auto-set RIDDOR" "false" "$(echo "$INC_RESULT" | jq -r '.data.riddorReportable')"

# 1b. POST - Critical incident (auto RIDDOR + investigation)
echo "  Creating CRITICAL incident..."
INC2_RESULT=$(curl -s -X POST "$API/api/incidents" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "title":"Structural collapse in warehouse",
  "description":"Shelving unit collapsed injuring two workers with severe crush injuries requiring hospital treatment",
  "type":"DANGEROUS_OCCURRENCE",
  "severity":"CRITICAL",
  "location":"Warehouse Zone C",
  "dateOccurred":"2026-02-10"
}')
assert "POST /incidents CRITICAL - auto RIDDOR" "true" "$(echo "$INC2_RESULT" | jq -r '.data.riddorReportable')"
assert "POST /incidents CRITICAL - auto investigation" "true" "$(echo "$INC2_RESULT" | jq -r '.data.investigationRequired')"
INC2_DUE=$(echo "$INC2_RESULT" | jq -r '.data.investigationDueDate')
assert_contains "POST /incidents CRITICAL - investigation due date set" "2026-02-11" "$INC2_DUE"

# 1c. GET - List incidents
echo "  Listing incidents..."
LIST_RESULT=$(curl -s "$API/api/incidents" -H "$AUTH")
assert "GET /incidents - success" "true" "$(echo "$LIST_RESULT" | jq -r '.success')"
INC_COUNT=$(echo "$LIST_RESULT" | jq -r '.data | length')
assert "GET /incidents - has records" "true" "$([ "$INC_COUNT" -gt 0 ] && echo true || echo false)"

# 1d. GET - Single incident
echo "  Getting single incident..."
GET_RESULT=$(curl -s "$API/api/incidents/$INC_ID" -H "$AUTH")
assert "GET /incidents/:id - success" "true" "$(echo "$GET_RESULT" | jq -r '.success')"
assert "GET /incidents/:id - correct title" "Slip on wet floor in canteen" "$(echo "$GET_RESULT" | jq -r '.data.title')"

# 1e. PATCH - Update incident
echo "  Updating incident..."
PATCH_RESULT=$(curl -s -X PATCH "$API/api/incidents/$INC_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{"status":"UNDER_INVESTIGATION","investigatorId":"someone"}')
assert "PATCH /incidents/:id - success" "true" "$(echo "$PATCH_RESULT" | jq -r '.success')"
assert "PATCH /incidents/:id - status updated" "UNDER_INVESTIGATION" "$(echo "$PATCH_RESULT" | jq -r '.data.status')"

# 1f. GET - Search
echo "  Searching incidents..."
SEARCH_RESULT=$(curl -s "$API/api/incidents?search=canteen" -H "$AUTH")
assert "GET /incidents?search - finds result" "true" "$(echo "$SEARCH_RESULT" | jq -r '(.data | length) > 0')"

# 1g. GET - Filter by status
FILTER_RESULT=$(curl -s "$API/api/incidents?status=UNDER_INVESTIGATION" -H "$AUTH")
assert "GET /incidents?status filter" "true" "$(echo "$FILTER_RESULT" | jq -r '.success')"

# 1h. Validation error
VAL_RESULT=$(curl -s -X POST "$API/api/incidents" -H "$AUTH" -H "Content-Type: application/json" -d '{"title":""}')
assert "POST /incidents - validation error" "VALIDATION_ERROR" "$(echo "$VAL_RESULT" | jq -r '.error.code')"

# 1i. 404
NOT_FOUND=$(curl -s "$API/api/incidents/nonexistent-id" -H "$AUTH")
assert "GET /incidents/:id - 404" "NOT_FOUND" "$(echo "$NOT_FOUND" | jq -r '.error.code')"

echo ""

# ─────────────────────────────────────────────
echo "2. LEGAL MODULE"
echo "─────────────────────────────────────────"

# 2a. POST - Create
echo "  Creating legal requirement..."
LEG_RESULT=$(curl -s -X POST "$API/api/legal" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "title":"Management of Health and Safety at Work Regulations 1999",
  "description":"Risk assessment duties and principles of prevention",
  "category":"SUBORDINATE_LEGISLATION",
  "jurisdiction":"United Kingdom",
  "legislationRef":"SI 1999/3242",
  "section":"Regulation 3",
  "applicableAreas":"All departments",
  "responsiblePerson":"H&S Director",
  "effectiveDate":"1999-12-29",
  "reviewDate":"2026-06-30"
}')
LEG_SUCCESS=$(echo "$LEG_RESULT" | jq -r '.success')
LEG_ID=$(echo "$LEG_RESULT" | jq -r '.data.id')
LEG_REF=$(echo "$LEG_RESULT" | jq -r '.data.referenceNumber')
assert "POST /legal - success" "true" "$LEG_SUCCESS"
assert_contains "POST /legal - has ref number" "LR-" "$LEG_REF"
assert "POST /legal - default compliance NOT_ASSESSED" "NOT_ASSESSED" "$(echo "$LEG_RESULT" | jq -r '.data.complianceStatus')"

# 2b. GET - List
echo "  Listing requirements..."
LIST_RESULT=$(curl -s "$API/api/legal" -H "$AUTH")
assert "GET /legal - success" "true" "$(echo "$LIST_RESULT" | jq -r '.success')"
assert "GET /legal - has records" "true" "$(echo "$LIST_RESULT" | jq -r '(.data | length) > 0')"

# 2c. GET - Single
echo "  Getting single requirement..."
GET_RESULT=$(curl -s "$API/api/legal/$LEG_ID" -H "$AUTH")
assert "GET /legal/:id - success" "true" "$(echo "$GET_RESULT" | jq -r '.success')"

# 2d. PATCH - Update compliance status
echo "  Updating compliance status..."
PATCH_RESULT=$(curl -s -X PATCH "$API/api/legal/$LEG_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{"complianceStatus":"COMPLIANT","complianceNotes":"Full compliance confirmed in last audit"}')
assert "PATCH /legal/:id - success" "true" "$(echo "$PATCH_RESULT" | jq -r '.success')"
assert "PATCH /legal/:id - compliance updated" "COMPLIANT" "$(echo "$PATCH_RESULT" | jq -r '.data.complianceStatus')"
assert "PATCH /legal/:id - lastReviewedAt set" "true" "$(echo "$PATCH_RESULT" | jq -r '.data.lastReviewedAt != null')"

# 2e. Filter by compliance
FILTER_RESULT=$(curl -s "$API/api/legal?complianceStatus=COMPLIANT" -H "$AUTH")
assert "GET /legal?complianceStatus filter" "true" "$(echo "$FILTER_RESULT" | jq -r '(.data | length) > 0')"

# 2f. Filter by category
CAT_RESULT=$(curl -s "$API/api/legal?category=SUBORDINATE_LEGISLATION" -H "$AUTH")
assert "GET /legal?category filter" "true" "$(echo "$CAT_RESULT" | jq -r '.success')"

# 2g. Validation
VAL_RESULT=$(curl -s -X POST "$API/api/legal" -H "$AUTH" -H "Content-Type: application/json" -d '{"title":"Test"}')
assert "POST /legal - validation (missing required)" "VALIDATION_ERROR" "$(echo "$VAL_RESULT" | jq -r '.error.code')"

echo ""

# ─────────────────────────────────────────────
echo "3. OBJECTIVES MODULE"
echo "─────────────────────────────────────────"

# 3a. POST - Create with milestones
echo "  Creating objective with milestones..."
OBJ_RESULT=$(curl -s -X POST "$API/api/objectives" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "title":"Achieve zero lost-time injuries in manufacturing",
  "objectiveStatement":"Reduce lost-time injuries in manufacturing department to zero by end of Q4 2026",
  "category":"INCIDENT_REDUCTION",
  "department":"Manufacturing",
  "owner":"Production Manager",
  "startDate":"2026-01-01",
  "targetDate":"2026-12-31",
  "kpiDescription":"Number of lost-time injuries per quarter",
  "baselineValue":4,
  "targetValue":0,
  "currentValue":2,
  "unit":"LTIs/quarter",
  "monitoringFrequency":"Monthly",
  "milestones":[
    {"title":"Complete hazard re-assessment","dueDate":"2026-03-31"},
    {"title":"Implement new guarding on machines","dueDate":"2026-06-30"},
    {"title":"Safety culture training completed","dueDate":"2026-09-30"},
    {"title":"Final verification and review","dueDate":"2026-12-15"}
  ]
}')
OBJ_SUCCESS=$(echo "$OBJ_RESULT" | jq -r '.success')
OBJ_ID=$(echo "$OBJ_RESULT" | jq -r '.data.id')
OBJ_REF=$(echo "$OBJ_RESULT" | jq -r '.data.referenceNumber')
OBJ_MILESTONES=$(echo "$OBJ_RESULT" | jq -r '.data.milestones | length')
assert "POST /objectives - success" "true" "$OBJ_SUCCESS"
assert_contains "POST /objectives - has ref number" "OBJ-" "$OBJ_REF"
assert "POST /objectives - 4 milestones created" "4" "$OBJ_MILESTONES"

# 3b. GET - List with milestones
echo "  Listing objectives..."
LIST_RESULT=$(curl -s "$API/api/objectives" -H "$AUTH")
assert "GET /objectives - success" "true" "$(echo "$LIST_RESULT" | jq -r '.success')"
assert "GET /objectives - includes milestones" "true" "$(echo "$LIST_RESULT" | jq -r '.data[0].milestones != null')"

# 3c. GET - Single
echo "  Getting single objective..."
GET_RESULT=$(curl -s "$API/api/objectives/$OBJ_ID" -H "$AUTH")
assert "GET /objectives/:id - success" "true" "$(echo "$GET_RESULT" | jq -r '.success')"

# 3d. POST milestone
echo "  Adding milestone..."
MILE_ID_1=$(echo "$OBJ_RESULT" | jq -r '.data.milestones[0].id')
MS_RESULT=$(curl -s -X POST "$API/api/objectives/$OBJ_ID/milestones" -H "$AUTH" -H "Content-Type: application/json" -d '{"title":"Emergency drill completed","dueDate":"2026-05-15"}')
assert "POST /objectives/:id/milestones - success" "true" "$(echo "$MS_RESULT" | jq -r '.success')"

# 3e. PATCH milestone (toggle completed)
echo "  Completing milestone..."
MS_PATCH=$(curl -s -X PATCH "$API/api/objectives/$OBJ_ID/milestones/$MILE_ID_1" -H "$AUTH" -H "Content-Type: application/json" -d '{"completed":true}')
assert "PATCH milestone completed - success" "true" "$(echo "$MS_PATCH" | jq -r '.success')"
assert "PATCH milestone - completedDate set" "true" "$(echo "$MS_PATCH" | jq -r '.data.completedDate != null')"

# 3f. Verify progress recalculated
echo "  Checking progress recalculation..."
UPDATED_OBJ=$(curl -s "$API/api/objectives/$OBJ_ID" -H "$AUTH")
PROGRESS=$(echo "$UPDATED_OBJ" | jq -r '.data.progressPercent')
assert "Progress recalculated (1/5 = 20%)" "20" "$PROGRESS"

# 3g. PATCH - Update objective status
PATCH_RESULT=$(curl -s -X PATCH "$API/api/objectives/$OBJ_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{"status":"ON_TRACK"}')
assert "PATCH /objectives/:id - status updated" "ON_TRACK" "$(echo "$PATCH_RESULT" | jq -r '.data.status')"

# 3h. Filter
FILTER_RESULT=$(curl -s "$API/api/objectives?category=INCIDENT_REDUCTION" -H "$AUTH")
assert "GET /objectives?category filter" "true" "$(echo "$FILTER_RESULT" | jq -r '(.data | length) > 0')"

echo ""

# ─────────────────────────────────────────────
echo "4. CAPA MODULE"
echo "─────────────────────────────────────────"

# 4a. POST - Create with actions
echo "  Creating CAPA with actions..."
CAPA_RESULT=$(curl -s -X POST "$API/api/capa" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "title":"Inadequate wet floor warning signage",
  "capaType":"CORRECTIVE",
  "source":"INCIDENT",
  "sourceReference":"INC-2602-xxxx",
  "priority":"HIGH",
  "department":"Facilities",
  "responsiblePerson":"Facilities Manager",
  "problemStatement":"Wet floor warning signs were not placed after mopping, leading to slip incident",
  "rootCauseAnalysis":"Cleaning SOP does not mandate signage placement. No accountability for sign deployment.",
  "containmentActions":"Immediately deploy wet floor signs at all mopping locations",
  "successCriteria":"Zero slip incidents related to wet floors for 6 months",
  "verificationMethod":"Monthly slip incident review and spot checks",
  "actions":[
    {"title":"Update cleaning SOP to mandate signage","type":"CORRECTIVE","owner":"Facilities Manager","dueDate":"2026-02-17"},
    {"title":"Purchase additional wet floor signs","type":"IMMEDIATE","owner":"Procurement","dueDate":"2026-02-14"},
    {"title":"Train all cleaning staff on updated SOP","type":"PREVENTIVE","owner":"Training Coordinator","dueDate":"2026-03-01"}
  ]
}')
CAPA_SUCCESS=$(echo "$CAPA_RESULT" | jq -r '.success')
CAPA_ID=$(echo "$CAPA_RESULT" | jq -r '.data.id')
CAPA_REF=$(echo "$CAPA_RESULT" | jq -r '.data.referenceNumber')
CAPA_ACTIONS=$(echo "$CAPA_RESULT" | jq -r '.data.actions | length')
CAPA_TARGET=$(echo "$CAPA_RESULT" | jq -r '.data.targetCompletionDate')
assert "POST /capa - success" "true" "$CAPA_SUCCESS"
assert_contains "POST /capa - has ref number" "CAPA-" "$CAPA_REF"
assert "POST /capa - 3 actions created" "3" "$CAPA_ACTIONS"
assert_contains "POST /capa - target date auto-set (14 days for HIGH)" "2026-02-24" "$CAPA_TARGET"

# 4b. POST - CRITICAL priority (7 day target)
echo "  Creating CRITICAL CAPA..."
CRIT_RESULT=$(curl -s -X POST "$API/api/capa" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "title":"Critical machine guard failure",
  "capaType":"CORRECTIVE",
  "source":"RISK_ASSESSMENT",
  "priority":"CRITICAL"
}')
CRIT_TARGET=$(echo "$CRIT_RESULT" | jq -r '.data.targetCompletionDate')
assert_contains "POST /capa CRITICAL - 7 day target" "2026-02-17" "$CRIT_TARGET"

# 4c. GET - List with actions
echo "  Listing CAPAs..."
LIST_RESULT=$(curl -s "$API/api/capa" -H "$AUTH")
assert "GET /capa - success" "true" "$(echo "$LIST_RESULT" | jq -r '.success')"
assert "GET /capa - includes actions" "true" "$(echo "$LIST_RESULT" | jq -r '.data[0].actions != null')"

# 4d. GET - Single
echo "  Getting single CAPA..."
GET_RESULT=$(curl -s "$API/api/capa/$CAPA_ID" -H "$AUTH")
assert "GET /capa/:id - success" "true" "$(echo "$GET_RESULT" | jq -r '.success')"

# 4e. POST - Add action
echo "  Adding action to CAPA..."
ACT_RESULT=$(curl -s -X POST "$API/api/capa/$CAPA_ID/actions" -H "$AUTH" -H "Content-Type: application/json" -d '{"title":"Quarterly floor safety audit","type":"PREVENTIVE","owner":"H&S Manager","dueDate":"2026-06-30"}')
assert "POST /capa/:id/actions - success" "true" "$(echo "$ACT_RESULT" | jq -r '.success')"

# 4f. PATCH - Update action status
ACT_ID=$(echo "$ACT_RESULT" | jq -r '.data.id')
ACT_PATCH=$(curl -s -X PATCH "$API/api/capa/$CAPA_ID/actions/$ACT_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{"status":"COMPLETED"}')
assert "PATCH /capa/:id/actions/:aid - completed" "COMPLETED" "$(echo "$ACT_PATCH" | jq -r '.data.status')"
assert "PATCH action - completedAt set" "true" "$(echo "$ACT_PATCH" | jq -r '.data.completedAt != null')"

# 4g. PATCH - Close CAPA
echo "  Closing CAPA..."
CLOSE_RESULT=$(curl -s -X PATCH "$API/api/capa/$CAPA_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{"status":"CLOSED","closureNotes":"All actions completed and verified","effectivenessRating":"Effective"}')
assert "PATCH /capa close - status CLOSED" "CLOSED" "$(echo "$CLOSE_RESULT" | jq -r '.data.status')"
assert "PATCH /capa close - closedDate set" "true" "$(echo "$CLOSE_RESULT" | jq -r '.data.closedDate != null')"
assert "PATCH /capa close - closedBy set" "true" "$(echo "$CLOSE_RESULT" | jq -r '.data.closedBy != null')"

# 4h. Filters
FILTER_RESULT=$(curl -s "$API/api/capa?priority=HIGH" -H "$AUTH")
assert "GET /capa?priority filter" "true" "$(echo "$FILTER_RESULT" | jq -r '.success')"
TYPE_RESULT=$(curl -s "$API/api/capa?capaType=CORRECTIVE" -H "$AUTH")
assert "GET /capa?capaType filter" "true" "$(echo "$TYPE_RESULT" | jq -r '.success')"

echo ""

# ─────────────────────────────────────────────
echo "5. GATEWAY PROXY"
echo "─────────────────────────────────────────"

echo "  Testing all routes through gateway..."
for ROUTE in incidents legal objectives capa; do
  RESULT=$(curl -s "$GW/api/health-safety/$ROUTE" -H "$AUTH")
  assert "Gateway /api/health-safety/$ROUTE" "true" "$(echo "$RESULT" | jq -r '.success')"
done

echo ""

# ─────────────────────────────────────────────
echo "6. FRONTEND PAGES"
echo "─────────────────────────────────────────"

for PAGE in incidents legal objectives actions risks; do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" "$WEB/$PAGE")
  assert "Web $WEB/$PAGE → 200" "200" "$CODE"
done

echo ""

# ─────────────────────────────────────────────
echo "7. DELETE OPERATIONS"
echo "─────────────────────────────────────────"

# Delete test records (cleanup)
DEL_INC=$(curl -s -X DELETE "$API/api/incidents/$INC_ID" -H "$AUTH")
assert "DELETE /incidents/:id" "true" "$(echo "$DEL_INC" | jq -r '.success')"

DEL_LEG=$(curl -s -X DELETE "$API/api/legal/$LEG_ID" -H "$AUTH")
assert "DELETE /legal/:id" "true" "$(echo "$DEL_LEG" | jq -r '.success')"

DEL_OBJ=$(curl -s -X DELETE "$API/api/objectives/$OBJ_ID" -H "$AUTH")
assert "DELETE /objectives/:id (cascade milestones)" "true" "$(echo "$DEL_OBJ" | jq -r '.success')"

# CAPA already closed, verify delete works
DEL_CAPA=$(curl -s -X DELETE "$API/api/capa/$CAPA_ID" -H "$AUTH")
assert "DELETE /capa/:id (cascade actions)" "true" "$(echo "$DEL_CAPA" | jq -r '.success')"

# Verify deletes
VERIFY_404=$(curl -s "$API/api/incidents/$INC_ID" -H "$AUTH")
assert "Deleted incident returns 404" "NOT_FOUND" "$(echo "$VERIFY_404" | jq -r '.error.code')"

echo ""
echo "============================================"
echo "  RESULTS: $PASS passed, $FAIL failed (out of $TOTAL)"
echo "============================================"

if [ $FAIL -gt 0 ]; then
  exit 1
fi
