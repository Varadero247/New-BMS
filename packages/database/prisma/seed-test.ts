// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Integration test seeder — deterministic, idempotent data for CI.
// Usage: npx tsx packages/database/prisma/seed-test.ts
import * as bcrypt from 'bcryptjs';

import { PrismaClient as CoreClient } from '../generated/core';
import { PrismaClient as QualityClient } from '../generated/quality';
import { PrismaClient as HealthSafetyClient } from '../generated/health-safety';
import { PrismaClient as HRClient } from '../generated/hr';
import { PrismaClient as WorkflowsClient } from '../generated/workflows';

const core = new CoreClient();
const quality = new QualityClient();
const healthSafety = new HealthSafetyClient();
const hr = new HRClient();
const workflows = new WorkflowsClient();

// Stable test IDs — UUID format required by validateIdParam() middleware
export const TEST_IDS = {
  users: {
    admin:   '00000000-0000-0000-0000-000000000001',
    manager: '00000000-0000-0000-0000-000000000002',
    auditor: '00000000-0000-0000-0000-000000000003',
    user:    '00000000-0000-0000-0000-000000000004',
  },
  org: '00000000-0000-0000-0001-000000000001',
  departments: {
    engineering: '00000000-0000-0000-0002-000000000001',
    quality:     '00000000-0000-0000-0002-000000000002',
    hr:          '00000000-0000-0000-0002-000000000003',
  },
  employees: {
    alice: '00000000-0000-0000-0003-000000000001',
    bob:   '00000000-0000-0000-0003-000000000002',
    carol: '00000000-0000-0000-0003-000000000003',
    dave:  '00000000-0000-0000-0003-000000000004',
    eve:   '00000000-0000-0000-0003-000000000005',
  },
  nonConformances: {
    nc1: '00000000-0000-0000-0004-000000000001',
    nc2: '00000000-0000-0000-0004-000000000002',
  },
  incidents: {
    inc1: '00000000-0000-0000-0005-000000000001',
    inc2: '00000000-0000-0000-0005-000000000002',
  },
  workflows: {
    wf1:       '00000000-0000-0000-0006-000000000001',
    instance1: '00000000-0000-0000-0006-000000000002',
  },
};

async function truncateCoreSchema() {
  // Delete in reverse FK order
  await core.$executeRawUnsafe('TRUNCATE TABLE "audit_logs" RESTART IDENTITY CASCADE');
  await core.$executeRawUnsafe('TRUNCATE TABLE "sessions" RESTART IDENTITY CASCADE');
  await core.$executeRawUnsafe('TRUNCATE TABLE "users" RESTART IDENTITY CASCADE');
}

async function truncateQualitySchema() {
  await quality.$executeRawUnsafe('TRUNCATE TABLE "qual_nonconformances" RESTART IDENTITY CASCADE');
}

async function truncateHealthSafetySchema() {
  await healthSafety.$executeRawUnsafe('TRUNCATE TABLE "hs_incidents" RESTART IDENTITY CASCADE');
}

async function truncateHRSchema() {
  await hr.$executeRawUnsafe('TRUNCATE TABLE "hr_employees" RESTART IDENTITY CASCADE');
  await hr.$executeRawUnsafe('TRUNCATE TABLE "hr_departments" RESTART IDENTITY CASCADE');
}

async function truncateWorkflowsSchema() {
  await workflows.$executeRawUnsafe('TRUNCATE TABLE "wf_instances" RESTART IDENTITY CASCADE');
  await workflows.$executeRawUnsafe('TRUNCATE TABLE "wf_definitions" RESTART IDENTITY CASCADE');
}

