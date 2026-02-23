# UAT Test Plan: Supplier Management Module

**Document ID:** UAT-SUP-001
**Version:** 1.0
**Date:** 2026-02-23
**Module:** Supplier Management
**Environment:** Staging (api-suppliers:4029 / web-suppliers:3033)
**Tester:** **\*\*\*\***\_\_\_\_**\*\*\*\***
**Sign-Off Date:** **\*\*\*\***\_\_\_\_**\*\*\*\***

---

## Supplier Register (5 scenarios)

### TC-SUP-001: Register New Supplier with Category and Tier

**Given** I am logged in as a Procurement Manager
**When** I navigate to Suppliers > Register and click "New Supplier"
**And** I fill in: Company Name "Apex Precision Components", Category "Raw Materials", Tier "TIER_1", Country "Germany", Contact Name "Klaus Weber", Contact Email "k.weber@apex-precision.de", Phone "+49 89 12345678"
**Then** the system creates the supplier record with reference "SUP-2602-XXXX" and status "PENDING"
**And** the supplier appears in the Supplier Register under Category "Raw Materials"
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-SUP-002: Submit Supplier for Approval (PENDING → APPROVED)

**Given** a supplier "SUP-2602-0001" with status "PENDING" and all required fields populated
**When** I click "Submit for Approval", assign approver "Quality Director", and add notes "Assessed via site visit — March 10"
**And** the approver logs in and clicks "Approve"
**Then** the supplier status changes from "PENDING" to "APPROVED"
**And** the approval date and approver name are recorded on the supplier record
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-SUP-003: View Approved Supplier List

**Given** multiple suppliers exist with statuses APPROVED, PENDING, and SUSPENDED
**When** I navigate to Suppliers > Register and apply filter Status = "APPROVED"
**Then** only approved suppliers are displayed in the list
**And** the list shows supplier name, category, tier, and country columns
**And** the count reflects only approved suppliers
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-SUP-004: Update Supplier Contact Details

**Given** an approved supplier "SUP-2602-0001" with existing contact details
**When** I open the supplier record, navigate to the Contacts tab, and update: Contact Email "k.weber@apex-precision.de" → "k.weber.new@apex-precision.de", Phone "+49 89 12345678" → "+49 89 87654321"
**Then** the supplier record saves the updated contact details
**And** the change is recorded in the supplier's audit history with timestamp and editor name
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-SUP-005: Suspend Supplier with Reason

**Given** an approved supplier "SUP-2602-0002" with active contracts
**When** I click "Suspend Supplier" and enter Reason "Failed quality audit — 3 critical nonconformances" and Suspension Date "2026-02-23"
**Then** the supplier status changes to "SUSPENDED"
**And** the suspension reason and date are recorded
**And** the supplier appears in the "Suspended" filter view with the reason visible
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Supplier Assessments (5 scenarios)

### TC-SUP-006: Create Assessment Questionnaire

**Given** I am logged in as a Procurement Manager
**When** I navigate to Suppliers > Assessments and click "New Assessment"
**And** I enter: Title "Annual Quality System Assessment 2026", Type "QUALITY", Supplier "Apex Precision Components", Due Date "2026-03-31"
**And** I add 5 questions covering: Quality management system, Calibration records, Nonconformance process, Customer complaint handling, Continuous improvement programme
**Then** the assessment is created with reference "ASM-2602-XXXX" and status "DRAFT"
**And** all 5 questions are listed with response fields
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-SUP-007: Send Assessment to Supplier

**Given** an assessment "ASM-2602-0001" in status "DRAFT" linked to supplier "SUP-2602-0001"
**When** I click "Send to Supplier" and confirm the supplier contact email
**Then** the assessment status changes to "SENT"
**And** the supplier contact receives a notification (email or portal message) with a link to complete the assessment
**And** the sent date is recorded on the assessment record
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-SUP-008: Record Assessment Responses and Score

**Given** an assessment "ASM-2602-0001" in status "SENT" with 5 questions
**When** the supplier (or assessor on behalf) enters responses: Q1 "Fully certified to ISO 9001:2015" (4/5), Q2 "Calibration records up to date" (5/5), Q3 "Documented NCR procedure in place" (4/5), Q4 "Complaint log maintained" (3/5), Q5 "CI programme active" (4/5)
**Then** each response is saved against its question
**And** the total score is calculated as 20/25 (80%)
**And** the assessment status changes to "COMPLETED"
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-SUP-009: Approve Assessment (PASS/FAIL Threshold)

