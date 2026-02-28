# Module: Payroll Management

**Programme**: Day C — HR & Payroll | **IMS Module**: Payroll (port 3007 / API 4007)

---

## Section 1: Pay Period Structure and Initiation

Nexara Payroll manages payroll periods (weekly, fortnightly, monthly, or custom). Each period has a defined start date, end date, and payment date.

### Initiating a New Payroll Period

Navigate to **Payroll → Pay Periods → New Period**:
1. Select pay group (e.g. "Monthly Salaried", "Weekly Hourly")
2. Confirm period start and end dates
3. Confirm payment date
4. Click **Initiate** — the period enters **Open** status

In Open status: adjustments can be added, reviewed, and modified. Once all adjustments are complete, the period is **Locked** by the payroll manager (prevents further changes), then **Processed** (calculations run), then **Approved** (final sign-off), and finally **Paid** (payment confirmed).

---

## Section 2: Pay Adjustments

Navigate to **Payroll → [Period] → Adjustments → Add Adjustment**:

| Adjustment Type | Fields | Notes |
|----------------|--------|-------|
| Overtime | Employee, hours worked, rate multiplier (1.0, 1.25, 1.5, 2.0) | Rate configured in employee pay settings |
| Bonus | Employee, bonus type, gross amount, payment reason | Documented justification required |
| Deduction | Employee, deduction type, amount | Examples: salary advance, equipment loan recovery |
| Benefit-in-Kind | Employee, BIK type, taxable value | Reportable to HMRC; system generates P11D data |
| Statutory Pay | Employee, type (SSP, SMP, SPP), dates | Calculated automatically from HR absence records |

**Worked example**: An employee has worked 8 hours of overtime at time-and-a-half this period. Navigate to Payroll → [Current Period] → Adjustments → Add Adjustment → Overtime → select employee → enter 8 hours → rate 1.5 → save. The gross value is calculated automatically from the employee's base hourly rate.

---

## Section 3: Payroll Audit Trail

The payroll audit trail is critical for demonstrating segregation of duties and for responding to payroll queries. To view: **Payroll → [Period] → Audit Trail**.

The audit trail records:
- Every field change on every adjustment (who, what, when)
- Period status changes (who initiated, locked, processed, approved, marked as paid)
- Any manual overrides (why, approved by whom)
- Journal export events (who exported, when, file hash)

**Audit query example**: An employee queries that their overtime was recorded incorrectly. Navigate to their record → Adjustments → find the overtime entry → click **History**. The trail shows: who entered the adjustment, the original amount, any subsequent changes, and who approved the change.

**Common mistake**: Making manual overrides without documenting the reason. The system allows overrides but requires a justification field. Auditors will review override patterns — undocumented overrides are an audit finding.

---

## Section 4: Journal Export for Finance Integration

After a payroll period is Processed and Approved, the journal file is available for export to the finance system.

Navigate to **Payroll → [Period] → Export → Journal**:
1. Select the journal format matching your finance system (SAP, Xero, QuickBooks, CSV/COA)
2. Verify the cost centre allocation (should match the HR department structure)
3. Click **Export Journal** — a file hash is generated and logged in the audit trail
4. Import the file into your finance system per your finance team's standard procedure

**Variance analysis**: Before exporting, review the **Payroll Variance Report** (Payroll → Reports → Variance). This compares the current period gross payroll to the previous period. Variances >5% are flagged in amber; >15% in red. Always investigate red variances before journal export.
