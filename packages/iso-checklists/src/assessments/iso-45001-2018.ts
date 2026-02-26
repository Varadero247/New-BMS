// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import type { StandardAssessment } from './types';

export const iso45001Assessment: StandardAssessment = {
  standardId: 'iso-45001-2018',
  standardName: 'ISO 45001:2018',
  version: '2018',
  clauses: [
    { id: '4.1', title: 'Understanding the organisation and its context', description: 'Determine external and internal issues that affect the OH&S MS.', evidenceExamples: ['Context analysis', 'SWOT/PESTLE', 'Hazard register'], mandatory: true },
    { id: '4.2', title: 'Understanding the needs of workers and other interested parties', description: 'Determine relevant interested parties and their needs related to OH&S.', evidenceExamples: ['Stakeholder register', 'Worker consultation records', 'Legal register'], mandatory: true },
    { id: '4.3', title: 'Determining the scope', description: 'Determine the boundaries and applicability of the OH&S MS.', evidenceExamples: ['Scope statement', 'Exclusions rationale'], mandatory: true },
    { id: '4.4', title: 'OH&S management system', description: 'Establish, implement, maintain and continually improve an OH&S management system.', evidenceExamples: ['OH&S manual', 'Process map', 'System overview'], mandatory: true },
    { id: '5.1', title: 'Leadership and commitment', description: 'Top management shall demonstrate leadership and commitment.', evidenceExamples: ['OH&S policy signed by top management', 'Resource allocation', 'OH&S tours evidence'], mandatory: true },
    { id: '5.2', title: 'OH&S policy', description: 'Top management shall establish, implement and maintain an OH&S policy.', evidenceExamples: ['Signed OH&S policy', 'Communication records', 'Posted policy'], mandatory: true },
    { id: '5.3', title: 'Organisational roles, responsibilities, accountabilities and authorities', description: 'Assign and communicate responsibilities for OH&S.', evidenceExamples: ['Organisation chart', 'Job descriptions', 'OH&S responsibilities matrix'], mandatory: true },
    { id: '5.4', title: 'Consultation and participation of workers', description: 'Establish and maintain processes for consultation and participation of workers.', evidenceExamples: ['Safety committee minutes', 'Worker survey results', 'Consultation records'], mandatory: true },
    { id: '6.1', title: 'Actions to address risks and opportunities', description: 'Determine and assess OH&S risks and opportunities.', evidenceExamples: ['Risk register', 'Hazard identification records', 'Legal compliance register'], mandatory: true },
    { id: '6.2', title: 'OH&S objectives and planning', description: 'Establish OH&S objectives at relevant functions and levels.', evidenceExamples: ['Objectives register', 'KPI dashboard', 'Action plans'], mandatory: true },
    { id: '7.1', title: 'Resources', description: 'Determine and provide resources needed for the OH&S MS.', evidenceExamples: ['Budget allocation', 'OH&S resource plan', 'Equipment records'], mandatory: true },
    { id: '7.2', title: 'Competence', description: 'Determine necessary competence of workers.', evidenceExamples: ['Training matrix', 'Certificates', 'Qualification records'], mandatory: true },
    { id: '7.3', title: 'Awareness', description: 'Workers shall be aware of the OH&S policy and their contribution.', evidenceExamples: ['Induction records', 'Toolbox talks', 'Safety briefing records'], mandatory: true },
    { id: '7.4', title: 'Communication', description: 'Establish processes for internal and external communication.', evidenceExamples: ['Communication plan', 'Safety notice boards', 'Meeting minutes'], mandatory: true },
    { id: '7.5', title: 'Documented information', description: 'Maintain documented information required by ISO 45001.', evidenceExamples: ['Document register', 'Document control procedure', 'Retention schedule'], mandatory: true },
    { id: '8.1', title: 'Operational planning and control', description: 'Plan, implement and control processes to meet OH&S requirements.', evidenceExamples: ['Work instructions', 'RAMS', 'Permits to work', 'Safe systems of work'], mandatory: true },
    { id: '8.1.2', title: 'Eliminating hazards and reducing OH&S risks', description: 'Establish a process to eliminate hazards using the hierarchy of controls.', evidenceExamples: ['Hazard elimination log', 'Control hierarchy evidence', 'Engineering controls records'], mandatory: true },
    { id: '8.1.3', title: 'Management of change', description: 'Establish a process for implementing and controlling planned changes.', evidenceExamples: ['Change control procedure', 'Change request forms', 'Pre-start safety meetings'], mandatory: true },
    { id: '8.1.4', title: 'Procurement', description: 'Establish and maintain processes to control procurement.', evidenceExamples: ['Approved contractor list', 'Contractor evaluation records', 'Purchase specifications'], mandatory: true },
    { id: '8.2', title: 'Emergency preparedness and response', description: 'Establish, implement and maintain processes needed to prepare for and respond to potential emergency situations.', evidenceExamples: ['Emergency response plan', 'Drill records', 'First aid records', 'Fire risk assessment'], mandatory: true },
    { id: '9.1', title: 'Monitoring, measurement, analysis and performance evaluation', description: 'Determine what needs to be monitored and measured.', evidenceExamples: ['KPI reports', 'Inspection records', 'Safety statistics'], mandatory: true },
    { id: '9.1.2', title: 'Evaluation of compliance', description: 'Establish, implement and maintain processes for evaluating compliance.', evidenceExamples: ['Legal compliance audit', 'Compliance register', 'Regulatory inspection records'], mandatory: true },
    { id: '9.2', title: 'Internal audit', description: 'Conduct internal audits at planned intervals.', evidenceExamples: ['Audit programme', 'Audit reports', 'Corrective action records'], mandatory: true },
    { id: '9.3', title: 'Management review', description: 'Top management shall review the OH&S MS at planned intervals.', evidenceExamples: ['Management review minutes', 'Review inputs', 'Action plan'], mandatory: true },
    { id: '10.1', title: 'Incident, nonconformity and corrective action', description: 'When an incident or nonconformity occurs, react and take corrective action.', evidenceExamples: ['Incident reports', 'Root cause analyses', 'CAPA records'], mandatory: true },
    { id: '10.2', title: 'Continual improvement', description: 'Continually improve the suitability, adequacy and effectiveness of the OH&S MS.', evidenceExamples: ['Improvement register', 'Lessons learned', 'Trend analysis'], mandatory: true },
  ],
};
