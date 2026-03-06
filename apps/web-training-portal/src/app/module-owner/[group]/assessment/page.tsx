'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

type Question = {
  q: string;
  options: [string, string, string, string];
  answer: 0 | 1 | 2 | 3;
};

// ── Quality & NC (Day A) ──────────────────────────────────────────────────────
const QUALITY_NC_QUESTIONS: Question[] = [
  { q: 'In Nexara IMS, what is the correct reference number format for a non-conformance record raised in 2026?', options: ['NC-001-2026', 'QMS-NC-2026-001', 'QUALITY-NC-2026-001', 'IMS/NC/2026/001'], answer: 1 },
  { q: 'A dimensional defect is found during final inspection on a batch of machined components produced entirely in-house. Which NC category is correct?', options: ['Supplier', 'System', 'Product', 'Process'], answer: 2 },
  { q: 'Which NC severity level should be assigned when a non-conformance has caused an actual impact on product safety or regulatory compliance?', options: ['Minor', 'Moderate', 'Major', 'Critical'], answer: 3 },
  { q: 'Under ISO 9001:2015 clause 7.5, which of the following is a control requirement for documented information?', options: ['All documents must be printed and signed by a director', 'Documents must be available, protected, and managed for changes', 'Documents must be stored in a certified DMS', 'All versions must be sent to the certification body on update'], answer: 1 },
  { q: 'An NC is raised because the assembly sequence procedure was not followed, resulting in a subassembly defect. Which NC category applies?', options: ['Product', 'Process', 'System', 'Supplier'], answer: 1 },
  { q: 'The `detectionPoint` field on an NC record captures which information?', options: ['The root cause of the non-conformance', 'Who approved the NC investigation', 'The stage in the value chain where the NC was first identified', 'The date the NC was reported to the customer'], answer: 2 },
  { q: 'A containment action on an NC record should describe:', options: ['The root cause analysis method used', 'The corrective action that prevents recurrence', 'The immediate steps taken to control and isolate the non-conformance', 'The verification that the non-conformance has been resolved'], answer: 2 },
  { q: 'What prevents an NC from being closed before the corrective action is proven effective?', options: ['A manual checklist the quality manager must complete', 'A system constraint — the linked CAPA must have status Effective or Closed', 'An approval from SUPER_ADMIN is required', 'The NC status field is locked until 30 days have elapsed'], answer: 1 },
  { q: 'Which root cause category applies when an NC occurred because a calibration procedure for a measurement instrument did not exist?', options: ['Human error', 'Equipment failure', 'Inadequate procedure', 'Environmental factor'], answer: 2 },
  { q: 'A CAPA should be created:', options: ['As a standalone record; NC and CAPA are separate processes', 'From within the NC record using Actions → Create CAPA, to establish the parent-child relationship', 'By the Nexara administrator after the quality manager submits a request', 'Only when the NC is classified as Major or Critical'], answer: 1 },
  { q: 'The CAPA effectiveness review date should be set to:', options: ['The same date as the NC due date', '30 days after the CAPA is created', 'A date after all corrective actions are expected to be implemented, allowing time to verify effectiveness', 'The date of the next management review meeting'], answer: 2 },
  { q: 'A CAPA has status "Ineffective" after the effectiveness review. What is the correct next step?', options: ['Close the NC and document the ineffective CAPA', 'Escalate to SUPER_ADMIN for system deletion', 'Raise a new CAPA with a revised root cause analysis', 'Change the CAPA status to Effective and add a note'], answer: 2 },
  { q: 'Under ISO 9001:2015 clause 10.2, which evidence combination is required?', options: ['NC record only for Minor NCs', 'NC + investigation + root cause + corrective action + effectiveness evidence', 'CAPA record only — NC records are optional', 'NC record + customer approval of the corrective action'], answer: 1 },
  { q: 'The Nexara Quality dashboard shows a Repeat NC Rate of 18%. What does this indicate?', options: ['18% of NCs were raised in error', '18% of NCs raised in the period are categorised as repeats — same root cause, same process area, within 12 months', '18% of NCs were not assigned within the SLA', '18% of NCs are still open beyond their due date'], answer: 1 },
  { q: 'Which KPI most directly measures the efficiency of the corrective action process?', options: ['NC Open Rate', 'Repeat NC Rate', 'CAPA Effectiveness Rate', 'Average Days to Close'], answer: 2 },
  { q: 'A quality manager wants to see all open Supplier NCs that are overdue. Which action achieves this?', options: ['Export the full NC list and filter in Excel', 'Apply filters: Category = Supplier, Status = Open, Due Date = Past in the NC list view', 'Contact Nexara admin to run a custom query', 'Generate an ISO evidence package filtered by Supplier category'], answer: 1 },
  { q: 'In the document version scheme, what does upgrading from v1.3 to v2.0 indicate?', options: ['A minor editorial correction', 'Addition of a new optional section', 'A significant scope change requiring full re-approval', 'The document was superseded and archived'], answer: 2 },
  { q: 'A non-conformance arising from a supplier failing to meet contractual material specifications maps to which ISO 9001:2015 clause?', options: ['8.7 — Control of nonconforming outputs', '8.4 — Control of externally provided processes, products and services', '10.2 — Nonconformity and corrective action', '9.1.3 — Analysis and evaluation'], answer: 1 },
  { q: 'When generating an ISO 9001 evidence package in Nexara, what does the evidence index contain?', options: ['A list of all system users and permission levels', 'A clause-mapped list of records grouped by ISO 9001:2015 requirement with links to each record', 'A summary of audit findings from the current year', 'The complete text of the ISO 9001:2015 standard with annotations'], answer: 1 },
  { q: 'To prove ISO 9001 clause 7.5 (Document Control) compliance, which Nexara output is most appropriate?', options: ['NC list report + CAPA list report', 'Document version history + approval workflow log + superseded document archive', 'KPI dashboard export + management review minutes', 'Training records + competency matrix'], answer: 1 },
];

