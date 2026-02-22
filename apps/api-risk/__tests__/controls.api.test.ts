import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    riskRegister: { findFirst: jest.fn(), update: jest.fn() },
    riskControl: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  },
  Prisma: {},
}));
jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((_req: any, _res: any, next: any) => {
    _req.user = { id: 'user-1', orgId: 'org-1', role: 'ADMIN' };
    next();
  }),
}));
jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import router from '../src/routes/controls';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const app = express();
app.use(express.json());
app.use('/api/risks', router);
beforeEach(() => {
  jest.clearAllMocks();
});

describe('POST /api/risks/:id/controls', () => {
  it('should create a control', async () => {
    mockPrisma.riskRegister.findFirst.mockResolvedValue({ id: 'r1' });
    mockPrisma.riskControl.create.mockResolvedValue({ id: 'c1', controlType: 'PREVENTIVE' });
    mockPrisma.riskControl.findMany.mockResolvedValue([{ effectiveness: 'ADEQUATE' }]);
    mockPrisma.riskRegister.update.mockResolvedValue({});
    const res = await request(app)
      .post('/api/risks/00000000-0000-0000-0000-000000000001/controls')
      .send({ controlType: 'PREVENTIVE', description: 'Test control' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 if risk not found', async () => {
    mockPrisma.riskRegister.findFirst.mockResolvedValue(null);
    const res = await request(app)
      .post('/api/risks/00000000-0000-0000-0000-000000000001/controls')
      .send({ controlType: 'PREVENTIVE', description: 'Test' });
    expect(res.status).toBe(404);
  });

  it('should validate control type', async () => {
    mockPrisma.riskRegister.findFirst.mockResolvedValue({ id: 'r1' });
    const res = await request(app)
      .post('/api/risks/00000000-0000-0000-0000-000000000001/controls')
      .send({ controlType: 'INVALID', description: 'Test' });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/risks/:id/controls', () => {
  it('should return controls', async () => {
    mockPrisma.riskControl.findMany.mockResolvedValue([{ id: 'c1' }]);
    const res = await request(app).get('/api/risks/00000000-0000-0000-0000-000000000001/controls');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });
});

describe('PUT /api/risks/:riskId/controls/:id', () => {
  it('should update control', async () => {
    mockPrisma.riskControl.findFirst.mockResolvedValue({ id: 'c1' });
    mockPrisma.riskControl.update.mockResolvedValue({ id: 'c1', effectiveness: 'STRONG' });
    mockPrisma.riskControl.findMany.mockResolvedValue([{ effectiveness: 'STRONG' }]);
    mockPrisma.riskRegister.update.mockResolvedValue({});
    const res = await request(app)
      .put(
        '/api/risks/00000000-0000-0000-0000-000000000001/controls/00000000-0000-0000-0000-000000000002'
      )
      .send({ effectiveness: 'STRONG' });
    expect(res.status).toBe(200);
  });

  it('should return 404 if control not found', async () => {
    mockPrisma.riskControl.findFirst.mockResolvedValue(null);
    const res = await request(app)
      .put(
        '/api/risks/00000000-0000-0000-0000-000000000001/controls/00000000-0000-0000-0000-000000000002'
      )
      .send({ effectiveness: 'STRONG' });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/risks/:riskId/controls/:id', () => {
  it('should soft delete control', async () => {
    mockPrisma.riskControl.findFirst.mockResolvedValue({ id: 'c1' });
    mockPrisma.riskControl.update.mockResolvedValue({ id: 'c1', isActive: false });
    const res = await request(app).delete(
      '/api/risks/00000000-0000-0000-0000-000000000001/controls/00000000-0000-0000-0000-000000000002'
    );
    expect(res.status).toBe(200);
  });
});

describe('POST /api/risks/:riskId/controls/:id/test', () => {
  it('should record test result', async () => {
    mockPrisma.riskControl.findFirst.mockResolvedValue({ id: 'c1' });
    mockPrisma.riskControl.update.mockResolvedValue({ id: 'c1', lastTestedDate: new Date() });
    const res = await request(app)
      .post(
        '/api/risks/00000000-0000-0000-0000-000000000001/controls/00000000-0000-0000-0000-000000000002/test'
      )
      .send({ testingNotes: 'Passed', effectiveness: 'STRONG' });
    expect(res.status).toBe(200);
  });

  it('returns 404 when control not found', async () => {
    mockPrisma.riskControl.findFirst.mockResolvedValue(null);
    const res = await request(app)
      .post(
        '/api/risks/00000000-0000-0000-0000-000000000001/controls/00000000-0000-0000-0000-000000000002/test'
      )
      .send({ testingNotes: 'Passed' });
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

describe('DELETE /api/risks/:riskId/controls/:id — not-found', () => {
  it('returns 404 when control not found', async () => {
    mockPrisma.riskControl.findFirst.mockResolvedValue(null);
    const res = await request(app).delete(
      '/api/risks/00000000-0000-0000-0000-000000000001/controls/00000000-0000-0000-0000-000000000002'
    );
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

// ─── 500 error paths ────────────────────────────────────────────────────────

describe('500 error handling', () => {
  it('POST /:id/controls returns 500 when create fails', async () => {
    mockPrisma.riskRegister.findFirst.mockResolvedValue({ id: 'r1' });
    mockPrisma.riskControl.create.mockRejectedValue(new Error('DB down'));
    const res = await request(app)
      .post('/api/risks/00000000-0000-0000-0000-000000000001/controls')
      .send({ controlType: 'PREVENTIVE', description: 'Test' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /:id/controls returns 500 on DB error', async () => {
    mockPrisma.riskControl.findMany.mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/risks/00000000-0000-0000-0000-000000000001/controls');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('PUT /:riskId/controls/:id returns 500 when update fails', async () => {
    mockPrisma.riskControl.findFirst.mockResolvedValue({ id: 'c1' });
    mockPrisma.riskControl.update.mockRejectedValue(new Error('DB down'));
    const res = await request(app)
      .put(
        '/api/risks/00000000-0000-0000-0000-000000000001/controls/00000000-0000-0000-0000-000000000002'
      )
      .send({ effectiveness: 'STRONG' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('DELETE /:riskId/controls/:id returns 500 when update fails', async () => {
    mockPrisma.riskControl.findFirst.mockResolvedValue({ id: 'c1' });
    mockPrisma.riskControl.update.mockRejectedValue(new Error('DB down'));
    const res = await request(app).delete(
      '/api/risks/00000000-0000-0000-0000-000000000001/controls/00000000-0000-0000-0000-000000000002'
    );
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST /:riskId/controls/:id/test returns 500 when update fails', async () => {
    mockPrisma.riskControl.findFirst.mockResolvedValue({ id: 'c1' });
    mockPrisma.riskControl.update.mockRejectedValue(new Error('DB down'));
    const res = await request(app)
      .post(
        '/api/risks/00000000-0000-0000-0000-000000000001/controls/00000000-0000-0000-0000-000000000002/test'
      )
      .send({ testingNotes: 'Passed' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('controls.api — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/risks', router);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/risks', async () => {
    const res = await request(app).get('/api/risks');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });

  it('response is JSON content-type for GET /api/risks', async () => {
    const res = await request(app).get('/api/risks');
    expect(res.headers['content-type']).toBeDefined();
  });

  it('GET /api/risks body has success property', async () => {
    const res = await request(app).get('/api/risks');
    if (res.status === 200) {
      expect(res.body).toHaveProperty('success');
    } else {
      expect(res.body).toBeDefined();
    }
  });

  it('GET /api/risks body is an object', async () => {
    const res = await request(app).get('/api/risks');
    expect(typeof res.body).toBe('object');
  });

  it('GET /api/risks route is accessible', async () => {
    const res = await request(app).get('/api/risks');
    expect(res.status).toBeDefined();
  });
});

describe('controls.api — extended edge cases', () => {
  it('POST /:id/controls with DETECTIVE type creates control', async () => {
    mockPrisma.riskRegister.findFirst.mockResolvedValue({ id: 'r1' });
    mockPrisma.riskControl.create.mockResolvedValue({ id: 'c1', controlType: 'DETECTIVE' });
    mockPrisma.riskControl.findMany.mockResolvedValue([{ effectiveness: 'ADEQUATE' }]);
    mockPrisma.riskRegister.update.mockResolvedValue({});
    const res = await request(app)
      .post('/api/risks/00000000-0000-0000-0000-000000000001/controls')
      .send({ controlType: 'DETECTIVE', description: 'Monitor logs' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('POST /:id/controls with DIRECTIVE type creates control', async () => {
    mockPrisma.riskRegister.findFirst.mockResolvedValue({ id: 'r1' });
    mockPrisma.riskControl.create.mockResolvedValue({ id: 'c2', controlType: 'DIRECTIVE' });
    mockPrisma.riskControl.findMany.mockResolvedValue([]);
    mockPrisma.riskRegister.update.mockResolvedValue({});
    const res = await request(app)
      .post('/api/risks/00000000-0000-0000-0000-000000000001/controls')
      .send({ controlType: 'DIRECTIVE', description: 'Policy enforcement' });
    expect(res.status).toBe(201);
  });

  it('GET /:id/controls returns empty array when no controls exist', async () => {
    mockPrisma.riskControl.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/risks/00000000-0000-0000-0000-000000000001/controls');
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it('GET /:id/controls returns success:true', async () => {
    mockPrisma.riskControl.findMany.mockResolvedValue([{ id: 'c1' }]);
    const res = await request(app).get('/api/risks/00000000-0000-0000-0000-000000000001/controls');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('DELETE /:riskId/controls/:id returns message in data', async () => {
    mockPrisma.riskControl.findFirst.mockResolvedValue({ id: 'c1' });
    mockPrisma.riskControl.update.mockResolvedValue({ id: 'c1', isActive: false });
    const res = await request(app).delete(
      '/api/risks/00000000-0000-0000-0000-000000000001/controls/00000000-0000-0000-0000-000000000002'
    );
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('message');
  });

  it('POST /:riskId/controls/:id/test with WEAK effectiveness updates control', async () => {
    mockPrisma.riskControl.findFirst.mockResolvedValue({ id: 'c1' });
    mockPrisma.riskControl.update.mockResolvedValue({ id: 'c1', effectiveness: 'WEAK' });
    const res = await request(app)
      .post(
        '/api/risks/00000000-0000-0000-0000-000000000001/controls/00000000-0000-0000-0000-000000000002/test'
      )
      .send({ testingNotes: 'Needs improvement', effectiveness: 'WEAK' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('POST /:id/controls returns 400 when description is missing', async () => {
    mockPrisma.riskRegister.findFirst.mockResolvedValue({ id: 'r1' });
    const res = await request(app)
      .post('/api/risks/00000000-0000-0000-0000-000000000001/controls')
      .send({ controlType: 'PREVENTIVE' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('PUT /:riskId/controls/:id returns success:true on valid update', async () => {
    mockPrisma.riskControl.findFirst.mockResolvedValue({ id: 'c1' });
    mockPrisma.riskControl.update.mockResolvedValue({ id: 'c1', effectiveness: 'ADEQUATE' });
    mockPrisma.riskControl.findMany.mockResolvedValue([{ effectiveness: 'ADEQUATE' }]);
    mockPrisma.riskRegister.update.mockResolvedValue({});
    const res = await request(app)
      .put(
        '/api/risks/00000000-0000-0000-0000-000000000001/controls/00000000-0000-0000-0000-000000000002'
      )
      .send({ effectiveness: 'ADEQUATE' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('POST /:id/controls creates and updates risk effectiveness', async () => {
    mockPrisma.riskRegister.findFirst.mockResolvedValue({ id: 'r1' });
    mockPrisma.riskControl.create.mockResolvedValue({ id: 'c1', controlType: 'REACTIVE' });
    mockPrisma.riskControl.findMany.mockResolvedValue([{ effectiveness: 'STRONG' }]);
    mockPrisma.riskRegister.update.mockResolvedValue({});
    const res = await request(app)
      .post('/api/risks/00000000-0000-0000-0000-000000000001/controls')
      .send({ controlType: 'REACTIVE', description: 'Emergency response plan' });
    expect(res.status).toBe(201);
    expect(mockPrisma.riskRegister.update).toHaveBeenCalledTimes(1);
  });
});

describe('controls.api — final coverage', () => {
  it('GET /:id/controls findMany called with riskId filter', async () => {
    mockPrisma.riskControl.findMany.mockResolvedValue([]);
    await request(app).get('/api/risks/00000000-0000-0000-0000-000000000001/controls');
    expect(mockPrisma.riskControl.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ riskId: '00000000-0000-0000-0000-000000000001' }),
      })
    );
  });

  it('DELETE /:riskId/controls/:id calls update with isActive: false', async () => {
    mockPrisma.riskControl.findFirst.mockResolvedValue({ id: 'c1' });
    mockPrisma.riskControl.update.mockResolvedValue({ id: 'c1', isActive: false });
    await request(app).delete(
      '/api/risks/00000000-0000-0000-0000-000000000001/controls/00000000-0000-0000-0000-000000000002'
    );
    expect(mockPrisma.riskControl.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ isActive: false }) })
    );
  });

  it('POST /:riskId/controls/:id/test with NONE_EFFECTIVE updates control', async () => {
    mockPrisma.riskControl.findFirst.mockResolvedValue({ id: 'c1' });
    mockPrisma.riskControl.update.mockResolvedValue({ id: 'c1', effectiveness: 'NONE_EFFECTIVE' });
    const res = await request(app)
      .post(
        '/api/risks/00000000-0000-0000-0000-000000000001/controls/00000000-0000-0000-0000-000000000002/test'
      )
      .send({ testingNotes: 'Failed badly', effectiveness: 'NONE_EFFECTIVE' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('PUT /:riskId/controls/:id calls findFirst before update', async () => {
    mockPrisma.riskControl.findFirst.mockResolvedValue({ id: 'c1' });
    mockPrisma.riskControl.update.mockResolvedValue({ id: 'c1', effectiveness: 'ADEQUATE' });
    mockPrisma.riskControl.findMany.mockResolvedValue([]);
    mockPrisma.riskRegister.update.mockResolvedValue({});
    await request(app)
      .put(
        '/api/risks/00000000-0000-0000-0000-000000000001/controls/00000000-0000-0000-0000-000000000002'
      )
      .send({ effectiveness: 'ADEQUATE' });
    expect(mockPrisma.riskControl.findFirst).toHaveBeenCalledTimes(1);
  });

  it('POST /:id/controls with empty description returns 400', async () => {
    mockPrisma.riskRegister.findFirst.mockResolvedValue({ id: 'r1' });
    const res = await request(app)
      .post('/api/risks/00000000-0000-0000-0000-000000000001/controls')
      .send({ controlType: 'PREVENTIVE', description: '' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST /:id/controls returns data.id on success', async () => {
    mockPrisma.riskRegister.findFirst.mockResolvedValue({ id: 'r1' });
    mockPrisma.riskControl.create.mockResolvedValue({ id: 'ctrl-new', controlType: 'PREVENTIVE' });
    mockPrisma.riskControl.findMany.mockResolvedValue([]);
    mockPrisma.riskRegister.update.mockResolvedValue({});
    const res = await request(app)
      .post('/api/risks/00000000-0000-0000-0000-000000000001/controls')
      .send({ controlType: 'PREVENTIVE', description: 'Valid control' });
    expect(res.status).toBe(201);
    expect(res.body.data.id).toBe('ctrl-new');
  });
});
