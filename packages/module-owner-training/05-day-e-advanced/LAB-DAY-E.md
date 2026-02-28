# Lab Exercise — Day E: Audits, CAPA & Management Review

**Duration**: 75 minutes (14:30–15:45)
**Sandbox environment**: Pre-loaded with Vertex Global Systems sample data
**Your role**: QMS Manager / Internal Audit Lead
**Prerequisite**: Completed Content Blocks 1, 2, and 3

---

## Scenario Background

**Organisation**: Vertex Global Systems — a precision engineering and systems integration firm, ISO 9001:2015 certified
**Your role**: QMS Manager and Internal Audit Lead

Vertex Global Systems has a ISO 9001:2015 surveillance audit scheduled in 4 weeks. You are conducting a preparatory internal audit to identify gaps before the certification body arrives. The audit covers clauses 7.5 (documented information), 8.7 (control of nonconforming outputs), 10.2 (nonconformity and corrective action), and 10.3 (continual improvement).

The audit has surfaced three findings:

1. **Major NC — Clause 8.7**: A review of 18 NC records created in the last 6 months reveals that 12 of them have incomplete documented information — the `description` and `rootCause` fields are blank. The system did not enforce completion of these fields, and production supervisors have been saving NC records with only a title. This is a systemic failure to meet the documented information requirements for NC records under ISO 9001 clause 8.7.

2. **Observation — Clause 7.5.3**: During a walkthrough of the document control system, you find that 3 of 22 active controlled procedures have not been updated to reflect the most recent approved revision. The revision references on the document cover sheets are correct, but the document management system shows a newer approved version for each. This is not yet a non-conformance (the procedures are partially current) but represents a risk if not addressed.

3. **OFI — Clause 10.3**: The Projects department has an informal practice of reviewing lessons learned at the end of each project and sharing them at monthly team meetings. This practice is not documented and not linked to the management system's continual improvement objectives. You see an opportunity to formalise this practice and link it to management review outputs.

Additionally: The annual management review is overdue by 3 weeks. It should have been held on the first Monday of this month. The `nextReviewDate` on last year's management review record has passed without a new review being created.

You have 75 minutes to complete the following steps. Steps 1 and 2 will be demonstrated on the facilitator screen.

---

## Step 1: Create the Internal Audit Record

1. Navigate to **Audits → Programmes → AUD-2026-001** (the Vertex Global Systems 2026 annual programme is pre-loaded in the sandbox)
2. Add a new audit to the programme: **Add Audit**
3. Complete the audit record:
   - `auditType`: **Internal**
   - `auditScope`: "ISO 9001:2015 clauses 7.5 (Documented information), 8.7 (Control of nonconforming outputs), 10.2 (Nonconformity and corrective action), 10.3 (Continual improvement)"
   - `leadAuditor`: Your sandbox user account
   - `auditeeList`: Add the Quality Manager (sandbox user) and Production Manager (sandbox user) as auditees
   - `plannedStartDate` and `plannedEndDate`: Last week (simulated — use a date 7 days ago)
   - `plannedDuration`: 8 hours
4. Record the opening meeting: Navigate to the audit record → **Opening Meeting → Record Opening Meeting**
   - `meetingDate`: 7 days ago
   - `attendees`: Add yourself (Lead Auditor), Quality Manager (Auditee), Production Manager (Auditee)
   - `agendaAgreed`: true
   - `openingNotes`: "Audit scope, objectives, and method communicated and agreed. Audit covers clauses 7.5, 8.7, 10.2, 10.3. Sampling to include review of NC records (last 6 months), document version review (all active controlled procedures), and interviews with production supervisors."
5. Save the audit record

**Expected outcome**: Audit record created within the 2026 programme, opening meeting recorded.

---

## Step 2: Record the Three Findings

With the audit record open, navigate to **Findings → Add Finding** for each of the three findings below.

