// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import type { StandardChecklist } from './types';

export const iso45001Checklist: StandardChecklist = {
  standard: 'ISO_45001',
  version: '2018',
  title: 'Occupational Health and Safety Management Systems — Requirements with guidance for use',
  clauses: [
    // ───────────────────────────────────────────────
    // Clause 4 — Context of the Organization
    // ───────────────────────────────────────────────
    {
      clause: '4.1',
      title: 'Understanding the organization and its context',
      questions: [
        'Has the organization determined external and internal issues relevant to its purpose that affect its ability to achieve the intended outcomes of the OH&S management system?',
        'Are external issues such as regulatory frameworks, technological developments, economic conditions, and community expectations systematically identified and monitored?',
        'Are internal issues including organizational culture, working conditions, worker capabilities, and existing OH&S performance considered?',
        'Is there a documented process for periodically reviewing the context of the organization to ensure continued relevance?',
      ],
      evidence: [
        'Context analysis documentation (e.g., SWOT analysis, PESTLE analysis) referencing OH&S-specific factors',
        'Records of management meetings where internal and external issues affecting OH&S were reviewed',
        'Evidence of periodic reviews and updates to the context analysis, including dates and outcomes',
      ],
      mandatory: true,
    },
    {
      clause: '4.2',
      title: 'Understanding the needs and expectations of workers and other interested parties',
      questions: [
        'Has the organization determined the workers and other interested parties (e.g., regulators, contractors, visitors, neighbouring communities) relevant to the OH&S management system?',
        'Have the relevant needs and expectations (requirements) of workers and other interested parties been identified, including legal and regulatory obligations?',
        'Has the organization determined which of these needs and expectations are, or could become, applicable legal requirements and other requirements?',
        'Are mechanisms in place for workers to communicate their OH&S-related needs and expectations without fear of reprisal?',
      ],
      evidence: [
        'Register or matrix of interested parties and their OH&S-related needs and expectations',
        'Records of worker consultations, surveys, or feedback mechanisms regarding OH&S concerns',
        'Evidence of analysis linking interested party requirements to OH&S management system processes',
      ],
      mandatory: true,
    },
    {
      clause: '4.3',
      title: 'Determining the scope of the OH&S management system',
      questions: [
        'Has the organization determined the boundaries and applicability of the OH&S management system to establish its scope?',
        'Does the scope consider the internal and external issues referred to in 4.1 and the requirements referred to in 4.2?',
        'Does the scope account for the planned or performed work-related activities, including activities of contractors and visitors?',
        'Is the scope documented and available as documented information to all relevant workers and interested parties?',
      ],
      evidence: [
        'Documented OH&S management system scope statement specifying boundaries, locations, activities, and worker groups covered',
        'Records justifying any exclusions from the scope, demonstrating they do not affect OH&S performance',
        'Evidence that the scope is communicated to workers and relevant interested parties',
      ],
      mandatory: true,
    },
    {
      clause: '4.4',
      title: 'OH&S management system',
      questions: [
        'Has the organization established, implemented, maintained, and continually improved an OH&S management system in accordance with ISO 45001:2018?',
        'Are the processes needed for the OH&S management system and their interactions identified and documented?',
        "Does the management system integrate OH&S requirements into the organization's business processes?",
      ],
      evidence: [
        'OH&S management system manual or equivalent documentation describing the system structure and process interactions',
        'Process maps or flowcharts showing integration of OH&S processes with business operations',
        'Evidence of continual improvement activities applied to the OH&S management system',
      ],
      mandatory: true,
    },

    // ───────────────────────────────────────────────
    // Clause 5 — Leadership and Worker Participation
    // ───────────────────────────────────────────────
    {
      clause: '5.1',
      title: 'Leadership and commitment',
      questions: [
        'Does top management demonstrate leadership and commitment with respect to the OH&S management system by taking overall responsibility and accountability for the prevention of work-related injury and ill health?',
        'Does top management ensure that the OH&S policy and OH&S objectives are established and are compatible with the strategic direction of the organization?',
        "Does top management ensure the integration of OH&S management system requirements into the organization's business processes?",
        'Does top management ensure that the resources needed for the OH&S management system are available and adequate?',
        'Does top management actively promote and lead a positive OH&S culture that supports the intended outcomes of the management system?',
      ],
      evidence: [
        'Minutes from management review meetings showing top management engagement on OH&S matters',
        'Budget allocations and resource assignments specifically dedicated to OH&S',
        'Communications from top management demonstrating visible commitment to OH&S (e.g., safety messages, leadership walk-throughs)',
        'Evidence that top management protects workers from reprisals when reporting incidents, hazards, and risks',
      ],
      mandatory: true,
    },
    {
      clause: '5.2',
      title: 'OH&S policy',
      questions: [
        'Has top management established, implemented, and maintained an OH&S policy that includes a commitment to provide safe and healthy working conditions for the prevention of work-related injury and ill health?',
        'Does the OH&S policy include a commitment to the elimination of hazards and the reduction of OH&S risks using the hierarchy of controls?',
        "Does the policy include commitments to consultation and participation of workers, and where they exist, workers' representatives?",
        'Does the policy include a commitment to compliance with legal requirements and other requirements, and to continual improvement of the OH&S management system?',
        'Is the OH&S policy available as documented information, communicated within the organization, and available to interested parties as appropriate?',
      ],
      evidence: [
        'Signed and dated OH&S policy document demonstrating all required commitments',
        'Records showing the policy has been communicated to all workers (e.g., training records, intranet postings, display boards)',
        'Evidence that the policy is periodically reviewed for continuing suitability',
      ],
      mandatory: true,
    },
    {
      clause: '5.3',
      title: 'Organizational roles, responsibilities, and authorities',
      questions: [
        'Has top management assigned and communicated the responsibilities and authorities for relevant roles within the OH&S management system?',
        'Are workers at each level of the organization assigned responsibility for those aspects of the OH&S management system over which they have control?',
        'Has top management assigned the responsibility and authority for ensuring that the OH&S management system conforms to ISO 45001 requirements and for reporting on performance?',
        'Are OH&S responsibilities documented in job descriptions, organizational charts, or equivalent documents?',
      ],
      evidence: [
        'Organizational chart showing OH&S roles and reporting lines',
        'Job descriptions or role definitions that include specific OH&S responsibilities and authorities',
        'Records of communication of OH&S responsibilities to relevant personnel (e.g., appointment letters, training records)',
      ],
      mandatory: true,
    },
    {
      clause: '5.4',
      title: 'Consultation and participation of workers',
      questions: [
        'Has the organization established, implemented, and maintained processes for consultation and participation of workers at all applicable levels and functions?',
        'Are workers consulted on determining the needs and expectations of interested parties, establishing the OH&S policy, assigning roles and responsibilities, and determining how to fulfil legal requirements?',
        'Do workers participate in determining the mechanisms for their consultation and participation, identifying hazards and assessing risks, determining actions to eliminate hazards and reduce OH&S risks, and investigating incidents?',
        'Are non-managerial workers specifically involved in the consultation and participation processes?',
        'Are barriers to participation identified and removed, and are adequate time, training, and resources provided to facilitate worker participation?',
      ],
      evidence: [
        'Records of safety committee meetings including worker representation, agendas, and minutes',
        'Evidence of worker involvement in hazard identification and risk assessment activities (e.g., sign-off sheets, workshop records)',
        'Documented mechanisms for worker consultation (e.g., suggestion schemes, toolbox talks, safety representatives)',
        'Records demonstrating that barriers to participation have been identified and addressed',
      ],
      mandatory: true,
    },

    // ───────────────────────────────────────────────
    // Clause 6 — Planning
    // ───────────────────────────────────────────────
    {
      clause: '6.1',
      title: 'Actions to address risks and opportunities',
      questions: [
        'Has the organization considered the issues referred to in 4.1, the requirements in 4.2, and the scope in 4.3 when determining the risks and opportunities that need to be addressed?',
        'Does the planning process address OH&S risks, OH&S opportunities, and other risks and opportunities to the management system?',
        'Has the organization evaluated the risks and opportunities relevant to the intended outcomes of the OH&S management system associated with planned or unplanned changes?',
        'Are the identified risks and opportunities, and the processes and actions needed to address them, maintained as documented information?',
      ],
      evidence: [
        'Risk and opportunity register specific to the OH&S management system',
        'Records of risk assessment and opportunity evaluation processes, including methodology used',
        'Action plans addressing identified risks and opportunities with assigned responsibilities and timelines',
      ],
      mandatory: true,
    },
    {
      clause: '6.1.2',
      title: 'Hazard identification and assessment of risks and opportunities',
      questions: [
        'Has the organization established, implemented, and maintained ongoing and proactive processes for hazard identification that consider how work is organized, social factors, routine and non-routine activities, past incidents, and potential emergency situations?',
        'Does the hazard identification process consider the work environment including infrastructure, equipment, materials, and physical conditions of the workplace?',
        'Are hazards identified from the design of products and services, including workstations, work processes, installations, and equipment?',
        'Does the process consider human factors such as worker capabilities, limitations, and ergonomic considerations?',
        'Has the organization assessed OH&S risks from identified hazards, taking into account the effectiveness of existing controls, and assessed OH&S opportunities to enhance OH&S performance?',
      ],
      evidence: [
        'Comprehensive hazard register covering all workplace activities, processes, and locations',
        'Completed risk assessment forms or matrices showing hazard identification, risk rating methodology, and residual risk levels',
        'Evidence that hazard identification considers non-routine activities, contractor activities, and foreseeable abnormal conditions',
        'Records of worker involvement in hazard identification activities',
      ],
      mandatory: true,
    },
    {
      clause: '6.1.3',
      title: 'Determination of legal requirements and other requirements',
      questions: [
        'Has the organization established, implemented, and maintained processes to determine and have access to up-to-date legal requirements and other requirements applicable to its hazards and OH&S risks?',
        'Has the organization determined how these legal requirements and other requirements apply to the organization and what needs to be communicated?',
        'Are legal and other requirements taken into account when establishing, implementing, maintaining, and continually improving the OH&S management system?',
      ],
      evidence: [
        'Legal requirements register listing applicable OH&S legislation, regulations, codes of practice, and other requirements',
        'Evidence of a process for monitoring changes in legal requirements (e.g., subscriptions to legal update services, regulatory monitoring records)',
        'Records demonstrating communication of relevant legal requirements to affected workers and stakeholders',
      ],
      mandatory: true,
    },
    {
      clause: '6.1.4',
      title: 'Planning action',
      questions: [
        'Has the organization planned actions to address identified OH&S risks and opportunities, legal and other requirements, and to prepare for and respond to emergency situations?',
        'Do the planned actions apply the hierarchy of controls (elimination, substitution, engineering controls, administrative controls, PPE) and consider best practices and technological options?',
        'Does the organization plan how to integrate and implement the actions into its OH&S management system processes and evaluate the effectiveness of these actions?',
        'Are planned actions proportionate to the level of risk and reviewed periodically for effectiveness?',
      ],
      evidence: [
        'Action plans with specific measures applying the hierarchy of controls for significant OH&S risks',
        'Records showing evaluation of the effectiveness of implemented risk reduction measures',
        'Evidence that the hierarchy of controls is consistently applied in selecting control measures',
      ],
      mandatory: true,
    },
    {
      clause: '6.2',
      title: 'OH&S objectives and planning to achieve them',
      questions: [
        'Has the organization established OH&S objectives at relevant functions, levels, and processes needed to maintain and continually improve the OH&S management system?',
        'Are the OH&S objectives consistent with the OH&S policy, measurable (or capable of performance evaluation), monitored, communicated, and updated as appropriate?',
        'Do the objectives take into account applicable legal and other requirements, consultation with workers, and the results of the assessment of OH&S risks and opportunities?',
        'When planning how to achieve its OH&S objectives, has the organization determined what will be done, what resources are required, who will be responsible, when it will be completed, and how results will be evaluated?',
      ],
      evidence: [
        'Documented OH&S objectives with measurable targets, responsible persons, timelines, and resource allocations',
        'Action plans for achieving each OH&S objective including key performance indicators (KPIs)',
        'Records of monitoring and measurement of progress toward OH&S objectives',
        'Evidence that workers were consulted in the establishment of OH&S objectives',
      ],
      mandatory: true,
    },

    // ───────────────────────────────────────────────
    // Clause 7 — Support
    // ───────────────────────────────────────────────
    {
      clause: '7.1',
      title: 'Resources',
      questions: [
        'Has the organization determined and provided the resources needed for the establishment, implementation, maintenance, and continual improvement of the OH&S management system?',
        'Are resources adequate to implement and maintain the OH&S management system and to improve OH&S performance, considering both human resources and specialized skills, organizational infrastructure, and financial resources?',
        'Is there a process for reviewing resource adequacy in response to changes such as new equipment, processes, legal requirements, or following incidents?',
      ],
      evidence: [
        'OH&S budget documentation showing allocated financial resources for health and safety activities',
        'Resource planning records including staffing levels for OH&S functions',
        'Records of infrastructure and equipment investments made to support OH&S (e.g., PPE procurement, engineering controls, safety equipment)',
      ],
      mandatory: true,
    },
    {
      clause: '7.2',
      title: 'Competence',
      questions: [
        'Has the organization determined the necessary competence of workers that affects or can affect OH&S performance, including the ability to identify hazards?',
        'Are workers competent on the basis of appropriate education, training, or experience?',
        'Where applicable, has the organization taken actions to acquire and maintain the necessary competence, and evaluated the effectiveness of those actions?',
        'Is documented information retained as evidence of competence, including records of training, qualifications, and experience assessments?',
      ],
      evidence: [
        'Training needs analysis specific to OH&S competencies for different job roles',
        'Training records demonstrating completion of OH&S-related training (e.g., hazard recognition, emergency procedures, equipment operation)',
        'Competency assessment records showing evaluation of worker OH&S competencies',
        'Certificates, licences, or qualifications for roles requiring specialized OH&S competencies (e.g., forklift operation, confined space entry, first aid)',
      ],
      mandatory: true,
    },
    {
      clause: '7.3',
      title: 'Awareness',
      questions: [
        'Are workers made aware of the OH&S policy and relevant OH&S objectives?',
        'Are workers aware of their contribution to the effectiveness of the OH&S management system, including the benefits of improved OH&S performance?',
        'Are workers aware of the implications and potential consequences of not conforming with the OH&S management system requirements, including the actual or potential consequences of their work activities on OH&S?',
        'Are workers aware of incidents and outcomes of investigations relevant to them, and of hazards, OH&S risks, and actions determined that are relevant to them?',
        'Are workers informed of their ability to remove themselves from work situations that they consider present an imminent and serious danger, and of the arrangements for protecting them from undue consequences for doing so?',
      ],
      evidence: [
        'Records of induction and ongoing awareness training covering OH&S policy, hazards, and worker rights',
        'Toolbox talk records, safety briefing attendance registers, and safety notice boards',
        "Evidence of communication about workers' right to remove themselves from dangerous situations without reprisal",
      ],
      mandatory: true,
    },
    {
      clause: '7.4',
      title: 'Communication',
      questions: [
        'Has the organization determined the internal and external communications relevant to the OH&S management system, including what it will communicate, when, with whom, and how?',
        'Does the organization ensure that workers are able to contribute to continual improvement through its communication processes?',
        'Are communication processes designed to ensure that relevant OH&S information reaches all affected workers, including contractors and visitors?',
        'Does the communication process take into account diversity aspects such as language, literacy, and disability?',
      ],
      evidence: [
        'Communication plan or procedure specifying OH&S-related internal and external communications',
        'Records of safety communications (e.g., safety alerts, bulletins, newsletters, shift handover notes)',
        'Evidence that OH&S communications accommodate language, literacy, and accessibility requirements of the workforce',
      ],
      mandatory: true,
    },
    {
      clause: '7.5',
      title: 'Documented information',
      questions: [
        'Does the OH&S management system include documented information required by ISO 45001:2018 and any additional documented information determined by the organization as necessary for the effectiveness of the OH&S management system?',
        'When creating and updating documented information, does the organization ensure appropriate identification, format, and review and approval for suitability and adequacy?',
        'Is documented information controlled to ensure it is available and suitable for use where and when needed, and adequately protected against loss of confidentiality, improper use, or loss of integrity?',
        'Are document retention periods defined, particularly for records of incidents, risk assessments, health surveillance, training, and monitoring results?',
      ],
      evidence: [
        'Document control procedure and master document list for the OH&S management system',
        'Evidence of version control, approval processes, and distribution controls for OH&S documents',
        'Records retention schedule specifying retention periods for OH&S records in line with legal requirements',
      ],
      mandatory: true,
    },

    // ───────────────────────────────────────────────
    // Clause 8 — Operation
    // ───────────────────────────────────────────────
    {
      clause: '8.1',
      title: 'Operational planning and control',
      questions: [
        'Has the organization planned, implemented, controlled, and maintained processes needed to meet OH&S management system requirements and to implement the actions identified in Clause 6?',
        'Are criteria established for OH&S processes and are controls implemented in accordance with those criteria?',
        'Does the organization control planned changes and review the consequences of unintended changes, taking action to mitigate any adverse effects?',
        'Does the organization ensure that outsourced processes affecting OH&S performance are controlled within the OH&S management system?',
      ],
      evidence: [
        'Standard operating procedures (SOPs), safe work method statements (SWMS), or work instructions incorporating OH&S controls',
        'Permit-to-work systems for high-risk activities (e.g., hot work, confined space, working at height, electrical isolation)',
        'Records of control measures for outsourced processes and contractor management procedures',
      ],
      mandatory: true,
    },
    {
      clause: '8.1.2',
      title: 'Eliminating hazards and reducing OH&S risks',
      questions: [
        'Has the organization established processes for the elimination of hazards and the reduction of OH&S risks using the hierarchy of controls?',
        'Is the hierarchy of controls applied in the correct order: elimination, substitution, engineering controls, administrative controls (including training), and personal protective equipment?',
        'Are existing controls reviewed for their adequacy and are modifications made when they are found to be inadequate or no longer effective?',
        'Does the organization consider the use of adapted work practices to eliminate or reduce risks when introducing new products, processes, or services?',
      ],
      evidence: [
        'Risk assessment records demonstrating systematic application of the hierarchy of controls',
        'Records of hazard elimination or substitution projects (e.g., replacing hazardous substances, redesigning workstations)',
        'Engineering control implementation records (e.g., machine guarding, ventilation systems, noise reduction measures)',
        'PPE assessment, selection, and issue records confirming PPE is used as a last resort',
      ],
      mandatory: true,
    },
    {
      clause: '8.1.3',
      title: 'Management of change',
      questions: [
        'Has the organization established processes for the implementation and control of planned temporary and permanent changes that impact OH&S performance?',
        'Do the management of change processes address new products, services, processes, or changes to existing ones, changes in work organization, legal requirements, knowledge of hazards and OH&S risks, and developments in technology?',
        'Are the consequences of unintended changes reviewed, and is action taken to mitigate any adverse effects on OH&S?',
        'Are workers informed about and involved in changes that affect their health and safety?',
      ],
      evidence: [
        'Management of change (MOC) procedure and completed MOC forms for recent changes',
        'Pre-change risk assessments demonstrating that OH&S implications were evaluated before implementing changes',
        'Records of worker consultation prior to implementing changes affecting their health and safety',
      ],
      mandatory: true,
    },
    {
      clause: '8.1.4',
      title: 'Procurement',
      questions: [
        'Has the organization established controls to ensure that the procurement of goods (e.g., products, hazardous materials, raw materials, equipment) and services (e.g., contractors, outsourced functions) conforms to its OH&S management system requirements?',
        'Are OH&S requirements communicated to contractors and are their OH&S performance and capabilities evaluated before engagement?',
        'Does the procurement process ensure that equipment, materials, and substances purchased do not introduce uncontrolled hazards to the workplace?',
      ],
      evidence: [
        'Contractor prequalification and OH&S evaluation records including assessment criteria',
        'Procurement specifications that include OH&S requirements for equipment, materials, and services',
        'Safety data sheets (SDS) and hazard information for procured substances and materials',
        'Records of contractor OH&S inductions, monitoring, and performance evaluations',
      ],
      mandatory: true,
    },
    {
      clause: '8.2',
      title: 'Emergency preparedness and response',
      questions: [
        'Has the organization established, implemented, and maintained processes needed to prepare for and respond to potential emergency situations, including provision of first aid?',
        'Has the organization planned response actions to identified emergency scenarios, including considering the needs of all relevant interested parties (e.g., emergency services, neighbours)?',
        'Does the organization periodically test and exercise the planned emergency response actions, including drills and simulations?',
        'Does the organization review and revise emergency preparedness and response plans after testing, incidents, or changes in operations?',
        'Does the organization provide relevant information and training related to emergency preparedness and response to all workers, including contractors and visitors?',
      ],
      evidence: [
        'Emergency response plans and procedures covering identified emergency scenarios (fire, chemical spill, medical emergency, natural disaster, etc.)',
        'Emergency drill records including dates, scenarios, participants, observations, and corrective actions',
        'First aid equipment inventories, inspection records, and trained first aider registers',
        'Emergency communication procedures and contact lists, including coordination with external emergency services',
      ],
      mandatory: true,
    },

    // ───────────────────────────────────────────────
    // Clause 9 — Performance Evaluation
    // ───────────────────────────────────────────────
    {
      clause: '9.1',
      title: 'Monitoring, measurement, analysis, and performance evaluation',
      questions: [
        'Has the organization determined what needs to be monitored and measured for OH&S performance, including the extent to which legal requirements and other requirements are fulfilled?',
        'Has the organization determined the methods for monitoring, measurement, analysis, and performance evaluation, and the criteria against which OH&S performance will be evaluated?',
        'Are both leading indicators (e.g., training completion, inspection rates, near-miss reports) and lagging indicators (e.g., injury rates, lost time days, illness rates) monitored?',
        'Does the organization ensure that monitoring and measuring equipment is calibrated or verified as applicable?',
        'Does the organization evaluate OH&S performance and determine the effectiveness of the OH&S management system?',
      ],
      evidence: [
        'OH&S performance metrics dashboard or reports including both leading and lagging indicators',
        'Workplace inspection and safety observation records with trend analysis',
        'Health surveillance and occupational exposure monitoring records (e.g., noise surveys, air quality monitoring, biological monitoring)',
        'Calibration records for monitoring and measuring equipment used for OH&S purposes',
      ],
      mandatory: true,
    },
    {
      clause: '9.1.2',
      title: 'Evaluation of compliance',
      questions: [
        'Has the organization established, implemented, and maintained processes for evaluating compliance with legal requirements and other requirements?',
        'Has the organization determined the frequency and methods for evaluation of compliance?',
        'Does the organization take action if needed as a result of the evaluation of compliance, and maintain knowledge and understanding of its compliance status?',
        'Are the results of compliance evaluations retained as documented information?',
      ],
      evidence: [
        'Compliance evaluation procedure specifying frequency, scope, and methodology',
        'Completed compliance evaluation records or audit reports against specific OH&S legislation and regulations',
        'Action plans and corrective actions arising from compliance evaluations',
      ],
      mandatory: true,
    },
    {
      clause: '9.2',
      title: 'Internal audit',
      questions: [
        "Does the organization conduct internal audits at planned intervals to provide information on whether the OH&S management system conforms to ISO 45001 requirements and the organization's own requirements, and is effectively implemented and maintained?",
        'Has the organization established, implemented, and maintained an internal audit programme including frequency, methods, responsibilities, and reporting requirements?',
        'Are audit criteria and scope defined for each audit, and are auditors selected to ensure objectivity and impartiality?',
        "Are audit findings and results reported to relevant management, workers, and workers' representatives?",
        'Does the organization take necessary corrective action without undue delay in response to audit findings?',
      ],
      evidence: [
        'Internal audit programme and schedule covering all clauses of ISO 45001 and all OH&S management system processes',
        'Completed internal audit reports including scope, criteria, findings, nonconformities, and conclusions',
        'Auditor competence and qualification records demonstrating independence and impartiality',
        'Corrective action records arising from internal audit findings with evidence of closure and effectiveness verification',
      ],
      mandatory: true,
    },
    {
      clause: '9.3',
      title: 'Management review',
      questions: [
        'Does top management review the OH&S management system at planned intervals to ensure its continuing suitability, adequacy, and effectiveness?',
        'Does the management review consider the status of actions from previous management reviews, changes in external and internal issues, OH&S performance and trends, and the adequacy of resources?',
        'Does the management review consider the results of worker consultation and participation, relevant communications from interested parties, opportunities for continual improvement, and the effectiveness of actions taken to address risks and opportunities?',
        'Do the outputs of management review include decisions related to the continuing suitability, adequacy, and effectiveness of the OH&S management system, continual improvement opportunities, and any need for changes?',
        "Are the results of management reviews communicated to workers and workers' representatives?",
      ],
      evidence: [
        'Management review meeting minutes including all required input topics and documented output decisions',
        'Attendance records showing top management participation in the review',
        'Action items arising from management reviews with assigned responsibilities, deadlines, and follow-up records',
        "Evidence that management review outputs were communicated to workers and workers' representatives",
      ],
      mandatory: true,
    },

    // ───────────────────────────────────────────────
    // Clause 10 — Improvement
    // ───────────────────────────────────────────────
    {
      clause: '10.1',
      title: 'General',
      questions: [
        'Has the organization determined and selected opportunities for improvement and implemented necessary actions to achieve the intended outcomes of the OH&S management system?',
        'Does the organization consider the results of analysis and evaluation of OH&S performance, internal audits, management reviews, and worker participation when identifying improvement opportunities?',
        'Does the organization systematically enhance OH&S performance, promote a culture that supports the OH&S management system, and promote the participation of workers in implementing improvement actions?',
      ],
      evidence: [
        'Improvement action register or log tracking identified opportunities, implemented actions, and outcomes',
        'Records linking improvement initiatives to specific inputs (e.g., audit findings, incident investigations, performance trends, worker suggestions)',
        'Evidence of a systematic approach to identifying and prioritizing OH&S improvement opportunities',
      ],
      mandatory: true,
    },
    {
      clause: '10.2',
      title: 'Incident, nonconformity, and corrective action',
      questions: [
        'Has the organization established, implemented, and maintained processes for reporting, investigating, and taking action to determine and manage incidents and nonconformities, including near-misses?',
        'When an incident or nonconformity occurs, does the organization react in a timely manner to control and correct it and deal with the consequences?',
        'Does the organization investigate incidents and nonconformities to determine root causes using appropriate methodologies (e.g., 5-Why, fishbone analysis, fault tree analysis)?',
        'Does the organization determine and implement corrective action needed, including actions to address root causes, and review the effectiveness of corrective actions taken?',
        'Does the organization determine whether similar incidents or nonconformities exist, or could potentially occur, elsewhere in the organization?',
      ],
      evidence: [
        'Incident reporting records including near-misses, dangerous occurrences, injuries, and ill health cases',
        'Completed incident investigation reports demonstrating root cause analysis and identification of contributing factors',
        'Corrective action records with evidence of implementation, effectiveness verification, and closure',
        'Trend analysis of incidents and nonconformities showing patterns and systemic issues addressed',
      ],
      mandatory: true,
    },
    {
      clause: '10.3',
      title: 'Continual improvement',
      questions: [
        'Does the organization continually improve the suitability, adequacy, and effectiveness of the OH&S management system?',
        'Does the organization enhance OH&S performance by improving organizational culture, worker participation, and the effectiveness of actions to address risks and opportunities?',
        'Does the organization use the results of monitoring, measurement, analysis, evaluation, audits, management reviews, and incident investigations to drive continual improvement?',
        "Does the organization communicate the relevant results of continual improvement to its workers and workers' representatives?",
      ],
      evidence: [
        'Continual improvement programme or plan with defined targets, timescales, and responsibilities',
        'Trend data demonstrating measurable improvement in OH&S performance over time (e.g., reduced incident rates, improved compliance scores, increased near-miss reporting)',
        'Records of implemented improvement initiatives and their measured impact on OH&S performance',
        'Evidence that continual improvement outcomes are communicated to workers',
      ],
      mandatory: true,
    },
  ],
};
