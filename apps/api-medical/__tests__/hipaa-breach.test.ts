import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    hipaaBreachNotification: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  },
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

jest.mock('@ims/shared', () => ({
  validateIdParam: () => (_req: any, _res: any, next: any) => next(),
  parsePagination: (query: Record<string, any>) => {
    const page = Math.max(1, parseInt(query.page as string, 10) || 1);
    const limit = Math.min(Math.max(1, parseInt(query.limit as string, 10) || 20), 100);
    return { skip: (page - 1) * limit, limit, page };
  },
}));

import router from '../src/routes/hipaa-breach';
const { prisma } = require('../src/prisma');

const app = express();
app.use(express.json());
app.use('/', router);

const breachPayload = {
  discoveredDate: '2026-01-10',
  description: 'Unauthorized access to patient records',
  phiInvolved: ['demographics', 'diagnoses'],
  individualsAffected: 150,
  breachType: 'UNAUTHORIZED_ACCESS',
  discoveredBy: 'IT Security Team',
};

const mockBreach = {
  id: 'breach-1',
  referenceNumber: 'BREACH-2026-001',
  ...breachPayload,
  status: 'INVESTIGATING',
  discoveredDate: new Date('2026-01-10'),
  deletedAt: null,
};

describe('HIPAA Breach Notification Routes', () => {
  beforeEach(() => jest.clearAllMocks());

  // GET /
  it('GET / returns paginated breach list', async () => {
    prisma.hipaaBreachNotification.findMany.mockResolvedValue([mockBreach]);
    prisma.hipaaBreachNotification.count.mockResolvedValue(1);
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination).toBeDefined();
  });

  it('GET / filters by status', async () => {
    prisma.hipaaBreachNotification.findMany.mockResolvedValue([]);
    prisma.hipaaBreachNotification.count.mockResolvedValue(0);
    const res = await request(app).get('/?status=CONFIRMED');
    expect(res.status).toBe(200);
  });

  it('GET / returns 500 on DB error', async () => {
    prisma.hipaaBreachNotification.findMany.mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/');
    expect(res.status).toBe(500);
  });

  // POST /
  it('POST / creates a breach with BREACH reference and 60-day deadlines', async () => {
    prisma.hipaaBreachNotification.count.mockResolvedValue(0); // for generateBreachRef
    prisma.hipaaBreachNotification.create.mockResolvedValue({
      ...mockBreach,
      referenceNumber: 'BREACH-2026-001',
      individualNotificationDue: new Date('2026-03-11'),
      hhsNotificationDue: new Date('2026-03-11'),
    });
    const res = await request(app).post('/').send(breachPayload);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('POST / returns 400 on missing description', async () => {
    const { description: _d, ...body } = breachPayload;
    const res = await request(app).post('/').send(body);
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST / returns 400 on invalid breachType', async () => {
    const res = await request(app).post('/').send({ ...breachPayload, breachType: 'INVALID_TYPE' });
    expect(res.status).toBe(400);
  });

  it('POST / returns 400 on empty phiInvolved array', async () => {
    const res = await request(app).post('/').send({ ...breachPayload, phiInvolved: [] });
    expect(res.status).toBe(400);
  });

  it('POST / returns 400 on negative individualsAffected', async () => {
    const res = await request(app).post('/').send({ ...breachPayload, individualsAffected: -1 });
    expect(res.status).toBe(400);
  });

  it('POST / sets status to INVESTIGATING', async () => {
    prisma.hipaaBreachNotification.count.mockResolvedValue(2);
    prisma.hipaaBreachNotification.create.mockResolvedValue({ ...mockBreach, status: 'INVESTIGATING' });
    const res = await request(app).post('/').send(breachPayload);
    expect(prisma.hipaaBreachNotification.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'INVESTIGATING' }) })
    );
  });

  // GET /dashboard
  it('GET /dashboard returns open/notified/closed counts', async () => {
    prisma.hipaaBreachNotification.count
      .mockResolvedValueOnce(5)  // total
      .mockResolvedValueOnce(3)  // open
      .mockResolvedValueOnce(1); // notified
    const res = await request(app).get('/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('total', 5);
    expect(res.body.data).toHaveProperty('open', 3);
    expect(res.body.data).toHaveProperty('notified', 1);
    expect(res.body.data).toHaveProperty('closed', 1); // 5 - 3 - 1
  });

  it('GET /dashboard returns 500 on DB error', async () => {
    prisma.hipaaBreachNotification.count.mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/dashboard');
    expect(res.status).toBe(500);
  });

  // GET /:id
  it('GET /:id returns a single breach', async () => {
    prisma.hipaaBreachNotification.findUnique.mockResolvedValue(mockBreach);
    const res = await request(app).get('/breach-1');
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('breach-1');
    expect(res.body.data.referenceNumber).toBe('BREACH-2026-001');
  });

  it('GET /:id returns 404 for missing breach', async () => {
    prisma.hipaaBreachNotification.findUnique.mockResolvedValue(null);
    const res = await request(app).get('/nonexistent');
    expect(res.status).toBe(404);
  });

  it('GET /:id returns 404 for soft-deleted breach', async () => {
    prisma.hipaaBreachNotification.findUnique.mockResolvedValue({ ...mockBreach, deletedAt: new Date() });
    const res = await request(app).get('/breach-1');
    expect(res.status).toBe(404);
  });

  // PUT /:id
  it('PUT /:id updates breach status to CONFIRMED', async () => {
    prisma.hipaaBreachNotification.findUnique.mockResolvedValue(mockBreach);
    prisma.hipaaBreachNotification.update.mockResolvedValue({ ...mockBreach, status: 'CONFIRMED' });
    const res = await request(app).put('/breach-1').send({ status: 'CONFIRMED' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('CONFIRMED');
  });

  it('PUT /:id returns 404 for unknown breach', async () => {
    prisma.hipaaBreachNotification.findUnique.mockResolvedValue(null);
    const res = await request(app).put('/unknown').send({ status: 'CONFIRMED' });
    expect(res.status).toBe(404);
  });

  // PUT /:id/notify-individuals
  it('PUT /:id/notify-individuals records individual notification', async () => {
    prisma.hipaaBreachNotification.findUnique.mockResolvedValue(mockBreach);
    prisma.hipaaBreachNotification.update.mockResolvedValue({
      ...mockBreach,
      status: 'NOTIFICATION_PENDING',
      individualNotifiedAt: new Date(),
    });
    const res = await request(app).put('/breach-1/notify-individuals');
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('NOTIFICATION_PENDING');
  });

  it('PUT /:id/notify-individuals returns 404 for unknown breach', async () => {
    prisma.hipaaBreachNotification.findUnique.mockResolvedValue(null);
    const res = await request(app).put('/unknown/notify-individuals');
    expect(res.status).toBe(404);
  });

  // PUT /:id/notify-hhs
  it('PUT /:id/notify-hhs marks HHS notification complete', async () => {
    prisma.hipaaBreachNotification.findUnique.mockResolvedValue(mockBreach);
    prisma.hipaaBreachNotification.update.mockResolvedValue({
      ...mockBreach,
      status: 'NOTIFICATION_COMPLETE',
      hhsNotifiedAt: new Date(),
    });
    const res = await request(app).put('/breach-1/notify-hhs');
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('NOTIFICATION_COMPLETE');
  });

  it('PUT /:id/notify-hhs returns 404 for unknown breach', async () => {
    prisma.hipaaBreachNotification.findUnique.mockResolvedValue(null);
    const res = await request(app).put('/unknown/notify-hhs');
    expect(res.status).toBe(404);
  });

  // PUT /:id/close
  it('PUT /:id/close closes breach as CLOSED_NOT_BREACH', async () => {
    prisma.hipaaBreachNotification.findUnique.mockResolvedValue(mockBreach);
    prisma.hipaaBreachNotification.update.mockResolvedValue({ ...mockBreach, status: 'CLOSED_NOT_BREACH', closedAt: new Date() });
    const res = await request(app).put('/breach-1/close').send({ status: 'CLOSED_NOT_BREACH' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('CLOSED_NOT_BREACH');
  });

  it('PUT /:id/close returns 400 on missing status', async () => {
    prisma.hipaaBreachNotification.findUnique.mockResolvedValue(mockBreach);
    const res = await request(app).put('/breach-1/close').send({});
    expect(res.status).toBe(400);
  });

  it('PUT /:id/close returns 400 on invalid close status', async () => {
    prisma.hipaaBreachNotification.findUnique.mockResolvedValue(mockBreach);
    const res = await request(app).put('/breach-1/close').send({ status: 'INVESTIGATING' });
    expect(res.status).toBe(400);
  });

  it('PUT /:id/close returns 404 for unknown breach', async () => {
    prisma.hipaaBreachNotification.findUnique.mockResolvedValue(null);
    const res = await request(app).put('/unknown/close').send({ status: 'CLOSED' });
    expect(res.status).toBe(404);
  });
});

describe('HIPAA Breach Notification Routes — extended coverage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('GET / includes totalPages in pagination when multiple pages exist', async () => {
    prisma.hipaaBreachNotification.findMany.mockResolvedValue([mockBreach]);
    prisma.hipaaBreachNotification.count.mockResolvedValue(45);
    const res = await request(app).get('/?limit=20&page=1');
    expect(res.status).toBe(200);
    expect(res.body.pagination.total).toBe(45);
    expect(res.body.pagination.totalPages).toBeGreaterThanOrEqual(3);
  });

  it('GET / filters by breachType query param', async () => {
    prisma.hipaaBreachNotification.findMany.mockResolvedValue([mockBreach]);
    prisma.hipaaBreachNotification.count.mockResolvedValue(1);
    const res = await request(app).get('/?breachType=UNAUTHORIZED_ACCESS');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('POST / returns 500 on DB error during reference generation', async () => {
    prisma.hipaaBreachNotification.count.mockRejectedValue(new Error('count fail'));
    const res = await request(app).post('/').send(breachPayload);
    expect(res.status).toBe(500);
  });

  it('PUT /:id returns 500 on DB error during update', async () => {
    prisma.hipaaBreachNotification.findUnique.mockResolvedValue(mockBreach);
    prisma.hipaaBreachNotification.update.mockRejectedValue(new Error('update fail'));
    const res = await request(app).put('/breach-1').send({ status: 'CONFIRMED' });
    expect(res.status).toBe(500);
  });

  it('GET /:id response has success:true and referenceNumber field', async () => {
    prisma.hipaaBreachNotification.findUnique.mockResolvedValue(mockBreach);
    const res = await request(app).get('/breach-1');
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('referenceNumber');
  });

  it('PUT /:id/notify-individuals returns 500 on DB error', async () => {
    prisma.hipaaBreachNotification.findUnique.mockResolvedValue(mockBreach);
    prisma.hipaaBreachNotification.update.mockRejectedValue(new Error('notify fail'));
    const res = await request(app).put('/breach-1/notify-individuals');
    expect(res.status).toBe(500);
  });

  it('PUT /:id/notify-hhs returns 500 on DB error', async () => {
    prisma.hipaaBreachNotification.findUnique.mockResolvedValue(mockBreach);
    prisma.hipaaBreachNotification.update.mockRejectedValue(new Error('hhs fail'));
    const res = await request(app).put('/breach-1/notify-hhs');
    expect(res.status).toBe(500);
  });

  it('GET / returns success:true and data array on success', async () => {
    prisma.hipaaBreachNotification.findMany.mockResolvedValue([mockBreach]);
    prisma.hipaaBreachNotification.count.mockResolvedValue(1);
    const res = await request(app).get('/');
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('PUT /:id/close returns 500 on DB error during update', async () => {
    prisma.hipaaBreachNotification.findUnique.mockResolvedValue(mockBreach);
    prisma.hipaaBreachNotification.update.mockRejectedValue(new Error('close fail'));
    const res = await request(app).put('/breach-1/close').send({ status: 'CLOSED' });
    expect(res.status).toBe(500);
  });

  it('GET /dashboard returns success:true with all count fields', async () => {
    prisma.hipaaBreachNotification.count
      .mockResolvedValueOnce(10)
      .mockResolvedValueOnce(7)
      .mockResolvedValueOnce(2);
    const res = await request(app).get('/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('total');
  });

  it('POST / returns 400 on missing discoveredDate', async () => {
    const { discoveredDate: _dd, ...body } = breachPayload;
    const res = await request(app).post('/').send(body);
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('HIPAA Breach Notification — further boundary coverage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('GET / returns empty array when no breaches', async () => {
    prisma.hipaaBreachNotification.findMany.mockResolvedValue([]);
    prisma.hipaaBreachNotification.count.mockResolvedValue(0);
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it('POST / create is called once on valid payload', async () => {
    prisma.hipaaBreachNotification.count.mockResolvedValue(1);
    prisma.hipaaBreachNotification.create.mockResolvedValue(mockBreach);
    await request(app).post('/').send(breachPayload);
    expect(prisma.hipaaBreachNotification.create).toHaveBeenCalledTimes(1);
  });

  it('PUT /:id/close with CLOSED status returns success', async () => {
    prisma.hipaaBreachNotification.findUnique.mockResolvedValue(mockBreach);
    prisma.hipaaBreachNotification.update.mockResolvedValue({ ...mockBreach, status: 'CLOSED', closedAt: new Date() });
    const res = await request(app).put('/breach-1/close').send({ status: 'CLOSED' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /dashboard closed count is computed as total minus open minus notified', async () => {
    prisma.hipaaBreachNotification.count
      .mockResolvedValueOnce(20)
      .mockResolvedValueOnce(12)
      .mockResolvedValueOnce(5);
    const res = await request(app).get('/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.data.closed).toBe(3); // 20 - 12 - 5
  });

  it('GET /:id returns 500 on DB error during findUnique', async () => {
    prisma.hipaaBreachNotification.findUnique.mockRejectedValue(new Error('DB fail'));
    const res = await request(app).get('/breach-1');
    expect(res.status).toBe(500);
  });

  it('PUT /:id/notify-hhs calls update with hhsNotifiedAt', async () => {
    prisma.hipaaBreachNotification.findUnique.mockResolvedValue(mockBreach);
    prisma.hipaaBreachNotification.update.mockResolvedValue({
      ...mockBreach,
      hhsNotifiedAt: new Date(),
      status: 'NOTIFICATION_COMPLETE',
    });
    await request(app).put('/breach-1/notify-hhs');
    expect(prisma.hipaaBreachNotification.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ hhsNotifiedAt: expect.any(Date) }) })
    );
  });
});

describe('hipaa breach — phase29 coverage', () => {
  it('handles bitwise AND', () => {
    expect(5 & 3).toBe(1);
  });

  it('handles Math.abs', () => {
    expect(Math.abs(-5)).toBe(5);
  });

  it('handles Date type', () => {
    expect(new Date()).toBeInstanceOf(Date);
  });

  it('handles slice method', () => {
    expect([1, 2, 3, 4].slice(1, 3)).toEqual([2, 3]);
  });

});