**Finding 1 — Major NC:**
- `findingClassification`: **Major NC**
- `isoClause`: ISO 9001:2015 — **Clause 8.7** (Control of nonconforming outputs)
- `findingTitle`: "Incomplete documented information on NC records — systematic failure across 12 of 18 records reviewed"
- `findingDescription`: "A sample of 18 NC records created in the last 6 months reveals that 12 (67%) have blank description and root cause fields. The NC record template does not enforce completion of these fields. Production supervisors are saving records with title only. This constitutes a systematic failure to maintain required documented information for the control of nonconforming outputs under ISO 9001:2015 clause 8.7."
- `requiredAction`: "Immediate: activate mandatory field validation for description and root cause on the NC record template. Short term: review all incomplete NC records and complete the missing fields where investigation evidence is available. Long term: verify through corrective action effectiveness review."
- `correctionDeadline`: 14 days from today (before the surveillance audit)

**Finding 2 — Observation:**
- `findingClassification`: **Observation**
- `isoClause`: ISO 9001:2015 — **Clause 7.5.3** (Control of documented information)
- `findingTitle`: "Version control not consistently applied — 3 of 22 controlled procedures show mismatched revision references"
- `findingDescription`: "Three controlled procedures (QP-008, QP-014, QP-019) have cover sheet revision references that do not match the current approved version in the document management system. The current approved versions exist and are accessible, but the cover sheets have not been updated. This is an observation — not yet a non-conformance — but creates a risk of obsolete versions being used."
- `requiredAction`: "Update cover sheet revision references on QP-008, QP-014, and QP-019 to match the current approved version. Review the document issue and distribution process to identify why cover sheet updates are being missed."

**Finding 3 — OFI:**
- `findingClassification`: **OFI**
- `isoClause`: ISO 9001:2015 — **Clause 10.3** (Continual improvement)
- `findingTitle`: "Projects team lessons learned practice — opportunity to formalise and link to management review"
- `findingDescription`: "The Projects department conducts informal lessons learned reviews at project completion and shares findings at monthly team meetings. This is a positive practice that could be strengthened by: (a) creating a formal lessons learned record type in Nexara, (b) linking lessons learned to continual improvement objectives, and (c) including lessons learned themes as a standing agenda item on the management review."

Save all three findings.

**Expected outcome**: Three findings recorded — one Major NC, one Observation, one OFI — each linked to the correct ISO clause.

---

## Step 3: Generate the Audit Report and Distribute

1. Navigate to the audit record → **Reports → Generate Audit Report**
2. Review the generated report — verify:
   - All three findings appear with their correct classification and ISO clause references
   - The executive summary shows: 1 Major NC, 1 Observation, 1 OFI, 0 Minor NCs, 0 Conformance findings
   - The required action for the Major NC is correctly listed with the 14-day deadline
3. Set the distribution list: add the Quality Director (sandbox user) and the Managing Director (sandbox user)
4. Distribute the report — status changes to **Distributed**

**Expected outcome**: Audit report generated with all three findings; distributed to Quality Director and Managing Director.

---

## Step 4: Create a CAPA for the Major NC Using 5-Why

1. Navigate to the Major NC finding → **Actions → Create CAPA**
2. Verify pre-populated fields (finding reference, title, finding description)
3. Set:
   - `capaType`: **Corrective**
   - `rootCauseMethod`: **5-Why**
   - `effectivenessReviewDate`: 30 days from today
4. Complete the 5-Why analysis:
   - Why 1: Why were NC records found to have incomplete description and root cause fields? → Because production supervisors saved NC records without completing all fields.
   - Why 2: Why did production supervisors save NC records without completing all fields? → Because the system permitted saving an NC record without completing the description and root cause fields.
   - Why 3: Why does the system permit saving without these fields? → Because mandatory field validation was not activated for the description and root cause fields in the NC record template configuration.
   - Why 4: Why was mandatory field validation not activated? → Because the NC record template was configured by the IT implementation team without documented Quality module requirements specifying which fields are mandatory.
   - Why 5: Why were Quality module configuration requirements not documented for the IT implementation team? → Because there was no formal configuration requirements process between the QMS function and the IT implementation team during system setup.
   - `rootCauseStatement`: "Absence of a formal configuration requirements process between the QMS function and the IT implementation team during system setup, resulting in mandatory field validation being omitted from the NC record template."
