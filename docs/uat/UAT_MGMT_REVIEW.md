# UAT Test Plan: Management Review

---
> **CONFIDENTIAL — TRADE SECRET**
> This document is the property of Nexara DMCC and contains confidential and
> proprietary information. Unauthorised disclosure is prohibited.
> © 2026 Nexara DMCC. All rights reserved.
---

**Version**: 1.0
**Date**: 2026-02-23
**Module**: mgmt-review
**Port**: 4038
**Prepared by**: QA Team
**Status**: Draft

## Overview
The Management Review module supports the ISO 9001/14001/45001 requirement for top management to review the organisation's management system at planned intervals. It provides structured workflows for scheduling review meetings, collecting KPI and performance inputs, conducting and recording reviews, capturing decisions, and tracking resulting action items through to closure.

## Scope
- Scheduling and managing management review meetings
- Collecting and aggregating KPI and performance data inputs
- Conducting the formal management review process
- Recording decisions, minutes, and outcomes
- Creating, assigning, and tracking management review action items to closure

## Prerequisites
- IMS platform running and accessible
- Admin credentials available (admin@ims.local / admin123)
- Test data seeded via seed scripts
- `api-mgmt-review` service running on port 4038
- `web-mgmt-review` frontend accessible on port 3043
- At least one organisation with top management and QA roles configured
- KPI data available from connected modules (Quality, H&S, Environment, etc.)
- At least 3 user accounts with different roles (Top Management, QA Manager, Department Head)

## Test Cases

### Review Scheduling

#### TC-MGR-001: Schedule a new management review meeting
**Given** the user is logged in as a QA Manager and is on the Management Review dashboard
**When** the user clicks "Schedule Review" and fills in the meeting title, date, time, location, and agenda
**And** the user selects attendees from the user list and saves the meeting
**Then** the review meeting is created with status "Scheduled" and a reference in the format `MR-YYYY-NNN`
**And** calendar invitations are sent to all selected attendees

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

#### TC-MGR-002: Edit a scheduled review meeting's details
**Given** a management review meeting with status "Scheduled" exists at least 48 hours in the future
**When** the user opens the meeting record and modifies the date and adds one additional attendee
**And** the user saves the changes
**Then** the meeting record reflects the updated date and attendee list
**And** updated calendar notifications are sent to all attendees including the newly added attendee

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

#### TC-MGR-003: Cancel a scheduled management review meeting
**Given** a management review meeting is in "Scheduled" status
**When** the user opens the meeting and selects "Cancel Meeting" from the actions menu
**And** the user enters a cancellation reason and confirms
**Then** the meeting status changes to "Cancelled"
**And** cancellation notifications are sent to all attendees with the reason included

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

#### TC-MGR-004: Configure a recurring management review schedule
**Given** the organisation's policy requires quarterly management reviews
**When** the user opens the Schedule Configuration and sets the recurrence to "Quarterly" with a start date
**And** the user saves the configuration
**Then** four meeting stubs are created for the next 12 months at quarterly intervals
**And** the review calendar view displays all four scheduled meetings

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

#### TC-MGR-005: Send pre-meeting agenda and inputs request to participants
**Given** a review meeting is scheduled and at least 5 input sections are defined
**When** the user clicks "Send Input Requests" from the meeting preparation view
**Then** each assigned input owner receives an email with a link to their input submission form
**And** the meeting preparation status shows which input owners have responded and which are outstanding

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

### Input Data Collection

#### TC-MGR-006: Submit a KPI performance input for a review meeting
**Given** an input request has been sent to a Department Head for a scheduled review meeting
**When** the Department Head follows the link and submits their department's KPI data for the period
**And** the data includes target, actual, trend direction, and commentary
**Then** the input is recorded and marked as "Submitted" in the meeting preparation tracker
**And** the QA Manager is notified that the input has been received

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

#### TC-MGR-007: Collect internal audit results as review input
**Given** completed internal audit records exist in the Audits module for the review period
**When** the QA Manager opens the Input Collection section and clicks "Import Audit Results"
**And** selects audit records dated within the review period
**Then** a summary of audit findings, non-conformances, and closure rates is imported as an input section
**And** the source audit references are linked and visible in the input detail

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

#### TC-MGR-008: Pull customer satisfaction data as a review input
**Given** customer satisfaction survey results exist in the CRM module for the review period
**When** the user navigates to the Customer Feedback input section and clicks "Sync from CRM"
**Then** the system fetches the latest CSAT/NPS scores and displays a trend chart
**And** the scores and trend narrative are added as a review input item ready for discussion

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

#### TC-MGR-009: Manually enter an ad-hoc review input item
**Given** a management review meeting is in "Preparation" status
**When** the user adds a new input item manually with topic "Supplier Performance Issues" and attaches a supporting document
**Then** the new input item appears in the agenda input list under its assigned section
**And** the attached document is accessible from the input item detail without downloading the whole report

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

#### TC-MGR-010: View a consolidated pre-meeting input summary pack
**Given** all required inputs have been submitted for an upcoming review meeting
**When** the user clicks "Generate Input Pack"
**Then** a single PDF document is generated containing all input sections, KPI tables, charts, and supporting commentary
**And** the pack is timestamped and stored against the meeting record for reference

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

### Review Meeting

