# UAT Test Plan: Field Service Management Module

---
> **CONFIDENTIAL — TRADE SECRET**
> This document is the property of Nexara DMCC and contains confidential and
> proprietary information. Unauthorised disclosure is prohibited.
> © 2026 Nexara DMCC. All rights reserved.
---


**Document ID:** UAT-FS2-001
**Version:** 1.0
**Date:** 2026-02-23
**Module:** Field Service Management
**Environment:** Staging (api-field-service:4022 / web-field-service:3023)
**Tester:** ****************\_\_\_\_****************
**Sign-Off Date:** ****************\_\_\_\_****************

---

## Job Management (5 scenarios)

### TC-FSM-001: Create Maintenance Job with HIGH Priority

**Given** I am logged in as a Field Service Coordinator
**When** I navigate to Field Service > Jobs and click "New Job"
**And** I enter: Title "Annual HVAC Preventive Maintenance — Unit 3B", Job Type "MAINTENANCE", Priority "HIGH", Customer "Nexara Facilities Ltd", Site Address "42 Meridian Way, Leeds LS1 4AP", Scheduled Date "2026-03-05", Estimated Duration "4 hours", Description "Annual service and filter replacement for rooftop HVAC unit 3B"
**Then** the job is created with reference "JOB-2602-XXXX" and status "SCHEDULED"
**And** the job appears in the jobs board under "MAINTENANCE" type with a HIGH priority badge
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-FSM-002: Assign Job to Technician

**Given** job "JOB-2602-0001" (HVAC Maintenance, HIGH priority) exists with status "SCHEDULED" and technician "P. Okafor" is AVAILABLE with skill "HVAC"
**When** I open the job and click "Assign Technician", select "P. Okafor" from the available technicians list, and confirm
**Then** the job is assigned to technician "P. Okafor"
**And** the technician's status changes to "BUSY"
**And** the job detail view shows the assigned technician name and contact
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-FSM-003: Progress Job Status through Full Lifecycle

**Given** job "JOB-2602-0001" is SCHEDULED and assigned to technician "P. Okafor"
**When** I update the status to "IN_PROGRESS" (technician on-site) and record the actual start time
**And** I subsequently update the status to "COMPLETED" and record the actual end time and completion notes "All filters replaced, system recharged, function test passed"
**Then** the job status progresses: SCHEDULED → IN_PROGRESS → COMPLETED
**And** each status change is timestamped and recorded in the job history
**And** the technician's status returns to "AVAILABLE" upon job COMPLETED
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-FSM-004: Verify Customer Record Linked to Job

**Given** job "JOB-2602-0001" was created with customer "Nexara Facilities Ltd"
**When** I view the job detail page
**Then** the customer "Nexara Facilities Ltd" is displayed as a linked record with their contact details
**And** clicking the customer link navigates to the customer record
**And** the customer record shows job "JOB-2602-0001" in their job history
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-FSM-005: Add Notes to a Job

**Given** job "JOB-2602-0001" (HVAC Maintenance) is IN_PROGRESS
**When** I click "Add Note" on the job detail page and enter: "Access to rooftop requires permit from site facilities team — contact J. Briggs on 07700 900123 before arrival. Parking available in bay 4."
**Then** the note is saved and linked to the job with the author and timestamp recorded
**And** the note appears in the job notes panel visible to all users with access to the job
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Technician Management (5 scenarios)

### TC-FSM-006: Create Technician with Skills

**Given** I am logged in as a Field Service Manager
**When** I navigate to Field Service > Technicians and click "New Technician"
**And** I enter: Name "A. Mensah", Employee ID "TECH-0047", Region "Yorkshire", Skills ["HVAC", "Electrical"], Certifications ["Gas Safe Registered", "IPAF Licence"], Status "AVAILABLE", Contact Email "a.mensah@fieldservice.local"
**Then** the technician record is created with the specified details
**And** the technician appears in the technician register with skills "HVAC" and "Electrical" and status "AVAILABLE"
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-FSM-007: Technician Status Set AVAILABLE on Creation

**Given** technician "A. Mensah" (TECH-0047) was created with status "AVAILABLE"
**When** I view the technician record
**Then** the status field displays "AVAILABLE"
**And** the technician appears in the available technicians filter on the job assignment screen
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-FSM-008: Update Technician to BUSY on Job Assignment

