# Lab Exercise — Day A: Quality & Non-Conformance

**Duration**: 75 minutes (14:30–15:45)
**Sandbox environment**: Pre-loaded with Greenfield Manufacturing sample data
**Prerequisite**: Completed Content Blocks 1, 2, and 3

---

## Scenario Background

**Organisation**: Greenfield Manufacturing Ltd — a Tier 1 automotive component supplier
**Your role**: Quality Manager
**Date**: Today (use today's date throughout the exercise)

Greenfield Manufacturing has just received a customer complaint from one of its major clients, Aston Precision Components Ltd (APC). APC's incoming inspection rejected a consignment of 200 steel mounting brackets (Part No. GM-BRKT-4471, Batch 2026-089) because 37 of the brackets failed dimensional tolerances on the inner bore diameter. The specified inner bore is 25.00mm ±0.05mm; the rejected brackets measured 24.82mm–24.89mm — a consistent undersize condition.

A preliminary review suggests the issue may be related to a tooling wear problem on CNC Machine #3, which was last calibrated 8 months ago (calibration interval: 6 months).

**Business impact**: APC has halted the production line that uses this bracket. They have requested an 8D corrective action report within 5 business days.

---

## Step 1: Raise the Non-Conformance

1. Navigate to **Quality → Non-Conformances → Raise NC**
2. Complete the NC record with the following information:
   - `title`: "Dimensional NC — Inner bore undersize — Batch 2026-089 — GM-BRKT-4471"
   - `category`: **Product**
   - `severity`: **Major** (customer line stopped; potential delivery impact)
   - `source`: **Customer Complaint**
   - `detectionPoint`: **Customer** (detected by APC incoming inspection)
   - `responsibleOwner`: Your sandbox user account
   - `dueDate`: 30 days from today
   - `affectedBatch`: "2026-089"
   - `quantity`: 37
   - `description`: "APC incoming inspection rejected 37 of 200 GM-BRKT-4471 brackets (Batch 2026-089). Inner bore diameter measured 24.82mm–24.89mm against specified 25.00mm ±0.05mm. APC production line halted. 8D report requested within 5 business days."
   - `containmentAction`: "All Batch 2026-089 stock at Greenfield quarantined — moved to red-tag area ref QA-Q-001. APC stock under hold pending rework assessment. Production on CNC #3 suspended."
3. Save the NC record — note the auto-generated reference number (e.g. `QMS-NC-2026-001`)

**Expected outcome**: NC record created with status **Open**, reference number assigned.

---

## Step 2: Upload Supporting Evidence

1. Open the NC record you just created
2. Navigate to the **Evidence** tab
3. Upload the following (use the placeholder files provided in the sandbox — named `customer_complaint_email.pdf`, `inspection_report_APC.pdf`, `cnc3_calibration_history.xlsx`)
4. For each file, add a brief description:
   - `customer_complaint_email.pdf` → "APC complaint email — received today"
   - `inspection_report_APC.pdf` → "APC incoming inspection rejection report"
   - `cnc3_calibration_history.xlsx` → "CNC Machine #3 calibration history — last 12 months"
5. Save the evidence entries

**Expected outcome**: Three evidence attachments visible on the Evidence tab.

---

## Step 3: Complete the Investigation

1. On the NC record → **Investigation** tab
2. Add yourself as the Investigation Lead
3. Record the following contributing factors (add each as a separate factor entry):
   - "CNC Machine #3 calibration overdue by 2 months — last calibrated 8 months ago against 6-month interval"
   - "No system alert configured for calibration due dates — no automated reminder sent"
   - "In-process inspection did not detect the dimensional deviation — inspection frequency may be insufficient for bore measurement"
4. Select **Root Cause Category**: Equipment failure
5. Write the Root Cause Statement: "CNC Machine #3 cutting tool wear exceeded acceptable limits due to overdue calibration and absence of preventive maintenance alert. The in-process inspection frequency was insufficient to detect the gradual dimensional drift before batch completion."
6. Mark investigation as **Complete**

**Expected outcome**: Investigation tab shows Complete status; root cause documented.

---

## Step 4: Create a CAPA from the NC

1. On the NC record → **Actions → Create CAPA**
2. Verify the pre-populated fields (NC reference, title, root cause)
3. Set:
   - `capaType`: **Corrective**
   - `effectivenessReviewDate`: 60 days from today
4. Add the following corrective actions (each as a separate action entry):

   | Action | Owner | Due Date |
   |--------|-------|----------|
   | Immediately recalibrate CNC Machine #3 and all other CNC machines overdue calibration | Engineering Supervisor (sandbox user) | 3 days from today |
   | Implement automated calibration due-date alerts in the CMMS module for all production equipment | Maintenance Manager (sandbox user) | 14 days from today |
   | Revise in-process inspection procedure to include bore diameter measurement at 50-piece intervals for critical dimensions | Quality Engineer (sandbox user) | 21 days from today |
   | Conduct rework assessment on Batch 2026-089 — rework or scrap the 37 rejected brackets and arrange replacement shipment to APC | Production Manager (sandbox user) | 5 days from today |
   | Complete 8D report and submit to APC Quality contact | Quality Manager (your account) | 5 days from today |

5. Save the CAPA record — note the auto-generated CAPA reference (e.g. `QMS-CAPA-2026-001`)

**Expected outcome**: CAPA created with **Open** status, linked to the NC record.

---

## Step 5: Progress the CAPA Status

Simulate the passage of time:

1. Open the CAPA record
2. Mark the action "Complete 8D report" as **Done** (enter today's date as completion date; upload placeholder file `8d_report_APC.pdf`)
3. Mark the action "Recalibrate CNC machines" as **Done** (upload placeholder `cnc_recalibration_certs.pdf`)
4. Change the CAPA overall status to **In Progress**

**Expected outcome**: CAPA shows 2 of 5 actions complete; status = In Progress.

---

## Step 6: Review the Quality Dashboard

1. Navigate to **Quality → Dashboard**
2. Locate the following KPIs and note their current values in the sandbox:
   - NC Open Rate
   - Closure Within SLA (will be 100% as no closed NCs yet in sandbox)
   - CAPA Effectiveness Rate
   - Repeat NC Rate
3. Check whether the NC you raised appears in the **Open NCs** widget (it should)
4. Look for any **Repeat NC** flags — is your NC flagged as a repeat?

**Expected outcome**: Dashboard updated to reflect your NC. Repeat NC flag should NOT be set (this is the first NC in this category in the sandbox).

---

## Step 7: Generate an ISO Evidence Package

1. Navigate to **Quality → Reports → ISO Evidence Package**
2. Configure the package:
   - **Scope**: Non-Conformances and CAPA
   - **Date Range**: Last 90 days (adjust to include today)
   - **ISO Standard**: ISO 9001:2015
   - **Clauses**: 8.7, 10.2
3. Click **Generate Package**
4. Download the ZIP file and open the PDF index — verify that `QMS-NC-2026-001` and `QMS-CAPA-2026-001` appear in the evidence index

**Expected outcome**: ZIP file downloaded; PDF index contains your NC and CAPA records with ISO clause references.

---

## Extension Task (for early finishers)

Configure a scheduled quality report:
1. Navigate to **Quality → Reports → Scheduled Reports → New**
2. Set up a monthly NC summary report:
   - Data source: Non-Conformances
   - Filters: All categories, all severities, last 30 days rolling
   - Output format: PDF
   - Schedule: First Monday of each month, 08:00 UTC
   - Recipients: Add your sandbox email address
3. Save and verify the scheduled report appears in the Scheduled Reports list

---

## Debrief Questions (group discussion — 5 min)

1. In the scenario, what would have happened if you had categorised the NC as "Process" instead of "Product"? How would this affect the ISO clause mapping in the evidence package?
2. The CAPA includes an action to revise the in-process inspection procedure. Under ISO 9001 clause 7.5, what does this revised procedure need to include to be considered controlled documented information?
3. If the same bore undersize issue recurred on Batch 2026-102 next month, how would the system identify it as a Repeat NC, and what escalation steps would you take?
