#!/bin/bash
# Comprehensive test script for Payroll modules
# Tests: Payroll Runs, Payslips, Salary Component Types, Benefits Plans, Loans, Expenses, Tax Filings, Tax Brackets
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
echo "  Payroll Modules - Comprehensive Test Suite"
echo "============================================"
echo ""

# ─────────────────────────────────────────────
echo "1. PAYROLL RUNS MODULE"
echo "─────────────────────────────────────────"

# 1a. POST - Create payroll run
echo "  Creating payroll run..."
RUN_RESULT=$(curl -s -X POST "$GW/api/payroll/payroll/runs" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "periodStart":"2026-02-01",
  "periodEnd":"2026-02-28",
  "payDate":"2026-02-28",
  "payFrequency":"MONTHLY"
}')
RUN_SUCCESS=$(echo "$RUN_RESULT" | jq -r '.success')
RUN_ID=$(echo "$RUN_RESULT" | jq -r '.data.id')
RUN_NUMBER=$(echo "$RUN_RESULT" | jq -r '.data.runNumber')
assert "POST /payroll/runs - success" "true" "$RUN_SUCCESS"
assert_contains "POST /payroll/runs - has run number" "PAY-" "$RUN_NUMBER"
assert "POST /payroll/runs - status DRAFT" "DRAFT" "$(echo "$RUN_RESULT" | jq -r '.data.status')"

# 1b. GET - List payroll runs
echo "  Listing payroll runs..."
LIST_RESULT=$(curl -s "$GW/api/payroll/payroll/runs" -H "$AUTH")
assert "GET /payroll/runs - success" "true" "$(echo "$LIST_RESULT" | jq -r '.success')"
RUN_COUNT=$(echo "$LIST_RESULT" | jq -r '.data | length')
assert "GET /payroll/runs - has records" "true" "$([ "$RUN_COUNT" -gt 0 ] && echo true || echo false)"

# 1c. GET - Single payroll run
echo "  Getting single payroll run..."
GET_RESULT=$(curl -s "$GW/api/payroll/payroll/runs/$RUN_ID" -H "$AUTH")
assert "GET /payroll/runs/:id - success" "true" "$(echo "$GET_RESULT" | jq -r '.success')"
assert "GET /payroll/runs/:id - correct runNumber" "$RUN_NUMBER" "$(echo "$GET_RESULT" | jq -r '.data.runNumber')"

# 1d. GET - Filter by status
echo "  Filtering payroll runs by status..."
FILTER_RESULT=$(curl -s "$GW/api/payroll/payroll/runs?status=DRAFT" -H "$AUTH")
assert "GET /payroll/runs?status filter" "true" "$(echo "$FILTER_RESULT" | jq -r '.success')"

# 1e. Validation error
VAL_RESULT=$(curl -s -X POST "$GW/api/payroll/payroll/runs" -H "$AUTH" -H "Content-Type: application/json" -d '{"periodStart":""}')
assert "POST /payroll/runs - validation error" "VALIDATION_ERROR" "$(echo "$VAL_RESULT" | jq -r '.error.code')"

echo ""

# ─────────────────────────────────────────────
echo "2. PAYSLIPS MODULE"
echo "─────────────────────────────────────────"

# 2a. GET - List payslips
echo "  Listing payslips..."
PAYSLIPS_RESULT=$(curl -s "$GW/api/payroll/payroll/payslips" -H "$AUTH")
assert "GET /payroll/payslips - success" "true" "$(echo "$PAYSLIPS_RESULT" | jq -r '.success')"

echo ""

# ─────────────────────────────────────────────
echo "3. PAYROLL STATS"
echo "─────────────────────────────────────────"

# 3a. GET - Payroll stats
echo "  Getting payroll stats..."
STATS_RESULT=$(curl -s "$GW/api/payroll/payroll/stats" -H "$AUTH")
assert "GET /payroll/stats - success" "true" "$(echo "$STATS_RESULT" | jq -r '.success')"
assert "GET /payroll/stats - has totalRuns" "true" "$(echo "$STATS_RESULT" | jq -r '.data.totalRuns != null')"
assert "GET /payroll/stats - has pendingRuns" "true" "$(echo "$STATS_RESULT" | jq -r '.data.pendingRuns != null')"

echo ""

# ─────────────────────────────────────────────
echo "4. SALARY COMPONENT TYPES MODULE"
echo "─────────────────────────────────────────"

# 4a. GET - List component types
echo "  Listing salary component types..."
CT_RESULT=$(curl -s "$GW/api/payroll/salary/component-types" -H "$AUTH")
assert "GET /salary/component-types - success" "true" "$(echo "$CT_RESULT" | jq -r '.success')"

