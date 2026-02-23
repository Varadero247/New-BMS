#!/bin/bash
# Comprehensive test script for Complaints modules
# Tests: Complaints, Actions, Communications, Dashboard

API="http://localhost:4032"
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
echo "  Complaints Modules - Comprehensive Test Suite"
echo "============================================"
echo ""

# ─────────────────────────────────────────────
echo "1. COMPLAINTS MODULE"
echo "─────────────────────────────────────────"

# 1a. POST - Create complaint
echo "  Creating complaint..."
CMP_RESULT=$(curl -s -X POST "$API/api/complaints" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "title": "Defective product delivered - batch 2026-A12",
  "description": "Customer received a batch of products with visible defects including cracks and incorrect labelling. Approximately 200 units affected.",
  "channel": "EMAIL",
  "category": "PRODUCT",
  "priority": "HIGH",
  "status": "NEW",
  "complainantName": "John Walker",
  "complainantEmail": "john.walker@customer.com",
  "complainantPhone": "+44 7700 900123",
  "department": "Quality Assurance",
  "productRef": "PROD-2026-A12",
  "orderRef": "ORD-2026-0089",
  "notes": "Customer is requesting full replacement of the batch"
}')
CMP_SUCCESS=$(echo "$CMP_RESULT" | jq -r '.success')
CMP_ID=$(echo "$CMP_RESULT" | jq -r '.data.id')
CMP_REF=$(echo "$CMP_RESULT" | jq -r '.data.referenceNumber')
assert "POST /complaints - success" "true" "$CMP_SUCCESS"
assert_contains "POST /complaints - has ref number" "CMP-" "$CMP_REF"
assert "POST /complaints - status is NEW" "NEW" "$(echo "$CMP_RESULT" | jq -r '.data.status')"
assert "POST /complaints - priority is HIGH" "HIGH" "$(echo "$CMP_RESULT" | jq -r '.data.priority')"
assert "POST /complaints - channel EMAIL" "EMAIL" "$(echo "$CMP_RESULT" | jq -r '.data.channel')"

# 1b. POST - Create regulatory complaint
echo "  Creating regulatory complaint..."
CMP2_RESULT=$(curl -s -X POST "$API/api/complaints" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "title": "Noise level breach reported to HSE",
  "description": "Regulatory complaint filed with the Health and Safety Executive regarding sustained noise levels above 85dB in production area",
  "channel": "LETTER",
  "category": "REGULATORY",
  "priority": "CRITICAL",
  "status": "ACKNOWLEDGED",
  "isRegulatory": true,
  "regulatoryBody": "HSE",
  "complainantName": "HSE Inspector",
  "department": "Operations"
}')
CMP2_ID=$(echo "$CMP2_RESULT" | jq -r '.data.id')
assert "POST /complaints - regulatory success" "true" "$(echo "$CMP2_RESULT" | jq -r '.success')"
assert "POST /complaints - isRegulatory true" "true" "$(echo "$CMP2_RESULT" | jq -r '.data.isRegulatory')"
assert "POST /complaints - regulatoryBody correct" "HSE" "$(echo "$CMP2_RESULT" | jq -r '.data.regulatoryBody')"

# 1c. GET - List complaints
echo "  Listing complaints..."
LIST_RESULT=$(curl -s "$API/api/complaints" -H "$AUTH")
assert "GET /complaints - success" "true" "$(echo "$LIST_RESULT" | jq -r '.success')"
assert "GET /complaints - has pagination" "true" "$(echo "$LIST_RESULT" | jq -r '.pagination != null')"
CMP_COUNT=$(echo "$LIST_RESULT" | jq -r '.data | length')
assert "GET /complaints - has records" "true" "$([ "$CMP_COUNT" -gt 0 ] && echo true || echo false)"

