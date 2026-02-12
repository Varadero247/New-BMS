# UAT Test Plan: Automotive Module (IATF 16949)

**Document ID:** UAT-AUTO-001
**Version:** 1.0
**Date:** 2026-02-12
**Module:** Automotive (IATF 16949 / APQP / PPAP / SPC / MSA / LPA / CSR)
**Environment:** Staging (api-automotive:4010 / web-automotive:3010)
**Tester:** ____________________
**Sign-Off Date:** ____________________

---

## APQP Project Lifecycle (5 scenarios)

### TC-AUTO-001: Create New APQP Project
**Given** I am logged in as a Quality Manager
**When** I navigate to Automotive > APQP and click "New Project"
**And** I fill in: Product Name "Brake Caliper Housing", Customer "Ford Motor Co", Part Number "BC-4420-A", SOP Date "2026-09-01", Team Leader "J. Martinez", Team Members ["R. Chen", "S. Patel"]
**Then** the system creates the project with status "PLANNING" and reference "APQP-2602-XXXX"
**And** all 5 APQP phases are initialized (Plan & Define, Product Design, Process Design, Validation, Production)
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AUTO-002: Advance APQP Phase via Gate Review
**Given** an APQP project "APQP-2602-0001" exists in Phase 1 (Plan & Define) with all deliverables completed
**When** I click "Gate Review" and select Decision "APPROVED", add Reviewers ["VP Quality", "VP Engineering"], and enter notes
**Then** Phase 1 status changes to "COMPLETED" and Phase 2 status changes to "IN_PROGRESS"
**And** the project's currentPhase advances to 2
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AUTO-003: Mark APQP Deliverable Complete
**Given** an APQP project in Phase 2 with deliverable "Design FMEA" assigned to me
**When** I open the deliverable, upload a document reference "DFMEA-BC4420-RevA", and mark status as "COMPLETED"
**Then** the deliverable shows a completion date and the document reference is stored
**And** the phase progress bar updates accordingly
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AUTO-004: Place APQP Project On Hold
**Given** an APQP project "APQP-2602-0002" with status "IN_PROGRESS"
**When** I change the status to "ON_HOLD" and enter a reason
**Then** the project status changes to "ON_HOLD"
**And** the project appears in the "On Hold" filter view
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AUTO-005: Conditional Gate Review Approval
**Given** an APQP project with Phase 3 ready for gate review
**When** I conduct the gate review and select "APPROVED_WITH_CONDITIONS" with conditions "Complete process validation runs by March 15"
**Then** the gate review records the conditions
**And** Phase 3 status shows "COMPLETED" but with a conditions flag
**And** the next actions field shows the condition text
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## PPAP Submission Workflow (5 scenarios)

### TC-AUTO-006: Create PPAP Project Linked to APQP
**Given** an APQP project "APQP-2602-0001" exists in Phase 4 or 5
**When** I navigate to PPAP and click "New PPAP" and link it to the APQP project
**And** I set Submission Level 3, Part Number "BC-4420-A", Customer "Ford Motor Co"
**Then** the system creates the PPAP project with reference "PPAP-2602-XXXX" and 18 elements pre-populated
**And** elements required for Level 3 are marked as required, others as "NOT_APPLICABLE"
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AUTO-007: Complete PPAP Elements
**Given** a PPAP project "PPAP-2602-0001" with Submission Level 3
**When** I complete Element 1 (Design Records) by uploading document ref, marking "COMPLETED", and entering reviewer name
**Then** the element status changes to "COMPLETED" with the review date recorded
**And** the overall PPAP completion percentage increases
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AUTO-008: Submit PPAP with Part Submission Warrant
**Given** all required PPAP elements are marked COMPLETED for project "PPAP-2602-0001"
**When** I click "Submit PPAP" and generate a PSW number
**Then** a PpapSubmission record is created with status "SUBMITTED" and a unique PSW number
**And** the PPAP project status changes to "SUBMITTED"
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AUTO-009: Record Customer PPAP Decision
**Given** a submitted PPAP with PSW "PSW-2602-0001"
**When** I record the customer decision as "INTERIM_APPROVAL" with notes "Pending completion of run-at-rate"
**Then** the submission record shows customerDecision "INTERIM_APPROVAL" with the notes and disposition date
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AUTO-010: Reject PPAP Element for Rework
**Given** a PPAP project with Element 5 (Process Flow Diagram) in review
**When** the reviewer marks it as "REJECTED" with notes "Missing secondary operation steps"
**Then** the element status changes to "REJECTED"
**And** the PPAP overall status remains "IN_PROGRESS"
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## SPC Chart Creation and Analysis (5 scenarios)

