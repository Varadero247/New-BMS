# Module: Supplier Management

**Programme**: Day D — Finance & Contracts | **IMS Modules**: Suppliers (port 3033 / API 4029)
**Delivery time**: Content Block 3 (see schedule)

---

## Section 1: Supplier Register

The supplier register is the organisation's authoritative record of every organisation it buys from or works with. It is the foundation on which procurement decisions, contract management, and supply chain risk assessment rest. Without a structured, maintained supplier register, qualification status and supply chain risk assessments cannot function reliably.

### Reference Number Format

All supplier records use the format: `SUP-{YEAR}-{NNN}`

Example: `SUP-2026-014` — the 14th supplier added to the register in 2026. The reference is auto-generated on save.

### Mandatory Fields

| Field | Options / Format | Notes |
|-------|----------------|-------|
| `supplierName` | Free text, max 300 chars | Legal trading name of the supplier entity |
| `category` | GOODS / SERVICES / WORKS / PROFESSIONAL / CRITICAL_INFRASTRUCTURE | See category guide below |
| `country` | ISO 3166-1 country code | Country of supplier's registered office |
| `contactName` | Free text | Primary commercial contact at the supplier |
| `contactEmail` | Valid email address | Used for PO acknowledgements, contract notifications, termination notices |
| `qualificationStatus` | PREFERRED / APPROVED / CONDITIONAL / DISQUALIFIED / UNDER_REVIEW | Status at the time of record creation (usually UNDER_REVIEW for new suppliers) |

**Optional but strongly recommended**:
- `vatNumber` / `registrationNumber`: Used for financial system integration and duplicate checking
- `website`: Supplier's public website
- `accreditations`: ISO certifications, industry accreditations held by the supplier
- `annualSpend`: Estimated or actual annual spend — used for Pareto analysis and consolidation decisions
- `linkedContracts`: Auto-populated when contracts are created with this supplier as `counterparty`

### Supplier Category Guide

| Category | Description |
|----------|-------------|
| `GOODS` | Physical products, raw materials, components |
| `SERVICES` | Non-physical services (IT support, cleaning, security, logistics) |
| `WORKS` | Construction, installation, engineering works |
| `PROFESSIONAL` | Legal, financial, consulting, medical professional services |
| `CRITICAL_INFRASTRUCTURE` | Suppliers providing utilities, critical IT infrastructure, or services essential to operational continuity |

The `CRITICAL_INFRASTRUCTURE` category triggers enhanced supply chain risk monitoring and requires documented business continuity provisions on the supplier record.

---

## Section 2: Scorecard Evaluation

Supplier scorecard evaluations are the mechanism for objectively measuring supplier performance and making qualification status decisions. A scorecard must be completed before a supplier can be moved from `UNDER_REVIEW` to `APPROVED` or `PREFERRED` status.

### Navigating to a New Evaluation

Suppliers → [Supplier Record] → **Evaluations** tab → **New Evaluation**

### Evaluation Criteria and Weights

| Criterion | Weight | What to assess |
|-----------|--------|----------------|
| Quality of goods / services | 25% | Defect rates, NC history, product conformance, service delivery quality |
| Delivery performance | 20% | On-time delivery rate, lead time reliability, order fulfilment accuracy |
| Commercial terms | 15% | Price competitiveness, payment terms, contractual flexibility |
| Financial stability | 15% | Credit score assessment, published accounts review, trading history |
| HSE performance | 15% | Accident record, HSE compliance, relevant certifications (ISO 45001) |
| Sustainability / ESG | 10% | Carbon commitments, environmental management (ISO 14001), ethical sourcing, Modern Slavery Act compliance |

Each criterion is scored 1–5:

| Score | Descriptor |
|-------|-----------|
| 5 | Excellent — consistently exceeds requirements |
| 4 | Good — meets requirements with minor gaps |
| 3 | Satisfactory — meets basic requirements; some improvement areas |
| 2 | Below standard — significant gaps against requirements |
| 1 | Unacceptable — fails to meet basic requirements |

### Weighted Score Calculation

The system calculates the weighted score automatically:

**Weighted Score = (Quality × 0.25) + (Delivery × 0.20) + (Commercial × 0.15) + (Financial × 0.15) + (HSE × 0.15) + (Sustainability × 0.10)**

**Worked example**: TechBridge Solutions Ltd is evaluated: Quality=4, Delivery=4, Commercial=3, Financial=3, HSE=3, Sustainability=3.

Weighted Score = (4×0.25) + (4×0.20) + (3×0.15) + (3×0.15) + (3×0.15) + (3×0.10)
= 1.00 + 0.80 + 0.45 + 0.45 + 0.45 + 0.30
= **3.45**

### Overall Rating Thresholds

| Weighted Score | Overall Rating | Recommended Status |
|---------------|---------------|-------------------|
| 4.0 – 5.0 | Excellent | PREFERRED |
| 3.0 – 3.9 | Good | APPROVED |
| 2.0 – 2.9 | Satisfactory | CONDITIONAL |
| < 2.0 | Below standard | DISQUALIFIED |

The overall rating is displayed on the scorecard summary. The system recommends a qualification status change based on the rating threshold, but the change must be manually confirmed by the procurement lead or Finance Manager (subject to the approval rules in Section 3).

**Common mistake**: Completing only some of the six weighted criteria and saving the evaluation. Partial evaluations give misleading scores because the denominator changes: if Financial Stability is left blank, the remaining five criteria are weighted incorrectly, producing an inflated score that may not reflect actual supplier performance. Nexara will warn if any criterion is left blank, but will permit saving a partial evaluation for draft purposes. Always complete all six criteria before formally confirming the evaluation.

