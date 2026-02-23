# UAT Test Plan: Customer Relationship Management (CRM)

**Document ID:** UAT-CRM-001
**Version:** 1.0
**Date:** 2026-02-23
**Module:** Customer Relationship Management
**Environment:** Staging (api-crm:4014 / web-crm:3014)
**Tester:** ________________________________________
**Sign-Off Date:** ________________________________________

---

## Account Management (5 scenarios)

### TC-CRM-001: Create Account with Industry, Tier, and Revenue

**Given** I am logged in as a Sales Manager
**When** I navigate to CRM > Accounts and click "New Account"
**And** I fill in: Company Name "Apex Manufacturing Ltd", Industry "MANUFACTURING", Tier "ENTERPRISE", Annual Revenue 5000000, Website "www.apexmfg.com", Country "United Kingdom"
**Then** the system creates the account with a unique account reference
**And** the account status defaults to "PROSPECT"
**And** the account appears in the Accounts list with industry and tier badges
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-CRM-002: Add Contact to Account

**Given** an account "Apex Manufacturing Ltd" exists in the system
**When** I open the account and click "Add Contact"
**And** I fill in: First Name "Sarah", Last Name "Holloway", Job Title "Procurement Director", Email "s.holloway@apexmfg.com", Phone "+44 1234 567890", Primary Contact = true
**Then** the contact is created and linked to the account
**And** the account's contact count increments by 1
**And** the contact appears in the account's Contacts tab
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-CRM-003: Create Deal Linked to Account

**Given** an account "Apex Manufacturing Ltd" with at least one contact exists
**When** I navigate to CRM > Deals and click "New Deal"
**And** I fill in: Deal Name "IMS Platform Rollout", Account "Apex Manufacturing Ltd", Value 125000, Currency "GBP", Stage "LEAD", Expected Close Date "2026-06-30", Assigned Rep "J. Thornton"
**Then** the deal is created with a unique deal reference
**And** the deal is visible in the account's Deals tab
**And** the pipeline board shows the deal in the "LEAD" column
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-CRM-004: View Account 360 Dashboard

**Given** an account "Apex Manufacturing Ltd" with at least 1 contact, 1 deal, and 1 logged activity exists
**When** I open the account and navigate to the "360 View" or summary panel
**Then** I see the contacts list with primary contact highlighted
**And** I see the open deals with their current stages and values
**And** I see the recent activity timeline (calls, emails, meetings)
**And** the account health score or engagement summary is visible
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-CRM-005: Update Account Status from PROSPECT to CUSTOMER

**Given** an account "Apex Manufacturing Ltd" with status "PROSPECT"
**When** I open the account, click "Edit", and change the Status from "PROSPECT" to "CUSTOMER"
**And** I save the changes
**Then** the account status updates to "CUSTOMER"
**And** the account appears in the "Customers" filter view
**And** the status change is recorded in the account activity log
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Contact Management (5 scenarios)

### TC-CRM-006: Create Contact Linked to Account

**Given** an account "Apex Manufacturing Ltd" exists in the system
**When** I navigate to CRM > Contacts and click "New Contact"
**And** I fill in: First Name "Marcus", Last Name "Reid", Job Title "Operations Manager", Email "m.reid@apexmfg.com", Account "Apex Manufacturing Ltd", Department "Operations"
**Then** the contact is created and linked to the specified account
**And** the contact appears in the Contacts list
**And** the account's contact count updates accordingly
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-CRM-007: Log a Call Activity Against a Contact

**Given** a contact "Marcus Reid" linked to account "Apex Manufacturing Ltd" exists
**When** I open the contact record and click "Log Activity"
**And** I select Activity Type "CALL", enter Subject "Discovery call – Q2 requirements", Duration 30 minutes, Outcome "Positive — follow-up demo scheduled", Date "2026-02-23"
**Then** the call activity is saved against the contact
**And** the activity appears in the contact's timeline with the correct date and outcome
**And** the account-level timeline also reflects the new activity
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-CRM-008: Log an Email Activity Against a Contact