# 1d. GET - Single complaint
echo "  Getting single complaint..."
GET_RESULT=$(curl -s "$API/api/complaints/$CMP_ID" -H "$AUTH")
assert "GET /complaints/:id - success" "true" "$(echo "$GET_RESULT" | jq -r '.success')"
assert "GET /complaints/:id - correct title" "Defective product delivered - batch 2026-A12" "$(echo "$GET_RESULT" | jq -r '.data.title')"
assert "GET /complaints/:id - complainantEmail correct" "john.walker@customer.com" "$(echo "$GET_RESULT" | jq -r '.data.complainantEmail')"

# 1e. PUT - Update complaint status to INVESTIGATING
echo "  Updating complaint..."
PUT_RESULT=$(curl -s -X PUT "$API/api/complaints/$CMP_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "status": "INVESTIGATING",
  "assignee": "qa-manager@ims.local",
  "assigneeName": "QA Manager",
  "notes": "Investigation initiated. Production line halted pending inspection."
}')
assert "PUT /complaints/:id - success" "true" "$(echo "$PUT_RESULT" | jq -r '.success')"
assert "PUT /complaints/:id - status INVESTIGATING" "INVESTIGATING" "$(echo "$PUT_RESULT" | jq -r '.data.status')"
assert "PUT /complaints/:id - assigneeName correct" "QA Manager" "$(echo "$PUT_RESULT" | jq -r '.data.assigneeName')"

# 1f. PUT - Resolve complaint
echo "  Resolving complaint..."
RESOLVE_RESULT=$(curl -s -X PUT "$API/api/complaints/$CMP_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "status": "RESOLVED",
  "rootCause": "Calibration drift in quality inspection equipment caused defects to pass QC checks",
  "resolution": "Full replacement batch shipped. Equipment recalibrated. SOP updated.",
  "preventiveAction": "Weekly calibration checks implemented. Staff retrained.",
  "customerSatisfied": true
}')
assert "PUT /complaints/:id - resolved success" "true" "$(echo "$RESOLVE_RESULT" | jq -r '.success')"
assert "PUT /complaints/:id - status RESOLVED" "RESOLVED" "$(echo "$RESOLVE_RESULT" | jq -r '.data.status')"
assert "PUT /complaints/:id - customerSatisfied true" "true" "$(echo "$RESOLVE_RESULT" | jq -r '.data.customerSatisfied')"

# 1g. GET - Filter by status
echo "  Filtering complaints..."
FILTER_STATUS=$(curl -s "$API/api/complaints?status=RESOLVED" -H "$AUTH")
assert "GET /complaints?status=RESOLVED" "true" "$(echo "$FILTER_STATUS" | jq -r '.success')"
assert "GET /complaints?status - finds result" "true" "$(echo "$FILTER_STATUS" | jq -r '(.data | length) > 0')"

# 1h. GET - Search complaints
SEARCH_RESULT=$(curl -s "$API/api/complaints?search=Defective" -H "$AUTH")
assert "GET /complaints?search - success" "true" "$(echo "$SEARCH_RESULT" | jq -r '.success')"
assert "GET /complaints?search - finds result" "true" "$(echo "$SEARCH_RESULT" | jq -r '(.data | length) > 0')"

# 1i. Validation error - missing title
VAL_RESULT=$(curl -s -X POST "$API/api/complaints" -H "$AUTH" -H "Content-Type: application/json" -d '{"description":"no title"}')
assert "POST /complaints - validation error" "VALIDATION_ERROR" "$(echo "$VAL_RESULT" | jq -r '.error.code')"

# 1j. 404 not found
NOT_FOUND=$(curl -s "$API/api/complaints/00000000-0000-0000-0000-000000000999" -H "$AUTH")
assert "GET /complaints/:id - 404" "NOT_FOUND" "$(echo "$NOT_FOUND" | jq -r '.error.code')"

echo ""

# ─────────────────────────────────────────────
echo "2. ACTIONS MODULE"
echo "─────────────────────────────────────────"

