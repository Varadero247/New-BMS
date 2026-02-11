#!/bin/bash
# Comprehensive test script for Workflows modules
# Tests: Templates, Definitions, Instances, Tasks, Approvals, Automation — CRUD + Gateway

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
echo "  Workflows Modules - Comprehensive Test Suite"
echo "============================================"
echo ""

# ─────────────────────────────────────────────
echo "1. TEMPLATES MODULE"
echo "─────────────────────────────────────────"

# 1a. POST - Create template
echo "  Creating template..."
TPL_RESULT=$(curl -s -X POST "$GW/api/workflows/templates" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "code":"LEAVE_REQUEST_TPL",
  "name":"Leave Request Workflow Template",
  "description":"Standard template for employee leave request workflows",
  "category":"HR",
  "industryType":"GENERAL",
  "estimatedDuration":48,
  "complexity":"SIMPLE",
  "requiredRoles":["manager","hr_admin"],
  "icon":"calendar",
  "color":"#4CAF50"
}')
TPL_SUCCESS=$(echo "$TPL_RESULT" | jq -r '.success')
TPL_ID=$(echo "$TPL_RESULT" | jq -r '.data.id')
assert "POST /templates - success" "true" "$TPL_SUCCESS"
assert "POST /templates - version defaults to 1" "1" "$(echo "$TPL_RESULT" | jq -r '.data.version')"
assert "POST /templates - correct category" "HR" "$(echo "$TPL_RESULT" | jq -r '.data.category')"

# 1b. GET - List templates
echo "  Listing templates..."
LIST_RESULT=$(curl -s "$GW/api/workflows/templates" -H "$AUTH")
assert "GET /templates - success" "true" "$(echo "$LIST_RESULT" | jq -r '.success')"
assert "GET /templates - has records" "true" "$(echo "$LIST_RESULT" | jq -r '(.data | length) > 0')"

# 1c. GET - Single template
echo "  Getting single template..."
GET_RESULT=$(curl -s "$GW/api/workflows/templates/$TPL_ID" -H "$AUTH")
assert "GET /templates/:id - success" "true" "$(echo "$GET_RESULT" | jq -r '.success')"
assert "GET /templates/:id - correct name" "Leave Request Workflow Template" "$(echo "$GET_RESULT" | jq -r '.data.name')"

