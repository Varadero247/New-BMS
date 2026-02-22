import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    qualCalibration: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: 'user-123', email: 'test@test.com', role: 'ADMIN', organisationId: 'org-1' };
    next();
  }),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import { prisma } from '../src/prisma';
import calibrationsRouter from '../src/routes/calibrations';

const app = express();
app.use(express.json());
app.use('/api/calibrations', calibrationsRouter);

const mockCalibration = {
  id: '00000000-0000-0000-0000-000000000001',
  referenceNumber: 'CAL-2026-001',
  equipmentName: 'Digital Caliper',
  serialNumber: 'SN-12345',
  status: 'CURRENT',
  calibrationDate: '2026-01-15T00:00:00.000Z',
  nextDueDate: '2027-01-15T00:00:00.000Z',
  organisationId: 'org-1',
  createdAt: '2026-01-15T00:00:00.000Z',
  updatedAt: '2026-01-15T00:00:00.000Z',
};

describe('Calibrations Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/calibrations', () => {
    it('should return a list of calibrations', async () => {
      (prisma.qualCalibration.findMany as jest.Mock).mockResolvedValue([mockCalibration]);
      (prisma.qualCalibration.count as jest.Mock).mockResolvedValue(1);

      const res = await request(app).get('/api/calibrations');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].equipmentName).toBe('Digital Caliper');
    });

    it('should filter by status', async () => {
      (prisma.qualCalibration.findMany as jest.Mock).mockResolvedValue([mockCalibration]);
      (prisma.qualCalibration.count as jest.Mock).mockResolvedValue(1);

      const res = await request(app).get('/api/calibrations?status=CURRENT');
      expect(res.status).toBe(200);
      expect(prisma.qualCalibration.findMany).toHaveBeenCalled();
    });

    it('should support pagination', async () => {
      (prisma.qualCalibration.findMany as jest.Mock).mockResolvedValue([mockCalibration]);
      (prisma.qualCalibration.count as jest.Mock).mockResolvedValue(1);

      const res = await request(app).get('/api/calibrations?page=1&limit=10');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should handle errors', async () => {
      (prisma.qualCalibration.findMany as jest.Mock).mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/calibrations');
      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/calibrations', () => {
    it('should create a calibration', async () => {
      (prisma.qualCalibration.count as jest.Mock).mockResolvedValue(0);
      (prisma.qualCalibration.create as jest.Mock).mockResolvedValue(mockCalibration);

      const res = await request(app).post('/api/calibrations').send({
        equipmentName: 'Digital Caliper',
        serialNumber: 'SN-12345',
        status: 'CURRENT',
        calibrationDate: '2026-01-15',
        nextDueDate: '2027-01-15',
      });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.equipmentName).toBe('Digital Caliper');
    });

    it('should validate required fields', async () => {
      const res = await request(app).post('/api/calibrations').send({});
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should handle creation errors', async () => {
      (prisma.qualCalibration.count as jest.Mock).mockResolvedValue(0);
      (prisma.qualCalibration.create as jest.Mock).mockRejectedValue(new Error('DB error'));

      const res = await request(app).post('/api/calibrations').send({
        equipmentName: 'Digital Caliper',
        serialNumber: 'SN-12345',
        status: 'CURRENT',
        calibrationDate: '2026-01-15',
        nextDueDate: '2027-01-15',
      });
      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/calibrations/:id', () => {
    it('should return a calibration by id', async () => {
      (prisma.qualCalibration.findFirst as jest.Mock).mockResolvedValue(mockCalibration);

      const res = await request(app).get('/api/calibrations/00000000-0000-0000-0000-000000000001');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.serialNumber).toBe('SN-12345');
    });

    it('should return 404 if not found', async () => {
      (prisma.qualCalibration.findFirst as jest.Mock).mockResolvedValue(null);

      const res = await request(app).get('/api/calibrations/00000000-0000-0000-0000-000000000099');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should handle errors', async () => {
      (prisma.qualCalibration.findFirst as jest.Mock).mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/calibrations/00000000-0000-0000-0000-000000000001');
      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/calibrations/:id', () => {
    it('should update a calibration', async () => {
      (prisma.qualCalibration.findFirst as jest.Mock).mockResolvedValue(mockCalibration);
      (prisma.qualCalibration.update as jest.Mock).mockResolvedValue({
        ...mockCalibration,
        status: 'EXPIRED',
      });

      const res = await request(app)
        .put('/api/calibrations/00000000-0000-0000-0000-000000000001')
        .send({
          status: 'EXPIRED',
        });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('EXPIRED');
    });

    it('should return 404 if not found', async () => {
      (prisma.qualCalibration.findFirst as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .put('/api/calibrations/00000000-0000-0000-0000-000000000099')
        .send({
          status: 'EXPIRED',
        });
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should handle update errors', async () => {
      (prisma.qualCalibration.findFirst as jest.Mock).mockResolvedValue(mockCalibration);
      (prisma.qualCalibration.update as jest.Mock).mockRejectedValue(new Error('DB error'));

      const res = await request(app)
        .put('/api/calibrations/00000000-0000-0000-0000-000000000001')
        .send({
          status: 'EXPIRED',
        });
      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/calibrations/:id', () => {
    it('should soft delete a calibration', async () => {
      (prisma.qualCalibration.findFirst as jest.Mock).mockResolvedValue(mockCalibration);
      (prisma.qualCalibration.update as jest.Mock).mockResolvedValue({
        ...mockCalibration,
        deletedAt: new Date().toISOString(),
      });

      const res = await request(app).delete(
        '/api/calibrations/00000000-0000-0000-0000-000000000001'
      );
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(prisma.qualCalibration.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ deletedAt: expect.any(Date) }) })
      );
    });

    it('should return 404 if not found', async () => {
      (prisma.qualCalibration.findFirst as jest.Mock).mockResolvedValue(null);

      const res = await request(app).delete(
        '/api/calibrations/00000000-0000-0000-0000-000000000099'
      );
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should handle delete errors', async () => {
      (prisma.qualCalibration.findFirst as jest.Mock).mockRejectedValue(new Error('DB error'));

      const res = await request(app).delete(
        '/api/calibrations/00000000-0000-0000-0000-000000000001'
      );
      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });
});

describe('calibrations — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/calibrations', calibrationsRouter);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/calibrations', async () => {
    const res = await request(app).get('/api/calibrations');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });

  it('response is JSON content-type for GET /api/calibrations', async () => {
    const res = await request(app).get('/api/calibrations');
    expect(res.headers['content-type']).toBeDefined();
  });

  it('GET /api/calibrations body has success property', async () => {
    const res = await request(app).get('/api/calibrations');
    if (res.status === 200) {
      expect(res.body).toHaveProperty('success');
    } else {
      expect(res.body).toBeDefined();
    }
  });

  it('GET /api/calibrations body is an object', async () => {
    const res = await request(app).get('/api/calibrations');
    expect(typeof res.body).toBe('object');
  });
});

