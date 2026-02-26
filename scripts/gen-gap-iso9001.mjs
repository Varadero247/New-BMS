// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const templates = [
  {
    outputPath: 'docs/compliance-templates/procedures/PRO-046-Design-Development.docx',
    docNumber: 'PRO-046',
    title: 'Design & Development Procedure',
    version: '1.0',
    owner: '[Quality Manager]',
    approvedBy: '[Managing Director]',
    isoRef: 'ISO 9001:2015 Clause 8.3',
    sections: [
      {
        heading: '1. Purpose',
        content:
          'To define the process for planning, executing, reviewing, verifying, and validating design and development activities to ensure outputs meet specified requirements and customer expectations.',
      },
      {
        heading: '2. Scope',
        content:
          'Applies to all new product/service design, significant modifications to existing products/services, and bespoke customer solutions undertaken by [COMPANY NAME].',
      },
      {
        heading: '3. Responsibilities',
        table: {
          headers: ['Role', 'Responsibility'],
          rows: [
            [
              'Design Manager',
              'Owns the D&D process, assigns project leads, approves design outputs',
            ],
            ['Project Lead', 'Plans D&D stages, conducts reviews, manages design documentation'],
            [
              'Quality Manager',
              'Verifies compliance with regulatory/customer requirements, witnesses validation',
            ],
            [
              'Customer/Stakeholder',
              'Provides input requirements, participates in reviews as applicable',
            ],
          ],
        },
      },
      {
        heading: '4. Design Planning (8.3.2)',
        content:
          'For each design project, the Project Lead shall produce a Design Plan that includes:\n\na) Stages of design and development\nb) Review, verification, and validation activities at each stage\nc) Responsibilities and authorities\nd) Internal and external resource needs\ne) Interfaces between groups involved\nf) Customer and end-user involvement requirements\ng) Requirements for subsequent provision of products/services\nh) Expected outputs and acceptance criteria',
      },
      {
        heading: '5. Design Inputs (8.3.3)',
        content:
          'Design inputs shall be documented and include:\n\na) Functional and performance requirements\nb) Applicable statutory and regulatory requirements\nc) Standards or codes of practice the organisation has committed to implement\nd) Potential consequences of failure\ne) Information derived from previous similar designs\n\nInputs shall be reviewed for adequacy and any conflicts resolved before proceeding.',
      },
      {
        heading: '6. Design Reviews, Verification & Validation (8.3.4-8.3.5)',
        content:
          'Design Reviews: Conducted at planned stages to evaluate the ability of results to meet requirements, identify problems, and determine necessary actions.\n\nDesign Verification: Ensures design outputs meet design input requirements (e.g., calculations, comparisons, testing).\n\nDesign Validation: Confirms the resulting product/service meets requirements for the specified use or intended application under actual or simulated conditions.',
      },
      {
        heading: '7. Design Outputs (8.3.5)',
        content:
          'Design outputs shall:\na) Meet input requirements\nb) Be adequate for subsequent processes (production, service provision)\nc) Include or reference monitoring and measuring requirements and acceptance criteria\nd) Specify characteristics essential for safe and proper use\n\nOutputs shall be in a form suitable for verification against inputs and shall be approved before release.',
      },
      {
        heading: '8. Design Changes (8.3.6)',
        content:
          'All changes to design shall be identified, reviewed, verified, validated (as appropriate), and approved before implementation. Records of changes, review results, authorisations, and actions taken shall be retained.',
      },
      {
        heading: '9. Records',
        content:
          'Design Register (FRM-036), Design Review Minutes, Verification/Validation Reports, Change Request Forms. Retained for product lifetime plus 10 years.',
      },
    ],
  },
  {
    outputPath: 'docs/compliance-templates/procedures/PRO-047-Customer-Communication.docx',
    docNumber: 'PRO-047',
    title: 'Customer Communication Procedure',
    version: '1.0',
    owner: '[Quality Manager]',
    approvedBy: '[Managing Director]',
    isoRef: 'ISO 9001:2015 Clause 8.2.1',
    sections: [
      {
        heading: '1. Purpose',
        content:
          'To ensure effective communication with customers regarding product/service information, enquiries, contracts, orders, feedback, complaints, and handling of customer property.',
      },
      {
        heading: '2. Communication Requirements',
        table: {
          headers: ['Communication Type', 'Method', 'Responsible', 'Frequency'],
          rows: [
            [
              'Product/service information',
              'Website, brochures, proposals',
              'Sales/Marketing',
              'Ongoing',
            ],
            [
              'Enquiries, contracts, order handling',
              'Email, CRM, phone',
              'Sales/Customer Service',
              'Per enquiry',
            ],
            [
              'Customer feedback & satisfaction',
              'Surveys, reviews, meetings',
              'Quality Manager',
              'Quarterly + ad hoc',
            ],
            [
              'Complaints & concerns',
              'Complaint form, email, phone',
              'Quality Manager',
              'Within 24 hours',
            ],
            [
              'Customer property',
              'Receipt confirmation, status updates',
              'Operations',
              'Per item received',
            ],
            ['Contingency actions', 'Email, phone (urgent)', 'Operations Manager', 'As required'],
          ],
        },
      },
      {
        heading: '3. Customer Feedback Process',
        content:
          '1. Collect feedback via satisfaction surveys (FRM-036), review meetings, and informal channels\n2. Log all feedback in the Customer Feedback Register\n3. Analyse trends quarterly — identify recurring themes\n4. Report to management review (Clause 9.3)\n5. Take action on negative trends — link to CAPA where appropriate',
      },
      {
        heading: '4. Complaint Handling',
        content:
          'a) All complaints acknowledged within 24 hours\nb) Logged in Complaints Register with unique reference\nc) Investigated within 5 working days\nd) Root cause analysis completed\ne) Corrective action implemented and verified\nf) Customer informed of outcome\ng) Complaint data analysed for trends at management review',
      },
      {
        heading: '5. Records',
        content:
          'Customer Feedback Forms, Complaints Register, Satisfaction Survey Results, Communication Logs. Retained for 7 years.',
      },
    ],
  },
  {
    outputPath: 'docs/compliance-templates/procedures/PRO-048-Production-Service-Control.docx',
    docNumber: 'PRO-048',
    title: 'Production & Service Provision Control Procedure',
    version: '1.0',
    owner: '[Operations Manager]',
    approvedBy: '[Managing Director]',
    isoRef: 'ISO 9001:2015 Clause 8.5',
    sections: [
      {
        heading: '1. Purpose',
        content:
          'To ensure production and service provision is carried out under controlled conditions, including monitoring, measurement, and the use of suitable infrastructure and process environment.',
      },
      {
        heading: '2. Controlled Conditions (8.5.1)',
        content:
          'The organisation shall implement production and service provision under controlled conditions including:\n\na) Availability of documented information defining product/service characteristics and activities to be performed\nb) Availability and use of suitable monitoring and measuring resources\nc) Implementation of monitoring and measurement at appropriate stages\nd) Use of suitable infrastructure and process environment\ne) Appointment of competent persons\nf) Validation and revalidation of processes where output cannot be verified by subsequent monitoring\ng) Implementation of actions to prevent human error\nh) Implementation of release, delivery, and post-delivery activities',
      },
      {
        heading: '3. Identification & Traceability (8.5.2)',
        content:
          'Products and services shall be identified by suitable means throughout production/service provision. Traceability shall be maintained where required by the customer, statutory/regulatory requirements, or where the organisation determines it is necessary. Unique identification shall be recorded.',
      },
      {
        heading: '4. Customer/External Provider Property (8.5.3)',
        content:
          "Property belonging to customers or external providers shall be identified, verified, protected, and safeguarded while under the organisation's control. If lost, damaged, or found unsuitable, the owner shall be notified and records retained.",
      },
      {
        heading: '5. Preservation (8.5.4)',
        content:
          'The organisation shall preserve outputs during production and service provision to ensure conformity to requirements. Preservation may include identification, handling, contamination control, packaging, storage, transmission, transportation, and protection.',
      },
      {
        heading: '6. Post-Delivery Activities (8.5.5)',
        content:
          'Post-delivery activities shall consider statutory/regulatory requirements, potential undesired consequences, nature/use/lifetime of products, customer requirements, and customer feedback.',
      },
      {
        heading: '7. Control of Changes (8.5.6)',
        content:
          'Changes to production or service provision shall be reviewed and controlled to ensure continued conformity. Results of change reviews, authorising persons, and any necessary actions shall be documented.',
      },
    ],
  },
  {
    outputPath: 'docs/compliance-templates/forms/FRM-036-Customer-Feedback.docx',
    docNumber: 'FRM-036',
    title: 'Customer Feedback & Satisfaction Form',
    version: '1.0',
    owner: '[Quality Manager]',
    approvedBy: '[Managing Director]',
    isoRef: 'ISO 9001:2015 Clause 9.1.2',
    sections: [
      {
        heading: '1. Customer Details',
        table: {
          headers: ['Field', 'Detail'],
          rows: [
            ['Customer Name', ''],
            ['Company', ''],
            ['Date', '[DD/MM/YYYY]'],
            ['Project/Order Ref', ''],
            ['Surveyed By', ''],
          ],
        },
      },
      {
        heading: '2. Satisfaction Rating',
        table: {
          headers: ['Area', '1 (Poor)', '2', '3', '4', '5 (Excellent)', 'Comments'],
          rows: [
            ['Product/service quality', '', '', '', '', '', ''],
            ['On-time delivery', '', '', '', '', '', ''],
            ['Communication & responsiveness', '', '', '', '', '', ''],
            ['Technical competence', '', '', '', '', '', ''],
            ['Value for money', '', '', '', '', '', ''],
            ['Problem resolution', '', '', '', '', '', ''],
            ['Overall satisfaction', '', '', '', '', '', ''],
          ],
        },
      },
      {
        heading: '3. Open Questions',
        content:
          'What did we do well?\n[Space for response]\n\nWhat could we improve?\n[Space for response]\n\nWould you recommend us? Yes / No\n\nAny other comments:\n[Space for response]',
      },
      {
        heading: '4. Internal Action (Quality Manager)',
        content:
          'Overall Score: ___/35\nTrend vs. Previous: Improving / Stable / Declining\nActions Required: Yes / No\nIf Yes — CAPA Ref: [CAR-YYYY-NNN]\n\nReviewed by: _________________________ Date: ___/___/______',
      },
    ],
  },
  {
    outputPath: 'docs/compliance-templates/forms/FRM-037-Supplier-Evaluation.docx',
    docNumber: 'FRM-037',
    title: 'Supplier Evaluation & Approval Form',
    version: '1.0',
    owner: '[Quality Manager]',
    approvedBy: '[Procurement Manager]',
    isoRef: 'ISO 9001:2015 Clause 8.4',
    sections: [
      {
        heading: '1. Supplier Details',
        table: {
          headers: ['Field', 'Detail'],
          rows: [
            ['Supplier Name', ''],
            ['Address', ''],
            ['Contact Person', ''],
            ['Products/Services Provided', ''],
            ['Date of Evaluation', '[DD/MM/YYYY]'],
            ['Evaluator', ''],
          ],
        },
      },
      {
        heading: '2. Evaluation Criteria',
        table: {
          headers: ['Criterion', 'Weight', 'Score (1-5)', 'Weighted Score', 'Evidence/Notes'],
          rows: [
            ['Quality of product/service', '25%', '', '', ''],
            ['Delivery performance (on-time)', '20%', '', '', ''],
            ['Price competitiveness', '15%', '', '', ''],
            ['Quality management system (ISO 9001 certified?)', '15%', '', '', ''],
            ['Technical capability', '10%', '', '', ''],
            ['Financial stability', '5%', '', '', ''],
            ['Communication & responsiveness', '5%', '', '', ''],
            ['Environmental/social responsibility', '5%', '', '', ''],
            ['TOTAL', '100%', '', '', ''],
          ],
        },
      },
      {
        heading: '3. Approval Decision',
        content:
          'Total Weighted Score: ___/5.0\n\nApproval Status:\n☐ Approved (score >= 3.5)\n☐ Conditionally Approved (score 2.5-3.4) — conditions: _______________\n☐ Not Approved (score < 2.5)\n\nNext Review Due: [DD/MM/YYYY]\n\nApproved by: _________________________ Date: ___/___/______',
      },
    ],
  },
  {
    outputPath: 'docs/compliance-templates/forms/FRM-038-Process-Performance-Monitoring.docx',
    docNumber: 'FRM-038',
    title: 'Process Performance Monitoring Form',
    version: '1.0',
    owner: '[Quality Manager]',
    approvedBy: '[Managing Director]',
    isoRef: 'ISO 9001:2015 Clause 9.1.1',
    sections: [
      {
        heading: '1. Process Details',
        table: {
          headers: ['Field', 'Detail'],
          rows: [
            ['Process Name', ''],
            ['Process Owner', ''],
            ['Monitoring Period', ''],
            ['Date Completed', '[DD/MM/YYYY]'],
          ],
        },
      },
      {
        heading: '2. Key Performance Indicators',
        table: {
          headers: ['KPI', 'Target', 'Actual', 'Status', 'Trend', 'Action Required'],
          rows: [
            ['', '', '', 'Met/Not Met', 'Up/Down/Stable', 'Yes/No'],
            ['', '', '', '', '', ''],
            ['', '', '', '', '', ''],
            ['', '', '', '', '', ''],
            ['', '', '', '', '', ''],
          ],
        },
      },
      {
        heading: '3. Analysis & Actions',
        content:
          'Summary of performance:\n[Analysis of results against targets]\n\nRoot cause of any underperformance:\n[Description]\n\nCorrective actions:\n[Actions, owners, due dates]\n\nReviewed by: _________________________ Date: ___/___/______',
      },
    ],
  },
  {
    outputPath: 'docs/compliance-templates/registers/REG-030-Approved-Supplier-Register.docx',
    docNumber: 'REG-030',
    title: 'Approved Supplier Register',
    version: '1.0',
    owner: '[Procurement Manager]',
    approvedBy: '[Quality Manager]',
    isoRef: 'ISO 9001:2015 Clause 8.4',
    sections: [
      {
        heading: '1. Approved Supplier List',
        table: {
          headers: [
            'Supplier ID',
            'Supplier Name',
            'Products/Services',
            'Approval Status',
            'Score',
            'ISO Cert?',
            'Last Evaluated',
            'Next Review',
            'Notes',
          ],
          rows: [
            ['SUP-001', '', '', 'Approved/Conditional/Suspended', '', 'Yes/No', '', '', ''],
            ['SUP-002', '', '', '', '', '', '', '', ''],
            ['SUP-003', '', '', '', '', '', '', '', ''],
            ['SUP-004', '', '', '', '', '', '', '', ''],
          ],
        },
      },
      {
        heading: '2. Approval Criteria',
        content:
          'Score >= 3.5: Approved\nScore 2.5-3.4: Conditionally Approved (improvement plan required)\nScore < 2.5: Not Approved\n\nAll suppliers reviewed annually. Critical suppliers reviewed every 6 months.',
      },
    ],
  },
  {
    outputPath: 'docs/compliance-templates/registers/REG-031-Calibration-Register.docx',
    docNumber: 'REG-031',
    title: 'Equipment Calibration Register',
    version: '1.0',
    owner: '[Quality Manager]',
    approvedBy: '[Technical Manager]',
    isoRef: 'ISO 9001:2015 Clause 7.1.5',
    sections: [
      {
        heading: '1. Calibration Log',
        table: {
          headers: [
            'Equipment ID',
            'Description',
            'Serial No.',
            'Location',
            'Calibration Interval',
            'Last Calibrated',
            'Next Due',
            'Calibrated By',
            'Certificate No.',
            'Status',
          ],
          rows: [
            [
              'CAL-001',
              '',
              '',
              '',
              '12 months',
              '',
              '',
              'Internal/External',
              '',
              'In Cal/Overdue/OOS',
            ],
            ['CAL-002', '', '', '', '', '', '', '', '', ''],
            ['CAL-003', '', '', '', '', '', '', '', '', ''],
            ['CAL-004', '', '', '', '', '', '', '', '', ''],
          ],
        },
      },
      {
        heading: '2. Out-of-Calibration Actions',
        content:
          'When equipment is found out of calibration:\n1. Quarantine the equipment immediately\n2. Assess validity of previous measurements made with the equipment\n3. Take appropriate action on the equipment and any affected product\n4. Retain records of assessment and actions taken\n5. Notify affected parties if product quality may have been compromised',
      },
    ],
  },
  {
    outputPath: 'docs/compliance-templates/plans/PLN-006-Quality-Objectives.docx',
    docNumber: 'PLN-006',
    title: 'Quality Objectives & Planning',
    version: '1.0',
    owner: '[Quality Manager]',
    approvedBy: '[Managing Director]',
    isoRef: 'ISO 9001:2015 Clause 6.2',
    sections: [
      {
        heading: '1. Quality Objectives',
        table: {
          headers: ['Ref', 'Objective', 'KPI', 'Target', 'Baseline', 'Owner', 'Due Date', 'Status'],
          rows: [
            [
              'QO-01',
              'Reduce customer complaints',
              'Complaints per month',
              '<5',
              '8',
              'Quality Manager',
              '31/12/2026',
              'In Progress',
            ],
            [
              'QO-02',
              'Improve on-time delivery',
              'OTD %',
              '>95%',
              '88%',
              'Operations Manager',
              '30/06/2026',
              'In Progress',
            ],
            [
              'QO-03',
              'Reduce internal NCRs',
              'NCRs per quarter',
              '<10',
              '18',
              'Quality Manager',
              '31/12/2026',
              'In Progress',
            ],
            [
              'QO-04',
              'Achieve customer satisfaction score',
              'Survey score',
              '>4.2/5',
              '3.8',
              'Sales Manager',
              '31/12/2026',
              'In Progress',
            ],
            [
              'QO-05',
              'Reduce process waste',
              'Waste %',
              '<3%',
              '5.2%',
              'Production Manager',
              '31/12/2026',
              'Planned',
            ],
          ],
        },
      },
      {
        heading: '2. Action Plans',
        table: {
          headers: [
            'Objective Ref',
            'Action',
            'Resource Required',
            'Responsible',
            'Timeline',
            'Progress',
          ],
          rows: [
            [
              'QO-01',
              'Implement customer feedback loop',
              'CRM system upgrade',
              'IT Manager',
              'Q1 2026',
              '',
            ],
            [
              'QO-02',
              'Review production scheduling',
              'Staff training',
              'Operations',
              'Q2 2026',
              '',
            ],
            [
              'QO-03',
              'Root cause analysis of top NCR categories',
              'Quality team time',
              'Quality',
              'Ongoing',
              '',
            ],
            [
              'QO-04',
              'Quarterly customer satisfaction surveys',
              'Survey tool',
              'Sales',
              'Quarterly',
              '',
            ],
            [
              'QO-05',
              'Lean manufacturing initiative',
              'Consultant budget',
              'Production',
              'Q3 2026',
              '',
            ],
          ],
        },
      },
      {
        heading: '3. Review',
        content:
          'Quality objectives are reviewed at management review meetings (minimum annually) and updated as needed. Progress is reported monthly to senior management.',
      },
    ],
  },
  {
    outputPath: 'docs/compliance-templates/reports/RPT-006-Process-Performance.docx',
    docNumber: 'RPT-006',
    title: 'Process Performance Report',
    version: '1.0',
    owner: '[Quality Manager]',
    approvedBy: '[Managing Director]',
    isoRef: 'ISO 9001:2015 Clause 9.1',
    sections: [
      {
        heading: '1. Report Details',
        table: {
          headers: ['Field', 'Detail'],
          rows: [
            ['Report Period', '[Q1/Q2/Q3/Q4] [YYYY]'],
            ['Prepared By', ''],
            ['Date', '[DD/MM/YYYY]'],
            ['Distribution', 'Senior Management, Process Owners'],
          ],
        },
      },
      {
        heading: '2. Process Performance Summary',
        table: {
          headers: ['Process', 'KPI', 'Target', 'Q1', 'Q2', 'Q3', 'Q4', 'Annual', 'Trend'],
          rows: [
            ['Sales', 'Quote conversion rate', '>30%', '', '', '', '', '', ''],
            ['Purchasing', 'Supplier OTD', '>95%', '', '', '', '', '', ''],
            ['Production', 'First-pass yield', '>98%', '', '', '', '', '', ''],
            ['Quality', 'NCRs raised', '<10/qtr', '', '', '', '', '', ''],
            ['Delivery', 'On-time delivery', '>95%', '', '', '', '', '', ''],
            ['Customer', 'Satisfaction score', '>4.2/5', '', '', '', '', '', ''],
          ],
        },
      },
      {
        heading: '3. Analysis',
        content:
          '[Summary of trends, significant changes, areas of concern, and areas of improvement across all processes]',
      },
      {
        heading: '4. Recommendations',
        content:
          '[Recommended actions for management review, resource requests, process improvements]',
      },
      {
        heading: '5. Sign-Off',
        content:
          'Prepared by: _________________________ Date: ___/___/______\nReviewed by: _________________________ Date: ___/___/______',
      },
    ],
  },
];

async function main() {
  const tmpDir = '/tmp/gap-iso9001-configs';
  fs.mkdirSync(tmpDir, { recursive: true });
  console.log(`Generating ${templates.length} ISO 9001 gap-filling templates...`);
  for (const t of templates) {
    const configPath = path.join(tmpDir, `${t.docNumber}.json`);
    fs.writeFileSync(configPath, JSON.stringify(t, null, 2));
    try {
      execSync(`node /home/dyl/New-BMS/scripts/create-docx.mjs ${configPath}`, {
        stdio: 'inherit',
      });
    } catch (e) {
      console.error(`Failed: ${t.docNumber} - ${e.message}`);
    }
  }
  console.log(`\nDone: ${templates.length} templates generated.`);
}
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
