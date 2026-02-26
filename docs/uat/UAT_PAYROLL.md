# UAT Test Plan: Payroll

---
> **CONFIDENTIAL — TRADE SECRET**
> This document is the property of Nexara DMCC and contains confidential and
> proprietary information. Unauthorised disclosure is prohibited.
> © 2026 Nexara DMCC. All rights reserved.
---

**Version**: 1.0
**Date**: 2026-02-23
**Module**: Payroll
**Port**: 4007
**Prepared by**: QA Team
**Status**: Draft

## Overview
The Payroll module manages end-to-end payroll processing for all employees, including payroll run creation, payslip generation, deduction and benefit configuration, tax and National Insurance calculations, and period-end reporting. It integrates with the HR module for employee data and with the Finance module for journal postings and cost centre allocation.

## Scope
- Creating and processing payroll runs for monthly and weekly pay frequencies
- Generating employee payslips with full breakdown of earnings and deductions
- Configuring recurring and one-off deductions and employee benefits
- Applying tax codes, calculating PAYE and National Insurance contributions
- Producing payroll summary reports, P60s, P11Ds, and year-end submissions

## Prerequisites
- IMS platform running and accessible
- Admin credentials available (admin@ims.local / admin123)
- Test data seeded via seed scripts
- HR module operational with at least 10 active employees loaded
- Tax tables and NI thresholds configured for the current tax year
- At least one payroll jurisdiction configured via `api-payroll` jurisdictions endpoint

## Test Cases

### Payroll Runs

#### TC-PAY-001: Create a new monthly payroll run
**Given** the user is authenticated and on the Payroll module dashboard (port 3007)
**When** the user selects "New Payroll Run" and enters pay period "March 2026", frequency "Monthly", and pay date "2026-03-31"
**And** the user clicks "Save Draft"
**Then** the payroll run is created with status "Draft"
**And** the reference number is auto-generated in the format `PAY-RUN-YYYY-NNN`

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-PAY-002: Add employees to a payroll run
**Given** a payroll run exists in "Draft" status
**When** the user opens the run and selects "Add Employees", then selects all active employees from the list
**And** clicks "Confirm Selection"
**Then** all selected employees appear in the payroll run employee list
**And** gross pay is pre-populated from each employee's contracted salary

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-PAY-003: Process a payroll run
**Given** a payroll run in "Draft" status with employees added and all figures reviewed
**When** the user clicks "Process Payroll Run" and confirms the action in the confirmation dialog
**Then** the payroll run status changes to "Processing"
**And** within 30 seconds the status transitions to "Processed" with net pay totals calculated

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-PAY-004: Lock a processed payroll run
**Given** a payroll run with status "Processed" and all figures verified
**When** the user clicks "Lock Run" and enters the authorisation PIN
**Then** the payroll run status changes to "Locked"
**And** no further edits can be made to employee pay figures in the run

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-PAY-005: Prevent duplicate payroll runs for the same period
**Given** a payroll run already exists for "March 2026" Monthly frequency
**When** a second user attempts to create another payroll run for "March 2026" Monthly
**Then** the system displays an error: "A payroll run already exists for this period and frequency"
**And** the duplicate run is not created

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

### Employee Payslips

#### TC-PAY-006: View an individual employee payslip
**Given** a payroll run has been processed and locked
**When** the user navigates to an employee record within the run and selects "View Payslip"
**Then** the payslip displays the employee's name, NI number, tax code, gross pay, all deductions, and net pay
**And** the payslip is formatted ready for download as PDF

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-PAY-007: Download payslip as PDF
**Given** a processed payslip is displayed for an employee
**When** the user clicks "Download PDF"
**Then** a PDF file is generated and downloaded to the user's device
**And** the PDF contains all payslip fields including employer NI contributions

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-PAY-008: Send payslip to employee via email
**Given** a locked payroll run with payslips generated
**When** the user selects "Email All Payslips" and confirms
**Then** each employee receives an email with their payslip PDF attached
**And** the system logs the email dispatch with timestamp and recipient address

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-PAY-009: View payslip history for an employee
**Given** the user is viewing an employee's HR profile
**When** the user navigates to the "Payslips" tab
**Then** a chronological list of all payslips is displayed, most recent first
**And** each entry shows pay period, gross pay, deductions total, and net pay

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-PAY-010: Override gross pay for a single employee in a run
**Given** a payroll run in "Draft" status
**When** the user selects an employee and overrides their gross pay with a different figure, providing a reason
**Then** the updated gross pay is saved and flagged with an "Override" indicator
**And** net pay and deductions are recalculated based on the overridden gross figure

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

### Deductions & Benefits

