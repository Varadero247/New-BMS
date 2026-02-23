# UAT Test Plan: Quality Management Module (ISO 9001:2015)

**Document ID:** UAT-QUAL-001
**Version:** 1.0
**Date:** 2026-02-23
**Module:** Quality Management (ISO 9001:2015)
**Environment:** Staging (api-quality:4003 / web-quality:3003)
**Tester:** **\*\*\*\***\_\_\_\_**\*\*\*\***
**Sign-Off Date:** **\*\*\*\***\_\_\_\_**\*\*\*\***

---

## Document Control (5 scenarios)

### TC-QUAL-001: Create Controlled Document

**Given** I am logged in as a Document Controller
**When** I navigate to Quality > Document Control and click "New Document"
**And** I fill in: Title "Incoming Inspection Procedure", Type "PROCEDURE", Owner "Quality Manager", Department "Quality", Applicable Standard "ISO 9001:2015 Clause 8.6", Description "Defines inspection activities for incoming materials"
**Then** the system creates the document with status "DRAFT" and reference "DOC-QUAL-2026-001"
**And** the document version is set to "1.0" with the creation date recorded
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-QUAL-002: Submit Document for Approval

**Given** a controlled document "DOC-QUAL-2026-001" exists in status "DRAFT"
**When** I click "Submit for Approval" and select Approver "QA Director", add review notes "Please review against current inspection criteria"
**Then** the document status changes from "DRAFT" to "PENDING_APPROVAL"
**And** the approver receives a notification and the document appears in their approval queue
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-QUAL-003: Approve Document (DRAFT to APPROVED)

**Given** a document "DOC-QUAL-2026-001" is in "PENDING_APPROVAL" status and I am the designated approver
**When** I open the document, review its content, enter Approval Comments "Document meets ISO 9001:2015 requirements", and click "Approve"
**Then** the document status changes to "APPROVED" with the approval date and approver name recorded
**And** the document becomes active and visible to all users with read access
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-QUAL-004: Issue New Version (APPROVED to ARCHIVED plus new DRAFT)

**Given** an "APPROVED" document "DOC-QUAL-2026-001" at version "1.0"
**When** I click "Issue New Version" and enter Change Reason "Updated sampling frequency per customer requirement CR-2026-045"
**Then** the current version "1.0" is archived with status "ARCHIVED" and the archival date recorded
**And** a new document version "2.0" is created with status "DRAFT" retaining all previous content
**And** the version history table shows both versions
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-QUAL-005: Verify Read-Receipt Required

**Given** an "APPROVED" document "DOC-QUAL-2026-001" with "Read Receipt Required" flag enabled
**When** a user accesses the document for the first time
**Then** the system prompts the user to acknowledge they have read and understood the document
**And** upon confirmation the acknowledgement is recorded with the user name, date, and time
**And** the document's acknowledgement list shows the user as "READ"
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## CAPA Management (5 scenarios)

### TC-QUAL-006: Raise CAPA from Nonconformance

**Given** a nonconformance record "NC-2026-012" exists with disposition "REWORK"
**When** I navigate to CAPA and click "New CAPA" linking it to NC-2026-012
**And** I fill in: Title "Dimension out-of-tolerance on shaft bore", Type "CORRECTIVE", Source "NONCONFORMANCE", Priority "HIGH", Responsible Person "R. Patel", Target Close Date "2026-03-31"
**Then** the system creates the CAPA with reference "CAPA-2026-NNN" and status "OPEN"
**And** the linked nonconformance "NC-2026-012" shows the associated CAPA reference
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-QUAL-007: Complete Root Cause Analysis (5-Why)

**Given** a CAPA "CAPA-2026-001" exists in status "OPEN" with no root cause recorded
**When** I open the CAPA and complete the 5-Why analysis: Why 1 "Shaft bore oversized", Why 2 "CNC program parameter incorrect", Why 3 "ECN change not communicated to CNC team", Why 4 "Change control process not followed", Why 5 (Root Cause) "No mandatory sign-off step in ECN workflow"
**Then** all five Why levels are saved with the root cause flag set on Why 5
**And** the CAPA status changes to "ROOT_CAUSE_IDENTIFIED"
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-QUAL-008: Assign Corrective Action

**Given** a CAPA "CAPA-2026-001" with root cause identified as "No mandatory sign-off step in ECN workflow"
**When** I add a corrective action: Description "Add mandatory CNC team lead sign-off step to ECN change workflow", Assigned To "Workflow Administrator", Due Date "2026-03-15", Action Type "CORRECTIVE"
**Then** the corrective action is saved and linked to the CAPA
**And** the assigned person receives a task notification with the due date
**And** the CAPA shows action status "IN_PROGRESS"
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-QUAL-009: Verify Effectiveness Check Due Date

