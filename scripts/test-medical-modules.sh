#!/bin/bash
# Comprehensive test script for Medical Device modules (ISO 13485)
# Tests: CAPA, Complaints, Design Controls, Device Records, Risk, Suppliers — CRUD + Gateway

API="http://localhost:4011"
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
echo "  Medical Device Modules - Comprehensive Test Suite (ISO 13485)"
echo "============================================"
echo ""

# -------------------------------------------------
echo "1. HEALTH CHECK"
echo "-------------------------------------------------"

HEALTH=$(curl -s "$API/health")
assert "GET /health - success" "true" "$(echo "$HEALTH" | jq -r '.success')"
assert_contains "GET /health - service name" "api-medical" "$(echo "$HEALTH" | jq -r '.service')"

echo ""

# -------------------------------------------------
echo "2. CAPA MODULE (ISO 13485 Clause 8.5.2/8.5.3)"
echo "-------------------------------------------------"

echo "  Creating medical CAPA..."
CAPA_RESULT=$(curl -s -X POST "$API/api/capa" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "title": "Software validation gap in infusion pump controller",
  "capaType": "CORRECTIVE",
  "source": "AUDIT",
  "sourceRef": "AUDIT-2026-001",
  "description": "Internal audit identified that software validation testing did not cover all failure modes identified in risk management file. Annex C of IEC 62304 requirements not fully addressed.",
  "deviceName": "Infusion Pump IP-3000",
  "deviceId": "IP-3000-SW-V2.1",
  "severity": "MAJOR"
}')
CAPA_SUCCESS=$(echo "$CAPA_RESULT" | jq -r '.success')
CAPA_ID=$(echo "$CAPA_RESULT" | jq -r '.data.id')
CAPA_REF=$(echo "$CAPA_RESULT" | jq -r '.data.refNumber')
assert "POST /capa - success" "true" "$CAPA_SUCCESS"
assert_contains "POST /capa - has ref number" "CAPA-" "$CAPA_REF"
assert "POST /capa - initial status OPEN" "OPEN" "$(echo "$CAPA_RESULT" | jq -r '.data.status')"
assert "POST /capa - severity is MAJOR" "MAJOR" "$(echo "$CAPA_RESULT" | jq -r '.data.severity')"

echo "  Getting CAPA stats..."
CAPA_STATS=$(curl -s "$API/api/capa/stats" -H "$AUTH")
assert "GET /capa/stats - success" "true" "$(echo "$CAPA_STATS" | jq -r '.success')"

echo "  Listing CAPAs..."
CAPA_LIST=$(curl -s "$API/api/capa" -H "$AUTH")
assert "GET /capa - success" "true" "$(echo "$CAPA_LIST" | jq -r '.success')"
assert "GET /capa - has records" "true" "$(echo "$CAPA_LIST" | jq -r '(.data | length) > 0')"

echo "  Getting single CAPA..."
CAPA_GET=$(curl -s "$API/api/capa/$CAPA_ID" -H "$AUTH")
assert "GET /capa/:id - success" "true" "$(echo "$CAPA_GET" | jq -r '.success')"
assert "GET /capa/:id - correct title" "Software validation gap in infusion pump controller" "$(echo "$CAPA_GET" | jq -r '.data.title')"

echo "  Updating CAPA to investigation stage..."
CAPA_PUT=$(curl -s -X PUT "$API/api/capa/$CAPA_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "status": "INVESTIGATION",
  "rootCause": "Inadequate software test protocol scope definition",
  "rootCauseMethod": "5-Why Analysis",
  "containmentAction": "Add IEC 62304 Annex C review to all active software validation protocols",
  "containmentDate": "2026-03-01"
}')
assert "PUT /capa/:id - success" "true" "$(echo "$CAPA_PUT" | jq -r '.success')"
assert "PUT /capa/:id - status updated" "INVESTIGATION" "$(echo "$CAPA_PUT" | jq -r '.data.status')"

echo "  Filtering CAPAs by source..."
CAPA_FILTER=$(curl -s "$API/api/capa?source=AUDIT" -H "$AUTH")
assert "GET /capa?source filter - success" "true" "$(echo "$CAPA_FILTER" | jq -r '.success')"

