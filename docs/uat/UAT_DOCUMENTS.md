# UAT Test Plan: Document Management Module

**Document ID:** UAT-DOC-001
**Version:** 1.0
**Date:** 2026-02-23
**Module:** Document Management
**Environment:** Staging (api-documents:4031 / web-documents:3035)
**Tester:** **\*\*\*\***\_\_\_\_**\*\*\*\***
**Sign-Off Date:** **\*\*\*\***\_\_\_\_**\*\*\*\***

---

## Document Lifecycle (5 scenarios)

### TC-DOC-001: Create Controlled Document with DOC-YYYY-NNN Reference

**Given** I am logged in as a Document Controller
**When** I navigate to Documents > Library and click "New Document"
**And** I fill in: Title "Environmental Aspects and Impacts Procedure", Category "Procedure", Owner "Environmental Manager", Module "Environment", Review Period "Annual", Related Standard "ISO 14001:2015 Clause 6.1.2"
**Then** the system creates the document with reference "DOC-2602-XXXX" and status "DRAFT"
**And** the reference follows the pattern DOC-YYYY-NNN with the current year
**And** version is set to "1.0"
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-DOC-002: Upload File to Document Record

**Given** a document "DOC-2602-0001" exists with status "DRAFT"
**When** I open the document and click "Upload File"
**And** I attach a PDF file "ENV-PROC-001-v1.0.pdf" (size 245 KB)
**Then** the file is uploaded and linked to the document record
**And** the file name, size, and upload date are displayed
**And** the file is downloadable by authorised users
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-DOC-003: Submit Document for Review

**Given** a draft document "DOC-2602-0001" with an uploaded file
**When** I click "Submit for Review" and assign reviewers ["Technical Reviewer — J. Martinez", "Compliance Reviewer — S. Patel"] with due date "2026-03-07"
**Then** the document status changes from "DRAFT" to "IN_REVIEW"
**And** both assigned reviewers receive a notification of the review task
**And** the submission date is recorded
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-DOC-004: Approve Document (DRAFT → APPROVED)

**Given** a document "DOC-2602-0001" in status "IN_REVIEW" with all reviewer comments resolved
**When** the Document Controller clicks "Approve" and enters approver name and approval notes
**Then** the document status changes from "IN_REVIEW" to "APPROVED"
**And** the approval date and approver are recorded on the document
**And** the document version is confirmed as "1.0"
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-DOC-005: Publish Document to Relevant Roles

**Given** an approved document "DOC-2602-0001"
**When** I click "Publish" and select distribution roles: ["Environmental Manager", "Operations Team", "All Staff"]
**Then** the document status changes to "PUBLISHED"
**And** all users in the selected roles receive a notification that the document is published
**And** the document appears in the "Published" filter view with the published date
**And** users in the selected roles can view and download the document
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Version Control (5 scenarios)

### TC-DOC-006: Create New Version of Approved Document (v1 → v2)

**Given** a published document "DOC-2602-0001" at version "1.0"
**When** I click "Create New Version" and enter revision reason "Updated to reflect revised ISO 14001 guidance"
**Then** a new version "2.0" is created with status "DRAFT"
**And** the previous version "1.0" retains its status as "PUBLISHED" until the new version is approved
**And** both versions are listed in the document's version history
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-DOC-007: Archive Previous Version Automatically on Approval

**Given** document "DOC-2602-0001" v2.0 has been reviewed, approved, and published
**When** the new version "2.0" is published
**Then** the previous version "1.0" is automatically changed to status "ARCHIVED"
**And** archived versions are no longer shown in the default Published view
**And** archived versions remain accessible via the version history tab
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-DOC-008: Compare Document Versions

**Given** document "DOC-2602-0001" has versions "1.0" (archived) and "2.0" (published)
**When** I navigate to the version history and click "Compare v1.0 vs v2.0"
**Then** a side-by-side or tracked-changes view is displayed showing differences between the two versions
**And** added content is highlighted in green and removed content in red
**And** metadata changes (owner, review date, related standard) are listed separately
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-DOC-009: Restore Document from Archive