# 1d. PUT - Update template
echo "  Updating template..."
PUT_RESULT=$(curl -s -X PUT "$GW/api/workflows/templates/$TPL_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{"description":"Updated leave request workflow template","complexity":"MEDIUM"}')
assert "PUT /templates/:id - success" "true" "$(echo "$PUT_RESULT" | jq -r '.success')"
assert "PUT /templates/:id - complexity updated" "MEDIUM" "$(echo "$PUT_RESULT" | jq -r '.data.complexity')"

# 1e. PUT - Publish template
echo "  Publishing template..."
PUB_RESULT=$(curl -s -X PUT "$GW/api/workflows/templates/$TPL_ID/publish" -H "$AUTH")
assert "PUT /templates/:id/publish - success" "true" "$(echo "$PUB_RESULT" | jq -r '.success')"
assert "PUT /templates/:id/publish - isPublished" "true" "$(echo "$PUB_RESULT" | jq -r '.data.isPublished')"

# 1f. Filter by category
FILTER_RESULT=$(curl -s "$GW/api/workflows/templates?category=HR" -H "$AUTH")
assert "GET /templates?category filter" "true" "$(echo "$FILTER_RESULT" | jq -r '.success')"
assert "GET /templates?category filter - has results" "true" "$(echo "$FILTER_RESULT" | jq -r '(.data | length) > 0')"

# 1g. GET categories list
CAT_RESULT=$(curl -s "$GW/api/workflows/templates/categories/list" -H "$AUTH")
assert "GET /templates/categories/list - success" "true" "$(echo "$CAT_RESULT" | jq -r '.success')"

# 1h. Validation error
VAL_RESULT=$(curl -s -X POST "$GW/api/workflows/templates" -H "$AUTH" -H "Content-Type: application/json" -d '{"name":"Test"}')
assert "POST /templates - validation error (missing code/category)" "VALIDATION_ERROR" "$(echo "$VAL_RESULT" | jq -r '.error.code')"

# 1i. 404
NOT_FOUND=$(curl -s "$GW/api/workflows/templates/nonexistent-id" -H "$AUTH")
assert "GET /templates/:id - 404" "NOT_FOUND" "$(echo "$NOT_FOUND" | jq -r '.error.code')"

echo ""

# ─────────────────────────────────────────────
echo "2. DEFINITIONS MODULE"
echo "─────────────────────────────────────────"

# 2a. POST - Create definition
echo "  Creating definition..."
DEF_RESULT=$(curl -s -X POST "$GW/api/workflows/definitions" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "templateId":"'"$TPL_ID"'",
  "code":"LEAVE_REQ_V1",
  "name":"Leave Request Workflow v1",
  "description":"Standard leave request approval workflow",
  "triggerType":"MANUAL",
  "nodes":[{"id":"start","type":"start","label":"Start"},{"id":"approval","type":"task","label":"Manager Approval"},{"id":"end","type":"end","label":"End"}],
  "edges":[{"from":"start","to":"approval"},{"from":"approval","to":"end"}],
  "variables":{"maxDays":30,"requiresHRApproval":true},
  "defaultSLA":72
}')
DEF_SUCCESS=$(echo "$DEF_RESULT" | jq -r '.success')
DEF_ID=$(echo "$DEF_RESULT" | jq -r '.data.id')
assert "POST /definitions - success" "true" "$DEF_SUCCESS"
assert "POST /definitions - status defaults to DRAFT" "DRAFT" "$(echo "$DEF_RESULT" | jq -r '.data.status')"
assert "POST /definitions - version defaults to 1" "1" "$(echo "$DEF_RESULT" | jq -r '.data.version')"

# 2b. GET - List definitions
echo "  Listing definitions..."
LIST_RESULT=$(curl -s "$GW/api/workflows/definitions" -H "$AUTH")
assert "GET /definitions - success" "true" "$(echo "$LIST_RESULT" | jq -r '.success')"
assert "GET /definitions - has records" "true" "$(echo "$LIST_RESULT" | jq -r '(.data | length) > 0')"

# 2c. GET - Single definition
echo "  Getting single definition..."
GET_RESULT=$(curl -s "$GW/api/workflows/definitions/$DEF_ID" -H "$AUTH")
assert "GET /definitions/:id - success" "true" "$(echo "$GET_RESULT" | jq -r '.success')"
assert "GET /definitions/:id - correct name" "Leave Request Workflow v1" "$(echo "$GET_RESULT" | jq -r '.data.name')"

# 2d. PUT - Update definition
echo "  Updating definition..."
PUT_RESULT=$(curl -s -X PUT "$GW/api/workflows/definitions/$DEF_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{"description":"Updated leave request approval workflow","defaultSLA":96}')
assert "PUT /definitions/:id - success" "true" "$(echo "$PUT_RESULT" | jq -r '.success')"
assert "PUT /definitions/:id - version incremented to 2" "2" "$(echo "$PUT_RESULT" | jq -r '.data.version')"

# 2e. PUT - Activate definition
echo "  Activating definition..."
ACT_RESULT=$(curl -s -X PUT "$GW/api/workflows/definitions/$DEF_ID/activate" -H "$AUTH")
assert "PUT /definitions/:id/activate - success" "true" "$(echo "$ACT_RESULT" | jq -r '.success')"
assert "PUT /definitions/:id/activate - status ACTIVE" "ACTIVE" "$(echo "$ACT_RESULT" | jq -r '.data.status')"

# 2f. POST - Clone definition
echo "  Cloning definition..."
CLONE_RESULT=$(curl -s -X POST "$GW/api/workflows/definitions/$DEF_ID/clone" -H "$AUTH")
CLONE_ID=$(echo "$CLONE_RESULT" | jq -r '.data.id')
assert "POST /definitions/:id/clone - success" "true" "$(echo "$CLONE_RESULT" | jq -r '.success')"
assert "POST /definitions/:id/clone - status DRAFT" "DRAFT" "$(echo "$CLONE_RESULT" | jq -r '.data.status')"
assert_contains "POST /definitions/:id/clone - name contains (Copy)" "(Copy)" "$(echo "$CLONE_RESULT" | jq -r '.data.name')"

# 2g. Filter by status
FILTER_RESULT=$(curl -s "$GW/api/workflows/definitions?status=ACTIVE" -H "$AUTH")
assert "GET /definitions?status filter" "true" "$(echo "$FILTER_RESULT" | jq -r '.success')"
assert "GET /definitions?status filter - has results" "true" "$(echo "$FILTER_RESULT" | jq -r '(.data | length) > 0')"

# 2h. Validation error
VAL_RESULT=$(curl -s -X POST "$GW/api/workflows/definitions" -H "$AUTH" -H "Content-Type: application/json" -d '{"name":"Test"}')
assert "POST /definitions - validation error (missing required)" "VALIDATION_ERROR" "$(echo "$VAL_RESULT" | jq -r '.error.code')"

# 2i. 404
NOT_FOUND=$(curl -s "$GW/api/workflows/definitions/nonexistent-id" -H "$AUTH")
assert "GET /definitions/:id - 404" "NOT_FOUND" "$(echo "$NOT_FOUND" | jq -r '.error.code')"

echo ""

# ─────────────────────────────────────────────
echo "3. INSTANCES MODULE"
echo "─────────────────────────────────────────"

# We need a valid initiatorId (UUID). Use a dummy UUID for testing.
DUMMY_USER_ID="00000000-0000-0000-0000-000000000001"

# 3a. POST - Create instance (requires ACTIVE definition)
echo "  Creating workflow instance..."
INST_RESULT=$(curl -s -X POST "$GW/api/workflows/instances" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "definitionId":"'"$DEF_ID"'",
  "initiatorId":"'"$DUMMY_USER_ID"'",
  "title":"Annual leave request - John Smith",
  "description":"Request for 5 days annual leave in March 2026",
  "priority":"NORMAL",
  "entityType":"LEAVE_REQUEST",
  "variables":{"days":5,"startDate":"2026-03-01","endDate":"2026-03-05"},
  "dueDate":"2026-02-28"
}')
INST_SUCCESS=$(echo "$INST_RESULT" | jq -r '.success')
INST_ID=$(echo "$INST_RESULT" | jq -r '.data.id')
INST_NUM=$(echo "$INST_RESULT" | jq -r '.data.instanceNumber')
assert "POST /instances - success" "true" "$INST_SUCCESS"
assert_contains "POST /instances - has instance number" "WF-" "$INST_NUM"
assert "POST /instances - status IN_PROGRESS" "IN_PROGRESS" "$(echo "$INST_RESULT" | jq -r '.data.status')"
assert "POST /instances - priority NORMAL" "NORMAL" "$(echo "$INST_RESULT" | jq -r '.data.priority')"

# 3b. GET - List instances
echo "  Listing instances..."
LIST_RESULT=$(curl -s "$GW/api/workflows/instances" -H "$AUTH")
assert "GET /instances - success" "true" "$(echo "$LIST_RESULT" | jq -r '.success')"
assert "GET /instances - has records" "true" "$(echo "$LIST_RESULT" | jq -r '(.data | length) > 0')"
assert "GET /instances - has meta pagination" "true" "$(echo "$LIST_RESULT" | jq -r '.meta != null')"

# 3c. GET - Single instance
echo "  Getting single instance..."
GET_RESULT=$(curl -s "$GW/api/workflows/instances/$INST_ID" -H "$AUTH")
assert "GET /instances/:id - success" "true" "$(echo "$GET_RESULT" | jq -r '.success')"
assert "GET /instances/:id - correct title" "Annual leave request - John Smith" "$(echo "$GET_RESULT" | jq -r '.data.title')"
assert "GET /instances/:id - includes history" "true" "$(echo "$GET_RESULT" | jq -r '.data.history != null')"

# 3d. GET - Instance stats
echo "  Getting instance stats..."
STATS_RESULT=$(curl -s "$GW/api/workflows/instances/stats/summary" -H "$AUTH")
assert "GET /instances/stats/summary - success" "true" "$(echo "$STATS_RESULT" | jq -r '.success')"
assert "GET /instances/stats/summary - has byStatus" "true" "$(echo "$STATS_RESULT" | jq -r '.data.byStatus != null')"

# 3e. PUT - Complete instance
echo "  Completing instance..."
COMPLETE_RESULT=$(curl -s -X PUT "$GW/api/workflows/instances/$INST_ID/complete" -H "$AUTH" -H "Content-Type: application/json" -d '{"outcome":"APPROVED","outcomeNotes":"Leave approved by manager"}')
assert "PUT /instances/:id/complete - success" "true" "$(echo "$COMPLETE_RESULT" | jq -r '.success')"
assert "PUT /instances/:id/complete - status COMPLETED" "COMPLETED" "$(echo "$COMPLETE_RESULT" | jq -r '.data.status')"
assert "PUT /instances/:id/complete - completedAt set" "true" "$(echo "$COMPLETE_RESULT" | jq -r '.data.completedAt != null')"

# 3f. POST - Create second instance for cancel test
echo "  Creating second instance for cancel test..."
INST2_RESULT=$(curl -s -X POST "$GW/api/workflows/instances" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "definitionId":"'"$DEF_ID"'",
  "initiatorId":"'"$DUMMY_USER_ID"'",
  "title":"Sick leave request - Jane Doe",
  "priority":"HIGH"
}')
INST2_ID=$(echo "$INST2_RESULT" | jq -r '.data.id')
assert "POST /instances (2nd) - success" "true" "$(echo "$INST2_RESULT" | jq -r '.success')"

# 3g. PUT - Cancel instance
echo "  Cancelling instance..."
CANCEL_RESULT=$(curl -s -X PUT "$GW/api/workflows/instances/$INST2_ID/cancel" -H "$AUTH" -H "Content-Type: application/json" -d '{"cancelledById":"'"$DUMMY_USER_ID"'","cancellationReason":"Request no longer needed"}')
assert "PUT /instances/:id/cancel - success" "true" "$(echo "$CANCEL_RESULT" | jq -r '.success')"
assert "PUT /instances/:id/cancel - status CANCELLED" "CANCELLED" "$(echo "$CANCEL_RESULT" | jq -r '.data.status')"

# 3h. Filter by status
FILTER_RESULT=$(curl -s "$GW/api/workflows/instances?status=COMPLETED" -H "$AUTH")
assert "GET /instances?status filter" "true" "$(echo "$FILTER_RESULT" | jq -r '.success')"

# 3i. Validation error
VAL_RESULT=$(curl -s -X POST "$GW/api/workflows/instances" -H "$AUTH" -H "Content-Type: application/json" -d '{"title":"Test"}')
assert "POST /instances - validation error (missing required)" "VALIDATION_ERROR" "$(echo "$VAL_RESULT" | jq -r '.error.code')"

# 3j. 404
NOT_FOUND=$(curl -s "$GW/api/workflows/instances/nonexistent-id" -H "$AUTH")
assert "GET /instances/:id - 404" "NOT_FOUND" "$(echo "$NOT_FOUND" | jq -r '.error.code')"

echo ""

# ─────────────────────────────────────────────
echo "4. TASKS MODULE"
echo "─────────────────────────────────────────"

# Create a new instance for task testing (need an active one)
INST3_RESULT=$(curl -s -X POST "$GW/api/workflows/instances" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "definitionId":"'"$DEF_ID"'",
  "initiatorId":"'"$DUMMY_USER_ID"'",
  "title":"Task test workflow instance",
  "priority":"NORMAL"
}')
INST3_ID=$(echo "$INST3_RESULT" | jq -r '.data.id')

# 4a. POST - Create task
echo "  Creating task..."
TASK_RESULT=$(curl -s -X POST "$GW/api/workflows/tasks" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "instanceId":"'"$INST3_ID"'",
  "assigneeId":"'"$DUMMY_USER_ID"'",
  "taskType":"REVIEW",
  "title":"Review leave request documentation",
  "description":"Manager to review submitted leave request and supporting documents",
  "priority":"HIGH",
  "dueDate":"2026-02-20"
}')
TASK_SUCCESS=$(echo "$TASK_RESULT" | jq -r '.success')
TASK_ID=$(echo "$TASK_RESULT" | jq -r '.data.id')
TASK_NUM=$(echo "$TASK_RESULT" | jq -r '.data.taskNumber')
assert "POST /tasks - success" "true" "$TASK_SUCCESS"
assert_contains "POST /tasks - has task number" "TSK-" "$TASK_NUM"
assert "POST /tasks - status PENDING" "PENDING" "$(echo "$TASK_RESULT" | jq -r '.data.status')"
assert "POST /tasks - priority HIGH" "HIGH" "$(echo "$TASK_RESULT" | jq -r '.data.priority')"

# 4b. GET - List tasks
echo "  Listing tasks..."
LIST_RESULT=$(curl -s "$GW/api/workflows/tasks" -H "$AUTH")
assert "GET /tasks - success" "true" "$(echo "$LIST_RESULT" | jq -r '.success')"
assert "GET /tasks - has records" "true" "$(echo "$LIST_RESULT" | jq -r '(.data | length) > 0')"

# 4c. GET - Single task
echo "  Getting single task..."
GET_RESULT=$(curl -s "$GW/api/workflows/tasks/$TASK_ID" -H "$AUTH")
assert "GET /tasks/:id - success" "true" "$(echo "$GET_RESULT" | jq -r '.success')"
assert "GET /tasks/:id - correct title" "Review leave request documentation" "$(echo "$GET_RESULT" | jq -r '.data.title')"

# 4d. PUT - Claim task
echo "  Claiming task..."
CLAIM_RESULT=$(curl -s -X PUT "$GW/api/workflows/tasks/$TASK_ID/claim" -H "$AUTH" -H "Content-Type: application/json" -d '{"userId":"'"$DUMMY_USER_ID"'"}')
assert "PUT /tasks/:id/claim - success" "true" "$(echo "$CLAIM_RESULT" | jq -r '.success')"
assert "PUT /tasks/:id/claim - status IN_PROGRESS" "IN_PROGRESS" "$(echo "$CLAIM_RESULT" | jq -r '.data.status')"
assert "PUT /tasks/:id/claim - startedAt set" "true" "$(echo "$CLAIM_RESULT" | jq -r '.data.startedAt != null')"

# 4e. PUT - Complete task
echo "  Completing task..."
COMPLETE_RESULT=$(curl -s -X PUT "$GW/api/workflows/tasks/$TASK_ID/complete" -H "$AUTH" -H "Content-Type: application/json" -d '{"result":{"approved":true},"notes":"Leave request approved after review","completedBy":"'"$DUMMY_USER_ID"'"}')
assert "PUT /tasks/:id/complete - success" "true" "$(echo "$COMPLETE_RESULT" | jq -r '.success')"
assert "PUT /tasks/:id/complete - status COMPLETED" "COMPLETED" "$(echo "$COMPLETE_RESULT" | jq -r '.data.status')"
assert "PUT /tasks/:id/complete - completedAt set" "true" "$(echo "$COMPLETE_RESULT" | jq -r '.data.completedAt != null')"

# 4f. POST - Create second task for reassignment test
echo "  Creating second task for reassignment..."
TASK2_RESULT=$(curl -s -X POST "$GW/api/workflows/tasks" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "instanceId":"'"$INST3_ID"'",
  "assigneeId":"'"$DUMMY_USER_ID"'",
  "taskType":"APPROVE",
  "title":"Final approval for leave request",
  "priority":"NORMAL"
}')
TASK2_ID=$(echo "$TASK2_RESULT" | jq -r '.data.id')
REASSIGN_USER="00000000-0000-0000-0000-000000000002"

# 4g. PUT - Reassign task
echo "  Reassigning task..."
REASSIGN_RESULT=$(curl -s -X PUT "$GW/api/workflows/tasks/$TASK2_ID/reassign" -H "$AUTH" -H "Content-Type: application/json" -d '{"newAssigneeId":"'"$REASSIGN_USER"'","reason":"Original assignee on leave","reassignedBy":"'"$DUMMY_USER_ID"'"}')
assert "PUT /tasks/:id/reassign - success" "true" "$(echo "$REASSIGN_RESULT" | jq -r '.success')"
assert "PUT /tasks/:id/reassign - new assignee" "$REASSIGN_USER" "$(echo "$REASSIGN_RESULT" | jq -r '.data.assigneeId')"

# 4h. GET - Task stats
echo "  Getting task stats..."
STATS_RESULT=$(curl -s "$GW/api/workflows/tasks/stats/summary" -H "$AUTH")
assert "GET /tasks/stats/summary - success" "true" "$(echo "$STATS_RESULT" | jq -r '.success')"
assert "GET /tasks/stats/summary - has byStatus" "true" "$(echo "$STATS_RESULT" | jq -r '.data.byStatus != null')"

# 4i. Filter by status
FILTER_RESULT=$(curl -s "$GW/api/workflows/tasks?status=COMPLETED" -H "$AUTH")
assert "GET /tasks?status filter" "true" "$(echo "$FILTER_RESULT" | jq -r '.success')"

# 4j. Validation error
VAL_RESULT=$(curl -s -X POST "$GW/api/workflows/tasks" -H "$AUTH" -H "Content-Type: application/json" -d '{"title":"Test"}')
assert "POST /tasks - validation error (missing required)" "VALIDATION_ERROR" "$(echo "$VAL_RESULT" | jq -r '.error.code')"

# 4k. 404
NOT_FOUND=$(curl -s "$GW/api/workflows/tasks/nonexistent-id" -H "$AUTH")
assert "GET /tasks/:id - 404" "NOT_FOUND" "$(echo "$NOT_FOUND" | jq -r '.error.code')"

echo ""

# ─────────────────────────────────────────────
echo "5. APPROVALS MODULE"
echo "─────────────────────────────────────────"

# 5a. POST - Create approval chain
echo "  Creating approval chain..."
CHAIN_RESULT=$(curl -s -X POST "$GW/api/workflows/approvals/chains" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "name":"Standard Leave Approval Chain",
  "description":"Sequential approval chain for standard leave requests",
  "chainType":"SEQUENTIAL",
  "levels":[
    {"level":1,"role":"line_manager","required":true},
    {"level":2,"role":"hr_admin","required":true}
  ],
  "escalationConfig":{"timeoutHours":48,"escalateTo":"department_head"}
}')
CHAIN_SUCCESS=$(echo "$CHAIN_RESULT" | jq -r '.success')
CHAIN_ID=$(echo "$CHAIN_RESULT" | jq -r '.data.id')
assert "POST /approvals/chains - success" "true" "$CHAIN_SUCCESS"
assert "POST /approvals/chains - correct type" "SEQUENTIAL" "$(echo "$CHAIN_RESULT" | jq -r '.data.chainType')"

# 5b. GET - List chains
echo "  Listing approval chains..."
LIST_RESULT=$(curl -s "$GW/api/workflows/approvals/chains" -H "$AUTH")
assert "GET /approvals/chains - success" "true" "$(echo "$LIST_RESULT" | jq -r '.success')"
assert "GET /approvals/chains - has records" "true" "$(echo "$LIST_RESULT" | jq -r '(.data | length) > 0')"

# 5c. GET - Single chain
echo "  Getting single chain..."
GET_RESULT=$(curl -s "$GW/api/workflows/approvals/chains/$CHAIN_ID" -H "$AUTH")
assert "GET /approvals/chains/:id - success" "true" "$(echo "$GET_RESULT" | jq -r '.success')"
assert "GET /approvals/chains/:id - correct name" "Standard Leave Approval Chain" "$(echo "$GET_RESULT" | jq -r '.data.name')"

# 5d. PUT - Update chain
echo "  Updating chain..."
PUT_RESULT=$(curl -s -X PUT "$GW/api/workflows/approvals/chains/$CHAIN_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{"description":"Updated sequential approval chain for leave requests","isActive":true}')
assert "PUT /approvals/chains/:id - success" "true" "$(echo "$PUT_RESULT" | jq -r '.success')"

# 5e. POST - Create approval request
echo "  Creating approval request..."
REQ_RESULT=$(curl -s -X POST "$GW/api/workflows/approvals/requests" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "title":"Annual Leave Request - 5 days March 2026",
  "description":"Requesting 5 days annual leave from 1 March to 5 March 2026",
  "requestType":"LEAVE_REQUEST",
  "priority":"NORMAL",
  "requesterId":"'"$DUMMY_USER_ID"'",
  "requesterName":"John Smith",
  "entityType":"LEAVE",
  "approvalChainId":"'"$CHAIN_ID"'",
  "totalLevels":2
}')
REQ_SUCCESS=$(echo "$REQ_RESULT" | jq -r '.success')
REQ_ID=$(echo "$REQ_RESULT" | jq -r '.data.id')
REQ_NUM=$(echo "$REQ_RESULT" | jq -r '.data.requestNumber')
assert "POST /approvals/requests - success" "true" "$REQ_SUCCESS"
assert_contains "POST /approvals/requests - has request number" "APR-" "$REQ_NUM"
assert "POST /approvals/requests - status PENDING" "PENDING" "$(echo "$REQ_RESULT" | jq -r '.data.status')"

# 5f. GET - List requests
echo "  Listing approval requests..."
LIST_RESULT=$(curl -s "$GW/api/workflows/approvals/requests" -H "$AUTH")
assert "GET /approvals/requests - success" "true" "$(echo "$LIST_RESULT" | jq -r '.success')"
assert "GET /approvals/requests - has records" "true" "$(echo "$LIST_RESULT" | jq -r '(.data | length) > 0')"

# 5g. GET - Single request
echo "  Getting single request..."
GET_RESULT=$(curl -s "$GW/api/workflows/approvals/requests/$REQ_ID" -H "$AUTH")
assert "GET /approvals/requests/:id - success" "true" "$(echo "$GET_RESULT" | jq -r '.success')"
assert "GET /approvals/requests/:id - correct title" "Annual Leave Request - 5 days March 2026" "$(echo "$GET_RESULT" | jq -r '.data.title')"

# 5h. PUT - Respond to approval (approve level 1)
echo "  Responding to approval (level 1 approve)..."
RESP_RESULT=$(curl -s -X PUT "$GW/api/workflows/approvals/requests/$REQ_ID/respond" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "approverId":"'"$DUMMY_USER_ID"'",
  "approverName":"Manager Smith",
  "approverRole":"line_manager",
  "decision":"APPROVED",
  "comments":"Approved. Team coverage confirmed."
}')
assert "PUT /approvals/requests/:id/respond - success" "true" "$(echo "$RESP_RESULT" | jq -r '.success')"
assert "PUT /approvals/requests/:id/respond - status IN_REVIEW (multi-level)" "IN_REVIEW" "$(echo "$RESP_RESULT" | jq -r '.data.requestStatus')"

# 5i. PUT - Respond to approval (approve level 2 - final)
echo "  Responding to approval (level 2 approve - final)..."
RESP2_RESULT=$(curl -s -X PUT "$GW/api/workflows/approvals/requests/$REQ_ID/respond" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "approverId":"00000000-0000-0000-0000-000000000003",
  "approverName":"HR Admin",
  "approverRole":"hr_admin",
  "decision":"APPROVED",
  "comments":"HR approved. Leave balance sufficient."
}')
assert "PUT /approvals/requests/:id/respond (level 2) - success" "true" "$(echo "$RESP2_RESULT" | jq -r '.success')"
assert "PUT /approvals/requests/:id/respond (level 2) - final APPROVED" "APPROVED" "$(echo "$RESP2_RESULT" | jq -r '.data.requestStatus')"

# 5j. POST - Create second request for rejection test
echo "  Creating second request for rejection test..."
REQ2_RESULT=$(curl -s -X POST "$GW/api/workflows/approvals/requests" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "title":"Expense Claim - Conference Travel",
  "requestType":"EXPENSE_CLAIM",
  "priority":"HIGH",
  "requesterId":"'"$DUMMY_USER_ID"'",
  "totalLevels":1
}')
REQ2_ID=$(echo "$REQ2_RESULT" | jq -r '.data.id')

# 5k. PUT - Reject request
echo "  Rejecting request..."
REJECT_RESULT=$(curl -s -X PUT "$GW/api/workflows/approvals/requests/$REQ2_ID/respond" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "approverId":"'"$DUMMY_USER_ID"'",
  "decision":"REJECTED",
  "comments":"Budget exceeded for this quarter"
}')
assert "PUT /approvals/requests/:id/respond reject - success" "true" "$(echo "$REJECT_RESULT" | jq -r '.success')"
assert "PUT /approvals/requests/:id/respond reject - status REJECTED" "REJECTED" "$(echo "$REJECT_RESULT" | jq -r '.data.requestStatus')"

# 5l. GET - Approval stats
echo "  Getting approval stats..."
STATS_RESULT=$(curl -s "$GW/api/workflows/approvals/stats" -H "$AUTH")
assert "GET /approvals/stats - success" "true" "$(echo "$STATS_RESULT" | jq -r '.success')"

# 5m. Filter by status
FILTER_RESULT=$(curl -s "$GW/api/workflows/approvals/requests?status=APPROVED" -H "$AUTH")
assert "GET /approvals/requests?status filter" "true" "$(echo "$FILTER_RESULT" | jq -r '.success')"

# 5n. Validation error
VAL_RESULT=$(curl -s -X POST "$GW/api/workflows/approvals/chains" -H "$AUTH" -H "Content-Type: application/json" -d '{"name":"Test"}')
assert "POST /approvals/chains - validation error (missing required)" "VALIDATION_ERROR" "$(echo "$VAL_RESULT" | jq -r '.error.code')"

# 5o. 404
NOT_FOUND=$(curl -s "$GW/api/workflows/approvals/chains/nonexistent-id" -H "$AUTH")
assert "GET /approvals/chains/:id - 404" "NOT_FOUND" "$(echo "$NOT_FOUND" | jq -r '.error.code')"

echo ""

# ─────────────────────────────────────────────
echo "6. AUTOMATION MODULE"
echo "─────────────────────────────────────────"

# 6a. POST - Create automation rule
echo "  Creating automation rule..."
RULE_RESULT=$(curl -s -X POST "$GW/api/workflows/automation/rules" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "name":"Auto-escalate overdue leave requests",
  "description":"Automatically escalate leave requests pending approval for more than 48 hours",
  "code":"ESCALATE_OVERDUE_LEAVE",
  "triggerType":"SCHEDULED",
  "triggerSchedule":"0 9 * * *",
  "actionType":"ESCALATE",
  "actionConfig":{"escalateTo":"department_head","notifyHR":true,"message":"Leave request pending >48h"},
  "entityType":"LEAVE_REQUEST",
  "workflowCategory":"HR",
  "priority":50,
  "maxRetries":3,
  "retryDelaySeconds":120,
  "timeoutSeconds":60,
  "isActive":true
}')
RULE_SUCCESS=$(echo "$RULE_RESULT" | jq -r '.success')
RULE_ID=$(echo "$RULE_RESULT" | jq -r '.data.id')
assert "POST /automation/rules - success" "true" "$RULE_SUCCESS"
assert "POST /automation/rules - correct code" "ESCALATE_OVERDUE_LEAVE" "$(echo "$RULE_RESULT" | jq -r '.data.code')"
assert "POST /automation/rules - isActive true" "true" "$(echo "$RULE_RESULT" | jq -r '.data.isActive')"

# 6b. GET - List rules
echo "  Listing automation rules..."
LIST_RESULT=$(curl -s "$GW/api/workflows/automation/rules" -H "$AUTH")
assert "GET /automation/rules - success" "true" "$(echo "$LIST_RESULT" | jq -r '.success')"
assert "GET /automation/rules - has records" "true" "$(echo "$LIST_RESULT" | jq -r '(.data | length) > 0')"

# 6c. GET - Single rule
echo "  Getting single rule..."
GET_RESULT=$(curl -s "$GW/api/workflows/automation/rules/$RULE_ID" -H "$AUTH")
assert "GET /automation/rules/:id - success" "true" "$(echo "$GET_RESULT" | jq -r '.success')"
assert "GET /automation/rules/:id - correct name" "Auto-escalate overdue leave requests" "$(echo "$GET_RESULT" | jq -r '.data.name')"

# 6d. PUT - Update rule
echo "  Updating rule..."
PUT_RESULT=$(curl -s -X PUT "$GW/api/workflows/automation/rules/$RULE_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{"description":"Updated: Escalate leave requests pending >48h to department head","priority":75}')
assert "PUT /automation/rules/:id - success" "true" "$(echo "$PUT_RESULT" | jq -r '.success')"
assert "PUT /automation/rules/:id - priority updated" "75" "$(echo "$PUT_RESULT" | jq -r '.data.priority')"

# 6e. POST - Execute rule manually
echo "  Executing rule manually..."
EXEC_RESULT=$(curl -s -X POST "$GW/api/workflows/automation/rules/$RULE_ID/execute" -H "$AUTH" -H "Content-Type: application/json" -d '{"triggerData":{"reason":"manual test"},"entityType":"LEAVE_REQUEST"}')
assert "POST /automation/rules/:id/execute - success" "true" "$(echo "$EXEC_RESULT" | jq -r '.success')"
assert "POST /automation/rules/:id/execute - status COMPLETED" "COMPLETED" "$(echo "$EXEC_RESULT" | jq -r '.data.status')"

# 6f. GET - Execution history
echo "  Getting execution history..."
EXEC_LIST=$(curl -s "$GW/api/workflows/automation/executions" -H "$AUTH")
assert "GET /automation/executions - success" "true" "$(echo "$EXEC_LIST" | jq -r '.success')"
assert "GET /automation/executions - has records" "true" "$(echo "$EXEC_LIST" | jq -r '(.data | length) > 0')"

EXEC_ID=$(echo "$EXEC_LIST" | jq -r '.data[0].id')

# 6g. GET - Single execution
echo "  Getting single execution..."
EXEC_GET=$(curl -s "$GW/api/workflows/automation/executions/$EXEC_ID" -H "$AUTH")
assert "GET /automation/executions/:id - success" "true" "$(echo "$EXEC_GET" | jq -r '.success')"

# 6h. POST - Duplicate code error
echo "  Testing duplicate code..."
DUP_RESULT=$(curl -s -X POST "$GW/api/workflows/automation/rules" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "name":"Duplicate rule",
  "code":"ESCALATE_OVERDUE_LEAVE",
  "triggerType":"EVENT",
  "actionType":"SEND_NOTIFICATION",
  "actionConfig":{}
}')
assert "POST /automation/rules - duplicate code error" "DUPLICATE" "$(echo "$DUP_RESULT" | jq -r '.error.code')"

# 6i. Filter by triggerType
FILTER_RESULT=$(curl -s "$GW/api/workflows/automation/rules?triggerType=SCHEDULED" -H "$AUTH")
assert "GET /automation/rules?triggerType filter" "true" "$(echo "$FILTER_RESULT" | jq -r '.success')"
assert "GET /automation/rules?triggerType filter - has results" "true" "$(echo "$FILTER_RESULT" | jq -r '(.data | length) > 0')"

# 6j. GET - Automation stats
echo "  Getting automation stats..."
STATS_RESULT=$(curl -s "$GW/api/workflows/automation/stats" -H "$AUTH")
assert "GET /automation/stats - success" "true" "$(echo "$STATS_RESULT" | jq -r '.success')"
assert "GET /automation/stats - has totalRules" "true" "$(echo "$STATS_RESULT" | jq -r '.data.totalRules != null')"

# 6k. Validation error
VAL_RESULT=$(curl -s -X POST "$GW/api/workflows/automation/rules" -H "$AUTH" -H "Content-Type: application/json" -d '{"name":"Test"}')
assert "POST /automation/rules - validation error (missing required)" "VALIDATION_ERROR" "$(echo "$VAL_RESULT" | jq -r '.error.code')"

# 6l. 404
NOT_FOUND=$(curl -s "$GW/api/workflows/automation/rules/nonexistent-id" -H "$AUTH")
assert "GET /automation/rules/:id - 404" "NOT_FOUND" "$(echo "$NOT_FOUND" | jq -r '.error.code')"

echo ""

# ─────────────────────────────────────────────
echo "7. GATEWAY PROXY VERIFICATION"
echo "─────────────────────────────────────────"

echo "  Testing all routes through gateway..."
for ROUTE in templates definitions instances tasks; do
  RESULT=$(curl -s "$GW/api/workflows/$ROUTE" -H "$AUTH")
  assert "Gateway /api/workflows/$ROUTE" "true" "$(echo "$RESULT" | jq -r '.success')"
done

RESULT=$(curl -s "$GW/api/workflows/approvals/chains" -H "$AUTH")
assert "Gateway /api/workflows/approvals/chains" "true" "$(echo "$RESULT" | jq -r '.success')"

RESULT=$(curl -s "$GW/api/workflows/approvals/requests" -H "$AUTH")
assert "Gateway /api/workflows/approvals/requests" "true" "$(echo "$RESULT" | jq -r '.success')"

RESULT=$(curl -s "$GW/api/workflows/automation/rules" -H "$AUTH")
assert "Gateway /api/workflows/automation/rules" "true" "$(echo "$RESULT" | jq -r '.success')"

echo ""

# ─────────────────────────────────────────────
echo "8. DELETE OPERATIONS"
echo "─────────────────────────────────────────"

# Delete automation rule
DEL_RULE=$(curl -s -X DELETE "$GW/api/workflows/automation/rules/$RULE_ID" -H "$AUTH")
assert "DELETE /automation/rules/:id" "true" "$(echo "$DEL_RULE" | jq -r '.success')"

# Delete approval chain
DEL_CHAIN=$(curl -s -X DELETE "$GW/api/workflows/approvals/chains/$CHAIN_ID" -H "$AUTH")
assert "DELETE /approvals/chains/:id" "true" "$(echo "$DEL_CHAIN" | jq -r '.success')"

# Archive the clone definition (no delete endpoint, use archive)
ARCH_CLONE=$(curl -s -X PUT "$GW/api/workflows/definitions/$CLONE_ID/archive" -H "$AUTH")
assert "PUT /definitions/:id/archive (cleanup clone)" "true" "$(echo "$ARCH_CLONE" | jq -r '.success')"
assert "PUT /definitions/:id/archive - status ARCHIVED" "ARCHIVED" "$(echo "$ARCH_CLONE" | jq -r '.data.status')"

# Verify deleted rule returns 404
VERIFY_404=$(curl -s "$GW/api/workflows/automation/rules/$RULE_ID" -H "$AUTH")
assert "Deleted rule returns 404" "NOT_FOUND" "$(echo "$VERIFY_404" | jq -r '.error.code')"

echo ""
echo "============================================"
echo "  RESULTS: $PASS passed, $FAIL failed (out of $TOTAL)"
echo "============================================"

if [ $FAIL -gt 0 ]; then
  exit 1
fi