// ── HSE (Day B) ──────────────────────────────────────────────────────────────
const HSE_QUESTIONS: Question[] = [
  { q: 'A worker trips on a trailing cable, stumbles, and catches themselves without injury. This event should be recorded as:', options: ['An Incident (MINOR)', 'A Near Miss', 'An Observation', 'No record is required'], answer: 1 },
  { q: 'The `dateOccurred` field on an incident record should contain:', options: ['The date the investigation was completed', 'The date the incident was first reported', 'The date and time the incident actually occurred', 'The date the regulatory notification was submitted'], answer: 2 },
  { q: 'A contractor is hospitalised for 6 hours with a suspected spinal injury. They return to modified duties after 4 weeks. Which severity?', options: ['MODERATE', 'MAJOR', 'CRITICAL', 'CATASTROPHIC'], answer: 2 },
  { q: 'Which of the following metrics is a leading indicator of HSE performance?', options: ['Lost Time Incident Rate (LTIR)', 'Total Recordable Incident Rate (TRIR)', 'Near miss frequency rate', 'Number of fatalities in the period'], answer: 2 },
  { q: 'TRIR is calculated using which formula?', options: ['(incidents × 1,000) ÷ hours worked', '(incidents × 200,000) ÷ hours worked', '(LTIs × 200,000) ÷ employees × 12', '(fatalities + LTIs) ÷ hours worked × 100,000'], answer: 1 },
  { q: 'When must the `regulatoryReportable` flag be set?', options: ['All incidents must be flagged', 'Only for external contractor incidents', 'When the incident meets mandatory regulatory notification thresholds (e.g. RIDDOR)', 'Only when a fatality has occurred'], answer: 2 },
  { q: 'In the Nexara legal register, which compliance status is used when actively working toward compliance?', options: ['COMPLIANT', 'AT_RISK', 'NON_COMPLIANT', 'PENDING_REVIEW'], answer: 1 },
  { q: 'The review date on a legal register obligation triggers:', options: ['Automatic revocation if no action taken', 'An email reminder to the owner to confirm the regulation has changed and update the status', 'A formal internal audit of compliance', 'Escalation to SUPER_ADMIN'], answer: 1 },
  { q: 'Under ISO 14001:2015, which of the following best describes an environmental "aspect"?', options: ['The negative change in the environment', 'An element of the organisation\'s activities that can interact with the environment', 'A legal obligation relating to environmental performance', 'A target for reducing environmental footprint'], answer: 1 },
  { q: 'Using the Nexara significance formula, an aspect scores: severity=4, probability=4, duration=3, extent=2, reversibility=3, regulatory=4, stakeholder=3. What is the score?', options: ['23', '27', '31', '33'], answer: 1 },
  { q: 'An environmental aspect with a significance score of 12 requires:', options: ['An environmental objective and target', 'Operational controls and emergency procedures', 'Both A and B', 'Neither — score < 15 means not significant'], answer: 3 },
  { q: 'Which work activity does NOT typically require a Permit to Work?', options: ['Confined space entry', 'Roof access (work at height)', 'Routine office cleaning', 'Hot work in a non-designated area'], answer: 2 },
  { q: 'A PTW approver has been on leave for 3 days. A permit is awaiting approval. The correct action is:', options: ['Allow the permit holder to proceed — the approver can sign retrospectively', 'Use Actions → Reassign Approval to delegate to a nominated substitute', 'Cancel and re-raise when the approver returns', 'Contact Nexara Support to override the chain'], answer: 1 },
  { q: 'A PTW has expired and no closure record has been submitted. The Live Permits Dashboard shows:', options: ['The permit is removed automatically', 'A red alert as an expired permit awaiting closure', 'The permit holder is locked out of the system', 'An automatic 24-hour extension is granted'], answer: 1 },
  { q: 'Fire extinguishers in Zone C have not been serviced for 18 months (requirement: annual). Finding classification:', options: ['Observation', 'Minor Non-Conformance', 'Major Non-Conformance', 'Catastrophic — immediate evacuation'], answer: 1 },
  { q: 'Which ISO 45001:2018 clause covers the requirement to investigate incidents and near misses?', options: ['Clause 6.1.2 — Hazard identification', 'Clause 8.1.3 — Management of change', 'Clause 10.2 — Incident, nonconformity and corrective action', 'Clause 9.1.1 — Monitoring, measurement, analysis'], answer: 2 },
  { q: 'Compliance evidence for a regulatory obligation should be:', options: ['The text of the regulation downloaded from the government website', 'The organisation\'s procedure implementing the regulation plus records of its application', 'A signed letter from the regulatory authority confirming compliance', 'A copy of the ISO 45001 certificate'], answer: 1 },
  { q: 'A significant environmental aspect requires which of the following?', options: ['Only an environmental objective and target', 'Only an operational control', 'At minimum one of: operational control, objective and target, or emergency procedure (depending on nature)', 'All three: objective AND operational control AND emergency procedure'], answer: 2 },
  { q: 'An organisation\'s LTIR for the current year is 3.4 vs last year\'s 2.1. The most appropriate response:', options: ['No action — LTIR fluctuates naturally', 'Conduct trend analysis: review types and causes of LTIs; identify common theme requiring systemic action', 'Immediately suspend all high-risk operations', 'Reduce the denominator by recording fewer hours worked'], answer: 1 },
  { q: 'An ISO 45001 auditor requests evidence of systematic hazard identification. Which Nexara output is most appropriate?', options: ['TRIR and LTIR dashboard export', 'List of all open incidents in the period', 'Environmental aspects register with significance scores', 'Risk assessment records from the H&S module, mapped to ISO 45001 clause 6.1.2'], answer: 3 },
];

