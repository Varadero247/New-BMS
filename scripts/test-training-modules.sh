#!/bin/bash
# Comprehensive test script for Training Management modules
# Tests: Courses, Enrollments, Assessments, Competencies, Records — CRUD + Gateway

API="http://localhost:4028"
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
  local name="$1"; local expected="$2"; local actual="$3"
  TOTAL=$((TOTAL + 1))
  if [ "$actual" = "$expected" ]; then
    echo "  PASS: $name"; PASS=$((PASS + 1))
  else
    echo "  FAIL: $name (expected=$expected, got=$actual)"; FAIL=$((FAIL + 1))
  fi
}

assert_contains() {
  local name="$1"; local expected="$2"; local actual="$3"
  TOTAL=$((TOTAL + 1))
  if echo "$actual" | grep -q "$expected"; then
    echo "  PASS: $name"; PASS=$((PASS + 1))
  else
    echo "  FAIL: $name (expected to contain '$expected')"; FAIL=$((FAIL + 1))
  fi
}

echo "============================================"
echo "  Training Management Modules - Test Suite"
echo "============================================"
echo ""

# ─────────────────────────────────────────────
echo "1. COURSES MODULE"
echo "─────────────────────────────────────────"

COURSE_RESULT=$(curl -s -X POST "$API/api/courses" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "title": "Fire Safety Awareness",
  "description": "Annual fire safety training for all employees",
  "type": "MANDATORY",
  "delivery": "CLASSROOM",
  "duration": 120,
  "validityMonths": 12,
  "provider": "Internal HSE Team",
  "isActive": true
}')
COURSE_SUCCESS=$(echo "$COURSE_RESULT" | jq -r '.success')
COURSE_ID=$(echo "$COURSE_RESULT" | jq -r '.data.id')
assert "POST /courses - success" "true" "$COURSE_SUCCESS"
assert "POST /courses - has ID" "false" "$([ -z "$COURSE_ID" ] || [ "$COURSE_ID" = "null" ] && echo true || echo false)"

COURSES_LIST=$(curl -s "$API/api/courses" -H "$AUTH")
assert "GET /courses - success" "true" "$(echo "$COURSES_LIST" | jq -r '.success')"
assert_contains "GET /courses - has pagination" '"pagination"' "$COURSES_LIST"

COURSE_GET=$(curl -s "$API/api/courses/$COURSE_ID" -H "$AUTH")
assert "GET /courses/:id - success" "true" "$(echo "$COURSE_GET" | jq -r '.success')"
assert "GET /courses/:id - correct title" "Fire Safety Awareness" "$(echo "$COURSE_GET" | jq -r '.data.title')"

