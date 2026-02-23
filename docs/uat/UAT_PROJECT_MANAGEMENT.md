# UAT Test Plan: Project Management Module (PMBOK/ISO 21502)

**Document ID:** UAT-PM-001
**Version:** 1.0
**Date:** 2026-02-23
**Module:** Project Management (PMBOK/ISO 21502)
**Environment:** Staging (api-project-management:4009 / web-project-management:3009)
**Tester:** ****************\_\_\_\_****************
**Sign-Off Date:** ****************\_\_\_\_****************

---

## Project Lifecycle (5 scenarios)

### TC-PM-001: Create Project in PLANNING Status

**Given** I am logged in as a Project Manager
**When** I navigate to Project Management > Projects and click "New Project"
**And** I enter: Name "ISO 9001:2015 Re-certification 2026", Description "Triennial re-certification audit preparation", Start Date "2026-03-01", End Date "2026-09-30", Budget "45000", Priority "HIGH"
**Then** the system creates the project with reference "PRJ-2602-XXXX" and status "PLANNING"
**And** the project dashboard displays with zero tasks, zero milestones, and £0 spent
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-PM-002: Add Team Members with Roles

**Given** a project "PRJ-2602-0001" in PLANNING status
**When** I navigate to the Team tab and click "Add Member"
**And** I add: "A. Okonkwo" as Role "Project Manager", "B. Ferreira" as Role "Quality Lead", "C. Tanaka" as Role "Internal Auditor", "D. Singh" as Role "Document Controller"
**Then** all four team members are saved against the project
**And** each member is shown with their role and join date
**And** the team count on the project dashboard updates to 4
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-PM-003: Advance Project to ACTIVE Status

**Given** a project "PRJ-2602-0001" in PLANNING status with team members assigned
**When** I click "Start Project" and confirm the status change
**Then** the project status changes to "ACTIVE" with the actual start date recorded
**And** team members receive a notification that the project is now active
**And** the project appears in the "Active Projects" dashboard view
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-PM-004: View Project Dashboard (Tasks, Milestones, Budget)

**Given** an ACTIVE project "PRJ-2602-0001" with tasks, milestones, and budget transactions recorded
**When** I open the project and view the Dashboard tab
**Then** I see: total tasks count with breakdown by status (TODO/IN_PROGRESS/DONE/BLOCKED), milestone completion percentage, budget spent vs. total budget with percentage consumed, and a project health RAG indicator
**And** the dashboard data refreshes on page load
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-PM-005: Close Project with Completion Notes

**Given** an ACTIVE project "PRJ-2602-0001" with all tasks completed and milestones achieved
**When** I click "Close Project"
**And** I enter completion notes "Re-certification audit successful — certificate issued 2026-09-15. All 23 action items resolved." and actual end date "2026-09-20"
**Then** the project status changes to "CLOSED" with the closure date and notes recorded
**And** the project no longer appears in the Active Projects view
**And** it is accessible via the Closed Projects filter
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Task Management (5 scenarios)

### TC-PM-006: Create Task with Assignee and Due Date

**Given** an ACTIVE project "PRJ-2602-0001"
**When** I navigate to the Tasks tab and click "Add Task"
**And** I enter: Title "Conduct gap analysis against ISO 9001 Clause 8", Assignee "B. Ferreira", Due Date "2026-04-15", Priority "HIGH", Estimated Hours "16"
**Then** the task is created with reference "TASK-2602-XXXX" and status "TODO"
**And** "B. Ferreira" receives a task assignment notification
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-PM-007: Update Task Progress Percentage

**Given** a task "TASK-2602-0001" with status "TODO" assigned to me
**When** I open the task and update Progress to "60%" and change status to "IN_PROGRESS"
**And** I add a progress note "Gap analysis complete for Clauses 4–7; Clauses 8–10 in progress"
**Then** the task displays 60% progress with the progress note and last-updated timestamp
**And** the project dashboard task progress bar updates accordingly
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-PM-008: Mark Task as BLOCKED with Blocker Description

**Given** a task "TASK-2602-0002" in status "IN_PROGRESS"
**When** I change the task status to "BLOCKED"
**And** I enter blocker description "Waiting for external consultant report — expected 2026-05-01"
**Then** the task status changes to "BLOCKED" with the blocker description recorded
**And** the project dashboard shows a blocked task count of at least 1
**And** the Project Manager receives a notification of the blocked task
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-PM-009: Complete Task

