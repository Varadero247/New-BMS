#!/bin/bash
# Comprehensive test script for Audits modules
# Tests: Audits, Findings, Checklists — CRUD + Gateway

set -e

API="http://localhost:4037"
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
echo "  Audits Modules - Comprehensive Test Suite"
echo "============================================"
echo ""

# ─────────────────────────────────────────────
echo "1. AUDITS MODULE"
echo "─────────────────────────────────────────"

# 1a. POST - Create audit
echo "  Creating audit..."
AUD_RESULT=$(curl -s -X POST "$API/api/audits" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "title": "ISO 9001:2015 Internal Quality Management System Audit",
  "description": "Annual internal audit of the QMS against ISO 9001:2015 requirements covering all clauses",
  "type": "INTERNAL",
  "status": "PLANNED",
  "standard": "ISO 9001:2015",
  "scope": "All departments — manufacturing, procurement, customer services, management",
  "department": "Quality",
  "leadAuditorName": "Sarah Williams",
  "auditTeam": ["Tom Harris", "Lisa Park"],
  "scheduledDate": "2026-03-15",
  "startDate": "2026-03-15",
  "endDate": "2026-03-17",
  "notes": "Priority areas: Clause 8.4 (External Providers), Clause 9.1 (Monitoring), Clause 10.2 (NCR management)"
}')
AUD_SUCCESS=$(echo "$AUD_RESULT" | jq -r '.success')
AUD_ID=$(echo "$AUD_RESULT" | jq -r '.data.id')
AUD_REF=$(echo "$AUD_RESULT" | jq -r '.data.referenceNumber')
assert "POST /audits - success" "true" "$AUD_SUCCESS"
assert_contains "POST /audits - has ref number AUD-" "AUD-" "$AUD_REF"
assert "POST /audits - type INTERNAL" "INTERNAL" "$(echo "$AUD_RESULT" | jq -r '.data.type')"
assert "POST /audits - status PLANNED" "PLANNED" "$(echo "$AUD_RESULT" | jq -r '.data.status')"

# 1b. POST - Second audit (external)
echo "  Creating external certification audit..."
AUD2_RESULT=$(curl -s -X POST "$API/api/audits" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "title": "ISO 14001:2015 Surveillance Audit by BSI",
  "description": "Annual surveillance audit by certification body to maintain ISO 14001 certification",
  "type": "CERTIFICATION",
  "status": "SCHEDULED",
  "standard": "ISO 14001:2015",
  "scope": "Environmental Management System — full scope including all sites",
  "leadAuditorName": "BSI Lead Auditor",
  "scheduledDate": "2026-04-20"
}')
AUD2_ID=$(echo "$AUD2_RESULT" | jq -r '.data.id')
assert "POST /audits external - success" "true" "$(echo "$AUD2_RESULT" | jq -r '.success')"
assert "POST /audits external - type CERTIFICATION" "CERTIFICATION" "$(echo "$AUD2_RESULT" | jq -r '.data.type')"

# 1c. POST - Third audit (supplier)
echo "  Creating supplier audit..."
AUD3_RESULT=$(curl -s -X POST "$API/api/audits" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "title": "Supplier Quality Audit — Acme Components Ltd",
  "description": "Supplier audit to assess quality management practices and compliance with our supplier standards",
  "type": "SUPPLIER",
  "status": "PLANNED",
  "scope": "Production processes, QC procedures, documentation controls",
  "scheduledDate": "2026-03-28"
}')
AUD3_ID=$(echo "$AUD3_RESULT" | jq -r '.data.id')
assert "POST /audits supplier - success" "true" "$(echo "$AUD3_RESULT" | jq -r '.success')"

# 1d. GET - List audits
echo "  Listing audits..."
LIST_RESULT=$(curl -s "$API/api/audits" -H "$AUTH")
assert "GET /audits - success" "true" "$(echo "$LIST_RESULT" | jq -r '.success')"
AUD_COUNT=$(echo "$LIST_RESULT" | jq -r '.data | length')
assert "GET /audits - has records" "true" "$([ "$AUD_COUNT" -gt 0 ] && echo true || echo false)"
assert_contains "GET /audits - pagination present" "total" "$(echo "$LIST_RESULT")"

# 1e. GET - Single audit
echo "  Getting single audit..."
GET_RESULT=$(curl -s "$API/api/audits/$AUD_ID" -H "$AUTH")
assert "GET /audits/:id - success" "true" "$(echo "$GET_RESULT" | jq -r '.success')"
assert "GET /audits/:id - correct standard" "ISO 9001:2015" "$(echo "$GET_RESULT" | jq -r '.data.standard')"
assert "GET /audits/:id - correct lead auditor" "Sarah Williams" "$(echo "$GET_RESULT" | jq -r '.data.leadAuditorName')"