**Given** technician "A. Mensah" has status "AVAILABLE" and job "JOB-2602-0002" is SCHEDULED
**When** I assign technician "A. Mensah" to job "JOB-2602-0002"
**Then** the technician status updates to "BUSY"
**And** the technician no longer appears in the "AVAILABLE" filter on the job assignment screen for other jobs
**And** when job "JOB-2602-0002" is marked COMPLETED, the technician status reverts to "AVAILABLE"
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-FSM-009: View Technician Schedule

**Given** technician "A. Mensah" (TECH-0047) has three jobs assigned across the next two weeks
**When** I navigate to the technician record and click "View Schedule"
**Then** a calendar or list view displays all assigned jobs with their scheduled dates, times, and locations
**And** I can navigate forward and back through the schedule by week or month
**And** conflicts (two jobs on the same date/time) are highlighted in the schedule view
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-FSM-010: Filter Technicians by Region and Skill

**Given** technicians exist across multiple regions (Yorkshire, Lancashire, Midlands) with varied skills
**When** I apply filters Region "Yorkshire" and Skill "HVAC" on the Technicians list
**Then** only technicians in the Yorkshire region with the HVAC skill are displayed
**And** the count reflects the filtered results
**And** clearing the filters restores the full technician list
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Customer Management (5 scenarios)

### TC-FSM-011: Add Customer with SLA Notes

**Given** I am logged in as a Field Service Coordinator
**When** I navigate to Field Service > Customers and click "New Customer"
**And** I enter: Company Name "Pinnacle Industrial Ltd", Contact Name "R. Stafford", Email "r.stafford@pinnacle.co.uk", Phone "0113 496 0200", Address "Unit 7, Aire Valley Trading Estate, Leeds LS14 6QQ", SLA Notes "Priority 1 callout SLA: 4-hour response, 8-hour fix. All maintenance visits require 48-hour pre-notification."
**Then** the customer record is created with the specified details
**And** the SLA notes are displayed prominently on the customer record and on any linked job
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-FSM-012: View Customer Job History

**Given** customer "Pinnacle Industrial Ltd" has had four jobs completed over the past six months
**When** I navigate to the customer record and click "Job History"
**Then** all four jobs are listed with their reference, type, date, status, and assigned technician
**And** the job history is sorted in reverse chronological order
**And** I can click any job to navigate to its full detail
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-FSM-013: Update Customer Contact Details

**Given** customer "Pinnacle Industrial Ltd" has contact email "r.stafford@pinnacle.co.uk"
**When** I edit the customer record and update the contact email to "richard.stafford@pinnacle.co.uk" and phone to "0113 496 0250"
**Then** the customer record is updated with the new contact details
**And** the change is reflected immediately in the customer list view and any linked jobs
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-FSM-014: Search Customer by Name

**Given** multiple customers exist in the system
**When** I enter "Pinnacle" in the customer search field and submit
**Then** the search results list all customers whose name contains "Pinnacle"
**And** the results include "Pinnacle Industrial Ltd" with their contact details visible
**And** partial name matches are returned (e.g. searching "pinn" also returns the same customer)
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-FSM-015: Verify Deleted Customer Returns 404

**Given** a test customer "Temp Test Customer Ltd" was created for testing purposes
**When** I delete the customer record and confirm the deletion
**Then** the customer is removed from the customer list
**And** a GET request to `/api/field-service/customers/<id>` returns HTTP 404
**And** any jobs previously linked to the deleted customer retain their customer name as a historical reference
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Invoicing (5 scenarios)

### TC-FSM-016: Generate Invoice from Completed Job

**Given** job "JOB-2602-0001" (HVAC Maintenance, Nexara Facilities Ltd) has status "COMPLETED"
**When** I click "Generate Invoice" on the completed job
**Then** a new invoice is created with reference "INV-2602-XXXX" linked to job "JOB-2602-0001" and customer "Nexara Facilities Ltd"
**And** the invoice is created with status "DRAFT" and the job reference pre-populated
**And** the invoice is accessible from both the job detail and the Invoicing register
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-FSM-017: Add Labour and Parts Line Items to Invoice

