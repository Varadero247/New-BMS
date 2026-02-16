import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    chemIncident: { findMany: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), count: jest.fn() },
    chemRegister: { findFirst: jest.fn() },
  },
  Prisma: {},
}));
jest.mock('@ims/auth', () => ({ authenticate: jest.fn((_req: any, _res: any, next: any) => { _req.user = { id: 'user-1', orgId: 'org-1', role: 'ADMIN' }; next(); }) }));
jest.mock('@ims/monitoring', () => ({ createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }) }));

import router from '../src/routes/incidents';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/incidents', router);

beforeEach(() => { jest.clearAllMocks(); });

const mockChemical = {
  id: '00000000-0000-0000-0000-000000000001',
  productName: 'Acetone',
  casNumber: '67-64-1',
  deletedAt: null,
};

const mockIncident = {
  id: '00000000-0000-0000-0000-000000000050',
  chemicalId: '00000000-0000-0000-0000-000000000001',
  incidentType: 'SPILL',
  severity: 'MINOR',
  dateTime: '2026-02-10T14:30:00.000Z',
  location: 'Lab A',
  description: 'Small acetone spill during transfer',
  personsInvolved: ['John Doe'],
  immediateActions: 'Area ventilated, spill cleaned with absorbent',
  orgId: 'org-1',
  createdBy: 'user-1',
  chemical: { id: '00000000-0000-0000-0000-000000000001', productName: 'Acetone', casNumber: '67-64-1', signalWord: 'DANGER', pictograms: ['GHS02_FLAMMABLE'] },
};

const validIncidentBody = {
  chemicalId: '00000000-0000-0000-0000-000000000001',
  incidentType: 'SPILL' as const,
  severity: 'MINOR' as const,
  dateTime: '2026-02-10T14:30:00.000Z',
  location: 'Lab A',
  description: 'Small acetone spill during transfer',
};

describe('GET /api/incidents', () => {
  it('should return a list of incidents with pagination', async () => {
    (prisma as any).chemIncident.findMany.mockResolvedValue([mockIncident]);
    (prisma as any).chemIncident.count.mockResolvedValue(1);

    const res = await request(app).get('/api/incidents');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].incidentType).toBe('SPILL');
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.total).toBe(1);
  });

  it('should support type filter', async () => {
    (prisma as any).chemIncident.findMany.mockResolvedValue([]);
    (prisma as any).chemIncident.count.mockResolvedValue(0);

    const res = await request(app).get('/api/incidents?type=EXPOSURE');
    expect(res.status).toBe(200);
    expect((prisma as any).chemIncident.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ incidentType: 'EXPOSURE' }) })
    );
  });

  it('should support severity filter', async () => {
    (prisma as any).chemIncident.findMany.mockResolvedValue([]);
    (prisma as any).chemIncident.count.mockResolvedValue(0);

    const res = await request(app).get('/api/incidents?severity=MAJOR');
    expect(res.status).toBe(200);
    expect((prisma as any).chemIncident.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ severity: 'MAJOR' }) })
    );
  });

  it('should support search parameter', async () => {
    (prisma as any).chemIncident.findMany.mockResolvedValue([]);
    (prisma as any).chemIncident.count.mockResolvedValue(0);

    const res = await request(app).get('/api/incidents?search=spill');
    expect(res.status).toBe(200);
    expect((prisma as any).chemIncident.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ OR: expect.any(Array) }) })
    );
  });

  it('should return 500 on database error', async () => {
    (prisma as any).chemIncident.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/incidents');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FETCH_ERROR');
  });
});

describe('GET /api/incidents/:id', () => {
  it('should return a single incident', async () => {
    (prisma as any).chemIncident.findFirst.mockResolvedValue({ ...mockIncident, chemical: mockChemical });

    const res = await request(app).get('/api/incidents/00000000-0000-0000-0000-000000000050');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.incidentType).toBe('SPILL');
    expect(res.body.data.description).toBe('Small acetone spill during transfer');
  });

  it('should return 404 when incident not found', async () => {
    (prisma as any).chemIncident.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/incidents/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
    expect(res.body.error.message).toBe('Incident not found');
  });

  it('should return 500 on database error', async () => {
    (prisma as any).chemIncident.findFirst.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/incidents/00000000-0000-0000-0000-000000000050');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FETCH_ERROR');
  });
});

