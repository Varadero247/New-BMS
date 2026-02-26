# UAT Test Plan: AI Analysis Module

---
> **CONFIDENTIAL — TRADE SECRET**
> This document is the property of Nexara DMCC and contains confidential and
> proprietary information. Unauthorised disclosure is prohibited.
> © 2026 Nexara DMCC. All rights reserved.
---

**Version**: 1.0
**Date**: 2026-02-23
**Module**: AI Analysis
**Port**: 4004
**Prepared by**: QA Team
**Status**: Draft

## Overview
The AI Analysis module provides intelligent data analysis capabilities across the IMS platform, including natural language querying, predictive analytics, anomaly detection, and AI-generated insights. It integrates with external AI providers (OpenAI and Anthropic) to deliver risk forecasting, CAPA scoring, root cause suggestions, and cross-module compliance intelligence. The module is accessible via the API gateway at port 4004 and surfaces results throughout all IMS web applications.

## Scope
- Natural language query interface for plain-English questions across all IMS data domains
- Predictive analytics for risk trends, incident forecasting, and compliance deadline scoring
- Anomaly detection across KPIs, environmental readings, and regulatory deadlines
- AI-generated insights and recommendations for CAPA effectiveness and root cause analysis
- Model configuration including AI provider selection, confidence thresholds, feature toggles, and API usage monitoring

## Prerequisites
- IMS platform running and accessible
- Admin credentials available (admin@ims.local / admin123)
- Test data seeded via seed scripts
- AI Analysis API service running on port 4004
- At least one AI provider API key configured (OpenAI or Anthropic)
- Historical incident, risk, and compliance records present in the database (minimum 30 days of data)
- Gateway routing `/api/ai/*` → `api-ai-analysis:4004` confirmed active

---

## Test Cases

### Natural Language Queries

#### TC-AI-001: Ask a Plain-English Question About Incidents
**Given** I am logged in as an IMS Administrator and the AI Analysis module is active on port 4004
**When** I navigate to AI Analysis > Natural Language Query and enter the question "How many critical incidents were reported in the last 30 days?"
**And** I submit the query
**Then** the system returns a structured response listing the count of CRITICAL severity incidents within the specified date range
**And** the response includes a reference to the underlying data source (incidents table) and a confidence score above 0.70

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

#### TC-AI-002: Ask a Plain-English Question About Compliance Risks
**Given** I am logged in as a Compliance Manager and at least 10 open non-conformances exist in the system
**When** I navigate to AI Analysis > Natural Language Query and enter the question "Which departments have the most overdue corrective actions?"
**And** I submit the query
**Then** the system returns a ranked list of departments ordered by count of overdue CAPA items
**And** each department entry displays the count, oldest overdue date, and responsible owner

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

#### TC-AI-003: Execute a Multi-Module Cross-Analysis Query
**Given** I am logged in as an IMS Administrator with data present across the H&S, Environment, and Quality modules
**When** I navigate to AI Analysis > Natural Language Query and enter "Show me the correlation between environmental incidents and quality non-conformances over the past quarter"
**And** I submit the query
**Then** the system performs a cross-module analysis spanning the `api-health-safety`, `api-environment`, and `api-quality` data domains
**And** the response presents a correlation summary with supporting data points from each module

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

#### TC-AI-004: View and Replay Query History
**Given** I have previously submitted at least three natural language queries during this session
**When** I navigate to AI Analysis > Query History
**Then** the system displays a chronological list of my previous queries with timestamps, query text, and response summaries
**And** I can click any historical query to re-execute it and receive a refreshed response based on current data

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

#### TC-AI-005: Export Natural Language Query Results
**Given** I have executed a natural language query that returned a tabular result set
**When** I click the "Export" button on the query results panel
**And** I select the CSV format option
**Then** the system generates and downloads a CSV file containing the full result set with column headers
**And** the exported file name includes the query date and a short descriptor derived from the query text

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

### Predictive Analytics

#### TC-AI-006: Generate a Risk Trend Forecast
**Given** I am logged in as a Risk Manager and at least 60 days of historical risk register data is present
**When** I navigate to AI Analysis > Predictive Analytics and select "Risk Trend Forecast"
**And** I configure a 90-day forecast horizon and click "Run Forecast"
**Then** the system returns a time-series chart projecting risk score trends for the next 90 days
**And** the forecast includes upper and lower confidence bands and identifies any predicted trend reversals

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

#### TC-AI-007: Run an Incident Prediction Model
**Given** I am logged in as a Health & Safety Manager and at least 90 days of incident history is available
**When** I navigate to AI Analysis > Predictive Analytics and select "Incident Prediction"
**And** I select department "Warehouse Operations" and click "Generate Prediction"
**Then** the system returns a predicted incident probability score for the next 30 days for that department
**And** the result identifies the top three contributing risk factors driving the prediction

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

