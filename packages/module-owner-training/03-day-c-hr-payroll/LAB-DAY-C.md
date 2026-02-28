# Lab Exercise — Day C: HR & Payroll

**Duration**: 75 minutes | **Sandbox**: Meridian Healthcare Services sample data
**Your role**: HR Manager

---

## Scenario Background

**Organisation**: Meridian Healthcare Services — a private hospital group operating 3 sites
**Today**: The start of a new month (use today's date throughout)

Three things are happening simultaneously: (1) A new registered nurse is joining Sycamore Ward today. (2) Last month's payroll period for Nursing staff needs to be finalised and the journal exported for finance. (3) An upcoming CQC inspection requires a training compliance report for all clinical staff.

---

## Step 1: Onboard the New Employee

Create a new employee record for:
- **Name**: Emily Chen
- **Employee ID**: MHS-2026-0412
- **Employment Type**: FULL_TIME
- **Start Date**: Today
- **Department**: Nursing → Sycamore Ward
- **Position**: Registered Nurse (Band 5)
- **Line Manager**: Select sandbox user "Ward Manager, Sycamore"
- **Work Location**: Site 1 — Sycamore Hospital

Complete the starter checklist:
- [x] Right-to-work documents checked (NMC PIN verified)
- [x] Employment contract signed
- [x] Bank details received
- [x] IT access requested
- [ ] Health declaration received — mark as **pending** with note "Following up — Emily to submit by Friday"
- [x] Induction scheduled — date: 3 days from today

Upload placeholder file `emily_chen_contract_signed.pdf` to the employee record Documents tab.

---

## Step 2: Assign Mandatory Training

Emily needs three mandatory training courses assigned:
1. **Fire Safety Awareness** — deadline: 14 days from today
2. **Moving and Handling (Patient)** — deadline: 14 days from today
3. **Information Governance (GDPR for Healthcare)** — deadline: 30 days from today

For each course:
1. Navigate to Training → [Course name] → Assign
2. Search for Emily Chen
3. Set the deadline
4. Save

Verify all three assignments appear on Emily's training record with status **Assigned**.

---

## Step 3: Run the Payroll Period

1. Navigate to **Payroll → Pay Periods → [March 2026 - Nursing Monthly]**
   (If the period is already Open in the sandbox, proceed to Step 3b. If not, create it: New Period → Nursing Monthly → first/last day of previous month → payment date = 28th of month)
2. Add a pay adjustment: Overtime for Sandbox Employee "Sandra O'Brien" → 12 hours → rate 1.5 → reason: "Bank holiday weekend cover — Easter"
3. Add a deduction: Sandbox Employee "Michael Tan" → Salary Advance → £500 → reason: "Advance repayment — instalment 2 of 4"
4. Review the Payroll Variance Report — note the total payroll change vs the prior period
5. Lock the period (Actions → Lock Period) — confirm
6. Export the Journal: Export → Journal → CSV format → download

---

## Step 4: Generate the Training Compliance Report

For the CQC inspection:
1. Navigate to **Training → Reports → Compliance Matrix**
2. Filter by: Department = All Clinical Departments, Course Type = Mandatory and Regulatory
3. Date range: Last 12 months
4. Export as PDF
5. Review the output — identify any staff with red (overdue) status and note their names and the overdue course
6. For the overdue entries: navigate to the assignment record and confirm an escalation notification has been sent (check the notification log)

---

## Step 5: Record Emily's First Absence

One week into her employment, Emily calls in sick. Record:
1. Navigate to HR → Absences → Record Absence
2. Employee: Emily Chen
3. Absence Type: Sick Leave
4. Start Date: 7 days from today (simulated)
5. Expected Return Date: 10 days from today (simulated 3-day absence)
6. Notes: "Self-reported illness. No medical certificate required for absences <5 days per HR policy."
7. Save

---

## Debrief Questions

1. Emily's health declaration is outstanding. Under the starter checklist, what action would Nexara take automatically if this remained uncompleted after 7 days? Where in the system would you monitor this?

2. The payroll audit trail for Michael Tan shows his salary advance deduction was entered by a payroll administrator and approved by yourself. Why is this two-person approval process important from a GDPR and financial controls perspective?

3. A CQC inspector asks: "How do you ensure that all your registered nurses have valid Moving and Handling certificates?" Walk through the exact Nexara report you would generate and what fields the inspector would see.
