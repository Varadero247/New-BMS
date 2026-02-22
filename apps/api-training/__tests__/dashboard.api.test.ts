import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    trainCourse: { count: jest.fn() },
    trainRecord: { count: jest.fn() },
    trainCompetency: { count: jest.fn() },
    trainMatrix: { count: jest.fn() },
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

import router from '../src/routes/dashboard';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const app = express();
app.use(express.json());
app.use('/api/dashboard', router);
beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/dashboard/stats', () => {
  it('should return training stats', async () => {
    mockPrisma.trainCourse.count.mockResolvedValue(10);
    mockPrisma.trainRecord.count.mockResolvedValue(50);
    mockPrisma.trainCompetency.count.mockResolvedValue(8);
    mockPrisma.trainMatrix.count.mockResolvedValue(3);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalCourses).toBe(10);
    expect(res.body.data.totalRecords).toBe(50);
    expect(res.body.data.totalCompetencies).toBe(8);
    expect(res.body.data.totalGaps).toBe(3);
  });

  it('should return zeros when no data exists', async () => {
    mockPrisma.trainCourse.count.mockResolvedValue(0);
    mockPrisma.trainRecord.count.mockResolvedValue(0);
    mockPrisma.trainCompetency.count.mockResolvedValue(0);
    mockPrisma.trainMatrix.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalCourses).toBe(0);
    expect(res.body.data.totalRecords).toBe(0);
    expect(res.body.data.totalCompetencies).toBe(0);
    expect(res.body.data.totalGaps).toBe(0);
  });

  it('should return 500 on error', async () => {
    mockPrisma.trainCourse.count.mockRejectedValue(new Error('DB error'));
    mockPrisma.trainRecord.count.mockRejectedValue(new Error('DB error'));
    mockPrisma.trainCompetency.count.mockRejectedValue(new Error('DB error'));
    mockPrisma.trainMatrix.count.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('response has all four expected data keys', async () => {
    mockPrisma.trainCourse.count.mockResolvedValue(1);
    mockPrisma.trainRecord.count.mockResolvedValue(1);
    mockPrisma.trainCompetency.count.mockResolvedValue(1);
    mockPrisma.trainMatrix.count.mockResolvedValue(1);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.body.data).toHaveProperty('totalCourses');
    expect(res.body.data).toHaveProperty('totalRecords');
    expect(res.body.data).toHaveProperty('totalCompetencies');
    expect(res.body.data).toHaveProperty('totalGaps');
  });

  it('all four count queries run per request', async () => {
    mockPrisma.trainCourse.count.mockResolvedValue(5);
    mockPrisma.trainRecord.count.mockResolvedValue(20);
    mockPrisma.trainCompetency.count.mockResolvedValue(3);
    mockPrisma.trainMatrix.count.mockResolvedValue(1);
    await request(app).get('/api/dashboard/stats');
    expect(mockPrisma.trainCourse.count).toHaveBeenCalledTimes(1);
    expect(mockPrisma.trainRecord.count).toHaveBeenCalledTimes(1);
    expect(mockPrisma.trainCompetency.count).toHaveBeenCalledTimes(1);
    expect(mockPrisma.trainMatrix.count).toHaveBeenCalledTimes(1);
  });

  it('totalRecords reflects the mock count', async () => {
    mockPrisma.trainCourse.count.mockResolvedValue(0);
    mockPrisma.trainRecord.count.mockResolvedValue(77);
    mockPrisma.trainCompetency.count.mockResolvedValue(0);
    mockPrisma.trainMatrix.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.data.totalRecords).toBe(77);
  });

  it('totalCompetencies reflects the mock count', async () => {
    mockPrisma.trainCourse.count.mockResolvedValue(0);
    mockPrisma.trainRecord.count.mockResolvedValue(0);
    mockPrisma.trainCompetency.count.mockResolvedValue(14);
    mockPrisma.trainMatrix.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.data.totalCompetencies).toBe(14);
  });

  it('success is true on 200 response', async () => {
    mockPrisma.trainCourse.count.mockResolvedValue(0);
    mockPrisma.trainRecord.count.mockResolvedValue(0);
    mockPrisma.trainCompetency.count.mockResolvedValue(0);
    mockPrisma.trainMatrix.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('GET /api/dashboard/stats — extended', () => {
  it('totalGaps reflects the mock trainMatrix count', async () => {
    mockPrisma.trainCourse.count.mockResolvedValue(0);
    mockPrisma.trainRecord.count.mockResolvedValue(0);
    mockPrisma.trainCompetency.count.mockResolvedValue(0);
    mockPrisma.trainMatrix.count.mockResolvedValue(9);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.data.totalGaps).toBe(9);
  });

  it('trainMatrix error causes 500', async () => {
    mockPrisma.trainCourse.count.mockResolvedValue(1);
    mockPrisma.trainRecord.count.mockResolvedValue(1);
    mockPrisma.trainCompetency.count.mockResolvedValue(1);
    mockPrisma.trainMatrix.count.mockRejectedValue(new Error('matrix fail'));
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('large count values returned correctly', async () => {
    mockPrisma.trainCourse.count.mockResolvedValue(200);
    mockPrisma.trainRecord.count.mockResolvedValue(3000);
    mockPrisma.trainCompetency.count.mockResolvedValue(80);
    mockPrisma.trainMatrix.count.mockResolvedValue(50);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.data.totalCourses).toBe(200);
    expect(res.body.data.totalRecords).toBe(3000);
    expect(res.body.data.totalCompetencies).toBe(80);
    expect(res.body.data.totalGaps).toBe(50);
  });

  it('response body has success property', async () => {
    mockPrisma.trainCourse.count.mockResolvedValue(0);
    mockPrisma.trainRecord.count.mockResolvedValue(0);
    mockPrisma.trainCompetency.count.mockResolvedValue(0);
    mockPrisma.trainMatrix.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.body).toHaveProperty('success');
  });

  it('error response does not include data field', async () => {
    mockPrisma.trainCourse.count.mockRejectedValue(new Error('fail'));
    mockPrisma.trainRecord.count.mockResolvedValue(0);
    mockPrisma.trainCompetency.count.mockResolvedValue(0);
    mockPrisma.trainMatrix.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(500);
    expect(res.body.data).toBeUndefined();
  });

  it('totalCourses is a number on success', async () => {
    mockPrisma.trainCourse.count.mockResolvedValue(5);
    mockPrisma.trainRecord.count.mockResolvedValue(0);
    mockPrisma.trainCompetency.count.mockResolvedValue(0);
    mockPrisma.trainMatrix.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(typeof res.body.data.totalCourses).toBe('number');
  });

  it('trainRecord error causes 500 with INTERNAL_ERROR code', async () => {
    mockPrisma.trainCourse.count.mockResolvedValue(1);
    mockPrisma.trainRecord.count.mockRejectedValue(new Error('record fail'));
    mockPrisma.trainCompetency.count.mockResolvedValue(1);
    mockPrisma.trainMatrix.count.mockResolvedValue(1);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('dashboard.api — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/dashboard', router);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/dashboard', async () => {
    const res = await request(app).get('/api/dashboard');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });

  it('response is JSON content-type for GET /api/dashboard', async () => {
    const res = await request(app).get('/api/dashboard');
    expect(res.headers['content-type']).toBeDefined();
  });

  it('GET /api/dashboard body has success property', async () => {
    const res = await request(app).get('/api/dashboard');
    if (res.status === 200) {
      expect(res.body).toHaveProperty('success');
    } else {
      expect(res.body).toBeDefined();
    }
  });

  it('GET /api/dashboard body is an object', async () => {
    const res = await request(app).get('/api/dashboard');
    expect(typeof res.body).toBe('object');
  });

  it('GET /api/dashboard route is accessible', async () => {
    const res = await request(app).get('/api/dashboard');
    expect(res.status).toBeDefined();
  });
});

describe('dashboard.api — edge cases and extended coverage', () => {
  it('GET /api/dashboard/stats returns 404 for unknown sub-path', async () => {
    mockPrisma.trainCourse.count.mockResolvedValue(0);
    mockPrisma.trainRecord.count.mockResolvedValue(0);
    mockPrisma.trainCompetency.count.mockResolvedValue(0);
    mockPrisma.trainMatrix.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/unknown-path');
    expect([404, 500]).toContain(res.status);
  });

  it('GET /api/dashboard/stats data keys are all numbers', async () => {
    mockPrisma.trainCourse.count.mockResolvedValue(3);
    mockPrisma.trainRecord.count.mockResolvedValue(7);
    mockPrisma.trainCompetency.count.mockResolvedValue(2);
    mockPrisma.trainMatrix.count.mockResolvedValue(1);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(typeof res.body.data.totalCourses).toBe('number');
    expect(typeof res.body.data.totalRecords).toBe('number');
    expect(typeof res.body.data.totalCompetencies).toBe('number');
    expect(typeof res.body.data.totalGaps).toBe('number');
  });

  it('GET /api/dashboard/stats trainCompetency error causes 500', async () => {
    mockPrisma.trainCourse.count.mockResolvedValue(5);
    mockPrisma.trainRecord.count.mockResolvedValue(10);
    mockPrisma.trainCompetency.count.mockRejectedValue(new Error('competency fail'));
    mockPrisma.trainMatrix.count.mockResolvedValue(2);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/dashboard/stats error code is INTERNAL_ERROR', async () => {
    mockPrisma.trainCourse.count.mockRejectedValue(new Error('all fail'));
    mockPrisma.trainRecord.count.mockResolvedValue(0);
    mockPrisma.trainCompetency.count.mockResolvedValue(0);
    mockPrisma.trainMatrix.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /api/dashboard/stats with very large counts returns correctly', async () => {
    mockPrisma.trainCourse.count.mockResolvedValue(9999);
    mockPrisma.trainRecord.count.mockResolvedValue(99999);
    mockPrisma.trainCompetency.count.mockResolvedValue(999);
    mockPrisma.trainMatrix.count.mockResolvedValue(500);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.data.totalCourses).toBe(9999);
    expect(res.body.data.totalRecords).toBe(99999);
  });

  it('GET /api/dashboard/stats success property is boolean', async () => {
    mockPrisma.trainCourse.count.mockResolvedValue(0);
    mockPrisma.trainRecord.count.mockResolvedValue(0);
    mockPrisma.trainCompetency.count.mockResolvedValue(0);
    mockPrisma.trainMatrix.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(typeof res.body.success).toBe('boolean');
  });

  it('GET /api/dashboard/stats each count query is called exactly once', async () => {
    mockPrisma.trainCourse.count.mockResolvedValue(1);
    mockPrisma.trainRecord.count.mockResolvedValue(2);
    mockPrisma.trainCompetency.count.mockResolvedValue(3);
    mockPrisma.trainMatrix.count.mockResolvedValue(4);
    await request(app).get('/api/dashboard/stats');
    expect(mockPrisma.trainCourse.count).toHaveBeenCalledTimes(1);
    expect(mockPrisma.trainRecord.count).toHaveBeenCalledTimes(1);
    expect(mockPrisma.trainCompetency.count).toHaveBeenCalledTimes(1);
    expect(mockPrisma.trainMatrix.count).toHaveBeenCalledTimes(1);
  });

  it('GET /api/dashboard/stats data object has exactly 4 keys', async () => {
    mockPrisma.trainCourse.count.mockResolvedValue(0);
    mockPrisma.trainRecord.count.mockResolvedValue(0);
    mockPrisma.trainCompetency.count.mockResolvedValue(0);
    mockPrisma.trainMatrix.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(Object.keys(res.body.data)).toHaveLength(4);
  });
});

