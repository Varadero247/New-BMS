# UAT Test Plan: Workflow Management Module (BPM)

**Document ID:** UAT-WF-001
**Version:** 1.0
**Date:** 2026-02-23
**Module:** Workflow Management (BPM)
**Environment:** Staging (api-workflows:4008 / web-workflows:3008)
**Tester:** ****************\_\_\_\_****************
**Sign-Off Date:** ****************\_\_\_\_****************

---

## Workflow Definitions (5 scenarios)

### TC-WF-001: Create Workflow Definition with Document Approval Trigger

**Given** I am logged in as a Process Owner
**When** I navigate to Workflows > Definitions and click "New Definition"
**And** I enter: Name "Document Approval Workflow", Description "Standard approval process for controlled documents", Trigger Type "DOCUMENT_APPROVAL", Module "Documents"
**Then** the system creates the definition with reference "WF-2602-XXXX" and status "DRAFT"
**And** the definition appears in the Definitions list
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-WF-002: Add Steps to Workflow Definition (Submit → Review → Approve/Reject)

**Given** a workflow definition "WF-2602-0001" exists in DRAFT status
**When** I add Step 1: Type "SUBMIT", Name "Submit for Review", Assignee Role "Document Owner"
**And** I add Step 2: Type "REVIEW", Name "Technical Review", Assignee Role "Reviewer", Timeout "72 hours"
**And** I add Step 3: Type "APPROVE", Name "Final Approval", Assignee Role "Manager", with Reject path looping to Step 2
**Then** all three steps are saved with correct order (1, 2, 3)
**And** the workflow diagram preview shows the Submit → Review → Approve/Reject flow
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-WF-003: Activate Workflow Definition

**Given** a workflow definition "WF-2602-0001" in DRAFT status with all required steps defined
**When** I click "Activate" and confirm the activation
**Then** the definition status changes to "ACTIVE"
**And** the definition becomes available as a selectable workflow when triggering new instances
**And** the activation timestamp and activated-by user are recorded
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-WF-004: Deactivate Workflow Definition

**Given** an ACTIVE workflow definition "WF-2602-0001"
**When** I click "Deactivate" and enter reason "Replaced by updated version WF-2602-0003"
**Then** the definition status changes to "INACTIVE"
**And** no new instances can be triggered from this definition
**And** existing running instances are not affected
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-WF-005: View Workflow Definition List with Status Filter

**Given** multiple workflow definitions exist with statuses DRAFT, ACTIVE, and INACTIVE
**When** I navigate to Workflows > Definitions and apply filter Status = "ACTIVE"
**Then** only ACTIVE definitions are displayed
**And** DRAFT and INACTIVE definitions are excluded from the list
**And** the record count reflects the filtered results
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Workflow Instances (5 scenarios)

### TC-WF-006: Trigger Workflow Instance from Document

**Given** an ACTIVE workflow definition "Document Approval Workflow" with trigger "DOCUMENT_APPROVAL"
**When** I navigate to Documents, open document "POL-2026-003", and click "Submit for Approval"
**And** I select the "Document Approval Workflow" definition
**Then** a new workflow instance "WFI-2602-XXXX" is created with status "RUNNING"
**And** the instance is linked to document "POL-2026-003"
**And** Step 1 (Submit for Review) is marked as the current active step
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-WF-007: View Instance in RUNNING State

**Given** a workflow instance "WFI-2602-0001" has been triggered and is in RUNNING status
**When** I navigate to Workflows > Instances and open "WFI-2602-0001"
**Then** the instance detail page shows status "RUNNING", the current active step, the triggering document reference, and the initiating user
**And** the step history shows Step 1 as "COMPLETED" and Step 2 as "IN_PROGRESS"
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-WF-008: Complete Review Step (Advance to Next Step)

**Given** workflow instance "WFI-2602-0001" is at Step 2 (Technical Review) and I am the assigned Reviewer
**When** I open the pending task from my approvals inbox
**And** I enter review comments "Document meets technical requirements" and click "Approve to Next Step"
**Then** Step 2 status changes to "COMPLETED" with my name, timestamp, and comments recorded
**And** the instance advances to Step 3 (Final Approval) with status "IN_PROGRESS"
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-WF-009: Reject at Approval Step (Instance Moves to REJECTED)

**Given** workflow instance "WFI-2602-0001" is at Step 3 (Final Approval) and I am the assigned Manager
**When** I open the pending approval task
**And** I enter rejection reason "Policy statement requires revision per legal review" and click "Reject"
**Then** the instance status changes to "REJECTED"
**And** the rejection reason, rejector name, and timestamp are recorded
**And** the initiating document owner receives a notification of rejection
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-WF-010: View Instance History with Timestamps

**Given** a workflow instance "WFI-2602-0001" in COMPLETED or REJECTED state
**When** I open the instance and navigate to the "History" tab
**Then** a full chronological audit trail is displayed showing each step action: step name, action taken (SUBMITTED/APPROVED/REJECTED), actor, timestamp, and comments
**And** the total elapsed time from trigger to completion is displayed
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Approvals (5 scenarios)

### TC-WF-011: Submit Item for Approval

**Given** I am a Document Owner and workflow "Document Approval Workflow" is ACTIVE
**When** I open document "SOP-2026-012" and click "Submit for Approval"
**And** I select the workflow, add submission notes "Annual review update — see change log"
**Then** the document status changes to "PENDING_APPROVAL"
**And** a new workflow instance is created and the assigned Reviewer receives an inbox notification
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-WF-012: Approve as Authorised User

