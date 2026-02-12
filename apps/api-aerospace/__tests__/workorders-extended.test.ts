import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    workOrder: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), count: jest.fn() },
    taskCard: { findMany: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn() },
  },
  Prisma: { WorkOrderWhereInput: {} },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: 'user-1', email: 'test@test.com', role: 'ADMIN' };
    next();
  }),
}));

jest.mock('@ims/service-auth', () => ({
  checkOwnership: () => (_req: any, _res: any, next: any) => next(),
  scopeToUser: (_req: any, _res: any, next: any) => next(),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

jest.mock('@ims/shared', () => ({
  validateIdParam: () => (_req: any, _res: any, next: any) => next(),
}));

import { prisma } from '../src/prisma';
import workordersRouter from '../src/routes/workorders';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const app = express();
app.use(express.json());
app.use('/api/workorders', workordersRouter);

describe('Work Order Routes (Aerospace)', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('POST /api/workorders', () => {
    const validBody = {
      title: 'A-Check Inspection',
      aircraftType: 'B737-800',
      description: 'Routine A-check maintenance',
    };

    it('should create a work order', async () => {
      (mockPrisma.workOrder.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.workOrder.create as jest.Mock).mockResolvedValue({
        id: 'wo-1', refNumber: 'WO-2602-0001', ...validBody, priority: 'ROUTINE', status: 'OPEN',
      });

      const res = await request(app).post('/api/workorders').send(validBody);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should accept AOG priority', async () => {
      (mockPrisma.workOrder.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.workOrder.create as jest.Mock).mockResolvedValue({ id: 'wo-2' });

      const res = await request(app).post('/api/workorders').send({
        ...validBody, priority: 'AOG',
      });
      expect(res.status).toBe(201);
    });

    it('should accept URGENT priority', async () => {
      (mockPrisma.workOrder.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.workOrder.create as jest.Mock).mockResolvedValue({ id: 'wo-3' });

      const res = await request(app).post('/api/workorders').send({
        ...validBody, priority: 'URGENT',
      });
      expect(res.status).toBe(201);
    });

    it('should return 400 for missing title', async () => {
      const res = await request(app).post('/api/workorders').send({
        aircraftType: 'B737', description: 'Test',
      });
      expect(res.status).toBe(400);
    });

    it('should return 400 for missing aircraftType', async () => {
      const res = await request(app).post('/api/workorders').send({
        title: 'Test', description: 'Test',
      });
      expect(res.status).toBe(400);
    });

    it('should return 400 for missing description', async () => {
      const res = await request(app).post('/api/workorders').send({
        title: 'Test', aircraftType: 'B737',
      });
      expect(res.status).toBe(400);
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.workOrder.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.workOrder.create as jest.Mock).mockRejectedValue(new Error('DB'));

      const res = await request(app).post('/api/workorders').send(validBody);
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/workorders', () => {
    it('should list work orders', async () => {
      (mockPrisma.workOrder.findMany as jest.Mock).mockResolvedValue([{ id: 'wo-1' }]);
      (mockPrisma.workOrder.count as jest.Mock).mockResolvedValue(1);

      const res = await request(app).get('/api/workorders');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.meta.total).toBe(1);
    });

    it('should support pagination', async () => {
      (mockPrisma.workOrder.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.workOrder.count as jest.Mock).mockResolvedValue(50);

      const res = await request(app).get('/api/workorders?page=3&limit=10');
      expect(res.status).toBe(200);
      expect(res.body.meta.page).toBe(3);
    });

    it('should filter by status', async () => {
      (mockPrisma.workOrder.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.workOrder.count as jest.Mock).mockResolvedValue(0);

      await request(app).get('/api/workorders?status=OPEN');
      expect(mockPrisma.workOrder.findMany).toHaveBeenCalled();
    });

    it('should filter by priority', async () => {
      (mockPrisma.workOrder.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.workOrder.count as jest.Mock).mockResolvedValue(0);

      await request(app).get('/api/workorders?priority=AOG');
      expect(mockPrisma.workOrder.findMany).toHaveBeenCalled();
    });

    it('should support search', async () => {
      (mockPrisma.workOrder.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.workOrder.count as jest.Mock).mockResolvedValue(0);

      await request(app).get('/api/workorders?search=B737');
      expect(mockPrisma.workOrder.findMany).toHaveBeenCalled();
    });

    it('should return 500 on error', async () => {
      (mockPrisma.workOrder.findMany as jest.Mock).mockRejectedValue(new Error('DB'));
      (mockPrisma.workOrder.count as jest.Mock).mockRejectedValue(new Error('DB'));

      const res = await request(app).get('/api/workorders');
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/workorders/:id', () => {
    it('should get work order with tasks', async () => {
      (mockPrisma.workOrder.findUnique as jest.Mock).mockResolvedValue({
        id: 'wo-1', deletedAt: null, tasks: [],
      });

      const res = await request(app).get('/api/workorders/wo-1');
      expect(res.status).toBe(200);
    });

    it('should return 404 if not found', async () => {
      (mockPrisma.workOrder.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app).get('/api/workorders/fake');
      expect(res.status).toBe(404);
    });

    it('should return 404 for soft-deleted', async () => {
      (mockPrisma.workOrder.findUnique as jest.Mock).mockResolvedValue({
        id: 'wo-1', deletedAt: new Date(),
      });

      const res = await request(app).get('/api/workorders/wo-1');
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/workorders/:id/tasks', () => {
    const validTask = {
      taskNumber: 'TC-001',
      description: 'Inspect landing gear',
    };

    it('should add a task card', async () => {
      (mockPrisma.workOrder.findUnique as jest.Mock).mockResolvedValue({
        id: 'wo-1', deletedAt: null, status: 'OPEN',
      });
      (mockPrisma.taskCard.create as jest.Mock).mockResolvedValue({
        id: 'tc-1', ...validTask, status: 'OPEN',
      });
      (mockPrisma.workOrder.update as jest.Mock).mockResolvedValue({ id: 'wo-1', status: 'IN_PROGRESS' });

      const res = await request(app).post('/api/workorders/wo-1/tasks').send(validTask);
      expect(res.status).toBe(201);
    });

    it('should return 404 if work order not found', async () => {
      (mockPrisma.workOrder.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app).post('/api/workorders/fake/tasks').send(validTask);
      expect(res.status).toBe(404);
    });

    it('should return 400 if work order is RELEASED', async () => {
      (mockPrisma.workOrder.findUnique as jest.Mock).mockResolvedValue({
        id: 'wo-1', deletedAt: null, status: 'RELEASED',
      });

      const res = await request(app).post('/api/workorders/wo-1/tasks').send(validTask);
      expect(res.status).toBe(400);
    });

    it('should return 400 if work order is CLOSED', async () => {
      (mockPrisma.workOrder.findUnique as jest.Mock).mockResolvedValue({
        id: 'wo-1', deletedAt: null, status: 'CLOSED',
      });

      const res = await request(app).post('/api/workorders/wo-1/tasks').send(validTask);
      expect(res.status).toBe(400);
    });

    it('should return 400 for missing taskNumber', async () => {
      (mockPrisma.workOrder.findUnique as jest.Mock).mockResolvedValue({
        id: 'wo-1', deletedAt: null, status: 'OPEN',
      });

      const res = await request(app).post('/api/workorders/wo-1/tasks').send({
        description: 'Inspect gear',
      });
      expect(res.status).toBe(400);
    });
  });

  describe('PUT /api/workorders/:id/tasks/:tid/complete', () => {
    const completeData = {
      actualHours: 2.5,
      technicianId: 'tech-1',
      technicianName: 'John Smith',
    };

    it('should complete a task card', async () => {
      (mockPrisma.workOrder.findUnique as jest.Mock).mockResolvedValue({
        id: 'wo-1', deletedAt: null, status: 'IN_PROGRESS',
      });
      (mockPrisma.taskCard.findFirst as jest.Mock).mockResolvedValue({
        id: 'tc-1', status: 'OPEN', workOrderId: 'wo-1',
      });
      (mockPrisma.taskCard.update as jest.Mock).mockResolvedValue({
        id: 'tc-1', status: 'COMPLETED',
      });

      const res = await request(app).put('/api/workorders/wo-1/tasks/tc-1/complete').send(completeData);
      expect(res.status).toBe(200);
    });

    it('should return 404 if work order not found', async () => {
      (mockPrisma.workOrder.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app).put('/api/workorders/fake/tasks/tc-1/complete').send(completeData);
      expect(res.status).toBe(404);
    });

    it('should return 404 if task not found', async () => {
      (mockPrisma.workOrder.findUnique as jest.Mock).mockResolvedValue({
        id: 'wo-1', deletedAt: null,
      });
      (mockPrisma.taskCard.findFirst as jest.Mock).mockResolvedValue(null);

      const res = await request(app).put('/api/workorders/wo-1/tasks/fake/complete').send(completeData);
      expect(res.status).toBe(404);
    });

    it('should return 400 if task already completed', async () => {
      (mockPrisma.workOrder.findUnique as jest.Mock).mockResolvedValue({
        id: 'wo-1', deletedAt: null,
      });
      (mockPrisma.taskCard.findFirst as jest.Mock).mockResolvedValue({
        id: 'tc-1', status: 'COMPLETED',
      });

      const res = await request(app).put('/api/workorders/wo-1/tasks/tc-1/complete').send(completeData);
      expect(res.status).toBe(400);
    });

    it('should return 400 for missing technicianId', async () => {
      (mockPrisma.workOrder.findUnique as jest.Mock).mockResolvedValue({
        id: 'wo-1', deletedAt: null,
      });
      (mockPrisma.taskCard.findFirst as jest.Mock).mockResolvedValue({
        id: 'tc-1', status: 'OPEN',
      });

      const res = await request(app).put('/api/workorders/wo-1/tasks/tc-1/complete').send({
        actualHours: 2.5, technicianName: 'John',
      });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/workorders/:id/inspect', () => {
    it('should inspect work order', async () => {
      (mockPrisma.workOrder.findUnique as jest.Mock).mockResolvedValue({
        id: 'wo-1', deletedAt: null, status: 'IN_PROGRESS',
        tasks: [{ status: 'COMPLETED', taskNumber: 'TC-001' }],
      });
      (mockPrisma.workOrder.update as jest.Mock).mockResolvedValue({
        id: 'wo-1', status: 'INSPECTION',
      });

      const res = await request(app).post('/api/workorders/wo-1/inspect').send({});
      expect(res.status).toBe(200);
    });

    it('should return 400 if no tasks', async () => {
      (mockPrisma.workOrder.findUnique as jest.Mock).mockResolvedValue({
        id: 'wo-1', deletedAt: null, status: 'IN_PROGRESS', tasks: [],
      });

      const res = await request(app).post('/api/workorders/wo-1/inspect').send({});
      expect(res.status).toBe(400);
    });

    it('should return 400 if tasks incomplete', async () => {
      (mockPrisma.workOrder.findUnique as jest.Mock).mockResolvedValue({
        id: 'wo-1', deletedAt: null, status: 'IN_PROGRESS',
        tasks: [{ status: 'OPEN', taskNumber: 'TC-001' }],
      });

      const res = await request(app).post('/api/workorders/wo-1/inspect').send({});
      expect(res.status).toBe(400);
    });

    it('should return 404 if not found', async () => {
      (mockPrisma.workOrder.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app).post('/api/workorders/fake/inspect').send({});
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/workorders/:id/release', () => {
    const releaseData = {
      releaseCertType: 'EASA_FORM_1',
      releaseCertRef: 'EASA-2026-0001',
    };

    it('should release work order', async () => {
      (mockPrisma.workOrder.findUnique as jest.Mock).mockResolvedValue({
        id: 'wo-1', deletedAt: null, refNumber: 'WO-2602-0001',
        status: 'INSPECTION', inspectedBy: 'inspector-1', inspectedDate: new Date(),
        tasks: [{ status: 'COMPLETED', taskNumber: 'TC-001' }],
      });
      (mockPrisma.workOrder.update as jest.Mock).mockResolvedValue({
        id: 'wo-1', status: 'RELEASED',
      });

      const res = await request(app).post('/api/workorders/wo-1/release').send(releaseData);
      expect(res.status).toBe(200);
    });

    it('should return 400 if not inspected', async () => {
      (mockPrisma.workOrder.findUnique as jest.Mock).mockResolvedValue({
        id: 'wo-1', deletedAt: null,
        status: 'IN_PROGRESS', inspectedBy: null, inspectedDate: null,
        tasks: [{ status: 'COMPLETED', taskNumber: 'TC-001' }],
      });

      const res = await request(app).post('/api/workorders/wo-1/release').send(releaseData);
      expect(res.status).toBe(400);
    });

    it('should return 400 for missing releaseCertRef', async () => {
      (mockPrisma.workOrder.findUnique as jest.Mock).mockResolvedValue({
        id: 'wo-1', deletedAt: null, inspectedBy: 'inspector-1', inspectedDate: new Date(),
        tasks: [{ status: 'COMPLETED' }],
      });

      const res = await request(app).post('/api/workorders/wo-1/release').send({
        releaseCertType: 'EASA_FORM_1',
      });
      expect(res.status).toBe(400);
    });

    it('should accept FAA_8130_3 cert type', async () => {
      (mockPrisma.workOrder.findUnique as jest.Mock).mockResolvedValue({
        id: 'wo-1', deletedAt: null, refNumber: 'WO-1',
        inspectedBy: 'insp', inspectedDate: new Date(),
        tasks: [{ status: 'COMPLETED' }],
      });
      (mockPrisma.workOrder.update as jest.Mock).mockResolvedValue({ id: 'wo-1' });

      const res = await request(app).post('/api/workorders/wo-1/release').send({
        releaseCertType: 'FAA_8130_3',
        releaseCertRef: 'FAA-001',
      });
      expect(res.status).toBe(200);
    });
  });

  describe('POST /api/workorders/:id/defer', () => {
    const deferData = {
      deferralRef: 'MEL-45-01',
      deferralNotes: 'Deferred per MEL category C',
    };

    it('should defer a work order', async () => {
      (mockPrisma.workOrder.findUnique as jest.Mock).mockResolvedValue({
        id: 'wo-1', deletedAt: null, status: 'IN_PROGRESS', refNumber: 'WO-1',
      });
      (mockPrisma.workOrder.update as jest.Mock).mockResolvedValue({
        id: 'wo-1', status: 'DEFERRED',
      });

      const res = await request(app).post('/api/workorders/wo-1/defer').send(deferData);
      expect(res.status).toBe(200);
    });

    it('should return 400 if already RELEASED', async () => {
      (mockPrisma.workOrder.findUnique as jest.Mock).mockResolvedValue({
        id: 'wo-1', deletedAt: null, status: 'RELEASED',
      });

      const res = await request(app).post('/api/workorders/wo-1/defer').send(deferData);
      expect(res.status).toBe(400);
    });

    it('should return 400 for missing deferralRef', async () => {
      (mockPrisma.workOrder.findUnique as jest.Mock).mockResolvedValue({
        id: 'wo-1', deletedAt: null, status: 'IN_PROGRESS',
      });

      const res = await request(app).post('/api/workorders/wo-1/defer').send({
        deferralNotes: 'notes',
      });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/workorders/:id/release-cert', () => {
    it('should return release certificate data', async () => {
      (mockPrisma.workOrder.findUnique as jest.Mock).mockResolvedValue({
        id: 'wo-1', deletedAt: null, status: 'RELEASED',
        refNumber: 'WO-1', title: 'Test', aircraftType: 'B737',
        releaseCertType: 'EASA_FORM_1', releaseCertRef: 'EASA-001',
        inspectedBy: 'insp', releasedBy: 'mgr',
        tasks: [{ taskNumber: 'TC-1', actualHours: 3, status: 'COMPLETED' }],
      });

      const res = await request(app).get('/api/workorders/wo-1/release-cert');
      expect(res.status).toBe(200);
      expect(res.body.data.totalHours).toBe(3);
    });

    it('should return 400 if not released', async () => {
      (mockPrisma.workOrder.findUnique as jest.Mock).mockResolvedValue({
        id: 'wo-1', deletedAt: null, status: 'IN_PROGRESS',
      });

      const res = await request(app).get('/api/workorders/wo-1/release-cert');
      expect(res.status).toBe(400);
    });

    it('should return 404 if not found', async () => {
      (mockPrisma.workOrder.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app).get('/api/workorders/fake/release-cert');
      expect(res.status).toBe(404);
    });
  });
});
