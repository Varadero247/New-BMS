#!/bin/bash
# Comprehensive test script for Management Review modules
# Tests: Reviews, Agenda — CRUD + Gateway

set -e

API="http://localhost:4038"
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
echo "  Management Review Modules - Test Suite"
echo "============================================"
echo ""

# ─────────────────────────────────────────────
echo "1. REVIEWS MODULE"
echo "─────────────────────────────────────────"

# 1a. POST - Create management review (DRAFT)
echo "  Creating management review..."
REV_RESULT=$(curl -s -X POST "$API/api/reviews" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "title": "Q1 2026 Integrated Management System Review",
  "description": "Quarterly management review covering QMS, EMS, and OHSMS performance against objectives",
  "status": "DRAFT",
  "scheduledDate": "2026-03-28T09:00:00+00:00",
  "chairpersonName": "Chief Operating Officer",
  "attendees": ["COO", "Quality Manager", "H&S Manager", "Environmental Manager", "HR Director", "Production Manager"],
  "standards": ["ISO 9001:2015", "ISO 14001:2015", "ISO 45001:2018"],
  "riskSummary": "3 high-rated risks identified in Q1, 2 mitigated, 1 under active management",
  "auditSummary": "Internal audit complete — 1 major NC, 2 minor NCs, 3 OFIs identified",
  "incidentSummary": "4 incidents reported in Q1: 1 RIDDOR, 3 near misses. LTI rate reduced 40% vs Q1 2025",
  "capaSummary": "12 CAPAs open, 8 on track, 4 overdue requiring escalation",
  "kpiSummary": "OTD: 94% (target 95%) | Customer satisfaction: 87% (target 90%) | Defect rate: 0.8% (target <1%)",
  "customerFeedback": "NPS score 42. 3 formal complaints received, all resolved within SLA",
  "trainingStatus": "92% compliance with mandatory training schedule",
  "complianceStatus": "Full compliance with all applicable legal requirements maintained",
  "nextReviewDate": "2026-06-27T09:00:00+00:00"
}')
REV_SUCCESS=$(echo "$REV_RESULT" | jq -r '.success')
REV_ID=$(echo "$REV_RESULT" | jq -r '.data.id')
REV_REF=$(echo "$REV_RESULT" | jq -r '.data.referenceNumber')
assert "POST /reviews - success" "true" "$REV_SUCCESS"
assert_contains "POST /reviews - has ref MGR-" "MGR-" "$REV_REF"
assert "POST /reviews - status DRAFT" "DRAFT" "$(echo "$REV_RESULT" | jq -r '.data.status')"
assert "POST /reviews - chairperson stored" "Chief Operating Officer" "$(echo "$REV_RESULT" | jq -r '.data.chairpersonName')"

# 1b. POST - Second review (SCHEDULED)
echo "  Creating second review..."
REV2_RESULT=$(curl -s -X POST "$API/api/reviews" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "title": "Annual IMS Board Review 2026",
  "description": "Annual full board review of the integrated management system strategic performance",
  "status": "SCHEDULED",
  "scheduledDate": "2026-12-05T09:00:00+00:00",
  "chairpersonName": "Chief Executive Officer",
  "attendees": ["CEO", "Board Members", "COO", "All Department Heads"],
  "standards": ["ISO 9001:2015", "ISO 14001:2015", "ISO 45001:2018", "ISO 27001:2022"],
  "nextReviewDate": "2027-12-05T09:00:00+00:00"
}')
REV2_ID=$(echo "$REV2_RESULT" | jq -r '.data.id')
assert "POST /reviews second - success" "true" "$(echo "$REV2_RESULT" | jq -r '.success')"
assert "POST /reviews second - status SCHEDULED" "SCHEDULED" "$(echo "$REV2_RESULT" | jq -r '.data.status')"

# 1c. POST - Third review for cleanup
echo "  Creating third review..."
REV3_RESULT=$(curl -s -X POST "$API/api/reviews" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "title": "Emergency Review — Critical Incident Response",
  "description": "Unscheduled emergency management review triggered by critical incident",
  "status": "DRAFT",
  "scheduledDate": "2026-02-25T14:00:00+00:00",
  "chairpersonName": "Operations Director",
  "nextReviewDate": "2026-03-25T09:00:00+00:00"
}')
REV3_ID=$(echo "$REV3_RESULT" | jq -r '.data.id')
assert "POST /reviews third - success" "true" "$(echo "$REV3_RESULT" | jq -r '.success')"

