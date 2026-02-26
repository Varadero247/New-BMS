// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import type { StandardChecklist } from './types';

export const iso9001Checklist: StandardChecklist = {
  standard: 'ISO_9001',
  version: '2015',
  title: 'Quality Management Systems — Requirements',
  clauses: [
    // ──────────────────────────────────────────────
    // Clause 4: Context of the Organization
    // ──────────────────────────────────────────────
    {
      clause: '4.1',
      title: 'Understanding the organization and its context',
      questions: [
        'Has the organization determined external issues (e.g. regulatory, technological, competitive, market, cultural, social, economic) relevant to its purpose and strategic direction?',
        'Has the organization determined internal issues (e.g. values, culture, knowledge, performance) relevant to its purpose and strategic direction?',
        'Are the external and internal issues monitored and reviewed at defined intervals?',
        'Can top management demonstrate how these issues influence the QMS scope and strategic planning?',
      ],
      evidence: [
        'SWOT analysis, PESTLE analysis, or equivalent context assessment documents',
        'Minutes from management review meetings where internal and external issues were discussed',
        'Strategic planning documents referencing identified issues',
      ],
      mandatory: true,
    },
    {
      clause: '4.2',
      title: 'Understanding the needs and expectations of interested parties',
      questions: [
        'Has the organization identified all interested parties relevant to the QMS (e.g. customers, regulators, suppliers, employees, shareholders)?',
        'Have the relevant requirements and expectations of each interested party been determined?',
        'Is there a process to monitor and review information about interested parties and their requirements?',
        'Are changes in interested party requirements reflected in QMS planning and updates?',
      ],
      evidence: [
        'Register or matrix of interested parties with their requirements and expectations',
        'Customer requirements documentation, contractual obligations, and regulatory registers',
        'Records of periodic review and update of interested party information',
      ],
      mandatory: true,
    },
    {
      clause: '4.3',
      title: 'Determining the scope of the quality management system',
      questions: [
        'Has the organization determined the boundaries and applicability of the QMS to establish its scope?',
        'Does the scope consider the external and internal issues identified in 4.1 and the requirements identified in 4.2?',
        'If any requirements of the standard are determined not applicable, has a justification been documented that confirms product/service conformity is not affected?',
        'Is the scope of the QMS available and maintained as documented information?',
      ],
      evidence: [
        'Documented QMS scope statement including products, services, sites, and processes covered',
        'Justification records for any exclusions of standard requirements',
        'Quality manual or equivalent document where the scope is published and maintained',
      ],
      mandatory: true,
    },
    {
      clause: '4.4',
      title: 'Quality management system and its processes',
      questions: [
        'Has the organization determined the processes needed for the QMS, including their inputs, outputs, sequence, and interaction?',
        'Have criteria and methods (including measurements and related performance indicators) been determined to ensure effective operation and control of these processes?',
        'Have resources needed for QMS processes been determined and made available?',
        'Has the organization assigned responsibilities and authorities for QMS processes?',
        'Does the organization maintain and retain documented information to support process operation and to have confidence that processes are carried out as planned?',
      ],
      evidence: [
        'Process maps, turtle diagrams, or process interaction diagrams showing the QMS process landscape',
        'Documented process descriptions with defined inputs, outputs, KPIs, resources, and owners',
        'Records of process performance monitoring and measurement results',
        'Evidence of process improvement actions taken based on performance data',
      ],
      mandatory: true,
    },

    // ──────────────────────────────────────────────
    // Clause 5: Leadership
    // ──────────────────────────────────────────────
    {
      clause: '5.1',
      title: 'Leadership and commitment',
      questions: [
        'Can top management demonstrate accountability for the effectiveness of the QMS?',
        'Has top management ensured that the quality policy and quality objectives are established and compatible with the strategic direction and context of the organization?',
        "Has top management ensured the integration of QMS requirements into the organization's business processes?",
        'Does top management promote the use of the process approach and risk-based thinking throughout the organization?',
        'Does top management engage, direct, and support persons to contribute to the effectiveness of the QMS?',
      ],
      evidence: [
        'Management review meeting minutes demonstrating active leadership engagement with QMS performance',
        'Communication records from top management promoting quality awareness and process-based thinking',
        'Business plans and strategic documents showing integration of QMS objectives',
      ],
      mandatory: true,
    },
    {
      clause: '5.1.2',
      title: 'Customer focus',
      questions: [
        'Has top management ensured that customer requirements and applicable statutory and regulatory requirements are determined, understood, and consistently met?',
        'Are risks and opportunities that can affect conformity of products and services and ability to enhance customer satisfaction determined and addressed?',
        'Is the focus on enhancing customer satisfaction maintained as a priority across the organization?',
      ],
      evidence: [
        'Customer satisfaction survey results, trends, and associated action plans',
        'Records of customer complaint handling, resolution, and trend analysis',
        'Evidence of customer requirements being flowed down into operational processes',
      ],
      mandatory: true,
    },
    {
      clause: '5.2',
      title: 'Policy',
      questions: [
        'Has a quality policy been established that is appropriate to the purpose and context of the organization and supports its strategic direction?',
        'Does the quality policy include a commitment to satisfy applicable requirements and to continual improvement of the QMS?',
        'Is the quality policy available as documented information, communicated within the organization, understood, and applied?',
        'Is the quality policy available to relevant interested parties as appropriate?',
      ],
      evidence: [
        'Documented quality policy signed by top management with current date',
        'Records of communication of the quality policy to employees (e.g. training records, intranet postings, notice boards)',
        'Evidence that the policy is accessible to external interested parties where appropriate',
      ],
      mandatory: true,
    },
    {
      clause: '5.3',
      title: 'Organizational roles, responsibilities and authorities',
      questions: [
        'Has top management ensured that responsibilities and authorities for relevant QMS roles are assigned, communicated, and understood within the organization?',
        'Has responsibility and authority been assigned to ensure the QMS conforms to the requirements of ISO 9001:2015?',
        'Has responsibility been assigned for ensuring that processes deliver their intended outputs and for reporting on QMS performance and opportunities for improvement to top management?',
        'Has responsibility been assigned for ensuring the promotion of customer focus throughout the organization?',
      ],
      evidence: [
        'Organization chart showing QMS roles and reporting lines',
        'Job descriptions or role profiles that include QMS responsibilities and authorities',
        'Appointment letters or records for quality management representative or equivalent roles',
      ],
      mandatory: true,
    },

    // ──────────────────────────────────────────────
    // Clause 6: Planning
    // ──────────────────────────────────────────────
    {
      clause: '6.1',
      title: 'Actions to address risks and opportunities',
      questions: [
        'Has the organization considered the issues from 4.1 and requirements from 4.2 to determine risks and opportunities that need to be addressed?',
        'Has the organization planned actions to address identified risks and opportunities?',
        'Are the planned actions proportionate to the potential impact on conformity of products and services?',
        'Has the organization evaluated the effectiveness of actions taken to address risks and opportunities?',
      ],
      evidence: [
        'Risk register or risk assessment records identifying QMS risks and opportunities with ratings and treatment plans',
        'Evidence of risk mitigation actions being implemented and their effectiveness evaluated',
        'Records showing integration of risk-based thinking into process planning and decision-making',
      ],
      mandatory: true,
    },
    {
      clause: '6.2',
      title: 'Quality objectives and planning to achieve them',
      questions: [
        'Have quality objectives been established at relevant functions, levels, and processes needed for the QMS?',
        'Are quality objectives consistent with the quality policy, measurable, and take into account applicable requirements?',
        'Are quality objectives monitored, communicated, and updated as appropriate?',
        'Has the organization determined what will be done, what resources will be required, who will be responsible, when objectives will be completed, and how results will be evaluated?',
      ],
      evidence: [
        'Documented quality objectives with measurable targets, responsible persons, timelines, and resource requirements',
        'Records of quality objective monitoring, tracking dashboards, or scorecards',
        'Management review records showing evaluation of progress toward quality objectives',
        'Action plans associated with quality objectives that are not on track',
      ],
      mandatory: true,
    },
    {
      clause: '6.3',
      title: 'Planning of changes',
      questions: [
        'When the organization determines the need for changes to the QMS, are the changes carried out in a planned manner?',
        'Does the organization consider the purpose of the changes and their potential consequences?',
        'Does the organization consider the integrity of the QMS when planning changes?',
        'Does the organization consider the availability of resources and the allocation or reallocation of responsibilities and authorities when planning changes?',
      ],
      evidence: [
        'Change management procedures or documented processes for QMS changes',
        'Change request records showing impact assessment, approval, and implementation tracking',
        'Evidence that QMS changes were communicated to affected parties and that system integrity was maintained',
      ],
      mandatory: true,
    },

    // ──────────────────────────────────────────────
    // Clause 7: Support
    // ──────────────────────────────────────────────
    {
      clause: '7.1',
      title: 'Resources',
      questions: [
        'Has the organization determined and provided the resources needed for the establishment, implementation, maintenance, and continual improvement of the QMS?',
        'Has the organization considered the capabilities of and constraints on existing internal resources?',
        'Has the organization determined what needs to be obtained from external providers?',
        'Are the people necessary for the effective implementation and operation of the QMS and its processes provided?',
        'Has the organization determined, provided, and maintained the infrastructure necessary for the operation of its processes and conformity of products and services?',
      ],
      evidence: [
        'Resource allocation plans, budgets, and staffing records related to QMS activities',
        'Infrastructure maintenance schedules, records, and asset registers',
        'Records of infrastructure adequacy assessments (buildings, equipment, IT systems, transportation)',
      ],
      mandatory: true,
    },
    {
      clause: '7.1.5',
      title: 'Monitoring and measuring resources',
      questions: [
        'Has the organization determined and provided the resources needed to ensure valid and reliable monitoring and measurement results?',
        'Are monitoring and measuring resources suitable for the specific type of monitoring and measurement activities being undertaken?',
        'Are monitoring and measuring resources maintained to ensure their continued fitness for purpose?',
        'Where measurement traceability is a requirement, are measuring equipment calibrated or verified at specified intervals against measurement standards traceable to international or national standards?',
      ],
      evidence: [
        'Calibration schedules and calibration certificates for measuring equipment',
        'Equipment registers identifying all monitoring and measuring resources with calibration status',
        'Records of actions taken when equipment is found to be out of calibration, including impact assessment on prior measurements',
      ],
      mandatory: true,
    },
    {
      clause: '7.1.6',
      title: 'Organizational knowledge',
      questions: [
        'Has the organization determined the knowledge necessary for the operation of its processes and to achieve conformity of products and services?',
        'Is this knowledge maintained and made available to the extent necessary?',
        'When addressing changing needs and trends, does the organization consider its current knowledge and determine how to acquire or access any necessary additional knowledge?',
      ],
      evidence: [
        'Knowledge management systems, databases, or documented lessons learned repositories',
        'Records of knowledge transfer activities such as mentoring programs, training sessions, or technical documentation',
        'Evidence of organizational knowledge being updated based on project outcomes, industry developments, or process changes',
      ],
      mandatory: true,
    },
    {
      clause: '7.2',
      title: 'Competence',
      questions: [
        'Has the organization determined the necessary competence of persons doing work under its control that affects QMS performance and effectiveness?',
        'Has the organization ensured that these persons are competent on the basis of appropriate education, training, or experience?',
        'Where applicable, has the organization taken actions to acquire the necessary competence and evaluated the effectiveness of those actions?',
        'Does the organization retain appropriate documented information as evidence of competence?',
      ],
      evidence: [
        'Competence matrices or skills matrices mapping required competencies to personnel',
        'Training records, certificates, education qualifications, and experience documentation for QMS-affecting roles',
        'Records of training effectiveness evaluations (e.g. post-training assessments, on-the-job performance reviews)',
      ],
      mandatory: true,
    },
    {
      clause: '7.3',
      title: 'Awareness',
      questions: [
        "Are persons doing work under the organization's control aware of the quality policy?",
        'Are they aware of relevant quality objectives?',
        'Are they aware of their contribution to the effectiveness of the QMS, including the benefits of improved performance?',
        'Are they aware of the implications of not conforming with the QMS requirements?',
      ],
      evidence: [
        'Records of quality awareness training, induction programs, or toolbox talks',
        'Employee acknowledgment records confirming understanding of quality policy and their role in the QMS',
        'Internal communication records (newsletters, notice boards, digital platforms) promoting quality awareness',
      ],
      mandatory: true,
    },
    {
      clause: '7.4',
      title: 'Communication',
      questions: [
        'Has the organization determined the internal and external communications relevant to the QMS?',
        'Has the organization determined what to communicate, when to communicate, with whom to communicate, how to communicate, and who communicates?',
        'Are communication processes effective in conveying QMS-relevant information to all necessary parties?',
      ],
      evidence: [
        'Communication plan or matrix defining QMS communication requirements (what, when, who, how)',
        'Records of internal communications such as meeting minutes, memos, and email distributions',
        'Records of external communications with customers, suppliers, regulators, and other interested parties',
      ],
      mandatory: true,
    },
    {
      clause: '7.5',
      title: 'Documented information',
      questions: [
        'Does the QMS include documented information required by ISO 9001:2015?',
        'Does the QMS include documented information determined by the organization as necessary for QMS effectiveness?',
        'When creating and updating documented information, are appropriate identification, description, format, media, and review and approval ensured?',
        'Is documented information controlled to ensure it is available and suitable for use where and when it is needed, and adequately protected?',
        'Are activities such as distribution, access, retrieval, use, storage, preservation, control of changes, retention, and disposition addressed for documented information?',
      ],
      evidence: [
        'Document control procedure defining creation, approval, distribution, revision, and disposal processes',
        'Master document list or document register with revision status and approval records',
        'Evidence of document access controls, backup procedures, and retention schedules',
        'Sample of controlled documents showing proper identification, revision history, and approval signatures',
      ],
      mandatory: true,
    },

    // ──────────────────────────────────────────────
    // Clause 8: Operation
    // ──────────────────────────────────────────────
    {
      clause: '8.1',
      title: 'Operational planning and control',
      questions: [
        'Has the organization planned, implemented, and controlled the processes needed to meet requirements for the provision of products and services?',
        'Has the organization determined the requirements for products and services and established criteria for the processes and product/service acceptance?',
        'Has the organization determined the resources needed to achieve conformity to product and service requirements?',
        'Has the organization implemented control of the processes in accordance with the criteria?',
        'Does the organization retain documented information to have confidence that processes have been carried out as planned and to demonstrate conformity of products and services?',
      ],
      evidence: [
        'Operational procedures, work instructions, and process flow diagrams for key realization processes',
        'Production or service delivery plans with acceptance criteria and resource requirements',
        'Records of process control activities including inspection and test results',
      ],
      mandatory: true,
    },
    {
      clause: '8.2',
      title: 'Requirements for products and services',
      questions: [
        'Has the organization established processes for communicating with customers regarding product and service information, enquiries, contracts, order handling, and feedback including complaints?',
        'Has the organization determined the requirements for products and services, including applicable statutory and regulatory requirements and those considered necessary by the organization?',
        'Does the organization conduct a review before committing to supply products and services to ensure it can meet the requirements?',
        'Are the results of review and any new requirements for products and services retained as documented information?',
      ],
      evidence: [
        'Customer communication records including enquiry responses, quotations, and order acknowledgments',
        'Contract review or order review records demonstrating verification of ability to meet requirements',
        'Product and service specifications including applicable statutory and regulatory requirements',
        'Records of changes to product and service requirements and communication of changes to relevant persons',
      ],
      mandatory: true,
    },
    {
      clause: '8.3',
      title: 'Design and development of products and services',
      questions: [
        'Has the organization established, implemented, and maintained a design and development process appropriate to ensure the subsequent provision of products and services?',
        'Has the organization determined the stages and controls for design and development, including design review, verification, and validation activities?',
        'Have design and development inputs been determined, including functional and performance requirements, applicable statutory and regulatory requirements, and standards or codes of practice?',
        'Are design and development outputs adequate for the subsequent processes for the provision of products and services, and do they include or reference monitoring and measuring requirements and acceptance criteria?',
        'Are design and development changes identified, reviewed, and controlled to prevent adverse impact, with documented information retained?',
      ],
      evidence: [
        'Design and development procedure defining stages, responsibilities, review gates, and deliverables',
        'Design input documents, specifications, and requirements traceability matrices',
        'Design review, verification, and validation records with participant sign-offs',
        'Design change records including impact assessments and approval documentation',
      ],
      mandatory: true,
    },
    {
      clause: '8.4',
      title: 'Control of externally provided processes, products and services',
      questions: [
        'Has the organization determined the controls to apply to externally provided processes, products, and services?',
        'Has the organization established criteria for the evaluation, selection, monitoring of performance, and re-evaluation of external providers?',
        'Does the organization communicate to external providers its requirements for processes, products, and services to be provided, including approval methods, competence of personnel, and QMS interactions?',
        'Does the organization ensure the adequacy of requirements prior to their communication to the external provider?',
      ],
      evidence: [
        'Approved supplier list with evaluation and selection criteria',
        'Supplier evaluation and re-evaluation records, scorecards, or performance reports',
        'Purchase orders and contracts specifying quality requirements, specifications, and acceptance criteria',
        'Incoming inspection or verification records for externally provided products and services',
      ],
      mandatory: true,
    },
    {
      clause: '8.5',
      title: 'Production and service provision',
      questions: [
        'Has the organization implemented production and service provision under controlled conditions, including availability of documented information defining product characteristics, activities, and results to be achieved?',
        'Has the organization implemented the use of suitable monitoring and measuring resources at appropriate stages?',
        'Has the organization implemented activities for the identification and traceability of outputs to ensure conformity of products and services?',
        "Does the organization exercise care with property belonging to customers or external providers while it is under the organization's control?",
        'Does the organization meet requirements for post-delivery activities associated with products and services?',
      ],
      evidence: [
        'Work instructions, standard operating procedures, and control plans for production and service processes',
        'Traceability records linking raw materials, in-process stages, and finished products or service deliverables',
        'Records of handling, storage, and preservation activities for products and customer property',
        'Post-delivery activity records such as warranty claims, servicing, and support logs',
      ],
      mandatory: true,
    },
    {
      clause: '8.6',
      title: 'Release of products and services',
      questions: [
        'Has the organization implemented planned arrangements at appropriate stages to verify that product and service requirements have been met?',
        'Is the release of products and services to the customer contingent upon satisfactory completion of planned arrangements unless otherwise approved by a relevant authority and, where applicable, by the customer?',
        'Does the organization retain documented information on the release of products and services, including evidence of conformity with acceptance criteria and traceability to the authorizing person(s)?',
      ],
      evidence: [
        'Final inspection and test records demonstrating conformity with acceptance criteria',
        'Release authorization records identifying the person(s) authorizing release',
        'Certificates of conformity, test certificates, or analysis reports accompanying released products',
      ],
      mandatory: true,
    },
    {
      clause: '8.7',
      title: 'Control of nonconforming outputs',
      questions: [
        'Does the organization ensure that outputs not conforming to requirements are identified and controlled to prevent unintended use or delivery?',
        'Does the organization take appropriate action based on the nature of the nonconformity and its effect on conformity of products and services (e.g. correction, segregation, return, suspension, customer notification)?',
        'Does the organization verify conformity to requirements when nonconforming outputs are corrected?',
        'Does the organization retain documented information describing the nonconformity, actions taken, concessions obtained, and the authority deciding the action?',
      ],
      evidence: [
        'Nonconforming product or service reports with disposition decisions (rework, scrap, concession, return)',
        'Segregation and identification records for nonconforming outputs',
        'Re-inspection or re-verification records after correction of nonconforming outputs',
        'Concession or deviation approval records from authorized personnel or customers',
      ],
      mandatory: true,
    },

    // ──────────────────────────────────────────────
    // Clause 9: Performance Evaluation
    // ──────────────────────────────────────────────
    {
      clause: '9.1',
      title: 'Monitoring, measurement, analysis and evaluation',
      questions: [
        'Has the organization determined what needs to be monitored and measured to evaluate QMS performance and effectiveness?',
        'Has the organization determined the methods for monitoring, measurement, analysis, and evaluation to ensure valid results?',
        'Has the organization determined when monitoring and measuring shall be performed and when results shall be analysed and evaluated?',
        'Does the organization evaluate the performance and effectiveness of the QMS and retain appropriate documented information as evidence of the results?',
      ],
      evidence: [
        'KPI dashboards, performance reports, or balanced scorecards tracking QMS metrics',
        'Documented monitoring and measurement plan specifying what, how, when, and by whom measurements are taken',
        'Trend analysis reports showing QMS performance over time with identified patterns and actions',
      ],
      mandatory: true,
    },
    {
      clause: '9.1.2',
      title: 'Customer satisfaction',
      questions: [
        "Does the organization monitor customers' perceptions of the degree to which their needs and expectations have been fulfilled?",
        'Has the organization determined the methods for obtaining, monitoring, and reviewing customer satisfaction information?',
        'Are customer satisfaction results analysed and used to identify areas for improvement?',
      ],
      evidence: [
        'Customer satisfaction survey results with response rates, trend analysis, and benchmarking data',
        'Customer feedback logs including compliments, complaints, and warranty or return data',
        'Action plans derived from customer satisfaction analysis and evidence of their implementation',
      ],
      mandatory: true,
    },
    {
      clause: '9.1.3',
      title: 'Analysis and evaluation',
      questions: [
        'Does the organization analyse and evaluate appropriate data and information arising from monitoring and measurement?',
        'Are the results of analysis used to evaluate conformity of products and services, the degree of customer satisfaction, QMS performance and effectiveness, whether planning has been implemented effectively, the effectiveness of risk-addressing actions, performance of external providers, and the need for improvements?',
        'Are statistical techniques or other analytical methods used where appropriate?',
      ],
      evidence: [
        'Data analysis reports covering product conformity, customer satisfaction trends, process performance, and supplier performance',
        'Statistical process control charts, Pareto analyses, or other analytical outputs where applicable',
        'Management review input reports summarizing analysis and evaluation findings',
      ],
      mandatory: true,
    },
    {
      clause: '9.2',
      title: 'Internal audit',
      questions: [
        "Does the organization conduct internal audits at planned intervals to provide information on whether the QMS conforms to the organization's own requirements and to ISO 9001:2015?",
        'Has the organization established an audit programme that considers the importance of the processes, changes affecting the organization, and results of previous audits?',
        'Are audit criteria, scope, frequency, and methods defined for each audit?',
        'Are auditors selected to ensure objectivity and impartiality of the audit process?',
        'Are results of audits reported to relevant management and are corrections and corrective actions taken without undue delay?',
      ],
      evidence: [
        'Internal audit programme or schedule covering all QMS processes and showing planned versus actual audits',
        'Internal audit reports with findings, nonconformities, observations, and opportunities for improvement',
        'Auditor competence records including training certificates and independence declarations',
        'Corrective action records resulting from audit findings with evidence of closure and effectiveness verification',
      ],
      mandatory: true,
    },
    {
      clause: '9.3',
      title: 'Management review',
      questions: [
        'Does top management review the QMS at planned intervals to ensure its continuing suitability, adequacy, effectiveness, and alignment with strategic direction?',
        'Does the management review consider the status of actions from previous reviews, changes in external and internal issues, QMS performance information (including trends in customer satisfaction, quality objectives, process performance, nonconformities, audit results, and external provider performance)?',
        'Does the management review consider the adequacy of resources, the effectiveness of risk-addressing actions, and opportunities for improvement?',
        'Do the outputs of management review include decisions and actions related to improvement opportunities, any need for changes to the QMS, and resource needs?',
      ],
      evidence: [
        'Management review meeting minutes or records with dated agendas covering all required inputs',
        'Management review output records documenting decisions, action items, responsible persons, and target dates',
        'Evidence that management review actions have been implemented and tracked to completion',
      ],
      mandatory: true,
    },

    // ──────────────────────────────────────────────
    // Clause 10: Improvement
    // ──────────────────────────────────────────────
    {
      clause: '10.1',
      title: 'General',
      questions: [
        'Has the organization determined and selected opportunities for improvement and implemented necessary actions to meet customer requirements and enhance customer satisfaction?',
        'Does the organization consider the results of analysis and evaluation and the outputs from management review to determine improvement needs or opportunities?',
        'Does the organization pursue improvement in products and services to meet requirements and address future needs and expectations?',
        'Does the organization pursue improvement in correcting, preventing, or reducing undesired effects and improving QMS performance and effectiveness?',
      ],
      evidence: [
        'Improvement project registers, suggestion schemes, or innovation logs tracking identified opportunities',
        'Records linking improvement initiatives to management review outputs, audit findings, or data analysis results',
        'Evidence of completed improvement actions with measured outcomes and benefits realized',
      ],
      mandatory: true,
    },
    {
      clause: '10.2',
      title: 'Nonconformity and corrective action',
      questions: [
        'When a nonconformity occurs, does the organization react by taking action to control and correct it and deal with the consequences?',
        'Does the organization evaluate the need for action to eliminate the cause(s) of the nonconformity so that it does not recur or occur elsewhere, by reviewing and analysing the nonconformity, determining the causes, and determining if similar nonconformities exist or could potentially occur?',
        'Does the organization implement any action needed, review the effectiveness of corrective action taken, and update risks and opportunities determined during planning if necessary?',
        'Does the organization retain documented information as evidence of the nature of the nonconformities, actions taken, and the results of corrective action?',
      ],
      evidence: [
        'Corrective action request (CAR) records showing nonconformity description, root cause analysis, planned actions, and responsible persons',
        'Root cause analysis documentation (e.g. 5 Whys, fishbone diagrams, fault tree analysis)',
        'Effectiveness verification records confirming that corrective actions have prevented recurrence',
        'Trend analysis of nonconformities showing reduction over time as corrective actions take effect',
      ],
      mandatory: true,
    },
    {
      clause: '10.3',
      title: 'Continual improvement',
      questions: [
        'Does the organization continually improve the suitability, adequacy, and effectiveness of the QMS?',
        'Does the organization consider the results of analysis and evaluation and the outputs from management review to determine if there are areas of underperformance or opportunities that shall be addressed as part of continual improvement?',
        'Does the organization use appropriate tools and methodologies for continual improvement (e.g. Plan-Do-Check-Act, Lean, Six Sigma)?',
      ],
      evidence: [
        'Continual improvement programme documentation with defined objectives, methods, and responsibilities',
        'Records of improvement projects completed with before-and-after performance metrics',
        'Management review records demonstrating systematic evaluation of improvement opportunities and tracking of improvement trends',
      ],
      mandatory: true,
    },
  ],
};
