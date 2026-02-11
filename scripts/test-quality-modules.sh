#!/bin/bash
# Comprehensive test script for Quality modules
# Tests: Parties, Issues, Risks, Opportunities, Processes, Nonconformances,
#        Actions, Documents, CAPA, Legal, FMEA, Improvements, Suppliers,
#        Changes, Objectives — CRUD + Gateway + Nested Resources

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
ORIGIN="Origin: http://localhost:3003"

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
echo "  Quality Modules - Comprehensive Test Suite"
echo "============================================"
echo ""

# ─────────────────────────────────────────────
echo "1. INTERESTED PARTIES MODULE"
echo "─────────────────────────────────────────"

# 1a. POST - Create party
echo "  Creating interested party..."
PTY_RESULT=$(curl -s -X POST "$GW/api/quality/parties" -H "$AUTH" -H "$ORIGIN" -H "Content-Type: application/json" -d '{
  "partyName":"Major Automotive OEM",
  "partyType":"EXTERNAL",
  "reasonForInclusion":"Key customer representing 40% of revenue",
  "needsExpectations":"Zero defect delivery, on-time performance >98%, IATF 16949 compliance",
  "communicationMethod":"Quarterly business review, monthly KPI dashboard",
  "reviewFrequency":"QUARTERLY"
}')
PTY_SUCCESS=$(echo "$PTY_RESULT" | jq -r '.success')
PTY_ID=$(echo "$PTY_RESULT" | jq -r '.data.id')
PTY_REF=$(echo "$PTY_RESULT" | jq -r '.data.referenceNumber')
assert "POST /parties - success" "true" "$PTY_SUCCESS"
assert_contains "POST /parties - has ref number" "QMS-PTY-" "$PTY_REF"
assert "POST /parties - default status ACTIVE" "ACTIVE" "$(echo "$PTY_RESULT" | jq -r '.data.status')"

# 1b. GET - List
echo "  Listing parties..."
LIST_RESULT=$(curl -s "$GW/api/quality/parties" -H "$AUTH" -H "$ORIGIN")
assert "GET /parties - success" "true" "$(echo "$LIST_RESULT" | jq -r '.success')"

# 1c. GET - Single
GET_RESULT=$(curl -s "$GW/api/quality/parties/$PTY_ID" -H "$AUTH" -H "$ORIGIN")
assert "GET /parties/:id - success" "true" "$(echo "$GET_RESULT" | jq -r '.success')"

# 1d. PUT - Update
PUT_RESULT=$(curl -s -X PUT "$GW/api/quality/parties/$PTY_ID" -H "$AUTH" -H "$ORIGIN" -H "Content-Type: application/json" -d '{"reviewFrequency":"MONTHLY"}')
assert "PUT /parties/:id - success" "true" "$(echo "$PUT_RESULT" | jq -r '.success')"
assert "PUT /parties/:id - updated" "MONTHLY" "$(echo "$PUT_RESULT" | jq -r '.data.reviewFrequency')"

# 1e. Validation
VAL_RESULT=$(curl -s -X POST "$GW/api/quality/parties" -H "$AUTH" -H "$ORIGIN" -H "Content-Type: application/json" -d '{"partyName":"Test"}')
assert "POST /parties - validation error" "VALIDATION_ERROR" "$(echo "$VAL_RESULT" | jq -r '.error.code')"

echo ""

# ─────────────────────────────────────────────
echo "2. ISSUES MODULE"
echo "─────────────────────────────────────────"

# 2a. POST - Create issue (linked to party)
echo "  Creating issue..."
ISS_RESULT=$(curl -s -X POST "$GW/api/quality/issues" -H "$AUTH" -H "$ORIGIN" -H "Content-Type: application/json" -d "{
  \"partyId\":\"$PTY_ID\",
  \"issueOfConcern\":\"Increasing customer returns due to surface finish defects\",
  \"bias\":\"RISK\",
  \"processesAffected\":\"Painting, Final Inspection\",
  \"priority\":\"HIGH\",
  \"treatmentMethod\":\"Root cause analysis and process improvement\"
}")
ISS_SUCCESS=$(echo "$ISS_RESULT" | jq -r '.success')
ISS_ID=$(echo "$ISS_RESULT" | jq -r '.data.id')
ISS_REF=$(echo "$ISS_RESULT" | jq -r '.data.referenceNumber')
assert "POST /issues - success" "true" "$ISS_SUCCESS"
assert_contains "POST /issues - has ref number" "QMS-ISS-" "$ISS_REF"
assert "POST /issues - default status OPEN" "OPEN" "$(echo "$ISS_RESULT" | jq -r '.data.status')"

# 2b. GET - List
LIST_RESULT=$(curl -s "$GW/api/quality/issues" -H "$AUTH" -H "$ORIGIN")
assert "GET /issues - success" "true" "$(echo "$LIST_RESULT" | jq -r '.success')"

# 2c. PUT - Update
PUT_RESULT=$(curl -s -X PUT "$GW/api/quality/issues/$ISS_ID" -H "$AUTH" -H "$ORIGIN" -H "Content-Type: application/json" -d '{"status":"UNDER_REVIEW"}')
assert "PUT /issues/:id - status updated" "UNDER_REVIEW" "$(echo "$PUT_RESULT" | jq -r '.data.status')"

# 2d. Filter
FILTER_RESULT=$(curl -s "$GW/api/quality/issues?bias=RISK" -H "$AUTH" -H "$ORIGIN")
assert "GET /issues?bias filter" "true" "$(echo "$FILTER_RESULT" | jq -r '.success')"

echo ""

# ─────────────────────────────────────────────
echo "3. RISKS MODULE"
echo "─────────────────────────────────────────"

