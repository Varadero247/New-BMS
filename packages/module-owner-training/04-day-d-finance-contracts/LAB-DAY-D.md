# Lab Exercise — Day D: Finance & Contracts

**Duration**: 75 minutes (14:30–15:45)
**Sandbox environment**: Pre-loaded with Thornton Capital Group sample data
**Your role**: Finance Manager
**Prerequisite**: Completed Content Blocks 1, 2, and 3

---

## Scenario Background

**Organisation**: Thornton Capital Group — a mid-market financial services advisory firm
**Your role**: Finance Manager

Thornton Capital Group is onboarding a new IT services supplier, TechBridge Solutions Ltd, to deliver a 3-year managed services contract covering infrastructure management, service desk, and cloud migration. The contract value is £450,000 per year (£1,350,000 total) and will commence today.

Simultaneously, the procurement team has identified that an existing software licence agreement with DataSystems plc (reference CTR-2025-018 in your sandbox) expires in 89 days. The renewal alert should have fired 1 day ago (the default is 90 days before expiry). The decision to renew or replace needs to be made urgently.

You have 75 minutes to complete the following steps. Work through them in order. Steps 1 and 2 will be demonstrated on the facilitator screen before you work independently.

---

## Step 1: Create the Supplier Record for TechBridge Solutions Ltd

1. Navigate to **Suppliers → New Supplier**
2. Complete the record with the following details:
   - `supplierName`: TechBridge Solutions Ltd
   - `category`: **SERVICES**
   - `country`: GB (United Kingdom)
   - `contactName`: Marcus Webb (Account Director)
   - `contactEmail`: m.webb@techbridge-solutions.co.uk
   - `qualificationStatus`: **UNDER_REVIEW**
3. Under the optional fields, add:
   - `accreditations`: "ISO 27001:2022 certified — certificate expires Dec 2026"
   - `annualSpend`: 450000
4. Save the record — note the auto-generated reference (e.g. `SUP-2026-011`)

**Expected outcome**: Supplier record created with status UNDER_REVIEW.

---

## Step 2: Conduct a Scorecard Evaluation for TechBridge Solutions Ltd

1. Open the TechBridge Solutions Ltd supplier record
2. Navigate to **Evaluations → New Evaluation**
3. Enter the following scores (based on pre-qualification information provided by TechBridge):

   | Criterion | Score | Notes for your evaluation record |
   |-----------|-------|----------------------------------|
   | Quality of goods / services | 4 | Strong references from two comparable clients; ISO 27001 certification confirmed |
   | Delivery performance | 4 | Committed SLA of 99.5% uptime; two reference sites confirm consistent delivery |
   | Commercial terms | 3 | Price is market rate; payment terms 30 days net; limited flexibility on termination for convenience clause |
   | Financial stability | 4 | Published accounts show 3 years of profitable trading; Dun & Bradstreet credit score: Low Risk |
   | HSE performance | 3 | No recorded HSE incidents; no formal ISO 45001 certification; basic H&S policy reviewed |
   | Sustainability / ESG | 3 | Carbon neutrality pledge by 2030; no ISO 14001 certification yet; Modern Slavery Act statement published |

4. Add an `evaluationNotes` entry: "Pre-qualification evaluation based on submitted tender documentation, reference site calls, and Companies House review. Full on-site evaluation to be scheduled at 6 months."
5. Save the evaluation

6. **Verify the weighted score**: The system should calculate the weighted score automatically. Verify it equals **3.60** (calculation: (4×0.25) + (4×0.20) + (3×0.15) + (4×0.15) + (3×0.15) + (3×0.10) = 1.00 + 0.80 + 0.45 + 0.60 + 0.45 + 0.30 = 3.60).

7. Change qualification status to **APPROVED** with justification: "Pre-qualification scorecard 3.60 — meets APPROVED threshold. Full performance evaluation at 6 months. Financial Stability rated 4 (Low Risk). Commercial terms 3 — legal review of termination clause in progress."

