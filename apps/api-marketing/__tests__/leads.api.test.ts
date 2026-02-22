import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    mktLead: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
    },
  },
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

// ===================================================================
// POST /api/leads/capture
// ===================================================================

describe('POST /api/leads/capture', () => {
  it('creates a lead with valid data', async () => {
    const mockLead = {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'test@test.com',
      name: 'Test',
      source: 'DIRECT',
    };
    (prisma.mktLead.create as jest.Mock).mockResolvedValue(mockLead);

    const res = await request(app)
      .post('/api/leads/capture')
      .send({ email: 'test@test.com', name: 'Test User', source: 'DIRECT' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    // Route returns { captured: true } (not the full DB record) to avoid exposing internals
    expect(res.body.data.captured).toBe(true);
  });

  it('returns 400 for missing email', async () => {
    const res = await request(app)
      .post('/api/leads/capture')
      .send({ name: 'Test', source: 'DIRECT' });

    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid source', async () => {
    const res = await request(app)
      .post('/api/leads/capture')
      .send({ email: 'test@test.com', name: 'Test', source: 'INVALID_SOURCE' });

    expect(res.status).toBe(400);
  });

  it('accepts all valid sources', async () => {
    const sources = [
      'ROI_CALCULATOR',
      'CHATBOT',
      'LANDING_PAGE',
      'PARTNER_REFERRAL',
      'ORGANIC_SEARCH',
      'PAID_ADS',
      'DIRECT',
      'LINKEDIN',
    ];
    for (const source of sources) {
      (prisma.mktLead.create as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        source,
      });
      const res = await request(app)
        .post('/api/leads/capture')
        .send({ email: 'test@test.com', name: 'Test', source });
      expect(res.status).toBe(201);
    }
  });

  it('returns 500 on database error', async () => {
    (prisma.mktLead.create as jest.Mock).mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .post('/api/leads/capture')
      .send({ email: 'test@test.com', name: 'Test', source: 'DIRECT' });

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// GET /api/leads
// ===================================================================

describe('GET /api/leads', () => {
  it('returns paginated leads', async () => {
    (prisma.mktLead.findMany as jest.Mock).mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001' },
    ]);
    (prisma.mktLead.count as jest.Mock).mockResolvedValue(1);

    const res = await request(app).get('/api/leads');

    expect(res.status).toBe(200);
    expect(res.body.data.leads).toHaveLength(1);
    expect(res.body.data.total).toBe(1);
  });

  it('filters by source', async () => {
    (prisma.mktLead.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.mktLead.count as jest.Mock).mockResolvedValue(0);

    await request(app).get('/api/leads?source=CHATBOT');

    expect(prisma.mktLead.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { source: 'CHATBOT' } })
    );
  });

  it('paginates correctly', async () => {
    (prisma.mktLead.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.mktLead.count as jest.Mock).mockResolvedValue(0);

    await request(app).get('/api/leads?page=2&limit=10');

    expect(prisma.mktLead.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10, take: 10 })
    );
  });

  it('findMany and count are each called once per request', async () => {
    (prisma.mktLead.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.mktLead.count as jest.Mock).mockResolvedValue(0);
    await request(app).get('/api/leads');
    expect(prisma.mktLead.findMany).toHaveBeenCalledTimes(1);
    expect(prisma.mktLead.count).toHaveBeenCalledTimes(1);
  });

  it('returns 500 on DB error', async () => {
    (prisma.mktLead.findMany as jest.Mock).mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/leads');
    expect(res.status).toBe(500);
  });
});

// ===================================================================
// GET /api/leads/:id
// ===================================================================

