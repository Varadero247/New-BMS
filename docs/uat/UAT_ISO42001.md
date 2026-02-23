# UAT Test Plan: AI Management System (ISO 42001:2023)

**Document ID:** UAT-AI42-001
**Version:** 1.0
**Date:** 2026-02-23
**Module:** AI Management System (ISO 42001:2023)
**Environment:** Staging (api-iso42001:4023 / web-iso42001:3024)
**Tester:** ________________________________________
**Sign-Off Date:** ________________________________________

---

## AI System Register (5 scenarios)

### TC-AI42-001: Register AI System

**Given** I am logged in as an AI Governance Manager
**When** I navigate to ISO 42001 > AI Systems and click "Register AI System"
**And** I fill in: Name "Predictive Maintenance Recommender", Purpose "Analyses sensor data to predict equipment failure and recommend maintenance interventions", Risk Level "HIGH", Category "PREDICTIVE_ANALYTICS", Vendor "Internal", Deployment Environment "PRODUCTION"
**Then** the AI system is registered with a unique system reference
**And** the status defaults to "INACTIVE" pending activation
**And** the system appears in the AI System Inventory list under "HIGH" risk level
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AI42-002: Assign AI Owner to Registered System

**Given** an AI system "Predictive Maintenance Recommender" with no owner assigned exists
**When** I open the AI system record, click "Assign Owner", and select "Dr. A. Singh – Head of Data Science"
**Then** the aiOwner field is updated to "Dr. A. Singh"
**And** the owner receives a notification confirming responsibility for the AI system
**And** the AI system appears in Dr. A. Singh's "My AI Systems" dashboard view
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AI42-003: Update AI System to ACTIVE Status

**Given** an AI system "Predictive Maintenance Recommender" with status "INACTIVE" and an assigned owner exists
**When** I open the AI system and click "Activate"
**And** I confirm that an impact assessment has been completed and controls are in place
**Then** the AI system status changes to "ACTIVE"
**And** the activation date is recorded
**And** the system appears in the "Active AI Systems" filter view
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AI42-004: View AI System Inventory

**Given** multiple AI systems have been registered across different risk levels (LOW, MEDIUM, HIGH, CRITICAL) and statuses
**When** I navigate to ISO 42001 > AI System Inventory
**Then** a table lists all registered AI systems with columns: Name, Risk Level, Status, Owner, Deployment Environment, Registration Date
**And** I can filter by Risk Level and Status
**And** the total count of AI systems is displayed, broken down by risk level
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AI42-005: Decommission AI System

**Given** an AI system "Legacy Fraud Scoring Model v1" with status "ACTIVE" exists
**When** I open the AI system, click "Decommission", enter reason "Replaced by v2 model with improved fairness metrics", and confirm
**Then** the AI system status changes to "DECOMMISSIONED"
**And** the decommission date and reason are recorded
**And** the system no longer appears in the "Active AI Systems" view but is accessible in the full inventory with DECOMMISSIONED filter
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Risk Assessments (5 scenarios)

### TC-AI42-006: Create Risk Assessment with Score Calculation

**Given** an AI system "Predictive Maintenance Recommender" with status "ACTIVE" exists
**When** I navigate to ISO 42001 > Risk Assessments and click "New Assessment"
**And** I fill in: AI System "Predictive Maintenance Recommender", Risk Description "Model recommends unnecessary maintenance, causing operational disruption", Likelihood "POSSIBLE" (score 3), Impact "MAJOR" (score 4)
**Then** the risk score is calculated as 12 (3 × 4)
**And** the risk level is automatically assigned as "HIGH" (score 12 falls in the HIGH band)
**And** the assessment is saved with status "DRAFT"
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AI42-007: Verify Risk Score Calculation

**Given** a risk assessment form is open with various likelihood and impact combinations
**When** I set Likelihood to "LIKELY" (score 4) and Impact to "CRITICAL" (score 5)
**Then** the risk score displays 20 in real time
**And** the risk level label updates to "CRITICAL" (score >= 20)
**When** I change Impact to "MINOR" (score 2)
**Then** the risk score updates to 8 and the risk level updates to "LOW"
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AI42-008: Add Control Measures to Risk Assessment

**Given** a risk assessment for "Predictive Maintenance Recommender" with inherent risk score 12 (HIGH) exists in DRAFT status
**When** I open the assessment and click "Add Control"
**And** I add: Control "Model output confidence threshold set to 0.85 — recommendations below threshold require human review", Control Type "PREVENTIVE", Owner "D. Osei – Maintenance Supervisor"
**And** I set residual Likelihood "UNLIKELY" (score 2) and residual Impact "MODERATE" (score 3)
**Then** the control is saved against the assessment
**And** the residual risk score is calculated as 6 (2 × 3) with risk level "LOW"
**And** the risk reduction is displayed (12 → 6, 50% reduction)
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AI42-009: Approve Risk Assessment

