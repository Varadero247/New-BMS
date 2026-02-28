# Module: Finance Workflows & Approval

**Programme**: Day D — Finance & Contracts | **IMS Modules**: Finance (port 3013 / API 4013)
**Delivery time**: Content Block 1 (see schedule)

---

## Section 1: Financial Record Architecture

Every financial transaction in Nexara is captured as a structured record with a standardised reference number, mandatory fields, and an immutable audit trail. This architecture ensures that every entry — from an approved purchase order to an FX adjustment — can be traced back to its origin, its approver, and the moment of approval. This is the foundation of the finance module's compliance value.

### Reference Number Format

All financial records use the format: `FIN-{TYPE}-{YEAR}-{NNN}`

| Type Code | Record Type | Example |
|-----------|-------------|---------|
| `INV` | Invoice (inbound — from supplier) | `FIN-INV-2026-047` |
| `PO` | Purchase Order | `FIN-PO-2026-023` |
| `EXP` | Expenditure record (non-PO spend) | `FIN-EXP-2026-081` |
| `INC` | Income record | `FIN-INC-2026-012` |
| `ADJ` | Adjustment / journal entry | `FIN-ADJ-2026-005` |
| `BUD` | Budget record | `FIN-BUD-2026-001` |

Reference numbers are auto-generated sequentially on save. You cannot manually assign a reference number; this ensures uniqueness and supports audit integrity.

### Mandatory Fields (All Financial Record Types)

| Field | Format / Options | Notes |
|-------|----------------|-------|
| `amount` | Decimal, 2 dp | Entered in transaction currency |
| `currency` | ISO 4217 (GBP, USD, EUR, etc.) | Must match contract or PO currency |
| `costCentre` | Lookup — configured in Settings → Finance → Cost Centres | Links the record to budget tracking |
| `accountCode` | Lookup — configured chart of accounts | Nominal ledger / GL account reference |
| `approvalRoute` | Single / Multi-stage / CFO-only | Configured by Finance Admin |
| `description` | Free text, max 500 chars | Must describe purpose — "payment" alone is not acceptable |
| `supportingDocuments` | File upload | Purchase order PDF, invoice PDF, delivery note |

**Common mistake**: Entering a description of "Invoice payment" or "PO" with no further detail. Auditors reviewing financial records expect descriptions to identify the supplier, the goods or service, the period covered, and the contract or PO reference where applicable. Example of acceptable description: "IT managed services invoice — TechBridge Solutions Ltd — Q1 2026 — against contract CTR-2026-047."

---

## Section 2: PO/Invoice Workflow

The purchase-to-pay workflow in Nexara ensures that money cannot leave the organisation without an authorised purchase order, a matched delivery, and an approved invoice. This is achieved through a structured seven-step process with system-enforced sequencing.

### Step-by-Step Workflow

**Step 1 — Create Purchase Order**: Navigate to Finance → Purchase Orders → New PO. Complete mandatory fields including supplier lookup, line items with quantities and unit prices, cost centre, account code, and delivery address. The PO is saved with status **Draft**.

**Step 2 — Route for Approval**: Submit the PO for approval. The system routes to the approver(s) defined in the approval route configuration. Approvers receive an email notification with a direct link to the PO record. PO status changes to **Pending Approval**.

**Step 3 — Approval Decision**: The designated approver reviews the PO. They may Approve, Reject (with mandatory reason), or request Amendment (returning to Draft). On approval, PO status becomes **Approved** and the supplier is notified automatically if their email is configured on the supplier record.

**Step 4 — Supplier Confirms**: When the supplier acknowledges the order, the PO status is updated to **Acknowledged**. If the supplier is not configured for electronic acknowledgement, this step can be manually confirmed by the purchaser.

**Step 5 — Delivery Receipt**: When goods or services are received, a Goods Receipt Note (GRN) is created on the PO record: Finance → POs → [PO Reference] → Goods Receipt → New GRN. Record the quantity received and upload the delivery note. PO status moves to **Partially Received** or **Fully Received**.

**Step 6 — Invoice Matched to PO**: Navigate to Finance → Invoices → New Invoice. Link the invoice to the approved PO using the PO reference. The system performs the **3-way match**: it compares the PO quantity (what was ordered) against the GRN quantity (what was received) against the invoice quantity (what the supplier is billing for). If all three agree, the invoice status becomes **Matched**. If they do not agree, the invoice is flagged as **Disputed** and cannot proceed to payment.

**Step 7 — Invoice Approval and Payment Authorisation**: A matched invoice is routed for approval according to the invoice approval route (may differ from PO approval route for payment amounts above a threshold). On approval, the invoice status becomes **Approved for Payment** and a payment record is generated for the Finance team to action in the banking system.

### Why the 3-Way Match Matters

The 3-way match prevents three categories of fraud and error: (a) payment for goods not ordered, (b) payment for goods not received, and (c) over-invoicing. Each represents a real and common control failure in organisations that manage procurement manually.

**Common mistake**: Creating an invoice record without a linked PO (i.e., bypassing the PO step). This breaks the 3-way match entirely. Nexara requires a PO reference on all invoice records unless the record type is explicitly set to EXP (direct expenditure) with a Finance Manager override. Finance admins should review all EXP records monthly to ensure the override is not being misused.

