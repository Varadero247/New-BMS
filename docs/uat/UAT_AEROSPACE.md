# UAT Test Plan: Aerospace Module (AS9100D / AS9110C)

**Document ID:** UAT-AERO-001
**Version:** 1.0
**Date:** 2026-02-12
**Module:** Aerospace (AS9100D Configuration Management / AS9102 FAI / AS9110C MRO / Human Factors / OASIS)
**Environment:** Staging (api-aerospace:4012 / web-aerospace:3012)
**Tester:** **\*\*\*\***\_\_\_\_**\*\*\*\***
**Sign-Off Date:** **\*\*\*\***\_\_\_\_**\*\*\*\***

---

## Configuration Management (5 scenarios)

### TC-AERO-001: Create Configuration Baseline

**Given** I am logged in as a Configuration Manager
**When** I navigate to Aerospace > Configuration Management and click "New Baseline"
**And** I fill in: Title "B737-800 Landing Gear Assembly", Program "737 Landing Gear Overhaul", Description "Production baseline for main landing gear assembly P/N 161A1100-47"
**Then** the system creates the baseline with reference "CB-XXX" and status "DRAFT"
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AERO-002: Add Configuration Items to Baseline

**Given** a configuration baseline "CB-001" in DRAFT status
**When** I add configuration items:

- Part Number "161A1100-47", Nomenclature "MLG Trunnion", Revision "C", Category "HARDWARE", Supplier "Boeing"
- Part Number "S283T002-3", Nomenclature "Actuator Assembly", Revision "B", Category "HARDWARE", Supplier "Parker Hannifin"
- Part Number "D6-51991-2", Nomenclature "MLG Maintenance Manual", Revision "12", Category "DOCUMENT"
  **Then** all three items are added with status "CURRENT"
  **And** the baseline shows item count = 3
  **Result:** [ ] Pass / [ ] Fail
  **Notes:**

### TC-AERO-003: Submit Engineering Change Proposal

**Given** a configuration baseline "CB-001" with items established
**When** I navigate to ECPs and click "New ECP"
**And** I fill in: Title "Replace actuator seal material", Description "Change from NBR to FKM seals for improved heat resistance", Reason "Service Bulletin SB-737-32-1234", Urgency "ROUTINE", Affected Items ["S283T002-3"], Proposed By "Eng. R. Thompson"
**Then** the ECP is created with reference "ECP-2602-XXXX" and status "PROPOSED"
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AERO-004: Configuration Control Board Decision

**Given** an ECP "ECP-2602-0001" in status "UNDER_REVIEW"
**When** the CCB reviews the ECP and enters: Decision "APPROVE_WITH_CONDITIONS", CCB Members ["VP Engineering", "Chief Inspector", "Program Manager"], CCB Notes "Approved pending stress analysis completion", CCB Date "2026-03-20"
**Then** the ECP status changes to "CCB_APPROVED"
**And** the conditions are recorded
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AERO-005: Configuration Audit (FCA/PCA)

**Given** a configuration baseline "CB-001" in ACTIVE status
**When** I create a configuration audit: Type "FCA" (Functional Configuration Audit), Title "MLG Assembly FCA", Audit Date "2026-04-15", Auditors ["Lead Auditor D. Brown", "Inspector K. Lee"]
**And** I record findings and mark 2 discrepancies
**Then** the audit is created with reference "FCA-2602-XXXX" and status "COMPLETED"
**And** the result is set to "PASS_WITH_FINDINGS" with discrepancies=2
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## First Article Inspection - AS9102 (5 scenarios)

### TC-AERO-006: Create Full FAI

**Given** I am on the FAI page
**When** I click "New FAI" and enter: Title "Trunnion FAI", Part Number "161A1100-47", Part Name "MLG Trunnion", Revision "C", Drawing Number "DWG-161A-47", Customer "Boeing", FAI Type "FULL"
**Then** the FAI is created with reference "FAI-2602-XXXX" and status "PLANNING"
**And** Parts 1, 2, and 3 are initialized with status "NOT_STARTED"
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AERO-007: Complete FAI Part 1 (Design Characteristics)

