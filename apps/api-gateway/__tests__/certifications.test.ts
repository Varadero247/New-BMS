import express from 'express';
import request from 'supertest';

const mockAuthenticate = jest.fn((req: any, _res: any, next: any) => {
  req.user = { id: 'user-1', email: 'admin@ims.local', role: 'ADMIN', orgId: 'org-1' };
  next();
});

const mockRequireRole = jest.fn((...roles: string[]) => {
  return (req: any, res: any, next: any) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN' } });
    }
    next();
  };
});

jest.mock('@ims/auth', () => ({
  authenticate: (...args: any[]) => mockAuthenticate(...args),
  requireRole: (...args: any[]) => mockRequireRole(...args),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

const mockListCertificates = jest.fn().mockReturnValue([]);
const mockGetCertificate = jest.fn().mockReturnValue({
  id: 'cert-1', standard: 'ISO 9001:2015', scope: 'Manufacturing',
  certificationBody: 'BSI', certificateNumber: 'FS-123456', status: 'ACTIVE',
  issueDate: new Date('2024-01-15'), expiryDate: new Date('2027-01-14'),
});
const mockCreateCertificate = jest.fn().mockReturnValue({
  id: 'cert-1', standard: 'ISO 9001:2015', scope: 'Manufacturing', certificationBody: 'BSI',
  certificateNumber: 'FS-123456', status: 'ACTIVE',
  issueDate: new Date('2024-01-15'), expiryDate: new Date('2027-01-14'),
});
const mockUpdateCertificate = jest.fn().mockReturnValue({
  id: 'cert-1', status: 'IN_RENEWAL',
  issueDate: new Date('2024-01-15'), expiryDate: new Date('2027-01-14'),
});
const mockDeleteCertificate = jest.fn().mockReturnValue(true);
const mockCalculateReadinessScore = jest.fn().mockReturnValue({
  score: 85, maxScore: 100, grade: 'B', blockers: [], lastCalculatedAt: new Date(),
});

jest.mock('@ims/readiness', () => ({
  listCertificates: (...args: any[]) => mockListCertificates(...args),
  getCertificate: (...args: any[]) => mockGetCertificate(...args),
  createCertificate: (...args: any[]) => mockCreateCertificate(...args),
  updateCertificate: (...args: any[]) => mockUpdateCertificate(...args),
  deleteCertificate: (...args: any[]) => mockDeleteCertificate(...args),
  calculateReadinessScore: (...args: any[]) => mockCalculateReadinessScore(...args),
}));

import certificationsRouter from '../src/routes/certifications';

describe('Certifications Routes', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/admin/certifications', certificationsRouter);
    jest.clearAllMocks();
  });

  describe('GET /api/admin/certifications', () => {
    it('lists certificates with readiness scores', async () => {
      mockListCertificates.mockReturnValue([
        {
          id: 'cert-1', standard: 'ISO 9001:2015', status: 'ACTIVE',
          issueDate: new Date('2024-01-15'), expiryDate: new Date('2027-01-14'),
        },
      ]);
      const res = await request(app).get('/api/admin/certifications');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/admin/certifications', () => {
    it('creates a certificate', async () => {
      const res = await request(app)
        .post('/api/admin/certifications')
        .send({
          standard: 'ISO 9001:2015',
          scope: 'Manufacturing of widgets',
          certificationBody: 'BSI',
          certificateNumber: 'FS-123456',
          issueDate: '2024-01-15',
          expiryDate: '2027-01-14',
        });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('rejects missing required fields', async () => {
      const res = await request(app)
        .post('/api/admin/certifications')
        .send({ standard: 'ISO 9001:2015' });
      expect(res.status).toBe(400);
    });
  });

  describe('PUT /api/admin/certifications/:id', () => {
    it('updates a certificate', async () => {
      const res = await request(app)
        .put('/api/admin/certifications/cert-1')
        .send({ status: 'IN_RENEWAL' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('DELETE /api/admin/certifications/:id', () => {
    it('deletes a certificate', async () => {
      const res = await request(app).delete('/api/admin/certifications/cert-1');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/admin/certifications/:id/readiness', () => {
    it('returns readiness score', async () => {
      const res = await request(app).get('/api/admin/certifications/cert-1/readiness');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('readiness');
    });
  });

  describe('Auth enforcement', () => {
    it('requires ADMIN role', async () => {
      mockAuthenticate.mockImplementationOnce((req: any, _res: any, next: any) => {
        req.user = { id: 'u2', email: 'user@ims.local', role: 'USER', orgId: 'org-1' };
        next();
      });
      const res = await request(app).get('/api/admin/certifications');
      expect(res.status).toBe(403);
    });
  });
});