**Given** document "DOC-2602-0001" v1.0 is archived and v2.0 has an error discovered post-publication
**When** the Document Controller selects v1.0 in the version history and clicks "Restore this Version"
**And** confirms the restore with a reason "v2.0 contains erroneous control limit — reverting to v1.0"
**Then** v1.0 is restored to "PUBLISHED" status
**And** v2.0 is moved to "ARCHIVED" status
**And** all users in the distribution list receive a notification of the version change
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-DOC-010: View Full Version History

**Given** document "DOC-2602-0001" has been through 3 version cycles (v1.0, v2.0, v3.0)
**When** I open the document and navigate to the "Version History" tab
**Then** all versions are listed in reverse chronological order
**And** each entry shows version number, status, creation date, approval date, approver, and revision reason
**And** each version's uploaded file is accessible via a download link
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Approval Workflows (5 scenarios)

### TC-DOC-011: Assign Multi-Stage Approval (Technical + Management)

**Given** a document "DOC-2602-0003" in DRAFT status requiring dual approval
**When** I configure the approval workflow with two stages: Stage 1 "Technical Review" (assignee: J. Martinez, due in 5 days) and Stage 2 "Management Sign-Off" (assignee: CEO / Quality Director, due in 10 days)
**Then** the approval workflow is saved with both stages in sequence
**And** Stage 1 is activated and the technical reviewer is notified
**And** Stage 2 will not activate until Stage 1 is completed
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-DOC-012: Track Approval Progress

**Given** a document "DOC-2602-0003" in an active two-stage approval workflow
**When** Stage 1 (Technical Review) is completed with decision "APPROVED"
**Then** the workflow dashboard shows Stage 1 as "COMPLETED" with completion date
**And** Stage 2 (Management Sign-Off) automatically activates and the approver is notified
**And** the document status shows "IN_REVIEW — Stage 2 of 2" to indicate progress
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-DOC-013: Reject Document at Stage 1 with Comments

**Given** document "DOC-2602-0003" in Stage 1 review (Technical Review)
**When** the technical reviewer clicks "Reject" and enters comments "Section 4.3 references an obsolete procedure (PROC-2019-007). Update cross-reference before proceeding."
**Then** the document status reverts to "DRAFT" (or "REJECTED")
**And** the rejection comments are saved against Stage 1
**And** the document owner receives a notification with the reviewer's comments
**And** the full approval workflow is reset
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-DOC-014: Resubmit Document After Revision

**Given** document "DOC-2602-0003" was rejected at Stage 1 with comments about an obsolete reference
**When** the document owner updates the document to correct Section 4.3 and clicks "Resubmit for Review"
**Then** a new version revision is created (or the revision reason is recorded)
**And** the approval workflow restarts at Stage 1
**And** the technical reviewer is notified of the resubmission
**And** the previous rejection reason is preserved in the workflow history
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-DOC-015: Verify All Approvers Notified at Each Stage

**Given** a document "DOC-2602-0004" with a three-stage workflow: Stage 1 (Legal), Stage 2 (Quality), Stage 3 (Board)
**When** each stage is activated in sequence as the previous stage is approved
**Then** each stage approver receives an in-system notification and email at the point their stage activates
**And** notifications include the document title, reference, stage name, due date, and a direct link
**And** overdue stage notifications are re-sent after 24 hours if the action is not completed
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Read Receipts (5 scenarios)

### TC-DOC-016: Require Read Receipt for Published Document

**Given** an approved document "DOC-2602-0002" is being published
**When** I publish the document and enable "Require Read Receipt" toggle
**And** I select distribution roles ["Quality Team", "Operations Team"]
**Then** the document is published with read receipt required = true
**And** all users in the selected roles are listed in the read receipt tracker with status "PENDING"
**And** each user receives a notification asking them to acknowledge the document
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-DOC-017: Mark Document as Read by User

**Given** user "R. Chen" has a pending read receipt for document "DOC-2602-0002"
**When** R. Chen opens the document and clicks "Mark as Read"
**Then** R. Chen's read receipt status changes from "PENDING" to "READ"
**And** the read date and time are recorded
**And** the read receipt tracker shows R. Chen's status as "READ" with the timestamp
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-DOC-018: Mark Document as Acknowledged (Date / Signature)

