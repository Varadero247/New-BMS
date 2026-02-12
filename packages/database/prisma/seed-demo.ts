/**
 * Demo Seed Data for UAT / Sales Demos
 * Generates realistic data for Automotive, Medical, and Aerospace verticals
 *
 * Usage:
 *   npx tsx packages/database/prisma/seed-demo.ts
 *
 * Requires AUTOMOTIVE_DATABASE_URL, MEDICAL_DATABASE_URL, AEROSPACE_DATABASE_URL
 * environment variables (or a shared DATABASE_URL).
 */

// ============================================================
// Because the monorepo uses separate generated Prisma clients
// per schema, this seed script imports from the generated paths.
// If the generated clients are not available, fall back to
// raw SQL via a generic PrismaClient.
// ============================================================

import { PrismaClient as AutomotiveClient } from '../../generated/automotive';
import { PrismaClient as MedicalClient } from '../../generated/medical';
import { PrismaClient as AerospaceClient } from '../../generated/aerospace';

const automotive = new AutomotiveClient();
const medical = new MedicalClient();
const aerospace = new AerospaceClient();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function refNumber(prefix: string, seq: number): string {
  const now = new Date();
  const yymm = `${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, '0')}`;
  return `${prefix}-${yymm}-${String(seq).padStart(4, '0')}`;
}

function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

function daysAgo(days: number): Date {
  return daysFromNow(-days);
}

// ---------------------------------------------------------------------------
// Automotive Seed
// ---------------------------------------------------------------------------

