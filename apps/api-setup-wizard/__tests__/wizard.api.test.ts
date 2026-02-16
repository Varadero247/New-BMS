import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    setupWizard: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    setupWizardStep: {
      update: jest.fn(),
    },
  },
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import wizardRouter from '../src/routes/wizard';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
// Mock auth middleware — inject user
app.use((req: any, _res: any, next: any) => {
  req.user = { id: 'user-1', organisationId: 'org-1' };
  next();
});
app.use('/api/wizard', wizardRouter);

beforeEach(() => { jest.clearAllMocks(); });

const mockWizard = {
  id: 'wiz-1',
  organisationId: 'org-1',
  userId: 'user-1',
  status: 'IN_PROGRESS',
  currentStep: 0,
  completedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  steps: [
    { id: 's1', wizardId: 'wiz-1', stepIndex: 0, title: 'ISO Standard Selection', status: 'PENDING', data: {}, completedAt: null },
    { id: 's2', wizardId: 'wiz-1', stepIndex: 1, title: 'Document Seeding', status: 'PENDING', data: {}, completedAt: null },
    { id: 's3', wizardId: 'wiz-1', stepIndex: 2, title: 'Team Invitation', status: 'PENDING', data: {}, completedAt: null },
    { id: 's4', wizardId: 'wiz-1', stepIndex: 3, title: 'Pre-Audit Summary', status: 'PENDING', data: {}, completedAt: null },
  ],
};

// ============================================
// GET /api/wizard/status
// ============================================
describe('GET /api/wizard/status', () => {
  it('returns exists: false when no wizard exists', async () => {
    (prisma.setupWizard.findUnique as jest.Mock).mockResolvedValue(null);
    const res = await request(app).get('/api/wizard/status');
    expect(res.status).toBe(200);
    expect(res.body.data.exists).toBe(false);
  });

  it('returns wizard data when exists', async () => {
    (prisma.setupWizard.findUnique as jest.Mock).mockResolvedValue(mockWizard);
    const res = await request(app).get('/api/wizard/status');
    expect(res.status).toBe(200);
    expect(res.body.data.exists).toBe(true);
    expect(res.body.data.status).toBe('IN_PROGRESS');
    expect(res.body.data.steps).toHaveLength(4);
  });
});

// ============================================
// POST /api/wizard/init
// ============================================
describe('POST /api/wizard/init', () => {
  it('creates a new wizard when none exists', async () => {
    (prisma.setupWizard.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.setupWizard.create as jest.Mock).mockResolvedValue(mockWizard);
    const res = await request(app).post('/api/wizard/init');
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(prisma.setupWizard.create).toHaveBeenCalled();
  });

  it('returns 409 if wizard already exists', async () => {
    (prisma.setupWizard.findUnique as jest.Mock).mockResolvedValue(mockWizard);
    const res = await request(app).post('/api/wizard/init');
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('ALREADY_EXISTS');
  });
});

// ============================================
// PATCH /api/wizard/step/:stepIndex
// ============================================
describe('PATCH /api/wizard/step/:stepIndex', () => {
  it('updates a step with valid data', async () => {
    (prisma.setupWizard.findUnique as jest.Mock).mockResolvedValue(mockWizard);
    (prisma.setupWizardStep.update as jest.Mock).mockResolvedValue({ ...mockWizard.steps[0], status: 'COMPLETED' });
    (prisma.setupWizard.update as jest.Mock).mockResolvedValue({ ...mockWizard, currentStep: 1 });

    const res = await request(app)
      .patch('/api/wizard/step/0')
      .send({ data: { selectedStandards: ['iso9001', 'iso14001'] } });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns 400 for invalid step index', async () => {
    const res = await request(app).patch('/api/wizard/step/5').send({ data: {} });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 404 when wizard not initialized', async () => {
    (prisma.setupWizard.findUnique as jest.Mock).mockResolvedValue(null);
    const res = await request(app).patch('/api/wizard/step/0').send({ data: {} });
    expect(res.status).toBe(404);
  });

  it('returns 400 when wizard already completed', async () => {
    (prisma.setupWizard.findUnique as jest.Mock).mockResolvedValue({ ...mockWizard, status: 'COMPLETED' });
    const res = await request(app).patch('/api/wizard/step/0').send({ data: {} });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('ALREADY_COMPLETED');
  });
});

// ============================================
// POST /api/wizard/complete
// ============================================
describe('POST /api/wizard/complete', () => {
  it('marks wizard as completed', async () => {
    (prisma.setupWizard.findUnique as jest.Mock).mockResolvedValue(mockWizard);
    (prisma.setupWizard.update as jest.Mock).mockResolvedValue({
      ...mockWizard,
      status: 'COMPLETED',
      completedAt: new Date(),
    });

    const res = await request(app).post('/api/wizard/complete');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns 404 when wizard not found', async () => {
    (prisma.setupWizard.findUnique as jest.Mock).mockResolvedValue(null);
    const res = await request(app).post('/api/wizard/complete');
    expect(res.status).toBe(404);
  });

  it('returns 400 when already completed', async () => {
    (prisma.setupWizard.findUnique as jest.Mock).mockResolvedValue({ ...mockWizard, status: 'COMPLETED' });
    const res = await request(app).post('/api/wizard/complete');
    expect(res.status).toBe(400);
  });
});

// ============================================
// POST /api/wizard/skip
// ============================================
describe('POST /api/wizard/skip', () => {
  it('skips wizard when none exists', async () => {
    (prisma.setupWizard.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.setupWizard.create as jest.Mock).mockResolvedValue({ ...mockWizard, status: 'SKIPPED' });

    const res = await request(app).post('/api/wizard/skip');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('skips existing in-progress wizard', async () => {
    (prisma.setupWizard.findUnique as jest.Mock).mockResolvedValue(mockWizard);
    (prisma.setupWizard.update as jest.Mock).mockResolvedValue({ ...mockWizard, status: 'SKIPPED' });

    const res = await request(app).post('/api/wizard/skip');
    expect(res.status).toBe(200);
  });

  it('returns existing when already completed', async () => {
    const completed = { ...mockWizard, status: 'COMPLETED' };
    (prisma.setupWizard.findUnique as jest.Mock).mockResolvedValue(completed);

    const res = await request(app).post('/api/wizard/skip');
    expect(res.status).toBe(200);
  });
});

// ============================================
// Auth guard
// ============================================
describe('Auth guard', () => {
  it('returns 401 when no user on request', async () => {
    const noAuthApp = express();
    noAuthApp.use(express.json());
    noAuthApp.use('/api/wizard', wizardRouter);

    const res = await request(noAuthApp).get('/api/wizard/status');
    expect(res.status).toBe(401);
  });
});