#### TC-MGR-011: Open and start a management review meeting session
**Given** a management review meeting with status "Scheduled" has reached its start date
**When** the chairperson opens the meeting record and clicks "Start Review"
**Then** the meeting status changes to "In Progress"
**And** the structured agenda view is displayed with each input section listed in order and a notes field

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

#### TC-MGR-012: Record discussion notes against each agenda item
**Given** a review meeting is "In Progress" and the agenda is displayed
**When** the chairperson types discussion notes in the notes field for each agenda section
**And** marks each section as "Discussed" upon completion
**Then** the notes are saved in real time against their respective agenda items
**And** the progress indicator shows the percentage of agenda sections that have been discussed

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

#### TC-MGR-013: Record an attendee's attendance during the meeting
**Given** a review meeting is "In Progress" with 5 invited attendees
**When** the chairperson marks 4 attendees as "Present" and 1 as "Apologies"
**Then** the attendance record is saved showing each attendee's status
**And** the meeting minutes will reflect the attendance list when generated

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

#### TC-MGR-014: Record a management decision during the meeting
**Given** an agenda item is under discussion in an "In Progress" review meeting
**When** the chairperson clicks "Add Decision" and enters the decision text, rationale, and decision owner
**Then** the decision is recorded and linked to the relevant agenda item
**And** the decisions list at the top of the meeting record is updated to show the new decision

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

#### TC-MGR-015: Close a management review meeting and lock the record
**Given** all agenda items have been discussed and at least one decision has been recorded
**When** the chairperson clicks "Close Meeting" and confirms
**Then** the meeting status changes to "Closed" and the record becomes read-only
**And** meeting minutes are automatically generated as a PDF and attached to the meeting record

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

### Action Items

#### TC-MGR-016: Create an action item from a review decision
**Given** a management decision has been recorded during a review meeting
**When** the user clicks "Create Action" on the decision record and fills in the action description, owner, and due date
**Then** a management review action item is created with a reference in the format `MRA-YYYY-NNN`
**And** the assigned owner receives a notification of the new action item and its due date

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

#### TC-MGR-017: Update the progress of an action item
**Given** an open management review action item is assigned to the current user
**When** the user opens the action item and adds a progress update with percentage complete and comments
**And** saves the update
**Then** the progress is recorded with a timestamp in the action item history
**And** the action item list view reflects the updated percentage complete

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

#### TC-MGR-018: Close a completed action item with evidence
**Given** a management review action item has been fully implemented
**When** the assigned owner opens the item, attaches supporting evidence, and clicks "Mark Complete"
**Then** the action item status changes to "Closed" with a completion date
**And** the meeting record shows the action as closed in its actions summary section

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

#### TC-MGR-019: Escalate an overdue action item
**Given** a management review action item has passed its due date and is still open
**When** the system's scheduled overdue check runs at midnight
**Then** the action item is flagged as "Overdue" in red on the action items dashboard
**And** an escalation notification is sent to the action owner's manager and the QA Manager

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

#### TC-MGR-020: View the action items register filtered by review meeting
**Given** multiple management review meetings have generated action items
**When** the user navigates to the Action Items Register and filters by a specific review meeting reference
**Then** only action items originating from that specific meeting are displayed
**And** a summary bar shows total actions, open, in-progress, and closed counts for the filtered set

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

### Review Records

#### TC-MGR-021: Download the auto-generated meeting minutes PDF
**Given** a management review meeting has been closed and minutes generated
**When** the user opens the meeting record and clicks "Download Minutes"
**Then** a PDF file is downloaded containing the meeting title, date, attendees, agenda items, discussion notes, decisions, and action items
**And** the PDF footer includes the meeting reference number, generation timestamp, and page numbers

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

#### TC-MGR-022: Link a review record to an ISO standard clause
**Given** a closed management review meeting exists
**When** the user opens the meeting record and navigates to "ISO Clause Mapping"
**And** links the meeting to ISO 9001:2015 clause 9.3
**Then** the clause mapping is saved against the meeting record
**And** the meeting reference appears in the ISO compliance matrix under clause 9.3 evidence

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

#### TC-MGR-023: Search historical management review records
**Given** at least 6 management review records exist spanning two calendar years
**When** the user uses the search feature to filter by year "2025" and status "Closed"
**Then** only records from 2025 with closed status are returned
**And** each result shows the meeting reference, title, date, number of decisions, and number of actions

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

#### TC-MGR-024: Generate a management review effectiveness report
**Given** at least 3 closed management review meetings exist with actions recorded
**When** the user navigates to Reports and selects "Review Effectiveness Report"
**And** sets the period to the last 12 months
**Then** a report is generated showing total reviews held, on-schedule percentage, action closure rate, and recurring issues trend
**And** the report can be exported to PDF and Excel formats

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

#### TC-MGR-025: View the complete audit trail for a review record
**Given** a management review meeting record that has been scheduled, modified, conducted, and closed
**When** the user opens the meeting and navigates to the "Audit Trail" tab
**Then** a full chronological log of all state changes and edits is displayed with user, timestamp, and change detail
**And** the audit trail cannot be modified or deleted and is visible to all users with view access

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

## Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| QA Lead | | | |
| Product Owner | | | |
| Technical Lead | | | |
| Business Stakeholder | | | |
