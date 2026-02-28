# Day E Facilitation Guide — Audits, CAPA & Management Review

## Facilitator Reference: CONFIDENTIAL

---

## Pre-Session Setup (08:00–08:30)

### Room & Technology
- Open Nexara sandbox: navigate to Audits module — confirm Audit Programme, Conduct Audit, and Findings sections load; navigate to CAPA module; navigate to Management Review
- Verify participant sandbox accounts have Audit Lead and CAPA Manager roles assigned (required for full lab access)
- Whiteboard or flip chart ready — you will use it heavily in Block 2 for the 5-Why exercise
- Print the 5-Why worksheet (5 rows, each with "Why?" → "Because..." format) — one per participant
- Printed lab sheets (LAB-DAY-E.md) at the front — do NOT distribute until 14:30
- Projector: open to Audits module landing page

### Facilitator Mindset
Day E participants are the most analytically rigorous group in the Module Owner programme. Audit leads and QMS managers are accustomed to questioning evidence, probing for root causes, and thinking in system terms. They will push back if your explanations lack precision — and that is a good thing. This group values accuracy over entertainment. Be prepared to go deeper on root cause methodology and the evidential standards required for ISO certification body scrutiny.

The most common anxiety in this group: "What if the certification body asks for something our management review doesn't cover?" Reassure them that the Nexara Management Review input compiler maps directly to the ISO clauses — they will see this in Block 3.

---

## 08:30–09:00 — Welcome & Introductions

**Script:**
> "Good morning and welcome to Day E — the advanced programme. Today covers audits, CAPA, and management review: the three disciplines that drive the entire management system improvement cycle. By 17:00 you will be able to plan an audit programme, conduct findings-based audits, drive root cause analysis through to effective corrective action, and compile a management review that satisfies ISO certification requirements.

> Introductions: your name, your organisation, and your biggest current audit or CAPA challenge."

Write the challenges on the flip chart. These become reference points throughout the day — particularly useful when you reach Block 2 root cause analysis.

**Day objectives:**
1. Plan and manage an annual internal audit programme
2. Conduct an audit in Nexara: opening meeting, sampling, finding classification, report
3. Apply 5-Why, fishbone, and fault tree analysis to CAPA root causes
4. Compile and run a management review using the input compiler
5. Generate an ISO evidence package ready for certification body submission

---

## 09:00–10:30 — Block 1: Audit Management (90 min)

### Opening (5 min)
> "Auditing is the engine of management system improvement. Without rigorous auditing, you cannot identify where the system is failing, and without that, CAPA and management review are just paper exercises. Block 1 gives you the audit module in full."

### Annual Audit Programme (20 min)

**Risk-based scheduling — key concept:**
> "The audit programme is not a fixed calendar. In Nexara, each process or department in scope is assigned a risk level based on: the complexity of the process, its ISO clause coverage, previous audit findings, and any significant changes since the last audit. Higher-risk processes are audited more frequently."

Live demo: Audits → Audit Programme → Annual Schedule
- Show how to add a process to the programme (Department, Process, Scope, Planned Date, Lead Auditor)
- Show the risk-weighting field — explain 1 (low) to 5 (critical)
- Demonstrate the coverage gap view: "This view shows you which ISO clauses have no planned audit against them. If you see a red clause, you have a programme gap."

> "ISO 9001:2015 Clause 9.2.2 requires you to consider the importance of the processes and the results of previous audits when scheduling. The risk-based scheduling in Nexara satisfies this requirement automatically — as long as you actually populate the risk levels."

### Audit Conduct (35 min)

**Opening meeting script (give participants):**
> "When you open an audit in Nexara and click 'Start Audit', it generates a default opening meeting agenda. Customise it before your audit. The opening meeting establishes: the scope, the method (document review / observation / interview), the schedule, and the confidentiality protocol."

**Sampling technique — live demo:**
Navigate to Conduct Audit → Sampling tab

> "Sampling in Nexara is structured. For document review: select the record type (e.g., NC records) and the date range. The system presents a list; you select your sample. For process observations: use the Checklist tab — the checklist auto-populates from the ISO clause mapping for the process you are auditing."

**Finding classification — draw table on whiteboard:**