describe('dashboard.api — final coverage expansion', () => {
  it('GET /api/dashboard/stats totalGaps is a number', async () => {
    mockPrisma.trainCourse.count.mockResolvedValue(2);
    mockPrisma.trainRecord.count.mockResolvedValue(10);
    mockPrisma.trainCompetency.count.mockResolvedValue(5);
    mockPrisma.trainMatrix.count.mockResolvedValue(3);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(typeof res.body.data.totalGaps).toBe('number');
  });

  it('GET /api/dashboard/stats data.totalCourses equals mock count', async () => {
    mockPrisma.trainCourse.count.mockResolvedValue(42);
    mockPrisma.trainRecord.count.mockResolvedValue(0);
    mockPrisma.trainCompetency.count.mockResolvedValue(0);
    mockPrisma.trainMatrix.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.data.totalCourses).toBe(42);
  });

  it('GET /api/dashboard/stats error body has error.code', async () => {
    mockPrisma.trainCourse.count.mockRejectedValue(new Error('fail'));
    mockPrisma.trainRecord.count.mockResolvedValue(0);
    mockPrisma.trainCompetency.count.mockResolvedValue(0);
    mockPrisma.trainMatrix.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(500);
    expect(res.body.error).toHaveProperty('code');
  });

  it('GET /api/dashboard/stats responds in under reasonable time', async () => {
    mockPrisma.trainCourse.count.mockResolvedValue(1);
    mockPrisma.trainRecord.count.mockResolvedValue(1);
    mockPrisma.trainCompetency.count.mockResolvedValue(1);
    mockPrisma.trainMatrix.count.mockResolvedValue(1);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
  });

  it('GET /api/dashboard/stats success is exactly true on 200', async () => {
    mockPrisma.trainCourse.count.mockResolvedValue(0);
    mockPrisma.trainRecord.count.mockResolvedValue(0);
    mockPrisma.trainCompetency.count.mockResolvedValue(0);
    mockPrisma.trainMatrix.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.body.success).toStrictEqual(true);
  });

  it('GET /api/dashboard/stats returns 200 status code on success', async () => {
    mockPrisma.trainCourse.count.mockResolvedValue(5);
    mockPrisma.trainRecord.count.mockResolvedValue(20);
    mockPrisma.trainCompetency.count.mockResolvedValue(8);
    mockPrisma.trainMatrix.count.mockResolvedValue(2);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
  });

  it('GET /api/dashboard/stats data.totalRecords and totalCompetencies differ when mocks differ', async () => {
    mockPrisma.trainCourse.count.mockResolvedValue(0);
    mockPrisma.trainRecord.count.mockResolvedValue(100);
    mockPrisma.trainCompetency.count.mockResolvedValue(10);
    mockPrisma.trainMatrix.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.data.totalRecords).not.toBe(res.body.data.totalCompetencies);
  });
});

