#!/bin/bash
# Comprehensive test script for Regulatory Monitor modules
# Tests: Changes, Legal Register, Obligations — CRUD + Gateway

set -e

API="http://localhost:4035"
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
echo "  Regulatory Monitor Modules - Test Suite"
echo "============================================"
echo ""

# ─────────────────────────────────────────────
echo "1. CHANGES MODULE"
echo "─────────────────────────────────────────"

# 1a. POST - Create regulatory change
echo "  Creating regulatory change..."
CHG_RESULT=$(curl -s -X POST "$API/api/changes" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "title": "UK GDPR Amendment 2026 Data Breach Notification",
  "description": "Amendment reduces mandatory data breach notification window from 72 hours to 48 hours",
  "source": "GOVERNMENT",
  "publishedDate": "2026-01-15",
  "effectiveDate": "2026-06-01",
  "status": "UNDER_REVIEW",
  "impact": "HIGH",
  "affectedAreas": ["IT", "Legal", "Operations"],
  "assigneeName": "Jane Smith",
  "assessment": "Significant operational change required to data breach response procedures",
  "actionRequired": "Update incident response SOP, retrain DPO team"
}')
CHG_SUCCESS=$(echo "$CHG_RESULT" | jq -r '.success')
CHG_ID=$(echo "$CHG_RESULT" | jq -r '.data.id')
CHG_REF=$(echo "$CHG_RESULT" | jq -r '.data.referenceNumber')
assert "POST /changes - success" "true" "$CHG_SUCCESS"
assert_contains "POST /changes - has ref number RGC-" "RGC-" "$CHG_REF"
assert "POST /changes - status set" "UNDER_REVIEW" "$(echo "$CHG_RESULT" | jq -r '.data.status')"
assert "POST /changes - impact set" "HIGH" "$(echo "$CHG_RESULT" | jq -r '.data.impact')"

# 1b. POST - Second change
echo "  Creating second regulatory change..."
CHG2_RESULT=$(curl -s -X POST "$API/api/changes" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "title": "HSE COSHH Regulation Update Respiratory Sensitisers",
  "description": "New mandatory health surveillance for workers exposed to respiratory sensitisers",
  "source": "REGULATOR",
  "status": "NEW",
  "impact": "CRITICAL",
  "affectedAreas": ["Health and Safety", "Manufacturing"]
}')
CHG2_ID=$(echo "$CHG2_RESULT" | jq -r '.data.id')
assert "POST /changes second - success" "true" "$(echo "$CHG2_RESULT" | jq -r '.success')"
assert "POST /changes second - CRITICAL impact" "CRITICAL" "$(echo "$CHG2_RESULT" | jq -r '.data.impact')"

# 1c. GET - List changes
echo "  Listing regulatory changes..."
LIST_RESULT=$(curl -s "$API/api/changes" -H "$AUTH")
assert "GET /changes - success" "true" "$(echo "$LIST_RESULT" | jq -r '.success')"
LIST_COUNT=$(echo "$LIST_RESULT" | jq -r '.data | length')
assert "GET /changes - has records" "true" "$([ "$LIST_COUNT" -gt 0 ] && echo true || echo false)"
assert_contains "GET /changes - pagination present" "total" "$(echo "$LIST_RESULT")"

# 1d. GET - Single change by ID
echo "  Getting single change..."
GET_RESULT=$(curl -s "$API/api/changes/$CHG_ID" -H "$AUTH")
assert "GET /changes/:id - success" "true" "$(echo "$GET_RESULT" | jq -r '.success')"
assert "GET /changes/:id - correct title" "UK GDPR Amendment 2026 Data Breach Notification" "$(echo "$GET_RESULT" | jq -r '.data.title')"

# 1e. PUT - Update change
echo "  Updating regulatory change..."
PUT_RESULT=$(curl -s -X PUT "$API/api/changes/$CHG_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "status": "ASSESSED",
  "assessment": "Full operational impact assessed. Response SOP must be updated.",
  "notes": "DPO confirmed update is mandatory"
}')
assert "PUT /changes/:id - success" "true" "$(echo "$PUT_RESULT" | jq -r '.success')"
assert "PUT /changes/:id - status updated to ASSESSED" "ASSESSED" "$(echo "$PUT_RESULT" | jq -r '.data.status')"

