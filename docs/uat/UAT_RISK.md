# UAT Test Plan: Enterprise Risk Management Module (ERM)

---
> **CONFIDENTIAL — TRADE SECRET**
> This document is the property of Nexara DMCC and contains confidential and
> proprietary information. Unauthorised disclosure is prohibited.
> © 2026 Nexara DMCC. All rights reserved.
---


**Document ID:** UAT-RISK-001
**Version:** 1.0
**Date:** 2026-02-23
**Module:** Enterprise Risk Management (ERM)
**Environment:** Staging (api-risk:4027 / web-risk:3031)
**Tester:** **\*\*\*\***\_\_\_\_**\*\*\*\***
**Sign-Off Date:** **\*\*\*\***\_\_\_\_**\*\*\*\***

---

## Risk Register (5 scenarios)

### TC-RISK-001: Create Risk with 5x5 Likelihood/Impact Matrix

**Given** I am logged in as a Risk Manager
**When** I navigate to Risk > Risk Register and click "New Risk"
**And** I fill in: Title "Critical supplier single-source dependency — Component X7 bearings", Category "OPERATIONAL", Likelihood 4 (out of 5), Impact 5 (out of 5), Description "Single approved supplier for X7 bearings; no qualified alternative; 12-week lead time", Regulatory Reference "ISO 31000:2018 Clause 6.4"
**Then** the system creates the risk with a unique reference and calculates Inherent Risk Score as 20 (likelihood 4 × impact 5)
**And** the risk status is set to "OPEN" and the record appears in the risk register
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-RISK-002: Assign Risk Owner

**Given** a risk record exists with no owner assigned
**When** I edit the risk and assign Owner "Head of Supply Chain — D. Okafor", Secondary Owner "Procurement Manager — L. Huang", Review Date "2026-06-30"
**Then** the owner and secondary owner are saved on the risk record
**And** the assigned owner receives a notification that they have been designated risk owner
**And** the risk appears in the owner's "My Risks" dashboard view
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-RISK-003: Categorise Risk (Strategic, Operational, Financial, Compliance)

**Given** multiple risks exist without categories or with incorrect categories
**When** I update four risks: Risk A to "STRATEGIC", Risk B to "OPERATIONAL", Risk C to "FINANCIAL", Risk D to "COMPLIANCE"
**Then** each risk record shows its updated category
**And** the Risk Register filter by Category "FINANCIAL" returns only Risk C
**And** the risk heat map groups risks by category in the legend
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-RISK-004: Verify Heat Map Placement

**Given** risks exist with varying likelihood (1–5) and impact (1–5) scores
**When** I navigate to the Risk Heat Map view
**Then** each risk is plotted on the correct cell of the 5×5 grid corresponding to its likelihood (Y-axis) and impact (X-axis)
**And** cells with scores >= 15 are coloured RED, scores 8–14 AMBER, and scores <= 7 GREEN
**And** clicking a risk dot opens the risk detail panel
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-RISK-005: Set Residual Risk After Controls

**Given** a risk "RISK-2026-001" with Inherent Score 20 and two controls applied
**When** I update the Residual Likelihood to 2 and Residual Impact to 3
**Then** the Residual Risk Score is calculated as 6 (2 × 3)
**And** the risk detail page shows both Inherent Score (20) and Residual Score (6) side by side
**And** the heat map updates to show the residual position with a distinct marker (e.g., arrow from inherent to residual)
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Risk Controls (5 scenarios)

### TC-RISK-006: Add Preventive Control to Risk

**Given** a risk "RISK-2026-001" with inherent score 20 and no controls recorded
**When** I click "Add Control" and fill in: Type "PREVENTIVE", Title "Dual-source supplier qualification programme", Description "Qualify secondary supplier for X7 bearings within 6 months", Owner "Procurement Manager", Implementation Date "2026-08-31", Status "PLANNED"
**Then** the control is saved and linked to the risk
**And** the risk detail page shows 1 active control
**And** the control status "PLANNED" is displayed
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-RISK-007: Set Control Effectiveness Rating

**Given** a control "CTRL-2026-001" linked to risk "RISK-2026-001" with status "IN_PLACE"
**When** I update the Effectiveness Rating to "SUBSTANTIAL" (scale: NONE / PARTIAL / MODERATE / SUBSTANTIAL / FULL), enter Basis for Rating "Secondary supplier qualified and first test order received — delivery on time and in spec"
**Then** the control record is updated with effectiveness rating "SUBSTANTIAL"
**And** the risk detail page reflects the effectiveness rating against the control
**And** the residual risk score calculation indicates the level of risk reduction
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-RISK-008: Link Control to Multiple Risks

