import express from 'express';
import request from 'supertest';

// Mock dependencies - use ../prisma (not @ims/database)
jest.mock('../src/prisma', () => ({
  prisma: {
    qualProcess: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: '20000000-0000-4000-a000-000000000123', email: 'test@test.com', role: 'USER' };
    next();
  }),
}));
jest.mock('@ims/service-auth', () => ({
  checkOwnership: () => (_req: any, _res: any, next: any) => next(),
  scopeToUser: (_req: any, _res: any, next: any) => next(),
}));

jest.mock('uuid', () => ({
  v4: jest.fn(() => '30000000-0000-4000-a000-000000000123'),
}));

import { prisma } from '../src/prisma';
import processesRoutes from '../src/routes/processes';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('Quality Processes API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/processes', processesRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/processes', () => {
    const mockProcesses = [
      {
        id: '1d000000-0000-4000-a000-000000000001',
        referenceNumber: 'QMS-PRO-2026-001',
        processName: 'Order Fulfillment',
        processType: 'CORE',
        department: 'Operations',
        processOwner: 'John Doe',
        status: 'ACTIVE',
        purposeScope: 'Handle customer orders',
        inputs: 'Customer orders',
        outputs: 'Shipped goods',
      },
      {
        id: 'proc-2',
        referenceNumber: 'QMS-PRO-2026-002',
        processName: 'Strategic Planning',
        processType: 'MANAGEMENT',
        department: 'Executive',
        processOwner: 'Jane Smith',
        status: 'DRAFT',
        purposeScope: 'Long-term planning',
        inputs: 'Market data',
        outputs: 'Strategic plan',
      },
    ];

    it('should return list of processes with pagination', async () => {
      (mockPrisma.qualProcess.findMany as jest.Mock).mockResolvedValueOnce(mockProcesses);
      (mockPrisma.qualProcess.count as jest.Mock).mockResolvedValueOnce(2);

      const response = await request(app)
        .get('/api/processes')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.items).toHaveLength(2);
      expect(response.body.data).toMatchObject({
        page: 1,
        limit: 20,
        total: 2,
        totalPages: 1,
      });
    });

    it('should support pagination parameters', async () => {
      (mockPrisma.qualProcess.findMany as jest.Mock).mockResolvedValueOnce([mockProcesses[0]]);
      (mockPrisma.qualProcess.count as jest.Mock).mockResolvedValueOnce(30);

      const response = await request(app)
        .get('/api/processes?page=2&limit=15')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data.page).toBe(2);
      expect(response.body.data.limit).toBe(15);
      expect(response.body.data.totalPages).toBe(2);
    });

    it('should filter by processType', async () => {
      (mockPrisma.qualProcess.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.qualProcess.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/processes?processType=CORE')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.qualProcess.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            processType: 'CORE',
          }),
        })
      );
    });

    it('should filter by status', async () => {
      (mockPrisma.qualProcess.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.qualProcess.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/processes?status=ACTIVE').set('Authorization', 'Bearer token');

      expect(mockPrisma.qualProcess.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'ACTIVE',
          }),
        })
      );
    });

    it('should filter by search on processName', async () => {
      (mockPrisma.qualProcess.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.qualProcess.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/processes?search=order').set('Authorization', 'Bearer token');

      expect(mockPrisma.qualProcess.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            processName: { contains: 'order', mode: 'insensitive' },
          }),
        })
      );
    });

    it('should order by createdAt descending', async () => {
      (mockPrisma.qualProcess.findMany as jest.Mock).mockResolvedValueOnce(mockProcesses);
      (mockPrisma.qualProcess.count as jest.Mock).mockResolvedValueOnce(2);

      await request(app).get('/api/processes').set('Authorization', 'Bearer token');

      expect(mockPrisma.qualProcess.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        })
      );
    });

    it('should handle database errors', async () => {
      (mockPrisma.qualProcess.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/processes')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('GET /api/processes/:id', () => {
    const mockProcess = {
      id: '1d000000-0000-4000-a000-000000000001',
      referenceNumber: 'QMS-PRO-2026-001',
      processName: 'Order Fulfillment',
      processType: 'CORE',
      department: 'Operations',
      processOwner: 'John Doe',
      status: 'ACTIVE',
    };

    it('should return a single process', async () => {
      (mockPrisma.qualProcess.findUnique as jest.Mock).mockResolvedValueOnce(mockProcess);

      const response = await request(app)
        .get('/api/processes/1d000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('1d000000-0000-4000-a000-000000000001');
    });

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff process', async () => {
      (mockPrisma.qualProcess.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .get('/api/processes/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      (mockPrisma.qualProcess.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/processes/1d000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/processes', () => {
    const createPayload = {
      processName: 'New Quality Process',
      processType: 'CORE',
      department: 'Quality',
      processOwner: 'Quality Manager',
      purposeScope: 'Ensure product quality',
      inputs: 'Raw materials, specifications',
      outputs: 'Inspected products, quality reports',
    };

    it('should create a process successfully', async () => {
      (mockPrisma.qualProcess.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.qualProcess.create as jest.Mock).mockResolvedValueOnce({
        id: '30000000-0000-4000-a000-000000000123',
        referenceNumber: 'QMS-PRO-2026-001',
        ...createPayload,
        version: '1.0',
        status: 'DRAFT',
        reviewFrequency: 'ANNUALLY',
      });

      const response = await request(app)
        .post('/api/processes')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.processName).toBe('New Quality Process');
    });

    it('should generate a reference number on create', async () => {
      (mockPrisma.qualProcess.count as jest.Mock).mockResolvedValueOnce(4);
      (mockPrisma.qualProcess.create as jest.Mock).mockResolvedValueOnce({
        id: '30000000-0000-4000-a000-000000000123',
        referenceNumber: 'QMS-PRO-2026-005',
        ...createPayload,
      });

      await request(app)
        .post('/api/processes')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(mockPrisma.qualProcess.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          referenceNumber: expect.stringContaining('QMS-PRO-'),
        }),
      });
    });

    it('should return 400 for missing processName', async () => {
      const response = await request(app)
        .post('/api/processes')
        .set('Authorization', 'Bearer token')
        .send({
          processType: 'CORE',
          department: 'Q',
          processOwner: 'O',
          purposeScope: 'S',
          inputs: 'I',
          outputs: 'O',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing processType', async () => {
      const response = await request(app)
        .post('/api/processes')
        .set('Authorization', 'Bearer token')
        .send({
          processName: 'Name',
          department: 'Q',
          processOwner: 'O',
          purposeScope: 'S',
          inputs: 'I',
          outputs: 'O',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing department', async () => {
      const response = await request(app)
        .post('/api/processes')
        .set('Authorization', 'Bearer token')
        .send({
          processName: 'Name',
          processType: 'CORE',
          processOwner: 'O',
          purposeScope: 'S',
          inputs: 'I',
          outputs: 'O',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing processOwner', async () => {
      const response = await request(app)
        .post('/api/processes')
        .set('Authorization', 'Bearer token')
        .send({
          processName: 'Name',
          processType: 'CORE',
          department: 'Q',
          purposeScope: 'S',
          inputs: 'I',
          outputs: 'O',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing purposeScope', async () => {
      const response = await request(app)
        .post('/api/processes')
        .set('Authorization', 'Bearer token')
        .send({
          processName: 'Name',
          processType: 'CORE',
          department: 'Q',
          processOwner: 'O',
          inputs: 'I',
          outputs: 'O',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing inputs', async () => {
      const response = await request(app)
        .post('/api/processes')
        .set('Authorization', 'Bearer token')
        .send({
          processName: 'Name',
          processType: 'CORE',
          department: 'Q',
          processOwner: 'O',
          purposeScope: 'S',
          outputs: 'O',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing outputs', async () => {
      const response = await request(app)
        .post('/api/processes')
        .set('Authorization', 'Bearer token')
        .send({
          processName: 'Name',
          processType: 'CORE',
          department: 'Q',
          processOwner: 'O',
          purposeScope: 'S',
          inputs: 'I',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid processType enum', async () => {
      const response = await request(app)
        .post('/api/processes')
        .set('Authorization', 'Bearer token')
        .send({ ...createPayload, processType: 'INVALID' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (mockPrisma.qualProcess.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.qualProcess.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/processes')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('PUT /api/processes/:id', () => {
    const existingProcess = {
      id: '1d000000-0000-4000-a000-000000000001',
      processName: 'Existing Process',
      processType: 'CORE',
      department: 'Operations',
      processOwner: 'John Doe',
      status: 'ACTIVE',
    };

    it('should update a process successfully', async () => {
      (mockPrisma.qualProcess.findUnique as jest.Mock).mockResolvedValueOnce(existingProcess);
      (mockPrisma.qualProcess.update as jest.Mock).mockResolvedValueOnce({
        ...existingProcess,
        processName: 'Updated Process Name',
      });

      const response = await request(app)
        .put('/api/processes/1d000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ processName: 'Updated Process Name' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff process', async () => {
      (mockPrisma.qualProcess.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .put('/api/processes/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token')
        .send({ processName: 'Updated' });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 for invalid status value', async () => {
      (mockPrisma.qualProcess.findUnique as jest.Mock).mockResolvedValueOnce(existingProcess);

      const response = await request(app)
        .put('/api/processes/1d000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ status: 'INVALID_STATUS' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid processType value', async () => {
      (mockPrisma.qualProcess.findUnique as jest.Mock).mockResolvedValueOnce(existingProcess);

      const response = await request(app)
        .put('/api/processes/1d000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ processType: 'INVALID' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid measurementFrequency', async () => {
      (mockPrisma.qualProcess.findUnique as jest.Mock).mockResolvedValueOnce(existingProcess);

      const response = await request(app)
        .put('/api/processes/1d000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ measurementFrequency: 'YEARLY' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (mockPrisma.qualProcess.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .put('/api/processes/1d000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ processName: 'Updated' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('DELETE /api/processes/:id', () => {
    it('should delete a process successfully', async () => {
      (mockPrisma.qualProcess.findUnique as jest.Mock).mockResolvedValueOnce({
        id: '1d000000-0000-4000-a000-000000000001',
      });
      (mockPrisma.qualProcess.update as jest.Mock).mockResolvedValueOnce({});

      const response = await request(app)
        .delete('/api/processes/1d000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(204);
      expect(mockPrisma.qualProcess.update).toHaveBeenCalledWith({
        where: { id: '1d000000-0000-4000-a000-000000000001' },
        data: { deletedAt: expect.any(Date) },
      });
    });

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff process', async () => {
      (mockPrisma.qualProcess.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .delete('/api/processes/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      (mockPrisma.qualProcess.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .delete('/api/processes/1d000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});