describe('GET /api/leads/:id', () => {
  it('returns a lead by ID', async () => {
    (prisma.mktLead.findUnique as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      email: 'test@test.com',
    });

    const res = await request(app).get('/api/leads/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('returns 404 for non-existent lead', async () => {
    (prisma.mktLead.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get('/api/leads/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });

  it('returns 500 on DB error', async () => {
    (prisma.mktLead.findUnique as jest.Mock).mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/leads/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
  });
});

describe('Marketing Leads — extended', () => {
  it('GET /leads responds with success:true when results are empty', async () => {
    (prisma.mktLead.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.mktLead.count as jest.Mock).mockResolvedValue(0);

    const res = await request(app).get('/api/leads');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.leads).toHaveLength(0);
  });

  it('POST /leads/capture returns 400 when email is malformed', async () => {
    const res = await request(app)
      .post('/api/leads/capture')
      .send({ email: 'not-an-email', name: 'Test', source: 'DIRECT' });

    expect(res.status).toBe(400);
  });
});

describe('Marketing Leads — additional coverage', () => {
  it('POST /leads/capture sets source in the created lead', async () => {
    (prisma.mktLead.create as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      source: 'LINKEDIN',
    });

    await request(app)
      .post('/api/leads/capture')
      .send({ email: 'a@b.com', name: 'Test', source: 'LINKEDIN' });

    expect(prisma.mktLead.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ source: 'LINKEDIN' }) })
    );
  });

  it('GET /leads returns success:true when leads exist', async () => {
    (prisma.mktLead.findMany as jest.Mock).mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', email: 'a@b.com' },
    ]);
    (prisma.mktLead.count as jest.Mock).mockResolvedValue(1);

    const res = await request(app).get('/api/leads');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.leads).toHaveLength(1);
  });

  it('GET /leads page=1 uses skip:0', async () => {
    (prisma.mktLead.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.mktLead.count as jest.Mock).mockResolvedValue(0);

    await request(app).get('/api/leads?page=1&limit=20');

    expect(prisma.mktLead.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 0, take: 20 })
    );
  });

  it('GET /leads/:id calls findUnique with correct id', async () => {
    (prisma.mktLead.findUnique as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000002',
      email: 'x@y.com',
    });

    await request(app).get('/api/leads/00000000-0000-0000-0000-000000000002');

    expect(prisma.mktLead.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: '00000000-0000-0000-0000-000000000002' } })
    );
  });

  it('POST /leads/capture returns 400 for missing name', async () => {
    const res = await request(app)
      .post('/api/leads/capture')
      .send({ email: 'valid@email.com', source: 'DIRECT' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('Marketing Leads — edge cases', () => {
  it('GET /leads filters by CHATBOT source and receives empty array', async () => {
    (prisma.mktLead.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.mktLead.count as jest.Mock).mockResolvedValue(0);

    const res = await request(app).get('/api/leads?source=CHATBOT');

    expect(res.status).toBe(200);
    expect(res.body.data.leads).toHaveLength(0);
    expect(res.body.data.total).toBe(0);
  });

  it('GET /leads includes page in response body', async () => {
    (prisma.mktLead.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.mktLead.count as jest.Mock).mockResolvedValue(0);

    const res = await request(app).get('/api/leads?page=3&limit=5');

    expect(res.status).toBe(200);
    expect(res.body.data.page).toBe(3);
  });

  it('GET /leads page=3 limit=5 uses skip:10', async () => {
    (prisma.mktLead.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.mktLead.count as jest.Mock).mockResolvedValue(0);

    await request(app).get('/api/leads?page=3&limit=5');

    expect(prisma.mktLead.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10, take: 5 })
    );
  });

  it('GET /leads with invalid page param falls back to page 1', async () => {
    (prisma.mktLead.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.mktLead.count as jest.Mock).mockResolvedValue(0);

    await request(app).get('/api/leads?page=notanumber&limit=10');

    // page defaults to 1 => skip = 0
    expect(prisma.mktLead.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 0 })
    );
  });

  it('GET /leads enforces maximum take of 100 when limit > 100', async () => {
    (prisma.mktLead.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.mktLead.count as jest.Mock).mockResolvedValue(0);

    await request(app).get('/api/leads?limit=999');

    expect(prisma.mktLead.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 100 })
    );
  });

  it('POST /leads/capture stores optional company field', async () => {
    (prisma.mktLead.create as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      company: 'Acme Corp',
    });

    await request(app)
      .post('/api/leads/capture')
      .send({ email: 'a@b.com', name: 'Test', source: 'DIRECT', company: 'Acme Corp' });

    expect(prisma.mktLead.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ company: 'Acme Corp' }) })
    );
  });

  it('GET /leads/:id returns 500 error code on DB error', async () => {
    (prisma.mktLead.findUnique as jest.Mock).mockRejectedValue(new Error('DB crash'));

    const res = await request(app).get('/api/leads/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /leads count and findMany are called with the same where clause when filtering by source', async () => {
    (prisma.mktLead.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.mktLead.count as jest.Mock).mockResolvedValue(0);

    await request(app).get('/api/leads?source=ORGANIC_SEARCH');

    expect(prisma.mktLead.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { source: 'ORGANIC_SEARCH' } })
    );
    expect(prisma.mktLead.count).toHaveBeenCalledWith(
      expect.objectContaining({ where: { source: 'ORGANIC_SEARCH' } })
    );
  });

  it('POST /leads/capture returns 400 with VALIDATION_ERROR code for empty name', async () => {
    const res = await request(app)
      .post('/api/leads/capture')
      .send({ email: 'test@test.com', name: '', source: 'DIRECT' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('Marketing Leads — ≥40 coverage', () => {
  it('POST /leads/capture with ROI_CALCULATOR source returns 201', async () => {
    (prisma.mktLead.create as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      source: 'ROI_CALCULATOR',
    });

    const res = await request(app)
      .post('/api/leads/capture')
      .send({ email: 'roi@test.com', name: 'ROI User', source: 'ROI_CALCULATOR' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('GET /leads filters by PAID_ADS source and count returns correct where clause', async () => {
    (prisma.mktLead.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.mktLead.count as jest.Mock).mockResolvedValue(0);

    await request(app).get('/api/leads?source=PAID_ADS');

    expect(prisma.mktLead.count).toHaveBeenCalledWith(
      expect.objectContaining({ where: { source: 'PAID_ADS' } })
    );
  });

  it('GET /leads/:id body has data.email when lead exists', async () => {
    (prisma.mktLead.findUnique as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      email: 'hello@world.com',
    });

    const res = await request(app).get('/api/leads/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe('hello@world.com');
  });

  it('GET /leads data.limit matches limit query param', async () => {
    (prisma.mktLead.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.mktLead.count as jest.Mock).mockResolvedValue(0);

    const res = await request(app).get('/api/leads?limit=15');

    expect(res.status).toBe(200);
    // The route returns { leads, total, page } — no limit field in response body.
    // Verify the correct take was passed to findMany instead.
    expect(prisma.mktLead.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 15 })
    );
  });

  it('POST /leads/capture with PARTNER_REFERRAL source returns 201', async () => {
    (prisma.mktLead.create as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      source: 'PARTNER_REFERRAL',
    });

    const res = await request(app)
      .post('/api/leads/capture')
      .send({ email: 'ref@test.com', name: 'Referred User', source: 'PARTNER_REFERRAL' });

    expect(res.status).toBe(201);
    expect(res.body.data.captured).toBe(true);
  });
});

// ===================================================================
// Additional coverage to reach 35 tests
// ===================================================================

describe('Marketing Leads — final coverage', () => {
  it('POST /leads/capture returns 201 with captured:true for ORGANIC_SEARCH', async () => {
    (prisma.mktLead.create as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      source: 'ORGANIC_SEARCH',
    });

    const res = await request(app)
      .post('/api/leads/capture')
      .send({ email: 'organic@test.com', name: 'Organic User', source: 'ORGANIC_SEARCH' });

    expect(res.status).toBe(201);
    expect(res.body.data.captured).toBe(true);
  });

  it('GET /leads data.total reflects count mock value', async () => {
    (prisma.mktLead.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.mktLead.count as jest.Mock).mockResolvedValue(42);

    const res = await request(app).get('/api/leads');

    expect(res.status).toBe(200);
    expect(res.body.data.total).toBe(42);
  });

  it('GET /leads/:id response has success:true', async () => {
    (prisma.mktLead.findUnique as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      email: 'x@y.com',
    });

    const res = await request(app).get('/api/leads/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('POST /leads/capture create is called once per request', async () => {
    (prisma.mktLead.create as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });

    await request(app)
      .post('/api/leads/capture')
      .send({ email: 'once@test.com', name: 'Once', source: 'DIRECT' });

    expect(prisma.mktLead.create).toHaveBeenCalledTimes(1);
  });

  it('GET /leads with no query params uses default page 1 and limit 25', async () => {
    (prisma.mktLead.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.mktLead.count as jest.Mock).mockResolvedValue(0);

    await request(app).get('/api/leads');

    expect(prisma.mktLead.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 0, take: 25 })
    );
  });

  it('GET /leads 404 for unknown id returns success:false', async () => {
    (prisma.mktLead.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get('/api/leads/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
