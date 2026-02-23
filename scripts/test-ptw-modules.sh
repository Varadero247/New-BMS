#!/bin/bash
# Comprehensive test script for PTW (Permit to Work) modules
# Tests: Permits, Method Statements, Toolbox Talks, Conflicts, Dashboard

API="http://localhost:4034"
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
echo "  PTW Modules - Comprehensive Test Suite"
echo "============================================"
echo ""

# ─────────────────────────────────────────────
echo "1. PERMITS MODULE"
echo "─────────────────────────────────────────"

# 1a. POST - Create hot work permit
echo "  Creating hot work permit..."
PTW_RESULT=$(curl -s -X POST "$API/api/permits" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "title": "Hot Work - Welding of structural support beam B4 in Workshop 3",
  "description": "Arc welding of cracked structural support beam B4. Work to be conducted by certified welder with all hot work precautions in place.",
  "type": "HOT_WORK",
  "status": "REQUESTED",
  "priority": "HIGH",
  "location": "Building A",
  "area": "Workshop 3",
  "requestedBy": "maintenance@ims.local",
  "requestedByName": "Maintenance Supervisor",
  "startDate": "2026-02-25",
  "endDate": "2026-02-25",
  "hazards": "Fire risk from welding sparks; UV radiation; fumes; burns",
  "precautions": "Fire watch posted for 1 hour after work; fire extinguisher on-site; all flammables removed 5m radius; screens erected",
  "ppe": "Welding helmet, leather gloves, welding jacket, safety boots, respiratory protection P3",
  "emergencyProcedure": "In case of fire activate alarm and evacuate. Assembly point at car park entrance. Call 999.",
  "isolations": "Electrical isolation of adjacent machinery confirmed. Gas supplies isolated.",
  "gasTestRequired": true,
  "notes": "Work to be suspended if wind speed exceeds 10mph"
}')
PTW_SUCCESS=$(echo "$PTW_RESULT" | jq -r '.success')
PTW_ID=$(echo "$PTW_RESULT" | jq -r '.data.id')
PTW_REF=$(echo "$PTW_RESULT" | jq -r '.data.referenceNumber')
assert "POST /permits - success" "true" "$PTW_SUCCESS"
assert_contains "POST /permits - has ref number" "PTW-" "$PTW_REF"
assert "POST /permits - type HOT_WORK" "HOT_WORK" "$(echo "$PTW_RESULT" | jq -r '.data.type')"
assert "POST /permits - status REQUESTED" "REQUESTED" "$(echo "$PTW_RESULT" | jq -r '.data.status')"
assert "POST /permits - priority HIGH" "HIGH" "$(echo "$PTW_RESULT" | jq -r '.data.priority')"
assert "POST /permits - gasTestRequired true" "true" "$(echo "$PTW_RESULT" | jq -r '.data.gasTestRequired')"

# 1b. POST - Create confined space permit
echo "  Creating confined space permit..."
PTW2_RESULT=$(curl -s -X POST "$API/api/permits" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "title": "Confined Space Entry - Inspection of underground storage tank T7",
  "description": "Internal inspection of underground fuel storage tank T7 for corrosion assessment as part of scheduled 5-year inspection programme",
  "type": "CONFINED_SPACE",
  "status": "APPROVED",
  "priority": "CRITICAL",
  "location": "Building B",
  "area": "Underground Tank Farm",
  "requestedBy": "engineering@ims.local",
  "requestedByName": "Engineering Manager",
  "approvedBy": "hsmanager@ims.local",
  "approvedByName": "H&S Manager",
  "startDate": "2026-03-01",
  "endDate": "2026-03-01",
  "hazards": "Toxic atmosphere (H2S); oxygen deficiency; engulfment risk; restricted egress",
  "precautions": "Continuous gas monitoring; stand-by person at entry; retrieval system in place; rescue plan activated",
  "ppe": "SCBA breathing apparatus, full body harness, non-sparking tools, chemical resistant suit",
  "gasTestRequired": true,
  "gasTestResult": "O2: 20.9%, LEL: 0%, H2S: 0ppm - CLEAR TO ENTER"
}')
PTW2_ID=$(echo "$PTW2_RESULT" | jq -r '.data.id')
assert "POST /permits - confined space success" "true" "$(echo "$PTW2_RESULT" | jq -r '.success')"
assert "POST /permits - CONFINED_SPACE type" "CONFINED_SPACE" "$(echo "$PTW2_RESULT" | jq -r '.data.type')"
assert "POST /permits - CRITICAL priority" "CRITICAL" "$(echo "$PTW2_RESULT" | jq -r '.data.priority')"
assert "POST /permits - gas test result stored" "O2: 20.9%, LEL: 0%, H2S: 0ppm - CLEAR TO ENTER" "$(echo "$PTW2_RESULT" | jq -r '.data.gasTestResult')"