async function seedUsers() {
  const passwordHash = await bcrypt.hash('Test@1234!', 10);

  const usersData = [
    {
      id: TEST_IDS.users.admin,
      email: 'admin@ims-test.io',
      password: passwordHash,
      firstName: 'Test',
      lastName: 'Admin',
      role: 'ADMIN' as const,
      isActive: true,
    },
    {
      id: TEST_IDS.users.manager,
      email: 'manager@ims-test.io',
      password: passwordHash,
      firstName: 'Test',
      lastName: 'Manager',
      role: 'MANAGER' as const,
      isActive: true,
    },
    {
      id: TEST_IDS.users.auditor,
      email: 'auditor@ims-test.io',
      password: passwordHash,
      firstName: 'Test',
      lastName: 'Auditor',
      role: 'AUDITOR' as const,
      isActive: true,
    },
    {
      id: TEST_IDS.users.user,
      email: 'user@ims-test.io',
      password: passwordHash,
      firstName: 'Test',
      lastName: 'User',
      role: 'USER' as const,
      isActive: true,
    },
  ];

  for (const u of usersData) {
    await core.user.create({ data: u });
  }

  console.log('  ✓ 4 test users created');
}

async function seedQualityNCRs() {
  const nc1Data = {
    id: TEST_IDS.nonConformances.nc1,
    referenceNumber: 'TEST-NCR-2026-001',
    ncType: 'INTERNAL' as const,
    source: 'INTERNAL_AUDIT' as const,
    severity: 'MINOR' as const,
    dateReported: new Date('2026-01-15'),
    reportedBy: TEST_IDS.users.admin,
    department: 'Engineering',
    title: 'Test NCR #1 - Calibration deviation',
    description: 'Test calibration procedure not followed correctly.',
    status: 'REPORTED' as const,
  };

  const nc2Data = {
    id: TEST_IDS.nonConformances.nc2,
    referenceNumber: 'TEST-NCR-2026-002',
    ncType: 'CUSTOMER_COMPLAINT' as const,
    source: 'CUSTOMER_FEEDBACK' as const,
    severity: 'MAJOR' as const,
    dateReported: new Date('2026-01-20'),
    reportedBy: TEST_IDS.users.manager,
    department: 'Quality',
    title: 'Test NCR #2 - Delivery defect',
    description: 'Customer reported defective batch in shipment.',
    status: 'UNDER_REVIEW' as const,
  };

  await quality.qualNonConformance.create({ data: nc1Data });
  await quality.qualNonConformance.create({ data: nc2Data });
  console.log('  ✓ 2 test non-conformances created');
}

async function seedIncidents() {
  const inc1 = {
    id: TEST_IDS.incidents.inc1,
    referenceNumber: 'TEST-INC-2026-001',
    title: 'Test Incident #1 - Near miss',
    description: 'Slippery floor caused near-miss at machine area.',
    type: 'NEAR_MISS' as const,
    severity: 'MINOR' as const,
    dateOccurred: new Date('2026-01-10'),
    dateReported: new Date('2026-01-10'),
    reporterId: TEST_IDS.users.admin,
    status: 'OPEN' as const,
  };

  const inc2 = {
    id: TEST_IDS.incidents.inc2,
    referenceNumber: 'TEST-INC-2026-002',
    title: 'Test Incident #2 - Minor injury',
    description: 'Minor hand laceration during parts assembly.',
    type: 'INJURY' as const,
    severity: 'MODERATE' as const,
    dateOccurred: new Date('2026-01-18'),
    dateReported: new Date('2026-01-18'),
    reporterId: TEST_IDS.users.manager,
    status: 'UNDER_INVESTIGATION' as const,
  };

  await healthSafety.incident.create({ data: inc1 });
  await healthSafety.incident.create({ data: inc2 });
  console.log('  ✓ 2 test incidents created');
}

