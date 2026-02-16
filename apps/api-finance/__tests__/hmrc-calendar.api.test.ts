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
    req.user = { id: '00000000-0000-0000-0000-000000000001', email: 'test@test.com', role: 'ADMIN', orgId: 'org-1' };
    next();
  }),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import hmrcCalendarRouter from '../src/routes/hmrc-calendar';
import { prisma } from '../src/prisma';

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
        orgId: 'org-1',
      },
      {
        id: '00000000-0000-0000-0000-000000000002',
        title: 'PAYE Monthly Payment',
        dueDate: '2026-01-19',
        deadlineType: 'PAYE',
        status: 'PENDING',
        orgId: 'org-1',
      },
    ];
    (prisma as any).finHmrcDeadline.findMany.mockResolvedValue(deadlines);

    const res = await request(app).get('/api/hmrc-calendar');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
  });

  it('should order results by dueDate ascending', async () => {
    (prisma as any).finHmrcDeadline.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/hmrc-calendar');

    expect(res.status).toBe(200);
    expect((prisma as any).finHmrcDeadline.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { dueDate: 'asc' },
      })
    );
  });

  it('should filter by orgId from authenticated user', async () => {
    (prisma as any).finHmrcDeadline.findMany.mockResolvedValue([]);

    await request(app).get('/api/hmrc-calendar');

    expect((prisma as any).finHmrcDeadline.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ orgId: 'org-1', deletedAt: null }),
      })
    );
  });

  it('should return an empty array when no deadlines exist', async () => {
    (prisma as any).finHmrcDeadline.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/hmrc-calendar');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(0);
  });

  it('should return 500 on database error', async () => {
    (prisma as any).finHmrcDeadline.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/hmrc-calendar');

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FETCH_ERROR');
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
    (prisma as any).finHmrcDeadline.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      ...validDeadline,
      orgId: 'org-1',
      createdBy: '00000000-0000-0000-0000-000000000001',
    });

    const res = await request(app).post('/api/hmrc-calendar').send(validDeadline);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('VAT Return Q1 2026');
  });

  it('should set orgId and createdBy from authenticated user', async () => {
    (prisma as any).finHmrcDeadline.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      ...validDeadline,
      orgId: 'org-1',
    });

    await request(app).post('/api/hmrc-calendar').send(validDeadline);

    expect((prisma as any).finHmrcDeadline.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          orgId: 'org-1',
          createdBy: '00000000-0000-0000-0000-000000000001',
        }),
      })
    );
  });

  it('should return 400 on create error', async () => {
    (prisma as any).finHmrcDeadline.create.mockRejectedValue(new Error('Missing required field'));

    const res = await request(app).post('/api/hmrc-calendar').send(validDeadline);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('CREATE_ERROR');
  });

  it('should include body fields in the created deadline', async () => {
    (prisma as any).finHmrcDeadline.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      ...validDeadline,
      orgId: 'org-1',
    });

    const res = await request(app).post('/api/hmrc-calendar').send(validDeadline);

    expect(res.status).toBe(201);
    expect((prisma as any).finHmrcDeadline.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          title: 'VAT Return Q1 2026',
          type: 'VAT',
        }),
      })
    );
  });
});
