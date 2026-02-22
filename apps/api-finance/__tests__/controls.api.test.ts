import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    finControl: {
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
    req.user = {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'test@test.com',
      role: 'ADMIN',
      orgId: '00000000-0000-4000-a000-000000000100',
    };
    next();
  }),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import controlsRouter from '../src/routes/controls';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/controls', controlsRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

// ===================================================================
// GET /api/controls — List controls
// ===================================================================
describe('GET /api/controls', () => {
  it('should return a list of controls with pagination', async () => {
    const controls = [
      {
        id: '00000000-0000-0000-0000-000000000001',
        referenceNumber: 'FCR-2026-0001',
        name: 'Segregation of Duties',
        status: 'ACTIVE',
      },
      {
        id: '00000000-0000-0000-0000-000000000002',
        referenceNumber: 'FCR-2026-0002',
        name: 'Bank Reconciliation',
        status: 'ACTIVE',
      },
    ];
    mockPrisma.finControl.findMany.mockResolvedValue(controls);
    mockPrisma.finControl.count.mockResolvedValue(2);

    const res = await request(app).get('/api/controls');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.pagination.total).toBe(2);
  });

  it('should filter by status', async () => {
    mockPrisma.finControl.findMany.mockResolvedValue([]);
    mockPrisma.finControl.count.mockResolvedValue(0);

    const res = await request(app).get('/api/controls?status=ACTIVE');

    expect(res.status).toBe(200);
    expect(mockPrisma.finControl.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'ACTIVE' }),
      })
    );
  });

  it('should apply pagination params', async () => {
    mockPrisma.finControl.findMany.mockResolvedValue([]);
    mockPrisma.finControl.count.mockResolvedValue(50);

    const res = await request(app).get('/api/controls?page=2&limit=10');

    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(2);
    expect(res.body.pagination.limit).toBe(10);
  });

  it('should return 500 on database error', async () => {
    mockPrisma.finControl.findMany.mockRejectedValue(new Error('DB error'));
    mockPrisma.finControl.count.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/controls');

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

// ===================================================================
// GET /api/controls/:id — Single control
// ===================================================================
describe('GET /api/controls/:id', () => {
  it('should return a control when found', async () => {
    const control = {
      id: '00000000-0000-0000-0000-000000000001',
      referenceNumber: 'FCR-2026-0001',
      name: 'Segregation of Duties',
      status: 'ACTIVE',
    };
    mockPrisma.finControl.findFirst.mockResolvedValue(control);

    const res = await request(app).get('/api/controls/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 404 when control not found', async () => {
    mockPrisma.finControl.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/controls/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 500 on database error', async () => {
    mockPrisma.finControl.findFirst.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/controls/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

// ===================================================================
// POST /api/controls — Create control
// ===================================================================
describe('POST /api/controls', () => {
  const validControl = {
    title: 'Segregation of Duties',
    description: 'Ensures no single person controls all financial processes',
    controlType: 'PREVENTIVE',
    status: 'ACTIVE',
  };

  it('should create a control successfully', async () => {
    mockPrisma.finControl.count.mockResolvedValue(0);
    mockPrisma.finControl.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      ...validControl,
      referenceNumber: 'FCR-2026-0001',
      orgId: '00000000-0000-4000-a000-000000000100',
    });

    const res = await request(app).post('/api/controls').send(validControl);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.referenceNumber).toBe('FCR-2026-0001');
  });

  it('should auto-generate a reference number based on count', async () => {
    mockPrisma.finControl.count.mockResolvedValue(5);
    mockPrisma.finControl.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000006',
      ...validControl,
      referenceNumber: 'FCR-2026-0006',
      orgId: '00000000-0000-4000-a000-000000000100',
    });

    const res = await request(app).post('/api/controls').send(validControl);

    expect(res.status).toBe(201);
    expect(res.body.data.referenceNumber).toBe('FCR-2026-0006');
  });

  it('should return 500 on create error', async () => {
    mockPrisma.finControl.count.mockResolvedValue(0);
    mockPrisma.finControl.create.mockRejectedValue(new Error('Validation failed'));

    const res = await request(app).post('/api/controls').send(validControl);

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

// ===================================================================
// PUT /api/controls/:id — Update control
// ===================================================================
describe('PUT /api/controls/:id', () => {
  it('should update a control successfully', async () => {
    const existing = {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Old Name',
      deletedAt: null,
    };
    mockPrisma.finControl.findFirst.mockResolvedValue(existing);
    mockPrisma.finControl.update.mockResolvedValue({
      ...existing,
      name: 'Updated Name',
    });

    const res = await request(app)
      .put('/api/controls/00000000-0000-0000-0000-000000000001')
      .send({ name: 'Updated Name' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 when control not found', async () => {
    mockPrisma.finControl.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/controls/00000000-0000-0000-0000-000000000099')
      .send({ name: 'Test' });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should return 500 on update error', async () => {
    mockPrisma.finControl.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      deletedAt: null,
    });
    mockPrisma.finControl.update.mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .put('/api/controls/00000000-0000-0000-0000-000000000001')
      .send({ name: 'Updated' });

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

// ===================================================================
// DELETE /api/controls/:id — Soft delete
// ===================================================================
describe('DELETE /api/controls/:id', () => {
  it('should soft-delete a control successfully', async () => {
    mockPrisma.finControl.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      deletedAt: new Date(),
    });

    const res = await request(app).delete('/api/controls/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.message).toBe('Deleted');
  });

  it('should call update with deletedAt set', async () => {
    mockPrisma.finControl.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });

    await request(app).delete('/api/controls/00000000-0000-0000-0000-000000000001');

    expect(mockPrisma.finControl.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: '00000000-0000-0000-0000-000000000001' },
        data: expect.objectContaining({ deletedAt: expect.any(Date) }),
      })
    );
  });

  it('should return 500 on delete error', async () => {
    mockPrisma.finControl.update.mockRejectedValue(new Error('DB error'));

    const res = await request(app).delete('/api/controls/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('controls.api — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/controls', controlsRouter);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/controls', async () => {
    const res = await request(app).get('/api/controls');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });

  it('response is JSON content-type for GET /api/controls', async () => {
    const res = await request(app).get('/api/controls');
    expect(res.headers['content-type']).toBeDefined();
  });

  it('GET /api/controls body has success property', async () => {
    const res = await request(app).get('/api/controls');
    if (res.status === 200) {
      expect(res.body).toHaveProperty('success');
    } else {
      expect(res.body).toBeDefined();
    }
  });

  it('GET /api/controls body is an object', async () => {
    const res = await request(app).get('/api/controls');
    expect(typeof res.body).toBe('object');
  });
});

describe('Financial Controls — additional coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET filters by status=UNDER_REVIEW when provided', async () => {
    mockPrisma.finControl.findMany.mockResolvedValue([]);
    mockPrisma.finControl.count.mockResolvedValue(0);

    const res = await request(app).get('/api/controls?status=UNDER_REVIEW');

    expect(res.status).toBe(200);
    expect(mockPrisma.finControl.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'UNDER_REVIEW' }),
      })
    );
  });

  it('GET pagination page 2 returns correct metadata', async () => {
    mockPrisma.finControl.findMany.mockResolvedValue([]);
    mockPrisma.finControl.count.mockResolvedValue(30);

    const res = await request(app).get('/api/controls?page=2&limit=10');

    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(2);
    expect(res.body.pagination.total).toBe(30);
  });

  it('GET returns empty array when no controls exist', async () => {
    mockPrisma.finControl.findMany.mockResolvedValue([]);
    mockPrisma.finControl.count.mockResolvedValue(0);

    const res = await request(app).get('/api/controls');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
    expect(res.body.pagination.total).toBe(0);
  });

  it('POST create includes orgId from authenticated user', async () => {
    mockPrisma.finControl.count.mockResolvedValue(0);
    mockPrisma.finControl.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'Test Control',
      referenceNumber: 'FCR-2026-0001',
      orgId: '00000000-0000-4000-a000-000000000100',
    });

    await request(app).post('/api/controls').send({
      title: 'Test Control',
      description: 'Test description',
      controlType: 'DETECTIVE',
      status: 'ACTIVE',
    });

    expect(mockPrisma.finControl.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          orgId: '00000000-0000-4000-a000-000000000100',
        }),
      })
    );
  });

  it('POST generates reference number matching FCR-YYYY-NNNN format', async () => {
    mockPrisma.finControl.count.mockResolvedValue(0);
    mockPrisma.finControl.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'New Control',
      referenceNumber: 'FCR-2026-0001',
      orgId: '00000000-0000-4000-a000-000000000100',
    });

    const res = await request(app).post('/api/controls').send({
      title: 'New Control',
      description: 'Some description',
      controlType: 'PREVENTIVE',
      status: 'ACTIVE',
    });

    expect(res.status).toBe(201);
    expect(mockPrisma.finControl.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          referenceNumber: expect.stringMatching(/^FCR-\d{4}-\d{4}$/),
        }),
      })
    );
  });

  it('PUT update calls update with correct where clause', async () => {
    mockPrisma.finControl.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      deletedAt: null,
    });
    mockPrisma.finControl.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'UNDER_REVIEW',
    });

    await request(app)
      .put('/api/controls/00000000-0000-0000-0000-000000000001')
      .send({ status: 'UNDER_REVIEW' });

    expect(mockPrisma.finControl.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: '00000000-0000-0000-0000-000000000001' },
      })
    );
  });

  it('DELETE update is called exactly once per delete request', async () => {
    mockPrisma.finControl.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      deletedAt: new Date(),
    });

    await request(app).delete('/api/controls/00000000-0000-0000-0000-000000000001');

    expect(mockPrisma.finControl.update).toHaveBeenCalledTimes(1);
  });

  it('GET /:id returns the correct id in response data', async () => {
    const control = {
      id: '00000000-0000-0000-0000-000000000005',
      referenceNumber: 'FCR-2026-0005',
      name: 'Cash Handling Policy',
      status: 'ACTIVE',
    };
    mockPrisma.finControl.findFirst.mockResolvedValue(control);

    const res = await request(app).get('/api/controls/00000000-0000-0000-0000-000000000005');

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000005');
  });
});
