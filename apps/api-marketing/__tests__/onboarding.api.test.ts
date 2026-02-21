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
