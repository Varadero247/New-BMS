# UAT Test Plan: Permit to Work (PTW)
**Version**: 1.0
**Date**: 2026-02-23
**Module**: Permit to Work
**Port**: 4034
**Prepared by**: QA Team
**Status**: Draft

## Overview
The Permit to Work module controls the authorisation of high-risk maintenance and operational activities by enforcing structured hazard assessments, multi-level approvals, and documented safe systems of work. It supports permit types including Hot Work, Confined Space Entry, Electrical Isolation, Working at Height, and Excavation. The module provides real-time visibility of active permits, lockout/tagout (LOTO) checklists, gas test records, and a full audit trail for regulatory and insurance compliance.

## Scope
- Permit creation across all supported permit types
- Pre-work hazard identification and risk control selection
- LOTO checklist management and equipment isolation records
- Multi-level permit approval by authorised persons
- Gas test and atmospheric monitoring record capture
- Active permit monitoring and concurrent-work conflict detection
- Permit closure, sign-off, and reinstatement workflows
- Permit history, audit trail, and compliance reporting

## Prerequisites
- IMS platform running and accessible
- Admin credentials available (admin@ims.local / admin123)
- Test data seeded via seed scripts
- User accounts configured for Permit Issuer, Authorised Person, and Permit Holder roles
- At least one equipment asset record in the Assets module
- Location/area hierarchy configured in system settings

## Test Cases

### Permit Creation

#### TC-PTW-001: Create a Hot Work permit
**Given** the user has Permit Issuer permissions
**When** they navigate to PTW and select "New Permit" with type "Hot Work"
**And** they complete location, equipment, work description, start/end date, and assign a Permit Holder
**Then** the permit is saved with status "Draft"
**And** a unique reference number in the format PTW-HW-YYYY-NNN is assigned

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-PTW-002: Create a Confined Space Entry permit
**Given** the user is creating a new permit
**When** they select type "Confined Space Entry"
**And** they complete the required fields including emergency rescue plan and standby person assignment
**Then** the permit is saved as a Draft with the "Confined Space" classification visible
**And** the system flags that a gas test record is mandatory before the permit can be approved

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-PTW-003: Create an Electrical Isolation permit
**Given** the user is creating a new permit of type "Electrical Isolation"
**When** they complete the isolation point reference, voltage level, and LOTO requirements
**And** assign both the Permit Holder and the Authorised Electrical Person
**Then** the permit is saved as a Draft with the isolation point reference visible in the summary
**And** the LOTO checklist is automatically attached to the permit

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-PTW-004: Validate that overlapping permits on the same equipment are flagged
**Given** an active permit already exists for a specific piece of equipment
**When** a user attempts to create a new permit referencing the same equipment for an overlapping time period
**Then** the system displays a conflict warning identifying the existing active permit
**And** the user must confirm or adjust the permit before proceeding

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-PTW-005: Attach supporting documents to a permit
**Given** the user is creating or editing a Draft permit
**When** they attach a risk assessment PDF and a method statement document
**Then** both attachments are visible in the permit's Documents section
**And** attachment details (filename, uploader, timestamp) are recorded in the audit log

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

### Hazard Assessment

#### TC-PTW-006: Complete a pre-work hazard identification checklist
**Given** a permit is in Draft status
**When** the Permit Issuer opens the Hazard Assessment section
**And** selects applicable hazards from the pre-built hazard library (e.g. Fire, Toxic Gas, Electrical)
**Then** each selected hazard displays a required control measure field
**And** the permit cannot advance to approval until all controls are documented

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-PTW-007: Select and document risk control measures for identified hazards
**Given** hazards have been identified on a permit
**When** the user selects control measures from the hierarchy of controls (Elimination, Substitution, Engineering, Administrative, PPE)
**And** assigns responsibility for each control to a named person
**Then** the selected controls are saved and displayed in the hazard assessment summary
**And** the residual risk rating is recalculated based on the applied controls

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-PTW-008: Add a gas test record to a Confined Space permit
**Given** a Confined Space Entry permit is in Draft or Under Review status
**When** the user navigates to the Gas Test Records section and adds a test result
**And** enters the tested gas, reading, pass/fail result, tester name, and timestamp
**Then** the gas test record is attached to the permit
**And** if any gas reading exceeds the safe threshold, the permit is automatically blocked from approval with a safety warning

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-PTW-009: Complete the LOTO checklist before permit approval
**Given** an Electrical Isolation permit requires LOTO
**When** the user opens the LOTO checklist and marks each isolation step as completed
**And** records the lock serial number and responsible person for each isolation point
**Then** the checklist status changes to "Complete"
**And** the permit can proceed to the approval workflow

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-PTW-010: Flag a hazard as safety-critical to escalate review
**Given** the user identifies a hazard classified as "Safety Critical" (e.g. explosive atmosphere)
**When** they mark the hazard with the "Safety Critical" flag
**Then** the permit is automatically escalated to require approval from the Safety Manager in addition to the standard approval chain
**And** the escalation reason is recorded in the permit audit trail

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

