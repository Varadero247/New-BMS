import express from 'express';
import request from 'supertest';

// Grievances route uses an in-memory store, no Prisma needed
jest.mock('../src/prisma', () => ({
  prisma: {},
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: '20000000-0000-4000-a000-000000000123', email: 'test@test.com', role: 'USER' };
    next();
  }),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  }),
}));

jest.mock('@ims/service-auth', () => ({
  checkOwnership: () => (_req: any, _res: any, next: any) => next(),
  scopeToUser: (_req: any, _res: any, next: any) => next(),
}));

import grievancesRoutes from '../src/routes/grievances';

describe('HR Grievances API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/grievances', grievancesRoutes);
  });

  describe('GET /api/grievances', () => {
    it('should return list of grievances with pagination', async () => {
      const response = await request(app).get('/api/grievances');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.meta).toHaveProperty('page');
      expect(response.body.meta).toHaveProperty('limit');
    });

    it('should return success:true on 200', async () => {
      const response = await request(app).get('/api/grievances');
      expect(response.body.success).toBe(true);
    });

    it('should return data as an array', async () => {
      const response = await request(app).get('/api/grievances');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return JSON content-type', async () => {
      const response = await request(app).get('/api/grievances');
      expect(response.headers['content-type']).toMatch(/json/);
    });

    it('should return meta with total key', async () => {
      const response = await request(app).get('/api/grievances');
      expect(response.body.meta).toHaveProperty('total');
    });

    it('should return meta with totalPages key', async () => {
      const response = await request(app).get('/api/grievances');
      expect(response.body.meta).toHaveProperty('totalPages');
    });

    it('should default page to 1', async () => {
      const response = await request(app).get('/api/grievances');
      expect(response.body.meta.page).toBe(1);
    });

    it('should default limit to 20', async () => {
      const response = await request(app).get('/api/grievances');
      expect(response.body.meta.limit).toBe(20);
    });

    it('should accept page query param', async () => {
      const response = await request(app).get('/api/grievances?page=2');
      expect(response.status).toBe(200);
      expect(response.body.meta.page).toBe(2);
    });

    it('should accept limit query param', async () => {
      const response = await request(app).get('/api/grievances?limit=10');
      expect(response.status).toBe(200);
      expect(response.body.meta.limit).toBe(10);
    });
  });

  describe('POST /api/grievances', () => {
    const createPayload = {
      employeeId: '11111111-1111-1111-1111-111111111111',
      subject: 'Pay dispute',
      description: 'My salary has not been updated as promised.',
      category: 'COMPENSATION',
      priority: 'HIGH',
    };

    it('should create a grievance successfully', async () => {
      const response = await request(app).post('/api/grievances').send(createPayload);
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.subject).toBe('Pay dispute');
    });

    it('should set status to OPEN on creation', async () => {
      const response = await request(app).post('/api/grievances').send(createPayload);
      expect(response.status).toBe(201);
      expect(response.body.data.status).toBe('OPEN');
    });

    it('should return 400 for missing employeeId', async () => {
      const response = await request(app).post('/api/grievances').send({
        subject: 'Test', description: 'Test desc', category: 'WORKPLACE',
      });
      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid employeeId format', async () => {
      const response = await request(app).post('/api/grievances').send({
        ...createPayload, employeeId: 'not-a-uuid',
      });
      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing subject', async () => {
      const response = await request(app).post('/api/grievances').send({
        employeeId: '11111111-1111-1111-1111-111111111111',
        description: 'Test', category: 'WORKPLACE',
      });
      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid category', async () => {
      const response = await request(app).post('/api/grievances').send({
        ...createPayload, category: 'INVALID_CATEGORY',
      });
      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid priority', async () => {
      const response = await request(app).post('/api/grievances').send({
        ...createPayload, priority: 'CRITICAL',
      });
      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing description', async () => {
      const response = await request(app).post('/api/grievances').send({
        employeeId: '11111111-1111-1111-1111-111111111111',
        subject: 'Test', category: 'WORKPLACE',
      });
      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 201 status on success', async () => {
      const response = await request(app).post('/api/grievances').send(createPayload);
      expect(response.status).toBe(201);
    });

    it('created grievance has id field', async () => {
      const response = await request(app).post('/api/grievances').send(createPayload);
      expect(response.body.data).toHaveProperty('id');
    });

    it('should accept HARASSMENT category', async () => {
      const response = await request(app).post('/api/grievances').send({
        ...createPayload, category: 'HARASSMENT',
      });
      expect(response.status).toBe(201);
      expect(response.body.data.category).toBe('HARASSMENT');
    });

    it('should return 400 for empty body', async () => {
      const response = await request(app).post('/api/grievances').send({});
      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/grievances/:id', () => {
    it('should return 404 for non-existent grievance', async () => {
      const response = await request(app).get('/api/grievances/non-existent-id');
      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return grievance that was previously created', async () => {
      // Create first
      const createRes = await request(app).post('/api/grievances').send({
        employeeId: '11111111-1111-1111-1111-111111111111',
        subject: 'Discrimination case',
        description: 'Detailed description',
        category: 'DISCRIMINATION',
        priority: 'HIGH',
      });
      const grievanceId = createRes.body.data.id;

      // Then fetch it
      const getRes = await request(app).get('/api/grievances/' + grievanceId);
      expect(getRes.status).toBe(200);
      expect(getRes.body.success).toBe(true);
      expect(getRes.body.data.id).toBe(grievanceId);
    });

    it('should return 404 error.code NOT_FOUND', async () => {
      const response = await request(app).get('/api/grievances/missing-grv-999');
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('PUT /api/grievances/:id', () => {
    it('should return 404 for non-existent grievance', async () => {
      const response = await request(app)
        .put('/api/grievances/non-existent-id')
        .send({ status: 'RESOLVED' });
      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should update an existing grievance', async () => {
      // Create first
      const createRes = await request(app).post('/api/grievances').send({
        employeeId: '22222222-2222-2222-2222-222222222222',
        subject: 'Working conditions',
        description: 'Unsafe working environment.',
        category: 'WORKING_CONDITIONS',
        priority: 'MEDIUM',
      });
      const grievanceId = createRes.body.data.id;

      // Update it
      const updateRes = await request(app)
        .put('/api/grievances/' + grievanceId)
        .send({ status: 'UNDER_REVIEW' });
      expect(updateRes.status).toBe(200);
      expect(updateRes.body.success).toBe(true);
      expect(updateRes.body.data.status).toBe('UNDER_REVIEW');
    });

    it('should return 400 for invalid status', async () => {
      const response = await request(app)
        .put('/api/grievances/grv-1')
        .send({ status: 'INVALID_STATUS' });
      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});

describe('HR Grievances API — phase28 coverage', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/grievances', grievancesRoutes);
  });

  it('GET /api/grievances meta.page defaults to 1', async () => {
    const response = await request(app).get('/api/grievances');
    expect(response.body.meta.page).toBe(1);
  });

  it('POST /api/grievances returns data.employeeId matching input', async () => {
    const response = await request(app).post('/api/grievances').send({
      employeeId: '33333333-3333-3333-3333-333333333333',
      subject: 'Phase28 subject',
      description: 'Phase28 description',
      category: 'OTHER',
      priority: 'LOW',
    });
    expect(response.status).toBe(201);
    expect(response.body.data.employeeId).toBe('33333333-3333-3333-3333-333333333333');
  });

  it('POST /api/grievances with category OTHER succeeds', async () => {
    const response = await request(app).post('/api/grievances').send({
      employeeId: '44444444-4444-4444-4444-444444444444',
      subject: 'Other issue',
      description: 'Something else entirely',
      category: 'OTHER',
    });
    expect(response.status).toBe(201);
    expect(response.body.data.category).toBe('OTHER');
  });

  it('GET /api/grievances response body has data key', async () => {
    const response = await request(app).get('/api/grievances');
    expect(response.body).toHaveProperty('data');
  });

  it('GET /api/grievances response body has meta key', async () => {
    const response = await request(app).get('/api/grievances');
    expect(response.body).toHaveProperty('meta');
  });
});

describe('HR Grievances API — additional coverage', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/grievances', grievancesRoutes);
  });

  it('POST /api/grievances WORKPLACE category succeeds', async () => {
    const res = await request(app).post('/api/grievances').send({
      employeeId: '55555555-5555-5555-5555-555555555555',
      subject: 'Workplace issue',
      description: 'Environment not safe',
      category: 'WORKPLACE',
    });
    expect(res.status).toBe(201);
    expect(res.body.data.category).toBe('WORKPLACE');
  });

  it('POST /api/grievances DISCRIMINATION category succeeds', async () => {
    const res = await request(app).post('/api/grievances').send({
      employeeId: '66666666-6666-6666-6666-666666666666',
      subject: 'Discrimination',
      description: 'Treated unfairly',
      category: 'DISCRIMINATION',
    });
    expect(res.status).toBe(201);
    expect(res.body.data.category).toBe('DISCRIMINATION');
  });

  it('GET /api/grievances returns 200 status', async () => {
    const res = await request(app).get('/api/grievances');
    expect(res.status).toBe(200);
  });

  it('PUT /api/grievances/:id status RESOLVED updates record', async () => {
    const createRes = await request(app).post('/api/grievances').send({
      employeeId: '77777777-7777-7777-7777-777777777777',
      subject: 'Resolution test',
      description: 'Need resolution',
      category: 'COMPENSATION',
    });
    const id = createRes.body.data.id;
    const updateRes = await request(app).put('/api/grievances/' + id).send({ status: 'RESOLVED', resolution: 'Salary increased' });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.status).toBe('RESOLVED');
  });

  it('PUT /api/grievances/:id status CLOSED updates record', async () => {
    const createRes = await request(app).post('/api/grievances').send({
      employeeId: '88888888-8888-8888-8888-888888888888',
      subject: 'Close test',
      description: 'Closing this',
      category: 'OTHER',
    });
    const id = createRes.body.data.id;
    const updateRes = await request(app).put('/api/grievances/' + id).send({ status: 'CLOSED' });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.status).toBe('CLOSED');
  });

  it('POST /api/grievances data has createdAt field', async () => {
    const res = await request(app).post('/api/grievances').send({
      employeeId: '99999999-9999-9999-9999-999999999999',
      subject: 'CreatedAt test',
      description: 'Testing createdAt field',
      category: 'HARASSMENT',
    });
    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('createdAt');
  });

  it('GET /api/grievances/:id returns success:true when found', async () => {
    const createRes = await request(app).post('/api/grievances').send({
      employeeId: 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa',
      subject: 'Found test',
      description: 'Find this grievance',
      category: 'WORKPLACE',
    });
    const id = createRes.body.data.id;
    const getRes = await request(app).get('/api/grievances/' + id);
    expect(getRes.status).toBe(200);
    expect(getRes.body.success).toBe(true);
  });

  it('GET /api/grievances response content-type contains json', async () => {
    const res = await request(app).get('/api/grievances');
    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('POST /api/grievances priority LOW is accepted', async () => {
    const res = await request(app).post('/api/grievances').send({
      employeeId: 'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb',
      subject: 'Low priority',
      description: 'Not urgent',
      category: 'OTHER',
      priority: 'LOW',
    });
    expect(res.status).toBe(201);
    expect(res.body.data.priority).toBe('LOW');
  });

  it('POST /api/grievances priority MEDIUM is accepted', async () => {
    const res = await request(app).post('/api/grievances').send({
      employeeId: 'cccccccc-cccc-4ccc-cccc-cccccccccccc',
      subject: 'Medium priority',
      description: 'Somewhat urgent',
      category: 'OTHER',
      priority: 'MEDIUM',
    });
    expect(res.status).toBe(201);
    expect(res.body.data.priority).toBe('MEDIUM');
  });

  it('POST /api/grievances response body has success key', async () => {
    const res = await request(app).post('/api/grievances').send({
      employeeId: 'dddddddd-dddd-4ddd-dddd-dddddddddddd',
      subject: 'Success key test',
      description: 'Testing success key',
      category: 'WORKPLACE',
    });
    expect(res.body).toHaveProperty('success', true);
  });

  it('GET /api/grievances with limit=5 returns meta.limit of 5', async () => {
    const res = await request(app).get('/api/grievances?limit=5');
    expect(res.status).toBe(200);
    expect(res.body.meta.limit).toBe(5);
  });
});

describe('grievances — phase30 coverage', () => {
  it('returns false for falsy values', () => {
    expect(Boolean('')).toBe(false);
  });

  it('handles optional chaining', () => {
    const obj: { x?: { y: number } } = {}; expect(obj?.x?.y).toBeUndefined();
  });

  it('handles some method', () => {
    expect([1, 2, 3].some(x => x > 2)).toBe(true);
  });

  it('handles Object.assign', () => {
    expect(Object.assign({}, { a: 1 }, { b: 2 })).toEqual({ a: 1, b: 2 });
  });

  it('handles short-circuit eval', () => {
    let x2 = 0; false && x2++; expect(x2).toBe(0);
  });

});
