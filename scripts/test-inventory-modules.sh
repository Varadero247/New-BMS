#!/bin/bash
# Comprehensive test script for Inventory modules
# Tests: Products, Inventory, Warehouses, Categories, Transactions, Suppliers
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
echo "  Inventory Modules - Comprehensive Test Suite"
echo "============================================"
echo ""

# ─────────────────────────────────────────────
echo "1. CATEGORIES MODULE"
echo "─────────────────────────────────────────"

# 1a. POST - Create category
echo "  Creating category..."
CAT_RESULT=$(curl -s -X POST "$GW/api/inventory/categories" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "name":"Test Electronics",
  "description":"Electronic components and devices for testing",
  "code":"TEST-ELEC"
}')
CAT_SUCCESS=$(echo "$CAT_RESULT" | jq -r '.success')
CAT_ID=$(echo "$CAT_RESULT" | jq -r '.data.id')
assert "POST /categories - success" "true" "$CAT_SUCCESS"
assert "POST /categories - correct name" "Test Electronics" "$(echo "$CAT_RESULT" | jq -r '.data.name')"

# 1b. POST - Create subcategory
echo "  Creating subcategory..."
SUBCAT_RESULT=$(curl -s -X POST "$GW/api/inventory/categories" -H "$AUTH" -H "Content-Type: application/json" -d "{
  \"name\":\"Test Sensors\",
  \"description\":\"Sensor components\",
  \"code\":\"TEST-SENS\",
  \"parentId\":\"$CAT_ID\"
}")
SUBCAT_SUCCESS=$(echo "$SUBCAT_RESULT" | jq -r '.success')
SUBCAT_ID=$(echo "$SUBCAT_RESULT" | jq -r '.data.id')
assert "POST /categories (subcategory) - success" "true" "$SUBCAT_SUCCESS"
assert "POST /categories (subcategory) - has parent" "$CAT_ID" "$(echo "$SUBCAT_RESULT" | jq -r '.data.parentId')"

# 1c. GET - List categories (hierarchical)
echo "  Listing categories (hierarchical)..."
LIST_RESULT=$(curl -s "$GW/api/inventory/categories" -H "$AUTH")
assert "GET /categories - success" "true" "$(echo "$LIST_RESULT" | jq -r '.success')"
CAT_COUNT=$(echo "$LIST_RESULT" | jq -r '.data | length')
assert "GET /categories - has records" "true" "$([ "$CAT_COUNT" -gt 0 ] && echo true || echo false)"

# 1d. GET - List categories (flat)
echo "  Listing categories (flat)..."
FLAT_RESULT=$(curl -s "$GW/api/inventory/categories?flat=true" -H "$AUTH")
assert "GET /categories?flat=true - success" "true" "$(echo "$FLAT_RESULT" | jq -r '.success')"

# 1e. GET - Single category
echo "  Getting single category..."
GET_RESULT=$(curl -s "$GW/api/inventory/categories/$CAT_ID" -H "$AUTH")
assert "GET /categories/:id - success" "true" "$(echo "$GET_RESULT" | jq -r '.success')"
assert "GET /categories/:id - correct name" "Test Electronics" "$(echo "$GET_RESULT" | jq -r '.data.name')"
assert "GET /categories/:id - has children" "true" "$(echo "$GET_RESULT" | jq -r '(.data.children | length) > 0')"

