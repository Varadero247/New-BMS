import type { StandardChecklist } from './types';

export const iso14001Checklist: StandardChecklist = {
  standard: 'ISO_14001',
  version: '2015',
  title: 'Environmental Management Systems — Requirements with guidance for use',
  clauses: [
    // ─────────────────────────────────────────────────────────────────────────
    // Clause 4: Context of the Organization
    // ─────────────────────────────────────────────────────────────────────────
    {
      clause: '4.1',
      title: 'Understanding the organization and its context',
      questions: [
        'Has the organization determined the external and internal issues relevant to its purpose that affect its ability to achieve the intended outcomes of the EMS?',
        'Are environmental conditions capable of affecting or being affected by the organization identified (e.g., climate, air quality, water quality, land use, contamination, natural resource availability, biodiversity)?',
        'Is there a documented process for monitoring and reviewing information about these internal and external issues on a regular basis?',
        'Have factors such as regulatory changes, technological developments, market shifts, and community expectations been considered as external issues?',
      ],
      evidence: [
        'SWOT analysis, PESTLE analysis, or equivalent context assessment documents addressing environmental factors',
        'Minutes of management meetings where internal and external issues were reviewed',
        'Register or log of identified environmental conditions and contextual factors with review dates',
      ],
      mandatory: true,
    },
    {
      clause: '4.2',
      title: 'Understanding the needs and expectations of interested parties',
      questions: [
        'Has the organization determined the interested parties that are relevant to the EMS (e.g., regulators, neighbours, customers, employees, NGOs, insurers)?',
        'Have the relevant needs and expectations (requirements) of these interested parties been identified, including those that become compliance obligations?',
        'Is there a process for periodically reviewing and updating the list of interested parties and their requirements?',
        'Are methods of engagement or communication with key interested parties defined?',
      ],
      evidence: [
        'Documented register of interested parties with their identified needs and expectations',
        'Records of stakeholder engagement activities (meetings, consultations, correspondence)',
        'Mapping of interested party requirements to compliance obligations',
      ],
      mandatory: true,
    },
    {
      clause: '4.3',
      title: 'Determining the scope of the environmental management system',
      questions: [
        'Has the organization determined the boundaries and applicability of the EMS to establish its scope?',
        'Does the scope consider the internal and external issues identified in 4.1 and the compliance obligations identified in 4.2?',
        'Are all activities, products, and services within the scope that can have significant environmental aspects included?',
        'Is the scope documented and available to interested parties?',
      ],
      evidence: [
        'Documented EMS scope statement specifying organizational boundaries, sites, and activities covered',
        'Justification records for any exclusions from the EMS scope',
        'Evidence that the scope is available to interested parties (e.g., published on website, included in EMS manual)',
      ],
      mandatory: true,
    },
    {
      clause: '4.4',
      title: 'Environmental management system',
      questions: [
        'Has the organization established, implemented, maintained, and continually improved an EMS in accordance with all requirements of ISO 14001:2015?',
        'Does the EMS address the processes needed and their interactions, including those related to significant environmental aspects and compliance obligations?',
        'Has the organization considered the knowledge gained in 4.1 and 4.2 when establishing the EMS?',
      ],
      evidence: [
        'EMS documentation (manual, process maps, procedures) demonstrating alignment with ISO 14001:2015 structure',
        'Process interaction diagrams or flow charts showing how EMS processes relate to each other',
        'Records of EMS implementation milestones and continual improvement activities',
      ],
      mandatory: true,
    },

    // ─────────────────────────────────────────────────────────────────────────
    // Clause 5: Leadership
    // ─────────────────────────────────────────────────────────────────────────
    {
      clause: '5.1',
      title: 'Leadership and commitment',
      questions: [
        'Does top management demonstrate leadership and commitment with respect to the EMS by taking accountability for its effectiveness?',
        'Has top management ensured that the environmental policy and environmental objectives are established and are compatible with the strategic direction and context of the organization?',
        "Has top management ensured that the requirements of the EMS are integrated into the organization's business processes?",
        'Are adequate resources available for the EMS, and does top management direct and support persons to contribute to EMS effectiveness?',
        'Does top management promote continual improvement and support other relevant management roles to demonstrate leadership in their areas of responsibility?',
      ],
      evidence: [
        'Records of management review meetings demonstrating active top management participation and decision-making',
        'Budget allocations and resource plans for environmental management activities',
        'Communications from top management (memos, presentations, policy statements) promoting environmental commitment',
        'Evidence of EMS integration into business planning, capital expenditure, and operational processes',
      ],
      mandatory: true,
    },
    {
      clause: '5.2',
      title: 'Environmental policy',
      questions: [
        'Has top management established an environmental policy that is appropriate to the purpose and context of the organization, including the nature, scale, and environmental impacts of its activities, products, and services?',
        'Does the policy include a commitment to the protection of the environment, including prevention of pollution and other specific commitments relevant to the context (e.g., sustainable resource use, climate change mitigation, biodiversity protection)?',
        'Does the policy include a commitment to fulfil compliance obligations?',
        'Does the policy include a commitment to continual improvement of the EMS to enhance environmental performance?',
        'Is the policy communicated within the organization, documented, and available to interested parties?',
      ],
      evidence: [
        'Current signed and dated environmental policy document',
        'Records of policy communication to employees and contractors (training records, induction materials, notice boards)',
        'Evidence of policy availability to external interested parties (website publication, public display)',
        'Records of periodic policy review and any updates made',
      ],
      mandatory: true,
    },
    {
      clause: '5.3',
      title: 'Organizational roles, responsibilities and authorities',
      questions: [
        'Has top management assigned responsibility and authority for ensuring the EMS conforms to ISO 14001:2015 requirements?',
        'Has responsibility and authority been assigned for reporting on the performance of the EMS, including environmental performance, to top management?',
        'Are roles, responsibilities, and authorities for environmentally relevant functions clearly defined and communicated within the organization?',
        'Is there a designated management representative or equivalent role with overall EMS accountability?',
      ],
      evidence: [
        'Organizational charts showing environmental management roles and reporting lines',
        'Job descriptions or role profiles that include environmental responsibilities',
        'Appointment letters or terms of reference for EMS management representative or environmental manager',
      ],
      mandatory: true,
    },

    // ─────────────────────────────────────────────────────────────────────────
    // Clause 6: Planning
    // ─────────────────────────────────────────────────────────────────────────
    {
      clause: '6.1',
      title: 'Actions to address risks and opportunities',
      questions: [
        'Has the organization considered the issues from 4.1, requirements from 4.2, and the scope from 4.3 when determining the risks and opportunities that need to be addressed?',
        'Do the planned actions address significant environmental aspects, compliance obligations, and other identified risks and opportunities?',
        'Has the organization determined potential emergency situations, including those with an environmental impact?',
        'Are the planned actions proportionate to the potential environmental impact and integrated into EMS and business processes?',
      ],
      evidence: [
        'Risk and opportunity register or assessment matrix linked to environmental aspects and compliance obligations',
        'Action plans for addressing identified risks and opportunities with assigned owners and target dates',
        'Records of emergency situation identification and analysis',
      ],
      mandatory: true,
    },
    {
      clause: '6.1.2',
      title: 'Environmental aspects',
      questions: [
        'Has the organization determined the environmental aspects of its activities, products, and services that it can control and those it can influence, including a life cycle perspective?',
        'Has the organization determined those aspects that have or can have a significant environmental impact using established criteria?',
        'Are significant environmental aspects communicated among the various levels and functions of the organization?',
        'Does the aspect identification consider normal, abnormal, and emergency operating conditions, as well as past, current, and planned activities?',
        'Are changes to activities, products, services, or new developments considered when identifying environmental aspects?',
      ],
      evidence: [
        'Environmental aspects and impacts register with significance scoring methodology and results',
        'Life cycle assessment documentation or life cycle perspective analysis for key products and services',
        'Records showing communication of significant aspects to relevant personnel (training records, briefings)',
        'Evidence of aspect review when changes or new developments occur (management of change records)',
      ],
      mandatory: true,
    },
    {
      clause: '6.1.3',
      title: 'Compliance obligations',
      questions: [
        'Has the organization identified and had access to the compliance obligations related to its environmental aspects?',
        'Has the organization determined how these compliance obligations apply to the organization?',
        'Are compliance obligations taken into account when establishing, implementing, maintaining, and continually improving the EMS?',
        'Is there a process for identifying new or changed compliance obligations in a timely manner?',
      ],
      evidence: [
        'Legal and other requirements register listing applicable environmental legislation, permits, licences, and voluntary commitments',
        'Evidence of access to current legal texts (subscriptions to legal update services, regulatory databases)',
        'Mapping of compliance obligations to specific organizational activities, aspects, and operational controls',
      ],
      mandatory: true,
    },
    {
      clause: '6.1.4',
      title: 'Planning action',
      questions: [
        'Has the organization planned actions to address its significant environmental aspects, compliance obligations, and identified risks and opportunities?',
        'Has the organization planned how to integrate and implement these actions into EMS processes or other business processes?',
        'Has the organization planned how to evaluate the effectiveness of these actions?',
      ],
      evidence: [
        'Action plans with defined responsibilities, resources, timelines, and expected outcomes',
        'Evidence of action plan integration into operational procedures, capital plans, or project plans',
        'Records of effectiveness evaluations for completed actions (KPIs, monitoring data, review records)',
      ],
      mandatory: true,
    },
    {
      clause: '6.2',
      title: 'Environmental objectives and planning to achieve them',
      questions: [
        'Has the organization established environmental objectives at relevant functions, levels, and processes?',
        'Are the objectives consistent with the environmental policy, measurable (where practicable), monitored, communicated, and updated as appropriate?',
        'Do the objectives take into account significant environmental aspects, associated compliance obligations, and risks and opportunities?',
        'Has the organization determined what will be done, what resources will be required, who will be responsible, when it will be completed, and how results will be evaluated for each objective?',
      ],
      evidence: [
        'Documented environmental objectives and targets with measurable indicators (e.g., emission reduction percentages, waste diversion rates, energy intensity targets)',
        'Environmental management programmes or action plans detailing resources, responsibilities, and timelines for achieving objectives',
        'Progress reports and trend analyses showing performance against objectives',
        'Records of objective reviews and updates at management review or planning meetings',
      ],
      mandatory: true,
    },

    // ─────────────────────────────────────────────────────────────────────────
    // Clause 7: Support
    // ─────────────────────────────────────────────────────────────────────────
    {
      clause: '7.1',
      title: 'Resources',
      questions: [
        'Has the organization determined and provided the resources needed for the establishment, implementation, maintenance, and continual improvement of the EMS?',
        'Are financial, human, technological, and infrastructure resources adequate for managing environmental aspects and achieving objectives?',
        'Is there a budgeting process that accounts for environmental management needs, including pollution prevention equipment, monitoring instruments, and training?',
      ],
      evidence: [
        'EMS budget or resource allocation records demonstrating investment in environmental management',
        'Staffing plans showing dedicated environmental management personnel or allocated responsibilities',
        'Capital expenditure records for pollution control equipment, monitoring instruments, or environmental improvement projects',
      ],
      mandatory: true,
    },
    {
      clause: '7.2',
      title: 'Competence',
      questions: [
        'Has the organization determined the necessary competence of persons doing work under its control that affects its environmental performance and its ability to fulfil compliance obligations?',
        'Are these persons competent on the basis of appropriate education, training, or experience?',
        'Where applicable, has the organization taken actions to acquire the necessary competence and evaluated the effectiveness of those actions?',
        'Does competence management extend to contractors and other external persons working under organizational control?',
      ],
      evidence: [
        'Competence matrix or skills register mapping required environmental competencies to roles',
        'Training records, qualifications, and certificates for personnel in environmentally significant roles (e.g., waste handlers, spill responders, emissions monitors)',
        'Training effectiveness evaluations (post-training assessments, practical demonstrations, observation records)',
        'Contractor competence verification records (pre-qualification assessments, induction records)',
      ],
      mandatory: true,
    },
    {
      clause: '7.3',
      title: 'Awareness',
      questions: [
        'Are persons doing work under organizational control aware of the environmental policy?',
        'Are they aware of the significant environmental aspects and related actual or potential environmental impacts associated with their work?',
        'Are they aware of their contribution to the effectiveness of the EMS, including the benefits of enhanced environmental performance?',
        'Are they aware of the implications of not conforming with EMS requirements, including not fulfilling compliance obligations?',
      ],
      evidence: [
        'Induction and orientation records demonstrating environmental awareness content delivery',
        'Toolbox talks, briefings, or awareness campaign materials on environmental topics',
        'Signed acknowledgment records confirming personnel understanding of environmental responsibilities',
      ],
      mandatory: true,
    },
    {
      clause: '7.4',
      title: 'Communication',
      questions: [
        'Has the organization determined the internal and external communications relevant to the EMS, including what, when, with whom, and how to communicate?',
        'Does the organization ensure that environmental information communicated is consistent with information generated within the EMS and is reliable?',
        'Does the organization respond to relevant communications on its EMS from external interested parties?',
        'Has the organization considered its compliance obligations when establishing communication processes?',
        'Are records of communications maintained?',
      ],
      evidence: [
        'Communication plan or procedure specifying internal and external environmental communications (topics, frequency, audiences, methods)',
        'Records of external communications with regulators, neighbours, and other interested parties (complaint logs, regulatory correspondence, community meeting minutes)',
        'Internal communication records (environmental bulletins, intranet updates, notice board photographs)',
        'Records of responses to external enquiries or complaints about environmental matters',
      ],
      mandatory: true,
    },
    {
      clause: '7.5',
      title: 'Documented information',
      questions: [
        'Does the EMS include documented information required by ISO 14001:2015 and any additional documented information determined by the organization as necessary for EMS effectiveness?',
        'Is documented information appropriately identified, described (title, date, author, reference number), and in a suitable format and media?',
        'Is documented information reviewed and approved for suitability and adequacy?',
        'Is documented information controlled to ensure it is available and suitable for use where and when needed, and adequately protected from loss of confidentiality, improper use, or loss of integrity?',
      ],
      evidence: [
        'Document control procedure covering creation, review, approval, distribution, and obsolescence of EMS documents',
        'Master document list or register with version control, approval status, and distribution records',
        'Examples of controlled documents (procedures, work instructions, forms) showing proper identification, dating, and approval signatures',
        'Records of document reviews and updates demonstrating the control process in action',
      ],
      mandatory: true,
    },

    // ─────────────────────────────────────────────────────────────────────────
    // Clause 8: Operation
    // ─────────────────────────────────────────────────────────────────────────
    {
      clause: '8.1',
      title: 'Operational planning and control',
      questions: [
        'Has the organization established, implemented, controlled, and maintained the processes needed to meet EMS requirements and to implement the actions identified in clause 6?',
        'Are operational criteria established for processes where their absence could lead to deviation from the environmental policy, objectives, and compliance obligations?',
        'Are controls implemented for the procurement of products and services to ensure environmental requirements are addressed, including relevant requirements for contractors and outsourced processes?',
        'Does the organization consider the life cycle perspective when establishing controls for product design, delivery, use, and end-of-life treatment?',
        'Is appropriate environmental information provided to relevant external providers, including contractors?',
      ],
      evidence: [
        'Operational control procedures for activities associated with significant environmental aspects (e.g., waste management, chemical storage, emissions control, wastewater treatment)',
        'Work instructions or standard operating procedures specifying environmental operational criteria and limits',
        'Contractor management records showing environmental requirements in contracts, purchase orders, and service agreements',
        'Life cycle considerations documented in design reviews, procurement specifications, or product stewardship programmes',
      ],
      mandatory: true,
    },
    {
      clause: '8.2',
      title: 'Emergency preparedness and response',
      questions: [
        'Has the organization established, implemented, and maintained the processes needed to prepare for and respond to potential emergency situations identified in 6.1?',
        'Has the organization planned actions to prevent or mitigate adverse environmental impacts from emergency situations?',
        'Does the organization periodically test planned response actions (e.g., drills, simulations)?',
        'Does the organization periodically review and revise processes and planned response actions, particularly after the occurrence of emergency situations or testing?',
        'Does the organization provide relevant information and training related to emergency preparedness and response to relevant interested parties, including workers?',
      ],
      evidence: [
        'Emergency preparedness and response plans covering environmental incidents (spills, releases, fires, flooding) with roles, procedures, and contact information',
        'Records of emergency drills and exercises with documented outcomes and lessons learned',
        'Spill kit and emergency equipment inspection and maintenance records',
        'Post-incident and post-drill review reports with corrective actions taken',
      ],
      mandatory: true,
    },

    // ─────────────────────────────────────────────────────────────────────────
    // Clause 9: Performance Evaluation
    // ─────────────────────────────────────────────────────────────────────────
    {
      clause: '9.1',
      title: 'Monitoring, measurement, analysis and evaluation',
      questions: [
        'Has the organization determined what needs to be monitored and measured in relation to its significant environmental aspects, compliance obligations, operational controls, and progress toward objectives?',
        'Has the organization determined the methods for monitoring, measurement, analysis, and evaluation to ensure valid results?',
        'Has the organization determined when monitoring and measuring shall be performed and when results shall be analysed and evaluated?',
        'Is monitoring and measuring equipment calibrated or verified at specified intervals, or prior to use?',
        'Does the organization evaluate its environmental performance and the effectiveness of the EMS?',
      ],
      evidence: [
        'Environmental monitoring programme specifying parameters, methods, frequencies, locations, and responsibilities (e.g., emissions monitoring, effluent testing, noise surveys, energy metering)',
        'Monitoring and measurement results and trend analyses (emission reports, waste generation data, energy consumption records, water usage data)',
        'Equipment calibration records and certificates for environmental monitoring instruments',
        'Environmental performance evaluation reports or dashboards presented to management',
      ],
      mandatory: true,
    },
    {
      clause: '9.1.2',
      title: 'Evaluation of compliance',
      questions: [
        'Has the organization established, implemented, and maintained the processes needed to evaluate fulfilment of its compliance obligations?',
        'Has the organization determined the frequency at which compliance will be evaluated?',
        'Does the organization take action if needed when compliance evaluation identifies non-fulfilment?',
        'Does the organization maintain knowledge and understanding of its compliance status?',
      ],
      evidence: [
        'Compliance evaluation procedure defining scope, frequency, methodology, and responsibilities',
        'Completed compliance evaluation records or audit reports against applicable environmental legislation, permits, and other obligations',
        'Regulatory inspection reports and correspondence with environmental authorities',
        'Corrective action records addressing any identified instances of non-compliance',
      ],
      mandatory: true,
    },
    {
      clause: '9.2',
      title: 'Internal audit',
      questions: [
        "Has the organization conducted internal audits at planned intervals to provide information on whether the EMS conforms to ISO 14001:2015 requirements and the organization's own EMS requirements, and is effectively implemented and maintained?",
        'Has the organization established an audit programme including frequency, methods, responsibilities, planning requirements, and reporting, taking into account the environmental importance of processes, changes affecting the organization, and results of previous audits?',
        'Are audit criteria and scope defined for each audit?',
        'Are auditors selected to ensure objectivity and impartiality of the audit process?',
        'Are audit results reported to relevant management?',
      ],
      evidence: [
        'Internal audit programme or schedule showing planned and completed EMS audits with scope and frequency rationale',
        'Internal audit reports with findings, nonconformities, observations, and opportunities for improvement',
        'Auditor competence records (qualifications, training, experience in environmental management and auditing)',
        'Evidence of audit findings being communicated to relevant management and tracked to closure',
      ],
      mandatory: true,
    },
    {
      clause: '9.3',
      title: 'Management review',
      questions: [
        'Does top management review the EMS at planned intervals to ensure its continuing suitability, adequacy, and effectiveness?',
        'Does the management review consider the status of actions from previous reviews, changes in internal/external issues, needs and expectations of interested parties, significant aspects, risks and opportunities, the extent to which objectives have been achieved, and information on environmental performance?',
        'Does the management review consider the adequacy of resources, relevant communications from interested parties (including complaints), and opportunities for continual improvement?',
        'Do management review outputs include conclusions on suitability, adequacy, and effectiveness, as well as decisions related to continual improvement, resource needs, and any changes needed to the EMS?',
      ],
      evidence: [
        'Management review meeting agendas, minutes, and attendance records demonstrating coverage of all required inputs',
        'Management review output records documenting decisions, actions, responsibilities, and timelines',
        'Trend data and performance summaries provided as inputs to management review (environmental KPI dashboards, compliance status reports, audit summaries)',
        'Evidence of follow-through on management review actions from previous periods',
      ],
      mandatory: true,
    },

    // ─────────────────────────────────────────────────────────────────────────
    // Clause 10: Improvement
    // ─────────────────────────────────────────────────────────────────────────
    {
      clause: '10.1',
      title: 'General',
      questions: [
        'Has the organization determined opportunities for improvement and implemented necessary actions to achieve the intended outcomes of the EMS?',
        'Does the organization consider the results of analysis and evaluation (9.1), compliance evaluation (9.1.2), internal audits (9.2), and management reviews (9.3) when determining improvement opportunities?',
        'Is there a systematic approach to identifying and prioritising environmental improvement opportunities?',
      ],
      evidence: [
        'Improvement opportunity register or log capturing ideas from audits, reviews, monitoring data, and employee suggestions',
        'Records of improvement project selection and prioritisation criteria',
        'Evidence linking improvement actions to performance evaluation outputs (audit findings, management review decisions, compliance evaluation results)',
      ],
      mandatory: true,
    },
    {
      clause: '10.2',
      title: 'Nonconformity and corrective action',
      questions: [
        'When a nonconformity occurs (including from complaints), does the organization react by taking action to control and correct it, and deal with the consequences, including mitigating adverse environmental impacts?',
        'Does the organization evaluate the need for action to eliminate the causes of the nonconformity so it does not recur or occur elsewhere, by reviewing the nonconformity, determining causes, and determining if similar nonconformities exist or could occur?',
        'Does the organization implement any corrective action needed, review the effectiveness of corrective actions taken, and make changes to the EMS if necessary?',
        'Are nonconformities and corrective actions documented, including the nature of the nonconformity, actions taken, and results of corrective actions?',
        'Is corrective action appropriate to the significance of the effects, including the environmental impacts encountered?',
      ],
      evidence: [
        'Nonconformity and corrective action (CAPA) register or database with records of all identified nonconformities',
        'Root cause analysis records for significant nonconformities (e.g., 5-Why, fishbone diagrams, fault tree analyses)',
        'Evidence of corrective action implementation and documented effectiveness verification',
        'Records of environmental incident investigations with corrective and preventive actions',
      ],
      mandatory: true,
    },
    {
      clause: '10.3',
      title: 'Continual improvement',
      questions: [
        'Does the organization continually improve the suitability, adequacy, and effectiveness of the EMS to enhance environmental performance?',
        'Are the results of monitoring, measurement, auditing, compliance evaluation, and management review used as inputs to drive continual improvement?',
        'Can the organization demonstrate measurable improvement in environmental performance over time (e.g., reduced emissions, decreased waste generation, improved resource efficiency)?',
      ],
      evidence: [
        'Year-over-year environmental performance data demonstrating improvement trends (e.g., carbon footprint reduction, waste recycling rates, water consumption per unit of production)',
        'Continual improvement programme or plan with defined projects, targets, and progress tracking',
        'Benchmarking data or industry comparisons used to identify improvement opportunities',
        'Records of innovation or best practice adoption contributing to enhanced environmental performance',
      ],
      mandatory: true,
    },
  ],
};