async function seedAutomotive() {
  console.log('Seeding Automotive (IATF 16949) data...');

  // 5 APQP Projects at various stages
  const apqpProjects = [
    {
      id: 'apqp-demo-001',
      refNumber: refNumber('APQP', 1),
      title: 'Brake Caliper Housing - Ford Explorer 2027',
      partNumber: 'BC-4420-A',
      partName: 'Brake Caliper Housing',
      customer: 'Ford Motor Company',
      programName: 'U725 Explorer',
      status: 'IN_PROGRESS' as const,
      currentPhase: 3,
      startDate: daysAgo(120),
      targetDate: daysFromNow(90),
      teamLeader: 'J. Martinez',
      teamMembers: ['R. Chen', 'S. Patel', 'M. Johnson'],
    },
    {
      id: 'apqp-demo-002',
      refNumber: refNumber('APQP', 2),
      title: 'Steering Knuckle - GM Silverado',
      partNumber: 'SK-7800-B',
      partName: 'Steering Knuckle Assembly',
      customer: 'General Motors',
      programName: 'T1XX Silverado',
      status: 'PLANNING' as const,
      currentPhase: 1,
      startDate: daysAgo(14),
      targetDate: daysFromNow(240),
      teamLeader: 'A. Williams',
      teamMembers: ['K. Thompson', 'L. Davis'],
    },
    {
      id: 'apqp-demo-003',
      refNumber: refNumber('APQP', 3),
      title: 'Turbo Inlet Pipe - Stellantis',
      partNumber: 'TIP-3200-C',
      partName: 'Turbocharger Inlet Pipe',
      customer: 'Stellantis',
      programName: 'Hurricane I6 Program',
      status: 'IN_PROGRESS' as const,
      currentPhase: 4,
      startDate: daysAgo(200),
      targetDate: daysFromNow(30),
      teamLeader: 'D. Brown',
      teamMembers: ['P. Garcia', 'N. Singh', 'T. Nguyen'],
    },
    {
      id: 'apqp-demo-004',
      refNumber: refNumber('APQP', 4),
      title: 'Control Arm Bushing - Toyota Camry',
      partNumber: 'CAB-1100-D',
      partName: 'Lower Control Arm Bushing',
      customer: 'Toyota Motor North America',
      programName: 'XV80 Camry',
      status: 'COMPLETED' as const,
      currentPhase: 5,
      startDate: daysAgo(300),
      targetDate: daysAgo(10),
      completedDate: daysAgo(5),
      teamLeader: 'E. Tanaka',
      teamMembers: ['H. Park', 'S. Lee'],
    },
    {
      id: 'apqp-demo-005',
      refNumber: refNumber('APQP', 5),
      title: 'Exhaust Manifold - Honda Civic',
      partNumber: 'EM-5500-E',
      partName: 'Exhaust Manifold',
      customer: 'Honda Manufacturing',
      programName: 'FL5 Civic',
      status: 'ON_HOLD' as const,
      currentPhase: 2,
      startDate: daysAgo(90),
      targetDate: daysFromNow(150),
      teamLeader: 'R. Yamamoto',
      teamMembers: ['C. Wang', 'M. Ali'],
    },
  ];

  for (const project of apqpProjects) {
    await automotive.apqpProject.upsert({
      where: { id: project.id },
      update: {},
      create: project,
    });
  }
  console.log(`  Created ${apqpProjects.length} APQP projects`);

  // 3 PPAP Submissions
  const ppapProjects = [
    {
      id: 'ppap-demo-001',
      refNumber: refNumber('PPAP', 1),
      partNumber: 'BC-4420-A',
      partName: 'Brake Caliper Housing',
      customer: 'Ford Motor Company',
      submissionLevel: 3,
      status: 'IN_PROGRESS' as const,
      apqpProjectId: 'apqp-demo-001',
    },
    {
      id: 'ppap-demo-002',
      refNumber: refNumber('PPAP', 2),
      partNumber: 'CAB-1100-D',
      partName: 'Lower Control Arm Bushing',
      customer: 'Toyota Motor North America',
      submissionLevel: 3,
      status: 'APPROVED' as const,
      apqpProjectId: 'apqp-demo-004',
    },
    {
      id: 'ppap-demo-003',
      refNumber: refNumber('PPAP', 3),
      partNumber: 'TIP-3200-C',
      partName: 'Turbocharger Inlet Pipe',
      customer: 'Stellantis',
      submissionLevel: 4,
      status: 'SUBMITTED' as const,
      apqpProjectId: 'apqp-demo-003',
    },
  ];

  for (const project of ppapProjects) {
    await automotive.ppapProject.upsert({
      where: { id: project.id },
      update: {},
      create: project,
    });
  }
  console.log(`  Created ${ppapProjects.length} PPAP projects`);

  // SPC Charts with data points
  const spcCharts = [
    {
      id: 'spc-demo-001',
      refNumber: refNumber('SPC', 1),
      title: 'Bore Diameter - Brake Caliper',
      characteristic: 'Inner Bore Diameter',
      partNumber: 'BC-4420-A',
      partName: 'Brake Caliper Housing',
      chartType: 'XBAR_R' as const,
      usl: 25.05,
      lsl: 24.95,
      target: 25.00,
      subgroupSize: 5,
      unit: 'mm',
      frequency: 'Every 2 hours',
      status: 'ACTIVE' as const,
    },
    {
      id: 'spc-demo-002',
      refNumber: refNumber('SPC', 2),
      title: 'Surface Roughness - Knuckle',
      characteristic: 'Surface Roughness Ra',
      partNumber: 'SK-7800-B',
      partName: 'Steering Knuckle Assembly',
      chartType: 'IMR' as const,
      usl: 1.6,
      lsl: 0.4,
      target: 0.8,
      subgroupSize: 1,
      unit: 'um',
      frequency: 'Every shift',
      status: 'ACTIVE' as const,
    },
  ];

  for (const chart of spcCharts) {
    await automotive.spcChart.upsert({
      where: { id: chart.id },
      update: {},
      create: chart,
    });

    // 10 data points per chart
    const baseValue = chart.target ?? 25.0;
    for (let i = 0; i < 10; i++) {
      const variation = (Math.random() - 0.5) * (chart.usl! - chart.lsl!) * 0.6;
      const value = parseFloat((baseValue + variation).toFixed(4));
      const outOfControl = chart.usl !== null && chart.lsl !== null &&
        (value > chart.usl || value < chart.lsl);

      await automotive.spcDataPoint.create({
        data: {
          chartId: chart.id,
          value,
          subgroup: i + 1,
          timestamp: daysAgo(10 - i),
          operator: ['A. Operator', 'B. Operator', 'C. Operator'][i % 3],
          outOfControl,
          violationRules: outOfControl ? ['Point beyond control limit'] : [],
        },
      });
    }
  }
  console.log(`  Created ${spcCharts.length} SPC charts with 10 data points each`);

  // Control Plans
  const controlPlan = {
    id: 'cp-demo-001',
    refNumber: refNumber('CP', 1),
    title: 'Brake Caliper Machining Control Plan',
    partNumber: 'BC-4420-A',
    partName: 'Brake Caliper Housing',
    planType: 'PRODUCTION' as const,
    status: 'APPROVED' as const,
    revision: 'B',
    approvedBy: 'Quality Manager L. Torres',
    approvedDate: daysAgo(30),
  };

  await automotive.controlPlan.upsert({
    where: { id: controlPlan.id },
    update: {},
    create: controlPlan,
  });
  console.log('  Created 1 Control Plan');

  // MSA Study
  const msaStudy = {
    id: 'msa-demo-001',
    refNumber: refNumber('MSA', 1),
    title: 'Bore Gauge GR&R - Mitutoyo #347',
    studyType: 'GRR_CROSSED' as const,
    gageName: 'Mitutoyo Bore Gauge',
    gageId: 'MBG-347',
    characteristic: 'Inner Bore Diameter',
    specification: '25.00 +/- 0.05 mm',
    tolerance: '0.10',
    status: 'COMPLETED' as const,
    operatorCount: 3,
    operators: ['A. Operator', 'B. Operator', 'C. Operator'],
    numParts: 10,
    numTrials: 3,
    repeatability: 3.2,
    reproducibility: 2.1,
    totalGRR: 5.3,
    grrPercent: 8.5,
    ev: 0.0032,
    av: 0.0021,
    grr: 0.0053,
    pv: 0.0580,
    tv: 0.0582,
    ndc: 15,
    result: 'ACCEPTABLE' as const,
    completedDate: daysAgo(45),
  };

  await automotive.msaStudy.upsert({
    where: { id: msaStudy.id },
    update: {},
    create: msaStudy,
  });
  console.log('  Created 1 MSA Study');

  // LPA Schedule + Audit
  const lpaSchedule = {
    id: 'lpa-sched-demo-001',
    processArea: 'Welding Cell A',
    layer: 1,
    frequency: 'DAILY' as const,
    active: true,
  };

  await automotive.lpaSchedule.upsert({
    where: { id: lpaSchedule.id },
    update: {},
    create: lpaSchedule,
  });

  const lpaAudit = {
    id: 'lpa-audit-demo-001',
    refNumber: refNumber('LPA', 1),
    scheduleId: 'lpa-sched-demo-001',
    auditor: 'J. Rodriguez',
    layer: 1,
    processArea: 'Welding Cell A',
    status: 'COMPLETED' as const,
    totalQuestions: 5,
    passCount: 4,
    failCount: 1,
    naCount: 0,
    score: 80.0,
    completedAt: daysAgo(2),
  };

  await automotive.lpaAudit.upsert({
    where: { id: lpaAudit.id },
    update: {},
    create: lpaAudit,
  });
  console.log('  Created 1 LPA Schedule + 1 Audit');

  // CSR Requirements
  const csrRequirements = [
    {
      id: 'csr-demo-001',
      oem: 'Ford',
      iatfClause: '8.3.2.1',
      requirementText: 'All design records must be submitted in CATIA V5 native format with 3D PMI annotations.',
      complianceStatus: 'COMPLIANT' as const,
    },
    {
      id: 'csr-demo-002',
      oem: 'GM',
      iatfClause: '8.5.1.1',
      requirementText: 'Control plans must follow GM GP-12 format including reaction plan flowchart.',
      complianceStatus: 'PARTIAL' as const,
      gapNotes: 'Current template missing reaction plan flowchart section',
      actionRequired: 'Update control plan template to include GP-12 reaction plan format',
      assignedTo: 'S. Kim',
      dueDate: daysFromNow(45),
    },
    {
      id: 'csr-demo-003',
      oem: 'Stellantis',
      iatfClause: '9.1.1.1',
      requirementText: 'SPC data must be submitted monthly via Stellantis SQP portal.',
      complianceStatus: 'NOT_ASSESSED' as const,
    },
  ];

  for (const csr of csrRequirements) {
    await automotive.csrRequirement.upsert({
      where: { id: csr.id },
      update: {},
      create: csr,
    });
  }
  console.log(`  Created ${csrRequirements.length} CSR requirements`);
}

