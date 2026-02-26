# UAT Test Plan: ESG Reporting Module (GRI / SASB / TCFD)

---
> **CONFIDENTIAL — TRADE SECRET**
> This document is the property of Nexara DMCC and contains confidential and
> proprietary information. Unauthorised disclosure is prohibited.
> © 2026 Nexara DMCC. All rights reserved.
---


**Document ID:** UAT-ESG-001
**Version:** 1.0
**Date:** 2026-02-23
**Module:** ESG Reporting (GRI / SASB / TCFD)
**Environment:** Staging (api-esg:4016 / web-esg:3016)
**Tester:** **\*\*\*\***\_\_\_\_**\*\*\*\***
**Sign-Off Date:** **\*\*\*\***\_\_\_\_**\*\*\*\***

---

## GHG Emissions (5 scenarios)

### TC-ESG-001: Record Scope 1 Combustion Emission

**Given** I am logged in as an ESG Manager
**When** I navigate to ESG > GHG Emissions and click "Add Emission"
**And** I enter: Scope "SCOPE_1", Category "Stationary Combustion", Source "Natural Gas Boiler B1", Activity Data "12500 kWh", Activity Unit "kWh", Emission Factor Source "DEFRA 2025", Period "2026-Q1"
**Then** the system creates the emission record and calculates tCO2e using the DEFRA combustion factor
**And** the record appears in the Scope 1 emissions list with a reference number
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ESG-002: Record Scope 2 Purchased Electricity Emission

**Given** I am on the GHG Emissions page
**When** I click "Add Emission" and enter: Scope "SCOPE_2", Category "Purchased Electricity", Source "Site A Grid Supply", Activity Data "48000 kWh", Activity Unit "kWh", Market-Based Method "Yes", Emission Factor Source "DEFRA 2025 UK Grid", Period "2026-Q1"
**Then** the system calculates location-based and market-based tCO2e figures
**And** both values are displayed in the emission record detail
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ESG-003: Record Scope 3 Business Travel Emission

**Given** I am on the GHG Emissions page
**When** I click "Add Emission" and enter: Scope "SCOPE_3", Category "Business Travel", Sub-Category "Air Travel", Source "London to New York return (economy)", Activity Data "2" (flights), Distance "10980 km", Emission Factor Source "DEFRA 2025", Period "2026-Q1"
**Then** the system records the Scope 3 business travel emission and calculates tCO2e
**And** the record is categorised under Scope 3 Category 6 (Business Travel)
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ESG-004: View Emissions Summary by Scope

**Given** emission records exist for Scope 1, Scope 2, and Scope 3 for the current reporting period
**When** I navigate to ESG > Emissions Summary
**Then** the dashboard displays total tCO2e broken down by Scope 1, Scope 2 (location-based), Scope 2 (market-based), and Scope 3
**And** a chart shows the proportional split across scopes
**And** I can filter by reporting period and organisational boundary
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ESG-005: Verify tCO2e Calculations Using DEFRA Emission Factors

**Given** a Scope 1 natural gas emission record with Activity Data "1000 kWh" and DEFRA factor "0.18316 kgCO2e/kWh"
**When** I view the emission record detail
**Then** the displayed tCO2e value equals 0.18316 (1000 × 0.00018316 tCO2e)
**And** the calculation formula and factor version are shown for audit traceability
**And** the factor version matches the DEFRA 2025 published value
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## ESG Reports (5 scenarios)

### TC-ESG-006: Generate GRI Standards Report for Reporting Period

**Given** I am logged in as an ESG Manager with GHG and social metrics recorded for FY2025
**When** I navigate to ESG > Reports and click "New Report"
**And** I enter: Title "FY2025 ESG Report", Framework "GRI_STANDARDS", Reporting Period "2025-01-01 to 2025-12-31", Organisation "Nexara DMCC"
**Then** the system creates the report with status "DRAFT" and a reference number "ESG-RPT-2026-XXXX"
**And** GRI disclosures relevant to the recorded data are pre-populated as sections
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ESG-007: Add TCFD Disclosure Section

**Given** an ESG report "ESG-RPT-2026-0001" in DRAFT status
**When** I click "Add Section" and select Type "TCFD_DISCLOSURE"
**And** I fill in: Pillar "Risks & Opportunities", Disclosure "Physical risk: increased flood frequency at Site A", Timeframe "Medium-term (2030)", Impact Assessment "High — potential £2.4M asset damage"
**Then** the TCFD section is added to the report
**And** it is categorised under the Risks & Opportunities pillar in the report structure
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ESG-008: Publish Report (DRAFT to PUBLISHED)