**Given** a contact "Sarah Holloway" exists with at least one prior activity
**When** I click "Log Activity", select Activity Type "EMAIL", enter Subject "Proposal follow-up", Direction "OUTBOUND", and Summary "Sent updated proposal with revised pricing"
**Then** the email activity is recorded against the contact
**And** the activity type icon distinguishes it from call activities in the timeline
**And** the activity count on the contact card increments
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-CRM-009: View Contact Activity Timeline

**Given** a contact "Sarah Holloway" with multiple logged activities (calls, emails, meetings) exists
**When** I open the contact and navigate to the "Activity" tab
**Then** all activities are displayed in reverse-chronological order
**And** each activity shows type, subject, date, and outcome
**And** I can filter the timeline by activity type (CALL / EMAIL / MEETING / NOTE)
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-CRM-010: Search Contacts by Name and Company

**Given** multiple contacts exist across different accounts
**When** I navigate to CRM > Contacts and enter "Holloway" in the search field
**Then** only contacts with "Holloway" in their name are returned
**When** I clear the search and enter the company name "Apex"
**Then** all contacts linked to accounts matching "Apex" are returned
**And** the search results update without requiring a full page reload
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Deal Pipeline (5 scenarios)

### TC-CRM-011: Create Deal with Value and Probability

**Given** I am logged in as a Sales Representative
**When** I navigate to CRM > Deals and click "New Deal"
**And** I fill in: Deal Name "Cloud Migration Contract", Account "Apex Manufacturing Ltd", Value 85000, Probability 40, Stage "QUALIFIED", Currency "GBP", Expected Close Date "2026-07-15"
**Then** the deal is created with a unique reference
**And** the weighted value is calculated as 34000 (85000 × 40%)
**And** the deal appears in the "QUALIFIED" column on the pipeline board
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-CRM-012: Advance Deal Through Pipeline Stages

**Given** a deal "Cloud Migration Contract" currently in stage "LEAD"
**When** I update the stage sequentially: LEAD → QUALIFIED → PROPOSAL → NEGOTIATION → CLOSED_WON
**Then** each stage transition is recorded with a timestamp
**And** the pipeline board reflects the deal in the correct column after each move
**And** the final status shows "CLOSED_WON" with a won date recorded
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-CRM-013: View Pipeline Board by Stage

**Given** multiple deals exist across all pipeline stages (LEAD, QUALIFIED, PROPOSAL, NEGOTIATION, CLOSED_WON, CLOSED_LOST)
**When** I navigate to CRM > Pipeline Board
**Then** deals are grouped into columns by stage
**And** each column shows the total deal count and aggregate value
**And** I can drag-and-drop a deal card to move it to an adjacent stage
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-CRM-014: View Forecast Report with Weighted Values

**Given** multiple open deals with varying probabilities and close dates exist
**When** I navigate to CRM > Reports > Forecast
**And** I select the date range "Q2 2026 (April–June)"
**Then** the forecast report displays each open deal's value, probability, and weighted value
**And** the total weighted pipeline value for the period is calculated correctly
**And** I can filter the forecast by assigned sales rep
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-CRM-015: Mark Deal as CLOSED_LOST with Reason

**Given** a deal "Cloud Migration Contract" in stage "NEGOTIATION"
**When** I open the deal and change the status to "CLOSED_LOST"
**And** I select a loss reason "PRICE — Competitor offered lower pricing" and add notes
**Then** the deal status changes to "CLOSED_LOST" with the loss reason recorded
**And** the deal moves to the "CLOSED_LOST" view and is removed from the active pipeline board
**And** the loss reason contributes to the win/loss analytics report
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Campaigns (5 scenarios)

### TC-CRM-016: Create Email Campaign

