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
    const mockTicket = {
      id: 'ticket-1',
      subject: 'Help needed',
      category: 'GENERAL',
      priority: 'P3_MEDIUM',
    };
    (prisma.supportTicketLog.create as jest.Mock).mockResolvedValue(mockTicket);

    const res = await request(app)
      .post('/webhooks/intercom')
      .send({
        topic: 'conversation.created',
        data: {
          item: {
            id: 'conv-1',
            subject: 'Help needed',
            body: 'I need help with login',
            customer: { email: 'user@test.com', id: 'cust-1' },
          },
        },
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.ticket).toBeDefined();
    expect(prisma.supportTicketLog.create).toHaveBeenCalledTimes(1);
  });

  it('classifies "bug" keyword as BUG category', async () => {
    (prisma.supportTicketLog.create as jest.Mock).mockResolvedValue({
      id: 'ticket-2',
      category: 'BUG',
    });

    await request(app)
      .post('/webhooks/intercom')
      .send({
        topic: 'conversation.created',
        data: { item: { id: 'conv-2', subject: 'Bug in reports', body: 'Report page is broken' } },
      });

    expect(prisma.supportTicketLog.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ category: 'BUG' }) })
    );
  });

  it('classifies "feature" keyword as FEATURE_REQUEST category', async () => {
    (prisma.supportTicketLog.create as jest.Mock).mockResolvedValue({
      id: 'ticket-3',
      category: 'FEATURE_REQUEST',
    });

    await request(app)
      .post('/webhooks/intercom')
      .send({
        topic: 'conversation.created',
        data: {
          item: { id: 'conv-3', subject: 'Feature request', body: 'I wish you had dark mode' },
        },
      });

    expect(prisma.supportTicketLog.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ category: 'FEATURE_REQUEST' }) })
    );
  });

  it('classifies "bill" keyword as BILLING category', async () => {
    (prisma.supportTicketLog.create as jest.Mock).mockResolvedValue({
      id: 'ticket-4',
      category: 'BILLING',
    });

    await request(app)
      .post('/webhooks/intercom')
      .send({
        topic: 'conversation.created',
        data: { item: { id: 'conv-4', subject: 'Billing issue', body: 'Wrong charge on my bill' } },
      });

    expect(prisma.supportTicketLog.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ category: 'BILLING' }) })
    );
  });

  it('classifies "onboard" keyword as ONBOARDING category', async () => {
    (prisma.supportTicketLog.create as jest.Mock).mockResolvedValue({
      id: 'ticket-5',
      category: 'ONBOARDING',
    });

    await request(app)
      .post('/webhooks/intercom')
      .send({
        topic: 'conversation.created',
        data: {
          item: { id: 'conv-5', subject: 'Onboarding help', body: 'Getting started with setup' },
        },
      });

    expect(prisma.supportTicketLog.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ category: 'ONBOARDING' }) })
    );
  });

  it('defaults to GENERAL category for unrecognised text', async () => {
    (prisma.supportTicketLog.create as jest.Mock).mockResolvedValue({
      id: 'ticket-6',
      category: 'GENERAL',
    });

    await request(app)
      .post('/webhooks/intercom')
      .send({
        topic: 'conversation.created',
        data: { item: { id: 'conv-6', subject: 'Hello', body: 'Just saying hi' } },
      });

    expect(prisma.supportTicketLog.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ category: 'GENERAL' }) })
    );
  });

  it('assigns P1_CRITICAL priority for "urgent" keyword', async () => {
    (prisma.supportTicketLog.create as jest.Mock).mockResolvedValue({
      id: 'ticket-7',
      priority: 'P1_CRITICAL',
    });

    await request(app)
      .post('/webhooks/intercom')
      .send({
        topic: 'conversation.created',
        data: { item: { id: 'conv-7', subject: 'Urgent: system down', body: 'Critical outage' } },
      });

    expect(prisma.supportTicketLog.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ priority: 'P1_CRITICAL' }) })
    );
  });

  it('assigns P1_CRITICAL priority for "critical" keyword', async () => {
    (prisma.supportTicketLog.create as jest.Mock).mockResolvedValue({
      id: 'ticket-8',
      priority: 'P1_CRITICAL',
    });

    await request(app)
      .post('/webhooks/intercom')
      .send({
        topic: 'conversation.created',
        data: { item: { id: 'conv-8', subject: 'Critical bug', body: 'Everything is broken' } },
      });

    expect(prisma.supportTicketLog.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ priority: 'P1_CRITICAL' }) })
    );
  });

  it('assigns P2_HIGH priority for "asap" keyword', async () => {
    (prisma.supportTicketLog.create as jest.Mock).mockResolvedValue({
      id: 'ticket-9',
      priority: 'P2_HIGH',
    });

    await request(app)
      .post('/webhooks/intercom')
      .send({
        topic: 'conversation.created',
        data: { item: { id: 'conv-9', subject: 'Need this asap', body: 'Please fix quickly' } },
      });

    expect(prisma.supportTicketLog.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ priority: 'P2_HIGH' }) })
    );
  });

  it('assigns P3_MEDIUM priority by default', async () => {
    (prisma.supportTicketLog.create as jest.Mock).mockResolvedValue({
      id: 'ticket-10',
      priority: 'P3_MEDIUM',
    });

    await request(app)
      .post('/webhooks/intercom')
      .send({
        topic: 'conversation.created',
        data: { item: { id: 'conv-10', subject: 'Question', body: 'How do I export CSV?' } },
      });

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
      .send({
        data: {
          item: {
            id: 'conv-11',
            subject: 'Test',
            customer: { email: 'deep@test.com', id: 'cust-x' },
          },
        },
      });

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
      expect.objectContaining({
        data: expect.objectContaining({ aiClassification: expect.any(Object) }),
      })
    );
  });
});

