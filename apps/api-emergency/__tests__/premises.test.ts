import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    femPremises: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    femFireRiskAssessment: { count: jest.fn() },
    femEmergencyIncident: { count: jest.fn() },
    femFireWarden: { count: jest.fn() },
    femEmergencyEquipment: { count: jest.fn() },
    femPeep: { count: jest.fn() },
    femEvacuationDrill: { findFirst: jest.fn() },
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

import router from '../src/routes/premises';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/premises', router);

beforeEach(() => {
  jest.clearAllMocks();
});

const mockPremises = jest.mocked(prisma.femPremises);
const mockFra = jest.mocked(prisma.femFireRiskAssessment);
const mockIncident = jest.mocked(prisma.femEmergencyIncident);
const mockWarden = jest.mocked(prisma.femFireWarden);
const mockEquipment = jest.mocked(prisma.femEmergencyEquipment);
const mockPeep = jest.mocked(prisma.femPeep);
const mockDrill = jest.mocked(prisma.femEvacuationDrill);

const PREMISES_ID = '00000000-0000-0000-0000-000000000001';

const fakePremises = {
  id: PREMISES_ID,
  name: 'Head Office',
  address: '1 Main Street',
  postcode: 'SW1A 1AA',
  buildingType: 'OFFICE',
  numberOfFloors: 3,
  maxOccupancy: 200,
  organisationId: 'org-1',
  createdAt: new Date().toISOString(),
};

describe('GET /api/premises', () => {
  it('returns a list of premises with pagination', async () => {
    mockPremises.findMany.mockResolvedValue([fakePremises]);
    mockPremises.count.mockResolvedValue(1);

    const res = await request(app).get('/api/premises');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data[0].name).toBe('Head Office');
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.total).toBe(1);
  });

  it('returns empty list when no premises exist', async () => {
    mockPremises.findMany.mockResolvedValue([]);
    mockPremises.count.mockResolvedValue(0);

    const res = await request(app).get('/api/premises');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
    expect(res.body.pagination.total).toBe(0);
  });

  it('returns filtered results when search is provided', async () => {
    mockPremises.findMany.mockResolvedValue([fakePremises]);
    mockPremises.count.mockResolvedValue(1);

    const res = await request(app).get('/api/premises?search=Head');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns 500 on database error', async () => {
    mockPremises.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/premises');

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('POST /api/premises', () => {
  it('creates a new premises and returns 201', async () => {
    mockPremises.create.mockResolvedValue(fakePremises);

    const res = await request(app).post('/api/premises').send({
      name: 'Head Office',
      address: '1 Main Street',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Head Office');
  });

  it('returns 400 when name is missing', async () => {
    const res = await request(app).post('/api/premises').send({
      address: '1 Main Street',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when address is missing', async () => {
    const res = await request(app).post('/api/premises').send({
      name: 'Head Office',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when email format is invalid', async () => {
    const res = await request(app).post('/api/premises').send({
      name: 'Head Office',
      address: '1 Main Street',
      responsiblePersonEmail: 'not-an-email',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('creates premises with all optional fields', async () => {
    const full = { ...fakePremises, responsiblePersonName: 'John Smith', numberOfFloors: 5 };
    mockPremises.create.mockResolvedValue(full);

    const res = await request(app).post('/api/premises').send({
      name: 'Head Office',
      address: '1 Main Street',
      numberOfFloors: 5,
      maxOccupancy: 200,
      responsiblePersonName: 'John Smith',
      hasFireAlarm: true,
      hasSprinklers: false,
    });

    expect(res.status).toBe(201);
    expect(res.body.data.responsiblePersonName).toBe('John Smith');
  });
});

describe('GET /api/premises/:id', () => {
  it('returns a single premises by id', async () => {
    mockPremises.findFirst.mockResolvedValue({
      ...fakePremises,
      fireRiskAssessments: [],
      wardens: [],
      activeIncidents: [],
    });

    const res = await request(app).get(`/api/premises/${PREMISES_ID}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(PREMISES_ID);
  });

  it('returns 404 when premises does not exist', async () => {
    mockPremises.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/premises/00000000-0000-0000-0000-000000000999');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('returns 500 on database error', async () => {
    mockPremises.findFirst.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get(`/api/premises/${PREMISES_ID}`);

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('PUT /api/premises/:id', () => {
  it('updates an existing premises', async () => {
    const updated = { ...fakePremises, name: 'Updated Office' };
    mockPremises.findFirst.mockResolvedValue(fakePremises);
    mockPremises.update.mockResolvedValue(updated);

    const res = await request(app)
      .put(`/api/premises/${PREMISES_ID}`)
      .send({ name: 'Updated Office' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Updated Office');
  });

  it('returns 404 when premises does not exist on update', async () => {
    mockPremises.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/premises/00000000-0000-0000-0000-000000000999')
      .send({ name: 'Ghost' });

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

describe('GET /api/premises/:id/dashboard', () => {
  it('returns dashboard data for a premises', async () => {
    const recentDrill = {
      id: 'drill-1',
      drillDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
    };
    mockPremises.findUnique.mockResolvedValue(fakePremises);
    mockFra.count.mockResolvedValue(2);
    mockIncident.count.mockResolvedValue(1);
    mockWarden.count.mockResolvedValue(3);
    mockEquipment.count.mockResolvedValue(1);
    mockPeep.count.mockResolvedValue(0);
    mockDrill.findFirst.mockResolvedValue(recentDrill);

    const res = await request(app).get(`/api/premises/${PREMISES_ID}/dashboard`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.fraOverdueCount).toBe(2);
    expect(res.body.data.activeIncidentsCount).toBe(1);
    expect(res.body.data.wardenTrainingExpiringCount).toBe(3);
    expect(res.body.data.equipmentServiceDueCount).toBe(1);
    expect(res.body.data.peepReviewDueCount).toBe(0);
  });

  it('returns 404 when premises does not exist for dashboard', async () => {
    mockPremises.findUnique.mockResolvedValue(null);
    mockFra.count.mockResolvedValue(0);
    mockIncident.count.mockResolvedValue(0);
    mockWarden.count.mockResolvedValue(0);
    mockEquipment.count.mockResolvedValue(0);
    mockPeep.count.mockResolvedValue(0);
    mockDrill.findFirst.mockResolvedValue(null);

    const res = await request(app).get(
      '/api/premises/00000000-0000-0000-0000-000000000999/dashboard'
    );

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('marks drillOverdue as true when no drill exists', async () => {
    mockPremises.findUnique.mockResolvedValue(fakePremises);
    mockFra.count.mockResolvedValue(0);
    mockIncident.count.mockResolvedValue(0);
    mockWarden.count.mockResolvedValue(0);
    mockEquipment.count.mockResolvedValue(0);
    mockPeep.count.mockResolvedValue(0);
    mockDrill.findFirst.mockResolvedValue(null);

    const res = await request(app).get(`/api/premises/${PREMISES_ID}/dashboard`);

    expect(res.status).toBe(200);
    expect(res.body.data.drillOverdue).toBe(true);
  });
});
