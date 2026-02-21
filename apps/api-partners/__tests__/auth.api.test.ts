process.env.JWT_SECRET = 'test-secret';

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
