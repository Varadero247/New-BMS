# UAT Test Plan: Energy Management Module (ISO 50001:2018)

---
> **CONFIDENTIAL — TRADE SECRET**
> This document is the property of Nexara DMCC and contains confidential and
> proprietary information. Unauthorised disclosure is prohibited.
> © 2026 Nexara DMCC. All rights reserved.
---


**Document ID:** UAT-ENG-001
**Version:** 1.0
**Date:** 2026-02-23
**Module:** Energy Management (ISO 50001:2018)
**Environment:** Staging (api-energy:4020 / web-energy:3021)
**Tester:** ****************\_\_\_\_****************
**Sign-Off Date:** ****************\_\_\_\_****************

---

## Energy Baseline (5 scenarios)

### TC-ENG-001: Create 2024 Energy Baseline

**Given** I am logged in as an Energy Manager
**When** I navigate to Energy > Baselines and click "New Baseline"
**And** I enter: Name "2024 Facility Baseline", Year 2024, Total Consumption 2450000, Unit "kWh", Methodology "12-month rolling average from main meter readings", Notes "Established as reference year per ISO 50001 EnMS review"
**Then** the baseline is created with reference "BASE-2602-XXXX" and status "DRAFT"
**And** the baseline record displays the consumption figure of 2,450,000 kWh and the selected methodology
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ENG-002: Activate Energy Baseline

**Given** baseline "BASE-2602-0001" (2024 Facility Baseline) exists with status "DRAFT"
**When** I click "Activate Baseline" and confirm the action
**Then** the baseline status changes to "ACTIVE"
**And** only one baseline can be active at a time — any previously active baseline is automatically set to "SUPERSEDED"
**And** the activation date is recorded on the baseline record
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ENG-003: Verify Active Baseline Appears on Dashboard

**Given** baseline "BASE-2602-0001" (2024 Facility Baseline) has status "ACTIVE"
**When** I navigate to the Energy dashboard home page
**Then** the active baseline (2,450,000 kWh, Year 2024) is displayed in the baseline reference panel
**And** the baseline is used as the reference point for target reduction calculations shown on the dashboard
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ENG-004: Update Baseline Methodology Description

**Given** baseline "BASE-2602-0001" (2024 Facility Baseline) is ACTIVE
**When** I edit the baseline and update the Methodology field to "12-month rolling average from ELEC-2024-001 main meter and supplementary sub-meter SM-001; normalised for degree-days"
**Then** the baseline record is saved with the updated methodology description
**And** the methodology change is visible in the baseline detail view
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ENG-005: Verify Baseline Used in Reduction Calculations

**Given** baseline "BASE-2602-0001" (2024, 2,450,000 kWh) is ACTIVE and energy target "TGT-2602-0001" (10% reduction) is linked to it
**When** I view the target detail or the dashboard reduction calculation
**Then** the target consumption is shown as 2,205,000 kWh (2,450,000 × 0.90)
**And** the system references baseline "BASE-2602-0001" as the source for this calculation
**And** updating the baseline value recalculates the target consumption automatically
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Energy Targets (5 scenarios)

### TC-ENG-006: Set 10% Reduction Target for 2026

**Given** I am logged in as an Energy Manager and baseline "BASE-2602-0001" (2024, 2,450,000 kWh) is ACTIVE
**When** I navigate to Energy > Targets and click "New Target"
**And** I enter: Name "2026 Energy Reduction Target", Year 2026, Reduction Percentage 10, Linked Baseline "BASE-2602-0001", Description "10% reduction on 2024 baseline in line with ISO 50001 EnMS objectives"
**Then** the target is created with reference "TGT-2602-XXXX" and status "ACTIVE"
**And** the target consumption is calculated and displayed as 2,205,000 kWh (2,450,000 × 0.90)
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ENG-007: Link Target to 2024 Baseline

**Given** target "TGT-2602-0001" (2026 Reduction Target) exists and baseline "BASE-2602-0001" (2024) is ACTIVE
**When** I view the target detail
**Then** the linked baseline "BASE-2602-0001" is displayed with its name, year, and consumption figure
**And** the target reduction calculation references the linked baseline value of 2,450,000 kWh
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ENG-008: Update Target from 10% to 12% Reduction

