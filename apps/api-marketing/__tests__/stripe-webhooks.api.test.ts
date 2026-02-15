import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    mktWinBackSequence: {
      create: jest.fn(),
    },
    mktRenewalSequence: {
      update: jest.fn(),
    },
  },
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

jest.mock('../src/config', () => ({
  AutomationConfig: { stripe: { webhookSecret: '' } },
}));

import stripeWebhooksRouter from '../src/routes/stripe-webhooks';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/webhooks', stripeWebhooksRouter);

beforeEach(() => { jest.clearAllMocks(); });

describe('POST /api/webhooks/stripe', () => {
  it('handles customer.subscription.deleted event', async () => {
    (prisma.mktWinBackSequence.create as jest.Mock).mockResolvedValue({ id: 'wb-1' });

    const res = await request(app)
      .post('/api/webhooks/stripe')
      .send({
        type: 'customer.subscription.deleted',
        data: { object: { metadata: { orgId: 'org-1' } } },
      });

    expect(res.status).toBe(200);
    expect(res.body.received).toBe(true);
    expect(prisma.mktWinBackSequence.create).toHaveBeenCalled();
  });

  it('handles customer.subscription.updated event for renewal', async () => {
    (prisma.mktRenewalSequence.update as jest.Mock).mockResolvedValue({});

    const res = await request(app)
      .post('/api/webhooks/stripe')
      .send({
        type: 'customer.subscription.updated',
        data: { object: { metadata: { orgId: 'org-1' }, status: 'active' } },
      });

    expect(res.status).toBe(200);
  });

  it('handles invoice.payment_failed event', async () => {
    const res = await request(app)
      .post('/api/webhooks/stripe')
      .send({
        type: 'invoice.payment_failed',
        data: { object: { metadata: { orgId: 'org-1' } } },
      });

    expect(res.status).toBe(200);
  });

  it('handles invoice.paid event', async () => {
    const res = await request(app)
      .post('/api/webhooks/stripe')
      .send({
        type: 'invoice.paid',
        data: { object: { id: 'inv-1' } },
      });

    expect(res.status).toBe(200);
  });

  it('returns 400 for invalid event', async () => {
    const res = await request(app)
      .post('/api/webhooks/stripe')
      .send({});

    expect(res.status).toBe(400);
  });

  it('handles unknown event types gracefully', async () => {
    const res = await request(app)
      .post('/api/webhooks/stripe')
      .send({ type: 'unknown.event', data: {} });

    expect(res.status).toBe(200);
    expect(res.body.received).toBe(true);
  });

  it('ignores duplicate win-back creation', async () => {
    (prisma.mktWinBackSequence.create as jest.Mock).mockRejectedValue({ code: 'P2002' });

    const res = await request(app)
      .post('/api/webhooks/stripe')
      .send({
        type: 'customer.subscription.deleted',
        data: { object: { metadata: { orgId: 'org-1' } } },
      });

    expect(res.status).toBe(200);
  });
});
