# UAT Test Plan: Analytics & Business Intelligence

---
> **CONFIDENTIAL — TRADE SECRET**
> This document is the property of Nexara DMCC and contains confidential and
> proprietary information. Unauthorised disclosure is prohibited.
> © 2026 Nexara DMCC. All rights reserved.
---


**Document ID:** UAT-ANA-001
**Version:** 1.0
**Date:** 2026-02-23
**Module:** Analytics & Business Intelligence
**Environment:** Staging (api-analytics:4021 / web-analytics:3022)
**Tester:** ________________________________________
**Sign-Off Date:** ________________________________________

---

## KPI Management (5 scenarios)

### TC-ANA-001: Create KPI with Category, Direction, and Frequency

**Given** I am logged in as an Analytics Manager
**When** I navigate to Analytics > KPIs and click "New KPI"
**And** I fill in: Name "Lost Time Injury Frequency Rate", Category "HEALTH_SAFETY", Direction "LOWER_IS_BETTER", Unit "per 100k hours", Frequency "MONTHLY", Owner "H&S Manager", Description "Number of LTIs per 100,000 hours worked"
**Then** the KPI is created with a unique reference
**And** the KPI status defaults to "ACTIVE"
**And** the KPI appears in the KPI library under the HEALTH_SAFETY category
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ANA-002: Set KPI Target Value

**Given** a KPI "Lost Time Injury Frequency Rate" (HEALTH_SAFETY, LOWER_IS_BETTER) exists without a target
**When** I open the KPI, click "Set Target", and enter: Target Value 2.5, Effective From "2026-01-01", Period "Annual 2026"
**Then** the target is saved against the KPI
**And** the KPI card displays the target value of 2.5
**And** subsequent data point entries are compared against this target
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ANA-003: Update KPI Target

**Given** a KPI "Lost Time Injury Frequency Rate" with existing target 2.5 for Annual 2026
**When** I open the KPI, click "Edit Target", and update the Target Value to 2.0 with notes "Revised after Q1 performance review"
**Then** the target is updated to 2.0
**And** the revision history shows both the previous (2.5) and new (2.0) targets with dates
**And** the KPI dashboard tile reflects the new target line
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ANA-004: View KPI Trend Chart

**Given** a KPI "Lost Time Injury Frequency Rate" has at least 6 monthly data points recorded (e.g. Aug 2025 – Jan 2026)
**When** I open the KPI and navigate to the "Trend" tab
**Then** a line chart displays the monthly values over the recorded period
**And** the target line (2.0) is overlaid on the chart as a reference
**And** data points above the target are highlighted in red (LOWER_IS_BETTER direction)
**And** the chart shows percentage change from the previous period
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ANA-005: Delete KPI and Verify 404

**Given** a KPI with a known ID exists and is not linked to any active dashboards or reports
**When** I open the KPI, click "Delete", and confirm the deletion
**Then** the KPI is removed from the KPI library
**And** a GET request to `/api/analytics/kpis/{id}` returns HTTP 404
**And** the KPI no longer appears in any category filter view
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Dashboards (5 scenarios)

### TC-ANA-006: Create Executive Dashboard with GRID Layout

**Given** I am logged in as an Analytics Manager
**When** I navigate to Analytics > Dashboards and click "New Dashboard"
**And** I fill in: Name "Executive Safety & Sustainability Dashboard", Layout "GRID", Visibility "ORGANISATION", Description "Top-level KPI view for executive team"
**Then** the dashboard is created with status "ACTIVE" and layout "GRID"
**And** the dashboard appears in the Dashboards list
**And** an empty grid canvas is shown ready for widgets
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ANA-007: Add KPI Widget to Dashboard

**Given** a dashboard "Executive Safety & Sustainability Dashboard" exists with an empty grid
**When** I click "Add Widget", select type "KPI", and choose the KPI "Lost Time Injury Frequency Rate"
**And** I configure the widget: position row 0, column 0, width 2, height 1
**Then** the widget is added to the dashboard grid at the specified position
**And** the widget displays the current KPI value, target, and trend indicator
**And** the dashboard widget count increments to 1
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ANA-008: Set Dashboard Refresh Interval

