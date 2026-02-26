# UAT Test Plan: Health & Safety Module (ISO 45001:2018)

---
> **CONFIDENTIAL — TRADE SECRET**
> This document is the property of Nexara DMCC and contains confidential and
> proprietary information. Unauthorised disclosure is prohibited.
> © 2026 Nexara DMCC. All rights reserved.
---


**Document ID:** UAT-HS-001
**Version:** 1.0
**Date:** 2026-02-23
**Module:** Health & Safety (ISO 45001:2018 / Incident Reporting / Risk Assessment / Legal Register / OHS Objectives / CAPA)
**Environment:** Staging (api-health-safety:4001 / web-health-safety:3001)
**Tester:** **\*\*\*\***\_\_\_\_**\*\*\*\***
**Sign-Off Date:** **\*\*\*\***\_\_\_\_**\*\*\*\***

---

## Incident Reporting (5 scenarios)

### TC-HS-001: Report a New Workplace Incident

**Given** I am logged in as a Health & Safety Officer
**When** I navigate to Health & Safety > Incidents and click "Report Incident"
**And** I fill in: Title "Slip on wet floor near Loading Bay 3", Type "INCIDENT", Date Occurred "2026-02-23", Location "Warehouse - Loading Bay 3", Severity "MODERATE", Description "Employee slipped on standing water and sustained a sprained wrist", Reported By "J. Harrison"
**Then** the system creates the incident with status "OPEN" and a reference number "INC-2602-XXXX"
**And** the incident appears in the incidents list with severity badge "MODERATE"
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-HS-002: Report a Near-Miss Event

**Given** I am logged in as a Health & Safety Officer
**When** I navigate to Incidents and click "Report Incident"
**And** I fill in: Title "Near-miss: unsecured pallet almost fell on operative", Type "NEAR_MISS", Date Occurred "2026-02-23", Location "Warehouse - Racking Aisle 2", Severity "MINOR", Description "A poorly stacked pallet shifted and narrowly missed an operative walking below"
**Then** the system creates the record with type "NEAR_MISS" and status "OPEN"
**And** the incident list shows a distinct "Near-Miss" label for the record
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-HS-003: Report a Dangerous Occurrence

**Given** I am logged in as a Health & Safety Manager
**When** I navigate to Incidents and click "Report Incident"
**And** I fill in: Title "Crane wire rope failure during lift", Type "DANGEROUS_OCCURRENCE", Date Occurred "2026-02-23", Location "Production Floor - Overhead Crane Bay", Severity "CRITICAL", Description "Wire rope on overhead crane parted during a 2-tonne lift; load fell 0.5 m before secondary brake engaged"
**Then** the system creates the record with type "DANGEROUS_OCCURRENCE" and status "OPEN"
**And** the incident is flagged with a Critical severity indicator
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-HS-004: Transition Incident Status OPEN → INVESTIGATING → CLOSED

**Given** an incident "INC-2602-0001" exists with status "OPEN"
**When** I open the incident, set status to "INVESTIGATING", and save
**Then** the incident status updates to "INVESTIGATING"
**When** I then update the status to "CLOSED", enter Root Cause "Inadequate housekeeping procedure" and Corrective Action "Updated cleaning schedule and posted wet-floor signage"
**Then** the incident status changes to "CLOSED" with the root cause and corrective action recorded
**And** a closed-date timestamp is stored on the record
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-HS-005: Verify RIDDOR Classification Auto-Check

**Given** I am creating a new incident with Type "INCIDENT" and Severity "MAJOR"
**When** I save the record and navigate to the incident detail view
**Then** the system displays a RIDDOR classification prompt indicating the incident may be reportable under RIDDOR 2013 (e.g. "Specified Injury" or "Over-7-Day Incapacitation")
**And** a "RIDDOR Reportable" checkbox or flag is available for the H&S Officer to confirm
**And** the incident list shows a RIDDOR indicator badge on confirmed reportable incidents
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Risk Assessment (5 scenarios)

### TC-HS-006: Create Risk with Likelihood/Severity Matrix

**Given** I am logged in as a Health & Safety Officer
**When** I navigate to Health & Safety > Risk Assessments and click "New Risk"
**And** I enter: Title "Manual handling of heavy drums", Activity "Drum transfer to filling line", Hazard "Musculoskeletal injury from manual lifting", Likelihood 3, Severity 4
**Then** the system calculates a Risk Rating of 12 (Likelihood × Severity)
**And** the risk is created with reference "RISK-2602-XXXX" and status "OPEN"
**And** the risk matrix cell for (3,4) is highlighted
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-HS-007: Assign Controls to a Risk