**Given** an FAI "FAI-2602-0001" in status "IN_PROGRESS"
**When** I populate Part 1 data with design characteristics:

- Char 1: "Bore Diameter A", Nominal 2.500", Tolerance +0.001/-0.000, Actual 2.5004", Pass
- Char 2: "Overall Length", Nominal 18.750", Tolerance +/-0.010, Actual 18.755", Pass
- Char 3: "Surface Roughness Ra", Max 32 micro-inches, Actual 24, Pass
  **Then** Part 1 status changes to "COMPLETED"
  **And** all characteristic data is stored as JSON in part1Data
  **Result:** [ ] Pass / [ ] Fail
  **Notes:**

### TC-AERO-008: Complete FAI Part 2 (Manufacturing Process)

**Given** an FAI "FAI-2602-0001" with Part 1 completed
**When** I populate Part 2 data with manufacturing documentation:

- "Process Specification", Doc Number "PS-737-001", Revision "D", Available=true
- "Heat Treat Certification", Doc Number "HTC-2602-042", Revision "A", Available=true
- "Material Certification", Doc Number "MTC-Ti64-2602-015", Revision "A", Available=true
  **Then** Part 2 status changes to "COMPLETED"
  **Result:** [ ] Pass / [ ] Fail
  **Notes:**

### TC-AERO-009: Complete FAI Part 3 (Test Results)

**Given** an FAI "FAI-2602-0001" with Parts 1 and 2 completed
**When** I populate Part 3 data with test results:

- "Hardness Test", Method "Rockwell C", Requirement "HRC 36-42", Result "HRC 39", Pass
- "NDT - Fluorescent Penetrant", Method "ASTM E1417", Requirement "No linear indications > 1/16\"", Result "No indications", Pass
  **Then** Part 3 status changes to "COMPLETED"
  **And** the overall FAI status changes to "REVIEW"
  **Result:** [ ] Pass / [ ] Fail
  **Notes:**

### TC-AERO-010: Approve FAI with E-Signature

**Given** an FAI "FAI-2602-0001" with all three parts completed and status "REVIEW"
**When** I approve the FAI with electronic signature
**Then** the FAI status changes to "APPROVED" with approvedBy, approvedDate, and esignatureId
**And** the approval is recorded in the audit trail
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## MRO Work Orders and Release (5 scenarios)

### TC-AERO-011: Create AOG Work Order

**Given** I am on the Work Orders page
**When** I click "New Work Order" and enter: Title "C-Check Card 32-10-01 MLG Inspection", Aircraft Type "Boeing 737-800", Aircraft Registration "C-FXYZ", Priority "AOG", Description "MLG lower drag brace cracked - aircraft grounded per MEL"
**Then** the work order is created with reference "WO-2602-XXXX" and status "OPEN"
**And** the AOG priority flag is highlighted
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AERO-012: Add Task Cards to Work Order

**Given** a work order "WO-2602-0001" in status "OPEN"
**When** I add task cards:

- Task "32-10-01-001", Description "Remove MLG lower drag brace", Zone "130", Estimated Hours 4.0
- Task "32-10-01-002", Description "NDT inspect drag brace attachment fittings", Zone "130", Estimated Hours 2.5
- Task "32-10-01-003", Description "Install new drag brace P/N 65C26528-5", Zone "130", Estimated Hours 5.0
  **Then** all three task cards are created with status "OPEN"
  **And** the work order total estimated hours = 11.5
  **Result:** [ ] Pass / [ ] Fail
  **Notes:**

### TC-AERO-013: Sign Off Task Card (Technician)

