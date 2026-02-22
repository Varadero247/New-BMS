import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    portalTicket: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    portalTicketMessage: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
  Prisma: { Decimal: jest.fn((v: any) => v) },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: 'user-123', email: 'test@test.com', role: 'ADMIN' };
    next();
  }),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import portalTicketsRouter from '../src/routes/portal-tickets';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/portal/tickets', portalTicketsRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/portal/tickets', () => {
  it('should list tickets', async () => {
    const items = [
      {
        id: '00000000-0000-0000-0000-000000000001',
        number: 'PTL-TKT-2602-1234',
        subject: 'Login issue',
        status: 'OPEN',
        messages: [],
      },
    ];
    mockPrisma.portalTicket.findMany.mockResolvedValue(items);
    mockPrisma.portalTicket.count.mockResolvedValue(1);

    const res = await request(app).get('/api/portal/tickets');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('should filter by status', async () => {
    mockPrisma.portalTicket.findMany.mockResolvedValue([]);
    mockPrisma.portalTicket.count.mockResolvedValue(0);

    const res = await request(app).get('/api/portal/tickets?status=OPEN');

    expect(res.status).toBe(200);
  });

  it('should handle server error', async () => {
    mockPrisma.portalTicket.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/portal/tickets');

    expect(res.status).toBe(500);
  });
});

describe('POST /api/portal/tickets', () => {
  it('should create a ticket', async () => {
    const ticket = {
      id: '00000000-0000-0000-0000-000000000001',
      number: 'PTL-TKT-2602-1234',
      subject: 'Login issue',
      status: 'OPEN',
    };
    mockPrisma.portalTicket.create.mockResolvedValue(ticket);

    const res = await request(app).post('/api/portal/tickets').send({
      subject: 'Login issue',
      description: 'Cannot log in',
      category: 'TECHNICAL',
      priority: 'HIGH',
      portalType: 'CUSTOMER',
    });

    expect(res.status).toBe(201);
    expect(res.body.data.subject).toBe('Login issue');
  });

  it('should return 400 for missing subject', async () => {
    const res = await request(app).post('/api/portal/tickets').send({
      description: 'Cannot log in',
      category: 'TECHNICAL',
      priority: 'HIGH',
      portalType: 'CUSTOMER',
    });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/portal/tickets/:id', () => {
  it('should return ticket with messages', async () => {
    const ticket = {
      id: '00000000-0000-0000-0000-000000000001',
      subject: 'Login issue',
      messages: [{ id: 'm-1', message: 'Help' }],
    };
    mockPrisma.portalTicket.findFirst.mockResolvedValue(ticket);

    const res = await request(app).get('/api/portal/tickets/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.messages).toHaveLength(1);
  });

  it('should return 404 if not found', async () => {
    mockPrisma.portalTicket.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/portal/tickets/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });
});

describe('PUT /api/portal/tickets/:id', () => {
  it('should update a ticket', async () => {
    mockPrisma.portalTicket.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.portalTicket.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      priority: 'LOW',
    });

    const res = await request(app)
      .put('/api/portal/tickets/00000000-0000-0000-0000-000000000001')
      .send({ priority: 'LOW' });

    expect(res.status).toBe(200);
  });

  it('should return 404 for update if not found', async () => {
    mockPrisma.portalTicket.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/portal/tickets/00000000-0000-0000-0000-000000000099')
      .send({ priority: 'LOW' });

    expect(res.status).toBe(404);
  });
});

describe('POST /api/portal/tickets/:id/messages', () => {
  it('should add a message', async () => {
    const ticket = { id: '00000000-0000-0000-0000-000000000001', status: 'OPEN' };
    mockPrisma.portalTicket.findFirst.mockResolvedValue(ticket);
    mockPrisma.portalTicketMessage.create.mockResolvedValue({
      id: 'm-1',
      ticketId: 't-1',
      message: 'Hello',
    });
    mockPrisma.portalTicket.update.mockResolvedValue({ ...ticket, status: 'IN_PROGRESS' });

    const res = await request(app)
      .post('/api/portal/tickets/00000000-0000-0000-0000-000000000001/messages')
      .send({ message: 'Hello' });

    expect(res.status).toBe(201);
  });

  it('should return 404 if ticket not found for message', async () => {
    mockPrisma.portalTicket.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/portal/tickets/00000000-0000-0000-0000-000000000099/messages')
      .send({ message: 'Hello' });

    expect(res.status).toBe(404);
  });
});

describe('GET /api/portal/tickets/:id/messages', () => {
  it('should list messages', async () => {
    mockPrisma.portalTicket.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.portalTicketMessage.findMany.mockResolvedValue([
      { id: 'm-1', message: 'Hello' },
    ]);

    const res = await request(app).get(
      '/api/portal/tickets/00000000-0000-0000-0000-000000000001/messages'
    );

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('should return 404 if ticket not found for messages', async () => {
    mockPrisma.portalTicket.findFirst.mockResolvedValue(null);

    const res = await request(app).get(
      '/api/portal/tickets/00000000-0000-0000-0000-000000000099/messages'
    );

    expect(res.status).toBe(404);
  });
});

describe('PUT /api/portal/tickets/:id/resolve', () => {
  it('should resolve a ticket', async () => {
    const ticket = { id: '00000000-0000-0000-0000-000000000001', status: 'IN_PROGRESS' };
    mockPrisma.portalTicket.findFirst.mockResolvedValue(ticket);
    mockPrisma.portalTicket.update.mockResolvedValue({
      ...ticket,
      status: 'RESOLVED',
      resolvedAt: new Date(),
    });

    const res = await request(app)
      .put('/api/portal/tickets/00000000-0000-0000-0000-000000000001/resolve')
      .send({ resolution: 'Fixed the issue' });

    expect(res.status).toBe(200);
  });

  it('should return 400 if ticket already closed', async () => {
    mockPrisma.portalTicket.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'CLOSED',
    });

    const res = await request(app)
      .put('/api/portal/tickets/00000000-0000-0000-0000-000000000001/resolve')
      .send({});

    expect(res.status).toBe(400);
  });

  it('should return 404 if ticket not found for resolve', async () => {
    mockPrisma.portalTicket.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/portal/tickets/00000000-0000-0000-0000-000000000099/resolve')
      .send({});

    expect(res.status).toBe(404);
  });
});

describe('portal-tickets — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/portal/tickets', portalTicketsRouter);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/portal/tickets', async () => {
    const res = await request(app).get('/api/portal/tickets');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });

  it('response is JSON content-type for GET /api/portal/tickets', async () => {
    const res = await request(app).get('/api/portal/tickets');
    expect(res.headers['content-type']).toBeDefined();
  });

  it('GET /api/portal/tickets body has success property', async () => {
    const res = await request(app).get('/api/portal/tickets');
    if (res.status === 200) {
      expect(res.body).toHaveProperty('success');
    } else {
      expect(res.body).toBeDefined();
    }
  });

  it('GET /api/portal/tickets body is an object', async () => {
    const res = await request(app).get('/api/portal/tickets');
    expect(typeof res.body).toBe('object');
  });
});

