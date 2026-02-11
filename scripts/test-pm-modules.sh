#!/bin/bash
# Comprehensive integration test script for Project Management modules
# Tests: Projects, Tasks, Milestones, Risks, Issues, Changes, Resources,
#        Stakeholders, Documents, Sprints, Timesheets, Reports — CRUD + Gateway

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
ORIGIN="Origin: http://localhost:3009"
PM="$GW/api/v1/project-management"

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
    echo "  FAIL: $name (expected to contain '$expected')"
    FAIL=$((FAIL + 1))
  fi
}

echo "============================================"
echo "  Project Management - Comprehensive Test Suite"
echo "============================================"
echo ""

# ─────────────────────────────────────────────
echo "1. PROJECTS MODULE"
echo "─────────────────────────────────────────"

# 1a. POST - Create project
echo "  Creating project..."
PROJ_RESULT=$(curl -s -X POST "$PM/projects" -H "$AUTH" -H "$ORIGIN" -H "Content-Type: application/json" -d '{
  "projectName":"TEST Integration Project PM",
  "projectType":"CONSTRUCTION",
  "priority":"HIGH",
  "description":"Integration test project for PM module",
  "methodology":"WATERFALL",
  "plannedStartDate":"2026-03-01",
  "plannedEndDate":"2026-12-31",
  "plannedBudget":500000,
  "currency":"GBP",
  "projectManager":"admin"
}')
PROJ_ID=$(echo "$PROJ_RESULT" | jq -r '.data.id')
assert "Create project returns success" "true" "$(echo "$PROJ_RESULT" | jq -r '.success')"
assert "Project has ID" "false" "$([ -z "$PROJ_ID" ] || [ "$PROJ_ID" = "null" ] && echo true || echo false)"
assert "Project has auto-generated code" "true" "$(echo "$PROJ_RESULT" | jq -r '.data.projectCode' | grep -q 'PRJ' && echo true || echo false)"

# 1b. GET - List projects
echo "  Listing projects..."
LIST_RESULT=$(curl -s "$PM/projects" -H "$AUTH" -H "$ORIGIN")
assert "List projects returns success" "true" "$(echo "$LIST_RESULT" | jq -r '.success')"
assert "List has pagination meta" "true" "$(echo "$LIST_RESULT" | jq -r '.meta.total' | grep -q '[0-9]' && echo true || echo false)"

# 1c. GET - Get single project
echo "  Getting project by ID..."
GET_RESULT=$(curl -s "$PM/projects/$PROJ_ID" -H "$AUTH" -H "$ORIGIN")
assert "Get project returns success" "true" "$(echo "$GET_RESULT" | jq -r '.success')"
assert "Project name matches" "TEST Integration Project PM" "$(echo "$GET_RESULT" | jq -r '.data.projectName')"

# 1d. PUT - Update project
echo "  Updating project..."
UPD_RESULT=$(curl -s -X PUT "$PM/projects/$PROJ_ID" -H "$AUTH" -H "$ORIGIN" -H "Content-Type: application/json" -d '{
  "status":"IN_PROGRESS",
  "actualCost":50000
}')
assert "Update project returns success" "true" "$(echo "$UPD_RESULT" | jq -r '.success')"
assert "Project status updated" "IN_PROGRESS" "$(echo "$UPD_RESULT" | jq -r '.data.status')"

# 1e. GET - Dashboard metrics
echo "  Getting dashboard metrics..."
DASH_RESULT=$(curl -s "$PM/projects/dashboard/metrics" -H "$AUTH" -H "$ORIGIN")
assert "Dashboard returns success" "true" "$(echo "$DASH_RESULT" | jq -r '.success')"

echo ""

# ─────────────────────────────────────────────
echo "2. TASKS MODULE"
echo "─────────────────────────────────────────"

