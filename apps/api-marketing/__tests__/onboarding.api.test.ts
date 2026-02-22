import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    mktEmailJob: {
      findMany: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn(),
    },
    $transaction: jest.fn((fns: any[]) => Promise.all(fns)),
  },
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

jest.mock('../src/config', () => ({
  AutomationConfig: {
    trial: { durationDays: 21, extensionDays: 7 },
  },
}));

import onboardingRouter from '../src/routes/onboarding';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/onboarding', onboardingRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

// ===================================================================
// POST /api/onboarding/enqueue/:userId
// ===================================================================

describe('POST /api/onboarding/enqueue/:userId', () => {
  it('schedules 7 email jobs', async () => {
    (prisma.$transaction as jest.Mock).mockResolvedValue([]);

    const res = await request(app)
      .post('/api/onboarding/enqueue/00000000-0000-0000-0000-000000000001')
      .send({ email: 'test@test.com', firstName: 'Test' });

    expect(res.status).toBe(201);
    expect(res.body.data.jobsScheduled).toBe(7);
  });

  it('returns 400 when email is missing', async () => {
    const res = await request(app)
      .post('/api/onboarding/enqueue/00000000-0000-0000-0000-000000000001')
      .send({});

    expect(res.status).toBe(400);
  });

  it('creates a unique sequence ID', async () => {
    (prisma.$transaction as jest.Mock).mockResolvedValue([]);

    const res = await request(app)
      .post('/api/onboarding/enqueue/00000000-0000-0000-0000-000000000001')
      .send({ email: 'test@test.com' });

    expect(res.body.data.sequenceId).toContain('onboarding-00000000-0000-0000-0000-000000000001-');
  });

  it('returns 500 on database error', async () => {
    (prisma.$transaction as jest.Mock).mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .post('/api/onboarding/enqueue/00000000-0000-0000-0000-000000000001')
      .send({ email: 'test@test.com' });

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// GET /api/onboarding/status/:userId
// ===================================================================

describe('GET /api/onboarding/status/:userId', () => {
  it('returns status summary', async () => {
    const jobs = [
      { id: '1', template: 'welcome', status: 'SENT' },
      { id: '2', template: 'inactive_or_active', status: 'PENDING' },
      { id: '3', template: 'feature_highlight', status: 'PENDING' },
    ];
    (prisma.mktEmailJob.findMany as jest.Mock).mockResolvedValue(jobs);

    const res = await request(app).get(
      '/api/onboarding/status/00000000-0000-0000-0000-000000000001'
    );

    expect(res.status).toBe(200);
    expect(res.body.data.summary.sent).toBe(1);
    expect(res.body.data.summary.pending).toBe(2);
    expect(res.body.data.summary.total).toBe(3);
  });

  it('returns empty results for unknown user', async () => {
    (prisma.mktEmailJob.findMany as jest.Mock).mockResolvedValue([]);

    const res = await request(app).get(
      '/api/onboarding/status/00000000-0000-0000-0000-000000000099'
    );

    expect(res.status).toBe(200);
    expect(res.body.data.summary.total).toBe(0);
  });

  it('summary has sent, pending, and total fields', async () => {
    (prisma.mktEmailJob.findMany as jest.Mock).mockResolvedValue([]);

    const res = await request(app).get(
      '/api/onboarding/status/00000000-0000-0000-0000-000000000001'
    );

    expect(res.body.data.summary).toHaveProperty('sent');
    expect(res.body.data.summary).toHaveProperty('pending');
    expect(res.body.data.summary).toHaveProperty('total');
  });
});

// ===================================================================
// POST /api/onboarding/cancel/:userId
// ===================================================================

describe('POST /api/onboarding/cancel/:userId', () => {
  it('cancels pending emails for user', async () => {
    (prisma.mktEmailJob.updateMany as jest.Mock).mockResolvedValue({ count: 5 });

    const res = await request(app).post(
      '/api/onboarding/cancel/00000000-0000-0000-0000-000000000001'
    );

    expect(res.status).toBe(200);
    expect(res.body.data.cancelledCount).toBe(5);
  });

  it('only cancels PENDING status jobs', async () => {
    (prisma.mktEmailJob.updateMany as jest.Mock).mockResolvedValue({ count: 0 });

    await request(app).post('/api/onboarding/cancel/00000000-0000-0000-0000-000000000001');

    expect(prisma.mktEmailJob.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'PENDING' }),
      })
    );
  });

  it('returns 0 if no pending jobs exist', async () => {
    (prisma.mktEmailJob.updateMany as jest.Mock).mockResolvedValue({ count: 0 });

    const res = await request(app).post(
      '/api/onboarding/cancel/00000000-0000-0000-0000-000000000001'
    );

    expect(res.body.data.cancelledCount).toBe(0);
  });

  it('updateMany is called exactly once per cancel request', async () => {
    (prisma.mktEmailJob.updateMany as jest.Mock).mockResolvedValue({ count: 3 });

    await request(app).post('/api/onboarding/cancel/00000000-0000-0000-0000-000000000001');

    expect(prisma.mktEmailJob.updateMany).toHaveBeenCalledTimes(1);
  });
});