**Given** user "S. Patel" has read document "DOC-2602-0002" and a formal acknowledgement is required
**When** S. Patel clicks "Acknowledge" and types their name in the signature field and confirms
**Then** the acknowledgement is recorded with: username, typed name, date, and time
**And** the read receipt tracker shows S. Patel's status as "ACKNOWLEDGED"
**And** the acknowledgement cannot be undone by the user
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-DOC-019: View Who Has and Has Not Acknowledged

**Given** document "DOC-2602-0002" has been published with read receipts required to 20 users
**When** I navigate to the document's "Read Receipts" tab
**Then** a table is displayed with all 20 users and their status (PENDING / READ / ACKNOWLEDGED)
**And** users who have not acknowledged are grouped at the top and highlighted
**And** the acknowledgement date is shown for completed users
**And** I can send a reminder notification to all PENDING users with one click
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-DOC-020: Generate Non-Compliance Report for Unacknowledged Users

**Given** document "DOC-2602-0002" has a deadline of 14 days for acknowledgement and the deadline has passed
**When** I navigate to Documents > Reports > Read Receipt Compliance and select "DOC-2602-0002"
**Then** a non-compliance report lists all users who have not acknowledged by the deadline
**And** the report shows user name, department, manager, and days overdue
**And** the report is exportable as PDF or CSV for escalation to line managers
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Search & Dashboard (5 scenarios)

### TC-DOC-021: Full-Text Search Across Document Content

**Given** multiple documents are published covering various topics (environmental, quality, H&S, HR)
**When** I use the document search bar and enter keyword "aspect register"
**Then** all documents whose title or content contains "aspect register" are returned
**And** the search results show document title, category, version, status, and last updated date
**And** the matching keyword is highlighted in the search result snippets
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-DOC-022: Filter Documents by Category, Status, and Owner

**Given** the document library contains documents of varying categories, statuses, and owners
**When** I apply filters: Category = "Procedure", Status = "PUBLISHED", Owner = "Environmental Manager"
**Then** only documents matching all three filter criteria are displayed
**And** the filter combination is reflected in the URL (shareable link)
**And** clearing individual filters restores the broader result set incrementally
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-DOC-023: View Document Dashboard (Totals by Status)

**Given** documents exist across all lifecycle statuses: DRAFT, IN_REVIEW, APPROVED, PUBLISHED, ARCHIVED
**When** I navigate to Documents > Dashboard
**Then** a summary widget displays document counts by status (e.g. Draft: 12, In Review: 5, Published: 148, Archived: 67)
**And** clicking a status count navigates to the filtered document list for that status
**And** a trend chart shows new documents created per month over the past 6 months
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-DOC-024: View Documents with Review Date Within 30 Days

**Given** published documents have varying review due dates (annual, bi-annual, or specific date)
**When** I navigate to Documents > Dashboard and view the "Due for Review" widget
**Then** all documents with a review date within the next 30 days are listed
**And** each entry shows document title, reference, review date, owner, and days until due
**And** the list is sorted by review date (soonest first)
**And** the document owner receives an advance notification 30 days before the review date
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-DOC-025: View Documents by Module

**Given** documents are categorised by module (Environment, Quality, H&S, HR, Finance, etc.)
**When** I navigate to Documents > Dashboard and select the "By Module" view
**Then** a grouped list or chart shows document counts per module
**And** expanding a module group shows the documents assigned to it
**And** I can drill down from a module to see all published, in-review, and draft documents for that module
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Sign-Off

| Role                  | Name | Signature | Date |
| --------------------- | ---- | --------- | ---- |
| Document Controller   |      |           |      |
| Quality Manager       |      |           |      |
| UAT Lead              |      |           |      |
| Regulatory/Compliance |      |           |      |

**Overall Result:** [ ] PASS -- All scenarios passed / [ ] FAIL -- See notes above
**Release Recommendation:** [ ] Approved for Production / [ ] Requires remediation
