#!/bin/bash

# Finance Module Integration Tests
# Tests the Finance & Accounting API endpoints through the gateway

set -euo pipefail

BASE_URL="http://localhost:4000/api/v1/finance"
PASS=0
FAIL=0
TOTAL=0

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Get auth token
TOKEN=$(curl -s http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ims.local","password":"admin123"}' | \
  grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo -e "${RED}Failed to get auth token. Is the gateway running?${NC}"
  exit 1
fi

AUTH="Authorization: Bearer $TOKEN"

assert_status() {
  local description="$1"
  local expected="$2"
  local actual="$3"
  TOTAL=$((TOTAL + 1))

  if [ "$actual" -eq "$expected" ]; then
    echo -e "  ${GREEN}PASS${NC} $description (HTTP $actual)"
    PASS=$((PASS + 1))
  else
    echo -e "  ${RED}FAIL${NC} $description (expected $expected, got $actual)"
    FAIL=$((FAIL + 1))
  fi
}

assert_contains() {
  local description="$1"
  local expected="$2"
  local body="$3"
  TOTAL=$((TOTAL + 1))

  if echo "$body" | grep -q "$expected"; then
    echo -e "  ${GREEN}PASS${NC} $description"
    PASS=$((PASS + 1))
  else
    echo -e "  ${RED}FAIL${NC} $description (expected to contain '$expected')"
    FAIL=$((FAIL + 1))
  fi
}

echo -e "${YELLOW}=== Finance Module Integration Tests ===${NC}"
echo ""

# ============================================
# CHART OF ACCOUNTS
# ============================================
echo -e "${YELLOW}--- Chart of Accounts ---${NC}"

# Create account
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/accounts" \
  -H "$AUTH" -H "Content-Type: application/json" \
  -d '{"code":"1000","name":"Cash","type":"ASSET","normalBalance":"DEBIT"}')
STATUS=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')
assert_status "Create account" 201 "$STATUS"
assert_contains "Account has code" '"code":"1000"' "$BODY"
ACCOUNT_ID=$(echo "$BODY" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

# Create revenue account
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/accounts" \
  -H "$AUTH" -H "Content-Type: application/json" \
  -d '{"code":"4000","name":"Revenue","type":"REVENUE","normalBalance":"CREDIT"}')
STATUS=$(echo "$RESPONSE" | tail -1)
assert_status "Create revenue account" 201 "$STATUS"
REVENUE_ID=$(echo "$RESPONSE" | sed '$d' | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

# Create expense account
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/accounts" \
  -H "$AUTH" -H "Content-Type: application/json" \
  -d '{"code":"5000","name":"Expenses","type":"EXPENSE","normalBalance":"DEBIT"}')
STATUS=$(echo "$RESPONSE" | tail -1)
assert_status "Create expense account" 201 "$STATUS"
EXPENSE_ID=$(echo "$RESPONSE" | sed '$d' | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

# List accounts
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/accounts" -H "$AUTH")
STATUS=$(echo "$RESPONSE" | tail -1)
assert_status "List accounts" 200 "$STATUS"

# Get single account
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/accounts/$ACCOUNT_ID" -H "$AUTH")
STATUS=$(echo "$RESPONSE" | tail -1)
assert_status "Get account by ID" 200 "$STATUS"

# Account tree
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/accounts/tree" -H "$AUTH")
STATUS=$(echo "$RESPONSE" | tail -1)
assert_status "Account tree" 200 "$STATUS"

echo ""

# ============================================
# ACCOUNTING PERIODS
# ============================================
echo -e "${YELLOW}--- Accounting Periods ---${NC}"

RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/accounts/periods" \
  -H "$AUTH" -H "Content-Type: application/json" \
  -d '{"name":"Q1 2026","startDate":"2026-01-01","endDate":"2026-03-31","fiscalYear":2026,"quarter":1}')
STATUS=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')
assert_status "Create period" 201 "$STATUS"
PERIOD_ID=$(echo "$BODY" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/accounts/periods" -H "$AUTH")
STATUS=$(echo "$RESPONSE" | tail -1)
assert_status "List periods" 200 "$STATUS"

echo ""

# ============================================
# CUSTOMERS
# ============================================
echo -e "${YELLOW}--- Customers ---${NC}"

RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/customers" \
  -H "$AUTH" -H "Content-Type: application/json" \
  -d '{"code":"CUST-001","name":"Acme Corp","email":"billing@acme.com","paymentTerms":30}')
STATUS=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')
assert_status "Create customer" 201 "$STATUS"
CUSTOMER_ID=$(echo "$BODY" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/customers" -H "$AUTH")
STATUS=$(echo "$RESPONSE" | tail -1)
assert_status "List customers" 200 "$STATUS"

echo ""

# ============================================
# INVOICES
# ============================================
echo -e "${YELLOW}--- Invoices ---${NC}"

RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/invoices" \
  -H "$AUTH" -H "Content-Type: application/json" \
  -d "{\"customerId\":\"$CUSTOMER_ID\",\"issueDate\":\"2026-02-01\",\"dueDate\":\"2026-03-01\",\"lines\":[{\"description\":\"Consulting\",\"quantity\":10,\"unitPrice\":150}]}")
STATUS=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')
assert_status "Create invoice" 201 "$STATUS"
assert_contains "Invoice has reference" '"reference":"FIN-INV-' "$BODY"
INVOICE_ID=$(echo "$BODY" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/invoices" -H "$AUTH")
STATUS=$(echo "$RESPONSE" | tail -1)
assert_status "List invoices" 200 "$STATUS"

RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/invoices/$INVOICE_ID" -H "$AUTH")
STATUS=$(echo "$RESPONSE" | tail -1)
assert_status "Get invoice by ID" 200 "$STATUS"

# Send invoice
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/invoices/$INVOICE_ID/send" \
  -H "$AUTH" -H "Content-Type: application/json")
STATUS=$(echo "$RESPONSE" | tail -1)
assert_status "Send invoice" 200 "$STATUS"

# AR Aging
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/invoices/aging" -H "$AUTH")
STATUS=$(echo "$RESPONSE" | tail -1)
assert_status "AR aging report" 200 "$STATUS"

echo ""

# ============================================
# SUPPLIERS
# ============================================
echo -e "${YELLOW}--- Suppliers ---${NC}"

RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/suppliers" \
  -H "$AUTH" -H "Content-Type: application/json" \
  -d '{"code":"SUP-001","name":"Widget Inc","email":"ap@widgets.com","paymentTerms":45}')
STATUS=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')
assert_status "Create supplier" 201 "$STATUS"
SUPPLIER_ID=$(echo "$BODY" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/suppliers" -H "$AUTH")
STATUS=$(echo "$RESPONSE" | tail -1)
assert_status "List suppliers" 200 "$STATUS"

echo ""

# ============================================
# PURCHASE ORDERS
# ============================================
echo -e "${YELLOW}--- Purchase Orders ---${NC}"

RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/purchase-orders" \
  -H "$AUTH" -H "Content-Type: application/json" \
  -d "{\"supplierId\":\"$SUPPLIER_ID\",\"orderDate\":\"2026-02-01\",\"lines\":[{\"description\":\"Widgets\",\"quantity\":100,\"unitPrice\":5.50}]}")
STATUS=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')
assert_status "Create purchase order" 201 "$STATUS"
PO_ID=$(echo "$BODY" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

# Approve PO
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/purchase-orders/$PO_ID/approve" \
  -H "$AUTH" -H "Content-Type: application/json")
STATUS=$(echo "$RESPONSE" | tail -1)
assert_status "Approve purchase order" 200 "$STATUS"

RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/purchase-orders" -H "$AUTH")
STATUS=$(echo "$RESPONSE" | tail -1)
assert_status "List purchase orders" 200 "$STATUS"

echo ""

# ============================================
# BILLS
# ============================================
echo -e "${YELLOW}--- Bills ---${NC}"

RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/payables" \
  -H "$AUTH" -H "Content-Type: application/json" \
  -d "{\"supplierId\":\"$SUPPLIER_ID\",\"billDate\":\"2026-02-10\",\"dueDate\":\"2026-03-25\",\"lines\":[{\"description\":\"Widget supply\",\"quantity\":100,\"unitPrice\":5.50}]}")
STATUS=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')
assert_status "Create bill" 201 "$STATUS"
BILL_ID=$(echo "$BODY" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/payables" -H "$AUTH")
STATUS=$(echo "$RESPONSE" | tail -1)
assert_status "List bills" 200 "$STATUS"

# AP Aging
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/payables/aging" -H "$AUTH")
STATUS=$(echo "$RESPONSE" | tail -1)
assert_status "AP aging report" 200 "$STATUS"

echo ""

# ============================================
# BANKING
# ============================================
echo -e "${YELLOW}--- Banking ---${NC}"

RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/banking" \
  -H "$AUTH" -H "Content-Type: application/json" \
  -d '{"name":"Business Current","type":"CURRENT","currency":"GBP","bankName":"Barclays","currentBalance":50000}')
STATUS=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')
assert_status "Create bank account" 201 "$STATUS"
BANK_ID=$(echo "$BODY" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/banking" -H "$AUTH")
STATUS=$(echo "$RESPONSE" | tail -1)
assert_status "List bank accounts" 200 "$STATUS"

echo ""

# ============================================
# TAX
# ============================================
echo -e "${YELLOW}--- Tax ---${NC}"

RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/tax/rates" \
  -H "$AUTH" -H "Content-Type: application/json" \
  -d '{"name":"Standard VAT","code":"VAT-20","rate":20,"jurisdiction":"UK_VAT","isDefault":true}')
STATUS=$(echo "$RESPONSE" | tail -1)
assert_status "Create tax rate" 201 "$STATUS"

RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/tax/rates" -H "$AUTH")
STATUS=$(echo "$RESPONSE" | tail -1)
assert_status "List tax rates" 200 "$STATUS"

echo ""

# ============================================
# REPORTS
# ============================================
echo -e "${YELLOW}--- Reports ---${NC}"

RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/reports/dashboard" -H "$AUTH")
STATUS=$(echo "$RESPONSE" | tail -1)
assert_status "Dashboard KPIs" 200 "$STATUS"

RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/reports/cash-forecast" -H "$AUTH")
STATUS=$(echo "$RESPONSE" | tail -1)
assert_status "Cash forecast" 200 "$STATUS"

RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/reports/revenue-breakdown" -H "$AUTH")
STATUS=$(echo "$RESPONSE" | tail -1)
assert_status "Revenue breakdown" 200 "$STATUS"

echo ""

# ============================================
# INTEGRATIONS
# ============================================
echo -e "${YELLOW}--- Integrations ---${NC}"

RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/integrations" \
  -H "$AUTH" -H "Content-Type: application/json" \
  -d '{"provider":"XERO","name":"Xero Accounting","direction":"BIDIRECTIONAL"}')
STATUS=$(echo "$RESPONSE" | tail -1)
assert_status "Create integration" 201 "$STATUS"
INTEGRATION_ID=$(echo "$RESPONSE" | sed '$d' | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/integrations" -H "$AUTH")
STATUS=$(echo "$RESPONSE" | tail -1)
assert_status "List integrations" 200 "$STATUS"

echo ""

# ============================================
# SUMMARY
# ============================================
echo -e "${YELLOW}=== Finance Integration Test Results ===${NC}"
echo -e "Total: $TOTAL | ${GREEN}Pass: $PASS${NC} | ${RED}Fail: $FAIL${NC}"

if [ "$FAIL" -gt 0 ]; then
  exit 1
fi
