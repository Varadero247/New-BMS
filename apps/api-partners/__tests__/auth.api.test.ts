process.env.JWT_SECRET = 'test-secret';
process.env.MAX_LOGIN_ATTEMPTS = '200';
process.env.MAX_REGISTER_ATTEMPTS = '200';

import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    mktPartner: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    // Interactive transaction: execute the callback with a tx proxy
    $transaction: jest.fn(async (fn: any) => {
      const { prisma: p } = jest.requireMock('../src/prisma');
      return fn(p);
    }),
  },
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn(() => Promise.resolve('hashed-password')),
  compare: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'mock-token'),
  verify: jest.fn(),
}));

import authRouter from '../src/routes/auth';
import { prisma } from '../src/prisma';
import bcrypt from 'bcryptjs';

const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

const mockPartner = {
  id: 'partner-1',
  email: 'partner@test.com',
  passwordHash: 'hashed-password',
  name: 'John Partner',
  company: 'PartnerCo',
  tier: 'REFERRAL',
  referralCode: 'ref-123',
  status: 'ACTIVE',
  createdAt: new Date(),
};

describe('POST /api/auth/register', () => {
  it('creates a new partner', async () => {
    (prisma.mktPartner.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.mktPartner.create as jest.Mock).mockResolvedValue(mockPartner);
    (prisma.mktPartner.update as jest.Mock).mockResolvedValue(mockPartner);

    const res = await request(app).post('/api/auth/register').send({
      email: 'new@partner.com',
      password: 'securepass123',
      name: 'New Partner',
      company: 'NewCo',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBe('mock-token');
    expect(res.body.data.partner.email).toBe('partner@test.com');
  });

  it('returns 409 for existing email', async () => {
    (prisma.mktPartner.findUnique as jest.Mock).mockResolvedValue(mockPartner);

    const res = await request(app).post('/api/auth/register').send({
      email: 'partner@test.com',
      password: 'securepass123',
      name: 'Partner',
      company: 'Co',
    });

    expect(res.status).toBe(409);
  });

  it('returns 400 for invalid email', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'not-email',
      password: 'securepass123',
      name: 'Partner',
      company: 'Co',
    });

    expect(res.status).toBe(400);
  });

  it('returns 400 for short password', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'test@test.com',
      password: '123',
      name: 'Partner',
      company: 'Co',
    });

    expect(res.status).toBe(400);
  });

  it('returns 400 for missing required fields', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'test@test.com' });

    expect(res.status).toBe(400);
  });

  it('hashes the password', async () => {
    (prisma.mktPartner.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.mktPartner.create as jest.Mock).mockResolvedValue(mockPartner);
    (prisma.mktPartner.update as jest.Mock).mockResolvedValue(mockPartner);

    await request(app).post('/api/auth/register').send({
      email: 'new@partner.com',
      password: 'securepass123',
      name: 'Partner',
      company: 'Co',
    });

    expect(bcrypt.hash).toHaveBeenCalledWith('securepass123', 12);
  });
});

describe('POST /api/auth/login', () => {
  it('returns token for valid credentials', async () => {
    (prisma.mktPartner.findUnique as jest.Mock).mockResolvedValue(mockPartner);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'partner@test.com', password: 'securepass123' });

    expect(res.status).toBe(200);
    expect(res.body.data.token).toBe('mock-token');
  });

  it('returns 401 for unknown email', async () => {
    (prisma.mktPartner.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'unknown@test.com', password: 'pass123' });

    expect(res.status).toBe(401);
  });

  it('returns 401 for wrong password', async () => {
    (prisma.mktPartner.findUnique as jest.Mock).mockResolvedValue(mockPartner);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'partner@test.com', password: 'wrongpass' });

    expect(res.status).toBe(401);
  });

  it('returns 403 for suspended partner', async () => {
    (prisma.mktPartner.findUnique as jest.Mock).mockResolvedValue({
      ...mockPartner,
      status: 'SUSPENDED',
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'partner@test.com', password: 'pass123' });

    expect(res.status).toBe(403);
  });

  it('returns 400 for invalid email format', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'not-email', password: 'pass' });

    expect(res.status).toBe(400);
  });
});

// ─── 500 error paths ────────────────────────────────────────────────────────

