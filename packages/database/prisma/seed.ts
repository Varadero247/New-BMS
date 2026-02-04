import { PrismaClient, UserRole, ISOStandard, RiskLevel, ActionStatus, ActionPriority, ActionType, IncidentSeverity, IncidentStatus, IncidentType, DocumentStatus, DocumentType, ObjectiveStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@ims.local' },
    update: {},
    create: {
      email: 'admin@ims.local',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      department: 'Management',
      jobTitle: 'System Administrator',
      emailVerified: new Date(),
    },
  });
  console.log('✅ Created admin user:', adminUser.email);

  // Create manager user
  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@ims.local' },
    update: {},
    create: {
      email: 'manager@ims.local',
      password: hashedPassword,
      firstName: 'Jane',
      lastName: 'Manager',
      role: UserRole.MANAGER,
      department: 'Operations',
      jobTitle: 'Operations Manager',
      emailVerified: new Date(),
    },
  });
  console.log('✅ Created manager user:', managerUser.email);

  // Create auditor user
  const auditorUser = await prisma.user.upsert({
    where: { email: 'auditor@ims.local' },
    update: {},
    create: {
      email: 'auditor@ims.local',
      password: hashedPassword,
      firstName: 'Bob',
      lastName: 'Auditor',
      role: UserRole.AUDITOR,
      department: 'Quality',
      jobTitle: 'Internal Auditor',
      emailVerified: new Date(),
    },
  });
  console.log('✅ Created auditor user:', auditorUser.email);

  // Create sample risks
  const risks = await Promise.all([
    prisma.risk.upsert({
      where: { id: 'risk-hs-001' },
      update: {},
      create: {
        id: 'risk-hs-001',
        standard: ISOStandard.ISO_45001,
        title: 'Slip and Fall Hazard',
        description: 'Wet floors in production area creating slip hazards',
        category: 'Physical',
        source: 'Production Floor',
        likelihood: 3,
        severity: 4,
        detectability: 2,
        riskScore: 24,
        riskLevel: RiskLevel.HIGH,
        status: 'ACTIVE',
      },
    }),
    prisma.risk.upsert({
      where: { id: 'risk-env-001' },
      update: {},
      create: {
        id: 'risk-env-001',
        standard: ISOStandard.ISO_14001,
        title: 'Chemical Waste Disposal',
        description: 'Improper disposal of chemical waste affecting groundwater',
        category: 'Environmental',
        aspectType: 'Waste',
        environmentalImpact: 'Soil and water contamination',
        likelihood: 2,
        severity: 5,
        detectability: 3,
        riskScore: 30,
        riskLevel: RiskLevel.HIGH,
        status: 'ACTIVE',
      },
    }),
    prisma.risk.upsert({
      where: { id: 'risk-qual-001' },
      update: {},
      create: {
        id: 'risk-qual-001',
        standard: ISOStandard.ISO_9001,
        title: 'Product Defect Rate',
        description: 'High defect rate in assembly line affecting product quality',
        category: 'Quality',
        likelihood: 3,
        severity: 3,
        detectability: 2,
        riskScore: 18,
        riskLevel: RiskLevel.MEDIUM,
        status: 'ACTIVE',
      },
    }),
  ]);
  console.log('✅ Created risks:', risks.length);

  // Create sample incidents
  const incidents = await Promise.all([
    prisma.incident.upsert({
      where: { id: 'inc-001' },
      update: {},
      create: {
        id: 'inc-001',
        standard: ISOStandard.ISO_45001,
        title: 'Minor Hand Injury',
        description: 'Employee sustained minor cut while handling packaging materials',
        type: IncidentType.INJURY,
        dateOccurred: new Date('2026-01-15'),
        location: 'Warehouse Area B',
        severity: IncidentSeverity.MINOR,
        status: IncidentStatus.CLOSED,
        reporterId: adminUser.id,
        investigatorId: managerUser.id,
      },
    }),
    prisma.incident.upsert({
      where: { id: 'inc-002' },
      update: {},
      create: {
        id: 'inc-002',
        standard: ISOStandard.ISO_14001,
        title: 'Minor Chemical Spill',
        description: 'Small quantity of cleaning solvent spilled during transfer',
        type: IncidentType.SPILL,
        dateOccurred: new Date('2026-01-28'),
        location: 'Maintenance Area',
        severity: IncidentSeverity.MODERATE,
        status: IncidentStatus.UNDER_INVESTIGATION,
        reporterId: managerUser.id,
      },
    }),
  ]);
  console.log('✅ Created incidents:', incidents.length);

  // Create sample actions
  const actions = await Promise.all([
    prisma.action.upsert({
      where: { id: 'action-001' },
      update: {},
      create: {
        id: 'action-001',
        standard: ISOStandard.ISO_45001,
        title: 'Install anti-slip mats',
        description: 'Install anti-slip mats in production area wet zones',
        type: ActionType.CORRECTIVE,
        status: ActionStatus.IN_PROGRESS,
        priority: ActionPriority.HIGH,
        dueDate: new Date('2026-02-28'),
        ownerId: managerUser.id,
        createdById: adminUser.id,
        riskId: risks[0].id,
      },
    }),
    prisma.action.upsert({
      where: { id: 'action-002' },
      update: {},
      create: {
        id: 'action-002',
        standard: ISOStandard.ISO_14001,
        title: 'Review waste disposal procedures',
        description: 'Review and update chemical waste disposal procedures',
        type: ActionType.PREVENTIVE,
        status: ActionStatus.OPEN,
        priority: ActionPriority.HIGH,
        dueDate: new Date('2026-03-15'),
        ownerId: auditorUser.id,
        createdById: adminUser.id,
        riskId: risks[1].id,
      },
    }),
  ]);
  console.log('✅ Created actions:', actions.length);

  // Create sample objectives
  const objectives = await Promise.all([
    prisma.objective.upsert({
      where: { id: 'obj-001' },
      update: {},
      create: {
        id: 'obj-001',
        standard: ISOStandard.ISO_45001,
        title: 'Reduce workplace injuries by 25%',
        description: 'Achieve 25% reduction in recordable workplace injuries',
        targetValue: 25,
        currentValue: 10,
        unit: 'percent reduction',
        startDate: new Date('2026-01-01'),
        targetDate: new Date('2026-12-31'),
        status: ObjectiveStatus.ON_TRACK,
        ownerId: adminUser.id,
      },
    }),
    prisma.objective.upsert({
      where: { id: 'obj-002' },
      update: {},
      create: {
        id: 'obj-002',
        standard: ISOStandard.ISO_14001,
        title: 'Reduce energy consumption by 15%',
        description: 'Achieve 15% reduction in facility energy consumption',
        targetValue: 15,
        currentValue: 5,
        unit: 'percent reduction',
        startDate: new Date('2026-01-01'),
        targetDate: new Date('2026-12-31'),
        status: ObjectiveStatus.ON_TRACK,
        ownerId: managerUser.id,
      },
    }),
  ]);
  console.log('✅ Created objectives:', objectives.length);

  // Create sample training courses
  const courses = await Promise.all([
    prisma.trainingCourse.upsert({
      where: { id: 'course-001' },
      update: {},
      create: {
        id: 'course-001',
        standard: ISOStandard.ISO_45001,
        title: 'Workplace Safety Fundamentals',
        description: 'Basic workplace safety training for all employees',
        duration: '2 hours',
        frequency: 'Annual',
      },
    }),
    prisma.trainingCourse.upsert({
      where: { id: 'course-002' },
      update: {},
      create: {
        id: 'course-002',
        standard: ISOStandard.ISO_14001,
        title: 'Environmental Awareness',
        description: 'Environmental management system awareness training',
        duration: '90 minutes',
        frequency: 'Every 2 years',
      },
    }),
  ]);
  console.log('✅ Created training courses:', courses.length);

  // Create sample documents
  const documents = await Promise.all([
    prisma.document.upsert({
      where: { id: 'doc-001' },
      update: {},
      create: {
        id: 'doc-001',
        standard: ISOStandard.ISO_45001,
        title: 'Health & Safety Policy',
        description: 'Company health and safety policy document',
        documentType: DocumentType.POLICY,
        version: '2.0',
        status: DocumentStatus.APPROVED,
      },
    }),
    prisma.document.upsert({
      where: { id: 'doc-002' },
      update: {},
      create: {
        id: 'doc-002',
        standard: ISOStandard.ISO_14001,
        title: 'Environmental Management Manual',
        description: 'ISO 14001 Environmental Management System Manual',
        documentType: DocumentType.MANUAL,
        version: '3.1',
        status: DocumentStatus.APPROVED,
      },
    }),
    prisma.document.upsert({
      where: { id: 'doc-003' },
      update: {},
      create: {
        id: 'doc-003',
        standard: ISOStandard.ISO_9001,
        title: 'Quality Manual',
        description: 'ISO 9001 Quality Management System Manual',
        documentType: DocumentType.MANUAL,
        version: '4.0',
        status: DocumentStatus.APPROVED,
      },
    }),
  ]);
  console.log('✅ Created documents:', documents.length);

  // Create sample product categories (for Inventory)
  const categories = await Promise.all([
    prisma.productCategory.upsert({
      where: { id: 'cat-001' },
      update: {},
      create: {
        id: 'cat-001',
        name: 'Safety Equipment',
        description: 'Personal protective equipment and safety supplies',
      },
    }),
    prisma.productCategory.upsert({
      where: { id: 'cat-002' },
      update: {},
      create: {
        id: 'cat-002',
        name: 'Raw Materials',
        description: 'Production raw materials and components',
      },
    }),
  ]);
  console.log('✅ Created product categories:', categories.length);

  // Create sample warehouse
  const warehouse = await prisma.warehouse.upsert({
    where: { id: 'wh-001' },
    update: {},
    create: {
      id: 'wh-001',
      name: 'Main Warehouse',
      code: 'WH-MAIN',
      address: {
        street: '100 Industrial Park',
        city: 'Manufacturing City',
        state: 'CA',
        country: 'USA',
        postalCode: '90210',
      },
      totalCapacity: 10000,
      capacityUnit: 'cubic_meters',
      isActive: true,
    },
  });
  console.log('✅ Created warehouse:', warehouse.name);

  // Create sample HR department
  const hrDept = await prisma.hRDepartment.upsert({
    where: { code: 'OPS' },
    update: {},
    create: {
      name: 'Operations',
      code: 'OPS',
      description: 'Operations and Production Department',
      isActive: true,
    },
  });
  console.log('✅ Created HR department:', hrDept.name);

  console.log('');
  console.log('🎉 Database seed completed!');
  console.log('');
  console.log('📋 Login credentials:');
  console.log('   Admin:   admin@ims.local / admin123');
  console.log('   Manager: manager@ims.local / admin123');
  console.log('   Auditor: auditor@ims.local / admin123');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