# 3a. POST - Create risk
echo "  Creating risk..."
RSK_RESULT=$(curl -s -X POST "$GW/api/quality/risks" -H "$AUTH" -H "$ORIGIN" -H "Content-Type: application/json" -d '{
  "process":"OPERATIONS",
  "riskDescription":"Single source supplier for critical raw material with 12-week lead time",
  "reportedBy":"Procurement Manager",
  "likelihood":4,
  "lossOfContracts":3,
  "harmToUser":1,
  "unableToMeetTerms":4,
  "violationOfRegulations":1,
  "reputationImpact":3,
  "costOfCorrection":2,
  "treatmentOption":"REDUCE",
  "treatmentActions":"Qualify second supplier, maintain 8 weeks safety stock",
  "responsiblePerson":"Supply Chain Director"
}')
RSK_SUCCESS=$(echo "$RSK_RESULT" | jq -r '.success')
RSK_ID=$(echo "$RSK_RESULT" | jq -r '.data.id')
RSK_REF=$(echo "$RSK_RESULT" | jq -r '.data.referenceNumber')
RSK_FACTOR=$(echo "$RSK_RESULT" | jq -r '.data.riskFactor')
RSK_LEVEL=$(echo "$RSK_RESULT" | jq -r '.data.riskLevel')
assert "POST /risks - success" "true" "$RSK_SUCCESS"
assert_contains "POST /risks - has ref number" "QMS-RSK-" "$RSK_REF"
assert "POST /risks - riskFactor auto-calculated" "16" "$RSK_FACTOR"
assert "POST /risks - riskLevel auto-determined" "HIGH" "$RSK_LEVEL"

# 3b. GET - List
LIST_RESULT=$(curl -s "$GW/api/quality/risks" -H "$AUTH" -H "$ORIGIN")
assert "GET /risks - success" "true" "$(echo "$LIST_RESULT" | jq -r '.success')"

# 3c. PUT - Update risk
PUT_RESULT=$(curl -s -X PUT "$GW/api/quality/risks/$RSK_ID" -H "$AUTH" -H "$ORIGIN" -H "Content-Type: application/json" -d '{"status":"BEING_TREATED"}')
assert "PUT /risks/:id - status updated" "BEING_TREATED" "$(echo "$PUT_RESULT" | jq -r '.data.status')"

# 3d. Filter
FILTER_RESULT=$(curl -s "$GW/api/quality/risks?riskLevel=HIGH" -H "$AUTH" -H "$ORIGIN")
assert "GET /risks?riskLevel filter" "true" "$(echo "$FILTER_RESULT" | jq -r '.success')"

echo ""

# ─────────────────────────────────────────────
echo "4. OPPORTUNITIES MODULE"
echo "─────────────────────────────────────────"

# 4a. POST - Create opportunity
echo "  Creating opportunity..."
OPP_RESULT=$(curl -s -X POST "$GW/api/quality/opportunities" -H "$AUTH" -H "$ORIGIN" -H "Content-Type: application/json" -d '{
  "process":"MARKETING_SALES",
  "opportunityDescription":"Expand into electric vehicle component market leveraging existing precision machining capability",
  "reportedBy":"Sales Director",
  "likelihood":4,
  "newBusiness":4,
  "expansionOfCurrent":3,
  "satisfyingRegs":2,
  "internalQmsImprovement":2,
  "reputationImprovement":3,
  "actionToExploit":"Attend EV Expo, develop capability statement",
  "responsiblePerson":"Business Development Manager"
}')
OPP_SUCCESS=$(echo "$OPP_RESULT" | jq -r '.success')
OPP_ID=$(echo "$OPP_RESULT" | jq -r '.data.id')
OPP_SCORE=$(echo "$OPP_RESULT" | jq -r '.data.opportunityScore')
assert "POST /opportunities - success" "true" "$OPP_SUCCESS"
assert_contains "POST /opportunities - has ref number" "QMS-OPP-" "$(echo "$OPP_RESULT" | jq -r '.data.referenceNumber')"
assert "POST /opportunities - score auto-calculated" "16" "$OPP_SCORE"

# 4b. GET - List
LIST_RESULT=$(curl -s "$GW/api/quality/opportunities" -H "$AUTH" -H "$ORIGIN")
assert "GET /opportunities - success" "true" "$(echo "$LIST_RESULT" | jq -r '.success')"

# 4c. PUT - Update
PUT_RESULT=$(curl -s -X PUT "$GW/api/quality/opportunities/$OPP_ID" -H "$AUTH" -H "$ORIGIN" -H "Content-Type: application/json" -d '{"status":"BEING_EXPLOITED"}')
assert "PUT /opportunities/:id - status updated" "BEING_EXPLOITED" "$(echo "$PUT_RESULT" | jq -r '.data.status')"

echo ""

# ─────────────────────────────────────────────
echo "5. PROCESSES MODULE"
echo "─────────────────────────────────────────"

# 5a. POST - Create process (Turtle Diagram)
echo "  Creating process..."
PRO_RESULT=$(curl -s -X POST "$GW/api/quality/processes" -H "$AUTH" -H "$ORIGIN" -H "Content-Type: application/json" -d '{
  "processName":"CNC Machining Process",
  "processType":"CORE",
  "isoClause":"8.5",
  "department":"Production",
  "processOwner":"Production Manager",
  "purposeScope":"Transform raw castings into precision-machined components to customer specification",
  "inputs":"Raw castings, CNC programs, work orders, tooling",
  "outputs":"Machined components, inspection records, scrap reports",
  "customerOfOutput":"Assembly, Final Inspection",
  "resourcesRequired":"CNC machines, coolant, tooling, compressed air",
  "competenceNeeded":"CNC operators with NVQ Level 3",
  "keyActivities":"Setup, machining, in-process inspection, tool change",
  "controlsMethods":"SPC charts, first-off inspection, tool life monitoring"
}')
PRO_SUCCESS=$(echo "$PRO_RESULT" | jq -r '.success')
PRO_ID=$(echo "$PRO_RESULT" | jq -r '.data.id')
assert "POST /processes - success" "true" "$PRO_SUCCESS"
assert_contains "POST /processes - has ref number" "QMS-PRO-" "$(echo "$PRO_RESULT" | jq -r '.data.referenceNumber')"
assert "POST /processes - default status DRAFT" "DRAFT" "$(echo "$PRO_RESULT" | jq -r '.data.status')"

