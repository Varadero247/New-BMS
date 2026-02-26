// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import type { StandardAssessment } from './types';

export const iatf16949Assessment: StandardAssessment = {
  standardId: 'iatf-16949-2016',
  standardName: 'IATF 16949:2016',
  version: '2016',
  clauses: [
    { id: '4.3.1', title: 'Determining scope — supplemental', description: 'All customer-specific requirements shall be evaluated for inclusion in the scope.', evidenceExamples: ['CSR evaluation matrix', 'Scope justification'], mandatory: true },
    { id: '4.4.1.1', title: 'Product and process conformity', description: 'Maintain conformance to all applicable product and process requirements.', evidenceExamples: ['Control plans', 'Process parameter records', 'OEM approval records'], mandatory: true },
    { id: '5.1.1.1', title: 'Corporate responsibility', description: 'Policies for anti-bribery and whistleblowing shall be established.', evidenceExamples: ['Anti-bribery policy', 'Whistleblowing procedure', 'Code of conduct'], mandatory: true },
    { id: '5.3.1', title: 'Organisational roles — supplemental', description: 'Responsibility and authority for product quality including PPAP approval.', evidenceExamples: ['Quality manager appointment', 'PPAP sign-off authority list', 'Quality responsibility matrix'], mandatory: true },
    { id: '6.1.2.1', title: 'Risk analysis', description: 'Include lessons learned from product recalls, field returns, warranty and audits.', evidenceExamples: ['Lessons learned register', 'Warranty analysis', 'Field return data'], mandatory: true },
    { id: '6.1.2.3', title: 'Contingency plans', description: 'Identify and evaluate internal and external risks to manufacturing and develop contingency plans.', evidenceExamples: ['Business continuity plan', 'Contingency action list', 'Key equipment backup plans'], mandatory: true },
    { id: '7.2.1', title: 'Competence — supplemental', description: 'Documented process for identifying training needs including quality management awareness.', evidenceExamples: ['Training needs analysis', 'Competency matrix', 'OJT records'], mandatory: true },
    { id: '7.2.3', title: 'Internal auditor competency', description: 'Demonstrate competency in internal auditing.', evidenceExamples: ['Auditor qualification records', 'Audit training certificates', 'Auditor experience log'], mandatory: true },
    { id: '7.2.4', title: 'Second-party auditor competency', description: 'Demonstrate competency in second-party auditing.', evidenceExamples: ['Second-party auditor training', 'Supplier audit records'], mandatory: true },
    { id: '8.3.2.1', title: 'Design and development planning — supplemental', description: 'APQP or equivalent process used for product and manufacturing process design.', evidenceExamples: ['APQP plan', 'APQP timing chart', 'Gate review records'], mandatory: false },
    { id: '8.3.3.3', title: 'Special characteristics', description: 'Develop a process for identification, documentation and control of special characteristics.', evidenceExamples: ['Special characteristics list', 'Control plan with SC notation', 'PFMEA with SC'], mandatory: true },
    { id: '8.3.5.1', title: 'Design and development outputs — supplemental', description: 'DFMEA and PFMEA outputs documented and included in customer PPAP submission.', evidenceExamples: ['DFMEA', 'PFMEA', 'PPAP submission'], mandatory: false },
    { id: '8.4.1.2', title: 'Customer-directed sources (directed-buy)', description: 'Manage directed-buy suppliers as required by the customer.', evidenceExamples: ['Directed-buy supplier list', 'Customer-directed source records'], mandatory: true },
    { id: '8.5.1.1', title: 'Control plan', description: 'Develop and maintain control plans at system, subsystem, component and manufacturing levels.', evidenceExamples: ['Control plans (prototype, pre-launch, production)', 'Control plan review records'], mandatory: true },
    { id: '8.5.2.1', title: 'Identification and traceability — supplemental', description: 'Manage product traceability including serialisation where required.', evidenceExamples: ['Traceability records', 'Batch/lot records', 'Labelling records'], mandatory: true },
    { id: '8.6.1', title: 'Acceptance criteria — supplemental', description: 'Documented acceptance criteria for sampling plans.', evidenceExamples: ['Sampling plan', 'AQL standards', 'Inspection records'], mandatory: true },
    { id: '8.6.2', title: 'Layout inspection and functional testing', description: 'Annual layout inspection and functional testing to applicable standards.', evidenceExamples: ['Layout inspection report', 'Annual functional test records'], mandatory: true },
    { id: '8.7.1.4', title: 'Customer notification — nonconforming product', description: 'Promptly notify customers when nonconforming product has been shipped.', evidenceExamples: ['Customer notification records', '8D reports', 'Escape notifications'], mandatory: true },
    { id: '9.1.1.1', title: 'Monitoring and measurement — supplemental', description: 'Statistical tools and techniques shall be used for SPC.', evidenceExamples: ['SPC charts', 'Cpk/Ppk records', 'SPC training records'], mandatory: true },
    { id: '9.1.2.1', title: 'Customer satisfaction — supplemental', description: 'Monitor performance indicators using customer portals and scorecards.', evidenceExamples: ['OEM scorecard records', 'Customer portal data', 'PPM reports', 'OTD reports'], mandatory: true },
    { id: '9.3.2.1', title: 'Management review inputs — supplemental', description: 'Specific inputs required by IATF 16949 at management review.', evidenceExamples: ['Management review agenda including IATF inputs', 'Customer scorecard review', 'Quality objectives vs actuals'], mandatory: true },
    { id: '10.2.3', title: 'Problem solving', description: 'Use a defined problem-solving methodology appropriate to each type of problem.', evidenceExamples: ['8D reports', '5-Why analyses', 'A3 reports', 'Ishikawa diagrams'], mandatory: true },
    { id: '10.2.4', title: 'Error-proofing', description: 'Use error-proofing methodologies in corrective action process.', evidenceExamples: ['Poka-yoke records', 'Error-proofing verification records', 'Mistake-proofing log'], mandatory: true },
    { id: '10.2.6', title: 'Warranty management system', description: 'Implement a warranty management process.', evidenceExamples: ['Warranty analysis records', 'NTF (No Trouble Found) analysis', 'Warranty data reports'], mandatory: true },
  ],
};
