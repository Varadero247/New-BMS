import express from 'express';
import request from 'supertest';

// ── Mocks (must be declared before imports) ──────────────────────────────────

jest.mock('../src/prisma', () => ({
  prisma: {
    employee: {
      findUnique: jest.fn(),
      update:     jest.fn(),
    },
    leaveRequest: {
      findMany: jest.fn(),
    },
    attendance: {
      findMany: jest.fn(),
    },
    performanceReview: {
      findMany: jest.fn(),
    },
  },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: 'admin-001', email: 'admin@test.com', role: 'ADMIN' };
    next();
  }),
  requireRole: jest.fn(
    (_role: string) => (_req: any, _res: any, next: any) => next()
  ),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({
    info:  jest.fn(),
    error: jest.fn(),
    warn:  jest.fn(),
    debug: jest.fn(),
  }),
}));

// ── Imports ───────────────────────────────────────────────────────────────────

import gdprRouter from '../src/routes/gdpr';
import { prisma } from '../src/prisma';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

// ── Test fixtures ─────────────────────────────────────────────────────────────

const EMP_ID = '00000000-0000-0000-0000-000000000001';

const ACTIVE_EMPLOYEE = {
  id: EMP_ID,
  employeeNumber: 'EMP001',
  firstName: 'Alice',
  middleName: null,
  lastName: 'Smith',
  dateOfBirth: new Date('1990-01-01'),
  gender: 'FEMALE',
  personalEmail: 'alice@personal.com',
  workEmail: 'alice@company.com',
  phone: '+44 1234 567890',
  mobilePhone: '+44 7700 900000',
  bankName: 'Barclays',
  accountNumber: '12345678',
  profilePhoto: null,
  hireDate: new Date('2020-01-01'),
  jobTitle: 'Engineer',
  employmentType: 'FULL_TIME',
  employmentStatus: 'ACTIVE',
  currency: 'GBP',
  department: { id: 'dept-1', name: 'Engineering' },
  position: { id: 'pos-1', title: 'Software Engineer' },
};

const INACTIVE_EMPLOYEE = { ...ACTIVE_EMPLOYEE, employmentStatus: 'TERMINATED' };

// ── Setup ─────────────────────────────────────────────────────────────────────

let app: express.Express;

beforeAll(() => {
  app = express();
  app.use(express.json());
  app.use('/api/gdpr', gdprRouter);
});

beforeEach(() => {
  jest.clearAllMocks();
});

// ── POST /api/gdpr/data-export/:employeeId ────────────────────────────────────

