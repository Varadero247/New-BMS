# UAT Test Plan: Computerised Maintenance Management System (CMMS)

---
> **CONFIDENTIAL — TRADE SECRET**
> This document is the property of Nexara DMCC and contains confidential and
> proprietary information. Unauthorised disclosure is prohibited.
> © 2026 Nexara DMCC. All rights reserved.
---


**Document ID:** UAT-CMMS-001
**Version:** 1.0
**Date:** 2026-02-23
**Module:** Computerised Maintenance Management System (CMMS)
**Environment:** Staging (api-cmms:4017 / web-cmms:3017)
**Tester:** ________________________________________
**Sign-Off Date:** ________________________________________

---

## Asset Management (5 scenarios)

### TC-CMMS-001: Register Asset with Reference Number

**Given** I am logged in as a Maintenance Manager
**When** I navigate to CMMS > Assets and click "New Asset"
**And** I fill in: Asset Name "CNC Lathe – Station 4", Asset Type "MACHINERY", Manufacturer "Haas Automation", Model "ST-30Y", Serial Number "HA-2019-88341", Install Date "2019-07-15", Location "Building A – Bay 2"
**Then** the system creates the asset with a reference in the format "ASSET-YYYY-NNN"
**And** the asset status defaults to "ACTIVE"
**And** the asset appears in the Asset Register list
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-CMMS-002: Set Asset Criticality

**Given** an asset "ASSET-2026-0001" with criticality not yet assigned exists
**When** I open the asset record, click "Edit", and set Criticality to "CRITICAL"
**And** I save the changes
**Then** the asset criticality is updated to "CRITICAL"
**And** the asset is highlighted or badged with a CRITICAL indicator in the asset list
**And** the criticality change is recorded in the asset audit history
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-CMMS-003: Assign Asset to Location

**Given** a location hierarchy exists: Site "Sheffield Plant" > Building "Building A" > Area "Bay 2"
**When** I open asset "ASSET-2026-0001" and click "Assign Location"
**And** I select Site "Sheffield Plant", Building "Building A", Area "Bay 2"
**Then** the asset location is updated to "Sheffield Plant > Building A > Bay 2"
**And** the asset appears in the location tree under "Bay 2"
**And** other assets at the same location are listed alongside it
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-CMMS-004: View Asset Hierarchy

**Given** multiple assets are assigned to a location hierarchy with parent and child relationships
**When** I navigate to CMMS > Asset Hierarchy
**Then** a tree view displays sites at the top level, expanding to buildings, areas, and individual assets
**And** each node shows the asset count at that level
**And** I can click any leaf node to navigate directly to the asset record
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-CMMS-005: Decommission Asset

**Given** an asset "ASSET-2026-0002" with status "ACTIVE" and no open work orders exists
**When** I open the asset, click "Decommission", enter a reason "End of service life – replaced by ASSET-2026-0010", and confirm
**Then** the asset status changes to "DECOMMISSIONED"
**And** the asset no longer appears in the default "Active Assets" view
**And** the decommission date and reason are stored in the asset record
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Work Orders (5 scenarios)

### TC-CMMS-006: Create Corrective Work Order

**Given** I am logged in as a Maintenance Supervisor
**When** I navigate to CMMS > Work Orders and click "New Work Order"
**And** I fill in: Type "CORRECTIVE", Asset "ASSET-2026-0001", Title "Investigate excessive vibration on CNC Lathe Station 4", Priority "HIGH", Reported By "T. Nguyen", Reported Date "2026-02-23"
**Then** the work order is created with a reference in the format "WO-YYYY-NNN"
**And** the work order status defaults to "OPEN"
**And** the work order appears in the open work orders queue
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-CMMS-007: Assign Technician to Work Order

**Given** a work order "WO-2026-0001" with status "OPEN" and no assigned technician exists
**When** I open the work order, click "Assign Technician", and select "D. Osei" from the available technicians list
**Then** the work order is updated with assignedTo "D. Osei"
**And** the technician receives a notification of the assignment
**And** the work order appears in D. Osei's personal work queue
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-CMMS-008: Update Work Order Status Through Completion