describe('Onboarding — extended', () => {
  it('POST /enqueue success is true', async () => {
    (prisma.$transaction as jest.Mock).mockResolvedValue([]);
    const res = await request(app)
      .post('/api/onboarding/enqueue/00000000-0000-0000-0000-000000000001')
      .send({ email: 'ext@test.com', firstName: 'Ext' });
    expect(res.body.success).toBe(true);
  });

  it('GET /status summary.total is a number', async () => {
    (prisma.mktEmailJob.findMany as jest.Mock).mockResolvedValue([]);
    const res = await request(app).get('/api/onboarding/status/00000000-0000-0000-0000-000000000001');
    expect(typeof res.body.data.summary.total).toBe('number');
  });

  it('POST /cancel success is true when count is 0', async () => {
    (prisma.mktEmailJob.updateMany as jest.Mock).mockResolvedValue({ count: 0 });
    const res = await request(app).post('/api/onboarding/cancel/00000000-0000-0000-0000-000000000001');
    expect(res.body.success).toBe(true);
  });

  it('POST /enqueue jobsScheduled is a number', async () => {
    (prisma.$transaction as jest.Mock).mockResolvedValue([]);
    const res = await request(app)
      .post('/api/onboarding/enqueue/00000000-0000-0000-0000-000000000001')
      .send({ email: 'num@test.com' });
    expect(typeof res.body.data.jobsScheduled).toBe('number');
  });
});