# 1f. PATCH - Update category
echo "  Updating category..."
PATCH_RESULT=$(curl -s -X PATCH "$GW/api/inventory/categories/$CAT_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{"description":"Updated description for test electronics"}')
assert "PATCH /categories/:id - success" "true" "$(echo "$PATCH_RESULT" | jq -r '.success')"

echo ""

# ─────────────────────────────────────────────
echo "2. SUPPLIERS MODULE"
echo "─────────────────────────────────────────"

# 2a. POST - Create supplier
echo "  Creating supplier..."
SUP_RESULT=$(curl -s -X POST "$GW/api/inventory/suppliers" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "code":"SUP-TEST-001",
  "name":"Test Electronics Supplier Co",
  "contactName":"Jane Smith",
  "email":"jane@testsupplier.com",
  "phone":"+1-555-0100",
  "paymentTerms":"Net 30",
  "currency":"USD",
  "rating":4.5
}')
SUP_SUCCESS=$(echo "$SUP_RESULT" | jq -r '.success')
SUP_ID=$(echo "$SUP_RESULT" | jq -r '.data.id')
assert "POST /suppliers - success" "true" "$SUP_SUCCESS"
assert "POST /suppliers - correct name" "Test Electronics Supplier Co" "$(echo "$SUP_RESULT" | jq -r '.data.name')"
assert "POST /suppliers - status ACTIVE" "ACTIVE" "$(echo "$SUP_RESULT" | jq -r '.data.status')"

# 2b. GET - List suppliers
echo "  Listing suppliers..."
LIST_RESULT=$(curl -s "$GW/api/inventory/suppliers" -H "$AUTH")
assert "GET /suppliers - success" "true" "$(echo "$LIST_RESULT" | jq -r '.success')"
SUP_COUNT=$(echo "$LIST_RESULT" | jq -r '.data | length')
assert "GET /suppliers - has records" "true" "$([ "$SUP_COUNT" -gt 0 ] && echo true || echo false)"

# 2c. GET - Single supplier
echo "  Getting single supplier..."
GET_RESULT=$(curl -s "$GW/api/inventory/suppliers/$SUP_ID" -H "$AUTH")
assert "GET /suppliers/:id - success" "true" "$(echo "$GET_RESULT" | jq -r '.success')"
assert "GET /suppliers/:id - correct name" "Test Electronics Supplier Co" "$(echo "$GET_RESULT" | jq -r '.data.name')"

# 2d. PATCH - Update supplier
echo "  Updating supplier..."
PATCH_RESULT=$(curl -s -X PATCH "$GW/api/inventory/suppliers/$SUP_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{"rating":5}')
assert "PATCH /suppliers/:id - success" "true" "$(echo "$PATCH_RESULT" | jq -r '.success')"

# 2e. GET - Search suppliers
echo "  Searching suppliers..."
SEARCH_RESULT=$(curl -s "$GW/api/inventory/suppliers?search=Test" -H "$AUTH")
assert "GET /suppliers?search - finds result" "true" "$(echo "$SEARCH_RESULT" | jq -r '(.data | length) > 0')"

echo ""

# ─────────────────────────────────────────────
echo "3. WAREHOUSES MODULE"
echo "─────────────────────────────────────────"

# 3a. POST - Create warehouse
echo "  Creating warehouse..."
WH_RESULT=$(curl -s -X POST "$GW/api/inventory/warehouses" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "code":"WH-TEST-001",
  "name":"Test Warehouse Alpha",
  "description":"Main test warehouse for integration tests",
  "totalCapacity":10000,
  "capacityUnit":"cubic_meters",
  "isDefault":false
}')
WH_SUCCESS=$(echo "$WH_RESULT" | jq -r '.success')
WH_ID=$(echo "$WH_RESULT" | jq -r '.data.id')
assert "POST /warehouses - success" "true" "$WH_SUCCESS"
assert "POST /warehouses - correct name" "Test Warehouse Alpha" "$(echo "$WH_RESULT" | jq -r '.data.name')"

# 3b. POST - Create second warehouse
echo "  Creating second warehouse..."
WH2_RESULT=$(curl -s -X POST "$GW/api/inventory/warehouses" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "code":"WH-TEST-002",
  "name":"Test Warehouse Beta",
  "description":"Secondary test warehouse",
  "totalCapacity":5000,
  "capacityUnit":"cubic_meters"
}')
WH2_SUCCESS=$(echo "$WH2_RESULT" | jq -r '.success')
WH2_ID=$(echo "$WH2_RESULT" | jq -r '.data.id')
assert "POST /warehouses (second) - success" "true" "$WH2_SUCCESS"

# 3c. GET - List warehouses
echo "  Listing warehouses..."
LIST_RESULT=$(curl -s "$GW/api/inventory/warehouses" -H "$AUTH")
assert "GET /warehouses - success" "true" "$(echo "$LIST_RESULT" | jq -r '.success')"
WH_COUNT=$(echo "$LIST_RESULT" | jq -r '.data | length')
assert "GET /warehouses - has records" "true" "$([ "$WH_COUNT" -gt 0 ] && echo true || echo false)"

# 3d. GET - Single warehouse
echo "  Getting single warehouse..."
GET_RESULT=$(curl -s "$GW/api/inventory/warehouses/$WH_ID" -H "$AUTH")
assert "GET /warehouses/:id - success" "true" "$(echo "$GET_RESULT" | jq -r '.success')"
assert "GET /warehouses/:id - has stats" "true" "$(echo "$GET_RESULT" | jq -r '.data.stats != null')"

# 3e. PATCH - Update warehouse
echo "  Updating warehouse..."
PATCH_RESULT=$(curl -s -X PATCH "$GW/api/inventory/warehouses/$WH_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{"description":"Updated test warehouse description"}')
assert "PATCH /warehouses/:id - success" "true" "$(echo "$PATCH_RESULT" | jq -r '.success')"

# 3f. Duplicate code check
echo "  Testing duplicate code..."
DUP_RESULT=$(curl -s -X POST "$GW/api/inventory/warehouses" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "code":"WH-TEST-001",
  "name":"Duplicate Warehouse"
}')
assert "POST /warehouses - duplicate code rejected" "DUPLICATE_CODE" "$(echo "$DUP_RESULT" | jq -r '.error.code')"

echo ""

# ─────────────────────────────────────────────
echo "4. PRODUCTS MODULE"
echo "─────────────────────────────────────────"

# 4a. POST - Create product
echo "  Creating product..."
PROD_RESULT=$(curl -s -X POST "$GW/api/inventory/products" -H "$AUTH" -H "Content-Type: application/json" -d "{
  \"sku\":\"TEST-SKU-001\",
  \"barcode\":\"1234567890123\",
  \"name\":\"Test Temperature Sensor\",
  \"description\":\"High-precision temperature sensor for integration tests\",
  \"categoryId\":\"$CAT_ID\",
  \"supplierId\":\"$SUP_ID\",
  \"brand\":\"TestBrand\",
  \"costPrice\":25.50,
  \"sellingPrice\":49.99,
  \"reorderPoint\":10,
  \"reorderQuantity\":50,
  \"minStockLevel\":5,
  \"maxStockLevel\":200,
  \"leadTimeDays\":7
}")
PROD_SUCCESS=$(echo "$PROD_RESULT" | jq -r '.success')
PROD_ID=$(echo "$PROD_RESULT" | jq -r '.data.id')
assert "POST /products - success" "true" "$PROD_SUCCESS"
assert "POST /products - correct SKU" "TEST-SKU-001" "$(echo "$PROD_RESULT" | jq -r '.data.sku')"
assert "POST /products - status ACTIVE" "ACTIVE" "$(echo "$PROD_RESULT" | jq -r '.data.status')"

# 4b. GET - List products
echo "  Listing products..."
LIST_RESULT=$(curl -s "$GW/api/inventory/products" -H "$AUTH")
assert "GET /products - success" "true" "$(echo "$LIST_RESULT" | jq -r '.success')"
PROD_COUNT=$(echo "$LIST_RESULT" | jq -r '.data | length')
assert "GET /products - has records" "true" "$([ "$PROD_COUNT" -gt 0 ] && echo true || echo false)"

# 4c. GET - Single product
echo "  Getting single product..."
GET_RESULT=$(curl -s "$GW/api/inventory/products/$PROD_ID" -H "$AUTH")
assert "GET /products/:id - success" "true" "$(echo "$GET_RESULT" | jq -r '.success')"
assert "GET /products/:id - correct name" "Test Temperature Sensor" "$(echo "$GET_RESULT" | jq -r '.data.name')"

# 4d. GET - Search products
echo "  Searching products..."
SEARCH_RESULT=$(curl -s "$GW/api/inventory/products?search=Temperature" -H "$AUTH")
assert "GET /products?search - finds result" "true" "$(echo "$SEARCH_RESULT" | jq -r '(.data | length) > 0')"

# 4e. GET - Quick search by SKU
echo "  Quick search by SKU..."
SKU_RESULT=$(curl -s "$GW/api/inventory/products/search?q=TEST-SKU-001" -H "$AUTH")
assert "GET /products/search?q=SKU - success" "true" "$(echo "$SKU_RESULT" | jq -r '.success')"
assert "GET /products/search?q=SKU - correct product" "TEST-SKU-001" "$(echo "$SKU_RESULT" | jq -r '.data.sku')"

# 4f. PATCH - Update product
echo "  Updating product..."
PATCH_RESULT=$(curl -s -X PATCH "$GW/api/inventory/products/$PROD_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{"sellingPrice":54.99}')
assert "PATCH /products/:id - success" "true" "$(echo "$PATCH_RESULT" | jq -r '.success')"

# 4g. Duplicate SKU check
echo "  Testing duplicate SKU..."
DUP_RESULT=$(curl -s -X POST "$GW/api/inventory/products" -H "$AUTH" -H "Content-Type: application/json" -d '{"sku":"TEST-SKU-001","name":"Duplicate Product","costPrice":10,"sellingPrice":20}')
assert "POST /products - duplicate SKU rejected" "DUPLICATE_SKU" "$(echo "$DUP_RESULT" | jq -r '.error.code')"

# 4h. GET - Low stock products
echo "  Getting low stock products..."
LOW_RESULT=$(curl -s "$GW/api/inventory/products/low-stock" -H "$AUTH")
assert "GET /products/low-stock - success" "true" "$(echo "$LOW_RESULT" | jq -r '.success')"

# 4i. 404
NOT_FOUND=$(curl -s "$GW/api/inventory/products/nonexistent-id" -H "$AUTH")
assert "GET /products/:id - 404" "NOT_FOUND" "$(echo "$NOT_FOUND" | jq -r '.error.code')"

echo ""

# ─────────────────────────────────────────────
echo "5. INVENTORY MODULE"
echo "─────────────────────────────────────────"

# 5a. GET - List inventory
echo "  Listing inventory..."
INV_RESULT=$(curl -s "$GW/api/inventory/inventory" -H "$AUTH")
assert "GET /inventory - success" "true" "$(echo "$INV_RESULT" | jq -r '.success')"

# 5b. POST - Receive goods
echo "  Receiving goods..."
RECEIVE_RESULT=$(curl -s -X POST "$GW/api/inventory/inventory/receive" -H "$AUTH" -H "Content-Type: application/json" -d "{
  \"productId\":\"$PROD_ID\",
  \"warehouseId\":\"$WH_ID\",
  \"quantity\":100,
  \"unitCost\":25.50,
  \"referenceType\":\"INITIAL\",
  \"binLocation\":\"A-01-01\",
  \"notes\":\"Initial stock for integration test\"
}")
RECEIVE_SUCCESS=$(echo "$RECEIVE_RESULT" | jq -r '.success')
assert "POST /inventory/receive - success" "true" "$RECEIVE_SUCCESS"
assert "POST /inventory/receive - quantity set" "100" "$(echo "$RECEIVE_RESULT" | jq -r '.data.inventory.quantityOnHand')"

# 5c. POST - Receive goods in second warehouse
echo "  Receiving goods in second warehouse..."
RECEIVE2_RESULT=$(curl -s -X POST "$GW/api/inventory/inventory/receive" -H "$AUTH" -H "Content-Type: application/json" -d "{
  \"productId\":\"$PROD_ID\",
  \"warehouseId\":\"$WH2_ID\",
  \"quantity\":50,
  \"unitCost\":25.50,
  \"binLocation\":\"B-01-01\"
}")
assert "POST /inventory/receive (warehouse 2) - success" "true" "$(echo "$RECEIVE2_RESULT" | jq -r '.success')"

# 5d. GET - Inventory summary
echo "  Getting inventory summary..."
SUMMARY_RESULT=$(curl -s "$GW/api/inventory/inventory/summary" -H "$AUTH")
assert "GET /inventory/summary - success" "true" "$(echo "$SUMMARY_RESULT" | jq -r '.success')"
assert "GET /inventory/summary - has totalQuantityOnHand" "true" "$(echo "$SUMMARY_RESULT" | jq -r '.data.totalQuantityOnHand != null')"

# 5e. GET - Product availability
echo "  Checking product availability..."
AVAIL_RESULT=$(curl -s "$GW/api/inventory/inventory/availability/$PROD_ID" -H "$AUTH")
assert "GET /inventory/availability/:id - success" "true" "$(echo "$AVAIL_RESULT" | jq -r '.success')"
assert "GET /inventory/availability - totalOnHand is 150" "150" "$(echo "$AVAIL_RESULT" | jq -r '.data.totalOnHand')"
assert "GET /inventory/availability - byWarehouse count" "2" "$(echo "$AVAIL_RESULT" | jq -r '.data.byWarehouse | length')"

# 5f. POST - Stock adjustment
echo "  Adjusting stock..."
ADJUST_RESULT=$(curl -s -X POST "$GW/api/inventory/inventory/adjust" -H "$AUTH" -H "Content-Type: application/json" -d "{
  \"productId\":\"$PROD_ID\",
  \"warehouseId\":\"$WH_ID\",
  \"adjustmentType\":\"ADJUSTMENT_OUT\",
  \"quantity\":5,
  \"reason\":\"Damaged during handling\",
  \"notes\":\"Integration test adjustment\"
}")
ADJUST_SUCCESS=$(echo "$ADJUST_RESULT" | jq -r '.success')
assert "POST /inventory/adjust - success" "true" "$ADJUST_SUCCESS"
assert "POST /inventory/adjust - quantity reduced to 95" "95" "$(echo "$ADJUST_RESULT" | jq -r '.data.inventory.quantityOnHand')"

# 5g. POST - Transfer stock
echo "  Transferring stock between warehouses..."
TRANSFER_RESULT=$(curl -s -X POST "$GW/api/inventory/inventory/transfer" -H "$AUTH" -H "Content-Type: application/json" -d "{
  \"productId\":\"$PROD_ID\",
  \"fromWarehouseId\":\"$WH_ID\",
  \"toWarehouseId\":\"$WH2_ID\",
  \"quantity\":20,
  \"reason\":\"Rebalancing stock\",
  \"fromBinLocation\":\"A-01-01\",
  \"toBinLocation\":\"B-01-02\"
}")
TRANSFER_SUCCESS=$(echo "$TRANSFER_RESULT" | jq -r '.success')
assert "POST /inventory/transfer - success" "true" "$TRANSFER_SUCCESS"
assert_contains "POST /inventory/transfer - has transfer ref" "TRF-" "$(echo "$TRANSFER_RESULT" | jq -r '.data.transferReference')"
assert "POST /inventory/transfer - 2 transactions created" "2" "$(echo "$TRANSFER_RESULT" | jq -r '.data.transactions | length')"

# 5h. Verify stock levels after transfer
echo "  Verifying stock after transfer..."
AVAIL2_RESULT=$(curl -s "$GW/api/inventory/inventory/availability/$PROD_ID" -H "$AUTH")
assert "Availability - WH1 has 75" "75" "$(echo "$AVAIL2_RESULT" | jq -r "[.data.byWarehouse[] | select(.warehouse.id == \"$WH_ID\")] | .[0].quantityOnHand")"
assert "Availability - WH2 has 70" "70" "$(echo "$AVAIL2_RESULT" | jq -r "[.data.byWarehouse[] | select(.warehouse.id == \"$WH2_ID\")] | .[0].quantityOnHand")"
assert "Availability - total is 145" "145" "$(echo "$AVAIL2_RESULT" | jq -r '.data.totalOnHand')"

# 5i. POST - Issue goods
echo "  Issuing goods..."
ISSUE_RESULT=$(curl -s -X POST "$GW/api/inventory/inventory/issue" -H "$AUTH" -H "Content-Type: application/json" -d "{
  \"productId\":\"$PROD_ID\",
  \"warehouseId\":\"$WH_ID\",
  \"quantity\":10,
  \"referenceType\":\"SALES_ORDER\",
  \"notes\":\"Test sales order fulfillment\"
}")
ISSUE_SUCCESS=$(echo "$ISSUE_RESULT" | jq -r '.success')
assert "POST /inventory/issue - success" "true" "$ISSUE_SUCCESS"
assert "POST /inventory/issue - quantity reduced to 65" "65" "$(echo "$ISSUE_RESULT" | jq -r '.data.inventory.quantityOnHand')"

# 5j. Insufficient stock check
echo "  Testing insufficient stock..."
INSUF_RESULT=$(curl -s -X POST "$GW/api/inventory/inventory/issue" -H "$AUTH" -H "Content-Type: application/json" -d "{
  \"productId\":\"$PROD_ID\",
  \"warehouseId\":\"$WH_ID\",
  \"quantity\":999
}")
assert "POST /inventory/issue - insufficient stock" "INSUFFICIENT_STOCK" "$(echo "$INSUF_RESULT" | jq -r '.error.code')"

# 5k. GET - Warehouse inventory
echo "  Getting warehouse inventory..."
WH_INV_RESULT=$(curl -s "$GW/api/inventory/warehouses/$WH_ID/inventory" -H "$AUTH")
assert "GET /warehouses/:id/inventory - success" "true" "$(echo "$WH_INV_RESULT" | jq -r '.success')"

echo ""

# ─────────────────────────────────────────────
echo "6. TRANSACTIONS MODULE"
echo "─────────────────────────────────────────"

# 6a. GET - List transactions
echo "  Listing transactions..."
TXN_RESULT=$(curl -s "$GW/api/inventory/inventory/transactions" -H "$AUTH")
assert "GET /inventory/transactions - success" "true" "$(echo "$TXN_RESULT" | jq -r '.success')"
TXN_COUNT=$(echo "$TXN_RESULT" | jq -r '.data | length')
assert "GET /inventory/transactions - has records" "true" "$([ "$TXN_COUNT" -gt 0 ] && echo true || echo false)"

# 6b. GET - Transaction summary
echo "  Getting transaction summary..."
TXN_SUMMARY=$(curl -s "$GW/api/inventory/inventory/transactions/summary" -H "$AUTH")
assert "GET /inventory/transactions/summary - success" "true" "$(echo "$TXN_SUMMARY" | jq -r '.success')"
assert "GET /inventory/transactions/summary - has totals" "true" "$(echo "$TXN_SUMMARY" | jq -r '.data.totals != null')"

# 6c. GET - Product transaction history
echo "  Getting product transaction history..."
PROD_TXN=$(curl -s "$GW/api/inventory/inventory/transactions/product/$PROD_ID" -H "$AUTH")
assert "GET /inventory/transactions/product/:id - success" "true" "$(echo "$PROD_TXN" | jq -r '.success')"
PROD_TXN_COUNT=$(echo "$PROD_TXN" | jq -r '.data.transactions | length')
assert "GET /inventory/transactions/product/:id - has transaction history" "true" "$([ "$PROD_TXN_COUNT" -gt 0 ] && echo true || echo false)"

# 6d. GET - Filter by warehouse
FILTER_RESULT=$(curl -s "$GW/api/inventory/inventory/transactions?warehouseId=$WH_ID" -H "$AUTH")
assert "GET /transactions?warehouseId filter" "true" "$(echo "$FILTER_RESULT" | jq -r '.success')"

# 6e. GET - Filter by type
TYPE_RESULT=$(curl -s "$GW/api/inventory/inventory/transactions?transactionType=RECEIPT" -H "$AUTH")
assert "GET /transactions?transactionType filter" "true" "$(echo "$TYPE_RESULT" | jq -r '.success')"

echo ""

# ─────────────────────────────────────────────
echo "7. GATEWAY PROXY"
echo "─────────────────────────────────────────"

echo "  Testing all Inventory routes through gateway..."
for ROUTE in products inventory warehouses categories suppliers; do
  RESULT=$(curl -s "$GW/api/inventory/$ROUTE" -H "$AUTH")
  assert "Gateway /api/inventory/$ROUTE" "true" "$(echo "$RESULT" | jq -r '.success')"
done

echo ""

# ─────────────────────────────────────────────
echo "8. CLEANUP"
echo "─────────────────────────────────────────"

# Delete product (should fail because it has inventory)
echo "  Testing delete product with inventory..."
DEL_PROD=$(curl -s -X DELETE "$GW/api/inventory/products/$PROD_ID" -H "$AUTH")
assert "DELETE /products/:id with inventory - blocked" "HAS_INVENTORY" "$(echo "$DEL_PROD" | jq -r '.error.code')"

# Delete subcategory first (no products assigned)
DEL_SUBCAT=$(curl -s -X DELETE "$GW/api/inventory/categories/$SUBCAT_ID" -H "$AUTH")
assert "DELETE /categories/:id (subcategory) - success" "true" "$(echo "$DEL_SUBCAT" | jq -r '.success')"

# Delete parent category (should fail because product uses it)
DEL_CAT=$(curl -s -X DELETE "$GW/api/inventory/categories/$CAT_ID" -H "$AUTH")
assert "DELETE /categories/:id with products - blocked" "HAS_PRODUCTS" "$(echo "$DEL_CAT" | jq -r '.error.code')"

# Delete supplier (should fail because product uses it)
DEL_SUP=$(curl -s -X DELETE "$GW/api/inventory/suppliers/$SUP_ID" -H "$AUTH")
assert "DELETE /suppliers/:id with products - blocked" "HAS_PRODUCTS" "$(echo "$DEL_SUP" | jq -r '.error.code')"

# Delete warehouses (should fail because they have inventory)
DEL_WH=$(curl -s -X DELETE "$GW/api/inventory/warehouses/$WH_ID" -H "$AUTH")
assert "DELETE /warehouses/:id with inventory - blocked" "HAS_INVENTORY" "$(echo "$DEL_WH" | jq -r '.error.code')"

echo ""
echo "============================================"
echo "  RESULTS: $PASS passed, $FAIL failed (out of $TOTAL)"
echo "============================================"

if [ $FAIL -gt 0 ]; then
  exit 1
fi
