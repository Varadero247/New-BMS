# UAT Test Plan: Finance Management Module

---
> **CONFIDENTIAL — TRADE SECRET**
> This document is the property of Nexara DMCC and contains confidential and
> proprietary information. Unauthorised disclosure is prohibited.
> © 2026 Nexara DMCC. All rights reserved.
---


**Document ID:** UAT-FIN-001
**Version:** 1.0
**Date:** 2026-02-23
**Module:** Finance Management (Invoicing / Budgets / Expenses / Reporting / Purchase Orders)
**Environment:** Staging (api-finance:4013 / web-finance:3013)
**Tester:** **\*\*\*\***\_\_\_\_**\*\*\*\***
**Sign-Off Date:** **\*\*\*\***\_\_\_\_**\*\*\*\***

---

## Invoice Management (5 scenarios)

### TC-FIN-001: Create Sales Invoice with Line Items and VAT

**Given** I am logged in as a Finance Manager
**When** I navigate to Finance > Invoices and click "New Invoice"
**And** I fill in: Customer "Acme Corp", Invoice Date "2026-02-23", Due Date "2026-03-23", Currency "GBP"
**And** I add two line items: "Consulting Services" qty 10 unit price 150.00, "Software Licence" qty 1 unit price 500.00
**And** I apply VAT rate 20% to both lines
**Then** the system creates the invoice with reference "INV-2026-XXXX" and status "DRAFT"
**And** the subtotal is £2,000.00, VAT total is £400.00, and grand total is £2,400.00
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-FIN-002: Approve Invoice and Mark as Sent

**Given** a draft invoice "INV-2026-0001" for "Acme Corp" totalling £2,400.00
**When** I click "Approve" and confirm the approval action
**Then** the invoice status changes from "DRAFT" to "APPROVED"
**When** I then click "Mark as Sent" and enter the sent date "2026-02-23"
**Then** the invoice status changes to "SENT" and the sentDate field is populated
**And** the invoice no longer appears in the "Draft" filter view
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-FIN-003: Record Full Payment Against Invoice

**Given** a sent invoice "INV-2026-0001" with outstanding balance £2,400.00
**When** I click "Record Payment" and enter: Payment Date "2026-03-20", Amount £2,400.00, Method "BANK_TRANSFER", Reference "BACS-REF-20260320"
**Then** the payment is recorded and the invoice status changes to "PAID"
**And** the outstanding balance shows £0.00
**And** the payment appears in the invoice payment history
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-FIN-004: Partially Pay Invoice and Verify Outstanding Balance

**Given** a sent invoice "INV-2026-0002" with total £5,000.00 and status "SENT"
**When** I record a partial payment of £2,000.00 with method "CHEQUE"
**Then** the invoice status changes to "PARTIALLY_PAID"
**And** the outstanding balance shows £3,000.00
**When** I record a second payment of £3,000.00
**Then** the invoice status changes to "PAID" and the outstanding balance shows £0.00
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-FIN-005: Verify Aged Debtors Report Updates After Payment

**Given** invoices "INV-2026-0003" (30 days overdue, £1,200.00) and "INV-2026-0004" (60 days overdue, £800.00) exist in "SENT" status
**When** I navigate to Finance > Reports > Aged Debtors
**Then** the report shows both invoices in the correct aging buckets (30-day and 60-day columns)
**And** the total outstanding balance is £2,000.00
**When** I record full payment for "INV-2026-0003"
**Then** the aged debtors report refreshes and no longer includes "INV-2026-0003" in the outstanding balance
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Budget Management (5 scenarios)

### TC-FIN-006: Create Annual Budget by Department

**Given** I am logged in as a Finance Manager
**When** I navigate to Finance > Budgets and click "New Budget"
**And** I fill in: Name "FY2026 Operations Budget", Financial Year "2026", Department "Operations", Total Amount £500,000.00, Currency "GBP"
**Then** the system creates the budget with reference "BUD-2026-XXXX" and status "DRAFT"
**And** the budget appears in the Budgets list under the "Operations" department filter
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-FIN-007: Allocate Budget by Cost Centre

**Given** an approved budget "BUD-2026-0001" for the Operations department totalling £500,000.00
**When** I add cost centre allocations: "CC-OPS-LABOUR" £250,000.00, "CC-OPS-MATERIALS" £150,000.00, "CC-OPS-OVERHEAD" £100,000.00
**Then** all three allocations are saved and total £500,000.00
**And** the budget detail view shows the breakdown with percentages (50%, 30%, 20%)
**And** unallocated amount shows £0.00
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-FIN-008: Record Actual Spend Against Budget

