# UAT Test Plan: Regulatory Monitor
**Version**: 1.0
**Date**: 2026-02-23
**Module**: reg-monitor
**Port**: 4035
**Prepared by**: QA Team
**Status**: Draft

## Overview
The Regulatory Monitor module provides organisations with a centralised system for tracking regulatory changes, managing compliance obligations, and assessing the impact of legislative updates. It integrates with the `@ims/regulatory-feed` package to receive live regulatory change feeds and links obligations directly to controls within the IMS platform.

## Scope
- Subscribing to and receiving live regulatory update feeds
- Maintaining an obligation register with status tracking
- Linking compliance obligations to internal controls and processes
- Scoring and assessing the impact of regulatory changes
- Generating compliance calendars and scheduled reporting

## Prerequisites
- IMS platform running and accessible
- Admin credentials available (admin@ims.local / admin123)
- Test data seeded via seed scripts
- `api-reg-monitor` service running on port 4035
- `web-reg-monitor` frontend accessible on port 3040
- `@ims/regulatory-feed` package configured with at least one jurisdiction feed
- At least one active organisation record in the system

## Test Cases

### Regulatory Feed

#### TC-REG-001: Subscribe to a new regulatory jurisdiction feed
**Given** the user is logged in as an administrator and is on the Regulatory Monitor dashboard
**When** the user navigates to Feed Management and selects "Add Jurisdiction"
**And** the user selects "United Kingdom — Health & Safety" from the jurisdiction list and clicks "Subscribe"
**Then** the new jurisdiction feed appears in the active subscriptions list
**And** the feed status displays as "Active" with a last-synced timestamp

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

#### TC-REG-002: Receive and display an incoming regulatory update
**Given** an active subscription to a regulatory jurisdiction feed exists
**When** the regulatory feed service delivers a new legislative update
**And** the system processes the incoming feed item
**Then** the update appears in the "Unreviewed Updates" queue with title, jurisdiction, effective date, and summary
**And** a notification is sent to the assigned Compliance Officer role

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

#### TC-REG-003: Filter regulatory updates by jurisdiction and category
**Given** the user is viewing the regulatory updates list with multiple entries present
**When** the user applies a filter for jurisdiction "European Union" and category "Environmental"
**Then** only updates matching both the selected jurisdiction and category are displayed
**And** the filter chips are shown above the results list indicating active filters

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

#### TC-REG-004: Mark a regulatory update as reviewed
**Given** an unreviewed regulatory update exists in the feed queue
**When** the user opens the update detail view and clicks "Mark as Reviewed"
**And** the user enters a review comment and confirms
**Then** the update moves from "Unreviewed" to "Reviewed" status
**And** the review timestamp, reviewer name, and comment are stored and visible in the audit trail

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

#### TC-REG-005: Unsubscribe from a regulatory jurisdiction feed
**Given** the user is viewing an active jurisdiction subscription
**When** the user clicks "Unsubscribe" and confirms the action in the confirmation dialog
**Then** the feed is removed from the active subscriptions list
**And** no further updates from that jurisdiction are delivered to the update queue

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

### Obligation Register

#### TC-REG-006: Create a new compliance obligation
**Given** the user is on the Obligation Register page
**When** the user clicks "New Obligation" and fills in the title, regulation reference, jurisdiction, effective date, and responsible owner
**And** the user clicks "Save"
**Then** the obligation is created and assigned a reference number in the format `OBL-YYYY-NNN`
**And** the obligation appears in the register with status "Active"

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

#### TC-REG-007: Link a regulatory update to an existing obligation
**Given** a reviewed regulatory update and an existing obligation both exist in the system
**When** the user opens the regulatory update detail and clicks "Link to Obligation"
**And** the user searches for and selects the target obligation from the picker
**Then** the obligation is linked to the regulatory update
**And** the obligation record displays the linked update in its "Related Regulatory Changes" section

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

#### TC-REG-008: Edit an existing obligation record
**Given** an obligation with status "Active" exists in the register
**When** the user opens the obligation and modifies the description and renewal date
**And** the user saves the changes
**Then** the obligation record reflects the updated values
**And** an audit log entry is created recording the fields changed, old values, new values, and the editing user

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

#### TC-REG-009: Retire an obligation that is no longer applicable
**Given** an obligation is no longer required due to a legislative repeal
**When** the user opens the obligation and selects "Retire Obligation" from the actions menu
**And** the user provides a reason and confirms
**Then** the obligation status changes to "Retired"
**And** the obligation is excluded from active compliance tracking dashboards but remains searchable in the archive

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

#### TC-REG-010: Search obligations by keyword and status filter
**Given** the obligation register contains at least 10 records of varying statuses
**When** the user types "waste disposal" in the search bar and selects filter "Status: Active"
**Then** only active obligations whose title or description contains "waste disposal" are returned
**And** the result count is shown and pagination is available if results exceed the page limit

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

### Compliance Tracking

#### TC-REG-011: Link an obligation to an internal control
**Given** an active obligation and an existing internal control record both exist
**When** the user opens the obligation and navigates to the "Controls" tab
**And** the user clicks "Link Control" and selects the relevant control from the picker
**Then** the control appears in the obligation's linked controls list
**And** the control record shows the obligation as a linked requirement under its "Regulatory Basis" section

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