**Given** I am logged in as a Marketing Manager
**When** I navigate to CRM > Campaigns and click "New Campaign"
**And** I fill in: Campaign Name "Q2 IMS Awareness Drive", Type "EMAIL", Start Date "2026-04-01", End Date "2026-04-30", Target Audience "Manufacturing Prospects", Budget 5000
**Then** the campaign is created with status "DRAFT"
**And** the campaign appears in the Campaigns list with type and date range displayed
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-CRM-017: Add Leads to Campaign

**Given** a campaign "Q2 IMS Awareness Drive" in DRAFT or ACTIVE status exists
**When** I open the campaign and click "Add Leads"
**And** I select 5 contacts/accounts from the prospect list and confirm
**Then** all 5 leads are added to the campaign's audience
**And** the campaign shows an updated lead count of 5
**And** each lead record shows the campaign association
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-CRM-018: Record Campaign Response

**Given** a campaign "Q2 IMS Awareness Drive" with at least one lead added
**When** I open a campaign lead record and log a response: Response Type "EMAIL_OPEN", Date "2026-04-05", Notes "Contact opened the introductory email"
**Then** the response is recorded against the campaign lead
**And** the campaign's response rate counter increments
**And** the response appears in the campaign activity log
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-CRM-019: View Campaign Conversion Rate

**Given** a campaign "Q2 IMS Awareness Drive" with 20 leads, 8 responses, and 3 converted to deals
**When** I open the campaign and navigate to the "Analytics" or "Performance" tab
**Then** the conversion rate is displayed as 15% (3 conversions out of 20 leads)
**And** the response rate is displayed as 40% (8 responses out of 20 leads)
**And** a funnel or bar chart visualises the lead-to-conversion flow
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-CRM-020: Compare Campaign ROI

**Given** two completed campaigns with recorded budgets and generated deal values exist
**When** I navigate to CRM > Reports > Campaign ROI
**Then** each campaign shows: Budget, Revenue Attributed (value of deals linked to campaign leads), and ROI percentage
**And** campaigns are sortable by ROI descending
**And** I can export the comparison table to CSV
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Reports & Analytics (5 scenarios)

### TC-CRM-021: View Sales Performance by Rep

**Given** multiple deals have been won and lost across multiple assigned sales reps
**When** I navigate to CRM > Reports > Sales Performance
**And** I filter by date range "YTD 2026"
**Then** a table or chart shows each rep's: deals won, deals lost, total revenue, win rate, and average deal value
**And** I can sort the report by any column
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-CRM-022: View Win/Loss Rate

**Given** deals exist in CLOSED_WON and CLOSED_LOST states with recorded loss reasons
**When** I navigate to CRM > Reports > Win/Loss Analysis
**Then** the overall win rate is displayed as a percentage
**And** a breakdown by loss reason shows the top reasons deals are lost
**And** I can filter by account industry, deal size band, or sales rep
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-CRM-023: View Average Deal Cycle Time

**Given** multiple CLOSED_WON deals exist with recorded creation and close dates
**When** I navigate to CRM > Reports > Deal Cycle Time
**Then** the average number of days from deal creation to CLOSED_WON is displayed
**And** the report segments cycle time by deal stage (time spent in each stage)
**And** deals with cycle time above the average are highlighted for review
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-CRM-024: View Revenue by Industry

**Given** closed-won deals are linked to accounts with industry classifications
**When** I navigate to CRM > Reports > Revenue by Industry
**And** I filter by the current financial year
**Then** a pie chart or bar chart shows revenue distribution across industries (MANUFACTURING, HEALTHCARE, TECHNOLOGY, etc.)
**And** clicking an industry segment drills down to the constituent deals
**And** the total revenue figure matches the sum of all CLOSED_WON deal values in the period
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-CRM-025: Export Pipeline Report to CSV

**Given** the pipeline report is displayed with current deal data
**When** I click the "Export" button and select format "CSV"
**Then** a CSV file is downloaded containing all visible pipeline records
**And** the file includes columns: Deal Name, Account, Stage, Value, Probability, Weighted Value, Expected Close Date, Assigned Rep
**And** the data in the CSV matches what is displayed on screen
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