describe('POST /api/incidents', () => {
  it('should create a new incident', async () => {
    (prisma as any).chemRegister.findFirst.mockResolvedValue(mockChemical);
    (prisma as any).chemIncident.create.mockResolvedValue(mockIncident);

    const res = await request(app).post('/api/incidents').send(validIncidentBody);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.incidentType).toBe('SPILL');
    expect((prisma as any).chemIncident.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          orgId: 'org-1',
          createdBy: 'user-1',
        }),
      })
    );
  });

  it('should create incident with exposure routes', async () => {
    (prisma as any).chemRegister.findFirst.mockResolvedValue(mockChemical);
    (prisma as any).chemIncident.create.mockResolvedValue({ ...mockIncident, exposureRoutes: ['INHALATION', 'SKIN_ABSORPTION'] });

    const res = await request(app).post('/api/incidents').send({
      ...validIncidentBody,
      incidentType: 'EXPOSURE',
      exposureRoutes: ['INHALATION', 'SKIN_ABSORPTION'],
      medicalAttentionGiven: true,
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should return 400 when location is missing', async () => {
    const res = await request(app).post('/api/incidents').send({
      chemicalId: '00000000-0000-0000-0000-000000000001',
      incidentType: 'SPILL',
      severity: 'MINOR',
      dateTime: '2026-02-10T14:30:00.000Z',
      description: 'A spill',
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 when description is missing', async () => {
    const res = await request(app).post('/api/incidents').send({
      chemicalId: '00000000-0000-0000-0000-000000000001',
      incidentType: 'SPILL',
      severity: 'MINOR',
      dateTime: '2026-02-10T14:30:00.000Z',
      location: 'Lab A',
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 when incidentType is invalid', async () => {
    const res = await request(app).post('/api/incidents').send({
      ...validIncidentBody,
      incidentType: 'INVALID_TYPE',
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 when severity is invalid', async () => {
    const res = await request(app).post('/api/incidents').send({
      ...validIncidentBody,
      severity: 'INVALID_SEVERITY',
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 404 when chemical does not exist', async () => {
    (prisma as any).chemRegister.findFirst.mockResolvedValue(null);

    const res = await request(app).post('/api/incidents').send({
      ...validIncidentBody,
      chemicalId: '00000000-0000-0000-0000-000000000099',
    });
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
    expect(res.body.error.message).toBe('Chemical not found');
  });

  it('should return 400 on database create error', async () => {
    (prisma as any).chemRegister.findFirst.mockResolvedValue(mockChemical);
    (prisma as any).chemIncident.create.mockRejectedValue(new Error('DB error'));

    const res = await request(app).post('/api/incidents').send(validIncidentBody);
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('CREATE_ERROR');
  });
});

describe('PUT /api/incidents/:id', () => {
  it('should update an existing incident', async () => {
    (prisma as any).chemIncident.findFirst.mockResolvedValue(mockIncident);
    (prisma as any).chemIncident.update.mockResolvedValue({ ...mockIncident, rootCauseAnalysis: 'Improper handling', correctiveActions: 'Retrain staff' });

    const res = await request(app).put('/api/incidents/00000000-0000-0000-0000-000000000050').send({
      rootCauseAnalysis: 'Improper handling',
      correctiveActions: 'Retrain staff',
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.rootCauseAnalysis).toBe('Improper handling');
  });

  it('should return 404 when incident not found', async () => {
    (prisma as any).chemIncident.findFirst.mockResolvedValue(null);

    const res = await request(app).put('/api/incidents/00000000-0000-0000-0000-000000000099').send({
      description: 'Updated',
    });
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 500 on database error', async () => {
    (prisma as any).chemIncident.findFirst.mockResolvedValue(mockIncident);
    (prisma as any).chemIncident.update.mockRejectedValue(new Error('DB error'));

    const res = await request(app).put('/api/incidents/00000000-0000-0000-0000-000000000050').send({
      description: 'Fail',
    });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UPDATE_ERROR');
  });
});