**Given** a CAPA "CAPA-2026-001" with all corrective actions completed
**When** I mark the CAPA as "ACTIONS_COMPLETE" and set the Effectiveness Check Date to "2026-06-30" with Effectiveness Criteria "Zero recurrence of dimension nonconformances on shaft bore for 90 days"
**Then** the effectiveness check date and criteria are saved on the CAPA record
**And** the CAPA status changes to "AWAITING_EFFECTIVENESS_CHECK"
**And** a reminder is scheduled for the effectiveness check date
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-QUAL-010: Close CAPA with Evidence

**Given** a CAPA "CAPA-2026-001" in "AWAITING_EFFECTIVENESS_CHECK" status with effectiveness check date reached
**When** I open the CAPA, upload evidence document "ECN-Workflow-Updated-v2.pdf", enter Effectiveness Outcome "No recurrence observed over 90-day monitoring period — 0 nonconformances on shaft bore", and click "Close CAPA"
**Then** the CAPA status changes to "CLOSED" with the closure date recorded
**And** the evidence document is attached and visible in the CAPA record
**And** the linked nonconformance "NC-2026-012" is updated to reflect CAPA closure
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Nonconformances (5 scenarios)

### TC-QUAL-011: Record Product Nonconformance with Reference Number

**Given** I am logged in as a Quality Inspector
**When** I navigate to Quality > Nonconformances and click "New NC"
**And** I fill in: Type "PRODUCT", Title "Surface roughness exceeds Ra 1.6 on bearing seat", Product "Camshaft Assembly CA-7700", Batch Number "BATCH-2026-0441", Quantity Affected 25, Detected By "Incoming Inspection", Detection Date "2026-02-23"
**Then** the system creates the record with reference "NC-2026-NNN" in format NC-YYYY-NNN
**And** the status is set to "OPEN" and the record is visible in the NC register
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-QUAL-012: Link Nonconformance to Process

**Given** a nonconformance "NC-2026-015" exists for a product defect
**When** I edit the record and link it to Process "CNC Turning — Camshaft Bearing Seat" and ISO Clause "8.7 Control of Nonconforming Outputs"
**Then** the process reference and ISO clause are saved on the NC record
**And** the NC appears in the process-filtered view for "CNC Turning"
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-QUAL-013: Assign Disposition (REWORK, REJECT, CONCESSION)

**Given** a nonconformance "NC-2026-015" in status "OPEN" with 25 affected units
**When** I set the Disposition to "REWORK", enter Disposition Notes "Re-machine bearing seat to specification — Ra target 1.2", Authorised By "Quality Manager", Disposition Date "2026-02-24"
**Then** the disposition is saved and the NC status changes to "DISPOSITION_SET"
**And** the disposition type "REWORK" is displayed prominently on the NC detail page
**And** the total units dispositioned is shown as 25
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-QUAL-014: Verify NC Statistics in Dashboard

**Given** at least 10 nonconformances exist across statuses OPEN, DISPOSITION_SET, and CLOSED this month
**When** I navigate to the Quality Dashboard
**Then** I see the total NC count by status (OPEN, IN_PROGRESS, CLOSED) for the current period
**And** I see a breakdown by Type (PRODUCT, PROCESS, SYSTEM)
**And** the top 3 defect categories are displayed by frequency
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-QUAL-015: Filter Nonconformances by Status

**Given** multiple nonconformances exist with statuses OPEN, DISPOSITION_SET, AWAITING_CAPA, and CLOSED
**When** I apply the filter Status "OPEN" on the NC register page
**Then** only nonconformances with status "OPEN" are displayed in the list
**And** the record count reflects the filtered result
**And** clearing the filter restores all records
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Audits (5 scenarios)

### TC-QUAL-016: Schedule Internal Audit

**Given** I am logged in as an Audit Manager
**When** I navigate to Quality > Audits and click "New Audit"
**And** I fill in: Title "ISO 9001 Clause 8 Internal Audit", Type "INTERNAL", Scope "Manufacturing — Clauses 8.1 to 8.7", Lead Auditor "A. Thompson", Audit Team ["B. Singh", "C. Novak"], Planned Start "2026-03-10", Planned End "2026-03-12", Department "Manufacturing"
**Then** the audit is created with reference "AUD-2026-NNN" and status "PLANNED"
**And** the lead auditor and team members receive notifications of the scheduled audit
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-QUAL-017: Add Audit Checklist