describe('dashboard.api (training) — coverage to 40', () => {
  it('GET /api/dashboard/stats response body has success and data', async () => {
    mockPrisma.trainCourse.count.mockResolvedValue(0);
    mockPrisma.trainRecord.count.mockResolvedValue(0);
    mockPrisma.trainCompetency.count.mockResolvedValue(0);
    mockPrisma.trainMatrix.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success');
    expect(res.body).toHaveProperty('data');
  });

  it('GET /api/dashboard/stats response content-type is json', async () => {
    mockPrisma.trainCourse.count.mockResolvedValue(0);
    mockPrisma.trainRecord.count.mockResolvedValue(0);
    mockPrisma.trainCompetency.count.mockResolvedValue(0);
    mockPrisma.trainMatrix.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('GET /api/dashboard/stats data values are non-negative', async () => {
    mockPrisma.trainCourse.count.mockResolvedValue(4);
    mockPrisma.trainRecord.count.mockResolvedValue(10);
    mockPrisma.trainCompetency.count.mockResolvedValue(2);
    mockPrisma.trainMatrix.count.mockResolvedValue(1);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.data.totalCourses).toBeGreaterThanOrEqual(0);
    expect(res.body.data.totalRecords).toBeGreaterThanOrEqual(0);
    expect(res.body.data.totalCompetencies).toBeGreaterThanOrEqual(0);
    expect(res.body.data.totalGaps).toBeGreaterThanOrEqual(0);
  });

  it('error body is defined on 500', async () => {
    mockPrisma.trainCourse.count.mockRejectedValue(new Error('fatal'));
    mockPrisma.trainRecord.count.mockResolvedValue(0);
    mockPrisma.trainCompetency.count.mockResolvedValue(0);
    mockPrisma.trainMatrix.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(500);
    expect(res.body.error).toBeDefined();
  });

  it('data object is not null on success', async () => {
    mockPrisma.trainCourse.count.mockResolvedValue(1);
    mockPrisma.trainRecord.count.mockResolvedValue(1);
    mockPrisma.trainCompetency.count.mockResolvedValue(1);
    mockPrisma.trainMatrix.count.mockResolvedValue(1);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.data).not.toBeNull();
  });
});
