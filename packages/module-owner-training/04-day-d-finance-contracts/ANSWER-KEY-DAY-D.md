# ANSWER KEY — Day D Assessment: Finance & Contracts

**FACILITATOR ONLY — Do not distribute to participants**

---

| Q | Correct Answer | Option | Explanation |
|---|---------------|--------|-------------|
| 1 | B | FIN-PO-2026-023 | The Nexara financial record reference format is `FIN-{TYPE}-{YEAR}-{NNN}`. The type code for Purchase Order is `PO`. Options A, C, and D use incorrect formats or missing prefixes. |
| 2 | B | Purchase order, goods receipt note, and supplier invoice | The 3-way match verifies: (1) what was ordered (PO quantity), (2) what was received (GRN quantity), and (3) what the supplier is billing for (invoice quantity). A mismatch between any two of these three documents triggers a dispute flag. Supplier quotations and bank statements are not part of the 3-way match. |
| 3 | C | The 3-way match cannot be performed, bypassing a key financial control | Without a PO, there is no authorised order record to match the invoice against, and no GRN to confirm receipt. The 3-way match — the primary control against over-invoicing, payment for unordered goods, and payment for undelivered goods — cannot function. Option D is incorrect; the system permits invoice records without POs via the EXP route, which is precisely the control gap. |
| 4 | A | 20% overspend — Red | Variance % = (Actual − Budget) / Budget × 100 = (£132,000 − £110,000) / £110,000 × 100 = £22,000 / £110,000 × 100 = 20%. At 20% overspend, the dashboard threshold is Red (≥20%). Amber is triggered at 10–19.99%. Option D has the correct percentage but wrong direction (underspend). |
| 5 | B | Contract rate — a specific rate defined for all transactions under the contract | When a contract specifies a fixed exchange rate (common in long-term supply agreements with FX hedging provisions), the Contract rate mode must be selected. Using the daily mid-market rate would generate spurious FX variances every day, misrepresenting the actual economics of the contract. |
| 6 | B | CTR-2026-047 | Contract record references use the format `CTR-{YEAR}-{NNN}`. Not CON, CONTRACT, or AGR. This is a knowledge recall question — the correct prefix must be memorised. |
| 7 | B | The contract is within the configured renewal alert window (typically 90 days before end date) | Expiring status is triggered when the current date enters the renewal alert window (default 90 days before `endDate`). It is a proactive status designed to prompt renewal action. It does not mean the contract has expired (that is the Expired status) or that termination has been initiated. |
| 8 | C | The `legalReviewer` must approve the amendment; the contract returns to Under Review status until approval is granted | Amendments require re-approval by the `legalReviewer` to ensure that material changes to the contract have been legally reviewed before they become operative. This is a system-enforced workflow. Uploading a document alone does not make it operative; the approval workflow must complete. Option A is incorrect — term extensions are material changes requiring legal review regardless of the financial impact. |
| 9 | A | The supplier's ISO 27001 certificate has expired; notify the counterparty contact and consider invoking remedy provisions | A Breached obligation status means the obligation was not met by its due date. An overdue ISO 27001 certification obligation means the supplier has not provided evidence of maintained certification within the required timeframe. The contract owner should formally notify the counterparty and review whether the contract's remedy or termination provisions apply. Deleting the record (B) destroys the audit trail evidence. |
| 10 | C | When extraordinary events outside either party's control have made performance impossible | Force majeure applies when an event beyond both parties' reasonable control prevents performance — natural disasters, war, pandemic, regulatory prohibition. Terminating for convenience (A) = business reasons. Terminating for cause/breach (B) = counterparty failure. Mutual agreement (D) = MUTUAL_AGREEMENT reason. |
| 11 | C | 3.05 — Approved | Weighted score = (3×0.25) + (3×0.20) + (4×0.15) + (2×0.15) + (4×0.15) + (3×0.10) = 0.75 + 0.60 + 0.60 + 0.30 + 0.60 + 0.30 = 3.15. Wait — let us recalculate: 0.75 + 0.60 + 0.60 + 0.30 + 0.60 + 0.30 = 3.15. Correct answer is A: 3.15 — Approved. Note to facilitators: 3.15 falls in the Approved range (3.0–3.9). The Financial Stability score of 2 (below standard) is a concern worth discussing: even though the overall score qualifies as Approved, a Financial Stability score of 2 should trigger enhanced monitoring and potentially a conditional approval with a financial review scheduled. |
| 12 | B | The weighted score will be inflated because the denominator adjusts for missing criteria, producing a misleadingly high overall rating | When a criterion is skipped, the remaining criteria implicitly carry more weight than intended. For example, if Financial Stability (15% weight) is omitted, the other five criteria carry 100% of the score between them, inflating the result. A supplier with genuinely poor financial stability could pass the APPROVED threshold on a partial evaluation that would have failed on a complete one. Nexara warns about partial evaluations but permits saving them in draft — the risk is real. |
| 13 | C | More than 30% of spend in a category is concentrated with a single supplier | Single-source risk is triggered by spend concentration: if one supplier accounts for more than 30% of all spend in their category, the organisation is vulnerable to supply disruption if that supplier fails. This threshold applies regardless of the supplier's qualification status or category. CRITICAL_INFRASTRUCTURE category (B) triggers enhanced monitoring but is not the single-source risk trigger. |
| 14 | B | This is a red flag indicating significant payment process problems; invoices are taking 61–90 days to be paid from approval | AP ageing brackets measure time from invoice approval to payment. The 61–90 day bracket should contain less than 5% of the AP balance — 22% is significantly above this threshold. Suppliers typically have 30-day payment terms; invoices in the 61–90 day bracket are already 1–2 months overdue. This creates supplier relationship risk, potential late payment interest under the Late Payment of Commercial Debts Act (UK), and reputational damage. |
| 15 | B | The Finance Manager must submit a justification, and the change requires one additional approver beyond the Finance Manager | APPROVED/PREFERRED → DISQUALIFIED requires Finance Manager approval plus one additional approver (e.g., Head of Procurement or CFO). This two-approver gate exists because DISQUALIFIED status has significant commercial impact and should not be applied unilaterally. A mandatory justification is also required, creating an audit trail. Option A would enable unilateral disqualification without accountability. |
| 16 | B | Budget utilisation is on track — 94% with 1 month remaining is within the expected range for year-end | With 11 of 12 months elapsed (91.7% of the year), budget utilisation of 94% is consistent with on-track spending. The budget is expected to be 91.7% utilised at this point; 94% is slightly above the linear rate but well within the amber threshold (100%+10% = 110%). Concern would arise if utilisation were below 80% (indicating underspend or budget padding) or above 110% (overspend). |
| 17 | B | A forward-looking report showing contracts expiring within a defined window, used for renewal planning and commercial decision-making | The contract expiry pipeline is a prospective planning tool — it shows what is coming, not what has already happened. It is used to ensure renewal decisions are made with sufficient lead time to renegotiate, retender, or terminate properly. Option A describes an expired contracts archive, which is a different report. |
| 18 | B | The immutable audit trail capturing every approval decision, status change, and user action, combined with mandatory justification fields on sensitive decisions | ISO 37001 requires that bribery risks are managed through documented controls with evidence of application. The Nexara audit trail creates an immutable, timestamped record of who approved each financial transaction, procurement decision, and status change — and the mandatory justification field on sensitive actions (e.g., disqualifying a supplier, approving a large PO) means every decision is accompanied by a stated reason. This is the core of the anti-corruption audit evidence. Currency configuration (A) and reference number generation (C) are incidental. AP ageing (D) may be relevant to detecting facilitation payments indirectly, but is not a primary anti-corruption control. |
| 19 | B | The amendment document version history, the legalReviewer approval record, and the contract audit trail showing status transitions | This three-part combination is the complete evidence chain: (1) the version history proves the amendment document exists and was uploaded, (2) the legalReviewer approval record proves it was reviewed by a qualified reviewer, and (3) the audit trail status transitions (Under Review → Active) prove the approval process was completed before the amendment became operative. The original contract document (A) does not evidence the amendment approval. |
| 20 | B | Navigate to Suppliers → Reports → Preferred Supplier List → filter by category: SERVICES, status: APPROVED and PREFERRED → Generate PDF | The Preferred Supplier List report with appropriate filters is the correct tool. It produces a dated, filtered, and user-attributed report suitable for a procurement decision. Option A does not exist as described. Option C (Active Contracts) shows contracts, not suppliers. Option D (admin database query) is not a supported or auditable process for routine procurement decisions. |

