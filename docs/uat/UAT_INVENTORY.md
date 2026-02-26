# UAT Test Plan: Inventory Management Module

---
> **CONFIDENTIAL — TRADE SECRET**
> This document is the property of Nexara DMCC and contains confidential and
> proprietary information. Unauthorised disclosure is prohibited.
> © 2026 Nexara DMCC. All rights reserved.
---


**Document ID:** UAT-INV-001
**Version:** 1.0
**Date:** 2026-02-23
**Module:** Inventory Management
**Environment:** Staging (api-inventory:4005 / web-inventory:3005)
**Tester:** ****************\_\_\_\_****************
**Sign-Off Date:** ****************\_\_\_\_****************

---

## Stock Management (5 scenarios)

### TC-INV-001: Create Inventory Item with SKU and Reorder Point

**Given** I am logged in as an Inventory Manager
**When** I navigate to Inventory > Items and click "New Item"
**And** I enter: Name "Nitrile Safety Gloves (Medium)", SKU "PPE-GLV-M-001", Unit of Measure "Box", Current Stock "50", Reorder Point "20", Reorder Quantity "100", Unit Cost "12.50", Category "PPE"
**Then** the item is created with reference "INV-2602-XXXX" and the SKU is stored as unique
**And** the item appears in the Inventory list with current stock "50" and reorder point "20" displayed
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-INV-002: Receive Stock via Purchase Receipt

**Given** inventory item "INV-2602-0001" (Nitrile Safety Gloves) with current stock "50"
**When** I navigate to Inventory > Receipts and click "New Receipt"
**And** I enter: Item "INV-2602-0001", Supplier "SafetyFirst Ltd", Purchase Order "PO-2602-0042", Quantity Received "100", Received Date "2026-02-23", Lot Number "LOT-240223-01"
**Then** a stock receipt record is created with reference "REC-2602-XXXX"
**And** the item's current stock level increases from 50 to 150
**And** a positive movement record is logged against the item
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-INV-003: Issue Stock for Work Order

**Given** inventory item "INV-2602-0001" with current stock "150"
**When** I navigate to Inventory > Issues and click "New Issue"
**And** I enter: Item "INV-2602-0001", Work Order "WO-2602-0018", Quantity "10", Issued To "Maintenance Team B", Issue Date "2026-02-23"
**Then** a stock issue record is created with reference "ISS-INV-2602-XXXX"
**And** the item's current stock decreases from 150 to 140
**And** a negative movement record is logged against the item
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-INV-004: View Current Stock Level

**Given** inventory item "INV-2602-0001" has had receipts and issues recorded
**When** I navigate to Inventory > Items and open "INV-2602-0001"
**Then** the item detail page displays: current stock quantity "140", reorder point "20", available quantity, and the stock status (e.g., NORMAL — above reorder point)
**And** the stock level is accurate based on all receipts and issues recorded
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-INV-005: View Item Movement History

**Given** inventory item "INV-2602-0001" with multiple receipts and issues recorded
**When** I open the item and navigate to the "Movement History" tab
**Then** a paginated chronological list of all stock movements is displayed: date, movement type (RECEIPT/ISSUE/ADJUSTMENT), quantity (positive or negative), reference document, and running balance after each movement
**And** the movements are sortable by date and filterable by type
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Adjustments & Write-offs (5 scenarios)

### TC-INV-006: Perform Stock Count Adjustment (Positive Variance)

**Given** inventory item "INV-2602-0002" (Safety Helmet) with system stock "30"
**When** I navigate to Inventory > Adjustments and click "New Adjustment"
**And** I enter: Item "INV-2602-0002", Physical Count "35", System Count "30", Variance "+5", Reason "Stock count — found 5 units previously not booked in", Adjustment Date "2026-02-23"
**Then** the adjustment record is created with reference "ADJ-2602-XXXX"
**And** the item stock level increases from 30 to 35
**And** the positive variance is flagged for Inventory Manager review
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-INV-007: Perform Stock Write-off with Reason (Damaged)

