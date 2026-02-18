import type { StandardChecklist } from './types';

export const iatf16949Checklist: StandardChecklist = {
  standard: 'IATF_16949',
  version: '2016',
  title:
    'Quality Management System Requirements for Automotive Production and Relevant Service Parts Organizations',
  clauses: [
    // =========================================================================
    // CLAUSE 4: CONTEXT OF THE ORGANIZATION
    // =========================================================================

    // --- ISO 9001 Base Requirements ---
    {
      clause: '4.1',
      title: 'Understanding the organization and its context',
      questions: [
        'Has the organization determined the external and internal issues relevant to its purpose and strategic direction that affect its ability to achieve the intended results of the QMS?',
        'How does the organization monitor and review information about these external and internal issues?',
        'Are issues such as regulatory requirements, technology changes, competitive environment, and market dynamics considered?',
      ],
      evidence: [
        'Strategic planning documents, SWOT analysis, or PESTLE analysis outputs',
        'Management review meeting minutes showing discussion of internal and external issues',
        'Records of monitoring and review activities for context issues',
      ],
      mandatory: true,
    },
    {
      clause: '4.2',
      title: 'Understanding the needs and expectations of interested parties',
      questions: [
        'Has the organization determined the interested parties relevant to the QMS?',
        'Has the organization determined the relevant requirements of these interested parties?',
        'How does the organization monitor and review information about interested parties and their requirements?',
      ],
      evidence: [
        'Documented list of interested parties and their requirements',
        'Customer requirements registers and OEM-specific requirements documentation',
        'Records demonstrating monitoring and review of stakeholder needs',
      ],
      mandatory: true,
    },
    {
      clause: '4.3',
      title: 'Determining the scope of the quality management system',
      questions: [
        'Has the organization determined the boundaries and applicability of the QMS?',
        'Does the scope consider the external and internal issues, the requirements of interested parties, and the products and services of the organization?',
        'Is the scope documented and maintained as documented information?',
        'Where a requirement of ISO 9001/IATF 16949 is determined not applicable, has justification been documented?',
      ],
      evidence: [
        'Documented QMS scope statement specifying products, processes, and sites',
        'Justification records for any exclusions or non-applicable requirements',
        'Quality manual or equivalent documentation defining the QMS scope',
      ],
      mandatory: true,
    },

    // --- IATF 16949 Supplemental Requirements ---
    {
      clause: '4.3.1',
      title: 'Determining the scope of the quality management system - supplemental',
      questions: [
        'Are support functions, whether on-site or remote, included in the scope of the QMS?',
        'Does the scope include all customer-specific requirements?',
        'Has the organization identified and included product safety-related products and manufacturing processes within the QMS scope?',
        'Is the only permitted exclusion under IATF 16949 clause 8.3 (design and development), and only where the organization is not responsible for product design?',
      ],
      evidence: [
        'QMS scope document explicitly referencing support functions (design centers, warehouses, distribution centers)',
        'Product safety identification records for products and processes within scope',
        'Customer-specific requirements matrix linked to QMS scope',
        'Documented justification if clause 8.3 product design exclusion is claimed',
      ],
      mandatory: true,
    },
    {
      clause: '4.3.2',
      title: 'Customer-specific requirements',
      questions: [
        'Has the organization identified and evaluated all customer-specific requirements (CSRs) applicable to its operations?',
        'Are customer-specific requirements included in the scope of the QMS?',
        'How does the organization ensure customer-specific requirements are flowed down to sub-tier suppliers where applicable?',
        'Is there a process to monitor updates to customer-specific requirements from OEMs and Tier 1 customers?',
      ],
      evidence: [
        'Customer-specific requirements register with current revision status for each OEM customer',
        'Gap analysis showing how CSRs are addressed within the QMS',
        'Records of CSR flowdown to supply chain as applicable',
        'Subscription or monitoring process for OEM portals and requirement updates',
      ],
      mandatory: true,
    },
    {
      clause: '4.4',
      title: 'Quality management system and its processes',
      questions: [
        'Has the organization established, implemented, maintained, and continually improved the QMS including the processes needed and their interactions?',
        'Has the organization determined the inputs required and outputs expected, sequence and interaction, criteria, methods, resources, responsibilities, risks, and opportunities for each QMS process?',
        'Does the organization maintain and retain documented information to support process operation and demonstrate conformity?',
      ],
      evidence: [
        'Process maps, turtle diagrams, or SIPOC diagrams for key QMS processes',
        'Process interaction matrix or process landscape',
        'Documented process KPIs, owners, and performance criteria',
      ],
      mandatory: true,
    },
    {
      clause: '4.4.1.1',
      title: 'Conformance of products and processes',
      questions: [
        'Does the organization ensure conformance of all products and processes, including service parts and those that are outsourced, to all applicable customer, statutory, and regulatory requirements?',
        'How does the organization verify that outsourced processes meet the same conformance requirements as internally produced products?',
        'Are product and process conformance requirements defined for all manufacturing locations?',
      ],
      evidence: [
        'Product conformance records including inspection and test results',
        'Outsourced process management procedures and verification records',
        'Customer approval documentation (PPAP, first article inspections)',
        'Statutory and regulatory compliance registers',
      ],
      mandatory: true,
    },
    {
      clause: '4.4.1.2',
      title: 'Product safety',
      questions: [
        'Does the organization have documented processes for the management of product safety-related products and manufacturing processes?',
        'Do product safety processes include identification of statutory and regulatory product safety requirements, customer notification of safety requirements, design FMEA special approval, identification of product safety-related characteristics, and control plan identification?',
        'Are reaction plans defined for product safety-related processes?',
        'Is there a defined escalation process and information flow including top management for product safety issues?',
        'Has the organization identified training needs for product safety personnel?',
      ],
      evidence: [
        'Product safety management procedure with defined roles and escalation paths',
        'Product safety-related characteristics identified in DFMEAs and PFMEAs with special controls',
        'Control plans with product safety-related characteristics identified and special controls defined',
        'Records of product safety training and competency assessments',
      ],
      mandatory: true,
    },

    // =========================================================================
    // CLAUSE 5: LEADERSHIP
    // =========================================================================

    // --- ISO 9001 Base Requirements ---
    {
      clause: '5.1',
      title: 'Leadership and commitment',
      questions: [
        'Does top management demonstrate leadership and commitment with respect to the QMS by taking accountability for QMS effectiveness?',
        'Does top management ensure the quality policy and quality objectives are established and are compatible with the strategic direction?',
        "Does top management ensure the integration of QMS requirements into the organization's business processes?",
      ],
      evidence: [
        'Management review records demonstrating active top management involvement',
        'Quality policy signed and communicated by top management',
        'Business plan integration with quality objectives',
      ],
      mandatory: true,
    },
    {
      clause: '5.1.1.1',
      title: 'Corporate responsibility',
      questions: [
        'Has the organization defined and implemented corporate responsibility policies including an anti-bribery policy, an employee code of conduct, and an ethics escalation policy (whistle-blower policy)?',
        'Are the corporate responsibility policies communicated throughout the organization?',
        'How does the organization monitor compliance with corporate responsibility requirements?',
      ],
      evidence: [
        'Anti-bribery policy document and implementation records',
        'Employee code of conduct acknowledged by all personnel',
        'Ethics escalation (whistle-blower) policy and records of any reported cases',
        'Training records on corporate responsibility topics',
      ],
      mandatory: true,
    },
    {
      clause: '5.1.1.2',
      title: 'Process effectiveness and efficiency',
      questions: [
        'Does top management review product realization processes and support processes to evaluate and improve their effectiveness and efficiency?',
        'Are the results of process review activities included as input to management review?',
        'How does the organization identify waste, non-value-added activities, and opportunities for process optimization?',
        'Are lean manufacturing principles or equivalent methodologies employed to improve process efficiency?',
      ],
      evidence: [
        'Process performance dashboards, OEE data, and efficiency trend reports',
        'Management review inputs referencing process effectiveness and efficiency reviews',
        'Lean/value stream mapping activities and improvement project records',
        'Waste reduction and cycle time improvement records',
      ],
      mandatory: true,
    },
    {
      clause: '5.1.1.3',
      title: 'Process owners',
      questions: [
        "Has top management identified process owners who are responsible for managing the organization's processes and related outputs?",
        'Do process owners understand their roles and are they competent to perform those roles?',
        'Do process owners have the authority and responsibility to ensure processes achieve their planned results?',
      ],
      evidence: [
        'Process owner assignment matrix or organizational chart showing process ownership',
        'Process owner job descriptions or role definitions specifying QMS responsibilities',
        'Records of process owner competency assessments',
        'Process performance reports signed off by process owners',
      ],
      mandatory: true,
    },
    {
      clause: '5.2',
      title: 'Quality policy',
      questions: [
        'Has top management established, implemented, and maintained a quality policy appropriate to the purpose and context of the organization?',
        'Does the quality policy provide a framework for setting quality objectives?',
        'Is the quality policy communicated, understood, and applied within the organization?',
        'Is the quality policy available to relevant interested parties as appropriate?',
      ],
      evidence: [
        'Documented quality policy statement',
        'Records of quality policy communication to employees (postings, training, intranet)',
        'Employee awareness interview records confirming understanding of the quality policy',
      ],
      mandatory: true,
    },
    {
      clause: '5.3',
      title: 'Organizational roles, responsibilities and authorities',
      questions: [
        'Has top management ensured responsibilities and authorities for relevant roles are assigned, communicated, and understood?',
        'Has top management assigned responsibility and authority for ensuring QMS conformity, process performance reporting, customer focus promotion, and integrity maintenance during changes?',
        'Is there a designated management representative with defined authority and responsibility for the QMS, regardless of other responsibilities?',
      ],
      evidence: [
        'Organization charts, job descriptions, and responsibility matrices',
        'Records of communication of roles and authorities',
        'Appointment letters for quality management representative or equivalent roles',
      ],
      mandatory: true,
    },
    {
      clause: '5.3.1',
      title: 'Organizational roles, responsibilities, and authorities - supplemental',
      questions: [
        'Has top management assigned personnel with responsibility and authority to ensure customer requirements are met, including selection of special characteristics, setting quality objectives and related training, corrective and preventive actions, product design and development, capacity analysis, logistics information, and customer scorecards?',
        'Are these assignments documented and communicated?',
        'Do assigned personnel have access to the necessary resources and authority to fulfil their responsibilities?',
      ],
      evidence: [
        'Role-specific responsibility matrices for customer requirement fulfilment',
        'Documented assignments for special characteristics management, capacity planning, and logistics',
        'Customer scorecard ownership and response action records',
        'Training records verifying competence of assigned personnel',
      ],
      mandatory: true,
    },
    {
      clause: '5.3.2',
      title: 'Responsibility and authority for product requirements and corrective actions',
      questions: [
        'Has top management ensured that personnel responsible for conformity of product requirements have the authority to stop shipment and stop production to correct quality problems?',
        'Are personnel with stop-ship authority identified across all manufacturing shifts?',
        'Is there a defined process to ensure products with nonconformity do not reach the customer?',
        'Are corrective actions assigned to personnel with responsibility and authority to ensure effective resolution?',
      ],
      evidence: [
        'Stop-ship authority documentation identifying authorized personnel per shift',
        'Records of production or shipment stop events and resolution actions',
        'Nonconforming product containment and disposition records',
        'Corrective action records showing assigned responsibility and authority',
      ],
      mandatory: true,
    },

    // =========================================================================
    // CLAUSE 6: PLANNING
    // =========================================================================

    // --- ISO 9001 Base Requirements ---
    {
      clause: '6.1',
      title: 'Actions to address risks and opportunities',
      questions: [
        'Has the organization considered the issues from 4.1 and the requirements from 4.2 to determine risks and opportunities that need to be addressed?',
        'Has the organization planned actions to address these risks and opportunities?',
        'Are actions proportional to the potential impact on conformity of products and services?',
      ],
      evidence: [
        'Risk and opportunity registers with planned actions',
        'Evidence of risk-based thinking integration in QMS processes',
        'Records of effectiveness evaluation for risk mitigation actions',
      ],
      mandatory: true,
    },
    {
      clause: '6.1.2.1',
      title: 'Risk analysis',
      questions: [
        'Does the organization include in its risk analysis, at a minimum, lessons learned from product recalls, product audits, field returns and repairs, complaints, scrap, and rework?',
        'Does the organization retain documented information as evidence of the results of risk analysis?',
        'Are risks assessed for all new product launches, process changes, and new manufacturing locations?',
      ],
      evidence: [
        'Risk analysis documentation incorporating recall history, field failure data, and warranty data',
        'FMEA (DFMEA and PFMEA) records linked to risk analysis outputs',
        'Lessons learned database referenced during risk analysis activities',
        'Risk assessment records for product launches and process changes',
      ],
      mandatory: true,
    },
    {
      clause: '6.1.2.2',
      title: 'Preventive action',
      questions: [
        'Has the organization determined and implemented preventive actions to eliminate the causes of potential nonconformities in order to prevent their occurrence?',
        'Are preventive actions appropriate to the severity of the potential issues?',
        'Does the preventive action process include identification of potential nonconformities and their causes, evaluation of need for action, determination and implementation of action, and review of effectiveness?',
        'Are lessons learned applied proactively to prevent nonconformities in similar products and processes?',
      ],
      evidence: [
        'Preventive action procedure and records',
        'FMEA updates showing proactive risk reduction activities',
        'Lessons learned documentation applied to current and future products',
        'Records demonstrating transfer of preventive actions to similar processes',
      ],
      mandatory: true,
    },
    {
      clause: '6.1.2.3',
      title: 'Contingency plans',
      questions: [
        'Has the organization identified and evaluated internal and external risks to all manufacturing processes and infrastructure equipment essential to maintain production output and ensure customer requirements are met?',
        'Has the organization developed contingency plans according to risk and impact to the customer, including natural disasters, pandemics, utility interruptions, labor shortages, key equipment failures, and field returns?',
        'Are contingency plans tested for effectiveness at a defined frequency?',
        'Do contingency plans include a notification process to the customer and other interested parties for the extent and duration of any condition affecting customer operations?',
      ],
      evidence: [
        'Documented contingency plans covering key process, equipment, and supply chain risks',
        'Business continuity plan addressing natural disasters, pandemics, utility failures, IT disruptions, labor shortages, and key equipment breakdowns',
        'Contingency plan testing records and effectiveness review',
        'Customer notification procedure and records of notifications during disruptions',
      ],
      mandatory: true,
    },
    {
      clause: '6.2',
      title: 'Quality objectives and planning to achieve them',
      questions: [
        'Has the organization established quality objectives at relevant functions, levels, and processes needed for the QMS?',
        'Are quality objectives consistent with the quality policy, measurable, monitored, communicated, and updated as appropriate?',
        'Has the organization planned how to achieve its quality objectives including what, resources, responsibility, timeframe, and evaluation?',
      ],
      evidence: [
        'Documented quality objectives at organizational, departmental, and process levels',
        'Quality objective monitoring records and trend data',
        'Action plans for achieving quality objectives with defined resources and timelines',
      ],
      mandatory: true,
    },
    {
      clause: '6.2.2.1',
      title: 'Quality objectives and planning to achieve them - supplemental',
      questions: [
        'Has top management ensured that quality objectives to meet customer requirements are defined, established, and maintained for relevant functions, processes, and levels throughout the organization?',
        "Are the results of the organization's review regarding interested parties and their relevant requirements considered when setting annual (minimum) quality objectives and related performance targets?",
        'Do quality objectives address customer-specific requirements such as PPM targets, on-time delivery, and customer scorecard metrics?',
      ],
      evidence: [
        'Annual quality objectives document referencing customer scorecard targets and CSRs',
        'Quality objective deployment matrices showing cascade to all levels and functions',
        'Performance tracking records against customer-specific metrics (PPM, OTD, premium freight)',
        'Management review records showing quality objective review and target updates',
      ],
      mandatory: true,
    },

    // =========================================================================
    // CLAUSE 7: SUPPORT
    // =========================================================================

    // --- ISO 9001 Base Requirements ---
    {
      clause: '7.1',
      title: 'Resources',
      questions: [
        'Has the organization determined and provided the resources needed for the establishment, implementation, maintenance, and continual improvement of the QMS?',
        'Has the organization considered the capabilities of and constraints on existing internal resources?',
        'Has the organization determined and provided the persons necessary for effective implementation of the QMS and operation of its processes?',
      ],
      evidence: [
        'Resource planning documentation and budget allocations for QMS activities',
        'Staffing plans, competency matrices, and organizational charts',
        'Capital expenditure plans for equipment, tooling, and technology investments',
      ],
      mandatory: true,
    },
    {
      clause: '7.1.3.1',
      title: 'Plant, facility, and equipment planning',
      questions: [
        'Does the organization use a multidisciplinary approach, including risk identification and risk mitigation methods, for developing and improving plant, facility, and equipment plans?',
        'Are plant layouts designed to optimize material flow, material handling, and value-added use of floor space while facilitating synchronous material flow?',
        'Has the organization developed methods for evaluating manufacturing feasibility and evaluating capacity for new products or new operations?',
        'Are these assessments conducted for any proposed changes to existing operations?',
      ],
      evidence: [
        'Plant layout drawings and material flow diagrams optimized for lean manufacturing',
        'Feasibility studies and capacity analyses for new products and process changes',
        'Multidisciplinary team records for plant and facility planning activities',
        'Risk assessments for facility changes including ergonomic and safety evaluations',
      ],
      mandatory: true,
    },
    {
      clause: '7.1.5.1.1',
      title: 'Measurement system analysis (MSA)',
      questions: [
        'Are statistical studies conducted to analyze the variation present in the results of each type of inspection, measurement, and test equipment system identified in the control plan?',
        'Do the analytical methods and acceptance criteria used conform to those in customer reference manuals on MSA (e.g., AIAG MSA manual)?',
        'Are alternative analytical methods approved by the customer if required?',
        'Are MSA studies performed for new or modified gages, measurement, and test equipment?',
        'Do MSA studies include Gage R&R, bias, linearity, and stability studies as applicable?',
      ],
      evidence: [
        'MSA study records (Gage R&R, bias, linearity, stability) for all measurement systems in control plans',
        'MSA study results meeting acceptance criteria (e.g., %GRR < 10% acceptable, 10-30% conditional)',
        'Customer approval records for any alternative analytical methods',
        'Schedule for periodic MSA re-evaluation',
      ],
      mandatory: true,
    },
    {
      clause: '7.1.5.2.1',
      title: 'Calibration/verification records',
      questions: [
        'Does the organization have a documented process for managing calibration/verification records?',
        'Do calibration records include equipment identification, calibration revisions following engineering changes, any out-of-specification readings as received for calibration, an assessment of the impact of out-of-specification condition, and statements of conformity to specification after calibration?',
        'Are customer notification processes in place for suspect product shipped based on out-of-specification measurement equipment?',
      ],
      evidence: [
        'Calibration records with equipment ID, dates, results, and traceability to national/international standards',
        'Out-of-specification assessment records including impact analysis on previously measured product',
        'Customer notification records for suspect product related to calibration issues',
        'Calibration schedule and compliance tracking records',
      ],
      mandatory: true,
    },
    {
      clause: '7.1.5.3.1',
      title: 'Internal laboratory',
      questions: [
        "Does the organization's internal laboratory facility have a defined scope that includes its capability to perform required inspection, test, or calibration services?",
        'Is the laboratory scope included in the QMS documentation?',
        'Does the internal laboratory specify and implement requirements for adequacy of laboratory procedures, competency of laboratory personnel, testing of product, capability to perform services traceable to relevant standards (ASTM, EN, etc.), and customer requirements?',
        'Is ISO/IEC 17025 accreditation applicable and, if so, has it been achieved?',
      ],
      evidence: [
        'Internal laboratory scope document listing all testing and calibration capabilities',
        'Laboratory procedures for each test and calibration method in scope',
        'Laboratory personnel competency records and qualifications',
        'Traceability records to national/international measurement standards',
      ],
      mandatory: true,
    },
    {
      clause: '7.1.5.3.2',
      title: 'External laboratory',
      questions: [
        'Does the organization ensure that external/commercial/independent laboratory facilities used for inspection, test, or calibration services have a defined laboratory scope that includes the capability to perform the required inspection, test, or calibration?',
        'Is the external laboratory accredited to ISO/IEC 17025 or national equivalent with the relevant test or calibration in the scope of accreditation?',
        'Where an accredited external laboratory is not available, is the laboratory accepted by the customer?',
      ],
      evidence: [
        'External laboratory accreditation certificates (ISO/IEC 17025) with scope verification',
        "Records confirming the required tests are within the laboratory's accreditation scope",
        'Customer acceptance records for non-accredited external laboratories',
        'External laboratory evaluation and selection records',
      ],
      mandatory: true,
    },
    {
      clause: '7.2',
      title: 'Competence',
      questions: [
        'Has the organization determined the necessary competence of persons doing work under its control that affects QMS performance and effectiveness?',
        'Has the organization ensured persons are competent on the basis of appropriate education, training, or experience?',
        'Where applicable, has the organization taken actions to acquire the necessary competence and evaluated the effectiveness of those actions?',
      ],
      evidence: [
        'Competency matrices for all QMS-relevant roles',
        'Training records and effectiveness evaluation records',
        'Education, qualification, and certification records for personnel',
      ],
      mandatory: true,
    },
    {
      clause: '7.2.1',
      title: 'Competence - supplemental',
      questions: [
        'Has the organization established and maintained documented process(es) for identifying training needs including awareness and achieving competence for all personnel performing activities affecting conformity to product and process requirements?',
        'Are personnel performing specific assigned tasks qualified as required, with particular attention to the satisfaction of customer requirements?',
        'Does the organization provide on-the-job training for personnel in any new or modified job affecting conformity including contract or agency personnel?',
        'Are personnel whose work can affect quality informed about the consequences of nonconformity to customer requirements?',
      ],
      evidence: [
        'Training needs analysis documentation linked to quality objectives and customer requirements',
        'Qualification records for personnel performing specific assigned tasks (welders, NDT operators, etc.)',
        'On-the-job training records for new, transferred, and temporary personnel',
        'Records of employee awareness of customer requirement nonconformity consequences',
      ],
      mandatory: true,
    },
    {
      clause: '7.2.3',
      title: 'Internal auditor competency',
      questions: [
        'Has the organization established a documented process to verify internal auditors are competent, taking into account customer-specific requirements?',
        'Does the organization maintain a list of qualified internal auditors?',
        'Do QMS auditors, manufacturing process auditors, and product auditors demonstrate competence in the applicable standard, automotive process approach, applicable customer-specific requirements, APQP/PPAP/FMEA/MSA/SPC, and applicable core tool requirements?',
        'Are internal auditors qualified to applicable standards such as ISO 19011 guidance?',
      ],
      evidence: [
        'Internal auditor qualification criteria and competency records',
        'List of qualified internal auditors with their audit scope qualifications (QMS, process, product)',
        'Internal auditor training records covering IATF 16949, core tools, and customer-specific requirements',
        'Evidence of continued professional development and audit experience records',
      ],
      mandatory: true,
    },
    {
      clause: '7.2.4',
      title: 'Second-party auditor competency',
      questions: [
        'Has the organization demonstrated the competency of auditors who perform second-party audits?',
        'Do second-party auditors meet customer-specific requirements for auditor qualification?',
        'Do second-party auditors demonstrate a minimum of core competencies including understanding of the automotive process approach for auditing, applicable customer and organization-specific requirements, ISO 9001/IATF 16949 requirements, core tools (APQP, PPAP, FMEA, SPC, MSA), and how to plan, conduct, report, and close out audit findings?',
      ],
      evidence: [
        'Second-party auditor qualification records and competency assessments',
        'Training records demonstrating core tool and automotive process approach competency',
        'Audit reports from second-party audits demonstrating auditor effectiveness',
        'Customer-specific auditor qualification requirements and compliance records',
      ],
      mandatory: true,
    },
    {
      clause: '7.5',
      title: 'Documented information',
      questions: [
        'Does the QMS include documented information required by ISO 9001 and IATF 16949?',
        'Does the QMS include documented information determined by the organization as being necessary for QMS effectiveness?',
        'Is documented information appropriately identified, stored, protected, and controlled?',
      ],
      evidence: [
        'Document control procedures and master document lists',
        'Record retention schedules and access control records',
        'Document revision history and change control records',
      ],
      mandatory: true,
    },
    {
      clause: '7.5.3.2.1',
      title: 'Record retention',
      questions: [
        'Has the organization defined, documented, and implemented a record retention policy?',
        'Does the retention of records satisfy statutory, regulatory, organizational, and customer requirements?',
        'Are PPAP records, tooling records, product and process design records, purchase orders, and contracts/amendments retained for the length of time the product is active for production and service requirements plus one calendar year unless otherwise specified by the customer?',
      ],
      evidence: [
        'Record retention policy defining retention periods for all QMS record types',
        'PPAP approval records retained per policy requirements',
        'Tooling, product design, and purchase order records with demonstrated compliance to retention periods',
        'Evidence of record destruction at end of retention period per defined procedure',
      ],
      mandatory: true,
    },
    {
      clause: '7.5.3.2.2',
      title: 'Engineering specifications',
      questions: [
        'Has the organization established a documented process to ensure timely review, distribution, and implementation of all customer engineering standards/specifications and related revisions based on customer-required scheduling?',
        'Does the review occur within 10 working days of receipt of notification of customer engineering standards/specifications changes?',
        'Does the organization retain a record of the date on which each change is implemented in production?',
        'Does implementation include updated documents such as DFMEAs, PFMEAs, control plans, work instructions, and drawings?',
      ],
      evidence: [
        'Engineering specification change review procedure and log',
        'Records of engineering change implementation dates within 10 working days',
        'Updated control plans, FMEAs, work instructions reflecting current engineering specifications',
        'Customer engineering specification distribution and acknowledgment records',
      ],
      mandatory: true,
    },

    // =========================================================================
    // CLAUSE 8: OPERATION
    // =========================================================================

    // --- ISO 9001 Base Requirements ---
    {
      clause: '8.1',
      title: 'Operational planning and control',
      questions: [
        'Has the organization planned, implemented, and controlled the processes needed to meet the requirements for the provision of products and services?',
        'Has the organization determined the requirements for products and services, established criteria for processes, and determined the resources needed?',
        'Has the organization controlled planned changes and reviewed the consequences of unintended changes?',
      ],
      evidence: [
        'Operations planning documentation including process flow diagrams',
        'Quality planning records (APQP timelines, project plans)',
        'Change management records for planned and unplanned changes',
      ],
      mandatory: true,
    },
    {
      clause: '8.2',
      title: 'Requirements for products and services',
      questions: [
        'Has the organization established processes for communicating with customers regarding product and service information, enquiries, contracts, customer feedback, complaints, and customer property handling?',
        'Has the organization determined the requirements for products and services to be offered to customers?',
        'Does the organization conduct a review to ensure it has the ability to meet the requirements for products and services?',
      ],
      evidence: [
        'Contract review records and customer communication logs',
        'Customer requirements documentation including drawings, specifications, and quality requirements',
        'Feasibility review and manufacturing feasibility study records',
      ],
      mandatory: true,
    },
    {
      clause: '8.3',
      title: 'Design and development of products and services',
      questions: [
        'Has the organization established, implemented, and maintained a design and development process to ensure the subsequent provision of products and services?',
        'Has the organization considered the nature, duration, and complexity of design activities?',
        'Has the organization determined the stages and controls for design and development including reviews, verification, and validation?',
      ],
      evidence: [
        'Design and development procedure documentation',
        'APQP project plans with defined phases and gate reviews',
        'Design review, verification, and validation records',
      ],
      mandatory: true,
    },
    {
      clause: '8.3.2.1',
      title: 'Design and development planning - supplemental',
      questions: [
        'Does the organization ensure that design and development planning includes all affected stakeholders within the organization and, as appropriate, its supply chain?',
        'Does the organization use a multidisciplinary approach for product design and development including the use of APQP or equivalent (e.g., VDA-RGA, ANPQP)?',
        'Do design and development planning activities include project management methodologies (Gantt charts, critical path, risk mitigation), design and manufacturing feasibility evaluation, costing activities, and customer requirements analysis?',
        'Has the organization identified, documented, and reviewed product design input and manufacturing process design input requirements?',
      ],
      evidence: [
        'APQP project plans with multidisciplinary team membership records',
        'Design and manufacturing feasibility assessments',
        'Product cost analysis and target costing documentation',
        'Customer requirement analysis documents (design inputs checklist)',
      ],
      mandatory: true,
    },
    {
      clause: '8.3.3.1',
      title: 'Product design input',
      questions: [
        'Has the organization identified, documented, and reviewed product design input requirements as a result of contract review?',
        'Do product design inputs include product specifications, boundary and interface requirements, identification and traceability, packaging, reliability and durability targets, and product safety requirements from 4.4.1.2?',
        'Are applicable statutory and regulatory requirements for the country of destination identified and included?',
        'Does the organization include embedded software requirements and lessons learned from previous designs, competitive analysis, and supplier feedback?',
      ],
      evidence: [
        'Product design input checklist documenting all required inputs',
        'Reliability and durability target specifications (e.g., warranty targets, test requirements)',
        'Product safety requirements traced from clause 4.4.1.2 into design inputs',
        'Lessons learned database referenced in design input review records',
      ],
      mandatory: true,
    },
    {
      clause: '8.3.3.2',
      title: 'Manufacturing process design input',
      questions: [
        'Has the organization identified, documented, and reviewed the manufacturing process design input requirements?',
        'Do manufacturing process design inputs include product design output data, targets for productivity, process capability (Cpk/Ppk), and cost, customer requirements, experience from previous developments, new materials, product handling and ergonomic requirements, and design for manufacturing and assembly?',
        'Does the process design consider error-proofing methods appropriate to the magnitude of problems and commensurate with the risks encountered?',
      ],
      evidence: [
        'Manufacturing process design input checklist referencing product design outputs',
        'Process capability targets (Cpk/Ppk) established for key characteristics',
        'Ergonomic and workplace assessments for manufacturing process design',
        'Error-proofing requirements identified during process design input review',
      ],
      mandatory: true,
    },
    {
      clause: '8.3.3.3',
      title: 'Special characteristics',
      questions: [
        'Has the organization used a multidisciplinary approach to establish, document, and implement processes to identify special characteristics including those determined by the customer and the risk analysis performed by the organization?',
        'Are special characteristics identified and documented in DFMEAs, PFMEAs, control plans, standard work/operator instructions, drawings, and all related documents?',
        'Is the organization in conformance with all customer-specified definitions and symbols for special characteristics?',
        "Are special characteristics marked on drawings per customer requirements using customer-specific symbols or the organization's equivalent symbols as defined in a symbol conversion table?",
      ],
      evidence: [
        'Special characteristics list cross-referenced across drawings, DFMEAs, PFMEAs, and control plans',
        'Customer symbol conversion table if organization uses equivalent symbols',
        'Records of multidisciplinary team identification and approval of special characteristics',
        'Control plans showing appropriate controls for all special characteristics',
      ],
      mandatory: true,
    },
    {
      clause: '8.3.4.1',
      title: 'Monitoring',
      questions: [
        'Has the organization defined, analyzed, and reported results of design and development activities as a summary to management review?',
        'Are measurements defined at specified stages of product and manufacturing process design and development?',
        'Do measurements include quality risks, costs, lead times, critical paths, and other measures as appropriate?',
        'Are these results included as input to management review per clause 9.3.2.1?',
      ],
      evidence: [
        'APQP status reports with defined metrics at each gate review',
        'Design and development KPI dashboards tracking quality, cost, timing, and open issues',
        'Management review meeting minutes referencing design and development monitoring results',
        'Risk mitigation tracking for design and development programs',
      ],
      mandatory: true,
    },
    {
      clause: '8.3.4.4',
      title: 'Product approval process (PPAP)',
      questions: [
        'Has the organization established a product and manufacturing process approval procedure conforming to the product approval process recognized by the customer (e.g., PPAP per AIAG, VDA PPA)?',
        'Does the organization conform to a customer-recognized product and manufacturing process approval procedure?',
        'Is the product approval process applied to the supply chain per clause 8.4.2.3.1?',
        'Does the organization obtain documented product approval prior to shipment, and are records of this approval retained?',
        'Is product approval obtained after any changes per clause 8.5.6?',
      ],
      evidence: [
        'PPAP procedure aligned with customer-recognized product approval process (AIAG, VDA)',
        'Completed PPAP submissions with customer approval records (Part Submission Warrants)',
        'PPAP records including all required elements (design records, DFMEA, process flow, PFMEA, control plan, MSA, dimensional results, material/performance test results, appearance approval, sample products, master sample, checking aids, CSR compliance records)',
        'Supply chain PPAP/product approval records',
      ],
      mandatory: true,
    },
    {
      clause: '8.3.5.2',
      title: 'Manufacturing process design output',
      questions: [
        'Has the organization documented the manufacturing process design output in a manner that enables verification against manufacturing process design inputs?',
        'Do manufacturing process design outputs include specifications and drawings, process flow diagrams/layouts, manufacturing PFMEAs, control plans, work instructions, process approval acceptance criteria, data for quality, reliability, maintainability, and measurability?',
        'Do outputs include results of error-proofing verification activities and methods of rapid detection and feedback of product/manufacturing process nonconformities?',
      ],
      evidence: [
        'Process flow diagrams and plant layout documentation',
        'PFMEAs completed per AIAG/VDA FMEA Handbook methodology',
        'Control plans (prototype, pre-launch, production) per customer requirements',
        'Work instructions and standardized work documents for all manufacturing operations',
      ],
      mandatory: true,
    },
    {
      clause: '8.4',
      title: 'Control of externally provided processes, products, and services',
      questions: [
        'Does the organization ensure that externally provided processes, products, and services conform to requirements?',
        'Has the organization determined the controls to be applied to externally provided processes, products, and services?',
        'Has the organization established criteria for the evaluation, selection, monitoring of performance, and re-evaluation of external providers?',
      ],
      evidence: [
        'Approved supplier list (ASL) with evaluation and selection criteria',
        'Supplier performance monitoring records and scorecards',
        'Incoming inspection procedures and records',
      ],
      mandatory: true,
    },
    {
      clause: '8.4.1.2',
      title: 'Supplier selection process',
      questions: [
        "Does the organization have a documented supplier selection process that includes an assessment of the selected supplier's risk to product conformity and uninterrupted supply?",
        "Does the selection process include assessment of the supplier's QMS development status, financial stability, manufacturing capability, delivery performance, and relevant quality certifications (IATF 16949 preferred)?",
        'Are relevant automotive customer-specific requirements considered in the supplier selection process?',
        'Is software development capability assessed for suppliers providing embedded software?',
      ],
      evidence: [
        'Supplier selection procedure documentation including risk assessment criteria',
        'Supplier evaluation/audit records used during selection process',
        'Financial stability assessment records for suppliers',
        'QMS certification verification records (IATF 16949, ISO 9001 status)',
      ],
      mandatory: true,
    },
    {
      clause: '8.4.2.1',
      title: 'Type and extent of control - supplemental',
      questions: [
        'Does the organization have a documented process for identifying outsourced processes and selecting the types and extent of controls used to verify the conformity of externally provided processes, products, and services to internal and external customer requirements?',
        'Does the process include criteria and actions to escalate or reduce the types and extent of controls and development activities based on supplier performance and assessment of product, material, or service risk?',
        'Are statutory and regulatory requirements for sourcing country and destination country considered?',
      ],
      evidence: [
        'Supplier control level classification procedure (e.g., risk-based tiering of controls)',
        'Escalation and de-escalation records based on supplier performance data',
        'Incoming quality records demonstrating appropriate level of verification per supplier classification',
        'Regulatory compliance verification records for externally sourced products',
      ],
      mandatory: true,
    },
    {
      clause: '8.4.2.3',
      title: 'Statutory and regulatory requirements',
      questions: [
        'Has the organization documented its process for ensuring externally provided processes, products, and services conform to applicable current statutory and regulatory requirements in the country of receipt, country of shipment, and customer-identified destination country?',
        'If customer-defined special controls are required, does the organization ensure they are implemented and maintained as defined, including at suppliers?',
        'Are IMDS (International Material Data System) or equivalent material composition reporting requirements met?',
      ],
      evidence: [
        'Statutory and regulatory compliance procedure for externally provided products',
        'IMDS submissions or equivalent material data reports',
        'Certificates of conformance from suppliers for regulated characteristics',
        'Records of regulatory requirement flowdown to sub-tier suppliers',
      ],
      mandatory: true,
    },
    {
      clause: '8.4.2.4',
      title: 'Supplier monitoring',
      questions: [
        'Has the organization established and implemented a documented process to monitor the performance of external providers to ensure the conformity of externally provided products and processes to internal and external customer requirements?',
        'Does supplier monitoring include delivered product conformity performance, customer disruptions including field returns, delivery schedule performance, and number of premium freight occurrences?',
        'Does the organization promote supplier monitoring of their manufacturing processes performance?',
        'Does the organization include customer-designated supplier performance monitoring where applicable?',
      ],
      evidence: [
        'Supplier performance scorecards with PPM, on-time delivery, and quality metrics',
        'Supplier corrective action requests (SCARs) and resolution tracking records',
        'Premium freight tracking records attributed to supplier performance',
        'Records of supplier manufacturing process performance monitoring (SPC data from suppliers)',
      ],
      mandatory: true,
    },
    {
      clause: '8.5',
      title: 'Production and service provision',
      questions: [
        'Does the organization implement production and service provision under controlled conditions?',
        'Do controlled conditions include the availability of documented information that defines product characteristics, activities, and results to be achieved?',
        'Are monitoring and measurement activities implemented at appropriate stages?',
      ],
      evidence: [
        'Work instructions, visual aids, and standard operating procedures',
        'Process monitoring and measurement records',
        'Equipment maintenance and validation records',
      ],
      mandatory: true,
    },
    {
      clause: '8.5.1.1',
      title: 'Control plan',
      questions: [
        'Has the organization developed control plans at the system, subsystem, component, and/or material level for the relevant manufacturing site and all product supplied, including those for processes producing bulk materials as well as parts?',
        'Do control plans cover prototype, pre-launch, and production phases, and do they include all process outputs from DFMEA and PFMEA?',
        'Does the control plan include the listed information as required in Annex A of IATF 16949 (part/process number, process name, machine/device/jig, characteristics, product/process specification, evaluation method, sample size/frequency, control method, reaction plan)?',
        'Are control plans reviewed and updated when any of the following occur: determination of shipped nonconforming product, customer complaint, process/product change, FMEA update, or at a customer-defined frequency?',
        'Is customer approval required for the control plan when specified by the customer?',
      ],
      evidence: [
        'Control plans (prototype, pre-launch, production) per AIAG/VDA format for all products',
        'Control plan review and revision records showing updates after triggers (complaints, changes, FMEA updates)',
        'Customer approval records for control plans where required',
        'Traceability from DFMEA/PFMEA outputs to control plan characteristics and controls',
      ],
      mandatory: true,
    },
    {
      clause: '8.5.1.2',
      title: 'Standardized work - operator instructions and visual standards',
      questions: [
        'Has the organization ensured that standardized work documents are communicated to and understood by the employees who are responsible for performing the work?',
        'Are standardized work documents legible, in the language understood by the personnel, and accessible for use at the designated work area?',
        'Do standardized work documents include required safety rules for the operator?',
        'Are standardized work documents derived from sources including the control plan, quality planning activities (APQP), and special characteristics identification?',
      ],
      evidence: [
        "Standardized work instructions posted at workstations, legible, and in the operator's language",
        'Evidence of operator training on standardized work instructions with sign-off records',
        'Visual standards/boundary samples at appropriate work areas',
        'Traceability from control plan to standardized work instructions',
      ],
      mandatory: true,
    },
    {
      clause: '8.5.1.5',
      title: 'Total productive maintenance',
      questions: [
        'Has the organization developed, implemented, and maintained a documented total productive maintenance system?',
        'Does the system include identification of process equipment necessary to produce conforming product at the required volume, availability of replacement parts for the equipment identified, provision of resources for machine, equipment, and facility maintenance, and packaging and preservation of equipment, tooling, and gaging?',
        'Are customer-specific requirements addressed in the maintenance system?',
        'Does the organization utilize predictive maintenance methods to continually improve the effectiveness and efficiency of production equipment?',
        'Are maintenance objectives established (e.g., OEE, MTBF, MTTR, preventive maintenance compliance)?',
      ],
      evidence: [
        'TPM program documentation with defined maintenance types (preventive, predictive, corrective)',
        'Equipment maintenance schedules and completion records',
        'Spare parts inventory management records for critical production equipment',
        'OEE, MTBF, MTTR tracking data and trend analyses',
      ],
      mandatory: true,
    },
    {
      clause: '8.5.6.1',
      title:
        'Management of production tooling and manufacturing, test, inspection tooling and equipment',
      questions: [
        'Has the organization provided resources for tool and gage design, fabrication, and verification activities?',
        'Has the organization established and implemented a system for production tooling management including maintenance and repair facilities and personnel, storage and recovery, setup, tool-change programs for perishable tools, tool design modification documentation, and tool modification and revision to the tool documentation?',
        'Are tools identified with a unique identifier such as a serial number or asset number, and is their status clearly identified (e.g., production, repair, or disposal)?',
        'Is customer-owned tooling permanently marked so ownership is visible?',
      ],
      evidence: [
        'Tooling management procedure and tooling inventory/registry',
        'Tool maintenance schedules, records, and life tracking documentation',
        'Customer-owned tooling identification and management records',
        'Tool verification records (dimensional, performance) after maintenance or modification',
      ],
      mandatory: true,
    },
    {
      clause: '8.6',
      title: 'Release of products and services',
      questions: [
        'Does the organization implement planned arrangements at appropriate stages to verify that product and service requirements have been met?',
        'Is evidence of conformity with the acceptance criteria retained?',
        'Does the release of products and services to the customer occur only after planned arrangements have been satisfactorily completed, unless otherwise approved by a relevant authority and, as applicable, by the customer?',
      ],
      evidence: [
        'Final inspection and test records demonstrating conformity',
        'Product release documentation and shipping authorization records',
        'Traceability records linking release activities to acceptance criteria',
      ],
      mandatory: true,
    },
    {
      clause: '8.6.1',
      title: 'Release of products and services - supplemental',
      questions: [
        'Does the organization ensure that planned arrangements to verify that product and service requirements have been met encompass the control plan and are documented as specified in the control plan?',
        'Does the organization ensure that planned arrangements for the initial release of products and services include product or service approval (product validation)?',
        'Does the organization perform layout inspection and functional verification, with applicable customer engineering material and performance standards, at a defined frequency?',
        'Are results available for customer review upon request?',
      ],
      evidence: [
        'Layout inspection reports per defined frequency with full dimensional verification',
        'Functional test results per customer engineering specifications',
        'Product validation records for initial release (PPAP first article inspection)',
        'Schedule and records for periodic layout inspections (annually or per customer requirements)',
      ],
      mandatory: true,
    },
    {
      clause: '8.7',
      title: 'Control of nonconforming outputs',
      questions: [
        'Does the organization ensure that outputs that do not conform to requirements are identified and controlled to prevent their unintended use or delivery?',
        'Does the organization take appropriate action based on the nature of the nonconformity and its effect on the conformity of products and services?',
        'Does the organization deal with nonconforming outputs by correction, segregation, containment, return, suspension, informing the customer, or authorization for acceptance under concession?',
      ],
      evidence: [
        'Nonconforming product identification and segregation procedures',
        'Nonconforming product disposition records (rework, scrap, sort, use-as-is)',
        'Nonconforming product tracking logs and trend data',
      ],
      mandatory: true,
    },
    {
      clause: '8.7.1.1',
      title: 'Customer authorization for concession',
      questions: [
        'Does the organization obtain a customer concession or deviation permit prior to further processing whenever the product or manufacturing process is different from that which is currently approved?',
        'Does the organization obtain customer authorization before further processing for use-as-is and rework dispositions?',
        'Does the organization maintain a record of the expiration date or quantity authorized under the concession?',
        'Does the organization ensure conformance to the original or superseding specifications and requirements when the authorization expires?',
        'Are shipped material under a concession properly identified on each shipping container?',
      ],
      evidence: [
        'Customer concession/deviation permit records with expiration dates',
        'Shipping container identification for concession material',
        'Records demonstrating return to conforming product after concession expiration',
        'Concession tracking register with quantity, dates, and customer authorization details',
      ],
      mandatory: true,
    },

    // =========================================================================
    // CLAUSE 9: PERFORMANCE EVALUATION
    // =========================================================================

    // --- ISO 9001 Base Requirements ---
    {
      clause: '9.1',
      title: 'Monitoring, measurement, analysis, and evaluation',
      questions: [
        'Has the organization determined what needs to be monitored and measured, the methods for monitoring, measurement, analysis, and evaluation, and when monitoring and measuring shall be performed?',
        'Has the organization evaluated the performance and effectiveness of the QMS?',
        'Does the organization monitor customer perceptions of the degree to which their needs and expectations have been fulfilled?',
      ],
      evidence: [
        'QMS performance metrics and monitoring plans',
        'Customer satisfaction measurement records (surveys, scorecards, feedback)',
        'Data analysis and evaluation records demonstrating QMS effectiveness',
      ],
      mandatory: true,
    },
    {
      clause: '9.1.1.1',
      title: 'Monitoring and measurement of manufacturing processes',
      questions: [
        'Does the organization perform process studies on all new manufacturing processes to verify process capability and to provide additional input for process control, including those for special characteristics?',
        'Does the organization maintain manufacturing process capability or performance results as specified by the customer product approval process requirements?',
        'Does the organization verify that the process flow diagram, PFMEA, and control plan are implemented, including adherence to specified measurement technique, sampling plans, acceptance criteria, recording of actual measurement values for variable data, and reaction plans and escalation process when acceptance criteria are not met?',
        'Are significant process events recorded (e.g., tool change, machine repair)?',
        'Does the organization initiate a reaction plan from the control plan and evaluate for impact on conformity to specifications for characteristics that are either not statistically capable or are unstable?',
      ],
      evidence: [
        'SPC charts and process capability studies (Cpk/Ppk) for all special characteristics and key product characteristics',
        'Process capability records meeting minimum Cpk/Ppk requirements (1.33 minimum, 1.67 for safety/critical characteristics, or per customer requirement)',
        'Reaction plan implementation records for out-of-control or incapable processes',
        'Significant process event logs (tool changes, repairs, adjustments) on SPC charts',
      ],
      mandatory: true,
    },
    {
      clause: '9.2',
      title: 'Internal audit',
      questions: [
        "Does the organization conduct internal audits at planned intervals to provide information on whether the QMS conforms to the organization's own requirements and ISO 9001/IATF 16949 requirements, and is effectively implemented and maintained?",
        'Does the organization plan, establish, implement, and maintain an audit program including frequency, methods, responsibilities, planning requirements, and reporting?',
        'Are audit results reported to relevant management?',
      ],
      evidence: [
        'Internal audit schedule/program covering all QMS processes, shifts, and sites',
        'Internal audit reports with findings, observations, and opportunities for improvement',
        'Corrective action tracking for audit findings',
      ],
      mandatory: true,
    },
    {
      clause: '9.2.2.1',
      title: 'Internal audit program',
      questions: [
        'Does the organization have a documented internal audit process that includes the development and implementation of a comprehensive internal audit program covering the entire QMS including QMS audits, manufacturing process audits, and product audits?',
        'Is the audit program prioritized based upon risk, internal and external performance trends, and criticality of processes?',
        'Where software systems are used to verify the implementation and effectiveness of the QMS, are they included in the audit program?',
        'Are audit frequencies increased when internal/external nonconformities or customer complaints occur?',
      ],
      evidence: [
        'Internal audit program covering QMS, manufacturing process, and product audits for all areas and shifts',
        'Risk-based audit prioritization methodology and records',
        'Evidence of increased audit frequency triggered by nonconformities or customer complaints',
        'Audit schedule covering complete QMS within a defined audit cycle',
      ],
      mandatory: true,
    },
    {
      clause: '9.2.2.2',
      title: 'Quality management system audit',
      questions: [
        'Does the organization audit all QMS processes over each three-year calendar period, per an annual program, using the process approach to verify compliance with IATF 16949?',
        'Does the organization sample customer-specific requirements for implementation during QMS audits?',
        'Are all process interactions and linkages adequately audited?',
      ],
      evidence: [
        'Three-year QMS audit cycle plan covering all processes',
        'QMS audit reports using process approach methodology',
        'Records of customer-specific requirements sampling during QMS audits',
        'Audit trail demonstrating coverage of all process interactions',
      ],
      mandatory: true,
    },
    {
      clause: '9.2.2.3',
      title: 'Manufacturing process audit',
      questions: [
        'Does the organization audit all manufacturing processes over each three-year calendar period to determine their effectiveness?',
        'Does each manufacturing process audit include an assessment of the effective implementation of the process risk analysis (PFMEA), the control plan, and associated documents?',
        'Does each audit include verification of the effective implementation of standard work, SPC, MSA, and the reaction plan for out-of-control conditions?',
        'Are customer-required approaches for manufacturing process audits implemented when specified?',
      ],
      evidence: [
        'Manufacturing process audit schedule and reports covering all manufacturing processes within a three-year cycle',
        'Manufacturing process audit checklists referencing PFMEA, control plan, work instructions, SPC, MSA, and reaction plans',
        'Records of audit findings specific to process effectiveness and capability',
        'Customer-specific manufacturing process audit compliance records',
      ],
      mandatory: true,
    },
    {
      clause: '9.2.2.4',
      title: 'Product audit',
      questions: [
        'Does the organization audit products at appropriate stages of production and delivery to verify conformity to all specified requirements such as product dimensions, functionality, packaging, and labeling at a defined frequency?',
        'Are customer-required approaches for product audits implemented when specified?',
        'Are product audits performed per customer-specific requirements if defined?',
      ],
      evidence: [
        'Product audit schedule and reports demonstrating verification of specified requirements',
        'Product audit results including dimensional, functional, packaging, and labeling verification',
        'Corrective actions arising from product audit nonconformities',
        'Customer-specific product audit compliance records',
      ],
      mandatory: true,
    },
    {
      clause: '9.3',
      title: 'Management review',
      questions: [
        'Does top management review the QMS at planned intervals to ensure its continuing suitability, adequacy, effectiveness, and alignment with strategic direction?',
        'Does the management review consider the status of actions from previous reviews, changes in external and internal issues, QMS performance information, adequacy of resources, effectiveness of risk actions, and opportunities for improvement?',
        'Do management review outputs include decisions and actions related to opportunities for improvement, any need for changes to the QMS, and resource needs?',
      ],
      evidence: [
        'Management review meeting minutes and agendas',
        'Management review input data packages',
        'Action item tracking from management review outputs',
      ],
      mandatory: true,
    },
    {
      clause: '9.3.2.1',
      title: 'Management review inputs - supplemental',
      questions: [
        'Does management review input include cost of poor quality (internal and external failure costs)?',
        'Do inputs include measures of process effectiveness and efficiency?',
        'Do inputs include measures of product conformance and warranty performance (field returns, recalls, warranty claims)?',
        'Do inputs include review of customer scorecards, customer complaints, and identification of potential field failures through risk analysis (e.g., FMEA)?',
        'Do inputs include manufacturing process performance and product conformity results, assessment of manufacturing feasibility for changes to existing or new operations, customer satisfaction data, and review of performance against maintenance objectives?',
      ],
      evidence: [
        'Cost of poor quality reports (scrap, rework, warranty, sorting, premium freight)',
        'Customer scorecard data and trend analysis presented to management review',
        'Warranty performance data, field return analysis, and recall status reports',
        'Process performance and OEE data as management review input',
      ],
      mandatory: true,
    },

    // =========================================================================
    // CLAUSE 10: IMPROVEMENT
    // =========================================================================

    // --- ISO 9001 Base Requirements ---
    {
      clause: '10.1',
      title: 'General - Improvement',
      questions: [
        'Has the organization determined and selected opportunities for improvement?',
        'Does the organization implement necessary actions to meet customer requirements and enhance customer satisfaction?',
        'Does this include improving products and services, correcting, preventing or reducing undesired effects, improving QMS performance and effectiveness?',
      ],
      evidence: [
        'Improvement opportunity identification records',
        'Continual improvement project tracking and results',
        'Records of improvement actions and their effectiveness',
      ],
      mandatory: true,
    },
    {
      clause: '10.2',
      title: 'Nonconformity and corrective action',
      questions: [
        'When a nonconformity occurs, does the organization react to the nonconformity by taking action to control and correct it and deal with the consequences?',
        'Does the organization evaluate the need for action to eliminate the cause(s) of the nonconformity in order that it does not recur?',
        'Are corrective actions appropriate to the effects of the nonconformities encountered?',
        'Does the organization retain documented information as evidence of the nature of nonconformities, actions taken, and results of corrective action?',
      ],
      evidence: [
        'Corrective action procedure documentation',
        'Corrective action records (CARs) including root cause analysis, actions, and effectiveness verification',
        'Nonconformity tracking log with status and closure records',
      ],
      mandatory: true,
    },
    {
      clause: '10.2.3',
      title: 'Problem solving',
      questions: [
        'Does the organization have a documented process(es) for problem solving including defined approaches for various types and scales of problems (e.g., new product launch, current manufacturing, field failures, audit findings)?',
        'Does the problem solving process include containment actions, root cause analysis using appropriate methodologies, implementation of systemic corrective actions including consideration of the impact on similar processes and products, and verification of effectiveness?',
        'Does the organization use customer-prescribed problem-solving methods and formats where required (e.g., 8D, A3, DMAIC)?',
        'Is there evidence of lessons learned being applied from problem-solving activities?',
      ],
      evidence: [
        'Problem-solving procedure covering 8D, A3, 5-Why, Ishikawa, or equivalent structured methods',
        'Completed 8D or equivalent problem-solving reports with root cause analysis',
        'Containment action records demonstrating timely response',
        'Effectiveness verification records and lessons learned documentation',
      ],
      mandatory: true,
    },
    {
      clause: '10.2.4',
      title: 'Error-proofing',
      questions: [
        'Does the organization have a documented process to determine the use of appropriate error-proofing methodologies?',
        'Are details of the error-proofing method used documented in the process risk analysis (PFMEA) and test frequencies are documented in the control plan?',
        'Does the organization test error-proofing devices for failure or simulated failure at a defined frequency?',
        'Are challenge parts available and identified where practicable?',
        'Is there a defined reaction plan when error-proofing devices are found to be non-functional?',
      ],
      evidence: [
        'Error-proofing (poka-yoke) identification in PFMEAs and control plans',
        'Error-proofing device verification/validation test records at defined frequency',
        'Challenge part availability and identification records',
        'Reaction plan documentation and records for error-proofing device failures',
      ],
      mandatory: true,
    },
    {
      clause: '10.2.5',
      title: 'Warranty management systems',
      questions: [
        'Does the organization have a defined warranty management process where required by the customer?',
        'Does the process include a method for warranty part analysis including NTF (No Trouble Found)?',
        'Does the organization follow the customer-specified process for warranty management when defined?',
        'Is warranty data integrated with the problem-solving and corrective action process?',
        'Are field failure trends monitored and used to drive preventive actions?',
      ],
      evidence: [
        'Warranty management procedure document',
        'Warranty part analysis records including NTF investigations',
        'Warranty cost tracking and trend analysis data',
        'Integration records showing warranty data feeding into FMEA updates and corrective action processes',
      ],
      mandatory: true,
    },
    {
      clause: '10.2.6',
      title: 'Customer complaints and field failure test analysis',
      questions: [
        'Does the organization have a defined process for customer complaints and field failure test analysis?',
        'Does analysis include returned parts and does it initiate problem solving and corrective action to prevent recurrence?',
        'Where requested by the customer, does this include analysis of the interaction of embedded software within the product?',
        'Does the organization communicate the results of testing/analysis to the customer and within the organization?',
      ],
      evidence: [
        'Customer complaint handling procedure and log',
        'Field failure analysis reports including returned part analysis',
        'Corrective action records linked to customer complaints',
        'Communication records of complaint analysis results to customers and internal stakeholders',
      ],
      mandatory: true,
    },
    {
      clause: '10.3',
      title: 'Continual improvement',
      questions: [
        'Does the organization continually improve the suitability, adequacy, and effectiveness of the QMS?',
        'Does the organization consider the results of analysis and evaluation and the outputs from management review to determine if there are needs or opportunities to be addressed?',
        'Are improvement actions prioritized and tracked to completion with measurable outcomes?',
      ],
      evidence: [
        'Continual improvement plans and projects',
        'Trend analysis of QMS performance indicators',
        'Records of improvement actions from management review outputs',
      ],
      mandatory: true,
    },
    {
      clause: '10.3.1',
      title: 'Continual improvement - supplemental',
      questions: [
        'Has the organization defined a documented process for continual improvement?',
        'Does the process include identification of the methodology used, manufacturing process improvement objectives, and a link to relevant data (e.g., capability, efficiency, effectiveness)?',
        'Is there a focus on the reduction of variation and waste in manufacturing processes?',
        'Does the organization have an approach to continually improve the effectiveness and efficiency of the manufacturing process, with emphasis on controlling and reducing variation in product characteristics and manufacturing process parameters?',
        'Does the continual improvement process address risk management, special characteristics, SPC implementation, and corrective action system effectiveness?',
      ],
      evidence: [
        'Continual improvement procedure referencing methodologies (Kaizen, Six Sigma, Lean, PDCA)',
        'Manufacturing process improvement project records with measurable objectives and results',
        'SPC trend data demonstrating variation reduction over time',
        'Waste reduction metrics (scrap rate trends, rework trends, OEE improvement trends)',
      ],
      mandatory: true,
    },
  ],
};
