#!/bin/bash
# Comprehensive test script for Aerospace modules (AS9100D)
# Tests: Audits, Baselines, Changes, Compliance Tracker, Configuration, NADCAP — CRUD + Gateway

API="http://localhost:4012"
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
echo "  Aerospace Modules - Comprehensive Test Suite (AS9100D)"
echo "============================================"
echo ""

# -------------------------------------------------
echo "1. HEALTH CHECK"
echo "-------------------------------------------------"

HEALTH=$(curl -s "$API/health")
assert "GET /health - success" "true" "$(echo "$HEALTH" | jq -r '.success')"
assert_contains "GET /health - service name" "api-aerospace" "$(echo "$HEALTH" | jq -r '.service')"

echo ""

# -------------------------------------------------
echo "2. AUDITS MODULE (AS9100D Clause 9.2)"
echo "-------------------------------------------------"

echo "  Creating aerospace audit..."
AUD_RESULT=$(curl -s -X POST "$API/api/audits" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "title": "AS9100D Internal Quality Management System Audit - Q1 2026",
  "auditType": "INTERNAL",
  "standard": "AS9100D",
  "scope": "Clauses 7-8 covering Resource Management, Design and Development, and Production Control",
  "scheduledDate": "2026-03-15",
  "leadAuditor": "James Wilson",
  "auditTeam": ["Sarah Green", "Mike Chen"],
  "auditee": "Engineering and Production Departments",
  "location": "Main Manufacturing Site, Building A",
  "clauses": ["7.1", "7.2", "7.3", "8.1", "8.1.2", "8.3", "8.5"],
  "objectives": "Verify compliance with AS9100D requirements and identify improvement opportunities",
  "notes": "Focus on configuration management and design control processes"
}')
AUD_SUCCESS=$(echo "$AUD_RESULT" | jq -r '.success')
AUD_ID=$(echo "$AUD_RESULT" | jq -r '.data.id')
AUD_REF=$(echo "$AUD_RESULT" | jq -r '.data.refNumber')
assert "POST /audits - success" "true" "$AUD_SUCCESS"
assert_contains "POST /audits - has ref number" "AERO-AUD-" "$AUD_REF"
assert "POST /audits - initial status SCHEDULED" "SCHEDULED" "$(echo "$AUD_RESULT" | jq -r '.data.status')"
assert "POST /audits - standard AS9100D" "AS9100D" "$(echo "$AUD_RESULT" | jq -r '.data.standard')"

echo "  Listing audits..."
AUD_LIST=$(curl -s "$API/api/audits" -H "$AUTH")
assert "GET /audits - success" "true" "$(echo "$AUD_LIST" | jq -r '.success')"
assert "GET /audits - has records" "true" "$(echo "$AUD_LIST" | jq -r '(.data | length) > 0')"

echo "  Getting single audit..."
AUD_GET=$(curl -s "$API/api/audits/$AUD_ID" -H "$AUTH")
assert "GET /audits/:id - success" "true" "$(echo "$AUD_GET" | jq -r '.success')"
assert "GET /audits/:id - correct title" "AS9100D Internal Quality Management System Audit - Q1 2026" "$(echo "$AUD_GET" | jq -r '.data.title')"