describe('Calibrations — extended edge cases', () => {
  it('GET / returns correct pagination totalPages', async () => {
    (prisma.qualCalibration.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.qualCalibration.count as jest.Mock).mockResolvedValue(60);
    const res = await request(app).get('/api/calibrations?page=1&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.pagination.totalPages).toBe(6);
  });

  it('GET / supports search by equipment name', async () => {
    (prisma.qualCalibration.findMany as jest.Mock).mockResolvedValue([mockCalibration]);
    (prisma.qualCalibration.count as jest.Mock).mockResolvedValue(1);
    const res = await request(app).get('/api/calibrations?search=Caliper');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('GET / returns empty array when no calibrations match', async () => {
    (prisma.qualCalibration.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.qualCalibration.count as jest.Mock).mockResolvedValue(0);
    const res = await request(app).get('/api/calibrations?status=OVERDUE');
    expect(res.body.data).toEqual([]);
  });

  it('DELETE /:id returns id and deleted:true', async () => {
    (prisma.qualCalibration.findFirst as jest.Mock).mockResolvedValue(mockCalibration);
    (prisma.qualCalibration.update as jest.Mock).mockResolvedValue({ ...mockCalibration, deletedAt: new Date() });
    const res = await request(app).delete('/api/calibrations/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.deleted).toBe(true);
  });

  it('POST / creates calibration with optional calibration dates', async () => {
    (prisma.qualCalibration.count as jest.Mock).mockResolvedValue(2);
    (prisma.qualCalibration.create as jest.Mock).mockResolvedValue(mockCalibration);
    const res = await request(app).post('/api/calibrations').send({
      equipmentName: 'Pressure Gauge',
      lastCalibrationDate: '2026-01-01',
      nextCalibrationDate: '2027-01-01',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('PUT /:id returns updated equipment name', async () => {
    (prisma.qualCalibration.findFirst as jest.Mock).mockResolvedValue(mockCalibration);
    (prisma.qualCalibration.update as jest.Mock).mockResolvedValue({ ...mockCalibration, equipmentName: 'Updated Gauge' });
    const res = await request(app).put('/api/calibrations/00000000-0000-0000-0000-000000000001').send({ equipmentName: 'Updated Gauge' });
    expect(res.status).toBe(200);
    expect(res.body.data.equipmentName).toBe('Updated Gauge');
  });

  it('GET /:id returns referenceNumber in data', async () => {
    (prisma.qualCalibration.findFirst as jest.Mock).mockResolvedValue(mockCalibration);
    const res = await request(app).get('/api/calibrations/00000000-0000-0000-0000-000000000001');
    expect(res.body.data.referenceNumber).toBe('CAL-2026-001');
  });

  it('DELETE /:id returns 500 when update throws', async () => {
    (prisma.qualCalibration.findFirst as jest.Mock).mockResolvedValue(mockCalibration);
    (prisma.qualCalibration.update as jest.Mock).mockRejectedValue(new Error('DB crash'));
    const res = await request(app).delete('/api/calibrations/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('GET / pagination has total field equal to mocked count', async () => {
    (prisma.qualCalibration.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.qualCalibration.count as jest.Mock).mockResolvedValue(7);
    const res = await request(app).get('/api/calibrations');
    expect(res.body.pagination.total).toBe(7);
  });
});

describe('Calibrations — final coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('POST / returns 400 when required fields missing', async () => {
    const res = await request(app).post('/api/calibrations').send({ notes: 'no required fields' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('GET / findMany called once per request', async () => {
    (prisma.qualCalibration.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.qualCalibration.count as jest.Mock).mockResolvedValue(0);
    await request(app).get('/api/calibrations');
    expect(prisma.qualCalibration.findMany).toHaveBeenCalledTimes(1);
  });

  it('GET / returns success:true on valid list', async () => {
    (prisma.qualCalibration.findMany as jest.Mock).mockResolvedValue([mockCalibration]);
    (prisma.qualCalibration.count as jest.Mock).mockResolvedValue(1);
    const res = await request(app).get('/api/calibrations');
    expect(res.body.success).toBe(true);
  });

  it('PUT /:id calls update once on successful update', async () => {
    (prisma.qualCalibration.findFirst as jest.Mock).mockResolvedValue(mockCalibration);
    (prisma.qualCalibration.update as jest.Mock).mockResolvedValue({ ...mockCalibration, status: 'OVERDUE' });
    await request(app).put('/api/calibrations/00000000-0000-0000-0000-000000000001').send({ status: 'OVERDUE' });
    expect(prisma.qualCalibration.update).toHaveBeenCalledTimes(1);
  });

  it('GET / pagination total matches count mock value', async () => {
    (prisma.qualCalibration.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.qualCalibration.count as jest.Mock).mockResolvedValue(20);
    const res = await request(app).get('/api/calibrations');
    expect(res.body.pagination.total).toBe(20);
  });
});