# 5b. GET - List
LIST_RESULT=$(curl -s "$GW/api/quality/processes" -H "$AUTH" -H "$ORIGIN")
assert "GET /processes - success" "true" "$(echo "$LIST_RESULT" | jq -r '.success')"

# 5c. PUT - Update
PUT_RESULT=$(curl -s -X PUT "$GW/api/quality/processes/$PRO_ID" -H "$AUTH" -H "$ORIGIN" -H "Content-Type: application/json" -d '{"status":"ACTIVE"}')
assert "PUT /processes/:id - status updated" "ACTIVE" "$(echo "$PUT_RESULT" | jq -r '.data.status')"

echo ""

# ─────────────────────────────────────────────
echo "6. NONCONFORMANCES MODULE"
echo "─────────────────────────────────────────"

# 6a. POST - Create NC
echo "  Creating non-conformance..."
NC_RESULT=$(curl -s -X POST "$GW/api/quality/nonconformances" -H "$AUTH" -H "$ORIGIN" -H "Content-Type: application/json" -d '{
  "ncType":"PRODUCT_DEFECT",
  "source":"PROCESS_MONITORING",
  "severity":"MAJOR",
  "reportedBy":"QC Inspector",
  "department":"Production",
  "title":"Surface finish out of tolerance on batch 2026-0142",
  "description":"Ra value measured at 3.2um against specification of 1.6um max. Entire batch of 150 pieces affected.",
  "quantityAffected":150,
  "quantityUnit":"pieces",
  "customerImpact":true,
  "customerImpactDesc":"Customer delivery delayed by 5 days",
  "containmentRequired":true,
  "containmentActions":"Batch quarantined in NCR area, customer notified"
}')
NC_SUCCESS=$(echo "$NC_RESULT" | jq -r '.success')
NC_ID=$(echo "$NC_RESULT" | jq -r '.data.id')
NC_REF=$(echo "$NC_RESULT" | jq -r '.data.referenceNumber')
assert "POST /nonconformances - success" "true" "$NC_SUCCESS"
assert_contains "POST /nonconformances - has ref number" "QMS-NC-" "$NC_REF"
assert "POST /nonconformances - default status REPORTED" "REPORTED" "$(echo "$NC_RESULT" | jq -r '.data.status')"

# 6b. GET - List
LIST_RESULT=$(curl -s "$GW/api/quality/nonconformances" -H "$AUTH" -H "$ORIGIN")
assert "GET /nonconformances - success" "true" "$(echo "$LIST_RESULT" | jq -r '.success')"

# 6c. PUT - Update with RCA
PUT_RESULT=$(curl -s -X PUT "$GW/api/quality/nonconformances/$NC_ID" -H "$AUTH" -H "$ORIGIN" -H "Content-Type: application/json" -d '{"status":"ROOT_CAUSE","rcaMethod":"FIVE_WHY","why1":"Surface finish out of tolerance","why2":"Worn cutting tool used beyond life limit","why3":"Tool life counter not reset after last change","why4":"No mandatory reset procedure in work instruction","why5":"Work instruction not updated after new tooling introduced","rootCause":"Missing procedure step for tool counter reset","rootCauseCategory":"PROCESS_FAILURE"}')
assert "PUT /nonconformances/:id - RCA updated" "ROOT_CAUSE" "$(echo "$PUT_RESULT" | jq -r '.data.status')"
assert "PUT /nonconformances/:id - root cause set" "PROCESS_FAILURE" "$(echo "$PUT_RESULT" | jq -r '.data.rootCauseCategory')"

# 6d. Filter
FILTER_RESULT=$(curl -s "$GW/api/quality/nonconformances?severity=MAJOR" -H "$AUTH" -H "$ORIGIN")
assert "GET /nonconformances?severity filter" "true" "$(echo "$FILTER_RESULT" | jq -r '.success')"

echo ""

# ─────────────────────────────────────────────
echo "7. ACTIONS MODULE"
echo "─────────────────────────────────────────"

# 7a. POST - Create action
echo "  Creating quality action..."
QACT_RESULT=$(curl -s -X POST "$GW/api/quality/actions" -H "$AUTH" -H "$ORIGIN" -H "Content-Type: application/json" -d '{
  "title":"Update CNC work instruction WI-PRD-012 to include mandatory tool counter reset",
  "actionType":"CORRECTIVE",
  "priority":"HIGH",
  "source":"NC_REPORT",
  "sourceReference":"QMS-NC-2026-001",
  "description":"Add step 4.7 to work instruction requiring operator to verify and reset tool life counter after every tool change",
  "expectedOutcome":"Zero recurrence of tool-life-related surface finish NCs",
  "assignedTo":"Process Engineer",
  "department":"Production Engineering",
  "dueDate":"2026-03-01"
}')
QACT_SUCCESS=$(echo "$QACT_RESULT" | jq -r '.success')
QACT_ID=$(echo "$QACT_RESULT" | jq -r '.data.id')
assert "POST /actions - success" "true" "$QACT_SUCCESS"
assert_contains "POST /actions - has ref number" "QMS-ACT-" "$(echo "$QACT_RESULT" | jq -r '.data.referenceNumber')"
assert "POST /actions - default status OPEN" "OPEN" "$(echo "$QACT_RESULT" | jq -r '.data.status')"
assert "POST /actions - percentComplete 0" "0" "$(echo "$QACT_RESULT" | jq -r '.data.percentComplete')"

