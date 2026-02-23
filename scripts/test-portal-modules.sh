#!/bin/bash
# Comprehensive test script for Portal modules
# Tests: Portal Users, Announcements, Tickets, Customer Complaints — CRUD + Gateway

API="http://localhost:4018"
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
echo "  Portal Modules - Comprehensive Test Suite"
echo "============================================"
echo ""

# --------------------------------------------------
echo "1. AUTH CHECK"
echo "--------------------------------------------------"
AUTH_RESULT=$(curl -s "$API/api/portal/users" -H "$AUTH")
assert "Auth token accepted by Portal service" "true" "$(echo "$AUTH_RESULT" | jq -r '.success')"
echo ""

# --------------------------------------------------
echo "2. PORTAL USERS MODULE"
echo "--------------------------------------------------"

echo "  Creating customer portal user..."
USER1_RESULT=$(curl -s -X POST "$API/api/portal/users" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "email": "john.doe@customer-corp.example.com",
  "name": "John Doe",
  "company": "Customer Corp Ltd",
  "role": "CUSTOMER_ADMIN",
  "portalType": "CUSTOMER",
  "phone": "+44-7700-900100",
  "status": "ACTIVE"
}')
USER1_SUCCESS=$(echo "$USER1_RESULT" | jq -r '.success')
USER1_ID=$(echo "$USER1_RESULT" | jq -r '.data.id')
assert "POST /portal/users (customer) - success" "true" "$USER1_SUCCESS"
assert "POST /portal/users (customer) - name set" "John Doe" "$(echo "$USER1_RESULT" | jq -r '.data.name')"
assert "POST /portal/users (customer) - role CUSTOMER_ADMIN" "CUSTOMER_ADMIN" "$(echo "$USER1_RESULT" | jq -r '.data.role')"
assert "POST /portal/users (customer) - portalType CUSTOMER" "CUSTOMER" "$(echo "$USER1_RESULT" | jq -r '.data.portalType')"

echo "  Creating supplier portal user..."
USER2_RESULT=$(curl -s -X POST "$API/api/portal/users" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "email": "supplier.contact@acme-supply.example.com",
  "name": "Maria Garcia",
  "company": "Acme Supply Co",
  "role": "SUPPLIER_ADMIN",
  "portalType": "SUPPLIER",
  "status": "ACTIVE"
}')
USER2_ID=$(echo "$USER2_RESULT" | jq -r '.data.id')
assert "POST /portal/users (supplier) - success" "true" "$(echo "$USER2_RESULT" | jq -r '.success')"
assert "POST /portal/users (supplier) - portalType SUPPLIER" "SUPPLIER" "$(echo "$USER2_RESULT" | jq -r '.data.portalType')"

echo "  Listing portal users..."
USER_LIST=$(curl -s "$API/api/portal/users" -H "$AUTH")
assert "GET /portal/users - success" "true" "$(echo "$USER_LIST" | jq -r '.success')"
assert "GET /portal/users - has records" "true" "$(echo "$USER_LIST" | jq -r '(.data | length) > 0')"
assert "GET /portal/users - pagination present" "true" "$(echo "$USER_LIST" | jq -r '.pagination != null')"

echo "  Getting user by ID..."
USER_GET=$(curl -s "$API/api/portal/users/$USER1_ID" -H "$AUTH")
assert "GET /portal/users/:id - success" "true" "$(echo "$USER_GET" | jq -r '.success')"
assert "GET /portal/users/:id - correct email" "john.doe@customer-corp.example.com" "$(echo "$USER_GET" | jq -r '.data.email')"

echo "  Updating user..."
USER_PUT=$(curl -s -X PUT "$API/api/portal/users/$USER1_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "name": "John Doe - Updated",
  "phone": "+44-7700-900199"
}')
assert "PUT /portal/users/:id - success" "true" "$(echo "$USER_PUT" | jq -r '.success')"
assert "PUT /portal/users/:id - name updated" "John Doe - Updated" "$(echo "$USER_PUT" | jq -r '.data.name')"

echo "  Filtering portal users..."
TYPE_FILTER=$(curl -s "$API/api/portal/users?portalType=CUSTOMER" -H "$AUTH")
assert "GET /portal/users?portalType filter - success" "true" "$(echo "$TYPE_FILTER" | jq -r '.success')"

