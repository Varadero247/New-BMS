import type { KBArticle } from '../types';

export const industryGuideArticles: KBArticle[] = [
  {
    id: 'KB-IND-001',
    title: 'IMS Deployment Guide: Discrete Manufacturing',
    content: `## Industry Overview
Discrete manufacturing organisations produce identifiable, countable products — from automotive components to industrial machinery. IMS deployments here must support rigorous quality management, equipment reliability, workforce safety, and a multi-tier supplier base. The challenge is connecting shop-floor operational data to management-level compliance evidence without creating duplicate record-keeping burdens.

## Recommended Module Configuration

### Core Modules (enable on day 1)
- **Quality Management**: Configure product families and process steps as your primary quality hierarchy. Set up inspection plans by product family, link customer specifications to quality records, and define acceptance criteria per process step. This forms the backbone of ISO 9001 compliance.
- **Health & Safety**: Enable ISO 45001 controls from day one. Define hazard types relevant to manufacturing (machinery, noise, manual handling, chemical exposure). Configure the risk matrix with a 5x5 likelihood/consequence grid appropriate for production environments.
- **Document Control**: Load method statements, work instructions, control plans, and engineering change notices into Document Control before go-live. Use the approval workflow to enforce controlled distribution of production documents.
- **Training Management**: Register all operators and maintenance staff. Tag mandatory training by role (machine operator, forklift, first aider). Set up competency records linked to specific machines or processes.

### Secondary Modules (enable within 90 days)
- **CMMS (Maintenance Management)**: Build the equipment asset register first — every production-critical machine, conveyor, and test rig. Then configure preventive maintenance schedules. Without asset register completeness, work orders will be orphaned and backlog reporting will be unreliable.
- **Supplier Management**: Register all direct material suppliers with their approval status. Link supplier quality ratings to incoming inspection results. Set up the approved supplier list (ASL) workflow so new suppliers cannot be used without quality approval.
- **Incident Management**: Configure severity levels to include near-miss, first aid, lost-time injury, and dangerous occurrence. Enable automatic escalation for RIDDOR-reportable events. Link incidents to risk assessments to close the H&S loop.
- **Audit Management**: Set up the internal audit schedule for ISO 9001 and ISO 45001. Define audit checklists by process area. Configure finding management so non-conformances link directly to the CAPA workflow.

## Key Standards and Regulations
- **ISO 9001:2015** — Quality Management System. Addressed by: Quality, Document Control, Audit, Supplier Management, Incident Management (non-conformances).
- **ISO 45001:2018** — Occupational H&S. Addressed by: Health & Safety, Incident Management, Training, Audit.
- **IATF 16949:2016** — Automotive quality supplement to ISO 9001 (if applicable). Addressed by: Quality (APQP, PPAP, control plans), Supplier Management (supplier development), CMMS (MSA, gauge calibration).
- **PUWER / LOLER** (UK) — Plant and equipment safety regulations. Addressed by: CMMS (inspection schedules), H&S (risk assessments).

## Industry-Specific Configuration Tips
1. **Build the equipment asset register before configuring CMMS maintenance plans.** Import equipment from your existing plant register spreadsheet using the bulk import tool. Every machine needs a unique asset ID — use your existing tag numbering if one exists.
2. **Use product families as your Quality module top-level hierarchy**, not individual part numbers (which can number in the thousands). Quality plans are attached at family level; deviations and inspection results link to specific part numbers.
3. **Integrate Supplier Management with Quality complaints from day one.** When a customer complaint traces back to a material defect, the system should automatically flag the relevant supplier record and populate the supplier corrective action request (SCAR) workflow.
4. **Configure shift-based access for operators.** Most shop-floor users only need to log incidents, complete checklists, and view their training status. Create a 'Operator' role with minimal read/write access to avoid UI complexity.
5. **Set up engineering change control in Document Control.** Manufacturing is particularly vulnerable to uncontrolled changes. The Document Control change request workflow provides an audit trail from change initiation to production implementation.

## Typical First 90 Days
**Days 1-30 — Foundation**: Import the equipment asset register and employee/role data. Load existing quality documents into Document Control. Configure the risk matrix and initial H&S risk assessments. Train department heads and quality manager as super-users.

**Days 31-60 — Process alignment**: Build quality inspection plans for the top 10 product families. Configure CMMS preventive maintenance for critical equipment. Import the approved supplier list and assign quality ratings. Run first internal audit using the IMS audit module.

**Days 61-90 — Full operation**: Enable Incident Management and complete H&S risk assessment library. Configure supplier scorecard and initiate first supplier review cycle. Issue first management review report from IMS data. Retire any parallel spreadsheet systems.

## Common Pitfalls for This Industry
- **Skipping the equipment asset register during CMMS setup.** Without a complete, accurate asset list, maintenance work orders cannot be assigned to specific equipment, preventive maintenance schedules are incomplete, and backlog reporting is meaningless. Invest time upfront to import all assets before configuring maintenance plans.
- **Not integrating Supplier Management with Quality Complaints.** Complaint root cause analysis frequently identifies incoming material as the source. If the two modules are not linked, the SCAR process happens in spreadsheets outside the system, breaking the closed-loop corrective action chain.
- **Creating too many document types in Document Control.** Start with 5-7 document types (Work Instruction, Control Plan, Method Statement, Procedure, Form, Engineering Change Notice, Specification). Over-categorising creates confusion and slows adoption.
- **Treating Training Management as HR administration only.** In manufacturing, training competency is a quality and safety control. Link machine authorisation to training completion so the system can flag when an operator's certification has lapsed.`,
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['industry', 'manufacturing', 'iso-9001', 'deployment'],
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
    id: 'KB-IND-002',
    title: 'IMS Deployment Guide: Food & Beverage Production',
    content: `## Industry Overview
Food and beverage producers operate in one of the most heavily regulated sectors, where a management system failure can cause consumer harm, product recalls, and significant reputational damage. IMS deployments must centre the HACCP plan as a live operational control system — not a paper exercise — and integrate food safety tightly with quality, supplier management, and training.

## Recommended Module Configuration

### Core Modules (enable on day 1)
- **Food Safety Management**: Configure the HACCP plan structure first. Define process steps, hazard categories (biological, chemical, physical, allergenic), CCPs, and critical limits per CCP. Enter monitoring frequency, monitoring method, and responsible role for each CCP. The system will flag breaches of critical limits as incidents automatically.
- **Quality Management**: Set up product categories and finished goods specifications. Configure customer complaint types relevant to food (foreign body, taste/odour, mislabelling, packaging defect). Link customer complaint root causes to the HACCP hazard register.
- **Health & Safety**: Configure mandatory food handler safety controls: manual handling, chemical handling (cleaning agents), machinery guarding. Enable allergen-specific risk assessments for production areas handling allergenic ingredients.
- **Training Management**: Create mandatory training categories: food handler hygiene (annual retraining), allergen awareness, HACCP awareness, CCP monitoring competency, and cleaning and disinfection. Link training completion to production floor access controls.

### Secondary Modules (enable within 90 days)
- **Supplier Management**: Configure allergen declaration requirements as a mandatory supplier data field. Build the approved supplier list with product categories and audit frequency by supplier tier. Set up the supplier specification management workflow so raw material specifications are version-controlled and linked to the HACCP ingredient hazard assessments.
- **Document Control**: Control HACCP plans, PRPs (prerequisite programmes), cleaning schedules, pest control logs, and product specifications. Use the workflow to enforce annual HACCP review and re-approval.
- **Incident Management**: Configure incident categories for food safety events: CCP critical limit breach, allergen cross-contact, foreign body detection, environmental monitoring out-of-specification. These feed directly into the FSMS corrective action process.
- **Audit Management**: Configure internal audit checklists aligned to FSSC 22000 or BRC Global Standard clauses. Schedule GMP walk-through audits monthly and HACCP system audits quarterly.

## Key Standards and Regulations
- **ISO 22000:2018** — Food Safety Management Systems. Addressed by: Food Safety (HACCP), Document Control (PRPs), Audit, Supplier Management (communication of food safety requirements), Training.
- **FSSC 22000 v6** — Adds additional requirements on food fraud, food defence, and allergen management to ISO 22000. Addressed by: Food Safety (allergen control), Supplier Management (food fraud vulnerability assessment), Document Control.
- **BRC Global Standard for Food Safety Issue 9** — Retail grocery sector certification. Addressed by: Food Safety, Quality, Document Control, Supplier Management, Training, Audit.
- **SQF Code Edition 9** — Retailer and food service certification. Addressed by: Food Safety, Quality, Document Control, Training, Audit.
- **EU Food Information to Consumers Regulation (EU 1169/2011)** — Allergen labelling. Addressed by: Supplier Management (allergen declarations), Food Safety (allergen HACCP step), Quality (label verification inspection).

## Industry-Specific Configuration Tips
1. **Treat the HACCP plan as a live system, not a static document.** Each CCP should have monitoring records being entered in real time (or near real time) by production operators. The Food Safety module supports digital CCP monitoring forms — configure these before go-live.
2. **Allergen management requires cross-module configuration.** Enter allergen information in three places: the raw material specification in Supplier Management, the HACCP allergen hazard step, and the production schedule risk assessment in Food Safety. These should be linked so an allergen change by a supplier triggers a review of downstream controls.
3. **Pest control and environmental monitoring are PRPs, not just maintenance tasks.** Log pest control contractor visits and internal monitoring checks in the Food Safety PRP register, not in CMMS. This keeps them visible in FSMS audit evidence.
4. **Configure cleaning verification as a quality control step.** Schedule pre-production cleaning verification records (ATP swab results, visual check, chemical residue test) as mandatory completion items before production start, linked to the relevant shift and production line.
5. **Set up traceability drill exercises in the Audit module.** Regulatory and certification auditors will require a one-hour forward and backward traceability exercise. Configure a traceability audit checklist and run it quarterly to verify readiness.

## Typical First 90 Days
**Days 1-30 — HACCP and Food Safety foundation**: Import ingredient hazard data. Build HACCP plan with CCPs and critical limits. Configure PRP checklist library. Load cleaning schedules and pest control programme. Train production supervisors and FSMS coordinator.

**Days 31-60 — Supplier and quality integration**: Import approved supplier list with allergen declarations. Link raw material specifications to HACCP hazard assessments. Configure customer complaint categories. Enable incident management for food safety events. Issue first internal HACCP audit.

**Days 61-90 — Full system operation**: Enable CCP digital monitoring for all critical control points. Configure label verification inspection plan. Complete mandatory training rollout to all food handlers. Generate first FSMS management review report. Retire paper-based CCP monitoring records.

## Common Pitfalls for This Industry
- **Treating HACCP as a document exercise rather than a live operational control system.** The most common audit finding in food businesses is that the documented HACCP plan does not match actual practice on the production floor. Ensure CCP monitoring, corrective actions, and verification activities are captured digitally in IMS in real time — not retrospectively filled in.
- **Failing to update HACCP when suppliers change ingredients.** A reformulation by a raw material supplier that introduces a new allergen or changes a preservation system may invalidate existing HACCP hazard analysis. Configure the Supplier Management module to trigger a HACCP review whenever a material specification is updated.
- **Separating pest control from the FSMS.** Pest control records maintained only in CMMS as maintenance jobs are not visible during food safety audits. Keep pest control evidence in the Food Safety PRP register where auditors expect to find it.
- **Not running traceability exercises before certification audits.** Many businesses discover traceability gaps only when auditors request a one-hour mass balance exercise. Schedule quarterly traceability drills from day one.`,
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['industry', 'food-beverage', 'food-safety', 'haccp', 'deployment'],
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
    id: 'KB-IND-003',
    title: 'IMS Deployment Guide: Construction',
    content: `## Industry Overview
Construction is among the highest-risk industries for workplace fatalities and serious injuries. IMS deployments must place Health & Safety and Permit to Work at the centre, supporting project-based operational structures where the workforce, locations, and risk profile change continuously. Subcontractor management and site-specific documentation are equally critical to compliance.

## Recommended Module Configuration

### Core Modules (enable on day 1)
- **Health & Safety**: Configure hazard types relevant to construction: working at height, excavation, heavy plant, manual handling, noise and vibration, CDM coordination, and confined space entry. Build a risk assessment library using the CDM principal contractor perspective. Enable the near-miss reporting workflow so site workers can report via mobile.
- **Permit to Work**: Configure permit types required for your operations on day one — as a minimum: hot work, excavation and ground works, working at height (>2m), confined space entry, and electrical isolation. Each permit type needs its own precondition checklist, responsible issuer role, and duration limits.
- **Incident Management**: Configure severity to cover: near miss, dangerous occurrence, first aid, medical treatment, RIDDOR-reportable (7-day, specified injury, dangerous occurrence, fatality). Enable RIDDOR notification workflow. Link incidents to the H&S risk register.
- **Document Control**: Control method statements, risk assessments (RAMS), construction phase plans, and site induction records. Use the approval workflow to ensure RAMS are reviewed and signed off before work starts. Version control is essential — superseded RAMS must be withdrawn from use.

### Secondary Modules (enable within 90 days)
- **Training Management**: Track CSCS card validity by worker, trade-specific competency (NPORS, CPCS, IPAF, PASMA), first aid certification, and site induction completion. Configure expiry alerts 60 days before any certification lapses. Link CSCS and trade card validity to site access permissions where your access control system supports integration.
- **Supplier Management**: Use for subcontractor pre-qualification and management. Configure the subcontractor approval workflow: PQQ (pre-qualification questionnaire), insurance certificate verification, H&S policy review, and competency check. Rate subcontractors after project completion. Maintain a preferred subcontractor list by trade and geography.
- **Environmental Management**: Configure a site waste management plan for each major project. Track waste by type (inert, non-hazardous, hazardous), volume, and disposal route. Configure soil contamination risk assessments for brownfield sites. Monitor concrete washout, surface water run-off, and dust control compliance.
- **Audit Management**: Configure site inspection checklists (H&S walk-arounds, PTW compliance checks, housekeeping inspections) and internal audit checklists for CDM, ISO 45001, and ISO 14001. Schedule fortnightly site inspections as recurring audit records.

## Key Standards and Regulations
- **CDM Regulations 2015** — Construction (Design and Management). Addressed by: H&S (CDM role configuration, construction phase plan), Document Control (F10 notification, health and safety file), Training (CDM coordinator competency).
- **ISO 45001:2018** — Occupational H&S. Addressed by: H&S, Incident Management, Audit, Training, PTW.
- **ISO 14001:2015** — Environmental Management (site environmental management). Addressed by: Environmental (site waste, pollution prevention), Audit, Document Control (SWMP).
- **PUWER 1998** — Provision and Use of Work Equipment. Addressed by: CMMS (plant inspection schedules), Document Control (plant-specific RAMS).
- **LOLER 1998** — Lifting Operations and Lifting Equipment. Addressed by: CMMS (crane, hoist, and lifting gear inspection registers), Audit (lifting plan review).

## Industry-Specific Configuration Tips
1. **Structure the organisation around projects, not departments.** In the IMS organisation hierarchy, create a project as the primary operational unit. Risk assessments, PTW, incidents, and training records all belong to a project. This makes project closeout and handover documentation straightforward.
2. **Subcontractor induction tracking is a major compliance gap in construction.** Configure the Training module so site induction is a mandatory record for every worker — employee or subcontractor — before they can access any active site. Integrate with your visitor management or site access system where possible.
3. **PTW permit issuer authorisation must be enforced at the system level.** Only nominated, trained, and currently authorised permit issuers should be able to create and approve permits. Configure the PTW module issuer role with a mandatory training linkage — if the issuer's permit issuer training has lapsed, the system should block permit creation.
4. **Site-specific risk assessments should be generated from a master library, not from scratch.** Load a library of 50-100 generic construction risk assessments. Site teams then copy and customise for their specific site conditions. This saves time and ensures consistency while allowing project-specific adaptation.
5. **Configure environmental compliance by project type.** A civils project has different environmental risks (watercourse proximity, soil contamination) to a fit-out project (waste only). Use project type tags to present relevant environmental checklists to site teams automatically.

## Typical First 90 Days
**Days 1-30 — Safety and compliance foundation**: Configure PTW permit types and issuer authorisation. Build H&S risk assessment library (RAMS templates). Load CDM compliance documentation. Train site managers, PTW issuers, and H&S coordinators. Enable mobile incident reporting.

**Days 31-60 — Workforce and subcontractor management**: Import worker and subcontractor records with CSCS and trade card data. Configure induction tracking. Set up subcontractor pre-qualification workflow. Import existing approved supplier list. Run first site inspection using IMS audit checklists.

**Days 61-90 — Environmental and document control**: Configure site waste management plan templates. Set up environmental monitoring checklists (surface water, dust, waste). Load document library with controlled RAMS and method statements. Enable RIDDOR notification workflow. Generate first project-level H&S performance report.

## Common Pitfalls for This Industry
- **Failing to account for the high workforce turnover characteristic of construction.** New workers join sites continuously and leave when a phase ends. If the training and induction tracking system is not maintained daily, the accuracy of competency records degrades rapidly. Assign a site administrator the daily task of keeping worker records current.
- **PTW not enforced in practice despite system configuration.** A configured PTW system only works if site management culture enforces it. Pair system deployment with a toolbox talk campaign and management commitment from directors. Audit PTW compliance in every site inspection.
- **Treating subcontractors as outside the IMS scope.** Subcontractors carry out the majority of high-risk work on most construction projects. Their H&S management, competency, and incident records must be captured in the same system as direct employees. Configure subcontractor records with the same mandatory fields.
- **Not linking RAMS to the Document Control workflow.** Risk assessments created outside Document Control and emailed around sites become uncontrolled. Enforce a rule: all RAMS issued to site must be controlled through Document Control with a unique document number and current revision status.`,
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['industry', 'construction', 'health-safety', 'permit-to-work', 'deployment'],
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
    id: 'KB-IND-004',
    title: 'IMS Deployment Guide: Healthcare (Hospitals & Clinics)',
    content: `## Industry Overview
Healthcare organisations face unique IMS requirements: patient safety is the primary concern, clinical governance frameworks are mandated by regulators, and the consequences of management system failures can be severe. IMS must integrate with existing clinical quality processes and provide CQC-ready evidence, while also being usable by clinical staff with limited administrative time.

## Recommended Module Configuration

### Core Modules (enable on day 1)
- **Incident Management**: Configure as the primary adverse event and patient safety incident reporting system (Datix replacement for organisations not already using it, or as a management layer above Datix). Severity must align to the NHS Severity Matrix: No Harm, Low, Moderate, Severe, Catastrophic. Enable Serious Incident (SI) investigation workflow for Catastrophic and Severe events. Configure RIDDOR linkage for staff injuries.
- **Risk Management**: Configure the clinical risk register with categories aligned to CQC's key lines of enquiry (Safe, Effective, Caring, Responsive, Well-led). Clinical and operational risks should both be captured. Set up a board-level risk register view for the top 10-15 risks. Link risks to incidents (a spike in a category of incidents should trigger a risk review).
- **Document Control**: Control clinical protocols, standard operating procedures, patient information leaflets, and job descriptions. Use version control with mandatory review cycles (clinical documents typically 3 years). Configure the approvals workflow to enforce sign-off by the appropriate clinical lead or committee.
- **Training Management**: Configure mandatory training categories from NHS mandatory training framework: fire safety, infection prevention and control, manual handling, safeguarding adults, safeguarding children, information governance, basic life support, resuscitation (by band), conflict resolution, lone working. Set automated alerts 30 days before mandatory training expires for each staff member.

### Secondary Modules (enable within 90 days)
- **Audit Management**: Configure CQC inspection readiness audit checklists aligned to Key Lines of Enquiry (KLOEs). Schedule a quarterly mock CQC inspection. Configure clinical audit cycles (clinical audit, re-audit after improvement, reporting to clinical governance committee). Link audit findings to the risk register and CAPA workflow.
- **Complaint Management**: Configure to handle PALS (Patient Advice and Liaison Service) queries and formal NHS complaints. Set up response timelines per NHS complaints handling requirements: acknowledgement within 3 working days, response within 25 working days (or agreed extended period). Configure escalation to the Parliamentary and Health Service Ombudsman (PHSO) stage.
- **Health & Safety**: Configure for healthcare-specific hazards: needlestick and sharps injury (RIDDOR), manual handling (patient moving and handling), latex allergy, lone working (community and outreach staff), violence and aggression from patients. Link to the Incident Management module for near-miss and injury reporting.
- **CAPA (Corrective and Preventive Action)**: Link to Incident Management (SI investigation actions), Audit (finding actions), and Complaints (complaint action plans). Configure escalation and oversight by the clinical governance committee.

## Key Standards and Regulations
- **CQC Fundamental Standards** — Health and Social Care Act 2008 (Regulated Activities) Regulations 2014. Addressed by: Incident Management (duty of candour), Risk Management, Document Control, Training (mandatory training compliance), Audit (CQC readiness), Complaint Management.
- **NHS Serious Incident Framework (2015)** — Addressed by: Incident Management (SI investigation workflow), Risk Management (risk review after SI).
- **NHS Complaints Handling** (Local Authority Social Services and NHS Complaints Regulations 2009). Addressed by: Complaint Management (timelines, escalation to PHSO).
- **ISO 9001:2015** — Quality Management (used by some NHS organisations and independent healthcare providers). Addressed by: Quality, Document Control, Audit.
- **ICO/GDPR** — Patient data handling. Addressed by: Document Control (data protection policy), Training (information governance mandatory training), Incident Management (data breach reporting).

## Industry-Specific Configuration Tips
1. **Align incident severity levels to the NHS Severity Matrix from the outset.** Using custom severity labels creates confusion when reporting to commissioners and regulators. Use: No Harm, Low, Moderate, Severe, Catastrophic — these map directly to NHS reporting thresholds and SI triggers.
2. **Configure mandatory training by AfC (Agenda for Change) band**, not just job title. NHS mandatory training requirements vary by banding and role. A Healthcare Assistant has different resuscitation and manual handling requirements to a Ward Sister. The Training module allows training requirements to be configured by band and role simultaneously.
3. **Clinical audit is separate from internal management audit.** Configure two distinct audit types: clinical audit (cyclical measurement of clinical practice against evidence-based standards) and management system audit (compliance with policies and processes). They have different workflows, reporting lines, and governance structures.
4. **Complaint response drafting should be tracked in the system.** NHS complaint responses are often delayed due to coordination across multiple teams. Use the Complaint Management workflow to assign response sections to different clinical leads, track drafting progress, and ensure the response meets timelines before final sign-off.
5. **Configure the risk register for both clinical and operational risks.** Avoid a risk register that only captures operational risks (financial, HS&E). Clinical risks — infections, diagnostic error, medication safety — must be visible in the same register and reviewed at clinical governance meetings.

## Typical First 90 Days
**Days 1-30 — Incident, risk, and compliance foundation**: Configure incident severity levels, categories, and SI investigation workflow. Build the initial risk register from existing board assurance framework. Load existing mandatory training requirements by staff band. Train clinical governance leads, risk managers, and H&S team.

**Days 31-60 — Document control and training rollout**: Import controlled clinical document library. Configure mandatory training categories and load existing training records. Set up complaint management workflow with NHS timelines. Configure CQC audit checklist library.

**Days 61-90 — Full governance integration**: Run first mock CQC inspection using IMS audit module. Generate first board-level risk and incident report. Enable CAPA linkage across incidents, audits, and complaints. Brief the clinical governance committee on IMS reporting capabilities.

## Common Pitfalls for This Industry
- **Configuring incident categories using generic (non-clinical) terminology.** Healthcare incidents have specific classification frameworks (patient safety, clinical error, medication incident, infection, fall). Using generic categories like 'Quality' or 'Operational' makes trending, reporting, and learning analysis meaningless. Configure clinical incident types from day one.
- **Not establishing duty of candour workflow in Incident Management.** CQC requires evidence that duty of candour was fulfilled for all Moderate, Severe, and Catastrophic incidents. Configure the incident workflow to include a duty of candour notification step and record when notification was given to the patient or family.
- **Treating mandatory training as a self-reporting exercise.** Manual or self-reported training records are notoriously inaccurate. Connect the Training module to your Learning Management System (LMS) so completion records are populated automatically, removing the need for staff self-declaration.
- **Using the risk register only for low-level operational risks.** The board and clinical governance committee need to see high-level strategic and clinical risks. If the risk register only captures departmental operational risks, it will not serve its governance purpose and will be disconnected from leadership decision-making.`,
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['industry', 'healthcare', 'clinical', 'patient-safety', 'deployment'],
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
    id: 'KB-IND-005',
    title: 'IMS Deployment Guide: Pharmaceutical & Life Sciences',
    content: `## Industry Overview
Pharmaceutical and life sciences organisations operate under some of the most stringent regulatory frameworks in the world. GMP (Good Manufacturing Practice) compliance, audit-readiness, and data integrity are non-negotiable requirements. IMS deployments must support 21 CFR Part 11 electronic records requirements, change control, deviation management, and a rigorously controlled document environment.

## Recommended Module Configuration

### Core Modules (enable on day 1)
- **Document Control**: GMP document management is the foundation of pharmaceutical compliance. Configure document types: SOPs, batch manufacturing records (BMR), specifications, validation protocols and reports, analytical methods, and regulatory submission documents. Enable the 21 CFR Part 11 electronic signature mode. Every document must have a unique identifier, version number, effective date, and approver. Configure a mandatory periodic review cycle (typically 2 years for SOPs).
- **Quality Management**: Configure for GMP quality events: deviations (planned and unplanned), out-of-specification (OOS) results, out-of-trend (OOT) results, and non-conformances. Enable batch linkage so quality events can be traced to specific batch numbers. Configure the deviation classification workflow: minor, major, critical — each with different investigation depth requirements and approval chains.
- **CAPA Management**: Link directly to deviations, audits, complaints, and OOS investigations. Configure CAPA effectiveness verification as a mandatory closure step — a CAPA cannot be closed until the corrective action has been verified as effective at preventing recurrence. Set escalation for overdue CAPAs.
- **Training Management**: GMP training compliance is a regulatory requirement. Configure GMP training categories: initial GMP induction, role-specific GMP procedures (each SOP requires documented read-and-understood training), equipment qualification training, and annual GMP refreshers. Link training to Document Control so when an SOP is revised, the system automatically flags that all users of that SOP require retraining.

### Secondary Modules (enable within 90 days)
- **Audit Management**: Configure GMP internal audit programme covering all manufacturing, quality control, and warehouse areas annually at minimum. Set up audit checklists aligned to EU GMP chapters, FDA 21 CFR Parts 210/211, and ICH Q10. Track CAPA from audit findings. Configure regulatory inspection readiness review as a special audit type.
- **Supplier Management**: Build the Qualified Supplier List (QSL) / Approved Vendor List (AVL). For GMP materials (starting materials, packaging, excipients), supplier qualification is a regulatory requirement. Configure the supplier audit workflow, technical agreement register, and material specification linkage. Enable supplier change notification tracking — supplier changes to materials may require requalification.
- **Incident Management**: Configure for GMP-relevant events: product quality complaints, adverse drug reactions (ADRs) for marketed products, production stoppages, and contamination events. For marketed products, configure the pharmacovigilance linkage and regulatory reporting timelines (15-day and 90-day reports to competent authorities).
- **Change Control**: Configure the formal change control workflow: change request, impact assessment, regulatory assessment, approval, implementation, and qualification/validation (where required). Changes are classified by regulatory impact: local, site, regulatory (requires prior approval variation). All changes must be linked to impacted documents, equipment, or processes.

## Key Standards and Regulations
- **EU GMP (EudraLex Volume 4)** — European GMP guidelines. Addressed by: Document Control, Quality, CAPA, Training, Audit, Supplier Management.
- **21 CFR Parts 210/211** — US FDA Current Good Manufacturing Practice. Addressed by: Document Control (Part 11 electronic records), Quality, Supplier Management, Training.
- **21 CFR Part 11** — Electronic Records; Electronic Signatures. Addressed by: Document Control (audit trail, electronic signatures), Quality (electronic batch records).
- **ICH Q10** — Pharmaceutical Quality System. Addressed by: all modules integrated into an ICH Q10-aligned PQS.
- **ISO 9001:2015** — Often used as a foundation. Addressed by: Quality, Audit, Document Control.
- **Annex 11 (EU GMP)** — Computerised Systems. Addressed by: IMS system validation (CSV), audit trail, access control.

## Industry-Specific Configuration Tips
1. **Enable 21 CFR Part 11 mode before any GMP documents are created.** This configures mandatory audit trails on all record creation, modification, and deletion, and enforces electronic signatures with identity verification. Retroactively adding audit trail compliance to existing records is extremely difficult.
2. **Configure change control as a gate before any process, document, or equipment change is implemented.** In pharmaceuticals, implementing a change without prior approval — even a minor one — is a GMP deviation. The Change Control module should be the first step, not an afterthought. Train all department heads that 'no change without a change request' is the operating rule.
3. **Link SOP revisions to training automatically.** When Document Control issues a new revision of an SOP, all staff whose training records include that SOP should automatically receive a training notification requiring read-and-understood sign-off before the effective date. Configure this linkage in the Training module settings.
4. **Configure batch genealogy linkage in Quality.** Every quality event (deviation, OOS, CAPA) should reference the affected batch numbers. This enables impact assessment — 'which batches are potentially affected by this deviation?' — and supports recall readiness.
5. **Supplier change notifications must flow through change control.** A supplier changing their manufacturing site, a critical raw material supplier changing their process — these are regulatory events. Configure the Supplier Management module to trigger a change control workflow whenever a supplier notifies of a material change.

## Typical First 90 Days
**Days 1-30 — GMP documentation foundation**: Enable 21 CFR Part 11 mode. Import existing SOP library into Document Control. Configure document types, numbering, and approval workflows. Set up initial GMP training categories and link to SOPs. Train Document Control administrator and QA Manager.

**Days 31-60 — Quality events and CAPA**: Configure deviation classification and investigation workflows. Set up OOS investigation workflow. Enable CAPA with effectiveness verification. Import Qualified Supplier List. Set up supplier audit schedule. Configure internal audit programme.

**Days 61-90 — Change control and full integration**: Deploy change control workflow. Link change control to Document Control, Supplier Management, and Quality. Configure regulatory inspection readiness audit type. Run first management review report from IMS data. Retire paper-based or standalone quality event systems.

## Common Pitfalls for This Industry
- **Deploying IMS without a CSV (Computer System Validation) plan.** In regulated pharmaceutical environments, computer systems that manage GMP records must be validated. IMS deployment must be accompanied by a validation lifecycle: URS, IQ/OQ/PQ, and periodic review. Failure to validate is a GMP deficiency that will be cited in regulatory inspections.
- **Allowing change control bypass for 'urgent' or 'minor' changes.** Every exception to change control creates a precedent and a data integrity risk. Configure the system so there is no bypass route — urgent changes use an expedited review pathway with the same documentation requirements, just a faster approval cycle.
- **Not enforcing CAPA effectiveness verification.** CAPAs that are closed without a demonstrated effectiveness check are a recurring finding in FDA and MHRA inspections. The system must enforce a mandatory effectiveness check record before CAPA closure is permitted.
- **Treating the supplier qualification process as a one-time activity.** GMP requires ongoing supplier monitoring: periodic re-audits, annual product quality reviews, and change notification management. Configure Supplier Management with scheduled re-qualification dates and automated alerts when re-audit dates approach.`,
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['industry', 'pharmaceutical', 'gmp', 'fda', 'deployment'],
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
    id: 'KB-IND-006',
    title: 'IMS Deployment Guide: Energy & Utilities',
    content: `## Industry Overview
Energy and utilities organisations manage critical national infrastructure, complex asset bases, and significant environmental and safety obligations. IMS deployments must centre on energy performance management (ISO 50001), environmental compliance, safety-critical asset maintenance, and risk management for high-consequence operational scenarios including high-voltage electrical systems, pressure vessels, and working at height on structures.

## Recommended Module Configuration

### Core Modules (enable on day 1)
- **Energy Monitoring**: Configure energy monitoring parameters from day one — electrical consumption (kWh by meter/circuit), natural gas (m3), steam (tonnes), compressed air, and any process-specific energy streams. Identify your Significant Energy Users (SEUs) — the processes or equipment that account for the greatest proportion of energy consumption. Establish the baseline year for ISO 50001 EnMS. Enter Energy Performance Indicators (EnPIs) and targets.
- **Environmental Management**: Configure emissions reporting for Scope 1 (direct combustion, process emissions, fugitive refrigerant losses), Scope 2 (purchased electricity), and Scope 3 (supply chain, business travel). Link to energy monitoring data for automatic Scope 2 calculation. Configure legal register with environmental permits (environmental permit, abstraction licence, discharge consent, emissions trading obligations).
- **Health & Safety**: Configure for energy sector hazards: high-voltage electrical systems (arc flash, electrocution), working at height on structures (overhead lines, wind turbine maintenance), confined space entry (cable ducts, inspection chambers), pressure systems (steam, gas), and fatigue risk for shift workers. Implement the energy sector hierarchy of controls aligned to HSE guidance.
- **Permit to Work**: Configure permit types critical for energy operations: electrical isolation (including lock-out/tag-out), pressure isolation (de-pressurisation and isolation), hot work, confined space entry, working at height (towers, gantries, rooftops). Electrical isolation permits must include a mandatory isolation verification step with named isolation authority.

### Secondary Modules (enable within 90 days)
- **CMMS (Maintenance Management)**: Build the critical asset register for all operational infrastructure: transformers, switchgear, generators, turbines, pumps, valves, pressure vessels, and control systems. Configure preventive maintenance schedules based on manufacturer recommendations and statutory inspection requirements (LOLER, PSSR). Prioritise assets by criticality to operational continuity.
- **Risk Management**: Configure asset risk assessments covering failure mode analysis for critical infrastructure. Include climate-related physical risk assessments for extreme weather events (flooding, drought affecting cooling water, extreme heat/cold). Link to the board-level risk register for regulatory and reputational risk.
- **ESG Reporting**: Configure GRI-aligned ESG metrics: energy intensity, renewable energy percentage, water withdrawal, waste diversion rate, carbon emissions (Scope 1, 2, 3), safety performance (LTIR, TRIR). Enable automatic data pull from Energy Monitoring and Environmental modules. Configure the annual sustainability report template.
- **Audit Management**: Configure compliance audit checklists for environmental permits, statutory inspection records, ISO 50001, and ISO 45001. Schedule quarterly compliance audits and an annual third-party readiness review. Ensure PTW compliance audit is included in every H&S inspection.

## Key Standards and Regulations
- **ISO 50001:2018** — Energy Management Systems. Addressed by: Energy Monitoring (EnPIs, SEUs, energy review, action plans), Document Control (EnMS documentation), Audit (EnMS internal audit).
- **ISO 14001:2015** — Environmental Management Systems. Addressed by: Environmental (aspects and impacts, legal register, objectives), Audit, Incident Management (environmental incidents).
- **ISO 45001:2018** — Occupational H&S. Addressed by: H&S, Incident Management, PTW, Training, Audit.
- **GRI Standards** — Global Reporting Initiative sustainability reporting. Addressed by: ESG (GRI disclosure data), Environmental, Energy Monitoring.
- **Electricity at Work Regulations 1989** — Electrical safety. Addressed by: PTW (electrical isolation), Training (authorised person competency), CMMS (HV switchgear inspection schedules).
- **Pressure Systems Safety Regulations 2000 (PSSR)** — Addressed by: CMMS (statutory inspection schedules), PTW (pressure isolation), Document Control (Written Scheme of Examination).

## Industry-Specific Configuration Tips
1. **Establish the ISO 50001 energy review in the first month.** The energy review — identifying SEUs, energy baseline, EnPIs, and improvement opportunities — is the analytical foundation of the EnMS. Build it in the Energy Monitoring module before configuring targets and action plans. Many organisations skip the energy review and go straight to target-setting, which undermines the entire ISO 50001 approach.
2. **Configure automatic Scope 2 carbon emission calculation from energy monitoring data.** The Environmental module can pull kWh from smart meters and apply the current grid emissions factor automatically. This removes manual calculation from the carbon reporting process and ensures data is updated as the grid emissions factor changes annually.
3. **Electrical isolation permits require named, trained Authorised Persons.** Configure the PTW module so electrical isolation permits can only be created by individuals who appear on the current Authorised Persons list (maintained in Training Management). This is a legal requirement under EAW Regulations and a critical safety control.
4. **Configure climate risk in the Risk Register.** TCFD (Task Force on Climate-related Financial Disclosures) requirements mean energy and utilities companies must now report on physical and transition climate risks. Configure climate risk categories in the Risk Register and link to the ESG module for TCFD scenario analysis reporting.
5. **Use CMMS to manage statutory inspection due dates proactively.** Pressure vessel thorough examinations, LOLER lifting equipment inspections, and HV equipment maintenance have statutory frequencies. Configure CMMS to alert asset owners 60 days before a statutory inspection is due and to escalate if overdue inspections are not completed.

## Typical First 90 Days
**Days 1-30 — Energy and environmental foundation**: Configure energy monitoring parameters and SEUs. Establish energy baseline year and EnPIs. Enter environmental permit conditions in legal register. Configure emissions reporting structure. Train Energy Manager and Environmental Manager.

**Days 31-60 — Safety and PTW deployment**: Configure H&S risk assessment library for high-voltage, pressure, and working at height hazards. Set up PTW permit types with electrical isolation workflow. Build critical asset register in CMMS with statutory inspection schedules. Configure Authorised Persons list in Training Management.

**Days 61-90 — ESG, risk, and audit integration**: Configure ESG dashboard with GRI metrics. Set up climate risk register. Build ISO 50001 and ISO 45001 internal audit checklists. Run first energy review using IMS data. Generate first EnMS management review report. Commission first ESG quarterly data pull.

## Common Pitfalls for This Industry
- **Identifying too few Significant Energy Users in the initial energy review.** ISO 50001 requires that SEUs account for a substantial portion of energy consumption (typically 80%+). If the initial review identifies only 2-3 SEUs, it likely reflects insufficient granularity of metering rather than a genuinely efficient facility. Review sub-metering data to identify the true SEU profile.
- **Not managing PTW permit validity periods rigorously.** Electrical isolation permits that remain open after work is complete leave equipment in an isolated state unnecessarily. Configure maximum permit durations (typically 12-24 hours for electrical, shorter for hot work) and enforce mandatory permit return and clearance before the permit expires.
- **Treating GHG emissions reporting as an annual exercise.** With increasing regulatory scrutiny (ETS, SECR, TCFD), emissions data quality must be maintained throughout the year. Configure monthly data entry and review cycles rather than annual data collection, which typically results in low-quality estimates.
- **Not linking environmental incident reporting to permit conditions.** A process emission exceedance or an environmental discharge that breaches permit conditions requires regulatory notification. Configure the Incident Management module to flag environmental incidents with a permit condition check — missing a notification deadline can result in permit enforcement action.`,
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['industry', 'energy', 'utilities', 'iso-50001', 'deployment'],
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
    id: 'KB-IND-007',
    title: 'IMS Deployment Guide: Chemical Manufacturing',
    content: `## Industry Overview
Chemical manufacturing presents significant environmental, safety, and regulatory obligations. REACH compliance, COSHH assessments, process safety management, and environmental permit compliance are all critical. The interconnection between chemical inventory, hazardous substance controls, and emergency response planning must be reflected in the IMS configuration. COMAH-classified sites have additional major hazard requirements.

## Recommended Module Configuration

### Core Modules (enable on day 1)
- **Chemical Register**: Build the chemical inventory by hazard class from day one. For each substance: CAS number, REACH SVHC status, GHS hazard classification, SDS (Safety Data Sheet) document link, authorised storage locations, maximum quantities, COSHH assessment reference, and disposal route. Configure SVHC (Substance of Very High Concern) list alignment so the system flags any substance added to the REACH authorisation or restriction list.
- **Health & Safety**: Configure COSHH (Control of Substances Hazardous to Health) risk assessment as the primary H&S record type alongside conventional risk assessments. Hazard categories: toxic, corrosive, flammable, carcinogenic, sensitising, asphyxiant, explosive. Enable the COMAH major hazard risk assessment template if applicable. Configure WEL (Workplace Exposure Limit) monitoring linkage.
- **Environmental Management**: Configure emission monitoring parameters: emissions to air (VOCs, particulates, specific chemical species under permit), discharges to water (COD, BOD, pH, suspended solids, specific chemical parameters), and waste streams (hazardous waste by EWC code). Enter environmental permit emission limits as compliance thresholds. Configure automatic alerts when monitored values approach permit limits.
- **Incident Management**: Configure incident categories: RIDDOR-reportable chemical exposure injury, near-miss process safety events, environmental releases (spillage, emission exceedance, discharge breach), and emergency response activations. Enable COMAH-reportable incident workflow for sites above lower-tier threshold. Configure Environment Agency notification workflow for environmental releases.

### Secondary Modules (enable within 90 days)
- **Permit to Work**: Configure permit types for chemical manufacturing: chemical transfer and handling, confined space entry (reactors, vessels, tanks), hot work (managing ignition risk near flammables), pressure system work, and electrical isolation. Chemical handling permits must include pre-work checks: SDS review confirmation, PPE verification, spill kit availability, and emergency shower location confirmation.
- **Quality Management**: Configure for batch record management, raw material specification verification, in-process quality control testing, and finished product release. Link quality results to the Chemical Register for raw material identity and purity verification. Configure deviation handling for out-of-specification batches.
- **Document Control**: Control COSHH assessments (review every 5 years or when process/substance changes), emergency response plans, major accident prevention policy (MAPP) for COMAH sites, environmental permit condition schedules, and process safety documentation. Enforce approval and periodic review workflows.
- **Training Management**: Configure chemical handling competency by hazard class. Mandatory training: COSHH awareness, specific substance handling (for high-hazard materials), emergency response roles (first responder, spill team, evacuation coordinator), PPE selection and donning, and environmental incident response.

## Key Standards and Regulations
- **REACH Regulation (EC 1907/2006)** — Registration, Evaluation, Authorisation and Restriction of Chemicals. Addressed by: Chemical Register (SVHC tracking, SDS management, substance inventory, authorisation status).
- **COSHH Regulations 2002** — Control of Substances Hazardous to Health. Addressed by: H&S (COSHH assessments), Chemical Register (substance hazard data), Training (COSHH awareness), Document Control (COSHH assessment library).
- **COMAH Regulations 2015** — Control of Major Accident Hazards. Addressed by: H&S (major accident risk assessments, MAPP), Incident Management (COMAH reportable event workflow), Document Control (Safety Report for upper-tier sites), Environmental (on-site emergency plan).
- **ISO 14001:2015** — Environmental Management. Addressed by: Environmental (aspects and impacts, legal register, permit compliance monitoring), Audit, Incident Management (environmental incidents).
- **ISO 45001:2018** — Occupational H&S. Addressed by: H&S (risk assessments), Incident Management, Training, PTW.
- **Hazardous Waste Regulations 2005** — Addressed by: Environmental (waste tracking by EWC code, consignment notes), Document Control (waste transfer notes, carrier consignment note archive).

## Industry-Specific Configuration Tips
1. **The Chemical Register is the single source of truth for substance information across all modules.** When a COSHH assessment is created, it should pull chemical properties directly from the Chemical Register rather than allowing the assessor to re-enter hazard data manually. This prevents inconsistency between SDS data and COSHH assessment content.
2. **SVHC list monitoring must be automated.** The REACH SVHC candidate list is updated twice yearly. Configure the Chemical Register to alert the responsible chemist or EHS manager whenever a substance in inventory appears on a new SVHC list update. Waiting for annual reviews means compliance gaps of up to 6 months.
3. **Configure chemical inventory quantity thresholds for COMAH classification.** If any single substance exceeds a named substance threshold (Schedule 1 of COMAH) or a category threshold (Schedule 2), the site triggers COMAH classification. Configure the Chemical Register with real-time threshold monitoring against COMAH Schedule 1 and Schedule 2 limits, with automatic alert if quantities approach thresholds.
4. **Spillage response procedures must be accessible during an emergency.** Configure the Chemical Register so that for every hazardous substance, the spillage response procedure (from the SDS) is accessible via a QR code on the storage location label. In an emergency, staff should not need to access a computer to find spill response information.
5. **Hazardous waste consignment notes must be archived for 3 years (UK requirement).** Configure Document Control to archive waste transfer notes and carrier consignment notes automatically. Regulators (Environment Agency) can request these during inspections at any time.

## Typical First 90 Days
**Days 1-30 — Chemical inventory and COSHH foundation**: Import full chemical inventory into Chemical Register with CAS numbers, GHS classification, and SDS documents. Configure SVHC list monitoring. Build COSHH assessment library for all substances in use. Configure environmental permit emission limits. Train EHS Manager and Process Safety lead.

**Days 31-60 — Environmental compliance and PTW**: Configure emission monitoring parameters and compliance thresholds. Set up hazardous waste tracking by EWC code. Configure PTW permit types for chemical handling, confined space, and hot work. Enable incident management with RIDDOR and Environment Agency notification workflows.

**Days 61-90 — Quality integration and full system**: Configure quality batch record management linked to Chemical Register. Build emergency response plan in Document Control. Run first full COMAH risk assessment review using IMS data. Configure regulatory inspection readiness audit. Generate first environmental compliance report.

## Common Pitfalls for This Industry
- **Maintaining the chemical inventory as a static spreadsheet outside IMS.** A spreadsheet-based chemical register cannot trigger alerts for SVHC list changes, cannot link to COSHH assessments, and cannot provide live inventory quantity data for COMAH threshold monitoring. Migration of the chemical inventory into IMS must be a day-one priority.
- **Not updating COSHH assessments when substances or processes change.** A COSHH assessment for a process is invalidated if the substance formulation, application method, or exposure frequency changes. Configure the Chemical Register so that a substance specification change automatically flags all linked COSHH assessments for review.
- **Treating environmental incident reporting as separate from health and safety incident reporting.** An accidental release to a watercourse is both an environmental incident (requiring Environment Agency notification) and potentially a safety incident. Configure Incident Management with dual classification capability and ensure both regulatory notification workflows are triggered where applicable.
- **Underestimating the COMAH documentation burden at upper-tier sites.** Upper-tier COMAH sites require a full Safety Report and on-site emergency plan. These are substantial documents requiring site-specific major accident scenario analysis. Begin building these in Document Control from day one, not 3 months before the regulatory inspection.`,
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['industry', 'chemical', 'reach', 'chemical-register', 'deployment'],
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
    id: 'KB-IND-008',
    title: 'IMS Deployment Guide: Financial Services',
    content: `## Industry Overview
Financial services organisations operate under intensive regulatory scrutiny and face complex operational, cyber, and conduct risks. IMS deployments must support regulatory compliance (FCA, PRA, ICO), information security governance, operational risk management, and FCA-compliant complaint handling. The interconnection between risk, audit, information security, and training is especially important in this sector.

## Recommended Module Configuration

### Core Modules (enable on day 1)
- **Information Security (ISO 27001)**: Configure the information asset register covering all systems and data sets handling customer data, financial data, and intellectual property. Classify assets by confidentiality, integrity, and availability requirements. Apply the ISO 27001 Annex A control framework. Configure risk assessment methodology aligned to FCA cyber resilience requirements (PS21/3). Enable vulnerability tracking and penetration test finding management.
- **Risk Management**: Configure the operational risk register using a taxonomy aligned to standard financial services risk categories: credit risk, market risk, operational risk, conduct risk, regulatory risk, cyber/technology risk, third-party risk, and financial crime risk. Enable RCSA (Risk and Control Self-Assessment) workflow by business unit. Configure risk appetite thresholds for board-level escalation.
- **Incident Management**: Configure for operational incidents (system outages, process failures), cyber incidents (malware, phishing, data breach), conduct incidents (mis-selling, market abuse concerns), and fraud incidents. Enable FCA significant incident notification workflow (PS21/3 operational resilience). Configure ICO data breach notification workflow (72-hour GDPR requirement).
- **Document Control**: Control policies and procedures (AML, GDPR, Conduct, Credit, IT Security), board-approved risk appetite statements, regulatory correspondence, and audit committee papers. Configure approval workflows to enforce policy sign-off at the appropriate governance level (board, executive, management). Set a mandatory annual review cycle for all regulatory policies.

### Secondary Modules (enable within 90 days)
- **Audit Management**: Configure internal audit programme covering all regulated activities annually. Set up audit checklists aligned to FCA Handbook requirements (SYSC, COBS, DISP), PRA Rulebook, and GDPR Article 5 principles. Configure regulatory inspection readiness audit. Link audit findings to risk register and CAPA. Provide audit committee reporting dashboard.
- **Complaint Management**: Configure FCA-compliant complaint handling workflows. FCA DISP rules require: acknowledgement within 5 business days, final response within 8 weeks (or interim response with reason for delay), and FOS referral information included in every final response. Configure complaint root cause analysis workflow and MI reporting for quarterly FCA return (CCR).
- **Training Management**: Configure regulatory mandatory training programme: AML/CTF awareness, GDPR and data protection, FCA Conduct Rules (for staff in scope of SMCR), financial crime red flags, cyber security awareness, and treating customers fairly. Configure Fitness and Propriety assessment record for Senior Managers. Enable CPD tracking for regulated individuals.
- **Supplier Management (Third-Party Risk)**: Configure vendor risk assessment workflow for all third-party service providers. FCA and PRA expect documented oversight of material outsourcing arrangements. Build the material outsourcing register. Configure vendor security assessment questionnaire. Set annual review dates for critical vendors. Track SLA performance.

## Key Standards and Regulations
- **FCA Handbook (SYSC, COBS, DISP, SUP)** — Financial Conduct Authority rules. Addressed by: Risk Management (SYSC operational risk), Complaint Management (DISP complaint handling), Audit (SUP regulatory return readiness), Training (COBS conduct rules, SMCR Fitness and Propriety).
- **ISO 27001:2022** — Information Security Management. Addressed by: InfoSec (asset register, risk assessment, controls, ISMS policy), Document Control, Audit, Training (security awareness).
- **UK GDPR / Data Protection Act 2018** — Addressed by: InfoSec (data protection by design), Incident Management (data breach notification), Training (mandatory GDPR training), Document Control (data protection policies, DPIA register).
- **Senior Managers and Certification Regime (SMCR)** — Addressed by: Training (regulatory training records, Fitness and Propriety), Document Control (SMF responsibilities, role profiles), Audit (accountability mapping).
- **SOC 2 Type II** — For FinTech and technology-enabled financial services. Addressed by: InfoSec, Audit (SOC 2 control testing), Document Control (security policies).

## Industry-Specific Configuration Tips
1. **Align the risk taxonomy to FCA and Basel operational risk categories from day one.** Using generic risk categories makes it impossible to produce risk reporting in the format expected by the FCA, PRA, or internal risk committees. Financial services risk taxonomy is well-established — do not create a custom taxonomy when a regulatory-aligned one exists.
2. **Configure complaint handling timelines as hard system deadlines, not reminders.** FCA DISP rules on complaint timelines are regulatory requirements, not best practice. The Complaint Management module should treat the 5-day acknowledgement and 8-week final response deadlines as mandatory workflow steps with automatic escalation if they are not met.
3. **Build the information asset register starting with customer-facing systems.** Financial services organisations hold vast amounts of sensitive personal and financial data. Start the ISO 27001 asset register with the systems that process customer data (CRM, account management, payment systems) before working back to internal systems. These are the assets that attract the greatest regulatory and reputational risk.
4. **SMCR Fitness and Propriety records must be annual.** Each Senior Manager and Certified Person requires an annual Fitness and Propriety assessment. Configure the Training module with a recurring annual assessment task for each SMCR-in-scope employee, and retain evidence of each year's assessment.
5. **Third-party risk management is increasingly a regulatory focus.** FCA and PRA are both increasing scrutiny of outsourcing and third-party arrangements following high-profile operational resilience failures. Configure the Supplier Management module with a material outsourcing classification field and ensure each material third party has a documented risk assessment updated at least annually.

## Typical First 90 Days
**Days 1-30 — Risk and InfoSec foundation**: Build operational risk register with FCA-aligned taxonomy. Configure ISO 27001 information asset register (customer-facing systems first). Configure incident classification including FCA significant incident and ICO data breach workflows. Train Risk Manager, Head of Compliance, and CISO.

**Days 31-60 — Complaint and audit infrastructure**: Configure FCA-compliant complaint handling workflow with mandatory timelines. Build internal audit programme for regulatory compliance. Import existing policy library into Document Control with approval and review workflows. Configure SMCR training records and Fitness and Propriety assessment.

**Days 61-90 — Third-party risk and full integration**: Build material outsourcing register in Supplier Management. Configure vendor risk assessment workflow. Complete AML, GDPR, and conduct rules mandatory training rollout. Generate first risk and compliance dashboard report for board. Commission first ISO 27001 internal audit.

## Common Pitfalls for This Industry
- **Under-configuring complaint root cause analysis.** FCA expects that complaint MI is used to identify systemic issues and drive service improvement. If complaints are managed as individual cases without root cause analysis and trend reporting, the system is not meeting regulatory expectations. Configure root cause categories and monthly MI reporting from day one.
- **Not segregating information security incident management from operational incident management.** A cyber incident has different investigation, response, and notification requirements (ICO data breach notification, FCA significant incident reporting) to an operational process failure. Configure separate incident categories and workflows to ensure the right notifications are triggered.
- **Treating third-party risk management as a procurement activity rather than a risk activity.** Vendor onboarding checks (insurance, financial stability) are different from third-party risk management (data security, operational resilience, regulatory compliance of outsourced activities). Configure the Supplier Management module to capture both onboarding due diligence and ongoing risk assessment separately.
- **Allowing the operational risk register to be a static quarterly exercise.** Operational risk in financial services changes rapidly — new products, regulatory changes, market events. Configure the Risk Management module with event-triggered review prompts so that a significant incident, near miss, or regulatory change automatically triggers a review of related risks.`,
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['industry', 'financial-services', 'infosec', 'gdpr', 'deployment'],
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
    id: 'KB-IND-009',
    title: 'IMS Deployment Guide: Logistics & Supply Chain',
    content: `## Industry Overview
Logistics and supply chain organisations face a distinctive set of risks: road transport safety, warehouse and distribution centre safety, fleet and equipment management, carrier and subcontractor qualification, and increasingly, environmental obligations related to fleet emissions. IMS must support a highly distributed workforce across multiple sites and vehicles, with strong mobile accessibility for drivers and remote warehouse staff.

## Recommended Module Configuration

### Core Modules (enable on day 1)
- **Health & Safety**: Configure driver safety risk assessments (road risk, lone working, fatigue management, journey planning) and warehouse safety risk assessments (fork lift truck (FLT) operations, manual handling, rack inspection, loading bay safety, pedestrian and vehicle segregation). Enable near-miss reporting via mobile app for drivers. Configure fatigue risk assessment for HGV drivers aligned to EU drivers' hours regulations.
- **CMMS (Fleet Maintenance)**: Build the vehicle fleet asset register as the day-one priority. Every vehicle — HGV, LGV, van, and company car — needs an asset record including registration, VIN, make, model, tachograph calibration due date, MOT due date, and operator licence conditions. Configure preventive maintenance schedules: mileage-based services, time-based inspections, and statutory checks (daily walkaround checks as a recurring task).
- **Training Management**: Configure driver CPC (Certificate of Professional Competence) periodic training records. HGV and coach drivers are legally required to complete 35 hours of periodic CPC training every 5 years. Configure expiry date alerts 6 months before periodic CPC qualification expires. Add manual handling, FLT licence (counterbalance, reach, VNA), dangerous goods (ADR certificate), COSHH (for hazardous cargo), and driver licence DVLA check records.
- **Incident Management**: Configure incident types: road traffic accident (RTA), cargo damage in transit, personal injury (driver, warehouse staff), dangerous goods incident (spillage, fire), and customer complaint relating to delivery damage. Enable RIDDOR notification for reportable accidents. Configure cargo damage claims workflow for insurance purposes.

### Secondary Modules (enable within 90 days)
- **Supplier Management (Carrier Qualification)**: Build carrier and haulier qualification records. For each third-party carrier: operator licence number and expiry, public liability and goods-in-transit insurance, CMR liability documentation (for international freight), transport quality certification, and performance scorecard. Configure a carrier approval workflow and annual re-qualification process. Maintain a list of prohibited carriers.
- **Document Control**: Control transport and logistics policies (driver handbook, load security policy, fatigue management policy), dangerous goods documentation templates, operator licence compliance documentation, and route risk assessments for high-risk or abnormal load journeys.
- **Environmental Management**: Configure fleet emissions tracking. For each vehicle, record fuel consumption (litres), mileage, and vehicle category (Euro emission standard). Calculate fleet CO2 and NOx emissions for SECR (Streamlined Energy and Carbon Reporting) compliance. Track fleet electrification programme progress. Configure carbon reduction targets by fleet segment.
- **Audit Management**: Configure depot and warehouse safety inspections as scheduled recurring audits. Include FLT pre-use check compliance, rack inspection records, fire evacuation routes, dangerous goods storage compliance, and manual handling aids availability. Configure operator licence compliance audit checklists for O-licence holders.

## Key Standards and Regulations
- **EU/GB Drivers' Hours Regulations (EC 561/2006 and AETR)** — Addressed by: H&S (fatigue risk assessment), Training (driver awareness training), Document Control (tachograph and drivers' hours policy).
- **Operator Licensing (Goods Vehicles Licensing)** — O-licence compliance. Addressed by: CMMS (vehicle maintenance records, PMI schedules), Training (transport manager CPC, driver training records), Document Control (maintenance records archive).
- **ADR (European Agreement on International Carriage of Dangerous Goods by Road)** — Addressed by: Training (ADR certificate tracking), Document Control (dangerous goods transport documentation), Incident Management (dangerous goods incident workflow).
- **ISO 45001:2018** — Occupational H&S. Addressed by: H&S, Incident Management, Training, Audit.
- **ISO 14001:2015** — Environmental Management (fleet emissions). Addressed by: Environmental (fleet emissions tracking, targets, improvement actions), Audit, Document Control.
- **ISO 9001:2015** — Quality (service delivery quality). Addressed by: Quality (delivery performance metrics, customer complaints), Supplier Management (carrier performance), Audit.

## Industry-Specific Configuration Tips
1. **Build the vehicle fleet asset register before configuring any CMMS maintenance plans.** Without accurate vehicle records (registration, VIN, current mileage odometer baseline), CMMS service schedules will be unworkable. Import the fleet from your existing fleet management system or DVLA data. Make vehicle asset data the single source of truth.
2. **Driver licence DVLA checks must be scheduled and recorded.** Operator licence conditions typically require regular DVLA licence checks for company-employed drivers. Configure the Training module with periodic DVLA check records and expiry alerts. A driver discovered to have a disqualified licence while operating a company vehicle is a serious operator licence compliance failure.
3. **Configure the carrier performance scorecard in Supplier Management.** Carrier KPIs should be measurable from operational data: on-time delivery performance, cargo damage rate, customer complaint rate per carrier, and non-compliances noted during audits. Score carriers quarterly and use scores to inform carrier selection decisions and identify carriers for re-qualification or de-listing.
4. **Fleet emissions tracking should link to vehicle fuel card data.** Where possible, configure automated fuel consumption data import from fleet fuel cards (using the API integration capability). This eliminates manual data entry for the largest component of fleet Scope 1 emissions reporting.
5. **Route risk assessments are required for abnormal loads and high-risk journeys.** Document Control should hold template route risk assessment forms that drivers or transport planners complete for non-standard journeys (abnormal load, hazardous cargo over threshold quantities, overnight stops in vulnerable locations). These should be retained as evidence.

## Typical First 90 Days
**Days 1-30 — Fleet and driver compliance foundation**: Build vehicle fleet asset register. Import driver records with CPC, licence, and qualification data. Configure CMMS preventive maintenance schedules for HGVs. Set expiry alerts for MOT, tachograph calibration, and O-licence vehicle conditions. Train Transport Manager and H&S lead.

**Days 31-60 — Carrier qualification and warehouse safety**: Import carrier register with O-licence and insurance data. Configure carrier performance scorecard. Build warehouse and depot H&S risk assessments. Configure FLT licence and manual handling training records. Enable incident reporting (RTA, cargo damage) with mobile access for drivers.

**Days 61-90 — Environmental and audit integration**: Configure fleet emissions tracking linked to fuel card data. Set carbon reduction targets. Build depot safety audit checklists. Run first operator licence compliance audit. Configure dangerous goods incident workflow. Generate first fleet and safety performance management report.

## Common Pitfalls for This Industry
- **Treating carrier qualification as a one-time onboarding exercise.** Carrier operator licences, insurance policies, and quality certifications expire and must be renewed. A carrier whose public liability insurance lapses mid-contract creates significant legal exposure. Configure Supplier Management with expiry date alerts for all time-limited carrier documents, and set automatic suspension of carriers who do not renew before expiry.
- **Not tracking driver CPC training hours proactively.** HGV drivers who fail to complete 35 hours of periodic CPC training within 5 years lose their Driver Qualification Card and cannot legally drive professionally. With training spread over 5 years, gaps are easily missed. Configure the Training module with individual driver CPC hour balances and 6-month advance alerts.
- **Failing to configure mobile access for drivers.** Drivers are rarely at a desk. If the incident reporting system is only accessible via desktop browser, near-miss and vehicle defect reports will be completed on paper (or not at all). Configure mobile-first access for all driver-facing IMS features from day one.
- **Keeping fleet maintenance records only in a separate fleet management system.** Fleet maintenance records are O-licence compliance evidence. If they are held in a separate system that is not linked to IMS, operator licence audit evidence has to be assembled from two systems. Consider whether fleet data can be integrated with or migrated to CMMS to create a single compliance record.`,
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['industry', 'logistics', 'supply-chain', 'transport', 'deployment'],
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
    id: 'KB-IND-010',
    title: 'IMS Deployment Guide: Technology & SaaS Companies',
    content: `## Industry Overview
Technology and SaaS companies face a distinct profile of management system requirements centred on information security, data protection, operational resilience, and increasingly, supply chain and third-party risk. ISO 27001 and SOC 2 are the dominant certification frameworks, and customer-facing security posture is often a commercial differentiator. IMS deployments must integrate with engineering and DevOps workflows while providing the governance structure that enterprise customers and regulators require.

## Recommended Module Configuration

### Core Modules (enable on day 1)
- **Information Security (ISO 27001)**: Start with the information asset register. In a SaaS business, the primary assets are: customer data environments (production databases, data warehouses), source code repositories, identity and access management infrastructure, and cloud platform configurations. Classify each asset by CIA (Confidentiality, Integrity, Availability) criticality. Apply Annex A controls and record implementation status and residual risk for each applicable control.
- **Incident Response (Security Incidents and Outages)**: Configure incident types: security incident (breach attempt, malware, phishing, insider threat), customer-affecting service disruption, data breach (personal data), and system vulnerability. Enable the data breach notification workflow (72-hour ICO reporting, customer notification obligations). Configure severity levels: P1 (service down / data breach), P2 (degraded / potential breach), P3 (contained / no customer impact).
- **Risk Management**: Configure with a technology and data risk taxonomy: data breach, ransomware, supply chain attack, cloud provider failure, key person dependency, regulatory non-compliance, and product liability. Enable automatic risk review triggers when a new security incident occurs in a risk category. Configure board-level risk register view for the top 10 risks.
- **Document Control**: Control information security policies (ISMS policy, acceptable use, access control, incident response, business continuity), runbooks (operational procedures for engineers), data processing agreements (DPAs), and privacy notices. Set mandatory annual review cycles for all security policies. Track policy acceptance by employees.

### Secondary Modules (enable within 90 days)
- **Training Management**: Configure security awareness training as mandatory for all employees: phishing simulation and awareness, GDPR and data handling, social engineering, secure coding (for engineers), and cloud security. Enable annual refresher cycles. Track completion rates for board reporting. Configure role-specific training for security team, engineering team, and customer-facing staff.
- **Supplier Management (Third-Party and Vendor Risk)**: Build the vendor register with all third-party software, infrastructure, and service providers. For each vendor: data sub-processing status (is personal data shared?), ISO 27001 or SOC 2 certification status, penetration test report availability, and last review date. Configure an annual vendor security questionnaire workflow. Track sub-processor notifications to customers (GDPR requirement).
- **Audit Management**: Configure ISO 27001 internal audit programme covering all Annex A control domains annually. Set up SOC 2 Type II control testing schedule. Configure penetration test finding management workflow (from initial finding to remediation verification). Schedule quarterly security posture review as a standing audit item.
- **Complaint Management**: Configure for customer-reported security concerns, data subject access requests (DSARs), and service level complaints (uptime, performance). DSAR response must be within 30 days (GDPR). Configure DSAR tracking as a distinct record type with mandatory deadline tracking.

## Key Standards and Regulations
- **ISO 27001:2022** — Information Security Management Systems. Addressed by: InfoSec (full ISMS implementation), Document Control (ISMS documentation), Audit (ISO 27001 internal audit), Training (security awareness), Supplier Management (third-party risk, Annex A A.5.19-5.23).
- **SOC 2 Type II** — Service Organisation Control 2 (Trust Services Criteria: Security, Availability, Confidentiality, Processing Integrity, Privacy). Addressed by: InfoSec (CC controls), Audit (control testing), Incident Management (incident response), Training (security awareness).
- **UK GDPR / Data Protection Act 2018** — Addressed by: InfoSec (data protection controls), Incident Management (data breach notification), Complaint Management (DSAR tracking), Supplier Management (DPA register, sub-processor management).
- **Cyber Essentials / Cyber Essentials Plus** — UK government baseline scheme. Addressed by: InfoSec (boundary firewalls, secure configuration, access control, malware protection, patch management), Audit (Cyber Essentials assessment).
- **NIS2 Directive (EU)** — Network and Information Security (for entities in scope). Addressed by: InfoSec, Incident Management (NIS2 significant incident reporting — within 24 hours for early warning), Risk Management, Supplier Management.

## Industry-Specific Configuration Tips
1. **Start the information asset register with customer data systems, not internal systems.** Enterprise SaaS customers and auditors (ISO 27001, SOC 2) focus first on how customer data is protected. Begin the asset register with production databases, data warehouses, data pipelines, and API endpoints that process customer data. Internal assets (HR systems, finance systems) come second.
2. **Penetration test finding tracking must be rigorous and time-bound.** Penetration tests that generate findings not tracked to remediation create a false sense of security. Configure a penetration test finding workflow in Audit Management: finding creation, risk rating, remediation assignment, target date, and verification re-test. Critical and High findings should have mandatory remediation timeframes (30 and 90 days respectively).
3. **Vendor risk assessments must differentiate data processors from non-data processors.** GDPR Article 28 requires a Data Processing Agreement (DPA) with every vendor that processes personal data on your behalf. Configure the Supplier Management module with a 'data processing' flag and a mandatory DPA document field. Run a quarterly check for any new vendor relationships without a DPA in place.
4. **Configure phishing simulation results to feed into training completion records.** Many organisations run phishing simulations separately from their LMS. Configure the Training module to receive failed phishing simulation results as a trigger for mandatory security awareness retraining. This creates a closed-loop between testing and training.
5. **Build a product security vulnerability register linked to Incident Management.** Security vulnerabilities discovered internally or via bug bounty programmes should be tracked in a product security vulnerability register with CVSS score, affected component, remediation status, and disclosure timeline. This is distinct from operational incidents but equally important for SOC 2 and ISO 27001 evidence.

## Typical First 90 Days
**Days 1-30 — ISMS and risk foundation**: Build information asset register (customer-facing systems first). Configure ISO 27001 risk assessment with technology risk taxonomy. Set up data breach notification workflow (ICO 72-hour). Configure security policy library in Document Control. Train CISO and Security team.

**Days 31-60 — Vendor and incident management**: Build vendor register with sub-processor classification. Configure vendor security questionnaire workflow. Configure incident response categories and severity levels. Enable DSAR tracking in Complaint Management. Import existing penetration test findings.

**Days 61-90 — Training, audit, and compliance integration**: Roll out mandatory security awareness training to all staff. Configure ISO 27001 internal audit programme. Set up SOC 2 control testing schedule. Run first security posture review. Generate first ISMS management review report for board.

## Common Pitfalls for This Industry
- **Treating ISO 27001 certification as an annual point-in-time compliance exercise.** The ISMS must be operated continuously, not just before certification audits. Configure monthly risk review meetings, continuous monitoring of security controls, and real-time incident tracking so the ISMS is genuinely operational — not a paper exercise refreshed before each audit.
- **Not maintaining a sub-processor list proactively.** Enterprise customers and GDPR Article 30 Records of Processing Activities both require an accurate sub-processor list. If the vendor register is not kept current, a new cloud tool adopted by an engineering team may be processing customer data without appropriate DPAs or customer notification. Configure a mandatory onboarding step in the Supplier Management module whenever a new SaaS tool or infrastructure provider is adopted.
- **Underestimating the SOC 2 evidence collection burden.** SOC 2 Type II requires continuous evidence of control operation over a 6-12 month period. If evidence is not being collected throughout the period, auditors cannot attest to control effectiveness. Configure automated evidence collection (access review logs, change management records, training completion) from day one rather than scrambling to assemble evidence before the audit.
- **Not practising incident response before a real incident occurs.** Incident response plans that have never been tested are rarely effective in real incidents. Schedule quarterly tabletop exercises for different incident scenarios (ransomware, data breach, insider threat) and track action items from exercises in the Audit Management module.`,
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['industry', 'technology', 'saas', 'infosec', 'iso-27001', 'deployment'],
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
    id: 'KB-IND-011',
    title: 'IMS Deployment Guide: Professional Services',
    content: `## Industry Overview
Professional services firms — management consultancies, law firms, accountancies, engineering consultancies, and recruitment businesses — deliver knowledge-based services where quality of output, client relationships, and professional standards are the central management concerns. IMS deployments in this sector must support project-based service delivery, professional development tracking, client complaint handling, and increasingly, data protection and risk management obligations driven by client requirements and regulation.

## Recommended Module Configuration

### Core Modules (enable on day 1)
- **Quality Management**: Configure for project-based service delivery quality. Define quality gates at key project milestones: scoping, deliverable review (internal), client sign-off, project closure review. Configure client feedback collection at project completion. Set up non-conformance types relevant to professional services: missed deadline, deliverable quality below standard, client escalation, budget overrun. Link non-conformances to the CAPA workflow.
- **Risk Management**: Configure with a professional services risk taxonomy: engagement risk (scope creep, client financial risk, ethical conflicts of interest), professional liability risk (negligence, E&O exposure), regulatory risk (professional body sanctions, GDPR violations), and commercial risk (key client concentration, key person dependency). Configure engagement risk assessment as a mandatory step in the new business approval workflow.
- **Document Control**: Control the firm's methodology library (delivery frameworks, templates, standards), client deliverable templates (report templates, presentation templates, contract templates), policies (data protection, conflicts of interest, engagement management), and professional body registration documentation. Set up version control for methodology documents with mandatory review cycles.
- **Complaint Management**: Configure for client complaints and professional body complaints separately. For client complaints: acknowledge within 2 working days, investigate and provide substantive response within 20 working days. For law firms (SRA regulated): configure the SRA-required complaints procedure with first-tier (internal) and second-tier (Legal Ombudsman) stages. Track trends for quarterly partner/board review.

### Secondary Modules (enable within 90 days)
- **Training Management (CPD)**: Configure Continuing Professional Development (CPD) tracking by professional qualification. Examples: ICAEW members (40 CPD hours per year), solicitors (Law Society CPD requirements), CMC chartered management consultants (CPD log), engineers (ICE/IMechE CPD requirements). Set annual CPD hour targets per qualification type. Alert individuals when they fall behind their annual CPD target. Track professional qualification renewal dates (PI, practising certificates).
- **HR Management**: Configure for professional services workforce management: grade or level (Analyst, Consultant, Manager, Director, Partner), utilisation tracking, professional qualification status, and notice periods. Link HR records to Training Management for CPD status. Configure probation period review tracking for new joiners.
- **CRM (Client Relationship Management)**: Configure client accounts and engagement records. Link client records to Quality Management (project quality records, client satisfaction scores) and Complaint Management (complaint history). Track client NPS (Net Promoter Score) by client and service line. Configure key client review scheduling.
- **Audit Management**: Configure internal audit programme for ISO 9001 (if certified) and regulatory compliance (GDPR, professional body requirements). Schedule annual engagement quality review audits (random sample of completed engagements reviewed against quality standards). For SRA-regulated law firms: configure annual compliance audits against the SRA Code of Conduct.

## Key Standards and Regulations
- **ISO 9001:2015** — Quality Management. Addressed by: Quality, Document Control, Audit, Complaint Management, Supplier Management.
- **GDPR / Data Protection Act 2018** — Addressed by: Document Control (data protection policy, privacy notices, DPA register), Risk Management (data privacy risk), Training (mandatory GDPR training), Incident Management (data breach notification).
- **Professional body requirements** — SRA Code of Conduct (law), ICAEW Regulations (accountancy), ICE/IMechE Professional Review (engineering), CMC Standards (management consulting). Addressed by: Training (CPD tracking, qualification records), Document Control (professional standards library), Complaint Management (professional body complaint procedure).
- **Modern Slavery Act 2015** — Supply chain transparency (for firms with >£36m turnover). Addressed by: Supplier Management (modern slavery risk assessment by supplier category), Document Control (annual modern slavery statement).

## Industry-Specific Configuration Tips
1. **Configure the engagement risk assessment as a mandatory new business gate.** Every new client engagement carries risks: conflicts of interest, client financial viability, regulatory exposure, scope complexity, and reputational risk. Configure the Risk Management module to require a completed engagement risk assessment before a new engagement code is opened in the finance or project management system.
2. **CPD tracking must support multiple professional qualifications per individual.** A partner in a multidisciplinary firm may hold qualifications from two or three professional bodies, each with different CPD requirements. The Training module allows multiple CPD frameworks to be assigned per employee — configure this from day one rather than using separate spreadsheets for each professional body requirement.
3. **Client NPS measurement requires integration between CRM and Quality modules.** Configure a post-engagement NPS survey trigger in CRM. Results should flow automatically to the Quality module as a quality metric per engagement and per client. Track NPS trends in the quality management review.
4. **Conflicts of interest screening is a professional and regulatory requirement.** For law firms, accountancies, and consulting firms, conflicts of interest must be checked before accepting new clients or engagements. Configure a conflicts check workflow in Risk Management or CRM as part of the new business approval process.
5. **Professional indemnity insurance renewal requires accurate claim history data.** PI insurers will request claim and complaint history data annually. If this data is held in the Complaint Management module with complete root cause and outcome records, the renewal information pack can be generated directly from the system rather than assembled from disparate email records.

## Typical First 90 Days
**Days 1-30 — Quality and risk foundation**: Configure project quality gates and client feedback workflow. Build engagement risk assessment template. Set up Document Control with methodology and policy library. Configure complaint handling workflow with professional body procedure. Train Quality Manager, Operations Director, and compliance leads.

**Days 31-60 — CPD and professional records**: Configure CPD frameworks by professional qualification. Import individual qualification and CPD records. Set up HR module with grade and utilisation tracking. Configure conflicts of interest screening in Risk Management. Enable CRM with client account and engagement structure.

**Days 61-90 — Audit and full integration**: Configure ISO 9001 internal audit programme. Schedule engagement quality review audits. Configure GDPR compliance audit checklist. Link CRM NPS data to Quality module. Generate first quality and risk management review report. Brief partnership/board on IMS performance dashboard.

## Common Pitfalls for This Industry
- **Configuring the system around service lines rather than projects.** Professional services quality is delivered at project/engagement level. Quality records, risk assessments, complaints, and client feedback must all be traceable to a specific engagement. If the organisational hierarchy is configured at service line or department level only, project-level traceability is lost.
- **Not capturing informal client escalations as complaints.** In professional services, client dissatisfaction is often expressed informally (a call to a partner, an email expressing concern) before formal complaint escalation. Configure the Complaint Management module to capture informal escalations as preliminary records. These are valuable early-warning signals and may be relevant to PI insurance.
- **Treating CPD as self-reported data without verification.** Professional body CPD requirements exist to ensure that practitioners maintain competence. If CPD records are self-reported and unverified, they provide no assurance. Configure the Training module to require supporting evidence (certificates, attendance records) for CPD claims above a minimum threshold.
- **Not linking the engagement risk assessment to the risk register.** Engagement risks (key client concentration, a major client in financial difficulty, regulatory risk on a high-profile engagement) are often the most significant risks facing a professional services firm. If engagement risk assessments sit in isolation from the firm-wide risk register, leadership has an incomplete picture of risk exposure.`,
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['industry', 'professional-services', 'consulting', 'iso-9001', 'deployment'],
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
    id: 'KB-IND-012',
    title: 'IMS Deployment Guide: Retail & Consumer Goods',
    content: `## Industry Overview
Retail and consumer goods organisations face a diverse set of management system requirements spanning product safety, supply chain ethics, consumer complaint management, premises safety, and environmental obligations. The combination of a complex multi-tier supplier base, direct consumer-facing brand risk, and increasing regulatory requirements around ethical sourcing and environmental packaging make IMS a critical governance tool for this sector.

## Recommended Module Configuration

### Core Modules (enable on day 1)
- **Supplier Management (Ethical Sourcing)**: In retail and consumer goods, the supply chain is the primary risk. Configure supplier records with ethical sourcing fields: ethical audit scheme (SEDEX/SMETA, amfori BSCI, SA8000), audit result and date, country of origin (for modern slavery risk tiering), Fairtrade or organic certification, and product compliance certifications (REACH/RoHS for non-food products, FSC for timber). Build the supplier ethical audit schedule by tier and risk level.
- **Quality Management**: Configure for product quality management. Define product categories and link to quality specifications. Set up customer complaint types: product defect, mislabelling, packaging failure, foreign body (food retail), product recall trigger events. Configure the product recall decision workflow with escalation to Senior Management and regulatory notification (Trading Standards, FSA for food retail). Track customer complaint volumes against product complaint thresholds that trigger product review.
- **Complaint Management**: Configure for consumer complaints at volume. Retail organisations handle high volumes of consumer complaints across multiple channels (in-store, online, social media, call centre). Configure complaint categories, response timelines, and root cause analysis. Track consumer complaint volume by product, supplier, and store to identify systemic issues. For food retail, configure FSA (Food Standards Agency) complaint category alignment.
- **Health & Safety**: Configure for retail premises safety: manual handling (shelf replenishment, stock movement), lone working (early morning deliveries, late-night closing, lone store workers), slip and trip hazards (wet floors, uneven surfaces), delivery vehicle interface (loading bay safety), and food hygiene (food-to-go, deli, bakery) for food retailers. Enable near-miss reporting with mobile access for store staff.

### Secondary Modules (enable within 90 days)
- **Environmental Management**: Configure packaging waste obligation tracking (Producer Responsibility Obligations). Calculate packaging placed on market by material type (glass, paper, plastic, aluminium, steel, wood) for PRN/PERN submission. Track Scope 3 supply chain emissions by spend category for TCFD and sustainability reporting. Configure single-use plastics compliance tracking (for applicable product categories). Track retail store energy consumption and waste diversion rates.
- **Training Management**: Configure mandatory training by role. For all retail staff: manual handling, fire safety, emergency evacuation, customer service standards. For food retail staff: food hygiene (Level 2 minimum for all food handlers), allergen awareness, HACCP awareness, temperature monitoring. For managers: Level 3 food hygiene (food retail managers), team leader H&S responsibilities. Track certificate expiry dates and schedule renewal training.
- **Audit Management**: Configure store and warehouse H&S inspection checklists (weekly or monthly by store type). Schedule annual ethical supply chain audits for Tier 1 suppliers. Build BRC or ISO 9001 internal audit checklists for distribution centres. Configure product compliance audit for REACH/RoHS, CPSR (cosmetic products safety report), or CE/UKCA marking as applicable to product categories.
- **Incident Management**: Configure incident types: customer personal injury (public liability event), staff personal injury (RIDDOR), food safety incident (allergen cross-contamination, temperature control breach, foreign body), product quality failure (customer return, product defect), and security incident (theft, robbery, fraud). Configure public liability incident documentation to meet insurer evidence requirements.

## Key Standards and Regulations
- **ISO 9001:2015** — Quality Management. Addressed by: Quality (product quality, complaint management), Document Control, Audit, Supplier Management.
- **ISO 14001:2015** — Environmental Management. Addressed by: Environmental (packaging waste, energy, Scope 3 emissions), Audit.
- **Modern Slavery Act 2015** — Supply chain transparency. Addressed by: Supplier Management (ethical audit tracking, modern slavery risk tiering by country), Document Control (annual modern slavery statement), Audit (ethical audit programme).
- **REACH Regulation** — Chemical compliance (for non-food retail: electronics, clothing, cosmetics, home goods). Addressed by: Supplier Management (REACH compliance declaration by product category), Quality (product compliance verification), Document Control (compliance documentation).
- **RoHS Directive (2011/65/EU and UK equivalent)** — Restriction of Hazardous Substances (for electronics retail). Addressed by: Supplier Management (RoHS declaration of conformity), Quality (product compliance audit).
- **Producer Responsibility Obligations (UK)** — Packaging waste. Addressed by: Environmental (packaging data by material type, PRN/PERN reporting), Document Control (compliance documentation).
- **Food Safety Act 1990 / Food Information to Consumers Regulation** (for food retail). Addressed by: Food Safety / Quality (allergen management, food safety controls), Training (food hygiene), Incident Management (food safety incidents).

## Industry-Specific Configuration Tips
1. **Consumer complaint volume thresholds must trigger automatic product quality reviews.** Configure the Complaint Management module with complaint rate thresholds by product or product category (e.g., a complaint rate above 0.05% of units sold, or more than 5 complaints of the same defect type in a rolling 30-day period triggers a mandatory product quality review in the Quality module). This closed-loop mechanism is central to product quality risk management.
2. **Supplier ethical audit tracking must distinguish audit status by product tier.** Tier 1 (direct) suppliers are the highest priority for ethical auditing, but Tier 2 and Tier 3 suppliers represent significant modern slavery and labour rights risk in many categories. Configure Supplier Management with supply chain tier classification and different audit frequency requirements by tier.
3. **Configure country-of-origin risk tiering for modern slavery.** The Global Slavery Index provides country-level risk ratings. Configure supplier records with country of manufacture, and auto-rate country risk using a configured risk matrix. Suppliers from high-risk countries require more frequent ethical audits and deeper supply chain mapping.
4. **Track packaging placed on market by material type from product import data.** Producer Responsibility reporting requires accurate packaging weight data by material. Configure the Environmental module to capture packaging weights at product or supplier level so that annual packaging data can be calculated from product sales data rather than manual surveys.
5. **Product recall workflow must include a regulatory notification step.** A product recall for food safety or product safety reasons requires notification to the relevant regulator (FSA, Trading Standards, OPSS). Configure the product recall workflow in Quality Management with a mandatory regulatory notification step, including the identification of the relevant authority and notification timeline.

## Typical First 90 Days
**Days 1-30 — Supplier and quality foundation**: Import supplier register with ethical audit status and country of origin. Configure supplier ethical audit schedule. Build product quality complaint categories and recall workflow. Configure consumer complaint handling. Train Quality Manager, Supplier Manager, and H&S lead.

**Days 31-60 — H&S, training, and environmental**: Configure retail premises H&S risk assessments. Build mandatory training programme (manual handling, food hygiene, allergen). Configure packaging waste tracking by material type. Enable incident management for customer injury and staff RIDDOR events. Configure store H&S inspection checklist.

**Days 61-90 — Audit, ESG, and full integration**: Configure internal audit programme for H&S inspections and product compliance audits. Build Scope 3 supply chain emissions tracking. Configure consumer complaint volume threshold triggers. Generate first sustainability and supplier performance report. Complete modern slavery statement data gathering from Supplier Management records.

## Common Pitfalls for This Industry
- **Treating ethical supplier audits as a certification exercise rather than an ongoing risk management activity.** An ethical audit certificate is a point-in-time assessment. Suppliers can have a clean audit and then experience labour rights violations 6 months later. Configure Supplier Management with ongoing monitoring mechanisms: supplier self-assessment questionnaires, worker voice tools (where available), and annual re-audit scheduling — not just initial certification.
- **Not linking consumer complaint volumes to product quality reviews.** High consumer complaint volumes on a specific product are one of the strongest early-warning signals of a product quality or safety problem. If complaint data is held in a call centre CRM and never analysed against product quality data, the early-warning signal is lost. Configure the Complaint Management to Quality module link from day one.
- **Underestimating the packaging data collection challenge for Producer Responsibility reporting.** Packaging weights by material type are often held inconsistently across product management, procurement, and finance systems. Start the packaging data collection exercise early in the IMS deployment — waiting until reporting season creates a significant compliance risk.
- **Not configuring lone working procedures for retail staff.** Lone working is common in retail (early morning deliveries, late-night store closers, single-person kiosks). Many retail businesses have no formal lone working risk assessment or check-in procedure. Configure the H&S module with lone working risk assessments for all store types and shifts where staff work alone, and implement a check-in procedure using the IMS mobile app.`,
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['industry', 'retail', 'consumer-goods', 'supply-chain', 'deployment'],
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