**Given** target "TGT-2602-0001" with Reduction Percentage 10 (target consumption 2,205,000 kWh)
**When** I edit the target and change Reduction Percentage to 12
**Then** the target record is updated with Reduction Percentage 12
**And** the target consumption is recalculated as 2,156,000 kWh (2,450,000 × 0.88)
**And** the dashboard reflects the updated target consumption
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ENG-009: Verify Target Consumption Recalculated at 12%

**Given** target "TGT-2602-0001" has been updated to 12% reduction against baseline of 2,450,000 kWh
**When** I view the target detail page
**Then** the target consumption is displayed as 2,156,000 kWh
**And** the calculation breakdown shows: 2,450,000 × (1 − 0.12) = 2,156,000 kWh
**And** the dashboard energy target panel shows the updated 2,156,000 kWh figure
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ENG-010: Delete Target and Verify 404

**Given** target "TGT-2602-0002" (a non-primary test target) exists with status "DRAFT"
**When** I click "Delete Target" and confirm the deletion
**Then** the target is removed from the system
**And** a subsequent GET request to `/api/energy/targets/TGT-2602-0002` returns HTTP 404
**And** the target no longer appears in the targets list
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Meter Management (5 scenarios)

### TC-ENG-011: Register Main Electricity Meter

**Given** I am logged in as an Energy Manager
**When** I navigate to Energy > Meters and click "Add Meter"
**And** I enter: Name "Main Electricity Incomer", Meter ID "ELEC-2024-001", Type "ELECTRICITY", Unit "kWh", Location "Main Distribution Board — Building A", Installation Date "2024-01-01", Status "ACTIVE"
**Then** the meter is registered with the specified details
**And** the meter appears in the meter register under Type "ELECTRICITY" with status "ACTIVE"
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ENG-012: Add Monthly Reading to Meter

**Given** meter "ELEC-2024-001" (Main Electricity Incomer) is ACTIVE
**When** I click "Add Reading" and enter: Reading Date "2026-01-31", Reading Value 145230, Unit "kWh", Notes "End of January 2026 reading"
**Then** the reading is saved and linked to meter "ELEC-2024-001"
**And** the reading appears in the meter reading history with the date and value
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ENG-013: Verify Consumption Calculation Between Readings

**Given** meter "ELEC-2024-001" has two readings: 144010 kWh on 2025-12-31 and 145230 kWh on 2026-01-31
**When** I view the consumption summary for the period December 2025 to January 2026
**Then** the calculated consumption is displayed as 1,220 kWh (145230 − 144010)
**And** the consumption figure is shown against the meter and the relevant period
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ENG-014: Deactivate Meter

**Given** meter "ELEC-2024-001" has status "ACTIVE"
**When** I edit the meter record and change Status to "INACTIVE" with a deactivation note "Replaced with smart meter ELEC-2026-001 from 2026-03-01"
**Then** the meter status changes to "INACTIVE"
**And** the meter no longer appears in the active meter list by default
**And** the meter remains visible under the "INACTIVE" filter with all historical readings preserved
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ENG-015: View Meter Reading History

**Given** meter "ELEC-2024-001" has at least 12 monthly readings recorded over the past year
**When** I navigate to the meter detail and click "Reading History"
**Then** all readings are listed in reverse chronological order with date, value, and period consumption
**And** I can filter the history by date range
**And** the total consumption for the selected period is summarised at the bottom of the list
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Energy Dashboard (5 scenarios)

### TC-ENG-016: View Current Consumption vs Target

**Given** energy target "TGT-2602-0001" (2,156,000 kWh for 2026) is ACTIVE and meter readings for the current year are recorded
**When** I navigate to the Energy dashboard home page
**Then** the dashboard displays year-to-date consumption in kWh alongside the annual target of 2,156,000 kWh
**And** a progress bar or gauge indicates how close current consumption is to the target
**And** over-target consumption is highlighted in red
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ENG-017: View Monthly Trend Chart

**Given** meter readings spanning at least six months are recorded for the current year
**When** I view the Energy dashboard trend section
**Then** a monthly bar or line chart is displayed showing consumption per month for the current year
**And** the chart includes a target reference line based on an even distribution of the annual target
**And** I can toggle between kWh, cost (if unit rates are configured), and CO₂ equivalent
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ENG-018: Filter Dashboard by Meter Type

**Given** meters of types ELECTRICITY, GAS, and WATER are registered and have readings
**When** I apply the meter type filter on the Energy dashboard and select "ELECTRICITY"
**Then** the dashboard updates to show only electricity consumption data
**And** the trend chart, target comparison, and intensity metrics reflect only the electricity meters
**And** switching to "GAS" or "WATER" updates the dashboard accordingly
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ENG-019: Verify Target Achievement Percentage

