import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    meetingNote: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
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

import meetingsRouter from '../src/routes/meetings';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/meetings', meetingsRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

const sampleMeeting = {
  id: '00000000-0000-0000-0000-000000000001',
  title: 'Weekly Standup',
  type: 'TEAM',
  date: '2026-02-15T10:00:00.000Z',
  attendees: ['Alice', 'Bob'],
  summary: 'Discussed sprint progress',
  actionItems: [
    { text: 'Deploy feature', completed: false },
    { text: 'Write docs', completed: true },
  ],
  createdAt: '2026-02-15T10:00:00.000Z',
};

// ---------------------------------------------------------------------------
// GET /api/meetings
// ---------------------------------------------------------------------------
describe('GET /api/meetings', () => {
  it('lists meetings with pagination', async () => {
    (prisma.meetingNote.findMany as jest.Mock).mockResolvedValue([sampleMeeting]);
    (prisma.meetingNote.count as jest.Mock).mockResolvedValue(1);

    const res = await request(app).get('/api/meetings');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.meetings).toHaveLength(1);
    expect(res.body.data.pagination.total).toBe(1);
  });

  it('filters by type', async () => {
    (prisma.meetingNote.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.meetingNote.count as jest.Mock).mockResolvedValue(0);

    await request(app).get('/api/meetings?type=BOARD');
    expect(prisma.meetingNote.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { type: 'BOARD' } })
    );
  });

  it('supports pagination parameters', async () => {
    (prisma.meetingNote.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.meetingNote.count as jest.Mock).mockResolvedValue(0);

    await request(app).get('/api/meetings?page=2&limit=5');
    expect(prisma.meetingNote.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 5, take: 5 })
    );
  });
});

// ---------------------------------------------------------------------------
// GET /api/meetings/:id
// ---------------------------------------------------------------------------
describe('GET /api/meetings/:id', () => {
  it('returns a single meeting', async () => {
    (prisma.meetingNote.findUnique as jest.Mock).mockResolvedValue(sampleMeeting);
    const res = await request(app).get('/api/meetings/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Weekly Standup');
  });

  it('returns 404 for missing meeting', async () => {
    (prisma.meetingNote.findUnique as jest.Mock).mockResolvedValue(null);
    const res = await request(app).get('/api/meetings/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
  });
});

// ---------------------------------------------------------------------------
// POST /api/meetings
// ---------------------------------------------------------------------------
describe('POST /api/meetings', () => {
  it('creates a new meeting', async () => {
    (prisma.meetingNote.create as jest.Mock).mockResolvedValue(sampleMeeting);

    const res = await request(app)
      .post('/api/meetings')
      .send({
        title: 'Weekly Standup',
        type: 'TEAM',
        date: '2026-02-15',
        attendees: ['Alice', 'Bob'],
        summary: 'Discussed sprint progress',
      });
    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('Weekly Standup');
  });

  it('returns 400 when required fields are missing', async () => {
    const res = await request(app).post('/api/meetings').send({ title: 'No type' });
    expect(res.status).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// PATCH /api/meetings/:id
// ---------------------------------------------------------------------------
describe('PATCH /api/meetings/:id', () => {
  it('updates a meeting', async () => {
    (prisma.meetingNote.findUnique as jest.Mock).mockResolvedValue(sampleMeeting);
    (prisma.meetingNote.update as jest.Mock).mockResolvedValue({
      ...sampleMeeting,
      summary: 'Updated summary',
    });

    const res = await request(app)
      .patch('/api/meetings/00000000-0000-0000-0000-000000000001')
      .send({ summary: 'Updated summary' });
    expect(res.status).toBe(200);
    expect(res.body.data.summary).toBe('Updated summary');
  });
});

// ---------------------------------------------------------------------------
// DELETE /api/meetings/:id
// ---------------------------------------------------------------------------
describe('DELETE /api/meetings/:id', () => {
  it('deletes a meeting', async () => {
    (prisma.meetingNote.findUnique as jest.Mock).mockResolvedValue(sampleMeeting);
    (prisma.meetingNote.delete as jest.Mock).mockResolvedValue(sampleMeeting);

    const res = await request(app).delete('/api/meetings/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe('Meeting deleted');
  });

  it('returns 404 when meeting not found', async () => {
    (prisma.meetingNote.findUnique as jest.Mock).mockResolvedValue(null);
    const res = await request(app).delete('/api/meetings/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
  });
});

// ---------------------------------------------------------------------------
// PATCH /api/meetings/:id/actions/:actionIndex
// ---------------------------------------------------------------------------
describe('PATCH /api/meetings/:id/actions/:actionIndex', () => {
  it('toggles action item completed', async () => {
    (prisma.meetingNote.findUnique as jest.Mock).mockResolvedValue(sampleMeeting);
    (prisma.meetingNote.update as jest.Mock).mockResolvedValue({
      ...sampleMeeting,
      actionItems: [
        { text: 'Deploy feature', completed: true },
        { text: 'Write docs', completed: true },
      ],
    });

    const res = await request(app).patch(
      '/api/meetings/00000000-0000-0000-0000-000000000001/actions/0'
    );
    expect(res.status).toBe(200);
    expect(prisma.meetingNote.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          actionItems: expect.arrayContaining([
            expect.objectContaining({ text: 'Deploy feature', completed: true }),
          ]),
        },
      })
    );
  });

  it('returns 400 for invalid action index', async () => {
    (prisma.meetingNote.findUnique as jest.Mock).mockResolvedValue(sampleMeeting);
    const res = await request(app).patch(
      '/api/meetings/00000000-0000-0000-0000-000000000001/actions/99'
    );
    expect(res.status).toBe(400);
  });
});
