# Module Owner Quick-Reference Card

*Five variants — one per programme day. Print as A5 laminated cards for participants.*

---

## VARIANT A — Quality & Non-Conformance

### NC Reference Format
`QMS-NC-{YEAR}-{NNN}` | CAPA: `QMS-CAPA-{YEAR}-{NNN}`

### NC Categories
| Category | Use When |
|----------|---------|
| Product | Physical product defect |
| Process | Procedure not followed |
| System | No procedure exists |
| Supplier | External party failure |

### NC Severity
- MINOR — First aid; no lost time
- MAJOR — Potential customer/compliance impact
- CRITICAL — Actual safety/regulatory impact

### CAPA Always From NC → Actions → Create CAPA
Status flow: Open → In Progress → Pending Review → Effective → Closed

### ISO Clause Map
- 8.7 = Product NC | 8.4 = Supplier NC | 10.2 = CAPA | 7.5 = Documents

### Pass: 15/20 | Assessment: /module-owner/quality-nc/assessment

---

## VARIANT B — Health, Safety & Environment

### Event Types
- Incident = harm occurred
- Near Miss = nearly occurred
- Observation = risk condition

### Severity Scale
MINOR → MODERATE → MAJOR → CRITICAL → CATASTROPHIC

### Significance Formula
`Score = severity×1.5 + probability×1.5 + duration + extent + reversibility + regulatory + stakeholder`
Score ≥ 15 = **Significant** (requires objective or operational control)

### TRIR / LTIR
`(incidents × 200,000) ÷ hours worked`

### Compliance Status
COMPLIANT | AT_RISK | NON_COMPLIANT

### PTW Approval: Sequential — each stage before the next can proceed

### Pass: 15/20 | Assessment: /module-owner/hse/assessment

---

## VARIANT C — HR & Payroll

### Employee Reference: `HR-EMP-{YEAR}-{NNN}`

### Key Field Names
- `dateOccurred` — NOT `incidentDate`
- `terminationDate` — NOT `endDate`
- `accessRevocationDate` — set to last working day

### Training Status Values
Assigned → In Progress → Completed | Overdue | Exempt

### Compliance Matrix Colours
Green = Complete ✓ | Amber = Due in 30d ⚠ | Red = Overdue ✗

### Payroll Period Flow
Open → Locked → Processed → Approved → Paid

### Variance Thresholds: Amber ≥5% | Red ≥15%

### Retention (UK): Employment + 7 years

### Pass: 15/20 | Assessment: /module-owner/hr-payroll/assessment

---

## VARIANT D — Finance & Contracts

### Reference Formats
Finance: `FIN-{TYPE}-{YEAR}-{NNN}` | Contract: `CTR-{YEAR}-{NNN}` | Supplier: `SUP-{YEAR}-{NNN}`

### 3-Way Match
PO quantity = Delivery note = Invoice ✓

### Contract Statuses
Draft → Under Review → Pending Signature → Active → Expiring → Expired → Terminated

### Supplier Scorecard Weights
Quality 25% | Delivery 20% | Commercial 15% | Financial 15% | HSE 15% | ESG 10%

### Qualification Thresholds
4.0–5.0 = Preferred | 3.0–3.9 = Approved | 2.0–2.9 = Conditional | <2.0 = Disqualified

### Budget Variance: Amber ≥10% | Red ≥20%

### Default Renewal Alert: 90 days before contract expiry

### Pass: 15/20 | Assessment: /module-owner/finance-contracts/assessment

---

## VARIANT E — Audits, CAPA & Management Review

### Audit Finding Types
Conformance (no issue) | Observation | OFI | Minor NC | Major NC

### RCA Techniques
- **5-Why**: 5 levels required before "root cause confirmed"
- **Fishbone**: 6 branches — Man, Machine, Method, Material, Measurement, Environment
- **Fault Tree**: Top-down logic; AND/OR gates; complex multi-causal events

### CAPA Effectiveness Outcomes
Effective | Partially Effective | Ineffective (requires new CAPA)

### Management Review Inputs (ISO 9001 cl. 9.3.2)
Quality KPIs + HSE metrics + HR data + Finance + Audit findings + Customer satisfaction + Risk register

### ISO 9001 Clause References
7.2 = Competence | 7.5 = Documented information | 8.7 = NC control
9.3 = Management review | 10.2 = NC & corrective action | 10.3 = Continual improvement

### Pass: 15/20 | Assessment: /module-owner/advanced/assessment