**Given** a risk assessment with controls defined is in DRAFT status
**When** I click "Submit for Approval" and then "Approve" (as an AI Governance Manager)
**And** I enter approval notes "Controls are adequate; residual risk accepted"
**Then** the assessment status changes to "APPROVED"
**And** the approver name and approval date are recorded
**And** the approved assessment is visible in the AI system's risk register
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AI42-010: Update Risk to Residual Level After Controls

**Given** an approved risk assessment with inherent risk "HIGH" and controls applied reducing risk to "LOW" exists
**When** I view the risk assessment summary
**Then** the assessment displays both the inherent risk (score 12, HIGH) and the residual risk (score 6, LOW)
**And** the AI system's risk register shows the current (residual) risk level as "LOW"
**And** the inherent risk is preserved for audit trail purposes
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Impact Assessments (5 scenarios)

### TC-AI42-011: Create Impact Assessment for High-Risk AI System

**Given** an AI system "Predictive Maintenance Recommender" with risk level "HIGH" and status "ACTIVE" exists
**When** I navigate to ISO 42001 > Impact Assessments and click "New Assessment"
**And** I select AI System "Predictive Maintenance Recommender", Assessment Type "AI_IMPACT", Scope "Full deployment impact including safety, fairness, and transparency"
**Then** the impact assessment is created with status "DRAFT"
**And** the assessment is linked to the AI system
**And** assessment sections are pre-populated (e.g. Safety Impact, Fairness & Bias, Transparency, Data Privacy, Human Oversight)
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AI42-012: Complete Impact Assessment Sections

**Given** an impact assessment "DRAFT" with 5 sections exists
**When** I open each section and complete the required fields:
  - Safety Impact: "Low — predictive recommendations reviewed by qualified engineer before action"
  - Fairness & Bias: "Not applicable — asset data only, no personal attributes"
  - Transparency: "Model outputs include confidence score and feature importance ranking"
  - Data Privacy: "No personal data processed; industrial sensor data only"
  - Human Oversight: "All HIGH-confidence alerts require supervisor sign-off before work order creation"
**Then** all 5 sections are marked as completed
**And** the overall assessment completion percentage reaches 100%
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AI42-013: Submit Impact Assessment for Approval

**Given** a fully completed impact assessment in DRAFT status exists
**When** I click "Submit for Approval"
**Then** the assessment status changes to "PENDING_APPROVAL"
**And** the designated approver receives a notification to review
**And** the submitter can no longer edit the assessment while it is pending
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AI42-014: Approve Impact Assessment (PENDING to APPROVED)

**Given** an impact assessment with status "PENDING_APPROVAL" for AI system "Predictive Maintenance Recommender" exists
**When** I log in as an AI Ethics Officer and navigate to the pending assessment
**And** I click "Approve", enter sign-off notes "Impact is acceptable; transparency and oversight controls confirmed"
**Then** the assessment status changes from "PENDING_APPROVAL" to "APPROVED"
**And** the approval date and approver are recorded
**And** the AI system record shows the linked approved impact assessment
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AI42-015: Verify Double-Approve Returns 400

**Given** an impact assessment has already been approved by the AI Ethics Officer
**When** the same or another approver attempts to approve it again via the API (PUT/PATCH to the approval endpoint)
**Then** the API returns HTTP 400 with an error message indicating the assessment is already in APPROVED status
**And** the assessment status remains "APPROVED" without change
**And** the duplicate approval attempt is logged in the audit trail
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## AI Controls (SOA) (5 scenarios)

### TC-AI42-016: View Statement of Applicability for ISO 42001 Controls

**Given** the system has been configured with ISO 42001:2023 controls (Annex A)
**When** I navigate to ISO 42001 > Statement of Applicability
**Then** a full list of ISO 42001 controls is displayed, organised by domain (e.g. Organisational Controls, Technical Controls, People Controls)
**And** each control shows: Control Reference, Control Name, Applicability (IN_SCOPE / OUT_OF_SCOPE), Implementation Status, and Responsible Owner
**And** the overall SOA completion percentage is displayed
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AI42-017: Mark Control as IMPLEMENTED

