// Enterprise Risk Management Seed Data — ISO 31000:2018
// Run: RISK_DATABASE_URL="postgresql://postgres:${POSTGRES_PASSWORD}@localhost:5432/ims" npx tsx packages/database/prisma/seeds/risk-seed.ts

import { PrismaClient } from '../../generated/risk';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Enterprise Risk Management data...');

  const orgId = 'default';

  // ── Risk Appetite Statements ────────────────────────────────────
  const appetiteStatements = [
    { category: 'HEALTH_SAFETY' as const, appetiteLevel: 'VERY_LOW' as const, statement: 'We have very low appetite for health & safety risks. All H&S risks rated HIGH or above require immediate treatment. Zero tolerance for fatality risks.', maximumTolerableScore: 6, acceptableResidualScore: 4, escalationThreshold: 9 },
    { category: 'ENVIRONMENTAL' as const, appetiteLevel: 'VERY_LOW' as const, statement: 'We have very low appetite for environmental risks. Environmental damage risks must be reduced to ALARP. All regulatory breaches are unacceptable.', maximumTolerableScore: 6, acceptableResidualScore: 4, escalationThreshold: 9 },
    { category: 'COMPLIANCE' as const, appetiteLevel: 'LOW' as const, statement: 'Low appetite for compliance and legal risks. Regulatory non-compliance risks must be actively managed. Fines and sanctions are unacceptable.', maximumTolerableScore: 8, acceptableResidualScore: 6, escalationThreshold: 12 },
    { category: 'INFORMATION_SECURITY' as const, appetiteLevel: 'LOW' as const, statement: 'Low appetite for information security risks. Data breaches and cyber attacks must be prevented. ISO 27001 controls must be maintained.', maximumTolerableScore: 8, acceptableResidualScore: 6, escalationThreshold: 12 },
    { category: 'FINANCIAL' as const, appetiteLevel: 'MODERATE_APPETITE' as const, statement: 'Moderate appetite for financial risks. Willing to accept calculated financial risks for business growth. Hedging required for exposures >£500k.', maximumTolerableScore: 12, acceptableResidualScore: 8, escalationThreshold: 15 },
    { category: 'STRATEGIC' as const, appetiteLevel: 'MODERATE_APPETITE' as const, statement: 'Moderate appetite for strategic risks. Innovation and market expansion require accepting uncertainty. Board oversight for major strategic bets.', maximumTolerableScore: 12, acceptableResidualScore: 8, escalationThreshold: 15 },
    { category: 'REPUTATIONAL' as const, appetiteLevel: 'LOW' as const, statement: 'Low appetite for reputational risks. Brand and stakeholder trust must be protected. Media crisis risks require preventive PR strategy.', maximumTolerableScore: 8, acceptableResidualScore: 6, escalationThreshold: 12 },
    { category: 'OPERATIONAL' as const, appetiteLevel: 'MODERATE_APPETITE' as const, statement: 'Moderate appetite for operational risks. Process improvements may involve temporary disruption. Business continuity plans must cover all critical operations.', maximumTolerableScore: 12, acceptableResidualScore: 8, escalationThreshold: 15 },
    { category: 'QUALITY' as const, appetiteLevel: 'LOW' as const, statement: 'Low appetite for quality risks. Product quality failures and customer complaints must be minimised. ISO 9001 non-conformances require immediate corrective action.', maximumTolerableScore: 8, acceptableResidualScore: 6, escalationThreshold: 12 },
    { category: 'SUPPLY_CHAIN' as const, appetiteLevel: 'MODERATE_APPETITE' as const, statement: 'Moderate appetite for supply chain risks. Sole-source dependencies should be avoided. Dual sourcing required for critical components.', maximumTolerableScore: 12, acceptableResidualScore: 8, escalationThreshold: 15 },
    { category: 'TECHNOLOGY_CYBER' as const, appetiteLevel: 'LOW' as const, statement: 'Low appetite for technology and cyber risks. Ransomware and data loss risks require strong preventive controls. Business continuity plans must cover IT failure scenarios.', maximumTolerableScore: 8, acceptableResidualScore: 6, escalationThreshold: 12 },
    { category: 'PEOPLE_HR' as const, appetiteLevel: 'MODERATE_APPETITE' as const, statement: 'Moderate appetite for people risks. Talent retention risks are accepted as part of competitive market dynamics. Key person dependency must be actively managed.', maximumTolerableScore: 12, acceptableResidualScore: 8, escalationThreshold: 15 },
  ];

  for (const stmt of appetiteStatements) {
    await prisma.riskAppetiteStatement.upsert({
      where: { category_organisationId: { category: stmt.category, organisationId: orgId } },
      update: stmt,
      create: { ...stmt, organisationId: orgId, reviewDate: new Date('2026-12-31'), approvedBy: 'Board of Directors', approvedAt: new Date('2026-01-15') },
    });
  }
  console.log(`  Seeded ${appetiteStatements.length} appetite statements`);

  // ── Risk Framework ──────────────────────────────────────────────
  await prisma.riskFramework.upsert({
    where: { organisationId: orgId },
    update: {},
    create: {
      organisationId: orgId,
      frameworkVersion: 'ISO 31000:2018',
      policyRef: 'RM-POL-001',
      policyApprovedDate: new Date('2026-01-15'),
      policyReviewDate: new Date('2027-01-15'),
      likelihoodScale: [
        { score: 1, label: 'Rare', description: 'May only occur in exceptional circumstances', freq: '<2% probability in 5 years' },
        { score: 2, label: 'Unlikely', description: 'Could occur but not expected', freq: '2-10% probability in 5 years' },
        { score: 3, label: 'Possible', description: 'Might occur at some time', freq: '10-50% probability in 5 years' },
        { score: 4, label: 'Likely', description: 'Will probably occur', freq: '50-90% probability in 5 years' },
        { score: 5, label: 'Almost Certain', description: 'Expected to occur in most circumstances', freq: '>90% probability in 5 years' },
      ],
      consequenceScale: [
        { score: 1, label: 'Negligible', description: 'No measurable impact', examples: ['Minor delay', 'Negligible cost'] },
        { score: 2, label: 'Minor', description: 'Small impact easily remedied', examples: ['Short delay', 'Cost <£10k', 'First aid injury'] },
        { score: 3, label: 'Moderate', description: 'Significant impact requiring management intervention', examples: ['Project delay', 'Cost £10k-£100k', 'Lost time injury'] },
        { score: 4, label: 'Major', description: 'Major impact with substantial loss', examples: ['Major project failure', 'Cost £100k-£1M', 'Serious injury', 'Regulatory investigation'] },
        { score: 5, label: 'Catastrophic', description: 'Extreme impact threatening viability', examples: ['Business failure', 'Cost >£1M', 'Death or permanent disability', 'Prosecution'] },
      ],
      riskLevelBands: [
        { min: 1, max: 3, level: 'LOW', colour: '#22C55E', action: 'Manage by routine procedures' },
        { min: 4, max: 6, level: 'MEDIUM', colour: '#EAB308', action: 'Management responsibility and monitoring' },
        { min: 8, max: 12, level: 'HIGH', colour: '#F59E0B', action: 'Senior management attention required' },
        { min: 15, max: 19, level: 'VERY_HIGH', colour: '#F97316', action: 'Executive/board notification' },
        { min: 20, max: 25, level: 'CRITICAL', colour: '#EF4444', action: 'Immediate action, board escalation' },
      ],
      overallRiskAppetite: 'MODERATE_APPETITE',
      riskCommitteeExists: true,
      riskCommitteeName: 'Enterprise Risk Committee',
      riskCommitteeMeetingFreq: 'Quarterly',
      boardReportingFreq: 'Quarterly',
      maturityLevel: 'Defined',
      maturityAssessedDate: new Date('2026-01-15'),
    },
  });
  console.log('  Seeded risk framework');

  // ── Seed Risks ──────────────────────────────────────────────────
  const risks = [
    {
      referenceNumber: 'RISK-2026-0001', title: 'Key person dependency — CTO/Technical Director', description: 'Single point of expertise in technical architecture and product development. No formal succession plan exists. Loss of CTO would severely impact product roadmap and technical decision-making.',
      category: 'PEOPLE_HR' as const, subcategory: 'Key Person', causes: ['Single point of expertise', 'No succession plan', 'Concentrated knowledge'],
      riskEvent: 'CTO/Technical Director leaves or is incapacitated', consequences: ['Product roadmap delays', 'Loss of architectural knowledge', 'Team morale impact'],
      inherentLikelihood: 3, inherentConsequence: 4, inherentScore: 12, inherentRiskLevel: 'HIGH', likelihood: 'POSSIBLE' as const, consequence: 'MAJOR' as const,
      controlEffectiveness: 'WEAK' as const, residualLikelihoodNum: 3, residualConsequenceNum: 4, residualScore: 12, residualRiskLevel: 'HIGH',
      residualLikelihood: 'POSSIBLE' as const, residualConsequence: 'MAJOR' as const,
      treatment: 'MITIGATE' as const, treatmentDescription: 'Implement cross-training programme and formal succession plan', treatmentTargetScore: 6,
      appetiteStatus: 'AT_LIMIT', status: 'TREATING' as const, reviewFrequency: 'QUARTERLY',
      sourceModule: 'MANUAL' as const, regulatoryRef: 'ISO 31000:2018 cl.6.5',
    },
    {
      referenceNumber: 'RISK-2026-0002', title: 'Benzene exposure — Laboratory staff', description: 'Laboratory workers exposed to benzene during analytical procedures. Benzene is a Group 1 carcinogen (IARC). WEL: 1 ppm (3.25 mg/m³) 8-hr TWA.',
      category: 'HEALTH_SAFETY' as const, causes: ['Benzene use in laboratory', 'Analytical procedures require handling', 'Potential for spills/vapour release'],
      riskEvent: 'Chronic benzene exposure exceeding WEL', consequences: ['Occupational cancer risk', 'Blood disorders', 'Regulatory enforcement'],
      inherentLikelihood: 2, inherentConsequence: 5, inherentScore: 10, inherentRiskLevel: 'HIGH', likelihood: 'UNLIKELY' as const, consequence: 'CATASTROPHIC' as const,
      controlEffectiveness: 'ADEQUATE' as const, residualLikelihoodNum: 1, residualConsequenceNum: 4, residualScore: 4, residualRiskLevel: 'MEDIUM',
      residualLikelihood: 'RARE' as const, residualConsequence: 'MAJOR' as const,
      treatment: 'MITIGATE' as const, treatmentDescription: 'LEV, RPE FFP3, WEL monitoring programme',
      appetiteStatus: 'WITHIN', status: 'MONITORING' as const, reviewFrequency: 'MONTHLY',
      sourceModule: 'CHEMICAL_COSHH' as const, sourceCoshhId: 'coshh-benzene-001', regulatoryRef: 'ISO 45001:2018 cl.6.1 / COSHH 2002 / EH40',
    },
    {
      referenceNumber: 'RISK-2026-0003', title: 'Fire risk — Electrical distribution board, Ground Floor', description: 'Ageing electrical distribution board in ground floor plant room. Historical issues with overheating. Fire could impact production and building occupants.',
      category: 'HEALTH_SAFETY' as const, causes: ['Ageing electrical infrastructure', 'Overloaded circuits', 'Dust accumulation'],
      riskEvent: 'Electrical fire in ground floor distribution board', consequences: ['Building evacuation', 'Property damage', 'Production shutdown', 'Potential injuries'],
      inherentLikelihood: 3, inherentConsequence: 4, inherentScore: 12, inherentRiskLevel: 'HIGH', likelihood: 'POSSIBLE' as const, consequence: 'MAJOR' as const,
      controlEffectiveness: 'ADEQUATE' as const, residualLikelihoodNum: 2, residualConsequenceNum: 3, residualScore: 6, residualRiskLevel: 'MEDIUM',
      residualLikelihood: 'UNLIKELY' as const, residualConsequence: 'MODERATE' as const,
      treatment: 'MITIGATE' as const, treatmentDescription: 'Annual inspection, PAT testing, thermal imaging programme',
      appetiteStatus: 'WITHIN', status: 'MONITORING' as const, reviewFrequency: 'QUARTERLY',
      sourceModule: 'FIRE_EMERGENCY' as const, sourceFireRiskId: 'fra-gf-001', regulatoryRef: 'FSO 2005 / ISO 45001 cl.8.2',
    },
    {
      referenceNumber: 'RISK-2026-0004', title: 'Currency exchange rate volatility — USD/GBP', description: 'Significant portion of revenue in USD while costs are primarily GBP. Adverse exchange rate movements could materially impact margins.',
      category: 'FINANCIAL' as const, causes: ['USD revenue exposure', 'GBP cost base', 'No hedging programme'],
      riskEvent: 'Significant adverse USD/GBP exchange rate movement', consequences: ['Margin erosion', 'Budget overruns', 'Competitive pricing pressure'],
      inherentLikelihood: 4, inherentConsequence: 3, inherentScore: 12, inherentRiskLevel: 'HIGH', likelihood: 'LIKELY' as const, consequence: 'MODERATE' as const,
      controlEffectiveness: 'WEAK' as const, residualLikelihoodNum: 3, residualConsequenceNum: 3, residualScore: 9, residualRiskLevel: 'HIGH',
      residualLikelihood: 'POSSIBLE' as const, residualConsequence: 'MODERATE' as const,
      treatment: 'SHARE' as const, treatmentDescription: 'Implement full hedging programme with forward contracts', treatmentTargetScore: 4, treatmentCost: 25000,
      appetiteStatus: 'AT_LIMIT', status: 'TREATING' as const, reviewFrequency: 'MONTHLY',
      sourceModule: 'MANUAL' as const, regulatoryRef: 'ISO 31000:2018 cl.6.5.2',
    },
    {
      referenceNumber: 'RISK-2026-0005', title: 'GDPR breach — customer data inadequately protected', description: 'Customer personal data stored across multiple systems with inconsistent access controls. Potential for data breach leading to ICO investigation and significant fines (up to 4% of global turnover).',
      category: 'COMPLIANCE' as const, causes: ['Fragmented data storage', 'Inconsistent access controls', 'Lack of data classification', 'Phishing vulnerability'],
      riskEvent: 'Personal data breach involving customer records', consequences: ['ICO investigation', 'Fine up to 4% turnover', 'Reputational damage', 'Customer compensation claims'],
      inherentLikelihood: 3, inherentConsequence: 5, inherentScore: 15, inherentRiskLevel: 'VERY_HIGH', likelihood: 'POSSIBLE' as const, consequence: 'CATASTROPHIC' as const,
      controlEffectiveness: 'ADEQUATE' as const, residualLikelihoodNum: 2, residualConsequenceNum: 4, residualScore: 8, residualRiskLevel: 'HIGH',
      residualLikelihood: 'UNLIKELY' as const, residualConsequence: 'MAJOR' as const,
      treatment: 'MITIGATE' as const, treatmentDescription: 'Data classification, encryption at rest/transit, access control review, phishing training', treatmentTargetScore: 4,
      appetiteStatus: 'EXCEEDS', acceptedByManagement: true, acceptedBy: 'Chief Information Officer', acceptedAt: new Date('2026-02-01'),
      acceptanceJustification: 'Risk accepted pending completion of data classification project (Q2 2026). Compensating controls: enhanced monitoring, incident response plan tested.',
      status: 'TREATING' as const, reviewFrequency: 'MONTHLY',
      sourceModule: 'MANUAL' as const, regulatoryRef: 'UK GDPR Art.5/Art.32 / ISO 27001:2022 cl.6.1',
    },
    {
      referenceNumber: 'RISK-2026-0006', title: 'Key supplier failure — sole-source critical component', description: 'Single supplier for critical electronic components used in primary product line. Supplier financial health has deteriorated in recent quarters.',
      category: 'SUPPLY_CHAIN' as const, causes: ['Sole-source dependency', 'Supplier financial weakness', 'No alternative qualified'],
      riskEvent: 'Critical supplier fails or cannot deliver', consequences: ['Production halt', 'Customer delivery delays', 'Revenue loss', 'Emergency procurement at premium cost'],
      inherentLikelihood: 3, inherentConsequence: 4, inherentScore: 12, inherentRiskLevel: 'HIGH', likelihood: 'POSSIBLE' as const, consequence: 'MAJOR' as const,
      controlEffectiveness: 'WEAK' as const, residualLikelihoodNum: 3, residualConsequenceNum: 4, residualScore: 12, residualRiskLevel: 'HIGH',
      residualLikelihood: 'POSSIBLE' as const, residualConsequence: 'MAJOR' as const,
      treatment: 'MITIGATE' as const, treatmentDescription: 'Qualify alternative supplier, build safety stock, monitor supplier financials', treatmentTargetScore: 6,
      appetiteStatus: 'AT_LIMIT', status: 'TREATING' as const, reviewFrequency: 'QUARTERLY',
      sourceModule: 'MANUAL' as const, regulatoryRef: 'ISO 9001:2015 cl.8.4',
    },
    {
      referenceNumber: 'RISK-2026-0007', title: 'Talent retention — skilled engineer shortage', description: 'Difficulty retaining specialist engineers in competitive market. Turnover rate trending upward. Loss of key skills would impact project delivery capability.',
      category: 'PEOPLE_HR' as const, causes: ['Competitive job market', 'Below-market compensation', 'Limited career development paths'],
      riskEvent: 'Multiple skilled engineers leave within short period', consequences: ['Project delays', 'Knowledge loss', 'Recruitment costs', 'Remaining staff overloaded'],
      inherentLikelihood: 4, inherentConsequence: 3, inherentScore: 12, inherentRiskLevel: 'HIGH', likelihood: 'LIKELY' as const, consequence: 'MODERATE' as const,
      controlEffectiveness: 'ADEQUATE' as const, residualLikelihoodNum: 3, residualConsequenceNum: 3, residualScore: 9, residualRiskLevel: 'HIGH',
      residualLikelihood: 'POSSIBLE' as const, residualConsequence: 'MODERATE' as const,
      treatment: 'MITIGATE' as const, treatmentDescription: 'Retention package, salary benchmarking, STEM partnerships, career development programme',
      appetiteStatus: 'AT_LIMIT', status: 'TREATING' as const, reviewFrequency: 'QUARTERLY',
      sourceModule: 'MANUAL' as const,
    },
    {
      referenceNumber: 'RISK-2026-0008', title: 'Ransomware attack on production systems', description: 'Sophisticated ransomware attack encrypting production systems and data. Could halt all operations. Recent industry attacks demonstrate increasing threat level.',
      category: 'TECHNOLOGY_CYBER' as const, causes: ['Phishing emails', 'Unpatched vulnerabilities', 'Remote access exposure', 'Third-party compromise'],
      riskEvent: 'Ransomware encrypts production systems and demands payment', consequences: ['Complete operational shutdown', 'Data loss/corruption', 'Ransom demand', 'Recovery costs', 'Customer notification'],
      inherentLikelihood: 3, inherentConsequence: 5, inherentScore: 15, inherentRiskLevel: 'VERY_HIGH', likelihood: 'POSSIBLE' as const, consequence: 'CATASTROPHIC' as const,
      controlEffectiveness: 'STRONG' as const, residualLikelihoodNum: 2, residualConsequenceNum: 4, residualScore: 8, residualRiskLevel: 'HIGH',
      residualLikelihood: 'UNLIKELY' as const, residualConsequence: 'MAJOR' as const,
      treatment: 'MITIGATE' as const, treatmentDescription: 'EDR on all endpoints, daily backups tested monthly, SOC monitoring 24/7, patching within 72hrs for critical CVEs',
      appetiteStatus: 'WITHIN', status: 'MONITORING' as const, reviewFrequency: 'MONTHLY',
      sourceModule: 'MANUAL' as const, regulatoryRef: 'ISO 27001:2022 Annex A / NCSC Cyber Essentials',
    },
    {
      referenceNumber: 'RISK-2026-0009', title: 'Chemical spill to surface water drain', description: 'Bulk chemical storage area adjacent to surface water drain. Spill could contaminate local watercourse. Environmental Agency enforcement risk.',
      category: 'ENVIRONMENTAL' as const, causes: ['Proximity to surface water', 'Ageing bund walls', 'Human error during transfer'],
      riskEvent: 'Chemical release reaches surface water drain', consequences: ['Watercourse contamination', 'EA prosecution', 'Clean-up costs', 'Community impact', 'Permit revocation risk'],
      inherentLikelihood: 2, inherentConsequence: 5, inherentScore: 10, inherentRiskLevel: 'HIGH', likelihood: 'UNLIKELY' as const, consequence: 'CATASTROPHIC' as const,
      controlEffectiveness: 'STRONG' as const, residualLikelihoodNum: 1, residualConsequenceNum: 3, residualScore: 3, residualRiskLevel: 'LOW',
      residualLikelihood: 'RARE' as const, residualConsequence: 'MODERATE' as const,
      treatment: 'MITIGATE' as const, treatmentDescription: 'Bunded storage 110% capacity, spill kits at all transfer points, drain covers, weekly inspections',
      appetiteStatus: 'WITHIN', status: 'MONITORING' as const, reviewFrequency: 'QUARTERLY',
      sourceModule: 'ENVIRONMENTAL' as const, regulatoryRef: 'ISO 14001:2015 cl.6.1 / Environmental Permitting Regulations',
    },
    {
      referenceNumber: 'RISK-2026-0010', title: 'Major product recall — quality system failure', description: 'Systematic quality control failure resulting in defective product batch reaching customers. Product recall would be costly and damage brand reputation.',
      category: 'QUALITY' as const, causes: ['Inspection process gap', 'Supplier material variation', 'Equipment calibration drift'],
      riskEvent: 'Defective product batch shipped to customers requiring recall', consequences: ['Recall costs', 'Customer compensation', 'Brand damage', 'Regulatory scrutiny', 'Lost contracts'],
      inherentLikelihood: 2, inherentConsequence: 5, inherentScore: 10, inherentRiskLevel: 'HIGH', likelihood: 'UNLIKELY' as const, consequence: 'CATASTROPHIC' as const,
      controlEffectiveness: 'ADEQUATE' as const, residualLikelihoodNum: 2, residualConsequenceNum: 4, residualScore: 8, residualRiskLevel: 'HIGH',
      residualLikelihood: 'UNLIKELY' as const, residualConsequence: 'MAJOR' as const,
      treatment: 'MITIGATE' as const, treatmentDescription: 'Enhanced incoming inspection, SPC on critical processes, supplier audit programme',
      appetiteStatus: 'AT_LIMIT', status: 'TREATING' as const, reviewFrequency: 'QUARTERLY',
      sourceModule: 'MANUAL' as const, regulatoryRef: 'ISO 9001:2015 cl.8.7 / Consumer Rights Act 2015',
    },
  ];

  for (const risk of risks) {
    const existing = await prisma.riskRegister.findFirst({ where: { referenceNumber: risk.referenceNumber } });
    if (!existing) {
      const created = await prisma.riskRegister.create({
        data: { ...risk, orgId, nextReviewDate: new Date('2026-06-01'), createdBy: 'seed', updatedBy: 'seed' },
      });

      // Add controls for some risks
      if (risk.referenceNumber === 'RISK-2026-0002') {
        await prisma.riskControl.createMany({ data: [
          { riskId: created.id, controlType: 'PREVENTIVE', description: 'Local exhaust ventilation (LEV) at all benzene handling points', effectiveness: 'STRONG', owner: 'Facilities Manager', testingFrequency: 'Annual' },
          { riskId: created.id, controlType: 'PREVENTIVE', description: 'RPE FFP3 masks mandatory for all benzene handling', effectiveness: 'ADEQUATE', owner: 'Lab Manager', testingFrequency: 'Quarterly' },
          { riskId: created.id, controlType: 'DETECTIVE', description: 'Workplace exposure monitoring programme (quarterly)', effectiveness: 'STRONG', owner: 'H&S Manager', testingFrequency: 'Quarterly' },
        ]});
      }
      if (risk.referenceNumber === 'RISK-2026-0008') {
        await prisma.riskControl.createMany({ data: [
          { riskId: created.id, controlType: 'PREVENTIVE', description: 'EDR (Endpoint Detection and Response) on all endpoints', effectiveness: 'STRONG', owner: 'IT Security Manager' },
          { riskId: created.id, controlType: 'PREVENTIVE', description: 'Email filtering and anti-phishing tools', effectiveness: 'ADEQUATE', owner: 'IT Security Manager' },
          { riskId: created.id, controlType: 'REACTIVE', description: 'Daily backups with monthly restore testing', effectiveness: 'STRONG', owner: 'IT Manager', testingFrequency: 'Monthly' },
          { riskId: created.id, controlType: 'DETECTIVE', description: 'SOC 24/7 monitoring with SIEM alerts', effectiveness: 'STRONG', owner: 'IT Security Manager' },
        ]});
      }

      // Add KRIs for key risks
      if (risk.referenceNumber === 'RISK-2026-0001') {
        await prisma.riskKri.create({ data: {
          riskId: created.id, name: 'Days since last knowledge transfer session', unit: 'days',
          greenThreshold: 30, amberThreshold: 60, redThreshold: 90, thresholdDirection: 'INCREASING_IS_WORSE',
          currentValue: 45, currentStatus: 'AMBER', lastMeasuredAt: new Date(), measurementFrequency: 'Monthly', dataSource: 'Training records',
        }});
      }
      if (risk.referenceNumber === 'RISK-2026-0003') {
        await prisma.riskKri.create({ data: {
          riskId: created.id, name: 'Days since last electrical inspection', unit: 'days',
          greenThreshold: 300, amberThreshold: 340, redThreshold: 365, thresholdDirection: 'INCREASING_IS_WORSE',
          currentValue: 120, currentStatus: 'GREEN', lastMeasuredAt: new Date(), measurementFrequency: 'Monthly', dataSource: 'Maintenance records',
        }});
      }
      if (risk.referenceNumber === 'RISK-2026-0005') {
        await prisma.riskKri.create({ data: {
          riskId: created.id, name: 'Phishing test failure rate', unit: '%',
          greenThreshold: 5, amberThreshold: 10, redThreshold: 20, thresholdDirection: 'INCREASING_IS_WORSE',
          currentValue: 8, currentStatus: 'AMBER', lastMeasuredAt: new Date(), measurementFrequency: 'Quarterly', dataSource: 'Phishing simulation platform',
        }});
      }
      if (risk.referenceNumber === 'RISK-2026-0006') {
        await prisma.riskKri.createMany({ data: [
          { riskId: created.id, name: 'Supplier credit rating', unit: 'score', greenThreshold: 70, amberThreshold: 50, redThreshold: 40, thresholdDirection: 'DECREASING_IS_WORSE', currentValue: 55, currentStatus: 'AMBER', measurementFrequency: 'Quarterly', dataSource: 'Credit agency' },
          { riskId: created.id, name: 'Supplier delivery failure rate', unit: '%', greenThreshold: 2, amberThreshold: 5, redThreshold: 10, thresholdDirection: 'INCREASING_IS_WORSE', currentValue: 3, currentStatus: 'AMBER', measurementFrequency: 'Monthly', dataSource: 'Procurement system' },
        ]});
      }
      if (risk.referenceNumber === 'RISK-2026-0008') {
        await prisma.riskKri.create({ data: {
          riskId: created.id, name: 'Days since last backup test', unit: 'days',
          greenThreshold: 30, amberThreshold: 45, redThreshold: 60, thresholdDirection: 'INCREASING_IS_WORSE',
          currentValue: 15, currentStatus: 'GREEN', lastMeasuredAt: new Date(), measurementFrequency: 'Monthly', dataSource: 'IT operations log',
        }});
      }
      if (risk.referenceNumber === 'RISK-2026-0010') {
        await prisma.riskKri.createMany({ data: [
          { riskId: created.id, name: 'Customer complaint rate', unit: 'per 1000 units', greenThreshold: 2, amberThreshold: 5, redThreshold: 10, thresholdDirection: 'INCREASING_IS_WORSE', currentValue: 3.2, currentStatus: 'AMBER', measurementFrequency: 'Monthly', dataSource: 'CRM system' },
          { riskId: created.id, name: 'Incoming inspection reject rate', unit: '%', greenThreshold: 1, amberThreshold: 3, redThreshold: 5, thresholdDirection: 'INCREASING_IS_WORSE', currentValue: 1.8, currentStatus: 'AMBER', measurementFrequency: 'Weekly', dataSource: 'Quality system' },
          { riskId: created.id, name: 'Equipment calibration compliance', unit: '%', greenThreshold: 98, amberThreshold: 95, redThreshold: 90, thresholdDirection: 'DECREASING_IS_WORSE', currentValue: 97, currentStatus: 'AMBER', measurementFrequency: 'Monthly', dataSource: 'Calibration records' },
        ]});
      }

      // Add treatment actions for some risks
      if (risk.referenceNumber === 'RISK-2026-0001') {
        await prisma.riskAction.createMany({ data: [
          { riskId: created.id, actionTitle: 'Create formal succession plan for CTO role', description: 'Document key responsibilities, identify potential successors, create development plans', actionType: 'PREVENTIVE', owner: 'HR Director', targetDate: new Date('2026-06-30'), priority: 'HIGH', status: 'IN_PROGRESS' },
          { riskId: created.id, actionTitle: 'Implement cross-training programme', description: 'Weekly knowledge transfer sessions covering critical technical architecture', actionType: 'PREVENTIVE', owner: 'CTO', targetDate: new Date('2026-09-30'), priority: 'HIGH', status: 'OPEN' },
        ]});
      }
      if (risk.referenceNumber === 'RISK-2026-0005') {
        await prisma.riskAction.createMany({ data: [
          { riskId: created.id, actionTitle: 'Complete data classification project', description: 'Classify all customer data stores by sensitivity level, apply appropriate access controls', actionType: 'PREVENTIVE', owner: 'Data Protection Officer', targetDate: new Date('2026-06-30'), priority: 'CRITICAL', status: 'IN_PROGRESS' },
          { riskId: created.id, actionTitle: 'Deploy encryption at rest for all databases', description: 'Enable TDE/encryption for all databases containing personal data', actionType: 'PREVENTIVE', owner: 'IT Security Manager', targetDate: new Date('2026-04-30'), priority: 'HIGH', status: 'IN_PROGRESS' },
        ]});
      }

      // Add bow-tie for risks 2 and 8
      if (risk.referenceNumber === 'RISK-2026-0002') {
        await prisma.riskBowtie.create({ data: {
          riskId: created.id, topEvent: 'Benzene exposure exceeding WEL',
          threats: [
            { id: 't1', description: 'Spill during transfer', likelihood: 3 },
            { id: 't2', description: 'LEV failure/insufficient', likelihood: 2 },
          ],
          preventionBarriers: [
            { id: 'pb1', description: 'Local exhaust ventilation', type: 'PREVENTIVE', effectiveness: 'STRONG', owner: 'Facilities', degradationFactors: ['Filter blockage', 'Fan failure'], linkedThreatIds: ['t1', 't2'] },
            { id: 'pb2', description: 'Closed transfer systems', type: 'PREVENTIVE', effectiveness: 'STRONG', owner: 'Lab Manager', degradationFactors: ['Seal wear'], linkedThreatIds: ['t1'] },
            { id: 'pb3', description: 'RPE — FFP3 masks', type: 'PREVENTIVE', effectiveness: 'ADEQUATE', owner: 'Lab staff', degradationFactors: ['Poor fit', 'Non-compliance'], linkedThreatIds: ['t1', 't2'] },
          ],
          consequences: [
            { id: 'c1', description: 'Acute benzene poisoning', severity: 4 },
            { id: 'c2', description: 'Long-term cancer risk', severity: 5 },
          ],
          mitigationBarriers: [
            { id: 'mb1', description: 'Workplace exposure monitoring', type: 'DETECTIVE', effectiveness: 'STRONG', owner: 'H&S Manager', linkedConsequenceIds: ['c1', 'c2'] },
            { id: 'mb2', description: 'Health surveillance programme', type: 'DETECTIVE', effectiveness: 'ADEQUATE', owner: 'Occupational Health', linkedConsequenceIds: ['c2'] },
          ],
          criticalPath: 'LEV failure during transfer → RPE not worn → acute exposure → delayed detection',
          keyGaps: 'RPE compliance monitoring needs improvement',
          priorityActions: '1. Install LEV monitoring alarms 2. Enforce RPE compliance audits 3. Increase monitoring frequency',
          createdBy: 'seed',
        }});
      }
      if (risk.referenceNumber === 'RISK-2026-0008') {
        await prisma.riskBowtie.create({ data: {
          riskId: created.id, topEvent: 'Ransomware encrypts production systems',
          threats: [
            { id: 't1', description: 'Phishing email with malicious attachment', likelihood: 4 },
            { id: 't2', description: 'Exploitation of unpatched vulnerability', likelihood: 3 },
            { id: 't3', description: 'Compromised third-party software', likelihood: 2 },
          ],
          preventionBarriers: [
            { id: 'pb1', description: 'Email filtering and anti-phishing', type: 'PREVENTIVE', effectiveness: 'ADEQUATE', owner: 'IT Security', degradationFactors: ['New attack vectors', 'Zero-day payloads'], linkedThreatIds: ['t1'] },
            { id: 'pb2', description: 'Patch management (72hr critical)', type: 'PREVENTIVE', effectiveness: 'STRONG', owner: 'IT Ops', degradationFactors: ['Compatibility issues', 'Downtime windows'], linkedThreatIds: ['t2'] },
            { id: 'pb3', description: 'EDR on all endpoints', type: 'DETECTIVE', effectiveness: 'STRONG', owner: 'IT Security', degradationFactors: ['Agent disabled', 'Novel malware'], linkedThreatIds: ['t1', 't2', 't3'] },
          ],
          consequences: [
            { id: 'c1', description: 'Complete operational shutdown', severity: 5 },
            { id: 'c2', description: 'Data loss/corruption', severity: 4 },
            { id: 'c3', description: 'Ransom payment demand', severity: 3 },
          ],
          mitigationBarriers: [
            { id: 'mb1', description: 'Daily backups with air-gapped copies', type: 'REACTIVE', effectiveness: 'STRONG', owner: 'IT Ops', linkedConsequenceIds: ['c1', 'c2'] },
            { id: 'mb2', description: 'Incident response plan (tested annually)', type: 'REACTIVE', effectiveness: 'ADEQUATE', owner: 'CISO', linkedConsequenceIds: ['c1', 'c2', 'c3'] },
            { id: 'mb3', description: 'Cyber insurance policy', type: 'REACTIVE', effectiveness: 'ADEQUATE', owner: 'CFO', linkedConsequenceIds: ['c3'] },
          ],
          criticalPath: 'Phishing email → user clicks → EDR misses → lateral movement → encryption of file servers → backup corruption',
          keyGaps: 'Air-gapped backup frequency (currently daily, target: continuous)',
          priorityActions: '1. Implement immutable backups 2. Conduct tabletop exercise Q1 3. Deploy network segmentation for OT',
          createdBy: 'seed',
        }});
      }
    }
  }
  console.log(`  Seeded ${risks.length} risks with controls, KRIs, actions, and bow-ties`);

  console.log('Enterprise Risk Management seed complete!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