async function seedHR() {
  // Departments
  await hr.hRDepartment.create({
    data: {
      id: TEST_IDS.departments.engineering,
      code: 'ENG',
      name: 'Test Engineering',
      isActive: true,
    },
  });
  await hr.hRDepartment.create({
    data: {
      id: TEST_IDS.departments.quality,
      code: 'QA',
      name: 'Test Quality Assurance',
      isActive: true,
    },
  });
  await hr.hRDepartment.create({
    data: {
      id: TEST_IDS.departments.hr,
      code: 'HR',
      name: 'Test Human Resources',
      isActive: true,
    },
  });

  // Employees
  const employeesData = [
    {
      id: TEST_IDS.employees.alice,
      employeeNumber: 'TEST-EMP-001',
      firstName: 'Alice',
      lastName: 'Anderson',
      workEmail: 'alice@ims-test.io',
      jobTitle: 'Senior Engineer',
      departmentId: TEST_IDS.departments.engineering,
      employmentType: 'FULL_TIME' as const,
      employmentStatus: 'ACTIVE' as const,
      hireDate: new Date('2024-01-01'),
    },
    {
      id: TEST_IDS.employees.bob,
      employeeNumber: 'TEST-EMP-002',
      firstName: 'Bob',
      lastName: 'Brown',
      workEmail: 'bob@ims-test.io',
      jobTitle: 'Quality Analyst',
      departmentId: TEST_IDS.departments.quality,
      employmentType: 'FULL_TIME' as const,
      employmentStatus: 'ACTIVE' as const,
      hireDate: new Date('2024-02-01'),
    },
    {
      id: TEST_IDS.employees.carol,
      employeeNumber: 'TEST-EMP-003',
      firstName: 'Carol',
      lastName: 'Clark',
      workEmail: 'carol@ims-test.io',
      jobTitle: 'HR Coordinator',
      departmentId: TEST_IDS.departments.hr,
      employmentType: 'PART_TIME' as const,
      employmentStatus: 'ACTIVE' as const,
      hireDate: new Date('2024-03-01'),
    },
    {
      id: TEST_IDS.employees.dave,
      employeeNumber: 'TEST-EMP-004',
      firstName: 'Dave',
      lastName: 'Davis',
      workEmail: 'dave@ims-test.io',
      jobTitle: 'Software Developer',
      departmentId: TEST_IDS.departments.engineering,
      employmentType: 'CONTRACT' as const,
      employmentStatus: 'ACTIVE' as const,
      hireDate: new Date('2024-04-01'),
    },
    {
      id: TEST_IDS.employees.eve,
      employeeNumber: 'TEST-EMP-005',
      firstName: 'Eve',
      lastName: 'Evans',
      workEmail: 'eve@ims-test.io',
      jobTitle: 'Quality Manager',
      departmentId: TEST_IDS.departments.quality,
      employmentType: 'FULL_TIME' as const,
      employmentStatus: 'ON_LEAVE' as const,
      hireDate: new Date('2024-05-01'),
    },
  ];

  for (const e of employeesData) {
    await hr.employee.create({ data: e });
  }

  console.log('  ✓ 3 departments + 5 employees created');
}

async function seedWorkflows() {
  await workflows.workflowDefinition.create({
    data: {
      id: TEST_IDS.workflows.wf1,
      code: 'TEST-WF-001',
      name: 'Test Approval Workflow',
      description: 'Test workflow for integration tests',
      category: 'APPROVAL' as const,
      triggerType: 'MANUAL' as const,
      steps: [
        { id: 'step-1', name: 'Review', type: 'REVIEW', assigneeRole: 'MANAGER' },
        { id: 'step-2', name: 'Approve', type: 'APPROVAL', assigneeRole: 'ADMIN' },
      ],
      status: 'ACTIVE' as const,
      isActive: true,
    },
  });

  console.log('  ✓ 1 workflow definition created');
}

async function main() {
  console.log('\n[Test Seeder] Truncating test data...');
  try {
    await Promise.allSettled([
      truncateCoreSchema(),
      truncateQualitySchema(),
      truncateHealthSafetySchema(),
      truncateHRSchema(),
      truncateWorkflowsSchema(),
    ]);
    console.log('[Test Seeder] Truncation done. Seeding...');

    await seedUsers();
    await seedQualityNCRs();
    await seedIncidents();
    await seedHR();
    await seedWorkflows();

    console.log('[Test Seeder] ✅ All test data seeded.\n');
  } finally {
    await Promise.allSettled([
      core.$disconnect(),
      quality.$disconnect(),
      healthSafety.$disconnect(),
      hr.$disconnect(),
      workflows.$disconnect(),
    ]);
  }
}

// Only run when executed directly (not when imported for TEST_IDS)
if (require.main === module) {
  main().catch((err) => {
    console.error('[Test Seeder] Error:', err);
    process.exit(1);
  });
}
