import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    femEmergencyIncident: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    femIncidentTimelineEvent: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    femIncidentDecisionLog: {
      create: jest.fn(),
    },
    femIncidentResourceLog: {
      create: jest.fn(),
    },
    femIncidentCommunicationLog: {
      create: jest.fn(),
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

import router from '../src/routes/incidents';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/incidents', router);

beforeEach(() => {
  jest.clearAllMocks();
});

const mockIncident = jest.mocked(prisma.femEmergencyIncident);
const mockTimeline = jest.mocked(prisma.femIncidentTimelineEvent);
const mockDecision = jest.mocked(prisma.femIncidentDecisionLog);
const mockResource = jest.mocked(prisma.femIncidentResourceLog);
const mockComm = jest.mocked(prisma.femIncidentCommunicationLog);

const INCIDENT_ID = '00000000-0000-0000-0000-000000000001';

const fakeIncident = {
  id: INCIDENT_ID,
  incidentNumber: 'INC-2026-0001',
  emergencyType: 'FIRE',
  severity: 'MAJOR',
  status: 'ACTIVE',
  title: 'Office Fire',
  description: 'Fire detected on 2nd floor',
  organisationId: 'org-1',
  reportedAt: new Date().toISOString(),
  activatedAt: new Date().toISOString(),
};

const validDeclareBody = {
  emergencyType: 'FIRE',
  severity: 'MAJOR',
  title: 'Office Fire',
  description: 'Fire detected on 2nd floor',
};

describe('GET /api/incidents', () => {
  it('returns list of incidents with pagination', async () => {
    mockIncident.findMany.mockResolvedValue([fakeIncident]);
    mockIncident.count.mockResolvedValue(1);

    const res = await request(app).get('/api/incidents');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data[0].incidentNumber).toBe('INC-2026-0001');
    expect(res.body.pagination.total).toBe(1);
  });

  it('returns empty list when no incidents', async () => {
    mockIncident.findMany.mockResolvedValue([]);
    mockIncident.count.mockResolvedValue(0);

    const res = await request(app).get('/api/incidents');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it('filters by status', async () => {
    mockIncident.findMany.mockResolvedValue([fakeIncident]);
    mockIncident.count.mockResolvedValue(1);

    const res = await request(app).get('/api/incidents?status=ACTIVE');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('filters by emergencyType', async () => {
    mockIncident.findMany.mockResolvedValue([fakeIncident]);
    mockIncident.count.mockResolvedValue(1);

    const res = await request(app).get('/api/incidents?emergencyType=FIRE');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns 500 on database error', async () => {
    mockIncident.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/incidents');

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('GET /api/incidents/active', () => {
  it('returns only active incidents', async () => {
    mockIncident.findMany.mockResolvedValue([fakeIncident]);

    const res = await request(app).get('/api/incidents/active');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('returns empty array when no active incidents', async () => {
    mockIncident.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/incidents/active');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });
});

describe('POST /api/incidents', () => {
  it('declares a new incident and returns 201', async () => {
    mockIncident.count.mockResolvedValue(0);
    mockIncident.create.mockResolvedValue(fakeIncident);
    mockTimeline.create.mockResolvedValue({ id: 'tl-1' });

    const res = await request(app).post('/api/incidents').send(validDeclareBody);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.incidentNumber).toBe('INC-2026-0001');
  });

  it('returns 400 when title is missing', async () => {
    const res = await request(app).post('/api/incidents').send({
      emergencyType: 'FIRE',
      severity: 'MAJOR',
      description: 'Fire on 2nd floor',
    });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when emergencyType is invalid', async () => {
    const res = await request(app).post('/api/incidents').send({
      emergencyType: 'UNKNOWN_TYPE',
      severity: 'MAJOR',
      title: 'Test',
      description: 'Test',
    });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when severity is invalid', async () => {
    const res = await request(app).post('/api/incidents').send({
      emergencyType: 'FIRE',
      severity: 'EXTREME',
      title: 'Test',
      description: 'Test',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('creates incident with evacuation fields', async () => {
    const withEvac = {
      ...fakeIncident,
      evacuationOrdered: true,
      evacuationType: 'FULL_EVACUATION',
    };
    mockIncident.count.mockResolvedValue(0);
    mockIncident.create.mockResolvedValue(withEvac);
    mockTimeline.create.mockResolvedValue({ id: 'tl-1' });

    const res = await request(app)
      .post('/api/incidents')
      .send({
        ...validDeclareBody,
        evacuationOrdered: true,
        evacuationType: 'FULL_EVACUATION',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.evacuationOrdered).toBe(true);
  });
});

describe('GET /api/incidents/:id', () => {
  it('returns a single incident with logs', async () => {
    mockIncident.findFirst.mockResolvedValue({
      ...fakeIncident,
      decisions: [],
      resourceDeployments: [],
      communications: [],
      timeline: [],
    });

    const res = await request(app).get(`/api/incidents/${INCIDENT_ID}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(INCIDENT_ID);
  });

  it('returns 404 when incident does not exist', async () => {
    mockIncident.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/incidents/00000000-0000-0000-0000-000000000999');

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

describe('PUT /api/incidents/:id', () => {
  it('updates an incident', async () => {
    const updated = { ...fakeIncident, status: 'CONTAINED', containedAt: new Date().toISOString() };
    mockIncident.findFirst.mockResolvedValue(fakeIncident);
    mockIncident.update.mockResolvedValue(updated);
    mockTimeline.create.mockResolvedValue({ id: 'tl-2' });

    const res = await request(app)
      .put(`/api/incidents/${INCIDENT_ID}`)
      .send({ status: 'CONTAINED' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('CONTAINED');
  });

  it('returns 404 when incident does not exist on update', async () => {
    mockIncident.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/incidents/00000000-0000-0000-0000-000000000999')
      .send({ status: 'CONTAINED' });

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

describe('POST /api/incidents/:id/close', () => {
  it('closes an incident and returns updated data', async () => {
    const closed = { ...fakeIncident, status: 'CLOSED', closedAt: new Date().toISOString() };
    mockIncident.findFirst.mockResolvedValue(fakeIncident);
    mockIncident.update.mockResolvedValue(closed);
    mockTimeline.create.mockResolvedValue({ id: 'tl-close' });

    const res = await request(app).post(`/api/incidents/${INCIDENT_ID}/close`).send({
      lessonsLearned: 'Improve escape route signage',
      rootCauseCategory: 'EQUIPMENT_FAILURE',
      riddorReportable: false,
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('CLOSED');
  });

  it('returns 404 when incident does not exist on close', async () => {
    mockIncident.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/incidents/00000000-0000-0000-0000-000000000999/close')
      .send({});

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

describe('POST /api/incidents/:id/decision', () => {
  it('logs a decision for an incident', async () => {
    const decision = {
      id: 'dec-1',
      incidentId: INCIDENT_ID,
      decisionMaker: 'Incident Commander',
      decisionMade: 'Evacuate north wing',
    };
    mockIncident.findFirst.mockResolvedValue(fakeIncident);
    mockDecision.create.mockResolvedValue(decision);
    mockTimeline.create.mockResolvedValue({ id: 'tl-3' });

    const res = await request(app).post(`/api/incidents/${INCIDENT_ID}/decision`).send({
      decisionMaker: 'Incident Commander',
      situationSummary: 'Fire spreading in north wing',
      decisionMade: 'Evacuate north wing',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.decisionMade).toBe('Evacuate north wing');
  });

  it('returns 400 when decisionMade is missing', async () => {
    const res = await request(app).post(`/api/incidents/${INCIDENT_ID}/decision`).send({
      decisionMaker: 'IC',
      situationSummary: 'Fire',
    });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 404 when incident not found for decision', async () => {
    mockIncident.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/incidents/00000000-0000-0000-0000-000000000999/decision')
      .send({
        decisionMaker: 'IC',
        situationSummary: 'Fire',
        decisionMade: 'Evacuate',
      });

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

describe('POST /api/incidents/:id/resource', () => {
  it('logs a resource deployment', async () => {
    const resourceLog = {
      id: 'res-1',
      incidentId: INCIDENT_ID,
      resourceType: 'FIRE_ENGINE',
      resourceName: 'Engine 1',
    };
    mockIncident.findFirst.mockResolvedValue(fakeIncident);
    mockResource.create.mockResolvedValue(resourceLog);
    mockTimeline.create.mockResolvedValue({ id: 'tl-4' });

    const res = await request(app).post(`/api/incidents/${INCIDENT_ID}/resource`).send({
      resourceType: 'FIRE_ENGINE',
      resourceName: 'Engine 1',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.resourceType).toBe('FIRE_ENGINE');
  });

  it('returns 400 when resourceType is missing', async () => {
    const res = await request(app).post(`/api/incidents/${INCIDENT_ID}/resource`).send({
      resourceName: 'Engine 1',
    });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 404 when incident not found for resource', async () => {
    mockIncident.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/incidents/00000000-0000-0000-0000-000000000999/resource')
      .send({
        resourceType: 'AMBULANCE',
        resourceName: 'Amb 1',
      });

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

describe('POST /api/incidents/:id/communication', () => {
  it('logs a communication entry', async () => {
    const commLog = {
      id: 'comm-1',
      incidentId: INCIDENT_ID,
      communicationType: 'INTERNAL',
      recipient: 'All Staff',
      method: 'EMAIL',
      messageContent: 'Evacuate now',
    };
    mockIncident.findFirst.mockResolvedValue(fakeIncident);
    mockComm.create.mockResolvedValue(commLog);
    mockTimeline.create.mockResolvedValue({ id: 'tl-5' });

    const res = await request(app).post(`/api/incidents/${INCIDENT_ID}/communication`).send({
      communicationType: 'INTERNAL',
      recipient: 'All Staff',
      method: 'EMAIL',
      messageContent: 'Evacuate now',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.communicationType).toBe('INTERNAL');
  });

  it('returns 400 when messageContent is missing', async () => {
    const res = await request(app).post(`/api/incidents/${INCIDENT_ID}/communication`).send({
      communicationType: 'INTERNAL',
      recipient: 'All Staff',
      method: 'EMAIL',
    });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 404 when incident not found for communication', async () => {
    mockIncident.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/incidents/00000000-0000-0000-0000-000000000999/communication')
      .send({
        communicationType: 'EXTERNAL',
        recipient: 'Press',
        method: 'PHONE',
        messageContent: 'Incident contained',
      });

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

describe('POST /api/incidents/:id/timeline', () => {
  it('adds a timeline event', async () => {
    const event = {
      id: 'evt-1',
      incidentId: INCIDENT_ID,
      eventType: 'UPDATE',
      description: 'Water supply cut',
    };
    mockIncident.findFirst.mockResolvedValue(fakeIncident);
    mockTimeline.create.mockResolvedValue(event);

    const res = await request(app).post(`/api/incidents/${INCIDENT_ID}/timeline`).send({
      eventType: 'UPDATE',
      description: 'Water supply cut',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.eventType).toBe('UPDATE');
  });

  it('returns 400 when description is missing', async () => {
    const res = await request(app).post(`/api/incidents/${INCIDENT_ID}/timeline`).send({
      eventType: 'UPDATE',
    });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 404 when incident not found for timeline', async () => {
    mockIncident.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/incidents/00000000-0000-0000-0000-000000000999/timeline')
      .send({
        eventType: 'UPDATE',
        description: 'Some update',
      });

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

describe('GET /api/incidents/:id/timeline', () => {
  it('returns the chronological timeline for an incident', async () => {
    const events = [
      {
        id: 'evt-1',
        incidentId: INCIDENT_ID,
        eventType: 'DECLARED',
        description: 'Declared',
        timestamp: new Date().toISOString(),
      },
      {
        id: 'evt-2',
        incidentId: INCIDENT_ID,
        eventType: 'UPDATE',
        description: 'Fire spreading',
        timestamp: new Date().toISOString(),
      },
    ];
    mockTimeline.findMany.mockResolvedValue(events);

    const res = await request(app).get(`/api/incidents/${INCIDENT_ID}/timeline`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
  });

  it('returns empty array when no timeline events', async () => {
    mockTimeline.findMany.mockResolvedValue([]);

    const res = await request(app).get(`/api/incidents/${INCIDENT_ID}/timeline`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });
});
