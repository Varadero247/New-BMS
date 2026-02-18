# UAT Test Plan: Medical Devices Module (ISO 13485 / FDA 21 CFR 820)

**Document ID:** UAT-MED-001
**Version:** 1.0
**Date:** 2026-02-12
**Module:** Medical Devices (ISO 13485 / FDA 21 CFR 820 / EU MDR / IEC 62304 / ISO 14971)
**Environment:** Staging (api-medical:4011 / web-medical:3011)
**Tester:** **\*\*\*\***\_\_\_\_**\*\*\*\***
**Sign-Off Date:** **\*\*\*\***\_\_\_\_**\*\*\*\***

---

## Design Controls Lifecycle (5 scenarios)

### TC-MED-001: Create Design Control Project

**Given** I am logged in as a Design Assurance Engineer
**When** I navigate to Medical > Design Controls and click "New Project"
**And** I fill in: Title "NextGen Glucose Monitor", Device Name "GlucoSense X1", Device Class "CLASS_II", Intended Use "Continuous glucose monitoring for Type 1 and Type 2 diabetes patients", Regulatory Pathway "510k", Project Lead "Dr. A. Patel", Start Date "2026-03-01"
**Then** the system creates the project with reference "DC-2602-XXXX" and status "ACTIVE"
**And** the current stage is set to "PLANNING"
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-MED-002: Add Design Inputs with Traceability

**Given** a design project "DC-2602-0001" in the INPUTS stage
**When** I add a design input: Category "FUNCTIONAL", Requirement "The device shall measure glucose levels between 40-500 mg/dL", Source "User Needs Document UN-001", Priority "HIGH"
**And** I add another input: Category "SAFETY", Requirement "The device shall not cause skin irritation during 14-day wear period", Source "ISO 10993-10"
**Then** both inputs are recorded with unique IDs
**And** I can later link each input to a design output and verification test
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-MED-003: Design Review with Decision

**Given** a design project "DC-2602-0001" with inputs and outputs defined
**When** I conduct a design review at the INPUTS stage
**And** I enter: Reviewers ["Dr. Patel", "Dr. Kim", "R. Eng. Samuels"], Decision "APPROVED_WITH_CONDITIONS", Action Items "Clarify biocompatibility requirements for adhesive layer", Next Review Date "2026-04-15"
**Then** the design review record is created with the stage, reviewers, and decision
**And** the project stage can be advanced to "OUTPUTS"
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-MED-004: Design Verification Test

**Given** a design project with design output "Sensor accuracy specification: +/- 15% of reference glucose"
**When** I create a verification: Title "Sensor Accuracy Bench Test", Test Method "Compare 200 measurements against YSI reference analyzer", Acceptance Criteria "95% of results within +/- 15% of reference"
**And** I enter results "198 of 200 within range (99%)", mark pass=true
**Then** the verification record links to the input requirement and output specification
**And** the traceability matrix shows the complete chain: Input -> Output -> Verification
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-MED-005: Design Transfer Checklist

**Given** a design project "DC-2602-0001" that has completed verification and validation
**When** I initiate the design transfer
**And** I check: DHF Complete=true, Mfg Readiness=true, QA Approval=true, RA Approval=true
**Then** the design transfer status changes to "COMPLETED"
**And** the project current stage advances to "COMPLETE"
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## DMR/DHR Management (5 scenarios)

### TC-MED-006: Create Device Master Record

**Given** I am on the DMR/DHR page
**When** I click "New DMR" and enter: Device Name "GlucoSense X1", Device Class "CLASS_II", Description "Continuous glucose monitoring system", Current Version "1.0"
**And** I populate specifications, production processes, quality procedures, acceptance criteria, labelling specs, and packaging specs
**Then** the DMR is created with reference "DMR-2602-XXXX" and status "DRAFT"
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-MED-007: Approve DMR with Electronic Signature

**Given** a DMR "DMR-2602-0001" with all sections completed
**When** I submit the DMR for approval and provide my electronic signature (21 CFR Part 11 compliant)
**Then** the DMR status changes to "APPROVED" with approvedBy, approvedDate, and esignatureId
**And** the signature is logged in the audit trail
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-MED-008: Create Device History Record from DMR

**Given** an approved DMR "DMR-2602-0001" for GlucoSense X1
**When** I click "Create DHR" and enter: Batch Number "BATCH-2026-0042", Manufacturing Date "2026-05-15", Quantity Manufactured 500
**Then** the DHR is created with reference "DHR-2602-XXXX" and status "IN_PRODUCTION"
**And** the DHR links to the parent DMR
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-MED-009: Record DHR Production Steps

**Given** a DHR "DHR-2602-0001" in status "IN_PRODUCTION"
**When** I add production records: Incoming Inspection (PASS), In-Process Test (PASS), Final Test (PASS), Acceptance Record (PASS), Label Record, Packaging Record
**Then** all DHR records are stored with performer, date, and pass/fail results
**And** I can generate a DHR summary report
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-MED-010: Release DHR Batch