# 7b. GET - List
LIST_RESULT=$(curl -s "$GW/api/quality/actions" -H "$AUTH" -H "$ORIGIN")
assert "GET /actions - success" "true" "$(echo "$LIST_RESULT" | jq -r '.success')"

# 7c. PUT - Complete action
PUT_RESULT=$(curl -s -X PUT "$GW/api/quality/actions/$QACT_ID" -H "$AUTH" -H "$ORIGIN" -H "Content-Type: application/json" -d '{"status":"COMPLETED","percentComplete":100}')
assert "PUT /actions/:id - status COMPLETED" "COMPLETED" "$(echo "$PUT_RESULT" | jq -r '.data.status')"
assert "PUT /actions/:id - completionDate auto-set" "true" "$(echo "$PUT_RESULT" | jq -r '.data.completionDate != null')"

echo ""

# ─────────────────────────────────────────────
echo "8. DOCUMENTS MODULE"
echo "─────────────────────────────────────────"

# 8a. POST - Create document
echo "  Creating document..."
DOC_RESULT=$(curl -s -X POST "$GW/api/quality/documents" -H "$AUTH" -H "$ORIGIN" -H "Content-Type: application/json" -d '{
  "title":"Quality Manual - IMS",
  "documentType":"POLICY",
  "isoClause":"4.3, 5.2",
  "version":"3.0",
  "purpose":"Define the quality management system scope, policy and objectives",
  "scope":"All processes within the IMS scope of certification",
  "author":"Quality Director",
  "ownerCustodian":"Quality Director",
  "reviewer":"Managing Director",
  "accessLevel":"CONTROLLED"
}')
DOC_SUCCESS=$(echo "$DOC_RESULT" | jq -r '.success')
DOC_ID=$(echo "$DOC_RESULT" | jq -r '.data.id')
assert "POST /documents - success" "true" "$DOC_SUCCESS"
assert_contains "POST /documents - has ref number" "QMS-DOC-" "$(echo "$DOC_RESULT" | jq -r '.data.referenceNumber')"
assert "POST /documents - default status DRAFT" "DRAFT" "$(echo "$DOC_RESULT" | jq -r '.data.status')"

# 8b. GET - List
LIST_RESULT=$(curl -s "$GW/api/quality/documents" -H "$AUTH" -H "$ORIGIN")
assert "GET /documents - success" "true" "$(echo "$LIST_RESULT" | jq -r '.success')"

# 8c. PUT - Approve
PUT_RESULT=$(curl -s -X PUT "$GW/api/quality/documents/$DOC_ID" -H "$AUTH" -H "$ORIGIN" -H "Content-Type: application/json" -d '{"status":"APPROVED","approvedBy":"Managing Director"}')
assert "PUT /documents/:id - status APPROVED" "APPROVED" "$(echo "$PUT_RESULT" | jq -r '.data.status')"

echo ""

# ─────────────────────────────────────────────
echo "9. CAPA MODULE"
echo "─────────────────────────────────────────"

# 9a. POST - Create CAPA
echo "  Creating CAPA..."
CAPA_RESULT=$(curl -s -X POST "$GW/api/quality/capa" -H "$AUTH" -H "$ORIGIN" -H "Content-Type: application/json" -d '{
  "capaType":"CORRECTIVE",
  "title":"Recurring surface finish NCs on CNC line",
  "severity":"MAJOR",
  "triggerSource":"NC_REPORT",
  "sourceReference":"QMS-NC-2026-001",
  "description":"Multiple surface finish NCs traced to inadequate tool life management in CNC work instructions",
  "isoClause":"8.5.1, 10.2",
  "immediateActionRequired":true,
  "actionsTaken":"Batch quarantined, customer notified, temporary inspection added",
  "rcaMethod":"FIVE_WHY",
  "problemStatement":"Surface finish exceeding tolerance on CNC machined parts",
  "why1":"Worn cutting tool used beyond life limit",
  "why2":"Tool life counter not reset after tool change",
  "rootCauseStatement":"Work instruction missing mandatory tool counter reset step",
  "rootCauseCategory":"PROCESS_FAILURE",
  "targetClosureDate":"2026-04-15"
}')
CAPA_SUCCESS=$(echo "$CAPA_RESULT" | jq -r '.success')
CAPA_ID=$(echo "$CAPA_RESULT" | jq -r '.data.id')
CAPA_REF=$(echo "$CAPA_RESULT" | jq -r '.data.referenceNumber')
assert "POST /capa - success" "true" "$CAPA_SUCCESS"
assert_contains "POST /capa - has ref number" "QMS-CAPA-" "$CAPA_REF"
assert "POST /capa - default status INITIATED" "INITIATED" "$(echo "$CAPA_RESULT" | jq -r '.data.status')"

# 9b. POST - Add CAPA action
echo "  Adding CAPA action..."
CACT_RESULT=$(curl -s -X POST "$GW/api/quality/capa/$CAPA_ID/actions" -H "$AUTH" -H "$ORIGIN" -H "Content-Type: application/json" -d '{
  "action":"Update work instruction WI-PRD-012 with tool counter reset step",
  "assignedTo":"Process Engineer",
  "dueDate":"2026-03-01",
  "priority":"HIGH"
}')
CACT_SUCCESS=$(echo "$CACT_RESULT" | jq -r '.success')
CACT_ID=$(echo "$CACT_RESULT" | jq -r '.data.id')
assert "POST /capa/:id/actions - success" "true" "$CACT_SUCCESS"

# 9c. PUT - Complete CAPA action
echo "  Completing CAPA action..."
CACT_PUT=$(curl -s -X PUT "$GW/api/quality/capa/$CAPA_ID/actions/$CACT_ID" -H "$AUTH" -H "$ORIGIN" -H "Content-Type: application/json" -d '{"status":"COMPLETED"}')
assert "PUT /capa/:id/actions/:aid - completed" "COMPLETED" "$(echo "$CACT_PUT" | jq -r '.data.status')"
assert "PUT action - completedDate auto-set" "true" "$(echo "$CACT_PUT" | jq -r '.data.completedDate != null')"

