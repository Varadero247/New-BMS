# Module: Contracts Management

**Programme**: Day D — Finance & Contracts | **IMS Modules**: Contracts (port 3037 / API 4033)
**Delivery time**: Content Block 2 (see schedule)

---

## Section 1: Contract Record Structure

A contract record in Nexara is the organisation's authoritative repository for all information about a contractual relationship. Unlike a document management system that simply stores a PDF, Nexara's contract record is a structured, searchable, and reportable object — with fields that drive automated alerts, approval workflows, and compliance reporting.

### Reference Number Format

All contract records use the format: `CTR-{YEAR}-{NNN}`

Example: `CTR-2026-047` — the 47th contract created in 2026. The reference is auto-generated on save.

### Mandatory Fields

| Field | Options / Format | Notes |
|-------|----------------|-------|
| `contractTitle` | Free text, max 300 chars | Descriptive — include counterparty name and subject matter. "Software Licence — DataSystems plc — Enterprise CRM v4" not "Software contract." |
| `counterparty` | Lookup → Supplier register | Must be an existing supplier record (`SUP-{YEAR}-{NNN}`). Create the supplier first if not already in the register. |
| `contractType` | SUPPLY / SERVICE / NDA / EMPLOYMENT / FRAMEWORK / LEASE | See contract type guide below |
| `startDate` | Date picker | The date the contract becomes legally effective |
| `endDate` | Date picker | The date the contract expires. For evergreen contracts, set a long-term date and set a renewal alert — do not leave `endDate` blank. |
| `totalValue` | Decimal, 2 dp | For multi-year contracts, enter the full contract value (not annual). For evergreen contracts, enter the estimated annual value and note "evergreen" in the description. |
| `currency` | ISO 4217 | Must match the currency in which the contract is denominated |
| `contractOwner` | User lookup | The internal person responsible for the contract relationship day-to-day |
| `legalReviewer` | User lookup | The person responsible for legal review of the contract and any amendments |

**Optional but strongly recommended**:
- `governingLaw`: The jurisdiction that governs the contract (e.g., England & Wales)
- `noticePeriod`: Days required for termination notice
- `autoRenewal`: Boolean — does the contract auto-renew without explicit action?
- `linkedPOs`: Links to purchase orders raised under this contract

### Contract Types

| Type | Description |
|------|-------------|
| `SUPPLY` | Supply of goods or materials |
| `SERVICE` | Provision of services |
| `NDA` | Non-disclosure / confidentiality agreement |
| `EMPLOYMENT` | Employment contract (linked to HR module employee record) |
| `FRAMEWORK` | Master framework agreement with individual call-offs |
| `LEASE` | Property, equipment, or vehicle lease |

### Contract Status Progression

| Status | Meaning |
|--------|---------|
| Draft | Contract record created; document not yet under formal review |
| Under Review | Submitted to `legalReviewer` for legal review |
| Pending Signature | Legal review complete; awaiting execution by both parties |
| Active | Contract is signed and in force |
| Expiring | Contract is within the renewal alert window (default: 90 days before `endDate`) |
| Expired | `endDate` has passed; contract has not been renewed or terminated |
| Terminated | Contract ended before `endDate` via the termination process |

Every status transition is recorded in the contract's audit trail with a timestamp, the user who changed the status, and (where required) a comment or attached document.

---

## Section 2: Milestone and Renewal Alerts

### Creating Milestones

Milestones are time-based events within the contract lifecycle that require action or awareness. Navigate to the contract record → **Milestones** tab → **Add Milestone**.

| Field | Notes |
|-------|-------|
| `milestoneTitle` | Descriptive, e.g., "Year 1 service review" or "Mid-contract audit right" |
| `milestoneDate` | The date the milestone falls due |
| `milestoneOwner` | The user responsible for taking action at this milestone |
| `alertLeadTime` | Days in advance of `milestoneDate` to send the alert (default: 14 days) |
| `description` | What action is required at this milestone |

### Renewal Alerts

Renewal alerts are a specific type of milestone automatically created when the contract is saved with an `endDate`. By default, the renewal alert fires 90 days before `endDate`. To change the lead time: Contract record → **Milestones** → **Renewal Alert** → Edit → change `alertLeadTime`.

When a renewal alert fires, the following users receive an email notification: `contractOwner`, `legalReviewer`, and any users subscribed to contract expiry notifications (configurable in Settings → Notifications → Contract Alerts). The contract status changes from **Active** to **Expiring** on the alert date.

**Common mistake**: Not setting a renewal alert on evergreen contracts (contracts with `autoRenewal = true`). Even though the contract technically renews automatically, the renewal date is the moment to review whether the auto-renewal should be accepted, renegotiated, or terminated. Organisations that miss this window often end up bound by unfavourable renewed terms for another full contract period. Always create a renewal alert on every contract — including evergreen ones — with a lead time sufficient for commercial review (typically 90–120 days).

---

