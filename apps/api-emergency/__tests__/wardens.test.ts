import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    femFireWarden: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    $queryRaw: jest.fn(),
  },
  Prisma: {},
}));
jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((_req: any, _res: any, next: any) => {
    _req.user = { id: 'user-1', orgId: 'org-1', role: 'ADMIN' };
    next();
  }),
}));
jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import router from '../src/routes/wardens';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/wardens', router);

beforeEach(() => { jest.clearAllMocks(); });

const mockWarden = prisma.femFireWarden as any;

const WARDEN_ID = '00000000-0000-0000-0000-000000000001';
const PREMISES_ID = '00000000-0000-0000-0000-000000000002';

const fakeWarden = {
  id: WARDEN_ID,
  name: 'Alice Johnson',
  email: 'alice@example.com',
  phone: '07700900000',
  jobTitle: 'Office Manager',
  icsRole: 'FIRE_WARDEN',
  areaResponsible: 'Floor 1 North',
  premisesId: PREMISES_ID,
  isActive: true,
  trainingExpiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
};

const validCreateBody = {
  name: 'Alice Johnson',
  icsRole: 'FIRE_WARDEN',
  areaResponsible: 'Floor 1 North',
};

describe('GET /api/wardens/training-expiring', () => {
  it('returns wardens with training expiring within 60 days', async () => {
    const expiringWarden = {
      ...fakeWarden,
      trainingExpiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      premises: { name: 'Head Office' },
    };
    mockWarden.findMany.mockResolvedValue([expiringWarden]);

    const res = await request(app).get('/api/wardens/training-expiring');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].name).toBe('Alice Johnson');
  });

  it('returns empty array when no training is expiring', async () => {
    mockWarden.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/wardens/training-expiring');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it('returns 500 on database error for training-expiring', async () => {
    mockWarden.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/wardens/training-expiring');

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('FETCH_ERROR');
  });
});

describe('GET /api/wardens/premises/:id', () => {
  it('returns all wardens for a premises', async () => {
    mockWarden.findMany.mockResolvedValue([fakeWarden]);

    const res = await request(app).get(`/api/wardens/premises/${PREMISES_ID}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].icsRole).toBe('FIRE_WARDEN');
  });

  it('returns empty array when no wardens for premises', async () => {
    mockWarden.findMany.mockResolvedValue([]);

    const res = await request(app).get(`/api/wardens/premises/${PREMISES_ID}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it('returns 500 on database error for premises wardens', async () => {
    mockWarden.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get(`/api/wardens/premises/${PREMISES_ID}`);

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('FETCH_ERROR');
  });
});

describe('POST /api/wardens/premises/:id', () => {
  it('creates a new warden for a premises and returns 201', async () => {
    mockWarden.create.mockResolvedValue(fakeWarden);

    const res = await request(app).post(`/api/wardens/premises/${PREMISES_ID}`).send(validCreateBody);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Alice Johnson');
    expect(res.body.data.icsRole).toBe('FIRE_WARDEN');
  });

  it('returns 400 when name is missing', async () => {
    const res = await request(app).post(`/api/wardens/premises/${PREMISES_ID}`).send({
      icsRole: 'FIRE_WARDEN',
    });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when icsRole is invalid', async () => {
    const res = await request(app).post(`/api/wardens/premises/${PREMISES_ID}`).send({
      name: 'Bob',
      icsRole: 'INVALID_ROLE',
    });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('creates warden with training dates', async () => {
    const withTraining = {
      ...fakeWarden,
      trainingDate: '2026-01-15T00:00:00.000Z',
      trainingExpiryDate: '2027-01-15T00:00:00.000Z',
      trainingProvider: 'FireSafe Ltd',
    };
    mockWarden.create.mockResolvedValue(withTraining);

    const res = await request(app).post(`/api/wardens/premises/${PREMISES_ID}`).send({
      ...validCreateBody,
      trainingDate: '2026-01-15',
      trainingExpiryDate: '2027-01-15',
      trainingProvider: 'FireSafe Ltd',
      trainingCurrent: true,
    });

    expect(res.status).toBe(201);
    expect(res.body.data.trainingProvider).toBe('FireSafe Ltd');
  });

  it('returns 400 when email is invalid format', async () => {
    const res = await request(app).post(`/api/wardens/premises/${PREMISES_ID}`).send({
      name: 'Bob',
      icsRole: 'FIRE_WARDEN',
      email: 'not-valid-email',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('creates warden with INCIDENT_COMMANDER role', async () => {
    const commanderWarden = { ...fakeWarden, icsRole: 'INCIDENT_COMMANDER' };
    mockWarden.create.mockResolvedValue(commanderWarden);

    const res = await request(app).post(`/api/wardens/premises/${PREMISES_ID}`).send({
      name: 'Bob Smith',
      icsRole: 'INCIDENT_COMMANDER',
    });

    expect(res.status).toBe(201);
    expect(res.body.data.icsRole).toBe('INCIDENT_COMMANDER');
  });
});

describe('PUT /api/wardens/:id', () => {
  it('updates an existing warden', async () => {
    const updated = { ...fakeWarden, areaResponsible: 'Floor 2 South', trainingCurrent: true };
    mockWarden.findUnique.mockResolvedValue(fakeWarden);
    mockWarden.update.mockResolvedValue(updated);

    const res = await request(app).put(`/api/wardens/${WARDEN_ID}`).send({
      areaResponsible: 'Floor 2 South',
      trainingCurrent: true,
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.areaResponsible).toBe('Floor 2 South');
  });

  it('returns 404 when warden does not exist on update', async () => {
    mockWarden.findUnique.mockResolvedValue(null);

    const res = await request(app).put('/api/wardens/00000000-0000-0000-0000-000000000999').send({
      areaResponsible: 'Floor 3',
    });

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('updates training expiry date correctly', async () => {
    const updatedWithExpiry = { ...fakeWarden, trainingExpiryDate: '2028-01-01T00:00:00.000Z' };
    mockWarden.findUnique.mockResolvedValue(fakeWarden);
    mockWarden.update.mockResolvedValue(updatedWithExpiry);

    const res = await request(app).put(`/api/wardens/${WARDEN_ID}`).send({
      trainingExpiryDate: '2028-01-01',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns 500 on database error during update', async () => {
    mockWarden.findUnique.mockResolvedValue(fakeWarden);
    mockWarden.update.mockRejectedValue(new Error('DB error'));

    const res = await request(app).put(`/api/wardens/${WARDEN_ID}`).send({
      areaResponsible: 'Floor 3',
    });

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('UPDATE_ERROR');
  });
});
