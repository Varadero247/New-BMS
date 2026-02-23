# UAT Test Plan: Portal
**Version**: 1.0
**Date**: 2026-02-23
**Module**: Portal
**Port**: 4018
**Prepared by**: QA Team
**Status**: Draft

## Overview
The Portal module provides a self-service customer-facing interface through which external customers can log in, submit and track support cases, download compliance and product documentation, raise service requests, and access usage and engagement analytics. It uses portal-specific authentication separate from the internal IMS user accounts.

## Scope
- Customer portal login, registration, and session management
- Submitting, updating, and closing customer support cases
- Browsing and downloading compliance certificates, product documentation, and reports
- Raising and tracking service requests through their lifecycle
- Viewing portal usage metrics and customer engagement analytics

## Prerequisites
- IMS platform running and accessible
- Admin credentials available (admin@ims.local / admin123)
- Test data seeded via seed scripts
- At least 3 portal customer accounts created in the `portal_users` table
- A selection of compliance documents uploaded and published in the Documents module
- Portal module (`api-portal`) running on port 4018, web portal on port 3018

## Test Cases

### Customer Portal Access

#### TC-POR-001: Customer portal login with valid credentials
**Given** a registered portal customer has an active account
**When** the customer navigates to the portal login page (port 3018) and enters valid email and password
**And** clicks "Sign In"
**Then** authentication succeeds and the customer is redirected to the portal dashboard
**And** the customer's name and organisation are displayed in the portal header

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-POR-002: Reject login with invalid credentials
**Given** the portal login page is displayed
**When** a user enters an unrecognised email or incorrect password and clicks "Sign In"
**Then** the system displays the error "Invalid email or password"
**And** the user remains on the login page with the password field cleared

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-POR-003: Lock account after repeated failed login attempts
**Given** a portal customer account is active
**When** the user enters an incorrect password 5 consecutive times
**Then** the account is temporarily locked and a message is displayed: "Account locked. Please contact support."
**And** subsequent login attempts with the correct password are refused until the lockout period expires

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-POR-004: Portal session timeout and re-authentication
**Given** a customer is logged into the portal
**When** the session has been idle for longer than the configured session timeout (default 30 minutes)
**Then** the user is automatically logged out
**And** they are redirected to the login page with a message "Your session has expired. Please sign in again."

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-POR-005: Customer self-service password reset
**Given** a portal customer has forgotten their password
**When** the user clicks "Forgot Password" on the login page, enters their registered email, and submits
**Then** a password reset email is sent to the registered address within 2 minutes
**And** the reset link in the email is valid for 24 hours and allows the customer to set a new password

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

### Case Management

#### TC-POR-006: Submit a new support case
**Given** a customer is logged into the portal dashboard
**When** the customer navigates to "My Cases" and clicks "Submit New Case", enters subject "Invoice Query", category "Billing", description "Invoice #INV-0042 appears to include duplicate line items", and priority "Medium"
**And** clicks "Submit"
**Then** the case is created with status "Open" and a reference number in the format `CASE-YYYY-NNN`
**And** the customer receives a confirmation email with the case reference

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-POR-007: Attach a file to a support case
**Given** a customer has an open support case
**When** the customer opens the case and uses the attachment uploader to attach a PDF (under 10 MB)
**And** clicks "Upload"
**Then** the attachment is saved against the case and listed in the attachments section
**And** the internal support team can view the uploaded file

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-POR-008: Add a comment to an existing case
**Given** an open support case exists on the customer's portal account
**When** the customer types a follow-up comment "I have now also noticed the error on Invoice #INV-0043" and submits it
**Then** the comment is appended to the case timeline with the customer's name and timestamp
**And** the internal support team receives a notification of the new comment

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-POR-009: View case status updates from the support team
**Given** an internal agent has updated a case status to "In Progress" and added a response
**When** the customer logs in and views their case
**Then** the updated status and the agent's response are visible in the case timeline
**And** the customer received an email notification when the status was updated

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-POR-010: Close a resolved case from the customer portal
**Given** a case has status "Resolved" and the customer is satisfied with the resolution
**When** the customer clicks "Close Case" and optionally provides a satisfaction rating out of 5
**Then** the case status changes to "Closed"
**And** the satisfaction rating is stored and contributes to the portal CSAT metrics

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

### Document Downloads

