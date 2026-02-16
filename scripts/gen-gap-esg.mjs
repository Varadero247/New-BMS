#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const templates = [
  // ============================================
  // ESG / CSRD / ESRS (9 templates)
  // ============================================
  {
    outputPath: 'docs/compliance-templates/policies/POL-017-ESG-Sustainability-Policy.docx',
    docNumber: 'POL-017', title: 'ESG & Sustainability Policy', version: '1.0',
    owner: '[ESG Manager]', approvedBy: '[Managing Director]', isoRef: 'CSRD / ESRS 2',
    sections: [
      { heading: '1. Policy Statement', content: '[COMPANY NAME] recognises the importance of environmental, social, and governance (ESG) factors in creating long-term value for all stakeholders. We are committed to transparent sustainability reporting in compliance with the Corporate Sustainability Reporting Directive (CSRD) and European Sustainability Reporting Standards (ESRS).' },
      { heading: '2. Environmental Commitments', bullets: [
        'Achieve net-zero greenhouse gas emissions by 2050, with interim targets aligned to science-based methodology',
        'Transition to 100% renewable energy by 2035',
        'Minimise pollution, waste, and resource consumption across all operations',
        'Protect and restore biodiversity in areas affected by our operations',
        'Integrate circular economy principles into product design and procurement'
      ]},
      { heading: '3. Social Commitments', bullets: [
        'Uphold human rights throughout our value chain (UN Guiding Principles on Business and Human Rights)',
        'Promote diversity, equity, and inclusion in our workforce',
        'Ensure fair wages, safe working conditions, and freedom of association',
        'Invest in community development and social programmes',
        'Protect consumer interests through responsible marketing and product safety'
      ]},
      { heading: '4. Governance Commitments', bullets: [
        'Maintain robust corporate governance with independent oversight',
        'Implement anti-corruption and anti-bribery controls (ISO 37001)',
        'Ensure transparent sustainability reporting aligned with CSRD/ESRS requirements',
        'Conduct double materiality assessments to identify and prioritise ESG topics',
        'Engage with stakeholders on sustainability performance and targets'
      ]},
      { heading: '5. Review', content: 'This policy is reviewed annually and approved by the Board of Directors.\n\nSigned: _________________________ Date: ___/___/______\nManaging Director' }
    ]
  },
  {
    outputPath: 'docs/compliance-templates/procedures/PRO-065-ESG-Materiality-Assessment.docx',
    docNumber: 'PRO-065', title: 'ESG Double Materiality Assessment Procedure', version: '1.0',
    owner: '[ESG Manager]', approvedBy: '[Managing Director]', isoRef: 'ESRS 1 — Double Materiality',
    sections: [
      { heading: '1. Purpose', content: 'To define the process for conducting double materiality assessments in accordance with ESRS 1, identifying sustainability matters that are material from both impact and financial perspectives.' },
      { heading: '2. Double Materiality Concept', content: 'Impact Materiality: The organisation\'s actual or potential impacts on people and the environment (inside-out perspective).\n\nFinancial Materiality: Sustainability matters that create risks or opportunities that are or could be material to the organisation\'s financial position, performance, and cash flows (outside-in perspective).\n\nA sustainability matter is material if it is material from either perspective (or both).' },
      { heading: '3. Assessment Process', content: '1. Identify: Use ESRS topic list (E1-E5, S1-S4, G1) as starting point. Add sector-specific and entity-specific topics.\n2. Stakeholder Engagement: Consult key stakeholders (employees, customers, investors, suppliers, communities, regulators)\n3. Impact Assessment: Assess severity (scale, scope, irremediability) and likelihood of each impact\n4. Financial Assessment: Assess financial effects (magnitude, likelihood, time horizon) of sustainability risks/opportunities\n5. Threshold: Apply materiality thresholds to determine which ESRS disclosure requirements apply\n6. Validation: Validate results with governance body and stakeholders\n7. Document: Record methodology, assumptions, results, and rationale' },
      { heading: '4. ESRS Topics', table: { headers: ['Standard', 'Topic', 'Material?', 'Rationale'], rows: [
        ['E1', 'Climate change (mitigation & adaptation)', '', ''],
        ['E2', 'Pollution (air, water, soil)', '', ''],
        ['E3', 'Water and marine resources', '', ''],
        ['E4', 'Biodiversity and ecosystems', '', ''],
        ['E5', 'Resource use and circular economy', '', ''],
        ['S1', 'Own workforce', '', ''],
        ['S2', 'Workers in the value chain', '', ''],
        ['S3', 'Affected communities', '', ''],
        ['S4', 'Consumers and end-users', '', ''],
        ['G1', 'Business conduct', '', '']
      ]}},
      { heading: '5. Review', content: 'Materiality assessment updated annually and when significant changes occur in the business, value chain, or stakeholder expectations.' }
    ]
  },
  {
    outputPath: 'docs/compliance-templates/procedures/PRO-066-Carbon-Footprint-Measurement.docx',
    docNumber: 'PRO-066', title: 'Carbon Footprint Measurement Procedure', version: '1.0',
    owner: '[ESG Manager]', approvedBy: '[Managing Director]', isoRef: 'ESRS E1 / GHG Protocol',
    sections: [
      { heading: '1. Purpose', content: 'To define the methodology for measuring and reporting greenhouse gas emissions in Scope 1, 2, and 3, aligned with the GHG Protocol Corporate Standard and ESRS E1 Climate Change requirements.' },
      { heading: '2. Scope Definitions', table: { headers: ['Scope', 'Description', 'Data Sources', 'Methodology'], rows: [
        ['Scope 1 — Direct', 'Owned/controlled sources: combustion, process, fugitive, fleet', 'Fuel invoices, refrigerant logs, fleet mileage', 'Activity data x emission factor (DEFRA)'],
        ['Scope 2 — Indirect (Energy)', 'Purchased electricity, steam, heating, cooling', 'Utility invoices, meter reads', 'Location-based + market-based (IEA, supplier factors)'],
        ['Scope 3 — Value Chain', 'All other indirect emissions (15 categories)', 'Supplier data, spend data, travel data', 'Activity or spend-based (DEFRA, Exiobase)']
      ]}},
      { heading: '3. Scope 3 Categories', table: { headers: ['Category', 'Description', 'Relevant?', 'Method'], rows: [
        ['1. Purchased goods & services', 'Cradle-to-gate emissions of purchased inputs', '', 'Spend-based / supplier-specific'],
        ['2. Capital goods', 'Emissions from purchased capital equipment', '', 'Spend-based'],
        ['3. Fuel & energy related activities', 'WTT, T&D losses', '', 'DEFRA WTT factors'],
        ['4. Upstream transportation', 'Transport of purchased goods', '', 'Distance x weight x factor'],
        ['5. Waste generated in operations', 'Treatment of waste', '', 'Waste data x DEFRA factors'],
        ['6. Business travel', 'Air, rail, hotel', '', 'Activity data x DEFRA factors'],
        ['7. Employee commuting', 'Home to work travel', '', 'Survey + average factors'],
        ['8-15', 'Downstream categories', '', 'Assess relevance annually']
      ]}},
      { heading: '4. Reporting', content: 'Annual GHG inventory reported in:\na) ESRS E1 climate change disclosures\nb) Annual sustainability report\nc) CDP Climate Change questionnaire (if applicable)\nd) Science Based Targets initiative (SBTi) monitoring (if committed)\n\nBase year: [YYYY]. Recalculation triggered by structural changes, methodology changes, or errors >5% of total emissions.' }
    ]
  },
  {
    outputPath: 'docs/compliance-templates/forms/FRM-051-Emissions-Data-Collection.docx',
    docNumber: 'FRM-051', title: 'GHG Emissions Data Collection Form (Scope 1/2/3)', version: '1.0',
    owner: '[ESG Manager]', approvedBy: '[Finance Director]', isoRef: 'ESRS E1 / GHG Protocol',
    sections: [
      { heading: '1. Reporting Period', table: { headers: ['Field', 'Detail'], rows: [
        ['Year', ''], ['Completed By', ''], ['Date', ''], ['Verified By', '']
      ]}},
      { heading: '2. Scope 1 — Direct Emissions', table: { headers: ['Source', 'Fuel Type', 'Unit', 'Quantity', 'Emission Factor', 'tCO2e'], rows: [
        ['Natural gas — heating', 'Natural gas', 'kWh', '', '', ''],
        ['Fleet vehicles — diesel', 'Diesel', 'litres', '', '', ''],
        ['Fleet vehicles — petrol', 'Petrol', 'litres', '', '', ''],
        ['Refrigerants', 'R410A / R134a', 'kg', '', '', ''],
        ['TOTAL SCOPE 1', '', '', '', '', '']
      ]}},
      { heading: '3. Scope 2 — Energy Indirect', table: { headers: ['Source', 'Unit', 'Quantity', 'Location-Based Factor', 'tCO2e (Location)', 'Market-Based Factor', 'tCO2e (Market)'], rows: [
        ['Grid electricity', 'kWh', '', '', '', '', ''],
        ['Renewable electricity (REGO-backed)', 'kWh', '', '', '', '0', ''],
        ['TOTAL SCOPE 2', '', '', '', '', '', '']
      ]}},
      { heading: '4. Scope 3 Summary', table: { headers: ['Category', 'Data Source', 'Activity Data', 'tCO2e', 'Method'], rows: [
        ['1. Purchased goods & services', '', '', '', ''],
        ['3. Fuel & energy related', '', '', '', ''],
        ['5. Waste', '', '', '', ''],
        ['6. Business travel', '', '', '', ''],
        ['7. Employee commuting', '', '', '', ''],
        ['TOTAL SCOPE 3', '', '', '', '']
      ]}},
      { heading: '5. Grand Total', content: 'Total Scope 1 + 2 + 3: _______ tCO2e\nIntensity metric: _______ tCO2e per [revenue £M / employee / unit produced]' }
    ]
  },
  {
    outputPath: 'docs/compliance-templates/forms/FRM-052-Social-Sustainability-Data.docx',
    docNumber: 'FRM-052', title: 'Social Sustainability Data Collection Form', version: '1.0',
    owner: '[HR Director / ESG Manager]', approvedBy: '[Managing Director]', isoRef: 'ESRS S1-S4',
    sections: [
      { heading: '1. Own Workforce (ESRS S1)', table: { headers: ['Metric', 'Male', 'Female', 'Non-Binary', 'Not Disclosed', 'Total'], rows: [
        ['Total headcount', '', '', '', '', ''],
        ['Full-time employees', '', '', '', '', ''],
        ['Part-time employees', '', '', '', '', ''],
        ['Temporary/contract workers', '', '', '', '', ''],
        ['Senior management', '', '', '', '', ''],
        ['Board members', '', '', '', '', ''],
        ['New hires', '', '', '', '', ''],
        ['Leavers (voluntary)', '', '', '', '', ''],
        ['Leavers (involuntary)', '', '', '', '', '']
      ]}},
      { heading: '2. Pay & Conditions', table: { headers: ['Metric', 'Value', 'Notes'], rows: [
        ['Gender pay gap (mean)', '', ''],
        ['Gender pay gap (median)', '', ''],
        ['CEO-to-median-worker pay ratio', '', ''],
        ['Living wage accredited?', 'Yes / No', ''],
        ['Collective bargaining coverage %', '', ''],
        ['Average training hours per employee', '', ''],
        ['Employee satisfaction score', '', '']
      ]}},
      { heading: '3. Health & Safety', table: { headers: ['Metric', 'Value', 'Target'], rows: [
        ['Fatalities (employees)', '', '0'],
        ['Fatalities (contractors)', '', '0'],
        ['Lost Time Injury Frequency Rate (LTIFR)', '', ''],
        ['Total Recordable Incident Rate (TRIR)', '', ''],
        ['Lost days', '', ''],
        ['Occupational illness cases', '', '']
      ]}},
      { heading: '4. Value Chain Workers (ESRS S2)', content: 'Number of workers in value chain: ___\nHuman rights due diligence conducted: Yes / No\nSignificant negative impacts identified: Yes / No\nIf Yes: [Describe and state remediation actions]' }
    ]
  },
  {
    outputPath: 'docs/compliance-templates/registers/REG-040-ESG-KPI-Register.docx',
    docNumber: 'REG-040', title: 'ESG KPI Register', version: '1.0',
    owner: '[ESG Manager]', approvedBy: '[Managing Director]', isoRef: 'CSRD / ESRS',
    sections: [
      { heading: '1. Environmental KPIs', table: { headers: ['KPI', 'ESRS Ref', 'Unit', 'Baseline', 'Target', 'Current', 'Status'], rows: [
        ['Total GHG emissions (Scope 1+2)', 'E1', 'tCO2e', '', '', '', ''],
        ['Total GHG emissions (Scope 3)', 'E1', 'tCO2e', '', '', '', ''],
        ['Energy consumption', 'E1', 'MWh', '', '', '', ''],
        ['Renewable energy %', 'E1', '%', '', '', '', ''],
        ['Water withdrawal', 'E3', 'm³', '', '', '', ''],
        ['Waste generated', 'E5', 'tonnes', '', '', '', ''],
        ['Recycling rate', 'E5', '%', '', '', '', ''],
        ['Pollution incidents', 'E2', 'count', '', '0', '', '']
      ]}},
      { heading: '2. Social KPIs', table: { headers: ['KPI', 'ESRS Ref', 'Unit', 'Baseline', 'Target', 'Current', 'Status'], rows: [
        ['Gender diversity (% female)', 'S1', '%', '', '', '', ''],
        ['Gender pay gap', 'S1', '%', '', '', '', ''],
        ['LTIFR', 'S1', 'rate', '', '', '', ''],
        ['Training investment per employee', 'S1', '£', '', '', '', ''],
        ['Employee engagement score', 'S1', 'score', '', '', '', ''],
        ['Living wage compliance', 'S1', '%', '', '100%', '', ''],
        ['Human rights due diligence coverage', 'S2', '%', '', '100%', '', '']
      ]}},
      { heading: '3. Governance KPIs', table: { headers: ['KPI', 'ESRS Ref', 'Unit', 'Baseline', 'Target', 'Current', 'Status'], rows: [
        ['Anti-bribery training completion', 'G1', '%', '', '100%', '', ''],
        ['Whistleblowing reports', 'G1', 'count', '', 'N/A', '', ''],
        ['Board independence %', 'G1', '%', '', '', '', ''],
        ['Supplier code of conduct coverage', 'G1', '%', '', '100%', '', '']
      ]}}
    ]
  },
  {
    outputPath: 'docs/compliance-templates/registers/REG-041-Stakeholder-Engagement-Register.docx',
    docNumber: 'REG-041', title: 'Stakeholder Engagement Register', version: '1.0',
    owner: '[ESG Manager]', approvedBy: '[Managing Director]', isoRef: 'ESRS 2 / AA1000',
    sections: [
      { heading: '1. Stakeholder Register', table: { headers: ['Stakeholder Group', 'Key Concerns/Interests', 'Engagement Method', 'Frequency', 'Last Engaged', 'Key Outcomes/Actions'], rows: [
        ['Employees', 'Working conditions, pay, career development, wellbeing', 'Surveys, town halls, works council', 'Ongoing + annual survey', '', ''],
        ['Customers', 'Product quality, sustainability, ethical sourcing', 'Feedback forms, account reviews', 'Quarterly', '', ''],
        ['Investors/Shareholders', 'ESG performance, risk management, returns', 'Annual report, investor briefings', 'Annual + ad hoc', '', ''],
        ['Suppliers', 'Fair terms, payment, partnership, sustainability expectations', 'Audits, meetings, questionnaires', 'Annual', '', ''],
        ['Local communities', 'Employment, environmental impact, social investment', 'Community meetings, CSR programmes', 'Bi-annual', '', ''],
        ['Regulators', 'Compliance, reporting, permits', 'Formal submissions, inspections', 'As required', '', ''],
        ['NGOs/Civil society', 'Environmental protection, human rights, transparency', 'Dialogue, partnerships', 'Ad hoc', '', '']
      ]}},
      { heading: '2. Materiality Influence', content: 'Stakeholder feedback is a key input to the double materiality assessment (PRO-065). Engagement results are documented and used to validate material ESG topics.' }
    ]
  },
  {
    outputPath: 'docs/compliance-templates/plans/PLN-012-ESG-Action-Plan.docx',
    docNumber: 'PLN-012', title: 'ESG Action Plan & Targets', version: '1.0',
    owner: '[ESG Manager]', approvedBy: '[Managing Director]', isoRef: 'CSRD / ESRS',
    sections: [
      { heading: '1. Environmental Targets', table: { headers: ['Target', 'ESRS', 'Baseline', 'Short-term (2026)', 'Medium-term (2030)', 'Long-term (2050)', 'Owner'], rows: [
        ['Reduce Scope 1+2 emissions', 'E1', '', '-15%', '-50%', 'Net zero', 'ESG Manager'],
        ['Reduce Scope 3 emissions', 'E1', '', '-5%', '-30%', '-90%', 'Procurement'],
        ['Renewable energy %', 'E1', '', '30%', '75%', '100%', 'Facilities'],
        ['Zero waste to landfill', 'E5', '', '<10%', '<5%', '0%', 'Operations'],
        ['Water intensity reduction', 'E3', '', '-10%', '-25%', '-50%', 'Operations']
      ]}},
      { heading: '2. Social Targets', table: { headers: ['Target', 'ESRS', 'Current', '2026 Target', '2030 Target', 'Owner'], rows: [
        ['Gender diversity in leadership', 'S1', '', '35%', '40%+', 'HR Director'],
        ['Close gender pay gap', 'S1', '', '<5%', '<3%', 'HR Director'],
        ['Zero fatalities', 'S1', '', '0', '0', 'H&S Manager'],
        ['Living wage for all employees', 'S1', '', '100%', '100%', 'HR Director'],
        ['Human rights due diligence — Tier 1 suppliers', 'S2', '', '100%', '100%', 'Procurement']
      ]}},
      { heading: '3. Governance Targets', table: { headers: ['Target', 'ESRS', 'Current', '2026 Target', 'Owner'], rows: [
        ['Anti-bribery training completion', 'G1', '', '100%', 'Compliance Officer'],
        ['Supplier code of conduct sign-off', 'G1', '', '100% Tier 1', 'Procurement'],
        ['ESG reporting assurance', 'ESRS 2', '', 'Limited assurance', 'Finance Director']
      ]}},
      { heading: '4. Key Actions', table: { headers: ['Action', 'Pillar', 'Budget', 'Responsible', 'Timeline'], rows: [
        ['Commission SBTi-aligned targets', 'E', '£10,000', 'ESG Manager', 'Q2 2026'],
        ['Install solar PV (100kWp)', 'E', '£80,000', 'Facilities', 'Q3 2026'],
        ['Launch DEI programme', 'S', '£15,000', 'HR Director', 'Q1 2026'],
        ['Supplier sustainability audits (top 20)', 'S', '£20,000', 'Procurement', 'Q2-Q4 2026'],
        ['Engage external assurance provider', 'G', '£25,000', 'Finance', 'Q4 2026']
      ]}}
    ]
  },
  {
    outputPath: 'docs/compliance-templates/reports/RPT-012-ESG-Sustainability-Report.docx',
    docNumber: 'RPT-012', title: 'ESG & Sustainability Report Template', version: '1.0',
    owner: '[ESG Manager]', approvedBy: '[Board of Directors]', isoRef: 'CSRD / ESRS',
    sections: [
      { heading: '1. Report Information', table: { headers: ['Field', 'Detail'], rows: [
        ['Reporting Entity', '[COMPANY NAME]'], ['Reporting Period', '[FY YYYY]'],
        ['Reporting Standards', 'ESRS (CSRD)'], ['Assurance Level', 'Limited / Reasonable'],
        ['Prepared By', '[ESG Manager]'], ['Approved By', '[Board of Directors]']
      ]}},
      { heading: '2. Materiality', content: '[Summary of double materiality assessment results, material ESRS topics, and disclosure map]' },
      { heading: '3. Environmental Disclosures (ESRS E1-E5)', table: { headers: ['Disclosure', 'Metric', 'Year-1', 'Year', 'Change', 'Target'], rows: [
        ['E1: GHG emissions Scope 1', 'tCO2e', '', '', '', ''],
        ['E1: GHG emissions Scope 2', 'tCO2e', '', '', '', ''],
        ['E1: GHG emissions Scope 3', 'tCO2e', '', '', '', ''],
        ['E1: Energy consumption', 'MWh', '', '', '', ''],
        ['E1: Renewable energy %', '%', '', '', '', ''],
        ['E2: Pollution incidents', 'count', '', '', '', ''],
        ['E3: Water withdrawal', 'm³', '', '', '', ''],
        ['E5: Waste generated', 'tonnes', '', '', '', ''],
        ['E5: Recycling rate', '%', '', '', '', '']
      ]}},
      { heading: '4. Social Disclosures (ESRS S1-S4)', table: { headers: ['Disclosure', 'Metric', 'Year-1', 'Year', 'Change'], rows: [
        ['S1: Total headcount', 'FTE', '', '', ''],
        ['S1: Gender diversity', '% female', '', '', ''],
        ['S1: Gender pay gap (mean)', '%', '', '', ''],
        ['S1: LTIFR', 'rate', '', '', ''],
        ['S1: Training hours per employee', 'hours', '', '', ''],
        ['S1: Employee turnover', '%', '', '', '']
      ]}},
      { heading: '5. Governance Disclosures (ESRS G1)', content: '[Business conduct disclosures: anti-corruption, political engagement, supplier relationships, whistleblowing]' },
      { heading: '6. Targets & Progress', content: '[Summary of ESG targets, progress against each, actions taken, and outlook]' },
      { heading: '7. Assurance Statement', content: '[Space for independent assurance statement or reference to separate assurance report]' }
    ]
  }
];

async function main() {
  const tmpDir = '/tmp/gap-esg-configs';
  fs.mkdirSync(tmpDir, { recursive: true });
  console.log(`Generating ${templates.length} ESG/CSRD gap-filling templates...`);
  for (const t of templates) {
    const configPath = path.join(tmpDir, `${t.docNumber}.json`);
    fs.writeFileSync(configPath, JSON.stringify(t, null, 2));
    try {
      execSync(`node /home/dyl/New-BMS/scripts/create-docx.mjs ${configPath}`, { stdio: 'inherit' });
    } catch (e) {
      console.error(`Failed: ${t.docNumber} - ${e.message}`);
    }
  }
  console.log(`\nDone: ${templates.length} templates generated.`);
}
main().catch(err => { console.error(err); process.exit(1); });