# 1f. PUT - Update audit status (start audit)
echo "  Starting audit..."
PUT_RESULT=$(curl -s -X PUT "$API/api/audits/$AUD_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "status": "IN_PROGRESS",
  "startDate": "2026-03-15"
}')
assert "PUT /audits/:id - success" "true" "$(echo "$PUT_RESULT" | jq -r '.success')"
assert "PUT /audits/:id - status IN_PROGRESS" "IN_PROGRESS" "$(echo "$PUT_RESULT" | jq -r '.data.status')"

# 1g. Filter by type
echo "  Filtering audits by type..."
TYPE_RESULT=$(curl -s "$API/api/audits?status=IN_PROGRESS" -H "$AUTH")
assert "GET /audits?status=IN_PROGRESS - success" "true" "$(echo "$TYPE_RESULT" | jq -r '.success')"

# 1h. Search
SEARCH_RESULT=$(curl -s "$API/api/audits?search=ISO" -H "$AUTH")
assert "GET /audits?search=ISO - success" "true" "$(echo "$SEARCH_RESULT" | jq -r '.success')"

# 1i. 404 for unknown ID
NOT_FOUND=$(curl -s "$API/api/audits/nonexistent-id-xyz" -H "$AUTH")
assert "GET /audits/:id - 404 for unknown" "NOT_FOUND" "$(echo "$NOT_FOUND" | jq -r '.error.code')"

# 1j. Validation error
VAL_RESULT=$(curl -s -X POST "$API/api/audits" -H "$AUTH" -H "Content-Type: application/json" -d '{}')
assert "POST /audits - validation error missing title" "VALIDATION_ERROR" "$(echo "$VAL_RESULT" | jq -r '.error.code')"

echo ""

# ─────────────────────────────────────────────
echo "2. FINDINGS MODULE"
echo "─────────────────────────────────────────"

# 2a. POST - Create major nonconformity finding
echo "  Creating major nonconformity finding..."
FND_RESULT=$(curl -s -X POST "$API/api/findings" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "auditId": "'"$AUD_ID"'",
  "title": "Supplier approval records not maintained for critical suppliers",
  "description": "Clause 8.4.1 requires approved supplier list with evaluation records. 3 of 8 critical suppliers have no documented approval on file",
  "severity": "MAJOR_NC",
  "status": "OPEN",
  "clauseRef": "ISO 9001:2015 Clause 8.4.1",
  "evidence": "Approved supplier register reviewed — suppliers ABC Ltd, XYZ Corp, and Delta Materials have no evaluation record",
  "rootCause": "No formal supplier approval procedure in place. Procurement team unaware of ISO 9001 requirements for external providers.",
  "correctiveAction": "Develop and implement supplier evaluation and approval procedure, conduct retrospective evaluations of 3 non-compliant suppliers within 30 days",
  "assigneeName": "Procurement Manager",
  "dueDate": "2026-04-15"
}')
FND_SUCCESS=$(echo "$FND_RESULT" | jq -r '.success')
FND_ID=$(echo "$FND_RESULT" | jq -r '.data.id')
FND_REF=$(echo "$FND_RESULT" | jq -r '.data.referenceNumber')
assert "POST /findings - success" "true" "$FND_SUCCESS"
assert_contains "POST /findings - has ref AFN-" "AFN-" "$FND_REF"
assert "POST /findings - severity MAJOR_NC" "MAJOR_NC" "$(echo "$FND_RESULT" | jq -r '.data.severity')"
assert "POST /findings - status OPEN" "OPEN" "$(echo "$FND_RESULT" | jq -r '.data.status')"

# 2b. POST - Create minor nonconformity
echo "  Creating minor nonconformity finding..."
FND2_RESULT=$(curl -s -X POST "$API/api/findings" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "auditId": "'"$AUD_ID"'",
  "title": "Calibration records for 2 gauges not signed by responsible person",
  "description": "Clause 7.1.5 — calibration records for pressure gauges PG-04 and PG-07 lack required authorisation signature",
  "severity": "MINOR_NC",
  "status": "OPEN",
  "clauseRef": "ISO 9001:2015 Clause 7.1.5",
  "assigneeName": "Quality Engineer",
  "dueDate": "2026-03-25"
}')
FND2_ID=$(echo "$FND2_RESULT" | jq -r '.data.id')
assert "POST /findings minor - success" "true" "$(echo "$FND2_RESULT" | jq -r '.success')"
assert "POST /findings minor - MINOR_NC" "MINOR_NC" "$(echo "$FND2_RESULT" | jq -r '.data.severity')"

