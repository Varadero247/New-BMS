# UAT Test Plan: Incident Management Module

---
> **CONFIDENTIAL — TRADE SECRET**
> This document is the property of Nexara DMCC and contains confidential and
> proprietary information. Unauthorised disclosure is prohibited.
> © 2026 Nexara DMCC. All rights reserved.
---


**Document ID:** UAT-INC-001
**Version:** 1.0
**Date:** 2026-02-23
**Module:** Incident Management
**Environment:** Staging (api-incidents:4036 / web-incidents:3041)
**Tester:** **\*\*\*\***\_\_\_\_**\*\*\*\***
**Sign-Off Date:** **\*\*\*\***\_\_\_\_**\*\*\*\***

---

## Incident Reporting (5 scenarios)

### TC-INC-001: Report Workplace Incident (INC-YYYY-NNN Reference)

**Given** I am logged in as a Health & Safety Officer
**When** I navigate to Incidents and click "Report Incident"
**And** I fill in: title "Forklift Near-Miss in Warehouse Bay 3", dateOccurred "2026-02-23 09:15", Location "Warehouse Bay 3", Department "Logistics", Description "Forklift reversed without audible warning; pedestrian stepped back to avoid contact", Reported By "T. Okafor"
**Then** the incident is created with reference "INC-2026-NNN" and status "OPEN"
**And** the incident appears on the Incident Dashboard
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-INC-002: Classify Incident Severity (MINOR/MODERATE/MAJOR/CRITICAL)

**Given** an incident "INC-2026-0001" exists with no severity assigned
**When** I edit the incident and set severity to "MAJOR" with justification "Near-miss with potential for serious injury under slightly different circumstances"
**Then** the incident record is updated with severity "MAJOR"
**And** a notification is sent to the H&S Manager and department head
**And** the incident is flagged for mandatory investigation within 24 hours
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-INC-003: Set RIDDOR Reportable Flag

**Given** an incident "INC-2026-0001" with severity "MAJOR"
**When** I edit the incident and set: RIDDOR Reportable "Yes", RIDDOR Category "DANGEROUS_OCCURRENCE", HSE Report Deadline "2026-03-04" (10 days from occurrence)
**Then** the incident is flagged as RIDDOR reportable
**And** it appears in the RIDDOR Pending Reports dashboard
**And** a countdown timer shows days remaining until the HSE submission deadline
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-INC-004: Add Witnesses and Injured Parties

**Given** an incident "INC-2026-0001" exists with no witnesses or injured parties recorded
**When** I navigate to the Incident Parties tab and click "Add Witness"
**And** I add Witness 1: Name "P. Singh", Statement "I saw the forklift reversing without the warning alarm sounding"
**And** I click "Add Injured Party" and enter: Name "T. Okafor", Injury Type "NONE — near-miss only", Medical Treatment "NONE_REQUIRED"
**Then** both parties are saved against the incident
**And** the incident detail page shows a Witnesses (1) and Injured Parties (1) count
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-INC-005: Verify Incident Appears in Dashboard

**Given** incidents "INC-2026-0001" (MAJOR) and "INC-2026-0002" (MINOR) exist
**When** I navigate to the Incident Dashboard
**Then** both incidents are listed with their reference, title, dateOccurred, severity, and status
**And** the dashboard shows total counts by severity: MAJOR (1), MINOR (1)
**And** the dashboard shows a 30-day incident trend chart
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Investigation (5 scenarios)

### TC-INC-006: Assign Investigator to Incident

**Given** incident "INC-2026-0001" with status "OPEN" and no investigator assigned
**When** I click "Assign Investigator" and select "K. Williams (H&S Manager)"
**And** I set Investigation Deadline "2026-03-02"
**Then** the incident status changes to "UNDER_INVESTIGATION"
**And** K. Williams receives a notification with the incident reference and deadline
**And** the incident appears in K. Williams' investigation queue
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-INC-007: Record Root Cause Findings (5-Why Analysis)

**Given** incident "INC-2026-0001" is UNDER_INVESTIGATION and assigned to K. Williams
**When** I navigate to the Investigation tab and click "Add Root Cause Analysis"
**And** I complete the 5-Why chain:
- Why 1: "Forklift reversed without audible alarm" → Why 2: "Reverse alarm was faulty" → Why 3: "Pre-use checklist not completed" → Why 4: "No formal pre-use inspection procedure enforced" → Why 5: "Procedure not reviewed since 2019"
**And** I set Root Cause Category "PROCEDURAL" and Root Cause Description "Inadequate enforcement of pre-use equipment inspection procedure"
**Then** the 5-Why analysis is recorded against the investigation
**And** the root cause is categorised and stored for analytics
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-INC-008: Add Contributing Factors