// ── HR & Payroll (Day C) ──────────────────────────────────────────────────────
const HR_PAYROLL_QUESTIONS: Question[] = [
  { q: 'A new employee starts today. Which action in Nexara creates their master record?', options: ['Payroll → Pay Periods → New Employee', 'HR → Employees → New Employee', 'Training → Courses → Assign → New User', 'Settings → Users → Create User'], answer: 1 },
  { q: 'The `accessRevocationDate` field on a leaver record should be set to:', options: ['The day after the last working day', '30 days after the termination date', 'The last working day (same day)', 'The date of resignation'], answer: 2 },
  { q: 'Under UK GDPR, how long should employee records be retained after an employee leaves?', options: ['1 year', '3 years', '5 years', 'Employment duration plus 7 years'], answer: 3 },
  { q: 'A training course set to `validityPeriod = 12 months` means:', options: ['Course content must be updated every 12 months', 'A completion certificate is valid for 12 months; after expiry the employee needs a refresher', 'Employees must complete the course within 12 months of joining', 'The course is available in the library for 12 months only'], answer: 1 },
  { q: 'Which absence type should be used when an employee takes 2 days off following a bereavement?', options: ['Unpaid Leave', 'Sick Leave', 'Compassionate Leave', 'Annual Leave'], answer: 2 },
  { q: 'The compliance matrix report in Nexara Training shows a cell coloured red for an employee. This means:', options: ['The employee failed the course assessment', 'The course completion is overdue or the certificate has expired', 'The employee has been exempted from this course', 'The training provider has not uploaded the certificate yet'], answer: 1 },
  { q: 'A payroll period is Locked status. What can still be changed?', options: ['Gross pay adjustments and deductions', 'Period start and end dates', 'Nothing — Lock prevents all modifications until unlocked by a payroll admin', 'Journal export format only'], answer: 2 },
  { q: 'A payroll admin has entered 20 hours overtime for someone who worked a 4-day week. Correct response before approving:', options: ['Approve immediately — the admin is trusted', 'Review the timesheet or manager-approved overtime record to verify the 20 hours', 'Request the employee self-report through the portal', 'Escalate to SUPER_ADMIN before approving any overtime above 15 hours'], answer: 1 },
  { q: 'The Payroll Variance Report shows a 22% increase in total gross pay vs the previous period. Correct action:', options: ['Export the journal immediately — variances are normal', 'Investigate: identify which employees or adjustment types caused the increase; obtain explanations before exporting', 'Lock and reverse the payroll period', 'Notify the HR director and suspend all payroll processing'], answer: 1 },
  { q: 'For ISO 9001 clause 7.2 (Competence), which report provides the most direct compliance evidence?', options: ['The payroll variance report for the audit period', 'The training compliance matrix filtered by role-mandatory courses', 'The employee headcount trend report', 'The HR analytics absence rate dashboard'], answer: 1 },
  { q: 'An employee bulk-assigned to Fire Safety training has not completed by deadline. Who receives an escalation notification?', options: ['SUPER_ADMIN only', 'The HR Manager and the employee\'s Line Manager', 'The employee only', 'The training provider'], answer: 1 },
  { q: 'A contractor whose assignment ends on 31 March should have their access revoked:', options: ['30 days before 31 March', 'On 31 March', 'On 1 April', 'Only after they return equipment'], answer: 1 },
  { q: 'The journal export file from Nexara Payroll is used to:', options: ['Send payslips to employees', 'Generate payroll statutory returns (P60, P11D)', 'Import payroll entries into the finance system\'s chart of accounts', 'Reconcile holiday pay against HMRC minimum wage'], answer: 2 },
  { q: 'A payroll correction is needed after the period has been marked as Paid. The correct approach:', options: ['Modify the Paid period record directly', 'Create a correction adjustment in the following payroll period, referencing the original period', 'Contact Nexara Support to unlock the Paid period', 'Issue a manual cheque outside the system'], answer: 1 },
  { q: 'Mandatory training completion records should include which minimum set?', options: ['Employee name and course title only', 'Employee name, course title, completion date, result, and certificate where applicable', 'Employee name, course title, and the trainer\'s signature', 'Employee name, course title, and the delivery date only'], answer: 1 },
  { q: 'A line manager asks to see an employee\'s salary information. Under standard Nexara RBAC:', options: ['Yes — line managers can see all info for direct reports', 'No — salary and payroll data is restricted to HR Admin and Payroll roles by default', 'Yes, if they have HR_VIEWER permission', 'Only with SUPER_ADMIN approval'], answer: 1 },
  { q: 'A return-to-work interview should be recorded in Nexara:', options: ['Before the employee returns, by the HR manager', 'Immediately after the employee returns from a sick absence, documenting fitness and adjustments', 'Only for absences lasting more than 10 days', 'By the payroll team to confirm sick pay calculations'], answer: 1 },
  { q: 'A training course marked as `courseType = Regulatory` indicates:', options: ['The course is delivered by a regulatory body', 'Completion is required by law or a regulatory authority', 'The course content is approved by a certification body', 'The course is only for compliance and legal team members'], answer: 1 },
  { q: 'Which report identifies all employees whose Moving and Handling certificates expire within the next 60 days?', options: ['HR → Employees → Filter by hire date', 'Training → Reports → Compliance Matrix → filter by course, sort by expiry date', 'Payroll → Reports → Variance Report', 'HR → Reports → Headcount Trend'], answer: 1 },
  { q: 'A benefit-in-kind (BIK) payroll adjustment must be recorded because:', options: ['It affects the employee\'s gross pay for pension calculation', 'It is taxable; the system generates P11D data for HMRC reporting', 'It replaces the salary payment for that period', 'It is required only if BIK value exceeds £1,000'], answer: 1 },
];