# 9d. GET - List CAPAs with actions
LIST_RESULT=$(curl -s "$GW/api/quality/capa" -H "$AUTH" -H "$ORIGIN")
assert "GET /capa - success" "true" "$(echo "$LIST_RESULT" | jq -r '.success')"

# 9e. PUT - Close CAPA
PUT_RESULT=$(curl -s -X PUT "$GW/api/quality/capa/$CAPA_ID" -H "$AUTH" -H "$ORIGIN" -H "Content-Type: application/json" -d '{"status":"CLOSED","lessonsLearned":"All work instructions must include mandatory reset steps for counters and gauges","actionsEffective":"YES"}')
assert "PUT /capa close - status CLOSED" "CLOSED" "$(echo "$PUT_RESULT" | jq -r '.data.status')"
assert "PUT /capa close - actualClosureDate auto-set" "true" "$(echo "$PUT_RESULT" | jq -r '.data.actualClosureDate != null')"

# 9f. Filter
FILTER_RESULT=$(curl -s "$GW/api/quality/capa?capaType=CORRECTIVE" -H "$AUTH" -H "$ORIGIN")
assert "GET /capa?capaType filter" "true" "$(echo "$FILTER_RESULT" | jq -r '.success')"

echo ""

# ─────────────────────────────────────────────
echo "10. LEGAL MODULE"
echo "─────────────────────────────────────────"

# 10a. POST - Create
echo "  Creating legal obligation..."
QLEG_RESULT=$(curl -s -X POST "$GW/api/quality/legal" -H "$AUTH" -H "$ORIGIN" -H "Content-Type: application/json" -d '{
  "title":"ISO 9001:2015 - Quality Management Systems",
  "obligationType":"CERTIFICATION_REQUIREMENT",
  "description":"Requirements for quality management system certification maintained through annual surveillance audits",
  "responsiblePerson":"Quality Director",
  "reviewFrequency":"ANNUALLY",
  "complianceStatus":"COMPLIANT"
}')
QLEG_SUCCESS=$(echo "$QLEG_RESULT" | jq -r '.success')
QLEG_ID=$(echo "$QLEG_RESULT" | jq -r '.data.id')
assert "POST /legal - success" "true" "$QLEG_SUCCESS"
assert_contains "POST /legal - has ref number" "QMS-LEG-" "$(echo "$QLEG_RESULT" | jq -r '.data.referenceNumber')"

# 10b. GET - List
LIST_RESULT=$(curl -s "$GW/api/quality/legal" -H "$AUTH" -H "$ORIGIN")
assert "GET /legal - success" "true" "$(echo "$LIST_RESULT" | jq -r '.success')"

# 10c. PUT - Update
PUT_RESULT=$(curl -s -X PUT "$GW/api/quality/legal/$QLEG_ID" -H "$AUTH" -H "$ORIGIN" -H "Content-Type: application/json" -d '{"complianceStatus":"UNDER_REVIEW"}')
assert "PUT /legal/:id - compliance updated" "UNDER_REVIEW" "$(echo "$PUT_RESULT" | jq -r '.data.complianceStatus')"

echo ""

# ─────────────────────────────────────────────
echo "11. FMEA MODULE"
echo "─────────────────────────────────────────"

# 11a. POST - Create FMEA
echo "  Creating FMEA..."
FMEA_RESULT=$(curl -s -X POST "$GW/api/quality/fmea" -H "$AUTH" -H "$ORIGIN" -H "Content-Type: application/json" -d '{
  "fmeaType":"PFMEA",
  "title":"CNC Machining Process FMEA",
  "productProcess":"CNC Turning - Shaft Components",
  "teamMembers":"Production Manager, Quality Engineer, CNC Supervisor",
  "scopeDescription":"All CNC turning operations for shaft-type components"
}')
FMEA_SUCCESS=$(echo "$FMEA_RESULT" | jq -r '.success')
FMEA_ID=$(echo "$FMEA_RESULT" | jq -r '.data.id')
assert "POST /fmea - success" "true" "$FMEA_SUCCESS"
assert_contains "POST /fmea - has ref number" "QMS-FMEA-" "$(echo "$FMEA_RESULT" | jq -r '.data.referenceNumber')"
assert "POST /fmea - default status DRAFT" "DRAFT" "$(echo "$FMEA_RESULT" | jq -r '.data.status')"

# 11b. POST - Create FMEA row (auto RPN)
echo "  Adding FMEA row..."
ROW_RESULT=$(curl -s -X POST "$GW/api/quality/fmea/$FMEA_ID/rows" -H "$AUTH" -H "$ORIGIN" -H "Content-Type: application/json" -d '{
  "itemProcessStep":"Rough Turning",
  "failureMode":"Surface finish out of tolerance",
  "effectOfFailure":"Customer reject, rework required",
  "severity":8,
  "potentialCauses":"Worn cutting tool, incorrect feed rate",
  "currentPreventionControls":"Tool life monitoring, setup sheet",
  "occurrence":5,
  "currentDetectionControls":"In-process surface roughness check",
  "detection":4,
  "recommendedActions":"Implement automated tool wear detection"
}')
ROW_SUCCESS=$(echo "$ROW_RESULT" | jq -r '.success')
ROW_ID=$(echo "$ROW_RESULT" | jq -r '.data.id')
ROW_RPN=$(echo "$ROW_RESULT" | jq -r '.data.rpn')
ROW_PRIORITY=$(echo "$ROW_RESULT" | jq -r '.data.actionPriority')
assert "POST /fmea/:id/rows - success" "true" "$ROW_SUCCESS"
assert "POST /fmea/:id/rows - RPN auto-calculated (8*5*4=160)" "160" "$ROW_RPN"
assert "POST /fmea/:id/rows - actionPriority MEDIUM (80-200)" "MEDIUM" "$ROW_PRIORITY"

