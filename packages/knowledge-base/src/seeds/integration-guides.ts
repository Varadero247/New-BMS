import type { KBArticle } from '../types';

export const integrationGuideArticles: KBArticle[] = [
  {
    id: 'KB-IG-001',
    title: 'H&S ↔ Incidents Integration Guide',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['integration', 'health-safety', 'incidents'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# H&S ↔ Incidents Integration Guide

## Overview

The Health & Safety and Incidents modules share data bidirectionally, creating a seamless workflow from hazard identification through incident management and corrective action.

## How the Integration Works

**H&S → Incidents:** When a hazard is identified in the H&S risk register and assessed as high-risk, a potential incident report can be automatically generated in the Incidents module. This allows the incidents team to be informed proactively before an event occurs.

**Incidents → H&S:** When an incident is reported in the Incidents module, the incident data feeds back into the H&S risk register. The risk associated with the incident's location and activity type is automatically updated to reflect actual occurrence data, adjusting the probability weighting of that risk.

## Shared CAPA Workflow

Both modules contribute to a unified CAPA process. A CAPA raised from an H&S risk review or an incident investigation appears in both modules, ensuring consistent tracking and no duplication of action items.

## Joint Dashboard View

Administrators can enable a combined H&S and Incidents dashboard widget showing near-miss frequency rate, lost time injury frequency rate (LTIFR), and open risk counts in a single view.

## Configuration

Navigate to **Settings → Integrations → H&S-Incidents** and enable bidirectional sync. Select which H&S risk severity levels trigger automatic incident notifications.

## Common Use Cases

- Near-miss in H&S automatically creates an Incidents record for investigation
- Incident investigation identifies a new systemic hazard, which is added to the H&S risk register
- LTIFR data from Incidents informs H&S risk probability reassessment

## Data Flow

H&S hazard record → Incidents report → Root cause investigation → CAPA → H&S risk register update → Repeat risk review cycle.`,
  },
  {
    id: 'KB-IG-002',
    title: 'H&S ↔ CMMS Integration Guide',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['integration', 'health-safety', 'cmms', 'maintenance'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# H&S ↔ CMMS Integration Guide

## Overview

The Health & Safety and CMMS (Computerised Maintenance Management System) modules work together to ensure that equipment defects are addressed safely and that high-risk maintenance work is controlled through the Permit to Work system.

## How the Integration Works

**H&S → CMMS:** An equipment defect or safety-critical fault reported in the H&S hazard register automatically triggers a maintenance work order in CMMS. The work order inherits the H&S hazard reference number for full traceability.

**CMMS → H&S:** Work orders in CMMS that involve confined space entry, hot work, electrical isolation, or working at height automatically flag for Permit to Work (PTW) creation in the H&S module. The CMMS work order cannot be marked complete until the associated PTW is closed.

## Shared Asset Register

Both modules draw from the same asset register. Equipment records in CMMS display their associated H&S risk assessments, and H&S records reference the CMMS asset ID for full cross-module traceability.

## Configuration Steps

1. Navigate to **Settings → Integrations → H&S-CMMS**
2. Enable bidirectional sync
3. Configure which H&S hazard categories trigger CMMS work orders
4. Configure which CMMS work order types trigger PTW requirements
5. Map H&S hazard severity to CMMS work order priority levels

## Common Use Cases

- Safety-critical equipment defect in H&S → high-priority CMMS work order
- CMMS hot work scheduled → H&S PTW automatically created and routed for approval
- Equipment maintenance backlog visible in H&S dashboard as outstanding risk controls

## Data Flow

H&S hazard report → CMMS work order created → PTW triggered if required → Maintenance completed → PTW closed → H&S hazard closed → Risk register updated.`,
  },
  {
    id: 'KB-IG-003',
    title: 'H&S ↔ Training Integration Guide',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['integration', 'health-safety', 'training', 'competency'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# H&S ↔ Training Integration Guide

## Overview

The Health & Safety and Training modules are linked so that risk assessments directly drive training requirements, ensuring workers exposed to identified hazards have the competencies needed to work safely.

## How the Integration Works

**H&S → Training:** When a risk assessment in H&S identifies required competencies for a given hazard or work activity, the Training module automatically assigns relevant courses to all workers in roles exposed to that hazard. This eliminates the need to manually cross-reference risk assessments with training plans.

**Training → H&S:** Training compliance data feeds back into the H&S dashboard. The H&S module displays a competency compliance percentage for each significant hazard, showing how many exposed workers have completed the required training.

## Role-Based Training Requirements

Each role in the HR module can have mandatory H&S training competencies associated with it. When a worker is assigned to a role, the Training module automatically generates their H&S training plan based on the hazards relevant to that role.

## Configuration and Data Flow

1. Navigate to **Settings → Integrations → H&S-Training** and enable sync
2. In H&S risk assessments, use the 'Required Competencies' field to link to Training courses
3. Configure which roles are exposed to each hazard category
4. Set the training recurrence period for each competency

## Common Use Cases

- New chemical hazard identified in H&S → COSHH training assigned to all exposed workers
- Working at height risk assessment updated → refresher training triggered for scaffolders
- Training non-compliance visible in H&S dashboard as an open risk control gap

## Data Flow

H&S hazard identified → Required competency linked → Training course assigned to exposed workers → Completion tracked → Compliance rate visible in H&S risk assessment record.`,
  },
  {
    id: 'KB-IG-004',
    title: 'Environmental ↔ ESG Integration Guide',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['integration', 'environment', 'esg'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Environmental ↔ ESG Integration Guide

## Overview

Environmental monitoring data flows automatically into the ESG module, eliminating double-entry of emissions, energy, water, and waste data when preparing sustainability reports and disclosures.

## How the Integration Works

**Environmental → ESG:** Emissions data recorded in the Environmental module (Scope 1 direct emissions from combustion, Scope 2 purchased electricity) is automatically mapped to the corresponding ESG reporting sections. Environmental events (spills, exceedances) feed into the ESG social and environmental incidents section. The legal compliance register is shared between both modules.

**ESG → Environmental:** ESG reporting period targets (e.g., Scope 1 reduction targets) are visible as objectives in the Environmental module, ensuring environmental teams are aligned with corporate ESG commitments.

## Data Mapping

Environmental measurement units are automatically converted to ESG reporting units. For example, kWh of electricity consumption is converted to tonnes CO2e using the configured emission factors from the Emission Factors database.

## Configuration

Navigate to **Settings → Integrations → Environmental-ESG** and:
1. Enable bidirectional sync
2. Map environmental monitoring categories to ESG GHG Protocol scopes
3. Configure emission factors for your region and energy mix
4. Set the ESG reporting period to align with the environmental monitoring calendar

## Common Use Cases

- Monthly energy and fuel data automatically populates ESG Scope 1 and 2 tables
- Environmental significant aspects linked to ESG material topics
- Single legal register maintained, used by both environmental compliance and ESG regulatory disclosures

## Data Flow

Environmental measurement recorded → Emission factor applied → GHG scope calculated → ESG report section auto-populated → ESG disclosures generated with full environmental data trail.`,
  },
  {
    id: 'KB-IG-005',
    title: 'Environmental ↔ Energy Integration Guide',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['integration', 'environment', 'energy', 'iso-50001', 'iso-14001'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Environmental ↔ Energy Integration Guide

## Overview

The Environmental (ISO 14001) and Energy (ISO 50001) modules are closely aligned. Energy consumption is both a significant environmental aspect and the primary subject of energy management. This integration eliminates duplicate data entry and connects the two management systems.

## How the Integration Works

**Energy → Environmental:** Energy consumption data entered or automatically imported in the Energy module (from meter readings, IoT sensors, or manual entry) automatically populates the Environmental module's energy consumption monitoring section. This includes electricity, natural gas, diesel, and other energy carriers.

**Environmental → Energy:** Significant energy uses identified in the Environmental aspects register are linked to the Energy module's significant energy use (SEU) list, ensuring both systems address the same priorities.

## Scope 2 Emissions

Electricity consumption from the Energy module is used to calculate Scope 2 market-based and location-based emissions in the Environmental module, using the configured regional grid emission factors.

## Energy Performance Indicators

EnPI data (energy intensity ratios such as kWh per unit of production) calculated in the Energy module is visible in Environmental performance reports, providing context for environmental targets.

## Configuration Steps

1. Navigate to **Settings → Integrations → Environmental-Energy** and enable sync
2. Map Energy module energy carriers to Environmental monitoring categories
3. Configure Scope 2 emission factors per energy carrier
4. Link Energy module objectives to Environmental module objectives where applicable

## Common Use Cases

- ISO 50001 energy data used directly in ISO 14001 environmental aspects assessment
- Combined environmental and energy dashboard for management review
- Single data entry for energy metering, used by both management systems

## Data Flow

Energy meter reading → Energy module → Automatic sync → Environmental monitoring record → Scope 2 calculation → Environmental performance report.`,
  },
  {
    id: 'KB-IG-006',
    title: 'Quality ↔ Complaints Integration Guide',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['integration', 'quality', 'complaints', 'ncr', 'capa'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Quality ↔ Complaints Integration Guide

## Overview

Customer complaints are a key source of quality data. The Complaints and Quality modules integrate to ensure every complaint drives appropriate quality action and that complaint resolution is tracked through the full CAPA lifecycle.

## How the Integration Works

**Complaints → Quality:** When a customer complaint is received and categorised as a product or service quality issue, the Complaints module automatically creates a Nonconformance Report (NCR) in the Quality module. The NCR includes the complaint reference number, customer details (anonymised if required), the product or service affected, and the defect description.

**Quality → Complaints:** When the NCR investigation is complete, a CAPA is raised in the Quality module. As the CAPA progresses through investigation, corrective action, and effectiveness verification, the complaint status in the Complaints module is automatically updated, keeping the customer-facing team informed.

## Shared Root Cause Analysis

Root cause analysis data entered on the NCR is shared with the complaint record, enabling customer-facing staff to communicate the root cause and corrective action to the customer.

## Customer Satisfaction Data

Customer satisfaction survey responses from the Complaints module feed into Quality KPIs as a customer satisfaction metric, supporting ISO 9001 Clause 9.1.2 monitoring requirements.

## Configuration and Workflow Mapping

Navigate to **Settings → Integrations → Quality-Complaints** and:
1. Enable bidirectional sync
2. Configure which complaint categories trigger NCR creation
3. Map complaint severity to NCR priority
4. Set NCR-to-CAPA threshold (e.g., all major complaints trigger CAPA)

## Data Flow

Customer complaint received → Complaint categorised → NCR auto-created in Quality → Root cause investigation → CAPA raised → Complaint status updated → Customer notified → Effectiveness verification → Complaint closed.`,
  },
  {
    id: 'KB-IG-007',
    title: 'Quality ↔ Supplier Management Integration Guide',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['integration', 'quality', 'suppliers'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Quality ↔ Supplier Management Integration Guide

## Overview

Supplier quality performance is central to any ISO 9001-compliant quality management system. The Quality and Supplier Management modules integrate to ensure that supplier NCRs, quality performance scores, and corrective actions are managed in a unified workflow.

## How the Integration Works

**Quality → Suppliers:** When an incoming goods inspection fails in the Quality module, a supplier NCR is automatically raised and linked to the relevant supplier record in Supplier Management. The supplier is notified via the Supplier Portal if configured.

**Suppliers → Quality:** Supplier performance scores in the Supplier Management module include quality metrics drawn from the Quality module: NCR rate, on-time delivery, and inspection pass rate.

## Supplier Corrective Action Request (SCAR)

When a supplier NCR is raised, a Supplier Corrective Action Request (SCAR) can be automatically generated and sent to the supplier. The supplier's response and corrective action plan are tracked in the Supplier Management module and linked back to the Quality CAPA.

## Approved Supplier List

The Quality module's approved supplier list is maintained in Supplier Management. Supplier qualification requires the submission of quality certifications (ISO 9001 certificate, product approvals) which are stored as documents in Document Control.

## Configuration Steps

1. Enable the integration at **Settings → Integrations → Quality-Suppliers**
2. Configure incoming inspection failure thresholds that trigger supplier NCRs
3. Set SCAR response deadlines by supplier tier
4. Configure supplier quality score weighting (NCR rate, inspection pass rate, CAPA timeliness)

## Data Flow

Goods received → Incoming inspection → Failure → Supplier NCR → SCAR issued → Supplier responds → Quality CAPA → Effectiveness check → Supplier performance score updated.`,
  },
  {
    id: 'KB-IG-008',
    title: 'HR ↔ Payroll Integration Guide',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['integration', 'hr', 'payroll'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# HR ↔ Payroll Integration Guide

## Overview

The HR and Payroll modules are tightly integrated so that employee master data is maintained in one place and payroll is always consistent with HR records, eliminating dual-entry errors.

## Data Flowing from HR to Payroll

The following data is automatically synchronised from HR to Payroll:

- **Employee name and personal details:** Updated in HR, reflected in Payroll within minutes
- **Job title and department:** Used for payroll cost centre allocation
- **Pay rate:** Salary or hourly rate changes in HR trigger a payroll rate update effective from the configured date
- **Bank details:** Employee bank account information managed in HR (with appropriate access controls) and used by Payroll for payment file generation
- **Start and end dates:** New starters are automatically added to the next payroll run; leavers are processed for their final pay period

## Leave and Deductions

Leave approvals in HR automatically adjust payroll deductions for the relevant pay period. Unpaid leave, sick leave, and other absence types are configured with their payroll treatment in HR, and the Payroll module applies the deduction automatically.

## Configuration

Navigate to **Settings → Integrations → HR-Payroll** and:
1. Enable bidirectional sync
2. Map HR employment types to Payroll pay frequency (weekly, monthly)
3. Configure pay change effective date rules
4. Set headcount reconciliation schedule

## Headcount Reconciliation

A reconciliation report is available showing the headcount in HR versus active employees in Payroll, highlighting any discrepancies for administrator review.

## Data Flow

HR employee record created → Payroll employee record auto-created → Leave approved in HR → Payroll deduction calculated → Salary change in HR → Payroll rate updated → Leaver processed in HR → Final pay calculated in Payroll.`,
  },
  {
    id: 'KB-IG-009',
    title: 'HR ↔ Training Integration Guide',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['integration', 'hr', 'training'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# HR ↔ Training Integration Guide

## Overview

The HR and Training modules work together so that an employee's role in HR determines their training requirements in Training, and compliance data flows back to the HR record for performance review and audit purposes.

## How the Integration Works

**HR → Training:** The job title assigned to an employee in HR determines which mandatory training plan is applied in the Training module. When a new employee is created, their onboarding training plan is automatically assigned. When an employee changes role, the new role's training requirements are applied and any training no longer required is deprioritised.

**Training → HR:** Training completion records, certifications earned, and compliance status are visible directly from the employee record in HR. This allows HR managers to review training compliance as part of performance appraisals without navigating to a separate system.

## Role-Based Training Plans

Each HR job title or role can have associated mandatory and recommended training plans. These are configured in **Training → Configuration → Role Training Plans → assign courses by role**.

## Certification Expiry Alerts

When a training certification is approaching its expiry date (as configured in Training), HR is notified so the manager can factor renewal into workload planning and performance discussions.

## Configuration Steps

1. Navigate to **Settings → Integrations → HR-Training** and enable sync
2. Map HR job titles to Training role plans
3. Set the notification lead time for certification expiry alerts to HR
4. Enable training compliance visibility on the HR employee record

## Data Flow

New employee created in HR → Role-based training plan auto-assigned → Employee completes training → Certification recorded in Training → HR record updated → Manager sees compliance status → Certification expires → HR notified for renewal planning.`,
  },
  {
    id: 'KB-IG-010',
    title: 'Finance ↔ Inventory Integration Guide',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['integration', 'finance', 'inventory'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Finance ↔ Inventory Integration Guide

## Overview

The Finance and Inventory modules integrate to automate the accounting entries that arise from stock movements, purchase receipts, and goods issues, eliminating manual journal posting and ensuring the balance sheet reflects real inventory values.

## How the Integration Works

**Inventory → Finance:** When goods are received into stock in the Inventory module, an accounts payable invoice is automatically created in Finance linked to the purchase order. When stock is issued to production or a job, a cost of goods sold entry is posted to the P&L in Finance. Inventory valuation (using FIFO, LIFO, or weighted average as configured) automatically updates the Balance Sheet stock account.

**Finance → Inventory:** Purchase orders must be approved in Finance (above configured value thresholds) before Inventory can receive the goods. This ensures spend approval controls are not bypassed by the warehouse team.

## Currency and Multi-Entity

For multi-currency organisations, inventory receipts in foreign currencies are converted to the functional currency using the exchange rate at the date of receipt. Multi-entity organisations can configure separate inventory GL accounts per legal entity.

## Configuration

Navigate to **Settings → Integrations → Finance-Inventory** and:
1. Enable bidirectional sync
2. Map inventory categories to Finance GL accounts (stock, COGS, write-off)
3. Configure inventory valuation method (FIFO, LIFO, or weighted average)
4. Set purchase order approval thresholds requiring Finance sign-off

## Common Use Cases

- Goods received → AP invoice auto-created → Accounts payable team reviews and approves payment
- Stock written off → Write-off journal posted to Finance P&L automatically
- Inventory revaluation → Finance Balance Sheet updated to reflect current stock value

## Data Flow

PO approved in Finance → Goods received in Inventory → AP invoice created → Stock value posted to Balance Sheet → Goods issued → COGS posted to P&L.`,
  },
  {
    id: 'KB-IG-011',
    title: 'Finance ↔ Payroll Integration Guide',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['integration', 'finance', 'payroll'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Finance ↔ Payroll Integration Guide

## Overview

When a payroll run is finalised, the Finance module automatically receives the journal entries required to post salary costs, tax liabilities, and pension contributions to the correct general ledger accounts, eliminating manual payroll journal entry.

## How the Integration Works

**Payroll → Finance:** Each payroll run generates a journal entry in Finance containing:
- Gross salary expense, allocated by cost centre (department/project)
- Employer national insurance or payroll tax liability
- Employee income tax (PAYE) liability
- Employee and employer pension contributions
- Net pay liability (cleared when payment is made)

The Finance team can review the journal before it is posted, or configure automatic posting upon payroll approval.

## GL Account Mapping

Navigate to **Settings → Integrations → Finance-Payroll → GL Mapping** to configure which Finance general ledger accounts receive each payroll component. Common mapping includes salary expense by department, tax liability, pension payable, and accrued wages accounts.

## Optional Finance Approval Before Payment

You can configure an optional Finance approval step that must be completed before the payroll payment file is released to the bank. This provides a final financial control over payroll disbursement.

## Payroll Cost Centre Reporting

Finance reports can be filtered by payroll cost centre, enabling analysis of staff costs by department, project, or site using data drawn from the Payroll integration.

## Configuration Steps

1. Enable the integration at **Settings → Integrations → Finance-Payroll**
2. Map payroll components to Finance GL accounts
3. Configure cost centre mapping (HR department → Finance cost centre)
4. Set automatic or manual journal posting preference

## Data Flow

Payroll run finalised → Journal entries generated by Payroll → Finance team reviews → Journal posted → GL accounts updated → Finance reports reflect payroll costs.`,
  },
  {
    id: 'KB-IG-012',
    title: 'Finance ↔ Assets Integration Guide',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['integration', 'finance', 'assets'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Finance ↔ Assets Integration Guide

## Overview

The Finance and Asset Management modules integrate so that the financial lifecycle of assets — acquisition, depreciation, revaluation, and disposal — is automatically reflected in the Finance general ledger without manual journal posting.

## How the Integration Works

**Assets → Finance:** When an asset is acquired and added to the Asset Management module, a capital expenditure journal is automatically posted to Finance: debit fixed assets, credit accounts payable or bank. Monthly depreciation is calculated in Asset Management and a depreciation journal is auto-posted to Finance (debit depreciation expense, credit accumulated depreciation). When an asset is disposed of, the gain or loss on disposal is posted to the Finance P&L automatically.

**Finance → Assets:** The capex vs opex classification configured in Asset Management maps to the corresponding Finance GL accounts, ensuring assets above the capitalisation threshold are posted to the balance sheet and below-threshold purchases are expensed immediately.

## Asset Revaluation

When assets are revalued in Asset Management (e.g., property revaluation to fair value), a revaluation journal is posted to Finance with the surplus recognised in the revaluation reserve or P&L, depending on configuration.

## Configuration Steps

1. Enable the integration at **Settings → Integrations → Finance-Assets**
2. Map asset categories to Finance fixed asset GL accounts
3. Configure depreciation methods per asset category (straight-line, reducing balance, units of production)
4. Set the capitalisation threshold (assets below this amount are expensed immediately)
5. Map disposal types to Finance gain/loss accounts

## Data Flow

Asset acquired → Capex journal posted in Finance → Monthly depreciation calculated → Depreciation journal posted → Asset revalued → Revaluation journal posted → Asset disposed → Disposal journal posted → Finance Balance Sheet updated automatically.`,
  },
  {
    id: 'KB-IG-013',
    title: 'Risk ↔ Audit Integration Guide',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['integration', 'risk', 'audit'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Risk ↔ Audit Integration Guide

## Overview

The Risk Register and Audit Management modules work together to ensure that audit resources are directed to the highest-risk areas of the organisation and that audit findings enrich the risk register with real-world performance data.

## How the Integration Works

**Risk → Audit:** The audit programme in the Audit Management module is driven by the risk register. Processes and areas with higher risk scores are scheduled for more frequent audit coverage. When the annual audit programme is generated, the system suggests audit frequency based on current risk ratings.

**Audit → Risk:** Audit findings feed into the risk register as new or escalated risks. A major non-conformance found during an audit can automatically create or update a risk record with the finding detail, ensuring the risk register reflects current operational realities.

## Shared Action Management

Risk treatment actions and CAPA raised from audit findings share the same action management workflow. This ensures that risk owners are aware of related audit findings and that auditors can see progress on risk treatment actions relevant to their findings.

## Risk Indicators and Additional Audit Coverage

If a leading risk indicator (KRI) exceeds its threshold in the Risk module, this can trigger an unscheduled audit of the relevant process, providing additional assurance when risk levels are elevated.

## Management Review

Management review sessions draw on consolidated risk and audit data: outstanding risk treatments, audit programme completion, major findings, and CAPA close-out rates are all presented together.

## Configuration Steps

1. Enable the integration at **Settings → Integrations → Risk-Audit**
2. Configure the risk score thresholds that determine audit frequency
3. Enable automatic risk creation from major audit findings
4. Configure KRI breach notifications to trigger unscheduled audits

## Data Flow

Risk register → Audit frequency determined → Audit conducted → Findings raised → Risks created or escalated → CAPA assigned → Management review consolidates data.`,
  },
  {
    id: 'KB-IG-014',
    title: 'Document Control ↔ All Modules Integration Guide',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['integration', 'documents'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Document Control ↔ All Modules Integration Guide

## Overview

Document Control is foundational to all IMS modules. Procedures, risk assessments, SOPs, work instructions, training materials, legal certificates, and reports are all managed in Document Control and linked directly to records across other modules.

## How Documents Link to Modules

- **H&S:** Risk assessment documents, safe work procedures, COSHH assessments, and emergency plans are linked to H&S hazard and risk records
- **Quality:** SOPs, work instructions, inspection plans, and quality standards are linked to Quality NCRs and CAPA records
- **Environmental:** Environmental procedures and monitoring plans linked to environmental aspects
- **Training:** Course materials and reference documents linked to training records in the Training module
- **Audit:** Audit evidence documents uploaded directly to audit findings records

## Document Approval Workflow from Module Records

When a module record references a document, the document approval workflow is triggered from within the module. Reviewers are notified from both the Document Control module and the referring module, ensuring all stakeholders review relevant documentation.

## CAPA Actions Linked to Documents

When a CAPA action requires a document to be updated (e.g., revising a procedure in response to a nonconformance), the action is linked directly to the document record. The CAPA action is marked complete only when the new document version is published.

## Controlled Copy Distribution

Controlled copies of relevant documents are automatically distributed to users within each module. When a document is revised, all linked module records display a notification that a referenced document has been updated.

## Configuration

Enable document links for each module at **Settings → Integrations → Document Control → select module → enable document linking**.

## Data Flow

Module record created → Related document linked → Document distributed to module users → Document revision → Module users notified → Document updated → CAPA action closed.`,
  },
  {
    id: 'KB-IG-015',
    title: 'Audit ↔ CAPA Integration Guide',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['integration', 'audit', 'capa'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Audit ↔ CAPA Integration Guide

## Overview

Audit findings are one of the primary sources of CAPA activity. The Audit Management and CAPA modules integrate so that corrective actions arising from audit findings are tracked through a disciplined CAPA lifecycle with clear ownership and timelines.

## How the Integration Works

**Audit → CAPA:** When an auditor raises a finding (major or minor nonconformance, observation, or opportunity for improvement), the audit system can automatically create a linked CAPA record. The CAPA inherits the finding description, severity, and audit reference. The CAPA owner receives an automatic notification.

**CAPA → Audit:** As the CAPA progresses through root cause analysis, corrective action, and effectiveness verification, the linked audit finding status is automatically updated. The audit record shows real-time CAPA progress without the auditor needing to chase the CAPA owner manually.

## Repeat Findings and Trend Identification

When a new audit finding is raised, the system checks whether a similar finding has been raised in previous audits. If a repeat finding is detected, it is flagged and linked to the previous audit record, supporting trend identification and escalation to senior management.

## Audit Closure Requirements

Audit closure can be configured to require that all associated CAPA records are either completed or have an approved completion plan with a realistic target date. This prevents audits being formally closed with outstanding uncorrected nonconformances.

## CAPA Metrics in the Audit Dashboard

The Audit dashboard displays CAPA metrics: number of open CAPAs from audits, average days to CAPA closure, overdue CAPAs by department, and repeat finding rate.

## Configuration and Workflow Setup

1. Navigate to **Settings → Integrations → Audit-CAPA**
2. Configure which finding types (major NC, minor NC, observation) auto-create CAPA records
3. Set default CAPA due dates by finding severity
4. Enable repeat-finding detection and notification rules

## Data Flow

Audit conducted → Findings raised → CAPA auto-created → Root cause investigated → Corrective action implemented → Effectiveness verified → Audit finding closed → Repeat finding check triggered on next audit cycle.`,
  },
  {
    id: 'KB-IG-016',
    title: 'Incidents ↔ CAPA Integration Guide',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['integration', 'incidents', 'capa'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Incidents ↔ CAPA Integration Guide

## Overview

Serious incidents require systematic root cause analysis and corrective action to prevent recurrence. The Incidents and CAPA modules integrate so that every significant incident drives an appropriate CAPA response tracked through to verified effectiveness.

## How the Integration Works

**Incidents → CAPA:** When an incident is classified as MAJOR, CRITICAL, or CATASTROPHIC severity, a CAPA record is automatically created and linked to the incident. The CAPA inherits the incident title, date, location, and initial description. The CAPA owner is notified immediately. For MINOR and MODERATE incidents, CAPA creation is optional and can be triggered manually from the incident record.

**CAPA → Incidents:** As the CAPA progresses, the incident record displays the current CAPA status. When the CAPA is closed following effectiveness verification, the incident record is updated with the learning outcome and prevention measures, creating a complete end-to-end record.

## Systemic CAPA for Multiple Incidents

Multiple incidents of the same type can be linked to a single systemic CAPA, avoiding duplication when the same root cause is driving repeated incidents. The CAPA record shows all linked incidents for full context.

## Recurrence Checking

When a new incident is reported, the system checks incident history for similar events by category, location, and cause type. If a prior incident with a closed CAPA is found, the effectiveness of that CAPA is automatically flagged for review.

## Incident Trend Analysis

CAPA data (root causes, corrective action types, recurrence rates) is included in the Incidents trend analysis dashboard, providing insight into whether intervention measures are working.

## Configuration Steps

1. Enable the integration at **Settings → Integrations → Incidents-CAPA**
2. Set the severity thresholds for automatic CAPA creation
3. Configure CAPA due date rules by incident severity
4. Enable recurrence checking and notification rules

## Data Flow

Incident reported → Severity assessed → CAPA auto-created for major incidents → Root cause investigated → Corrective action implemented → Effectiveness verified → Incident learning record updated → Recurrence check active.`,
  },
  {
    id: 'KB-IG-017',
    title: 'PTW ↔ H&S Risk Assessment Integration Guide',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['integration', 'ptw', 'health-safety', 'risk'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# PTW ↔ H&S Risk Assessment Integration Guide

## Overview

Permit to Work (PTW) and H&S Risk Assessments integrate to ensure that the hazard identification and control measures used in permit preparation are drawn from the organisation's verified risk register rather than being created ad hoc each time.

## How the Integration Works

**H&S → PTW:** When a PTW is being prepared, the permit form automatically pulls the relevant risk assessment from the H&S risk register based on the work type (e.g., hot work, confined space entry, electrical isolation) and location. Pre-identified hazards and control measures are pre-populated on the PTW, which the authorised person then verifies and supplements for site-specific conditions.

**PTW → H&S:** When an H&S incident occurs involving permitted work, the incident record automatically tags the associated PTW. PTW statistics (permits issued, work types, incident rate during permitted work) feed into H&S KPIs and are included in the H&S management review dashboard.

## Hazard Library

The H&S hazard library (generic hazards and control measures by work type and location) provides the foundation for PTW dynamic risk assessments. The library is maintained in H&S and used by PTW without duplication.

## Contractor H&S Induction and PTW Eligibility

Contractor H&S induction records maintained in H&S are linked to PTW eligibility. A contractor who has not completed the required site induction cannot be listed as authorised person or worker on a PTW.

## Configuration Steps

1. Enable the integration at **Settings → Integrations → PTW-HS**
2. Map PTW work types to H&S risk assessment categories
3. Configure PTW-to-incident auto-tagging rules
4. Link contractor induction records to PTW eligibility checks

## Data Flow

PTW raised → Work type selected → H&S risk assessment pulled → Controls pre-populated → PTW approved → Work commences → PTW closed → Statistics feed H&S KPIs.`,
  },
  {
    id: 'KB-IG-018',
    title: 'ESG ↔ HR Integration Guide',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['integration', 'esg', 'hr'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# ESG ↔ HR Integration Guide

## Overview

ESG social metrics — workforce diversity, employee development, health and safety performance, and labour practices — are sourced directly from the HR, Training, and H&S modules, eliminating manual data extraction for sustainability reporting.

## How the Integration Works

**HR → ESG:** HR headcount data (total employees, full-time vs part-time, permanent vs contract) automatically feeds into ESG workforce metrics. Diversity data — gender breakdown, age distribution, and ethnicity data where legally permitted and voluntarily provided — flows from HR to the ESG social section. Employee turnover rate is calculated from HR starters and leavers data.

**Training → ESG:** Total training hours per employee, mandatory training completion rates, and leadership development programme participation data flow from the Training module into the ESG employee development metrics section.

**H&S → ESG:** Lost Time Injury Frequency Rate (LTIFR), Total Recordable Incident Frequency Rate (TRIFR), and fatalities (reported as zero where applicable) flow from the H&S Incidents module into the ESG safety performance metrics section.

## Data Validation Before Reporting Period Close

Before closing an ESG reporting period, the system validates that HR, Training, and H&S data is complete and consistent. Any gaps or anomalies are flagged for review before the ESG report is finalised.

## Configuration Steps

1. Navigate to **Settings → Integrations → ESG-HR** and enable sync for HR, Training, and H&S data
2. Map HR data fields to ESG disclosure indicators (GRI 401, GRI 403, GRI 404, GRI 405)
3. Configure diversity data collection settings and privacy controls
4. Set the ESG reporting period to align with the HR data calendar

## Data Flow

HR data maintained year-round → ESG reporting period opened → HR/Training/H&S data auto-populated into ESG → Data validated → ESG report generated → Sustainability disclosure prepared.`,
  },
  {
    id: 'KB-IG-019',
    title: 'Supplier ↔ Contracts Integration Guide',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['integration', 'suppliers', 'contracts'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Supplier ↔ Contracts Integration Guide

## Overview

Supplier relationships are governed by contracts. The Supplier Management and Contract Management modules integrate to provide a complete view of each supplier relationship: performance, contract obligations, spend, and compliance status in one place.

## How the Integration Works

**Contracts → Suppliers:** Supplier contracts created and managed in Contract Management are automatically visible from the corresponding supplier record in Supplier Management. The supplier record shows all active, pending, and historical contracts with their key dates, values, and status.

**Suppliers → Contracts:** Supplier performance scores maintained in Supplier Management are linked to contract KPI obligations. When a supplier's performance score drops below the threshold specified in the contract, a contract obligation alert is triggered and the relevant contract manager is notified.

## Contract Expiry and Supplier Re-evaluation

Contract expiry alerts in Contract Management automatically inform the Supplier Management module that a supplier is due for re-evaluation. The re-evaluation is linked to the contract renewal timeline, ensuring that underperforming suppliers are reviewed before a contract is renewed rather than after.

## Supplier Spend Analysis

Contract values from Contract Management are included in the supplier spend analysis in Supplier Management, providing a view of total contractual commitment per supplier and per spend category.

## Anti-Bribery Due Diligence

Anti-bribery and corruption due diligence records maintained in Supplier Management (ISO 37001 compliance) are linked to the corresponding supplier contract record, providing auditors with a complete compliance package in one location.

## Configuration and Data Linking

1. Enable the integration at **Settings → Integrations → Suppliers-Contracts**
2. Configure the performance score threshold that triggers contract obligation alerts
3. Set the contract expiry lead time for re-evaluation triggers
4. Enable spend data sharing between modules

## Data Flow

Supplier onboarded → Contract created → Contract linked to supplier → Performance monitored → KPI breach → Contract alert raised → Contract expiry → Re-evaluation triggered → Contract renewed or supplier changed.`,
  },
  {
    id: 'KB-IG-020',
    title: 'Workflows ↔ All Modules Integration Guide',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['integration', 'workflows', 'automation'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Workflows ↔ All Modules Integration Guide

## Overview

The Workflows module is the automation backbone of IMS. It connects all other modules by enabling trigger-based automation that responds to events across the entire system, reducing manual coordination effort and ensuring nothing falls through the cracks.

## Trigger Types

Workflows can be triggered by any of the following events in any IMS module:

- **Record creation:** e.g., new incident reported, new supplier added
- **Status change:** e.g., CAPA moved to 'In Review', document approved
- **Field value:** e.g., risk score exceeds threshold, training compliance falls below 80%
- **Schedule:** e.g., every Monday at 09:00, on the first day of each month
- **Due date:** e.g., 7 days before a permit expiry date

## Available Actions

Workflows can execute any combination of the following actions:
- Create a record in any module (e.g., create a CAPA from an incident)
- Update a field value in any record
- Send a notification (in-app, email, or webhook to Teams/Slack)
- Assign a task to a user or role
- Call an external webhook with record data

## Cross-Module Workflow Examples

- **Incident → CAPA:** New MAJOR incident → create linked CAPA → assign to H&S Manager → notify Director
- **Complaint → NCR:** New complaint with quality category → create NCR → notify Quality Manager
- **Risk review due:** Risk review date reached → notify risk owner → escalate to Risk Manager if not completed within 5 days
- **New employee:** HR employee created → assign onboarding training plan → notify manager

## Best Practices for Cross-Module Workflow Design

1. Keep workflows simple — one trigger, one primary action, with notifications as secondary actions
2. Document each workflow's purpose in the workflow description field
3. Test workflows in a sandbox before enabling in production
4. Review active workflow logs monthly for unexpected behaviour

Navigate to **Workflows → New Workflow** to create cross-module automations.`,
  },
  {
    id: 'KB-IG-021',
    title: 'Microsoft Azure AD / Entra ID Integration Guide',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['integration', 'sso', 'azure-ad', 'authentication'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Microsoft Azure AD / Entra ID Integration Guide

## Overview

This guide covers the full configuration of Single Sign-On (SSO) between Microsoft Azure Active Directory (now Microsoft Entra ID) and IMS using SAML 2.0.

## Prerequisites

- Azure AD tenant with Global Administrator or Application Administrator access
- IMS System Administrator access
- Users in Azure AD with email addresses matching their IMS user accounts

## Configuration Steps

### Step 1: Create the Enterprise Application in Azure

1. In the Azure Portal, navigate to **Azure Active Directory → Enterprise Applications → New Application → Create your own application**
2. Name the application (e.g., 'IMS - Integrated Management System') and select 'Integrate any other application you don't find in the gallery'

### Step 2: Configure SAML Settings

1. In the application, go to **Single sign-on → SAML**
2. Set the **Entity ID (Identifier):** \`https://yourcompany.ims.io/saml/metadata\`
3. Set the **Reply URL (ACS URL):** \`https://yourcompany.ims.io/saml/callback\`
4. Set the **Sign-on URL:** \`https://yourcompany.ims.io/login\`

### Step 3: Map Attributes

Configure SAML attribute statements to send: email, firstName, lastName, displayName, and role from Azure AD user properties.

### Step 4: Import Metadata into IMS

1. Download the Federation Metadata XML from Azure
2. In IMS: **Admin Console → Settings → SSO → Upload Metadata XML → Save → Test → Enable**

## Group-to-Role Mapping

Map Azure AD security groups to IMS roles under **Admin Console → Settings → SSO → Group Mapping**.

## Auto-Provisioning (SCIM)

Enable SCIM provisioning in Azure to automatically create and deactivate IMS user accounts when users are added or removed from the Azure AD application group.`,
  },
  {
    id: 'KB-IG-022',
    title: 'Okta Integration Guide',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['integration', 'sso', 'okta', 'authentication'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Okta Integration Guide

## Overview

This guide covers configuring Single Sign-On (SSO) between Okta and IMS using SAML 2.0, including Okta as an identity source, group push to IMS roles, and lifecycle management for deprovisioning users.

## Prerequisites

- Okta administrator access (Super Admin or Application Admin)
- IMS System Administrator access

## Configuration Steps

### Step 1: Create the App Integration in Okta

1. In the Okta Admin Console, navigate to **Applications → Applications → Create App Integration**
2. Select **SAML 2.0** and click Next
3. Name the application (e.g., 'IMS')

### Step 2: Configure SAML Settings

1. Set the **Single sign-on URL (ACS URL):** \`https://yourcompany.ims.io/saml/callback\`
2. Set the **Audience URI (Entity ID):** \`https://yourcompany.ims.io/saml/metadata\`
3. Set **Name ID format** to 'EmailAddress'

### Step 3: Configure Attribute Statements

Add attribute statements to pass user information to IMS:
- email → user.email
- firstName → user.firstName
- lastName → user.lastName
- role → appuser.imsRole (custom attribute on the Okta app user profile)

### Step 4: Import Okta Metadata into IMS

1. Download the Okta Identity Provider metadata XML from the Sign On tab
2. In IMS: **Admin Console → Settings → SSO → Upload Metadata XML → Save → Test → Enable**

## Group Push to IMS Roles

Configure Okta group push to automatically assign IMS roles based on Okta group membership under **Admin Console → Settings → SSO → Group Mapping**.

## Lifecycle Management

When a user is deactivated or removed from the IMS application in Okta, the user's IMS account is automatically deactivated via SCIM provisioning. Enable SCIM at **Okta → Provisioning → Enable API Integration**.

## Multi-Factor Authentication

Enforce MFA for IMS access within Okta by configuring an MFA policy on the IMS application. This means all IMS users must use Okta MFA regardless of whether they are on the corporate network.`,
  },
  {
    id: 'KB-IG-023',
    title: 'Microsoft Teams Integration Guide',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['integration', 'microsoft-teams', 'notifications'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Microsoft Teams Integration Guide

## Overview

IMS can send real-time notifications directly to Microsoft Teams channels, ensuring that important events — incident reports, CAPA assignments, permit requests, overdue actions — reach the right teams without leaving their primary collaboration tool.

## Setup

1. Navigate to **Admin Console → Integrations → Microsoft Teams**
2. Click **Authorize** — you will be redirected to Microsoft to grant permission for IMS to post to your Teams workspace
3. Select which Teams and channels should receive IMS notifications
4. Configure which notification types are sent to which channel (e.g., incidents to #safety, CAPAs to #quality-team, document approvals to #document-control)

## Notification Types Available in Teams

The following IMS events can be configured to send Teams notifications:

- New incident reported (with severity level)
- CAPA assigned to user or team
- Document submitted for review or approval
- Permit to Work request raised
- Overdue training alerts for a department
- Risk score threshold breached
- Management review action items assigned
- Audit findings raised

## Teams Message Format

Each Teams notification uses an Adaptive Card format showing:
- Event type and module icon
- Record title and reference number
- Key details (severity, assignee, due date)
- Deep link button: **Open in IMS** → takes the user directly to the relevant record

## Webhook URL Configuration

For advanced configuration, IMS can post to a specific Teams Incoming Webhook URL. Navigate to your Teams channel → Connectors → Incoming Webhook → copy URL → paste into **Admin Console → Integrations → Microsoft Teams → Custom Webhook URL**.

## Bi-Directional Capability (Roadmap)

Submitting quick reports and acknowledging notifications from within Teams is planned for a future release. Current integration is outbound notifications only.`,
  },
  {
    id: 'KB-IG-024',
    title: 'Slack Integration Guide',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['integration', 'slack', 'notifications'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Slack Integration Guide

## Overview

IMS can send notifications and alerts to Slack channels, keeping your teams informed of critical events in their existing communication environment. Configure which notification types go to which channels to avoid notification overload.

## Setup

1. Navigate to **Admin Console → Integrations → Slack**
2. Click **Authorize** — you will be redirected to Slack to grant IMS permission to post to your workspace
3. Select the Slack workspace and grant the required permissions
4. Select default channels for IMS notifications

## Configuring Notification Routing by Channel

Best practice is to route different notification types to appropriate channels:

- **#safety:** New incidents, PTW requests, H&S non-conformances
- **#quality:** NCRs, CAPAs, audit findings, document approvals
- **#hr-team:** Onboarding alerts, training overdue, HR document approvals
- **#compliance:** Regulatory monitor alerts, legal register updates, ESG milestones
- **#management:** Risk threshold breaches, management review actions, executive KPIs

Navigate to **Admin Console → Integrations → Slack → Channel Routing** to configure this mapping.

## Message Format

IMS Slack messages use a structured Block Kit format with:
- Coloured sidebar indicating severity or priority
- Record title and reference number
- Key fields (type, assignee, due date, status)
- Deep link: **View in IMS** button for direct navigation

## Slash Command

If enabled by your admin, the '/ims' slash command is available in Slack. For example, '/ims status' returns a live KPI summary for your top-level modules.

## Bot Token and Permission Scopes

IMS requires the following Slack bot permission scopes: 'chat:write', 'channels:read', 'groups:read'. These are requested automatically during the OAuth authorisation flow.

## Avoiding Notification Overload

Use the notification filter settings to set minimum severity thresholds (e.g., only send incident notifications to Slack for MAJOR severity or above) to keep channels signal-rich rather than noisy.`,
  },
  {
    id: 'KB-IG-025',
    title: 'Power BI Integration Guide',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['integration', 'power-bi', 'analytics', 'reporting'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Power BI Integration Guide

## Overview

This guide explains how to connect IMS data to Microsoft Power BI for custom analytics dashboards and reports that go beyond the built-in IMS reporting capabilities.

## Connection Methods

### Method 1: Scheduled CSV Export

The simplest approach for organisations without API access:
1. In IMS, schedule a data export for the required modules (Analytics → Scheduled Exports)
2. Configure the export to save to a shared network location or SharePoint
3. In Power BI, connect to the CSV files as a data source
4. Configure scheduled refresh to align with the IMS export schedule

### Method 2: IMS Analytics API (Recommended)

1. Generate an Analytics API key: **Admin Console → Settings → API Keys → New Key → scope: Analytics Read**
2. In Power BI Desktop, go to **Get Data → Web**
3. Enter the IMS Analytics API endpoint URL for your organisation
4. Configure authentication using the API key as a custom header: \`Authorization: Bearer [your-api-key]\`
5. Use Power Query to transform the JSON response into tables

### Method 3: Direct Database Connection

Available on Enterprise plan only. IMS provides a read-only PostgreSQL replica connection string. Contact IMS support to enable this and retrieve connection credentials.

## Available Data Endpoints

The IMS Analytics API provides time series and summary data for all modules: incidents, risks, CAPAs, quality metrics, environmental performance, energy consumption, training compliance, and financial summaries.

## Configuring Power BI Scheduled Refresh

In Power BI Service, go to your dataset → Schedule Refresh → set frequency (hourly for real-time, daily for most use cases).

## Sample Power BI Template

A sample IMS Power BI template file (.pbit) is available from IMS support, pre-configured with common IMS dashboards including H&S performance, quality KPIs, and ESG metrics.`,
  },
  {
    id: 'KB-IG-026',
    title: 'SAP Integration Guide',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['integration', 'sap', 'erp'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# SAP Integration Guide

## Overview

IMS integrates with SAP ERP to synchronise master data and transactional data across both systems, avoiding duplicate data entry and ensuring consistency between operational management and enterprise resource planning.

## Common Integration Patterns

### HR Master Data: SAP HCM → IMS HR

Employee master data maintained in SAP HCM (employee number, name, department, cost centre, job classification) is synchronised to IMS HR. This ensures IMS HR does not become a separate employee record system but instead extends SAP with occupational health, training, and compliance capabilities.

### Asset Data: SAP Asset Management → IMS CMMS

Fixed asset records from SAP AM are synchronised to IMS CMMS, ensuring the maintenance system reflects the same asset base as the financial system. Asset IDs, descriptions, locations, and cost centres are kept in sync.

### Financial Data: SAP FI → IMS Finance

Chart of accounts, cost centres, and profit centres from SAP FI are replicated into IMS Finance for consistent coding across both systems. Journals generated by IMS (payroll, asset depreciation, inventory movements) are exported in SAP-compatible format for import into SAP FI.

## Integration Approach

IMS does not have a native SAP connector. The recommended approach is to use an integration middleware layer:
- **SAP BTP Integration Suite** for organisations already on SAP BTP
- **Third-party iPaaS** (MuleSoft, Dell Boomi, Informatica) for heterogeneous environments

IMS exposes REST API endpoints and supports webhook events for both data push and pull patterns.

## Authentication

IMS uses OAuth 2.0 client credentials flow for service-to-service integration. Generate a service account and API key in **Admin Console → Settings → API Keys**.

## Implementation Recommendation

SAP integrations are complex and organisation-specific. Engage IMS Professional Services for a scoping workshop before implementation to map data fields, define integration frequency, and design error-handling procedures.`,
  },
  {
    id: 'KB-IG-027',
    title: 'IoT & Sensor Data Integration Guide',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['integration', 'iot', 'sensors', 'monitoring'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# IoT & Sensor Data Integration Guide

## Overview

IMS can receive data from IoT devices, sensors, and industrial monitoring equipment, enabling automated data collection that eliminates manual meter reading, reduces recording errors, and enables real-time alerting when thresholds are breached.

## Supported Protocols

- **MQTT:** Subscribe IMS to your MQTT broker for real-time sensor data streams
- **REST API (push):** Devices or gateways POST data to the IMS IoT endpoint
- **Webhook push:** Edge computing platforms (AWS IoT, Azure IoT Hub, Siemens MindSphere) push processed data to IMS via webhook

## Common Use Cases by Module

| IMS Module | IoT Data Source | Data Type |
|---|---|---|
| Energy | Smart electricity/gas meters | kWh, m3, demand |
| Environmental | Air quality monitors, flow meters | NOx, PM2.5, effluent flow |
| CMMS | Vibration sensors, thermal cameras | Equipment condition data |
| Food Safety | Temperature loggers | CCP temperature readings |
| H&S | Gas detectors, noise monitors | Gas concentration, dB level |

## IMS IoT Endpoint Configuration

1. Navigate to **Admin Console → Integrations → IoT**
2. Create a new IoT data source: name, module destination, data format (JSON schema)
3. Copy the IMS IoT endpoint URL and authentication token
4. Configure your device or gateway to send data to this endpoint

## Data Validation

IMS applies automatic range validation to incoming IoT data. Values outside configured operational ranges are flagged as anomalies and held for manual verification before being recorded.

## Alert Configuration

Configure threshold-based alerts: when a sensor value breaches a defined limit, an alert is automatically raised in the relevant IMS module. For example, a temperature exceedance in Food Safety automatically creates a CCP breach record.

## Data Retention

Raw IoT data is retained for a configurable period (default 12 months) and aggregated to daily summaries for long-term retention. Detailed raw data can be exported on request.`,
  },
  {
    id: 'KB-IG-028',
    title: 'Zapier & Make (Integromat) Integration Guide',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['integration', 'zapier', 'make', 'automation', 'no-code'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Zapier & Make (Integromat) Integration Guide

## Overview

IMS supports outgoing webhooks and a REST API, which can be used with no-code automation platforms like Zapier and Make (formerly Integromat) to connect IMS to hundreds of third-party applications without custom development.

## IMS Side: Configuring Outgoing Webhooks

1. Navigate to **Admin Console → Integrations → Webhooks → New Webhook**
2. Choose the trigger event (e.g., 'New Incident Created', 'CAPA Status Changed to Overdue', 'Document Approved')
3. Enter your Zapier or Make webhook URL (generated in the next step)
4. Configure any filters (e.g., only trigger for MAJOR severity incidents)
5. Save and activate

## Zapier Setup

1. Create a new Zap in Zapier
2. Trigger: **Webhooks by Zapier → Catch Hook** → copy the provided webhook URL
3. Paste the URL into the IMS webhook configuration above
4. Map IMS data fields to your destination app fields
5. Connect to your destination app (Gmail, Google Sheets, Jira, Trello, Salesforce, etc.)
6. Test and activate the Zap

## Make (Integromat) Setup

1. Create a new Scenario in Make
2. Add the **Webhooks → Custom Webhook** module as the trigger → copy the URL
3. Paste into the IMS webhook configuration above
4. Add destination modules to process the received IMS data
5. Map fields and activate the scenario

## Example Automation Use Cases

- New incident (MAJOR+) → Create Jira ticket with incident details assigned to Engineering
- CAPA marked overdue → Send SMS via Twilio to CAPA owner
- Management review action created → Add task to Asana project
- New supplier qualified → Add to Salesforce account record
- Document approved → Notify via WhatsApp Business API

## Using the IMS REST API as an Action

In Zapier or Make, use the HTTP/REST module to call the IMS REST API as an action step — for example, creating an IMS risk record from an event in another system. Use Bearer token authentication with an IMS API key.`,
  },
  {
    id: 'KB-IG-029',
    title: 'Payroll System Integration Guide (Sage, Xero, QuickBooks)',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['integration', 'payroll', 'sage', 'xero', 'quickbooks'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Payroll System Integration Guide (Sage, Xero, QuickBooks)

## Overview

If your organisation uses an external accounting or payroll system alongside IMS Payroll, this guide explains how to transfer payroll data to avoid double-entry and maintain a single source of truth for financial records.

## General Approach

The recommended approach for all external systems is:
1. Configure GL account mapping in IMS Payroll (Settings → Payroll → GL Accounts)
2. Run and approve the payroll in IMS Payroll
3. Generate the payroll journal export in the target system's format
4. Import the journal into the external system

## Sage Payroll / Sage 50 / Sage Intacct

**Sage Payroll:** Export IMS Payroll data as a Sage-compatible CSV using the Sage export template. Navigate to **IMS Payroll → Reports → Export → Sage Format → download CSV → import into Sage**.

**Sage 50 / Sage Intacct:** Use the IMS Finance → Sage integration to export journal entries in Sage nominal ledger format. Map IMS cost centres to Sage departments during the initial setup.

## Xero

IMS has a direct API integration with Xero for journal entries:
1. Navigate to **Admin Console → Integrations → Xero → Authorize**
2. Connect your Xero organisation
3. Map IMS GL accounts to Xero account codes
4. Payroll journals from IMS Payroll are automatically posted to Xero on payroll approval

Supplier invoices and AP data from IMS Finance also sync to Xero via this integration.

## QuickBooks Online

1. Navigate to **Admin Console → Integrations → QuickBooks Online → Authorize**
2. Connect your QuickBooks company
3. Map IMS accounts to QuickBooks chart of accounts
4. Configure which IMS transactions sync (payroll journals, sales invoices, purchase invoices)

## Reconciliation

After each payroll period, run the reconciliation report: **IMS Payroll → Reports → Reconciliation** → compare IMS payroll totals with totals in the external system. Any discrepancies are highlighted for investigation.`,
  },
  {
    id: 'KB-IG-030',
    title: 'IMS REST API Overview & Integration Guide',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['integration', 'api', 'rest', 'developer'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# IMS REST API Overview & Integration Guide

## Overview

The IMS REST API allows external systems, custom applications, and automation tools to interact with IMS data programmatically. All major modules expose CRUD endpoints, enabling full read and write access for authorised integrations.

## Base URL

Your organisation's API base URL is found in **Admin Console → Settings → API → Base URL**. It follows the format \`https://yourcompany.ims.io/api/v1/\`.

## Authentication

### User Token (for user-context integrations)

\`\`\`
POST /api/auth/login
Body: { "email": "user@example.com", "password": "..." }
Response: { "data": { "accessToken": "..." } }
\`\`\`

Use the 'accessToken' as a Bearer token in subsequent requests: \`Authorization: Bearer [token]\`.

### API Key (for service-to-service integrations)

Generate an API key in **Admin Console → Settings → API Keys → New Key**. Select the scope (read-only, read-write, or specific modules) and set an expiry date. Use the API key as: \`Authorization: Bearer [api-key]\`.

## Available Endpoints

All major modules have list, get, create, update, and delete endpoints. For example:
- \`GET /api/v1/incidents\` — list incidents (paginated)
- \`POST /api/v1/incidents\` — create an incident
- \`GET /api/v1/incidents/{id}\` — get a specific incident

## Pagination

All list endpoints use cursor-based pagination. Pass \`?cursor=[cursor]&limit=[n]\` to paginate through results. The response includes a \`nextCursor\` field for the next page.

## Rate Limits

1,000 API requests per minute per organisation. Rate limit headers are included in every response: \`X-RateLimit-Remaining\` and \`X-RateLimit-Reset\`.

## Error Codes

Standard HTTP status codes are used. Error responses include a JSON body: \`{ "message": "...", "code": "..." }\`.

## SDKs and OpenAPI Specification

A JavaScript/TypeScript SDK is available via npm: 'ims-sdk'. The OpenAPI 3.0 specification is available for download from **Admin Console → Settings → API → Download OpenAPI Spec**, enabling code generation for any language.

## Webhook Support

Configure outgoing webhooks for event notifications in **Admin Console → Integrations → Webhooks**. Events include record creation, status changes, and threshold breaches across all modules.`,
  },
];