// ── Finance & Contracts (Day D) ───────────────────────────────────────────────
const FINANCE_CONTRACTS_QUESTIONS: Question[] = [
  { q: 'The correct reference number format for a purchase order raised in 2026 is:', options: ['PO-2026-001', 'FIN-PO-2026-001', 'PURCHASE-ORDER-2026-001', 'ORD/2026/001'], answer: 1 },
  { q: 'In a 3-way match for invoice approval, which three documents must agree?', options: ['Invoice, bank statement, and supplier contract', 'Purchase order, delivery note, and invoice', 'Invoice, expense claim, and budget entry', 'Contract, milestone record, and invoice'], answer: 1 },
  { q: 'A budget vs actual report shows 23% overspend on a cost centre. The dashboard indicator colour is:', options: ['Green', 'Amber', 'Red', 'Blue'], answer: 2 },
  { q: 'A payment was made in USD but the organisation\'s base currency is GBP. What does the Finance module record?', options: ['Only the USD amount — base currency conversion is done manually', 'Both the USD transaction amount and the GBP equivalent at the applicable exchange rate', 'Only the GBP equivalent — foreign currency is not retained', 'An error — multi-currency transactions require admin configuration'], answer: 1 },
  { q: 'The AP (Accounts Payable) ageing report groups unpaid invoices into time bands. Which band is most urgent?', options: ['0–30 days', '31–60 days', '61–90 days', '90+ days overdue'], answer: 3 },
  { q: 'A contract moves from Draft to Under Review. What has triggered this status change?', options: ['The contract end date has been set', 'The contract has been submitted for legal review via the approval workflow', 'The counterparty has signed the contract', 'The contract value has been approved by the finance director'], answer: 1 },
  { q: 'The default renewal alert lead time in Nexara Contracts is:', options: ['30 days', '60 days', '90 days', '180 days'], answer: 2 },
  { q: 'An amendment to a contract is uploaded in Nexara. What happens to the original contract document?', options: ['It is deleted from the system', 'It is archived and accessible via the document version history', 'It is sent to the counterparty for acknowledgement', 'It remains as the active version until the amendment is approved'], answer: 1 },
  { q: 'A contractual obligation (e.g. quarterly performance report delivery) should be recorded in Nexara as:', options: ['A contract milestone only', 'An obligation record linked to the contract, with a due date and assigned owner', 'A separate CAPA record', 'A note in the contract description field'], answer: 1 },
  { q: 'A contract is terminated due to counterparty breach. What must be documented in Nexara?', options: ['Nothing — terminated contracts are removed from the system', 'Termination reason, effective date, termination notice document, and any post-termination obligations', 'Only the termination effective date', 'A regulatory notification — all contract terminations require regulatory reporting'], answer: 1 },
  { q: 'A supplier evaluation using the Nexara scorecard produces a weighted score of 3.6. What is the qualification status?', options: ['PREFERRED (4.0–5.0)', 'APPROVED (3.0–3.9)', 'CONDITIONAL (2.0–2.9)', 'DISQUALIFIED (<2.0)'], answer: 1 },
  { q: 'The Nexara supplier scorecard weights Quality at 25% and HSE performance at 15%. A supplier scores Quality=4, HSE=2. What is the combined contribution from these two criteria?', options: ['0.6 out of 1.6', '1.0 + 0.3 = 1.3', '1.3 out of 4.0', 'Cannot be calculated without all criteria scores'], answer: 1 },
  { q: 'Changing a supplier\'s qualification status from APPROVED to CONDITIONAL requires:', options: ['No approval — any user with supplier access can change status', 'A justification entry and approval workflow if downgrading', 'A SUPER_ADMIN override', 'A new scorecard evaluation to be completed first'], answer: 1 },
  { q: 'A supplier provides 35% of your organisation\'s total annual spend. This triggers which supply chain risk flag?', options: ['Financial Risk', 'Geopolitical Risk', 'Single-Source Risk (>30% spend concentration)', 'Compliance Risk'], answer: 2 },
  { q: 'The Preferred Supplier List report should be reviewed:', options: ['Monthly', 'Quarterly', 'Annually at minimum', 'Only when a new contract is being awarded'], answer: 2 },
  { q: 'A finance manager needs to prove to auditors that all expenditure over £10,000 had two-level approval. The best Nexara evidence is:', options: ['The budget vs actual report for the period', 'The finance approval workflow audit trail, filtered by amount > £10,000', 'A summary spreadsheet exported from the finance system', 'The journal export file for the relevant accounting period'], answer: 1 },
  { q: 'Which contract lifecycle status indicates the contract has passed its end date with no renewal?', options: ['Active', 'Expiring', 'Expired', 'Terminated'], answer: 2 },
  { q: 'A budget transfer (moving budget from one cost centre to another) in Nexara requires:', options: ['No documentation — budget transfers are internal bookkeeping', 'An adjustment record with both source and destination cost centres, an approved amount, and justification', 'A new budget entry for the receiving cost centre only', 'SUPER_ADMIN approval regardless of amount'], answer: 1 },
  { q: 'The contract expiry pipeline report for the next 90 days shows 12 contracts. What should the contract manager do first?', options: ['Renew all 12 immediately', 'Prioritise by contract value — highest value first, regardless of expiry proximity', 'Review each contract: identify which require active renewal decision vs auto-renew vs allow to expire', 'Contact all 12 counterparties on the same day'], answer: 2 },
  { q: 'Under ISO 37001 (Anti-Bribery), which Nexara feature most directly supports due diligence on business partners?', options: ['Budget vs actual reports', 'Supplier qualification status and scorecard evaluation records', 'Payroll journal exports', 'Management review output actions'], answer: 1 },
];

