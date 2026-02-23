# UAT Test Plan: Complaints Management Module

**Document ID:** UAT-COMP-001
**Version:** 1.0
**Date:** 2026-02-23
**Module:** Complaints Management
**Environment:** Staging (api-complaints:4032 / web-complaints:3036)
**Tester:** **\*\*\*\***\_\_\_\_**\*\*\*\***
**Sign-Off Date:** **\*\*\*\***\_\_\_\_**\*\*\*\***

---

## Complaint Registration (5 scenarios)

### TC-COMP-001: Register Customer Complaint with CMP-YYYY-NNN Reference

**Given** I am logged in as a Customer Relations Officer
**When** I navigate to Complaints > Register and click "New Complaint"
**And** I fill in: Subject "Defective batch — bearing housing casting porosity", Source "EMAIL", Received Date "2026-02-23", Customer "Precision Drives Ltd"
**Then** the system creates the complaint with reference "CMP-2602-XXXX" and status "NEW"
**And** the reference follows the pattern CMP-YYYY-NNN with the current year
**And** a creation timestamp is recorded
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-COMP-002: Classify Complaint Type and Severity

**Given** a new complaint "CMP-2602-0001" in status "NEW"
**When** I open the complaint and set: Type "PRODUCT_QUALITY", Severity "HIGH", Description "Customer reports 12 castings from batch BC-4420-20260215 showing surface porosity — all rejected at goods-in inspection"
**Then** the complaint record saves the type and severity classification
**And** HIGH severity complaints trigger a notification to the Quality Manager automatically
**And** the complaint appears in the "High Severity" filter view
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-COMP-003: Assign Case Owner to Complaint

**Given** a new complaint "CMP-2602-0001" with no case owner assigned
**When** the Complaints Manager opens the complaint and clicks "Assign Owner"
**And** selects case owner "J. Martinez (Quality Engineer)"
**Then** the complaint record displays J. Martinez as the case owner
**And** J. Martinez receives a notification: "Complaint CMP-2602-0001 has been assigned to you"
**And** the assignment date is recorded on the complaint
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-COMP-004: Record Customer Details and Satisfaction Score

**Given** a complaint "CMP-2602-0001" with case owner assigned
**When** I update the complaint with customer details: Customer Contact Name "Sarah Thompson", Contact Email "s.thompson@precisiondrives.com", Contact Phone "+44 1234 567890"
**And** I record an initial satisfaction score of "2 out of 5" (very dissatisfied)
**Then** the customer details and satisfaction score are saved on the complaint record
**And** the satisfaction score is visible in the complaint header for quick reference
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-COMP-005: View New Complaints Dashboard Count

**Given** 5 new complaints have been registered today and not yet assigned
**When** I navigate to the Complaints dashboard
**Then** the "New Complaints" widget displays the count "5"
**And** clicking the widget navigates to the filtered list of complaints with status "NEW"
**And** the dashboard also shows total open complaints and complaints overdue for response
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Investigation & Actions (5 scenarios)

### TC-COMP-006: Assign Investigator to Complaint

**Given** a complaint "CMP-2602-0001" in status "NEW" with a case owner assigned
**When** the case owner clicks "Start Investigation" and assigns investigator "R. Chen (Quality Engineer)"
**Then** the complaint status changes to "INVESTIGATING"
**And** R. Chen is recorded as the investigator with investigation start date
**And** R. Chen receives a notification of the investigation assignment
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-COMP-007: Conduct Root Cause Analysis

**Given** complaint "CMP-2602-0001" is under investigation by R. Chen
**When** R. Chen opens the investigation form and records: Root Cause Method "5-Why Analysis", Root Cause "Casting mould temperature sensor out of calibration — recorded temperature 20°C below actual, causing premature cooling and subsurface porosity", Contributing Factors "Calibration overdue by 6 weeks"
**Then** the root cause analysis is saved against the complaint
**And** the investigation section of the complaint record shows the completed RCA details
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-COMP-008: Create Corrective Action with CMA-YYYY-NNN Reference

**Given** root cause analysis is completed for complaint "CMP-2602-0001"
**When** I click "Add Corrective Action" and enter: Title "Recalibrate all casting mould temperature sensors", Description "Arrange immediate calibration of all 6 casting mould sensors", Assigned To "Maintenance Team", Due Date "2026-03-01", Priority "HIGH"
**Then** the corrective action is created with reference "CMA-2602-XXXX"
**And** the reference follows the pattern CMA-YYYY-NNN with the current year
**And** the action is linked to complaint "CMP-2602-0001"
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-COMP-009: Link Corrective Action to Complaint

