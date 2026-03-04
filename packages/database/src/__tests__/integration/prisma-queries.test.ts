// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Integration: Prisma queries against real PostgreSQL (no mocks).
import { PrismaClient } from '../../../generated/core';
import { PrismaClient as QualityClient } from '../../../generated/quality';
import { resetTestDatabase, flushTestRedis } from '../../test-helpers';
import { TEST_IDS } from '../../../prisma/seed-test';

let corePrisma: PrismaClient;
let qualityPrisma: QualityClient;

beforeAll(async () => {
  await resetTestDatabase();
  await flushTestRedis();
  corePrisma = new PrismaClient();
  qualityPrisma = new QualityClient();
});

afterAll(async () => {
  await corePrisma.$disconnect();
  await qualityPrisma.$disconnect();
});

describe('User CRUD', () => {
  it('findUnique by email returns seeded admin user', async () => {
    const user = await corePrisma.user.findUnique({ where: { email: 'admin@ims-test.io' } });
    expect(user).not.toBeNull();
    expect(user!.id).toBe(TEST_IDS.users.admin);
    expect(user!.role).toBe('ADMIN');
    expect(user!.isActive).toBe(true);
  });

  it('findMany by role returns correct users', async () => {
    const managers = await corePrisma.user.findMany({ where: { role: 'MANAGER' } });
    expect(managers.length).toBeGreaterThanOrEqual(1);
    expect(managers.every((u) => u.role === 'MANAGER')).toBe(true);
  });

  it('creates a new user and reads it back', async () => {
    const bcrypt = await import('bcryptjs');
    const hash = await bcrypt.hash('Test@1234!', 10);

    const created = await corePrisma.user.create({
      data: {
        id: 'test-dynamic-user-001',
        email: 'dynamic@ims-test.io',
        password: hash,
        firstName: 'Dynamic',
        lastName: 'User',
        role: 'USER',
        isActive: true,
      },
    });

    expect(created.id).toBe('test-dynamic-user-001');
    expect(created.email).toBe('dynamic@ims-test.io');
  });

  it('updates a user field', async () => {
    const updated = await corePrisma.user.update({
      where: { id: 'test-dynamic-user-001' },
      data: { jobTitle: 'Integration Tester' },
    });
    expect(updated.jobTitle).toBe('Integration Tester');
  });

  it('soft-delete: user with deletedAt is excluded from non-soft queries', async () => {
    await corePrisma.user.update({
      where: { id: 'test-dynamic-user-001' },
      data: { deletedAt: new Date() },
    });

    const found = await corePrisma.user.findFirst({
      where: { id: 'test-dynamic-user-001', deletedAt: null },
    });
    expect(found).toBeNull();

    // Cleanup
    await corePrisma.user.delete({ where: { id: 'test-dynamic-user-001' } });
  });

  it('password field is never returned in sensitive assertion', async () => {
    const user = await corePrisma.user.findUnique({
      where: { email: 'admin@ims-test.io' },
      select: { id: true, email: true, role: true },
    });
    expect(user).not.toBeNull();
    expect(Object.keys(user!)).not.toContain('password');
  });
});

describe('Non-Conformance relations', () => {
  it('fetches seeded NCRs', async () => {
    const ncrs = await qualityPrisma.qualNonConformance.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'asc' },
    });
    expect(ncrs.length).toBeGreaterThanOrEqual(2);
    expect(ncrs[0].referenceNumber).toBe('TEST-NCR-2026-001');
  });

  it('creates an NCR and reads it back', async () => {
    const ncr = await qualityPrisma.qualNonConformance.create({
      data: {
        id: 'test-ncr-dynamic-001',
        referenceNumber: 'TEST-NCR-2026-DYN-001',
        ncType: 'INTERNAL',
        source: 'INTERNAL_AUDIT',
        severity: 'MINOR',
        reportedBy: TEST_IDS.users.admin,
        department: 'Test Dept',
        title: 'Dynamic NCR',
        description: 'Created during integration test',
        status: 'REPORTED',
      },
    });
    expect(ncr.id).toBe('test-ncr-dynamic-001');
    expect(ncr.status).toBe('REPORTED');

    // Cleanup
    await qualityPrisma.qualNonConformance.delete({ where: { id: 'test-ncr-dynamic-001' } });
  });
});

describe('Transaction rollback', () => {
  it('rolls back on error — no NCR left if transaction fails', async () => {
    const rollbackId = 'test-ncr-rollback-001';

    await expect(
      qualityPrisma.$transaction(async (tx) => {
        await tx.qualNonConformance.create({
          data: {
            id: rollbackId,
            referenceNumber: 'TEST-NCR-ROLLBACK-001',
            ncType: 'INTERNAL',
            source: 'INTERNAL_AUDIT',
            severity: 'MINOR',
            reportedBy: TEST_IDS.users.admin,
            department: 'Test Dept',
            title: 'Will rollback',
            description: 'Should not persist',
            status: 'REPORTED',
          },
        });
        // Force rollback
        throw new Error('Intentional rollback');
      })
    ).rejects.toThrow('Intentional rollback');

    const found = await qualityPrisma.qualNonConformance.findUnique({ where: { id: rollbackId } });
    expect(found).toBeNull();
  });
});

describe('AuditLog entry', () => {
  it('can create audit log entries linked to a user', async () => {
    const log = await corePrisma.auditLog.create({
      data: {
        userId: TEST_IDS.users.admin,
        action: 'UPDATE',
        entity: 'User',
        entityId: TEST_IDS.users.admin,
        changes: { field: 'jobTitle', from: null, to: 'Test Admin' },
        ipAddress: '127.0.0.1',
      },
    });

    expect(log.action).toBe('UPDATE');
    expect(log.entity).toBe('User');
    expect(log.userId).toBe(TEST_IDS.users.admin);

    // Cleanup
    await corePrisma.auditLog.delete({ where: { id: log.id } });
  });
});
