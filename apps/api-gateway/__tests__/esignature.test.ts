// Mock dependencies BEFORE imports
const mockESignature = {
  findUnique: jest.fn(),
  findMany: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  count: jest.fn(),
};

const mockUser = {
  findUnique: jest.fn(),
};

jest.mock('@ims/database', () => ({
  prisma: {
    eSignature: mockESignature,
    user: mockUser,
  },
}));

jest.mock('@ims/auth', () => ({
  authenticate: (req: any, _res: any, next: any) => {
    req.user = {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'admin@ims.local',
      role: 'ADMIN',
    };
    next();
  },
  requireRole: () => (_req: any, _res: any, next: any) => next(),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
  metricsMiddleware: () => (_req: any, _res: any, next: any) => next(),
  metricsHandler: (_req: any, res: any) => res.json({}),
  correlationIdMiddleware: () => (_req: any, _res: any, next: any) => next(),
  createHealthCheck: () => (_req: any, res: any) => res.json({ status: 'ok' }),
}));

jest.mock('@ims/shared', () => ({
  validateIdParam: () => (req: any, _res: any, next: any, value: string) => {
    req.params.id = value;
    next();
  },
  parsePagination: (query: Record<string, any>, opts?: { defaultLimit?: number }) => {
    const defaultLimit = opts?.defaultLimit ?? 20;
    const page = Math.max(1, parseInt(query.page as string, 10) || 1);
    const limit = Math.min(Math.max(1, parseInt(query.limit as string, 10) || defaultLimit), 100);
    const skip = (page - 1) * limit;
    return { page, limit, skip };
  },
}));

jest.mock('@ims/esig', () => ({
  createSignature: jest.fn(),
  verifySignature: jest.fn(),
  isValidMeaning: jest.fn(),
  getValidMeanings: jest.fn(),
}));

import request from 'supertest';
import express from 'express';
import esignatureRouter from '../src/routes/esignature';
import {
  createSignature,
  verifySignature,
  isValidMeaning,
  getValidMeanings,
} from '@ims/esig';

const mockCreateSignature = createSignature as jest.Mock;
const mockVerifySignature = verifySignature as jest.Mock;
const mockIsValidMeaning = isValidMeaning as jest.Mock;
const mockGetValidMeanings = getValidMeanings as jest.Mock;

const app = express();
app.use(express.json());
app.use('/', esignatureRouter);

const SIG_ID = '00000000-0000-0000-0000-000000000010';
const USER_ID = '00000000-0000-0000-0000-000000000001';

const mockSigRecord = {
  id: SIG_ID,
  userId: USER_ID,
  userEmail: 'admin@ims.local',
  userFullName: 'Admin User',
  meaning: 'APPROVED',
  reason: 'Approved for release',
  resourceType: 'document',
  resourceId: '00000000-0000-0000-0000-000000000099',
  resourceRef: 'DOC-2026-001',
  ipAddress: '127.0.0.1',
  userAgent: 'test-agent',
  checksum: 'abc123checksum',
  valid: true,
  createdAt: new Date('2026-02-19T10:00:00Z'),
};

beforeEach(() => {
  jest.clearAllMocks();
  mockGetValidMeanings.mockReturnValue(['APPROVED', 'REVIEWED', 'RELEASED', 'VERIFIED', 'REJECTED', 'WITNESSED', 'AUTHORED', 'ACKNOWLEDGED']);
});

// ─── POST / ────────────────────────────────────────────────────────────────