STATUS_FILTER=$(curl -s "$API/api/portal/users?status=ACTIVE" -H "$AUTH")
assert "GET /portal/users?status filter - success" "true" "$(echo "$STATUS_FILTER" | jq -r '.success')"

SEARCH_USER=$(curl -s "$API/api/portal/users?search=John" -H "$AUTH")
assert "GET /portal/users?search - success" "true" "$(echo "$SEARCH_USER" | jq -r '.success')"

VAL_USER=$(curl -s -X POST "$API/api/portal/users" -H "$AUTH" -H "Content-Type: application/json" -d '{"name":"Test User"}')
assert "POST /portal/users - validation error (missing email+company+role+portalType)" "VALIDATION_ERROR" "$(echo "$VAL_USER" | jq -r '.error.code')"

NOT_FOUND=$(curl -s "$API/api/portal/users/00000000-0000-0000-0000-000000000099" -H "$AUTH")
assert "GET /portal/users/:id - 404 for missing user" "NOT_FOUND" "$(echo "$NOT_FOUND" | jq -r '.error.code')"

echo ""

# --------------------------------------------------
echo "3. PORTAL ANNOUNCEMENTS MODULE"
echo "--------------------------------------------------"

echo "  Creating customer announcement..."
ANN1_RESULT=$(curl -s -X POST "$API/api/portal/announcements" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "title": "Scheduled Maintenance Window - Saturday 01 March 2026",
  "content": "The customer portal will be unavailable for scheduled maintenance on Saturday 1st March 2026 between 02:00 and 06:00 UTC. We apologise for any inconvenience.",
  "portalType": "CUSTOMER",
  "priority": "HIGH",
  "publishedAt": "2026-02-23",
  "expiresAt": "2026-03-02"
}')
ANN1_SUCCESS=$(echo "$ANN1_RESULT" | jq -r '.success')
ANN1_ID=$(echo "$ANN1_RESULT" | jq -r '.data.id')
assert "POST /portal/announcements (customer) - success" "true" "$ANN1_SUCCESS"
assert "POST /portal/announcements (customer) - title set" "Scheduled Maintenance Window - Saturday 01 March 2026" "$(echo "$ANN1_RESULT" | jq -r '.data.title')"
assert "POST /portal/announcements (customer) - portalType CUSTOMER" "CUSTOMER" "$(echo "$ANN1_RESULT" | jq -r '.data.portalType')"
assert "POST /portal/announcements (customer) - priority HIGH" "HIGH" "$(echo "$ANN1_RESULT" | jq -r '.data.priority')"

echo "  Creating supplier announcement..."
ANN2_RESULT=$(curl -s -X POST "$API/api/portal/announcements" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "title": "New ISO 9001:2015 Requirements for Supplier Documentation",
  "content": "Effective 1 April 2026, all supplier submissions must include updated quality certificates complying with ISO 9001:2015. Please review the updated requirements in the document library.",
  "portalType": "SUPPLIER",
  "priority": "MEDIUM",
  "publishedAt": "2026-02-23"
}')
ANN2_ID=$(echo "$ANN2_RESULT" | jq -r '.data.id')
assert "POST /portal/announcements (supplier) - success" "true" "$(echo "$ANN2_RESULT" | jq -r '.success')"
assert "POST /portal/announcements (supplier) - portalType SUPPLIER" "SUPPLIER" "$(echo "$ANN2_RESULT" | jq -r '.data.portalType')"

echo "  Listing announcements..."
ANN_LIST=$(curl -s "$API/api/portal/announcements" -H "$AUTH")
assert "GET /portal/announcements - success" "true" "$(echo "$ANN_LIST" | jq -r '.success')"
assert "GET /portal/announcements - has records" "true" "$(echo "$ANN_LIST" | jq -r '(.data | length) > 0')"

echo "  Getting announcement by ID..."
ANN_GET=$(curl -s "$API/api/portal/announcements/$ANN1_ID" -H "$AUTH")
assert "GET /portal/announcements/:id - success" "true" "$(echo "$ANN_GET" | jq -r '.success')"
assert "GET /portal/announcements/:id - correct title" "Scheduled Maintenance Window - Saturday 01 March 2026" "$(echo "$ANN_GET" | jq -r '.data.title')"

