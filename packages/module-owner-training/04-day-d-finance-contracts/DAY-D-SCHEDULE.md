# Day D — Finance & Contracts: Full Day Schedule

**Programme**: Nexara Certified Module Owner — Finance & Contracts
**Duration**: 08:30–17:00 | 7 CPD Hours
**Audience**: Finance managers, procurement leads, legal counsel, contract managers
**Maximum Group Size**: 14 participants
**CPD Recognition**: CIMA / ICAEW accepted

---

## Facilitator Energy Note

Finance and procurement professionals value precision above all else. Vague descriptions of workflows will not land — this group wants to see exactly how the system handles exception cases, what the audit trail captures, and how approval routing is enforced when primary approvers are unavailable. Anchor every section to the audit trail: these participants understand that a finance system is only as good as the evidence it produces.

The contract lifecycle section generates the highest engagement of any content block in Day D. The question "Who in your organisation is currently managing your contract renewal pipeline?" almost always provokes strong and often uncomfortable responses — use this moment. Participants in this session frequently discover, mid-conversation, that their organisation has no reliable system for renewal alerts on evergreen contracts. That realisation is your entry point for the milestones and alerts content.

For the supplier management section, push on risk. Finance leads and procurement managers are increasingly expected to address supply chain risk at board level, and many have not had a system that quantifies it. Show the supply chain risk indicators early and let the group discuss before you walk through the setup.

---

## Full Timetable

### 08:30–09:00 | Welcome & Orientation (30 min)

**Session aim**: Establish group rapport, set day objectives, calibrate expectations

**Activities**:
- Facilitator introduces themselves and Nexara training team (3 min)
- Round-table introductions: name, organisation, role, and "the biggest financial control gap in your current system" (15 min)
- Day D objectives and schedule walkthrough — point out lab timing and assessment (5 min)
- Sandbox environment login check — every participant must confirm access to the Thornton Capital Group environment before 09:00 ends (5 min)
- Parking lot introduced — flip chart or shared document for deferred questions (2 min)

**Facilitator note**: Thornton Capital Group sandbox contains pre-loaded supplier records, contracts, and financial records. Confirm all participants can see the Finance and Contracts modules in the sidebar. If sandbox access is unavailable for more than two participants, delay Content Block 1 by no more than 10 minutes and escalate to IT support.

---

### 09:00–10:30 | Content Block 1 — Finance Workflows & Approval (90 min)

**Session aim**: Participants understand financial record architecture and can operate the PO/invoice approval workflow, budget vs actual tracking, and multi-currency features in Nexara

**Topics covered** (see `MODULE-FINANCE-WORKFLOWS.md` for full content):

- **Financial record architecture** (20 min): How financial records are structured in Nexara — record types, reference number format (`FIN-{TYPE}-{YEAR}-{NNN}`), mandatory fields, and the complete audit trail that captures every record creation, modification, and approval event
- **PO/invoice workflow** (25 min): Full purchase-to-pay workflow — Create PO → route for approval → supplier confirmation → delivery receipt → invoice matching → invoice approval → payment authorisation. The 3-way match explained (PO quantity vs delivery note vs invoice) and what happens when they do not match
- **Budget vs actual** (20 min): Budget entry, how actuals are auto-populated from approved transactions, variance calculation, amber at 10% overspend and red at 20% overspend, the budget transfer process and who can authorise it
- **Multi-currency** (15 min): Base currency configuration, transaction currency selection, daily mid-market rate and alternatives (fixed rate, contract rate), FX variance reconciliation and how it appears in reports
- **Q&A and parking lot** (10 min): Address questions; capture anything requiring sandbox demonstration

**Transition cue**: "We've covered how financial records are structured and how money moves through the purchase-to-pay workflow. After the break, we'll look at the asset that finance professionals most often have sitting unmanaged in a spreadsheet — contracts."

---

### 10:30–10:45 | Break (15 min)

---

### 10:45–12:15 | Content Block 2 — Contracts Management (90 min)

**Session aim**: Participants can create and manage contract records through their full lifecycle, set milestone and renewal alerts, control versions, track obligations, and execute the termination process

**Topics covered** (see `MODULE-CONTRACTS-MANAGEMENT.md` for full content):

- **Contract record structure** (20 min): Reference format `CTR-{YEAR}-{NNN}`, mandatory fields, contract types, the complete status progression from Draft through to Terminated, and why every status transition is recorded in the audit trail
- **Milestones and renewal alerts** (20 min): Creating milestones, configuring alert lead times (90-day renewal default), how alerts display on the dashboard and who receives them, and the critical importance of setting renewal alerts on evergreen contracts
- **Version control** (15 min): Document versioning on contracts — original, amendment v1, amendment v2 — upload with change summary, archive of previous versions, re-approval requirement for amendments
- **Obligation tracking** (20 min): Creating obligation records linked to the contract, assigning owners, setting due dates, tracking delivery, and what obligations look like at the contract expiry dashboard
- **Termination process** (15 min): Initiating termination, reason selection, effective date, termination notice upload, automated email to counterparty contact, and tracking post-termination obligations