# 11c. PUT - Update FMEA row with revised scores
echo "  Updating FMEA row with revised scores..."
ROW_PUT=$(curl -s -X PUT "$GW/api/quality/fmea/$FMEA_ID/rows/$ROW_ID" -H "$AUTH" -H "$ORIGIN" -H "Content-Type: application/json" -d '{"revisedSeverity":8,"revisedOccurrence":2,"revisedDetection":3,"actionsTaken":"Automated tool wear sensor installed and validated","status":"COMPLETED"}')
assert "PUT /fmea/:id/rows/:rowId - success" "true" "$(echo "$ROW_PUT" | jq -r '.success')"
assert "PUT /fmea row - revisedRpn calculated (8*2*3=48)" "48" "$(echo "$ROW_PUT" | jq -r '.data.revisedRpn')"

# 11d. GET - Single FMEA with rows
GET_RESULT=$(curl -s "$GW/api/quality/fmea/$FMEA_ID" -H "$AUTH" -H "$ORIGIN")
assert "GET /fmea/:id - success" "true" "$(echo "$GET_RESULT" | jq -r '.success')"
assert "GET /fmea/:id - includes rows" "true" "$(echo "$GET_RESULT" | jq -r '(.data.rows | length) > 0')"

echo ""

# ─────────────────────────────────────────────
echo "12. IMPROVEMENTS MODULE"
echo "─────────────────────────────────────────"

# 12a. POST - Create improvement
echo "  Creating improvement..."
IMP_RESULT=$(curl -s -X POST "$GW/api/quality/improvements" -H "$AUTH" -H "$ORIGIN" -H "Content-Type: application/json" -d '{
  "title":"Implement automated tool wear monitoring on CNC line",
  "category":"PROCESS_IMPROVEMENT",
  "source":"DATA_ANALYSIS",
  "submittedBy":"Production Manager",
  "department":"Production",
  "description":"Analysis of NC data shows 40% of surface finish NCs are caused by tool wear beyond limits",
  "currentState":"Manual tool life counting with periodic checks",
  "proposedSolution":"Install vibration-based tool wear sensors with automated machine stop",
  "expectedBenefits":"60% reduction in tool-related NCs, 15% reduction in scrap cost",
  "estimatedCost":45000,
  "qualityImpact":"HIGH",
  "customerImpact":"MEDIUM",
  "processImpact":"HIGH"
}')
IMP_SUCCESS=$(echo "$IMP_RESULT" | jq -r '.success')
IMP_ID=$(echo "$IMP_RESULT" | jq -r '.data.id')
IMP_PRIORITY=$(echo "$IMP_RESULT" | jq -r '.data.priorityScore')
assert "POST /improvements - success" "true" "$IMP_SUCCESS"
assert_contains "POST /improvements - has ref number" "QMS-CI-" "$(echo "$IMP_RESULT" | jq -r '.data.referenceNumber')"
assert "POST /improvements - priorityScore auto-calculated (3+2+3=8)" "8" "$IMP_PRIORITY"
assert "POST /improvements - default status IDEA_SUBMITTED" "IDEA_SUBMITTED" "$(echo "$IMP_RESULT" | jq -r '.data.status')"

# 12b. GET - List
LIST_RESULT=$(curl -s "$GW/api/quality/improvements" -H "$AUTH" -H "$ORIGIN")
assert "GET /improvements - success" "true" "$(echo "$LIST_RESULT" | jq -r '.success')"

# 12c. PUT - Update status
PUT_RESULT=$(curl -s -X PUT "$GW/api/quality/improvements/$IMP_ID" -H "$AUTH" -H "$ORIGIN" -H "Content-Type: application/json" -d '{"status":"APPROVED","approvedBy":"Operations Director"}')
assert "PUT /improvements/:id - status APPROVED" "APPROVED" "$(echo "$PUT_RESULT" | jq -r '.data.status')"

echo ""

# ─────────────────────────────────────────────
echo "13. SUPPLIERS MODULE"
echo "─────────────────────────────────────────"

# 13a. POST - Create supplier
echo "  Creating supplier..."
SUP_RESULT=$(curl -s -X POST "$GW/api/quality/suppliers" -H "$AUTH" -H "$ORIGIN" -H "Content-Type: application/json" -d '{
  "supplierName":"Precision Castings Ltd",
  "category":"MATERIALS",
  "countryOfOrigin":"UK",
  "primaryContact":"Jane Doe",
  "contactEmail":"jane@precisioncastings.co.uk",
  "accountManager":"Buyer A",
  "iso9001Certified":"YES",
  "qualityScore":85,
  "hsAuditScore":78,
  "envAuditScore":72,
  "onTimeDeliveryPct":96.5,
  "qualityRejectPct":0.8
}')
SUP_SUCCESS=$(echo "$SUP_RESULT" | jq -r '.success')
SUP_ID=$(echo "$SUP_RESULT" | jq -r '.data.id')
SUP_IMS=$(echo "$SUP_RESULT" | jq -r '.data.overallImsScore')
SUP_RATING=$(echo "$SUP_RESULT" | jq -r '.data.overallRating')
assert "POST /suppliers - success" "true" "$SUP_SUCCESS"
assert_contains "POST /suppliers - has ref number" "QMS-SUP-" "$(echo "$SUP_RESULT" | jq -r '.data.referenceNumber')"
assert "POST /suppliers - IMS score auto-calculated (85*.5+78*.3+72*.2=80)" "80" "$SUP_IMS"
assert "POST /suppliers - overallRating APPROVED (75-89)" "APPROVED" "$SUP_RATING"