echo "  Testing CAPA 404..."
CAPA_404=$(curl -s "$API/api/capa/00000000-0000-0000-0000-000000000999" -H "$AUTH")
assert "GET /capa/:id - 404" "NOT_FOUND" "$(echo "$CAPA_404" | jq -r '.error.code')"

echo ""

# -------------------------------------------------
echo "3. COMPLAINTS MODULE (Post-Market Surveillance)"
echo "-------------------------------------------------"

echo "  Creating device complaint..."
COMP_RESULT=$(curl -s -X POST "$API/api/complaints" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "deviceName": "Infusion Pump IP-3000",
  "deviceId": "IP-3000-SN-AB12345",
  "lotNumber": "LOT-2026-001",
  "serialNumber": "SN-AB12345",
  "complaintDate": "2026-02-20",
  "source": "HOSPITAL",
  "reporterName": "Dr. Sarah Jones",
  "reporterContact": "sjones@cityhosp.nhs.uk",
  "description": "Infusion pump displayed incorrect flow rate alarm. Patient received approximately 10% more medication than prescribed before alarm triggered. No patient harm reported.",
  "patientInvolved": true,
  "injuryOccurred": false,
  "deathOccurred": false,
  "malfunctionOccurred": true,
  "severity": "SERIOUS"
}')
COMP_SUCCESS=$(echo "$COMP_RESULT" | jq -r '.success')
COMP_ID=$(echo "$COMP_RESULT" | jq -r '.data.id')
COMP_REF=$(echo "$COMP_RESULT" | jq -r '.data.refNumber')
assert "POST /complaints - success" "true" "$COMP_SUCCESS"
assert_contains "POST /complaints - has ref number" "COMP-" "$COMP_REF"
assert "POST /complaints - patient involved flag" "true" "$(echo "$COMP_RESULT" | jq -r '.data.patientInvolved')"

echo "  Listing complaints..."
COMP_LIST=$(curl -s "$API/api/complaints" -H "$AUTH")
assert "GET /complaints - success" "true" "$(echo "$COMP_LIST" | jq -r '.success')"
assert "GET /complaints - has records" "true" "$(echo "$COMP_LIST" | jq -r '(.data | length) > 0')"

echo "  Getting single complaint..."
COMP_GET=$(curl -s "$API/api/complaints/$COMP_ID" -H "$AUTH")
assert "GET /complaints/:id - success" "true" "$(echo "$COMP_GET" | jq -r '.success')"

echo "  Getting trending complaints..."
COMP_TREND=$(curl -s "$API/api/complaints/trending" -H "$AUTH")
assert "GET /complaints/trending - success" "true" "$(echo "$COMP_TREND" | jq -r '.success')"

echo "  Getting MDR pending list..."
MDR_PENDING=$(curl -s "$API/api/complaints/mdr-pending" -H "$AUTH")
assert "GET /complaints/mdr-pending - success" "true" "$(echo "$MDR_PENDING" | jq -r '.success')"