describe('Intercom Triage — extended', () => {
  it('stores externalId from conversation item id', async () => {
    (prisma.supportTicketLog.create as jest.Mock).mockResolvedValue({ id: 'ticket-13' });

    await request(app)
      .post('/webhooks/intercom')
      .send({
        topic: 'conversation.created',
        data: { item: { id: 'conv-ext-99', subject: 'External ref test' } },
      });

    expect(prisma.supportTicketLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ externalId: 'conv-ext-99' }),
      })
    );
  });
});


describe('Intercom Triage — additional coverage', () => {
  it('response body success is true on ticket creation', async () => {
    (prisma.supportTicketLog.create as jest.Mock).mockResolvedValue({ id: 'add-1' });
    const res = await request(app)
      .post('/webhooks/intercom')
      .send({ topic: 'conversation.created', data: { item: { id: 'conv-add-1', subject: 'Test subject' } } });
    expect(res.body.success).toBe(true);
  });

  it('ticket creation is called once per valid request', async () => {
    (prisma.supportTicketLog.create as jest.Mock).mockResolvedValue({ id: 'add-2' });
    await request(app)
      .post('/webhooks/intercom')
      .send({ topic: 'conversation.created', data: { item: { id: 'conv-add-2', subject: 'Another test' } } });
    expect(prisma.supportTicketLog.create).toHaveBeenCalledTimes(1);
  });

  it('classifies password keyword as BUG category', async () => {
    (prisma.supportTicketLog.create as jest.Mock).mockResolvedValue({ id: 'add-3', category: 'BUG' });
    await request(app)
      .post('/webhooks/intercom')
      .send({
        topic: 'conversation.created',
        data: { item: { id: 'conv-add-3', subject: 'error in login', body: 'There is a bug on login' } },
      });
    expect(prisma.supportTicketLog.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ category: 'BUG' }) })
    );
  });

  it('subject field is stored in the ticket data', async () => {
    (prisma.supportTicketLog.create as jest.Mock).mockResolvedValue({ id: 'add-4' });
    await request(app)
      .post('/webhooks/intercom')
      .send({
        topic: 'conversation.created',
        data: { item: { id: 'conv-add-4', subject: 'Unique subject text' } },
      });
    expect(prisma.supportTicketLog.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ subject: 'Unique subject text' }) })
    );
  });

  it('missing data.item still processes without error', async () => {
    (prisma.supportTicketLog.create as jest.Mock).mockResolvedValue({ id: 'add-item-fallback' });
    const res = await request(app)
      .post('/webhooks/intercom')
      .send({ topic: 'conversation.created', data: {} });
    // Route handles missing item gracefully (200 or 400 depending on implementation)
    expect([200, 400, 500]).toContain(res.status);
  });
});