echo "  Updating audit status..."
AUD_PUT=$(curl -s -X PUT "$API/api/audits/$AUD_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{"status":"IN_PROGRESS","actualDate":"2026-03-15","summary":"Audit commenced, 3 of 7 clauses reviewed"}')
assert "PUT /audits/:id - success" "true" "$(echo "$AUD_PUT" | jq -r '.success')"
assert "PUT /audits/:id - status updated" "IN_PROGRESS" "$(echo "$AUD_PUT" | jq -r '.data.status')"

echo "  Creating audit finding..."
FIND_RESULT=$(curl -s -X POST "$API/api/audits/findings" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "auditId": "'"$AUD_ID"'",
  "findingType": "NONCONFORMITY",
  "severity": "MINOR",
  "clause": "8.1.2",
  "description": "Configuration management procedure does not define baseline freeze criteria as required by AS9100D 8.1.2",
  "evidence": "Configuration Management Procedure QP-CM-001 Rev 4, section 3 reviewed during audit",
  "requirement": "AS9100D 8.1.2 requires organisation to control configuration including baselines",
  "responsiblePerson": "Configuration Manager",
  "targetDate": "2026-04-30"
}')
assert "POST /audits/findings - success" "true" "$(echo "$FIND_RESULT" | jq -r '.success')"
FIND_ID=$(echo "$FIND_RESULT" | jq -r '.data.id')

echo "  Getting upcoming audit schedule..."
AUD_SCHED=$(curl -s "$API/api/audits/schedule/upcoming" -H "$AUTH")
assert "GET /audits/schedule/upcoming - success" "true" "$(echo "$AUD_SCHED" | jq -r '.success')"

echo "  Filtering audits by type..."
AUD_FILTER=$(curl -s "$API/api/audits?auditType=INTERNAL" -H "$AUTH")
assert "GET /audits?auditType filter - success" "true" "$(echo "$AUD_FILTER" | jq -r '.success')"

echo "  Testing audit 404..."
AUD_404=$(curl -s "$API/api/audits/00000000-0000-0000-0000-000000000999" -H "$AUTH")
assert "GET /audits/:id - 404" "NOT_FOUND" "$(echo "$AUD_404" | jq -r '.error.code')"

echo ""

# -------------------------------------------------
echo "3. BASELINES MODULE (AS9100D Clause 8.1.2)"
echo "-------------------------------------------------"

echo "  Creating configuration baseline..."
BL_RESULT=$(curl -s -X POST "$API/api/baselines" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "title": "Functional Baseline - Turbine Blade Assembly TBA-100",
  "description": "Functional baseline capturing approved design requirements and functional specifications for TBA-100",
  "program": "TBA-100 Turbine Blade Assembly",
  "version": "1.0",
  "baselineType": "FUNCTIONAL",
  "program_phase": "System Requirements Review",
  "configuration_items": ["TBA-100-SRS-001", "TBA-100-ICD-001", "TBA-100-TEMP-SPEC-001"],
  "documents": ["System Requirements Spec Rev A", "Interface Control Document Rev 1"],
  "effectiveDate": "2026-02-28",
  "approvedBy": "Chief Engineer",
  "notes": "First formal baseline for TBA-100 program following SRR"
}')
BL_SUCCESS=$(echo "$BL_RESULT" | jq -r '.success')
BL_ID=$(echo "$BL_RESULT" | jq -r '.data.id')
BL_REF=$(echo "$BL_RESULT" | jq -r '.data.refNumber')
assert "POST /baselines - success" "true" "$BL_SUCCESS"
assert_contains "POST /baselines - has ref number" "AERO-BL-" "$BL_REF"
assert "POST /baselines - type FUNCTIONAL" "FUNCTIONAL" "$(echo "$BL_RESULT" | jq -r '.data.baselineType')"
assert "POST /baselines - status DRAFT" "DRAFT" "$(echo "$BL_RESULT" | jq -r '.data.status')"

echo "  Listing baselines..."
BL_LIST=$(curl -s "$API/api/baselines" -H "$AUTH")
assert "GET /baselines - success" "true" "$(echo "$BL_LIST" | jq -r '.success')"
assert "GET /baselines - has records" "true" "$(echo "$BL_LIST" | jq -r '(.data | length) > 0')"

echo "  Getting single baseline..."
BL_GET=$(curl -s "$API/api/baselines/$BL_ID" -H "$AUTH")
assert "GET /baselines/:id - success" "true" "$(echo "$BL_GET" | jq -r '.success')"

echo "  Updating baseline..."
BL_PUT=$(curl -s -X PUT "$API/api/baselines/$BL_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{"status":"UNDER_REVIEW","notes":"Submitted for chief engineer review"}')
assert "PUT /baselines/:id - success" "true" "$(echo "$BL_PUT" | jq -r '.success')"
assert "PUT /baselines/:id - status updated" "UNDER_REVIEW" "$(echo "$BL_PUT" | jq -r '.data.status')"

echo "  Approving baseline..."
BL_APPROVE=$(curl -s -X PUT "$API/api/baselines/$BL_ID/approve" -H "$AUTH" -H "Content-Type: application/json" -d '{"approvedBy":"Chief Engineer","approvedDate":"2026-02-28"}')
assert "PUT /baselines/:id/approve - success" "true" "$(echo "$BL_APPROVE" | jq -r '.success')"

echo "  Filtering baselines by type..."
BL_FILTER=$(curl -s "$API/api/baselines?baselineType=FUNCTIONAL" -H "$AUTH")
assert "GET /baselines?baselineType filter - success" "true" "$(echo "$BL_FILTER" | jq -r '.success')"

echo ""

# -------------------------------------------------
echo "4. CHANGES MODULE (Engineering Change Requests)"
echo "-------------------------------------------------"

echo "  Creating change request..."
CR_RESULT=$(curl -s -X POST "$API/api/changes" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "title": "Update blade coating specification from TBC-A to TBC-B for improved thermal performance",
  "description": "Current TBC-A thermal barrier coating showing accelerated spallation at operating temperatures above 1100C. TBC-B specification offers 40% improvement in thermal resistance with same substrate compatibility.",
  "changeType": "MATERIAL",
  "priority": "HIGH",
  "reason": "In-service performance data shows TBC-A degrading faster than expected, affecting service life targets",
  "affectedDocuments": ["ENG-SPEC-TBA-100-COAT-001", "PROC-COAT-007"],
  "affectedProcesses": ["Thermal Barrier Coating Application"],
  "affectedParts": ["TBA-100-BLADE-001", "TBA-100-BLADE-002"],
  "customerImpact": false,
  "regulatoryImpact": false,
  "safetyImpact": false,
  "costEstimate": 15000,
  "proposedBy": "Materials Engineer",
  "requestedDate": "2026-02-20",
  "notes": "Supplier qualification required for new coating material"
}')
CR_SUCCESS=$(echo "$CR_RESULT" | jq -r '.success')
CR_ID=$(echo "$CR_RESULT" | jq -r '.data.id')
CR_REF=$(echo "$CR_RESULT" | jq -r '.data.refNumber')
assert "POST /changes - success" "true" "$CR_SUCCESS"
assert_contains "POST /changes - has ref number" "AERO-CR-" "$CR_REF"
assert "POST /changes - type MATERIAL" "MATERIAL" "$(echo "$CR_RESULT" | jq -r '.data.changeType')"
assert "POST /changes - status DRAFT" "DRAFT" "$(echo "$CR_RESULT" | jq -r '.data.status')"

echo "  Listing change requests..."
CR_LIST=$(curl -s "$API/api/changes" -H "$AUTH")
assert "GET /changes - success" "true" "$(echo "$CR_LIST" | jq -r '.success')"
assert "GET /changes - has records" "true" "$(echo "$CR_LIST" | jq -r '(.data | length) > 0')"

echo "  Getting single change request..."
CR_GET=$(curl -s "$API/api/changes/$CR_ID" -H "$AUTH")
assert "GET /changes/:id - success" "true" "$(echo "$CR_GET" | jq -r '.success')"

echo "  Submitting change request..."
CR_SUBMIT=$(curl -s -X PUT "$API/api/changes/$CR_ID/submit" -H "$AUTH" -H "Content-Type: application/json" -d '{}')
assert "PUT /changes/:id/submit - success" "true" "$(echo "$CR_SUBMIT" | jq -r '.success')"
assert "PUT /changes/:id/submit - status SUBMITTED" "SUBMITTED" "$(echo "$CR_SUBMIT" | jq -r '.data.status')"

echo "  Reviewing change request..."
CR_REVIEW=$(curl -s -X PUT "$API/api/changes/$CR_ID/review" -H "$AUTH" -H "Content-Type: application/json" -d '{"decision":"APPROVE","reviewNotes":"Change approved pending supplier qualification","reviewedBy":"Engineering Manager"}')
assert "PUT /changes/:id/review - success" "true" "$(echo "$CR_REVIEW" | jq -r '.success')"
assert "PUT /changes/:id/review - status APPROVED" "APPROVED" "$(echo "$CR_REVIEW" | jq -r '.data.status')"

echo "  Filtering changes by type..."
CR_FILTER=$(curl -s "$API/api/changes?changeType=MATERIAL" -H "$AUTH")
assert "GET /changes?changeType filter - success" "true" "$(echo "$CR_FILTER" | jq -r '.success')"

echo "  Testing change 404..."
CR_404=$(curl -s "$API/api/changes/00000000-0000-0000-0000-000000000999" -H "$AUTH")
assert "GET /changes/:id - 404" "NOT_FOUND" "$(echo "$CR_404" | jq -r '.error.code')"

echo ""

# -------------------------------------------------
echo "5. COMPLIANCE TRACKER MODULE (AS9100D Clause Tracker)"
echo "-------------------------------------------------"

echo "  Getting AS9100D clause reference data..."
CLAUSES=$(curl -s "$API/api/compliance-tracker/clauses" -H "$AUTH")
assert "GET /compliance-tracker/clauses - success" "true" "$(echo "$CLAUSES" | jq -r '.success')"
assert "GET /compliance-tracker/clauses - has clauses" "true" "$(echo "$CLAUSES" | jq -r '(.data | length) > 0')"
assert_contains "GET /compliance-tracker/clauses - has 4.1 clause" "4.1" "$(echo "$CLAUSES" | jq -r '.data[0].clause')"

echo "  Creating compliance item..."
COMP_RESULT=$(curl -s -X POST "$API/api/compliance-tracker" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "clause": "8.1.2",
  "title": "Configuration Management Process",
  "description": "Documented configuration management process including baseline identification, change control, status accounting, and audits",
  "standard": "AS9100D",
  "evidenceDocuments": ["QP-CM-001 Configuration Management Procedure", "CM-PLAN-2026"],
  "responsiblePerson": "Quality Manager",
  "targetDate": "2026-06-30",
  "notes": "Updating procedure to address audit finding F-001"
}')
COMP_SUCCESS=$(echo "$COMP_RESULT" | jq -r '.success')
COMP_ID=$(echo "$COMP_RESULT" | jq -r '.data.id')
COMP_REF=$(echo "$COMP_RESULT" | jq -r '.data.refNumber')
assert "POST /compliance-tracker - success" "true" "$COMP_SUCCESS"
assert_contains "POST /compliance-tracker - has ref number" "AERO-COMP-" "$COMP_REF"
assert "POST /compliance-tracker - clause set" "8.1.2" "$(echo "$COMP_RESULT" | jq -r '.data.clause')"
assert "POST /compliance-tracker - status UNDER_REVIEW" "UNDER_REVIEW" "$(echo "$COMP_RESULT" | jq -r '.data.complianceStatus')"

echo "  Listing compliance items..."
COMP_LIST=$(curl -s "$API/api/compliance-tracker" -H "$AUTH")
assert "GET /compliance-tracker - success" "true" "$(echo "$COMP_LIST" | jq -r '.success')"
assert "GET /compliance-tracker - has records" "true" "$(echo "$COMP_LIST" | jq -r '(.data | length) > 0')"

echo "  Getting single compliance item..."
COMP_GET=$(curl -s "$API/api/compliance-tracker/$COMP_ID" -H "$AUTH")
assert "GET /compliance-tracker/:id - success" "true" "$(echo "$COMP_GET" | jq -r '.success')"

echo "  Updating compliance status..."
COMP_PUT=$(curl -s -X PUT "$API/api/compliance-tracker/$COMP_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{"complianceStatus":"COMPLIANT","responsiblePerson":"Quality Manager","lastReviewDate":"2026-02-23"}')
assert "PUT /compliance-tracker/:id - success" "true" "$(echo "$COMP_PUT" | jq -r '.success')"
assert "PUT /compliance-tracker/:id - status COMPLIANT" "COMPLIANT" "$(echo "$COMP_PUT" | jq -r '.data.complianceStatus')"

echo "  Getting compliance dashboard summary..."
COMP_DASH=$(curl -s "$API/api/compliance-tracker/dashboard/summary" -H "$AUTH")
assert "GET /compliance-tracker/dashboard/summary - success" "true" "$(echo "$COMP_DASH" | jq -r '.success')"

echo ""

# -------------------------------------------------
echo "6. CONFIGURATION MODULE (Configuration Management)"
echo "-------------------------------------------------"

echo "  Creating configuration baseline via config route..."
CONFIG_BL=$(curl -s -X POST "$API/api/configuration/baselines" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "title": "Product Baseline - TBA-100 Block 1",
  "description": "Product baseline after PDR approval",
  "program": "TBA-100 Turbine Blade Assembly",
  "version": "1.0",
  "baselineType": "PRODUCT",
  "effectiveDate": "2026-03-01"
}')
assert "POST /configuration/baselines - success" "true" "$(echo "$CONFIG_BL" | jq -r '.success')"
CONFIG_BL_ID=$(echo "$CONFIG_BL" | jq -r '.data.id')

echo "  Listing configuration baselines..."
CONFIG_BL_LIST=$(curl -s "$API/api/configuration/baselines" -H "$AUTH")
assert "GET /configuration/baselines - success" "true" "$(echo "$CONFIG_BL_LIST" | jq -r '.success')"

echo "  Getting status accounting..."
STATUS_ACC=$(curl -s "$API/api/configuration/status-accounting" -H "$AUTH")
assert "GET /configuration/status-accounting - success" "true" "$(echo "$STATUS_ACC" | jq -r '.success')"

echo "  Creating configuration change..."
CONFIG_CHG=$(curl -s -X POST "$API/api/configuration/changes" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "title": "Update material spec for TBA-100-BLADE-001",
  "changeType": "MATERIAL",
  "priority": "MEDIUM",
  "description": "Change coating specification per ECR-2026-007",
  "reason": "Performance improvement"
}')
assert "POST /configuration/changes - success" "true" "$(echo "$CONFIG_CHG" | jq -r '.success')"

echo "  Listing configuration changes..."
CONFIG_CHG_LIST=$(curl -s "$API/api/configuration/changes" -H "$AUTH")
assert "GET /configuration/changes - success" "true" "$(echo "$CONFIG_CHG_LIST" | jq -r '.success')"

echo ""

# -------------------------------------------------
echo "7. NADCAP MODULE (Special Process Verification)"
echo "-------------------------------------------------"

echo "  Creating NADCAP scope verification..."
NADCAP_RESULT=$(curl -s -X POST "$API/api/nadcap-scope" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "supplierName": "SpecialCoat Aerospace Ltd",
  "supplierCode": "SC-AE-0042",
  "nadcapCertRef": "NADCAP-CERT-2026-0042",
  "certExpiryDate": "2027-06-30",
  "issuedByPri": true,
  "commodityCodes": ["AC7004", "AC7108", "AC7109"],
  "commodityCodesRequired": ["AC7004", "AC7108"],
  "processDescription": "Thermal spray coating and heat treatment for aerospace components",
  "auditBoard": "Boeing Special Process Review Board",
  "verifiedBy": "Supplier Quality Engineer",
  "verificationDate": "2026-02-23",
  "approvedBy": "Supplier Quality Manager",
  "notes": "All required commodity codes confirmed in scope"
}')
NADCAP_SUCCESS=$(echo "$NADCAP_RESULT" | jq -r '.success')
NADCAP_ID=$(echo "$NADCAP_RESULT" | jq -r '.data.id')
assert "POST /nadcap-scope - success" "true" "$NADCAP_SUCCESS"
assert "POST /nadcap-scope - supplier name set" "SpecialCoat Aerospace Ltd" "$(echo "$NADCAP_RESULT" | jq -r '.data.supplierName')"
assert "POST /nadcap-scope - status VERIFIED_COMPLIANT (all codes covered)" "VERIFIED_COMPLIANT" "$(echo "$NADCAP_RESULT" | jq -r '.data.status')"

echo "  Creating NADCAP scope with gap..."
NADCAP_GAP_RESULT=$(curl -s -X POST "$API/api/nadcap-scope" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "supplierName": "BasicCoat Ltd",
  "nadcapCertRef": "NADCAP-CERT-2026-BASIC",
  "certExpiryDate": "2027-03-31",
  "commodityCodes": ["AC7004"],
  "commodityCodesRequired": ["AC7004", "AC7108", "AC7116"],
  "processDescription": "Basic coating only",
  "verifiedBy": "Supplier Quality Engineer",
  "verificationDate": "2026-02-23"
}')
assert "POST /nadcap-scope with gap - status SCOPE_GAP_IDENTIFIED" "SCOPE_GAP_IDENTIFIED" "$(echo "$NADCAP_GAP_RESULT" | jq -r '.data.status')"
assert "POST /nadcap-scope with gap - gaps identified" "true" "$(echo "$NADCAP_GAP_RESULT" | jq -r '(.data.scopeGaps | length) > 0')"

echo "  Listing NADCAP verifications..."
NADCAP_LIST=$(curl -s "$API/api/nadcap-scope" -H "$AUTH")
assert "GET /nadcap-scope - success" "true" "$(echo "$NADCAP_LIST" | jq -r '.success')"
assert "GET /nadcap-scope - has records" "true" "$(echo "$NADCAP_LIST" | jq -r '(.data | length) > 0')"

echo "  Getting NADCAP gaps report..."
NADCAP_GAPS=$(curl -s "$API/api/nadcap-scope/gaps" -H "$AUTH")
assert "GET /nadcap-scope/gaps - success" "true" "$(echo "$NADCAP_GAPS" | jq -r '.success')"
assert "GET /nadcap-scope/gaps - has gap records" "true" "$(echo "$NADCAP_GAPS" | jq -r '(.data | length) > 0')"

echo "  Filtering NADCAP by status..."
NADCAP_FILTER=$(curl -s "$API/api/nadcap-scope?status=SCOPE_GAP_IDENTIFIED" -H "$AUTH")
assert "GET /nadcap-scope?status filter - success" "true" "$(echo "$NADCAP_FILTER" | jq -r '.success')"

echo ""

# -------------------------------------------------
echo "8. DELETE OPERATIONS"
echo "-------------------------------------------------"

echo "  Deleting test records..."
DEL_AUD=$(curl -s -X DELETE "$API/api/audits/$AUD_ID" -H "$AUTH")
assert "DELETE /audits/:id" "true" "$(echo "$DEL_AUD" | jq -r '.success')"

DEL_BL=$(curl -s -X DELETE "$API/api/baselines/$BL_ID" -H "$AUTH")
assert "DELETE /baselines/:id" "true" "$(echo "$DEL_BL" | jq -r '.success')"

DEL_CR=$(curl -s -X DELETE "$API/api/changes/$CR_ID" -H "$AUTH")
assert "DELETE /changes/:id" "true" "$(echo "$DEL_CR" | jq -r '.success')"

DEL_COMP=$(curl -s -X DELETE "$API/api/compliance-tracker/$COMP_ID" -H "$AUTH")
assert "DELETE /compliance-tracker/:id" "true" "$(echo "$DEL_COMP" | jq -r '.success')"

echo "  Verifying deletes..."
VERIFY_AUD=$(curl -s "$API/api/audits/$AUD_ID" -H "$AUTH")
assert "Deleted audit returns 404" "NOT_FOUND" "$(echo "$VERIFY_AUD" | jq -r '.error.code')"

VERIFY_BL=$(curl -s "$API/api/baselines/$BL_ID" -H "$AUTH")
assert "Deleted baseline returns 404" "NOT_FOUND" "$(echo "$VERIFY_BL" | jq -r '.error.code')"

VERIFY_CR=$(curl -s "$API/api/changes/$CR_ID" -H "$AUTH")
assert "Deleted change request returns 404" "NOT_FOUND" "$(echo "$VERIFY_CR" | jq -r '.error.code')"

echo ""

# -------------------------------------------------
echo "9. GATEWAY PROXY"
echo "-------------------------------------------------"

echo "  Testing routes through gateway..."
for ROUTE in audits baselines changes compliance-tracker configuration nadcap-scope; do
  RESULT=$(curl -s "$GW/api/aerospace/$ROUTE" -H "$AUTH")
  assert "Gateway /api/aerospace/$ROUTE" "true" "$(echo "$RESULT" | jq -r '.success')"
done

echo ""
echo "============================================"
echo "  RESULTS: $PASS passed, $FAIL failed (out of $TOTAL)"
echo "============================================"

if [ $FAIL -gt 0 ]; then
  exit 1
fi
