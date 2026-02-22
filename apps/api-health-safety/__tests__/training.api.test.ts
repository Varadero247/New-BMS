import express from 'express';
import request from 'supertest';

// Mock dependencies - use ../prisma (not @ims/database)
jest.mock('../src/prisma', () => ({
  prisma: {
    trainCourse: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    trainRecord: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: '20000000-0000-4000-a000-000000000123', email: 'test@test.com', role: 'USER' };
    next();
  }),
}));
jest.mock('@ims/service-auth', () => ({
  checkOwnership: () => (_req: any, _res: any, next: any) => next(),
  scopeToUser: (_req: any, _res: any, next: any) => next(),
}));

jest.mock('uuid', () => ({
  v4: jest.fn(() => '30000000-0000-4000-a000-000000000123'),
}));

import { prisma } from '../src/prisma';
import trainingRoutes from '../src/routes/training';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('Health & Safety Training API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/training', trainingRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/training/courses', () => {
    const mockCourses = [
      {
        id: '2d000000-0000-4000-a000-000000000001',
        title: 'Fire Safety',
        description: 'Fire safety awareness training',
        standard: 'ISO_45001',
        isActive: true,
        provider: 'Safety Corp',
      },
      {
        id: 'course-2',
        title: 'Manual Handling',
        description: 'Correct lifting techniques',
        standard: 'ISO_45001',
        isActive: true,
        provider: null,
      },
    ];

    it('should return list of active H&S training courses', async () => {
      (mockPrisma.trainCourse.findMany as jest.Mock).mockResolvedValueOnce(mockCourses);

      const response = await request(app)
        .get('/api/training/courses')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it('should filter for ISO_45001 or null standard and isActive true', async () => {
      (mockPrisma.trainCourse.findMany as jest.Mock).mockResolvedValueOnce([]);

      await request(app).get('/api/training/courses').set('Authorization', 'Bearer token');

      expect(mockPrisma.trainCourse.findMany).toHaveBeenCalledWith({
        where: {
          OR: [{ standard: 'ISO_45001' }, { standard: null }],
          isActive: true,
        },
        orderBy: { title: 'asc' },
        take: 100,
      });
    });

    it('should order courses by title ascending', async () => {
      (mockPrisma.trainCourse.findMany as jest.Mock).mockResolvedValueOnce(mockCourses);

      await request(app).get('/api/training/courses').set('Authorization', 'Bearer token');

      expect(mockPrisma.trainCourse.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { title: 'asc' },
        })
      );
    });

    it('should handle database errors', async () => {
      (mockPrisma.trainCourse.findMany as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app)
        .get('/api/training/courses')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('GET /api/training/records', () => {
    const mockRecords = [
      {
        id: 'record-1',
        userId: '20000000-0000-4000-a000-000000000001',
        courseId: '2d000000-0000-4000-a000-000000000001',
        status: 'COMPLETED',
        user: {
          id: '20000000-0000-4000-a000-000000000001',
          firstName: 'John',
          lastName: 'Doe',
          department: 'Engineering',
        },
        course: {
          id: '2d000000-0000-4000-a000-000000000001',
          title: 'Fire Safety',
          standard: 'ISO_45001',
        },
      },
      {
        id: 'record-2',
        userId: '20000000-0000-4000-a000-000000000002',
        courseId: 'course-2',
        status: 'IN_PROGRESS',
        user: {
          id: '20000000-0000-4000-a000-000000000002',
          firstName: 'Jane',
          lastName: 'Smith',
          department: 'Operations',
        },
        course: { id: 'course-2', title: 'Manual Handling', standard: null },
      },
    ];

    it('should return list of training records', async () => {
      (mockPrisma.trainRecord.findMany as jest.Mock).mockResolvedValueOnce(mockRecords);

      const response = await request(app)
        .get('/api/training/records')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it('should filter records for H&S courses only (ISO_45001 or null standard)', async () => {
      const mixedRecords = [
        ...mockRecords,
        {
          id: 'record-3',
          userId: 'user-3',
          courseId: 'course-3',
          status: 'COMPLETED',
          user: { id: 'user-3', firstName: 'Bob', lastName: 'Lee', department: 'HR' },
          course: { id: 'course-3', title: 'HR Training', standard: 'ISO_9001' },
        },
      ];
      (mockPrisma.trainRecord.findMany as jest.Mock).mockResolvedValueOnce(mixedRecords);

      const response = await request(app)
        .get('/api/training/records')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      // Should filter out the ISO_9001 record
      expect(response.body.data).toHaveLength(2);
    });

    it('should filter by userId', async () => {
      (mockPrisma.trainRecord.findMany as jest.Mock).mockResolvedValueOnce([mockRecords[0]]);

      await request(app)
        .get('/api/training/records?userId=20000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.trainRecord.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: '20000000-0000-4000-a000-000000000001',
          }),
        })
      );
    });

    it('should filter by courseId', async () => {
      (mockPrisma.trainRecord.findMany as jest.Mock).mockResolvedValueOnce([]);

      await request(app)
        .get('/api/training/records?courseId=2d000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.trainRecord.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            courseId: '2d000000-0000-4000-a000-000000000001',
          }),
        })
      );
    });

    it('should filter by status', async () => {
      (mockPrisma.trainRecord.findMany as jest.Mock).mockResolvedValueOnce([]);

      await request(app)
        .get('/api/training/records?status=COMPLETED')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.trainRecord.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'COMPLETED',
          }),
        })
      );
    });

    it('should include user and course data', async () => {
      (mockPrisma.trainRecord.findMany as jest.Mock).mockResolvedValueOnce(mockRecords);

      await request(app).get('/api/training/records').set('Authorization', 'Bearer token');

      expect(mockPrisma.trainRecord.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            user: expect.any(Object),
            course: expect.any(Object),
          }),
        })
      );
    });

    it('should order by createdAt descending', async () => {
      (mockPrisma.trainRecord.findMany as jest.Mock).mockResolvedValueOnce(mockRecords);

      await request(app).get('/api/training/records').set('Authorization', 'Bearer token');

      expect(mockPrisma.trainRecord.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        })
      );
    });

    it('should handle database errors', async () => {
      (mockPrisma.trainRecord.findMany as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app)
        .get('/api/training/records')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/training/courses', () => {
    const createPayload = {
      title: 'Working at Heights',
      description: 'Safety when working at elevation',
      provider: 'Safety Training Ltd',
      duration: '4 hours',
      frequency: 'Annual',
    };

    it('should create a training course successfully', async () => {
      (mockPrisma.trainCourse.create as jest.Mock).mockResolvedValueOnce({
        id: '30000000-0000-4000-a000-000000000123',
        standard: 'ISO_45001',
        ...createPayload,
        isActive: true,
      });

      const response = await request(app)
        .post('/api/training/courses')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(createPayload.title);
      expect(response.body.data.standard).toBe('ISO_45001');
    });

    it('should set standard to ISO_45001 and isActive to true', async () => {
      (mockPrisma.trainCourse.create as jest.Mock).mockResolvedValueOnce({
        id: '30000000-0000-4000-a000-000000000123',
        ...createPayload,
        standard: 'ISO_45001',
        isActive: true,
      });

      await request(app)
        .post('/api/training/courses')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(mockPrisma.trainCourse.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            standard: 'ISO_45001',
            isActive: true,
          }),
        })
      );
    });

    it('should return 400 for missing title', async () => {
      const response = await request(app)
        .post('/api/training/courses')
        .set('Authorization', 'Bearer token')
        .send({ description: 'No title provided' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for empty title', async () => {
      const response = await request(app)
        .post('/api/training/courses')
        .set('Authorization', 'Bearer token')
        .send({ title: '' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (mockPrisma.trainCourse.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/training/courses')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/training/records', () => {
    const createPayload = {
      userId: '20000000-0000-4000-a000-000000000001',
      courseId: '2d000000-0000-4000-a000-000000000001',
      status: 'COMPLETED',
      completedAt: '2025-01-15T00:00:00.000Z',
      score: 85,
      competenceLevel: 'PROFICIENT',
    };

    it('should create a training record successfully', async () => {
      (mockPrisma.trainRecord.create as jest.Mock).mockResolvedValueOnce({
        id: '30000000-0000-4000-a000-000000000123',
        ...createPayload,
        completedAt: new Date(createPayload.completedAt),
      });

      const response = await request(app)
        .post('/api/training/records')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.userId).toBe('20000000-0000-4000-a000-000000000001');
    });

    it('should convert completedAt and expiresAt to Date objects', async () => {
      const payload = {
        ...createPayload,
        expiresAt: '2026-01-15T00:00:00.000Z',
      };

      (mockPrisma.trainRecord.create as jest.Mock).mockResolvedValueOnce({
        id: '30000000-0000-4000-a000-000000000123',
        ...payload,
      });

      await request(app)
        .post('/api/training/records')
        .set('Authorization', 'Bearer token')
        .send(payload);

      expect(mockPrisma.trainRecord.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            completedAt: expect.any(Date),
            expiresAt: expect.any(Date),
          }),
        })
      );
    });

    it('should set assessedAt when assessedBy is provided', async () => {
      const payload = {
        ...createPayload,
        assessedBy: 'assessor-1',
      };

      (mockPrisma.trainRecord.create as jest.Mock).mockResolvedValueOnce({
        id: '30000000-0000-4000-a000-000000000123',
        ...payload,
      });

      await request(app)
        .post('/api/training/records')
        .set('Authorization', 'Bearer token')
        .send(payload);

      expect(mockPrisma.trainRecord.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            assessedBy: 'assessor-1',
            assessedAt: expect.any(Date),
          }),
        })
      );
    });

    it('should return 400 for missing userId', async () => {
      const response = await request(app)
        .post('/api/training/records')
        .set('Authorization', 'Bearer token')
        .send({ courseId: '2d000000-0000-4000-a000-000000000001' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing courseId', async () => {
      const response = await request(app)
        .post('/api/training/records')
        .set('Authorization', 'Bearer token')
        .send({ userId: '20000000-0000-4000-a000-000000000001' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid competenceLevel', async () => {
      const response = await request(app)
        .post('/api/training/records')
        .set('Authorization', 'Bearer token')
        .send({ ...createPayload, competenceLevel: 'INVALID_LEVEL' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid status', async () => {
      const response = await request(app)
        .post('/api/training/records')
        .set('Authorization', 'Bearer token')
        .send({
          userId: '20000000-0000-4000-a000-000000000001',
          courseId: '2d000000-0000-4000-a000-000000000001',
          status: 'INVALID',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should default status to NOT_STARTED if not provided', async () => {
      (mockPrisma.trainRecord.create as jest.Mock).mockResolvedValueOnce({
        id: '30000000-0000-4000-a000-000000000123',
        userId: '20000000-0000-4000-a000-000000000001',
        courseId: '2d000000-0000-4000-a000-000000000001',
        status: 'NOT_STARTED',
      });

      await request(app).post('/api/training/records').set('Authorization', 'Bearer token').send({
        userId: '20000000-0000-4000-a000-000000000001',
        courseId: '2d000000-0000-4000-a000-000000000001',
      });

      expect(mockPrisma.trainRecord.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'NOT_STARTED',
          }),
        })
      );
    });

    it('should handle database errors', async () => {
      (mockPrisma.trainRecord.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/training/records')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('additional coverage — response shape and field validation', () => {
    it('GET /courses returns empty array when no courses exist', async () => {
      (mockPrisma.trainCourse.findMany as jest.Mock).mockResolvedValueOnce([]);

      const response = await request(app)
        .get('/api/training/courses')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(0);
    });

    it('GET /records returns empty array when no records exist', async () => {
      (mockPrisma.trainRecord.findMany as jest.Mock).mockResolvedValueOnce([]);

      const response = await request(app)
        .get('/api/training/records')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(0);
    });

    it('POST /courses returns 201 with id in response data', async () => {
      (mockPrisma.trainCourse.create as jest.Mock).mockResolvedValueOnce({
        id: '30000000-0000-4000-a000-000000000123',
        title: 'Emergency First Aid',
        standard: 'ISO_45001',
        isActive: true,
      });

      const response = await request(app)
        .post('/api/training/courses')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Emergency First Aid' });

      expect(response.status).toBe(201);
      expect(response.body.data.id).toBe('30000000-0000-4000-a000-000000000123');
    });
  });
});

describe('H&S Training — final coverage', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/training', trainingRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /courses calls findMany with isActive: true', async () => {
    (mockPrisma.trainCourse.findMany as jest.Mock).mockResolvedValueOnce([]);
    await request(app).get('/api/training/courses').set('Authorization', 'Bearer token');
    expect(mockPrisma.trainCourse.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ isActive: true }) })
    );
  });

  it('GET /records filters by status=IN_PROGRESS wired to Prisma where', async () => {
    (mockPrisma.trainRecord.findMany as jest.Mock).mockResolvedValueOnce([]);
    await request(app).get('/api/training/records?status=IN_PROGRESS').set('Authorization', 'Bearer token');
    expect(mockPrisma.trainRecord.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ status: 'IN_PROGRESS' }) })
    );
  });

  it('POST /courses response data has standard: ISO_45001', async () => {
    (mockPrisma.trainCourse.create as jest.Mock).mockResolvedValueOnce({
      id: '30000000-0000-4000-a000-000000000123',
      title: 'Ladder Safety',
      standard: 'ISO_45001',
      isActive: true,
    });
    const res = await request(app)
      .post('/api/training/courses')
      .set('Authorization', 'Bearer token')
      .send({ title: 'Ladder Safety' });
    expect(res.status).toBe(201);
    expect(res.body.data.standard).toBe('ISO_45001');
  });

  it('POST /records response data has userId field', async () => {
    (mockPrisma.trainRecord.create as jest.Mock).mockResolvedValueOnce({
      id: '30000000-0000-4000-a000-000000000123',
      userId: '20000000-0000-4000-a000-000000000001',
      courseId: '2d000000-0000-4000-a000-000000000001',
      status: 'COMPLETED',
    });
    const res = await request(app)
      .post('/api/training/records')
      .set('Authorization', 'Bearer token')
      .send({ userId: '20000000-0000-4000-a000-000000000001', courseId: '2d000000-0000-4000-a000-000000000001', status: 'COMPLETED' });
    expect(res.status).toBe(201);
    expect(res.body.data.userId).toBe('20000000-0000-4000-a000-000000000001');
  });

  it('GET /records orders by createdAt desc', async () => {
    (mockPrisma.trainRecord.findMany as jest.Mock).mockResolvedValueOnce([]);
    await request(app).get('/api/training/records').set('Authorization', 'Bearer token');
    expect(mockPrisma.trainRecord.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { createdAt: 'desc' } })
    );
  });

  it('GET /courses take is 100', async () => {
    (mockPrisma.trainCourse.findMany as jest.Mock).mockResolvedValueOnce([]);
    await request(app).get('/api/training/courses').set('Authorization', 'Bearer token');
    expect(mockPrisma.trainCourse.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 100 })
    );
  });

  it('POST /records returns 400 for missing courseId', async () => {
    const res = await request(app)
      .post('/api/training/records')
      .set('Authorization', 'Bearer token')
      .send({ userId: '20000000-0000-4000-a000-000000000001', status: 'NOT_STARTED' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});