**Given** inventory item "INV-2602-0003" (Chemical Absorbent Pads) with current stock "80"
**When** I navigate to Inventory > Adjustments and click "New Write-off"
**And** I enter: Item "INV-2602-0003", Quantity Written Off "8", Reason "DAMAGED", Notes "Water damage from roof leak in storage bay 3", Authorised By "H. Patel", Write-off Date "2026-02-23"
**Then** a write-off record is created with the reason and authoriser recorded
**And** the item stock level decreases from 80 to 72
**And** the write-off value (8 × unit cost) is captured for the variance report
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-INV-008: View Adjustment History

**Given** multiple stock adjustments and write-offs have been recorded across inventory items
**When** I navigate to Inventory > Adjustments and view the adjustment history list
**Then** all adjustments are listed with: date, item name/SKU, adjustment type (COUNT_ADJUSTMENT/WRITE_OFF), quantity, reason, authoriser, and resulting stock level
**And** I can filter by adjustment type, date range, and item category
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-INV-009: View Variance Report

**Given** stock count adjustments with positive and negative variances have been recorded in the current period
**When** I navigate to Inventory > Reports > Variance Report
**And** I set the date range to "This Month"
**Then** the report shows each adjusted item with: system count, physical count, variance quantity, variance value (£), reason, and authoriser
**And** the total net variance value for the period is displayed at the bottom
**And** the report is exportable to PDF and CSV
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-INV-010: Verify Stock Level After Adjustment

**Given** inventory item "INV-2602-0002" had system stock "30" and a +5 adjustment was recorded
**When** I navigate to Inventory > Items and open "INV-2602-0002"
**Then** the current stock level displays "35"
**And** the movement history shows the adjustment entry with type "COUNT_ADJUSTMENT", quantity "+5", and the new balance "35"
**And** the item's last-updated timestamp reflects the adjustment date
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Categories & Warehouses (5 scenarios)

### TC-INV-011: Create Item Category

**Given** I am logged in as an Inventory Administrator
**When** I navigate to Inventory > Settings > Categories and click "New Category"
**And** I enter: Name "Electrical Components", Code "ELEC", Description "Electronic and electrical parts and components", Parent Category "Maintenance Supplies"
**Then** the category is saved and appears in the category hierarchy
**And** the category code "ELEC" is unique
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-INV-012: Assign Item to Category

**Given** category "Electrical Components" exists and inventory item "INV-2602-0010" (Circuit Breaker 20A) exists without a category
**When** I open item "INV-2602-0010" and set Category to "Electrical Components"
**And** I save the changes
**Then** the item is assigned to the "Electrical Components" category
**And** the item appears when filtering the inventory list by category "Electrical Components"
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-INV-013: Create Warehouse Location

**Given** I navigate to Inventory > Settings > Locations
**When** I click "New Location" and enter: Warehouse "Main Warehouse", Zone "A", Aisle "3", Shelf "2", Bin "B", Location Code "MWH-A3-S2-B"
**Then** the location is created with the unique code "MWH-A3-S2-B"
**And** the location appears in the warehouse map/location hierarchy
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-INV-014: Assign Item to Warehouse Location

**Given** location "MWH-A3-S2-B" and inventory item "INV-2602-0010" (Circuit Breaker 20A) exist
**When** I open item "INV-2602-0010" and set Primary Location to "MWH-A3-S2-B"
**And** I save the changes
**Then** the item's primary location is recorded as "MWH-A3-S2-B"
**And** the item appears in the stock-by-location view under "Main Warehouse > Zone A > Aisle 3 > Shelf 2 > Bin B"
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-INV-015: View Stock by Location

**Given** multiple inventory items are assigned to locations within "Main Warehouse"
**When** I navigate to Inventory > Reports > Stock by Location
**And** I select Warehouse "Main Warehouse"
**Then** the report displays a tree or table showing each location with the items stored there, quantities, and total value
**And** I can expand a zone to see its aisles, shelves, and bins
**And** empty locations are indicated
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Reorder & Suppliers (5 scenarios)

### TC-INV-016: View Items Below Reorder Point

**Given** multiple inventory items with reorder points defined, some of which have current stock below their reorder point
**When** I navigate to Inventory > Reorder > Low Stock Alerts
**Then** only items with current stock at or below their reorder point are listed
**And** each item shows: SKU, name, current stock, reorder point, shortfall quantity (reorder point − current stock), and suggested reorder quantity
**And** the list is sorted by criticality (largest shortfall first)
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-INV-017: Create Purchase Request for Low-Stock Items

