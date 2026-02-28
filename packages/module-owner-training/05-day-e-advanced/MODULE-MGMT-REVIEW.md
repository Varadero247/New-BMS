# Module: Management Review

**Programme**: Day E — Audits, CAPA & Management Review | **IMS Modules**: Management Review (port 3043 / API 4038)
**Delivery time**: Content Block 3 (see schedule)

---

## Section 1: Management Review Architecture

Management review is the mechanism through which top management reviews the organisation's management system — assessing its continuing suitability, adequacy, effectiveness, and alignment with the strategic direction of the organisation. ISO 9001:2015 clause 9.3, ISO 45001:2018 clause 9.3, and ISO 14001:2015 clause 9.3 all require management review at planned intervals, with specific inputs that must be considered and outputs that must be produced. The certification body examiner will expect to see evidence of this at every surveillance and recertification audit.

In practice, many organisations treat management review as an annual obligation to be discharged as efficiently as possible — a meeting where a prepared pack is presented, noted, and filed. Nexara changes this by making the input compilation automatic, the minutes structured, and the output actions tracked. The result is a management review that is not a compliance exercise but a genuine strategic review instrument.

### Management Review Record Structure

Navigate to **Management Review → New Review**.

| Field | Notes |
|-------|-------|
| `reviewTitle` | E.g., "Vertex Global Systems — ISO 9001 Management Review — Q4 2026" |
| `reviewDate` | The scheduled or actual date of the review meeting |
| `chairperson` | Top management representative who chairs the meeting (typically CEO, MD, or Quality Director) |
| `attendees` | Linked to user records — role of each attendee recorded (Chair, Member, Secretary, Observer) |
| `nextReviewDate` | The date of the next scheduled management review |
| `standardsInScope` | Which standards this review covers: ISO 9001 / ISO 45001 / ISO 14001 / multiple |

### Status Progression

| Status | Meaning |
|--------|---------|
| Planned | Review scheduled; inputs not yet compiled |
| Inputs Compiled | Input compiler has run; data ready for review |
| In Review | Review meeting in progress or immediately after |
| Complete | Minutes approved and output actions assigned |

"Planned intervals" under ISO 9001 clause 9.3.1 does not specify a fixed frequency — the organisation must define what "planned intervals" means for their context. Nexara enforces the organisation's defined interval: if the `nextReviewDate` passes without a new review record being created in Planned status, the Quality Manager and chairperson receive an overdue notification. The audit trail records the gap, which must be explained to the certification body if the surveillance audit coincides with an overdue review.

---

## Section 2: Input Compiler

The input compiler is the most operationally significant feature of the Nexara management review module. It eliminates the process of manually gathering performance data from multiple system owners and collating it into a review pack — typically a process that takes several days and introduces transcription risk.

### Running the Input Compiler

Navigate to **Management Review → [Record] → Inputs → Compile**. Select:
- `dataScope`: The time period for data collection (typically the period since the last management review)
- `modulesToInclude`: Select which modules to pull data from

The compiler runs and populates the Inputs section with the following data, each timestamped and source-linked:

### Input Data by Module

| Input | Source Module | Key Metrics Compiled |
|-------|--------------|---------------------|
| Quality KPIs | Quality | NC open rate by category and severity; CAPA effectiveness rate; repeat NC rate; closure within SLA; top 5 open NCs by severity |
| HSE metrics | Health & Safety | TRIR (Total Recordable Incident Rate); LTIR (Lost Time Incident Rate); legal compliance rate; number of open risk assessments; overdue CAPA from incidents |
| HR data | HR | Headcount summary; training compliance % (training required vs completed); absence rate; overdue performance reviews |
| Finance summary | Finance | Budget utilisation %; cost variance by department; AP ageing summary; top 5 budget overruns |
| Audit findings | Audits | Total findings in period by classification (Conformance, Observation, OFI, Minor NC, Major NC); open CAPAs from audit findings; repeat findings rate |
| Customer satisfaction | CRM / Complaints | Customer satisfaction score; number of open complaints; complaint resolution rate within SLA |
| Risk register status | Risk | Number of risks at each level (Critical, High, Medium, Low); risks with overdue mitigation actions; risk appetite compliance |
| Environmental performance | Environment | Environmental incident count; legal compliance rate; energy consumption vs targets; emissions vs targets |

**Each compiled input is timestamped** with the date and time the data was extracted, and **source-linked** — clicking on any metric navigates directly to the underlying records in the source module. This means the management review pack is not a static snapshot but a navigable summary that the chairperson and members can drill into during the review.

### Why This Matters

Ask any QMS Manager what takes the most time in preparing for a management review and the answer is almost always "getting the data from the different system owners." The HR team sends a spreadsheet. The finance team sends last month's report. The HSE manager provides a summary email. The audit lead sends a findings list. These must then be compiled, reconciled, and formatted. Errors are common. Data from different periods is unintentionally mixed.

