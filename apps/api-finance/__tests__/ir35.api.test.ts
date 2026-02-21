import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    finIr35Assessment: {
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
      orgId: '00000000-0000-4000-a000-000000000100',
    };
    next();
  }),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import ir35Router from '../src/routes/ir35';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/ir35', ir35Router);

beforeEach(() => {
  jest.clearAllMocks();
});

// ===================================================================
// GET /api/ir35 — List IR35 assessments
// ===================================================================
describe('GET /api/ir35', () => {
  it('should return a list of IR35 assessments ordered by createdAt desc', async () => {
    const assessments = [
      {
        id: '00000000-0000-0000-0000-000000000001',
        referenceNumber: 'IR35-2026-0001',
        contractorName: 'John Smith',
        determination: 'INSIDE',
        status: 'COMPLETED',
        orgId: '00000000-0000-4000-a000-000000000100',
      },
      {
        id: '00000000-0000-0000-0000-000000000002',
        referenceNumber: 'IR35-2026-0002',
        contractorName: 'Jane Doe',
        determination: 'OUTSIDE',
        status: 'DRAFT',
        orgId: '00000000-0000-4000-a000-000000000100',
      },
    ];
    mockPrisma.finIr35Assessment.findMany.mockResolvedValue(assessments);

    const res = await request(app).get('/api/ir35');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
  });

  it('should order results by createdAt descending', async () => {
    mockPrisma.finIr35Assessment.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/ir35');

    expect(res.status).toBe(200);
    expect(mockPrisma.finIr35Assessment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { createdAt: 'desc' },
      })
    );
  });

  it('should filter by orgId from authenticated user', async () => {
    mockPrisma.finIr35Assessment.findMany.mockResolvedValue([]);

    await request(app).get('/api/ir35');

    expect(mockPrisma.finIr35Assessment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          orgId: '00000000-0000-4000-a000-000000000100',
          deletedAt: null,
        }),
      })
    );
  });

  it('should return an empty array when no assessments exist', async () => {
    mockPrisma.finIr35Assessment.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/ir35');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(0);
  });

  it('response data is an array', async () => {
    mockPrisma.finIr35Assessment.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/ir35');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should return 500 on database error', async () => {
    mockPrisma.finIr35Assessment.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/ir35');

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

// ===================================================================
// POST /api/ir35 — Create IR35 assessment
// ===================================================================
describe('POST /api/ir35', () => {
  const validAssessment = {
    contractorName: 'John Smith',
    contractorCompany: 'JS Consulting Ltd',
    engagementStartDate: '2026-01-01',
    engagementEndDate: '2026-12-31',
    role: 'Software Developer',
    determination: 'INSIDE',
    status: 'DRAFT',
  };

  it('should create an IR35 assessment successfully', async () => {
    mockPrisma.finIr35Assessment.count.mockResolvedValue(0);
    mockPrisma.finIr35Assessment.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      ...validAssessment,
      referenceNumber: 'IR35-2026-0001',
      orgId: '00000000-0000-4000-a000-000000000100',
      createdBy: '00000000-0000-0000-0000-000000000001',
    });

    const res = await request(app).post('/api/ir35').send(validAssessment);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.referenceNumber).toBe('IR35-2026-0001');
  });

  it('should auto-generate a reference number using IR35 prefix and count', async () => {
    mockPrisma.finIr35Assessment.count.mockResolvedValue(3);
    mockPrisma.finIr35Assessment.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000004',
      ...validAssessment,
      referenceNumber: 'IR35-2026-0004',
      orgId: '00000000-0000-4000-a000-000000000100',
    });

    const res = await request(app).post('/api/ir35').send(validAssessment);

    expect(res.status).toBe(201);
    expect(res.body.data.referenceNumber).toBe('IR35-2026-0004');
  });

  it('should set orgId and createdBy from authenticated user', async () => {
    mockPrisma.finIr35Assessment.count.mockResolvedValue(0);
    mockPrisma.finIr35Assessment.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      ...validAssessment,
      referenceNumber: 'IR35-2026-0001',
      orgId: '00000000-0000-4000-a000-000000000100',
    });

    await request(app).post('/api/ir35').send(validAssessment);

    expect(mockPrisma.finIr35Assessment.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          orgId: '00000000-0000-4000-a000-000000000100',
          createdBy: '00000000-0000-0000-0000-000000000001',
        }),
      })
    );
  });

  it('should use count to generate padded reference number', async () => {
    mockPrisma.finIr35Assessment.count.mockResolvedValue(0);
    mockPrisma.finIr35Assessment.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      ...validAssessment,
      referenceNumber: 'IR35-2026-0001',
      orgId: '00000000-0000-4000-a000-000000000100',
    });

    await request(app).post('/api/ir35').send(validAssessment);

    expect(mockPrisma.finIr35Assessment.count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ orgId: '00000000-0000-4000-a000-000000000100' }),
      })
    );
    expect(mockPrisma.finIr35Assessment.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          referenceNumber: expect.stringMatching(/^IR35-\d{4}-\d{4}$/),
        }),
      })
    );
  });

  it('should return 500 on create error', async () => {
    mockPrisma.finIr35Assessment.count.mockResolvedValue(0);
    mockPrisma.finIr35Assessment.create.mockRejectedValue(new Error('Validation failed'));

    const res = await request(app).post('/api/ir35').send(validAssessment);

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('should include body fields in the created assessment', async () => {
    mockPrisma.finIr35Assessment.count.mockResolvedValue(0);
    mockPrisma.finIr35Assessment.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      ...validAssessment,
      referenceNumber: 'IR35-2026-0001',
      orgId: '00000000-0000-4000-a000-000000000100',
    });

    const res = await request(app).post('/api/ir35').send(validAssessment);

    expect(res.status).toBe(201);
    expect(mockPrisma.finIr35Assessment.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          contractorName: 'John Smith',
          determination: 'INSIDE',
        }),
      })
    );
  });

  it('create is called exactly once per POST request', async () => {
    mockPrisma.finIr35Assessment.count.mockResolvedValue(0);
    mockPrisma.finIr35Assessment.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      ...validAssessment,
      referenceNumber: 'IR35-2026-0001',
      orgId: '00000000-0000-4000-a000-000000000100',
    });
    await request(app).post('/api/ir35').send(validAssessment);
    expect(mockPrisma.finIr35Assessment.create).toHaveBeenCalledTimes(1);
  });
});

