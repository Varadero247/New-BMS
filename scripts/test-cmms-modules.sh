#!/bin/bash
# Comprehensive test script for CMMS modules
# Tests: Assets, Work Orders, Preventive Plans — CRUD + Gateway

API="http://localhost:4017"
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
echo "  CMMS Modules - Comprehensive Test Suite"
echo "============================================"
echo ""

# --------------------------------------------------
echo "1. AUTH CHECK"
echo "--------------------------------------------------"
AUTH_RESULT=$(curl -s "$API/api/assets" -H "$AUTH")
assert "Auth token accepted by CMMS service" "true" "$(echo "$AUTH_RESULT" | jq -r '.success')"
echo ""

# --------------------------------------------------
echo "2. ASSETS MODULE"
echo "--------------------------------------------------"

echo "  Creating asset..."
ASSET_RESULT=$(curl -s -X POST "$API/api/assets" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "name": "CNC Milling Machine XR-2000",
  "description": "5-axis CNC milling machine for precision parts manufacturing",
  "assetType": "EQUIPMENT",
  "category": "Production Machinery",
  "manufacturer": "Haas Automation",
  "model": "XR-2000",
  "serialNumber": "HA-XR2000-2024-001",
  "location": "Production Floor Zone B",
  "department": "Manufacturing",
  "status": "ACTIVE",
  "purchaseDate": "2024-03-15",
  "purchaseCost": 185000,
  "criticality": "CRITICAL"
}')
ASSET_SUCCESS=$(echo "$ASSET_RESULT" | jq -r '.success')
ASSET_ID=$(echo "$ASSET_RESULT" | jq -r '.data.id')
assert "POST /assets - success" "true" "$ASSET_SUCCESS"
assert "POST /assets - name set" "CNC Milling Machine XR-2000" "$(echo "$ASSET_RESULT" | jq -r '.data.name')"
assert "POST /assets - assetType EQUIPMENT" "EQUIPMENT" "$(echo "$ASSET_RESULT" | jq -r '.data.assetType')"
assert "POST /assets - criticality CRITICAL" "CRITICAL" "$(echo "$ASSET_RESULT" | jq -r '.data.criticality')"
assert_contains "POST /assets - has assetCode ASSET-" "ASSET-" "$(echo "$ASSET_RESULT" | jq -r '.data.assetCode')"

echo "  Creating second asset (vehicle)..."
ASSET2_RESULT=$(curl -s -X POST "$API/api/assets" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "name": "Forklift FLT-003",
  "assetType": "VEHICLE",
  "category": "Material Handling",
  "manufacturer": "Toyota",
  "model": "8FBCHU25",
  "serialNumber": "TY-FLT-2023-003",
  "location": "Warehouse",
  "department": "Logistics",
  "criticality": "HIGH",
  "status": "ACTIVE"
}')
ASSET2_ID=$(echo "$ASSET2_RESULT" | jq -r '.data.id')
assert "POST /assets (vehicle) - success" "true" "$(echo "$ASSET2_RESULT" | jq -r '.success')"

echo "  Listing assets..."
ASSET_LIST=$(curl -s "$API/api/assets" -H "$AUTH")
assert "GET /assets - success" "true" "$(echo "$ASSET_LIST" | jq -r '.success')"
assert "GET /assets - has records" "true" "$(echo "$ASSET_LIST" | jq -r '(.data | length) > 0')"
assert "GET /assets - pagination present" "true" "$(echo "$ASSET_LIST" | jq -r '.pagination != null')"

echo "  Getting asset by ID..."
ASSET_GET=$(curl -s "$API/api/assets/$ASSET_ID" -H "$AUTH")
assert "GET /assets/:id - success" "true" "$(echo "$ASSET_GET" | jq -r '.success')"
assert "GET /assets/:id - correct name" "CNC Milling Machine XR-2000" "$(echo "$ASSET_GET" | jq -r '.data.name')"