## Section 3: Version Control

### Document Versioning on Contracts

A contract is a living document. When it is amended, Nexara's version control tracks the full history: every version of the contract document is retained and accessible, while only the current version is presented as the operative document.

### Uploading the Original Contract

When creating a contract record, upload the executed contract document under the **Documents** tab → **Contract Document** → Upload. The system saves this as **v1 — Original**.

### Creating an Amendment

When a contract is amended: Contract record → **Documents** → **Add Amendment**.

| Field | Notes |
|-------|-------|
| `amendmentTitle` | "Amendment 1 — Extension of term to December 2028" |
| `changesSummary` | Plain-language description of what changed |
| `amendmentDocument` | Upload the executed amendment PDF |
| `effectiveDate` | Date the amendment takes effect |

The system saves the amendment as **v2 — Amendment 1**. Subsequent amendments become v3, v4, etc. Previous versions are archived — they appear in the Documents tab version history but are not presented as the current operative document.

### Re-Approval Requirement for Amendments

Each amendment requires re-approval by the `legalReviewer`. When an amendment is uploaded, the contract status automatically returns to **Under Review**. The `legalReviewer` must approve the amendment for the status to return to **Active**. This prevents unapproved amendments from being treated as operative.

**Worked example**: TechBridge Solutions Ltd contract CTR-2026-047 is a 3-year managed services agreement. In year 2, the parties agree to add a new service line at an additional £75,000/year. The contract manager uploads "Amendment 1 — Addition of Cloud Migration Services workstream" with the executed amendment document and change summary. The contract status moves to Under Review. The Legal Director approves the amendment. Status returns to Active. The Documents tab now shows v1 (original) and v2 (Amendment 1). The `totalValue` field is updated to reflect the revised contract value.

---

## Section 4: Obligation Tracking

### What are Obligations?

Contractual obligations are specific commitments made by either party under the contract: deliverables the supplier must provide, SLA thresholds the supplier must maintain, compliance certifications the supplier must hold, and reporting obligations both parties must fulfil. Tracking these within the contract record — rather than in a separate spreadsheet — is what separates effective contract management from contract storage.

### Creating Obligation Records

Navigate to the contract record → **Obligations** tab → **Add Obligation**.

| Field | Notes |
|-------|-------|
| `obligationTitle` | E.g., "Monthly service performance report", "ISO 27001 certification maintained" |
| `obligationType` | DELIVERABLE / SLA / COMPLIANCE / REPORTING / PAYMENT |
| `obligationOwner` | The user responsible for monitoring this obligation |
| `dueDate` | For one-off obligations; leave blank for recurring |
| `recurrence` | For recurring obligations: MONTHLY / QUARTERLY / ANNUAL |
| `description` | Full detail of what the obligation requires |

### Obligation Status

Each obligation is tracked with status: **Active** (being monitored), **Due** (alert fired; action required), **Met** (obligation confirmed delivered), or **Breached** (obligation not met by due date). Breached obligations trigger a notification to the `contractOwner` and `legalReviewer`.

**Why this matters**: If a supplier breaches an obligation, the Nexara audit trail of the breach notification and your response is critical evidence if the organisation later needs to invoke a remedy or terminate for cause. A breach that is noticed but not formally recorded in the contract management system is very difficult to rely on in a dispute.

---

## Section 5: Termination Process

### Initiating Termination

A contract should never simply be allowed to expire unmanaged. Even when a contract is ending by mutual agreement or at natural expiry, the termination process in Nexara creates a formal record of the ending and triggers the steps necessary to close out the relationship cleanly.

Navigate to Contract record → **Actions → Initiate Termination**.

| Field | Notes |
|-------|-------|
| `terminationReason` | MUTUAL_AGREEMENT / BREACH / CONVENIENCE / FORCE_MAJEURE / EXPIRY | Select the most accurate reason |
| `effectiveDate` | The date termination takes effect |
| `noticeDate` | The date termination notice was (or will be) given |
| `terminationNoticeDocument` | Upload the executed termination notice or correspondence confirming termination |

### Counterparty Notification

When the termination record is saved, Nexara triggers an email to the counterparty's primary contact email (from the supplier record) — if the notification flag is enabled. Review the counterparty contact email before initiating termination to ensure it is current.

### Post-Termination Obligations

Many contracts require actions after termination: data deletion, IP return, knowledge transfer, final payment, or continued confidentiality. These should be added as obligation records on the contract before termination is initiated, with `obligationType = DELIVERABLE` and due dates set relative to the `effectiveDate`.

**Common mistake**: Marking a contract as Terminated without recording post-termination obligations. Six months later, a data subject access request arrives and no one can confirm whether the supplier actually deleted the personal data they held. The obligation record — and the evidence uploaded against it when marked Met — is the proof. Navigate to Contract → Obligations → Add Obligation and add a "Data deletion confirmation" obligation before closing out any contract involving personal data, regardless of the termination reason.
