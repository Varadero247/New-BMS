# Module: Non-Conformance Management

**Programme**: Day A — Quality & Non-Conformance
**Delivery time**: Content Block 2 (see schedule)
**IMS Modules covered**: Quality → Non-Conformances, CAPA

---

## Section 1: Creating a Non-Conformance Record

Non-conformances (NCs) are the primary record type in the Quality module. A well-created NC record enables efficient investigation, root cause analysis, corrective action, and closure — and generates the evidence your auditors need.

### NC Creation Walkthrough

Navigate to **Quality → Non-Conformances → Raise NC**.

**Mandatory fields**:

| Field | Options / Format | Notes |
|-------|----------------|-------|
| `title` | Free text, max 200 chars | Use a clear, descriptive title. "NC #47" is not acceptable. "Dimensional non-conformance on steel brackets — Batch 2026-147" is correct. |
| `category` | Product / Process / System / Supplier | See categorisation guide below |
| `severity` | Minor / Major / Critical | Minor = no impact on product safety/fitness; Major = potential impact; Critical = actual impact or regulatory |
| `source` | Customer Complaint / Internal Audit / External Audit / Self-identified / Supplier Report | The origin of the NC |
| `detectionPoint` | Incoming Inspection / In-process / Final Inspection / Customer / Post-delivery | Where in the value chain the NC was detected |
| `responsibleOwner` | User lookup | The person responsible for investigating and closing the NC |
| `dueDate` | Date picker | Default: 30 calendar days from `dateRaised`; editable |
| `description` | Rich text | Describe what was found, not why it happened |

**Optional but strongly recommended**:
- `affectedBatch` — batch number, order reference, or job number
- `quantity` — number of affected items
- `containmentAction` — what has been done immediately to contain the NC (quarantine, rework, return)
- `evidenceAttachments` — photos, inspection reports, delivery notes

### NC Categorisation Guide

**Common mistake area**: This is where most quality managers initially make categorisation errors.

- **Product**: The NC is in the physical product — dimensional, visual, functional, or labelling defect. Example: Steel brackets outside tolerance.
- **Process**: The NC is in how the process was executed — procedure not followed, wrong sequence, missing step. Example: Heat treatment skipped on batch due to oven downtime.
- **System**: The NC is in the management system itself — procedure doesn't exist, training not done, documentation missing. Example: No calibration procedure exists for the new CMM.
- **Supplier**: The NC originated from a supplier or subcontractor. Example: Supplier shipped incorrect material grade. Note: If a supplier NC is also a product NC, use Supplier as the category — the product dimension is captured in the description.

---

## Section 2: Investigation Workflow

Once an NC is raised, the investigation workflow begins.

### Investigation Steps in Nexara

1. **Assign Investigation Team**: Under the NC record → **Investigation** tab → add team members. Team members receive email notifications.
2. **Record Immediate Containment**: Describe and date the containment action (e.g., "Quarantined batch 2026-147 — moved to red-tag area. Production halted pending inspection."). This is **not** the corrective action — it is the emergency response.
3. **Record Contributing Factors**: List factors that contributed to the NC (without identifying root cause yet). Example: "CMM calibration certificate expired. No system alert configured."
4. **Document Root Cause**: Select the root cause category and write the root cause statement. Root cause categories:
   - Human error (did not follow procedure)
   - Inadequate procedure (procedure unclear or missing)
   - Equipment failure (machine, tool, calibration)
   - Material defect (incoming material quality)
   - Environmental factor (temperature, humidity, contamination)
   - Design issue (specification error)
   - Supplier failure (external cause)
5. **Close Investigation**: Mark investigation complete — this does not close the NC; it triggers the CAPA workflow.

**Worked example**: An incoming inspection finds 43 steel brackets with a diameter 0.3mm outside tolerance. The investigation team finds: (a) the supplier used a different steel grade than specified; (b) incoming inspection did not check material certification. Contributing factors: supplier substitution, inadequate incoming inspection procedure. Root cause: Inadequate procedure — incoming inspection procedure does not include material certification check.

---

## Section 3: CAPA Linkage

### Creating CAPA from NC

Always create a CAPA from within the NC record, not as a standalone CAPA:

1. On the NC record → **Actions → Create CAPA**
2. The system pre-populates the CAPA with: NC reference, NC title, root cause statement, responsible owner
3. Review and edit the pre-populated fields; add:
   - `capaType`: Corrective (addressing an existing NC) or Preventive (addressing a potential NC)
   - `actionPlan`: Specific corrective actions with owners, due dates, and success criteria
   - `effectivenessReviewDate`: Scheduled date to evaluate whether the corrective action worked

**Why this matters**: The NC-to-CAPA parent-child relationship is what allows you to prove to an auditor that every NC has an associated corrective action. CAPA records created standalone (not linked to an NC) cannot be attributed as evidence for ISO 10.2 compliance.

### CAPA Lifecycle

| Status | Meaning |
|--------|---------|
| Open | CAPA raised, action planning in progress |
| In Progress | Actions being implemented |
| Pending Review | Actions complete; awaiting effectiveness review |
| Effective | Effectiveness review confirmed the CAPA worked |
| Ineffective | Effectiveness review found the NC recurred; new CAPA required |
| Closed | CAPA complete; NC parent record can now be closed |

---

## Section 4: Closure Verification

### Closing an NC

An NC cannot be closed until its linked CAPA has status **Effective** or **Closed**. This is a system constraint — not a manual check.

**Closure checklist** (system-enforced):
- [ ] Investigation record complete
- [ ] Root cause documented
- [ ] CAPA linked and status = Effective or Closed
- [ ] Closure evidence uploaded (e.g., re-inspection report, updated procedure, training records)
- [ ] Closure approved by the designated approver (may differ from responsible owner)

**Re-opening an NC**: If an auditor or manager finds that the NC was closed without adequate evidence, a SUPER_ADMIN or Quality Module Admin can re-open it. The re-opening reason is logged in the audit trail. This should be a rare event — target: zero re-openings after first closure in a period.

---

## Section 5: Repeat NC Tracking

### How the System Identifies Repeat NCs

The system flags an NC as a **Repeat NC** if, within the preceding 12 months, another NC exists with:
- Same category (Product / Process / System / Supplier)
- Same root cause category (human error, inadequate procedure, etc.)
- Same process area (the process area field on the NC record)

When a Repeat NC is flagged, the system:
1. Displays a **Repeat NC** banner on the record
2. Links the current NC to the previous NC(s) for traceability
3. Increments the Repeat NC Rate KPI on the dashboard
4. Triggers an email notification to the Quality Manager and the NC owner's manager

### Responding to Repeat NCs

A Repeat NC indicates that a previous corrective action was either ineffective or not fully implemented. The correct response:

1. Review the linked previous NC and its CAPA — was the action actually implemented?
2. If not implemented: escalate to the responsible owner's manager
3. If implemented but ineffective: the root cause analysis was incorrect — conduct a new, deeper root cause analysis
4. Raise a new CAPA targeting the actual root cause

**Escalation trigger**: Three or more Repeat NCs with the same root cause category in a 12-month period should be escalated to senior management via a Management Review input.

**Common mistake**: Raising a new NC for the same issue without linking it as a Repeat NC (by ensuring process area and root cause category match). This under-reports the repeat NC rate and masks systemic problems. Always check the Repeat NC indicator before completing the categorisation fields.
