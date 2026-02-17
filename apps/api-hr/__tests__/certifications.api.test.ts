import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    employeeCertification: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    employee: {
      findUnique: jest.fn(),
    },
  },
  Prisma: {},
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((_req: any, _res: any, next: any) => {
    _req.user = { id: '00000000-0000-4000-a000-000000000099', orgId: '00000000-0000-4000-a000-000000000100', role: 'ADMIN' };
    next();
  }),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  }),
}));

jest.mock('@ims/shared', () => ({
  validateIdParam: () => (_req: any, _res: any, next: any) => next(),
}));

import { prisma } from '../src/prisma';
import router from '../src/routes/certifications';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/certifications', router);

const CERT_ID = '00000000-0000-4000-a000-000000000001';
const EMP_ID = '00000000-0000-4000-a000-000000000002';

const mockCert = {
  id: CERT_ID,
  employeeId: EMP_ID,
  name: 'ISO 9001 Lead Auditor',
  issuingOrganization: 'BSI Group',
  credentialId: 'BSI-2026-001',
  issueDate: new Date('2025-01-01'),
  expiryDate: new Date('2027-01-01'),
  doesNotExpire: false,
  renewalRequired: true,
  status: 'ACTIVE',
  employee: { id: EMP_ID, employeeNumber: 'EMP-001', firstName: 'John', lastName: 'Doe', jobTitle: 'Engineer' },
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/certifications', () => {
  it('returns list of certifications with meta', async () => {
    (mockPrisma.employeeCertification.findMany as jest.Mock).mockResolvedValue([mockCert]);
    (mockPrisma.employeeCertification.count as jest.Mock).mockResolvedValue(1);

    const res = await request(app).get('/api/certifications');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.meta.total).toBe(1);
  });

  it('returns 500 on DB error', async () => {
    (mockPrisma.employeeCertification.findMany as jest.Mock).mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/certifications');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('GET /api/certifications/expiring-soon', () => {
  it('returns expiring certifications', async () => {
    (mockPrisma.employeeCertification.findMany as jest.Mock).mockResolvedValue([mockCert]);

    const res = await request(app).get('/api/certifications/expiring-soon');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('returns 500 on DB error', async () => {
    (mockPrisma.employeeCertification.findMany as jest.Mock).mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/api/certifications/expiring-soon');
    expect(res.status).toBe(500);
  });
});

describe('GET /api/certifications/stats', () => {
  it('returns statistics', async () => {
    (mockPrisma.employeeCertification.count as jest.Mock).mockResolvedValue(10);

    const res = await request(app).get('/api/certifications/stats');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('total');
  });

  it('returns 500 on DB error', async () => {
    (mockPrisma.employeeCertification.count as jest.Mock).mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/api/certifications/stats');
    expect(res.status).toBe(500);
  });
});

describe('GET /api/certifications/:id', () => {
  it('returns a single certification', async () => {
    (mockPrisma.employeeCertification.findUnique as jest.Mock).mockResolvedValue(mockCert);

    const res = await request(app).get(`/api/certifications/${CERT_ID}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(CERT_ID);
  });

  it('returns 404 when certification not found', async () => {
    (mockPrisma.employeeCertification.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get(`/api/certifications/${CERT_ID}`);
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('returns 500 on DB error', async () => {
    (mockPrisma.employeeCertification.findUnique as jest.Mock).mockRejectedValue(new Error('fail'));
    const res = await request(app).get(`/api/certifications/${CERT_ID}`);
    expect(res.status).toBe(500);
  });
});

describe('POST /api/certifications', () => {
  const validBody = {
    employeeId: EMP_ID,
    name: 'ISO 9001 Lead Auditor',
    issuingOrganization: 'BSI Group',
    issueDate: '2025-01-01',
  };

  it('creates a certification successfully', async () => {
    (mockPrisma.employee.findUnique as jest.Mock).mockResolvedValue({ id: EMP_ID });
    (mockPrisma.employeeCertification.create as jest.Mock).mockResolvedValue(mockCert);

    const res = await request(app).post('/api/certifications').send(validBody);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('returns 400 if employee not found', async () => {
    (mockPrisma.employee.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app).post('/api/certifications').send(validBody);
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('returns 400 on validation error (missing name)', async () => {
    const res = await request(app).post('/api/certifications').send({ employeeId: EMP_ID, issuingOrganization: 'BSI', issueDate: '2025-01-01' });
    expect(res.status).toBe(400);
  });

  it('returns 500 on DB error', async () => {
    (mockPrisma.employee.findUnique as jest.Mock).mockResolvedValue({ id: EMP_ID });
    (mockPrisma.employeeCertification.create as jest.Mock).mockRejectedValue(new Error('fail'));

    const res = await request(app).post('/api/certifications').send(validBody);
    expect(res.status).toBe(500);
  });
});

describe('PUT /api/certifications/:id', () => {
  it('updates certification successfully', async () => {
    (mockPrisma.employeeCertification.findUnique as jest.Mock).mockResolvedValue(mockCert);
    (mockPrisma.employeeCertification.update as jest.Mock).mockResolvedValue({ ...mockCert, status: 'PENDING_RENEWAL' });

    const res = await request(app).put(`/api/certifications/${CERT_ID}`).send({ status: 'PENDING_RENEWAL' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns 404 when not found', async () => {
    (mockPrisma.employeeCertification.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app).put(`/api/certifications/${CERT_ID}`).send({ status: 'ACTIVE' });
    expect(res.status).toBe(404);
  });

  it('returns 500 on DB error', async () => {
    (mockPrisma.employeeCertification.findUnique as jest.Mock).mockResolvedValue(mockCert);
    (mockPrisma.employeeCertification.update as jest.Mock).mockRejectedValue(new Error('fail'));

    const res = await request(app).put(`/api/certifications/${CERT_ID}`).send({ status: 'ACTIVE' });
    expect(res.status).toBe(500);
  });
});

describe('DELETE /api/certifications/:id', () => {
  it('deletes certification successfully', async () => {
    (mockPrisma.employeeCertification.findUnique as jest.Mock).mockResolvedValue(mockCert);
    (mockPrisma.employeeCertification.delete as jest.Mock).mockResolvedValue(mockCert);

    const res = await request(app).delete(`/api/certifications/${CERT_ID}`);
    expect(res.status).toBe(204);
  });

  it('returns 404 when not found', async () => {
    (mockPrisma.employeeCertification.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app).delete(`/api/certifications/${CERT_ID}`);
    expect(res.status).toBe(404);
  });

  it('returns 500 on DB error', async () => {
    (mockPrisma.employeeCertification.findUnique as jest.Mock).mockResolvedValue(mockCert);
    (mockPrisma.employeeCertification.delete as jest.Mock).mockRejectedValue(new Error('fail'));

    const res = await request(app).delete(`/api/certifications/${CERT_ID}`);
    expect(res.status).toBe(500);
  });
});
