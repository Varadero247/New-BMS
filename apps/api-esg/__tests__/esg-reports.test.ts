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


describe('ESG Reports — additional coverage', () => {
  it('auth enforcement: authenticate middleware is called on GET', async () => {
    const { authenticate } = require('@ims/auth');
    (prisma.esgReport.findMany as jest.Mock).mockResolvedValue([]);
    await request(app).get('/api/esg-reports');
    expect(authenticate).toHaveBeenCalled();
  });

  it('empty list response: GET returns [] with success true when no reports exist', async () => {
    (prisma.esgReport.findMany as jest.Mock).mockResolvedValue([]);
    const res = await request(app).get('/api/esg-reports');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual([]);
  });

  it('invalid params (400): POST /generate without framework returns VALIDATION_ERROR', async () => {
    const res = await request(app).post('/api/esg-reports/generate').send({
      title: 'Missing framework report',
      period: '2026',
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('DB error handling (500): POST /generate count failure returns INTERNAL_ERROR', async () => {
    (prisma.esgReport.count as jest.Mock).mockRejectedValue(new Error('DB unavailable'));
    const res = await request(app).post('/api/esg-reports/generate').send({
      framework: 'GRI',
      period: '2026',
    });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('additional positive case: generated report has aiGenerated true and status DRAFT', async () => {
    (prisma.esgReport.count as jest.Mock).mockResolvedValue(5);
    (prisma.esgReport.create as jest.Mock).mockResolvedValue({ ...mockEsgReport, referenceNumber: 'ESGR-2026-0006' });
    const res = await request(app).post('/api/esg-reports/generate').send({
      title: 'Annual Sustainability Report',
      framework: 'SASB',
      period: '2026',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.aiGenerated).toBe(true);
    expect(res.body.data.status).toBe('DRAFT');
  });
});

// ─── Extended edge cases ────────────────────────────────────────────────────

describe('ESG Reports — extended edge cases', () => {
  it('GET / response is JSON content-type', async () => {
    (prisma.esgReport.findMany as jest.Mock).mockResolvedValue([]);
    const res = await request(app).get('/api/esg-reports');
    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('GET / body is an object', async () => {
    (prisma.esgReport.findMany as jest.Mock).mockResolvedValue([]);
    const res = await request(app).get('/api/esg-reports');
    expect(typeof res.body).toBe('object');
  });

  it('POST /generate with TCFD framework creates report', async () => {
    (prisma.esgReport.count as jest.Mock).mockResolvedValue(1);
    (prisma.esgReport.create as jest.Mock).mockResolvedValue({ ...mockEsgReport, framework: 'TCFD' });
    const res = await request(app).post('/api/esg-reports/generate').send({
      framework: 'TCFD',
      period: '2026',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('POST /generate with SASB framework creates report', async () => {
    (prisma.esgReport.count as jest.Mock).mockResolvedValue(0);
    (prisma.esgReport.create as jest.Mock).mockResolvedValue({ ...mockEsgReport, framework: 'SASB' });
    const res = await request(app).post('/api/esg-reports/generate').send({
      framework: 'SASB',
      period: '2025',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('POST /generate without period field returns 400', async () => {
    const res = await request(app).post('/api/esg-reports/generate').send({
      framework: 'GRI',
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('GET / data[0] has orgId field when results exist', async () => {
    (prisma.esgReport.findMany as jest.Mock).mockResolvedValue([mockEsgReport]);
    const res = await request(app).get('/api/esg-reports');
    expect(res.status).toBe(200);
    expect(res.body.data[0]).toHaveProperty('orgId');
  });

  it('POST /generate create is called once per request', async () => {
    (prisma.esgReport.count as jest.Mock).mockResolvedValue(0);
    (prisma.esgReport.create as jest.Mock).mockResolvedValue(mockEsgReport);
    await request(app).post('/api/esg-reports/generate').send({ framework: 'GRI', period: '2026' });
    expect(prisma.esgReport.create).toHaveBeenCalledTimes(1);
  });

  it('GET / returns multiple reports when DB has multiple records', async () => {
    const secondReport = { ...mockEsgReport, id: '00000000-0000-0000-0000-000000000002', referenceNumber: 'ESGR-2026-0002' };
    (prisma.esgReport.findMany as jest.Mock).mockResolvedValue([mockEsgReport, secondReport]);
    const res = await request(app).get('/api/esg-reports');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
  });
});

describe('ESG Reports — final coverage', () => {
  it('POST /generate with UNGC framework creates report', async () => {
    (prisma.esgReport.count as jest.Mock).mockResolvedValue(3);
    (prisma.esgReport.create as jest.Mock).mockResolvedValue({ ...mockEsgReport, framework: 'UNGC' });
    const res = await request(app).post('/api/esg-reports/generate').send({
      framework: 'UNGC',
      period: '2026',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('GET / returns JSON content-type header', async () => {
    (prisma.esgReport.findMany as jest.Mock).mockResolvedValue([]);
    const res = await request(app).get('/api/esg-reports');
    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('POST /generate response data contains period field', async () => {
    (prisma.esgReport.count as jest.Mock).mockResolvedValue(0);
    (prisma.esgReport.create as jest.Mock).mockResolvedValue(mockEsgReport);
    const res = await request(app).post('/api/esg-reports/generate').send({
      framework: 'GRI',
      period: '2026',
    });
    expect(res.body.data).toHaveProperty('period');
  });

  it('POST /generate count is used to build sequenced reference number', async () => {
    (prisma.esgReport.count as jest.Mock).mockResolvedValue(9);
    (prisma.esgReport.create as jest.Mock).mockResolvedValue(mockEsgReport);
    await request(app).post('/api/esg-reports/generate').send({ framework: 'GRI', period: '2026' });
    expect(prisma.esgReport.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          referenceNumber: expect.stringMatching(/^ESGR-\d{4}-0010$/),
        }),
      })
    );
  });

  it('GET / data items have status field', async () => {
    (prisma.esgReport.findMany as jest.Mock).mockResolvedValue([mockEsgReport]);
    const res = await request(app).get('/api/esg-reports');
    expect(res.body.data[0]).toHaveProperty('status');
  });

  it('POST /generate with empty framework string returns 400', async () => {
    const res = await request(app).post('/api/esg-reports/generate').send({
      framework: '',
      period: '2026',
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST /generate returns 500 when create throws after count succeeds', async () => {
    (prisma.esgReport.count as jest.Mock).mockResolvedValue(0);
    (prisma.esgReport.create as jest.Mock).mockRejectedValue(new Error('Timeout'));
    const res = await request(app).post('/api/esg-reports/generate').send({
      framework: 'GRI',
      period: '2026',
    });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('ESG Reports — extra coverage', () => {
  it('GET / data items have id field', async () => {
    (prisma.esgReport.findMany as jest.Mock).mockResolvedValue([mockEsgReport]);
    const res = await request(app).get('/api/esg-reports');
    expect(res.body.data[0]).toHaveProperty('id');
  });

  it('POST /generate with INTEGRATED framework creates report', async () => {
    (prisma.esgReport.count as jest.Mock).mockResolvedValue(0);
    (prisma.esgReport.create as jest.Mock).mockResolvedValue({ ...mockEsgReport, framework: 'INTEGRATED' });
    const res = await request(app).post('/api/esg-reports/generate').send({
      framework: 'INTEGRATED',
      period: '2026',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('GET / count is 0 when DB returns empty list', async () => {
    (prisma.esgReport.findMany as jest.Mock).mockResolvedValue([]);
    const res = await request(app).get('/api/esg-reports');
    expect(res.body.data).toHaveLength(0);
  });

  it('POST /generate data has createdBy from user', async () => {
    (prisma.esgReport.count as jest.Mock).mockResolvedValue(0);
    (prisma.esgReport.create as jest.Mock).mockResolvedValue(mockEsgReport);
    const res = await request(app).post('/api/esg-reports/generate').send({
      framework: 'GRI',
      period: '2026',
    });
    expect(res.body.data).toHaveProperty('createdBy');
  });

  it('POST /generate missing both framework and period returns 400', async () => {
    const res = await request(app).post('/api/esg-reports/generate').send({});
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('ESG Reports — phase28 coverage', () => {
  it('GET / findMany called with orgId from authenticated user', async () => {
    (prisma.esgReport.findMany as jest.Mock).mockResolvedValue([]);
    await request(app).get('/api/esg-reports');
    expect(prisma.esgReport.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ orgId: 'org-001' }) })
    );
  });

  it('POST /generate with ISO_14001 framework creates report', async () => {
    (prisma.esgReport.count as jest.Mock).mockResolvedValue(0);
    (prisma.esgReport.create as jest.Mock).mockResolvedValue({
      ...mockEsgReport,
      framework: 'ISO_14001',
    });
    const res = await request(app).post('/api/esg-reports/generate').send({
      framework: 'ISO_14001',
      period: '2026-Q1',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('GET / response has data as array', async () => {
    (prisma.esgReport.findMany as jest.Mock).mockResolvedValue([mockEsgReport]);
    const res = await request(app).get('/api/esg-reports');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST /generate count is called once to build reference number', async () => {
    (prisma.esgReport.count as jest.Mock).mockResolvedValue(2);
    (prisma.esgReport.create as jest.Mock).mockResolvedValue({ ...mockEsgReport });
    await request(app).post('/api/esg-reports/generate').send({
      framework: 'GRI',
      period: '2026-Q1',
    });
    expect(prisma.esgReport.count).toHaveBeenCalledTimes(1);
  });

  it('POST /generate missing period returns 400 VALIDATION_ERROR', async () => {
    const res = await request(app).post('/api/esg-reports/generate').send({
      framework: 'GRI',
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});
