#!/bin/bash
# Comprehensive test script for Documents modules
# Tests: Documents, Versions, Approvals, Read Receipts, Search, Dashboard

API="http://localhost:4031"
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
echo "  Documents Modules - Comprehensive Test Suite"
echo "============================================"
echo ""

# ─────────────────────────────────────────────
echo "1. DOCUMENTS MODULE"
echo "─────────────────────────────────────────"

# 1a. POST - Create document
echo "  Creating document..."
DOC_RESULT=$(curl -s -X POST "$API/api/documents" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "title": "Health and Safety Policy 2026",
  "description": "Company-wide H&S policy document covering all departments and operations",
  "category": "Policy",
  "department": "Health and Safety",
  "status": "DRAFT",
  "currentVersion": 1,
  "fileUrl": "https://storage.example.com/docs/hs-policy-2026.pdf",
  "fileSize": 204800,
  "mimeType": "application/pdf",
  "owner": "admin@ims.local",
  "ownerName": "System Administrator",
  "tags": ["policy", "health-safety", "compliance"],
  "notes": "Annual review required by March 2027"
}')
DOC_SUCCESS=$(echo "$DOC_RESULT" | jq -r '.success')
DOC_ID=$(echo "$DOC_RESULT" | jq -r '.data.id')
DOC_REF=$(echo "$DOC_RESULT" | jq -r '.data.referenceNumber')
assert "POST /documents - success" "true" "$DOC_SUCCESS"
assert_contains "POST /documents - has ref number" "DOC-" "$DOC_REF"
assert "POST /documents - status is DRAFT" "DRAFT" "$(echo "$DOC_RESULT" | jq -r '.data.status')"
assert "POST /documents - title correct" "Health and Safety Policy 2026" "$(echo "$DOC_RESULT" | jq -r '.data.title')"

# 1b. POST - Create second document
echo "  Creating second document..."
DOC2_RESULT=$(curl -s -X POST "$API/api/documents" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "title": "Environmental Management Procedure",
  "description": "ISO 14001 aligned environmental management procedure",
  "category": "Procedure",
  "department": "Environment",
  "status": "APPROVED",
  "currentVersion": 3
}')
DOC2_ID=$(echo "$DOC2_RESULT" | jq -r '.data.id')
assert "POST /documents - second doc success" "true" "$(echo "$DOC2_RESULT" | jq -r '.success')"
assert "POST /documents - second doc status APPROVED" "APPROVED" "$(echo "$DOC2_RESULT" | jq -r '.data.status')"

# 1c. GET - List documents
echo "  Listing documents..."
LIST_RESULT=$(curl -s "$API/api/documents" -H "$AUTH")
assert "GET /documents - success" "true" "$(echo "$LIST_RESULT" | jq -r '.success')"
assert "GET /documents - has pagination" "true" "$(echo "$LIST_RESULT" | jq -r '.pagination != null')"
DOC_COUNT=$(echo "$LIST_RESULT" | jq -r '.data | length')
assert "GET /documents - has records" "true" "$([ "$DOC_COUNT" -gt 0 ] && echo true || echo false)"

# 1d. GET - Single document
echo "  Getting single document..."
GET_RESULT=$(curl -s "$API/api/documents/$DOC_ID" -H "$AUTH")
assert "GET /documents/:id - success" "true" "$(echo "$GET_RESULT" | jq -r '.success')"
assert "GET /documents/:id - correct title" "Health and Safety Policy 2026" "$(echo "$GET_RESULT" | jq -r '.data.title')"

# 1e. PUT - Update document
echo "  Updating document..."
PUT_RESULT=$(curl -s -X PUT "$API/api/documents/$DOC_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "status": "PENDING_REVIEW",
  "notes": "Submitted for management review - Feb 2026"
}')
assert "PUT /documents/:id - success" "true" "$(echo "$PUT_RESULT" | jq -r '.success')"
assert "PUT /documents/:id - status updated" "PENDING_REVIEW" "$(echo "$PUT_RESULT" | jq -r '.data.status')"

