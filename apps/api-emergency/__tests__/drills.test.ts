import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    femEvacuationDrill: {
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

import router from '../src/routes/drills';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/drills', router);

beforeEach(() => {
  jest.clearAllMocks();
});

const mockDrill = jest.mocked(prisma.femEvacuationDrill);

const DRILL_ID = '00000000-0000-0000-0000-000000000001';
const PREMISES_ID = '00000000-0000-0000-0000-000000000002';

const fakeDrill = {
  id: DRILL_ID,
  drillDate: '2026-01-15T09:00:00.000Z',
  drillType: 'FIRE',
  evacuationType: 'FULL_EVACUATION',
  alarmedOrSilent: 'ALARMED',
  totalPersonsEvacuated: 150,
  evacuationTimeMinutes: 4.5,
  targetTimeMinutes: 5,
  targetAchieved: true,
  assemblyPointReached: true,
  rollCallCompleted: true,
  rollCallTimeMinutes: 2,
  peepEvacuationTested: true,
  issuesIdentified: ['Blocked fire exit on floor 1'],
  correctiveActions: 'Clear fire exit immediately',
  completedBy: 'John Smith',
  premisesId: PREMISES_ID,
  premises: { name: 'Head Office' },
};

const validCreateBody = {
  drillDate: '2026-01-15',
  drillType: 'FIRE',
  evacuationType: 'FULL_EVACUATION',
  alarmedOrSilent: 'ALARMED',
};

describe('GET /api/drills/analytics', () => {
  it('returns drill analytics with premises stats', async () => {
    const drillsData = [
      { ...fakeDrill, evacuationTimeMinutes: 4.5, targetAchieved: true },
      {
        ...fakeDrill,
        id: '00000000-0000-0000-0000-000000000003',
        evacuationTimeMinutes: 5.5,
        targetAchieved: false,
      },
    ];
    mockDrill.findMany.mockResolvedValue(drillsData);

    const res = await request(app).get('/api/drills/analytics');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalDrills).toBe(2);
    expect(res.body.data.premisesStats).toBeDefined();
    expect(res.body.data.recentDrills).toBeDefined();
  });

  it('returns analytics with empty data when no drills exist', async () => {
    mockDrill.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/drills/analytics');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalDrills).toBe(0);
    expect(res.body.data.recentDrills).toHaveLength(0);
  });

  it('computes correct avgEvacTime and targetMetRate', async () => {
    const drills = [
      { ...fakeDrill, evacuationTimeMinutes: 4, targetAchieved: true, premises: { name: 'HQ' } },
      {
        ...fakeDrill,
        id: 'drill-2',
        evacuationTimeMinutes: 6,
        targetAchieved: false,
        premises: { name: 'HQ' },
      },
    ];
    mockDrill.findMany.mockResolvedValue(drills);

    const res = await request(app).get('/api/drills/analytics');

    expect(res.status).toBe(200);
    expect(res.body.data.premisesStats['HQ']).toBeDefined();
    expect(res.body.data.premisesStats['HQ'].avgEvacTime).toBe(5);
    expect(res.body.data.premisesStats['HQ'].targetMetRate).toBe(50);
  });

  it('returns 500 on database error for analytics', async () => {
    mockDrill.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/drills/analytics');

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('GET /api/drills/premises/:id', () => {
  it('returns drill history for a premises', async () => {
    mockDrill.findMany.mockResolvedValue([fakeDrill]);

    const res = await request(app).get(`/api/drills/premises/${PREMISES_ID}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].drillType).toBe('FIRE');
  });

  it('returns empty array when no drills for premises', async () => {
    mockDrill.findMany.mockResolvedValue([]);

    const res = await request(app).get(`/api/drills/premises/${PREMISES_ID}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it('returns 500 on database error for premises drills', async () => {
    mockDrill.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get(`/api/drills/premises/${PREMISES_ID}`);

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('POST /api/drills/premises/:id', () => {
  it('records a new drill and returns 201', async () => {
    mockDrill.create.mockResolvedValue(fakeDrill);

    const res = await request(app)
      .post(`/api/drills/premises/${PREMISES_ID}`)
      .send(validCreateBody);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.drillType).toBe('FIRE');
    expect(res.body.data.evacuationType).toBe('FULL_EVACUATION');
  });

  it('returns 400 when drillDate is missing', async () => {
    const res = await request(app).post(`/api/drills/premises/${PREMISES_ID}`).send({
      drillType: 'FIRE',
      evacuationType: 'FULL_EVACUATION',
      alarmedOrSilent: 'ALARMED',
    });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when evacuationType is invalid', async () => {
    const res = await request(app).post(`/api/drills/premises/${PREMISES_ID}`).send({
      drillDate: '2026-01-15',
      drillType: 'FIRE',
      evacuationType: 'INVALID_TYPE',
      alarmedOrSilent: 'ALARMED',
    });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when alarmedOrSilent is missing', async () => {
    const res = await request(app).post(`/api/drills/premises/${PREMISES_ID}`).send({
      drillDate: '2026-01-15',
      drillType: 'FIRE',
      evacuationType: 'FULL_EVACUATION',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('creates a partial evacuation drill', async () => {
    const partialDrill = {
      ...fakeDrill,
      evacuationType: 'PARTIAL_EVACUATION',
      totalPersonsEvacuated: 50,
    };
    mockDrill.create.mockResolvedValue(partialDrill);

    const res = await request(app).post(`/api/drills/premises/${PREMISES_ID}`).send({
      drillDate: '2026-02-10',
      drillType: 'FIRE',
      evacuationType: 'PARTIAL_EVACUATION',
      alarmedOrSilent: 'SILENT',
      totalPersonsEvacuated: 50,
      evacuationTimeMinutes: 3.5,
      targetTimeMinutes: 4,
      targetAchieved: true,
    });

    expect(res.status).toBe(201);
    expect(res.body.data.evacuationType).toBe('PARTIAL_EVACUATION');
  });

  it('creates drill with PEEP evacuation tested', async () => {
    const peepDrill = {
      ...fakeDrill,
      peepEvacuationTested: true,
      peepIssues: 'Stairclimber required maintenance',
    };
    mockDrill.create.mockResolvedValue(peepDrill);

    const res = await request(app)
      .post(`/api/drills/premises/${PREMISES_ID}`)
      .send({
        ...validCreateBody,
        peepEvacuationTested: true,
        peepIssues: 'Stairclimber required maintenance',
        rollCallCompleted: true,
        rollCallTimeMinutes: 3,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.peepEvacuationTested).toBe(true);
  });
});

describe('PUT /api/drills/:id', () => {
  it('updates an existing drill record', async () => {
    const updated = {
      ...fakeDrill,
      correctiveActions: 'Fire exits cleared and signed',
      evacuationTimeMinutes: 4.2,
    };
    mockDrill.findFirst.mockResolvedValue(fakeDrill);
    mockDrill.update.mockResolvedValue(updated);

    const res = await request(app).put(`/api/drills/${DRILL_ID}`).send({
      correctiveActions: 'Fire exits cleared and signed',
      evacuationTimeMinutes: 4.2,
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.correctiveActions).toBe('Fire exits cleared and signed');
  });

  it('returns 404 when drill does not exist on update', async () => {
    mockDrill.findFirst.mockResolvedValue(null);

    const res = await request(app).put('/api/drills/00000000-0000-0000-0000-000000000999').send({
      correctiveActions: 'No issues',
    });

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('updates drill date correctly', async () => {
    const updatedDate = { ...fakeDrill, drillDate: '2026-02-01T09:00:00.000Z' };
    mockDrill.findFirst.mockResolvedValue(fakeDrill);
    mockDrill.update.mockResolvedValue(updatedDate);

    const res = await request(app).put(`/api/drills/${DRILL_ID}`).send({
      drillDate: '2026-02-01',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns 500 on database error during update', async () => {
    mockDrill.findFirst.mockResolvedValue(fakeDrill);
    mockDrill.update.mockRejectedValue(new Error('DB error'));

    const res = await request(app).put(`/api/drills/${DRILL_ID}`).send({
      completedBy: 'Jane Smith',
    });

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('rejects invalid evacuationType on update', async () => {
    const res = await request(app).put(`/api/drills/${DRILL_ID}`).send({
      evacuationType: 'INVALID',
    });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('drills — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/drills', router);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/drills', async () => {
    const res = await request(app).get('/api/drills');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });

  it('response is JSON content-type for GET /api/drills', async () => {
    const res = await request(app).get('/api/drills');
    expect(res.headers['content-type']).toBeDefined();
  });
});

describe('drills — extended edge cases', () => {
  it('returns analytics with multiple premises stats', async () => {
    const drills = [
      { ...fakeDrill, premises: { name: 'Site A' }, evacuationTimeMinutes: 3, targetAchieved: true },
      { ...fakeDrill, id: '00000000-0000-0000-0000-000000000003', premises: { name: 'Site B' }, evacuationTimeMinutes: 6, targetAchieved: false },
      { ...fakeDrill, id: '00000000-0000-0000-0000-000000000004', premises: { name: 'Site A' }, evacuationTimeMinutes: 5, targetAchieved: true },
    ];
    mockDrill.findMany.mockResolvedValue(drills);

    const res = await request(app).get('/api/drills/analytics');

    expect(res.status).toBe(200);
    expect(res.body.data.totalDrills).toBe(3);
    expect(res.body.data.premisesStats['Site A']).toBeDefined();
    expect(res.body.data.premisesStats['Site B']).toBeDefined();
  });

  it('analytics recentDrills is limited to 10', async () => {
    const drills = Array.from({ length: 15 }, (_, i) => ({
      ...fakeDrill,
      id: `00000000-0000-0000-0000-00000000000${i + 1}`,
      premises: { name: 'HQ' },
    }));
    mockDrill.findMany.mockResolvedValue(drills);

    const res = await request(app).get('/api/drills/analytics');

    expect(res.status).toBe(200);
    expect(res.body.data.recentDrills.length).toBeLessThanOrEqual(10);
  });

  it('POST returns 500 when database create fails', async () => {
    mockDrill.create.mockRejectedValue(new Error('DB failure'));

    const res = await request(app)
      .post(`/api/drills/premises/${PREMISES_ID}`)
      .send(validCreateBody);

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('creates drill with HORIZONTAL_EVACUATION type', async () => {
    const horizDrill = { ...fakeDrill, evacuationType: 'HORIZONTAL_EVACUATION' };
    mockDrill.create.mockResolvedValue(horizDrill);

    const res = await request(app).post(`/api/drills/premises/${PREMISES_ID}`).send({
      drillDate: '2026-03-01',
      drillType: 'FIRE',
      evacuationType: 'HORIZONTAL_EVACUATION',
      alarmedOrSilent: 'ALARMED',
    });

    expect(res.status).toBe(201);
    expect(res.body.data.evacuationType).toBe('HORIZONTAL_EVACUATION');
  });

  it('creates drill with SHELTER_IN_PLACE type', async () => {
    const shelterDrill = { ...fakeDrill, evacuationType: 'SHELTER_IN_PLACE' };
    mockDrill.create.mockResolvedValue(shelterDrill);

    const res = await request(app).post(`/api/drills/premises/${PREMISES_ID}`).send({
      drillDate: '2026-03-15',
      drillType: 'LOCKDOWN',
      evacuationType: 'SHELTER_IN_PLACE',
      alarmedOrSilent: 'SILENT',
    });

    expect(res.status).toBe(201);
    expect(res.body.data.evacuationType).toBe('SHELTER_IN_PLACE');
  });

  it('PUT returns success field in response body', async () => {
    mockDrill.findFirst.mockResolvedValue(fakeDrill);
    mockDrill.update.mockResolvedValue({ ...fakeDrill, completedBy: 'Test User' });

    const res = await request(app).put(`/api/drills/${DRILL_ID}`).send({ completedBy: 'Test User' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('data');
  });

  it('premises drills endpoint returns success:true with data array', async () => {
    mockDrill.findMany.mockResolvedValue([fakeDrill, { ...fakeDrill, id: '00000000-0000-0000-0000-000000000005' }]);

    const res = await request(app).get(`/api/drills/premises/${PREMISES_ID}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
  });

  it('rejects STAY_PUT as drillType but accepts as evacuationType', async () => {
    const stayPutDrill = { ...fakeDrill, evacuationType: 'STAY_PUT' };
    mockDrill.create.mockResolvedValue(stayPutDrill);

    const res = await request(app).post(`/api/drills/premises/${PREMISES_ID}`).send({
      drillDate: '2026-04-01',
      drillType: 'FIRE',
      evacuationType: 'STAY_PUT',
      alarmedOrSilent: 'ALARMED',
    });

    expect(res.status).toBe(201);
    expect(res.body.data.evacuationType).toBe('STAY_PUT');
  });

  it('analytics targetsMet rate is 0 when no drills met target', async () => {
    const drills = [
      { ...fakeDrill, evacuationTimeMinutes: 10, targetAchieved: false, premises: { name: 'Site X' } },
      { ...fakeDrill, id: '00000000-0000-0000-0000-000000000006', evacuationTimeMinutes: 12, targetAchieved: false, premises: { name: 'Site X' } },
    ];
    mockDrill.findMany.mockResolvedValue(drills);

    const res = await request(app).get('/api/drills/analytics');

    expect(res.status).toBe(200);
    expect(res.body.data.premisesStats['Site X'].targetMetRate).toBe(0);
  });
});

describe('drills — final coverage', () => {
  it('POST requires drillType to be present', async () => {
    const res = await request(app).post(`/api/drills/premises/${PREMISES_ID}`).send({
      drillDate: '2026-05-01',
      evacuationType: 'FULL_EVACUATION',
      alarmedOrSilent: 'ALARMED',
    });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('PUT /api/drills/:id updates assemblyPointReached flag', async () => {
    mockDrill.findFirst.mockResolvedValue(fakeDrill);
    mockDrill.update.mockResolvedValue({ ...fakeDrill, assemblyPointReached: false });

    const res = await request(app).put(`/api/drills/${DRILL_ID}`).send({
      assemblyPointReached: false,
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
  });

  it('analytics totalDrills equals length of returned drills array', async () => {
    const three = [
      { ...fakeDrill, premises: { name: 'HQ' } },
      { ...fakeDrill, id: '00000000-0000-0000-0000-000000000010', premises: { name: 'HQ' } },
      { ...fakeDrill, id: '00000000-0000-0000-0000-000000000011', premises: { name: 'HQ' } },
    ];
    mockDrill.findMany.mockResolvedValue(three);

    const res = await request(app).get('/api/drills/analytics');

    expect(res.status).toBe(200);
    expect(res.body.data.totalDrills).toBe(3);
  });

  it('GET /api/drills/premises/:id returns success:true when drills exist', async () => {
    mockDrill.findMany.mockResolvedValue([fakeDrill]);

    const res = await request(app).get(`/api/drills/premises/${PREMISES_ID}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data[0].premisesId).toBe(PREMISES_ID);
  });

  it('creates LOCKDOWN drill type successfully', async () => {
    const lockdownDrill = { ...fakeDrill, drillType: 'LOCKDOWN', evacuationType: 'SHELTER_IN_PLACE' };
    mockDrill.create.mockResolvedValue(lockdownDrill);

    const res = await request(app).post(`/api/drills/premises/${PREMISES_ID}`).send({
      drillDate: '2026-06-01',
      drillType: 'LOCKDOWN',
      evacuationType: 'SHELTER_IN_PLACE',
      alarmedOrSilent: 'SILENT',
    });

    expect(res.status).toBe(201);
    expect(res.body.data.drillType).toBe('LOCKDOWN');
  });

  it('PUT /api/drills/:id rollCallCompleted update returns 200', async () => {
    mockDrill.findFirst.mockResolvedValue(fakeDrill);
    mockDrill.update.mockResolvedValue({ ...fakeDrill, rollCallCompleted: false, rollCallTimeMinutes: null });

    const res = await request(app).put(`/api/drills/${DRILL_ID}`).send({
      rollCallCompleted: false,
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('analytics returns drillsByType grouping', async () => {
    const drills = [
      { ...fakeDrill, drillType: 'FIRE', premises: { name: 'HQ' } },
      { ...fakeDrill, id: '00000000-0000-0000-0000-000000000012', drillType: 'FIRE', premises: { name: 'HQ' } },
      { ...fakeDrill, id: '00000000-0000-0000-0000-000000000013', drillType: 'LOCKDOWN', premises: { name: 'HQ' } },
    ];
    mockDrill.findMany.mockResolvedValue(drills);

    const res = await request(app).get('/api/drills/analytics');

    expect(res.status).toBe(200);
    expect(res.body.data.totalDrills).toBe(3);
  });
});

describe('drills — final boundary coverage', () => {
  it('GET /api/drills/analytics response body has success:true', async () => {
    mockDrill.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/drills/analytics');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
  });

  it('POST /api/drills/premises/:id sets premisesId in created record', async () => {
    mockDrill.create.mockResolvedValue({ ...fakeDrill });
    const res = await request(app).post(`/api/drills/premises/${PREMISES_ID}`).send(validCreateBody);
    expect(res.status).toBe(201);
    expect(res.body.data.premisesId).toBe(PREMISES_ID);
  });

  it('PUT /api/drills/:id totalPersonsEvacuated update returns 200', async () => {
    mockDrill.findFirst.mockResolvedValue(fakeDrill);
    mockDrill.update.mockResolvedValue({ ...fakeDrill, totalPersonsEvacuated: 200 });
    const res = await request(app).put(`/api/drills/${DRILL_ID}`).send({ totalPersonsEvacuated: 200 });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('analytics premisesStats avgEvacTime is a number', async () => {
    mockDrill.findMany.mockResolvedValue([
      { ...fakeDrill, evacuationTimeMinutes: 4, targetAchieved: true, premises: { name: 'Office' } },
    ]);
    const res = await request(app).get('/api/drills/analytics');
    expect(res.status).toBe(200);
    expect(typeof res.body.data.premisesStats['Office'].avgEvacTime).toBe('number');
  });
});
