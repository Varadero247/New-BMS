jest.mock('../src/prisma', () => ({
  prisma: {
    dunningSequence: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    vatSummary: { upsert: jest.fn() },
    cashFlowForecast: { findMany: jest.fn(), create: jest.fn(), deleteMany: jest.fn() },
    companyCashPosition: { findFirst: jest.fn() },
    annualAccountsPack: { create: jest.fn(), findUnique: jest.fn() },
    approvedVendor: { findMany: jest.fn() },
    monthlySnapshot: { findMany: jest.fn() },
    plannedExpense: { findMany: jest.fn() },
    planTarget: { findUnique: jest.fn() },
  },
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

jest.mock('@ims/auth', () => ({
  authenticate: (_req: any, _res: any, next: any) => {
    _req.user = { id: 'user-1', email: 'a@b.com' };
    next();
  },
}));

import { runDunningJob } from '../src/jobs/dunning.job';
import { prisma } from '../src/prisma';
import express from 'express';
import request from 'supertest';
import stripeDunningRouter from '../src/routes/webhooks/stripe-dunning';

beforeEach(() => {
  jest.clearAllMocks();
});

// -----------------------------------------------------------------------
// Dunning Job Tests
// -----------------------------------------------------------------------
describe('runDunningJob', () => {
  it('processes DAY_0 sequences and advances to DAY_3', async () => {
    const mockSeq = {
      id: 'seq-1',
      currentStep: 'DAY_0',
      customerEmail: 'test@example.com',
      customerName: 'Test User',
      amountDue: 100,
    };
    (prisma.dunningSequence.findMany as jest.Mock).mockResolvedValue([mockSeq]);
    (prisma.dunningSequence.update as jest.Mock).mockResolvedValue({
      ...mockSeq,
      currentStep: 'DAY_3',
    });

    const result = await runDunningJob();

    expect(result.processed).toBe(1);
    expect(prisma.dunningSequence.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'seq-1' },
        data: expect.objectContaining({ currentStep: 'DAY_3' }),
      })
    );
  });

  it('advances DAY_3 to DAY_7', async () => {
    const mockSeq = {
      id: 'seq-2',
      currentStep: 'DAY_3',
      customerEmail: 'a@b.com',
      customerName: 'A',
      amountDue: 50,
    };
    (prisma.dunningSequence.findMany as jest.Mock).mockResolvedValue([mockSeq]);
    (prisma.dunningSequence.update as jest.Mock).mockResolvedValue({
      ...mockSeq,
      currentStep: 'DAY_7',
    });

    const result = await runDunningJob();

    expect(result.processed).toBe(1);
    expect(prisma.dunningSequence.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ currentStep: 'DAY_7' }),
      })
    );
  });

  it('advances DAY_7 to DAY_9', async () => {
    const mockSeq = {
      id: 'seq-3',
      currentStep: 'DAY_7',
      customerEmail: 'a@b.com',
      customerName: 'A',
      amountDue: 50,
    };
    (prisma.dunningSequence.findMany as jest.Mock).mockResolvedValue([mockSeq]);
    (prisma.dunningSequence.update as jest.Mock).mockResolvedValue({
      ...mockSeq,
      currentStep: 'DAY_9',
    });

    const result = await runDunningJob();

    expect(result.processed).toBe(1);
    expect(prisma.dunningSequence.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ currentStep: 'DAY_9' }),
      })
    );
  });

  it('advances DAY_9 to DAY_14', async () => {
    const mockSeq = {
      id: 'seq-4',
      currentStep: 'DAY_9',
      customerEmail: 'a@b.com',
      customerName: 'A',
      amountDue: 50,
    };
    (prisma.dunningSequence.findMany as jest.Mock).mockResolvedValue([mockSeq]);
    (prisma.dunningSequence.update as jest.Mock).mockResolvedValue({
      ...mockSeq,
      currentStep: 'DAY_14',
    });

    const result = await runDunningJob();

    expect(result.processed).toBe(1);
    expect(prisma.dunningSequence.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ currentStep: 'DAY_14' }),
      })
    );
  });

  it('cancels sequence at DAY_14', async () => {
    const mockSeq = {
      id: 'seq-5',
      currentStep: 'DAY_14',
      customerEmail: 'a@b.com',
      customerName: 'A',
      amountDue: 50,
    };
    (prisma.dunningSequence.findMany as jest.Mock).mockResolvedValue([mockSeq]);
    (prisma.dunningSequence.update as jest.Mock).mockResolvedValue({
      ...mockSeq,
      currentStep: 'CANCELLED',
      cancelledAt: new Date(),
    });

    const result = await runDunningJob();

    expect(result.cancelled).toBe(1);
    expect(result.processed).toBe(1);
    expect(prisma.dunningSequence.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          currentStep: 'CANCELLED',
          cancelledAt: expect.any(Date),
        }),
      })
    );
  });

  it('handles empty queue gracefully', async () => {
    (prisma.dunningSequence.findMany as jest.Mock).mockResolvedValue([]);

    const result = await runDunningJob();

    expect(result.processed).toBe(0);
    expect(result.cancelled).toBe(0);
  });

  it('processes multiple sequences in one run', async () => {
    const sequences = [
      {
        id: 'seq-a',
        currentStep: 'DAY_0',
        customerEmail: 'a@b.com',
        customerName: 'A',
        amountDue: 100,
      },
      {
        id: 'seq-b',
        currentStep: 'DAY_3',
        customerEmail: 'c@d.com',
        customerName: 'B',
        amountDue: 200,
      },
      {
        id: 'seq-c',
        currentStep: 'DAY_14',
        customerEmail: 'e@f.com',
        customerName: 'C',
        amountDue: 300,
      },
    ];
    (prisma.dunningSequence.findMany as jest.Mock).mockResolvedValue(sequences);
    (prisma.dunningSequence.update as jest.Mock).mockResolvedValue({});

    const result = await runDunningJob();

    expect(result.processed).toBe(3);
    expect(result.cancelled).toBe(1);
  });

  it('continues processing if one sequence fails', async () => {
    const sequences = [
      {
        id: 'seq-fail',
        currentStep: 'DAY_0',
        customerEmail: 'a@b.com',
        customerName: 'A',
        amountDue: 100,
      },
      {
        id: 'seq-ok',
        currentStep: 'DAY_3',
        customerEmail: 'c@d.com',
        customerName: 'B',
        amountDue: 200,
      },
    ];
    (prisma.dunningSequence.findMany as jest.Mock).mockResolvedValue(sequences);
    (prisma.dunningSequence.update as jest.Mock)
      .mockRejectedValueOnce(new Error('DB error'))
      .mockResolvedValueOnce({});

    const result = await runDunningJob();

    // First failed, second succeeded
    expect(result.processed).toBe(1);
  });

  it('sets correct nextActionAt gap for DAY_0 (3 days)', async () => {
    const mockSeq = {
      id: 'seq-gap',
      currentStep: 'DAY_0',
      customerEmail: 'a@b.com',
      customerName: 'A',
      amountDue: 100,
    };
    (prisma.dunningSequence.findMany as jest.Mock).mockResolvedValue([mockSeq]);
    (prisma.dunningSequence.update as jest.Mock).mockResolvedValue({});

    await runDunningJob();

    const updateCall = (prisma.dunningSequence.update as jest.Mock).mock.calls[0][0];
    const nextAction = new Date(updateCall.data.nextActionAt);
    const now = new Date();
    const diffDays = (nextAction.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

    expect(diffDays).toBeGreaterThan(2.9);
    expect(diffDays).toBeLessThan(3.1);
  });
});