# 1f. GET - Filter by status
echo "  Filtering by status..."
FILTER_RESULT=$(curl -s "$API/api/documents?status=PENDING_REVIEW" -H "$AUTH")
assert "GET /documents?status filter" "true" "$(echo "$FILTER_RESULT" | jq -r '.success')"
assert "GET /documents?status - finds result" "true" "$(echo "$FILTER_RESULT" | jq -r '(.data | length) > 0')"

# 1g. GET - Search
echo "  Searching documents..."
SEARCH_RESULT=$(curl -s "$API/api/documents?search=Health" -H "$AUTH")
assert "GET /documents?search - success" "true" "$(echo "$SEARCH_RESULT" | jq -r '.success')"
assert "GET /documents?search - finds result" "true" "$(echo "$SEARCH_RESULT" | jq -r '(.data | length) > 0')"

# 1h. Validation error - missing title
echo "  Testing validation..."
VAL_RESULT=$(curl -s -X POST "$API/api/documents" -H "$AUTH" -H "Content-Type: application/json" -d '{"description":"no title"}')
assert "POST /documents - validation error" "VALIDATION_ERROR" "$(echo "$VAL_RESULT" | jq -r '.error.code')"

# 1i. 404 not found
NOT_FOUND=$(curl -s "$API/api/documents/00000000-0000-0000-0000-000000000999" -H "$AUTH")
assert "GET /documents/:id - 404" "NOT_FOUND" "$(echo "$NOT_FOUND" | jq -r '.error.code')"

echo ""

# ─────────────────────────────────────────────
echo "2. VERSIONS MODULE"
echo "─────────────────────────────────────────"

# 2a. POST - Create version
echo "  Creating document version..."
VER_RESULT=$(curl -s -X POST "$API/api/versions" -H "$AUTH" -H "Content-Type: application/json" -d "{
  \"documentId\": \"$DOC_ID\",
  \"version\": 1,
  \"fileUrl\": \"https://storage.example.com/docs/hs-policy-v1.pdf\",
  \"fileSize\": 204800,
  \"changeNotes\": \"Initial version - drafted from 2025 template\"
}")
VER_SUCCESS=$(echo "$VER_RESULT" | jq -r '.success')
VER_ID=$(echo "$VER_RESULT" | jq -r '.data.id')
assert "POST /versions - success" "true" "$VER_SUCCESS"
assert "POST /versions - version number" "1" "$(echo "$VER_RESULT" | jq -r '.data.version')"
assert "POST /versions - linked to document" "$DOC_ID" "$(echo "$VER_RESULT" | jq -r '.data.documentId')"

# 2b. POST - Create second version
echo "  Creating second version..."
VER2_RESULT=$(curl -s -X POST "$API/api/versions" -H "$AUTH" -H "Content-Type: application/json" -d "{
  \"documentId\": \"$DOC_ID\",
  \"version\": 2,
  \"fileUrl\": \"https://storage.example.com/docs/hs-policy-v2.pdf\",
  \"changeNotes\": \"Revised section 4 - contractor management\"
}")
VER2_ID=$(echo "$VER2_RESULT" | jq -r '.data.id')
assert "POST /versions - second version success" "true" "$(echo "$VER2_RESULT" | jq -r '.success')"
assert "POST /versions - second version number" "2" "$(echo "$VER2_RESULT" | jq -r '.data.version')"

# 2c. GET - List versions
echo "  Listing versions..."
VER_LIST=$(curl -s "$API/api/versions" -H "$AUTH")
assert "GET /versions - success" "true" "$(echo "$VER_LIST" | jq -r '.success')"
assert "GET /versions - has records" "true" "$(echo "$VER_LIST" | jq -r '(.data | length) > 0')"

# 2d. GET - Single version
echo "  Getting single version..."
VER_GET=$(curl -s "$API/api/versions/$VER_ID" -H "$AUTH")
assert "GET /versions/:id - success" "true" "$(echo "$VER_GET" | jq -r '.success')"
assert "GET /versions/:id - changeNotes correct" "Initial version - drafted from 2025 template" "$(echo "$VER_GET" | jq -r '.data.changeNotes')"