**Given** an ESG report "ESG-RPT-2026-0001" in DRAFT status with all required sections completed
**When** I click "Publish Report" and confirm the action
**Then** the report status changes from "DRAFT" to "PUBLISHED"
**And** a publication timestamp and publisher name are recorded
**And** the report becomes visible in the Published Reports view
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ESG-009: View Report History

**Given** ESG reports exist for FY2023, FY2024, and FY2025
**When** I navigate to ESG > Reports > History
**Then** all three reports are listed with their title, framework, reporting period, status, and published date
**And** I can open each report to view its full content
**And** year-on-year data comparisons are shown where available
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ESG-010: Export Report as PDF Reference

**Given** a PUBLISHED ESG report "ESG-RPT-2026-0001"
**When** I click "Export" and select format "PDF"
**Then** the system generates a PDF document containing all report sections, disclosure content, and GHG data tables
**And** the PDF filename includes the report reference and date (e.g. "ESG-RPT-2026-0001_FY2025.pdf")
**And** a download link or browser download is triggered
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Social Metrics (5 scenarios)

### TC-ESG-011: Record Diversity Metric (% Female Employees)

**Given** I am on the ESG Social Metrics page
**When** I click "Add Metric" and enter: Category "DIVERSITY_INCLUSION", Metric Name "% Female Employees", Value "38.5", Unit "%", Reporting Period "2025-12-31", Data Source "HR System Export"
**Then** the metric is recorded and displayed on the Social Metrics dashboard
**And** the metric is tagged with the GRI disclosure reference GRI 405-1
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ESG-012: Record Health & Safety Metric (LTIFR)

**Given** I am on the ESG Social Metrics page
**When** I click "Add Metric" and enter: Category "HEALTH_SAFETY", Metric Name "Lost Time Injury Frequency Rate (LTIFR)", Value "1.8", Unit "per million hours worked", Reporting Period "2025-12-31", Data Source "Incidents Module"
**Then** the metric is recorded and linked to the GRI 403-9 disclosure
**And** the LTIFR value appears in the H&S section of the Social Metrics dashboard
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ESG-013: View Social Metrics Dashboard

**Given** diversity, H&S, and community metrics have been recorded for FY2025
**When** I navigate to ESG > Social Metrics Dashboard
**Then** the dashboard displays all social KPIs grouped by category (Diversity & Inclusion, Health & Safety, Community)
**And** each metric shows its value, unit, period, and GRI disclosure reference
**And** a traffic-light indicator shows RAG status against targets where set
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ESG-014: Set Improvement Target for Social Metric

**Given** a social metric "% Female Employees" currently at 38.5%
**When** I click "Set Target" and enter: Target Value "45", Target Year "2027", Owner "Head of HR"
**Then** the target is saved against the metric
**And** the dashboard shows progress towards the target (38.5% of 45% achieved = 85.6% of target)
**And** the target owner is notified
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ESG-015: Compare Year-on-Year Trend for Social Metric

**Given** LTIFR metrics have been recorded for FY2023 (2.4), FY2024 (2.1), and FY2025 (1.8)
**When** I select the LTIFR metric and click "View Trend"
**Then** a trend chart is displayed showing all three years
**And** the year-on-year change is calculated (FY2024: -12.5%, FY2025: -14.3%)
**And** the trend direction is shown as "Improving" with a downward indicator
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Targets & Initiatives (5 scenarios)

### TC-ESG-016: Create Net Zero 2040 Target

**Given** I am logged in as an ESG Manager
**When** I navigate to ESG > Targets and click "New Target"
**And** I enter: Name "Net Zero by 2040", Type "EMISSIONS", Baseline Year "2020", Baseline Value "4500 tCO2e", Target Value "0 tCO2e", Target Year "2040", Framework "SBTi", Status "COMMITTED"
**Then** the target is created with reference "ESG-TGT-2026-XXXX"
**And** it appears on the Targets dashboard with a progress bar showing current emissions against baseline
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ESG-017: Add Sub-Target (30% Reduction by 2030)