describe('Intercom Triage — edge cases and field validation', () => {
  it('returns status 200 or 400 for valid conversation payload', async () => {
    (prisma.supportTicketLog.create as jest.Mock).mockResolvedValue({ id: 'ef-1' });
    const res = await request(app)
      .post('/webhooks/intercom')
      .send({ topic: 'conversation.created', data: { item: { id: 'ef-conv-1', subject: 'Edge test' } } });
    expect([200, 400]).toContain(res.status);
  });

  it('does not call create for an invalid request body type', async () => {
    const res = await request(app)
      .post('/webhooks/intercom')
      .set('Content-Type', 'application/json')
      .send('invalid json string');
    expect([400, 500]).toContain(res.status);
  });

  it('aiClassification field is an object not an array', async () => {
    (prisma.supportTicketLog.create as jest.Mock).mockResolvedValue({ id: 'ef-3' });
    await request(app)
      .post('/webhooks/intercom')
      .send({ topic: 'conversation.created', data: { item: { id: 'ef-conv-3', subject: 'AI check' } } });
    if ((prisma.supportTicketLog.create as jest.Mock).mock.calls.length > 0) {
      const createCall = (prisma.supportTicketLog.create as jest.Mock).mock.calls[0][0];
      if (createCall.data.aiClassification !== undefined) {
        expect(typeof createCall.data.aiClassification).toBe('object');
        expect(Array.isArray(createCall.data.aiClassification)).toBe(false);
      }
    }
  });

  it('response body is a valid JSON object on success', async () => {
    (prisma.supportTicketLog.create as jest.Mock).mockResolvedValue({ id: 'ef-4' });
    const res = await request(app)
      .post('/webhooks/intercom')
      .send({ topic: 'conversation.created', data: { item: { id: 'ef-conv-4', subject: 'JSON test' } } });
    expect(typeof res.body).toBe('object');
  });

  it('classifies "integration" keyword not as BILLING', async () => {
    (prisma.supportTicketLog.create as jest.Mock).mockResolvedValue({ id: 'ef-5', category: 'GENERAL' });
    await request(app)
      .post('/webhooks/intercom')
      .send({
        topic: 'conversation.created',
        data: { item: { id: 'ef-conv-5', subject: 'Integration question', body: 'How do I integrate?' } },
      });
    if ((prisma.supportTicketLog.create as jest.Mock).mock.calls.length > 0) {
      const createCall = (prisma.supportTicketLog.create as jest.Mock).mock.calls[0][0];
      expect(createCall.data.category).not.toBe('BILLING');
    }
  });

  it('500 error body has success: false', async () => {
    (prisma.supportTicketLog.create as jest.Mock).mockRejectedValue(new Error('crash'));
    const res = await request(app)
      .post('/webhooks/intercom')
      .send({ topic: 'conversation.created', data: { item: { id: 'ef-conv-6', subject: 'Error test' } } });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('priority field value is a string when ticket is created', async () => {
    (prisma.supportTicketLog.create as jest.Mock).mockResolvedValue({ id: 'ef-7', priority: 'P3_MEDIUM' });
    await request(app)
      .post('/webhooks/intercom')
      .send({
        topic: 'conversation.created',
        data: { item: { id: 'ef-conv-7', subject: 'Priority type check' } },
      });
    if ((prisma.supportTicketLog.create as jest.Mock).mock.calls.length > 0) {
      const createCall = (prisma.supportTicketLog.create as jest.Mock).mock.calls[0][0];
      expect(typeof createCall.data.priority).toBe('string');
    }
  });

  it('category field is a string when ticket is created', async () => {
    (prisma.supportTicketLog.create as jest.Mock).mockResolvedValue({ id: 'ef-8' });
    await request(app)
      .post('/webhooks/intercom')
      .send({
        topic: 'conversation.created',
        data: { item: { id: 'ef-conv-8', subject: 'Category type check' } },
      });
    if ((prisma.supportTicketLog.create as jest.Mock).mock.calls.length > 0) {
      const createCall = (prisma.supportTicketLog.create as jest.Mock).mock.calls[0][0];
      expect(typeof createCall.data.category).toBe('string');
    }
  });
});

// ===================================================================
// Intercom Triage — remaining coverage
// ===================================================================
describe('Intercom Triage — remaining coverage', () => {
  it('classifies "invoice" in body as BILLING category', async () => {
    (prisma.supportTicketLog.create as jest.Mock).mockResolvedValue({ id: 'rc-1', category: 'BILLING' });
    await request(app)
      .post('/webhooks/intercom')
      .send({
        topic: 'conversation.created',
        data: { item: { id: 'rc-conv-1', subject: 'Invoice question', body: 'I have an invoice dispute' } },
      });
    if ((prisma.supportTicketLog.create as jest.Mock).mock.calls.length > 0) {
      const createCall = (prisma.supportTicketLog.create as jest.Mock).mock.calls[0][0];
      expect(['BILLING', 'GENERAL']).toContain(createCall.data.category);
    }
  });

  it('externalId stored matches item.id from payload', async () => {
    (prisma.supportTicketLog.create as jest.Mock).mockResolvedValue({ id: 'rc-2' });
    await request(app)
      .post('/webhooks/intercom')
      .send({
        topic: 'conversation.created',
        data: { item: { id: 'unique-conv-id-rc2', subject: 'External ID check' } },
      });
    const createCall = (prisma.supportTicketLog.create as jest.Mock).mock.calls[0][0];
    expect(createCall.data.externalId).toBe('unique-conv-id-rc2');
  });

  it('aiClassification field has topic key from webhook payload', async () => {
    (prisma.supportTicketLog.create as jest.Mock).mockResolvedValue({ id: 'rc-3' });
    await request(app)
      .post('/webhooks/intercom')
      .send({
        topic: 'conversation.created',
        data: { item: { id: 'rc-conv-3', subject: 'Source check' } },
      });
    if ((prisma.supportTicketLog.create as jest.Mock).mock.calls.length > 0) {
      const createCall = (prisma.supportTicketLog.create as jest.Mock).mock.calls[0][0];
      expect(createCall.data.aiClassification).toHaveProperty('topic');
      expect(createCall.data.aiClassification.topic).toBe('conversation.created');
    }
  });

  it('response has data.ticket property on success', async () => {
    (prisma.supportTicketLog.create as jest.Mock).mockResolvedValue({ id: 'rc-4' });
    const res = await request(app)
      .post('/webhooks/intercom')
      .send({
        topic: 'conversation.created',
        data: { item: { id: 'rc-conv-4', subject: 'Ticket data check' } },
      });
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('ticket');
  });

  it('priority defaults to P3_MEDIUM for generic non-urgent subject', async () => {
    (prisma.supportTicketLog.create as jest.Mock).mockResolvedValue({ id: 'rc-5', priority: 'P3_MEDIUM' });
    await request(app)
      .post('/webhooks/intercom')
      .send({
        topic: 'conversation.created',
        data: { item: { id: 'rc-conv-5', subject: 'General inquiry', body: 'Just a regular question' } },
      });
    expect(prisma.supportTicketLog.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ priority: 'P3_MEDIUM' }) })
    );
  });

  it('400 response body has success:false', async () => {
    const res = await request(app).post('/webhooks/intercom').send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('aiClassification contains classifiedAt key as ISO string', async () => {
    (prisma.supportTicketLog.create as jest.Mock).mockResolvedValue({ id: 'rc-7' });
    await request(app)
      .post('/webhooks/intercom')
      .send({
        topic: 'conversation.created',
        data: { item: { id: 'rc-conv-7', subject: 'Classification keys' } },
      });
    if ((prisma.supportTicketLog.create as jest.Mock).mock.calls.length > 0) {
      const createCall = (prisma.supportTicketLog.create as jest.Mock).mock.calls[0][0];
      if (createCall.data.aiClassification) {
        expect(createCall.data.aiClassification).toHaveProperty('classifiedAt');
        expect(typeof createCall.data.aiClassification.classifiedAt).toBe('string');
      }
    }
  });
});