#### TC-POR-011: Browse the document library
**Given** compliance documents and product documentation have been published and marked as portal-accessible
**When** the customer navigates to "Documents" in the portal
**Then** a list of available documents is displayed with title, document type, version, and date published
**And** documents are filterable by type (e.g., "ISO Certificate", "Safety Data Sheet", "User Guide")

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-POR-012: Download a compliance certificate
**Given** an ISO 9001 certificate is published and accessible in the portal document library
**When** the customer clicks "Download" next to the certificate
**Then** the PDF file downloads to the customer's device
**And** the download event is logged with customer ID, document ID, and timestamp for audit purposes

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-POR-013: View document details before downloading
**Given** a document exists in the portal library
**When** the customer clicks the document title to open the details page
**Then** the document metadata is displayed: title, version, description, file size, and issuing organisation
**And** a "Download" button is available on the details page

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-POR-014: Search for a document by keyword
**Given** multiple documents exist in the portal library
**When** the customer enters "quality" in the document search field and presses Enter
**Then** all documents with "quality" in the title or description are returned
**And** the search results display within 2 seconds

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-POR-015: Restrict access to documents not assigned to the customer's organisation
**Given** some documents are restricted to specific customer organisations
**When** a customer from a different organisation attempts to access a restricted document URL directly
**Then** the system returns a "403 Forbidden" response
**And** the restricted document does not appear in that customer's document library view

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

### Service Requests

#### TC-POR-016: Raise a new service request
**Given** a customer is logged into the portal
**When** the customer navigates to "Service Requests" and clicks "New Request", selects type "Technical Support", enters description "Unable to connect via API using the provided credentials", and submits
**Then** the service request is created with status "Submitted" and a reference in the format `SR-YYYY-NNN`
**And** a confirmation message and email are sent to the customer

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-POR-017: Track service request progress
**Given** a service request has been submitted and assigned to an internal engineer
**When** the customer views the service request detail page
**Then** the current status (e.g., "In Progress"), the assigned engineer name, and the expected resolution date are displayed
**And** a timeline of all status changes is visible

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-POR-018: Approve a service request resolution
**Given** a service request has been updated to "Pending Customer Approval"
**When** the customer reviews the resolution notes and clicks "Approve Resolution"
**Then** the service request status changes to "Resolved"
**And** the resolution approval timestamp is recorded

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-POR-019: Reject a service request resolution and provide feedback
**Given** a service request is in "Pending Customer Approval" status
**When** the customer clicks "Reject Resolution" and enters reason "The issue persists on Firefox; only tested in Chrome"
**Then** the service request status reverts to "In Progress"
**And** the rejection reason is appended to the request timeline and the assigned engineer is notified

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-POR-020: Filter service requests by status
**Given** a customer has multiple service requests in various statuses
**When** the customer applies a status filter of "In Progress" on the service requests list
**Then** only requests with "In Progress" status are displayed
**And** the filter selection persists across page navigations within the same session

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

### Portal Analytics

#### TC-POR-021: View portal usage summary (admin view)
**Given** an IMS admin user navigates to the Portal admin section
**When** the admin selects "Usage Analytics" and chooses the current month
**Then** the summary displays total logins, unique active customers, cases submitted, documents downloaded, and service requests raised
**And** each metric shows a percentage change compared to the previous month

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-POR-022: View per-customer engagement metrics
**Given** the admin is in the portal analytics section
**When** the admin searches for a specific customer organisation and views their engagement report
**Then** the report shows that customer's login frequency, cases submitted, documents downloaded, and service requests raised for the selected period
**And** the data can be exported as a PDF customer engagement report

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-POR-023: View document download analytics
**Given** multiple documents have been downloaded by portal customers
**When** the admin navigates to "Document Analytics"
**Then** a ranked list of most-downloaded documents is displayed with download counts and unique customer counts
**And** the data can be filtered by document type and date range

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-POR-024: View case resolution time metrics
**Given** a set of closed cases with recorded open and close timestamps
**When** the admin views "Case Resolution Metrics"
**Then** the average, median, and 95th percentile resolution times are displayed
**And** cases exceeding the SLA target are highlighted in the report

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-POR-025: Export portal analytics data
**Given** portal analytics data is displayed for a selected date range
**When** the admin clicks "Export Data" and selects format "CSV"
**Then** a CSV file is downloaded containing all analytics data points visible in the current view
**And** the file includes a header row and all data rows without truncation

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

## Sign-Off
| Role | Name | Signature | Date |
|------|------|-----------|------|
| QA Lead | | | |
| Product Owner | | | |
| Technical Lead | | | |
| Business Stakeholder | | | |
