import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    crmLead: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    crmContact: {
      create: jest.fn(),
      update: jest.fn(),
    },
    crmAccount: {
      create: jest.fn(),
    },
    crmDeal: {
      create: jest.fn(),
      count: jest.fn(),
    },
    crmDealContact: {
      create: jest.fn(),
    },
  },
  Prisma: { Decimal: jest.fn((v: any) => v) },
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
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/leads', leadsRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

const mockLead = {
  id: '00000000-0000-0000-0000-000000000001',
  refNumber: 'LEAD-2602-0001',
  firstName: 'Jane',
  lastName: 'Smith',
  email: 'jane@example.com',
  phone: '+1234567890',
  company: 'TechCorp',
  source: 'REFERRAL',
  status: 'NEW',
  score: 50,
  notes: null,
  qualifiedAt: null,
  disqualifiedAt: null,
  disqualifyReason: null,
  convertedDealId: null,
  convertedContactId: null,
  convertedAccountId: null,
  createdBy: 'user-123',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

// ===================================================================
// POST /api/leads
// ===================================================================

describe('POST /api/leads', () => {
  it('should create lead with score calculated', async () => {
    mockPrisma.crmLead.count.mockResolvedValue(0);
    mockPrisma.crmLead.create.mockResolvedValue(mockLead);

    const res = await request(app).post('/api/leads').send({
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      company: 'TechCorp',
      source: 'REFERRAL',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(mockPrisma.crmLead.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          score: 50, // base 10 + REFERRAL 30 + company 10
        }),
      })
    );
  });

  it('should calculate score for INBOUND source', async () => {
    mockPrisma.crmLead.count.mockResolvedValue(0);
    mockPrisma.crmLead.create.mockResolvedValue({ ...mockLead, score: 30, source: 'INBOUND' });

    const res = await request(app).post('/api/leads').send({
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      source: 'INBOUND',
    });

    expect(res.status).toBe(201);
    expect(mockPrisma.crmLead.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          score: 30, // base 10 + INBOUND 20
        }),
      })
    );
  });

  it('should calculate score for EVENT source with company', async () => {
    mockPrisma.crmLead.count.mockResolvedValue(0);
    mockPrisma.crmLead.create.mockResolvedValue({ ...mockLead, score: 35 });

    const res = await request(app).post('/api/leads').send({
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      source: 'EVENT',
      company: 'SomeCo',
    });

    expect(res.status).toBe(201);
    expect(mockPrisma.crmLead.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          score: 35, // base 10 + EVENT 15 + company 10
        }),
      })
    );
  });

  it('should calculate base score when no source', async () => {
    mockPrisma.crmLead.count.mockResolvedValue(0);
    mockPrisma.crmLead.create.mockResolvedValue({ ...mockLead, score: 10 });

    const res = await request(app).post('/api/leads').send({
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
    });

    expect(res.status).toBe(201);
    expect(mockPrisma.crmLead.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          score: 10, // base only
        }),
      })
    );
  });

  it('should return 400 for missing email', async () => {
    const res = await request(app).post('/api/leads').send({
      firstName: 'Jane',
      lastName: 'Smith',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 for missing firstName', async () => {
    const res = await request(app).post('/api/leads').send({
      lastName: 'Smith',
      email: 'jane@example.com',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 for missing lastName', async () => {
    const res = await request(app).post('/api/leads').send({
      firstName: 'Jane',
      email: 'jane@example.com',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 for invalid email', async () => {
    const res = await request(app).post('/api/leads').send({
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'invalid',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should generate sequential ref number', async () => {
    mockPrisma.crmLead.count.mockResolvedValue(5);
    mockPrisma.crmLead.create.mockResolvedValue({ ...mockLead, refNumber: 'LEAD-2602-0006' });

    const res = await request(app).post('/api/leads').send({
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
    });

    expect(res.status).toBe(201);
  });

  it('should return 500 on database error', async () => {
    mockPrisma.crmLead.count.mockResolvedValue(0);
    mockPrisma.crmLead.create.mockRejectedValue(new Error('DB error'));

    const res = await request(app).post('/api/leads').send({
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
    });

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// GET /api/leads
// ===================================================================

describe('GET /api/leads', () => {
  it('should return paginated list', async () => {
    mockPrisma.crmLead.findMany.mockResolvedValue([mockLead]);
    mockPrisma.crmLead.count.mockResolvedValue(1);

    const res = await request(app).get('/api/leads');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination).toBeDefined();
  });

  it('should filter by status', async () => {
    mockPrisma.crmLead.findMany.mockResolvedValue([]);
    mockPrisma.crmLead.count.mockResolvedValue(0);

    const res = await request(app).get('/api/leads?status=QUALIFIED');

    expect(res.status).toBe(200);
    expect(mockPrisma.crmLead.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'QUALIFIED' }),
      })
    );
  });

  it('should filter by source', async () => {
    mockPrisma.crmLead.findMany.mockResolvedValue([]);
    mockPrisma.crmLead.count.mockResolvedValue(0);

    const res = await request(app).get('/api/leads?source=REFERRAL');

    expect(res.status).toBe(200);
    expect(mockPrisma.crmLead.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ source: 'REFERRAL' }),
      })
    );
  });

  it('should search by name/email/company', async () => {
    mockPrisma.crmLead.findMany.mockResolvedValue([]);
    mockPrisma.crmLead.count.mockResolvedValue(0);

    const res = await request(app).get('/api/leads?search=jane');

    expect(res.status).toBe(200);
    expect(mockPrisma.crmLead.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            expect.objectContaining({ firstName: expect.objectContaining({ contains: 'jane' }) }),
          ]),
        }),
      })
    );
  });

  it('should return empty array when no leads', async () => {
    mockPrisma.crmLead.findMany.mockResolvedValue([]);
    mockPrisma.crmLead.count.mockResolvedValue(0);

    const res = await request(app).get('/api/leads');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it('should handle pagination', async () => {
    mockPrisma.crmLead.findMany.mockResolvedValue([]);
    mockPrisma.crmLead.count.mockResolvedValue(40);

    const res = await request(app).get('/api/leads?page=2&limit=10');

    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(2);
    expect(res.body.pagination.totalPages).toBe(4);
  });

  it('should return 500 on database error', async () => {
    mockPrisma.crmLead.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/leads');

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// GET /api/leads/:id
// ===================================================================

describe('GET /api/leads/:id', () => {
  it('should return lead detail', async () => {
    mockPrisma.crmLead.findFirst.mockResolvedValue(mockLead);

    const res = await request(app).get('/api/leads/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 404 when not found', async () => {
    mockPrisma.crmLead.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/leads/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should return 500 on database error', async () => {
    mockPrisma.crmLead.findFirst.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/leads/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// PUT /api/leads/:id
// ===================================================================

describe('PUT /api/leads/:id', () => {
  it('should update lead', async () => {
    mockPrisma.crmLead.findFirst.mockResolvedValue(mockLead);
    mockPrisma.crmLead.update.mockResolvedValue({ ...mockLead, company: 'NewCorp' });

    const res = await request(app)
      .put('/api/leads/00000000-0000-0000-0000-000000000001')
      .send({ company: 'NewCorp' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should recalculate score when source changes', async () => {
    mockPrisma.crmLead.findFirst.mockResolvedValue(mockLead);
    mockPrisma.crmLead.update.mockResolvedValue({ ...mockLead, source: 'PARTNER', score: 45 });

    const res = await request(app)
      .put('/api/leads/00000000-0000-0000-0000-000000000001')
      .send({ source: 'PARTNER' });

    expect(res.status).toBe(200);
    expect(mockPrisma.crmLead.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ score: expect.any(Number) }),
      })
    );
  });

  it('should return 404 when not found', async () => {
    mockPrisma.crmLead.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/leads/00000000-0000-0000-0000-000000000099')
      .send({ company: 'Test' });

    expect(res.status).toBe(404);
  });

  it('should return 500 on database error', async () => {
    mockPrisma.crmLead.findFirst.mockResolvedValue(mockLead);
    mockPrisma.crmLead.update.mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .put('/api/leads/00000000-0000-0000-0000-000000000001')
      .send({ company: 'Test' });

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// PUT /api/leads/:id/qualify
// ===================================================================

describe('PUT /api/leads/:id/qualify', () => {
  it('should convert lead to deal + contact + account', async () => {
    mockPrisma.crmLead.findFirst.mockResolvedValue(mockLead);
    mockPrisma.crmContact.create.mockResolvedValue({
      id: 'contact-new',
      firstName: 'Jane',
      lastName: 'Smith',
    });
    mockPrisma.crmContact.update.mockResolvedValue({});
    mockPrisma.crmAccount.create.mockResolvedValue({ id: 'acc-new', name: 'TechCorp' });
    mockPrisma.crmDeal.count.mockResolvedValue(0);
    mockPrisma.crmDeal.create.mockResolvedValue({
      id: 'deal-new',
      refNumber: 'DEAL-2602-0001',
      title: 'Jane Smith - Qualified Lead',
    });
    mockPrisma.crmDealContact.create.mockResolvedValue({});
    mockPrisma.crmLead.update.mockResolvedValue({ ...mockLead, status: 'QUALIFIED' });

    const res = await request(app).put('/api/leads/00000000-0000-0000-0000-000000000001/qualify');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.contact).toBeDefined();
    expect(res.body.data.account).toBeDefined();
    expect(res.body.data.deal).toBeDefined();
  });

  it('should qualify lead without company (no account created)', async () => {
    const leadNoCompany = { ...mockLead, company: null };
    mockPrisma.crmLead.findFirst.mockResolvedValue(leadNoCompany);
    mockPrisma.crmContact.create.mockResolvedValue({ id: 'contact-new' });
    mockPrisma.crmDeal.count.mockResolvedValue(0);
    mockPrisma.crmDeal.create.mockResolvedValue({
      id: 'deal-new',
      refNumber: 'DEAL-2602-0001',
    });
    mockPrisma.crmDealContact.create.mockResolvedValue({});
    mockPrisma.crmLead.update.mockResolvedValue({ ...leadNoCompany, status: 'QUALIFIED' });

    const res = await request(app).put('/api/leads/00000000-0000-0000-0000-000000000001/qualify');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.account).toBeNull();
    expect(mockPrisma.crmAccount.create).not.toHaveBeenCalled();
  });

  it('should return 400 if already qualified', async () => {
    mockPrisma.crmLead.findFirst.mockResolvedValue({ ...mockLead, status: 'QUALIFIED' });

    const res = await request(app).put('/api/leads/00000000-0000-0000-0000-000000000001/qualify');

    expect(res.status).toBe(400);
    expect(res.body.error.message).toContain('already qualified');
  });

  it('should return 400 if lead is disqualified', async () => {
    mockPrisma.crmLead.findFirst.mockResolvedValue({ ...mockLead, status: 'DISQUALIFIED' });

    const res = await request(app).put('/api/leads/00000000-0000-0000-0000-000000000001/qualify');

    expect(res.status).toBe(400);
    expect(res.body.error.message).toContain('disqualified');
  });

  it('should return 404 when lead not found', async () => {
    mockPrisma.crmLead.findFirst.mockResolvedValue(null);

    const res = await request(app).put('/api/leads/00000000-0000-0000-0000-000000000099/qualify');

    expect(res.status).toBe(404);
  });

  it('should return 500 on database error', async () => {
    mockPrisma.crmLead.findFirst.mockResolvedValue(mockLead);
    mockPrisma.crmContact.create.mockRejectedValue(new Error('DB error'));

    const res = await request(app).put('/api/leads/00000000-0000-0000-0000-000000000001/qualify');

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// PUT /api/leads/:id/disqualify
// ===================================================================

describe('PUT /api/leads/:id/disqualify', () => {
  it('should disqualify lead', async () => {
    mockPrisma.crmLead.findFirst.mockResolvedValue(mockLead);
    mockPrisma.crmLead.update.mockResolvedValue({
      ...mockLead,
      status: 'DISQUALIFIED',
      disqualifyReason: 'Not a fit',
    });

    const res = await request(app)
      .put('/api/leads/00000000-0000-0000-0000-000000000001/disqualify')
      .send({
        disqualifyReason: 'Not a fit',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('DISQUALIFIED');
  });

  it('should return 400 for missing reason', async () => {
    mockPrisma.crmLead.findFirst.mockResolvedValue(mockLead);

    const res = await request(app)
      .put('/api/leads/00000000-0000-0000-0000-000000000001/disqualify')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 for empty reason', async () => {
    mockPrisma.crmLead.findFirst.mockResolvedValue(mockLead);

    const res = await request(app)
      .put('/api/leads/00000000-0000-0000-0000-000000000001/disqualify')
      .send({
        disqualifyReason: '',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 if already disqualified', async () => {
    mockPrisma.crmLead.findFirst.mockResolvedValue({ ...mockLead, status: 'DISQUALIFIED' });

    const res = await request(app)
      .put('/api/leads/00000000-0000-0000-0000-000000000001/disqualify')
      .send({
        disqualifyReason: 'Not a fit',
      });

    expect(res.status).toBe(400);
    expect(res.body.error.message).toContain('already disqualified');
  });

  it('should return 404 when not found', async () => {
    mockPrisma.crmLead.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/leads/00000000-0000-0000-0000-000000000099/disqualify')
      .send({
        disqualifyReason: 'Not a fit',
      });

    expect(res.status).toBe(404);
  });

  it('should return 500 on database error', async () => {
    mockPrisma.crmLead.findFirst.mockResolvedValue(mockLead);
    mockPrisma.crmLead.update.mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .put('/api/leads/00000000-0000-0000-0000-000000000001/disqualify')
      .send({
        disqualifyReason: 'Not a fit',
      });

    expect(res.status).toBe(500);
  });
});

describe('CRM Leads — additional coverage', () => {
  it('GET / returns content-type application/json', async () => {
    mockPrisma.crmLead.findMany.mockResolvedValue([]);
    mockPrisma.crmLead.count.mockResolvedValue(0);
    const res = await request(app).get('/api/leads');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });

  it('GET / data is an array', async () => {
    mockPrisma.crmLead.findMany.mockResolvedValue([]);
    mockPrisma.crmLead.count.mockResolvedValue(0);
    const res = await request(app).get('/api/leads');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST / response data has a refNumber field', async () => {
    mockPrisma.crmLead.count.mockResolvedValue(0);
    mockPrisma.crmLead.create.mockResolvedValue(mockLead);
    const res = await request(app)
      .post('/api/leads')
      .send({ firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com' });
    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('refNumber');
  });

  it('GET /:id returns data with id property', async () => {
    mockPrisma.crmLead.findFirst.mockResolvedValue(mockLead);
    const res = await request(app).get('/api/leads/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('id');
  });
});
