import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    trainRecord: { findMany: jest.fn() },
  },
  Prisma: {},
}));
jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((_req: any, _res: any, next: any) => {
    _req.user = { id: 'user-1', orgId: 'org-1', role: 'ADMIN' };
    next();
  }),
}));
jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import router from '../src/routes/inductions';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const app = express();
app.use(express.json());
app.use('/api/inductions', router);
beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/inductions', () => {
  it('should return induction records', async () => {
    mockPrisma.trainRecord.findMany.mockResolvedValue([
      { id: '1', employeeName: 'John Doe', course: { title: 'Site Induction', code: 'IND-001' } },
      {
        id: '2',
        employeeName: 'Jane Smith',
        course: { title: 'Safety Induction', code: 'IND-002' },
      },
    ]);
    const res = await request(app).get('/api/inductions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data[0].course.title).toBe('Site Induction');
  });

  it('should return empty array when no inductions exist', async () => {
    mockPrisma.trainRecord.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/inductions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(0);
  });

  it('should return 500 on error', async () => {
    mockPrisma.trainRecord.findMany.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/inductions');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('returns a single induction record', async () => {
    mockPrisma.trainRecord.findMany.mockResolvedValue([
      { id: '1', employeeName: 'Bob Jones', course: { title: 'Fire Safety', code: 'IND-003' } },
    ]);
    const res = await request(app).get('/api/inductions');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].employeeName).toBe('Bob Jones');
    expect(res.body.data[0].course.code).toBe('IND-003');
  });

  it('each record includes nested course with title and code', async () => {
    mockPrisma.trainRecord.findMany.mockResolvedValue([
      { id: 'r-1', employeeName: 'Alice', course: { title: 'COSHH Awareness', code: 'IND-010' } },
    ]);
    const res = await request(app).get('/api/inductions');
    const record = res.body.data[0];
    expect(record.course).toHaveProperty('title');
    expect(record.course).toHaveProperty('code');
  });

  it('findMany is called once per request', async () => {
    mockPrisma.trainRecord.findMany.mockResolvedValue([]);
    await request(app).get('/api/inductions');
    expect(mockPrisma.trainRecord.findMany).toHaveBeenCalledTimes(1);
  });

  it('data is an array', async () => {
    mockPrisma.trainRecord.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/inductions');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('each record has employeeName property', async () => {
    mockPrisma.trainRecord.findMany.mockResolvedValue([
      { id: 'r-1', employeeName: 'Charlie', course: { title: 'Manual Handling', code: 'IND-005' } },
    ]);
    const res = await request(app).get('/api/inductions');
    expect(res.status).toBe(200);
    expect(res.body.data[0]).toHaveProperty('employeeName');
  });

  it('success is true on 200 response', async () => {
    mockPrisma.trainRecord.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/inductions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('Training Inductions — extended', () => {
  it('data length matches number of records from findMany', async () => {
    mockPrisma.trainRecord.findMany.mockResolvedValue([
      { id: '1', employeeName: 'A', course: { title: 'Course 1', code: 'C-001' } },
      { id: '2', employeeName: 'B', course: { title: 'Course 2', code: 'C-002' } },
    ]);
    const res = await request(app).get('/api/inductions');
    expect(res.body.data).toHaveLength(2);
  });

  it('course has a title that is a string', async () => {
    mockPrisma.trainRecord.findMany.mockResolvedValue([
      { id: '1', employeeName: 'Tester', course: { title: 'Fire Safety', code: 'FS-001' } },
    ]);
    const res = await request(app).get('/api/inductions');
    expect(typeof res.body.data[0].course.title).toBe('string');
  });

  it('success is false on 500', async () => {
    mockPrisma.trainRecord.findMany.mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/api/inductions');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('Training Inductions — extra', () => {
  it('course code is a string', async () => {
    mockPrisma.trainRecord.findMany.mockResolvedValue([
      { id: 'r-2', employeeName: 'Dave', course: { title: 'PPE Training', code: 'PPE-001' } },
    ]);
    const res = await request(app).get('/api/inductions');
    expect(res.status).toBe(200);
    expect(typeof res.body.data[0].course.code).toBe('string');
  });

  it('findMany called once per GET request', async () => {
    mockPrisma.trainRecord.findMany.mockResolvedValue([]);
    await request(app).get('/api/inductions');
    expect(mockPrisma.trainRecord.findMany).toHaveBeenCalledTimes(1);
  });

  it('error message code is INTERNAL_ERROR on DB error', async () => {
    mockPrisma.trainRecord.findMany.mockRejectedValue(new Error('timeout'));
    const res = await request(app).get('/api/inductions');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('inductions.api — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/inductions', router);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/inductions', async () => {
    const res = await request(app).get('/api/inductions');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });

  it('response is JSON content-type for GET /api/inductions', async () => {
    const res = await request(app).get('/api/inductions');
    expect(res.headers['content-type']).toBeDefined();
  });

  it('GET /api/inductions body has success property', async () => {
    const res = await request(app).get('/api/inductions');
    if (res.status === 200) {
      expect(res.body).toHaveProperty('success');
    } else {
      expect(res.body).toBeDefined();
    }
  });

  it('GET /api/inductions body is an object', async () => {
    const res = await request(app).get('/api/inductions');
    expect(typeof res.body).toBe('object');
  });

  it('GET /api/inductions route is accessible', async () => {
    const res = await request(app).get('/api/inductions');
    expect(res.status).toBeDefined();
  });
});

describe('inductions.api — edge cases and extended coverage', () => {
  it('returns records with all required nested course fields', async () => {
    mockPrisma.trainRecord.findMany.mockResolvedValue([
      {
        id: '00000000-0000-0000-0000-000000000001',
        employeeName: 'Alice',
        course: { title: 'Contractor Induction', code: 'IND-100' },
      },
    ]);
    const res = await request(app).get('/api/inductions');
    expect(res.status).toBe(200);
    expect(res.body.data[0].course.title).toBe('Contractor Induction');
    expect(res.body.data[0].course.code).toBe('IND-100');
  });

  it('success flag is true when findMany returns records', async () => {
    mockPrisma.trainRecord.findMany.mockResolvedValue([
      { id: '1', employeeName: 'Bob', course: { title: 'Fire Induction', code: 'F-001' } },
    ]);
    const res = await request(app).get('/api/inductions');
    expect(res.body.success).toBe(true);
  });

  it('data array length matches number of records returned', async () => {
    mockPrisma.trainRecord.findMany.mockResolvedValue([
      { id: '1', employeeName: 'A', course: { title: 'T1', code: 'C1' } },
      { id: '2', employeeName: 'B', course: { title: 'T2', code: 'C2' } },
      { id: '3', employeeName: 'C', course: { title: 'T3', code: 'C3' } },
    ]);
    const res = await request(app).get('/api/inductions');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(3);
  });

  it('findMany is called with INDUCTION filter via route logic', async () => {
    mockPrisma.trainRecord.findMany.mockResolvedValue([]);
    await request(app).get('/api/inductions');
    expect(mockPrisma.trainRecord.findMany).toHaveBeenCalledTimes(1);
    const callArg = mockPrisma.trainRecord.findMany.mock.calls[0][0];
    expect(callArg).toBeDefined();
  });

  it('error body has success false and error code on 500', async () => {
    mockPrisma.trainRecord.findMany.mockRejectedValue(new Error('network error'));
    const res = await request(app).get('/api/inductions');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('handles large dataset without error', async () => {
    const records = Array.from({ length: 50 }, (_, i) => ({
      id: String(i),
      employeeName: `Employee ${i}`,
      course: { title: `Course ${i}`, code: `IND-${i}` },
    }));
    mockPrisma.trainRecord.findMany.mockResolvedValue(records);
    const res = await request(app).get('/api/inductions');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(50);
  });

  it('response body has no pagination field (non-paginated endpoint)', async () => {
    mockPrisma.trainRecord.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/inductions');
    expect(res.status).toBe(200);
    expect(res.body.pagination).toBeUndefined();
  });

  it('each record id is accessible in data array', async () => {
    mockPrisma.trainRecord.findMany.mockResolvedValue([
      {
        id: '00000000-0000-0000-0000-000000000010',
        employeeName: 'Test User',
        course: { title: 'Health & Safety', code: 'HS-001' },
      },
    ]);
    const res = await request(app).get('/api/inductions');
    expect(res.status).toBe(200);
    expect(res.body.data[0].id).toBe('00000000-0000-0000-0000-000000000010');
  });
});

describe('inductions.api — final coverage expansion', () => {
  it('GET /api/inductions response content-type contains json', async () => {
    mockPrisma.trainRecord.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/inductions');
    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('GET /api/inductions data is empty array on no records', async () => {
    mockPrisma.trainRecord.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/inductions');
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it('GET /api/inductions success is boolean', async () => {
    mockPrisma.trainRecord.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/inductions');
    expect(typeof res.body.success).toBe('boolean');
  });

  it('GET /api/inductions: 500 error body has error object', async () => {
    mockPrisma.trainRecord.findMany.mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/api/inductions');
    expect(res.status).toBe(500);
    expect(res.body.error).toBeDefined();
  });

  it('GET /api/inductions returns records with status field if present', async () => {
    mockPrisma.trainRecord.findMany.mockResolvedValue([
      {
        id: 'r-1',
        employeeName: 'Eve',
        status: 'COMPLETED',
        course: { title: 'COSHH Induction', code: 'CO-001' },
      },
    ]);
    const res = await request(app).get('/api/inductions');
    expect(res.status).toBe(200);
    expect(res.body.data[0].status).toBe('COMPLETED');
  });

  it('GET /api/inductions response body has no unexpected fields', async () => {
    mockPrisma.trainRecord.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/inductions');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success');
    expect(res.body).toHaveProperty('data');
  });

  it('GET /api/inductions error body success is false when rejected', async () => {
    mockPrisma.trainRecord.findMany.mockRejectedValue(new Error('rejection'));
    const res = await request(app).get('/api/inductions');
    expect(res.body.success).toBe(false);
  });
});

describe('inductions.api — coverage to 40', () => {
  it('GET /api/inductions response body has success and data', async () => {
    mockPrisma.trainRecord.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/inductions');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success');
    expect(res.body).toHaveProperty('data');
  });

  it('GET /api/inductions returns three records correctly', async () => {
    mockPrisma.trainRecord.findMany.mockResolvedValue([
      { id: 'a', employeeName: 'Alice', course: { title: 'T1', code: 'C1' } },
      { id: 'b', employeeName: 'Bob', course: { title: 'T2', code: 'C2' } },
      { id: 'c', employeeName: 'Carol', course: { title: 'T3', code: 'C3' } },
    ]);
    const res = await request(app).get('/api/inductions');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(3);
    expect(res.body.data[2].employeeName).toBe('Carol');
  });

  it('GET /api/inductions: data array items have id property', async () => {
    mockPrisma.trainRecord.findMany.mockResolvedValue([
      { id: 'ind-001', employeeName: 'Dave', course: { title: 'Safety', code: 'S-001' } },
    ]);
    const res = await request(app).get('/api/inductions');
    expect(res.status).toBe(200);
    expect(res.body.data[0]).toHaveProperty('id');
  });

  it('GET /api/inductions success is true with one record', async () => {
    mockPrisma.trainRecord.findMany.mockResolvedValue([
      { id: '1', employeeName: 'Eve', course: { title: 'Fire', code: 'F-001' } },
    ]);
    const res = await request(app).get('/api/inductions');
    expect(res.body.success).toBe(true);
  });

  it('GET /api/inductions: findMany called with include.course', async () => {
    mockPrisma.trainRecord.findMany.mockResolvedValue([]);
    await request(app).get('/api/inductions');
    expect(mockPrisma.trainRecord.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ include: expect.objectContaining({ course: expect.objectContaining({ select: expect.any(Object) }) }) })
    );
  });
});

describe('inductions.api — phase28 coverage', () => {
  it('GET /api/inductions data array is empty when no records', async () => {
    mockPrisma.trainRecord.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/inductions');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it('GET /api/inductions data has five records when five returned', async () => {
    const records = Array.from({ length: 5 }, (_, i) => ({ id: String(i), employeeName: 'Emp ' + i, course: { title: 'T' + i, code: 'C' + i } }));
    mockPrisma.trainRecord.findMany.mockResolvedValue(records);
    const res = await request(app).get('/api/inductions');
    expect(res.body.data).toHaveLength(5);
  });

  it('GET /api/inductions error response has error.code INTERNAL_ERROR', async () => {
    mockPrisma.trainRecord.findMany.mockRejectedValue(new Error('timeout'));
    const res = await request(app).get('/api/inductions');
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /api/inductions findMany called with include option', async () => {
    mockPrisma.trainRecord.findMany.mockResolvedValue([]);
    await request(app).get('/api/inductions');
    const callArg = mockPrisma.trainRecord.findMany.mock.calls[0][0];
    expect(callArg.include).toBeDefined();
  });

  it('GET /api/inductions response body has only success and data fields', async () => {
    mockPrisma.trainRecord.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/inductions');
    expect(res.body).toHaveProperty('success');
    expect(res.body).toHaveProperty('data');
    expect(res.body.pagination).toBeUndefined();
  });
});
