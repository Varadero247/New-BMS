import express from 'express';
import request from 'supertest';

// Mock dependencies
jest.mock('@ims/database', () => ({
  prisma: {
    jobPosting: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    applicant: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    interview: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    interviewEvaluation: {
      create: jest.fn(),
    },
  },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: 'user-123', email: 'test@test.com', role: 'USER' };
    next();
  }),
}));

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-123'),
}));

import { prisma } from '@ims/database';
import recruitmentRoutes from '../src/routes/recruitment';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('HR Recruitment API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/recruitment', recruitmentRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/recruitment/jobs', () => {
    const mockJobs = [
      {
        id: 'job-1',
        jobCode: 'JOB-2024-0001',
        title: 'Software Engineer',
        status: 'PUBLISHED',
        department: { name: 'Engineering' },
        position: { title: 'Senior Developer' },
        _count: { applicants: 10, interviews: 5 },
      },
      {
        id: 'job-2',
        jobCode: 'JOB-2024-0002',
        title: 'Product Designer',
        status: 'DRAFT',
        department: { name: 'Design' },
        position: { title: 'UI/UX Designer' },
        _count: { applicants: 0, interviews: 0 },
      },
    ];

    it('should return list of job postings with pagination', async () => {
      (mockPrisma.jobPosting.findMany as jest.Mock).mockResolvedValueOnce(mockJobs);
      (mockPrisma.jobPosting.count as jest.Mock).mockResolvedValueOnce(2);

      const response = await request(app)
        .get('/api/recruitment/jobs')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.meta).toMatchObject({
        page: 1,
        limit: 20,
        total: 2,
        totalPages: 1,
      });
    });

    it('should support pagination parameters', async () => {
      (mockPrisma.jobPosting.findMany as jest.Mock).mockResolvedValueOnce([mockJobs[0]]);
      (mockPrisma.jobPosting.count as jest.Mock).mockResolvedValueOnce(100);

      const response = await request(app)
        .get('/api/recruitment/jobs?page=2&limit=10')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.meta.page).toBe(2);
      expect(response.body.meta.limit).toBe(10);
      expect(response.body.meta.totalPages).toBe(10);
    });

    it('should filter by status', async () => {
      (mockPrisma.jobPosting.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.jobPosting.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/recruitment/jobs?status=PUBLISHED')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.jobPosting.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'PUBLISHED',
          }),
        })
      );
    });

    it('should filter by departmentId', async () => {
      (mockPrisma.jobPosting.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.jobPosting.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/recruitment/jobs?departmentId=dept-1')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.jobPosting.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            departmentId: 'dept-1',
          }),
        })
      );
    });

    it('should filter by isRemote', async () => {
      (mockPrisma.jobPosting.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.jobPosting.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/recruitment/jobs?isRemote=true')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.jobPosting.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isRemote: true,
          }),
        })
      );
    });

    it('should order by createdAt descending', async () => {
      (mockPrisma.jobPosting.findMany as jest.Mock).mockResolvedValueOnce(mockJobs);
      (mockPrisma.jobPosting.count as jest.Mock).mockResolvedValueOnce(2);

      await request(app)
        .get('/api/recruitment/jobs')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.jobPosting.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        })
      );
    });

    it('should handle database errors', async () => {
      (mockPrisma.jobPosting.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/recruitment/jobs')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('GET /api/recruitment/jobs/:id', () => {
    const mockJob = {
      id: 'job-1',
      jobCode: 'JOB-2024-0001',
      title: 'Software Engineer',
      status: 'PUBLISHED',
      department: { name: 'Engineering' },
      position: { title: 'Senior Developer' },
      applicants: [
        { id: 'app-1', firstName: 'John', lastName: 'Doe', _count: { interviews: 1, evaluations: 0 } },
      ],
      _count: { applicants: 1, interviews: 1 },
    };

    it('should return single job posting', async () => {
      (mockPrisma.jobPosting.findUnique as jest.Mock).mockResolvedValueOnce(mockJob);

      const response = await request(app)
        .get('/api/recruitment/jobs/job-1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('job-1');
      expect(response.body.data.applicants).toHaveLength(1);
    });

    it('should return 404 for non-existent job', async () => {
      (mockPrisma.jobPosting.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .get('/api/recruitment/jobs/non-existent')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      (mockPrisma.jobPosting.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/recruitment/jobs/job-1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/recruitment/jobs', () => {
    const createPayload = {
      title: 'New Engineer',
      departmentId: '11111111-1111-1111-1111-111111111111',
      description: 'We are looking for an engineer',
      responsibilities: 'Build and maintain systems',
      requirements: '3+ years experience',
      employmentType: 'FULL_TIME',
      location: 'New York, NY',
    };

    it('should create a job posting successfully', async () => {
      (mockPrisma.jobPosting.count as jest.Mock).mockResolvedValueOnce(5);
      (mockPrisma.jobPosting.create as jest.Mock).mockResolvedValueOnce({
        id: 'new-job-123',
        jobCode: 'JOB-2024-0006',
        ...createPayload,
        status: 'DRAFT',
        department: { name: 'Engineering' },
      });

      const response = await request(app)
        .post('/api/recruitment/jobs')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('New Engineer');
    });

    it('should generate sequential job code', async () => {
      (mockPrisma.jobPosting.count as jest.Mock).mockResolvedValueOnce(3);
      (mockPrisma.jobPosting.create as jest.Mock).mockResolvedValueOnce({
        id: 'new-job-123',
        jobCode: 'JOB-2024-0004',
        status: 'DRAFT',
        department: {},
      });

      await request(app)
        .post('/api/recruitment/jobs')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(mockPrisma.jobPosting.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'DRAFT',
          }),
        })
      );
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/recruitment/jobs')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Incomplete' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid employmentType', async () => {
      const response = await request(app)
        .post('/api/recruitment/jobs')
        .set('Authorization', 'Bearer token')
        .send({ ...createPayload, employmentType: 'INVALID' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (mockPrisma.jobPosting.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.jobPosting.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/recruitment/jobs')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('PUT /api/recruitment/jobs/:id', () => {
    it('should update job posting successfully', async () => {
      (mockPrisma.jobPosting.update as jest.Mock).mockResolvedValueOnce({
        id: 'job-1',
        title: 'Updated Title',
        status: 'PUBLISHED',
      });

      const response = await request(app)
        .put('/api/recruitment/jobs/job-1')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Updated Title', status: 'PUBLISHED' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 400 for invalid status', async () => {
      const response = await request(app)
        .put('/api/recruitment/jobs/job-1')
        .set('Authorization', 'Bearer token')
        .send({ status: 'INVALID_STATUS' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (mockPrisma.jobPosting.update as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .put('/api/recruitment/jobs/job-1')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Updated' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('GET /api/recruitment/applicants', () => {
    const mockApplicants = [
      {
        id: 'app-1',
        applicantNumber: 'APP-2024-00001',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        status: 'NEW',
        stage: 'APPLICATION',
        jobPosting: { title: 'Software Engineer', jobCode: 'JOB-2024-0001' },
        _count: { interviews: 0, evaluations: 0 },
      },
    ];

    it('should return list of applicants with pagination', async () => {
      (mockPrisma.applicant.findMany as jest.Mock).mockResolvedValueOnce(mockApplicants);
      (mockPrisma.applicant.count as jest.Mock).mockResolvedValueOnce(1);

      const response = await request(app)
        .get('/api/recruitment/applicants')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.meta).toMatchObject({
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      });
    });

    it('should filter by jobPostingId', async () => {
      (mockPrisma.applicant.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.applicant.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/recruitment/applicants?jobPostingId=job-1')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.applicant.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            jobPostingId: 'job-1',
          }),
        })
      );
    });

    it('should filter by status', async () => {
      (mockPrisma.applicant.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.applicant.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/recruitment/applicants?status=SCREENING')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.applicant.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'SCREENING',
          }),
        })
      );
    });

    it('should filter by stage', async () => {
      (mockPrisma.applicant.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.applicant.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/recruitment/applicants?stage=PHONE_INTERVIEW')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.applicant.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            stage: 'PHONE_INTERVIEW',
          }),
        })
      );
    });

    it('should handle database errors', async () => {
      (mockPrisma.applicant.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/recruitment/applicants')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('GET /api/recruitment/applicants/:id', () => {
    const mockApplicant = {
      id: 'app-1',
      applicantNumber: 'APP-2024-00001',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      jobPosting: { title: 'Software Engineer' },
      interviews: [],
      evaluations: [],
    };

    it('should return single applicant', async () => {
      (mockPrisma.applicant.findUnique as jest.Mock).mockResolvedValueOnce(mockApplicant);

      const response = await request(app)
        .get('/api/recruitment/applicants/app-1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('app-1');
    });

    it('should return 404 for non-existent applicant', async () => {
      (mockPrisma.applicant.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .get('/api/recruitment/applicants/non-existent')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      (mockPrisma.applicant.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/recruitment/applicants/app-1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/recruitment/applicants', () => {
    const createPayload = {
      jobPostingId: '11111111-1111-1111-1111-111111111111',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      source: 'LINKEDIN',
    };

    it('should create an applicant successfully', async () => {
      (mockPrisma.applicant.count as jest.Mock).mockResolvedValueOnce(3);
      (mockPrisma.applicant.create as jest.Mock).mockResolvedValueOnce({
        id: 'new-app-123',
        applicantNumber: 'APP-2024-00004',
        ...createPayload,
        status: 'NEW',
        stage: 'APPLICATION',
        jobPosting: { title: 'Software Engineer' },
      });

      const response = await request(app)
        .post('/api/recruitment/applicants')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.firstName).toBe('Jane');
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/recruitment/applicants')
        .set('Authorization', 'Bearer token')
        .send({ firstName: 'Incomplete' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid email', async () => {
      const response = await request(app)
        .post('/api/recruitment/applicants')
        .set('Authorization', 'Bearer token')
        .send({ ...createPayload, email: 'not-an-email' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid source', async () => {
      const response = await request(app)
        .post('/api/recruitment/applicants')
        .set('Authorization', 'Bearer token')
        .send({ ...createPayload, source: 'INVALID' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (mockPrisma.applicant.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.applicant.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/recruitment/applicants')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('PUT /api/recruitment/applicants/:id/status', () => {
    it('should update applicant status successfully', async () => {
      (mockPrisma.applicant.update as jest.Mock).mockResolvedValueOnce({
        id: 'app-1',
        status: 'SHORTLISTED',
        stage: 'SCREENING',
      });

      const response = await request(app)
        .put('/api/recruitment/applicants/app-1/status')
        .set('Authorization', 'Bearer token')
        .send({ status: 'SHORTLISTED', stage: 'SCREENING' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 400 for invalid status', async () => {
      const response = await request(app)
        .put('/api/recruitment/applicants/app-1/status')
        .set('Authorization', 'Bearer token')
        .send({ status: 'INVALID_STATUS' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (mockPrisma.applicant.update as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .put('/api/recruitment/applicants/app-1/status')
        .set('Authorization', 'Bearer token')
        .send({ status: 'SCREENING' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/recruitment/interviews', () => {
    const createPayload = {
      applicantId: '11111111-1111-1111-1111-111111111111',
      jobPostingId: '22222222-2222-2222-2222-222222222222',
      interviewType: 'TECHNICAL',
      scheduledAt: '2024-03-15T10:00:00Z',
      interviewerIds: ['interviewer-1'],
      organizerId: 'organizer-1',
    };

    it('should schedule an interview successfully', async () => {
      (mockPrisma.interview.create as jest.Mock).mockResolvedValueOnce({
        id: 'int-1',
        ...createPayload,
        status: 'SCHEDULED',
        applicant: { firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
        jobPosting: { title: 'Software Engineer' },
      });

      const response = await request(app)
        .post('/api/recruitment/interviews')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/recruitment/interviews')
        .set('Authorization', 'Bearer token')
        .send({ applicantId: '11111111-1111-1111-1111-111111111111' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid interviewType', async () => {
      const response = await request(app)
        .post('/api/recruitment/interviews')
        .set('Authorization', 'Bearer token')
        .send({ ...createPayload, interviewType: 'INVALID' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (mockPrisma.interview.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/recruitment/interviews')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('PUT /api/recruitment/interviews/:id', () => {
    it('should update interview successfully', async () => {
      (mockPrisma.interview.update as jest.Mock).mockResolvedValueOnce({
        id: 'int-1',
        status: 'COMPLETED',
        notes: 'Great candidate',
      });

      const response = await request(app)
        .put('/api/recruitment/interviews/int-1')
        .set('Authorization', 'Bearer token')
        .send({ status: 'COMPLETED', notes: 'Great candidate' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 400 for invalid status', async () => {
      const response = await request(app)
        .put('/api/recruitment/interviews/int-1')
        .set('Authorization', 'Bearer token')
        .send({ status: 'INVALID_STATUS' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (mockPrisma.interview.update as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .put('/api/recruitment/interviews/int-1')
        .set('Authorization', 'Bearer token')
        .send({ status: 'COMPLETED' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/recruitment/interviews/:id/evaluate', () => {
    const evalPayload = {
      evaluatorId: 'eval-1',
      overallRating: 4,
      recommendation: 'HIRE',
    };

    it('should submit evaluation successfully', async () => {
      (mockPrisma.interview.findUnique as jest.Mock).mockResolvedValueOnce({
        applicantId: 'app-1',
      });
      (mockPrisma.interviewEvaluation.create as jest.Mock).mockResolvedValueOnce({
        id: 'eval-1',
        interviewId: 'int-1',
        applicantId: 'app-1',
        ...evalPayload,
      });

      const response = await request(app)
        .post('/api/recruitment/interviews/int-1/evaluate')
        .set('Authorization', 'Bearer token')
        .send(evalPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should return 404 for non-existent interview', async () => {
      (mockPrisma.interview.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .post('/api/recruitment/interviews/non-existent/evaluate')
        .set('Authorization', 'Bearer token')
        .send(evalPayload);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/recruitment/interviews/int-1/evaluate')
        .set('Authorization', 'Bearer token')
        .send({ evaluatorId: 'eval-1' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid recommendation', async () => {
      const response = await request(app)
        .post('/api/recruitment/interviews/int-1/evaluate')
        .set('Authorization', 'Bearer token')
        .send({ ...evalPayload, recommendation: 'INVALID' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (mockPrisma.interview.findUnique as jest.Mock).mockResolvedValueOnce({ applicantId: 'app-1' });
      (mockPrisma.interviewEvaluation.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/recruitment/interviews/int-1/evaluate')
        .set('Authorization', 'Bearer token')
        .send(evalPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('GET /api/recruitment/stats', () => {
    it('should return recruitment statistics', async () => {
      (mockPrisma.jobPosting.count as jest.Mock).mockResolvedValueOnce(5);
      (mockPrisma.applicant.count as jest.Mock)
        .mockResolvedValueOnce(100) // totalApplications
        .mockResolvedValueOnce(3); // hiredThisMonth
      (mockPrisma.applicant.groupBy as jest.Mock)
        .mockResolvedValueOnce([ // byStatus
          { status: 'NEW', _count: { id: 20 } },
          { status: 'HIRED', _count: { id: 10 } },
        ])
        .mockResolvedValueOnce([ // bySource
          { source: 'LINKEDIN', _count: { id: 50 } },
        ])
        .mockResolvedValueOnce([ // byStage
          { stage: 'APPLICATION', _count: { id: 30 } },
        ])
        .mockResolvedValueOnce([ // topPositionsRaw
          { jobPostingId: 'job-1', _count: { id: 20 } },
        ]);
      (mockPrisma.jobPosting.findUnique as jest.Mock).mockResolvedValueOnce({
        title: 'Software Engineer',
        jobCode: 'JOB-2024-0001',
      });
      (mockPrisma.applicant.findMany as jest.Mock).mockResolvedValueOnce([
        { createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-15') },
      ]);

      const response = await request(app)
        .get('/api/recruitment/stats')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('openPositions');
      expect(response.body.data).toHaveProperty('totalApplications');
      expect(response.body.data).toHaveProperty('conversionRate');
      expect(response.body.data).toHaveProperty('avgTimeToHire');
    });

    it('should handle database errors', async () => {
      (mockPrisma.jobPosting.count as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/recruitment/stats')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});
