# UAT Test Plan: Environment Module (ISO 14001:2015)

**Document ID:** UAT-ENV-001
**Version:** 1.0
**Date:** 2026-02-23
**Module:** Environment (ISO 14001:2015 / Aspects & Impacts / Environmental Events / Legal Compliance / Objectives / CAPA)
**Environment:** Staging (api-environment:4002 / web-environment:3002)
**Tester:** **\*\*\*\***\_\_\_\_**\*\*\*\***
**Sign-Off Date:** **\*\*\*\***\_\_\_\_**\*\*\*\***

---

## Environmental Aspects (5 scenarios)

### TC-ENV-001: Create Aspect with Significance Scoring

**Given** I am logged in as an Environmental Manager
**When** I navigate to Environment > Aspects and click "New Aspect"
**And** I fill in: Activity "Chemical storage area operations", Aspect "Potential soil contamination from chemical spillage", Impact "Land pollution and groundwater contamination", Severity 4, Probability 3, Duration 3, Extent 2, Reversibility 2, Regulatory 2, Stakeholder 1
**Then** the system calculates a significance score of 21.5 (4×1.5 + 3×1.5 + 3 + 2 + 2 + 2 + 1 = 21.5)
**And** the aspect is flagged as "SIGNIFICANT" (score ≥ 15)
**And** the record is created with reference "ENV-ASP-2602-XXXX"
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ENV-002: Verify Threshold — Non-Significant Aspect

**Given** I am creating a new environmental aspect
**When** I enter scoring values: Severity 1, Probability 1, Duration 1, Extent 1, Reversibility 1, Regulatory 1, Stakeholder 1
**Then** the calculated significance score is 7.0 (1×1.5 + 1×1.5 + 1 + 1 + 1 + 1 + 1 = 7.0)
**And** the aspect is classified as "NOT_SIGNIFICANT" (score < 15)
**And** the aspect record is saved without a significance flag
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ENV-003: Update Aspect Activity Description

**Given** an aspect "ENV-ASP-2602-0001" exists with Activity "Chemical storage area operations"
**When** I open the aspect and update the Activity field to "Bulk chemical storage and dispensing operations" and save
**Then** the aspect record displays the updated activity description
**And** the significance score and all other fields remain unchanged
**And** the record shows an updated timestamp
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ENV-004: Filter Aspects by Significance

**Given** the Aspects list contains 10 records: 6 SIGNIFICANT and 4 NOT_SIGNIFICANT
**When** I apply the filter Significance "SIGNIFICANT"
**Then** only the 6 significant aspects are shown in the list
**And** the record count updates to 6
**And** all displayed records show a "Significant" indicator badge
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ENV-005: View Significance Matrix

**Given** multiple aspects exist with varying severity and probability scores
**When** I navigate to the Significance Matrix view within the Aspects module
**Then** the matrix displays a grid with Severity on one axis and Probability on the other
**And** each cell shows the count of aspects at that severity/probability intersection
**And** cells with significance scores ≥ 15 are colour-coded to indicate high significance
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Environmental Events (5 scenarios)

### TC-ENV-006: Report a Spill Incident

**Given** I am logged in as an Environmental Officer
**When** I navigate to Environment > Events and click "Report Event"
**And** I fill in: Title "Hydraulic oil spill on workshop floor near drain", Type "SPILL", Date Occurred "2026-02-23", Location "Workshop Building B — Bay 4", Severity "MODERATE", Quantity Spilled "15 litres", Medium Affected "LAND", Description "Hydraulic line failed on press machine; oil pooled near floor drain — drain bunded prior to spread"
**Then** the event is created with reference "ENV-EVT-2602-XXXX" and status "NEW"
**And** the event appears in the events list with type "SPILL" and severity "MODERATE"
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ENV-007: Assign Responsible Person to an Event

**Given** an environmental event "ENV-EVT-2602-0001" exists with status "NEW" and no responsible person assigned
**When** I edit the event and set Responsible Person "A. Clarke (Environmental Officer)" and Assignment Notes "Oversee clean-up, arrange waste disposal, update spill log"
**Then** the event record updates with the responsible person
**And** the responsible person name is displayed in the events list
**And** the event remains in status "NEW" until manually advanced
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ENV-008: Transition Event Status NEW → INVESTIGATING → CLOSED

**Given** an event "ENV-EVT-2602-0001" exists with status "NEW"
**When** I set the status to "INVESTIGATING" and save
**Then** the event status updates to "INVESTIGATING"
**When** I then update the status to "CLOSED", enter Closure Notes "Spill contained and cleaned; 15 litres hydraulic oil disposed of as hazardous waste via licensed contractor; press machine hydraulic line replaced"
**Then** the event status changes to "CLOSED" with the closure notes and closed-date timestamp recorded
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ENV-009: Add Root Cause to an Environmental Event