---

## Section 3: Budget vs Actual

### Budget Entry

Budget records (`FIN-BUD-{YEAR}-{NNN}`) are created at the beginning of each financial year (or quarter, if rolling budgets are used). Navigate to Finance → Budgets → New Budget. Set:
- `budgetName`: Descriptive (e.g., "IT Services — FY2026")
- `costCentre`: The department or function this budget covers
- `accountCode`: The nominal account the budget applies to
- `budgetAmount`: Total approved budget for the period
- `period`: Start date and end date
- `budgetOwner`: Named user responsible for this budget line

### Actuals Auto-Population

Once a budget record is live, any approved financial transaction (PO, invoice, expenditure) coded to the same cost centre and account code within the same period is automatically reflected in the budget's actuals total. There is no manual entry of actuals — the system derives them from approved transaction records only. This ensures actuals cannot be overstated or understated through manual adjustment without an audit trail.

### Variance Calculation and Thresholds

The variance is calculated as: **Actual − Budget** (positive variance = overspend; negative variance = underspend).

Percentage variance: **(Actual − Budget) / Budget × 100**

| Variance % | Dashboard Status | Colour |
|-----------|-----------------|--------|
| ≤ +9.99% | On track | Green |
| +10% to +19.99% | At risk | Amber |
| ≥ +20% | Overspent | Red |

When a budget line turns amber or red, the budget owner receives an automatic email notification. The Finance Manager and CFO see the flagged budget on their dashboard.

### Budget Transfer Process

If an overspend on one budget line needs to be covered by transferring funds from another, navigate to Finance → Budgets → Budget Transfer → New Transfer. Specify the source budget (reducing), the receiving budget (increasing), the amount, justification, and supporting approval. Budget transfers require approval from the Finance Manager (or CFO if above the configured transfer threshold). The transfer creates an ADJ record (`FIN-ADJ-{YEAR}-{NNN}`) that links both budget records, maintaining a full audit trail of how the original budget was modified.

---

## Section 4: Multi-Currency

### Base Currency Configuration

The organisation's base (reporting) currency is configured in Settings → Finance → Currency Settings. All reporting, budgets, and financial KPIs are expressed in the base currency. Individual transactions can be recorded in any supported ISO 4217 currency.

### Exchange Rate Options

Nexara supports three exchange rate modes, configured per organisation:

| Mode | Description | Typical Use |
|------|-------------|-------------|
| Daily mid-market rate | System retrieves published mid-market rate daily | Standard for most organisations |
| Fixed rate | A defined rate applied to all transactions in a period | Useful for hedged contracts |
| Contract rate | A rate specified on a specific contract, applied to all transactions under that contract | Long-term supply agreements with FX provisions |

The rate mode is selected when creating a financial record (or inherited from the linked contract). The rate in use at the time of the transaction is stored immutably on the record — it does not update if the daily rate changes after the transaction is saved.

### FX Variance Reconciliation

When a payment is made at a rate different from the rate recorded on the invoice (for example, because of a settlement delay), Nexara generates an FX variance adjustment (`FIN-ADJ-{YEAR}-{NNN}`) automatically when the payment record is saved. The variance amount is posted to the FX variance account code configured in Settings → Finance → Accounts. Finance → Reports → FX Variance Report shows all FX adjustments in a period, grouped by currency pair, with total gain/loss.

**Common mistake**: Selecting "Daily mid-market rate" for a transaction that is governed by a hedged contract. This creates a fictitious FX variance (the contract rate differs from market rate). Always check whether the related contract has a specified FX provision and set the rate mode accordingly.

---

## Section 5: Finance KPI Dashboard

The Finance KPI dashboard provides an executive summary of the organisation's financial control performance. Navigate to Finance → Dashboard.

| KPI | Definition | Healthy Indicator |
|-----|-----------|------------------|
| **Budget Utilisation %** | Total approved actuals / Total approved budgets × 100, by period | 85–95% by year-end; <80% mid-year may indicate underspend or budget padding |
| **AP Ageing (0–30 days)** | Invoices approved but unpaid, 0–30 days from approval | Target: >80% of AP balance in this bracket |
| **AP Ageing (31–60 days)** | Invoices unpaid 31–60 days | Amber flag if >15% of balance |
| **AP Ageing (61–90 days)** | Invoices unpaid 61–90 days | Red flag if >5% of balance; supplier relationship risk |
| **AP Ageing (90+ days)** | Invoices unpaid over 90 days | Immediate escalation; reputational and contractual risk |
| **AR Ageing** | Receivables by ageing bracket | Mirror of AP ageing; 90+ days indicates collection risk |
| **Cost per Department** | Actual expenditure by cost centre, compared to budget | Used for departmental accountability reporting |
| **Top 10 Expenditure Categories** | Top 10 account codes by total spend in period | Used for procurement strategy and consolidation decisions |

The dashboard can be configured to show any subset of these KPIs. Navigate to Finance → Dashboard → Configure to add, remove, or reorder widgets. Dashboard views can be saved per user.
