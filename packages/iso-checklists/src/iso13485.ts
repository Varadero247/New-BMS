// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import type { StandardChecklist } from './types';

export const iso13485Checklist: StandardChecklist = {
  standard: 'ISO_13485',
  version: '2016',
  title: 'Medical Devices — Quality Management Systems — Requirements for Regulatory Purposes',
  clauses: [
    // ─────────────────────────────────────────────────────────────────────────
    // Clause 4: Quality Management System
    // ─────────────────────────────────────────────────────────────────────────
    {
      clause: '4.1',
      title: 'General requirements',
      questions: [
        'Has the organization established, documented, implemented, and maintained a QMS in accordance with ISO 13485:2016 and applicable regulatory requirements?',
        'Are the processes needed for the QMS identified, and is their sequence and interaction determined and documented?',
        'Has the organization determined criteria and methods needed to ensure the effective operation and control of these processes?',
        'Where the organization outsources any process that affects product conformity, are controls for such processes defined within the QMS?',
        'Are roles assumed by the organization under applicable regulatory requirements documented in the QMS?',
      ],
      evidence: [
        'QMS manual with process maps showing sequence and interaction of all QMS processes',
        'List of applicable regulatory requirements by market (e.g., EU MDR 2017/745, FDA 21 CFR 820, Health Canada SOR/98-282)',
        'Outsourced process register with risk assessments, supplier quality agreements, and defined controls',
        'Documented roles and responsibilities matrix aligned with regulatory requirements',
      ],
      mandatory: true,
    },
    {
      clause: '4.1.5',
      title: 'Software used in QMS',
      questions: [
        'Has the organization documented procedures for the validation of computer software used in the QMS?',
        'Is such software validated prior to initial use and, as appropriate, after changes to the software or its application?',
        'Is the specific approach and activities associated with software validation and re-validation proportionate to the risk associated with the use of the software?',
        'Are records of software validation activities maintained?',
      ],
      evidence: [
        'Computer software validation (CSV) procedure with risk-based approach documentation',
        'Validation records for all QMS software (ERP, eQMS, LIMS, CAPA systems, etc.) including IQ/OQ/PQ protocols and reports',
        'Software change control records showing re-validation when changes occur',
      ],
      mandatory: true,
    },
    {
      clause: '4.2.1',
      title: 'Documentation requirements — General',
      questions: [
        'Does the QMS documentation include a quality policy and quality objectives?',
        'Does the documentation include a quality manual, documented procedures, documents needed for effective planning and control of processes, and records required by ISO 13485?',
        'Does the documentation include any other documentation specified by applicable regulatory requirements?',
        'Does the organization have a medical device file for each medical device type or medical device family?',
      ],
      evidence: [
        'Quality policy and quality objectives documents with evidence of communication to all personnel',
        'Master document list / document register showing all controlled documents in the QMS',
        'Index of regulatory-required documentation per applicable market authorization',
      ],
      mandatory: true,
    },
    {
      clause: '4.2.2',
      title: 'Quality manual',
      questions: [
        'Does the quality manual include the scope of the QMS, including details of and justification for any exclusion or non-application?',
        'Does the quality manual include or reference the documented procedures established for the QMS?',
        'Does the quality manual describe the interaction between the processes of the QMS?',
        'Does the quality manual outline the structure of documentation used in the QMS?',
      ],
      evidence: [
        'Quality manual with clearly defined QMS scope and any clause exclusions justified per 1.2 of the standard',
        'Process interaction diagram or process map referenced in or included within the quality manual',
        'Documentation hierarchy description (e.g., Level 1: Manual, Level 2: Procedures, Level 3: Work Instructions, Level 4: Records)',
      ],
      mandatory: true,
    },
    {
      clause: '4.2.3',
      title: 'Medical device file',
      questions: [
        'Has the organization established and maintained a medical device file (MDF) for each medical device type or medical device family?',
        'Does the MDF include or reference documents generated to demonstrate conformity to the requirements of ISO 13485 and applicable regulatory requirements?',
        'Does the MDF include a general description of the medical device, its intended use/purpose, and labeling including instructions for use?',
        'Does the MDF include specifications for the product, manufacturing, packaging, storage, handling, and distribution?',
      ],
      evidence: [
        'Medical device file index for each device type/family with cross-references to technical documentation',
        'Device description documents including intended use, indications for use, and contraindications',
        'Design history file (DHF) records referenced within or included in the medical device file',
        'Labeling samples and instructions for use documents within the MDF',
      ],
      mandatory: true,
    },
    {
      clause: '4.2.4',
      title: 'Control of documents',
      questions: [
        'Is there a documented procedure for document control that defines controls for review and approval, updating, identification of changes, availability of relevant versions, legibility and identification, and control of external documents?',
        'Are documents reviewed and approved for adequacy prior to issue?',
        'Is there a process to prevent unintended use of obsolete documents, and are obsolete documents suitably identified if retained for any purpose?',
        'Are documents retained for at least the lifetime of the medical device or as specified by applicable regulatory requirements, but not less than two years from the date of product release?',
      ],
      evidence: [
        'Document control procedure (SOP) with defined approval workflows, revision tracking, and distribution methods',
        'Evidence of document review and approval signatures (physical or electronic) with dates',
        'Obsolete document control records showing identification, segregation, or destruction',
        'Document retention schedule aligned with device lifetime and regulatory requirements (e.g., EU MDR requires 10+ years)',
      ],
      mandatory: true,
    },
    {
      clause: '4.2.5',
      title: 'Control of records',
      questions: [
        'Has the organization documented procedures for the control of records, including defining controls for identification, storage, security and integrity, retrieval, retention time, and disposition?',
        'Are records legible, readily identifiable, and retrievable?',
        'Does the organization retain records for at least the lifetime of the medical device or as specified by applicable regulatory requirements, but not less than two years from the date of product release?',
        'Are confidential health information contained in records protected in accordance with applicable regulatory requirements?',
      ],
      evidence: [
        'Record control procedure specifying identification, storage, protection, retrieval, retention, and disposition methods',
        'Records retention schedule with defined retention periods per record type and applicable regulatory requirements',
        'Evidence of backup and recovery procedures for electronic records (e.g., 21 CFR Part 11 compliance for US market)',
        'Privacy and data protection procedures for records containing personal health information (e.g., HIPAA, GDPR compliance)',
      ],
      mandatory: true,
    },

    // ─────────────────────────────────────────────────────────────────────────
    // Clause 5: Management Responsibility
    // ─────────────────────────────────────────────────────────────────────────
    {
      clause: '5.1',
      title: 'Management commitment',
      questions: [
        'Can top management demonstrate commitment to the development, implementation, and maintenance of the QMS and maintaining its effectiveness?',
        'Has top management communicated the importance of meeting customer, statutory, and regulatory requirements to the organization?',
        'Has top management established quality policy and quality objectives?',
        'Are management reviews conducted at planned intervals?',
        'Does top management ensure the availability of adequate resources?',
      ],
      evidence: [
        'Management review meeting minutes demonstrating active top management participation and decision-making',
        'Communications (memos, town halls, training records) showing dissemination of quality and regulatory obligations',
        'Resource allocation records (budget, headcount, equipment) for QMS activities',
      ],
      mandatory: true,
    },
    {
      clause: '5.2',
      title: 'Customer focus',
      questions: [
        'Has top management ensured that customer requirements are determined and met?',
        'Are applicable regulatory requirements determined and met?',
        'How does the organization collect and use customer feedback to drive improvement?',
      ],
      evidence: [
        'Customer requirements documentation including contract review records and order acceptance procedures',
        'Regulatory requirements matrix showing applicable requirements per market and product',
        'Customer feedback analysis reports, satisfaction surveys, and trend data',
      ],
      mandatory: true,
    },
    {
      clause: '5.3',
      title: 'Quality policy',
      questions: [
        'Is the quality policy appropriate to the purpose of the organization?',
        'Does the quality policy include a commitment to comply with requirements and maintain the effectiveness of the QMS?',
        'Does the quality policy provide a framework for establishing and reviewing quality objectives?',
        'Is the quality policy communicated and understood within the organization?',
        'Is the quality policy reviewed for continuing suitability?',
      ],
      evidence: [
        'Quality policy document signed by top management with evidence of periodic review',
        'Employee awareness records (training, acknowledgments, posting evidence) demonstrating communication of the quality policy',
        'Management review records showing quality policy adequacy review',
      ],
      mandatory: true,
    },
    {
      clause: '5.4',
      title: 'Planning',
      questions: [
        'Are quality objectives established at relevant functions and levels within the organization?',
        'Are quality objectives measurable and consistent with the quality policy?',
        'Is QMS planning carried out to meet general QMS requirements and quality objectives?',
        'Is the integrity of the QMS maintained when changes to the QMS are planned and implemented?',
      ],
      evidence: [
        'Quality objectives register with measurable targets, responsible persons, and timelines',
        'QMS planning documents showing how objectives will be achieved, including resource planning',
        'Change management records for QMS changes demonstrating integrity maintenance',
      ],
      mandatory: true,
    },
    {
      clause: '5.5',
      title: 'Responsibility, authority, and communication',
      questions: [
        'Are responsibilities and authorities defined, documented, and communicated within the organization?',
        'Has top management appointed a management representative with defined authority and responsibility for the QMS?',
        'Are appropriate communication processes established within the organization regarding QMS effectiveness?',
        'Are interrelationships of all personnel who manage, perform, and verify work affecting quality documented?',
      ],
      evidence: [
        'Organizational chart and role descriptions with defined QMS responsibilities and authorities',
        'Management representative appointment letter or record with defined scope of authority',
        'Internal communication records (meetings, bulletins, intranet) regarding QMS performance and effectiveness',
        'Job descriptions with quality-related responsibilities clearly defined',
      ],
      mandatory: true,
    },
    {
      clause: '5.6',
      title: 'Management review',
      questions: [
        'Does top management review the QMS at planned intervals to ensure its continuing suitability, adequacy, and effectiveness?',
        'Does the management review input include results of audits, customer feedback, process performance, product conformity, status of preventive and corrective actions, follow-up from previous reviews, changes that could affect the QMS, and new or revised regulatory requirements?',
        'Does the review include recommendations for improvement and any need for changes to the QMS including quality policy and objectives?',
        'Are management review outputs documented, including decisions related to improvement, resource needs, and changes to the QMS?',
        'Are records of management reviews maintained?',
      ],
      evidence: [
        'Management review schedule and meeting agendas covering all required inputs per 5.6.2',
        'Management review meeting minutes with documented decisions, action items, and resource commitments',
        'Trend analyses and data packages prepared for management review (CAPA status, audit results, complaint trends, process metrics)',
        'Follow-up records showing closure of management review action items',
      ],
      mandatory: true,
    },

    // ─────────────────────────────────────────────────────────────────────────
    // Clause 6: Resource Management
    // ─────────────────────────────────────────────────────────────────────────
    {
      clause: '6.1',
      title: 'Provision of resources',
      questions: [
        'Has the organization determined and provided resources needed to implement and maintain the QMS and maintain its effectiveness?',
        'Are resources provided to meet applicable regulatory requirements and customer requirements?',
        'Is there a process to evaluate and allocate resources for QMS activities?',
      ],
      evidence: [
        'Resource planning documents (annual budgets, staffing plans) aligned with QMS requirements',
        'Evidence of resource adequacy reviews during management review or planning activities',
        'Capital expenditure records for quality-related equipment and infrastructure',
      ],
      mandatory: true,
    },
    {
      clause: '6.2',
      title: 'Human resources',
      questions: [
        'Is personnel performing work affecting product quality competent on the basis of appropriate education, training, skills, and experience?',
        'Has the organization determined the necessary competence for personnel and provided training or other actions to achieve competence?',
        'Is the effectiveness of training evaluated?',
        'Are personnel made aware of the relevance and importance of their activities and how they contribute to achieving quality objectives?',
        'Are records of education, training, skills, and experience maintained?',
      ],
      evidence: [
        'Competency matrix mapping required competencies to roles affecting product quality',
        'Training records (certificates, attendance logs, assessment results) for all quality-affecting personnel',
        'Training effectiveness evaluation records (e.g., post-training assessments, on-the-job evaluations)',
        'Personnel qualification files with education credentials, relevant experience, and ongoing training history',
      ],
      mandatory: true,
    },
    {
      clause: '6.3',
      title: 'Infrastructure',
      questions: [
        'Has the organization determined, provided, and maintained the infrastructure needed to achieve conformity to product requirements?',
        'Does the infrastructure include buildings, workspace, process equipment (hardware and software), and supporting services?',
        'Are documented requirements established for maintenance activities, including their interval, where such activities or lack thereof could affect product quality?',
        'Are records of maintenance activities maintained?',
      ],
      evidence: [
        'Infrastructure requirements documentation including cleanroom classifications, utility specifications, and equipment lists',
        'Preventive maintenance schedules and completed maintenance records for critical equipment',
        'Equipment qualification records (IQ/OQ/PQ) for production and testing equipment',
        'Facility layout drawings and environmental monitoring records',
      ],
      mandatory: true,
    },
    {
      clause: '6.4',
      title: 'Work environment and contamination control',
      questions: [
        'Has the organization determined and managed the work environment needed to achieve conformity to product requirements?',
        'Has the organization documented requirements for health, cleanliness, and clothing of personnel if contact could adversely affect product quality?',
        'If work environment conditions can have an adverse effect on product quality, are there documented requirements for monitoring and controlling these conditions?',
        'Has the organization documented arrangements for the control of contaminated or potentially contaminated product to prevent contamination of other product, the work environment, or personnel?',
        'For sterile medical devices, are documented requirements for contamination control maintained during assembly or packaging processes?',
      ],
      evidence: [
        'Work environment requirements documentation (temperature, humidity, particulate levels, ESD controls)',
        'Gowning and hygiene procedures for cleanroom and controlled environments',
        'Environmental monitoring records (particle counts, temperature/humidity logs, microbial monitoring)',
        'Contamination control procedures and records, including bioburden testing results for sterile devices',
      ],
      mandatory: true,
    },

    // ─────────────────────────────────────────────────────────────────────────
    // Clause 7: Product Realization
    // ─────────────────────────────────────────────────────────────────────────
    {
      clause: '7.1',
      title: 'Planning of product realization',
      questions: [
        'Has the organization planned and developed the processes needed for product realization, consistent with other QMS processes?',
        'Has the organization documented one or more processes for risk management in product realization?',
        'Are records of risk management activities maintained?',
        'Are quality objectives and requirements for the product determined during planning?',
        'Are verification, validation, monitoring, measurement, inspection, test, handling, storage, distribution, and traceability activities specific to the product identified during planning?',
      ],
      evidence: [
        'Product realization quality plans or project plans with defined stages, deliverables, and acceptance criteria',
        'Risk management procedure compliant with ISO 14971 and associated risk management files',
        'Risk management records including hazard analysis, risk estimation, risk evaluation, and risk control verification',
        'Product-specific inspection and test plans',
      ],
      mandatory: true,
    },
    {
      clause: '7.2',
      title: 'Customer-related processes',
      questions: [
        'Has the organization determined requirements specified by the customer, including delivery and post-delivery requirements?',
        'Has the organization determined requirements not stated by the customer but necessary for specified or intended use?',
        'Are applicable statutory and regulatory requirements related to the product determined?',
        'Are requirements reviewed before the organization commits to supply a product, ensuring requirements are defined, resolved, and achievable?',
        'Does the organization maintain effective communication with customers regarding product information, inquiries, contracts, order handling, and customer feedback including complaints?',
      ],
      evidence: [
        'Contract review records demonstrating review of customer requirements before acceptance',
        'Requirements specification documents including regulatory, safety, and performance requirements',
        'Customer communication records and defined communication channels (complaint handling, advisory notices)',
        'Order review and acceptance records with sign-off on ability to meet all stated requirements',
      ],
      mandatory: true,
    },
    {
      clause: '7.3.1',
      title: 'Design and development — General',
      questions: [
        'Has the organization documented procedures for design and development?',
        'Does the design and development process address applicable regulatory requirements?',
        'Has the organization applied risk management to design and development as appropriate?',
      ],
      evidence: [
        'Design and development procedure (SOP) defining phases, deliverables, reviews, and approval requirements',
        'Evidence that regulatory requirements are identified and addressed at each design phase',
        'Risk management integration records within the design and development process',
      ],
      mandatory: true,
    },
    {
      clause: '7.3.2',
      title: 'Design and development planning',
      questions: [
        'Are design and development stages determined and planned?',
        'Are review, verification, and validation activities appropriate to each design stage identified in the plan?',
        'Are responsibilities and authorities for design and development defined?',
        'Are methods to ensure traceability of design and development outputs to design and development inputs documented?',
        'Is the design plan updated as the design and development progresses?',
      ],
      evidence: [
        'Design and development plan with defined phases, milestones, deliverables, resources, and timelines',
        'Design review, verification, and validation schedule linked to design stages',
        'Design team assignment records with defined responsibilities and authorities',
        'Requirements traceability matrix (RTM) linking inputs to outputs, verification, and validation',
      ],
      mandatory: true,
    },
    {
      clause: '7.3.3',
      title: 'Design and development inputs',
      questions: [
        'Are design inputs related to functional, performance, usability, and safety requirements determined and documented?',
        'Do design inputs include applicable regulatory requirements, applicable standards, and outputs from risk management?',
        'Are design inputs reviewed for adequacy and approved?',
        'Are requirements complete, unambiguous, verifiable or validatable, and not conflicting?',
      ],
      evidence: [
        'Design input requirements document with functional, performance, safety, and regulatory requirements',
        'Applicable standards list (e.g., IEC 60601, IEC 62304, ISO 10993) referenced as design inputs',
        'Risk management outputs (from hazard analysis) fed into design input requirements',
        'Design input review and approval records with sign-off',
      ],
      mandatory: true,
    },
    {
      clause: '7.3.4',
      title: 'Design and development outputs',
      questions: [
        'Are design outputs provided in a form suitable for verification against design inputs?',
        'Are design outputs approved prior to release?',
        'Do design outputs meet the input requirements, provide appropriate information for purchasing, production, and servicing, contain or reference product acceptance criteria, and specify characteristics essential for safe and proper use?',
        'Are records of design and development outputs maintained?',
      ],
      evidence: [
        'Design output documents (drawings, specifications, software code, manufacturing procedures) traceable to inputs',
        'Design output review and approval records',
        'Product specifications, acceptance criteria, and labeling requirements documented as design outputs',
        'Design history file (DHF) containing the complete record of design outputs',
      ],
      mandatory: true,
    },
    {
      clause: '7.3.5',
      title: 'Design and development review',
      questions: [
        'Are systematic reviews of design and development performed at suitable stages in accordance with planned arrangements?',
        'Do design reviews evaluate the ability of design results to meet requirements and identify any problems and propose necessary actions?',
        'Do participants in design reviews include representatives of functions concerned with the design stage being reviewed and other specialist personnel?',
        'Are records of design reviews and any necessary actions maintained?',
      ],
      evidence: [
        'Design review meeting minutes with attendee list, issues identified, decisions made, and action items',
        'Design review agenda showing defined review criteria and input documents',
        'Action item tracking records from design reviews showing closure and verification',
        'Evidence of cross-functional participation in design reviews (quality, regulatory, manufacturing, clinical)',
      ],
      mandatory: true,
    },
    {
      clause: '7.3.6',
      title: 'Design and development verification',
      questions: [
        'Has design and development verification been performed in accordance with planned arrangements to ensure design outputs meet design input requirements?',
        'Are verification methods documented, and do they include comparison with similar designs, tests and demonstrations, alternative calculations, or document reviews?',
        'If the intended use requires the device to be connected to or interfaced with other devices, has verification included confirmation that design outputs meet design inputs when connected or interfaced?',
        'Are records of design verification results and any necessary actions maintained?',
      ],
      evidence: [
        'Design verification protocols and reports documenting test methods, acceptance criteria, and results',
        'Requirements traceability matrix showing verification of each design input by one or more design outputs',
        'Test data and analysis records from design verification testing (bench testing, analytical testing)',
        'Verification records for device interoperability and interface compatibility where applicable',
      ],
      mandatory: true,
    },
    {
      clause: '7.3.7',
      title: 'Design and development validation',
      questions: [
        'Has design and development validation been performed in accordance with planned arrangements to ensure the resulting product meets requirements for the specified application or intended use?',
        'Is validation performed on representative product, including initial production units, batches, or their equivalents?',
        'Does validation include clinical evaluation or performance evaluation as required by applicable regulatory requirements?',
        'Are records of design validation results and any necessary actions maintained, including identification of the product validated?',
      ],
      evidence: [
        'Design validation protocols and reports (including simulated-use testing, user studies, or clinical evaluations)',
        'Clinical evaluation report (CER) or clinical investigation results per applicable regulations',
        'Biocompatibility testing reports per ISO 10993 series',
        'Software validation records per IEC 62304 for software as a medical device or software in medical devices',
      ],
      mandatory: true,
    },
    {
      clause: '7.3.8',
      title: 'Design and development transfer',
      questions: [
        'Has the organization documented procedures for the transfer of design and development outputs to manufacturing?',
        'Do the procedures ensure that design and development outputs are verified as suitable for manufacturing before becoming final production specifications?',
        'Is the capability of the production process to meet product specifications verified during transfer?',
        'Are records of design transfer activities and results maintained?',
      ],
      evidence: [
        'Design transfer procedure and plan defining activities, responsibilities, and acceptance criteria',
        'Design transfer records demonstrating production process capability (Cpk studies, process validation results)',
        'Manufacturing documentation package (DMR) verified against design outputs during transfer',
        'Production trial/pilot run records confirming manufacturability of the design',
      ],
      mandatory: true,
    },
    {
      clause: '7.3.9',
      title: 'Control of design and development changes',
      questions: [
        'Are design and development changes identified, documented, and controlled?',
        'Are changes reviewed, verified, validated as appropriate, and approved before implementation?',
        'Does the review of design changes include evaluation of the effect of changes on constituent parts, product already delivered, risk management outputs, and product realization processes?',
        'Are records of design changes, their review, and any necessary actions maintained?',
      ],
      evidence: [
        'Design change control procedure defining change request, impact assessment, approval, and implementation process',
        'Design change records with documented impact assessments (regulatory, risk, clinical, manufacturing)',
        'Updated risk management files reflecting design change impact analysis',
        'Regulatory change notification records where design changes affect product registrations',
      ],
      mandatory: true,
    },
    {
      clause: '7.3.10',
      title: 'Design and development files',
      questions: [
        'Does the organization maintain a design and development file (DHF) for each medical device type or medical device family?',
        'Does the DHF include or reference records generated to demonstrate conformity to the design and development requirements?',
        'Does the DHF include records of design changes and their impact assessments?',
      ],
      evidence: [
        'Design history file (DHF) index or table of contents for each device type/family',
        'DHF containing or referencing all design inputs, outputs, reviews, verification, validation, and transfer records',
        'Design change history within the DHF showing the complete change trail',
      ],
      mandatory: true,
    },
    {
      clause: '7.4',
      title: 'Purchasing',
      questions: [
        'Has the organization documented procedures for ensuring purchased product conforms to specified purchase information?',
        'Are suppliers evaluated and selected based on their ability to supply product in accordance with requirements?',
        'Are criteria for evaluation, selection, monitoring of performance, and re-evaluation of suppliers established?',
        'Does purchasing information describe or reference the product to be purchased, including product specifications, acceptance requirements, procedures, processes, equipment, qualification of personnel, and QMS requirements?',
        'Does the organization ensure the adequacy of specified purchase requirements prior to their communication to the supplier?',
      ],
      evidence: [
        'Supplier qualification procedure and approved supplier list (ASL) with qualification status and classification',
        'Supplier evaluation records including audits, quality agreements, scorecards, and performance monitoring data',
        'Purchase orders with complete purchasing information (specifications, acceptance criteria, regulatory requirements)',
        'Incoming inspection records for purchased products and materials',
      ],
      mandatory: true,
    },
    {
      clause: '7.5.1',
      title: 'Control of production and service provision',
      questions: [
        'Has the organization planned and carried out production and service provision under controlled conditions?',
        'Do controlled conditions include availability of documented procedures and work instructions, availability of monitoring and measuring equipment, implementation of monitoring and measurement, and implementation of defined operations for labeling and packaging?',
        'Are documented requirements for the release, delivery, and post-delivery activities of medical devices established?',
        'Are records maintained for each medical device or batch of medical devices to provide traceability and to identify the amount manufactured and amount approved for distribution?',
      ],
      evidence: [
        'Device master record (DMR) containing or referencing all production specifications, processes, and quality requirements',
        'Manufacturing work instructions and standard operating procedures for all production stages',
        'Device history record (DHR) for each production batch/lot with in-process and final inspection results',
        'Production environment monitoring records (cleanroom conditions, temperature, humidity)',
      ],
      mandatory: true,
    },
    {
      clause: '7.5.2',
      title: 'Cleanliness of product',
      questions: [
        'Has the organization documented requirements for cleanliness of product or contamination control if the product is cleaned prior to sterilization or its use, is supplied non-sterile and must be cleaned prior to use, or cannot be effectively cleaned prior to use and its cleanliness is of significance in use?',
        'Are cleaning validation records maintained for manufacturing processes?',
        'Are process agents removed or limited to specified amounts during manufacturing?',
      ],
      evidence: [
        'Product cleanliness specifications and cleaning process validation records',
        'Cleaning agent residue testing records demonstrating compliance with acceptance criteria',
        'Particulate and bioburden testing records for product cleanliness verification',
      ],
      mandatory: true,
    },
    {
      clause: '7.5.3',
      title: 'Installation activities',
      questions: [
        'If applicable, has the organization documented requirements for medical device installation and acceptance criteria for verification of installation?',
        'If applicable customer or regulatory requirements allow installation by a party other than the organization, are documented requirements for the installation and verification provided?',
        'Are records of installation and verification performed by the organization or its agent maintained?',
      ],
      evidence: [
        'Installation procedure with defined acceptance criteria and verification steps',
        'Installation qualification (IQ) records and site acceptance testing results',
        'Installation records signed by qualified personnel with verification of proper operation',
      ],
      mandatory: true,
    },
    {
      clause: '7.5.4',
      title: 'Servicing activities',
      questions: [
        'If servicing is a specified requirement, has the organization documented servicing procedures, reference materials, and reference measuring procedures?',
        'Are records of servicing activities analyzed and used as a source of feedback?',
        'Is servicing activity feedback incorporated into the complaint handling, risk management, and improvement processes?',
      ],
      evidence: [
        'Service procedures, service manuals, and field service engineer work instructions',
        'Service records including repair histories, parts used, and verification of proper operation post-service',
        'Analysis of service data trends fed into CAPA and risk management systems',
      ],
      mandatory: true,
    },
    {
      clause: '7.5.5',
      title: 'Particular requirements for sterile medical devices',
      questions: [
        'Are records of the sterilization process parameters for each sterilization batch maintained?',
        'Is the sterilization record traceable to each production batch of medical devices?',
        'Are sterile barrier system and packaging process validations documented and maintained?',
      ],
      evidence: [
        'Sterilization batch records with process parameters (time, temperature, pressure, EO concentration, radiation dose)',
        'Sterilization validation records (IQ/OQ/PQ) per applicable standards (ISO 11135, ISO 11137, ISO 17665)',
        'Sterile barrier system validation records per ISO 11607 including seal strength and integrity testing',
        'Lot traceability records linking sterilization batches to production batches',
      ],
      mandatory: true,
    },
    {
      clause: '7.5.6',
      title: 'Validation of processes for production and service provision',
      questions: [
        'Has the organization validated any processes for production and service provision where the resulting output cannot be or is not verified by subsequent monitoring or measurement?',
        'Does the validation demonstrate the ability of these processes to consistently achieve planned results?',
        'Are documented procedures for validation established, including criteria for review and approval, equipment qualification, use of specific methods and procedures, requirements for records, revalidation criteria, and approval of changes?',
        'Are records of process validation activities maintained?',
      ],
      evidence: [
        'Process validation master plan identifying all special processes requiring validation',
        'Process validation protocols and reports (IQ/OQ/PQ) for manufacturing processes (e.g., welding, molding, sealing, bonding)',
        'Ongoing process monitoring data demonstrating continued process capability',
        'Revalidation records triggered by process changes, equipment changes, or periodic revalidation schedules',
      ],
      mandatory: true,
    },
    {
      clause: '7.5.7',
      title:
        'Particular requirements for validation of processes for sterilization and sterile barrier systems',
      questions: [
        'Has the organization validated sterilization processes and sterile barrier system packaging processes prior to implementation and following product or process changes?',
        'Are records of the results and conclusions of validation, and necessary actions from the validation, maintained?',
        'Are sterilization processes revalidated at defined intervals?',
      ],
      evidence: [
        'Sterilization process validation reports per applicable standards (ISO 11135 EO, ISO 11137 radiation, ISO 17665 moist heat)',
        'Sterile barrier system validation reports per ISO 11607-1 and ISO 11607-2',
        'Revalidation schedules and completed revalidation records for sterilization processes',
        'Bioburden testing records and sterility assurance level (SAL) documentation',
      ],
      mandatory: true,
    },
    {
      clause: '7.5.8',
      title: 'Identification',
      questions: [
        'Has the organization documented procedures to identify product by suitable means throughout product realization?',
        'Does the organization identify the product with respect to monitoring and measurement requirements throughout product realization?',
        'Is a unique device identification (UDI) system implemented where required by applicable regulatory requirements?',
      ],
      evidence: [
        'Product identification procedure defining labeling, marking, and tagging methods throughout production',
        'In-process identification records (traveler cards, batch records) showing product status at each stage',
        'UDI assignment records and GUDID/EUDAMED database submissions where applicable',
        'Product status identification records (inspected, accepted, rejected, quarantined, on hold)',
      ],
      mandatory: true,
    },
    {
      clause: '7.5.9',
      title: 'Traceability',
      questions: [
        'Has the organization documented procedures for traceability that define the extent of traceability in accordance with applicable regulatory requirements and the records to be maintained?',
        'For implantable medical devices, does traceability include records of all components, materials, and work environment conditions used, and are distribution records maintained for the name and address of the shipping package consignee?',
        'Can the organization trace a finished device back to raw materials and components and forward from raw materials to delivered finished devices?',
      ],
      evidence: [
        'Traceability procedure defining scope, methods, and records required for full forward and backward traceability',
        'Lot/batch traceability records demonstrating linkage from raw materials through finished goods to distribution',
        'Distribution records for implantable devices including consignee name, address, lot/serial numbers, and quantities',
        'Mock recall records demonstrating the effectiveness of the traceability system',
      ],
      mandatory: true,
    },
    {
      clause: '7.5.11',
      title: 'Preservation of product',
      questions: [
        'Has the organization documented procedures for the preservation of conformity of product to requirements during processing, storage, handling, and distribution?',
        'Does preservation apply to the constituent parts of a medical device?',
        'Does the organization protect product from alteration, contamination, or damage when exposed to expected conditions and hazards during processing, storage, handling, and distribution?',
        'If the product has a limited shelf life or requires special storage conditions, are these conditions controlled and recorded?',
      ],
      evidence: [
        'Product preservation procedures for handling, storage, packaging, and distribution',
        'Warehouse and storage condition monitoring records (temperature, humidity, cleanliness)',
        'Shelf-life and stability study data supporting assigned product expiration dates',
        'Shipping validation records demonstrating product integrity during transportation',
      ],
      mandatory: true,
    },
    {
      clause: '7.6',
      title: 'Control of monitoring and measuring equipment',
      questions: [
        'Has the organization determined the monitoring and measurement to be undertaken and the equipment needed to provide evidence of conformity of product to determined requirements?',
        'Is measuring equipment calibrated or verified at specified intervals against measurement standards traceable to international or national measurement standards?',
        'Has the organization documented procedures for the validation of software used for monitoring and measurement of requirements?',
        'Are records of calibration and verification results maintained?',
        'Is the validity of previous measurement results assessed when equipment is found not to conform to requirements?',
      ],
      evidence: [
        'Calibration program with master equipment list, calibration intervals, and calibration status records',
        'Calibration certificates traceable to NIST or equivalent national standards',
        'Out-of-calibration investigation records with impact assessments on previously measured product',
        'Software validation records for test and measurement software applications',
      ],
      mandatory: true,
    },

    // ─────────────────────────────────────────────────────────────────────────
    // Clause 8: Measurement, Analysis, and Improvement
    // ─────────────────────────────────────────────────────────────────────────
    {
      clause: '8.1',
      title: 'General',
      questions: [
        'Has the organization planned and implemented the monitoring, measurement, analysis, and improvement processes needed to demonstrate conformity of the medical device, ensure conformity of the QMS, and maintain the effectiveness of the QMS?',
        'Are the applicable methods, including statistical techniques and the extent of their use, determined?',
        'Are measurement, analysis, and improvement activities documented and appropriate to the risk class of the device?',
      ],
      evidence: [
        'Quality plan or procedure defining monitoring, measurement, analysis, and improvement activities',
        'Statistical methods used for quality data analysis (e.g., SPC, trend analysis, capability studies)',
        'Key performance indicator (KPI) dashboards and metrics tracking QMS effectiveness',
      ],
      mandatory: true,
    },
    {
      clause: '8.2.1',
      title: 'Feedback',
      questions: [
        'Has the organization documented procedures for a feedback system to provide early warning of quality problems and for input into the corrective and preventive action and management review processes?',
        'Does the feedback system include provisions for gathering data from production as well as post-production activities?',
        'Is the information gathered in the feedback system used as a potential input for risk management and product realization or improvement processes?',
        'If applicable regulatory requirements require gathering specific experience from post-production activities, does the feedback process address this?',
      ],
      evidence: [
        'Post-market surveillance (PMS) procedure and plan per applicable regulations (EU MDR Article 83-86)',
        'Post-market surveillance reports (PMSR) or periodic safety update reports (PSUR) as applicable',
        'Trend analysis of feedback data including product performance, customer complaints, and adverse events',
        'Records showing feedback data input into risk management and CAPA processes',
      ],
      mandatory: true,
    },
    {
      clause: '8.2.2',
      title: 'Complaint handling',
      questions: [
        'Has the organization documented procedures for the timely handling of complaints in accordance with applicable regulatory requirements?',
        'Do complaint handling procedures include requirements for receiving and recording complaints, evaluating whether feedback constitutes a complaint, investigating complaints, determining the need to report information to appropriate regulatory authorities, handling complaint-related product, and determining the need for corrective or preventive actions?',
        'If any complaint is not investigated, is the justification documented?',
        'Are records of complaint handling maintained, including investigation results, rationale for non-investigation, and any CAPA initiated?',
      ],
      evidence: [
        'Complaint handling procedure (SOP) with defined timelines, roles, investigation methodology, and escalation criteria',
        'Complaint log/database with records of all complaints received, investigated, and resolved',
        'Complaint investigation records with root cause analysis, risk impact assessment, and CAPA references',
        'Trending reports showing complaint analysis by product, type, and severity',
      ],
      mandatory: true,
    },
    {
      clause: '8.2.3',
      title: 'Reporting to regulatory authorities',
      questions: [
        'Has the organization documented procedures for reporting to regulatory authorities as required by applicable regulations?',
        'Are criteria for reportability defined in accordance with applicable regulations (e.g., FDA MDR, EU vigilance, MedWatch)?',
        'Are records of reporting to regulatory authorities maintained?',
        'Is there a process to identify and report adverse events, field safety corrective actions, and device-related deaths or serious injuries within regulatory timeframes?',
      ],
      evidence: [
        'Medical device reporting (MDR) procedure with defined reportability criteria per applicable regulations',
        'Regulatory reporting records (FDA MedWatch 3500A, EU Vigilance reports, FSCA notices)',
        'Adverse event evaluation records with reportability determination rationale',
        'Timeliness tracking records demonstrating reporting within regulatory deadlines (e.g., 30 days for FDA MDR, 15 days for serious public health threats under EU MDR)',
      ],
      mandatory: true,
    },
    {
      clause: '8.2.4',
      title: 'Internal audit',
      questions: [
        'Has the organization documented a procedure for internal audits to determine whether the QMS conforms to planned arrangements, ISO 13485 requirements, QMS requirements established by the organization, and applicable regulatory requirements?',
        'Is an audit program planned, considering the status and importance of the processes and areas to be audited, as well as the results of previous audits?',
        'Are audit criteria, scope, interval, methods, and auditor selection defined to ensure objectivity and impartiality?',
        'Does management responsible for the area being audited ensure that corrections and corrective actions are taken without undue delay?',
        'Are records of audits and their results maintained?',
      ],
      evidence: [
        'Internal audit procedure (SOP) defining audit planning, execution, reporting, and follow-up requirements',
        'Annual internal audit schedule/program with risk-based process coverage',
        'Internal audit reports with findings, observations, nonconformities, and objective evidence',
        'Corrective action records for audit findings with verified closure and effectiveness checks',
      ],
      mandatory: true,
    },
    {
      clause: '8.2.5',
      title: 'Monitoring and measurement of processes',
      questions: [
        'Does the organization apply suitable methods for monitoring and, where applicable, measurement of QMS processes?',
        'Do these methods demonstrate the ability of the processes to achieve planned results?',
        'When planned results are not achieved, is correction and corrective action taken as appropriate?',
      ],
      evidence: [
        'Process performance metrics and KPIs with defined targets and monitoring frequency',
        'Process monitoring records (yield rates, cycle times, scrap rates, first-pass yield)',
        'Corrective action records initiated when process metrics fall below defined thresholds',
      ],
      mandatory: true,
    },
    {
      clause: '8.2.6',
      title: 'Monitoring and measurement of product',
      questions: [
        'Has the organization monitored and measured the characteristics of the medical device to verify that product requirements have been fulfilled?',
        'Is monitoring and measurement carried out at applicable stages of the product realization process in accordance with planned and documented arrangements?',
        'Are records maintained that indicate the person(s) authorizing release of product?',
        'Does product release and service delivery not proceed until all planned arrangements have been satisfactorily completed, unless otherwise approved by a relevant authority and, where applicable, by the customer?',
        'Is the identity of test equipment used for measurement activities recorded?',
      ],
      evidence: [
        'Incoming inspection records for raw materials and components with acceptance/rejection decisions',
        'In-process inspection and testing records at defined stages of production',
        'Final product inspection and testing records (lot release records) with acceptance criteria and results',
        'Release authorization records identifying the personnel who approved product release and test equipment used',
      ],
      mandatory: true,
    },
    {
      clause: '8.3.1',
      title: 'Control of nonconforming product — General',
      questions: [
        'Has the organization documented a procedure to ensure that product that does not conform to requirements is identified and controlled to prevent its unintended use or delivery?',
        'Are the controls, responsibilities, and authorities for the identification, documentation, segregation, evaluation, and disposition of nonconforming product defined?',
        'Is the evaluation of nonconformity conducted including a determination of the need for an investigation and notification of any external party responsible for the nonconformity?',
      ],
      evidence: [
        'Nonconforming product control procedure with defined roles, responsibilities, and material review board (MRB) process',
        'Nonconformance records (NCR/MRB records) with description, investigation, disposition decision, and approval',
        'Physical or systemic segregation evidence for nonconforming product (quarantine areas, inventory status flags)',
      ],
      mandatory: true,
    },
    {
      clause: '8.3.2',
      title: 'Actions in response to nonconforming product detected before delivery',
      questions: [
        'Is nonconforming product dealt with by one or more of the following: correction, segregation/containment/return/suspension, rework, or rejection/scrapping?',
        'When use-as-is or rework disposition is chosen, is the justification documented with concession approval and the impact on the device meeting safety and performance requirements?',
        'Is any concession reported to the appropriate regulatory authority where required?',
      ],
      evidence: [
        'Nonconformance disposition records showing correction, rework, use-as-is concession, or rejection decisions',
        'Concession justification records with risk impact assessment and regulatory notification where applicable',
        'Rework records including rework instructions, re-inspection results, and verification of conformity post-rework',
      ],
      mandatory: true,
    },
    {
      clause: '8.3.3',
      title: 'Actions in response to nonconforming product detected after delivery',
      questions: [
        'When nonconforming product is detected after delivery or use has started, does the organization take action appropriate to the effects of the nonconformity?',
        'Are advisory notices issued when required to alert users and regulatory authorities?',
        'Are records of advisory notices maintained, including actions taken?',
        'Is there a documented procedure for issuing and managing field safety corrective actions (FSCAs) and recalls?',
      ],
      evidence: [
        'Post-delivery nonconformance investigation records with impact assessment and field action decisions',
        'Advisory notice / field safety notice records with content, distribution, and effectiveness verification',
        'Recall procedure and records of any recalls or product removals from the market',
        'Regulatory notification records for field safety corrective actions (e.g., EU vigilance, FDA recall reports)',
      ],
      mandatory: true,
    },
    {
      clause: '8.3.4',
      title: 'Rework',
      questions: [
        'Has the organization documented rework procedures, including taking into account the potential adverse effect of the rework on the product?',
        'Is rework carried out in accordance with documented procedures that have undergone the same review and approval as the original procedure?',
        'After completion of rework, is the product verified to ensure it meets applicable acceptance criteria and regulatory requirements?',
        'Are records of rework maintained?',
      ],
      evidence: [
        'Rework procedures/work instructions reviewed and approved through the document control process',
        'Rework records documenting the rework performed, personnel involved, and re-inspection/re-testing results',
        'Risk assessment records evaluating the impact of rework on product safety and performance',
        'Verification records confirming reworked product meets all acceptance criteria',
      ],
      mandatory: true,
    },
    {
      clause: '8.4',
      title: 'Analysis of data',
      questions: [
        'Has the organization documented procedures to determine, collect, and analyze appropriate data to demonstrate the suitability and effectiveness of the QMS?',
        'Does data analysis include data generated from monitoring and measurement activities and from other relevant sources?',
        'Does the analysis provide information relating to feedback, conformity to product requirements, characteristics and trends of processes and products including opportunities for preventive action, suppliers, and audits?',
        'If the analysis shows the QMS is not suitable, adequate, or effective, is it used as input for improvement?',
      ],
      evidence: [
        'Data analysis procedure defining data sources, collection methods, analysis techniques, and reporting',
        'Quality data analysis reports (complaint trends, CAPA effectiveness, process capability, audit findings)',
        'Statistical trend analysis records demonstrating proactive identification of quality issues',
        'Management review input data packages containing required data analyses',
      ],
      mandatory: true,
    },
    {
      clause: '8.5.1',
      title: 'Improvement — General',
      questions: [
        'Has the organization identified and implemented changes necessary to ensure and maintain the continuing suitability, adequacy, and effectiveness of the QMS and medical device safety and performance?',
        'Are changes implemented through the use of the quality policy, quality objectives, audit results, post-market surveillance, analysis of data, corrective actions, preventive actions, and management review?',
        'Is there a systematic approach to continuous improvement of the QMS?',
      ],
      evidence: [
        'Continuous improvement procedure or framework documentation',
        'Improvement project records with measurable objectives, activities, and results',
        'Management review outputs documenting improvement decisions and resource commitments',
      ],
      mandatory: true,
    },
    {
      clause: '8.5.2',
      title: 'Corrective action',
      questions: [
        'Has the organization documented a procedure for corrective action to eliminate the cause of nonconformities to prevent recurrence?',
        'Does the corrective action procedure include reviewing nonconformities (including complaints), determining the causes of nonconformities, evaluating the need for action to ensure nonconformities do not recur, planning and documenting the action needed, implementing the action, verifying that the action does not adversely affect the medical device, and reviewing the effectiveness of the corrective action taken?',
        'Are corrective actions appropriate to the effects of the nonconformities encountered?',
        'Are records of corrective action investigations and results maintained?',
      ],
      evidence: [
        'Corrective action procedure (SOP) with defined process steps from identification through effectiveness verification',
        'CAPA records with root cause investigation (using tools such as 5 Why, fishbone, fault tree analysis)',
        'Corrective action implementation records with timelines, responsibilities, and completion evidence',
        'Effectiveness verification records demonstrating the corrective action prevented recurrence',
      ],
      mandatory: true,
    },
    {
      clause: '8.5.3',
      title: 'Preventive action',
      questions: [
        'Has the organization documented a procedure for preventive action to eliminate the causes of potential nonconformities to prevent their occurrence?',
        'Does the preventive action procedure include determining potential nonconformities and their causes, evaluating the need for action to prevent occurrence, planning and documenting the action needed, implementing the action, verifying the action does not adversely affect the medical device, and reviewing the effectiveness of the preventive action taken?',
        'Are preventive actions appropriate to the effects of the potential problems?',
        'Are records of preventive action investigations and results maintained?',
      ],
      evidence: [
        'Preventive action procedure (SOP) with proactive risk identification and mitigation steps',
        'Preventive action records with sources of identification (trend analysis, risk assessments, audit observations)',
        'Implementation records showing preventive measures deployed and their impact on reducing risk',
        'Effectiveness verification records confirming the preventive action mitigated the potential nonconformity',
      ],
      mandatory: true,
    },
  ],
};
