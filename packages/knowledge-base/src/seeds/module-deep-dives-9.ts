import type { KBArticle } from '../types';

export const moduleDeepDives9Articles: KBArticle[] = [
  // ─── AEROSPACE MODULE (AS9100) ────────────────────────────────────────────

  {
    id: 'KB-DD9-001',
    title: 'Aerospace Quality Module (AS9100) — Day-to-Day User Guide',
    content: `## Aerospace Quality Module (AS9100) — Day-to-Day User Guide

The Aerospace Quality module implements the requirements of AS9100 Rev D, the internationally recognised quality management standard for the aviation, space, and defence industries. This guide covers the routine tasks performed by aerospace quality engineers, inspectors, and production staff as they manage quality activities across the production day.

### Navigating the Module

From the main navigation, open Aerospace Quality. The module is organised into the following sections: First Article Inspection (FAI), Nonconformance Management, Configuration Management, Special Processes, Supplier Quality, Customer Notifications, and Reporting. The dashboard surfaces the highest-priority items across all sections.

### Morning Lineup Routine

Quality engineers should begin each shift with a structured review of the dashboard:

1. **Open Nonconformances** — review any new or escalated nonconformances raised during the previous shift. Confirm dispositions are assigned and that any Material Review Board (MRB) items have an owner.
2. **FAI Actions** — check First Article Inspection records awaiting ballooning sign-off, customer approval, or resubmission.
3. **FOD Prevention Checks** — confirm that Foreign Object Debris prevention checklist items for the day's work areas have been assigned and are not overdue.
4. **Special Process Certificates** — review the supplier Nadcap certificate expiry widget and action any certificates expiring within 30 days.
5. **Customer Notifications** — check whether any approved changes or escapes require formal customer notification before the day's production begins.

### First Article Inspection (FAI) Records

Navigate to First Article Inspection to open, continue, or review FAI records. Each FAI consists of three AS9102 forms:

- **Form 1 — Part Number Accountability**: captures the drawing number, revision, and part description.
- **Form 2 — Product Accountability**: captures material certifications, special process approvals, and functional test results.
- **Form 3 — Characteristic Accountability**: records every ballooned dimension and its actual measured value.

Select a part number to see its FAI history. Use **New FAI** to initiate a new record or **Partial FAI** when only certain characteristics have changed due to a design revision.

### Nonconformance Dispositions

Navigate to Nonconformance Management. Open a nonconformance report (NCR) to view the part, discrepancy description, and current disposition status. Dispositions follow the standard MRB workflow: Use-As-Is, Rework, Repair, Return to Supplier, or Scrap. Record your disposition recommendation and supporting engineering justification. Where customer approval is required before use of a non-standard disposition, the workflow generates a customer notification request automatically.

### FOD Prevention Checks

Navigate to FOD Prevention within the module. Daily FOD walk-down checklists are generated automatically for each designated FOD-critical work area based on the production schedule. Complete each checklist item and note any findings. Unresolved FOD findings escalate to an open action and appear on the dashboard.

### Configuration Management Lookups

Navigate to Configuration Management to look up the current approved configuration baseline for any assembly or sub-assembly. Use the part number search to retrieve the Production Baseline Document (PBD), current engineering revision, and effectivity details. This is essential before starting any production activity on a customer-serialised article.

### Special Process Approvals (Nadcap)

Navigate to Special Processes to confirm that the process source (internal or external supplier) holds current Nadcap accreditation for the required commodity (e.g. heat treatment, chemical processing, NDT, welding). The system displays accreditation status, expiry date, and any open major findings. Production jobs referencing an expired or suspended Nadcap source are automatically placed on hold.

### Customer Notification Tracking

Navigate to Customer Notifications to track all formal notifications sent to prime contractors or original equipment manufacturers. Each notification records the trigger (escape, approved change, process deviation), customer reference number, submission date, and customer response status. Filter by customer to prepare for regular programme review meetings.

### Shift Handover

At shift end, use the **Handover Report** function to generate a concise summary of all open quality actions created or progressed during the shift. The report includes open NCRs, FAI actions, FOD findings, and any customer notifications pending response. Send the report to the incoming shift quality lead before leaving.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['aerospace', 'as9100', 'daily-use', 'quality'],
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
    id: 'KB-DD9-002',
    title: 'Aerospace Quality Module — Administrator Configuration Guide',
    content: `## Aerospace Quality Module — Administrator Configuration Guide

This guide is intended for Quality Management System (QMS) administrators responsible for configuring the Aerospace Quality module to reflect the organisation's AS9100 Rev D certification scope, customer delegation requirements, and supply chain structure.

### Initial Module Setup

Navigate to Aerospace Quality > Administration > Module Settings. Configure the following before going live:

- **Certification Scope Statement** — enter the AS9100 Rev D scope as it appears on the certificate.
- **Certification Body** — record the accredited certification body (CB), certificate number, and expiry date.
- **CAGE Code** — enter the organisation's CAGE code for OASIS database alignment.
- **Site Locations** — add each manufacturing site covered by the QMS scope.

### Configuring AS9100 Rev D Clauses

Navigate to Clause Management. The module pre-loads all AS9100 Rev D clauses. For each clause, assign:

- **Process Owner** — the person or role responsible for maintaining compliance with that clause.
- **Key Procedures** — link the controlled procedures that implement the clause.
- **Evidence Type** — specify the records that demonstrate compliance (e.g. FAI records for clause 8.1.3).
- **Audit Frequency** — set the minimum internal audit frequency for that clause.

For organisations that have identified exclusions (permitted only under clause 8.2 for the customer property sub-clauses), record the justification and obtain Management Representative approval before saving.

### Customer Delegation Configuration (Boeing D1-9000, Airbus AIPI)

Navigate to Customer Delegations. Add each prime contractor delegation:

1. Select the customer (Boeing, Airbus, Lockheed Martin, etc.).
2. Enter the delegation agreement reference number and effective dates.
3. Select the applicable flow-down specification (e.g. Boeing D1-9000, Airbus AIPI 5Q03).
4. Map the customer's quality clauses to the organisation's internal procedures.
5. Set the delegation audit schedule (typically annual for Boeing, biennial for Airbus).

The system will automatically include customer-specific flow-down requirements on purchase orders raised to sub-tier suppliers when the applicable customer programme is selected.

### Nadcap Accreditation Tracking

Navigate to Special Processes > Nadcap Configuration. Add each Nadcap commodity:

- **Commodity** — select from the standard list (AC7102 NDT, AC7004 Heat Treatment, AC7108 Chemical Processing, AC7110 Welding, etc.).
- **Audit Body** — Performance Review Institute (PRI) is pre-loaded.
- **Certificate Expiry** — enter the current accreditation expiry date.
- **Findings Status** — record any open major or minor findings and target close dates.
- **Subscriber Programme** — if the Nadcap approval is subscriber-specific (e.g. Boeing-only), mark it accordingly.

Set notification thresholds: 90-day, 60-day, and 30-day expiry warnings sent to the Special Processes Manager and Quality Director.

### Key Characteristics Designation Workflow

Navigate to Key Characteristics > Configuration. Define the workflow for designating Key Characteristics (KCs):

1. Engineering submits a KC designation request citing the drawing callout or customer requirement.
2. Quality reviews and assigns a control method (SPC, 100% inspection, attribute gauge).
3. Manufacturing Engineering confirms the control plan is feasible.
4. Quality Director approves final KC designation.

Configure the KC register fields to capture characteristic type (Product KC, Manufacturing KC, or Critical Safety Item), control limits, and measurement system used.

### Counterfeit Part Prevention Configuration

Navigate to Counterfeit Part Prevention > Settings. Configure:

- **Trusted Supplier List** — sources authorised for independent distribution procurement. All others require additional verification.
- **Verification Requirements** — set testing and inspection requirements for parts procured outside the original manufacturer's authorised distribution network.
- **GIDEP Integration** — enter credentials for Government-Industry Data Exchange Program (GIDEP) alerts if applicable.
- **Suspect Part Quarantine Location** — designate the physical and system quarantine store for suspected counterfeit parts.

### Flow-Down Requirement Mapping

Navigate to Flow-Down Management. For each active customer programme, review the list of customer quality clauses and map each to the internal purchase order boilerplate or supplier quality requirements. When a production order is raised for that programme, the system automatically appends the mapped flow-down requirements to any sub-tier purchase orders, ensuring compliance with AS9100 Rev D clause 8.4.3.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['aerospace', 'as9100', 'admin', 'configuration'],
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
    id: 'KB-DD9-003',
    title: 'Aerospace Quality Module — First Article Inspection (FAI)',
    content: `## Aerospace Quality Module — First Article Inspection (FAI)

First Article Inspection (FAI) is a formal, documented verification that a production process has the potential to produce conforming product before full production commences. In the aerospace industry, FAI is governed by AS9102 Rev B. The Aerospace Quality module provides a complete digital FAI management system aligned to AS9102.

### What Is an FAI?

An FAI demonstrates that all engineering design and specification requirements are correctly understood, accounted for, and verified with actual hardware. It is required for:

- New part numbers entering production.
- Parts that have undergone a design change affecting form, fit, or function.
- Parts re-sourced to a new manufacturing location.
- Production restarts after a significant gap (typically 24 months, or as specified by the customer).
- Changes to materials, special processes, or tooling that could affect the part.

### AS9102 Three-Form Structure

Navigate to First Article Inspection and open any FAI record to see the three-form structure:

**Form 1 — Part Number Accountability**

This form establishes the identity of the article being inspected. It captures:

- Part number and revision level
- Part name and description
- Drawing number(s) and revision(s)
- Reference to applicable specifications
- Any deviations or waivers in effect
- The manufacturing organisation's name, CAGE code, and FAI report number

**Form 2 — Product Accountability**

This form verifies all process-related and compliance requirements. It captures:

- Raw material certification references (material type, heat/lot number, mill certificate)
- Special process certifications (Nadcap commodity, source name, certificate number)
- Functional test results (where required by the drawing)
- Software version (for parts with embedded software)
- Customer-furnished material or tooling references

**Form 3 — Characteristic Accountability**

This is the core measurement record. Every ballooned characteristic on the drawing must have a corresponding row in Form 3 showing:

- Balloon number
- Characteristic type (dimension, geometric tolerance, surface finish, etc.)
- Design requirement (nominal and tolerance)
- Actual measured result
- Measurement method or gauge used
- Pass / Fail status

### New Product Launch FAI

For a brand-new part number, a complete FAI is required covering all three forms with 100% of characteristics. Navigate to FAI > New FAI and enter the part number. The system retrieves the current revision and generates a blank Form 3 template. Work through each form systematically, uploading supporting documentation (material certs, process certs) as attachments.

### Repeat FAI vs Partial FAI

When a design change is raised against an existing part that has a completed FAI on record, the system supports:

- **Repeat FAI** — when the change affects the entire part (e.g. a new drawing revision that modifies multiple characteristics). A full re-inspection is required.
- **Partial FAI** — when only specific characteristics are affected by the change. Only the affected characteristics and any re-run special processes need to be re-inspected. The system links the partial FAI to the original baseline FAI and records which characteristics were re-verified.

To initiate a Partial FAI, open the existing FAI record and select **Raise Partial FAI**. Enter the Engineering Change Order (ECO) reference and select the affected characteristic balloon numbers. The system generates a restricted Form 3 containing only those rows.

### Digital Ballooning Integration

Upload the drawing PDF to the FAI record and use the built-in ballooning tool to assign balloon numbers to each dimension. The balloon numbers automatically populate the rows in Form 3, reducing manual data entry errors. Inspectors can click any balloon number in Form 3 to jump directly to the corresponding dimension on the drawing.

### Customer Approval Workflow

For customer-submitted FAIs, the system generates a formatted AS9102 report package for submission. Navigate to the FAI record and select **Submit for Customer Approval**. This locks the record and sends the report package to the nominated customer representative. The system tracks:

- Submission date
- Customer review status (Pending, Approved, Rejected, Conditional)
- Customer comments and required actions
- Resubmission history

An FAI is not considered complete until the customer approval status is set to **Approved**. Parts must not enter full production on the basis of an FAI that is still Pending or Conditional unless an approved deviation is in place.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['aerospace', 'as9100', 'fai', 'as9102'],
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
    id: 'KB-DD9-004',
    title: 'Aerospace Quality Module — Configuration & Change Management',
    content: `## Aerospace Quality Module — Configuration & Change Management

Configuration management (CM) in aerospace ensures that the physical product always matches its approved design documentation. Without rigorous CM, it becomes impossible to guarantee that delivered hardware matches what was designed, tested, and certified. The Aerospace Quality module provides a structured CM environment aligned to AS9100 Rev D clause 8.1.2.

### Configuration Baseline Establishment

A configuration baseline is a formally approved snapshot of a product's design documentation at a specific point in time. Navigate to Configuration Management > Baselines and select **New Baseline**. Provide:

- **Baseline Name** — typically aligned to a programme milestone (e.g. Production Baseline Rev A).
- **Effective Date** — the date from which this baseline applies.
- **Applicable Part Numbers** — add all part numbers and their current approved revision levels.
- **Drawing References** — link to the master drawing register entries.
- **Applicable Specifications** — list all design and process specifications at their current revision.

Once approved by the Configuration Control Board (CCB), the baseline is locked. All subsequent changes must go through the ECO workflow.

### Engineering Change Order (ECO) Workflow

Navigate to Change Management > ECOs to raise a new Engineering Change Order. The standard workflow is:

1. **Initiation** — describe the change, its technical rationale, and the affected part numbers and documents.
2. **Impact Analysis** — the system prompts the originator to assess impact on: FAI status (does the change require a new or partial FAI?), tooling, special processes, supplier qualifications, and customer notification.
3. **Review** — Engineering, Quality, and Manufacturing Engineering review the ECO concurrently. Each reviewer records approval or rejection with comments.
4. **CCB Approval** — the Configuration Control Board provides final approval. For customer-controlled configurations, customer approval is required before implementation.
5. **Implementation** — once approved, the ECO is released for action. Effectivity is set and production planning is notified.
6. **Close-Out** — after implementation, the responsible engineer confirms that all affected documents have been updated and that any required FAI activity is complete.

### Effectivity Tracking

Aerospace configurations are typically controlled by one of three effectivity mechanisms:

- **Serial Number Effectivity** — the change applies from a specific serial number. Example: "Applicable from SN 0042 onwards."
- **Lot Number Effectivity** — the change applies from a specific production lot. Example: "Applicable from Lot 2026-07 onwards."
- **Date Effectivity** — the change applies from a specific production date. Less common in aerospace but used for some consumable or standard part changes.

In the ECO record, select the effectivity type and enter the applicable value. The system automatically propagates effectivity data to related production orders and the configuration baseline register.

### Production Baseline Document (PBD) Management

The PBD is the master document that lists the current approved revision of every drawing, specification, and process document needed to manufacture a given assembly. Navigate to Configuration Management > PBDs to view, create, or revise a PBD.

When an ECO is closed out, the system automatically prompts a PBD revision to reflect any document revision changes. PBD revisions follow the same approval workflow as ECOs but typically have a shorter cycle time since the technical decisions have already been made.

### Customer Notification Requirements for Changes

AS9100 Rev D and most prime contractor flow-down requirements (e.g. Boeing D1-9000, Airbus AIPI) specify that certain categories of change require formal customer notification and approval before implementation. Navigate to Change Management > Customer Notifications to determine whether a planned change is notifiable.

Changes that typically require customer notification include:

- Changes to design that affect form, fit, or function
- Changes to approved special processes or process sources
- Changes to materials
- Changes to manufacturing location
- Changes to sub-tier suppliers for customer-controlled commodities

The system checks the change attributes against the notification matrix for each active customer delegation and generates a notification request automatically when the criteria are met.

### Impact Analysis Before Approving Changes

The impact analysis step in the ECO workflow is mandatory and must be completed before any CCB review. The system requires the originator to answer a structured questionnaire covering:

- Does this change require a new or partial FAI?
- Does this change affect any Key Characteristics?
- Does this change affect any Nadcap-controlled special process?
- Does this change require customer notification or approval?
- Does this change affect tooling or test equipment?
- Does this change affect any active supplier purchase orders?

Incomplete impact analysis will block the ECO from progressing to CCB review. Quality engineers reviewing the ECO should verify that the impact analysis responses are technically sound before approving.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['aerospace', 'as9100', 'configuration-management', 'change-control'],
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
    id: 'KB-DD9-005',
    title: 'Aerospace Quality Module — Key Characteristics & Special Processes',
    content: `## Aerospace Quality Module — Key Characteristics & Special Processes

Key Characteristics (KCs) and special processes are two of the most safety-critical elements managed within an AS9100 Rev D quality system. KCs are features whose variation has a significant influence on product fit, performance, service life, or manufacturability. Special processes are manufacturing operations whose results cannot be fully verified by inspection alone. The Aerospace Quality module provides dedicated registers and control workflows for both.

### Key Characteristics — Overview

AS9100 Rev D clause 8.1.1 and the related AS9103 standard define the requirements for KC identification and control. Navigate to Key Characteristics to view the organisation's KC register.

### Types of Key Characteristics

The system supports three KC types:

- **Product Key Characteristic (PKC)** — a feature of the finished product whose dimensional or physical variation significantly affects customer requirements (e.g. a tight-tolerance bore that controls bearing fit).
- **Manufacturing Key Characteristic (MKC)** — a feature of a manufacturing process whose variation significantly affects a PKC (e.g. a furnace temperature setting that controls the hardness of a heat-treated component).
- **Critical Safety Item (CSI)** — a part, assembly, or characteristic whose failure would result in loss of the aircraft, loss of life, or permanent disability. CSIs often require additional regulatory oversight and customer approval to change.

### Identifying and Controlling Key Characteristics

When a drawing or customer requirement designates a KC (typically shown by a key symbol or specific callout on the drawing), quality engineering must:

1. Add the KC to the register via **New KC**.
2. Specify the characteristic description, drawing reference, and balloon number.
3. Assign the control method: Statistical Process Control (SPC), 100% inspection, or attribute gauging.
4. Define the control limits (for SPC KCs: upper control limit, lower control limit, target value).
5. Link the KC to the relevant control plan in the module.
6. Assign the responsible process owner.

### Statistical Control Plans for KCs

For KCs controlled by SPC, navigate to Key Characteristics > Control Plans and open the relevant KC. The control plan specifies:

- Measurement frequency (every nth part, or every batch)
- Gauge or measurement system to be used (verified by Measurement System Analysis)
- Control chart type (Xbar-R, individuals and moving range, etc.)
- Reaction plan when the process signals out of control

SPC data collected against KCs is automatically charted within the module. Control chart alarms (e.g. eight consecutive points on one side of the mean) generate an immediate alert to the process owner and quality engineer.

### Nadcap-Approved Special Process Tracking

Navigate to Special Processes > Nadcap to view the organisation's current Nadcap accreditations. Each accreditation entry shows:

- **Commodity code** (e.g. AC7102 for NDT, AC7004 for heat treatment)
- **Accreditation type** (Merit, Standard, or Subscriber-specific)
- **Expiry date**
- **Open findings** — number of open major and minor findings from the last audit
- **Next audit date**

The dashboard widget summarises certificates expiring within 90 days. Quality administrators must initiate the renewal process at least 90 days before expiry to avoid production disruption.

### Key Nadcap Commodity Areas

The system pre-loads the standard Nadcap commodity list:

- **AC7004** — Heat Treatment
- **AC7102** — Non-Destructive Testing (NDT): PT, MT, UT, RT, ET
- **AC7108** — Chemical Processing (anodising, plating, passivation)
- **AC7110** — Welding (fusion, resistance, electron beam, laser)
- **AC7116** — Composites Manufacturing
- **AC7117** — Electrical / Electronic Assembly

### Supplier Nadcap Certificate Expiry Monitoring

Navigate to Special Processes > Supplier Nadcap. Each sub-tier supplier approved to perform Nadcap-controlled processes on behalf of the organisation is listed with their current certificate status. The system sends automated notifications to the Supplier Quality Engineer at 90, 60, and 30 days before expiry.

If a supplier's Nadcap accreditation expires without renewal, all purchase orders requiring that commodity from that supplier are automatically placed on quality hold. No material processed under an expired certificate may be accepted without a documented deviation approved by the Quality Director and, where required, the customer.

### Flow-Down to Suppliers

For any production order that involves a KC or a Nadcap-controlled special process, the module automatically appends the relevant requirements to sub-tier purchase orders:

- A list of KCs on parts to be supplied, with required measurement and reporting requirements
- The Nadcap commodity approval required for each process
- Any customer-specific flow-down clauses relating to KCs or special processes

This ensures that sub-tier suppliers are always aware of the critical quality requirements before commencing work.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['aerospace', 'as9100', 'key-characteristics', 'special-processes', 'nadcap'],
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
    id: 'KB-DD9-006',
    title: 'Aerospace Quality Module — Supplier Quality & Counterfeit Parts',
    content: `## Aerospace Quality Module — Supplier Quality & Counterfeit Parts

Supplier quality management is a cornerstone of AS9100 Rev D compliance. Clause 8.4 requires organisations to control externally provided products, processes, and services. In aerospace, this extends to managing AS9100-certified suppliers, Nadcap-approved process sources, and a rigorous programme to prevent the introduction of counterfeit or fraudulent parts into the supply chain.

### Approved Supplier List (ASL) Management

Navigate to Supplier Quality > Approved Supplier List. The ASL is the master register of all suppliers authorised to provide products or services to the organisation. Each ASL entry includes:

- **Supplier Name and CAGE Code**
- **AS9100 Certification Status** — whether the supplier holds a current AS9100 or ISO 9001 certificate, and the name of the certifying body
- **Certificate Expiry Date** — the system flags suppliers with certificates expiring within 90 days
- **Scope of Approval** — the specific commodities or part families the supplier is approved to supply
- **Risk Classification** — Low, Medium, High, or Critical based on the supplier audit history and product criticality
- **Approved Status** — Active, Conditional, Suspended, or Removed

Suppliers must not be added to production orders unless their ASL status is Active. Adding a supplier to the ASL requires Quality Director approval. Removing a supplier triggers a review of all open purchase orders and an impact assessment.

### Supplier Audit Scheduling Aligned to Risk

Navigate to Supplier Quality > Audit Schedule. The module generates a risk-based audit schedule for all ASL suppliers:

- **Critical Risk Suppliers** — annual on-site audit, or after any significant quality escape
- **High Risk Suppliers** — biennial on-site audit, supplemented by remote desktop reviews annually
- **Medium Risk Suppliers** — triennial on-site audit, with annual questionnaire assessment
- **Low Risk Suppliers** — quinquennial review, or triggered by a quality event

Audit scheduling also respects customer delegation requirements. For example, Boeing D1-9000 may require the organisation to audit certain sub-tier suppliers on Boeing's behalf. These customer-delegated audits are tracked separately with specific reporting formats.

### Counterfeit Part Prevention Programme

Navigate to Supplier Quality > Counterfeit Prevention. AS9100 Rev D clause 8.1.4 and the associated AS6174 / AS5553 standards require a documented programme to detect and avoid counterfeit, fraudulent, or suspect unapproved parts (FSUP).

#### Trusted Supplier List

The Trusted Supplier List defines which sources are authorised for independent distribution procurement (i.e. purchasing from a distributor rather than directly from the original component manufacturer). All independent distributors must hold AS6081 or equivalent certification to appear on the Trusted Supplier List.

Procuring parts from any source not on the Trusted Supplier List requires a waiver approved by the Quality Director and, for customer-specific programmes, written customer consent.

#### Test and Inspection Requirements

For parts procured outside the original manufacturer's authorised distribution network, the following verification activities are required before the parts may be accepted into stock:

1. **Visual inspection** — check for signs of re-marking, sanding, or surface abnormalities.
2. **Dimensional inspection** — verify critical dimensions against the manufacturer's data sheet.
3. **Electrical test** (for electronic parts) — functional test to manufacturer's specification.
4. **Material verification** — XRF or other chemical analysis where marking alone cannot confirm material identity.

The module generates an inspection checklist for each non-standard source procurement. Failed verification leads to immediate quarantine and reporting.

#### Suspected Counterfeit Reporting (GIDEP)

If a suspected counterfeit part is identified, the following steps are mandatory:

1. **Quarantine** — immediately segregate all affected parts in the dedicated FSUP quarantine location.
2. **Notification** — notify the customer within the timeframe specified by the customer's flow-down requirement (typically 24–72 hours).
3. **GIDEP Report** — file a GIDEP FSUP (Fraudulent/Suspect/Unapproved Parts) report via the Government-Industry Data Exchange Program portal. The module stores the GIDEP report number and submission date.
4. **Supplier Notification** — if the suspect parts came from a specific supplier, issue a formal notification and request for investigation response.
5. **Corrective Action** — raise a SCAR (Supplier Corrective Action Request) and track to closure.

### Obsolescence Management

Navigate to Supplier Quality > Obsolescence. As components reach end-of-life, the module tracks:

- **Part Last Time Buy (LTB) Notifications** — received from suppliers or distributors, logged against affected part numbers.
- **Lifetime Buy Quantities** — if a lifetime buy decision is made, the purchase order is linked to the obsolescence record.
- **Redesign Actions** — where a redesign is the chosen mitigation, the linked ECO is tracked.
- **Counterfeit Risk Assessment** — parts that have been obsolete for more than 5 years are flagged as elevated counterfeit risk on any future procurement.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['aerospace', 'as9100', 'supplier-quality', 'counterfeit-parts'],
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
    id: 'KB-DD9-007',
    title: 'Aerospace Quality Module — Reporting & KPIs',
    content: `## Aerospace Quality Module — Reporting & KPIs

Effective measurement and reporting is central to continuous improvement under AS9100 Rev D. The Aerospace Quality module provides a comprehensive set of dashboards, KPI trackers, and customer scorecard formats. This guide describes the key metrics, how they are calculated, and how to use them in management reviews and customer programme meetings.

### Key Aerospace Quality Metrics

Navigate to Reporting > KPI Dashboard to view the full set of aerospace quality metrics. The following are the primary performance indicators tracked in the module.

#### Escape Rate

**Definition:** The number of nonconforming parts or products that escaped the organisation's quality controls and were detected by the customer or end user, expressed per million opportunities (DPMO) or as a percentage of shipped quantity.

**Formula:** (Customer-detected nonconformances / Total units shipped) x 1,000,000

**Target:** Escape rate is typically set by the customer. Class A suppliers on Boeing Gold or Airbus Grade programmes typically target zero escapes per rolling 12 months.

**Action trigger:** Any escape initiates a mandatory 8D corrective action and, in most cases, a formal customer notification within 24–72 hours.

#### FAI Pass Rate on First Submission

**Definition:** The percentage of First Article Inspection reports approved by the customer on their first submission, without requiring resubmission.

**Formula:** (FAIs approved first time / Total FAIs submitted) x 100

**Target:** 90% or above is considered strong performance. Below 80% indicates systemic issues in the FAI process (inadequate drawing review, measurement system issues, or engineering change management gaps).

#### On-Time Delivery (OTD)

**Definition:** The percentage of deliveries made on or before the customer-requested delivery date.

**Formula:** (On-time deliveries / Total deliveries) x 100

**Target:** Most prime contractors require 95% or above for preferred supplier status. OTD below 90% typically triggers a supplier improvement plan.

#### Cost of Poor Quality (COPQ)

**Definition:** The total internal and external cost attributable to quality failures: scrap, rework, repair, warranty, customer returns, and the cost of MRB activity.

**Formula:** Sum of all internal failure costs + external failure costs in the measurement period.

**Reporting:** Expressed as a percentage of turnover for programme-level comparison. Navigate to Reporting > COPQ to see costs broken down by failure category, part number, and process.

#### Supplier Quality Rating

**Definition:** A composite score for each ASL supplier based on delivered quality (reject rate, SCAR volume) and delivery performance.

**Formula (example):** (Accepted lots / Total lots received) x 70 + (On-time deliveries / Total deliveries) x 30

**Use:** Suppliers scoring below the threshold (typically 85) are escalated to Conditional status and must submit an improvement plan. Navigate to Supplier Quality > Ratings to view and export ratings.

#### Nadcap Findings Per Audit Cycle

**Definition:** The number of major and minor findings raised during each Nadcap surveillance or renewal audit.

**Target:** Zero major findings per cycle. Two or fewer minors per cycle is considered satisfactory performance. Repeated major findings lead to suspension of Nadcap accreditation.

### Customer Scorecard Formats

#### Boeing Gold Supplier Status

Boeing's Gold Supplier programme evaluates suppliers against five criteria: Quality (delivery and escape), Delivery (OTD, expedites), Cost (price competitiveness, cost reduction), Responsiveness (corrective action timeliness), and Technical (engineering change responsiveness). Navigate to Reporting > Customer Scorecards > Boeing to view the organisation's current Gold score and the contributing metrics. Gold status requires a minimum weighted score of 80.

#### Airbus Grade

Airbus grades suppliers from A (best) to D (under surveillance). The grade is determined by an annual Quality Performance Indicator (QPI) review covering: number of quality notifications raised, on-time delivery, and concession volume. Navigate to Reporting > Customer Scorecards > Airbus to view the current QPI scores.

### OASIS Database Alignment

The OASIS database (Online Aerospace Supplier Information System) is the industry-standard repository for aerospace supplier quality data, maintained by SAE International. Navigate to Reporting > OASIS Sync to review the organisation's OASIS entry and ensure all data (certificate details, scope, CAGE code, contact information) matches the current state in IMS.

### Monthly and Annual Management Review Reporting

Navigate to Reporting > Management Review to generate the monthly aerospace quality performance summary. This report automatically pulls the current period data for all KPIs, presents trend charts, and includes a RAG status summary suitable for inclusion in the top management review pack. The annual report additionally includes COPQ trend analysis and a forward-looking risk assessment for the next 12 months.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['aerospace', 'as9100', 'reporting', 'metrics', 'kpi'],
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
    id: 'KB-DD9-008',
    title: 'Aerospace Quality Module — AS9100 Audit Readiness',
    content: `## Aerospace Quality Module — AS9100 Audit Readiness

Maintaining AS9100 Rev D certification requires ongoing audit readiness across all clauses. Certification audits are conducted by an International Aerospace Quality Group (IAQG) accredited certification body (CB). In addition, prime contractor delegations (Boeing SCMH, Airbus BQMS) require their own audit cycles. This guide covers how to use the Aerospace Quality module to maintain audit readiness and manage the audit lifecycle.

### AS9100 Rev D Certification Audit Structure

AS9100 certification audits follow a structured cycle:

- **Initial Certification** — Stage 1 (document review) followed by Stage 2 (site audit). Stage 1 typically occurs 4–8 weeks before Stage 2.
- **Surveillance Audits** — conducted annually (or as agreed with the CB) in Years 1 and 2 of the three-year certification cycle.
- **Recertification Audit** — conducted in Year 3 before certificate expiry. Equivalent in scope to a Stage 2 audit.

Navigate to Audit Management > Certification Audit Schedule to view the current cycle dates and plan internal preparation activities.

### Key Clauses and Evidence

The Aerospace Quality module maintains an evidence register linked to each AS9100 Rev D clause. Navigate to Audit Management > Clause Evidence to review readiness. Key clauses and their typical evidence requirements include:

- **Clause 4.1 / 4.2** — Context and stakeholder analysis: documented context analysis, interested parties register.
- **Clause 5.1** — Leadership: top management commitment records, policy, objectives.
- **Clause 6.1** — Risks and opportunities: risk register, opportunity log, action records.
- **Clause 7.2** — Competence: training records, competency assessments, gap analysis.
- **Clause 8.1** — Operational planning: production orders, work instructions, control plans.
- **Clause 8.1.2** — Configuration management: baseline documents, ECO records.
- **Clause 8.1.3** — Product safety: Critical Safety Item register, product safety plan.
- **Clause 8.1.4** — Prevention of counterfeit parts: counterfeit prevention programme records, GIDEP reports.
- **Clause 8.2.3** — Review of requirements: contract review records, customer requirements log.
- **Clause 8.3** — Design and development: design review records, design verification evidence.
- **Clause 8.4** — External providers: ASL, supplier audit records, SCARs, purchase order flow-down.
- **Clause 8.5** — Production and service provision: FAI records, work instructions, special process records.
- **Clause 8.7** — Nonconforming outputs: NCR register, MRB decisions, disposition records.
- **Clause 10.2** — Nonconformity and corrective action: 8D records, recurrence verification.

### Customer Delegation Audits

#### Boeing SCMH (Supplier Conformance Management Handbook)

Boeing conducts SCMH audits of key suppliers, typically annually, using Boeing Quality Representatives (BQRs). The audit focuses on Boeing-specific requirements: D1-9000 clause compliance, key characteristics control, and the counterfeit parts programme. Navigate to Audit Management > Customer Audits > Boeing to track scheduled SCMH audit dates, required evidence packs, and findings status.

#### Airbus BQMS (Business Quality Management System)

Airbus audits are structured around the BQMS clause set, which maps to AS9100 but includes Airbus-specific additions. Navigate to Audit Management > Customer Audits > Airbus to manage BQMS audit readiness. Airbus requires a formal Pre-Audit Self-Assessment (PASA) to be submitted before every on-site audit.

### Internal Audit Programme

Navigate to Audit Management > Internal Audit Programme. The internal audit schedule is automatically generated based on the process-based approach required by AS9100 Rev D clause 9.2. Each process is audited at least annually, with higher-risk processes (production, supplier management, special processes) audited more frequently.

The system assigns internal auditors, tracks audit completion, and ensures that no auditor audits their own work. Audit findings are graded as Conformity, Minor Nonconformance, Major Nonconformance, or Observation. All nonconformances require a corrective action record linked to the finding.

### Corrective Action Response (CAR) Management Timeline

When a certification body or customer issues a finding, the organisation must respond with a formal Corrective Action Response (CAR). Navigate to Audit Management > CARs to manage the response timeline.

Typical response timelines:

- **Major Nonconformance** — root cause analysis and containment within 24 hours; full CAR submission within 30 days.
- **Minor Nonconformance** — CAR submission within 60 days.
- **Observation** — addressed at the next management review; no formal deadline unless specified.

The system sends automated reminders at 50% and 80% of the deadline. Overdue CARs are escalated to the Quality Director.

### Surveillance and Recertification Cycles

Navigate to Audit Management > Certification Cycle to view the current three-year cycle timeline. The system generates a readiness checklist 90 days before each surveillance or recertification audit. This checklist covers:

- All clauses with evidence status (current, expiring, or gaps)
- Internal audit coverage completeness
- Open CARs and their status
- Management review completion
- Objectives review and closure rates

Use the **Audit Readiness Score** (displayed as a percentage) to track overall preparation status. A score of 85% or above before an external audit is the recommended minimum threshold.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['aerospace', 'as9100', 'audit', 'compliance', 'certification'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
  },

  // ─── MARKETING MODULE ─────────────────────────────────────────────────────

  {
    id: 'KB-DD9-009',
    title: 'Marketing Module — Day-to-Day User Guide',
    content: `## Marketing Module — Day-to-Day User Guide

The Marketing module provides a centralised workspace for managing the full marketing operation: lead pipeline, campaign performance, prospect interactions, ROI measurement, partner activity, and customer retention campaigns. This guide describes the routine tasks performed by marketing staff during a typical working day.

### Navigating the Module

From the main navigation, open Marketing. The module is organised into the following sections: Leads, Prospects, ROI Dashboard, Campaigns, LinkedIn, Customer Health Score, Expansion, Partner Onboarding, Renewal, Win-Back, Growth Digest, and Reports. The main dashboard displays a summary of the most time-sensitive items across all areas.

### Morning Dashboard Review

Begin each day with a structured review of the marketing dashboard:

1. **Lead Pipeline Summary** — check the number of new leads received since your last session, their source, and their current stage. Action any leads that have been sitting in the MQL stage without follow-up for more than 24 hours.
2. **Campaign Performance Alerts** — review any campaigns that have triggered performance alerts (e.g. email open rates below the target threshold, ad spend overspend warning).
3. **ROI Dashboard** — review the current-month revenue attribution figures. Note any campaigns showing a negative ROI trend.
4. **Renewal Reminders** — check which customers have upcoming renewal dates in the next 30 days and confirm that the automated renewal reminder sequence is active.
5. **Win-Back Eligible Accounts** — review newly churned accounts that have entered the win-back eligibility window.

### Viewing the Lead Pipeline

Navigate to Leads. The lead pipeline view shows all leads organised by stage: New, Contacted, Qualified (MQL), Sales Accepted (SQL), and Closed (Won/Lost). Use the filters to view leads by source, campaign, territory, or date range.

Click any lead to open the lead record. The record shows contact details, lead score, activity history, notes, and the sequence currently running. From this view you can:

- Update the lead stage
- Log an interaction (call, email, meeting)
- Assign the lead to a different owner
- Manually adjust the lead score with a justification note

### Updating Campaign Performance

Navigate to Campaigns. Open any active campaign to view its performance metrics: impressions, clicks, form fills, leads generated, opportunities created, and revenue attributed. Update campaign spend figures weekly by entering the actual spend against each channel. Campaigns flagged with a spend variance greater than 10% against plan appear highlighted in amber.

### Logging Prospect Interactions

Navigate to Prospects. The prospects list shows all accounts in the pre-lead phase: companies being targeted but that have not yet converted to a named lead. Log outbound interactions (LinkedIn message, cold email, call) against each prospect. The system counts interactions and flags prospects that have received more than five outbound touches without a response, triggering a review of the outreach approach.

### Checking the ROI Dashboard

Navigate to ROI Dashboard. The dashboard shows:

- **Revenue Attributed** — the total revenue attributed to marketing activity in the current period (multi-touch attribution model)
- **Marketing Spend** — total spend across all active channels
- **Overall Marketing ROI** — (Revenue Attributed - Marketing Spend) / Marketing Spend x 100
- **CPL (Cost Per Lead)** — total spend / total leads generated
- **CAC (Customer Acquisition Cost)** — total spend / new customers acquired

Use the date range selector to compare current period vs prior period. Drill down by campaign type or channel to identify the highest and lowest performing investments.

### Reviewing LinkedIn Lead Data

Navigate to LinkedIn. This section surfaces lead data imported from LinkedIn Campaign Manager and LinkedIn Sales Navigator. Review new LinkedIn leads, their seniority, company size, and interest signals. Assign high-quality LinkedIn leads directly to the lead pipeline with the appropriate source tag.

### Managing the Content Calendar

Navigate to Campaigns > Content Calendar. The content calendar shows all scheduled content publications: blog posts, social posts, email newsletters, and webinars. Review upcoming scheduled items to confirm assets are prepared and approved. Flag any content items without a completed asset attached as blocked.

### Tracking Renewal and Win-Back Campaigns

Navigate to Renewal or Win-Back respectively. Each section shows accounts in the relevant campaign, their current sequence stage, and the next scheduled touchpoint. Review and personalise any outreach messages flagged for manual review before sending.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['marketing', 'campaigns', 'leads', 'daily-use'],
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
    id: 'KB-DD9-010',
    title: 'Marketing Module — Administrator Configuration Guide',
    content: `## Marketing Module — Administrator Configuration Guide

This guide covers the initial and ongoing configuration tasks performed by Marketing Operations administrators to set up the Marketing module for the organisation's specific go-to-market model, attribution methodology, and integration stack.

### Initial Module Setup

Navigate to Marketing > Administration > Settings. Complete the following setup steps before inviting team members to use the module:

1. **Organisation Details** — confirm the organisation name, primary market(s), and fiscal year start month.
2. **Default Currency** — set the default currency for all revenue and spend reporting.
3. **Lead Stage Definitions** — customise the lead stage names and progression criteria to match the organisation's sales process.
4. **Team Structure** — add marketing team members, assign roles (Campaign Manager, Content Creator, Demand Gen, Field Marketing, etc.), and set up territory assignments.

### Configuring Lead Sources

Navigate to Administration > Lead Sources. Define all channels through which leads can enter the system:

- Organic web (SEO)
- Paid search (Google Ads, Bing Ads)
- Paid social (LinkedIn Ads, Meta Ads)
- Organic social
- Email nurture
- Webinar / event
- Partner referral
- SDR / outbound prospecting
- LinkedIn Sales Navigator
- Direct / offline

Each lead source can be given a default initial lead score contribution. This is combined with behavioural scoring signals to produce the total lead score.

### Lead Scoring Rules Configuration

Navigate to Administration > Lead Scoring. Configure the scoring model with two components:

**Demographic Score (Fit Score):** Assigns points based on who the lead is.
- Job title match (e.g. VP or above = 20 points, Manager = 10 points)
- Company size match (e.g. 500–5,000 employees = 15 points)
- Industry match (e.g. target industries = 15 points)
- Geography match (e.g. target regions = 10 points)

**Behavioural Score (Interest Score):** Assigns points based on what the lead has done.
- Pricing page visit = 20 points
- Demo request = 40 points
- Webinar attendance = 15 points
- Resource download = 10 points
- Email click = 5 points
- Return visit within 7 days = 10 points

Set the **MQL Threshold**: the minimum total score at which a lead is automatically promoted to MQL status and added to the sales team's queue.

### Campaign Type Configuration

Navigate to Administration > Campaign Types. Define the campaign taxonomy used in the module. Typical categories include: Email, Paid Digital, Event/Webinar, Content Syndication, ABM (Account-Based Marketing), Partner Co-Marketing, and Outbound SDR Sequence.

Each campaign type can be configured with a default attribution model override if the organisation uses different models for different channel types.

### Attribution Model Configuration

Navigate to Administration > Attribution Models. Select and configure the multi-touch attribution model(s) used for revenue reporting:

- **First Touch** — 100% credit to the first marketing touchpoint.
- **Last Touch** — 100% credit to the last marketing touchpoint before conversion.
- **Linear** — credit distributed equally across all touchpoints.
- **Time Decay** — more credit to touchpoints closer to conversion.
- **Position-Based (U-Shaped)** — 40% to first touch, 40% to lead creation touch, 20% distributed across middle touches.

The module supports running multiple attribution models simultaneously so that teams can compare outcomes. Set the **Primary Attribution Model** that will be used for official reporting and targets.

### Revenue Attribution Window

Navigate to Administration > Attribution Settings. Set the **attribution window**: the maximum number of days between a marketing touchpoint and a won deal for which the touchpoint can receive attribution credit. A common default is 90 days, but this should reflect the organisation's average sales cycle length.

### UTM Parameter Standards

Navigate to Administration > UTM Standards. Define the organisation's UTM parameter naming conventions to ensure consistent campaign tracking across all digital channels. Configure:

- Allowed values for utm_source (e.g. google, linkedin, newsletter, partner)
- Allowed values for utm_medium (e.g. cpc, email, social, organic)
- Naming format for utm_campaign (e.g. YYYY-MM-[campaign-type]-[audience])

UTM validation alerts flag any campaign URLs that use non-standard parameter values, preventing fragmented reporting.

### Lead Follow-Up SLA Configuration

Navigate to Administration > SLA Settings. Set the SLA for sales follow-up after a lead reaches MQL status. The industry standard is 5 minutes for inbound demo requests and 24 hours for other MQLs. The system will automatically track time-to-first-contact and flag breaches on the marketing and sales dashboards.

### Team Territory Mapping

Navigate to Administration > Territories. Define geographic or industry-based territories and assign the responsible marketing and sales team members. When a new lead is created, the system assigns it to the relevant territory owner automatically, based on the lead's company location or industry.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['marketing', 'admin', 'configuration', 'setup'],
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
    id: 'KB-DD9-011',
    title: 'Marketing Module — Lead Management & Scoring',
    content: `## Marketing Module — Lead Management & Scoring

Effective lead management converts marketing activity into qualified sales pipeline. The Marketing module provides a complete lead lifecycle management system from initial capture through to handoff to the sales team. This guide covers lead capture, scoring, qualification, nurture, and routing.

### Lead Capture Channels

Leads can enter the module through several routes:

**Web Forms** — embed a tracking snippet on your website forms. The module automatically creates a lead record when a form is submitted, capturing all form fields, the referring URL, UTM parameters, and the visitor's IP-based location. Navigate to Leads > Sources > Web Forms to view recent web form submissions.

**LinkedIn** — LinkedIn lead gen forms and Sales Navigator lead lists can be imported or synced. Navigate to Leads > LinkedIn to view the current import queue and import new lead batches.

**Manual Entry** — for leads gathered at events, through cold call prospecting, or via partner referrals. Navigate to Leads > New Lead and complete the lead form. Select the appropriate source and, if from a specific campaign, link the campaign.

**API Integration** — third-party tools (e.g. Typeform, HubSpot, event registration platforms) can push leads via the module's inbound API endpoint. Contact your administrator for the webhook URL and authentication token.

### Lead Scoring — How It Works

Navigate to Leads and open any lead record. The lead score is displayed prominently at the top of the record. The score is composed of two components:

- **Fit Score** — how closely the lead matches the ideal customer profile (ICP) based on demographic and firmographic data: job title, seniority, company size, industry, and geography.
- **Interest Score** — how engaged the lead has been with marketing content: website page visits, content downloads, email clicks, webinar attendance, and product demo requests.

The combined score determines the lead's stage. When the total score crosses the MQL threshold configured by the administrator, the lead is automatically promoted to MQL status.

### Lead Qualification Workflow (MQL to SQL Handoff)

When a lead reaches MQL status, the following steps occur:

1. The lead appears in the sales team's MQL queue with a notification.
2. The assigned sales development representative (SDR) reviews the lead and determines whether it meets the SQL criteria: confirmed budget, authority, need, and timeline (BANT or equivalent qualification framework).
3. If the SDR accepts the lead, they change the status to SQL (Sales Accepted Lead). If rejected, they log a rejection reason. Common rejection reasons: wrong company size, not in a decision-making role, no active project, duplicate.
4. Rejected leads re-enter a nurture sequence rather than being permanently discarded.
5. Accepted SQLs are handed off to an account executive and exit the marketing module into the CRM sales pipeline.

### Lead Nurture Sequences

Navigate to Leads > Nurture Sequences to view and manage the active nurture programmes. Each sequence is a time-based series of touches (email, LinkedIn message, SDR call) designed to keep the lead engaged until they are ready to progress. Leads that are in a nurture sequence but have not opened or clicked any communication for 90 days are automatically flagged for review: they can be moved to a long-term drip sequence or marked as unresponsive.

### Duplicate Detection and Merge

When a new lead is created, the system checks for existing leads with the same email address, phone number, or combination of name and company. Potential duplicates are flagged with a merge prompt. Navigate to Leads > Duplicates to review the current duplicate queue. To merge two lead records, open the primary record and select **Merge with Duplicate**. Choose which field values to retain in the merged record. The activity history from both records is combined.

### Lead Source Attribution Reporting

Navigate to Leads > Source Attribution to view a breakdown of leads by source for the current period. The report shows:

- Leads created per source
- MQL conversion rate per source
- SQL conversion rate per source
- CPL (cost per lead) per source (for paid sources where spend is tracked)
- Pipeline generated per source

Use this report to identify the highest-quality lead sources and inform future channel investment decisions.

### Routing Rules by Territory and Product

Navigate to Administration > Lead Routing. Configure automatic lead routing rules to ensure each new lead is assigned to the correct owner immediately. Routing rules can be based on:

- **Geography** — route based on country, region, or postal code.
- **Company size** — route enterprise leads (e.g. 500+ employees) to enterprise account executives.
- **Industry** — route leads from specific industries to the relevant specialist.
- **Product interest** — route leads who expressed interest in a specific product module to the relevant product specialist.
- **Round-robin** — distribute leads evenly across a team when no other rule applies.

Rules are evaluated in priority order. The first matching rule determines the assignee. If no rule matches, the lead is assigned to the default owner configured in the team settings.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['marketing', 'leads', 'lead-scoring', 'pipeline'],
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
    id: 'KB-DD9-012',
    title: 'Marketing Module — Campaign Management & ROI',
    content: `## Marketing Module — Campaign Management & ROI

Campaigns are the engine of marketing demand generation. The Marketing module provides end-to-end campaign management: planning, execution tracking, spend management, and multi-touch ROI measurement. This guide covers how to create, manage, and measure marketing campaigns.

### Creating a New Campaign

Navigate to Campaigns > New Campaign. Complete the campaign brief:

- **Campaign Name** — use the agreed naming convention (e.g. 2026-Q1-Webinar-EMEA-SMB).
- **Campaign Type** — select from Email, Paid Digital, Event/Webinar, Content Syndication, ABM, Partner Co-Marketing, or Outbound SDR Sequence.
- **Objective** — select the primary objective: Lead Generation, Pipeline Acceleration, Brand Awareness, Customer Retention, or Expansion.
- **Target Audience** — define the segment (industry, company size, job title, geography, or named account list for ABM campaigns).
- **Budget** — enter the total approved budget and break it down by channel.
- **Start and End Dates** — set the campaign duration.
- **KPI Targets** — set targets for leads, MQLs, pipeline generated, and revenue influenced.
- **Attribution Model** — accept the default or select a campaign-specific model.

Once saved, the campaign is in Draft status. Change to Active when the campaign launches.

### Budget Tracking and Spend vs Plan

Navigate to an active campaign and open the **Budget** tab. Enter actual spend figures weekly against each line item (e.g. LinkedIn Ads spend, event venue hire, content production cost). The module calculates variance against the approved budget and displays:

- **Total Approved Budget**
- **Committed Spend** (invoices raised or purchase orders placed)
- **Actual Spend** (invoices paid)
- **Remaining Budget**
- **Spend Variance** (actual vs planned for the period)

Campaigns with spend variance greater than 10% (over or under) generate an alert to the campaign owner and the marketing operations administrator.

### Multi-Touch Attribution Models

Navigate to Campaign > Attribution. For each campaign, you can view revenue attribution calculated under each of the configured models. The attribution data shows:

- How much revenue has been attributed to this campaign under each model
- Which deals included a touchpoint with this campaign
- The position of this campaign's touchpoints in the buyer journey (first touch, middle touches, or last touch)

**First Touch:** This model gives this campaign full credit for any deal where this campaign was the lead's first marketing interaction. Useful for measuring top-of-funnel reach.

**Last Touch:** This model gives this campaign full credit for any deal where this campaign was the final touchpoint before the deal was created or closed. Useful for measuring bottom-of-funnel conversion.

**Linear:** Revenue from each influenced deal is split equally across all campaigns that had a touchpoint with that lead. Useful for understanding overall contribution.

**Time Decay:** More credit is given to touchpoints that happened closer to the deal close. Reflects the idea that late-stage touches have the highest influence.

### Campaign ROI Calculation

Navigate to Campaign > ROI. The module calculates ROI using the formula:

ROI = (Revenue Attributed - Campaign Cost) / Campaign Cost x 100

For campaigns still in progress, the calculation uses pipeline value at the weighted probability rather than closed revenue. The system labels this as **Projected ROI** to distinguish it from actual closed ROI.

A campaign with ROI above 200% is highlighted in green. ROI between 0% and 200% is amber. Negative ROI is red. These thresholds can be adjusted in administration settings.

### Comparing Campaign Performance

Navigate to Campaigns > Performance Comparison. Select multiple campaigns to view side-by-side performance data. Compare:

- Leads generated
- MQL conversion rate
- SQL conversion rate
- CPL (cost per lead)
- Cost per MQL
- Revenue attributed (primary attribution model)
- ROI

Use the **Sort By** control to rank campaigns by any metric. This view is particularly useful for quarterly budget planning: identify the highest-performing campaign types and channels to inform future investment.

### A/B Test Result Logging

Navigate to Campaigns > A/B Tests. For any campaign that ran a split test (e.g. two subject line variants, two landing page designs, two CTA copy variants), log the test setup and results:

- **Test Hypothesis** — what did you expect to happen?
- **Variant A and Variant B** — describe each variant.
- **Audience Split** — how the audience was divided (typically 50/50).
- **Primary Metric** — which metric determined the winner (open rate, click rate, conversion rate).
- **Result** — record the metric for each variant and the statistical significance of the result.
- **Decision** — record which variant won and whether it will be adopted as the new standard.

A library of past A/B test results is accessible to the whole team and helps avoid repeating tests that have already been run.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['marketing', 'campaigns', 'roi', 'attribution'],
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
    id: 'KB-DD9-013',
    title: 'Marketing Module — Customer Health Score & Expansion',
    content: `## Marketing Module — Customer Health Score & Expansion

The Customer Health Score and Expansion sections of the Marketing module help marketing teams identify customers who are ready for upsell or cross-sell conversations, and to manage expansion campaigns targeted at existing customers. Growing revenue from the existing customer base is typically 5–7 times more cost-efficient than acquiring new customers, making this one of marketing's highest-ROI activities.

### Understanding the Health Score Dashboard

Navigate to Marketing > Customer Health Score. The dashboard displays all existing customers with their current health score, expressed as a number from 0 to 100. A higher score indicates a healthier, more engaged customer. The dashboard is filterable by:

- Health score range (e.g. view only customers scoring 70+)
- Customer segment (SMB, Mid-Market, Enterprise)
- Account manager
- Product tier
- Contract renewal date range

### Health Score Components

The health score is a composite of several weighted signals. Navigate to Administration > Health Score Configuration to see and adjust the weights for your organisation. Typical components are:

**Product Usage (30% weight):** Measured by API call volume, active users as a percentage of licensed seats, and feature adoption breadth. High usage = high score contribution.

**Support Ticket Volume and Severity (20% weight):** Customers with a high volume of unresolved or critical support tickets score lower. Score contribution is inversely proportional to open ticket severity.

**Net Promoter Score — NPS (20% weight):** Most recent NPS survey response. Promoters (9–10) contribute maximum score. Passives (7–8) contribute partial score. Detractors (0–6) reduce the score.

**Contract Age and Engagement (15% weight):** Customers in their first 90 days of a contract are in the onboarding phase and receive a neutral score contribution here. Customers past the first renewal with continuous contract growth score highly.

**Training and Enablement Completion (15% weight):** Customers who have completed the available training modules and participated in enablement sessions score higher. Low training completion often correlates with churn risk.

### Identifying Expansion Opportunities

Navigate to Customer Health Score > Expansion Opportunities. The system applies a rule-based model to identify customers who meet the criteria for expansion:

- Health score above 70
- Contract renewal date 90–180 days out (in the expansion conversation window)
- Current contract tier is not the maximum available tier
- No open critical support tickets
- At least one unrealised product module that the customer is not currently using

Customers meeting these criteria appear in the Expansion Opportunities list with a suggested expansion offer (e.g. upgrade to Enterprise tier, add specific module, increase licensed seats).

### Expansion Play Triggers

The system can trigger automated expansion plays based on usage signals. Navigate to Administration > Expansion Triggers to configure:

- **Seat Utilisation Trigger** — when a customer reaches 90% of their licensed seat count, automatically create an expansion opportunity and notify the account manager.
- **Feature Interest Trigger** — when a customer visits the pricing or upgrade page more than twice in a rolling 14-day window, flag them as expansion-ready.
- **Usage Spike Trigger** — when a customer's API usage increases by more than 50% month-over-month, flag for capacity upgrade conversation.

### Upsell and Cross-Sell Campaign Targeting

Navigate to Campaigns > New Campaign and select **Expansion** as the campaign objective. When building the target audience, select from the Expansion Opportunities list to create a segment of high-health-score customers who are candidates for a specific upsell.

Expansion campaigns typically use personalised email sequences, in-product messaging, and account manager outreach in combination. The campaign attribution model for expansion campaigns should be set to **Last Touch** or **Position-Based** to correctly credit the touchpoint closest to the upsell close.

### Expansion Revenue Tracking

Navigate to Customer Health Score > Expansion Revenue. This view tracks:

- **Expansion MRR or ARR** — the additional monthly or annual recurring revenue generated from upsells and cross-sells in the period.
- **Expansion Revenue by Trigger** — which expansion triggers are generating the most revenue.
- **Net Revenue Retention (NRR)** — total starting MRR + expansion MRR - churn MRR - contraction MRR, expressed as a percentage of starting MRR. NRR above 100% indicates that revenue from the existing base is growing.
- **Expansion vs New Business Revenue Split** — the ratio of expansion revenue to new logo revenue, helping management assess the balance of the growth strategy.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['marketing', 'customer-health', 'expansion', 'upsell'],
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
    id: 'KB-DD9-014',
    title: 'Marketing Module — Partner Onboarding & Growth',
    content: `## Marketing Module — Partner Onboarding & Growth

The Partner Onboarding and Growth section of the Marketing module manages the marketing activities related to the partner ecosystem: onboarding new partners, running co-marketing campaigns, managing the partner content library, tracking referral activity, and measuring the return on Market Development Fund (MDF) investments.

### Marketing's Role in Partner Onboarding

When a new partner is signed, the Partner Onboarding workflow initiates a series of marketing activities to equip the partner to represent and sell the organisation's products. Navigate to Marketing > Partner Onboarding to view all onboarding workflows.

**Marketing deliverables in the partner onboarding sequence:**

1. **Welcome communication** — a co-branded welcome email introducing the partner to the IMS platform and product suite.
2. **Brand and messaging brief** — a PDF guide covering the organisation's brand guidelines, approved messaging, and key differentiators for partner use.
3. **Partner portal access** — provision access to the partner content library in the Partner Portal module.
4. **Training enrolment** — enrol the partner's designated sales and marketing contacts in the partner enablement training modules.
5. **Joint launch campaign** — agree and schedule a joint announcement (press release, LinkedIn post, email to existing customers) to announce the partnership.
6. **First co-marketing activity** — schedule the first joint webinar or content piece within 60 days of partner signing.

### Co-Marketing Campaign Setup

Navigate to Campaigns > New Campaign and select **Partner Co-Marketing** as the campaign type. Complete the campaign brief and add the partner organisation's name and primary contact. Co-marketing campaigns require dual approval: both the organisation's marketing manager and the partner's designated contact must approve the campaign brief before launch.

Track co-marketing campaign performance under the partner's profile: Navigate to Marketing > Partners > [Partner Name] > Campaigns to see all campaigns run with this partner and their attributed leads and revenue.

### Partner Content Libraries

Navigate to Marketing > Partner Onboarding > Content Library. This section holds co-branded and partner-specific marketing assets available for partner use:

- Co-branded data sheets and product brochures
- Partner-specific case studies
- Sales battle cards and competitive positioning guides
- Co-branded presentation templates
- Social media copy packs
- Email templates for partner prospecting

Assets are version-controlled. When a new version of a product brochure is published, all partners who have downloaded the previous version receive an automatic notification to use the updated asset.

### Referral Programme Tracking

Navigate to Marketing > Partners > Referral Programme. Track all referrals submitted by partners:

- **Referral Organisation** — the account the partner is referring.
- **Partner Name** — the submitting partner.
- **Referral Date** — when the referral was logged.
- **Status** — New, Accepted, In Progress, Won, Lost, Expired.
- **Revenue** — the deal value if closed.
- **Commission or Reward** — the referral fee or reward payable on closure.

The module calculates each partner's total referral revenue contribution and referral conversion rate, enabling performance-based tiering decisions.

### MDF (Market Development Funds) Allocation and ROI

Navigate to Marketing > Partners > MDF. MDF are funds provided by the organisation to partners to support joint marketing activities. Manage the MDF lifecycle:

1. **MDF Request** — partner submits a request describing the planned activity, expected leads, and budget required.
2. **Review and Approval** — the Partner Marketing Manager reviews the request against the partner's tier entitlement and the activity's strategic fit.
3. **Allocation** — approved MDF is allocated and the partner is notified. A purchase order or payment reference is generated.
4. **Activity Execution** — the partner runs the activity and submits proof of execution (event photos, email screenshots, etc.).
5. **Results Submission** — the partner submits leads generated and costs incurred.
6. **ROI Measurement** — the module calculates MDF ROI: (Revenue Attributed from MDF Activity - MDF Spent) / MDF Spent x 100.

Partners with consistently low MDF ROI (below the programme threshold) receive a coaching session before their next MDF request is approved.

### Joint Webinar Management

Navigate to Campaigns and filter by Type = Partner Co-Marketing and Sub-type = Webinar. Joint webinars are one of the highest-converting partner marketing activities. The module tracks:

- Registration count by source (partner list, own list, paid promotion)
- Attendance rate
- Post-webinar lead capture forms
- Leads generated and their attribution split (partner-sourced vs own-sourced)

### Partner Portal Content Publishing

Navigate to Marketing > Partners > Portal Content to manage the content available in the Partner Portal web application. Add, update, or archive content items. Content categories include: Sales Enablement, Technical, Legal (partner agreement templates), Marketing Assets, and Training. Content published here is immediately visible to all partners with portal access.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['marketing', 'partners', 'partner-onboarding', 'growth'],
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
    id: 'KB-DD9-015',
    title: 'Marketing Module — Renewal & Win-Back Campaigns',
    content: `## Marketing Module — Renewal & Win-Back Campaigns

Customer retention is one of the most commercially important functions that marketing supports. The Marketing module provides dedicated workflows for renewal reminder campaigns (to prevent churn before it happens) and win-back campaigns (to re-engage customers who have already churned). This guide covers both.

### Renewal Campaign Overview

Navigate to Marketing > Renewal. The Renewal section shows all customers with contracts approaching expiry. The dashboard is organised by renewal horizon:

- **90+ days** — early engagement, nurture and success content
- **60–90 days** — active renewal conversation, expansion offer
- **30–60 days** — final renewal push, decision maker outreach
- **Under 30 days** — urgent escalation, executive involvement if needed
- **Overdue** — contract has lapsed, immediate action required

### Setting Up Automated Renewal Reminder Sequences

Navigate to Administration > Renewal Sequences. Configure the automated renewal reminder email sequence. A standard sequence might be:

1. **Day -90** — value summary email: "Here is what you have achieved with IMS over the past year." Data-driven, showing usage statistics and outcomes.
2. **Day -60** — new features email: highlight product improvements since the customer's last renewal that they will benefit from by renewing.
3. **Day -45** — account manager personal outreach: a personalised email from the assigned account manager requesting a renewal call.
4. **Day -30** — commercial offer: present the renewal quote, including any loyalty discount or multi-year incentive.
5. **Day -14** — urgency reminder: "Your contract expires in 14 days. Here is how to renew."
6. **Day -7** — final reminder, cc: decision maker if not already involved.

Each step can be configured as automated (sent without manual review) or manual (queued for review and personalisation before sending). Steps involving pricing or a personal tone should generally be set to manual review.

### Win-Back Campaign Playbooks

Navigate to Marketing > Win-Back. The Win-Back section shows all accounts that have churned within the configurable win-back window (default: churned within the last 12 months). Accounts churned more than 12 months ago are moved to a long-term drip sequence.

The module provides three built-in win-back playbook templates:

**Playbook 1 — Product Improvement Win-Back:** Targeted at customers who churned citing product gaps. Highlights product improvements made since their departure. Entry trigger: churn reason recorded as "Missing feature" or "Product limitations."

**Playbook 2 — Commercial Win-Back:** Targeted at customers who churned citing price. Offers a re-engagement discount or a tailored commercial package. Entry trigger: churn reason recorded as "Price" or "Budget constraints."

**Playbook 3 — Relationship Win-Back:** Targeted at customers who churned due to service or support issues. Leads with a personal apology message from senior leadership and a dedicated customer success introduction. Entry trigger: churn reason recorded as "Support quality" or "Relationship breakdown."

### Segmenting Lapsed Customers

Navigate to Win-Back > Segments. Use the segmentation tool to build targeted win-back audiences. Segment by:

- **Recency of churn** — customers who churned 1–3 months ago are often the easiest to win back. Segment this group for the most resource-intensive playbook.
- **Churn reason** — use recorded churn reasons to route to the appropriate playbook.
- **Contract value at churn** — prioritise high-value accounts for personalised outreach; use automated sequences for lower-value accounts.
- **Industry and company size** — apply vertical-specific messaging for customers from key target industries.

### Personalised Outreach Workflows

Navigate to Win-Back > Outreach Queue. High-priority win-back targets are placed in the manual outreach queue for the SDR team or account executives. Each queued item shows the account's churn history, past contract value, churn reason, and any prior win-back touches. The assignee reviews this context before personalising the outreach message.

### Win-Back Success Metrics and ROI Measurement

Navigate to Win-Back > Performance. Track:

- **Win-Back Rate** — churned accounts re-activated / total churned accounts contacted x 100. Industry average for SaaS: 5–10%.
- **Win-Back Revenue** — total ARR or MRR recovered from re-activated accounts in the period.
- **Average Time to Win-Back** — the average number of days between first win-back touch and contract signature.
- **Win-Back ROI** — (Win-Back Revenue - Win-Back Campaign Cost) / Win-Back Campaign Cost x 100.
- **Win-Back by Playbook** — compare win rates across the three playbooks to identify which is most effective.

### Re-Onboarding Content After Win-Back

When a churned customer is re-activated, a re-onboarding sequence begins automatically. Navigate to Administration > Re-Onboarding Sequences to configure this. The re-onboarding sequence is shorter than the initial onboarding but covers any new features, addresses the original churn reason directly (e.g. a product improvement walkthrough for those who churned due to missing features), and schedules an early success check-in call within the first 30 days of re-activation to ensure the customer is set up for success this time.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['marketing', 'renewal', 'winback', 'retention'],
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
    id: 'KB-DD9-016',
    title: 'Marketing Module — Reporting & Analytics',
    content: `## Marketing Module — Reporting & Analytics

The Marketing module provides a comprehensive analytics and reporting suite covering all stages of the marketing funnel: awareness, demand generation, pipeline contribution, and revenue impact. This guide describes the available dashboards, KPI metrics, and report formats used for weekly reviews, monthly board reporting, and longer-term cohort analysis.

### Marketing KPI Dashboards

Navigate to Marketing > Reporting > KPI Dashboard. The main dashboard is organised into four sections: Demand Generation, Pipeline, Revenue, and Efficiency.

#### Demand Generation Metrics

**MQL Volume:** The total number of Marketing Qualified Leads generated in the selected period. Track this weekly to identify seasonal patterns and assess whether demand generation activity is hitting targets.

**MQL Growth Rate:** Month-over-month percentage change in MQL volume. Positive growth indicates increasing marketing effectiveness; a decline triggers a review of active campaigns and lead source performance.

**MQL-to-SQL Conversion Rate:** The percentage of MQLs that are accepted by the sales team as Sales Qualified Leads. A strong conversion rate (typically 40–60% in well-aligned organisations) indicates that marketing is generating leads that match the ICP. A low conversion rate suggests a mismatch between marketing targeting and sales expectations.

**Lead Volume by Source:** Breakdown of leads generated by each channel (paid search, organic, LinkedIn, events, etc.). Use this to understand which channels are most productive and to inform budget allocation.

#### Efficiency Metrics

**CPL (Cost Per Lead):** Total marketing spend in the period / total leads generated. CPL varies significantly by channel; compare CPL within channel groups rather than across all channels.

**Cost Per MQL:** Total marketing spend / total MQLs generated. A more meaningful efficiency metric than CPL because it accounts for lead quality.

**CAC (Customer Acquisition Cost):** Total marketing spend / total new customers acquired. For a complete view, marketing CAC should be calculated alongside sales CAC and reported as blended CAC to the executive team.

#### Pipeline Metrics

**Pipeline Generated:** The total value of sales opportunities where marketing played a role in generating the lead. This includes both marketing-sourced pipeline (marketing was the first touch) and marketing-influenced pipeline (marketing had any touchpoint with the lead before the opportunity was created).

**Influenced Pipeline:** A broader measure than pipeline generated: all open or closed opportunities where any marketing touchpoint was recorded, regardless of whether marketing was the originating source.

**Pipeline Velocity:** Average deal value x win rate x number of open deals / average sales cycle length (in days). An increase in pipeline velocity means revenue is arriving faster.

#### Revenue Metrics

**Marketing-Sourced Revenue:** Revenue from closed-won deals where the original lead source was a marketing-owned channel (as opposed to a sales-sourced or partner-sourced lead).

**Marketing-Influenced Revenue:** Revenue from closed-won deals where marketing had any touchpoint in the buyer journey.

**Marketing Contribution to Revenue:** Marketing-sourced revenue / total company revenue x 100. The target percentage varies by company stage; early-stage SaaS companies often see marketing contributing 50–70% of pipeline; at enterprise scale this often reduces to 30–50%.

### Weekly and Monthly Digest Reports

Navigate to Marketing > Reporting > Digests.

**Weekly Digest:** Automatically generated every Monday morning for the marketing team. Includes: prior week MQL volume vs target, active campaign performance summary, top lead sources, LinkedIn activity summary, and any anomalies (campaigns significantly over or under target).

**Monthly Digest:** Generated on the first working day of each month. Includes: full KPI scorecard vs targets, campaign ROI summary, lead source attribution, partner contribution, renewal pipeline status, and a forward look at the next month's campaign calendar. Distributed automatically to the CMO, Head of Sales, and CEO.

### Board-Level Marketing Report Template

Navigate to Marketing > Reporting > Board Report. Generate the monthly board report template. The board report is structured as:

1. **Executive Summary** — three bullet points: what worked, what did not work, what is changing.
2. **Revenue Contribution** — marketing-sourced and marketing-influenced revenue, CAC, and marketing ROI.
3. **Pipeline** — pipeline generated, pipeline velocity, and MQL-to-SQL funnel conversion.
4. **Brand and Awareness** — web traffic, share of voice, and NPS trend.
5. **Investment Summary** — spend vs budget by channel and the forward spending plan.
6. **Key Risks and Actions** — any material risks to the marketing plan and the mitigating actions.

The template auto-populates from the live data in the module. Review and add narrative before publishing to the board portal.

### Cohort Analysis for Campaign Effectiveness

Navigate to Marketing > Reporting > Cohort Analysis. Cohort analysis groups leads by the month or quarter in which they were generated and tracks their progression through the funnel over time. This reveals true campaign performance beyond the metrics visible in a single reporting period.

Use cohort analysis to answer questions such as:

- How has the MQL-to-SQL conversion rate improved for leads generated by Q1 campaigns compared to Q3 campaigns?
- What is the average time from lead creation to closed-won deal for each quarterly cohort?
- Are leads from certain campaigns converting faster or at higher rates than others?

Select the cohort dimension (month of lead creation, campaign, or channel) and the metric to track (conversion rate, deal velocity, or average deal value). The cohort matrix visualises the data as a heat map, with each row representing a cohort and each column representing the time elapsed since lead creation.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['marketing', 'reporting', 'analytics', 'kpi', 'metrics'],
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
