# UAT Test Plan: Chemicals

---
> **CONFIDENTIAL — TRADE SECRET**
> This document is the property of Nexara DMCC and contains confidential and
> proprietary information. Unauthorised disclosure is prohibited.
> © 2026 Nexara DMCC. All rights reserved.
---

**Version**: 1.0
**Date**: 2026-02-23
**Module**: Chemicals
**Port**: 4040
**Prepared by**: QA Team
**Status**: Draft

## Overview
The Chemicals module provides a centralised chemical register and hazardous substance management capability aligned with COSHH regulations and GHS/SDS requirements. It enables organisations to maintain an accurate inventory of all chemicals on site, manage Safety Data Sheets (SDS), conduct Control of Substances Hazardous to Health (COSHH) risk assessments, and enforce safe storage and disposal protocols. The module also generates regulatory reports for environmental and health and safety submissions.

## Scope
- Chemical register creation and management
- Safety Data Sheet (SDS) upload, version control, and distribution
- COSHH risk assessment authoring and approval
- Chemical incompatibility and co-storage checks
- Storage location and quantity tracking
- Disposal record management and waste manifest generation
- Regulatory reporting (COSHH, REACH, RoHS, hazardous waste)
- Expiry and review date alerting for SDS and assessments

## Prerequisites
- IMS platform running and accessible
- Admin credentials available (admin@ims.local / admin123)
- Test data seeded via seed scripts
- Storage location hierarchy configured (building, room, cabinet)
- At least one supplier record in the Suppliers module
- PDF reader available for SDS viewing tests
- User accounts with distinct roles (Chemical Manager, COSHH Assessor, Read-Only)

## Test Cases

### Chemical Register

#### TC-CHM-001: Add a new chemical to the register
**Given** the user has Chemical Manager permissions
**When** they navigate to Chemicals and click "Add Chemical"
**And** they complete all required fields (chemical name, CAS number, supplier, GHS hazard classes, quantity, storage location)
**Then** the chemical is saved in the register with a unique reference number
**And** the chemical is immediately searchable in the register

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-CHM-002: Assign GHS hazard pictograms to a chemical entry
**Given** the user is creating or editing a chemical record
**When** they select the applicable GHS hazard pictograms (e.g. Flammable, Corrosive, Toxic)
**Then** the selected pictograms are saved and displayed on the chemical's detail page
**And** the hazard classification is included in any generated SDS summary

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-CHM-003: Update the quantity of a chemical in stock
**Given** a chemical exists in the register with a current quantity
**When** the user edits the chemical and updates the quantity on hand
**And** provides a reason for the adjustment (e.g. stock received, used in process)
**Then** the new quantity is saved and the adjustment is logged in the chemical's transaction history
**And** if the quantity falls below the minimum stock level, a low-stock alert is generated

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-CHM-004: Search the chemical register by name and CAS number
**Given** multiple chemicals are registered in the system
**When** the user enters a partial chemical name in the search box
**Then** matching chemicals are returned instantly with their name, CAS number, and hazard class
**And** searching by CAS number also returns the correct matching record

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-CHM-005: Retire a chemical that is no longer used on site
**Given** a chemical no longer in use exists in the register
**When** the Chemical Manager sets the chemical status to "Retired" and provides a reason
**Then** the chemical is removed from the active register view
**And** the chemical record is retained in the archived register with all historical data intact

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

### SDS Management

#### TC-CHM-006: Upload a Safety Data Sheet for a chemical
**Given** a chemical record exists in the register
**When** the user uploads a PDF SDS document and sets the revision date and next review date
**Then** the SDS is stored against the chemical record and marked as the "Current" version
**And** a preview of the SDS is accessible without downloading the file

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-CHM-007: Replace an outdated SDS with a new version
**Given** a chemical has an existing SDS uploaded
**When** the user uploads a new version of the SDS
**Then** the new SDS becomes the "Current" version
**And** the previous version is retained in the SDS version history with its original revision date

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-CHM-008: Receive an SDS review-due alert
**Given** a chemical's SDS has a next review date within the next 30 days
**When** the daily alert check process runs
**Then** the Chemical Manager receives a notification that the SDS review is due
**And** the chemical is flagged with a "SDS Review Due" badge in the register

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-CHM-009: Share SDS with a worker via email or QR code
**Given** a current SDS exists for a chemical
**When** the Chemical Manager uses the "Share SDS" function and selects email distribution
**And** enters one or more recipient email addresses
**Then** recipients receive an email with a link to view or download the SDS
**And** the share action is recorded in the chemical's audit log

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-CHM-010: Bulk import SDS documents for multiple chemicals
**Given** the user has SDS PDFs for 10 chemicals prepared
**When** they use the bulk upload facility and map each file to the corresponding chemical record
**Then** all 10 SDS documents are attached to their respective chemicals
**And** a confirmation summary shows the count of successful and failed uploads

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

### COSHH Assessment