**Given** the low stock alerts list shows item "INV-2602-0001" (Nitrile Safety Gloves) with shortfall "20"
**When** I select the item from the low stock list and click "Create Purchase Request"
**And** I confirm quantity "100" and submit
**Then** a purchase request "PR-2602-XXXX" is created with status "PENDING_APPROVAL"
**And** the purchase request is linked to the inventory item
**And** the Purchasing Manager receives an approval notification
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-INV-018: Link Supplier to Inventory Item

**Given** inventory item "INV-2602-0001" and supplier record "SafetyFirst Ltd" (SUP-2602-0005) exist
**When** I open the inventory item and navigate to the "Suppliers" tab
**And** I click "Add Supplier" and select "SafetyFirst Ltd"
**And** I enter: Supplier Part Number "SFL-GLV-M", Unit Price "11.80", Currency "GBP", Preferred Supplier "Yes"
**Then** the supplier link is saved against the item
**And** "SafetyFirst Ltd" appears as the preferred supplier on the item's supplier list
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-INV-019: Record Supplier Lead Time

**Given** supplier "SafetyFirst Ltd" is linked to inventory item "INV-2602-0001"
**When** I open the supplier link for "SafetyFirst Ltd" on item "INV-2602-0001"
**And** I enter Lead Time "7 days" and Minimum Order Quantity "50"
**Then** the lead time and MOQ are saved against the supplier-item link
**And** the reorder dashboard shows the expected delivery date calculation (today + 7 days) when a purchase request is created
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-INV-020: View Procurement Dashboard

**Given** purchase requests, supplier links, and low stock items exist in the system
**When** I navigate to Inventory > Procurement Dashboard
**Then** I see: count of open purchase requests by status (PENDING/APPROVED/ORDERED/RECEIVED), total items below reorder point, top 5 items by spend this month, and pending deliveries with expected dates
**And** I can click any KPI card to drill down to the detail list
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Reports & Analytics (5 scenarios)

### TC-INV-021: View Stock Value Report by Category

**Given** inventory items are assigned to categories and each item has a unit cost recorded
**When** I navigate to Inventory > Reports > Stock Value by Category
**And** I set the valuation date to today
**Then** the report displays each category with: item count, total quantity on hand, total stock value (quantity × unit cost), and percentage of overall stock value
**And** categories are sorted by total value (highest first)
**And** a grand total is shown at the bottom
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-INV-022: View Slow-Moving Stock (No Movement > 90 Days)

**Given** inventory items exist with varying last movement dates
**When** I navigate to Inventory > Reports > Slow-Moving Stock
**And** I set the threshold to "90 days no movement"
**Then** the report lists all items with no stock movement (receipt, issue, or adjustment) in the past 90 days
**And** each item shows: SKU, name, category, current stock, last movement date, days since last movement, and stock value
**And** items with the oldest last movement date appear at the top
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-INV-023: View Stock Turnover Rate

**Given** stock movement data exists for the past 12 months
**When** I navigate to Inventory > Reports > Turnover Rate
**And** I set the period to "Last 12 Months"
**Then** the report shows the stock turnover ratio for each item: (Cost of Goods Issued / Average Stock Value)
**And** items with a turnover ratio below a configurable threshold are flagged as low turnover
**And** the report can be filtered by category and sorted by turnover ratio
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-INV-024: ABC Analysis (High/Medium/Low Value Items)

**Given** inventory items with stock values exist across multiple categories
**When** I navigate to Inventory > Reports > ABC Analysis
**And** I click "Run Analysis" with thresholds: A = top 80% of total value, B = next 15%, C = remaining 5%
**Then** each item is classified as A, B, or C
**And** the report shows the count and cumulative value percentage for each class
**And** the Pareto chart illustrates the 80/20 relationship
**And** the classification can be saved and used to prioritise reorder alerts
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-INV-025: Export Stock Report

**Given** the stock value report is displayed with data for the current date
**When** I click "Export" and select format "CSV"
**Then** a CSV file is downloaded containing all displayed columns: SKU, item name, category, location, current stock, unit cost, total value, reorder point, and last movement date
**And** the filename includes the report name and export date (e.g., stock-report-2026-02-23.csv)
**And** all numeric values are correctly formatted without currency symbols in the CSV
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