# 1c. GET - List permits
echo "  Listing permits..."
LIST_RESULT=$(curl -s "$API/api/permits" -H "$AUTH")
assert "GET /permits - success" "true" "$(echo "$LIST_RESULT" | jq -r '.success')"
assert "GET /permits - has pagination" "true" "$(echo "$LIST_RESULT" | jq -r '.pagination != null')"
PTW_COUNT=$(echo "$LIST_RESULT" | jq -r '.data | length')
assert "GET /permits - has records" "true" "$([ "$PTW_COUNT" -gt 0 ] && echo true || echo false)"

# 1d. GET - Single permit
echo "  Getting single permit..."
GET_RESULT=$(curl -s "$API/api/permits/$PTW_ID" -H "$AUTH")
assert "GET /permits/:id - success" "true" "$(echo "$GET_RESULT" | jq -r '.success')"
assert "GET /permits/:id - location correct" "Building A" "$(echo "$GET_RESULT" | jq -r '.data.location')"
assert "GET /permits/:id - area correct" "Workshop 3" "$(echo "$GET_RESULT" | jq -r '.data.area')"

# 1e. PUT - Update permit - approve it
echo "  Approving permit..."
PUT_RESULT=$(curl -s -X PUT "$API/api/permits/$PTW_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "status": "APPROVED",
  "approvedBy": "hsmanager@ims.local",
  "approvedByName": "H&S Manager",
  "gasTestResult": "O2: 20.9%, LEL: 0%, CO: 0ppm - CLEAR FOR HOT WORK"
}')
assert "PUT /permits/:id - success" "true" "$(echo "$PUT_RESULT" | jq -r '.success')"
assert "PUT /permits/:id - status APPROVED" "APPROVED" "$(echo "$PUT_RESULT" | jq -r '.data.status')"
assert "PUT /permits/:id - approvedByName set" "H&S Manager" "$(echo "$PUT_RESULT" | jq -r '.data.approvedByName')"

# 1f. PUT - Activate permit
echo "  Activating permit..."
ACTIVATE_RESULT=$(curl -s -X PUT "$API/api/permits/$PTW_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "status": "ACTIVE"
}')
assert "PUT /permits/:id - status ACTIVE" "ACTIVE" "$(echo "$ACTIVATE_RESULT" | jq -r '.data.status')"

# 1g. GET - Filter by status
echo "  Filtering permits..."
FILTER_STATUS=$(curl -s "$API/api/permits?status=ACTIVE" -H "$AUTH")
assert "GET /permits?status=ACTIVE" "true" "$(echo "$FILTER_STATUS" | jq -r '.success')"
assert "GET /permits?status - finds result" "true" "$(echo "$FILTER_STATUS" | jq -r '(.data | length) > 0')"

# 1h. GET - Search permits
SEARCH_RESULT=$(curl -s "$API/api/permits?search=Welding" -H "$AUTH")
assert "GET /permits?search - success" "true" "$(echo "$SEARCH_RESULT" | jq -r '.success')"
assert "GET /permits?search - finds result" "true" "$(echo "$SEARCH_RESULT" | jq -r '(.data | length) > 0')"

