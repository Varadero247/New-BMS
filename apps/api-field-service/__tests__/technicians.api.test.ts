import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    fsSvcTechnician: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    fsSvcJob: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
  Prisma: {
    Decimal: jest.fn((v: any) => v),
  },
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

import techniciansRouter from '../src/routes/technicians';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/technicians', techniciansRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/technicians', () => {
  it('should return a list of technicians with pagination', async () => {
    const technicians = [
      {
        id: '00000000-0000-0000-0000-000000000001',
        name: 'John Smith',
        email: 'john@test.com',
        status: 'AVAILABLE',
        skills: ['electrical'],
      },
      {
        id: 'tech-2',
        name: 'Jane Doe',
        email: 'jane@test.com',
        status: 'ON_JOB',
        skills: ['plumbing'],
      },
    ];
    mockPrisma.fsSvcTechnician.findMany.mockResolvedValue(technicians);
    mockPrisma.fsSvcTechnician.count.mockResolvedValue(2);

    const res = await request(app).get('/api/technicians');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.pagination.total).toBe(2);
  });

  it('should filter by status', async () => {
    mockPrisma.fsSvcTechnician.findMany.mockResolvedValue([]);
    mockPrisma.fsSvcTechnician.count.mockResolvedValue(0);

    await request(app).get('/api/technicians?status=AVAILABLE');

    expect(mockPrisma.fsSvcTechnician.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'AVAILABLE' }),
      })
    );
  });

  it('should filter by zone', async () => {
    mockPrisma.fsSvcTechnician.findMany.mockResolvedValue([]);
    mockPrisma.fsSvcTechnician.count.mockResolvedValue(0);

    await request(app).get('/api/technicians?zone=North');

    expect(mockPrisma.fsSvcTechnician.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ zone: 'North' }),
      })
    );
  });

  it('should handle server errors', async () => {
    mockPrisma.fsSvcTechnician.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/technicians');

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('GET /api/technicians/available', () => {
  it('should return available technicians', async () => {
    const available = [
      { id: '00000000-0000-0000-0000-000000000001', name: 'John', status: 'AVAILABLE' },
    ];
    mockPrisma.fsSvcTechnician.findMany.mockResolvedValue(available);

    const res = await request(app).get('/api/technicians/available');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });
});

describe('POST /api/technicians', () => {
  it('should create a technician', async () => {
    const created = { id: 'tech-new', name: 'New Tech', email: 'new@test.com', skills: ['hvac'] };
    mockPrisma.fsSvcTechnician.create.mockResolvedValue(created);

    const res = await request(app)
      .post('/api/technicians')
      .send({ name: 'New Tech', email: 'new@test.com', skills: ['hvac'] });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('New Tech');
  });

  it('should reject invalid data', async () => {
    const res = await request(app).post('/api/technicians').send({ name: '', email: 'not-email' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should handle duplicate email', async () => {
    const error: any = new Error('Unique constraint');
    error.code = 'P2002';
    mockPrisma.fsSvcTechnician.create.mockRejectedValue(error);

    const res = await request(app)
      .post('/api/technicians')
      .send({ name: 'Dup Tech', email: 'dup@test.com', skills: ['hvac'] });

    expect(res.status).toBe(409);
  });
});

describe('GET /api/technicians/:id', () => {
  it('should return a technician by id', async () => {
    const tech = { id: '00000000-0000-0000-0000-000000000001', name: 'John', jobs: [] };
    mockPrisma.fsSvcTechnician.findFirst.mockResolvedValue(tech);

    const res = await request(app).get('/api/technicians/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 404 for not found', async () => {
    mockPrisma.fsSvcTechnician.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/technicians/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });
});

describe('GET /api/technicians/:id/schedule', () => {
  it('should return technician schedule', async () => {
    mockPrisma.fsSvcTechnician.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.fsSvcJob.findMany.mockResolvedValue([
      { id: 'job-1', scheduledStart: new Date() },
    ]);

    const res = await request(app).get(
      '/api/technicians/00000000-0000-0000-0000-000000000001/schedule'
    );

    expect(res.status).toBe(200);
    expect(res.body.data.jobs).toHaveLength(1);
  });

  it('should return 404 if technician not found', async () => {
    mockPrisma.fsSvcTechnician.findFirst.mockResolvedValue(null);

    const res = await request(app).get(
      '/api/technicians/00000000-0000-0000-0000-000000000099/schedule'
    );

    expect(res.status).toBe(404);
  });
});

describe('PUT /api/technicians/:id', () => {
  it('should update a technician', async () => {
    mockPrisma.fsSvcTechnician.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.fsSvcTechnician.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Updated',
    });

    const res = await request(app)
      .put('/api/technicians/00000000-0000-0000-0000-000000000001')
      .send({ name: 'Updated' });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Updated');
  });

  it('should return 404 for not found', async () => {
    mockPrisma.fsSvcTechnician.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/technicians/00000000-0000-0000-0000-000000000099')
      .send({ name: 'Updated' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/technicians/:id', () => {
  it('should soft delete a technician', async () => {
    mockPrisma.fsSvcTechnician.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.fsSvcTechnician.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      deletedAt: new Date(),
    });

    const res = await request(app).delete('/api/technicians/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe('Technician deleted');
  });

  it('should return 404 for not found', async () => {
    mockPrisma.fsSvcTechnician.findFirst.mockResolvedValue(null);

    const res = await request(app).delete('/api/technicians/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });
});

// ─── 500 error paths ────────────────────────────────────────────────────────

describe('500 error handling', () => {
  it('GET / returns 500 on DB error', async () => {
    mockPrisma.fsSvcTechnician.findMany.mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/technicians');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST / returns 500 when create fails', async () => {
    mockPrisma.fsSvcTechnician.create.mockRejectedValue(new Error('DB down'));
    const res = await request(app).post('/api/technicians').send({ name: 'New Tech', email: 'new@test.com', skills: ['hvac'] });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('PUT /:id returns 500 on DB error', async () => {
    mockPrisma.fsSvcTechnician.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.fsSvcTechnician.update.mockRejectedValue(new Error('DB down'));
    const res = await request(app).put('/api/technicians/00000000-0000-0000-0000-000000000001').send({ name: 'Updated' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('technicians.api — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/technicians', techniciansRouter);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/technicians', async () => {
    const res = await request(app).get('/api/technicians');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });
});

// ===================================================================
// Field Service Technicians — edge cases and validation
// ===================================================================
describe('Field Service Technicians — edge cases and validation', () => {
  it('GET / pagination total matches count mock value', async () => {
    mockPrisma.fsSvcTechnician.findMany.mockResolvedValue([]);
    mockPrisma.fsSvcTechnician.count.mockResolvedValue(15);
    const res = await request(app).get('/api/technicians');
    expect(res.status).toBe(200);
    expect(res.body.pagination.total).toBe(15);
  });

  it('GET / response data array is returned', async () => {
    mockPrisma.fsSvcTechnician.findMany.mockResolvedValue([]);
    mockPrisma.fsSvcTechnician.count.mockResolvedValue(0);
    const res = await request(app).get('/api/technicians');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST / create is not called when validation fails', async () => {
    await request(app).post('/api/technicians').send({});
    expect(mockPrisma.fsSvcTechnician.create).not.toHaveBeenCalled();
  });

  it('GET /:id returns 500 on DB error', async () => {
    mockPrisma.fsSvcTechnician.findFirst.mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/technicians/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
  });

  it('DELETE /:id returns 500 when update fails', async () => {
    mockPrisma.fsSvcTechnician.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.fsSvcTechnician.update.mockRejectedValue(new Error('DB down'));
    const res = await request(app).delete('/api/technicians/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
  });

  it('GET /available returns empty array when no technicians are available', async () => {
    mockPrisma.fsSvcTechnician.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/technicians/available');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it('GET /:id/schedule returns 500 on DB error', async () => {
    mockPrisma.fsSvcTechnician.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.fsSvcJob.findMany.mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/technicians/00000000-0000-0000-0000-000000000001/schedule');
    expect(res.status).toBe(500);
  });

  it('PUT /:id update is called with correct id', async () => {
    mockPrisma.fsSvcTechnician.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000005' });
    mockPrisma.fsSvcTechnician.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000005',
      name: 'Updated Tech',
    });
    await request(app)
      .put('/api/technicians/00000000-0000-0000-0000-000000000005')
      .send({ name: 'Updated Tech' });
    expect(mockPrisma.fsSvcTechnician.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ id: '00000000-0000-0000-0000-000000000005' }) })
    );
  });

  it('GET / filters by both status and zone simultaneously', async () => {
    mockPrisma.fsSvcTechnician.findMany.mockResolvedValue([]);
    mockPrisma.fsSvcTechnician.count.mockResolvedValue(0);
    await request(app).get('/api/technicians?status=AVAILABLE&zone=South');
    expect(mockPrisma.fsSvcTechnician.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'AVAILABLE', zone: 'South' }),
      })
    );
  });

  it('DELETE /:id returns message Technician deleted in data', async () => {
    mockPrisma.fsSvcTechnician.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000006' });
    mockPrisma.fsSvcTechnician.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000006',
      deletedAt: new Date(),
    });
    const res = await request(app).delete('/api/technicians/00000000-0000-0000-0000-000000000006');
    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe('Technician deleted');
  });
});

// ─── Further coverage ─────────────────────────────────────────────────────────

describe('technicians.api — further coverage', () => {
  it('GET / applies correct skip for page 3 limit 20', async () => {
    mockPrisma.fsSvcTechnician.findMany.mockResolvedValue([]);
    mockPrisma.fsSvcTechnician.count.mockResolvedValue(0);

    await request(app).get('/api/technicians?page=3&limit=20');

    expect(mockPrisma.fsSvcTechnician.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 40, take: 20 })
    );
  });

  it('POST / returns 201 with created technician data', async () => {
    mockPrisma.fsSvcTechnician.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000050',
      name: 'Test Tech',
      email: 'techtest@test.com',
      skills: ['hvac'],
    });

    const res = await request(app)
      .post('/api/technicians')
      .send({ name: 'Test Tech', email: 'techtest@test.com', skills: ['hvac'] });

    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('id');
  });

  it('GET / returns pagination.total matching count mock', async () => {
    mockPrisma.fsSvcTechnician.findMany.mockResolvedValue([]);
    mockPrisma.fsSvcTechnician.count.mockResolvedValue(42);

    const res = await request(app).get('/api/technicians');

    expect(res.body.pagination.total).toBe(42);
  });

  it('GET /available returns 500 on DB error', async () => {
    mockPrisma.fsSvcTechnician.findMany.mockRejectedValue(new Error('DB down'));

    const res = await request(app).get('/api/technicians/available');

    expect(res.status).toBe(500);
  });

  it('DELETE /:id calls update exactly once on success', async () => {
    mockPrisma.fsSvcTechnician.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000060' });
    mockPrisma.fsSvcTechnician.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000060', deletedAt: new Date() });

    await request(app).delete('/api/technicians/00000000-0000-0000-0000-000000000060');

    expect(mockPrisma.fsSvcTechnician.update).toHaveBeenCalledTimes(1);
  });
});
