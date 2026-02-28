# Module: Audit Management

**Programme**: Day E — Audits, CAPA & Management Review | **IMS Modules**: Audits (port 3042 / API 4037)
**Delivery time**: Content Block 1 (see schedule)

---

## Section 1: Audit Programme Planning

The distinction between an annual audit programme and a collection of individual audits is more than semantic — it is the difference between a managed, risk-based audit function and an ad-hoc series of inspections. ISO 9001:2015 clause 9.2.2 requires organisations to plan, establish, implement, and maintain audit programmes; ISO 19011:2018 provides the guidance on how to do so. Nexara implements the audit programme as a parent record with child audit records, giving the audit lead a single view of the entire year's audit activity.

### Reference Number Format

All audit programme records use the format: `AUD-{YEAR}-{NNN}`

Example: `AUD-2026-001` — the first audit programme record created in 2026. Individual audits within the programme do not have separate top-level references; they are identified by their programme reference and a sequential number (e.g., `AUD-2026-001/03` = the third audit in the 2026 programme).

### Creating the Annual Audit Programme

Navigate to **Audits → Programmes → New Programme**.

| Field | Notes |
|-------|-------|
| `programmeTitle` | E.g., "Vertex Global Systems — ISO 9001:2015 Internal Audit Programme 2026" |
| `programmeScope` | The standards, requirements, and processes covered — e.g., "ISO 9001:2015 — all clauses — all sites" |
| `auditYear` | Calendar year or financial year |
| `programmeLead` | The lead auditor / audit manager responsible for the programme |
| `riskBasedScheduling` | Boolean — if enabled, the programme will flag processes and areas with high NC rates or previous Major NC findings for more frequent audit scheduling |

### Risk-Based Scheduling

When `riskBasedScheduling = true`, Nexara analyses the previous 12 months of NC records and audit findings across all Quality and HSE modules. Processes with: (a) the highest NC counts, (b) Major NC findings in the prior year, or (c) repeat findings are highlighted in the programme scheduling view with a recommendation for increased audit frequency. The lead auditor retains full control of the final schedule but has a data-driven basis for prioritisation.

**Common mistake**: Creating each internal audit as a standalone audit record (Audits → New Audit) without linking it to an annual programme. Standalone audit records cannot contribute to programme-level reporting (e.g., total audits planned vs completed, finding rate by clause). They also make it significantly harder to demonstrate to a certification body that the organisation has a managed audit programme as required by ISO 9001 clause 9.2.2 — a programme lead presenting a set of disconnected records will face questions about planning and resource allocation that a programme record would answer cleanly.

---

## Section 2: Scheduling Individual Audits

With the annual programme created, child audit records are added to the programme. Navigate to **Audits → Programmes → [Programme] → Add Audit**.

### Audit Type

| Type | Description |
|------|-------------|
| `Internal` | Conducted by the organisation's own trained auditors; also called first-party audit |
| `External` | Conducted by an external organisation on the organisation's processes; also called second-party audit (typically a customer audit) |
| `Surveillance` | Conducted by the certification body between certification cycles; typically annual |
| `Certification` | Conducted by the certification body at initial certification or recertification |

### Mandatory Scheduling Fields

| Field | Notes |
|-------|-------|
| `auditType` | See above |
| `auditScope` | Specific clauses, processes, or departments included in this audit (not the whole standard; each audit covers a subset) |
| `leadAuditor` | The auditor leading this specific audit. Must have Internal Auditor role in Nexara |
| `auditeeList` | Users who are the auditees — they receive advance notification and can see the audit scope |
| `plannedStartDate` | First day of the audit |
| `plannedEndDate` | Last day of the audit (may be the same as start date for single-day audits) |
| `plannedDuration` | Hours — for scheduling purposes |

### Conflict Checking

Nexara checks for scheduling conflicts automatically when a new audit is saved: it identifies whether the `leadAuditor` or any `auditeeList` member has another audit scheduled in the same period. If a conflict is found, the system warns but permits saving — the lead auditor makes the final scheduling decision.

---

## Section 3: Audit Conduct

### Opening Meeting Record

Every formal audit should begin with an opening meeting. In Nexara: Audit record → **Opening Meeting** tab → **Record Opening Meeting**.

| Field | Notes |
|-------|-------|
| `meetingDate` | Date of the opening meeting |
| `attendees` | Select all attendees from user list; mark who is auditee, who is auditor, who is an observer |
| `agendaAgreed` | Boolean — confirm that the audit scope, objectives, and methodology were communicated and agreed |
| `openingNotes` | Free text — any material points raised at the opening meeting |