**Given** a risk "RISK-2602-0001" exists with status "OPEN" and no controls assigned
**When** I click "Add Control" and enter: Control Type "ENGINEERING", Description "Install mechanical drum-lifting aid (tilter/positioner)", Effectiveness "HIGH", Assigned To "Maintenance Team", Due Date "2026-03-31"
**And** I add a second control: Control Type "ADMINISTRATIVE", Description "Mandatory manual handling refresher training for all operatives", Effectiveness "MEDIUM", Assigned To "H&S Manager"
**Then** both controls are saved and linked to the risk record
**And** the residual risk rating is updated to reflect control effectiveness
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-HS-008: Review and Approve a Risk Assessment

**Given** a risk "RISK-2602-0001" exists with status "OPEN" and controls assigned
**When** I set the status to "UNDER_REVIEW" and assign Reviewer "H. Patel (H&S Manager)", Review Date "2026-02-23"
**And** the reviewer opens the risk and changes status to "APPROVED"
**Then** the risk status changes to "APPROVED" with the reviewer name and approval date recorded
**And** the risk appears in the "Approved" filter view
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-HS-009: Bulk Filter Risks by Severity

**Given** multiple risk assessments exist with varying severity levels (MINOR, MODERATE, MAJOR, CRITICAL, CATASTROPHIC)
**When** I navigate to the Risk Assessments list and apply filter Severity "CRITICAL"
**Then** only risks with severity "CRITICAL" are displayed in the list
**And** the record count updates to reflect the filtered results
**And** all displayed records show a "CRITICAL" severity badge
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-HS-010: Verify Overdue Review Alert

**Given** a risk "RISK-2602-0002" exists with Review Due Date set to "2026-01-15" (in the past) and status "APPROVED"
**When** I navigate to the Risk Assessments list
**Then** the risk is flagged with an "Overdue Review" indicator
**And** the risk dashboard displays a count of overdue reviews
**And** the overdue risk appears in a dedicated "Overdue" filter or tab
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Legal Register (5 scenarios)

### TC-HS-011: Add a Legislation Entry

**Given** I am logged in as a Health & Safety Manager
**When** I navigate to Health & Safety > Legal Register and click "Add Legislation"
**And** I enter: Title "Health and Safety at Work etc. Act 1974", Jurisdiction "United Kingdom", Category "PRIMARY_LEGISLATION", Reference "HSWA 1974", Applicable Sections "Sections 2, 3, 4 — Employer Duties", Responsible Person "H. Patel", Review Date "2026-08-23"
**Then** the legislation entry is created with reference "LEG-2602-XXXX" and compliance status "NOT_ASSESSED"
**And** the entry appears in the Legal Register list
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-HS-012: Link Legislation to a Risk Assessment

**Given** a legislation entry "LEG-2602-0001" and a risk assessment "RISK-2602-0001" both exist
**When** I open the legislation entry and click "Link to Risk" and select risk "RISK-2602-0001"
**Then** the legislation detail view shows the linked risk reference "RISK-2602-0001"
**And** the risk detail view displays the linked legislation entry "LEG-2602-0001"
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-HS-013: Mark Legislation as Compliant

**Given** a legislation entry "LEG-2602-0001" with compliance status "NOT_ASSESSED"
**When** I click "Update Compliance", set Compliance Status to "COMPLIANT", enter Evidence "Annual HSWA audit completed Jan 2026 — no non-conformances raised", and save
**Then** the legislation entry compliance status updates to "COMPLIANT"
**And** the compliance dashboard increments the compliant count
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-HS-014: Set Review Date and Verify Reminder

**Given** a legislation entry "LEG-2602-0002" with no review date set
**When** I edit the entry and set Review Date "2026-03-01" (within 30 days)
**Then** the entry is saved with the review date
**And** the Legal Register list highlights the entry as "Due for Review Soon" (within 30-day threshold)
**And** the compliance dashboard shows a "Reviews Due" count that includes this entry
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-HS-015: Verify Compliance Dashboard Count

**Given** the Legal Register contains 10 entries: 6 COMPLIANT, 2 NON_COMPLIANT, 1 PARTIAL, 1 NOT_ASSESSED
**When** I navigate to the Health & Safety compliance dashboard
**Then** the Legal Compliance panel displays: Compliant: 6, Non-Compliant: 2, Partial: 1, Not Assessed: 1
**And** the overall compliance percentage is shown as 60% (6 of 10 fully compliant)
**And** the two NON_COMPLIANT entries are listed with a remediation prompt
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## OHS Objectives (5 scenarios)

### TC-HS-016: Create an OHS Objective with KPI Target