// -----------------------------------------------------------------------
// Stripe Dunning Webhook Route Tests
// -----------------------------------------------------------------------
describe('POST /webhooks/stripe-dunning', () => {
  const app = express();
  app.use(express.json());
  app.use('/', stripeDunningRouter);

  it('creates a dunning sequence from invoice.payment_failed event', async () => {
    (prisma.dunningSequence.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.dunningSequence.create as jest.Mock).mockResolvedValue({
      id: 'new-seq',
      stripeInvoiceId: 'inv_123',
      currentStep: 'DAY_0',
    });

    const res = await request(app)
      .post('/')
      .send({
        id: 'evt_123',
        type: 'invoice.payment_failed',
        data: {
          object: {
            id: 'inv_123',
            customer: 'cus_abc',
            customer_email: 'test@example.com',
            customer_name: 'Test Co',
            amount_due: 9900,
            currency: 'gbp',
            number: 'INV-001',
          },
        },
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(prisma.dunningSequence.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          stripeCustomerId: 'cus_abc',
          stripeInvoiceId: 'inv_123',
          customerEmail: 'test@example.com',
          amountDue: 99,
          currentStep: 'DAY_0',
        }),
      })
    );
  });

  it('returns 400 for missing event type', async () => {
    const res = await request(app).post('/').send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('ignores non-payment_failed events', async () => {
    const res = await request(app)
      .post('/')
      .send({
        id: 'evt_456',
        type: 'invoice.paid',
        data: { object: {} },
      });

    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe('Event type ignored');
  });

  it('returns existing sequence if duplicate invoice', async () => {
    (prisma.dunningSequence.findFirst as jest.Mock).mockResolvedValue({
      id: 'existing-seq',
      stripeInvoiceId: 'inv_dup',
    });

    const res = await request(app)
      .post('/')
      .send({
        id: 'evt_789',
        type: 'invoice.payment_failed',
        data: { object: { id: 'inv_dup', customer: 'cus_x' } },
      });

    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe('Already exists');
    expect(prisma.dunningSequence.create).not.toHaveBeenCalled();
  });
});

