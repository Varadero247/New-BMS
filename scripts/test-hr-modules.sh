#!/bin/bash
# Comprehensive test script for HR modules
# Tests: Employees, Attendance, Departments, Leave, Performance, Recruitment, Training, Documents
# All requests go through the API Gateway on port 4000

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
echo "  HR Modules - Comprehensive Test Suite"
echo "============================================"
echo ""

# ─────────────────────────────────────────────
echo "1. DEPARTMENTS MODULE"
echo "─────────────────────────────────────────"

# 1a. POST - Create department
echo "  Creating department..."
DEPT_RESULT=$(curl -s -X POST "$GW/api/hr/departments" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "code":"ENG-TEST",
  "name":"Engineering Test Department",
  "description":"Test department for integration tests",
  "costCenter":"CC-ENG-001",
  "budget":500000,
  "budgetCurrency":"USD"
}')
DEPT_SUCCESS=$(echo "$DEPT_RESULT" | jq -r '.success')
DEPT_ID=$(echo "$DEPT_RESULT" | jq -r '.data.id')
assert "POST /departments - success" "true" "$DEPT_SUCCESS"
assert "POST /departments - has name" "Engineering Test Department" "$(echo "$DEPT_RESULT" | jq -r '.data.name')"

# 1b. GET - List departments
echo "  Listing departments..."
LIST_RESULT=$(curl -s "$GW/api/hr/departments" -H "$AUTH")
assert "GET /departments - success" "true" "$(echo "$LIST_RESULT" | jq -r '.success')"
DEPT_COUNT=$(echo "$LIST_RESULT" | jq -r '.data | length')
assert "GET /departments - has records" "true" "$([ "$DEPT_COUNT" -gt 0 ] && echo true || echo false)"

# 1c. GET - Single department
echo "  Getting single department..."
GET_RESULT=$(curl -s "$GW/api/hr/departments/$DEPT_ID" -H "$AUTH")
assert "GET /departments/:id - success" "true" "$(echo "$GET_RESULT" | jq -r '.success')"
assert "GET /departments/:id - correct name" "Engineering Test Department" "$(echo "$GET_RESULT" | jq -r '.data.name')"