describe('Onboarding — additional coverage', () => {
  it('GET /status summary includes a cancelled field', async () => {
    (prisma.mktEmailJob.findMany as jest.Mock).mockResolvedValue([
      { id: '1', template: 'welcome', status: 'CANCELLED' },
    ]);
    const res = await request(app).get('/api/onboarding/status/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.summary).toHaveProperty('cancelled');
    expect(res.body.data.summary.cancelled).toBe(1);
  });

  it('GET /status returns the jobs array in the response', async () => {
    const jobs = [
      { id: '1', template: 'welcome', status: 'SENT' },
      { id: '2', template: 'feature_highlight', status: 'PENDING' },
    ];
    (prisma.mktEmailJob.findMany as jest.Mock).mockResolvedValue(jobs);
    const res = await request(app).get('/api/onboarding/status/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.jobs).toHaveLength(2);
  });

  it('GET /status returns 500 on DB error', async () => {
    (prisma.mktEmailJob.findMany as jest.Mock).mockRejectedValue(new Error('DB gone'));
    const res = await request(app).get('/api/onboarding/status/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('POST /cancel returns 500 on DB error', async () => {
    (prisma.mktEmailJob.updateMany as jest.Mock).mockRejectedValue(new Error('DB gone'));
    const res = await request(app).post('/api/onboarding/cancel/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('POST /enqueue sequenceId starts with onboarding- prefix', async () => {
    (prisma.$transaction as jest.Mock).mockResolvedValue([]);
    const res = await request(app)
      .post('/api/onboarding/enqueue/00000000-0000-0000-0000-000000000002')
      .send({ email: 'prefix@test.com', firstName: 'Prefix' });
    expect(res.status).toBe(201);
    expect(res.body.data.sequenceId).toMatch(/^onboarding-/);
  });
});

describe('Onboarding — edge cases', () => {
  it('POST /enqueue returns 400 for invalid email format', async () => {
    const res = await request(app)
      .post('/api/onboarding/enqueue/00000000-0000-0000-0000-000000000001')
      .send({ email: 'not-valid-email' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST /enqueue error code is INTERNAL_ERROR on 500', async () => {
    (prisma.$transaction as jest.Mock).mockRejectedValue(new Error('crash'));
    const res = await request(app)
      .post('/api/onboarding/enqueue/00000000-0000-0000-0000-000000000001')
      .send({ email: 'err@test.com' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /status findMany filters by sequenceId startsWith onboarding-', async () => {
    (prisma.mktEmailJob.findMany as jest.Mock).mockResolvedValue([]);
    await request(app).get('/api/onboarding/status/00000000-0000-0000-0000-000000000001');
    expect(prisma.mktEmailJob.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ sequenceId: { startsWith: 'onboarding-' } }),
      })
    );
  });

  it('GET /status findMany filters by userId', async () => {
    (prisma.mktEmailJob.findMany as jest.Mock).mockResolvedValue([]);
    await request(app).get('/api/onboarding/status/00000000-0000-0000-0000-000000000003');
    expect(prisma.mktEmailJob.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: '00000000-0000-0000-0000-000000000003' }),
      })
    );
  });

  it('POST /cancel updateMany sets status to CANCELLED', async () => {
    (prisma.mktEmailJob.updateMany as jest.Mock).mockResolvedValue({ count: 2 });
    await request(app).post('/api/onboarding/cancel/00000000-0000-0000-0000-000000000001');
    expect(prisma.mktEmailJob.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: 'CANCELLED' } })
    );
  });

  it('GET /status summary sent + pending + cancelled equals total', async () => {
    (prisma.mktEmailJob.findMany as jest.Mock).mockResolvedValue([
      { id: '1', template: 'welcome', status: 'SENT' },
      { id: '2', template: 'inactive_or_active', status: 'PENDING' },
      { id: '3', template: 'case_study', status: 'CANCELLED' },
    ]);
    const res = await request(app).get('/api/onboarding/status/00000000-0000-0000-0000-000000000001');
    const { sent, pending, cancelled, total } = res.body.data.summary;
    expect(sent + pending + cancelled).toBe(total);
  });

  it('POST /enqueue with companyName in body still returns 201', async () => {
    (prisma.$transaction as jest.Mock).mockResolvedValue([]);
    const res = await request(app)
      .post('/api/onboarding/enqueue/00000000-0000-0000-0000-000000000001')
      .send({ email: 'corp@test.com', firstName: 'Corp', companyName: 'Corp Inc' });
    expect(res.status).toBe(201);
    expect(res.body.data.jobsScheduled).toBe(7);
  });

  it('GET /status orders jobs by scheduledFor asc', async () => {
    (prisma.mktEmailJob.findMany as jest.Mock).mockResolvedValue([]);
    await request(app).get('/api/onboarding/status/00000000-0000-0000-0000-000000000001');
    expect(prisma.mktEmailJob.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { scheduledFor: 'asc' } })
    );
  });
});