**Given** an event "ENV-EVT-2602-0001" with status "INVESTIGATING"
**When** I click "Add Root Cause" and enter: Root Cause Category "EQUIPMENT_FAILURE", Root Cause Description "Hydraulic hose deterioration due to age and heat cycling — no scheduled inspection interval in place", Immediate Cause "Hose failure at coupling"
**Then** the root cause is saved on the event record
**And** the event detail page displays the root cause section with both fields populated
**And** the root cause is visible in the event summary panel
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ENV-010: Verify Event Log Completeness

**Given** three environmental events have been created and progressed through various statuses
**When** I navigate to the Environmental Events list and select "All Statuses"
**Then** all three events are listed with their reference numbers, titles, types, statuses, and responsible persons
**And** the event log can be exported or printed for regulatory inspection purposes
**And** events can be sorted by date occurred in descending order
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Legal Compliance (5 scenarios)

### TC-ENV-011: Add a Permit Requirement

**Given** I am logged in as an Environmental Manager
**When** I navigate to Environment > Legal Compliance and click "Add Requirement"
**And** I enter: Title "Environmental Permit — Solvent Emissions to Air", Permit Number "EP/2024/00347", Regulatory Body "Environment Agency", Category "PERMIT", Condition "Total annual solvent emissions must not exceed 5 tonnes/year", Responsible Person "A. Clarke", Expiry Date "2027-06-30"
**Then** the permit requirement is created with reference "ENV-LEG-2602-XXXX" and status "NOT_ASSESSED"
**And** the entry appears in the Legal Compliance register list
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ENV-012: Set Expiry Date and Confirm Storage

**Given** a legal compliance entry "ENV-LEG-2602-0001" already exists
**When** I edit the entry and update Expiry Date to "2027-06-30" and Review Date to "2027-05-01" and save
**Then** the record stores both the expiry date "2027-06-30" and the review date "2027-05-01"
**And** the compliance list displays the expiry date column for "ENV-LEG-2602-0001"
**And** the entry does not appear as overdue since both dates are in the future
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ENV-013: Mark a Requirement as Compliant

**Given** a compliance entry "ENV-LEG-2602-0001" with status "NOT_ASSESSED"
**When** I click "Update Compliance", set Status to "COMPLIANT", enter Evidence "Annual solvent usage report for 2025 confirms 3.2 tonnes — within 5-tonne permit limit", Assessed By "A. Clarke", Assessment Date "2026-02-23"
**Then** the entry status updates to "COMPLIANT"
**And** the compliance register dashboard increments the compliant count by one
**And** the assessment evidence and assessed-by fields are stored on the record
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ENV-014: Trigger Review Reminder for Expiring Permit

**Given** a compliance entry "ENV-LEG-2602-0002" with Expiry Date "2026-03-15" (within 30 days)
**When** I navigate to the Legal Compliance list
**Then** the entry is flagged with a "Expiring Soon" or "Review Due" indicator
**And** the compliance dashboard shows a "Permits Expiring in 30 Days" count that includes this entry
**And** the entry can be filtered using a "Expiring Soon" quick-filter
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ENV-015: Verify Compliance Register Summary

**Given** the Legal Compliance register contains 8 entries: 5 COMPLIANT, 2 NON_COMPLIANT, 1 NOT_ASSESSED
**When** I navigate to the Environment compliance dashboard or register summary
**Then** the register panel displays: Compliant: 5, Non-Compliant: 2, Not Assessed: 1
**And** the overall compliance rate is shown as 62.5% (5 of 8 compliant)
**And** the two NON_COMPLIANT entries are highlighted with a remediation prompt
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Environmental Objectives (5 scenarios)

### TC-ENV-016: Create a CO2 Reduction Target Objective

**Given** I am logged in as an Environmental Manager
**When** I navigate to Environment > Objectives and click "New Objective"
**And** I enter: Title "Reduce Scope 1 & 2 CO2 emissions by 10% by 2027", ISO Clause "6.2.1", KPI "tCO2e/year", Baseline Value 500, Target Value 450, Target Date "2027-12-31", Responsible Person "A. Clarke", Status "IN_PROGRESS"
**Then** the objective is created with reference "ENV-OBJ-2602-XXXX"
**And** the reduction target is expressed as 50 tCO2e (10% of baseline 500)
**And** the objective appears in the objectives list with status "IN_PROGRESS"
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ENV-017: Add a Milestone to an Environmental Objective

**Given** an objective "ENV-OBJ-2602-0001" exists with status "IN_PROGRESS"
**When** I click "Add Milestone" and enter: Title "Install LED lighting across all production buildings — estimated saving 25 tCO2e/year", Due Date "2026-06-30", Assigned To "Facilities Team"
**And** I add a second milestone: Title "Switch company fleet to electric vehicles (5 vehicles) — estimated saving 12 tCO2e/year", Due Date "2026-12-31", Assigned To "Fleet Manager"
**Then** both milestones are saved and displayed on the objective detail page
**And** each milestone shows status "PENDING" and the assigned person
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ENV-018: Update Progress on an Environmental Objective

