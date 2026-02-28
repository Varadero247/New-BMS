# Day D Facilitation Guide — Finance & Contracts

## Facilitator Reference: CONFIDENTIAL

---

## Pre-Session Setup (08:00–08:30)

### Room & Technology
- Open Nexara sandbox: log in as facilitator, navigate to Finance module — confirm PO, Invoice, Budget, and Contracts sections all load
- Verify participant sandbox accounts in `training@nexara.io` credentials sheet — each participant needs Finance and Contracts module access
- Whiteboard or flip chart ready for PO/Invoice 3-way match diagram (draw it in advance — see Block 1 script)
- Projector confirmed: open participant handbook to Day D welcome page
- Printed lab sheets (LAB-DAY-D.md) stacked at the front — do NOT distribute until 14:30

### Facilitator Mindset
Finance and Contracts participants are typically detail-oriented and risk-sensitive. Expect more questions about audit trails, approval escalations, and data integrity than any other group. Prepare by reviewing the financial record reference number format (`FIN-{TYPE}-{YEAR}-{NNN}`) and the 3-way match workflow until you can explain both without notes. This group is the most likely to push back with "our ERP does this differently" — acknowledge the question and redirect to Nexara's approach.

---

## 08:30–09:00 — Welcome & Introductions

**Script:**
> "Good morning, everyone. Welcome to Day D of the Module Owner Training programme. Today is Finance and Contracts — the day we cover financial workflows, contract lifecycle management, and supplier evaluation. By 17:00 you will be certified to own and operate these modules independently in your organisation.

> Before we start, quick introductions — your name, your organisation, and one thing you are hoping to be able to do after today that you cannot do confidently right now."

**Facilitation note:** Write the responses on the flip chart. Use them throughout the day to personalise examples — if someone says "I struggle with the approval routing", pick that up in Block 1.

**Objectives for the day:**
1. Configure and operate financial record workflows from PO to payment
2. Manage contract lifecycle from Draft through to Termination
3. Evaluate and score suppliers using the weighted scorecard
4. Run financial KPI dashboards and export audit-ready reports

---

## 09:00–10:30 — Block 1: Financial Workflows (90 min)

### Opening (5 min)
> "Block 1 covers the financial engine of Nexara: how financial records are structured, how the PO-to-payment process works, and how to manage budgets and multi-currency transactions. We will spend about 45 minutes on content and 45 minutes on a live walkthrough."

### Key Teaching Points

**Reference number format (10 min)**
Write on whiteboard: `FIN-{TYPE}-{YEAR}-{NNN}`

Examples to show on screen:
- `FIN-PO-2026-001` — Purchase Order
- `FIN-INV-2026-047` — Invoice
- `FIN-PAY-2026-012` — Payment

> "The reference number is your audit anchor. Every financial record can be traced to a specific type, year, and sequential number. This matters when a regulator or auditor asks you to produce all invoices for Q1 2026 — the reference number makes that filter instant."

**3-Way Match (20 min)**
Draw on whiteboard:
```
[PURCHASE ORDER] ←→ [GOODS RECEIPT NOTE] ←→ [INVOICE]
  PO-2026-001           GRN-2026-001          INV-2026-001
  Qty: 100 units        Qty: 100 units         Qty: 100 units
  Price: £10.00/unit    — confirmed —          Price: £10.00/unit
                                               ↓
                                         [APPROVE FOR PAYMENT]
```

> "The 3-way match is Nexara's core financial control. Before an invoice can be approved for payment, the system automatically checks: Does it match a valid PO? Has the goods or service been confirmed received? Do the quantities and unit prices agree? If any of the three legs don't match, the invoice is flagged and cannot proceed. This prevents duplicate payments, overpayments, and invoice fraud."

**Common question:** "What if we partially received goods — how does that work?"
> "Good question. Nexara supports partial matching. If 60 of 100 ordered units arrived, the GRN records 60. The invoice can be partially approved for 60 units; the remaining 40 stay on the PO awaiting the second delivery."

**Budget vs Actual (15 min)**
Live demo in sandbox:
- Navigate to Finance → Budget Management
- Show budget period structure (monthly, quarterly, annual)
- Show variance analysis — amber at 80% of budget consumed, red at 100%
- Show drill-down from department summary to individual PO/invoice detail

> "The budget dashboard is your early warning system. Amber means you have used 80% of your budget — you still have room, but you need to be aware. Red means you have reached 100% and any new spend requires an escalation approval. The threshold percentages are configurable by your administrator."

**Multi-currency (10 min)**
> "For organisations operating in multiple currencies, Nexara records the transaction in the native currency and converts to your base currency using the exchange rate at the time of the transaction. The FX variance — the difference if the rate has moved — is tracked separately in the FX Variance report. This is important for month-end close."

### Transition
> "That's Block 1 content. Five-minute comfort break, then we go into Contracts at 10:45."

---

## 10:30–10:45 — Break

---

## 10:45–12:15 — Block 2: Contract Lifecycle & Supplier Management (90 min)

