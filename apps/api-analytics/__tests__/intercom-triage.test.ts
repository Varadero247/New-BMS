import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    supportTicketLog: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import intercomRouter from '../src/routes/webhooks/intercom';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/webhooks/intercom', intercomRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('POST /webhooks/intercom', () => {
  it('creates a support ticket from conversation payload', async () => {
    const mockTicket = { id: 'ticket-1', subject: 'Help needed', category: 'GENERAL', priority: 'P3_MEDIUM' };
    (prisma.supportTicketLog.create as jest.Mock).mockResolvedValue(mockTicket);

    const res = await request(app)
      .post('/webhooks/intercom')
      .send({
        topic: 'conversation.created',
        data: { item: { id: 'conv-1', subject: 'Help needed', body: 'I need help with login', customer: { email: 'user@test.com', id: 'cust-1' } } },
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.ticket).toBeDefined();
    expect(prisma.supportTicketLog.create).toHaveBeenCalledTimes(1);
  });

  it('classifies "bug" keyword as BUG category', async () => {
    (prisma.supportTicketLog.create as jest.Mock).mockResolvedValue({ id: 'ticket-2', category: 'BUG' });

    await request(app)
      .post('/webhooks/intercom')
      .send({ topic: 'conversation.created', data: { item: { id: 'conv-2', subject: 'Bug in reports', body: 'Report page is broken' } } });

    expect(prisma.supportTicketLog.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ category: 'BUG' }) })
    );
  });

  it('classifies "feature" keyword as FEATURE_REQUEST category', async () => {
    (prisma.supportTicketLog.create as jest.Mock).mockResolvedValue({ id: 'ticket-3', category: 'FEATURE_REQUEST' });

    await request(app)
      .post('/webhooks/intercom')
      .send({ topic: 'conversation.created', data: { item: { id: 'conv-3', subject: 'Feature request', body: 'I wish you had dark mode' } } });

    expect(prisma.supportTicketLog.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ category: 'FEATURE_REQUEST' }) })
    );
  });

  it('classifies "bill" keyword as BILLING category', async () => {
    (prisma.supportTicketLog.create as jest.Mock).mockResolvedValue({ id: 'ticket-4', category: 'BILLING' });

    await request(app)
      .post('/webhooks/intercom')
      .send({ topic: 'conversation.created', data: { item: { id: 'conv-4', subject: 'Billing issue', body: 'Wrong charge on my bill' } } });

    expect(prisma.supportTicketLog.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ category: 'BILLING' }) })
    );
  });

  it('classifies "onboard" keyword as ONBOARDING category', async () => {
    (prisma.supportTicketLog.create as jest.Mock).mockResolvedValue({ id: 'ticket-5', category: 'ONBOARDING' });

    await request(app)
      .post('/webhooks/intercom')
      .send({ topic: 'conversation.created', data: { item: { id: 'conv-5', subject: 'Onboarding help', body: 'Getting started with setup' } } });

    expect(prisma.supportTicketLog.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ category: 'ONBOARDING' }) })
    );
  });

  it('defaults to GENERAL category for unrecognised text', async () => {
    (prisma.supportTicketLog.create as jest.Mock).mockResolvedValue({ id: 'ticket-6', category: 'GENERAL' });

    await request(app)
      .post('/webhooks/intercom')
      .send({ topic: 'conversation.created', data: { item: { id: 'conv-6', subject: 'Hello', body: 'Just saying hi' } } });

    expect(prisma.supportTicketLog.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ category: 'GENERAL' }) })
    );
  });

  it('assigns P1_CRITICAL priority for "urgent" keyword', async () => {
    (prisma.supportTicketLog.create as jest.Mock).mockResolvedValue({ id: 'ticket-7', priority: 'P1_CRITICAL' });

    await request(app)
      .post('/webhooks/intercom')
      .send({ topic: 'conversation.created', data: { item: { id: 'conv-7', subject: 'Urgent: system down', body: 'Critical outage' } } });

    expect(prisma.supportTicketLog.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ priority: 'P1_CRITICAL' }) })
    );
  });

  it('assigns P1_CRITICAL priority for "critical" keyword', async () => {
    (prisma.supportTicketLog.create as jest.Mock).mockResolvedValue({ id: 'ticket-8', priority: 'P1_CRITICAL' });

    await request(app)
      .post('/webhooks/intercom')
      .send({ topic: 'conversation.created', data: { item: { id: 'conv-8', subject: 'Critical bug', body: 'Everything is broken' } } });

    expect(prisma.supportTicketLog.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ priority: 'P1_CRITICAL' }) })
    );
  });

  it('assigns P2_HIGH priority for "asap" keyword', async () => {
    (prisma.supportTicketLog.create as jest.Mock).mockResolvedValue({ id: 'ticket-9', priority: 'P2_HIGH' });

    await request(app)
      .post('/webhooks/intercom')
      .send({ topic: 'conversation.created', data: { item: { id: 'conv-9', subject: 'Need this asap', body: 'Please fix quickly' } } });

    expect(prisma.supportTicketLog.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ priority: 'P2_HIGH' }) })
    );
  });

  it('assigns P3_MEDIUM priority by default', async () => {
    (prisma.supportTicketLog.create as jest.Mock).mockResolvedValue({ id: 'ticket-10', priority: 'P3_MEDIUM' });

    await request(app)
      .post('/webhooks/intercom')
      .send({ topic: 'conversation.created', data: { item: { id: 'conv-10', subject: 'Question', body: 'How do I export CSV?' } } });

    expect(prisma.supportTicketLog.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ priority: 'P3_MEDIUM' }) })
    );
  });

  it('returns 400 when data payload is missing', async () => {
    const res = await request(app).post('/webhooks/intercom').send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('extracts customer email from nested payload', async () => {
    (prisma.supportTicketLog.create as jest.Mock).mockResolvedValue({ id: 'ticket-11' });

    await request(app)
      .post('/webhooks/intercom')
      .send({ data: { item: { id: 'conv-11', subject: 'Test', customer: { email: 'deep@test.com', id: 'cust-x' } } } });

    expect(prisma.supportTicketLog.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ customerEmail: 'deep@test.com' }) })
    );
  });

  it('handles database errors gracefully', async () => {
    (prisma.supportTicketLog.create as jest.Mock).mockRejectedValue(new Error('DB down'));

    const res = await request(app)
      .post('/webhooks/intercom')
      .send({ topic: 'conversation.created', data: { item: { id: 'conv-err', subject: 'Test' } } });

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('stores classification data in aiClassification JSON field', async () => {
    (prisma.supportTicketLog.create as jest.Mock).mockResolvedValue({ id: 'ticket-12' });

    await request(app)
      .post('/webhooks/intercom')
      .send({ topic: 'conversation.created', data: { item: { id: 'conv-12', subject: 'Test' } } });

    expect(prisma.supportTicketLog.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ aiClassification: expect.any(Object) }) })
    );
  });
});
