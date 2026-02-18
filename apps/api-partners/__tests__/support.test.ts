import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma-portal', () => ({
  portalPrisma: {
    mktPartnerSupportTicket: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    mktTicketMessage: {
      create: jest.fn(),
    },
  },
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import supportRouter from '../src/routes/support';
import { portalPrisma } from '../src/prisma-portal';

const app = express();
app.use(express.json());
app.use((req: any, _res: any, next: any) => {
  req.partner = { id: 'partner-1' };
  next();
});
app.use('/api/support', supportRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

const mockTicket = {
  id: '00000000-0000-0000-0000-000000000001',
  partnerId: 'partner-1',
  subject: 'Need help with API integration',
  description: 'I cannot connect to the API',
  status: 'OPEN',
  priority: 'MEDIUM',
  slaTarget: new Date(Date.now() + 24 * 60 * 60 * 1000),
  resolvedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  messages: [
    {
      id: 'msg-1',
      ticketId: 'ticket-1',
      senderId: 'partner-1',
      senderType: 'PARTNER',
      body: 'I cannot connect',
      createdAt: new Date(),
    },
  ],
};

describe('GET /api/support', () => {
  it('returns list of tickets', async () => {
    (portalPrisma.mktPartnerSupportTicket.findMany as jest.Mock).mockResolvedValue([mockTicket]);
    const res = await request(app).get('/api/support');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].subject).toBe('Need help with API integration');
  });

  it('filters by status', async () => {
    (portalPrisma.mktPartnerSupportTicket.findMany as jest.Mock).mockResolvedValue([]);
    const res = await request(app).get('/api/support?status=RESOLVED');
    expect(res.status).toBe(200);
    expect(portalPrisma.mktPartnerSupportTicket.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { partnerId: 'partner-1', status: 'RESOLVED' } })
    );
  });
});

describe('POST /api/support', () => {
  it('creates a ticket with valid data', async () => {
    (portalPrisma.mktPartnerSupportTicket.create as jest.Mock).mockResolvedValue(mockTicket);

    const res = await request(app)
      .post('/api/support')
      .send({ subject: 'Need help', description: 'Details here', priority: 'HIGH' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(portalPrisma.mktPartnerSupportTicket.create).toHaveBeenCalled();
  });

  it('returns 400 for missing subject', async () => {
    const res = await request(app).post('/api/support').send({ description: 'Details' });
    expect(res.status).toBe(400);
  });

  it('returns 400 for missing description', async () => {
    const res = await request(app).post('/api/support').send({ subject: 'Help' });
    expect(res.status).toBe(400);
  });

  it('uses default MEDIUM priority when not specified', async () => {
    (portalPrisma.mktPartnerSupportTicket.create as jest.Mock).mockResolvedValue(mockTicket);

    await request(app).post('/api/support').send({ subject: 'Help', description: 'Details' });

    const createCall = (portalPrisma.mktPartnerSupportTicket.create as jest.Mock).mock.calls[0][0];
    expect(createCall.data.priority).toBe('MEDIUM');
  });
});

describe('GET /api/support/:id', () => {
  it('returns ticket with messages', async () => {
    (portalPrisma.mktPartnerSupportTicket.findUnique as jest.Mock).mockResolvedValue(mockTicket);
    const res = await request(app).get('/api/support/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.messages).toHaveLength(1);
  });

  it('returns 404 for wrong partner', async () => {
    (portalPrisma.mktPartnerSupportTicket.findUnique as jest.Mock).mockResolvedValue({
      ...mockTicket,
      partnerId: 'other-partner',
    });
    const res = await request(app).get('/api/support/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(404);
  });

  it('returns 404 when ticket not found', async () => {
    (portalPrisma.mktPartnerSupportTicket.findUnique as jest.Mock).mockResolvedValue(null);
    const res = await request(app).get('/api/support/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
  });
});

describe('POST /api/support/:id/messages', () => {
  it('adds a message to an open ticket', async () => {
    (portalPrisma.mktPartnerSupportTicket.findUnique as jest.Mock).mockResolvedValue(mockTicket);
    (portalPrisma.mktTicketMessage.create as jest.Mock).mockResolvedValue({
      id: 'msg-2',
      ticketId: 'ticket-1',
      senderId: 'partner-1',
      senderType: 'PARTNER',
      body: 'Follow up',
      createdAt: new Date(),
    });

    const res = await request(app)
      .post('/api/support/00000000-0000-0000-0000-000000000001/messages')
      .send({ body: 'Follow up' });

    expect(res.status).toBe(201);
  });

  it('returns 400 for empty body', async () => {
    const res = await request(app)
      .post('/api/support/00000000-0000-0000-0000-000000000001/messages')
      .send({ body: '' });
    expect(res.status).toBe(400);
  });

  it('returns 400 for closed ticket', async () => {
    (portalPrisma.mktPartnerSupportTicket.findUnique as jest.Mock).mockResolvedValue({
      ...mockTicket,
      status: 'CLOSED',
    });
    const res = await request(app)
      .post('/api/support/00000000-0000-0000-0000-000000000001/messages')
      .send({ body: 'too late' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('TICKET_CLOSED');
  });

  it('updates status from WAITING_ON_PARTNER to IN_PROGRESS', async () => {
    (portalPrisma.mktPartnerSupportTicket.findUnique as jest.Mock).mockResolvedValue({
      ...mockTicket,
      status: 'WAITING_ON_PARTNER',
    });
    (portalPrisma.mktTicketMessage.create as jest.Mock).mockResolvedValue({
      id: 'msg-2',
      ticketId: 'ticket-1',
      senderId: 'partner-1',
      senderType: 'PARTNER',
      body: 'Reply',
      createdAt: new Date(),
    });
    (portalPrisma.mktPartnerSupportTicket.update as jest.Mock).mockResolvedValue({});

    await request(app)
      .post('/api/support/00000000-0000-0000-0000-000000000001/messages')
      .send({ body: 'Reply' });

    expect(portalPrisma.mktPartnerSupportTicket.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: 'IN_PROGRESS' } })
    );
  });
});

describe('PATCH /api/support/:id/close', () => {
  it('closes an open ticket', async () => {
    (portalPrisma.mktPartnerSupportTicket.findUnique as jest.Mock).mockResolvedValue(mockTicket);
    (portalPrisma.mktPartnerSupportTicket.update as jest.Mock).mockResolvedValue({
      ...mockTicket,
      status: 'CLOSED',
    });

    const res = await request(app).patch('/api/support/00000000-0000-0000-0000-000000000001/close');
    expect(res.status).toBe(200);
  });

  it('returns 404 for wrong partner', async () => {
    (portalPrisma.mktPartnerSupportTicket.findUnique as jest.Mock).mockResolvedValue({
      ...mockTicket,
      partnerId: 'other',
    });
    const res = await request(app).patch('/api/support/00000000-0000-0000-0000-000000000001/close');
    expect(res.status).toBe(404);
  });
});

describe('Auth guard', () => {
  it('returns 401 without partner on request', async () => {
    const noAuthApp = express();
    noAuthApp.use(express.json());
    noAuthApp.use('/api/support', supportRouter);

    const res = await request(noAuthApp).get('/api/support');
    expect(res.status).toBe(401);
  });
});
