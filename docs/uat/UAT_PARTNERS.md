# UAT Test Plan: Partners

---
> **CONFIDENTIAL — TRADE SECRET**
> This document is the property of Nexara DMCC and contains confidential and
> proprietary information. Unauthorised disclosure is prohibited.
> © 2026 Nexara DMCC. All rights reserved.
---

**Version**: 1.0
**Date**: 2026-02-23
**Module**: Partners
**Port**: 4026
**Prepared by**: QA Team
**Status**: Draft

## Overview
The Partners module manages the full lifecycle of channel partner relationships, from initial onboarding and portal access provisioning through deal registration, performance measurement, and commission calculation and reporting. It integrates with the CRM module for opportunity data and with the Finance module for commission payment processing.

## Scope
- Registering and onboarding new partner organisations and contacts
- Provisioning and managing partner portal access credentials
- Submitting, approving, and tracking deal registrations through the partner portal
- Monitoring partner performance against tiers, targets, and KPIs
- Calculating, reviewing, and reporting partner commission payments

## Prerequisites
- IMS platform running and accessible
- Admin credentials available (admin@ims.local / admin123)
- Test data seeded via seed scripts
- Partners API service (`api-partners`) running on port 4026
- Partners Portal web app running on port 3026
- At least one partner tier structure (e.g., Silver, Gold, Platinum) configured
- Commission rate tables seeded for each partner tier

## Test Cases

### Partner Onboarding

#### TC-PAR-001: Register a new partner organisation
**Given** the admin is logged into the IMS admin dashboard
**When** the admin navigates to Partners and clicks "Register New Partner", entering company name "Apex Solutions Ltd", company size "51-200", region "EMEA", and tier "Silver"
**And** clicks "Create Partner"
**Then** the partner record is created with status "Pending Verification"
**And** a partner reference is generated in the format `PART-YYYY-NNN`

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-PAR-002: Complete partner onboarding and activate the account
**Given** a partner organisation exists with status "Pending Verification"
**When** the admin reviews the partner details, uploads the signed partnership agreement PDF, and clicks "Activate Partner"
**Then** the partner status changes to "Active"
**And** the activation date is recorded and the partner is included in active partner reports

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-PAR-003: Add a primary contact to a partner organisation
**Given** an active partner organisation record exists
**When** the admin navigates to "Contacts" within the partner record and clicks "Add Contact", entering name "Sarah Booth", email "sarah.booth@apexsolutions.com", role "Partner Manager", and phone number
**And** saves the contact
**Then** the contact is linked to the partner organisation
**And** the contact can be designated as the primary contact for portal access provisioning

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-PAR-004: Upload and store partner compliance documents
**Given** the partner onboarding checklist requires proof of insurance and company registration
**When** the admin uploads a Certificate of Insurance PDF and a Company Registration document against the partner record
**Then** both documents are stored and listed in the partner's document section with upload date and document type
**And** the onboarding checklist marks the corresponding items as complete

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-PAR-005: Suspend a partner account
**Given** an active partner organisation has breached partnership terms
**When** the admin clicks "Suspend Partner", selects reason "Contract Breach", and confirms
**Then** the partner status changes to "Suspended"
**And** all portal access for contacts associated with the partner is revoked immediately

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

### Partner Portal Access

#### TC-PAR-006: Provision portal access for a partner contact
**Given** an active partner organisation has a primary contact added
**When** the admin selects the contact and clicks "Invite to Partner Portal", entering the contact's email
**And** confirms the invitation
**Then** an invitation email is sent to the contact with a link to set up their portal password
**And** the contact's portal status is set to "Invitation Sent"

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-PAR-007: Partner contact activates portal account via invitation link
**Given** a partner contact has received a portal invitation email
**When** the contact clicks the invitation link and sets a password meeting the complexity requirements
**Then** the account is activated and the contact is logged into the partner portal
**And** the contact's portal status in the admin view changes to "Active"

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-PAR-008: Partner portal login with valid credentials
**Given** a partner contact has an active portal account
**When** the contact navigates to the partner portal (port 3026) and logs in with their email and password
**Then** authentication succeeds and the contact is directed to the partner portal dashboard
**And** the dashboard displays their partner organisation name and tier badge

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-PAR-009: Restrict partner portal access to own organisation data only
**Given** two separate partner organisations each have portal users
**When** a partner contact from Organisation A is logged in and attempts to access deal registration records belonging to Organisation B via URL manipulation
**Then** the system returns a "403 Forbidden" error
**And** Organisation B's data is not returned in any API response for Organisation A's portal session

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-PAR-010: Revoke portal access for a partner contact
**Given** a partner contact has an active portal account
**When** the admin selects the contact and clicks "Revoke Portal Access" and confirms
**Then** the contact's portal session is terminated immediately if active
**And** subsequent login attempts with that contact's credentials are rejected

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

### Deal Registration