### Permit Approval

#### TC-PTW-011: Approve a permit as first-level Authorised Person
**Given** a permit has a completed hazard assessment and is in "Pending Approval" status
**When** the Authorised Person reviews the permit and clicks "Approve"
**And** the permit type does not require a second-level approval
**Then** the permit status changes to "Approved"
**And** the Permit Holder receives a notification that the permit is ready to commence

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-PTW-012: Enforce two-level approval for Confined Space Entry permits
**Given** a Confined Space Entry permit is submitted for approval
**When** the first Authorised Person approves it
**Then** the permit escalates to the second Authorised Person for their signature
**And** the permit status remains "Pending Second Approval" until both approvals are recorded

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-PTW-013: Reject a permit during approval with mandatory reason
**Given** a permit is in "Pending Approval" status
**When** the Authorised Person clicks "Reject" without entering a reason
**Then** the system prevents the rejection and prompts the user to enter a rejection reason
**And** once a reason is provided, the permit returns to Draft and the issuer is notified

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-PTW-014: Approve a permit with conditions
**Given** a permit is under review
**When** the Authorised Person approves the permit but adds a condition (e.g. "Work restricted to daylight hours only")
**Then** the condition is recorded on the permit face
**And** the condition is prominently displayed to the Permit Holder on the permit detail page

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-PTW-015: Prevent permit approval when mandatory gas test is absent
**Given** a Confined Space permit has no gas test record attached
**When** the Authorised Person attempts to approve the permit
**Then** the system blocks the approval with an error message indicating gas test records are required
**And** the permit remains in "Pending Approval" status

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

### Work Execution

#### TC-PTW-016: Activate an approved permit to commence work
**Given** a permit has status "Approved"
**When** the Permit Holder clicks "Activate Permit" at the time of commencement
**And** confirms they have briefed the work team on the hazards and controls
**Then** the permit status changes to "Active"
**And** the activation timestamp and Permit Holder's name are recorded

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-PTW-017: Suspend an active permit due to changed conditions
**Given** a permit is in "Active" status
**When** the Permit Holder identifies a change in conditions (e.g. fire alarm) and clicks "Suspend"
**And** provides a reason for the suspension
**Then** the permit status changes to "Suspended"
**And** the work area supervisor receives a notification of the suspension

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-PTW-018: Reinstate a suspended permit after conditions are safe
**Given** a permit is in "Suspended" status
**When** the Authorised Person re-inspects the area and clicks "Reinstate"
**And** records the reinstatement checks performed
**Then** the permit status returns to "Active"
**And** the reinstatement timestamp and reason are recorded in the audit log

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-PTW-019: View all active permits on the PTW dashboard
**Given** multiple permits are in "Active" status across different areas
**When** the user navigates to the PTW Dashboard
**Then** all active permits are displayed with their permit type, area, Permit Holder, and expiry time
**And** permits within 1 hour of expiry are highlighted with a visual warning

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-PTW-020: Automatically expire a permit that passes its end time
**Given** an approved or active permit has an end date/time in the past
**When** the system's scheduled expiry check runs
**Then** the permit status automatically changes to "Expired"
**And** the Permit Issuer and Authorised Person receive an expiry notification

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

### Permit Closure

#### TC-PTW-021: Close a permit upon work completion
**Given** a permit is in "Active" status and work has been completed
**When** the Permit Holder navigates to the permit and clicks "Close Permit"
**And** confirms all workers have left the area and the site is left safe
**Then** the permit status changes to "Closed"
**And** the closure timestamp and Permit Holder confirmation are recorded

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-PTW-022: Confirm LOTO removal during permit closure
**Given** an Electrical Isolation permit is being closed
**When** the Permit Holder initiates closure
**Then** the system requires confirmation that all locks have been removed and recorded
**And** the LOTO checklist must be marked "De-isolated" before the closure can be completed

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-PTW-023: Obtain Authorised Person sign-off on permit closure
**Given** a permit closure has been initiated by the Permit Holder
**When** the Authorised Person reviews the closure and signs off
**Then** the closure is finalised with both the Permit Holder and Authorised Person sign-off recorded
**And** the permit is locked and archived with full audit history

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-PTW-024: Search and retrieve closed permits from history
**Given** multiple permits have been closed and archived
**When** the user uses the permit search with filters for date range, type, and area
**Then** matching closed permits are returned in the results list
**And** the user can open any closed permit to view its full details and audit trail in read-only mode

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-PTW-025: Generate a PTW compliance summary report
**Given** permits have been issued, approved, and closed within a defined period
**When** the user runs the "PTW Compliance Report" for a selected month
**Then** the report shows total permits issued, approved, rejected, and closed, broken down by type and area
**And** the report can be exported as PDF for management review

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