# 13b. GET - List
LIST_RESULT=$(curl -s "$GW/api/quality/suppliers" -H "$AUTH" -H "$ORIGIN")
assert "GET /suppliers - success" "true" "$(echo "$LIST_RESULT" | jq -r '.success')"

# 13c. PUT - Update scores
PUT_RESULT=$(curl -s -X PUT "$GW/api/quality/suppliers/$SUP_ID" -H "$AUTH" -H "$ORIGIN" -H "Content-Type: application/json" -d '{"qualityScore":92,"hsAuditScore":88,"envAuditScore":82}')
assert "PUT /suppliers/:id - IMS recalculated" "true" "$(echo "$PUT_RESULT" | jq -r '.data.overallImsScore > 80')"

echo ""

# ─────────────────────────────────────────────
echo "14. CHANGES MODULE"
echo "─────────────────────────────────────────"

# 14a. POST - Create change
echo "  Creating change request..."
CHG_RESULT=$(curl -s -X POST "$GW/api/quality/changes" -H "$AUTH" -H "$ORIGIN" -H "Content-Type: application/json" -d '{
  "title":"Update CNC Work Instruction WI-PRD-012",
  "changeType":"DOCUMENT_UPDATE",
  "priority":"URGENT",
  "requestedBy":"Quality Engineer",
  "department":"Production Engineering",
  "currentState":"Work instruction WI-PRD-012 Rev C does not include mandatory tool counter reset step",
  "proposedChange":"Add step 4.7: Verify and reset tool life counter after every tool change. Add mandatory sign-off field.",
  "reasonForChange":"Root cause of CAPA QMS-CAPA-2026-001 identified missing procedure step",
  "qualityImpact":"HIGH",
  "customerImpact":"MEDIUM"
}')
CHG_SUCCESS=$(echo "$CHG_RESULT" | jq -r '.success')
CHG_ID=$(echo "$CHG_RESULT" | jq -r '.data.id')
assert "POST /changes - success" "true" "$CHG_SUCCESS"
assert_contains "POST /changes - has ref number" "QMS-CHG-" "$(echo "$CHG_RESULT" | jq -r '.data.referenceNumber')"
assert "POST /changes - default status REQUESTED" "REQUESTED" "$(echo "$CHG_RESULT" | jq -r '.data.status')"

# 14b. GET - List
LIST_RESULT=$(curl -s "$GW/api/quality/changes" -H "$AUTH" -H "$ORIGIN")
assert "GET /changes - success" "true" "$(echo "$LIST_RESULT" | jq -r '.success')"

# 14c. PUT - Approve and implement
PUT_RESULT=$(curl -s -X PUT "$GW/api/quality/changes/$CHG_ID" -H "$AUTH" -H "$ORIGIN" -H "Content-Type: application/json" -d '{"status":"APPROVED","approvedBy":"Quality Director"}')
assert "PUT /changes/:id - status APPROVED" "APPROVED" "$(echo "$PUT_RESULT" | jq -r '.data.status')"

echo ""

# ─────────────────────────────────────────────
echo "15. OBJECTIVES MODULE"
echo "─────────────────────────────────────────"

# 15a. POST - Create objective
echo "  Creating quality objective..."
QOBJ_RESULT=$(curl -s -X POST "$GW/api/quality/objectives" -H "$AUTH" -H "$ORIGIN" -H "Content-Type: application/json" -d '{
  "title":"Reduce customer complaints by 50% by end of 2026",
  "objectiveStatement":"Achieve a 50% reduction in valid customer complaints against 2025 baseline of 24 complaints",
  "category":"CUSTOMER_SATISFACTION",
  "kpiDescription":"Number of valid customer complaints per quarter",
  "baselineValue":6,
  "targetValue":3,
  "currentValue":5,
  "unit":"complaints/quarter",
  "owner":"Quality Director",
  "department":"Quality",
  "targetDate":"2026-12-31"
}')
QOBJ_SUCCESS=$(echo "$QOBJ_RESULT" | jq -r '.success')
QOBJ_ID=$(echo "$QOBJ_RESULT" | jq -r '.data.id')
QOBJ_REF=$(echo "$QOBJ_RESULT" | jq -r '.data.referenceNumber')
assert "POST /objectives - success" "true" "$QOBJ_SUCCESS"
assert_contains "POST /objectives - has ref number" "QMS-OBJ-" "$QOBJ_REF"
assert "POST /objectives - default status NOT_STARTED" "NOT_STARTED" "$(echo "$QOBJ_RESULT" | jq -r '.data.status')"

# 15b. POST - Add milestone
echo "  Adding milestone..."
MS_RESULT=$(curl -s -X POST "$GW/api/quality/objectives/$QOBJ_ID/milestones" -H "$AUTH" -H "$ORIGIN" -H "Content-Type: application/json" -d '{"title":"Complete complaint root cause analysis workshop","targetDate":"2026-03-31"}')
MS_SUCCESS=$(echo "$MS_RESULT" | jq -r '.success')
MS_ID=$(echo "$MS_RESULT" | jq -r '.data.id')
assert "POST /objectives/:id/milestones - success" "true" "$MS_SUCCESS"
assert "POST /milestones - default status PENDING" "PENDING" "$(echo "$MS_RESULT" | jq -r '.data.status')"

# 15c. PUT - Complete milestone
MS_PUT=$(curl -s -X PUT "$GW/api/quality/objectives/$QOBJ_ID/milestones/$MS_ID" -H "$AUTH" -H "$ORIGIN" -H "Content-Type: application/json" -d '{"status":"COMPLETED"}')
assert "PUT /milestones - completedDate auto-set" "true" "$(echo "$MS_PUT" | jq -r '.data.completedDate != null')"

# 15d. GET - List with milestones
LIST_RESULT=$(curl -s "$GW/api/quality/objectives" -H "$AUTH" -H "$ORIGIN")
assert "GET /objectives - success" "true" "$(echo "$LIST_RESULT" | jq -r '.success')"

