# UAT Test Plan: ISO 37001 Anti-Bribery Management System

---
> **CONFIDENTIAL — TRADE SECRET**
> This document is the property of Nexara DMCC and contains confidential and
> proprietary information. Unauthorised disclosure is prohibited.
> © 2026 Nexara DMCC. All rights reserved.
---

**Version**: 1.0
**Date**: 2026-02-23
**Module**: iso37001
**Port**: 4024
**Prepared by**: QA Team
**Status**: Draft

## Overview
The ISO 37001 module supports organisations in implementing and maintaining an Anti-Bribery Management System (ABMS) in accordance with ISO 37001:2016. It provides structured tools for managing anti-bribery policies, conducting bribery risk assessments, performing third-party due diligence, maintaining a gift and hospitality register, and mapping controls to ISO 37001 clauses for gap assessment and certification readiness.

## Scope
- Managing and versioning the anti-bribery policy document
- Maintaining a bribery risk register with scoring and treatment plans
- Recording and tracking third-party due diligence assessments
- Managing the gift and hospitality register with approval workflows
- Mapping controls to ISO 37001 clauses and assessing compliance gaps

## Prerequisites
- IMS platform running and accessible
- Admin credentials available (admin@ims.local / admin123)
- Test data seeded via seed scripts
- `api-iso37001` service running on port 4024
- `web-iso37001` frontend accessible on port 3025
- `@ims/standards-convergence` package configured with ISO 37001:2016 clause library
- At least one active organisation with Compliance Officer and Top Management roles assigned
- Third-party supplier records available in the Suppliers module

## Test Cases

### Anti-Bribery Policy

#### TC-I37-001: Create a new anti-bribery policy document
**Given** the user is logged in as a Compliance Officer on the ISO 37001 dashboard
**When** the user navigates to Policy Management and clicks "New Policy"
**And** fills in the policy title, scope, effective date, owner, and body text from the provided template
**Then** the policy is created with version 1.0, status "Draft", and a reference in the format `ABP-YYYY-NNN`
**And** the policy appears in the policy register with the correct status and effective date

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

#### TC-I37-002: Submit an anti-bribery policy for management approval
**Given** a draft anti-bribery policy exists with all required fields completed
**When** the Compliance Officer clicks "Submit for Approval" and selects a Top Management approver
**Then** the policy status changes from "Draft" to "Pending Approval"
**And** the selected approver receives a notification with a direct link to the policy review screen

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

#### TC-I37-003: Approve and publish an anti-bribery policy
**Given** a policy is in "Pending Approval" status and the current user is the assigned approver
**When** the approver opens the policy, reviews the content, adds an approval comment, and clicks "Approve & Publish"
**Then** the policy status changes to "Active" and the version number is confirmed as 1.0
**And** all staff with the "Requires Policy Acknowledgement" flag receive a notification to read and sign the policy

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

#### TC-I37-004: Create a revised version of an existing active policy
**Given** an active anti-bribery policy at version 1.0 requires updating due to a regulatory change
**When** the Compliance Officer opens the active policy and clicks "Create New Version"
**Then** a new draft version 2.0 is created with the same content as version 1.0
**And** the original version 1.0 remains active and accessible until the new version is published

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

#### TC-I37-005: Record a staff acknowledgement of the anti-bribery policy
**Given** an active anti-bribery policy has been published and a staff member has received the acknowledgement request
**When** the staff member opens the policy link, reads through the document, and clicks "I Acknowledge"
**Then** their acknowledgement is recorded with a timestamp in the policy acknowledgement register
**And** the policy register shows the updated acknowledgement percentage for the active policy

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

### Risk Assessment

#### TC-I37-006: Add a bribery risk to the risk register
**Given** the user is on the ISO 37001 Risk Register page
**When** the user clicks "New Risk" and enters the risk title "Procurement officer accepting vendor gifts", category "Transactional", likelihood 4, impact 4, and assigns an owner
**Then** the risk is saved with an inherent risk score of 16 (High) and a reference in the format `BR-YYYY-NNN`
**And** the risk appears in the register sorted by descending risk score

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

