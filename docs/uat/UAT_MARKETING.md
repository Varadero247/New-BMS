# UAT Test Plan: Marketing
**Version**: 1.0
**Date**: 2026-02-23
**Module**: Marketing
**Port**: 4025
**Prepared by**: QA Team
**Status**: Draft

## Overview
The Marketing module provides campaign management, lead tracking, content publishing, email campaign execution, and analytics dashboards to support the full marketing lifecycle. It integrates with the CRM module for lead and contact data, and with the Analytics module for cross-channel performance reporting.

## Scope
- Creating, launching, and managing marketing campaigns across multiple channels
- Tracking leads through the acquisition funnel from source to conversion
- Publishing and managing marketing content assets
- Composing and sending email campaigns with template support
- Monitoring marketing KPIs and campaign performance on the analytics dashboard

## Prerequisites
- IMS platform running and accessible
- Admin credentials available (admin@ims.local / admin123)
- Test data seeded via seed scripts
- CRM module operational with at least 20 contact records loaded
- At least one email sending domain configured and verified
- Marketing analytics data seeded for the current and prior month

## Test Cases

### Campaign Management

#### TC-MKT-001: Create a new marketing campaign
**Given** the user is authenticated and on the Marketing module dashboard (port 3030)
**When** the user selects "New Campaign", enters name "Q1 Product Launch", type "Multi-Channel", start date "2026-03-01", and end date "2026-03-31"
**And** clicks "Save Draft"
**Then** the campaign is created with status "Draft"
**And** a campaign reference is generated in the format `MKT-CAMP-YYYY-NNN`

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-MKT-002: Add campaign goals and budget
**Given** a campaign exists in "Draft" status
**When** the user opens the campaign and sets goal "Generate 200 MQLs", budget "£5,000", and target audience "SMB Technology Sector"
**And** saves the changes
**Then** the campaign record is updated with the goal, budget, and audience fields
**And** budget utilisation percentage is displayed as "0%" until spend is recorded

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-MKT-003: Launch a campaign
**Given** a campaign in "Draft" status with all required fields completed
**When** the user clicks "Launch Campaign" and confirms in the confirmation dialog
**Then** the campaign status changes to "Active"
**And** the launch timestamp is recorded and visible in the campaign audit trail

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-MKT-004: Pause and resume an active campaign
**Given** a campaign with status "Active"
**When** the user clicks "Pause Campaign" and provides a reason "Budget review in progress"
**Then** the campaign status changes to "Paused"
**And** when the user subsequently clicks "Resume Campaign", the status returns to "Active" with a resume timestamp logged

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-MKT-005: Close a completed campaign
**Given** an "Active" campaign whose end date has passed
**When** the user clicks "Close Campaign" and confirms
**Then** the campaign status changes to "Closed"
**And** the final performance summary showing impressions, clicks, leads, and ROI is displayed

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

### Lead Tracking

#### TC-MKT-006: Create a new lead from a campaign
**Given** an active campaign exists
**When** the user navigates to "Leads" within the campaign and clicks "Add Lead", entering name "Jane Doe", company "Acme Ltd", email "jane.doe@acme.com", and source "Campaign Landing Page"
**And** saves the lead
**Then** the lead is created with status "New" and linked to the campaign
**And** the lead is also visible in the CRM module under contacts

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-MKT-007: Progress a lead through the funnel stages
**Given** a lead exists with status "New"
**When** the user changes the lead stage to "MQL" (Marketing Qualified Lead) and adds qualification notes
**Then** the lead status updates to "MQL"
**And** the stage transition is recorded in the lead's activity timeline with timestamp

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-MKT-008: Assign a lead to a sales owner
**Given** an MQL lead requires handoff to sales
**When** the user clicks "Assign Lead", selects a sales user from the dropdown, and saves
**Then** the lead's owner field updates to the selected sales user
**And** the assigned user receives an in-app notification about the new lead assignment

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-MKT-009: Mark a lead as converted
**Given** a lead has progressed through the funnel and resulted in a deal
**When** the user clicks "Convert Lead", links it to an existing CRM opportunity, and confirms
**Then** the lead status changes to "Converted"
**And** the campaign's conversion count increments by one

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-MKT-010: Filter leads by stage and campaign
**Given** multiple leads exist across different campaigns and stages
**When** the user applies filters for campaign "Q1 Product Launch" and stage "MQL"
**Then** only leads matching both criteria are displayed in the list
**And** the result count reflects the filtered subset

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

### Content Management