# 2c. POST - Opportunity for improvement
echo "  Creating opportunity finding..."
FND3_RESULT=$(curl -s -X POST "$API/api/findings" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "auditId": "'"$AUD_ID"'",
  "title": "OFI: Customer satisfaction survey response rate could be improved",
  "description": "Current 32% response rate on customer satisfaction surveys is below best practice of 60%+",
  "severity": "OPPORTUNITY",
  "status": "OPEN",
  "clauseRef": "ISO 9001:2015 Clause 9.1.2"
}')
FND3_ID=$(echo "$FND3_RESULT" | jq -r '.data.id')
assert "POST /findings OFI - success" "true" "$(echo "$FND3_RESULT" | jq -r '.success')"

# 2d. GET - List findings
echo "  Listing findings..."
FL_RESULT=$(curl -s "$API/api/findings" -H "$AUTH")
assert "GET /findings - success" "true" "$(echo "$FL_RESULT" | jq -r '.success')"
assert "GET /findings - has records" "true" "$(echo "$FL_RESULT" | jq -r '(.data | length) > 0')"

# 2e. GET - Single finding
echo "  Getting single finding..."
FG_RESULT=$(curl -s "$API/api/findings/$FND_ID" -H "$AUTH")
assert "GET /findings/:id - success" "true" "$(echo "$FG_RESULT" | jq -r '.success')"
assert "GET /findings/:id - correct clause" "ISO 9001:2015 Clause 8.4.1" "$(echo "$FG_RESULT" | jq -r '.data.clauseRef')"

# 2f. PUT - Update finding status
echo "  Updating finding..."
FP_RESULT=$(curl -s -X PUT "$API/api/findings/$FND2_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "status": "IN_PROGRESS",
  "rootCause": "Procedure requires update to include mandatory sign-off step"
}')
assert "PUT /findings/:id - success" "true" "$(echo "$FP_RESULT" | jq -r '.success')"
assert "PUT /findings/:id - status IN_PROGRESS" "IN_PROGRESS" "$(echo "$FP_RESULT" | jq -r '.data.status')"

# 2g. Filter findings
FS_RESULT=$(curl -s "$API/api/findings?status=OPEN" -H "$AUTH")
assert "GET /findings?status=OPEN - success" "true" "$(echo "$FS_RESULT" | jq -r '.success')"

# 2h. 404
FNF_RESULT=$(curl -s "$API/api/findings/nonexistent-id-xyz" -H "$AUTH")
assert "GET /findings/:id - 404" "NOT_FOUND" "$(echo "$FNF_RESULT" | jq -r '.error.code')"

# 2i. Validation error
FV_RESULT=$(curl -s -X POST "$API/api/findings" -H "$AUTH" -H "Content-Type: application/json" -d '{"title":"No auditId"}')
assert "POST /findings - validation error missing auditId" "VALIDATION_ERROR" "$(echo "$FV_RESULT" | jq -r '.error.code')"

# 2j. DELETE finding
FD_RESULT=$(curl -s -X DELETE "$API/api/findings/$FND3_ID" -H "$AUTH")
assert "DELETE /findings/:id - success" "true" "$(echo "$FD_RESULT" | jq -r '.success')"

echo ""

# ─────────────────────────────────────────────
echo "3. CHECKLISTS MODULE"
echo "─────────────────────────────────────────"

# 3a. POST - Create checklist
echo "  Creating audit checklist..."
CL_RESULT=$(curl -s -X POST "$API/api/checklists" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "auditId": "'"$AUD_ID"'",
  "title": "ISO 9001:2015 Clause 8 — Operations Checklist",
  "standard": "ISO 9001:2015",
  "items": "8.1 Operational planning and control\n8.2 Requirements for products and services\n8.3 Design and development\n8.4 Control of externally provided processes\n8.5 Production and service provision\n8.6 Release of products and services\n8.7 Control of nonconforming outputs",
  "totalItems": 7,
  "completedItems": 3,
  "notes": "Focus on 8.4 and 8.5 based on previous audit findings"
}')
CL_SUCCESS=$(echo "$CL_RESULT" | jq -r '.success')
CL_ID=$(echo "$CL_RESULT" | jq -r '.data.id')
CL_REF=$(echo "$CL_RESULT" | jq -r '.data.referenceNumber')
assert "POST /checklists - success" "true" "$CL_SUCCESS"
assert_contains "POST /checklists - has ref ACH-" "ACH-" "$CL_REF"
assert "POST /checklists - totalItems 7" "7" "$(echo "$CL_RESULT" | jq -r '.data.totalItems')"

# 3b. POST - Second checklist
echo "  Creating second checklist..."
CL2_RESULT=$(curl -s -X POST "$API/api/checklists" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "auditId": "'"$AUD_ID"'",
  "title": "ISO 9001:2015 Clause 9 — Performance Evaluation Checklist",
  "standard": "ISO 9001:2015",
  "totalItems": 4,
  "completedItems": 0
}')
CL2_ID=$(echo "$CL2_RESULT" | jq -r '.data.id')
assert "POST /checklists second - success" "true" "$(echo "$CL2_RESULT" | jq -r '.success')"

