#!/bin/bash
# Comprehensive test script for Analytics modules
# Tests: KPIs, Dashboards, Reports, Datasets, Benchmarks, Executive — GET + POST + Gateway

API="http://localhost:4021"
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
echo "  Analytics Modules - Test Suite"
echo "============================================"
echo ""

echo "1. KPIs MODULE"
echo "─────────────────────────────────────────"

KPIS_LIST=$(curl -s "$API/api/kpis" -H "$AUTH")
assert "GET /kpis - success" "true" "$(echo "$KPIS_LIST" | jq -r '.success')"
assert_contains "GET /kpis - has data" '"data"' "$KPIS_LIST"

KPI_RESULT=$(curl -s -X POST "$API/api/kpis" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "name": "Incident Rate",
  "description": "Number of reportable incidents per 100,000 hours worked",
  "category": "HEALTH_SAFETY",
  "unit": "per 100k hours",
  "frequency": "MONTHLY",
  "target": 2.5,
  "direction": "LOWER_IS_BETTER",
  "isActive": true
}')
assert "POST /kpis - success" "true" "$(echo "$KPI_RESULT" | jq -r '.success')"
KPI_ID=$(echo "$KPI_RESULT" | jq -r '.data.id')

if [ -n "$KPI_ID" ] && [ "$KPI_ID" != "null" ]; then
  KPI_GET=$(curl -s "$API/api/kpis/$KPI_ID" -H "$AUTH")
  assert "GET /kpis/:id - success" "true" "$(echo "$KPI_GET" | jq -r '.success')"
  KPI_PATCH=$(curl -s -X PATCH "$API/api/kpis/$KPI_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{"target":2.0}')
  assert "PATCH /kpis/:id - success" "true" "$(echo "$KPI_PATCH" | jq -r '.success')"
fi

echo ""
echo "2. DASHBOARDS MODULE"
echo "─────────────────────────────────────────"

DASHBOARDS_LIST=$(curl -s "$API/api/dashboards" -H "$AUTH")
assert "GET /dashboards - success" "true" "$(echo "$DASHBOARDS_LIST" | jq -r '.success')"

DASHBOARD_RESULT=$(curl -s -X POST "$API/api/dashboards" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "name": "Executive Safety Dashboard",
  "description": "Board-level safety performance overview",
  "layout": "GRID",
  "isPublic": false,
  "refreshInterval": 3600
}')
assert "POST /dashboards - success" "true" "$(echo "$DASHBOARD_RESULT" | jq -r '.success')"
DASHBOARD_ID=$(echo "$DASHBOARD_RESULT" | jq -r '.data.id')

echo ""
echo "3. REPORTS MODULE"
echo "─────────────────────────────────────────"

REPORTS_LIST=$(curl -s "$API/api/reports" -H "$AUTH")
assert "GET /reports - success" "true" "$(echo "$REPORTS_LIST" | jq -r '.success')"

REPORT_RESULT=$(curl -s -X POST "$API/api/reports" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "title": "Q1 2026 Performance Report",
  "reportType": "QUARTERLY",
  "period": "2026-Q1",
  "status": "DRAFT",
  "modules": ["HEALTH_SAFETY", "ENVIRONMENT", "QUALITY"]
}')
assert "POST /reports - success" "true" "$(echo "$REPORT_RESULT" | jq -r '.success')"
REPORT_ID=$(echo "$REPORT_RESULT" | jq -r '.data.id')

if [ -n "$REPORT_ID" ] && [ "$REPORT_ID" != "null" ]; then
  REPORT_GET=$(curl -s "$API/api/reports/$REPORT_ID" -H "$AUTH")
  assert "GET /reports/:id - success" "true" "$(echo "$REPORT_GET" | jq -r '.success')"
fi

echo ""
echo "4. DATASETS MODULE"
echo "─────────────────────────────────────────"

DATASETS_LIST=$(curl -s "$API/api/datasets" -H "$AUTH")
assert "GET /datasets - success" "true" "$(echo "$DATASETS_LIST" | jq -r '.success')"

echo ""
echo "5. BENCHMARKS MODULE"
echo "─────────────────────────────────────────"

BENCHMARKS_LIST=$(curl -s "$API/api/benchmarks" -H "$AUTH")
assert "GET /benchmarks - success" "true" "$(echo "$BENCHMARKS_LIST" | jq -r '.success')"

echo ""
echo "6. EXECUTIVE SUMMARY MODULE"
echo "─────────────────────────────────────────"

EXECUTIVE=$(curl -s "$API/api/executive" -H "$AUTH")
assert "GET /executive - success" "true" "$(echo "$EXECUTIVE" | jq -r '.success')"
assert_contains "GET /executive - has data" '"data"' "$EXECUTIVE"

echo ""
echo "7. PREDICTIONS / FORECASTS MODULE"
echo "─────────────────────────────────────────"

PREDICTIONS=$(curl -s "$API/api/predictions" -H "$AUTH")
assert "GET /predictions - success" "true" "$(echo "$PREDICTIONS" | jq -r '.success')"

echo ""
echo "8. ANOMALIES MODULE"
echo "─────────────────────────────────────────"

ANOMALIES=$(curl -s "$API/api/anomalies" -H "$AUTH")
assert "GET /anomalies - success" "true" "$(echo "$ANOMALIES" | jq -r '.success')"

echo ""
echo "9. ALERTS MODULE"
echo "─────────────────────────────────────────"

ALERTS_LIST=$(curl -s "$API/api/alerts" -H "$AUTH")
assert "GET /alerts - success" "true" "$(echo "$ALERTS_LIST" | jq -r '.success')"

echo ""
echo "10. GATEWAY ROUTING"
echo "─────────────────────────────────────────"

GW_RESULT=$(curl -s "$GW/api/analytics/kpis" -H "$AUTH")
assert "Gateway /api/analytics/kpis - success" "true" "$(echo "$GW_RESULT" | jq -r '.success')"

echo ""
echo "11. DELETE OPERATIONS"
echo "─────────────────────────────────────────"

if [ -n "$KPI_ID" ] && [ "$KPI_ID" != "null" ]; then
  DEL_KPI=$(curl -s -X DELETE "$API/api/kpis/$KPI_ID" -H "$AUTH")
  assert "DELETE /kpis/:id - success" "true" "$(echo "$DEL_KPI" | jq -r '.success')"
fi

if [ -n "$DASHBOARD_ID" ] && [ "$DASHBOARD_ID" != "null" ]; then
  DEL_DASH=$(curl -s -X DELETE "$API/api/dashboards/$DASHBOARD_ID" -H "$AUTH")
  assert "DELETE /dashboards/:id - success" "true" "$(echo "$DEL_DASH" | jq -r '.success')"
fi

if [ -n "$REPORT_ID" ] && [ "$REPORT_ID" != "null" ]; then
  DEL_REPORT=$(curl -s -X DELETE "$API/api/reports/$REPORT_ID" -H "$AUTH")
  assert "DELETE /reports/:id - success" "true" "$(echo "$DEL_REPORT" | jq -r '.success')"
fi

echo ""
echo "============================================"
echo "  RESULTS: $PASS passed, $FAIL failed (out of $TOTAL)"
echo "============================================"

if [ $FAIL -gt 0 ]; then
  exit 1
fi
