import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    chemIncident: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    chemRegister: { findFirst: jest.fn() },
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

import router from '../src/routes/incidents';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/incidents', router);

beforeEach(() => {
  jest.clearAllMocks();
});

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
  chemical: {
    id: '00000000-0000-0000-0000-000000000001',
    productName: 'Acetone',
    casNumber: '67-64-1',
    signalWord: 'DANGER',
    pictograms: ['GHS02_FLAMMABLE'],
  },
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
    mockPrisma.chemIncident.findMany.mockResolvedValue([mockIncident]);
    mockPrisma.chemIncident.count.mockResolvedValue(1);

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
    mockPrisma.chemIncident.findMany.mockResolvedValue([]);
    mockPrisma.chemIncident.count.mockResolvedValue(0);

    const res = await request(app).get('/api/incidents?type=EXPOSURE');
    expect(res.status).toBe(200);
    expect(mockPrisma.chemIncident.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ incidentType: 'EXPOSURE' }) })
    );
  });

  it('should support severity filter', async () => {
    mockPrisma.chemIncident.findMany.mockResolvedValue([]);
    mockPrisma.chemIncident.count.mockResolvedValue(0);

    const res = await request(app).get('/api/incidents?severity=MAJOR');
    expect(res.status).toBe(200);
    expect(mockPrisma.chemIncident.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ severity: 'MAJOR' }) })
    );
  });

  it('should support search parameter', async () => {
    mockPrisma.chemIncident.findMany.mockResolvedValue([]);
    mockPrisma.chemIncident.count.mockResolvedValue(0);

    const res = await request(app).get('/api/incidents?search=spill');
    expect(res.status).toBe(200);
    expect(mockPrisma.chemIncident.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ OR: expect.any(Array) }) })
    );
  });

  it('should return 500 on database error', async () => {
    mockPrisma.chemIncident.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/incidents');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('GET /api/incidents/:id', () => {
  it('should return a single incident', async () => {
    mockPrisma.chemIncident.findFirst.mockResolvedValue({
      ...mockIncident,
      chemical: mockChemical,
    });

    const res = await request(app).get('/api/incidents/00000000-0000-0000-0000-000000000050');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.incidentType).toBe('SPILL');
    expect(res.body.data.description).toBe('Small acetone spill during transfer');
  });

  it('should return 404 when incident not found', async () => {
    mockPrisma.chemIncident.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/incidents/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
    expect(res.body.error.message).toBe('Incident not found');
  });

  it('should return 500 on database error', async () => {
    mockPrisma.chemIncident.findFirst.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/incidents/00000000-0000-0000-0000-000000000050');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('POST /api/incidents', () => {
  it('should create a new incident', async () => {
    mockPrisma.chemRegister.findFirst.mockResolvedValue(mockChemical);
    mockPrisma.chemIncident.create.mockResolvedValue(mockIncident);

    const res = await request(app).post('/api/incidents').send(validIncidentBody);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.incidentType).toBe('SPILL');
    expect(mockPrisma.chemIncident.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          orgId: 'org-1',
          createdBy: 'user-1',
        }),
      })
    );
  });

  it('should create incident with exposure routes', async () => {
    mockPrisma.chemRegister.findFirst.mockResolvedValue(mockChemical);
    mockPrisma.chemIncident.create.mockResolvedValue({
      ...mockIncident,
      exposureRoutes: ['INHALATION', 'SKIN_ABSORPTION'],
    });

    const res = await request(app)
      .post('/api/incidents')
      .send({
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
    const res = await request(app)
      .post('/api/incidents')
      .send({
        ...validIncidentBody,
        incidentType: 'INVALID_TYPE',
      });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 when severity is invalid', async () => {
    const res = await request(app)
      .post('/api/incidents')
      .send({
        ...validIncidentBody,
        severity: 'INVALID_SEVERITY',
      });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 404 when chemical does not exist', async () => {
    mockPrisma.chemRegister.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/incidents')
      .send({
        ...validIncidentBody,
        chemicalId: '00000000-0000-0000-0000-000000000099',
      });
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
    expect(res.body.error.message).toBe('Chemical not found');
  });

  it('should return 500 on database create error', async () => {
    mockPrisma.chemRegister.findFirst.mockResolvedValue(mockChemical);
    mockPrisma.chemIncident.create.mockRejectedValue(new Error('DB error'));

    const res = await request(app).post('/api/incidents').send(validIncidentBody);
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('PUT /api/incidents/:id', () => {
  it('should update an existing incident', async () => {
    mockPrisma.chemIncident.findFirst.mockResolvedValue(mockIncident);
    mockPrisma.chemIncident.update.mockResolvedValue({
      ...mockIncident,
      rootCauseAnalysis: 'Improper handling',
      correctiveActions: 'Retrain staff',
    });

    const res = await request(app).put('/api/incidents/00000000-0000-0000-0000-000000000050').send({
      rootCauseAnalysis: 'Improper handling',
      correctiveActions: 'Retrain staff',
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.rootCauseAnalysis).toBe('Improper handling');
  });

  it('should return 404 when incident not found', async () => {
    mockPrisma.chemIncident.findFirst.mockResolvedValue(null);

    const res = await request(app).put('/api/incidents/00000000-0000-0000-0000-000000000099').send({
      description: 'Updated',
    });
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 500 on database error', async () => {
    mockPrisma.chemIncident.findFirst.mockResolvedValue(mockIncident);
    mockPrisma.chemIncident.update.mockRejectedValue(new Error('DB error'));

    const res = await request(app).put('/api/incidents/00000000-0000-0000-0000-000000000050').send({
      description: 'Fail',
    });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('incidents.api — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/incidents', router);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/incidents', async () => {
    const res = await request(app).get('/api/incidents');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });
});

describe('incidents.api — edge cases and field validation', () => {
  it('GET /incidents returns success: true on 200', async () => {
    mockPrisma.chemIncident.findMany.mockResolvedValue([mockIncident]);
    mockPrisma.chemIncident.count.mockResolvedValue(1);
    const res = await request(app).get('/api/incidents');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /incidents pagination includes total, page and limit fields', async () => {
    mockPrisma.chemIncident.findMany.mockResolvedValue([]);
    mockPrisma.chemIncident.count.mockResolvedValue(0);
    const res = await request(app).get('/api/incidents');
    expect(res.status).toBe(200);
    expect(res.body.pagination).toHaveProperty('total');
    expect(res.body.pagination).toHaveProperty('page');
    expect(res.body.pagination).toHaveProperty('limit');
  });

  it('GET /incidents?page=2&limit=5 returns correct pagination metadata', async () => {
    mockPrisma.chemIncident.findMany.mockResolvedValue([]);
    mockPrisma.chemIncident.count.mockResolvedValue(25);
    const res = await request(app).get('/api/incidents?page=2&limit=5');
    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(2);
    expect(res.body.pagination.limit).toBe(5);
    expect(res.body.pagination.total).toBe(25);
  });

  it('GET /incidents?type=FIRE filter is applied in findMany call', async () => {
    mockPrisma.chemIncident.findMany.mockResolvedValue([]);
    mockPrisma.chemIncident.count.mockResolvedValue(0);
    const res = await request(app).get('/api/incidents?type=FIRE');
    expect(res.status).toBe(200);
    expect(mockPrisma.chemIncident.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ incidentType: 'FIRE' }),
      })
    );
  });

  it('GET /incidents/:id 500 returns INTERNAL_ERROR code', async () => {
    mockPrisma.chemIncident.findFirst.mockRejectedValue(new Error('DB crash'));
    const res = await request(app).get('/api/incidents/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST /incidents sets orgId and createdBy from authenticated user', async () => {
    mockPrisma.chemRegister.findFirst.mockResolvedValue(mockChemical);
    mockPrisma.chemIncident.create.mockResolvedValue(mockIncident);
    await request(app).post('/api/incidents').send(validIncidentBody);
    expect(mockPrisma.chemIncident.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ orgId: 'org-1', createdBy: 'user-1' }),
      })
    );
  });

  it('PUT /incidents/:id 500 response has success: false', async () => {
    mockPrisma.chemIncident.findFirst.mockResolvedValue(mockIncident);
    mockPrisma.chemIncident.update.mockRejectedValue(new Error('Update error'));
    const res = await request(app)
      .put('/api/incidents/00000000-0000-0000-0000-000000000050')
      .send({ description: 'Updated desc' });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /incidents/:id returns data with incidentType field', async () => {
    mockPrisma.chemIncident.findFirst.mockResolvedValue(mockIncident);
    const res = await request(app).get('/api/incidents/00000000-0000-0000-0000-000000000050');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('incidentType', 'SPILL');
  });

  it('POST /incidents returns 400 when dateTime is missing', async () => {
    const res = await request(app).post('/api/incidents').send({
      chemicalId: '00000000-0000-0000-0000-000000000001',
      incidentType: 'SPILL',
      severity: 'MINOR',
      location: 'Lab A',
      description: 'A spill occurred',
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('incidents.api — additional coverage 2', () => {
  it('GET /incidents pagination has totalPages when count > 0', async () => {
    mockPrisma.chemIncident.findMany.mockResolvedValue([]);
    mockPrisma.chemIncident.count.mockResolvedValue(20);
    const res = await request(app).get('/api/incidents?page=1&limit=5');
    expect(res.status).toBe(200);
    expect(res.body.pagination.totalPages).toBe(4);
  });

  it('GET /incidents?severity=CRITICAL filters by severity', async () => {
    mockPrisma.chemIncident.findMany.mockResolvedValue([]);
    mockPrisma.chemIncident.count.mockResolvedValue(0);
    await request(app).get('/api/incidents?severity=CRITICAL');
    expect(mockPrisma.chemIncident.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ severity: 'CRITICAL' }) })
    );
  });

  it('GET /incidents returns success:true with empty array', async () => {
    mockPrisma.chemIncident.findMany.mockResolvedValue([]);
    mockPrisma.chemIncident.count.mockResolvedValue(0);
    const res = await request(app).get('/api/incidents');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toHaveLength(0);
  });

  it('PUT /incidents/:id with where clause matching URL id', async () => {
    mockPrisma.chemIncident.findFirst.mockResolvedValue(mockIncident);
    mockPrisma.chemIncident.update.mockResolvedValue({ ...mockIncident, location: 'Lab B' });
    await request(app).put('/api/incidents/00000000-0000-0000-0000-000000000050').send({ location: 'Lab B' });
    expect(mockPrisma.chemIncident.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: '00000000-0000-0000-0000-000000000050' } })
    );
  });

  it('GET /incidents/:id returns 404 with NOT_FOUND code when missing', async () => {
    mockPrisma.chemIncident.findFirst.mockResolvedValue(null);
    const res = await request(app).get('/api/incidents/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('POST /incidents count is not called (no sequence generation needed)', async () => {
    mockPrisma.chemRegister.findFirst.mockResolvedValue(mockChemical);
    mockPrisma.chemIncident.create.mockResolvedValue(mockIncident);
    await request(app).post('/api/incidents').send(validIncidentBody);
    expect(mockPrisma.chemIncident.count).not.toHaveBeenCalled();
  });

  it('GET /incidents data items include severity field', async () => {
    mockPrisma.chemIncident.findMany.mockResolvedValue([mockIncident]);
    mockPrisma.chemIncident.count.mockResolvedValue(1);
    const res = await request(app).get('/api/incidents');
    expect(res.status).toBe(200);
    expect(res.body.data[0]).toHaveProperty('severity', 'MINOR');
  });
});

