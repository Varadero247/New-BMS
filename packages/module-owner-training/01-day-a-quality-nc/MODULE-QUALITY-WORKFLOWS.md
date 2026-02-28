# Module: Quality Workflows & Document Control

**Programme**: Day A — Quality & Non-Conformance
**Delivery time**: Content Blocks 1 and 3 (see schedule)
**IMS Modules covered**: Quality (port 3003 / API 4003)

---

## Section 1: Quality Record Architecture

Every quality record in Nexara IMS follows a consistent structure. Understanding this structure is the foundation for everything else in the system.

### Reference Number Format

Quality records use the format `QMS-{TYPE}-{YEAR}-{NNN}`:

| Type Code | Record Type | Example |
|-----------|------------|---------|
| `NC` | Non-Conformance | `QMS-NC-2026-001` |
| `CAPA` | Corrective and Preventive Action | `QMS-CAPA-2026-001` |
| `DOC` | Controlled Document | `QMS-DOC-2026-001` |
| `REC` | Quality Record (general) | `QMS-REC-2026-001` |
| `AUD` | Internal Audit Finding | `QMS-AUD-2026-001` |

The system auto-generates reference numbers on record creation. You cannot edit a reference number after creation — this preserves the audit trail integrity.

### Mandatory vs Optional Fields

**Common mistake**: Leaving optional fields blank when they carry operational significance. The `detection point` field on NC records is technically optional but is required by many certification bodies during audits. Treat fields marked with an asterisk (*) as mandatory; treat other fields as "strongly recommended."

### The Audit Trail

Every field change on every quality record is captured in an append-only audit trail. To view it: open any record → select the **Audit Trail** tab. The trail shows:

- Timestamp (ISO 8601, UTC)
- Actor (user display name + email)
- Field changed (field label, not database column)
- Previous value → New value
- IP address (admin-visible only)

This is your primary evidence source for ISO 9001 clause 7.5 (documented information) compliance. You do not need to maintain a separate change log.

---

## Section 2: Document Control Workflow

ISO 9001:2015 clause 7.5 requires that documented information be controlled for: availability, protection, distribution, access, retrieval, and change management. Nexara automates all of these.

### Creating a Controlled Document

1. Navigate to **Quality → Documents → New Document**
2. Select **Document Type**: Procedure, Work Instruction, Policy, Form, or Record Format
3. Complete mandatory fields:
   - **Title** (clear, descriptive — e.g. "Incoming Goods Inspection Procedure")
   - **Document Owner** (the person responsible for reviewing and maintaining this document)
   - **Review Frequency**: Annual, Biennial, or Event-triggered
   - **Applicable Processes**: link to process map entries if your organisation uses them
4. Upload the document file (PDF preferred; Word accepted for editable forms)
5. Set the **Approval Route** — single approver or sequential multi-stage
6. Click **Submit for Review**

The document enters **Draft** status and is routed to the first approver.

### Version Management

Nexara uses semantic versioning: `v{major}.{minor}`:

- **Minor revision** (v1.0 → v1.1): content updated but scope/purpose unchanged; same approver route
- **Major revision** (v1.x → v2.0): significant scope change; requires full re-approval
- When a new version is approved, the previous version is automatically **Superseded** — it remains readable by users with archive access but is removed from the active document library

**Worked example**: Your "Supplier Qualification Procedure" (v2.3) needs a minor update to the minimum score threshold. You upload the revised file, set the revision type to Minor, add a change summary ("Section 4.2: minimum score updated from 65 to 70"), and route for approval. On approval, v2.4 becomes active. v2.3 is automatically archived with the superseded timestamp.

### Approval Workflow

**Single approver**: Document → approval request email → approver opens in portal → approves/rejects with comment → document status updated.

**Multi-stage approval**: Stage 1 approver → on approval → Stage 2 approver notified → on approval → document approved. Any stage rejection returns the document to Draft with the rejection comment.

**Delegated authority**: If the primary approver is absent, the document owner can reassign the approval to a nominated deputy via **Actions → Reassign Approval**.

**Common mistake**: Creating a multi-stage approval where both approvers are the same person. The system will flag this as a conflict. Use different approvers at each stage.

---

## Section 3: Approval Workflows (General)

Quality approval workflows apply to NC closures, CAPA effectiveness reviews, and document approvals. All follow the same pattern.

### Escalation Rules

If an approval is not actioned within the configured SLA (default: 5 business days), the system:

1. Sends a reminder notification to the approver (Day 3)
2. Sends an escalation notification to the approver's manager (Day 5)
3. Logs the escalation in the record's audit trail

You can view all pending approvals in **Quality → My Actions → Pending Approvals**.

### Re-routing an Approval

If the assigned approver is unavailable (e.g., on leave) and cannot delegate:
1. Open the record
2. Select **Actions → Reassign Approval**
3. Select the substitute approver and add a reassignment reason
4. The original approver receives a notification when they return

---

## Section 4: Quality KPIs — Dashboard Orientation

The Quality KPI dashboard is at **Quality → Dashboard**. Key metrics:

| KPI | Description | Healthy Range | Calculation |
|-----|-------------|---------------|-------------|
| NC Open Rate | % of NCs raised in period still open | < 15% | Open NCs / Total NCs × 100 |
| Closure Within SLA | % closed within 30-day SLA | > 90% | Closed on time / Total closed × 100 |
| CAPA Effectiveness Rate | % of CAPAs marked as Effective after review | > 85% | Effective / Total reviewed × 100 |
| Repeat NC Rate | % of NCs that are repeats (same root cause, 12-month window) | < 10% | Repeat NCs / Total NCs × 100 |
| Avg Days to Close | Average calendar days from NC raised to NC closed | < 20 days | Sum of closure days / Total closed |

**Red indicator**: Metric is below threshold; management action required.
**Amber indicator**: Metric is approaching threshold (within 5%); monitor closely.
**Green indicator**: Metric is within acceptable range.

---

## Section 5: ISO 9001 Clause Mapping

Nexara automatically maps NC categories to ISO 9001:2015 clauses for audit evidence generation:

| NC Category | ISO 9001:2015 Clause | Clause Title |
|-------------|---------------------|--------------|
| Product | 8.7 | Control of nonconforming outputs |
| Process | 8.5 | Production and service provision |
| System | 6.1 | Actions to address risks and opportunities |
| Supplier | 8.4 | Control of externally provided processes, products and services |
| Customer Feedback | 9.1.2 | Customer satisfaction |
| CAPA | 10.2 | Nonconformity and corrective action |
| Document Control | 7.5 | Documented information |

When you generate an ISO evidence package, Nexara groups all records by clause number and creates an indexed PDF report. External auditors can cross-reference your records against the standard without any manual indexing from you.

**Common mistake**: Selecting "System" category for a supplier-related NC because the root cause was found to be a systemic issue. The category should reflect the *source* of the NC (Supplier), not the root cause type. Document the systemic root cause in the investigation record.