echo "  Updating announcement..."
ANN_PUT=$(curl -s -X PUT "$API/api/portal/announcements/$ANN1_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "priority": "MEDIUM",
  "content": "The customer portal will be unavailable on Saturday 1st March 2026 between 02:00 and 05:00 UTC (reduced window)."
}')
assert "PUT /portal/announcements/:id - success" "true" "$(echo "$ANN_PUT" | jq -r '.success')"
assert "PUT /portal/announcements/:id - priority updated" "MEDIUM" "$(echo "$ANN_PUT" | jq -r '.data.priority')"

TYPE_FILTER_ANN=$(curl -s "$API/api/portal/announcements?portalType=CUSTOMER" -H "$AUTH")
assert "GET /portal/announcements?portalType filter - success" "true" "$(echo "$TYPE_FILTER_ANN" | jq -r '.success')"

VAL_ANN=$(curl -s -X POST "$API/api/portal/announcements" -H "$AUTH" -H "Content-Type: application/json" -d '{"title":"Test"}')
assert "POST /portal/announcements - validation error (missing required fields)" "VALIDATION_ERROR" "$(echo "$VAL_ANN" | jq -r '.error.code')"

echo ""

# --------------------------------------------------
echo "4. PORTAL TICKETS MODULE"
echo "--------------------------------------------------"

echo "  Creating support ticket..."
TKT1_RESULT=$(curl -s -X POST "$API/api/portal/tickets" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "subject": "Unable to download invoice PDF",
  "description": "When I click the download button on invoice INV-2026-0042, I get an error message saying the file is unavailable. This has happened for the last 3 days.",
  "category": "TECHNICAL",
  "priority": "HIGH",
  "portalType": "CUSTOMER"
}')
TKT1_SUCCESS=$(echo "$TKT1_RESULT" | jq -r '.success')
TKT1_ID=$(echo "$TKT1_RESULT" | jq -r '.data.id')
assert "POST /portal/tickets (technical) - success" "true" "$TKT1_SUCCESS"
assert "POST /portal/tickets (technical) - subject set" "Unable to download invoice PDF" "$(echo "$TKT1_RESULT" | jq -r '.data.subject')"
assert "POST /portal/tickets (technical) - category TECHNICAL" "TECHNICAL" "$(echo "$TKT1_RESULT" | jq -r '.data.category')"
assert "POST /portal/tickets (technical) - status OPEN" "OPEN" "$(echo "$TKT1_RESULT" | jq -r '.data.status')"
assert_contains "POST /portal/tickets (technical) - has ticketNumber PTL-" "PTL-" "$(echo "$TKT1_RESULT" | jq -r '.data.ticketNumber')"

echo "  Creating quality ticket..."
TKT2_RESULT=$(curl -s -X POST "$API/api/portal/tickets" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "subject": "Defective batch received - Order #ORD-2026-0089",
  "description": "We received batch B2026-0089 on 20 Feb 2026. Approximately 15% of units have visible surface defects and do not meet specification. We need a formal NCR raised.",
  "category": "QUALITY",
  "priority": "HIGH",
  "portalType": "CUSTOMER"
}')
TKT2_ID=$(echo "$TKT2_RESULT" | jq -r '.data.id')
assert "POST /portal/tickets (quality) - success" "true" "$(echo "$TKT2_RESULT" | jq -r '.success')"
assert "POST /portal/tickets (quality) - category QUALITY" "QUALITY" "$(echo "$TKT2_RESULT" | jq -r '.data.category')"

echo "  Listing tickets..."
TKT_LIST=$(curl -s "$API/api/portal/tickets" -H "$AUTH")
assert "GET /portal/tickets - success" "true" "$(echo "$TKT_LIST" | jq -r '.success')"
assert "GET /portal/tickets - has records" "true" "$(echo "$TKT_LIST" | jq -r '(.data | length) > 0')"

echo "  Getting ticket by ID..."
TKT_GET=$(curl -s "$API/api/portal/tickets/$TKT1_ID" -H "$AUTH")
assert "GET /portal/tickets/:id - success" "true" "$(echo "$TKT_GET" | jq -r '.success')"
assert "GET /portal/tickets/:id - correct subject" "Unable to download invoice PDF" "$(echo "$TKT_GET" | jq -r '.data.subject')"