# 1d. GET - List reviews
echo "  Listing reviews..."
LIST_RESULT=$(curl -s "$API/api/reviews" -H "$AUTH")
assert "GET /reviews - success" "true" "$(echo "$LIST_RESULT" | jq -r '.success')"
REV_COUNT=$(echo "$LIST_RESULT" | jq -r '.data | length')
assert "GET /reviews - has records" "true" "$([ "$REV_COUNT" -gt 0 ] && echo true || echo false)"
assert_contains "GET /reviews - pagination present" "total" "$(echo "$LIST_RESULT")"

# 1e. GET - Single review
echo "  Getting single review..."
GET_RESULT=$(curl -s "$API/api/reviews/$REV_ID" -H "$AUTH")
assert "GET /reviews/:id - success" "true" "$(echo "$GET_RESULT" | jq -r '.success')"
assert "GET /reviews/:id - correct title" "Q1 2026 Integrated Management System Review" "$(echo "$GET_RESULT" | jq -r '.data.title')"

# 1f. PUT - Update review (move to IN_PROGRESS)
echo "  Updating review..."
PUT_RESULT=$(curl -s -X PUT "$API/api/reviews/$REV_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "status": "IN_PROGRESS",
  "conductedDate": "2026-03-28T09:00:00+00:00",
  "decisions": "1. Approve revised risk appetite statement\n2. Mandate CAPA closure within 30 days for overdue items\n3. Increase customer satisfaction survey budget by 20%\n4. Commission energy efficiency audit by June 2026",
  "actions": "1. Quality Manager to close overdue CAPAs by 2026-04-15\n2. Marketing to implement new survey platform by 2026-04-30\n3. Facilities to commission energy audit by 2026-05-31"
}')
assert "PUT /reviews/:id - success" "true" "$(echo "$PUT_RESULT" | jq -r '.success')"
assert "PUT /reviews/:id - status IN_PROGRESS" "IN_PROGRESS" "$(echo "$PUT_RESULT" | jq -r '.data.status')"
assert "PUT /reviews/:id - decisions stored" "true" "$(echo "$PUT_RESULT" | jq -r '.data.decisions != null')"

# 1g. PUT - Complete review
echo "  Completing review..."
COMPLETE_RESULT=$(curl -s -X PUT "$API/api/reviews/$REV_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "status": "COMPLETED",
  "conclusion": "Management review concluded successfully. All IMS objectives reviewed, 4 key decisions made, 3 action items assigned with clear owners and due dates."
}')
assert "PUT /reviews/:id complete - status COMPLETED" "COMPLETED" "$(echo "$COMPLETE_RESULT" | jq -r '.data.status')"

# 1h. GET - Filter by status
FILTER_RESULT=$(curl -s "$API/api/reviews?status=COMPLETED" -H "$AUTH")
assert "GET /reviews?status=COMPLETED - success" "true" "$(echo "$FILTER_RESULT" | jq -r '.success')"

# 1i. GET - Search
SEARCH_RESULT=$(curl -s "$API/api/reviews?search=Q1+2026" -H "$AUTH")
assert "GET /reviews?search - success" "true" "$(echo "$SEARCH_RESULT" | jq -r '.success')"

# 1j. 404 for unknown ID
NOT_FOUND=$(curl -s "$API/api/reviews/nonexistent-id-xyz" -H "$AUTH")
assert "GET /reviews/:id - 404 for unknown" "NOT_FOUND" "$(echo "$NOT_FOUND" | jq -r '.error.code')"

# 1k. Validation error (missing title)
VAL_RESULT=$(curl -s -X POST "$API/api/reviews" -H "$AUTH" -H "Content-Type: application/json" -d '{}')
assert "POST /reviews - validation error missing title" "VALIDATION_ERROR" "$(echo "$VAL_RESULT" | jq -r '.error.code')"

echo ""

# ─────────────────────────────────────────────
echo "2. AGENDA MODULE"
echo "─────────────────────────────────────────"

# 2a. POST - Generate agenda for a review
echo "  Generating agenda for review..."
AGENDA_RESULT=$(curl -s -X POST "$API/api/agenda/$REV2_ID/generate" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "customItems": ["Review of sustainability targets progress", "Discussion of new market entry risks"],
  "includeAiNote": false
}')
assert "POST /agenda/:id/generate - success" "true" "$(echo "$AGENDA_RESULT" | jq -r '.success')"
assert_contains "POST /agenda/:id/generate - has items array" "items" "$(echo "$AGENDA_RESULT")"
assert_contains "POST /agenda/:id/generate - includes standard item" "actions from previous" "$(echo "$AGENDA_RESULT")"
AGENDA_ITEMS=$(echo "$AGENDA_RESULT" | jq -r '.data.items | length')
assert "POST /agenda/:id/generate - items count >= 14" "true" "$([ "$AGENDA_ITEMS" -ge 14 ] && echo true || echo false)"