### Opening
> "Block 2 has two parts. The first 50 minutes cover contract lifecycle management — how contracts move from Draft through to Termination and what you do at each stage. The second 40 minutes cover supplier evaluation — how you score suppliers and manage your qualified supplier register."

### Contract Lifecycle (50 min)

**Status workflow — write on whiteboard:**
```
DRAFT → UNDER_REVIEW → APPROVED → ACTIVE → EXPIRING_SOON → EXPIRED → TERMINATED
```

Key transitions to emphasise:
- **DRAFT → UNDER_REVIEW:** Legal or contract manager submits for review — triggers the approval workflow
- **APPROVED → ACTIVE:** Once approved and the effective date is reached, system automatically transitions to ACTIVE
- **ACTIVE → EXPIRING_SOON:** System flags contracts 90, 60, and 30 days before expiry — this is the renewal pipeline
- **EXPIRED vs TERMINATED:** Expired = reached end date without renewal; Terminated = ended early. Both are closed states, but Terminated requires a termination reason and approval.

> "The most common mistake I see is organisations only discovering a contract has expired after the fact — because no one was watching the pipeline. Nexara's 90/60/30-day alerts prevent this. But someone needs to own the renewal pipeline — that is you, as the module owner."

Live demo:
- Navigate to Contracts → Contracts Register
- Show EXPIRING_SOON filter
- Open a sample contract — point out the milestone timeline, obligation list, and amendment history
- Show version control: "Every amendment creates a new version. Version 1 is the original; Version 2 is the first amendment. The full history is always available."

**Obligation tracking (10 min)**
> "Within each contract, you can record the obligations — things you or your counterparty are required to do. For example: the supplier must provide monthly reports by the 5th of each month. Obligations have a status: PENDING, IN_PROGRESS, MET, BREACHED. A BREACHED obligation triggers an alert and may require formal notice."

### Supplier Evaluation (40 min)

**Scorecard structure:**
Write the 6 weighted criteria on the whiteboard (confirm these match current sandbox config):
1. Quality compliance (25%)
2. Delivery performance (20%)
3. Financial stability (15%)
4. Responsiveness (15%)
5. Environmental/sustainability (15%)
6. Innovation (10%)

> "The total weighting must equal 100%. Each criterion is scored 1–5. The weighted score determines the supplier's rating: HIGH (4.0+), MEDIUM (2.5–3.9), LOW (<2.5). Suppliers rated LOW automatically appear in the watch list and may require re-evaluation before new orders are placed."

Live demo:
- Navigate to Suppliers → Supplier Register
- Show qualification status: QUALIFIED, CONDITIONAL, DISQUALIFIED
- Open a supplier record — show scorecard history, trend line
- Show supply chain risk classifications (LOW to CRITICAL): "This is separate from the scorecard — it reflects strategic risk, not performance quality. A sole-source supplier might score HIGH on performance but be CRITICAL risk because you have no alternative."

### Transition
> "Lunch at 12:15. Back at 13:00 for Block 3 — KPIs, dashboards, and ISO reporting."

---

## 12:15–13:00 — Lunch

---

## 13:00–14:15 — Block 3: KPIs, Dashboards & ISO Reporting (75 min)

### Opening
> "Block 3 is the reporting and governance layer. We will cover the financial and contracts KPI dashboard, report configuration, and how to generate an audit-ready evidence pack for your certification body or internal audit team."

### KPI Dashboard walkthrough (30 min)

Navigate to Finance → Dashboard. Key KPIs to demonstrate:

| KPI | What it shows | Amber trigger | Red trigger |
|-----|--------------|---------------|-------------|
| PO Approval Cycle Time | Avg days from PO creation to approval | > 5 days | > 10 days |
| Invoice Match Rate | % invoices passing 3-way match first time | < 90% | < 80% |
| Contract Renewal Rate | % contracts renewed before expiry | < 80% | < 70% |
| Supplier On-Time Delivery | % delivery orders on time | < 90% | < 85% |
| Budget Variance | Actual vs budget across cost centres | > ±10% | > ±20% |

> "These KPIs are pre-configured. What you can customise is the threshold values and the reporting period. Click the gear icon on any KPI card to change the amber/red threshold."

**Report configuration (20 min)**
> "The Scheduled Report feature lets you set up automatic distribution. For example: send the Finance Director a PDF of the Budget Variance report every Monday morning at 07:30. Let me configure that live."

Demo: Finance → Reports → Schedule Report → select template → set frequency → add recipients → save.

> "Recipients receive a PDF attachment. They do not need a Nexara login to read the report."

**ISO evidence pack (25 min)**
> "The ISO evidence pack is one of the most practical features for module owners. Nexara can compile a package of records that maps to the specific ISO clauses relevant to Finance and Contracts. For most organisations, this is ISO 9001 Clause 8 (Operations) and Clause 8.4 (External Providers)."

Demo: Finance → ISO Reports → Generate Evidence Pack
- Show clause selection dialog
- Show what records are included: POs, invoices, supplier evaluations, contract registers
- Download sample PDF

> "Hand this to your certification body or internal auditor and they have everything they need. No more manual evidence gathering."

---

## 14:15–14:30 — Break

---