**Given** a DHR "DHR-2602-0001" with all production records completed and passing
**When** I release the batch: Released By "QA Manager L. Torres", Quantity Released 498, Quantity Rejected 2
**Then** the DHR status changes to "RELEASED" with release date and electronic signature
**And** the UDI primary identifier is recorded
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Complaint Handling and MDR Triage (5 scenarios)

### TC-MED-011: Log New Complaint

**Given** I am on the Complaints page
**When** I click "New Complaint" and enter: Device Name "GlucoSense X1", Lot Number "BATCH-2026-0042", Complaint Date "2026-07-10", Source "HEALTHCARE_PROVIDER", Reporter Name "Dr. Emily Chen", Description "Sensor readings consistently 20% higher than fingerstick reference after day 10 of wear"
**And** I set Patient Involved=true, Injury Occurred=false, Malfunction Occurred=true
**Then** the complaint is created with reference "COMP-2602-XXXX" and status "RECEIVED"
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-MED-012: Investigate Complaint

**Given** a complaint "COMP-2602-0001" in status "RECEIVED"
**When** I update the status to "UNDER_INVESTIGATION"
**And** I enter Investigation Summary "Returned sensors analyzed; adhesive degradation after day 10 causing sensor drift", Root Cause "Adhesive formulation sensitivity to humidity"
**Then** the complaint record is updated with the investigation findings
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-MED-013: MDR Reportability Decision

**Given** a complaint "COMP-2602-0001" under investigation with patient involvement and malfunction
**When** I perform MDR triage and set: MDR Reportable=true, Decision Date "2026-07-12", Decision By "RA Manager M. Johnson"
**Then** the complaint status changes to "MDR_REVIEW"
**And** an MDR report reference number is generated
**And** the system flags the 30-day reporting deadline
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-MED-014: Complaint Closure with CAPA

**Given** a complaint "COMP-2602-0001" with completed investigation and MDR filed
**When** I link CAPA reference "CAPA-2602-003", enter corrective action "Reformulate adhesive for improved humidity resistance"
**And** I close the complaint with electronic signature
**Then** the complaint status changes to "CLOSED" with closedDate and closedBy
**And** the CAPA reference is recorded
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-MED-015: Filter Complaints by Severity and MDR Status

**Given** multiple complaints exist at various severities and MDR statuses
**When** I filter by Severity "CRITICAL" and MDR Reportable=true
**Then** only critical MDR-reportable complaints are displayed
**And** the count and list are accurate
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Risk Management - ISO 14971 (4 scenarios)

### TC-MED-016: Create Risk Management File

**Given** I am on the Risk Management page
**When** I click "New RMF" and enter: Title "GlucoSense X1 Risk Analysis", Device Name "GlucoSense X1", Device Class "CLASS_II", Intended Use "Continuous glucose monitoring", Risk Policy "Risks are acceptable when benefits outweigh residual risk and ALARP principle is applied"
**Then** the RMF is created with reference "RMF-2602-XXXX" and status "ACTIVE"
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-MED-017: Identify Hazard and Assess Risk

**Given** a risk management file "RMF-2602-0001"
**When** I add a hazard: Category "USE_ERROR", Hazard Description "User fails to calibrate sensor", Hazardous Situation "Inaccurate glucose readings during critical hypoglycemia", Harm "Delayed treatment of hypoglycemia", Severity Before=5, Probability Before=3
**Then** the hazard is recorded with Risk Level Before automatically calculated
**And** the initial risk level reflects the 5x3 matrix position (HIGH or UNACCEPTABLE)
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-MED-018: Apply Risk Controls and Verify

**Given** a hazard in RMF "RMF-2602-0001" with initial risk level HIGH
**When** I add risk controls: 1) Inherent Safety - "Factory-calibrated sensor, no user calibration needed", 2) Protective Measure - "Automatic accuracy check algorithm", 3) Information for Safety - "User manual warning: verify readings with fingerstick if symptomatic"
**And** I verify each control and set residual risk: Severity After=4, Probability After=1
**Then** each control shows verification result and status "VERIFIED"
**And** the residual risk level is recalculated (LOW)
**And** residualRiskAcceptable is set to true
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-MED-019: Overall Risk-Benefit Analysis

**Given** all hazards in RMF "RMF-2602-0001" have been analyzed with residual risks assessed
**When** I complete the overall risk-benefit analysis: Overall Risk Acceptable=true, Benefit-Risk Acceptable=true, Benefit-Risk Analysis "Benefits of continuous glucose monitoring (reduced HbA1c, fewer severe hypoglycemic events) outweigh residual risks"
**Then** the RMF summary is updated
**And** the RMF status can be changed to "CLOSED"
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## UDI Management (3 scenarios)

### TC-MED-020: Register UDI Device

**Given** I am on the UDI page
**When** I click "New Device" and enter: Device Name "GlucoSense X1", Model Number "GS-X1-100", Manufacturer "Nexara Medical Inc.", Device Class "CLASS_II", GMDN Code "47301"
**Then** the UDI device record is created with reference "UDI-2602-XXXX" and status "DRAFT"
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-MED-021: Add DI and PI Records