**Given** an objective "ENV-OBJ-2602-0001" with progress at 0%
**When** I click "Update Progress" and set Progress to 30 (%) with notes "LED lighting installation complete in Building A and B — current emissions 485 tCO2e vs. 500 baseline"
**Then** the objective record updates to show progress 30%
**And** the progress bar on the objectives dashboard reflects 30%
**And** the current achieved value (485 tCO2e) is recorded alongside the target (450 tCO2e)
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ENV-019: Link an Objective to an Environmental Aspect

**Given** an objective "ENV-OBJ-2602-0001" and an aspect "ENV-ASP-2602-0001" (significant) both exist
**When** I open the objective and click "Link Aspect" and select "ENV-ASP-2602-0001"
**Then** the objective detail page shows the linked aspect reference and aspect title
**And** the aspect detail page displays the linked objective "ENV-OBJ-2602-0001"
**And** the linkage supports traceability from significant aspect to its associated improvement objective
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ENV-020: View Environmental Objectives Progress Dashboard

**Given** three objectives exist: "ENV-OBJ-2602-0001" at 30%, "ENV-OBJ-2602-0002" at 75%, "ENV-OBJ-2602-0003" at 100% (COMPLETE)
**When** I navigate to the Environment dashboard
**Then** the Objectives panel displays a progress bar for each objective showing current completion percentage
**And** "ENV-OBJ-2602-0003" shows a "Completed" badge
**And** the dashboard summary shows overall objectives status: "1 of 3 complete, 2 in progress"
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## CAPA (5 scenarios)

### TC-ENV-021: Create a Corrective Action from an Environmental Event

**Given** an environmental event "ENV-EVT-2602-0001" exists with status "INVESTIGATING"
**When** I open the event and click "Raise CAPA"
**And** I enter: Title "Implement hydraulic hose inspection and replacement programme", Type "CORRECTIVE_ACTION", Root Cause "No preventive maintenance schedule for hydraulic hoses on press machines", Priority "HIGH", Assigned To "Maintenance Team Lead", Due Date "2026-04-30", Source "EVENT", Source Reference "ENV-EVT-2602-0001"
**Then** a CAPA record is created with reference "ENV-CAP-2602-XXXX" and status "OPEN"
**And** the CAPA is linked to event "ENV-EVT-2602-0001"
**And** the event detail view shows the linked CAPA reference
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ENV-022: Assign CAPA to a Team

**Given** a CAPA "ENV-CAP-2602-0001" exists with status "OPEN" and no team assigned
**When** I edit the CAPA and set Team "Environmental & Maintenance Cross-Functional Team", Lead Assignee "A. Clarke", and add Team Members ["T. Singh (Maintenance)", "R. Patel (EHS)"]
**Then** the CAPA record updates with the team and lead assignee
**And** the team assignment is displayed on the CAPA detail view
**And** the CAPA list shows the lead assignee name for this record
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ENV-023: Link a CAPA to an Environmental Aspect

**Given** a CAPA "ENV-CAP-2602-0001" and an aspect "ENV-ASP-2602-0001" both exist
**When** I open the CAPA and click "Link Aspect" and select "ENV-ASP-2602-0001"
**Then** the CAPA detail page shows the linked aspect reference "ENV-ASP-2602-0001" and its title
**And** the aspect detail page shows the CAPA "ENV-CAP-2602-0001" listed under linked corrective actions
**And** the linkage is maintained when either record is subsequently edited
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ENV-024: Verify CAPA Completion Workflow

**Given** a CAPA "ENV-CAP-2602-0001" with status "OPEN" and all actions completed by the assigned team
**When** I click "Mark Complete", enter Completion Notes "Hydraulic hose inspection schedule implemented — all hoses rated >3 years replaced; quarterly inspection intervals added to PM schedule", Completion Date "2026-04-28", Verified By "A. Clarke"
**Then** the CAPA status changes to "CLOSED"
**And** the completion date and verified-by fields are stored on the record
**And** the CAPA moves to the "Closed" tab in the CAPA list
**And** the linked event "ENV-EVT-2602-0001" shows the associated CAPA as closed
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ENV-025: Confirm 404 Response After CAPA Delete

**Given** a CAPA "ENV-CAP-2602-0002" exists and has been deleted via the delete action (soft or hard delete)
**When** I attempt to navigate directly to the CAPA detail URL for "ENV-CAP-2602-0002"
**Then** the application returns a 404 "Not Found" response or displays a "Record not found" message
**And** the CAPA no longer appears in the CAPA list under any status filter
**And** any linked event or aspect no longer shows "ENV-CAP-2602-0002" as an active linked record
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Sign-Off

| Role                  | Name | Signature | Date |
| --------------------- | ---- | --------- | ---- |
| Environmental Manager |      |           |      |
| Product Owner         |      |           |      |
| UAT Lead              |      |           |      |
| Regulatory/Compliance |      |           |      |

**Overall Result:** [ ] PASS -- All scenarios passed / [ ] FAIL -- See notes above
**Release Recommendation:** [ ] Approved for Production / [ ] Requires remediation