# 2a. POST - Create action
echo "  Creating action..."
ACT_RESULT=$(curl -s -X POST "$API/api/actions" -H "$AUTH" -H "Content-Type: application/json" -d "{
  \"complaintId\": \"$CMP_ID\",
  \"action\": \"Replace defective batch with new shipment from corrected production run\",
  \"assignee\": \"logistics@ims.local\",
  \"dueDate\": \"2026-02-28\",
  \"status\": \"OPEN\",
  \"notes\": \"Priority shipment to be arranged within 48 hours\"
}")
ACT_SUCCESS=$(echo "$ACT_RESULT" | jq -r '.success')
ACT_ID=$(echo "$ACT_RESULT" | jq -r '.data.id')
ACT_REF=$(echo "$ACT_RESULT" | jq -r '.data.referenceNumber')
assert "POST /actions - success" "true" "$ACT_SUCCESS"
assert_contains "POST /actions - has ref number" "CMA-" "$ACT_REF"
assert "POST /actions - linked to complaint" "$CMP_ID" "$(echo "$ACT_RESULT" | jq -r '.data.complaintId')"
assert "POST /actions - status OPEN" "OPEN" "$(echo "$ACT_RESULT" | jq -r '.data.status')"

# 2b. POST - Create second action
echo "  Creating second action..."
ACT2_RESULT=$(curl -s -X POST "$API/api/actions" -H "$AUTH" -H "Content-Type: application/json" -d "{
  \"complaintId\": \"$CMP_ID\",
  \"action\": \"Recalibrate all QC inspection equipment and document results\",
  \"assignee\": \"qa@ims.local\",
  \"dueDate\": \"2026-03-01\",
  \"status\": \"IN_PROGRESS\"
}")
ACT2_ID=$(echo "$ACT2_RESULT" | jq -r '.data.id')
assert "POST /actions - second action success" "true" "$(echo "$ACT2_RESULT" | jq -r '.success')"

# 2c. GET - List actions
echo "  Listing actions..."
ACT_LIST=$(curl -s "$API/api/actions" -H "$AUTH")
assert "GET /actions - success" "true" "$(echo "$ACT_LIST" | jq -r '.success')"
assert "GET /actions - has records" "true" "$(echo "$ACT_LIST" | jq -r '(.data | length) > 0')"

# 2d. GET - Single action
echo "  Getting single action..."
ACT_GET=$(curl -s "$API/api/actions/$ACT_ID" -H "$AUTH")
assert "GET /actions/:id - success" "true" "$(echo "$ACT_GET" | jq -r '.success')"
assert "GET /actions/:id - assignee correct" "logistics@ims.local" "$(echo "$ACT_GET" | jq -r '.data.assignee')"

# 2e. PUT - Complete action
echo "  Completing action..."
ACT_PUT=$(curl -s -X PUT "$API/api/actions/$ACT_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "status": "COMPLETED",
  "completedAt": "2026-02-25",
  "notes": "Replacement batch delivered and confirmed by customer. Customer satisfied."
}')
assert "PUT /actions/:id - success" "true" "$(echo "$ACT_PUT" | jq -r '.success')"
assert "PUT /actions/:id - status COMPLETED" "COMPLETED" "$(echo "$ACT_PUT" | jq -r '.data.status')"

# 2f. GET - Filter actions by status
ACT_FILTER=$(curl -s "$API/api/actions?status=COMPLETED" -H "$AUTH")
assert "GET /actions?status=COMPLETED" "true" "$(echo "$ACT_FILTER" | jq -r '.success')"

# 2g. Validation error - missing complaintId
VAL_ACT=$(curl -s -X POST "$API/api/actions" -H "$AUTH" -H "Content-Type: application/json" -d '{"action":"test action"}')
assert "POST /actions - validation error (missing complaintId)" "VALIDATION_ERROR" "$(echo "$VAL_ACT" | jq -r '.error.code')"

# 2h. 404 action
ACT_404=$(curl -s "$API/api/actions/00000000-0000-0000-0000-000000000999" -H "$AUTH")
assert "GET /actions/:id - 404" "NOT_FOUND" "$(echo "$ACT_404" | jq -r '.error.code')"

echo ""

# ─────────────────────────────────────────────
echo "3. COMMUNICATIONS MODULE"
echo "─────────────────────────────────────────"

