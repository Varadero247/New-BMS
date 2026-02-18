/**
 * Fire, Emergency & Disaster Management — Seed Data
 * Run: EMERGENCY_DATABASE_URL="postgresql://postgres:${POSTGRES_PASSWORD}@localhost:5432/ims?schema=public" npx tsx packages/database/prisma/seed-emergency.ts
 */

import { PrismaClient } from '../generated/emergency';

const prisma = new PrismaClient();

async function main() {
  console.log('🔥 Seeding Fire, Emergency & Disaster Management data...');

  // ═══ PREMISES 1: Head Office — Manufacturing Site ═══
  const premises1 = await prisma.femPremises.create({
    data: {
      name: 'Head Office — Manufacturing Site',
      address: '100 Industrial Park Road, Birmingham',
      postcode: 'B1 1AA',
      buildingType: 'Factory/Office Mixed',
      constructionType: 'Steel frame with brick cladding',
      numberOfFloors: 3,
      totalFloorAreaM2: 4500,
      maxOccupancy: 220,
      normalOccupancy: 180,
      responsiblePersonName: 'James Mitchell',
      responsiblePersonRole: 'Site Manager',
      responsiblePersonEmail: 'j.mitchell@example.com',
      responsiblePersonPhone: '+44 121 555 0100',
      fireAuthorityName: 'West Midlands Fire Service',
      localFireStationName: 'Birmingham Central',
      fireStationPhone: '+44 121 380 6000',
      distanceToFireStation: 2.3,
      buildingSafetyActApplicable: false,
      hasAutomaticFDS: true,
      hasSprinklers: false,
      hasEmergencyLighting: true,
      hasFireAlarm: true,
      hasPa: true,
      hasRisers: true,
      alarmSystem: 'L2 system — full coverage of escape routes and high-risk areas',
      organisationId: 'default',
    },
  });
  console.log('✅ Created premises: Head Office — Manufacturing Site');

  // Assembly Point for Premises 1
  await prisma.femAssemblyPoint.create({
    data: {
      premisesId: premises1.id,
      name: 'Assembly Point A — Car Park East',
      description: 'Main assembly point in the east car park, 60m from main entrance',
      capacity: 250,
      isPrimary: true,
      isAccessible: true,
      wardenAssigned: 'Sarah Thompson',
    },
  });

  // Evacuation Routes for Premises 1
  await prisma.femEvacuationRoute.createMany({
    data: [
      {
        premisesId: premises1.id,
        name: 'Route A — Main Staircase (North)',
        floor: 'All floors',
        evacuationType: 'FULL_EVACUATION',
        distanceToExit: 25,
        isAccessible: true,
        refugeAreaPresent: true,
        refugeLocation: 'Landing between floors 1-2',
      },
      {
        premisesId: premises1.id,
        name: 'Route B — Fire Escape (South)',
        floor: 'All floors',
        evacuationType: 'FULL_EVACUATION',
        distanceToExit: 35,
        isAccessible: false,
      },
      {
        premisesId: premises1.id,
        name: 'Route C — Goods Bay Exit',
        floor: 'Ground',
        evacuationType: 'FULL_EVACUATION',
        distanceToExit: 15,
        isAccessible: true,
      },
    ],
  });

  // Fire Risk Assessment for Premises 1
  const fra1 = await prisma.femFireRiskAssessment.create({
    data: {
      referenceNumber: 'FRA-2026-0001',
      premisesId: premises1.id,
      assessmentDate: new Date('2025-11-15'),
      nextReviewDate: new Date('2026-11-15'),
      assessorName: 'David Clark BSc MIFSM',
      assessorCompany: 'FireSafe Consultants Ltd',
      assessorQualification: 'IFE Level 4 Certificate, IFSM Member',
      assessorIsCompetent: true,
      ignitionSources: [
        'Electrical equipment',
        'Machinery',
        'Hot work (welding bay)',
        'Smoking (designated area)',
        'Heating systems',
      ],
      fuelSources: [
        'Paper/cardboard',
        'Wood',
        'Packaging',
        'Flammable liquids (small quantities in chemical store)',
        'Plastics',
      ],
      oxygenSources: ['Natural air', 'HVAC system', 'Compressed air lines'],
      totalPersonsAtRisk: 180,
      employeesAtRisk: 160,
      visitorsAtRisk: 10,
      contractorsAtRisk: 10,
      vulnerablePersonsPresent: true,
      outOfHoursRisk: false,
      existingPrecautions: [
        {
          category: 'Detection & Warning',
          measure: 'L2 automatic fire detection system',
          adequate: true,
          notes: 'Serviced quarterly by ADT',
        },
        {
          category: 'Means of Escape',
          measure: '3 escape routes, travel distances compliant',
          adequate: true,
          notes: 'Max travel distance 35m',
        },
        {
          category: 'Emergency Lighting',
          measure: 'Full coverage maintained escape routes',
          adequate: true,
          notes: 'Monthly test, annual discharge test current',
        },
        {
          category: 'Firefighting Equipment',
          measure: '12 extinguishers, correct types for hazards',
          adequate: true,
          notes: 'Annual service due March 2026',
        },
        {
          category: 'Signs & Notices',
          measure: 'Fire action notices at all exits, photoluminescent signs',
          adequate: true,
          notes: '',
        },
        {
          category: 'Management & Maintenance',
          measure: 'Good housekeeping, trained wardens',
          adequate: false,
          notes: 'Action: cable management in server room needs improvement',
        },
      ],
      likelihoodRating: 2,
      consequenceRating: 3,
      overallRiskScore: 6,
      overallRiskLevel: 'MEDIUM',
      significantFindings:
        'Overall fire risk is MEDIUM. The premises has good fire safety management with appropriate detection, escape routes, and firefighting equipment. Three actions are required: (1) Improve cable management in server room to reduce ignition risk, (2) Replace worn fire door closer on floor 2 office wing, (3) Update PAT testing schedule — some equipment overdue.',
      actionPlan: [
        {
          finding: 'Cable management in server room poor',
          action: 'Install cable management system and tidy all cabling',
          priority: 'High',
          owner: 'IT Manager',
          targetDate: '2026-03-31',
          completedDate: null,
        },
        {
          finding: 'Fire door closer worn on floor 2 east wing',
          action: 'Replace door closer — Dorma TS83',
          priority: 'Medium',
          owner: 'Facilities Manager',
          targetDate: '2026-02-28',
          completedDate: null,
        },
        {
          finding: 'PAT testing overdue on some manufacturing equipment',
          action: 'Complete PAT testing cycle for all portable equipment',
          priority: 'Medium',
          owner: 'Electrical Supervisor',
          targetDate: '2026-04-30',
          completedDate: null,
        },
      ],
      staffInformedDate: new Date('2025-12-01'),
      emergencyPlanInPlace: true,
      trainingConducted: true,
      reviewTriggered: ['annual'],
      writtenRecordComplete: true,
      fireArrangementsDocumented: true,
      assessmentStatus: 'CURRENT',
      createdBy: 'seed',
      organisationId: 'default',
    },
  });
  console.log('✅ Created FRA: FRA-2026-0001 (MEDIUM risk, 3 open actions)');

  // Fire Wardens for Premises 1
  const sixMonthsFromNow = new Date();
  sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
  const twoMonthsFromNow = new Date();
  twoMonthsFromNow.setMonth(twoMonthsFromNow.getMonth() + 2);

  await prisma.femFireWarden.createMany({
    data: [
      {
        premisesId: premises1.id,
        name: 'James Mitchell',
        email: 'j.mitchell@example.com',
        phone: '+44 121 555 0100',
        jobTitle: 'Site Manager',
        icsRole: 'INCIDENT_COMMANDER',
        areaResponsible: 'Entire Site',
        trainingProvider: 'FireSafe Training Ltd',
        trainingDate: new Date('2025-06-15'),
        trainingExpiryDate: new Date('2026-06-15'),
        certificateRef: 'FST-2025-1234',
        trainingCurrent: true,
        deputyName: 'Helen Price',
        deputyPhone: '+44 121 555 0101',
      },
      {
        premisesId: premises1.id,
        name: 'Sarah Thompson',
        email: 's.thompson@example.com',
        phone: '+44 121 555 0102',
        jobTitle: 'Office Manager',
        icsRole: 'FIRE_WARDEN',
        areaResponsible: 'Ground Floor — Offices & Reception',
        trainingProvider: 'FireSafe Training Ltd',
        trainingDate: new Date('2025-06-15'),
        trainingExpiryDate: new Date('2026-06-15'),
        certificateRef: 'FST-2025-1235',
        trainingCurrent: true,
      },
      {
        premisesId: premises1.id,
        name: 'Mark Johnson',
        email: 'm.johnson@example.com',
        phone: '+44 121 555 0103',
        jobTitle: 'Production Supervisor',
        icsRole: 'FIRE_WARDEN',
        areaResponsible: 'First Floor — Manufacturing',
        trainingProvider: 'FireSafe Training Ltd',
        trainingDate: new Date('2025-06-15'),
        trainingExpiryDate: new Date('2026-06-15'),
        certificateRef: 'FST-2025-1236',
        trainingCurrent: true,
      },
      {
        premisesId: premises1.id,
        name: 'Lisa Brown',
        email: 'l.brown@example.com',
        phone: '+44 121 555 0104',
        jobTitle: 'Quality Manager',
        icsRole: 'FIRE_WARDEN',
        areaResponsible: 'Second Floor — Offices & Labs',
        trainingProvider: 'FireSafe Training Ltd',
        trainingDate: new Date('2025-03-10'),
        trainingExpiryDate: twoMonthsFromNow,
        certificateRef: 'FST-2025-0890',
        trainingCurrent: true,
        deputyName: 'Tom Evans',
      },
    ],
  });
  console.log('✅ Created 4 fire wardens for Head Office');

  // PEEP for Premises 1
  await prisma.femPeep.create({
    data: {
      premisesId: premises1.id,
      personName: 'David Wilson',
      jobTitle: 'Senior Analyst',
      department: 'Quality',
      normalLocation: 'First Floor, Room 1.14',
      mobilityLevel: 'WHEELCHAIR_USER',
      mobilityNotes:
        'Full-time wheelchair user. Can transfer to evacuation chair with one assistant.',
      requiresAssistance: true,
      evacuationMethod:
        'Evacuation chair via Route A (main staircase). Transfer at refuge area on floor 1 landing.',
      assistantsRequired: 2,
      namedAssistants: ['Mark Johnson', 'Tom Evans'],
      refugeAreaRequired: true,
      refugeLocation: 'Staircase A landing between floors 1-2',
      specialEquipment: 'Evac+Chair 300H (stored in refuge area)',
      communicationNeeds: 'Standard verbal communication',
      personAgreement: true,
      personAgreedAt: new Date('2025-10-01'),
      reviewDate: new Date('2026-10-01'),
      lastReviewedAt: new Date('2025-10-01'),
      isActive: true,
      createdBy: 'seed',
    },
  });
  console.log('✅ Created 1 PEEP (wheelchair user on first floor)');

  // Emergency Contacts for Premises 1
  await prisma.femEmergencyContact.createMany({
    data: [
      {
        premisesId: premises1.id,
        category: 'EMERGENCY_SERVICE',
        name: 'West Midlands Fire Service',
        phone24hr: '999',
        phoneDaytime: '+44 121 380 6000',
        priority: 1,
      },
      {
        premisesId: premises1.id,
        category: 'EMERGENCY_SERVICE',
        name: 'West Midlands Police',
        phone24hr: '999',
        phoneDaytime: '101',
        priority: 2,
      },
      {
        premisesId: premises1.id,
        category: 'EMERGENCY_SERVICE',
        name: 'West Midlands Ambulance',
        phone24hr: '999',
        priority: 3,
      },
      {
        premisesId: premises1.id,
        category: 'UTILITY',
        name: 'National Grid Gas',
        phone24hr: '0800 111 999',
        priority: 4,
      },
      {
        premisesId: premises1.id,
        category: 'REGULATOR',
        name: 'HSE',
        phoneDaytime: '0345 300 9923',
        notes: 'RIDDOR reporting line',
        priority: 5,
      },
      {
        premisesId: premises1.id,
        category: 'SENIOR_MANAGEMENT',
        name: 'Chief Operating Officer',
        phone24hr: '+44 7700 900100',
        email: 'coo@example.com',
        priority: 6,
      },
    ],
  });

  // Emergency Equipment for Premises 1
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const sixMonthsFuture = new Date();
  sixMonthsFuture.setMonth(sixMonthsFuture.getMonth() + 6);

  const equipmentData = [
    ...[
      'Ground Floor Reception',
      'Ground Floor Kitchen',
      'Ground Floor Workshop',
      'First Floor Office',
      'First Floor Lab',
      'Second Floor Office North',
      'Second Floor Office South',
      'Server Room',
      'Chemical Store',
      'Goods Bay',
      'Staircase A Ground',
      'Staircase B Ground',
    ].map((location, i) => ({
      premisesId: premises1.id,
      equipmentType:
        i === 7 ? 'CO2 Extinguisher' : i === 8 ? 'Dry Powder Extinguisher' : 'Water Extinguisher',
      description:
        i === 7
          ? '5kg CO2 for electrical/server equipment'
          : i === 8
            ? '6kg dry powder for chemical hazards'
            : '9L water extinguisher',
      location,
      serialNumber: `EXT-${String(i + 1).padStart(3, '0')}`,
      manufacturer: 'Chubb Fire',
      extinguisherClass: i === 7 ? 'B,E' : i === 8 ? 'A,B,C' : 'A',
      capacityKg: i === 7 ? 5 : i === 8 ? 6 : 9,
      installDate: new Date('2023-01-15'),
      lastServiceDate: sixMonthsAgo,
      nextServiceDue: sixMonthsFuture,
      serviceProvider: 'Chubb Fire & Security',
      lastInspectedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
      inspectedBy: 'Sarah Thompson',
      inspectionResult: 'Pass',
      isOperational: true,
    })),
    // AEDs
    {
      premisesId: premises1.id,
      equipmentType: 'AED (Defibrillator)',
      description: 'HeartSine Samaritan PAD 500P',
      location: 'Ground Floor Reception',
      serialNumber: 'AED-001',
      manufacturer: 'HeartSine',
      installDate: new Date('2024-03-01'),
      lastServiceDate: new Date('2025-09-01'),
      nextServiceDue: new Date('2026-09-01'),
      serviceProvider: 'HeartSine UK',
      lastInspectedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      inspectedBy: 'Sarah Thompson',
      inspectionResult: 'Pass',
      isOperational: true,
    },
    {
      premisesId: premises1.id,
      equipmentType: 'AED (Defibrillator)',
      description: 'HeartSine Samaritan PAD 500P',
      location: 'First Floor Manufacturing',
      serialNumber: 'AED-002',
      manufacturer: 'HeartSine',
      installDate: new Date('2024-03-01'),
      lastServiceDate: new Date('2025-09-01'),
      nextServiceDue: new Date('2026-09-01'),
      serviceProvider: 'HeartSine UK',
      lastInspectedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      inspectedBy: 'Mark Johnson',
      inspectionResult: 'Pass',
      isOperational: true,
    },
    // First Aid Kits
    ...[
      'Ground Floor Reception',
      'Ground Floor Workshop',
      'First Floor Manufacturing',
      'First Floor Office',
      'Second Floor Office',
      'Goods Bay',
    ].map((location, i) => ({
      premisesId: premises1.id,
      equipmentType: 'First Aid Kit',
      description: 'BS 8599-1 Workplace First Aid Kit (Large)',
      location,
      serialNumber: `FAK-${String(i + 1).padStart(3, '0')}`,
      manufacturer: 'St John Ambulance',
      installDate: new Date('2024-01-15'),
      lastServiceDate: new Date('2025-07-01'),
      nextServiceDue: new Date('2026-07-01'),
      serviceProvider: 'Internal',
      lastInspectedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      inspectedBy: 'First Aider on duty',
      inspectionResult: 'Pass',
      isOperational: true,
    })),
  ];

  for (const eq of equipmentData) {
    await prisma.femEmergencyEquipment.create({ data: eq });
  }
  console.log(
    '✅ Created 20 emergency equipment items (12 extinguishers, 2 AED, 6 first aid kits)'
  );

  // Evacuation Drill — 6 months ago
  await prisma.femEvacuationDrill.create({
    data: {
      premisesId: premises1.id,
      drillDate: sixMonthsAgo,
      drillType: 'Unannounced',
      evacuationType: 'FULL_EVACUATION',
      alarmedOrSilent: 'Alarmed',
      totalPersonsEvacuated: 172,
      evacuationTimeMinutes: 4.37,
      targetTimeMinutes: 5.0,
      targetAchieved: true,
      issuesIdentified: [
        'Fire door on floor 2 east wing slow to close',
        'Two visitors not immediately directed to exit',
      ],
      assemblyPointReached: true,
      rollCallCompleted: true,
      rollCallTimeMinutes: 1.5,
      peepEvacuationTested: true,
      peepIssues: null,
      correctiveActions:
        'Fire door closer to be replaced (included in FRA action plan). Visitor management briefing updated.',
      completedBy: 'James Mitchell',
      witnesses: ['Sarah Thompson', 'Mark Johnson', 'Lisa Brown'],
      createdBy: 'seed',
    },
  });
  console.log('✅ Created evacuation drill record (6 months ago, 4m22s)');

  // BCP for Premises 1
  const eightMonthsAgo = new Date();
  eightMonthsAgo.setMonth(eightMonthsAgo.getMonth() - 8);

  const bcp1 = await prisma.femBusinessContinuityPlan.create({
    data: {
      planReference: 'BCP-2026-001',
      title: 'Production Facility Loss — Business Continuity Plan',
      version: '2.1',
      status: 'ACTIVE',
      emergencyTypes: ['FIRE', 'EXPLOSION', 'FLOOD', 'STRUCTURAL_FAILURE', 'POWER_FAILURE'],
      scopeDescription:
        'This BCP covers the loss of the Head Office Manufacturing Site and the recovery of all critical business functions hosted at this location.',
      businessFunctions: [
        'Manufacturing',
        'IT/Systems',
        'HR/Payroll',
        'Quality Assurance',
        'Customer Service',
      ],
      crisisTeamLead: 'James Mitchell',
      crisisTeamLeadPhone: '+44 121 555 0100',
      crisisTeamMembers: [
        {
          name: 'James Mitchell',
          role: 'Crisis Team Lead',
          phone: '+44 121 555 0100',
          email: 'j.mitchell@example.com',
          deputyName: 'Helen Price',
        },
        {
          name: 'Alan Peters',
          role: 'IT Recovery Lead',
          phone: '+44 121 555 0110',
          email: 'a.peters@example.com',
          deputyName: 'Rachel King',
        },
        {
          name: 'Claire Dunn',
          role: 'HR Lead',
          phone: '+44 121 555 0120',
          email: 'c.dunn@example.com',
          deputyName: 'Steve Morris',
        },
        {
          name: 'Mark Johnson',
          role: 'Operations Lead',
          phone: '+44 121 555 0103',
          email: 'm.johnson@example.com',
          deputyName: 'Tom Evans',
        },
      ],
      crisisTeamMeetingPoint: 'Boardroom (or remote via Teams if site inaccessible)',
      crisisTeamVirtualLink: 'https://teams.microsoft.com/l/meetup-join/crisis-team',
      biaCompletedDate: new Date('2025-09-01'),
      criticalFunctions: [
        {
          function: 'Manufacturing',
          rto: '48 hours',
          rpo: '4 hours',
          minStaff: 15,
          dependsOn: ['IT/Systems', 'Suppliers'],
          notes: 'Can partially resume at alternative site within 48hrs',
        },
        {
          function: 'IT/Systems',
          rto: '4 hours',
          rpo: '1 hour',
          minStaff: 3,
          dependsOn: ['Cloud infrastructure'],
          notes: 'Cloud failover available for all core systems',
        },
        {
          function: 'HR/Payroll',
          rto: '72 hours',
          rpo: '24 hours',
          minStaff: 2,
          dependsOn: ['IT/Systems'],
          notes: 'Payroll processing can be outsourced to bureau within 72hrs',
        },
        {
          function: 'Quality Assurance',
          rto: '48 hours',
          rpo: '4 hours',
          minStaff: 4,
          dependsOn: ['IT/Systems', 'Manufacturing'],
          notes: 'QA documentation accessible from cloud',
        },
        {
          function: 'Customer Service',
          rto: '2 hours',
          rpo: '0 hours',
          minStaff: 2,
          dependsOn: ['IT/Systems'],
          notes: 'Remote working capability fully tested',
        },
      ],
      recoveryStrategies: [
        {
          function: 'Manufacturing',
          strategy: 'Relocate critical production to partner facility in Coventry',
          resources: ['Transport', 'Tooling', 'Raw materials'],
          steps: ['Notify partner site', 'Deploy key staff', 'Transfer critical WIP'],
        },
        {
          function: 'IT/Systems',
          strategy: 'Activate cloud failover — Azure DR region',
          resources: ['Cloud subscription', 'VPN access'],
          steps: ['Trigger failover', 'Verify data integrity', 'Notify users of new endpoints'],
        },
      ],
      alternativeSites: [
        {
          location: 'Partner Manufacturing — Coventry',
          capacity: 50,
          readyInHours: 48,
          contact: 'Partner Ops Manager +44 247 555 0200',
        },
        {
          location: 'Serviced Offices — Birmingham City Centre',
          capacity: 30,
          readyInHours: 4,
          contact: 'Regus +44 121 555 0300',
        },
      ],
      itRecoveryApproach:
        'Cloud failover — Azure paired region. RPO achieved through continuous replication. RTO 4 hours.',
      communicationsBackup: 'Mobile phones, personal email, Teams (cloud hosted)',
      activationCriteria:
        'BCP activation considered when: facility is inaccessible for >4 hours, any critical function RTO is at risk of breach, fire/flood damage renders facility unsafe.',
      activationProcess:
        '1. Crisis Team Lead notified\n2. Initial assessment (15-minute checklist)\n3. Crisis Team convened (phone/Teams)\n4. Activation decision made and recorded\n5. Communication cascade initiated\n6. Recovery actions per function commenced',
      deactivationProcess:
        '1. All critical functions restored to acceptable level\n2. Normal operations confirmed sustainable\n3. Crisis Team stands down\n4. Post-event review scheduled\n5. BCP updated with lessons learned',
      staffCommunicationPlan:
        'SMS cascade via AlertMedia. Email via personal addresses. Teams announcement channel.',
      customerCommPlan:
        'Key account managers notify priority customers directly. General notification via email template.',
      supplierCommPlan:
        'Procurement team notifies critical suppliers of disruption and expected duration.',
      reviewDate: new Date('2026-09-01'),
      lastTestedDate: eightMonthsAgo,
      lastTestOutcome: 'PASSED',
      approvedBy: 'Managing Director',
      approvedAt: new Date('2025-09-15'),
      createdBy: 'seed',
      organisationId: 'default',
    },
  });

  // BCP Exercise
  await prisma.femBcpExercise.create({
    data: {
      bcpId: bcp1.id,
      exerciseType: 'TABLETOP',
      title: 'Fire Scenario — Manufacturing Facility Loss',
      scheduledDate: eightMonthsAgo,
      actualDate: eightMonthsAgo,
      durationHours: 3.5,
      scope:
        'Test activation procedures, crisis team mobilisation, IT failover decision-making, and customer communication',
      participantsCount: 8,
      externalPartiesInvolved: false,
      outcome: 'PASSED',
      objectivesMet: true,
      findings:
        'Overall the crisis team responded well. The 15-minute checklist was effective. IT failover procedure was well understood. Customer communication templates need updating.',
      strengthsIdentified: [
        'Rapid crisis team mobilisation',
        'Clear IT failover procedure',
        'Good understanding of RTO/RPO by all team members',
      ],
      weaknessesIdentified: [
        'Customer communication templates outdated',
        'Partner site contact details need verification',
      ],
      actionsRequired: [
        {
          action: 'Update customer communication templates',
          owner: 'Marketing Manager',
          targetDate: '2025-08-01',
        },
        {
          action: 'Verify partner site contact details and capacity',
          owner: 'Operations Manager',
          targetDate: '2025-07-15',
        },
      ],
      facilitatorName: 'External BC Consultant — Resilience Partners Ltd',
      nextExerciseDate: new Date('2026-06-01'),
      createdBy: 'seed',
    },
  });
  console.log(
    '✅ Created BCP and exercise record (Production Facility Loss, tabletop 8 months ago, PASSED)'
  );

  // ═══ PREMISES 2: City Centre Office ═══
  const premises2 = await prisma.femPremises.create({
    data: {
      name: 'City Centre Office',
      address: '42 Corporation Street, Birmingham',
      postcode: 'B2 4LP',
      buildingType: 'Office',
      constructionType: 'Concrete frame, shared building (floor 2 only)',
      numberOfFloors: 1,
      totalFloorAreaM2: 350,
      maxOccupancy: 50,
      normalOccupancy: 45,
      responsiblePersonName: 'Karen Richards',
      responsiblePersonRole: 'Office Manager',
      responsiblePersonEmail: 'k.richards@example.com',
      responsiblePersonPhone: '+44 121 555 0200',
      fireAuthorityName: 'West Midlands Fire Service',
      localFireStationName: 'Birmingham Central',
      fireStationPhone: '+44 121 380 6000',
      distanceToFireStation: 0.8,
      buildingSafetyActApplicable: false,
      hasAutomaticFDS: true,
      hasSprinklers: false,
      hasEmergencyLighting: true,
      hasFireAlarm: true,
      hasPa: false,
      hasRisers: false,
      alarmSystem: 'Shared building system (landlord responsibility for common areas)',
      organisationId: 'default',
    },
  });
  console.log('✅ Created premises: City Centre Office');

  // Assembly Point for Premises 2
  await prisma.femAssemblyPoint.create({
    data: {
      premisesId: premises2.id,
      name: 'Assembly Point — Street (opposite main entrance)',
      description: 'Designated area on pavement opposite 42 Corporation Street',
      capacity: 60,
      isPrimary: true,
      isAccessible: true,
      wardenAssigned: 'Karen Richards',
    },
  });

  // FRA for Premises 2
  await prisma.femFireRiskAssessment.create({
    data: {
      referenceNumber: 'FRA-2026-0002',
      premisesId: premises2.id,
      assessmentDate: new Date('2025-09-20'),
      nextReviewDate: new Date('2026-09-20'),
      assessorName: 'David Clark BSc MIFSM',
      assessorCompany: 'FireSafe Consultants Ltd',
      assessorQualification: 'IFE Level 4 Certificate',
      assessorIsCompetent: true,
      ignitionSources: ['Electrical equipment', 'Kitchen appliances'],
      fuelSources: ['Paper/cardboard', 'Furniture', 'Textiles'],
      oxygenSources: ['Natural air', 'HVAC'],
      totalPersonsAtRisk: 45,
      employeesAtRisk: 40,
      visitorsAtRisk: 5,
      vulnerablePersonsPresent: false,
      existingPrecautions: [
        {
          category: 'Detection & Warning',
          measure: 'Shared building detection system',
          adequate: true,
        },
        { category: 'Means of Escape', measure: '2 escape routes', adequate: true },
        { category: 'Emergency Lighting', measure: 'Full coverage', adequate: true },
        { category: 'Firefighting Equipment', measure: '4 extinguishers', adequate: true },
        { category: 'Signs & Notices', measure: 'Fire action notices displayed', adequate: true },
        {
          category: 'Management & Maintenance',
          measure: 'Generally good',
          adequate: false,
          notes: 'Action: need to verify hybrid workers aware of evacuation procedures',
        },
      ],
      likelihoodRating: 1,
      consequenceRating: 2,
      overallRiskScore: 2,
      overallRiskLevel: 'LOW',
      significantFindings:
        'Overall fire risk is LOW. Small office premises with good fire safety provisions. One action: ensure hybrid workers receive fire safety refresher briefing.',
      actionPlan: [
        {
          finding: 'Hybrid workers may not be familiar with current evacuation procedure',
          action: 'Issue fire safety briefing to all hybrid workers and confirm receipt',
          priority: 'Medium',
          owner: 'Karen Richards',
          targetDate: '2026-03-31',
          completedDate: null,
        },
      ],
      staffInformedDate: new Date('2025-10-01'),
      emergencyPlanInPlace: true,
      trainingConducted: true,
      writtenRecordComplete: true,
      fireArrangementsDocumented: true,
      assessmentStatus: 'CURRENT',
      createdBy: 'seed',
      organisationId: 'default',
    },
  });
  console.log('✅ Created FRA: FRA-2026-0002 (LOW risk, 1 open action)');

  // Wardens for Premises 2
  await prisma.femFireWarden.createMany({
    data: [
      {
        premisesId: premises2.id,
        name: 'Karen Richards',
        email: 'k.richards@example.com',
        phone: '+44 121 555 0200',
        jobTitle: 'Office Manager',
        icsRole: 'FIRE_WARDEN',
        areaResponsible: 'Entire Floor',
        trainingProvider: 'FireSafe Training Ltd',
        trainingDate: new Date('2025-09-01'),
        trainingExpiryDate: new Date('2026-09-01'),
        certificateRef: 'FST-2025-2001',
        trainingCurrent: true,
      },
      {
        premisesId: premises2.id,
        name: 'Paul Green',
        email: 'p.green@example.com',
        phone: '+44 121 555 0201',
        jobTitle: 'Team Leader',
        icsRole: 'FIRE_WARDEN',
        areaResponsible: 'Open Plan Office Area',
        trainingProvider: 'FireSafe Training Ltd',
        trainingDate: new Date('2025-09-01'),
        trainingExpiryDate: new Date('2026-09-01'),
        certificateRef: 'FST-2025-2002',
        trainingCurrent: true,
      },
    ],
  });
  console.log('✅ Created 2 fire wardens for City Centre Office');

  // Drill for Premises 2
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  await prisma.femEvacuationDrill.create({
    data: {
      premisesId: premises2.id,
      drillDate: threeMonthsAgo,
      drillType: 'Announced',
      evacuationType: 'FULL_EVACUATION',
      alarmedOrSilent: 'Alarmed',
      totalPersonsEvacuated: 38,
      evacuationTimeMinutes: 2.17,
      targetTimeMinutes: 3.0,
      targetAchieved: true,
      issuesIdentified: [],
      assemblyPointReached: true,
      rollCallCompleted: true,
      rollCallTimeMinutes: 0.75,
      peepEvacuationTested: false,
      peepIssues: 'N/A — no PEEPs at this premises. Review recommended for hybrid workers.',
      correctiveActions: null,
      completedBy: 'Karen Richards',
      witnesses: ['Paul Green'],
      createdBy: 'seed',
    },
  });
  console.log('✅ Created evacuation drill for City Centre Office (3 months ago, 2m10s)');

  // ═══ HISTORICAL CLOSED INCIDENT ═══
  const closedIncident = await prisma.femEmergencyIncident.create({
    data: {
      incidentNumber: 'INC-2025-0001',
      premisesId: premises1.id,
      emergencyType: 'FIRE',
      severity: 'SIGNIFICANT',
      status: 'CLOSED',
      title: 'Small Electrical Fire in Server Room',
      description:
        'At approximately 14:35 on 15 August 2025, smoke was detected by the automatic detection system in the server room on the ground floor. Investigation revealed a small electrical fire originating from an overheated UPS cable connection. The fire was contained within the server rack and did not spread.',
      reportedAt: new Date('2025-08-15T14:35:00'),
      activatedAt: new Date('2025-08-15T14:36:00'),
      containedAt: new Date('2025-08-15T14:58:00'),
      closedAt: new Date('2025-08-15T15:22:00'),
      locationDescription: 'Server Room, Ground Floor',
      affectedAreas: ['Server Room', 'Ground Floor Reception (precautionary evacuation)'],
      evacuationOrdered: true,
      evacuationType: 'PARTIAL_EVACUATION',
      assemblyPointUsed: 'Assembly Point A — Car Park East',
      estimatedPersonsAffected: 45,
      injuriesReported: false,
      fatalitiesReported: false,
      incidentCommanderName: 'James Mitchell',
      commandCentreLocation: 'Reception Area',
      commandCentreActivated: false,
      fireServiceNotified: true,
      fireServiceNotifiedAt: new Date('2025-08-15T14:38:00'),
      policeNotified: false,
      ambulanceNotified: false,
      regulatorNotified: false,
      riddorReportable: false,
      bcpActivated: false,
      immediateActions:
        'Fire alarm activated automatically. Ground floor partially evacuated. CO2 extinguisher used by trained IT staff to suppress fire. Fire service notified and attended within 6 minutes. Power to server room isolated at main panel.',
      rootCauseCategory: 'Technical',
      lessonsLearned:
        'Root cause was a loose UPS cable connection causing overheating over time. Lessons: (1) Improve cable management in server room — install proper cable trays and routing. (2) Increase PAT testing frequency for critical infrastructure from annual to 6-monthly. (3) Consider installing aspirating smoke detection in server room for earlier warning.',
      reviewCompletedAt: new Date('2025-08-29'),
      reviewedBy: 'James Mitchell',
      createdBy: 'seed',
      organisationId: 'default',
    },
  });

  // Decision logs for closed incident
  await prisma.femIncidentDecisionLog.createMany({
    data: [
      {
        incidentId: closedIncident.id,
        timestamp: new Date('2025-08-15T14:37:00'),
        decisionMaker: 'James Mitchell',
        decisionMakerRole: 'Incident Commander',
        situationSummary:
          'Smoke detected in server room by automatic detection. Fire alarm activated. Source identified as UPS rack.',
        decisionMade:
          'Partial evacuation of ground floor. IT staff with fire training to assess and attempt suppression with CO2 extinguisher.',
        rationaleForDecision:
          'Fire appeared small and contained to single rack. Trained staff available. CO2 appropriate for electrical fire. Full evacuation not warranted at this stage.',
      },
      {
        incidentId: closedIncident.id,
        timestamp: new Date('2025-08-15T14:40:00'),
        decisionMaker: 'James Mitchell',
        decisionMakerRole: 'Incident Commander',
        situationSummary:
          'Fire suppressed by IT staff using CO2. Smoke clearing. Fire service en route.',
        decisionMade:
          'Maintain partial evacuation until fire service confirms safe. Isolate power to server room at main panel.',
        rationaleForDecision:
          'Even though fire appears out, fire service should confirm. Power isolation prevents re-ignition.',
      },
    ],
  });

  // Timeline events for closed incident
  await prisma.femIncidentTimelineEvent.createMany({
    data: [
      {
        incidentId: closedIncident.id,
        timestamp: new Date('2025-08-15T14:35:00'),
        eventType: 'DETECTION',
        description: 'Automatic fire detection — smoke detector activated in server room',
        recordedBy: 'System',
      },
      {
        incidentId: closedIncident.id,
        timestamp: new Date('2025-08-15T14:36:00'),
        eventType: 'DECLARED',
        description: 'Emergency declared: FIRE - SIGNIFICANT. Incident Commander on scene.',
        recordedBy: 'James Mitchell',
      },
      {
        incidentId: closedIncident.id,
        timestamp: new Date('2025-08-15T14:37:00'),
        eventType: 'DECISION',
        description:
          'Partial evacuation ordered for ground floor. IT staff to attempt suppression.',
        recordedBy: 'James Mitchell',
      },
      {
        incidentId: closedIncident.id,
        timestamp: new Date('2025-08-15T14:38:00'),
        eventType: 'COMMUNICATION',
        description: 'Fire service notified (999). Estimated attendance 5-7 minutes.',
        recordedBy: 'Sarah Thompson',
      },
      {
        incidentId: closedIncident.id,
        timestamp: new Date('2025-08-15T14:39:00'),
        eventType: 'ACTION',
        description:
          'CO2 extinguisher deployed on UPS rack fire by Alan Peters (IT Manager, fire trained)',
        recordedBy: 'James Mitchell',
      },
      {
        incidentId: closedIncident.id,
        timestamp: new Date('2025-08-15T14:40:00'),
        eventType: 'ACTION',
        description: 'Fire suppressed. Smoke clearing. Power isolated to server room.',
        recordedBy: 'James Mitchell',
      },
      {
        incidentId: closedIncident.id,
        timestamp: new Date('2025-08-15T14:44:00'),
        eventType: 'EXTERNAL',
        description: 'Fire service arrived. Officer in Charge briefed.',
        recordedBy: 'James Mitchell',
      },
      {
        incidentId: closedIncident.id,
        timestamp: new Date('2025-08-15T14:58:00'),
        eventType: 'STATUS_CHANGE',
        description: 'Fire service confirmed fire out, area safe. Status: CONTAINED',
        recordedBy: 'James Mitchell',
      },
      {
        incidentId: closedIncident.id,
        timestamp: new Date('2025-08-15T15:10:00'),
        eventType: 'ACTION',
        description: 'Ground floor re-occupied. Server room cordoned for investigation.',
        recordedBy: 'James Mitchell',
      },
      {
        incidentId: closedIncident.id,
        timestamp: new Date('2025-08-15T15:22:00'),
        eventType: 'CLOSED',
        description: 'Incident closed. Post-incident review scheduled for 29 August.',
        recordedBy: 'James Mitchell',
      },
    ],
  });
  console.log(
    '✅ Created historical closed incident: INC-2025-0001 (server room fire, 47 min duration)'
  );

  console.log('\n═══════════════════════════════════════');
  console.log('🔥 Fire, Emergency & Disaster Management seed complete');
  console.log('═══════════════════════════════════════');
  console.log('Premises: 2 (Head Office Manufacturing, City Centre Office)');
  console.log('FRAs: 2 (MEDIUM + LOW risk)');
  console.log('Fire Wardens: 6');
  console.log('PEEPs: 1 (wheelchair user)');
  console.log('Equipment: 20 items');
  console.log('Drills: 2');
  console.log('BCPs: 1 (with tabletop exercise)');
  console.log('Incidents: 1 (closed — server room fire)');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