**Given** invoice "INV-2602-0001" (DRAFT) is linked to job "JOB-2602-0001"
**When** I add two line items: (1) Type "LABOUR", Description "HVAC Service — 4 hours", Quantity 4, Unit Rate £85.00, Amount £340.00 and (2) Type "PARTS", Description "HVAC Filter Set (x3)", Quantity 3, Unit Rate £24.50, Amount £73.50
**Then** both line items are saved on the invoice
**And** the invoice total is calculated as £413.50 (before applicable taxes)
**And** the line items are listed in the invoice detail view
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-FSM-018: Send Invoice (DRAFT to SENT)

**Given** invoice "INV-2602-0001" with line items totalling £413.50 has status "DRAFT"
**When** I click "Send Invoice" and confirm the action (optionally entering a customer email address)
**Then** the invoice status changes from "DRAFT" to "SENT"
**And** the sent date is recorded on the invoice record
**And** the invoice can no longer be edited once in "SENT" status without creating a credit note
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-FSM-019: Record Payment and Mark Invoice PAID

**Given** invoice "INV-2602-0001" has status "SENT" and total £413.50
**When** I click "Record Payment" and enter: Payment Date "2026-03-20", Amount Received £413.50, Payment Method "BACS", Reference "BACS-20032026-4421"
**Then** the invoice status changes from "SENT" to "PAID"
**And** the payment date, amount, method, and reference are recorded on the invoice
**And** the invoice appears in the "PAID" invoices filter
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-FSM-020: View Revenue by Customer Report

**Given** multiple invoices with status "PAID" exist across several customers
**When** I navigate to Field Service > Reports > Revenue by Customer
**Then** a report is displayed listing each customer with their total invoiced amount and total paid amount for the selected period
**And** I can filter the report by date range and customer
**And** the report total row sums all customer revenues correctly
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## KPIs & Reporting (5 scenarios)

### TC-FSM-021: View First-Time Fix Rate

**Given** at least 20 completed jobs exist with first-time fix status recorded (some required a return visit)
**When** I navigate to Field Service > KPIs
**Then** the First-Time Fix Rate is displayed as a percentage (jobs resolved on first visit ÷ total completed jobs × 100)
**And** the metric is shown for the current month and the trailing 12-month period
**And** a target line is displayed if a first-time fix rate target has been configured
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-FSM-022: View Mean Time to Resolution

**Given** completed jobs have actual start and end times recorded
**When** I view the Mean Time to Resolution (MTTR) KPI panel
**Then** the MTTR is calculated as the average time from job creation to COMPLETED status across all completed jobs in the period
**And** the MTTR is displayed in hours and minutes
**And** the KPI panel shows MTTR by job type (MAINTENANCE, INSTALLATION, EMERGENCY, INSPECTION)
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-FSM-023: View Jobs by Status Summary

**Given** jobs exist across all statuses (SCHEDULED, IN_PROGRESS, COMPLETED, ON_HOLD, CANCELLED)
**When** I view the Jobs by Status panel on the Field Service KPI dashboard
**Then** each status category is shown with a count and percentage of total jobs
**And** the summary covers the selected time period (default: current month)
**And** clicking a status category navigates to the filtered jobs list for that status
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-FSM-024: View Technician Utilisation Percentage

**Given** technicians have scheduled and completed jobs with logged hours for the current month
**When** I view the Technician Utilisation KPI panel
**Then** each technician's utilisation is displayed as a percentage (hours worked ÷ available hours × 100)
**And** technicians are ranked by utilisation percentage
**And** over-utilised technicians (>100%) and under-utilised technicians (<70%) are highlighted
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-FSM-025: Filter KPIs by Date Range

**Given** historical job data exists spanning multiple months
**When** I apply a date range filter on the Field Service KPI dashboard (e.g. "2026-01-01 to 2026-01-31")
**Then** all KPI metrics (first-time fix rate, MTTR, jobs by status, technician utilisation) update to reflect only jobs within the selected date range
**And** the dashboard header shows the active date range filter
**And** clearing the filter restores the default current-month view
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Sign-Off

| Role                  | Name | Signature | Date |
| --------------------- | ---- | --------- | ---- |
| Field Service Manager |      |           |      |
| Product Owner         |      |           |      |
| UAT Lead              |      |           |      |
| Customer Rep          |      |           |      |

**Overall Result:** [ ] PASS -- All scenarios passed / [ ] FAIL -- See notes above
**Release Recommendation:** [ ] Approved for Production / [ ] Requires remediation