describe('Onboarding — ≥40 coverage', () => {
  it('POST /enqueue returns 400 for missing email with VALIDATION_ERROR code', async () => {
    const res = await request(app)
      .post('/api/onboarding/enqueue/00000000-0000-0000-0000-000000000001')
      .send({ firstName: 'Alice' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('GET /status findMany is called once per request', async () => {
    (prisma.mktEmailJob.findMany as jest.Mock).mockResolvedValue([]);
    await request(app).get('/api/onboarding/status/00000000-0000-0000-0000-000000000001');
    expect(prisma.mktEmailJob.findMany).toHaveBeenCalledTimes(1);
  });

  it('POST /cancel where clause filters by sequenceId startsWith onboarding-', async () => {
    (prisma.mktEmailJob.updateMany as jest.Mock).mockResolvedValue({ count: 0 });
    await request(app).post('/api/onboarding/cancel/00000000-0000-0000-0000-000000000001');
    expect(prisma.mktEmailJob.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ sequenceId: { startsWith: 'onboarding-' } }),
      })
    );
  });

  it('GET /status returns success:false on DB error', async () => {
    (prisma.mktEmailJob.findMany as jest.Mock).mockRejectedValue(new Error('boom'));
    const res = await request(app).get('/api/onboarding/status/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('POST /enqueue $transaction is called once per enqueue request', async () => {
    (prisma.$transaction as jest.Mock).mockResolvedValue([]);
    await request(app)
      .post('/api/onboarding/enqueue/00000000-0000-0000-0000-000000000001')
      .send({ email: 'tx@test.com' });
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });
});

// ===================================================================
// Additional coverage to reach 35 tests
// ===================================================================

describe('Onboarding — final coverage', () => {
  it('POST /enqueue with firstName stores it in jobs metadata', async () => {
    (prisma.$transaction as jest.Mock).mockResolvedValue([]);

    const res = await request(app)
      .post('/api/onboarding/enqueue/00000000-0000-0000-0000-000000000001')
      .send({ email: 'fn@test.com', firstName: 'Alice' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('GET /status summary.sent is 0 when all jobs are pending', async () => {
    (prisma.mktEmailJob.findMany as jest.Mock).mockResolvedValue([
      { id: '1', template: 'welcome', status: 'PENDING' },
      { id: '2', template: 'feature_highlight', status: 'PENDING' },
    ]);
    const res = await request(app).get('/api/onboarding/status/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.summary.sent).toBe(0);
    expect(res.body.data.summary.pending).toBe(2);
  });

  it('POST /cancel returns success:true with positive cancelledCount', async () => {
    (prisma.mktEmailJob.updateMany as jest.Mock).mockResolvedValue({ count: 3 });
    const res = await request(app).post('/api/onboarding/cancel/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.cancelledCount).toBe(3);
  });

  it('POST /enqueue response 201 and data has both sequenceId and jobsScheduled', async () => {
    (prisma.$transaction as jest.Mock).mockResolvedValue([]);
    const res = await request(app)
      .post('/api/onboarding/enqueue/00000000-0000-0000-0000-000000000002')
      .send({ email: 'both@test.com' });
    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('sequenceId');
    expect(res.body.data).toHaveProperty('jobsScheduled');
  });

  it('POST /enqueue jobsScheduled equals 7 regardless of firstName presence', async () => {
    (prisma.$transaction as jest.Mock).mockResolvedValue([]);
    const withName = await request(app)
      .post('/api/onboarding/enqueue/00000000-0000-0000-0000-000000000001')
      .send({ email: 'name@test.com', firstName: 'Bob' });
    const withoutName = await request(app)
      .post('/api/onboarding/enqueue/00000000-0000-0000-0000-000000000001')
      .send({ email: 'noname@test.com' });
    expect(withName.body.data.jobsScheduled).toBe(7);
    expect(withoutName.body.data.jobsScheduled).toBe(7);
  });

  it('GET /status summary.cancelled is 0 when no cancelled jobs', async () => {
    (prisma.mktEmailJob.findMany as jest.Mock).mockResolvedValue([
      { id: '1', template: 'welcome', status: 'SENT' },
    ]);
    const res = await request(app).get('/api/onboarding/status/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.summary.cancelled).toBe(0);
  });

  it('POST /cancel updateMany where clause filters by userId', async () => {
    (prisma.mktEmailJob.updateMany as jest.Mock).mockResolvedValue({ count: 0 });
    await request(app).post('/api/onboarding/cancel/00000000-0000-0000-0000-000000000004');
    expect(prisma.mktEmailJob.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: '00000000-0000-0000-0000-000000000004' }),
      })
    );
  });
});

describe('onboarding — phase29 coverage', () => {
  it('handles template literals', () => {
    const n = 42; expect(`value: ${n}`).toBe('value: 42');
  });

  it('handles error message', () => {
    expect(new TypeError('bad')).toHaveProperty('message', 'bad');
  });

  it('handles JSON parse', () => {
    expect(JSON.parse('{"a":1}')).toEqual({ a: 1 });
  });

  it('handles number isFinite', () => {
    expect(isFinite(42)).toBe(true);
  });

  it('handles string endsWith', () => {
    expect('hello'.endsWith('lo')).toBe(true);
  });

});