// ---------------------------------------------------------------------------
// Medical Seed
// ---------------------------------------------------------------------------

async function seedMedical() {
  console.log('Seeding Medical Devices (ISO 13485) data...');

  // 5 Design Control projects
  const designProjects = [
    {
      id: 'dc-demo-001',
      refNumber: refNumber('DC', 1),
      title: 'GlucoSense X1 Continuous Glucose Monitor',
      deviceName: 'GlucoSense X1',
      deviceClass: 'CLASS_II' as const,
      intendedUse: 'Continuous glucose monitoring for Type 1 and Type 2 diabetes patients aged 18+',
      regulatoryPathway: '510(k)',
      currentStage: 'VERIFICATION' as const,
      status: 'ACTIVE' as const,
      projectLead: 'Dr. A. Patel',
      teamMembers: ['Dr. S. Kim', 'R. Eng. Samuels', 'M. Chen'],
      startDate: daysAgo(180),
      targetDate: daysFromNow(120),
    },
    {
      id: 'dc-demo-002',
      refNumber: refNumber('DC', 2),
      title: 'CardioRhythm Implantable Loop Recorder',
      deviceName: 'CardioRhythm ILR-200',
      deviceClass: 'CLASS_III' as const,
      intendedUse: 'Long-term continuous cardiac rhythm monitoring via subcutaneous implant',
      regulatoryPathway: 'PMA',
      currentStage: 'INPUTS' as const,
      status: 'ACTIVE' as const,
      projectLead: 'Dr. R. Kapoor',
      teamMembers: ['Dr. L. Zhao', 'J. Fernandez'],
      startDate: daysAgo(45),
      targetDate: daysFromNow(365),
    },
    {
      id: 'dc-demo-003',
      refNumber: refNumber('DC', 3),
      title: 'OrthoFlex Knee Brace System',
      deviceName: 'OrthoFlex KB-300',
      deviceClass: 'CLASS_I' as const,
      intendedUse: 'Post-operative knee stabilization and rehabilitation support',
      regulatoryPathway: '510(k) Exempt',
      currentStage: 'TRANSFER' as const,
      status: 'ACTIVE' as const,
      projectLead: 'M. Torres',
      teamMembers: ['A. Singh', 'K. Yamada'],
      startDate: daysAgo(300),
      targetDate: daysFromNow(30),
    },
    {
      id: 'dc-demo-004',
      refNumber: refNumber('DC', 4),
      title: 'NeuroPulse Spinal Cord Stimulator',
      deviceName: 'NeuroPulse SCS-500',
      deviceClass: 'CLASS_III' as const,
      intendedUse: 'Pain management via spinal cord stimulation for chronic pain patients',
      regulatoryPathway: 'PMA',
      currentStage: 'PLANNING' as const,
      status: 'ACTIVE' as const,
      projectLead: 'Dr. E. Hoffman',
      teamMembers: ['Dr. N. Agrawal', 'T. Wilson', 'B. Lee'],
      startDate: daysAgo(10),
      targetDate: daysFromNow(540),
    },
    {
      id: 'dc-demo-005',
      refNumber: refNumber('DC', 5),
      title: 'DermaScan Skin Lesion Analyzer',
      deviceName: 'DermaScan AI-100',
      deviceClass: 'CLASS_II' as const,
      intendedUse: 'AI-assisted dermatological lesion classification for clinician decision support',
      regulatoryPathway: 'De Novo',
      currentStage: 'COMPLETE' as const,
      status: 'COMPLETED' as const,
      projectLead: 'Dr. P. Gonzalez',
      teamMembers: ['A. Rao', 'C. Liu'],
      startDate: daysAgo(450),
      targetDate: daysAgo(30),
      completedDate: daysAgo(25),
    },
  ];

  for (const project of designProjects) {
    await medical.designProject.upsert({
      where: { id: project.id },
      update: {},
      create: project,
    });
  }
  console.log(`  Created ${designProjects.length} Design Control projects`);

  // 3 Complaint records
  const complaints = [
    {
      id: 'comp-demo-001',
      refNumber: refNumber('COMP', 1),
      deviceName: 'GlucoSense X1',
      lotNumber: 'BATCH-2026-0042',
      complaintDate: daysAgo(15),
      source: 'HEALTHCARE_PROVIDER' as const,
      reporterName: 'Dr. Emily Chen',
      reporterContact: 'emily.chen@hospital.org',
      description: 'Sensor readings consistently 20% higher than fingerstick reference after day 10 of 14-day wear period. Observed in 3 patients.',
      patientInvolved: true,
      injuryOccurred: false,
      malfunctionOccurred: true,
      severity: 'MAJOR' as const,
      status: 'UNDER_INVESTIGATION' as const,
      investigationSummary: 'Returned sensors analyzed; adhesive degradation under high humidity causing sensor drift.',
      rootCause: 'Adhesive formulation sensitivity to humidity above 80% RH.',
      mdrReportable: true,
      mdrDecisionDate: daysAgo(12),
      mdrDecisionBy: 'RA Manager M. Johnson',
    },
    {
      id: 'comp-demo-002',
      refNumber: refNumber('COMP', 2),
      deviceName: 'OrthoFlex KB-300',
      complaintDate: daysAgo(30),
      source: 'CUSTOMER' as const,
      reporterName: 'J. Smith (Patient)',
      reporterContact: 'jsmith@email.com',
      description: 'Velcro strap detached from brace during physical therapy session. No injury occurred.',
      patientInvolved: true,
      injuryOccurred: false,
      malfunctionOccurred: true,
      severity: 'MINOR' as const,
      status: 'CLOSED' as const,
      investigationSummary: 'Strap adhesive failed due to repeated wash cycles.',
      rootCause: 'Insufficient strap bonding for repeated laundry exposure.',
      correctiveAction: 'Updated IFU with care instructions; improved bonding process.',
      mdrReportable: false,
      mdrDecisionDate: daysAgo(28),
      mdrDecisionBy: 'RA Manager M. Johnson',
      closedDate: daysAgo(5),
      closedBy: 'QA Manager L. Torres',
    },
    {
      id: 'comp-demo-003',
      refNumber: refNumber('COMP', 3),
      deviceName: 'DermaScan AI-100',
      complaintDate: daysAgo(7),
      source: 'INTERNAL' as const,
      reporterName: 'QA Dept. - Post-market Surveillance',
      description: 'Software v2.1 update caused intermittent classification timeout on images > 10MB. Clinician unable to get result.',
      patientInvolved: false,
      injuryOccurred: false,
      malfunctionOccurred: true,
      severity: 'MODERATE' as const,
      status: 'RECEIVED' as const,
    },
  ];

  for (const complaint of complaints) {
    await medical.complaint.upsert({
      where: { id: complaint.id },
      update: {},
      create: complaint,
    });
  }
  console.log(`  Created ${complaints.length} Complaint records`);

  // DMR + DHR
  const dmr = {
    id: 'dmr-demo-001',
    refNumber: refNumber('DMR', 1),
    deviceName: 'GlucoSense X1',
    deviceClass: 'CLASS_II' as const,
    description: 'Continuous glucose monitoring system consisting of sensor, transmitter, and mobile application',
    specifications: JSON.stringify({
      sensorLife: '14 days',
      measurementRange: '40-500 mg/dL',
      accuracy: 'MARD < 9%',
      warmupTime: '1 hour',
    }),
    qualityProcedures: 'QP-GS-001 through QP-GS-025',
    acceptanceCriteria: 'Per DMR-GS-ACC-001 Rev B',
    status: 'APPROVED' as const,
    currentVersion: '2.0',
    approvedBy: 'VP Quality Dr. R. Stone',
    approvedDate: daysAgo(60),
  };

  await medical.deviceMasterRecord.upsert({
    where: { id: dmr.id },
    update: {},
    create: dmr,
  });

  const dhr = {
    id: 'dhr-demo-001',
    refNumber: refNumber('DHR', 1),
    dmrId: 'dmr-demo-001',
    batchNumber: 'BATCH-2026-0042',
    manufacturingDate: daysAgo(90),
    quantityManufactured: 500,
    quantityReleased: 498,
    quantityRejected: 2,
    status: 'RELEASED' as const,
    releasedBy: 'QA Manager L. Torres',
    releaseDate: daysAgo(85),
  };

  await medical.deviceHistoryRecord.upsert({
    where: { id: dhr.id },
    update: {},
    create: dhr,
  });
  console.log('  Created 1 DMR + 1 DHR');

  // Risk Management File
  const rmf = {
    id: 'rmf-demo-001',
    refNumber: refNumber('RMF', 1),
    title: 'GlucoSense X1 Risk Analysis',
    deviceName: 'GlucoSense X1',
    deviceClass: 'CLASS_II' as const,
    intendedUse: 'Continuous glucose monitoring',
    riskPolicy: 'Risks are acceptable when benefits outweigh residual risk and ALARP principle is applied per ISO 14971:2019',
    status: 'ACTIVE' as const,
    overallRiskAcceptable: true,
    benefitRiskAcceptable: true,
    benefitRiskAnalysis: 'Benefits of continuous glucose monitoring (reduced HbA1c, fewer severe hypoglycemic events, improved quality of life) outweigh identified residual risks.',
  };

  await medical.riskManagementFile.upsert({
    where: { id: rmf.id },
    update: {},
    create: rmf,
  });
  console.log('  Created 1 Risk Management File');

  // UDI Device
  const udiDevice = {
    id: 'udi-demo-001',
    refNumber: refNumber('UDI', 1),
    deviceName: 'GlucoSense X1',
    modelNumber: 'GS-X1-100',
    manufacturer: 'Resolvex Medical Inc.',
    deviceClass: 'CLASS_II' as const,
    gmdn: '47301',
    status: 'ACTIVE' as const,
  };

  await medical.udiDevice.upsert({
    where: { id: udiDevice.id },
    update: {},
    create: udiDevice,
  });
  console.log('  Created 1 UDI Device');

  // PMS Plan
  const pmsPlan = {
    id: 'pms-demo-001',
    refNumber: refNumber('PMS', 1),
    deviceName: 'GlucoSense X1',
    deviceClass: 'Class II',
    dataSources: ['complaints', 'MDR/MAUDE', 'literature review', 'clinical follow-up', 'field service reports'],
    reviewFrequency: 'ANNUAL',
    status: 'ACTIVE' as const,
    lastReviewDate: daysAgo(180),
    nextReviewDate: daysFromNow(185),
  };

  await medical.pmsPlan.upsert({
    where: { id: pmsPlan.id },
    update: {},
    create: pmsPlan,
  });
  console.log('  Created 1 PMS Plan');

  // Software Project
  const swProject = {
    id: 'sw-demo-001',
    refNumber: refNumber('SW', 1),
    title: 'GlucoSense X1 Firmware',
    description: 'Embedded firmware for glucose measurement algorithm and Bluetooth communication',
    safetyClass: 'CLASS_C' as const,
    currentPhase: 'SYSTEM_TESTING' as const,
    status: 'ACTIVE' as const,
  };

  await medical.softwareProject.upsert({
    where: { id: swProject.id },
    update: {},
    create: swProject,
  });
  console.log('  Created 1 Software Project');
}