**Given** a work order "WO-2026-0001" assigned to technician "D. Osei" with status "OPEN"
**When** I update the status to "IN_PROGRESS" and enter start time "2026-02-23 09:00"
**And** upon completion, I update the status to "COMPLETED", enter completion time "2026-02-23 11:30", and add resolution notes "Replaced worn bearing in spindle assembly"
**Then** the work order status shows "COMPLETED"
**And** the total elapsed time is calculated as 2 hours 30 minutes
**And** the resolution notes are stored against the work order
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-CMMS-009: Add Labour and Parts Used to Work Order

**Given** a work order "WO-2026-0001" in status "IN_PROGRESS" or "COMPLETED"
**When** I open the work order and click "Add Labour"
**And** I enter: Technician "D. Osei", Hours 2.5, Labour Rate 45.00 (£/hr)
**And** I click "Add Parts" and enter: Part Name "SKF 6208 Bearing", Part Number "SKF-6208-2Z", Quantity 1, Unit Cost 28.50
**Then** the labour record is saved with a labour cost of £112.50
**And** the parts record is saved with a parts cost of £28.50
**And** the work order total cost displays £141.00
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-CMMS-010: Verify Overdue Work Orders List

**Given** work orders exist with due dates in the past and status not "COMPLETED" or "CANCELLED"
**When** I navigate to CMMS > Work Orders and apply the filter "Status: OVERDUE" or sort by Due Date ascending
**Then** all work orders past their due date are listed at the top
**And** each overdue work order is highlighted (e.g. red border or overdue badge)
**And** the overdue work orders count is displayed in the dashboard KPI tile
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Preventive Maintenance (5 scenarios)

### TC-CMMS-011: Create Preventive Maintenance Plan

**Given** I am logged in as a Maintenance Manager
**When** I navigate to CMMS > Preventive Maintenance and click "New PM Plan"
**And** I fill in: Plan Name "Monthly Spindle Lubrication – CNC Lathe St4", Asset "ASSET-2026-0001", Frequency "MONTHLY", Estimated Duration 1 hour, Instructions "Apply 20ml ISO VG 68 oil to spindle bearing via top port"
**Then** the PM plan is created with status "ACTIVE"
**And** the plan is linked to asset "ASSET-2026-0001"
**And** the first scheduled occurrence is generated based on today's date plus one month
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-CMMS-012: Link PM Plan to Asset

**Given** a PM plan exists without an asset assignment
**When** I open the PM plan, click "Edit", and assign it to asset "ASSET-2026-0003"
**Then** the PM plan is updated with the asset reference
**And** the asset record's Maintenance tab shows the linked PM plan
**And** the PM plan appears in the scheduled maintenance view for that asset
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-CMMS-013: Schedule Next Occurrence for PM Plan

**Given** a PM plan "Monthly Spindle Lubrication" linked to asset "ASSET-2026-0001" with frequency MONTHLY
**When** I open the PM plan and view the Scheduled Occurrences section
**Then** the next due date is displayed (today + 1 month)
**And** a work order is either pre-generated or flagged for generation 7 days before the due date
**And** the schedule shows the recurrence pattern (e.g. every 1 month on the 23rd)
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-CMMS-014: Mark PM Occurrence as Completed

**Given** a scheduled PM occurrence for "Monthly Spindle Lubrication" is due today
**When** I open the occurrence, click "Mark Complete", enter completion notes "Lubrication applied, no anomalies found", and confirm
**Then** the occurrence status changes to "COMPLETED" with today's date recorded
**And** the PM plan's last completed date is updated
**And** the completion is logged in the asset's maintenance history
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-CMMS-015: Verify Next Occurrence Auto-Scheduled After Completion

**Given** a PM occurrence for plan "Monthly Spindle Lubrication" (MONTHLY frequency) has just been marked COMPLETED on 2026-02-23
**When** I view the PM plan's scheduled occurrences
**Then** a new occurrence is automatically created with due date 2026-03-23 (one month later)
**And** the new occurrence status is "SCHEDULED"
**And** the PM plan's nextDueDate field reflects the new date
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Inspections & Checklists (5 scenarios)

### TC-CMMS-016: Create Inspection Checklist

**Given** I am logged in as a Maintenance Manager
**When** I navigate to CMMS > Inspections and click "New Checklist"
**And** I fill in: Title "Pre-Shift Machine Safety Inspection", Asset Type "MACHINERY", Items: ["Guards in place and secure", "Emergency stop functional", "Lubrication levels within range", "No unusual noise or vibration", "Housekeeping – area clear of debris"]
**Then** the checklist is created with 5 inspection items and status "ACTIVE"
**And** the checklist can be assigned to scheduled inspections for any MACHINERY asset
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-CMMS-017: Perform Inspection with All Items Passing

