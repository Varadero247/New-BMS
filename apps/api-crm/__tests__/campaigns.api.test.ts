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

const app = express();
app.use(express.json());
app.use('/api/campaigns', campaignRouter);
app.use('/api/email-sequences', emailSequenceRouter);

beforeEach(() => { jest.clearAllMocks(); });

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
    (prisma as any).crmCampaign.create.mockResolvedValue(mockCampaign);

    const res = await request(app).post('/api/campaigns').send({
      name: 'Spring Promotion',
      type: 'EMAIL',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Spring Promotion');
  });

  it('should create campaign with all optional fields', async () => {
    (prisma as any).crmCampaign.create.mockResolvedValue(mockCampaign);

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
    (prisma as any).crmCampaign.create.mockRejectedValue(new Error('DB error'));

    const res = await request(app).post('/api/campaigns').send({
      name: 'Test',
      type: 'EMAIL',
    });

    expect(res.status).toBe(500);
  });
});

describe('GET /api/campaigns', () => {
  it('should return paginated list', async () => {
    (prisma as any).crmCampaign.findMany.mockResolvedValue([mockCampaign]);
    (prisma as any).crmCampaign.count.mockResolvedValue(1);

    const res = await request(app).get('/api/campaigns');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination).toBeDefined();
  });

  it('should filter by status', async () => {
    (prisma as any).crmCampaign.findMany.mockResolvedValue([]);
    (prisma as any).crmCampaign.count.mockResolvedValue(0);

    const res = await request(app).get('/api/campaigns?status=ACTIVE');

    expect(res.status).toBe(200);
    expect((prisma as any).crmCampaign.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'ACTIVE' }),
      })
    );
  });

  it('should return empty array when no campaigns', async () => {
    (prisma as any).crmCampaign.findMany.mockResolvedValue([]);
    (prisma as any).crmCampaign.count.mockResolvedValue(0);

    const res = await request(app).get('/api/campaigns');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it('should return 500 on database error', async () => {
    (prisma as any).crmCampaign.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/campaigns');

    expect(res.status).toBe(500);
  });
});