**Given** the annual target is 2,156,000 kWh and year-to-date consumption is 340,000 kWh (end of February)
**When** I view the target achievement panel on the Energy dashboard
**Then** the year-to-date consumption is compared to the pro-rata target for the period (2,156,000 ÷ 12 × 2 = 359,333 kWh)
**And** the achievement percentage is displayed as approximately 105% (on track, under pro-rata target)
**And** the panel shows a "ON TRACK" or "AT RISK" status indicator
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ENG-020: View Energy Intensity Metric

**Given** energy consumption data and a production output figure (e.g. units produced) are recorded for the current period
**When** I view the Energy Intensity section of the dashboard
**Then** the energy intensity is calculated as kWh per unit of production output
**And** the intensity metric is shown for the current period alongside the baseline period for comparison
**And** a reduction in intensity indicates improved energy efficiency
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Energy Audits & Compliance (5 scenarios)

### TC-ENG-021: Schedule Energy Audit

**Given** I am logged in as an Energy Manager
**When** I navigate to Energy > Audits and click "Schedule Audit"
**And** I enter: Title "ISO 50001 Internal Energy Audit Q1 2026", Audit Type "INTERNAL", Scheduled Date "2026-03-15", Lead Auditor "M. Clarke", Scope "All significant energy users in Building A and B", Standard "ISO 50001:2018"
**Then** the audit is created with reference "ENGAUD-2602-XXXX" and status "SCHEDULED"
**And** the audit appears in the audit calendar for Q1 2026
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ENG-022: Record Audit Finding — Significant Energy Use Identified

**Given** audit "ENGAUD-2602-0001" (ISO 50001 Internal Audit Q1 2026) is in status "IN_PROGRESS"
**When** I click "Add Finding" and enter: Clause "6.3", Finding Type "OPPORTUNITY", Description "Compressed air system accounts for 28% of total site electricity consumption — no sub-metering or optimisation programme in place for this SEU", Recommended Action "Install sub-meter on compressed air system and develop SEU action plan", Due Date "2026-06-30"
**Then** the finding is recorded and linked to audit "ENGAUD-2602-0001"
**And** the finding appears with status "OPEN" and type "OPPORTUNITY"
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ENG-023: Link Audit Finding to Significant Energy User (SEU)

**Given** finding "ENGAUD-2602-0001-F01" (compressed air SEU) is OPEN and SEU record "SEU-001" (Compressed Air System) exists
**When** I edit the finding and link it to SEU "SEU-001" via the SEU reference field
**Then** the finding record shows the linked SEU reference "SEU-001"
**And** the SEU record displays the linked open finding with its audit reference
**And** the SEU detail view shows a flag indicating an open audit finding
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ENG-024: Raise Improvement Action from Audit Finding

**Given** finding "ENGAUD-2602-0001-F01" (compressed air SEU — no sub-metering) is OPEN
**When** I click "Raise Improvement Action" on the finding and enter: Action Title "Install compressed air sub-meter and develop SEU action plan", Assigned To "Facilities Manager", Due Date "2026-06-30", Priority "HIGH"
**Then** an improvement action is created with reference "ENGIMP-2602-XXXX" and linked to the audit finding
**And** the finding record shows the linked improvement action reference
**And** the action appears in the Energy > Improvement Actions register
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ENG-025: Verify Energy Compliance Status

**Given** the ISO 50001 compliance checklist has been completed with all mandatory clauses assessed
**When** I navigate to Energy > Compliance Status
**Then** the compliance dashboard shows the overall ISO 50001 conformance percentage
**And** each clause (4 through 10) is listed with its conformance status (CONFORMING, MINOR_NC, MAJOR_NC, NOT_ASSESSED)
**And** open non-conformances are linked to their improvement actions and due dates
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Sign-Off

| Role                  | Name | Signature | Date |
| --------------------- | ---- | --------- | ---- |
| Energy Manager        |      |           |      |
| Product Owner         |      |           |      |
| UAT Lead              |      |           |      |
| Regulatory/Compliance |      |           |      |

**Overall Result:** [ ] PASS -- All scenarios passed / [ ] FAIL -- See notes above
**Release Recommendation:** [ ] Approved for Production / [ ] Requires remediation