### TC-AUTO-011: Create X-bar R Chart
**Given** I am logged in as a Quality Engineer
**When** I navigate to SPC and click "New Chart"
**And** I enter: Title "Bore Diameter", Characteristic "Inner Bore", Part Number "BC-4420-A", Chart Type "XBAR_R", USL 25.05, LSL 24.95, Target 25.00, Subgroup Size 5
**Then** the system creates the chart with reference "SPC-2602-XXXX" and status "ACTIVE"
**And** the chart displays with control limit lines calculated
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AUTO-012: Add SPC Data Points
**Given** an active SPC chart "SPC-2602-0001" with XBAR_R type and subgroup size 5
**When** I add 10 data points with values [25.01, 25.02, 24.98, 25.00, 24.99, 25.03, 24.97, 25.01, 25.00, 24.98]
**Then** each data point is recorded with timestamp and operator
**And** the chart updates to display the new points on both X-bar and R charts
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AUTO-013: Detect Out-of-Control Condition
**Given** an SPC chart with established control limits (UCL=25.04, LCL=24.96, CL=25.00)
**When** I add a data point with value 25.06 (above UCL)
**Then** the data point is flagged as outOfControl = true
**And** the violationRules field indicates "Point beyond control limit"
**And** the point is highlighted on the chart
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AUTO-014: SPC Chart Filtering
**Given** multiple SPC charts exist for different part numbers and statuses
**When** I filter by Part Number "BC-4420-A" and Status "ACTIVE"
**Then** only matching charts are displayed
**And** the count reflects the filtered results
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AUTO-015: Archive SPC Chart
**Given** an active SPC chart "SPC-2602-0001"
**When** I change the status to "ARCHIVED"
**Then** the chart status becomes "ARCHIVED"
**And** the chart no longer appears in the default "ACTIVE" view
**And** historical data points are preserved
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Control Plan Management (3 scenarios)

### TC-AUTO-016: Create Production Control Plan
**Given** I am on the Control Plans page
**When** I click "New Control Plan" and enter: Title "Brake Caliper Machining", Part Number "BC-4420-A", Plan Type "PRODUCTION", Revision "A"
**Then** the control plan is created with reference "CP-2602-XXXX" and status "DRAFT"
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AUTO-017: Add Characteristics to Control Plan
**Given** a control plan "CP-2602-0001" in DRAFT status
**When** I add a characteristic: Process "CNC Boring", Characteristic Name "Bore Diameter", Type "PRODUCT", Special Char Class "CC", Specification "25.00 +/-0.05mm", Eval Technique "CMM", Sample Size "5 pcs", Sample Frequency "Every 2 hours", Control Method "X-bar R Chart", Reaction Plan "Stop and notify supervisor"
**Then** the characteristic is added to the control plan
**And** the characteristic shows the linked SPC chart reference and PFMEA reference fields
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AUTO-018: Approve Control Plan
**Given** a control plan "CP-2602-0001" with all characteristics defined and reviewed
**When** I change status to "APPROVED" and enter approver name
**Then** the control plan status changes to "APPROVED" with the approval date recorded
**And** the control plan revision is locked
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## MSA Study Execution (3 scenarios)

### TC-AUTO-019: Create GR&R Study
**Given** I am on the MSA page
**When** I click "New Study" and enter: Title "Bore Gauge GR&R", Study Type "GRR_CROSSED", Gage Name "Mitutoyo Bore Gauge #347", Characteristic "Inner Bore", Tolerance "0.10mm", 3 Operators, 10 Parts, 3 Trials
**Then** the study is created with reference "MSA-2602-XXXX" and status "PLANNED"
**And** the measurement matrix is generated (3 operators x 10 parts x 3 trials = 90 measurements)
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AUTO-020: Enter MSA Measurements and Calculate
**Given** an MSA study "MSA-2602-0001" in DATA_COLLECTION status
**When** I enter all 90 measurement values across the operator/part/trial matrix
**Then** the system calculates: Repeatability (EV), Reproducibility (AV), Total GR&R, Part Variation (PV), Total Variation (TV), and Number of Distinct Categories (ndc)
**And** the GR&R percentage is displayed
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AUTO-021: MSA Result Classification
**Given** an MSA study with all measurements entered and GR&R calculated as 8.5%
**When** the system evaluates the result
**Then** the result is classified as "ACCEPTABLE" (GR&R < 10%)
**And** ndc is >= 5
**And** the study status changes to "COMPLETED"
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## LPA Scheduling and Execution (4 scenarios)