# 1f. GET - Filter by status
echo "  Filtering changes by status..."
STATUS_RESULT=$(curl -s "$API/api/changes?status=ASSESSED" -H "$AUTH")
assert "GET /changes?status=ASSESSED - success" "true" "$(echo "$STATUS_RESULT" | jq -r '.success')"
assert "GET /changes?status=ASSESSED - has results" "true" "$(echo "$STATUS_RESULT" | jq -r '(.data | length) > 0')"

# 1g. GET - Search changes
echo "  Searching changes..."
SEARCH_RESULT=$(curl -s "$API/api/changes?search=GDPR" -H "$AUTH")
assert "GET /changes?search=GDPR - success" "true" "$(echo "$SEARCH_RESULT" | jq -r '.success')"

# 1h. 404 for unknown ID
NOT_FOUND=$(curl -s "$API/api/changes/nonexistent-id-xyz" -H "$AUTH")
assert "GET /changes/:id - 404 for unknown" "NOT_FOUND" "$(echo "$NOT_FOUND" | jq -r '.error.code')"

# 1i. Validation error (missing title)
VAL_RESULT=$(curl -s -X POST "$API/api/changes" -H "$AUTH" -H "Content-Type: application/json" -d '{"description":"No title"}')
assert "POST /changes - validation error on missing title" "VALIDATION_ERROR" "$(echo "$VAL_RESULT" | jq -r '.error.code')"

# 1j. DELETE - Soft delete change
DEL_RESULT=$(curl -s -X DELETE "$API/api/changes/$CHG2_ID" -H "$AUTH")
assert "DELETE /changes/:id - success" "true" "$(echo "$DEL_RESULT" | jq -r '.success')"

# 1k. Verify deleted record returns 404
VERIFY=$(curl -s "$API/api/changes/$CHG2_ID" -H "$AUTH")
assert "GET /changes/:id - deleted returns NOT_FOUND" "NOT_FOUND" "$(echo "$VERIFY" | jq -r '.error.code')"

echo ""

# ─────────────────────────────────────────────
echo "2. LEGAL REGISTER MODULE"
echo "─────────────────────────────────────────"

# 2a. POST - Create legal register entry
echo "  Creating legal register entry..."
LR_RESULT=$(curl -s -X POST "$API/api/legal-register" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "title": "Health and Safety at Work Act 1974",
  "legislation": "HSWA 1974",
  "jurisdiction": "United Kingdom",
  "applicability": "All employees and contractors on site",
  "requirements": "Duty of care to employees, safe systems of work, risk assessment, PPE provision",
  "complianceStatus": "COMPLIANT",
  "responsiblePerson": "H&S Manager",
  "reviewDate": "2026-12-31",
  "lastReviewDate": "2026-01-10",
  "notes": "Core statutory duty — full compliance maintained through periodic audit"
}')
LR_SUCCESS=$(echo "$LR_RESULT" | jq -r '.success')
LR_ID=$(echo "$LR_RESULT" | jq -r '.data.id')
LR_REF=$(echo "$LR_RESULT" | jq -r '.data.referenceNumber')
assert "POST /legal-register - success" "true" "$LR_SUCCESS"
assert_contains "POST /legal-register - has ref RLR-" "RLR-" "$LR_REF"
assert "POST /legal-register - title stored" "Health and Safety at Work Act 1974" "$(echo "$LR_RESULT" | jq -r '.data.title')"

# 2b. POST - Second entry
echo "  Creating second legal register entry..."
LR2_RESULT=$(curl -s -X POST "$API/api/legal-register" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "title": "Control of Substances Hazardous to Health Regulations 2002",
  "legislation": "COSHH 2002",
  "jurisdiction": "United Kingdom",
  "applicability": "All departments handling chemicals",
  "requirements": "COSHH assessment, health surveillance, PPE, exposure monitoring",
  "complianceStatus": "PARTIAL",
  "responsiblePerson": "H&S Manager"
}')
LR2_ID=$(echo "$LR2_RESULT" | jq -r '.data.id')
assert "POST /legal-register second - success" "true" "$(echo "$LR2_RESULT" | jq -r '.success')"