# 15e. PUT - Update status
PUT_RESULT=$(curl -s -X PUT "$GW/api/quality/objectives/$QOBJ_ID" -H "$AUTH" -H "$ORIGIN" -H "Content-Type: application/json" -d '{"status":"ON_TRACK","progressPercent":25}')
assert "PUT /objectives/:id - status ON_TRACK" "ON_TRACK" "$(echo "$PUT_RESULT" | jq -r '.data.status')"

echo ""

# ─────────────────────────────────────────────
echo "16. GATEWAY PROXY"
echo "─────────────────────────────────────────"

echo "  Testing all routes through gateway..."
for ROUTE in parties issues risks opportunities processes nonconformances actions documents capa legal fmea improvements suppliers changes objectives; do
  RESULT=$(curl -s "$GW/api/quality/$ROUTE" -H "$AUTH" -H "$ORIGIN")
  assert "Gateway /api/quality/$ROUTE" "true" "$(echo "$RESULT" | jq -r '.success')"
done

echo ""

# ─────────────────────────────────────────────
echo "17. DELETE OPERATIONS"
echo "─────────────────────────────────────────"

# Delete test records (cleanup - reverse dependency order)
DEL_CHG=$(curl -s -X DELETE "$GW/api/quality/changes/$CHG_ID" -H "$AUTH" -H "$ORIGIN")
assert "DELETE /changes/:id" "true" "$(echo "$DEL_CHG" | jq -r '.success')"

DEL_QOBJ=$(curl -s -X DELETE "$GW/api/quality/objectives/$QOBJ_ID" -H "$AUTH" -H "$ORIGIN")
assert "DELETE /objectives/:id (cascade milestones)" "true" "$(echo "$DEL_QOBJ" | jq -r '.success')"

DEL_SUP=$(curl -s -X DELETE "$GW/api/quality/suppliers/$SUP_ID" -H "$AUTH" -H "$ORIGIN")
assert "DELETE /suppliers/:id" "true" "$(echo "$DEL_SUP" | jq -r '.success')"

DEL_IMP=$(curl -s -X DELETE "$GW/api/quality/improvements/$IMP_ID" -H "$AUTH" -H "$ORIGIN")
assert "DELETE /improvements/:id" "true" "$(echo "$DEL_IMP" | jq -r '.success')"

DEL_FMEA=$(curl -s -X DELETE "$GW/api/quality/fmea/$FMEA_ID" -H "$AUTH" -H "$ORIGIN")
assert "DELETE /fmea/:id (cascade rows)" "true" "$(echo "$DEL_FMEA" | jq -r '.success')"

DEL_QLEG=$(curl -s -X DELETE "$GW/api/quality/legal/$QLEG_ID" -H "$AUTH" -H "$ORIGIN")
assert "DELETE /legal/:id" "true" "$(echo "$DEL_QLEG" | jq -r '.success')"

DEL_CAPA=$(curl -s -X DELETE "$GW/api/quality/capa/$CAPA_ID" -H "$AUTH" -H "$ORIGIN")
assert "DELETE /capa/:id (cascade actions)" "true" "$(echo "$DEL_CAPA" | jq -r '.success')"

DEL_DOC=$(curl -s -X DELETE "$GW/api/quality/documents/$DOC_ID" -H "$AUTH" -H "$ORIGIN")
assert "DELETE /documents/:id" "true" "$(echo "$DEL_DOC" | jq -r '.success')"

DEL_QACT=$(curl -s -X DELETE "$GW/api/quality/actions/$QACT_ID" -H "$AUTH" -H "$ORIGIN")
assert "DELETE /actions/:id" "true" "$(echo "$DEL_QACT" | jq -r '.success')"

DEL_NC=$(curl -s -X DELETE "$GW/api/quality/nonconformances/$NC_ID" -H "$AUTH" -H "$ORIGIN")
assert "DELETE /nonconformances/:id" "true" "$(echo "$DEL_NC" | jq -r '.success')"

DEL_PRO=$(curl -s -X DELETE "$GW/api/quality/processes/$PRO_ID" -H "$AUTH" -H "$ORIGIN")
assert "DELETE /processes/:id" "true" "$(echo "$DEL_PRO" | jq -r '.success')"

DEL_OPP=$(curl -s -X DELETE "$GW/api/quality/opportunities/$OPP_ID" -H "$AUTH" -H "$ORIGIN")
assert "DELETE /opportunities/:id" "true" "$(echo "$DEL_OPP" | jq -r '.success')"

DEL_RSK=$(curl -s -X DELETE "$GW/api/quality/risks/$RSK_ID" -H "$AUTH" -H "$ORIGIN")
assert "DELETE /risks/:id" "true" "$(echo "$DEL_RSK" | jq -r '.success')"

DEL_ISS=$(curl -s -X DELETE "$GW/api/quality/issues/$ISS_ID" -H "$AUTH" -H "$ORIGIN")
assert "DELETE /issues/:id" "true" "$(echo "$DEL_ISS" | jq -r '.success')"

DEL_PTY=$(curl -s -X DELETE "$GW/api/quality/parties/$PTY_ID" -H "$AUTH" -H "$ORIGIN")
assert "DELETE /parties/:id" "true" "$(echo "$DEL_PTY" | jq -r '.success')"

# Verify deletes
VERIFY_404=$(curl -s "$GW/api/quality/parties/$PTY_ID" -H "$AUTH" -H "$ORIGIN")
assert "Deleted party returns 404" "NOT_FOUND" "$(echo "$VERIFY_404" | jq -r '.error.code')"

echo ""
echo "============================================"
echo "  RESULTS: $PASS passed, $FAIL failed (out of $TOTAL)"
echo "============================================"

if [ $FAIL -gt 0 ]; then
  exit 1
fi