# 2a. POST - Create task
echo "  Creating task..."
TASK_RESULT=$(curl -s -X POST "$PM/tasks" -H "$AUTH" -H "$ORIGIN" -H "Content-Type: application/json" -d "{
  \"projectId\":\"$PROJ_ID\",
  \"taskName\":\"Foundation Work\",
  \"taskType\":\"WORK_PACKAGE\",
  \"priority\":\"HIGH\",
  \"plannedStartDate\":\"2026-03-15\",
  \"plannedEndDate\":\"2026-04-15\",
  \"estimatedHours\":160,
  \"assignedTo\":\"admin\"
}")
TASK_ID=$(echo "$TASK_RESULT" | jq -r '.data.id')
assert "Create task returns success" "true" "$(echo "$TASK_RESULT" | jq -r '.success')"
assert "Task has auto-generated code" "true" "$(echo "$TASK_RESULT" | jq -r '.data.taskCode' | grep -q 'TSK' && echo true || echo false)"

# 2b. GET - List tasks by project
echo "  Listing tasks..."
TASKS_LIST=$(curl -s "$PM/tasks?projectId=$PROJ_ID" -H "$AUTH" -H "$ORIGIN")
assert "List tasks returns success" "true" "$(echo "$TASKS_LIST" | jq -r '.success')"

# 2c. PUT - Update task to IN_PROGRESS (should auto-set actualStartDate)
echo "  Updating task to IN_PROGRESS..."
TASK_UPD=$(curl -s -X PUT "$PM/tasks/$TASK_ID" -H "$AUTH" -H "$ORIGIN" -H "Content-Type: application/json" -d '{
  "status":"IN_PROGRESS"
}')
assert "Update task returns success" "true" "$(echo "$TASK_UPD" | jq -r '.success')"

# 2d. GET - Gantt data
echo "  Getting Gantt data..."
GANTT_RESULT=$(curl -s "$PM/tasks/gantt/$PROJ_ID" -H "$AUTH" -H "$ORIGIN")
assert "Gantt returns success" "true" "$(echo "$GANTT_RESULT" | jq -r '.success')"

echo ""

# ─────────────────────────────────────────────
echo "3. MILESTONES MODULE"
echo "─────────────────────────────────────────"

MS_RESULT=$(curl -s -X POST "$PM/milestones" -H "$AUTH" -H "$ORIGIN" -H "Content-Type: application/json" -d "{
  \"projectId\":\"$PROJ_ID\",
  \"milestoneName\":\"Foundation Complete\",
  \"milestoneType\":\"DELIVERABLE\",
  \"plannedDate\":\"2026-04-15\",
  \"weight\":20,
  \"description\":\"Foundation phase complete\"
}")
MS_ID=$(echo "$MS_RESULT" | jq -r '.data.id')
assert "Create milestone returns success" "true" "$(echo "$MS_RESULT" | jq -r '.success')"

MS_LIST=$(curl -s "$PM/milestones?projectId=$PROJ_ID" -H "$AUTH" -H "$ORIGIN")
assert "List milestones returns success" "true" "$(echo "$MS_LIST" | jq -r '.success')"

echo ""

# ─────────────────────────────────────────────
echo "4. RISKS MODULE"
echo "─────────────────────────────────────────"

RISK_RESULT=$(curl -s -X POST "$PM/risks" -H "$AUTH" -H "$ORIGIN" -H "Content-Type: application/json" -d "{
  \"projectId\":\"$PROJ_ID\",
  \"riskTitle\":\"Weather Delays\",
  \"riskDescription\":\"Bad weather may delay outdoor construction\",
  \"riskCategory\":\"EXTERNAL\",
  \"probability\":3,
  \"impact\":4,
  \"riskOwner\":\"admin\"
}")
RISK_ID=$(echo "$RISK_RESULT" | jq -r '.data.id')
assert "Create risk returns success" "true" "$(echo "$RISK_RESULT" | jq -r '.success')"
assert "Risk score auto-calculated" "12" "$(echo "$RISK_RESULT" | jq -r '.data.riskScore')"
assert "Risk level auto-set" "HIGH" "$(echo "$RISK_RESULT" | jq -r '.data.riskLevel')"

RISK_LIST=$(curl -s "$PM/risks?projectId=$PROJ_ID" -H "$AUTH" -H "$ORIGIN")
assert "List risks returns success" "true" "$(echo "$RISK_LIST" | jq -r '.success')"

echo ""