**Given** a task card "32-10-01-001" assigned to Technician "James Anderson" (AME License #12345)
**When** the technician completes the task and signs off: Actual Hours 3.5, Status "COMPLETED", Notes "Removed per AMM Chapter 32"
**Then** the task card status changes to "COMPLETED" with technicianName, signedDate, and actual hours
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AERO-014: Release Work Order with Certificate

**Given** a work order "WO-2602-0001" with all task cards completed and inspection signed off
**When** I release the work order: Release Cert Type "CRS" (Certificate of Release to Service), Released By "Inspector K. Lee (IA #67890)"
**Then** the work order status changes to "RELEASED"
**And** releaseCertRef, releasedBy, releasedDate, and esignatureId are recorded
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AERO-015: Defer Work Order Item

**Given** a work order "WO-2602-0002" with a task that cannot be completed due to parts shortage
**When** I defer the work order: Status "DEFERRED", Deferral Ref "MEL 32-10-01", Deferral Notes "Awaiting P/N 65C26528-5 from Boeing, ETA 2026-03-25, MEL Cat C - 10 calendar days"
**Then** the work order status changes to "DEFERRED"
**And** the MEL reference and deferral notes are recorded
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Human Factors Management (4 scenarios)

### TC-AERO-016: Report Human Factor Incident

**Given** I am on the Human Factors page
**When** I click "New Incident" and enter: Title "Incorrect torque value applied to MLG bolt", Category "LACK_OF_KNOWLEDGE", Severity "HIGH", Location "Hangar 3 Bay 2", Shift "Night", Description "Technician used incorrect torque value from superseded revision of AMM", Personnel Involved ["J. Anderson"], Incident Date "2026-03-10"
**Then** the incident is created with reference "HF-2602-XXXX" and status "REPORTED"
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AERO-017: Investigate Human Factor Incident

**Given** a human factor incident "HF-2602-0001" with status "REPORTED"
**When** I update: Status "INVESTIGATING", Root Cause "Technical library subscription lapsed; AMM not updated to current revision", Corrective Action "Implement digital AMM system with automatic updates; retrain night shift on revision verification procedures"
**Then** the incident record is updated with investigation findings
**And** a CAPA reference can be linked
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AERO-018: Record Fatigue Assessment

**Given** I am on the Human Factors > Fatigue Management page
**When** I create a fatigue assessment: Personnel ID "tech-001", Personnel Name "James Anderson", Assessment Date "2026-03-11", Hours Worked 14, Rest Hours 8, Fatigue Score 7 (out of 10)
**Then** the assessment is created with Risk Level "HIGH" (score 7+)
**And** Fit For Duty is set to false
**And** mitigations are required before duty assignment
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AERO-019: Dirty Dozen Category Analysis

**Given** multiple human factor incidents have been recorded across different categories
**When** I view the Human Factors dashboard
**Then** I see a breakdown of incidents by Dirty Dozen category
**And** I see trending data showing the most frequent categories (e.g., FATIGUE, DISTRACTION, PRESSURE)
**And** I can filter by date range and severity
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## OASIS Supplier Monitoring (3 scenarios)

### TC-AERO-020: Add Monitored Supplier

**Given** I am on the OASIS page
**When** I click "Add Supplier" and enter: CAGE Code "1ABC2", Company Name "Precision Aerospace Components Inc.", Cert Standard "AS9100", Cert Body "BSI", Cert Expiry "2027-06-30"
**Then** the supplier is added with status "CURRENT" (if cert not expired)
**And** the supplier appears in the monitored suppliers list
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AERO-021: Detect Expiring Certificate

**Given** a monitored supplier "1ABC2" with cert expiry date within 90 days
**When** the system checks certificate status (or I manually trigger a check)
**Then** an alert is generated with type "CERT_EXPIRING"
**And** the alert message includes the supplier name and days until expiry
**And** the alert appears on the OASIS dashboard
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AERO-022: Acknowledge OASIS Alert

**Given** an unacknowledged OASIS alert for supplier "1ABC2"
**When** I acknowledge the alert and enter acknowledgedBy "Supplier Quality Manager R. Patel"
**Then** the alert shows acknowledged=true with acknowledgedAt timestamp
**And** the alert moves from the active queue to the acknowledged queue
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Counterfeit Parts Prevention (3 scenarios)

### TC-AERO-023: Flag Suspect Counterfeit Part

**Given** I am on the Quality > Counterfeit Prevention page
**When** I flag a suspect part: Part Number "NAS1149-C0363R", Description "Washer received with inconsistent markings and no material cert", Source "Incoming Inspection", Supplier CAGE "5XYZ9"
**Then** the suspect part record is created with quarantine status
**And** the affected work orders or assemblies are flagged
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AERO-024: Counterfeit Investigation and Disposition

**Given** a flagged suspect counterfeit part
**When** I conduct the investigation: Testing performed "XRF material analysis", Result "Material composition does not match ASTM spec", Disposition "CONFIRMED_COUNTERFEIT"
**And** I enter corrective actions: "Report to GIDEP/EASA; quarantine all parts from suspect lot; source replacement from approved supplier"
**Then** the investigation record is complete
**And** the part status changes from SUSPECT to CONFIRMED_COUNTERFEIT
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AERO-025: Counterfeit Prevention Audit Trail

**Given** counterfeit part records have been created with various dispositions
**When** I view the counterfeit parts register
**Then** I see all records with full audit trail (who flagged, when, investigation results, disposition)
**And** I can generate a report for regulatory authorities
**And** I can filter by supplier, part number, and disposition
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Cross-Module Integration (3 scenarios)

### TC-AERO-026: Work Order to FAI Traceability

**Given** a completed work order "WO-2602-0001" involving installation of a new part P/N 65C26528-5
**When** I view the part's FAI status
**Then** the FAI record "FAI-2602-0001" for that part number is linked
**And** I can navigate from the work order to the FAI to verify the part was inspected
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AERO-027: ECP Impact on Work Orders

**Given** an approved ECP "ECP-2602-0001" affecting part "S283T002-3"
**When** I check for open work orders using the affected part
**Then** the system identifies any work orders that reference the part
**And** I can see the ECP status and determine if the change needs to be incorporated
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AERO-028: Human Factors to CAPA Link

**Given** a human factor incident "HF-2602-0001" with CAPA reference "CAPA-2602-010"
**When** I view the incident details
**Then** the CAPA reference is displayed as a navigable link
**And** the CAPA record shows the originating human factor incident
**And** CAPA effectiveness is tracked against recurrence of similar incidents
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Airworthiness Documentation (2 scenarios)

### TC-AERO-029: Generate Certificate of Release to Service

**Given** a completed work order "WO-2602-0001" with all tasks signed off and inspection complete
**When** I generate the CRS document
**Then** the system produces a certificate containing: Work Order reference, Aircraft Registration, Description of Work, Part Numbers installed/removed, Release type (CRS), Authorized signature reference
**And** the certificate is stored with the work order record
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AERO-030: EASA Form 1 / FAA 8130-3 Generation

**Given** a completed FAI "FAI-2602-0001" for part P/N 161A1100-47 with approved status
**When** I request a release certificate of type "EASA_FORM_1" or "FAA_8130_3"
**Then** the system generates the appropriate form with: Part Number, Description, Quantity, Serial/Batch Number, Approval Reference, Statement of Conformity
**And** the form references the FAI approval and all Part 1/2/3 data
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Sign-Off

| Role                     | Name | Signature | Date |
| ------------------------ | ---- | --------- | ---- |
| Quality Manager          |      |           |      |
| Product Owner            |      |           |      |
| UAT Lead                 |      |           |      |
| Airworthiness/Regulatory |      |           |      |

**Overall Result:** [ ] PASS -- All scenarios passed / [ ] FAIL -- See notes above
**Release Recommendation:** [ ] Approved for Production / [ ] Requires remediation
