# UAT Test Plan: Information Security Module (ISO 27001:2022)

---
> **CONFIDENTIAL — TRADE SECRET**
> This document is the property of Nexara DMCC and contains confidential and
> proprietary information. Unauthorised disclosure is prohibited.
> © 2026 Nexara DMCC. All rights reserved.
---


**Document ID:** UAT-ISEC-001
**Version:** 1.0
**Date:** 2026-02-23
**Module:** Information Security (ISO 27001:2022 / Asset Register / SOA / Risk Assessment / Incidents / Audits)
**Environment:** Staging (api-infosec:4015 / web-infosec:3015)
**Tester:** **\*\*\*\***\_\_\_\_**\*\*\*\***
**Sign-Off Date:** **\*\*\*\***\_\_\_\_**\*\*\*\***

---

## Information Asset Register (5 scenarios)

### TC-ISEC-001: Register Information Asset with Reference Number

**Given** I am logged in as an Information Security Manager
**When** I navigate to InfoSec > Asset Register and click "New Asset"
**And** I fill in: Asset Name "Customer Database", Asset Type "DATABASE", Description "PostgreSQL database holding all customer PII and transaction records", Location "AWS EU-West-1", System "CRM Platform"
**Then** the system creates the asset with reference "IA-2026-XXXX" and status "ACTIVE"
**And** the asset appears in the Asset Register list with the auto-generated reference
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ISEC-002: Classify Information Asset

**Given** information asset "IA-2026-0001" (Customer Database) exists with no classification assigned
**When** I open the asset and set Classification to "CONFIDENTIAL", add classification justification "Contains customer PII subject to GDPR Article 5", and set Retention Period "7 years"
**Then** the asset classification is saved as "CONFIDENTIAL"
**And** the asset appears under the "CONFIDENTIAL" filter in the Asset Register
**And** assets classified RESTRICTED or CONFIDENTIAL are visually distinguished in the list view
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ISEC-003: Assign Asset Owner

**Given** information asset "IA-2026-0001" exists with no owner assigned
**When** I open the asset and set Asset Owner to "j.smith@company.com", Custodian to "it-team@company.com", and Review Due Date "2026-08-23"
**Then** the owner and custodian are saved against the asset
**And** the asset owner receives a notification of ownership assignment
**And** the asset appears in the "My Assets" view when logged in as "j.smith@company.com"
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ISEC-004: Link Information Asset to Risk

**Given** information asset "IA-2026-0001" (Customer Database) exists and risk "ISR-2026-0001" (Unauthorised database access) exists
**When** I open the asset and click "Link Risk", then select "ISR-2026-0001" from the risk register
**Then** the risk is linked to the asset and appears in the asset's "Associated Risks" section
**And** the risk record "ISR-2026-0001" shows the linked asset "IA-2026-0001" in its affected assets list
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ISEC-005: View Asset Inventory by Classification

**Given** the Asset Register contains assets with various classifications: 5 RESTRICTED, 12 CONFIDENTIAL, 18 INTERNAL, 7 PUBLIC
**When** I navigate to InfoSec > Asset Register and select the "By Classification" view
**Then** assets are grouped and counted by classification tier
**And** the summary shows: RESTRICTED (5), CONFIDENTIAL (12), INTERNAL (18), PUBLIC (7), Total (42)
**And** I can click any classification group to filter the list to only that tier
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Security Controls — Statement of Applicability (5 scenarios)

### TC-ISEC-006: View Statement of Applicability with All Annex A Controls

**Given** the InfoSec module is configured for ISO 27001:2022
**When** I navigate to InfoSec > Statement of Applicability
**Then** the SOA displays all 93 Annex A controls organised across 4 themes: Organisational (37), People (8), Physical (14), Technological (34)
**And** each control shows its clause reference (e.g., A.5.1), control title, applicable status, and implementation status
**And** the overall SOA completion percentage is displayed at the top
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ISEC-007: Mark Control as Implemented