**Expected outcome**: Scorecard evaluation saved; TechBridge status changed to APPROVED; audit trail records the change.

---

## Step 3: Create the Contract Record

1. Navigate to **Contracts → New Contract**
2. Complete the mandatory fields:
   - `contractTitle`: Managed IT Services Agreement — TechBridge Solutions Ltd
   - `counterparty`: TechBridge Solutions Ltd (select from supplier lookup)
   - `contractType`: **SERVICE**
   - `startDate`: Today's date
   - `endDate`: 3 years from today's date
   - `totalValue`: 1350000
   - `currency`: GBP
   - `contractOwner`: Your sandbox user account (Finance Manager)
   - `legalReviewer`: Legal Director (sandbox user)
3. Complete optional fields:
   - `governingLaw`: England & Wales
   - `noticePeriod`: 90 days
   - `autoRenewal`: false
4. Under the Documents tab, upload the placeholder file `techbridge_managed_services_agreement.pdf` — the system saves this as **v1 — Original**
5. Set the renewal alert: Navigate to **Milestones → Renewal Alert → Edit** → set `alertLeadTime` to 90 days
6. Save the contract — note the reference (e.g. `CTR-2026-014`)
7. Change the status to **Active** (confirming the contract is signed and in force)

**Expected outcome**: Contract record created with status Active, renewal alert set for 90 days before end date.

---

## Step 4: Add Contract Milestones

With the contract record open, navigate to the **Milestones** tab and add the following three milestones:

**Milestone 1 — Annual Service Review Year 1**
- `milestoneTitle`: Annual service review — Year 1
- `milestoneDate`: 12 months from today
- `milestoneOwner`: Your sandbox user account
- `alertLeadTime`: 14 days
- `description`: "Annual performance review against SLA targets. Scorecard evaluation to be updated. Review commercial terms for Year 2."

**Milestone 2 — Annual Service Review Year 2**
- `milestoneTitle`: Annual service review — Year 2
- `milestoneDate`: 24 months from today
- `milestoneOwner`: Your sandbox user account
- `alertLeadTime`: 14 days
- `description`: "Annual performance review Year 2. Assess renewal intention. Initiate retendering if required for Year 4 onwards."

**Milestone 3 — Mid-Contract Audit Right**
- `milestoneTitle`: Mid-contract audit right — 18 months
- `milestoneDate`: 18 months from today
- `milestoneOwner`: Legal Director (sandbox user)
- `alertLeadTime`: 30 days
- `description`: "Contract clause 12.4 grants Thornton Capital Group right to audit TechBridge's service delivery processes at 18 months. Legal to coordinate audit scope with IT Director."

Save each milestone. Verify all three appear in the Milestones tab with correct dates and alert lead times.

**Expected outcome**: Three milestones visible on the contract record, each with alert dates calculated correctly.

---

## Step 5: Create a Purchase Order for the First Quarterly Payment

1. Navigate to **Finance → Purchase Orders → New PO**
2. Complete the PO:
   - Link to supplier: TechBridge Solutions Ltd
   - Link to contract: CTR-2026-014 (the contract you just created)
   - Line item: "Managed IT Services — Q1 2026 — per contract CTR-2026-014"
   - Quantity: 1
   - Unit price: 112,500.00 (GBP) — one quarter of £450,000/year
   - VAT rate: 20% (UK standard rate)
   - VAT amount: 22,500.00
   - Total including VAT: 135,000.00
   - `costCentre`: IT Services
   - `accountCode`: IT Managed Services (select from chart of accounts)
   - `approvalRoute`: Single approver — CFO (sandbox user)
   - `description`: "Q1 managed IT services payment — TechBridge Solutions Ltd — Jan–Mar 2026 — against contract CTR-2026-014"
