import { PrismaClient } from '../generated/chemicals';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding chemical management data...');

  // 1. Isopropyl Alcohol 70%
  const ipa = await prisma.chemRegister.create({
    data: {
      productName: 'Isopropyl Alcohol 70%',
      chemicalName: 'Propan-2-ol',
      casNumber: '67-63-0',
      ecNumber: '200-661-7',
      signalWord: 'DANGER',
      pictograms: ['GHS02_FLAMMABLE', 'GHS07_IRRITANT_HARMFUL'],
      hazardStatements: ['H225', 'H319', 'H336'],
      precautionaryStmts: ['P210', 'P233', 'P240', 'P241', 'P242', 'P305+P351+P338'],
      hazardCategory: 'Flam. Liq. 2, Eye Irrit. 2, STOT SE 3',
      physicalState: 'LIQUID',
      colour: 'Colourless',
      odour: 'Characteristic alcohol odour',
      flashPoint: 12,
      boilingPoint: 82.6,
      density: 0.786,
      solubilityWater: 'Miscible',
      welTwa8hr: 999,
      welTwaPpm: 400,
      welStel15min: 1250,
      welStelPpm: 500,
      storageClass: 'CLASS_3_FLAMMABLE_LIQUID',
      requiresVentilation: true,
      requiresFireproof: true,
      wasteClassification: 'HAZARDOUS',
      ewcCode: '07 01 04*',
      disposalRoute: 'Licensed waste contractor for flammable solvents',
      supplier: 'Fisher Scientific',
      orgId: 'default',
    },
  });

  // 2. Sodium Hydroxide 1M
  const naoh = await prisma.chemRegister.create({
    data: {
      productName: 'Sodium Hydroxide 1M Solution',
      chemicalName: 'Sodium hydroxide',
      casNumber: '1310-73-2',
      ecNumber: '215-185-5',
      signalWord: 'DANGER',
      pictograms: ['GHS05_CORROSIVE', 'GHS07_IRRITANT_HARMFUL'],
      hazardStatements: ['H290', 'H314'],
      precautionaryStmts: ['P260', 'P280', 'P301+P330+P331', 'P303+P361+P353', 'P305+P351+P338'],
      hazardCategory: 'Met. Corr. 1, Skin Corr. 1A',
      physicalState: 'LIQUID',
      colour: 'Colourless',
      odour: 'Odourless',
      density: 1.04,
      ph: '14',
      solubilityWater: 'Miscible',
      storageClass: 'CLASS_8_CORROSIVE',
      requiresSecondaryContainment: true,
      incompatibleWith: ['7647-01-0'],
      wasteClassification: 'HAZARDOUS',
      ewcCode: '06 02 05*',
      supplier: 'Sigma-Aldrich',
      orgId: 'default',
    },
  });

  // 3. Hydrochloric Acid 37%
  const hcl = await prisma.chemRegister.create({
    data: {
      productName: 'Hydrochloric Acid 37%',
      chemicalName: 'Hydrogen chloride',
      casNumber: '7647-01-0',
      ecNumber: '231-595-7',
      unNumber: '1789',
      signalWord: 'DANGER',
      pictograms: ['GHS05_CORROSIVE', 'GHS07_IRRITANT_HARMFUL'],
      hazardStatements: ['H290', 'H314', 'H335'],
      precautionaryStmts: ['P260', 'P280', 'P301+P330+P331', 'P305+P351+P338'],
      hazardCategory: 'Met. Corr. 1, Skin Corr. 1A, STOT SE 3',
      physicalState: 'LIQUID',
      colour: 'Colourless to pale yellow',
      odour: 'Pungent',
      boilingPoint: 48,
      density: 1.19,
      ph: '<1',
      solubilityWater: 'Miscible',
      welTwa8hr: 8,
      welTwaPpm: 2,
      welStel15min: 17,
      welStelPpm: 5,
      storageClass: 'CLASS_8_CORROSIVE',
      requiresVentilation: true,
      requiresSecondaryContainment: true,
      incompatibleWith: ['7681-52-9', '1310-73-2'],
      wasteClassification: 'HAZARDOUS',
      ewcCode: '06 01 02*',
      supplier: 'VWR International',
      orgId: 'default',
    },
  });

  // 4. Acetone
  const acetone = await prisma.chemRegister.create({
    data: {
      productName: 'Acetone (Reagent Grade)',
      chemicalName: 'Propan-2-one',
      casNumber: '67-64-1',
      ecNumber: '200-662-2',
      signalWord: 'WARNING',
      pictograms: ['GHS02_FLAMMABLE', 'GHS07_IRRITANT_HARMFUL'],
      hazardStatements: ['H225', 'H319', 'H336'],
      precautionaryStmts: ['P210', 'P233', 'P305+P351+P338'],
      hazardCategory: 'Flam. Liq. 2, Eye Irrit. 2, STOT SE 3',
      physicalState: 'LIQUID',
      colour: 'Colourless',
      odour: 'Characteristic sweet odour',
      flashPoint: -20,
      boilingPoint: 56.2,
      density: 0.791,
      solubilityWater: 'Miscible',
      welTwa8hr: 1210,
      welTwaPpm: 500,
      welStel15min: 3620,
      welStelPpm: 1500,
      storageClass: 'CLASS_3_FLAMMABLE_LIQUID',
      requiresVentilation: true,
      requiresFireproof: true,
      wasteClassification: 'HAZARDOUS',
      ewcCode: '07 01 04*',
      supplier: 'Fisher Scientific',
      orgId: 'default',
    },
  });

  // 5. Benzene (CMR example)
  const benzene = await prisma.chemRegister.create({
    data: {
      productName: 'Benzene (Analytical Standard)',
      chemicalName: 'Benzene',
      casNumber: '71-43-2',
      ecNumber: '200-753-7',
      unNumber: '1114',
      signalWord: 'DANGER',
      pictograms: ['GHS02_FLAMMABLE', 'GHS07_IRRITANT_HARMFUL', 'GHS08_HEALTH_HAZARD'],
      hazardStatements: ['H225', 'H304', 'H315', 'H319', 'H340', 'H350', 'H372'],
      precautionaryStmts: ['P201', 'P210', 'P280', 'P308+P313'],
      hazardCategory: 'Flam. Liq. 2, Asp. Tox. 1, Muta. 1B, Carc. 1A, STOT RE 1',
      physicalState: 'LIQUID',
      colour: 'Colourless',
      odour: 'Aromatic',
      flashPoint: -11,
      boilingPoint: 80.1,
      meltingPoint: 5.5,
      density: 0.879,
      solubilityWater: '1.8 g/L at 25C',
      welTwa8hr: 3.25,
      welTwaPpm: 1,
      welStel15min: 16.25,
      welStelPpm: 5,
      biologicalMonitoring: true,
      storageClass: 'CLASS_3_FLAMMABLE_LIQUID',
      requiresVentilation: true,
      requiresFireproof: true,
      isCarcinogen: true,
      isMutagen: true,
      isCmr: true,
      isSvhc: true,
      healthSurveillanceReq: true,
      wasteClassification: 'HAZARDOUS',
      ewcCode: '07 01 03*',
      supplier: 'Sigma-Aldrich',
      orgId: 'default',
    },
  });

  // 6. Carbon Dioxide
  const co2 = await prisma.chemRegister.create({
    data: {
      productName: 'Carbon Dioxide (Compressed)',
      chemicalName: 'Carbon dioxide',
      casNumber: '124-38-9',
      ecNumber: '204-696-9',
      unNumber: '1013',
      signalWord: 'WARNING',
      pictograms: ['GHS04_GAS_UNDER_PRESSURE'],
      hazardStatements: ['H280'],
      precautionaryStmts: ['P410+P403'],
      hazardCategory: 'Press. Gas (Liquefied)',
      physicalState: 'GAS',
      colour: 'Colourless',
      odour: 'Odourless',
      storageClass: 'CLASS_2_FLAMMABLE_GAS',
      requiresVentilation: true,
      wasteClassification: 'NON_HAZARDOUS',
      supplier: 'BOC Gases',
      orgId: 'default',
    },
  });

  // 7. Bleach / Sodium Hypochlorite 5%
  const bleach = await prisma.chemRegister.create({
    data: {
      productName: 'Sodium Hypochlorite 5% (Bleach)',
      chemicalName: 'Sodium hypochlorite',
      casNumber: '7681-52-9',
      ecNumber: '231-668-3',
      signalWord: 'DANGER',
      pictograms: ['GHS05_CORROSIVE', 'GHS07_IRRITANT_HARMFUL', 'GHS09_ENVIRONMENTAL'],
      hazardStatements: ['H290', 'H314', 'H400', 'H411'],
      precautionaryStmts: ['P260', 'P273', 'P280', 'P301+P330+P331', 'P305+P351+P338'],
      hazardCategory: 'Met. Corr. 1, Skin Corr. 1A, Aquatic Acute 1, Aquatic Chronic 2',
      physicalState: 'LIQUID',
      colour: 'Pale yellow-green',
      odour: 'Chlorine-like',
      density: 1.07,
      ph: '11-13',
      solubilityWater: 'Miscible',
      storageClass: 'CLASS_8_CORROSIVE',
      requiresSecondaryContainment: true,
      incompatibleWith: ['7647-01-0'],
      wasteClassification: 'HAZARDOUS',
      ewcCode: '06 02 05*',
      disposalRoute: 'Neutralise and dispose via licensed contractor',
      supplier: 'Solvay Chemicals',
      orgId: 'default',
    },
  });

  // 8. Lubricating Oil
  const lubOil = await prisma.chemRegister.create({
    data: {
      productName: 'Mineral Lubricating Oil (ISO VG 68)',
      chemicalName: 'Petroleum distillates, hydrotreated',
      signalWord: 'WARNING',
      pictograms: ['GHS08_HEALTH_HAZARD'],
      hazardStatements: ['H304'],
      precautionaryStmts: ['P301+P310', 'P331'],
      hazardCategory: 'Asp. Tox. 1',
      physicalState: 'LIQUID',
      colour: 'Amber',
      odour: 'Mild petroleum',
      flashPoint: 200,
      density: 0.87,
      storageClass: 'NON_HAZARDOUS',
      wasteClassification: 'HAZARDOUS',
      ewcCode: '13 02 05*',
      disposalRoute: 'Licensed waste oil collection',
      supplier: 'Shell Lubricants',
      orgId: 'default',
    },
  });

  console.log('Created 8 chemicals');

  // Create SDS records for each
  const now = new Date();
  const nextYear = new Date(now);
  nextYear.setFullYear(nextYear.getFullYear() + 1);

  const chemicals = [ipa, naoh, hcl, acetone, benzene, co2, bleach, lubOil];
  for (const chem of chemicals) {
    await prisma.chemSds.create({
      data: {
        chemicalId: chem.id,
        version: '1.0',
        issueDate: now,
        nextReviewDate: nextYear,
        status: 'CURRENT',
        documentRef: `SDS-${chem.casNumber || chem.id.substring(0, 8)}`,
        productUseDescription: `${chem.productName} for laboratory/industrial use`,
        firstAidInhalation:
          'Move person to fresh air. If not breathing, give artificial respiration.',
        firstAidSkinContact:
          'Remove contaminated clothing. Wash skin thoroughly with soap and water.',
        firstAidEyeContact:
          'Rinse cautiously with water for at least 15 minutes. Remove contact lenses if present.',
        firstAidIngestion:
          'Do NOT induce vomiting. Rinse mouth with water. Seek medical attention immediately.',
        handlingPrecautions: 'Use in well-ventilated areas. Avoid contact with skin and eyes.',
        storageConditions: 'Store in cool, dry place. Keep container tightly closed.',
      },
    });
  }
  console.log('Created 8 SDS records');

  // Create COSHH assessments
  const coshhData = [
    { chem: ipa, activity: 'Surface cleaning and disinfection', likelihood: 2, severity: 2 },
    { chem: naoh, activity: 'pH adjustment in water treatment', likelihood: 2, severity: 4 },
    { chem: hcl, activity: 'Equipment descaling and acid wash', likelihood: 3, severity: 4 },
    { chem: acetone, activity: 'Parts degreasing and cleaning', likelihood: 2, severity: 2 },
    {
      chem: benzene,
      activity: 'Analytical standard preparation (fume cupboard)',
      likelihood: 2,
      severity: 5,
    },
    {
      chem: co2,
      activity: 'Atmosphere control in confined space work',
      likelihood: 3,
      severity: 3,
    },
    { chem: bleach, activity: 'General cleaning and sanitisation', likelihood: 2, severity: 3 },
    { chem: lubOil, activity: 'Machine lubrication and maintenance', likelihood: 1, severity: 2 },
  ];

  for (let i = 0; i < coshhData.length; i++) {
    const c = coshhData[i];
    const inherentScore = c.likelihood * c.severity;
    const residualLikelihood = Math.max(1, c.likelihood - 1);
    const residualSeverity = c.severity;
    const residualScore = residualLikelihood * residualSeverity;

    function getLevel(score: number) {
      if (score <= 2) return 'VERY_LOW';
      if (score <= 4) return 'LOW';
      if (score <= 9) return 'MEDIUM';
      if (score <= 14) return 'HIGH';
      if (score <= 19) return 'VERY_HIGH';
      return 'UNACCEPTABLE';
    }

    const isCmr = c.chem.isCmr;
    const reviewDate = new Date(now);
    reviewDate.setFullYear(reviewDate.getFullYear() + 1);

    await prisma.chemCoshh.create({
      data: {
        referenceNumber: `COSHH-2026-${String(i + 1).padStart(4, '0')}`,
        chemicalId: c.chem.id,
        activityDescription: c.activity,
        locationBuilding: 'Main Building',
        locationRoom: `Lab ${i + 1}`,
        personsExposed: ['Laboratory Technicians', 'Maintenance Staff'],
        exposureRoutes: ['INHALATION', 'SKIN_ABSORPTION'],
        quantityUsed: 500,
        quantityUnit: 'ml',
        frequencyOfUse: 'Daily',
        durationPerUseMinutes: 30,
        inherentLikelihood: c.likelihood,
        inherentSeverity: c.severity,
        inherentRiskScore: inherentScore,
        inherentRiskLevel: getLevel(inherentScore) as string,
        controlMeasures: [
          {
            type: 'ENGINEERING',
            description: 'Local exhaust ventilation / fume cupboard',
            inPlace: true,
          },
          {
            type: 'ADMINISTRATIVE',
            description: 'Standard operating procedure in place',
            inPlace: true,
          },
          { type: 'PPE', description: 'Safety goggles, nitrile gloves, lab coat', inPlace: true },
        ],
        rpeClass: c.chem.casNumber === '71-43-2' ? 'FFP3' : 'NONE_REQUIRED',
        handProtectionGlove: 'Nitrile',
        eyeProtection: 'Safety goggles',
        bodyProtection: 'Lab coat',
        residualLikelihood,
        residualSeverity,
        residualRiskScore: residualScore,
        residualRiskLevel: getLevel(residualScore) as string,
        residualRiskAccepted: residualScore <= 9,
        spillMinorProcedure: 'Absorb with inert material, collect in waste container',
        spillMajorProcedure: 'Evacuate area, contact emergency services, use spill kit',
        healthSurveillanceReq: isCmr,
        healthSurvDetails: isCmr ? 'Biological monitoring, annual health review' : null,
        recordRetentionYears: isCmr ? 40 : null,
        substitutionConsidered: true,
        substitutionOutcome: 'No suitable substitute available for this application',
        assessorName: 'Dr. Sarah Chen',
        assessorJobTitle: 'Health & Safety Manager',
        assessorSignedAt: now,
        assessmentDate: now,
        reviewDate,
        reviewTriggers: ['annual', 'incident', 'process_change'],
        status: 'ACTIVE',
        orgId: 'default',
      },
    });
  }
  console.log('Created 8 COSHH assessments');

  // Create incompatibility alert: Bleach + HCl
  await prisma.chemIncompatAlert.create({
    data: {
      chemicalId: bleach.id,
      incompatibleWithCas: '7647-01-0',
      incompatibleWithName: 'Hydrochloric Acid 37%',
      hazardDescription:
        'Mixing sodium hypochlorite (bleach) with hydrochloric acid produces toxic chlorine gas (Cl2). This reaction is extremely dangerous and can be fatal in enclosed spaces.',
      severityLevel: 'CRITICAL',
      storageLocationA: 'Cleaning Supplies Store',
      storageLocationB: 'Acid Cabinet',
    },
  });

  await prisma.chemIncompatAlert.create({
    data: {
      chemicalId: hcl.id,
      incompatibleWithCas: '7681-52-9',
      incompatibleWithName: 'Sodium Hypochlorite 5% (Bleach)',
      hazardDescription:
        'Mixing hydrochloric acid with sodium hypochlorite (bleach) produces toxic chlorine gas (Cl2). This reaction is extremely dangerous and can be fatal in enclosed spaces.',
      severityLevel: 'CRITICAL',
      storageLocationA: 'Acid Cabinet',
      storageLocationB: 'Cleaning Supplies Store',
    },
  });
  console.log('Created 2 incompatibility alerts (Bleach + HCl)');

  // Create some inventory records
  const inventoryData = [
    { chem: ipa, location: 'Lab Store Room A', qty: 5, unit: 'L' },
    { chem: naoh, location: 'Chemical Store - Corrosives Cabinet', qty: 2.5, unit: 'L' },
    { chem: hcl, location: 'Chemical Store - Acid Cabinet', qty: 2.5, unit: 'L' },
    { chem: acetone, location: 'Lab Store Room A - Flammables Cabinet', qty: 10, unit: 'L' },
    {
      chem: benzene,
      location: 'Restricted Access Store - CMR Cabinet',
      qty: 0.5,
      unit: 'L',
      min: 0.1,
    },
    { chem: bleach, location: 'Cleaning Supplies Store', qty: 20, unit: 'L' },
    { chem: lubOil, location: 'Workshop - Lubricant Store', qty: 50, unit: 'L' },
  ];

  const expiryDate = new Date(now);
  expiryDate.setMonth(expiryDate.getMonth() + 6);

  for (const inv of inventoryData) {
    await prisma.chemInventory.create({
      data: {
        chemicalId: inv.chem.id,
        location: inv.location,
        quantityOnhand: inv.qty,
        unit: inv.unit,
        minStockLevel: inv.min || null,
        expiryDate,
        lastInspectedAt: now,
        inspectedBy: 'admin',
      },
    });
  }
  console.log('Created 7 inventory records');

  console.log('Chemical management seed complete');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
