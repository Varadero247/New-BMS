import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    finHmrcDeadline: {
      findMany: jest.fn(),
      create: jest.fn(),
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

import hmrcCalendarRouter from '../src/routes/hmrc-calendar';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/hmrc-calendar', hmrcCalendarRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

// ===================================================================
// GET /api/hmrc-calendar — List HMRC deadlines
// ===================================================================
describe('GET /api/hmrc-calendar', () => {
  it('should return a list of HMRC deadlines ordered by dueDate', async () => {
    const deadlines = [
      {
        id: '00000000-0000-0000-0000-000000000001',
        title: 'VAT Return Q4',
        dueDate: '2026-01-07',
        deadlineType: 'VAT',
        status: 'PENDING',
        orgId: '00000000-0000-4000-a000-000000000100',
      },
      {
        id: '00000000-0000-0000-0000-000000000002',
        title: 'PAYE Monthly Payment',
        dueDate: '2026-01-19',
        deadlineType: 'PAYE',
        status: 'PENDING',
        orgId: '00000000-0000-4000-a000-000000000100',
      },
    ];
    mockPrisma.finHmrcDeadline.findMany.mockResolvedValue(deadlines);

    const res = await request(app).get('/api/hmrc-calendar');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
  });

  it('should order results by dueDate ascending', async () => {
    mockPrisma.finHmrcDeadline.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/hmrc-calendar');

    expect(res.status).toBe(200);
    expect(mockPrisma.finHmrcDeadline.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { dueDate: 'asc' },
      })
    );
  });

  it('should filter by orgId from authenticated user', async () => {
    mockPrisma.finHmrcDeadline.findMany.mockResolvedValue([]);

    await request(app).get('/api/hmrc-calendar');

    expect(mockPrisma.finHmrcDeadline.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          orgId: '00000000-0000-4000-a000-000000000100',
          deletedAt: null,
        }),
      })
    );
  });

  it('should return an empty array when no deadlines exist', async () => {
    mockPrisma.finHmrcDeadline.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/hmrc-calendar');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(0);
  });

  it('should return 500 on database error', async () => {
    mockPrisma.finHmrcDeadline.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/hmrc-calendar');

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('findMany is called once per request', async () => {
    mockPrisma.finHmrcDeadline.findMany.mockResolvedValue([]);
    await request(app).get('/api/hmrc-calendar');
    expect(mockPrisma.finHmrcDeadline.findMany).toHaveBeenCalledTimes(1);
  });

  it('response data is an array', async () => {
    mockPrisma.finHmrcDeadline.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/hmrc-calendar');
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

// ===================================================================
// POST /api/hmrc-calendar — Create HMRC deadline
// ===================================================================
describe('POST /api/hmrc-calendar', () => {
  const validDeadline = {
    title: 'VAT Return Q1 2026',
    dueDate: '2026-04-07',
    type: 'VAT',
    description: 'Submit and pay VAT return for Q1 2026',
    status: 'PENDING',
  };

  it('should create an HMRC deadline successfully', async () => {
    mockPrisma.finHmrcDeadline.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      ...validDeadline,
      orgId: '00000000-0000-4000-a000-000000000100',
      createdBy: '00000000-0000-0000-0000-000000000001',
    });

    const res = await request(app).post('/api/hmrc-calendar').send(validDeadline);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('VAT Return Q1 2026');
  });

  it('should set orgId and createdBy from authenticated user', async () => {
    mockPrisma.finHmrcDeadline.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      ...validDeadline,
      orgId: '00000000-0000-4000-a000-000000000100',
    });

    await request(app).post('/api/hmrc-calendar').send(validDeadline);

    expect(mockPrisma.finHmrcDeadline.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          orgId: '00000000-0000-4000-a000-000000000100',
          createdBy: '00000000-0000-0000-0000-000000000001',
        }),
      })
    );
  });

  it('should return 500 on create error', async () => {
    mockPrisma.finHmrcDeadline.create.mockRejectedValue(new Error('Missing required field'));

    const res = await request(app).post('/api/hmrc-calendar').send(validDeadline);

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('should include body fields in the created deadline', async () => {
    mockPrisma.finHmrcDeadline.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      ...validDeadline,
      orgId: '00000000-0000-4000-a000-000000000100',
    });

    const res = await request(app).post('/api/hmrc-calendar').send(validDeadline);

    expect(res.status).toBe(201);
    expect(mockPrisma.finHmrcDeadline.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          title: 'VAT Return Q1 2026',
          type: 'VAT',
        }),
      })
    );
  });

  it('create is called once per POST request', async () => {
    mockPrisma.finHmrcDeadline.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      ...validDeadline,
      orgId: '00000000-0000-4000-a000-000000000100',
    });
    await request(app).post('/api/hmrc-calendar').send(validDeadline);
    expect(mockPrisma.finHmrcDeadline.create).toHaveBeenCalledTimes(1);
  });
});

describe('HMRC Calendar — extended', () => {
  it('GET / data length matches number returned by findMany', async () => {
    mockPrisma.finHmrcDeadline.findMany.mockResolvedValue([
      { id: '1', title: 'VAT Q1', dueDate: '2026-04-07' },
      { id: '2', title: 'PAYE', dueDate: '2026-04-19' },
    ]);
    const res = await request(app).get('/api/hmrc-calendar');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
  });

  it('POST / response data has id field', async () => {
    mockPrisma.finHmrcDeadline.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'VAT Return Q1 2026',
      dueDate: '2026-04-07',
      type: 'VAT',
      status: 'PENDING',
      orgId: '00000000-0000-4000-a000-000000000100',
    });
    const res = await request(app).post('/api/hmrc-calendar').send({
      title: 'VAT Return Q1 2026',
      dueDate: '2026-04-07',
      type: 'VAT',
      description: 'Submit VAT',
      status: 'PENDING',
    });
    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('id');
  });

  it('GET / success is true on empty result set', async () => {
    mockPrisma.finHmrcDeadline.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/hmrc-calendar');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