| Classification | Definition | Action required |
|---------------|-----------|-----------------|
| Conformance | Evidence confirms requirement is met | Record as positive; no action |
| Observation | Minor improvement opportunity; no requirement breach | Record; optional improvement action |
| OFI | Opportunity for Improvement — good practice suggestion | Record; organisation decides whether to act |
| Minor NC | Single, isolated failure to meet a requirement | CAPA required within 90 days |
| Major NC | Systematic failure or complete absence of requirement | CAPA required within 30 days; may affect certification |

> "The distinction between Minor and Major is judgment-based — but the key test is: is this an isolated lapse (Minor) or does it indicate the system doesn't work at all (Major)? A single missing record is Minor. Finding that no records have been kept for six months is Major."

**Audit report generation (10 min):**
Demo: Conduct Audit → Generate Report
- Show the auto-populated findings summary
- Show the distribution list — who receives the report
- Show the finding reference numbers: `AUD-{YEAR}-{NNN}-F{N}`

> "The report is locked once distributed. Any subsequent conversation or dispute is handled through the CAPA record linked to each finding — not by modifying the audit report."

**Common mistake:**
> "Never re-open a closed audit finding to change the classification after the report is issued. If you got the classification wrong, record a note in the associated CAPA and raise it at the next management review."

### Transition
> "Break at 10:30. Block 2 starts at 10:45 with the topic most people find hardest: root cause analysis."

---

## 10:30–10:45 — Break

---

## 10:45–12:15 — Block 2: CAPA & Root Cause Analysis (90 min)

### Opening (5 min)
> "CAPA is where most organisations fail. They fill in the form, write 'training provided' as the corrective action, close the CAPA, and the problem comes back. Today we fix that. The reason it keeps coming back is because 'training provided' addresses the symptom, not the root cause. Root cause analysis is the discipline that gets you to the actual cause."

### 5-Why Technique (25 min)

Distribute printed 5-Why worksheets.

**Live exercise — use a problem from the flip chart list (participant challenges from the morning intro).**

If none are suitable, use: "The management review was not held within the required 12-month interval."

Work through together on whiteboard:

| # | Why? | Because... |
|---|------|-----------|
| 1 | Why was the MR not held on time? | Because no date was confirmed in Q4 |
| 2 | Why was no date confirmed? | Because the secretary assumed the QMS Manager would schedule it |
| 3 | Why did the secretary assume this? | Because there is no documented responsibility for scheduling the MR |
| 4 | Why is there no documented responsibility? | Because the MR procedure does not assign this task to a named role |
| 5 | Why does the procedure not assign it? | Because the procedure was written by a consultant who left before it was used |

Root cause: **Procedure gap — MR scheduling responsibility not assigned**

> "Look at why 5. If we had stopped at why 1, our corrective action would be 'schedule the management review' — and next year we would be back here. The root cause fix is: update the MR procedure to assign scheduling responsibility to a named role. That is the action that prevents recurrence."

**Demo in Nexara:**
Navigate to CAPA → New CAPA → Source: Management Review → enter the root cause → create 5-Why record in the RCA tab

### Fishbone (Ishikawa) Diagram (15 min)

> "The 5-Why works well for single-strand problems. For complex problems with multiple contributing factors, fishbone is more powerful. The categories are: People, Process, Equipment, Environment, Materials, Measurement."

Draw on whiteboard for: "Repeat non-conformances on weld inspection records"

- **People:** Inspectors not trained on new procedure version
- **Process:** Procedure update not communicated to all shifts
- **Equipment:** Inspection gauge calibration overdue
- **Environment:** Poor lighting in inspection bay
- **Materials:** Different wire batch with different visual characteristics
- **Measurement:** Acceptance criteria ambiguous in procedure wording

> "In Nexara's CAPA RCA tab, you can attach a fishbone diagram image. Some teams build it in PowerPoint, screenshot it, and upload the PNG. The analysis lives in the CAPA record, not in someone's notebook."

### SMART Action Planning (20 min)

> "Every corrective action must be SMART: Specific, Measurable, Achievable, Relevant, Time-bound. The most common failure: Time-bound. 'Update the procedure' is not SMART. 'Quality Manager to update WI-009 to version 3.1 by 28 March 2026' is SMART."

Live demo: CAPA → Action Plan tab
- Add action: owner, description, due date, evidence required
- Show how to mark action complete and attach evidence
- Show the effectiveness review date: "This is the date set for checking whether the action actually worked. It must be after the action due date — typically 30–90 days later."

**Repeat findings rate (10 min):**
> "Nexara tracks whether the same finding or root cause category recurs. If your CAPA effectiveness rate is below 80% — meaning 20% of closed CAPAs have the same root cause appearing again — that is a systemic problem with your root cause analysis quality. The repeat findings rate KPI is on the CAPA dashboard."

