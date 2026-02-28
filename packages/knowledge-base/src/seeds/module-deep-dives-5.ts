import type { KBArticle } from '../types';

export const moduleDeepDives5Articles: KBArticle[] = [
  // ─── FOOD SAFETY MANAGEMENT ───────────────────────────────────────────────

  {
    id: 'KB-DD5-001',
    title: 'Food Safety Day-to-Day User Guide',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['food-safety', 'haccp', 'iso-22000'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Food Safety Day-to-Day User Guide

## Overview

The Food Safety module supports your daily food safety management activities, providing a structured environment for recording monitoring data, managing corrective actions, and maintaining compliance with ISO 22000 and FSSC 22000.

## Daily Tasks Checklist

### CCP Monitoring Data Entry

Record Critical Control Point (CCP) monitoring results for each shift or scheduled check:

- Temperature measurements (cooking, chilling, storage, transport)
- pH measurements for applicable products
- Time-temperature combinations for pasteurisation or heat treatment
- Water activity (Aw) readings where applicable

Navigate to **Food Safety → CCP Monitoring → Record Reading** and select the CCP, enter the measured value, and confirm whether the result is within the critical limit.

### Reviewing Open Corrective Actions

Each morning, review the corrective actions list under **Food Safety → Corrective Actions → Open**. Update investigation notes, assign owners, and close actions where work is complete.

### Completing Food Safety Inspections

Conduct scheduled hygiene inspections and GMP checks using the digital inspection checklists. Access via **Food Safety → Inspections → Today's Schedule**.

### Checking Supplier Approval Status

Before accepting incoming materials, verify supplier approval status in **Food Safety → Suppliers → Approved Supplier List**. Do not accept materials from unapproved or suspended suppliers.

### HACCP Monitoring Log Updates

Ensure monitoring logs are complete, signed, and filed for each production run. IMS auto-generates monitoring log summaries for audit purposes.

## Food Safety Dashboard

The dashboard provides at-a-glance visibility of:

- CCP compliance rate (%)
- Open corrective actions by severity
- Supplier approval status summary
- Upcoming audits and inspections
- Today's monitoring schedule

## Quick Access

Use the sidebar shortcuts for rapid access to CCP monitoring entry, open actions, and the approved supplier list.`,
  },

  {
    id: 'KB-DD5-002',
    title: 'HACCP Plan Management',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['food-safety', 'haccp', 'iso-22000'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# HACCP Plan Management

## Overview

The IMS Food Safety module provides a complete HACCP plan builder aligned with the seven HACCP principles and ISO 22000:2018 clause 8.5.

## HACCP Plan Structure

A complete HACCP plan in IMS includes:

1. **Scope** — products, processes, and sites covered
2. **Flow Diagram** — process steps with decision points
3. **Hazard Analysis** — hazards at each process step
4. **Critical Control Points (CCPs)** — identified using the CCP decision tree
5. **Critical Limits** — measurable parameters for each CCP
6. **Monitoring Procedures** — what, how, frequency, and responsible person
7. **Corrective Actions** — pre-defined responses to limit deviations
8. **Verification Activities** — confirming the HACCP plan is working
9. **Record Keeping** — all forms and records linked to the plan

## Creating a HACCP Plan

Navigate to **Food Safety → HACCP Plans → New Plan**. Enter the product description, intended use, and consumer group. Add each process step to the flow diagram, then proceed to hazard analysis.

## Hazard Identification

For each process step, identify hazards by type:

- **Biological** — pathogens, spoilage organisms, allergens from cross-contamination
- **Chemical** — pesticides, cleaning agents, veterinary drug residues, allergens
- **Physical** — metal, glass, hard plastic, bone fragments
- **Allergenic** — undeclared allergen cross-contact

## Hazard Assessment

Rate each hazard by **severity** and **likelihood** (1–5 scale). Hazards scoring above the threshold (severity × likelihood ≥ 9) are considered significant and must be controlled.

## CCP Identification

Use the IMS CCP decision tree (CODEX-based) to determine whether significant hazards require a CCP or can be managed by an Operational PRP.

## HACCP Plan Review

Re-validate the HACCP plan when: a new product is introduced, a process change occurs, a new hazard is identified, or after a significant food safety incident.`,
  },

  {
    id: 'KB-DD5-003',
    title: 'Critical Control Points (CCPs) Monitoring',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['food-safety', 'haccp', 'iso-22000'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Critical Control Points (CCPs) Monitoring

## Overview

Effective CCP monitoring is the operational heart of any HACCP system. IMS provides a structured monitoring register, real-time data entry, and automatic alerting when critical limits are breached.

## CCP Register

Each CCP record contains:

- **CCP Number** — unique identifier (e.g., CCP-01)
- **Process Step** — where in the process the CCP occurs
- **Hazard Controlled** — the significant hazard being managed
- **Critical Limit** — the measurable parameter and its upper/lower threshold
- **Monitoring Method** — instrument type, calibration status
- **Monitoring Frequency** — per batch, hourly, continuous
- **Responsible Person** — the role responsible for monitoring
- **Corrective Action** — pre-defined response to a limit deviation

## Recording CCP Monitoring Data

Navigate to **Food Safety → CCP Monitoring → Record Reading**. Select the CCP, enter the measured value, and confirm the result. IMS automatically compares the value against the critical limit and flags any deviation.

Sensor integration is available for continuous monitoring data (temperature loggers, inline pH sensors), with readings pushed directly to IMS via API.

## Critical Limit Breach Response

When a critical limit is breached, IMS:

1. Triggers an immediate alert to the food safety team
2. Locks the monitoring record pending corrective action
3. Prompts mandatory corrective action entry before production can continue

Record the immediate action taken, the disposition of potentially affected product, and the root cause investigation findings.

## CCP Monitoring Trend Analysis

The CCP compliance trend chart (accessible from the dashboard) shows compliance rate over time, helping identify CCPs with recurring issues before they become incidents.

## CCP Verification

Schedule periodic verification activities in IMS: calibration records for monitoring instruments, review of monitoring records, challenge testing results, and third-party verification audits.`,
  },

  {
    id: 'KB-DD5-004',
    title: 'Food Safety Inspections & Audits',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['food-safety', 'haccp', 'iso-22000'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Food Safety Inspections & Audits

## Overview

IMS supports the full range of food safety inspections and audits, from daily hygiene checks to regulatory inspections and HACCP verification audits.

## Inspection Types

- **Hygiene Inspection** — daily or shift-based GMP and cleanliness checks
- **GMP Audit** — periodic assessment of Good Manufacturing Practice compliance
- **Regulatory Inspection** — external authority visits (food safety authority, USDA, FSA)
- **Supplier Audit** — on-site assessment of approved suppliers
- **HACCP Verification Audit** — systematic review of HACCP plan implementation

## Creating an Inspection Checklist

Navigate to **Food Safety → Inspections → Checklists → New Checklist**. Organise questions into categories:

- **Premises** — structure, surfaces, drainage, pest control evidence
- **Equipment** — condition, cleanliness, calibration status
- **Personal Hygiene** — protective clothing, hand washing, jewellery, illness reporting
- **Product** — labelling, date coding, allergen segregation
- **Documentation** — records available, complete, and within date

## Conducting the Inspection on Mobile

Use the IMS mobile app to complete inspections on the floor. Score each question (pass/fail or percentage compliance), attach photographs as evidence, and raise findings directly from the checklist.

## Inspection Findings

Classify each finding as:

- **Major Non-Conformance** — immediate food safety risk, requires urgent corrective action
- **Minor Non-Conformance** — lower risk, corrective action required within agreed timeframe
- **Observation** — opportunity for improvement, no mandatory action

## Corrective Actions from Inspections

Non-conformances automatically generate corrective action records, assigned to the responsible area manager with a completion deadline.

## Inspection Trend Analysis

The inspection trend dashboard shows scores by area over time, identifying high-risk areas that require additional focus. Use this data to prioritise food safety improvement efforts and prepare for regulatory inspections.`,
  },

  {
    id: 'KB-DD5-005',
    title: 'Supplier & Ingredient Management',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['food-safety', 'haccp', 'iso-22000'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Supplier & Ingredient Management

## Overview

Effective supplier management is essential for controlling food safety hazards at the point of entry. IMS maintains the Approved Supplier List (ASL) and manages the complete supplier qualification and monitoring lifecycle.

## Approved Supplier List (ASL)

The ASL is the definitive register of suppliers approved to provide food ingredients, packaging, and services. Access via **Food Safety → Suppliers → Approved Supplier List**.

Each supplier record shows: approval status, risk classification, last audit date, next review date, and any active quality issues.

## Supplier Approval Process

1. **Questionnaire** — supplier self-assessment covering food safety standards, certifications, and controls
2. **Risk Assessment** — categorising the supplier by hazard risk (biological, chemical, allergen)
3. **Document Review** — certificates of conformity, third-party audit reports, FSSC 22000 or BRC certificates
4. **On-Site Audit** — for critical suppliers, a physical audit prior to approval
5. **Approval Decision** — approved, conditional, or rejected

## Supplier Risk Classification

- **Critical** — high-risk ingredients or sole-source suppliers requiring enhanced monitoring
- **Approved** — standard approved suppliers with regular review
- **Conditional** — approved with specific conditions or improvement actions outstanding

## Incoming Material Specifications

For each approved ingredient, maintain: allergen declarations, microbiological specifications, certificates of analysis (COA) requirements, and supplier guarantees of origin.

## Incoming Goods Inspection

Record goods receipt inspection results in IMS: delivery condition, COA review, sampling and test results. Reject non-conforming deliveries and raise supplier quality incidents.

## Supplier Performance Monitoring

Track delivery compliance, quality incident frequency, and audit scores. Suppliers with declining performance are flagged for review.

## Annual Supplier Review

Conduct an annual re-approval review for all ASL suppliers. IMS generates the review schedule and tracks completion status.`,
  },

  {
    id: 'KB-DD5-006',
    title: 'Traceability & Recall Management',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['food-safety', 'haccp', 'iso-22000'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Traceability & Recall Management

## Overview

IMS provides end-to-end traceability from incoming ingredients to finished product distribution, supporting both regulatory compliance and effective product recall management.

## Traceability Principles

ISO 22000 and regulatory requirements mandate traceability of at least one step forward (to customers) and one step back (to suppliers). IMS supports full chain traceability across all production steps.

## Traceability System Setup

Configure traceability in **Food Safety → Traceability → Setup**:

- Define lot/batch numbering conventions for raw materials and finished products
- Map incoming ingredient lots to production batches
- Link production batches to finished product lots
- Record distribution: customer, delivery date, lot number, quantity

## Mock Recall Drill

Conduct a periodic traceability test (mock recall) to verify system effectiveness. Navigate to **Food Safety → Traceability → Mock Recall**. Select a product lot, run the trace, and confirm that all affected ingredients and customers can be identified within four hours.

## Product Recall Classification

- **Class I** — serious health hazard, immediate recall required
- **Class II** — potential health hazard, recall within 24 hours
- **Class III** — unlikely to cause adverse health consequences, withdrawal preferred

## Recall Procedure

1. Confirm the food safety issue and affected lots
2. Notify the regulatory authority within required timeframes
3. Issue customer notifications with recall instructions
4. Retrieve and quarantine affected product
5. Document all steps in IMS as legal evidence

## Withdrawal vs Recall

A **withdrawal** is initiated by the manufacturer before the product reaches consumers. A **recall** occurs after distribution to consumers.

## Effectiveness Check

After recall completion, compare recovered quantity against total quantity distributed to calculate recall effectiveness. Document any gaps and corrective actions.

## Post-Recall Review

Conduct a full post-recall review to identify root cause, corrective actions, and HACCP plan updates required to prevent recurrence.`,
  },

  {
    id: 'KB-DD5-007',
    title: 'Food Safety Reporting & Dashboard',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['food-safety', 'haccp', 'iso-22000'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Food Safety Reporting & Dashboard

## Overview

The IMS Food Safety module provides a comprehensive reporting suite designed to support operational management, regulatory compliance, and ISO 22000 management review requirements.

## Food Safety Dashboard

The live dashboard displays:

- **CCP Compliance Rate** — percentage of CCP monitoring results within critical limits (current period)
- **Open Corrective Actions** — total open, by severity, overdue count
- **Supplier Approval Status** — approved, conditional, and suspended suppliers
- **Upcoming Audits** — inspections and audits scheduled in the next 30 days
- **Recent Incidents** — food safety incidents in the last 7 days

## Built-In Reports

Access all reports under **Food Safety → Reports**:

- **CCP Monitoring Summary** — all CCP readings for a selected period, compliance rate per CCP
- **HACCP Compliance Report** — HACCP plan verification status and outstanding actions
- **Inspection Scores Report** — inspection results by area, inspector, and time period
- **Supplier Performance Report** — ASL status, audit scores, and quality incident history
- **Corrective Action Status Report** — open, overdue, and closed actions with completion trends

## Regulatory Compliance Report

Generate evidence packs for authority inspections. The regulatory compliance report aggregates CCP monitoring records, corrective action evidence, calibration certificates, and training records into a single export.

## Management Review Food Safety Report

Provides leadership with: KPI trends, significant food safety incidents, audit results, supplier performance summary, and proposed improvement actions for the coming period.

## Allergen Management Report

Lists all products with declared allergens, identifies cross-contact risks by production line, and tracks allergen management controls in place.

## Export Formats

All reports export to PDF, Excel, or CSV for submission to regulatory authorities, certification bodies, and customer auditors. Records can be date-range filtered for any audit period.`,
  },

  {
    id: 'KB-DD5-008',
    title: 'Food Safety Best Practices (ISO 22000 / FSSC 22000)',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['food-safety', 'haccp', 'iso-22000'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Food Safety Best Practices (ISO 22000 / FSSC 22000)

## Overview

This article summarises the key requirements and best practices for operating a food safety management system aligned with ISO 22000:2018 and FSSC 22000 v6.

## ISO 22000:2018 Key Requirements

- **Interactive Communication** — maintaining food safety information across the supply chain, from suppliers through to customers
- **System Management** — integrating food safety with the broader management system (ISO 9001 alignment)
- **Pre-Requisite Programmes (PRPs)** — foundational hygiene and GMP conditions
- **HACCP Plan** — hazard analysis and CCP-based control measures
- **Emergency Preparedness** — plans for product contamination events, equipment failures, and supply chain disruptions

## FSSC 22000 Additional Requirements

FSSC 22000 adds sector-specific additional requirements including:

- **Food Fraud Vulnerability Assessment** — identifying economically motivated adulteration risks
- **Food Defence** — protecting the food supply from deliberate contamination
- **Allergen Management** — documented controls for allergen cross-contact
- **Environmental Monitoring Programme** — testing for pathogens in the production environment

## Pre-Requisite Programmes (PRPs)

Effective PRPs are the foundation of food safety. IMS manages: GMP compliance, cleaning and sanitation schedules, pest control programmes, temperature control monitoring, and allergen management procedures.

## Food Safety Culture

Leadership commitment is the single most important driver of food safety culture. Practices that build a strong food safety culture include:

- Visible senior management participation in food safety activities
- Recognition of food safety improvements by front-line staff
- Open reporting of food safety near misses without blame
- Regular food safety communication meetings

## Continual Improvement

Use non-conformances, CCP deviations, incidents, and audit findings as structured inputs to the food safety improvement cycle. Document improvement actions and verify their effectiveness before closing.

## Management Review Content

ISO 22000 management review must address: food safety KPI trends, changes affecting the food safety system, communication from external parties, and objectives for the coming period.`,
  },

  // ─── PERMIT TO WORK MODULE ────────────────────────────────────────────────

  {
    id: 'KB-DD5-009',
    title: 'Permit to Work Day-to-Day User Guide',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['ptw', 'permit-to-work', 'safety', 'hot-work'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Permit to Work Day-to-Day User Guide

## Overview

The Permit to Work (PTW) module provides a structured, auditable system for authorising and controlling high-risk maintenance and construction activities. This guide covers the daily activities of each PTW user role.

## PTW User Roles

- **Permit Requester** — contractor or maintenance technician requesting work authorisation
- **Permit Issuer** — competent person who reviews the hazard assessment and issues the permit
- **Permit Holder** — the person in physical control of the work; accepts responsibility for the work party
- **Area Authority** — site or area owner who grants access and coordinates with operations

## Daily PTW Activities

### Creating Permit Requests

Navigate to **PTW → New Permit Request**. Select the permit type, describe the work, specify the location, list all workers and contractors, define equipment to be used, and enter the planned start and end times.

### Reviewing Pending Permits

Permit Issuers see all permits awaiting their review under **PTW → Pending Approval**. Review the hazard assessment, verify control measures, and either issue or return the permit for revision.

### Checking Active Permits on Site

The **PTW → Active Permits** view shows all currently live permits on site, their locations, permit holders, and expiry times. Site managers use this view for daily briefings.

## PTW Dashboard

- Total active permits on site
- Permits pending approval
- Permits expiring within the next two hours
- Overdue permit closures

## Mobile Use

Access permit details on a mobile device by scanning the QR code displayed on the physical permit card at the worksite. IMS displays the full permit, control measures, and emergency contacts.

## Closing Out a Completed Permit

On work completion, the Permit Holder signs off the work as complete. The Area Authority accepts the handback, confirms the area is safe, and closes the permit in IMS.

## Emergency Permit Cancellation

Any area authority or site safety officer can cancel an active permit immediately via **PTW → Active Permits → Cancel**. The system records the reason and notifies all parties.`,
  },

  {
    id: 'KB-DD5-010',
    title: 'Creating & Issuing Permits',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['ptw', 'permit-to-work', 'safety', 'hot-work'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Creating & Issuing Permits

## Overview

This guide covers the end-to-end process for creating a permit request and issuing an authorised permit in IMS.

## Permit Types Available

IMS supports the following permit types, each with a type-specific checklist:

- **General Maintenance** — routine low-risk maintenance activities
- **Hot Work** — welding, cutting, grinding, or any ignition source
- **Confined Space Entry** — entry into permit-required confined spaces
- **Electrical Isolation** — work on electrical equipment requiring LOTO
- **Working at Height** — work above 2 metres using ladders, scaffolding, or MEWP
- **Excavation** — ground-breaking or trenching activities
- **Radiography** — non-destructive testing using ionising radiation sources

## Permit Request Form

The requester completes the following fields:

- **Job Description** — detailed scope of work
- **Location** — site, building, floor, plant number
- **Contractor Details** — company name, supervisor name, workers on permit
- **Equipment to Be Used** — tools, machinery, chemical substances
- **Planned Start and End Time** — including maximum validity period

## Hazard and Risk Assessment

The permit form automatically pulls relevant hazards from the H&S risk register based on the selected permit type and location. The requester reviews and supplements with job-specific hazards.

## Control Measures

Required control measures are pre-populated by permit type. Additional controls can be added. Examples include: gas testing, forced ventilation, fire watch standby, safety barriers, and PPE requirements.

## Permit Approval

The completed request is routed to the Area Authority for sign-off, then to the Permit Issuer. Both must approve before the permit is issued.

## Permit Issue

The Permit Issuer issues the permit simultaneously to the Permit Holder. The Permit Holder must acknowledge acceptance of the permit and confirm understanding of all control measures before work begins.

## Permit Validity

Maximum validity periods are enforced by permit type. Hot work permits are limited to 8 hours per issue. Confined space permits expire at shift end. A new permit must be issued for each new shift or each new scope of work.`,
  },

  {
    id: 'KB-DD5-011',
    title: 'Hot Work Permit Management',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['ptw', 'permit-to-work', 'safety', 'hot-work'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Hot Work Permit Management

## Overview

Hot work is one of the leading causes of industrial fires. IMS provides a dedicated hot work permit workflow with a mandatory pre-work checklist, fire watch requirements, and compliance tracking.

## Hot Work Definition

Hot work is any activity that produces a source of ignition, including:

- Welding (MIG, TIG, arc, gas)
- Flame cutting and grinding
- Soldering and brazing
- Use of heat guns or open flames
- Any activity producing sparks

## Fire Risk Assessment for Hot Work

Before issuing a hot work permit, the Issuer must confirm that a fire risk assessment has been completed for the specific work area. The assessment identifies all flammable and combustible materials within a 10-metre radius and specifies how they are to be managed (removal, shielding, wetting).

## Mandatory Control Measures

The IMS hot work permit checklist requires confirmation of:

- **Fire blankets and shields** — protecting combustible surfaces and structures
- **Fire extinguisher** — appropriate type, charged, and accessible at the worksite
- **Fire watch** — a dedicated fire watcher present throughout the work and for 30 minutes after completion
- **Hot work permit box** — physical permit displayed at the work location

## Hot Work Checklist

The IMS checklist has three sections: before work starts (area clear, equipment ready, fire watch briefed), during work (monitoring, fire watch in position), and after completion (fire watch period, area inspected, permit closed).

## Fire Watch Requirements

A fire watch person must be stationed at the hot work location for a minimum of 30 minutes after the last hot work activity ceases. They must have an operational fire extinguisher and direct communication with the site emergency response team.

## Hot Work Audit

Safety officers can conduct live audits of active hot work permits from the PTW module, verifying that permits are displayed, control measures are in place, and fire watch is positioned correctly.

## Statistics and Trend Monitoring

The hot work compliance dashboard tracks hot work incidents, near misses, and permit compliance rates over time to support continuous improvement of the hot work control programme.`,
  },

  {
    id: 'KB-DD5-012',
    title: 'Confined Space Entry Permits',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['ptw', 'permit-to-work', 'safety', 'hot-work'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Confined Space Entry Permits

## Overview

Confined space entry carries significant risk of fatalities from atmospheric hazards, engulfment, and restricted rescue access. The IMS confined space entry permit provides the structured controls required by regulations such as OSHA 29 CFR 1910.146 and UK Confined Spaces Regulations 1997.

## Confined Space Classification

- **Non-Permit Confined Space** — large enough for a person to enter, limited entry/exit, not designed for continuous occupancy, but contains no serious hazards
- **Permit-Required Confined Space** — contains or has the potential to contain a serious atmospheric hazard, material that could engulf an entrant, or other recognised serious safety or health hazard

## Pre-Entry Requirements

Before any entry, the IMS permit requires confirmation of:

- **Atmospheric Testing** — oxygen level (19.5–23.5%), flammable gas (below 10% LEL), toxic gas (H2S, CO below TLV)
- **Mechanical Isolation** — blanking, blinding, or double-block-and-bleed of all process connections
- **Ventilation** — forced ventilation running throughout the entry period

## Entry Team Roles

- **Entrant** — the person entering the confined space
- **Attendant** — remains outside, monitors the entrant and atmosphere, never enters
- **Entry Supervisor** — authorises entry, cancels the permit if conditions change

## Rescue Plan

Each confined space entry permit requires a documented rescue plan, including emergency contact numbers, rescue equipment location, and designated rescue team. Non-entry rescue (mechanical retrieval) is required wherever practicable.

## Atmospheric Monitoring

Continuous atmospheric monitoring is required during the entire entry period. IMS records test results (initial and periodic) as part of the permit record.

## Permit Cancellation

The attendant or entry supervisor must cancel the permit immediately if: atmospheric conditions deteriorate, the entrant shows signs of distress, or an emergency occurs on site.`,
  },

  {
    id: 'KB-DD5-013',
    title: 'Electrical Isolation & LOTO Permits',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['ptw', 'permit-to-work', 'safety', 'hot-work'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Electrical Isolation & LOTO Permits

## Overview

Lockout/Tagout (LOTO) is a critical safety procedure for preventing unexpected energisation of equipment during maintenance. IMS provides a dedicated electrical isolation permit type with a structured LOTO workflow.

## Lockout/Tagout Overview

LOTO ensures that hazardous energy (electrical, mechanical, pneumatic, hydraulic, thermal, chemical) is isolated and cannot be re-energised while maintenance work is in progress. The IMS permit supports OSHA 29 CFR 1910.147 and equivalent national regulations.

## Electrical Isolation Permit Requirements

The permit specifies:

- **Scope of Isolation** — exact equipment and circuits to be isolated
- **Equipment List** — switchgear, breaker panels, motor control centres
- **Authorised Person** — the competent electrical person who performs the isolation
- **Energy Sources** — all forms of energy to be controlled (not just electrical)

## Isolation Verification: Test Before Touch

After isolation is applied, the permit requires confirmation that the authorised person has:

1. Attempted to start the equipment (to verify de-energisation)
2. Used a calibrated voltage tester to confirm absence of voltage at the point of work
3. Recorded test results in IMS before any work begins

## Lock Application

The one-lock-per-person rule applies: every person working on the isolated equipment applies their own personal lock and key to the isolation point. No work begins until all personal locks are applied.

## Personal Danger Tags

Each lock is accompanied by a personal danger tag in IMS, recording the permit holder's name, permit number, date, and time of lock application.

## Reinstatement Procedure

Before re-energisation, the permit holder must confirm all work is complete, all workers are clear, all tools are removed, and all personal locks and tags have been removed in the correct sequence.

## Multi-Energy Isolation

For complex plant, the permit covers isolation of all energy forms simultaneously: electrical isolation, mechanical pinning, pneumatic venting, and hydraulic depressurisation.`,
  },

  {
    id: 'KB-DD5-014',
    title: 'PTW Risk Assessment Integration',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['ptw', 'permit-to-work', 'safety', 'hot-work'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# PTW Risk Assessment Integration

## Overview

The IMS PTW module integrates directly with the H&S Risk Assessment module, ensuring that permit hazard assessments draw on the organisation's established risk register rather than being completed from scratch each time.

## Linking PTW to the H&S Risk Assessment Module

When creating a permit, the requester selects the work type and location. IMS automatically retrieves relevant existing risk assessments from the H&S module, pre-populating the hazard list and associated control measures for that activity and location.

## Dynamic Risk Assessment

Before work starts, the permit holder is required to conduct a dynamic (on-site) risk assessment to account for conditions on the day that may differ from the generic risk assessment. Factors to consider include weather conditions, other activities in the area, and equipment status.

## Job Safety Analysis (JSA) within the Permit

For higher-risk tasks, the permit form includes a Job Safety Analysis (JSA) section where the task is broken into individual steps, and hazards and controls are recorded for each step. This JSA is reviewed by the permit issuer before issue.

## Site-Specific Hazards

IMS maintains a location-based hazard register. When a permit is raised for a specific plant or area, additional site-specific hazards (overhead lines, underground services, process hazards) are automatically included in the permit hazard list.

## PPE Requirements

PPE requirements are auto-populated from the risk assessment data. The permit holder confirms that all specified PPE is available and in good condition before accepting the permit.

## Emergency Response

Each permit includes a link to the site emergency procedures for the work location, including muster points, emergency contacts, and first aid arrangements.

## Last-Minute Risk Assessment (LMRA)

The IMS permit includes an LMRA prompt: a brief daily briefing conducted at the worksite immediately before work starts, confirming that conditions match the permit and no new hazards have emerged.`,
  },

  {
    id: 'KB-DD5-015',
    title: 'PTW Reporting & Compliance',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['ptw', 'permit-to-work', 'safety', 'hot-work'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# PTW Reporting & Compliance

## Overview

The PTW module provides a comprehensive reporting suite to demonstrate compliance, identify non-conformances, and support continuous improvement of the permit system.

## PTW Compliance Dashboard

The live dashboard shows:

- **Active Permits on Site** — current count by permit type
- **Pending Approval** — permits awaiting issuer or area authority sign-off
- **Compliance Rate** — percentage of permits closed within validity period
- **Overdue Closures** — permits past their end time without formal closure

## Overdue Permit Report

Navigate to **PTW → Reports → Overdue Permits** to see all permits that have exceeded their validity period without being formally closed. Overdue permits represent a compliance gap and must be investigated.

## Permit Audit

Safety officers can use the **PTW → Audit** function to conduct a random spot-check of active permits. The audit form records whether the permit is physically displayed, whether control measures are in place, and whether the permit holder is aware of all permit requirements.

## PTW Statistics

Generate permit statistics by: permit type, contractor, work location, time period, and issuer. These statistics support identification of high-risk work types and locations requiring additional attention.

## Regulatory Compliance

PTW records serve as legal documentation demonstrating that high-risk work was properly authorised and controlled. In the event of an incident, the permit record provides an audit trail of who authorised the work, what controls were specified, and whether they were implemented.

## Permit Record Retention

IMS retains all PTW records for a minimum of three years (or longer if required by local regulation). Records are tamper-evident and include a full audit trail of all actions.

## PTW Audit Trail

Every action on a permit — creation, amendment, approval, issue, closure, or cancellation — is logged with the user, timestamp, and any comments. This audit trail is available for all permits and is immutable.`,
  },

  {
    id: 'KB-DD5-016',
    title: 'Permit to Work Best Practices',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['ptw', 'permit-to-work', 'safety', 'hot-work'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Permit to Work Best Practices

## Overview

A permit to work system is only as effective as the culture that surrounds it. This article outlines the best practices that distinguish high-performing PTW systems from those that exist on paper only.

## PTW System Design

Design the PTW system to balance rigorous control with operational practicality. Over-complicated permit forms lead to shortcuts; too simple and critical controls are missed. Involve operations, maintenance, and safety in the design process.

## Training Requirements

All permit users — requesters, issuers, holders, and area authorities — must complete role-specific PTW training and demonstrate competency before being granted system access. Refresher training is required annually.

## Contractor PTW Induction

All contractors must complete a site PTW induction before their first on-site activity. The induction covers: site rules, permit types, how to request a permit, and emergency procedures. Record completion in IMS under **PTW → Contractor Inductions**.

## Daily Site Permit Meetings

Hold a daily permit meeting — ideally at shift start — where the site safety officer reviews all active permits, upcoming work, and any conflicts between simultaneous activities in adjacent areas.

## Permit Card Display

The physical permit card or IMS QR code must be displayed prominently at the work location throughout the permit validity period. Anyone approaching the work area should be able to see the permit at a glance.

## No Permit, No Work

The single most important cultural rule: no high-risk work begins without a valid permit in place. Leadership must enforce this consistently, including stopping work when a permit is found to be absent or expired.

## Continuous Improvement

Review PTW near misses and incidents at the monthly safety committee meeting. Use learning from these events to improve the permit forms, checklists, and training programme. Track near-miss reporting rates as a measure of PTW safety culture maturity.`,
  },

  // ─── ASSET LIFECYCLE MANAGEMENT ──────────────────────────────────────────

  {
    id: 'KB-DD5-017',
    title: 'Asset Management Day-to-Day User Guide',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['assets', 'asset-management', 'iso-55001'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Asset Management Day-to-Day User Guide

## Overview

The Asset Lifecycle module provides a centralised register for all physical assets, supporting inspection scheduling, defect reporting, maintenance tracking, and financial integration across the full asset lifecycle.

## Daily Asset Management Tasks

### Recording Asset Inspections

Navigate to **Assets → Inspections → Record Inspection**. Select the asset, choose the inspection type, complete the checklist, record measurements, and upload any photographs. The inspection result (pass/fail/defect found) is recorded against the asset history.

### Updating Asset Status

Asset status can be updated from the asset record: **Assets → Register → [Asset] → Update Status**. Statuses include: operational, standby, under repair, out of service, and disposed.

### Logging Defects

When a defect is identified during an inspection or routine operation, log it immediately via **Assets → Defects → New Defect**. Assign severity (critical, high, medium, low), describe the defect, and assign an owner for remediation.

## Asset Register Navigation

Search the asset register by:

- **Asset Number** — unique IMS-generated or organisation-defined identifier
- **Location** — site, building, plant area
- **Asset Type** — vehicle, plant, equipment, infrastructure, IT asset
- **Status** — operational, standby, disposed

## Asset Dashboard

The dashboard displays:

- Total assets by operational status
- Assets due for inspection in the next 7 and 30 days
- Assets currently under repair
- Critical assets with open defects
- Recent defect reports

## Quick Actions

Use the asset record quick-action buttons for: log defect, schedule inspection, record meter reading, and view maintenance history.

## Mobile Use

Scan the QR code on any asset tag using the IMS mobile app to instantly access the asset record, view open defects, check the inspection history, and log a new reading or defect.`,
  },

  {
    id: 'KB-DD5-018',
    title: 'Asset Registry & Classification',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['assets', 'asset-management', 'iso-55001'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Asset Registry & Classification

## Overview

A well-structured asset register is the foundation of effective asset management. This article describes the IMS asset register fields, hierarchy, classification system, and data quality standards.

## Asset Register Fields

Each asset record contains:

- **Asset ID** — unique identifier (auto-generated or imported)
- **Asset Name** — descriptive name
- **Description** — manufacturer, model, serial number, year of manufacture
- **Asset Type** — vehicle, plant and machinery, building, infrastructure, IT equipment, furniture
- **Location** — site, building, floor, plant area
- **Custodian** — person or team responsible for the asset
- **Cost Centre** — financial cost centre for depreciation and maintenance cost allocation
- **Purchase Date and Cost** — acquisition information
- **Warranty Expiry** — warranty period details

## Asset Hierarchy

IMS supports a multi-level asset hierarchy to represent complex relationships:

- **Fleet → Vehicle** (e.g., Transport Fleet → HGV-001)
- **Plant → Equipment → Component** (e.g., Production Plant → Conveyor System → Drive Motor)
- **Building → System → Component** (e.g., Building A → HVAC System → Air Handling Unit 1)

## Asset Classification

Assets are classified across three dimensions:

- **Operational Status** — active, standby, under repair, decommissioned, disposed
- **Criticality** — critical (failure causes production stoppage or safety risk), essential (significant impact), general (limited impact)
- **Ownership** — owned, leased, hired, or managed on behalf of a third party

## Asset Master Data Quality

IMS tracks completeness score for each asset record. Records missing key fields (purchase date, location, custodian) are flagged in the data quality report.

## Asset Import

Use **Assets → Import** to bulk-upload asset data from a CSV or Excel spreadsheet. The import wizard maps spreadsheet columns to IMS fields and validates data before import.`,
  },

  {
    id: 'KB-DD5-019',
    title: 'Asset Lifecycle Management',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['assets', 'asset-management', 'iso-55001'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Asset Lifecycle Management

## Overview

IMS supports the complete asset lifecycle from initial planning and acquisition through to final disposal, capturing cost and condition data at every stage.

## Asset Lifecycle Phases

### 1. Plan

Asset requirements are identified during the planning phase. IMS records: the business case, estimated cost, specification, and procurement route. Long-lead items are flagged for early procurement action.

### 2. Acquire

On acquisition, record: purchase order number, supplier, delivery date, purchase price, and commissioning date. Upload the delivery docket, warranty certificate, and any commissioning test records.

### 3. Operate

During the operational phase, IMS tracks: inspections, meter readings, defects, modifications, and operator assignments. The asset history view provides a complete chronological record of all activities.

### 4. Maintain

Planned and corrective maintenance activities are recorded via integration with the CMMS module. Maintenance costs are accumulated against the asset record for lifecycle cost analysis.

### 5. Dispose

The disposal process includes: decommissioning checklist (energy isolation, fluid draining, data sanitisation for IT assets), disposal method (sale, scrap, donation, return to lessor), and disposal certificate upload. The asset status is set to 'Disposed' and the record is archived.

## Asset Modifications

Significant modifications to an asset (changes to rated capacity, operating parameters, or safety features) require a formal change control record in IMS, including risk assessment and approval sign-off.

## Lifecycle Cost Analysis

IMS calculates the total cost of ownership for each asset: acquisition cost + cumulative maintenance cost + inspection cost − residual value. This supports replacement vs repair decisions.

## Asset Replacement Planning

For critical assets approaching end of life, IMS supports residual life assessment, flagging assets for replacement planning with lead time warnings so procurement can begin in time.`,
  },

  {
    id: 'KB-DD5-020',
    title: 'Asset Maintenance Planning',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['assets', 'asset-management', 'iso-55001'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Asset Maintenance Planning

## Overview

Effective maintenance planning is central to asset reliability and availability. IMS supports a risk-based approach to maintenance strategy selection and plan creation.

## Maintenance Strategy by Asset Criticality

IMS uses asset criticality to drive maintenance strategy selection:

- **Critical assets** — predictive maintenance (condition monitoring) and/or reliability-centred maintenance (RCM) analysis
- **Essential assets** — planned preventive maintenance (PPM) with regular condition checks
- **General assets** — time-based preventive maintenance or run-to-failure where appropriate

## Maintenance Plan Creation

Navigate to **Assets → Maintenance Plans → New Plan**. For each maintenance task, record:

- **Task Description** — what is to be done
- **Maintenance Type** — preventive, predictive, corrective
- **Interval** — time-based (every 3 months) or usage-based (every 500 hours)
- **Skills Required** — competency requirements for the technician
- **Estimated Time** — planned hours per task
- **Materials and Spare Parts** — parts list with stock codes

## Integration with CMMS

Asset maintenance plans in IMS integrate with the CMMS module. When a maintenance interval falls due, a work order is automatically generated in CMMS and assigned to the relevant maintenance team.

## Asset Reliability Tracking

IMS calculates and displays reliability metrics for each asset:

- **MTBF** (Mean Time Between Failures) — average time between unplanned breakdowns
- **MTTR** (Mean Time to Repair) — average time to restore the asset to service
- **Availability %** — MTBF / (MTBF + MTTR) × 100

## Condition Monitoring

Record condition monitoring results (vibration readings, thermography images, oil analysis reports) directly against the asset record. IMS alerts when condition monitoring results exceed defined thresholds.

## Maintenance Cost Tracking

All maintenance costs — labour, parts, and contractor costs — are accumulated against the asset record, supporting whole-life cost analysis and maintenance budget management.`,
  },

  {
    id: 'KB-DD5-021',
    title: 'Asset Depreciation & Financial Integration',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['assets', 'asset-management', 'iso-55001'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Asset Depreciation & Financial Integration

## Overview

The Asset Lifecycle module integrates with the Finance module to manage asset depreciation, revaluation, and disposal accounting in accordance with IAS 16 and applicable local accounting standards.

## Depreciation Methods

IMS supports three depreciation methods:

- **Straight-Line** — equal depreciation charge each year (cost − residual value) / useful life
- **Reducing Balance** — fixed percentage applied to the net book value each year
- **Units of Production** — depreciation based on actual usage (machine hours, kilometres)

## Depreciation Setup

For each asset, configure: asset category (determining the default method and useful life), purchase cost, residual value, depreciation start date, and useful life in years or usage units.

## Monthly Depreciation Calculation

IMS calculates monthly depreciation for all active assets and passes journal entries to the Finance module. The journal records: debit depreciation expense (P&L), credit accumulated depreciation (balance sheet).

## Asset Revaluation

Where assets are revalued to fair value (e.g., land and buildings), IMS records: the revaluation date, revalued amount, and any revaluation surplus or deficit. Revaluation surplus is credited to the revaluation reserve in equity.

## Disposal Accounting

On asset disposal, IMS calculates the profit or loss on disposal: proceeds of sale − net book value at disposal date. The journal eliminates the cost and accumulated depreciation and records the disposal gain or loss.

## Capital vs Operating Expenditure

IMS enforces the organisation's capitalisation policy: items above the threshold value are capitalised (added to the asset register); items below are expensed immediately.

## Asset Register Reconciliation

Finance teams can reconcile the IMS asset register to the financial fixed asset register at any time using the **Assets → Reports → Financial Reconciliation** report.

## Impairment Testing

For assets showing indicators of impairment, IMS records the impairment test, the recoverable amount, and any impairment loss recognised in accordance with IAS 36.`,
  },

  {
    id: 'KB-DD5-022',
    title: 'Asset Inspections & Condition Monitoring',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['assets', 'asset-management', 'iso-55001'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Asset Inspections & Condition Monitoring

## Overview

Regular inspections and condition monitoring are the primary tools for understanding asset health and predicting maintenance requirements before failure occurs.

## Inspection Types

IMS supports the following inspection categories:

- **Statutory Inspections** — legally required inspections such as Thorough Examination (PSSR), LOLER lifting equipment inspection, and pressure vessel certification
- **Planned Preventive Inspections** — scheduled visual and functional checks at defined intervals
- **Condition-Based Inspections** — triggered when condition monitoring data exceeds a threshold
- **Reactive Inspections** — following a defect report or breakdown

## Inspection Scheduling

Statutory inspection frequencies are hard-coded by asset type (e.g., LOLER lifting equipment every 6 months, pressure vessels as per written scheme of examination). Planned preventive inspection frequencies are configured per asset or asset category.

## Inspection Checklist

Each inspection type has a digital checklist in IMS with:

- Pass/fail criteria for each item
- Space for measurement recording (e.g., insulation resistance, torque values)
- Photo capture capability
- Defect recording linked directly to the asset defect register

## Inspection Findings

Classify each finding as:

- **Defect** — a specific fault requiring remedial action (assigned severity and deadline)
- **Observation** — a condition to be monitored but not yet requiring action
- **Pass** — item checked and found satisfactory

## Inspection Compliance Report

The **Assets → Reports → Inspection Compliance** report shows all assets with overdue inspections, providing a tool for compliance management and regulatory audit preparation.

## Condition Rating

IMS uses a 1–5 condition rating scale: 1 (as new), 2 (good), 3 (fair — monitoring required), 4 (poor — maintenance required), 5 (very poor — immediate action required).

## Predictive Maintenance Triggers

Configure condition thresholds in IMS. When a condition monitoring reading (e.g., vibration velocity) exceeds the threshold, IMS automatically generates an alert and a predictive maintenance work order in CMMS.`,
  },

  {
    id: 'KB-DD5-023',
    title: 'Asset Reporting & Dashboard',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['assets', 'asset-management', 'iso-55001'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Asset Reporting & Dashboard

## Overview

The IMS Asset Lifecycle module provides a comprehensive suite of reports and dashboards supporting operational management, financial reporting, and ISO 55001 management review requirements.

## Asset Dashboard

The live dashboard displays:

- **Total Assets** — by status (active, standby, under repair, disposed)
- **Operational Availability %** — active assets as a percentage of total managed fleet
- **Critical Assets** — count and current status
- **Assets by Location** — geographical or site-based breakdown
- **Upcoming Inspections** — next 7 days and next 30 days

## Built-In Reports

Access all reports from **Assets → Reports**:

- **Asset Register Export** — full register with all metadata in Excel or CSV
- **Maintenance History** — all maintenance activities for a selected asset or asset category
- **Inspection Compliance** — assets overdue for inspection with regulatory flag
- **Lifecycle Cost** — acquisition, maintenance, and disposal costs by asset
- **Depreciation Schedule** — monthly and annual depreciation charges by asset category

## Asset Age Profile

The age profile histogram shows the distribution of asset ages across the fleet, helping identify ageing asset populations requiring replacement planning.

## Reliability Report

The reliability report shows MTBF and MTTR trends by asset type and location, with a comparison to the previous period to identify improving or deteriorating asset groups.

## Maintenance Cost per Asset

A year-on-year comparison of total maintenance spend per asset, used to identify assets where maintenance cost is approaching or exceeding replacement cost.

## Asset Disposal Report

Lists all assets disposed during the period, with disposal method, disposal proceeds, and profit or loss on disposal.

## ISO 55001 Management Review

The ISO 55001 management review report provides: asset management objectives and performance, risk register status, compliance with statutory inspection requirements, and lifecycle cost summary for management decision-making.`,
  },

  {
    id: 'KB-DD5-024',
    title: 'Asset Management Best Practices (ISO 55001)',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['assets', 'asset-management', 'iso-55001'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Asset Management Best Practices (ISO 55001)

## Overview

ISO 55001:2014 provides the framework for a systematic Asset Management System (AMS). This article summarises the key requirements and best practices for organisations seeking certification or alignment.

## ISO 55001 Key Requirements

- **Asset Management Policy** — leadership commitment to asset management, aligned with the organisation's objectives
- **Strategic Asset Management Plan (SAMP)** — the long-term plan for how assets will deliver organisational value
- **Asset Management Objectives** — specific, measurable targets for asset performance, cost, and risk
- **Performance Evaluation** — monitoring, measurement, analysis, and evaluation of asset management performance
- **Continual Improvement** — systematic improvement driven by performance data and audit findings

## Aligning with ISO 55000 Concepts

ISO 55000 defines the conceptual framework: value (assets exist to deliver value), alignment (asset decisions are linked to organisational objectives), leadership (top management enables the AMS), assurance (confidence in the AMS), and learning (the AMS improves from experience).

## Value Realisation

Demonstrate asset management ROI by tracking: reduction in unplanned downtime, reduction in maintenance cost per asset, improvement in asset availability, and extension of asset useful life through better maintenance.

## Risk-Based Asset Management

Use asset criticality as the primary driver for all asset management decisions: maintenance strategy, inspection frequency, spare parts holding, and replacement planning. Higher criticality justifies higher investment in preventive and predictive maintenance.

## Whole Life Costing

Evaluate all major asset investment decisions using whole life cost analysis, comparing: acquisition cost, installation, commissioning, operational costs, maintenance, inspection, and end-of-life disposal costs.

## Stakeholder Engagement

Communicate asset management performance to key stakeholders: finance teams (depreciation, capex plan), operations (availability and reliability KPIs), executives (strategic asset plan progress), and regulators (statutory compliance).

## Competency

Ensure that all personnel involved in asset management activities hold relevant qualifications and competencies: engineering, financial management, statutory inspection, and condition monitoring.`,
  },

  // ─── COMPLAINTS MANAGEMENT MODULE ────────────────────────────────────────

  {
    id: 'KB-DD5-025',
    title: 'Complaints Management Day-to-Day User Guide',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['complaints', 'customer-complaints', 'customer-satisfaction'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Complaints Management Day-to-Day User Guide

## Overview

The IMS Complaints Management module provides a structured workflow for receiving, investigating, resolving, and analysing customer complaints. This guide covers the day-to-day tasks for complaints handlers.

## Daily Tasks Checklist

### Reviewing New Complaints

Begin each day by reviewing the **Complaints → Inbox** view, which shows all complaints received since your last session. Acknowledge any new complaints to start the SLA timer and assign an investigation owner.

### Updating Investigation Status

Progress open complaints through the investigation workflow: **Complaints → Open → [Complaint] → Update Status**. Add investigation notes, evidence attachments, and interim communications at each stage.

### Checking SLA Timers

The SLA countdown is displayed for each complaint. Priority cases are highlighted when approaching their resolution deadline. Act promptly on any complaints in the amber or red SLA zone.

## Complaints Dashboard

The dashboard provides an at-a-glance view of:

- **Open by Status** — new, under investigation, awaiting response, resolved
- **Average Resolution Time** — current period vs target
- **SLA Compliance Rate** — percentage resolved within SLA
- **Customer Satisfaction Scores** — post-resolution survey results

## Quick Actions

Use the dashboard quick-action buttons to: log a new complaint, update an existing case status, send a customer response, and view overdue cases.

## Complaint Intake Channels

Complaints can be received via:

- **Web Form** — customer self-service submission from the portal
- **Email** — auto-ingested via email-to-complaint integration
- **Phone Log** — manually entered by the complaints handler
- **Customer Portal** — logged by the customer directly in the portal

## Viewing Customer Complaint History

Search for a customer in **Complaints → Customers** to view their complete complaint history: dates, categories, resolutions, and satisfaction scores.

## Mobile Access

The IMS mobile app provides complaints handlers with access to open cases, enabling response and status updates from the field.`,
  },

  {
    id: 'KB-DD5-026',
    title: 'Logging & Categorising Complaints',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['complaints', 'customer-complaints', 'customer-satisfaction'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Logging & Categorising Complaints

## Overview

Accurate logging and categorisation of complaints is the foundation of effective complaints management. Consistent data ensures reliable trend analysis and SLA management.

## Required Complaint Fields

Every complaint must include:

- **Complainant Name and Contact Details** — full name, email, phone number
- **Date Received** — auto-stamped on submission, manually entered for phone complaints
- **Channel** — web form, email, phone, portal, in-person
- **Product or Service** — the specific product, service, or transaction related to the complaint
- **Complaint Description** — full narrative of the issue as described by the complainant
- **Severity** — classification by impact and urgency

## Severity Levels

Classify complaint severity at the point of logging:

- **Critical** — immediate risk to health, safety, or significant financial harm; SLA 24 hours
- **Major** — significant impact on customer relationship or regulatory implications; SLA 3 working days
- **Moderate** — notable service failure with material impact; SLA 5 working days
- **Minor** — low-impact issue, no safety or regulatory element; SLA 10 working days

## Complaint Categories

Classify complaints by category to support trend analysis:

- **Product Quality** — defective, damaged, or non-conforming product
- **Service Delivery** — late delivery, missed appointment, poor service
- **Billing** — invoice errors, overcharging, disputed charges
- **Employee Conduct** — behaviour, communication, or professionalism concerns
- **Safety** — safety-related concerns with a product or service
- **Regulatory** — potential regulatory non-compliance

## Automatic Acknowledgement

When a complaint is logged, IMS automatically sends an acknowledgement to the complainant with the complaint reference number, expected response time, and contact details. The SLA timer starts from the moment of receipt.

## Assignment

Route the complaint to the responsible team based on category: quality complaints to the Quality team, billing complaints to Finance, employee conduct to HR, and safety concerns to the H&S team.

## Duplicate Check

Before logging a new complaint, IMS searches for existing complaints from the same complainant on the same issue. Duplicates are linked rather than logged separately.`,
  },

  {
    id: 'KB-DD5-027',
    title: 'Complaint Investigation Process',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['complaints', 'customer-complaints', 'customer-satisfaction'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Complaint Investigation Process

## Overview

A structured investigation process ensures that each complaint is handled consistently, thoroughly, and within the agreed SLA timeframe.

## Investigation SLA by Severity

- **Critical** — response to complainant within 24 hours; full investigation within 3 working days
- **Major** — response within 3 working days; full resolution within 5 working days
- **Moderate** — response within 5 working days; full resolution within 10 working days
- **Minor** — response within 10 working days; full resolution within 15 working days

## Investigation Steps

The IMS complaint workflow moves through the following stages:

1. **Acknowledge** — confirm receipt to the complainant; SLA timer starts
2. **Gather Information** — collect all relevant records, transaction history, photos, delivery records
3. **Investigate Root Cause** — determine why the issue occurred using structured root cause methods
4. **Determine Resolution** — decide on the appropriate resolution option
5. **Respond** — communicate the outcome to the complainant in writing
6. **Close** — confirm complainant satisfaction; send post-resolution survey

## Fact-Finding

Access relevant supporting information directly from IMS: sales transaction records, delivery logs, quality inspection records, CCP monitoring data, and production records. Attach all evidence to the complaint record.

## Stakeholder Interviews

Where staff conduct is involved, or where witness accounts are needed, document interview notes in the complaint record. Record who was interviewed, the date, and a summary of information provided.

## Interim Response

For complex investigations that cannot be resolved within the initial SLA period, send an interim update to the complainant explaining: what investigation has been done so far, what is still outstanding, and the revised expected resolution date.

## Investigation Notes

All investigation actions are recorded in the IMS complaint timeline, providing a full audit trail: who did what, when, and what decision was made at each stage.`,
  },

  {
    id: 'KB-DD5-028',
    title: 'Customer Communication & Resolution',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['complaints', 'customer-complaints', 'customer-satisfaction'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Customer Communication & Resolution

## Overview

Effective customer communication is critical to complaint resolution. IMS provides response templates, tone guidance, and automated resolution letter generation to ensure consistent, professional communication.

## Response Templates

IMS includes standard response templates for each communication stage:

- **Acknowledgement** — confirming receipt and SLA commitment
- **Interim Update** — progress communication during a complex investigation
- **Resolution Letter** — formal written outcome and any remedies offered
- **Closure Confirmation** — confirming the complaint is resolved and inviting satisfaction feedback

## Personalisation

All templates automatically merge the complainant's name, complaint reference number, date, and relevant complaint details. Review the merged content before sending to ensure accuracy.

## Communication Tone Guidelines

Complaint responses should be:

- **Empathetic** — acknowledge the customer's experience and how it affected them
- **Professional** — formal and courteous throughout
- **Factual** — stick to the facts established during the investigation; avoid speculation
- **Action-Oriented** — clearly state what will be done and by when

## Resolution Options

Based on the investigation outcome, select the appropriate resolution:

- **Apology** — formal written apology where the complaint is upheld
- **Replacement** — replacing a defective product
- **Refund or Credit** — financial remedy for demonstrable loss
- **Corrective Action** — commitment to systemic improvements
- **No Further Action** — where the complaint is not upheld, with a clear explanation

## Resolution Letter Generation

IMS auto-generates the resolution letter using the selected template, populated with investigation findings and the chosen resolution. Review and edit before sending.

## Customer Satisfaction Follow-Up

Seven days after resolution, IMS automatically sends a satisfaction survey to the complainant, measuring satisfaction with the handling and outcome. Results feed directly to the complaints dashboard.

## Escalation

If the complainant remains unsatisfied after the initial resolution, the complaint is escalated to the complaints manager for review and a final response.`,
  },

  {
    id: 'KB-DD5-029',
    title: 'Root Cause Analysis & Corrective Actions',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['complaints', 'customer-complaints', 'customer-satisfaction'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Root Cause Analysis & Corrective Actions

## Overview

Resolving individual complaints is not enough — preventing recurrence requires identifying and addressing root causes. IMS integrates complaint root cause analysis with the Quality module's corrective action workflow.

## Root Cause Methods for Complaints

IMS supports two primary root cause analysis methods:

- **5 Whys** — repeatedly asking 'why' to drill down from symptom to root cause; effective for straightforward single-cause issues
- **Fishbone (Ishikawa) Diagram** — categorising potential causes across dimensions: people, process, equipment, materials, measurement, and environment; effective for complex multi-cause issues

## Linking to Quality Non-Conformances

Where a complaint reveals a product or process deficiency, link the complaint to a non-conformance record in the Quality module. This ensures that the complaint is addressed both as an individual customer issue and as a systemic quality failure.

## CAPA Creation

For complaints that identify systemic root causes — affecting multiple customers or indicating a process failure — create a formal Corrective Action and Preventive Action (CAPA) record. The CAPA workflow manages: root cause confirmation, corrective action planning, implementation, and effectiveness verification.

## Preventive Actions

Where the root cause analysis identifies potential failure modes that have not yet resulted in complaints, raise preventive actions to close the gap before complaints occur.

## Communicating Corrective Actions to Complainants

Where appropriate, inform the complainant of the systemic corrective action being taken. This demonstrates that the organisation takes their complaint seriously and is committed to improvement.

## Verification of Effectiveness

After a corrective action is implemented, monitor complaint volumes in the affected category for the following quarter. A reduction in similar complaints confirms effectiveness.

## Complaint-Driven Improvement

Use monthly complaint trend data as a structured input to quality improvement initiatives, product development reviews, and service design workshops.`,
  },

  {
    id: 'KB-DD5-030',
    title: 'Complaint Trend Analysis',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['complaints', 'customer-complaints', 'customer-satisfaction'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Complaint Trend Analysis

## Overview

Analysing complaint trends transforms individual complaints into strategic business intelligence, identifying systemic quality failures before they escalate and tracking the impact of improvement actions.

## Complaint Volume Trend

The volume trend chart in **Complaints → Analytics → Volume Trend** shows total complaints received per week, month, and year. Compare current period volume to the same period in prior years to identify seasonal patterns or overall improvement trends.

## Top Complaint Categories

Use the Pareto chart (**Complaints → Analytics → Category Analysis**) to identify the top 20% of complaint categories generating 80% of complaint volume. Focus improvement efforts on these high-frequency categories first.

## Product and Service Quality Hotspots

Drill down from category to product or service level. Identify specific SKUs, service types, or delivery routes with disproportionately high complaint rates. These hotspots require targeted investigation and corrective action.

## Repeat Complainant Identification

IMS flags customers who have submitted three or more complaints in a 12-month period. While some repeat complainants have genuine recurring issues, others may indicate a relationship management problem requiring senior account management intervention.

## Root Cause Distribution

The root cause distribution chart shows which root cause categories (people, process, product, supplier, system) are driving the most complaints. This guides where improvement investment will have the greatest impact.

## Resolution Time Trend

Track average resolution time by month and severity. An improving trend confirms that the complaints team is operating more efficiently; a worsening trend signals a resource or process problem requiring management attention.

## Customer Satisfaction Trends

Plot average post-resolution satisfaction scores over time. Improving satisfaction scores indicate that the resolution quality is improving, even if complaint volumes remain constant.

## Complaint Cost Analysis

Estimate the total cost of poor quality arising from complaints: refunds, replacements, investigation time, and customer churn attributable to unresolved complaints. This business case supports investment in quality improvement.`,
  },

  {
    id: 'KB-DD5-031',
    title: 'Complaints Reporting & Dashboard',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['complaints', 'customer-complaints', 'customer-satisfaction'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Complaints Reporting & Dashboard

## Overview

The IMS Complaints module provides a full reporting suite covering operational management, regulatory compliance, and management review requirements.

## Key Complaints KPIs

The dashboard tracks the following key performance indicators:

- **Complaint Rate** — number of complaints per 1,000 transactions (or per 1,000 units sold)
- **Resolution Rate** — percentage of complaints resolved and closed
- **Average Resolution Time** — calendar days from receipt to closure
- **SLA Compliance Rate** — percentage of complaints resolved within the severity SLA
- **Customer Satisfaction Score** — average post-resolution survey score (1–5 or NPS)

## Built-In Reports

Access all reports from **Complaints → Reports**:

- **Complaints Register** — full list of all complaints with key fields, status, and owner
- **Resolution Summary** — resolved complaints with resolution type and time taken
- **SLA Breaches** — complaints resolved or still open beyond their SLA deadline
- **Trend Analysis** — volume, category, and root cause trends over selected periods
- **Root Cause Summary** — distribution of identified root causes across all investigated complaints

## Regulatory Compliance Reports

In regulated industries, complaint reporting is a mandatory regulatory obligation:

- **Financial Services** — FCA-compliant complaints report with mandatory categorisation fields
- **Healthcare** — patient complaint report for healthcare regulator submissions
- **Food Safety** — customer complaint log for FSSC 22000 and food authority audits

## Management Review Report

The management review complaints report provides: complaint volume KPI performance vs target, top three complaint categories and their root causes, SLA compliance trend, CAPA status from complaint-driven corrective actions, and proposed targets for the next period.

## Monthly Leadership Dashboard

A one-page summary dashboard is automatically generated at month-end for distribution to senior leadership, covering all key KPIs with traffic-light RAG status against targets.

## Export Formats

All reports export to PDF, Excel, and CSV. Complaint registers can be filtered by date range, category, severity, or status for targeted submissions to auditors or regulators.`,
  },

  {
    id: 'KB-DD5-032',
    title: 'Complaints Management Best Practices',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['complaints', 'customer-complaints', 'customer-satisfaction'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Complaints Management Best Practices

## Overview

Best-in-class complaints management goes beyond resolving individual complaints. This article describes the practices that build customer trust and drive systemic quality improvement.

## Making It Easy to Complain

Customers who find it difficult to complain tend to leave quietly rather than giving the organisation a chance to recover. Provide multiple intake channels, ensure the process is clear, and respond quickly to encourage complaint submission.

## First Contact Resolution

Target resolving complaints at the first point of contact wherever possible. Every additional interaction adds cost and reduces customer satisfaction. Empower front-line staff to offer appropriate resolutions without escalation for low-severity complaints.

## Complaint Handling Training

All staff who receive or handle complaints must be trained in: active listening, empathy, de-escalation, the complaint process, and resolution options available to them. IMS tracks training completion via the Training module.

## Using Complaints as Business Intelligence

Complaints are a direct signal from customers about where products or services are failing. Establish a monthly review meeting where complaints data is used to identify and prioritise quality and service improvement actions.

## Closed Loop Complaint Management

Confirm customer satisfaction after resolution before formally closing the complaint. Where the customer is not satisfied with the resolution, escalate to the complaints manager for review before closure.

## Regulatory Obligations

Complaint handling in regulated industries (financial services, healthcare, food safety, utilities) carries mandatory obligations: acknowledgement within defined timeframes, regulatory reporting of complaint volumes, and mandatory escalation pathways for certain complaint types.

## Benchmarking Complaint Rates

Track your complaint rate (complaints per 1,000 transactions) over time and, where industry data is available, compare to sector benchmarks. A complaint rate significantly above the industry average indicates systemic quality issues.

## Customer Feedback Beyond Complaints

Complement complaint data with proactive customer satisfaction surveys (NPS, CSAT) to capture feedback from customers who experienced issues but did not formally complain.`,
  },

  // ─── CONTRACT MANAGEMENT MODULE ───────────────────────────────────────────

  {
    id: 'KB-DD5-033',
    title: 'Contract Management Day-to-Day User Guide',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['contracts', 'contract-management', 'legal'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Contract Management Day-to-Day User Guide

## Overview

The IMS Contract Management module provides a centralised register for all contracts, with automated obligation tracking, renewal alerts, and approval workflows. This guide covers daily tasks for contract managers.

## Daily Contract Management Tasks

### Reviewing Contracts Due for Renewal

Begin each day by checking **Contracts → Dashboard → Expiring Soon**. The renewal horizon display shows contracts expiring within 30, 60, and 90 days. For each expiring contract, initiate the renewal decision workflow or set a reminder.

### Checking Obligation Deadlines

Navigate to **Contracts → Obligations → Overdue and Due Today** to review all obligations falling due. Confirm completion of obligations that have been fulfilled, and follow up on any that are at risk of missing their deadline.

### Approving Contract Milestones

Contracts with milestone-based payments or deliverables require approval when milestones are achieved. Review pending milestone approvals under **Contracts → Approvals → Pending**.

## Contracts Dashboard

The dashboard provides:

- **Active Contracts by Value** — total contract value under management, grouped by contract category
- **Contracts Expiring** — count and value of contracts expiring within 30, 60, and 90 days
- **Obligations Overdue** — obligations past their due date requiring immediate action
- **Pending Approvals** — contracts and milestones awaiting sign-off

## Quick Actions

Use the dashboard quick-action buttons to: create a new contract, log a new obligation, submit a contract for approval, and search the contract register.

## Searching and Filtering the Contract Register

Use **Contracts → Register** with filters by: contract type, status, party name, value range, contract owner, and expiry date range. Save frequently used filter combinations as a custom view.

## Mobile Access

Review contract summaries, obligation status, and renewal alerts from the IMS mobile app. Approval sign-off is available on mobile for contract managers on the move.`,
  },

  {
    id: 'KB-DD5-034',
    title: 'Contract Creation & Templates',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['contracts', 'contract-management', 'legal'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Contract Creation & Templates

## Overview

IMS provides a library of pre-approved contract templates for common contract types, reducing legal review time and ensuring standard terms are used consistently across the organisation.

## Contract Templates Available

The IMS template library includes:

- **Supplier Contract** — goods and services procurement, including delivery terms, liability, and IP ownership
- **Customer Contract** — terms and conditions for sale of goods or services
- **Employment Contract** — standard terms for permanent, fixed-term, and contractor roles
- **Non-Disclosure Agreement (NDA)** — mutual and one-way confidentiality agreements
- **Memorandum of Understanding (MOU)** — non-binding collaboration framework
- **Service Level Agreement (SLA)** — performance commitments for service relationships
- **Lease Agreement** — commercial property and equipment lease terms

## Creating a Contract from Template

Navigate to **Contracts → New Contract → Select Template**. Choose the appropriate template, and the contract creation form pre-populates standard fields and clause sets. Customise as required for the specific transaction.

## Contract Metadata

Every contract record requires the following metadata:

- **Parties** — all legal entities party to the contract
- **Contract Value** — total value, annual value, or estimated value (use '0' for NDA/MOU with no monetary value)
- **Start and End Dates** — contract term
- **Auto-Renewal Clause** — whether the contract auto-renews and on what terms
- **Jurisdiction** — governing law and jurisdiction for dispute resolution
- **Contract Owner** — the internal person responsible for managing the contract

## Custom Fields

Administrators can add organisation-specific custom fields to contract records under **Settings → Contract Management → Custom Fields**.

## Contract Numbering

IMS generates a unique contract reference number automatically on creation, using a configurable format (e.g., CON-2026-0001). The reference is used across all related records (obligations, amendments, invoices).

## Contract Document Upload

Attach the executed contract document (PDF) to the IMS contract record with version control. IMS stores the original signed version and all subsequent amendments, with a full version history.`,
  },

  {
    id: 'KB-DD5-035',
    title: 'Contract Review & Approval Workflow',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['contracts', 'contract-management', 'legal'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Contract Review & Approval Workflow

## Overview

A robust contract review and approval workflow protects the organisation from poorly negotiated terms, unauthorised commitments, and compliance failures. IMS provides a configurable multi-stage approval workflow for all contracts.

## Contract Review Stages

The default review workflow includes four stages, each assigned to a team or named reviewer:

1. **Legal Review** — verification of contractual terms, liability, IP, and regulatory compliance
2. **Commercial Review** — assessment of pricing, payment terms, and commercial risk
3. **Financial Review** — budget confirmation and financial exposure assessment
4. **Management Approval** — final sign-off by an authorised signatory

## Conditional Approval Paths

Approval paths can be configured based on contract value thresholds. For example:

- Contracts below £10,000 — commercial review and manager approval only
- Contracts £10,000 to £100,000 — legal, commercial, and senior manager approval
- Contracts above £100,000 — full review cycle including CFO or CEO sign-off

## Review Deadline and Escalation

Each review stage has a defined deadline. If a reviewer has not acted within the deadline, IMS sends an escalation notification to their manager to ensure the review cycle is not blocked.

## Reviewer Comments and Redline Tracking

Reviewers add comments directly to the IMS contract record. For document-level redlines, annotated contract drafts are uploaded to the version history. All comments are time-stamped and attributed to the reviewer.

## Contract Negotiation Cycle

Multiple draft versions are stored in the IMS version history as negotiation progresses. Each version records the key changes from the prior version and the date submitted to or received from the counterparty.

## Final Approval

The final approval stage captures an electronic sign-off with audit trail, confirming the identity of the approver, the date and time of approval, and the document version approved.

## Post-Approval Distribution

On final approval, IMS automatically notifies the contract owner, the finance team (for payment schedule setup), and any other stakeholders specified in the distribution list.`,
  },

  {
    id: 'KB-DD5-036',
    title: 'Contract Obligations Tracking',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['contracts', 'contract-management', 'legal'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Contract Obligations Tracking

## Overview

Contract obligations are the specific commitments each party must fulfil under the contract. Proactive obligation tracking prevents breach of contract, protects the organisation's legal position, and enables recovery where the other party fails to perform.

## Obligation Types

IMS tracks the following obligation categories:

- **Payment Milestones** — scheduled payment dates and amounts
- **Deliverables** — goods, services, or deliverable documents with due dates
- **Reporting** — periodic reports required by the contract (monthly KPI report, quarterly compliance certificate)
- **Compliance Certificates** — regulatory certificates, insurance certificates, and audit reports due by specific dates
- **Notice Periods** — deadlines for giving notice of renewal, termination, or renegotiation
- **Insurance Renewal** — confirmation that the counterparty's required insurance remains in force

## Obligation Register

Each obligation record includes:

- **Description** — what is required, by which party
- **Due Date** — the contractual deadline
- **Owner** — the internal person responsible for ensuring completion
- **Evidence Required** — the type of evidence confirming fulfilment (document, payment confirmation, sign-off)

## Obligation Reminders

IMS sends configurable advance warning notifications to the obligation owner: 30 days before the due date, 7 days before, and on the due date. Configure warning periods under **Settings → Notifications → Contract Obligations**.

## Obligation Completion

When an obligation is fulfilled, the owner uploads supporting evidence (payment receipt, delivery note, compliance certificate) and marks the obligation as complete. A second reviewer can be configured to sign off completion evidence.

## Overdue Obligation Escalation

Obligations not completed by their due date automatically generate an escalation alert to the contract manager and their line manager. Overdue obligations are highlighted in red on the dashboard.

## Obligation Compliance Report

The **Contracts → Reports → Obligation Compliance** report shows all obligations by status (complete, due, overdue) for a selected period, providing a comprehensive compliance audit trail.`,
  },

  {
    id: 'KB-DD5-037',
    title: 'Contract Renewal & Expiry Management',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['contracts', 'contract-management', 'legal'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Contract Renewal & Expiry Management

## Overview

Proactive management of contract renewals and expirations prevents unintended lapses in service, supply chain disruptions, and missed opportunities to renegotiate on more favourable terms.

## Renewal Types

IMS categorises contracts by renewal mechanism:

- **Automatic Renewal** — the contract renews automatically unless notice of termination is given within the notice period
- **Mutual Renewal** — both parties must positively agree to renew before the expiry date
- **No Renewal** — the contract terminates at the end date with no renewal option

## Renewal Notification

IMS sends automated renewal notifications to the contract owner at 90, 60, and 30 days before the contract expiry date. The notification includes the contract summary, expiry date, renewal type, and a link to the renewal decision workflow.

## Renewal Decision Workflow

For each expiring contract, the contract owner must submit a renewal decision via **Contracts → Renewals → [Contract] → Renewal Decision**:

- **Renew** — proceed with renewal on existing terms
- **Renegotiate** — commence negotiation for revised terms before renewal
- **Terminate** — give formal notice of termination and close the contract

## Renewal Terms

For contracts being renewed with amended terms, raise a contract variation record documenting the changes to value, scope, duration, or other material terms. The variation follows the same approval workflow as a new contract.

## Contract Extension

Where a contract requires additional time beyond the original end date — for example, while a new contract is being finalised — raise a contract extension record. Extensions must be agreed in writing by both parties.

## Contract Variation

Formal change control is required for any material change to an in-force contract. Record the variation in IMS with the agreed change, effective date, and both parties' confirmation.

## Contract Archive

Expired contracts are automatically archived in IMS. They remain searchable and their records, obligations, and correspondence are retained for the configured retention period (default seven years).`,
  },

  {
    id: 'KB-DD5-038',
    title: 'Supplier Contract Integration',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['contracts', 'contract-management', 'legal'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Supplier Contract Integration

## Overview

The Contract Management module integrates with the Supplier Management module, linking supplier contracts to supplier performance data and creating a unified view of each supplier relationship.

## Supplier Contract Linkage

When creating a contract with a supplier, link the contract record to the corresponding supplier record in the Supplier Management module. The supplier record then displays the active contract status, value, expiry date, and any overdue obligations.

## Contract KPIs Linked to Supplier Performance

Contract SLAs defined in the contract (e.g., on-time delivery %, defect rate, response time) are configured as supplier KPIs in the Supplier Management module. Monthly KPI scores are compared against contractual commitments, creating an objective basis for performance conversations.

## Contract Dispute Tracking

Where a supplier fails to meet contractual obligations or raises a dispute over payment or delivery, log the dispute formally within the contract record under **Contracts → [Contract] → Disputes → New Dispute**. Record the disputed issue, position of each party, and the resolution or escalation path.

## Supplier Contract Audit

Schedule periodic compliance reviews for high-value or critical supplier contracts. The audit checks: KPI performance, obligation completion, insurance currency, and sub-contractor management compliance. Record the audit outcome in IMS.

## Integration with Finance

Supplier contract value and payment schedule are visible to the Finance module, enabling:

- Purchase order matching against contract value and remaining commitment
- Invoice reconciliation against contracted prices and delivery milestones
- Accrual calculations for work completed but not yet invoiced

## Integration with Procurement

Link purchase orders to their parent contract, ensuring that procurement activity remains within contracted terms and value limits. IMS alerts the procurement team when cumulative purchase order value approaches the contract ceiling.`,
  },

  {
    id: 'KB-DD5-039',
    title: 'Contract Reporting & Dashboard',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['contracts', 'contract-management', 'legal'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Contract Reporting & Dashboard

## Overview

The IMS Contract Management module provides a comprehensive reporting suite for legal, commercial, and executive audiences, offering visibility of the organisation's total contract portfolio.

## Contract Register Report

The **Contracts → Reports → Contract Register** report exports the full contract register with key fields: contract number, title, parties, category, value, start date, end date, renewal type, owner, and status. Available in Excel and CSV for import into financial systems.

## Contract Value by Category

The spend analysis report breaks down total contract value under management by category: supplier contracts, customer contracts, employment, leases, and others. Use this data to identify the highest-value contract categories requiring the most rigorous oversight.

## Contracts Expiring Report

The expiring contracts report shows all contracts expiring within a configurable horizon (30, 60, or 90 days), including contract value, renewal type, and the last action taken in the renewal decision workflow.

## Obligations Compliance Report

The obligations compliance report shows all obligations across the portfolio, grouped by status: complete, due, and overdue. Filter by date range, contract owner, or contract category.

## Contract Risk Report

The contract risk report flags contracts with: overdue obligations, active disputes, contracts with value above the financial risk threshold, and contracts approaching auto-renewal where the decision has not yet been made.

## Contract Performance Report

For milestone-based contracts, the performance report shows planned vs actual milestone delivery dates, and the financial exposure from milestones not yet achieved on schedule.

## Total Contract Value Under Management

A single KPI showing the aggregate value of all active contracts in the portfolio. This figure is used in board reporting and risk management.

## Export for Finance Audit and Legal Review

All contract reports export to PDF for audit file submission. The legal review pack includes the contract register, obligation compliance report, and contract risk report for the current financial year.`,
  },

  {
    id: 'KB-DD5-040',
    title: 'Contract Management Best Practices',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['contracts', 'contract-management', 'legal'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Contract Management Best Practices

## Overview

Effective contract management reduces legal risk, protects revenue, and strengthens supplier and customer relationships. This article outlines the practices that define a mature contract management function.

## Contract Lifecycle Governance

Assign clear ownership for every contract from the moment negotiation begins through to final expiry. The contract owner is accountable for: ensuring timely review and approval, monitoring obligations, managing the counterparty relationship, and initiating the renewal decision well in advance of expiry.

## Standard Contract Terms

Maintain an approved library of standard contract terms, developed and maintained by the legal team. Using approved templates dramatically reduces the time spent on legal review and negotiation, and ensures consistent protection for the organisation.

## Proactive Obligation Management

The single most common source of contract breach is simply forgetting contractual deadlines. Use IMS obligation tracking and automated reminders to ensure all parties fulfil their commitments on time.

## Contract Data Quality

Keep the contract register current: update contract records when amendments are agreed, extensions are granted, or disputes are raised. Stale register data undermines the reliability of reports and renewal alerts.

## Contract Performance Measurement

Agree KPIs at contract signing and measure them regularly throughout the contract term. Do not wait until renewal to discover that performance has been below par — address it through the contract governance process while the contract is live.

## Relationship Management

Contracts provide the framework, but relationships drive outcomes. Hold regular contract review meetings with key suppliers and customers to discuss performance, upcoming requirements, and any emerging issues before they escalate.

## Post-Contract Review

After contract expiry or termination, conduct a lessons-learned review: what worked well, what was missed, and how the next contract for this relationship or service category can be improved.

## Digital Signature

Use digital signature tools integrated with IMS to reduce contract turnaround times. Eliminating the need for wet signatures and physical document exchange can cut contract execution time from weeks to hours.`,
  },
];
