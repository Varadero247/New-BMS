import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    femEmergencyEquipment: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
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

import router from '../src/routes/equipment';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/equipment', router);

beforeEach(() => {
  jest.clearAllMocks();
});

const mockEquipment = jest.mocked(prisma.femEmergencyEquipment);

const EQUIPMENT_ID = '00000000-0000-0000-0000-000000000001';
const PREMISES_ID = '00000000-0000-0000-0000-000000000002';

const fakeEquipment = {
  id: EQUIPMENT_ID,
  equipmentType: 'FIRE_EXTINGUISHER',
  description: 'CO2 Extinguisher 5kg',
  location: 'Reception Area',
  serialNumber: 'EXT-001',
  manufacturer: 'SafeFire Ltd',
  extinguisherClass: 'CO2',
  capacityKg: 5,
  installDate: '2024-01-15T00:00:00.000Z',
  lastServiceDate: '2025-01-15T00:00:00.000Z',
  nextServiceDue: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
  serviceProvider: 'FireService Co',
  isOperational: true,
  premisesId: PREMISES_ID,
};

const validCreateBody = {
  equipmentType: 'FIRE_EXTINGUISHER',
  location: 'Reception Area',
  nextServiceDue: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
};

describe('GET /api/equipment/service-due', () => {
  it('returns equipment with service due within 30 days', async () => {
    const nearDueEquip = {
      ...fakeEquipment,
      nextServiceDue: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      premises: { name: 'Head Office' },
    };
    mockEquipment.findMany.mockResolvedValue([nearDueEquip]);

    const res = await request(app).get('/api/equipment/service-due');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].equipmentType).toBe('FIRE_EXTINGUISHER');
  });

  it('returns empty array when no service due', async () => {
    mockEquipment.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/equipment/service-due');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it('returns 500 on database error for service-due', async () => {
    mockEquipment.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/equipment/service-due');

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('GET /api/equipment/premises/:id', () => {
  it('returns all equipment for a premises', async () => {
    mockEquipment.findMany.mockResolvedValue([fakeEquipment]);

    const res = await request(app).get(`/api/equipment/premises/${PREMISES_ID}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].serialNumber).toBe('EXT-001');
  });

  it('returns empty array when no equipment for premises', async () => {
    mockEquipment.findMany.mockResolvedValue([]);

    const res = await request(app).get(`/api/equipment/premises/${PREMISES_ID}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it('returns 500 on database error for premises equipment', async () => {
    mockEquipment.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get(`/api/equipment/premises/${PREMISES_ID}`);

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('POST /api/equipment/premises/:id', () => {
  it('adds new equipment to a premises and returns 201', async () => {
    mockEquipment.create.mockResolvedValue(fakeEquipment);

    const res = await request(app)
      .post(`/api/equipment/premises/${PREMISES_ID}`)
      .send(validCreateBody);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.equipmentType).toBe('FIRE_EXTINGUISHER');
    expect(res.body.data.location).toBe('Reception Area');
  });

  it('returns 400 when equipmentType is missing', async () => {
    const res = await request(app).post(`/api/equipment/premises/${PREMISES_ID}`).send({
      location: 'Reception Area',
      nextServiceDue: '2027-01-01',
    });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when location is missing', async () => {
    const res = await request(app).post(`/api/equipment/premises/${PREMISES_ID}`).send({
      equipmentType: 'FIRE_EXTINGUISHER',
      nextServiceDue: '2027-01-01',
    });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when nextServiceDue is missing', async () => {
    const res = await request(app).post(`/api/equipment/premises/${PREMISES_ID}`).send({
      equipmentType: 'FIRE_EXTINGUISHER',
      location: 'Reception Area',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('creates equipment with all optional fields', async () => {
    const fullEquipment = {
      ...fakeEquipment,
      manufacturer: 'SafeFire Ltd',
      serviceProvider: 'FireService Co',
      capacityKg: 5,
    };
    mockEquipment.create.mockResolvedValue(fullEquipment);

    const res = await request(app)
      .post(`/api/equipment/premises/${PREMISES_ID}`)
      .send({
        ...validCreateBody,
        serialNumber: 'EXT-002',
        manufacturer: 'SafeFire Ltd',
        extinguisherClass: 'CO2',
        capacityKg: 5,
        installDate: '2024-01-15',
        lastServiceDate: '2025-01-15',
        serviceProvider: 'FireService Co',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.manufacturer).toBe('SafeFire Ltd');
  });
});

describe('PUT /api/equipment/:id', () => {
  it('updates an existing equipment record', async () => {
    const updated = { ...fakeEquipment, location: 'Server Room', serviceProvider: 'NewFire Co' };
    mockEquipment.findFirst.mockResolvedValue(fakeEquipment);
    mockEquipment.update.mockResolvedValue(updated);

    const res = await request(app).put(`/api/equipment/${EQUIPMENT_ID}`).send({
      location: 'Server Room',
      serviceProvider: 'NewFire Co',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.location).toBe('Server Room');
  });

  it('returns 404 when equipment does not exist on update', async () => {
    mockEquipment.findFirst.mockResolvedValue(null);

    const res = await request(app).put('/api/equipment/00000000-0000-0000-0000-000000000999').send({
      location: 'Kitchen',
    });

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('returns 500 on database error during update', async () => {
    mockEquipment.findFirst.mockResolvedValue(fakeEquipment);
    mockEquipment.update.mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .put(`/api/equipment/${EQUIPMENT_ID}`)
      .send({ location: 'Kitchen' });

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('POST /api/equipment/:id/inspect', () => {
  it('records a passing inspection for equipment', async () => {
    const inspected = {
      ...fakeEquipment,
      lastInspectedAt: new Date().toISOString(),
      inspectedBy: 'user-1',
      inspectionResult: 'PASS',
      isOperational: true,
    };
    mockEquipment.findFirst.mockResolvedValue(fakeEquipment);
    mockEquipment.update.mockResolvedValue(inspected);

    const res = await request(app).post(`/api/equipment/${EQUIPMENT_ID}/inspect`).send({
      inspectionResult: 'PASS',
      isOperational: true,
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.inspectionResult).toBe('PASS');
    expect(res.body.data.isOperational).toBe(true);
  });

  it('records a failed inspection with defects', async () => {
    const failedInspection = {
      ...fakeEquipment,
      lastInspectedAt: new Date().toISOString(),
      inspectionResult: 'FAIL',
      defects: 'Pressure gauge faulty',
      isOperational: false,
    };
    mockEquipment.findFirst.mockResolvedValue(fakeEquipment);
    mockEquipment.update.mockResolvedValue(failedInspection);

    const res = await request(app).post(`/api/equipment/${EQUIPMENT_ID}/inspect`).send({
      inspectionResult: 'FAIL',
      defects: 'Pressure gauge faulty',
      isOperational: false,
    });

    expect(res.status).toBe(200);
    expect(res.body.data.inspectionResult).toBe('FAIL');
    expect(res.body.data.defects).toBe('Pressure gauge faulty');
  });

  it('returns 400 when inspectionResult is missing', async () => {
    const res = await request(app).post(`/api/equipment/${EQUIPMENT_ID}/inspect`).send({
      isOperational: true,
    });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 404 when equipment does not exist for inspection', async () => {
    mockEquipment.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/equipment/00000000-0000-0000-0000-000000000999/inspect')
      .send({
        inspectionResult: 'PASS',
      });

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});
