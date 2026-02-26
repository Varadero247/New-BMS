# UAT Test Plan: Asset Management Module

---
> **CONFIDENTIAL — TRADE SECRET**
> This document is the property of Nexara DMCC and contains confidential and
> proprietary information. Unauthorised disclosure is prohibited.
> © 2026 Nexara DMCC. All rights reserved.
---


**Document ID:** UAT-AST-001
**Version:** 1.0
**Date:** 2026-02-23
**Module:** Asset Management
**Environment:** Staging (api-assets:4030 / web-assets:3034)
**Tester:** **\*\*\*\***\_\_\_\_**\*\*\*\***
**Sign-Off Date:** **\*\*\*\***\_\_\_\_**\*\*\*\***

---

## Asset Register (5 scenarios)

### TC-AST-001: Register Asset with Serial Number, Purchase Date, and Purchase Cost

**Given** I am logged in as a Facilities Manager
**When** I navigate to Assets > Register and click "New Asset"
**And** I fill in: Asset Name "Mitutoyo CMM Unit 3", Category "Measurement Equipment", Serial Number "CMM-MT-2024-003", Purchase Date "2024-06-15", Purchase Cost "£87,500", Manufacturer "Mitutoyo", Model "CRYSTA-Apex S 776"
**Then** the system creates the asset record with reference "AST-2602-XXXX" and status "ACTIVE"
**And** all entered fields are stored correctly and displayed on the asset detail page
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AST-002: Assign Asset to Department and Responsible Person

**Given** an asset "AST-2602-0001" exists with no department or owner assigned
**When** I open the asset record and click "Assign"
**And** I select Department "Quality Assurance" and Responsible Person "R. Chen (Quality Engineer)"
**Then** the asset record displays the assigned department and responsible person
**And** the assignment change is logged in the asset's audit history
**And** R. Chen receives a notification of the new asset assignment
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AST-003: View Asset Register with Category Filter

**Given** multiple assets are registered across categories: Measurement Equipment, Plant & Machinery, IT Equipment, and Vehicles
**When** I navigate to Assets > Register and apply filter Category = "Measurement Equipment"
**Then** only assets in the "Measurement Equipment" category are displayed
**And** the list shows asset reference, name, serial number, status, and department columns
**And** the count reflects only the filtered category
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AST-004: Generate Asset QR Code / Barcode

**Given** an asset "AST-2602-0001" exists in the register
**When** I open the asset record and click "Generate QR Code"
**Then** a QR code is generated encoding the asset reference "AST-2602-0001"
**And** scanning the QR code navigates to the asset's detail page
**And** a barcode (Code 128) is also available for download and printing on a label
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AST-005: View Total Asset Value by Category

**Given** assets with recorded purchase costs are registered across multiple categories
**When** I navigate to Assets > Reports and select "Total Asset Value by Category"
**Then** a summary table is displayed showing each category with the sum of purchase costs
**And** a pie or bar chart visualises the distribution of asset value by category
**And** the grand total of all asset values is shown at the bottom of the table
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Calibration Management (5 scenarios)

### TC-AST-006: Schedule Calibration for Measurement Equipment

**Given** I am on the asset detail page for "AST-2602-0001" (Mitutoyo CMM Unit 3)
**When** I navigate to the Calibration tab and click "Schedule Calibration"
**And** I enter: Calibration Body "UKAS Laboratory — MetroTech Ltd", Scheduled Date "2026-03-15", Calibration Interval "12 months", Notes "Annual UKAS-accredited calibration"
**Then** a calibration schedule entry is created with status "SCHEDULED"
**And** the next due date is displayed on the asset summary as "2026-03-15"
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AST-007: Record Calibration Result (PASS with Certificate)

**Given** a calibration is scheduled for asset "AST-2602-0001" on "2026-03-15"
**When** the calibration is performed and I click "Record Result"
**And** I enter: Result "PASS", Certificate Number "CERT-MT-2026-0842", Calibration Date "2026-03-15", Performed By "MetroTech Ltd", Next Due Date "2027-03-15"
**And** I upload the calibration certificate PDF
**Then** the calibration record is saved with status "PASSED" and the certificate reference stored
**And** the asset's next calibration due date updates to "2027-03-15"
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AST-008: Record FAIL Result and Quarantine Asset

**Given** a calibration is completed for asset "AST-2602-0002" and the instrument has failed
**When** I record the calibration result as "FAIL" with notes "Out of tolerance — X-axis deviation 0.025mm (limit 0.010mm)"
**Then** the calibration record is saved with status "FAILED"
**And** the asset status automatically changes to "QUARANTINED"
**And** a notification is sent to the asset owner and Quality Manager
**And** the asset is flagged with a warning indicator in the register
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AST-009: Set Next Calibration Due Date