**Given** a corrective action "CMA-2602-0001" and complaint "CMP-2602-0001" both exist independently
**When** I open the corrective action and click "Link to Complaint"
**And** I search for and select "CMP-2602-0001"
**Then** the action record shows "Linked Complaint: CMP-2602-0001"
**And** the complaint record shows "CMA-2602-0001" under Linked Corrective Actions
**And** the link is navigable from both records
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-COMP-010: Close Investigation

**Given** all corrective actions for complaint "CMP-2602-0001" are completed and verified as effective
**When** R. Chen clicks "Close Investigation" and enters: Effectiveness Review "Recalibration completed — all sensors now within tolerance. Test batch produced — no porosity detected in 20 parts sampled", Closure Date "2026-03-05"
**Then** the investigation status changes to "CLOSED"
**And** the effectiveness review text and closure date are recorded
**And** the complaint status progresses to "PENDING_CUSTOMER" awaiting customer resolution confirmation
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Status Workflow (5 scenarios)

### TC-COMP-011: Progress Complaint NEW → INVESTIGATING → PENDING_CUSTOMER → RESOLVED

**Given** a complaint "CMP-2602-0002" starting in status "NEW"
**When** I progress through the full status workflow: NEW → INVESTIGATING (assign investigator) → PENDING_CUSTOMER (close investigation, send customer update) → RESOLVED (customer confirms resolution)
**Then** each status transition is recorded with date, user, and any associated notes
**And** the complaint status history shows all transitions in chronological order
**And** the final status "RESOLVED" locks the complaint from further editing by standard users
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-COMP-012: Reopen Resolved Complaint

**Given** a resolved complaint "CMP-2602-0003" where the customer has reported recurrence of the same issue
**When** the Complaints Manager clicks "Reopen Complaint" and enters reason "Customer reports issue recurring — batch from 2026-03-15 also showing porosity"
**Then** the complaint status changes from "RESOLVED" back to "INVESTIGATING"
**And** the reopening reason and date are appended to the status history
**And** the case owner and investigator are notified of the reopening
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-COMP-013: Escalate to Regulatory Complaint (isRegulatory = true)

**Given** a complaint "CMP-2602-0004" that involves a potential regulatory notification obligation
**When** I open the complaint and toggle "Regulatory Complaint" to true
**And** I select Regulatory Body "Health and Safety Executive (HSE)" and enter Obligation "RIDDOR notification required within 10 days"
**Then** the complaint record is flagged with isRegulatory = true
**And** a dedicated "Regulatory" section appears on the complaint record
**And** a HIGH priority notification is sent to the Compliance Manager
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-COMP-014: Record Regulatory Body Reference

**Given** complaint "CMP-2602-0004" is flagged as a regulatory complaint (isRegulatory = true)
**When** I complete the regulatory notification and enter: Reference Number "HSE-2026-038471", Submission Date "2026-02-25", Submitted By "J. Martinez"
**Then** the regulatory reference is saved against the complaint
**And** the regulatory section displays the reference, submission date, and submitter
**And** the complaint status reflects the regulatory filing is complete
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-COMP-015: Verify Status History Audit Trail

**Given** complaint "CMP-2602-0001" has progressed through statuses: NEW → INVESTIGATING → PENDING_CUSTOMER → RESOLVED → INVESTIGATING (reopened) → RESOLVED
**When** I open the complaint and navigate to the "Status History" tab
**Then** all 6 status transitions are listed in chronological order
**And** each entry shows: from status, to status, changed by, date/time, and any notes
**And** the audit trail is immutable — no entries can be deleted or modified
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Communications (5 scenarios)

### TC-COMP-016: Record Inbound Customer Communication (Email / Phone)

**Given** a complaint "CMP-2602-0001" is under investigation
**When** the case owner receives a phone call from the customer and clicks "Add Communication"
**And** enters: Direction "INBOUND", Channel "PHONE", Date "2026-02-24 14:30", Summary "Customer confirms 12 parts affected — willing to wait for investigation outcome before escalating", Contact "Sarah Thompson"
**Then** the communication is saved against the complaint
**And** the communications timeline on the complaint shows the new entry with direction and channel indicators
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-COMP-017: Record Outbound Response with CMC-YYYY-NNN Reference