describe('GET /api/campaigns/:id', () => {
  it('should return campaign detail with member count', async () => {
    (prisma as any).crmCampaign.findFirst.mockResolvedValue(mockCampaign);
    (prisma as any).crmCampaignMember.count.mockResolvedValue(15);

    const res = await request(app).get('/api/campaigns/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.memberCount).toBe(15);
  });

  it('should return 404 when not found', async () => {
    (prisma as any).crmCampaign.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/campaigns/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });

  it('should return 500 on database error', async () => {
    (prisma as any).crmCampaign.findFirst.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/campaigns/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(500);
  });
});

describe('GET /api/campaigns/:id/performance', () => {
  it('should return performance metrics', async () => {
    (prisma as any).crmCampaign.findFirst.mockResolvedValue(mockCampaign);
    (prisma as any).crmCampaignMember.findMany.mockResolvedValue([
      { id: 'm-1', status: 'SENT' },
      { id: 'm-2', status: 'OPENED' },
      { id: 'm-3', status: 'CLICKED' },
      { id: 'm-4', status: 'CONVERTED' },
    ]);

    const res = await request(app).get('/api/campaigns/00000000-0000-0000-0000-000000000001/performance');

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
    (prisma as any).crmCampaign.findFirst.mockResolvedValue(mockCampaign);
    (prisma as any).crmCampaignMember.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/campaigns/00000000-0000-0000-0000-000000000001/performance');

    expect(res.status).toBe(200);
    expect(res.body.data.totalMembers).toBe(0);
    expect(res.body.data.openRate).toBe(0);
  });

  it('should return 404 when not found', async () => {
    (prisma as any).crmCampaign.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/campaigns/00000000-0000-0000-0000-000000000099/performance');

    expect(res.status).toBe(404);
  });
});

describe('POST /api/campaigns/:id/contacts', () => {
  it('should add contacts to campaign', async () => {
    (prisma as any).crmCampaign.findFirst.mockResolvedValue(mockCampaign);
    (prisma as any).crmCampaignMember.create.mockResolvedValue({ id: 'member-1', campaignId: 'camp-1', contactId: 'c-1' });

    const res = await request(app).post('/api/campaigns/00000000-0000-0000-0000-000000000001/contacts').send({
      contactIds: ['c-1'],
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('should return 400 for missing contactIds', async () => {
    (prisma as any).crmCampaign.findFirst.mockResolvedValue(mockCampaign);

    const res = await request(app).post('/api/campaigns/00000000-0000-0000-0000-000000000001/contacts').send({});

    expect(res.status).toBe(400);
  });

  it('should return 400 for empty contactIds array', async () => {
    (prisma as any).crmCampaign.findFirst.mockResolvedValue(mockCampaign);

    const res = await request(app).post('/api/campaigns/00000000-0000-0000-0000-000000000001/contacts').send({
      contactIds: [],
    });

    expect(res.status).toBe(400);
  });

  it('should return 404 when campaign not found', async () => {
    (prisma as any).crmCampaign.findFirst.mockResolvedValue(null);

    const res = await request(app).post('/api/campaigns/00000000-0000-0000-0000-000000000099/contacts').send({
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
    (prisma as any).crmEmailSequence.create.mockResolvedValue(mockSequence);

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
    (prisma as any).crmEmailSequence.create.mockRejectedValue(new Error('DB error'));

    const res = await request(app).post('/api/email-sequences').send({
      name: 'Test',
    });

    expect(res.status).toBe(500);
  });
});

describe('GET /api/email-sequences', () => {
  it('should return list of sequences', async () => {
    (prisma as any).crmEmailSequence.findMany.mockResolvedValue([mockSequence]);
    (prisma as any).crmEmailSequence.count.mockResolvedValue(1);

    const res = await request(app).get('/api/email-sequences');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('should return empty array when none', async () => {
    (prisma as any).crmEmailSequence.findMany.mockResolvedValue([]);
    (prisma as any).crmEmailSequence.count.mockResolvedValue(0);

    const res = await request(app).get('/api/email-sequences');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });
});

describe('PUT /api/email-sequences/:id', () => {
  it('should update email sequence', async () => {
    (prisma as any).crmEmailSequence.findFirst.mockResolvedValue(mockSequence);
    (prisma as any).crmEmailSequence.update.mockResolvedValue({ ...mockSequence, name: 'Updated Series' });

    const res = await request(app).put('/api/email-sequences/00000000-0000-0000-0000-000000000001').send({ name: 'Updated Series' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 when not found', async () => {
    (prisma as any).crmEmailSequence.findFirst.mockResolvedValue(null);

    const res = await request(app).put('/api/email-sequences/00000000-0000-0000-0000-000000000099').send({ name: 'Test' });

    expect(res.status).toBe(404);
  });
});

describe('PUT /api/email-sequences/:id/enroll', () => {
  it('should enroll contacts', async () => {
    (prisma as any).crmEmailSequence.findFirst.mockResolvedValue(mockSequence);
    (prisma as any).crmEmailEnrollment.create.mockResolvedValue({ id: 'enroll-1', sequenceId: 'seq-1', contactId: 'c-1' });

    const res = await request(app).put('/api/email-sequences/00000000-0000-0000-0000-000000000001/enroll').send({
      contactIds: ['c-1', 'c-2'],
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 400 for missing contactIds', async () => {
    (prisma as any).crmEmailSequence.findFirst.mockResolvedValue(mockSequence);

    const res = await request(app).put('/api/email-sequences/00000000-0000-0000-0000-000000000001/enroll').send({});

    expect(res.status).toBe(400);
  });

  it('should return 400 for empty contactIds array', async () => {
    (prisma as any).crmEmailSequence.findFirst.mockResolvedValue(mockSequence);

    const res = await request(app).put('/api/email-sequences/00000000-0000-0000-0000-000000000001/enroll').send({
      contactIds: [],
    });

    expect(res.status).toBe(400);
  });

  it('should return 404 when sequence not found', async () => {
    (prisma as any).crmEmailSequence.findFirst.mockResolvedValue(null);

    const res = await request(app).put('/api/email-sequences/00000000-0000-0000-0000-000000000099/enroll').send({
      contactIds: ['c-1'],
    });

    expect(res.status).toBe(404);
  });
});