# 2e. PUT - Update version
echo "  Updating version..."
VER_PUT=$(curl -s -X PUT "$API/api/versions/$VER_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{"changeNotes":"Initial version - reviewed and approved by H&S Director"}')
assert "PUT /versions/:id - success" "true" "$(echo "$VER_PUT" | jq -r '.success')"
assert_contains "PUT /versions/:id - notes updated" "approved" "$(echo "$VER_PUT" | jq -r '.data.changeNotes')"

# 2f. Validation - missing documentId
VAL_VER=$(curl -s -X POST "$API/api/versions" -H "$AUTH" -H "Content-Type: application/json" -d '{"version":1}')
assert "POST /versions - validation error (missing documentId)" "VALIDATION_ERROR" "$(echo "$VAL_VER" | jq -r '.error.code')"

# 2g. 404 version
VER_404=$(curl -s "$API/api/versions/00000000-0000-0000-0000-000000000999" -H "$AUTH")
assert "GET /versions/:id - 404" "NOT_FOUND" "$(echo "$VER_404" | jq -r '.error.code')"

echo ""

# ─────────────────────────────────────────────
echo "3. APPROVALS MODULE"
echo "─────────────────────────────────────────"

# 3a. POST - Create approval
echo "  Creating approval..."
APR_RESULT=$(curl -s -X POST "$API/api/approvals" -H "$AUTH" -H "Content-Type: application/json" -d "{
  \"documentId\": \"$DOC_ID\",
  \"approver\": \"manager@ims.local\",
  \"approverName\": \"Department Manager\",
  \"status\": \"PENDING\",
  \"comments\": \"Awaiting review of section 4\"
}")
APR_SUCCESS=$(echo "$APR_RESULT" | jq -r '.success')
APR_ID=$(echo "$APR_RESULT" | jq -r '.data.id')
assert "POST /approvals - success" "true" "$APR_SUCCESS"
assert "POST /approvals - status PENDING" "PENDING" "$(echo "$APR_RESULT" | jq -r '.data.status')"
assert "POST /approvals - linked to document" "$DOC_ID" "$(echo "$APR_RESULT" | jq -r '.data.documentId')"

# 3b. GET - List approvals
echo "  Listing approvals..."
APR_LIST=$(curl -s "$API/api/approvals" -H "$AUTH")
assert "GET /approvals - success" "true" "$(echo "$APR_LIST" | jq -r '.success')"
assert "GET /approvals - has records" "true" "$(echo "$APR_LIST" | jq -r '(.data | length) > 0')"

# 3c. GET - Filter by status
APR_FILTER=$(curl -s "$API/api/approvals?status=PENDING" -H "$AUTH")
assert "GET /approvals?status=PENDING" "true" "$(echo "$APR_FILTER" | jq -r '.success')"

# 3d. GET - Single approval
echo "  Getting single approval..."
APR_GET=$(curl -s "$API/api/approvals/$APR_ID" -H "$AUTH")
assert "GET /approvals/:id - success" "true" "$(echo "$APR_GET" | jq -r '.success')"
assert "GET /approvals/:id - approverName correct" "Department Manager" "$(echo "$APR_GET" | jq -r '.data.approverName')"

# 3e. PUT - Approve the document
echo "  Approving document..."
APR_PUT=$(curl -s -X PUT "$API/api/approvals/$APR_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "status": "APPROVED",
  "comments": "Reviewed and approved. Policy meets ISO 45001 requirements.",
  "decidedAt": "2026-02-23T10:00:00+00:00"
}')
assert "PUT /approvals/:id - success" "true" "$(echo "$APR_PUT" | jq -r '.success')"
assert "PUT /approvals/:id - status APPROVED" "APPROVED" "$(echo "$APR_PUT" | jq -r '.data.status')"

# 3f. Validation - missing approver
VAL_APR=$(curl -s -X POST "$API/api/approvals" -H "$AUTH" -H "Content-Type: application/json" -d "{\"documentId\":\"$DOC_ID\"}")
assert "POST /approvals - validation error (missing approver)" "VALIDATION_ERROR" "$(echo "$VAL_APR" | jq -r '.error.code')"

# 3g. 404 approval
APR_404=$(curl -s "$API/api/approvals/00000000-0000-0000-0000-000000000999" -H "$AUTH")
assert "GET /approvals/:id - 404" "NOT_FOUND" "$(echo "$APR_404" | jq -r '.error.code')"

echo ""

# ─────────────────────────────────────────────
echo "4. READ RECEIPTS MODULE"
echo "─────────────────────────────────────────"

# 4a. POST - Create read receipt
echo "  Creating read receipt..."
RR_RESULT=$(curl -s -X POST "$API/api/read-receipts" -H "$AUTH" -H "Content-Type: application/json" -d "{
  \"documentId\": \"$DOC_ID\",
  \"userId\": \"user-001\",
  \"userName\": \"Jane Smith\",
  \"status\": \"READ\",
  \"readAt\": \"2026-02-23T09:30:00+00:00\"
}")
RR_SUCCESS=$(echo "$RR_RESULT" | jq -r '.success')
RR_ID=$(echo "$RR_RESULT" | jq -r '.data.id')
assert "POST /read-receipts - success" "true" "$RR_SUCCESS"
assert "POST /read-receipts - status READ" "READ" "$(echo "$RR_RESULT" | jq -r '.data.status')"
assert "POST /read-receipts - userName correct" "Jane Smith" "$(echo "$RR_RESULT" | jq -r '.data.userName')"

# 4b. POST - Second read receipt with ACKNOWLEDGED
echo "  Creating second read receipt..."
RR2_RESULT=$(curl -s -X POST "$API/api/read-receipts" -H "$AUTH" -H "Content-Type: application/json" -d "{
  \"documentId\": \"$DOC_ID\",
  \"userId\": \"user-002\",
  \"userName\": \"Bob Jones\",
  \"status\": \"ACKNOWLEDGED\",
  \"readAt\": \"2026-02-23T10:00:00+00:00\",
  \"acknowledgedAt\": \"2026-02-23T10:05:00+00:00\"
}")
assert "POST /read-receipts - ACKNOWLEDGED status" "ACKNOWLEDGED" "$(echo "$RR2_RESULT" | jq -r '.data.status')"
RR2_ID=$(echo "$RR2_RESULT" | jq -r '.data.id')

# 4c. GET - List read receipts
echo "  Listing read receipts..."
RR_LIST=$(curl -s "$API/api/read-receipts" -H "$AUTH")
assert "GET /read-receipts - success" "true" "$(echo "$RR_LIST" | jq -r '.success')"
assert "GET /read-receipts - has records" "true" "$(echo "$RR_LIST" | jq -r '(.data | length) > 0')"

# 4d. GET - Single read receipt
echo "  Getting single read receipt..."
RR_GET=$(curl -s "$API/api/read-receipts/$RR_ID" -H "$AUTH")
assert "GET /read-receipts/:id - success" "true" "$(echo "$RR_GET" | jq -r '.success')"
assert "GET /read-receipts/:id - userId correct" "user-001" "$(echo "$RR_GET" | jq -r '.data.userId')"

# 4e. PUT - Update read receipt to acknowledged
echo "  Updating read receipt..."
RR_PUT=$(curl -s -X PUT "$API/api/read-receipts/$RR_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "status": "ACKNOWLEDGED",
  "acknowledgedAt": "2026-02-23T11:00:00+00:00"
}')
assert "PUT /read-receipts/:id - success" "true" "$(echo "$RR_PUT" | jq -r '.success')"
assert "PUT /read-receipts/:id - status ACKNOWLEDGED" "ACKNOWLEDGED" "$(echo "$RR_PUT" | jq -r '.data.status')"

# 4f. GET - Filter by status
RR_FILTER=$(curl -s "$API/api/read-receipts?status=ACKNOWLEDGED" -H "$AUTH")
assert "GET /read-receipts?status filter" "true" "$(echo "$RR_FILTER" | jq -r '.success')"

# 4g. Validation error - missing userId
VAL_RR=$(curl -s -X POST "$API/api/read-receipts" -H "$AUTH" -H "Content-Type: application/json" -d "{\"documentId\":\"$DOC_ID\"}")
assert "POST /read-receipts - validation error (missing userId)" "VALIDATION_ERROR" "$(echo "$VAL_RR" | jq -r '.error.code')"

echo ""

# ─────────────────────────────────────────────
echo "5. SEARCH MODULE"
echo "─────────────────────────────────────────"

# 5a. Search with query
echo "  Searching with query..."
SEARCH_Q=$(curl -s "$API/api/search?q=Health" -H "$AUTH")
assert "GET /search?q=Health - success" "true" "$(echo "$SEARCH_Q" | jq -r '.success')"
assert "GET /search?q=Health - finds results" "true" "$(echo "$SEARCH_Q" | jq -r '(.data | length) > 0')"

# 5b. Search empty query returns empty array
SEARCH_EMPTY=$(curl -s "$API/api/search" -H "$AUTH")
assert "GET /search (no q) - success" "true" "$(echo "$SEARCH_EMPTY" | jq -r '.success')"

# 5c. Search by description term
SEARCH_DESC=$(curl -s "$API/api/search?q=ISO" -H "$AUTH")
assert "GET /search?q=ISO - success" "true" "$(echo "$SEARCH_DESC" | jq -r '.success')"

echo ""

# ─────────────────────────────────────────────
echo "6. DASHBOARD MODULE"
echo "─────────────────────────────────────────"

# 6a. Get stats
echo "  Getting dashboard stats..."
STATS=$(curl -s "$API/api/dashboard/stats" -H "$AUTH")
assert "GET /dashboard/stats - success" "true" "$(echo "$STATS" | jq -r '.success')"
assert "GET /dashboard/stats - has totalDocuments" "true" "$(echo "$STATS" | jq -r '.data.totalDocuments != null')"
assert "GET /dashboard/stats - has totalVersions" "true" "$(echo "$STATS" | jq -r '.data.totalVersions != null')"
assert "GET /dashboard/stats - has pendingApprovals" "true" "$(echo "$STATS" | jq -r '.data.pendingApprovals != null')"

echo ""

# ─────────────────────────────────────────────
echo "7. GATEWAY PROXY"
echo "─────────────────────────────────────────"

echo "  Testing routes through gateway..."
for ROUTE in documents versions approvals read-receipts; do
  RESULT=$(curl -s "$GW/api/documents/$ROUTE" -H "$AUTH")
  assert "Gateway /api/documents/$ROUTE" "true" "$(echo "$RESULT" | jq -r '.success')"
done

echo ""

# ─────────────────────────────────────────────
echo "8. DELETE OPERATIONS"
echo "─────────────────────────────────────────"

echo "  Deleting test records..."
DEL_APR=$(curl -s -X DELETE "$API/api/approvals/$APR_ID" -H "$AUTH")
assert "DELETE /approvals/:id" "true" "$(echo "$DEL_APR" | jq -r '.success')"

DEL_RR=$(curl -s -X DELETE "$API/api/read-receipts/$RR_ID" -H "$AUTH")
assert "DELETE /read-receipts/:id" "true" "$(echo "$DEL_RR" | jq -r '.success')"

DEL_RR2=$(curl -s -X DELETE "$API/api/read-receipts/$RR2_ID" -H "$AUTH")
assert "DELETE /read-receipts/:id (second)" "true" "$(echo "$DEL_RR2" | jq -r '.success')"

DEL_VER=$(curl -s -X DELETE "$API/api/versions/$VER_ID" -H "$AUTH")
assert "DELETE /versions/:id" "true" "$(echo "$DEL_VER" | jq -r '.success')"

DEL_VER2=$(curl -s -X DELETE "$API/api/versions/$VER2_ID" -H "$AUTH")
assert "DELETE /versions/:id (second)" "true" "$(echo "$DEL_VER2" | jq -r '.success')"

DEL_DOC=$(curl -s -X DELETE "$API/api/documents/$DOC_ID" -H "$AUTH")
assert "DELETE /documents/:id" "true" "$(echo "$DEL_DOC" | jq -r '.success')"

DEL_DOC2=$(curl -s -X DELETE "$API/api/documents/$DOC2_ID" -H "$AUTH")
assert "DELETE /documents/:id (second)" "true" "$(echo "$DEL_DOC2" | jq -r '.success')"

VERIFY_404=$(curl -s "$API/api/documents/$DOC_ID" -H "$AUTH")
assert "Deleted document returns 404" "NOT_FOUND" "$(echo "$VERIFY_404" | jq -r '.error.code')"

echo ""
echo "============================================"
echo "  RESULTS: $PASS passed, $FAIL failed (out of $TOTAL)"
echo "============================================"

if [ $FAIL -gt 0 ]; then
  exit 1
fi