---

## Facilitator Note — Q11 Correction

The question as written leads to answer C (3.05) but the correct calculation gives 3.15, making answer A correct. Facilitators should use the following calculation as the definitive answer: **(3×0.25) + (3×0.20) + (4×0.15) + (2×0.15) + (4×0.15) + (3×0.10) = 0.75 + 0.60 + 0.60 + 0.30 + 0.60 + 0.30 = 3.15**. Credit answer A for Q11. The status (Approved, 3.0–3.9 range) is the same regardless. The Financial Stability score of 2 is a useful discussion point — participants who note the Financial Stability weakness even while the overall score passes show strong analytical thinking.

---

## Pass / Fail Thresholds

| Score | % | Result |
|-------|---|--------|
| 20/20 | 100% | Pass |
| 19/20 | 95% | Pass |
| 18/20 | 90% | Pass |
| 17/20 | 85% | Pass |
| 16/20 | 80% | Pass |
| 15/20 | 75% | Pass (minimum) |
| 14/20 | 70% | Fail |
| 13/20 | 65% | Fail |
| 12/20 or below | ≤60% | Fail |

## Retake Process

Participants who do not pass should be:
1. Briefed privately (never announce fail results publicly)
2. Given a completion acknowledgement (attendance only, no certificate)
3. Registered for the next scheduled Day D cohort
4. Recommended to review MODULE-FINANCE-WORKFLOWS.md, MODULE-CONTRACTS-MANAGEMENT.md, and MODULE-SUPPLIER-MANAGEMENT.md, and to complete the lab exercise again in the sandbox before retaking
