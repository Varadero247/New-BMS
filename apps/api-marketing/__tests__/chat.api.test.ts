import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    mktChatSession: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    mktLead: {
      create: jest.fn(),
    },
  },
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

global.fetch = jest.fn() as unknown as typeof globalThis.fetch;

import chatRouter from '../src/routes/chat';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/chat', chatRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

const mockSession = {
  id: 'session-1',
  visitorId: null,
  messages: '[]',
  captured: false,
  capturedData: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// ===================================================================
// POST /api/chat/start
// ===================================================================

describe('POST /api/chat/start', () => {
  it('creates a new chat session', async () => {
    (prisma.mktChatSession.create as jest.Mock).mockResolvedValue(mockSession);
    (prisma.mktChatSession.update as jest.Mock).mockResolvedValue(mockSession);

    const res = await request(app).post('/api/chat/start').send({});

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.sessionId).toBe('session-1');
    expect(res.body.data.message).toContain('Aria');
  });

  it('accepts optional visitorId', async () => {
    (prisma.mktChatSession.create as jest.Mock).mockResolvedValue(mockSession);
    (prisma.mktChatSession.update as jest.Mock).mockResolvedValue(mockSession);

    const res = await request(app).post('/api/chat/start').send({ visitorId: 'visitor-123' });

    expect(res.status).toBe(200);
    expect(prisma.mktChatSession.create).toHaveBeenCalled();
  });

  it('returns 500 on database error', async () => {
    (prisma.mktChatSession.create as jest.Mock).mockRejectedValue(new Error('DB error'));

    const res = await request(app).post('/api/chat/start').send({});

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// POST /api/chat/message
// ===================================================================

describe('POST /api/chat/message', () => {
  it('returns 400 for missing sessionId', async () => {
    const res = await request(app).post('/api/chat/message').send({ message: 'hello' });

    expect(res.status).toBe(400);
  });

  it('returns 400 for missing message', async () => {
    const res = await request(app)
      .post('/api/chat/message')
      .send({ sessionId: '00000000-0000-0000-0000-000000000001' });

    expect(res.status).toBe(400);
  });

  it('returns 404 for non-existent session', async () => {
    (prisma.mktChatSession.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app)
      .post('/api/chat/message')
      .send({ sessionId: '00000000-0000-0000-0000-000000000099', message: 'hello' });

    expect(res.status).toBe(404);
  });

  it('processes message and returns response', async () => {
    const session = {
      ...mockSession,
      messages: JSON.stringify([{ role: 'assistant', content: 'Hi!' }]),
    };
    (prisma.mktChatSession.findUnique as jest.Mock).mockResolvedValue(session);
    (prisma.mktChatSession.update as jest.Mock).mockResolvedValue(session);

    const res = await request(app)
      .post('/api/chat/message')
      .send({ sessionId: '00000000-0000-0000-0000-000000000001', message: 'I need ISO 9001 help' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.message).toBeDefined();
  });

  it('processes message with AI when API key is set', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ content: [{ text: 'AI response' }] }),
    });

    const session = {
      ...mockSession,
      messages: JSON.stringify([{ role: 'assistant', content: 'Hi!' }]),
    };
    (prisma.mktChatSession.findUnique as jest.Mock).mockResolvedValue(session);
    (prisma.mktChatSession.update as jest.Mock).mockResolvedValue(session);

    const res = await request(app)
      .post('/api/chat/message')
      .send({ sessionId: '00000000-0000-0000-0000-000000000001', message: 'hello' });

    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe('AI response');
    delete process.env.ANTHROPIC_API_KEY;
  });

  it('detects CAPTURE JSON and saves lead', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    const captureResponse =
      'Thanks! CAPTURE:{"name":"Jane","email":"jane@test.com","isoStandards":"9001","companySize":"50","isDecisionMaker":true,"preferredDemoTime":"morning"}';
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ content: [{ text: captureResponse }] }),
    });

    const session = {
      ...mockSession,
      messages: JSON.stringify([{ role: 'assistant', content: 'Hi!' }]),
    };
    (prisma.mktChatSession.findUnique as jest.Mock).mockResolvedValue(session);
    (prisma.mktChatSession.update as jest.Mock).mockResolvedValue(session);
    (prisma.mktLead.create as jest.Mock).mockResolvedValue({ id: 'lead-1' });

    const res = await request(app).post('/api/chat/message').send({
      sessionId: '00000000-0000-0000-0000-000000000001',
      message: 'my email is jane@test.com',
    });

    expect(res.body.data.captured).toBe(true);
    expect(res.body.data.message).not.toContain('CAPTURE:');
    expect(prisma.mktLead.create).toHaveBeenCalled();
    delete process.env.ANTHROPIC_API_KEY;
  });

  it('strips CAPTURE JSON from displayed message', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          content: [
            {
              text: 'Great! CAPTURE:{"name":"Jane","email":"j@t.com","isoStandards":"9001","companySize":"50","isDecisionMaker":true,"preferredDemoTime":"am"} I will send you info.',
            },
          ],
        }),
    });

    const session = { ...mockSession, messages: JSON.stringify([]) };
    (prisma.mktChatSession.findUnique as jest.Mock).mockResolvedValue(session);
    (prisma.mktChatSession.update as jest.Mock).mockResolvedValue(session);
    (prisma.mktLead.create as jest.Mock).mockResolvedValue({ id: 'lead-1' });

    const res = await request(app)
      .post('/api/chat/message')
      .send({ sessionId: '00000000-0000-0000-0000-000000000001', message: 'test' });

    expect(res.body.data.message).not.toContain('CAPTURE');
    delete process.env.ANTHROPIC_API_KEY;
  });

  it('rejects messages over 2000 characters', async () => {
    const res = await request(app)
      .post('/api/chat/message')
      .send({ sessionId: '00000000-0000-0000-0000-000000000001', message: 'a'.repeat(2001) });

    expect(res.status).toBe(400);
  });
});