**Given** a parent target "Net Zero by 2040" (ESG-TGT-2026-0001) exists
**When** I click "Add Sub-Target" and enter: Name "30% Scope 1+2 reduction by 2030", Parent Target "ESG-TGT-2026-0001", Target Value "3150 tCO2e", Target Year "2030", Milestone "Interim"
**Then** the sub-target is created and linked to the parent
**And** the parent target detail page shows the sub-target as a milestone
**And** progress towards the sub-target is tracked independently
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ESG-018: Create Initiative Linked to Target

**Given** an ESG target "ESG-TGT-2026-0001" exists
**When** I navigate to ESG > Initiatives and click "New Initiative"
**And** I enter: Name "Solar PV Installation at Site A", Linked Target "ESG-TGT-2026-0001", Expected Reduction "250 tCO2e/year", Budget "£185,000", Start Date "2026-06-01", Lead "Facilities Manager", Status "PLANNED"
**Then** the initiative is created and linked to the target
**And** the target detail page shows the initiative under "Contributing Initiatives"
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ESG-019: Update Initiative Progress

**Given** an initiative "Solar PV Installation at Site A" with status "PLANNED"
**When** I update: Status "IN_PROGRESS", % Complete "35", Notes "Groundworks completed, panel installation begins March 2026", Actual Spend to Date "£42,000"
**Then** the initiative record is updated with the new progress values
**And** the target dashboard reflects the updated expected contribution
**And** the progress timestamp and updater are recorded
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ESG-020: View Target Achievement Dashboard

**Given** ESG targets, sub-targets, and initiatives exist with progress data
**When** I navigate to ESG > Target Achievement Dashboard
**Then** all targets are listed with current performance against baseline
**And** each target shows: % achieved, years remaining, linked initiatives count, and RAG status
**And** the dashboard shows a cumulative emissions reduction trajectory chart
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Materiality Assessment (5 scenarios)

### TC-ESG-021: Add Material Issue

**Given** I am on the ESG Materiality Assessment page
**When** I click "Add Issue" and enter: Name "Supply Chain Labour Standards", Category "SOCIAL", GRI Disclosure "GRI 408/409", Description "Risk of forced and child labour in Tier 2 supply chain", Assessment Period "2026"
**Then** the material issue is added to the assessment with status "UNRATED"
**And** it appears in the materiality issue list for the 2026 assessment period
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ESG-022: Rate Importance to Business and Stakeholders

**Given** a material issue "Supply Chain Labour Standards" exists with status "UNRATED"
**When** I click "Rate Issue" and enter: Importance to Business "7.5" (scale 1-10), Importance to Stakeholders "8.2" (scale 1-10), Rationale "Identified as high-concern by 72% of investor survey respondents"
**Then** the scores are saved and the issue status changes to "RATED"
**And** the issue position is calculated for the materiality matrix based on the two scores
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ESG-023: View Materiality Matrix

**Given** at least 5 material issues have been rated with business and stakeholder importance scores
**When** I navigate to ESG > Materiality Matrix
**Then** a 2x2 scatter matrix is displayed with "Importance to Business" on the X-axis and "Importance to Stakeholders" on the Y-axis
**And** each issue is plotted as a point labelled with its name
**And** the top-right quadrant highlights high-priority issues
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ESG-024: Mark Issue as Priority

**Given** a rated material issue "Supply Chain Labour Standards" with scores (7.5 business, 8.2 stakeholders)
**When** I click "Mark as Priority" and enter Justification "Both scores exceed 7.0 threshold — board-level action required"
**Then** the issue status changes to "PRIORITY"
**And** it is highlighted on the materiality matrix with a distinct indicator
**And** a notification is sent to the ESG Manager and sustainability lead
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ESG-025: Link Material Issue to GRI Disclosure

**Given** a material issue "Supply Chain Labour Standards" marked as PRIORITY
**When** I click "Link Disclosure" and select GRI disclosures "GRI 408-1 (Child Labour)" and "GRI 409-1 (Forced Labour)"
**Then** the disclosures are linked to the material issue
**And** the ESG report automatically includes these disclosures in the relevant section when the issue is marked as material
**And** the disclosure coverage is shown on the materiality assessment summary
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Sign-Off

| Role                  | Name | Signature | Date |
| --------------------- | ---- | --------- | ---- |
| ESG Manager           |      |           |      |
| Product Owner         |      |           |      |
| UAT Lead              |      |           |      |
| Regulatory/Compliance |      |           |      |

**Overall Result:** [ ] PASS -- All scenarios passed / [ ] FAIL -- See notes above
**Release Recommendation:** [ ] Approved for Production / [ ] Requires remediation
