import type { KBArticle } from '../types';

export const troubleshooting2Articles: KBArticle[] = [
  {
    id: 'KB-TS2-001',
    title: 'Control Plan Not Linking to FMEA Actions',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['troubleshooting', 'automotive', 'control-plan', 'fmea'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Control Plan Not Linking to FMEA Actions

## Symptom

The Control Plan shows no linked FMEA actions despite the FMEA being in an approved state. The FMEA actions column in the Control Plan remains empty or displays a broken reference.

## Possible Causes

- The FMEA has not been linked at the individual process step level — approval alone does not create the link
- The Control Plan is referencing a different (older) FMEA revision than the currently approved one
- The cross-module link was initiated but not saved before navigating away
- The FMEA was created in a different process family or part number context than the Control Plan

## Solutions

### Solution 1: Re-link via FMEA Control Plan Tab

1. Open the approved FMEA record in the Automotive module.
2. Navigate to the **Control Plan** tab within the FMEA record.
3. Locate each process step that should link to your Control Plan.
4. Click **Link to Control Plan** next to each action row and select the correct Control Plan from the picker.
5. Click **Save Links** and confirm the confirmation dialog.
6. Return to the Control Plan and refresh — linked actions should now appear.

### Solution 2: Verify Revision Match

1. In the Control Plan header, note the **FMEA Reference** field value and the revision number shown.
2. Open the FMEA and confirm the revision number matches.
3. If the Control Plan references an older revision, click **Update FMEA Reference** in the Control Plan header and select the current approved revision.
4. Save the Control Plan.

### Solution 3: Force-Save the Link

1. Open the Control Plan and click **Edit**.
2. Scroll to the FMEA Actions section and click **Re-link FMEA**.
3. The system will re-query all approved FMEAs for the same part number family.
4. Select the correct FMEA and click **Apply**.
5. Click **Save** on the Control Plan form — do not navigate away before the save confirmation appears.

## Prevention

- Always complete the FMEA-to-Control-Plan link step as part of your FMEA approval workflow checklist.
- Use the APQP workflow wizard, which guides users through linking steps in sequence.
- Avoid leaving the FMEA or Control Plan editor mid-session without saving to prevent link state loss.
`,
  },
  {
    id: 'KB-TS2-002',
    title: 'PPAP Submission Stuck in Pending Approval',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['troubleshooting', 'automotive', 'ppap'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# PPAP Submission Stuck in Pending Approval

## Symptom

A PPAP submission remains in the Pending state for days despite all required elements having been uploaded. No approval notifications have been sent to the approver.

## Possible Causes

- No approver has been assigned to the PPAP submission workflow
- One or more required PPAP elements are internally flagged as incomplete (e.g., wrong revision, missing signature page)
- The customer portal sync that notifies the customer-side approver has experienced a delay or failure
- The submission was created under the wrong customer or part number, routing it to an inactive approver queue

## Solutions

### Solution 1: Check Approval Workflow Assignment

1. Open the PPAP submission record and navigate to the **Approval** tab.
2. Verify that an approver name appears in the **Assigned Approver** field.
3. If empty, click **Assign Approver**, select the appropriate quality engineer or customer contact, and click **Save**.
4. The system will send an approval request notification immediately after saving.

### Solution 2: Validate Element Completeness Checklist

1. In the PPAP record, open the **Elements Checklist** tab.
2. Review each element for a red or amber completeness indicator.
3. Elements flagged in amber may be uploaded but contain a validation warning (e.g., missing signature, wrong file type).
4. Open each flagged element, resolve the warning, and re-upload if necessary.
5. Once all elements show green, the submission will automatically advance to the approver's queue.

### Solution 3: Resync Customer Portal

1. Navigate to **Automotive > PPAP > Submissions > [your submission]**.
2. Click the **Actions** menu and select **Resync with Customer Portal**.
3. Confirm the resync dialog. The system will attempt to re-push the submission status to the customer portal.
4. Check the **Sync Log** tab to confirm the sync succeeded.
5. Contact your IMS administrator if the sync continues to fail — this may indicate a portal integration token needs refreshing.

## Prevention

- Assign approvers at the time of PPAP submission creation using the PPAP wizard.
- Run the element completeness pre-check before submitting — the wizard provides a validation summary screen.
- Set up automated reminders in the PPAP workflow so approvers receive escalating notifications if the submission is not actioned within your SLA window.
`,
  },
  {
    id: 'KB-TS2-003',
    title: 'SPC Out-of-Control Points Not Triggering Alerts',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['troubleshooting', 'automotive', 'spc', 'alerts'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# SPC Out-of-Control Points Not Triggering Alerts

## Symptom

Western Electric rule violations are being detected on the SPC control chart (shown visually on the chart) but no alert notifications are being sent to the configured recipients.

## Possible Causes

- Alert rules for that specific chart have been disabled at the chart configuration level
- The notification email address or channel is not configured for the alert rule
- The rule sensitivity threshold has been set too loosely, causing the system to consider the violation within acceptable bounds
- The alert was triggered but the notification was silently rejected by the recipient's mail server or marked as spam

## Solutions

### Solution 1: Verify Alert Rule Configuration

1. Open the SPC chart in question under **Automotive > SPC > Charts**.
2. Click the **Settings** (gear) icon and select **Alert Rules**.
3. Confirm that the toggle next to each Western Electric rule (Rule 1 through Rule 8) is set to **Enabled**.
4. If any rule is disabled, enable it and click **Save Rules**.
5. The chart will begin generating alerts on the next data point that triggers an enabled rule.

### Solution 2: Check Notification Recipients

1. In the chart Alert Rules screen, click **Notification Settings**.
2. Verify that at least one recipient email address or Slack/Teams channel is listed.
3. If the recipient list is empty, add the appropriate quality engineer or team inbox.
4. Send a **Test Alert** using the button in the notification settings panel and confirm the test message arrives.

### Solution 3: Review Rule Sensitivity Settings

1. For each Western Electric rule, review the **Sensitivity** setting (Standard, High, or Custom).
2. If set to Custom, verify the parameters — for example, a Zone A violation rule requiring 4 consecutive points instead of the standard 2 may delay triggering.
3. Reset to **Standard** sensitivity if customisation has caused over-tolerance.
4. Save and monitor the chart for the next shift to confirm alerts fire correctly.

## Prevention

- Include alert rule verification as part of the new SPC chart setup checklist.
- Schedule a monthly audit of all SPC alert rules to confirm they remain enabled and recipients are current.
- Use the **SPC Alert Health** report (Automotive > Reports > SPC Alerts) to see a summary of all charts with disabled or unconfigured alerts.
`,
  },
  {
    id: 'KB-TS2-004',
    title: 'MSA %GRR Showing Incorrect Values',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['troubleshooting', 'automotive', 'msa', 'gauge-rr'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# MSA %GRR Showing Incorrect Values

## Symptom

The %GRR result calculated by the IMS MSA module differs from a manual calculation performed in Excel using the same raw measurement data.

## Possible Causes

- The number of operators entered in the study setup does not match the number of operators who actually contributed data
- The trial count (number of replications per part per operator) is set incorrectly in the study configuration
- The tolerance value entered is incorrect, affecting the %GRR/Tolerance calculation
- The study is using ANOVA method while the manual calculation used the Average and Range method (or vice versa)

## Solutions

### Solution 1: Verify Study Setup Parameters

1. Open the MSA study in **Automotive > MSA > Studies**.
2. Click **Edit Study Setup** and review the **Number of Operators**, **Number of Parts**, and **Number of Trials** fields.
3. Compare these against your actual data collection sheet.
4. If any parameter is wrong, correct it. Note: changing the operator or trial count after data entry may require data re-entry if the matrix has changed.
5. Recalculate the study using the **Recalculate** button and verify the new %GRR.

### Solution 2: Recheck Tolerance Values

1. In the study setup, locate the **Tolerance** field (USL minus LSL).
2. Confirm the tolerance is entered in the same unit of measure as the measurements (e.g., mm, not microns).
3. Verify the USL and LSL values against the current engineering drawing or specification sheet.
4. Update if incorrect and recalculate.

### Solution 3: Compare Formula Settings

1. Navigate to **Study Setup > Calculation Method**.
2. Confirm whether the study is set to **ANOVA** or **Average and Range (X-bar and R)**.
3. If your manual Excel calculation used Average and Range, switch the IMS study to match.
4. Note that ANOVA and Average and Range methods will produce different %GRR values for the same dataset — this is expected and not an error.
5. Document which method is required by your customer or internal standard and use it consistently.

## Prevention

- Use the MSA study wizard which prompts for all setup parameters before data entry begins.
- Store the engineering specification sheet as an attachment on the MSA study record so the tolerance can be verified at any time.
- Standardise on a single calculation method (ANOVA preferred per AIAG MSA 4th edition) and configure it as the system default.
`,
  },
  {
    id: 'KB-TS2-005',
    title: 'Customer Scorecard Data Mismatch',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['troubleshooting', 'automotive', 'scorecard'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Customer Scorecard Data Mismatch

## Symptom

The PPM (parts per million) figure shown on the IMS customer scorecard differs from the PPM figure reported by the customer in their supplier scorecard communication.

## Possible Causes

- The date ranges used to calculate PPM are different between IMS and the customer system
- The customer counts rejects differently — for example, they may count a returned shipment as multiple rejects rather than one incident
- The shipment quantity used as the denominator differs due to returns or adjustments not reflected in IMS
- The customer includes warranty returns or field failures in their reject count, while IMS only tracks incoming inspection rejects

## Solutions

### Solution 1: Align Date Period

1. Open the customer scorecard in **Automotive > Scorecards > [Customer Name]**.
2. Adjust the **Reporting Period** to exactly match the date range stated in the customer's scorecard communication.
3. Confirm timezone — some customer systems use UTC, while IMS defaults to the organisation's local timezone.
4. Re-run the PPM calculation and compare.

### Solution 2: Clarify Reject Counting Rules

1. Request the customer's reject counting methodology from your customer quality contact.
2. Ask specifically: Do they count by incident, by part, or by shipment?
3. In IMS, navigate to **Automotive > Scorecards > Settings > PPM Calculation Rules** and adjust the counting method to match if needed.
4. Document the agreed counting methodology and attach it to the customer record as a reference.

### Solution 3: Export Raw Data for Reconciliation

1. Export the IMS reject log for the period in question: **Automotive > Reports > Reject Log > Export CSV**.
2. Share the raw data with the customer quality team and ask them to share their equivalent data.
3. Compare row by row to identify which specific incidents are causing the discrepancy.
4. Update IMS records where incidents were miscoded or missing.

## Prevention

- Schedule a quarterly scorecard alignment meeting with key customers to confirm methodology alignment before discrepancies escalate.
- Store the agreed PPM counting rules in the customer record notes field for reference during future disputes.
- Use the customer portal to share your scorecard data proactively — this allows the customer to flag discrepancies early rather than at the formal review.
`,
  },
  {
    id: 'KB-TS2-006',
    title: 'DHF Completeness Check Showing Missing Sections',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['troubleshooting', 'medical', 'dhf', 'design-controls'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# DHF Completeness Check Showing Missing Sections

## Symptom

The Design History File (DHF) completeness report flags certain sections as missing or incomplete even though documents have been uploaded and appear to exist in the system.

## Possible Causes

- Documents were uploaded to the wrong DHF section — for example, a Design Verification Protocol uploaded to the Design Validation section
- Documents exist but are still in a pending approval state, which the completeness check treats as not yet accepted
- The uploaded file type is not in the accepted list for that DHF section (e.g., the section requires PDF but a .docx was uploaded)
- The DHF template version was updated after documents were uploaded, adding new required sections not previously present

## Solutions

### Solution 1: Move Documents to the Correct DHF Section

1. Open the DHF record in **Medical > Design Controls > DHF**.
2. Click on the section flagged as missing in the completeness report.
3. If the document is in the system but in the wrong section, use **Move Document** in the document's action menu.
4. Select the correct target section from the dropdown and confirm.
5. Re-run the completeness check.

### Solution 2: Approve Pending Items

1. In the DHF record, filter documents by status **Pending Approval**.
2. Review each pending document. If the content is correct, click **Approve**.
3. If you are not the designated approver, notify the approver and request they complete the approval.
4. The completeness check will update automatically once all documents in the section are approved.

### Solution 3: Check Accepted File Types

1. Click the section name in the DHF to view its configuration.
2. The **Accepted File Types** list is shown in the section details panel.
3. If your uploaded file type is not in the accepted list, download the document, convert it to PDF or the required format, and re-upload.
4. Delete the incorrectly typed document after successful re-upload.

## Prevention

- Use the DHF upload wizard rather than uploading directly to the document library — the wizard enforces section placement and file type validation at upload time.
- Review DHF template version notes when the template is updated to understand if new required sections have been added.
- Assign a DHF custodian role who periodically reviews completeness status for all active DHFs.
`,
  },
  {
    id: 'KB-TS2-007',
    title: 'CAPA Not Closing After Effectiveness Check Approved',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['troubleshooting', 'medical', 'capa'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# CAPA Not Closing After Effectiveness Check Approved

## Symptom

A CAPA record remains in Open status even after the effectiveness verification has been approved by the designated reviewer. The expected transition to Closed status has not occurred.

## Possible Causes

- There are additional linked corrective actions or sub-tasks under the CAPA that are still in an open state
- A secondary approver (e.g., Quality Director or Regulatory Affairs) has not yet completed their signature in a multi-level approval workflow
- A workflow step earlier in the process was skipped or bypassed, leaving a required gate incomplete
- The effectiveness check was approved for a verification plan but the CAPA record itself requires a separate closure approval

## Solutions

### Solution 1: Check Linked Actions List

1. Open the CAPA record in **Medical > CAPA**.
2. Navigate to the **Linked Actions** tab.
3. Review all linked corrective and preventive actions. Any item showing status other than Closed or Verified will block CAPA closure.
4. Close or verify each linked action, or unlink any that are no longer relevant with appropriate justification.
5. After all linked actions are closed, attempt to close the CAPA again.

### Solution 2: Verify All Approvers Have Signed

1. Click the **Approval History** tab on the CAPA record.
2. Review the list of required approvers and their status (Pending, Approved, Rejected).
3. Contact any approver with a Pending status and request they complete their review.
4. If an approver is unavailable (e.g., on leave), an administrator can reassign the approval step via **Admin > Workflow > Reassign Approval**.

### Solution 3: Review Workflow Configuration

1. Navigate to **Admin > Workflows > CAPA Closure Workflow**.
2. Open the workflow diagram and verify that all steps are connected without gaps.
3. If a step was added after this CAPA was created, the existing CAPA may not have the new step in its instance. An administrator can manually advance the workflow instance via **Admin > Workflow Instances > [CAPA ID] > Force Advance**.
4. Document the forced advance in the CAPA notes for audit trail purposes.

## Prevention

- Configure the CAPA workflow to show a progress indicator so users can see exactly which steps remain before closure.
- Set up automated escalation reminders for pending approvers to reduce delays.
- Perform a workflow design review when adding new approval steps to assess impact on in-flight CAPA records.
`,
  },
  {
    id: 'KB-TS2-008',
    title: 'Complaint Not Routing to Regulatory Team',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['troubleshooting', 'medical', 'complaints', 'routing'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Complaint Not Routing to Regulatory Team

## Symptom

Serious complaints (those meeting the MDR reportability criteria) are not automatically routing to the regulatory affairs team after being logged. The regulatory team is only becoming aware of complaints through manual communication.

## Possible Causes

- The severity threshold that triggers regulatory routing has not been configured in the complaint workflow settings
- The routing rule condition logic is incorrect — for example, filtering on the wrong field or using an AND condition where OR is needed
- The regulatory affairs team inbox or notification group has not been set up in the system
- The complaint was categorised with a severity level below the configured threshold even though the clinical significance warrants escalation

## Solutions

### Solution 1: Check Routing Rule Severity Thresholds

1. Navigate to **Admin > Workflows > Complaint Routing Rules**.
2. Locate the rule intended to route to regulatory affairs.
3. Check the **Trigger Condition** — it should read something like: Severity IN (Serious, Critical) OR MDR Reportable = Yes.
4. If the condition is missing or incorrect, click **Edit Rule** and update it.
5. Test the rule using the **Simulate** button with a complaint record that meets the criteria.

### Solution 2: Verify Team Inbox Email

1. Navigate to **Admin > Teams > Regulatory Affairs**.
2. Confirm the team has a valid shared inbox email address configured in the **Notification Email** field.
3. Send a test message using **Test Notification** to confirm delivery.
4. If no email arrives, check SMTP configuration under **Admin > System Settings > Email**.

### Solution 3: Test with a Dummy Complaint

1. Create a test complaint record with Severity set to Serious and MDR Reportable set to Yes.
2. Save and submit the complaint.
3. Check whether the regulatory affairs team inbox receives a routing notification within 5 minutes.
4. If the routing does not occur, review the workflow execution log under **Admin > Workflow Logs** for error messages related to the complaint routing rule.

## Prevention

- Conduct quarterly routing rule audits to verify all complaint escalation paths are functioning correctly.
- Include a routing verification test in the complaint management system validation protocol.
- Train complaint handlers on correct severity categorisation to prevent under-classification of serious complaints.
`,
  },
  {
    id: 'KB-TS2-009',
    title: 'Nonconforming Product Disposition Locked',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['troubleshooting', 'medical', 'nonconformance'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Nonconforming Product Disposition Locked

## Symptom

When attempting to change the disposition status of a nonconforming product record, all disposition options are greyed out and cannot be selected. There is no visible explanation for why the options are locked.

## Possible Causes

- The disposition was approved at a higher authority level (e.g., Material Review Board) and the record is now locked to prevent unauthorised changes
- The current user does not have the Disposition role assigned in their profile
- The product has already been shipped or consumed, and the system has automatically locked the record to protect the traceability chain
- The nonconformance record is linked to an open regulatory deviation that prevents disposition changes until the deviation is resolved

## Solutions

### Solution 1: Check Approval Lock

1. Open the nonconforming product record in **Medical > Nonconformance**.
2. Click **Record Info** in the side panel and look for an **Approval Lock** indicator.
3. If the lock shows a date and approver name, the disposition was approved by an MRB or equivalent authority.
4. To change the disposition, raise a **Disposition Change Request** using the **Actions > Request Disposition Change** menu. This creates an auditable request for the approving authority to review.

### Solution 2: Verify Role Assignment

1. Ask your IMS administrator to check your user profile under **Admin > Users > [Your Name] > Roles**.
2. Confirm that the **QA Disposition** or equivalent role is assigned.
3. If missing, the administrator can add the role immediately.
4. After role assignment, log out and back in to refresh your permission cache, then retry the disposition change.

### Solution 3: Escalate to QA Manager for Unlock

1. If neither of the above applies, contact your QA Manager.
2. The QA Manager (with appropriate admin role) can navigate to **Admin > Nonconformance > [Record ID] > Unlock Disposition**.
3. The unlock action is audit-logged with the reason for unlocking.
4. After unlocking, the QA Manager can either make the disposition change directly or unlock it for the user.

## Prevention

- Document the disposition authority matrix — which roles can approve which disposition types — and configure it in the system to prevent accidental locking.
- Use the nonconformance dashboard to monitor records approaching shipment date so dispositions are resolved before the product ships.
- Train QA staff on the disposition escalation path for MRB-level decisions.
`,
  },
  {
    id: 'KB-TS2-010',
    title: 'Risk Management File Missing Control Measures',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['troubleshooting', 'medical', 'risk', 'iso-14971'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Risk Management File Missing Control Measures

## Symptom

The Risk Management Report generated from the IMS Medical module shows hazards with no control measures listed, even though control measures have been entered in the system.

## Possible Causes

- Control measures were entered in a different module section (e.g., the general Risk Register rather than the ISO 14971 Risk Management File section)
- The hazard-to-control link was not saved — controls exist as standalone records but are not associated with the specific hazard
- Draft control measures have not been approved, and the report is configured to exclude draft items
- A report template filter is excluding certain control types or effectiveness statuses

## Solutions

### Solution 1: Verify Hazard-to-Control Link

1. Open the Risk Management File in **Medical > Risk Management**.
2. Click on the hazard that shows no control measures.
3. In the hazard detail panel, select the **Control Measures** tab.
4. If the tab is empty, click **Link Control Measure** and search for the control by name or reference number.
5. Select the correct control and click **Link**. Save the hazard record.
6. Re-generate the Risk Management Report.

### Solution 2: Approve Draft Controls

1. In the Risk Management File, filter controls by status **Draft**.
2. Review each draft control for completeness.
3. Click **Submit for Approval** on each control and assign the appropriate reviewer.
4. Once approved, re-generate the report. Draft controls will now appear if the report is set to include approved items only.

### Solution 3: Re-generate Report with Correct Settings

1. When generating the Risk Management Report, click **Advanced Options**.
2. Ensure **Include: All Control Measure Statuses** is selected (or at minimum Approved + In Effect).
3. Remove any control type filters that may be excluding certain categories.
4. Generate the report again and verify all hazards now show their associated controls.

## Prevention

- Use the guided Risk Management workflow in the Medical module which enforces the hazard-to-control linking step before the hazard can be marked complete.
- Schedule a monthly ISO 14971 file review using the **Risk File Completeness** report to identify unlinked hazards before they appear in external audits.
- Configure the approval workflow to notify the risk file owner when control measures reach Draft status for more than 5 business days without being approved.
`,
  },
  {
    id: 'KB-TS2-011',
    title: 'FAI Report Showing Wrong Revision Level',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['troubleshooting', 'aerospace', 'fai', 'as9102'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# FAI Report Showing Wrong Revision Level

## Symptom

The First Article Inspection (FAI) report displays a previous drawing revision level on the header, even though the drawing has been updated and approved to a new revision.

## Possible Causes

- The drawing revision was not updated in the part master record before the FAI was created
- The FAI record is linked to an earlier part number revision rather than the current approved revision
- A previous FAI exists and locked the revision reference, preventing automatic update when the drawing changed
- The FAI was copied from a previous record and the revision reference was not updated during copying

## Solutions

### Solution 1: Update Drawing Revision in Part Master

1. Navigate to **Aerospace > Part Master > [Part Number]**.
2. Check the **Current Drawing Revision** field in the part record header.
3. If it does not match the released drawing, click **Update Revision** and enter the new revision level and effective date.
4. Save the part master record.
5. Return to the FAI and use **Re-link to Part Revision** in the FAI Actions menu to pull the updated revision.

### Solution 2: Re-link FAI to Correct Revision

1. Open the FAI record in **Aerospace > First Article Inspection**.
2. Click **Edit** and locate the **Part Revision** field.
3. Clear the current value and use the lookup to select the current approved revision.
4. Confirm any warning about re-linking — this will update the FAI header but not invalidate existing measurement data.
5. Save and re-generate the FAI report.

### Solution 3: Unlock with Engineering Authorisation

1. If the FAI revision is locked by a previous approved FAI, contact your Engineering department to issue a revision lock override.
2. The Engineering lead can navigate to **Aerospace > FAI > [Record] > Revision Lock > Override** using their Engineering authorisation role.
3. Once unlocked, follow Solution 2 to re-link to the correct revision.
4. Document the revision discrepancy and the override authorisation in the FAI notes field.

## Prevention

- Enforce a part master revision update step before any FAI creation — the FAI wizard should query the current approved revision automatically.
- Use drawing-controlled revision linkage so that when a drawing revision is released, the part master is updated automatically.
- Audit FAI reports against the engineering change log at each design review to catch revision mismatches early.
`,
  },
  {
    id: 'KB-TS2-012',
    title: 'Nadcap Certificate Showing Expired Despite Renewal',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['troubleshooting', 'aerospace', 'nadcap'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Nadcap Certificate Showing Expired Despite Renewal

## Symptom

A supplier's Nadcap certificate is showing an Expired status in the IMS Supplier module even though the supplier has provided a new certificate and it has been uploaded to the system.

## Possible Causes

- The expiry date field in the supplier record was not updated when the new certificate was uploaded — the system still calculates status based on the old expiry date
- The new certificate document was uploaded but has not yet been approved, so the system continues to reference the previously approved (and now expired) certificate
- The old certificate was not archived, causing ambiguity in which certificate record is considered current
- The supplier commodity or process scope in the new certificate differs slightly from the old one, triggering a manual review hold

## Solutions

### Solution 1: Update Expiry Date in Supplier Record

1. Open the supplier record in **Aerospace > Suppliers > [Supplier Name]**.
2. Navigate to the **Certifications** tab.
3. Locate the Nadcap certification entry and click **Edit**.
4. Update the **Expiry Date** to the date shown on the new certificate.
5. Save the record. The status will recalculate immediately.

### Solution 2: Approve the New Certificate

1. In the supplier record Certifications tab, find the newly uploaded certificate with a Pending Approval status.
2. Click **Review** and verify the certificate details (process scope, expiry, issuing body).
3. If the certificate is valid, click **Approve**.
4. The approved certificate becomes the current active certificate and the expired one is automatically moved to historical.

### Solution 3: Archive the Expired Certificate

1. Locate the old expired certificate entry in the Certifications tab.
2. Click **Actions > Archive**.
3. Confirm the archive action. The expired certificate moves to the Archived section and no longer affects the supplier's current certification status display.
4. Verify the supplier's overall certification status is now showing Active.

## Prevention

- Configure certificate expiry reminders to notify the supplier management team 90, 60, and 30 days before expiry so renewals are processed proactively.
- Use the **Nadcap Certificate Status** report (Aerospace > Reports) to monitor all suppliers in a single view.
- Require suppliers to submit new certificates via the supplier portal, which has a guided upload process that updates the expiry date field automatically.
`,
  },
  {
    id: 'KB-TS2-013',
    title: 'Key Characteristic Not Appearing on Control Plan',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['troubleshooting', 'aerospace', 'key-characteristics', 'control-plan'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Key Characteristic Not Appearing on Control Plan

## Symptom

A characteristic that has been designated as a Key Characteristic (KC) in the FMEA is not appearing on the associated Control Plan, despite the KC flag being set on the characteristic record.

## Possible Causes

- The KC flag was set on the FMEA characteristic but the FMEA-to-Control-Plan synchronisation has not been run to push the KC designation through
- The Control Plan revision predates the KC designation — the KC was added after the Control Plan version was created and the Control Plan has not been updated
- A display filter on the Control Plan is set to hide Key Characteristics (a non-default setting sometimes used during initial plan creation)
- The characteristic was re-numbered or renamed after being designated as a KC, breaking the reference link

## Solutions

### Solution 1: Resync FMEA to Control Plan

1. Open the FMEA record in **Aerospace > FMEA**.
2. Navigate to the **Control Plan Sync** tab.
3. Click **Sync Now** to push all FMEA characteristic data (including KC flags) to the linked Control Plan.
4. Review the sync summary to confirm the KC was included in the pushed data.
5. Open the Control Plan and verify the KC now appears with the KC designation symbol.

### Solution 2: Check Control Plan Version

1. Open the Control Plan and check the **Revision** and **Last Updated** date in the header.
2. If the Control Plan revision is older than the date the KC was designated, click **Create New Revision**.
3. In the new revision, the KC will be included based on the current FMEA state.
4. Have the new revision reviewed and approved before releasing.

### Solution 3: Remove KC Filter

1. In the Control Plan view, click the **Filter** icon.
2. Check if any filter is applied to the **Characteristic Type** or **Designation** field.
3. If a filter is excluding Key Characteristics or is set to show only non-KC characteristics, clear the filter.
4. The KC characteristics should now appear in the list.

## Prevention

- Enable automatic FMEA-to-Control-Plan sync so that KC designations and other characteristic changes are reflected on the Control Plan without a manual sync step.
- Include a KC completeness check in the Control Plan review checklist that verifies all KC-designated characteristics from the linked FMEA are present.
- Avoid renaming or renumbering characteristics after KC designation — if renaming is necessary, use the system's rename function which maintains the reference link.
`,
  },
  {
    id: 'KB-TS2-014',
    title: 'Counterfeit Part Alert Not Generated for Flagged Supplier',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['troubleshooting', 'aerospace', 'counterfeit-parts'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Counterfeit Part Alert Not Generated for Flagged Supplier

## Symptom

Parts from a supplier that has been flagged for counterfeit risk were received by the receiving inspection team without any counterfeit risk alert being generated in the IMS system.

## Possible Causes

- The supplier is not marked with a Restricted or Counterfeit Risk status on the Approved Supplier List (ASL), so the receiving alert rule has no trigger
- The counterfeit risk alert rule is configured for specific part categories and the received parts fall outside those categories
- The receiving inspection users are not subscribed to the counterfeit risk alert notification channel
- The purchase order was created before the supplier was flagged, and the alert rule only checks current ASL status at PO creation, not at receipt

## Solutions

### Solution 1: Update ASL Status

1. Navigate to **Aerospace > Suppliers > Approved Supplier List**.
2. Search for the flagged supplier and open their ASL record.
3. In the **Risk Status** field, set the value to **Restricted — Counterfeit Risk**.
4. Save the ASL record.
5. The alert rule will now trigger for all future receipts from this supplier.

### Solution 2: Configure Alert for Part Category

1. Navigate to **Admin > Alert Rules > Counterfeit Risk Alert**.
2. Review the **Part Category** filter in the rule conditions.
3. If the filter is restricting alerts to specific categories, either add the relevant category or remove the filter to apply the alert to all parts from flagged suppliers.
4. Save the updated rule.

### Solution 3: Add Receiving Team to Subscribers

1. In the Counterfeit Risk Alert rule settings, click **Notification Subscribers**.
2. Add the receiving inspection team group or the individual user accounts of receiving inspectors.
3. Test by simulating a receipt from a flagged supplier using the **Test Alert** function.
4. Confirm the receiving team receives the notification.

## Prevention

- Review and update the ASL risk status for all suppliers whenever a counterfeit notice is received from industry sources (e.g., GIDEP, ERAI).
- Configure the purchasing module to warn buyers when creating POs against suppliers with Restricted ASL status, giving an earlier prevention point.
- Run a monthly ASL risk status audit report to ensure all flagged suppliers are correctly coded.
`,
  },
  {
    id: 'KB-TS2-015',
    title: 'Configuration Baseline Not Saving After Change Order Approval',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['troubleshooting', 'aerospace', 'configuration-management'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Configuration Baseline Not Saving After Change Order Approval

## Symptom

An Engineering Change Order (ECO) has been approved, but the product configuration baseline has not been updated to reflect the changes described in the ECO. The baseline still shows the pre-change configuration.

## Possible Causes

- The ECO effectivity date is set to a future date, and the baseline update is scheduled to occur on that date rather than immediately
- The configuration baseline is locked because an open production job or manufacturing order references it, preventing changes until the job is closed
- The change type selected on the ECO is not configured to trigger a baseline update — some change types (e.g., documentation-only changes) may be excluded
- The ECO was approved but a post-approval processing step failed silently, leaving the baseline unchanged

## Solutions

### Solution 1: Check Effectivity Date

1. Open the approved ECO in **Aerospace > Engineering Change Management**.
2. Locate the **Effectivity Date** field in the ECO header.
3. If the date is in the future, the baseline will not update until that date.
4. If an immediate update is needed, change the effectivity date to today and save. Note: this requires Engineering authorisation.
5. The baseline will update in the next scheduled baseline processing run (typically within 15 minutes).

### Solution 2: Unlock Baseline After Job Completes

1. Navigate to **Aerospace > Configuration Management > Baselines > [Baseline Name]**.
2. Click **Lock Status** to see which production jobs are holding the lock.
3. Coordinate with production planning to close any completed jobs that are unnecessarily holding the baseline lock.
4. Once all holding jobs are closed or re-linked to a temporary baseline, the lock is released automatically.
5. The ECO-driven baseline update will then be applied.

### Solution 3: Verify Change Type Configuration

1. Go to **Admin > Configuration Management > Change Type Settings**.
2. Find the change type used on the ECO.
3. Check the **Triggers Baseline Update** toggle — if it is off, enable it.
4. For the current ECO, an administrator can manually trigger the baseline update via **Admin > ECO Processing > [ECO Number] > Force Baseline Update**.
5. Document the manual trigger in the ECO notes for traceability.

## Prevention

- Configure effectivity date defaults in the ECO template to be immediate unless the submitter explicitly changes them.
- Implement a post-approval ECO processing health check that alerts the configuration management team if a baseline update fails to complete within 30 minutes of ECO approval.
- Review change type configuration annually to ensure all applicable types trigger baseline updates.
`,
  },
  {
    id: 'KB-TS2-016',
    title: 'Lead Score Not Updating After Website Visit',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['troubleshooting', 'marketing', 'lead-scoring'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Lead Score Not Updating After Website Visit

## Symptom

A prospect visits tracked pages on the company website but their lead score in the IMS Marketing module does not increase. The visit is not reflected in the lead activity timeline.

## Possible Causes

- The website tracking script is not installed on the specific page the prospect visited — it may only be installed on some pages
- The prospect's email address used during website browsing does not match the email stored in the IMS lead record, so the visit cannot be attributed
- Behavioural score updates run on a scheduled batch basis (typically every 24 hours) rather than in real time
- The prospect's browser has tracking protection enabled (e.g., ad blockers, Firefox Enhanced Tracking Protection), preventing the tracking script from firing

## Solutions

### Solution 1: Verify Tracking Script Installation

1. Navigate to **Marketing > Settings > Website Tracking**.
2. Click **Tracking Script** and copy the snippet.
3. Visit the pages the prospect reported visiting and use your browser's developer tools (F12 > Network tab) to verify the IMS tracking endpoint is being called.
4. If the call is absent on certain pages, work with your web team to install the tracking script in the global page header so it loads on all pages.

### Solution 2: Check Email Match in CRM

1. Open the lead record in **Marketing > Leads > [Lead Name]**.
2. Review the **Email** field and compare with any email address the prospect used to submit forms or identify themselves on the website.
3. If a different email was used, add it as a secondary email on the lead record using **Add Email Address**.
4. The tracking engine will re-attribute past and future visits from either email address.

### Solution 3: Allow Up to 24 Hours for Batch Score Recalculation

1. Check the batch schedule under **Admin > Marketing > Score Recalculation Schedule**.
2. If the batch last ran before the website visit, wait for the next scheduled run.
3. After the next run, verify the lead score has been updated.
4. If near-real-time scoring is a business requirement, contact your IMS administrator to discuss enabling real-time score processing (requires additional server resources).

## Prevention

- Use a tag manager (e.g., Google Tag Manager) to deploy the tracking script site-wide, ensuring it appears on every page without manual placement.
- Set up a weekly tracking coverage audit that checks a sample of pages for the presence of the IMS tracking pixel.
- Document the scoring batch schedule in the marketing team's standard operating procedure so they set appropriate expectations with sales colleagues.
`,
  },
  {
    id: 'KB-TS2-017',
    title: 'Campaign ROI Showing Zero Despite Attributed Revenue',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['troubleshooting', 'marketing', 'roi', 'attribution'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Campaign ROI Showing Zero Despite Attributed Revenue

## Symptom

The campaign ROI dashboard displays 0% return for a campaign even though multiple closed deals are attributed to that campaign in the CRM.

## Possible Causes

- The campaign cost has not been entered in the campaign record — ROI cannot be calculated without a cost figure
- The attribution window closed before the deals were marked as won, so the revenue was not credited to the campaign
- The wrong attribution model is selected — for example, last-touch attribution may be crediting revenue to a later campaign in the journey
- The currency of the campaign cost differs from the currency of the attributed revenue, causing a calculation error

## Solutions

### Solution 1: Enter Campaign Cost

1. Open the campaign record in **Marketing > Campaigns > [Campaign Name]**.
2. Navigate to the **Budget** tab.
3. Enter the total campaign spend in the **Actual Cost** field. If spend is spread across multiple categories, enter each line item and the system will sum them.
4. Save the record. The ROI dashboard will recalculate within a few minutes.

### Solution 2: Extend Attribution Window

1. In the campaign record, click **Attribution Settings**.
2. Review the **Attribution Window** setting (e.g., 30 days, 60 days, 90 days).
3. If deals were closed after the window expired, increase the window and click **Recalculate Attribution**.
4. Note that extending the window retroactively may also attribute additional deals from other sources — review the full attribution report after recalculation.

### Solution 3: Switch to Correct Attribution Model

1. In the campaign ROI dashboard, click the **Attribution Model** selector at the top of the page.
2. Toggle between First Touch, Last Touch, Linear, and Time Decay models.
3. Select the model that best represents your organisation's attribution philosophy.
4. The ROI will recalculate immediately for the selected model.
5. Set the preferred model as the default under **Admin > Marketing > Attribution Model Default**.

## Prevention

- Make campaign cost entry a required field during campaign creation so that ROI can be calculated from day one.
- Review attribution window settings at the start of each campaign based on your typical sales cycle length.
- Include a post-campaign ROI review as a standard closing step in the campaign management workflow.
`,
  },
  {
    id: 'KB-TS2-018',
    title: 'LinkedIn Lead Import Failing',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['troubleshooting', 'marketing', 'linkedin', 'import'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# LinkedIn Lead Import Failing

## Symptom

Lead form submissions collected via LinkedIn Lead Gen Forms are not appearing in the IMS Marketing module. The lead count in LinkedIn Campaign Manager is increasing but the leads are absent from IMS.

## Possible Causes

- The LinkedIn integration OAuth token has expired and the connection between LinkedIn and IMS is broken
- The LinkedIn form field mapping has not been configured or is using outdated field references
- The duplicate detection threshold is too aggressive and is blocking new leads that slightly match existing records
- The LinkedIn integration has hit a rate limit or is in a temporary error state

## Solutions

### Solution 1: Refresh LinkedIn OAuth Token

1. Navigate to **Admin > Integrations > LinkedIn**.
2. Check the **Connection Status** — if it shows Expired or Error, click **Reconnect**.
3. You will be redirected to LinkedIn to re-authorise the IMS application.
4. After authorisation, return to IMS and confirm the Connection Status shows Active.
5. Trigger a manual sync using **Sync Now** to pull leads that may have been queued during the disconnection.

### Solution 2: Configure Form Field Mapping

1. In **Admin > Integrations > LinkedIn > Form Mappings**, locate the lead form in question.
2. Verify that each LinkedIn form field (e.g., First Name, Last Name, Email, Company) is mapped to the corresponding IMS lead field.
3. If a LinkedIn form was recently updated with new questions, the mapping will need to be updated to include those new fields.
4. Save the mapping and trigger a test import using the **Import Test Lead** function.

### Solution 3: Review Duplicate Detection Settings

1. Navigate to **Admin > Marketing > Duplicate Detection**.
2. Review the **Match Threshold** — a setting of 80% or higher may be blocking legitimate new leads that share a company name or job title with an existing record.
3. Lower the threshold temporarily (e.g., to 95%) and re-run the LinkedIn sync.
4. Review any blocked leads in the **Duplicate Review Queue** and manually approve leads that are genuine new contacts.

## Prevention

- Set up an integration health monitoring alert that notifies the marketing operations team if the LinkedIn connection expires or errors.
- Schedule a quarterly review of all form field mappings to ensure they remain aligned with the current live form configuration.
- Document the duplicate detection threshold decision and the rationale so future adjustments are made deliberately.
`,
  },
  {
    id: 'KB-TS2-019',
    title: 'Partner Referral Not Credited to Correct Partner',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['troubleshooting', 'marketing', 'partners', 'attribution'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Partner Referral Not Credited to Correct Partner

## Symptom

A deal has been closed but the referral credit has been attributed to the wrong partner, or no partner attribution exists at all on the closed deal record.

## Possible Causes

- The referral link used by the partner was missing the UTM parameters that identify the referring partner
- The deal was closed before the partner submitted a deal registration, so no prior attribution claim existed
- Two partners both claimed the same deal, creating an attribution conflict that was resolved incorrectly or left unresolved
- The lead was originally attributed to one partner but then re-attributed to a different marketing source, overwriting the partner credit

## Solutions

### Solution 1: Verify UTM Parameters on Partner Links

1. Ask the partner to share the exact referral link they used.
2. Check that the link contains the required UTM parameters: 'utm_source', 'utm_medium', and 'utm_campaign' with the partner's unique identifier.
3. If the parameters are missing, the attribution cannot be determined from the link alone.
4. Work with the partner programme team to manually attribute the deal: open the deal record in **Marketing > Deals**, click **Attribution > Set Manual Attribution**, and select the partner.

### Solution 2: Enforce Deal Registration Policy

1. If the partner did not submit a deal registration before close, use this as a teachable moment.
2. Update the partner agreement and onboarding materials to make clear that deal registration must occur before deal close to guarantee attribution.
3. For this specific deal, if evidence of the partner's involvement exists (emails, meeting records), the channel manager can approve a retroactive deal registration via **Partners > Deal Registration > Add Retroactive**.

### Solution 3: Set Primary Partner Conflict Resolution Rule

1. Navigate to **Admin > Partner Programme > Attribution Conflict Rules**.
2. Configure the conflict resolution rule — for example: First Registered Partner wins, or Highest Tier Partner wins.
3. Apply the rule to the current disputed deal by opening the attribution conflict record and clicking **Resolve with Rule**.
4. Communicate the resolution to both partners with a clear explanation.

## Prevention

- Provide all partners with pre-built referral links that already contain correct UTM parameters — remove the risk of partners creating their own untracked links.
- Enforce deal registration as a condition of partner agreement, with a clear cut-off policy (e.g., registration must occur at least 7 days before expected close).
- Send automated reminders to partners with open opportunities that have not yet been registered.
`,
  },
  {
    id: 'KB-TS2-020',
    title: 'Customer Portal Login Failing for New Users',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['troubleshooting', 'customer-portal', 'login', 'access'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Customer Portal Login Failing for New Users

## Symptom

Newly invited customer portal users receive an 'Access Denied' or 'Invalid Invitation' error when clicking the invite link sent to their email, and cannot log in to the portal.

## Possible Causes

- The invite link has expired — customer portal invite links are valid for 48 hours from the time of sending
- The email address the user is attempting to log in with does not exactly match (including case) the email address the invite was sent to
- The customer portal SSO is configured but the user's email domain is not included in the SSO policy
- The user account was created but not activated — a separate activation step may be required in some configurations

## Solutions

### Solution 1: Resend the Invite

1. Log in to the IMS admin portal and navigate to **Customer Portal > Users**.
2. Find the affected user (their account will show status Invited or Pending).
3. Click **Resend Invite**.
4. Instruct the user to click the new link within 48 hours and use the exact email address it was sent to.

### Solution 2: Verify Email Matches Exactly

1. Confirm with the user the exact email address they are using to log in.
2. Compare with the email stored on their portal user record.
3. Correct any discrepancy — note that email addresses are case-insensitive in IMS but the invite token is tied to the exact stored email.
4. If the email address needs to be changed, update it in the portal user record and resend the invite.

### Solution 3: Check SSO Settings or Use Direct Login

1. Navigate to **Admin > Customer Portal > Authentication Settings**.
2. If SSO is enabled, confirm the user's email domain is in the **Allowed SSO Domains** list.
3. Add the domain if missing, or alternatively enable **Direct Login** as a fallback option in the portal authentication settings.
4. Inform the user they can use direct email/password login if SSO is not available for their domain.

## Prevention

- Configure invite links with a longer expiry (up to 7 days) for customers who may not check email daily.
- Include clear instructions in the invite email specifying which email address to use at login.
- Enable a portal self-service account activation page so users can re-send their own invite without contacting support.
`,
  },
  {
    id: 'KB-TS2-021',
    title: 'Supplier Certificate Upload Rejected',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['troubleshooting', 'supplier-portal', 'certificates', 'upload'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Supplier Certificate Upload Rejected

## Symptom

When a supplier attempts to upload a certificate through the supplier portal, they receive an error message: 'File format not supported' and the upload is rejected.

## Possible Causes

- The certificate file is in .docx or .xlsx format rather than PDF, and the portal only accepts PDF certificates
- The file size exceeds the portal upload limit (typically 10 MB)
- The filename contains special characters (e.g., parentheses, ampersands, or accented characters) that the upload system cannot process
- The PDF is password-protected or encrypted, which prevents the system from scanning and validating the document content

## Solutions

### Solution 1: Convert the File to PDF

1. Open the certificate document in its native application (e.g., Microsoft Word).
2. Use **File > Save As** and select **PDF** as the format.
3. Save the PDF and attempt to re-upload via the supplier portal.
4. If the original is already a scanned image in .jpg format, use a PDF conversion tool or printer driver to wrap it in a standard PDF container.

### Solution 2: Compress the File

1. If the PDF exceeds 10 MB, use a PDF compression tool (many are available online) to reduce the file size.
2. Ensure compression does not reduce the document legibility — the certificate text and stamps must remain clearly readable.
3. Re-upload the compressed file.
4. If the certificate is still too large after compression (e.g., a very large scanned document), contact the portal administrator to request a temporary size limit increase or an alternative upload path.

### Solution 3: Rename the File Removing Special Characters

1. Rename the file to use only alphanumeric characters, hyphens, and underscores. For example: 'ISO9001-Certificate-2026.pdf' instead of 'ISO 9001 Certificate (2026) — Supplier&Co.pdf'.
2. Re-upload the renamed file.
3. The portal will accept the file and process the upload.

## Prevention

- Update the supplier onboarding guide and portal help text to specify: PDF format required, maximum 10 MB, no special characters in filename.
- Display these requirements on the upload form itself with inline help text next to the file picker.
- Consider increasing the file size limit to 25 MB to accommodate high-resolution scanned certificates from international suppliers.
`,
  },
  {
    id: 'KB-TS2-022',
    title: 'Deal Registration Not Visible to Internal Sales',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['troubleshooting', 'partners', 'deal-registration'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Deal Registration Not Visible to Internal Sales

## Symptom

A partner has submitted a deal registration through the partner portal, but the internal sales team cannot see the registration when they search in the IMS CRM or partner management module.

## Possible Causes

- The deal registration is in a Pending state awaiting approval, and the sales team's view is filtered to show only Approved registrations
- The sales team has not been assigned to the partner's region or territory, so they do not have visibility of that partner's registrations
- A status filter on the deal registration dashboard is hiding Pending or New records
- The deal registration was submitted to a different IMS environment (e.g., staging) by the partner

## Solutions

### Solution 1: Approve the Deal Registration

1. Navigate to **Partners > Deal Registration > Pending Approval**.
2. Locate the registration submitted by the partner.
3. Review the details and click **Approve** if the deal meets your acceptance criteria.
4. Once approved, the deal registration becomes visible to the assigned sales owner in their CRM view.
5. Alternatively, if the sales team needs to see pending registrations, update their view permissions under **Admin > Roles > Sales Rep > Deal Registration Visibility** to include Pending status.

### Solution 2: Assign Correct Sales Owner

1. Open the deal registration record in **Partners > Deal Registration**.
2. Check the **Sales Owner** field — it may be blank or assigned to an inactive user.
3. Click **Assign Sales Owner** and select the correct sales representative or regional sales manager.
4. Save the record. The assigned sales owner will now see the deal in their CRM deal queue.

### Solution 3: Remove Status Filter

1. In the deal registration dashboard, click the **Filter** icon.
2. Check the **Status** filter — if it is set to show only Approved or Won deals, change it to **All Statuses** or include Pending.
3. The partner's pending deal registration will now appear in the list.
4. Save the filter configuration if you want this view to persist for all sales team members.

## Prevention

- Configure the sales team's default deal registration view to show all statuses so pending registrations are immediately visible.
- Set up an automated notification to the assigned sales owner whenever a partner submits a new deal registration in their territory.
- Define and document the deal registration approval SLA (e.g., 2 business days) so partners know when to expect a response.
`,
  },
  {
    id: 'KB-TS2-023',
    title: 'Partner MDF Request Rejected Without Reason',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['troubleshooting', 'partners', 'mdf'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Partner MDF Request Rejected Without Reason

## Symptom

A partner's Market Development Fund (MDF) request shows a status of Rejected in the partner portal, but no rejection reason is visible to the partner. The partner has contacted the channel team asking why their request was declined.

## Possible Causes

- The approver completed the rejection action but left the **Rejection Reason** field blank — the system allowed the rejection without a mandatory reason
- The notification email template for MDF rejections does not include a placeholder for the rejection reason, so even if a reason was entered it was not included in the email
- The partner's notification email was blocked or delivered to spam, so they never received the rejection communication
- The rejection reason was entered in an internal-only notes field not visible to the partner-facing portal view

## Solutions

### Solution 1: Instruct Approvers to Complete Rejection Reason

1. The channel programme manager should immediately contact the approver who rejected the MDF request.
2. The approver should open the MDF request in **Partners > MDF > [Request ID]** and add the rejection reason in the **Rejection Reason** field.
3. Click **Update and Notify Partner** to send the partner an updated rejection notification including the reason.
4. For the future, an administrator should make the Rejection Reason field mandatory in the MDF approval workflow (**Admin > Workflows > MDF Rejection > Require Rejection Reason = Yes**).

### Solution 2: Fix Notification Template

1. Navigate to **Admin > Notification Templates > MDF Rejection**.
2. Edit the email template and verify that the body includes the placeholder '{{rejectionReason}}' (or the equivalent token for your template engine).
3. If the placeholder is missing, add it in the appropriate location within the template body.
4. Save and test the template by triggering a test rejection notification.

### Solution 3: Check Partner Email Spam Folder

1. Ask the partner to check their spam or junk folder for emails from the IMS sender domain.
2. If found, ask them to mark the sender as safe or add the IMS domain to their email allowlist.
3. Resend the rejection notification from **Partners > MDF > [Request ID] > Resend Notification**.

## Prevention

- Make the Rejection Reason field mandatory for all MDF rejections so approvers cannot submit a rejection without providing feedback.
- Review all partner-facing notification templates quarterly to ensure all relevant data fields are included.
- Include the rejection reason prominently in both the portal status view and the email notification so partners always have a clear explanation.
`,
  },
  {
    id: 'KB-TS2-024',
    title: 'Customer Contract Not Visible in Portal',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['troubleshooting', 'customer-portal', 'contracts'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Customer Contract Not Visible in Portal

## Symptom

A customer logs in to the customer portal and cannot see their active contract under the Contracts section. The portal shows no documents or an empty state.

## Possible Causes

- The contract record exists in IMS but has not been published to the customer portal — it is in an internal-only state
- The contract is linked to a different customer account than the one the user is logged in under
- The portal document permissions for this customer tier or contract type do not include access to contract viewing
- The contract is in Draft or Pending status and the portal is configured to show only Active or Executed contracts

## Solutions

### Solution 1: Publish Contract to Portal

1. Open the contract record in **CRM > Contracts > [Contract Name]**.
2. In the contract actions menu, click **Publish to Customer Portal**.
3. Select the customer account that should have visibility.
4. Set the access level (e.g., View Only or Download Allowed).
5. Click **Publish**. The contract will appear in the customer portal within 5 minutes.

### Solution 2: Verify Account Linkage

1. In the contract record, check the **Customer Account** field.
2. Open the customer portal and navigate to **Admin > Customer Accounts > [Account Name]**.
3. Confirm the account name and ID matches what is on the contract.
4. If there is a mismatch, update the contract to link to the correct account and re-publish.

### Solution 3: Check Document Permission Tier

1. Navigate to **Admin > Customer Portal > Document Permissions**.
2. Find the permission rule that applies to the customer's tier (e.g., Bronze, Silver, Gold partner or Standard customer).
3. Verify that Contracts are included in the viewable document types for that tier.
4. If contracts are excluded, either update the tier permissions or elevate the individual customer's document access level in their portal account settings.

## Prevention

- Include contract publishing as a step in the contract execution workflow — make it a checklist item so it is not forgotten after signing.
- Set up a default portal publication rule so that executed contracts are automatically published to the linked customer account without manual intervention.
- Use the **Customer Portal Content Audit** report to periodically verify all executed contracts are visible to the correct customers.
`,
  },
  {
    id: 'KB-TS2-025',
    title: 'Supplier PO Acknowledgement Overwriting Delivery Date',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['troubleshooting', 'supplier-portal', 'purchase-orders'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Supplier PO Acknowledgement Overwriting Delivery Date

## Symptom

When a supplier acknowledges a purchase order through the supplier portal, the required delivery date on the PO is being replaced by the supplier's proposed delivery date without any approval or review step.

## Possible Causes

- The PO acknowledgement form is configured to allow the supplier to edit and override the requested delivery date field
- There is no approval workflow triggered when a supplier proposes a different delivery date from the one requested
- The delivery date field mapping between the portal form and the PO record incorrectly maps the supplier's proposed date to the required delivery date field instead of a separate proposed date field
- A recent portal form update inadvertently changed the delivery date field from read-only to editable

## Solutions

### Solution 1: Disable Date Override in Acknowledgement Form

1. Navigate to **Admin > Supplier Portal > PO Acknowledgement Form Configuration**.
2. Locate the **Required Delivery Date** field in the form builder.
3. Set the field property to **Read Only** — suppliers will be able to see the date but not change it.
4. Add a separate **Supplier Proposed Delivery Date** field if suppliers need to communicate a different timeline.
5. Save and test with a sample PO acknowledgement.

### Solution 2: Add Approval Step for Date Changes

1. Navigate to **Admin > Workflows > PO Acknowledgement Workflow**.
2. Add a conditional step: if **Supplier Proposed Delivery Date** does not match **Required Delivery Date**, route the acknowledgement to the procurement team for review before updating the PO.
3. The procurement team can then accept the proposed date (updating the PO) or reject it and request the supplier confirm the original date.
4. Activate the workflow change.

### Solution 3: Fix Field Mapping

1. Navigate to **Admin > Supplier Portal > Field Mappings > PO Acknowledgement**.
2. Verify that the supplier's delivery date input field maps to **Proposed Delivery Date** on the PO record, not **Required Delivery Date**.
3. Correct the mapping if it is incorrect.
4. Retrospectively review POs acknowledged in the period when the incorrect mapping was active and restore original required delivery dates where they were overwritten.

## Prevention

- Test all portal form configuration changes in a staging environment before deploying to production.
- Include PO delivery date integrity in the supplier portal regression test suite.
- Notify the procurement team of any supplier delivery date changes via an automated alert so they can proactively manage scheduling impacts.
`,
  },
  {
    id: 'KB-TS2-026',
    title: 'Dashboard Widgets Not Loading Data',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['troubleshooting', 'dashboard', 'performance'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Dashboard Widgets Not Loading Data

## Symptom

One or more dashboard widgets display a spinning loading indicator indefinitely, or show 'No data available' when data is expected to exist.

## Possible Causes

- The API service that provides data for the widget module is down or unhealthy
- The widget's date range filter is set to a period that contains no data (e.g., a future date range or a very old period)
- The current user has no data recorded in that module yet (e.g., a new organisation with no incidents logged)
- The browser session has become stale and the widget's data fetch is failing silently due to an expired token

## Solutions

### Solution 1: Check Service Health

1. Navigate to **Admin > System Health** or visit the API health status page at '/health' on the gateway.
2. Review the status of each API service. Services shown as Unhealthy or Offline will affect their corresponding widgets.
3. Contact your IMS administrator to restart the affected service.
4. Once the service is healthy, refresh the dashboard — widgets will reload automatically.

### Solution 2: Reset Date Filter

1. Click the date filter icon on the affected widget.
2. Reset the date range to a predefined option such as **Last 30 Days** or **This Year**.
3. Click **Apply**. If data exists in this range, the widget will populate.
4. If the widget requires a custom date range, ensure the From date is before the To date and that both are in the past.

### Solution 3: Add Sample Data or Check Onboarding Status

1. If your organisation has just started using the module, there may genuinely be no data yet.
2. Refer to the getting started guide for the relevant module to begin adding records.
3. After adding at least one record, return to the dashboard and the widget should update.

### Solution 4: Refresh Session

1. Log out of IMS and log back in to refresh your authentication token.
2. If the widgets load after re-login, the issue was a stale session. Tokens are typically valid for 8 hours.
3. If widgets still fail, clear your browser cache and cookies before logging in again.

## Prevention

- Enable API service health monitoring with automated alerts so your IMS administrator is notified of service failures before users notice widget failures.
- Set sensible default date ranges for all dashboard widgets during initial setup rather than leaving them at the factory default.
- Configure the dashboard to show a clear 'Service Unavailable' message on widgets when their API is unreachable, rather than a silent spinner.
`,
  },
  {
    id: 'KB-TS2-027',
    title: 'Scheduled Reports Not Sending',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['troubleshooting', 'reports', 'email', 'scheduled'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Scheduled Reports Not Sending

## Symptom

Scheduled report jobs that are configured to email reports on a weekly basis are not delivering emails to recipients. The scheduled jobs appear in the system but no emails arrive.

## Possible Causes

- SMTP email settings are not correctly configured in the system, preventing any emails from being sent
- The scheduled report job has been disabled — either manually or after an error caused the job to auto-disable
- One or more recipient email addresses are on the system's email suppression list due to a previous bounce
- The report job is erroring during generation (e.g., a data source is unavailable), preventing the email step from being reached

## Solutions

### Solution 1: Verify SMTP Settings

1. Navigate to **Admin > System Settings > Email Configuration**.
2. Verify the SMTP host, port, username, and password are correctly entered.
3. Click **Send Test Email** and enter your own email address.
4. If no test email arrives within 5 minutes, the SMTP settings are incorrect. Contact your email service provider to confirm the correct settings.
5. Update and save the corrected settings.

### Solution 2: Check Job Schedule Active Flag

1. Navigate to **Admin > Scheduled Jobs > Report Jobs**.
2. Find the scheduled report job in the list.
3. Check the **Status** column — if the job shows Disabled or Error, click **Enable** to re-activate it.
4. Manually trigger the job using **Run Now** to test whether it runs successfully and sends email.

### Solution 3: Remove Recipient from Suppression List

1. Navigate to **Admin > Email > Suppression List**.
2. Search for the recipient's email address.
3. If found, click **Remove from Suppression** and save.
4. The next scheduled report run will include this recipient.

### Solution 4: Check Report Error Log

1. In **Admin > Scheduled Jobs > Report Jobs**, click the job name.
2. Navigate to the **Execution History** tab.
3. Review the most recent execution entries for error messages.
4. Common errors include: data source connection timeout, report template missing, or insufficient permission to access module data.
5. Resolve the identified error and re-trigger the job.

## Prevention

- Configure automated monitoring for scheduled job failures — an alert should be sent to the system administrator if a scheduled report fails.
- Include a quarterly review of all scheduled report jobs as part of system administration routines.
- Test SMTP configuration after any system upgrade or server change that might affect network connectivity.
`,
  },
  {
    id: 'KB-TS2-028',
    title: 'Bulk Import Failing Mid-File',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['troubleshooting', 'import', 'bulk', 'data'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Bulk Import Failing Mid-File

## Symptom

A CSV file import processes the first 200 or so rows successfully and then stops without a clear error message. The remaining rows are not imported.

## Possible Causes

- A row in the middle of the file has an empty value in a required field — the importer halts on the first validation failure
- The date format changes partway through the file (e.g., the first half uses DD/MM/YYYY and the second uses MM/DD/YYYY), causing a parsing error
- A non-UTF-8 character (e.g., a curly quote, accented character, or special symbol) appears in the file and causes an encoding error at that row
- The file exceeds the per-import row limit and is being truncated silently

## Solutions

### Solution 1: Validate Required Fields

1. Open your CSV file in Excel or Google Sheets.
2. Use the filtering functionality to identify rows where required columns are empty.
3. Common required fields are: Name, Date, Category, Status — refer to the import template for your module.
4. Fill in or remove rows with missing required data.
5. Re-save as CSV and re-import.

### Solution 2: Standardise Date Format Throughout the File

1. In Excel, select the date column and format all cells as the same date format using **Format Cells > Date**.
2. Confirm the date format matches the import template specification (shown in the import wizard). IMS typically expects YYYY-MM-DD.
3. If using formulas to generate dates, ensure all formulas output the same format.
4. Re-save as CSV. When saving, Excel may show a warning about format compatibility — accept it.

### Solution 3: Re-save as UTF-8 CSV

1. In Excel, use **File > Save As** and from the format dropdown, select **CSV UTF-8 (Comma delimited)** (available in Excel 2016 and later).
2. In Google Sheets, use **File > Download > Comma Separated Values (.csv)** — Sheets always exports in UTF-8.
3. Re-import the UTF-8 encoded file.
4. If non-standard characters (e.g., copyright symbols, special punctuation) are genuinely needed in your data, they will now be handled correctly.

## Prevention

- Provide a download link to the official import template for each module — the template includes headers and example data to guide correct formatting.
- Run the import validator (available in the import wizard) before committing the import, which highlights errors row by row without actually importing data.
- For very large imports, split the file into batches of 1,000 rows to reduce the impact of a single problematic row.
`,
  },
  {
    id: 'KB-TS2-029',
    title: 'Notification Emails Going to Spam',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['troubleshooting', 'notifications', 'email', 'spam'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Notification Emails Going to Spam

## Symptom

Multiple users report that IMS notification emails (workflow approvals, alerts, report deliveries) are being delivered to their spam or junk folder rather than their inbox.

## Possible Causes

- SPF (Sender Policy Framework) and DKIM (DomainKeys Identified Mail) DNS records have not been configured for the domain used to send IMS emails
- Email content contains phrases or patterns that trigger spam filters (e.g., too many links, marketing-style language, or missing plain text alternative)
- The sending domain or IP address has not been whitelisted by recipients' corporate email security gateways
- The sending IP address has ended up on a third-party email blocklist

## Solutions

### Solution 1: Configure SPF and DKIM Records

1. Contact your DNS administrator and request the following DNS records be added for your sending domain:
   - SPF: a TXT record on your domain that includes the IMS email server's IP or the SMTP provider's SPF include directive
   - DKIM: a TXT record with the public key provided by your SMTP service (found in **Admin > Email Configuration > DKIM Setup**)
2. After DNS records propagate (up to 48 hours), send a test email and use an email testing tool (e.g., mail-tester.com) to verify SPF and DKIM are passing.

### Solution 2: Reduce Spam-Triggering Language in Templates

1. Navigate to **Admin > Notification Templates**.
2. Review email templates for: excessive use of capital letters, multiple exclamation marks, phrases like 'click here', 'urgent action required', or large numbers of hyperlinks.
3. Revise templates to use professional, plain language with only essential links.
4. Ensure all templates include a plain text alternative in addition to HTML format.

### Solution 3: Request Users Whitelist the Sender

1. Instruct IMS users to add the IMS sending email address (e.g., 'notifications@yourdomain.com') to their contacts or safe senders list.
2. For corporate email environments, provide the IMS sending domain to the IT/email security team to add to the allowed senders list in the email gateway.
3. In Microsoft 365 environments, this is done via the Exchange admin centre under mail flow rules.

## Prevention

- Complete SPF and DKIM configuration during initial IMS setup, before sending any notifications.
- Use a dedicated sending domain for IMS notifications (e.g., 'ims-mail.yourdomain.com') so its reputation is not affected by other email traffic from the main domain.
- Monitor email delivery rates monthly using the Email Delivery Report (**Admin > Email > Delivery Report**) to catch deliverability issues early.
`,
  },
  {
    id: 'KB-TS2-030',
    title: 'Module Permission Change Not Taking Effect',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['troubleshooting', 'permissions', 'rbac', 'access'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Module Permission Change Not Taking Effect

## Symptom

An administrator has changed a user's role or module permissions, but the affected user continues to see their old set of permissions and either still has access they should not have, or cannot access something they should now be able to.

## Possible Causes

- The user's current browser session is caching the old permission set from their login token, which does not refresh until they log out and back in
- The role change requires a system re-login to propagate — some permission systems issue permissions at login time only
- There is a background permission propagation job that has not yet run since the change was made
- The user has multiple role assignments and the conflicting older role is overriding the new assignment

## Solutions

### Solution 1: Ask the User to Log Out and Back In

1. The user should click their name/avatar in the top right corner and select **Log Out**.
2. Fully log out (not just navigate away — ensure the session is terminated).
3. Log back in with their credentials.
4. The new role and permissions will be applied to the fresh session token.
5. Verify the permissions are now correct by having the user attempt the previously blocked or newly granted action.

### Solution 2: Clear Browser Cache

1. If logging out and in does not resolve the issue, the browser may be serving a cached version of the application.
2. Instruct the user to press Ctrl+Shift+Delete (Cmd+Shift+Delete on Mac) and clear cached images, cookies, and local storage.
3. Close and reopen the browser, then log in again.

### Solution 3: Check Permission Propagation Job

1. Navigate to **Admin > System Jobs > Permission Propagation**.
2. Check when the job last ran and whether it completed successfully.
3. If the job has not run since the role change was made, click **Run Now**.
4. After the job completes, ask the user to log out and back in.

### Solution 4: Review All Role Assignments

1. Navigate to **Admin > Users > [User Name] > Roles**.
2. Review all role assignments — the user may have multiple roles assigned.
3. If an older role conflicts with the new one, remove the outdated role.
4. Save and ask the user to re-login.

## Prevention

- Communicate to users that role changes require a re-login to take effect — include this in the system user guide.
- Schedule the permission propagation job to run frequently (e.g., every 15 minutes) to minimise delay between admin changes and user experience.
- Regularly audit user role assignments to remove outdated roles that may conflict with current access requirements.
`,
  },
  {
    id: 'KB-TS2-031',
    title: 'Search Results Not Finding Recent Records',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['troubleshooting', 'search', 'indexing'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Search Results Not Finding Recent Records

## Symptom

The global search function does not return records that were created within the last hour. Searching by exact title or reference number for a recently created record yields no results.

## Possible Causes

- The search index is updated on a scheduled basis (e.g., every 15 minutes or hourly) and the record was created after the last index run
- The record creation process encountered a silent error and the record was not fully saved, so it does not exist to be indexed
- The search module scope is set to a subset of modules that does not include the module where the record was created
- The search service is experiencing indexing lag due to a high volume of recent record changes

## Solutions

### Solution 1: Wait for Next Index Cycle or Trigger Manual Reindex

1. Navigate to **Admin > Search > Index Status**.
2. Check the **Last Indexed** timestamp and **Next Scheduled Index** time.
3. If the record was created after the last index run, wait for the next scheduled run.
4. If you need the record to appear immediately, click **Reindex Now** (available to administrators). This queues an immediate reindex and records will appear within a few minutes.

### Solution 2: Verify Record Was Saved

1. Navigate directly to the module where the record should exist (e.g., **Health & Safety > Incidents**).
2. Search or browse for the record using the module's own list view.
3. If the record does not appear in the module list view either, it was not successfully saved. Re-create the record.
4. If the record exists in the module list but not in global search, proceed to trigger a manual reindex.

### Solution 3: Check Module Scope in Search

1. In the global search bar, click the **Scope** or **Filter** icon.
2. Verify that the module associated with the missing record is included in the search scope.
3. If a specific module is excluded, add it to the scope and retry the search.
4. To search across all modules at once, select **All Modules** in the scope picker.

## Prevention

- Configure the search index to run on a short cycle (every 5-10 minutes) to minimise the gap between record creation and search visibility.
- Display the last index timestamp on the global search results page so users understand when results were last updated.
- Set up a monitoring alert if the search indexing job fails or falls significantly behind schedule.
`,
  },
  {
    id: 'KB-TS2-032',
    title: 'Audit Trail Missing Entries',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['troubleshooting', 'audit-trail', 'compliance'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Audit Trail Missing Entries

## Symptom

The audit trail for a module or specific record shows gaps — certain user actions that should have been logged are absent from the audit history.

## Possible Causes

- The action type that is missing from the audit trail is not configured for logging in the audit configuration settings
- High-volume events (e.g., bulk updates) are being truncated due to a maximum audit entries per batch setting
- The database write for the audit log entry timed out during a period of high load, causing the entry to be dropped without an error visible to the user
- The audit trail viewer is filtering out entries of that action type by default

## Solutions

### Solution 1: Verify Action Type is in Audit Configuration

1. Navigate to **Admin > Audit Trail > Configuration**.
2. Review the list of action types configured for logging (e.g., Create, Update, Delete, Approve, Export).
3. If the missing action type is not in the list, click **Add Action Type**, select it, and enable logging.
4. Note: this change will apply to future actions — historical gaps cannot be retroactively filled.

### Solution 2: Check Truncation Settings

1. In **Admin > Audit Trail > Configuration**, review the **Max Entries Per Batch** setting.
2. If bulk operations regularly exceed this limit, increase the setting or disable the truncation cap.
3. Review the **Audit Retention Policy** — very old entries may have been purged according to the retention schedule. For compliance purposes, ensure the retention period meets your regulatory requirements.

### Solution 3: Increase Database Write Timeout

1. Contact your IMS system administrator or database administrator.
2. Review the database connection timeout setting for audit log writes in the application configuration.
3. Increase the write timeout for audit log operations (recommended: at least 10 seconds).
4. For production systems under sustained high load, consider offloading audit log writes to a dedicated secondary database or message queue to prevent timeout-related drops.

### Solution 4: Check Audit Trail Viewer Filters

1. Open the audit trail viewer and check whether any filters are applied.
2. If the **Action Type** filter excludes the action you are looking for, clear the filter.
3. Also check the **Date Range** filter to ensure the period in question is included.

## Prevention

- Perform an annual audit trail completeness review comparing expected action counts against logged entries for critical modules.
- Configure an alert for audit log write failures so gaps can be investigated immediately when they occur.
- Ensure the database has sufficient I/O capacity and connection pool headroom to handle audit log writes without timeout during peak usage periods.
`,
  },
  {
    id: 'KB-TS2-033',
    title: 'Custom Fields Not Appearing on Export',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['troubleshooting', 'custom-fields', 'export'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Custom Fields Not Appearing on Export

## Symptom

Custom fields that are visible and populated on the record form in the IMS interface are not included in the CSV or Excel export file. The export contains only the standard system fields.

## Possible Causes

- The custom fields have not been added to the export template used when generating the export
- The export is using an older, legacy export template that predates the creation of the custom fields
- The custom field values are null for the records being exported, and the export is configured to exclude null columns
- The export was triggered from a module list view that uses a different field set than the record detail view

## Solutions

### Solution 1: Update Export Template to Include Custom Fields

1. Navigate to **Admin > Export Templates > [Module Name]**.
2. Open the default export template and click **Edit**.
3. In the field selector, scroll to the **Custom Fields** section at the bottom of the available fields list.
4. Drag and drop each required custom field into the export columns area.
5. Save the template. The next export will include these custom fields as columns.

### Solution 2: Select Correct Export Template

1. When initiating an export from the module list view, click **Export > Choose Template**.
2. If multiple templates are available, select the most recently created or updated one, which is most likely to include custom fields.
3. If no template with custom fields exists, follow Solution 1 to create one.

### Solution 3: Handle Null Values

1. In the export template editor, find the **Export Options** section.
2. Locate the **Include Columns with All Null Values** toggle and set it to **Yes**.
3. This ensures custom field columns appear even when all records have a null value for that field.
4. Save and re-run the export.

## Prevention

- After creating a new custom field, immediately add it to all relevant export templates as part of the custom field deployment checklist.
- Use a versioned naming convention for export templates (e.g., Incidents Export v2) so it is easy to identify which template is current.
- Test exports after any custom field configuration change to verify the output matches expectations.
`,
  },
  {
    id: 'KB-TS2-034',
    title: 'Workflow Automation Trigger Not Firing',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['troubleshooting', 'workflows', 'automation'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Workflow Automation Trigger Not Firing

## Symptom

A configured workflow automation rule is not executing its actions even when the trigger conditions are met. Records that should trigger the workflow show no evidence of the automation having run.

## Possible Causes

- A field that was previously used in the trigger condition has been renamed, breaking the field reference mapping in the rule
- The automation rule has been disabled — either manually by an administrator or automatically after repeated execution errors
- A trigger event throttle is active, limiting how frequently the rule can fire for a given record to prevent runaway automation loops
- The trigger condition logic contains an error (e.g., an AND condition where OR is needed) that is never satisfied

## Solutions

### Solution 1: Remap Trigger Field

1. Navigate to **Admin > Workflows > Automation Rules > [Rule Name]**.
2. Open the trigger condition and review each field reference.
3. If a field reference shows a warning icon or 'Field not found' message, the field has been renamed or deleted.
4. Click the field reference and use the dropdown to re-select the current field name.
5. Save the rule. The trigger will resume firing for matching events.

### Solution 2: Enable the Rule

1. In the Automation Rules list, check the **Status** column for the rule.
2. If the rule is shown as Disabled or Paused, click **Enable**.
3. Review the **Execution Log** tab to understand why the rule was disabled (e.g., too many errors, manual disable).
4. Resolve any underlying errors before re-enabling to prevent it from being auto-disabled again.

### Solution 3: Check Throttle Settings

1. Open the automation rule and navigate to the **Advanced Settings** tab.
2. Review the **Trigger Throttle** setting — for example, a throttle of 1 execution per record per hour means the rule will only fire once per hour even if conditions are met multiple times.
3. If the throttle is causing missed executions, reduce the throttle interval or disable it if looping is not a concern for this rule.
4. Save and test.

### Solution 4: Verify Condition Logic

1. Open the automation rule and review the trigger conditions.
2. Use the **Simulate** function: enter a sample record's data and check whether the simulation shows the rule as Triggered or Not Triggered.
3. If Not Triggered, adjust the condition logic — changing AND to OR between conditions or correcting threshold values.
4. Save and simulate again until the desired trigger behaviour is confirmed.

## Prevention

- Use the automation rule simulator to test all new rules before activating them in production.
- Monitor the automation rule execution log weekly to catch disabled rules or high error rates early.
- Apply a naming convention to fields and do not rename them without checking whether any automation rules reference them.
`,
  },
  {
    id: 'KB-TS2-035',
    title: 'Document Version Lock Cannot Be Released',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['troubleshooting', 'document-control', 'version-lock'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Document Version Lock Cannot Be Released

## Symptom

A document in the document control system appears to be checked out (version-locked) by a user who is no longer active in the system. No one else can edit or approve the document while it remains locked.

## Possible Causes

- The user who checked out the document was deactivated or removed from the system while the document was still checked out, preventing them from checking it back in
- The automatic checkout release job (which releases locks for sessions inactive for more than N hours) failed to run or did not cover this document
- The user's session cleanup on logout did not execute correctly, leaving a ghost checkout record
- The document was checked out programmatically via API and the releasing API call was never made

## Solutions

### Solution 1: Admin Force-Release Checkout

1. Navigate to **Admin > Document Control > Checkout Manager**.
2. Search for the document by name or ID.
3. The checkout record will show the locking user, checkout date, and time elapsed.
4. Click **Force Release** next to the document.
5. Enter a justification for the forced release (required for audit trail purposes).
6. Confirm. The document lock is released immediately and the document becomes editable again.

### Solution 2: Run Session Cleanup

1. Navigate to **Admin > System Jobs > Session Cleanup**.
2. Click **Run Now** to execute the cleanup job immediately.
3. This job identifies all checkout records where the associated user session has expired and releases them.
4. After the job completes, return to the document and verify the checkout lock has been released.

### Solution 3: Temporarily Reactivate User to Check In

1. If the document has significant unsaved changes that should be preserved in the checkout, consider reactivating the user account temporarily.
2. Navigate to **Admin > Users > [User Name]** and set account status to Active.
3. Log in as the user (or assist them if they are still reachable) and check in the document.
4. Deactivate the account again after check-in.
5. This approach is appropriate when the checkout contains important in-progress work.

## Prevention

- Configure the session cleanup job to run automatically every 4-8 hours so orphaned checkouts are released regularly.
- Set a maximum checkout duration (e.g., 48 hours) after which the document is automatically released and the checking-out user notified.
- When deactivating a user, include a pre-deactivation step that checks for open document checkouts and either releases or transfers them.
`,
  },
  {
    id: 'KB-TS2-036',
    title: 'Two-Factor Authentication Codes Not Accepted',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['troubleshooting', 'auth', '2fa', 'security'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Two-Factor Authentication Codes Not Accepted

## Symptom

TOTP codes generated by the user's authenticator app (e.g., Google Authenticator, Microsoft Authenticator, Authy) are being rejected as invalid, even when entered immediately after generation.

## Possible Causes

- The device running the authenticator app has a clock that has drifted more than 30 seconds from the correct UTC time — TOTP codes are time-sensitive and will be rejected if the clock is off
- The authenticator app itself has become out of sync with the server's time reference
- The 2FA secret key stored in the authenticator app has become corrupted or the QR code was scanned incorrectly during initial setup
- The user is entering the code too slowly — TOTP codes expire every 30 seconds and if the user enters the code in the final seconds of its validity it may expire before the server validates it

## Solutions

### Solution 1: Sync Device Time via NTP

1. On the device running the authenticator app, navigate to the date and time settings.
2. Enable **Automatic (Network) Time Synchronisation** if it is not already enabled.
3. On Android: Settings > General Management > Date and Time > Automatic date and time.
4. On iOS: Settings > General > Date & Time > Set Automatically.
5. After syncing, open the authenticator app and generate a new code, then attempt login immediately.

### Solution 2: Re-enrol 2FA by Resetting the Secret

1. An administrator can reset a user's 2FA configuration: navigate to **Admin > Users > [User Name] > Security > Reset 2FA**.
2. After the admin resets 2FA, the user will be prompted to re-scan the QR code on their next login attempt.
3. The user should carefully scan the new QR code using their authenticator app on a device with correctly synced time.
4. Complete the verification step to confirm the new code is working before the re-enrolment is finalised.

### Solution 3: Use Backup Codes

1. If the user saved backup codes when they originally set up 2FA, they can use one of these codes to log in.
2. On the 2FA entry screen, click **Use a backup code** or **Having trouble?**.
3. Enter one of the unused backup codes.
4. After successfully logging in, navigate to **Profile > Security > Two-Factor Authentication** and re-enrol to generate a new working TOTP secret.

## Prevention

- Recommend users enable automatic time synchronisation on all devices they use for authentication.
- During 2FA setup, display a clear instruction to verify the code works immediately after scanning the QR code, before leaving the setup page.
- Store backup codes in a secure location (e.g., a password manager) at the time of 2FA enrolment.
`,
  },
  {
    id: 'KB-TS2-037',
    title: 'API Key Returning 401 Unauthorized',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['troubleshooting', 'api', 'authentication', 'integration'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# API Key Returning 401 Unauthorized

## Symptom

A third-party integration using an IMS API key is receiving 401 Unauthorized responses intermittently or consistently, even though the API key appears to be correctly configured in the external system.

## Possible Causes

- The API key has reached its expiry date and is no longer valid
- The API key has exceeded its rate limit for the current time window, causing requests to be rejected
- The API key's configured scopes do not include permission to access the specific endpoint being called
- The API key was revoked — either manually by an administrator or automatically as part of a security audit

## Solutions

### Solution 1: Regenerate the API Key

1. Navigate to **Admin > API Keys** in the IMS admin console.
2. Locate the API key used by the integration (identified by name or the partial key shown in the list).
3. Check the **Status** and **Expiry Date** columns.
4. If the key is expired or revoked, click **Generate New Key** to create a replacement.
5. Copy the new key value (it is only shown once) and update it in the third-party integration's configuration.
6. Test the integration to confirm requests are now succeeding.

### Solution 2: Check Rate Limit Headers

1. In the integration's HTTP request logs, check the response headers when a 401 occurs.
2. Look for headers such as 'X-RateLimit-Remaining' and 'X-RateLimit-Reset' — if 'Remaining' is 0, the key has been rate limited.
3. Implement exponential backoff in the integration to handle rate limit responses gracefully.
4. If the rate limit is consistently too low for the integration's needs, request a higher rate limit for the API key via **Admin > API Keys > [Key] > Edit > Rate Limit**.

### Solution 3: Expand Key Scopes

1. Open the API key record in **Admin > API Keys > [Key Name]**.
2. Review the **Allowed Scopes** list.
3. If the endpoint being called requires a scope not listed (e.g., 'write:incidents' for creating incidents), click **Edit** and add the required scope.
4. Save the key. The scope change takes effect immediately without needing to regenerate the key.
5. Test the integration to confirm the 401 is resolved.

## Prevention

- Set API key expiry dates with sufficient advance warning — configure an alert to notify the integration owner 30 days before expiry.
- Document all API key usages and their required scopes in an integration register so that when keys need to be regenerated, the correct scopes can be applied immediately.
- Monitor API key usage with the **API Usage Report** (**Admin > API Keys > Usage Report**) to detect unusual patterns that might indicate a compromised key.
`,
  },
  {
    id: 'KB-TS2-038',
    title: 'Mobile App Sync Not Working',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['troubleshooting', 'mobile', 'sync', 'offline'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Mobile App Sync Not Working

## Symptom

The IMS mobile app is displaying stale data from a previous session, and changes made offline are not syncing to the server after the device reconnects to the internet.

## Possible Causes

- A sync conflict exists between the local offline data and the server version of the same record — the app is waiting for manual conflict resolution before syncing
- The authentication token used by the mobile app has expired, and the app requires re-login to obtain a new token before syncing
- A large attachment (photo, document) in the sync queue is blocking all subsequent sync operations
- The mobile device's background app refresh is disabled, preventing the sync from running when the app is not in the foreground

## Solutions

### Solution 1: Resolve Sync Conflict in App

1. Open the IMS mobile app and navigate to **Settings > Sync Status**.
2. If a conflict is listed, tap on it to view the conflicting records.
3. The app will show the local version and the server version side by side.
4. Select which version to keep (local or server) for each conflict.
5. After resolving all conflicts, tap **Sync Now** to resume the sync process.

### Solution 2: Log Out and Back In to Refresh Token

1. In the mobile app, go to **Settings > Account** and tap **Log Out**.
2. Log back in with your IMS credentials.
3. After login, the app will obtain a fresh authentication token.
4. Navigate to **Settings > Sync Status** and tap **Sync Now**.
5. The pending offline changes will now sync to the server.

### Solution 3: Remove or Compress Large Attachments

1. In the mobile app, go to **Settings > Sync Queue**.
2. Review the items in the queue. If a large attachment (e.g., a high-resolution photo) is at the head of the queue, tap it to see options.
3. Delete the attachment if it is not critical, or compress it using the **Compress** option if available.
4. Alternatively, remove the attachment from the record and re-add it after the remaining sync queue items have synced successfully.
5. After clearing the blocking item, tap **Sync Now**.

## Prevention

- Enable background app refresh for the IMS mobile app in your device settings so syncs happen automatically when connectivity is available, keeping the queue short.
- Configure a maximum attachment size limit for offline capture (e.g., 5 MB per photo) in **Admin > Mobile Settings > Offline Attachment Limit**.
- Train field users on how to check sync status and resolve conflicts — include this in mobile app onboarding materials.
`,
  },
  {
    id: 'KB-TS2-039',
    title: 'Language Switcher Not Changing Interface Language',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['troubleshooting', 'i18n', 'language', 'localisation'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Language Switcher Not Changing Interface Language

## Symptom

When a user selects a different language from the language switcher in the IMS interface, the interface does not change to the selected language. The page appears to reload or refresh but the text remains in the original language.

## Possible Causes

- The translation file for the selected language is missing from the application's localisation bundle — the language appears in the switcher but has no translations loaded
- The browser has a language override set that is taking precedence over the user's in-app language selection
- The language preference is not being saved to the user's profile — it defaults back to the organisation's default language on page reload
- A browser extension or corporate proxy is interfering with the localisation API call that loads the translation file

## Solutions

### Solution 1: Verify Translation File Exists

1. Contact your IMS administrator and report that selecting a specific language has no effect.
2. The administrator should navigate to **Admin > Localisation > Languages** and confirm the selected language shows a status of **Active** with a **Translation Coverage** percentage greater than 0%.
3. If the language is listed but has 0% coverage, the translation file has not been loaded. The administrator should import the translation file for that language.
4. If the language is not listed, it needs to be enabled and the translation file added.

### Solution 2: Clear Browser Language Override

1. In Chrome: navigate to Settings > Languages and ensure the language order places the preferred language at the top, or remove conflicting language entries.
2. In Firefox: navigate to Settings > General > Language and check if a browser language is overriding the page language.
3. Clear browser cookies and local storage for the IMS domain, as stale language preferences can be stored locally.
4. Reload the IMS page and try the language switcher again.

### Solution 3: Save Language Preference Explicitly

1. Navigate to **Profile > Preferences > Language**.
2. Select the desired language from the dropdown.
3. Click **Save Preferences** — do not just select the language and navigate away.
4. Log out and log back in.
5. The saved language preference will be loaded at login and persist across sessions.

## Prevention

- When launching support for a new language, run a smoke test by logging in with a test account and switching to that language, verifying that key interface elements have translated correctly.
- Display a coverage indicator on the language switcher (e.g., 95% translated) so users know if a language is partially translated and may have some English fallback text.
- Ensure the language preference is stored server-side in the user profile rather than only in browser local storage, so it follows the user across devices.
`,
  },
  {
    id: 'KB-TS2-040',
    title: 'SSO Login Loop — Redirecting Indefinitely',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['troubleshooting', 'auth', 'sso', 'saml'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# SSO Login Loop — Redirecting Indefinitely

## Symptom

Users clicking the SSO login button are caught in an infinite redirect loop — they are sent to the identity provider (IdP) login page, authenticate successfully, and are then sent back to IMS which immediately redirects them back to the IdP again, repeating indefinitely without ever reaching the IMS dashboard.

## Possible Causes

- The SAML assertion attribute mapping is incorrect — IMS expects the email address in a specific attribute field (e.g., 'emailAddress') but the IdP is sending it in a different field (e.g., 'email' or 'upn')
- The browser is blocking the session cookie that IMS sets after SAML authentication — without the cookie, IMS cannot confirm the user is authenticated and redirects them again
- The IdP and IMS server clocks are out of sync (clock skew) — SAML assertions have a short validity window and if the clocks differ by more than a few minutes, IMS will reject the assertion as expired and initiate a new SSO flow
- The SAML Assertion Consumer Service (ACS) URL configured on the IdP does not match the URL IMS is expecting

## Solutions

### Solution 1: Fix Attribute Mapping

1. Navigate to **Admin > SSO Configuration > [IdP Name] > Attribute Mappings**.
2. Find the mapping for the Email attribute.
3. Verify the attribute name exactly matches what your IdP sends in the SAML assertion. Common IdP attribute names include: 'email', 'emailAddress', 'mail', 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'.
4. Update the mapping to match the IdP's attribute name and save.
5. Attempt SSO login again — the loop should resolve.

### Solution 2: Allow Third-Party Cookies for IMS Domain

1. In Chrome: navigate to Settings > Privacy and Security > Cookies and other site data.
2. Add the IMS domain to the **Sites that can always use cookies** list.
3. In Safari: navigate to Preferences > Privacy and set **Prevent cross-site tracking** to allow cookies for the IMS domain.
4. Clear existing cookies for the IMS domain and retry SSO login.
5. For corporate environments where browser policy controls cookies, request an IT policy exception for the IMS domain.

### Solution 3: Align IdP and SP Clocks

1. Ask your IdP administrator to verify that the IdP server time is synchronised to a reliable NTP source.
2. Similarly, verify the IMS application server time is NTP synchronised (**Admin > System > Server Status > Server Time**).
3. If clock skew exists, work with server operations to correct it.
4. As a temporary measure, increase the SAML assertion clock skew tolerance in **Admin > SSO Configuration > Advanced > Clock Skew Tolerance** from the default 5 minutes to 10 minutes.

### Solution 4: Verify ACS URL

1. In **Admin > SSO Configuration > [IdP Name]**, copy the **ACS URL** displayed.
2. Log in to your IdP admin console and verify the configured ACS URL for the IMS application matches exactly.
3. Correct any mismatch in the IdP configuration.
4. After saving on the IdP side, test SSO login.

## Prevention

- Test SSO configuration in a staging environment before deploying changes to production.
- Document the exact SAML attribute names used by your IdP and store them in the SSO configuration notes field for reference during future troubleshooting.
- Monitor SSO login success rates with the **Authentication Report** (**Admin > Reports > Authentication**) so redirect loop issues are detected quickly if they recur.
`,
  },
];