**Given** a control "CTRL-2026-002" titled "Business Continuity Plan — Supply Chain" exists
**When** I link this control to three risks: "RISK-2026-001", "RISK-2026-004", and "RISK-2026-007"
**Then** all three risks show the control "CTRL-2026-002" in their controls list
**And** the control detail page shows it is linked to 3 risks
**And** removing the link from one risk does not affect the other two
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-RISK-009: Mark Control as Tested

**Given** a control "CTRL-2026-001" with status "IN_PLACE" and no test date recorded
**When** I click "Record Control Test" and enter: Test Date "2026-02-20", Tested By "Internal Audit Team", Test Method "Walkthrough and evidence review", Test Result "EFFECTIVE", Test Notes "Secondary supplier confirmed qualified; dual-source process operational"
**Then** the control record is updated with the test date, result "EFFECTIVE", and tester details
**And** the Next Test Due date is calculated based on the control's test frequency
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-RISK-010: Verify Residual Risk Recalculation

**Given** a risk "RISK-2026-001" with Inherent Score 20 and Residual Score 6 (likelihood 2, impact 3)
**When** I update the control effectiveness from "PARTIAL" to "FULL" and recalculate
**Then** the system prompts me to review the residual likelihood and impact scores
**And** after updating Residual Likelihood to 1 and Residual Impact to 2 the Residual Score recalculates to 2
**And** the heat map moves the risk marker to the LOW zone (score 2)
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Risk Treatments (5 scenarios)

### TC-RISK-011: Create Treatment Plan (ACCEPT, MITIGATE, TRANSFER, AVOID)

**Given** a risk "RISK-2026-003" with inherent score 12 (Likelihood 3, Impact 4) categorised as FINANCIAL
**When** I create a treatment plan: Strategy "MITIGATE", Title "Foreign exchange hedging programme", Description "Enter 6-month forward contracts to hedge EUR/USD exposure on component imports", Rationale "Cost of hedging is less than potential FX loss exposure"
**Then** the treatment plan is saved with reference "TRT-2026-NNN" and status "PLANNED"
**And** the risk record shows the treatment strategy as "MITIGATE"
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-RISK-012: Assign Treatment Owner with Due Date

**Given** a treatment plan "TRT-2026-001" with status "PLANNED" and no owner assigned
**When** I edit the treatment and assign: Owner "CFO — M. Brennan", Due Date "2026-04-30", Budget Allocated "£15,000", Priority "HIGH"
**Then** the owner and due date are saved on the treatment record
**And** the assigned owner receives a notification of the treatment assignment
**And** the treatment appears in the owner's task list with the due date
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-RISK-013: Update Treatment Progress

**Given** a treatment plan "TRT-2026-001" in status "IN_PROGRESS" with 0% completion
**When** I update progress: Completion Percentage 50, Progress Notes "Hedging contracts for Q2 exposure (EUR 500k) executed on 2026-02-15; Q3 contracts pending approval from board"
**Then** the treatment record shows 50% completion with the progress note and update date
**And** the treatment status remains "IN_PROGRESS"
**And** the risk detail page reflects the treatment progress
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-RISK-014: Mark Treatment Complete

**Given** a treatment plan "TRT-2026-001" with completion percentage at 100%
**When** I click "Mark Complete" and enter Completion Notes "Full hedging programme in place for FY2026; reviewed by Board Risk Committee on 2026-04-28"
**Then** the treatment status changes to "COMPLETE" with the completion date recorded
**And** the assigned risk "RISK-2026-003" shows the treatment as completed
**And** the system prompts to review and update the residual risk score following treatment completion
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-RISK-015: Verify Risk Status Changes to TREATED

**Given** a risk "RISK-2026-003" with one treatment plan that has just been marked "COMPLETE"
**When** all treatment plans for the risk are in status "COMPLETE"
**Then** the risk status automatically updates to "TREATED"
**And** the risk register shows the status "TREATED" with the treatment completion date
**And** the risk remains visible in the register and can be reactivated if residual risk exceeds appetite
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Risk Appetite and KRIs (5 scenarios)

### TC-RISK-016: Set Organisational Risk Appetite Thresholds

**Given** I am logged in as Chief Risk Officer with admin permissions
**When** I navigate to Risk > Risk Appetite and configure thresholds for category "OPERATIONAL": GREEN upper boundary Score 6, AMBER lower boundary Score 7, AMBER upper boundary Score 14, RED lower boundary Score 15
**Then** the thresholds are saved for the OPERATIONAL category
**And** the heat map colour bands update to reflect GREEN (1–6), AMBER (7–14), RED (15–25)
**And** all existing operational risks are re-classified against the new boundaries
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-RISK-017: Create KRI with Metric

