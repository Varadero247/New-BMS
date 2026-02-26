# UAT Test Plan: Emergency Management

---
> **CONFIDENTIAL — TRADE SECRET**
> This document is the property of Nexara DMCC and contains confidential and
> proprietary information. Unauthorised disclosure is prohibited.
> © 2026 Nexara DMCC. All rights reserved.
---

**Version**: 1.0
**Date**: 2026-02-23
**Module**: Emergency Management
**Port**: 4041
**Prepared by**: QA Team
**Status**: Draft

## Overview
The Emergency Management module enables organisations to prepare for, respond to, and learn from emergency situations through structured emergency response plans, scheduled drills, and post-incident after-action reviews. It maintains a live emergency contact directory, supports real-time incident coordination during an emergency, and produces reports to demonstrate regulatory compliance and continual improvement. The module integrates with the Health and Safety and Incidents modules to share hazard data and incident records.

## Scope
- Emergency response plan creation, versioning, and publication
- Emergency drill scheduling, execution recording, and outcome tracking
- Real-time emergency incident logging and response coordination
- Emergency contact directory management and on-call roster
- Post-incident after-action review (AAR) and corrective action tracking
- Regulatory reporting and drill frequency compliance monitoring
- Integration with H&S hazard register for scenario identification
- Notification and escalation to emergency contacts

## Prerequisites
- IMS platform running and accessible
- Admin credentials available (admin@ims.local / admin123)
- Test data seeded via seed scripts
- User accounts with Emergency Coordinator, First Responder, and Read-Only roles
- At least one site/location record configured in the system
- Email/SMS notification service configured for contact alerting tests
- H&S module populated with at least one hazard scenario

## Test Cases

### Emergency Plans

#### TC-EMG-001: Create a new emergency response plan
**Given** the user has Emergency Coordinator permissions
**When** they navigate to Emergency Management and click "New Emergency Plan"
**And** they complete all required fields (plan title, emergency type, scope, site, coordinator, review date)
**Then** the plan is saved with status "Draft"
**And** a unique reference number in the format EMP-YYYY-NNN is assigned

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-EMG-002: Add response procedures and action steps to an emergency plan
**Given** an emergency plan is in Draft status
**When** the coordinator adds sequential response steps with responsible roles, time targets, and instructions
**And** assigns an action owner to each step
**Then** the steps are saved in the correct sequence and are editable
**And** the step owners are notified of their assignment when the plan is published

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-EMG-003: Publish an emergency response plan for organisation-wide access
**Given** an emergency plan is complete and in Draft status
**When** the coordinator clicks "Publish" after review
**Then** the plan status changes to "Active"
**And** all users with site access can view the plan in read-only mode
**And** previous versions of the same plan type for the same site are automatically archived

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-EMG-004: Update a published plan and create a new version
**Given** an emergency plan is in "Active" status
**When** the coordinator edits the plan and saves the changes
**Then** a new version is created (e.g. v2.0) and the previous version is archived
**And** the update is logged with the editor's name, change summary, and timestamp

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-EMG-005: Receive an alert when an emergency plan is due for review
**Given** an emergency plan has a review date within the next 30 days
**When** the daily review-due check runs
**Then** the Emergency Coordinator receives a notification that the plan review is due
**And** the plan is flagged with a "Review Due" badge on the emergency plans dashboard

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

### Drill Management

#### TC-EMG-006: Schedule an emergency drill
**Given** an active emergency response plan exists
**When** the Emergency Coordinator creates a new drill record linked to the plan
**And** sets the drill type (evacuation, shelter-in-place, fire, chemical spill), date, time, and participating locations
**Then** the drill is saved with status "Scheduled"
**And** all site users receive an advance notification of the planned drill

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-EMG-007: Record the outcome of a completed drill
**Given** a drill was scheduled and has taken place
**When** the coordinator opens the drill record and clicks "Record Outcome"
**And** enters evacuation time, participant count, deviations observed, and overall pass/fail result
**Then** the drill record is updated with the outcome data and status changes to "Completed"
**And** the drill result is visible in the drill history and dashboard summary

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-EMG-008: Log observations and findings during a drill
**Given** a drill is in progress or recently completed
**When** the observer adds findings (e.g. blocked exit route, missing marshals) to the drill record
**And** rates each finding as Minor, Moderate, or Critical
**Then** all findings are attached to the drill record
**And** Critical findings automatically generate a corrective action for assignment

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-EMG-009: Mark a drill as overdue when it passes its scheduled date
**Given** a drill is in "Scheduled" status and its scheduled date has passed without a recorded outcome
**When** the system's scheduled overdue check runs
**Then** the drill status is automatically updated to "Overdue"
**And** the Emergency Coordinator receives an overdue notification

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-EMG-010: View drill frequency compliance status on the dashboard
**Given** regulatory requirements specify that each emergency type requires at least one drill per quarter
**When** the Emergency Coordinator opens the Drill Compliance Dashboard
**Then** each emergency type shows its compliance status (Compliant / Due / Overdue) based on drill history
**And** the next required drill date is displayed for each type and location

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