**Given** the SOA is displayed and control "A.5.1 — Policies for information security" shows status "PLANNED"
**When** I click on the control and update Implementation Status to "IMPLEMENTED", enter Implementation Date "2026-01-15", and add Implementation Notes "Information security policy published on intranet and communicated to all staff"
**Then** the control status updates to "IMPLEMENTED" with the date and notes saved
**And** the overall SOA completion percentage increases accordingly
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ISEC-008: Add Implementation Evidence to Control

**Given** control "A.8.2 — Privileged access rights" is marked as "IMPLEMENTED" in the SOA
**When** I open the control and click "Add Evidence"
**And** I upload "privileged_access_policy_v2.pdf" with description "Approved privileged access management policy" and review date "2027-01-15"
**Then** the evidence document is linked to the control
**And** the control detail view shows the evidence count as 1
**And** the document is accessible from the control record
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ISEC-009: Mark Control as Not Applicable with Justification

**Given** control "A.7.3 — Clear desk and clear screen" is displayed in the SOA
**When** I click on the control, set Applicable to "NO", and enter Exclusion Justification "Organisation operates a fully remote workforce with no physical office premises; control is not applicable"
**Then** the control is marked as "NOT_APPLICABLE" with the justification stored
**And** the control no longer factors into the SOA completion percentage denominator
**And** the SOA displays the not-applicable controls in a separate section with their justifications
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ISEC-010: View SOA Completion Percentage

**Given** the SOA has 93 total Annex A controls, of which 12 are marked NOT_APPLICABLE, leaving 81 applicable controls; 54 are IMPLEMENTED, 20 are IN_PROGRESS, and 7 are PLANNED
**When** I view the Statement of Applicability summary header
**Then** the completion percentage is calculated as 54 / 81 = 66.7% (implemented out of applicable)
**And** a progress bar visually represents the completion level
**And** a breakdown by theme (Organisational, People, Physical, Technological) is shown
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## InfoSec Risk Assessment (5 scenarios)

### TC-ISEC-011: Create Risk with Threat, Vulnerability, and Impact

**Given** I am logged in as an Information Security Manager
**When** I navigate to InfoSec > Risk Assessment and click "New Risk"
**And** I fill in: Title "Unauthorised access to customer database via SQL injection", Threat "External attacker exploiting web application vulnerability", Vulnerability "Insufficient input validation on CRM web forms", Impact "Data breach of customer PII — regulatory fines and reputational damage", Affected Asset "IA-2026-0001"
**Then** the system creates the risk with reference "ISR-2026-XXXX" and status "OPEN"
**And** the risk appears in the Risk Register with the auto-generated reference
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ISEC-012: Calculate Inherent Risk Score (Likelihood x Impact)

**Given** risk "ISR-2026-0001" exists with no scores assigned
**When** I open the risk and set Inherent Likelihood to 4 (Likely) and Inherent Impact to 5 (Critical)
**Then** the inherent risk score is calculated as 4 × 5 = 20
**And** the risk is automatically classified as "CRITICAL" based on the score (score ≥ 16 = Critical)
**And** the risk matrix heat map highlights the (4, 5) cell in the critical zone (red)
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ISEC-013: Select Risk Treatment Option — MITIGATE

**Given** risk "ISR-2026-0001" with inherent risk score 20 (CRITICAL)
**When** I set Treatment Option to "MITIGATE", enter Treatment Plan "Implement WAF, conduct penetration testing, deploy parameterised queries across all CRM forms", set Treatment Owner "Head of IT Security", and Treatment Due Date "2026-05-01"
**Then** the treatment option "MITIGATE" is saved against the risk
**And** the treatment plan, owner, and due date are recorded
**And** the risk status changes to "TREATMENT_IN_PROGRESS"
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ISEC-014: Add Controls and Calculate Residual Risk