**Given** an audit "AUD-2026-001" in status "PLANNED"
**When** I open the audit and add checklist items: "8.1 — Are operational planning criteria defined?", "8.2.1 — Is customer communication process documented?", "8.4.1 — Are supplier controls in place?", "8.5.1 — Are production controls defined?", "8.7 — Is nonconforming output process followed?"
**Then** all 5 checklist items are saved linked to the audit
**And** each checklist item has status "NOT_STARTED"
**And** the audit shows 5 checklist items in the summary
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-QUAL-018: Record Audit Findings (Major, Minor, Observation)

**Given** an audit "AUD-2026-001" in status "IN_PROGRESS"
**When** I add three findings:
  - Finding 1: Type "MAJOR", Clause "8.7", Description "No documented procedure for disposition of nonconforming product — systemic gap across 3 cells"
  - Finding 2: Type "MINOR", Clause "8.5.1", Description "Work instruction for Cell 4 not at revision level — Rev B displayed, Rev C current"
  - Finding 3: Type "OBSERVATION", Clause "8.4.1", Description "Supplier performance scorecard not yet completed for Q4 2025"
**Then** all three findings are saved with the correct types and linked to the audit
**And** the audit summary shows 1 major, 1 minor, and 1 observation
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-QUAL-019: Generate Audit Report

**Given** an audit "AUD-2026-001" with status "IN_PROGRESS" and at least 3 findings recorded
**When** I click "Generate Audit Report"
**Then** a report is generated containing: audit scope, lead auditor, dates, list of clauses audited, findings summary (major/minor/observations count), and individual finding details
**And** the report is accessible as a downloadable document or view within the system
**And** the audit status changes to "REPORT_ISSUED"
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-QUAL-020: Close Audit with Actions

**Given** an audit "AUD-2026-001" in status "REPORT_ISSUED" with 2 open findings requiring corrective action
**When** I assign corrective actions: Finding 1 linked to new CAPA "CAPA-2026-010", Finding 2 assigned to "Cell 4 Supervisor" with due date "2026-03-20"
**And** I click "Close Audit" with Closure Notes "All findings addressed; follow-up scheduled at next management review"
**Then** the audit status changes to "CLOSED" with closure date recorded
**And** the linked CAPA "CAPA-2026-010" is visible in both the audit record and the CAPA register
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Objectives and KPIs (5 scenarios)

### TC-QUAL-021: Create Quality Objective with Measurable Target

**Given** I am logged in as Quality Manager
**When** I navigate to Quality > Objectives and click "New Objective"
**And** I fill in: Title "Reduce Customer PPM to below 50 by year-end", ISO Clause "6.2 Quality Objectives", Owner "Quality Director", Baseline "120 PPM (2025 average)", Target "50 PPM", Target Date "2026-12-31", Measurement Method "Monthly customer PPM reports", Review Frequency "QUARTERLY"
**Then** the objective is created with reference "OBJ-QUAL-2026-NNN" and status "ACTIVE"
**And** the target of 50 PPM and baseline of 120 PPM are displayed on the objective detail page
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-QUAL-022: Add Sub-Targets per Quarter

**Given** a quality objective "OBJ-QUAL-2026-001" with annual target of 50 PPM
**When** I add four quarterly sub-targets: Q1 "100 PPM by 2026-03-31", Q2 "80 PPM by 2026-06-30", Q3 "65 PPM by 2026-09-30", Q4 "50 PPM by 2026-12-31"
**Then** all four sub-targets are saved and linked to the objective
**And** the objective detail view shows a quarterly breakdown table with each milestone
**And** each sub-target has status "PENDING"
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-QUAL-023: Update Progress Percentage

**Given** a quality objective "OBJ-QUAL-2026-001" with Q1 sub-target "100 PPM by 2026-03-31"
**When** I update the objective progress: Current Value "95 PPM", Progress "25%", Update Notes "Q1 improvement driven by incoming inspection enhancements — Pareto shows top 3 defect types reduced by 40%"
**Then** the progress percentage updates to 25% on the objective record
**And** the Q1 sub-target status changes to "ACHIEVED"
**And** the objective progress bar reflects 25% completion
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-QUAL-024: Link Objective to Process

**Given** a quality objective "OBJ-QUAL-2026-001" targeting customer PPM reduction
**When** I edit the objective and link it to Processes: "Incoming Inspection", "Final Inspection", "Customer Returns Handling"
**Then** all three process links are saved on the objective record
**And** each linked process shows the objective reference in its process detail view
**And** filtering objectives by Process "Incoming Inspection" returns this objective
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-QUAL-025: Verify Objectives Dashboard

**Given** at least 5 quality objectives exist with varying progress percentages and statuses
**When** I navigate to the Quality Objectives Dashboard
**Then** I see all active objectives displayed with their progress bars and current vs. target values
**And** objectives exceeding their milestone date without achieving the target are highlighted in amber or red
**And** I can filter objectives by Owner, Status, and ISO Clause
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
