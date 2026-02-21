import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    bugReport: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import sentryRouter from '../src/routes/webhooks/sentry';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/webhooks/sentry', sentryRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('POST /webhooks/sentry', () => {
  it('creates a bug report from Sentry event', async () => {
    const mockReport = { id: 'bug-1', sentryEventId: 'evt-1', title: 'TypeError', level: 'error' };
    (prisma.bugReport.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.bugReport.create as jest.Mock).mockResolvedValue(mockReport);

    const res = await request(app)
      .post('/webhooks/sentry')
      .send({
        data: {
          event: {
            event_id: 'evt-1',
            title: 'TypeError: Cannot read property',
            level: 'error',
            platform: 'node',
            environment: 'production',
            message: 'TypeError: Cannot read property of undefined at line 42',
          },
        },
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.bugReport.id).toBe('bug-1');
    expect(prisma.bugReport.create).toHaveBeenCalledTimes(1);
  });

  it('handles duplicate sentryEventId gracefully', async () => {
    const existingReport = { id: 'bug-dup', sentryEventId: 'evt-dup' };
    (prisma.bugReport.findUnique as jest.Mock).mockResolvedValue(existingReport);

    const res = await request(app)
      .post('/webhooks/sentry')
      .send({ data: { event: { event_id: 'evt-dup', title: 'Duplicate', message: 'Dup' } } });

    expect(res.status).toBe(200);
    expect(res.body.data.duplicate).toBe(true);
    expect(prisma.bugReport.create).not.toHaveBeenCalled();
  });

  it('returns 400 when event_id is missing', async () => {
    const res = await request(app)
      .post('/webhooks/sentry')
      .send({ data: { event: { title: 'No ID' } } });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('generates AI summary from error message', async () => {
    (prisma.bugReport.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.bugReport.create as jest.Mock).mockResolvedValue({ id: 'bug-2' });

    await request(app)
      .post('/webhooks/sentry')
      .send({ data: { event: { event_id: 'evt-2', message: 'Short error' } } });

    expect(prisma.bugReport.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ aiSummary: 'Short error' }) })
    );
  });

  it('truncates AI summary to 200 chars', async () => {
    (prisma.bugReport.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.bugReport.create as jest.Mock).mockResolvedValue({ id: 'bug-3' });
    const longMessage = 'A'.repeat(300);

    await request(app)
      .post('/webhooks/sentry')
      .send({ data: { event: { event_id: 'evt-3', message: longMessage } } });

    const createCall = (prisma.bugReport.create as jest.Mock).mock.calls[0][0];
    expect(createCall.data.aiSummary.length).toBeLessThanOrEqual(203); // 200 + '...'
  });

  it('generates GitHub issue URL stub', async () => {
    (prisma.bugReport.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.bugReport.create as jest.Mock).mockResolvedValue({ id: 'bug-4' });

    await request(app)
      .post('/webhooks/sentry')
      .send({ data: { event: { event_id: 'evt-4', title: 'NPE', message: 'null pointer' } } });

    const createCall = (prisma.bugReport.create as jest.Mock).mock.calls[0][0];
    expect(createCall.data.githubIssueUrl).toContain('github.com');
    expect(createCall.data.githubIssueUrl).toContain('NPE');
  });

  it('extracts platform and environment from event', async () => {
    (prisma.bugReport.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.bugReport.create as jest.Mock).mockResolvedValue({ id: 'bug-5' });

    await request(app)
      .post('/webhooks/sentry')
      .send({
        data: {
          event: { event_id: 'evt-5', platform: 'python', environment: 'staging', message: 'err' },
        },
      });

    expect(prisma.bugReport.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ platform: 'python', environment: 'staging' }),
      })
    );
  });

  it('defaults platform and environment when missing', async () => {
    (prisma.bugReport.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.bugReport.create as jest.Mock).mockResolvedValue({ id: 'bug-6' });

    await request(app)
      .post('/webhooks/sentry')
      .send({ data: { event: { event_id: 'evt-6', message: 'err' } } });

    expect(prisma.bugReport.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ platform: 'unknown', environment: 'production' }),
      })
    );
  });

  it('handles database errors gracefully', async () => {
    (prisma.bugReport.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.bugReport.create as jest.Mock).mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .post('/webhooks/sentry')
      .send({ data: { event: { event_id: 'evt-err', message: 'err' } } });

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('handles alternative payload structure (event at top level)', async () => {
    (prisma.bugReport.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.bugReport.create as jest.Mock).mockResolvedValue({ id: 'bug-7' });

    const res = await request(app)
      .post('/webhooks/sentry')
      .send({ event: { event_id: 'evt-7', title: 'Alt structure', message: 'alt' }, data: {} });

    expect(res.status).toBe(200);
    expect(prisma.bugReport.create).toHaveBeenCalled();
  });
});

describe('Sentry Webhook — extended', () => {
  it('success is true on successful create', async () => {
    (prisma.bugReport.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.bugReport.create as jest.Mock).mockResolvedValue({ id: 'bug-ext-1' });
    const res = await request(app)
      .post('/webhooks/sentry')
      .send({ data: { event: { event_id: 'evt-ext-1', message: 'ok' } } });
    expect(res.body.success).toBe(true);
  });

  it('findUnique is called once per request', async () => {
    (prisma.bugReport.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.bugReport.create as jest.Mock).mockResolvedValue({ id: 'bug-ext-2' });
    await request(app)
      .post('/webhooks/sentry')
      .send({ data: { event: { event_id: 'evt-ext-2', message: 'ok' } } });
    expect(prisma.bugReport.findUnique).toHaveBeenCalledTimes(1);
  });

  it('bugReport.create receives sentryEventId field', async () => {
    (prisma.bugReport.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.bugReport.create as jest.Mock).mockResolvedValue({ id: 'bug-ext-3' });
    await request(app)
      .post('/webhooks/sentry')
      .send({ data: { event: { event_id: 'evt-ext-3', message: 'data' } } });
    const createCall = (prisma.bugReport.create as jest.Mock).mock.calls[0][0];
    expect(createCall.data.sentryEventId).toBe('evt-ext-3');
  });

  it('duplicate response has duplicate: true and success: true', async () => {
    (prisma.bugReport.findUnique as jest.Mock).mockResolvedValue({ id: 'existing' });
    const res = await request(app)
      .post('/webhooks/sentry')
      .send({ data: { event: { event_id: 'dup-ext', message: 'dup' } } });
    expect(res.body.success).toBe(true);
    expect(res.body.data.duplicate).toBe(true);
  });

  it('success is false on 500 DB error', async () => {
    (prisma.bugReport.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.bugReport.create as jest.Mock).mockRejectedValue(new Error('DB error'));
    const res = await request(app)
      .post('/webhooks/sentry')
      .send({ data: { event: { event_id: 'err-ext', message: 'err' } } });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});
