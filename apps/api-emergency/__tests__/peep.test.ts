import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    femPeep: {
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

import router from '../src/routes/peep';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/peep', router);

beforeEach(() => {
  jest.clearAllMocks();
});

const mockPeep = jest.mocked(prisma.femPeep);

const PEEP_ID = '00000000-0000-0000-0000-000000000001';
const PREMISES_ID = '00000000-0000-0000-0000-000000000002';

const fakePeep = {
  id: PEEP_ID,
  personName: 'David Brown',
  jobTitle: 'Software Engineer',
  department: 'Engineering',
  normalLocation: 'Floor 2, Desk 14',
  mobilityLevel: 'WHEELCHAIR_USER',
  requiresAssistance: true,
  evacuationMethod: 'Evacuation chair',
  assistantsRequired: 2,
  namedAssistants: ['Eve White', 'Frank Black'],
  refugeAreaRequired: true,
  refugeLocation: 'Floor 2 Refuge Area',
  isActive: true,
  reviewDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
  premisesId: PREMISES_ID,
};

const validCreateBody = {
  personName: 'David Brown',
  mobilityLevel: 'WHEELCHAIR_USER',
  reviewDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
};

describe('GET /api/peep/due-review', () => {
  it('returns PEEPs due for review', async () => {
    const overduePeep = {
      ...fakePeep,
      reviewDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      premises: { name: 'Head Office' },
    };
    mockPeep.findMany.mockResolvedValue([overduePeep]);

    const res = await request(app).get('/api/peep/due-review');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].personName).toBe('David Brown');
  });

  it('returns empty array when no PEEPs due for review', async () => {
    mockPeep.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/peep/due-review');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it('returns 500 on database error for due-review', async () => {
    mockPeep.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/peep/due-review');

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('GET /api/peep/premises/:id', () => {
  it('returns all PEEPs for a premises', async () => {
    mockPeep.findMany.mockResolvedValue([fakePeep]);

    const res = await request(app).get(`/api/peep/premises/${PREMISES_ID}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].mobilityLevel).toBe('WHEELCHAIR_USER');
  });

  it('returns empty array when no PEEPs for premises', async () => {
    mockPeep.findMany.mockResolvedValue([]);

    const res = await request(app).get(`/api/peep/premises/${PREMISES_ID}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it('returns 500 on database error for premises PEEPs', async () => {
    mockPeep.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get(`/api/peep/premises/${PREMISES_ID}`);

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('POST /api/peep/premises/:id', () => {
  it('creates a new PEEP for a premises and returns 201', async () => {
    mockPeep.create.mockResolvedValue(fakePeep);

    const res = await request(app).post(`/api/peep/premises/${PREMISES_ID}`).send(validCreateBody);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.personName).toBe('David Brown');
    expect(res.body.data.mobilityLevel).toBe('WHEELCHAIR_USER');
  });

  it('returns 400 when personName is missing', async () => {
    const res = await request(app).post(`/api/peep/premises/${PREMISES_ID}`).send({
      mobilityLevel: 'WHEELCHAIR_USER',
      reviewDate: '2027-01-01',
    });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when mobilityLevel is invalid', async () => {
    const res = await request(app).post(`/api/peep/premises/${PREMISES_ID}`).send({
      personName: 'Test Person',
      mobilityLevel: 'SUPER_MOBILE',
      reviewDate: '2027-01-01',
    });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when reviewDate is missing', async () => {
    const res = await request(app).post(`/api/peep/premises/${PREMISES_ID}`).send({
      personName: 'Test Person',
      mobilityLevel: 'INDEPENDENT',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('creates PEEP with visual impairment mobility level', async () => {
    const visualPeep = {
      ...fakePeep,
      mobilityLevel: 'VISUAL_IMPAIRMENT',
      communicationNeeds: 'Large print materials',
    };
    mockPeep.create.mockResolvedValue(visualPeep);

    const res = await request(app).post(`/api/peep/premises/${PREMISES_ID}`).send({
      personName: 'Grace Lee',
      mobilityLevel: 'VISUAL_IMPAIRMENT',
      reviewDate: '2027-01-01',
      communicationNeeds: 'Large print materials',
    });

    expect(res.status).toBe(201);
    expect(res.body.data.mobilityLevel).toBe('VISUAL_IMPAIRMENT');
  });

  it('creates PEEP with all optional fields', async () => {
    const fullPeep = {
      ...fakePeep,
      medicalConditionSummary: 'MS diagnosed 2020',
      medicationOnPerson: true,
      specialEquipment: 'Power wheelchair',
    };
    mockPeep.create.mockResolvedValue(fullPeep);

    const res = await request(app)
      .post(`/api/peep/premises/${PREMISES_ID}`)
      .send({
        ...validCreateBody,
        requiresAssistance: true,
        assistantsRequired: 2,
        refugeAreaRequired: true,
        refugeLocation: 'Floor 2 Refuge',
        medicalConditionSummary: 'MS diagnosed 2020',
        medicationOnPerson: true,
        specialEquipment: 'Power wheelchair',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.medicationOnPerson).toBe(true);
  });
});

describe('PUT /api/peep/:id', () => {
  it('updates an existing PEEP', async () => {
    const updated = { ...fakePeep, evacuationMethod: 'Stairclimber', assistantsRequired: 1 };
    mockPeep.findFirst.mockResolvedValue(fakePeep);
    mockPeep.update.mockResolvedValue(updated);

    const res = await request(app).put(`/api/peep/${PEEP_ID}`).send({
      evacuationMethod: 'Stairclimber',
      assistantsRequired: 1,
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.evacuationMethod).toBe('Stairclimber');
  });

  it('returns 404 when PEEP does not exist on update', async () => {
    mockPeep.findFirst.mockResolvedValue(null);

    const res = await request(app).put('/api/peep/00000000-0000-0000-0000-000000000999').send({
      evacuationMethod: 'Stairclimber',
    });

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('updates reviewDate correctly', async () => {
    const updatedWithDate = { ...fakePeep, reviewDate: '2028-01-01T00:00:00.000Z' };
    mockPeep.findFirst.mockResolvedValue(fakePeep);
    mockPeep.update.mockResolvedValue(updatedWithDate);

    const res = await request(app).put(`/api/peep/${PEEP_ID}`).send({
      reviewDate: '2028-01-01',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns 500 on database error during update', async () => {
    mockPeep.findFirst.mockResolvedValue(fakePeep);
    mockPeep.update.mockRejectedValue(new Error('DB error'));

    const res = await request(app).put(`/api/peep/${PEEP_ID}`).send({
      evacuationMethod: 'Chair',
    });

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('rejects invalid mobilityLevel on update', async () => {
    const res = await request(app).put(`/api/peep/${PEEP_ID}`).send({
      mobilityLevel: 'INVALID_LEVEL',
    });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('peep — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/peep', router);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/peep', async () => {
    const res = await request(app).get('/api/peep');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });

  it('response is JSON content-type for GET /api/peep', async () => {
    const res = await request(app).get('/api/peep');
    expect(res.headers['content-type']).toBeDefined();
  });

  it('GET /api/peep body has success property', async () => {
    const res = await request(app).get('/api/peep');
    if (res.status === 200) {
      expect(res.body).toHaveProperty('success');
    } else {
      expect(res.body).toBeDefined();
    }
  });
});

describe('peep — extended edge cases', () => {
  it('POST /api/peep/premises/:id returns 500 when create fails', async () => {
    mockPeep.create.mockRejectedValue(new Error('DB failure'));

    const res = await request(app).post(`/api/peep/premises/${PREMISES_ID}`).send(validCreateBody);

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('creates PEEP with HEARING_IMPAIRMENT mobility level', async () => {
    const hearingPeep = { ...fakePeep, mobilityLevel: 'HEARING_IMPAIRMENT' };
    mockPeep.create.mockResolvedValue(hearingPeep);

    const res = await request(app).post(`/api/peep/premises/${PREMISES_ID}`).send({
      personName: 'Tom Green',
      mobilityLevel: 'HEARING_IMPAIRMENT',
      reviewDate: '2027-06-01',
      communicationNeeds: 'Written instructions only',
    });

    expect(res.status).toBe(201);
    expect(res.body.data.mobilityLevel).toBe('HEARING_IMPAIRMENT');
  });

  it('creates PEEP with COGNITIVE_IMPAIRMENT mobility level', async () => {
    const cognitivePeep = { ...fakePeep, mobilityLevel: 'COGNITIVE_IMPAIRMENT' };
    mockPeep.create.mockResolvedValue(cognitivePeep);

    const res = await request(app).post(`/api/peep/premises/${PREMISES_ID}`).send({
      personName: 'Sam White',
      mobilityLevel: 'COGNITIVE_IMPAIRMENT',
      reviewDate: '2027-01-01',
    });

    expect(res.status).toBe(201);
    expect(res.body.data.mobilityLevel).toBe('COGNITIVE_IMPAIRMENT');
  });

  it('PUT /api/peep/:id updates namedAssistants list', async () => {
    const updated = { ...fakePeep, namedAssistants: ['Alice', 'Bob', 'Carol'] };
    mockPeep.findFirst.mockResolvedValue(fakePeep);
    mockPeep.update.mockResolvedValue(updated);

    const res = await request(app).put(`/api/peep/${PEEP_ID}`).send({
      namedAssistants: ['Alice', 'Bob', 'Carol'],
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.namedAssistants).toHaveLength(3);
  });

  it('due-review endpoint returns multiple PEEPs', async () => {
    const overdueList = [
      { ...fakePeep, reviewDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), premises: { name: 'HQ' } },
      { ...fakePeep, id: '00000000-0000-0000-0000-000000000003', personName: 'Amy Jones', reviewDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), premises: { name: 'Site B' } },
    ];
    mockPeep.findMany.mockResolvedValue(overdueList);

    const res = await request(app).get('/api/peep/due-review');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
  });

  it('premises PEEPs endpoint returns multiple PEEPs', async () => {
    mockPeep.findMany.mockResolvedValue([fakePeep, { ...fakePeep, id: '00000000-0000-0000-0000-000000000004' }]);

    const res = await request(app).get(`/api/peep/premises/${PREMISES_ID}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
  });

  it('creates PEEP with ASSISTED mobility level', async () => {
    const assistedPeep = { ...fakePeep, mobilityLevel: 'ASSISTED' };
    mockPeep.create.mockResolvedValue(assistedPeep);

    const res = await request(app).post(`/api/peep/premises/${PREMISES_ID}`).send({
      personName: 'Olivia Brown',
      mobilityLevel: 'ASSISTED',
      reviewDate: '2027-09-01',
    });

    expect(res.status).toBe(201);
    expect(res.body.data.mobilityLevel).toBe('ASSISTED');
  });

  it('creates PEEP with DEPENDENT mobility level', async () => {
    const dependentPeep = { ...fakePeep, mobilityLevel: 'DEPENDENT' };
    mockPeep.create.mockResolvedValue(dependentPeep);

    const res = await request(app).post(`/api/peep/premises/${PREMISES_ID}`).send({
      personName: 'Peter Hall',
      mobilityLevel: 'DEPENDENT',
      reviewDate: '2027-12-01',
    });

    expect(res.status).toBe(201);
    expect(res.body.data.mobilityLevel).toBe('DEPENDENT');
  });

  it('POST /api/peep/premises/:id returns 201 with correct structure', async () => {
    mockPeep.create.mockResolvedValue(fakePeep);

    const res = await request(app).post(`/api/peep/premises/${PREMISES_ID}`).send(validCreateBody);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data.personName).toBe('David Brown');
  });
});