**Given** an ISO 42001 control "A.6.2.2 – AI system risk assessment process" with status "PLANNED" exists in the SOA
**When** I open the control, click "Update Status", and change Implementation Status from "PLANNED" to "IMPLEMENTED"
**And** I enter implementation date "2026-02-01" and responsible owner "AI Governance Manager"
**Then** the control status updates to "IMPLEMENTED"
**And** the SOA completion percentage increases accordingly
**And** the change is recorded with a timestamp in the control history
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AI42-018: Add Implementation Evidence to Control

**Given** a control "A.6.2.2 – AI system risk assessment process" with status "IMPLEMENTED" exists
**When** I open the control, click "Add Evidence", and enter: Evidence Type "PROCEDURE", Reference "AI-PROC-007 – AI Risk Assessment Procedure v2.1", Date "2026-01-15", Added By "AI Governance Manager"
**Then** the evidence record is saved against the control
**And** the control card shows an evidence count badge
**And** the evidence reference is displayed in the control detail view
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AI42-019: Filter SOA Controls by Domain

**Given** the SOA contains controls across multiple domains (Organisational, Technical, People, Physical)
**When** I apply the domain filter "Technical Controls"
**Then** only controls within the Technical Controls domain are displayed
**And** the count in the filter badge reflects the number of Technical Controls
**And** I can further filter by Implementation Status within the domain view
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AI42-020: View SOA Completion Percentage

**Given** the SOA has a mix of IMPLEMENTED, IN_PROGRESS, PLANNED, and NOT_APPLICABLE controls
**When** I navigate to the SOA summary or dashboard panel
**Then** the overall completion percentage is displayed (IMPLEMENTED controls ÷ IN_SCOPE controls × 100)
**And** a progress bar or doughnut chart visualises the completion status
**And** a breakdown by domain shows the percentage implemented per domain
**And** NOT_APPLICABLE controls are excluded from the denominator
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## AI Incidents & Policies (5 scenarios)

### TC-AI42-021: Report AI Incident (Bias / Hallucination / Data Breach)

**Given** I am logged in as an AI System User or AI Governance Manager
**When** I navigate to ISO 42001 > AI Incidents and click "Report Incident"
**And** I fill in: AI System "Predictive Maintenance Recommender", Incident Type "HALLUCINATION", Title "Model recommended maintenance for asset with no sensor anomalies", Description "On 2026-02-20, the model generated a HIGH-confidence alert for asset ASSET-2026-0007 with all sensor readings in normal range", Date Occurred "2026-02-20"
**Then** the incident is created with a unique reference
**And** the incident status defaults to "OPEN"
**And** the incident appears in the AI Incidents list
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AI42-022: Assign Severity to AI Incident

**Given** an AI incident with status "OPEN" and no severity assigned exists
**When** I open the incident, click "Edit", and set Severity to "MODERATE"
**And** I assign the incident to "Dr. A. Singh" for investigation
**Then** the incident severity is updated to "MODERATE"
**And** the incident is assigned to Dr. A. Singh
**And** a notification is sent to the assigned investigator
**And** the incident appears in Dr. A. Singh's open investigations queue
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AI42-023: Create AI Ethics Policy

**Given** I am logged in as an AI Governance Manager
**When** I navigate to ISO 42001 > Policies and click "New Policy"
**And** I fill in: Policy Name "AI Ethics and Responsible Use Policy", Policy Type "ETHICS", Version "1.0", Effective Date "2026-03-01", Review Date "2027-03-01", Owner "Chief AI Officer", Status "DRAFT"
**And** I enter the policy content covering: fairness, transparency, accountability, human oversight, and data privacy
**Then** the policy is created with status "DRAFT"
**And** the policy reference is generated
**And** the policy appears in the Policy Register under "AI Ethics" category
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AI42-024: Link Policy to AI Systems

**Given** an AI Ethics Policy in PUBLISHED status and multiple AI systems in the inventory exist
**When** I open the policy and click "Link AI Systems"
**And** I select AI systems: "Predictive Maintenance Recommender", "Customer Churn Predictor", "Document Classification Engine"
**Then** all 3 AI systems are linked to the policy
**And** each linked AI system record shows the policy reference under its "Policies" tab
**And** the policy displays a linked systems count of 3
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AI42-025: Verify Incident Dashboard Counts

**Given** AI incidents exist across different types (BIAS, HALLUCINATION, DATA_BREACH, PERFORMANCE_DEGRADATION) and statuses (OPEN, INVESTIGATING, CLOSED)
**When** I navigate to ISO 42001 > Dashboard
**Then** the incident KPI tiles display: Total Open Incidents, Incidents by Type (pie or bar chart), Incidents by Severity, and Incidents Closed This Month
**And** clicking any tile or chart segment drills down to the filtered incident list
**And** the dashboard counts match the total records in the Incidents list for the same filters
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