**Given** risk "ISR-2026-0001" in TREATMENT_IN_PROGRESS status with treatment plan defined
**When** I link controls "A.8.28 — Secure coding" and "A.8.23 — Web filtering" from the SOA to the risk
**And** I set Residual Likelihood to 2 (Unlikely) and Residual Impact to 4 (Major)
**Then** the residual risk score is calculated as 2 × 4 = 8
**And** the risk is re-classified as "HIGH" (score 8-15)
**And** the risk reduction is displayed as: inherent 20 → residual 8 (60% reduction)
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ISEC-015: Risk Register Filtering and Heat Map

**Given** the risk register contains 15 risks across various inherent risk levels (Critical: 3, High: 5, Medium: 4, Low: 3)
**When** I navigate to InfoSec > Risk Assessment and view the risk heat map
**Then** the heat map displays all 15 risks plotted on a 5×5 likelihood/impact grid
**And** I can filter the register by Risk Level "CRITICAL" and see only the 3 critical risks listed
**And** the filter also updates the heat map to highlight only the selected risk level
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Security Incidents (5 scenarios)

### TC-ISEC-016: Report a Security Incident

**Given** I am logged in as an IT Security Analyst
**When** I navigate to InfoSec > Incidents and click "Report Incident"
**And** I fill in: Title "Suspected phishing attack targeting finance team", Description "Three finance employees received convincing spear-phishing emails impersonating the CFO requesting urgent wire transfer", Incident Date "2026-02-23", Reporter "a.jones@company.com", Category "SOCIAL_ENGINEERING"
**Then** the incident is created with reference "SINC-2026-XXXX" and status "OPEN"
**And** the incident appears in the Security Incidents list
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ISEC-017: Classify Incident Severity (P1–P4)

**Given** security incident "SINC-2026-0001" (phishing attack) exists with status "OPEN" and no severity assigned
**When** I open the incident and set Severity to "P2" with justification "No confirmed data loss but multiple employees targeted; potential for financial fraud if not contained"
**Then** the severity is saved as "P2" against the incident
**And** P1 and P2 incidents are highlighted prominently in the incident list (e.g., red/amber banner)
**And** the incident triggers an escalation notification to the Information Security Manager
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ISEC-018: Assign Incident to Security Team

**Given** security incident "SINC-2026-0001" with severity P2 exists in "OPEN" status
**When** I click "Assign" and set Assigned To "security-team@company.com", Incident Commander "r.patel@company.com", and Target Resolution Date "2026-02-25"
**Then** the assignment details are saved against the incident
**And** the assigned team members receive a notification of the assignment
**And** the incident status changes to "IN_PROGRESS"
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ISEC-019: Link Affected Information Assets to Incident

**Given** security incident "SINC-2026-0001" is in "IN_PROGRESS" status
**When** I open the incident and click "Link Affected Assets"
**And** I select "IA-2026-0005" (Finance Email System) and "IA-2026-0006" (CFO Email Account) from the asset register
**Then** both assets are linked to the incident
**And** the incident detail view shows the affected assets count as 2
**And** each linked asset record shows an active security incident flag
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ISEC-020: Close Incident with Lessons Learned and Control Improvements

**Given** security incident "SINC-2026-0001" has been fully investigated and remediated
**When** I click "Close Incident" and fill in: Root Cause "Absence of multi-factor authentication on email accounts enabled account spoofing to appear credible", Lessons Learned "MFA must be enforced for all email accounts; finance team requires additional phishing awareness training", Control Improvements ["Enable MFA on all O365 accounts (A.8.5)", "Quarterly phishing simulation exercises (A.6.3)"], Closure Date "2026-02-26"
**Then** the incident status changes to "CLOSED" with the closure date, root cause, lessons learned, and control improvements recorded
**And** the control improvement actions are automatically raised as tasks linked to the relevant SOA controls
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Audits and Compliance (5 scenarios)

### TC-ISEC-021: Schedule ISO 27001 Internal Audit

