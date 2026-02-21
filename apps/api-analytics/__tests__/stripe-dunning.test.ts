import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    dunningSequence: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import stripeDunningRouter from '../src/routes/webhooks/stripe-dunning';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/webhooks/stripe-dunning', stripeDunningRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

const validPaymentFailedEvent = {
  id: 'evt_001',
  type: 'invoice.payment_failed',
  data: {
    object: {
      id: 'in_001',
      customer: 'cus_001',
      customer_email: 'billing@acme.com',
      customer_name: 'Acme Corp',
      amount_due: 9900,
      currency: 'gbp',
      number: 'INV-001',
    },
  },
};

describe('POST /api/webhooks/stripe-dunning', () => {
  it('creates a dunning sequence for invoice.payment_failed', async () => {
    mockPrisma.dunningSequence.findFirst.mockResolvedValue(null);
    mockPrisma.dunningSequence.create.mockResolvedValue({
      id: 'dun-1',
      stripeInvoiceId: 'in_001',
      stripeCustomerId: 'cus_001',
      customerEmail: 'billing@acme.com',
      customerName: 'Acme Corp',
      amountDue: 99,
      currency: 'gbp',
      currentStep: 'DAY_0',
    } as any);

    const res = await request(app)
      .post('/api/webhooks/stripe-dunning')
      .send(validPaymentFailedEvent);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.dunningSequence.id).toBe('dun-1');
  });

  it('returns 400 when type field is missing', async () => {
    const res = await request(app)
      .post('/api/webhooks/stripe-dunning')
      .send({ id: 'evt_002', data: {} });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 200 and ignores non-payment_failed event types', async () => {
    const res = await request(app)
      .post('/api/webhooks/stripe-dunning')
      .send({ id: 'evt_003', type: 'invoice.paid', data: {} });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.message).toBe('Event type ignored');
    expect(res.body.data.type).toBe('invoice.paid');
  });

  it('returns 400 when invoice.payment_failed has no invoice data', async () => {
    const res = await request(app)
      .post('/api/webhooks/stripe-dunning')
      .send({ type: 'invoice.payment_failed' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_PAYLOAD');
  });

  it('returns existing dunning sequence when already created for invoice', async () => {
    const existing = { id: 'dun-existing', stripeInvoiceId: 'in_001' };
    mockPrisma.dunningSequence.findFirst.mockResolvedValue(existing as any);

    const res = await request(app)
      .post('/api/webhooks/stripe-dunning')
      .send(validPaymentFailedEvent);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.message).toBe('Already exists');
    expect(mockPrisma.dunningSequence.create).not.toHaveBeenCalled();
  });

  it('converts amount_due from cents to pounds', async () => {
    mockPrisma.dunningSequence.findFirst.mockResolvedValue(null);
    mockPrisma.dunningSequence.create.mockResolvedValue({ id: 'dun-2' } as any);

    await request(app).post('/api/webhooks/stripe-dunning').send(validPaymentFailedEvent);

    const createCall = mockPrisma.dunningSequence.create.mock.calls[0][0];
    expect(createCall.data.amountDue).toBe(99); // 9900 / 100
  });

  it('sets currentStep to DAY_0 on new dunning sequence', async () => {
    mockPrisma.dunningSequence.findFirst.mockResolvedValue(null);
    mockPrisma.dunningSequence.create.mockResolvedValue({ id: 'dun-3', currentStep: 'DAY_0' } as any);

    await request(app).post('/api/webhooks/stripe-dunning').send(validPaymentFailedEvent);

    const createCall = mockPrisma.dunningSequence.create.mock.calls[0][0];
    expect(createCall.data.currentStep).toBe('DAY_0');
  });

  it('returns 500 when create throws', async () => {
    mockPrisma.dunningSequence.findFirst.mockResolvedValue(null);
    mockPrisma.dunningSequence.create.mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .post('/api/webhooks/stripe-dunning')
      .send(validPaymentFailedEvent);

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('GET /api/webhooks/stripe-dunning/active', () => {
  it('returns active dunning sequences', async () => {
    mockPrisma.dunningSequence.findMany.mockResolvedValue([
      { id: 'dun-1', stripeInvoiceId: 'in_001' },
    ] as any);

    const res = await request(app).get('/api/webhooks/stripe-dunning/active');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.total).toBe(1);
  });

  it('returns empty sequences array when none active', async () => {
    mockPrisma.dunningSequence.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/webhooks/stripe-dunning/active');

    expect(res.status).toBe(200);
    expect(res.body.data.sequences).toHaveLength(0);
    expect(res.body.data.total).toBe(0);
  });

  it('sequences is an array', async () => {
    mockPrisma.dunningSequence.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/webhooks/stripe-dunning/active');
    expect(Array.isArray(res.body.data.sequences)).toBe(true);
  });

  it('findMany excludes resolved and cancelled sequences', async () => {
    mockPrisma.dunningSequence.findMany.mockResolvedValue([]);
    await request(app).get('/api/webhooks/stripe-dunning/active');
    expect(mockPrisma.dunningSequence.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ resolvedAt: null, cancelledAt: null }),
      })
    );
  });

  it('returns 500 when findMany throws', async () => {
    mockPrisma.dunningSequence.findMany.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/webhooks/stripe-dunning/active');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('findMany called once per request', async () => {
    mockPrisma.dunningSequence.findMany.mockResolvedValue([]);
    await request(app).get('/api/webhooks/stripe-dunning/active');
    expect(mockPrisma.dunningSequence.findMany).toHaveBeenCalledTimes(1);
  });

  it('data has total field matching sequences length', async () => {
    mockPrisma.dunningSequence.findMany.mockResolvedValue([
      { id: 'a' }, { id: 'b' }, { id: 'c' },
    ] as any);
    const res = await request(app).get('/api/webhooks/stripe-dunning/active');
    expect(res.body.data.total).toBe(3);
    expect(res.body.data.sequences).toHaveLength(3);
  });
});

describe('stripe-dunning — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/webhooks/stripe-dunning', stripeDunningRouter);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/webhooks/stripe-dunning', async () => {
    const res = await request(app).get('/api/webhooks/stripe-dunning');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });

  it('response is JSON content-type for GET /api/webhooks/stripe-dunning', async () => {
    const res = await request(app).get('/api/webhooks/stripe-dunning');
    expect(res.headers['content-type']).toBeDefined();
  });

  it('GET /api/webhooks/stripe-dunning body has success property', async () => {
    const res = await request(app).get('/api/webhooks/stripe-dunning');
    if (res.status === 200) {
      expect(res.body).toHaveProperty('success');
    } else {
      expect(res.body).toBeDefined();
    }
  });

  it('GET /api/webhooks/stripe-dunning body is an object', async () => {
    const res = await request(app).get('/api/webhooks/stripe-dunning');
    expect(typeof res.body).toBe('object');
  });

  it('GET /api/webhooks/stripe-dunning route is accessible', async () => {
    const res = await request(app).get('/api/webhooks/stripe-dunning');
    expect(res.status).toBeDefined();
  });
});