# 1i. Validation error - missing title
VAL_RESULT=$(curl -s -X POST "$API/api/permits" -H "$AUTH" -H "Content-Type: application/json" -d '{"type":"HOT_WORK"}')
assert "POST /permits - validation error" "VALIDATION_ERROR" "$(echo "$VAL_RESULT" | jq -r '.error.code')"

# 1j. 404 not found
NOT_FOUND=$(curl -s "$API/api/permits/00000000-0000-0000-0000-000000000999" -H "$AUTH")
assert "GET /permits/:id - 404" "NOT_FOUND" "$(echo "$NOT_FOUND" | jq -r '.error.code')"

echo ""

# ─────────────────────────────────────────────
echo "2. METHOD STATEMENTS MODULE"
echo "─────────────────────────────────────────"

# 2a. POST - Create method statement
echo "  Creating method statement..."
MS_RESULT=$(curl -s -X POST "$API/api/method-statements" -H "$AUTH" -H "Content-Type: application/json" -d "{
  \"title\": \"Method Statement - Arc Welding of Structural Steel\",
  \"permitId\": \"$PTW_ID\",
  \"steps\": \"1. Inspect work area and remove all flammables within 5m. 2. Erect welding screens. 3. Confirm gas test clear. 4. Post fire watch. 5. Conduct welding work. 6. Inspect work on completion. 7. Post-weld inspection of area for 1 hour.\",
  \"hazards\": \"UV radiation causing arc eye; burns from spatter; fire from hot work; fumes inhalation; electrical hazard\",
  \"controls\": \"Welding screens erected; fire extinguisher positioned; gas test conducted; ventilation provided; certified welder only\",
  \"ppe\": \"Welding helmet (shade 11+), leather welding jacket, leather gloves, safety boots, RPE P3 half mask\",
  \"approvedBy\": \"hsmanager@ims.local\",
  \"approvedAt\": \"2026-02-23\",
  \"version\": 1
}")
MS_SUCCESS=$(echo "$MS_RESULT" | jq -r '.success')
MS_ID=$(echo "$MS_RESULT" | jq -r '.data.id')
MS_REF=$(echo "$MS_RESULT" | jq -r '.data.referenceNumber')
assert "POST /method-statements - success" "true" "$MS_SUCCESS"
assert_contains "POST /method-statements - has ref number" "PMS-" "$MS_REF"
assert "POST /method-statements - linked to permit" "$PTW_ID" "$(echo "$MS_RESULT" | jq -r '.data.permitId')"
assert "POST /method-statements - version 1" "1" "$(echo "$MS_RESULT" | jq -r '.data.version')"

# 2b. POST - Standalone method statement
echo "  Creating standalone method statement..."
MS2_RESULT=$(curl -s -X POST "$API/api/method-statements" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "title": "Method Statement - Working at Height on Fragile Roofs",
  "steps": "1. Inspect roof condition before access. 2. Install roof ladders and crawl boards. 3. Attach harness to anchor point. 4. Conduct work. 5. Remove all equipment on completion.",
  "hazards": "Falls through fragile roof material; falls from edge; falling objects striking persons below",
  "controls": "Roof ladders installed; edge protection erected; exclusion zone below; harness and lifeline used",
  "ppe": "Full body harness, hard hat, safety boots, hi-vis vest",
  "version": 1
}')
MS2_ID=$(echo "$MS2_RESULT" | jq -r '.data.id')
assert "POST /method-statements - standalone success" "true" "$(echo "$MS2_RESULT" | jq -r '.success')"

# 2c. GET - List method statements
echo "  Listing method statements..."
MS_LIST=$(curl -s "$API/api/method-statements" -H "$AUTH")
assert "GET /method-statements - success" "true" "$(echo "$MS_LIST" | jq -r '.success')"
assert "GET /method-statements - has records" "true" "$(echo "$MS_LIST" | jq -r '(.data | length) > 0')"

