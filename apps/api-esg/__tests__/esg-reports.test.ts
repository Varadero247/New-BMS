import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    esgReport: {
      findMany: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
    },
  },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'test@test.com',
      role: 'ADMIN',
      orgId: 'org-001',
    };
    next();
  }),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import esgReportsRouter from '../src/routes/esg-reports';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/esg-reports', esgReportsRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

const mockEsgReport = {
  id: '00000000-0000-0000-0000-000000000001',
  orgId: 'org-001',
  referenceNumber: 'ESGR-2026-0001',
  title: 'ESG Report 2026',
  framework: 'GRI',
  period: '2026',
  status: 'DRAFT',
  aiGenerated: true,
  createdBy: '00000000-0000-0000-0000-000000000001',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

describe('GET /api/esg-reports', () => {
  it('should return list of ESG reports', async () => {
    (prisma.esgReport.findMany as jest.Mock).mockResolvedValue([mockEsgReport]);

    const res = await request(app).get('/api/esg-reports');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return empty array when no ESG reports exist', async () => {
    (prisma.esgReport.findMany as jest.Mock).mockResolvedValue([]);

    const res = await request(app).get('/api/esg-reports');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(0);
  });

  it('should filter by orgId from authenticated user and exclude deleted', async () => {
    (prisma.esgReport.findMany as jest.Mock).mockResolvedValue([mockEsgReport]);

    await request(app).get('/api/esg-reports');
    expect(prisma.esgReport.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ orgId: 'org-001', deletedAt: null }),
      })
    );
  });

  it('should order results by createdAt descending', async () => {
    (prisma.esgReport.findMany as jest.Mock).mockResolvedValue([mockEsgReport]);

    await request(app).get('/api/esg-reports');
    expect(prisma.esgReport.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { createdAt: 'desc' },
      })
    );
  });

  it('should return 500 when database query fails', async () => {
    (prisma.esgReport.findMany as jest.Mock).mockRejectedValue(new Error('DB connection lost'));

    const res = await request(app).get('/api/esg-reports');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('POST /api/esg-reports/generate', () => {
  it('should generate a new ESG report', async () => {
    (prisma.esgReport.count as jest.Mock).mockResolvedValue(0);
    (prisma.esgReport.create as jest.Mock).mockResolvedValue(mockEsgReport);

    const res = await request(app).post('/api/esg-reports/generate').send({
      title: 'ESG Report 2026',
      framework: 'GRI',
      period: '2026',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should generate a reference number using count', async () => {
    (prisma.esgReport.count as jest.Mock).mockResolvedValue(2);
    (prisma.esgReport.create as jest.Mock).mockResolvedValue({
      ...mockEsgReport,
      referenceNumber: `ESGR-${new Date().getFullYear()}-0003`,
    });

    await request(app).post('/api/esg-reports/generate').send({
      framework: 'TCFD',
      period: '2026',
    });

    expect(prisma.esgReport.count).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ orgId: 'org-001' }) })
    );
    expect(prisma.esgReport.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          referenceNumber: expect.stringMatching(/^ESGR-\d{4}-0003$/),
        }),
      })
    );
  });

  it('should default title to ESG Report <year> when not provided', async () => {
    (prisma.esgReport.count as jest.Mock).mockResolvedValue(0);
    (prisma.esgReport.create as jest.Mock).mockResolvedValue(mockEsgReport);

    await request(app).post('/api/esg-reports/generate').send({
      framework: 'GRI',
      period: '2026',
    });

    const year = new Date().getFullYear();
    expect(prisma.esgReport.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          title: `ESG Report ${year}`,
        }),
      })
    );
  });

  it('should use provided title when given', async () => {
    (prisma.esgReport.count as jest.Mock).mockResolvedValue(0);
    (prisma.esgReport.create as jest.Mock).mockResolvedValue(mockEsgReport);

    await request(app).post('/api/esg-reports/generate').send({
      title: 'Custom ESG Annual Report',
      framework: 'SASB',
      period: '2026',
    });

    expect(prisma.esgReport.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          title: 'Custom ESG Annual Report',
        }),
      })
    );
  });

  it('should set status to DRAFT and aiGenerated to true', async () => {
    (prisma.esgReport.count as jest.Mock).mockResolvedValue(0);
    (prisma.esgReport.create as jest.Mock).mockResolvedValue(mockEsgReport);

    await request(app).post('/api/esg-reports/generate').send({
      framework: 'GRI',
      period: '2026',
    });

    expect(prisma.esgReport.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'DRAFT',
          aiGenerated: true,
        }),
      })
    );
  });

  it('should attach orgId and createdBy from authenticated user', async () => {
    (prisma.esgReport.count as jest.Mock).mockResolvedValue(0);
    (prisma.esgReport.create as jest.Mock).mockResolvedValue(mockEsgReport);

    await request(app).post('/api/esg-reports/generate').send({
      framework: 'GRI',
      period: '2026',
    });

    expect(prisma.esgReport.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          orgId: 'org-001',
          createdBy: '00000000-0000-0000-0000-000000000001',
        }),
      })
    );
  });

  it('should return 500 when database create fails', async () => {
    (prisma.esgReport.count as jest.Mock).mockResolvedValue(0);
    (prisma.esgReport.create as jest.Mock).mockRejectedValue(new Error('Constraint violation'));

    const res = await request(app).post('/api/esg-reports/generate').send({
      framework: 'GRI',
      period: '2026',
    });

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
    expect(res.body.error.message).toBe('Failed to create resource');
  });
});

describe('ESG Reports — extended', () => {
  it('GET / findMany called once per request', async () => {
    (prisma.esgReport.findMany as jest.Mock).mockResolvedValue([]);
    await request(app).get('/api/esg-reports');
    expect(prisma.esgReport.findMany).toHaveBeenCalledTimes(1);
  });

  it('POST /generate: response data has referenceNumber field', async () => {
    (prisma.esgReport.count as jest.Mock).mockResolvedValue(0);
    (prisma.esgReport.create as jest.Mock).mockResolvedValue(mockEsgReport);
    const res = await request(app).post('/api/esg-reports/generate').send({ framework: 'GRI', period: '2026' });
    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('referenceNumber');
  });

  it('GET / data[0] has framework field when results exist', async () => {
    (prisma.esgReport.findMany as jest.Mock).mockResolvedValue([mockEsgReport]);
    const res = await request(app).get('/api/esg-reports');
    expect(res.status).toBe(200);
    expect(res.body.data[0]).toHaveProperty('framework');
  });
});
