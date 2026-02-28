import type { KBArticle } from '../types';

export const moduleDeepDives3Articles: KBArticle[] = [
  // ─── CMMS MODULE ───────────────────────────────────────────────────────────

  {
    id: 'KB-DD3-001',
    title: 'CMMS Day-to-Day User Guide',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['cmms', 'maintenance', 'assets', 'work-orders', 'technician'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# CMMS Day-to-Day User Guide

## Purpose

This guide covers the daily tasks performed by maintenance technicians and supervisors within the CMMS module. It explains how to navigate the module, manage work orders, and record completed maintenance activities.

## Navigating the CMMS Module

After logging in, navigate to **Maintenance > CMMS** from the left sidebar. The technician dashboard displays:

- **My Work Orders**: All work orders assigned to you, sorted by priority and due date.
- **Upcoming PMs**: Preventive maintenance tasks scheduled in the next 14 days.
- **Overdue Items**: Work orders past their target completion date.
- **Recent Completions**: Your last 10 closed work orders.

## Creating a Work Order

1. Click **New Work Order** from the dashboard or the Work Orders list.
2. Select the **Work Order Type**: Corrective, Preventive, Inspection, or Predictive.
3. Search for the **Asset** the work is being performed on.
4. Enter a clear **Description** of the problem or task required.
5. Set **Priority**: Critical, High, Medium, or Low.
6. Assign to a **Technician** or **Team**.
7. Set the **Target Completion Date**.
8. Click **Save** to create the work order. It enters **Created** status.

## Recording Labour Time and Parts

Open an assigned work order and click **Start Work** to move it to **In Progress**. As you work:

- **Labour**: Click **Add Labour Entry**, enter your time in hours/minutes and a brief description of work performed.
- **Parts**: Click **Add Parts Used**, search the spare parts catalogue, and enter the quantity consumed.

## Closing Work Orders with Evidence

Once work is complete:

1. Add a **Completion Note** describing what was done, root cause (if corrective), and any follow-up actions identified.
2. Attach **Evidence**: photos, readings, or reports via the attachment panel.
3. Click **Complete** to move the work order to the **Completed** state.
4. A supervisor or work order approver will then review and **Close** the work order.

## Mobile App Usage

The IMS mobile app allows technicians to manage work orders from the field:

- Scan asset **QR codes** to pull up the asset record and open work orders.
- Update work order status, add labour entries, and attach photos directly from the field.
- Works offline with sync when connectivity is restored.`,
  },

  {
    id: 'KB-DD3-002',
    title: 'Preventive Maintenance Scheduling',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['cmms', 'maintenance', 'assets', 'preventive-maintenance', 'scheduling'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Preventive Maintenance Scheduling

## Overview

Preventive maintenance (PM) schedules ensure equipment is maintained at regular intervals before failure occurs. The CMMS module supports multiple PM schedule types to match the needs of different equipment categories.

## Types of PM Schedules

**Time-Based (Calendar)**
Work orders are generated at fixed calendar intervals: daily, weekly, monthly, quarterly, semi-annually, or annually. Best suited for equipment where wear is primarily driven by elapsed time (e.g., fire suppression inspections).

**Meter/Usage-Based**
Work orders are triggered when a meter reading (hours, kilometres, cycles, units) reaches a defined threshold. Examples: oil change every 250 engine hours, conveyor belt inspection every 50,000 cycles.

**Condition-Based**
Work orders are created when a sensor reading or manual inspection result exceeds a defined threshold. Requires integration with monitoring data or manual condition input.

## Creating a PM Schedule in IMS

1. Navigate to **Maintenance > PM Schedules** and click **New PM Schedule**.
2. Select the **Asset** or asset group this schedule applies to.
3. Choose the **Schedule Type**: Time-Based, Meter-Based, or Condition-Based.
4. Enter the **Task Template**: standard tasks, checklist items, estimated labour hours, and required parts.
5. Set the **Frequency** or **Trigger Threshold**.
6. Assign a **Default Technician** or **Skill Group**.
7. Set **Lead Time**: how many days before the due date the work order is auto-generated.

## Auto-Generation of Work Orders

The IMS scheduler runs nightly and generates PM work orders for tasks due within the configured lead time. Generated work orders appear in the relevant technician's dashboard and in the PM calendar view.

## PM Calendar View

Navigate to **Maintenance > PM Calendar** to see all scheduled PMs visualised by week or month. Use filters to view by site, asset category, or technician.

## Adjusting PM Schedules

Review PM frequency using equipment history data. Navigate to the asset record, open **Maintenance History**, and analyse failure patterns. Adjust PM intervals accordingly to optimise the balance between over-maintenance cost and breakdown risk.`,
  },

  {
    id: 'KB-DD3-003',
    title: 'Work Order Management',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['cmms', 'maintenance', 'assets', 'work-orders', 'workflow'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Work Order Management

## Work Order Types

The CMMS supports four types of work orders:

- **Corrective**: Reactive repairs to restore failed or degraded equipment to service.
- **Preventive**: Scheduled maintenance tasks generated from PM schedules.
- **Predictive**: Maintenance triggered by condition monitoring data or sensor alerts.
- **Inspection**: Periodic asset inspections to assess condition without performing repair.

## Work Order Lifecycle

Work orders progress through the following statuses:

1. **Created**: Work order raised but not yet assigned.
2. **Assigned**: Allocated to a technician or team, pending start.
3. **In Progress**: Technician has begun the work.
4. **Pending Parts**: Work is paused waiting for spare parts to arrive.
5. **Completed**: Technician has finished and recorded completion details.
6. **Closed**: Supervisor or approver has reviewed and formally closed the work order.

## Priority Levels and SLA Response Times

| Priority | Response Time | Completion Target |
|----------|--------------|-------------------|
| Critical | 2 hours | 8 hours |
| High | 8 hours | 24 hours |
| Medium | 24 hours | 72 hours |
| Low | 72 hours | 14 days |

SLA breach alerts notify supervisors automatically when targets are at risk.

## Assigning Technicians and Teams

Work orders can be assigned to an individual technician or a maintenance team. The system checks technician availability and skill match against the work order requirements. Teams receive shared notifications for unassigned work orders in their queue.

## Parts Reservation and Consumption

When a work order is created, parts can be **reserved** from stock to prevent them being issued elsewhere. Upon completion, reserved parts are automatically **consumed** and stock levels updated.

## Cost Tracking

Each work order accumulates:
- **Labour Cost**: Technician hours × labour rate.
- **Parts Cost**: Parts consumed at their stock valuation cost.
- **Contractor Cost**: External labour invoices linked to the work order.

Total maintenance cost reports are available under **Maintenance > Reports > Cost Analysis**.`,
  },

  {
    id: 'KB-DD3-004',
    title: 'Asset & Equipment Registry in CMMS',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['cmms', 'maintenance', 'assets', 'equipment', 'registry'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Asset & Equipment Registry in CMMS

## Purpose

The asset registry is the foundation of the CMMS module. Every item of plant, equipment, or infrastructure that requires maintenance must be registered before work orders and PM schedules can be linked to it.

## Asset Registration Fields

When registering a new asset, capture:

- **Asset Name and Code**: Unique identifier for the asset within your organisation.
- **Make, Model, and Serial Number**: Manufacturer details for spare parts and warranty lookups.
- **Location**: Site, building, floor, and area (from the location hierarchy).
- **Criticality**: Critical, Essential, or General — determines maintenance priority.
- **Purchase Date and Warranty Expiry**: Enables warranty claim tracking.
- **Asset Category and Type**: Determines which PM schedule templates apply.
- **Responsible Department**: The business unit accountable for the asset.

## Asset Hierarchy

Assets are organised in a hierarchy: **Site > Building > System > Asset > Sub-Asset**. This structure allows:

- Viewing all assets at a location with a single click.
- Rolling up maintenance costs by building or system.
- Understanding failure impact (e.g., all assets on a cooling system).

## Linking Asset Documents

Attach key documents directly to the asset record:

- **Manuals**: Manufacturer operation and maintenance manuals.
- **Drawings**: Engineering drawings and P&IDs.
- **Certificates**: Pressure vessel certificates, calibration certificates, compliance certificates.

Documents are version-controlled and accessible from the mobile app during fieldwork.

## Asset History

The asset record shows a complete timeline of all maintenance activity:

- All work orders (corrective, preventive, inspection) against this asset.
- Meter readings history.
- Inspection results and condition records.
- Cost history: total maintenance spend to date.

## QR Code Labels

Generate and print QR code labels for each asset from the asset record. Scanning the QR code with the IMS mobile app opens the asset record immediately, allowing technicians to view history, open work orders, or log a new defect from the field.`,
  },

  {
    id: 'KB-DD3-005',
    title: 'Maintenance KPIs & OEE Dashboard',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['cmms', 'maintenance', 'assets', 'kpi', 'oee', 'dashboard'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Maintenance KPIs & OEE Dashboard

## Key CMMS Metrics

The CMMS module tracks and displays the following performance indicators:

**Mean Time Between Failures (MTBF)**
Average time between equipment failures. Higher MTBF indicates better reliability. Calculated per asset and asset category.

**Mean Time to Repair (MTTR)**
Average time taken to restore equipment to service after a failure. Lower MTTR indicates faster response and repair capability.

**PM Compliance Rate**
Percentage of scheduled preventive maintenance tasks completed on time. Target is typically 95% or above. Overdue PM tasks are highlighted in the dashboard.

**Maintenance Backlog**
Total estimated hours of outstanding (open) corrective work orders. A growing backlog may indicate insufficient resources or rising equipment failure rates.

**Cost per Work Order**
Average total cost (labour + parts + contractors) per work order closed. Useful for benchmarking and budget forecasting.

**Planned vs Unplanned Maintenance Ratio**
Percentage of maintenance hours spent on planned (PM) vs reactive (corrective) work. Best-practice targets are 80% planned, 20% unplanned.

## Overall Equipment Effectiveness (OEE)

OEE measures how effectively equipment is utilised. It is calculated as:

**OEE = Availability x Performance x Quality**

- **Availability**: Actual run time as a proportion of planned production time.
- **Performance**: Actual output rate vs the ideal rate.
- **Quality**: Good units produced as a proportion of total units started.

OEE data is entered manually or pulled from production systems. The OEE dashboard shows trends by equipment, line, and shift.

## CMMS Dashboard Configuration

Navigate to **Maintenance > Dashboard > Customise** to:

- Select which KPIs to display.
- Set date range filters (rolling 30 days, quarter, year).
- Configure site or asset category filters.
- Set KPI targets and thresholds for RAG colour coding.

## Maintenance Cost Reports

Access detailed cost reports under **Maintenance > Reports**. Export to Excel or PDF for management review presentations.`,
  },

  {
    id: 'KB-DD3-006',
    title: 'Spare Parts & Inventory Management',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['cmms', 'maintenance', 'assets', 'spare-parts', 'inventory'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Spare Parts & Inventory Management

## Spare Parts Catalogue

The CMMS spare parts catalogue holds all items that may be required for maintenance activities. Each part record includes:

- **Part Number and Description**: Unique identifier and plain-language description.
- **Specifications**: Technical specifications (dimensions, material grade, ratings).
- **Approved Suppliers**: One or more suppliers who can supply this part.
- **Unit of Measure**: Each, box, metre, litre, etc.
- **Current Stock Level and Location**: Where the part is stored in the warehouse.

## Minimum Stock Levels and Reorder Points

For critical spare parts, set:

- **Minimum Level**: The lowest acceptable quantity. Triggers a low-stock alert.
- **Reorder Point**: The quantity at which a replenishment purchase order should be raised.
- **Maximum Level**: The upper storage limit to avoid overstocking.

Navigate to the part record and update these thresholds under **Stock Control Settings**.

## Stock Movements

All inventory movements are recorded with full traceability:

- **Receive**: Goods received from a supplier against a purchase order.
- **Issue**: Parts issued to a work order, consumed from stock.
- **Transfer**: Moving parts between storage locations or stores.
- **Adjust**: Manual correction following a stocktake discrepancy.

## Linking Parts to Work Orders

When creating or updating a work order, technicians can:

1. Search the spare parts catalogue and **reserve** required parts before starting work.
2. On completion, confirm actual parts **consumed** (quantities may differ from reserved).
3. Stock levels update automatically when the work order is completed.

## Stock Valuation Methods

The CMMS supports two valuation methods configured at the organisation level:

- **FIFO (First In, First Out)**: Oldest stock costs are used first.
- **Weighted Average Cost (WAC)**: Each issue uses the running average unit cost.

## Spare Parts Consumption Analysis

Navigate to **Maintenance > Reports > Spare Parts Analysis** to view:

- Top consumed parts by value and frequency.
- Parts with no movement in 12+ months (obsolescence candidates).
- Parts with frequent stockouts (candidates for higher reorder points).`,
  },

  {
    id: 'KB-DD3-007',
    title: 'CMMS Administrator Configuration Guide',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['cmms', 'maintenance', 'assets', 'admin', 'configuration'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# CMMS Administrator Configuration Guide

## Purpose

This guide is for CMMS administrators responsible for initial configuration and ongoing system management. It covers location hierarchy setup, work order configuration, technician management, and module integration.

## Setting Up the Location Hierarchy

Before assets can be registered, the location hierarchy must be configured:

1. Navigate to **Settings > CMMS > Locations**.
2. Create **Sites** (top level): your physical locations or facilities.
3. Under each site, add **Buildings** or zones.
4. Under buildings, add **Floors** and **Areas**.
5. Assign a location code and description to each node.

The hierarchy appears throughout the CMMS to filter assets and work orders by location.

## Equipment Categories and Types

Define the taxonomy for your asset types:

- Navigate to **Settings > CMMS > Equipment Categories**.
- Create broad **Categories**: Mechanical, Electrical, HVAC, Fire Systems, IT, etc.
- Under each category, create **Types**: Pump, Motor, Compressor, Panel, etc.
- Attach default PM schedule templates to each type for automatic scheduling when new assets are registered.

## Work Order Priority and SLA Settings

Customise the SLA response and completion times for each priority level:

- Navigate to **Settings > CMMS > SLA Configuration**.
- Adjust response and completion targets for Critical, High, Medium, and Low priorities.
- Configure escalation rules: who is notified when an SLA is at risk or breached.

## Technician Skills and Certification Matrix

- Navigate to **Settings > CMMS > Skills**.
- Define skill types: Electrical, Mechanical, HVAC, Confined Space, etc.
- On each technician's profile, assign their certified skills.
- When creating a work order, specify required skills and the system filters eligible assignees.

## Notification Rules

Configure automated notifications under **Settings > CMMS > Notifications**:

- Overdue PM alerts to the maintenance supervisor.
- SLA breach warnings at 80% of the target elapsed time.
- Parts below reorder point alerts to the stores manager.
- New work order assignment notifications to technicians.

## Module Integration Settings

- **Assets Module**: Sync asset records from the Assets module to CMMS.
- **H&S Module**: Link work orders to permit-to-work requirements for high-risk tasks.
- **Finance Module**: Map maintenance cost centres for work order cost reporting.
- **Inventory Module**: Link spare parts catalogue to the Inventory module stock records.`,
  },

  {
    id: 'KB-DD3-008',
    title: 'Maintenance Management Best Practices',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['cmms', 'maintenance', 'assets', 'best-practices', 'strategy'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Maintenance Management Best Practices

## Moving from Reactive to Proactive Maintenance

Most organisations start maintenance programmes in reactive mode — fixing things when they break. The goal is to shift the strategy profile towards predominantly planned, proactive maintenance:

- **Reactive (Run-to-Failure)**: Appropriate only for non-critical, easily replaced assets.
- **Preventive (Scheduled)**: Regular maintenance based on time or usage — the CMMS core.
- **Predictive (Condition-Based)**: Maintenance triggered by real condition data, maximising intervals.
- **Prescriptive**: AI-driven recommendations for maintenance actions — future roadmap.

Aim for a target of 80% planned maintenance and 20% or less unplanned reactive maintenance.

## Reliability-Centred Maintenance (RCM) Principles

RCM asks: "What must the equipment do, and what happens when it fails?" For critical assets:

1. Define the **function** the asset must perform.
2. Identify **functional failures**: how the asset could fail to perform its function.
3. Determine **failure modes** and their effects.
4. Select the **maintenance task** that addresses the failure mode (PM, inspection, or design change).

Use CMMS failure data to validate or challenge RCM-derived PM intervals over time.

## Optimising PM Intervals Using Equipment History

Navigate to **Asset > Maintenance History** to review the pattern of failures before and after PM tasks. If failures are occurring well before the next scheduled PM, consider shortening the interval. If no failures occur and condition is always excellent at PM time, consider lengthening the interval to reduce maintenance cost.

## Total Productive Maintenance (TPM) Overview

TPM involves operators in basic maintenance activities — cleaning, lubricating, and visual inspection. Integrating operator-performed tasks into CMMS work orders extends the reach of the maintenance programme.

## Critical Spare Parts Identification

Review CMMS failure data and maintenance history to identify parts whose absence would cause extended production downtime. Classify these as **critical spares** and set a zero-stockout policy with a dedicated holding quantity.

## Using CMMS Data in Management Review

Prepare a quarterly maintenance performance summary for management review covering: MTBF and MTTR trends, PM compliance, maintenance cost vs budget, top failure modes, and action plans for improvement.`,
  },

  // ─── INFORMATION SECURITY MODULE ───────────────────────────────────────────

  {
    id: 'KB-DD3-009',
    title: 'Information Security Day-to-Day User Guide',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['infosec', 'iso-27001', 'cybersecurity', 'security', 'user-guide'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Information Security Day-to-Day User Guide

## Purpose

This guide covers the daily tasks performed by information security team members, asset owners, and system users within the InfoSec module. It explains how to navigate the security dashboard, review alerts, and submit security incidents.

## Security Dashboard Overview

After logging in, navigate to **Information Security** from the left sidebar. The dashboard displays:

- **Open Risks**: Count of open information security risks, broken down by rating (Critical, High, Medium, Low).
- **Recent Security Incidents**: Last 10 security incidents and their current status.
- **Control Effectiveness**: Percentage of controls rated as effective, partially effective, or ineffective.
- **Access Review Due**: Assets and systems with access reviews overdue or due in the next 30 days.
- **Audit Schedule**: Next planned internal audit and days until it occurs.

## Daily Security Activities

**For Security Team Members:**

- Review any new **security alerts** from integrated monitoring tools.
- Check the **risk register** for risks approaching review dates.
- Process pending **access requests**: approve or reject based on least privilege principles.
- Review any new **security incident** submissions for triage and classification.

**For Asset Owners:**

- Review the **asset classification status** of assets in your ownership.
- Approve or reject **access requests** for systems you own.
- Complete any outstanding **access review** tasks.

**For All Users:**

- Complete assigned **security awareness** tasks and training modules.
- Report security concerns promptly using the incident submission form.

## Submitting a Security Incident or Near Miss

1. Navigate to **Information Security > Incidents > New Incident**.
2. Select the **Incident Type**: Data Breach, Phishing, Malware, Insider Threat, Unauthorised Access, Other.
3. Provide a **Description** of what occurred, when, and what systems or data were involved.
4. Indicate whether this is an **Actual Incident** or a **Near Miss**.
5. The security team will triage and respond within the SLA for the severity level.`,
  },

  {
    id: 'KB-DD3-010',
    title: 'Information Asset Classification & Management',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['infosec', 'iso-27001', 'cybersecurity', 'asset-classification', 'data-governance'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Information Asset Classification & Management

## Purpose

ISO 27001 requires organisations to identify information assets and classify them by the sensitivity and importance of the information they hold or process. This guide explains how to build and maintain the information asset register in IMS.

## Information Asset Types

Assets are classified into the following categories in IMS:

- **Hardware**: Servers, laptops, mobile devices, networking equipment, storage devices.
- **Software**: Applications, databases, operating systems, cloud services (SaaS).
- **Data**: Databases, files, documents, backups — the information itself.
- **Services**: IT services, cloud infrastructure, third-party services processing your data.
- **People**: Employees and contractors with access to critical systems.
- **Facilities**: Data centres, server rooms, and offices housing IT equipment.

## Asset Register Fields

For each asset, record:

- **Asset Owner**: The person responsible for the confidentiality and integrity of the asset.
- **Asset Custodian**: The person or team responsible for day-to-day management (may differ from owner).
- **Classification Level**: See below.
- **Location**: Physical or logical location.
- **Associated Risks**: Risks from the InfoSec risk register linked to this asset.

## Data Classification Levels

| Level | Description | Examples |
|-------|-------------|---------|
| Public | Freely shareable, no harm if disclosed | Marketing materials, public website |
| Internal | For employee use, not for public disclosure | Internal policies, org charts |
| Confidential | Business sensitive, restricted sharing | Customer data, financial reports, contracts |
| Restricted | Highest sensitivity, very limited access | Board papers, passwords, personal health data |

## Handling Requirements by Classification

Each classification level has defined handling rules covering: storage, transmission, printing, access, sharing, disposal, and labelling. These rules are documented in your **Information Handling Policy** and linked in IMS.

## Asset Register Review Cycle

The asset register must be reviewed at least annually. Asset owners receive an automated review notification. During review, owners confirm: asset details are accurate, classification is still appropriate, and linked risks remain valid.`,
  },

  {
    id: 'KB-DD3-011',
    title: 'Information Security Risk Assessment (ISO 27001)',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['infosec', 'iso-27001', 'cybersecurity', 'risk-assessment', 'soa'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Information Security Risk Assessment (ISO 27001)

## Overview

ISO 27001 requires a structured risk assessment process to identify, analyse, and evaluate information security risks. The InfoSec module provides a risk register aligned with the asset-based risk assessment approach.

## Risk Assessment Methodology

IMS uses the following asset-based approach:

1. **Asset Identification**: Select the information asset at risk.
2. **Threat Identification**: What could harm this asset? (e.g., ransomware, insider misuse, physical theft, system failure).
3. **Vulnerability Identification**: What weakness could be exploited? (e.g., unpatched software, weak passwords, lack of encryption).
4. **Likelihood Scoring**: Rate the probability of the threat exploiting the vulnerability on a 1–5 scale.
5. **Impact Scoring**: Rate the impact on confidentiality, integrity, and availability on a 1–5 scale.
6. **Risk Score**: Likelihood x Impact = Raw Risk Score (1–25).

## Risk Rating Thresholds

| Score | Rating | Action Required |
|-------|--------|----------------|
| 1–4 | Low | Accept or monitor |
| 5–9 | Medium | Treat within 90 days |
| 10–16 | High | Treat within 30 days |
| 17–25 | Critical | Immediate treatment required |

## Risk Acceptance Criteria

Your organisation's **risk acceptance criteria** defines the maximum risk level that can be accepted without further treatment. Risks above this threshold must have an active treatment plan. Set risk acceptance criteria under **Settings > InfoSec > Risk Configuration**.

## Statement of Applicability (SoA)

The SoA maps all ISO 27001:2022 Annex A controls to your organisation:

- **Applicable / Not Applicable**: Whether each control applies to your context.
- **Implemented**: Whether the control is currently in place.
- **Justification**: Rationale for inclusion or exclusion.
- **Evidence Links**: Policies, procedures, or system configurations that demonstrate implementation.

Navigate to **Information Security > Statement of Applicability** to manage the SoA.

## Risk Treatment Options

For each risk above the acceptance threshold, select a treatment:

- **Apply Control**: Implement an Annex A control to reduce likelihood or impact.
- **Accept**: Document formal risk acceptance by an authorised manager.
- **Transfer**: Purchase insurance or outsource the risk.
- **Avoid**: Discontinue the activity creating the risk.

## Risk Register Review Frequency

Risks are reviewed at least annually and whenever a significant change occurs (new system, new threat intelligence, security incident). Risk owners receive automated review reminders.`,
  },

  {
    id: 'KB-DD3-012',
    title: 'Security Controls Implementation Guide',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['infosec', 'iso-27001', 'cybersecurity', 'controls', 'annex-a'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Security Controls Implementation Guide

## ISO 27001:2022 Annex A Control Categories

ISO 27001:2022 organises 93 controls across four themes:

- **Organisational Controls (37)**: Policies, procedures, roles, supplier relationships, information classification.
- **People Controls (8)**: Screening, terms of employment, security awareness, disciplinary process.
- **Physical Controls (14)**: Physical security perimeters, equipment security, clean desk policy.
- **Technological Controls (34)**: Access control, cryptography, malware protection, logging, vulnerability management.

## Implementing Controls in IMS

For each applicable control in the Statement of Applicability:

1. Navigate to **Information Security > Controls**.
2. Open the control and click **Edit**.
3. Set the **Implementation Status**: Not Started, In Progress, Implemented.
4. Link the relevant **Policy Document** from the Document Control module.
5. Link the relevant **Procedure** that operationalises the control.
6. Assign a **Control Owner** responsible for maintaining the control.

## Control Effectiveness Assessment

Each control is assessed on two dimensions:

- **Design Effectiveness**: Is the control well-designed to mitigate the target risk? (Yes / Partial / No)
- **Operating Effectiveness**: Is the control actually operating as designed? (Yes / Partial / No)

A control is only rated **Effective** when both design and operating effectiveness are confirmed.

## Control Testing and Evidence Collection

Controls are tested on a defined schedule (typically annually for key controls). For each test:

1. Define the **Test Procedure**: what to check and how.
2. Execute the test and document **Test Results**.
3. Attach **Evidence**: screenshots, logs, reports, or interview notes.
4. Record the test outcome and any exceptions found.

Exceptions become **Control Weaknesses** and feed into the corrective action process.

## Control Owner Responsibilities

Control owners are responsible for:

- Ensuring the control is maintained and operating as designed.
- Completing control effectiveness self-assessments when due.
- Escalating issues that prevent the control from operating effectively.
- Providing evidence during internal and external audits.

## Compensating Controls

Where an Annex A control cannot be fully implemented (e.g., due to technical constraints), a compensating control may be documented. This must be formally approved and reviewed annually to ensure it remains adequate.`,
  },

  {
    id: 'KB-DD3-013',
    title: 'Information Security Incident Response',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['infosec', 'iso-27001', 'cybersecurity', 'incident-response', 'data-breach'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Information Security Incident Response

## Security Incident Types

The InfoSec module handles the following security incident types:

- **Data Breach**: Unauthorised disclosure, access, or acquisition of personal or sensitive data.
- **Ransomware**: Malicious encryption of organisational data by threat actors.
- **Phishing**: Deceptive email or communication designed to steal credentials or deliver malware.
- **Insider Threat**: Malicious or negligent actions by employees, contractors, or third parties.
- **System Compromise**: Unauthorised access or control of IT systems or infrastructure.
- **Physical Security Breach**: Unauthorised physical access to premises or equipment.

## Incident Response Phases

### 1. Detect
Security alerts, user reports, or monitoring tools identify a potential incident. All reports are logged in the InfoSec module incident register.

### 2. Contain
Immediate actions to limit the spread or impact of the incident: isolating affected systems, disabling compromised accounts, blocking malicious IP addresses.

### 3. Eradicate
Removing the root cause: patching vulnerabilities, removing malware, resetting compromised credentials, closing unauthorised access paths.

### 4. Recover
Restoring systems and data to normal operation from verified clean backups. Monitoring for recurrence.

### 5. Lessons Learned
Post-incident review within 5 business days: what happened, root cause, timeline, effectiveness of response, and actions to prevent recurrence.

## Severity Classification

| Severity | Criteria | Response SLA |
|----------|---------|--------------|
| Critical | Mass data breach, ransomware, system-wide compromise | 1 hour |
| High | Confirmed breach, significant data exposure | 4 hours |
| Medium | Suspected breach, limited scope | 24 hours |
| Low | Near miss, isolated phishing attempt | 72 hours |

## GDPR 72-Hour Breach Notification

For incidents involving personal data, assess whether the breach is notifiable to the supervisory authority (ICO in the UK) within 72 hours. IMS tracks the incident discovery time and provides a notification deadline countdown.

## Evidence Preservation

Do not modify, delete, or overwrite systems involved in a potential security incident before evidence is preserved. Log all actions taken with timestamps for forensic purposes. IMS incident records are tamper-evident.

## CAPA Linkage

All security incidents above Low severity must generate a corrective action (CAPA) to address the root cause and prevent recurrence. Link CAPAs directly from the incident record.`,
  },

  {
    id: 'KB-DD3-014',
    title: 'Access Management & Identity Governance',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['infosec', 'iso-27001', 'cybersecurity', 'access-management', 'identity'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Access Management & Identity Governance

## Access Management Principles

Effective access management is built on three core principles:

- **Least Privilege**: Users are granted only the access rights necessary for their role. No more.
- **Need-to-Know**: Access to sensitive data is limited to those with a legitimate business need.
- **Segregation of Duties**: No single user should have access rights that allow them to perform and conceal a fraudulent or erroneous action without detection.

## Joiners, Movers, Leavers Process

IMS supports the full identity lifecycle:

- **Joiners**: When a new employee or contractor starts, HR or IT raises an access request in IMS. The system routes approval to the appropriate system owners. Access is provisioned once approved.
- **Movers**: When an employee changes role, access requests are raised for new system access, and a review is triggered for existing access that may no longer be appropriate.
- **Leavers**: When an employee or contractor leaves, HR triggers a leaver workflow. All access rights are revoked within the defined timeframe (same day for dismissals, end of last working day for resignations).

## Periodic Access Review

Quarterly access reviews are scheduled automatically for all systems classified as Confidential or Restricted. System owners receive a list of current user access rights and must confirm:

- **Confirm**: The user still requires this level of access.
- **Modify**: The user's access should be changed (e.g., reduced permissions).
- **Revoke**: The user no longer requires this access.

Access review completion is tracked in the InfoSec dashboard. Overdue reviews generate escalation alerts.

## Privileged Access Management

Administrative and privileged accounts require enhanced controls:

- Privileged accounts must be separate from standard user accounts.
- All privileged access sessions are logged.
- Privileged passwords must meet complexity requirements and be rotated regularly.
- Shared administrative accounts must be documented with a named custodian.

## Service Account Management

Service accounts used by applications and automated processes must be:

- Documented in the information asset register.
- Assigned to a named custodian responsible for the account.
- Subject to password rotation on a defined schedule.
- Reviewed annually to confirm they are still required.

## Multi-Factor Authentication

MFA is required for all access to systems classified Confidential or higher, and for all remote access. MFA configuration is managed through **Settings > InfoSec > Authentication Policy**. Exemptions require formal risk acceptance by the CISO.`,
  },

  {
    id: 'KB-DD3-015',
    title: 'Information Security Reporting & Dashboard',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['infosec', 'iso-27001', 'cybersecurity', 'reporting', 'dashboard', 'kpi'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Information Security Reporting & Dashboard

## Security KPIs

The InfoSec module tracks the following key performance indicators:

| KPI | Description | Target |
|-----|-------------|--------|
| Open High/Critical Risks | Number of unresolved high or critical risks | < 5 |
| Overdue Risk Treatments | Risk treatment actions past their due date | 0 |
| Control Effectiveness % | Percentage of controls rated effective | > 90% |
| Security Incidents (MTD) | Security incidents raised this month | Trend down |
| Phishing Test Pass Rate | Percentage of staff passing simulated phishing tests | > 95% |
| Access Review Completion | Quarterly access reviews completed on time | 100% |
| SoA Completeness | Percentage of applicable controls with evidence | 100% |

## ISMS Dashboard

The ISMS (Information Security Management System) dashboard provides a real-time view of:

- **Scope Summary**: ISMS scope statement and covered assets.
- **Risk Register Status**: Total risks by rating, open treatments by due date.
- **Audit Schedule**: Upcoming internal audits and their status.
- **Objective Progress**: Security objectives and achievement percentage.
- **Incident Trend**: 12-month rolling trend of security incidents by severity.

## Monthly CISO Report

Generate the monthly security report for senior management:

1. Navigate to **Information Security > Reports > Monthly CISO Report**.
2. Select the **Reporting Period** (previous month).
3. Click **Generate**. The system auto-populates all KPI data.
4. Add the **CISO Commentary** in the narrative sections.
5. Review and **Publish** to distribute to stakeholders.

## Compliance Dashboard

The compliance dashboard shows the status of ISO 27001 compliance across all 93 Annex A controls:

- Green: Control implemented and effective.
- Amber: Control implemented but effectiveness not confirmed.
- Red: Control not implemented or ineffective.

Use the compliance dashboard to prepare for internal and certification audits.

## Incident Trend Analysis

Navigate to **Information Security > Reports > Incident Trends** to view:

- Incidents by type, severity, and month.
- Average time to contain and resolve incidents.
- Recurring incident patterns indicating systemic weaknesses.
- Comparison against industry baseline data.`,
  },

  {
    id: 'KB-DD3-016',
    title: 'ISO 27001 Compliance & Certification Guide',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['infosec', 'iso-27001', 'cybersecurity', 'certification', 'compliance'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# ISO 27001 Compliance & Certification Guide

## The ISO 27001:2022 Certification Journey

Achieving ISO 27001 certification follows a structured path. IMS supports each stage:

### Stage 1: Gap Assessment
Benchmark current practices against ISO 27001:2022 requirements. IMS provides a gap assessment checklist covering all clauses and Annex A controls. Identify gaps and prioritise remediation.

### Stage 2: ISMS Design
Define the ISMS scope, information security policy, and risk assessment methodology. Establish the Statement of Applicability. Document the information asset register.

### Stage 3: Implementation
Implement required controls, train staff, and establish procedures. Use IMS to manage risks, controls, incidents, and access reviews.

### Stage 4: Internal Audit
Conduct an internal audit of the ISMS against all ISO 27001 requirements. Log findings as non-conformances or observations in IMS. Close out all findings before the Stage 1 external audit.

### Stage 5: Certification Audit (Stage 1 + Stage 2)
The certification body conducts a documentation review (Stage 1) followed by an on-site audit of implementation evidence (Stage 2). IMS generates audit-ready evidence packs.

### Stage 6: Surveillance Audits
After certification, annual surveillance audits verify ongoing compliance. Recertification occurs every three years.

## Required Documented Information

ISO 27001 mandates the following documents and records. IMS manages all of these:

- ISMS Scope Statement
- Information Security Policy
- Risk Assessment Process and Results
- Statement of Applicability
- Information Security Objectives
- Risk Treatment Plan
- Competence Records
- Operational Planning Records
- Monitoring and Measurement Results
- Internal Audit Results and Programme
- Management Review Records
- Non-Conformity and Corrective Action Records

## Common ISO 27001 Non-Conformances

From audit experience, the most common non-conformances are:

- Incomplete Statement of Applicability — controls listed as applicable but no evidence of implementation.
- Asset register not maintained — new assets not added, owners not assigned.
- Access reviews not completed — quarterly reviews overdue for multiple systems.
- Risk register not reviewed — risks not reviewed after significant changes.
- Internal audit findings not closed — corrective actions outstanding past due dates.
- Management review inputs incomplete — not all required inputs covered.

IMS automated reminders and dashboard alerts are specifically designed to prevent these common failures.`,
  },

  // ─── ESG REPORTING MODULE ──────────────────────────────────────────────────

  {
    id: 'KB-DD3-017',
    title: 'ESG Reporting Day-to-Day User Guide',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['esg', 'sustainability', 'reporting', 'ghg', 'user-guide'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# ESG Reporting Day-to-Day User Guide

## Purpose

This guide covers the daily and periodic data entry tasks performed by ESG data owners, sustainability managers, and department representatives within the ESG Reporting module.

## ESG Dashboard Overview

Navigate to **ESG Reporting** from the left sidebar. The dashboard displays:

- **GHG Emissions**: Scope 1, 2, and 3 emissions for the current year vs target and prior year.
- **Social Metrics**: Key social indicators — safety rates, diversity ratios, training hours.
- **Governance Metrics**: Board composition, ethics incidents, compliance status.
- **Data Completeness Tracker**: Percentage of required data fields populated for the current reporting period.
- **Target Progress**: RAG status for each material ESG topic against annual targets.

## Entering GHG Emissions Data

1. Navigate to **ESG Reporting > Environmental > GHG Emissions**.
2. Select the **Reporting Period** (month, quarter, or year).
3. Select the **Emission Source**: Fleet (Scope 1), Gas Heating (Scope 1), Purchased Electricity (Scope 2), Business Travel (Scope 3), etc.
4. Enter the **Activity Data**: quantity of fuel used, kilometres travelled, kWh consumed, etc.
5. The system applies the relevant **Emission Factor** automatically to calculate CO2 equivalent (CO2e).
6. Click **Save**. The entry is recorded with your name, date, and time for audit purposes.

## Social Metrics Data Entry

Navigate to **ESG Reporting > Social** to enter:

- **Workforce Diversity**: Total headcount, gender split, age band distribution, ethnicity data (where collected).
- **Safety Statistics**: Lost time injuries (LTIs), total recordable incidents, fatalities, near misses — pulled automatically from the H&S module.
- **Training Hours**: Total training hours by employee category — pulled from the Training module.
- **Community Investment**: Value of community investment, volunteering hours, charitable donations.

## Governance Metrics Data Entry

Navigate to **ESG Reporting > Governance** to enter or confirm:

- **Board Composition**: Total board members, independence ratio, gender diversity, tenure data.
- **Ethics Incidents**: Number of ethics hotline reports, substantiated cases, disciplinary outcomes.
- **Anti-Bribery Cases**: Cases investigated and outcome.

## Data Quality Review Workflow

After data entry, the ESG Manager reviews each data point. Status flows: **Draft → Under Review → Verified**. Only verified data is included in official ESG reports.`,
  },

  {
    id: 'KB-DD3-018',
    title: 'GHG Emissions Tracking (Scope 1, 2 & 3)',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['esg', 'sustainability', 'reporting', 'ghg', 'emissions', 'carbon'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# GHG Emissions Tracking (Scope 1, 2 & 3)

## Scope Definitions

The GHG Protocol defines three scopes for emissions accounting:

**Scope 1 — Direct Emissions**
Emissions from sources owned or controlled by the organisation. Examples: combustion of natural gas in boilers, fuel consumed by company-owned vehicles, refrigerant leaks (fugitive emissions).

**Scope 2 — Indirect Energy Emissions**
Emissions from the generation of purchased electricity, heat, steam, or cooling consumed by the organisation. Two methods: location-based (grid average factors) and market-based (supplier-specific factors, RECs).

**Scope 3 — Value Chain Emissions**
All other indirect emissions in the organisation's value chain. 15 categories defined by the GHG Protocol, including: purchased goods and services, business travel, employee commuting, waste, capital goods, and product use and disposal.

## Emission Sources in IMS

Common emission sources configured in the ESG module:

| Source | Scope | Activity Data Unit |
|--------|-------|-------------------|
| Natural gas (boilers) | Scope 1 | m3 or kWh |
| Company fleet (petrol/diesel) | Scope 1 | litres or km |
| Refrigerants (leaks) | Scope 1 | kg of refrigerant |
| Purchased electricity | Scope 2 | kWh |
| Business air travel | Scope 3 | passenger-km |
| Purchased goods and services | Scope 3 | spend (£) |
| Waste to landfill | Scope 3 | tonnes |

## Emission Factors

IMS includes a built-in library of emission factors sourced from IPCC, DEFRA (UK), EPA (US), and other authoritative sources, maintained in the '@ims/emission-factors' package. Factors are updated annually. You can also upload custom emission factors for specific suppliers or processes under **Settings > ESG > Emission Factors**.

## GHG Inventory Report

Navigate to **ESG Reporting > Reports > GHG Inventory** to generate the organisation's annual GHG inventory report. The report breaks down emissions by scope, source, and site.

## Net Zero Pathway Tracking

Set net zero targets and reduction milestones under **ESG Reporting > Targets**. The dashboard visualises your emissions trajectory against a net zero pathway, showing whether current trends are on track.

## Carbon Offset Management

Record purchased carbon offsets (verified by Gold Standard, VCS, etc.) under **ESG Reporting > Carbon Offsets**. Offsets are subtracted from gross emissions to calculate net emissions in the GHG inventory report.`,
  },

  {
    id: 'KB-DD3-019',
    title: 'Social & Governance Metrics Management',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['esg', 'sustainability', 'reporting', 'social', 'governance', 'dei'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Social & Governance Metrics Management

## Social Metrics

The ESG module tracks a comprehensive set of social performance metrics. Where data is available in linked IMS modules, it is pulled automatically.

### Workforce Metrics (from HR Module)

- **Total Headcount**: Permanent, fixed-term, and contractor headcount by gender, age band, and employment type.
- **Gender Diversity**: Percentage of women in total workforce, management, senior leadership, and board.
- **Ethnicity Data**: Collected where legally permitted and employees consent to disclose.
- **Pay Gap Reporting**: Gender pay gap (mean and median) where applicable.
- **Living Wage Compliance**: Percentage of workforce paid at or above the living wage.

### Safety Metrics (from H&S Module)

- **Lost Time Injury Frequency Rate (LTIFR)**: Lost time injuries per million hours worked.
- **Total Recordable Incident Rate (TRIFR)**: All recordable incidents per million hours worked.
- **Fatalities**: Total work-related fatalities (target: zero).
- **Near Misses**: Total near miss reports (higher reporting indicates positive safety culture).

### Training and Development (from Training Module)

- **Average Training Hours per Employee**: Total training hours ÷ average headcount.
- **Training Investment**: Total spend on employee learning and development.
- **Mandatory Training Completion Rate**: Percentage of employees current on required training.

### Community Metrics

- **Community Investment Value**: Cash donations, employee volunteering (valued at day rate), in-kind contributions.
- **Volunteering Hours**: Total hours volunteered by employees during working time.

## Governance Metrics

### Board Metrics

- **Board Independence**: Percentage of board members who are independent non-executive directors.
- **Board Gender Diversity**: Percentage of women on the board.
- **Audit Committee Composition**: Number of members with relevant financial expertise.

### Ethics and Conduct

- **Ethics Hotline Reports**: Total reports received, categorised by type.
- **Substantiated Cases**: Cases investigated and confirmed as policy violations.
- **Anti-Bribery Cases**: Anti-Corruption Act or FCPA-relevant cases.
- **Executive Pay Ratio**: CEO total remuneration divided by median employee pay.

## Data Integration Points

Social and governance data is pulled automatically from: HR (headcount, diversity, pay), H&S (safety rates), Training (hours, completion), and Finance (community investment, pay ratio). Data not available in IMS modules is entered manually with supporting evidence attached.`,
  },

  {
    id: 'KB-DD3-020',
    title: 'ESG Data Collection & Verification',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['esg', 'sustainability', 'reporting', 'data-collection', 'verification'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# ESG Data Collection & Verification

## Data Collection Cycle

ESG data is collected at two frequencies:

**Quarterly Operational Data**
Environmental metrics (energy, waste, emissions), safety statistics, and headcount data are collected quarterly. Quarterly data allows early identification of trends and corrective action before the year-end.

**Annual Disclosure Data**
The full ESG dataset — including all social, governance, and detailed environmental metrics — is compiled annually for external disclosure. Annual data undergoes more rigorous verification before publication.

## Automated Data Collection

Where IMS modules capture the underlying data, ESG metrics are pulled automatically:

- GHG Scope 1/2 data: from Energy Management module meter readings.
- Safety rates: from H&S incident records.
- Training hours: from Training module completion records.
- Community investment: from Finance module tagged expenditure codes.

Automated pulls are scheduled monthly and can be triggered manually by the ESG Manager.

## Manual Data Entry

For data not available in linked IMS modules (third-party data, supply chain data):

1. Navigate to **ESG Reporting > Data Collection > Manual Entry**.
2. Select the **Metric**, **Period**, and **Reporting Entity**.
3. Enter the value and **attach supporting evidence** (utility bills, supplier certificates, audit reports).
4. Click **Submit for Review**.

## Data Quality Checks

IMS applies automated data quality checks to all ESG data:

- **Completeness**: Flags required fields with no data entered.
- **Reasonableness**: Flags values that are significantly above or below the prior year (> 25% change triggers a review flag).
- **Consistency**: Cross-checks data between modules (e.g., safety hours from H&S vs hours in HR).

## Verification Workflow

All ESG data follows a five-step verification process:

1. **Draft**: Data entered by the data collector.
2. **Submitted**: Data collector marks entry as complete and submits for review.
3. **Under Review**: Data owner reviews for accuracy and completeness.
4. **Approved**: Data owner approves; data is locked for the period.
5. **Externally Verified**: External assurance provider has reviewed and issued an opinion (for assured data only).

## Materiality Assessment Documentation

The materiality assessment determines which ESG topics are most important to your stakeholders and your business. Document the materiality assessment outcomes under **ESG Reporting > Materiality**. Material topics drive which metrics are disclosed and which targets are set.`,
  },

  {
    id: 'KB-DD3-021',
    title: 'ESG Disclosure Frameworks Guide',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['esg', 'sustainability', 'reporting', 'gri', 'tcfd', 'csrd', 'frameworks'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# ESG Disclosure Frameworks Guide

## Overview

Multiple ESG disclosure frameworks exist globally. The IMS ESG module maps your data to the most widely used frameworks, reducing the effort of multi-framework reporting.

## GRI Standards

The Global Reporting Initiative (GRI) Standards are the most widely used sustainability reporting framework globally.

- **GRI Universal Standards** (GRI 1, 2, 3): Applicable to all organisations — covers reporting principles, general disclosures, and material topic determination.
- **GRI Topic Standards**: Topic-specific disclosures (e.g., GRI 305 for Emissions, GRI 403 for OHS, GRI 401 for Employment).

IMS maps all collected ESG metrics to their relevant GRI disclosure numbers, generating a GRI content index automatically.

## TCFD Framework

The Task Force on Climate-related Financial Disclosures (TCFD) framework is increasingly mandated by regulators. It structures disclosure across four pillars:

- **Governance**: How does the board oversee climate risks and opportunities?
- **Strategy**: How do climate risks and opportunities affect the organisation's strategy?
- **Risk Management**: How are climate risks identified, assessed, and managed?
- **Metrics and Targets**: What metrics does the organisation use to assess climate risks?

IMS links TCFD disclosures to ESG data, risk register entries, and strategic documents.

## SASB Standards

The Sustainability Accounting Standards Board (SASB) provides industry-specific standards covering financially material sustainability topics. IMS supports SASB industry selection and maps collected data to SASB metrics for your industry.

## CSRD / ESRS

The EU Corporate Sustainability Reporting Directive (CSRD) and its European Sustainability Reporting Standards (ESRS) introduce mandatory double materiality reporting for in-scope companies. IMS tracks ESRS topic coverage and data requirements.

## CDP Reporting

The Carbon Disclosure Project (CDP) requests detailed climate, water, and forest disclosures. IMS exports GHG inventory data in CDP-compatible format to support annual CDP questionnaire completion.

## Disclosure Preparation Workflow

1. Navigate to **ESG Reporting > Disclosures**.
2. Select the **Framework** (GRI, TCFD, SASB, CDP).
3. Review the **Framework Mapping**: which IMS data populates which disclosure.
4. Identify **Gaps**: required disclosures with no data or incomplete data.
5. Generate the **Disclosure Report** in the chosen framework structure.
6. Export to Word or PDF for publication in your sustainability report.`,
  },

  {
    id: 'KB-DD3-022',
    title: 'ESG Supply Chain Integration',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['esg', 'sustainability', 'reporting', 'supply-chain', 'scope-3', 'suppliers'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# ESG Supply Chain Integration

## Overview

Supply chain sustainability is increasingly important for ESG performance, regulatory compliance, and stakeholder expectations. Scope 3 Category 1 (purchased goods and services) is typically the largest source of emissions for most organisations.

## Supplier Sustainability Scorecard

IMS integrates the ESG module with the Supplier Management module to provide a supplier sustainability scorecard. The scorecard assesses:

- **Environmental**: GHG emissions, energy management, waste, water use, environmental certifications.
- **Social**: Labour practices, health and safety, human rights, community impact.
- **Governance**: Anti-corruption policies, whistleblowing mechanisms, ethics codes, board oversight.

Navigate to **ESG Reporting > Supply Chain > Supplier Scorecards** to view and manage supplier scores.

## Supplier ESG Questionnaire

For key suppliers, send an ESG questionnaire directly from IMS:

1. Navigate to **ESG Reporting > Supply Chain > Questionnaires**.
2. Select the **Supplier** and the **Questionnaire Template** (standard, high-risk, or critical).
3. Click **Send**. The supplier receives a link to complete the questionnaire in the Supplier Portal.
4. Responses are automatically scored and linked to the supplier's ESG scorecard.

## Supply Chain GHG Emissions (Scope 3 Category 1)

To calculate Scope 3 Category 1 emissions from purchased goods and services:

- **Spend-Based Method**: Expenditure on each category of goods/services multiplied by an industry-average emission factor. IMS applies EEIO (environmentally extended input-output) factors by spend category.
- **Supplier-Specific Method**: Use GHG data provided by suppliers directly. Suppliers can submit emissions data through the Supplier Portal integration.

## Supplier Development

For suppliers with low ESG scores:

1. Raise a **Supplier Improvement Plan** linked to the supplier record.
2. Define specific improvement actions with targets and timelines.
3. Track progress through quarterly check-ins and updated questionnaire responses.
4. Integrate with the Corrective Action module for formal improvement tracking.

## Supply Chain ESG Benchmarking

Navigate to **ESG Reporting > Supply Chain > Benchmarking** to compare your supply chain ESG performance against industry peers and identify priority areas for engagement with high-impact suppliers.`,
  },

  {
    id: 'KB-DD3-023',
    title: 'ESG Dashboard & Analytics',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['esg', 'sustainability', 'reporting', 'dashboard', 'analytics', 'kpi'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# ESG Dashboard & Analytics

## ESG Performance Dashboard

The ESG performance dashboard provides a comprehensive, real-time view of sustainability performance. Navigate to **ESG Reporting > Dashboard** to access:

**Environmental Panel**
- Total GHG emissions (Scope 1+2+3) with year-on-year comparison.
- GHG intensity ratio (emissions per unit of revenue or production output).
- Energy consumption and renewable energy percentage.
- Waste generated and diversion rate from landfill.
- Water consumption where tracked.

**Social Panel**
- Safety: LTIFR and TRIFR with trend arrows.
- Diversity: Board, leadership, and total workforce gender split.
- Training hours per employee (year to date).
- Community investment total (year to date).

**Governance Panel**
- Board independence percentage.
- Ethics incidents: open and closed in the period.
- Policy compliance: percentage of required policies up to date.

## ESG Scorecard

The ESG Scorecard gives a RAG (Red, Amber, Green) status for each material ESG topic against annual targets:

- **Green**: On track to meet or exceed target.
- **Amber**: At risk; performance is within 10% of target but trending negatively.
- **Red**: Off track; corrective action required.

The scorecard is accessible to the board and senior leadership team through their personalised dashboards.

## Materiality Matrix Visualisation

Navigate to **ESG Reporting > Materiality > Matrix View** to see a visual representation of your material topics plotted by business importance (y-axis) and stakeholder importance (x-axis). The size of each bubble represents the topic's disclosure completeness.

## ESG Rating Simulation

IMS provides a simulation tool that estimates your likely scores on major ESG ratings frameworks (MSCI, Sustainalytics, FTSE Russell) based on your current ESG performance data. Navigate to **ESG Reporting > Rating Simulation**.

## Stakeholder Reporting Views

Customise the dashboard view for different audiences:

- **Investor View**: GHG emissions, net zero progress, TCFD metrics, governance data.
- **Regulator View**: Compliance metrics, environmental incidents, mandatory disclosure data.
- **Employee View**: Safety statistics, diversity and inclusion data, community investment.`,
  },

  {
    id: 'KB-DD3-024',
    title: 'ESG Best Practices',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['esg', 'sustainability', 'reporting', 'best-practices', 'strategy'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# ESG Best Practices

## Aligning ESG Strategy with Business Strategy

ESG is most effective when it is integrated into core business strategy rather than treated as a compliance exercise. Engage the executive team and board in defining material ESG topics and setting targets that align with long-term business value creation.

## Double Materiality Assessment

The EU CSRD and other leading frameworks now require a **double materiality** perspective:

- **Financial Materiality** (outside-in): How do ESG factors affect the organisation's financial performance and value?
- **Impact Materiality** (inside-out): How does the organisation's activities affect society and the environment?

Document both perspectives in your materiality assessment in IMS.

## Setting Science-Based Targets

Align GHG reduction targets with the Science Based Targets initiative (SBTi). SBTi-approved targets must be consistent with limiting global warming to 1.5°C above pre-industrial levels. IMS tracks your emissions trajectory against your SBTi pathway.

## ESG Data Governance

Poor data quality undermines ESG credibility. Establish clear governance:

- **Data Owners**: Named individuals responsible for each ESG metric.
- **Collection Procedures**: Documented methodology for each data point.
- **Verification Process**: Independent review before publication.
- **Audit Trail**: IMS maintains a full audit trail of all ESG data entries and changes.

## Engaging the Board on ESG

Present ESG performance to the board or sustainability committee at least quarterly. Use IMS to generate board-ready ESG summaries including: performance vs targets, material risks and opportunities, regulatory developments, and key initiatives.

## Avoiding Greenwashing

- Only claim environmental achievements that are supported by verified, material data.
- Do not use ambiguous terms (e.g., 'carbon neutral') without clearly defining the scope and methodology.
- Align all public claims with data in IMS to maintain a clear evidence chain.
- Commission third-party assurance for disclosures used in investor communications.

## Third-Party Assurance

For credibility with investors and stakeholders, consider external assurance of your ESG report:

- **Limited Assurance**: The assurer has not found evidence of material misstatement (negative assurance).
- **Reasonable Assurance**: Positive confirmation that data is fairly stated (equivalent to financial audit standard). Requires more robust internal controls and documentation.`,
  },

  // ─── ENERGY MANAGEMENT MODULE ──────────────────────────────────────────────

  {
    id: 'KB-DD3-025',
    title: 'Energy Management Day-to-Day User Guide',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['energy', 'iso-50001', 'sustainability', 'monitoring', 'user-guide'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Energy Management Day-to-Day User Guide

## Purpose

This guide covers the daily and periodic tasks performed by energy managers, site managers, and data entry staff within the Energy Management module.

## Energy Dashboard Overview

Navigate to **Energy Management** from the left sidebar. The main dashboard displays:

- **Total Consumption**: Energy consumed this month across all sources and sites, with comparison to the same period last year.
- **By Source**: Breakdown of consumption: electricity, natural gas, diesel, LPG, renewables, and other sources.
- **Energy Performance Indicator (EnPI)**: Current EnPI value versus baseline and target.
- **Alerts**: Any threshold breaches or unusual consumption patterns requiring attention.
- **Action Plan Progress**: Percentage of current period energy actions completed on time.

## Entering Energy Consumption Data

**Manual Entry:**

1. Navigate to **Energy Management > Consumption > New Reading**.
2. Select the **Site** and **Meter**.
3. Enter the **Reading Date** and **Meter Reading** value (or the consumption quantity directly if not cumulative).
4. Click **Save**. The system calculates the period consumption automatically.

**Bulk Import:**

For sites with many meters, download the **Import Template** from **Energy Management > Consumption > Import**, populate with monthly readings, and upload.

## Reviewing Energy Alerts

Navigate to **Energy Management > Alerts** to review:

- **Threshold Breaches**: Consumption in the period exceeded the defined alert threshold (e.g., > 110% of baseline monthly consumption).
- **Missing Readings**: Meters with no reading entered for the current period.
- **Anomalies**: Statistical outliers flagged by the system (unusually high or low readings).

Investigate each alert and add a note explaining the cause (e.g., production increase, data entry error, genuine inefficiency).

## Tracking Energy Action Plan Progress

Navigate to **Energy Management > Action Plans** to:

- View all open energy improvement actions.
- Update the **Completion Status** of actions assigned to you.
- Record **Actual Savings** achieved against forecast savings.
- Add progress notes and attach evidence of completion.

## EnPI Comparison

The EnPI chart shows your current performance against the baseline and target. A downward trend in EnPI indicates improving energy efficiency relative to your normalisation variable (e.g., production volume or building area).`,
  },

  {
    id: 'KB-DD3-026',
    title: 'Energy Consumption Monitoring & Data Collection',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['energy', 'iso-50001', 'sustainability', 'monitoring', 'meters', 'data-collection'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Energy Consumption Monitoring & Data Collection

## Energy Metering Options

IMS supports two approaches to energy data collection:

**Manual Meter Readings**
Site staff enter meter readings periodically (daily, weekly, or monthly) via the Energy Management module or the mobile app. Manual reading is suitable for smaller sites with few meters.

**Automatic Meter Reading (AMR) Integration**
For larger sites with smart meters or building management systems (BMS), IMS can receive consumption data automatically via API integration or file import. AMR data eliminates manual entry errors and enables more frequent (e.g., half-hourly) analysis.

## Energy Sources Tracked

IMS tracks energy consumption across all significant energy sources:

- **Electricity**: Grid supply, on-site generation (solar, wind, CHP).
- **Natural Gas**: Boilers, heating, process heat.
- **Diesel and LPG**: Emergency generators, fork trucks, heating.
- **Steam and Compressed Air**: Where centrally generated and metered.
- **Renewables**: Heat pumps, biomass boilers (where metered separately).

## Sub-Metering Configuration

Navigate to **Settings > Energy > Meter Configuration** to set up the meter hierarchy:

- **Site Meter**: Top-level meter for the site utility supply.
- **Building Sub-Meter**: Meters allocated to individual buildings or wings.
- **Process Sub-Meter**: Meters for specific production lines or processes.
- **Equipment Sub-Meter**: Meters on individual significant energy using equipment.

Sub-metering is essential for identifying significant energy uses (SEUs) and verifying savings from energy projects.

## Baseline Establishment

The energy baseline is the reference period against which current performance is measured. To establish a baseline:

1. Navigate to **Energy Management > Baselines > New Baseline**.
2. Select a **Representative Period**: typically 12–24 months of historical data.
3. Confirm the **Normalisation Variable(s)** (production volume, degree days, occupancy, etc.) for the same period.
4. IMS runs a regression analysis to establish the baseline energy model.

## Data Validation

IMS automatically validates energy data on entry:

- **Negative consumption**: Flags where a reading is lower than the previous (meter rollover or error).
- **Unreasonably high**: Flags consumption > 3 standard deviations from the rolling average.
- **Missing period**: Reminds data owners when a period is due but no reading has been entered.

Validation alerts are managed under **Energy Management > Alerts**.`,
  },

  {
    id: 'KB-DD3-027',
    title: 'Energy Performance Indicators (EnPIs)',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['energy', 'iso-50001', 'sustainability', 'enpi', 'kpi', 'performance'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Energy Performance Indicators (EnPIs)

## What is an EnPI?

An Energy Performance Indicator (EnPI) is a quantitative measure of energy performance. EnPIs normalise energy consumption against a relevant variable that drives energy use, enabling fair comparison over time and between sites regardless of changes in production volume, weather, or occupancy.

**Common EnPI examples:**

- kWh per tonne of product manufactured (production facility).
- kWh per m2 of floor area (commercial building).
- kWh per patient day (hospital).
- Litres of fuel per 100 km (transport fleet).

## Establishing a Baseline EnPI

1. Navigate to **Energy Management > EnPIs > New EnPI**.
2. Name the EnPI and select the **Energy Source(s)** it covers (e.g., total site electricity).
3. Select the **Normalisation Variable**: production volume, degree days, building area, etc.
4. Select the **Baseline Period**: at least 12 months of representative data.
5. IMS calculates the baseline EnPI value and displays the energy-variable regression relationship.

A high R-squared value (> 0.85) in the regression indicates the normalisation variable is a good predictor of energy use.

## Target EnPI

Set the improvement target for each EnPI:

- Navigate to the EnPI record and click **Set Target**.
- Enter the **Target Year** and the **Target EnPI Value** (expressed as % improvement on baseline, e.g., 10% reduction).
- The target trajectory is plotted on the EnPI trend chart.

## EnPI Calculation in IMS

The current period EnPI is calculated automatically:

**EnPI = Actual Energy Consumption ÷ Normalisation Variable Value**

For regression-based models, the system calculates an **Adjusted Baseline** for the current period (the energy that would have been consumed in the baseline model given current normalisation variable values), enabling a more accurate comparison.

**Energy Performance Improvement = Adjusted Baseline − Actual Consumption**

A positive value confirms improved performance relative to the baseline.

## EnPI Trend Chart

The EnPI dashboard chart shows:

- **Actual EnPI**: Monthly calculated values.
- **Baseline EnPI**: The baseline reference value.
- **Target EnPI**: The improvement target trajectory.

Colour coding: Green = better than target, Amber = between baseline and target, Red = worse than baseline.

## EnPI Review Triggers

Review and potentially revise EnPIs when:

- A significant change in operations, processes, or equipment occurs.
- The normalisation variable relationship changes materially (regression R-squared drops).
- The baseline period is no longer representative.
- A new significant energy use is identified.`,
  },

  {
    id: 'KB-DD3-028',
    title: 'Energy Audits & Reviews',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['energy', 'iso-50001', 'sustainability', 'audit', 'energy-review', 'seu'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Energy Audits & Reviews

## Types of Energy Audit

Energy audits vary in depth and cost. IMS supports planning and recording all audit types:

**Walkthrough Audit**
A quick site walk to identify obvious energy saving opportunities. Typically 1–2 hours. Good for initial assessment or as an annual check between formal audits.

**Level 1 — Simple Energy Analysis (ASHRAE)**
Review of utility bills and a site walkthrough. Identifies major energy saving opportunities at a high level without detailed measurement. Suitable for smaller sites or initial benchmarking.

**Level 2 — General Energy Analysis**
Detailed analysis of energy systems (HVAC, lighting, compressed air, motors) with energy modelling of key opportunities. Requires sub-metering data and engineering analysis. The most common audit level for ongoing energy management.

**Level 3 — Investment-Grade Audit**
Full engineering analysis with measurement and verification of savings potential. Required for major capital investment decisions (e.g., new boiler plant, LED lighting across a large site).

## Planning an Energy Audit in IMS

1. Navigate to **Energy Management > Audits > New Audit**.
2. Define the **Audit Scope**: which sites, systems, or energy sources are included.
3. Assign the **Audit Team**: internal energy manager and/or external auditors.
4. Generate or attach the **Audit Checklist** from IMS templates.
5. Set the **Target Completion Date**.

## Recording Audit Findings

During or after the audit:

1. Open the audit record and navigate to the **Findings** tab.
2. For each energy saving opportunity identified, click **Add Finding**.
3. Enter: description, energy system affected, estimated annual savings (kWh and £/year), implementation cost, and simple payback period.
4. Rate the opportunity: Quick Win (< 6 months payback), Short-Term (6–18 months), Medium-Term (18–36 months), Long-Term (> 36 months).

## Energy Audit Report

Navigate to **Energy Management > Audits > [Audit] > Generate Report**. The IMS report template is auto-populated with:

- Audit scope and team.
- Site energy profile from the consumption database.
- All findings with savings estimates and payback periods.
- Prioritised action list.

## Energy Review

ISO 50001 requires an ongoing **energy review** — a systematic analysis of energy use and consumption to identify SEUs and improvement opportunities. The energy review is not a one-time event but a continuous process, informed by consumption data, EnPI trends, audit findings, and operational changes.

Navigate to **Energy Management > Energy Review** to document the periodic energy review outputs: SEU updates, baseline/EnPI changes, and objective revisions.`,
  },

  {
    id: 'KB-DD3-029',
    title: 'Significant Energy Uses (SEUs)',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['energy', 'iso-50001', 'sustainability', 'seu', 'significant-energy-use'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Significant Energy Uses (SEUs)

## What is an SEU?

ISO 50001 defines a **Significant Energy Use (SEU)** as an energy use that accounts for substantial consumption and/or offers significant potential for energy performance improvement.

SEUs are the focus of detailed monitoring, operational control, and targeted improvement in the energy management system. The number of SEUs will vary by organisation — typically 3–10 for manufacturing facilities.

## SEU Identification Methodology

IMS uses a Pareto analysis of energy consumers to identify SEUs:

1. Navigate to **Energy Management > SEUs > Identify SEUs**.
2. The system analyses consumption by equipment, process, or area (from sub-meter data).
3. A ranked list is generated showing each consumer's share of total consumption.
4. Select consumers that collectively account for approximately 80% of total consumption.
5. Also include any consumers with significant improvement potential even if not in the top 80%.

Confirm the selected SEUs and document the selection rationale.

## SEU Register

The SEU register records key information for each SEU:

- **Equipment or Process Name**: Clear identifier.
- **Energy Source**: Electricity, gas, compressed air, etc.
- **Current Annual Consumption**: kWh or other unit per year.
- **Baseline Consumption**: Reference period consumption.
- **SEU EnPI**: Performance indicator specific to this SEU.
- **Improvement Potential**: Estimated kWh saving from identified opportunities.
- **Relevant Variables**: Variables that affect SEU energy consumption (e.g., production rate, ambient temperature).

Navigate to **Energy Management > SEUs > SEU Register** to maintain the register.

## SEU Competency Requirements

For each SEU, identify the **personnel whose work can significantly affect the energy performance of the SEU**. These individuals must receive specific training on energy-efficient operation of the equipment or process. Document required competencies and training records in IMS, linked to the Training module.

## Monitoring SEUs

SEUs require more frequent and detailed monitoring than general site energy:

- Dedicated sub-meters or derived calculations (e.g., motor current x voltage x time).
- Monthly EnPI review for each SEU.
- Immediate investigation of any anomaly or alert.

## SEU Review Triggers

Review the SEU register when:

- New major equipment is installed.
- A process is significantly modified.
- Annual energy review identifies a new high-consumption area.
- An SEU is eliminated through replacement or shutdown of equipment.`,
  },

  {
    id: 'KB-DD3-030',
    title: 'Energy Action Plans & Targets',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['energy', 'iso-50001', 'sustainability', 'action-plans', 'targets', 'savings'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Energy Action Plans & Targets

## Creating an Energy Action Plan

Energy action plans translate audit findings and energy review outputs into concrete improvement projects. To create an action plan:

1. Navigate to **Energy Management > Action Plans > New Action**.
2. Enter the **Opportunity Description**: what energy saving measure is being implemented.
3. Link to the **Source**: energy audit finding, SEU review, or energy objective.
4. Enter the **Baseline**: current energy consumption of the affected system (kWh/year).
5. Enter the **Target**: forecast consumption after the measure is implemented.
6. Calculate the **Forecast Annual Saving** in kWh and the financial value.
7. Enter the **Implementation Cost** (capital and/or revenue).
8. The system calculates the **Simple Payback Period** automatically.
9. Assign an **Action Owner** and set **Milestone Dates**.

## Prioritising Energy Actions

Use the **ICE Framework** to prioritise actions in the portfolio:

- **I — Impact**: How large is the energy or cost saving? (score 1–5)
- **C — Cost**: How expensive is implementation? (lower cost = higher score, 1–5)
- **E — Ease**: How straightforward is implementation? (regulatory, technical, operational barriers)

ICE Score = I × C × E. Rank actions from highest to lowest score. Quick wins (low cost, easy to implement) should be actioned first.

## Energy Project Tracking

For each action, track progress through milestones:

- **Feasibility Study Complete**
- **Design Approved**
- **Procurement Complete**
- **Installation Complete**
- **Commissioning Complete**
- **Savings Verified**

Navigate to **Energy Management > Action Plans > Gantt View** to see all actions in a timeline format.

## Energy Savings Verification (M&V)

After implementation, verify actual savings using **Measurement and Verification (M&V)** methodology (aligned with ISO 50015 and IPMVP):

- Compare energy consumption before and after implementation, controlling for relevant variables.
- Enter the **Verified Annual Saving** in the action record once M&V is complete.
- The dashboard tracks cumulative verified savings against the annual target.

## Setting Annual Energy Improvement Targets

Navigate to **Energy Management > Targets > New Target**:

- Set a percentage improvement in EnPI versus baseline (e.g., reduce site energy intensity by 10% by 2028).
- Break down into annual milestones.
- Ensure targets are stretching but achievable based on the action plan portfolio.
- Align energy targets with ESG targets and any regulatory commitments (e.g., ESOS recommendations).`,
  },

  {
    id: 'KB-DD3-031',
    title: 'Energy Reporting & Dashboard',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['energy', 'iso-50001', 'sustainability', 'reporting', 'dashboard', 'secr'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Energy Reporting & Dashboard

## Energy Dashboard

The energy dashboard provides a real-time view of energy performance across the organisation. Key panels include:

- **Total Consumption (YTD)**: Total energy consumed this year to date, broken down by source (electricity, gas, renewables, etc.).
- **Renewable Energy %**: Proportion of consumption from renewable sources.
- **Carbon Equivalent**: Total CO2e calculated from consumption using emission factors from the '@ims/emission-factors' library.
- **Energy Cost (YTD)**: Total energy expenditure to date.
- **Year-on-Year Change**: Percentage change in consumption vs same period last year.
- **EnPI Trend**: Current period EnPI vs baseline and target — plotted as a trend chart.
- **Action Plan Progress**: Percentage of open energy actions on track, at risk, or overdue.

## Energy Report Types

### Monthly Operational Report
Generated automatically each month for the energy management team. Includes consumption by site and source, EnPI values, alerts summary, and action plan status. Navigate to **Energy Management > Reports > Monthly Operational**.

### Annual Management Review Report
Comprehensive annual summary for the ISO 50001 management review, covering: energy policy review, energy objectives achievement, SEU performance, EnPI trends, audit findings closed, and energy action plan outcomes. Navigate to **Energy Management > Reports > Annual Management Review**.

### Regulatory Compliance Reports

**SECR (UK Streamlined Energy and Carbon Reporting)**
Required for large UK companies (quoted companies and large unquoted companies). IMS generates the SECR disclosure including Scope 1 and 2 emissions, energy consumption, intensity ratio, and energy efficiency actions taken. Navigate to **Energy Management > Reports > SECR**.

**ESOS (UK Energy Savings Opportunity Scheme)**
Phase 3 compliance due 2027. IMS supports documentation of ESOS audit scope, significant energy uses, and recommended actions.

## Energy Cost Report

Navigate to **Energy Management > Reports > Cost Analysis** to view energy cost by:

- Source (electricity, gas, diesel, etc.).
- Site and cost centre.
- Month, quarter, or year.

Export to CSV for finance team processing or cost centre recharging.

## Data Export

All energy data can be exported to CSV format for external reporting: navigate to **Energy Management > Data Export**, select the date range and data type, and download. This supports CDP climate disclosure and ESG report data population.`,
  },

  {
    id: 'KB-DD3-032',
    title: 'ISO 50001 Energy Management Best Practices',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['energy', 'iso-50001', 'sustainability', 'best-practices', 'enms'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# ISO 50001 Energy Management Best Practices

## Plan-Do-Check-Act for Energy Management

ISO 50001:2018 is built on the PDCA cycle applied to energy management:

- **Plan**: Establish energy policy, identify SEUs, set baselines and EnPIs, define objectives and action plans.
- **Do**: Implement energy action plans, train personnel, manage SEU operational controls.
- **Check**: Monitor and measure energy performance (EnPIs), audit the EnMS, review data quality.
- **Act**: Correct deviations, close non-conformances, conduct management review, drive continuous improvement.

## Top Management Commitment

ISO 50001 requires visible top management commitment, including:

- Publishing and communicating the **Energy Policy**.
- Ensuring adequate **resources** (budget, personnel, equipment) for the energy management system.
- Participating in **management reviews** of energy performance.
- Setting and communicating **energy objectives**.

## Energy Team Structure

Define clear roles and responsibilities for the energy management system:

- **Management Representative (Energy)**: Senior manager accountable for the EnMS.
- **Energy Manager**: Day-to-day operation of the EnMS, data collection, reporting.
- **Site Energy Champions**: On-site contacts responsible for local data collection and awareness.
- **SEU Operators**: Trained in energy-efficient operation of significant energy using equipment.

Document roles and responsibilities under **Settings > Energy > Roles & Responsibilities**.

## Operational Controls for SEUs

For each SEU, define operating criteria (set-points, procedures) that ensure it operates at its most energy-efficient level. Document these as operational controls and ensure operators are trained. Common examples:

- Compressed air system pressure set-points (reduce pressure where feasible).
- HVAC temperature and ventilation schedules.
- Steam system pressure and condensate return targets.
- Lighting controls: daylight harvesting settings, occupancy sensor configurations.

## Monitoring, Measurement, and Analysis

Maintain current and accurate energy data in IMS at all times. Key requirements:

- All SEUs must have dedicated monitoring data (sub-meter or calculation).
- EnPIs must be updated at least monthly.
- Significant deviations must be investigated and documented.
- Calibration records for energy meters and sensors must be maintained.

## Internal Audit of the EnMS

Conduct an annual internal audit of the Energy Management System covering all ISO 50001 requirements and EnMS activities. Use the IMS internal audit module with the ISO 50001 audit checklist template. All findings must be managed through the corrective action process.

## Management Review Inputs and Outputs

The ISO 50001 management review must cover: energy policy review, energy performance (EnPIs vs targets), SEU status, legal compliance, audit results, objective achievement, and stakeholder issues. Outputs must include decisions on objectives, resources, and opportunities for improvement.`,
  },

  // ─── INVENTORY MANAGEMENT MODULE ──────────────────────────────────────────

  {
    id: 'KB-DD3-033',
    title: 'Inventory Management Day-to-Day User Guide',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['inventory', 'stock-management', 'warehouse', 'user-guide', 'goods-receipt'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Inventory Management Day-to-Day User Guide

## Purpose

This guide covers the daily tasks performed by stores staff, warehouse operatives, and inventory managers within the Inventory Management module.

## Inventory Dashboard

After logging in, navigate to **Inventory Management**. The dashboard displays:

- **Stock Levels**: Total SKUs in stock, total stock value, and number of items below minimum level.
- **Low Stock Alerts**: Items at or below the minimum stock level requiring replenishment.
- **Pending Purchase Orders**: Open POs with expected delivery dates.
- **Recent Movements**: Last 20 stock movements across all locations.
- **Cycle Count Schedule**: Upcoming scheduled stocktakes by location or item category.

## Searching the Inventory Catalogue

Use the global search bar at the top of the Inventory module to search by:

- Part number or SKU.
- Part name or description.
- Supplier part number.
- Category or product group.

The search results show: current stock level, location, unit of measure, reorder status, and last movement date.

## Checking Stock Availability

For a specific item, click through to the **Item Detail** page to see:

- **Stock by Location**: Quantity on hand at each warehouse or storage location.
- **Allocated**: Quantity reserved for open work orders or sales orders.
- **Available**: On hand minus allocated.
- **On Order**: Quantity on open purchase orders with expected delivery date.

## Recording Stock Movements

**Goods In (Receipt):**
1. Navigate to **Inventory > Transactions > Goods Receipt**.
2. Select the related **Purchase Order** (or enter manually if no PO exists).
3. Confirm the **Supplier**, **Items Received**, **Quantities**, and **Put-Away Location**.
4. Record the **Supplier Delivery Note Number** for reference.
5. Click **Post Receipt**. Stock levels update immediately.

**Goods Out (Issue):**
1. Navigate to **Inventory > Transactions > Goods Issue**.
2. Reference the **Work Order**, **Cost Centre**, or **Project** the goods are issued against.
3. Select items and quantities. The system checks availability before allowing the issue.
4. Click **Post Issue**. Stock levels decrease immediately.

## Cycle Count Workflow

1. Navigate to **Inventory > Cycle Counts > Current Schedule**.
2. Select the count assigned to you (location or item list).
3. Count physical stock and enter the **Counted Quantity** for each item.
4. Review and **Post** the count. Discrepancies are flagged for investigation before adjustment.`,
  },

  {
    id: 'KB-DD3-034',
    title: 'Stock Levels & Reorder Points',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['inventory', 'stock-management', 'warehouse', 'reorder', 'safety-stock', 'eoq'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Stock Levels & Reorder Points

## Stock Level Parameters

For each item in the inventory catalogue, configure three stock level thresholds:

**Minimum Stock Level (Safety Stock)**
The lowest acceptable quantity to avoid stockouts during the replenishment lead time. When stock falls to or below this level, a low-stock alert is generated.

Safety Stock = (Maximum Daily Usage − Average Daily Usage) × Maximum Lead Time Days

**Reorder Point**
The stock level at which a replenishment order should be placed. Set above the minimum level to allow sufficient time for the order to arrive before safety stock is consumed.

Reorder Point = (Average Daily Usage × Average Lead Time Days) + Safety Stock

**Maximum Stock Level**
The upper limit for stock holdings, based on available storage space and working capital policy. Receiving more than this quantity would exceed storage capacity or tie up excessive capital.

## Economic Order Quantity (EOQ)

The EOQ formula calculates the optimal order quantity that minimises the combined cost of ordering (administrative cost per order) and holding (storage, capital cost per unit held):

EOQ = square root of (2 × Annual Demand × Order Cost ÷ Holding Cost per Unit per Year)

IMS calculates EOQ automatically for items with sufficient demand history. View the calculated EOQ on the item detail page under **Stock Control Parameters**.

## Configuring Stock Levels in IMS

1. Navigate to **Inventory > Catalogue > [Item] > Stock Control**.
2. Enter the **Minimum Level**, **Reorder Point**, and **Maximum Level**.
3. Enter the **Reorder Quantity** (use EOQ or manually specify based on supplier MOQ).
4. Set the **Supplier Lead Time** (days from order to delivery).
5. Click **Save**.

## Automatic Reorder Alerts

When stock falls to the reorder point, IMS automatically:

- Generates a **low stock alert** on the dashboard.
- Notifies the designated **Procurement Contact** by email.
- Optionally creates a draft **Purchase Order** for the reorder quantity (if auto-PO is enabled in settings).

## Reorder Point Review

Review stock level parameters at least quarterly:

- Navigate to **Inventory > Reports > Reorder Review**.
- For each item, compare current parameters with actual demand and lead time history.
- Adjust parameters for items where stockouts or excess stock have occurred.

## Seasonal Adjustments

For items with seasonal demand, adjust reorder points and minimum levels before the peak season begins. Navigate to the item's stock control settings and set **Seasonal Overrides** for defined date ranges.

## Critical Spares Policy

Items classified as **Critical Spares** (where a stockout would cause significant operational disruption) are subject to a zero-stockout policy. Set minimum level to ensure at least one unit is always held, regardless of demand frequency or cost.`,
  },

  {
    id: 'KB-DD3-035',
    title: 'Inventory Transactions & Movements',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['inventory', 'stock-management', 'warehouse', 'transactions', 'movements', 'audit-trail'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Inventory Transactions & Movements

## Transaction Types

Every change in stock quantity or location is recorded as a transaction in IMS. The following transaction types are supported:

- **Goods Receipt**: Stock received from a supplier or internal transfer from another warehouse.
- **Goods Issue**: Stock issued for consumption against a work order, project, cost centre, or department request.
- **Stock Transfer**: Movement of stock between locations within the same warehouse, or between warehouses.
- **Stock Adjustment**: Manual correction to stock levels following a stocktake or investigation of a discrepancy.
- **Return to Supplier**: Defective or surplus stock returned to the supplier.
- **Customer/User Return**: Items returned by an internal customer or field team, moving back into stock.

## Creating a Goods Receipt

1. Navigate to **Inventory > Transactions > Goods Receipt**.
2. If a **Purchase Order** exists, search and select it. Line items are pre-populated.
3. Confirm or adjust the **Quantity Received** (partial deliveries are supported).
4. Enter the **Supplier Delivery Note Number** for 3-way matching.
5. For items with lot/batch control, enter the **Lot Number** and **Expiry Date**.
6. Select the **Receiving Location** (put-away location in the warehouse).
7. Click **Post Receipt**. Stock levels are updated immediately and the PO status updated.

## Creating a Goods Issue

1. Navigate to **Inventory > Transactions > Goods Issue**.
2. Select the **Issue Type** and enter the reference (work order number, cost centre code, project code).
3. Search for and add each item, entering the **Quantity Required**.
4. The system checks availability and warns if insufficient stock is available.
5. For FIFO-controlled items, the system allocates from the oldest lot automatically.
6. Click **Post Issue**. Stock decreases and the cost is recorded against the referenced cost object.

## Stock Transfers

1. Navigate to **Inventory > Transactions > Stock Transfer**.
2. Select the **From Location** and **To Location**.
3. Add items and quantities to transfer.
4. Click **Initiate Transfer**. The transfer enters a **In Transit** state — stock is deducted from the source but not yet added at the destination.
5. When goods arrive, the recipient clicks **Confirm Receipt** to complete the transfer and add stock at the destination.

## Stock Adjustments

Stock adjustments correct discrepancies found during cycle counts or investigations. Each adjustment requires:

- A **Reason Code**: Stocktake discrepancy, damaged write-off, found stock, data entry correction, etc.
- An **Authorisation**: Adjustments above a defined value threshold require manager approval.

All adjustments are recorded in the audit trail with the user, date, reason, and authorising manager.

## Transaction Audit Trail

Navigate to **Inventory > Audit Trail** to view a complete history of all stock movements. Filter by item, location, date range, transaction type, or user. The audit trail is tamper-evident and cannot be edited or deleted.`,
  },

  {
    id: 'KB-DD3-036',
    title: 'Supplier Management & Purchase Orders',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['inventory', 'stock-management', 'warehouse', 'purchasing', 'purchase-orders', 'suppliers'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Supplier Management & Purchase Orders

## Creating a Purchase Order

1. Navigate to **Inventory > Purchasing > New Purchase Order**.
2. Select the **Supplier** from the approved supplier list.
3. Set the **Required Delivery Date** and **Delivery Address**.
4. Add line items: search for the item in the catalogue, enter quantity, confirm unit price (from the supplier price list or manually entered).
5. Enter the **Cost Centre** or **Budget Code** the expenditure will be charged to.
6. Click **Save as Draft**.

## PO Approval Workflow

Purchase orders are subject to approval thresholds based on total value:

| PO Value | Approval Required |
|----------|------------------|
| Up to £500 | Stores Manager |
| £501 – £5,000 | Department Manager |
| £5,001 – £50,000 | Finance Director |
| Over £50,000 | CEO |

Approvers are notified by email and can approve or reject directly from the notification link or within IMS.

## Goods Receipt Against PO (3-Way Matching)

When goods arrive:

1. The stores team creates a **Goods Receipt** referencing the PO.
2. IMS validates: PO quantity vs received quantity vs invoiced quantity (**3-way match**).
3. Any discrepancy (short delivery, damaged goods) is flagged for resolution with the supplier before payment is approved.

## Supplier Lead Time Tracking

For each supplier and item combination, IMS tracks:

- **Average Lead Time**: Rolling average of days from PO placement to goods receipt.
- **Lead Time Variance**: Standard deviation, indicating supplier reliability.

Navigate to **Inventory > Suppliers > [Supplier] > Lead Time Analysis** to review performance. Use this data to adjust reorder point calculations.

## Preferred Supplier List

The preferred supplier list contains quality-approved suppliers for each item category. Only suppliers on the preferred list can be selected when raising a PO (unless an exception is approved). The preferred supplier list is maintained under **Settings > Inventory > Supplier Approvals** and links to the Supplier Management module for full supplier qualification records.

## Integration with Finance Module

When a goods receipt is posted and the 3-way match is successful:

- An **Approved Invoice Record** is automatically created in the Finance module for the matched PO lines.
- The accounts payable team can process payment without manual re-entry.
- Stock value is automatically posted to the inventory asset account in the general ledger.`,
  },

  {
    id: 'KB-DD3-037',
    title: 'Warehouse & Location Management',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['inventory', 'stock-management', 'warehouse', 'locations', 'bin-management'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Warehouse & Location Management

## Location Hierarchy

IMS organises warehouse storage in a four-level hierarchy:

**Warehouse** > **Zone** > **Aisle** > **Shelf** > **Bin**

This hierarchy provides precise stock location for picking and put-away operations, enabling faster warehouse operations and accurate cycle counting.

## Setting Up the Location Hierarchy

1. Navigate to **Settings > Inventory > Locations**.
2. Create your **Warehouse(s)**: name, address, and type (main store, satellite store, external 3PL).
3. Under each warehouse, create **Zones**: functional areas of the warehouse.
4. Under each zone, create **Aisles**, **Shelves**, and **Bins** as required for your operational detail level.
5. Assign a unique **Location Code** to each bin (e.g., WH1-A-03-B-05 = Warehouse 1, Aisle A, Row 03, Shelf B, Bin 05).

## Location Types

Assign a type to each location to control what can be stored and what processes can occur there:

- **Bulk Storage**: Large quantities of items, typically palletised.
- **Picking Location**: Active pick face for order fulfilment.
- **Incoming Goods**: Temporary holding area for received goods awaiting inspection or put-away.
- **Quarantine**: Goods on hold pending quality inspection or investigation.
- **Returns**: Area for items returned from field teams or users, awaiting assessment.
- **Dispatch**: Items staged for outbound shipment.

## Product-to-Location Assignment

Each item in the catalogue can have a **preferred put-away location** and a **picking location** assigned. Navigate to **Inventory > Catalogue > [Item] > Locations** to configure:

- **Primary Location**: Where this item is normally stored.
- **Overflow Location**: Used when primary location is full.

When creating a goods receipt, the system suggests the primary location for each item received.

## Hazardous and Special Storage

For items requiring special storage conditions, configure storage restrictions:

- **Hazardous**: Cannot be stored with incompatible substances. Linked to COSHH data in the Chemicals module.
- **Temperature-Controlled**: Refrigerated or frozen storage zones.
- **Fragile / High Value**: Secured cage or high-value storage areas.

The system prevents stock placement in incompatible locations.

## Bin Barcode Labels

Generate and print barcode or QR code labels for each bin location from **Inventory > Locations > Print Labels**. Scanning bin labels with the mobile app allows warehouse staff to:

- See what is currently stored in a bin.
- Create a goods receipt or issue directly from a bin scan.
- Conduct a cycle count of the bin's contents.

## Location Utilisation Report

Navigate to **Inventory > Reports > Location Utilisation** to view occupancy rates by zone. Use this report to identify underutilised zones and optimise warehouse layout.`,
  },

  {
    id: 'KB-DD3-038',
    title: 'Inventory Valuation Methods',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['inventory', 'stock-management', 'warehouse', 'valuation', 'fifo', 'finance'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Inventory Valuation Methods

## Supported Valuation Methods

IMS Inventory supports three standard inventory valuation methods. The method is configured at the organisation level under **Settings > Inventory > Valuation Method** and must be consistent with your financial accounting policies.

### FIFO — First In, First Out

Under FIFO, the cost of goods sold or issued is the cost of the oldest stock. Remaining inventory is valued at the most recent purchase prices.

**Best suited for:** Items where older stock should be used first (perishables, items with expiry dates, components where older versions may become obsolete). FIFO produces a balance sheet stock value close to current market prices during inflationary periods.

### LIFO — Last In, First Out

Under LIFO, the cost of goods sold is the cost of the most recently purchased stock. Note: LIFO is not permitted under IFRS and is rarely used outside the US (where it is permitted under US GAAP).

### Weighted Average Cost (WAC)

Under WAC, all units of the same item are valued at the same running average cost, recalculated each time new stock is received.

**Best suited for:** Commodity items or fungible goods where individual batch cost tracking is not meaningful (e.g., bulk raw materials, standard hardware components).

## Choosing the Right Method

Consult your finance team and external auditors before selecting a valuation method. Key considerations:

- **Accounting standards**: IFRS requires FIFO or WAC (not LIFO).
- **Tax implications**: FIFO can increase taxable profit in inflationary periods (higher closing stock value).
- **Operational fit**: FIFO requires lot tracking, which adds operational overhead but is essential for expiry-date-sensitive items.

## Inventory Valuation Report

Navigate to **Inventory > Reports > Inventory Valuation** to view the total value of closing stock:

- By item, category, or location.
- Using the configured valuation method.
- As of any point in time (historical valuation).

This report is used by the finance team for balance sheet preparation and financial audit.

## Slow-Moving and Obsolete Stock

Navigate to **Inventory > Reports > Slow Movers** to identify items with no movement in the last 6, 12, or 24 months. Initiate a review with the relevant department to determine whether the items are still required. Items confirmed as obsolete can be written down or written off via a stock adjustment with reason code 'Obsolescence Write-Off'.

## Integration with Finance

Stock valuation data flows automatically to the Finance module:

- Stock receipts are posted to the **Inventory Asset Account** in the general ledger.
- Stock issues are posted as a **Cost of Goods** expense.
- Month-end closing stock value is reconciled between Inventory and Finance automatically.
- Any stock write-offs generate a **Write-Off Expense** journal entry in Finance.`,
  },

  {
    id: 'KB-DD3-039',
    title: 'Inventory Reporting & Analytics',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['inventory', 'stock-management', 'warehouse', 'reporting', 'analytics', 'kpi'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Inventory Reporting & Analytics

## Key Inventory KPIs

The Inventory module tracks the following key performance indicators:

**Stock Turnover Ratio**
How many times the average stock is sold or consumed in a year.
Formula: Annual Consumption Cost ÷ Average Inventory Value.
Higher turnover indicates efficient stock management.

**Days Sales of Inventory (DSI)**
The average number of days stock is held before being consumed.
Formula: (Average Inventory Value ÷ Annual Consumption Cost) × 365.
Lower DSI indicates faster-moving inventory.

**Stock Accuracy Rate**
Percentage of items where the system quantity matches the physical count.
Target: 98% or above. Measured through cycle counts.

**Fill Rate (Order Fill Rate)**
Percentage of goods issue requests fulfilled from stock without waiting for replenishment.
Target: 95% or above for critical items.

**Write-Off Rate**
Value of stock written off (expired, damaged, obsolete) as a percentage of total stock value.
Lower rates indicate better stock control and forecasting accuracy.

## Built-In Reports

Navigate to **Inventory > Reports** to access:

- **Stock Valuation Report**: Current closing stock value by item, category, location.
- **Movement History Report**: Full audit trail of all transactions by item or location.
- **ABC Analysis**: Classification of items by consumption value (A = top 80%, B = 15%, C = 5%).
- **Slow Movers Report**: Items with no movement in a defined period.
- **Reorder Report**: Items at or below reorder point requiring replenishment action.
- **Supplier Lead Time Report**: Actual vs expected lead times by supplier.
- **Cycle Count Accuracy Report**: Accuracy rates by location and item category over time.

## ABC Analysis

The ABC analysis classifies inventory items by their consumption value to focus management effort:

- **A Items (top 80% of consumption value)**: Tight control, high review frequency, accurate forecasting, close monitoring of stock levels.
- **B Items (next 15%)**: Moderate control, periodic review.
- **C Items (bottom 5% of value)**: Simplified control, broader min/max stock levels, less frequent review.

Navigate to **Inventory > Analytics > ABC Analysis** to run and view the current classification.

## Demand Forecasting

For items with sufficient history (12+ months of consumption data), IMS generates a **Demand Forecast** based on historical consumption trends, seasonal patterns, and moving averages. Navigate to **Inventory > Analytics > Demand Forecast** to review forecasts and compare with current minimum stock level settings.

## Export for Financial Audit

Navigate to **Inventory > Reports > Audit Export** to generate a complete inventory data export for external auditors, including: closing stock quantity and value by item, movement transactions for the period, and valuation methodology confirmation.`,
  },

  {
    id: 'KB-DD3-040',
    title: 'Inventory Management Best Practices',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['inventory', 'stock-management', 'warehouse', 'best-practices', 'lean', 'accuracy'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Inventory Management Best Practices

## ABC Inventory Classification

Focus management effort where it has the greatest impact:

- **A Items**: Apply strict controls — tight reorder points, frequent cycle counts (monthly), close review of demand forecasts, dedicated procurement relationships.
- **B Items**: Standard controls — quarterly cycle counts, periodic parameter reviews.
- **C Items**: Simplified controls — broad min/max levels, annual counts are sufficient, consider supplier-managed replenishment.

Rerun the ABC analysis quarterly as item consumption patterns change over time.

## Cycle Counting vs Periodic Full Stocktake

**Full Stocktake (Annual Physical Inventory):**
Counts all stock on a single day or over a weekend. Requires halting warehouse operations. Suitable for small stores or as a one-time accuracy baseline exercise.

**Cycle Counting (Ongoing Rolling Counts):**
Counts a subset of items each day or week, cycling through all items within a defined period. Does not require stopping operations. Enables continuous monitoring of accuracy and faster identification of discrepancies.

**Best Practice**: Move to cycle counting as the primary accuracy assurance method. Count A items monthly, B items quarterly, C items annually. Use a full stocktake only when there is a specific need (audit requirement, site relocation).

## Lean Inventory Principles

Lean inventory management reduces waste while maintaining service levels:

- **Eliminate excess stock**: Every unit of excess stock ties up capital and occupies space. Target minimum viable stock levels.
- **Single piece flow**: Receive and issue in smaller, more frequent quantities rather than large batches.
- **Visual management**: Use IMS dashboards and low-stock alerts to create visual pull signals for replenishment.
- **5S in the warehouse**: Sort, Set in order, Shine, Standardise, Sustain — a clean, organised warehouse reduces picking errors and stock losses.

## Supplier-Managed Inventory (SMI)

For routine, high-volume C items, consider letting the supplier manage replenishment:

- The supplier is given visibility of your stock levels (via IMS supplier portal integration).
- The supplier replenishes stock when levels fall below an agreed threshold, without requiring you to raise a purchase order.
- Reduces your procurement administration for low-value items.
- Typically negotiated on a consignment basis: you pay only when stock is consumed.

## FIFO Rotation in the Warehouse

Implement strict FIFO rotation to prevent expiry and obsolescence:

- Always put new stock behind (or below) existing stock during put-away.
- Pick from the front (oldest stock) during goods issues.
- For lot-controlled items, IMS enforces FIFO at the system level — the system will not allow a newer lot to be issued before an older lot with remaining stock.

## Inventory Accuracy Targets

Set a minimum inventory accuracy target of **98%** for all locations. Monitor accuracy through cycle count results. When accuracy falls below target for a location:

1. Investigate root causes: labelling errors, picking errors, unrecorded issues, theft.
2. Address the root cause rather than just adjusting the count.
3. Increase cycle count frequency for affected locations until accuracy is restored.

## Cross-Departmental Coordination

Inventory management is most effective when aligned with other departments:

- **Production/Operations**: Share production plans so inventory can pre-stage required materials.
- **Maintenance (CMMS)**: Coordinate spare parts holdings with maintenance schedules to avoid emergency purchasing.
- **Finance**: Align inventory reduction targets with working capital improvement goals.
- **Procurement**: Share demand forecasts to enable better supplier negotiation and planning.`,
  },
];
