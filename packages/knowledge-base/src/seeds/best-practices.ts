import type { KBArticle } from '../types';

export const bestPracticesArticles: KBArticle[] = [
  {
    id: 'KB-BP-001',
    title: 'Best Practices for Risk Register Management',
    content: `## Overview
A well-managed risk register is a living tool that drives decisions — not a compliance exercise. Good practice ensures risks are specific, owned, and actively treated.

## Best Practices

### 1. Keep Risks Specific
Each risk entry should describe one specific event with one primary consequence. Avoid catch-all entries like 'IT failure' — instead: 'Unplanned outage of production ERP system causing >4h manufacturing stoppage'.

### 2. Assign a Single Accountable Owner
Risks owned by 'the team' or 'management' get neglected. Every risk must have one named individual accountable for monitoring and treatment.

### 3. Review on a Risk-Proportionate Cadence
High risks: monthly review. Medium risks: quarterly. Low risks: semi-annual. Set automated reminders in IMS so reviews don't slip.

### 4. Distinguish Inherent from Residual Risk
Record both the pre-control (inherent) and post-control (residual) risk rating. This demonstrates that controls are providing value.

### 5. Link Risks to Objectives They Threaten
Connecting risks to strategic or operational objectives makes the register relevant to leadership and management review.

### 6. Retire — Never Delete — Closed Risks
Archive treated risks with a closure date and reason. Deleting them loses institutional memory and historical trending.

### 7. Tag for Cross-Cutting Themes
Use tags like 'regulatory', 'climate', 'cyber', 'supply-chain' to enable cross-register analysis and themed reporting.

## Anti-Patterns to Avoid
- **Anti-pattern**: Reviewing the risk register only before an audit → **Better approach**: Schedule monthly risk reviews in IMS with automated reminders
- **Anti-pattern**: All risks rated 'Medium' regardless of actual severity → **Better approach**: Train risk owners on consistent likelihood and consequence scoring

## Metrics That Indicate Good Practice
- % high risks with an active treatment plan: target 100%
- % risks reviewed on schedule: target >90%
- Average age of untreated high risks: target <30 days

## Quick Wins
- Run a 'risk owner audit' — identify any risks assigned to departed employees and reassign immediately
- Add a mandatory annual risk review reminder to every risk on creation`,
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['best-practices', 'risk', 'risk-register'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
  },
  {
    id: 'KB-BP-002',
    title: 'Best Practices for Document Control',
    content: `## Overview
Effective document control prevents outdated procedures from being followed, ensures regulatory evidence is available, and reduces confusion about which version is current.

## Best Practices

### 1. One Document, One Owner
Every controlled document must have a single named owner responsible for accuracy and timely review. 'The quality team' is not an owner.

### 2. Consistent Naming and Numbering
Establish a format before you start (e.g. QMS-SOP-001) and apply it universally. Inconsistent naming makes search and retrieval unreliable.

### 3. Set Review Periods Proportional to Change Rate
SOPs in stable processes: 2-year review. SOPs in rapidly changing areas: 6-month review. Regulatory-mandated documents: per regulatory schedule.

### 4. Never Allow More Than One Live Version
The moment a new version is published, the previous version must be automatically archived. IMS enforces this — do not bypass it.

### 5. Publish Before Training
Always publish the approved document before running training on it. Training on a draft that later changes undermines competence records.

### 6. Retire Obsolete Documents Promptly
Superseded documents should be archived on the same day the new version is published. Notify holders to remove any local copies.

### 7. Maintain a Master List
Export the IMS document register monthly and review it. Spot documents approaching expiry and initiate reviews before they lapse.

## Anti-Patterns to Avoid
- **Anti-pattern**: Approving documents without reading them → **Better approach**: Enforce e-signature with re-authentication to signal genuine review
- **Anti-pattern**: Storing controlled documents in SharePoint alongside the IMS register → **Better approach**: IMS as the single source of truth; SharePoint as a read-only mirror at most

## Metrics That Indicate Good Practice
- % documents with current approved status: target >98%
- % document reviews completed before expiry: target >95%
- Average time from draft submission to published: target <14 days

## Quick Wins
- Run the 'Expiring Documents' report monthly and assign reviews 60 days before expiry
- Audit all documents without a review date set and add one`,
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['best-practices', 'document-control', 'quality'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
  },
  {
    id: 'KB-BP-003',
    title: 'Best Practices for Incident Investigation',
    content: `## Overview
The goal of incident investigation is to prevent recurrence, not to assign blame. Rigorous, timely investigation with genuine root cause analysis is the foundation of a learning organisation.

## Best Practices

### 1. Investigate Within 24 Hours
Evidence degrades quickly. Witness accounts change. Physical evidence is cleaned up. Initiate investigation the same day for serious incidents, within 24 hours for all others.

### 2. Involve Frontline Workers
The people closest to the work have the best understanding of what actually happened. An investigation conducted only by management misses critical contextual information.

### 3. Distinguish Immediate Cause from Root Cause
'Operator error' is rarely a root cause — it is an immediate cause. Ask why the error was possible: inadequate training? Poor procedure? Equipment design? That is the root cause.

### 4. Use a Structured Tool
5-Why and fishbone diagrams are built into IMS. Using a structured approach produces more consistent, auditable findings than narrative investigation alone.

### 5. Track Corrective Action Completion, Not Just Assignment
An incident is not closed until corrective actions are verified as implemented and effective. Assign due dates and escalate if overdue.

### 6. Share Learnings Across Sites
Use the IMS 'lessons learned' broadcast feature. An incident at one site that is preventable at others should be shared within 48 hours.

### 7. Analyse Trends Monthly
Monthly incident trend analysis (by type, location, severity, root cause category) surfaces systemic issues that individual investigations miss.

## Anti-Patterns to Avoid
- **Anti-pattern**: Closing incidents with 'retrained operator' as the corrective action → **Better approach**: Address the system that allowed the error to occur
- **Anti-pattern**: Recording near-misses as a paperwork burden → **Better approach**: Celebrate near-miss reporting as safety intelligence

## Metrics That Indicate Good Practice
- % serious incidents investigated within 24 hours: target >90%
- % corrective actions closed on time: target >80%
- Near-miss to injury ratio: target >10:1 (high near-miss reporting is a sign of a healthy safety culture)`,
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['best-practices', 'incidents', 'investigation', 'root-cause'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
  },
  {
    id: 'KB-BP-004',
    title: 'Best Practices for CAPA Management',
    content: `## Overview
Corrective and Preventive Action (CAPA) is the engine of continual improvement. A well-run CAPA system closes the loop from problem identification to verified prevention. A poorly run one is a bureaucratic black hole.

## Best Practices

### 1. Distinguish Correction from Corrective Action
A correction fixes this instance (e.g. scrap the defective batch). A corrective action fixes the system so it cannot recur (e.g. update inspection procedure). Both are needed; only the latter prevents recurrence.

### 2. Always Verify Effectiveness Before Closing
Define the effectiveness criteria at the time of planning — not after implementation. Check that the root cause has actually been eliminated, not just that the action was completed.

### 3. Set Realistic Due Dates
A CAPA due date of 'ASAP' is meaningless. Set specific dates based on complexity: simple process change — 30 days; system change requiring validation — 90 days.

### 4. Do Not Just Extend Due Dates
Repeatedly extending a CAPA due date without progress is a system failure. Escalate overdue CAPAs to the next management level instead.

### 5. Use Severity Tiering for Response Time
Critical nonconformance: CAPA initiated within 24 hours, closed within 30 days. Major NC: 5 days / 60 days. Minor NC: 30 days / 90 days.

### 6. Trend CAPA Sources
Monthly analysis of CAPAs by source (audit, complaint, incident, internal detection) reveals systemic weaknesses. If complaints are generating more CAPAs than internal detection, your quality controls are insufficient.

## Anti-Patterns to Avoid
- **Anti-pattern**: CAPA inflation — opening a CAPA for every trivial issue → **Better approach**: Use corrections for minor issues; reserve CAPAs for recurring or significant problems
- **Anti-pattern**: Closing CAPAs without effectiveness evidence → **Better approach**: Require objective evidence (re-audit results, monitoring data, complaint rate change) before closure

## Metrics That Indicate Good Practice
- CAPA on-time closure rate: target >85%
- % CAPAs with documented effectiveness verification: target 100%
- Average CAPA cycle time by severity tier`,
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['best-practices', 'capa', 'corrective-action', 'quality'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
  },
  {
    id: 'KB-BP-005',
    title: 'Best Practices for Internal Audit Programme Management',
    content: `## Overview
An internal audit programme that is risk-based, independent, and consistent in finding classification provides genuine assurance — not just a compliance checkbox.

## Best Practices

### 1. Risk-Based Audit Scheduling
Audit high-risk processes more frequently. An area that had a major nonconformance in the last cycle should be re-audited within 6 months. Stable, low-risk areas may be audited every 2 years.

### 2. Rotate Auditors
Familiarity breeds blindness. Auditors should not audit areas they manage. Rotate auditors annually to bring fresh perspectives.

### 3. Separate Findings from Recommendations
Record what was observed (the finding) and the applicable requirement. Avoid including your preferred corrective action — that is for the auditee to determine.

### 4. Grade Findings Consistently
Apply a defined grading scale: Observation (good practice improvement), Opportunity for Improvement (OFI), Minor Nonconformance (isolated departure from requirement), Major Nonconformance (systemic failure or absence of required element). Use IMS finding grades consistently.

### 5. Follow Up Previous Findings
The first agenda item of every audit should be: 'Status of findings from the last audit.' An unresolved finding is an escalating risk.

### 6. Brief Auditees in Advance
Send the audit plan and scope 2 weeks before the audit. Surprises generate defensiveness; preparation produces better evidence review.

### 7. Debrief Auditors After Each Audit
Capture lessons from each audit: what went well, what checklist questions were most productive, what were the auditors uncertain about. Use to improve the programme.

## Anti-Patterns to Avoid
- **Anti-pattern**: Audits that never find anything → **Better approach**: If your audit programme finds zero nonconformances, your audit criteria or auditor competence needs reviewing
- **Anti-pattern**: Auditing areas the lead auditor manages → **Better approach**: Strict independence — if necessary, bring in auditors from another site

## Metrics That Indicate Good Practice
- % audit programme completed on schedule: target >90%
- Average findings per audit-day (indicates audit effectiveness)
- % findings resolved within agreed timescale: target >90%`,
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['best-practices', 'audit', 'internal-audit'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
  },
  {
    id: 'KB-BP-006',
    title: 'Best Practices for Training Programme Management',
    content: `## Overview
Training compliance is not the same as competence. Best practice ensures that training is relevant, verified to be effective, and tracked with the rigour that regulatory and safety requirements demand.

## Best Practices

### 1. Link Training to Job Roles, Not Individuals
Define training requirements at the role level in IMS. Assigning training to individuals ad hoc creates gaps as people change roles and new starters join.

### 2. Verify Competence, Not Just Attendance
A training record should document that the person can do the task, not just that they sat in a room. Use assessments, practical observations, or tests — configured in IMS training items.

### 3. Set Re-Training Frequencies Thoughtfully
Regulatory minimum is a floor, not a target. High-risk tasks (confined space, working at height) warrant annual re-training regardless of regulatory requirement.

### 4. Track Training Effectiveness
Evaluate whether training is changing behaviour. Did quality defect rates fall after the quality training? Did near-miss reporting increase after safety awareness training?

### 5. Involve Line Managers in Competency Sign-Off
Line managers are best placed to assess on-the-job competence. Configure IMS to require manager sign-off on workplace competency assessments.

### 6. Automate Renewal Reminders
Set IMS reminders at 60 days, 30 days, and 7 days before expiry. Include the employee and their manager in the reminder.

### 7. Maintain Records for Required Retention Periods
Training records must be retained per regulatory requirements (commonly: duration of employment plus 5 years for safety-critical training). Configure IMS data retention accordingly.

## Anti-Patterns to Avoid
- **Anti-pattern**: Mass-enrolling everyone in every training regardless of relevance → **Better approach**: Role-based training matrix ensures relevance
- **Anti-pattern**: Recording training as complete with no assessment → **Better approach**: Every training item should have a defined competency verification method

## Metrics That Indicate Good Practice
- Training compliance rate by department: target >95%
- % training items with documented assessment method: target 100%
- Average time to full competency for new starters by role`,
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['best-practices', 'training', 'competency', 'learning'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
  },
  {
    id: 'KB-BP-007',
    title: 'Best Practices for Supplier Management',
    content: `## Overview
Supplier failures cause production disruptions, quality escapes, compliance exposures, and reputational damage. A structured supplier management programme converts supplier relationships from a liability into a competitive advantage.

## Best Practices

### 1. Tier Suppliers by Criticality and Risk
Not all suppliers deserve the same management attention. Tier 1 (critical, high-risk): full audit cycle, monthly scorecard, dedicated contact. Tier 3 (low-value, low-risk): annual questionnaire, periodic certificate check.

### 2. Qualify Before the First PO
Onboarding a supplier before receiving the first purchase order is significantly easier than qualifying a supplier you are already dependent on. Set up IMS approval gates to prevent unqualified suppliers being used.

### 3. Communicate Scorecard Results
Share performance scorecard results with suppliers at least annually. Suppliers who do not know they are underperforming cannot improve.

### 4. Define Requalification Triggers
Document the events that require a supplier to be re-qualified: major quality failure, ownership change, significant financial event, loss of key certification, country risk change.

### 5. Monitor Certificate Expiry Proactively
Configure IMS to send alerts 90 days before a supplier's ISO certificate, Nadcap approval, or insurance policy expires. Do not wait for the expiry to discover the gap.

### 6. Maintain a Backup Supplier Plan for Critical Single-Source Items
Identify single-source critical components and document a qualification pathway for an alternative supplier. The time to identify an alternative is not during a shortage crisis.

## Anti-Patterns to Avoid
- **Anti-pattern**: Retaining suppliers on the ASL indefinitely regardless of performance → **Better approach**: Annual ASL review with documented removal of persistently underperforming suppliers
- **Anti-pattern**: Supplier audits as a social visit → **Better approach**: Structured audit against defined criteria with formal findings and corrective actions

## Metrics That Indicate Good Practice
- % critical suppliers with current qualification: target 100%
- Supplier on-time delivery (OTD) by tier
- Supplier quality acceptance rate (incoming inspection pass rate) by tier`,
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['best-practices', 'supplier', 'procurement', 'vendor-management'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
  },
  {
    id: 'KB-BP-008',
    title: 'Best Practices for Environmental Monitoring and Reporting',
    content: `## Overview
Credible environmental performance data requires disciplined monitoring, rigorous data management, and transparent reporting. Estimated or inconsistently collected data undermines trust and regulatory compliance.

## Best Practices

### 1. Align Monitoring Frequency to Regulatory Requirements and Significance
Environmental aspects rated as significant require more frequent monitoring. Legal discharge limits require monitoring at the regulatory-specified frequency as a minimum.

### 2. Calibrate Monitoring Equipment on Schedule
Uncalibrated equipment produces unreliable data. Link all monitoring instruments to IMS as assets with calibration schedules. Record calibration traceability for all measurements used in regulatory reporting.

### 3. Set Near-Limit Alerts
Configure IMS threshold alerts at 80% of a legal limit. Near-limit alerts give time to investigate and take corrective action before a legal exceedance occurs.

### 4. Capture Data at Source
Manual transcription of monitoring data introduces errors. Where possible, import data directly from monitoring systems or laboratory information management systems.

### 5. Report Scope 1, 2, and 3 Emissions Separately
Scope 1 (direct combustion), Scope 2 (purchased electricity), and Scope 3 (value chain) have different data sources, uncertainty levels, and reduction levers. Keep them distinct in IMS.

### 6. Compare Against a Baseline Year
Environmental performance only has meaning relative to a defined baseline. Set a base year in IMS and compare all subsequent years against it consistently.

### 7. Include Trend Analysis, Not Just Point-in-Time Data
A single monitoring result tells you the current state. A 24-month trend tells you whether you are improving, stable, or deteriorating — and whether corrective action is working.

## Anti-Patterns to Avoid
- **Anti-pattern**: Estimating environmental data without a documented methodology → **Better approach**: Document the estimation method, uncertainty range, and basis; use measured data wherever possible
- **Anti-pattern**: Collecting data only for regulatory reporting periods → **Better approach**: Continuous or regular monitoring enables early detection of problems

## Metrics That Indicate Good Practice
- % monitoring activities completed on schedule: target 100%
- Data completeness rate (% of expected monitoring data points received): target >98%
- Number of legal limit exceedances in the period: target 0`,
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['best-practices', 'environment', 'monitoring', 'iso-14001'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
  },
  {
    id: 'KB-BP-009',
    title: 'Best Practices for Management Review',
    content: `## Overview
Management review is the governance mechanism that ensures the IMS is achieving its intended outcomes and receiving the resources it needs. Done well, it drives strategic decisions. Done poorly, it is a compliance formality.

## Best Practices

### 1. Schedule Before the Fiscal Year-End
Management review decisions (objectives, resources, targets) need to inform planning and budgeting. Schedule the main review in Q3 so decisions can flow into the next year's operating plan.

### 2. Include All Required ISO Inputs
ISO 9001/14001/45001 specify minimum inputs. Generate the IMS management review report to auto-populate: audit results, customer feedback, KPIs, risk status, nonconformance trends, previous review actions, resource adequacy. Add nothing that is not needed; omit nothing that is required.

### 3. Every Decision Must Generate a Documented Action
If the review identifies a need — more resources, a new objective, a process change — record it as an action in IMS with an owner and due date before the meeting ends.

### 4. Track Previous Review Actions
The first agenda item of every management review should be: status of actions from the last review. Outstanding actions with no progress should be escalated.

### 5. Involve the Right Level of Authority
Management review requires attendance by those with authority to allocate resources, change objectives, and make policy decisions. Without the right people, decisions cannot be made.

### 6. Distribute a Pre-Read Pack 1 Week Before
The meeting should be for discussion and decisions — not for presenters to read slides. Distribute the IMS management review report 7 days before the meeting.

## Anti-Patterns to Avoid
- **Anti-pattern**: Management review as a box-ticking event with no real decisions → **Better approach**: Agenda designed around decisions, not presentations
- **Anti-pattern**: Missing inputs (e.g. no customer feedback data) → **Better approach**: Assign data owners responsible for providing inputs on time

## Metrics That Indicate Good Practice
- % previous review actions completed by next review: target >85%
- Number of strategic decisions made per review: target ≥3
- Attendance by required decision-makers: target 100%`,
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['best-practices', 'management-review', 'iso-9001', 'governance'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
  },
  {
    id: 'KB-BP-010',
    title: 'Best Practices for Permit to Work',
    content: `## Overview
Permit to Work (PTW) is a formal safety management control for high-risk activities. Failures in PTW systems are a leading cause of fatal workplace accidents. Rigorous PTW practice saves lives.

## Best Practices

### 1. Never Start Work Without a Valid PTW in Hand
The permit is a physical (or digital) authority to proceed. Work must not start, and must stop immediately, if a permit is not present and valid. This is non-negotiable.

### 2. Conduct a Site Walk-Through Before Issuing
The authorised person must physically verify that isolations are in place, the work area is safe, and the conditions match the permit description before signing. Do not issue based on paperwork alone.

### 3. Verify Isolation Before Entry
For confined space or electrical work, verify that all energy sources are isolated and locked out before any person enters or begins work. Test before touch.

### 4. Set a Permit Expiry Time Realistic for the Task
A permit that expires before the work is complete creates pressure to rush or to informally continue without authority. Build in realistic time plus a contingency buffer.

### 5. Conduct a Toolbox Talk Referencing the Permit
Before work begins, brief all workers on the specific hazards, controls, and emergency procedures listed on the permit. Record attendance.

### 6. Close the Permit Formally on Completion
When work is complete, the competent person signs off completion, the authorised person signs closure, and the area is returned to normal service. Formally close in IMS.

### 7. Conduct Random PTW Compliance Audits
Spot-check in-progress high-risk work to verify permits are in place, conditions match the permit, and workers understand the hazards. Use audit findings to improve the system.

## Anti-Patterns to Avoid
- **Anti-pattern**: Pre-signing blank permits to save time → **Better approach**: Every permit must be completed and signed for the specific task at hand, in real time
- **Anti-pattern**: Bypassing PTW for 'quick jobs' → **Better approach**: The duration of the task is irrelevant; the hazard profile determines whether a permit is required

## Metrics That Indicate Good Practice
- % high-risk jobs with PTW raised before work start: target 100%
- % permits correctly closed on completion: target 100%
- PTW compliance audit score: target >95%`,
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['best-practices', 'permit-to-work', 'safety', 'hot-work', 'confined-space'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
  },
  {
    id: 'KB-BP-011',
    title: 'Best Practices for KPI and Dashboard Design',
    content: `## Overview
A KPI dashboard should drive decisions, not fill a screen. Effective metrics are leading indicators, not just historical scorecards. Best practice dashboard design makes the right information visible to the right people at the right time.

## Best Practices

### 1. Choose Leading Indicators, Not Just Lagging
Lagging indicators (injury rate, defect rate) tell you what happened. Leading indicators (near-miss reports, overdue risk treatments, overdue training) tell you what is about to happen. Design dashboards with both.

### 2. Limit Executive Dashboards to 5-7 KPIs
Information overload defeats the purpose. If everything is important, nothing is. A leadership dashboard should show the vital few metrics that require executive attention.

### 3. Always Show Trend, Not Just Current Value
A current CAPA count of 15 is meaningless without context. Is it rising or falling? Show 12-month trend lines alongside current values.

### 4. Set Targets Before Measuring
Reverse-engineering targets to match actual results is a form of self-deception. Define targets during planning; measure against them throughout the year.

### 5. Make the Data Source Transparent
For every KPI, document: what is being measured, how it is calculated, the data source, and the update frequency. Undocumented metrics cannot be trusted.

### 6. Update Dashboards on a Defined Cycle
Operational dashboards: daily or weekly. Management dashboards: monthly. Executive dashboards: monthly with a quarterly deep-dive. Inconsistent update frequency erodes trust.

### 7. Retire KPIs That Drive No Decisions
Review your KPI set annually. Any metric that has never generated a management decision or action in the past year is candidate for retirement. Replace it with something more actionable.

## Anti-Patterns to Avoid
- **Anti-pattern**: Tracking metrics because they are easy to collect, not because they matter → **Better approach**: Start with the decision you need to make; define the metric that informs it
- **Anti-pattern**: Changing KPI definitions mid-year to improve the numbers → **Better approach**: Lock definitions at the start of the year; document any required changes with rationale

## Metrics That Indicate Good Practice
- % KPIs with defined, documented targets: target 100%
- % dashboards updated on their declared cycle: target >95%
- % KPIs that generated at least one management action in the last quarter`,
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['best-practices', 'kpi', 'dashboard', 'reporting', 'metrics'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
  },
  {
    id: 'KB-BP-012',
    title: 'Best Practices for Complaint Management',
    content: `## Overview
Complaints are valuable intelligence about system failures and customer experience gaps. A well-run complaint management process recovers customer trust, prevents recurrence, and provides data for continual improvement.

## Best Practices

### 1. Acknowledge Within the Committed SLA
Even if the complaint is not yet resolved, the customer needs to know it has been received and is being acted upon. Silence generates escalation. IMS automates acknowledgement emails on complaint submission.

### 2. Classify Immediately on Receipt
Classify by type (product, service, delivery, billing, safety) and severity (low, medium, high, safety-critical) as soon as logged. Classification drives routing, investigation depth, and response timescale.

### 3. Investigate All Product Safety Complaints
Regardless of commercial relationship or complaint history, every complaint that could indicate a product safety issue must be fully investigated. No exceptions.

### 4. Communicate Resolution in Writing
A phone call resolving the complaint should be followed by a written confirmation of what was found and what was done. Written confirmation is evidence for regulatory audit and dispute resolution.

### 5. Identify Complaints Warranting a CAPA
A single complaint may be an anomaly. Three complaints of the same type in a quarter indicate a systemic problem that needs a CAPA, not just an apology.

### 6. Close the Loop with the Customer
Let customers know what systemic action was taken based on their complaint. Customers who see their feedback acted upon are more loyal than those who never complained.

### 7. Include Complaint Trends in Management Review
Volume, type, source, resolution time, and satisfaction rate should be reviewed at management review. Complaint data is a leading indicator of quality performance.

## Anti-Patterns to Avoid
- **Anti-pattern**: Handling complaints informally via email or phone, outside IMS → **Better approach**: All complaints logged in IMS from first contact, regardless of channel
- **Anti-pattern**: Closing complaints as 'resolved' without customer confirmation → **Better approach**: Require customer confirmation of satisfaction before closure, or document attempted contact

## Metrics That Indicate Good Practice
- Complaint acknowledgement within SLA: target >95%
- Customer satisfaction score after complaint resolution: target >70% satisfied
- % repeat complaints from the same root cause: target <5%`,
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['best-practices', 'complaints', 'customer-satisfaction', 'quality'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
  },
  {
    id: 'KB-BP-013',
    title: 'Best Practices for Access Control and User Management',
    content: `## Overview
Inappropriate access is one of the leading causes of data breaches and compliance failures. Disciplined access control protects data, enables auditability, and ensures accountability.

## Best Practices

### 1. Apply the Principle of Least Privilege
Every user should have the minimum access required to perform their job. Access should be justified and documented — not granted out of convenience.

### 2. Review Access Rights at Least Annually
People change roles, responsibilities evolve, and permissions accumulate. Conduct an annual access review: for every user, verify their current role matches their current permissions.

### 3. Remove Access on the Day of Departure
Access removal should be part of the offboarding checklist, triggered automatically or by HR notification. Do not rely on IT to notice a leaver.

### 4. Never Share User Accounts
Shared accounts destroy auditability. Every individual must have their own login. If a process requires system access, create a service account — not a shared user account.

### 5. Use Role-Based Access Rather Than Individual Permissions
Managing permissions at the role level scales far better than managing them per individual. When a role definition changes, all users with that role are updated simultaneously.

### 6. Enforce MFA for Privileged Accounts
All administrator accounts and accounts with access to sensitive data (HR, Finance, Health & Safety records) must have multi-factor authentication enforced.

### 7. Audit Privileged Actions
All admin actions (user creation, permission change, data deletion, configuration change) should be logged in the IMS audit trail. Review the audit trail monthly for anomalies.

## Anti-Patterns to Avoid
- **Anti-pattern**: Granting admin rights to avoid permission-related helpdesk tickets → **Better approach**: Properly configure role permissions to match job requirements; admin rights are for administrators only
- **Anti-pattern**: Not removing access for contractors and temporary workers → **Better approach**: Set expiry dates on all non-permanent accounts at creation

## Metrics That Indicate Good Practice
- % leavers with access removed on departure day: target 100%
- % admin and privileged accounts with MFA enabled: target 100%
- % annual access reviews completed: target 100%`,
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['best-practices', 'admin', 'rbac', 'security', 'access-control'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
  },
  {
    id: 'KB-BP-014',
    title: 'Best Practices for Data Quality Management',
    content: `## Overview
The value of any system is bounded by the quality of its data. Reports, dashboards, and AI insights built on poor data produce wrong decisions. Data quality must be designed in from the start.

## Best Practices

### 1. Define Quality Rules at Point of Entry
Validation rules, mandatory fields, and format constraints should be enforced when data is entered, not corrected after the fact. Configure IMS field validation for all critical fields.

### 2. Assign a Data Steward for Each Module
A data steward is responsible for the quality, completeness, and consistency of data in their module. This is distinct from the module administrator — it is an ongoing data governance responsibility.

### 3. Conduct Quarterly Data Quality Audits
Randomly sample 50 records per module and check completeness, accuracy, and consistency against the data quality rules. Report results and assign remediation actions.

### 4. Never Import Without a Test Run
Always run an import with a 10% sample and review validation errors before importing the full dataset. Importing 10,000 records and discovering a systematic error is far more disruptive than discovering it on 1,000.

### 5. Standardise Lookup Values
Free-text fields that should be lookups produce uncountable combinations. 'H&S', 'Health & Safety', 'Health and Safety', and 'HSE' are the same thing — but a report treats them as four. Use controlled lists.

### 6. De-Duplicate Proactively
Use the IMS duplicate detection feature at import and periodically run a duplicate check on supplier, customer, and employee records. Duplicates inflate counts and fragment history.

## Anti-Patterns to Avoid
- **Anti-pattern**: Importing poor-quality data from legacy systems 'to fix later' → **Better approach**: Clean the data in the source before migration; later rarely comes
- **Anti-pattern**: Changing field definitions mid-year without updating historical data → **Better approach**: Document field definition changes and assess impact on historical reporting

## Metrics That Indicate Good Practice
- Data completeness rate for mandatory fields per module: target >98%
- Duplicate rate across key entities (customers, suppliers, employees): target <0.5%
- % data quality audit findings remediated within 30 days: target >90%`,
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['best-practices', 'data-quality', 'governance', 'data'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
  },
  {
    id: 'KB-BP-015',
    title: 'Best Practices for Change Management (Organisational)',
    content: `## Overview
Technology implementations fail not because of technical problems but because of people problems. Effective change management accelerates adoption, reduces resistance, and protects the ROI of your IMS investment.

## Best Practices

### 1. Secure Executive Sponsorship Before Starting
An executive sponsor who actively champions the change, removes blockers, and communicates commitment is the single strongest predictor of successful adoption. Identify and brief your sponsor before any rollout.

### 2. Communicate the 'Why' Before the 'What'
People resist change when they do not understand its purpose. Communicate the business problem being solved and the expected benefits before explaining what is changing and how.

### 3. Identify Change Champions in Each Department
Change champions are respected peers who have been trained in the new system and advocate for it within their teams. They handle day-to-day questions and provide informal support that the implementation team cannot scale to.

### 4. Plan Training Before Go-Live
Training should be completed in the two weeks before go-live — close enough to be fresh, far enough out to address questions before they become live problems.

### 5. Create a Super-User Network
Super-users have deeper training than average users and are available for peer support. Recognise and reward this role; it reduces support burden on the implementation team significantly.

### 6. Measure Adoption
Define adoption metrics from day one: login rate, records created, features used, support tickets raised. Review adoption at 30, 60, and 90 days post go-live.

### 7. Collect and Act on Feedback
Survey users at 30 and 90 days. Address the top 3 issues in each survey. Demonstrating that feedback is acted upon builds trust and accelerates adoption.

## Anti-Patterns to Avoid
- **Anti-pattern**: Technical go-live without user engagement → **Better approach**: Change management activities start months before technical go-live
- **Anti-pattern**: Assuming training alone equals adoption → **Better approach**: Training creates capability; reinforcement, support, and incentives drive behaviour change

## Metrics That Indicate Good Practice
- System adoption rate (active users / total licensed users): target >80% at 90 days
- User satisfaction score at 90 days: target >70% satisfied
- Support ticket volume trend: should peak at go-live and decline month-on-month`,
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['best-practices', 'change-management', 'implementation', 'adoption'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
  },
  {
    id: 'KB-BP-016',
    title: 'Best Practices for Notification and Alert Management',
    content: `## Overview
Notifications are only valuable if users pay attention to them. Notification fatigue — where users ignore or suppress alerts because there are too many — is as dangerous as no notifications at all. Design your notification strategy deliberately.

## Best Practices

### 1. Send Notifications That Require Action
Every notification should either inform a decision or prompt an action. Purely informational notifications that require no response should be batched into digests, not sent individually.

### 2. Batch Non-Urgent Notifications into Digests
Configure daily or weekly digest emails for low-urgency notifications (upcoming renewals, scheduled report summaries). Reserve instant notifications for time-sensitive items (permit expiry, critical incident, overdue CAPA).

### 3. Personalise Notifications to Role
Safety officers should not receive finance system alerts. Finance managers should not receive H&S permit requests. Configure role-based notification routing in IMS to ensure relevance.

### 4. Build Escalation Rules for Overdue Items
If an action is not acknowledged within 24 hours, escalate to the owner's manager. If still unacknowledged after 48 hours, escalate to the department head. Escalation rules are configured in IMS Notifications.

### 5. Allow Users to Set Preferences
Within the boundaries you define, allow users to choose instant vs digest for non-critical notifications. User-controlled preferences increase compliance with the notifications that remain mandatory.

### 6. Test Notification Delivery After Configuration
After configuring SMTP or any notification change, send a test notification and verify delivery. Include a check in the monthly system health review.

### 7. Monitor Delivery Rates
Monitor notification delivery success rates in the IMS system health dashboard. A declining delivery rate may indicate SMTP issues, email throttling, or spam filtering — all of which need immediate investigation.

## Anti-Patterns to Avoid
- **Anti-pattern**: Notifying everyone for every event to 'keep people informed' → **Better approach**: Targeted, role-relevant notifications with clear action requirements
- **Anti-pattern**: No escalation rules — if the assignee ignores a notification, nothing happens → **Better approach**: Every time-sensitive notification must have an escalation path

## Metrics That Indicate Good Practice
- Notification delivery success rate: target >99%
- User notification opt-out rate: a high rate signals notification fatigue
- % overdue escalations reaching the next level within SLA: target >95%`,
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['best-practices', 'notifications', 'alerts', 'admin'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
  },
  {
    id: 'KB-BP-017',
    title: 'Best Practices for Workflow Design and Automation',
    content: `## Overview
Well-designed workflows reduce manual handoffs, enforce process consistency, and provide an audit trail. Poorly designed workflows create bottlenecks, frustration, and workarounds that undermine compliance.

## Best Practices

### 1. Map the Process on Paper First
Build the workflow in IMS only after the process has been agreed on paper. Changing a workflow after go-live is disruptive; changing it on a whiteboard is free.

### 2. Keep Workflows Simple
Workflows with more than 7 stages become difficult to track and manage. If a process genuinely has 10+ stages, split it into a parent workflow with sub-workflows.

### 3. Define Entry and Exit Criteria for Each Stage
What must be true for a record to enter a stage? What must be complete to exit it? Document these criteria and configure IMS field requirements to enforce them.

### 4. Build Escalation into Every Workflow
What happens if a stage stalls for 3 days? 7 days? Every workflow must have a defined escalation path — otherwise bottlenecks are invisible until they become crises.

### 5. Test with Real Users Before Rolling Out
Pilot the workflow with 3-5 real users from the affected team before releasing to all. They will find edge cases and usability issues that the configuration team missed.

### 6. Document the Workflow for Future Administrators
Configurations change. The person who built the workflow may leave. Document the workflow logic, escalation rules, and the business rationale behind each design decision.

### 7. Review Workflows Annually
Processes evolve. An annual review of active workflows identifies stages that are no longer necessary, approvers who have left, and conditions that no longer apply.

## Anti-Patterns to Avoid
- **Anti-pattern**: Automating a broken paper process → **Better approach**: Fix the process logic before automating it; automation makes bad processes faster, not better
- **Anti-pattern**: Workflows with no escalation or reminder → **Better approach**: Every stage must have a maximum duration and an escalation action

## Metrics That Indicate Good Practice
- Workflow completion rate vs abandonment rate: target <5% abandonment
- Average cycle time per workflow vs target
- % workflows reviewed in the last 12 months: target 100%`,
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['best-practices', 'workflows', 'automation', 'configuration'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
  },
  {
    id: 'KB-BP-018',
    title: 'Best Practices for Information Security Management in IMS',
    content: `## Overview
The IMS InfoSec module is only as valuable as the rigour of the processes it supports. Best practice information security management requires the module to be a living system connected to real security operations, not a static register.

## Best Practices

### 1. Treat the Asset Register and Risk Register as Living Systems
Update the information asset register whenever a new system, integration, or data flow is introduced. Re-assess risk whenever the threat landscape, asset, or control changes. Schedule quarterly reviews.

### 2. Link Vulnerability Findings to the Risk Register
When a vulnerability scan or penetration test identifies a finding, create a risk register entry linked to the finding. Track remediation as a risk treatment action with an owner and due date.

### 3. Test Your Incident Response Plan Annually
A tabletop exercise run through the IMS incident response module once a year identifies gaps in the plan before a real incident exposes them. Document the exercise findings and update the plan.

### 4. Monitor Threat Intel Feeds for Industry-Specific Threats
Use the IMS Threat Intelligence module to monitor for vulnerabilities and threat actor activity relevant to your sector and technology stack. Link relevant threats to your risk register.

### 5. Link Controls to ISO 27001 Annex A
For organisations maintaining ISO 27001 certification, link every risk treatment and control to the corresponding Annex A control. This produces a Statement of Applicability (SoA) directly from IMS.

### 6. Review Access Rights After Significant Change Events
After an acquisition, restructure, major system change, or significant leaver event, conduct an access rights review. Change events are the most common time for inappropriate access to persist undetected.

## Anti-Patterns to Avoid
- **Anti-pattern**: A static risk register last updated at certification → **Better approach**: Monthly risk register review cycle with an assigned risk register owner
- **Anti-pattern**: Security incidents investigated outside IMS → **Better approach**: All security incidents logged in IMS for consistent classification, investigation, and trend analysis

## Metrics That Indicate Good Practice
- % vulnerabilities remediated within defined SLA by severity
- MTTD (mean time to detect) security incidents
- MTTR (mean time to resolve) security incidents
- % Annex A controls with documented evidence: target 100% for in-scope controls`,
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['best-practices', 'infosec', 'security', 'iso-27001'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
  },
  {
    id: 'KB-BP-019',
    title: 'Best Practices for ESG Data Collection and Reporting',
    content: `## Overview
ESG reporting credibility depends entirely on data quality, methodology consistency, and transparency about limitations. Investors, regulators, and customers are increasingly sophisticated about distinguishing genuine ESG performance from greenwashing.

## Best Practices

### 1. Assign a Data Owner for Each ESG Metric
The ESG Manager cannot own all ESG data. Assign data ownership for each metric to the department with the closest operational relationship: energy data to Facilities, waste to Operations, training hours to HR, safety rates to HSE.

### 2. Define the Methodology Before Collecting Data
Document the calculation methodology, system boundary, emission factors (and their source), and any exclusions before the first data point is collected. Changes to methodology between periods require restatement of prior periods and disclosure.

### 3. Apply the GHG Protocol Hierarchy
For greenhouse gas emissions: measured data (from meters and instruments) > calculated data (from activity data multiplied by emission factors) > estimated data (from industry averages). Maximise the proportion of measured data and disclose the methodology split.

### 4. Collect Primary Data from Source Systems
Where possible, import environmental monitoring data, energy data, and HR data directly from source systems into IMS rather than collecting manually. Manual transcription introduces errors and delays.

### 5. Set Measurable Targets With Base Years
An ESG target without a base year is unverifiable. Define base year (typically 2019 or 2020), baseline value, target year, and target value. Enter these in the IMS ESG objectives module.

### 6. Seek Independent Assurance
Third-party limited or reasonable assurance on ESG data materially increases credibility with investors and regulators. Design data collection and documentation processes to support an assurance engagement from day one.

### 7. Disclose Limitations and Assumptions
Every ESG report should include a methodology note disclosing estimation approaches, data gaps, and significant assumptions. Transparency about limitations is a mark of credibility.

## Anti-Patterns to Avoid
- **Anti-pattern**: Collecting ESG data once a year in a spreadsheet scramble → **Better approach**: Continuous data collection through the year with quarterly reviews
- **Anti-pattern**: Inconsistent methodology between reporting periods making year-on-year comparison impossible → **Better approach**: Document and lock methodology at the start of each reporting period

## Metrics That Indicate Good Practice
- % ESG metrics collected from primary data sources: target >80%
- Data completeness rate for key ESG metrics: target >95%
- % ESG targets with defined base year, baseline, and target value: target 100%`,
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['best-practices', 'esg', 'sustainability', 'reporting'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
  },
  {
    id: 'KB-BP-020',
    title: 'Best Practices for System Administration and Governance',
    content: `## Overview
IMS system administration is not just a technical function — it is a governance function. Disciplined administration protects data integrity, ensures auditability, and maintains system performance over time.

## Best Practices

### 1. Document All Configuration Decisions
Every configuration choice (workflow design, notification rule, reference number format, field validation) should be documented with the business rationale. The person who configured it may leave; the documentation should not.

### 2. Create a Test Environment for Configuration Changes
Never test configuration changes directly in production. Use the IMS sandbox environment to test workflow changes, new field configurations, and integration updates before applying to live.

### 3. Maintain a Configuration Change Log
Every production configuration change should be logged: date, changed by, what was changed, why, and whether it was tested first. This log is essential for debugging unexpected behaviour.

### 4. Review System Health Weekly
Check the IMS System Health dashboard weekly: service status, database performance, failed jobs, notification delivery rate, storage utilisation. Do not wait for a user to report a problem.

### 5. Define and Test a Disaster Recovery Procedure Annually
Document the steps to restore IMS from backup. Test it. The first time you should discover a gap in your recovery procedure is not during a real incident.

### 6. Establish a Change Management Process for System Configuration
Treat significant configuration changes like software releases: change request, impact assessment, testing, approval, scheduled maintenance window, rollback plan. This prevents configuration drift and unintended consequences.

### 7. Communicate Maintenance Windows in Advance
Planned maintenance that takes IMS offline should be communicated at least 48 hours in advance to all users, with the expected duration and any user actions required. Use the IMS system broadcast function.

## Anti-Patterns to Avoid
- **Anti-pattern**: Making production configuration changes ad hoc without documentation → **Better approach**: Formal change request process for all production configuration changes
- **Anti-pattern**: No disaster recovery test — assuming backup works because backup jobs show success → **Better approach**: A backup job completing successfully proves data was written; only a restore test proves data can be recovered

## Metrics That Indicate Good Practice
- System uptime: target >99.9% (excluding planned maintenance)
- % configuration changes with documented rationale: target 100%
- Time to complete last DR restore test: compare against RTO target
- % system health dashboard alerts acknowledged within 4 hours: target 100%`,
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['best-practices', 'admin', 'governance', 'system-administration'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
  },
];