#### TC-AI-008: Score Compliance Deadline Risk
**Given** I am logged in as a Compliance Manager with active ISO audit deadlines and regulatory submission dates in the system
**When** I navigate to AI Analysis > Predictive Analytics and select "Compliance Deadline Risk Scoring"
**Then** the system evaluates all upcoming compliance deadlines within 180 days and assigns each a risk score (LOW / MEDIUM / HIGH / CRITICAL)
**And** high-risk deadlines are flagged with recommended preparation lead times and suggested responsible owners

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

#### TC-AI-009: Forecast Resource Demand
**Given** I am logged in as an Operations Manager with at least 6 months of workforce and workload history in the HR and PM modules
**When** I navigate to AI Analysis > Predictive Analytics and select "Resource Demand Forecast"
**And** I set the forecast window to the next quarter
**Then** the system returns a staffing demand projection broken down by department and skill category
**And** the forecast highlights projected under-resourcing periods with recommended hiring or redeployment actions

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

#### TC-AI-010: View Model Accuracy Metrics
**Given** I am logged in as an IMS Administrator and at least one predictive model has been run with historical backtest data available
**When** I navigate to AI Analysis > Predictive Analytics > Model Accuracy
**Then** the system displays accuracy metrics for each active prediction model including Mean Absolute Error (MAE), precision, recall, and F1 score where applicable
**And** models with accuracy below the configured threshold are highlighted with a warning indicator

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

### Anomaly Detection

#### TC-AI-011: Detect Unusual Incident Patterns
**Given** I am logged in as a Health & Safety Manager and incident data spanning at least 90 days is present
**When** I navigate to AI Analysis > Anomaly Detection and select "Incident Pattern Analysis"
**And** I click "Scan for Anomalies"
**Then** the system identifies any statistically unusual clusters or spikes in incident frequency deviating more than two standard deviations from the rolling baseline
**And** each detected anomaly is displayed with a severity rating, affected time window, and probable contributing factors

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

#### TC-AI-012: Flag Statistical Outliers in KPI Data
**Given** I am logged in as a Quality Manager and at least 60 days of quality KPI data (defect rates, yield percentages) is recorded
**When** I navigate to AI Analysis > Anomaly Detection > KPI Outlier Detection and run the analysis
**Then** the system identifies KPI data points that exceed the configured outlier threshold (Z-score > 3 by default)
**And** each outlier is presented with its recorded value, expected range, and the date it was recorded

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

#### TC-AI-013: Alert on Regulatory Deadline Anomalies
**Given** I am logged in as a Compliance Officer and multiple regulatory submission deadlines are registered in the Regulatory Monitor module
**When** I navigate to AI Analysis > Anomaly Detection > Regulatory Deadline Alerts
**Then** the system cross-references actual submission completion rates against historical patterns and flags deadlines at risk of being missed
**And** anomalous deadline risk items generate a notification routed to the assigned compliance owner

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

#### TC-AI-014: Detect Environmental Reading Spikes
**Given** I am logged in as an Environmental Manager and continuous environmental monitoring readings (e.g. CO2 emissions, waste volumes) are present over the last 30 days
**When** I navigate to AI Analysis > Anomaly Detection > Environmental Readings
**And** I select the "Emissions" data stream and click "Detect Spikes"
**Then** the system identifies any readings that deviate significantly from the established baseline trend
**And** detected spikes are plotted on a time-series chart with the anomaly window highlighted and magnitude indicated

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

#### TC-AI-015: Configure Auto-Alert Rules for Anomaly Detection
**Given** I am logged in as an IMS Administrator
**When** I navigate to AI Analysis > Anomaly Detection > Alert Configuration
**And** I create a new auto-alert rule with trigger: "Incident frequency spike > 50% above 7-day average", notification target: "health-safety-manager@ims.local", and enable the rule
**Then** the system saves the rule and displays it in the active alert rules list
**And** the rule becomes active immediately and will trigger notifications when the condition is met

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

### AI Insights & Recommendations

#### TC-AI-016: Receive Root Cause Suggestions for Repeat Incidents
**Given** I am logged in as a Health & Safety Manager and at least three incidents of the same type have been recorded in the past 90 days
**When** I navigate to AI Analysis > Insights & Recommendations > Root Cause Analysis
**And** I select the recurring incident type and click "Analyse Root Causes"
**Then** the system returns a ranked list of probable root causes with supporting evidence drawn from incident descriptions, locations, and contributing factors
**And** each suggested root cause includes a confidence score and recommended investigation focus areas

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