**Given** I am on the Risk > KRI (Key Risk Indicators) page
**When** I click "New KRI" and fill in: Name "Supplier Delivery On-Time Rate", Linked Risk "RISK-2026-001", Unit "Percentage", Frequency "MONTHLY", GREEN Threshold ">= 95%", AMBER Threshold "85–94%", RED Threshold "< 85%", Data Source "ERP Procurement Module", Owner "Head of Supply Chain"
**Then** the KRI is created with reference "KRI-2026-NNN" and status "ACTIVE"
**And** the KRI is linked to risk "RISK-2026-001" and visible on the risk detail page
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-RISK-018: Update KRI Value

**Given** a KRI "KRI-2026-001" named "Supplier Delivery On-Time Rate" with GREEN threshold >= 95%
**When** I click "Record KRI Reading" and enter: Value 97.2, Period "January 2026", Recorded By "Supply Chain Analyst", Notes "Improvement driven by new PO lead time buffer of +5 days"
**Then** the KRI reading is saved with the value 97.2, period, and recorder details
**And** the KRI status shows "GREEN" as the value is within the GREEN threshold
**And** the KRI trend chart updates to include the January 2026 data point
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-RISK-019: Trigger Amber Alert When Threshold Exceeded

**Given** a KRI "KRI-2026-001" with GREEN threshold >= 95% and AMBER threshold 85–94%
**When** I record a new KRI value of 88.5 for February 2026
**Then** the KRI status changes from "GREEN" to "AMBER"
**And** an alert notification is sent to the KRI Owner and linked Risk Owner
**And** the KRI dashboard displays the AMBER status with the breach highlighted
**And** the linked risk "RISK-2026-001" shows a KRI alert flag on the risk register
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-RISK-020: View KRI Dashboard

**Given** at least 5 KRIs exist with a mix of GREEN, AMBER, and RED statuses and multiple historical readings
**When** I navigate to the KRI Dashboard
**Then** I see all active KRIs displayed with current status RAG (Red/Amber/Green) indicators
**And** I see a sparkline or trend chart for each KRI showing the last 6 readings
**And** I can filter KRIs by Risk Category, Owner, and Status
**And** KRIs in RED or AMBER status are sorted to the top of the list by default
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Risk Analytics and Reporting (5 scenarios)

### TC-RISK-021: View Risk Heatmap (5x5 Grid)

**Given** at least 10 risks exist across all four categories with varying likelihood and impact scores
**When** I navigate to Risk > Analytics > Heat Map
**Then** the 5×5 grid is displayed with likelihood on the Y-axis (1=Rare to 5=Almost Certain) and impact on the X-axis (1=Negligible to 5=Catastrophic)
**And** each risk is represented as a labelled dot placed in the correct grid cell
**And** cells in the top-right zone (score >= 15) are red, mid-zone (score 8–14) amber, and bottom-left (score <= 7) green
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-RISK-022: Filter Heat Map by Category

**Given** the risk heat map displays risks from all four categories (Strategic, Operational, Financial, Compliance)
**When** I apply the Category filter "STRATEGIC"
**Then** only STRATEGIC risks are shown on the heat map
**And** non-strategic risk dots are hidden or greyed out
**And** the filter label is displayed and a "Clear Filter" option is available
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-RISK-023: Export Risk Register

**Given** the risk register contains at least 10 risks with varying statuses, categories, and scores
**When** I click "Export" and select format "CSV" (or "Excel")
**Then** a file is generated containing all visible risk records with columns: Reference, Title, Category, Owner, Likelihood, Impact, Inherent Score, Residual Score, Status, Treatment Strategy, Last Updated
**And** the export respects any active filters (e.g., exporting only OPEN risks if that filter is applied)
**And** the file downloads successfully to the browser
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-RISK-024: View Risk Trend Over Time

**Given** risks have been reviewed and updated over at least 3 consecutive months with changing residual scores
**When** I navigate to Risk > Analytics > Trend Analysis and select a risk "RISK-2026-001"
**Then** I see a line chart showing the inherent score (static) and residual score (changing) over the review history
**And** each data point is labelled with the review date and the score at that time
**And** the chart shows the direction of travel (improving or worsening) with an indicator
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-RISK-025: Generate Executive Risk Summary

**Given** a complete risk register exists with risks, controls, treatments, and KRI readings for the current period
**When** I navigate to Risk > Reports and click "Generate Executive Summary" for period "Q1 2026"
**Then** a report is generated containing: total risk count by category, count by RAG status, top 5 risks by inherent score, KRI summary (GREEN/AMBER/RED counts), treatments due this quarter and their completion status, and any newly raised risks since last reporting period
**And** the report is available for download and includes the generation date and preparer name
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Sign-Off

| Role                  | Name | Signature | Date |
| --------------------- | ---- | --------- | ---- |
| Risk Manager          |      |           |      |
| Product Owner         |      |           |      |
| UAT Lead              |      |           |      |
| Regulatory/Compliance |      |           |      |

**Overall Result:** [ ] PASS -- All scenarios passed / [ ] FAIL -- See notes above
**Release Recommendation:** [ ] Approved for Production / [ ] Requires remediation