## 14:30–15:45 — Hands-On Lab (75 min)

Distribute printed lab sheets (LAB-DAY-D.md).

**Introduce the scenario:**
> "Your organisation today is Thornton Capital Group. You have a new IT infrastructure supplier — TechBridge Solutions — that you need to onboard. You will evaluate them using the scorecard, create a £1.35 million contract, configure the milestone alerts, and then check the expiry pipeline for DataSystems Ltd. Let me read through the scenario with you before you start."

Read the lab scenario aloud. Answer clarifying questions.

> "You have 75 minutes. Work independently. I will circulate. If you are stuck, raise your hand. The most common sticking point in this lab is the scorecard weighting — make sure the weights add up to 100% before you try to save."

**Circulate every 10–15 minutes.** Common issues to watch for:
- Participants scoring the supplier before completing all 6 criteria (system blocks save)
- Contract effective date set in the past — confirm the date is today or future
- Milestone alert email recipients — requires at least one valid email address
- DataSystems search — confirm they are searching by supplier name, not reference number

At 15:35: "You have 10 minutes left. If you have not reached Step 5 (milestone alerts), skip to Step 6 (DataSystems pipeline check) — that is the most important part for the assessment."

---

## 15:45–16:30 — KPI Dashboards & Report Configuration (45 min)

**Group review of lab:**
> "Let us compare results. Who got a weighted score above 4.0 for TechBridge? Anyone score them below 3.5?"

Discuss scoring decisions — there is no single right answer. The point is understanding the weighting logic.

**Report configuration exercise (15 min):**
> "Now let us configure a scheduled report together. You are going to set up the Supplier Performance Summary to be delivered every Friday at 08:00 to your email address. Navigate to Suppliers → Reports → Schedule."

Walk through together as a group.

**Extension task discussion:**
> "The extension task asked you to document what would happen to the DataSystems contract if it expired without renewal. What did you find?"

Expected answer: Status transitions to EXPIRED; all milestone alerts stop; existing obligations remain visible but flagged. A new contract or amendment must be created to reinstate the relationship.

---

## 16:30–17:00 — Assessment & Certificate Ceremony (30 min)

> "That brings us to the assessment. 20 questions, 30 minutes, 75% pass. The assessment is available at `/module-owner/finance-contracts/assessment` in the training portal. You have exactly 30 minutes from when you click Begin. Timer starts immediately."

**Allow 25 minutes for assessment.** At 16:55:
> "Two minutes remaining — if you have any unanswered questions, make your best selection now."

**Results (post-assessment):**

For passers:
> "Congratulations — you are now a Nexara Certified Module Owner for Finance and Contracts. Your certificate will be emailed within 24 hours and added to your CPD record. The knowledge you have today puts you in a position to configure, operate, and audit the Finance and Contracts modules independently."

For those who did not pass (handle privately):
> "Thank you for today. The assessment can be retaken at the next scheduled cohort — I will send you the dates. In the meantime, the answer key will be shared with your Nexara contact once the cohort closes, and I recommend focusing on the contract lifecycle statuses and the 3-way match workflow before your retake."

---

## Q&A Reference Table

| Common question | Recommended answer |
|----------------|-------------------|
| Can we import supplier data from our existing ERP? | Yes — via the Supplier Import template (CSV). Contact training@nexara.io for the template spec. |
| Who can approve contracts above a certain value? | Approval thresholds are configurable by your Nexara administrator in the Approval Matrix settings. |
| What happens to a contract if the responsible person leaves? | Ownership can be transferred in the contract record. The system retains the full history under both the old and new owner. |
| Can we link a contract to a specific project or cost centre? | Yes — the Contract record has a Cost Centre field and a Project Reference field (optional). |
| Is the supplier scorecard visible to the supplier? | No — the scorecard is internal only. Suppliers cannot access the Nexara portal unless your administrator explicitly grants them Supplier Portal access. |
| How often should we re-evaluate suppliers? | Nexara best practice: annually for all qualified suppliers, and after any significant quality event. |
| What is the difference between a framework agreement and a standard contract? | In Nexara, use Contract Type = "Framework" for multi-call-off arrangements. This enables child call-off contracts to be linked to the parent framework. |

---

## Facilitation Troubleshooting

**"The scorecard won't save"**
Check: all 6 criteria must have a score (1–5) before saving. If any criterion shows "—", it has not been scored.

**"I can't find TechBridge in the sandbox"**
They need to create TechBridge first (Step 1 of the lab). If the supplier already exists from a previous participant, have them search for it and use the existing record.

**"The contract date is throwing an error"**
The contract effective date must be today or in the future. If they set it to a past date, the system blocks the ACTIVE transition.

**Late finisher on lab → assessment at risk:**
If a participant is significantly behind at 15:45, allow them to skip Steps 4–5 of the lab (milestone configuration) and proceed to the assessment. The lab is practice; the assessment is the exit criteria.

**Assessment technical failure:**
If the portal assessment fails, use the printed fallback paper (ASSESSMENT-DAY-D.md) — mark manually. Contact training@nexara.io to reopen the digital assessment within 24 hours.
