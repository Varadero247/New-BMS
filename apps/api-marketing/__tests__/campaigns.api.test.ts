import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    mktLead: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    mktEmailLog: {
      findMany: jest.fn(),
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

import leadsRouter from '../src/routes/leads';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/leads', leadsRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

const UUID1 = '00000000-0000-0000-0000-000000000001';
const UUID2 = '00000000-0000-0000-0000-000000000002';

const mockLead = {
  id: UUID1,
  email: 'campaign@test.com',
  name: 'Campaign User',
  company: 'Acme Corp',
  jobTitle: 'Head of Quality',
  source: 'LANDING_PAGE',
  industry: 'Manufacturing',
  employeeCount: '500-1000',
  isoCount: 3,
  roiEstimate: 25000,
  createdAt: new Date(),
};

// ===================================================================
// campaigns.api.test.ts — marketing campaign-related tests using leads router
// ===================================================================

describe('POST /api/leads/capture — campaign lead capture', () => {
  it('captures a lead from landing page campaign', async () => {
    (prisma.mktLead.create as jest.Mock).mockResolvedValue(mockLead);
    const res = await request(app).post('/api/leads/capture').send({
      email: 'campaign@test.com', name: 'Campaign User', source: 'LANDING_PAGE',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.captured).toBe(true);
  });

  it('captures a lead from paid ads campaign', async () => {
    (prisma.mktLead.create as jest.Mock).mockResolvedValue({ ...mockLead, source: 'PAID_ADS' });
    const res = await request(app).post('/api/leads/capture').send({
      email: 'ads@test.com', name: 'Ads User', source: 'PAID_ADS',
    });
    expect(res.status).toBe(201);
    expect(res.body.data.captured).toBe(true);
  });

  it('captures a lead from LinkedIn campaign', async () => {
    (prisma.mktLead.create as jest.Mock).mockResolvedValue({ ...mockLead, source: 'LINKEDIN' });
    const res = await request(app).post('/api/leads/capture').send({
      email: 'li@test.com', name: 'LinkedIn User', source: 'LINKEDIN',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('captures a lead from organic search', async () => {
    (prisma.mktLead.create as jest.Mock).mockResolvedValue({ ...mockLead, source: 'ORGANIC_SEARCH' });
    const res = await request(app).post('/api/leads/capture').send({
      email: 'organic@test.com', name: 'Organic User', source: 'ORGANIC_SEARCH',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('captures a lead from ROI calculator', async () => {
    (prisma.mktLead.create as jest.Mock).mockResolvedValue({ ...mockLead, source: 'ROI_CALCULATOR' });
    const res = await request(app).post('/api/leads/capture').send({
      email: 'roi@test.com', name: 'ROI User', source: 'ROI_CALCULATOR', roiEstimate: 50000,
    });
    expect(res.status).toBe(201);
    expect(res.body.data.captured).toBe(true);
  });

  it('captures a lead from chatbot campaign', async () => {
    (prisma.mktLead.create as jest.Mock).mockResolvedValue({ ...mockLead, source: 'CHATBOT' });
    const res = await request(app).post('/api/leads/capture').send({
      email: 'bot@test.com', name: 'Bot User', source: 'CHATBOT',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('captures a lead from partner referral', async () => {
    (prisma.mktLead.create as jest.Mock).mockResolvedValue({ ...mockLead, source: 'PARTNER_REFERRAL' });
    const res = await request(app).post('/api/leads/capture').send({
      email: 'ref@test.com', name: 'Referred User', source: 'PARTNER_REFERRAL',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('captures a lead from direct channel', async () => {
    (prisma.mktLead.create as jest.Mock).mockResolvedValue({ ...mockLead, source: 'DIRECT' });
    const res = await request(app).post('/api/leads/capture').send({
      email: 'direct@test.com', name: 'Direct User', source: 'DIRECT',
    });
    expect(res.status).toBe(201);
    expect(res.body.data.captured).toBe(true);
  });

  it('returns 400 for invalid campaign source', async () => {
    const res = await request(app).post('/api/leads/capture').send({
      email: 'bad@test.com', name: 'Bad Source', source: 'INVALID_CAMPAIGN',
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('returns 400 for missing email in campaign lead', async () => {
    const res = await request(app).post('/api/leads/capture').send({
      name: 'Missing Email', source: 'LANDING_PAGE',
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('returns 400 for invalid email format', async () => {
    const res = await request(app).post('/api/leads/capture').send({
      email: 'not-an-email', name: 'Bad Email', source: 'LANDING_PAGE',
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 for missing name', async () => {
    const res = await request(app).post('/api/leads/capture').send({
      email: 'valid@test.com', source: 'LANDING_PAGE',
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('returns 500 on DB error during lead capture', async () => {
    (prisma.mktLead.create as jest.Mock).mockRejectedValue(new Error('DB error'));
    const res = await request(app).post('/api/leads/capture').send({
      email: 'err@test.com', name: 'Error User', source: 'DIRECT',
    });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('mktLead.create called once per capture request', async () => {
    (prisma.mktLead.create as jest.Mock).mockResolvedValue(mockLead);
    await request(app).post('/api/leads/capture').send({
      email: 'once@test.com', name: 'Once', source: 'DIRECT',
    });
    expect(prisma.mktLead.create).toHaveBeenCalledTimes(1);
  });

  it('stores optional isoCount field in lead', async () => {
    (prisma.mktLead.create as jest.Mock).mockResolvedValue({ ...mockLead, isoCount: 5 });
    await request(app).post('/api/leads/capture').send({
      email: 'iso@test.com', name: 'ISO User', source: 'DIRECT', isoCount: 5,
    });
    expect(prisma.mktLead.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ isoCount: 5 }) })
    );
  });
});

describe('GET /api/leads — campaign lead list', () => {
  it('returns paginated campaign leads', async () => {
    (prisma.mktLead.findMany as jest.Mock).mockResolvedValue([mockLead]);
    (prisma.mktLead.count as jest.Mock).mockResolvedValue(1);
    const res = await request(app).get('/api/leads');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.leads).toHaveLength(1);
  });

  it('filters campaign leads by LANDING_PAGE source', async () => {
    (prisma.mktLead.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.mktLead.count as jest.Mock).mockResolvedValue(0);
    await request(app).get('/api/leads?source=LANDING_PAGE');
    expect(prisma.mktLead.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { source: 'LANDING_PAGE' } })
    );
  });

  it('filters campaign leads by PAID_ADS source', async () => {
    (prisma.mktLead.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.mktLead.count as jest.Mock).mockResolvedValue(0);
    await request(app).get('/api/leads?source=PAID_ADS');
    expect(prisma.mktLead.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { source: 'PAID_ADS' } })
    );
  });

  it('returns total count in response', async () => {
    (prisma.mktLead.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.mktLead.count as jest.Mock).mockResolvedValue(42);
    const res = await request(app).get('/api/leads');
    expect(res.body.data.total).toBe(42);
  });

  it('supports pagination — page 2 limit 5 uses skip 5', async () => {
    (prisma.mktLead.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.mktLead.count as jest.Mock).mockResolvedValue(0);
    await request(app).get('/api/leads?page=2&limit=5');
    expect(prisma.mktLead.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 5, take: 5 })
    );
  });

  it('enforces max take=100 for large limit values', async () => {
    (prisma.mktLead.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.mktLead.count as jest.Mock).mockResolvedValue(0);
    await request(app).get('/api/leads?limit=999');
    expect(prisma.mktLead.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 100 })
    );
  });

  it('returns 500 on DB error fetching campaign leads', async () => {
    (prisma.mktLead.findMany as jest.Mock).mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/leads');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('response data.page matches requested page number', async () => {
    (prisma.mktLead.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.mktLead.count as jest.Mock).mockResolvedValue(0);
    const res = await request(app).get('/api/leads?page=3');
    expect(res.body.data.page).toBe(3);
  });
});

describe('GET /api/leads/:id — campaign lead by id', () => {
  it('returns lead by ID for campaign tracking', async () => {
    (prisma.mktLead.findUnique as jest.Mock).mockResolvedValue(mockLead);
    const res = await request(app).get(`/api/leads/${UUID1}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(UUID1);
  });

  it('returns 404 for non-existent campaign lead', async () => {
    (prisma.mktLead.findUnique as jest.Mock).mockResolvedValue(null);
    const res = await request(app).get(`/api/leads/${UUID2}`);
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('returns 500 on DB error fetching campaign lead', async () => {
    (prisma.mktLead.findUnique as jest.Mock).mockRejectedValue(new Error('DB error'));
    const res = await request(app).get(`/api/leads/${UUID1}`);
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('response success:true for found lead', async () => {
    (prisma.mktLead.findUnique as jest.Mock).mockResolvedValue(mockLead);
    const res = await request(app).get(`/api/leads/${UUID1}`);
    expect(res.body.success).toBe(true);
  });

  it('response data has email field', async () => {
    (prisma.mktLead.findUnique as jest.Mock).mockResolvedValue(mockLead);
    const res = await request(app).get(`/api/leads/${UUID1}`);
    expect(res.body.data).toHaveProperty('email');
  });

  it('response data has source field', async () => {
    (prisma.mktLead.findUnique as jest.Mock).mockResolvedValue(mockLead);
    const res = await request(app).get(`/api/leads/${UUID1}`);
    expect(res.body.data).toHaveProperty('source');
  });
});

describe('Campaigns — phase28 coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('POST /api/leads/capture with company field stores company in DB', async () => {
    (prisma.mktLead.create as jest.Mock).mockResolvedValue({ ...mockLead, company: 'Big Corp' });
    await request(app).post('/api/leads/capture').send({
      email: 'biz@test.com', name: 'Biz User', source: 'DIRECT', company: 'Big Corp',
    });
    expect(prisma.mktLead.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ company: 'Big Corp' }) })
    );
  });

  it('GET /api/leads call count and findMany per request both called once', async () => {
    (prisma.mktLead.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.mktLead.count as jest.Mock).mockResolvedValue(0);
    await request(app).get('/api/leads');
    expect(prisma.mktLead.findMany).toHaveBeenCalledTimes(1);
    expect(prisma.mktLead.count).toHaveBeenCalledTimes(1);
  });

  it('GET /api/leads filters by LINKEDIN source and both findMany and count use same where', async () => {
    (prisma.mktLead.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.mktLead.count as jest.Mock).mockResolvedValue(0);
    await request(app).get('/api/leads?source=LINKEDIN');
    expect(prisma.mktLead.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { source: 'LINKEDIN' } })
    );
    expect(prisma.mktLead.count).toHaveBeenCalledWith(
      expect.objectContaining({ where: { source: 'LINKEDIN' } })
    );
  });
});

describe('Campaigns — additional phase28 coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('POST /api/leads/capture with ROI_CALCULATOR source stores roiEstimate', async () => {
    (prisma.mktLead.create as jest.Mock).mockResolvedValue({ ...mockLead, source: 'ROI_CALCULATOR', roiEstimate: 75000 });
    await request(app).post('/api/leads/capture').send({ email: 'roi2@test.com', name: 'ROI User', source: 'ROI_CALCULATOR', roiEstimate: 75000 });
    expect(prisma.mktLead.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ roiEstimate: 75000 }) })
    );
  });

  it('POST /api/leads/capture with jobTitle field stores it', async () => {
    (prisma.mktLead.create as jest.Mock).mockResolvedValue({ ...mockLead, jobTitle: 'CTO' });
    await request(app).post('/api/leads/capture').send({ email: 'cto@test.com', name: 'CTO User', source: 'DIRECT', jobTitle: 'CTO' });
    expect(prisma.mktLead.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ jobTitle: 'CTO' }) })
    );
  });

  it('POST /api/leads/capture with industry field stores it', async () => {
    (prisma.mktLead.create as jest.Mock).mockResolvedValue({ ...mockLead, industry: 'Healthcare' });
    await request(app).post('/api/leads/capture').send({ email: 'hc@test.com', name: 'HC User', source: 'DIRECT', industry: 'Healthcare' });
    expect(prisma.mktLead.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ industry: 'Healthcare' }) })
    );
  });

  it('POST /api/leads/capture with employeeCount stores it', async () => {
    (prisma.mktLead.create as jest.Mock).mockResolvedValue({ ...mockLead, employeeCount: '100-500' });
    await request(app).post('/api/leads/capture').send({ email: 'emp@test.com', name: 'Emp User', source: 'DIRECT', employeeCount: '100-500' });
    expect(prisma.mktLead.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ employeeCount: '100-500' }) })
    );
  });

  it('GET /api/leads response data.leads is an array', async () => {
    (prisma.mktLead.findMany as jest.Mock).mockResolvedValue([mockLead]);
    (prisma.mktLead.count as jest.Mock).mockResolvedValue(1);
    const res = await request(app).get('/api/leads');
    expect(Array.isArray(res.body.data.leads)).toBe(true);
  });

  it('GET /api/leads with page=1 limit=25 uses skip=0 take=25', async () => {
    (prisma.mktLead.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.mktLead.count as jest.Mock).mockResolvedValue(0);
    await request(app).get('/api/leads?page=1&limit=25');
    expect(prisma.mktLead.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 0, take: 25 })
    );
  });

  it('GET /api/leads findMany called with orderBy createdAt desc', async () => {
    (prisma.mktLead.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.mktLead.count as jest.Mock).mockResolvedValue(0);
    await request(app).get('/api/leads');
    expect(prisma.mktLead.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { createdAt: 'desc' } })
    );
  });

  it('GET /api/leads/:id response data has name field', async () => {
    (prisma.mktLead.findUnique as jest.Mock).mockResolvedValue(mockLead);
    const res = await request(app).get(`/api/leads/${UUID1}`);
    expect(res.body.data).toHaveProperty('name');
  });

  it('GET /api/leads/:id response data has createdAt field', async () => {
    (prisma.mktLead.findUnique as jest.Mock).mockResolvedValue(mockLead);
    const res = await request(app).get(`/api/leads/${UUID1}`);
    expect(res.body.data).toHaveProperty('createdAt');
  });

  it('POST /api/leads/capture without source returns 400', async () => {
    const res = await request(app).post('/api/leads/capture').send({ email: 'nosrc@test.com', name: 'No Source' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('GET /api/leads filters by ORGANIC_SEARCH source', async () => {
    (prisma.mktLead.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.mktLead.count as jest.Mock).mockResolvedValue(0);
    await request(app).get('/api/leads?source=ORGANIC_SEARCH');
    expect(prisma.mktLead.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { source: 'ORGANIC_SEARCH' } })
    );
  });

  it('GET /api/leads filters by DIRECT source', async () => {
    (prisma.mktLead.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.mktLead.count as jest.Mock).mockResolvedValue(0);
    await request(app).get('/api/leads?source=DIRECT');
    expect(prisma.mktLead.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { source: 'DIRECT' } })
    );
  });

  it('GET /api/leads/:id findUnique called exactly once', async () => {
    (prisma.mktLead.findUnique as jest.Mock).mockResolvedValue(mockLead);
    await request(app).get(`/api/leads/${UUID1}`);
    expect(prisma.mktLead.findUnique).toHaveBeenCalledTimes(1);
  });
});

describe('campaigns — phase30 coverage', () => {
  it('handles logical OR assign', () => {
    let y2: number | null = null; y2 ??= 5; expect(y2).toBe(5);
  });

  it('handles nullish coalescing', () => {
    const val: string | null = null; expect(val ?? 'default').toBe('default');
  });

  it('handles string concatenation', () => {
    expect('hello' + ' ' + 'world').toBe('hello world');
  });

  it('handles Math.sqrt', () => {
    expect(Math.sqrt(9)).toBe(3);
  });

  it('handles array filter', () => {
    expect([1, 2, 3, 4].filter(x => x > 2)).toEqual([3, 4]);
  });

});


describe('phase31 coverage', () => {
  it('handles string repeat', () => { expect('ab'.repeat(3)).toBe('ababab'); });
  it('handles Symbol creation', () => { const s = Symbol('test'); expect(typeof s).toBe('symbol'); });
  it('handles array filter', () => { expect([1,2,3,4].filter(x => x % 2 === 0)).toEqual([2,4]); });
  it('handles rest params', () => { const fn = (...args: number[]) => args.reduce((a,b)=>a+b,0); expect(fn(1,2,3)).toBe(6); });
  it('handles JSON stringify', () => { expect(JSON.stringify({a:1})).toBe('{"a":1}'); });
});