#### TC-PAR-011: Submit a new deal registration from the partner portal
**Given** a partner contact is logged into the partner portal
**When** the contact navigates to "Deal Registrations" and clicks "Register New Deal", entering customer name "Greenfield Manufacturing", deal value "£45,000", expected close date "2026-05-15", and product line "IMS Enterprise Suite"
**And** submits the registration
**Then** the deal registration is created with status "Pending Approval"
**And** the internal channel manager receives a notification to review the submission

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-PAR-012: Approve a deal registration
**Given** a deal registration with status "Pending Approval" is visible in the admin deal queue
**When** the internal channel manager reviews the deal and clicks "Approve", selecting "Protect" to grant exclusivity
**Then** the deal registration status changes to "Approved"
**And** the partner portal contact receives an email confirmation with the approval and protection expiry date

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-PAR-013: Reject a deal registration with reason
**Given** a deal registration is under review
**When** the channel manager clicks "Reject" and enters reason "Customer is a direct account managed by our internal team"
**Then** the deal registration status changes to "Rejected"
**And** the partner portal contact is notified with the rejection reason

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-PAR-014: Mark a registered deal as closed-won
**Given** an approved deal registration exists and the partner has closed the deal
**When** the partner contact updates the deal status to "Closed Won" and enters the actual deal value "£47,500" and close date
**Then** the deal registration status changes to "Closed Won"
**And** a commission calculation is triggered automatically based on the final deal value and the partner's tier rate

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-PAR-015: Expire an unactioned deal registration
**Given** an approved deal registration protection period of 90 days has elapsed
**When** the scheduled expiry job runs
**Then** the deal registration status changes to "Expired"
**And** the partner contact receives an expiry notification email

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

### Partner Performance

#### TC-PAR-016: View partner performance dashboard
**Given** a partner contact is logged into the portal
**When** the contact navigates to "My Performance"
**Then** the dashboard displays YTD deals registered, YTD deals closed-won, YTD revenue generated, current tier status, and progress towards the next tier threshold
**And** a trend chart shows monthly deal activity for the past 12 months

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-PAR-017: View all partner performance from admin
**Given** the admin is in the Partners module
**When** the admin navigates to "Partner Performance Overview" and selects the current quarter
**Then** a table lists all active partners with their deal count, revenue contribution, and tier status
**And** the table is sortable by each column header

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-PAR-018: Promote a partner tier based on performance
**Given** a Silver tier partner has exceeded the Gold tier revenue threshold for the qualifying period
**When** the admin reviews the partner's performance and clicks "Promote Tier" and selects "Gold"
**Then** the partner's tier updates to "Gold"
**And** the tier change is logged with effective date and the partner is notified of the promotion

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-PAR-019: Set and track partner sales targets
**Given** the admin is managing a partner's performance configuration
**When** the admin sets a quarterly revenue target of "£100,000" for the partner
**Then** the target is saved and displayed on the partner's performance dashboard
**And** a progress bar shows actual vs target revenue in real time as deals are closed

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-PAR-020: View individual deal history for a partner
**Given** a partner has multiple deal registrations in various states
**When** the admin or partner contact views the deal history section
**Then** all deal registrations are listed with status, customer name, deal value, and registration date
**And** the list is filterable by status and sortable by deal value and date

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

### Commission Tracking

#### TC-PAR-021: View commission summary for a partner
**Given** a partner has closed-won deals with commissions triggered
**When** the partner contact navigates to "Commissions" in the portal
**Then** the summary shows total commission earned YTD, pending commission (awaiting payment), and paid commission
**And** a breakdown by deal is listed with deal reference, close date, deal value, commission rate, and commission amount

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-PAR-022: Calculate commission on a closed-won deal
**Given** a Platinum tier partner with a 12% commission rate has a closed-won deal with value "£50,000"
**When** the commission calculation is triggered after the deal is marked closed-won
**Then** the commission amount is calculated as "£6,000" (£50,000 × 12%)
**And** the commission record is created with status "Pending Approval"

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-PAR-023: Approve a commission payment
**Given** a commission record with status "Pending Approval" is visible in the admin commission queue
**When** the finance team approves the commission and enters the payment date "2026-04-01"
**Then** the commission status changes to "Approved for Payment"
**And** the partner portal contact sees the commission status update in their commissions view

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-PAR-024: Mark a commission as paid
**Given** a commission has been approved and payment has been processed via the Finance module
**When** the admin clicks "Mark as Paid" and enters payment reference and transaction date
**Then** the commission status changes to "Paid"
**And** the commission moves from the "Pending" total to the "Paid" total in the partner's commission summary

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-PAR-025: Generate commission report for a quarter
**Given** multiple commissions have been earned, approved, and paid during Q1 2026
**When** the admin navigates to "Commission Reports" and selects "Q1 2026"
**Then** the report lists all commissions for the period grouped by partner with totals per partner and a grand total
**And** the report can be exported as PDF or CSV for Finance and audit purposes

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

## Sign-Off
| Role | Name | Signature | Date |
|------|------|-----------|------|
| QA Lead | | | |
| Product Owner | | | |
| Technical Lead | | | |
| Business Stakeholder | | | |