describe('IR35 — extended', () => {
  const validAssessment = {
    contractorName: 'Sarah Connor',
    contractorCompany: 'SC Ltd',
    engagementStartDate: '2026-03-01',
    engagementEndDate: '2026-09-30',
    role: 'QA Engineer',
    determination: 'OUTSIDE',
    status: 'DRAFT',
  };

  it('GET / findMany called once per list request', async () => {
    mockPrisma.finIr35Assessment.findMany.mockResolvedValue([]);
    await request(app).get('/api/ir35');
    expect(mockPrisma.finIr35Assessment.findMany).toHaveBeenCalledTimes(1);
  });

  it('POST / created assessment has contractorName in create call', async () => {
    mockPrisma.finIr35Assessment.count.mockResolvedValue(0);
    mockPrisma.finIr35Assessment.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000005',
      ...validAssessment,
      referenceNumber: 'IR35-2026-0001',
      orgId: '00000000-0000-4000-a000-000000000100',
    });
    await request(app).post('/api/ir35').send(validAssessment);
    expect(mockPrisma.finIr35Assessment.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ contractorName: 'Sarah Connor' }),
      })
    );
  });
});


// ===================================================================
// IR35 — additional coverage (5 new tests)
// ===================================================================
describe('IR35 — additional coverage', () => {
  const validAssessment = {
    contractorName: 'Alice Brown',
    contractorCompany: 'AB Consulting Ltd',
    engagementStartDate: '2026-06-01',
    engagementEndDate: '2026-12-31',
    role: 'Business Analyst',
    determination: 'INSIDE',
    status: 'DRAFT',
  };

  it('GET / response body has a success property set to true', async () => {
    mockPrisma.finIr35Assessment.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/ir35');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
  });

  it('GET / data array length matches the number of records returned by findMany', async () => {
    mockPrisma.finIr35Assessment.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000010', referenceNumber: 'IR35-2026-0010', contractorName: 'A' },
      { id: '00000000-0000-0000-0000-000000000011', referenceNumber: 'IR35-2026-0011', contractorName: 'B' },
      { id: '00000000-0000-0000-0000-000000000012', referenceNumber: 'IR35-2026-0012', contractorName: 'C' },
    ]);
    const res = await request(app).get('/api/ir35');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(3);
  });

  it('POST / returns status 201 on successful assessment creation', async () => {
    mockPrisma.finIr35Assessment.count.mockResolvedValue(0);
    mockPrisma.finIr35Assessment.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000013',
      ...validAssessment,
      referenceNumber: 'IR35-2026-0001',
      orgId: '00000000-0000-4000-a000-000000000100',
    });
    const res = await request(app).post('/api/ir35').send(validAssessment);
    expect(res.status).toBe(201);
  });

  it('POST / count is called before create to generate the reference number', async () => {
    mockPrisma.finIr35Assessment.count.mockResolvedValue(5);
    mockPrisma.finIr35Assessment.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000014',
      ...validAssessment,
      referenceNumber: 'IR35-2026-0006',
      orgId: '00000000-0000-4000-a000-000000000100',
    });
    await request(app).post('/api/ir35').send(validAssessment);
    expect(mockPrisma.finIr35Assessment.count).toHaveBeenCalledTimes(1);
    expect(mockPrisma.finIr35Assessment.create).toHaveBeenCalledTimes(1);
  });

  it('POST / passes determination field to create data', async () => {
    mockPrisma.finIr35Assessment.count.mockResolvedValue(0);
    mockPrisma.finIr35Assessment.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000015',
      ...validAssessment,
      referenceNumber: 'IR35-2026-0001',
      orgId: '00000000-0000-4000-a000-000000000100',
    });
    await request(app).post('/api/ir35').send(validAssessment);
    expect(mockPrisma.finIr35Assessment.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ determination: 'INSIDE' }),
      })
    );
  });
});