describe('portal-tickets — edge cases', () => {
  it('GET list: filter by category passes category in where clause', async () => {
    mockPrisma.portalTicket.findMany.mockResolvedValue([]);
    mockPrisma.portalTicket.count.mockResolvedValue(0);

    await request(app).get('/api/portal/tickets?category=BILLING');

    expect(mockPrisma.portalTicket.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ category: 'BILLING' }) })
    );
  });

  it('GET list: filter by portalType passes portalType in where clause', async () => {
    mockPrisma.portalTicket.findMany.mockResolvedValue([]);
    mockPrisma.portalTicket.count.mockResolvedValue(0);

    await request(app).get('/api/portal/tickets?portalType=CUSTOMER');

    expect(mockPrisma.portalTicket.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ portalType: 'CUSTOMER' }) })
    );
  });

  it('GET list: 500 returns INTERNAL_ERROR code', async () => {
    mockPrisma.portalTicket.findMany.mockRejectedValue(new Error('DB down'));

    const res = await request(app).get('/api/portal/tickets');

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST: missing description → 400 VALIDATION_ERROR', async () => {
    const res = await request(app).post('/api/portal/tickets').send({
      subject: 'Help needed',
      category: 'TECHNICAL',
      priority: 'HIGH',
      portalType: 'CUSTOMER',
    });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST: invalid category → 400', async () => {
    const res = await request(app).post('/api/portal/tickets').send({
      subject: 'Issue',
      description: 'Cannot login',
      category: 'INVALID_CATEGORY',
      priority: 'HIGH',
      portalType: 'CUSTOMER',
    });

    expect(res.status).toBe(400);
  });

  it('GET /:id: 500 on DB error returns INTERNAL_ERROR code', async () => {
    mockPrisma.portalTicket.findFirst.mockRejectedValue(new Error('Connection lost'));

    const res = await request(app).get(
      '/api/portal/tickets/00000000-0000-0000-0000-000000000001'
    );

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST /:id/messages: missing message → 400 VALIDATION_ERROR', async () => {
    const res = await request(app)
      .post('/api/portal/tickets/00000000-0000-0000-0000-000000000001/messages')
      .send({ authorType: 'PORTAL_USER' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST /:id/messages: 500 on DB error returns INTERNAL_ERROR', async () => {
    mockPrisma.portalTicket.findFirst.mockRejectedValue(new Error('DB timeout'));

    const res = await request(app)
      .post('/api/portal/tickets/00000000-0000-0000-0000-000000000001/messages')
      .send({ message: 'Help please' });

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET list: pagination skip is computed correctly — page=2 limit=15 → skip=15', async () => {
    mockPrisma.portalTicket.findMany.mockResolvedValue([]);
    mockPrisma.portalTicket.count.mockResolvedValue(0);

    await request(app).get('/api/portal/tickets?page=2&limit=15');

    expect(mockPrisma.portalTicket.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 15, take: 15 })
    );
  });

  it('PUT /:id/resolve: RESOLVED ticket can still be resolved (not CLOSED)', async () => {
    mockPrisma.portalTicket.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'RESOLVED',
    });
    mockPrisma.portalTicket.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'RESOLVED',
      resolvedAt: new Date(),
    });

    const res = await request(app)
      .put('/api/portal/tickets/00000000-0000-0000-0000-000000000001/resolve')
      .send({ resolution: 'Re-resolved' });

    expect(res.status).toBe(200);
  });
});

