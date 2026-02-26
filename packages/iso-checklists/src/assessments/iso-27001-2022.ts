// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import type { StandardAssessment } from './types';

export const iso27001Assessment: StandardAssessment = {
  standardId: 'iso-27001-2022',
  standardName: 'ISO 27001:2022',
  version: '2022',
  clauses: [
    { id: '4.1', title: 'Understanding the organisation and its context', description: 'Determine issues relevant to the ISMS.', evidenceExamples: ['Context analysis', 'Asset register', 'Threat landscape'], mandatory: true },
    { id: '4.2', title: 'Understanding needs of interested parties', description: 'Determine interested parties and their requirements relevant to information security.', evidenceExamples: ['Stakeholder register', 'Customer security requirements', 'Regulatory requirements'], mandatory: true },
    { id: '4.3', title: 'Determining the scope', description: 'Determine the boundaries and applicability of the ISMS.', evidenceExamples: ['ISMS scope document', 'Network diagram', 'Data flow diagrams'], mandatory: true },
    { id: '4.4', title: 'Information security management system', description: 'Establish, implement, maintain and continually improve an ISMS.', evidenceExamples: ['ISMS manual', 'Policy framework', 'Statement of Applicability'], mandatory: true },
    { id: '5.1', title: 'Leadership and commitment', description: 'Top management shall demonstrate leadership and commitment.', evidenceExamples: ['IS policy signed by CEO', 'CISO appointment', 'Security budget allocation'], mandatory: true },
    { id: '5.2', title: 'Information security policy', description: 'Establish an information security policy.', evidenceExamples: ['Signed IS policy', 'Policy communication records', 'Accessible policy document'], mandatory: true },
    { id: '5.3', title: 'Roles, responsibilities and authorities', description: 'Assign and communicate IS roles and responsibilities.', evidenceExamples: ['RACI matrix', 'CISO job description', 'Security responsibility assignments'], mandatory: true },
    { id: '6.1', title: 'Actions to address risks and opportunities', description: 'Assess information security risks.', evidenceExamples: ['Risk register', 'Risk assessment methodology', 'Risk treatment plan', 'Statement of Applicability'], mandatory: true },
    { id: '6.2', title: 'Information security objectives', description: 'Establish IS objectives at relevant functions and levels.', evidenceExamples: ['IS objectives register', 'Security KPI dashboard', 'Security roadmap'], mandatory: true },
    { id: '6.3', title: 'Planning of changes', description: 'Plan changes to the ISMS in a controlled manner.', evidenceExamples: ['Change control procedure', 'Change log', 'Impact assessments'], mandatory: true },
    { id: '7.1', title: 'Resources', description: 'Determine and provide necessary resources.', evidenceExamples: ['Security budget', 'Staffing records', 'Tool licences'], mandatory: true },
    { id: '7.2', title: 'Competence', description: 'Determine necessary competence of IS personnel.', evidenceExamples: ['Training matrix', 'Security certifications (CISSP, CISM)', 'Training records'], mandatory: true },
    { id: '7.3', title: 'Awareness', description: 'Workers shall be aware of IS policies and their contribution.', evidenceExamples: ['Security awareness training records', 'Phishing simulation results', 'Policy acknowledgements'], mandatory: true },
    { id: '7.4', title: 'Communication', description: 'Determine internal and external IS communications.', evidenceExamples: ['Communication plan', 'Security bulletin records', 'Incident notifications'], mandatory: true },
    { id: '7.5', title: 'Documented information', description: 'Maintain documented information required by ISO 27001.', evidenceExamples: ['Document register', 'Document control procedure', 'Evidence repository'], mandatory: true },
    { id: '8.1', title: 'Operational planning and control', description: 'Plan, implement and control IS processes.', evidenceExamples: ['Operational procedures', 'Change management records', 'Deployment checklists'], mandatory: true },
    { id: '8.2', title: 'Information security risk assessment', description: 'Perform IS risk assessments at planned intervals.', evidenceExamples: ['Risk assessment reports', 'Vulnerability scan results', 'Penetration test reports'], mandatory: true },
    { id: '8.3', title: 'Information security risk treatment', description: 'Implement the IS risk treatment plan.', evidenceExamples: ['Risk treatment records', 'Control implementation evidence', 'Residual risk acceptance'], mandatory: true },
    { id: '9.1', title: 'Monitoring, measurement, analysis and evaluation', description: 'Determine what needs to be monitored and measured.', evidenceExamples: ['SIEM reports', 'Security metrics dashboard', 'Compliance assessment results'], mandatory: true },
    { id: '9.2', title: 'Internal audit', description: 'Conduct ISMS internal audits at planned intervals.', evidenceExamples: ['Audit programme', 'Audit reports', 'CAPA records'], mandatory: true },
    { id: '9.3', title: 'Management review', description: 'Top management shall review the ISMS at planned intervals.', evidenceExamples: ['Management review minutes', 'Review outputs', 'Action plan'], mandatory: true },
    { id: '10.1', title: 'Continual improvement', description: 'Continually improve the ISMS.', evidenceExamples: ['Improvement register', 'Lessons learned', 'Security roadmap updates'], mandatory: true },
    { id: '10.2', title: 'Nonconformity and corrective action', description: 'React to nonconformities and take corrective action.', evidenceExamples: ['NCR register', 'Root cause analyses', 'CAPA records'], mandatory: true },
    { id: 'A.5', title: 'Annex A — Organisational controls', description: 'ISO 27002:2022 organisational controls (37 controls).', evidenceExamples: ['IS policies', 'Threat intelligence records', 'Access control policy'], mandatory: true },
    { id: 'A.6', title: 'Annex A — People controls', description: 'ISO 27002:2022 people controls (8 controls).', evidenceExamples: ['HR screening records', 'Acceptable use agreements', 'Offboarding checklists'], mandatory: true },
    { id: 'A.7', title: 'Annex A — Physical controls', description: 'ISO 27002:2022 physical security controls (14 controls).', evidenceExamples: ['Physical access logs', 'CCTV records', 'Clear desk records'], mandatory: true },
    { id: 'A.8', title: 'Annex A — Technological controls', description: 'ISO 27002:2022 technological controls (34 controls).', evidenceExamples: ['Vulnerability scan results', 'Patch management records', 'Encryption certificates', 'MFA evidence'], mandatory: true },
  ],
};