# 2d. GET - Single method statement
echo "  Getting single method statement..."
MS_GET=$(curl -s "$API/api/method-statements/$MS_ID" -H "$AUTH")
assert "GET /method-statements/:id - success" "true" "$(echo "$MS_GET" | jq -r '.success')"
assert "GET /method-statements/:id - title correct" "Method Statement - Arc Welding of Structural Steel" "$(echo "$MS_GET" | jq -r '.data.title')"

# 2e. PUT - Update method statement
echo "  Updating method statement..."
MS_PUT=$(curl -s -X PUT "$API/api/method-statements/$MS_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{"version": 2, "steps": "1. Inspect work area and remove all flammables within 5m. 2. Erect welding screens. 3. Confirm gas test clear. 4. Post TWO fire watchers. 5. Conduct welding work. 6. Inspect work on completion. 7. Post-weld inspection for 1 hour."}')
assert "PUT /method-statements/:id - success" "true" "$(echo "$MS_PUT" | jq -r '.success')"
assert "PUT /method-statements/:id - version updated" "2" "$(echo "$MS_PUT" | jq -r '.data.version')"
assert_contains "PUT /method-statements/:id - steps updated" "TWO fire watchers" "$(echo "$MS_PUT" | jq -r '.data.steps')"

# 2f. GET - Search method statements
MS_SEARCH=$(curl -s "$API/api/method-statements?search=Welding" -H "$AUTH")
assert "GET /method-statements?search - success" "true" "$(echo "$MS_SEARCH" | jq -r '.success')"

# 2g. Validation - missing title
VAL_MS=$(curl -s -X POST "$API/api/method-statements" -H "$AUTH" -H "Content-Type: application/json" -d '{"steps":"some steps"}')
assert "POST /method-statements - validation error" "VALIDATION_ERROR" "$(echo "$VAL_MS" | jq -r '.error.code')"

# 2h. 404 method statement
MS_404=$(curl -s "$API/api/method-statements/00000000-0000-0000-0000-000000000999" -H "$AUTH")
assert "GET /method-statements/:id - 404" "NOT_FOUND" "$(echo "$MS_404" | jq -r '.error.code')"

echo ""

# ─────────────────────────────────────────────
echo "3. TOOLBOX TALKS MODULE"
echo "─────────────────────────────────────────"

# 3a. POST - Create toolbox talk
echo "  Creating toolbox talk..."
TT_RESULT=$(curl -s -X POST "$API/api/toolbox-talks" -H "$AUTH" -H "Content-Type: application/json" -d "{
  \"topic\": \"Hot Work Safety - Fire Hazards and Precautions\",
  \"permitId\": \"$PTW_ID\",
  \"content\": \"This pre-work briefing covers: 1. Identification of fire hazards in the work area. 2. Required precautions - fire extinguisher, fire watch, flammable removal. 3. Gas test procedure and results. 4. Emergency procedures if fire detected. 5. Permit conditions and any stop-work authority.\",
  \"presenter\": \"hsmanager@ims.local\",
  \"presenterName\": \"H&S Manager\",
  \"scheduledDate\": \"2026-02-25\",
  \"attendees\": [\"John Smith\", \"Bob Williams\", \"Sarah Connor\"],
  \"attendeeCount\": 3,
  \"notes\": \"All attendees confirmed understanding and signed attendance sheet\"
}")
TT_SUCCESS=$(echo "$TT_RESULT" | jq -r '.success')
TT_ID=$(echo "$TT_RESULT" | jq -r '.data.id')
TT_REF=$(echo "$TT_RESULT" | jq -r '.data.referenceNumber')
assert "POST /toolbox-talks - success" "true" "$TT_SUCCESS"
assert_contains "POST /toolbox-talks - has ref number" "PTT-" "$TT_REF"
assert "POST /toolbox-talks - linked to permit" "$PTW_ID" "$(echo "$TT_RESULT" | jq -r '.data.permitId')"
assert "POST /toolbox-talks - attendeeCount 3" "3" "$(echo "$TT_RESULT" | jq -r '.data.attendeeCount')"
assert "POST /toolbox-talks - presenterName correct" "H&S Manager" "$(echo "$TT_RESULT" | jq -r '.data.presenterName')"

# 3b. POST - Create second toolbox talk
echo "  Creating second toolbox talk..."
TT2_RESULT=$(curl -s -X POST "$API/api/toolbox-talks" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "topic": "Manual Handling Awareness - Correct Lifting Techniques",
  "content": "Safe lifting technique: Assess load weight. Position feet shoulder-width apart. Bend knees. Keep back straight. Hold load close. Lift smoothly with legs. Avoid twisting.",
  "presenter": "trainer@ims.local",
  "presenterName": "Training Officer",
  "scheduledDate": "2026-02-26",
  "conductedDate": "2026-02-26",
  "attendeeCount": 12,
  "notes": "Regular monthly safety briefing for production team"
}')
TT2_ID=$(echo "$TT2_RESULT" | jq -r '.data.id')
assert "POST /toolbox-talks - second success" "true" "$(echo "$TT2_RESULT" | jq -r '.success')"
assert "POST /toolbox-talks - second topic correct" "Manual Handling Awareness - Correct Lifting Techniques" "$(echo "$TT2_RESULT" | jq -r '.data.topic')"

# 3c. GET - List toolbox talks
echo "  Listing toolbox talks..."
TT_LIST=$(curl -s "$API/api/toolbox-talks" -H "$AUTH")
assert "GET /toolbox-talks - success" "true" "$(echo "$TT_LIST" | jq -r '.success')"
assert "GET /toolbox-talks - has records" "true" "$(echo "$TT_LIST" | jq -r '(.data | length) > 0')"

# 3d. GET - Single toolbox talk
echo "  Getting single toolbox talk..."
TT_GET=$(curl -s "$API/api/toolbox-talks/$TT_ID" -H "$AUTH")
assert "GET /toolbox-talks/:id - success" "true" "$(echo "$TT_GET" | jq -r '.success')"
assert "GET /toolbox-talks/:id - topic correct" "Hot Work Safety - Fire Hazards and Precautions" "$(echo "$TT_GET" | jq -r '.data.topic')"

# 3e. PUT - Record conducted date
echo "  Recording toolbox talk as conducted..."
TT_PUT=$(curl -s -X PUT "$API/api/toolbox-talks/$TT_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "conductedDate": "2026-02-25",
  "attendeeCount": 4,
  "notes": "All attendees confirmed understanding. One additional worker joined on-site."
}')
assert "PUT /toolbox-talks/:id - success" "true" "$(echo "$TT_PUT" | jq -r '.success')"
assert "PUT /toolbox-talks/:id - attendeeCount updated" "4" "$(echo "$TT_PUT" | jq -r '.data.attendeeCount')"

# 3f. GET - Search toolbox talks
TT_SEARCH=$(curl -s "$API/api/toolbox-talks?search=Hot+Work" -H "$AUTH")
assert "GET /toolbox-talks?search - success" "true" "$(echo "$TT_SEARCH" | jq -r '.success')"
assert "GET /toolbox-talks?search - finds result" "true" "$(echo "$TT_SEARCH" | jq -r '(.data | length) > 0')"

# 3g. Validation - missing topic
VAL_TT=$(curl -s -X POST "$API/api/toolbox-talks" -H "$AUTH" -H "Content-Type: application/json" -d '{"content":"some content"}')
assert "POST /toolbox-talks - validation error" "VALIDATION_ERROR" "$(echo "$VAL_TT" | jq -r '.error.code')"

# 3h. 404 toolbox talk
TT_404=$(curl -s "$API/api/toolbox-talks/00000000-0000-0000-0000-000000000999" -H "$AUTH")
assert "GET /toolbox-talks/:id - 404" "NOT_FOUND" "$(echo "$TT_404" | jq -r '.error.code')"

echo ""

# ─────────────────────────────────────────────
echo "4. CONFLICTS MODULE"
echo "─────────────────────────────────────────"

# 4a. GET - Check conflicts (ACTIVE permits in same location/area)
echo "  Checking permit conflicts..."
CONFLICTS=$(curl -s "$API/api/conflicts" -H "$AUTH")
assert "GET /conflicts - success" "true" "$(echo "$CONFLICTS" | jq -r '.success')"
assert "GET /conflicts - returns array" "true" "$(echo "$CONFLICTS" | jq -r '(.data | type) == "array"')"

echo ""

# ─────────────────────────────────────────────
echo "5. DASHBOARD MODULE"
echo "─────────────────────────────────────────"

# 5a. Get stats
echo "  Getting dashboard stats..."
STATS=$(curl -s "$API/api/dashboard/stats" -H "$AUTH")
assert "GET /dashboard/stats - success" "true" "$(echo "$STATS" | jq -r '.success')"
assert "GET /dashboard/stats - has totalPermits" "true" "$(echo "$STATS" | jq -r '.data.totalPermits != null')"
assert "GET /dashboard/stats - has totalMethodStatements" "true" "$(echo "$STATS" | jq -r '.data.totalMethodStatements != null')"
assert "GET /dashboard/stats - has totalToolboxTalks" "true" "$(echo "$STATS" | jq -r '.data.totalToolboxTalks != null')"
TOTAL_PERMITS=$(echo "$STATS" | jq -r '.data.totalPermits')
assert "GET /dashboard/stats - totalPermits > 0" "true" "$([ "$TOTAL_PERMITS" -gt 0 ] && echo true || echo false)"

echo ""

# ─────────────────────────────────────────────
echo "6. GATEWAY PROXY"
echo "─────────────────────────────────────────"

echo "  Testing routes through gateway..."
for ROUTE in permits method-statements toolbox-talks conflicts; do
  RESULT=$(curl -s "$GW/api/ptw/$ROUTE" -H "$AUTH")
  assert "Gateway /api/ptw/$ROUTE" "true" "$(echo "$RESULT" | jq -r '.success')"
done

echo ""

# ─────────────────────────────────────────────
echo "7. DELETE OPERATIONS"
echo "─────────────────────────────────────────"

echo "  Deleting test records..."
DEL_TT=$(curl -s -X DELETE "$API/api/toolbox-talks/$TT_ID" -H "$AUTH")
assert "DELETE /toolbox-talks/:id" "true" "$(echo "$DEL_TT" | jq -r '.success')"

DEL_TT2=$(curl -s -X DELETE "$API/api/toolbox-talks/$TT2_ID" -H "$AUTH")
assert "DELETE /toolbox-talks/:id (second)" "true" "$(echo "$DEL_TT2" | jq -r '.success')"

DEL_MS=$(curl -s -X DELETE "$API/api/method-statements/$MS_ID" -H "$AUTH")
assert "DELETE /method-statements/:id" "true" "$(echo "$DEL_MS" | jq -r '.success')"

DEL_MS2=$(curl -s -X DELETE "$API/api/method-statements/$MS2_ID" -H "$AUTH")
assert "DELETE /method-statements/:id (second)" "true" "$(echo "$DEL_MS2" | jq -r '.success')"

DEL_PTW=$(curl -s -X DELETE "$API/api/permits/$PTW_ID" -H "$AUTH")
assert "DELETE /permits/:id" "true" "$(echo "$DEL_PTW" | jq -r '.success')"

DEL_PTW2=$(curl -s -X DELETE "$API/api/permits/$PTW2_ID" -H "$AUTH")
assert "DELETE /permits/:id (second)" "true" "$(echo "$DEL_PTW2" | jq -r '.success')"

VERIFY_404=$(curl -s "$API/api/permits/$PTW_ID" -H "$AUTH")
assert "Deleted permit returns 404" "NOT_FOUND" "$(echo "$VERIFY_404" | jq -r '.error.code')"

echo ""
echo "============================================"
echo "  RESULTS: $PASS passed, $FAIL failed (out of $TOTAL)"
echo "============================================"

if [ $FAIL -gt 0 ]; then
  exit 1
fi