5. Add three corrective actions:

   | Action Description | Success Criteria | Owner | Due Date |
   |-------------------|-----------------|-------|----------|
   | Activate mandatory field validation for `description` and `rootCause` fields on the NC record template in Nexara system configuration | Attempted save of NC record without description/root cause is prevented by the system — verified by test | IT Systems Manager (sandbox user) | 5 days from today |
   | Review all 12 incomplete NC records from the last 6 months and complete description and root cause fields using available investigation notes, production records, and supervisor interviews | All 12 records show completed description and root cause fields — verified by QMS Manager audit | Quality Engineer (sandbox user) | 10 days from today |
   | Establish a formal configuration requirements process: QMS function to document Nexara module requirements before any configuration change is made by IT; requirements signed off by QMS Manager and IT Manager | Process document QP-NEXARA-CONFIG-001 approved and published; IT Manager and QMS Manager sign-off recorded | QMS Manager (your account) | 21 days from today |

6. Save the CAPA record — note the reference (e.g. `QMS-CAPA-2026-007`)

**Expected outcome**: CAPA created with 5-Why RCA completed (all 5 levels), root cause confirmed, 3 corrective actions with named owners and due dates.

---

## Step 5: Create the Management Review Record

1. Navigate to **Management Review → New Review**
2. Complete the record:
   - `reviewTitle`: Vertex Global Systems — ISO 9001:2015 Management Review — Q4 2026 (Overdue)
   - `reviewDate`: Today's date
   - `chairperson`: Managing Director (sandbox user)
   - `attendees`: Add yourself (Secretary), Quality Director (Member), HR Director (Member), Finance Director (Member)
   - `nextReviewDate`: 6 months from today
   - `standardsInScope`: ISO 9001:2015
3. Run the input compiler: **Inputs → Compile** — select data scope: last 12 months — include modules: Quality, Health & Safety, HR, Audits
4. Review the compiled inputs — verify the following appear:
   - NC open rate and CAPA effectiveness rate from the Quality module
   - Audit findings summary (your Major NC should appear)
   - HR training compliance percentage
5. Add three agenda items:
   - **Item 1**: "Review of quality performance KPIs — Q3/Q4 2026" — owner: Quality Director — time: 20 min — description: "Review of NC open rate, CAPA effectiveness, repeat NC rate, and closure within SLA. Identify trends and corrective actions required."
   - **Item 2**: "Review of audit findings and open CAPA status" — owner: QMS Manager (yourself) — time: 20 min — description: "Review findings from the preparatory internal audit. Status of CAPA QMS-CAPA-2026-007 (Major NC against clause 8.7). Readiness for surveillance audit in 4 weeks."
   - **Item 3**: "Determination of continual improvement objectives — 2027" — owner: Managing Director — time: 20 min — description: "Set continual improvement objectives for 2027, aligned to the strategic plan. Consider OFI from audit findings."
6. Record outcomes for each agenda item:
   - Item 1 outcome: "Quality KPIs reviewed. NC open rate has increased from 2.4% to 3.1% over Q4 — primarily driven by the 12 incomplete NC records identified in the internal audit. CAPA QMS-CAPA-2026-007 is expected to resolve the root cause. Management satisfied that trend will reverse on CAPA completion. Action: QMS Manager to report CAPA progress to MD weekly until surveillance audit."
   - Item 2 outcome: "Internal audit findings reviewed. Major NC against clause 8.7 acknowledged. CAPA in progress with actions due before surveillance audit. Observation against clause 7.5.3 to be resolved by QA team within 5 days. OFI against clause 10.3 referred to action item 3."
   - Item 3 outcome: "Three continual improvement objectives adopted for 2027: (1) achieve zero Major NCs at surveillance audit; (2) implement formal lessons learned process in Projects department linked to management review; (3) reduce NC open rate to below 2% by Q3 2027."
7. Create two output actions:
   - **Output Action 1**: "Establish formal Nexara configuration requirements process (QP-NEXARA-CONFIG-001) — owner: QMS Manager — due: 21 days" — link to Agenda Item 2
   - **Output Action 2**: "Commission formal lessons learned process design for Projects department, linked to management review OFI — owner: Quality Director — due: 60 days" — link to Agenda Item 3
