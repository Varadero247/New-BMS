#!/bin/bash
# Comprehensive test script for Field Service modules
# Tests: Jobs, Technicians, Customers, Schedules, Invoices, KPIs — CRUD + Gateway

API="http://localhost:4022"
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
echo "  Field Service Modules - Test Suite"
echo "============================================"
echo ""

echo "1. CUSTOMERS MODULE"
echo "─────────────────────────────────────────"

CUST_RESULT=$(curl -s -X POST "$API/api/customers" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "name": "Greenfield Manufacturing Ltd",
  "email": "facilities@greenfield-mfg.com",
  "phone": "+44 1234 567890",
  "address": "Unit 12, Industrial Estate, Birmingham, B1 1AA",
  "contactName": "Dave Harris",
  "notes": "Priority customer — 24hr SLA"
}')
CUST_SUCCESS=$(echo "$CUST_RESULT" | jq -r '.success')
CUST_ID=$(echo "$CUST_RESULT" | jq -r '.data.id')
assert "POST /customers - success" "true" "$CUST_SUCCESS"
assert "POST /customers - has ID" "false" "$([ -z "$CUST_ID" ] || [ "$CUST_ID" = "null" ] && echo true || echo false)"

CUSTS_LIST=$(curl -s "$API/api/customers" -H "$AUTH")
assert "GET /customers - success" "true" "$(echo "$CUSTS_LIST" | jq -r '.success')"
assert_contains "GET /customers - has data" '"data"' "$CUSTS_LIST"

CUST_GET=$(curl -s "$API/api/customers/$CUST_ID" -H "$AUTH")
assert "GET /customers/:id - success" "true" "$(echo "$CUST_GET" | jq -r '.success')"
assert "GET /customers/:id - correct name" "Greenfield Manufacturing Ltd" "$(echo "$CUST_GET" | jq -r '.data.name')"