**Given** a passed calibration record "CAL-2602-0001" for asset "AST-2602-0001"
**When** I confirm the next calibration due date as "2027-03-15" with interval "12 months"
**Then** the asset record displays next calibration due: "2027-03-15"
**And** a reminder is scheduled for 30 days before the due date ("2027-02-13")
**And** the asset appears in the "Due within 60 days" list from "2027-01-14" onwards
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AST-010: View Overdue Calibrations List

**Given** multiple assets have calibration due dates in the past or within 30 days
**When** I navigate to Assets > Calibration > Overdue
**Then** all assets with a calibration due date in the past (today or earlier) are listed
**And** the list shows asset name, serial number, due date, days overdue, and responsible person
**And** the list is sorted by days overdue (most overdue first)
**And** assets with QUARANTINED status are highlighted separately
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Inspections (5 scenarios)

### TC-AST-011: Create Inspection Schedule (Monthly)

**Given** I am logged in as a Facilities Manager
**When** I navigate to Assets > Inspections and click "New Schedule"
**And** I enter: Asset "AST-2602-0001", Schedule Name "Monthly Visual Inspection", Frequency "MONTHLY", Assigned To "R. Chen", Start Date "2026-03-01"
**And** I add 4 checklist items: "Check physical condition for damage", "Verify all guards and covers in place", "Check power and indicator lights", "Clean surfaces and air vents"
**Then** the schedule is created with status "ACTIVE" and 4 checklist items
**And** the first inspection is due on "2026-03-01"
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AST-012: Perform Inspection Checklist

**Given** an inspection is due for asset "AST-2602-0001" with 4 checklist items
**When** I click "Start Inspection" and work through the checklist
**And** I mark items: Item 1 "PASS", Item 2 "PASS", Item 3 "PASS", Item 4 "PASS"
**And** I click "Complete Inspection"
**Then** the inspection record is created with reference "INS-2602-XXXX" and all items recorded
**And** the overall inspection result is "PASS" with completion date and inspector name
**And** the next inspection due date advances by one month
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AST-013: Record Defect Found During Inspection

**Given** an in-progress inspection for asset "AST-2602-0003" (industrial air compressor)
**When** I mark checklist item "Check for oil leaks" as "FAIL"
**And** I enter defect notes: "Oil seeping from rear housing seal — approx 5ml puddle on floor mat"
**And** I set severity "MEDIUM"
**Then** a defect record is created and linked to the inspection
**And** the inspection result is flagged as "DEFECT FOUND"
**And** the defect appears in the open defects list for the asset
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AST-014: Raise Maintenance Action from Defect

**Given** a defect "DEF-2602-0001" has been recorded for asset "AST-2602-0003" (oil leak)
**When** I open the defect and click "Raise Maintenance Action"
**And** I enter: Action Title "Replace rear housing oil seal", Priority "HIGH", Assigned To "Maintenance Team", Due Date "2026-03-02", Estimated Duration "2 hours"
**Then** a maintenance action is created with reference "MNT-2602-XXXX" and linked to the defect
**And** the defect status changes to "ACTION_RAISED"
**And** the assigned maintenance team receives a notification
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AST-015: View Inspection Compliance Rate

**Given** 12 inspections were scheduled over the past 3 months and 10 were completed on time
**When** I navigate to Assets > Reports > Inspection Compliance
**Then** the compliance rate is displayed as 83% (10 completed / 12 scheduled)
**And** the report shows a breakdown by asset, by department, and by inspection type
**And** missed inspections are listed with the reason (if recorded) or flagged as "No Reason Recorded"
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Depreciation & Lifecycle (5 scenarios)

### TC-AST-016: Set Depreciation Method (Straight-Line)

**Given** an asset "AST-2602-0001" with purchase cost "£87,500" and no depreciation configured
**When** I navigate to the asset's Financial tab and click "Configure Depreciation"
**And** I select Method "STRAIGHT_LINE", Useful Life "10 years", Residual Value "£5,000"
**Then** the depreciation configuration is saved
**And** the annual depreciation charge is calculated as "(£87,500 - £5,000) / 10 = £8,250 per year"
**And** the depreciation schedule table is generated for all 10 years
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AST-017: View Calculated Book Value Over Time