---

## Section 3: Qualification Status Management

### Status Values and What They Mean

| Status | Meaning | Procurement implication |
|--------|---------|------------------------|
| `PREFERRED` | Highest-rated; meets or exceeds all requirements | First-choice supplier for new purchasing; promoted in preferred supplier list |
| `APPROVED` | Meets requirements; acceptable performance | Can be used for standard purchasing |
| `CONDITIONAL` | Partially meets requirements; improvement plan in place | May be used subject to additional monitoring; not for new framework agreements |
| `UNDER_REVIEW` | New supplier or re-evaluation in progress | Cannot be used for purchasing until review complete |
| `DISQUALIFIED` | Fails to meet minimum requirements | Blocked from all new purchase orders |

### Changing Qualification Status

Navigate to the supplier record → **Actions → Update Qualification Status**.

| Direction of change | Approval required |
|--------------------|------------------|
| UNDER_REVIEW → APPROVED or PREFERRED | Procurement Lead confirms |
| APPROVED → PREFERRED | Procurement Lead confirms |
| APPROVED → CONDITIONAL | Finance Manager approval required |
| APPROVED or PREFERRED → DISQUALIFIED | Finance Manager + one additional approver required |
| CONDITIONAL → DISQUALIFIED | Finance Manager + one additional approver required |

A **justification** field is mandatory for all status changes. The justification is stored in the supplier's audit trail, providing a permanent record of why the status was changed, when, and by whom. This audit trail is evidence under ISO 9001 clause 8.4 (control of externally provided processes).

**Worked example**: During an annual supplier review, it is identified that TechBridge Solutions Ltd has had three late deliveries in Q3 2026. Their weighted scorecard drops to 2.8 (below the APPROVED threshold). The procurement manager initiates a status change from APPROVED to CONDITIONAL, enters justification "Three late deliveries in Q3 2026 — service improvement plan issued 01 Oct 2026 — reviewed at 90 days", and the Finance Manager approves the change. TechBridge remains in the supplier register but is blocked from selection as the primary supplier on new contracts until their status is restored.

---

## Section 4: Supply Chain Risk

### Risk Indicators

Nexara monitors four categories of supply chain risk for each supplier automatically. Risk indicators are displayed on the supplier record's **Risk** tab and on the procurement dashboard.

| Risk Category | Indicator Source | Risk Description |
|--------------|-----------------|-----------------|
| **Financial risk** | Credit score feed (configurable integration) | Poor credit score, published trading losses, county court judgements |
| **Geopolitical risk** | Country risk rating (updated quarterly) | Country-level political instability, trade sanctions, export controls |
| **Single-source risk** | Calculated from spend data | Flagged automatically if >30% of spend in a category is with a single supplier |
| **Compliance risk** | Document expiry alerts | Overdue supplier documentation (insurance certificates, accreditations, health & safety policies) |

### Risk Levels

| Level | Description | Dashboard indicator |
|-------|-------------|-------------------|
| LOW | No significant risk identified | Green |
| MEDIUM | One or more indicators at elevated level | Amber |
| HIGH | Multiple indicators elevated or one critical | Red |
| CRITICAL | Immediate supply continuity threat | Red with alert flag |

CRITICAL risk level triggers an automated notification to the Finance Manager and Head of Procurement. Suppliers at HIGH or CRITICAL risk should be reviewed at the next procurement governance meeting.

### Single-Source Risk in Practice

Single-source risk is the risk most frequently underestimated in organisations migrating from manual procurement. Many organisations discover, when the spend data is first mapped in Nexara, that they have over 50% of a critical category sourced from a single supplier — a dependency they were not conscious of. The supply chain risk dashboard makes this visible.

If a supplier reaches the 30% single-source threshold, the system flags the risk and prompts the procurement lead to document a supply chain diversification plan. Navigate to Supplier record → Risk tab → Single-Source Risk → Add Mitigation Plan.

---

## Section 5: Preferred Supplier List

### Generating the Report

The Preferred Supplier List is the organisation's definitive list of approved and preferred suppliers, used by procurement teams for purchasing decisions.

Navigate to **Suppliers → Reports → Preferred Supplier List**.

### Filter Options

| Filter | Options |
|--------|---------|
| `qualificationStatus` | PREFERRED / APPROVED (default shows both) |
| `category` | GOODS / SERVICES / WORKS / PROFESSIONAL / CRITICAL_INFRASTRUCTURE |
| `country` | Filter to specific countries or regions |
| `minScore` | Set a minimum weighted scorecard score threshold |

### Export Format

The preferred supplier list exports as a PDF report containing: supplier name, reference number, category, country, qualification status, weighted scorecard score, most recent evaluation date, primary contact, and linked contracts count. The report header shows the generation date, the filters applied, and the user who generated it.

### Annual Review Cycle

The preferred supplier list should be formally reviewed and signed off by the Finance Manager or Head of Procurement annually. Navigate to Suppliers → Reports → Preferred Supplier List → Schedule Annual Review. This schedules an alert for the same time next year and creates a review record (with a sign-off workflow) that provides evidence of the annual review for ISO 9001 clause 8.4 and procurement governance purposes.

**Common mistake**: Treating the preferred supplier list as a static document that is generated once and then used for all purchasing decisions without updating. Supplier performance changes. Qualification statuses change. New evaluations are completed. The list should be regenerated at the point of each significant purchasing decision, not relied upon from a 12-month-old PDF.