**Given** budget "BUD-2026-0001" with cost centre "CC-OPS-LABOUR" allocated £250,000.00
**When** I record an actual spend entry: Cost Centre "CC-OPS-LABOUR", Amount £45,000.00, Period "January 2026", Description "January payroll"
**Then** the actual spend for "CC-OPS-LABOUR" shows £45,000.00
**And** the remaining budget for that cost centre shows £205,000.00
**And** the percentage consumed shows 18%
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-FIN-009: View Variance Report (Over/Under Budget)

**Given** budget "BUD-2026-0001" has actual spend recorded across multiple cost centres, with "CC-OPS-MATERIALS" at £160,000.00 actual against £150,000.00 budget
**When** I navigate to Finance > Reports > Budget Variance
**Then** the variance report shows "CC-OPS-MATERIALS" as overspent by £10,000.00 (highlighted in red)
**And** underspent cost centres are highlighted in green
**And** the variance column shows positive values for underspend and negative for overspend
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-FIN-010: Set Budget Alert Threshold at 80%

**Given** budget "BUD-2026-0001" for the Operations department
**When** I open the budget settings and set Alert Threshold to 80% and enable email notifications
**Then** the alertThreshold field is saved as 80
**And** when actual spend reaches 80% of any cost centre allocation, an alert notification is triggered
**And** the budget list view shows a warning indicator for cost centres approaching the threshold
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Expense Management (5 scenarios)

### TC-FIN-011: Submit Expense Claim with Receipts

**Given** I am logged in as an Employee
**When** I navigate to Finance > Expenses and click "New Claim"
**And** I fill in: Description "London client visit", Date "2026-02-20", Category "TRAVEL", Amount £185.50, Currency "GBP"
**And** I upload a receipt image "receipt_train_20260220.jpg"
**And** I add a second line: Category "MEALS", Amount £42.00, receipt "receipt_lunch_20260220.jpg"
**Then** the claim is created with reference "EXP-2026-XXXX" and status "SUBMITTED"
**And** the total claim value shows £227.50
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-FIN-012: Approve Expense Claim by Line Manager

**Given** expense claim "EXP-2026-0001" for £227.50 exists with status "SUBMITTED"
**When** I am logged in as the Line Manager and navigate to Finance > Expenses > Pending Approval
**And** I open "EXP-2026-0001" and click "Approve"
**Then** the claim status changes to "APPROVED"
**And** an approval timestamp and approver name are recorded
**And** the claim moves out of the "Pending Approval" queue
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-FIN-013: Reject Expense Claim with Reason

**Given** expense claim "EXP-2026-0002" with status "SUBMITTED" and category "ENTERTAINMENT", Amount £350.00
**When** the Line Manager opens the claim, clicks "Reject", and enters reason "Entertainment expenses require Director pre-approval. Please resubmit with Director sign-off."
**Then** the claim status changes to "REJECTED"
**And** the rejection reason is stored and visible to the claimant
**And** the claimant receives a notification with the rejection reason
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-FIN-014: Resubmit Corrected Expense Claim

**Given** expense claim "EXP-2026-0002" exists in "REJECTED" status with rejection reason recorded
**When** the claimant opens the rejected claim, attaches "director_approval_email.pdf", updates the notes, and clicks "Resubmit"
**Then** the claim status changes back to "SUBMITTED" with a resubmission timestamp
**And** the claim reappears in the Line Manager's "Pending Approval" queue
**And** the previous rejection reason remains visible in the claim history
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-FIN-015: Verify Expense Category Totals in Reports

**Given** multiple approved expense claims exist: TRAVEL £1,850.00, MEALS £420.00, ACCOMMODATION £960.00 for February 2026
**When** I navigate to Finance > Reports > Expense Summary and filter by Period "February 2026"
**Then** the report shows category totals: TRAVEL £1,850.00, MEALS £420.00, ACCOMMODATION £960.00
**And** the total for the period is £3,230.00
**And** I can export the report to CSV
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Financial Reporting (5 scenarios)

### TC-FIN-016: Generate P&L Report for Date Range

**Given** I am logged in as a Finance Manager with financial data for Q1 2026
**When** I navigate to Finance > Reports > Profit & Loss and set Date Range "2026-01-01" to "2026-03-31"
**Then** the P&L report generates showing Revenue, Cost of Sales, Gross Profit, Operating Expenses, and Net Profit/Loss
**And** all figures are presented in GBP and grouped by account category
**And** the report title displays the selected date range
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-FIN-017: Export Financial Report to CSV

**Given** a P&L report for Q1 2026 has been generated and is displayed on screen
**When** I click "Export" and select format "CSV"
**Then** a CSV file downloads with filename containing the report type and date range (e.g., "PL_Report_2026-Q1.csv")
**And** the CSV contains all report rows with correct column headers (Account, Category, Amount, Period)
**And** numeric values are not formatted with currency symbols (raw numbers only)
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-FIN-018: View Cash Flow Forecast