---

## 12:15–13:00 — Lunch

---

## 13:00–14:15 — Block 3: Management Review (75 min)

### Opening
> "The management review is the capstone of the management system. It is where top management reviews all the inputs from across the organisation, identifies trends, and makes decisions. Nexara's management review module automates the input compilation — which is the most time-consuming part."

### Management Review Architecture (15 min)

> "A management review in Nexara has a status workflow: DRAFT → INPUTS_COMPILED → AGENDA_SET → MINUTES_IN_PROGRESS → MINUTES_APPROVED → CLOSED"

> "The key is the input compiler. It pulls live data from every active module: NC rates, CAPA effectiveness, audit findings, incident statistics, training compliance, legal register status, supplier performance, and more. Let me show you."

Live demo: Management Review → New Review → Compile Inputs
- Show the input categories (ISO 9001 Clause 9.3.2 inputs listed)
- Run compilation — watch the data appear
- Show the gap indicator: any clause with "No data" is a risk — either the process has no records, or the data hasn't been recorded in Nexara

> "If you see 'No data' for Customer Complaints, it might mean you have had no complaints — or it might mean complaints aren't being recorded in the system. You need to know which it is before the certification body asks."

### Agenda & Minutes (20 min)

Live demo:
- Navigate to the compiled review → Generate Agenda
- Show the default agenda items mapped to ISO clauses
- Show how to add agenda items (strategic items, specific findings to discuss)
- Show the Minutes tab — structured fields for decisions, responsible persons, and output actions

> "Output actions from the management review are high-priority items. They should be tracked in the CAPA module or as management review actions — not in someone's email inbox."

### ISO Evidence Package (40 min)

> "This is the feature that will save you the most time at audit time. The ISO evidence package compiler pulls together everything the certification body needs to verify your management review meets the standard."

Live demo: Management Review → [select closed review] → Generate Evidence Package

Show the package contents:
- Meeting attendance record (with digital signatures)
- Input data summary with source record references
- Decisions and output actions register
- ISO clause cross-reference table
- Next review date confirmation

> "Hand this to your auditor and they can verify conformance without asking for anything else. The cross-reference table tells them exactly which records satisfy which clause."

**Certification body submission checklist:**
Work through this verbally — participants note in their handbooks:
- [ ] Management review held within 12 months of last review
- [ ] All required inputs present (Clause 9.3.2)
- [ ] Evidence of top management attendance
- [ ] Output actions assigned and tracked
- [ ] Next review date confirmed

---

## 14:15–14:30 — Break

---

## 14:30–15:45 — Hands-On Lab (75 min)

Distribute printed lab sheets (LAB-DAY-E.md).

**Introduce the scenario:**
> "Your organisation today is Vertex Global Systems. You will plan and conduct an internal audit of their purchasing process, raise a CAPA using 5-Why analysis, compile the inputs for their next management review, and generate an ISO 9001 surveillance audit evidence package. This mirrors exactly what you would do in a real certification cycle."

Read the scenario aloud.

> "75 minutes. Work independently. The most common sticking point is the CAPA RCA tab — make sure you save the 5-Why analysis before moving to the action plan, otherwise it doesn't link. Raise your hand if you get stuck."

**Circulate every 10–15 minutes.** Watch for:
- Participants creating the CAPA before closing the audit finding — the CAPA should be raised from the finding record (Finding → Create CAPA)
- 5-Why not saved before action plan — check the RCA tab shows "Saved" status
- Management review compilation timing out — if it takes more than 30 seconds, try a browser refresh and re-run
- Evidence package generation requires the review to be in CLOSED status — participants may need to transition the status before generating

At 15:35: "Ten minutes left. If you are still on the CAPA action plan, skip the effectiveness review date and go directly to Step 4 (management review compilation) — that is the priority for the assessment."

---

## 15:45–16:30 — ISO Evidence & Certification Readiness (45 min)

**Group debrief on lab:**
> "Let us compare notes. Did anyone find a gap in the Vertex management review inputs — any clause showing 'No data'?"

Discuss findings. Expected gaps in the scenario: Customer Complaints (no records) and Supplier Performance (no evaluations completed).

> "What would you do if you discovered these gaps two weeks before a certification audit?"

Expected answers: raise a corrective action immediately; if records genuinely don't exist, declare it as a gap to the certification body and present a remediation plan.