echo "  Updating ticket status..."
TKT_PUT=$(curl -s -X PUT "$API/api/portal/tickets/$TKT1_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "status": "IN_PROGRESS",
  "assignedTo": "00000000-0000-0000-0000-000000000001"
}')
assert "PUT /portal/tickets/:id - success" "true" "$(echo "$TKT_PUT" | jq -r '.success')"
assert "PUT /portal/tickets/:id - status IN_PROGRESS" "IN_PROGRESS" "$(echo "$TKT_PUT" | jq -r '.data.status')"

echo "  Adding message to ticket..."
MSG_RESULT=$(curl -s -X POST "$API/api/portal/tickets/$TKT1_ID/messages" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "message": "We are investigating the PDF download issue. Initial analysis suggests a CDN caching problem. We expect to resolve this within 2 hours.",
  "authorType": "INTERNAL_STAFF"
}')
assert "POST /portal/tickets/:id/messages - success" "true" "$(echo "$MSG_RESULT" | jq -r '.success')"
assert "POST /portal/tickets/:id/messages - authorType set" "INTERNAL_STAFF" "$(echo "$MSG_RESULT" | jq -r '.data.authorType')"

echo "  Getting ticket messages..."
MSG_LIST=$(curl -s "$API/api/portal/tickets/$TKT1_ID/messages" -H "$AUTH")
assert "GET /portal/tickets/:id/messages - success" "true" "$(echo "$MSG_LIST" | jq -r '.success')"
assert "GET /portal/tickets/:id/messages - has records" "true" "$(echo "$MSG_LIST" | jq -r '(.data | length) > 0')"

echo "  Filtering tickets..."
STATUS_TKT=$(curl -s "$API/api/portal/tickets?status=IN_PROGRESS" -H "$AUTH")
assert "GET /portal/tickets?status filter - success" "true" "$(echo "$STATUS_TKT" | jq -r '.success')"

CAT_TKT=$(curl -s "$API/api/portal/tickets?category=QUALITY" -H "$AUTH")
assert "GET /portal/tickets?category filter - success" "true" "$(echo "$CAT_TKT" | jq -r '.success')"

TYPE_TKT=$(curl -s "$API/api/portal/tickets?portalType=CUSTOMER" -H "$AUTH")
assert "GET /portal/tickets?portalType filter - success" "true" "$(echo "$TYPE_TKT" | jq -r '.success')"

VAL_TKT=$(curl -s -X POST "$API/api/portal/tickets" -H "$AUTH" -H "Content-Type: application/json" -d '{"subject":"Test"}')
assert "POST /portal/tickets - validation error (missing required fields)" "VALIDATION_ERROR" "$(echo "$VAL_TKT" | jq -r '.error.code')"

echo ""

# --------------------------------------------------
echo "5. CUSTOMER COMPLAINTS MODULE"
echo "--------------------------------------------------"

echo "  Submitting customer complaint..."
CMP_RESULT=$(curl -s -X POST "$API/api/customer/complaints" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "description": "The product delivered on 15 Feb 2026 (Order ORD-2026-0075) did not match the specification agreed in our contract. The surface finish was below the Ra 0.8 requirement specified.",
  "severity": "MAJOR"
}')
CMP_SUCCESS=$(echo "$CMP_RESULT" | jq -r '.success')
CMP_ID=$(echo "$CMP_RESULT" | jq -r '.data.id')
assert "POST /customer/complaints - success" "true" "$CMP_SUCCESS"
assert "POST /customer/complaints - severity MAJOR" "MAJOR" "$(echo "$CMP_RESULT" | jq -r '.data.severity')"
assert "POST /customer/complaints - status OPEN" "OPEN" "$(echo "$CMP_RESULT" | jq -r '.data.status')"
assert_contains "POST /customer/complaints - has referenceNumber PTL-CMP-" "PTL-CMP-" "$(echo "$CMP_RESULT" | jq -r '.data.referenceNumber')"

echo "  Submitting critical complaint..."
CMP2_RESULT=$(curl -s -X POST "$API/api/customer/complaints" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "description": "URGENT: Safety critical component batch recalled by manufacturer. We received affected components. Immediate action required.",
  "severity": "CRITICAL"
}')
CMP2_ID=$(echo "$CMP2_RESULT" | jq -r '.data.id')
assert "POST /customer/complaints (critical) - success" "true" "$(echo "$CMP2_RESULT" | jq -r '.success')"
assert "POST /customer/complaints (critical) - severity CRITICAL" "CRITICAL" "$(echo "$CMP2_RESULT" | jq -r '.data.severity')"