**Given** financial data including confirmed invoices, scheduled payments, and recurring expenses is available
**When** I navigate to Finance > Reports > Cash Flow Forecast and select a 90-day forward period
**Then** the forecast displays projected weekly inflows (from receivables) and outflows (payables, payroll, overheads)
**And** the projected closing cash balance is shown for each week
**And** weeks with projected negative balance are highlighted as cash flow risk periods
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-FIN-019: Drill Down into Account Transactions

**Given** a P&L report is displayed showing "Travel Expenses" of £3,230.00 for Q1 2026
**When** I click on the "Travel Expenses" line in the report
**Then** the system navigates to or displays a transaction drill-down showing all individual transactions comprising the £3,230.00
**And** each transaction shows date, description, reference number, and amount
**And** I can navigate back to the summary report
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-FIN-020: Compare Current vs Prior Period

**Given** financial data exists for both Q1 2026 and Q1 2025
**When** I view the P&L report and enable "Compare to Prior Period" toggle
**Then** the report displays two columns: "Q1 2026" and "Q1 2025"
**And** a third column shows the variance (£ and %) for each line item
**And** favourable variances (higher revenue, lower costs) are displayed in green and adverse in red
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Purchase Orders (5 scenarios)

### TC-FIN-021: Raise Purchase Order with Approval Workflow

**Given** I am logged in as a Procurement Officer
**When** I navigate to Finance > Purchase Orders and click "New PO"
**And** I fill in: Supplier "Globex Supplies Ltd", Required By "2026-03-15", Department "IT"
**And** I add line items: "Laptop Computers" qty 5 unit price £1,200.00, "Docking Stations" qty 5 unit price £150.00
**Then** the system creates the PO with reference "PO-2026-XXXX", status "DRAFT", and total £6,750.00
**And** the PO is routed to the designated approver based on the department and value threshold
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-FIN-022: Approve Purchase Order (DRAFT to APPROVED)

**Given** a draft PO "PO-2026-0001" for £6,750.00 exists and is pending approval
**When** I am logged in as the Finance Manager and navigate to Finance > Purchase Orders > Pending Approval
**And** I open "PO-2026-0001" and click "Approve" with comment "Approved for Q1 hardware refresh"
**Then** the PO status changes from "DRAFT" to "APPROVED"
**And** the approval date, approver name, and comment are recorded
**And** the supplier is notified (or the PO is flagged as ready to send)
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-FIN-023: Receive Partial Goods Against Purchase Order

**Given** approved PO "PO-2026-0001" for 5 Laptop Computers and 5 Docking Stations
**When** I navigate to the PO and click "Record Receipt"
**And** I enter: Receipt Date "2026-03-10", Laptops received qty 3, Docking Stations received qty 0, Notes "Partial delivery — 2 laptops on back order"
**Then** a goods receipt record is created linked to the PO
**And** the PO status changes to "PARTIALLY_RECEIVED"
**And** the outstanding quantity for Laptops shows 2 and for Docking Stations shows 5
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-FIN-024: Three-Way Match Invoice to PO and Receipt

**Given** PO "PO-2026-0001" (approved, partially received) and a supplier invoice "SINV-GL-20260312" for £3,600.00 (3 laptops × £1,200.00)
**When** I create a purchase invoice and link it to PO "PO-2026-0001" and receipt "GRN-2026-0001"
**Then** the system performs a 3-way match: PO quantity, received quantity, and invoiced quantity all agree for the 3 laptops
**And** the invoice is matched and approved for payment processing
**And** the matched status is recorded on the invoice
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-FIN-025: Close Purchase Order on Full Receipt

**Given** PO "PO-2026-0001" in "PARTIALLY_RECEIVED" status with 2 laptops and 5 docking stations still outstanding
**When** I record a second receipt: Laptops qty 2, Docking Stations qty 5, Receipt Date "2026-03-18"
**Then** all line items on the PO show fully received quantities
**And** the PO status automatically changes to "FULLY_RECEIVED"
**When** I click "Close PO"
**Then** the PO status changes to "CLOSED" and no further receipts can be recorded against it
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Sign-Off

| Role                  | Name | Signature | Date |
| --------------------- | ---- | --------- | ---- |
| Finance Manager       |      |           |      |
| Product Owner         |      |           |      |
| UAT Lead              |      |           |      |
| Regulatory/Compliance |      |           |      |

**Overall Result:** [ ] PASS -- All scenarios passed / [ ] FAIL -- See notes above
**Release Recommendation:** [ ] Approved for Production / [ ] Requires remediation