**Given** a completed assessment "ASM-2602-0001" with a score of 80%
**When** the assessor reviews the results and the pass threshold is set at 70%
**Then** the system automatically assigns result "PASS" (score 80% >= threshold 70%)
**And** clicking "Approve Assessment" sets status to "APPROVED" with approval date and approver
**And** a FAIL result at 60% (below threshold) would display result "FAIL" and prevent approval
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-SUP-010: View Assessment History Per Supplier

**Given** supplier "SUP-2602-0001" has completed assessments in 2024, 2025, and 2026
**When** I open the supplier record and navigate to the "Assessments" tab
**Then** all historical assessments are listed in reverse chronological order
**And** each entry shows the assessment reference, type, score, result, and date
**And** the trend of scores is visible (improving, declining, or stable)
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Performance Monitoring (5 scenarios)

### TC-SUP-011: Record Delivery Performance (On-Time %, Quality PPM)

**Given** I am on the Supplier Performance page for "Apex Precision Components"
**When** I click "Record Performance" and enter: Period "2026-01", On-Time Delivery "94.5%", Quality PPM "250", Total Deliveries "200", Rejected Parts "50"
**Then** the performance record is saved with the entered metrics
**And** the PPM calculation is verified as (50 rejected / 200 × 1,000 = 250 PPM)
**And** the data point appears on the supplier's performance trend chart
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-SUP-012: View Supplier Scorecard

**Given** supplier "SUP-2602-0001" has 12 months of recorded performance data
**When** I navigate to Suppliers > Scorecards and select "Apex Precision Components"
**Then** a scorecard is displayed showing: On-Time Delivery %, Quality PPM, Assessment Score, Risk Level, and Overall Score
**And** each metric shows current period value, previous period, and target
**And** RAG status indicators (Red/Amber/Green) reflect performance against targets
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-SUP-013: Set Performance Alert Threshold

**Given** I am on the Supplier Performance configuration page
**When** I set alert thresholds for "Apex Precision Components": On-Time Delivery Amber "<96%", On-Time Delivery Red "<90%", Quality PPM Amber ">300", Quality PPM Red ">500"
**Then** the thresholds are saved against the supplier
**And** a confirmation message is shown
**And** future performance entries will be evaluated against these thresholds automatically
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-SUP-014: Trigger Amber Alert When Threshold Breached

**Given** supplier "SUP-2602-0001" has thresholds set (On-Time Delivery Amber < 96%)
**When** I record a performance entry: On-Time Delivery "94.5%" for period "2026-02"
**Then** the system detects the breach of the amber threshold (94.5% < 96%)
**And** an alert notification is raised with status "AMBER"
**And** the procurement manager receives a notification
**And** the supplier scorecard displays the amber indicator for On-Time Delivery
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-SUP-015: View Performance Trend

**Given** 6 months of performance data recorded for "Apex Precision Components"
**When** I view the supplier's performance page and select the Trend tab
**Then** a line chart is displayed showing On-Time Delivery % over the 6-month period
**And** a separate trend line shows Quality PPM over the same period
**And** target lines are overlaid on the chart for each metric
**And** I can export the trend data as a CSV or PDF report
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Supplier Contracts (5 scenarios)

### TC-SUP-016: Create Supplier Contract with Value and Expiry

**Given** I am logged in as a Procurement Manager
**When** I navigate to Suppliers > Contracts and click "New Contract"
**And** I fill in: Title "Annual Supply Agreement — Apex Precision 2026", Supplier "Apex Precision Components", Contract Value "£450,000", Currency "GBP", Start Date "2026-01-01", Expiry Date "2026-12-31", Contract Type "SUPPLY_AGREEMENT"
**Then** the contract is created with reference "CON-2602-XXXX" and status "DRAFT"
**And** the contract value and dates are correctly stored
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-SUP-017: Link Contract to Supplier

**Given** a contract "CON-2602-0001" in DRAFT status and supplier "SUP-2602-0001"
**When** I open the contract and click "Link Supplier"
**And** I search for and select "Apex Precision Components"
**Then** the contract record shows the linked supplier reference
**And** the supplier record's Contracts tab displays "CON-2602-0001"
**And** the link is navigable from both directions
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-SUP-018: Set Renewal Reminder (90 Days)