**Given** I am logged in as an Information Security Manager
**When** I navigate to InfoSec > Audits and click "Schedule Audit"
**And** I fill in: Audit Title "ISO 27001:2022 Internal Audit — Clause A.5 & A.8 Controls", Audit Type "INTERNAL", Standard "ISO 27001:2022", Scope "Organisational and Technological controls (Annex A.5 and A.8)", Lead Auditor "c.taylor@company.com", Planned Start "2026-03-10", Planned End "2026-03-12"
**Then** the audit is created with reference "ISEC-AUD-2026-XXXX" and status "SCHEDULED"
**And** the audit appears in the Audits calendar and list view
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ISEC-022: Add Clause Checklist (A.5–A.8)

**Given** audit "ISEC-AUD-2026-0001" exists with status "SCHEDULED" and scope covering Annex A.5 and A.8
**When** I open the audit and click "Build Checklist"
**And** I add checklist items for key Annex A.5 controls (A.5.1 Policies, A.5.2 Roles, A.5.9 Inventory, A.5.15 Access control, A.5.23 Cloud services) and Annex A.8 controls (A.8.2 Privileged access, A.8.5 Secure authentication, A.8.7 Malware protection, A.8.28 Secure coding)
**Then** the checklist is saved with 9 items covering both A.5 and A.8 clauses
**And** each checklist item shows the clause reference, control title, and fields for audit evidence and finding
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ISEC-023: Record Major Nonconformance Finding

**Given** audit "ISEC-AUD-2026-0001" is in "IN_PROGRESS" status and checklist item "A.8.5 — Secure authentication" is being assessed
**When** I click "Add Finding" for the A.8.5 checklist item and fill in: Finding Type "MAJOR_NONCONFORMANCE", Title "MFA not enforced for privileged accounts", Description "Audit evidence confirms that 14 of 22 privileged system accounts do not have multi-factor authentication enabled, contrary to the organisation's stated access control policy (ISP-ACC-003)", Evidence References "IT-USER-LIST-20260310, ISP-ACC-003 v2.1"
**Then** the finding is saved with type "MAJOR_NONCONFORMANCE" and linked to checklist item A.8.5
**And** the audit summary shows 1 major nonconformance
**And** the finding is flagged for mandatory CAPA action
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ISEC-024: Raise CAPA from Audit Finding

**Given** audit "ISEC-AUD-2026-0001" has a major nonconformance finding "MFA not enforced for privileged accounts"
**When** I click "Raise CAPA" on the finding and fill in: CAPA Title "Enable MFA for all privileged accounts", Root Cause "MFA enforcement was not included in the privileged account provisioning procedure", Corrective Action "Update IT-PROC-PRIV-001 to mandate MFA at provisioning; retrospectively enable MFA on all 14 non-compliant accounts", Responsible Person "it-manager@company.com", Due Date "2026-04-10"
**Then** a CAPA record is created with reference "ISEC-CAPA-2026-XXXX" and linked to the audit finding
**And** the finding detail view shows the linked CAPA reference and its current status
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-ISEC-025: Verify Audit Closure Requires All CAPAs Resolved

**Given** audit "ISEC-AUD-2026-0001" has 1 major nonconformance with linked CAPA "ISEC-CAPA-2026-0001" still in "OPEN" status
**When** I attempt to close the audit by clicking "Close Audit"
**Then** the system blocks closure and displays a validation message: "Audit cannot be closed: 1 linked CAPA(s) are still open. All CAPAs must be resolved before the audit can be closed."
**When** I mark CAPA "ISEC-CAPA-2026-0001" as "CLOSED" with verified effectiveness evidence
**And** I reattempt to close the audit
**Then** the audit status changes to "CLOSED" with the closure date recorded
**And** the audit appears in the closed audits view with all findings and CAPA references intact
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Sign-Off

| Role                  | Name | Signature | Date |
| --------------------- | ---- | --------- | ---- |
| InfoSec Manager       |      |           |      |
| Product Owner         |      |           |      |
| UAT Lead              |      |           |      |
| Regulatory/Compliance |      |           |      |

**Overall Result:** [ ] PASS -- All scenarios passed / [ ] FAIL -- See notes above
**Release Recommendation:** [ ] Approved for Production / [ ] Requires remediation