**Given** I am logged in as a Health & Safety Manager
**When** I navigate to Health & Safety > OHS Objectives and click "New Objective"
**And** I enter: Title "Reduce Lost-Time Injury Frequency Rate by 25%", ISO Clause "6.2.1", KPI "LTIFR", Target Value 3.0, Baseline Value 4.0, Target Date "2026-12-31", Responsible Person "H. Patel", Status "IN_PROGRESS"
**Then** the objective is created with reference "OBJ-2602-XXXX"
**And** the KPI target and baseline are saved on the record
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-HS-017: Add a Milestone to an OHS Objective

**Given** an OHS objective "OBJ-2602-0001" exists with status "IN_PROGRESS"
**When** I click "Add Milestone" and enter: Title "Q1 Review — implement toolbox talk programme", Due Date "2026-03-31", Assigned To "H. Patel"
**And** I add a second milestone: Title "Q2 Review — deploy near-miss reporting app", Due Date "2026-06-30", Assigned To "IT Team"
**Then** both milestones are saved and displayed on the objective detail page
**And** the milestones show individual status indicators (e.g. "PENDING")
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-HS-018: Update Progress Percentage on an Objective

**Given** an OHS objective "OBJ-2602-0001" with progress at 0%
**When** I click "Update Progress" and set Progress to 40 (%) with notes "Q1 toolbox talks completed; LTIFR currently 3.6"
**Then** the objective record updates to show progress 40%
**And** the progress bar on the objective dashboard reflects 40%
**And** the update timestamp is recorded
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-HS-019: Mark an OHS Objective as Complete

**Given** an OHS objective "OBJ-2602-0001" with progress at 100% and all milestones completed
**When** I change the status to "COMPLETE" and enter Completion Notes "LTIFR reduced from 4.0 to 2.8 — target of 3.0 exceeded"
**Then** the objective status updates to "COMPLETE" with a completion date recorded
**And** the objective moves to the "Completed" tab in the objectives list
**And** the KPI achieved value is stored alongside the original target
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-HS-020: Verify Dashboard Progress Bar for Objectives

**Given** three OHS objectives exist: one at 25%, one at 60%, one at 100% (COMPLETE)
**When** I navigate to the Health & Safety dashboard
**Then** the OHS Objectives panel displays a progress bar for each active objective
**And** the completed objective shows a "Completed" badge
**And** the overall objectives completion rate is shown (e.g. "1 of 3 complete")
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Actions / CAPA (5 scenarios)

### TC-HS-021: Raise a CAPA Action from an Incident

**Given** an incident "INC-2602-0001" exists with status "INVESTIGATING"
**When** I open the incident and click "Raise Action / CAPA"
**And** I enter: Title "Review and update housekeeping procedure for wet conditions", Type "CORRECTIVE_ACTION", Root Cause "Inadequate housekeeping schedule", Priority "HIGH", Assigned To "H. Patel", Due Date "2026-03-15", Source "INCIDENT", Source Reference "INC-2602-0001"
**Then** a CAPA record is created with reference "CAPA-2602-XXXX" and status "OPEN"
**And** the CAPA is linked to incident "INC-2602-0001"
**And** the incident detail view shows the linked CAPA reference
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-HS-022: Assign Owner to a CAPA Action

**Given** a CAPA "CAPA-2602-0001" exists with status "OPEN" and no owner assigned
**When** I edit the CAPA and set Assigned To "S. Williams (Facilities Manager)", and add an Assignment Note "Responsible for revising cleaning schedule and issuing updated procedure"
**Then** the CAPA record updates with the owner name
**And** the owner receives a notification (or the assignment is visible in their task list)
**And** the CAPA list displays the assigned owner column value
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-HS-023: Set and Confirm a CAPA Due Date

**Given** a CAPA "CAPA-2602-0001" with no due date set
**When** I edit the CAPA and set Due Date "2026-03-15" and save
**Then** the CAPA record shows the due date "2026-03-15"
**And** the CAPA list column "Due Date" displays "2026-03-15" for this record
**And** the record does not appear in the overdue list as the date is in the future
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-HS-024: Mark a CAPA as Overdue via a Past Due Date

**Given** a CAPA "CAPA-2602-0002" exists with Due Date "2026-01-01" (past) and status "OPEN"
**When** I navigate to the CAPA / Actions list
**Then** the CAPA is flagged with an "Overdue" indicator
**And** the overdue badge is shown in the list row for "CAPA-2602-0002"
**And** the CAPA remains accessible and editable despite being overdue
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-HS-025: Verify Overdue Count in the Dashboard

**Given** three CAPA records exist: "CAPA-2602-0002" (overdue, Due Date past), "CAPA-2602-0003" (due tomorrow), "CAPA-2602-0004" (due next month)
**When** I navigate to the Health & Safety dashboard
**Then** the Actions / CAPA panel displays Overdue Count: 1
**And** the overdue CAPA reference "CAPA-2602-0002" is listed or linked from the dashboard panel
**And** the total open actions count is 3
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
