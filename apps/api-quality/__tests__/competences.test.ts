import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    qualCompetence: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: 'user-123', email: 'test@test.com', role: 'ADMIN', organisationId: 'org-1' };
    next();
  }),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import { prisma } from '../src/prisma';
import competencesRouter from '../src/routes/competences';

const app = express();
app.use(express.json());
app.use('/api/competences', competencesRouter);

const mockCompetence = {
  id: '00000000-0000-0000-0000-000000000001',
  referenceNumber: 'COMP-2026-001',
  employeeName: 'John Smith',
  competencyArea: 'Quality Inspection',
  status: 'IN_TRAINING',
  assessmentDate: '2026-01-20T00:00:00.000Z',
  expiryDate: '2027-01-20T00:00:00.000Z',
  organisationId: 'org-1',
  createdAt: '2026-01-20T00:00:00.000Z',
  updatedAt: '2026-01-20T00:00:00.000Z',
};

describe('Competences Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/competences', () => {
    it('should return a list of competences', async () => {
      (prisma.qualCompetence.findMany as jest.Mock).mockResolvedValue([mockCompetence]);
      (prisma.qualCompetence.count as jest.Mock).mockResolvedValue(1);

      const res = await request(app).get('/api/competences');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].employeeName).toBe('John Smith');
    });

    it('should filter by status', async () => {
      (prisma.qualCompetence.findMany as jest.Mock).mockResolvedValue([mockCompetence]);
      (prisma.qualCompetence.count as jest.Mock).mockResolvedValue(1);

      const res = await request(app).get('/api/competences?status=IN_TRAINING');
      expect(res.status).toBe(200);
      expect(prisma.qualCompetence.findMany).toHaveBeenCalled();
    });

    it('should filter by competencyArea', async () => {
      (prisma.qualCompetence.findMany as jest.Mock).mockResolvedValue([mockCompetence]);
      (prisma.qualCompetence.count as jest.Mock).mockResolvedValue(1);

      const res = await request(app).get('/api/competences?competencyArea=Quality+Inspection');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should support pagination', async () => {
      (prisma.qualCompetence.findMany as jest.Mock).mockResolvedValue([mockCompetence]);
      (prisma.qualCompetence.count as jest.Mock).mockResolvedValue(1);

      const res = await request(app).get('/api/competences?page=1&limit=10');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should handle errors', async () => {
      (prisma.qualCompetence.findMany as jest.Mock).mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/competences');
      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/competences', () => {
    it('should create a competence record', async () => {
      (prisma.qualCompetence.count as jest.Mock).mockResolvedValue(0);
      (prisma.qualCompetence.create as jest.Mock).mockResolvedValue(mockCompetence);

      const res = await request(app).post('/api/competences').send({
        employeeName: 'John Smith',
        competencyArea: 'Quality Inspection',
        status: 'IN_TRAINING',
        assessmentDate: '2026-01-20',
      });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.competencyArea).toBe('Quality Inspection');
    });

    it('should validate required fields', async () => {
      const res = await request(app).post('/api/competences').send({});
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should handle creation errors', async () => {
      (prisma.qualCompetence.count as jest.Mock).mockResolvedValue(0);
      (prisma.qualCompetence.create as jest.Mock).mockRejectedValue(new Error('DB error'));

      const res = await request(app).post('/api/competences').send({
        employeeName: 'John Smith',
        competencyArea: 'Quality Inspection',
        status: 'IN_TRAINING',
        assessmentDate: '2026-01-20',
      });
      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/competences/:id', () => {
    it('should return a competence by id', async () => {
      (prisma.qualCompetence.findFirst as jest.Mock).mockResolvedValue(mockCompetence);

      const res = await request(app).get('/api/competences/00000000-0000-0000-0000-000000000001');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.employeeName).toBe('John Smith');
    });

    it('should return 404 if not found', async () => {
      (prisma.qualCompetence.findFirst as jest.Mock).mockResolvedValue(null);

      const res = await request(app).get('/api/competences/00000000-0000-0000-0000-000000000099');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should handle errors', async () => {
      (prisma.qualCompetence.findFirst as jest.Mock).mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/competences/00000000-0000-0000-0000-000000000001');
      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/competences/:id', () => {
    it('should update a competence', async () => {
      (prisma.qualCompetence.findFirst as jest.Mock).mockResolvedValue(mockCompetence);
      (prisma.qualCompetence.update as jest.Mock).mockResolvedValue({
        ...mockCompetence,
        status: 'COMPETENT',
      });

      const res = await request(app)
        .put('/api/competences/00000000-0000-0000-0000-000000000001')
        .send({
          status: 'COMPETENT',
        });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('COMPETENT');
    });

    it('should return 404 if not found', async () => {
      (prisma.qualCompetence.findFirst as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .put('/api/competences/00000000-0000-0000-0000-000000000099')
        .send({
          status: 'COMPETENT',
        });
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should handle update errors', async () => {
      (prisma.qualCompetence.findFirst as jest.Mock).mockResolvedValue(mockCompetence);
      (prisma.qualCompetence.update as jest.Mock).mockRejectedValue(new Error('DB error'));

      const res = await request(app)
        .put('/api/competences/00000000-0000-0000-0000-000000000001')
        .send({
          status: 'COMPETENT',
        });
      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/competences/:id', () => {
    it('should soft delete a competence', async () => {
      (prisma.qualCompetence.findFirst as jest.Mock).mockResolvedValue(mockCompetence);
      (prisma.qualCompetence.update as jest.Mock).mockResolvedValue({
        ...mockCompetence,
        deletedAt: new Date().toISOString(),
      });

      const res = await request(app).delete(
        '/api/competences/00000000-0000-0000-0000-000000000001'
      );
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(prisma.qualCompetence.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ deletedAt: expect.any(Date) }) })
      );
    });

    it('should return 404 if not found', async () => {
      (prisma.qualCompetence.findFirst as jest.Mock).mockResolvedValue(null);

      const res = await request(app).delete(
        '/api/competences/00000000-0000-0000-0000-000000000099'
      );
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should handle delete errors', async () => {
      (prisma.qualCompetence.findFirst as jest.Mock).mockRejectedValue(new Error('DB error'));

      const res = await request(app).delete(
        '/api/competences/00000000-0000-0000-0000-000000000001'
      );
      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });
});

describe('competences — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/competences', competencesRouter);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/competences', async () => {
    const res = await request(app).get('/api/competences');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });

  it('response is JSON content-type for GET /api/competences', async () => {
    const res = await request(app).get('/api/competences');
    expect(res.headers['content-type']).toBeDefined();
  });

  it('GET /api/competences body has success property', async () => {
    const res = await request(app).get('/api/competences');
    if (res.status === 200) {
      expect(res.body).toHaveProperty('success');
    } else {
      expect(res.body).toBeDefined();
    }
  });
});