COURSE_PATCH=$(curl -s -X PATCH "$API/api/courses/$COURSE_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{"validityMonths":24,"provider":"External Specialist"}')
assert "PATCH /courses/:id - success" "true" "$(echo "$COURSE_PATCH" | jq -r '.success')"

echo ""
echo "2. ENROLLMENTS MODULE"
echo "─────────────────────────────────────────"

ENROL_LIST=$(curl -s "$API/api/enrollments" -H "$AUTH")
assert "GET /enrollments - success" "true" "$(echo "$ENROL_LIST" | jq -r '.success')"

ENROL_RESULT=$(curl -s -X POST "$API/api/enrollments" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "courseId": "'"$COURSE_ID"'",
  "userId": "user-001",
  "employeeName": "Alice Johnson",
  "employeeEmail": "alice@example.com",
  "department": "Operations",
  "scheduledDate": "2026-03-15T09:00:00.000Z",
  "status": "SCHEDULED"
}')
assert "POST /enrollments - success" "true" "$(echo "$ENROL_RESULT" | jq -r '.success')"
ENROL_ID=$(echo "$ENROL_RESULT" | jq -r '.data.id')

if [ -n "$ENROL_ID" ] && [ "$ENROL_ID" != "null" ]; then
  ENROL_PATCH=$(curl -s -X PATCH "$API/api/enrollments/$ENROL_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{"status":"COMPLETED","completedDate":"2026-03-15T11:00:00.000Z","score":92}')
  assert "PATCH /enrollments/:id - complete" "true" "$(echo "$ENROL_PATCH" | jq -r '.success')"
fi

echo ""
echo "3. ASSESSMENTS MODULE"
echo "─────────────────────────────────────────"

ASSESS_LIST=$(curl -s "$API/api/assessments" -H "$AUTH")
assert "GET /assessments - success" "true" "$(echo "$ASSESS_LIST" | jq -r '.success')"

ASSESS_RESULT=$(curl -s -X POST "$API/api/assessments" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "courseId": "'"$COURSE_ID"'",
  "title": "Fire Safety Knowledge Check",
  "type": "MULTIPLE_CHOICE",
  "passMark": 80,
  "duration": 30,
  "questions": [],
  "isActive": true
}')
assert "POST /assessments - success" "true" "$(echo "$ASSESS_RESULT" | jq -r '.success')"
ASSESS_ID=$(echo "$ASSESS_RESULT" | jq -r '.data.id')

if [ -n "$ASSESS_ID" ] && [ "$ASSESS_ID" != "null" ]; then
  ASSESS_PATCH=$(curl -s -X PATCH "$API/api/assessments/$ASSESS_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{"passMark":85}')
  assert "PATCH /assessments/:id - success" "true" "$(echo "$ASSESS_PATCH" | jq -r '.success')"
fi

echo ""
echo "4. COMPETENCIES MODULE"
echo "─────────────────────────────────────────"

COMP_LIST=$(curl -s "$API/api/competencies" -H "$AUTH")
assert "GET /competencies - success" "true" "$(echo "$COMP_LIST" | jq -r '.success')"

COMP_RESULT=$(curl -s -X POST "$API/api/competencies" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "name": "Forklift Operation",
  "description": "Ability to safely operate counterbalance forklifts up to 3.5t",
  "category": "TECHNICAL",
  "level": "INTERMEDIATE",
  "requiredForRoles": ["Warehouse Operative", "Stores Manager"],
  "validityMonths": 36,
  "isActive": true
}')
assert "POST /competencies - success" "true" "$(echo "$COMP_RESULT" | jq -r '.success')"
COMP_ID=$(echo "$COMP_RESULT" | jq -r '.data.id')

if [ -n "$COMP_ID" ] && [ "$COMP_ID" != "null" ]; then
  COMP_PATCH=$(curl -s -X PATCH "$API/api/competencies/$COMP_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{"validityMonths":24}')
  assert "PATCH /competencies/:id - success" "true" "$(echo "$COMP_PATCH" | jq -r '.success')"
fi

echo ""
echo "5. TRAINING RECORDS MODULE"
echo "─────────────────────────────────────────"

RECORDS_LIST=$(curl -s "$API/api/records" -H "$AUTH")
assert "GET /records - success" "true" "$(echo "$RECORDS_LIST" | jq -r '.success')"

echo ""
echo "6. TRAINING COMPLIANCE MODULE"
echo "─────────────────────────────────────────"

COMPLIANCE=$(curl -s "$API/api/compliance" -H "$AUTH")
assert "GET /compliance - success" "true" "$(echo "$COMPLIANCE" | jq -r '.success')"

echo ""
echo "7. TRAINING DASHBOARD"
echo "─────────────────────────────────────────"

DASHBOARD=$(curl -s "$API/api/dashboard" -H "$AUTH")
assert "GET /dashboard - success" "true" "$(echo "$DASHBOARD" | jq -r '.success')"
assert_contains "GET /dashboard - has data" '"data"' "$DASHBOARD"

echo ""
echo "8. SKILLS MODULE"
echo "─────────────────────────────────────────"

SKILLS_LIST=$(curl -s "$API/api/skills" -H "$AUTH")
assert "GET /skills - success" "true" "$(echo "$SKILLS_LIST" | jq -r '.success')"

echo ""
echo "9. TRAINING MATRIX"
echo "─────────────────────────────────────────"

MATRIX=$(curl -s "$API/api/matrix" -H "$AUTH")
assert "GET /matrix - success" "true" "$(echo "$MATRIX" | jq -r '.success')"

echo ""
echo "10. GATEWAY ROUTING"
echo "─────────────────────────────────────────"

GW_RESULT=$(curl -s "$GW/api/training/courses" -H "$AUTH")
assert "Gateway /api/training/courses - success" "true" "$(echo "$GW_RESULT" | jq -r '.success')"

echo ""
echo "11. DELETE OPERATIONS"
echo "─────────────────────────────────────────"

if [ -n "$ASSESS_ID" ] && [ "$ASSESS_ID" != "null" ]; then
  DEL_ASSESS=$(curl -s -X DELETE "$API/api/assessments/$ASSESS_ID" -H "$AUTH")
  assert "DELETE /assessments/:id - success" "true" "$(echo "$DEL_ASSESS" | jq -r '.success')"
fi

if [ -n "$COMP_ID" ] && [ "$COMP_ID" != "null" ]; then
  DEL_COMP=$(curl -s -X DELETE "$API/api/competencies/$COMP_ID" -H "$AUTH")
  assert "DELETE /competencies/:id - success" "true" "$(echo "$DEL_COMP" | jq -r '.success')"
fi

DEL_COURSE=$(curl -s -X DELETE "$API/api/courses/$COURSE_ID" -H "$AUTH")
assert "DELETE /courses/:id - success" "true" "$(echo "$DEL_COURSE" | jq -r '.success')"

VERIFY=$(curl -s "$API/api/courses/$COURSE_ID" -H "$AUTH")
assert "Deleted course returns 404" "NOT_FOUND" "$(echo "$VERIFY" | jq -r '.error.code')"

echo ""
echo "============================================"
echo "  RESULTS: $PASS passed, $FAIL failed (out of $TOTAL)"
echo "============================================"

if [ $FAIL -gt 0 ]; then
  exit 1
fi
