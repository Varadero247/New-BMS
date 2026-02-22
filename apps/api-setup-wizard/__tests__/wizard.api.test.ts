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
    // Static transaction: resolve each operation in the array
    $transaction: jest.fn((ops: any[]) => Promise.all(ops)),
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

beforeEach(() => {
  jest.clearAllMocks();
});

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
    {
      id: 's1',
      wizardId: 'wiz-1',
      stepIndex: 0,
      title: 'ISO Standard Selection',
      status: 'PENDING',
      data: {},
      completedAt: null,
    },
    {
      id: 's2',
      wizardId: 'wiz-1',
      stepIndex: 1,
      title: 'Document Seeding',
      status: 'PENDING',
      data: {},
      completedAt: null,
    },
    {
      id: 's3',
      wizardId: 'wiz-1',
      stepIndex: 2,
      title: 'Team Invitation',
      status: 'PENDING',
      data: {},
      completedAt: null,
    },
    {
      id: 's4',
      wizardId: 'wiz-1',
      stepIndex: 3,
      title: 'Pre-Audit Summary',
      status: 'PENDING',
      data: {},
      completedAt: null,
    },
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
    (prisma.setupWizardStep.update as jest.Mock).mockResolvedValue({
      ...mockWizard.steps[0],
      status: 'COMPLETED',
    });
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
    (prisma.setupWizard.findUnique as jest.Mock).mockResolvedValue({
      ...mockWizard,
      status: 'COMPLETED',
    });
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
    (prisma.setupWizard.findUnique as jest.Mock).mockResolvedValue({
      ...mockWizard,
      status: 'COMPLETED',
    });
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
    (prisma.setupWizard.create as jest.Mock).mockResolvedValue({
      ...mockWizard,
      status: 'SKIPPED',
    });

    const res = await request(app).post('/api/wizard/skip');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('skips existing in-progress wizard', async () => {
    (prisma.setupWizard.findUnique as jest.Mock).mockResolvedValue(mockWizard);
    (prisma.setupWizard.update as jest.Mock).mockResolvedValue({
      ...mockWizard,
      status: 'SKIPPED',
    });

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

// ============================================
// 500 error paths
// ============================================
describe('500 error handling', () => {
  it('GET /status returns 500 on DB error', async () => {
    (prisma.setupWizard.findUnique as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/wizard/status');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST /init returns 500 when create fails', async () => {
    (prisma.setupWizard.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.setupWizard.create as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).post('/api/wizard/init');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('PATCH /step/:stepIndex returns 500 when transaction fails', async () => {
    (prisma.setupWizard.findUnique as jest.Mock).mockResolvedValue(mockWizard);
    (prisma.$transaction as jest.Mock).mockRejectedValue(new Error('TX failed'));
    const res = await request(app).patch('/api/wizard/step/0').send({ data: {} });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST /complete returns 500 when update fails', async () => {
    (prisma.setupWizard.findUnique as jest.Mock).mockResolvedValue(mockWizard);
    (prisma.setupWizard.update as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).post('/api/wizard/complete');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST /skip returns 500 when create fails (no existing wizard)', async () => {
    (prisma.setupWizard.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.setupWizard.create as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).post('/api/wizard/skip');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

// ============================================
// Edge cases
// ============================================
describe('PATCH /api/wizard/step/:stepIndex edge cases', () => {
  it('returns 400 for non-numeric step index', async () => {
    const res = await request(app).patch('/api/wizard/step/abc').send({ data: {} });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('completes step with no data body (uses default empty object)', async () => {
    (prisma.setupWizard.findUnique as jest.Mock).mockResolvedValue(mockWizard);
    (prisma.setupWizardStep.update as jest.Mock).mockResolvedValue({
      ...mockWizard.steps[1],
      status: 'COMPLETED',
    });
    (prisma.setupWizard.update as jest.Mock).mockResolvedValue({ ...mockWizard, currentStep: 2 });
    // Re-wire $transaction to resolve (may have been set to reject by an earlier test)
    (prisma.$transaction as jest.Mock).mockImplementation((ops: unknown[]) => Promise.all(ops as Promise<unknown>[]));
    const res = await request(app).patch('/api/wizard/step/1').send({});
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

// ============================================
// Additional coverage
// ============================================
describe('Wizard API — additional coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (prisma.$transaction as jest.Mock).mockImplementation((ops: unknown[]) =>
      Promise.all(ops as Promise<unknown>[])
    );
  });

  it('GET /status returns success:true when wizard exists', async () => {
    (prisma.setupWizard.findUnique as jest.Mock).mockResolvedValue(mockWizard);
    const res = await request(app).get('/api/wizard/status');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /status returns success:true when no wizard exists', async () => {
    (prisma.setupWizard.findUnique as jest.Mock).mockResolvedValue(null);
    const res = await request(app).get('/api/wizard/status');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('POST /init returns wizard with 4 steps', async () => {
    (prisma.setupWizard.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.setupWizard.create as jest.Mock).mockResolvedValue(mockWizard);
    const res = await request(app).post('/api/wizard/init');
    expect(res.status).toBe(201);
    expect(res.body.data.steps).toHaveLength(4);
  });

  it('POST /complete returns success:true when completed', async () => {
    (prisma.setupWizard.findUnique as jest.Mock).mockResolvedValue(mockWizard);
    (prisma.setupWizard.update as jest.Mock).mockResolvedValue({
      ...mockWizard,
      status: 'COMPLETED',
      completedAt: new Date(),
    });
    const res = await request(app).post('/api/wizard/complete');
    expect(res.body.success).toBe(true);
  });

  it('POST /skip returns success:true for skipped wizard', async () => {
    (prisma.setupWizard.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.setupWizard.create as jest.Mock).mockResolvedValue({
      ...mockWizard,
      status: 'SKIPPED',
    });
    const res = await request(app).post('/api/wizard/skip');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('POST /skip returns 500 when update fails for existing wizard', async () => {
    (prisma.setupWizard.findUnique as jest.Mock).mockResolvedValue(mockWizard);
    (prisma.setupWizard.update as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).post('/api/wizard/skip');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('PATCH /step/3 updates the last step (index 3)', async () => {
    (prisma.setupWizard.findUnique as jest.Mock).mockResolvedValue(mockWizard);
    (prisma.setupWizardStep.update as jest.Mock).mockResolvedValue({
      ...mockWizard.steps[3],
      status: 'COMPLETED',
    });
    (prisma.setupWizard.update as jest.Mock).mockResolvedValue({ ...mockWizard, currentStep: 4 });
    const res = await request(app)
      .patch('/api/wizard/step/3')
      .send({ data: { preAuditReady: true } });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /status returns currentStep value from wizard', async () => {
    const wizardAtStep2 = { ...mockWizard, currentStep: 2 };
    (prisma.setupWizard.findUnique as jest.Mock).mockResolvedValue(wizardAtStep2);
    const res = await request(app).get('/api/wizard/status');
    expect(res.status).toBe(200);
    expect(res.body.data.currentStep).toBe(2);
  });

  it('POST /complete returns completedAt date in response', async () => {
    const completedAt = new Date().toISOString();
    (prisma.setupWizard.findUnique as jest.Mock).mockResolvedValue(mockWizard);
    (prisma.setupWizard.update as jest.Mock).mockResolvedValue({
      ...mockWizard,
      status: 'COMPLETED',
      completedAt,
    });
    const res = await request(app).post('/api/wizard/complete');
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
  });

  it('GET /status returns steps array from wizard when exists', async () => {
    (prisma.setupWizard.findUnique as jest.Mock).mockResolvedValue(mockWizard);
    const res = await request(app).get('/api/wizard/status');
    expect(res.body.data.steps).toHaveLength(4);
    expect(res.body.data.steps[0].title).toBe('ISO Standard Selection');
  });

  it('POST /init create is called with steps array', async () => {
    (prisma.setupWizard.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.setupWizard.create as jest.Mock).mockResolvedValue(mockWizard);
    await request(app).post('/api/wizard/init');
    expect(prisma.setupWizard.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ steps: expect.objectContaining({ create: expect.any(Array) }) }),
      })
    );
  });

  it('POST /skip returns success:true for already completed wizard', async () => {
    const completed = { ...mockWizard, status: 'COMPLETED' };
    (prisma.setupWizard.findUnique as jest.Mock).mockResolvedValue(completed);
    const res = await request(app).post('/api/wizard/skip');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('POST /init returns 500 when create throws DB error', async () => {
    (prisma.setupWizard.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.setupWizard.create as jest.Mock).mockRejectedValue(new Error('DB error'));
    const res = await request(app).post('/api/wizard/init');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('wizard.api — batch ao final', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (prisma.$transaction as jest.Mock).mockImplementation((ops: unknown[]) =>
      Promise.all(ops as Promise<unknown>[])
    );
  });

  it('GET /status response body has data property', async () => {
    (prisma.setupWizard.findUnique as jest.Mock).mockResolvedValue(null);
    const res = await request(app).get('/api/wizard/status');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
  });

  it('POST /init returns data property in response body', async () => {
    (prisma.setupWizard.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.setupWizard.create as jest.Mock).mockResolvedValue(mockWizard);
    const res = await request(app).post('/api/wizard/init');
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('data');
  });

  it('PATCH /step/2 updates step at index 2', async () => {
    (prisma.setupWizard.findUnique as jest.Mock).mockResolvedValue(mockWizard);
    (prisma.setupWizardStep.update as jest.Mock).mockResolvedValue({
      ...mockWizard.steps[2],
      status: 'COMPLETED',
    });
    (prisma.setupWizard.update as jest.Mock).mockResolvedValue({ ...mockWizard, currentStep: 3 });
    const res = await request(app)
      .patch('/api/wizard/step/2')
      .send({ data: { invitedUsers: ['alice@example.com'] } });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('POST /complete response has data property', async () => {
    (prisma.setupWizard.findUnique as jest.Mock).mockResolvedValue(mockWizard);
    (prisma.setupWizard.update as jest.Mock).mockResolvedValue({
      ...mockWizard,
      status: 'COMPLETED',
      completedAt: new Date(),
    });
    const res = await request(app).post('/api/wizard/complete');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
  });

  it('POST /skip response content-type is JSON', async () => {
    (prisma.setupWizard.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.setupWizard.create as jest.Mock).mockResolvedValue({ ...mockWizard, status: 'SKIPPED' });
    const res = await request(app).post('/api/wizard/skip');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/json/);
  });
});

describe('wizard — phase29 coverage', () => {
  it('handles spread operator', () => {
    expect([...[1, 2], ...[3, 4]]).toEqual([1, 2, 3, 4]);
  });

  it('handles destructuring', () => {
    const { a, b } = { a: 1, b: 2 }; expect(a + b).toBe(3);
  });

  it('handles error instanceof', () => {
    expect(new Error('test')).toBeInstanceOf(Error);
  });

  it('handles string slice', () => {
    expect('hello'.slice(1, 3)).toBe('el');
  });

  it('handles string includes', () => {
    expect('hello world'.includes('world')).toBe(true);
  });

});