// ---------------------------------------------------------------------------
// Aerospace Seed
// ---------------------------------------------------------------------------

async function seedAerospace() {
  console.log('Seeding Aerospace (AS9100D / AS9110C) data...');

  // 5 Configuration Items via a baseline
  const baseline = {
    id: 'cb-demo-001',
    refNumber: 'CB-001',
    title: 'B737-800 Main Landing Gear Assembly',
    description: 'Production baseline for main landing gear assembly overhaul configuration',
    program: '737 MLG Overhaul Program',
    status: 'ACTIVE' as const,
    effectiveDate: daysAgo(90),
    approvedBy: 'VP Engineering M. Phillips',
    approvedDate: daysAgo(95),
  };

  await aerospace.configBaseline.upsert({
    where: { id: baseline.id },
    update: {},
    create: baseline,
  });

  const configItems = [
    {
      id: 'ci-demo-001',
      baselineId: 'cb-demo-001',
      partNumber: '161A1100-47',
      nomenclature: 'MLG Trunnion',
      revision: 'C',
      category: 'HARDWARE' as const,
      status: 'CURRENT' as const,
      supplier: 'Boeing Commercial Airplanes',
      specifications: 'Per BAC 5000 series',
    },
    {
      id: 'ci-demo-002',
      baselineId: 'cb-demo-001',
      partNumber: 'S283T002-3',
      nomenclature: 'Actuator Assembly - MLG Retract',
      revision: 'B',
      category: 'HARDWARE' as const,
      status: 'CURRENT' as const,
      supplier: 'Parker Hannifin Aerospace',
    },
    {
      id: 'ci-demo-003',
      baselineId: 'cb-demo-001',
      partNumber: '65C26528-5',
      nomenclature: 'Lower Drag Brace',
      revision: 'A',
      category: 'HARDWARE' as const,
      status: 'PENDING_CHANGE' as const,
      supplier: 'Boeing Commercial Airplanes',
      notes: 'ECP-2602-0001 pending for seal material change',
    },
    {
      id: 'ci-demo-004',
      baselineId: 'cb-demo-001',
      partNumber: 'D6-51991-2',
      nomenclature: 'AMM Chapter 32 - Landing Gear',
      revision: '12',
      category: 'DOCUMENT' as const,
      status: 'CURRENT' as const,
    },
    {
      id: 'ci-demo-005',
      baselineId: 'cb-demo-001',
      partNumber: 'NAS1149-C0363R',
      nomenclature: 'Washer, Flat',
      revision: '-',
      category: 'HARDWARE' as const,
      status: 'CURRENT' as const,
      supplier: 'SPS Technologies',
    },
  ];

  for (const item of configItems) {
    await aerospace.configItem.upsert({
      where: { id: item.id },
      update: {},
      create: item,
    });
  }
  console.log(`  Created 1 Configuration Baseline with ${configItems.length} items`);

  // ECP
  const ecp = {
    id: 'ecp-demo-001',
    refNumber: refNumber('ECP', 1),
    title: 'Replace actuator seal material - NBR to FKM',
    description: 'Change retract actuator seal material from Nitrile (NBR) to Fluoroelastomer (FKM) for improved heat resistance in high-temperature operating environments',
    reason: 'Service Bulletin SB-737-32-1234 recommends FKM seals for aircraft operating in desert environments',
    urgency: 'ROUTINE' as const,
    affectedItems: ['S283T002-3'],
    affectedBaselines: ['cb-demo-001'],
    proposedBy: 'Eng. R. Thompson',
    status: 'CCB_APPROVED' as const,
    ccbDecision: 'APPROVE_WITH_CONDITIONS' as const,
    ccbDate: daysAgo(10),
    ccbMembers: ['VP Engineering', 'Chief Inspector', 'Program Manager', 'QA Manager'],
    ccbNotes: 'Approved pending stress analysis completion and updated IPC',
  };

  await aerospace.engineeringChangeProposal.upsert({
    where: { id: ecp.id },
    update: {},
    create: ecp,
  });
  console.log('  Created 1 Engineering Change Proposal');

  // 3 FAI Reports
  const faiReports = [
    {
      id: 'fai-demo-001',
      refNumber: refNumber('FAI', 1),
      title: 'MLG Trunnion First Article Inspection',
      partNumber: '161A1100-47',
      partName: 'MLG Trunnion',
      revision: 'C',
      drawingNumber: 'DWG-161A-47',
      customer: 'Boeing',
      poNumber: 'PO-2026-4521',
      faiType: 'FULL' as const,
      status: 'APPROVED' as const,
      part1Data: JSON.stringify([
        { charNum: 1, charName: 'Bore Diameter A', nominal: '2.500"', tolerance: '+0.001/-0.000', actual: '2.5004"', pass: true },
        { charNum: 2, charName: 'Overall Length', nominal: '18.750"', tolerance: '+/-0.010', actual: '18.755"', pass: true },
        { charNum: 3, charName: 'Surface Roughness Ra', nominal: 'Max 32 uinch', tolerance: '', actual: '24 uinch', pass: true },
      ]),
      part1Status: 'COMPLETED' as const,
      part2Data: JSON.stringify([
        { docType: 'Process Spec', docNumber: 'PS-737-001', revision: 'D', available: true },
        { docType: 'Heat Treat Cert', docNumber: 'HTC-2602-042', revision: 'A', available: true },
        { docType: 'Material Cert', docNumber: 'MTC-Ti64-2602-015', revision: 'A', available: true },
      ]),
      part2Status: 'COMPLETED' as const,
      part3Data: JSON.stringify([
        { testName: 'Hardness Test', testMethod: 'Rockwell C', requirement: 'HRC 36-42', result: 'HRC 39', pass: true },
        { testName: 'NDT - FPI', testMethod: 'ASTM E1417', requirement: 'No linear indications > 1/16"', result: 'No indications', pass: true },
      ]),
      part3Status: 'COMPLETED' as const,
      approvedBy: 'QA Manager K. Lee',
      approvedDate: daysAgo(60),
    },
    {
      id: 'fai-demo-002',
      refNumber: refNumber('FAI', 2),
      title: 'Actuator Assembly FAI',
      partNumber: 'S283T002-3',
      partName: 'Actuator Assembly',
      revision: 'B',
      drawingNumber: 'DWG-S283-03',
      customer: 'Parker Hannifin',
      faiType: 'FULL' as const,
      status: 'IN_PROGRESS' as const,
      part1Status: 'COMPLETED' as const,
      part2Status: 'IN_PROGRESS' as const,
      part3Status: 'NOT_STARTED' as const,
    },
    {
      id: 'fai-demo-003',
      refNumber: refNumber('FAI', 3),
      title: 'Lower Drag Brace Delta FAI',
      partNumber: '65C26528-5',
      partName: 'Lower Drag Brace',
      revision: 'A',
      faiType: 'DELTA' as const,
      status: 'PLANNING' as const,
      part1Status: 'NOT_STARTED' as const,
      part2Status: 'NOT_STARTED' as const,
      part3Status: 'NOT_STARTED' as const,
    },
  ];

  for (const fai of faiReports) {
    await aerospace.firstArticleInspection.upsert({
      where: { id: fai.id },
      update: {},
      create: fai,
    });
  }
  console.log(`  Created ${faiReports.length} FAI Reports`);

  // 3 MRO Work Orders
  const workOrders = [
    {
      id: 'wo-demo-001',
      refNumber: refNumber('WO', 1),
      title: 'C-Check Card 32-10-01 MLG Inspection',
      aircraftType: 'Boeing 737-800',
      aircraftReg: 'C-FXYZ',
      description: 'Main landing gear lower drag brace cracked at station 420. Aircraft grounded per MEL.',
      priority: 'AOG' as const,
      status: 'IN_PROGRESS' as const,
      assignedTo: 'Lead Tech J. Anderson',
      startDate: daysAgo(3),
      dueDate: daysFromNow(2),
    },
    {
      id: 'wo-demo-002',
      refNumber: refNumber('WO', 2),
      title: 'A-Check 28-20 Fuel System Inspection',
      aircraftType: 'Boeing 737-800',
      aircraftReg: 'C-GABC',
      description: 'Scheduled A-Check fuel system inspection and servicing.',
      priority: 'ROUTINE' as const,
      status: 'RELEASED' as const,
      assignedTo: 'Lead Tech M. Tremblay',
      startDate: daysAgo(10),
      dueDate: daysAgo(3),
      completedDate: daysAgo(4),
      releaseCertType: 'CRS' as const,
      releaseCertRef: 'CRS-2026-0342',
      releasedBy: 'Inspector K. Lee (IA #67890)',
      releasedDate: daysAgo(3),
    },
    {
      id: 'wo-demo-003',
      refNumber: refNumber('WO', 3),
      title: 'AD 2026-03-15 Nose Gear Steering Inspection',
      aircraftType: 'Boeing 737-800',
      aircraftReg: 'C-FXYZ',
      description: 'Airworthiness Directive compliance: Inspect nose gear steering collar for cracks per AD 2026-03-15.',
      priority: 'URGENT' as const,
      status: 'OPEN' as const,
      dueDate: daysFromNow(14),
    },
  ];

  for (const wo of workOrders) {
    await aerospace.workOrder.upsert({
      where: { id: wo.id },
      update: {},
      create: wo,
    });
  }

  // Task cards for first work order
  const taskCards = [
    {
      id: 'tc-demo-001',
      workOrderId: 'wo-demo-001',
      taskNumber: '32-10-01-001',
      description: 'Remove MLG lower drag brace per AMM 32-10-01',
      zone: '130',
      estimatedHours: 4.0,
      actualHours: 3.5,
      status: 'COMPLETED' as const,
      technicianId: 'tech-001',
      technicianName: 'James Anderson',
      signedDate: daysAgo(2),
    },
    {
      id: 'tc-demo-002',
      workOrderId: 'wo-demo-001',
      taskNumber: '32-10-01-002',
      description: 'NDT inspect drag brace attachment fittings per NDT-737-32-001',
      zone: '130',
      estimatedHours: 2.5,
      status: 'IN_PROGRESS' as const,
      technicianId: 'tech-002',
      technicianName: 'Lisa Park',
    },
    {
      id: 'tc-demo-003',
      workOrderId: 'wo-demo-001',
      taskNumber: '32-10-01-003',
      description: 'Install new drag brace P/N 65C26528-5 per AMM 32-10-01',
      zone: '130',
      estimatedHours: 5.0,
      status: 'OPEN' as const,
    },
  ];

  for (const tc of taskCards) {
    await aerospace.taskCard.upsert({
      where: { id: tc.id },
      update: {},
      create: tc,
    });
  }
  console.log(`  Created ${workOrders.length} Work Orders with ${taskCards.length} Task Cards`);

  // Human Factor Incidents
  const hfIncident = {
    id: 'hf-demo-001',
    refNumber: refNumber('HF', 1),
    title: 'Incorrect torque value applied to MLG bolt',
    description: 'Night shift technician used torque value from superseded AMM revision (Rev 10 instead of current Rev 12). Discrepancy caught during buy-back inspection.',
    category: 'LACK_OF_KNOWLEDGE' as const,
    severity: 'HIGH' as const,
    location: 'Hangar 3 Bay 2',
    shift: 'Night',
    personnelInvolved: ['J. Anderson'],
    rootCause: 'Technical library subscription lapsed; physical AMM copy not updated to current revision. Digital AMM system not yet deployed to night shift.',
    correctiveAction: 'Implement digital AMM system across all shifts; retrain night shift on revision verification procedures.',
    status: 'CAPA_RAISED' as const,
    capaRef: 'CAPA-2026-010',
    reportedBy: 'Inspector K. Lee',
    incidentDate: daysAgo(20),
  };

  await aerospace.humanFactorIncident.upsert({
    where: { id: hfIncident.id },
    update: {},
    create: hfIncident,
  });
  console.log('  Created 1 Human Factor Incident');

  // OASIS Monitored Suppliers
  const suppliers = [
    {
      id: 'oasis-demo-001',
      cageCode: '1ABC2',
      companyName: 'Precision Aerospace Components Inc.',
      certStandard: 'AS9100D',
      certBody: 'BSI',
      certExpiry: daysFromNow(180),
      lastChecked: daysAgo(7),
      certStatus: 'CURRENT' as const,
    },
    {
      id: 'oasis-demo-002',
      cageCode: '3DEF4',
      companyName: 'Allied Surface Treatments Ltd.',
      certStandard: 'AS9100D + Nadcap',
      certBody: 'SAI Global',
      certExpiry: daysFromNow(30),
      lastChecked: daysAgo(3),
      certStatus: 'CURRENT' as const,
      notes: 'Certificate expiring within 90 days - alert generated',
    },
    {
      id: 'oasis-demo-003',
      cageCode: '5GHI6',
      companyName: 'FastFab Machining Corp.',
      certStandard: 'AS9100D',
      certBody: 'DNV',
      certExpiry: daysAgo(15),
      lastChecked: daysAgo(1),
      certStatus: 'EXPIRED' as const,
      notes: 'Certificate expired. Awaiting recertification. Do not issue new POs.',
    },
  ];

  for (const supplier of suppliers) {
    await aerospace.oasisMonitoredSupplier.upsert({
      where: { id: supplier.id },
      update: {},
      create: supplier,
    });
  }
  console.log(`  Created ${suppliers.length} OASIS Monitored Suppliers`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('=== IMS Demo Seed Data ===');
  console.log('Generating realistic data for Automotive, Medical, and Aerospace verticals...');
  console.log('');

  try {
    await seedAutomotive();
    console.log('');
    await seedMedical();
    console.log('');
    await seedAerospace();
    console.log('');
    console.log('=== Demo seed completed successfully ===');
  } catch (error) {
    console.error('Seed error:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('Fatal seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await automotive.$disconnect();
    await medical.$disconnect();
    await aerospace.$disconnect();
  });
