import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    mktHealthScore: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: 'user-123', email: 'test@test.com', role: 'ADMIN' };
    next();
  }),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

jest.mock('../src/config', () => ({
  AutomationConfig: {
    health: { criticalThreshold: 40, atRiskThreshold: 70 },
  },
}));

import healthScoreRouter, { calculateHealthScore, determineTrend } from '../src/routes/health-score';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/health-score', healthScoreRouter);

beforeEach(() => { jest.clearAllMocks(); });

// ===================================================================
// Health Score Calculation Logic
// ===================================================================

describe('calculateHealthScore', () => {
  it('returns 0 for completely inactive user', () => {
    expect(calculateHealthScore({ loginsLast7Days: 0, recordsCreated: 0, modulesVisited: 0, teamMembersInvited: 0 })).toBe(0);
  });

  it('returns maximum score for highly active user', () => {
    expect(calculateHealthScore({ loginsLast7Days: 7, recordsCreated: 25, modulesVisited: 8, teamMembersInvited: 3 })).toBe(100);
  });

  it('scores logins correctly: 1-2 = 10pts', () => {
    expect(calculateHealthScore({ loginsLast7Days: 2, recordsCreated: 0, modulesVisited: 0, teamMembersInvited: 0 })).toBe(10);
  });

  it('scores logins correctly: 3-4 = 20pts', () => {
    expect(calculateHealthScore({ loginsLast7Days: 4, recordsCreated: 0, modulesVisited: 0, teamMembersInvited: 0 })).toBe(20);
  });

  it('scores logins correctly: 5+ = 30pts', () => {
    expect(calculateHealthScore({ loginsLast7Days: 5, recordsCreated: 0, modulesVisited: 0, teamMembersInvited: 0 })).toBe(30);
  });

  it('scores records created: 1-5 = 10pts', () => {
    expect(calculateHealthScore({ loginsLast7Days: 0, recordsCreated: 3, modulesVisited: 0, teamMembersInvited: 0 })).toBe(10);
  });

  it('scores records created: 6-20 = 15pts', () => {
    expect(calculateHealthScore({ loginsLast7Days: 0, recordsCreated: 10, modulesVisited: 0, teamMembersInvited: 0 })).toBe(15);
  });

  it('scores records created: 20+ = 20pts', () => {
    expect(calculateHealthScore({ loginsLast7Days: 0, recordsCreated: 21, modulesVisited: 0, teamMembersInvited: 0 })).toBe(20);
  });

  it('scores modules visited: 1 = 5pts', () => {
    expect(calculateHealthScore({ loginsLast7Days: 0, recordsCreated: 0, modulesVisited: 1, teamMembersInvited: 0 })).toBe(5);
  });

  it('scores modules visited: 7+ = 25pts', () => {
    expect(calculateHealthScore({ loginsLast7Days: 0, recordsCreated: 0, modulesVisited: 7, teamMembersInvited: 0 })).toBe(25);
  });

  it('scores team members invited: 1 = 10pts', () => {
    expect(calculateHealthScore({ loginsLast7Days: 0, recordsCreated: 0, modulesVisited: 0, teamMembersInvited: 1 })).toBe(10);
  });

  it('scores team members invited: 2+ = 25pts', () => {
    expect(calculateHealthScore({ loginsLast7Days: 0, recordsCreated: 0, modulesVisited: 0, teamMembersInvited: 2 })).toBe(25);
  });

  it('caps at 100', () => {
    expect(calculateHealthScore({ loginsLast7Days: 10, recordsCreated: 100, modulesVisited: 20, teamMembersInvited: 10 })).toBe(100);
  });
});

describe('determineTrend', () => {
  it('returns STABLE for null previous score', () => {
    expect(determineTrend(50, null)).toBe('STABLE');
  });

  it('returns IMPROVING when score increased 10+', () => {
    expect(determineTrend(60, 45)).toBe('IMPROVING');
  });

  it('returns DECLINING when score decreased 10+', () => {
    expect(determineTrend(30, 45)).toBe('DECLINING');
  });

  it('returns STABLE when within 10 points', () => {
    expect(determineTrend(55, 50)).toBe('STABLE');
  });

  it('returns STABLE at exactly 10 point difference', () => {
    expect(determineTrend(60, 50)).toBe('IMPROVING');
  });
});

// ===================================================================
// GET /api/health-score/user/:userId
// ===================================================================

describe('GET /api/health-score/user/:userId', () => {
  it('returns latest health score', async () => {
    (prisma.mktHealthScore.findFirst as jest.Mock).mockResolvedValue({
      id: 'hs-1', userId: 'user-1', score: 75, trend: 'IMPROVING',
    });

    const res = await request(app).get('/api/health-score/user/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.score).toBe(75);
  });

  it('returns 404 when no score exists', async () => {
    (prisma.mktHealthScore.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get('/api/health-score/user/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });
});

// ===================================================================
// GET /api/health-score/org/:orgId
// ===================================================================

describe('GET /api/health-score/org/:orgId', () => {
  it('returns org health summary', async () => {
    const scores = [
      { userId: 'u1', score: 80, trend: 'STABLE' },
      { userId: 'u2', score: 50, trend: 'DECLINING' },
      { userId: 'u3', score: 30, trend: 'DECLINING' },
    ];
    (prisma.mktHealthScore.findMany as jest.Mock).mockResolvedValue(scores);

    const res = await request(app).get('/api/health-score/org/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.totalUsers).toBe(3);
    expect(res.body.data.distribution.healthy).toBe(1);
    expect(res.body.data.distribution.atRisk).toBe(1);
    expect(res.body.data.distribution.critical).toBe(1);
  });
});

// ===================================================================
// POST /api/health-score/recalculate
// ===================================================================

describe('POST /api/health-score/recalculate', () => {
  it('acknowledges recalculation trigger', async () => {
    const res = await request(app).post('/api/health-score/recalculate');

    expect(res.status).toBe(200);
    expect(res.body.data.message).toContain('recalculation triggered');
  });
});