// ── Advanced — Audits, CAPA & MR (Day E) ─────────────────────────────────────
const ADVANCED_QUESTIONS: Question[] = [
  { q: 'What is the primary purpose of an annual audit programme in Nexara?', options: ['To satisfy a single ISO audit requirement per year', 'To provide a risk-based, planned schedule of all audits for the year, with scope and resources allocated', 'To record the results of external certification audits only', 'To generate a list of all findings from the previous year'], answer: 1 },
  { q: 'An audit finding is classified as a Major NC. This indicates:', options: ['A single isolated minor failure in a procedure', 'A systemic failure or situation that directly threatens certification or involves a complete absence of a required system element', 'A positive observation worthy of recognition', 'A low-risk opportunity for improvement'], answer: 1 },
  { q: 'The opening meeting record in Nexara should document:', options: ['Only the names of the auditors and auditees', 'Date, attendees, scope confirmed, audit plan agreed, and any initial observations', 'The audit findings generated during the opening meeting', 'The previous audit results for comparison'], answer: 1 },
  { q: 'During audit sampling, an auditor reviews 10 risk records and finds 1 missing mandatory field. This is most likely classified as:', options: ['Conformance — 9 out of 10 is acceptable', 'Observation — potential for improvement, not systemic', 'Minor NC — a requirement is not met but the failure is isolated', 'Major NC — requires immediate management action'], answer: 2 },
  { q: 'An OFI (Opportunity for Improvement) in an audit finding indicates:', options: ['A non-compliance with a requirement', 'A positive recommendation for improvement where no requirement is currently being violated', 'A finding requiring corrective action within 30 days', 'Evidence of a systemic management system failure'], answer: 1 },
  { q: 'The 5-Why root cause analysis technique in Nexara requires:', options: ['Exactly 5 iterations in all cases', 'At least 5 levels of questioning before "root cause confirmed" status can be set', 'A maximum of 3 levels for Minor NC investigations', 'External facilitator sign-off before submission'], answer: 1 },
  { q: 'A fishbone (Ishikawa) diagram organises potential causes into which six categories?', options: ['People, Process, Product, Policy, Performance, Planet', 'Man, Machine, Method, Material, Measurement, Environment', 'Human, Technical, Procedural, Managerial, Environmental, Supplier', 'Input, Output, Control, Mechanism, Feedback, Resource'], answer: 1 },
  { q: 'A fault tree analysis uses what type of logic to structure causes?', options: ['Sequential logic — causes are arranged in the order they occurred', 'Boolean logic (AND/OR gates) — combinations of causes that lead to a top-level event', 'Probabilistic logic — causes are ranked by likelihood', 'Hierarchical logic — causes are ranked by organisational level'], answer: 1 },
  { q: 'Under ISO 9001 clause 10.2, the evidence package for a completed CAPA must include:', options: ['A list of corrective actions only', 'Nature of the NC, actions taken, and the result of the corrective action (effectiveness)', 'The names of all staff involved in the investigation', 'A sign-off from the certification body'], answer: 1 },
  { q: 'A CAPA effectiveness review returns a result of "Partially Effective". The correct next step is:', options: ['Mark the CAPA as Effective — partial effectiveness is sufficient', 'Raise a new CAPA for the remaining gaps; close the original CAPA', 'Reopen the original NC and start the investigation from scratch', 'Escalate to SUPER_ADMIN for system review'], answer: 1 },
  { q: 'The Management Review input compiler in Nexara pulls data from:', options: ['The Quality module only', 'All active modules — quality KPIs, HSE metrics, HR data, finance, audit findings, customer satisfaction, risk register', 'External reports uploaded by the management review secretary', 'The Nexara Support dashboard'], answer: 1 },
  { q: 'ISO 9001:2015 clause 9.3.2 specifies which inputs must be included in a management review?', options: ['Only the audit findings from the most recent internal audit', 'Status of actions from previous reviews, changes to external/internal issues, QMS performance data, resource adequacy, improvement opportunities', 'An agenda covering only the certification body\'s requirements', 'A financial summary and headcount report'], answer: 1 },
  { q: 'Management review output actions in Nexara differ from CAPA actions because:', options: ['Management review actions are operational; CAPAs are strategic', 'Management review actions are high-level strategic decisions assigned to senior managers; CAPAs address specific non-conformances', 'Management review actions cannot be tracked in the system', 'CAPA actions have a higher priority than management review actions'], answer: 1 },
  { q: 'The Repeat Findings Rate KPI measures:', options: ['The percentage of audit findings that repeat from one audit to the next', 'The number of audit findings raised per audit', 'The percentage of findings closed within 30 days', 'The total number of Major NCs in the audit programme'], answer: 0 },
  { q: 'An annual management review was last held 14 months ago. Under ISO 9001:2015, this represents:', options: ['No issue — the standard does not specify a frequency', 'A potential non-conformance — the standard requires management review at planned intervals (typically at least annually)', 'A Major NC — management review must occur every 6 months', 'An observation only — the management team decides frequency'], answer: 1 },
  { q: 'The ISO evidence package generated for a certification body from Nexara includes:', options: ['Only the audit findings report', 'Agenda, minutes, input data compilation, output action register, and attendance list — mapped to ISO clauses', 'A list of all system users and their access rights', 'The complete management system documentation archive'], answer: 1 },
  { q: 'An auditor finds that 4 of the last 8 audit findings relate to the same process area. This is most accurately described as:', options: ['Normal distribution — some areas will always have more findings', 'A systemic issue in that process area warranting a deep-dive investigation and root cause analysis', 'Evidence that the auditors are unfairly targeting one department', 'A data quality issue — the audit findings were incorrectly categorised'], answer: 1 },
  { q: 'For ISO 14001 clause 9.3 (Management Review), which input is specifically required?', options: ['The payroll variance report for the period', 'Environmental performance data including progress toward environmental objectives', 'A financial summary of environmental expenditure', 'The supplier scorecard results for environmental criteria'], answer: 1 },
  { q: 'A CAPA action has a due date of 30 days but no assigned owner. Under Nexara\'s SMART criteria enforcement:', options: ['The action is saved but flagged amber as incomplete', 'The action cannot be saved without an assigned owner (named user)', 'The system assigns the action to the CAPA lead automatically', 'The action is saved and the system sends a notification to all CAPA team members'], answer: 1 },
  { q: 'A management review is in "Inputs Compiled" status. What is the correct next status and action?', options: ['Complete — the compilation itself constitutes the review', 'In Review — the chair convenes the review meeting with all inputs available for discussion', 'Approved — the chair approves the input compilation before scheduling the meeting', 'Archived — inputs are compiled annually but reviewed only when certification is due'], answer: 1 },
];

