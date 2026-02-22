import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    crmCampaign: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    crmCampaignMember: {
      findMany: jest.fn(),
      create: jest.fn(),
      createMany: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    crmEmailSequence: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    crmEmailEnrollment: {
      create: jest.fn(),
      createMany: jest.fn(),
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

import { campaignRouter, emailSequenceRouter } from '../src/routes/campaigns';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/campaigns', campaignRouter);
app.use('/api/email-sequences', emailSequenceRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

const mockCampaign = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'Spring Promotion',
  type: 'EMAIL',
  status: 'DRAFT',
  startDate: null,
  endDate: null,
  budget: 5000,
  targetAudience: 'SMBs',
  description: 'Spring sale',
  createdBy: 'user-123',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

const mockSequence = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'Welcome Series',
  description: 'Onboarding emails',
  steps: [],
  status: 'DRAFT',
  createdBy: 'user-123',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

// ===================================================================
// CAMPAIGN ENDPOINTS
// ===================================================================

describe('POST /api/campaigns', () => {
  it('should create campaign with valid data', async () => {
    mockPrisma.crmCampaign.create.mockResolvedValue(mockCampaign);

    const res = await request(app).post('/api/campaigns').send({
      name: 'Spring Promotion',
      type: 'EMAIL',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Spring Promotion');
  });

  it('should create campaign with all optional fields', async () => {
    mockPrisma.crmCampaign.create.mockResolvedValue(mockCampaign);

    const res = await request(app).post('/api/campaigns').send({
      name: 'Spring Promotion',
      type: 'EVENT',
      budget: 10000,
      targetAudience: 'Enterprise',
      description: 'Big event',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should return 400 for missing name', async () => {
    const res = await request(app).post('/api/campaigns').send({
      type: 'EMAIL',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 for missing type', async () => {
    const res = await request(app).post('/api/campaigns').send({
      name: 'Test Campaign',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 for invalid type', async () => {
    const res = await request(app).post('/api/campaigns').send({
      name: 'Test Campaign',
      type: 'INVALID',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 500 on database error', async () => {
    mockPrisma.crmCampaign.create.mockRejectedValue(new Error('DB error'));

    const res = await request(app).post('/api/campaigns').send({
      name: 'Test',
      type: 'EMAIL',
    });

    expect(res.status).toBe(500);
  });
});

describe('GET /api/campaigns', () => {
  it('should return paginated list', async () => {
    mockPrisma.crmCampaign.findMany.mockResolvedValue([mockCampaign]);
    mockPrisma.crmCampaign.count.mockResolvedValue(1);

    const res = await request(app).get('/api/campaigns');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination).toBeDefined();
  });

  it('should filter by status', async () => {
    mockPrisma.crmCampaign.findMany.mockResolvedValue([]);
    mockPrisma.crmCampaign.count.mockResolvedValue(0);

    const res = await request(app).get('/api/campaigns?status=ACTIVE');

    expect(res.status).toBe(200);
    expect(mockPrisma.crmCampaign.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'ACTIVE' }),
      })
    );
  });

  it('should return empty array when no campaigns', async () => {
    mockPrisma.crmCampaign.findMany.mockResolvedValue([]);
    mockPrisma.crmCampaign.count.mockResolvedValue(0);

    const res = await request(app).get('/api/campaigns');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it('should return 500 on database error', async () => {
    mockPrisma.crmCampaign.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/campaigns');

    expect(res.status).toBe(500);
  });
});

describe('GET /api/campaigns/:id', () => {
  it('should return campaign detail with member count', async () => {
    mockPrisma.crmCampaign.findFirst.mockResolvedValue(mockCampaign);
    mockPrisma.crmCampaignMember.count.mockResolvedValue(15);

    const res = await request(app).get('/api/campaigns/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.memberCount).toBe(15);
  });

  it('should return 404 when not found', async () => {
    mockPrisma.crmCampaign.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/campaigns/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });

  it('should return 500 on database error', async () => {
    mockPrisma.crmCampaign.findFirst.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/campaigns/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(500);
  });
});

describe('GET /api/campaigns/:id/performance', () => {
  it('should return performance metrics', async () => {
    mockPrisma.crmCampaign.findFirst.mockResolvedValue(mockCampaign);
    mockPrisma.crmCampaignMember.findMany.mockResolvedValue([
      { id: 'm-1', status: 'SENT' },
      { id: 'm-2', status: 'OPENED' },
      { id: 'm-3', status: 'CLICKED' },
      { id: 'm-4', status: 'CONVERTED' },
    ]);

    const res = await request(app).get(
      '/api/campaigns/00000000-0000-0000-0000-000000000001/performance'
    );

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalMembers).toBe(4);
    expect(res.body.data.sent).toBe(4);
    expect(res.body.data.opened).toBe(3);
    expect(res.body.data.clicked).toBe(2);
    expect(res.body.data.converted).toBe(1);
    expect(res.body.data.openRate).toBeGreaterThan(0);
  });

  it('should return zero rates when no members', async () => {
    mockPrisma.crmCampaign.findFirst.mockResolvedValue(mockCampaign);
    mockPrisma.crmCampaignMember.findMany.mockResolvedValue([]);

    const res = await request(app).get(
      '/api/campaigns/00000000-0000-0000-0000-000000000001/performance'
    );

    expect(res.status).toBe(200);
    expect(res.body.data.totalMembers).toBe(0);
    expect(res.body.data.openRate).toBe(0);
  });

  it('should return 404 when not found', async () => {
    mockPrisma.crmCampaign.findFirst.mockResolvedValue(null);

    const res = await request(app).get(
      '/api/campaigns/00000000-0000-0000-0000-000000000099/performance'
    );

    expect(res.status).toBe(404);
  });
});

describe('POST /api/campaigns/:id/contacts', () => {
  it('should add contacts to campaign', async () => {
    mockPrisma.crmCampaign.findFirst.mockResolvedValue(mockCampaign);
    mockPrisma.crmCampaignMember.create.mockResolvedValue({
      id: 'member-1',
      campaignId: 'camp-1',
      contactId: 'c-1',
    });

    const res = await request(app)
      .post('/api/campaigns/00000000-0000-0000-0000-000000000001/contacts')
      .send({
        contactIds: ['c-1'],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('should return 400 for missing contactIds', async () => {
    mockPrisma.crmCampaign.findFirst.mockResolvedValue(mockCampaign);

    const res = await request(app)
      .post('/api/campaigns/00000000-0000-0000-0000-000000000001/contacts')
      .send({});

    expect(res.status).toBe(400);
  });

  it('should return 400 for empty contactIds array', async () => {
    mockPrisma.crmCampaign.findFirst.mockResolvedValue(mockCampaign);

    const res = await request(app)
      .post('/api/campaigns/00000000-0000-0000-0000-000000000001/contacts')
      .send({
        contactIds: [],
      });

    expect(res.status).toBe(400);
  });

  it('should return 404 when campaign not found', async () => {
    mockPrisma.crmCampaign.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/campaigns/00000000-0000-0000-0000-000000000099/contacts')
      .send({
        contactIds: ['c-1'],
      });

    expect(res.status).toBe(404);
  });
});

// ===================================================================
// EMAIL SEQUENCE ENDPOINTS
// ===================================================================

describe('POST /api/email-sequences', () => {
  it('should create email sequence', async () => {
    mockPrisma.crmEmailSequence.create.mockResolvedValue(mockSequence);

    const res = await request(app).post('/api/email-sequences').send({
      name: 'Welcome Series',
      description: 'Onboarding emails',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Welcome Series');
  });

  it('should return 400 for missing name', async () => {
    const res = await request(app).post('/api/email-sequences').send({
      description: 'No name',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 500 on database error', async () => {
    mockPrisma.crmEmailSequence.create.mockRejectedValue(new Error('DB error'));

    const res = await request(app).post('/api/email-sequences').send({
      name: 'Test',
    });

    expect(res.status).toBe(500);
  });
});

describe('GET /api/email-sequences', () => {
  it('should return list of sequences', async () => {
    mockPrisma.crmEmailSequence.findMany.mockResolvedValue([mockSequence]);
    mockPrisma.crmEmailSequence.count.mockResolvedValue(1);

    const res = await request(app).get('/api/email-sequences');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('should return empty array when none', async () => {
    mockPrisma.crmEmailSequence.findMany.mockResolvedValue([]);
    mockPrisma.crmEmailSequence.count.mockResolvedValue(0);

    const res = await request(app).get('/api/email-sequences');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });
});

describe('PUT /api/email-sequences/:id', () => {
  it('should update email sequence', async () => {
    mockPrisma.crmEmailSequence.findFirst.mockResolvedValue(mockSequence);
    mockPrisma.crmEmailSequence.update.mockResolvedValue({
      ...mockSequence,
      name: 'Updated Series',
    });

    const res = await request(app)
      .put('/api/email-sequences/00000000-0000-0000-0000-000000000001')
      .send({ name: 'Updated Series' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 when not found', async () => {
    mockPrisma.crmEmailSequence.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/email-sequences/00000000-0000-0000-0000-000000000099')
      .send({ name: 'Test' });

    expect(res.status).toBe(404);
  });
});

describe('PUT /api/email-sequences/:id/enroll', () => {
  it('should enroll contacts', async () => {
    mockPrisma.crmEmailSequence.findFirst.mockResolvedValue(mockSequence);
    mockPrisma.crmEmailEnrollment.create.mockResolvedValue({
      id: 'enroll-1',
      sequenceId: 'seq-1',
      contactId: 'c-1',
    });

    const res = await request(app)
      .put('/api/email-sequences/00000000-0000-0000-0000-000000000001/enroll')
      .send({
        contactIds: ['c-1', 'c-2'],
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 400 for missing contactIds', async () => {
    mockPrisma.crmEmailSequence.findFirst.mockResolvedValue(mockSequence);

    const res = await request(app)
      .put('/api/email-sequences/00000000-0000-0000-0000-000000000001/enroll')
      .send({});

    expect(res.status).toBe(400);
  });

  it('should return 400 for empty contactIds array', async () => {
    mockPrisma.crmEmailSequence.findFirst.mockResolvedValue(mockSequence);

    const res = await request(app)
      .put('/api/email-sequences/00000000-0000-0000-0000-000000000001/enroll')
      .send({
        contactIds: [],
      });

    expect(res.status).toBe(400);
  });

  it('should return 404 when sequence not found', async () => {
    mockPrisma.crmEmailSequence.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/email-sequences/00000000-0000-0000-0000-000000000099/enroll')
      .send({
        contactIds: ['c-1'],
      });

    expect(res.status).toBe(404);
  });
});

describe('campaigns and email-sequences — additional coverage', () => {
  it('GET /api/campaigns supports type filter', async () => {
    mockPrisma.crmCampaign.findMany.mockResolvedValue([mockCampaign]);
    mockPrisma.crmCampaign.count.mockResolvedValue(1);

    const res = await request(app).get('/api/campaigns?type=EMAIL');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/campaigns returns pagination object', async () => {
    mockPrisma.crmCampaign.findMany.mockResolvedValue([]);
    mockPrisma.crmCampaign.count.mockResolvedValue(0);

    const res = await request(app).get('/api/campaigns?page=1&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.pagination).toBeDefined();
  });

  it('POST /api/campaigns type SOCIAL is valid', async () => {
    mockPrisma.crmCampaign.create.mockResolvedValue({ ...mockCampaign, type: 'SOCIAL' });

    const res = await request(app).post('/api/campaigns').send({
      name: 'Social Camp',
      type: 'SOCIAL',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('POST /api/campaigns type CONTENT is valid', async () => {
    mockPrisma.crmCampaign.create.mockResolvedValue({ ...mockCampaign, type: 'CONTENT' });

    const res = await request(app).post('/api/campaigns').send({
      name: 'Content Camp',
      type: 'CONTENT',
    });
    expect(res.status).toBe(201);
  });

  it('GET /api/campaigns/:id/performance returns 500 on DB error', async () => {
    mockPrisma.crmCampaign.findFirst.mockResolvedValue(mockCampaign);
    mockPrisma.crmCampaignMember.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get(
      '/api/campaigns/00000000-0000-0000-0000-000000000001/performance'
    );
    expect(res.status).toBe(500);
  });

  it('GET /api/email-sequences returns 500 on DB error', async () => {
    mockPrisma.crmEmailSequence.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/email-sequences');
    expect(res.status).toBe(500);
  });

  it('PUT /api/email-sequences/:id returns 500 on update DB error', async () => {
    mockPrisma.crmEmailSequence.findFirst.mockResolvedValue(mockSequence);
    mockPrisma.crmEmailSequence.update.mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .put('/api/email-sequences/00000000-0000-0000-0000-000000000001')
      .send({ name: 'Updated' });
    expect(res.status).toBe(500);
  });

  it('POST /api/campaigns/:id/contacts returns 500 on DB error', async () => {
    mockPrisma.crmCampaign.findFirst.mockResolvedValue(mockCampaign);
    mockPrisma.crmCampaignMember.create.mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .post('/api/campaigns/00000000-0000-0000-0000-000000000001/contacts')
      .send({ contactIds: ['c-1'] });
    expect(res.status).toBe(500);
  });
});