#### TC-REG-012: Update compliance status of an obligation
**Given** an active obligation linked to at least one control
**When** the compliance owner opens the obligation and changes the compliance status from "Pending" to "Compliant"
**And** the owner attaches evidence and saves
**Then** the obligation compliance status updates to "Compliant" with a last-verified date
**And** the compliance percentage on the dashboard increases to reflect the change

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

#### TC-REG-013: Flag an obligation as non-compliant and trigger an action
**Given** a periodic review determines that an obligation is not being met
**When** the user sets the obligation compliance status to "Non-Compliant" and enters details
**And** the user assigns a corrective action to a responsible person with a due date
**Then** the obligation displays a "Non-Compliant" badge and the assigned corrective action is created
**And** an email notification is sent to the assigned responsible person

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

#### TC-REG-014: View compliance status summary by business unit
**Given** multiple obligations exist across different business units
**When** the user navigates to the Compliance Dashboard and selects the "By Business Unit" view
**Then** a breakdown showing each business unit, total obligations, compliant count, non-compliant count, and percentage is displayed
**And** each business unit row is clickable and navigates to the filtered obligation list for that unit

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

#### TC-REG-015: Set compliance review frequency for an obligation
**Given** an active obligation record is open
**When** the user sets the review frequency to "Quarterly" and saves
**Then** the system schedules the next review date at 3 months from today
**And** the compliance calendar is updated to include the scheduled review entry for this obligation

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

### Impact Assessment

#### TC-REG-016: Create an impact assessment for a regulatory change
**Given** a reviewed regulatory update exists
**When** the user opens the update and clicks "Create Impact Assessment"
**And** the user fills in the affected processes, estimated effort, financial impact, and likelihood of non-compliance
**Then** an impact assessment record is created and linked to the regulatory update
**And** an overall impact score is calculated and displayed

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

#### TC-REG-017: Score a regulatory change using the impact scoring matrix
**Given** an impact assessment is in progress for a regulatory update
**When** the user sets severity to "High", probability of impact to "Likely", and regulatory exposure to "Significant"
**Then** the system calculates an impact score using the configured scoring formula
**And** the change is colour-coded red for high-impact and appears at the top of the prioritised update list

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

#### TC-REG-018: Assign an impact assessment for peer review
**Given** a completed impact assessment draft exists
**When** the user clicks "Send for Review" and selects a reviewer from the user list
**Then** the assessment status changes to "In Review"
**And** the selected reviewer receives a notification with a link to the assessment

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

#### TC-REG-019: Approve and close an impact assessment
**Given** an impact assessment has status "In Review" and the current user is the assigned reviewer
**When** the reviewer opens the assessment, adds review comments, and clicks "Approve"
**Then** the assessment status changes to "Approved"
**And** any linked obligations are flagged for review and the change is recorded in the audit trail

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

#### TC-REG-020: Bulk import regulatory changes via CSV upload
**Given** a CSV file containing 5 regulatory changes is prepared using the provided template format
**When** the user navigates to Import and uploads the CSV file
**And** the system validates and previews the records before import
**Then** all 5 records are imported and appear in the regulatory updates queue with "Unreviewed" status
**And** an import summary is displayed showing successful records and any validation errors

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

### Reporting

#### TC-REG-021: Generate a compliance calendar for the next quarter
**Given** obligations with scheduled review dates have been configured
**When** the user navigates to Reports and selects "Compliance Calendar"
**And** the user sets the date range to the next 90 days and clicks "Generate"
**Then** a calendar view is displayed listing all upcoming obligation reviews, deadlines, and renewal dates
**And** the calendar can be exported to PDF and iCal format

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

#### TC-REG-022: Export the full obligation register to Excel
**Given** the obligation register contains active and retired records
**When** the user navigates to the Obligation Register and clicks "Export to Excel"
**Then** an Excel file is downloaded containing all obligation fields including reference, title, jurisdiction, status, linked controls, and last review date
**And** the file includes a header row and separate sheets for active and retired obligations

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

#### TC-REG-023: Generate a regulatory compliance gap report
**Given** at least 5 obligations exist in the system with mixed compliance statuses
**When** the user selects "Gap Report" from the Reports menu and sets scope to "All Jurisdictions"
**Then** the report lists all non-compliant and pending obligations grouped by risk level
**And** each row includes the obligation reference, owner, gap description, and recommended actions

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

#### TC-REG-024: Schedule an automated weekly compliance status email
**Given** the user has appropriate permissions to configure system notifications
**When** the user navigates to Report Scheduling and creates a new weekly schedule for "Compliance Status Summary"
**And** the user specifies recipients and sets the delivery day to Monday at 08:00
**Then** the scheduled report is saved and appears in the active schedules list
**And** the system confirms the next delivery date shown matches the next upcoming Monday

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

#### TC-REG-025: View audit trail for an obligation record
**Given** an obligation has been created, edited, linked to a control, and had its compliance status updated
**When** the user opens the obligation and navigates to the "Audit Trail" tab
**Then** a chronological log of all changes is displayed including timestamp, user, action type, and changed values
**And** the audit trail entries cannot be edited or deleted by any user

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