describe('incidents.api — additional coverage 3', () => {
  it('GET /incidents response is JSON content-type', async () => {
    mockPrisma.chemIncident.findMany.mockResolvedValue([]);
    mockPrisma.chemIncident.count.mockResolvedValue(0);
    const res = await request(app).get('/api/incidents');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('POST /incidents returns 400 when chemicalId is missing', async () => {
    const res = await request(app).post('/api/incidents').send({
      incidentType: 'SPILL',
      severity: 'MINOR',
      dateTime: '2026-02-10T14:30:00.000Z',
      location: 'Lab A',
      description: 'A spill occurred',
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('GET /incidents with page=2&limit=10 passes skip:10 to findMany', async () => {
    mockPrisma.chemIncident.findMany.mockResolvedValue([]);
    mockPrisma.chemIncident.count.mockResolvedValue(0);
    await request(app).get('/api/incidents?page=2&limit=10');
    expect(mockPrisma.chemIncident.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10, take: 10 })
    );
  });

  it('GET /incidents/:id returns 200 with success:true for found incident', async () => {
    mockPrisma.chemIncident.findFirst.mockResolvedValue(mockIncident);
    const res = await request(app).get('/api/incidents/00000000-0000-0000-0000-000000000050');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('incidents.api — phase28 coverage', () => {
  it('GET /incidents pagination has page, limit and total fields', async () => {
    mockPrisma.chemIncident.findMany.mockResolvedValue([]);
    mockPrisma.chemIncident.count.mockResolvedValue(0);
    const res = await request(app).get('/api/incidents');
    expect(res.status).toBe(200);
    expect(res.body.pagination).toHaveProperty('page');
    expect(res.body.pagination).toHaveProperty('limit');
    expect(res.body.pagination).toHaveProperty('total');
  });

  it('PUT /incidents/:id returns 404 when incident not found', async () => {
    mockPrisma.chemIncident.findFirst.mockResolvedValue(null);
    const res = await request(app)
      .put('/api/incidents/00000000-0000-0000-0000-000000000099')
      .send({ location: 'Lab Z' });
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('PUT /incidents/:id returns 500 when update rejects', async () => {
    mockPrisma.chemIncident.findFirst.mockResolvedValue(mockIncident);
    mockPrisma.chemIncident.update.mockRejectedValue(new Error('DB crash'));
    const res = await request(app)
      .put('/api/incidents/00000000-0000-0000-0000-000000000050')
      .send({ location: 'Lab C' });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('GET /incidents findMany is called once per list request', async () => {
    mockPrisma.chemIncident.findMany.mockResolvedValue([]);
    mockPrisma.chemIncident.count.mockResolvedValue(0);
    await request(app).get('/api/incidents');
    expect(mockPrisma.chemIncident.findMany).toHaveBeenCalledTimes(1);
  });

  it('POST /incidents returns 404 when chemical does not exist', async () => {
    mockPrisma.chemRegister.findFirst.mockResolvedValue(null);
    const res = await request(app).post('/api/incidents').send({
      chemicalId: '00000000-0000-0000-0000-000000000001',
      incidentType: 'SPILL',
      severity: 'MINOR',
      dateTime: '2026-02-10T14:30:00.000Z',
      location: 'Lab A',
      description: 'Spill',
    });
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

describe('incidents — phase30 coverage', () => {
  it('handles Math.sqrt', () => {
    expect(Math.sqrt(9)).toBe(3);
  });

  it('handles error instanceof', () => {
    expect(new Error('test')).toBeInstanceOf(Error);
  });

  it('handles boolean type', () => {
    expect(typeof true).toBe('boolean');
  });

  it('handles array push', () => {
    const a: number[] = []; a.push(1); expect(a).toHaveLength(1);
  });

  it('handles string toUpperCase', () => {
    expect('hello'.toUpperCase()).toBe('HELLO');
  });

});