**Given** an active inspection checklist "Pre-Shift Machine Safety Inspection" with 5 items
**When** I open asset "ASSET-2026-0001", click "Start Inspection", and select the checklist
**And** I mark all 5 items as "PASS" with inspector name "P. Kamara" and date "2026-02-23 07:00"
**Then** the inspection record is saved with status "COMPLETED" and result "PASS"
**And** passCount=5, failCount=0
**And** the inspection appears in the asset's inspection history
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-CMMS-018: Record Failed Inspection Item

**Given** an active inspection for asset "ASSET-2026-0001" is in progress
**When** I mark item "Emergency stop functional" as "FAIL" and enter notes "E-stop mushroom head jammed, not resetting correctly"
**And** I complete the remaining items as "PASS" and submit the inspection
**Then** the inspection is saved with result "FAIL"
**And** failCount=1 with the failed item and notes stored
**And** the inspection result is flagged on the asset record
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-CMMS-019: Raise Work Order from Failed Inspection Item

**Given** an inspection record with a failed item "Emergency stop functional" for asset "ASSET-2026-0001"
**When** I open the failed inspection item and click "Raise Work Order"
**Then** a corrective work order is automatically created with: Asset "ASSET-2026-0001", Title "Inspection Failure – Emergency stop not resetting", Source "INSPECTION", Priority "HIGH"
**And** the inspection item is linked to the new work order reference
**And** the work order appears in the open work orders queue
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-CMMS-020: View Inspection History for Asset

**Given** multiple inspections (pass and fail) have been completed for asset "ASSET-2026-0001" over several weeks
**When** I open the asset and navigate to the "Inspection History" tab
**Then** all inspections are listed in reverse-chronological order
**And** each entry shows date, inspector, result (PASS/FAIL), and pass/fail counts
**And** I can click any inspection record to view the detailed item-by-item responses
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## KPIs & Analytics (5 scenarios)

### TC-CMMS-021: View MTTR (Mean Time To Repair)

**Given** multiple corrective work orders have been completed with recorded start and completion times
**When** I navigate to CMMS > Analytics > Maintenance KPIs
**Then** the MTTR is displayed in hours, calculated as the average elapsed time from work order creation to COMPLETED status
**And** MTTR is segmented by asset criticality (CRITICAL / HIGH / MEDIUM / LOW)
**And** I can filter by date range and asset category
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-CMMS-022: View MTBF (Mean Time Between Failures)

**Given** an asset "ASSET-2026-0001" has multiple corrective work orders (failures) recorded over a 12-month period
**When** I open the asset and view the "KPI" or "Reliability" panel
**Then** the MTBF is displayed in hours (total operating hours ÷ number of failures)
**And** a trend chart shows MTBF over time (monthly or quarterly)
**And** an alert is displayed if MTBF has decreased by more than 20% from the prior period
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-CMMS-023: View PM Compliance Rate

**Given** PM schedules exist with occurrences due in the previous calendar month
**When** I navigate to CMMS > Analytics > PM Compliance
**Then** the PM compliance rate is displayed as a percentage (completed on time ÷ total scheduled × 100)
**And** the report breaks down compliance by asset, location, and technician
**And** overdue and missed PM occurrences are listed for remediation
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-CMMS-024: View Asset Downtime by Criticality

**Given** corrective work orders with status "IN_PROGRESS" and elapsed time data exist for assets across all criticality levels
**When** I navigate to CMMS > Analytics > Asset Downtime
**Then** total downtime (in hours) is displayed grouped by criticality: CRITICAL, HIGH, MEDIUM, LOW
**And** a bar chart visualises downtime by criticality
**And** the top 5 assets by total downtime are listed with their criticality and downtime hours
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-CMMS-025: View Maintenance Cost Trend

**Given** work orders with labour and parts costs recorded exist across a 6-month period
**When** I navigate to CMMS > Analytics > Maintenance Costs
**Then** a line or bar chart shows total maintenance cost per month for the past 6 months
**And** costs are broken down into Labour Cost, Parts Cost, and Total Cost
**And** I can filter by asset category (MACHINERY, ELECTRICAL, HVAC, etc.) or location
**And** I can export the cost trend data to CSV
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
