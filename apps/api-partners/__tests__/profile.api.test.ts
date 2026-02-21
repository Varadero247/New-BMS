import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    mktPartner: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import profileRouter from '../src/routes/profile';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
// Inject partner auth middleware
app.use((req: any, _res: any, next: any) => {
  req.partner = { id: 'partner-1' };
  next();
});
app.use('/api/profile', profileRouter);

const appNoAuth = express();
appNoAuth.use(express.json());
// No partner auth — simulates unauthenticated requests
appNoAuth.use('/api/profile', profileRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

const mockPartner = {
  id: 'partner-1',
  email: 'partner@example.com',
  name: 'Test Partner',
  company: 'Partner Co',
  phone: '+44 1234 567890',
  tier: 'REFERRAL',
  isoSpecialisms: ['9001', '14001'],
  referralCode: 'REF-ABC123',
  referralUrl: 'https://nexara.io/ref/REF-ABC123',
  status: 'ACTIVE',
  createdAt: new Date('2026-01-01'),
};

// ===================================================================
// GET /api/profile
// ===================================================================

describe('GET /api/profile', () => {
  it('should return partner profile when authenticated', async () => {
    (prisma.mktPartner.findUnique as jest.Mock).mockResolvedValue(mockPartner);

    const res = await request(app).get('/api/profile');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('partner-1');
    expect(res.body.data.email).toBe('partner@example.com');
    expect(res.body.data.company).toBe('Partner Co');
  });

  it('should query the correct partner by ID', async () => {
    (prisma.mktPartner.findUnique as jest.Mock).mockResolvedValue(mockPartner);

    await request(app).get('/api/profile');

    expect(prisma.mktPartner.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'partner-1' },
      })
    );
  });

  it('should return 401 when not authenticated', async () => {
    const res = await request(appNoAuth).get('/api/profile');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('should return 404 when partner not found', async () => {
    (prisma.mktPartner.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get('/api/profile');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 500 on database error', async () => {
    (prisma.mktPartner.findUnique as jest.Mock).mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/profile');

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

// ===================================================================
// PUT /api/profile
// ===================================================================

describe('PUT /api/profile', () => {
  it('should update partner profile with valid data', async () => {
    const updated = { ...mockPartner, name: 'Updated Name', phone: '+44 9999 000000' };
    (prisma.mktPartner.update as jest.Mock).mockResolvedValue(updated);

    const res = await request(app)
      .put('/api/profile')
      .send({ name: 'Updated Name', phone: '+44 9999 000000' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Updated Name');
    expect(res.body.data.phone).toBe('+44 9999 000000');
  });

  it('should update isoSpecialisms array', async () => {
    const updated = { ...mockPartner, isoSpecialisms: ['9001', '14001', '45001'] };
    (prisma.mktPartner.update as jest.Mock).mockResolvedValue(updated);

    const res = await request(app)
      .put('/api/profile')
      .send({ isoSpecialisms: ['9001', '14001', '45001'] });

    expect(res.status).toBe(200);
    expect(res.body.data.isoSpecialisms).toHaveLength(3);
  });

  it('should call update with correct partner ID', async () => {
    (prisma.mktPartner.update as jest.Mock).mockResolvedValue(mockPartner);

    await request(app).put('/api/profile').send({ name: 'New Name' });

    expect(prisma.mktPartner.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'partner-1' },
      })
    );
  });

  it('should return 401 when not authenticated', async () => {
    const res = await request(appNoAuth).put('/api/profile').send({ name: 'New Name' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('should return 400 for invalid update data (empty name)', async () => {
    const res = await request(app).put('/api/profile').send({ name: '' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 for invalid update data (empty company)', async () => {
    const res = await request(app).put('/api/profile').send({ company: '' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 500 on database error', async () => {
    (prisma.mktPartner.update as jest.Mock).mockRejectedValue(new Error('DB error'));

    const res = await request(app).put('/api/profile').send({ name: 'Test' });

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('should allow empty PUT body (all fields optional)', async () => {
    (prisma.mktPartner.update as jest.Mock).mockResolvedValue(mockPartner);

    const res = await request(app).put('/api/profile').send({});

    expect(res.status).toBe(200);
  });
});

describe('Partner Profile — extended', () => {
  it('GET /profile response includes referralCode field', async () => {
    (prisma.mktPartner.findUnique as jest.Mock).mockResolvedValue(mockPartner);

    const res = await request(app).get('/api/profile');

    expect(res.status).toBe(200);
    expect(res.body.data.referralCode).toBe('REF-ABC123');
  });

  it('PUT /profile responds with updated isoSpecialisms when replaced', async () => {
    const updated = { ...mockPartner, isoSpecialisms: ['27001'] };
    (prisma.mktPartner.update as jest.Mock).mockResolvedValue(updated);

    const res = await request(app).put('/api/profile').send({ isoSpecialisms: ['27001'] });

    expect(res.status).toBe(200);
    expect(res.body.data.isoSpecialisms).toEqual(['27001']);
  });
});