**Given** a complaint "CMP-2602-0001" with an inbound communication logged
**When** I click "Add Communication" and enter: Direction "OUTBOUND", Channel "EMAIL", Date "2026-02-24 16:00", Summary "Sent formal acknowledgement confirming receipt of complaint and target resolution date of 2026-03-07"
**Then** the outbound communication is created with reference "CMC-2602-XXXX"
**And** the reference follows the pattern CMC-YYYY-NNN with the current year
**And** the communication appears in the timeline with OUTBOUND indicator
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-COMP-018: View Communications Timeline on Complaint

**Given** complaint "CMP-2602-0001" has 4 communications logged (2 inbound, 2 outbound) over 3 days
**When** I open the complaint and navigate to the "Communications" tab
**Then** all communications are displayed in a chronological timeline
**And** inbound communications are visually distinguished from outbound (e.g., different colour or icon)
**And** each entry shows the reference, channel, date, summary, and the user who recorded it
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-COMP-019: Send Acknowledgement Within SLA (24 Hours)

**Given** a new complaint "CMP-2602-0005" registered at "2026-02-23 09:00" with a 24-hour acknowledgement SLA
**When** the case owner records an outbound acknowledgement communication at "2026-02-23 14:30" (5.5 hours after registration)
**Then** the acknowledgement is recorded as within the 24-hour SLA
**And** the complaint record shows "Acknowledged: Yes — 2026-02-23 14:30 (5.5 hrs)"
**And** if no acknowledgement is recorded by "2026-02-24 09:00", the complaint is flagged as "SLA BREACH"
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-COMP-020: View SLA Compliance Dashboard

**Given** 50 complaints have been received in the past 30 days with varying acknowledgement and resolution times
**When** I navigate to Complaints > Dashboard > SLA Compliance
**Then** a KPI widget shows acknowledgement SLA compliance rate (e.g., "46/50 = 92%")
**And** a second KPI shows resolution SLA compliance rate within target resolution time
**And** complaints that breached SLA are listed with breach duration and reason
**And** the dashboard can be filtered by date range and complaint type
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Reporting & Analytics (5 scenarios)

### TC-COMP-021: View Complaints by Category

**Given** complaints have been logged across categories: Product Quality, Delivery, Service, Billing, and Regulatory
**When** I navigate to Complaints > Reports > By Category
**Then** a bar chart or table shows the count and percentage of complaints per category
**And** the report can be filtered by date range (e.g., last 30 days, last quarter, year to date)
**And** clicking a category bar/row navigates to the filtered list of complaints in that category
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-COMP-022: Average Resolution Time Report

**Given** resolved complaints have varying resolution durations across the past 6 months
**When** I navigate to Complaints > Reports > Resolution Time
**Then** the report displays average resolution time in days (overall and by category)
**And** the trend of average resolution time is shown month by month over the selected period
**And** complaints exceeding the target resolution time are highlighted and counted
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-COMP-023: Repeat Complaint Rate

**Given** some customers have submitted multiple complaints about the same issue type within 90 days
**When** I navigate to Complaints > Reports > Repeat Rate
**Then** the report shows the percentage of complaints that are repeats (same customer + same category within 90 days)
**And** individual repeat complaint pairs are listed (original CMP reference and repeat CMP reference)
**And** a high repeat rate triggers a quality alert recommendation to investigate systemic root cause
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-COMP-024: Customer Satisfaction Trend

**Given** satisfaction scores (1-5) have been recorded on resolved complaints over the past 6 months
**When** I navigate to Complaints > Reports > Customer Satisfaction
**Then** a line chart shows the average satisfaction score month by month over the 6-month period
**And** the current month's average score is highlighted with comparison to the previous month
**And** complaints with a score of 1 or 2 (very dissatisfied) are listed for targeted follow-up
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-COMP-025: Export Complaints Register

**Given** the complaints register contains 200+ complaints across various statuses and date ranges
**When** I apply a filter for date range "2026-01-01 to 2026-02-23" and click "Export"
**And** I select format "CSV"
**Then** a CSV file is generated containing all filtered complaints
**And** the CSV includes columns: Reference, Subject, Type, Severity, Status, Customer, Case Owner, Registration Date, Resolution Date, Satisfaction Score, Regulatory Flag
**And** the exported file downloads successfully and opens correctly in a spreadsheet application
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Sign-Off

| Role                  | Name | Signature | Date |
| --------------------- | ---- | --------- | ---- |
| Customer Relations    |      |           |      |
| Quality Manager       |      |           |      |
| UAT Lead              |      |           |      |
| Regulatory/Compliance |      |           |      |

**Overall Result:** [ ] PASS -- All scenarios passed / [ ] FAIL -- See notes above
**Release Recommendation:** [ ] Approved for Production / [ ] Requires remediation