**Given** a UDI device "UDI-2602-0001"
**When** I add a DI record: Issuing Agency "GS1", DI Code "00380740012345"
**And** I add a PI record: Lot Number "BATCH-2026-0042", Manufacturing Date "2026-05-15", Expiration Date "2027-05-15"
**Then** both records are linked to the device
**And** the full UDI string can be generated from DI + PI
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-MED-022: Submit UDI to GUDID

**Given** a UDI device "UDI-2602-0001" with DI and PI records populated
**When** I create a submission: Database "GUDID", Submission Date "2026-06-01"
**Then** the submission record is created with status "SUBMITTED"
**And** the device status changes to "ACTIVE"
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Post-Market Surveillance (3 scenarios)

### TC-MED-023: Create PMS Plan

**Given** I am on the PMS page
**When** I click "New PMS Plan" and enter: Device Name "GlucoSense X1", Device Class "CLASS_II", Data Sources ["complaints", "MDR", "MAUDE", "literature review", "clinical follow-up"], Review Frequency "ANNUAL"
**Then** the PMS plan is created with reference "PMS-2602-XXXX" and status "DRAFT"
**And** the next review date is calculated as 1 year from creation
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-MED-024: Generate PMS Report (PSUR)

**Given** a PMS plan "PMS-2602-0001" with status "ACTIVE"
**When** I generate a PSUR report for the period 2026-01-01 to 2026-06-30
**And** I enter: Complaint Count=12, MDR Count=1, Adverse Events=0, Trend Analysis "Sensor drift complaints concentrated in high-humidity regions", Conclusions "Product performance within acceptable limits", Actions "Investigate adhesive reformulation"
**Then** the PMS report is created with type "PSUR" and status "DRAFT"
**And** the report links to the parent PMS plan
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-MED-025: Approve PMS Report

**Given** a PMS report in DRAFT status
**When** I change the status to "APPROVED" with approver name and date
**Then** the report status changes to "APPROVED"
**And** the PMS plan's lastReviewDate is updated
**And** the nextReviewDate is recalculated
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Software Validation - IEC 62304 (3 scenarios)

### TC-MED-026: Create Software Project

**Given** I am on the Software Validation page
**When** I click "New Project" and enter: Title "GlucoSense X1 Firmware", Description "Embedded firmware for glucose measurement algorithm", Safety Class "CLASS_C" (could cause death or serious injury)
**Then** the project is created with reference "SW-2602-XXXX" and status "ACTIVE"
**And** all required IEC 62304 phase documents are initialized (Planning through Release)
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-MED-027: Register SOUP Items

**Given** a software project "SW-2602-0001"
**When** I add SOUP items: 1) "FreeRTOS v10.5.1" with vendor "Real Time Engineers Ltd", intended use "RTOS kernel", risk acceptable=true; 2) "ARM CMSIS DSP Library v5.9" with vendor "ARM", intended use "Signal processing", risk acceptable=true
**Then** both SOUP items are recorded with version, vendor, and risk assessment
**And** the SOUP inventory is viewable from the project dashboard
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-MED-028: Track Software Anomalies

**Given** a software project "SW-2602-0001" in INTEGRATION_TESTING phase
**When** I log an anomaly: Title "Glucose algorithm overflow at values > 450 mg/dL", Description "Integer overflow in moving average calculation causes erroneous output", Severity "CRITICAL"
**And** I later resolve it: Resolution "Changed calculation to use 32-bit float; added range guard", Status "RESOLVED"
**Then** the anomaly record shows the full lifecycle from OPEN to RESOLVED
**And** resolved date is recorded
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Regulatory Submissions (2 scenarios)

### TC-MED-029: Track 510(k) Submission

**Given** I am on the Regulatory Submissions page
**When** I click "New Submission" and enter: Device Name "GlucoSense X1", Market "FDA_510K", Submission Type "INITIAL", Status "PREPARATION"
**Then** the submission is created with reference "REG-2602-XXXX"
**And** the status tracker shows the preparation phase
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-MED-030: Record Submission Approval

**Given** a regulatory submission "REG-2602-0001" with status "UNDER_REVIEW"
**When** I update: Status "APPROVED", Approval Date "2026-10-01", Reference Number "K262345", Conditions "Post-market clinical follow-up required per special condition SC-2602-001"
**Then** the submission record is updated with the approval details
**And** the expiry date or renewal date is set if applicable
**And** the device can be marked as cleared for US market
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Sign-Off

| Role                | Name | Signature | Date |
| ------------------- | ---- | --------- | ---- |
| QA/RA Manager       |      |           |      |
| Product Owner       |      |           |      |
| UAT Lead            |      |           |      |
| Clinical/Regulatory |      |           |      |

**Overall Result:** [ ] PASS -- All scenarios passed / [ ] FAIL -- See notes above
**Release Recommendation:** [ ] Approved for Production / [ ] Requires remediation