### TC-AUTO-022: Create LPA Schedule
**Given** I am on the LPA page
**When** I click "New Schedule" and enter: Process Area "Welding Cell A", Layer 1 (Operator), Frequency "DAILY"
**And** I add 5 audit questions: "Are work instructions posted?", "Is PPE being worn?", "Are gages within calibration?", "Is scrap segregated?", "Is the area clean per 5S?"
**Then** the schedule is created with 5 questions and active=true
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AUTO-023: Execute LPA Audit
**Given** an LPA schedule exists for "Welding Cell A" with 5 questions
**When** I click "Start Audit", select auditor "J. Rodriguez" and layer 1
**And** I answer all 5 questions (3 PASS, 1 FAIL with notes "Operator missing safety glasses", 1 NOT_APPLICABLE)
**And** I click "Complete Audit"
**Then** the audit is created with reference "LPA-2602-XXXX", totalQuestions=5, passCount=3, failCount=1, naCount=1
**And** the score is calculated as 75% (3 pass out of 4 applicable)
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AUTO-024: LPA Audit with CAPA Reference
**Given** an LPA audit "LPA-2602-0001" has a FAIL response for "Is PPE being worn?"
**When** I add a CAPA reference "CAPA-2602-015" to the failed response
**Then** the LPA response record includes the capaRef field
**And** the audit detail view shows the linked CAPA
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AUTO-025: LPA Dashboard Compliance Metrics
**Given** multiple LPA audits have been completed across different layers and process areas
**When** I view the LPA dashboard
**Then** I see audit compliance percentage by process area
**And** I see trends over time (weekly/monthly)
**And** I see overdue audits (schedules that have missed their frequency target)
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## CSR Management (3 scenarios)

### TC-AUTO-026: Add Customer-Specific Requirement
**Given** I am on the CSR Register page
**When** I click "Add Requirement" and enter: OEM "Ford", IATF Clause "8.3.2.1", Requirement Text "All design records must be submitted in CATIA V5 native format", Compliance Status "NOT_ASSESSED"
**Then** the requirement is added to the register
**And** it appears under the "Ford" OEM filter
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AUTO-027: Assess CSR Compliance Gap
**Given** a CSR requirement for "GM" clause "8.5.1.1" with status "NOT_ASSESSED"
**When** I update the Compliance Status to "PARTIAL", enter Gap Notes "Current control plan format missing GM-specific reaction plan format", Action Required "Update control plan template to GM GP-12", Assigned To "S. Kim", Due Date "2026-04-15"
**Then** the requirement record is updated with the gap analysis
**And** the CSR dashboard shows the gap status
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AUTO-028: Filter CSR by OEM and Compliance
**Given** CSR requirements exist for Ford, GM, and Stellantis at various compliance statuses
**When** I filter by OEM "GM" and Compliance Status "NON_COMPLIANT"
**Then** only GM non-compliant requirements are displayed
**And** the count matches the filter criteria
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Cross-Module Integration (2 scenarios)

### TC-AUTO-029: APQP-to-PPAP Traceability
**Given** an APQP project "APQP-2602-0001" linked to PPAP project "PPAP-2602-0001"
**When** I view the PPAP project details
**Then** the APQP project reference is displayed
**And** I can navigate from PPAP to the linked APQP project
**And** the APQP project shows the linked PPAP submission status
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AUTO-030: Control Plan to SPC Chart Link
**Given** a control plan characteristic with spcChartId linked to "SPC-2602-0001"
**When** I view the control plan characteristic details
**Then** the SPC chart reference is displayed as a clickable link
**And** clicking it navigates to the SPC chart with current data
**And** the SPC chart shows a back-link to the originating control plan
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| QA Manager | | | |
| Product Owner | | | |
| UAT Lead | | | |
| Regulatory/Compliance | | | |

**Overall Result:** [ ] PASS -- All scenarios passed  / [ ] FAIL -- See notes above
**Release Recommendation:** [ ] Approved for Production / [ ] Requires remediation