# 4b. POST - Create component type
echo "  Creating salary component type..."
COMP_RESULT=$(curl -s -X POST "$GW/api/payroll/salary/component-types" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "code":"TEST-HRA",
  "name":"Test House Rent Allowance",
  "category":"ALLOWANCE",
  "type":"EARNING",
  "isTaxable":true,
  "isRecurring":true,
  "defaultCalculationType":"PERCENTAGE_OF_BASIC",
  "defaultPercentage":40,
  "showInPayslip":true
}')
COMP_SUCCESS=$(echo "$COMP_RESULT" | jq -r '.success')
COMP_ID=$(echo "$COMP_RESULT" | jq -r '.data.id')
assert "POST /salary/component-types - success" "true" "$COMP_SUCCESS"
assert "POST /salary/component-types - correct type" "EARNING" "$(echo "$COMP_RESULT" | jq -r '.data.type')"

# 4c. Validation error
VAL_RESULT=$(curl -s -X POST "$GW/api/payroll/salary/component-types" -H "$AUTH" -H "Content-Type: application/json" -d '{"code":""}')
assert "POST /salary/component-types - validation error" "VALIDATION_ERROR" "$(echo "$VAL_RESULT" | jq -r '.error.code')"

echo ""

# ─────────────────────────────────────────────
echo "5. BENEFITS PLANS MODULE"
echo "─────────────────────────────────────────"

# 5a. GET - List benefit plans
echo "  Listing benefit plans..."
PLANS_RESULT=$(curl -s "$GW/api/payroll/benefits/plans" -H "$AUTH")
assert "GET /benefits/plans - success" "true" "$(echo "$PLANS_RESULT" | jq -r '.success')"

# 5b. POST - Create benefit plan
echo "  Creating benefit plan..."
PLAN_RESULT=$(curl -s -X POST "$GW/api/payroll/benefits/plans" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "code":"TEST-HEALTH-001",
  "name":"Test Health Insurance Plan",
  "description":"Comprehensive health insurance for integration tests",
  "category":"HEALTH_INSURANCE",
  "provider":"Test Insurance Co",
  "coverageLevels":["EMPLOYEE_ONLY","FAMILY"],
  "dependentsCoverage":true,
  "employeeContribution":150,
  "employerContribution":350,
  "waitingPeriodDays":30,
  "effectiveFrom":"2026-01-01"
}')
PLAN_SUCCESS=$(echo "$PLAN_RESULT" | jq -r '.success')
PLAN_ID=$(echo "$PLAN_RESULT" | jq -r '.data.id')
assert "POST /benefits/plans - success" "true" "$PLAN_SUCCESS"
assert "POST /benefits/plans - correct category" "HEALTH_INSURANCE" "$(echo "$PLAN_RESULT" | jq -r '.data.category')"

# 5c. GET - Filter by category
FILTER_RESULT=$(curl -s "$GW/api/payroll/benefits/plans?category=HEALTH_INSURANCE" -H "$AUTH")
assert "GET /benefits/plans?category filter" "true" "$(echo "$FILTER_RESULT" | jq -r '.success')"

echo ""

# ─────────────────────────────────────────────
echo "6. LOANS MODULE"
echo "─────────────────────────────────────────"

# 6a. GET - List loans
echo "  Listing loans..."
LOANS_RESULT=$(curl -s "$GW/api/payroll/loans" -H "$AUTH")
assert "GET /loans - success" "true" "$(echo "$LOANS_RESULT" | jq -r '.success')"

# 6b. GET - Filter by status
FILTER_RESULT=$(curl -s "$GW/api/payroll/loans?status=ACTIVE" -H "$AUTH")
assert "GET /loans?status filter" "true" "$(echo "$FILTER_RESULT" | jq -r '.success')"

# 6c. GET - Filter by type
TYPE_RESULT=$(curl -s "$GW/api/payroll/loans?loanType=PERSONAL_LOAN" -H "$AUTH")
assert "GET /loans?loanType filter" "true" "$(echo "$TYPE_RESULT" | jq -r '.success')"

echo ""

# ─────────────────────────────────────────────
echo "7. EXPENSES MODULE"
echo "─────────────────────────────────────────"

# 7a. GET - List expenses
echo "  Listing expenses..."
EXP_RESULT=$(curl -s "$GW/api/payroll/expenses" -H "$AUTH")
assert "GET /expenses - success" "true" "$(echo "$EXP_RESULT" | jq -r '.success')"

# 7b. GET - Expense reports
echo "  Listing expense reports..."
REPORTS_RESULT=$(curl -s "$GW/api/payroll/expenses/reports/all" -H "$AUTH")
assert "GET /expenses/reports/all - success" "true" "$(echo "$REPORTS_RESULT" | jq -r '.success')"

# 7c. GET - Filter by status
FILTER_RESULT=$(curl -s "$GW/api/payroll/expenses?status=SUBMITTED" -H "$AUTH")
assert "GET /expenses?status filter" "true" "$(echo "$FILTER_RESULT" | jq -r '.success')"

# 7d. GET - Filter by category
CAT_RESULT=$(curl -s "$GW/api/payroll/expenses?category=TRAVEL" -H "$AUTH")
assert "GET /expenses?category filter" "true" "$(echo "$CAT_RESULT" | jq -r '.success')"

echo ""

# ─────────────────────────────────────────────
echo "8. TAX FILINGS MODULE"
echo "─────────────────────────────────────────"