**Given** a dashboard "Executive Safety & Sustainability Dashboard" with at least one widget exists
**When** I open the dashboard settings and set Refresh Interval to 3600 seconds (1 hour)
**Then** the dashboard refreshInterval field is updated to 3600
**And** the dashboard header shows the next scheduled refresh time
**And** data automatically re-fetches after the interval without manual page reload
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ANA-009: Share Dashboard with Team

**Given** a dashboard "Executive Safety & Sustainability Dashboard" exists with visibility "PRIVATE"
**When** I click "Share Dashboard" and select team members ["CEO", "COO", "H&S Director"] and set visibility to "TEAM"
**Then** the dashboard visibility updates to "TEAM"
**And** the named team members can access the dashboard from their own analytics home page
**And** the original owner retains edit rights; shared users have view-only access
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ANA-010: View Dashboard in Presentation Mode

**Given** a dashboard "Executive Safety & Sustainability Dashboard" with 4 widgets exists
**When** I click "Presentation Mode" or the fullscreen icon
**Then** the navigation sidebar and header collapse and the dashboard fills the full viewport
**And** widgets auto-rotate or remain static as configured
**And** pressing Escape or clicking "Exit" returns to the standard dashboard view
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Reports (5 scenarios)

### TC-ANA-011: Create Quarterly Performance Report

**Given** I am logged in as an Analytics Manager
**When** I navigate to Analytics > Reports and click "New Report"
**And** I fill in: Title "Q1 2026 Integrated Performance Report", Type "QUARTERLY", Period Start "2026-01-01", Period End "2026-03-31", Author "Analytics Team"
**Then** the report is created with status "DRAFT"
**And** the report reference is generated and displayed
**And** the report appears in the Reports list under DRAFT status
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ANA-012: Add Modules to Report

**Given** a report "Q1 2026 Integrated Performance Report" in DRAFT status exists
**When** I open the report, click "Add Sections", and select modules: "Health & Safety", "Environment", "Quality"
**Then** three sections are added to the report, one per module
**And** each section automatically populates with the relevant KPIs and summary data for Q1 2026
**And** the report preview shows all three sections with headings
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ANA-013: Publish Report (DRAFT to PUBLISHED)

**Given** a report "Q1 2026 Integrated Performance Report" in DRAFT status with at least one section added
**When** I click "Publish Report" and confirm
**Then** the report status changes from "DRAFT" to "PUBLISHED"
**And** the published date is recorded as today
**And** the report is visible to all users with Analytics viewer permissions
**And** the report can no longer be edited without creating a new revision
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ANA-014: View Report History

**Given** multiple versions of reports have been published over several quarters (Q3 2025, Q4 2025, Q1 2026)
**When** I navigate to Analytics > Reports and filter by Type "QUARTERLY"
**Then** all published quarterly reports are listed in reverse-chronological order
**And** each entry shows: Title, Period, Status, Published Date, Author
**And** I can click any report to view the full published content
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ANA-015: Schedule Recurring Report

**Given** a report template "Monthly KPI Summary" exists in PUBLISHED status
**When** I open the report and click "Schedule Recurring"
**And** I set: Frequency "MONTHLY", Generate On "1st of each month", Auto-Publish "Yes", Recipients ["CEO", "COO"]
**Then** the recurring schedule is saved against the report
**And** the next generation date is displayed as the 1st of next month
**And** the schedule entry appears in the report scheduler list
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Predictions & Anomalies (5 scenarios)

### TC-ANA-016: View Incident Rate Prediction for Next 3 Months

**Given** at least 12 months of incident rate historical data exists in the system
**When** I navigate to Analytics > Predictions and select metric "Incident Rate"
**Then** a forecast chart is displayed showing the predicted incident rate for the next 3 months (March, April, May 2026)
**And** the chart shows confidence intervals (upper and lower bounds)
**And** the prediction model used (e.g. Linear Regression, ARIMA) is labelled on the chart
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ANA-017: View Anomaly Detection Results

