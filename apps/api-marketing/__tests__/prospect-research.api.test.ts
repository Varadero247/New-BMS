import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    mktProspectResearch: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
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
    founder: { name: 'Test Founder' },
    hubspot: { pipelineId: 'pipe-1', stageIds: { prospecting: 'stage-1' } },
  },
}));

global.fetch = jest.fn(() => Promise.resolve({ ok: false })) as unknown as typeof globalThis.fetch;

import prospectRouter from '../src/routes/prospect-research';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use((req: any, _res: any, next: any) => {
  req.user = { id: 'admin-1' };
  next();
});
app.use('/api/prospects', prospectRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('POST /api/prospects/research', () => {
  it('creates prospect research with valid data', async () => {
    const mockResearch = { id: '00000000-0000-0000-0000-000000000001', companyName: 'TechCo' };
    (prisma.mktProspectResearch.create as jest.Mock).mockResolvedValue(mockResearch);

    const res = await request(app)
      .post('/api/prospects/research')
      .send({ companyName: 'TechCo', industry: 'Manufacturing' });

    expect(res.status).toBe(201);
    expect(res.body.data.companyName).toBe('TechCo');
  });

  it('returns 400 for missing company name', async () => {
    const res = await request(app)
      .post('/api/prospects/research')
      .send({ industry: 'Manufacturing' });

    expect(res.status).toBe(400);
  });

  it('handles Companies House API failure gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
    (prisma.mktProspectResearch.create as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });

    const res = await request(app).post('/api/prospects/research').send({ companyName: 'TechCo' });

    expect(res.status).toBe(201);
  });

  it('handles AI generation failure gracefully', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false });
    (prisma.mktProspectResearch.create as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });

    const res = await request(app).post('/api/prospects/research').send({ companyName: 'TechCo' });

    expect(res.status).toBe(201);
  });
});

describe('GET /api/prospects', () => {
  it('returns prospect research list', async () => {
    (prisma.mktProspectResearch.findMany as jest.Mock).mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001' },
    ]);

    const res = await request(app).get('/api/prospects');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('returns an array', async () => {
    (prisma.mktProspectResearch.findMany as jest.Mock).mockResolvedValue([]);
    const res = await request(app).get('/api/prospects');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('findMany is called once per request', async () => {
    (prisma.mktProspectResearch.findMany as jest.Mock).mockResolvedValue([]);
    await request(app).get('/api/prospects');
    expect(prisma.mktProspectResearch.findMany).toHaveBeenCalledTimes(1);
  });
});

describe('POST /api/prospects/:id/save-to-hubspot', () => {
  it('returns 404 for non-existent prospect', async () => {
    (prisma.mktProspectResearch.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app).post(
      '/api/prospects/00000000-0000-0000-0000-000000000099/save-to-hubspot'
    );

    expect(res.status).toBe(404);
  });

  it('attempts to push to HubSpot', async () => {
    (prisma.mktProspectResearch.findUnique as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      companyName: 'TechCo',
    });

    const res = await request(app).post(
      '/api/prospects/00000000-0000-0000-0000-000000000001/save-to-hubspot'
    );

    expect(res.status).toBe(200);
  });
});

// ─── 500 error paths ────────────────────────────────────────────────────────

describe('500 error handling', () => {
  it('POST /research returns 500 when create fails', async () => {
    (prisma.mktProspectResearch.create as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app)
      .post('/api/prospects/research')
      .send({ companyName: 'TechCo', industry: 'Manufacturing' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET / returns 500 on DB error', async () => {
    (prisma.mktProspectResearch.findMany as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/prospects');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST /:id/save-to-hubspot returns 500 when DB fails', async () => {
    (prisma.mktProspectResearch.findUnique as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).post(
      '/api/prospects/00000000-0000-0000-0000-000000000001/save-to-hubspot'
    );
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('Prospect Research — extended', () => {
  it('POST /research response data has an id field', async () => {
    (prisma.mktProspectResearch.create as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      companyName: 'WidgetCorp',
    });
    const res = await request(app)
      .post('/api/prospects/research')
      .send({ companyName: 'WidgetCorp', industry: 'Manufacturing' });
    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('id');
  });

  it('GET /api/prospects returns success true', async () => {
    (prisma.mktProspectResearch.findMany as jest.Mock).mockResolvedValue([]);
    const res = await request(app).get('/api/prospects');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('POST /research with industry field included calls create once', async () => {
    (prisma.mktProspectResearch.create as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    await request(app)
      .post('/api/prospects/research')
      .send({ companyName: 'Acme Ltd', industry: 'Technology' });
    expect(prisma.mktProspectResearch.create).toHaveBeenCalledTimes(1);
  });
});