#### TC-AI-017: Score CAPA Effectiveness
**Given** I am logged in as a Quality Manager and at least five closed CAPA records with recurrence data are present in the system
**When** I navigate to AI Analysis > Insights & Recommendations > CAPA Effectiveness
**And** I click "Score CAPA Effectiveness" for the current dataset
**Then** the system assigns an effectiveness score (0–100) to each evaluated CAPA based on recurrence rate, closure timeliness, and verification evidence quality
**And** CAPAs scoring below 60 are flagged as ineffective with specific improvement recommendations

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

#### TC-AI-018: Generate Benchmark Comparison Recommendations
**Given** I am logged in as an IMS Administrator with performance data across at least three operational departments
**When** I navigate to AI Analysis > Insights & Recommendations > Benchmark Comparison
**And** I select the "Safety Performance" benchmark category and click "Compare"
**Then** the system compares each department's safety KPIs against internal best-performers and industry benchmark targets
**And** the report provides specific, actionable recommendations for departments performing below benchmark

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

#### TC-AI-019: Summarise Regulatory Change Impact
**Given** I am logged in as a Compliance Manager and the Regulatory Monitor module contains at least one recently flagged regulatory change
**When** I navigate to AI Analysis > Insights & Recommendations > Regulatory Change Impact
**And** I select a recent regulatory change and click "Generate Impact Summary"
**Then** the system produces a plain-English summary of the regulatory change and its potential impact on current IMS processes and compliance obligations
**And** the summary identifies affected modules, recommended process changes, and a suggested implementation timeline

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

#### TC-AI-020: View Consolidated AI Insights Dashboard
**Given** I am logged in as an IMS Administrator
**When** I navigate to AI Analysis > Insights & Recommendations > Dashboard
**Then** the system displays a consolidated view of the top 10 AI-generated insights across all active modules ranked by priority score
**And** each insight card shows the affected module, recommended action, estimated impact level, and a link to the supporting analysis detail

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

### Model Configuration

#### TC-AI-021: Configure AI Provider (OpenAI / Anthropic)
**Given** I am logged in as an IMS Administrator and the AI Analysis configuration page is accessible
**When** I navigate to AI Analysis > Configuration > AI Provider
**And** I select "OpenAI" as the primary provider, enter a valid API key, and click "Save"
**Then** the system stores the provider selection and API key (masked on screen) and displays a "Connected" status indicator
**And** subsequent AI queries are routed to the OpenAI API as the primary provider

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

#### TC-AI-022: Adjust Confidence Thresholds
**Given** I am logged in as an IMS Administrator and the AI Analysis module is configured with a default confidence threshold of 0.70
**When** I navigate to AI Analysis > Configuration > Confidence Thresholds
**And** I set the minimum confidence threshold for anomaly detection to 0.80 and for predictive analytics to 0.75, then click "Save"
**Then** the system saves the updated thresholds and applies them to all subsequent AI operations
**And** results returned with confidence scores below the new thresholds are marked as "Low Confidence" and withheld from automated alerts

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

#### TC-AI-023: Enable and Disable Specific AI Features
**Given** I am logged in as an IMS Administrator
**When** I navigate to AI Analysis > Configuration > Feature Toggles
**And** I disable the "Predictive Analytics" feature toggle and click "Save"
**Then** the Predictive Analytics section is no longer accessible in the AI Analysis navigation for all users
**And** when I re-enable the toggle and save, the Predictive Analytics section becomes accessible again without requiring a service restart

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

#### TC-AI-024: View API Usage Statistics
**Given** I am logged in as an IMS Administrator and at least 10 AI queries have been processed since the last usage reset
**When** I navigate to AI Analysis > Configuration > API Usage
**Then** the system displays a usage dashboard showing total API calls, token consumption (prompt and completion tokens separately), estimated cost, and a breakdown by feature area (NLQ, Predictive, Anomaly, Insights)
**And** the data is filterable by date range with at minimum daily, weekly, and monthly views available

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

#### TC-AI-025: Test AI Provider Connectivity
**Given** I am logged in as an IMS Administrator and an AI provider API key is configured
**When** I navigate to AI Analysis > Configuration > AI Provider
**And** I click the "Test Connection" button
**Then** the system sends a lightweight test request to the configured AI provider API and returns a success or failure status within 10 seconds
**And** on success, the panel displays the provider name, model in use, and round-trip latency; on failure it displays the error code and a suggested remediation step

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

---

## Sign-Off
| Role | Name | Signature | Date |
|------|------|-----------|------|
| QA Lead | | | |
| Product Owner | | | |
| Technical Lead | | | |
| Business Stakeholder | | | |