### Incident Response

#### TC-EMG-011: Log a real emergency incident
**Given** an actual emergency situation has occurred
**When** the Emergency Coordinator creates a new Emergency Incident record
**And** selects the emergency type, affected area, time of occurrence, and initial description
**Then** the incident is saved with status "Active"
**And** all nominated emergency contacts for the site receive an immediate alert notification

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-EMG-012: Update an active incident log with real-time response entries
**Given** an emergency incident is active
**When** the coordinator adds a response log entry with a timestamp, action taken, and responsible person
**Then** the log entry is appended to the incident timeline in chronological order
**And** the incident remains in "Active" status with the latest update visible at the top

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-EMG-013: Escalate an emergency incident to external authorities
**Given** an active emergency incident requires external emergency services
**When** the coordinator uses the "Escalate" function and selects the relevant authority (Fire Brigade, Ambulance, Police, Environment Agency)
**Then** the escalation is recorded on the incident with the authority name, time contacted, and coordinator's name
**And** a notification is sent to the senior management escalation list

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-EMG-014: Close an emergency incident once the situation is resolved
**Given** an active emergency incident has been brought under control
**When** the coordinator clicks "Close Incident" and confirms all response actions are complete
**And** enters the all-clear time and a brief resolution summary
**Then** the incident status changes to "Closed"
**And** an all-clear notification is sent to all previously alerted emergency contacts

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-EMG-015: Link an emergency incident to a triggered H&S incident record
**Given** the emergency incident resulted in a formal H&S incident being logged
**When** the coordinator links the emergency incident to the corresponding H&S incident reference
**Then** the linked incident reference is displayed on both records
**And** users can navigate between the emergency and H&S records via the link

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

### Emergency Contacts

#### TC-EMG-016: Add an internal emergency contact to the directory
**Given** the user has Emergency Coordinator permissions
**When** they add a new internal emergency contact with name, role, primary phone, backup phone, and site assignment
**Then** the contact is saved in the Emergency Contact Directory
**And** the contact is immediately visible in the directory search results

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-EMG-017: Add an external emergency contact (third-party/authority)
**Given** the coordinator is managing the contact directory
**When** they add an external contact (e.g. local fire station, hazmat contractor) with organisation, contact name, phone, and service type
**Then** the external contact is saved and categorised separately from internal contacts
**And** the contact appears in the relevant emergency plan's contact list for that service type

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-EMG-018: Assign contacts to an on-call roster with time slots
**Given** contacts exist in the emergency contact directory
**When** the coordinator builds an on-call roster by assigning contacts to specific date and time slots
**Then** the roster is saved and displayed in a calendar view
**And** on-call contacts receive an advance notification before their shift starts

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-EMG-019: Send a test alert to all emergency contacts for a site
**Given** emergency contacts are configured for a site
**When** the coordinator runs "Send Test Alert" for the site
**Then** all contacts assigned to that site receive a test notification via email and/or SMS
**And** the test alert event is recorded in the system with a delivery status for each recipient

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-EMG-020: Update contact details and verify audit trail
**Given** an emergency contact's phone number has changed
**When** the coordinator updates the contact record with the new number
**Then** the updated number is saved immediately
**And** the change is recorded in the contact's audit history showing the old value, new value, user, and timestamp

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

### Post-Incident Review

#### TC-EMG-021: Create an after-action review for a closed incident
**Given** an emergency incident has been closed
**When** the coordinator creates an After-Action Review (AAR) linked to the incident
**And** completes the review sections (what was planned, what happened, what went well, what needs improvement)
**Then** the AAR is saved in Draft status and linked to the closed incident
**And** nominated reviewers are notified to provide input

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-EMG-022: Raise a corrective action from an AAR finding
**Given** an AAR has identified an area for improvement
**When** the reviewer adds a corrective action with a description, owner, and due date
**Then** the corrective action is created and linked to the AAR
**And** the assigned owner receives a notification of the corrective action

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-EMG-023: Approve and publish an after-action review
**Given** an AAR is in Draft status and all sections are complete
**When** the Emergency Coordinator submits the AAR for approval
**And** the approver reviews and approves it
**Then** the AAR status changes to "Approved" and is published to relevant stakeholders
**And** the incident record is updated to show the AAR is complete

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-EMG-024: Track corrective actions from AARs to closure
**Given** corrective actions have been raised from one or more AARs
**When** the user navigates to the Corrective Actions tracking view
**Then** all open corrective actions are listed with owner, due date, and status
**And** overdue corrective actions are highlighted and the AAR owner is notified automatically

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-EMG-025: Generate an annual emergency preparedness report
**Given** drill records, incidents, and AARs exist for the reporting year
**When** the user runs the "Annual Emergency Preparedness Report" for the selected year
**Then** the report summarises drills conducted vs required, incidents by type, average response times, and open corrective actions
**And** the report can be exported as PDF for submission to regulators or senior management

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