#### TC-PAY-011: Create a recurring salary deduction
**Given** the user is in the Payroll configuration section under "Deductions"
**When** the user creates a new deduction named "Cycle to Work Scheme", type "Fixed Amount", value "£83.33", frequency "Monthly"
**And** assigns it to a specific employee
**Then** the deduction appears on that employee's profile under active deductions
**And** it is automatically applied to all future payroll runs for that employee

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-PAY-012: Create a one-off bonus payment
**Given** the user is managing a draft payroll run
**When** the user selects an employee and adds a one-off addition "Annual Bonus" with value "£2,500.00"
**Then** the bonus is added to the employee's gross pay for this run only
**And** the addition is listed separately in the payslip breakdown

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-PAY-013: Configure an employee benefit (company car)
**Given** the user navigates to an employee's benefits configuration
**When** the user adds a "Company Car" benefit with a P11D value of "£24,000" and engine type "Petrol"
**Then** the benefit in kind value is calculated and stored
**And** the benefit appears on the employee's P11D report at year-end

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-PAY-014: Apply a court order deduction (attachment of earnings)
**Given** the user is in the employee deductions section
**When** the user creates an "Attachment of Earnings" deduction with a weekly protected earnings figure and a deduction rate
**Then** the system calculates the correct deduction amount respecting the protected earnings threshold
**And** the deduction is applied before net pay is finalised

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-PAY-015: Terminate a recurring deduction
**Given** an active recurring deduction exists on an employee record
**When** the user selects the deduction and sets an end date of "2026-03-31", then saves
**Then** the deduction is applied in the March 2026 payroll run
**And** the deduction does not appear in subsequent payroll runs for that employee

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

### Tax & NI Calculations

#### TC-PAY-016: Apply standard tax code and verify PAYE calculation
**Given** an employee with tax code "1257L" and annual gross salary of "£30,000"
**When** the monthly payroll run is processed
**Then** the PAYE deduction equals the correct monthly tax calculated using cumulative basis
**And** the tax-free allowance of £12,570 per annum is correctly applied

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-PAY-017: Apply emergency tax code (Month 1 basis)
**Given** a new employee with tax code "1257L W1/M1" (non-cumulative)
**When** the payroll run is processed
**Then** tax is calculated on a Month 1 basis using only the current month's allowance
**And** previous earnings history is not used in the calculation

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-PAY-018: Calculate National Insurance contributions
**Given** an employee with monthly gross pay of "£2,500" in the current tax year
**When** the payroll run is processed
**Then** employee NI is deducted at the correct rate for earnings between the Primary Threshold and Upper Earnings Limit
**And** employer NI is calculated at the correct rate above the Secondary Threshold

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-PAY-019: Handle tax code change mid-period
**Given** HMRC has issued a tax code change for an employee from "1257L" to "1100L"
**When** the user updates the employee's tax code and processes the next payroll run
**Then** the new tax code is applied from the current pay period
**And** any underpayment or overpayment adjustment is reflected in the payslip

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-PAY-020: Process payroll for an employee who exceeds the Higher Rate threshold
**Given** an employee with year-to-date earnings that push them into the 40% Higher Rate band
**When** the payroll run for the month of crossover is processed
**Then** the system applies 20% to earnings below the Higher Rate threshold
**And** 40% is applied to earnings above the threshold within the same pay period

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

### Payroll Reporting

#### TC-PAY-021: Generate payroll summary report
**Given** at least one locked payroll run exists
**When** the user navigates to Reports and selects "Payroll Summary", choosing a date range covering the locked run
**Then** the report displays total gross pay, total deductions, total net pay, and headcount
**And** the report can be exported as CSV or PDF

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-PAY-022: Generate P60 for an employee at year-end
**Given** the current tax year is finalised and all runs are locked
**When** the user navigates to "Year-End" and selects "Generate P60s" for all employees
**Then** individual P60 documents are generated for each active employee
**And** each P60 shows total pay, total tax deducted, and NI contributions for the full year

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-PAY-023: Generate P11D report for benefits in kind
**Given** employees have benefits in kind recorded for the tax year
**When** the user selects "Generate P11D Reports" from the Year-End section
**Then** a P11D is produced for each employee with taxable benefits
**And** the report correctly categorises each benefit type per HMRC guidance

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-PAY-024: View cost centre payroll breakdown
**Given** employees are assigned to different cost centres in the HR module
**When** the user runs the "Cost Centre Analysis" payroll report for the current period
**Then** the report groups payroll costs by cost centre
**And** employer NI and pension contributions are included in each cost centre's totals

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-PAY-025: Export BACS payment file
**Given** a payroll run has been locked and all net pay figures confirmed
**When** the user selects "Export BACS File" and confirms the bank details
**Then** a BACS-formatted file is generated containing each employee's net pay and bank details
**And** the file is available for download and submission to the bank

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

## Sign-Off
| Role | Name | Signature | Date |
|------|------|-----------|------|
| QA Lead | | | |
| Product Owner | | | |
| Technical Lead | | | |
| Business Stakeholder | | | |
