import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    mktLinkedInOutreach: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
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

jest.mock('../src/config', () => ({
  AutomationConfig: {
    linkedin: { dailyOutreachLimit: 20 },
  },
}));

global.fetch = jest.fn(() => Promise.resolve({ ok: false })) as unknown as typeof globalThis.fetch;

import linkedinRouter from '../src/routes/linkedin-tracker';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use((req: any, _res: any, next: any) => {
  req.user = { id: 'admin-1' };
  next();
});
app.use('/api/linkedin', linkedinRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('POST /api/linkedin/outreach', () => {
  it('creates outreach with valid data', async () => {
    (prisma.mktLinkedInOutreach.count as jest.Mock).mockResolvedValue(5);
    (prisma.mktLinkedInOutreach.create as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });

    const res = await request(app).post('/api/linkedin/outreach').send({
      prospectName: 'John Doe',
      company: 'TechCorp',
      linkedinUrl: 'https://linkedin.com/in/johndoe',
      template: 'ISO_CONSULTANT',
    });

    expect(res.status).toBe(201);
  });

  it('returns 429 when daily limit reached', async () => {
    (prisma.mktLinkedInOutreach.count as jest.Mock).mockResolvedValue(20);

    const res = await request(app).post('/api/linkedin/outreach').send({
      prospectName: 'John Doe',
      company: 'TechCorp',
      linkedinUrl: 'https://linkedin.com/in/johndoe',
      template: 'ISO_CONSULTANT',
    });

    expect(res.status).toBe(429);
    expect(res.body.error.code).toBe('DAILY_LIMIT_REACHED');
  });

  it('returns 400 for invalid template', async () => {
    const res = await request(app).post('/api/linkedin/outreach').send({
      prospectName: 'John Doe',
      company: 'TechCorp',
      linkedinUrl: 'https://linkedin.com/in/johndoe',
      template: 'INVALID',
    });

    expect(res.status).toBe(400);
  });

  it('returns 400 for missing required fields', async () => {
    const res = await request(app).post('/api/linkedin/outreach').send({ prospectName: 'John' });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/linkedin/outreach', () => {
  it('returns outreach list with daily stats', async () => {
    (prisma.mktLinkedInOutreach.findMany as jest.Mock).mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001' },
    ]);
    (prisma.mktLinkedInOutreach.count as jest.Mock).mockResolvedValue(3);

    const res = await request(app).get('/api/linkedin/outreach');

    expect(res.status).toBe(200);
    expect(res.body.data.outreach).toHaveLength(1);
    expect(res.body.data.stats.todayCount).toBe(3);
    expect(res.body.data.stats.dailyLimit).toBe(20);
  });

  it('outreach is an array', async () => {
    (prisma.mktLinkedInOutreach.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.mktLinkedInOutreach.count as jest.Mock).mockResolvedValue(0);
    const res = await request(app).get('/api/linkedin/outreach');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.outreach)).toBe(true);
  });

  it('findMany is called once per request', async () => {
    (prisma.mktLinkedInOutreach.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.mktLinkedInOutreach.count as jest.Mock).mockResolvedValue(0);
    await request(app).get('/api/linkedin/outreach');
    expect(prisma.mktLinkedInOutreach.findMany).toHaveBeenCalledTimes(1);
  });
});

describe('PATCH /api/linkedin/outreach/:id', () => {
  it('updates status with timestamp', async () => {
    (prisma.mktLinkedInOutreach.findUnique as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'PENDING',
    });
    (prisma.mktLinkedInOutreach.update as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'SENT',
    });

    const res = await request(app)
      .patch('/api/linkedin/outreach/00000000-0000-0000-0000-000000000001')
      .send({ status: 'SENT' });

    expect(res.status).toBe(200);
    expect(prisma.mktLinkedInOutreach.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'SENT', sentAt: expect.any(Date) }),
      })
    );
  });

  it('returns 404 for non-existent outreach', async () => {
    (prisma.mktLinkedInOutreach.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app)
      .patch('/api/linkedin/outreach/00000000-0000-0000-0000-000000000099')
      .send({ status: 'SENT' });

    expect(res.status).toBe(404);
  });

  it('returns 400 for invalid status', async () => {
    const res = await request(app)
      .patch('/api/linkedin/outreach/00000000-0000-0000-0000-000000000001')
      .send({ status: 'INVALID_STATUS' });

    expect(res.status).toBe(400);
  });
});

// ─── 500 error paths ────────────────────────────────────────────────────────

describe('500 error handling', () => {
  it('POST /outreach returns 500 when create fails', async () => {
    (prisma.mktLinkedInOutreach.count as jest.Mock).mockResolvedValue(5);
    (prisma.mktLinkedInOutreach.create as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).post('/api/linkedin/outreach').send({
      prospectName: 'John Doe',
      company: 'TechCorp',
      linkedinUrl: 'https://linkedin.com/in/johndoe',
      template: 'ISO_CONSULTANT',
    });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /outreach returns 500 on DB error', async () => {
    (prisma.mktLinkedInOutreach.findMany as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/linkedin/outreach');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('PATCH /outreach/:id returns 500 when update fails', async () => {
    (prisma.mktLinkedInOutreach.findUnique as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'PENDING',
    });
    (prisma.mktLinkedInOutreach.update as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app)
      .patch('/api/linkedin/outreach/00000000-0000-0000-0000-000000000001')
      .send({ status: 'SENT' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});