8. Change the management review status to **Complete** (confirm minutes approved by chairperson)

**Expected outcome**: Management review record complete with compiled inputs, three agenda items with outcomes, two output actions. Status = Complete.

---

## Step 6: Generate the ISO 9001 Evidence Package

1. Navigate to **Management Review → [Record] → Reports → ISO Evidence Package → Generate**
2. Select standard: ISO 9001:2015
3. Verify the evidence package includes: agenda, compiled inputs, minutes (all three items with outcomes), output action register, attendance list
4. Download the ZIP file and open the PDF index
5. Navigate to **Audits → [Record] → Reports → Generate Audit Report** — download this report
6. Navigate to **Quality → CAPA → QMS-CAPA-2026-007 → Export CAPA Record** — download this export
7. You now have a three-document evidence set: management review pack, internal audit report, and CAPA record. This is the package that would be provided to the ISO 9001 surveillance auditor for clauses 8.7, 9.3, and 10.2.
8. Verify: open the management review PDF index and confirm that the ISO clause mappings show: 9.3.1 (conducted at planned intervals — note the overdue explanation), 9.3.2 (required inputs considered), 9.3.3 (outputs with decisions and actions).

**Expected outcome**: Three-document evidence set downloaded; ISO evidence package confirms clause coverage.

---

## Extension Task (for early finishers)

**Link the OFI to a management review output action and create a formal preventive action**

1. Navigate to Audit Finding 3 (OFI — Clause 10.3)
2. Create a CAPA from the OFI finding: **Actions → Create CAPA**
   - `capaType`: **Preventive** (this is an OFI, not a NC — a preventive CAPA addresses a potential gap)
   - `description`: "Formalise the Projects department lessons learned practice and link to management review continual improvement objectives"
3. Add one preventive action:
   - `actionDescription`: "Design and implement a formal lessons learned record type in Nexara for Projects department. Each project completion to include a lessons learned session with mandatory output record. Lessons learned themes to be compiled quarterly and presented as a standing input at the management review."
   - `successCriteria`: "Lessons learned record type live in Nexara; at least 3 lessons learned records completed within 60 days; first management review after implementation includes a compiled lessons learned input."
   - `actionOwner`: Quality Director (sandbox user)
   - `dueDate`: 60 days from today
4. Navigate to **Management Review → Output Actions Dashboard** — confirm that the two output actions from the management review and the preventive CAPA action all appear in their respective dashboards

---

## Debrief Questions (group discussion — 5 min)

1. **CAPA verification before surveillance audit**: The Major NC against clause 8.7 indicates that 12 of 18 NC records have incomplete documented information. Your corrective action includes activating mandatory field validation for future records and back-filling the 12 incomplete records. The surveillance audit is in 4 weeks. Before the auditor arrives, what specific checks would you perform in Nexara to verify that the corrective action is effective? What evidence would you gather, and which Nexara report would you use to demonstrate to the auditor that the corrective action has been implemented?

2. **ISO 10.2 documented evidence**: The 5-Why root cause analysis revealed that the root cause is a management system failure — no formal configuration requirements process between QMS and IT. Under ISO 9001:2015 clause 10.2.2, the organisation must retain documented information as evidence of: (a) the nature of the non-conformance and any subsequent actions taken, (b) the results of any corrective action. Given the Major NC you have recorded, the CAPA you have created, and the corrective actions you have planned, which specific records in Nexara constitute this documented evidence? What additional evidence should you create or retain before the surveillance audit?

3. **Management review "planned intervals"**: The management review was 3 weeks overdue. Under ISO 9001:2015 clause 9.3.1, the organisation must conduct management reviews "at planned intervals." The standard does not specify a frequency; the organisation must determine what is appropriate for their context. How would you explain the 3-week delay to the surveillance auditor? What evidence does Nexara provide that (a) the review was scheduled (i.e., "planned") and (b) it has now been conducted? What change would you make in Nexara to ensure the next review is not missed?