**Certification body readiness exercise (20 min):**
> "Let us do a rapid mock. I am the certification body auditor. I am going to ask you questions and you tell me where in Nexara you would find the evidence."

Questions:
1. "Show me your internal audit programme for the last 12 months." → Audits → Audit Programme → Annual Schedule
2. "I want to see the root cause analysis for your three most recent Major NCs." → CAPA → filter by NC source, Major priority → RCA tab
3. "What were the outputs of your last management review?" → Management Review → select closed review → Output Actions tab
4. "How do you track whether your corrective actions are effective?" → CAPA → Effectiveness Review tab; CAPA dashboard → Effectiveness Rate KPI
5. "Who attended the last management review?" → Management Review → Attendance record

> "Every one of those questions has an answer that takes less than 30 seconds to produce in Nexara. That is the value of the system."

---

## 16:30–17:00 — Assessment & Certificate Ceremony (30 min)

> "Final session: the assessment. 20 questions, 30 minutes, 75% pass. Portal route: `/module-owner/advanced/assessment`. Timer starts on Begin."

Allow 25 minutes. At 16:55: "Two minutes — finalise any remaining answers."

**Post-assessment ceremony:**

For passers:
> "Congratulations — you are now a Nexara Certified Module Owner for Audits, CAPA & Management Review. Of the five Module Owner programmes, this is the one that has the most direct impact on certification outcomes. The skills you have built today — particularly root cause analysis and management review compilation — are what separate organisations that pass audits from those that struggle."

For those who did not pass (handle privately after the room clears):
> "Today covered a lot of complex material. The retake is available at the next cohort — I will confirm dates with your Nexara contact. Before the retake, I recommend focusing on finding classification (particularly Minor vs Major NC) and the effectiveness review criteria for CAPA."

---

## Q&A Reference Table

| Common question | Recommended answer |
|----------------|-------------------|
| Can we use Nexara for external audits (supplier audits)? | Yes — select "External" as the Audit Type. The workflow is the same; the scope field changes. |
| Can auditors add findings directly in the system during the audit? | Yes — the Conduct Audit mobile view is optimised for on-floor use. Auditors can record findings in real time. |
| What if the auditee disputes a finding? | Record the dispute in the finding's Notes field and flag it for the audit report. Disputed findings go through the same CAPA process — the classification is not changed. |
| How do we handle third-party audit findings (e.g., from a customer)? | Create a CAPA with source = "External Audit / Customer". The workflow is identical. |
| Can we import previous audit findings from an Excel tracker? | Contact training@nexara.io for the Audit Finding Import template (CSV format). |
| How far back can we pull management review inputs? | By default, the compiler covers the period since the last closed management review. You can manually adjust the date range. |
| What is the maximum number of CAPAs that can be linked to one audit? | No limit — the CAPA register scales to any number. Practically, more than 10 CAPAs from a single audit suggests the scope was too broad. |
| How do we mark a CAPA as effective? | Navigate to the CAPA → Effectiveness Review tab → record the evidence of effectiveness → change status to EFFECTIVE. This triggers closure. |

---

## Facilitation Troubleshooting

**"I can't raise a CAPA from the audit finding"**
The finding must be in status OPEN before the "Create CAPA" button appears. If the finding is in DRAFT, it needs to be submitted first.

**"The management review compilation is showing 'No data' for everything"**
This usually means the sandbox data for Vertex hasn't been seeded. Ask participants to switch to the standard sandbox organisation (set in profile settings) and rerun the compilation.

**"The 5-Why didn't save"**
Check the RCA tab is in Edit mode (click the pencil icon) and the Save button has been clicked. The system sometimes times out if idle — refresh and re-enter.

**Pacing — running late:**
If Block 2 (CAPA) runs long due to the 5-Why exercise (common), compress the fishbone segment to a demo rather than a group exercise. Never cut the assessment or the management review Block 3 — they are the most assessment-relevant content.

**HSE incident during session:**
Day E groups sometimes include people who have recently been through a difficult audit or a serious organisational incident. If a participant becomes distressed discussing a real-world scenario, offer a private break. Continue the session with the other participants.

**Assessment technical failure:**
Use printed fallback: ASSESSMENT-DAY-E.md — mark manually. Contact training@nexara.io to reopen the digital assessment. Do not delay the certificate ceremony for technical failures; issue manual certificates signed by the facilitator and replace with digital certificates within 48 hours.