CUST_PATCH=$(curl -s -X PATCH "$API/api/customers/$CUST_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{"notes":"Updated: 24hr SLA + dedicated account manager"}')
assert "PATCH /customers/:id - success" "true" "$(echo "$CUST_PATCH" | jq -r '.success')"

echo ""
echo "2. TECHNICIANS MODULE"
echo "─────────────────────────────────────────"

TECHS_LIST=$(curl -s "$API/api/technicians" -H "$AUTH")
assert "GET /technicians - success" "true" "$(echo "$TECHS_LIST" | jq -r '.success')"

TECH_RESULT=$(curl -s -X POST "$API/api/technicians" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "name": "Sarah Mitchell",
  "email": "s.mitchell@fieldservice.com",
  "phone": "+44 7700 123456",
  "skills": ["HVAC", "Electrical", "Plumbing"],
  "status": "AVAILABLE",
  "region": "Midlands"
}')
assert "POST /technicians - success" "true" "$(echo "$TECH_RESULT" | jq -r '.success')"
TECH_ID=$(echo "$TECH_RESULT" | jq -r '.data.id')

if [ -n "$TECH_ID" ] && [ "$TECH_ID" != "null" ]; then
  TECH_GET=$(curl -s "$API/api/technicians/$TECH_ID" -H "$AUTH")
  assert "GET /technicians/:id - success" "true" "$(echo "$TECH_GET" | jq -r '.success')"
  TECH_PATCH=$(curl -s -X PATCH "$API/api/technicians/$TECH_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{"status":"BUSY"}')
  assert "PATCH /technicians/:id - status update" "true" "$(echo "$TECH_PATCH" | jq -r '.success')"
fi

echo ""
echo "3. JOBS MODULE"
echo "─────────────────────────────────────────"

JOBS_LIST=$(curl -s "$API/api/jobs" -H "$AUTH")
assert "GET /jobs - success" "true" "$(echo "$JOBS_LIST" | jq -r '.success')"

JOB_RESULT=$(curl -s -X POST "$API/api/jobs" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "title": "Boiler Annual Service",
  "customerId": "'"$CUST_ID"'",
  "jobType": "MAINTENANCE",
  "priority": "HIGH",
  "scheduledDate": "2026-03-10T09:00:00.000Z",
  "description": "Annual service and safety inspection of main boiler system",
  "estimatedDuration": 240,
  "status": "SCHEDULED"
}')
assert "POST /jobs - success" "true" "$(echo "$JOB_RESULT" | jq -r '.success')"
JOB_ID=$(echo "$JOB_RESULT" | jq -r '.data.id')

if [ -n "$JOB_ID" ] && [ "$JOB_ID" != "null" ]; then
  JOB_GET=$(curl -s "$API/api/jobs/$JOB_ID" -H "$AUTH")
  assert "GET /jobs/:id - success" "true" "$(echo "$JOB_GET" | jq -r '.success')"
  assert "GET /jobs/:id - correct title" "Boiler Annual Service" "$(echo "$JOB_GET" | jq -r '.data.title')"

  JOB_PATCH=$(curl -s -X PATCH "$API/api/jobs/$JOB_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{"status":"IN_PROGRESS","technicianId":"'"${TECH_ID:-}"'"}')
  assert "PATCH /jobs/:id - status update" "true" "$(echo "$JOB_PATCH" | jq -r '.success')"
fi

echo ""
echo "4. SCHEDULES MODULE"
echo "─────────────────────────────────────────"

SCHEDULES=$(curl -s "$API/api/schedules" -H "$AUTH")
assert "GET /schedules - success" "true" "$(echo "$SCHEDULES" | jq -r '.success')"

echo ""
echo "5. INVOICES MODULE"
echo "─────────────────────────────────────────"

INVOICES_LIST=$(curl -s "$API/api/invoices" -H "$AUTH")
assert "GET /invoices - success" "true" "$(echo "$INVOICES_LIST" | jq -r '.success')"

echo ""
echo "6. CHECKLISTS MODULE"
echo "─────────────────────────────────────────"

CHECKLISTS=$(curl -s "$API/api/checklists" -H "$AUTH")
assert "GET /checklists - success" "true" "$(echo "$CHECKLISTS" | jq -r '.success')"

echo ""
echo "7. FIELD SERVICE KPIs MODULE"
echo "─────────────────────────────────────────"

KPIS=$(curl -s "$API/api/kpis" -H "$AUTH")
assert "GET /kpis - success" "true" "$(echo "$KPIS" | jq -r '.success')"
assert_contains "GET /kpis - has data" '"data"' "$KPIS"

echo ""
echo "8. SITES MODULE"
echo "─────────────────────────────────────────"

SITES_LIST=$(curl -s "$API/api/sites" -H "$AUTH")
assert "GET /sites - success" "true" "$(echo "$SITES_LIST" | jq -r '.success')"

echo ""
echo "9. CONTRACTS MODULE"
echo "─────────────────────────────────────────"

FS_CONTRACTS=$(curl -s "$API/api/contracts" -H "$AUTH")
assert "GET /contracts - success" "true" "$(echo "$FS_CONTRACTS" | jq -r '.success')"

echo ""
echo "10. GATEWAY ROUTING"
echo "─────────────────────────────────────────"

GW_RESULT=$(curl -s "$GW/api/field-service/jobs" -H "$AUTH")
assert "Gateway /api/field-service/jobs - success" "true" "$(echo "$GW_RESULT" | jq -r '.success')"

echo ""
echo "11. DELETE OPERATIONS"
echo "─────────────────────────────────────────"

if [ -n "$JOB_ID" ] && [ "$JOB_ID" != "null" ]; then
  DEL_JOB=$(curl -s -X DELETE "$API/api/jobs/$JOB_ID" -H "$AUTH")
  assert "DELETE /jobs/:id - success" "true" "$(echo "$DEL_JOB" | jq -r '.success')"
fi

if [ -n "$TECH_ID" ] && [ "$TECH_ID" != "null" ]; then
  DEL_TECH=$(curl -s -X DELETE "$API/api/technicians/$TECH_ID" -H "$AUTH")
  assert "DELETE /technicians/:id - success" "true" "$(echo "$DEL_TECH" | jq -r '.success')"
fi

DEL_CUST=$(curl -s -X DELETE "$API/api/customers/$CUST_ID" -H "$AUTH")
assert "DELETE /customers/:id - success" "true" "$(echo "$DEL_CUST" | jq -r '.success')"

VERIFY=$(curl -s "$API/api/customers/$CUST_ID" -H "$AUTH")
assert "Deleted customer returns 404" "NOT_FOUND" "$(echo "$VERIFY" | jq -r '.error.code')"

echo ""
echo "============================================"
echo "  RESULTS: $PASS passed, $FAIL failed (out of $TOTAL)"
echo "============================================"

if [ $FAIL -gt 0 ]; then
  exit 1
fi