# 2b. POST - Generate agenda with no custom items
echo "  Generating minimal agenda..."
AGENDA2_RESULT=$(curl -s -X POST "$API/api/agenda/$REV3_ID/generate" -H "$AUTH" -H "Content-Type: application/json" -d '{}')
assert "POST /agenda/:id/generate minimal - success" "true" "$(echo "$AGENDA2_RESULT" | jq -r '.success')"
AGENDA2_ITEMS=$(echo "$AGENDA2_RESULT" | jq -r '.data.items | length')
assert "POST /agenda/:id/generate - has standard items" "true" "$([ "$AGENDA2_ITEMS" -ge 14 ] && echo true || echo false)"

# 2c. Verify agenda stored on review
echo "  Verifying agenda stored on review..."
REV_AFTER=$(curl -s "$API/api/reviews/$REV2_ID" -H "$AUTH")
assert "GET /reviews/:id after agenda - aiGeneratedAgenda stored" "true" "$(echo "$REV_AFTER" | jq -r '.data.aiGeneratedAgenda != null')"

# 2d. POST - Generate agenda for non-existent review
AGENDA_NF=$(curl -s -X POST "$API/api/agenda/nonexistent-id-xyz/generate" -H "$AUTH" -H "Content-Type: application/json" -d '{}')
assert "POST /agenda/:id/generate - 404 for unknown review" "NOT_FOUND" "$(echo "$AGENDA_NF" | jq -r '.error.code')"

echo ""

# ─────────────────────────────────────────────
echo "3. GATEWAY PROXY"
echo "─────────────────────────────────────────"

echo "  Testing all routes through gateway..."
for ROUTE in reviews dashboard; do
  GW_RESULT=$(curl -s "$GW/api/mgmt-review/$ROUTE" -H "$AUTH")
  assert "Gateway /api/mgmt-review/$ROUTE" "true" "$(echo "$GW_RESULT" | jq -r '.success')"
done

echo ""

# ─────────────────────────────────────────────
echo "4. PAGINATION AND FILTERS"
echo "─────────────────────────────────────────"

echo "  Testing pagination..."
PAGE_RESULT=$(curl -s "$API/api/reviews?page=1&limit=5" -H "$AUTH")
assert "GET /reviews?page=1&limit=5 - success" "true" "$(echo "$PAGE_RESULT" | jq -r '.success')"
assert "GET /reviews - pagination.page is 1" "1" "$(echo "$PAGE_RESULT" | jq -r '.pagination.page')"

echo "  Testing status filter..."
DRAFT_RESULT=$(curl -s "$API/api/reviews?status=DRAFT" -H "$AUTH")
assert "GET /reviews?status=DRAFT - success" "true" "$(echo "$DRAFT_RESULT" | jq -r '.success')"

SCHED_RESULT=$(curl -s "$API/api/reviews?status=SCHEDULED" -H "$AUTH")
assert "GET /reviews?status=SCHEDULED - success" "true" "$(echo "$SCHED_RESULT" | jq -r '.success')"

echo ""

# ─────────────────────────────────────────────
echo "5. DELETE CLEANUP"
echo "─────────────────────────────────────────"

DEL_REV=$(curl -s -X DELETE "$API/api/reviews/$REV_ID" -H "$AUTH")
assert "DELETE /reviews/:id cleanup" "true" "$(echo "$DEL_REV" | jq -r '.success')"

DEL_REV2=$(curl -s -X DELETE "$API/api/reviews/$REV2_ID" -H "$AUTH")
assert "DELETE /reviews/:id second cleanup" "true" "$(echo "$DEL_REV2" | jq -r '.success')"

DEL_REV3=$(curl -s -X DELETE "$API/api/reviews/$REV3_ID" -H "$AUTH")
assert "DELETE /reviews/:id third cleanup" "true" "$(echo "$DEL_REV3" | jq -r '.success')"

VERIFY=$(curl -s "$API/api/reviews/$REV_ID" -H "$AUTH")
assert "Deleted review returns NOT_FOUND" "NOT_FOUND" "$(echo "$VERIFY" | jq -r '.error.code')"

echo ""
echo "============================================"
echo "  RESULTS: $PASS passed, $FAIL failed (out of $TOTAL)"
echo "============================================"

if [ $FAIL -gt 0 ]; then
  exit 1
fi