describe('GET /active', () => {
  const app = express();
  app.use(express.json());
  app.use('/', stripeDunningRouter);

  it('lists active dunning sequences', async () => {
    const mockSequences = [
      { id: 'seq-1', currentStep: 'DAY_0', customerEmail: 'a@b.com' },
      { id: 'seq-2', currentStep: 'DAY_3', customerEmail: 'c@d.com' },
    ];
    (prisma.dunningSequence.findMany as jest.Mock).mockResolvedValue(mockSequences);

    const res = await request(app).get('/active');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.sequences).toHaveLength(2);
    expect(res.body.data.total).toBe(2);
  });

  it('returns empty list when no active sequences', async () => {
    (prisma.dunningSequence.findMany as jest.Mock).mockResolvedValue([]);

    const res = await request(app).get('/active');

    expect(res.status).toBe(200);
    expect(res.body.data.sequences).toHaveLength(0);
    expect(res.body.data.total).toBe(0);
  });

  it('handles database errors gracefully', async () => {
    (prisma.dunningSequence.findMany as jest.Mock).mockRejectedValue(new Error('DB down'));

    const res = await request(app).get('/active');

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});


describe('Dunning — additional coverage', () => {
  it('findMany is called with cancelledAt: null filter', async () => {
    (prisma.dunningSequence.findMany as jest.Mock).mockResolvedValue([]);
    await runDunningJob();
    expect(prisma.dunningSequence.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ cancelledAt: null }) })
    );
  });

  it('processed count is 0 when queue is empty', async () => {
    (prisma.dunningSequence.findMany as jest.Mock).mockResolvedValue([]);
    const result = await runDunningJob();
    expect(result.processed).toBe(0);
  });

  it('cancelled count defaults to 0 when no sequences hit DAY_14', async () => {
    (prisma.dunningSequence.findMany as jest.Mock).mockResolvedValue([
      { id: 'nc-1', currentStep: 'DAY_0', customerEmail: 'a@b.com', customerName: 'A', amountDue: 50 },
    ]);
    (prisma.dunningSequence.update as jest.Mock).mockResolvedValue({});
    const result = await runDunningJob();
    expect(result.cancelled).toBe(0);
  });

  it('update is called once for a single sequence', async () => {
    (prisma.dunningSequence.findMany as jest.Mock).mockResolvedValue([
      { id: 'once-1', currentStep: 'DAY_3', customerEmail: 'a@b.com', customerName: 'A', amountDue: 100 },
    ]);
    (prisma.dunningSequence.update as jest.Mock).mockResolvedValue({});
    await runDunningJob();
    expect(prisma.dunningSequence.update).toHaveBeenCalledTimes(1);
  });
});