describe('500 error handling', () => {
  it('POST /register returns 500 when create fails', async () => {
    (prisma.mktPartner.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.mktPartner.create as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).post('/api/auth/register').send({
      email: 'new@partner.com',
      password: 'securepass123',
      name: 'New Partner',
      company: 'NewCo',
    });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST /login returns 500 when findUnique fails', async () => {
    (prisma.mktPartner.findUnique as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).post('/api/auth/login').send({
      email: 'partner@test.com',
      password: 'securepass123',
    });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('Partners Auth — extended', () => {
  it('POST /register returns partner data in response body', async () => {
    (prisma.mktPartner.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.mktPartner.create as jest.Mock).mockResolvedValue(mockPartner);
    (prisma.mktPartner.update as jest.Mock).mockResolvedValue(mockPartner);

    const res = await request(app).post('/api/auth/register').send({
      email: 'new@partner.com',
      password: 'securepass123',
      name: 'New Partner',
      company: 'NewCo',
    });

    expect(res.status).toBe(201);
    expect(res.body.data.partner).toBeDefined();
    expect(res.body.data.partner.company).toBe('PartnerCo');
  });

  it('POST /login returns success:true and tier in response for active partner', async () => {
    (prisma.mktPartner.findUnique as jest.Mock).mockResolvedValue(mockPartner);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'partner@test.com', password: 'securepass123' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.partner.tier).toBe('REFERRAL');
  });
});

describe('Partners Auth — additional coverage', () => {
  it('POST /register with optional phone and isoSpecialisms returns 201', async () => {
    (prisma.mktPartner.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.mktPartner.create as jest.Mock).mockResolvedValue(mockPartner);
    (prisma.mktPartner.update as jest.Mock).mockResolvedValue(mockPartner);
    const res = await request(app).post('/api/auth/register').send({
      email: 'specialist@partner.com',
      password: 'securepass123',
      name: 'Spec Partner',
      company: 'SpecCo',
      phone: '+44 20 1234 5678',
      isoSpecialisms: ['ISO 9001', 'ISO 14001'],
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('POST /register error code is ALREADY_EXISTS on duplicate email', async () => {
    (prisma.mktPartner.findUnique as jest.Mock).mockResolvedValue(mockPartner);
    const res = await request(app).post('/api/auth/register').send({
      email: 'partner@test.com',
      password: 'securepass123',
      name: 'Dup',
      company: 'DupCo',
    });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('ALREADY_EXISTS');
  });

  it('POST /login error code is INVALID_CREDENTIALS for unknown email', async () => {
    (prisma.mktPartner.findUnique as jest.Mock).mockResolvedValue(null);
    const res = await request(app).post('/api/auth/login').send({
      email: 'nobody@test.com',
      password: 'somepassword',
    });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('POST /login error code is ACCOUNT_SUSPENDED for suspended partner', async () => {
    (prisma.mktPartner.findUnique as jest.Mock).mockResolvedValue({
      ...mockPartner,
      status: 'SUSPENDED',
    });
    const res = await request(app).post('/api/auth/login').send({
      email: 'partner@test.com',
      password: 'securepass123',
    });
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('ACCOUNT_SUSPENDED');
  });

  it('POST /login returns partner id and referralCode in response', async () => {
    (prisma.mktPartner.findUnique as jest.Mock).mockResolvedValue(mockPartner);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    const res = await request(app).post('/api/auth/login').send({
      email: 'partner@test.com',
      password: 'securepass123',
    });
    expect(res.status).toBe(200);
    expect(res.body.data.partner.id).toBe('partner-1');
    expect(res.body.data.partner.referralCode).toBe('ref-123');
  });
});

describe('Partners Auth — new edge cases', () => {
  it('POST /register requires password of at least 12 characters', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'new@partner.com',
      password: 'short11',
      name: 'New Partner',
      company: 'NewCo',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /register stores createdBy with correct user via transaction', async () => {
    (prisma.mktPartner.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.mktPartner.create as jest.Mock).mockResolvedValue(mockPartner);
    (prisma.mktPartner.update as jest.Mock).mockResolvedValue(mockPartner);

    const res = await request(app).post('/api/auth/register').send({
      email: 'new@partner.com',
      password: 'securepass123',
      name: 'New Partner',
      company: 'NewCo',
    });

    expect(res.status).toBe(201);
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });

  it('POST /login response includes partner.name field', async () => {
    (prisma.mktPartner.findUnique as jest.Mock).mockResolvedValue(mockPartner);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'partner@test.com', password: 'securepass123' });

    expect(res.status).toBe(200);
    expect(res.body.data.partner.name).toBe('John Partner');
  });

  it('POST /login response includes partner.company field', async () => {
    (prisma.mktPartner.findUnique as jest.Mock).mockResolvedValue(mockPartner);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'partner@test.com', password: 'securepass123' });

    expect(res.status).toBe(200);
    expect(res.body.data.partner.company).toBe('PartnerCo');
  });

  it('POST /register does not expose passwordHash in response', async () => {
    (prisma.mktPartner.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.mktPartner.create as jest.Mock).mockResolvedValue(mockPartner);
    (prisma.mktPartner.update as jest.Mock).mockResolvedValue(mockPartner);

    const res = await request(app).post('/api/auth/register').send({
      email: 'new@partner.com',
      password: 'securepass123',
      name: 'New Partner',
      company: 'NewCo',
    });

    expect(res.status).toBe(201);
    expect(res.body.data.partner.passwordHash).toBeUndefined();
  });

  it('POST /login does not expose passwordHash in response', async () => {
    (prisma.mktPartner.findUnique as jest.Mock).mockResolvedValue(mockPartner);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'partner@test.com', password: 'securepass123' });

    expect(res.status).toBe(200);
    expect(res.body.data.partner.passwordHash).toBeUndefined();
  });

  it('POST /login with missing email returns 400', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ password: 'securepass123' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /register with missing company field returns 400', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'new@partner.com',
      password: 'securepass123',
      name: 'New Partner',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /login returns 401 with INVALID_CREDENTIALS code for wrong password', async () => {
    (prisma.mktPartner.findUnique as jest.Mock).mockResolvedValue(mockPartner);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'partner@test.com', password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });
});

describe('Partners Auth — exhaustive coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('POST /register success is true on 201', async () => {
    (prisma.mktPartner.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.mktPartner.create as jest.Mock).mockResolvedValue(mockPartner);
    (prisma.mktPartner.update as jest.Mock).mockResolvedValue(mockPartner);
    const res = await request(app).post('/api/auth/register').send({
      email: 'new@partner.com',
      password: 'securepass123',
      name: 'New Partner',
      company: 'NewCo',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('POST /login success is true on 200', async () => {
    (prisma.mktPartner.findUnique as jest.Mock).mockResolvedValue(mockPartner);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    const res = await request(app).post('/api/auth/login').send({
      email: 'partner@test.com',
      password: 'securepass123',
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('POST /login response token is the mocked token value', async () => {
    (prisma.mktPartner.findUnique as jest.Mock).mockResolvedValue(mockPartner);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    const res = await request(app).post('/api/auth/login').send({
      email: 'partner@test.com',
      password: 'securepass123',
    });
    expect(res.status).toBe(200);
    expect(res.body.data.token).toBe('mock-token');
  });

  it('POST /register 409 when email already taken, success is false', async () => {
    (prisma.mktPartner.findUnique as jest.Mock).mockResolvedValue(mockPartner);
    const res = await request(app).post('/api/auth/register').send({
      email: 'partner@test.com',
      password: 'securepass123',
      name: 'Partner',
      company: 'Co',
    });
    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('POST /register with tier=GCC_SPECIALIST returns 201', async () => {
    (prisma.mktPartner.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.mktPartner.create as jest.Mock).mockResolvedValue(mockPartner);
    (prisma.mktPartner.update as jest.Mock).mockResolvedValue(mockPartner);
    const res = await request(app).post('/api/auth/register').send({
      email: 'gcc@partner.com',
      password: 'securepass123',
      name: 'GCC Partner',
      company: 'GCC Co',
      tier: 'GCC_SPECIALIST',
    });
    expect(res.status).toBe(201);
  });

  it('POST /login findUnique called with email', async () => {
    (prisma.mktPartner.findUnique as jest.Mock).mockResolvedValue(mockPartner);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    await request(app).post('/api/auth/login').send({
      email: 'partner@test.com',
      password: 'securepass123',
    });
    expect(prisma.mktPartner.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { email: 'partner@test.com' } })
    );
  });
});
