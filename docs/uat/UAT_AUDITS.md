# UAT Test Plan: Audit Management Module

---
> **CONFIDENTIAL — TRADE SECRET**
> This document is the property of Nexara DMCC and contains confidential and
> proprietary information. Unauthorised disclosure is prohibited.
> © 2026 Nexara DMCC. All rights reserved.
---


**Document ID:** UAT-AUD-001
**Version:** 1.0
**Date:** 2026-02-23
**Module:** Audit Management
**Environment:** Staging (api-audits:4037 / web-audits:3042)
**Tester:** **\*\*\*\***\_\_\_\_**\*\*\*\***
**Sign-Off Date:** **\*\*\*\***\_\_\_\_**\*\*\*\***

---

## Audit Planning (5 scenarios)

### TC-AUD-001: Create Audit Programme (Annual Schedule)

**Given** I am logged in as a Quality Manager
**When** I navigate to Audits > Programmes and click "New Programme"
**And** I enter: Programme Name "FY2026 Internal Audit Programme", Year "2026", Standard "ISO 9001:2015", Owner "K. Williams", Description "Annual internal audit schedule covering all ISO 9001 clauses"
**Then** the programme is created with reference "PROG-2026-XXXX" and status "PLANNED"
**And** it appears in the audit programme list
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AUD-002: Add Audit to Programme (AUD-YYYY-NNN Reference)

**Given** an audit programme "PROG-2026-0001" exists in PLANNED status
**When** I click "Add Audit" and enter: Audit Title "Q1 Internal Audit — Operations", Programme "PROG-2026-0001", Audit Type "INTERNAL", Scheduled Start "2026-03-10", Scheduled End "2026-03-12", Scope "Operations department processes — manufacturing and logistics"
**Then** the audit is created with reference "AUD-2026-NNN" and status "PLANNED"
**And** it is listed under the parent programme
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AUD-003: Assign Lead Auditor and Auditees

**Given** an audit "AUD-2026-0001" exists with no auditors or auditees assigned
**When** I open the audit and navigate to the Team tab
**And** I set Lead Auditor "R. Chen (Certified Internal Auditor)"
**And** I add Auditees: "P. Singh (Logistics Supervisor)", "M. O'Brien (Production Manager)"
**Then** the lead auditor and auditees are saved against the audit
**And** all assigned parties receive a notification with the audit dates and scope
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AUD-004: Set Scope and Criteria (ISO 9001:2015 Clauses)

**Given** an audit "AUD-2026-0001" is in PLANNED status
**When** I navigate to the Scope tab and set:
- Scope Statement "Operations department: production, logistics, and quality inspection processes"
- Criteria: Clause "4 Context of the Organisation", Clause "7 Support", Clause "8 Operation", Clause "9 Performance Evaluation"
- Exclusions "Clause 8.3 (Design & Development) — not applicable to operations scope"
**Then** the scope and criteria are saved
**And** the audit detail page displays the four selected ISO clauses as audit criteria
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AUD-005: Confirm Audit Dates

**Given** an audit "AUD-2026-0001" with draft dates "2026-03-10 to 2026-03-12"
**When** I click "Confirm Dates" after confirming availability with auditees
**And** I enter Opening Meeting Time "2026-03-10 09:00" and Closing Meeting Time "2026-03-12 15:00"
**Then** the audit status changes from "PLANNED" to "SCHEDULED"
**And** calendar invitations are sent to the lead auditor and all auditees
**And** the audit appears on the audit calendar for March 2026
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Audit Execution & Findings (5 scenarios)

### TC-AUD-006: Record MAJOR Nonconformance Against Clause 8.5.1

**Given** audit "AUD-2026-0001" is IN_PROGRESS
**When** I navigate to Findings and click "Add Finding"
**And** I enter: Finding Type "MAJOR_NC", Clause "8.5.1 Control of Production and Service Provision", Description "Production work instructions are not available at point of use in Machining Cell 4 — operators working from memory for 6 of 8 operations", Objective Evidence "Observation confirmed by Lead Auditor and Production Manager; work instruction folder missing from Cell 4 workstation"
**Then** the finding is recorded with reference "AUD-2026-0001-F01" and type "MAJOR_NC"
**And** the finding appears in the audit findings list
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AUD-007: Record MINOR Finding

**Given** audit "AUD-2026-0001" is IN_PROGRESS
**When** I add a finding with: Finding Type "MINOR_NC", Clause "7.5.3 Control of Documented Information", Description "Revision status on 3 of 20 sampled documents does not match the document master list", Objective Evidence "Document register shows Rev C; physical copies at workstations show Rev B"
**Then** the finding is recorded with reference "AUD-2026-0001-F02" and type "MINOR_NC"
**And** the finding is listed alongside the MAJOR nonconformance in the findings summary
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AUD-008: Record Observation