**Given** a task "TASK-2602-0001" in status "IN_PROGRESS" assigned to me
**When** I update progress to 100%, change status to "DONE", and enter actual hours "14"
**Then** the task status changes to "DONE" with completion date, actual hours, and completing user recorded
**And** the project dashboard task completion count increments
**And** if the task is linked to a milestone, the milestone progress is recalculated
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-PM-010: View Gantt / Timeline View

**Given** an ACTIVE project with at least 5 tasks having start and due dates defined
**When** I navigate to the Tasks tab and click "Gantt View"
**Then** a horizontal bar chart is displayed showing each task as a bar spanning its start-to-due-date range
**And** DONE tasks appear in green, IN_PROGRESS in blue, BLOCKED in red, and TODO in grey
**And** the today-line marker is visible on the chart
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Milestones (5 scenarios)

### TC-PM-011: Create Milestone with Target Date

**Given** an ACTIVE project "PRJ-2602-0001"
**When** I navigate to the Milestones tab and click "Add Milestone"
**And** I enter: Name "Gap Analysis Complete", Target Date "2026-04-30", Description "All clause-by-clause gap findings documented and reviewed"
**Then** the milestone is created with reference "MS-2602-XXXX" and status "ON_TRACK"
**And** the milestone appears on the project timeline
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-PM-012: Link Tasks to Milestone

**Given** milestone "MS-2602-0001" and tasks "TASK-2602-0001", "TASK-2602-0002" exist in the same project
**When** I open the milestone and click "Link Tasks"
**And** I select both tasks to link to the milestone
**Then** both tasks are listed under the milestone
**And** the milestone progress percentage is calculated based on the completion status of linked tasks
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-PM-013: Mark Milestone At Risk (Amber Status)

**Given** milestone "MS-2602-0001" with target date "2026-04-30" and two linked tasks, one of which is BLOCKED
**When** I open the milestone and change status to "AT_RISK"
**And** I enter risk note "Task TASK-2602-0002 blocked pending consultant report; target date may slip by 1 week"
**Then** the milestone status changes to "AT_RISK" and displays amber in the project timeline
**And** the Project Manager and Sponsor receive a milestone-at-risk notification
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-PM-014: Complete Milestone

**Given** milestone "MS-2602-0001" with all linked tasks in DONE status
**When** I open the milestone and click "Mark Complete"
**And** I enter actual completion date "2026-04-28" and notes "Delivered 2 days ahead of schedule"
**Then** the milestone status changes to "COMPLETED" with the actual date and notes recorded
**And** the project dashboard milestone completion counter increments
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-PM-015: View Milestone History on Project Timeline

**Given** a project with multiple milestones in various statuses (COMPLETED, AT_RISK, ON_TRACK)
**When** I navigate to the project Timeline view
**Then** all milestones are displayed as diamond markers on the timeline at their target dates
**And** completed milestones show actual vs. planned dates
**And** AT_RISK milestones are highlighted in amber and COMPLETED in green
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Risks & Issues (5 scenarios)

### TC-PM-016: Log Project Risk with Probability and Impact

**Given** an ACTIVE project "PRJ-2602-0001"
**When** I navigate to the Risks tab and click "Add Risk"
**And** I enter: Title "Auditor availability conflict in September", Description "Lead auditor may be unavailable during planned certification window", Probability "MEDIUM", Impact "HIGH", Owner "A. Okonkwo", Response Strategy "MITIGATE"
**Then** the risk is created with reference "RISK-2602-XXXX" and risk score calculated (Probability × Impact)
**And** the risk appears in the Risk Register with RAG status
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-PM-017: Add Mitigation Action to Risk

**Given** project risk "RISK-2602-0001" with response strategy "MITIGATE"
**When** I open the risk and click "Add Mitigation Action"
**And** I enter: Action "Confirm auditor availability and identify backup auditor by March 15", Owner "A. Okonkwo", Due Date "2026-03-15"
**Then** the mitigation action is linked to the risk
**And** the risk detail view shows the mitigation action with owner and due date
**And** the risk status updates to "MITIGATING"
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-PM-018: Raise Project Issue