echo "  Listing customer complaints..."
CMP_LIST=$(curl -s "$API/api/customer/complaints" -H "$AUTH")
assert "GET /customer/complaints - success" "true" "$(echo "$CMP_LIST" | jq -r '.success')"
assert "GET /customer/complaints - has records" "true" "$(echo "$CMP_LIST" | jq -r '(.data | length) > 0')"

echo "  Getting complaint by ID..."
CMP_GET=$(curl -s "$API/api/customer/complaints/$CMP_ID" -H "$AUTH")
assert "GET /customer/complaints/:id - success" "true" "$(echo "$CMP_GET" | jq -r '.success')"
assert "GET /customer/complaints/:id - severity MAJOR" "MAJOR" "$(echo "$CMP_GET" | jq -r '.data.severity')"

CMP_STATUS_FILTER=$(curl -s "$API/api/customer/complaints?status=OPEN" -H "$AUTH")
assert "GET /customer/complaints?status filter - success" "true" "$(echo "$CMP_STATUS_FILTER" | jq -r '.success')"

VAL_CMP=$(curl -s -X POST "$API/api/customer/complaints" -H "$AUTH" -H "Content-Type: application/json" -d '{"severity":"MAJOR"}')
assert "POST /customer/complaints - validation error (missing description)" "VALIDATION_ERROR" "$(echo "$VAL_CMP" | jq -r '.error.code')"

echo ""

# --------------------------------------------------
echo "6. GATEWAY PROXY"
echo "--------------------------------------------------"

echo "  Testing routes through gateway..."
for ROUTE in portal/users portal/announcements portal/tickets customer/complaints; do
  GW_RESULT=$(curl -s "$GW/api/portal/$ROUTE" -H "$AUTH")
  assert "Gateway /api/portal/$ROUTE - success" "true" "$(echo "$GW_RESULT" | jq -r '.success')"
done

echo ""

# --------------------------------------------------
echo "7. DELETE OPERATIONS"
echo "--------------------------------------------------"

DEL_ANN1=$(curl -s -X DELETE "$API/api/portal/announcements/$ANN1_ID" -H "$AUTH")
assert "DELETE /portal/announcements/:id - success" "true" "$(echo "$DEL_ANN1" | jq -r '.success')"

DEL_ANN2=$(curl -s -X DELETE "$API/api/portal/announcements/$ANN2_ID" -H "$AUTH")
assert "DELETE /portal/announcements/:id (second) - success" "true" "$(echo "$DEL_ANN2" | jq -r '.success')"

DEL_TKT1=$(curl -s -X DELETE "$API/api/portal/tickets/$TKT1_ID" -H "$AUTH")
assert "DELETE /portal/tickets/:id - success" "true" "$(echo "$DEL_TKT1" | jq -r '.success')"

DEL_TKT2=$(curl -s -X DELETE "$API/api/portal/tickets/$TKT2_ID" -H "$AUTH")
assert "DELETE /portal/tickets/:id (second) - success" "true" "$(echo "$DEL_TKT2" | jq -r '.success')"

DEL_USER1=$(curl -s -X DELETE "$API/api/portal/users/$USER1_ID" -H "$AUTH")
assert "DELETE /portal/users/:id - success" "true" "$(echo "$DEL_USER1" | jq -r '.success')"

DEL_USER2=$(curl -s -X DELETE "$API/api/portal/users/$USER2_ID" -H "$AUTH")
assert "DELETE /portal/users/:id (supplier) - success" "true" "$(echo "$DEL_USER2" | jq -r '.success')"

VERIFY=$(curl -s "$API/api/portal/users/$USER1_ID" -H "$AUTH")
assert "Deleted portal user returns 404" "NOT_FOUND" "$(echo "$VERIFY" | jq -r '.error.code')"

VERIFY_ANN=$(curl -s "$API/api/portal/announcements/$ANN1_ID" -H "$AUTH")
assert "Deleted announcement returns 404" "NOT_FOUND" "$(echo "$VERIFY_ANN" | jq -r '.error.code')"

echo ""
echo "============================================"
echo "  RESULTS: $PASS passed, $FAIL failed (out of $TOTAL)"
echo "============================================"

if [ $FAIL -gt 0 ]; then
  exit 1
fi