# ─────────────────────────────────────────────
echo "5. ISSUES MODULE"
echo "─────────────────────────────────────────"

ISSUE_RESULT=$(curl -s -X POST "$PM/issues" -H "$AUTH" -H "$ORIGIN" -H "Content-Type: application/json" -d "{
  \"projectId\":\"$PROJ_ID\",
  \"issueTitle\":\"Material Shortage\",
  \"issueDescription\":\"Steel supply delayed by 2 weeks\",
  \"issueCategory\":\"RESOURCE\",
  \"priority\":\"HIGH\",
  \"severity\":\"MAJOR\",
  \"reportedBy\":\"admin\"
}")
ISSUE_ID=$(echo "$ISSUE_RESULT" | jq -r '.data.id')
assert "Create issue returns success" "true" "$(echo "$ISSUE_RESULT" | jq -r '.success')"

# Resolve issue
RESOLVE_RESULT=$(curl -s -X PUT "$PM/issues/$ISSUE_ID/resolve" -H "$AUTH" -H "$ORIGIN" -H "Content-Type: application/json" -d '{
  "resolution":"Found alternative supplier"
}')
assert "Resolve issue returns success" "true" "$(echo "$RESOLVE_RESULT" | jq -r '.success')"
assert "Issue status set to RESOLVED" "RESOLVED" "$(echo "$RESOLVE_RESULT" | jq -r '.data.status')"

echo ""

# ─────────────────────────────────────────────
echo "6. CHANGE REQUESTS MODULE"
echo "─────────────────────────────────────────"

CHANGE_RESULT=$(curl -s -X POST "$PM/changes" -H "$AUTH" -H "$ORIGIN" -H "Content-Type: application/json" -d "{
  \"projectId\":\"$PROJ_ID\",
  \"changeTitle\":\"Extend Foundation Depth\",
  \"changeDescription\":\"Soil report requires deeper foundations\",
  \"changeType\":\"SCOPE\",
  \"priority\":\"HIGH\",
  \"requestedBy\":\"admin\",
  \"justification\":\"Engineering requirement\"
}")
CHANGE_ID=$(echo "$CHANGE_RESULT" | jq -r '.data.id')
assert "Create change request returns success" "true" "$(echo "$CHANGE_RESULT" | jq -r '.success')"

# Approve change
APPROVE_RESULT=$(curl -s -X PUT "$PM/changes/$CHANGE_ID/approve" -H "$AUTH" -H "$ORIGIN" -H "Content-Type: application/json" -d '{
  "approvalNotes":"Approved by engineering review board"
}')
assert "Approve change returns success" "true" "$(echo "$APPROVE_RESULT" | jq -r '.success')"
assert "Change status set to APPROVED" "APPROVED" "$(echo "$APPROVE_RESULT" | jq -r '.data.status')"

echo ""

# ─────────────────────────────────────────────
echo "7. RESOURCES MODULE"
echo "─────────────────────────────────────────"

RES_RESULT=$(curl -s -X POST "$PM/resources" -H "$AUTH" -H "$ORIGIN" -H "Content-Type: application/json" -d "{
  \"projectId\":\"$PROJ_ID\",
  \"resourceName\":\"John Smith\",
  \"resourceType\":\"HUMAN\",
  \"role\":\"Site Engineer\",
  \"responsibility\":\"RESPONSIBLE\",
  \"plannedHours\":400,
  \"hourlyRate\":75
}")
RES_ID=$(echo "$RES_RESULT" | jq -r '.data.id')
assert "Create resource returns success" "true" "$(echo "$RES_RESULT" | jq -r '.success')"

RES_LIST=$(curl -s "$PM/resources?projectId=$PROJ_ID" -H "$AUTH" -H "$ORIGIN")
assert "List resources returns success" "true" "$(echo "$RES_LIST" | jq -r '.success')"

echo ""

# ─────────────────────────────────────────────
echo "8. STAKEHOLDERS MODULE"
echo "─────────────────────────────────────────"

