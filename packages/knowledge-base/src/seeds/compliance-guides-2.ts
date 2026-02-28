import type { KBArticle } from '../types';

export const complianceGuides2Articles: KBArticle[] = [
  {
    id: 'KB-CG2-001',
    title: 'OSHA 300 Log Management in IMS',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['compliance', 'osha', 'osha-300', 'recordkeeping', 'usa'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# OSHA 300 Log Management in IMS

## Overview

The Occupational Safety and Health Administration (OSHA) requires most US employers with 10 or more employees to maintain records of work-related injuries and illnesses. The OSHA recordkeeping standard (29 CFR 1904) specifies three forms: the OSHA 300 Log (summary of recordable injuries and illnesses), the OSHA 300A Summary (annual summary posted each February), and the OSHA 301 Incident Report (detailed record for each incident).

IMS automates the collection, classification, and reporting of OSHA-required data through the Incidents module with dedicated US recordkeeping configuration.

## Key Requirements

- Record work-related injuries and illnesses that meet recordability criteria within 7 calendar days of receiving information
- Maintain the OSHA 300 Log for 5 years following the end of the calendar year it covers
- Post the OSHA 300A Annual Summary from 1 February through 30 April each year
- Submit OSHA 300A data electronically (ITA) if required by establishment size or industry
- Provide access to the log to current and former employees and their representatives

**Recordability determination:** An injury or illness is OSHA recordable if it results in: days away from work, restricted work or job transfer, medical treatment beyond first aid, loss of consciousness, diagnosis by a healthcare professional, or death.

## IMS Module Mapping

| Requirement | IMS Module | Feature |
|---|---|---|
| Injury/illness recording | Incidents | Work-related incident form with OSHA fields |
| Recordability determination | Incidents | OSHA recordable flag with decision guide |
| OSHA 300 Log | Incidents | Auto-generated OSHA 300 Log report |
| OSHA 300A Summary | Incidents | Annual summary generation and posting tracker |
| OSHA 301 Form | Incidents | Detailed incident record, 301 export |
| ITA electronic submission | Incidents | Export in ITA-compatible format |
| 5-year retention | Data Retention | Automatic 5-year retention for incident records |

## Evidence Checklist

- [ ] OSHA 300 Log populated for all recordable incidents in current year
- [ ] OSHA recordable determination documented for each injury/illness event
- [ ] OSHA 300A Annual Summary generated and posting dates recorded
- [ ] OSHA 301 Incident Report completed for each recordable case
- [ ] Electronic submission (ITA) completed by 2 March for required establishments
- [ ] 5-year log archive accessible and complete for prior years
- [ ] Employee access procedure documented

## Common Audit Findings

1. **Missing recordability determination:** Many organisations fail to document how they determined whether an injury was recordable or not. IMS prompts users to complete the recordability determination fields and records the decision. Use the OSHA Recordability Decision Guide built into the incident form.

2. **Late recording:** OSHA requires entry within 7 days. IMS sends automatic reminders if an injury/illness record has not been marked as reviewed for OSHA recordability within 3 days of creation.

3. **Incomplete OSHA 301 form:** All required fields on the 301 (body part, nature of injury, source) must be completed. IMS validates these fields before allowing a case to be closed.

4. **ITA submission not completed:** Establishments with 250+ employees or 20–249 employees in high-hazard industries must submit electronically. IMS tracks ITA submission status and sends a reminder in January.

## Useful Resources

- OSHA Recordkeeping Standard: 29 CFR Part 1904
- OSHA Injury Tracking Application (ITA): osha.gov/injuryreporting
- OSHA Recordkeeping Forms and Instructions
`,
  },
  {
    id: 'KB-CG2-002',
    title: 'GDPR Compliance Using IMS',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['compliance', 'gdpr', 'privacy', 'data-protection', 'europe'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# GDPR Compliance Using IMS

## Overview

The General Data Protection Regulation (GDPR) — Regulation (EU) 2016/679 — sets requirements for the processing of personal data of EU/EEA data subjects. It applies to any organisation processing such data, regardless of where the organisation is based.

IMS operates as a **data processor** for your organisation. Your organisation is the **data controller**. A Data Processing Agreement (DPA) between your organisation and IMS is mandatory before processing personal data. IMS supports your compliance obligations through a range of built-in privacy management features.

## Key Requirements

- Legal basis for processing must be identified for each category of personal data
- Data subjects have rights: access (Art. 15), rectification (Art. 16), erasure (Art. 17), portability (Art. 20), restriction (Art. 18), objection (Art. 21)
- Data breach notification to supervisory authority within 72 hours of becoming aware (Art. 33)
- Records of processing activities (ROPA) required for organisations processing at scale (Art. 30)
- Data Protection Impact Assessments (DPIA) for high-risk processing activities (Art. 35)
- Consent must be freely given, specific, informed, unambiguous, and withdrawable

## IMS Module Mapping

| GDPR Obligation | IMS Module | Feature |
|---|---|---|
| DSAR (Art. 15) | Admin → Privacy | Data Subject Access Request export tool |
| Right to erasure (Art. 17) | Admin → Privacy | Deletion workflow with legal hold check |
| Data portability (Art. 20) | Admin → Privacy | Per-subject CSV/JSON export |
| Consent management (Art. 7) | Settings → Consent | Consent records with version history |
| ROPA (Art. 30) | Settings → Data Register | Processing activity register |
| Breach notification (Art. 33) | Incidents | Personal data breach incident type + 72h workflow |
| Retention (Art. 5(1)(e)) | Admin → Data Retention | Configurable retention per record type |
| DPIA (Art. 35) | Risk | DPIA template in Risk module |

## Evidence Checklist

- [ ] Data Processing Agreement signed with IMS
- [ ] Records of Processing Activities (ROPA) maintained and current
- [ ] Legal basis identified for each processing activity
- [ ] Consent records in place where consent is the legal basis
- [ ] DSAR procedure tested and operational (target response: 30 days)
- [ ] Data breach notification procedure tested (72-hour target)
- [ ] Data retention periods configured and enforced
- [ ] DPIA completed for high-risk processing activities
- [ ] Sub-processor list reviewed and DPAs in place with sub-processors

## Common Audit Findings

1. **ROPA not up to date:** Organisations add new tools and processes without updating their ROPA. Use IMS Data Register as the central ROPA and assign a data register review task quarterly.

2. **No DPIA for high-risk processing:** Systematic monitoring, large-scale sensitive data processing, or new technologies require a DPIA. IMS Risk module includes a DPIA template aligned to ICO guidance.

3. **Consent records incomplete:** Consent must be timestamped and linked to the specific consent wording at the time of collection. IMS Consent Manager versions consent wording and attaches the version to each consent record.

4. **Breach response not tested:** Run an annual tabletop exercise for a personal data breach scenario. IMS Incidents module includes a Data Breach incident type with a 72-hour notification countdown and action checklist.

## Useful Resources

- GDPR full text: eur-lex.europa.eu
- ICO (UK) guidance: ico.org.uk/for-organisations
- EDPB guidelines: edpb.europa.eu
`,
  },
  {
    id: 'KB-CG2-003',
    title: 'ISO 42001 (AI Management System) Compliance Guide',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['compliance', 'iso-42001', 'ai-governance', 'artificial-intelligence'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# ISO 42001 (AI Management System) Compliance Guide

## Overview

ISO/IEC 42001:2023 is the first international standard for Artificial Intelligence Management Systems (AIMS). It provides a framework for organisations to responsibly develop, provide, or use AI systems, covering risk assessment, governance, transparency, and continual improvement.

ISO 42001 follows the Annex SL high-level structure (same as ISO 9001, ISO 27001, etc.), making it compatible with integrated management system approaches. IMS provides a dedicated ISO 42001 module that maps directly to the standard's requirements.

## Key Requirements

- Establish an AI policy aligned to organisational objectives and AI ethics
- Identify and maintain an inventory of AI systems (internal and third-party)
- Conduct AI risk assessments covering technical, ethical, societal, and legal risks
- Perform AI Impact Assessments (AIIA) for high-risk AI systems
- Ensure transparency and explainability appropriate to the AI system's context
- Implement human oversight controls proportionate to AI risk level
- Establish processes for AI system testing, monitoring, and performance review
- Manage AI supply chain risks (third-party AI providers and components)
- Continual improvement of the AIMS based on performance data

## IMS Module Mapping

| Requirement | IMS Module | Feature |
|---|---|---|
| AI system inventory | ISO 42001 | AI system register with attributes |
| AI risk assessment | ISO 42001 / Risk | AI risk assessment template |
| AI Impact Assessment | ISO 42001 | AIIA form and workflow |
| AI policy | Document Control | AI policy template |
| Human oversight controls | ISO 42001 | Oversight control register |
| AI supplier management | Suppliers | AI vendor due diligence questionnaire |
| Performance monitoring | KPI Dashboard | AI system KPIs and metrics |
| Internal audit | Audit Management | ISO 42001 audit checklist |
| Management review | Management Review | ISO 42001 review agenda template |

## Evidence Checklist

- [ ] AI policy documented, approved, and communicated
- [ ] AI system inventory complete and current
- [ ] Risk assessments completed for all inventoried AI systems
- [ ] AI Impact Assessments completed for high-risk AI systems
- [ ] Human oversight controls defined and implemented for each AI system
- [ ] AI supplier due diligence completed
- [ ] Internal audit conducted against ISO 42001 requirements
- [ ] Management review covering AIMS performance
- [ ] Corrective actions from audit findings tracked to closure

## Common Audit Findings

1. **Incomplete AI inventory:** Organisations often overlook third-party AI embedded in software products (e.g. AI features in ERP or CRM tools). IMS AI inventory includes a third-party AI component tab to capture these.

2. **No documented human oversight:** ISO 42001 requires documented controls for human oversight proportionate to AI risk. Define and evidence who reviews AI outputs, at what frequency, and what criteria trigger human intervention.

3. **Risk assessment not updated after AI system changes:** AI systems evolve frequently. Set a review trigger in IMS so that the AI risk assessment is flagged for review whenever the AI system record is updated.

## Useful Resources

- ISO/IEC 42001:2023 standard
- ISO/IEC TR 24028 — AI trustworthiness overview
- NIST AI RMF (AI Risk Management Framework)
`,
  },
  {
    id: 'KB-CG2-004',
    title: 'ISO 37001 (Anti-Bribery Management System) Compliance Guide',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['compliance', 'iso-37001', 'anti-bribery', 'anti-corruption'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# ISO 37001 (Anti-Bribery Management System) Compliance Guide

## Overview

ISO 37001:2016 specifies requirements for establishing, implementing, maintaining, and improving an Anti-Bribery Management System (ABMS). It is applicable to all organisations regardless of size, sector, or whether public, private, or not-for-profit. Certification to ISO 37001 provides independent assurance that an organisation has implemented internationally recognised anti-bribery controls.

## Key Requirements

- Anti-bribery policy approved by top management and communicated throughout the organisation
- Bribery risk assessment covering the organisation's operations, business associates, and high-risk jurisdictions
- Due diligence on business associates (suppliers, agents, joint venture partners, contractors) proportionate to risk
- Gifts, hospitality, and political contributions policy with documented approval and register
- Financial and non-financial controls to detect and prevent bribery
- Speak-up (whistleblowing) mechanisms allowing concerns to be raised confidentially
- Anti-bribery compliance function or designated compliance officer
- Training and awareness for all personnel and relevant business associates
- Reporting and investigation procedures for suspected bribery incidents

## IMS Module Mapping

| Requirement | IMS Module | Feature |
|---|---|---|
| Anti-bribery policy | Document Control | Anti-bribery policy template |
| Bribery risk assessment | Risk | Bribery risk assessment template |
| Business associate due diligence | Suppliers | Due diligence questionnaire and scoring |
| Gifts and hospitality register | ISO 37001 | Gifts/hospitality register with approval workflow |
| Speak-up mechanism | ISO 37001 | Confidential speak-up submission portal |
| Incident investigation | Incidents | Bribery/corruption incident type |
| Training records | Training | Anti-bribery training completion tracking |
| Internal audit | Audit Management | ISO 37001 audit checklist |

## Evidence Checklist

- [ ] Anti-bribery policy signed by top management and communicated to all staff
- [ ] Bribery risk assessment completed and reviewed annually
- [ ] Due diligence completed on all high-risk business associates
- [ ] Gifts and hospitality register maintained with all entries approved per policy
- [ ] Speak-up channel operational and tested for confidentiality
- [ ] Anti-bribery training completed by all relevant personnel (records in IMS)
- [ ] Internal audit against ISO 37001 conducted annually
- [ ] Management review of ABMS performance conducted

## Common Audit Findings

1. **Gifts register incomplete:** Gifts and hospitality below the reporting threshold often go unrecorded. IMS ISO 37001 module makes submission easy via mobile, encouraging complete recording.

2. **Due diligence not risk-proportionate:** ISO 37001 requires due diligence proportionate to the bribery risk. Use IMS supplier risk scoring to automatically trigger enhanced due diligence for high-risk suppliers and jurisdictions.

3. **Speak-up channel not tested:** The speak-up channel must be functional and confidential. Conduct an annual test submission and verify the receipt and investigation process is working end-to-end.

## Useful Resources

- ISO 37001:2016 standard
- Transparency International Guidance
- UK Bribery Act 2010 guidance (MOJ)
- FCPA Resource Guide (US DOJ)
`,
  },
  {
    id: 'KB-CG2-005',
    title: 'IATF 16949 Compliance in IMS',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['compliance', 'iatf-16949', 'automotive', 'quality'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# IATF 16949 Compliance in IMS

## Overview

IATF 16949:2016 is the international quality management standard for automotive production and service part organisations. It supplements ISO 9001:2015 with automotive-specific requirements and incorporates Customer-Specific Requirements (CSRs) from OEM customers. Certification is mandatory for direct automotive supply chain participation with most major OEMs.

IMS Automotive module provides dedicated support for IATF 16949 compliance evidence management, complementing the core Quality module.

## Key Requirements

- Full ISO 9001:2015 compliance (IATF 16949 supplements, not replaces, ISO 9001)
- Customer-Specific Requirements (CSRs) identification, documentation, and compliance
- AIAG core tools compliance: APQP, FMEA (AIAG-VDA), SPC, MSA, PPAP
- Production Part Approval Process (PPAP) documentation management
- Special Characteristics identification and control (customer and organisation-designated)
- Contingency plans for key manufacturing processes and equipment
- Customer-approved sources management (directed-buy suppliers)
- Customer notification requirements for product/process changes
- First Article Inspection (FAI) for new and changed products
- Warranty management and field returns analysis

## IMS Module Mapping

| Requirement | IMS Module | Feature |
|---|---|---|
| CSR management | Automotive | CSR register with compliance status |
| APQP planning | Automotive | APQP phase gate checklist |
| PPAP documentation | Automotive | PPAP submission tracker (all 18 elements) |
| FMEA management | Quality / Automotive | FMEA templates (AIAG-VDA format) |
| Special characteristics | Automotive | Special characteristics register |
| Customer notifications | Automotive | Change notification workflow |
| FAI | Automotive | FAI record and approval workflow |
| Warranty/returns analysis | Automotive | Warranty analysis dashboard |
| Directed-buy suppliers | Suppliers | Customer-approved source flag |
| Contingency plans | Business Continuity | Manufacturing contingency plan template |

## Evidence Checklist

- [ ] CSR matrix complete for all applicable customers
- [ ] APQP plans active for all new product launches
- [ ] PPAP submissions approved for all production parts
- [ ] FMEA documents current (reviewed at defined frequency or after changes)
- [ ] Special characteristics list maintained and communicated to production
- [ ] SPC charts active for all special characteristic processes
- [ ] MSA studies completed for all measurement systems used on special characteristics
- [ ] Customer notification procedure tested with a real change notification
- [ ] FAI records complete and approved for all new/changed products
- [ ] Warranty analysis process operational and trend data available

## Common Audit Findings

1. **CSR not fully identified:** Many organisations fail to identify all applicable CSRs, particularly from second-tier customers or for legacy parts. Conduct an annual CSR review against the IATF CSR database and each OEM's published requirements.

2. **PPAP not re-submitted after engineering change:** A product or process change requires a new PPAP (or partial PPAP at the agreed level). IMS Automotive links engineering change records to the PPAP re-submission requirement automatically.

3. **SPC out of control — no response:** SPC charts showing out-of-control signals must trigger a documented response. IMS SPC integration raises an automatic action when control chart rules are violated.

## Useful Resources

- IATF 16949:2016 standard
- AIAG APQP, PPAP, FMEA, MSA, SPC manuals
- Customer-specific requirements portals (GM, Ford, Stellantis, BMW, VW Group)
`,
  },
  {
    id: 'KB-CG2-006',
    title: 'AS9100 Rev D Compliance in IMS',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['compliance', 'as9100', 'aerospace', 'quality'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# AS9100 Rev D Compliance in IMS

## Overview

AS9100 Revision D is the quality management standard for the aviation, space, and defence (AS&D) industry. Like IATF 16949, it supplements ISO 9001:2015 with industry-specific requirements. AS9100 certification is typically required to supply to OEMs such as Boeing, Airbus, Lockheed Martin, and their supply chains. Registration is managed through the OASIS database.

IMS Aerospace module provides dedicated compliance evidence management for AS9100 Rev D requirements beyond those covered by the core Quality module.

## Key Requirements

- Full ISO 9001:2015 compliance as a baseline
- Configuration management (control of design baseline and changes)
- First Article Inspection (FAI) per AS9102
- Foreign Object Damage/Debris (FOD) prevention programme
- Counterfeit parts prevention and control
- Key Characteristics (KC) identification, control, and measurement
- Product/process change notification to customers before implementation
- Risk management applied to operational planning and product realisation
- Operational Safety planning
- On-time delivery performance monitoring
- Customer-directed sources and approved supplier lists

## IMS Module Mapping

| Requirement | IMS Module | Feature |
|---|---|---|
| Configuration management | Aerospace / Document Control | Configuration baseline and change register |
| FAI (AS9102) | Aerospace | FAI package tracker with all required elements |
| FOD programme | Aerospace / H&S | FOD prevention plan and inspection records |
| Counterfeit parts | Aerospace / Suppliers | Counterfeit suspect report and quarantine workflow |
| Key Characteristics | Aerospace | KC register with measurement plan |
| Customer notification | Aerospace | Product/process change notification workflow |
| Approved supplier list | Suppliers | AS9100 supplier approval status |
| OTD monitoring | Analytics / KPI | On-time delivery dashboard |
| Operational risk | Risk | AS9100 operational risk assessment template |

## Evidence Checklist

- [ ] Configuration management plan in place and maintained
- [ ] FAI packages complete and approved for all applicable products
- [ ] FOD prevention plan documented, trained, and inspected
- [ ] Counterfeit parts procedure documented with quarantine process defined
- [ ] Key Characteristics register current and linked to control plans
- [ ] KC measurement results meeting targets (Cpk/Ppk records)
- [ ] Customer notification procedure tested and documented
- [ ] Approved Supplier List current in OASIS database
- [ ] On-time delivery KPI monitored and improvement actions in place where below target

## Common Audit Findings

1. **FAI package incomplete:** AS9102 specifies 17 elements of a FAI package. Many organisations miss elements such as the functional test results or the design characteristic accountability list. IMS Aerospace FAI tracker validates all 17 elements before marking FAI as complete.

2. **FOD inspections not documented:** FOD prevention requires documented scheduled inspections and tooling controls. IMS links FOD inspection records to the inspection management schedule with automatic non-compliance escalation.

3. **Counterfeit suspect material not quarantined promptly:** Upon identification of a counterfeit suspect part, immediate quarantine is required. IMS Aerospace counterfeit report triggers an automatic quarantine workflow and notifies the quality manager within 1 hour.

## Useful Resources

- AS9100 Rev D standard (SAE International)
- AS9102 Rev B — First Article Inspection standard
- IAQG OASIS database: iaqg.org/oasis
- SAE International counterfeit parts standards
`,
  },
  {
    id: 'KB-CG2-007',
    title: 'ISO 13485 Compliance in IMS',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['compliance', 'iso-13485', 'medical-devices', 'quality'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# ISO 13485 Compliance in IMS

## Overview

ISO 13485:2016 specifies requirements for a Quality Management System (QMS) specific to organisations in the medical device industry, including manufacturers, suppliers, distributors, and service providers. It is a regulatory requirement or baseline expectation in most jurisdictions (EU MDR/IVDR, FDA 21 CFR Part 820, Health Canada, MDSAP). Unlike ISO 9001, ISO 13485 retains a prescriptive approach to documented procedures.

## Key Requirements

- Documented procedures for all key processes (more prescriptive than ISO 9001)
- Design and development controls (design inputs, outputs, review, verification, validation, transfer)
- Risk management throughout product lifecycle per ISO 14971
- CAPA system: systematic investigation, root cause analysis, effectiveness checks
- Complaint handling: receipt, evaluation, investigation, and regulatory reporting (MDR, MEDDEV)
- Post-market surveillance system
- Sterile product controls (where applicable): sterilisation validation and process monitoring
- Customer property (e.g. patient data) controls
- Advisory notices and field safety corrective actions (FSCA)
- Unique Device Identification (UDI) management

## IMS Module Mapping

| Requirement | IMS Module | Feature |
|---|---|---|
| Design controls | Medical / Document Control | Design history file (DHF) structure |
| Risk management (ISO 14971) | Medical / Risk | ISO 14971 risk assessment template |
| CAPA | Quality | CAPA module with effectiveness check |
| Complaint handling | Complaints | Medical device complaint workflow |
| Regulatory reporting (MDR) | Incidents / Complaints | Vigilance reporting workflow |
| Post-market surveillance | Medical | PMS plan and report templates |
| Document control | Document Control | Controlled document lifecycle |
| Supplier control | Suppliers | Approved Supplier List for critical components |
| UDI management | Medical | UDI register per device |
| FSCA management | Medical | Field safety corrective action tracker |

## Evidence Checklist

- [ ] Quality manual and all required documented procedures in Document Control
- [ ] Design History File (DHF) complete for all commercial devices
- [ ] ISO 14971 risk management file current for each device
- [ ] CAPA effectiveness checks completed for all closed CAPAs
- [ ] Complaint log current; all complaints evaluated for reportability
- [ ] MDR reports submitted on time (EU: 15/30/2 day timelines; FDA: 30/5 day timelines)
- [ ] Post-market surveillance plan and annual PMS report in place
- [ ] Approved Supplier List current with qualification evidence
- [ ] UDI registered in EUDAMED (EU) / FDA GUDID (US)
- [ ] Internal audit against ISO 13485 completed annually

## Common Audit Findings

1. **CAPA without effectiveness check:** ISO 13485 requires documented verification that corrective actions were effective. IMS CAPA module enforces an effectiveness check stage before a CAPA can be closed.

2. **MDR reporting timelines missed:** Medical device vigilance reporting has strict timelines (EU: 15 days for serious incidents, 30 days for others). IMS Complaints module includes a reportability assessment and automatic countdown timer for MDR submissions.

3. **Design changes not going through design control:** Post-launch design changes often bypass the design control process. IMS Medical links engineering change records to the DHF and requires a change classification review before approval.

## Useful Resources

- ISO 13485:2016 standard
- ISO 14971:2019 — Medical device risk management
- EU MDR 2017/745 and IVDR 2017/746
- FDA 21 CFR Part 820 — Quality System Regulation
- MDSAP programme guidance
`,
  },
  {
    id: 'KB-CG2-008',
    title: 'GRI Standards Sustainability Reporting in IMS',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['compliance', 'gri', 'esg', 'sustainability-reporting'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# GRI Standards Sustainability Reporting in IMS

## Overview

The Global Reporting Initiative (GRI) Standards are the most widely used international standards for sustainability reporting. The GRI Standards enable organisations to report on their impacts on the economy, environment, and people in a comparable, credible way. The 2021 GRI Universal Standards (GRI 1, 2, 3) are mandatory for GRI-aligned reports, supported by Topic Standards (GRI 200 Economic, 300 Environmental, 400 Social series).

## Key Requirements

**GRI 1 — Foundation:** Sets out the purpose and system of GRI Standards; defines requirements for how to apply them.

**GRI 2 — General Disclosures:** Contextual information about the organisation: governance, strategy, policies, stakeholder engagement, and reporting practice.

**GRI 3 — Material Topics:** Process for determining material topics (double materiality), list of material topics, management approach for each material topic.

**Topic Standards (GRI 200/300/400):** Specific disclosures for each material topic selected. Examples:
- GRI 302 (Energy) — energy consumption, intensity, reduction
- GRI 305 (Emissions) — Scope 1, 2, 3 GHG emissions
- GRI 403 (OHS) — injury rates, fatalities, OHS management system
- GRI 401 (Employment) — new hires, turnover, benefits
- GRI 205 (Anti-corruption) — risks assessed, training, incidents

## IMS Module Mapping

| GRI Disclosure | IMS Module | Feature |
|---|---|---|
| GRI 2 (Governance) | Management Review | Governance structure documentation |
| GRI 2 (Stakeholder engagement) | Stakeholder Management | Stakeholder register and engagement log |
| GRI 3 (Materiality) | ESG | Materiality assessment tool and matrix |
| GRI 302 (Energy) | Energy Monitoring | Energy consumption dashboard and reports |
| GRI 303 (Water) | Environmental Monitoring | Water consumption records |
| GRI 305 (Emissions) | Environmental / ESG | Scope 1/2/3 GHG inventory |
| GRI 403 (OHS) | H&S | Injury frequency rates, OHS metrics |
| GRI 404 (Training) | Training Tracker | Training hours per employee |
| GRI 205 (Anti-corruption) | ISO 37001 | Anti-bribery training and incident records |
| GRI Index | ESG | Auto-generated GRI Content Index |

## Evidence Checklist

- [ ] Materiality assessment completed and material topics list approved
- [ ] Management approach documented for each material topic
- [ ] GRI 2 general disclosures data collected and verified
- [ ] Scope 1 and Scope 2 emissions calculated per GHG Protocol
- [ ] Scope 3 emissions categories identified and quantified where material
- [ ] Energy, water, waste data collected for the reporting period
- [ ] OHS metrics (LTIFR, injury rates, fatalities) validated
- [ ] Social metrics (headcount, turnover, training hours, diversity) collected
- [ ] GRI Content Index generated and references verified
- [ ] Report reviewed by senior leadership and approved for publication

## Common Audit Findings

1. **Materiality process not documented:** GRI 3 requires the materiality determination process to be disclosed, not just the outcome. IMS ESG module records all steps of the materiality process including stakeholder input evidence.

2. **Scope 3 emissions omitted:** Many organisations report only Scope 1 and 2 but are expected to address material Scope 3 categories. Use the IMS Environmental module emission factor database to quantify key Scope 3 categories.

3. **Data not third-party verified:** GRI strongly encourages external assurance. IMS generates an assurance-ready data package with source references and calculation methodology for each disclosure.

## Useful Resources

- GRI Standards: globalreporting.org/standards
- GHG Protocol Corporate Standard
- GSSB (Global Sustainability Standards Board) — GRI governance body
`,
  },
  {
    id: 'KB-CG2-009',
    title: 'TCFD Climate Risk Disclosure in IMS',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['compliance', 'tcfd', 'climate-risk', 'esg'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# TCFD Climate Risk Disclosure in IMS

## Overview

The Task Force on Climate-related Financial Disclosures (TCFD) framework provides recommendations for disclosing climate-related risks and opportunities in mainstream financial filings. TCFD disclosures are now mandatory or expected in an increasing number of jurisdictions (UK: mandatory for large companies and financial institutions; EU: integrated into CSRD; ISSB IFRS S2 aligned to TCFD).

The framework is structured around four pillars: Governance, Strategy, Risk Management, and Metrics & Targets.

## Key Requirements

**Governance:**
- Board oversight of climate-related risks and opportunities
- Management's role in assessing and managing climate-related risks

**Strategy:**
- Climate-related risks and opportunities over short, medium, and long time horizons
- Impact on business, strategy, and financial planning
- Scenario analysis (including 2°C or lower scenario)

**Risk Management:**
- Organisation's processes for identifying climate-related risks
- How climate risk management is integrated into overall risk management

**Metrics & Targets:**
- Metrics used to assess climate-related risks (Scope 1, 2, 3 GHG emissions)
- Climate-related targets and performance against targets

## IMS Module Mapping

| TCFD Pillar / Requirement | IMS Module | Feature |
|---|---|---|
| Board governance evidence | Management Review | Climate governance agenda items and minutes |
| Climate risk identification | Risk | Climate risk register (physical + transition) |
| Scenario analysis documentation | ESG / Risk | Scenario analysis template and records |
| Scope 1 emissions | Environmental Monitoring | Direct emission source inventory |
| Scope 2 emissions | Energy Monitoring | Electricity consumption + grid emission factors |
| Scope 3 emissions | ESG | Scope 3 category inventory |
| Climate targets | ESG / KPI | Net zero / science-based target tracking |
| Financial impact assessment | Finance / Risk | Climate financial risk quantification |

## Evidence Checklist

- [ ] Board-level climate governance documented (board minutes, committee terms of reference)
- [ ] Climate risk register populated with physical and transition risks
- [ ] Time horizon classification applied to each climate risk (short/medium/long)
- [ ] Scenario analysis completed for at least one 1.5°C/2°C scenario
- [ ] Scope 1 and Scope 2 GHG inventory verified
- [ ] Material Scope 3 categories quantified
- [ ] Science-based or net zero targets set and approved
- [ ] Annual progress against climate targets reported
- [ ] TCFD disclosure drafted and reviewed by CFO/Board

## Common Audit Findings

1. **Scenario analysis too qualitative:** Investors expect quantified financial impacts from climate scenarios. Use IMS Risk module to assign financial impact estimates (low/high ranges) to each climate risk identified in scenario analysis.

2. **Scope 3 not addressed:** Scope 3 (supply chain, product use, end-of-life) is often the largest part of an organisation's carbon footprint. IMS ESG module includes Scope 3 category-by-category data collection guided by the GHG Protocol Corporate Value Chain Standard.

3. **Governance evidence sparse:** Board minutes should explicitly reference climate risk agenda items. IMS Management Review module includes a TCFD governance evidence checklist to ensure climate is a standing agenda item.

## Useful Resources

- TCFD Recommendations (2017) and supplemental guidance
- IFRS S2 Climate-related Disclosures (ISSB)
- GHG Protocol Corporate Value Chain (Scope 3) Standard
- Science Based Targets initiative (SBTi): sciencebasedtargets.org
`,
  },
  {
    id: 'KB-CG2-010',
    title: 'SASB Industry Standards Reporting in IMS',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['compliance', 'sasb', 'esg', 'industry-reporting'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# SASB Industry Standards Reporting in IMS

## Overview

The Sustainability Accounting Standards Board (SASB) Standards — now maintained by the IFRS Foundation alongside the ISSB standards — provide industry-specific metrics for disclosing financially material ESG information to investors. SASB covers 77 industries across 11 sectors. Unlike GRI (which is impact-focused), SASB focuses on ESG information material to investors from a financial performance perspective.

SASB is increasingly integrated into mainstream investor reporting (CDP, Bloomberg ESG, proxy advisors) and aligns with ISSB IFRS S1 and S2.

## Key Requirements

- Identify the correct SASB industry classification for each of your business segments
- Report on the SASB-defined metrics for each applicable industry standard
- Use the SASB technical protocols for metric definitions and calculation methodology
- Disclose the basis of preparation for each metric reported
- For multi-industry organisations, disclose separately for each industry segment

**Key SASB dimensions by sector (examples):**
- Industrials: GHG emissions, energy management, water management, employee health and safety
- Technology: energy management, data privacy, product security, employee diversity
- Financial Services: systemic risk, data security, financial inclusion, ESG integration
- Food & Beverage: GHG emissions, water management, food safety, supply chain sustainability

## IMS Module Mapping

| SASB Topic | IMS Module | Feature |
|---|---|---|
| GHG emissions | Environmental / ESG | Scope 1/2 GHG inventory |
| Energy management | Energy Monitoring | Energy consumption by source |
| Water management | Environmental Monitoring | Water withdrawal and consumption |
| Employee H&S | H&S / Incidents | Injury frequency rates per SASB methodology |
| Data privacy | InfoSec / ISO 42001 | Privacy incidents and controls |
| Supply chain sustainability | Suppliers | Supplier ESG assessments |
| Workforce diversity | HR | Diversity metrics by gender, ethnicity, seniority |
| SASB Content Index | ESG | Auto-generated SASB disclosure index |

## Evidence Checklist

- [ ] SASB industry code(s) identified for each business segment
- [ ] Applicable SASB metrics list compiled for each industry code
- [ ] Data collection processes established for each SASB metric
- [ ] Metric calculations verified against SASB technical protocols
- [ ] Data gaps identified and remediation plan in place
- [ ] SASB Content Index drafted and cross-referenced to disclosure document
- [ ] External assurance obtained (recommended for investor-grade disclosure)

## Common Audit Findings

1. **Wrong industry code selected:** SASB has nuanced industry definitions. A chemicals company may fall under Chemicals, Containers and Packaging, or another sector depending on its primary business. Consult the SASB SICS (Sustainable Industry Classification System) and confirm with your sector analyst.

2. **SASB metrics not aligned with GRI metrics:** Organisations reporting both SASB and GRI sometimes calculate metrics differently for each. Use IMS ESG single-source data to ensure consistency across both frameworks.

3. **Basis of preparation not disclosed:** SASB requires disclosure of how metrics are defined and calculated. IMS ESG generates a methodology annex alongside the SASB Content Index.

## Useful Resources

- SASB Standards: sasb.org/standards
- IFRS Foundation SASB resources: ifrs.org/sustainability-standards
- SASB SICS industry classification
- ISSB IFRS S1 (General Requirements for Disclosure)
`,
  },
  {
    id: 'KB-CG2-011',
    title: 'ISO 22000 / FSSC 22000 Food Safety Compliance',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['compliance', 'iso-22000', 'fssc-22000', 'food-safety', 'haccp'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# ISO 22000 / FSSC 22000 Food Safety Compliance

## Overview

ISO 22000:2018 specifies requirements for a Food Safety Management System (FSMS) applicable to all organisations in the food chain. FSSC 22000 (Version 6) is a certification scheme that builds on ISO 22000 by adding sector-specific prerequisite requirements and FSSC additional requirements. FSSC 22000 is recognised by the Global Food Safety Initiative (GFSI) and is widely required by major retailers and food manufacturers.

## Key Requirements

**ISO 22000 core requirements:**
- HACCP study and HACCP plan (based on Codex Alimentarius principles)
- Prerequisite Programmes (PRPs) — Good Manufacturing Practices
- Operational Prerequisite Programmes (OPRPs) — controls for significant hazards not covered by CCPs
- Hazard analysis covering biological, chemical, physical, and (new in 2018) radiological hazards
- Food safety team competency and training
- Traceability system covering ingredients, processing, and finished product
- Emergency preparedness and response for food safety events

**FSSC 22000 additional requirements (v6):**
- Food fraud vulnerability assessment and mitigation plan
- Food defence threat assessment and controls
- Environmental monitoring programme (Listeria, Salmonella for relevant categories)
- Culture survey for food safety culture assessment

## IMS Module Mapping

| Requirement | IMS Module | Feature |
|---|---|---|
| HACCP plan | Food Safety | HACCP plan builder with CCP management |
| PRP management | Food Safety | PRP checklist and verification schedule |
| OPRP controls | Food Safety | OPRP monitoring and deviation management |
| Hazard analysis | Food Safety | Hazard analysis worksheet |
| Allergen management | Food Safety | Allergen register and control plan |
| Traceability | Food Safety | Lot traceability and mock recall |
| Food safety incidents | Incidents | Food safety incident workflow |
| Food fraud vulnerability | Food Safety | VACCP assessment tool |
| Food defence | Food Safety | TACCP threat assessment |
| Environmental monitoring | Environmental Monitoring | Pathogen monitoring programme |
| Supplier qualification | Suppliers | Food-grade supplier approval process |
| Training | Training Tracker | Food safety training records |

## Evidence Checklist

- [ ] HACCP plan documented, validated, and verified
- [ ] All CCPs monitored with records at defined frequency
- [ ] CCP deviation records and corrections documented
- [ ] PRP programme documented and verification schedule active
- [ ] Allergen risk assessment and control plan current
- [ ] Mock recall exercise completed within 12 months (trace within 4 hours)
- [ ] Food fraud vulnerability assessment (VACCP) completed
- [ ] Food defence threat assessment (TACCP) completed
- [ ] Environmental monitoring programme (where applicable) active
- [ ] Food safety culture survey conducted (FSSC v6 requirement)

## Common Audit Findings

1. **CCP monitoring records incomplete:** CCP monitoring records must be signed by the operator and verified by a supervisor at defined intervals. IMS Food Safety module enforces dual-sign-off on CCP records and flags any gaps.

2. **Mock recall not achieving the 4-hour target:** GFSI schemes require traceability within 4 hours forward and backward. IMS traceability module supports rapid lot tracing from raw material to finished product and customer.

3. **Allergen cross-contact risk not assessed:** Allergen management must go beyond labelling to cover shared equipment, scheduling, and cleaning validation. IMS allergen matrix tracks cross-contact risk for each product line.

## Useful Resources

- ISO 22000:2018 standard
- FSSC 22000 Version 6 scheme documents: fssc22000.com
- Codex Alimentarius HACCP guidelines
- GFSI benchmarked schemes overview: mygfsi.com
`,
  },
  {
    id: 'KB-CG2-012',
    title: 'Modern Slavery Act Compliance in IMS',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['compliance', 'modern-slavery', 'supply-chain', 'human-rights'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Modern Slavery Act Compliance in IMS

## Overview

The UK Modern Slavery Act 2015 (MSA) and the Australian Modern Slavery Act 2018 require organisations above specified revenue thresholds to produce an annual Modern Slavery Statement disclosing the steps taken to identify and address modern slavery risks in their operations and supply chains. Similar legislation is emerging in the EU (Corporate Sustainability Due Diligence Directive — CS3D) and other jurisdictions.

IMS Supply Chain Risk and Supplier modules support the due diligence and evidence collection required for Modern Slavery Act compliance.

## Key Requirements

**UK MSA mandatory reporting areas (6 areas per government guidance):**
1. Organisation structure, business, and supply chains
2. Policies in relation to slavery and human trafficking
3. Due diligence processes in business and supply chains
4. Risk assessment and management
5. Key performance indicators measuring effectiveness
6. Training available to staff

**Australian MSA mandatory criteria (7 mandatory criteria for all entities):**
Including risk identification, risk mitigation actions, and effectiveness assessment.

## IMS Module Mapping

| Requirement | IMS Module | Feature |
|---|---|---|
| Supply chain mapping | Supply Chain Risk | Tier 1 and tier 2 supplier mapping |
| Supplier questionnaire | Suppliers | Modern slavery due diligence questionnaire |
| Risk assessment | Risk / Supply Chain Risk | Modern slavery risk scoring by supplier/country |
| High-risk identification | Supply Chain Risk | Country/sector risk heat map |
| Policy management | Document Control | Modern slavery and human rights policy |
| Training | Training Tracker | Modern slavery awareness training records |
| Remediation actions | CAPA | Remediation action tracking |
| Annual statement | ESG | Modern Slavery Statement template and drafting tool |

## Evidence Checklist

- [ ] Supply chain map completed to at least tier 1 (tier 2 for high-risk categories)
- [ ] Modern slavery questionnaire sent to all tier 1 suppliers; responses recorded
- [ ] Risk assessment completed using country risk indices (e.g. Global Slavery Index) and sector risk
- [ ] High-risk suppliers identified and enhanced due diligence underway
- [ ] Modern slavery policy published and communicated to all staff
- [ ] Modern slavery training completed by relevant staff (procurement, supply chain, HR)
- [ ] Remediation actions documented for any identified concerns
- [ ] Annual statement drafted, reviewed by board, and signed by director
- [ ] Statement published on company website and submitted to government registry (Australia)

## Common Audit Findings

1. **Statement not approved at board level:** The UK MSA requires the statement to be approved by the board of directors and signed by a director (or equivalent). IMS ESG statement workflow includes a board approval step.

2. **Questionnaire responses not followed up:** Sending questionnaires is not sufficient — non-responses and concerning responses must be followed up. IMS Supplier module tracks response rates and flags overdue and concerning responses.

3. **No KPIs for effectiveness:** Both UK and Australian acts expect organisations to measure effectiveness. Establish KPIs in IMS (e.g. % suppliers assessed, % high-risk suppliers with action plans, training completion rate) and report against them in the statement.

## Useful Resources

- UK Modern Slavery Act 2015 guidance: gov.uk/guidance/modern-slavery-how-to-report
- Australian Modern Slavery Act 2018: modernslaveryregister.gov.au
- Global Slavery Index: walkfree.org/global-slavery-index
- UN Guiding Principles on Business and Human Rights
`,
  },
  {
    id: 'KB-CG2-013',
    title: 'ISO 55001 Asset Management Compliance',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['compliance', 'iso-55001', 'asset-management'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# ISO 55001 Asset Management Compliance

## Overview

ISO 55001:2014 specifies requirements for an Asset Management System (AMS) and is applicable to any organisation that manages physical assets. It is part of the ISO 55000 series (ISO 55000 overview, ISO 55001 requirements, ISO 55002 guidance). ISO 55001 is aligned to the Annex SL high-level structure and integrates well with ISO 9001, ISO 14001, and ISO 45001. Certification demonstrates systematic and sustainable asset management aligned to organisational objectives.

## Key Requirements

- Strategic Asset Management Plan (SAMP) aligned to organisational objectives
- Asset Management Policy and Objectives
- Asset management plans for each asset or asset group
- Risk-based approach to asset maintenance and investment decisions
- Life cycle management: acquisition → operation → maintenance → disposal
- Performance monitoring: asset reliability, availability, OEE, maintenance KPIs
- Continual improvement of the asset management system
- Financial management of assets (lifecycle cost analysis, capital investment planning)
- Asset register maintained and current

## IMS Module Mapping

| Requirement | IMS Module | Feature |
|---|---|---|
| Asset register | Asset Management | Comprehensive asset register with attributes |
| SAMP documentation | Document Control | SAMP template |
| Asset management plans | CMMS | Maintenance plan builder per asset |
| Risk-based maintenance | Risk / CMMS | Asset risk assessment linked to maintenance schedule |
| Lifecycle management | Asset Management | Asset lifecycle stage tracking |
| Preventive maintenance | CMMS | PM schedule and work order management |
| Equipment calibration | Equipment Calibration | Calibration schedule and records |
| Reliability KPIs | Analytics / KPI | MTBF, MTTR, OEE, availability dashboards |
| Asset cost management | Finance / CMMS | Lifecycle cost tracking per asset |
| Internal audit | Audit Management | ISO 55001 audit checklist |

## Evidence Checklist

- [ ] SAMP documented and approved by top management
- [ ] Asset register complete, current, and includes critical asset designation
- [ ] Asset management plans in place for all critical assets
- [ ] Risk-based maintenance decisions documented for critical assets
- [ ] PM schedule 100% current (no past-due PMs beyond tolerance)
- [ ] Reliability KPIs monitored (MTBF, MTTR, OEE) and trend data available
- [ ] Calibration schedule current for all measurement equipment
- [ ] Lifecycle cost analysis completed for capital-intensive assets
- [ ] Internal audit of AMS conducted against ISO 55001

## Common Audit Findings

1. **Asset register not current:** Assets added or disposed of without updating the register. IMS Asset Management integrates with the CMMS work order system — asset status is automatically updated when a decommissioning work order is completed.

2. **Maintenance decisions not risk-based:** ISO 55001 requires that maintenance strategy decisions consider asset criticality and consequence of failure. Use IMS CMMS risk-based maintenance module to document the failure mode analysis and maintenance strategy rationale for each critical asset.

3. **SAMP not linked to business plan:** The SAMP must be aligned to organisational objectives. IMS links SAMP objectives to the KPI Dashboard where progress against targets is monitored quarterly.

## Useful Resources

- ISO 55001:2014 standard
- ISO 55002:2018 — Asset Management System guidance
- Institute of Asset Management (IAM): theiam.org
- Global Forum on Maintenance and Asset Management (GFMAM)
`,
  },
  {
    id: 'KB-CG2-014',
    title: 'ISO 28000 Supply Chain Security Compliance',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['compliance', 'iso-28000', 'supply-chain-security'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# ISO 28000 Supply Chain Security Compliance

## Overview

ISO 28000:2022 specifies requirements for a Supply Chain Security Management System (SCSMS). It provides a framework for organisations to identify, assess, and mitigate threats to their supply chain security, including theft, piracy, terrorism, smuggling, and cargo tampering. ISO 28000 is relevant to organisations involved in manufacturing, trading, logistics, freight forwarding, and warehousing. It aligns with Annex SL and integrates with other ISO management system standards.

## Key Requirements

- Supply chain security policy aligned to organisational context
- Identification of internal and external issues affecting supply chain security
- Comprehensive threat and risk assessment covering the entire supply chain
- Security controls proportionate to assessed threats
- Incident management and response for supply chain security events
- Business continuity planning for supply chain disruptions
- Security requirements flowed down to supply chain partners
- Monitoring and measurement of security performance
- Internal audit and management review of the SCSMS

## IMS Module Mapping

| Requirement | IMS Module | Feature |
|---|---|---|
| Threat and risk assessment | Supply Chain Risk | Supply chain threat assessment template |
| Supplier security requirements | Suppliers | Security due diligence questionnaire |
| Security incident management | Incidents | Supply chain security incident type |
| Business continuity | Business Continuity | Supply chain BC plan template |
| Supply chain mapping | Supply Chain Risk | Tier mapping and risk heat map |
| Security controls register | InfoSec / Risk | Security control register with supply chain scope |
| Performance monitoring | KPI Dashboard | Supply chain security KPIs |
| Internal audit | Audit Management | ISO 28000 audit checklist |

## Evidence Checklist

- [ ] Supply chain security policy documented and communicated
- [ ] Supply chain threat and risk assessment completed
- [ ] Security controls implemented and documented for significant threats
- [ ] Security requirements included in supplier contracts and questionnaires
- [ ] Supply chain security incident procedure tested
- [ ] Business continuity plan covering critical supply chain disruptions
- [ ] Internal audit of SCSMS conducted
- [ ] Management review covering supply chain security performance

## Common Audit Findings

1. **Threat assessment not updated after supply chain changes:** New suppliers, routes, or geographies change the threat profile. IMS Supply Chain Risk module triggers a threat assessment review when a new supplier is added or a supplier risk rating changes.

2. **Security requirements not flowed to subcontractors:** ISO 28000 expects security requirements to be communicated to relevant supply chain partners. IMS Supplier module includes a security requirements acknowledgement workflow for onboarding new suppliers.

3. **No supply chain incident response plan:** Organisations often have general incident plans but not specific supply chain security scenarios. IMS Business Continuity module includes a supply chain disruption plan template covering cargo theft, port closure, and logistics partner failure.

## Useful Resources

- ISO 28000:2022 standard
- C-TPAT (Customs-Trade Partnership Against Terrorism) — US customs security programme
- AEO (Authorised Economic Operator) — EU customs security scheme
- World Customs Organization SAFE Framework of Standards
`,
  },
  {
    id: 'KB-CG2-015',
    title: 'UK PSSR (Pressure Systems Safety Regulations) Compliance',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['compliance', 'pssr', 'pressure-systems', 'engineering', 'safety'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# UK PSSR (Pressure Systems Safety Regulations) Compliance

## Overview

The Pressure Systems Safety Regulations 2000 (PSSR) apply to pressure systems used at work in Great Britain. They require users and owners of pressure systems to manage the risks associated with their safe use, primarily through a Written Scheme of Examination (WSE) and periodic examination by a competent person (typically a specialist engineering inspection body).

PSSR applies to steam systems, compressed air systems, pressurised process plant, refrigeration systems, and other systems containing relevant fluids above the PSSR threshold pressures.

## Key Requirements

- **Written Scheme of Examination (WSE):** A documented scheme specifying which parts of the system require examination, the nature of the examination, and the interval between examinations. The WSE must be drawn up or certified by a competent person before the system is operated.
- **Periodic examination:** The competent person must examine the system at intervals not exceeding those specified in the WSE.
- **Examination reports:** The competent person must provide a written report after each examination. Defects must be remedied within specified timescales.
- **Defect remediation:** Where a defect that could give rise to danger is found, the system must not be operated until the defect is remedied.
- **System diagram:** A current, accurate diagram of the pressure system must be maintained.
- **Safe operating limits:** Documented safe operating limits (SOLs) must be established and communicated to operators.
- **Maintenance:** Adequate maintenance must be provided to prevent danger.

## IMS Module Mapping

| Requirement | IMS Module | Feature |
|---|---|---|
| Written Scheme of Examination | Document Control | WSE document with version control |
| Examination scheduling | CMMS | Statutory inspection schedule per system |
| Examination records | CMMS / Equipment Calibration | Inspection report attachment and records |
| Defect management | CMMS | Defect work order with PSSR priority flag |
| System diagrams | Document Control | Engineering drawing document type |
| Safe operating limits | Asset Management | SOL record per pressure system |
| Maintenance records | CMMS | Preventive and corrective maintenance records |
| Competent person records | Suppliers / HR | Inspection body qualifications and approval |

## Evidence Checklist

- [ ] Written Scheme of Examination in place for all PSSR-applicable systems
- [ ] WSE drawn up or certified by a competent person
- [ ] Examination schedule current — all examinations within WSE intervals
- [ ] All examination reports on file (must be retained for life of system)
- [ ] Defects from last examination remedied within specified timescale
- [ ] System diagrams current and accurate
- [ ] Safe operating limits documented and communicated to operators
- [ ] Operator instructions and training records in place
- [ ] No system operated with outstanding dangerous defects

## Common Audit Findings

1. **Examination dates overdue:** PSSR requires examinations within WSE intervals. IMS CMMS generates an automatic alert 60 days before the examination due date and escalates if the examination is not booked within 30 days of the due date.

2. **Defect remediation not tracked:** Examination reports list defects with required remediation timescales. IMS CMMS automatically creates a work order for each defect, linked to the examination report, with the deadline from the report.

3. **System diagram not current:** PSSR requires an accurate current diagram. IMS Document Control links the system diagram to the asset record in the CMMS so that change management triggers a diagram update review.

## Useful Resources

- Pressure Systems Safety Regulations 2000 (SI 2000/128)
- HSE PSSR Approved Code of Practice (ACOP L122)
- HSE PSSR guidance: hse.gov.uk/pressure-systems
`,
  },
  {
    id: 'KB-CG2-016',
    title: 'REACH and RoHS Compliance Management in IMS',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['compliance', 'reach', 'rohs', 'chemicals', 'eu'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# REACH and RoHS Compliance Management in IMS

## Overview

**REACH** (Registration, Evaluation, Authorisation and Restriction of Chemicals — Regulation EC 1907/2006) is the EU chemical regulation requiring manufacturers and importers to register chemicals, assess risks, and communicate safe use. A key obligation for downstream users is tracking Substances of Very High Concern (SVHC) in articles above 0.1% w/w and notifying customers if SVHC content exceeds this threshold.

**RoHS** (Restriction of Hazardous Substances — Directive 2011/65/EU and amendment 2015/863/EU) restricts the use of ten specific hazardous substances in electrical and electronic equipment (EEE). CE marking of EEE requires RoHS compliance documentation.

## Key Requirements

**REACH requirements for downstream users:**
- Identify SVHCs in articles (>0.1% w/w concentration threshold)
- Notify customers if SVHC content exceeds threshold
- Maintain Safety Data Sheets (SDS) for hazardous substances received
- Comply with authorisation decisions for substances requiring authorisation
- Comply with restriction conditions for restricted substances

**RoHS requirements:**
- Demonstrate compliance with the 10 restricted substances limits (e.g. Lead <1000 ppm, Cadmium <100 ppm, Hexavalent Chromium <1000 ppm)
- Maintain technical documentation including test reports or Material Declarations
- Obtain RoHS compliance declarations from component suppliers
- CE mark EEE products for EU market (includes RoHS compliance)

## IMS Module Mapping

| Requirement | IMS Module | Feature |
|---|---|---|
| Chemical inventory | Chemical Register | Substance register with SVHC flags |
| SVHC tracking | Chemical Register | ECHA SVHC candidate list integration |
| SDS management | Document Control | SDS document library with version alerts |
| Supplier declarations | Suppliers | RoHS/REACH declaration collection workflow |
| Material disclosure | Chemical Register | IMDS / Material Disclosure Report |
| Substance restriction checks | Chemical Register | Restriction database with automatic alerts |
| Authorisation tracking | Chemical Register | Authorisation sunset date monitoring |
| Compliance documentation | Document Control | RoHS technical file management |

## Evidence Checklist

- [ ] Chemical inventory complete for all substances in articles and processes
- [ ] SVHC screening completed against current ECHA candidate list
- [ ] Customer notifications sent where SVHC >0.1% w/w in articles
- [ ] RoHS compliance declarations obtained from all component suppliers
- [ ] RoHS test reports or material declarations in technical file
- [ ] SDS on file for all hazardous substances and reviewed within last 3 years
- [ ] Authorisation sunset dates monitored for any substances requiring authorisation
- [ ] Restrictions compliance verified for all relevant substances

## Common Audit Findings

1. **SVHC candidate list not updated:** ECHA adds new SVHCs to the candidate list twice yearly. IMS Chemical Register has an automatic SVHC update alert when ECHA publishes a new candidate list version, prompting a re-screening.

2. **Supplier declarations not collected for all components:** Many organisations have gaps in supplier RoHS declarations for legacy parts. IMS Supplier module tracks declaration status per part/supplier combination and generates a chaser workflow for missing declarations.

3. **SDS out of date:** SDS must be updated when substance classification changes. IMS Document Control tracks SDS review dates and sends an alert when an SDS has not been reviewed within 3 years.

## Useful Resources

- ECHA REACH guidance: echa.europa.eu/reach
- ECHA SVHC candidate list: echa.europa.eu/candidate-list-table
- EU RoHS Directive 2011/65/EU
- IEC 62321 series — Determination of restricted substances in EEE
- IMDS (International Material Data System): mdsystem.com
`,
  },
  {
    id: 'KB-CG2-017',
    title: 'ISO 31000 Risk Management Framework',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['compliance', 'iso-31000', 'risk-management', 'framework'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# ISO 31000 Risk Management Framework

## Overview

ISO 31000:2018 provides principles and guidelines for risk management. It is a generic framework applicable to any type of organisation and any type of risk across any sector. ISO 31000 is not a certifiable standard but provides internationally recognised best-practice guidance that underpins risk management requirements in many other standards (ISO 9001, ISO 14001, ISO 27001, ISO 45001, etc.).

The 2018 revision emphasises leadership, integration of risk management into all organisational processes, and the iterative nature of the risk management process.

## Key Requirements

**Principles (Clause 4):** Risk management should be integrated, structured, customised, inclusive, dynamic, use best available information, consider human and cultural factors, and support continual improvement.

**Framework (Clause 5):** The framework supports risk management across the organisation:
- Leadership and commitment
- Integration into organisational processes
- Design of the framework
- Implementation
- Evaluation and improvement

**Risk Management Process (Clause 6):**
1. Communication and consultation
2. Scope, context, and criteria
3. Risk identification
4. Risk analysis
5. Risk evaluation
6. Risk treatment
7. Monitoring and review
8. Recording and reporting

## IMS Module Mapping

| ISO 31000 Element | IMS Module | Feature |
|---|---|---|
| Risk context and criteria | Risk | Risk appetite and criteria configuration |
| Risk identification | Risk | Risk register with multiple identification methods |
| Risk analysis | Risk | Qualitative and quantitative risk analysis |
| Risk evaluation | Risk | Risk heat map and priority ranking |
| Risk treatment | Risk | Treatment plan with action tracking |
| Monitoring and review | Risk / KPI | Risk monitoring dashboard and review schedule |
| Recording and reporting | Risk / Analytics | Risk reports and management reporting |
| Communication | Notifications | Risk owner notifications and escalations |

**Risk identification techniques supported in IMS:**
- Structured brainstorming templates
- SWOT analysis template
- PESTLE analysis template
- Bow-tie analysis
- FMEA (linked from Quality module)
- HAZOP (linked from H&S module)

## Evidence Checklist

- [ ] Risk management policy documented and approved
- [ ] Risk appetite and risk criteria defined and communicated
- [ ] Risk register maintained and current for all significant risk areas
- [ ] Risk assessment methodology documented and consistently applied
- [ ] Risk treatment plans in place for all risks rated above tolerance
- [ ] Treatment plan actions tracked to completion with owners and due dates
- [ ] Risk register reviewed at defined intervals (minimum annually; quarterly for high risks)
- [ ] Risk management performance reported to management
- [ ] Risk management process integrated into strategic planning cycle

## Common Audit Findings

1. **Risk appetite not defined:** Many organisations maintain a risk register without having defined their risk appetite and criteria. IMS Risk module includes a risk appetite configuration step that must be completed before the register can be activated.

2. **Risk treatment actions not tracked:** Identifying and rating risks without tracking treatment actions to closure is a common gap. IMS links every risk above tolerance to at least one treatment action with an owner and due date.

3. **Risk register not reviewed regularly:** Risks change over time. IMS automatically flags risks for review based on a review schedule set at creation (e.g. quarterly for High risks, annually for Low risks) and notifies the risk owner.

## Useful Resources

- ISO 31000:2018 standard
- ISO 31004 — Guidance for implementation of ISO 31000
- IRM (Institute of Risk Management): theirm.org
- COSO ERM Framework (complementary US framework)
`,
  },
  {
    id: 'KB-CG2-018',
    title: 'Cyber Essentials / Cyber Essentials Plus Certification',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['compliance', 'cyber-essentials', 'infosec', 'uk'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Cyber Essentials / Cyber Essentials Plus Certification

## Overview

Cyber Essentials is a UK government-backed certification scheme (managed by NCSC) that protects organisations against the most common cyber attacks. It is mandatory for UK government contracts involving handling personal information or certain ICT products/services. Cyber Essentials Plus is an independently-verified enhanced version that includes hands-on technical testing by an accredited assessor.

The scheme covers five technical controls that address the majority of common cyber attack vectors.

## Key Requirements

**Five Technical Controls:**

1. **Firewalls:** Properly configured boundary firewalls and routers to prevent unauthorised access. All unnecessary services and ports must be blocked. Internet-facing services must be explicitly approved.

2. **Secure Configuration:** Systems must be configured securely, with unnecessary user accounts removed, default passwords changed, auto-run features disabled, and unnecessary software removed.

3. **User Access Control:** Access to applications, computers, and networks should be limited to what users need. Administrator accounts should only be used for administrative tasks. Multi-factor authentication (MFA) is required for internet-accessible services (mandatory as of Jan 2022 scheme update).

4. **Malware Protection:** Malware protection must be in place on all devices — either traditional antivirus or application allow-listing. Malware signatures must be updated daily.

5. **Patch Management:** Software and firmware must be updated within 14 days of a security patch being released. Unsupported software (no longer receiving updates) must not be in scope of the assessment boundary.

## IMS Module Mapping

| Control | IMS Module | Feature |
|---|---|---|
| Firewall configuration | InfoSec / Cyber Security | Firewall baseline configuration records |
| Secure configuration baseline | InfoSec | Device configuration standard templates |
| Access control — user accounts | InfoSec | User access review records |
| MFA compliance | InfoSec | MFA policy and enforcement records |
| Malware protection inventory | InfoSec | Endpoint protection status dashboard |
| Patch management | Cyber Security | Patch tracking and compliance dashboard |
| Assessment scope definition | InfoSec | Asset inventory with CE scope tagging |
| Remediation actions | CAPA | CE gap remediation action tracking |

## Evidence Checklist

- [ ] Asset inventory complete for all in-scope devices
- [ ] Boundary firewall rules documented and reviewed
- [ ] Default accounts removed/renamed and default passwords changed on all in-scope systems
- [ ] MFA enabled for all cloud services and internet-accessible systems
- [ ] User access review completed — no unnecessary privileged accounts
- [ ] Antivirus/EDR deployed on all in-scope devices with daily signature updates confirmed
- [ ] Patch scan completed — all devices within 14-day patch window or mitigated
- [ ] Unsupported software removed from scope or mitigated
- [ ] Self-assessment questionnaire (SAQ) completed (Cyber Essentials)
- [ ] Technical verification testing booked with accredited assessor (Cyber Essentials Plus)

## Common Audit Findings

1. **Unpatched software failing the 14-day window:** The most common CE failure is software beyond the 14-day patch deadline. IMS Cyber Security module integrates with vulnerability scan data and highlights assets beyond the 14-day window automatically.

2. **MFA not enabled on all cloud services:** Since January 2022, MFA is mandatory for all internet-accessible services including email, cloud storage, and SaaS applications. IMS InfoSec tracks MFA enablement status per service in the cloud service inventory.

3. **Scope defined too narrowly:** Assessors scrutinise scope definitions. IMS asset inventory with CE scope tagging ensures a defensible and consistent scope definition that includes all relevant devices.

## Useful Resources

- NCSC Cyber Essentials: ncsc.gov.uk/cyberessentials
- IASME Consortium (CE scheme delivery): iasme.co.uk
- Cyber Essentials Requirements for IT Infrastructure (current version)
`,
  },
  {
    id: 'KB-CG2-019',
    title: 'SOC 2 Type II Audit Readiness in IMS',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['compliance', 'soc-2', 'infosec', 'audit', 'usa'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# SOC 2 Type II Audit Readiness in IMS

## Overview

SOC 2 (System and Organisation Controls 2) is a US auditing standard developed by the AICPA. A SOC 2 Type II report covers the design and operating effectiveness of controls over a defined period (typically 6–12 months) based on the Trust Service Criteria (TSC). SOC 2 Type II reports are widely requested by customers (particularly enterprise B2B) and investors as evidence of a service organisation's security, availability, and data privacy controls.

The five TSC: Security (required), Availability, Processing Integrity, Confidentiality, Privacy (optional, chosen based on services provided).

## Key Requirements

**Security (Common Criteria — required for all SOC 2 reports):**
- CC1: Control environment (governance, risk management, HR security)
- CC2: Communication and information (security policies, communication to users)
- CC3: Risk assessment process
- CC4: Monitoring of controls
- CC5: Control activities (logical access, change management, incident response)
- CC6: Logical and physical access controls
- CC7: System operations (capacity monitoring, incident management)
- CC8: Change management
- CC9: Risk mitigation (vendor risk, business continuity)

**Additional criteria for chosen TSC (Availability, Confidentiality, etc.)**

## IMS Module Mapping

| SOC 2 Control Area | IMS Module | Feature |
|---|---|---|
| Risk assessment (CC3) | Risk | Annual risk assessment records |
| Security policies (CC2) | Document Control | Information security policy library |
| Access control (CC6) | InfoSec | Access review records and user provisioning log |
| Change management (CC8) | Change Management | RFC lifecycle and approval records |
| Incident management (CC7) | Incidents | Security incident records and response log |
| Vendor risk (CC9) | Suppliers | Vendor risk assessments |
| Business continuity (CC9) | Business Continuity | BCP and DR test records |
| Audit trail | Audit Trail | Comprehensive system audit log |
| Internal audit (CC4) | Audit Management | SOC 2 control monitoring audit |
| Training (CC1) | Training Tracker | Security awareness training completion |

## Evidence Checklist

- [ ] Policies in place and reviewed within the audit period: InfoSec, Access Control, Change Management, Incident Response, Business Continuity
- [ ] Risk assessment conducted and documented within the audit period
- [ ] User access review completed at least quarterly
- [ ] Privileged access review completed at least quarterly
- [ ] New hire and termination access provisioning records for all employees during audit period
- [ ] Security awareness training completed by all employees during audit period
- [ ] Change management records for all production changes during audit period
- [ ] Security incident records for all incidents during audit period
- [ ] Vendor risk assessments for all critical vendors
- [ ] BCP/DR test conducted and results documented
- [ ] Penetration test conducted within the audit period
- [ ] Audit log demonstrating continuous monitoring during the audit period

## Common Audit Findings

1. **Gaps in access review documentation:** Auditors look for evidence that access reviews were completed at defined intervals throughout the entire audit period. IMS InfoSec module enforces quarterly access review completion with timestamped records.

2. **Change management exceptions not documented:** Auditors check that all production changes went through the formal change process. Emergency changes that bypassed normal approval must be documented with retrospective approval. IMS Change Management includes an emergency change type with mandatory retrospective review.

3. **Vendor risk assessments missing for critical sub-processors:** SOC 2 requires evidence that sub-processors are assessed. IMS Supplier module tags vendors as sub-processors and enforces annual risk assessment completion.

## Useful Resources

- AICPA SOC 2 overview: aicpa-cima.com
- AICPA Trust Service Criteria document
- Cloud Security Alliance (CSA) CAIQ (useful as a companion control framework)
`,
  },
  {
    id: 'KB-CG2-020',
    title: 'ESG Materiality Assessment Process',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['compliance', 'esg', 'materiality', 'sustainability'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# ESG Materiality Assessment Process

## Overview

A materiality assessment identifies and prioritises the ESG topics that are most significant for an organisation's reporting. Different frameworks use different definitions of materiality:

- **Impact materiality (GRI):** Topics where the organisation has a significant impact on the economy, environment, or people (inside-out perspective).
- **Financial materiality (SASB/ISSB):** Topics that have a significant effect on the organisation's financial performance (outside-in perspective).
- **Double materiality (EU CSRD/ESRS):** Both impact materiality and financial materiality must be assessed. A topic is material if it is material from either or both perspectives.

The materiality assessment is the foundation of an ESG report — it determines which topics are disclosed, to what depth, and which data is collected.

## Key Requirements

**Typical materiality assessment process:**

1. **Universe identification:** Compile a long list of potential ESG topics relevant to your sector, using GRI universal standards, SASB industry standards, regulatory requirements, peer benchmarking, and ESG rating agency criteria.

2. **Stakeholder engagement:** Survey and/or interview key stakeholder groups (investors, customers, employees, suppliers, communities, regulators, NGOs) to understand their priorities and concerns.

3. **Internal assessment:** Assess topics from the organisation's perspective — financial risk and opportunity, strategic relevance, operational impact.

4. **Scoring and prioritisation:** Score each topic on impact materiality and financial materiality dimensions. Plot topics on a materiality matrix.

5. **Validation:** Review with senior management and the board. External expert review recommended.

6. **Disclosure:** Publish the list of material topics and the process used in your ESG report.

## IMS Module Mapping

| Materiality Step | IMS Module | Feature |
|---|---|---|
| Topic universe compilation | ESG | Pre-loaded topic library by sector (GRI/SASB aligned) |
| Stakeholder survey | Stakeholder Management | Online survey tool with stakeholder groups |
| Internal scoring | ESG | Impact and financial materiality scoring matrix |
| Materiality matrix | ESG | Auto-generated materiality matrix chart |
| Management review | Management Review | Materiality review agenda template |
| Disclosure preparation | ESG | Material topics list export for report integration |
| Data collection planning | ESG | Data collection task assignment per material topic |

## Evidence Checklist

- [ ] ESG topic universe defined (minimum 30 topics recommended for large organisations)
- [ ] Stakeholder groups identified and engagement method documented
- [ ] Stakeholder survey completed with adequate response rate (target >50 responses)
- [ ] Internal scoring completed by cross-functional leadership team
- [ ] Materiality matrix produced and validated by management
- [ ] List of material topics approved by board or equivalent
- [ ] Management approach documented for each material topic
- [ ] Data collection owners assigned for each material topic

## Common Audit Findings

1. **Materiality assessment not refreshed:** ESG topics evolve — climate regulation, supply chain human rights, and AI ethics have all become more material in recent years. Refresh the materiality assessment every 2 years at minimum, and after significant business changes.

2. **Stakeholder engagement not representative:** Assessors check that the stakeholder universe is broad. IMS Stakeholder Management module includes a stakeholder completeness checker to ensure all key groups (investors, employees, customers, community, regulators) are included.

3. **Double materiality not applied for CSRD reporters:** Organisations subject to the EU Corporate Sustainability Reporting Directive (CSRD) must apply double materiality. IMS ESG module has separate scoring columns for impact materiality and financial materiality, producing a dual-axis materiality matrix compliant with ESRS requirements.

## Useful Resources

- GRI 3:2021 — Material Topics standard
- ESRS 1 (CSRD) — Double materiality guidance
- SASB standards materiality finder: sasb.org/standards/materiality-finder
- AccountAbility AA1000 Stakeholder Engagement Standard
`,
  },
];