#### TC-MKT-011: Create a new content asset
**Given** the user navigates to "Content" in the Marketing module
**When** the user clicks "New Content", selects type "Blog Post", enters title "5 Ways IMS Improves Compliance", and adds body text and metadata tags
**And** saves as draft
**Then** the content item is saved with status "Draft"
**And** a slug is auto-generated from the title in lowercase hyphenated format

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-MKT-012: Publish a content asset
**Given** a content item exists in "Draft" status with all required fields completed
**When** the user clicks "Publish" and sets publish date to "2026-03-05 09:00"
**Then** the content status changes to "Scheduled" until the publish date
**And** at the scheduled date and time the status transitions to "Published"

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-MKT-013: Upload and attach a media file to content
**Given** the user is editing a content asset
**When** the user uploads a PNG image file (under 5 MB) using the media uploader
**And** inserts it into the content body
**Then** the image is stored and a URL is returned
**And** the image is rendered correctly in the content preview

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-MKT-014: Archive a published content asset
**Given** a content item with status "Published" is no longer relevant
**When** the user selects "Archive" and confirms
**Then** the content status changes to "Archived"
**And** archived content does not appear in the default content list view

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-MKT-015: Search content by keyword
**Given** multiple content assets exist across different types
**When** the user enters "compliance" in the content search box and presses Enter
**Then** all content items containing "compliance" in the title or body are returned
**And** results are ordered by relevance score descending

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

### Email Campaigns

#### TC-MKT-016: Create an email campaign using a template
**Given** the user navigates to "Email Campaigns" and clicks "New Email Campaign"
**When** the user selects template "Product Announcement", enters subject line "Introducing IMS 2026", selects a recipient list of "500 contacts", and links it to the "Q1 Product Launch" campaign
**And** saves the email draft
**Then** the email campaign is saved with status "Draft"
**And** the estimated recipient count is displayed correctly

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-MKT-017: Send a test email before campaign send
**Given** an email campaign draft with content completed
**When** the user clicks "Send Test" and enters the test recipient address "qa@ims.local"
**Then** a test email is dispatched to the specified address within 2 minutes
**And** the test send is logged in the campaign activity log

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-MKT-018: Schedule an email campaign for future delivery
**Given** an email campaign in "Draft" status with all content finalised
**When** the user clicks "Schedule Send" and sets delivery time to "2026-03-10 08:00 UTC"
**Then** the campaign status changes to "Scheduled"
**And** the scheduled send time is displayed in the campaign overview

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-MKT-019: Track email open and click rates after send
**Given** an email campaign has been sent to recipients
**When** the user opens the campaign performance tab
**Then** the open rate, click-through rate (CTR), bounce rate, and unsubscribe count are displayed
**And** metrics update in near real-time as recipients interact with the email

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-MKT-020: Handle unsubscribe requests
**Given** a recipient clicks the unsubscribe link in a marketing email
**When** the unsubscribe action is processed by the system
**Then** the contact's marketing opt-in flag is set to "false" in the CRM
**And** the contact is excluded from all future email campaign sends

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

### Marketing Analytics

#### TC-MKT-021: View the marketing KPI dashboard
**Given** the user navigates to "Analytics" in the Marketing module
**When** the dashboard loads for the current month
**Then** KPI tiles display total campaigns active, total leads generated, MQL count, conversion rate, and total marketing spend
**And** each KPI shows a trend indicator comparing to the prior month

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-MKT-022: View campaign performance breakdown chart
**Given** multiple campaigns exist with performance data
**When** the user selects a date range and views the "Campaign Performance" chart
**Then** a bar or line chart displays impressions, clicks, leads, and conversions per campaign
**And** the chart supports toggling individual metrics on and off

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-MKT-023: Filter analytics by channel
**Given** campaigns span multiple channels (email, social, paid search)
**When** the user applies a channel filter of "Email" in the analytics view
**Then** all charts and KPI tiles update to show only email channel data
**And** the active filter is clearly indicated in the UI

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-MKT-024: Export analytics data as CSV
**Given** the analytics dashboard is displaying filtered campaign data
**When** the user clicks "Export CSV"
**Then** a CSV file is downloaded containing all rows visible in the current filtered view
**And** the CSV includes column headers matching the displayed data fields

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

#### TC-MKT-025: Calculate and display campaign ROI
**Given** a closed campaign with recorded spend and attributed revenue from converted leads
**When** the user views the campaign's ROI tile
**Then** ROI is calculated as `((Revenue - Spend) / Spend) × 100` and displayed as a percentage
**And** the attributed revenue figure is sourced from linked CRM opportunities

**Result**: [ ] Pass  [ ] Fail
**Notes**: _______________

## Sign-Off
| Role | Name | Signature | Date |
|------|------|-----------|------|
| QA Lead | | | |
| Product Owner | | | |
| Technical Lead | | | |
| Business Stakeholder | | | |