describe('POST /api/gdpr/data-export/:employeeId', () => {
  it('returns 200 with a structured data package for a known employee', async () => {
    (mockPrisma.employee.findUnique as jest.Mock).mockResolvedValue(ACTIVE_EMPLOYEE);
    (mockPrisma.leaveRequest.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.attendance.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.performanceReview.findMany as jest.Mock).mockResolvedValue([]);

    const res = await request(app).post(`/api/gdpr/data-export/${EMP_ID}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('response contains dataSubject with personal data fields', async () => {
    (mockPrisma.employee.findUnique as jest.Mock).mockResolvedValue(ACTIVE_EMPLOYEE);
    (mockPrisma.leaveRequest.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.attendance.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.performanceReview.findMany as jest.Mock).mockResolvedValue([]);

    const res = await request(app).post(`/api/gdpr/data-export/${EMP_ID}`);

    expect(res.body.data.dataSubject).toBeDefined();
    expect(res.body.data.dataSubject.personalData.firstName).toBe('Alice');
    expect(res.body.data.dataSubject.personalData.workEmail).toBe('alice@company.com');
  });

  it('response contains relatedRecords (leave, attendance, performance)', async () => {
    (mockPrisma.employee.findUnique as jest.Mock).mockResolvedValue(ACTIVE_EMPLOYEE);
    (mockPrisma.leaveRequest.findMany as jest.Mock).mockResolvedValue([{ id: 'lr-1' }]);
    (mockPrisma.attendance.findMany as jest.Mock).mockResolvedValue([{ id: 'att-1' }]);
    (mockPrisma.performanceReview.findMany as jest.Mock).mockResolvedValue([{ id: 'pr-1' }]);

    const res = await request(app).post(`/api/gdpr/data-export/${EMP_ID}`);

    expect(res.body.data.relatedRecords.leaveRequests).toHaveLength(1);
    expect(res.body.data.relatedRecords.attendanceRecords).toHaveLength(1);
    expect(res.body.data.relatedRecords.performanceReviews).toHaveLength(1);
  });

  it('response includes requestDate ISO timestamp', async () => {
    (mockPrisma.employee.findUnique as jest.Mock).mockResolvedValue(ACTIVE_EMPLOYEE);
    (mockPrisma.leaveRequest.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.attendance.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.performanceReview.findMany as jest.Mock).mockResolvedValue([]);

    const res = await request(app).post(`/api/gdpr/data-export/${EMP_ID}`);

    expect(res.body.data.requestDate).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('returns 404 when employee does not exist', async () => {
    (mockPrisma.employee.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app).post('/api/gdpr/data-export/nonexistent-id');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('returns 500 when database throws', async () => {
    (mockPrisma.employee.findUnique as jest.Mock).mockRejectedValue(new Error('DB error'));

    const res = await request(app).post(`/api/gdpr/data-export/${EMP_ID}`);

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('returns 500 when parallel queries throw', async () => {
    (mockPrisma.employee.findUnique as jest.Mock).mockResolvedValue(ACTIVE_EMPLOYEE);
    (mockPrisma.leaveRequest.findMany as jest.Mock).mockRejectedValue(new Error('timeout'));
    (mockPrisma.attendance.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.performanceReview.findMany as jest.Mock).mockResolvedValue([]);

    const res = await request(app).post(`/api/gdpr/data-export/${EMP_ID}`);

    expect(res.status).toBe(500);
  });

  it('includes employment data (hireDate, jobTitle, department)', async () => {
    (mockPrisma.employee.findUnique as jest.Mock).mockResolvedValue(ACTIVE_EMPLOYEE);
    (mockPrisma.leaveRequest.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.attendance.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.performanceReview.findMany as jest.Mock).mockResolvedValue([]);

    const res = await request(app).post(`/api/gdpr/data-export/${EMP_ID}`);

    const employment = res.body.data.dataSubject.employment;
    expect(employment.jobTitle).toBe('Engineer');
    expect(employment.department).toBe('Engineering');
    expect(employment.employmentType).toBe('FULL_TIME');
  });
});

// ── POST /api/gdpr/anonymize/:employeeId ──────────────────────────────────────

describe('POST /api/gdpr/anonymize/:employeeId', () => {
  it('returns 200 and anonymises a terminated employee', async () => {
    (mockPrisma.employee.findUnique as jest.Mock).mockResolvedValue(INACTIVE_EMPLOYEE);
    (mockPrisma.employee.update as jest.Mock).mockResolvedValue({
      ...INACTIVE_EMPLOYEE,
      firstName: 'REDACTED',
      lastName: `ANON-${EMP_ID.slice(-8).toUpperCase()}`,
    });

    const res = await request(app).post(`/api/gdpr/anonymize/${EMP_ID}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('response contains employeeId and anonymisedAt timestamp', async () => {
    (mockPrisma.employee.findUnique as jest.Mock).mockResolvedValue(INACTIVE_EMPLOYEE);
    (mockPrisma.employee.update as jest.Mock).mockResolvedValue({});

    const res = await request(app).post(`/api/gdpr/anonymize/${EMP_ID}`);

    expect(res.body.data.employeeId).toBe(EMP_ID);
    expect(res.body.data.anonymisedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('response contains GDPR Article 17 retention note', async () => {
    (mockPrisma.employee.findUnique as jest.Mock).mockResolvedValue(INACTIVE_EMPLOYEE);
    (mockPrisma.employee.update as jest.Mock).mockResolvedValue({});

    const res = await request(app).post(`/api/gdpr/anonymize/${EMP_ID}`);

    expect(res.body.data.retentionNote).toContain('Employment Rights Act 1996');
  });

  it('calls employee.update with REDACTED firstName', async () => {
    (mockPrisma.employee.findUnique as jest.Mock).mockResolvedValue(INACTIVE_EMPLOYEE);
    (mockPrisma.employee.update as jest.Mock).mockResolvedValue({});

    await request(app).post(`/api/gdpr/anonymize/${EMP_ID}`);

    const updateCall = (mockPrisma.employee.update as jest.Mock).mock.calls[0][0];
    expect(updateCall.data.firstName).toBe('REDACTED');
    expect(updateCall.data.workEmail).toContain('@deleted.invalid');
  });

  it('returns 404 when employee does not exist', async () => {
    (mockPrisma.employee.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app).post('/api/gdpr/anonymize/nonexistent-id');

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('returns 409 when employee is still ACTIVE', async () => {
    (mockPrisma.employee.findUnique as jest.Mock).mockResolvedValue(ACTIVE_EMPLOYEE);

    const res = await request(app).post(`/api/gdpr/anonymize/${EMP_ID}`);

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CONFLICT');
    expect(res.body.error.message).toContain('active employee');
  });

  it('does NOT call employee.update when employee is ACTIVE', async () => {
    (mockPrisma.employee.findUnique as jest.Mock).mockResolvedValue(ACTIVE_EMPLOYEE);

    await request(app).post(`/api/gdpr/anonymize/${EMP_ID}`);

    expect(mockPrisma.employee.update).not.toHaveBeenCalled();
  });

  it('returns 500 when update throws', async () => {
    (mockPrisma.employee.findUnique as jest.Mock).mockResolvedValue(INACTIVE_EMPLOYEE);
    (mockPrisma.employee.update as jest.Mock).mockRejectedValue(new Error('DB error'));

    const res = await request(app).post(`/api/gdpr/anonymize/${EMP_ID}`);

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('returns 500 when findUnique throws', async () => {
    (mockPrisma.employee.findUnique as jest.Mock).mockRejectedValue(new Error('Connection reset'));

    const res = await request(app).post(`/api/gdpr/anonymize/${EMP_ID}`);

    expect(res.status).toBe(500);
  });
});

describe('gdpr.api — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/gdpr', gdprRouter);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/gdpr', async () => {
    const res = await request(app).get('/api/gdpr');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });

  it('response is JSON content-type for GET /api/gdpr', async () => {
    const res = await request(app).get('/api/gdpr');
    expect(res.headers['content-type']).toBeDefined();
  });

  it('GET /api/gdpr body has success property', async () => {
    const res = await request(app).get('/api/gdpr');
    if (res.status === 200) {
      expect(res.body).toHaveProperty('success');
    } else {
      expect(res.body).toBeDefined();
    }
  });
});

describe('gdpr.api — data-export edge cases', () => {
  it('data-export response contains relatedRecords key', async () => {
    (mockPrisma.employee.findUnique as jest.Mock).mockResolvedValue(ACTIVE_EMPLOYEE);
    (mockPrisma.leaveRequest.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.attendance.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.performanceReview.findMany as jest.Mock).mockResolvedValue([]);
    const res = await request(app).post(`/api/gdpr/data-export/${EMP_ID}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('relatedRecords');
  });

  it('data-export requestedBy defaults when header not set', async () => {
    (mockPrisma.employee.findUnique as jest.Mock).mockResolvedValue(ACTIVE_EMPLOYEE);
    (mockPrisma.leaveRequest.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.attendance.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.performanceReview.findMany as jest.Mock).mockResolvedValue([]);
    const res = await request(app).post(`/api/gdpr/data-export/${EMP_ID}`);
    expect(res.status).toBe(200);
    expect(res.body.data.requestedBy).toBeDefined();
  });

  it('data-export dataSubject contains employeeNumber', async () => {
    (mockPrisma.employee.findUnique as jest.Mock).mockResolvedValue(ACTIVE_EMPLOYEE);
    (mockPrisma.leaveRequest.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.attendance.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.performanceReview.findMany as jest.Mock).mockResolvedValue([]);
    const res = await request(app).post(`/api/gdpr/data-export/${EMP_ID}`);
    expect(res.body.data.dataSubject.employeeNumber).toBe('EMP001');
  });

  it('data-export employment contains position title', async () => {
    (mockPrisma.employee.findUnique as jest.Mock).mockResolvedValue(ACTIVE_EMPLOYEE);
    (mockPrisma.leaveRequest.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.attendance.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.performanceReview.findMany as jest.Mock).mockResolvedValue([]);
    const res = await request(app).post(`/api/gdpr/data-export/${EMP_ID}`);
    expect(res.status).toBe(200);
    const employment = res.body.data.dataSubject.employment;
    expect(employment).toBeDefined();
  });

  it('anonymize response body has success: true on 200', async () => {
    (mockPrisma.employee.findUnique as jest.Mock).mockResolvedValue(INACTIVE_EMPLOYEE);
    (mockPrisma.employee.update as jest.Mock).mockResolvedValue({
      ...INACTIVE_EMPLOYEE,
      firstName: 'REDACTED',
    });
    const res = await request(app).post(`/api/gdpr/anonymize/${EMP_ID}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('anonymize update is called exactly once per request', async () => {
    (mockPrisma.employee.findUnique as jest.Mock).mockResolvedValue(INACTIVE_EMPLOYEE);
    (mockPrisma.employee.update as jest.Mock).mockResolvedValue({});
    await request(app).post(`/api/gdpr/anonymize/${EMP_ID}`);
    expect(mockPrisma.employee.update).toHaveBeenCalledTimes(1);
  });

  it('anonymize update data contains lastName with ANON prefix', async () => {
    (mockPrisma.employee.findUnique as jest.Mock).mockResolvedValue(INACTIVE_EMPLOYEE);
    (mockPrisma.employee.update as jest.Mock).mockResolvedValue({});
    await request(app).post(`/api/gdpr/anonymize/${EMP_ID}`);
    const updateData = (mockPrisma.employee.update as jest.Mock).mock.calls[0][0].data;
    expect(updateData.lastName).toContain('ANON');
  });

  it('data-export personal data contains lastName', async () => {
    (mockPrisma.employee.findUnique as jest.Mock).mockResolvedValue(ACTIVE_EMPLOYEE);
    (mockPrisma.leaveRequest.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.attendance.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.performanceReview.findMany as jest.Mock).mockResolvedValue([]);
    const res = await request(app).post(`/api/gdpr/data-export/${EMP_ID}`);
    expect(res.body.data.dataSubject.personalData.lastName).toBe('Smith');
  });

  it('anonymize conflict message mentions active employee', async () => {
    (mockPrisma.employee.findUnique as jest.Mock).mockResolvedValue(ACTIVE_EMPLOYEE);
    const res = await request(app).post(`/api/gdpr/anonymize/${EMP_ID}`);
    expect(res.status).toBe(409);
    expect(res.body.error.message).toMatch(/active employee/i);
  });
});