describe('POST /esignatures', () => {
  const validBody = {
    meaning: 'APPROVED',
    reason: 'Approved for release',
    password: 'correctpassword',
    resourceType: 'document',
    resourceId: '00000000-0000-0000-0000-000000000099',
    resourceRef: 'DOC-2026-001',
  };

  it('creates e-signature successfully', async () => {
    mockIsValidMeaning.mockReturnValue(true);
    mockUser.findUnique.mockResolvedValue({
      id: USER_ID,
      email: 'admin@ims.local',
      fullName: 'Admin User',
      password: '$2b$10$hashedpassword',
    });
    mockCreateSignature.mockResolvedValue({
      signature: {
        id: SIG_ID,
        userId: USER_ID,
        userEmail: 'admin@ims.local',
        userFullName: 'Admin User',
        meaning: 'APPROVED',
        reason: 'Approved for release',
        resourceType: 'document',
        resourceId: '00000000-0000-0000-0000-000000000099',
        resourceRef: 'DOC-2026-001',
        ipAddress: '127.0.0.1',
        userAgent: 'test-agent',
        checksum: 'abc123',
        valid: true,
        timestamp: new Date(),
      },
    });
    mockESignature.create.mockResolvedValue(mockSigRecord);

    const res = await request(app).post('/').send(validBody);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(SIG_ID);
    expect(mockCreateSignature).toHaveBeenCalledOnce;
    expect(mockESignature.create).toHaveBeenCalledOnce;
  });

  it('rejects invalid meaning', async () => {
    mockIsValidMeaning.mockReturnValue(false);

    const res = await request(app).post('/').send({ ...validBody, meaning: 'INVALID_MEANING' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_MEANING');
  });

  it('returns 401 when password re-auth fails', async () => {
    mockIsValidMeaning.mockReturnValue(true);
    mockUser.findUnique.mockResolvedValue({
      id: USER_ID,
      email: 'admin@ims.local',
      password: '$2b$10$hashedpassword',
    });
    mockCreateSignature.mockResolvedValue({ signature: null, error: 'Password re-authentication failed' });

    const res = await request(app).post('/').send({ ...validBody, password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('SIGNATURE_FAILED');
  });

  it('returns 401 when user not found', async () => {
    mockIsValidMeaning.mockReturnValue(true);
    mockUser.findUnique.mockResolvedValue(null);

    const res = await request(app).post('/').send(validBody);

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('USER_NOT_FOUND');
  });

  it('returns 400 on missing required fields', async () => {
    const res = await request(app).post('/').send({ meaning: 'APPROVED' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

// ─── GET / ────────────────────────────────────────────────────────────────

describe('GET /esignatures', () => {
  it('lists e-signatures for a resource', async () => {
    mockESignature.findMany.mockResolvedValue([mockSigRecord]);
    mockESignature.count.mockResolvedValue(1);

    const res = await request(app)
      .get('/')
      .query({ resourceType: 'document', resourceId: '00000000-0000-0000-0000-000000000099' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items).toHaveLength(1);
    expect(res.body.data.total).toBe(1);
  });

  it('applies pagination', async () => {
    mockESignature.findMany.mockResolvedValue([]);
    mockESignature.count.mockResolvedValue(0);

    const res = await request(app).get('/').query({ page: '2', limit: '10' });

    expect(res.status).toBe(200);
    expect(res.body.data.page).toBe(2);
    expect(res.body.data.limit).toBe(10);
  });

  it('returns 500 on database error', async () => {
    mockESignature.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/');
    expect(res.status).toBe(500);
  });
});

// ─── GET /:id ─────────────────────────────────────────────────────────────

describe('GET /esignatures/:id', () => {
  it('returns e-signature with integrity check', async () => {
    mockESignature.findUnique.mockResolvedValue(mockSigRecord);
    mockVerifySignature.mockReturnValue({
      signatureId: SIG_ID,
      valid: true,
      checksumMatch: true,
      userId: USER_ID,
      userEmail: 'admin@ims.local',
      meaning: 'APPROVED',
      timestamp: new Date(),
      resourceType: 'document',
      resourceId: '00000000-0000-0000-0000-000000000099',
    });

    const res = await request(app).get(`/${SIG_ID}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.integrity.valid).toBe(true);
    expect(res.body.data.integrity.checksumMatch).toBe(true);
  });

  it('returns 404 when not found', async () => {
    mockESignature.findUnique.mockResolvedValue(null);

    const res = await request(app).get(`/${SIG_ID}`);

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

// ─── POST /:id/verify ─────────────────────────────────────────────────────

describe('POST /esignatures/:id/verify', () => {
  it('verifies signature and returns result', async () => {
    mockESignature.findUnique.mockResolvedValue(mockSigRecord);
    mockVerifySignature.mockReturnValue({
      signatureId: SIG_ID,
      valid: true,
      checksumMatch: true,
      userId: USER_ID,
      userEmail: 'admin@ims.local',
      meaning: 'APPROVED',
      timestamp: new Date(),
      resourceType: 'document',
      resourceId: '00000000-0000-0000-0000-000000000099',
    });

    const res = await request(app).post(`/${SIG_ID}/verify`);

    expect(res.status).toBe(200);
    expect(res.body.data.checksumMatch).toBe(true);
    expect(res.body.data.valid).toBe(true);
  });

  it('invalidates signature when checksum mismatch detected', async () => {
    mockESignature.findUnique.mockResolvedValue(mockSigRecord);
    mockVerifySignature.mockReturnValue({
      signatureId: SIG_ID,
      valid: false,
      checksumMatch: false,
      userId: USER_ID,
      userEmail: 'admin@ims.local',
      meaning: 'APPROVED',
      timestamp: new Date(),
      resourceType: 'document',
      resourceId: '00000000-0000-0000-0000-000000000099',
    });
    mockESignature.update.mockResolvedValue({ ...mockSigRecord, valid: false });

    const res = await request(app).post(`/${SIG_ID}/verify`);

    expect(res.status).toBe(200);
    expect(res.body.data.checksumMatch).toBe(false);
    expect(mockESignature.update).toHaveBeenCalledWith({
      where: { id: SIG_ID },
      data: { valid: false },
    });
  });

  it('returns 404 when not found', async () => {
    mockESignature.findUnique.mockResolvedValue(null);

    const res = await request(app).post(`/${SIG_ID}/verify`);

    expect(res.status).toBe(404);
  });
});

// ─── DELETE /:id ──────────────────────────────────────────────────────────

describe('DELETE /esignatures/:id', () => {
  it('revokes a valid signature', async () => {
    mockESignature.findUnique.mockResolvedValue(mockSigRecord);
    mockESignature.update.mockResolvedValue({ ...mockSigRecord, valid: false });

    const res = await request(app).delete(`/${SIG_ID}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(mockESignature.update).toHaveBeenCalledWith({
      where: { id: SIG_ID },
      data: { valid: false },
    });
  });

  it('returns 409 when already invalidated', async () => {
    mockESignature.findUnique.mockResolvedValue({ ...mockSigRecord, valid: false });

    const res = await request(app).delete(`/${SIG_ID}`);

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('ALREADY_INVALID');
  });

  it('returns 404 when not found', async () => {
    mockESignature.findUnique.mockResolvedValue(null);

    const res = await request(app).delete(`/${SIG_ID}`);

    expect(res.status).toBe(404);
  });
});


describe('E-Signature — additional coverage', () => {
  it('GET / returns empty items array when no signatures exist', async () => {
    mockESignature.findMany.mockResolvedValue([]);
    mockESignature.count.mockResolvedValue(0);
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.data.items).toHaveLength(0);
    expect(res.body.data.total).toBe(0);
  });

  it('POST / returns 400 when meaning is missing', async () => {
    const res = await request(app).post('/').send({
      reason: 'No meaning provided',
      password: 'pass',
      resourceType: 'document',
      resourceId: '00000000-0000-0000-0000-000000000099',
    });
    expect(res.status).toBe(400);
  });

  it('GET /:id returns 200 and integrity object with checksumMatch on valid signature', async () => {
    mockESignature.findUnique.mockResolvedValue(mockSigRecord);
    mockVerifySignature.mockReturnValue({
      signatureId: SIG_ID,
      valid: true,
      checksumMatch: true,
      userId: USER_ID,
      userEmail: 'admin@ims.local',
      meaning: 'APPROVED',
      timestamp: new Date(),
      resourceType: 'document',
      resourceId: '00000000-0000-0000-0000-000000000099',
    });
    const res = await request(app).get(`/${SIG_ID}`);
    expect(res.status).toBe(200);
    expect(res.body.data.integrity).toHaveProperty('checksumMatch', true);
  });

  it('DELETE /:id calls update with valid: false', async () => {
    mockESignature.findUnique.mockResolvedValue(mockSigRecord);
    mockESignature.update.mockResolvedValue({ ...mockSigRecord, valid: false });
    await request(app).delete(`/${SIG_ID}`);
    expect(mockESignature.update).toHaveBeenCalledWith({
      where: { id: SIG_ID },
      data: { valid: false },
    });
  });
});