echo "  Updating asset..."
ASSET_PUT=$(curl -s -X PUT "$API/api/assets/$ASSET_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "status": "UNDER_MAINTENANCE",
  "location": "Production Floor Zone B - Bay 3"
}')
assert "PUT /assets/:id - success" "true" "$(echo "$ASSET_PUT" | jq -r '.success')"
assert "PUT /assets/:id - status updated" "UNDER_MAINTENANCE" "$(echo "$ASSET_PUT" | jq -r '.data.status')"

echo "  Filtering assets..."
TYPE_FILTER=$(curl -s "$API/api/assets?assetType=EQUIPMENT" -H "$AUTH")
assert "GET /assets?assetType filter - success" "true" "$(echo "$TYPE_FILTER" | jq -r '.success')"

STATUS_FILTER=$(curl -s "$API/api/assets?status=ACTIVE" -H "$AUTH")
assert "GET /assets?status filter - success" "true" "$(echo "$STATUS_FILTER" | jq -r '.success')"

CRIT_FILTER=$(curl -s "$API/api/assets?criticality=CRITICAL" -H "$AUTH")
assert "GET /assets?criticality filter - success" "true" "$(echo "$CRIT_FILTER" | jq -r '.success')"

SEARCH_ASSET=$(curl -s "$API/api/assets?search=CNC" -H "$AUTH")
assert "GET /assets?search - success" "true" "$(echo "$SEARCH_ASSET" | jq -r '.success')"

VAL_ASSET=$(curl -s -X POST "$API/api/assets" -H "$AUTH" -H "Content-Type: application/json" -d '{"manufacturer":"Haas"}')
assert "POST /assets - validation error (missing name+assetType)" "VALIDATION_ERROR" "$(echo "$VAL_ASSET" | jq -r '.error.code')"

NOT_FOUND=$(curl -s "$API/api/assets/00000000-0000-0000-0000-000000000099" -H "$AUTH")
assert "GET /assets/:id - 404 for missing asset" "NOT_FOUND" "$(echo "$NOT_FOUND" | jq -r '.error.code')"

echo ""

# --------------------------------------------------
echo "3. WORK ORDERS MODULE"
echo "--------------------------------------------------"

echo "  Creating corrective work order..."
WO_RESULT=$(curl -s -X POST "$API/api/work-orders" -H "$AUTH" -H "Content-Type: application/json" -d "{
  \"title\": \"CNC Machine - Spindle bearing replacement\",
  \"description\": \"Spindle bearing showing signs of wear - unusual vibration detected. Replace before failure.\",
  \"assetId\": \"$ASSET_ID\",
  \"type\": \"CORRECTIVE\",
  \"priority\": \"HIGH\",
  \"assignedTo\": \"John Technician\",
  \"requestedBy\": \"Production Manager\",
  \"scheduledStart\": \"2026-02-25T08:00:00Z\",
  \"scheduledEnd\": \"2026-02-25T16:00:00Z\",
  \"laborHours\": 8,
  \"laborCost\": 320,
  \"partsCost\": 850
}")
WO_SUCCESS=$(echo "$WO_RESULT" | jq -r '.success')
WO_ID=$(echo "$WO_RESULT" | jq -r '.data.id')
assert "POST /work-orders - success" "true" "$WO_SUCCESS"
assert "POST /work-orders - title set" "CNC Machine - Spindle bearing replacement" "$(echo "$WO_RESULT" | jq -r '.data.title')"
assert "POST /work-orders - type CORRECTIVE" "CORRECTIVE" "$(echo "$WO_RESULT" | jq -r '.data.type')"
assert "POST /work-orders - status OPEN by default" "OPEN" "$(echo "$WO_RESULT" | jq -r '.data.status')"
assert_contains "POST /work-orders - has woNumber WO-" "WO-" "$(echo "$WO_RESULT" | jq -r '.data.woNumber')"