**Given** an investigation is in progress for "INC-2026-0001"
**When** I navigate to the Contributing Factors section and click "Add Factor"
**And** I add: Factor 1 "Equipment fault — reverse alarm non-functional", Factor 2 "Inadequate segregation of pedestrian and vehicle routes", Factor 3 "Insufficient pre-use inspection culture"
**Then** all three contributing factors are saved against the investigation
**And** the investigation report preview shows the contributing factors section populated
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-INC-009: Complete Investigation Report

**Given** root cause and contributing factors have been recorded for incident "INC-2026-0001"
**When** I click "Complete Investigation Report" and enter: Report Summary "Near-miss caused by equipment failure and procedural gap", Lessons Learned "Pre-use inspection regime must be enforced and alarm defects reported immediately", Preventative Measures "Revised inspection checklist issued; alarm tested daily"
**And** I click "Submit Report"
**Then** the investigation report status changes to "COMPLETED"
**And** the completion date is recorded
**And** the incident status updates to "INVESTIGATION_COMPLETE"
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-INC-010: Close Investigation and Update Incident Status

**Given** the investigation report for "INC-2026-0001" is COMPLETED and all corrective actions are closed
**When** I click "Close Investigation" and confirm closure
**Then** the investigation is marked as "CLOSED" with closure date
**And** the incident status updates to "CLOSED"
**And** the incident is retained in the register with all investigation data preserved for audit
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## RIDDOR Compliance (5 scenarios)

### TC-INC-011: Mark Incident as RIDDOR Reportable

**Given** incident "INC-2026-0002" involves an over-7-day injury to an employee
**When** I edit the incident and toggle "RIDDOR Reportable" to "Yes"
**And** I select RIDDOR Type "OVER_7_DAY_INJURY" and enter Injured Person Job Role "Warehouse Operative"
**Then** the incident is flagged as RIDDOR reportable with the correct category
**And** the HSE report deadline (15 days for over-7-day injuries) is automatically calculated and displayed
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-INC-012: Verify Report Deadline (Within 10 Days for Specified Injuries)

**Given** incident "INC-2026-0003" involves a specified injury (fracture other than fingers, thumbs, toes) occurring on "2026-02-23"
**When** I view the incident's RIDDOR details
**Then** the system displays HSE Report Deadline as "2026-03-04" (10 days from occurrence)
**And** a countdown shows "9 days remaining"
**And** an overdue warning will trigger if the deadline passes without a report reference entered
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-INC-013: Record HSE Report Reference Number

**Given** a RIDDOR reportable incident "INC-2026-0001" with a pending report
**When** I navigate to the RIDDOR tab and click "Record Submission"
**And** I enter: HSE Reference Number "RI5023456789", Submission Date "2026-02-28", Submitted By "K. Williams"
**Then** the HSE reference number is recorded against the incident
**And** the RIDDOR status changes from "PENDING" to "SUBMITTED"
**And** the incident is removed from the RIDDOR Pending Reports list
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-INC-014: View RIDDOR Dashboard

**Given** multiple RIDDOR reportable incidents exist across various statuses (PENDING, SUBMITTED, OVERDUE)
**When** I navigate to Incidents > RIDDOR Dashboard
**Then** the dashboard shows counts by status: Pending (n), Submitted (n), Overdue (n)
**And** overdue reports are highlighted in red with days overdue shown
**And** I can click each category to see the list of matching incidents
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-INC-015: Filter Pending RIDDOR Reports

**Given** I am on the RIDDOR Dashboard with multiple pending reports
**When** I apply filter: Status "PENDING", Date Range "Last 30 days"
**Then** only RIDDOR reports submitted within the last 30 days with status PENDING are shown
**And** the list is sorted by deadline (soonest first)
**And** the total count updates to reflect the filter
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Corrective Actions (5 scenarios)

### TC-INC-016: Raise Action from Investigation Finding

**Given** incident "INC-2026-0001" has a completed investigation with root cause "Inadequate enforcement of pre-use inspection procedure"
**When** I navigate to the Actions tab and click "Raise Action"
**And** I enter: Title "Revise and enforce forklift pre-use inspection checklist", Type "CORRECTIVE", Priority "HIGH", Description "Update inspection form to include alarm test; enforce via toolbox talk"
**Then** the corrective action is created with reference "INC-ACT-2026-XXXX" and linked to the incident
**And** the action status is "OPEN"
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-INC-017: Assign Action to Responsible Person