**Given** audit "AUD-2026-0001" is IN_PROGRESS
**When** I add a finding with: Finding Type "OBSERVATION", Clause "9.1.1 Monitoring, Measurement, Analysis and Evaluation", Description "Measuring equipment calibration records are maintained but currently stored in paper format only — no electronic backup", Objective Evidence "Calibration folder reviewed; 47 records on paper, no digital copies"
**Then** the finding is recorded with type "OBSERVATION" and reference "AUD-2026-0001-F03"
**And** observations are distinguishable from nonconformances in the findings list
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AUD-009: Close Finding with Corrective Action Reference

**Given** finding "AUD-2026-0001-F02" (MINOR NC) exists and a corrective action has been raised
**When** I open the finding and click "Link Corrective Action"
**And** I enter CA Reference "CA-2026-0047" and Planned Closure Date "2026-04-30"
**And** after the CA is completed I click "Close Finding" with notes "Document master list updated; all workstation copies replaced with current revision"
**Then** the finding status changes to "CLOSED" with closure date recorded
**And** the CA reference is preserved on the closed finding for traceability
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AUD-010: Verify Finding Count in Audit Summary

**Given** findings F01 (MAJOR_NC), F02 (MINOR_NC), and F03 (OBSERVATION) have been recorded for audit "AUD-2026-0001"
**When** I navigate to the Audit Summary tab
**Then** the summary shows: Major NCs (1), Minor NCs (1), Observations (1), Total Findings (3)
**And** the overall audit grade or result is calculated (e.g., MAJOR NC present = "NOT_CONFORMING")
**And** the summary is printable as part of the audit report
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Checklists (5 scenarios)

### TC-AUD-011: Create Audit Checklist from ISO 9001 Template

**Given** an audit "AUD-2026-0001" is in SCHEDULED or IN_PROGRESS status
**When** I navigate to the Checklists tab and click "Add Checklist"
**And** I select Template "ISO 9001:2015 Internal Audit Checklist" and filter to Clauses "8.5.1, 7.5.3, 9.1.1"
**Then** the checklist is created with the pre-loaded questions for the selected clauses
**And** each question shows: clause reference, question text, and response fields (COMPLIANT / NON_COMPLIANT / N/A)
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AUD-012: Add Custom Question to Checklist

**Given** a checklist exists for audit "AUD-2026-0001"
**When** I click "Add Question" and enter: Question "Are operators able to demonstrate the correct escalation process for out-of-spec components?", Clause Reference "8.5.1", Category "OPERATIONAL", Notes Required "Yes if Non-Compliant"
**Then** the custom question is added to the bottom of the checklist
**And** it is distinguishable from template questions with a "Custom" tag
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AUD-013: Mark Questions as Compliant / Non-Compliant / N/A

**Given** a checklist with 10 questions is attached to audit "AUD-2026-0001"
**When** I work through the checklist and mark: 7 questions "COMPLIANT", 2 questions "NON_COMPLIANT" (with notes), 1 question "N/A" (with justification "Not applicable — process outsourced")
**Then** all responses are saved with timestamps
**And** non-compliant responses show the mandatory notes field populated
**And** the checklist progress indicator shows "10/10 answered"
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AUD-014: View Checklist Completion Percentage

**Given** audit "AUD-2026-0001" has a checklist with 20 questions, 14 answered and 6 unanswered
**When** I view the checklist from the audit summary
**Then** the completion percentage displays as "70% complete (14/20)"
**And** unanswered questions are highlighted
**And** the audit cannot be moved to REPORT_DRAFT status until the checklist reaches 100%
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AUD-015: Link Checklist Non-Compliant Response to Finding

**Given** a checklist question "Work instructions available at point of use?" is marked "NON_COMPLIANT"
**When** I click "Raise Finding" on the non-compliant response
**And** I confirm: Finding Type "MAJOR_NC", Clause "8.5.1", pre-populated from checklist context
**Then** a finding is created and linked to the checklist question
**And** the checklist question shows the finding reference "AUD-2026-0001-F01" as a hyperlink
**And** the finding count on the audit summary updates
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Audit Reporting (5 scenarios)

### TC-AUD-016: Generate Audit Report with Findings Summary

**Given** audit "AUD-2026-0001" has completed checklist responses and all findings recorded
**When** I navigate to Reports and click "Generate Audit Report"
**Then** the system creates an audit report document containing: audit details (scope, criteria, dates, team), findings summary (1 Major NC, 1 Minor NC, 1 Observation), individual finding details, and checklist summary
**And** the report status is set to "DRAFT"
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AUD-017: Add Executive Summary to Audit Report