**Given** a contract "CON-2602-0001" with expiry date "2026-12-31"
**When** I configure a renewal reminder of 90 days before expiry
**Then** the system schedules a reminder for "2026-10-02" (90 days before "2026-12-31")
**And** the reminder configuration is displayed on the contract record
**And** a notification will fire on the calculated reminder date to the assigned contract owner
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-SUP-019: Approve Contract

**Given** a contract "CON-2602-0001" in DRAFT status with all required fields populated
**When** the Procurement Director clicks "Approve Contract"
**Then** the contract status changes from "DRAFT" to "APPROVED"
**And** the approval date and approver name are recorded
**And** the contract becomes read-only for standard users after approval
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-SUP-020: View Contracts Expiring in Next 90 Days

**Given** multiple supplier contracts exist with varying expiry dates
**When** I navigate to Suppliers > Contracts and apply filter "Expiring within 90 days"
**Then** only contracts with expiry dates between today and 90 days from today are shown
**And** each contract shows supplier name, contract value, expiry date, and renewal reminder status
**And** the list is sorted by expiry date (soonest first)
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Risk & Incidents (5 scenarios)

### TC-SUP-021: Record Supplier Incident (Quality / Delivery Failure)

**Given** I am on the Supplier Incidents page for "Apex Precision Components"
**When** I click "Record Incident" and enter: Type "QUALITY_FAILURE", Description "Batch BC-4420-A delivered with incorrect bore dimensions — 45 parts rejected", Date "2026-02-20", Severity "HIGH", Quantity Affected "45"
**Then** the incident is created with reference "SIN-2602-XXXX" and status "OPEN"
**And** the affected supplier's risk indicator is recalculated to reflect the incident
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-SUP-022: Link Incident to Nonconformance

**Given** an open supplier incident "SIN-2602-0001" and an existing nonconformance "NCR-2602-0042"
**When** I open the incident and click "Link Nonconformance"
**And** I search for and select "NCR-2602-0042"
**Then** the incident record shows the linked NCR reference
**And** the nonconformance record shows "Supplier Incident: SIN-2602-0001" as a linked source
**And** the link is navigable from both records
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-SUP-023: View Supplier Risk Level

**Given** supplier "SUP-2602-0001" has 2 open incidents (1 HIGH severity, 1 MEDIUM severity) in the past 12 months
**When** I view the supplier record
**Then** the Risk Level field displays "HIGH" based on incident history
**And** a risk summary panel shows the count of open/closed incidents by severity
**And** the supplier appears in the "High Risk" filter on the Supplier Register
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-SUP-024: Create Risk Improvement Plan

**Given** a supplier with Risk Level "HIGH" and open incident "SIN-2602-0001"
**When** I navigate to the supplier record and click "Create Improvement Plan"
**And** I enter: Plan Title "Quality System Improvement — Apex Precision", Objective "Reduce PPM to below 300 within 90 days", Actions ["Mandatory re-inspection of incoming goods for 60 days", "Supplier to conduct internal audit and submit corrective action report"], Target Date "2026-05-23"
**Then** the improvement plan is created and linked to the supplier
**And** the plan status is "IN_PROGRESS" and visible on the supplier's risk summary
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-SUP-025: Verify Dashboard Shows At-Risk Suppliers

**Given** multiple suppliers are registered with varying risk levels (HIGH, MEDIUM, LOW)
**When** I navigate to the Supplier Management dashboard
**Then** a "At-Risk Suppliers" widget displays all suppliers with risk level "HIGH" or "MEDIUM"
**And** each entry shows supplier name, risk level, open incidents count, and latest scorecard score
**And** clicking a supplier navigates directly to their risk summary page
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Sign-Off

| Role                  | Name | Signature | Date |
| --------------------- | ---- | --------- | ---- |
| Procurement Manager   |      |           |      |
| Quality Manager       |      |           |      |
| UAT Lead              |      |           |      |
| Regulatory/Compliance |      |           |      |

**Overall Result:** [ ] PASS -- All scenarios passed / [ ] FAIL -- See notes above
**Release Recommendation:** [ ] Approved for Production / [ ] Requires remediation