echo "  Updating complaint..."
COMP_PUT=$(curl -s -X PUT "$API/api/complaints/$COMP_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{"status":"UNDER_INVESTIGATION","assignedTo":"Quality Engineer","investigationNotes":"Software alarm threshold review initiated"}')
assert "PUT /complaints/:id - success" "true" "$(echo "$COMP_PUT" | jq -r '.success')"

echo "  Filtering complaints by severity..."
COMP_FILTER=$(curl -s "$API/api/complaints?severity=SERIOUS" -H "$AUTH")
assert "GET /complaints?severity filter - success" "true" "$(echo "$COMP_FILTER" | jq -r '.success')"

echo ""

# -------------------------------------------------
echo "4. DESIGN CONTROLS MODULE (ISO 13485 Clause 7.3)"
echo "-------------------------------------------------"

echo "  Creating design project..."
DC_RESULT=$(curl -s -X POST "$API/api/design-controls" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "title": "Next Generation Infusion Pump IP-4000 Design Project",
  "deviceName": "Infusion Pump IP-4000",
  "deviceClass": "CLASS_II",
  "intendedUse": "Continuous or intermittent administration of fluids, drugs, blood products to patients in hospital and home care settings",
  "patientPopulation": "Adult and paediatric hospital and home care patients",
  "regulatoryPathway": "510(k) / CE Mark MDR 2017/745",
  "projectLead": "Dr. Emily Chen",
  "teamMembers": ["John Smith", "Alice Brown", "Bob Chen"],
  "startDate": "2026-01-15",
  "targetDate": "2027-06-30",
  "status": "ACTIVE"
}')
DC_SUCCESS=$(echo "$DC_RESULT" | jq -r '.success')
DC_ID=$(echo "$DC_RESULT" | jq -r '.data.id')
DC_REF=$(echo "$DC_RESULT" | jq -r '.data.refNumber')
assert "POST /design-controls - success" "true" "$DC_SUCCESS"
assert_contains "POST /design-controls - has ref number" "DCP-" "$DC_REF"
assert "POST /design-controls - device class set" "CLASS_II" "$(echo "$DC_RESULT" | jq -r '.data.deviceClass')"
assert "POST /design-controls - initial stage PLANNING" "PLANNING" "$(echo "$DC_RESULT" | jq -r '.data.currentStage')"

echo "  Listing design projects..."
DC_LIST=$(curl -s "$API/api/design-controls" -H "$AUTH")
assert "GET /design-controls - success" "true" "$(echo "$DC_LIST" | jq -r '.success')"
assert "GET /design-controls - has records" "true" "$(echo "$DC_LIST" | jq -r '(.data | length) > 0')"

echo "  Getting single design project..."
DC_GET=$(curl -s "$API/api/design-controls/$DC_ID" -H "$AUTH")
assert "GET /design-controls/:id - success" "true" "$(echo "$DC_GET" | jq -r '.success')"

echo "  Adding design input..."
INPUT_RESULT=$(curl -s -X POST "$API/api/design-controls/$DC_ID/inputs" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "title": "Flow rate accuracy requirement",
  "description": "The device shall deliver medication at the prescribed flow rate within +/- 5% accuracy under normal use conditions",
  "category": "PERFORMANCE",
  "source": "Clinical requirement, IEC 60601-2-24",
  "priority": "CRITICAL",
  "acceptanceCriteria": "Flow rate within +/- 5% of set rate across full range of 0.1-500 ml/hr"
}')
assert "POST /design-controls/:id/inputs - success" "true" "$(echo "$INPUT_RESULT" | jq -r '.success')"

echo "  Getting traceability matrix..."
TRACE_RESULT=$(curl -s "$API/api/design-controls/$DC_ID/traceability-matrix" -H "$AUTH")
assert "GET /design-controls/:id/traceability-matrix - success" "true" "$(echo "$TRACE_RESULT" | jq -r '.success')"

echo "  Filtering design controls by device class..."
DC_FILTER=$(curl -s "$API/api/design-controls?deviceClass=CLASS_II" -H "$AUTH")
assert "GET /design-controls?deviceClass filter - success" "true" "$(echo "$DC_FILTER" | jq -r '.success')"

echo ""

# -------------------------------------------------
echo "5. DEVICE RECORDS MODULE (DMR/DHR)"
echo "-------------------------------------------------"

echo "  Creating device history record..."
DR_RESULT=$(curl -s -X POST "$API/api/device-records" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "deviceName": "Infusion Pump IP-3000",
  "deviceModel": "IP-3000-V2",
  "serialNumber": "SN-20260223-001",
  "lotNumber": "LOT-2026-023",
  "status": "RELEASED",
  "deviceClass": "CLASS_II",
  "manufactureDate": "2026-02-20",
  "releaseDate": "2026-02-22",
  "owner": "Quality Release Manager"
}')
DR_SUCCESS=$(echo "$DR_RESULT" | jq -r '.success')
DR_ID=$(echo "$DR_RESULT" | jq -r '.data.id')
assert "POST /device-records - success" "true" "$DR_SUCCESS"
assert_contains "POST /device-records - has DHR number" "DHR-" "$(echo "$DR_RESULT" | jq -r '.data.dhrNumber')"
assert "POST /device-records - device name set" "Infusion Pump IP-3000" "$(echo "$DR_RESULT" | jq -r '.data.deviceName')"

echo "  Listing device records..."
DR_LIST=$(curl -s "$API/api/device-records" -H "$AUTH")
assert "GET /device-records - success" "true" "$(echo "$DR_LIST" | jq -r '.success')"
assert "GET /device-records - has records" "true" "$(echo "$DR_LIST" | jq -r '(.data | length) > 0')"

echo "  Getting single device record..."
DR_GET=$(curl -s "$API/api/device-records/$DR_ID" -H "$AUTH")
assert "GET /device-records/:id - success" "true" "$(echo "$DR_GET" | jq -r '.success')"

echo "  Updating device record..."
DR_PUT=$(curl -s -X PUT "$API/api/device-records/$DR_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{"status":"IN_FIELD","notes":"Deployed at City Hospital, Ward 4B"}')
assert "PUT /device-records/:id - success" "true" "$(echo "$DR_PUT" | jq -r '.success')"

echo ""

# -------------------------------------------------
echo "6. RISK MANAGEMENT MODULE (ISO 14971)"
echo "-------------------------------------------------"

echo "  Creating risk management file..."
RISK_RESULT=$(curl -s -X POST "$API/api/risk" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "title": "Risk Management File - Infusion Pump IP-4000",
  "deviceName": "Infusion Pump IP-4000",
  "deviceClass": "CLASS_II",
  "intendedUse": "Continuous or intermittent administration of fluids and drugs in hospital settings",
  "riskPolicy": "Risks shall be reduced as low as reasonably practicable (ALARP). Residual risk acceptable if benefit outweighs risk per ISO 14971."
}')
RISK_SUCCESS=$(echo "$RISK_RESULT" | jq -r '.success')
RISK_ID=$(echo "$RISK_RESULT" | jq -r '.data.id')
RISK_REF=$(echo "$RISK_RESULT" | jq -r '.data.refNumber')
assert "POST /risk - success" "true" "$RISK_SUCCESS"
assert_contains "POST /risk - has ref number" "RMF-" "$RISK_REF"
assert "POST /risk - status DRAFT" "DRAFT" "$(echo "$RISK_RESULT" | jq -r '.data.status')"

echo "  Listing risk management files..."
RISK_LIST=$(curl -s "$API/api/risk" -H "$AUTH")
assert "GET /risk - success" "true" "$(echo "$RISK_LIST" | jq -r '.success')"
assert "GET /risk - has records" "true" "$(echo "$RISK_LIST" | jq -r '(.data | length) > 0')"

echo "  Getting single risk file..."
RISK_GET=$(curl -s "$API/api/risk/$RISK_ID" -H "$AUTH")
assert "GET /risk/:id - success" "true" "$(echo "$RISK_GET" | jq -r '.success')"

echo "  Adding hazard to risk file..."
HAZ_RESULT=$(curl -s -X POST "$API/api/risk/$RISK_ID/hazards" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "hazardTitle": "Incorrect dose delivery due to software error",
  "hazardDescription": "Software error causes incorrect flow rate calculation resulting in over or under infusion",
  "hazardCategory": "SOFTWARE",
  "foreseenHazardousSituation": "Patient receives incorrect medication dose",
  "harm": "Patient injury from over-infusion (toxicity) or under-infusion (therapeutic failure)",
  "probabilityBefore": 3,
  "severityBefore": 5,
  "riskControls": "Software verification and validation, alarm system, dose limits"
}')
assert "POST /risk/:id/hazards - success" "true" "$(echo "$HAZ_RESULT" | jq -r '.success')"

echo "  Getting risk residual assessment..."
RISK_RESID=$(curl -s "$API/api/risk/$RISK_ID/residual" -H "$AUTH")
assert "GET /risk/:id/residual - success" "true" "$(echo "$RISK_RESID" | jq -r '.success')"

echo "  Filtering by device class..."
RISK_FILTER=$(curl -s "$API/api/risk?deviceClass=CLASS_II" -H "$AUTH")
assert "GET /risk?deviceClass filter - success" "true" "$(echo "$RISK_FILTER" | jq -r '.success')"

echo ""

# -------------------------------------------------
echo "7. MEDICAL SUPPLIERS MODULE"
echo "-------------------------------------------------"

echo "  Creating medical supplier..."
MSUP_RESULT=$(curl -s -X POST "$API/api/suppliers" -H "$AUTH" -H "Content-Type: application/json" -d '{
  "name": "MedComp Electronics Ltd",
  "classification": "CRITICAL",
  "products": "PCB assemblies, display modules for medical devices",
  "iso13485Certified": true,
  "riskLevel": "HIGH",
  "nextAuditDate": "2026-09-30"
}')
MSUP_SUCCESS=$(echo "$MSUP_RESULT" | jq -r '.success')
MSUP_ID=$(echo "$MSUP_RESULT" | jq -r '.data.id')
assert "POST /suppliers - success" "true" "$MSUP_SUCCESS"
assert "POST /suppliers - classification CRITICAL" "CRITICAL" "$(echo "$MSUP_RESULT" | jq -r '.data.classification')"
assert "POST /suppliers - initial status PENDING" "PENDING" "$(echo "$MSUP_RESULT" | jq -r '.data.qualificationStatus')"

echo "  Listing medical suppliers..."
MSUP_LIST=$(curl -s "$API/api/suppliers" -H "$AUTH")
assert "GET /suppliers - success" "true" "$(echo "$MSUP_LIST" | jq -r '.success')"
assert "GET /suppliers - has records" "true" "$(echo "$MSUP_LIST" | jq -r '(.data | length) > 0')"

echo "  Getting single supplier..."
MSUP_GET=$(curl -s "$API/api/suppliers/$MSUP_ID" -H "$AUTH")
assert "GET /suppliers/:id - success" "true" "$(echo "$MSUP_GET" | jq -r '.success')"

echo "  Updating supplier qualification status..."
MSUP_PUT=$(curl -s -X PUT "$API/api/suppliers/$MSUP_ID" -H "$AUTH" -H "Content-Type: application/json" -d '{"qualificationStatus":"QUALIFIED","lastAuditDate":"2026-02-20","notes":"Full audit passed. ISO 13485:2016 certificate verified."}')
assert "PUT /suppliers/:id - success" "true" "$(echo "$MSUP_PUT" | jq -r '.success')"
assert "PUT /suppliers/:id - status qualified" "QUALIFIED" "$(echo "$MSUP_PUT" | jq -r '.data.qualificationStatus')"

echo ""

# -------------------------------------------------
echo "8. DELETE OPERATIONS"
echo "-------------------------------------------------"

echo "  Deleting test records..."
DEL_CAPA=$(curl -s -X DELETE "$API/api/capa/$CAPA_ID" -H "$AUTH")
assert "DELETE /capa/:id" "true" "$(echo "$DEL_CAPA" | jq -r '.success')"

DEL_DC=$(curl -s -X DELETE "$API/api/design-controls/$DC_ID" -H "$AUTH")
assert "DELETE /design-controls/:id" "true" "$(echo "$DEL_DC" | jq -r '.success')"

DEL_MSUP=$(curl -s -X DELETE "$API/api/suppliers/$MSUP_ID" -H "$AUTH")
assert "DELETE /suppliers/:id" "true" "$(echo "$DEL_MSUP" | jq -r '.success')"

echo "  Verifying deletes..."
VERIFY_CAPA=$(curl -s "$API/api/capa/$CAPA_ID" -H "$AUTH")
assert "Deleted CAPA returns 404" "NOT_FOUND" "$(echo "$VERIFY_CAPA" | jq -r '.error.code')"

VERIFY_DC=$(curl -s "$API/api/design-controls/$DC_ID" -H "$AUTH")
assert "Deleted design project returns 404" "NOT_FOUND" "$(echo "$VERIFY_DC" | jq -r '.error.code')"

echo ""

# -------------------------------------------------
echo "9. GATEWAY PROXY"
echo "-------------------------------------------------"

echo "  Testing routes through gateway..."
for ROUTE in capa complaints design-controls device-records risk suppliers; do
  RESULT=$(curl -s "$GW/api/medical/$ROUTE" -H "$AUTH")
  assert "Gateway /api/medical/$ROUTE" "true" "$(echo "$RESULT" | jq -r '.success')"
done

echo ""
echo "============================================"
echo "  RESULTS: $PASS passed, $FAIL failed (out of $TOTAL)"
echo "============================================"

if [ $FAIL -gt 0 ]; then
  exit 1
fi
