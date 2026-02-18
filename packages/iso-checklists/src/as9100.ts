import type { StandardChecklist } from './types';

export const as9100Checklist: StandardChecklist = {
  standard: 'AS9100D',
  version: '2016 Rev D',
  title: 'Quality Management Systems — Requirements for Aviation, Space and Defence Organizations',
  clauses: [
    // ─── Clause 4: Context of the Organization ───────────────────────────
    {
      clause: '4.4.1',
      title: 'Quality Management System and its Processes — Product Safety Risk',
      questions: [
        'Has the organization identified products, services, and processes where product safety risks exist, and established controls to address those risks?',
        'Are product safety requirements flowed down to external providers and communicated to personnel involved in production, inspection, and maintenance?',
        'Does the organization maintain a product safety risk register that is reviewed and updated at defined intervals?',
        'Are lessons learned from product safety events (including near-misses) captured and fed back into the QMS processes?',
      ],
      evidence: [
        'Product safety risk register with risk ratings, mitigations, and review dates',
        'Documented procedures for product safety escalation, notification, and reporting to customers and regulatory authorities',
        'Training records demonstrating product safety awareness for relevant personnel',
      ],
      mandatory: true,
    },

    // ─── Clause 8: Operation ─────────────────────────────────────────────
    {
      clause: '8.1.1',
      title: 'Operational Risk Management',
      questions: [
        'Has the organization established a structured operational risk management process that covers planning, identification, assessment, mitigation, and acceptance of risks throughout the product lifecycle?',
        'Are risk acceptance authorities clearly defined, and do personnel understand the escalation criteria for risks that exceed their authority?',
        'Does the operational risk management process address risks arising from organizational complexity, supply chain dependencies, and technology maturity?',
        'Are risk management outputs (e.g., mitigations, residual risk levels) documented and communicated to affected functions before production or delivery?',
        'Is the effectiveness of risk mitigations monitored and verified, with evidence of corrective action when mitigations prove inadequate?',
      ],
      evidence: [
        'Operational risk management procedure with defined risk categories, scoring methodology, and acceptance criteria',
        'Risk registers for active programs showing risk identification, owner assignment, mitigation plans, and closure evidence',
        'Records of management reviews where operational risk status was assessed and decisions were documented',
        'Examples of risk mitigation effectiveness reviews and any resulting process changes',
      ],
      mandatory: true,
    },
    {
      clause: '8.1.2',
      title: 'Configuration Management',
      questions: [
        'Has the organization established a documented configuration management process that covers identification, control, status accounting, and audit activities?',
        'Are configuration items identified at the appropriate level (hardware, software, documents, specifications) and uniquely numbered with revision control?',
        'Is there a formal change control process requiring impact analysis, approval by authorized personnel, and verification of implementation before releasing configuration changes?',
        'Are configuration status accounting records maintained that provide a complete audit trail from baseline through all approved changes to the current configuration?',
        'Does the organization conduct configuration audits (functional and physical) to verify that the as-built product conforms to the approved configuration documentation?',
      ],
      evidence: [
        'Configuration management plan or procedure defining roles, responsibilities, baselines, and change control board (CCB) membership',
        'Configuration item list with unique identifiers, revision levels, and associated documentation references',
        'Change request records showing impact analysis, approval signatures, implementation verification, and effectivity tracking',
        'Configuration status accounting reports and records of functional/physical configuration audits',
      ],
      mandatory: true,
    },
    {
      clause: '8.1.3',
      title: 'Product Safety Management',
      questions: [
        'Has the organization implemented a formal product safety management process that identifies safety-critical items, processes, and characteristics?',
        'Are safety-critical items clearly identified in design documentation, manufacturing instructions, and inspection records so that personnel can recognize them?',
        'Does the organization ensure that safety-critical characteristics are validated and verified through appropriate testing, inspection, or analysis before product release?',
        'Is there a defined process for reporting product safety issues to customers, regulatory authorities, and airworthiness organizations within required timeframes?',
      ],
      evidence: [
        'Product safety management procedure with criteria for identifying safety-critical items and characteristics',
        'Lists of safety-critical items and key characteristics with traceability to design requirements and verification records',
        'Records of product safety event reporting to customers and authorities (e.g., Service Difficulty Reports, Mandatory Occurrence Reports)',
      ],
      mandatory: true,
    },
    {
      clause: '8.1.4',
      title: 'Prevention of Counterfeit Parts',
      questions: [
        'Has the organization established a counterfeit parts prevention program that addresses awareness, detection, avoidance, mitigation, and disposition?',
        'Are procurement personnel trained to recognize indicators of counterfeit or suspect parts, and are approved procurement sources defined and maintained?',
        'Does the organization perform incoming inspection and testing that is adequate to detect counterfeit parts, including visual inspection, marking verification, and (where appropriate) destructive or non-destructive testing?',
        'Is there a process for quarantine, segregation, reporting, and disposition of detected or suspected counterfeit parts, including notification to affected customers and authorities?',
        'Does the organization flow down counterfeit parts prevention requirements to external providers and verify their compliance?',
      ],
      evidence: [
        'Counterfeit parts prevention procedure covering sourcing controls, detection methods, and reporting obligations',
        'Approved supplier list with documented evaluation criteria that include counterfeit parts prevention capabilities',
        'Incoming inspection records showing verification activities specific to counterfeit detection (e.g., marking verification, certificate validation, XRF testing)',
        'Records of counterfeit part quarantine, investigation, and notification to customers or industry databases (e.g., GIDEP alerts)',
      ],
      mandatory: true,
    },
    {
      clause: '8.3.5.1',
      title: 'Design and Development Outputs — Supplemental (Key Characteristics)',
      questions: [
        'Has the organization identified key characteristics (KCs) during design and development, and are they documented in design output documents such as drawings, specifications, and models?',
        'Are key characteristics classified (e.g., by safety criticality, functional importance) and are the classification criteria documented?',
        'Do production planning and control documents (e.g., manufacturing plans, inspection plans) specifically address the key characteristics identified during design?',
        'Is there a defined process for managing key characteristics through production, including statistical process control or equivalent monitoring where appropriate?',
      ],
      evidence: [
        'Design output documents (drawings, models, specifications) with key characteristics clearly identified and classified',
        'Key characteristics management plan or procedure defining identification, classification, and control methods',
        'Process control plans showing how key characteristics are monitored and controlled during production',
      ],
      mandatory: true,
    },
    {
      clause: '8.4.1',
      title:
        'Control of Externally Provided Processes, Products and Services — Supplemental (Approved Supplier List)',
      questions: [
        'Does the organization maintain an approved supplier list (ASL) or register that documents the scope of approval, approval status, and any limitations for each external provider?',
        'Are criteria for initial evaluation, selection, and ongoing monitoring of external providers defined and documented, including quality performance, delivery performance, and regulatory compliance?',
        'Does the organization ensure that external providers used for special processes (e.g., heat treatment, NDT, surface finishing) hold the required customer or industry approvals (e.g., Nadcap)?',
        'Is there a process for escalation, probation, and removal of external providers from the approved list when performance deteriorates or non-conformances are not addressed?',
      ],
      evidence: [
        'Approved supplier list with approval scope, status, approval dates, and any restrictions or conditions',
        'Supplier evaluation and selection records including initial assessment questionnaires, audit reports, and approval decisions',
        'Supplier performance scorecards or monitoring reports covering quality, delivery, and responsiveness metrics',
        'Records of supplier corrective action requests, probation notices, or removal from the approved list',
      ],
      mandatory: true,
    },
    {
      clause: '8.4.2',
      title: 'Type and Extent of Control — Supplemental (Flow-Down of Requirements)',
      questions: [
        'Does the organization ensure that all applicable customer, statutory, and regulatory requirements are flowed down to external providers in purchasing documents?',
        'Are flow-down requirements verified for completeness before purchase orders are issued, including special requirements such as key characteristics, test specifications, and configuration control?',
        'Does the organization require external providers to flow down applicable requirements to their sub-tier suppliers, and is compliance verified?',
        'When changes occur to customer or regulatory requirements, is there a process to update purchasing documents and notify affected external providers in a timely manner?',
      ],
      evidence: [
        'Purchase orders and contracts showing flow-down of customer, statutory, and regulatory requirements',
        'Checklist or procedure used to verify completeness of requirement flow-down before purchase order release',
        'Evidence of sub-tier flow-down verification (e.g., audit records, supplier self-assessment results)',
      ],
      mandatory: true,
    },
    {
      clause: '8.4.3',
      title: 'Information for External Providers — Supplemental (Right of Access)',
      questions: [
        'Do purchasing documents include provisions granting right of access by the organization, its customers, and regulatory authorities to the applicable areas of the external provider facilities and to relevant records?',
        'Are external providers informed of the obligation to notify the organization of changes to processes, products, or services, and to obtain approval before implementing changes?',
        'Does the organization include requirements for external providers to retain records for the defined retention period and to make them available upon request?',
      ],
      evidence: [
        'Purchase order terms and conditions or quality clauses specifying right of access, change notification, and record retention requirements',
        'Supplier quality manual or agreement acknowledging right of access and change notification obligations',
        'Records of customer or regulatory source inspections conducted at external provider facilities',
      ],
      mandatory: true,
    },
    {
      clause: '8.5.1',
      title: 'Control of Production and Service Provision — Supplemental (FOD Prevention)',
      questions: [
        'Has the organization implemented a Foreign Object Debris/Damage (FOD) prevention program applicable to production, assembly, inspection, testing, and delivery areas?',
        'Are FOD prevention controls defined for each work area, including cleanliness standards, tool accountability, hardware accountability, and personnel practices?',
        'Is FOD awareness training provided to all personnel who work in or access FOD-controlled areas, and are refresher training intervals defined?',
        'Are FOD incidents tracked, investigated for root cause, and addressed through corrective actions?',
        'Does the organization conduct periodic FOD audits or walkdowns of production and assembly areas to verify compliance with FOD prevention requirements?',
      ],
      evidence: [
        'FOD prevention program procedure covering area controls, tool/hardware accountability, cleanliness standards, and training requirements',
        'FOD training records for production, assembly, inspection, and support personnel',
        'FOD incident logs with root cause analysis and corrective action records',
        'FOD audit or walkdown reports with findings and closure evidence',
      ],
      mandatory: true,
    },
    {
      clause: '8.5.1.1',
      title: 'Control of Equipment, Tools, and Software Programs',
      questions: [
        'Does the organization maintain a register of production equipment, tools, jigs, fixtures, and software programs used to control or verify product conformity?',
        'Are equipment and tools validated or qualified before initial use in production, and is re-validation performed after repair, modification, or at defined intervals?',
        'Is there a process for unique identification, storage, periodic inspection, and maintenance of tools and equipment, including customer-owned or loaned tooling?',
        'Are software programs used in production or inspection validated for their intended use, and is version control maintained to prevent unauthorized changes?',
      ],
      evidence: [
        'Equipment and tooling register with identification numbers, locations, calibration/validation status, and ownership',
        'Validation and qualification records for production equipment, tools, and software programs',
        'Maintenance schedules and inspection records for tools, jigs, and fixtures',
        'Software validation records and version control logs for production and inspection software',
      ],
      mandatory: true,
    },
    {
      clause: '8.5.1.2',
      title: 'Validation and Control of Special Processes',
      questions: [
        'Has the organization identified all special processes (i.e., processes where the output cannot be fully verified by subsequent inspection or testing) used in production?',
        'Are special processes validated to demonstrate they are capable of consistently producing conforming output, and are the validation records maintained?',
        'Are personnel performing special processes qualified based on defined competency criteria, and are qualification records current?',
        'Does the organization ensure that special processes performed by external providers are validated and controlled to the same requirements, including holding applicable industry accreditations (e.g., Nadcap)?',
        'Are process parameters for special processes monitored and recorded during production, and are deviations addressed through a defined nonconformance process?',
      ],
      evidence: [
        'List of identified special processes with validation status and applicable specifications',
        'Special process validation records (e.g., process qualification reports, test coupons, destructive test results)',
        'Personnel qualification and certification records for special process operators and inspectors',
        'Nadcap or equivalent accreditation certificates for internal and external special process providers',
      ],
      mandatory: true,
    },
    {
      clause: '8.5.1.3',
      title: 'Production Process Verification',
      questions: [
        'Does the organization perform production process verification (PPV) activities to validate that the production process is capable of producing parts and assemblies that meet requirements?',
        'Are PPV activities performed at planned intervals or triggered by defined events such as new product introduction, process changes, or extended production breaks?',
        'Do PPV activities include verification of production documentation accuracy, equipment setup, first-article or first-piece inspection, and conformity to key characteristics?',
      ],
      evidence: [
        'Production process verification procedure defining triggers, scope, methods, and acceptance criteria',
        'PPV records showing verification activities performed, results, and disposition decisions',
        'First-piece or first-article inspection records generated during PPV activities',
      ],
      mandatory: true,
    },
    {
      clause: '8.5.2',
      title: 'Identification and Traceability — Supplemental (Serial/Lot Traceability)',
      questions: [
        'Does the organization maintain unique identification of products (e.g., serial numbers, lot numbers, batch codes) throughout the production process and into delivered products?',
        'Is traceability maintained from raw material through manufacturing, assembly, inspection, and delivery so that affected products can be identified in the event of a nonconformance or recall?',
        'Are identification and traceability requirements defined in production planning documents, and are methods (marking, labeling, tagging) verified at receiving, in-process, and final inspection?',
        'Can the organization demonstrate the ability to trace a delivered product back to its raw material certifications, processing records, inspection results, and operator/inspector identity?',
      ],
      evidence: [
        'Identification and traceability procedure defining serialization, lot control, and marking requirements',
        'Product traceability records demonstrating complete forward and backward traceability (e.g., from serial number to material certificates and process records)',
        'Traveler or router documents showing identification verified at each stage of production',
        'Material certifications and test reports linked to specific lot or serial numbers',
      ],
      mandatory: true,
    },
    {
      clause: '8.5.4',
      title: 'Preservation — Supplemental (Shelf-Life and Hazardous Materials Handling)',
      questions: [
        'Does the organization have documented controls for the handling, packaging, storage, and preservation of products with limited shelf life, including identification of expiration dates and FIFO (first-in, first-out) controls?',
        'Are hazardous materials (chemicals, sealants, adhesives, composites) stored, handled, and disposed of in accordance with applicable safety data sheets, regulatory requirements, and customer specifications?',
        'Is there a process for periodic inspection of stored items to verify condition, shelf life, and packaging integrity, with disposition of expired or deteriorated materials?',
        'Are packaging and shipping methods validated to protect products from damage, contamination, and environmental degradation (e.g., moisture, static, temperature) during transit and storage?',
      ],
      evidence: [
        'Shelf-life management procedure with FIFO controls, expiration tracking, and disposal records for expired materials',
        'Hazardous material storage area inspection records and Safety Data Sheets (SDS) accessible to personnel',
        'Packaging and preservation specifications for sensitive or critical items (e.g., ESD-sensitive, moisture-sensitive components)',
        'Records of periodic storage area inspections and resulting disposition actions',
      ],
      mandatory: true,
    },
    {
      clause: '8.5.5',
      title:
        'Post-Delivery Activities — Supplemental (In-Service Data and Airworthiness Directives)',
      questions: [
        'Does the organization have a process for collecting, analyzing, and acting upon in-service feedback and reliability data from customers, operators, and regulatory authorities?',
        'Is there a defined process for reviewing and implementing Airworthiness Directives (ADs), Service Bulletins (SBs), and other mandatory continuing airworthiness requirements that affect delivered products?',
        'Does the organization report service-related failures, malfunctions, and defects to customers and regulatory authorities in accordance with applicable requirements (e.g., FAR 21.3, EASA Part 21.A.3)?',
        'Are post-delivery support activities (e.g., spare parts supply, technical publications, warranty management) planned and documented?',
      ],
      evidence: [
        'In-service data collection and analysis procedure, including sources of data (fleet reports, warranty claims, operator feedback)',
        'Records of Airworthiness Directive and Service Bulletin review, applicability determination, and implementation status',
        'Regulatory reporting records for in-service failures, malfunctions, or defects',
        'Post-delivery support plan or agreement defining spare parts, technical support, and warranty obligations',
      ],
      mandatory: true,
    },
    {
      clause: '8.5.6',
      title: 'Control of Changes — Supplemental (Configuration Change Control)',
      questions: [
        'Does the organization have a formal process for controlling changes to production processes, tooling, equipment, and work instructions, including impact analysis and approval before implementation?',
        'Are changes to product configuration managed through the configuration management process (ref. 8.1.2), including change request documentation, change control board review, and implementation verification?',
        'Is there a process for assessing whether a production or configuration change requires customer notification or approval before implementation?',
        'Are change effectivity points (serial numbers, lot numbers, dates) documented and communicated to ensure traceability of pre-change and post-change product?',
      ],
      evidence: [
        'Change control procedure defining change request, impact analysis, approval authority, and verification requirements',
        'Change control board (CCB) meeting minutes or records of change approval decisions',
        'Customer notification and approval records for changes requiring customer consent',
        'Change effectivity records showing serial/lot numbers at which changes were incorporated',
      ],
      mandatory: true,
    },
    {
      clause: '8.6',
      title:
        'Release of Products and Services — Supplemental (First Article Inspection and Certificates of Conformance)',
      questions: [
        'Does the organization perform First Article Inspection (FAI) in accordance with AS9102 for new parts, after design changes, or after significant process changes, and are FAI reports complete and approved before production release?',
        'Are Certificates of Conformance (CofC) or Authorized Release Certificates (e.g., EASA Form 1, FAA 8130-3) issued for delivered products, and do they accurately reflect the released configuration?',
        'Is there a process for partial FAI when only specific characteristics are affected by a change, and are criteria for partial versus full FAI documented?',
        'Are inspection and test records reviewed for completeness and accuracy before product release, including verification that all non-conformances have been dispositioned?',
        'Does the organization retain release records (FAI reports, CofCs, inspection records) for the defined retention period in accordance with customer and regulatory requirements?',
      ],
      evidence: [
        'AS9102 First Article Inspection Reports (Forms 1, 2, and 3) for current production parts',
        'Certificates of Conformance or Authorized Release Certificates issued for delivered products',
        'Procedure defining FAI requirements, triggers for full and partial FAI, and approval criteria',
        'Final inspection and test records with evidence that all nonconformances were dispositioned before release',
      ],
      mandatory: true,
    },
    {
      clause: '8.7',
      title: 'Control of Nonconforming Outputs — Supplemental (Use-As-Is, Material Review Board)',
      questions: [
        'Does the organization have a Material Review Board (MRB) or equivalent authority for disposition of nonconforming product, and are the composition and authority of the MRB defined?',
        'When nonconforming product is dispositioned as "use-as-is" or "repair," is customer (and where required, regulatory authority) concurrence obtained before the disposition is implemented?',
        'Are nonconforming items clearly identified, segregated from conforming product, and documented with details of the nonconformance, investigation, and disposition?',
        'Is scrap identified, controlled, and rendered unusable to prevent inadvertent installation or delivery?',
        'Does the organization analyze nonconformance data for trends and implement corrective actions to address systemic or recurring issues?',
      ],
      evidence: [
        'Material Review Board charter or procedure defining MRB composition, authority, and disposition categories',
        'Nonconformance reports with disposition records, including customer concurrence for use-as-is and repair dispositions',
        'Segregation and identification records for nonconforming product (quarantine areas, tagging, system status)',
        'Trend analysis reports for nonconformances with linked corrective action records',
      ],
      mandatory: true,
    },

    // ─── Clause 9: Performance Evaluation ────────────────────────────────
    {
      clause: '9.1.1',
      title:
        'Monitoring, Measurement, Analysis and Evaluation — Supplemental (Key Performance Indicators)',
      questions: [
        'Has the organization defined Key Performance Indicators (KPIs) for quality, delivery, and safety performance that are aligned with customer and organizational objectives?',
        'Are KPIs measured at defined frequencies, and are targets or thresholds established that trigger investigation and corrective action when not met?',
        'Does the organization use data from KPIs to drive continual improvement actions and to inform management review decisions?',
        'Are product and process performance data (e.g., defect rates, rework rates, scrap rates, escape rates) collected and analyzed to identify trends and improvement opportunities?',
      ],
      evidence: [
        'KPI definitions document listing each metric, its formula, data source, measurement frequency, target, and responsible owner',
        'KPI dashboards or reports showing current performance against targets with trend data',
        'Records of improvement actions initiated based on KPI performance below target',
        'Management review inputs showing KPI data and resulting decisions or actions',
      ],
      mandatory: true,
    },
    {
      clause: '9.1.2',
      title: 'Customer Satisfaction — Supplemental (On-Time Delivery and Quality Performance)',
      questions: [
        'Does the organization monitor on-time delivery (OTD) performance to customer-required dates, and is performance tracked and reported at defined intervals?',
        'Is quality performance to customer expectations measured using metrics such as Defects Per Million Opportunities (DPMO), customer rejection rate, or customer quality escapes?',
        'Does the organization include customer satisfaction data (e.g., scorecards, surveys, complaint trends) as an input to management review?',
        'When customer satisfaction metrics indicate declining performance, is there a defined escalation and recovery process?',
      ],
      evidence: [
        'On-time delivery performance reports showing OTD percentage against customer-required dates',
        'Customer quality performance data (DPMO, rejection rates, escape counts) with trend analysis',
        'Customer scorecards, satisfaction survey results, or formal feedback records',
        'Corrective action and recovery plans initiated in response to declining customer satisfaction metrics',
      ],
      mandatory: true,
    },
    {
      clause: '9.2',
      title: 'Internal Audit — Supplemental (Process-Based Auditing)',
      questions: [
        'Does the internal audit program use a process-based approach that evaluates the effectiveness and interaction of QMS processes rather than solely auditing to individual standard clauses?',
        'Are internal auditors qualified based on defined competency criteria, including knowledge of AS9100D requirements, applicable regulatory requirements, and audit techniques?',
        'Does the audit program consider the importance of processes, changes to the organization, and results of previous audits when determining audit frequency and scope?',
        'Are audit findings tracked to closure with verification of corrective action effectiveness, and are systemic issues identified when findings recur?',
      ],
      evidence: [
        'Internal audit program or schedule showing process-based audit planning with risk-based frequency',
        'Auditor qualification records demonstrating competency in AS9100D, process auditing methodology, and applicable regulations',
        'Internal audit reports documenting process performance, findings, opportunities for improvement, and positive observations',
        'Corrective action records linked to audit findings with effectiveness verification evidence',
      ],
      mandatory: true,
    },
    {
      clause: '9.3',
      title: 'Management Review — Supplemental (On-Time Delivery and DPMO)',
      questions: [
        'Does management review include analysis of on-time delivery performance, quality performance (including DPMO or equivalent), and trends over time?',
        'Are risks identified through operational risk management (ref. 8.1.1), product safety concerns, and nonconformance trends addressed as inputs to management review?',
        'Does management review evaluate the performance of external providers and the effectiveness of the supply chain management process?',
        'Are management review outputs documented and communicated, including decisions on resource allocation, process improvement priorities, and quality objectives?',
        'Does the review include assessment of the effectiveness of actions taken to address risks and opportunities identified in previous reviews?',
      ],
      evidence: [
        'Management review meeting minutes or records showing all required inputs were addressed, including OTD and quality metrics',
        'Management review presentation materials showing DPMO, OTD, customer satisfaction, supplier performance, and risk status data',
        'Action items from management review with owners, due dates, and closure evidence',
        'Records demonstrating that management review outputs were communicated to relevant functions and implemented',
      ],
      mandatory: true,
    },
  ],
};