SH_RESULT=$(curl -s -X POST "$PM/stakeholders" -H "$AUTH" -H "$ORIGIN" -H "Content-Type: application/json" -d "{
  \"projectId\":\"$PROJ_ID\",
  \"stakeholderName\":\"City Council\",
  \"stakeholderRole\":\"Regulator\",
  \"stakeholderType\":\"REGULATOR\",
  \"powerLevel\":5,
  \"interestLevel\":4
}")
SH_ID=$(echo "$SH_RESULT" | jq -r '.data.id')
assert "Create stakeholder returns success" "true" "$(echo "$SH_RESULT" | jq -r '.success')"
assert "Stakeholder category auto-set to MANAGE_CLOSELY" "MANAGE_CLOSELY" "$(echo "$SH_RESULT" | jq -r '.data.stakeholderCategory')"

echo ""

# ─────────────────────────────────────────────
echo "9. DOCUMENTS MODULE"
echo "─────────────────────────────────────────"

DOC_RESULT=$(curl -s -X POST "$PM/documents" -H "$AUTH" -H "$ORIGIN" -H "Content-Type: application/json" -d "{
  \"projectId\":\"$PROJ_ID\",
  \"documentCode\":\"DOC-001\",
  \"documentTitle\":\"Project Charter\",
  \"documentType\":\"CHARTER\",
  \"description\":\"Initial project charter document\"
}")
DOC_ID=$(echo "$DOC_RESULT" | jq -r '.data.id')
assert "Create document returns success" "true" "$(echo "$DOC_RESULT" | jq -r '.success')"

DOC_LIST=$(curl -s "$PM/documents?projectId=$PROJ_ID" -H "$AUTH" -H "$ORIGIN")
assert "List documents returns success" "true" "$(echo "$DOC_LIST" | jq -r '.success')"

echo ""

# ─────────────────────────────────────────────
echo "10. SPRINTS MODULE"
echo "─────────────────────────────────────────"

SPR_RESULT=$(curl -s -X POST "$PM/sprints" -H "$AUTH" -H "$ORIGIN" -H "Content-Type: application/json" -d "{
  \"projectId\":\"$PROJ_ID\",
  \"sprintNumber\":1,
  \"sprintName\":\"Sprint 1\",
  \"sprintGoal\":\"Complete foundation design\",
  \"startDate\":\"2026-03-01\",
  \"endDate\":\"2026-03-14\",
  \"duration\":14,
  \"plannedVelocity\":30
}")
SPR_ID=$(echo "$SPR_RESULT" | jq -r '.data.id')
assert "Create sprint returns success" "true" "$(echo "$SPR_RESULT" | jq -r '.success')"

SPR_LIST=$(curl -s "$PM/sprints?projectId=$PROJ_ID" -H "$AUTH" -H "$ORIGIN")
assert "List sprints returns success" "true" "$(echo "$SPR_LIST" | jq -r '.success')"

# Get sprint stories (should be empty)
STORIES_RESULT=$(curl -s "$PM/sprints/$SPR_ID/stories" -H "$AUTH" -H "$ORIGIN")
assert "Get sprint stories returns success" "true" "$(echo "$STORIES_RESULT" | jq -r '.success')"

echo ""

# ─────────────────────────────────────────────
echo "11. TIMESHEETS MODULE"
echo "─────────────────────────────────────────"

TS_RESULT=$(curl -s -X POST "$PM/timesheets" -H "$AUTH" -H "$ORIGIN" -H "Content-Type: application/json" -d "{
  \"projectId\":\"$PROJ_ID\",
  \"employeeId\":\"emp-001\",
  \"workDate\":\"2026-03-15\",
  \"hoursWorked\":8,
  \"activityType\":\"DEVELOPMENT\",
  \"description\":\"Foundation layout\",
  \"isBillable\":true,
  \"hourlyRate\":75
}")
TS_ID=$(echo "$TS_RESULT" | jq -r '.data.id')
assert "Create timesheet returns success" "true" "$(echo "$TS_RESULT" | jq -r '.success')"
assert "Timesheet totalCost auto-calculated" "600" "$(echo "$TS_RESULT" | jq -r '.data.totalCost')"

