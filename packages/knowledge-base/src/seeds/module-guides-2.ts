import type { KBArticle } from '../types';

export const moduleGuides2Articles: KBArticle[] = [
  {
    id: 'KB-MG-011',
    title: 'Maintenance Management (CMMS) Setup Guide',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['cmms', 'maintenance', 'work-orders', 'preventive-maintenance', 'assets'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Maintenance Management (CMMS) Setup Guide

## Purpose

The CMMS (Computerised Maintenance Management System) module manages all planned and reactive maintenance for plant, equipment, and facilities. It schedules preventive maintenance (PPM), raises and tracks work orders, manages spare parts, and measures maintenance KPIs including MTBF, MTTR, and OEE.

---

## Prerequisites

- Equipment / asset register (names, asset IDs, location, manufacturer, model, serial number)
- Existing PPM schedule (frequencies, tasks, responsible trades)
- Maintenance team structure (technicians, supervisors, trades)
- Spare parts list and stock locations
- Failure history (optional, for trend analysis)

---

## Step-by-Step Configuration

### 1. Enable the Module

  Settings → Modules → Maintenance (CMMS) → Enable

Module activates at port 3017 (web) and 4017 (API).

### 2. Create Location Hierarchy

  CMMS → Locations → New Location

Build your site/area hierarchy:
- Site (e.g., Manchester Plant)
  - Building / Block (e.g., Production Hall A)
    - Area / Room (e.g., Press Line 1)

Locations are used to assign assets and work orders to physical spaces.

### 3. Import the Asset Register

  CMMS → Assets → Import or New Asset

For each asset record:
- **Asset ID** — Unique identifier (e.g., EQ-001)
- **Asset name** — Descriptive name
- **Category** — Machinery, HVAC, Electrical, Vehicles, etc.
- **Location** — Select from your hierarchy
- **Manufacturer, Model, Serial number**
- **Criticality** — CRITICAL / HIGH / MEDIUM / LOW
  (CRITICAL assets trigger immediate alert on breakdown)
- **Install date** and **Warranty expiry date**

### 4. Define Maintenance Task Templates

  CMMS → Task Templates → New Template

Templates define reusable task lists for common maintenance activities:
- Task name (e.g., "6-month compressor service")
- Trade required (Mechanical, Electrical, Facilities, etc.)
- Estimated duration
- Task checklist (step-by-step instructions)
- Safety precautions (links to PTW module for high-risk)
- Required spare parts (from inventory)

### 5. Set Up the PPM Schedule

  CMMS → PPM → New Schedule

For each asset + task combination, create a PPM record:
- Link to asset
- Link to task template
- Frequency: Daily / Weekly / Monthly / Quarterly / Annual / Hour-based / Meter-based
- Lead time (days before due to generate the work order)
- Assigned technician or team
- Priority: ROUTINE / URGENT / CRITICAL

The system auto-generates work orders when the due date arrives.

### 6. Create Your First Work Order

  CMMS → Work Orders → New Work Order

Fields required:
- Work order type: PREVENTIVE / REACTIVE / INSPECTION / MODIFICATION / SHUTDOWN
- Asset link
- Description of work
- Priority: ROUTINE / URGENT / CRITICAL / EMERGENCY
- Assigned technician
- Planned start and end date/time
- Labour estimate (hours)
- Parts required (from inventory)

### 7. Configure KPI Thresholds

  CMMS → Settings → KPIs

Set targets for maintenance metrics:
- **MTBF** (Mean Time Between Failures) — target in hours
- **MTTR** (Mean Time To Repair) — target in hours
- **PM Compliance** — % of PPM completed on time (target: ≥ 95%)
- **Reactive vs Planned ratio** — target: ≥ 80% planned
- **Wrench time** — productive labour % target

### 8. Assign User Roles

  Settings → Users → [User] → Module Permissions → CMMS

Recommended assignments:
- Maintenance Manager: level 5 (APPROVE)
- Maintenance Planner: level 4 (MANAGE)
- Technician / Engineer: level 3 (EDIT) — update their own work orders
- Production Supervisor: level 2 (COMMENT) — raise reactive requests
- Read-only (management): level 1 (VIEW)

---

## First Actions After Enabling

1. Import your asset register (at least your critical assets)
2. Create task templates for your top 10 PPM activities
3. Build the PPM schedule for all critical assets
4. Raise and close your first work order to test the workflow
5. Review the maintenance KPI dashboard: CMMS → Dashboard

---

## Integration with Other Modules

- **Asset Management** — Asset register shared; depreciation tracked there
- **Inventory** — Parts consumption from work orders deducted from stock
- **Permit to Work (PTW)** — High-risk work orders require a PTW before starting
- **H&S** — Maintenance incidents linked to incident management
- **Finance** — Labour and parts costs posted to maintenance cost centres
`,
  },

  {
    id: 'KB-MG-012',
    title: 'Information Security Module (ISO 27001) Setup Guide',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['infosec', 'iso-27001', 'isms', 'cyber-security', 'data-protection', 'risk'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Information Security Module (ISO 27001) Setup Guide

## Purpose

The Information Security module implements an Information Security Management System (ISMS) aligned with ISO 27001:2022. It manages the information asset register, risk assessments, security controls (Annex A), policy management, security incidents, and ISMS audit readiness.

## ISO Standard Alignment

ISO 27001:2022 — Information Security Management Systems

Key clauses supported:
- Clause 4: Context (stakeholders, ISMS scope)
- Clause 6.1: Information security risk assessment and treatment
- Clause 6.2: Information security objectives
- Clause 8: Operation (risk treatment plan, Annex A controls)
- Clause 9: Performance evaluation (internal audits, management review)
- Clause 10: Improvement (incidents, nonconformities)

---

## Prerequisites

- ISMS scope statement (what systems, data, and processes are in scope)
- Information asset inventory (systems, databases, documents, devices)
- Names of CISO / Information Security Manager and data owners
- Current security policies (or intent to create them)
- Statement of Applicability (SoA) template or existing version

---

## Step-by-Step Configuration

### 1. Enable the Module

  Settings → Modules → Information Security → Enable

Module activates at port 3015 (web) and 4015 (API).

### 2. Define the ISMS Scope

  InfoSec → Settings → ISMS Scope

Document the scope of your ISMS:
- Organisational boundaries (departments, subsidiaries)
- Technology boundaries (on-premises, cloud, third-party)
- Physical boundaries (office locations, data centres)
- Exclusions (and justification for each)

### 3. Build the Information Asset Register

  InfoSec → Assets → New Asset

For each information asset:
- Asset name and description
- Asset type: SYSTEM / DATABASE / APPLICATION / DOCUMENT / DEVICE / NETWORK / PEOPLE
- Owner (responsible for the asset's security)
- Custodian (day-to-day management)
- Confidentiality, Integrity, Availability (CIA) rating (1–3 each)
- Asset value score (calculated: C + I + A)
- Hosting: On-Premises / Cloud / Hybrid / Third-party

### 4. Conduct Information Security Risk Assessments

  InfoSec → Risk Register → New Risk

For each threat/vulnerability combination against an asset:
1. Threat description (e.g., "Ransomware attack on file server")
2. Vulnerability (e.g., "Unpatched operating systems")
3. Likelihood (1–5)
4. Impact (1–5)
5. Inherent risk = Likelihood × Impact
6. Existing controls
7. Residual risk score
8. Risk treatment decision: ACCEPT / MITIGATE / TRANSFER / AVOID
9. Treatment plan with Annex A control references

### 5. Complete the Statement of Applicability (SoA)

  InfoSec → SoA

The SoA documents all 93 ISO 27001:2022 Annex A controls:
- For each control: INCLUDED or EXCLUDED
- Justification for exclusions
- Implementation status: NOT IMPLEMENTED / IN PROGRESS / IMPLEMENTED
- Evidence reference (link to policy, procedure, or technical control)

The system pre-populates all Annex A controls — you fill in the status and evidence.

### 6. Upload Security Policies

  InfoSec → Policies → New Policy

Required policies for ISO 27001 certification:
- Information Security Policy
- Access Control Policy
- Cryptography Policy
- Physical and Environmental Security Policy
- Supplier Security Policy
- Incident Management Procedure
- Business Continuity Plan
- Asset Management Policy
- Clear Desk / Clear Screen Policy
- Acceptable Use Policy

Link each policy to the relevant Annex A controls in the SoA.

### 7. Set Security Objectives

  InfoSec → Objectives → New Objective

Examples:
- "Achieve ISO 27001 certification by Q4 2026"
- "Reduce mean time to detect security incidents to < 1 hour by Q3 2026"
- "Complete security awareness training for 100% of staff by Q2 2026"
- "Patch all critical vulnerabilities within 72 hours of disclosure"

### 8. Configure Incident Reporting

  InfoSec → Settings → Incident Types

Define security incident categories:
- Malware / ransomware
- Data breach / unauthorised disclosure
- Phishing / social engineering
- Unauthorised access (logical)
- Unauthorised access (physical)
- Denial of service
- Lost / stolen device
- Insider threat

### 9. Assign User Roles

  Settings → Users → [User] → Module Permissions → InfoSec

Recommended assignments:
- CISO / Information Security Manager: level 6 (ADMIN)
- Security Analyst: level 4 (MANAGE)
- Asset Owner (department heads): level 3 (EDIT) — own assets
- All staff (security awareness): level 1 (VIEW)

---

## First Actions After Enabling

1. Document the ISMS scope
2. Import your top 20 information assets
3. Complete at least 5 risk assessments
4. Fill in the Statement of Applicability
5. Upload the Information Security Policy

---

## Related Modules

- **Risk Management** — InfoSec risks linked to enterprise risk register
- **Document Control** — Security policies stored as controlled documents
- **Incident Management** — Security incidents cross-referenced
- **Training Management** — Security awareness training records
- **Audit Management** — ISO 27001 internal audits
`,
  },

  {
    id: 'KB-MG-013',
    title: 'ESG Reporting Module Setup Guide',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['esg', 'sustainability', 'ghg', 'reporting', 'carbon', 'social', 'governance'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# ESG Reporting Module Setup Guide

## Purpose

The ESG Reporting module consolidates Environmental, Social, and Governance data from across all IMS modules into structured ESG reports aligned with GRI, SASB, TCFD, and CSRD frameworks. It calculates Scope 1, 2, and 3 GHG emissions, tracks social metrics (workforce, diversity, safety), and governance indicators.

---

## Reporting Frameworks Supported

- **GRI Standards** (2021) — Global Reporting Initiative
- **SASB** — Sustainability Accounting Standards Board
- **TCFD** — Task Force on Climate-related Financial Disclosures
- **CSRD / ESRS** — EU Corporate Sustainability Reporting Directive
- **UN SDGs** — Mapping to relevant Sustainable Development Goals
- **CDP** — Carbon Disclosure Project questionnaire format

---

## Prerequisites

- Baseline year data for GHG emissions (at least 1 year historical)
- Energy consumption data by source (electricity, gas, fuel, etc.)
- Waste generation data (total, recycled, landfill, incinerated)
- Water consumption data
- Workforce demographics data (from HR module)
- Safety data (from H&S module)
- Financial data (from Finance module) for GHG intensity calculations

---

## Step-by-Step Configuration

### 1. Enable the Module

  Settings → Modules → ESG Reporting → Enable

Module activates at port 3016 (web) and 4016 (API).

### 2. Configure the Reporting Baseline

  ESG → Settings → Baseline

Set your baseline year (the year against which progress is measured):
- Baseline year (typically 2019 or 2020 for most organisations)
- Baseline Scope 1 emissions (tCO2e)
- Baseline Scope 2 emissions (tCO2e)
- Baseline Scope 3 emissions (tCO2e) — if calculated
- Revenue baseline (for intensity calculations)

### 3. Set Up GHG Emission Sources

  ESG → Emissions → Emission Sources → New Source

Configure each source of GHG emissions:

**Scope 1 — Direct Emissions**
- Natural gas combustion (boilers, furnaces)
- Company vehicle fleet (fuel type and consumption)
- Refrigerant leaks (F-gases from HVAC, refrigeration)
- On-site fuel combustion (diesel generators, machinery)

**Scope 2 — Indirect (Purchased Energy)**
- Grid electricity (enter kWh consumption + location-based factor)
- Purchased heat or steam

**Scope 3 — Value Chain (optional but increasingly required)**
- Business travel (flights, rail, hotels)
- Employee commuting
- Purchased goods and services (spend-based or activity-based)
- Waste disposal
- Upstream transportation

The system applies IPCC / DEFRA emission factors automatically from the built-in \`@ims/emission-factors\` library. You can override with custom factors.

### 4. Connect Data Feeds from Other Modules

  ESG → Settings → Data Connections

Enable automatic data pulls:
- **Energy Management** → electricity and gas consumption → Scope 2 / Scope 1
- **H&S Module** → safety statistics → Social metrics (LTIFR, TRIR)
- **HR Module** → headcount, turnover, diversity → Social metrics
- **Finance** → revenue → GHG intensity denominators
- **Environmental Module** → waste and water data → Environmental metrics

### 5. Configure ESG Targets

  ESG → Targets → New Target

Set science-based or organisation-specific targets:
- Target type: Absolute / Intensity
- Baseline year value
- Target value
- Target year
- Coverage (Scope 1+2, Scope 1+2+3)

Example: "Reduce absolute Scope 1+2 emissions by 50% vs 2020 baseline by 2030"

### 6. Select Reporting Frameworks

  ESG → Reports → Settings → Frameworks

Select which frameworks your reports should map to. The system will flag which data points are still missing for each framework.

### 7. Generate Your First ESG Report

  ESG → Reports → New Report

- Select reporting period (typically calendar year or financial year)
- Select framework(s)
- Review auto-populated data from connected modules
- Fill in narrative sections (strategy, governance, risk management)
- Review and approve
- Export as PDF or submit via CDP/GRI portal

### 8. Assign User Roles

  Settings → Users → [User] → Module Permissions → ESG

Recommended assignments:
- Sustainability Manager / ESG Lead: level 5 (APPROVE)
- Data Collector (per module): level 3 (EDIT)
- Board / External Auditor: level 1 (VIEW)

---

## First Actions After Enabling

1. Enter baseline year GHG emission data
2. Configure all Scope 1 and Scope 2 emission sources
3. Connect data feeds from Energy and HR modules
4. Set at least 2 ESG targets (emissions + 1 social metric)
5. Generate a draft ESG report for the previous year

---

## Related Modules

- **Environmental Management** — Water, waste, spill data
- **Energy Management** — Energy consumption for Scope 1/2
- **HR** — Diversity, headcount, turnover for social metrics
- **H&S** — Safety statistics for social metrics
- **Finance** — Revenue intensity denominators
`,
  },

  {
    id: 'KB-MG-014',
    title: 'Energy Management Module (ISO 50001) Setup Guide',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['energy', 'iso-50001', 'ems', 'consumption', 'enpi', 'carbon'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Energy Management Module (ISO 50001) Setup Guide

## Purpose

The Energy Management module implements an Energy Management System (EnMS) aligned with ISO 50001:2018. It tracks energy consumption by source and site, establishes energy baselines, defines Energy Performance Indicators (EnPIs), identifies Significant Energy Uses (SEUs), and manages energy improvement action plans.

## ISO Standard Alignment

ISO 50001:2018 — Energy Management Systems

Key clauses supported:
- Clause 6.3: Energy review (SEUs, EnPIs, baselines)
- Clause 6.4: Energy performance indicators
- Clause 6.5: Energy baseline
- Clause 6.6: Energy data collection plan
- Clause 8.1: Operational control for SEUs
- Clause 9: Monitoring, measurement, and analysis

---

## Prerequisites

- Minimum 12 months of energy consumption data by source (electricity, gas, fuel oil, LPG, etc.)
- Energy bills / meter data (kWh, m³, litres, tonnes)
- Site layout showing major energy-consuming equipment
- Production or output data (for energy intensity calculations)
- Names of the Energy Manager and SEU owners

---

## Step-by-Step Configuration

### 1. Enable the Module

  Settings → Modules → Energy Management → Enable

Module activates at port 3021 (web) and 4020 (API).

### 2. Configure Energy Sources

  Energy → Sources → New Source

Add each energy source your organisation uses:
- **Source name** — Electricity, Natural Gas, Diesel, LPG, Biomass, Renewable (on-site solar, wind)
- **Unit of measurement** — kWh, m³, litres, GJ
- **CO₂ emission factor** — Auto-populated from built-in factor database, or enter custom
- **Tariff/unit cost** — For cost tracking alongside consumption

### 3. Enter the Energy Baseline

  Energy → Baseline → New Baseline

Set the energy baseline period:
- Select baseline period (typically 12 consecutive months)
- Enter monthly consumption for each energy source
- Enter the corresponding relevant variable (e.g., production units, degree-days, floor area) — used for normalisation
- System calculates baseline energy consumption and baseline EnPI

### 4. Define Energy Performance Indicators (EnPIs)

  Energy → EnPIs → New EnPI

EnPIs are quantitative measures of energy performance:
- **EnPI name** (e.g., "Electricity per tonne of product")
- **Numerator** — Energy consumption (kWh)
- **Denominator** — Relevant variable (production, area, occupancy hours)
- **Target** — Improvement target vs baseline (e.g., 10% reduction)
- **Measurement frequency** — Monthly, quarterly

Examples of common EnPIs:
- kWh/unit produced
- kWh/m² (building energy intensity)
- kWh/person (offices)
- kgCO₂e/£ revenue (carbon intensity)

### 5. Identify Significant Energy Uses (SEUs)

  Energy → SEUs → New SEU

An SEU is a substantial energy consumer where improvement potential exists:
- Equipment or process name (e.g., "Compressed Air System")
- Energy source
- Annual consumption (kWh/year)
- % of total site energy
- Current performance (baseline EnPI)
- Relevant variables affecting consumption
- Person responsible

ISO 50001 requires operational controls for all SEUs.

### 6. Enter Monthly Consumption Data

  Energy → Readings → New Reading

Enter meter readings or invoice data monthly:
- Date (month/year)
- Energy source
- Site / meter
- Quantity consumed (in source unit)
- Cost (£/€/$)

Or connect to automatic meter reading (AMR) via the API integration.

### 7. Create Energy Improvement Actions

  Energy → Action Plan → New Action

For each identified energy saving opportunity:
- Description of the action (e.g., "Install LED lighting in production hall")
- Energy saving estimate (kWh/year)
- Cost saving estimate (£/year)
- Payback period
- Investment required
- Responsible person
- Implementation timeline
- Verification method

### 8. Assign User Roles

  Settings → Users → [User] → Module Permissions → Energy

Recommended assignments:
- Energy Manager: level 5 (APPROVE)
- Energy Data Collector: level 3 (EDIT)
- SEU Owner (department managers): level 3 (EDIT)
- Finance (cost view): level 1 (VIEW)

---

## First Actions After Enabling

1. Configure all energy sources
2. Enter 12 months of baseline data
3. Calculate baseline EnPIs
4. Identify your top 5 Significant Energy Uses
5. Create 3 energy improvement action plans

---

## Related Modules

- **ESG Reporting** — Energy data auto-feeds Scope 1/2 GHG calculations
- **Environmental Management** — Energy as an environmental aspect
- **CMMS** — Maintenance of energy-consuming equipment
- **Finance** — Energy cost tracking vs budget
`,
  },

  {
    id: 'KB-MG-015',
    title: 'Inventory Management Setup Guide',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['inventory', 'stock', 'warehouse', 'parts', 'procurement', 'goods-receipt'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Inventory Management Setup Guide

## Purpose

The Inventory Management module tracks stock levels, movements, goods receipt, and stock-outs across all warehouse locations. It integrates with the CMMS module (spare parts for maintenance) and the Finance module (stock valuation and cost of goods).

---

## Prerequisites

- Full inventory list with: part number, description, unit of measure, category
- Current stock levels and locations
- Supplier list for each stock item
- Minimum / reorder / maximum stock levels (or intent to set them)
- Warehouse / store locations

---

## Step-by-Step Configuration

### 1. Enable the Module

  Settings → Modules → Inventory Management → Enable

Module activates at port 3005 (web) and 4005 (API).

### 2. Configure Storage Locations

  Inventory → Locations → New Location

Set up your warehouse and storage structure:
- Main Store / Warehouse (site level)
  - Aisle / Row
    - Bay / Shelf / Bin

Each stock item is assigned a primary storage location.

### 3. Define Stock Categories

  Inventory → Settings → Categories

Create categories for your stock items:
- Spare Parts (for maintenance / CMMS)
- Consumables (cleaning, PPE, office)
- Raw Materials (production inputs)
- Finished Goods
- Packaging Materials
- Safety & PPE Items

### 4. Import the Stock Item Master

  Inventory → Items → Import or New Item

For each item:
- **Part number / SKU** — Unique identifier
- **Description** — Clear, standardised name
- **Category**
- **Unit of measure** — EA (each), KG, LTR, M, BOX
- **Primary supplier** and supplier part number
- **Lead time** (days from order to delivery)
- **Unit cost** (last purchase price)
- **Storage location**
- **Min stock** — Trigger reorder when stock falls to this level
- **Reorder quantity** — How much to order
- **Max stock** — Maximum to hold (prevents over-stocking)

### 5. Enter Opening Stock

  Inventory → Stock Count → New Count

Conduct an opening stock count:
- Select location(s)
- Count each item
- Enter counted quantity
- System posts opening stock movements

### 6. Configure Reorder Alerts

  Inventory → Settings → Alerts

Set up low-stock and out-of-stock notifications:
- Low stock alert: item reaches minimum stock level
- Out of stock alert: item reaches zero
- Slow-moving alert: no movement in X days
- Alert recipients: Procurement / Store Manager

### 7. Process Your First Goods Receipt

  Inventory → Goods Receipt → New GRN

When goods arrive:
1. Select the purchase order (if raised in Finance)
2. Enter the quantity received per item
3. Confirm storage location
4. System updates stock levels automatically

### 8. Assign User Roles

  Settings → Users → [User] → Module Permissions → Inventory

Recommended assignments:
- Inventory / Stores Manager: level 5 (APPROVE)
- Warehouse Operative / Store Keeper: level 3 (EDIT)
- Maintenance Technician (parts requests): level 2 (COMMENT)
- Finance (valuation view): level 1 (VIEW)

---

## First Actions After Enabling

1. Set up your storage locations
2. Import your stock item master
3. Conduct an opening stock count
4. Set minimum and reorder levels for top 20 critical items
5. Process a test goods receipt

---

## Related Modules

- **CMMS** — Parts used on work orders deducted from inventory
- **Finance** — Stock valuation, cost of goods sold
- **Supplier Management** — Supplier performance and lead times
- **Procurement / Contracts** — Purchase orders raised and tracked
`,
  },

  {
    id: 'KB-MG-016',
    title: 'CRM (Customer Relationship Management) Setup Guide',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['crm', 'customers', 'leads', 'pipeline', 'sales', 'contacts', 'opportunities'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# CRM (Customer Relationship Management) Setup Guide

## Purpose

The CRM module manages the full customer lifecycle: lead capture, opportunity management, account management, contact tracking, and sales pipeline reporting. It feeds data to the Customer Portal and integrates with the Finance module for revenue tracking.

---

## Prerequisites

- Existing customer list (company names, contacts, contract values)
- Sales pipeline stages used by your sales team
- Lead sources tracked (website, referral, events, outbound, etc.)
- Sales territories or regions (if applicable)
- CRM administrator and sales team member names

---

## Step-by-Step Configuration

### 1. Enable the Module

  Settings → Modules → CRM → Enable

Module activates at port 3014 (web) and 4014 (API).

### 2. Configure Pipeline Stages

  CRM → Settings → Pipeline Stages

Define your sales pipeline stages (drag to reorder):
1. Lead Identified
2. Qualified
3. Proposal Sent
4. Negotiation
5. Closed Won
6. Closed Lost

Each stage has a configurable probability % used for weighted pipeline value.

### 3. Define Lead Sources

  CRM → Settings → Lead Sources

Customise your lead source categories:
- Website enquiry
- Inbound call
- Referral (customer/partner)
- Trade show / event
- Outbound prospecting
- Marketing campaign
- Social media

### 4. Import Existing Accounts

  CRM → Accounts → Import or New Account

For each customer account:
- Company name and industry
- Account type: PROSPECT / CUSTOMER / PARTNER / FORMER
- Annual revenue (optional)
- Contract value with your organisation
- Account owner (sales person)
- Address and website

### 5. Import Contacts

  CRM → Contacts → Import or New Contact

For each contact person:
- Full name, job title
- Email and phone
- Linked account (company)
- Contact type: DECISION MAKER / INFLUENCER / CHAMPION / END USER

### 6. Create Your First Opportunity

  CRM → Opportunities → New Opportunity

Fields required:
- Opportunity name (e.g., "Helix Manufacturing — ISO 9001 Implementation")
- Linked account
- Stage (where in the pipeline)
- Value (£/€/$)
- Probability %
- Expected close date
- Primary contact
- Products / services (if configured)

### 7. Log Activities

  CRM → Activities → New Activity

Track all customer interactions:
- Activity type: CALL / EMAIL / MEETING / DEMO / SITE VISIT
- Date and time
- Linked opportunity/account/contact
- Notes from the interaction
- Follow-up action required (creates a task)

### 8. Set Up Win/Loss Analysis

  CRM → Settings → Closed Reasons

Configure reasons for won and lost deals:
- Won: Competitive price / Best product / Strong relationship / Quick delivery
- Lost: Price too high / Competitor chosen / Budget cut / No decision made / Requirement mismatch

### 9. Assign User Roles

  Settings → Users → [User] → Module Permissions → CRM

Recommended assignments:
- Sales Manager / CRM Admin: level 5 (APPROVE)
- Account Executive / Sales Rep: level 4 (MANAGE) — their own accounts
- Sales Development Rep: level 3 (EDIT)
- Finance (revenue view): level 1 (VIEW)

---

## First Actions After Enabling

1. Configure your pipeline stages and lead sources
2. Import your existing customer accounts
3. Import your current open opportunities
4. Log at least 5 historical activities per active opportunity
5. Review the pipeline dashboard: CRM → Dashboard → Pipeline

---

## Related Modules

- **Finance** — Customer invoicing and revenue linked to CRM accounts
- **Contracts** — Customer contracts linked to CRM accounts
- **Customer Portal** — Self-service access for CRM account contacts
- **Complaints** — Customer complaints linked to CRM contacts
- **Marketing** — Campaign attribution to lead sources
`,
  },

  {
    id: 'KB-MG-017',
    title: 'Field Service Management Setup Guide',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['field-service', 'jobs', 'dispatch', 'sla', 'technicians', 'scheduling'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Field Service Management Setup Guide

## Purpose

The Field Service module manages the dispatch and tracking of field technicians for service calls, installations, and inspections at customer sites. It handles job scheduling, SLA monitoring, parts consumption, and customer sign-off on completion.

---

## Prerequisites

- List of field technicians with skills/trade qualifications
- Service contract SLA tiers (response time, resolution time by priority)
- Customer site list with access requirements
- Job types and task templates for common service activities
- Vehicle / parts van inventory per technician (if applicable)

---

## Step-by-Step Configuration

### 1. Enable the Module

  Settings → Modules → Field Service → Enable

Module activates at port 3023 (web) and 4022 (API).

### 2. Set Up Technician Profiles

  Field Service → Technicians → New Technician

For each field technician:
- Name (linked to HR employee record)
- Skills / trade qualifications (used for job matching)
- Base location / depot
- Availability hours and working patterns
- Vehicle registration (if applicable)

### 3. Define Job Types

  Field Service → Settings → Job Types

Create job type templates:
- Planned Maintenance Visit
- Reactive Repair
- Installation
- Commissioning
- Inspection / Survey
- Emergency Call-Out

Each job type has a default task list, estimated duration, and required skills.

### 4. Configure SLA Tiers

  Field Service → Settings → SLA Tiers

Define your service level agreements by priority:

| Priority | Response Time | Resolution Time |
|----------|-------------|----------------|
| P1 Emergency | 2 hours | 4 hours |
| P2 High | 4 hours | 8 hours (same day) |
| P3 Medium | Next business day | 3 business days |
| P4 Low | 3 business days | 7 business days |

The system automatically flags at-risk and breached SLAs.

### 5. Import Customer Sites

  Field Service → Sites → Import or New Site

For each customer site:
- Site name and address
- Account manager (CRM link)
- Site contact and emergency contact
- Access requirements (key code, permit needed, escort required)
- Equipment on site (link to asset register or describe)
- Contracted SLA tier

### 6. Create and Dispatch Your First Job

  Field Service → Jobs → New Job

Fields required:
- Job type
- Customer site
- Priority / SLA tier
- Description of work required
- Assign technician (system shows available technicians with matching skills)
- Planned date and time window
- Required parts (pulled from inventory)

When dispatched, the technician receives a mobile notification with job details, site map, and task checklist.

### 7. Configure the Scheduling Board

  Field Service → Scheduling Board

The scheduling board provides a visual calendar/Gantt view of all technicians and their assigned jobs. Drag and drop jobs between technicians and time slots.

Filters: by technician, skill, geography, priority, customer.

### 8. Assign User Roles

  Settings → Users → [User] → Module Permissions → Field Service

Recommended assignments:
- Field Service Manager: level 5 (APPROVE) — approve completions, manage SLAs
- Dispatcher / Scheduler: level 4 (MANAGE) — assign and schedule jobs
- Field Technician: level 3 (EDIT) — update and close own jobs
- Customer (via portal): level 1 (VIEW) — track their jobs

---

## First Actions After Enabling

1. Set up technician profiles with skills
2. Configure SLA tiers for your service contracts
3. Import your customer sites
4. Create 5 job type templates
5. Raise and dispatch your first job

---

## Related Modules

- **CRM** — Customer accounts and sites linked
- **Inventory** — Parts consumption on field jobs
- **CMMS** — Internal maintenance vs field service distinction
- **Contracts** — Customer service contract SLA definitions
- **Customer Portal** — Customer self-service job tracking
`,
  },

  {
    id: 'KB-MG-018',
    title: 'Payroll Management Setup Guide',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['payroll', 'salary', 'pay-run', 'tax', 'paye', 'deductions', 'hr'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Payroll Management Setup Guide

## Purpose

The Payroll module processes employee pay runs, calculates gross pay, statutory deductions (income tax, national insurance / social security), voluntary deductions (pension, benefits), and generates payslips and HMRC / tax authority submissions.

---

## Prerequisites

- Employee records set up in the HR module (mandatory prerequisite)
- Salary or hourly rate for each employee
- Tax codes and national insurance categories (UK) or equivalent
- Pension scheme details and employee/employer contribution rates
- Any existing P45s for new starters
- Pay period: weekly, fortnightly, or monthly

---

## Step-by-Step Configuration

### 1. Enable the Module

  Settings → Modules → Payroll → Enable

Requires HR module to be active. Module activates at port 3007 (web) and 4007 (API).

### 2. Configure Payroll Settings

  Payroll → Settings → General

- **Pay frequency** — Monthly / Weekly / Fortnightly
- **Pay date** — Day of month (e.g., last working day)
- **Tax year** — UK: 6 April to 5 April; US: Calendar year
- **Tax jurisdiction** — Select country; system applies correct tax tables

### 3. Set Up Pay Components

  Payroll → Settings → Pay Components

Define all pay elements:

**Earnings (positive)**
- Basic Salary
- Overtime (1.0×, 1.5×, 2.0×)
- Bonus (fixed amount or % of salary)
- Commission
- Expenses reimbursement
- Sick pay (SSP or contractual)
- Maternity / Paternity pay

**Deductions (negative)**
- Employee pension contribution (auto-enrolment: min 5%)
- Salary sacrifice (cycle to work, childcare vouchers)
- Court orders / attachment of earnings
- Union membership

### 4. Configure Pension

  Payroll → Settings → Pension

- Pension provider name
- Scheme reference
- Auto-enrolment qualifying earnings band
- Employee contribution % (default: 5%)
- Employer contribution % (default: 3%)
- Assessment date for new starters (3 months)

### 5. Add Employees to Payroll

  Payroll → Employees → Import from HR

Employees are imported from HR. For each, configure:
- Employment start date for payroll
- Pay rate (salary or hourly)
- Pay component assignments (basic + any additions)
- Tax code (e.g., 1257L in UK)
- NI category (A, B, C, etc.)
- Pension opt-in or opt-out
- Bank account details (for BACS payment file)

### 6. Run Your First Pay Run

  Payroll → Pay Runs → New Pay Run

1. Select pay period (e.g., March 2026)
2. System calculates gross pay, tax, NI, pension for all employees
3. Review the payroll summary (total wages, total deductions, net pay)
4. Approve any variable pay (overtime, bonuses) — flag exceptions
5. **Lock** the pay run to prevent further changes
6. Generate payslips (employees notified via email / self-service portal)
7. Generate BACS payment file for bank upload
8. Generate RTI submission for HMRC (UK) / payroll tax file for other jurisdictions

### 7. Assign User Roles

  Settings → Users → [User] → Module Permissions → Payroll

Recommended assignments:
- Payroll Manager: level 6 (ADMIN) — full access including bank files
- HR Manager: level 3 (EDIT) — can update pay rates, not run pay runs
- Finance Manager: level 1 (VIEW) — payroll cost reports only
- Employee: level 1 (VIEW) — own payslips only

---

## First Actions After Enabling

1. Configure pay settings and jurisdiction
2. Set up pension scheme
3. Import all employees from HR module
4. Run a test pay run for 1 employee and verify calculations
5. Run the full first pay run and generate payslips

---

## Related Modules

- **HR** — Employee records are the data source for payroll
- **Finance** — Payroll costs posted as journal entries to Finance module
- **Document Control** — Payslips stored as secure employee documents
`,
  },

  {
    id: 'KB-MG-019',
    title: 'Workflows & Automation Setup Guide',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['workflows', 'automation', 'triggers', 'approvals', 'notifications', 'bpm'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Workflows & Automation Setup Guide

## Purpose

The Workflows module is a cross-module automation engine that triggers actions, approval chains, and notifications based on events occurring in any part of IMS. It eliminates manual follow-up and ensures consistent processes across departments.

---

## Key Concepts

- **Trigger** — The event that starts the workflow (e.g., "Incident created with severity MAJOR")
- **Condition** — An optional filter on the trigger (e.g., "Only if department = Production")
- **Action** — What the workflow does (e.g., "Send email", "Create task", "Update field")
- **Approval** — A human decision step inserted into the workflow
- **Workflow** — A named, reusable combination of trigger → conditions → actions

---

## Prerequisites

- Active modules whose events you want to automate (H&S, Quality, HR, etc.)
- Email templates or notification text prepared
- Clarity on which processes need standardised approval chains

---

## Step-by-Step Configuration

### 1. Enable the Module

  Settings → Modules → Workflows → Enable

Module activates at port 3008 (web) and 4008 (API).

### 2. Create Your First Workflow

  Workflows → New Workflow

**Step 1: Name and describe**
- Workflow name (e.g., "Major Incident Escalation")
- Description
- Active/Inactive toggle

**Step 2: Select trigger**

Available trigger categories:
- **H&S** — Incident created, Risk assessed as HIGH, Objective overdue
- **Quality** — NCR raised, Inspection failed, Customer complaint received
- **HR** — Employee onboarded, Leave request submitted, Training expiring
- **Finance** — Expense over threshold, Invoice overdue, Budget 80% consumed
- **Document** — Document due for review, New document published
- **Risk** — Risk score increased, Treatment action overdue
- **General** — Schedule-based (daily/weekly/monthly at a set time)

**Step 3: Add conditions (optional)**
Filter the trigger using AND/OR logic on any field of the triggering record.

**Step 4: Add actions**

Available action types:
- **Send notification** — Push notification or in-app alert to selected users/roles
- **Send email** — Email to specific users, roles, or the record's owner (supports templates with {{field}} substitution)
- **Create task** — Assign a follow-up task to a user with a due date
- **Update field** — Set a field value on the triggering record
- **Create record** — Auto-create a linked record (e.g., create a CAPA when NCR raised)
- **Approval request** — Request a human decision; branch on approved/rejected
- **Webhook** — POST data to an external system (Slack, Teams, Jira, etc.)

### 3. Multi-Step Approval Workflows

  Workflows → New Workflow → Add Approval Step

Build sequential approval chains:
1. User A submits expense claim
2. Workflow: Line manager approval requested
   - If APPROVED → Finance team notified for payment
   - If REJECTED → Submitter notified with reason
3. If claim > £5,000: additional Finance Manager approval required

### 4. Workflow Templates

  Workflows → Templates

Built-in templates you can activate with one click:
- Incident escalation (severity-based)
- Document review reminder (7 days before expiry)
- Training expiry reminder (90/30 days)
- New employee onboarding checklist
- Risk review reminder
- NCR investigation assignment
- Purchase order approval chain
- Leave request approval

### 5. Workflow Monitoring

  Workflows → History

Monitor all workflow executions:
- Status: RUNNING / COMPLETED / FAILED / WAITING_FOR_APPROVAL
- Trigger event details
- Action log (each action result)
- Error messages for failed workflows

### 6. Assign User Roles

  Settings → Users → [User] → Module Permissions → Workflows

Recommended assignments:
- System Admin / Process Owner: level 6 (ADMIN) — create and modify workflows
- Department Manager: level 3 (EDIT) — run manual workflows for their department
- All users: interaction through notifications and approval requests

---

## First Actions After Enabling

1. Activate the built-in "Incident escalation" template
2. Activate the "Training expiry reminder" template
3. Build a custom workflow for your most manual approval process
4. Test by triggering an event manually
5. Review the workflow history after 1 week to confirm executions

---

## Related Modules

Works with all active modules. Key integrations:
- **H&S** — Incident and risk workflows
- **HR** — Leave, onboarding, offboarding workflows
- **Quality** — NCR investigation and CAPA workflows
- **Finance** — Expense and invoice approval workflows
- **Document Control** — Document review and approval workflows
`,
  },

  {
    id: 'KB-MG-020',
    title: 'Project Management Setup Guide',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['projects', 'project-management', 'tasks', 'milestones', 'gantt', 'resources'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Project Management Setup Guide

## Purpose

The Project Management module provides structured project planning, task tracking, milestone management, resource allocation, and progress reporting. It is used for major initiatives such as management system implementation projects, capital projects, new product introductions, and compliance programmes.

---

## Prerequisites

- List of current or upcoming projects with scope, budget, and deadline
- Project team members (link to HR employee records)
- Project templates for repeatable project types (optional)
- Budget codes for cost tracking (link to Finance module)

---

## Step-by-Step Configuration

### 1. Enable the Module

  Settings → Modules → Project Management → Enable

Module activates at port 3009 (web) and 4009 (API).

### 2. Create Your First Project

  Projects → New Project

Fields required:
- **Project name** — Descriptive title
- **Project type** — INTERNAL / CLIENT / REGULATORY / CAPITAL / IMPROVEMENT
- **Project manager** — Linked to HR employee record
- **Start date** and **Target completion date**
- **Budget** (optional, links to Finance cost centre)
- **Priority** — CRITICAL / HIGH / MEDIUM / LOW
- **Status** — PLANNING / IN PROGRESS / ON HOLD / COMPLETED / CANCELLED
- **Description** and **objectives**

### 3. Add Project Milestones

  Projects → [Project] → Milestones → New Milestone

Milestones mark significant project checkpoints:
- Milestone name (e.g., "Phase 1 Complete — Requirements Signed Off")
- Due date
- Owner
- Success criteria

### 4. Build the Work Breakdown Structure

  Projects → [Project] → Tasks → New Task

Break the project into deliverable tasks:
- Task name and description
- Assigned to (team member)
- Start date and due date
- Estimated effort (hours)
- Dependencies (which tasks must complete first)
- Priority
- Linked milestone

The system renders tasks as a Gantt chart automatically.

### 5. Manage Resources

  Projects → [Project] → Resources → Add Member

Add team members and configure their allocation:
- Team member (HR link)
- Role on project (Project Manager, Developer, Analyst, etc.)
- Allocation % (e.g., 50% of their time)
- Date range on the project

The resource planner shows utilisation across all projects to identify over-allocation.

### 6. Track Progress

  Projects → [Project] → Dashboard

The project dashboard shows:
- % tasks complete
- % milestones achieved
- Budget spend vs plan
- RAG status (Red / Amber / Green)
- Upcoming tasks (next 14 days)
- Overdue tasks

Update task progress: click a task → set % complete → add status notes.

### 7. Configure Project Templates

  Projects → Templates → New Template

For repeatable projects, create a template with:
- Standard task list
- Default durations and dependencies
- Standard milestones
- Default team roles

When creating a new project from a template, all tasks are auto-generated with relative dates.

### 8. Assign User Roles

  Settings → Users → [User] → Module Permissions → Project Management

Recommended assignments:
- PMO / Programme Manager: level 5 (APPROVE)
- Project Manager: level 4 (MANAGE) — their own projects
- Project Team Member: level 3 (EDIT) — update own tasks
- Stakeholder / Sponsor: level 1 (VIEW)

---

## First Actions After Enabling

1. Create your most important active project
2. Add milestones for the key phases
3. Break it down into tasks and assign owners
4. Set dependencies between tasks
5. Review the Gantt chart and adjust the plan

---

## Related Modules

- **HR** — Team members linked to employee records
- **Finance** — Project budget and cost tracking
- **Document Control** — Project documentation stored as controlled records
- **Workflows** — Project approval workflows (gate reviews)
`,
  },

  {
    id: 'KB-MG-021',
    title: 'Food Safety Management Setup Guide',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['food-safety', 'haccp', 'allergens', 'fsms', 'brc', 'iso-22000'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Food Safety Management Setup Guide

## Purpose

The Food Safety module implements a Food Safety Management System (FSMS) aligned with ISO 22000:2018 and BRC Global Standards. It manages HACCP plans, Critical Control Points (CCPs), allergen registers, supplier approval, product traceability, and food safety incidents.

## Standard Alignment

- ISO 22000:2018 — Food Safety Management Systems
- BRC Global Standard for Food Safety (Issue 9)
- HACCP principles (Codex Alimentarius)

---

## Prerequisites

- Process flow diagrams for each product / product group
- Existing HACCP documentation (if any)
- Allergen matrix for your products
- Approved supplier list
- Cleaning and disinfection schedules
- Pest control records

---

## Step-by-Step Configuration

### 1. Enable the Module

  Settings → Modules → Food Safety → Enable

Module activates at port 3020 (web) and 4019 (API).

### 2. Define Your Product Range

  Food Safety → Products → New Product

For each product or product group:
- Product name and description
- Product category (ready-to-eat, raw, processed, etc.)
- Intended use and consumers (including vulnerable groups)
- Allergen content (from the 14 major allergens list)
- Shelf life and storage conditions
- Packaging type

### 3. Build Process Flow Diagrams

  Food Safety → Process Flows → New Flow

For each product:
1. Add process steps in sequence (Receive → Store → Prepare → Cook → Cool → Pack → Dispatch)
2. For each step, indicate: Is this a potential hazard point?
3. Verify the flow diagram (physical walkthrough confirmation)

### 4. Conduct Hazard Analysis

  Food Safety → HACCP → Hazard Analysis

For each process step, identify hazards:
- **Biological** (Salmonella, Listeria, E. coli, viruses)
- **Chemical** (cleaning chemicals, pesticides, allergens, migration from packaging)
- **Physical** (glass, metal, bone, stone, wood, plastics)
- **Radiological** (where applicable)

For each hazard:
- Severity (1–5) × Likelihood (1–5) = Risk score
- If risk score is significant: identify control measure

### 5. Set Critical Control Points (CCPs)

  Food Safety → HACCP → CCPs → New CCP

Using the decision tree (Is there a control measure? Can this step eliminate or reduce hazard to acceptable level? etc.):

For each CCP:
- CCP number and description
- Hazard being controlled
- Critical limit (e.g., "Core temperature ≥ 75°C for ≥ 2 minutes")
- Monitoring procedure (what, how, frequency, who)
- Corrective action (if limit breached)
- Verification procedure (how you confirm CCP is under control)
- Records to keep

### 6. Build the Allergen Register

  Food Safety → Allergens → Allergen Matrix

Map all 14 major allergens across your products:
- Celery, Cereals containing gluten, Crustaceans, Eggs, Fish, Lupin, Milk, Molluscs, Mustard, Nuts, Peanuts, Sesame, Soya, Sulphur dioxide

For each product × allergen combination:
- CONTAINS / MAY CONTAIN (cross-contamination risk) / FREE FROM

### 7. Supplier Approval

  Food Safety → Suppliers → Supplier Approval

Maintain an approved supplier list:
- Supplier name and category (ingredients, packaging, services)
- Approval status: APPROVED / CONDITIONAL / SUSPENDED
- Certification (BRC, SQF, FSSC 22000, ISO 22000)
- Approval date and next review date
- Risk rating

### 8. Assign User Roles

  Settings → Users → [User] → Module Permissions → Food Safety

Recommended assignments:
- Food Safety Manager / HACCP Team Leader: level 5 (APPROVE)
- Food Safety Officer: level 4 (MANAGE)
- Production Supervisor: level 3 (EDIT)
- QC Operator: level 3 (EDIT) — enter CCP monitoring records
- Auditor: level 1 (VIEW)

---

## First Actions After Enabling

1. Define your product range with allergen information
2. Build process flow diagrams for your top 3 products
3. Complete hazard analysis and CCP identification
4. Set critical limits for each CCP
5. Configure monitoring records for daily CCP data entry

---

## Related Modules

- **Quality Management** — Nonconformances from food safety inspections
- **Supplier Management** — Supplier approval cross-referenced
- **Document Control** — HACCP plans and cleaning schedules as controlled docs
- **Training Management** — Food safety and allergen awareness training
- **Incident Management** — Food safety incidents and product recalls
`,
  },

  {
    id: 'KB-MG-022',
    title: 'Permit to Work (PTW) Setup Guide',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['permit-to-work', 'ptw', 'hot-work', 'confined-space', 'electrical', 'safety'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Permit to Work (PTW) Setup Guide

## Purpose

The Permit to Work module manages formal written authorisation for high-risk work activities. It ensures that hazardous tasks — such as hot work, confined space entry, electrical isolation, and working at height — are properly assessed, precautions are in place, and authorised persons have confirmed safety before work begins.

---

## Prerequisites

- List of high-risk work activities that require formal permits in your workplace
- Site areas and equipment that require permits
- List of authorising persons (managers qualified to sign permits)
- List of issuing and receiving persons (supervisors and operatives)
- Isolations register for electrical/mechanical lockout/tagout

---

## Step-by-Step Configuration

### 1. Enable the Module

  Settings → Modules → Permit to Work → Enable

Module activates at port 3039 (web) and 4034 (API).

### 2. Configure Permit Types

  PTW → Settings → Permit Types

Define the categories of permits used at your site. Standard permit types:

- **Hot Work Permit** — Welding, cutting, grinding, use of naked flame
- **Confined Space Entry Permit** — Entry into vessels, tanks, sewers, excavations
- **Electrical Isolation Permit (LOTO)** — Lockout/Tagout for electrical equipment
- **Working at Height Permit** — Scaffolding, ladders, roof work, mobile platforms
- **Excavation Permit** — Ground works, trenching, underground services
- **Chemical/Hazardous Substance Permit** — Fumigation, use of highly hazardous substances
- **Line Break Permit** — Opening of pipelines and process vessels
- **Radiation Permit** — Radiography and radioactive source use

### 3. Build Permit Templates

  PTW → Templates → New Template

For each permit type, configure the form template:
- **Precautions checklist** — Mandatory safety measures to confirm before starting
- **Isolations required** — List of energy isolations to complete
- **PPE required** — Mandatory PPE for this permit type
- **Gas testing required** — Yes/No and frequency
- **Attendant required** — Whether a standby person is required
- **Emergency procedure** — Reference to relevant emergency plan

### 4. Define Authorising and Issuing Persons

  PTW → Settings → Authorised Personnel

Register all persons qualified to authorise or issue permits:
- Person name (HR link)
- Role: AUTHORISING AUTHORITY / PERMIT ISSUER / PERMIT RECEIVER
- Permit types they are qualified for
- Qualification expiry date (if applicable)

Only registered authorising authorities can sign off permits of their type.

### 5. Configure Permit Areas

  PTW → Areas → New Area

Map your site into permit areas:
- Area name (e.g., "Boiler House", "Production Line 3", "Roof Level")
- Responsible authorising authority for that area
- Any standing isolations or hazards

### 6. Issue Your First Permit

  PTW → New Permit

1. Select permit type
2. Select area of work
3. Describe the work to be carried out
4. Enter the permit issuer (person issuing the permit to the worker)
5. Enter the permit receiver (worker carrying out the task)
6. Complete the precautions checklist — every item must be signed off
7. Enter permit validity period (start time → expiry time)
8. **Authorising Authority signs off** → permit becomes ACTIVE
9. Permit receiver receives the permit (digital or printed copy)

### 7. Manage Live Permits

  PTW → Live Permits

View all currently active permits:
- Colour coded: GREEN (active), AMBER (expiring within 1 hour), RED (expired)
- Extend a permit before expiry (requires re-authorisation)
- Suspend a permit (if unsafe conditions arise)
- Close a permit (when work is complete and area handed back safely)

### 8. Assign User Roles

  Settings → Users → [User] → Module Permissions → PTW

Recommended assignments:
- Site Manager / Safety Manager: level 6 (ADMIN) — configure permit types
- Authorising Authority: level 5 (APPROVE) — sign off permits
- Permit Issuer (supervisors): level 4 (MANAGE) — issue permits
- Permit Receiver (operatives): level 2 (COMMENT) — receive and close permits
- CMMS Technician: level 2 — maintenance tasks trigger permit requests

---

## First Actions After Enabling

1. Configure your site-specific permit types
2. Build templates with precautions checklists
3. Register all authorising authorities and issuers
4. Issue your first test permit and complete the full lifecycle (open → close)
5. Link high-risk CMMS work orders to require a PTW before work commences

---

## Related Modules

- **CMMS** — High-risk work orders trigger PTW requirement
- **H&S** — Permit violations linked to incident reporting
- **Document Control** — PTW procedure stored as controlled document
- **Training Management** — PTW training records for authorised personnel
`,
  },

  {
    id: 'KB-MG-023',
    title: 'Asset Management Setup Guide',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['assets', 'asset-register', 'lifecycle', 'depreciation', 'capex', 'tracking'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Asset Management Setup Guide

## Purpose

The Asset Management module maintains the enterprise asset register, tracks asset lifecycle from acquisition to disposal, calculates depreciation, manages asset movements between locations, and provides asset performance and valuation reporting for finance and compliance purposes.

---

## Prerequisites

- Fixed asset register (current list of capital assets)
- Asset categories and depreciation policies per category
- Acquisition dates, purchase costs, and useful lives
- Current asset locations and assigned custodians
- Disposal records for assets no longer in use

---

## Step-by-Step Configuration

### 1. Enable the Module

  Settings → Modules → Asset Management → Enable

Module activates at port 3034 (web) and 4030 (API).

### 2. Define Asset Categories and Depreciation Methods

  Assets → Settings → Categories

Create categories aligned with your accounting policies:

| Category | Depreciation Method | Useful Life |
|----------|-------------------|------------|
| Plant & Machinery | Straight Line | 10–20 years |
| Vehicles | Reducing Balance | 5 years |
| IT Equipment | Straight Line | 3–5 years |
| Buildings | Straight Line | 50 years |
| Office Furniture | Straight Line | 10 years |
| Intangible Assets | Straight Line | 3–10 years |

Depreciation methods: STRAIGHT_LINE / REDUCING_BALANCE / UNITS_OF_PRODUCTION / NONE

### 3. Import the Fixed Asset Register

  Assets → Import or New Asset

For each asset:
- **Asset ID / Tag number** — Unique identifier (e.g., FA-001)
- **Description** — Clear name (e.g., "CNC Milling Machine — Haas VF-2")
- **Category** — Linked to depreciation policy
- **Acquisition date**
- **Purchase cost** (original cost)
- **Residual value** — Expected value at end of useful life
- **Useful life** (years)
- **Current location** — Physical location
- **Assigned to** — Department or custodian
- **Manufacturer, Model, Serial number**
- **Condition** — NEW / GOOD / FAIR / POOR / DISPOSED

### 4. Calculate Opening Depreciation

  Assets → Depreciation → Calculate Opening Balances

For assets already in use, enter:
- Accumulated depreciation to date
- Net book value (NBV) = Cost − Accumulated depreciation

The system will continue calculating from this opening balance.

### 5. Set Up Depreciation Runs

  Assets → Settings → Depreciation Schedule

Configure automatic monthly depreciation posting:
- Run date (e.g., last day of each month)
- Journal destination (Finance module general ledger account)
- Approval required before posting: Yes / No

### 6. Track Asset Movements

  Assets → Movements → New Movement

When an asset is relocated:
- From location
- To location
- Date of move
- Reason for move
- Authorised by

Movements create an audit trail of where each asset has been.

### 7. Manage Asset Disposal

  Assets → Disposal → New Disposal

When an asset is disposed of:
- Disposal date
- Disposal method: SOLD / SCRAPPED / DONATED / TRANSFERRED
- Disposal proceeds (if sold)
- Gain or loss on disposal (auto-calculated)
- Finance journal auto-posted

### 8. Assign User Roles

  Settings → Users → [User] → Module Permissions → Assets

Recommended assignments:
- Finance Manager / Asset Controller: level 5 (APPROVE)
- Fixed Asset Accountant: level 4 (MANAGE)
- Department Manager (view/request movements): level 2 (COMMENT)
- Auditor: level 1 (VIEW)

---

## First Actions After Enabling

1. Define asset categories and depreciation methods
2. Import your current fixed asset register
3. Enter accumulated depreciation for existing assets
4. Configure the monthly depreciation run
5. Generate your first asset valuation report

---

## Related Modules

- **Finance** — Depreciation journals posted to general ledger
- **CMMS** — Maintenance records linked to asset register
- **Insurance** — Asset values for insurance schedule
- **Inventory** — Spare parts for asset maintenance
`,
  },

  {
    id: 'KB-MG-024',
    title: 'Complaint Management Setup Guide',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['complaints', 'customer-complaints', 'resolution', 'investigation', 'quality'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Complaint Management Setup Guide

## Purpose

The Complaint Management module provides a structured process for receiving, investigating, resolving, and analysing customer complaints. It aligns with ISO 10002:2018 (Customer satisfaction — Guidelines for complaints handling) and feeds quality KPIs.

---

## Prerequisites

- Current complaint handling procedure / policy
- List of complaint categories relevant to your products/services
- Target response and resolution times per complaint category
- Names of complaint handlers and the complaints manager

---

## Step-by-Step Configuration

### 1. Enable the Module

  Settings → Modules → Complaint Management → Enable

Module activates at port 3036 (web) and 4032 (API).

### 2. Define Complaint Categories

  Complaints → Settings → Categories

Create categories relevant to your business:
- Product quality defect
- Delivery/logistics failure (late, wrong item, damaged)
- Service quality (poor customer service, slow response)
- Billing/invoice error
- Safety concern
- Environmental complaint
- Staff conduct
- Website/digital service issue

### 3. Set Resolution Targets

  Complaints → Settings → SLA Targets

Define response and resolution time targets by priority:

| Priority | Acknowledge Within | Resolve Within |
|----------|------------------|----------------|
| Critical | 1 hour | 24 hours |
| High | 4 hours | 3 business days |
| Medium | 1 business day | 5 business days |
| Low | 2 business days | 10 business days |

### 4. Configure Complaint Sources

  Complaints → Settings → Sources

Define the channels through which complaints arrive:
- Customer Portal (self-service — most preferred)
- Email
- Phone call (logged manually)
- Letter
- Social media
- In-person
- Regulatory body / third party

### 5. Log Your First Complaint

  Complaints → New Complaint

Fields required:
- **Customer** (link to CRM account)
- **Contact person** at the customer
- **Date received**
- **Source** — where the complaint came from
- **Category**
- **Priority** (auto-suggested based on category, overridable)
- **Description** — Full detail of the complaint
- **Products/services** involved
- **Reference numbers** (order number, invoice number, etc.)

### 6. Manage Investigation and Resolution

  Complaints → [Complaint] → Investigation Tab

Track the investigation:
- Assign investigating person
- Root cause identified (5-Why, Fishbone)
- Interim action taken (contain the problem)
- Resolution plan (permanent fix)
- Compensation offered (if applicable)
- Customer communication log

Resolution workflow:
1. OPEN → INVESTIGATING → RESOLVED → CLOSED
2. Customer notified at each stage (automated via Workflows module)
3. Customer confirms satisfaction (closure survey)

### 7. Analyse Complaint Trends

  Complaints → Analytics

Review complaint data:
- Volume by category, product, time period
- Resolution time performance vs SLA
- Repeat complaint analysis (same root cause recurring)
- Customer satisfaction scores post-resolution
- Cost of poor quality (COPQ) — time spent on complaints

### 8. Assign User Roles

  Settings → Users → [User] → Module Permissions → Complaints

Recommended assignments:
- Complaints Manager / Quality Manager: level 5 (APPROVE)
- Complaint Handler: level 4 (MANAGE)
- Sales / Account Manager: level 3 (EDIT) — log and view for their accounts
- Customer (via portal): level 2 (COMMENT) — submit and track own complaints

---

## First Actions After Enabling

1. Define complaint categories and SLA targets
2. Configure complaint sources
3. Log any current open complaints
4. Set up automated customer acknowledgement (Workflows module)
5. Create a dashboard widget for the Quality Manager's homepage

---

## Related Modules

- **CRM** — Customer linked to complaint record
- **Quality Management** — Complaints linked to quality KPIs
- **Customer Portal** — Customer self-service complaint submission
- **Workflows** — Automated escalation and notification
- **CAPA** — Corrective actions from complaint root cause analysis
`,
  },

  {
    id: 'KB-MG-025',
    title: 'Contract Management Setup Guide',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['contracts', 'agreements', 'renewals', 'obligations', 'legal', 'vendors'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Contract Management Setup Guide

## Purpose

The Contract Management module maintains a centralised repository of all contracts — customer, supplier, employment, lease, licensing, and partnership agreements. It tracks key dates, obligations, renewal windows, and links contracts to the relevant CRM accounts or suppliers.

---

## Prerequisites

- Existing contracts (PDFs or digital copies)
- Key dates from each contract (start, end, renewal notice period)
- List of contract types used in your organisation
- Names of contract owners per category
- Renewal notice periods for each contract type

---

## Step-by-Step Configuration

### 1. Enable the Module

  Settings → Modules → Contract Management → Enable

Module activates at port 3037 (web) and 4033 (API).

### 2. Define Contract Types

  Contracts → Settings → Contract Types

Create categories for your contracts:
- Customer Service Agreement (SLA)
- Supplier / Vendor Agreement
- Non-Disclosure Agreement (NDA)
- Employment Contract
- Lease / Tenancy Agreement
- Software Licence Agreement
- Partnership / Reseller Agreement
- Framework Agreement
- Statement of Work (SOW)

### 3. Set Up Renewal Alert Thresholds

  Contracts → Settings → Renewal Alerts

Configure how far in advance to alert the contract owner:
- Critical contracts (e.g., key supplier, major customer): 90 days
- Standard contracts: 60 days
- Minor contracts: 30 days

Alerts are sent to the contract owner and copied to the legal/procurement team.

### 4. Upload Contracts

  Contracts → New Contract

For each contract:
- **Contract title** and reference number
- **Contract type**
- **Counterparty** — Link to CRM account (customers) or Supplier (vendors)
- **Contract owner** — Internal responsible person
- **Start date** and **End date** (or perpetual)
- **Auto-renewal** — Yes/No; if Yes, notice period to cancel
- **Contract value** (total or annual)
- **Currency**
- **Payment terms**
- **Key obligations** — Free text summary of main commitments
- **Upload document** — The signed contract PDF

### 5. Track Contract Obligations

  Contracts → [Contract] → Obligations → New Obligation

For each key obligation in the contract:
- Obligation description (e.g., "Provide quarterly performance report to customer")
- Frequency (one-off, monthly, quarterly, annual)
- Due date / next due date
- Responsible person
- Evidence required (proof of fulfilment)

The system creates recurring tasks for obligation management.

### 6. Manage the Renewal Pipeline

  Contracts → Renewals

The renewals pipeline shows all contracts approaching renewal in the next 90/60/30 days:
- Decision required: RENEW / NEGOTIATE / TERMINATE
- Update contract status once decision made
- If renewing: upload new signed contract, update dates

### 7. Assign User Roles

  Settings → Users → [User] → Module Permissions → Contracts

Recommended assignments:
- Legal Manager / Procurement Manager: level 5 (APPROVE)
- Contract Manager: level 4 (MANAGE)
- Account Manager (for customer contracts): level 3 (EDIT)
- Finance (value/payment view): level 1 (VIEW)

---

## First Actions After Enabling

1. Define your contract types
2. Upload your top 10 contracts by value
3. Set renewal alert thresholds
4. Add key obligations for your most important contracts
5. Review the renewal pipeline for any contracts expiring in the next 90 days

---

## Related Modules

- **CRM** — Customer contracts linked to CRM accounts
- **Supplier Management** — Supplier contracts and performance
- **Finance** — Contract values, payment terms, revenue recognition
- **Document Control** — Signed contracts stored as controlled records
- **Workflows** — Automated renewal reminders and approval chains
`,
  },
];