# 3a. POST - Create inbound communication
echo "  Creating inbound communication..."
COM_RESULT=$(curl -s -X POST "$API/api/communications" -H "$AUTH" -H "Content-Type: application/json" -d "{
  \"complaintId\": \"$CMP_ID\",
  \"direction\": \"INBOUND\",
  \"channel\": \"EMAIL\",
  \"subject\": \"Re: Order ORD-2026-0089 - Defective Products\",
  \"content\": \"Dear Customer Services, I am writing to formally complain about the defective products received in my recent order. Please see attached photos showing the damage.\",
  \"sentAt\": \"2026-02-20T08:30:00\",
  \"sentBy\": \"John Walker\"
}")
COM_SUCCESS=$(echo "$COM_RESULT" | jq -r '.success')
COM_ID=$(echo "$COM_RESULT" | jq -r '.data.id')
COM_REF=$(echo "$COM_RESULT" | jq -r '.data.referenceNumber')
assert "POST /communications - success" "true" "$COM_SUCCESS"
assert_contains "POST /communications - has ref number" "CMC-" "$COM_REF"
assert "POST /communications - direction INBOUND" "INBOUND" "$(echo "$COM_RESULT" | jq -r '.data.direction')"
assert "POST /communications - linked to complaint" "$CMP_ID" "$(echo "$COM_RESULT" | jq -r '.data.complaintId')"

# 3b. POST - Create outbound response
echo "  Creating outbound communication..."
COM2_RESULT=$(curl -s -X POST "$API/api/communications" -H "$AUTH" -H "Content-Type: application/json" -d "{
  \"complaintId\": \"$CMP_ID\",
  \"direction\": \"OUTBOUND\",
  \"channel\": \"EMAIL\",
  \"subject\": \"Response to Your Complaint CMP-2026-0001\",
  \"content\": \"Dear Mr Walker, Thank you for bringing this to our attention. We sincerely apologise for the inconvenience. We are arranging an immediate replacement shipment.\",
  \"sentAt\": \"2026-02-20T14:00:00\",
  \"sentBy\": \"customer.services@ims.local\"
}")
COM2_ID=$(echo "$COM2_RESULT" | jq -r '.data.id')
assert "POST /communications - outbound success" "true" "$(echo "$COM2_RESULT" | jq -r '.success')"
assert "POST /communications - direction OUTBOUND" "OUTBOUND" "$(echo "$COM2_RESULT" | jq -r '.data.direction')"

# 3c. GET - List communications
echo "  Listing communications..."
COM_LIST=$(curl -s "$API/api/communications" -H "$AUTH")
assert "GET /communications - success" "true" "$(echo "$COM_LIST" | jq -r '.success')"
assert "GET /communications - has records" "true" "$(echo "$COM_LIST" | jq -r '(.data | length) > 0')"

# 3d. GET - Single communication
echo "  Getting single communication..."
COM_GET=$(curl -s "$API/api/communications/$COM_ID" -H "$AUTH")
assert "GET /communications/:id - success" "true" "$(echo "$COM_GET" | jq -r '.success')"
assert "GET /communications/:id - subject correct" "Re: Order ORD-2026-0089 - Defective Products" "$(echo "$COM_GET" | jq -r '.data.subject')"

# 3e. PUT - Update communication
echo "  Updating communication..."
COM_PUT=$(curl -s -X PUT "$API/api/communications/$COM_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "content": "Dear Customer Services, I am writing to formally complain about the defective products received. Please see attached photos. I expect a full replacement within 3 business days."
}')
assert "PUT /communications/:id - success" "true" "$(echo "$COM_PUT" | jq -r '.success')"
assert_contains "PUT /communications/:id - content updated" "3 business days" "$(echo "$COM_PUT" | jq -r '.data.content')"

# 3f. GET - Search communications
SEARCH_COM=$(curl -s "$API/api/communications?search=Order+ORD" -H "$AUTH")
assert "GET /communications?search - success" "true" "$(echo "$SEARCH_COM" | jq -r '.success')"