echo "  Creating emergency work order..."
WO2_RESULT=$(curl -s -X POST "$API/api/work-orders" -H "$AUTH" -H "Content-Type: application/json" -d "{
  \"title\": \"Forklift hydraulic leak - URGENT\",
  \"description\": \"Hydraulic fluid leak detected from forklift mast cylinder. Out of service until repaired.\",
  \"assetId\": \"$ASSET2_ID\",
  \"type\": \"EMERGENCY\",
  \"priority\": \"CRITICAL\",
  \"assignedTo\": \"Senior Mechanic\",
  \"requestedBy\": \"Warehouse Supervisor\"
}")
WO2_ID=$(echo "$WO2_RESULT" | jq -r '.data.id')
assert "POST /work-orders (emergency) - success" "true" "$(echo "$WO2_RESULT" | jq -r '.success')"
assert "POST /work-orders (emergency) - priority CRITICAL" "CRITICAL" "$(echo "$WO2_RESULT" | jq -r '.data.priority')"

echo "  Listing work orders..."
WO_LIST=$(curl -s "$API/api/work-orders" -H "$AUTH")
assert "GET /work-orders - success" "true" "$(echo "$WO_LIST" | jq -r '.success')"
assert "GET /work-orders - has records" "true" "$(echo "$WO_LIST" | jq -r '(.data | length) > 0')"

echo "  Getting work order by ID..."
WO_GET=$(curl -s "$API/api/work-orders/$WO_ID" -H "$AUTH")
assert "GET /work-orders/:id - success" "true" "$(echo "$WO_GET" | jq -r '.success')"
assert "GET /work-orders/:id - correct title" "CNC Machine - Spindle bearing replacement" "$(echo "$WO_GET" | jq -r '.data.title')"

echo "  Updating work order status..."
WO_PUT=$(curl -s -X PUT "$API/api/work-orders/$WO_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "status": "IN_PROGRESS",
  "completionNotes": "Bearing removed, replacement sourced from stores"
}')
assert "PUT /work-orders/:id - success" "true" "$(echo "$WO_PUT" | jq -r '.success')"
assert "PUT /work-orders/:id - status IN_PROGRESS" "IN_PROGRESS" "$(echo "$WO_PUT" | jq -r '.data.status')"

echo "  Completing work order..."
WO_COMPLETE=$(curl -s -X PUT "$API/api/work-orders/$WO_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "status": "COMPLETED",
  "completionNotes": "Bearing replaced successfully. Machine tested and running within spec.",
  "laborHours": 9,
  "totalCost": 1170
}')
assert "PUT /work-orders/:id complete - success" "true" "$(echo "$WO_COMPLETE" | jq -r '.success')"
assert "PUT /work-orders/:id complete - status COMPLETED" "COMPLETED" "$(echo "$WO_COMPLETE" | jq -r '.data.status')"

echo "  Filtering work orders..."
TYPE_FILTER=$(curl -s "$API/api/work-orders?type=CORRECTIVE" -H "$AUTH")
assert "GET /work-orders?type filter - success" "true" "$(echo "$TYPE_FILTER" | jq -r '.success')"

PRIO_FILTER=$(curl -s "$API/api/work-orders?priority=CRITICAL" -H "$AUTH")
assert "GET /work-orders?priority filter - success" "true" "$(echo "$PRIO_FILTER" | jq -r '.success')"

ASSET_FILTER=$(curl -s "$API/api/work-orders?assetId=$ASSET_ID" -H "$AUTH")
assert "GET /work-orders?assetId filter - success" "true" "$(echo "$ASSET_FILTER" | jq -r '.success')"

OVERDUE=$(curl -s "$API/api/work-orders/overdue" -H "$AUTH")
assert "GET /work-orders/overdue - success" "true" "$(echo "$OVERDUE" | jq -r '.success')"

VAL_WO=$(curl -s -X POST "$API/api/work-orders" -H "$AUTH" -H "Content-Type: application/json" -d '{"title":"Test WO"}')
assert "POST /work-orders - validation error (missing assetId+type)" "VALIDATION_ERROR" "$(echo "$VAL_WO" | jq -r '.error.code')"