Recording the opening meeting provides evidence that the auditee was informed of the audit scope and objectives before the audit commenced — an ISO 19011 best practice requirement.

### Sampling Plan

Navigate to **Audit → Sampling Plan → New Sample**. For each area being audited, document: the process or activity sampled, the records examined (with record references), the physical locations or individuals observed, and the sample size rationale. Sampling plan documentation is the evidence that the auditor conducted a systematic rather than superficial examination.

### Evidence Collection

Nexara allows direct linking of records from other modules as audit evidence. During the audit: Audit → Evidence → Link Record → select module and record reference. For example, an audit of ISO 9001 clause 7.5 (documented information) can link directly to specific document version histories from the Quality module. This creates a direct, traceable link between the audit evidence and the system records it relates to.

---

## Section 4: Finding Classification

Finding classification is where auditor judgement has the greatest impact on the subsequent CAPA workload and the perception of the audit by the auditee. Consistent, calibrated classification is essential.

### Five Classification Levels

**Conformance**: The process, document, or activity examined meets the requirements of the standard and the organisation's own procedures. No action required. A Conformance finding is positive evidence for the certification body.

**Observation**: A finding that the auditor notes but that does not constitute a non-conformance. An Observation is typically a risk indicator — "the process works, but there is a condition that, if left unmanaged, could lead to a non-conformance." Example: "The calibration records for CMM #2 are up to date, but there is no documented recall process for instruments sent for off-site calibration." An Observation does not require a CAPA but should be tracked.

**OFI (Opportunity for Improvement)**: A positive recommendation from the auditor — a practice or approach observed in one area that could be beneficially applied elsewhere, or an innovative improvement that would enhance the system. An OFI is distinct from an Observation in that it is proactively positive, not a risk indicator. Example: "The Purchasing team's practice of pre-qualifying suppliers using a structured scorecard ahead of any contractual engagement is an excellent practice that could be adopted by the Projects department."

**Minor NC**: A single, isolated failure to meet a requirement of the standard or the organisation's procedures, without systematic impact. The requirement exists and is generally followed, but there is a specific instance of non-fulfilment. Example: "One of eight controlled copies of Procedure QP-014 has not been updated to reflect the v3.2 revision — the other seven copies are current." A Minor NC requires a corrective action but does not directly threaten the organisation's certification.

**Major NC**: A systemic failure to meet a requirement, or a failure that poses a significant risk to product safety, customer satisfaction, or the integrity of the management system. Characteristics: the requirement is consistently not met across multiple instances; the failure has or is likely to have a significant impact; or the failure directly contradicts a core clause requirement. Example: "No evidence exists that management reviews have been conducted in 2025 or 2026 — no records, no minutes, no agenda. ISO 9001 clause 9.3 is systematically unfulfilled." A Major NC typically threatens certification if not addressed before the next surveillance audit.

### Linking Findings to ISO Clauses

Each finding must be linked to one or more specific ISO clause numbers. Navigate to the finding record → **ISO Clause** → select standard (ISO 9001:2015 / ISO 45001:2018 / ISO 14001:2015) and clause number. This linkage enables clause-level reporting — showing which clauses generate the most findings — and maps the finding directly to the corrective action evidence required.

---

## Section 5: Audit Report

### Auto-Generated Report Contents

Navigate to **Audit → Reports → Generate Audit Report**. The system assembles the report from the structured data in the audit record:

| Report Section | Source in Nexara |
|---------------|-----------------|
| Audit scope and objectives | From the audit record `auditScope` field |
| Audit dates and duration | `plannedStartDate` / `plannedEndDate` |
| Auditor team | `leadAuditor` and any additional auditors listed |
| Auditees | `auditeeList` |
| Opening meeting summary | Opening Meeting tab record |
| Sampling plan summary | Sampling Plan records |
| Executive findings summary | Count by classification level; overall assessment |
| Finding details | Each finding record with: classification, clause reference, description, evidence reference |
| Required actions | For each NC finding: required corrective action, target date, responsible owner |
| Distribution list | Configured on the audit record |

### Distribution

Navigate to **Audit → Report → Distribute**. Select recipients from the configured distribution list. The report is emailed as a PDF attachment. Read-receipt tracking records when each recipient opened the email. Recipients who have not opened the report after 5 business days receive a reminder. Unread reports are flagged on the audit lead's dashboard.