**Given** an ACTIVE project "PRJ-2602-0001"
**When** I navigate to the Issues tab and click "Add Issue"
**And** I enter: Title "Document management system unavailable", Description "DMS portal returned 503 errors preventing document uploads for past 48 hours", Priority "HIGH", Owner "C. Tanaka", Due Date "2026-03-10"
**Then** the issue is created with reference "ISS-2602-XXXX" and status "OPEN"
**And** the Project Manager receives an issue notification
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-PM-019: Link Issue to Risk

**Given** project issue "ISS-2602-0001" and risk "RISK-2602-0001" exist in the same project
**When** I open the issue and click "Link to Risk"
**And** I select risk "RISK-2602-0001" as the related risk
**Then** the issue record shows the linked risk reference
**And** the risk record shows the linked issue reference
**And** the traceability between the two is visible in the project Risk/Issue register view
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-PM-020: View Risk/Issue Register with RAG Status

**Given** a project with multiple risks and issues at various severity/priority levels
**When** I navigate to the Risk/Issue Register combined view
**Then** each risk and issue is displayed with its RAG indicator: RED for HIGH/CRITICAL, AMBER for MEDIUM, GREEN for LOW
**And** I can filter to show only RED items
**And** I can export the register to PDF or CSV
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Resources & Reporting (5 scenarios)

### TC-PM-021: Assign Resource with Allocation Percentage

**Given** an ACTIVE project "PRJ-2602-0001" with team member "B. Ferreira"
**When** I navigate to the Resources tab and open "B. Ferreira"
**And** I set Allocation "60%" for the period "2026-03-01" to "2026-06-30"
**Then** the resource allocation is recorded with the percentage and date range
**And** the system warns if the total allocation for "B. Ferreira" across all projects exceeds 100%
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-PM-022: View Resource Utilisation Across Projects

**Given** team member "B. Ferreira" is allocated across three active projects
**When** I navigate to Project Management > Resources > Utilisation Report
**And** I search for "B. Ferreira" over the next 3 months
**Then** a utilisation chart shows the total allocation percentage per week/month across all projects
**And** over-allocated periods (>100%) are highlighted in red
**And** the report shows remaining available capacity
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-PM-023: Log Timesheet Against Project

**Given** an ACTIVE project "PRJ-2602-0001" and task "TASK-2602-0001" assigned to me
**When** I navigate to My Timesheets and click "Log Time"
**And** I enter: Project "PRJ-2602-0001", Task "TASK-2602-0001", Date "2026-03-05", Hours "4.5", Description "Conducted Clause 8 gap analysis interviews"
**Then** the timesheet entry is saved and linked to the project and task
**And** the task's actual hours update accordingly
**And** the project's total logged hours increase by 4.5
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-PM-024: Generate Project Status Report

**Given** an ACTIVE project "PRJ-2602-0001" with tasks, milestones, risks, and budget data
**When** I navigate to the project Reports tab and click "Generate Status Report"
**And** I select format "PDF" and reporting period "This Month"
**Then** a PDF report is generated containing: project summary, % complete, milestone status table, task summary by status, top risks, budget vs. actuals, and overall RAG status
**And** the report can be downloaded and its filename includes the project reference and date
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-PM-025: View Earned Value Metrics (SPI and CPI)

**Given** an ACTIVE project with planned value (PV), earned value (EV), and actual cost (AC) data entered
**When** I navigate to the project Dashboard and open the "Earned Value" panel
**Then** the Schedule Performance Index (SPI = EV / PV) is displayed
**And** the Cost Performance Index (CPI = EV / AC) is displayed
**And** SPI < 1.0 is shown in red (behind schedule), SPI >= 1.0 in green (on or ahead of schedule)
**And** CPI < 1.0 is shown in red (over budget), CPI >= 1.0 in green (on or under budget)
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Sign-Off

| Role                  | Name | Signature | Date |
| --------------------- | ---- | --------- | ---- |
| QA Manager            |      |           |      |
| Product Owner         |      |           |      |
| UAT Lead              |      |           |      |
| Regulatory/Compliance |      |           |      |

**Overall Result:** [ ] PASS -- All scenarios passed / [ ] FAIL -- See notes above
**Release Recommendation:** [ ] Approved for Production / [ ] Requires remediation