// ===================================================================
// GET /api/chat/session/:id
// ===================================================================

describe('GET /api/chat/session/:id', () => {
  it('returns session with parsed messages', async () => {
    const session = {
      ...mockSession,
      messages: JSON.stringify([{ role: 'assistant', content: 'Hi' }]),
    };
    (prisma.mktChatSession.findUnique as jest.Mock).mockResolvedValue(session);

    const res = await request(app).get('/api/chat/session/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.messages).toEqual([{ role: 'assistant', content: 'Hi' }]);
  });

  it('returns 404 for non-existent session', async () => {
    (prisma.mktChatSession.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get('/api/chat/session/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });
});

describe('Marketing Chat — extended', () => {
  it('POST /start returns success:true in response body', async () => {
    (prisma.mktChatSession.create as jest.Mock).mockResolvedValue(mockSession);
    (prisma.mktChatSession.update as jest.Mock).mockResolvedValue(mockSession);

    const res = await request(app).post('/api/chat/start').send({});

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /session/:id returns 500 when findUnique throws', async () => {
    (prisma.mktChatSession.findUnique as jest.Mock).mockRejectedValue(new Error('DB down'));

    const res = await request(app).get('/api/chat/session/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(500);
  });
});

describe('Chat — additional coverage', () => {
  it('POST /start calls prisma.mktChatSession.create exactly once', async () => {
    (prisma.mktChatSession.create as jest.Mock).mockResolvedValue(mockSession);
    (prisma.mktChatSession.update as jest.Mock).mockResolvedValue(mockSession);

    await request(app).post('/api/chat/start').send({});

    expect(prisma.mktChatSession.create).toHaveBeenCalledTimes(1);
  });

  it('POST /message returns 400 for empty string message', async () => {
    const res = await request(app)
      .post('/api/chat/message')
      .send({ sessionId: '00000000-0000-0000-0000-000000000001', message: '' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('GET /session/:id returns messages array in data', async () => {
    const sessionWithMsgs = { ...mockSession, messages: JSON.stringify([{ role: 'assistant', content: 'Hi' }]) };
    (prisma.mktChatSession.findUnique as jest.Mock).mockResolvedValue(sessionWithMsgs);

    const res = await request(app).get('/api/chat/session/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.messages)).toBe(true);
    expect(res.body.data.messages).toHaveLength(1);
  });

  it('POST /message without API key falls back to default assistant message', async () => {
    delete process.env.ANTHROPIC_API_KEY;
    const session = { ...mockSession, messages: JSON.stringify([]) };
    (prisma.mktChatSession.findUnique as jest.Mock).mockResolvedValue(session);
    (prisma.mktChatSession.update as jest.Mock).mockResolvedValue(session);

    const res = await request(app)
      .post('/api/chat/message')
      .send({ sessionId: '00000000-0000-0000-0000-000000000001', message: 'hello' });

    expect(res.status).toBe(200);
    expect(typeof res.body.data.message).toBe('string');
    expect(res.body.data.message.length).toBeGreaterThan(0);
  });

  it('POST /message calls mktChatSession.update after processing', async () => {
    const session = { ...mockSession, messages: JSON.stringify([]) };
    (prisma.mktChatSession.findUnique as jest.Mock).mockResolvedValue(session);
    (prisma.mktChatSession.update as jest.Mock).mockResolvedValue(session);

    await request(app)
      .post('/api/chat/message')
      .send({ sessionId: '00000000-0000-0000-0000-000000000001', message: 'hello' });

    expect(prisma.mktChatSession.update).toHaveBeenCalledTimes(1);
  });
});