# 2c. GET - List all entries
echo "  Listing legal register..."
LL_RESULT=$(curl -s "$API/api/legal-register" -H "$AUTH")
assert "GET /legal-register - success" "true" "$(echo "$LL_RESULT" | jq -r '.success')"
assert "GET /legal-register - has records" "true" "$(echo "$LL_RESULT" | jq -r '(.data | length) > 0')"

# 2d. GET - Single entry
echo "  Getting single legal register entry..."
LG_RESULT=$(curl -s "$API/api/legal-register/$LR_ID" -H "$AUTH")
assert "GET /legal-register/:id - success" "true" "$(echo "$LG_RESULT" | jq -r '.success')"
assert "GET /legal-register/:id - correct jurisdiction" "United Kingdom" "$(echo "$LG_RESULT" | jq -r '.data.jurisdiction')"

# 2e. PUT - Update entry
echo "  Updating legal register entry..."
LP_RESULT=$(curl -s -X PUT "$API/api/legal-register/$LR2_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "complianceStatus": "COMPLIANT",
  "notes": "COSHH assessments completed for all chemicals. Health surveillance programme active."
}')
assert "PUT /legal-register/:id - success" "true" "$(echo "$LP_RESULT" | jq -r '.success')"
assert "PUT /legal-register/:id - compliance updated" "COMPLIANT" "$(echo "$LP_RESULT" | jq -r '.data.complianceStatus')"

# 2f. Search
LS_RESULT=$(curl -s "$API/api/legal-register?search=COSHH" -H "$AUTH")
assert "GET /legal-register?search=COSHH - success" "true" "$(echo "$LS_RESULT" | jq -r '.success')"

# 2g. 404
LR_NF=$(curl -s "$API/api/legal-register/nonexistent-id-xyz" -H "$AUTH")
assert "GET /legal-register/:id - 404" "NOT_FOUND" "$(echo "$LR_NF" | jq -r '.error.code')"

# 2h. DELETE entry
LD_RESULT=$(curl -s -X DELETE "$API/api/legal-register/$LR2_ID" -H "$AUTH")
assert "DELETE /legal-register/:id - success" "true" "$(echo "$LD_RESULT" | jq -r '.success')"

echo ""

# ─────────────────────────────────────────────
echo "3. OBLIGATIONS MODULE"
echo "─────────────────────────────────────────"

# 3a. POST - Create obligation
echo "  Creating obligation..."
OBL_RESULT=$(curl -s -X POST "$API/api/obligations" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "title": "Annual Environmental Impact Report Submission to Environment Agency",
  "description": "Submit annual environmental performance report to the Environment Agency",
  "source": "Environment Act 2021 S.31 Mandatory Reporting",
  "dueDate": "2026-04-30",
  "frequency": "Annual",
  "responsible": "Environmental Manager",
  "status": "PENDING",
  "evidence": "Report template updated for 2026",
  "notes": "Check EA portal for new fields"
}')
OBL_SUCCESS=$(echo "$OBL_RESULT" | jq -r '.success')
OBL_ID=$(echo "$OBL_RESULT" | jq -r '.data.id')
OBL_REF=$(echo "$OBL_RESULT" | jq -r '.data.referenceNumber')
assert "POST /obligations - success" "true" "$OBL_SUCCESS"
assert_contains "POST /obligations - has ref ROB-" "ROB-" "$OBL_REF"
assert "POST /obligations - status PENDING" "PENDING" "$(echo "$OBL_RESULT" | jq -r '.data.status')"

# 3b. POST - Second obligation
echo "  Creating second obligation..."
OBL2_RESULT=$(curl -s -X POST "$API/api/obligations" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "title": "Quarterly Waste Returns to EA",
  "description": "Submit quarterly controlled waste tracking returns to the Environment Agency",
  "source": "Environmental Permitting Regulations 2016",
  "frequency": "Quarterly",
  "responsible": "Facilities Manager",
  "status": "OVERDUE"
}')
OBL2_ID=$(echo "$OBL2_RESULT" | jq -r '.data.id')
assert "POST /obligations second - success" "true" "$(echo "$OBL2_RESULT" | jq -r '.success')"