# 8a. GET - List tax filings
echo "  Listing tax filings..."
FILINGS_RESULT=$(curl -s "$GW/api/payroll/tax/filings" -H "$AUTH")
assert "GET /tax/filings - success" "true" "$(echo "$FILINGS_RESULT" | jq -r '.success')"

# 8b. POST - Create tax filing
echo "  Creating tax filing..."
FILING_RESULT=$(curl -s -X POST "$GW/api/payroll/tax/filings" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "filingType":"QUARTERLY",
  "taxPeriod":"Q1 2026",
  "taxYear":2026,
  "grossWages":250000,
  "taxableWages":225000,
  "taxWithheld":45000,
  "employerTax":19125,
  "filingDeadline":"2026-04-30"
}')
FILING_SUCCESS=$(echo "$FILING_RESULT" | jq -r '.success')
FILING_ID=$(echo "$FILING_RESULT" | jq -r '.data.id')
assert "POST /tax/filings - success" "true" "$FILING_SUCCESS"
assert "POST /tax/filings - status PENDING" "PENDING" "$(echo "$FILING_RESULT" | jq -r '.data.status')"
assert "POST /tax/filings - totalTax calculated" "64125" "$(echo "$FILING_RESULT" | jq -r '.data.totalTax')"

# 8c. GET - Filter by year
YEAR_RESULT=$(curl -s "$GW/api/payroll/tax/filings?taxYear=2026" -H "$AUTH")
assert "GET /tax/filings?taxYear filter" "true" "$(echo "$YEAR_RESULT" | jq -r '.success')"

# 8d. GET - Tax summary
echo "  Getting tax summary..."
SUMMARY_RESULT=$(curl -s "$GW/api/payroll/tax/summary?year=2026" -H "$AUTH")
assert "GET /tax/summary - success" "true" "$(echo "$SUMMARY_RESULT" | jq -r '.success')"
assert "GET /tax/summary - has totalTax" "true" "$(echo "$SUMMARY_RESULT" | jq -r '.data.totalTax != null')"

echo ""

# ─────────────────────────────────────────────
echo "9. TAX BRACKETS MODULE"
echo "─────────────────────────────────────────"

# 9a. GET - List tax brackets
echo "  Listing tax brackets..."
BRACKETS_RESULT=$(curl -s "$GW/api/payroll/tax/brackets" -H "$AUTH")
assert "GET /tax/brackets - success" "true" "$(echo "$BRACKETS_RESULT" | jq -r '.success')"

# 9b. POST - Create tax bracket
echo "  Creating tax bracket..."
BRACKET_RESULT=$(curl -s -X POST "$GW/api/payroll/tax/brackets" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "taxYear":2026,
  "country":"US",
  "filingStatus":"SINGLE",
  "minIncome":0,
  "maxIncome":11000,
  "rate":10,
  "fixedAmount":0
}')
BRACKET_SUCCESS=$(echo "$BRACKET_RESULT" | jq -r '.success')
assert "POST /tax/brackets - success" "true" "$BRACKET_SUCCESS"
assert "POST /tax/brackets - correct rate" "10" "$(echo "$BRACKET_RESULT" | jq -r '.data.rate')"

# 9c. POST - Create second bracket
echo "  Creating second tax bracket..."
BRACKET2_RESULT=$(curl -s -X POST "$GW/api/payroll/tax/brackets" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "taxYear":2026,
  "country":"US",
  "filingStatus":"SINGLE",
  "minIncome":11001,
  "maxIncome":44725,
  "rate":12,
  "fixedAmount":1100
}')
assert "POST /tax/brackets (second) - success" "true" "$(echo "$BRACKET2_RESULT" | jq -r '.success')"

# 9d. GET - Filter by year and country
FILTER_RESULT=$(curl -s "$GW/api/payroll/tax/brackets?taxYear=2026&country=US" -H "$AUTH")
assert "GET /tax/brackets?taxYear&country filter" "true" "$(echo "$FILTER_RESULT" | jq -r '.success')"
BRACKET_COUNT=$(echo "$FILTER_RESULT" | jq -r '.data | length')
assert "GET /tax/brackets - has records" "true" "$([ "$BRACKET_COUNT" -gt 0 ] && echo true || echo false)"

echo ""

# ─────────────────────────────────────────────
echo "10. GATEWAY PROXY"
echo "─────────────────────────────────────────"

echo "  Testing all Payroll routes through gateway..."
for ROUTE in payroll/runs payroll/payslips payroll/stats salary/component-types benefits/plans loans expenses tax/filings tax/brackets; do
  RESULT=$(curl -s "$GW/api/payroll/$ROUTE" -H "$AUTH")
  assert "Gateway /api/payroll/$ROUTE" "true" "$(echo "$RESULT" | jq -r '.success')"
done

echo ""
echo "============================================"
echo "  RESULTS: $PASS passed, $FAIL failed (out of $TOTAL)"
echo "============================================"

if [ $FAIL -gt 0 ]; then
  exit 1
fi