#### TC-CHM-011: Create a COSHH risk assessment for a chemical
**Given** a chemical record exists with an SDS attached
**When** the COSHH Assessor creates a new assessment linked to the chemical
**And** completes the exposure scenario, route of exposure, control measures, and health surveillance fields
**Then** the assessment is saved in Draft status and linked to the chemical record
**And** a unique assessment reference number is assigned

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-CHM-012: Calculate health risk rating in a COSHH assessment
**Given** the COSHH assessor has entered exposure frequency, duration, and quantity used
**When** they save the exposure scenario section
**Then** the system calculates a health risk rating (Low/Medium/High/Very High) based on the entered data
**And** the rating is displayed prominently on the assessment summary

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-CHM-013: Record control measures in a COSHH assessment
**Given** a COSHH assessment is in Draft status
**When** the assessor selects control measures from the hierarchy (LEV, PPE, admin controls, substitution)
**And** specifies the PPE type (gloves, respirator, goggles) required
**Then** the controls are saved and the residual risk rating is updated
**And** PPE requirements are surfaced in a summary visible to operatives

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-CHM-014: Submit a COSHH assessment for approval
**Given** a COSHH assessment is complete in Draft status
**When** the assessor clicks "Submit for Approval"
**Then** the assessment status changes to "Pending Approval"
**And** the designated approver receives a notification to review and sign off

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-CHM-015: Approve and publish a COSHH assessment
**Given** a COSHH assessment is in "Pending Approval" status
**When** the approver reviews the assessment and clicks "Approve"
**Then** the assessment status changes to "Approved" and it is published for use
**And** the approval is recorded with the approver's name, role, and timestamp

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

### Storage & Disposal

#### TC-CHM-016: Assign a chemical to a storage location
**Given** a chemical exists in the register without a storage location
**When** the user assigns the chemical to a specific storage location (building, room, cabinet)
**And** enters the quantity stored at that location
**Then** the storage location is saved and visible on the chemical's detail page
**And** the location appears on the storage map with the chemical listed

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-CHM-017: Detect an incompatible chemical co-storage violation
**Given** a chemical classified as a strong oxidiser is already stored in Cabinet A
**When** the user attempts to assign a flammable solvent to the same Cabinet A location
**Then** the system displays an incompatibility warning identifying the specific conflict
**And** the user must confirm acceptance of the risk or assign the chemical to a different location

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-CHM-018: Record the disposal of a chemical quantity
**Given** a chemical has a quantity on hand and is no longer needed
**When** the user creates a disposal record specifying the quantity, disposal method, contractor, and date
**Then** the quantity on hand is reduced by the disposed amount
**And** the disposal record is stored in the chemical's history and included in the waste register

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-CHM-019: Generate a hazardous waste consignment note
**Given** one or more disposal records for hazardous chemicals exist
**When** the user selects the records and clicks "Generate Consignment Note"
**Then** a formatted consignment note PDF is generated with chemical names, quantities, hazard codes, and disposal contractor details
**And** the generated document is stored in the chemical's document archive

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-CHM-020: Alert when chemical storage quantity exceeds maximum threshold
**Given** a chemical has a defined maximum storage quantity limit
**When** the user records a stock addition that causes the total stored quantity to exceed the limit
**Then** the system displays a maximum quantity exceeded warning
**And** a notification is sent to the Chemical Manager and EHS Coordinator

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

### Reporting

#### TC-CHM-021: Generate a site chemical inventory report
**Given** multiple chemicals are registered with current quantities
**When** the user runs the "Site Chemical Inventory" report
**Then** the report lists all active chemicals with name, CAS number, quantity, location, and hazard class
**And** the report can be exported as PDF or CSV

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-CHM-022: Generate a COSHH assessment register report
**Given** multiple COSHH assessments are in the system across different statuses
**When** the user runs the "COSHH Assessment Register" report
**Then** the report lists all assessments with chemical name, risk rating, status, and review date
**And** assessments due for review within 60 days are highlighted

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-CHM-023: Export data for a REACH substance inventory declaration
**Given** chemicals in the register include REACH-registerable substances above the threshold tonnage
**When** the user runs the "REACH Inventory" export
**Then** the export file contains all required fields (substance name, CAS, REACH registration number, tonnage, supplier)
**And** the file is formatted for submission to the regulatory authority

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-CHM-024: View a dashboard summary of chemicals by hazard class
**Given** chemicals with various GHS hazard classes are registered in the system
**When** the user opens the Chemicals Dashboard
**Then** a chart displays the breakdown of chemicals by hazard class (Flammable, Toxic, Corrosive, etc.)
**And** clicking a segment filters the chemical register to that hazard class

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-CHM-025: Audit log records all chemical register changes
**Given** a chemical record has been created, updated, and had its SDS replaced
**When** the user opens the chemical's Audit Log
**Then** all actions are listed chronologically with the action type, field changed, old value, new value, user, and timestamp
**And** the audit log cannot be edited or deleted by any user role

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