**Given** anomaly detection has been run against recent KPI data
**When** I navigate to Analytics > Anomalies
**Then** a list of detected anomalies is displayed, each showing: KPI Name, Detected Date, Observed Value, Expected Range, Deviation Score
**And** anomalies are sorted by severity (highest deviation first)
**And** unacknowledged anomalies are highlighted
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ANA-018: Acknowledge Anomaly with Notes

**Given** an unacknowledged anomaly exists for KPI "Lost Time Injury Frequency Rate" with an observed spike
**When** I open the anomaly and click "Acknowledge"
**And** I enter notes "Spike due to contractor incident on 2026-02-10 — isolated event, not a trend"
**Then** the anomaly status changes to "ACKNOWLEDGED"
**And** the acknowledgement notes and acknowledging user are recorded with a timestamp
**And** the anomaly is moved from the "Unacknowledged" view to "Acknowledged"
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ANA-019: View Anomaly History

**Given** multiple anomalies have been detected and acknowledged over the past 6 months
**When** I navigate to Analytics > Anomalies and select the "History" tab or filter by status "ACKNOWLEDGED"
**Then** all acknowledged anomalies are listed with their KPI, date, severity, and acknowledging user
**And** I can filter by KPI category or date range
**And** the count of anomalies per month is shown in a summary chart
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ANA-020: Configure Anomaly Sensitivity Threshold

**Given** anomaly detection is active with default sensitivity settings
**When** I navigate to Analytics > Anomaly Settings and adjust the sensitivity threshold for category "HEALTH_SAFETY" from the default to "HIGH" (tighter bounds, more anomalies detected)
**Then** the sensitivity setting is saved
**And** the system confirms the change will apply to the next detection cycle
**And** the threshold change is logged in the system audit trail
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Executive Summary (5 scenarios)

### TC-ANA-021: View Cross-Module Executive Summary

**Given** data exists across at least 5 modules (H&S, Environment, Quality, Risk, Compliance)
**When** I navigate to Analytics > Executive Summary
**Then** a single-page summary is displayed showing the top-level status of each active module
**And** each module shows: overall RAG status (Red/Amber/Green), key metric value, and trend direction
**And** the summary was last refreshed within the last 24 hours (timestamp visible)
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ANA-022: Filter Executive Summary by Date Range

**Given** the executive summary is displaying current period data
**When** I use the date range picker to select "Q4 2025 (Oct–Dec 2025)"
**Then** all module metrics update to reflect Q4 2025 data
**And** KPI values, incident counts, and compliance rates shown are specific to that period
**And** a banner indicates the historical period being viewed
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ANA-023: Compare Period-on-Period

**Given** the executive summary is displaying Q1 2026 data
**When** I enable the "Compare to Prior Period" toggle
**Then** each metric shows the Q4 2025 value alongside the Q1 2026 value
**And** an arrow indicator shows improvement (green) or deterioration (red) for each metric
**And** the percentage change from prior period is displayed for each module KPI
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ANA-024: View Top Risks and Incidents in Executive Summary

**Given** risk assessments and incident records exist in the system
**When** I scroll to the "Top Risks & Incidents" section of the executive summary
**Then** the top 5 open risks (by risk score) are listed with their risk owner and residual risk level
**And** the top 5 recent incidents (by severity) are listed with their status and days since occurrence
**And** clicking any risk or incident navigates to the detailed record in the relevant module
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ANA-025: Export Executive Summary to PDF

**Given** the executive summary is displaying data for the current period
**When** I click "Export" and select format "PDF"
**Then** a PDF file is generated containing the full executive summary content
**And** the PDF includes: page header with organisation name and report date, all module RAG statuses, KPI values with trends, and the top risks and incidents table
**And** the PDF is formatted for A4/Letter printing with page numbers
**And** the download completes within 10 seconds
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Sign-Off

| Role                  | Name | Signature | Date |
| --------------------- | ---- | --------- | ---- |
| QA Manager            |      |           |      |
| Product Owner         |      |           |      |
| UAT Lead              |      |           |      |
| Regulatory/Compliance |      |           |      |

**Overall Result:** [ ] PASS -- All scenarios passed / [ ] FAIL -- See notes above
**Release Recommendation:** [ ] Approved for Production / [ ] Requires remediation