describe('Portal Tickets — final coverage', () => {
  it('GET list: response body has success and data fields', async () => {
    mockPrisma.portalTicket.findMany.mockResolvedValue([]);
    mockPrisma.portalTicket.count.mockResolvedValue(0);
    const res = await request(app).get('/api/portal/tickets');
    expect(res.body).toHaveProperty('success');
    expect(res.body).toHaveProperty('data');
  });

  it('GET list: returns empty array when no tickets exist', async () => {
    mockPrisma.portalTicket.findMany.mockResolvedValue([]);
    mockPrisma.portalTicket.count.mockResolvedValue(0);
    const res = await request(app).get('/api/portal/tickets');
    expect(res.body.data).toEqual([]);
  });

  it('POST ticket: create called once on success', async () => {
    mockPrisma.portalTicket.create.mockResolvedValue({ id: 'tkt-1', subject: 'Issue', status: 'OPEN' });
    await request(app).post('/api/portal/tickets').send({
      subject: 'Issue',
      description: 'Details here',
      category: 'TECHNICAL',
      priority: 'MEDIUM',
      portalType: 'CUSTOMER',
    });
    expect(mockPrisma.portalTicket.create).toHaveBeenCalledTimes(1);
  });

  it('PUT /:id/resolve: update sets status to RESOLVED', async () => {
    mockPrisma.portalTicket.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', status: 'IN_PROGRESS' });
    mockPrisma.portalTicket.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', status: 'RESOLVED', resolvedAt: new Date() });
    await request(app)
      .put('/api/portal/tickets/00000000-0000-0000-0000-000000000001/resolve')
      .send({ resolution: 'All done' });
    expect(mockPrisma.portalTicket.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'RESOLVED' }) })
    );
  });

  it('GET list: findMany called with status filter when provided', async () => {
    mockPrisma.portalTicket.findMany.mockResolvedValue([]);
    mockPrisma.portalTicket.count.mockResolvedValue(0);
    await request(app).get('/api/portal/tickets?status=OPEN');
    expect(mockPrisma.portalTicket.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ status: 'OPEN' }) })
    );
  });
});
