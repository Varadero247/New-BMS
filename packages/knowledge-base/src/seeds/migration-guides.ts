import type { KBArticle } from '../types';

export const migrationGuideArticles: KBArticle[] = [
  {
    id: 'KB-MIG-001',
    title: 'Migrating from Excel-Based Risk Register to IMS',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['migration', 'risk', 'excel', 'data-migration'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Migrating from Excel-Based Risk Register to IMS

## Overview

This guide covers the end-to-end process of migrating an existing Excel-based risk register into the IMS Risk Management module. It addresses data auditing, column mapping, validation, and post-migration verification to ensure no risks are lost or misrepresented during the transition.

## Before You Migrate

- [ ] Obtain a copy of the current Excel risk register (ensure it is the latest version)
- [ ] Confirm who the data owner is and get their sign-off on the migration plan
- [ ] Identify all users who will be risk owners in IMS and ensure their accounts are created first
- [ ] Download the IMS risk import template from Settings > Import Templates > Risk Register
- [ ] Schedule the migration during a low-activity window to avoid concurrent edits
- [ ] Notify all risk owners that the register is being migrated and set an edit freeze on the spreadsheet

## Data Audit

Before importing, audit the Excel register thoroughly:

**Deduplication:** Sort risks by title and description. Remove duplicate entries — if two rows describe the same risk in the same area, merge the control measures and keep the higher severity rating.

**Standardise severity ratings:** Legacy spreadsheets often use non-standard scales (e.g. 1–10 or Low/Medium/High). IMS uses numeric probability (1–5) and impact/severity (1–5). Map your existing scale before import.

**Owner validation:** For each risk, verify the named owner has an active account in IMS. Risks with no valid owner cannot be imported. Pre-create any missing users.

**Status clean-up:** Risks should be classified as Open or Closed before import. Archive any risks that were closed more than two years ago and are no longer relevant — do not import them.

**Empty mandatory fields:** The IMS import requires at minimum: title, probability, severity, assignee email, and status. Highlight and complete any rows with blanks.

## Migration Steps

1. Export the cleaned risk register from Excel as CSV (UTF-8 encoding).
2. Open the IMS risk import template (XLSX format from Settings > Import Templates).
3. Map your CSV columns to the template columns using the field mapping guide below.
4. Paste data into the template — do not alter the template header row.
5. Save the completed template as XLSX.
6. Navigate to Risk Management > Import > Upload File.
7. Select your file and click Validate. Review any validation errors flagged by IMS.
8. Fix errors in the source file and re-upload until zero validation errors remain.
9. Click Confirm Import to complete the migration.
10. Run the post-migration verification steps below.

## Field Mapping Guide

| Legacy Field | IMS Field | Notes/Transform |
|---|---|---|
| Risk ID | externalId | Optional — preserves your legacy reference number |
| Risk Description | title | 255 character limit; truncate if needed |
| Likelihood (1–5) | probability | Direct numeric mapping; if 1–10 scale, divide by 2 and round |
| Impact (1–5) | severity | Direct numeric mapping; if Low/Med/High, map to 2/3/5 |
| Risk Category | category | Map to IMS categories: Operational, Strategic, Compliance, Financial, Reputational |
| Owner Name | assignee | Must be a valid IMS user email address — name lookup required |
| Treatment / Controls | controlMeasures | Free text; paste directly |
| Status (Open/Closed) | status | Map Open → OPEN; Closed → CLOSED |
| Review Date | nextReviewDate | Convert to ISO 8601 format (YYYY-MM-DD) |
| Date Raised | identifiedDate | Convert to ISO 8601 format (YYYY-MM-DD) |
| Department | department | Match to IMS department list in Settings |
| Residual Likelihood | residualProbability | Same scale mapping as probability |
| Residual Impact | residualSeverity | Same scale mapping as severity |

## Data Quality Rules

- All risks MUST have a valid assignee email address matching an active IMS user
- Probability and severity values must be integers in the range 1–5
- Title must not be blank; description is optional but recommended
- Status must be exactly OPEN or CLOSED (case-sensitive in the import file)
- Dates must be in ISO 8601 format: YYYY-MM-DD
- No two risks may share the same externalId (if provided)
- ControlMeasures text is limited to 2,000 characters per field

## Post-Migration Verification

- [ ] Compare total risk count: rows in Excel vs. records imported into IMS (counts must match)
- [ ] Spot-check 10 randomly selected risks — verify all fields transferred correctly
- [ ] Confirm all risk owners can see their assigned risks in My Risks dashboard
- [ ] Verify the risk heat map displays correctly (check distribution across severity/probability matrix)
- [ ] Run the Risk Register report in IMS and compare totals to the Excel summary tab
- [ ] Update the heat map colour thresholds in Risk Management > Settings to match your previous configuration
- [ ] Archive the Excel file with a note referencing the IMS migration date
- [ ] Send a communication to all risk owners informing them the register is now live in IMS

## Common Migration Issues

- **Issue**: Import validation fails with "Assignee not found" → **Fix**: The owner email is not yet registered in IMS. Create the user account in Settings > Users first, then re-run the import.
- **Issue**: Risk count in IMS is lower than Excel → **Fix**: Duplicate rows were merged during deduplication, or some rows had empty mandatory fields and were skipped. Check the import error log for skipped records.
- **Issue**: Probability/severity values show as 0 after import → **Fix**: Non-numeric values in those columns (e.g. "High") were not converted. Use the mapping table to convert to integers before import.
- **Issue**: Heat map shows all risks in wrong quadrant → **Fix**: The probability and severity columns were swapped during mapping. Re-import with correct column order.
- **Issue**: Special characters in risk titles appear garbled → **Fix**: Export the Excel file as CSV with UTF-8 encoding (not Windows-1252). Check the encoding option in Excel's Save As dialog.
`,
  },
  {
    id: 'KB-MIG-002',
    title: 'Migrating from a Legacy Document Management System to IMS',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['migration', 'document-control', 'data-migration'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Migrating from a Legacy Document Management System to IMS

## Overview

This guide covers migrating your existing document library from a legacy DMS, SharePoint, or network folder structure into the IMS Document Control module. The process involves auditing your current library, setting up the IMS folder structure, and bulk uploading documents with their metadata.

## Before You Migrate

- [ ] Export a full document register from your legacy system (document number, title, revision, status, owner, category)
- [ ] Identify and retire all obsolete or superseded documents — do not migrate them
- [ ] Decide on your IMS folder/category taxonomy before uploading any files
- [ ] Ensure all document owners have active IMS accounts
- [ ] Download the IMS document metadata import template from Settings > Import Templates > Document Control
- [ ] Verify available storage quota in IMS (Settings > Storage)
- [ ] Schedule a document freeze: no new revisions should be issued in the legacy system after the cut-off date

## Data Audit

**Retire obsolete documents:** Any document marked Obsolete, Cancelled, or Superseded in the legacy system should NOT be migrated. Archive these in the legacy system with a migration note.

**Identify live documents:** Only migrate documents with status Active, Current, or Approved. These become PUBLISHED in IMS.

**Collect metadata:** For each live document, confirm: document number, title, current revision number, owner name/email, category, issue date, and next review date. Missing metadata must be filled in before import.

**Check for duplicates:** Ensure no two documents share the same document number. If the legacy system allowed duplicates, resolve them now by renumbering or merging.

**File format audit:** IMS Document Control accepts PDF, DOCX, XLSX, PPTX, and TXT. Convert any legacy formats (e.g. .doc, .xls, .pages) to their modern equivalents before migration.

## Migration Steps

1. Set up the IMS folder/category structure in Document Control > Settings > Categories. This must be done before uploading files.
2. Prepare document bundles: create one ZIP archive per category containing the documents for that category.
3. For each category, complete the metadata import template (one row per document).
4. Navigate to Document Control > Import > Bulk Upload.
5. Upload the ZIP archive for a category. IMS will unpack it and list the files detected.
6. Upload the corresponding metadata CSV for that category to map files to metadata.
7. Click Validate. Review all mapping conflicts or missing field errors.
8. Confirm the import for that category.
9. Repeat steps 4–8 for each category.
10. Run post-migration verification once all categories are complete.

## Field Mapping Guide

| Legacy Field | IMS Field | Notes/Transform |
|---|---|---|
| Document No | referenceNumber | Must be unique; preserve legacy numbering |
| Document Title | title | 500 character limit |
| Revision / Version | version | Convert to integer (e.g. Rev C → 3, v2.1 → 2) |
| Document Owner | documentOwner | Must be a valid IMS user email address |
| Category / Type | category | Map to IMS category taxonomy configured in Step 1 |
| Status (Active) | status | Active/Current/Approved → PUBLISHED |
| Status (Obsolete) | status | Do not import — retire in legacy system only |
| Issue Date | issuedDate | ISO 8601 format: YYYY-MM-DD |
| Review Date | nextReviewDate | ISO 8601 format: YYYY-MM-DD |
| Approver | approvedBy | Must be a valid IMS user email address |
| Location / File Path | (file upload) | Handled by ZIP bundle — not a metadata field |
| Confidentiality | accessLevel | Map to IMS levels: PUBLIC, INTERNAL, CONFIDENTIAL, RESTRICTED |

## Data Quality Rules

- Reference numbers must be unique across the entire IMS document library
- Documents must have at least: referenceNumber, title, version, documentOwner, and category
- Version must be a positive integer
- documentOwner and approvedBy must be valid active IMS user emails
- File names within a ZIP must match the filename column in the metadata CSV exactly (case-sensitive)
- Maximum file size per document: 100 MB
- No more than 500 documents per ZIP archive

## Post-Migration Verification

- [ ] Compare document count: legacy system active documents vs. IMS published documents
- [ ] Spot-check 10 documents — open each and verify correct file, metadata, and version
- [ ] Confirm all document owners receive an email notification that their documents are live in IMS
- [ ] Verify that documents requiring periodic review appear on the Document Review dashboard
- [ ] Test document search: search by reference number and by keyword to confirm full-text indexing worked
- [ ] Confirm access controls are correct — restricted documents are not visible to general users
- [ ] Notify all staff that the legacy DMS is now read-only and IMS is the system of record

## Common Migration Issues

- **Issue**: "Duplicate reference number" validation error → **Fix**: Two documents in your import batch share the same reference number. Check your metadata CSV for duplicates and renumber one.
- **Issue**: Files in the ZIP are not matched to metadata rows → **Fix**: File names in the ZIP do not match the filename column exactly. Check for trailing spaces, different extensions, or case mismatches.
- **Issue**: Document owners report they cannot find their documents → **Fix**: The access level was set to RESTRICTED. Adjust the access level in Document Control > Edit Document or re-import with correct access level.
- **Issue**: PDF files open but appear blank in the IMS viewer → **Fix**: The PDF is password-protected. Remove the password protection before uploading.
- **Issue**: Import is slow and times out for large batches → **Fix**: Split the ZIP into smaller batches of 100–200 documents and import sequentially.
`,
  },
  {
    id: 'KB-MIG-003',
    title: 'Migrating Incident Records from a Spreadsheet',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['migration', 'incidents', 'excel', 'data-migration'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Migrating Incident Records from a Spreadsheet

## Overview

This guide covers migrating historical incident records from a spreadsheet into the IMS Incidents module. Historical incident data is critical for trend analysis, regulatory reporting, and year-on-year comparisons. This migration focuses on preserving data integrity while mapping legacy field names and values to IMS standards.

## Before You Migrate

- [ ] Obtain the full incident history spreadsheet (at minimum the last 3 years)
- [ ] Confirm the regulatory reporting scope — identify all RIDDOR (UK) or OSHA (US) reportable incidents in the historical data
- [ ] Ensure all locations referenced in the spreadsheet exist in IMS (Settings > Locations)
- [ ] Ensure all user accounts for investigators and reporters exist in IMS
- [ ] Download the IMS incident import template from Settings > Import Templates > Incidents
- [ ] Decide on the historical data cut-off date (e.g. only import incidents from the last 5 years)

## Data Audit

**Standardise date formats:** Legacy spreadsheets frequently mix date formats (DD/MM/YYYY, MM-DD-YY, written dates). Convert all dates to ISO 8601 format (YYYY-MM-DD) before import. Excel's TEXT formula or a Python script can automate this.

**Map severity labels to IMS values:** IMS uses a fixed severity enumeration. Your legacy labels must be mapped exactly:

| Legacy Label | IMS Value |
|---|---|
| Near Miss / First Aid | MINOR |
| Minor Injury / Restricted Work | MODERATE |
| Lost Time Injury (LTI) | MAJOR |
| Serious Injury / Hospitalisation | CRITICAL |
| Fatality / Multiple Casualties | CATASTROPHIC |

**Handle null investigation fields:** Many historical incidents may have incomplete investigation data. IMS allows these fields to be blank for imported records. Do not attempt to fabricate investigation data. Import what exists.

**Identify duplicates:** Check for duplicate incident reference numbers. If the spreadsheet used sequential numbering that restarted each year, prefix the year (e.g. 2023-INC-001) to ensure uniqueness.

## Migration Steps

1. Export the cleaned spreadsheet as CSV (UTF-8 encoding).
2. Open the IMS incident import template.
3. Map columns using the field mapping guide below.
4. For location fields, look up the IMS Location ID from Settings > Locations and use the ID (not the name).
5. Navigate to Incidents > Import > Upload File.
6. Upload the CSV and click Validate.
7. Review validation errors: missing mandatory fields, invalid severity values, or unknown location IDs.
8. Fix errors and re-upload until zero validation errors remain.
9. Click Confirm Import. IMS will create all incident records with status CLOSED (historical records).
10. Verify the import using the steps below.

## Field Mapping Guide

| Legacy Field | IMS Field | Notes/Transform |
|---|---|---|
| Incident ID / Ref | externalId | Preserves legacy reference; prefix year if needed |
| Date of Incident | dateOccurred | ISO 8601: YYYY-MM-DD — NOT incidentDate |
| Incident Title | title | 255 character limit — NOT incidentTitle |
| Description | description | Full narrative; paste directly |
| Location | locationId | Look up IMS Location ID — do not use text name |
| Injured Person Name | injuredPersonName | Free text |
| Department | department | Match to IMS department list |
| Severity | severity | Must be MINOR/MODERATE/MAJOR/CRITICAL/CATASTROPHIC (uppercase) |
| RIDDOR/OSHA Reportable | reportable | Boolean: true/false |
| Reporter Name | reportedBy | IMS user email address |
| Investigator Name | investigatorId | IMS user email address |
| Root Cause | rootCause | Free text; paste directly |
| Corrective Actions Taken | correctiveActions | Free text; paste directly |
| Date Closed | closedAt | ISO 8601: YYYY-MM-DD |

## Data Quality Rules

- dateOccurred is mandatory; records without a date cannot be imported
- severity must be exactly one of the five uppercase enum values
- title must not be blank
- If reportable is true, regulatory fields (e.g. RIDDOR category) must also be populated
- locationId must match an existing location in IMS Settings
- Dates must not be in the future
- externalId must be unique across the import batch

## Post-Migration Verification

- [ ] Verify RIDDOR/OSHA reportable count matches the count in your legacy system
- [ ] Generate the Year-on-Year Incident Trend report in Incidents > Reports and confirm the historical data populates correctly
- [ ] Spot-check 10 incidents across different years and verify all fields transferred correctly
- [ ] Confirm the Incident Frequency Rate (IFR) and Incident Severity Rate (ISR) calculations in the analytics dashboard match your historical calculations
- [ ] Verify that closed incidents show status CLOSED and cannot be edited without a re-open action
- [ ] Run the Regulatory Reportable Incidents report and cross-reference with your legacy RIDDOR/OSHA submission records

## Common Migration Issues

- **Issue**: "Invalid severity value" for records where severity is 'Moderate' (mixed case) → **Fix**: IMS requires uppercase. Use a find/replace in your CSV to uppercase all severity values before import.
- **Issue**: Date fields import as wrong dates (day and month swapped) → **Fix**: Excel interpreted dates in MM/DD format. Reformat all dates to YYYY-MM-DD using a formula or text editor.
- **Issue**: Year-on-year trend chart shows gaps for earlier years → **Fix**: The historical cut-off date excluded those years. Re-import with an earlier cut-off, or accept the limitation and note it in your reporting commentary.
- **Issue**: Location IDs not found → **Fix**: Location names in the spreadsheet do not match IMS. Create missing locations in Settings > Locations first, then re-map the IDs.
- **Issue**: Imported records are missing from the Incidents list view → **Fix**: The list view defaults to filter 'Open' records only. Change the filter to 'All Statuses' or 'Closed' to see historical records.
`,
  },
  {
    id: 'KB-MIG-004',
    title: 'Migrating Training Records from HR System or Spreadsheet',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['migration', 'training', 'data-migration', 'hr'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Migrating Training Records from HR System or Spreadsheet

## Overview

This guide covers migrating historical training completion records into the IMS Training Tracker module. Accurate training history ensures that IMS correctly calculates who is compliant, who is overdue, and what training gaps exist — without falsely triggering notifications for training that was completed before IMS was implemented.

## Before You Migrate

- [ ] Export training records from your HR system or spreadsheet (employee ID, training item, completion date, score if applicable, expiry date if applicable)
- [ ] Create the training item library in IMS first: every training course/item referenced in your historical data must exist in Training Tracker > Manage Training Items
- [ ] Ensure all employee records are imported into the IMS HR module before importing training records (employee ID must exist)
- [ ] Confirm your organisation's competency scoring scale (e.g. pass mark, competency levels) and map it to IMS levels
- [ ] Download the IMS training record import template from Settings > Import Templates > Training
- [ ] Determine the historical import window (e.g. only completions within validity period + 1 year prior)

## Data Audit

**Employee ID alignment:** Training records must reference the same employee ID used in the IMS HR module. If your HR system uses a different ID format than IMS, create a mapping table before import.

**Training item library first:** Do not import training records for courses that do not yet exist in IMS. Go to Training Tracker > Manage Training Items and create each course with its validity period (the duration in months before re-certification is required). Training records will be rejected if the training item ID is unrecognised.

**Completion date vs expiry date:** If your legacy data only has a completion date (not an expiry), IMS can calculate the expiry automatically based on the training item's validity period — leave the expiryDate field blank and IMS will calculate it on import.

**Score to competency mapping:** If your legacy data records a numeric score, map it to IMS competency levels:

| Score Range | IMS Competency Level |
|---|---|
| 0–49% | NOT_COMPETENT |
| 50–69% | DEVELOPING |
| 70–84% | COMPETENT |
| 85–94% | PROFICIENT |
| 95–100% | EXPERT |

**Historical completions with no score:** Many records (e.g. induction, on-the-job training, attendance) may have no score. Set competency to COMPETENT for passed attendance-based training.

## Migration Steps

1. Create all training items in Training Tracker > Manage Training Items.
2. Verify all employee records exist in the HR module.
3. Export and clean training records — one row per employee per training completion.
4. Map columns to the import template using the field mapping guide below.
5. Navigate to Training Tracker > Import > Upload File.
6. Upload the CSV and click Validate.
7. Resolve any validation errors (unknown employee IDs, unknown training item IDs, invalid dates).
8. Click Confirm Import.
9. Immediately run the Training Gap Report — verify it reflects historical completions correctly before sending any automated notifications.

## Field Mapping Guide

| Legacy Field | IMS Field | Notes/Transform |
|---|---|---|
| Employee ID | employeeId | Must match IMS HR module employee ID |
| Training Course Name | trainingItemId | Look up IMS training item ID by name |
| Completion Date | completedAt | ISO 8601: YYYY-MM-DD |
| Expiry / Renewal Date | expiryDate | ISO 8601: YYYY-MM-DD; leave blank to auto-calculate |
| Score (%) | score | Numeric 0–100; leave blank if not applicable |
| Competency Level | competencyLevel | NOT_COMPETENT / DEVELOPING / COMPETENT / PROFICIENT / EXPERT |
| Pass / Fail | passed | Boolean: true/false |
| Delivery Method | deliveryMethod | CLASSROOM / ONLINE / ON_THE_JOB / EXTERNAL / BLENDED |
| Trainer / Provider | provider | Free text |
| Certificate Number | certificateNumber | Free text; optional |

## Data Quality Rules

- employeeId must match an existing employee in the IMS HR module
- trainingItemId must match an existing training item in Training Tracker
- completedAt is mandatory; records without a completion date are rejected
- passed must be true or false — records with false will not count toward competency
- expiryDate, if provided, must be later than completedAt
- Score must be 0–100 if provided; leave blank rather than entering 'N/A'
- One row per training completion per employee (multiple rows allowed for the same employee and course if re-certified over time)

## Post-Migration Verification

- [ ] Run the Training Gap Report (Training Tracker > Reports > Training Gap) and confirm it reflects historical completions
- [ ] Verify that employees with valid historical completions are NOT shown as overdue
- [ ] Spot-check 10 employee profiles and confirm their training history is complete and accurate
- [ ] Confirm expiry dates are calculated correctly for records where expiryDate was left blank
- [ ] Check that the Competency Matrix report shows expected skill coverage across departments
- [ ] CRITICAL: Disable or delay automated training reminder notifications until verification is complete — sending overdue notifications to employees who are actually compliant causes confusion and erodes trust in the system

## Common Migration Issues

- **Issue**: Training Gap Report shows all historical training as overdue → **Fix**: The training item validity period in IMS is set shorter than the actual re-certification requirement. Update the validity period on the training item and re-run the gap calculation.
- **Issue**: Employee IDs not found → **Fix**: The HR import has not been completed yet, or employee IDs differ between systems. Complete the HR migration first (see KB-MIG-011).
- **Issue**: Training items referenced in historical data do not exist → **Fix**: Create missing training items in Training Tracker > Manage Training Items before re-running the import.
- **Issue**: Duplicate training records after import → **Fix**: The source data had multiple identical rows (same employee, same course, same date). Deduplicate the CSV before re-importing. IMS does not automatically prevent duplicate completions.
- **Issue**: Competency levels all show COMPETENT even for failed training → **Fix**: The 'passed' column defaulted to true during mapping. Correct the passed values and re-import.
`,
  },
  {
    id: 'KB-MIG-005',
    title: 'Migrating Supplier Data from Procurement System',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['migration', 'supplier', 'procurement', 'data-migration'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Migrating Supplier Data from Procurement System

## Overview

This guide covers migrating your supplier master data from an ERP or procurement system (such as SAP, Oracle, or a spreadsheet) into the IMS Supplier Management module. A clean supplier list is the foundation for supplier evaluation, performance tracking, and portal access.

## Before You Migrate

- [ ] Export the supplier master list from your ERP/procurement system
- [ ] Confirm with Procurement which suppliers are currently active and which should be excluded
- [ ] Identify your top-tier / critical suppliers who should be prioritised for portal invitations post-migration
- [ ] Ensure IMS supplier categories are configured in Settings > Supplier Categories before import
- [ ] Download the IMS supplier import template from Settings > Import Templates > Suppliers
- [ ] Collect ISO 3166-2 country codes for all supplier countries (required by IMS)

## Data Audit

**Remove inactive suppliers:** Do not migrate suppliers who have been deactivated, blacklisted, or had no transactions in the last 3 years. These clutter the system and can trigger unnecessary evaluations.

**Standardise country codes:** IMS requires ISO 3166-2 country codes (e.g. GB, DE, US, AU). Convert any freetext country names to ISO codes. A lookup table is available in the IMS import template reference sheet.

**Map supplier categories to IMS taxonomy:** Your ERP category codes may not match IMS supplier categories. Review the IMS category list (Settings > Supplier Categories) and create a mapping table. Suppliers with unmapped categories must be assigned the closest IMS category or a new category must be created.

**Resolve duplicate vendors:** ERPs frequently create duplicate vendor records for the same supplier (e.g. different payment terms or addresses). Consolidate duplicates to a single IMS supplier record with the primary address.

**Gather contact information:** IMS supplier records can store a primary contact name and email. Collect these from your ERP or procurement team — they are needed for portal invitations later.

## Migration Steps

1. Export the cleaned supplier list as CSV.
2. Open the IMS supplier import template.
3. Map columns using the field mapping guide below.
4. Ensure all supplier categories used in your data exist in IMS Settings > Supplier Categories.
5. Navigate to Suppliers > Import > Upload File.
6. Upload the CSV and click Validate.
7. Review validation errors (unknown categories, invalid country codes, missing mandatory fields).
8. Fix errors and re-upload until zero validation errors remain.
9. Click Confirm Import.
10. After import, invite key suppliers to the IMS Supplier Portal.

## Field Mapping Guide

| Legacy Field | IMS Field | Notes/Transform |
|---|---|---|
| Vendor No / Supplier Code | externalId | Preserves ERP reference; enables future sync |
| Vendor Name / Supplier Name | name | 255 character limit |
| Category / Commodity Code | supplierCategory | Must match an existing IMS supplier category |
| Status (Active) | status | Active → APPROVED |
| Status (Inactive/Blocked) | status | Do not import — exclude from CSV |
| Country | country | ISO 3166-2 two-letter country code (e.g. GB, US) |
| Address Line 1 | addressLine1 | Free text |
| City | city | Free text |
| Postal Code | postalCode | Free text |
| Primary Contact Name | contactName | Free text |
| Primary Contact Email | contactEmail | Valid email address |
| Phone | phone | Include country dialling code |
| Registration No / VAT No | registrationNumber | Free text; optional |
| Payment Terms (days) | paymentTermsDays | Integer (e.g. 30, 60, 90) |
| Currency | currency | ISO 4217 three-letter code (e.g. GBP, USD, EUR) |

## Data Quality Rules

- name and country are mandatory for all records
- country must be a valid ISO 3166-2 two-letter code
- supplierCategory must match an existing IMS category
- contactEmail, if provided, must be a valid email format
- externalId must be unique within the import batch
- status must be APPROVED for all imported records (do not import blocked/inactive suppliers)
- paymentTermsDays must be a positive integer if provided

## Post-Migration Verification

- [ ] Compare supplier count: ERP active vendor count vs. IMS imported supplier count
- [ ] Spot-check 10 supplier records and verify name, country, category, and contact details are correct
- [ ] Confirm all supplier categories are assigned correctly
- [ ] Verify the Supplier List view loads without errors and filters work (by category, by country, by status)
- [ ] Invite the top 20 critical suppliers to the IMS Supplier Portal (Suppliers > Invite to Portal)
- [ ] Ask invited suppliers to upload their current certificates and insurance documents
- [ ] Notify the Procurement team that IMS is now the system of record for supplier management

## Common Migration Issues

- **Issue**: "Unknown supplier category" validation error → **Fix**: The category in the CSV does not exactly match an IMS category name. Check capitalisation and spelling in Settings > Supplier Categories.
- **Issue**: "Invalid country code" error → **Fix**: Country names were not converted to ISO codes. Use the ISO 3166-2 reference sheet in the import template tab.
- **Issue**: Duplicate supplier records after import → **Fix**: The source ERP had duplicate vendor records that were not consolidated. Merge duplicates in Suppliers > Manage Suppliers using the Merge function.
- **Issue**: Contact email bounces when portal invitation is sent → **Fix**: ERP contact data was outdated. Ask Procurement to verify and update contact emails directly in IMS before re-sending invitations.
- **Issue**: Supplier count in IMS is much lower than expected → **Fix**: Inactive suppliers were filtered out in the data audit phase. If more historical suppliers are needed, adjust the inactivity threshold and re-export from ERP.
`,
  },
  {
    id: 'KB-MIG-006',
    title: 'Migrating Audit Findings and CAPAs from Legacy System',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['migration', 'audit', 'capa', 'data-migration'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Migrating Audit Findings and CAPAs from Legacy System

## Overview

This guide covers migrating audit findings and Corrective Action/Preventive Action (CAPA) records from a legacy audit management system or spreadsheet into the IMS Audit Management module. The critical decision in this migration is what to migrate: only open and in-progress items should be brought into IMS. Closed historical findings should remain in the legacy system as a read-only archive.

## Before You Migrate

- [ ] Export all open and in-progress findings and CAPAs from the legacy system
- [ ] Closed findings from more than 6 months ago should NOT be migrated — archive them in the legacy system
- [ ] Create historical "shell" audit records in IMS first — each finding must be linked to an audit event
- [ ] Ensure all CAPA owners have active IMS accounts
- [ ] Confirm the IMS finding severity taxonomy (OBSERVATION, MINOR_NC, MAJOR_NC, OFI) matches your intended mappings
- [ ] Download the IMS audit finding and CAPA import templates from Settings > Import Templates > Audits
- [ ] Notify CAPA owners in advance that their actions will be moving to IMS

## Data Audit

**Open vs closed items:** Only migrate findings and CAPAs with status Open, In Progress, Awaiting Verification, or Overdue. Items marked Closed, Verified, or Accepted are historical records — leave them in the legacy system.

**Create audit shell records first:** IMS findings must be linked to an audit record (the audit event that generated them). For historical audits, create shell audit records in Audit Management > Add Audit with the correct audit name, date, type, and standard. Record the IMS audit ID for use in the finding import.

**Map finding severity:** Legacy systems use varied severity terminology. Map to IMS values:

| Legacy Label | IMS Value |
|---|---|
| Observation / Note | OBSERVATION |
| Minor Nonconformity / NC | MINOR_NC |
| Major Nonconformity / NC | MAJOR_NC |
| Opportunity for Improvement / OFI | OFI |

**Standard clause references:** If your legacy findings reference standard clauses (e.g. ISO 9001 clause 8.4.1), capture these in the clause field. If the legacy system used different clause references, map them to the correct standard clause numbering.

## Migration Steps

1. Create audit shell records in IMS for each historical audit that has open findings.
2. Note the IMS Audit ID for each shell audit (visible in Audit Management > Audit List).
3. Export open findings as CSV and map to the findings import template.
4. Export open CAPAs as CSV and map to the CAPA import template.
5. Navigate to Audit Management > Import > Findings, upload the findings CSV.
6. Validate and fix any errors.
7. Confirm the findings import.
8. Navigate to Audit Management > Import > CAPAs, upload the CAPA CSV.
9. Validate, fix errors, and confirm the CAPA import.
10. Run post-migration verification.

## Field Mapping Guide

### Audit Findings

| Legacy Field | IMS Field | Notes/Transform |
|---|---|---|
| Finding Ref | referenceNumber | Preserve legacy reference for traceability |
| Audit Name / Ref | auditId | Look up IMS Audit ID from shell audit created in Step 1 |
| Standard Clause | clause | e.g. 'ISO 9001:2015 Clause 8.4.1' |
| Finding Type / Severity | severity | OBSERVATION / MINOR_NC / MAJOR_NC / OFI |
| Finding Description | description | Full text; paste directly |
| Evidence | evidence | Free text description of evidence observed |
| Auditee Department | department | Match to IMS department list |
| Due Date | dueDate | ISO 8601: YYYY-MM-DD |
| Status | status | Map open statuses to OPEN; in-progress to IN_PROGRESS |

### CAPAs

| Legacy Field | IMS Field | Notes/Transform |
|---|---|---|
| CAPA Ref | referenceNumber | Preserve legacy reference |
| Linked Finding Ref | findingId | Look up IMS Finding ID after findings are imported |
| CAPA Owner | assigneeId | IMS user email address |
| Root Cause Description | rootCause | Free text |
| Proposed Action | actionDescription | Free text |
| Target Date | targetDate | ISO 8601: YYYY-MM-DD |
| Status | status | OPEN / IN_PROGRESS / AWAITING_VERIFICATION |
| Priority | priority | LOW / MEDIUM / HIGH / CRITICAL |

## Data Quality Rules

- Every finding must be linked to a valid IMS audit ID
- severity must be exactly one of the four uppercase enum values
- CAPA findingId must reference a finding that exists in IMS (import findings before CAPAs)
- assigneeId must be a valid IMS user email address
- dueDate and targetDate must be in the future or within the last 90 days (overdue is accepted)
- referenceNumber must be unique within the import batch

## Post-Migration Verification

- [ ] Verify finding count: open findings in legacy system vs. open findings in IMS
- [ ] Verify CAPA count: open CAPAs in legacy system vs. open CAPAs in IMS
- [ ] Confirm all CAPA owners receive a notification that their actions are now live in IMS
- [ ] Spot-check 10 finding-CAPA pairs and verify the linkage is correct
- [ ] Verify due dates are showing correctly in the CAPA dashboard
- [ ] Run the Overdue CAPA report and confirm it matches the legacy system's overdue list
- [ ] Set the legacy system to read-only for the migrated date range

## Common Migration Issues

- **Issue**: "Audit ID not found" when importing findings → **Fix**: The audit shell record was not created, or the ID was copied incorrectly. Verify the audit ID in Audit Management > Audit List and update the CSV.
- **Issue**: CAPAs imported but not linked to findings → **Fix**: Findings were imported after CAPAs. IMS finding IDs were not known when the CAPA CSV was prepared. Re-export IMS finding IDs after findings import, update the CAPA CSV, and re-import CAPAs.
- **Issue**: CAPA owners report they cannot see their assigned CAPAs → **Fix**: The assigneeId email does not match the user's IMS login email. Check user accounts in Settings > Users and update if emails differ.
- **Issue**: Finding severity values are invalid → **Fix**: Legacy severity labels were not converted to the four IMS enum values. Check for mixed-case values or whitespace. Apply a find/replace in the CSV.
- **Issue**: Overdue CAPAs do not appear on the dashboard → **Fix**: The dashboard defaults to 'My CAPAs' view. Switch to 'All CAPAs' and filter by status 'OPEN' and due date 'Past due'.
`,
  },
  {
    id: 'KB-MIG-007',
    title: 'Migrating Equipment/Asset Register from CMMS or Spreadsheet',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['migration', 'cmms', 'assets', 'data-migration'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Migrating Equipment/Asset Register from CMMS or Spreadsheet

## Overview

This guide covers migrating an equipment and asset register from a legacy CMMS (Computerised Maintenance Management System) or spreadsheet into the IMS Asset Management and CMMS modules. A complete asset register is the foundation for maintenance scheduling, calibration management, and asset lifecycle tracking.

## Before You Migrate

- [ ] Export the full asset/equipment register from your legacy CMMS or spreadsheet
- [ ] Ensure all locations exist in IMS Settings > Locations — assets must be linked to valid locations
- [ ] Ensure all user accounts for assigned maintainers and technicians exist in IMS
- [ ] Create asset categories in IMS Settings > Asset Categories before import
- [ ] Download the IMS asset import template from Settings > Import Templates > Assets
- [ ] Identify equipment requiring calibration and collect their calibration due dates separately
- [ ] Identify assets with active maintenance schedules — collect the maintenance frequency and last maintenance date

## Data Audit

**Deduplication:** Many legacy CMMS systems accumulate duplicate asset records over time (same equipment registered twice, or spare parts listed as separate assets incorrectly). Sort by asset tag and location to find duplicates. Keep one record per physical asset.

**Standardise asset categories:** Map your legacy equipment types to IMS asset categories. Common IMS categories: Mechanical Equipment, Electrical Equipment, Instrumentation, Vehicles, IT Equipment, Safety Equipment, Furniture, Infrastructure. Create custom categories in Settings if needed.

**Collect serial numbers and install dates:** IMS supports asset tagging using serial numbers and install dates for warranty tracking. Collect these from asset tags, purchase orders, or commissioning records if not in the CMMS.

**Retired/decommissioned assets:** Do not migrate assets that are decommissioned, scrapped, or retired. Mark them as archived in the legacy system.

**Maintenance schedule data:** For each asset with a maintenance schedule, record the maintenance frequency (in days), the last maintenance completion date, and the responsible technician. IMS will calculate the next due date automatically from last completion + frequency.

## Migration Steps

1. Create all asset categories in IMS Settings > Asset Categories.
2. Ensure all locations exist in IMS Settings > Locations.
3. Clean and deduplicate the asset list.
4. Separate calibration-managed equipment into a second CSV for calibration record import.
5. Open the IMS asset import template and map columns.
6. Navigate to Asset Management > Import > Upload File.
7. Upload the asset CSV and click Validate.
8. Fix validation errors (invalid location IDs, unknown categories, missing mandatory fields).
9. Click Confirm Import.
10. After asset import, navigate to CMMS > Import Maintenance Schedules and import maintenance frequency data.
11. Run post-migration verification.

## Field Mapping Guide

| Legacy Field | IMS Field | Notes/Transform |
|---|---|---|
| Asset No / Tag | assetTag | Must be unique; preserve legacy tag number |
| Equipment Name | name | 255 character limit |
| Equipment Type / Category | category | Must match IMS asset category |
| Location | locationId | Look up IMS Location ID — do not use text name |
| Serial Number | serialNumber | Free text; optional but recommended |
| Manufacturer | manufacturer | Free text |
| Model | model | Free text |
| Purchase Date / Install Date | installDate | ISO 8601: YYYY-MM-DD |
| Warranty Expiry | warrantyExpiry | ISO 8601: YYYY-MM-DD |
| Responsible Person | assigneeId | IMS user email address |
| Maintenance Interval (days) | maintenanceFrequencyDays | Positive integer (e.g. 90, 180, 365) |
| Last Maintenance Date | lastMaintenanceDate | ISO 8601: YYYY-MM-DD — used to calculate next due |
| Requires Calibration | requiresCalibration | Boolean: true/false |
| Calibration Interval (months) | calibrationIntervalMonths | Positive integer |
| Last Calibration Date | lastCalibrationDate | ISO 8601: YYYY-MM-DD |
| Status | status | ACTIVE / MAINTENANCE / RETIRED |
| Asset Value | purchaseValue | Numeric; used for lifecycle cost reporting |

## Data Quality Rules

- assetTag must be unique across all imported records
- locationId must match an existing IMS location
- category must match an existing IMS asset category
- installDate must not be in the future
- maintenanceFrequencyDays must be a positive integer if provided
- If requiresCalibration is true, calibrationIntervalMonths is mandatory
- status must be ACTIVE, MAINTENANCE, or RETIRED
- assigneeId must be a valid IMS user email address

## Post-Migration Verification

- [ ] Compare asset count: legacy CMMS active assets vs. IMS imported assets
- [ ] Verify the CMMS maintenance schedule shows upcoming maintenance tasks calculated from lastMaintenanceDate + frequency
- [ ] Spot-check 10 asset records and verify all fields (location, category, assignee, maintenance schedule) are correct
- [ ] Confirm the Calibration Due List (CMMS > Calibration > Due List) shows calibration-managed equipment with correct due dates
- [ ] Verify that assets with status MAINTENANCE appear correctly in the CMMS work order queue
- [ ] Run the Asset Register report and confirm the asset count and value totals match the legacy system

## Common Migration Issues

- **Issue**: "Location ID not found" validation errors → **Fix**: Location names in the CMMS do not match IMS. Create the missing locations in Settings > Locations, then re-map the location IDs in the CSV.
- **Issue**: Maintenance schedules are not showing in CMMS after import → **Fix**: maintenanceFrequencyDays was left blank or the CMMS schedule import step was skipped. Re-import maintenance frequency data via CMMS > Import Maintenance Schedules.
- **Issue**: Calibration due dates are calculated incorrectly → **Fix**: lastCalibrationDate was in an unrecognised format. Verify ISO 8601 formatting in the CSV.
- **Issue**: Duplicate asset tags after import → **Fix**: The legacy CMMS had duplicate tag numbers. One record was imported and the duplicate was rejected. Review the import error log for rejected records.
- **Issue**: All assets show as maintenance overdue on first login → **Fix**: lastMaintenanceDate is blank for many records, so IMS calculated next due from installDate using the frequency. Update lastMaintenanceDate for critical assets to avoid false overdue alerts.
`,
  },
  {
    id: 'KB-MIG-008',
    title: 'Migrating Chemical Register from Spreadsheet',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['migration', 'chemicals', 'reach', 'data-migration'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Migrating Chemical Register from Spreadsheet

## Overview

This guide covers migrating a chemical inventory register from a spreadsheet into the IMS Chemical Register module. The chemical register is a safety-critical dataset — accuracy of CAS numbers, SVHC flags, SDS revision dates, and storage locations is essential for regulatory compliance under REACH, GHS/CLP, and COSHH.

## Before You Migrate

- [ ] Obtain the current chemical inventory spreadsheet — ensure it is the most recent version
- [ ] Download current SDS (Safety Data Sheet) documents for all chemicals; the SDS revision date is required
- [ ] Ensure all storage locations exist in IMS Settings > Locations
- [ ] Verify the REACH SVHC (Substances of Very High Concern) candidate list — check each chemical against the current ECHA SVHC list
- [ ] Create chemical categories in IMS Settings > Chemical Categories if custom categories are needed
- [ ] Download the IMS chemical import template from Settings > Import Templates > Chemicals
- [ ] Assign a responsible Safety Officer to review the imported register post-migration

## Data Audit

**Current SDS version:** Every chemical in the register must have a current SDS. The SDS must be reviewed and re-issued by the supplier every 5 years. Remove chemicals from the import where the SDS is more than 5 years old — obtain updated SDS before importing.

**CAS number accuracy:** CAS (Chemical Abstracts Service) registry numbers identify chemical substances uniquely. Verify each CAS number format: correct format is XXXXXXX-YY-Z where X is up to 7 digits, Y is 2 digits, and Z is 1 check digit. Invalid CAS numbers will fail import validation.

**SVHC flags:** Cross-check each chemical CAS number against the current ECHA Candidate List of SVHCs (https://echa.europa.eu/candidate-list-table). Update the SVHC flag accordingly. This is a safety-critical step — SVHC status determines notification obligations and substitution requirements.

**Quantity and unit split:** Legacy spreadsheets often have quantity and unit in a single column (e.g. "50 kg", "200 L"). IMS requires these as separate fields: quantity (numeric) and unit (enumeration). Split these during data preparation.

**Storage location IDs:** IMS requires storage locations to be referenced by location ID, not name. Map each storage location text to the corresponding IMS Location ID from Settings > Locations.

## Migration Steps

1. Audit the chemical register: verify SDS dates, CAS numbers, SVHC flags, and quantities.
2. Split quantity and unit columns.
3. Map storage locations to IMS Location IDs.
4. Open the IMS chemical import template and map columns.
5. Upload SDS documents to IMS Document Control (optional but recommended) and note document IDs.
6. Navigate to Chemicals > Import > Upload File.
7. Upload the CSV and click Validate.
8. Review validation errors (invalid CAS numbers, unknown location IDs, missing mandatory fields).
9. Fix errors and re-upload until zero validation errors remain.
10. Click Confirm Import.
11. Run post-migration verification.

## Field Mapping Guide

| Legacy Field | IMS Field | Notes/Transform |
|---|---|---|
| Chemical Name / Trade Name | name | 255 character limit |
| CAS Number | casNumber | Format: XXXXXXX-YY-Z — validate before import |
| Chemical Category | category | Match to IMS chemical category |
| Storage Location | storageLocationId | IMS Location ID — not free text |
| Quantity | quantity | Numeric only; split from combined quantity+unit column |
| Unit | unit | KG / L / ML / G / M3 / UNITS — IMS enum values |
| SDS Date / SDS Revision Date | sdsRevisionDate | ISO 8601: YYYY-MM-DD |
| SDS Document | sdsDocumentId | Optional: IMS Document Control ID if SDS is uploaded |
| SVHC (Yes/No) | isSVHC | Boolean: true/false |
| Hazard Classification (GHS) | ghsHazards | Comma-separated list: FLAMMABLE, TOXIC, CORROSIVE, OXIDISING, etc. |
| PPE Required | ppeRequired | Comma-separated: GLOVES, GOGGLES, RESPIRATOR, APRON, BOOTS |
| Signal Word | signalWord | DANGER / WARNING |
| Maximum Stock Quantity | maxStockQuantity | Numeric; same unit as quantity |
| Supplier Name | supplierName | Free text; optional |
| Risk Level | riskLevel | LOW / MEDIUM / HIGH / EXTREME |

## Data Quality Rules

- name and casNumber are mandatory for all records
- casNumber must follow the XXXXXXX-YY-Z format and pass the CAS checksum algorithm
- storageLocationId must match an existing IMS location
- isSVHC must be true or false — cannot be blank for chemicals with a valid CAS number
- sdsRevisionDate must not be more than 5 years in the past
- quantity must be a positive numeric value
- unit must be one of the IMS enum values: KG, L, ML, G, M3, UNITS
- riskLevel must be LOW, MEDIUM, HIGH, or EXTREME

## Post-Migration Verification

- [ ] Compare chemical count: spreadsheet rows vs. IMS imported chemicals
- [ ] Verify REACH SVHC list alignment: run Chemicals > Reports > SVHC Chemicals and cross-reference with the current ECHA candidate list
- [ ] Spot-check 10 chemical records and verify CAS number, SDS date, storage location, and SVHC flag
- [ ] Notify the Safety Officer and relevant department heads of any EXTREME or HIGH risk chemicals flagged during import
- [ ] Configure legal limit alerts: Chemicals > Settings > Alert Thresholds for chemicals with maximum stock quantity limits
- [ ] Test the Chemical Register report and verify it is suitable for regulatory inspection purposes
- [ ] Send a summary to the EHS Manager listing all SVHC chemicals and quantities for REACH Article 7 notification assessment

## Common Migration Issues

- **Issue**: "Invalid CAS number" validation error → **Fix**: The CAS number fails the checksum validation. Verify the number against the ECHA database or supplier SDS. Correct any typos.
- **Issue**: SVHC flag is blank for many records → **Fix**: Legacy spreadsheet did not track SVHC status. Cross-check each CAS number against the ECHA SVHC candidate list and update the isSVHC field before re-importing.
- **Issue**: "Unit not recognised" validation error → **Fix**: Legacy unit values (e.g. 'Litres', 'kg', 'ltr') do not match the IMS enum (L, KG, ML). Apply a find/replace to convert to the exact IMS enum values.
- **Issue**: SDS date validation fails for older chemicals → **Fix**: The SDS is more than 5 years old. Obtain an updated SDS from the supplier before importing the chemical. Do not import chemicals without a current SDS.
- **Issue**: Storage location IDs not found → **Fix**: Create the missing storage locations in Settings > Locations, then re-map the location IDs in the CSV.
`,
  },
  {
    id: 'KB-MIG-009',
    title: 'Migrating from a Standalone QMS to IMS',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['migration', 'quality', 'qms', 'data-migration'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Migrating from a Standalone QMS to IMS

## Overview

Migrating from a dedicated Quality Management System (QMS) to IMS is a larger undertaking than a single-dataset migration. It involves multiple data types — documents, nonconformances, CAPAs, audit records, supplier approvals, and more — and requires careful sequencing, a parallel running period, and structured change management communications.

## Before You Migrate

- [ ] Catalogue all data held in the current QMS: documents, NC records, CAPAs, audit records, supplier approvals, training records, KPIs, and system configuration
- [ ] Identify the system owner and data owners for each data type
- [ ] Confirm the go-live date with senior management and build a migration timeline working back from it
- [ ] Ensure all IMS modules are configured: Quality, Document Control, Audits, Suppliers, Training
- [ ] Assign migration leads for each data type (one person responsible per dataset)
- [ ] Notify all QMS users of the migration timeline at least 4 weeks in advance
- [ ] Obtain formal sign-off from the Quality Director before the final cut-over

## Assessment Phase

Before any data movement, conduct a thorough assessment of the existing QMS:

**Document library:** How many documents? How many are live vs. obsolete? What is the folder/category structure? Are documents in the QMS or linked to a SharePoint/file share?

**Nonconformance and CAPA records:** How many open NCs? How many open CAPAs? How many closed records are needed for trend analysis? (Typically last 3 years.)

**Audit records:** How many audits in the last 3 years? Are findings linked to CAPAs? Are audit reports stored in the QMS or separately?

**Supplier approvals:** Is the approved supplier list (ASL) managed in the QMS? Are supplier evaluation scores stored?

**Training records:** Is the QMS used to track quality-specific training, or does a separate HR system hold training records?

## Migration Priority Order

Migrate data in this order to respect dependencies between datasets:

1. **Users and permissions** — All user accounts and roles must exist before any other data can reference them
2. **Document library** — Core reference documents must be available before processes begin in IMS
3. **Open CAPAs** — Actionable items must move so owners can continue working without interruption
4. **Supplier list** — Approved supplier list must be in IMS before supplier evaluations or orders are linked
5. **Audit schedule and open findings** — Upcoming audits and open findings must transfer to ensure continuity
6. **Historical data** (NC records, closed CAPAs, closed audits) — Historical records for trend analysis; lower urgency, can follow within 2 weeks of cut-over

## Parallel Running Period

A parallel running period of 4 weeks is strongly recommended. During this period:

- New NCs, CAPAs, and audit findings are entered into IMS only
- The legacy QMS is kept in read-only mode for reference
- Users receive daily support sessions (30 minutes) to resolve questions
- Data discrepancies identified during parallel running are resolved immediately
- At end of week 4, the Quality Director signs off on parallel running completion

## Data Freeze Approach

To prevent data divergence during migration, implement a data freeze:

1. Announce a freeze date 2 weeks in advance: no new documents, NCs, or CAPAs to be created in the legacy QMS after the freeze date
2. Any new quality events after the freeze date are held in a temporary log (paper or simple spreadsheet) for entry into IMS on go-live day
3. Migration team completes data transfer during the freeze window
4. On go-live day, the temporary log is entered into IMS and the legacy QMS is switched to read-only

## Cut-Over Checklist

- [ ] All users created and roles assigned in IMS
- [ ] Document library fully migrated and verified
- [ ] Open CAPAs migrated and owners notified
- [ ] Supplier list migrated and key suppliers invited to portal
- [ ] Audit schedule configured for next 12 months
- [ ] Open findings linked to audit records in IMS
- [ ] Historical NC data migrated (last 3 years)
- [ ] Training records synced with HR module
- [ ] Quality KPIs and targets configured in IMS
- [ ] Legacy QMS switched to read-only
- [ ] All staff notified that IMS is now live
- [ ] Support channel (e.g. Slack channel or email alias) open for first 2 weeks

## Change Management Communications

- **4 weeks before**: Announcement email from Quality Director — why IMS, timeline, who is affected
- **2 weeks before**: Training sessions for power users (CAPA owners, document controllers, audit leads)
- **1 week before**: Reminder email with go-live date and access instructions
- **Go-live day**: "IMS is live" email with quick-start guide links
- **Week 2**: Feedback survey to identify pain points and address quickly

## Post-Migration: Decommission Legacy QMS

- [ ] Obtain formal sign-off from Quality Director confirming IMS data is complete and accurate
- [ ] Export a full data archive from the legacy QMS (for regulatory retention purposes)
- [ ] Store the archive in a secure location with retention policy applied (typically 7–10 years)
- [ ] Remove user access to the legacy QMS
- [ ] Redirect any bookmarks or QMS shortcut links to the IMS URL
- [ ] Cancel the legacy QMS licence (ensure notice period compliance with the vendor)
- [ ] Update the organisation's system register to remove the legacy QMS and add IMS

## Common Migration Issues

- **Issue**: Users resist the new system and continue using legacy QMS → **Fix**: Switch legacy QMS to read-only on the agreed cut-over date. No compromise — the data freeze must be enforced.
- **Issue**: Document links in procedures break because the DMS URL changed → **Fix**: Use IMS Document Control's permanent link feature (document reference number URL). Update procedures to use reference number links rather than direct file paths.
- **Issue**: Historical CAPA data cannot be reconciled with IMS → **Fix**: Accept a clean break for CAPAs older than 2 years. Retain legacy QMS archive for audit inspection purposes.
- **Issue**: Suppliers not found in the IMS supplier list → **Fix**: The supplier list migration (step 4) was incomplete. Complete the supplier import using KB-MIG-005 before migrating CAPA and audit data that references suppliers.
`,
  },
  {
    id: 'KB-MIG-010',
    title: 'Migrating Environmental Monitoring Data',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['migration', 'environment', 'monitoring', 'data-migration'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Migrating Environmental Monitoring Data

## Overview

This guide covers migrating historical environmental monitoring data into the IMS Environmental Management module. Historical data is essential for trend reporting, regulatory submissions, and establishing baseline performance for ISO 14001:2015 objectives. Monitoring data typically includes air emissions, water discharge, waste quantities, and energy consumption.

## Before You Migrate

- [ ] Gather historical monitoring data from all sources: laboratory information management systems (LIMS), spreadsheets, meters, and manual log books
- [ ] Define the historical window to import: typically 3–5 years of data for meaningful trend analysis
- [ ] Confirm the baseline year to be used for trend reporting (the year before IMS go-live is typical)
- [ ] Ensure all monitoring parameter definitions are configured in IMS before import (Environmental Monitoring > Parameters)
- [ ] Confirm standard SI units to be used for each parameter category
- [ ] Download the IMS environmental monitoring data import template from Settings > Import Templates > Environmental
- [ ] Engage your laboratory or EHS data analyst to assist with unit conversions

## Data Audit

**Data source inventory:** List all systems and spreadsheets containing environmental monitoring data. Common sources: LIMS, SCADA, energy meter exports, waste transfer note registers, laboratory reports, manual log books. Each source may have different formats and units.

**Standardise to SI base units:** IMS environmental monitoring uses SI base units for consistency. Convert all measurements before import:

| Parameter Type | Required Unit | Common Conversions |
|---|---|---|
| Air emissions | kg (mass of pollutant) | Convert from mg/m3 using flow rate × concentration |
| Water discharge volume | m3 | Convert from litres (÷ 1000) or gallons (× 3.785 / 1000) |
| Water quality parameters | mg/L | Verify lab report units; ppm is approximately mg/L for dilute solutions |
| Waste quantities | tonnes | Convert from kg (÷ 1000) or lb (÷ 2204.62) |
| Energy consumption | kWh | Convert from MWh (× 1000) or GJ (÷ 0.0036) |
| GHG emissions | tCO2e | Apply emission factors from IMS emission factor library |

**Time-series data structure:** Environmental monitoring data is time-series: one measurement value per monitoring parameter per date (or per monitoring period). The IMS import requires: parameterCode, measurementDate, value, unit. Each row is a single measurement.

**Monitoring parameter alignment:** IMS defines monitoring parameters in the Parameters library (e.g. "NOx emissions — Stack A", "BOD — Effluent outlet"). Your historical data column headers or LIMS parameter codes must be mapped to IMS parameter codes.

**Handling gaps:** Monitoring data often has gaps (no measurement taken, equipment downtime, or seasonal parameters). Leave gaps as gaps — do not interpolate or estimate values for import. IMS handles missing data correctly in trend charts.

## Migration Steps

1. Configure monitoring parameters in Environmental Monitoring > Parameters if not already done.
2. Export historical data from each source system.
3. Standardise all units to SI base units.
4. Restructure data into the time-series format (one row per measurement per date).
5. Map parameter codes to IMS parameter codes.
6. Open the IMS environmental monitoring import template and populate it.
7. Navigate to Environmental Monitoring > Import > Upload Historical Data.
8. Upload the CSV for a specific parameter group (e.g. air emissions) and click Validate.
9. Fix validation errors and re-upload.
10. Confirm import. Repeat for each parameter group.
11. Set the baseline year in Environmental Monitoring > Settings > Baseline Year.
12. Run post-migration verification.

## Field Mapping Guide

| Source Field | IMS Field | Notes/Transform |
|---|---|---|
| Parameter Name / LIMS Code | parameterCode | Look up IMS parameter code in Parameters library |
| Measurement Date | measurementDate | ISO 8601: YYYY-MM-DD |
| Measurement Period Start | periodStart | ISO 8601: YYYY-MM-DD — for monthly/quarterly aggregates |
| Measurement Period End | periodEnd | ISO 8601: YYYY-MM-DD — for monthly/quarterly aggregates |
| Value / Reading | value | Numeric; apply unit conversion before import |
| Unit | unit | SI unit string matching IMS parameter unit definition |
| Sample Location | sampleLocation | Free text or IMS location ID |
| Laboratory | laboratory | Free text; optional |
| Lab Reference | labReference | Free text; optional |
| Compliance Limit | complianceLimit | Numeric; if different from IMS parameter default |
| Within Limit (Y/N) | withinLimit | Boolean: true/false |
| Notes | notes | Free text; optional |

## Data Quality Rules

- parameterCode must match an existing IMS parameter code exactly (case-sensitive)
- measurementDate is mandatory for all records
- value must be numeric; negative values are allowed for some parameters (e.g. net energy import/export)
- unit must match the unit defined on the IMS monitoring parameter
- withinLimit must be true or false if provided; cannot be a formula or text
- Each combination of parameterCode + measurementDate should be unique (no duplicate measurements for the same parameter on the same day)

## Post-Migration Verification

- [ ] Navigate to Environmental Monitoring > Trend Charts and verify historical data populates for the imported period
- [ ] Spot-check 10 data points across different parameters and dates — verify values and units match source records
- [ ] Confirm the baseline year is set correctly and the Year-on-Year Performance report shows the correct baseline values
- [ ] Verify that compliance exceedances in the historical data are correctly flagged (withinLimit = false) and appear on the Compliance Exceedance log
- [ ] Run the ISO 14001 Environmental Performance Indicator report and confirm it reflects historical data
- [ ] Configure legal limit alerts: Environmental Monitoring > Settings > Alert Thresholds — set notification thresholds at 80% of regulatory limits so early warnings are triggered before a breach

## Common Migration Issues

- **Issue**: Trend charts show no data for historical period → **Fix**: The parameterCode in the import CSV does not match the IMS parameter code. Check for case sensitivity and spelling. Re-export IMS parameter codes from the Parameters library and remap.
- **Issue**: Values appear to be off by a factor of 1,000 → **Fix**: Unit conversion was not applied. For example, data was in kg but IMS parameter unit is tonnes. Apply the conversion (÷ 1000) and re-import.
- **Issue**: GHG emissions data is missing from charts → **Fix**: GHG emissions require emission factors to be applied. If importing raw energy data (kWh), IMS can calculate tCO2e using the emission factor library. Enable this in Environmental Monitoring > Settings > GHG Calculation.
- **Issue**: Duplicate measurements after import → **Fix**: The source had multiple measurements for the same parameter on the same date (e.g. hourly readings averaged but also totals). Decide on the correct aggregation level and remove duplicates before re-import.
- **Issue**: Compliance exceedances are not flagged → **Fix**: The complianceLimit or withinLimit fields were blank during import. Set regulatory limits on the monitoring parameter definition and re-run the compliance check (Environmental Monitoring > Run Compliance Check).
`,
  },
  {
    id: 'KB-MIG-011',
    title: 'Migrating Employee Records from HRIS to IMS',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['migration', 'hr', 'employees', 'data-migration', 'hris'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Migrating Employee Records from HRIS to IMS

## Overview

This guide covers migrating active employee records from your existing HRIS (Human Resources Information System) into the IMS HR module. Employee records are foundational: other IMS modules (training, incidents, risk, assets, CAPA) reference employees by their IMS user ID. This migration should therefore be one of the first completed.

## Before You Migrate

- [ ] Extract active employee data only from your HRIS — terminated and historical employees are not migrated in the initial load
- [ ] Obtain the current organisation chart to understand the line manager hierarchy
- [ ] Confirm all department codes/names and map them to IMS departments (HR > Settings > Departments)
- [ ] Confirm all job titles and map them to the IMS job title library if applicable
- [ ] Download the IMS employee import template from Settings > Import Templates > HR > Employees
- [ ] Confirm whether SSO (Single Sign-On) will be used — if yes, the email address must match the SSO identity provider exactly
- [ ] Plan the import order: managers must be imported before their direct reports (hierarchy constraint)

## Data Audit

**Active employees only:** For the initial migration, import only employees with a current active employment status. Employees on long-term leave (e.g. parental leave, long-term sick) should be included with a leave status flag.

**Hierarchy order:** IMS enforces the manager hierarchy at import. A manager must exist in IMS before their direct reports can reference them as manager. This means:
- First pass: import all employees with no manager (top-level executives and standalone employees)
- Second pass: import employees whose manager was imported in the first pass
- Continue until all levels of the hierarchy are imported

For large organisations, a script can sort employees by hierarchy depth before import.

**Name splitting:** Most HRIS systems store full name in a single field. IMS requires firstName and lastName as separate fields. Use the last space as the split point for names with multiple words in the first name (e.g. "Mary Jane Smith" → firstName: "Mary Jane", lastName: "Smith").

**Leave balances:** If your HRIS stores leave balances (annual leave, sick leave entitlement and balance), collect these separately — they map to the IMS Leave Management sub-module. Leave balances are imported after the main employee records.

**Email address as the key:** The employee's email address is the primary login identifier in IMS. Ensure all email addresses are current, unique, and match what will be used for IMS access (particularly important if SSO is in use).

## Migration Steps

1. Configure departments in HR > Settings > Departments.
2. Configure job titles in HR > Settings > Job Titles if using a controlled list.
3. Sort employee data by hierarchy level (executives first, then managers, then staff).
4. Open the IMS employee import template and map columns.
5. Navigate to HR > Employees > Import > Upload File.
6. Upload the first-pass CSV (top-level employees, no manager references) and validate.
7. Fix errors and confirm the first-pass import.
8. For subsequent hierarchy levels, update the managerId column with the IMS Employee ID assigned to each manager (visible in HR > Employees after first pass).
9. Upload and confirm each subsequent pass until all employees are imported.
10. Import leave balances separately via HR > Leave > Import Leave Balances.
11. Run post-migration verification.

## Field Mapping Guide

| Legacy Field | IMS Field | Notes/Transform |
|---|---|---|
| Employee ID | externalId | Preserves HRIS reference; enables future sync |
| First Name | firstName | Split from full name if combined |
| Last Name / Surname | lastName | Split from full name if combined |
| Email Address | email | Must be unique; used as login identifier |
| Department Code / Name | departmentId | Look up IMS Department ID — not free text |
| Job Title | jobTitle | Free text or IMS job title ID |
| Manager Employee ID | managerId | Map to IMS Employee ID of manager (after first pass) |
| Start Date / Service Date | startDate | ISO 8601: YYYY-MM-DD |
| Employment Type | employmentType | FULL_TIME / PART_TIME / CONTRACT / CASUAL |
| Work Location | locationId | IMS Location ID from Settings > Locations |
| Phone (work) | workPhone | Include country dialling code |
| Cost Centre | costCentre | Free text; optional — used for payroll reporting |
| Salary Grade / Band | salaryGrade | Free text; optional |
| Annual Leave Entitlement (days) | annualLeaveEntitlement | Integer; used by Leave Management |
| Gender | gender | MALE / FEMALE / NON_BINARY / PREFER_NOT_TO_SAY |
| Date of Birth | dateOfBirth | ISO 8601: YYYY-MM-DD — handle GDPR/privacy requirements |

## Data Quality Rules

- email is mandatory and must be unique across all employees
- firstName and lastName are mandatory
- departmentId must match an existing IMS department
- startDate must not be in the future
- managerId must reference an employee already imported into IMS (hence the phased import approach)
- employmentType must be one of the four enum values
- dateOfBirth, if included, must be handled in compliance with your organisation's data privacy policy and applicable laws (GDPR, CCPA)
- externalId must be unique within the import batch

## Post-Migration Verification

- [ ] Verify employee count: HRIS active headcount vs. IMS imported employees
- [ ] Confirm the Organisation Chart (HR > Org Chart) renders correctly, showing the full hierarchy
- [ ] Spot-check 10 employee records across different departments and levels — verify name, department, manager, start date, and job title
- [ ] Test login for 5 employees across different departments — confirm they can access IMS with their credentials
- [ ] If SSO is configured, test SSO login for at least 3 users
- [ ] Verify leave balances are correct for a sample of employees (HR > Leave > Leave Balances)
- [ ] Notify IT to activate SSO sync if configured, so new starters in the HRIS are automatically provisioned in IMS going forward
- [ ] Send a welcome email to all employees with IMS login instructions

## Common Migration Issues

- **Issue**: "Manager not found" validation error → **Fix**: The manager referenced was not imported in a previous pass. Ensure managers are imported before direct reports. Re-sort the CSV by hierarchy level and re-import.
- **Issue**: Duplicate email addresses rejected → **Fix**: Two employees share an email address in the HRIS. This usually means an employee has two records (e.g. re-hired with same email). Investigate and deduplicate in the source before re-import.
- **Issue**: Org chart shows flat structure (no hierarchy) → **Fix**: The managerId column was left blank or not mapped correctly during import. Re-import employees with correct managerId references.
- **Issue**: Employees cannot log in after migration → **Fix**: Check whether SSO is configured. If using local authentication, employees must set their password via the 'Forgot Password' flow on first login. Send them the reset link.
- **Issue**: Department assignment is incorrect for many employees → **Fix**: HRIS department codes do not map to IMS department names as expected. Review and update the department mapping table and re-import affected employees.
`,
  },
  {
    id: 'KB-MIG-012',
    title: 'Data Migration Planning Guide — Master Checklist',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['migration', 'data-migration', 'planning', 'checklist'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Data Migration Planning Guide — Master Checklist

## Overview

This master guide provides a universal data migration framework applicable to any IMS module. Whether you are migrating a single dataset (e.g. chemical register) or an entire system (e.g. legacy QMS), this phased approach ensures data integrity, minimal disruption, and a clear path to a successful cut-over. Reference the module-specific migration guides (KB-MIG-001 to KB-MIG-011) for detailed field mappings and validation rules.

## Before You Begin: Migration Governance

Every migration needs defined ownership:

- **Project Sponsor**: Senior manager with authority to approve go-live and decommission legacy systems
- **Migration Lead**: Technically capable person responsible for the end-to-end migration
- **Data Owners**: One owner per dataset (e.g. Quality Manager owns the NC register, EHS Manager owns the incident register)
- **IT Support**: Responsible for access provisioning, SSO configuration, and legacy system retirement
- **End Users**: Representatives from each affected team who will validate migrated data in their area

---

## Phase 1 — Discovery (4 Weeks Before Migration)

### Data Audit

- [ ] List every data type to be migrated and identify the source system for each
- [ ] Estimate record counts for each dataset (rows in spreadsheet, records in legacy system)
- [ ] Assess data quality: percentage of records with complete mandatory fields, duplicate rate, format consistency
- [ ] Identify mandatory fields in IMS vs. optional fields — mandatory fields must have values for every record
- [ ] Flag any datasets with personally identifiable information (PII) — apply GDPR/CCPA handling requirements

### Owner Identification

- [ ] Confirm the data owner for each dataset
- [ ] Confirm all data owners have access to the source system and can export the data
- [ ] Identify any data that requires legal review before migration (contracts, personnel records, financial data)

### Quality Assessment

- [ ] Sample 50–100 records from each dataset and score data quality: completeness (mandatory fields filled), accuracy (values make sense), consistency (formats are uniform)
- [ ] Classify data quality: Green (>90% complete), Amber (70–90% complete), Red (<70% complete)
- [ ] Red datasets require a data remediation sprint before migration can proceed — do not attempt to migrate dirty data

### IMS Configuration Prerequisites

- [ ] Create all user accounts in IMS before any data migration begins
- [ ] Configure all reference data in IMS: locations, departments, categories, taxonomies
- [ ] Confirm IMS module licences are active for all modules receiving migrated data
- [ ] Verify IMS storage capacity is sufficient for document migrations

---

## Phase 2 — Preparation (2 Weeks Before Migration)

### Clean Source Data

- [ ] Standardise date formats across all datasets (convert to ISO 8601: YYYY-MM-DD)
- [ ] Standardise enumeration values to match IMS enum requirements (uppercase, exact spelling)
- [ ] Remove duplicate records (keep the most complete/most recent version of each record)
- [ ] Fill in mandatory fields where data is missing — engage data owners to provide missing values
- [ ] Convert units to IMS-expected units (e.g. SI units for environmental data)
- [ ] Split combined fields where IMS requires separate fields (e.g. full name → firstName + lastName; quantity + unit → two columns)

### Create IMS Master Data

- [ ] Create all required IMS master records before importing dependent data:
  - Users (must exist before any record referencing an owner/assignee)
  - Locations (must exist before assets, chemicals, incidents reference them)
  - Departments (must exist before employees reference them)
  - Categories (must exist before documents, assets, suppliers reference them)
  - Training items (must exist before training records reference them)

### Download and Populate Import Templates

- [ ] Download all required IMS import templates from Settings > Import Templates
- [ ] Map source columns to IMS template columns for each dataset
- [ ] Document the mapping in a migration mapping register (a simple spreadsheet with: Source Field → IMS Field → Transformation Rule)

### Test Import with 10% of Data

- [ ] Select a 10% representative sample of each dataset (random selection across the date range)
- [ ] Run the test import in a test environment (or into a staging area if test environment is unavailable)
- [ ] Validate the output: record counts match, fields appear correctly, relationships (e.g. owner lookup) resolve
- [ ] Fix any validation errors or mapping issues identified in the test import
- [ ] Get sign-off from the data owner that the test import looks correct

---

## Phase 3 — Migration (Migration Week)

### Freeze Source System

- [ ] Announce the data freeze to all users: no new records to be created in the source system after the freeze date/time
- [ ] Hold any new data created after the freeze in a temporary manual log (paper or simple spreadsheet)
- [ ] Set the source system to read-only where possible (contact the legacy system administrator)

### Run Full Import

- [ ] Import in dependency order: Users → Master Data (Locations, Categories, Departments) → Primary Records (Employees, Suppliers, Documents) → Dependent Records (Incidents, CAPAs, Training Records, Findings)
- [ ] For each import:
  - [ ] Upload file and click Validate
  - [ ] Review and fix all validation errors (zero errors required before confirming)
  - [ ] Confirm import
  - [ ] Record the import timestamp and record count in the migration log

### Validate Record Counts and Spot-Check Quality

- [ ] For each imported dataset, verify: IMS record count = source record count (after adjusting for records intentionally excluded)
- [ ] Perform spot-checks: randomly select 10 records from each dataset and verify every field in IMS matches the source
- [ ] Have the data owner sign off on the spot-check results

### Enter Freeze-Period Data

- [ ] Enter any new data recorded in the temporary manual log during the freeze period
- [ ] Verify these entries are complete before IMS goes live

---

## Phase 4 — Post-Migration (2 Weeks After Go-Live)

### Parallel Running

- [ ] Run IMS and the legacy system in parallel for 2 weeks
- [ ] New data is entered in IMS only — the legacy system remains read-only
- [ ] Data discrepancies identified during parallel running are resolved immediately (correct in IMS; do not re-open legacy edits)
- [ ] Daily stand-up with migration team to review open issues and resolve quickly

### Resolve Discrepancies

- [ ] Maintain a discrepancy log: record count mismatches, field value differences, relationship failures
- [ ] Prioritise and resolve all discrepancies within the 2-week parallel running period
- [ ] Get written sign-off from data owners and Project Sponsor that IMS data is complete and accurate

### Decommission Source System

- [ ] Formal sign-off from Project Sponsor authorising decommission
- [ ] Export a full data archive from the legacy system (retain per your data retention policy — typically 7–10 years for most business records)
- [ ] Store the archive in a secure location with appropriate access controls
- [ ] Remove user access to the legacy system
- [ ] Redirect bookmarks and system links to IMS
- [ ] Cancel legacy system licence (check notice period requirements)
- [ ] Update the organisation's system register and GDPR record of processing activities

---

## Migration Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Source data quality is poor | HIGH | HIGH | Data quality assessment in Phase 1; remediation sprint before migration |
| Key person unavailable during migration week | MEDIUM | HIGH | Cross-train a backup person for each migration lead role |
| IMS import validation rejects high % of records | MEDIUM | HIGH | Test import with 10% sample in Phase 2 to catch issues early |
| Legacy system cannot be set to read-only | MEDIUM | MEDIUM | Manual controls: email freeze announcement to all users + monitor for edits |
| Users continue using legacy system post go-live | MEDIUM | HIGH | Remove access to legacy system on go-live date; enforce read-only |
| PII data breached during migration | LOW | CRITICAL | Use encrypted transfer; limit who has access to source files; delete source files after successful import |
| Record count mismatch cannot be reconciled | LOW | HIGH | Keep migration log with each import's source count and IMS count; reconcile before sign-off |

---

## Key Contacts to Involve

Every migration should have the following contacts confirmed and available during migration week:

| Role | Responsibility | Availability Required |
|---|---|---|
| **IT / Systems Administrator** | Database access, IMS environment issues, SSO configuration | On-call during migration week |
| **System Owner (IMS)** | Final go/no-go decision; IMS configuration questions | Available for daily check-ins |
| **Data Owner (per dataset)** | Data quality sign-off; spot-check validation; answers field-specific questions | Available during business hours |
| **Legacy System Administrator** | Read-only switch, data export, licence cancellation | Available at migration start and end |
| **End User Representatives** | Validate migrated data from a user perspective; report discrepancies | Available for spot-check sessions |
| **GDPR / Privacy Officer** | Confirm PII handling is compliant; sign off on data transfer approach | Consulted in Phase 1; available for sign-off |

---

## Migration Communication Plan

| When | Audience | Message | Channel |
|---|---|---|---|
| 4 weeks before | All affected users | Migration announcement: why, when, what to expect | Email from Project Sponsor |
| 2 weeks before | Power users / data owners | Training on IMS data entry; migration role briefing | Workshop (60 min) |
| 1 week before | All affected users | Reminder: freeze date approaching; access instructions | Email |
| Freeze date | All affected users | Data freeze is now active; IMS is your new system from go-live date | Email + system notification |
| Go-live day | All affected users | IMS is live; links to quick-start guides; support contact | Email from Project Sponsor |
| Week 2 post go-live | All affected users | Feedback request; reminder to log discrepancies; decommission date | Email |
| Decommission date | All affected users | Legacy system access removed; IMS is the sole system of record | Email |
`,
  },
];