# 1d. PUT - Update department
echo "  Updating department..."
PUT_RESULT=$(curl -s -X PUT "$GW/api/hr/departments/$DEPT_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{"description":"Updated test department description"}')
assert "PUT /departments/:id - success" "true" "$(echo "$PUT_RESULT" | jq -r '.success')"

# 1e. GET - Tree view
echo "  Getting department tree..."
TREE_RESULT=$(curl -s "$GW/api/hr/departments?tree=true" -H "$AUTH")
assert "GET /departments?tree - success" "true" "$(echo "$TREE_RESULT" | jq -r '.success')"

echo ""

# ─────────────────────────────────────────────
echo "2. EMPLOYEES MODULE"
echo "─────────────────────────────────────────"

# 2a. POST - Create employee
echo "  Creating employee..."
EMP_RESULT=$(curl -s -X POST "$GW/api/hr/employees" -H "$AUTH" -H "Content-Type: application/json" -d "{
  \"employeeNumber\":\"EMP-TEST-001\",
  \"firstName\":\"John\",
  \"lastName\":\"TestDoe\",
  \"workEmail\":\"john.testdoe@ims.local\",
  \"departmentId\":\"$DEPT_ID\",
  \"employmentType\":\"FULL_TIME\",
  \"hireDate\":\"2026-01-15\",
  \"jobTitle\":\"Software Engineer\",
  \"currency\":\"USD\"
}")
EMP_SUCCESS=$(echo "$EMP_RESULT" | jq -r '.success')
EMP_ID=$(echo "$EMP_RESULT" | jq -r '.data.id')
assert "POST /employees - success" "true" "$EMP_SUCCESS"
assert "POST /employees - correct name" "John" "$(echo "$EMP_RESULT" | jq -r '.data.firstName')"

# 2b. GET - List employees
echo "  Listing employees..."
LIST_RESULT=$(curl -s "$GW/api/hr/employees" -H "$AUTH")
assert "GET /employees - success" "true" "$(echo "$LIST_RESULT" | jq -r '.success')"
EMP_COUNT=$(echo "$LIST_RESULT" | jq -r '.data | length')
assert "GET /employees - has records" "true" "$([ "$EMP_COUNT" -gt 0 ] && echo true || echo false)"

# 2c. GET - Single employee
echo "  Getting single employee..."
GET_RESULT=$(curl -s "$GW/api/hr/employees/$EMP_ID" -H "$AUTH")
assert "GET /employees/:id - success" "true" "$(echo "$GET_RESULT" | jq -r '.success')"
assert "GET /employees/:id - correct lastName" "TestDoe" "$(echo "$GET_RESULT" | jq -r '.data.lastName')"

# 2d. PUT - Update employee
echo "  Updating employee..."
PUT_RESULT=$(curl -s -X PUT "$GW/api/hr/employees/$EMP_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{"jobTitle":"Senior Software Engineer"}')
assert "PUT /employees/:id - success" "true" "$(echo "$PUT_RESULT" | jq -r '.success')"

# 2e. GET - Search employees
echo "  Searching employees..."
SEARCH_RESULT=$(curl -s "$GW/api/hr/employees?search=TestDoe" -H "$AUTH")
assert "GET /employees?search - finds result" "true" "$(echo "$SEARCH_RESULT" | jq -r '(.data | length) > 0')"

# 2f. GET - Employee stats
echo "  Getting employee stats..."
STATS_RESULT=$(curl -s "$GW/api/hr/employees/stats" -H "$AUTH")
assert "GET /employees/stats - success" "true" "$(echo "$STATS_RESULT" | jq -r '.success')"
assert "GET /employees/stats - has total" "true" "$(echo "$STATS_RESULT" | jq -r '.data.total != null')"

# 2g. GET - Org chart
echo "  Getting org chart..."
ORG_RESULT=$(curl -s "$GW/api/hr/employees/org-chart" -H "$AUTH")
assert "GET /employees/org-chart - success" "true" "$(echo "$ORG_RESULT" | jq -r '.success')"

# 2h. Validation error
VAL_RESULT=$(curl -s -X POST "$GW/api/hr/employees" -H "$AUTH" -H "Content-Type: application/json" -d '{"firstName":""}')
assert "POST /employees - validation error" "VALIDATION_ERROR" "$(echo "$VAL_RESULT" | jq -r '.error.code')"

echo ""

# ─────────────────────────────────────────────
echo "3. ATTENDANCE MODULE"
echo "─────────────────────────────────────────"

# 3a. GET - List attendance
echo "  Listing attendance records..."
LIST_RESULT=$(curl -s "$GW/api/hr/attendance" -H "$AUTH")
assert "GET /attendance - success" "true" "$(echo "$LIST_RESULT" | jq -r '.success')"

# 3b. GET - Attendance summary
echo "  Getting attendance summary..."
SUMMARY_RESULT=$(curl -s "$GW/api/hr/attendance/summary" -H "$AUTH")
assert "GET /attendance/summary - success" "true" "$(echo "$SUMMARY_RESULT" | jq -r '.success')"
assert "GET /attendance/summary - has trends" "true" "$(echo "$SUMMARY_RESULT" | jq -r '.data.trends != null')"

# 3c. GET - List shifts
echo "  Listing shifts..."
SHIFTS_RESULT=$(curl -s "$GW/api/hr/attendance/shifts/all" -H "$AUTH")
assert "GET /attendance/shifts/all - success" "true" "$(echo "$SHIFTS_RESULT" | jq -r '.success')"

# 3d. POST - Create shift
echo "  Creating shift..."
SHIFT_RESULT=$(curl -s -X POST "$GW/api/hr/attendance/shifts" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "name":"Morning Shift Test",
  "code":"MS-TEST",
  "startTime":"09:00",
  "endTime":"17:00",
  "workingHours":8,
  "breakDuration":60
}')
assert "POST /attendance/shifts - success" "true" "$(echo "$SHIFT_RESULT" | jq -r '.success')"

echo ""

# ─────────────────────────────────────────────
echo "4. LEAVE MODULE"
echo "─────────────────────────────────────────"

# 4a. GET - Leave types
echo "  Listing leave types..."
TYPES_RESULT=$(curl -s "$GW/api/hr/leave/types" -H "$AUTH")
assert "GET /leave/types - success" "true" "$(echo "$TYPES_RESULT" | jq -r '.success')"

# 4b. POST - Create leave type
echo "  Creating leave type..."
LT_RESULT=$(curl -s -X POST "$GW/api/hr/leave/types" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "code":"TEST-ANNUAL",
  "name":"Test Annual Leave",
  "category":"ANNUAL",
  "defaultDaysPerYear":25,
  "maxCarryForward":5,
  "isPaid":true,
  "requiresApproval":true
}')
LT_SUCCESS=$(echo "$LT_RESULT" | jq -r '.success')
LT_ID=$(echo "$LT_RESULT" | jq -r '.data.id')
assert "POST /leave/types - success" "true" "$LT_SUCCESS"

# 4c. GET - Leave requests
echo "  Listing leave requests..."
REQ_RESULT=$(curl -s "$GW/api/hr/leave/requests" -H "$AUTH")
assert "GET /leave/requests - success" "true" "$(echo "$REQ_RESULT" | jq -r '.success')"

# 4d. GET - Holidays
echo "  Listing holidays..."
HOL_RESULT=$(curl -s "$GW/api/hr/leave/holidays" -H "$AUTH")
assert "GET /leave/holidays - success" "true" "$(echo "$HOL_RESULT" | jq -r '.success')"

# 4e. POST - Create holiday
echo "  Creating holiday..."
HOLIDAY_RESULT=$(curl -s -X POST "$GW/api/hr/leave/holidays" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "name":"Test Bank Holiday",
  "date":"2026-08-31",
  "type":"PUBLIC"
}')
assert "POST /leave/holidays - success" "true" "$(echo "$HOLIDAY_RESULT" | jq -r '.success')"

echo ""

# ─────────────────────────────────────────────
echo "5. PERFORMANCE MODULE"
echo "─────────────────────────────────────────"

# 5a. GET - Performance cycles
echo "  Listing performance cycles..."
CYCLES_RESULT=$(curl -s "$GW/api/hr/performance/cycles" -H "$AUTH")
assert "GET /performance/cycles - success" "true" "$(echo "$CYCLES_RESULT" | jq -r '.success')"

# 5b. POST - Create performance cycle
echo "  Creating performance cycle..."
CYCLE_RESULT=$(curl -s -X POST "$GW/api/hr/performance/cycles" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "name":"2026 Annual Review Test",
  "year":2026,
  "cycleType":"ANNUAL",
  "startDate":"2026-01-01",
  "endDate":"2026-12-31",
  "ratingScale":5
}')
CYCLE_SUCCESS=$(echo "$CYCLE_RESULT" | jq -r '.success')
CYCLE_ID=$(echo "$CYCLE_RESULT" | jq -r '.data.id')
assert "POST /performance/cycles - success" "true" "$CYCLE_SUCCESS"

# 5c. GET - Performance reviews
echo "  Listing performance reviews..."
REVIEWS_RESULT=$(curl -s "$GW/api/hr/performance/reviews" -H "$AUTH")
assert "GET /performance/reviews - success" "true" "$(echo "$REVIEWS_RESULT" | jq -r '.success')"

# 5d. GET - Performance goals
echo "  Listing performance goals..."
GOALS_RESULT=$(curl -s "$GW/api/hr/performance/goals" -H "$AUTH")
assert "GET /performance/goals - success" "true" "$(echo "$GOALS_RESULT" | jq -r '.success')"

echo ""

# ─────────────────────────────────────────────
echo "6. RECRUITMENT MODULE"
echo "─────────────────────────────────────────"

# 6a. GET - Job postings
echo "  Listing job postings..."
JOBS_RESULT=$(curl -s "$GW/api/hr/recruitment/jobs" -H "$AUTH")
assert "GET /recruitment/jobs - success" "true" "$(echo "$JOBS_RESULT" | jq -r '.success')"

# 6b. POST - Create job posting
echo "  Creating job posting..."
JOB_RESULT=$(curl -s -X POST "$GW/api/hr/recruitment/jobs" -H "$AUTH" -H "Content-Type: application/json" -d "{
  \"title\":\"Test Software Developer\",
  \"departmentId\":\"$DEPT_ID\",
  \"description\":\"Test job posting for integration tests\",
  \"responsibilities\":\"Writing tests and code\",
  \"requirements\":\"3+ years experience\",
  \"employmentType\":\"FULL_TIME\",
  \"location\":\"Remote\",
  \"isRemote\":true,
  \"openings\":2
}")
JOB_SUCCESS=$(echo "$JOB_RESULT" | jq -r '.success')
JOB_ID=$(echo "$JOB_RESULT" | jq -r '.data.id')
assert "POST /recruitment/jobs - success" "true" "$JOB_SUCCESS"
assert_contains "POST /recruitment/jobs - has job code" "JOB-" "$(echo "$JOB_RESULT" | jq -r '.data.jobCode')"

# 6c. GET - Applicants
echo "  Listing applicants..."
APP_RESULT=$(curl -s "$GW/api/hr/recruitment/applicants" -H "$AUTH")
assert "GET /recruitment/applicants - success" "true" "$(echo "$APP_RESULT" | jq -r '.success')"

# 6d. GET - Recruitment stats
echo "  Getting recruitment stats..."
RSTATS_RESULT=$(curl -s "$GW/api/hr/recruitment/stats" -H "$AUTH")
assert "GET /recruitment/stats - success" "true" "$(echo "$RSTATS_RESULT" | jq -r '.success')"
assert "GET /recruitment/stats - has openPositions" "true" "$(echo "$RSTATS_RESULT" | jq -r '.data.openPositions != null')"

echo ""

# ─────────────────────────────────────────────
echo "7. TRAINING MODULE"
echo "─────────────────────────────────────────"

# 7a. GET - Courses
echo "  Listing courses..."
COURSES_RESULT=$(curl -s "$GW/api/hr/training/courses" -H "$AUTH")
assert "GET /training/courses - success" "true" "$(echo "$COURSES_RESULT" | jq -r '.success')"

# 7b. POST - Create course
echo "  Creating course..."
COURSE_RESULT=$(curl -s -X POST "$GW/api/hr/training/courses" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "code":"TC-TEST-001",
  "name":"Test Safety Training",
  "category":"HEALTH_AND_SAFETY",
  "deliveryMethod":"VIRTUAL",
  "duration":120,
  "maxParticipants":30,
  "isMandatory":true
}')
COURSE_SUCCESS=$(echo "$COURSE_RESULT" | jq -r '.success')
COURSE_ID=$(echo "$COURSE_RESULT" | jq -r '.data.id')
assert "POST /training/courses - success" "true" "$COURSE_SUCCESS"

# 7c. GET - Sessions
echo "  Listing sessions..."
SESSIONS_RESULT=$(curl -s "$GW/api/hr/training/sessions" -H "$AUTH")
assert "GET /training/sessions - success" "true" "$(echo "$SESSIONS_RESULT" | jq -r '.success')"

# 7d. GET - Enrollments
echo "  Listing enrollments..."
ENROLL_RESULT=$(curl -s "$GW/api/hr/training/enrollments" -H "$AUTH")
assert "GET /training/enrollments - success" "true" "$(echo "$ENROLL_RESULT" | jq -r '.success')"

# 7e. GET - Certifications
echo "  Listing certifications..."
CERT_RESULT=$(curl -s "$GW/api/hr/training/certifications" -H "$AUTH")
assert "GET /training/certifications - success" "true" "$(echo "$CERT_RESULT" | jq -r '.success')"

# 7f. GET - Training stats
echo "  Getting training stats..."
TSTATS_RESULT=$(curl -s "$GW/api/hr/training/stats" -H "$AUTH")
assert "GET /training/stats - success" "true" "$(echo "$TSTATS_RESULT" | jq -r '.success')"
assert "GET /training/stats - has totalCourses" "true" "$(echo "$TSTATS_RESULT" | jq -r '.data.totalCourses != null')"

echo ""

# ─────────────────────────────────────────────
echo "8. DOCUMENTS MODULE"
echo "─────────────────────────────────────────"

# 8a. GET - List documents
echo "  Listing documents..."
DOCS_RESULT=$(curl -s "$GW/api/hr/documents" -H "$AUTH")
assert "GET /documents - success" "true" "$(echo "$DOCS_RESULT" | jq -r '.success')"

# 8b. POST - Create document
echo "  Creating document..."
DOC_RESULT=$(curl -s -X POST "$GW/api/hr/documents" -H "$AUTH" -H "Content-Type: application/json" -d "{
  \"employeeId\":\"$EMP_ID\",
  \"documentType\":\"CONTRACT\",
  \"title\":\"Test Employment Contract\",
  \"fileName\":\"contract_test.pdf\",
  \"fileUrl\":\"https://example.com/docs/contract_test.pdf\",
  \"isConfidential\":true
}")
DOC_SUCCESS=$(echo "$DOC_RESULT" | jq -r '.success')
DOC_ID=$(echo "$DOC_RESULT" | jq -r '.data.id')
assert "POST /documents - success" "true" "$DOC_SUCCESS"
assert "POST /documents - status ACTIVE" "ACTIVE" "$(echo "$DOC_RESULT" | jq -r '.data.status')"

# 8c. GET - Single document
echo "  Getting single document..."
GET_DOC=$(curl -s "$GW/api/hr/documents/$DOC_ID" -H "$AUTH")
assert "GET /documents/:id - success" "true" "$(echo "$GET_DOC" | jq -r '.success')"
assert "GET /documents/:id - correct title" "Test Employment Contract" "$(echo "$GET_DOC" | jq -r '.data.title')"

# 8d. PUT - Update document
echo "  Updating document..."
PUT_DOC=$(curl -s -X PUT "$GW/api/hr/documents/$DOC_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{"status":"VERIFIED"}')
assert "PUT /documents/:id - success" "true" "$(echo "$PUT_DOC" | jq -r '.success')"

# 8e. DELETE - Archive document
echo "  Archiving document..."
DEL_DOC=$(curl -s -X DELETE "$GW/api/hr/documents/$DOC_ID" -H "$AUTH")
assert "DELETE /documents/:id - success" "true" "$(echo "$DEL_DOC" | jq -r '.success')"

echo ""

# ─────────────────────────────────────────────
echo "9. GATEWAY PROXY"
echo "─────────────────────────────────────────"

echo "  Testing all HR routes through gateway..."
for ROUTE in employees departments attendance leave/types performance/cycles recruitment/jobs training/courses documents; do
  RESULT=$(curl -s "$GW/api/hr/$ROUTE" -H "$AUTH")
  assert "Gateway /api/hr/$ROUTE" "true" "$(echo "$RESULT" | jq -r '.success')"
done

echo ""

# ─────────────────────────────────────────────
echo "10. CLEANUP"
echo "─────────────────────────────────────────"

# Delete test employee (soft delete - sets to TERMINATED)
DEL_EMP=$(curl -s -X DELETE "$GW/api/hr/employees/$EMP_ID" -H "$AUTH")
assert "DELETE /employees/:id - success" "true" "$(echo "$DEL_EMP" | jq -r '.success')"

# Delete test department (soft delete if no active employees)
DEL_DEPT=$(curl -s -X DELETE "$GW/api/hr/departments/$DEPT_ID" -H "$AUTH")
assert "DELETE /departments/:id - success" "true" "$(echo "$DEL_DEPT" | jq -r '.success')"

echo ""
echo "============================================"
echo "  RESULTS: $PASS passed, $FAIL failed (out of $TOTAL)"
echo "============================================"

if [ $FAIL -gt 0 ]; then
  exit 1
fi
