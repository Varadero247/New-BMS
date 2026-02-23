# UAT Test Plan: Contracts
**Version**: 1.0
**Date**: 2026-02-23
**Module**: Contracts
**Port**: 4033
**Prepared by**: QA Team
**Status**: Draft

## Overview
The Contracts module provides end-to-end contract lifecycle management, covering creation, negotiation, approval, execution, and expiry. It supports version control, e-signature workflows, obligation tracking, and milestone management to ensure contractual commitments are met and monitored. The module integrates with the HR, Finance, and Compliance services to provide a unified view of all organisational agreements.

## Scope
- Contract creation (new, template-based, and imported)
- Contract versioning and revision history
- Multi-level approval workflows with delegated authority
- Electronic signature capture and audit trail
- Obligation and milestone tracking with automated alerts
- Contract expiry notifications and renewal workflows
- Counterparty (vendor/customer) management
- Contract performance reporting and dashboards

## Prerequisites
- IMS platform running and accessible
- Admin credentials available (admin@ims.local / admin123)
- Test data seeded via seed scripts
- At least two user accounts with distinct roles (contract owner, approver)
- Email/notification service configured for alert testing
- PDF renderer available for document export tests

## Test Cases

### Contract Creation

#### TC-CON-001: Create a new contract from scratch
**Given** the user is logged in with contract-create permissions
**When** they navigate to Contracts and click "New Contract"
**And** they complete all required fields (title, counterparty, start date, end date, value, type)
**Then** the contract is saved with status "Draft"
**And** a unique reference number in the format CON-YYYY-NNN is assigned

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-CON-002: Create a contract from a pre-built template
**Given** the user is on the New Contract page
**When** they select "Use Template" and choose the "Service Agreement" template
**And** they fill in the variable fields (counterparty name, value, duration)
**Then** the contract is populated with the standard clause set from the template
**And** all mandatory sections are pre-filled and editable

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-CON-003: Import a contract via file upload
**Given** the user has a signed PDF contract to register
**When** they choose "Import Contract" and upload the PDF
**And** they complete the metadata fields (parties, dates, value, category)
**Then** the PDF is stored as an attachment on the contract record
**And** the contract appears in the register with status "Executed"

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-CON-004: Validate required field enforcement on contract creation
**Given** the user is creating a new contract
**When** they attempt to save without providing the contract title and counterparty
**Then** inline validation errors appear on all empty required fields
**And** the form is not submitted until all required fields are completed

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-CON-005: Associate contract with internal owner and department
**Given** the user is creating or editing a contract
**When** they select an internal contract owner from the user directory
**And** they assign the contract to a department
**Then** the contract owner receives a notification of assignment
**And** the contract appears in the owner's "My Contracts" dashboard view

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

### Contract Lifecycle

#### TC-CON-006: Edit a draft contract and save a new version
**Given** a contract exists with status "Draft"
**When** the contract owner edits the scope clause and clicks "Save"
**Then** a new version (e.g. v1.1) is created automatically
**And** the previous version (v1.0) is preserved in the version history

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-CON-007: View full version history of a contract
**Given** a contract has been through multiple revisions
**When** the user opens the contract and navigates to the "Version History" tab
**Then** all versions are listed with timestamp, editor name, and change summary
**And** any version can be opened in read-only preview mode

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-CON-008: Compare two versions of a contract side-by-side
**Given** a contract has at least two saved versions
**When** the user selects two versions and clicks "Compare"
**Then** a diff view is displayed highlighting added and removed text
**And** the user can revert to the earlier version if required

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-CON-009: Transition contract status from Draft to Under Review
**Given** a contract is in "Draft" status
**When** the contract owner clicks "Submit for Review"
**Then** the contract status changes to "Under Review"
**And** assigned reviewers receive an email/in-app notification to review the document

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-CON-010: Mark a contract as Executed after all signatures are obtained
**Given** a contract is in "Approved" status
**When** all required parties have e-signed the document
**Then** the contract status automatically transitions to "Executed"
**And** the executed date is recorded and the document is locked from further editing

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

### Approval Workflows

