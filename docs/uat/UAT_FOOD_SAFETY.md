# UAT Test Plan: Food Safety Module (ISO 22000:2018 / HACCP)

---
> **CONFIDENTIAL — TRADE SECRET**
> This document is the property of Nexara DMCC and contains confidential and
> proprietary information. Unauthorised disclosure is prohibited.
> © 2026 Nexara DMCC. All rights reserved.
---


**Document ID:** UAT-FS-001
**Version:** 1.0
**Date:** 2026-02-23
**Module:** Food Safety (ISO 22000:2018 / HACCP)
**Environment:** Staging (api-food-safety:4019 / web-food-safety:3020)
**Tester:** ****************\_\_\_\_****************
**Sign-Off Date:** ****************\_\_\_\_****************

---

## Critical Control Points (CCPs) (5 scenarios)

### TC-FS-001: Create CCP for Pasteurisation

**Given** I am logged in as a Food Safety Manager
**When** I navigate to Food Safety > HACCP > Critical Control Points and click "New CCP"
**And** I enter: Name "Pasteurisation", Process Step "Heat Treatment", Hazard Type "BIOLOGICAL", Critical Limit "Minimum 72°C for 15 seconds", Monitoring Method "Continuous temperature probe", Corrective Action "Stop line, isolate product, notify supervisor", Verification Frequency "DAILY"
**Then** the system creates the CCP with reference "CCP-2602-XXXX" and status "ACTIVE"
**And** the CCP appears in the HACCP plan with critical limit and monitoring details recorded
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-FS-002: Set Monitoring Method to Continuous Probe

**Given** a CCP "CCP-2602-0001" (Pasteurisation) exists with status "ACTIVE"
**When** I edit the CCP and set Monitoring Method to "Continuous automated temperature probe", Monitoring Frequency to "CONTINUOUS", and Responsible Person to "J. Davies"
**Then** the CCP monitoring record is updated with the method and frequency
**And** the HACCP plan displays the monitoring details under the Pasteurisation CCP
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-FS-003: Define Corrective Action for CCP Deviation

**Given** a CCP "CCP-2602-0001" (Pasteurisation) is active with critical limit "72°C for 15s"
**When** I add a corrective action: Trigger "Temperature drops below 72°C", Action "Immediately halt production line, quarantine product batch, re-route to rework or disposal, recalibrate probe, document deviation in non-conformance log"
**Then** the corrective action is linked to the CCP and stored with the HACCP plan
**And** the corrective action appears in the deviation response section of the CCP record
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-FS-004: Verify Active CCP Appears in HACCP Plan

**Given** CCP "CCP-2602-0001" (Pasteurisation) exists with status "ACTIVE"
**When** I navigate to Food Safety > HACCP Plan overview
**Then** the Pasteurisation CCP is listed with its hazard type, critical limit, monitoring method, and corrective action
**And** the HACCP plan summary shows the CCP count includes this record
**And** only ACTIVE CCPs are shown in the active plan view
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-FS-005: Update CCP Monitoring Frequency from CONTINUOUS to HOURLY

**Given** a CCP "CCP-2602-0001" with Monitoring Frequency "CONTINUOUS"
**When** I edit the CCP and change Monitoring Frequency to "HOURLY" and enter a change justification note
**Then** the CCP record is updated with Monitoring Frequency "HOURLY"
**And** the change is reflected in the HACCP plan
**And** the previous frequency is no longer shown as the active setting
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Allergen Management (5 scenarios)

### TC-FS-006: Register Allergen with HIGH Severity

**Given** I am logged in as a Food Safety Manager
**When** I navigate to Food Safety > Allergen Management and click "Add Allergen"
**And** I enter: Name "Peanuts", Allergen Code "PNUT-001", Category "TREE_NUT", Severity "HIGH", Regulatory Status "EU 1169/2011 Annex II", Notes "Major 14 declarable allergen under EU law"
**Then** the allergen is registered in the system with the specified details and severity "HIGH"
**And** the allergen appears in the allergen register with a warning indicator for HIGH severity
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-FS-007: Link Allergen to a Product

**Given** allergen "Peanuts" (PNUT-001) is registered and product "Granola Bar — Mixed Nut" exists in the product register
**When** I navigate to the product record and click "Add Allergen Link"
**And** I select allergen "Peanuts" and set Presence Type "CONTAINS", Threshold "INTENTIONAL"
**Then** the allergen is linked to the product with presence type "CONTAINS"
**And** the product allergen matrix shows peanuts with a "CONTAINS" indicator
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-FS-008: Verify Declaration Required Flag