# 3g. Validation error - missing complaintId
VAL_COM=$(curl -s -X POST "$API/api/communications" -H "$AUTH" -H "Content-Type: application/json" -d '{"subject":"test"}')
assert "POST /communications - validation error (missing complaintId)" "VALIDATION_ERROR" "$(echo "$VAL_COM" | jq -r '.error.code')"

# 3h. 404 communication
COM_404=$(curl -s "$API/api/communications/00000000-0000-0000-0000-000000000999" -H "$AUTH")
assert "GET /communications/:id - 404" "NOT_FOUND" "$(echo "$COM_404" | jq -r '.error.code')"

echo ""

# ─────────────────────────────────────────────
echo "4. DASHBOARD MODULE"
echo "─────────────────────────────────────────"

# 4a. Get stats
echo "  Getting dashboard stats..."
STATS=$(curl -s "$API/api/dashboard/stats" -H "$AUTH")
assert "GET /dashboard/stats - success" "true" "$(echo "$STATS" | jq -r '.success')"
assert "GET /dashboard/stats - has totalComplaints" "true" "$(echo "$STATS" | jq -r '.data.totalComplaints != null')"
assert "GET /dashboard/stats - has totalActions" "true" "$(echo "$STATS" | jq -r '.data.totalActions != null')"
TOTAL_CMPS=$(echo "$STATS" | jq -r '.data.totalComplaints')
assert "GET /dashboard/stats - totalComplaints > 0" "true" "$([ "$TOTAL_CMPS" -gt 0 ] && echo true || echo false)"

echo ""

# ─────────────────────────────────────────────
echo "5. GATEWAY PROXY"
echo "─────────────────────────────────────────"

echo "  Testing routes through gateway..."
for ROUTE in complaints actions communications; do
  RESULT=$(curl -s "$GW/api/complaints/$ROUTE" -H "$AUTH")
  assert "Gateway /api/complaints/$ROUTE" "true" "$(echo "$RESULT" | jq -r '.success')"
done

echo ""

# ─────────────────────────────────────────────
echo "6. DELETE OPERATIONS"
echo "─────────────────────────────────────────"

echo "  Deleting test records..."
DEL_COM=$(curl -s -X DELETE "$API/api/communications/$COM_ID" -H "$AUTH")
assert "DELETE /communications/:id" "true" "$(echo "$DEL_COM" | jq -r '.success')"

DEL_COM2=$(curl -s -X DELETE "$API/api/communications/$COM2_ID" -H "$AUTH")
assert "DELETE /communications/:id (second)" "true" "$(echo "$DEL_COM2" | jq -r '.success')"

DEL_ACT=$(curl -s -X DELETE "$API/api/actions/$ACT_ID" -H "$AUTH")
assert "DELETE /actions/:id" "true" "$(echo "$DEL_ACT" | jq -r '.success')"

DEL_ACT2=$(curl -s -X DELETE "$API/api/actions/$ACT2_ID" -H "$AUTH")
assert "DELETE /actions/:id (second)" "true" "$(echo "$DEL_ACT2" | jq -r '.success')"

DEL_CMP=$(curl -s -X DELETE "$API/api/complaints/$CMP_ID" -H "$AUTH")
assert "DELETE /complaints/:id" "true" "$(echo "$DEL_CMP" | jq -r '.success')"

DEL_CMP2=$(curl -s -X DELETE "$API/api/complaints/$CMP2_ID" -H "$AUTH")
assert "DELETE /complaints/:id (second)" "true" "$(echo "$DEL_CMP2" | jq -r '.success')"

VERIFY_404=$(curl -s "$API/api/complaints/$CMP_ID" -H "$AUTH")
assert "Deleted complaint returns 404" "NOT_FOUND" "$(echo "$VERIFY_404" | jq -r '.error.code')"

echo ""
echo "============================================"
echo "  RESULTS: $PASS passed, $FAIL failed (out of $TOTAL)"
echo "============================================"

if [ $FAIL -gt 0 ]; then
  exit 1
fi