echo ""

# --------------------------------------------------
echo "4. PREVENTIVE PLANS MODULE"
echo "--------------------------------------------------"

echo "  Creating preventive plan..."
PP_RESULT=$(curl -s -X POST "$API/api/preventive-plans" -H "$AUTH" -H "Content-Type: application/json" -d "{
  \"name\": \"CNC Machine - Monthly Preventive Maintenance\",
  \"assetId\": \"$ASSET_ID\",
  \"description\": \"Monthly comprehensive inspection and lubrication service for CNC milling machine\",
  \"frequency\": \"MONTHLY\",
  \"nextDue\": \"2026-03-01\",
  \"assignedTo\": \"Maintenance Team A\",
  \"isActive\": true,
  \"estimatedDuration\": 240,
  \"estimatedCost\": 450,
  \"tasks\": [
    {\"step\": 1, \"task\": \"Inspect all axis drive belts\"},
    {\"step\": 2, \"task\": \"Lubricate all linear guide rails\"},
    {\"step\": 3, \"task\": \"Check spindle runout\"},
    {\"step\": 4, \"task\": \"Verify tool changer operation\"},
    {\"step\": 5, \"task\": \"Clean coolant filters\"}
  ]
}")
PP_SUCCESS=$(echo "$PP_RESULT" | jq -r '.success')
PP_ID=$(echo "$PP_RESULT" | jq -r '.data.id')
assert "POST /preventive-plans - success" "true" "$PP_SUCCESS"
assert "POST /preventive-plans - name set" "CNC Machine - Monthly Preventive Maintenance" "$(echo "$PP_RESULT" | jq -r '.data.name')"
assert "POST /preventive-plans - frequency MONTHLY" "MONTHLY" "$(echo "$PP_RESULT" | jq -r '.data.frequency')"
assert "POST /preventive-plans - isActive true" "true" "$(echo "$PP_RESULT" | jq -r '.data.isActive')"

echo "  Creating quarterly plan for forklift..."
PP2_RESULT=$(curl -s -X POST "$API/api/preventive-plans" -H "$AUTH" -H "Content-Type: application/json" -d "{
  \"name\": \"Forklift - Quarterly Safety Inspection\",
  \"assetId\": \"$ASSET2_ID\",
  \"frequency\": \"QUARTERLY\",
  \"nextDue\": \"2026-04-01\",
  \"isActive\": true,
  \"estimatedDuration\": 120,
  \"tasks\": [{\"step\": 1, \"task\": \"Brake test\"}, {\"step\": 2, \"task\": \"Hydraulic check\"}]
}")
PP2_ID=$(echo "$PP2_RESULT" | jq -r '.data.id')
assert "POST /preventive-plans (quarterly) - success" "true" "$(echo "$PP2_RESULT" | jq -r '.success')"

echo "  Listing preventive plans..."
PP_LIST=$(curl -s "$API/api/preventive-plans" -H "$AUTH")
assert "GET /preventive-plans - success" "true" "$(echo "$PP_LIST" | jq -r '.success')"
assert "GET /preventive-plans - has records" "true" "$(echo "$PP_LIST" | jq -r '(.data | length) > 0')"
assert "GET /preventive-plans - includes asset info" "true" "$(echo "$PP_LIST" | jq -r '.data[0].asset != null')"

echo "  Getting plan by ID..."
PP_GET=$(curl -s "$API/api/preventive-plans/$PP_ID" -H "$AUTH")
assert "GET /preventive-plans/:id - success" "true" "$(echo "$PP_GET" | jq -r '.success')"
assert "GET /preventive-plans/:id - correct name" "CNC Machine - Monthly Preventive Maintenance" "$(echo "$PP_GET" | jq -r '.data.name')"

echo "  Updating preventive plan..."
PP_PUT=$(curl -s -X PUT "$API/api/preventive-plans/$PP_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "estimatedCost": 500,
  "estimatedDuration": 270,
  "nextDue": "2026-03-05"
}')
assert "PUT /preventive-plans/:id - success" "true" "$(echo "$PP_PUT" | jq -r '.success')"
assert "PUT /preventive-plans/:id - cost updated" "500" "$(echo "$PP_PUT" | jq -r '.data.estimatedCost')"

echo "  Filtering preventive plans..."
FREQ_FILTER=$(curl -s "$API/api/preventive-plans?frequency=MONTHLY" -H "$AUTH")
assert "GET /preventive-plans?frequency filter - success" "true" "$(echo "$FREQ_FILTER" | jq -r '.success')"

ACTIVE_FILTER=$(curl -s "$API/api/preventive-plans?isActive=true" -H "$AUTH")
assert "GET /preventive-plans?isActive filter - success" "true" "$(echo "$ACTIVE_FILTER" | jq -r '.success')"

ASSET_PP_FILTER=$(curl -s "$API/api/preventive-plans?assetId=$ASSET_ID" -H "$AUTH")
assert "GET /preventive-plans?assetId filter - success" "true" "$(echo "$ASSET_PP_FILTER" | jq -r '.success')"

VAL_PP=$(curl -s -X POST "$API/api/preventive-plans" -H "$AUTH" -H "Content-Type: application/json" -d '{"name":"Test Plan"}')
assert "POST /preventive-plans - validation error (missing assetId+frequency)" "VALIDATION_ERROR" "$(echo "$VAL_PP" | jq -r '.error.code')"

echo ""

# --------------------------------------------------
echo "5. GATEWAY PROXY"
echo "--------------------------------------------------"

echo "  Testing routes through gateway..."
for ROUTE in assets work-orders preventive-plans; do
  GW_RESULT=$(curl -s "$GW/api/cmms/$ROUTE" -H "$AUTH")
  assert "Gateway /api/cmms/$ROUTE - success" "true" "$(echo "$GW_RESULT" | jq -r '.success')"
done

echo ""

# --------------------------------------------------
echo "6. DELETE OPERATIONS"
echo "--------------------------------------------------"

DEL_PP=$(curl -s -X DELETE "$API/api/preventive-plans/$PP_ID" -H "$AUTH")
assert "DELETE /preventive-plans/:id - success" "true" "$(echo "$DEL_PP" | jq -r '.success')"

DEL_PP2=$(curl -s -X DELETE "$API/api/preventive-plans/$PP2_ID" -H "$AUTH")
assert "DELETE /preventive-plans/:id (second) - success" "true" "$(echo "$DEL_PP2" | jq -r '.success')"

DEL_WO2=$(curl -s -X DELETE "$API/api/work-orders/$WO2_ID" -H "$AUTH")
assert "DELETE /work-orders/:id (emergency) - success" "true" "$(echo "$DEL_WO2" | jq -r '.success')"

DEL_ASSET=$(curl -s -X DELETE "$API/api/assets/$ASSET_ID" -H "$AUTH")
assert "DELETE /assets/:id - success" "true" "$(echo "$DEL_ASSET" | jq -r '.success')"

DEL_ASSET2=$(curl -s -X DELETE "$API/api/assets/$ASSET2_ID" -H "$AUTH")
assert "DELETE /assets/:id (vehicle) - success" "true" "$(echo "$DEL_ASSET2" | jq -r '.success')"

VERIFY=$(curl -s "$API/api/assets/$ASSET_ID" -H "$AUTH")
assert "Deleted asset returns 404" "NOT_FOUND" "$(echo "$VERIFY" | jq -r '.error.code')"

echo ""
echo "============================================"
echo "  RESULTS: $PASS passed, $FAIL failed (out of $TOTAL)"
echo "============================================"

if [ $FAIL -gt 0 ]; then
  exit 1
fi