**Given** an audit report for "AUD-2026-0001" is in DRAFT status
**When** I click "Edit Report" and navigate to the Executive Summary section
**And** I enter: "The Q1 Internal Audit of Operations identified one major nonconformance relating to the availability of work instructions at point of use. Immediate corrective action has been initiated. The audit team commends the improved calibration records management introduced since the previous audit."
**Then** the executive summary is saved to the report
**And** it appears as the first section of the formatted report
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AUD-018: Distribute Report to Management

**Given** an audit report for "AUD-2026-0001" is finalised in DRAFT
**When** I click "Distribute Report" and select recipients: "Quality Director", "Operations Manager", "Management Representative"
**And** I set Distribution Date "2026-03-14"
**Then** the report status changes to "DISTRIBUTED"
**And** all selected recipients receive an email notification with the report attached or linked
**And** the distribution log records recipient names, date, and method
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AUD-019: Record Management Response

**Given** an audit report for "AUD-2026-0001" has been distributed with 1 Major NC
**When** the Quality Director submits a management response: "We accept the finding. Work instructions will be laminated and posted at all machining cells by 2026-03-21. Root cause: process for document distribution to shopfloor was not updated following cell layout change."
**And** I record the response with Responder "Quality Director" and Response Date "2026-03-15"
**Then** the management response is recorded against the audit report
**And** the response is appended to the audit record for governance evidence
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AUD-020: Close Audit (All Findings Actioned)

**Given** audit "AUD-2026-0001" has findings F01 (MAJOR_NC, closed), F02 (MINOR_NC, closed), and F03 (OBSERVATION, acknowledged)
**When** I click "Close Audit" and confirm that all findings are actioned
**And** I enter Close Date "2026-04-30" and Closing Notes "All corrective actions verified as effective at follow-up review"
**Then** the audit status changes to "CLOSED"
**And** the programme dashboard updates to show the audit as completed
**And** the closed audit is retained in the audit history with all findings and evidence
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Audit Analytics (5 scenarios)

### TC-AUD-021: View Audit Calendar (Upcoming and Overdue)

**Given** multiple audits exist in the programme with scheduled, in-progress, and overdue statuses
**When** I navigate to Audits > Calendar
**Then** the calendar displays all audits for the current month and upcoming 3 months
**And** overdue audits (scheduled date passed, status still PLANNED) are highlighted in red
**And** I can toggle between monthly, weekly, and list views
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AUD-022: Filter Findings by Type Across Audit Programme

**Given** findings exist across multiple audits in programme "PROG-2026-0001"
**When** I navigate to Audits > Findings Register and filter by: Programme "PROG-2026-0001", Finding Type "MAJOR_NC"
**Then** only major nonconformances from all audits in the programme are displayed
**And** the results show: finding reference, audit reference, clause, description, status, and closure date
**And** the total count reflects the filter
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AUD-023: View Repeat Findings Report

**Given** findings across FY2025 and FY2026 audits reference the same ISO clause (e.g., 8.5.1)
**When** I navigate to Audits > Analytics > Repeat Findings
**Then** the report identifies findings that have recurred against the same clause in consecutive audit cycles
**And** each repeat finding shows: clause, finding type, first occurrence audit, recurrence audit, and elapsed time
**And** repeat findings are flagged for escalation to management review
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AUD-024: Track Corrective Action Closure Rate

**Given** 12 corrective actions have been raised across all audits in "PROG-2026-0001" — 8 closed, 3 open, 1 overdue
**When** I navigate to Audits > Analytics > CA Closure Rate
**Then** the dashboard shows: Total CAs (12), Closed (8), Open (3), Overdue (1), Closure Rate "66.7%"
**And** a trend chart shows monthly closure rate over the last 6 months
**And** overdue CAs are listed with responsible owner and days overdue
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AUD-025: View Compliance Trend by Standard Clause

**Given** internal audit findings exist across multiple audit cycles for ISO 9001:2015
**When** I navigate to Audits > Analytics > Compliance Trend and select Standard "ISO 9001:2015"
**Then** a heat map or trend table shows compliance performance per clause across audit cycles
**And** clauses with repeat nonconformances are highlighted as systemic weaknesses
**And** the trend shows improvement or deterioration for each clause over the selected period
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Sign-Off

| Role                  | Name | Signature | Date |
| --------------------- | ---- | --------- | ---- |
| Quality Manager       |      |           |      |
| Product Owner         |      |           |      |
| UAT Lead              |      |           |      |
| Regulatory/Compliance |      |           |      |

**Overall Result:** [ ] PASS -- All scenarios passed / [ ] FAIL -- See notes above
**Release Recommendation:** [ ] Approved for Production / [ ] Requires remediation