# 3c. GET - List checklists
echo "  Listing checklists..."
CLL_RESULT=$(curl -s "$API/api/checklists" -H "$AUTH")
assert "GET /checklists - success" "true" "$(echo "$CLL_RESULT" | jq -r '.success')"
assert "GET /checklists - has records" "true" "$(echo "$CLL_RESULT" | jq -r '(.data | length) > 0')"

# 3d. GET - Single checklist
echo "  Getting single checklist..."
CLG_RESULT=$(curl -s "$API/api/checklists/$CL_ID" -H "$AUTH")
assert "GET /checklists/:id - success" "true" "$(echo "$CLG_RESULT" | jq -r '.success')"
assert "GET /checklists/:id - correct standard" "ISO 9001:2015" "$(echo "$CLG_RESULT" | jq -r '.data.standard')"

# 3e. PUT - Update checklist progress
echo "  Updating checklist progress..."
CLP_RESULT=$(curl -s -X PUT "$API/api/checklists/$CL_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "completedItems": 7,
  "notes": "All clause 8 items reviewed and documented"
}')
assert "PUT /checklists/:id - success" "true" "$(echo "$CLP_RESULT" | jq -r '.success')"
assert "PUT /checklists/:id - completedItems updated" "7" "$(echo "$CLP_RESULT" | jq -r '.data.completedItems')"

# 3f. 404
CLNF_RESULT=$(curl -s "$API/api/checklists/nonexistent-id-xyz" -H "$AUTH")
assert "GET /checklists/:id - 404" "NOT_FOUND" "$(echo "$CLNF_RESULT" | jq -r '.error.code')"

# 3g. Validation error
CLV_RESULT=$(curl -s -X POST "$API/api/checklists" -H "$AUTH" -H "Content-Type: application/json" -d '{"title":"No auditId"}')
assert "POST /checklists - validation error missing auditId" "VALIDATION_ERROR" "$(echo "$CLV_RESULT" | jq -r '.error.code')"

# 3h. DELETE checklist
CLD_RESULT=$(curl -s -X DELETE "$API/api/checklists/$CL2_ID" -H "$AUTH")
assert "DELETE /checklists/:id - success" "true" "$(echo "$CLD_RESULT" | jq -r '.success')"

echo ""

# ─────────────────────────────────────────────
echo "4. GATEWAY PROXY"
echo "─────────────────────────────────────────"

echo "  Testing all routes through gateway..."
for ROUTE in audits findings checklists dashboard; do
  GW_RESULT=$(curl -s "$GW/api/audits/$ROUTE" -H "$AUTH")
  assert "Gateway /api/audits/$ROUTE" "true" "$(echo "$GW_RESULT" | jq -r '.success')"
done

echo ""

# ─────────────────────────────────────────────
echo "5. DELETE CLEANUP"
echo "─────────────────────────────────────────"

DEL_FND=$(curl -s -X DELETE "$API/api/findings/$FND_ID" -H "$AUTH")
assert "DELETE /findings/:id cleanup" "true" "$(echo "$DEL_FND" | jq -r '.success')"

DEL_FND2=$(curl -s -X DELETE "$API/api/findings/$FND2_ID" -H "$AUTH")
assert "DELETE /findings/:id second cleanup" "true" "$(echo "$DEL_FND2" | jq -r '.success')"

DEL_CL=$(curl -s -X DELETE "$API/api/checklists/$CL_ID" -H "$AUTH")
assert "DELETE /checklists/:id cleanup" "true" "$(echo "$DEL_CL" | jq -r '.success')"

DEL_AUD=$(curl -s -X DELETE "$API/api/audits/$AUD_ID" -H "$AUTH")
assert "DELETE /audits/:id cleanup" "true" "$(echo "$DEL_AUD" | jq -r '.success')"

DEL_AUD2=$(curl -s -X DELETE "$API/api/audits/$AUD2_ID" -H "$AUTH")
assert "DELETE /audits/:id second cleanup" "true" "$(echo "$DEL_AUD2" | jq -r '.success')"

DEL_AUD3=$(curl -s -X DELETE "$API/api/audits/$AUD3_ID" -H "$AUTH")
assert "DELETE /audits/:id third cleanup" "true" "$(echo "$DEL_AUD3" | jq -r '.success')"

echo ""
echo "============================================"
echo "  RESULTS: $PASS passed, $FAIL failed (out of $TOTAL)"
echo "============================================"

if [ $FAIL -gt 0 ]; then
  exit 1
fi