The Nexara input compiler produces a consistent, complete, and timestamped data set in seconds. The QMS Manager's role shifts from data gatherer to data interpreter — focusing on what the compiled data means rather than whether it is correct.

---

## Section 3: Agenda and Minutes

### Agenda Structure

Navigate to **Management Review → [Record] → Agenda → Add Agenda Item**.

| Field | Notes |
|-------|-------|
| `itemTitle` | E.g., "Review of quality KPIs — Q4 2026" |
| `itemOwner` | The person presenting this agenda item |
| `allocatedTime` | Minutes — used to plan the meeting duration |
| `description` | What will be covered; what decision or output is expected |

Agenda items must be saved before the meeting and should be distributed to attendees in advance. The agenda is included in the ISO evidence package.

### Minutes and Outcomes

For each agenda item, the minutes record is completed during or immediately after the meeting:

| Field | Notes |
|-------|-------|
| `outcomeSummary` | What was discussed and concluded on this agenda item |
| `keyDecisions` | Any decisions made that do not result in an action (e.g., "decision to retain the current quality policy without amendment") |
| `actions` | Action records created from this agenda item (see Section 4) |

Minutes are approved by the `chairperson`. Until approved, the management review status remains In Review. Approval changes the status to Complete and triggers distribution of the approved minutes to all attendees.

---

## Section 4: Output Actions

### Strategic vs Operational Actions

Management review output actions are qualitatively different from CAPA actions. CAPA actions are operational — they address specific non-conformances, incidents, or audit findings at process level. Management review output actions are strategic — they represent decisions by top management to resource, change, or direct the management system at an organisational level.

**Examples of management review output actions** (appropriate scope):
- "Commission external gap assessment against ISO 37001:2016 — owner: Legal Director — due: 90 days"
- "Resource the objectives programme for Q2 2026 — approve additional headcount for QMS function — owner: CEO — due: 30 days"
- "Review and update the quality policy to reflect the 2026 strategic plan — owner: QMS Manager — due: 60 days"

**Examples of what should not be management review output actions** (too operational — these belong in CAPA):
- "Update Procedure QP-014" (an operational corrective action)
- "Recalibrate CNC Machine #3" (an operational maintenance action)

Navigate to **Management Review → [Record] → [Agenda Item] → Add Action**. The action is created directly within the management review record and appears on the **Management Review Output Actions** dashboard — a separate view from the CAPA dashboard, specifically for tracking strategic outputs of the review.

### Tracking Output Actions

Navigate to **Management Review → Output Actions Dashboard** to see all open output actions across all management reviews, sorted by due date. Overdue output actions are highlighted and the chairperson is notified. Completion of output actions requires uploading completion evidence — the same evidence requirements as CAPA actions.

---

## Section 5: ISO Evidence for Certification Body

### Generating the ISO Evidence Package

Navigate to **Management Review → [Record] → Reports → ISO Evidence Package → Generate**. Select the standard(s) in scope: ISO 9001 / ISO 14001 / ISO 45001 (or all three for integrated management systems). The system generates a ZIP file containing:

| Document | Description |
|----------|-------------|
| Agenda | Structured agenda with items, presenters, and time allocations |
| Compiled inputs | Full compiled input data set with timestamps and source links |
| Minutes | Approved minutes with outcomes and decisions for each agenda item |
| Output action register | All output actions created at this review — with owners, due dates, and current status |
| Attendance list | Named attendees with roles — confirms top management was present |
| Input data snapshot | PDF export of the compiled input data at the time of the review |

### ISO Clause Mapping

| ISO Standard | Clause | Requirement | Evidence in Package |
|-------------|--------|-------------|-------------------|
| ISO 9001:2015 | 9.3.1 | Management review conducted at planned intervals | Agenda (date and frequency) + attendance list |
| ISO 9001:2015 | 9.3.2 | Required inputs considered | Compiled inputs report — confirms all clause 9.3.2 inputs were addressed |
| ISO 9001:2015 | 9.3.3 | Outputs include decisions and actions | Output action register |
| ISO 45001:2018 | 9.3 | Management review of OH&S management system | HSE metrics input + attendance of top management |
| ISO 14001:2015 | 9.3 | Management review of EMS | Environmental performance input + compliance obligations status |

### What the Examiner Looks for

A certification body examiner reviewing management review evidence is looking for three things: (1) that the review actually happened — evidence of real engagement, not a one-page sign-off form; (2) that all required inputs were considered — not just quality KPIs but the full list in clause 9.3.2 including customer satisfaction, objectives performance, supplier performance, and opportunities for improvement; and (3) that the review produced outputs — that decisions were made and actions were assigned to named individuals. The Nexara management review record, with its structured inputs, agenda, minutes, and output action register, addresses all three requirements in one document set.