**Given** corrective action "INC-ACT-2026-0001" exists with status "OPEN" and no assignee
**When** I edit the action and set: Assigned To "P. Singh (Logistics Supervisor)", Due Date "2026-03-15"
**Then** the action is assigned to P. Singh with the due date recorded
**And** P. Singh receives a notification with the action details and deadline
**And** the action appears in P. Singh's action queue
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-INC-018: Mark Action Overdue When Past Due Date

**Given** corrective action "INC-ACT-2026-0001" has Due Date "2026-03-15" and status "OPEN"
**When** the system date advances past "2026-03-15" without the action being completed
**Then** the action status automatically changes to "OVERDUE"
**And** the action is highlighted in red on the dashboard
**And** a reminder notification is sent to P. Singh and the H&S Manager
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-INC-019: Complete Action with Evidence

**Given** corrective action "INC-ACT-2026-0001" is OPEN and assigned to P. Singh
**When** P. Singh navigates to the action and clicks "Mark Complete"
**And** enters Completion Notes "Updated checklist distributed at toolbox talk on 2026-03-12; signed attendance sheet attached" and uploads evidence file "Toolbox_Talk_Attendance_2026-03-12.pdf"
**Then** the action status changes to "CLOSED" with closure date and evidence recorded
**And** the incident dashboard updates to show "All Actions Closed" for INC-2026-0001
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-INC-020: Set Due Date on Corrective Action

**Given** corrective action "INC-ACT-2026-0002" exists with no due date
**When** I edit the action and set Due Date "2026-04-01"
**Then** the due date is saved and displayed on the action record
**And** the action appears in the upcoming actions list sorted by due date
**And** a 7-day advance reminder is scheduled
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Timeline & Analytics (5 scenarios)

### TC-INC-021: View Incident Timeline

**Given** incidents "INC-2026-0001", "INC-2026-0002", and "INC-2026-0003" exist at various lifecycle stages
**When** I navigate to Incidents > Timeline
**Then** the incidents are displayed in chronological order on a timeline view
**And** each event on the timeline shows: date, incident reference, title, severity, and current status
**And** I can click any event to open the incident detail
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-INC-022: Filter Incidents by Date Range and Severity

**Given** multiple incidents exist across FY2025 and FY2026 with varying severities
**When** I apply filters: Date Range "2026-01-01 to 2026-02-28", Severity "MAJOR"
**Then** only MAJOR incidents occurring in January–February 2026 are displayed
**And** the count reflects the filtered results
**And** the filter state is preserved if I navigate away and return
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-INC-023: View Incident Rate Trend (Per 100,000 Hours Worked)

**Given** incident data and hours worked records exist for the last 12 months
**When** I navigate to Incidents > Analytics > Incident Rate
**And** I enter Total Hours Worked for the period "2,400,000"
**Then** the system calculates the Incident Rate as (total incidents / hours worked) × 100,000
**And** a monthly trend chart shows the incident rate over 12 months
**And** the current rate is benchmarked against the industry average where configured
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-INC-024: Compare Month-on-Month Incident Counts

**Given** incidents are recorded for January 2026 (4 incidents) and February 2026 (2 incidents)
**When** I navigate to Incidents > Analytics > Month-on-Month Comparison
**Then** the dashboard shows: January 2026 (4 incidents) and February 2026 (2 incidents) side by side
**And** the month-on-month change is displayed: "-2 (-50%)"
**And** the chart breaks down incidents by severity for each month
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-INC-025: Export Incident Register

**Given** an incident register exists with multiple incidents across statuses and severities
**When** I navigate to Incidents > Register and click "Export"
**And** I select format "CSV" with date range "2026-01-01 to 2026-12-31"
**Then** a CSV file is generated containing all incidents for the period
**And** the CSV includes columns: Reference, Title, Date, Location, Severity, Status, RIDDOR Reportable, Investigator, Actions Count
**And** the download is triggered in the browser
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Sign-Off

| Role                  | Name | Signature | Date |
| --------------------- | ---- | --------- | ---- |
| H&S Manager           |      |           |      |
| Product Owner         |      |           |      |
| UAT Lead              |      |           |      |
| Regulatory/Compliance |      |           |      |

**Overall Result:** [ ] PASS -- All scenarios passed / [ ] FAIL -- See notes above
**Release Recommendation:** [ ] Approved for Production / [ ] Requires remediation