**Given** a workflow instance is waiting at the Approval step and I am the designated approver (Manager role)
**When** I open the approval task from my pending approvals inbox
**And** I review the attached document and click "Approve" with comments "Approved — compliant with policy framework"
**Then** the approval step is recorded as APPROVED with my name, timestamp, and comments
**And** the workflow instance moves to the next step or closes as COMPLETED if final step
**And** the document status updates to "APPROVED"
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-WF-013: Reject Approval with Mandatory Reason

**Given** a workflow instance pending my approval
**When** I click "Reject" without entering a rejection reason
**Then** the system displays a validation error "Rejection reason is required"
**And** the rejection is not submitted until a reason is entered
**And** once I enter a reason and confirm, the rejection is recorded and the instance status updates accordingly
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-WF-014: Reassign Approval to Another User

**Given** a workflow approval task assigned to me that I cannot complete due to conflict of interest
**When** I open the task and click "Reassign"
**And** I select user "T. Nguyen" and enter reason "Conflict of interest — I authored the document"
**Then** the task is reassigned to "T. Nguyen" with the reason logged
**And** "T. Nguyen" receives a notification of the reassigned approval task
**And** the task no longer appears in my pending approvals inbox
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-WF-015: View Pending Approvals Inbox Count

**Given** I have multiple workflow approval tasks assigned to me across different workflow instances
**When** I navigate to the Workflows dashboard or the top navigation bar
**Then** a badge/counter displays the total count of my pending approval tasks
**And** the inbox list shows each task with workflow name, item reference, submitted-by user, and submission date
**And** overdue tasks (past their timeout threshold) are highlighted
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Automation Rules (5 scenarios)

### TC-WF-016: Create Automation Rule (Incident Severity → Notify Manager)

**Given** I am logged in as a Workflow Administrator
**When** I navigate to Workflows > Automation Rules and click "New Rule"
**And** I enter: Name "Critical Incident Manager Alert", Trigger Module "Incidents", Trigger Condition "severity = CRITICAL", Action Type "NOTIFY", Notification Target "Department Manager", Message Template "A CRITICAL incident has been raised: {{incident.title}}"
**Then** the rule is saved with status "ACTIVE"
**And** the rule reference "RULE-2602-XXXX" is generated
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-WF-017: Test Automation Rule Triggers Correctly

**Given** an active automation rule "Critical Incident Manager Alert" with condition "severity = CRITICAL"
**When** a new incident is created with severity "CRITICAL" in the Incidents module
**Then** the automation rule fires within the configured delay period
**And** the Department Manager receives a notification containing the incident title
**And** a rule execution log entry is created with status "SUCCESS", rule reference, trigger timestamp, and target incident ID
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-WF-018: Disable Automation Rule

**Given** an ACTIVE automation rule "RULE-2602-0001"
**When** I open the rule and click "Disable"
**Then** the rule status changes to "INACTIVE"
**And** the rule no longer fires when the trigger condition is met
**And** existing queued executions are cancelled
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-WF-019: View Automation Rule Execution Log

**Given** automation rule "RULE-2602-0001" has fired multiple times
**When** I open the rule and navigate to the "Execution Log" tab
**Then** a paginated list of executions is displayed showing: execution timestamp, trigger event reference, execution status (SUCCESS/FAILED), action taken, and target user/system
**And** failed executions show the error detail
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-WF-020: Update Automation Rule Condition

**Given** an ACTIVE automation rule "Critical Incident Manager Alert"
**When** I edit the rule and update the condition to "severity IN [CRITICAL, MAJOR]"
**And** I save the changes
**Then** the rule is updated with the new condition
**And** the change is recorded in the rule audit log with the previous and new condition values and the editor's name
**And** the rule continues to fire under the updated condition
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Templates & Reporting (5 scenarios)

### TC-WF-021: Create Workflow Template from Existing Definition

**Given** an ACTIVE workflow definition "Document Approval Workflow" with all steps configured
**When** I open the definition and click "Save as Template"
**And** I enter template name "Standard Document Approval Template" and description "Reusable 3-step document approval"
**Then** the template is created with status "ACTIVE" and all step configurations copied
**And** the template appears in the Templates library
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-WF-022: Instantiate Workflow from Template

**Given** a workflow template "Standard Document Approval Template" exists in the Templates library
**When** I navigate to Workflows > Definitions, click "New from Template", and select the template
**And** I customise the name to "SOP Approval Workflow" and update the trigger module to "Documents > SOPs"
**Then** a new workflow definition is created with all template steps pre-populated
**And** the definition is in DRAFT status ready for activation
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-WF-023: View Workflow Completion Rate

**Given** multiple workflow instances have been created, run, and closed over the past 30 days
**When** I navigate to Workflows > Reports > Completion Rate
**And** I set the date range to the last 30 days
**Then** the report displays the total instances triggered, total completed, total rejected/cancelled, and the overall completion rate percentage
**And** the data can be broken down by workflow definition name
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-WF-024: View Average Cycle Time by Workflow Type

**Given** historical workflow instance data exists for multiple workflow types
**When** I navigate to Workflows > Reports > Cycle Time
**And** I select grouping "By Workflow Definition"
**Then** the report shows the average, minimum, and maximum cycle time (hours/days) for each workflow type
**And** the definition with the longest average cycle time is highlighted
**And** the data is exportable to CSV
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-WF-025: Identify Bottleneck Steps

**Given** historical workflow instance step data exists
**When** I navigate to Workflows > Reports > Bottleneck Analysis
**And** I select workflow "Document Approval Workflow"
**Then** the report shows average time spent at each step across all instances
**And** the step with the highest average wait time is flagged as the bottleneck
**And** a drill-down view shows the individual instances that contributed to the longest delays
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
