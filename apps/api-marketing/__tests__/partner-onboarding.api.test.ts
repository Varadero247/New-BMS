import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    mktEmailJob: {
      create: jest.fn(),
    },
  },
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import partnerOnboardingRouter from '../src/routes/partner-onboarding';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/partner-onboarding', partnerOnboardingRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

// ===================================================================
// POST /api/partner-onboarding/enqueue/:partnerId
// ===================================================================

describe('POST /api/partner-onboarding/enqueue/:partnerId', () => {
  it('should schedule 3 email jobs for a valid partner', async () => {
    (prisma.mktEmailJob.create as jest.Mock).mockResolvedValue({ id: 'job-1' });

    const res = await request(app)
      .post('/api/partner-onboarding/enqueue/00000000-0000-0000-0000-000000000001')
      .send({ email: 'partner@example.com', name: 'Test Partner' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.jobsScheduled).toBe(3);
    expect(res.body.data.sequenceId).toBe(
      'partner-onboarding-00000000-0000-0000-0000-000000000001'
    );
  });

  it('should schedule 3 jobs even without a name', async () => {
    (prisma.mktEmailJob.create as jest.Mock).mockResolvedValue({ id: 'job-1' });

    const res = await request(app)
      .post('/api/partner-onboarding/enqueue/00000000-0000-0000-0000-000000000001')
      .send({ email: 'partner@example.com' });

    expect(res.status).toBe(201);
    expect(res.body.data.jobsScheduled).toBe(3);
    expect(prisma.mktEmailJob.create).toHaveBeenCalledTimes(3);
  });

  it('should create a welcome email job first', async () => {
    (prisma.mktEmailJob.create as jest.Mock).mockResolvedValue({ id: 'job-1' });

    await request(app)
      .post('/api/partner-onboarding/enqueue/00000000-0000-0000-0000-000000000001')
      .send({ email: 'partner@example.com' });

    const firstCall = (prisma.mktEmailJob.create as jest.Mock).mock.calls[0][0];
    expect(firstCall.data.template).toBe('partner_welcome');
    expect(firstCall.data.email).toBe('partner@example.com');
    expect(firstCall.data.sequenceId).toBe(
      'partner-onboarding-00000000-0000-0000-0000-000000000001'
    );
  });

  it('should create a day 7 tips email', async () => {
    (prisma.mktEmailJob.create as jest.Mock).mockResolvedValue({ id: 'job-1' });

    await request(app)
      .post('/api/partner-onboarding/enqueue/00000000-0000-0000-0000-000000000001')
      .send({ email: 'partner@example.com' });

    const secondCall = (prisma.mktEmailJob.create as jest.Mock).mock.calls[1][0];
    expect(secondCall.data.template).toBe('partner_day7_tips');
  });

  it('should create a day 30 case study email', async () => {
    (prisma.mktEmailJob.create as jest.Mock).mockResolvedValue({ id: 'job-1' });

    await request(app)
      .post('/api/partner-onboarding/enqueue/00000000-0000-0000-0000-000000000001')
      .send({ email: 'partner@example.com' });

    const thirdCall = (prisma.mktEmailJob.create as jest.Mock).mock.calls[2][0];
    expect(thirdCall.data.template).toBe('partner_day30_casestudy');
  });

  it('should return 400 when email is missing', async () => {
    const res = await request(app)
      .post('/api/partner-onboarding/enqueue/00000000-0000-0000-0000-000000000001')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 when email is empty string', async () => {
    const res = await request(app)
      .post('/api/partner-onboarding/enqueue/00000000-0000-0000-0000-000000000001')
      .send({ email: '' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 500 on database error', async () => {
    (prisma.mktEmailJob.create as jest.Mock).mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .post('/api/partner-onboarding/enqueue/00000000-0000-0000-0000-000000000001')
      .send({ email: 'partner@example.com' });

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('should use different sequenceIds for different partnerIds', async () => {
    (prisma.mktEmailJob.create as jest.Mock).mockResolvedValue({ id: 'job-1' });

    const res1 = await request(app)
      .post('/api/partner-onboarding/enqueue/partnerA')
      .send({ email: 'a@example.com' });

    const res2 = await request(app)
      .post('/api/partner-onboarding/enqueue/partnerB')
      .send({ email: 'b@example.com' });

    expect(res1.body.data.sequenceId).toBe('partner-onboarding-partnerA');
    expect(res2.body.data.sequenceId).toBe('partner-onboarding-partnerB');
  });
});

describe('Partner Onboarding — extended', () => {
  it('sequenceId format is partner-onboarding-<partnerId>', async () => {
    (prisma.mktEmailJob.create as jest.Mock).mockResolvedValue({ id: 'job-1' });
    const res = await request(app)
      .post('/api/partner-onboarding/enqueue/test-partner-id')
      .send({ email: 'x@example.com' });
    expect(res.status).toBe(201);
    expect(res.body.data.sequenceId).toBe('partner-onboarding-test-partner-id');
  });

  it('create is called exactly 3 times for a single enqueue', async () => {
    (prisma.mktEmailJob.create as jest.Mock).mockResolvedValue({ id: 'job-1' });
    await request(app)
      .post('/api/partner-onboarding/enqueue/00000000-0000-0000-0000-000000000001')
      .send({ email: 'count@example.com' });
    expect(prisma.mktEmailJob.create).toHaveBeenCalledTimes(3);
  });

  it('success is true on 201 response', async () => {
    (prisma.mktEmailJob.create as jest.Mock).mockResolvedValue({ id: 'job-1' });
    const res = await request(app)
      .post('/api/partner-onboarding/enqueue/00000000-0000-0000-0000-000000000001')
      .send({ email: 'success@example.com' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
});

describe('Partner Onboarding — extra', () => {
  it('third job template is partner_day30_casestudy', async () => {
    (prisma.mktEmailJob.create as jest.Mock).mockResolvedValue({ id: 'job-3' });
    await request(app)
      .post('/api/partner-onboarding/enqueue/00000000-0000-0000-0000-000000000002')
      .send({ email: 'third@example.com' });
    const thirdCall = (prisma.mktEmailJob.create as jest.Mock).mock.calls[2][0];
    expect(thirdCall.data.template).toBe('partner_day30_casestudy');
  });

  it('second job template is partner_day7_tips', async () => {
    (prisma.mktEmailJob.create as jest.Mock).mockResolvedValue({ id: 'job-2' });
    await request(app)
      .post('/api/partner-onboarding/enqueue/00000000-0000-0000-0000-000000000003')
      .send({ email: 'second@example.com' });
    const secondCall = (prisma.mktEmailJob.create as jest.Mock).mock.calls[1][0];
    expect(secondCall.data.template).toBe('partner_day7_tips');
  });

  it('jobsScheduled is a number in response data', async () => {
    (prisma.mktEmailJob.create as jest.Mock).mockResolvedValue({ id: 'job-1' });
    const res = await request(app)
      .post('/api/partner-onboarding/enqueue/00000000-0000-0000-0000-000000000004')
      .send({ email: 'num@example.com' });
    expect(res.status).toBe(201);
    expect(typeof res.body.data.jobsScheduled).toBe('number');
  });
});