#### TC-I37-007: Apply a control treatment to a bribery risk
**Given** a bribery risk with "High" inherent score exists in the register
**When** the user opens the risk and adds a control treatment specifying gift declaration policy, approval threshold, and mandatory training
**And** sets residual likelihood to 2 and residual impact to 2 and saves
**Then** the residual risk score is calculated as 4 (Low)
**And** the risk register displays both inherent and residual scores with a colour-coded indicator

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

#### TC-I37-008: Map a bribery risk to an ISO 37001 clause
**Given** a bribery risk record is open in edit mode
**When** the user navigates to the "Clause Mapping" tab and links the risk to ISO 37001 clause 8.2 (Bribery risk assessment)
**Then** the clause mapping is saved against the risk record
**And** the ISO 37001 clause 8.2 compliance view shows this risk as evidence of risk assessment activity

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

#### TC-I37-009: Conduct a periodic review of the bribery risk register
**Given** the bribery risk register has been configured for annual review
**When** the annual review date arrives and the Compliance Officer opens the risk register review workflow
**And** reviews all risks and updates the review date without making other changes
**Then** all risks are stamped with the new review date and status remains "Current"
**And** the review activity is logged in the register's audit trail

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

#### TC-I37-010: Export the bribery risk register as a report
**Given** the bribery risk register contains at least 5 risk entries
**When** the user clicks "Export Report" and selects PDF format
**Then** a PDF is downloaded listing all risks with reference, description, category, inherent score, residual score, control treatment, and owner
**And** the report header includes the organisation name, report date, and prepared by field

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

### Due Diligence

#### TC-I37-011: Create a due diligence assessment for a third party
**Given** a supplier record exists in the Suppliers module
**When** the user navigates to Due Diligence and clicks "New Assessment"
**And** links the assessment to the supplier, sets the assessment type to "Enhanced", and fills in the scope and assessor fields
**Then** a due diligence assessment is created with status "In Progress" and reference `DD-YYYY-NNN`
**And** the linked supplier record displays a badge indicating an active due diligence assessment

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

#### TC-I37-012: Complete the due diligence questionnaire for a third party
**Given** a due diligence assessment is "In Progress" and the questionnaire has been sent to the third party
**When** the assessor fills in all questionnaire sections including ownership structure, legal history, sanctions check, and PEP screening
**And** saves the completed questionnaire
**Then** all sections are marked as complete and a due diligence score is calculated
**And** the assessment summary displays the score, risk category, and any red flag items identified

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

#### TC-I37-013: Flag a third party as high-risk based on due diligence findings
**Given** a due diligence assessment has returned a high-risk score or identified a red flag
**When** the assessor sets the third-party risk classification to "High Risk" and adds commentary
**And** submits the assessment for Compliance Officer review
**Then** the assessment status changes to "Escalated" and the Compliance Officer is notified
**And** the supplier record in the Suppliers module is updated to display a "High Risk — Anti-Bribery" flag

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

#### TC-I37-014: Approve and close a standard due diligence assessment
**Given** a due diligence assessment has been completed and submitted for review with a low risk result
**When** the Compliance Officer reviews the assessment and clicks "Approve"
**Then** the assessment status changes to "Approved" with the approval date and approver recorded
**And** a renewal reminder is scheduled based on the configured reassessment period (default 12 months)

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

#### TC-I37-015: View a dashboard of all due diligence statuses
**Given** multiple due diligence assessments exist across different third parties and statuses
**When** the user navigates to the Due Diligence Dashboard
**Then** a summary view displays counts by status: In Progress, Escalated, Approved, Overdue for Renewal
**And** an overdue renewal list highlights all third parties whose reassessment date has passed

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

### Controls & Procedures