// ── Config ────────────────────────────────────────────────────────────────────

const GROUP_CONFIG: Record<string, { title: string; questions: Question[]; time: number }> = {
  'quality-nc': { title: 'Quality & Non-Conformance', questions: QUALITY_NC_QUESTIONS, time: 30 * 60 },
  'hse':         { title: 'Health, Safety & Environment', questions: HSE_QUESTIONS, time: 30 * 60 },
  'hr-payroll':  { title: 'HR & Payroll', questions: HR_PAYROLL_QUESTIONS, time: 30 * 60 },
  'finance-contracts': { title: 'Finance & Contracts', questions: FINANCE_CONTRACTS_QUESTIONS, time: 30 * 60 },
  'advanced':    { title: 'Audits, CAPA & Management Review', questions: ADVANCED_QUESTIONS, time: 30 * 60 },
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function ModuleOwnerAssessment() {
  const { group } = useParams<{ group: string }>();
  const config = GROUP_CONFIG[group ?? ''];

  const [started, setStarted]   = useState(false);
  const [answers, setAnswers]   = useState<(number | null)[]>([]);
  const [submitted, setSubmit]  = useState(false);
  const [current, setCurrent]   = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (config) setAnswers(Array(config.questions.length).fill(null));
  }, [config]);

  useEffect(() => {
    if (!started || !config || submitted) return;
    setTimeLeft(config.time);
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(timer); setSubmit(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started]);

  if (!config) {
    return (
      <main className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Programme not found.</p>
          <Link href="/module-owner" className="text-[#B8860B] hover:text-[#D4A017]">← Back to Module Owner Programmes</Link>
        </div>
      </main>
    );
  }

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const score = submitted ? answers.filter((a, i) => a === config.questions[i].answer).length : 0;
  const pct = submitted ? Math.round((score / config.questions.length) * 100) : 0;
  const passed = submitted && pct >= 75;

  const handleAnswer = useCallback((idx: number) => {
    if (submitted) return;
    setAnswers((prev) => { const next = [...prev]; next[current] = idx; return next; });
  }, [current, submitted]);

  // Start screen
  if (!started) {
    return (
      <main className="min-h-screen p-6 max-w-2xl mx-auto flex flex-col items-center justify-center">
        <div className="bg-[#091628] border border-[#1E3A5F] rounded-2xl p-8 w-full">
          <div className="text-xs text-[#B8860B] font-semibold uppercase tracking-wider mb-2">Module Owner Assessment</div>
          <h1 className="text-2xl font-bold text-white mb-6">{config.title}</h1>
          <table className="w-full text-sm mb-6">
            <tbody>
              {[['Questions', '20'], ['Time limit', '30 minutes'], ['Pass threshold', '75% (15/20)'], ['Grade', 'Pass or Fail — no Distinction grade']].map(([l, v]) => (
                <tr key={l} className="border-b border-[#1E3A5F]/50">
                  <td className="py-2 text-slate-400 w-40">{l}</td>
                  <td className="py-2 text-white">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-sm text-amber-300 bg-amber-950/20 border border-amber-800 rounded-lg p-3 mb-6">
            Individual work only. Timer starts when you click Begin.
          </div>
          <button
            onClick={() => setStarted(true)}
            className="w-full bg-[#B8860B] text-white font-semibold py-3 rounded-lg hover:bg-[#D4A017] transition-colors"
          >
            Begin Assessment
          </button>
          <div className="text-center mt-4">
            <Link href={`/module-owner/${group}`} className="text-sm text-slate-500 hover:text-slate-300 transition-colors">← Back to Programme</Link>
          </div>
        </div>
      </main>
    );
  }

  // Results screen
  if (submitted) {
    return (
      <main className="min-h-screen p-6 max-w-2xl mx-auto">
        <div className="bg-[#091628] border border-[#1E3A5F] rounded-2xl p-8">
          <div className={`text-7xl font-bold mb-2 text-center ${passed ? 'text-green-400' : 'text-red-400'}`}>{pct}%</div>
          <div className="text-center mb-1">
            <span className={`text-xl font-semibold ${passed ? 'text-green-400' : 'text-red-400'}`}>
              {passed ? 'Pass' : 'Did Not Pass'}
            </span>
          </div>
          <div className="text-center text-slate-400 text-sm mb-4">{score}/{config.questions.length} correct</div>

          {passed && (
            <div className="bg-[#1E3A5F]/20 border border-[#1E3A5F] rounded-xl p-5 mb-4 text-center">
              <p className="text-sm text-white font-medium mb-1">Nexara Certified Module Owner</p>
              <p className="text-sm text-[#B8860B] font-semibold mb-3">{config.title}</p>
              <Link href="/certificate" className="inline-block bg-[#B8860B] text-white px-6 py-2.5 rounded-lg hover:bg-[#D4A017] transition-colors text-sm font-semibold">
                Download Certificate →
              </Link>
            </div>
          )}
          {!passed && (
            <div className="text-sm text-slate-400 bg-[#1E3A5F]/20 border border-[#1E3A5F] rounded-lg p-3 mb-4 text-center">
              Score of {pct}% is below the 75% pass threshold. A retake can be arranged at the next scheduled cohort.
            </div>
          )}

          <div className="mt-8 space-y-3">
            <h2 className="text-sm font-semibold text-[#B8860B] uppercase tracking-wider mb-4">Answer Review</h2>
            {config.questions.map((q, i) => {
              const correct = answers[i] === q.answer;
              return (
                <div key={i} className={`rounded-lg p-4 border ${correct ? 'border-green-800/60 bg-green-950/10' : 'border-red-800/60 bg-red-950/10'}`}>
                  <p className="text-sm text-white font-medium mb-2">{i + 1}. {q.q}</p>
                  <p className="text-xs text-green-400 mb-1">✓ Correct: {q.options[q.answer]}</p>
                  {!correct && <p className="text-xs text-red-400">✗ Your answer: {answers[i] !== null ? q.options[answers[i]!] : 'Not answered'}</p>}
                </div>
              );
            })}
          </div>

          <div className="mt-8 pt-6 border-t border-[#1E3A5F] flex justify-between">
            <Link href="/module-owner" className="text-sm text-slate-400 hover:text-white transition-colors">← All Programmes</Link>
            <Link href={`/module-owner/${group}`} className="text-sm text-[#B8860B] hover:text-[#D4A017] transition-colors">View Programme →</Link>
          </div>
        </div>
      </main>
    );
  }

  // Question screen
  const q = config.questions[current];
  const progress = Math.round(((current + 1) / config.questions.length) * 100);
  const answeredCount = answers.filter(a => a !== null).length;

  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-sm font-semibold text-slate-400">{config.title} — Assessment</h1>
          <div className="text-xs text-slate-500 mt-0.5">{answeredCount} of {config.questions.length} answered</div>
        </div>
        <div className={`text-sm font-mono px-3 py-1.5 rounded-lg border ${timeLeft < 120 ? 'border-red-600 bg-red-950/30 text-red-400' : 'border-[#1E3A5F] bg-[#091628] text-white'}`}>
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="h-1 bg-[#1E3A5F] rounded-full mb-6">
        <div className="h-1 bg-[#B8860B] rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      <div className="bg-[#091628] border border-[#1E3A5F] rounded-xl p-6 mb-4">
        <div className="text-xs text-slate-500 mb-3 font-medium">Question {current + 1} / {config.questions.length}</div>
        <p className="text-white font-medium text-base mb-6 leading-relaxed">{q.q}</p>
        <div className="space-y-2.5">
          {q.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm border transition-all ${
                answers[current] === i
                  ? 'border-[#B8860B] bg-[#B8860B]/10 text-white'
                  : 'border-[#1E3A5F] text-slate-300 hover:border-[#B8860B]/50 hover:bg-[#1E3A5F]/20'
              }`}
            >
              <span className="font-semibold mr-2 text-slate-500">{String.fromCharCode(65 + i)}.</span>{opt}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button onClick={() => setCurrent((c) => Math.max(0, c - 1))} disabled={current === 0}
          className="text-sm text-slate-400 hover:text-white transition-colors disabled:opacity-30">
          ← Previous
        </button>
        <span className="text-xs text-slate-600">{current + 1} / {config.questions.length}</span>
        {current < config.questions.length - 1 ? (
          <button onClick={() => setCurrent((c) => c + 1)}
            className="text-sm bg-[#B8860B] text-white px-4 py-2 rounded-lg hover:bg-[#D4A017] transition-colors">
            Next →
          </button>
        ) : (
          <button onClick={() => setSubmit(true)}
            className="text-sm bg-green-700 text-white px-5 py-2 rounded-lg hover:bg-green-600 transition-colors font-medium">
            Submit Assessment
          </button>
        )}
      </div>
    </main>
  );
}

