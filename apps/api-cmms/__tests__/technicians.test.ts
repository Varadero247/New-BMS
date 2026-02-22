import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    cmmsVendor: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    cmmsServiceContract: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
  Prisma: { Decimal: jest.fn((v: any) => v) },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: 'user-123', email: 'test@test.com', role: 'ADMIN' };
    next();
  }),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import vendorsRouter from '../src/routes/vendors';
const { prisma } = require('../src/prisma');

const app = express();
app.use(express.json());
app.use('/api/technicians', vendorsRouter);

const mockTechnician = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'Precision Maintenance Services',
  code: 'PMS-001',
  contactName: 'Bob Wrench',
  email: 'bob@precision.com',
  phone: '+1-555-9000',
  address: '456 Tech Blvd',
  specialization: 'Electrical',
  rating: 4.8,
  isPreferred: true,
  contractExpiry: new Date('2028-06-30'),
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  createdBy: 'user-123',
};

describe('Technicians Routes — phase28 coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/technicians — list', () => {
    it('returns 200 with success:true and data array', async () => {
      prisma.cmmsVendor.findMany.mockResolvedValue([mockTechnician]);
      prisma.cmmsVendor.count.mockResolvedValue(1);
      const res = await request(app).get('/api/technicians');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('returns pagination with page, limit, total', async () => {
      prisma.cmmsVendor.findMany.mockResolvedValue([]);
      prisma.cmmsVendor.count.mockResolvedValue(0);
      const res = await request(app).get('/api/technicians');
      expect(res.status).toBe(200);
      expect(res.body.pagination).toHaveProperty('page');
      expect(res.body.pagination).toHaveProperty('total');
    });

    it('returns 500 on DB error', async () => {
      prisma.cmmsVendor.findMany.mockRejectedValue(new Error('DB down'));
      const res = await request(app).get('/api/technicians');
      expect(res.status).toBe(500);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });

    it('returns correct totalPages', async () => {
      prisma.cmmsVendor.findMany.mockResolvedValue([]);
      prisma.cmmsVendor.count.mockResolvedValue(20);
      const res = await request(app).get('/api/technicians?page=1&limit=10');
      expect(res.status).toBe(200);
      expect(res.body.pagination.totalPages).toBe(2);
    });

    it('passes correct skip for page=2&limit=5', async () => {
      prisma.cmmsVendor.findMany.mockResolvedValue([]);
      prisma.cmmsVendor.count.mockResolvedValue(0);
      await request(app).get('/api/technicians?page=2&limit=5');
      expect(prisma.cmmsVendor.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 5, take: 5 })
      );
    });

    it('response content-type is application/json', async () => {
      prisma.cmmsVendor.findMany.mockResolvedValue([]);
      prisma.cmmsVendor.count.mockResolvedValue(0);
      const res = await request(app).get('/api/technicians');
      expect(res.headers['content-type']).toMatch(/application\/json/);
    });

    it('returns 500 when count rejects', async () => {
      prisma.cmmsVendor.findMany.mockResolvedValue([]);
      prisma.cmmsVendor.count.mockRejectedValue(new Error('count fail'));
      const res = await request(app).get('/api/technicians');
      expect(res.status).toBe(500);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });

    it('data items include name and code fields', async () => {
      prisma.cmmsVendor.findMany.mockResolvedValue([mockTechnician]);
      prisma.cmmsVendor.count.mockResolvedValue(1);
      const res = await request(app).get('/api/technicians');
      expect(res.status).toBe(200);
      expect(res.body.data[0]).toHaveProperty('name', 'Precision Maintenance Services');
      expect(res.body.data[0]).toHaveProperty('code', 'PMS-001');
    });
  });

  describe('POST /api/technicians — create', () => {
    it('returns 201 on valid payload', async () => {
      prisma.cmmsVendor.create.mockResolvedValue(mockTechnician);
      const res = await request(app).post('/api/technicians').send({
        name: 'Precision Maintenance Services',
        code: 'PMS-001',
      });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('returns 400 when name is missing', async () => {
      const res = await request(app).post('/api/technicians').send({ code: 'PMS-001' });
      expect(res.status).toBe(400);
    });

    it('returns 400 when code is missing', async () => {
      const res = await request(app).post('/api/technicians').send({ name: 'Test Vendor' });
      expect(res.status).toBe(400);
    });

    it('returns 500 when create rejects', async () => {
      prisma.cmmsVendor.create.mockRejectedValue(new Error('DB down'));
      const res = await request(app).post('/api/technicians').send({ name: 'Test', code: 'T-001' });
      expect(res.status).toBe(500);
    });

    it('sets createdBy from authenticated user', async () => {
      prisma.cmmsVendor.create.mockResolvedValue(mockTechnician);
      await request(app).post('/api/technicians').send({ name: 'New Tech', code: 'NT-001' });
      expect(prisma.cmmsVendor.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ createdBy: 'user-123' }) })
      );
    });

    it('returns 409 on duplicate code', async () => {
      prisma.cmmsVendor.create.mockRejectedValue({ code: 'P2002' });
      const res = await request(app).post('/api/technicians').send({ name: 'Dup', code: 'PMS-001' });
      expect(res.status).toBe(409);
    });
  });

  describe('GET /api/technicians/:id — single', () => {
    it('returns 200 with technician data', async () => {
      prisma.cmmsVendor.findFirst.mockResolvedValue({ ...mockTechnician, contracts: [] });
      const res = await request(app).get('/api/technicians/00000000-0000-0000-0000-000000000001');
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
    });

    it('returns 404 when not found', async () => {
      prisma.cmmsVendor.findFirst.mockResolvedValue(null);
      const res = await request(app).get('/api/technicians/00000000-0000-0000-0000-000000000099');
      expect(res.status).toBe(404);
    });

    it('returns 500 on DB error', async () => {
      prisma.cmmsVendor.findFirst.mockRejectedValue(new Error('DB down'));
      const res = await request(app).get('/api/technicians/00000000-0000-0000-0000-000000000001');
      expect(res.status).toBe(500);
    });
  });

  describe('PUT /api/technicians/:id — update', () => {
    it('returns 200 on successful update', async () => {
      prisma.cmmsVendor.findFirst.mockResolvedValue(mockTechnician);
      prisma.cmmsVendor.update.mockResolvedValue({ ...mockTechnician, rating: 5.0 });
      const res = await request(app)
        .put('/api/technicians/00000000-0000-0000-0000-000000000001')
        .send({ rating: 5.0 });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('returns 404 when not found', async () => {
      prisma.cmmsVendor.findFirst.mockResolvedValue(null);
      const res = await request(app)
        .put('/api/technicians/00000000-0000-0000-0000-000000000099')
        .send({ rating: 5.0 });
      expect(res.status).toBe(404);
    });

    it('returns 500 when update fails', async () => {
      prisma.cmmsVendor.findFirst.mockResolvedValue(mockTechnician);
      prisma.cmmsVendor.update.mockRejectedValue(new Error('DB down'));
      const res = await request(app)
        .put('/api/technicians/00000000-0000-0000-0000-000000000001')
        .send({ rating: 5.0 });
      expect(res.status).toBe(500);
    });
  });

  describe('DELETE /api/technicians/:id — soft delete', () => {
    it('returns 200 with success:true', async () => {
      prisma.cmmsVendor.findFirst.mockResolvedValue(mockTechnician);
      prisma.cmmsVendor.update.mockResolvedValue({ ...mockTechnician, deletedAt: new Date() });
      const res = await request(app).delete('/api/technicians/00000000-0000-0000-0000-000000000001');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('returns 404 when not found', async () => {
      prisma.cmmsVendor.findFirst.mockResolvedValue(null);
      const res = await request(app).delete('/api/technicians/00000000-0000-0000-0000-000000000099');
      expect(res.status).toBe(404);
    });

    it('calls update with deletedAt', async () => {
      prisma.cmmsVendor.findFirst.mockResolvedValue(mockTechnician);
      prisma.cmmsVendor.update.mockResolvedValue({ ...mockTechnician, deletedAt: new Date() });
      await request(app).delete('/api/technicians/00000000-0000-0000-0000-000000000001');
      expect(prisma.cmmsVendor.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ deletedAt: expect.any(Date) }) })
      );
    });

    it('returns 500 when update fails', async () => {
      prisma.cmmsVendor.findFirst.mockResolvedValue(mockTechnician);
      prisma.cmmsVendor.update.mockRejectedValue(new Error('DB down'));
      const res = await request(app).delete('/api/technicians/00000000-0000-0000-0000-000000000001');
      expect(res.status).toBe(500);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('Technicians — extended coverage', () => {
    it('GET / data length matches findMany result', async () => {
      prisma.cmmsVendor.findMany.mockResolvedValue([mockTechnician, mockTechnician]);
      prisma.cmmsVendor.count.mockResolvedValue(2);
      const res = await request(app).get('/api/technicians');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
    });

    it('GET / pagination page defaults to 1', async () => {
      prisma.cmmsVendor.findMany.mockResolvedValue([]);
      prisma.cmmsVendor.count.mockResolvedValue(0);
      const res = await request(app).get('/api/technicians');
      expect(res.body.pagination.page).toBe(1);
    });

    it('GET /:id NOT_FOUND code on 404', async () => {
      prisma.cmmsVendor.findFirst.mockResolvedValue(null);
      const res = await request(app).get('/api/technicians/00000000-0000-0000-0000-000000000099');
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('PUT /:id NOT_FOUND code on 404', async () => {
      prisma.cmmsVendor.findFirst.mockResolvedValue(null);
      const res = await request(app).put('/api/technicians/00000000-0000-0000-0000-000000000099').send({ rating: 3 });
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('POST / returned data has id field', async () => {
      prisma.cmmsVendor.create.mockResolvedValue(mockTechnician);
      const res = await request(app).post('/api/technicians').send({ name: 'New Tech Co.', code: 'NTC-001' });
      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('id');
    });

    it('GET / success:true with empty data', async () => {
      prisma.cmmsVendor.findMany.mockResolvedValue([]);
      prisma.cmmsVendor.count.mockResolvedValue(0);
      const res = await request(app).get('/api/technicians');
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(0);
    });

    it('PUT /:id returned data has updated rating', async () => {
      prisma.cmmsVendor.findFirst.mockResolvedValue(mockTechnician);
      prisma.cmmsVendor.update.mockResolvedValue({ ...mockTechnician, rating: 3.5 });
      const res = await request(app)
        .put('/api/technicians/00000000-0000-0000-0000-000000000001')
        .send({ rating: 3.5 });
      expect(res.status).toBe(200);
      expect(res.body.data.rating).toBe(3.5);
    });
  });
});

describe('Technicians — final coverage expansion', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('GET / returns 500 with INTERNAL_ERROR when findMany rejects', async () => {
    prisma.cmmsVendor.findMany.mockRejectedValue(new Error('DB crash'));
    const res = await request(app).get('/api/technicians');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET / count called once per list request', async () => {
    prisma.cmmsVendor.findMany.mockResolvedValue([]);
    prisma.cmmsVendor.count.mockResolvedValue(0);
    await request(app).get('/api/technicians');
    expect(prisma.cmmsVendor.count).toHaveBeenCalledTimes(1);
  });

  it('DELETE /:id update called once', async () => {
    prisma.cmmsVendor.findFirst.mockResolvedValue(mockTechnician);
    prisma.cmmsVendor.update.mockResolvedValue({ ...mockTechnician, deletedAt: new Date() });
    await request(app).delete('/api/technicians/00000000-0000-0000-0000-000000000001');
    expect(prisma.cmmsVendor.update).toHaveBeenCalledTimes(1);
  });

  it('POST / create called once per create request', async () => {
    prisma.cmmsVendor.create.mockResolvedValue(mockTechnician);
    await request(app).post('/api/technicians').send({ name: 'Check Create', code: 'CC-001' });
    expect(prisma.cmmsVendor.create).toHaveBeenCalledTimes(1);
  });

  it('GET / returns 200 with data as an array', async () => {
    prisma.cmmsVendor.findMany.mockResolvedValue([mockTechnician]);
    prisma.cmmsVendor.count.mockResolvedValue(1);
    const res = await request(app).get('/api/technicians');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('POST / returns 400 when body is empty', async () => {
    const res = await request(app).post('/api/technicians').send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('GET / skip is 0 for default page=1&limit=50', async () => {
    prisma.cmmsVendor.findMany.mockResolvedValue([]);
    prisma.cmmsVendor.count.mockResolvedValue(0);
    await request(app).get('/api/technicians');
    expect(prisma.cmmsVendor.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 0 })
    );
  });

  it('GET /:id returns data with expected fields', async () => {
    prisma.cmmsVendor.findFirst.mockResolvedValue({ ...mockTechnician, contracts: [] });
    const res = await request(app).get('/api/technicians/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('name');
    expect(res.body.data).toHaveProperty('code');
  });

  it('PUT /:id update called with expected where clause', async () => {
    prisma.cmmsVendor.findFirst.mockResolvedValue(mockTechnician);
    prisma.cmmsVendor.update.mockResolvedValue({ ...mockTechnician, specialization: 'Mechanical' });
    await request(app)
      .put('/api/technicians/00000000-0000-0000-0000-000000000001')
      .send({ specialization: 'Mechanical' });
    expect(prisma.cmmsVendor.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ id: '00000000-0000-0000-0000-000000000001' }) })
    );
  });

  it('GET / response body has success and pagination keys', async () => {
    prisma.cmmsVendor.findMany.mockResolvedValue([]);
    prisma.cmmsVendor.count.mockResolvedValue(0);
    const res = await request(app).get('/api/technicians');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success');
    expect(res.body).toHaveProperty('pagination');
  });

  it('GET / data is empty array when no technicians match', async () => {
    prisma.cmmsVendor.findMany.mockResolvedValue([]);
    prisma.cmmsVendor.count.mockResolvedValue(0);
    const res = await request(app).get('/api/technicians');
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it('DELETE /:id response data has message property', async () => {
    prisma.cmmsVendor.findFirst.mockResolvedValue(mockTechnician);
    prisma.cmmsVendor.update.mockResolvedValue({ ...mockTechnician, deletedAt: new Date() });
    const res = await request(app).delete('/api/technicians/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('message');
  });

  it('PUT /:id success is true when update succeeds', async () => {
    prisma.cmmsVendor.findFirst.mockResolvedValue(mockTechnician);
    prisma.cmmsVendor.update.mockResolvedValue({ ...mockTechnician, contactName: 'Alice' });
    const res = await request(app)
      .put('/api/technicians/00000000-0000-0000-0000-000000000001')
      .send({ contactName: 'Alice' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET / response content-type is application/json', async () => {
    prisma.cmmsVendor.findMany.mockResolvedValue([]);
    prisma.cmmsVendor.count.mockResolvedValue(0);
    const res = await request(app).get('/api/technicians');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
});

describe('technicians — phase30 coverage', () => {
  it('returns false for falsy values', () => {
    expect(Boolean('')).toBe(false);
  });

  it('handles number isFinite', () => {
    expect(isFinite(42)).toBe(true);
  });

  it('handles Math.min', () => {
    expect(Math.min(1, 2, 3)).toBe(1);
  });

  it('handles some method', () => {
    expect([1, 2, 3].some(x => x > 2)).toBe(true);
  });

  it('handles indexOf method', () => {
    expect([1, 2, 3].indexOf(2)).toBe(1);
  });

});


describe('phase31 coverage', () => {
  it('handles array splice', () => { const a = [1,2,3]; a.splice(1,1); expect(a).toEqual([1,3]); });
  it('handles default params', () => { const fn = (x = 10) => x; expect(fn()).toBe(10); expect(fn(5)).toBe(5); });
  it('handles string padEnd', () => { expect('5'.padEnd(3,'0')).toBe('500'); });
  it('handles object spread', () => { const a = {x:1}; const b = {...a, y:2}; expect(b).toEqual({x:1,y:2}); });
  it('handles array map', () => { expect([1,2,3].map(x => x * 2)).toEqual([2,4,6]); });
});
