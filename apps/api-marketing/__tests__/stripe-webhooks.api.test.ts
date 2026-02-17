import express from 'express';
import crypto from 'crypto';
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
  AutomationConfig: { stripe: { secretKey: '', webhookSecret: '' } },
}));

import stripeWebhooksRouter from '../src/routes/stripe-webhooks';
import { prisma } from '../src/prisma';

function generateStripeSignature(payload: string, secret: string): string {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signedPayload = `${timestamp}.${payload}`;
  const signature = crypto.createHmac('sha256', secret).update(signedPayload).digest('hex');
  return `t=${timestamp},v1=${signature}`;
}

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

describe('Stripe signature verification', () => {
  const testSecret = 'whsec_test_secret_12345';

  beforeEach(() => {
    process.env.STRIPE_WEBHOOK_SECRET = testSecret;
  });

  afterEach(() => {
    delete process.env.STRIPE_WEBHOOK_SECRET;
  });

  it('returns 400 when stripe-signature header is missing and secret is set', async () => {
    const res = await request(app)
      .post('/api/webhooks/stripe')
      .send({ type: 'invoice.paid', data: { object: { id: 'inv-1' } } });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('MISSING_SIGNATURE');
  });

  it('returns 400 when raw body is not available', async () => {
    const res = await request(app)
      .post('/api/webhooks/stripe')
      .set('stripe-signature', 't=123,v1=abc')
      .send({ type: 'invoice.paid', data: { object: { id: 'inv-1' } } });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('MISSING_RAW_BODY');
  });

  it('returns 400 when signature is invalid', async () => {
    const verifyApp = express();
    verifyApp.use('/api/webhooks', express.raw({ type: 'application/json' }), (req: any, _res: any, next: any) => {
      if (Buffer.isBuffer(req.body)) {
        req.rawBody = req.body;
        req.body = JSON.parse(req.body.toString());
      }
      next();
    }, stripeWebhooksRouter);

    const res = await request(verifyApp)
      .post('/api/webhooks/stripe')
      .set('stripe-signature', 't=123,v1=invalidsignature')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ type: 'invoice.paid', data: { object: { id: 'inv-1' } } }));

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_SIGNATURE');
  });

  it('processes event when signature is valid', async () => {
    const verifyApp = express();
    verifyApp.use('/api/webhooks', express.raw({ type: 'application/json' }), (req: any, _res: any, next: any) => {
      if (Buffer.isBuffer(req.body)) {
        req.rawBody = req.body;
        req.body = JSON.parse(req.body.toString());
      }
      next();
    }, stripeWebhooksRouter);

    const payload = JSON.stringify({ type: 'invoice.paid', data: { object: { id: 'inv-1' } } });
    const sig = generateStripeSignature(payload, testSecret);

    const res = await request(verifyApp)
      .post('/api/webhooks/stripe')
      .set('stripe-signature', sig)
      .set('Content-Type', 'application/json')
      .send(payload);

    expect(res.status).toBe(200);
    expect(res.body.received).toBe(true);
  });

  it('returns 400 for malformed signature header', async () => {
    const verifyApp = express();
    verifyApp.use('/api/webhooks', express.raw({ type: 'application/json' }), (req: any, _res: any, next: any) => {
      if (Buffer.isBuffer(req.body)) {
        req.rawBody = req.body;
        req.body = JSON.parse(req.body.toString());
      }
      next();
    }, stripeWebhooksRouter);

    const res = await request(verifyApp)
      .post('/api/webhooks/stripe')
      .set('stripe-signature', 'malformed-header')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ type: 'invoice.paid', data: { object: { id: 'inv-1' } } }));

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_SIGNATURE');
  });
});