# 3c. GET - List obligations
echo "  Listing obligations..."
OL_RESULT=$(curl -s "$API/api/obligations" -H "$AUTH")
assert "GET /obligations - success" "true" "$(echo "$OL_RESULT" | jq -r '.success')"
assert "GET /obligations - has records" "true" "$(echo "$OL_RESULT" | jq -r '(.data | length) > 0')"

# 3d. GET - Single obligation
echo "  Getting single obligation..."
OG_RESULT=$(curl -s "$API/api/obligations/$OBL_ID" -H "$AUTH")
assert "GET /obligations/:id - success" "true" "$(echo "$OG_RESULT" | jq -r '.success')"
assert "GET /obligations/:id - correct frequency" "Annual" "$(echo "$OG_RESULT" | jq -r '.data.frequency')"

# 3e. PUT - Update obligation
echo "  Updating obligation..."
OP_RESULT=$(curl -s -X PUT "$API/api/obligations/$OBL_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "status": "COMPLETED",
  "evidence": "Report submitted 2026-04-28 via EA portal ref EA-2026-00089"
}')
assert "PUT /obligations/:id - success" "true" "$(echo "$OP_RESULT" | jq -r '.success')"
assert "PUT /obligations/:id - status updated" "COMPLETED" "$(echo "$OP_RESULT" | jq -r '.data.status')"

# 3f. Filter by status
OS_RESULT=$(curl -s "$API/api/obligations?status=COMPLETED" -H "$AUTH")
assert "GET /obligations?status=COMPLETED - success" "true" "$(echo "$OS_RESULT" | jq -r '.success')"

# 3g. Search
OSR_RESULT=$(curl -s "$API/api/obligations?search=Waste" -H "$AUTH")
assert "GET /obligations?search=Waste - success" "true" "$(echo "$OSR_RESULT" | jq -r '.success')"

# 3h. Validation error
OV_RESULT=$(curl -s -X POST "$API/api/obligations" -H "$AUTH" -H "Content-Type: application/json" -d '{}')
assert "POST /obligations - validation error missing title" "VALIDATION_ERROR" "$(echo "$OV_RESULT" | jq -r '.error.code')"

# 3i. DELETE obligation
OD_RESULT=$(curl -s -X DELETE "$API/api/obligations/$OBL2_ID" -H "$AUTH")
assert "DELETE /obligations/:id - success" "true" "$(echo "$OD_RESULT" | jq -r '.success')"

# 3j. Verify deleted
OV2_RESULT=$(curl -s "$API/api/obligations/$OBL2_ID" -H "$AUTH")
assert "GET /obligations/:id - deleted returns NOT_FOUND" "NOT_FOUND" "$(echo "$OV2_RESULT" | jq -r '.error.code')"

echo ""

# ─────────────────────────────────────────────
echo "4. GATEWAY PROXY"
echo "─────────────────────────────────────────"

echo "  Testing all routes through gateway..."
for ROUTE in changes legal-register obligations dashboard; do
  GW_RESULT=$(curl -s "$GW/api/reg-monitor/$ROUTE" -H "$AUTH")
  assert "Gateway /api/reg-monitor/$ROUTE" "true" "$(echo "$GW_RESULT" | jq -r '.success')"
done

echo ""

# ─────────────────────────────────────────────
echo "5. DELETE CLEANUP"
echo "─────────────────────────────────────────"

DEL_CHG=$(curl -s -X DELETE "$API/api/changes/$CHG_ID" -H "$AUTH")
assert "DELETE /changes/:id cleanup" "true" "$(echo "$DEL_CHG" | jq -r '.success')"

DEL_LR=$(curl -s -X DELETE "$API/api/legal-register/$LR_ID" -H "$AUTH")
assert "DELETE /legal-register/:id cleanup" "true" "$(echo "$DEL_LR" | jq -r '.success')"

DEL_OBL=$(curl -s -X DELETE "$API/api/obligations/$OBL_ID" -H "$AUTH")
assert "DELETE /obligations/:id cleanup" "true" "$(echo "$DEL_OBL" | jq -r '.success')"

echo ""
echo "============================================"
echo "  RESULTS: $PASS passed, $FAIL failed (out of $TOTAL)"
echo "============================================"

if [ $FAIL -gt 0 ]; then
  exit 1
fi