**Transition cue**: "After lunch, we'll move to the third pillar of this module — the people and organisations you spend money with. Supplier management, qualification status, and supply chain risk assessment."

---

### 12:15–13:00 | Lunch (45 min)

---

### 13:00–14:15 | Content Block 3 — Supplier Management (75 min)

**Session aim**: Participants can build and maintain the supplier register, conduct scorecard evaluations, manage qualification status, assess supply chain risk, and generate the preferred supplier list

**Topics covered** (see `MODULE-SUPPLIER-MANAGEMENT.md` for full content):

- **Supplier register** (15 min): Reference format `SUP-{YEAR}-{NNN}`, mandatory fields, category options, qualification status values, and initial setup considerations for migrating from an existing supplier list
- **Scorecard evaluation** (25 min): Six weighted criteria, 1–5 scoring, weighted score calculation, how overall rating maps to qualification status, worked example with a borderline score, and the common mistake of completing only partial evaluations
- **Qualification status management** (15 min): Status values, the approval gate on downgrading status, audit trail for all status changes, and how qualification status links to the Approved Supplier List in procurement workflows
- **Supply chain risk** (10 min): Risk indicators (financial, geopolitical, single-source, compliance), risk level assignment, and how high-risk suppliers surface on the procurement dashboard
- **Preferred supplier list** (10 min): Generating the report, filter options, export format, and the annual review cycle

---

### 14:15–14:30 | Break (15 min)

---

### 14:30–15:45 | Lab — Hands-On Scenario Walkthrough (75 min)

**Session aim**: Participants complete a full supplier onboarding → contract creation → PO/invoice workflow → dashboard review scenario in the sandbox

**Lab file**: See `LAB-DAY-D.md` for full scenario, steps, expected outcomes, and debrief questions

**Facilitator actions**:
- Introduce the Thornton Capital Group scenario (TechBridge Solutions Ltd onboarding, DataSystems plc renewal alert) — 5 min
- Steps 1–2: Walk through together on facilitator screen (supplier record and scorecard) — 10 min
- Steps 3–6: Participants work independently — facilitator circulates — 45 min
- Extension task: Budget entry and actuals recording — 10 min
- Group debrief: 3 debrief questions — 5 min

---

### 15:45–16:30 | KPI Dashboards — Budget Utilisation, AP Ageing & Contract Expiry Pipeline (45 min)

**Session aim**: Participants can interpret and configure the Finance and Contracts KPI dashboards and understand what each metric tells senior management

**Activities**:
- Demonstration: Budget utilisation dashboard — what the widgets show, how to drill down by cost centre, how to configure amber/red thresholds (15 min)
- Demonstration: AP ageing report — four ageing brackets (0–30, 31–60, 61–90, 90+ days), what a healthy profile looks like vs a profile indicating payment process problems (15 min)
- Demonstration: Contract expiry pipeline — next 30 / 60 / 90 days, filtering by counterparty and contract type, exporting for board reporting (10 min)
- Participants replicate all three dashboard views in their sandbox — confirm they can navigate unaided (5 min)

---

### 16:30–17:00 | Assessment + Certificate Ceremony (30 min)

**Assessment**: 20 MCQ, 30 minutes, ≥ 75% pass (see `ASSESSMENT-DAY-D.md`)

- Participants open the web portal assessment at `/module-owner/finance-contracts/assessment`
- Timer starts immediately on entry
- Facilitator is available for technical issues only — no content assistance during assessment
- Results displayed immediately on submission

**Certificate ceremony** (after all submissions):
- Announce pass results (do not announce fail results publicly)
- Present "Nexara Certified Module Owner — Finance & Contracts" certificates
- Issue CPD confirmation slips (7 hours) — accepted by CIMA and ICAEW for CPD recording
- Brief participants who did not pass privately; confirm retake process

**Close**: Thank participants, confirm evaluation form submission, remind about post-training sandbox access (14 days). Invite participants to share the contract expiry challenge — consider offering a complimentary contract audit session for organisations with large unmanaged contract estates.

---

## Materials Checklist

| Item | Quantity | Notes |
|------|----------|-------|
| Participant handbook sections (D) | 1 per participant + 2 spare | Print or share digitally |
| Quick-reference card (D) | 1 per participant | Laminate if on-site delivery |
| Lab scenario brief (DAY-D) | 1 per participant | Printed for on-site; shared screen for virtual |
| Assessment (printed backup) | 5 copies | Use if web portal fails |
| Answer key (facilitator only) | 1 (facilitator) | Never distribute to participants |
| Certificates (blank) | Participant count + 5 spare | Print A4 landscape; sign before session |
| CPD slips | Participant count + 5 spare | Pre-filled with 7 CPD hours, Day D title |
| Evaluation forms | Participant count + 5 spare | Paper or QR code link |