#### TC-CON-011: Initiate a single-level approval workflow
**Given** a contract is in "Under Review" status
**When** the reviewer clicks "Approve"
**And** the contract value is below the delegated authority threshold for single approval
**Then** the contract moves to "Approved" status
**And** the approval is recorded with the approver's name, role, and timestamp

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-CON-012: Initiate a multi-level approval workflow for high-value contract
**Given** a contract value exceeds the single-approver threshold (e.g. >$100,000)
**When** the first-level approver approves the contract
**Then** the contract is escalated to the second-level approver automatically
**And** the second approver receives a notification and the contract remains "Pending Approval"

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-CON-013: Reject a contract during approval and return to owner
**Given** a contract is awaiting approval
**When** the approver clicks "Reject" and provides a rejection reason
**Then** the contract status reverts to "Draft"
**And** the contract owner receives a notification containing the rejection reason

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-CON-014: Delegate approval authority to another user
**Given** the designated approver is unavailable
**When** they delegate their approval authority to a named substitute for a defined period
**Then** the substitute receives pending approval notifications during the delegation period
**And** the delegation is logged in the contract audit trail

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-CON-015: E-signature workflow for counterparty signing
**Given** a contract has been approved internally
**When** the contract owner sends the document to the counterparty for e-signature
**Then** the counterparty receives a secure link to review and sign the document
**And** upon signing, the executed document is attached and the status updated accordingly

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

### Obligations & Milestones

#### TC-CON-016: Add an obligation to an executed contract
**Given** a contract is in "Executed" status
**When** the contract owner adds a new obligation with a due date, owner, and description
**Then** the obligation appears in the contract's Obligations tab
**And** the obligation owner receives an assignment notification

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-CON-017: Mark an obligation as fulfilled
**Given** an obligation exists on a contract with status "Pending"
**When** the obligation owner clicks "Mark as Fulfilled" and provides completion notes
**Then** the obligation status changes to "Fulfilled"
**And** a completion timestamp and the owner's name are recorded in the audit trail

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-CON-018: Receive overdue obligation alert
**Given** an obligation has a due date that has passed and its status is still "Pending"
**When** the scheduled nightly obligation check runs
**Then** the contract owner and obligation owner receive an overdue alert notification
**And** the obligation is flagged with an "Overdue" badge in the UI

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-CON-019: Add a milestone with a target date to a contract
**Given** a contract is active
**When** the user adds a milestone (e.g. "Delivery of Phase 1") with a target date
**And** assigns it to a responsible party
**Then** the milestone appears in the contract timeline view
**And** a reminder notification is scheduled for 14 days before the target date

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-CON-020: Contract expiry alert is sent before end date
**Given** a contract has an end date 30 days in the future
**When** the daily expiry check process runs
**Then** the contract owner receives a 30-day expiry warning notification
**And** the contract is flagged as "Expiring Soon" in the contract register

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

### Reporting

#### TC-CON-021: View contract register with filtering by status
**Given** multiple contracts exist across different statuses
**When** the user navigates to the Contract Register and filters by status "Executed"
**Then** only contracts with "Executed" status are displayed
**And** the count displayed in the filter badge matches the number of visible records

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-CON-022: Export contract register to CSV
**Given** the user is viewing the contract register
**When** they click "Export" and select CSV format
**Then** a CSV file is downloaded containing all visible contract records
**And** the exported data includes reference number, title, counterparty, value, status, and dates

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-CON-023: View contract spend summary dashboard
**Given** executed contracts with monetary values exist in the system
**When** the user opens the Contracts Dashboard
**Then** a spend summary widget displays total contract value by category and by department
**And** figures are consistent with the underlying contract records

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-CON-024: Generate a contract expiry report for the next 90 days
**Given** contracts with end dates within the next 90 days exist
**When** the user runs the "Expiry Report" with a 90-day horizon
**Then** the report lists all contracts expiring within that window
**And** the report can be exported as PDF or CSV

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-CON-025: Audit log captures all contract changes
**Given** a contract has been created, edited, approved, and executed
**When** the user views the contract's Audit Log tab
**Then** every status change, edit, and approval action is listed chronologically
**And** each entry shows the action, the user responsible, and the timestamp

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