**Given** allergen "Peanuts" is linked to product "Granola Bar — Mixed Nut" with Presence Type "CONTAINS"
**When** I view the product allergen summary
**Then** the declarationRequired flag is set to true for the peanut allergen link
**And** the product record displays a "Declaration Required" badge against the peanut allergen
**And** the system prevents saving the product without a completed allergen declaration
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-FS-009: Update Allergen Status

**Given** allergen "Peanuts" (PNUT-001) is registered with status "ACTIVE"
**When** I edit the allergen record and change Status to "UNDER_REVIEW" with a review note "Pending updated regulatory guidance on threshold limits"
**Then** the allergen status is updated to "UNDER_REVIEW"
**And** the allergen register displays the updated status and review note
**And** any products linked to this allergen are flagged for review
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-FS-010: View Allergen Matrix Report

**Given** multiple products exist with various allergen links (peanuts, gluten, dairy, soy, eggs)
**When** I navigate to Food Safety > Reports > Allergen Matrix
**Then** a matrix is displayed with products as rows and allergens as columns
**And** each cell indicates "CONTAINS", "MAY CONTAIN", or "-" for each product/allergen combination
**And** the matrix can be exported to PDF or CSV
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## HACCP Audit (5 scenarios)

### TC-FS-011: Schedule BRC External Audit

**Given** I am logged in as a Food Safety Manager
**When** I navigate to Food Safety > Audits and click "Schedule Audit"
**And** I enter: Title "BRC Global Standard Audit 2026", Audit Type "EXTERNAL", Standard "BRC Food Safety Issue 9", Lead Auditor "BRC Certification Body", Scheduled Date "2026-05-12", Scope "All food manufacturing processes"
**Then** the audit is created with reference "FSAUD-2602-XXXX" and status "SCHEDULED"
**And** the audit appears in the upcoming audits calendar
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-FS-012: Record Audit Finding

**Given** an audit "FSAUD-2602-0001" (BRC External Audit) is in status "IN_PROGRESS"
**When** I click "Add Finding" and enter: Clause "4.8.2", Finding Type "MAJOR_NON_CONFORMANCE", Description "CCP monitoring records incomplete for three shifts — temperature logs missing for 06:00–14:00 shift on 2026-05-10", Due Date "2026-06-12"
**Then** the finding is recorded and linked to the audit
**And** the audit record shows the finding count incremented
**And** the finding appears with status "OPEN"
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-FS-013: Close Finding with Corrective Action

**Given** audit finding "FSAUD-2602-0001-F01" (Major NC — incomplete CCP monitoring records) is OPEN
**When** I click "Close Finding" and enter: Root Cause "Training gap — new operatives not aware of mandatory log completion requirement", Corrective Action "Immediate retraining of all shift operatives on CCP monitoring log procedure; supervisor sign-off added to shift handover checklist", Closure Date "2026-06-10"
**Then** the finding status changes to "CLOSED"
**And** the closure date, root cause, and corrective action are recorded
**And** the audit non-conformance count is updated to reflect the closed finding
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-FS-014: Approve Audit Report

**Given** all findings for audit "FSAUD-2602-0001" have been closed or accepted
**When** the Food Safety Manager clicks "Approve Report" and enters approval notes and digital sign-off name
**Then** the audit status changes to "CLOSED"
**And** the approval date and approver name are recorded on the audit record
**And** the audit report is locked for amendment
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-FS-015: Verify Audit History

**Given** multiple audits have been completed across different audit types (INTERNAL, EXTERNAL, SUPPLIER)
**When** I navigate to Food Safety > Audits > History
**Then** all completed audits are listed with their reference, type, date, lead auditor, and outcome
**And** I can filter by Audit Type, Year, and Status
**And** each audit record links to its findings and approval details
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Product Management (5 scenarios)

### TC-FS-016: Register Product with Shelf Life and Storage Conditions

**Given** I am logged in as a Food Safety Manager
**When** I navigate to Food Safety > Products and click "New Product"
**And** I enter: Name "Pasteurised Whole Milk", SKU "PWM-1L-001", Category "DAIRY", Shelf Life Days 14, Storage Temperature "2°C to 4°C", Storage Conditions "Refrigerate immediately; keep away from direct light; do not freeze", Status "ACTIVE"
**Then** the product is registered with the reference "PROD-2602-XXXX" and all specified details
**And** the product appears in the product register with shelf life and storage conditions visible
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-FS-017: Link Product to Allergens