**Given** an asset "AST-2602-0001" with straight-line depreciation configured (annual charge £8,250)
**And** the asset was purchased on "2024-06-15"
**When** I view the asset's Financial tab
**Then** the current book value is correctly calculated based on today's date and elapsed depreciation
**And** a depreciation schedule table shows book value at the end of each financial year
**And** the projected book value at any future date can be queried using a date picker
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AST-018: Flag Asset for Disposal

**Given** an asset "AST-2602-0004" that has reached end of useful life (book value = residual value)
**When** I open the asset record and click "Flag for Disposal"
**And** I enter: Disposal Reason "End of useful life — exceeded 10-year threshold", Proposed Disposal Date "2026-04-30"
**Then** the asset status changes to "PENDING_DISPOSAL"
**And** the asset appears in the disposal workflow queue
**And** the asset owner and Finance Manager receive a notification
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AST-019: Process Disposal with Disposal Value

**Given** an asset "AST-2602-0004" with status "PENDING_DISPOSAL" and book value "£5,000"
**When** a Finance Manager approves the disposal and enters: Disposal Date "2026-04-30", Disposal Method "SOLD", Disposal Value "£6,200", Buyer "Machinery Resale UK Ltd"
**Then** the asset status changes to "DISPOSED"
**And** a disposal gain of "£1,200" (£6,200 - £5,000 book value) is recorded
**And** the asset is removed from the active register but retained in the historical archive
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AST-020: View Asset Lifecycle History

**Given** an asset "AST-2602-0001" has been through: purchase, assignment, calibration, inspection, and depreciation events over multiple years
**When** I open the asset and navigate to the "Lifecycle History" tab
**Then** a chronological timeline is displayed showing all events (purchased, assigned, calibrated, inspected, depreciated)
**And** each event shows the date, event type, description, and the user who recorded it
**And** the full history is exportable as a PDF asset lifecycle report
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Asset Tracking & Reporting (5 scenarios)

### TC-AST-021: Update Asset Location (Room / Building / Site)

**Given** an asset "AST-2602-0001" currently located at "Building A / Lab 2"
**When** I open the asset record and click "Update Location"
**And** I select Site "Main Campus", Building "Building B", Room "Metrology Lab"
**Then** the asset record displays the updated location "Main Campus / Building B / Metrology Lab"
**And** the location change is logged in the asset's audit history with timestamp and user
**And** the previous location "Building A / Lab 2" is retained in the history
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AST-022: View Asset Map / Location Tree

**Given** assets are distributed across multiple sites, buildings, and rooms
**When** I navigate to Assets > Location Map
**Then** a hierarchical tree is displayed: Site > Building > Room > Asset
**And** expanding a room node shows all assets assigned to that room
**And** each asset node shows the asset reference, name, and status indicator
**And** clicking an asset node navigates to the asset detail page
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AST-023: Run Asset Audit (Physical Count)

**Given** I am logged in as a Facilities Manager
**When** I navigate to Assets > Audit and click "Start Physical Audit"
**And** I select scope "Building B / Metrology Lab" and assign auditor "J. Martinez"
**Then** an audit session is created listing all assets registered to that location
**And** I can scan QR codes or manually check off each asset as "FOUND" or "NOT FOUND"
**And** the audit session tracks progress (found / not found / not yet checked)
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AST-024: Record Count Discrepancy

**Given** a physical audit session is in progress and asset "AST-2602-0005" is not found at its registered location
**When** I mark the asset as "NOT FOUND" and enter notes "Not present in Metrology Lab — last seen location unknown"
**Then** the audit records the discrepancy for "AST-2602-0005"
**And** a discrepancy report line is created with asset details and timestamp
**And** the asset's status is flagged as "LOCATION DISCREPANCY" pending investigation
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-AST-025: View Asset Utilisation Report

**Given** utilisation data has been recorded for assets over the past quarter
**When** I navigate to Assets > Reports > Utilisation
**Then** a report is displayed showing utilisation percentage per asset (hours used / available hours × 100)
**And** underutilised assets (below 50% utilisation) are highlighted for review
**And** the report can be filtered by category, department, and date range
**And** the data is exportable as CSV for further analysis
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Sign-Off

| Role                  | Name | Signature | Date |
| --------------------- | ---- | --------- | ---- |
| Facilities Manager    |      |           |      |
| Finance Manager       |      |           |      |
| UAT Lead              |      |           |      |
| Regulatory/Compliance |      |           |      |

**Overall Result:** [ ] PASS -- All scenarios passed / [ ] FAIL -- See notes above
**Release Recommendation:** [ ] Approved for Production / [ ] Requires remediation
