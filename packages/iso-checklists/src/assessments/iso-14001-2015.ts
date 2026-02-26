// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import type { StandardAssessment } from './types';

export const iso14001Assessment: StandardAssessment = {
  standardId: 'iso-14001-2015',
  standardName: 'ISO 14001:2015',
  version: '2015',
  clauses: [
    { id: '4.1', title: 'Understanding the organisation and its context', description: 'Determine external and internal issues related to environmental management.', evidenceExamples: ['Environmental context analysis', 'SWOT analysis', 'Environmental register'], mandatory: true },
    { id: '4.2', title: 'Understanding needs of interested parties', description: 'Determine interested parties and their relevant requirements.', evidenceExamples: ['Stakeholder register', 'Legal obligations register', 'Community engagement records'], mandatory: true },
    { id: '4.3', title: 'Determining scope', description: 'Determine the boundaries and applicability of the EMS.', evidenceExamples: ['EMS scope document', 'Site boundary map', 'Exclusions rationale'], mandatory: true },
    { id: '4.4', title: 'Environmental management system', description: 'Establish, implement, maintain and continually improve an EMS.', evidenceExamples: ['EMS manual', 'Process map', 'System overview'], mandatory: true },
    { id: '5.1', title: 'Leadership and commitment', description: 'Top management shall demonstrate leadership and commitment.', evidenceExamples: ['Environmental policy signed by top management', 'Resource allocation evidence'], mandatory: true },
    { id: '5.2', title: 'Environmental policy', description: 'Establish, implement and maintain an environmental policy.', evidenceExamples: ['Signed environmental policy', 'Communication records'], mandatory: true },
    { id: '5.3', title: 'Organisational roles, responsibilities and authorities', description: 'Assign and communicate roles, responsibilities and authorities.', evidenceExamples: ['Organisation chart', 'Job descriptions', 'Environmental responsibilities matrix'], mandatory: true },
    { id: '6.1.1', title: 'General — risks and opportunities', description: 'Determine environmental risks and opportunities.', evidenceExamples: ['Environmental risk register', 'Aspect register'], mandatory: true },
    { id: '6.1.2', title: 'Environmental aspects', description: 'Determine the environmental aspects of activities, products and services.', evidenceExamples: ['Aspect and impact register', 'Significance determination records', 'Life cycle perspective'], mandatory: true },
    { id: '6.1.3', title: 'Compliance obligations', description: 'Determine compliance obligations related to the EMS.', evidenceExamples: ['Legal register', 'Permit conditions', 'Regulatory correspondence'], mandatory: true },
    { id: '6.1.4', title: 'Planning action', description: 'Plan actions to address significant aspects, compliance obligations, risks.', evidenceExamples: ['Environmental action plan', 'Control measures register'], mandatory: true },
    { id: '6.2', title: 'Environmental objectives and planning', description: 'Establish environmental objectives at relevant functions.', evidenceExamples: ['Environmental objectives register', 'KPI dashboard', 'Targets and programmes'], mandatory: true },
    { id: '7.1', title: 'Resources', description: 'Determine and provide resources for the EMS.', evidenceExamples: ['Environmental budget', 'Resource allocation records'], mandatory: true },
    { id: '7.2', title: 'Competence', description: 'Determine the necessary competence of workers.', evidenceExamples: ['Training matrix', 'Environmental training records', 'Certificates'], mandatory: true },
    { id: '7.3', title: 'Awareness', description: 'Workers shall be aware of the environmental policy and significant aspects.', evidenceExamples: ['Induction records', 'Environmental awareness records'], mandatory: true },
    { id: '7.4', title: 'Communication', description: 'Establish processes for internal and external environmental communication.', evidenceExamples: ['Communication plan', 'Environmental report', 'Stakeholder communications'], mandatory: true },
    { id: '7.5', title: 'Documented information', description: 'Maintain documented information required by ISO 14001.', evidenceExamples: ['Document register', 'Document control procedure'], mandatory: true },
    { id: '8.1', title: 'Operational planning and control', description: 'Establish, implement and control processes to manage significant aspects.', evidenceExamples: ['Operational procedures', 'Waste management records', 'Energy records'], mandatory: true },
    { id: '8.2', title: 'Emergency preparedness and response', description: 'Prepare for and respond to potential environmental emergency situations.', evidenceExamples: ['Environmental emergency plan', 'Drill records', 'Spill kit inspection records'], mandatory: true },
    { id: '9.1', title: 'Monitoring, measurement, analysis and evaluation', description: 'Monitor, measure, analyse and evaluate environmental performance.', evidenceExamples: ['KPI reports', 'Emission records', 'Discharge monitoring data', 'Energy data'], mandatory: true },
    { id: '9.2', title: 'Internal audit', description: 'Conduct internal audits at planned intervals.', evidenceExamples: ['Audit programme', 'Audit reports', 'Corrective action records'], mandatory: true },
    { id: '9.3', title: 'Management review', description: 'Top management shall review the EMS at planned intervals.', evidenceExamples: ['Management review minutes', 'Review outputs', 'Action plan'], mandatory: true },
    { id: '10.1', title: 'Nonconformity and corrective action', description: 'React to nonconformities and take corrective action.', evidenceExamples: ['NCR register', 'Root cause analyses', 'CAPA records'], mandatory: true },
    { id: '10.2', title: 'Continual improvement', description: 'Continually improve the suitability, adequacy and effectiveness of the EMS.', evidenceExamples: ['Improvement register', 'Trend analysis', 'Benchmarking records'], mandatory: true },
  ],
};