**Given** product "Pasteurised Whole Milk" (PWM-1L-001) exists in the product register
**When** I navigate to the product and add allergen links: "Milk/Dairy" with Presence Type "CONTAINS" and "Soy" with Presence Type "MAY_CONTAIN" (shared facility)
**Then** both allergen links are saved on the product record
**And** the product allergen matrix shows two entries with their respective presence types
**And** declarationRequired is true for both allergens
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-FS-018: Update Product Shelf Life Days

**Given** product "Pasteurised Whole Milk" (PWM-1L-001) with Shelf Life Days 14
**When** I edit the product and change Shelf Life Days to 10 following a process review finding
**Then** the product record is updated with Shelf Life Days 10
**And** the shelf life change is reflected in the product detail view
**And** any associated HACCP plan references display the updated shelf life value
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-FS-019: View Product Allergen Matrix

**Given** multiple products exist (dairy, bakery, confectionery) with various allergen links
**When** I navigate to Food Safety > Products > Allergen Matrix
**Then** a matrix is displayed listing all active products and their allergen presence status
**And** products with "CONTAINS" are highlighted differently from "MAY_CONTAIN"
**And** I can filter the matrix by product category or allergen type
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-FS-020: Deactivate a Discontinued Product

**Given** product "Seasonal Fruit Yoghurt" exists with status "ACTIVE"
**When** I edit the product and change Status to "DISCONTINUED" with a note "Product line withdrawn from 2026-03-01"
**Then** the product status changes to "DISCONTINUED"
**And** the product no longer appears in the default active product list
**And** the product remains accessible via the "DISCONTINUED" filter with its full history preserved
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Environmental Monitoring (5 scenarios)

### TC-FS-021: Create Environmental Monitoring Point

**Given** I am logged in as a Food Safety Manager
**When** I navigate to Food Safety > Environmental Monitoring and click "New Monitoring Point"
**And** I enter: Location "Production Zone A — Near Filling Line", Test Type "ATP Bioluminescence", Frequency "WEEKLY", Alert Threshold "Pass/Fail — RLU > 500 triggers corrective action", Responsible Person "Hygiene Supervisor"
**Then** the monitoring point is created with reference "EMP-2602-XXXX" and status "ACTIVE"
**And** the monitoring point appears on the environmental monitoring schedule
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-FS-022: Record Monitoring Result (PASS)

**Given** monitoring point "EMP-2602-0001" (Production Zone A) exists and is ACTIVE
**When** I click "Record Result" and enter: Sample Date "2026-02-23", Tested By "T. Hughes", RLU Reading 210, Result "PASS", Notes "Within acceptable range"
**Then** the result is saved and linked to the monitoring point
**And** the result status shows "PASS" with a green indicator
**And** no corrective action is triggered for a PASS result
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-FS-023: Trigger Corrective Action on FAIL Result

**Given** monitoring point "EMP-2602-0001" (Production Zone A) exists and is ACTIVE
**When** I record a result with RLU Reading 780, Result "FAIL", Notes "High ATP reading near filling nozzle — possible residue accumulation"
**Then** the result is saved with status "FAIL" and a red indicator
**And** the system automatically raises a corrective action with reference "CA-2602-XXXX" linked to this FAIL result
**And** a notification is sent to the Hygiene Supervisor for immediate attention
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-FS-024: View Monitoring Trend

**Given** monitoring point "EMP-2602-0001" has at least 8 recorded results over the past two months
**When** I navigate to the monitoring point detail and select "View Trend"
**Then** a trend chart is displayed showing RLU readings over time
**And** PASS results are shown in green and FAIL results in red
**And** the trend identifies any upward pattern that may indicate a hygiene deterioration risk
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-FS-025: Verify Dashboard CCP Compliance Score

**Given** all active CCPs have recent monitoring results recorded within their required frequency
**When** I navigate to the Food Safety dashboard home page
**Then** the dashboard displays a CCP Compliance Score as a percentage
**And** any CCPs with overdue monitoring records are flagged in red
**And** the dashboard shows total active CCPs, compliant CCPs, and open corrective actions count
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Sign-Off

| Role                  | Name | Signature | Date |
| --------------------- | ---- | --------- | ---- |
| Food Safety Manager   |      |           |      |
| Product Owner         |      |           |      |
| UAT Lead              |      |           |      |
| Regulatory/Compliance |      |           |      |

**Overall Result:** [ ] PASS -- All scenarios passed / [ ] FAIL -- See notes above
**Release Recommendation:** [ ] Approved for Production / [ ] Requires remediation
