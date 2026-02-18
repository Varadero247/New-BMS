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
    (prisma as any).portalTicket.findMany.mockResolvedValue(items);
    (prisma as any).portalTicket.count.mockResolvedValue(1);

    const res = await request(app).get('/api/portal/tickets');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('should filter by status', async () => {
    (prisma as any).portalTicket.findMany.mockResolvedValue([]);
    (prisma as any).portalTicket.count.mockResolvedValue(0);

    const res = await request(app).get('/api/portal/tickets?status=OPEN');

    expect(res.status).toBe(200);
  });

  it('should handle server error', async () => {
    (prisma as any).portalTicket.findMany.mockRejectedValue(new Error('DB error'));

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
    (prisma as any).portalTicket.create.mockResolvedValue(ticket);

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
    (prisma as any).portalTicket.findFirst.mockResolvedValue(ticket);

    const res = await request(app).get('/api/portal/tickets/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.messages).toHaveLength(1);
  });

  it('should return 404 if not found', async () => {
    (prisma as any).portalTicket.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/portal/tickets/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });
});

describe('PUT /api/portal/tickets/:id', () => {
  it('should update a ticket', async () => {
    (prisma as any).portalTicket.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    (prisma as any).portalTicket.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      priority: 'LOW',
    });

    const res = await request(app)
      .put('/api/portal/tickets/00000000-0000-0000-0000-000000000001')
      .send({ priority: 'LOW' });

    expect(res.status).toBe(200);
  });

  it('should return 404 for update if not found', async () => {
    (prisma as any).portalTicket.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/portal/tickets/00000000-0000-0000-0000-000000000099')
      .send({ priority: 'LOW' });

    expect(res.status).toBe(404);
  });
});

describe('POST /api/portal/tickets/:id/messages', () => {
  it('should add a message', async () => {
    const ticket = { id: '00000000-0000-0000-0000-000000000001', status: 'OPEN' };
    (prisma as any).portalTicket.findFirst.mockResolvedValue(ticket);
    (prisma as any).portalTicketMessage.create.mockResolvedValue({
      id: 'm-1',
      ticketId: 't-1',
      message: 'Hello',
    });
    (prisma as any).portalTicket.update.mockResolvedValue({ ...ticket, status: 'IN_PROGRESS' });

    const res = await request(app)
      .post('/api/portal/tickets/00000000-0000-0000-0000-000000000001/messages')
      .send({ message: 'Hello' });

    expect(res.status).toBe(201);
  });

  it('should return 404 if ticket not found for message', async () => {
    (prisma as any).portalTicket.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/portal/tickets/00000000-0000-0000-0000-000000000099/messages')
      .send({ message: 'Hello' });

    expect(res.status).toBe(404);
  });
});

describe('GET /api/portal/tickets/:id/messages', () => {
  it('should list messages', async () => {
    (prisma as any).portalTicket.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    (prisma as any).portalTicketMessage.findMany.mockResolvedValue([
      { id: 'm-1', message: 'Hello' },
    ]);

    const res = await request(app).get(
      '/api/portal/tickets/00000000-0000-0000-0000-000000000001/messages'
    );

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('should return 404 if ticket not found for messages', async () => {
    (prisma as any).portalTicket.findFirst.mockResolvedValue(null);

    const res = await request(app).get(
      '/api/portal/tickets/00000000-0000-0000-0000-000000000099/messages'
    );

    expect(res.status).toBe(404);
  });
});

describe('PUT /api/portal/tickets/:id/resolve', () => {
  it('should resolve a ticket', async () => {
    const ticket = { id: '00000000-0000-0000-0000-000000000001', status: 'IN_PROGRESS' };
    (prisma as any).portalTicket.findFirst.mockResolvedValue(ticket);
    (prisma as any).portalTicket.update.mockResolvedValue({
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
    (prisma as any).portalTicket.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'CLOSED',
    });

    const res = await request(app)
      .put('/api/portal/tickets/00000000-0000-0000-0000-000000000001/resolve')
      .send({});

    expect(res.status).toBe(400);
  });

  it('should return 404 if ticket not found for resolve', async () => {
    (prisma as any).portalTicket.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/portal/tickets/00000000-0000-0000-0000-000000000099/resolve')
      .send({});

    expect(res.status).toBe(404);
  });
});