#### TC-I37-016: Add an entry to the gift and hospitality register
**Given** a staff member has received a gift from an external party
**When** the staff member navigates to the Gift & Hospitality Register and clicks "Record Gift"
**And** fills in the description, estimated value, donor name, date received, and selects "Received" as the direction
**Then** the gift entry is saved in the register with status "Pending Approval" if value exceeds the declaration threshold
**And** the line manager is notified to review the declaration

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

#### TC-I37-017: Approve a gift declaration below the escalation threshold
**Given** a gift declaration has been submitted with a value below the escalation threshold
**When** the line manager opens the declaration and clicks "Approve"
**Then** the declaration status changes to "Approved"
**And** the gift register entry shows the approver name and approval date

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

#### TC-I37-018: Reject a hospitality offer exceeding the policy threshold
**Given** a hospitality offer has been declared with a value exceeding the policy threshold
**When** the Compliance Officer reviews the record and clicks "Reject"
**And** enters the rejection reason referencing the anti-bribery policy clause
**Then** the declaration status changes to "Rejected" and the declaring staff member is notified
**And** the record remains in the register with "Rejected" status for audit purposes

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

#### TC-I37-019: Search the gift and hospitality register by staff member and date range
**Given** the gift and hospitality register contains at least 10 entries from multiple staff members
**When** the user applies a filter for a specific staff member name and a date range of the last 6 months
**Then** only entries matching both the staff member and the date range are returned
**And** a totals row shows the aggregate declared value for the filtered results

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

#### TC-I37-020: Link an anti-bribery control to an ISO 37001 clause
**Given** a documented control "Segregation of duties in procurement" exists in the controls library
**When** the user opens the control and maps it to ISO 37001 clause 8.9 (Financial controls)
**Then** the mapping is saved and the control appears in the ISO 37001 clause 8.9 evidence list
**And** the clause compliance indicator for 8.9 updates to reflect the newly mapped control

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

### Reporting & Monitoring

#### TC-I37-021: Run an ISO 37001 gap assessment
**Given** the ISO 37001 clause library is loaded and at least 10 controls are mapped to clauses
**When** the user navigates to Gap Assessment and clicks "Run Assessment"
**Then** the system evaluates each ISO 37001 clause against the mapped controls and evidence
**And** a gap report is displayed showing each clause with status: Compliant, Partial, Gap, or Not Applicable

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

#### TC-I37-022: View ISO 37001 clause compliance heat map
**Given** a gap assessment has been completed
**When** the user navigates to the Compliance Overview page
**Then** a heat map is displayed showing each ISO 37001 section colour-coded by compliance level (green, amber, red)
**And** clicking any section navigates to the detailed clause list for that section showing individual clause statuses

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

#### TC-I37-023: Generate an ISO 37001 certification readiness report
**Given** a gap assessment has been completed with at least some compliant and partial clauses
**When** the user selects "Certification Readiness Report" from the Reports menu
**Then** a report is generated showing overall readiness percentage, fully compliant clauses, partial clauses, and identified gaps
**And** the report includes a recommended actions section listing the top priority gaps to address before audit

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

#### TC-I37-024: Schedule a periodic anti-bribery compliance review
**Given** the organisation requires a quarterly ABMS compliance review
**When** the Compliance Officer navigates to Review Scheduling and creates a quarterly recurring review
**And** sets the first review date and assigns reviewers
**Then** the scheduled reviews appear in the compliance calendar at 3-month intervals
**And** reminder notifications are configured to be sent to reviewers 7 days before each review date

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

#### TC-I37-025: Export the full ISO 37001 compliance evidence pack
**Given** multiple policies, risk records, due diligence assessments, gift register entries, and clause mappings exist
**When** the user navigates to Reports and selects "ISO 37001 Evidence Pack" and clicks "Generate"
**Then** a consolidated PDF is produced containing the policy summary, risk register extract, due diligence summary, gift register summary, and clause mapping matrix
**And** the evidence pack is stored against the current review period and available for download by auditors

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