3. Upload placeholder file `techbridge_po_q1_2026.pdf`
4. Submit for approval — status changes to **Pending Approval**
5. Log in as the CFO sandbox user and approve the PO — status changes to **Approved**

**Expected outcome**: PO created and approved; PO status = Approved; approval recorded in audit trail.

---

## Step 6: Review the Contract Expiry Pipeline Dashboard

1. Navigate to **Contracts → Dashboard → Contract Expiry Pipeline**
2. Set the filter to: expiring within **90 days**
3. Locate the DataSystems plc contract (CTR-2025-018) — verify it appears in the pipeline with approximately 89 days to expiry and status **Expiring**
4. Click through to the DataSystems plc contract record — check: (a) what renewal alert was set, and (b) who the `contractOwner` is. Note both values.
5. Return to the expiry pipeline — generate the **Contract Expiry Pipeline Report** for the next 90 days: Contracts → Reports → Contract Expiry Pipeline → date range: today to 90 days from today → format: PDF → Generate

**Expected outcome**: Contract expiry pipeline report generated; DataSystems plc contract appears with 89 days to expiry; TechBridge renewal alert date is approximately 3 years from today.

---

## Step 7: Generate the Preferred Supplier List

1. Navigate to **Suppliers → Reports → Preferred Supplier List**
2. Apply filters:
   - `qualificationStatus`: APPROVED and PREFERRED (both checked)
   - `category`: SERVICES
3. Verify that TechBridge Solutions Ltd appears with status APPROVED and a weighted score of 3.60
4. Generate the report in PDF format
5. Verify the report header shows today's date, the filters applied, and your user name

**Expected outcome**: Preferred supplier list PDF generated; TechBridge Solutions Ltd appears correctly.

---

## Extension Task (for early finishers)

**Budget entry and actuals recording**

1. Navigate to **Finance → Budgets → New Budget**
2. Create a budget record:
   - `budgetName`: TechBridge Managed IT Services — FY2026
   - `costCentre`: IT Services
   - `accountCode`: IT Managed Services
   - `budgetAmount`: 450,000.00 (GBP)
   - `period`: Today to 12 months from today
   - `budgetOwner`: Your sandbox user account
3. Save the budget record — note the reference (e.g. `FIN-BUD-2026-003`)
4. Navigate back to the approved PO (Step 5) — verify that the Q1 payment of £112,500 has been automatically reflected in the budget actuals (after PO approval, actuals should show £112,500 against a £450,000 budget — 25% utilisation)
5. Check the budget dashboard: Finance → Dashboard — confirm the TechBridge budget appears with a utilisation percentage and green status (well within amber threshold)

---

## Debrief Questions (group discussion — 5 min)

1. **Scorecard risk**: TechBridge's scorecard shows Financial Stability rated 4 (Low Risk) and Commercial terms rated 3. The overall weighted score is 3.60 — solidly in the APPROVED range. However, the qualification justification notes that legal review of the termination-for-convenience clause is ongoing. If Thornton Capital Group needed to exit this contract early (say, at 18 months) and the termination clause turned out to be unfavourable, what contract management actions in Nexara would give you the best evidence position? What obligation record would you create now to track the legal review outcome?

2. **DataSystems renewal alert gap**: The DataSystems plc renewal alert fired 89 days before expiry — but the contract has only 89 days remaining, suggesting someone missed the alert entirely. If the procurement manager was on extended leave when the alert fired, what features in Nexara would you use to ensure this cannot happen again? (Consider: notification subscribers, delegation settings, and escalation rules.)

3. **Anti-corruption under ISO 37001**: The Nexara workflow for supplier qualification and contract approval creates an audit trail of every decision. Under ISO 37001 (Anti-Bribery Management Systems), which specific steps in today's lab exercise — supplier evaluation, qualification status change, PO approval — constitute anti-corruption controls? What additional fields or workflow steps would you recommend adding to strengthen the anti-bribery evidence value of this workflow?