# Approve timesheet
TS_APPROVE=$(curl -s -X PUT "$PM/timesheets/$TS_ID/approve" -H "$AUTH" -H "$ORIGIN")
assert "Approve timesheet returns success" "true" "$(echo "$TS_APPROVE" | jq -r '.success')"
assert "Timesheet status set to APPROVED" "APPROVED" "$(echo "$TS_APPROVE" | jq -r '.data.status')"

echo ""

# ─────────────────────────────────────────────
echo "12. STATUS REPORTS MODULE"
echo "─────────────────────────────────────────"

RPT_RESULT=$(curl -s -X POST "$PM/reports" -H "$AUTH" -H "$ORIGIN" -H "Content-Type: application/json" -d "{
  \"projectId\":\"$PROJ_ID\",
  \"reportPeriod\":\"Week 1 - March 2026\",
  \"executiveSummary\":\"Project kicked off successfully\",
  \"overallStatus\":\"GREEN\",
  \"scheduleStatus\":\"GREEN\",
  \"budgetStatus\":\"GREEN\",
  \"scopeStatus\":\"GREEN\",
  \"qualityStatus\":\"GREEN\",
  \"riskStatus\":\"AMBER\"
}")
RPT_ID=$(echo "$RPT_RESULT" | jq -r '.data.id')
assert "Create report returns success" "true" "$(echo "$RPT_RESULT" | jq -r '.success')"

RPT_LIST=$(curl -s "$PM/reports?projectId=$PROJ_ID" -H "$AUTH" -H "$ORIGIN")
assert "List reports returns success" "true" "$(echo "$RPT_LIST" | jq -r '.success')"

RPT_GET=$(curl -s "$PM/reports/$RPT_ID" -H "$AUTH" -H "$ORIGIN")
assert "Get report returns success" "true" "$(echo "$RPT_GET" | jq -r '.success')"
assert "Report has correct RAG status" "AMBER" "$(echo "$RPT_GET" | jq -r '.data.riskStatus')"

echo ""

# ─────────────────────────────────────────────
echo "13. CLEANUP — DELETE ALL TEST DATA"
echo "─────────────────────────────────────────"

# Delete in reverse dependency order
curl -s -X DELETE "$PM/reports/$RPT_ID" -H "$AUTH" -H "$ORIGIN" > /dev/null 2>&1
curl -s -X DELETE "$PM/timesheets/$TS_ID" -H "$AUTH" -H "$ORIGIN" > /dev/null 2>&1
curl -s -X DELETE "$PM/sprints/$SPR_ID" -H "$AUTH" -H "$ORIGIN" > /dev/null 2>&1
curl -s -X DELETE "$PM/documents/$DOC_ID" -H "$AUTH" -H "$ORIGIN" > /dev/null 2>&1
curl -s -X DELETE "$PM/stakeholders/$SH_ID" -H "$AUTH" -H "$ORIGIN" > /dev/null 2>&1
curl -s -X DELETE "$PM/resources/$RES_ID" -H "$AUTH" -H "$ORIGIN" > /dev/null 2>&1
curl -s -X DELETE "$PM/changes/$CHANGE_ID" -H "$AUTH" -H "$ORIGIN" > /dev/null 2>&1
curl -s -X DELETE "$PM/issues/$ISSUE_ID" -H "$AUTH" -H "$ORIGIN" > /dev/null 2>&1
curl -s -X DELETE "$PM/risks/$RISK_ID" -H "$AUTH" -H "$ORIGIN" > /dev/null 2>&1
curl -s -X DELETE "$PM/milestones/$MS_ID" -H "$AUTH" -H "$ORIGIN" > /dev/null 2>&1
curl -s -X DELETE "$PM/tasks/$TASK_ID" -H "$AUTH" -H "$ORIGIN" > /dev/null 2>&1
curl -s -X DELETE "$PM/projects/$PROJ_ID" -H "$AUTH" -H "$ORIGIN" > /dev/null 2>&1

echo "  Cleanup complete."
echo ""

# ─────────────────────────────────────────────
echo "============================================"
echo "  RESULTS: $PASS passed, $FAIL failed (out of $TOTAL)"
echo "============================================"

if [ $FAIL -gt 0 ]; then
  exit 1
fi

exit 0