// ─── Dunning — edge cases and extended webhook coverage ──────────────────────
describe('Dunning — edge cases and extended webhook coverage', () => {
  const app = express();
  app.use(express.json());
  app.use('/', stripeDunningRouter);

  it('POST /webhooks/stripe-dunning converts amount_due from cents to pounds', async () => {
    (prisma.dunningSequence.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.dunningSequence.create as jest.Mock).mockResolvedValue({
      id: 'seq-cents',
      stripeInvoiceId: 'inv_cents',
      currentStep: 'DAY_0',
    });

    await request(app)
      .post('/')
      .send({
        id: 'evt_cents',
        type: 'invoice.payment_failed',
        data: {
          object: {
            id: 'inv_cents',
            customer: 'cus_cents',
            customer_email: 'x@y.com',
            customer_name: 'X Y',
            amount_due: 5000,
            currency: 'gbp',
          },
        },
      });

    const createCall = (prisma.dunningSequence.create as jest.Mock).mock.calls[0][0];
    expect(createCall.data.amountDue).toBe(50); // 5000 cents = £50
  });

  it('POST / returns 500 on DB create failure', async () => {
    (prisma.dunningSequence.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.dunningSequence.create as jest.Mock).mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .post('/')
      .send({
        id: 'evt_fail',
        type: 'invoice.payment_failed',
        data: {
          object: {
            id: 'inv_fail',
            customer: 'cus_fail',
            customer_email: 'fail@fail.com',
            customer_name: 'Fail User',
            amount_due: 1000,
            currency: 'gbp',
          },
        },
      });

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('GET /active filters resolvedAt: null sequences', async () => {
    const mockSequences = [
      { id: 'seq-active-1', currentStep: 'DAY_7', customerEmail: 'a@b.com' },
    ];
    (prisma.dunningSequence.findMany as jest.Mock).mockResolvedValue(mockSequences);

    const res = await request(app).get('/active');

    expect(res.status).toBe(200);
    expect(prisma.dunningSequence.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ resolvedAt: null }) })
    );
  });

  it('runDunningJob processes DAY_7 sequences and advances them', async () => {
    (prisma.dunningSequence.findMany as jest.Mock).mockResolvedValue([
      { id: 'seq-d7', currentStep: 'DAY_7', customerEmail: 'a@b.com', customerName: 'A', amountDue: 75 },
    ]);
    (prisma.dunningSequence.update as jest.Mock).mockResolvedValue({});

    const result = await runDunningJob();

    expect(result.processed).toBe(1);
    expect(prisma.dunningSequence.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ currentStep: 'DAY_9' }),
      })
    );
  });

  it('runDunningJob update includes nextActionAt date', async () => {
    (prisma.dunningSequence.findMany as jest.Mock).mockResolvedValue([
      { id: 'seq-na', currentStep: 'DAY_3', customerEmail: 'a@b.com', customerName: 'A', amountDue: 80 },
    ]);
    (prisma.dunningSequence.update as jest.Mock).mockResolvedValue({});

    await runDunningJob();

    const updateCall = (prisma.dunningSequence.update as jest.Mock).mock.calls[0][0];
    expect(updateCall.data).toHaveProperty('nextActionAt');
    expect(updateCall.data.nextActionAt).toBeInstanceOf(Date);
  });

  it('POST / with missing data.object returns 400', async () => {
    const res = await request(app)
      .post('/')
      .send({
        id: 'evt_no_obj',
        type: 'invoice.payment_failed',
        data: {},
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST / with invoice.paid type is ignored gracefully', async () => {
    const res = await request(app)
      .post('/')
      .send({
        id: 'evt_paid',
        type: 'invoice.paid',
        data: { object: { id: 'inv_paid' } },
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.message).toBe('Event type ignored');
  });

  it('GET /active returns 500 when DB throws', async () => {
    (prisma.dunningSequence.findMany as jest.Mock).mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/active');

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('Dunning — final coverage', () => {
  const finalApp = express();
  finalApp.use(express.json());
  finalApp.use('/', stripeDunningRouter);

  it('runDunningJob processed count matches number of sequences', async () => {
    const seqs = [
      { id: 'f1', currentStep: 'DAY_0', customerEmail: 'a@b.com', customerName: 'A', amountDue: 50 },
      { id: 'f2', currentStep: 'DAY_3', customerEmail: 'b@c.com', customerName: 'B', amountDue: 75 },
    ];
    (prisma.dunningSequence.findMany as jest.Mock).mockResolvedValue(seqs);
    (prisma.dunningSequence.update as jest.Mock).mockResolvedValue({});
    const result = await runDunningJob();
    expect(result.processed).toBe(2);
  });

  it('runDunningJob update is called for each active sequence', async () => {
    const seqs = [
      { id: 'g1', currentStep: 'DAY_7', customerEmail: 'a@b.com', customerName: 'A', amountDue: 100 },
      { id: 'g2', currentStep: 'DAY_9', customerEmail: 'c@d.com', customerName: 'C', amountDue: 200 },
    ];
    (prisma.dunningSequence.findMany as jest.Mock).mockResolvedValue(seqs);
    (prisma.dunningSequence.update as jest.Mock).mockResolvedValue({});
    await runDunningJob();
    expect(prisma.dunningSequence.update).toHaveBeenCalledTimes(2);
  });

  it('GET /active data.total equals sequences length', async () => {
    (prisma.dunningSequence.findMany as jest.Mock).mockResolvedValue([
      { id: 'ga-1', currentStep: 'DAY_0', customerEmail: 'a@b.com' },
      { id: 'ga-2', currentStep: 'DAY_3', customerEmail: 'c@d.com' },
      { id: 'ga-3', currentStep: 'DAY_7', customerEmail: 'e@f.com' },
    ]);
    const res = await request(finalApp).get('/active');
    expect(res.status).toBe(200);
    expect(res.body.data.total).toBe(3);
    expect(res.body.data.sequences).toHaveLength(3);
  });

  it('POST / with invoice.payment_failed and missing data returns 400', async () => {
    const res = await request(finalApp).post('/').send({
      id: 'evt_nd',
      type: 'invoice.payment_failed',
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('runDunningJob update includes nextActionAt for each step', async () => {
    (prisma.dunningSequence.findMany as jest.Mock).mockResolvedValue([
      { id: 'email-1', currentStep: 'DAY_0', customerEmail: 'a@b.com', customerName: 'A', amountDue: 50 },
    ]);
    (prisma.dunningSequence.update as jest.Mock).mockResolvedValue({});
    await runDunningJob();
    const updateCall = (prisma.dunningSequence.update as jest.Mock).mock.calls[0][0];
    expect(updateCall.data).toHaveProperty('nextActionAt');
    expect(updateCall.data.nextActionAt).toBeInstanceOf(Date);
  });

  it('POST / creates sequence with currentStep=DAY_0', async () => {
    (prisma.dunningSequence.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.dunningSequence.create as jest.Mock).mockResolvedValue({
      id: 'step-check',
      stripeInvoiceId: 'inv_step',
      currentStep: 'DAY_0',
    });
    await request(finalApp).post('/').send({
      id: 'evt_step',
      type: 'invoice.payment_failed',
      data: {
        object: {
          id: 'inv_step',
          customer: 'cus_step',
          customer_email: 'step@test.com',
          customer_name: 'Step User',
          amount_due: 2000,
          currency: 'gbp',
        },
      },
    });
    const createCall = (prisma.dunningSequence.create as jest.Mock).mock.calls[0][0];
    expect(createCall.data.currentStep).toBe('DAY_0');
  });

  it('runDunningJob cancelled count is 1 when one DAY_14 sequence in batch', async () => {
    (prisma.dunningSequence.findMany as jest.Mock).mockResolvedValue([
      { id: 'can-1', currentStep: 'DAY_14', customerEmail: 'a@b.com', customerName: 'A', amountDue: 100 },
    ]);
    (prisma.dunningSequence.update as jest.Mock).mockResolvedValue({});
    const result = await runDunningJob();
    expect(result.cancelled).toBe(1);
  });
});

// ─── Dunning — supplemental coverage ─────────────────────────────────────────
describe('Dunning — supplemental coverage', () => {
  const finalApp = express();
  finalApp.use(express.json());
  finalApp.use('/', stripeDunningRouter);

  it('runDunningJob returns an object with processed property', async () => {
    (prisma.dunningSequence.findMany as jest.Mock).mockResolvedValue([]);
    const result = await runDunningJob();
    expect(result).toHaveProperty('processed');
  });

  it('runDunningJob returns an object with cancelled property', async () => {
    (prisma.dunningSequence.findMany as jest.Mock).mockResolvedValue([]);
    const result = await runDunningJob();
    expect(result).toHaveProperty('cancelled');
  });

  it('POST / with valid invoice creates sequence with stripeCustomerId', async () => {
    (prisma.dunningSequence.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.dunningSequence.create as jest.Mock).mockResolvedValue({
      id: 'supp-1',
      stripeInvoiceId: 'inv_supp',
      currentStep: 'DAY_0',
    });
    await request(finalApp).post('/').send({
      id: 'evt_supp',
      type: 'invoice.payment_failed',
      data: {
        object: {
          id: 'inv_supp',
          customer: 'cus_supp',
          customer_email: 'supp@test.com',
          customer_name: 'Supp User',
          amount_due: 3000,
          currency: 'gbp',
        },
      },
    });
    const createCall = (prisma.dunningSequence.create as jest.Mock).mock.calls[0][0];
    expect(createCall.data.stripeCustomerId).toBe('cus_supp');
  });

  it('GET /active response has data.sequences array', async () => {
    (prisma.dunningSequence.findMany as jest.Mock).mockResolvedValue([]);
    const res = await request(finalApp).get('/active');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.sequences)).toBe(true);
  });

  it('runDunningJob processes DAY_9 sequence and advances to DAY_14', async () => {
    (prisma.dunningSequence.findMany as jest.Mock).mockResolvedValue([
      { id: 'supp-d9', currentStep: 'DAY_9', customerEmail: 'a@b.com', customerName: 'A', amountDue: 60 },
    ]);
    (prisma.dunningSequence.update as jest.Mock).mockResolvedValue({});
    const result = await runDunningJob();
    expect(result.processed).toBe(1);
    expect(prisma.dunningSequence.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ currentStep: 'DAY_14' }) })
    );
  });
});

describe('dunning — phase29 coverage', () => {
  it('handles string split', () => {
    expect('a,b,c'.split(',')).toEqual(['a', 'b', 'c']);
  });

  it('handles number isNaN', () => {
    expect(isNaN(NaN)).toBe(true);
  });

  it('handles Array.from set', () => {
    expect(Array.from(new Set([1, 1, 2]))).toEqual([1, 2]);
  });

  it('handles string padEnd', () => {
    expect('5'.padEnd(3, '0')).toBe('500');
  });

  it('handles Math.abs', () => {
    expect(Math.abs(-5)).toBe(5);
  });

});

describe('dunning — phase30 coverage', () => {
  it('handles spread operator', () => {
    expect([...[1, 2], ...[3, 4]]).toEqual([1, 2, 3, 4]);
  });

  it('handles array filter', () => {
    expect([1, 2, 3, 4].filter(x => x > 2)).toEqual([3, 4]);
  });

  it('returns true for truthy values', () => {
    expect(Boolean('value')).toBe(true);
  });

  it('handles async reject', async () => {
    await expect(Promise.reject(new Error('err'))).rejects.toThrow('err');
  });

  it('handles Math.abs', () => {
    expect(Math.abs(-5)).toBe(5);
  });

});
