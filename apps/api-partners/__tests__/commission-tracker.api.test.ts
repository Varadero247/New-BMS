// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import express, { type Response, type NextFunction } from 'express';
import request from 'supertest';

jest.mock('@ims/auth', () => ({
  authenticate: (req: any, _: any, next: any) => {
    req.user = req.__testUser ?? { id: 'u1', organisationId: 'org-test' };
    next();
  },
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import commissionRouter from '../src/routes/commission-tracker';

function makeApp(orgId: string) {
  const app = express();
  app.use(express.json());
  app.use((req: any, _res: Response, next: NextFunction) => {
    req.__testUser = { id: 'u1', organisationId: orgId };
    next();
  });
  app.use('/api/commissions', commissionRouter);
  return app;
}

const STATUSES = ['PENDING', 'APPROVED', 'PAID', 'DISPUTED', 'CANCELLED'] as const;
const TYPES = ['NEW_BUSINESS', 'RENEWAL', 'UPSELL', 'REFERRAL'] as const;
const PERIODS = ['2025-10', '2025-11', '2025-12', '2026-01', '2026-02'] as const;

function oid(suffix: string) { return `org-ct-${suffix}`; }

// ─── Suite A: Basic list ──────────────────────────────────────────────────────
describe('GET /api/commissions — basic list', () => {
  it('[A-0] returns 200 and success:true for fresh org-a-0', async () => {
    const app = makeApp(oid('a-0'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-1] returns 200 and success:true for fresh org-a-1', async () => {
    const app = makeApp(oid('a-1'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-2] returns 200 and success:true for fresh org-a-2', async () => {
    const app = makeApp(oid('a-2'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-3] returns 200 and success:true for fresh org-a-3', async () => {
    const app = makeApp(oid('a-3'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-4] returns 200 and success:true for fresh org-a-4', async () => {
    const app = makeApp(oid('a-4'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-5] returns 200 and success:true for fresh org-a-5', async () => {
    const app = makeApp(oid('a-5'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-6] returns 200 and success:true for fresh org-a-6', async () => {
    const app = makeApp(oid('a-6'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-7] returns 200 and success:true for fresh org-a-7', async () => {
    const app = makeApp(oid('a-7'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-8] returns 200 and success:true for fresh org-a-8', async () => {
    const app = makeApp(oid('a-8'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-9] returns 200 and success:true for fresh org-a-9', async () => {
    const app = makeApp(oid('a-9'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-10] returns 200 and success:true for fresh org-a-10', async () => {
    const app = makeApp(oid('a-10'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-11] returns 200 and success:true for fresh org-a-11', async () => {
    const app = makeApp(oid('a-11'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-12] returns 200 and success:true for fresh org-a-12', async () => {
    const app = makeApp(oid('a-12'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-13] returns 200 and success:true for fresh org-a-13', async () => {
    const app = makeApp(oid('a-13'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-14] returns 200 and success:true for fresh org-a-14', async () => {
    const app = makeApp(oid('a-14'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-15] returns 200 and success:true for fresh org-a-15', async () => {
    const app = makeApp(oid('a-15'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-16] returns 200 and success:true for fresh org-a-16', async () => {
    const app = makeApp(oid('a-16'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-17] returns 200 and success:true for fresh org-a-17', async () => {
    const app = makeApp(oid('a-17'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-18] returns 200 and success:true for fresh org-a-18', async () => {
    const app = makeApp(oid('a-18'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-19] returns 200 and success:true for fresh org-a-19', async () => {
    const app = makeApp(oid('a-19'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-20] returns 200 and success:true for fresh org-a-20', async () => {
    const app = makeApp(oid('a-20'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-21] returns 200 and success:true for fresh org-a-21', async () => {
    const app = makeApp(oid('a-21'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-22] returns 200 and success:true for fresh org-a-22', async () => {
    const app = makeApp(oid('a-22'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-23] returns 200 and success:true for fresh org-a-23', async () => {
    const app = makeApp(oid('a-23'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-24] returns 200 and success:true for fresh org-a-24', async () => {
    const app = makeApp(oid('a-24'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-25] returns 200 and success:true for fresh org-a-25', async () => {
    const app = makeApp(oid('a-25'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-26] returns 200 and success:true for fresh org-a-26', async () => {
    const app = makeApp(oid('a-26'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-27] returns 200 and success:true for fresh org-a-27', async () => {
    const app = makeApp(oid('a-27'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-28] returns 200 and success:true for fresh org-a-28', async () => {
    const app = makeApp(oid('a-28'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-29] returns 200 and success:true for fresh org-a-29', async () => {
    const app = makeApp(oid('a-29'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-30] returns 200 and success:true for fresh org-a-30', async () => {
    const app = makeApp(oid('a-30'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-31] returns 200 and success:true for fresh org-a-31', async () => {
    const app = makeApp(oid('a-31'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-32] returns 200 and success:true for fresh org-a-32', async () => {
    const app = makeApp(oid('a-32'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-33] returns 200 and success:true for fresh org-a-33', async () => {
    const app = makeApp(oid('a-33'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-34] returns 200 and success:true for fresh org-a-34', async () => {
    const app = makeApp(oid('a-34'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-35] returns 200 and success:true for fresh org-a-35', async () => {
    const app = makeApp(oid('a-35'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-36] returns 200 and success:true for fresh org-a-36', async () => {
    const app = makeApp(oid('a-36'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-37] returns 200 and success:true for fresh org-a-37', async () => {
    const app = makeApp(oid('a-37'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-38] returns 200 and success:true for fresh org-a-38', async () => {
    const app = makeApp(oid('a-38'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-39] returns 200 and success:true for fresh org-a-39', async () => {
    const app = makeApp(oid('a-39'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-40] returns 200 and success:true for fresh org-a-40', async () => {
    const app = makeApp(oid('a-40'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-41] returns 200 and success:true for fresh org-a-41', async () => {
    const app = makeApp(oid('a-41'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-42] returns 200 and success:true for fresh org-a-42', async () => {
    const app = makeApp(oid('a-42'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-43] returns 200 and success:true for fresh org-a-43', async () => {
    const app = makeApp(oid('a-43'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-44] returns 200 and success:true for fresh org-a-44', async () => {
    const app = makeApp(oid('a-44'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-45] returns 200 and success:true for fresh org-a-45', async () => {
    const app = makeApp(oid('a-45'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-46] returns 200 and success:true for fresh org-a-46', async () => {
    const app = makeApp(oid('a-46'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-47] returns 200 and success:true for fresh org-a-47', async () => {
    const app = makeApp(oid('a-47'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-48] returns 200 and success:true for fresh org-a-48', async () => {
    const app = makeApp(oid('a-48'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-49] returns 200 and success:true for fresh org-a-49', async () => {
    const app = makeApp(oid('a-49'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-50] returns 200 and success:true for fresh org-a-50', async () => {
    const app = makeApp(oid('a-50'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-51] returns 200 and success:true for fresh org-a-51', async () => {
    const app = makeApp(oid('a-51'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-52] returns 200 and success:true for fresh org-a-52', async () => {
    const app = makeApp(oid('a-52'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-53] returns 200 and success:true for fresh org-a-53', async () => {
    const app = makeApp(oid('a-53'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-54] returns 200 and success:true for fresh org-a-54', async () => {
    const app = makeApp(oid('a-54'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-55] returns 200 and success:true for fresh org-a-55', async () => {
    const app = makeApp(oid('a-55'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-56] returns 200 and success:true for fresh org-a-56', async () => {
    const app = makeApp(oid('a-56'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-57] returns 200 and success:true for fresh org-a-57', async () => {
    const app = makeApp(oid('a-57'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-58] returns 200 and success:true for fresh org-a-58', async () => {
    const app = makeApp(oid('a-58'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-59] returns 200 and success:true for fresh org-a-59', async () => {
    const app = makeApp(oid('a-59'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-60] returns 200 and success:true for fresh org-a-60', async () => {
    const app = makeApp(oid('a-60'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-61] returns 200 and success:true for fresh org-a-61', async () => {
    const app = makeApp(oid('a-61'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-62] returns 200 and success:true for fresh org-a-62', async () => {
    const app = makeApp(oid('a-62'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-63] returns 200 and success:true for fresh org-a-63', async () => {
    const app = makeApp(oid('a-63'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-64] returns 200 and success:true for fresh org-a-64', async () => {
    const app = makeApp(oid('a-64'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-65] returns 200 and success:true for fresh org-a-65', async () => {
    const app = makeApp(oid('a-65'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-66] returns 200 and success:true for fresh org-a-66', async () => {
    const app = makeApp(oid('a-66'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-67] returns 200 and success:true for fresh org-a-67', async () => {
    const app = makeApp(oid('a-67'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-68] returns 200 and success:true for fresh org-a-68', async () => {
    const app = makeApp(oid('a-68'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-69] returns 200 and success:true for fresh org-a-69', async () => {
    const app = makeApp(oid('a-69'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-70] returns 200 and success:true for fresh org-a-70', async () => {
    const app = makeApp(oid('a-70'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-71] returns 200 and success:true for fresh org-a-71', async () => {
    const app = makeApp(oid('a-71'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-72] returns 200 and success:true for fresh org-a-72', async () => {
    const app = makeApp(oid('a-72'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-73] returns 200 and success:true for fresh org-a-73', async () => {
    const app = makeApp(oid('a-73'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-74] returns 200 and success:true for fresh org-a-74', async () => {
    const app = makeApp(oid('a-74'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-75] returns 200 and success:true for fresh org-a-75', async () => {
    const app = makeApp(oid('a-75'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-76] returns 200 and success:true for fresh org-a-76', async () => {
    const app = makeApp(oid('a-76'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-77] returns 200 and success:true for fresh org-a-77', async () => {
    const app = makeApp(oid('a-77'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-78] returns 200 and success:true for fresh org-a-78', async () => {
    const app = makeApp(oid('a-78'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-79] returns 200 and success:true for fresh org-a-79', async () => {
    const app = makeApp(oid('a-79'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-80] returns 200 and success:true for fresh org-a-80', async () => {
    const app = makeApp(oid('a-80'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-81] returns 200 and success:true for fresh org-a-81', async () => {
    const app = makeApp(oid('a-81'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-82] returns 200 and success:true for fresh org-a-82', async () => {
    const app = makeApp(oid('a-82'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-83] returns 200 and success:true for fresh org-a-83', async () => {
    const app = makeApp(oid('a-83'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-84] returns 200 and success:true for fresh org-a-84', async () => {
    const app = makeApp(oid('a-84'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-85] returns 200 and success:true for fresh org-a-85', async () => {
    const app = makeApp(oid('a-85'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-86] returns 200 and success:true for fresh org-a-86', async () => {
    const app = makeApp(oid('a-86'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-87] returns 200 and success:true for fresh org-a-87', async () => {
    const app = makeApp(oid('a-87'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-88] returns 200 and success:true for fresh org-a-88', async () => {
    const app = makeApp(oid('a-88'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-89] returns 200 and success:true for fresh org-a-89', async () => {
    const app = makeApp(oid('a-89'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-90] returns 200 and success:true for fresh org-a-90', async () => {
    const app = makeApp(oid('a-90'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-91] returns 200 and success:true for fresh org-a-91', async () => {
    const app = makeApp(oid('a-91'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-92] returns 200 and success:true for fresh org-a-92', async () => {
    const app = makeApp(oid('a-92'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-93] returns 200 and success:true for fresh org-a-93', async () => {
    const app = makeApp(oid('a-93'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-94] returns 200 and success:true for fresh org-a-94', async () => {
    const app = makeApp(oid('a-94'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-95] returns 200 and success:true for fresh org-a-95', async () => {
    const app = makeApp(oid('a-95'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-96] returns 200 and success:true for fresh org-a-96', async () => {
    const app = makeApp(oid('a-96'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-97] returns 200 and success:true for fresh org-a-97', async () => {
    const app = makeApp(oid('a-97'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-98] returns 200 and success:true for fresh org-a-98', async () => {
    const app = makeApp(oid('a-98'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-99] returns 200 and success:true for fresh org-a-99', async () => {
    const app = makeApp(oid('a-99'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

// ─── Suite B: Seeded count ────────────────────────────────────────────────────
describe('GET /api/commissions — seeded data has 5 records', () => {
  it('[B-0] fresh org-b-0 gets exactly 5 seeded records', async () => {
    const app = makeApp(oid('b-0'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(5);
  });
  it('[B-1] fresh org-b-1 gets exactly 5 seeded records', async () => {
    const app = makeApp(oid('b-1'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(5);
  });
  it('[B-2] fresh org-b-2 gets exactly 5 seeded records', async () => {
    const app = makeApp(oid('b-2'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(5);
  });
  it('[B-3] fresh org-b-3 gets exactly 5 seeded records', async () => {
    const app = makeApp(oid('b-3'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(5);
  });
  it('[B-4] fresh org-b-4 gets exactly 5 seeded records', async () => {
    const app = makeApp(oid('b-4'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(5);
  });
  it('[B-5] fresh org-b-5 gets exactly 5 seeded records', async () => {
    const app = makeApp(oid('b-5'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(5);
  });
  it('[B-6] fresh org-b-6 gets exactly 5 seeded records', async () => {
    const app = makeApp(oid('b-6'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(5);
  });
  it('[B-7] fresh org-b-7 gets exactly 5 seeded records', async () => {
    const app = makeApp(oid('b-7'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(5);
  });
  it('[B-8] fresh org-b-8 gets exactly 5 seeded records', async () => {
    const app = makeApp(oid('b-8'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(5);
  });
  it('[B-9] fresh org-b-9 gets exactly 5 seeded records', async () => {
    const app = makeApp(oid('b-9'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(5);
  });
  it('[B-10] fresh org-b-10 gets exactly 5 seeded records', async () => {
    const app = makeApp(oid('b-10'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(5);
  });
  it('[B-11] fresh org-b-11 gets exactly 5 seeded records', async () => {
    const app = makeApp(oid('b-11'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(5);
  });
  it('[B-12] fresh org-b-12 gets exactly 5 seeded records', async () => {
    const app = makeApp(oid('b-12'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(5);
  });
  it('[B-13] fresh org-b-13 gets exactly 5 seeded records', async () => {
    const app = makeApp(oid('b-13'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(5);
  });
  it('[B-14] fresh org-b-14 gets exactly 5 seeded records', async () => {
    const app = makeApp(oid('b-14'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(5);
  });
  it('[B-15] fresh org-b-15 gets exactly 5 seeded records', async () => {
    const app = makeApp(oid('b-15'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(5);
  });
  it('[B-16] fresh org-b-16 gets exactly 5 seeded records', async () => {
    const app = makeApp(oid('b-16'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(5);
  });
  it('[B-17] fresh org-b-17 gets exactly 5 seeded records', async () => {
    const app = makeApp(oid('b-17'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(5);
  });
  it('[B-18] fresh org-b-18 gets exactly 5 seeded records', async () => {
    const app = makeApp(oid('b-18'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(5);
  });
  it('[B-19] fresh org-b-19 gets exactly 5 seeded records', async () => {
    const app = makeApp(oid('b-19'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(5);
  });
  it('[B-20] fresh org-b-20 gets exactly 5 seeded records', async () => {
    const app = makeApp(oid('b-20'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(5);
  });
  it('[B-21] fresh org-b-21 gets exactly 5 seeded records', async () => {
    const app = makeApp(oid('b-21'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(5);
  });
  it('[B-22] fresh org-b-22 gets exactly 5 seeded records', async () => {
    const app = makeApp(oid('b-22'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(5);
  });
  it('[B-23] fresh org-b-23 gets exactly 5 seeded records', async () => {
    const app = makeApp(oid('b-23'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(5);
  });
  it('[B-24] fresh org-b-24 gets exactly 5 seeded records', async () => {
    const app = makeApp(oid('b-24'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(5);
  });
  it('[B-25] fresh org-b-25 gets exactly 5 seeded records', async () => {
    const app = makeApp(oid('b-25'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(5);
  });
  it('[B-26] fresh org-b-26 gets exactly 5 seeded records', async () => {
    const app = makeApp(oid('b-26'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(5);
  });
  it('[B-27] fresh org-b-27 gets exactly 5 seeded records', async () => {
    const app = makeApp(oid('b-27'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(5);
  });
  it('[B-28] fresh org-b-28 gets exactly 5 seeded records', async () => {
    const app = makeApp(oid('b-28'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(5);
  });
  it('[B-29] fresh org-b-29 gets exactly 5 seeded records', async () => {
    const app = makeApp(oid('b-29'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(5);
  });
  it('[B-30] fresh org-b-30 gets exactly 5 seeded records', async () => {
    const app = makeApp(oid('b-30'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(5);
  });
  it('[B-31] fresh org-b-31 gets exactly 5 seeded records', async () => {
    const app = makeApp(oid('b-31'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(5);
  });
  it('[B-32] fresh org-b-32 gets exactly 5 seeded records', async () => {
    const app = makeApp(oid('b-32'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(5);
  });
  it('[B-33] fresh org-b-33 gets exactly 5 seeded records', async () => {
    const app = makeApp(oid('b-33'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(5);
  });
  it('[B-34] fresh org-b-34 gets exactly 5 seeded records', async () => {
    const app = makeApp(oid('b-34'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(5);
  });
  it('[B-35] fresh org-b-35 gets exactly 5 seeded records', async () => {
    const app = makeApp(oid('b-35'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(5);
  });
  it('[B-36] fresh org-b-36 gets exactly 5 seeded records', async () => {
    const app = makeApp(oid('b-36'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(5);
  });
  it('[B-37] fresh org-b-37 gets exactly 5 seeded records', async () => {
    const app = makeApp(oid('b-37'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(5);
  });
  it('[B-38] fresh org-b-38 gets exactly 5 seeded records', async () => {
    const app = makeApp(oid('b-38'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(5);
  });
  it('[B-39] fresh org-b-39 gets exactly 5 seeded records', async () => {
    const app = makeApp(oid('b-39'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(5);
  });
  it('[B-40] fresh org-b-40 gets exactly 5 seeded records', async () => {
    const app = makeApp(oid('b-40'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(5);
  });
  it('[B-41] fresh org-b-41 gets exactly 5 seeded records', async () => {
    const app = makeApp(oid('b-41'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(5);
  });
  it('[B-42] fresh org-b-42 gets exactly 5 seeded records', async () => {
    const app = makeApp(oid('b-42'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(5);
  });
  it('[B-43] fresh org-b-43 gets exactly 5 seeded records', async () => {
    const app = makeApp(oid('b-43'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(5);
  });
  it('[B-44] fresh org-b-44 gets exactly 5 seeded records', async () => {
    const app = makeApp(oid('b-44'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(5);
  });
  it('[B-45] fresh org-b-45 gets exactly 5 seeded records', async () => {
    const app = makeApp(oid('b-45'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(5);
  });
  it('[B-46] fresh org-b-46 gets exactly 5 seeded records', async () => {
    const app = makeApp(oid('b-46'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(5);
  });
  it('[B-47] fresh org-b-47 gets exactly 5 seeded records', async () => {
    const app = makeApp(oid('b-47'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(5);
  });
  it('[B-48] fresh org-b-48 gets exactly 5 seeded records', async () => {
    const app = makeApp(oid('b-48'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(5);
  });
  it('[B-49] fresh org-b-49 gets exactly 5 seeded records', async () => {
    const app = makeApp(oid('b-49'));
    const res = await request(app).get('/api/commissions');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(5);
  });
});

// ─── Suite C: Response shape ──────────────────────────────────────────────────
describe('GET /api/commissions — response shape', () => {
  const appC = makeApp(oid('c-shape'));
  it('[C-0] data is an array', async () => {
    const res = await request(appC).get('/api/commissions');
    expect(Array.isArray(res.body.data)).toBe(true);
  });
  it('[C-1] each record has id', async () => {
    const res = await request(appC).get('/api/commissions');
    res.body.data.forEach((r: any) => expect(r).toHaveProperty('id'));
  });
  it('[C-2] each record has partnerId', async () => {
    const res = await request(appC).get('/api/commissions');
    res.body.data.forEach((r: any) => expect(r).toHaveProperty('partnerId'));
  });
  it('[C-3] each record has referenceNumber', async () => {
    const res = await request(appC).get('/api/commissions');
    res.body.data.forEach((r: any) => expect(r).toHaveProperty('referenceNumber'));
  });
  it('[C-4] each record has type', async () => {
    const res = await request(appC).get('/api/commissions');
    res.body.data.forEach((r: any) => expect(r).toHaveProperty('type'));
  });
  it('[C-5] each record has customerName', async () => {
    const res = await request(appC).get('/api/commissions');
    res.body.data.forEach((r: any) => expect(r).toHaveProperty('customerName'));
  });
  it('[C-6] each record has baseAmount', async () => {
    const res = await request(appC).get('/api/commissions');
    res.body.data.forEach((r: any) => expect(r).toHaveProperty('baseAmount'));
  });
  it('[C-7] each record has commissionRate', async () => {
    const res = await request(appC).get('/api/commissions');
    res.body.data.forEach((r: any) => expect(r).toHaveProperty('commissionRate'));
  });
  it('[C-8] each record has commissionAmount', async () => {
    const res = await request(appC).get('/api/commissions');
    res.body.data.forEach((r: any) => expect(r).toHaveProperty('commissionAmount'));
  });
  it('[C-9] each record has currency', async () => {
    const res = await request(appC).get('/api/commissions');
    res.body.data.forEach((r: any) => expect(r).toHaveProperty('currency'));
  });
  it('[C-10] each record has status', async () => {
    const res = await request(appC).get('/api/commissions');
    res.body.data.forEach((r: any) => expect(r).toHaveProperty('status'));
  });
  it('[C-11] each record has periodMonth', async () => {
    const res = await request(appC).get('/api/commissions');
    res.body.data.forEach((r: any) => expect(r).toHaveProperty('periodMonth'));
  });
  it('[C-12] each record has earnedAt', async () => {
    const res = await request(appC).get('/api/commissions');
    res.body.data.forEach((r: any) => expect(r).toHaveProperty('earnedAt'));
  });
  it('[C-13] currency is GBP', async () => {
    const res = await request(appC).get('/api/commissions');
    res.body.data.forEach((r: any) => expect(r.currency).toBe('GBP'));
  });
  it('[C-14] type is valid enum', async () => {
    const res = await request(appC).get('/api/commissions');
    const vt = new Set(TYPES); res.body.data.forEach((r: any) => expect(vt.has(r.type)).toBe(true));
  });
  it('[C-15] status is valid enum', async () => {
    const res = await request(appC).get('/api/commissions');
    const vs = new Set(STATUSES); res.body.data.forEach((r: any) => expect(vs.has(r.status)).toBe(true));
  });
  it('[C-16] baseAmount > 0', async () => {
    const res = await request(appC).get('/api/commissions');
    res.body.data.forEach((r: any) => expect(r.baseAmount).toBeGreaterThan(0));
  });
  it('[C-17] commissionAmount > 0', async () => {
    const res = await request(appC).get('/api/commissions');
    res.body.data.forEach((r: any) => expect(r.commissionAmount).toBeGreaterThan(0));
  });
  it('[C-18] commissionRate 1-100', async () => {
    const res = await request(appC).get('/api/commissions');
    res.body.data.forEach((r: any) => { expect(r.commissionRate).toBeGreaterThanOrEqual(1); expect(r.commissionRate).toBeLessThanOrEqual(100); });
  });
  it('[C-19] periodMonth YYYY-MM', async () => {
    const res = await request(appC).get('/api/commissions');
    res.body.data.forEach((r: any) => expect(r.periodMonth).toMatch(/^\d{4}-\d{2}$/));
  });
  it('[C-20] referenceNumber starts CM-', async () => {
    const res = await request(appC).get('/api/commissions');
    res.body.data.forEach((r: any) => expect(r.referenceNumber).toMatch(/^CM-/));
  });
  it('[C-21] id is non-empty string', async () => {
    const res = await request(appC).get('/api/commissions');
    res.body.data.forEach((r: any) => { expect(typeof r.id).toBe('string'); expect(r.id.length).toBeGreaterThan(0); });
  });
  it('[C-22] commissionAmount = base*rate/100', async () => {
    const res = await request(appC).get('/api/commissions');
    res.body.data.forEach((r: any) => expect(r.commissionAmount).toBeCloseTo((r.baseAmount * r.commissionRate) / 100, 2));
  });
  it('[C-23] sorted desc by earnedAt', async () => {
    const res = await request(appC).get('/api/commissions');
    const dates = res.body.data.map((r: any) => new Date(r.earnedAt).getTime()); for (let i = 1; i < dates.length; i++) expect(dates[i-1]).toBeGreaterThanOrEqual(dates[i]);
  });
  it('[C-24] customerName non-empty string', async () => {
    const res = await request(appC).get('/api/commissions');
    res.body.data.forEach((r: any) => { expect(typeof r.customerName).toBe('string'); expect(r.customerName.length).toBeGreaterThan(0); });
  });
});

// ─── Suite D: Status filter ───────────────────────────────────────────────────
describe('GET /api/commissions?status= filtering', () => {
  it('[D-0] status=PENDING rep=0: records have status PENDING', async () => {
    const app = makeApp(oid('d-PENDING-0'));
    const res = await request(app).get('/api/commissions?status=PENDING');
    expect(res.status).toBe(200);
    res.body.data.forEach((r: any) => expect(r.status).toBe('PENDING'));
  });
  it('[D-1] status=PENDING rep=1: records have status PENDING', async () => {
    const app = makeApp(oid('d-PENDING-1'));
    const res = await request(app).get('/api/commissions?status=PENDING');
    expect(res.status).toBe(200);
    res.body.data.forEach((r: any) => expect(r.status).toBe('PENDING'));
  });
  it('[D-2] status=PENDING rep=2: records have status PENDING', async () => {
    const app = makeApp(oid('d-PENDING-2'));
    const res = await request(app).get('/api/commissions?status=PENDING');
    expect(res.status).toBe(200);
    res.body.data.forEach((r: any) => expect(r.status).toBe('PENDING'));
  });
  it('[D-3] status=PENDING rep=3: records have status PENDING', async () => {
    const app = makeApp(oid('d-PENDING-3'));
    const res = await request(app).get('/api/commissions?status=PENDING');
    expect(res.status).toBe(200);
    res.body.data.forEach((r: any) => expect(r.status).toBe('PENDING'));
  });
  it('[D-4] status=PENDING rep=4: records have status PENDING', async () => {
    const app = makeApp(oid('d-PENDING-4'));
    const res = await request(app).get('/api/commissions?status=PENDING');
    expect(res.status).toBe(200);
    res.body.data.forEach((r: any) => expect(r.status).toBe('PENDING'));
  });
  it('[D-5] status=PENDING rep=5: records have status PENDING', async () => {
    const app = makeApp(oid('d-PENDING-5'));
    const res = await request(app).get('/api/commissions?status=PENDING');
    expect(res.status).toBe(200);
    res.body.data.forEach((r: any) => expect(r.status).toBe('PENDING'));
  });
  it('[D-6] status=PENDING rep=6: records have status PENDING', async () => {
    const app = makeApp(oid('d-PENDING-6'));
    const res = await request(app).get('/api/commissions?status=PENDING');
    expect(res.status).toBe(200);
    res.body.data.forEach((r: any) => expect(r.status).toBe('PENDING'));
  });
  it('[D-7] status=PENDING rep=7: records have status PENDING', async () => {
    const app = makeApp(oid('d-PENDING-7'));
    const res = await request(app).get('/api/commissions?status=PENDING');
    expect(res.status).toBe(200);
    res.body.data.forEach((r: any) => expect(r.status).toBe('PENDING'));
  });
  it('[D-8] status=PENDING rep=8: records have status PENDING', async () => {
    const app = makeApp(oid('d-PENDING-8'));
    const res = await request(app).get('/api/commissions?status=PENDING');
    expect(res.status).toBe(200);
    res.body.data.forEach((r: any) => expect(r.status).toBe('PENDING'));
  });
  it('[D-9] status=PENDING rep=9: records have status PENDING', async () => {
    const app = makeApp(oid('d-PENDING-9'));
    const res = await request(app).get('/api/commissions?status=PENDING');
    expect(res.status).toBe(200);
    res.body.data.forEach((r: any) => expect(r.status).toBe('PENDING'));
  });
  it('[D-10] status=APPROVED rep=0: records have status APPROVED', async () => {
    const app = makeApp(oid('d-APPROVED-0'));
    const res = await request(app).get('/api/commissions?status=APPROVED');
    expect(res.status).toBe(200);
    res.body.data.forEach((r: any) => expect(r.status).toBe('APPROVED'));
  });
  it('[D-11] status=APPROVED rep=1: records have status APPROVED', async () => {
    const app = makeApp(oid('d-APPROVED-1'));
    const res = await request(app).get('/api/commissions?status=APPROVED');
    expect(res.status).toBe(200);
    res.body.data.forEach((r: any) => expect(r.status).toBe('APPROVED'));
  });
  it('[D-12] status=APPROVED rep=2: records have status APPROVED', async () => {
    const app = makeApp(oid('d-APPROVED-2'));
    const res = await request(app).get('/api/commissions?status=APPROVED');
    expect(res.status).toBe(200);
    res.body.data.forEach((r: any) => expect(r.status).toBe('APPROVED'));
  });
  it('[D-13] status=APPROVED rep=3: records have status APPROVED', async () => {
    const app = makeApp(oid('d-APPROVED-3'));
    const res = await request(app).get('/api/commissions?status=APPROVED');
    expect(res.status).toBe(200);
    res.body.data.forEach((r: any) => expect(r.status).toBe('APPROVED'));
  });
  it('[D-14] status=APPROVED rep=4: records have status APPROVED', async () => {
    const app = makeApp(oid('d-APPROVED-4'));
    const res = await request(app).get('/api/commissions?status=APPROVED');
    expect(res.status).toBe(200);
    res.body.data.forEach((r: any) => expect(r.status).toBe('APPROVED'));
  });
  it('[D-15] status=APPROVED rep=5: records have status APPROVED', async () => {
    const app = makeApp(oid('d-APPROVED-5'));
    const res = await request(app).get('/api/commissions?status=APPROVED');
    expect(res.status).toBe(200);
    res.body.data.forEach((r: any) => expect(r.status).toBe('APPROVED'));
  });
  it('[D-16] status=APPROVED rep=6: records have status APPROVED', async () => {
    const app = makeApp(oid('d-APPROVED-6'));
    const res = await request(app).get('/api/commissions?status=APPROVED');
    expect(res.status).toBe(200);
    res.body.data.forEach((r: any) => expect(r.status).toBe('APPROVED'));
  });
  it('[D-17] status=APPROVED rep=7: records have status APPROVED', async () => {
    const app = makeApp(oid('d-APPROVED-7'));
    const res = await request(app).get('/api/commissions?status=APPROVED');
    expect(res.status).toBe(200);
    res.body.data.forEach((r: any) => expect(r.status).toBe('APPROVED'));
  });
  it('[D-18] status=APPROVED rep=8: records have status APPROVED', async () => {
    const app = makeApp(oid('d-APPROVED-8'));
    const res = await request(app).get('/api/commissions?status=APPROVED');
    expect(res.status).toBe(200);
    res.body.data.forEach((r: any) => expect(r.status).toBe('APPROVED'));
  });
  it('[D-19] status=APPROVED rep=9: records have status APPROVED', async () => {
    const app = makeApp(oid('d-APPROVED-9'));
    const res = await request(app).get('/api/commissions?status=APPROVED');
    expect(res.status).toBe(200);
    res.body.data.forEach((r: any) => expect(r.status).toBe('APPROVED'));
  });
  it('[D-20] status=PAID rep=0: records have status PAID', async () => {
    const app = makeApp(oid('d-PAID-0'));
    const res = await request(app).get('/api/commissions?status=PAID');
    expect(res.status).toBe(200);
    res.body.data.forEach((r: any) => expect(r.status).toBe('PAID'));
  });
  it('[D-21] status=PAID rep=1: records have status PAID', async () => {
    const app = makeApp(oid('d-PAID-1'));
    const res = await request(app).get('/api/commissions?status=PAID');
    expect(res.status).toBe(200);
    res.body.data.forEach((r: any) => expect(r.status).toBe('PAID'));
  });
  it('[D-22] status=PAID rep=2: records have status PAID', async () => {
    const app = makeApp(oid('d-PAID-2'));
    const res = await request(app).get('/api/commissions?status=PAID');
    expect(res.status).toBe(200);
    res.body.data.forEach((r: any) => expect(r.status).toBe('PAID'));
  });
  it('[D-23] status=PAID rep=3: records have status PAID', async () => {
    const app = makeApp(oid('d-PAID-3'));
    const res = await request(app).get('/api/commissions?status=PAID');
    expect(res.status).toBe(200);
    res.body.data.forEach((r: any) => expect(r.status).toBe('PAID'));
  });
  it('[D-24] status=PAID rep=4: records have status PAID', async () => {
    const app = makeApp(oid('d-PAID-4'));
    const res = await request(app).get('/api/commissions?status=PAID');
    expect(res.status).toBe(200);
    res.body.data.forEach((r: any) => expect(r.status).toBe('PAID'));
  });
  it('[D-25] status=PAID rep=5: records have status PAID', async () => {
    const app = makeApp(oid('d-PAID-5'));
    const res = await request(app).get('/api/commissions?status=PAID');
    expect(res.status).toBe(200);
    res.body.data.forEach((r: any) => expect(r.status).toBe('PAID'));
  });
  it('[D-26] status=PAID rep=6: records have status PAID', async () => {
    const app = makeApp(oid('d-PAID-6'));
    const res = await request(app).get('/api/commissions?status=PAID');
    expect(res.status).toBe(200);
    res.body.data.forEach((r: any) => expect(r.status).toBe('PAID'));
  });
  it('[D-27] status=PAID rep=7: records have status PAID', async () => {
    const app = makeApp(oid('d-PAID-7'));
    const res = await request(app).get('/api/commissions?status=PAID');
    expect(res.status).toBe(200);
    res.body.data.forEach((r: any) => expect(r.status).toBe('PAID'));
  });
  it('[D-28] status=PAID rep=8: records have status PAID', async () => {
    const app = makeApp(oid('d-PAID-8'));
    const res = await request(app).get('/api/commissions?status=PAID');
    expect(res.status).toBe(200);
    res.body.data.forEach((r: any) => expect(r.status).toBe('PAID'));
  });
  it('[D-29] status=PAID rep=9: records have status PAID', async () => {
    const app = makeApp(oid('d-PAID-9'));
    const res = await request(app).get('/api/commissions?status=PAID');
    expect(res.status).toBe(200);
    res.body.data.forEach((r: any) => expect(r.status).toBe('PAID'));
  });
  it('[D-30] status=DISPUTED rep=0: records have status DISPUTED', async () => {
    const app = makeApp(oid('d-DISPUTED-0'));
    const res = await request(app).get('/api/commissions?status=DISPUTED');
    expect(res.status).toBe(200);
    res.body.data.forEach((r: any) => expect(r.status).toBe('DISPUTED'));
  });
  it('[D-31] status=DISPUTED rep=1: records have status DISPUTED', async () => {
    const app = makeApp(oid('d-DISPUTED-1'));
    const res = await request(app).get('/api/commissions?status=DISPUTED');
    expect(res.status).toBe(200);
    res.body.data.forEach((r: any) => expect(r.status).toBe('DISPUTED'));
  });
  it('[D-32] status=DISPUTED rep=2: records have status DISPUTED', async () => {
    const app = makeApp(oid('d-DISPUTED-2'));
    const res = await request(app).get('/api/commissions?status=DISPUTED');
    expect(res.status).toBe(200);
    res.body.data.forEach((r: any) => expect(r.status).toBe('DISPUTED'));
  });
  it('[D-33] status=DISPUTED rep=3: records have status DISPUTED', async () => {
    const app = makeApp(oid('d-DISPUTED-3'));
    const res = await request(app).get('/api/commissions?status=DISPUTED');
    expect(res.status).toBe(200);
    res.body.data.forEach((r: any) => expect(r.status).toBe('DISPUTED'));
  });
  it('[D-34] status=DISPUTED rep=4: records have status DISPUTED', async () => {
    const app = makeApp(oid('d-DISPUTED-4'));
    const res = await request(app).get('/api/commissions?status=DISPUTED');
    expect(res.status).toBe(200);
    res.body.data.forEach((r: any) => expect(r.status).toBe('DISPUTED'));
  });
  it('[D-35] status=DISPUTED rep=5: records have status DISPUTED', async () => {
    const app = makeApp(oid('d-DISPUTED-5'));
    const res = await request(app).get('/api/commissions?status=DISPUTED');
    expect(res.status).toBe(200);
    res.body.data.forEach((r: any) => expect(r.status).toBe('DISPUTED'));
  });
  it('[D-36] status=DISPUTED rep=6: records have status DISPUTED', async () => {
    const app = makeApp(oid('d-DISPUTED-6'));
    const res = await request(app).get('/api/commissions?status=DISPUTED');
    expect(res.status).toBe(200);
    res.body.data.forEach((r: any) => expect(r.status).toBe('DISPUTED'));
  });
  it('[D-37] status=DISPUTED rep=7: records have status DISPUTED', async () => {
    const app = makeApp(oid('d-DISPUTED-7'));
    const res = await request(app).get('/api/commissions?status=DISPUTED');
    expect(res.status).toBe(200);
    res.body.data.forEach((r: any) => expect(r.status).toBe('DISPUTED'));
  });
  it('[D-38] status=DISPUTED rep=8: records have status DISPUTED', async () => {
    const app = makeApp(oid('d-DISPUTED-8'));
    const res = await request(app).get('/api/commissions?status=DISPUTED');
    expect(res.status).toBe(200);
    res.body.data.forEach((r: any) => expect(r.status).toBe('DISPUTED'));
  });
  it('[D-39] status=DISPUTED rep=9: records have status DISPUTED', async () => {
    const app = makeApp(oid('d-DISPUTED-9'));
    const res = await request(app).get('/api/commissions?status=DISPUTED');
    expect(res.status).toBe(200);
    res.body.data.forEach((r: any) => expect(r.status).toBe('DISPUTED'));
  });
  it('[D-40] status=CANCELLED rep=0: records have status CANCELLED', async () => {
    const app = makeApp(oid('d-CANCELLED-0'));
    const res = await request(app).get('/api/commissions?status=CANCELLED');
    expect(res.status).toBe(200);
    res.body.data.forEach((r: any) => expect(r.status).toBe('CANCELLED'));
  });
  it('[D-41] status=CANCELLED rep=1: records have status CANCELLED', async () => {
    const app = makeApp(oid('d-CANCELLED-1'));
    const res = await request(app).get('/api/commissions?status=CANCELLED');
    expect(res.status).toBe(200);
    res.body.data.forEach((r: any) => expect(r.status).toBe('CANCELLED'));
  });
  it('[D-42] status=CANCELLED rep=2: records have status CANCELLED', async () => {
    const app = makeApp(oid('d-CANCELLED-2'));
    const res = await request(app).get('/api/commissions?status=CANCELLED');
    expect(res.status).toBe(200);
    res.body.data.forEach((r: any) => expect(r.status).toBe('CANCELLED'));
  });
  it('[D-43] status=CANCELLED rep=3: records have status CANCELLED', async () => {
    const app = makeApp(oid('d-CANCELLED-3'));
    const res = await request(app).get('/api/commissions?status=CANCELLED');
    expect(res.status).toBe(200);
    res.body.data.forEach((r: any) => expect(r.status).toBe('CANCELLED'));
  });
  it('[D-44] status=CANCELLED rep=4: records have status CANCELLED', async () => {
    const app = makeApp(oid('d-CANCELLED-4'));
    const res = await request(app).get('/api/commissions?status=CANCELLED');
    expect(res.status).toBe(200);
    res.body.data.forEach((r: any) => expect(r.status).toBe('CANCELLED'));
  });
  it('[D-45] status=CANCELLED rep=5: records have status CANCELLED', async () => {
    const app = makeApp(oid('d-CANCELLED-5'));
    const res = await request(app).get('/api/commissions?status=CANCELLED');
    expect(res.status).toBe(200);
    res.body.data.forEach((r: any) => expect(r.status).toBe('CANCELLED'));
  });
  it('[D-46] status=CANCELLED rep=6: records have status CANCELLED', async () => {
    const app = makeApp(oid('d-CANCELLED-6'));
    const res = await request(app).get('/api/commissions?status=CANCELLED');
    expect(res.status).toBe(200);
    res.body.data.forEach((r: any) => expect(r.status).toBe('CANCELLED'));
  });
  it('[D-47] status=CANCELLED rep=7: records have status CANCELLED', async () => {
    const app = makeApp(oid('d-CANCELLED-7'));
    const res = await request(app).get('/api/commissions?status=CANCELLED');
    expect(res.status).toBe(200);
    res.body.data.forEach((r: any) => expect(r.status).toBe('CANCELLED'));
  });
  it('[D-48] status=CANCELLED rep=8: records have status CANCELLED', async () => {
    const app = makeApp(oid('d-CANCELLED-8'));
    const res = await request(app).get('/api/commissions?status=CANCELLED');
    expect(res.status).toBe(200);
    res.body.data.forEach((r: any) => expect(r.status).toBe('CANCELLED'));
  });
  it('[D-49] status=CANCELLED rep=9: records have status CANCELLED', async () => {
    const app = makeApp(oid('d-CANCELLED-9'));
    const res = await request(app).get('/api/commissions?status=CANCELLED');
    expect(res.status).toBe(200);
    res.body.data.forEach((r: any) => expect(r.status).toBe('CANCELLED'));
  });
  it('[D-ex-0] PAID filter returns only PAID', async () => {
    const app = makeApp(oid('d-ex-0')); const res = await request(app).get('/api/commissions?status=PAID'); expect(res.body.data.every((r: any) => r.status === 'PAID')).toBe(true);
  });
  it('[D-ex-1] PENDING filter returns only PENDING', async () => {
    const app = makeApp(oid('d-ex-1')); const res = await request(app).get('/api/commissions?status=PENDING'); expect(res.body.data.every((r: any) => r.status === 'PENDING')).toBe(true);
  });
  it('[D-ex-2] seeded has 2 PAID records', async () => {
    const app = makeApp(oid('d-ex-2')); const res = await request(app).get('/api/commissions?status=PAID'); expect(res.body.data).toHaveLength(2);
  });
  it('[D-ex-3] seeded has 1 APPROVED record', async () => {
    const app = makeApp(oid('d-ex-3')); const res = await request(app).get('/api/commissions?status=APPROVED'); expect(res.body.data).toHaveLength(1);
  });
  it('[D-ex-4] seeded has 2 PENDING records', async () => {
    const app = makeApp(oid('d-ex-4')); const res = await request(app).get('/api/commissions?status=PENDING'); expect(res.body.data).toHaveLength(2);
  });
  it('[D-ex-5] unknown status empty array', async () => {
    const app = makeApp(oid('d-ex-5')); const res = await request(app).get('/api/commissions?status=UNKNOWN'); expect(res.body.data).toHaveLength(0);
  });
  it('[D-ex-6] no filter returns 5 records', async () => {
    const app = makeApp(oid('d-ex-6')); const res = await request(app).get('/api/commissions'); expect(res.body.data).toHaveLength(5);
  });
  it('[D-ex-7] APPROVED filter returns only APPROVED', async () => {
    const app = makeApp(oid('d-ex-7')); const res = await request(app).get('/api/commissions?status=APPROVED'); expect(res.body.data.every((r: any) => r.status === 'APPROVED')).toBe(true);
  });
  it('[D-ex-8] DISPUTED empty from seed', async () => {
    const app = makeApp(oid('d-ex-8')); const res = await request(app).get('/api/commissions?status=DISPUTED'); expect(res.body.data).toHaveLength(0);
  });
  it('[D-ex-9] CANCELLED empty from seed', async () => {
    const app = makeApp(oid('d-ex-9')); const res = await request(app).get('/api/commissions?status=CANCELLED'); expect(res.body.data).toHaveLength(0);
  });
});

// ─── Suite E: Period filter ───────────────────────────────────────────────────
describe('GET /api/commissions?period= filtering', () => {
  it('[E-0] period=2025-10 rep=0: records have periodMonth', async () => {
    const app = makeApp(oid('e-202510-0'));
    const res = await request(app).get('/api/commissions?period=2025-10');
    expect(res.status).toBe(200);
    res.body.data.forEach((r: any) => expect(r.periodMonth).toBe('2025-10'));
  });
  it('[E-1] period=2025-10 rep=1: records have periodMonth', async () => {
    const app = makeApp(oid('e-202510-1'));
    const res = await request(app).get('/api/commissions?period=2025-10');
    expect(res.status).toBe(200);
    res.body.data.forEach((r: any) => expect(r.periodMonth).toBe('2025-10'));
  });
  it('[E-2] period=2025-10 rep=2: records have periodMonth', async () => {
    const app = makeApp(oid('e-202510-2'));
    const res = await request(app).get('/api/commissions?period=2025-10');
    expect(res.status).toBe(200);
    res.body.data.forEach((r: any) => expect(r.periodMonth).toBe('2025-10'));
  });
  it('[E-3] period=2025-10 rep=3: records have periodMonth', async () => {
    const app = makeApp(oid('e-202510-3'));
    const res = await request(app).get('/api/commissions?period=2025-10');
    expect(res.status).toBe(200);
    res.body.data.forEach((r: any) => expect(r.periodMonth).toBe('2025-10'));
  });
  it('[E-4] period=2025-10 rep=4: records have periodMonth', async () => {
    const app = makeApp(oid('e-202510-4'));
    const res = await request(app).get('/api/commissions?period=2025-10');
    expect(res.status).toBe(200);
    res.body.data.forEach((r: any) => expect(r.periodMonth).toBe('2025-10'));
  });
  it('[E-5] period=2025-11 rep=0: records have periodMonth', async () => {
    const app = makeApp(oid('e-202511-0'));
    const res = await request(app).get('/api/commissions?period=2025-11');
    expect(res.status).toBe(200);
    res.body.data.forEach((r: any) => expect(r.periodMonth).toBe('2025-11'));
  });
  it('[E-6] period=2025-11 rep=1: records have periodMonth', async () => {
    const app = makeApp(oid('e-202511-1'));
    const res = await request(app).get('/api/commissions?period=2025-11');
    expect(res.status).toBe(200);
    res.body.data.forEach((r: any) => expect(r.periodMonth).toBe('2025-11'));
  });
  it('[E-7] period=2025-11 rep=2: records have periodMonth', async () => {
    const app = makeApp(oid('e-202511-2'));
    const res = await request(app).get('/api/commissions?period=2025-11');
    expect(res.status).toBe(200);
    res.body.data.forEach((r: any) => expect(r.periodMonth).toBe('2025-11'));
  });
  it('[E-8] period=2025-11 rep=3: records have periodMonth', async () => {
    const app = makeApp(oid('e-202511-3'));
    const res = await request(app).get('/api/commissions?period=2025-11');
    expect(res.status).toBe(200);
    res.body.data.forEach((r: any) => expect(r.periodMonth).toBe('2025-11'));
  });
  it('[E-9] period=2025-11 rep=4: records have periodMonth', async () => {
    const app = makeApp(oid('e-202511-4'));
    const res = await request(app).get('/api/commissions?period=2025-11');
    expect(res.status).toBe(200);
    res.body.data.forEach((r: any) => expect(r.periodMonth).toBe('2025-11'));
  });
  it('[E-10] period=2025-12 rep=0: records have periodMonth', async () => {
    const app = makeApp(oid('e-202512-0'));
    const res = await request(app).get('/api/commissions?period=2025-12');
    expect(res.status).toBe(200);
    res.body.data.forEach((r: any) => expect(r.periodMonth).toBe('2025-12'));
  });
  it('[E-11] period=2025-12 rep=1: records have periodMonth', async () => {
    const app = makeApp(oid('e-202512-1'));
    const res = await request(app).get('/api/commissions?period=2025-12');
    expect(res.status).toBe(200);
    res.body.data.forEach((r: any) => expect(r.periodMonth).toBe('2025-12'));
  });
  it('[E-12] period=2025-12 rep=2: records have periodMonth', async () => {
    const app = makeApp(oid('e-202512-2'));
    const res = await request(app).get('/api/commissions?period=2025-12');
    expect(res.status).toBe(200);
    res.body.data.forEach((r: any) => expect(r.periodMonth).toBe('2025-12'));
  });
  it('[E-13] period=2025-12 rep=3: records have periodMonth', async () => {
    const app = makeApp(oid('e-202512-3'));
    const res = await request(app).get('/api/commissions?period=2025-12');
    expect(res.status).toBe(200);
    res.body.data.forEach((r: any) => expect(r.periodMonth).toBe('2025-12'));
  });
  it('[E-14] period=2025-12 rep=4: records have periodMonth', async () => {
    const app = makeApp(oid('e-202512-4'));
    const res = await request(app).get('/api/commissions?period=2025-12');
    expect(res.status).toBe(200);
    res.body.data.forEach((r: any) => expect(r.periodMonth).toBe('2025-12'));
  });
  it('[E-15] period=2026-01 rep=0: records have periodMonth', async () => {
    const app = makeApp(oid('e-202601-0'));
    const res = await request(app).get('/api/commissions?period=2026-01');
    expect(res.status).toBe(200);
    res.body.data.forEach((r: any) => expect(r.periodMonth).toBe('2026-01'));
  });
  it('[E-16] period=2026-01 rep=1: records have periodMonth', async () => {
    const app = makeApp(oid('e-202601-1'));
    const res = await request(app).get('/api/commissions?period=2026-01');
    expect(res.status).toBe(200);
    res.body.data.forEach((r: any) => expect(r.periodMonth).toBe('2026-01'));
  });
  it('[E-17] period=2026-01 rep=2: records have periodMonth', async () => {
    const app = makeApp(oid('e-202601-2'));
    const res = await request(app).get('/api/commissions?period=2026-01');
    expect(res.status).toBe(200);
    res.body.data.forEach((r: any) => expect(r.periodMonth).toBe('2026-01'));
  });
  it('[E-18] period=2026-01 rep=3: records have periodMonth', async () => {
    const app = makeApp(oid('e-202601-3'));
    const res = await request(app).get('/api/commissions?period=2026-01');
    expect(res.status).toBe(200);
    res.body.data.forEach((r: any) => expect(r.periodMonth).toBe('2026-01'));
  });
  it('[E-19] period=2026-01 rep=4: records have periodMonth', async () => {
    const app = makeApp(oid('e-202601-4'));
    const res = await request(app).get('/api/commissions?period=2026-01');
    expect(res.status).toBe(200);
    res.body.data.forEach((r: any) => expect(r.periodMonth).toBe('2026-01'));
  });
  it('[E-20] period=2026-02 rep=0: records have periodMonth', async () => {
    const app = makeApp(oid('e-202602-0'));
    const res = await request(app).get('/api/commissions?period=2026-02');
    expect(res.status).toBe(200);
    res.body.data.forEach((r: any) => expect(r.periodMonth).toBe('2026-02'));
  });
  it('[E-21] period=2026-02 rep=1: records have periodMonth', async () => {
    const app = makeApp(oid('e-202602-1'));
    const res = await request(app).get('/api/commissions?period=2026-02');
    expect(res.status).toBe(200);
    res.body.data.forEach((r: any) => expect(r.periodMonth).toBe('2026-02'));
  });
  it('[E-22] period=2026-02 rep=2: records have periodMonth', async () => {
    const app = makeApp(oid('e-202602-2'));
    const res = await request(app).get('/api/commissions?period=2026-02');
    expect(res.status).toBe(200);
    res.body.data.forEach((r: any) => expect(r.periodMonth).toBe('2026-02'));
  });
  it('[E-23] period=2026-02 rep=3: records have periodMonth', async () => {
    const app = makeApp(oid('e-202602-3'));
    const res = await request(app).get('/api/commissions?period=2026-02');
    expect(res.status).toBe(200);
    res.body.data.forEach((r: any) => expect(r.periodMonth).toBe('2026-02'));
  });
  it('[E-24] period=2026-02 rep=4: records have periodMonth', async () => {
    const app = makeApp(oid('e-202602-4'));
    const res = await request(app).get('/api/commissions?period=2026-02');
    expect(res.status).toBe(200);
    res.body.data.forEach((r: any) => expect(r.periodMonth).toBe('2026-02'));
  });
  it('[E-ex-0] 2025-10 returns 1 CM-2025-0001', async () => {
    const app = makeApp(oid('e-ex-0')); const res = await request(app).get('/api/commissions?period=2025-10'); expect(res.body.data).toHaveLength(1); expect(res.body.data[0].referenceNumber).toBe('CM-2025-0001');
  });
  it('[E-ex-1] 2025-11 returns 1 CM-2025-0002', async () => {
    const app = makeApp(oid('e-ex-1')); const res = await request(app).get('/api/commissions?period=2025-11'); expect(res.body.data).toHaveLength(1); expect(res.body.data[0].referenceNumber).toBe('CM-2025-0002');
  });
  it('[E-ex-2] 2025-12 returns 1 CM-2025-0003', async () => {
    const app = makeApp(oid('e-ex-2')); const res = await request(app).get('/api/commissions?period=2025-12'); expect(res.body.data).toHaveLength(1); expect(res.body.data[0].referenceNumber).toBe('CM-2025-0003');
  });
  it('[E-ex-3] 2026-01 returns 1 CM-2026-0001', async () => {
    const app = makeApp(oid('e-ex-3')); const res = await request(app).get('/api/commissions?period=2026-01'); expect(res.body.data).toHaveLength(1); expect(res.body.data[0].referenceNumber).toBe('CM-2026-0001');
  });
  it('[E-ex-4] 2026-02 returns 1 CM-2026-0002', async () => {
    const app = makeApp(oid('e-ex-4')); const res = await request(app).get('/api/commissions?period=2026-02'); expect(res.body.data).toHaveLength(1); expect(res.body.data[0].referenceNumber).toBe('CM-2026-0002');
  });
  it('[E-ex-5] no match returns empty', async () => {
    const app = makeApp(oid('e-ex-5')); const res = await request(app).get('/api/commissions?period=2099-01'); expect(res.body.data).toHaveLength(0);
  });
  it('[E-ex-6] PAID+2025-10 returns 1', async () => {
    const app = makeApp(oid('e-ex-6')); const res = await request(app).get('/api/commissions?status=PAID&period=2025-10'); expect(res.body.data).toHaveLength(1);
  });
  it('[E-ex-7] PENDING+2026-01 returns 1', async () => {
    const app = makeApp(oid('e-ex-7')); const res = await request(app).get('/api/commissions?status=PENDING&period=2026-01'); expect(res.body.data).toHaveLength(1);
  });
  it('[E-ex-8] APPROVED+2025-12 returns 1', async () => {
    const app = makeApp(oid('e-ex-8')); const res = await request(app).get('/api/commissions?status=APPROVED&period=2025-12'); expect(res.body.data).toHaveLength(1);
  });
  it('[E-ex-9] PAID+2026-01 returns 0', async () => {
    const app = makeApp(oid('e-ex-9')); const res = await request(app).get('/api/commissions?status=PAID&period=2026-01'); expect(res.body.data).toHaveLength(0);
  });
});

// ─── Suite F: Org isolation ───────────────────────────────────────────────────
describe('GET /api/commissions — org isolation', () => {
  it('[F-0] org-f-a-0 only sees its own records', async () => {
    const appA = makeApp(oid('f-a-0'));
    const appB = makeApp(oid('f-b-0'));
    const resA = await request(appA).get('/api/commissions');
    const resB = await request(appB).get('/api/commissions');
    resA.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-a-0')));
    resB.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-b-0')));
  });
  it('[F-1] org-f-a-1 only sees its own records', async () => {
    const appA = makeApp(oid('f-a-1'));
    const appB = makeApp(oid('f-b-1'));
    const resA = await request(appA).get('/api/commissions');
    const resB = await request(appB).get('/api/commissions');
    resA.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-a-1')));
    resB.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-b-1')));
  });
  it('[F-2] org-f-a-2 only sees its own records', async () => {
    const appA = makeApp(oid('f-a-2'));
    const appB = makeApp(oid('f-b-2'));
    const resA = await request(appA).get('/api/commissions');
    const resB = await request(appB).get('/api/commissions');
    resA.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-a-2')));
    resB.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-b-2')));
  });
  it('[F-3] org-f-a-3 only sees its own records', async () => {
    const appA = makeApp(oid('f-a-3'));
    const appB = makeApp(oid('f-b-3'));
    const resA = await request(appA).get('/api/commissions');
    const resB = await request(appB).get('/api/commissions');
    resA.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-a-3')));
    resB.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-b-3')));
  });
  it('[F-4] org-f-a-4 only sees its own records', async () => {
    const appA = makeApp(oid('f-a-4'));
    const appB = makeApp(oid('f-b-4'));
    const resA = await request(appA).get('/api/commissions');
    const resB = await request(appB).get('/api/commissions');
    resA.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-a-4')));
    resB.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-b-4')));
  });
  it('[F-5] org-f-a-5 only sees its own records', async () => {
    const appA = makeApp(oid('f-a-5'));
    const appB = makeApp(oid('f-b-5'));
    const resA = await request(appA).get('/api/commissions');
    const resB = await request(appB).get('/api/commissions');
    resA.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-a-5')));
    resB.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-b-5')));
  });
  it('[F-6] org-f-a-6 only sees its own records', async () => {
    const appA = makeApp(oid('f-a-6'));
    const appB = makeApp(oid('f-b-6'));
    const resA = await request(appA).get('/api/commissions');
    const resB = await request(appB).get('/api/commissions');
    resA.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-a-6')));
    resB.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-b-6')));
  });
  it('[F-7] org-f-a-7 only sees its own records', async () => {
    const appA = makeApp(oid('f-a-7'));
    const appB = makeApp(oid('f-b-7'));
    const resA = await request(appA).get('/api/commissions');
    const resB = await request(appB).get('/api/commissions');
    resA.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-a-7')));
    resB.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-b-7')));
  });
  it('[F-8] org-f-a-8 only sees its own records', async () => {
    const appA = makeApp(oid('f-a-8'));
    const appB = makeApp(oid('f-b-8'));
    const resA = await request(appA).get('/api/commissions');
    const resB = await request(appB).get('/api/commissions');
    resA.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-a-8')));
    resB.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-b-8')));
  });
  it('[F-9] org-f-a-9 only sees its own records', async () => {
    const appA = makeApp(oid('f-a-9'));
    const appB = makeApp(oid('f-b-9'));
    const resA = await request(appA).get('/api/commissions');
    const resB = await request(appB).get('/api/commissions');
    resA.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-a-9')));
    resB.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-b-9')));
  });
  it('[F-10] org-f-a-10 only sees its own records', async () => {
    const appA = makeApp(oid('f-a-10'));
    const appB = makeApp(oid('f-b-10'));
    const resA = await request(appA).get('/api/commissions');
    const resB = await request(appB).get('/api/commissions');
    resA.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-a-10')));
    resB.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-b-10')));
  });
  it('[F-11] org-f-a-11 only sees its own records', async () => {
    const appA = makeApp(oid('f-a-11'));
    const appB = makeApp(oid('f-b-11'));
    const resA = await request(appA).get('/api/commissions');
    const resB = await request(appB).get('/api/commissions');
    resA.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-a-11')));
    resB.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-b-11')));
  });
  it('[F-12] org-f-a-12 only sees its own records', async () => {
    const appA = makeApp(oid('f-a-12'));
    const appB = makeApp(oid('f-b-12'));
    const resA = await request(appA).get('/api/commissions');
    const resB = await request(appB).get('/api/commissions');
    resA.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-a-12')));
    resB.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-b-12')));
  });
  it('[F-13] org-f-a-13 only sees its own records', async () => {
    const appA = makeApp(oid('f-a-13'));
    const appB = makeApp(oid('f-b-13'));
    const resA = await request(appA).get('/api/commissions');
    const resB = await request(appB).get('/api/commissions');
    resA.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-a-13')));
    resB.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-b-13')));
  });
  it('[F-14] org-f-a-14 only sees its own records', async () => {
    const appA = makeApp(oid('f-a-14'));
    const appB = makeApp(oid('f-b-14'));
    const resA = await request(appA).get('/api/commissions');
    const resB = await request(appB).get('/api/commissions');
    resA.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-a-14')));
    resB.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-b-14')));
  });
  it('[F-15] org-f-a-15 only sees its own records', async () => {
    const appA = makeApp(oid('f-a-15'));
    const appB = makeApp(oid('f-b-15'));
    const resA = await request(appA).get('/api/commissions');
    const resB = await request(appB).get('/api/commissions');
    resA.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-a-15')));
    resB.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-b-15')));
  });
  it('[F-16] org-f-a-16 only sees its own records', async () => {
    const appA = makeApp(oid('f-a-16'));
    const appB = makeApp(oid('f-b-16'));
    const resA = await request(appA).get('/api/commissions');
    const resB = await request(appB).get('/api/commissions');
    resA.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-a-16')));
    resB.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-b-16')));
  });
  it('[F-17] org-f-a-17 only sees its own records', async () => {
    const appA = makeApp(oid('f-a-17'));
    const appB = makeApp(oid('f-b-17'));
    const resA = await request(appA).get('/api/commissions');
    const resB = await request(appB).get('/api/commissions');
    resA.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-a-17')));
    resB.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-b-17')));
  });
  it('[F-18] org-f-a-18 only sees its own records', async () => {
    const appA = makeApp(oid('f-a-18'));
    const appB = makeApp(oid('f-b-18'));
    const resA = await request(appA).get('/api/commissions');
    const resB = await request(appB).get('/api/commissions');
    resA.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-a-18')));
    resB.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-b-18')));
  });
  it('[F-19] org-f-a-19 only sees its own records', async () => {
    const appA = makeApp(oid('f-a-19'));
    const appB = makeApp(oid('f-b-19'));
    const resA = await request(appA).get('/api/commissions');
    const resB = await request(appB).get('/api/commissions');
    resA.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-a-19')));
    resB.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-b-19')));
  });
  it('[F-20] org-f-a-20 only sees its own records', async () => {
    const appA = makeApp(oid('f-a-20'));
    const appB = makeApp(oid('f-b-20'));
    const resA = await request(appA).get('/api/commissions');
    const resB = await request(appB).get('/api/commissions');
    resA.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-a-20')));
    resB.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-b-20')));
  });
  it('[F-21] org-f-a-21 only sees its own records', async () => {
    const appA = makeApp(oid('f-a-21'));
    const appB = makeApp(oid('f-b-21'));
    const resA = await request(appA).get('/api/commissions');
    const resB = await request(appB).get('/api/commissions');
    resA.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-a-21')));
    resB.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-b-21')));
  });
  it('[F-22] org-f-a-22 only sees its own records', async () => {
    const appA = makeApp(oid('f-a-22'));
    const appB = makeApp(oid('f-b-22'));
    const resA = await request(appA).get('/api/commissions');
    const resB = await request(appB).get('/api/commissions');
    resA.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-a-22')));
    resB.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-b-22')));
  });
  it('[F-23] org-f-a-23 only sees its own records', async () => {
    const appA = makeApp(oid('f-a-23'));
    const appB = makeApp(oid('f-b-23'));
    const resA = await request(appA).get('/api/commissions');
    const resB = await request(appB).get('/api/commissions');
    resA.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-a-23')));
    resB.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-b-23')));
  });
  it('[F-24] org-f-a-24 only sees its own records', async () => {
    const appA = makeApp(oid('f-a-24'));
    const appB = makeApp(oid('f-b-24'));
    const resA = await request(appA).get('/api/commissions');
    const resB = await request(appB).get('/api/commissions');
    resA.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-a-24')));
    resB.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-b-24')));
  });
  it('[F-25] org-f-a-25 only sees its own records', async () => {
    const appA = makeApp(oid('f-a-25'));
    const appB = makeApp(oid('f-b-25'));
    const resA = await request(appA).get('/api/commissions');
    const resB = await request(appB).get('/api/commissions');
    resA.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-a-25')));
    resB.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-b-25')));
  });
  it('[F-26] org-f-a-26 only sees its own records', async () => {
    const appA = makeApp(oid('f-a-26'));
    const appB = makeApp(oid('f-b-26'));
    const resA = await request(appA).get('/api/commissions');
    const resB = await request(appB).get('/api/commissions');
    resA.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-a-26')));
    resB.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-b-26')));
  });
  it('[F-27] org-f-a-27 only sees its own records', async () => {
    const appA = makeApp(oid('f-a-27'));
    const appB = makeApp(oid('f-b-27'));
    const resA = await request(appA).get('/api/commissions');
    const resB = await request(appB).get('/api/commissions');
    resA.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-a-27')));
    resB.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-b-27')));
  });
  it('[F-28] org-f-a-28 only sees its own records', async () => {
    const appA = makeApp(oid('f-a-28'));
    const appB = makeApp(oid('f-b-28'));
    const resA = await request(appA).get('/api/commissions');
    const resB = await request(appB).get('/api/commissions');
    resA.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-a-28')));
    resB.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-b-28')));
  });
  it('[F-29] org-f-a-29 only sees its own records', async () => {
    const appA = makeApp(oid('f-a-29'));
    const appB = makeApp(oid('f-b-29'));
    const resA = await request(appA).get('/api/commissions');
    const resB = await request(appB).get('/api/commissions');
    resA.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-a-29')));
    resB.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-b-29')));
  });
  it('[F-30] org-f-a-30 only sees its own records', async () => {
    const appA = makeApp(oid('f-a-30'));
    const appB = makeApp(oid('f-b-30'));
    const resA = await request(appA).get('/api/commissions');
    const resB = await request(appB).get('/api/commissions');
    resA.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-a-30')));
    resB.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-b-30')));
  });
  it('[F-31] org-f-a-31 only sees its own records', async () => {
    const appA = makeApp(oid('f-a-31'));
    const appB = makeApp(oid('f-b-31'));
    const resA = await request(appA).get('/api/commissions');
    const resB = await request(appB).get('/api/commissions');
    resA.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-a-31')));
    resB.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-b-31')));
  });
  it('[F-32] org-f-a-32 only sees its own records', async () => {
    const appA = makeApp(oid('f-a-32'));
    const appB = makeApp(oid('f-b-32'));
    const resA = await request(appA).get('/api/commissions');
    const resB = await request(appB).get('/api/commissions');
    resA.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-a-32')));
    resB.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-b-32')));
  });
  it('[F-33] org-f-a-33 only sees its own records', async () => {
    const appA = makeApp(oid('f-a-33'));
    const appB = makeApp(oid('f-b-33'));
    const resA = await request(appA).get('/api/commissions');
    const resB = await request(appB).get('/api/commissions');
    resA.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-a-33')));
    resB.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-b-33')));
  });
  it('[F-34] org-f-a-34 only sees its own records', async () => {
    const appA = makeApp(oid('f-a-34'));
    const appB = makeApp(oid('f-b-34'));
    const resA = await request(appA).get('/api/commissions');
    const resB = await request(appB).get('/api/commissions');
    resA.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-a-34')));
    resB.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-b-34')));
  });
  it('[F-35] org-f-a-35 only sees its own records', async () => {
    const appA = makeApp(oid('f-a-35'));
    const appB = makeApp(oid('f-b-35'));
    const resA = await request(appA).get('/api/commissions');
    const resB = await request(appB).get('/api/commissions');
    resA.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-a-35')));
    resB.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-b-35')));
  });
  it('[F-36] org-f-a-36 only sees its own records', async () => {
    const appA = makeApp(oid('f-a-36'));
    const appB = makeApp(oid('f-b-36'));
    const resA = await request(appA).get('/api/commissions');
    const resB = await request(appB).get('/api/commissions');
    resA.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-a-36')));
    resB.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-b-36')));
  });
  it('[F-37] org-f-a-37 only sees its own records', async () => {
    const appA = makeApp(oid('f-a-37'));
    const appB = makeApp(oid('f-b-37'));
    const resA = await request(appA).get('/api/commissions');
    const resB = await request(appB).get('/api/commissions');
    resA.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-a-37')));
    resB.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-b-37')));
  });
  it('[F-38] org-f-a-38 only sees its own records', async () => {
    const appA = makeApp(oid('f-a-38'));
    const appB = makeApp(oid('f-b-38'));
    const resA = await request(appA).get('/api/commissions');
    const resB = await request(appB).get('/api/commissions');
    resA.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-a-38')));
    resB.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-b-38')));
  });
  it('[F-39] org-f-a-39 only sees its own records', async () => {
    const appA = makeApp(oid('f-a-39'));
    const appB = makeApp(oid('f-b-39'));
    const resA = await request(appA).get('/api/commissions');
    const resB = await request(appB).get('/api/commissions');
    resA.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-a-39')));
    resB.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-b-39')));
  });
  it('[F-40] org-f-a-40 only sees its own records', async () => {
    const appA = makeApp(oid('f-a-40'));
    const appB = makeApp(oid('f-b-40'));
    const resA = await request(appA).get('/api/commissions');
    const resB = await request(appB).get('/api/commissions');
    resA.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-a-40')));
    resB.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-b-40')));
  });
  it('[F-41] org-f-a-41 only sees its own records', async () => {
    const appA = makeApp(oid('f-a-41'));
    const appB = makeApp(oid('f-b-41'));
    const resA = await request(appA).get('/api/commissions');
    const resB = await request(appB).get('/api/commissions');
    resA.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-a-41')));
    resB.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-b-41')));
  });
  it('[F-42] org-f-a-42 only sees its own records', async () => {
    const appA = makeApp(oid('f-a-42'));
    const appB = makeApp(oid('f-b-42'));
    const resA = await request(appA).get('/api/commissions');
    const resB = await request(appB).get('/api/commissions');
    resA.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-a-42')));
    resB.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-b-42')));
  });
  it('[F-43] org-f-a-43 only sees its own records', async () => {
    const appA = makeApp(oid('f-a-43'));
    const appB = makeApp(oid('f-b-43'));
    const resA = await request(appA).get('/api/commissions');
    const resB = await request(appB).get('/api/commissions');
    resA.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-a-43')));
    resB.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-b-43')));
  });
  it('[F-44] org-f-a-44 only sees its own records', async () => {
    const appA = makeApp(oid('f-a-44'));
    const appB = makeApp(oid('f-b-44'));
    const resA = await request(appA).get('/api/commissions');
    const resB = await request(appB).get('/api/commissions');
    resA.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-a-44')));
    resB.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-b-44')));
  });
  it('[F-45] org-f-a-45 only sees its own records', async () => {
    const appA = makeApp(oid('f-a-45'));
    const appB = makeApp(oid('f-b-45'));
    const resA = await request(appA).get('/api/commissions');
    const resB = await request(appB).get('/api/commissions');
    resA.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-a-45')));
    resB.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-b-45')));
  });
  it('[F-46] org-f-a-46 only sees its own records', async () => {
    const appA = makeApp(oid('f-a-46'));
    const appB = makeApp(oid('f-b-46'));
    const resA = await request(appA).get('/api/commissions');
    const resB = await request(appB).get('/api/commissions');
    resA.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-a-46')));
    resB.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-b-46')));
  });
  it('[F-47] org-f-a-47 only sees its own records', async () => {
    const appA = makeApp(oid('f-a-47'));
    const appB = makeApp(oid('f-b-47'));
    const resA = await request(appA).get('/api/commissions');
    const resB = await request(appB).get('/api/commissions');
    resA.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-a-47')));
    resB.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-b-47')));
  });
  it('[F-48] org-f-a-48 only sees its own records', async () => {
    const appA = makeApp(oid('f-a-48'));
    const appB = makeApp(oid('f-b-48'));
    const resA = await request(appA).get('/api/commissions');
    const resB = await request(appB).get('/api/commissions');
    resA.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-a-48')));
    resB.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-b-48')));
  });
  it('[F-49] org-f-a-49 only sees its own records', async () => {
    const appA = makeApp(oid('f-a-49'));
    const appB = makeApp(oid('f-b-49'));
    const resA = await request(appA).get('/api/commissions');
    const resB = await request(appB).get('/api/commissions');
    resA.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-a-49')));
    resB.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('f-b-49')));
  });
});

// ─── Suite G: Summary basic ───────────────────────────────────────────────────
describe('GET /api/commissions/summary — returns 200', () => {
  it('[G-0] returns 200 and success:true for org-g-0', async () => {
    const app = makeApp(oid('g-0'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[G-1] returns 200 and success:true for org-g-1', async () => {
    const app = makeApp(oid('g-1'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[G-2] returns 200 and success:true for org-g-2', async () => {
    const app = makeApp(oid('g-2'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[G-3] returns 200 and success:true for org-g-3', async () => {
    const app = makeApp(oid('g-3'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[G-4] returns 200 and success:true for org-g-4', async () => {
    const app = makeApp(oid('g-4'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[G-5] returns 200 and success:true for org-g-5', async () => {
    const app = makeApp(oid('g-5'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[G-6] returns 200 and success:true for org-g-6', async () => {
    const app = makeApp(oid('g-6'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[G-7] returns 200 and success:true for org-g-7', async () => {
    const app = makeApp(oid('g-7'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[G-8] returns 200 and success:true for org-g-8', async () => {
    const app = makeApp(oid('g-8'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[G-9] returns 200 and success:true for org-g-9', async () => {
    const app = makeApp(oid('g-9'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[G-10] returns 200 and success:true for org-g-10', async () => {
    const app = makeApp(oid('g-10'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[G-11] returns 200 and success:true for org-g-11', async () => {
    const app = makeApp(oid('g-11'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[G-12] returns 200 and success:true for org-g-12', async () => {
    const app = makeApp(oid('g-12'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[G-13] returns 200 and success:true for org-g-13', async () => {
    const app = makeApp(oid('g-13'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[G-14] returns 200 and success:true for org-g-14', async () => {
    const app = makeApp(oid('g-14'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[G-15] returns 200 and success:true for org-g-15', async () => {
    const app = makeApp(oid('g-15'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[G-16] returns 200 and success:true for org-g-16', async () => {
    const app = makeApp(oid('g-16'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[G-17] returns 200 and success:true for org-g-17', async () => {
    const app = makeApp(oid('g-17'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[G-18] returns 200 and success:true for org-g-18', async () => {
    const app = makeApp(oid('g-18'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[G-19] returns 200 and success:true for org-g-19', async () => {
    const app = makeApp(oid('g-19'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[G-20] returns 200 and success:true for org-g-20', async () => {
    const app = makeApp(oid('g-20'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[G-21] returns 200 and success:true for org-g-21', async () => {
    const app = makeApp(oid('g-21'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[G-22] returns 200 and success:true for org-g-22', async () => {
    const app = makeApp(oid('g-22'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[G-23] returns 200 and success:true for org-g-23', async () => {
    const app = makeApp(oid('g-23'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[G-24] returns 200 and success:true for org-g-24', async () => {
    const app = makeApp(oid('g-24'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[G-25] returns 200 and success:true for org-g-25', async () => {
    const app = makeApp(oid('g-25'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[G-26] returns 200 and success:true for org-g-26', async () => {
    const app = makeApp(oid('g-26'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[G-27] returns 200 and success:true for org-g-27', async () => {
    const app = makeApp(oid('g-27'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[G-28] returns 200 and success:true for org-g-28', async () => {
    const app = makeApp(oid('g-28'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[G-29] returns 200 and success:true for org-g-29', async () => {
    const app = makeApp(oid('g-29'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[G-30] returns 200 and success:true for org-g-30', async () => {
    const app = makeApp(oid('g-30'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[G-31] returns 200 and success:true for org-g-31', async () => {
    const app = makeApp(oid('g-31'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[G-32] returns 200 and success:true for org-g-32', async () => {
    const app = makeApp(oid('g-32'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[G-33] returns 200 and success:true for org-g-33', async () => {
    const app = makeApp(oid('g-33'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[G-34] returns 200 and success:true for org-g-34', async () => {
    const app = makeApp(oid('g-34'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[G-35] returns 200 and success:true for org-g-35', async () => {
    const app = makeApp(oid('g-35'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[G-36] returns 200 and success:true for org-g-36', async () => {
    const app = makeApp(oid('g-36'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[G-37] returns 200 and success:true for org-g-37', async () => {
    const app = makeApp(oid('g-37'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[G-38] returns 200 and success:true for org-g-38', async () => {
    const app = makeApp(oid('g-38'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[G-39] returns 200 and success:true for org-g-39', async () => {
    const app = makeApp(oid('g-39'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[G-40] returns 200 and success:true for org-g-40', async () => {
    const app = makeApp(oid('g-40'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[G-41] returns 200 and success:true for org-g-41', async () => {
    const app = makeApp(oid('g-41'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[G-42] returns 200 and success:true for org-g-42', async () => {
    const app = makeApp(oid('g-42'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[G-43] returns 200 and success:true for org-g-43', async () => {
    const app = makeApp(oid('g-43'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[G-44] returns 200 and success:true for org-g-44', async () => {
    const app = makeApp(oid('g-44'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[G-45] returns 200 and success:true for org-g-45', async () => {
    const app = makeApp(oid('g-45'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[G-46] returns 200 and success:true for org-g-46', async () => {
    const app = makeApp(oid('g-46'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[G-47] returns 200 and success:true for org-g-47', async () => {
    const app = makeApp(oid('g-47'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[G-48] returns 200 and success:true for org-g-48', async () => {
    const app = makeApp(oid('g-48'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[G-49] returns 200 and success:true for org-g-49', async () => {
    const app = makeApp(oid('g-49'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[G-50] returns 200 and success:true for org-g-50', async () => {
    const app = makeApp(oid('g-50'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[G-51] returns 200 and success:true for org-g-51', async () => {
    const app = makeApp(oid('g-51'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[G-52] returns 200 and success:true for org-g-52', async () => {
    const app = makeApp(oid('g-52'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[G-53] returns 200 and success:true for org-g-53', async () => {
    const app = makeApp(oid('g-53'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[G-54] returns 200 and success:true for org-g-54', async () => {
    const app = makeApp(oid('g-54'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[G-55] returns 200 and success:true for org-g-55', async () => {
    const app = makeApp(oid('g-55'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[G-56] returns 200 and success:true for org-g-56', async () => {
    const app = makeApp(oid('g-56'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[G-57] returns 200 and success:true for org-g-57', async () => {
    const app = makeApp(oid('g-57'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[G-58] returns 200 and success:true for org-g-58', async () => {
    const app = makeApp(oid('g-58'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[G-59] returns 200 and success:true for org-g-59', async () => {
    const app = makeApp(oid('g-59'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[G-60] returns 200 and success:true for org-g-60', async () => {
    const app = makeApp(oid('g-60'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[G-61] returns 200 and success:true for org-g-61', async () => {
    const app = makeApp(oid('g-61'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[G-62] returns 200 and success:true for org-g-62', async () => {
    const app = makeApp(oid('g-62'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[G-63] returns 200 and success:true for org-g-63', async () => {
    const app = makeApp(oid('g-63'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[G-64] returns 200 and success:true for org-g-64', async () => {
    const app = makeApp(oid('g-64'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[G-65] returns 200 and success:true for org-g-65', async () => {
    const app = makeApp(oid('g-65'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[G-66] returns 200 and success:true for org-g-66', async () => {
    const app = makeApp(oid('g-66'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[G-67] returns 200 and success:true for org-g-67', async () => {
    const app = makeApp(oid('g-67'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[G-68] returns 200 and success:true for org-g-68', async () => {
    const app = makeApp(oid('g-68'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[G-69] returns 200 and success:true for org-g-69', async () => {
    const app = makeApp(oid('g-69'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[G-70] returns 200 and success:true for org-g-70', async () => {
    const app = makeApp(oid('g-70'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[G-71] returns 200 and success:true for org-g-71', async () => {
    const app = makeApp(oid('g-71'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[G-72] returns 200 and success:true for org-g-72', async () => {
    const app = makeApp(oid('g-72'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[G-73] returns 200 and success:true for org-g-73', async () => {
    const app = makeApp(oid('g-73'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[G-74] returns 200 and success:true for org-g-74', async () => {
    const app = makeApp(oid('g-74'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[G-75] returns 200 and success:true for org-g-75', async () => {
    const app = makeApp(oid('g-75'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[G-76] returns 200 and success:true for org-g-76', async () => {
    const app = makeApp(oid('g-76'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[G-77] returns 200 and success:true for org-g-77', async () => {
    const app = makeApp(oid('g-77'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[G-78] returns 200 and success:true for org-g-78', async () => {
    const app = makeApp(oid('g-78'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[G-79] returns 200 and success:true for org-g-79', async () => {
    const app = makeApp(oid('g-79'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

// ─── Suite H: Summary shape ───────────────────────────────────────────────────
describe('GET /api/commissions/summary — shape and values', () => {
  const appH = makeApp(oid('h-shape'));
  it('[H-0] has totalEarned', async () => {
    const res = await request(appH).get('/api/commissions/summary');
    expect(res.body.data).toHaveProperty('totalEarned');
  });
  it('[H-1] has totalPaid', async () => {
    const res = await request(appH).get('/api/commissions/summary');
    expect(res.body.data).toHaveProperty('totalPaid');
  });
  it('[H-2] has totalPending', async () => {
    const res = await request(appH).get('/api/commissions/summary');
    expect(res.body.data).toHaveProperty('totalPending');
  });
  it('[H-3] has totalApproved', async () => {
    const res = await request(appH).get('/api/commissions/summary');
    expect(res.body.data).toHaveProperty('totalApproved');
  });
  it('[H-4] has currency', async () => {
    const res = await request(appH).get('/api/commissions/summary');
    expect(res.body.data).toHaveProperty('currency');
  });
  it('[H-5] has byPeriod', async () => {
    const res = await request(appH).get('/api/commissions/summary');
    expect(res.body.data).toHaveProperty('byPeriod');
  });
  it('[H-6] has ytdEarned', async () => {
    const res = await request(appH).get('/api/commissions/summary');
    expect(res.body.data).toHaveProperty('ytdEarned');
  });
  it('[H-7] has ytdPaid', async () => {
    const res = await request(appH).get('/api/commissions/summary');
    expect(res.body.data).toHaveProperty('ytdPaid');
  });
  it('[H-8] has partnerId', async () => {
    const res = await request(appH).get('/api/commissions/summary');
    expect(res.body.data).toHaveProperty('partnerId');
  });
  it('[H-9] byPeriod is array', async () => {
    const res = await request(appH).get('/api/commissions/summary');
    expect(Array.isArray(res.body.data.byPeriod)).toBe(true);
  });
  it('[H-10] totalEarned is number', async () => {
    const res = await request(appH).get('/api/commissions/summary');
    expect(typeof res.body.data.totalEarned).toBe('number');
  });
  it('[H-11] totalPaid is number', async () => {
    const res = await request(appH).get('/api/commissions/summary');
    expect(typeof res.body.data.totalPaid).toBe('number');
  });
  it('[H-12] totalPending is number', async () => {
    const res = await request(appH).get('/api/commissions/summary');
    expect(typeof res.body.data.totalPending).toBe('number');
  });
  it('[H-13] totalApproved is number', async () => {
    const res = await request(appH).get('/api/commissions/summary');
    expect(typeof res.body.data.totalApproved).toBe('number');
  });
  it('[H-14] ytdEarned is number', async () => {
    const res = await request(appH).get('/api/commissions/summary');
    expect(typeof res.body.data.ytdEarned).toBe('number');
  });
  it('[H-15] ytdPaid is number', async () => {
    const res = await request(appH).get('/api/commissions/summary');
    expect(typeof res.body.data.ytdPaid).toBe('number');
  });
  it('[H-16] currency is GBP', async () => {
    const res = await request(appH).get('/api/commissions/summary');
    expect(res.body.data.currency).toBe('GBP');
  });
  it('[H-17] totalEarned >= totalPaid', async () => {
    const res = await request(appH).get('/api/commissions/summary');
    expect(res.body.data.totalEarned).toBeGreaterThanOrEqual(res.body.data.totalPaid);
  });
  it('[H-18] totalEarned >= totalPending', async () => {
    const res = await request(appH).get('/api/commissions/summary');
    expect(res.body.data.totalEarned).toBeGreaterThanOrEqual(res.body.data.totalPending);
  });
  it('[H-19] totalEarned >= totalApproved', async () => {
    const res = await request(appH).get('/api/commissions/summary');
    expect(res.body.data.totalEarned).toBeGreaterThanOrEqual(res.body.data.totalApproved);
  });
  it('[H-20] totalEarned >= 0', async () => {
    const res = await request(appH).get('/api/commissions/summary');
    expect(res.body.data.totalEarned).toBeGreaterThanOrEqual(0);
  });
  it('[H-21] totalPaid >= 0', async () => {
    const res = await request(appH).get('/api/commissions/summary');
    expect(res.body.data.totalPaid).toBeGreaterThanOrEqual(0);
  });
  it('[H-22] totalPending >= 0', async () => {
    const res = await request(appH).get('/api/commissions/summary');
    expect(res.body.data.totalPending).toBeGreaterThanOrEqual(0);
  });
  it('[H-23] ytdEarned >= 0', async () => {
    const res = await request(appH).get('/api/commissions/summary');
    expect(res.body.data.ytdEarned).toBeGreaterThanOrEqual(0);
  });
  it('[H-24] ytdPaid >= 0', async () => {
    const res = await request(appH).get('/api/commissions/summary');
    expect(res.body.data.ytdPaid).toBeGreaterThanOrEqual(0);
  });
  it('[H-25] ytdEarned >= ytdPaid', async () => {
    const res = await request(appH).get('/api/commissions/summary');
    expect(res.body.data.ytdEarned).toBeGreaterThanOrEqual(res.body.data.ytdPaid);
  });
  it('[H-26] byPeriod entries have period', async () => {
    const res = await request(appH).get('/api/commissions/summary');
    res.body.data.byPeriod.forEach((bp: any) => expect(bp).toHaveProperty('period'));
  });
  it('[H-27] byPeriod entries have earned', async () => {
    const res = await request(appH).get('/api/commissions/summary');
    res.body.data.byPeriod.forEach((bp: any) => expect(bp).toHaveProperty('earned'));
  });
  it('[H-28] byPeriod entries have paid', async () => {
    const res = await request(appH).get('/api/commissions/summary');
    res.body.data.byPeriod.forEach((bp: any) => expect(bp).toHaveProperty('paid'));
  });
  it('[H-29] byPeriod period YYYY-MM', async () => {
    const res = await request(appH).get('/api/commissions/summary');
    res.body.data.byPeriod.forEach((bp: any) => expect(bp.period).toMatch(/^\d{4}-\d{2}$/));
  });
  it('[H-30] byPeriod earned >= paid', async () => {
    const res = await request(appH).get('/api/commissions/summary');
    res.body.data.byPeriod.forEach((bp: any) => expect(bp.earned).toBeGreaterThanOrEqual(bp.paid));
  });
  it('[H-31] byPeriod sorted ascending', async () => {
    const res = await request(appH).get('/api/commissions/summary');
    const ps = res.body.data.byPeriod.map((bp: any) => bp.period); expect(ps).toEqual([...ps].sort());
  });
  it('[H-32] seeded: totalEarned = 12600', async () => {
    const app2 = makeApp(oid('h-32'));
    const res = await request(app2).get('/api/commissions/summary');
    expect(res.body.data.totalEarned).toBe(12600);
  });
  it('[H-33] seeded: totalPaid = 5400', async () => {
    const app2 = makeApp(oid('h-33'));
    const res = await request(app2).get('/api/commissions/summary');
    expect(res.body.data.totalPaid).toBe(5400);
  });
  it('[H-34] seeded: totalApproved = 1200', async () => {
    const app2 = makeApp(oid('h-34'));
    const res = await request(app2).get('/api/commissions/summary');
    expect(res.body.data.totalApproved).toBe(1200);
  });
  it('[H-35] seeded: totalPending = 6000', async () => {
    const app2 = makeApp(oid('h-35'));
    const res = await request(app2).get('/api/commissions/summary');
    expect(res.body.data.totalPending).toBe(6000);
  });
  it('[H-36] seeded: byPeriod has 5 entries', async () => {
    const app2 = makeApp(oid('h-36'));
    const res = await request(app2).get('/api/commissions/summary');
    expect(res.body.data.byPeriod).toHaveLength(5);
  });
  it('[H-37] seeded: byPeriod[0] is 2025-10', async () => {
    const app2 = makeApp(oid('h-37'));
    const res = await request(app2).get('/api/commissions/summary');
    expect(res.body.data.byPeriod[0].period).toBe('2025-10');
  });
  it('[H-38] seeded: byPeriod last is 2026-02', async () => {
    const app2 = makeApp(oid('h-38'));
    const res = await request(app2).get('/api/commissions/summary');
    const bp = res.body.data.byPeriod; expect(bp[bp.length-1].period).toBe('2026-02');
  });
  it('[H-39] seeded: byPeriod 2025-10 earned=3600', async () => {
    const app2 = makeApp(oid('h-39'));
    const res = await request(app2).get('/api/commissions/summary');
    const e = res.body.data.byPeriod.find((bp: any) => bp.period === '2025-10'); expect(e.earned).toBe(3600);
  });
  it('[H-40] seeded: byPeriod 2025-10 paid=3600', async () => {
    const app2 = makeApp(oid('h-40'));
    const res = await request(app2).get('/api/commissions/summary');
    const e = res.body.data.byPeriod.find((bp: any) => bp.period === '2025-10'); expect(e.paid).toBe(3600);
  });
  it('[H-41] seeded: byPeriod 2025-11 earned=1800', async () => {
    const app2 = makeApp(oid('h-41'));
    const res = await request(app2).get('/api/commissions/summary');
    const e = res.body.data.byPeriod.find((bp: any) => bp.period === '2025-11'); expect(e.earned).toBe(1800);
  });
  it('[H-42] seeded: byPeriod 2025-11 paid=1800', async () => {
    const app2 = makeApp(oid('h-42'));
    const res = await request(app2).get('/api/commissions/summary');
    const e = res.body.data.byPeriod.find((bp: any) => bp.period === '2025-11'); expect(e.paid).toBe(1800);
  });
  it('[H-43] seeded: byPeriod 2025-12 earned=1200', async () => {
    const app2 = makeApp(oid('h-43'));
    const res = await request(app2).get('/api/commissions/summary');
    const e = res.body.data.byPeriod.find((bp: any) => bp.period === '2025-12'); expect(e.earned).toBe(1200);
  });
  it('[H-44] seeded: byPeriod 2025-12 paid=0', async () => {
    const app2 = makeApp(oid('h-44'));
    const res = await request(app2).get('/api/commissions/summary');
    const e = res.body.data.byPeriod.find((bp: any) => bp.period === '2025-12'); expect(e.paid).toBe(0);
  });
  it('[H-45] seeded: byPeriod 2026-01 earned=5400', async () => {
    const app2 = makeApp(oid('h-45'));
    const res = await request(app2).get('/api/commissions/summary');
    const e = res.body.data.byPeriod.find((bp: any) => bp.period === '2026-01'); expect(e.earned).toBe(5400);
  });
  it('[H-46] seeded: byPeriod 2026-01 paid=0', async () => {
    const app2 = makeApp(oid('h-46'));
    const res = await request(app2).get('/api/commissions/summary');
    const e = res.body.data.byPeriod.find((bp: any) => bp.period === '2026-01'); expect(e.paid).toBe(0);
  });
  it('[H-47] seeded: byPeriod 2026-02 earned=600', async () => {
    const app2 = makeApp(oid('h-47'));
    const res = await request(app2).get('/api/commissions/summary');
    const e = res.body.data.byPeriod.find((bp: any) => bp.period === '2026-02'); expect(e.earned).toBe(600);
  });
});

// ─── Suite I: Summary always has data ────────────────────────────────────────
describe('GET /api/commissions/summary — always has data property', () => {
  it('[I-0] summary always has data for org-i-0', async () => {
    const app = makeApp(oid('i-0'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.body).toHaveProperty('data');
  });
  it('[I-1] summary always has data for org-i-1', async () => {
    const app = makeApp(oid('i-1'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.body).toHaveProperty('data');
  });
  it('[I-2] summary always has data for org-i-2', async () => {
    const app = makeApp(oid('i-2'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.body).toHaveProperty('data');
  });
  it('[I-3] summary always has data for org-i-3', async () => {
    const app = makeApp(oid('i-3'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.body).toHaveProperty('data');
  });
  it('[I-4] summary always has data for org-i-4', async () => {
    const app = makeApp(oid('i-4'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.body).toHaveProperty('data');
  });
  it('[I-5] summary always has data for org-i-5', async () => {
    const app = makeApp(oid('i-5'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.body).toHaveProperty('data');
  });
  it('[I-6] summary always has data for org-i-6', async () => {
    const app = makeApp(oid('i-6'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.body).toHaveProperty('data');
  });
  it('[I-7] summary always has data for org-i-7', async () => {
    const app = makeApp(oid('i-7'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.body).toHaveProperty('data');
  });
  it('[I-8] summary always has data for org-i-8', async () => {
    const app = makeApp(oid('i-8'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.body).toHaveProperty('data');
  });
  it('[I-9] summary always has data for org-i-9', async () => {
    const app = makeApp(oid('i-9'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.body).toHaveProperty('data');
  });
  it('[I-10] summary always has data for org-i-10', async () => {
    const app = makeApp(oid('i-10'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.body).toHaveProperty('data');
  });
  it('[I-11] summary always has data for org-i-11', async () => {
    const app = makeApp(oid('i-11'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.body).toHaveProperty('data');
  });
  it('[I-12] summary always has data for org-i-12', async () => {
    const app = makeApp(oid('i-12'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.body).toHaveProperty('data');
  });
  it('[I-13] summary always has data for org-i-13', async () => {
    const app = makeApp(oid('i-13'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.body).toHaveProperty('data');
  });
  it('[I-14] summary always has data for org-i-14', async () => {
    const app = makeApp(oid('i-14'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.body).toHaveProperty('data');
  });
  it('[I-15] summary always has data for org-i-15', async () => {
    const app = makeApp(oid('i-15'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.body).toHaveProperty('data');
  });
  it('[I-16] summary always has data for org-i-16', async () => {
    const app = makeApp(oid('i-16'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.body).toHaveProperty('data');
  });
  it('[I-17] summary always has data for org-i-17', async () => {
    const app = makeApp(oid('i-17'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.body).toHaveProperty('data');
  });
  it('[I-18] summary always has data for org-i-18', async () => {
    const app = makeApp(oid('i-18'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.body).toHaveProperty('data');
  });
  it('[I-19] summary always has data for org-i-19', async () => {
    const app = makeApp(oid('i-19'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.body).toHaveProperty('data');
  });
});

// ─── Suite J: GET /:id found ──────────────────────────────────────────────────
describe('GET /api/commissions/:id — found', () => {
  it('[J-0] fetching known record by id returns 200', async () => {
    const app = makeApp(oid('j-0'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0]?.id;
    expect(id).toBeTruthy();
    const res = await request(app).get('/api/commissions/' + id);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[J-1] fetching known record by id returns 200', async () => {
    const app = makeApp(oid('j-1'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0]?.id;
    expect(id).toBeTruthy();
    const res = await request(app).get('/api/commissions/' + id);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[J-2] fetching known record by id returns 200', async () => {
    const app = makeApp(oid('j-2'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0]?.id;
    expect(id).toBeTruthy();
    const res = await request(app).get('/api/commissions/' + id);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[J-3] fetching known record by id returns 200', async () => {
    const app = makeApp(oid('j-3'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0]?.id;
    expect(id).toBeTruthy();
    const res = await request(app).get('/api/commissions/' + id);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[J-4] fetching known record by id returns 200', async () => {
    const app = makeApp(oid('j-4'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0]?.id;
    expect(id).toBeTruthy();
    const res = await request(app).get('/api/commissions/' + id);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[J-5] fetching known record by id returns 200', async () => {
    const app = makeApp(oid('j-5'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0]?.id;
    expect(id).toBeTruthy();
    const res = await request(app).get('/api/commissions/' + id);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[J-6] fetching known record by id returns 200', async () => {
    const app = makeApp(oid('j-6'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0]?.id;
    expect(id).toBeTruthy();
    const res = await request(app).get('/api/commissions/' + id);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[J-7] fetching known record by id returns 200', async () => {
    const app = makeApp(oid('j-7'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0]?.id;
    expect(id).toBeTruthy();
    const res = await request(app).get('/api/commissions/' + id);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[J-8] fetching known record by id returns 200', async () => {
    const app = makeApp(oid('j-8'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0]?.id;
    expect(id).toBeTruthy();
    const res = await request(app).get('/api/commissions/' + id);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[J-9] fetching known record by id returns 200', async () => {
    const app = makeApp(oid('j-9'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0]?.id;
    expect(id).toBeTruthy();
    const res = await request(app).get('/api/commissions/' + id);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[J-10] fetching known record by id returns 200', async () => {
    const app = makeApp(oid('j-10'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0]?.id;
    expect(id).toBeTruthy();
    const res = await request(app).get('/api/commissions/' + id);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[J-11] fetching known record by id returns 200', async () => {
    const app = makeApp(oid('j-11'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0]?.id;
    expect(id).toBeTruthy();
    const res = await request(app).get('/api/commissions/' + id);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[J-12] fetching known record by id returns 200', async () => {
    const app = makeApp(oid('j-12'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0]?.id;
    expect(id).toBeTruthy();
    const res = await request(app).get('/api/commissions/' + id);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[J-13] fetching known record by id returns 200', async () => {
    const app = makeApp(oid('j-13'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0]?.id;
    expect(id).toBeTruthy();
    const res = await request(app).get('/api/commissions/' + id);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[J-14] fetching known record by id returns 200', async () => {
    const app = makeApp(oid('j-14'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0]?.id;
    expect(id).toBeTruthy();
    const res = await request(app).get('/api/commissions/' + id);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[J-15] fetching known record by id returns 200', async () => {
    const app = makeApp(oid('j-15'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0]?.id;
    expect(id).toBeTruthy();
    const res = await request(app).get('/api/commissions/' + id);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[J-16] fetching known record by id returns 200', async () => {
    const app = makeApp(oid('j-16'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0]?.id;
    expect(id).toBeTruthy();
    const res = await request(app).get('/api/commissions/' + id);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[J-17] fetching known record by id returns 200', async () => {
    const app = makeApp(oid('j-17'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0]?.id;
    expect(id).toBeTruthy();
    const res = await request(app).get('/api/commissions/' + id);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[J-18] fetching known record by id returns 200', async () => {
    const app = makeApp(oid('j-18'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0]?.id;
    expect(id).toBeTruthy();
    const res = await request(app).get('/api/commissions/' + id);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[J-19] fetching known record by id returns 200', async () => {
    const app = makeApp(oid('j-19'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0]?.id;
    expect(id).toBeTruthy();
    const res = await request(app).get('/api/commissions/' + id);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[J-20] fetching known record by id returns 200', async () => {
    const app = makeApp(oid('j-20'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0]?.id;
    expect(id).toBeTruthy();
    const res = await request(app).get('/api/commissions/' + id);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[J-21] fetching known record by id returns 200', async () => {
    const app = makeApp(oid('j-21'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0]?.id;
    expect(id).toBeTruthy();
    const res = await request(app).get('/api/commissions/' + id);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[J-22] fetching known record by id returns 200', async () => {
    const app = makeApp(oid('j-22'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0]?.id;
    expect(id).toBeTruthy();
    const res = await request(app).get('/api/commissions/' + id);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[J-23] fetching known record by id returns 200', async () => {
    const app = makeApp(oid('j-23'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0]?.id;
    expect(id).toBeTruthy();
    const res = await request(app).get('/api/commissions/' + id);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[J-24] fetching known record by id returns 200', async () => {
    const app = makeApp(oid('j-24'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0]?.id;
    expect(id).toBeTruthy();
    const res = await request(app).get('/api/commissions/' + id);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[J-25] fetching known record by id returns 200', async () => {
    const app = makeApp(oid('j-25'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0]?.id;
    expect(id).toBeTruthy();
    const res = await request(app).get('/api/commissions/' + id);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[J-26] fetching known record by id returns 200', async () => {
    const app = makeApp(oid('j-26'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0]?.id;
    expect(id).toBeTruthy();
    const res = await request(app).get('/api/commissions/' + id);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[J-27] fetching known record by id returns 200', async () => {
    const app = makeApp(oid('j-27'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0]?.id;
    expect(id).toBeTruthy();
    const res = await request(app).get('/api/commissions/' + id);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[J-28] fetching known record by id returns 200', async () => {
    const app = makeApp(oid('j-28'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0]?.id;
    expect(id).toBeTruthy();
    const res = await request(app).get('/api/commissions/' + id);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[J-29] fetching known record by id returns 200', async () => {
    const app = makeApp(oid('j-29'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0]?.id;
    expect(id).toBeTruthy();
    const res = await request(app).get('/api/commissions/' + id);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[J-30] fetching known record by id returns 200', async () => {
    const app = makeApp(oid('j-30'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0]?.id;
    expect(id).toBeTruthy();
    const res = await request(app).get('/api/commissions/' + id);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[J-31] fetching known record by id returns 200', async () => {
    const app = makeApp(oid('j-31'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0]?.id;
    expect(id).toBeTruthy();
    const res = await request(app).get('/api/commissions/' + id);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[J-32] fetching known record by id returns 200', async () => {
    const app = makeApp(oid('j-32'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0]?.id;
    expect(id).toBeTruthy();
    const res = await request(app).get('/api/commissions/' + id);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[J-33] fetching known record by id returns 200', async () => {
    const app = makeApp(oid('j-33'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0]?.id;
    expect(id).toBeTruthy();
    const res = await request(app).get('/api/commissions/' + id);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[J-34] fetching known record by id returns 200', async () => {
    const app = makeApp(oid('j-34'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0]?.id;
    expect(id).toBeTruthy();
    const res = await request(app).get('/api/commissions/' + id);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[J-35] fetching known record by id returns 200', async () => {
    const app = makeApp(oid('j-35'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0]?.id;
    expect(id).toBeTruthy();
    const res = await request(app).get('/api/commissions/' + id);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[J-36] fetching known record by id returns 200', async () => {
    const app = makeApp(oid('j-36'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0]?.id;
    expect(id).toBeTruthy();
    const res = await request(app).get('/api/commissions/' + id);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[J-37] fetching known record by id returns 200', async () => {
    const app = makeApp(oid('j-37'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0]?.id;
    expect(id).toBeTruthy();
    const res = await request(app).get('/api/commissions/' + id);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[J-38] fetching known record by id returns 200', async () => {
    const app = makeApp(oid('j-38'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0]?.id;
    expect(id).toBeTruthy();
    const res = await request(app).get('/api/commissions/' + id);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[J-39] fetching known record by id returns 200', async () => {
    const app = makeApp(oid('j-39'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0]?.id;
    expect(id).toBeTruthy();
    const res = await request(app).get('/api/commissions/' + id);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[J-40] fetching known record by id returns 200', async () => {
    const app = makeApp(oid('j-40'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0]?.id;
    expect(id).toBeTruthy();
    const res = await request(app).get('/api/commissions/' + id);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[J-41] fetching known record by id returns 200', async () => {
    const app = makeApp(oid('j-41'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0]?.id;
    expect(id).toBeTruthy();
    const res = await request(app).get('/api/commissions/' + id);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[J-42] fetching known record by id returns 200', async () => {
    const app = makeApp(oid('j-42'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0]?.id;
    expect(id).toBeTruthy();
    const res = await request(app).get('/api/commissions/' + id);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[J-43] fetching known record by id returns 200', async () => {
    const app = makeApp(oid('j-43'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0]?.id;
    expect(id).toBeTruthy();
    const res = await request(app).get('/api/commissions/' + id);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[J-44] fetching known record by id returns 200', async () => {
    const app = makeApp(oid('j-44'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0]?.id;
    expect(id).toBeTruthy();
    const res = await request(app).get('/api/commissions/' + id);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[J-45] fetching known record by id returns 200', async () => {
    const app = makeApp(oid('j-45'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0]?.id;
    expect(id).toBeTruthy();
    const res = await request(app).get('/api/commissions/' + id);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[J-46] fetching known record by id returns 200', async () => {
    const app = makeApp(oid('j-46'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0]?.id;
    expect(id).toBeTruthy();
    const res = await request(app).get('/api/commissions/' + id);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[J-47] fetching known record by id returns 200', async () => {
    const app = makeApp(oid('j-47'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0]?.id;
    expect(id).toBeTruthy();
    const res = await request(app).get('/api/commissions/' + id);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[J-48] fetching known record by id returns 200', async () => {
    const app = makeApp(oid('j-48'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0]?.id;
    expect(id).toBeTruthy();
    const res = await request(app).get('/api/commissions/' + id);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[J-49] fetching known record by id returns 200', async () => {
    const app = makeApp(oid('j-49'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0]?.id;
    expect(id).toBeTruthy();
    const res = await request(app).get('/api/commissions/' + id);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[J-50] fetching known record by id returns 200', async () => {
    const app = makeApp(oid('j-50'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0]?.id;
    expect(id).toBeTruthy();
    const res = await request(app).get('/api/commissions/' + id);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[J-51] fetching known record by id returns 200', async () => {
    const app = makeApp(oid('j-51'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0]?.id;
    expect(id).toBeTruthy();
    const res = await request(app).get('/api/commissions/' + id);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[J-52] fetching known record by id returns 200', async () => {
    const app = makeApp(oid('j-52'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0]?.id;
    expect(id).toBeTruthy();
    const res = await request(app).get('/api/commissions/' + id);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[J-53] fetching known record by id returns 200', async () => {
    const app = makeApp(oid('j-53'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0]?.id;
    expect(id).toBeTruthy();
    const res = await request(app).get('/api/commissions/' + id);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[J-54] fetching known record by id returns 200', async () => {
    const app = makeApp(oid('j-54'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0]?.id;
    expect(id).toBeTruthy();
    const res = await request(app).get('/api/commissions/' + id);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[J-55] fetching known record by id returns 200', async () => {
    const app = makeApp(oid('j-55'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0]?.id;
    expect(id).toBeTruthy();
    const res = await request(app).get('/api/commissions/' + id);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[J-56] fetching known record by id returns 200', async () => {
    const app = makeApp(oid('j-56'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0]?.id;
    expect(id).toBeTruthy();
    const res = await request(app).get('/api/commissions/' + id);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[J-57] fetching known record by id returns 200', async () => {
    const app = makeApp(oid('j-57'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0]?.id;
    expect(id).toBeTruthy();
    const res = await request(app).get('/api/commissions/' + id);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[J-58] fetching known record by id returns 200', async () => {
    const app = makeApp(oid('j-58'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0]?.id;
    expect(id).toBeTruthy();
    const res = await request(app).get('/api/commissions/' + id);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[J-59] fetching known record by id returns 200', async () => {
    const app = makeApp(oid('j-59'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0]?.id;
    expect(id).toBeTruthy();
    const res = await request(app).get('/api/commissions/' + id);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

// ─── Suite K: GET /:id shape ──────────────────────────────────────────────────
describe('GET /api/commissions/:id — response shape', () => {
  const appK = makeApp(oid('k-shape'));
  let recordIdK = '';

  beforeAll(async () => {
    const list = await request(appK).get('/api/commissions');
    recordIdK = list.body.data[0].id;
  });
  it('[K-0] returns success:true', async () => {
    const res = await request(appK).get('/api/commissions/' + recordIdK);
    expect(res.body.success).toBe(true);
  });
  it('[K-1] data.id matches requested id', async () => {
    const res = await request(appK).get('/api/commissions/' + recordIdK);
    expect(res.body.data.id).toBe(recordIdK);
  });
  it('[K-2] data has referenceNumber', async () => {
    const res = await request(appK).get('/api/commissions/' + recordIdK);
    expect(res.body.data).toHaveProperty('referenceNumber');
  });
  it('[K-3] data has type', async () => {
    const res = await request(appK).get('/api/commissions/' + recordIdK);
    expect(res.body.data).toHaveProperty('type');
  });
  it('[K-4] data has customerName', async () => {
    const res = await request(appK).get('/api/commissions/' + recordIdK);
    expect(res.body.data).toHaveProperty('customerName');
  });
  it('[K-5] data has baseAmount', async () => {
    const res = await request(appK).get('/api/commissions/' + recordIdK);
    expect(res.body.data).toHaveProperty('baseAmount');
  });
  it('[K-6] data has commissionRate', async () => {
    const res = await request(appK).get('/api/commissions/' + recordIdK);
    expect(res.body.data).toHaveProperty('commissionRate');
  });
  it('[K-7] data has commissionAmount', async () => {
    const res = await request(appK).get('/api/commissions/' + recordIdK);
    expect(res.body.data).toHaveProperty('commissionAmount');
  });
  it('[K-8] data has currency', async () => {
    const res = await request(appK).get('/api/commissions/' + recordIdK);
    expect(res.body.data).toHaveProperty('currency');
  });
  it('[K-9] data has status', async () => {
    const res = await request(appK).get('/api/commissions/' + recordIdK);
    expect(res.body.data).toHaveProperty('status');
  });
  it('[K-10] data has periodMonth', async () => {
    const res = await request(appK).get('/api/commissions/' + recordIdK);
    expect(res.body.data).toHaveProperty('periodMonth');
  });
  it('[K-11] data has earnedAt', async () => {
    const res = await request(appK).get('/api/commissions/' + recordIdK);
    expect(res.body.data).toHaveProperty('earnedAt');
  });
  it('[K-12] data has partnerId', async () => {
    const res = await request(appK).get('/api/commissions/' + recordIdK);
    expect(res.body.data).toHaveProperty('partnerId');
  });
  it('[K-13] data partnerId matches org', async () => {
    const res = await request(appK).get('/api/commissions/' + recordIdK);
    expect(res.body.data.partnerId).toBe(oid('k-shape'));
  });
  it('[K-14] data baseAmount > 0', async () => {
    const res = await request(appK).get('/api/commissions/' + recordIdK);
    expect(res.body.data.baseAmount).toBeGreaterThan(0);
  });
  it('[K-15] data commissionAmount > 0', async () => {
    const res = await request(appK).get('/api/commissions/' + recordIdK);
    expect(res.body.data.commissionAmount).toBeGreaterThan(0);
  });
  it('[K-16] data currency is GBP', async () => {
    const res = await request(appK).get('/api/commissions/' + recordIdK);
    expect(res.body.data.currency).toBe('GBP');
  });
  it('[K-17] data status is valid enum', async () => {
    const res = await request(appK).get('/api/commissions/' + recordIdK);
    expect(STATUSES as readonly string[]).toContain(res.body.data.status);
  });
  it('[K-18] data type is valid enum', async () => {
    const res = await request(appK).get('/api/commissions/' + recordIdK);
    expect(TYPES as readonly string[]).toContain(res.body.data.type);
  });
  it('[K-19] data periodMonth YYYY-MM', async () => {
    const res = await request(appK).get('/api/commissions/' + recordIdK);
    expect(res.body.data.periodMonth).toMatch(/^\d{4}-\d{2}$/);
  });
});

// ─── Suite L: GET /:id 404 ───────────────────────────────────────────────────
describe('GET /api/commissions/:id — 404 for unknown', () => {
  it('[L-0] unknown id returns 404', async () => {
    const app = makeApp(oid('l-0'));
    const res = await request(app).get('/api/commissions/nonexistent-id-0');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[L-1] unknown id returns 404', async () => {
    const app = makeApp(oid('l-1'));
    const res = await request(app).get('/api/commissions/nonexistent-id-1');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[L-2] unknown id returns 404', async () => {
    const app = makeApp(oid('l-2'));
    const res = await request(app).get('/api/commissions/nonexistent-id-2');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[L-3] unknown id returns 404', async () => {
    const app = makeApp(oid('l-3'));
    const res = await request(app).get('/api/commissions/nonexistent-id-3');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[L-4] unknown id returns 404', async () => {
    const app = makeApp(oid('l-4'));
    const res = await request(app).get('/api/commissions/nonexistent-id-4');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[L-5] unknown id returns 404', async () => {
    const app = makeApp(oid('l-5'));
    const res = await request(app).get('/api/commissions/nonexistent-id-5');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[L-6] unknown id returns 404', async () => {
    const app = makeApp(oid('l-6'));
    const res = await request(app).get('/api/commissions/nonexistent-id-6');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[L-7] unknown id returns 404', async () => {
    const app = makeApp(oid('l-7'));
    const res = await request(app).get('/api/commissions/nonexistent-id-7');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[L-8] unknown id returns 404', async () => {
    const app = makeApp(oid('l-8'));
    const res = await request(app).get('/api/commissions/nonexistent-id-8');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[L-9] unknown id returns 404', async () => {
    const app = makeApp(oid('l-9'));
    const res = await request(app).get('/api/commissions/nonexistent-id-9');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[L-10] unknown id returns 404', async () => {
    const app = makeApp(oid('l-10'));
    const res = await request(app).get('/api/commissions/nonexistent-id-10');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[L-11] unknown id returns 404', async () => {
    const app = makeApp(oid('l-11'));
    const res = await request(app).get('/api/commissions/nonexistent-id-11');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[L-12] unknown id returns 404', async () => {
    const app = makeApp(oid('l-12'));
    const res = await request(app).get('/api/commissions/nonexistent-id-12');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[L-13] unknown id returns 404', async () => {
    const app = makeApp(oid('l-13'));
    const res = await request(app).get('/api/commissions/nonexistent-id-13');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[L-14] unknown id returns 404', async () => {
    const app = makeApp(oid('l-14'));
    const res = await request(app).get('/api/commissions/nonexistent-id-14');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[L-15] unknown id returns 404', async () => {
    const app = makeApp(oid('l-15'));
    const res = await request(app).get('/api/commissions/nonexistent-id-15');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[L-16] unknown id returns 404', async () => {
    const app = makeApp(oid('l-16'));
    const res = await request(app).get('/api/commissions/nonexistent-id-16');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[L-17] unknown id returns 404', async () => {
    const app = makeApp(oid('l-17'));
    const res = await request(app).get('/api/commissions/nonexistent-id-17');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[L-18] unknown id returns 404', async () => {
    const app = makeApp(oid('l-18'));
    const res = await request(app).get('/api/commissions/nonexistent-id-18');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[L-19] unknown id returns 404', async () => {
    const app = makeApp(oid('l-19'));
    const res = await request(app).get('/api/commissions/nonexistent-id-19');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[L-20] unknown id returns 404', async () => {
    const app = makeApp(oid('l-20'));
    const res = await request(app).get('/api/commissions/nonexistent-id-20');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[L-21] unknown id returns 404', async () => {
    const app = makeApp(oid('l-21'));
    const res = await request(app).get('/api/commissions/nonexistent-id-21');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[L-22] unknown id returns 404', async () => {
    const app = makeApp(oid('l-22'));
    const res = await request(app).get('/api/commissions/nonexistent-id-22');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[L-23] unknown id returns 404', async () => {
    const app = makeApp(oid('l-23'));
    const res = await request(app).get('/api/commissions/nonexistent-id-23');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[L-24] unknown id returns 404', async () => {
    const app = makeApp(oid('l-24'));
    const res = await request(app).get('/api/commissions/nonexistent-id-24');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[L-25] unknown id returns 404', async () => {
    const app = makeApp(oid('l-25'));
    const res = await request(app).get('/api/commissions/nonexistent-id-25');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[L-26] unknown id returns 404', async () => {
    const app = makeApp(oid('l-26'));
    const res = await request(app).get('/api/commissions/nonexistent-id-26');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[L-27] unknown id returns 404', async () => {
    const app = makeApp(oid('l-27'));
    const res = await request(app).get('/api/commissions/nonexistent-id-27');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[L-28] unknown id returns 404', async () => {
    const app = makeApp(oid('l-28'));
    const res = await request(app).get('/api/commissions/nonexistent-id-28');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[L-29] unknown id returns 404', async () => {
    const app = makeApp(oid('l-29'));
    const res = await request(app).get('/api/commissions/nonexistent-id-29');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[L-30] unknown id returns 404', async () => {
    const app = makeApp(oid('l-30'));
    const res = await request(app).get('/api/commissions/nonexistent-id-30');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[L-31] unknown id returns 404', async () => {
    const app = makeApp(oid('l-31'));
    const res = await request(app).get('/api/commissions/nonexistent-id-31');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[L-32] unknown id returns 404', async () => {
    const app = makeApp(oid('l-32'));
    const res = await request(app).get('/api/commissions/nonexistent-id-32');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[L-33] unknown id returns 404', async () => {
    const app = makeApp(oid('l-33'));
    const res = await request(app).get('/api/commissions/nonexistent-id-33');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[L-34] unknown id returns 404', async () => {
    const app = makeApp(oid('l-34'));
    const res = await request(app).get('/api/commissions/nonexistent-id-34');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[L-35] unknown id returns 404', async () => {
    const app = makeApp(oid('l-35'));
    const res = await request(app).get('/api/commissions/nonexistent-id-35');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[L-36] unknown id returns 404', async () => {
    const app = makeApp(oid('l-36'));
    const res = await request(app).get('/api/commissions/nonexistent-id-36');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[L-37] unknown id returns 404', async () => {
    const app = makeApp(oid('l-37'));
    const res = await request(app).get('/api/commissions/nonexistent-id-37');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[L-38] unknown id returns 404', async () => {
    const app = makeApp(oid('l-38'));
    const res = await request(app).get('/api/commissions/nonexistent-id-38');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[L-39] unknown id returns 404', async () => {
    const app = makeApp(oid('l-39'));
    const res = await request(app).get('/api/commissions/nonexistent-id-39');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[L-40] unknown id returns 404', async () => {
    const app = makeApp(oid('l-40'));
    const res = await request(app).get('/api/commissions/nonexistent-id-40');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[L-41] unknown id returns 404', async () => {
    const app = makeApp(oid('l-41'));
    const res = await request(app).get('/api/commissions/nonexistent-id-41');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[L-42] unknown id returns 404', async () => {
    const app = makeApp(oid('l-42'));
    const res = await request(app).get('/api/commissions/nonexistent-id-42');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[L-43] unknown id returns 404', async () => {
    const app = makeApp(oid('l-43'));
    const res = await request(app).get('/api/commissions/nonexistent-id-43');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[L-44] unknown id returns 404', async () => {
    const app = makeApp(oid('l-44'));
    const res = await request(app).get('/api/commissions/nonexistent-id-44');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[L-45] unknown id returns 404', async () => {
    const app = makeApp(oid('l-45'));
    const res = await request(app).get('/api/commissions/nonexistent-id-45');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[L-46] unknown id returns 404', async () => {
    const app = makeApp(oid('l-46'));
    const res = await request(app).get('/api/commissions/nonexistent-id-46');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[L-47] unknown id returns 404', async () => {
    const app = makeApp(oid('l-47'));
    const res = await request(app).get('/api/commissions/nonexistent-id-47');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[L-48] unknown id returns 404', async () => {
    const app = makeApp(oid('l-48'));
    const res = await request(app).get('/api/commissions/nonexistent-id-48');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[L-49] unknown id returns 404', async () => {
    const app = makeApp(oid('l-49'));
    const res = await request(app).get('/api/commissions/nonexistent-id-49');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[L-50] unknown id returns 404', async () => {
    const app = makeApp(oid('l-50'));
    const res = await request(app).get('/api/commissions/nonexistent-id-50');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[L-51] unknown id returns 404', async () => {
    const app = makeApp(oid('l-51'));
    const res = await request(app).get('/api/commissions/nonexistent-id-51');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[L-52] unknown id returns 404', async () => {
    const app = makeApp(oid('l-52'));
    const res = await request(app).get('/api/commissions/nonexistent-id-52');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[L-53] unknown id returns 404', async () => {
    const app = makeApp(oid('l-53'));
    const res = await request(app).get('/api/commissions/nonexistent-id-53');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[L-54] unknown id returns 404', async () => {
    const app = makeApp(oid('l-54'));
    const res = await request(app).get('/api/commissions/nonexistent-id-54');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[L-55] unknown id returns 404', async () => {
    const app = makeApp(oid('l-55'));
    const res = await request(app).get('/api/commissions/nonexistent-id-55');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[L-56] unknown id returns 404', async () => {
    const app = makeApp(oid('l-56'));
    const res = await request(app).get('/api/commissions/nonexistent-id-56');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[L-57] unknown id returns 404', async () => {
    const app = makeApp(oid('l-57'));
    const res = await request(app).get('/api/commissions/nonexistent-id-57');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[L-58] unknown id returns 404', async () => {
    const app = makeApp(oid('l-58'));
    const res = await request(app).get('/api/commissions/nonexistent-id-58');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[L-59] unknown id returns 404', async () => {
    const app = makeApp(oid('l-59'));
    const res = await request(app).get('/api/commissions/nonexistent-id-59');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[L-60] error code is NOT_FOUND', async () => {
    const app = makeApp(oid('l-60'));
    const res = await request(app).get('/api/commissions/no-such-id-l60');
    expect(res.body.error?.code).toBe('NOT_FOUND');
  });
  it('[L-61] error has message field', async () => {
    const app = makeApp(oid('l-61'));
    const res = await request(app).get('/api/commissions/no-such-id-l61');
    expect(res.body.error).toHaveProperty('message');
  });
});

// ─── Suite M: GET /:id 403 cross-org ─────────────────────────────────────────
describe('GET /api/commissions/:id — 403 for cross-org', () => {
  it('[M-0] org-m-a-0 cannot read org-m-b-0 records', async () => {
    const appA = makeApp(oid('m-a-0'));
    const appB = makeApp(oid('m-b-0'));
    const listB = await request(appB).get('/api/commissions');
    const id = listB.body.data[0]?.id;
    const res = await request(appA).get('/api/commissions/' + id);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[M-1] org-m-a-1 cannot read org-m-b-1 records', async () => {
    const appA = makeApp(oid('m-a-1'));
    const appB = makeApp(oid('m-b-1'));
    const listB = await request(appB).get('/api/commissions');
    const id = listB.body.data[0]?.id;
    const res = await request(appA).get('/api/commissions/' + id);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[M-2] org-m-a-2 cannot read org-m-b-2 records', async () => {
    const appA = makeApp(oid('m-a-2'));
    const appB = makeApp(oid('m-b-2'));
    const listB = await request(appB).get('/api/commissions');
    const id = listB.body.data[0]?.id;
    const res = await request(appA).get('/api/commissions/' + id);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[M-3] org-m-a-3 cannot read org-m-b-3 records', async () => {
    const appA = makeApp(oid('m-a-3'));
    const appB = makeApp(oid('m-b-3'));
    const listB = await request(appB).get('/api/commissions');
    const id = listB.body.data[0]?.id;
    const res = await request(appA).get('/api/commissions/' + id);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[M-4] org-m-a-4 cannot read org-m-b-4 records', async () => {
    const appA = makeApp(oid('m-a-4'));
    const appB = makeApp(oid('m-b-4'));
    const listB = await request(appB).get('/api/commissions');
    const id = listB.body.data[0]?.id;
    const res = await request(appA).get('/api/commissions/' + id);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[M-5] org-m-a-5 cannot read org-m-b-5 records', async () => {
    const appA = makeApp(oid('m-a-5'));
    const appB = makeApp(oid('m-b-5'));
    const listB = await request(appB).get('/api/commissions');
    const id = listB.body.data[0]?.id;
    const res = await request(appA).get('/api/commissions/' + id);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[M-6] org-m-a-6 cannot read org-m-b-6 records', async () => {
    const appA = makeApp(oid('m-a-6'));
    const appB = makeApp(oid('m-b-6'));
    const listB = await request(appB).get('/api/commissions');
    const id = listB.body.data[0]?.id;
    const res = await request(appA).get('/api/commissions/' + id);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[M-7] org-m-a-7 cannot read org-m-b-7 records', async () => {
    const appA = makeApp(oid('m-a-7'));
    const appB = makeApp(oid('m-b-7'));
    const listB = await request(appB).get('/api/commissions');
    const id = listB.body.data[0]?.id;
    const res = await request(appA).get('/api/commissions/' + id);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[M-8] org-m-a-8 cannot read org-m-b-8 records', async () => {
    const appA = makeApp(oid('m-a-8'));
    const appB = makeApp(oid('m-b-8'));
    const listB = await request(appB).get('/api/commissions');
    const id = listB.body.data[0]?.id;
    const res = await request(appA).get('/api/commissions/' + id);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[M-9] org-m-a-9 cannot read org-m-b-9 records', async () => {
    const appA = makeApp(oid('m-a-9'));
    const appB = makeApp(oid('m-b-9'));
    const listB = await request(appB).get('/api/commissions');
    const id = listB.body.data[0]?.id;
    const res = await request(appA).get('/api/commissions/' + id);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[M-10] org-m-a-10 cannot read org-m-b-10 records', async () => {
    const appA = makeApp(oid('m-a-10'));
    const appB = makeApp(oid('m-b-10'));
    const listB = await request(appB).get('/api/commissions');
    const id = listB.body.data[0]?.id;
    const res = await request(appA).get('/api/commissions/' + id);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[M-11] org-m-a-11 cannot read org-m-b-11 records', async () => {
    const appA = makeApp(oid('m-a-11'));
    const appB = makeApp(oid('m-b-11'));
    const listB = await request(appB).get('/api/commissions');
    const id = listB.body.data[0]?.id;
    const res = await request(appA).get('/api/commissions/' + id);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[M-12] org-m-a-12 cannot read org-m-b-12 records', async () => {
    const appA = makeApp(oid('m-a-12'));
    const appB = makeApp(oid('m-b-12'));
    const listB = await request(appB).get('/api/commissions');
    const id = listB.body.data[0]?.id;
    const res = await request(appA).get('/api/commissions/' + id);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[M-13] org-m-a-13 cannot read org-m-b-13 records', async () => {
    const appA = makeApp(oid('m-a-13'));
    const appB = makeApp(oid('m-b-13'));
    const listB = await request(appB).get('/api/commissions');
    const id = listB.body.data[0]?.id;
    const res = await request(appA).get('/api/commissions/' + id);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[M-14] org-m-a-14 cannot read org-m-b-14 records', async () => {
    const appA = makeApp(oid('m-a-14'));
    const appB = makeApp(oid('m-b-14'));
    const listB = await request(appB).get('/api/commissions');
    const id = listB.body.data[0]?.id;
    const res = await request(appA).get('/api/commissions/' + id);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[M-15] org-m-a-15 cannot read org-m-b-15 records', async () => {
    const appA = makeApp(oid('m-a-15'));
    const appB = makeApp(oid('m-b-15'));
    const listB = await request(appB).get('/api/commissions');
    const id = listB.body.data[0]?.id;
    const res = await request(appA).get('/api/commissions/' + id);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[M-16] org-m-a-16 cannot read org-m-b-16 records', async () => {
    const appA = makeApp(oid('m-a-16'));
    const appB = makeApp(oid('m-b-16'));
    const listB = await request(appB).get('/api/commissions');
    const id = listB.body.data[0]?.id;
    const res = await request(appA).get('/api/commissions/' + id);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[M-17] org-m-a-17 cannot read org-m-b-17 records', async () => {
    const appA = makeApp(oid('m-a-17'));
    const appB = makeApp(oid('m-b-17'));
    const listB = await request(appB).get('/api/commissions');
    const id = listB.body.data[0]?.id;
    const res = await request(appA).get('/api/commissions/' + id);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[M-18] org-m-a-18 cannot read org-m-b-18 records', async () => {
    const appA = makeApp(oid('m-a-18'));
    const appB = makeApp(oid('m-b-18'));
    const listB = await request(appB).get('/api/commissions');
    const id = listB.body.data[0]?.id;
    const res = await request(appA).get('/api/commissions/' + id);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[M-19] org-m-a-19 cannot read org-m-b-19 records', async () => {
    const appA = makeApp(oid('m-a-19'));
    const appB = makeApp(oid('m-b-19'));
    const listB = await request(appB).get('/api/commissions');
    const id = listB.body.data[0]?.id;
    const res = await request(appA).get('/api/commissions/' + id);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[M-20] org-m-a-20 cannot read org-m-b-20 records', async () => {
    const appA = makeApp(oid('m-a-20'));
    const appB = makeApp(oid('m-b-20'));
    const listB = await request(appB).get('/api/commissions');
    const id = listB.body.data[0]?.id;
    const res = await request(appA).get('/api/commissions/' + id);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[M-21] org-m-a-21 cannot read org-m-b-21 records', async () => {
    const appA = makeApp(oid('m-a-21'));
    const appB = makeApp(oid('m-b-21'));
    const listB = await request(appB).get('/api/commissions');
    const id = listB.body.data[0]?.id;
    const res = await request(appA).get('/api/commissions/' + id);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[M-22] org-m-a-22 cannot read org-m-b-22 records', async () => {
    const appA = makeApp(oid('m-a-22'));
    const appB = makeApp(oid('m-b-22'));
    const listB = await request(appB).get('/api/commissions');
    const id = listB.body.data[0]?.id;
    const res = await request(appA).get('/api/commissions/' + id);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[M-23] org-m-a-23 cannot read org-m-b-23 records', async () => {
    const appA = makeApp(oid('m-a-23'));
    const appB = makeApp(oid('m-b-23'));
    const listB = await request(appB).get('/api/commissions');
    const id = listB.body.data[0]?.id;
    const res = await request(appA).get('/api/commissions/' + id);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[M-24] org-m-a-24 cannot read org-m-b-24 records', async () => {
    const appA = makeApp(oid('m-a-24'));
    const appB = makeApp(oid('m-b-24'));
    const listB = await request(appB).get('/api/commissions');
    const id = listB.body.data[0]?.id;
    const res = await request(appA).get('/api/commissions/' + id);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[M-25] org-m-a-25 cannot read org-m-b-25 records', async () => {
    const appA = makeApp(oid('m-a-25'));
    const appB = makeApp(oid('m-b-25'));
    const listB = await request(appB).get('/api/commissions');
    const id = listB.body.data[0]?.id;
    const res = await request(appA).get('/api/commissions/' + id);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[M-26] org-m-a-26 cannot read org-m-b-26 records', async () => {
    const appA = makeApp(oid('m-a-26'));
    const appB = makeApp(oid('m-b-26'));
    const listB = await request(appB).get('/api/commissions');
    const id = listB.body.data[0]?.id;
    const res = await request(appA).get('/api/commissions/' + id);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[M-27] org-m-a-27 cannot read org-m-b-27 records', async () => {
    const appA = makeApp(oid('m-a-27'));
    const appB = makeApp(oid('m-b-27'));
    const listB = await request(appB).get('/api/commissions');
    const id = listB.body.data[0]?.id;
    const res = await request(appA).get('/api/commissions/' + id);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[M-28] org-m-a-28 cannot read org-m-b-28 records', async () => {
    const appA = makeApp(oid('m-a-28'));
    const appB = makeApp(oid('m-b-28'));
    const listB = await request(appB).get('/api/commissions');
    const id = listB.body.data[0]?.id;
    const res = await request(appA).get('/api/commissions/' + id);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[M-29] org-m-a-29 cannot read org-m-b-29 records', async () => {
    const appA = makeApp(oid('m-a-29'));
    const appB = makeApp(oid('m-b-29'));
    const listB = await request(appB).get('/api/commissions');
    const id = listB.body.data[0]?.id;
    const res = await request(appA).get('/api/commissions/' + id);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[M-30] org-m-a-30 cannot read org-m-b-30 records', async () => {
    const appA = makeApp(oid('m-a-30'));
    const appB = makeApp(oid('m-b-30'));
    const listB = await request(appB).get('/api/commissions');
    const id = listB.body.data[0]?.id;
    const res = await request(appA).get('/api/commissions/' + id);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[M-31] org-m-a-31 cannot read org-m-b-31 records', async () => {
    const appA = makeApp(oid('m-a-31'));
    const appB = makeApp(oid('m-b-31'));
    const listB = await request(appB).get('/api/commissions');
    const id = listB.body.data[0]?.id;
    const res = await request(appA).get('/api/commissions/' + id);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[M-32] org-m-a-32 cannot read org-m-b-32 records', async () => {
    const appA = makeApp(oid('m-a-32'));
    const appB = makeApp(oid('m-b-32'));
    const listB = await request(appB).get('/api/commissions');
    const id = listB.body.data[0]?.id;
    const res = await request(appA).get('/api/commissions/' + id);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[M-33] org-m-a-33 cannot read org-m-b-33 records', async () => {
    const appA = makeApp(oid('m-a-33'));
    const appB = makeApp(oid('m-b-33'));
    const listB = await request(appB).get('/api/commissions');
    const id = listB.body.data[0]?.id;
    const res = await request(appA).get('/api/commissions/' + id);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[M-34] org-m-a-34 cannot read org-m-b-34 records', async () => {
    const appA = makeApp(oid('m-a-34'));
    const appB = makeApp(oid('m-b-34'));
    const listB = await request(appB).get('/api/commissions');
    const id = listB.body.data[0]?.id;
    const res = await request(appA).get('/api/commissions/' + id);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[M-35] org-m-a-35 cannot read org-m-b-35 records', async () => {
    const appA = makeApp(oid('m-a-35'));
    const appB = makeApp(oid('m-b-35'));
    const listB = await request(appB).get('/api/commissions');
    const id = listB.body.data[0]?.id;
    const res = await request(appA).get('/api/commissions/' + id);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[M-36] org-m-a-36 cannot read org-m-b-36 records', async () => {
    const appA = makeApp(oid('m-a-36'));
    const appB = makeApp(oid('m-b-36'));
    const listB = await request(appB).get('/api/commissions');
    const id = listB.body.data[0]?.id;
    const res = await request(appA).get('/api/commissions/' + id);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[M-37] org-m-a-37 cannot read org-m-b-37 records', async () => {
    const appA = makeApp(oid('m-a-37'));
    const appB = makeApp(oid('m-b-37'));
    const listB = await request(appB).get('/api/commissions');
    const id = listB.body.data[0]?.id;
    const res = await request(appA).get('/api/commissions/' + id);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[M-38] org-m-a-38 cannot read org-m-b-38 records', async () => {
    const appA = makeApp(oid('m-a-38'));
    const appB = makeApp(oid('m-b-38'));
    const listB = await request(appB).get('/api/commissions');
    const id = listB.body.data[0]?.id;
    const res = await request(appA).get('/api/commissions/' + id);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[M-39] org-m-a-39 cannot read org-m-b-39 records', async () => {
    const appA = makeApp(oid('m-a-39'));
    const appB = makeApp(oid('m-b-39'));
    const listB = await request(appB).get('/api/commissions');
    const id = listB.body.data[0]?.id;
    const res = await request(appA).get('/api/commissions/' + id);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[M-40] org-m-a-40 cannot read org-m-b-40 records', async () => {
    const appA = makeApp(oid('m-a-40'));
    const appB = makeApp(oid('m-b-40'));
    const listB = await request(appB).get('/api/commissions');
    const id = listB.body.data[0]?.id;
    const res = await request(appA).get('/api/commissions/' + id);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[M-41] org-m-a-41 cannot read org-m-b-41 records', async () => {
    const appA = makeApp(oid('m-a-41'));
    const appB = makeApp(oid('m-b-41'));
    const listB = await request(appB).get('/api/commissions');
    const id = listB.body.data[0]?.id;
    const res = await request(appA).get('/api/commissions/' + id);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[M-42] org-m-a-42 cannot read org-m-b-42 records', async () => {
    const appA = makeApp(oid('m-a-42'));
    const appB = makeApp(oid('m-b-42'));
    const listB = await request(appB).get('/api/commissions');
    const id = listB.body.data[0]?.id;
    const res = await request(appA).get('/api/commissions/' + id);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[M-43] org-m-a-43 cannot read org-m-b-43 records', async () => {
    const appA = makeApp(oid('m-a-43'));
    const appB = makeApp(oid('m-b-43'));
    const listB = await request(appB).get('/api/commissions');
    const id = listB.body.data[0]?.id;
    const res = await request(appA).get('/api/commissions/' + id);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[M-44] org-m-a-44 cannot read org-m-b-44 records', async () => {
    const appA = makeApp(oid('m-a-44'));
    const appB = makeApp(oid('m-b-44'));
    const listB = await request(appB).get('/api/commissions');
    const id = listB.body.data[0]?.id;
    const res = await request(appA).get('/api/commissions/' + id);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[M-45] org-m-a-45 cannot read org-m-b-45 records', async () => {
    const appA = makeApp(oid('m-a-45'));
    const appB = makeApp(oid('m-b-45'));
    const listB = await request(appB).get('/api/commissions');
    const id = listB.body.data[0]?.id;
    const res = await request(appA).get('/api/commissions/' + id);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[M-46] org-m-a-46 cannot read org-m-b-46 records', async () => {
    const appA = makeApp(oid('m-a-46'));
    const appB = makeApp(oid('m-b-46'));
    const listB = await request(appB).get('/api/commissions');
    const id = listB.body.data[0]?.id;
    const res = await request(appA).get('/api/commissions/' + id);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[M-47] org-m-a-47 cannot read org-m-b-47 records', async () => {
    const appA = makeApp(oid('m-a-47'));
    const appB = makeApp(oid('m-b-47'));
    const listB = await request(appB).get('/api/commissions');
    const id = listB.body.data[0]?.id;
    const res = await request(appA).get('/api/commissions/' + id);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[M-48] org-m-a-48 cannot read org-m-b-48 records', async () => {
    const appA = makeApp(oid('m-a-48'));
    const appB = makeApp(oid('m-b-48'));
    const listB = await request(appB).get('/api/commissions');
    const id = listB.body.data[0]?.id;
    const res = await request(appA).get('/api/commissions/' + id);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[M-49] org-m-a-49 cannot read org-m-b-49 records', async () => {
    const appA = makeApp(oid('m-a-49'));
    const appB = makeApp(oid('m-b-49'));
    const listB = await request(appB).get('/api/commissions');
    const id = listB.body.data[0]?.id;
    const res = await request(appA).get('/api/commissions/' + id);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[M-50] org-m-a-50 cannot read org-m-b-50 records', async () => {
    const appA = makeApp(oid('m-a-50'));
    const appB = makeApp(oid('m-b-50'));
    const listB = await request(appB).get('/api/commissions');
    const id = listB.body.data[0]?.id;
    const res = await request(appA).get('/api/commissions/' + id);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[M-51] org-m-a-51 cannot read org-m-b-51 records', async () => {
    const appA = makeApp(oid('m-a-51'));
    const appB = makeApp(oid('m-b-51'));
    const listB = await request(appB).get('/api/commissions');
    const id = listB.body.data[0]?.id;
    const res = await request(appA).get('/api/commissions/' + id);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[M-52] org-m-a-52 cannot read org-m-b-52 records', async () => {
    const appA = makeApp(oid('m-a-52'));
    const appB = makeApp(oid('m-b-52'));
    const listB = await request(appB).get('/api/commissions');
    const id = listB.body.data[0]?.id;
    const res = await request(appA).get('/api/commissions/' + id);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[M-53] org-m-a-53 cannot read org-m-b-53 records', async () => {
    const appA = makeApp(oid('m-a-53'));
    const appB = makeApp(oid('m-b-53'));
    const listB = await request(appB).get('/api/commissions');
    const id = listB.body.data[0]?.id;
    const res = await request(appA).get('/api/commissions/' + id);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[M-54] org-m-a-54 cannot read org-m-b-54 records', async () => {
    const appA = makeApp(oid('m-a-54'));
    const appB = makeApp(oid('m-b-54'));
    const listB = await request(appB).get('/api/commissions');
    const id = listB.body.data[0]?.id;
    const res = await request(appA).get('/api/commissions/' + id);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[M-55] org-m-a-55 cannot read org-m-b-55 records', async () => {
    const appA = makeApp(oid('m-a-55'));
    const appB = makeApp(oid('m-b-55'));
    const listB = await request(appB).get('/api/commissions');
    const id = listB.body.data[0]?.id;
    const res = await request(appA).get('/api/commissions/' + id);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[M-56] org-m-a-56 cannot read org-m-b-56 records', async () => {
    const appA = makeApp(oid('m-a-56'));
    const appB = makeApp(oid('m-b-56'));
    const listB = await request(appB).get('/api/commissions');
    const id = listB.body.data[0]?.id;
    const res = await request(appA).get('/api/commissions/' + id);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[M-57] org-m-a-57 cannot read org-m-b-57 records', async () => {
    const appA = makeApp(oid('m-a-57'));
    const appB = makeApp(oid('m-b-57'));
    const listB = await request(appB).get('/api/commissions');
    const id = listB.body.data[0]?.id;
    const res = await request(appA).get('/api/commissions/' + id);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[M-58] org-m-a-58 cannot read org-m-b-58 records', async () => {
    const appA = makeApp(oid('m-a-58'));
    const appB = makeApp(oid('m-b-58'));
    const listB = await request(appB).get('/api/commissions');
    const id = listB.body.data[0]?.id;
    const res = await request(appA).get('/api/commissions/' + id);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[M-59] org-m-a-59 cannot read org-m-b-59 records', async () => {
    const appA = makeApp(oid('m-a-59'));
    const appB = makeApp(oid('m-b-59'));
    const listB = await request(appB).get('/api/commissions');
    const id = listB.body.data[0]?.id;
    const res = await request(appA).get('/api/commissions/' + id);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[M-60] 403 error code is FORBIDDEN', async () => {
    const appA = makeApp(oid('m-60a'));
    const appB = makeApp(oid('m-60b'));
    const listB = await request(appB).get('/api/commissions');
    const id = listB.body.data[0]?.id;
    const res = await request(appA).get('/api/commissions/' + id);
    expect(res.body.error?.code).toBe('FORBIDDEN');
  });
  it('[M-61] 403 error has message', async () => {
    const appA = makeApp(oid('m-61a'));
    const appB = makeApp(oid('m-61b'));
    const listB = await request(appB).get('/api/commissions');
    const id = listB.body.data[0]?.id;
    const res = await request(appA).get('/api/commissions/' + id);
    expect(res.body.error).toHaveProperty('message');
  });
});

// ─── Suite N: All seeded records individually accessible ──────────────────────
describe('GET /api/commissions/:id — all 5 seeded records accessible', () => {
  it('[N-0] can fetch each of 5 seeded records individually', async () => {
    const app = makeApp(oid('n-0'));
    const list = await request(app).get('/api/commissions');
    for (const record of list.body.data) {
      const res = await request(app).get('/api/commissions/' + record.id);
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(record.id);
    }
  });
  it('[N-1] can fetch each of 5 seeded records individually', async () => {
    const app = makeApp(oid('n-1'));
    const list = await request(app).get('/api/commissions');
    for (const record of list.body.data) {
      const res = await request(app).get('/api/commissions/' + record.id);
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(record.id);
    }
  });
  it('[N-2] can fetch each of 5 seeded records individually', async () => {
    const app = makeApp(oid('n-2'));
    const list = await request(app).get('/api/commissions');
    for (const record of list.body.data) {
      const res = await request(app).get('/api/commissions/' + record.id);
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(record.id);
    }
  });
  it('[N-3] can fetch each of 5 seeded records individually', async () => {
    const app = makeApp(oid('n-3'));
    const list = await request(app).get('/api/commissions');
    for (const record of list.body.data) {
      const res = await request(app).get('/api/commissions/' + record.id);
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(record.id);
    }
  });
  it('[N-4] can fetch each of 5 seeded records individually', async () => {
    const app = makeApp(oid('n-4'));
    const list = await request(app).get('/api/commissions');
    for (const record of list.body.data) {
      const res = await request(app).get('/api/commissions/' + record.id);
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(record.id);
    }
  });
  it('[N-5] can fetch each of 5 seeded records individually', async () => {
    const app = makeApp(oid('n-5'));
    const list = await request(app).get('/api/commissions');
    for (const record of list.body.data) {
      const res = await request(app).get('/api/commissions/' + record.id);
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(record.id);
    }
  });
  it('[N-6] can fetch each of 5 seeded records individually', async () => {
    const app = makeApp(oid('n-6'));
    const list = await request(app).get('/api/commissions');
    for (const record of list.body.data) {
      const res = await request(app).get('/api/commissions/' + record.id);
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(record.id);
    }
  });
  it('[N-7] can fetch each of 5 seeded records individually', async () => {
    const app = makeApp(oid('n-7'));
    const list = await request(app).get('/api/commissions');
    for (const record of list.body.data) {
      const res = await request(app).get('/api/commissions/' + record.id);
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(record.id);
    }
  });
  it('[N-8] can fetch each of 5 seeded records individually', async () => {
    const app = makeApp(oid('n-8'));
    const list = await request(app).get('/api/commissions');
    for (const record of list.body.data) {
      const res = await request(app).get('/api/commissions/' + record.id);
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(record.id);
    }
  });
  it('[N-9] can fetch each of 5 seeded records individually', async () => {
    const app = makeApp(oid('n-9'));
    const list = await request(app).get('/api/commissions');
    for (const record of list.body.data) {
      const res = await request(app).get('/api/commissions/' + record.id);
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(record.id);
    }
  });
  it('[N-10] can fetch each of 5 seeded records individually', async () => {
    const app = makeApp(oid('n-10'));
    const list = await request(app).get('/api/commissions');
    for (const record of list.body.data) {
      const res = await request(app).get('/api/commissions/' + record.id);
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(record.id);
    }
  });
  it('[N-11] can fetch each of 5 seeded records individually', async () => {
    const app = makeApp(oid('n-11'));
    const list = await request(app).get('/api/commissions');
    for (const record of list.body.data) {
      const res = await request(app).get('/api/commissions/' + record.id);
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(record.id);
    }
  });
  it('[N-12] can fetch each of 5 seeded records individually', async () => {
    const app = makeApp(oid('n-12'));
    const list = await request(app).get('/api/commissions');
    for (const record of list.body.data) {
      const res = await request(app).get('/api/commissions/' + record.id);
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(record.id);
    }
  });
  it('[N-13] can fetch each of 5 seeded records individually', async () => {
    const app = makeApp(oid('n-13'));
    const list = await request(app).get('/api/commissions');
    for (const record of list.body.data) {
      const res = await request(app).get('/api/commissions/' + record.id);
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(record.id);
    }
  });
  it('[N-14] can fetch each of 5 seeded records individually', async () => {
    const app = makeApp(oid('n-14'));
    const list = await request(app).get('/api/commissions');
    for (const record of list.body.data) {
      const res = await request(app).get('/api/commissions/' + record.id);
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(record.id);
    }
  });
  it('[N-15] can fetch each of 5 seeded records individually', async () => {
    const app = makeApp(oid('n-15'));
    const list = await request(app).get('/api/commissions');
    for (const record of list.body.data) {
      const res = await request(app).get('/api/commissions/' + record.id);
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(record.id);
    }
  });
  it('[N-16] can fetch each of 5 seeded records individually', async () => {
    const app = makeApp(oid('n-16'));
    const list = await request(app).get('/api/commissions');
    for (const record of list.body.data) {
      const res = await request(app).get('/api/commissions/' + record.id);
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(record.id);
    }
  });
  it('[N-17] can fetch each of 5 seeded records individually', async () => {
    const app = makeApp(oid('n-17'));
    const list = await request(app).get('/api/commissions');
    for (const record of list.body.data) {
      const res = await request(app).get('/api/commissions/' + record.id);
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(record.id);
    }
  });
  it('[N-18] can fetch each of 5 seeded records individually', async () => {
    const app = makeApp(oid('n-18'));
    const list = await request(app).get('/api/commissions');
    for (const record of list.body.data) {
      const res = await request(app).get('/api/commissions/' + record.id);
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(record.id);
    }
  });
  it('[N-19] can fetch each of 5 seeded records individually', async () => {
    const app = makeApp(oid('n-19'));
    const list = await request(app).get('/api/commissions');
    for (const record of list.body.data) {
      const res = await request(app).get('/api/commissions/' + record.id);
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(record.id);
    }
  });
});

// ─── Suite O: Specific seeded record values ───────────────────────────────────
describe('Seeded data — specific record values', () => {
  const appO = makeApp(oid('o-specific'));
  it('[O-0] CM-2025-0001 exists', async () => {
    const res = await request(appO).get('/api/commissions');
    expect(res.body.data.some((r: any) => r.referenceNumber === 'CM-2025-0001')).toBe(true);
  });
  it('[O-1] CM-2025-0001 type NEW_BUSINESS', async () => {
    const res = await request(appO).get('/api/commissions');
    const r = res.body.data.find((rec: any) => rec.referenceNumber === 'CM-2025-0001'); expect(r.type).toBe('NEW_BUSINESS');
  });
  it('[O-2] CM-2025-0001 status PAID', async () => {
    const res = await request(appO).get('/api/commissions');
    const r = res.body.data.find((rec: any) => rec.referenceNumber === 'CM-2025-0001'); expect(r.status).toBe('PAID');
  });
  it('[O-3] CM-2025-0001 commissionAmount 3600', async () => {
    const res = await request(appO).get('/api/commissions');
    const r = res.body.data.find((rec: any) => rec.referenceNumber === 'CM-2025-0001'); expect(r.commissionAmount).toBe(3600);
  });
  it('[O-4] CM-2025-0001 customerName Acme', async () => {
    const res = await request(appO).get('/api/commissions');
    const r = res.body.data.find((rec: any) => rec.referenceNumber === 'CM-2025-0001'); expect(r.customerName).toBe('Acme Manufacturing Ltd');
  });
  it('[O-5] CM-2025-0001 paymentRef BAC-001', async () => {
    const res = await request(appO).get('/api/commissions');
    const r = res.body.data.find((rec: any) => rec.referenceNumber === 'CM-2025-0001'); expect(r.paymentReference).toBe('BAC-001');
  });
  it('[O-6] CM-2025-0001 baseAmount 24000', async () => {
    const res = await request(appO).get('/api/commissions');
    const r = res.body.data.find((rec: any) => rec.referenceNumber === 'CM-2025-0001'); expect(r.baseAmount).toBe(24000);
  });
  it('[O-7] CM-2025-0001 commissionRate 15', async () => {
    const res = await request(appO).get('/api/commissions');
    const r = res.body.data.find((rec: any) => rec.referenceNumber === 'CM-2025-0001'); expect(r.commissionRate).toBe(15);
  });
  it('[O-8] CM-2025-0001 periodMonth 2025-10', async () => {
    const res = await request(appO).get('/api/commissions');
    const r = res.body.data.find((rec: any) => rec.referenceNumber === 'CM-2025-0001'); expect(r.periodMonth).toBe('2025-10');
  });
  it('[O-9] CM-2025-0002 type REFERRAL', async () => {
    const res = await request(appO).get('/api/commissions');
    const r = res.body.data.find((rec: any) => rec.referenceNumber === 'CM-2025-0002'); expect(r.type).toBe('REFERRAL');
  });
  it('[O-10] CM-2025-0002 status PAID', async () => {
    const res = await request(appO).get('/api/commissions');
    const r = res.body.data.find((rec: any) => rec.referenceNumber === 'CM-2025-0002'); expect(r.status).toBe('PAID');
  });
  it('[O-11] CM-2025-0002 commissionAmount 1800', async () => {
    const res = await request(appO).get('/api/commissions');
    const r = res.body.data.find((rec: any) => rec.referenceNumber === 'CM-2025-0002'); expect(r.commissionAmount).toBe(1800);
  });
  it('[O-12] CM-2025-0002 baseAmount 18000', async () => {
    const res = await request(appO).get('/api/commissions');
    const r = res.body.data.find((rec: any) => rec.referenceNumber === 'CM-2025-0002'); expect(r.baseAmount).toBe(18000);
  });
  it('[O-13] CM-2025-0003 type RENEWAL', async () => {
    const res = await request(appO).get('/api/commissions');
    const r = res.body.data.find((rec: any) => rec.referenceNumber === 'CM-2025-0003'); expect(r.type).toBe('RENEWAL');
  });
  it('[O-14] CM-2025-0003 status APPROVED', async () => {
    const res = await request(appO).get('/api/commissions');
    const r = res.body.data.find((rec: any) => rec.referenceNumber === 'CM-2025-0003'); expect(r.status).toBe('APPROVED');
  });
  it('[O-15] CM-2025-0003 commissionRate 5', async () => {
    const res = await request(appO).get('/api/commissions');
    const r = res.body.data.find((rec: any) => rec.referenceNumber === 'CM-2025-0003'); expect(r.commissionRate).toBe(5);
  });
  it('[O-16] CM-2026-0001 type NEW_BUSINESS', async () => {
    const res = await request(appO).get('/api/commissions');
    const r = res.body.data.find((rec: any) => rec.referenceNumber === 'CM-2026-0001'); expect(r.type).toBe('NEW_BUSINESS');
  });
  it('[O-17] CM-2026-0001 status PENDING', async () => {
    const res = await request(appO).get('/api/commissions');
    const r = res.body.data.find((rec: any) => rec.referenceNumber === 'CM-2026-0001'); expect(r.status).toBe('PENDING');
  });
  it('[O-18] CM-2026-0001 commissionAmount 5400', async () => {
    const res = await request(appO).get('/api/commissions');
    const r = res.body.data.find((rec: any) => rec.referenceNumber === 'CM-2026-0001'); expect(r.commissionAmount).toBe(5400);
  });
  it('[O-19] CM-2026-0001 baseAmount 36000', async () => {
    const res = await request(appO).get('/api/commissions');
    const r = res.body.data.find((rec: any) => rec.referenceNumber === 'CM-2026-0001'); expect(r.baseAmount).toBe(36000);
  });
  it('[O-20] CM-2026-0002 type UPSELL', async () => {
    const res = await request(appO).get('/api/commissions');
    const r = res.body.data.find((rec: any) => rec.referenceNumber === 'CM-2026-0002'); expect(r.type).toBe('UPSELL');
  });
  it('[O-21] CM-2026-0002 status PENDING', async () => {
    const res = await request(appO).get('/api/commissions');
    const r = res.body.data.find((rec: any) => rec.referenceNumber === 'CM-2026-0002'); expect(r.status).toBe('PENDING');
  });
  it('[O-22] CM-2026-0002 commissionAmount 600', async () => {
    const res = await request(appO).get('/api/commissions');
    const r = res.body.data.find((rec: any) => rec.referenceNumber === 'CM-2026-0002'); expect(r.commissionAmount).toBe(600);
  });
  it('[O-23] CM-2026-0002 baseAmount 6000', async () => {
    const res = await request(appO).get('/api/commissions');
    const r = res.body.data.find((rec: any) => rec.referenceNumber === 'CM-2026-0002'); expect(r.baseAmount).toBe(6000);
  });
  it('[O-24] PAID records have approvedAt', async () => {
    const res = await request(appO).get('/api/commissions');
    const paid = res.body.data.filter((rec: any) => rec.status === 'PAID'); paid.forEach((rec: any) => expect(rec.approvedAt).toBeTruthy());
  });
  it('[O-25] PAID records have paidAt', async () => {
    const res = await request(appO).get('/api/commissions');
    const paid = res.body.data.filter((rec: any) => rec.status === 'PAID'); paid.forEach((rec: any) => expect(rec.paidAt).toBeTruthy());
  });
  it('[O-26] PENDING records no paidAt', async () => {
    const res = await request(appO).get('/api/commissions');
    const pend = res.body.data.filter((rec: any) => rec.status === 'PENDING'); pend.forEach((rec: any) => expect(rec.paidAt).toBeUndefined());
  });
  it('[O-27] CM-2025-0001 invoiceRef INV-2025-1234', async () => {
    const res = await request(appO).get('/api/commissions');
    const r = res.body.data.find((rec: any) => rec.referenceNumber === 'CM-2025-0001'); expect(r.invoiceReference).toBe('INV-2025-1234');
  });
  it('[O-28] CM-2025-0002 paymentRef BAC-002', async () => {
    const res = await request(appO).get('/api/commissions');
    const r = res.body.data.find((rec: any) => rec.referenceNumber === 'CM-2025-0002'); expect(r.paymentReference).toBe('BAC-002');
  });
  it('[O-29] all 5 records currency GBP', async () => {
    const res = await request(appO).get('/api/commissions');
    res.body.data.forEach((rec: any) => expect(rec.currency).toBe('GBP'));
  });
});

// ─── Suite P: Idempotency ─────────────────────────────────────────────────────
describe('seedDemoCommissions — idempotency', () => {
  it('[P-0] calling list twice for org-p-0 still returns 5 records', async () => {
    const app = makeApp(oid('p-0'));
    await request(app).get('/api/commissions');
    const res = await request(app).get('/api/commissions');
    expect(res.body.data).toHaveLength(5);
  });
  it('[P-1] calling list twice for org-p-1 still returns 5 records', async () => {
    const app = makeApp(oid('p-1'));
    await request(app).get('/api/commissions');
    const res = await request(app).get('/api/commissions');
    expect(res.body.data).toHaveLength(5);
  });
  it('[P-2] calling list twice for org-p-2 still returns 5 records', async () => {
    const app = makeApp(oid('p-2'));
    await request(app).get('/api/commissions');
    const res = await request(app).get('/api/commissions');
    expect(res.body.data).toHaveLength(5);
  });
  it('[P-3] calling list twice for org-p-3 still returns 5 records', async () => {
    const app = makeApp(oid('p-3'));
    await request(app).get('/api/commissions');
    const res = await request(app).get('/api/commissions');
    expect(res.body.data).toHaveLength(5);
  });
  it('[P-4] calling list twice for org-p-4 still returns 5 records', async () => {
    const app = makeApp(oid('p-4'));
    await request(app).get('/api/commissions');
    const res = await request(app).get('/api/commissions');
    expect(res.body.data).toHaveLength(5);
  });
  it('[P-5] calling list twice for org-p-5 still returns 5 records', async () => {
    const app = makeApp(oid('p-5'));
    await request(app).get('/api/commissions');
    const res = await request(app).get('/api/commissions');
    expect(res.body.data).toHaveLength(5);
  });
  it('[P-6] calling list twice for org-p-6 still returns 5 records', async () => {
    const app = makeApp(oid('p-6'));
    await request(app).get('/api/commissions');
    const res = await request(app).get('/api/commissions');
    expect(res.body.data).toHaveLength(5);
  });
  it('[P-7] calling list twice for org-p-7 still returns 5 records', async () => {
    const app = makeApp(oid('p-7'));
    await request(app).get('/api/commissions');
    const res = await request(app).get('/api/commissions');
    expect(res.body.data).toHaveLength(5);
  });
  it('[P-8] calling list twice for org-p-8 still returns 5 records', async () => {
    const app = makeApp(oid('p-8'));
    await request(app).get('/api/commissions');
    const res = await request(app).get('/api/commissions');
    expect(res.body.data).toHaveLength(5);
  });
  it('[P-9] calling list twice for org-p-9 still returns 5 records', async () => {
    const app = makeApp(oid('p-9'));
    await request(app).get('/api/commissions');
    const res = await request(app).get('/api/commissions');
    expect(res.body.data).toHaveLength(5);
  });
  it('[P-10] calling list twice for org-p-10 still returns 5 records', async () => {
    const app = makeApp(oid('p-10'));
    await request(app).get('/api/commissions');
    const res = await request(app).get('/api/commissions');
    expect(res.body.data).toHaveLength(5);
  });
  it('[P-11] calling list twice for org-p-11 still returns 5 records', async () => {
    const app = makeApp(oid('p-11'));
    await request(app).get('/api/commissions');
    const res = await request(app).get('/api/commissions');
    expect(res.body.data).toHaveLength(5);
  });
  it('[P-12] calling list twice for org-p-12 still returns 5 records', async () => {
    const app = makeApp(oid('p-12'));
    await request(app).get('/api/commissions');
    const res = await request(app).get('/api/commissions');
    expect(res.body.data).toHaveLength(5);
  });
  it('[P-13] calling list twice for org-p-13 still returns 5 records', async () => {
    const app = makeApp(oid('p-13'));
    await request(app).get('/api/commissions');
    const res = await request(app).get('/api/commissions');
    expect(res.body.data).toHaveLength(5);
  });
  it('[P-14] calling list twice for org-p-14 still returns 5 records', async () => {
    const app = makeApp(oid('p-14'));
    await request(app).get('/api/commissions');
    const res = await request(app).get('/api/commissions');
    expect(res.body.data).toHaveLength(5);
  });
  it('[P-15] calling list twice for org-p-15 still returns 5 records', async () => {
    const app = makeApp(oid('p-15'));
    await request(app).get('/api/commissions');
    const res = await request(app).get('/api/commissions');
    expect(res.body.data).toHaveLength(5);
  });
  it('[P-16] calling list twice for org-p-16 still returns 5 records', async () => {
    const app = makeApp(oid('p-16'));
    await request(app).get('/api/commissions');
    const res = await request(app).get('/api/commissions');
    expect(res.body.data).toHaveLength(5);
  });
  it('[P-17] calling list twice for org-p-17 still returns 5 records', async () => {
    const app = makeApp(oid('p-17'));
    await request(app).get('/api/commissions');
    const res = await request(app).get('/api/commissions');
    expect(res.body.data).toHaveLength(5);
  });
  it('[P-18] calling list twice for org-p-18 still returns 5 records', async () => {
    const app = makeApp(oid('p-18'));
    await request(app).get('/api/commissions');
    const res = await request(app).get('/api/commissions');
    expect(res.body.data).toHaveLength(5);
  });
  it('[P-19] calling list twice for org-p-19 still returns 5 records', async () => {
    const app = makeApp(oid('p-19'));
    await request(app).get('/api/commissions');
    const res = await request(app).get('/api/commissions');
    expect(res.body.data).toHaveLength(5);
  });
  it('[P-20] calling list twice for org-p-20 still returns 5 records', async () => {
    const app = makeApp(oid('p-20'));
    await request(app).get('/api/commissions');
    const res = await request(app).get('/api/commissions');
    expect(res.body.data).toHaveLength(5);
  });
  it('[P-21] calling list twice for org-p-21 still returns 5 records', async () => {
    const app = makeApp(oid('p-21'));
    await request(app).get('/api/commissions');
    const res = await request(app).get('/api/commissions');
    expect(res.body.data).toHaveLength(5);
  });
  it('[P-22] calling list twice for org-p-22 still returns 5 records', async () => {
    const app = makeApp(oid('p-22'));
    await request(app).get('/api/commissions');
    const res = await request(app).get('/api/commissions');
    expect(res.body.data).toHaveLength(5);
  });
  it('[P-23] calling list twice for org-p-23 still returns 5 records', async () => {
    const app = makeApp(oid('p-23'));
    await request(app).get('/api/commissions');
    const res = await request(app).get('/api/commissions');
    expect(res.body.data).toHaveLength(5);
  });
  it('[P-24] calling list twice for org-p-24 still returns 5 records', async () => {
    const app = makeApp(oid('p-24'));
    await request(app).get('/api/commissions');
    const res = await request(app).get('/api/commissions');
    expect(res.body.data).toHaveLength(5);
  });
  it('[P-sum-0] summary twice returns same totalEarned for org-psum-0', async () => {
    const app = makeApp(oid('psum-0'));
    const r1 = await request(app).get('/api/commissions/summary');
    const r2 = await request(app).get('/api/commissions/summary');
    expect(r1.body.data.totalEarned).toBe(r2.body.data.totalEarned);
  });
  it('[P-sum-1] summary twice returns same totalEarned for org-psum-1', async () => {
    const app = makeApp(oid('psum-1'));
    const r1 = await request(app).get('/api/commissions/summary');
    const r2 = await request(app).get('/api/commissions/summary');
    expect(r1.body.data.totalEarned).toBe(r2.body.data.totalEarned);
  });
  it('[P-sum-2] summary twice returns same totalEarned for org-psum-2', async () => {
    const app = makeApp(oid('psum-2'));
    const r1 = await request(app).get('/api/commissions/summary');
    const r2 = await request(app).get('/api/commissions/summary');
    expect(r1.body.data.totalEarned).toBe(r2.body.data.totalEarned);
  });
  it('[P-sum-3] summary twice returns same totalEarned for org-psum-3', async () => {
    const app = makeApp(oid('psum-3'));
    const r1 = await request(app).get('/api/commissions/summary');
    const r2 = await request(app).get('/api/commissions/summary');
    expect(r1.body.data.totalEarned).toBe(r2.body.data.totalEarned);
  });
  it('[P-sum-4] summary twice returns same totalEarned for org-psum-4', async () => {
    const app = makeApp(oid('psum-4'));
    const r1 = await request(app).get('/api/commissions/summary');
    const r2 = await request(app).get('/api/commissions/summary');
    expect(r1.body.data.totalEarned).toBe(r2.body.data.totalEarned);
  });
  it('[P-sum-5] summary twice returns same totalEarned for org-psum-5', async () => {
    const app = makeApp(oid('psum-5'));
    const r1 = await request(app).get('/api/commissions/summary');
    const r2 = await request(app).get('/api/commissions/summary');
    expect(r1.body.data.totalEarned).toBe(r2.body.data.totalEarned);
  });
  it('[P-sum-6] summary twice returns same totalEarned for org-psum-6', async () => {
    const app = makeApp(oid('psum-6'));
    const r1 = await request(app).get('/api/commissions/summary');
    const r2 = await request(app).get('/api/commissions/summary');
    expect(r1.body.data.totalEarned).toBe(r2.body.data.totalEarned);
  });
  it('[P-sum-7] summary twice returns same totalEarned for org-psum-7', async () => {
    const app = makeApp(oid('psum-7'));
    const r1 = await request(app).get('/api/commissions/summary');
    const r2 = await request(app).get('/api/commissions/summary');
    expect(r1.body.data.totalEarned).toBe(r2.body.data.totalEarned);
  });
  it('[P-sum-8] summary twice returns same totalEarned for org-psum-8', async () => {
    const app = makeApp(oid('psum-8'));
    const r1 = await request(app).get('/api/commissions/summary');
    const r2 = await request(app).get('/api/commissions/summary');
    expect(r1.body.data.totalEarned).toBe(r2.body.data.totalEarned);
  });
  it('[P-sum-9] summary twice returns same totalEarned for org-psum-9', async () => {
    const app = makeApp(oid('psum-9'));
    const r1 = await request(app).get('/api/commissions/summary');
    const r2 = await request(app).get('/api/commissions/summary');
    expect(r1.body.data.totalEarned).toBe(r2.body.data.totalEarned);
  });
  it('[P-sum-10] summary twice returns same totalEarned for org-psum-10', async () => {
    const app = makeApp(oid('psum-10'));
    const r1 = await request(app).get('/api/commissions/summary');
    const r2 = await request(app).get('/api/commissions/summary');
    expect(r1.body.data.totalEarned).toBe(r2.body.data.totalEarned);
  });
  it('[P-sum-11] summary twice returns same totalEarned for org-psum-11', async () => {
    const app = makeApp(oid('psum-11'));
    const r1 = await request(app).get('/api/commissions/summary');
    const r2 = await request(app).get('/api/commissions/summary');
    expect(r1.body.data.totalEarned).toBe(r2.body.data.totalEarned);
  });
  it('[P-sum-12] summary twice returns same totalEarned for org-psum-12', async () => {
    const app = makeApp(oid('psum-12'));
    const r1 = await request(app).get('/api/commissions/summary');
    const r2 = await request(app).get('/api/commissions/summary');
    expect(r1.body.data.totalEarned).toBe(r2.body.data.totalEarned);
  });
  it('[P-sum-13] summary twice returns same totalEarned for org-psum-13', async () => {
    const app = makeApp(oid('psum-13'));
    const r1 = await request(app).get('/api/commissions/summary');
    const r2 = await request(app).get('/api/commissions/summary');
    expect(r1.body.data.totalEarned).toBe(r2.body.data.totalEarned);
  });
  it('[P-sum-14] summary twice returns same totalEarned for org-psum-14', async () => {
    const app = makeApp(oid('psum-14'));
    const r1 = await request(app).get('/api/commissions/summary');
    const r2 = await request(app).get('/api/commissions/summary');
    expect(r1.body.data.totalEarned).toBe(r2.body.data.totalEarned);
  });
  it('[P-sum-15] summary twice returns same totalEarned for org-psum-15', async () => {
    const app = makeApp(oid('psum-15'));
    const r1 = await request(app).get('/api/commissions/summary');
    const r2 = await request(app).get('/api/commissions/summary');
    expect(r1.body.data.totalEarned).toBe(r2.body.data.totalEarned);
  });
  it('[P-sum-16] summary twice returns same totalEarned for org-psum-16', async () => {
    const app = makeApp(oid('psum-16'));
    const r1 = await request(app).get('/api/commissions/summary');
    const r2 = await request(app).get('/api/commissions/summary');
    expect(r1.body.data.totalEarned).toBe(r2.body.data.totalEarned);
  });
  it('[P-sum-17] summary twice returns same totalEarned for org-psum-17', async () => {
    const app = makeApp(oid('psum-17'));
    const r1 = await request(app).get('/api/commissions/summary');
    const r2 = await request(app).get('/api/commissions/summary');
    expect(r1.body.data.totalEarned).toBe(r2.body.data.totalEarned);
  });
  it('[P-sum-18] summary twice returns same totalEarned for org-psum-18', async () => {
    const app = makeApp(oid('psum-18'));
    const r1 = await request(app).get('/api/commissions/summary');
    const r2 = await request(app).get('/api/commissions/summary');
    expect(r1.body.data.totalEarned).toBe(r2.body.data.totalEarned);
  });
  it('[P-sum-19] summary twice returns same totalEarned for org-psum-19', async () => {
    const app = makeApp(oid('psum-19'));
    const r1 = await request(app).get('/api/commissions/summary');
    const r2 = await request(app).get('/api/commissions/summary');
    expect(r1.body.data.totalEarned).toBe(r2.body.data.totalEarned);
  });
  it('[P-sum-20] summary twice returns same totalEarned for org-psum-20', async () => {
    const app = makeApp(oid('psum-20'));
    const r1 = await request(app).get('/api/commissions/summary');
    const r2 = await request(app).get('/api/commissions/summary');
    expect(r1.body.data.totalEarned).toBe(r2.body.data.totalEarned);
  });
  it('[P-sum-21] summary twice returns same totalEarned for org-psum-21', async () => {
    const app = makeApp(oid('psum-21'));
    const r1 = await request(app).get('/api/commissions/summary');
    const r2 = await request(app).get('/api/commissions/summary');
    expect(r1.body.data.totalEarned).toBe(r2.body.data.totalEarned);
  });
  it('[P-sum-22] summary twice returns same totalEarned for org-psum-22', async () => {
    const app = makeApp(oid('psum-22'));
    const r1 = await request(app).get('/api/commissions/summary');
    const r2 = await request(app).get('/api/commissions/summary');
    expect(r1.body.data.totalEarned).toBe(r2.body.data.totalEarned);
  });
  it('[P-sum-23] summary twice returns same totalEarned for org-psum-23', async () => {
    const app = makeApp(oid('psum-23'));
    const r1 = await request(app).get('/api/commissions/summary');
    const r2 = await request(app).get('/api/commissions/summary');
    expect(r1.body.data.totalEarned).toBe(r2.body.data.totalEarned);
  });
  it('[P-sum-24] summary twice returns same totalEarned for org-psum-24', async () => {
    const app = makeApp(oid('psum-24'));
    const r1 = await request(app).get('/api/commissions/summary');
    const r2 = await request(app).get('/api/commissions/summary');
    expect(r1.body.data.totalEarned).toBe(r2.body.data.totalEarned);
  });
});

// ─── Suite Q: Content-Type headers ───────────────────────────────────────────
describe('Content-Type headers', () => {
  it('[Q-list-0] GET / returns application/json', async () => {
    const app = makeApp(oid('q-list-0'));
    const res = await request(app).get('/api/commissions');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Q-list-1] GET / returns application/json', async () => {
    const app = makeApp(oid('q-list-1'));
    const res = await request(app).get('/api/commissions');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Q-list-2] GET / returns application/json', async () => {
    const app = makeApp(oid('q-list-2'));
    const res = await request(app).get('/api/commissions');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Q-list-3] GET / returns application/json', async () => {
    const app = makeApp(oid('q-list-3'));
    const res = await request(app).get('/api/commissions');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Q-list-4] GET / returns application/json', async () => {
    const app = makeApp(oid('q-list-4'));
    const res = await request(app).get('/api/commissions');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Q-list-5] GET / returns application/json', async () => {
    const app = makeApp(oid('q-list-5'));
    const res = await request(app).get('/api/commissions');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Q-list-6] GET / returns application/json', async () => {
    const app = makeApp(oid('q-list-6'));
    const res = await request(app).get('/api/commissions');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Q-list-7] GET / returns application/json', async () => {
    const app = makeApp(oid('q-list-7'));
    const res = await request(app).get('/api/commissions');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Q-list-8] GET / returns application/json', async () => {
    const app = makeApp(oid('q-list-8'));
    const res = await request(app).get('/api/commissions');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Q-list-9] GET / returns application/json', async () => {
    const app = makeApp(oid('q-list-9'));
    const res = await request(app).get('/api/commissions');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Q-list-10] GET / returns application/json', async () => {
    const app = makeApp(oid('q-list-10'));
    const res = await request(app).get('/api/commissions');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Q-list-11] GET / returns application/json', async () => {
    const app = makeApp(oid('q-list-11'));
    const res = await request(app).get('/api/commissions');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Q-list-12] GET / returns application/json', async () => {
    const app = makeApp(oid('q-list-12'));
    const res = await request(app).get('/api/commissions');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Q-list-13] GET / returns application/json', async () => {
    const app = makeApp(oid('q-list-13'));
    const res = await request(app).get('/api/commissions');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Q-list-14] GET / returns application/json', async () => {
    const app = makeApp(oid('q-list-14'));
    const res = await request(app).get('/api/commissions');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Q-list-15] GET / returns application/json', async () => {
    const app = makeApp(oid('q-list-15'));
    const res = await request(app).get('/api/commissions');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Q-list-16] GET / returns application/json', async () => {
    const app = makeApp(oid('q-list-16'));
    const res = await request(app).get('/api/commissions');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Q-list-17] GET / returns application/json', async () => {
    const app = makeApp(oid('q-list-17'));
    const res = await request(app).get('/api/commissions');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Q-list-18] GET / returns application/json', async () => {
    const app = makeApp(oid('q-list-18'));
    const res = await request(app).get('/api/commissions');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Q-list-19] GET / returns application/json', async () => {
    const app = makeApp(oid('q-list-19'));
    const res = await request(app).get('/api/commissions');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Q-sum-0] GET /summary returns application/json', async () => {
    const app = makeApp(oid('q-sum-0'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Q-sum-1] GET /summary returns application/json', async () => {
    const app = makeApp(oid('q-sum-1'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Q-sum-2] GET /summary returns application/json', async () => {
    const app = makeApp(oid('q-sum-2'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Q-sum-3] GET /summary returns application/json', async () => {
    const app = makeApp(oid('q-sum-3'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Q-sum-4] GET /summary returns application/json', async () => {
    const app = makeApp(oid('q-sum-4'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Q-sum-5] GET /summary returns application/json', async () => {
    const app = makeApp(oid('q-sum-5'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Q-sum-6] GET /summary returns application/json', async () => {
    const app = makeApp(oid('q-sum-6'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Q-sum-7] GET /summary returns application/json', async () => {
    const app = makeApp(oid('q-sum-7'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Q-sum-8] GET /summary returns application/json', async () => {
    const app = makeApp(oid('q-sum-8'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Q-sum-9] GET /summary returns application/json', async () => {
    const app = makeApp(oid('q-sum-9'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Q-sum-10] GET /summary returns application/json', async () => {
    const app = makeApp(oid('q-sum-10'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Q-sum-11] GET /summary returns application/json', async () => {
    const app = makeApp(oid('q-sum-11'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Q-sum-12] GET /summary returns application/json', async () => {
    const app = makeApp(oid('q-sum-12'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Q-sum-13] GET /summary returns application/json', async () => {
    const app = makeApp(oid('q-sum-13'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Q-sum-14] GET /summary returns application/json', async () => {
    const app = makeApp(oid('q-sum-14'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Q-sum-15] GET /summary returns application/json', async () => {
    const app = makeApp(oid('q-sum-15'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Q-sum-16] GET /summary returns application/json', async () => {
    const app = makeApp(oid('q-sum-16'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Q-sum-17] GET /summary returns application/json', async () => {
    const app = makeApp(oid('q-sum-17'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Q-sum-18] GET /summary returns application/json', async () => {
    const app = makeApp(oid('q-sum-18'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Q-sum-19] GET /summary returns application/json', async () => {
    const app = makeApp(oid('q-sum-19'));
    const res = await request(app).get('/api/commissions/summary');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Q-id-0] GET /:id returns application/json (known)', async () => {
    const app = makeApp(oid('q-id-0'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0].id;
    const res = await request(app).get('/api/commissions/' + id);
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Q-id-1] GET /:id returns application/json (known)', async () => {
    const app = makeApp(oid('q-id-1'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0].id;
    const res = await request(app).get('/api/commissions/' + id);
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Q-id-2] GET /:id returns application/json (known)', async () => {
    const app = makeApp(oid('q-id-2'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0].id;
    const res = await request(app).get('/api/commissions/' + id);
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Q-id-3] GET /:id returns application/json (known)', async () => {
    const app = makeApp(oid('q-id-3'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0].id;
    const res = await request(app).get('/api/commissions/' + id);
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Q-id-4] GET /:id returns application/json (known)', async () => {
    const app = makeApp(oid('q-id-4'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0].id;
    const res = await request(app).get('/api/commissions/' + id);
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Q-id-5] GET /:id returns application/json (known)', async () => {
    const app = makeApp(oid('q-id-5'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0].id;
    const res = await request(app).get('/api/commissions/' + id);
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Q-id-6] GET /:id returns application/json (known)', async () => {
    const app = makeApp(oid('q-id-6'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0].id;
    const res = await request(app).get('/api/commissions/' + id);
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Q-id-7] GET /:id returns application/json (known)', async () => {
    const app = makeApp(oid('q-id-7'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0].id;
    const res = await request(app).get('/api/commissions/' + id);
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Q-id-8] GET /:id returns application/json (known)', async () => {
    const app = makeApp(oid('q-id-8'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0].id;
    const res = await request(app).get('/api/commissions/' + id);
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Q-id-9] GET /:id returns application/json (known)', async () => {
    const app = makeApp(oid('q-id-9'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0].id;
    const res = await request(app).get('/api/commissions/' + id);
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Q-nf-0] GET /:id returns application/json (404)', async () => {
    const app = makeApp(oid('q-nf-0'));
    const res = await request(app).get('/api/commissions/totally-unknown');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Q-nf-1] GET /:id returns application/json (404)', async () => {
    const app = makeApp(oid('q-nf-1'));
    const res = await request(app).get('/api/commissions/totally-unknown');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Q-nf-2] GET /:id returns application/json (404)', async () => {
    const app = makeApp(oid('q-nf-2'));
    const res = await request(app).get('/api/commissions/totally-unknown');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Q-nf-3] GET /:id returns application/json (404)', async () => {
    const app = makeApp(oid('q-nf-3'));
    const res = await request(app).get('/api/commissions/totally-unknown');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Q-nf-4] GET /:id returns application/json (404)', async () => {
    const app = makeApp(oid('q-nf-4'));
    const res = await request(app).get('/api/commissions/totally-unknown');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Q-nf-5] GET /:id returns application/json (404)', async () => {
    const app = makeApp(oid('q-nf-5'));
    const res = await request(app).get('/api/commissions/totally-unknown');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Q-nf-6] GET /:id returns application/json (404)', async () => {
    const app = makeApp(oid('q-nf-6'));
    const res = await request(app).get('/api/commissions/totally-unknown');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Q-nf-7] GET /:id returns application/json (404)', async () => {
    const app = makeApp(oid('q-nf-7'));
    const res = await request(app).get('/api/commissions/totally-unknown');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Q-nf-8] GET /:id returns application/json (404)', async () => {
    const app = makeApp(oid('q-nf-8'));
    const res = await request(app).get('/api/commissions/totally-unknown');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Q-nf-9] GET /:id returns application/json (404)', async () => {
    const app = makeApp(oid('q-nf-9'));
    const res = await request(app).get('/api/commissions/totally-unknown');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
});

// ─── Suite R: Summary partnerId ──────────────────────────────────────────────
describe('GET /api/commissions/summary — partnerId matches org', () => {
  it('[R-0] summary partnerId equals the requesting organisationId', async () => {
    const id = oid('r-0');
    const app = makeApp(id);
    const res = await request(app).get('/api/commissions/summary');
    expect(res.body.data.partnerId).toBe(id);
  });
  it('[R-1] summary partnerId equals the requesting organisationId', async () => {
    const id = oid('r-1');
    const app = makeApp(id);
    const res = await request(app).get('/api/commissions/summary');
    expect(res.body.data.partnerId).toBe(id);
  });
  it('[R-2] summary partnerId equals the requesting organisationId', async () => {
    const id = oid('r-2');
    const app = makeApp(id);
    const res = await request(app).get('/api/commissions/summary');
    expect(res.body.data.partnerId).toBe(id);
  });
  it('[R-3] summary partnerId equals the requesting organisationId', async () => {
    const id = oid('r-3');
    const app = makeApp(id);
    const res = await request(app).get('/api/commissions/summary');
    expect(res.body.data.partnerId).toBe(id);
  });
  it('[R-4] summary partnerId equals the requesting organisationId', async () => {
    const id = oid('r-4');
    const app = makeApp(id);
    const res = await request(app).get('/api/commissions/summary');
    expect(res.body.data.partnerId).toBe(id);
  });
  it('[R-5] summary partnerId equals the requesting organisationId', async () => {
    const id = oid('r-5');
    const app = makeApp(id);
    const res = await request(app).get('/api/commissions/summary');
    expect(res.body.data.partnerId).toBe(id);
  });
  it('[R-6] summary partnerId equals the requesting organisationId', async () => {
    const id = oid('r-6');
    const app = makeApp(id);
    const res = await request(app).get('/api/commissions/summary');
    expect(res.body.data.partnerId).toBe(id);
  });
  it('[R-7] summary partnerId equals the requesting organisationId', async () => {
    const id = oid('r-7');
    const app = makeApp(id);
    const res = await request(app).get('/api/commissions/summary');
    expect(res.body.data.partnerId).toBe(id);
  });
  it('[R-8] summary partnerId equals the requesting organisationId', async () => {
    const id = oid('r-8');
    const app = makeApp(id);
    const res = await request(app).get('/api/commissions/summary');
    expect(res.body.data.partnerId).toBe(id);
  });
  it('[R-9] summary partnerId equals the requesting organisationId', async () => {
    const id = oid('r-9');
    const app = makeApp(id);
    const res = await request(app).get('/api/commissions/summary');
    expect(res.body.data.partnerId).toBe(id);
  });
  it('[R-10] summary partnerId equals the requesting organisationId', async () => {
    const id = oid('r-10');
    const app = makeApp(id);
    const res = await request(app).get('/api/commissions/summary');
    expect(res.body.data.partnerId).toBe(id);
  });
  it('[R-11] summary partnerId equals the requesting organisationId', async () => {
    const id = oid('r-11');
    const app = makeApp(id);
    const res = await request(app).get('/api/commissions/summary');
    expect(res.body.data.partnerId).toBe(id);
  });
  it('[R-12] summary partnerId equals the requesting organisationId', async () => {
    const id = oid('r-12');
    const app = makeApp(id);
    const res = await request(app).get('/api/commissions/summary');
    expect(res.body.data.partnerId).toBe(id);
  });
  it('[R-13] summary partnerId equals the requesting organisationId', async () => {
    const id = oid('r-13');
    const app = makeApp(id);
    const res = await request(app).get('/api/commissions/summary');
    expect(res.body.data.partnerId).toBe(id);
  });
  it('[R-14] summary partnerId equals the requesting organisationId', async () => {
    const id = oid('r-14');
    const app = makeApp(id);
    const res = await request(app).get('/api/commissions/summary');
    expect(res.body.data.partnerId).toBe(id);
  });
  it('[R-15] summary partnerId equals the requesting organisationId', async () => {
    const id = oid('r-15');
    const app = makeApp(id);
    const res = await request(app).get('/api/commissions/summary');
    expect(res.body.data.partnerId).toBe(id);
  });
  it('[R-16] summary partnerId equals the requesting organisationId', async () => {
    const id = oid('r-16');
    const app = makeApp(id);
    const res = await request(app).get('/api/commissions/summary');
    expect(res.body.data.partnerId).toBe(id);
  });
  it('[R-17] summary partnerId equals the requesting organisationId', async () => {
    const id = oid('r-17');
    const app = makeApp(id);
    const res = await request(app).get('/api/commissions/summary');
    expect(res.body.data.partnerId).toBe(id);
  });
  it('[R-18] summary partnerId equals the requesting organisationId', async () => {
    const id = oid('r-18');
    const app = makeApp(id);
    const res = await request(app).get('/api/commissions/summary');
    expect(res.body.data.partnerId).toBe(id);
  });
  it('[R-19] summary partnerId equals the requesting organisationId', async () => {
    const id = oid('r-19');
    const app = makeApp(id);
    const res = await request(app).get('/api/commissions/summary');
    expect(res.body.data.partnerId).toBe(id);
  });
  it('[R-20] summary partnerId equals the requesting organisationId', async () => {
    const id = oid('r-20');
    const app = makeApp(id);
    const res = await request(app).get('/api/commissions/summary');
    expect(res.body.data.partnerId).toBe(id);
  });
  it('[R-21] summary partnerId equals the requesting organisationId', async () => {
    const id = oid('r-21');
    const app = makeApp(id);
    const res = await request(app).get('/api/commissions/summary');
    expect(res.body.data.partnerId).toBe(id);
  });
  it('[R-22] summary partnerId equals the requesting organisationId', async () => {
    const id = oid('r-22');
    const app = makeApp(id);
    const res = await request(app).get('/api/commissions/summary');
    expect(res.body.data.partnerId).toBe(id);
  });
  it('[R-23] summary partnerId equals the requesting organisationId', async () => {
    const id = oid('r-23');
    const app = makeApp(id);
    const res = await request(app).get('/api/commissions/summary');
    expect(res.body.data.partnerId).toBe(id);
  });
  it('[R-24] summary partnerId equals the requesting organisationId', async () => {
    const id = oid('r-24');
    const app = makeApp(id);
    const res = await request(app).get('/api/commissions/summary');
    expect(res.body.data.partnerId).toBe(id);
  });
  it('[R-25] summary partnerId equals the requesting organisationId', async () => {
    const id = oid('r-25');
    const app = makeApp(id);
    const res = await request(app).get('/api/commissions/summary');
    expect(res.body.data.partnerId).toBe(id);
  });
  it('[R-26] summary partnerId equals the requesting organisationId', async () => {
    const id = oid('r-26');
    const app = makeApp(id);
    const res = await request(app).get('/api/commissions/summary');
    expect(res.body.data.partnerId).toBe(id);
  });
  it('[R-27] summary partnerId equals the requesting organisationId', async () => {
    const id = oid('r-27');
    const app = makeApp(id);
    const res = await request(app).get('/api/commissions/summary');
    expect(res.body.data.partnerId).toBe(id);
  });
  it('[R-28] summary partnerId equals the requesting organisationId', async () => {
    const id = oid('r-28');
    const app = makeApp(id);
    const res = await request(app).get('/api/commissions/summary');
    expect(res.body.data.partnerId).toBe(id);
  });
  it('[R-29] summary partnerId equals the requesting organisationId', async () => {
    const id = oid('r-29');
    const app = makeApp(id);
    const res = await request(app).get('/api/commissions/summary');
    expect(res.body.data.partnerId).toBe(id);
  });
});

// ─── Suite S: Combined filter edge cases ─────────────────────────────────────
describe('GET /api/commissions — combined filter edge cases', () => {
  it('[S-a-0] PAID + 2025-11 returns exactly 1 record', async () => {
    const app = makeApp(oid('sa-0'));
    const res = await request(app).get('/api/commissions?status=PAID&period=2025-11');
    expect(res.body.data).toHaveLength(1);
  });
  it('[S-a-1] PAID + 2025-11 returns exactly 1 record', async () => {
    const app = makeApp(oid('sa-1'));
    const res = await request(app).get('/api/commissions?status=PAID&period=2025-11');
    expect(res.body.data).toHaveLength(1);
  });
  it('[S-a-2] PAID + 2025-11 returns exactly 1 record', async () => {
    const app = makeApp(oid('sa-2'));
    const res = await request(app).get('/api/commissions?status=PAID&period=2025-11');
    expect(res.body.data).toHaveLength(1);
  });
  it('[S-a-3] PAID + 2025-11 returns exactly 1 record', async () => {
    const app = makeApp(oid('sa-3'));
    const res = await request(app).get('/api/commissions?status=PAID&period=2025-11');
    expect(res.body.data).toHaveLength(1);
  });
  it('[S-a-4] PAID + 2025-11 returns exactly 1 record', async () => {
    const app = makeApp(oid('sa-4'));
    const res = await request(app).get('/api/commissions?status=PAID&period=2025-11');
    expect(res.body.data).toHaveLength(1);
  });
  it('[S-a-5] PAID + 2025-11 returns exactly 1 record', async () => {
    const app = makeApp(oid('sa-5'));
    const res = await request(app).get('/api/commissions?status=PAID&period=2025-11');
    expect(res.body.data).toHaveLength(1);
  });
  it('[S-a-6] PAID + 2025-11 returns exactly 1 record', async () => {
    const app = makeApp(oid('sa-6'));
    const res = await request(app).get('/api/commissions?status=PAID&period=2025-11');
    expect(res.body.data).toHaveLength(1);
  });
  it('[S-a-7] PAID + 2025-11 returns exactly 1 record', async () => {
    const app = makeApp(oid('sa-7'));
    const res = await request(app).get('/api/commissions?status=PAID&period=2025-11');
    expect(res.body.data).toHaveLength(1);
  });
  it('[S-a-8] PAID + 2025-11 returns exactly 1 record', async () => {
    const app = makeApp(oid('sa-8'));
    const res = await request(app).get('/api/commissions?status=PAID&period=2025-11');
    expect(res.body.data).toHaveLength(1);
  });
  it('[S-a-9] PAID + 2025-11 returns exactly 1 record', async () => {
    const app = makeApp(oid('sa-9'));
    const res = await request(app).get('/api/commissions?status=PAID&period=2025-11');
    expect(res.body.data).toHaveLength(1);
  });
  it('[S-a-10] PAID + 2025-11 returns exactly 1 record', async () => {
    const app = makeApp(oid('sa-10'));
    const res = await request(app).get('/api/commissions?status=PAID&period=2025-11');
    expect(res.body.data).toHaveLength(1);
  });
  it('[S-a-11] PAID + 2025-11 returns exactly 1 record', async () => {
    const app = makeApp(oid('sa-11'));
    const res = await request(app).get('/api/commissions?status=PAID&period=2025-11');
    expect(res.body.data).toHaveLength(1);
  });
  it('[S-a-12] PAID + 2025-11 returns exactly 1 record', async () => {
    const app = makeApp(oid('sa-12'));
    const res = await request(app).get('/api/commissions?status=PAID&period=2025-11');
    expect(res.body.data).toHaveLength(1);
  });
  it('[S-a-13] PAID + 2025-11 returns exactly 1 record', async () => {
    const app = makeApp(oid('sa-13'));
    const res = await request(app).get('/api/commissions?status=PAID&period=2025-11');
    expect(res.body.data).toHaveLength(1);
  });
  it('[S-a-14] PAID + 2025-11 returns exactly 1 record', async () => {
    const app = makeApp(oid('sa-14'));
    const res = await request(app).get('/api/commissions?status=PAID&period=2025-11');
    expect(res.body.data).toHaveLength(1);
  });
  it('[S-b-0] APPROVED + 2025-10 returns empty array', async () => {
    const app = makeApp(oid('sb-0'));
    const res = await request(app).get('/api/commissions?status=APPROVED&period=2025-10');
    expect(res.body.data).toHaveLength(0);
  });
  it('[S-b-1] APPROVED + 2025-10 returns empty array', async () => {
    const app = makeApp(oid('sb-1'));
    const res = await request(app).get('/api/commissions?status=APPROVED&period=2025-10');
    expect(res.body.data).toHaveLength(0);
  });
  it('[S-b-2] APPROVED + 2025-10 returns empty array', async () => {
    const app = makeApp(oid('sb-2'));
    const res = await request(app).get('/api/commissions?status=APPROVED&period=2025-10');
    expect(res.body.data).toHaveLength(0);
  });
  it('[S-b-3] APPROVED + 2025-10 returns empty array', async () => {
    const app = makeApp(oid('sb-3'));
    const res = await request(app).get('/api/commissions?status=APPROVED&period=2025-10');
    expect(res.body.data).toHaveLength(0);
  });
  it('[S-b-4] APPROVED + 2025-10 returns empty array', async () => {
    const app = makeApp(oid('sb-4'));
    const res = await request(app).get('/api/commissions?status=APPROVED&period=2025-10');
    expect(res.body.data).toHaveLength(0);
  });
  it('[S-b-5] APPROVED + 2025-10 returns empty array', async () => {
    const app = makeApp(oid('sb-5'));
    const res = await request(app).get('/api/commissions?status=APPROVED&period=2025-10');
    expect(res.body.data).toHaveLength(0);
  });
  it('[S-b-6] APPROVED + 2025-10 returns empty array', async () => {
    const app = makeApp(oid('sb-6'));
    const res = await request(app).get('/api/commissions?status=APPROVED&period=2025-10');
    expect(res.body.data).toHaveLength(0);
  });
  it('[S-b-7] APPROVED + 2025-10 returns empty array', async () => {
    const app = makeApp(oid('sb-7'));
    const res = await request(app).get('/api/commissions?status=APPROVED&period=2025-10');
    expect(res.body.data).toHaveLength(0);
  });
  it('[S-b-8] APPROVED + 2025-10 returns empty array', async () => {
    const app = makeApp(oid('sb-8'));
    const res = await request(app).get('/api/commissions?status=APPROVED&period=2025-10');
    expect(res.body.data).toHaveLength(0);
  });
  it('[S-b-9] APPROVED + 2025-10 returns empty array', async () => {
    const app = makeApp(oid('sb-9'));
    const res = await request(app).get('/api/commissions?status=APPROVED&period=2025-10');
    expect(res.body.data).toHaveLength(0);
  });
  it('[S-b-10] APPROVED + 2025-10 returns empty array', async () => {
    const app = makeApp(oid('sb-10'));
    const res = await request(app).get('/api/commissions?status=APPROVED&period=2025-10');
    expect(res.body.data).toHaveLength(0);
  });
  it('[S-b-11] APPROVED + 2025-10 returns empty array', async () => {
    const app = makeApp(oid('sb-11'));
    const res = await request(app).get('/api/commissions?status=APPROVED&period=2025-10');
    expect(res.body.data).toHaveLength(0);
  });
  it('[S-b-12] APPROVED + 2025-10 returns empty array', async () => {
    const app = makeApp(oid('sb-12'));
    const res = await request(app).get('/api/commissions?status=APPROVED&period=2025-10');
    expect(res.body.data).toHaveLength(0);
  });
  it('[S-b-13] APPROVED + 2025-10 returns empty array', async () => {
    const app = makeApp(oid('sb-13'));
    const res = await request(app).get('/api/commissions?status=APPROVED&period=2025-10');
    expect(res.body.data).toHaveLength(0);
  });
  it('[S-b-14] APPROVED + 2025-10 returns empty array', async () => {
    const app = makeApp(oid('sb-14'));
    const res = await request(app).get('/api/commissions?status=APPROVED&period=2025-10');
    expect(res.body.data).toHaveLength(0);
  });
  it('[S-c-0] PENDING + 2026-02 returns exactly 1 record', async () => {
    const app = makeApp(oid('sc-0'));
    const res = await request(app).get('/api/commissions?status=PENDING&period=2026-02');
    expect(res.body.data).toHaveLength(1);
  });
  it('[S-c-1] PENDING + 2026-02 returns exactly 1 record', async () => {
    const app = makeApp(oid('sc-1'));
    const res = await request(app).get('/api/commissions?status=PENDING&period=2026-02');
    expect(res.body.data).toHaveLength(1);
  });
  it('[S-c-2] PENDING + 2026-02 returns exactly 1 record', async () => {
    const app = makeApp(oid('sc-2'));
    const res = await request(app).get('/api/commissions?status=PENDING&period=2026-02');
    expect(res.body.data).toHaveLength(1);
  });
  it('[S-c-3] PENDING + 2026-02 returns exactly 1 record', async () => {
    const app = makeApp(oid('sc-3'));
    const res = await request(app).get('/api/commissions?status=PENDING&period=2026-02');
    expect(res.body.data).toHaveLength(1);
  });
  it('[S-c-4] PENDING + 2026-02 returns exactly 1 record', async () => {
    const app = makeApp(oid('sc-4'));
    const res = await request(app).get('/api/commissions?status=PENDING&period=2026-02');
    expect(res.body.data).toHaveLength(1);
  });
  it('[S-c-5] PENDING + 2026-02 returns exactly 1 record', async () => {
    const app = makeApp(oid('sc-5'));
    const res = await request(app).get('/api/commissions?status=PENDING&period=2026-02');
    expect(res.body.data).toHaveLength(1);
  });
  it('[S-c-6] PENDING + 2026-02 returns exactly 1 record', async () => {
    const app = makeApp(oid('sc-6'));
    const res = await request(app).get('/api/commissions?status=PENDING&period=2026-02');
    expect(res.body.data).toHaveLength(1);
  });
  it('[S-c-7] PENDING + 2026-02 returns exactly 1 record', async () => {
    const app = makeApp(oid('sc-7'));
    const res = await request(app).get('/api/commissions?status=PENDING&period=2026-02');
    expect(res.body.data).toHaveLength(1);
  });
  it('[S-c-8] PENDING + 2026-02 returns exactly 1 record', async () => {
    const app = makeApp(oid('sc-8'));
    const res = await request(app).get('/api/commissions?status=PENDING&period=2026-02');
    expect(res.body.data).toHaveLength(1);
  });
  it('[S-c-9] PENDING + 2026-02 returns exactly 1 record', async () => {
    const app = makeApp(oid('sc-9'));
    const res = await request(app).get('/api/commissions?status=PENDING&period=2026-02');
    expect(res.body.data).toHaveLength(1);
  });
  it('[S-c-10] PENDING + 2026-02 returns exactly 1 record', async () => {
    const app = makeApp(oid('sc-10'));
    const res = await request(app).get('/api/commissions?status=PENDING&period=2026-02');
    expect(res.body.data).toHaveLength(1);
  });
  it('[S-c-11] PENDING + 2026-02 returns exactly 1 record', async () => {
    const app = makeApp(oid('sc-11'));
    const res = await request(app).get('/api/commissions?status=PENDING&period=2026-02');
    expect(res.body.data).toHaveLength(1);
  });
  it('[S-c-12] PENDING + 2026-02 returns exactly 1 record', async () => {
    const app = makeApp(oid('sc-12'));
    const res = await request(app).get('/api/commissions?status=PENDING&period=2026-02');
    expect(res.body.data).toHaveLength(1);
  });
  it('[S-c-13] PENDING + 2026-02 returns exactly 1 record', async () => {
    const app = makeApp(oid('sc-13'));
    const res = await request(app).get('/api/commissions?status=PENDING&period=2026-02');
    expect(res.body.data).toHaveLength(1);
  });
  it('[S-c-14] PENDING + 2026-02 returns exactly 1 record', async () => {
    const app = makeApp(oid('sc-14'));
    const res = await request(app).get('/api/commissions?status=PENDING&period=2026-02');
    expect(res.body.data).toHaveLength(1);
  });
  it('[S-d-0] DISPUTED + 2025-10 returns empty array', async () => {
    const app = makeApp(oid('sd-0'));
    const res = await request(app).get('/api/commissions?status=DISPUTED&period=2025-10');
    expect(res.body.data).toHaveLength(0);
  });
  it('[S-d-1] DISPUTED + 2025-10 returns empty array', async () => {
    const app = makeApp(oid('sd-1'));
    const res = await request(app).get('/api/commissions?status=DISPUTED&period=2025-10');
    expect(res.body.data).toHaveLength(0);
  });
  it('[S-d-2] DISPUTED + 2025-10 returns empty array', async () => {
    const app = makeApp(oid('sd-2'));
    const res = await request(app).get('/api/commissions?status=DISPUTED&period=2025-10');
    expect(res.body.data).toHaveLength(0);
  });
  it('[S-d-3] DISPUTED + 2025-10 returns empty array', async () => {
    const app = makeApp(oid('sd-3'));
    const res = await request(app).get('/api/commissions?status=DISPUTED&period=2025-10');
    expect(res.body.data).toHaveLength(0);
  });
  it('[S-d-4] DISPUTED + 2025-10 returns empty array', async () => {
    const app = makeApp(oid('sd-4'));
    const res = await request(app).get('/api/commissions?status=DISPUTED&period=2025-10');
    expect(res.body.data).toHaveLength(0);
  });
  it('[S-d-5] DISPUTED + 2025-10 returns empty array', async () => {
    const app = makeApp(oid('sd-5'));
    const res = await request(app).get('/api/commissions?status=DISPUTED&period=2025-10');
    expect(res.body.data).toHaveLength(0);
  });
  it('[S-d-6] DISPUTED + 2025-10 returns empty array', async () => {
    const app = makeApp(oid('sd-6'));
    const res = await request(app).get('/api/commissions?status=DISPUTED&period=2025-10');
    expect(res.body.data).toHaveLength(0);
  });
  it('[S-d-7] DISPUTED + 2025-10 returns empty array', async () => {
    const app = makeApp(oid('sd-7'));
    const res = await request(app).get('/api/commissions?status=DISPUTED&period=2025-10');
    expect(res.body.data).toHaveLength(0);
  });
  it('[S-d-8] DISPUTED + 2025-10 returns empty array', async () => {
    const app = makeApp(oid('sd-8'));
    const res = await request(app).get('/api/commissions?status=DISPUTED&period=2025-10');
    expect(res.body.data).toHaveLength(0);
  });
  it('[S-d-9] DISPUTED + 2025-10 returns empty array', async () => {
    const app = makeApp(oid('sd-9'));
    const res = await request(app).get('/api/commissions?status=DISPUTED&period=2025-10');
    expect(res.body.data).toHaveLength(0);
  });
  it('[S-d-10] DISPUTED + 2025-10 returns empty array', async () => {
    const app = makeApp(oid('sd-10'));
    const res = await request(app).get('/api/commissions?status=DISPUTED&period=2025-10');
    expect(res.body.data).toHaveLength(0);
  });
  it('[S-d-11] DISPUTED + 2025-10 returns empty array', async () => {
    const app = makeApp(oid('sd-11'));
    const res = await request(app).get('/api/commissions?status=DISPUTED&period=2025-10');
    expect(res.body.data).toHaveLength(0);
  });
  it('[S-d-12] DISPUTED + 2025-10 returns empty array', async () => {
    const app = makeApp(oid('sd-12'));
    const res = await request(app).get('/api/commissions?status=DISPUTED&period=2025-10');
    expect(res.body.data).toHaveLength(0);
  });
  it('[S-d-13] DISPUTED + 2025-10 returns empty array', async () => {
    const app = makeApp(oid('sd-13'));
    const res = await request(app).get('/api/commissions?status=DISPUTED&period=2025-10');
    expect(res.body.data).toHaveLength(0);
  });
  it('[S-d-14] DISPUTED + 2025-10 returns empty array', async () => {
    const app = makeApp(oid('sd-14'));
    const res = await request(app).get('/api/commissions?status=DISPUTED&period=2025-10');
    expect(res.body.data).toHaveLength(0);
  });
});

// ─── Suite T: Error response shape ───────────────────────────────────────────
describe('Error response shape', () => {
  it('[T-0] 404 has success:false', async () => {
    const app = makeApp(oid('t-0')); const res = await request(app).get('/api/commissions/invalid-id-t0'); expect(res.body.success).toBe(false);
  });
  it('[T-1] 404 has error object', async () => {
    const app = makeApp(oid('t-1')); const res = await request(app).get('/api/commissions/invalid-id-t1'); expect(res.body).toHaveProperty('error');
  });
  it('[T-2] 404 error.code is NOT_FOUND', async () => {
    const app = makeApp(oid('t-2')); const res = await request(app).get('/api/commissions/invalid-id-t2'); expect(res.body.error.code).toBe('NOT_FOUND');
  });
  it('[T-3] 403 has success:false', async () => {
    const appA = makeApp(oid('t-3a')); const appB = makeApp(oid('t-3b')); const list = await request(appB).get('/api/commissions'); const id = list.body.data[0].id; const res = await request(appA).get('/api/commissions/' + id); expect(res.body.success).toBe(false);
  });
  it('[T-4] 403 has error object', async () => {
    const appA = makeApp(oid('t-4a')); const appB = makeApp(oid('t-4b')); const list = await request(appB).get('/api/commissions'); const id = list.body.data[0].id; const res = await request(appA).get('/api/commissions/' + id); expect(res.body).toHaveProperty('error');
  });
  it('[T-5] 403 error.code is FORBIDDEN', async () => {
    const appA = makeApp(oid('t-5a')); const appB = makeApp(oid('t-5b')); const list = await request(appB).get('/api/commissions'); const id = list.body.data[0].id; const res = await request(appA).get('/api/commissions/' + id); expect(res.body.error.code).toBe('FORBIDDEN');
  });
  it('[T-6] 404 stable for unknown id 6', async () => {
    const app = makeApp(oid('t-6'));
    const res = await request(app).get('/api/commissions/totally-unknown-6');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
  it('[T-7] 404 stable for unknown id 7', async () => {
    const app = makeApp(oid('t-7'));
    const res = await request(app).get('/api/commissions/totally-unknown-7');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
  it('[T-8] 404 stable for unknown id 8', async () => {
    const app = makeApp(oid('t-8'));
    const res = await request(app).get('/api/commissions/totally-unknown-8');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
  it('[T-9] 404 stable for unknown id 9', async () => {
    const app = makeApp(oid('t-9'));
    const res = await request(app).get('/api/commissions/totally-unknown-9');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
  it('[T-10] 404 stable for unknown id 10', async () => {
    const app = makeApp(oid('t-10'));
    const res = await request(app).get('/api/commissions/totally-unknown-10');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
  it('[T-11] 404 stable for unknown id 11', async () => {
    const app = makeApp(oid('t-11'));
    const res = await request(app).get('/api/commissions/totally-unknown-11');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
  it('[T-12] 404 stable for unknown id 12', async () => {
    const app = makeApp(oid('t-12'));
    const res = await request(app).get('/api/commissions/totally-unknown-12');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
  it('[T-13] 404 stable for unknown id 13', async () => {
    const app = makeApp(oid('t-13'));
    const res = await request(app).get('/api/commissions/totally-unknown-13');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
  it('[T-14] 404 stable for unknown id 14', async () => {
    const app = makeApp(oid('t-14'));
    const res = await request(app).get('/api/commissions/totally-unknown-14');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
  it('[T-15] 404 stable for unknown id 15', async () => {
    const app = makeApp(oid('t-15'));
    const res = await request(app).get('/api/commissions/totally-unknown-15');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
  it('[T-16] 404 stable for unknown id 16', async () => {
    const app = makeApp(oid('t-16'));
    const res = await request(app).get('/api/commissions/totally-unknown-16');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
  it('[T-17] 404 stable for unknown id 17', async () => {
    const app = makeApp(oid('t-17'));
    const res = await request(app).get('/api/commissions/totally-unknown-17');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
  it('[T-18] 404 stable for unknown id 18', async () => {
    const app = makeApp(oid('t-18'));
    const res = await request(app).get('/api/commissions/totally-unknown-18');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
  it('[T-19] 404 stable for unknown id 19', async () => {
    const app = makeApp(oid('t-19'));
    const res = await request(app).get('/api/commissions/totally-unknown-19');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
  it('[T-20] 404 stable for unknown id 20', async () => {
    const app = makeApp(oid('t-20'));
    const res = await request(app).get('/api/commissions/totally-unknown-20');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
  it('[T-21] 404 stable for unknown id 21', async () => {
    const app = makeApp(oid('t-21'));
    const res = await request(app).get('/api/commissions/totally-unknown-21');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
  it('[T-22] 404 stable for unknown id 22', async () => {
    const app = makeApp(oid('t-22'));
    const res = await request(app).get('/api/commissions/totally-unknown-22');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
  it('[T-23] 404 stable for unknown id 23', async () => {
    const app = makeApp(oid('t-23'));
    const res = await request(app).get('/api/commissions/totally-unknown-23');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
  it('[T-24] 404 stable for unknown id 24', async () => {
    const app = makeApp(oid('t-24'));
    const res = await request(app).get('/api/commissions/totally-unknown-24');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
  it('[T-25] 404 stable for unknown id 25', async () => {
    const app = makeApp(oid('t-25'));
    const res = await request(app).get('/api/commissions/totally-unknown-25');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
  it('[T-26] 404 stable for unknown id 26', async () => {
    const app = makeApp(oid('t-26'));
    const res = await request(app).get('/api/commissions/totally-unknown-26');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
  it('[T-27] 404 stable for unknown id 27', async () => {
    const app = makeApp(oid('t-27'));
    const res = await request(app).get('/api/commissions/totally-unknown-27');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
  it('[T-28] 404 stable for unknown id 28', async () => {
    const app = makeApp(oid('t-28'));
    const res = await request(app).get('/api/commissions/totally-unknown-28');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
  it('[T-29] 404 stable for unknown id 29', async () => {
    const app = makeApp(oid('t-29'));
    const res = await request(app).get('/api/commissions/totally-unknown-29');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

// ─── Suite U: Summary totalEarned consistency ─────────────────────────────────
describe('Summary totalEarned = sum of all commissionAmounts', () => {
  it('[U-0] totalEarned equals sum of commissionAmounts in list', async () => {
    const app = makeApp(oid('u-0'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumFromList = listRes.body.data.reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalEarned).toBe(sumFromList);
  });
  it('[U-1] totalEarned equals sum of commissionAmounts in list', async () => {
    const app = makeApp(oid('u-1'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumFromList = listRes.body.data.reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalEarned).toBe(sumFromList);
  });
  it('[U-2] totalEarned equals sum of commissionAmounts in list', async () => {
    const app = makeApp(oid('u-2'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumFromList = listRes.body.data.reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalEarned).toBe(sumFromList);
  });
  it('[U-3] totalEarned equals sum of commissionAmounts in list', async () => {
    const app = makeApp(oid('u-3'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumFromList = listRes.body.data.reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalEarned).toBe(sumFromList);
  });
  it('[U-4] totalEarned equals sum of commissionAmounts in list', async () => {
    const app = makeApp(oid('u-4'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumFromList = listRes.body.data.reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalEarned).toBe(sumFromList);
  });
  it('[U-5] totalEarned equals sum of commissionAmounts in list', async () => {
    const app = makeApp(oid('u-5'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumFromList = listRes.body.data.reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalEarned).toBe(sumFromList);
  });
  it('[U-6] totalEarned equals sum of commissionAmounts in list', async () => {
    const app = makeApp(oid('u-6'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumFromList = listRes.body.data.reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalEarned).toBe(sumFromList);
  });
  it('[U-7] totalEarned equals sum of commissionAmounts in list', async () => {
    const app = makeApp(oid('u-7'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumFromList = listRes.body.data.reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalEarned).toBe(sumFromList);
  });
  it('[U-8] totalEarned equals sum of commissionAmounts in list', async () => {
    const app = makeApp(oid('u-8'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumFromList = listRes.body.data.reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalEarned).toBe(sumFromList);
  });
  it('[U-9] totalEarned equals sum of commissionAmounts in list', async () => {
    const app = makeApp(oid('u-9'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumFromList = listRes.body.data.reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalEarned).toBe(sumFromList);
  });
  it('[U-10] totalEarned equals sum of commissionAmounts in list', async () => {
    const app = makeApp(oid('u-10'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumFromList = listRes.body.data.reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalEarned).toBe(sumFromList);
  });
  it('[U-11] totalEarned equals sum of commissionAmounts in list', async () => {
    const app = makeApp(oid('u-11'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumFromList = listRes.body.data.reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalEarned).toBe(sumFromList);
  });
  it('[U-12] totalEarned equals sum of commissionAmounts in list', async () => {
    const app = makeApp(oid('u-12'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumFromList = listRes.body.data.reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalEarned).toBe(sumFromList);
  });
  it('[U-13] totalEarned equals sum of commissionAmounts in list', async () => {
    const app = makeApp(oid('u-13'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumFromList = listRes.body.data.reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalEarned).toBe(sumFromList);
  });
  it('[U-14] totalEarned equals sum of commissionAmounts in list', async () => {
    const app = makeApp(oid('u-14'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumFromList = listRes.body.data.reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalEarned).toBe(sumFromList);
  });
  it('[U-15] totalEarned equals sum of commissionAmounts in list', async () => {
    const app = makeApp(oid('u-15'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumFromList = listRes.body.data.reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalEarned).toBe(sumFromList);
  });
  it('[U-16] totalEarned equals sum of commissionAmounts in list', async () => {
    const app = makeApp(oid('u-16'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumFromList = listRes.body.data.reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalEarned).toBe(sumFromList);
  });
  it('[U-17] totalEarned equals sum of commissionAmounts in list', async () => {
    const app = makeApp(oid('u-17'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumFromList = listRes.body.data.reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalEarned).toBe(sumFromList);
  });
  it('[U-18] totalEarned equals sum of commissionAmounts in list', async () => {
    const app = makeApp(oid('u-18'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumFromList = listRes.body.data.reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalEarned).toBe(sumFromList);
  });
  it('[U-19] totalEarned equals sum of commissionAmounts in list', async () => {
    const app = makeApp(oid('u-19'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumFromList = listRes.body.data.reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalEarned).toBe(sumFromList);
  });
  it('[U-20] totalEarned equals sum of commissionAmounts in list', async () => {
    const app = makeApp(oid('u-20'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumFromList = listRes.body.data.reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalEarned).toBe(sumFromList);
  });
  it('[U-21] totalEarned equals sum of commissionAmounts in list', async () => {
    const app = makeApp(oid('u-21'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumFromList = listRes.body.data.reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalEarned).toBe(sumFromList);
  });
  it('[U-22] totalEarned equals sum of commissionAmounts in list', async () => {
    const app = makeApp(oid('u-22'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumFromList = listRes.body.data.reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalEarned).toBe(sumFromList);
  });
  it('[U-23] totalEarned equals sum of commissionAmounts in list', async () => {
    const app = makeApp(oid('u-23'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumFromList = listRes.body.data.reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalEarned).toBe(sumFromList);
  });
  it('[U-24] totalEarned equals sum of commissionAmounts in list', async () => {
    const app = makeApp(oid('u-24'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumFromList = listRes.body.data.reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalEarned).toBe(sumFromList);
  });
  it('[U-25] totalEarned equals sum of commissionAmounts in list', async () => {
    const app = makeApp(oid('u-25'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumFromList = listRes.body.data.reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalEarned).toBe(sumFromList);
  });
  it('[U-26] totalEarned equals sum of commissionAmounts in list', async () => {
    const app = makeApp(oid('u-26'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumFromList = listRes.body.data.reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalEarned).toBe(sumFromList);
  });
  it('[U-27] totalEarned equals sum of commissionAmounts in list', async () => {
    const app = makeApp(oid('u-27'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumFromList = listRes.body.data.reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalEarned).toBe(sumFromList);
  });
  it('[U-28] totalEarned equals sum of commissionAmounts in list', async () => {
    const app = makeApp(oid('u-28'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumFromList = listRes.body.data.reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalEarned).toBe(sumFromList);
  });
  it('[U-29] totalEarned equals sum of commissionAmounts in list', async () => {
    const app = makeApp(oid('u-29'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumFromList = listRes.body.data.reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalEarned).toBe(sumFromList);
  });
  it('[U-30] totalEarned equals sum of commissionAmounts in list', async () => {
    const app = makeApp(oid('u-30'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumFromList = listRes.body.data.reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalEarned).toBe(sumFromList);
  });
  it('[U-31] totalEarned equals sum of commissionAmounts in list', async () => {
    const app = makeApp(oid('u-31'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumFromList = listRes.body.data.reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalEarned).toBe(sumFromList);
  });
  it('[U-32] totalEarned equals sum of commissionAmounts in list', async () => {
    const app = makeApp(oid('u-32'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumFromList = listRes.body.data.reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalEarned).toBe(sumFromList);
  });
  it('[U-33] totalEarned equals sum of commissionAmounts in list', async () => {
    const app = makeApp(oid('u-33'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumFromList = listRes.body.data.reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalEarned).toBe(sumFromList);
  });
  it('[U-34] totalEarned equals sum of commissionAmounts in list', async () => {
    const app = makeApp(oid('u-34'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumFromList = listRes.body.data.reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalEarned).toBe(sumFromList);
  });
  it('[U-35] totalEarned equals sum of commissionAmounts in list', async () => {
    const app = makeApp(oid('u-35'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumFromList = listRes.body.data.reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalEarned).toBe(sumFromList);
  });
  it('[U-36] totalEarned equals sum of commissionAmounts in list', async () => {
    const app = makeApp(oid('u-36'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumFromList = listRes.body.data.reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalEarned).toBe(sumFromList);
  });
  it('[U-37] totalEarned equals sum of commissionAmounts in list', async () => {
    const app = makeApp(oid('u-37'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumFromList = listRes.body.data.reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalEarned).toBe(sumFromList);
  });
  it('[U-38] totalEarned equals sum of commissionAmounts in list', async () => {
    const app = makeApp(oid('u-38'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumFromList = listRes.body.data.reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalEarned).toBe(sumFromList);
  });
  it('[U-39] totalEarned equals sum of commissionAmounts in list', async () => {
    const app = makeApp(oid('u-39'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumFromList = listRes.body.data.reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalEarned).toBe(sumFromList);
  });
});

// ─── Suite V: Summary totalPaid consistency ───────────────────────────────────
describe('Summary totalPaid = sum of PAID commissionAmounts', () => {
  it('[V-0] totalPaid equals sum of PAID records', async () => {
    const app = makeApp(oid('v-0'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumPaid = listRes.body.data.filter((r: any) => r.status === 'PAID').reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalPaid).toBe(sumPaid);
  });
  it('[V-1] totalPaid equals sum of PAID records', async () => {
    const app = makeApp(oid('v-1'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumPaid = listRes.body.data.filter((r: any) => r.status === 'PAID').reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalPaid).toBe(sumPaid);
  });
  it('[V-2] totalPaid equals sum of PAID records', async () => {
    const app = makeApp(oid('v-2'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumPaid = listRes.body.data.filter((r: any) => r.status === 'PAID').reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalPaid).toBe(sumPaid);
  });
  it('[V-3] totalPaid equals sum of PAID records', async () => {
    const app = makeApp(oid('v-3'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumPaid = listRes.body.data.filter((r: any) => r.status === 'PAID').reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalPaid).toBe(sumPaid);
  });
  it('[V-4] totalPaid equals sum of PAID records', async () => {
    const app = makeApp(oid('v-4'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumPaid = listRes.body.data.filter((r: any) => r.status === 'PAID').reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalPaid).toBe(sumPaid);
  });
  it('[V-5] totalPaid equals sum of PAID records', async () => {
    const app = makeApp(oid('v-5'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumPaid = listRes.body.data.filter((r: any) => r.status === 'PAID').reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalPaid).toBe(sumPaid);
  });
  it('[V-6] totalPaid equals sum of PAID records', async () => {
    const app = makeApp(oid('v-6'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumPaid = listRes.body.data.filter((r: any) => r.status === 'PAID').reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalPaid).toBe(sumPaid);
  });
  it('[V-7] totalPaid equals sum of PAID records', async () => {
    const app = makeApp(oid('v-7'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumPaid = listRes.body.data.filter((r: any) => r.status === 'PAID').reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalPaid).toBe(sumPaid);
  });
  it('[V-8] totalPaid equals sum of PAID records', async () => {
    const app = makeApp(oid('v-8'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumPaid = listRes.body.data.filter((r: any) => r.status === 'PAID').reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalPaid).toBe(sumPaid);
  });
  it('[V-9] totalPaid equals sum of PAID records', async () => {
    const app = makeApp(oid('v-9'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumPaid = listRes.body.data.filter((r: any) => r.status === 'PAID').reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalPaid).toBe(sumPaid);
  });
  it('[V-10] totalPaid equals sum of PAID records', async () => {
    const app = makeApp(oid('v-10'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumPaid = listRes.body.data.filter((r: any) => r.status === 'PAID').reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalPaid).toBe(sumPaid);
  });
  it('[V-11] totalPaid equals sum of PAID records', async () => {
    const app = makeApp(oid('v-11'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumPaid = listRes.body.data.filter((r: any) => r.status === 'PAID').reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalPaid).toBe(sumPaid);
  });
  it('[V-12] totalPaid equals sum of PAID records', async () => {
    const app = makeApp(oid('v-12'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumPaid = listRes.body.data.filter((r: any) => r.status === 'PAID').reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalPaid).toBe(sumPaid);
  });
  it('[V-13] totalPaid equals sum of PAID records', async () => {
    const app = makeApp(oid('v-13'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumPaid = listRes.body.data.filter((r: any) => r.status === 'PAID').reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalPaid).toBe(sumPaid);
  });
  it('[V-14] totalPaid equals sum of PAID records', async () => {
    const app = makeApp(oid('v-14'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumPaid = listRes.body.data.filter((r: any) => r.status === 'PAID').reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalPaid).toBe(sumPaid);
  });
  it('[V-15] totalPaid equals sum of PAID records', async () => {
    const app = makeApp(oid('v-15'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumPaid = listRes.body.data.filter((r: any) => r.status === 'PAID').reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalPaid).toBe(sumPaid);
  });
  it('[V-16] totalPaid equals sum of PAID records', async () => {
    const app = makeApp(oid('v-16'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumPaid = listRes.body.data.filter((r: any) => r.status === 'PAID').reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalPaid).toBe(sumPaid);
  });
  it('[V-17] totalPaid equals sum of PAID records', async () => {
    const app = makeApp(oid('v-17'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumPaid = listRes.body.data.filter((r: any) => r.status === 'PAID').reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalPaid).toBe(sumPaid);
  });
  it('[V-18] totalPaid equals sum of PAID records', async () => {
    const app = makeApp(oid('v-18'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumPaid = listRes.body.data.filter((r: any) => r.status === 'PAID').reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalPaid).toBe(sumPaid);
  });
  it('[V-19] totalPaid equals sum of PAID records', async () => {
    const app = makeApp(oid('v-19'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumPaid = listRes.body.data.filter((r: any) => r.status === 'PAID').reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalPaid).toBe(sumPaid);
  });
  it('[V-20] totalPaid equals sum of PAID records', async () => {
    const app = makeApp(oid('v-20'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumPaid = listRes.body.data.filter((r: any) => r.status === 'PAID').reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalPaid).toBe(sumPaid);
  });
  it('[V-21] totalPaid equals sum of PAID records', async () => {
    const app = makeApp(oid('v-21'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumPaid = listRes.body.data.filter((r: any) => r.status === 'PAID').reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalPaid).toBe(sumPaid);
  });
  it('[V-22] totalPaid equals sum of PAID records', async () => {
    const app = makeApp(oid('v-22'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumPaid = listRes.body.data.filter((r: any) => r.status === 'PAID').reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalPaid).toBe(sumPaid);
  });
  it('[V-23] totalPaid equals sum of PAID records', async () => {
    const app = makeApp(oid('v-23'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumPaid = listRes.body.data.filter((r: any) => r.status === 'PAID').reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalPaid).toBe(sumPaid);
  });
  it('[V-24] totalPaid equals sum of PAID records', async () => {
    const app = makeApp(oid('v-24'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumPaid = listRes.body.data.filter((r: any) => r.status === 'PAID').reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalPaid).toBe(sumPaid);
  });
  it('[V-25] totalPaid equals sum of PAID records', async () => {
    const app = makeApp(oid('v-25'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumPaid = listRes.body.data.filter((r: any) => r.status === 'PAID').reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalPaid).toBe(sumPaid);
  });
  it('[V-26] totalPaid equals sum of PAID records', async () => {
    const app = makeApp(oid('v-26'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumPaid = listRes.body.data.filter((r: any) => r.status === 'PAID').reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalPaid).toBe(sumPaid);
  });
  it('[V-27] totalPaid equals sum of PAID records', async () => {
    const app = makeApp(oid('v-27'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumPaid = listRes.body.data.filter((r: any) => r.status === 'PAID').reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalPaid).toBe(sumPaid);
  });
  it('[V-28] totalPaid equals sum of PAID records', async () => {
    const app = makeApp(oid('v-28'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumPaid = listRes.body.data.filter((r: any) => r.status === 'PAID').reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalPaid).toBe(sumPaid);
  });
  it('[V-29] totalPaid equals sum of PAID records', async () => {
    const app = makeApp(oid('v-29'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumPaid = listRes.body.data.filter((r: any) => r.status === 'PAID').reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalPaid).toBe(sumPaid);
  });
});

// ─── Suite W: Summary totalPending consistency ────────────────────────────────
describe('Summary totalPending = sum of PENDING commissionAmounts', () => {
  it('[W-0] totalPending equals sum of PENDING records', async () => {
    const app = makeApp(oid('w-0'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumPending = listRes.body.data.filter((r: any) => r.status === 'PENDING').reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalPending).toBe(sumPending);
  });
  it('[W-1] totalPending equals sum of PENDING records', async () => {
    const app = makeApp(oid('w-1'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumPending = listRes.body.data.filter((r: any) => r.status === 'PENDING').reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalPending).toBe(sumPending);
  });
  it('[W-2] totalPending equals sum of PENDING records', async () => {
    const app = makeApp(oid('w-2'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumPending = listRes.body.data.filter((r: any) => r.status === 'PENDING').reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalPending).toBe(sumPending);
  });
  it('[W-3] totalPending equals sum of PENDING records', async () => {
    const app = makeApp(oid('w-3'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumPending = listRes.body.data.filter((r: any) => r.status === 'PENDING').reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalPending).toBe(sumPending);
  });
  it('[W-4] totalPending equals sum of PENDING records', async () => {
    const app = makeApp(oid('w-4'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumPending = listRes.body.data.filter((r: any) => r.status === 'PENDING').reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalPending).toBe(sumPending);
  });
  it('[W-5] totalPending equals sum of PENDING records', async () => {
    const app = makeApp(oid('w-5'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumPending = listRes.body.data.filter((r: any) => r.status === 'PENDING').reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalPending).toBe(sumPending);
  });
  it('[W-6] totalPending equals sum of PENDING records', async () => {
    const app = makeApp(oid('w-6'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumPending = listRes.body.data.filter((r: any) => r.status === 'PENDING').reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalPending).toBe(sumPending);
  });
  it('[W-7] totalPending equals sum of PENDING records', async () => {
    const app = makeApp(oid('w-7'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumPending = listRes.body.data.filter((r: any) => r.status === 'PENDING').reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalPending).toBe(sumPending);
  });
  it('[W-8] totalPending equals sum of PENDING records', async () => {
    const app = makeApp(oid('w-8'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumPending = listRes.body.data.filter((r: any) => r.status === 'PENDING').reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalPending).toBe(sumPending);
  });
  it('[W-9] totalPending equals sum of PENDING records', async () => {
    const app = makeApp(oid('w-9'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumPending = listRes.body.data.filter((r: any) => r.status === 'PENDING').reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalPending).toBe(sumPending);
  });
  it('[W-10] totalPending equals sum of PENDING records', async () => {
    const app = makeApp(oid('w-10'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumPending = listRes.body.data.filter((r: any) => r.status === 'PENDING').reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalPending).toBe(sumPending);
  });
  it('[W-11] totalPending equals sum of PENDING records', async () => {
    const app = makeApp(oid('w-11'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumPending = listRes.body.data.filter((r: any) => r.status === 'PENDING').reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalPending).toBe(sumPending);
  });
  it('[W-12] totalPending equals sum of PENDING records', async () => {
    const app = makeApp(oid('w-12'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumPending = listRes.body.data.filter((r: any) => r.status === 'PENDING').reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalPending).toBe(sumPending);
  });
  it('[W-13] totalPending equals sum of PENDING records', async () => {
    const app = makeApp(oid('w-13'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumPending = listRes.body.data.filter((r: any) => r.status === 'PENDING').reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalPending).toBe(sumPending);
  });
  it('[W-14] totalPending equals sum of PENDING records', async () => {
    const app = makeApp(oid('w-14'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumPending = listRes.body.data.filter((r: any) => r.status === 'PENDING').reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalPending).toBe(sumPending);
  });
  it('[W-15] totalPending equals sum of PENDING records', async () => {
    const app = makeApp(oid('w-15'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumPending = listRes.body.data.filter((r: any) => r.status === 'PENDING').reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalPending).toBe(sumPending);
  });
  it('[W-16] totalPending equals sum of PENDING records', async () => {
    const app = makeApp(oid('w-16'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumPending = listRes.body.data.filter((r: any) => r.status === 'PENDING').reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalPending).toBe(sumPending);
  });
  it('[W-17] totalPending equals sum of PENDING records', async () => {
    const app = makeApp(oid('w-17'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumPending = listRes.body.data.filter((r: any) => r.status === 'PENDING').reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalPending).toBe(sumPending);
  });
  it('[W-18] totalPending equals sum of PENDING records', async () => {
    const app = makeApp(oid('w-18'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumPending = listRes.body.data.filter((r: any) => r.status === 'PENDING').reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalPending).toBe(sumPending);
  });
  it('[W-19] totalPending equals sum of PENDING records', async () => {
    const app = makeApp(oid('w-19'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumPending = listRes.body.data.filter((r: any) => r.status === 'PENDING').reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalPending).toBe(sumPending);
  });
  it('[W-20] totalPending equals sum of PENDING records', async () => {
    const app = makeApp(oid('w-20'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumPending = listRes.body.data.filter((r: any) => r.status === 'PENDING').reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalPending).toBe(sumPending);
  });
  it('[W-21] totalPending equals sum of PENDING records', async () => {
    const app = makeApp(oid('w-21'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumPending = listRes.body.data.filter((r: any) => r.status === 'PENDING').reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalPending).toBe(sumPending);
  });
  it('[W-22] totalPending equals sum of PENDING records', async () => {
    const app = makeApp(oid('w-22'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumPending = listRes.body.data.filter((r: any) => r.status === 'PENDING').reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalPending).toBe(sumPending);
  });
  it('[W-23] totalPending equals sum of PENDING records', async () => {
    const app = makeApp(oid('w-23'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumPending = listRes.body.data.filter((r: any) => r.status === 'PENDING').reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalPending).toBe(sumPending);
  });
  it('[W-24] totalPending equals sum of PENDING records', async () => {
    const app = makeApp(oid('w-24'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumPending = listRes.body.data.filter((r: any) => r.status === 'PENDING').reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalPending).toBe(sumPending);
  });
  it('[W-25] totalPending equals sum of PENDING records', async () => {
    const app = makeApp(oid('w-25'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumPending = listRes.body.data.filter((r: any) => r.status === 'PENDING').reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalPending).toBe(sumPending);
  });
  it('[W-26] totalPending equals sum of PENDING records', async () => {
    const app = makeApp(oid('w-26'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumPending = listRes.body.data.filter((r: any) => r.status === 'PENDING').reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalPending).toBe(sumPending);
  });
  it('[W-27] totalPending equals sum of PENDING records', async () => {
    const app = makeApp(oid('w-27'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumPending = listRes.body.data.filter((r: any) => r.status === 'PENDING').reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalPending).toBe(sumPending);
  });
  it('[W-28] totalPending equals sum of PENDING records', async () => {
    const app = makeApp(oid('w-28'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumPending = listRes.body.data.filter((r: any) => r.status === 'PENDING').reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalPending).toBe(sumPending);
  });
  it('[W-29] totalPending equals sum of PENDING records', async () => {
    const app = makeApp(oid('w-29'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const sumPending = listRes.body.data.filter((r: any) => r.status === 'PENDING').reduce((s: number, r: any) => s + r.commissionAmount, 0);
    expect(summaryRes.body.data.totalPending).toBe(sumPending);
  });
});

// ─── Suite X: byPeriod count matches distinct periods ────────────────────────
describe('byPeriod length matches distinct periodMonths in list', () => {
  it('[X-0] byPeriod length equals distinct periodMonths', async () => {
    const app = makeApp(oid('x-0'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const distinct = new Set(listRes.body.data.map((r: any) => r.periodMonth));
    expect(summaryRes.body.data.byPeriod).toHaveLength(distinct.size);
  });
  it('[X-1] byPeriod length equals distinct periodMonths', async () => {
    const app = makeApp(oid('x-1'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const distinct = new Set(listRes.body.data.map((r: any) => r.periodMonth));
    expect(summaryRes.body.data.byPeriod).toHaveLength(distinct.size);
  });
  it('[X-2] byPeriod length equals distinct periodMonths', async () => {
    const app = makeApp(oid('x-2'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const distinct = new Set(listRes.body.data.map((r: any) => r.periodMonth));
    expect(summaryRes.body.data.byPeriod).toHaveLength(distinct.size);
  });
  it('[X-3] byPeriod length equals distinct periodMonths', async () => {
    const app = makeApp(oid('x-3'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const distinct = new Set(listRes.body.data.map((r: any) => r.periodMonth));
    expect(summaryRes.body.data.byPeriod).toHaveLength(distinct.size);
  });
  it('[X-4] byPeriod length equals distinct periodMonths', async () => {
    const app = makeApp(oid('x-4'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const distinct = new Set(listRes.body.data.map((r: any) => r.periodMonth));
    expect(summaryRes.body.data.byPeriod).toHaveLength(distinct.size);
  });
  it('[X-5] byPeriod length equals distinct periodMonths', async () => {
    const app = makeApp(oid('x-5'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const distinct = new Set(listRes.body.data.map((r: any) => r.periodMonth));
    expect(summaryRes.body.data.byPeriod).toHaveLength(distinct.size);
  });
  it('[X-6] byPeriod length equals distinct periodMonths', async () => {
    const app = makeApp(oid('x-6'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const distinct = new Set(listRes.body.data.map((r: any) => r.periodMonth));
    expect(summaryRes.body.data.byPeriod).toHaveLength(distinct.size);
  });
  it('[X-7] byPeriod length equals distinct periodMonths', async () => {
    const app = makeApp(oid('x-7'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const distinct = new Set(listRes.body.data.map((r: any) => r.periodMonth));
    expect(summaryRes.body.data.byPeriod).toHaveLength(distinct.size);
  });
  it('[X-8] byPeriod length equals distinct periodMonths', async () => {
    const app = makeApp(oid('x-8'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const distinct = new Set(listRes.body.data.map((r: any) => r.periodMonth));
    expect(summaryRes.body.data.byPeriod).toHaveLength(distinct.size);
  });
  it('[X-9] byPeriod length equals distinct periodMonths', async () => {
    const app = makeApp(oid('x-9'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const distinct = new Set(listRes.body.data.map((r: any) => r.periodMonth));
    expect(summaryRes.body.data.byPeriod).toHaveLength(distinct.size);
  });
  it('[X-10] byPeriod length equals distinct periodMonths', async () => {
    const app = makeApp(oid('x-10'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const distinct = new Set(listRes.body.data.map((r: any) => r.periodMonth));
    expect(summaryRes.body.data.byPeriod).toHaveLength(distinct.size);
  });
  it('[X-11] byPeriod length equals distinct periodMonths', async () => {
    const app = makeApp(oid('x-11'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const distinct = new Set(listRes.body.data.map((r: any) => r.periodMonth));
    expect(summaryRes.body.data.byPeriod).toHaveLength(distinct.size);
  });
  it('[X-12] byPeriod length equals distinct periodMonths', async () => {
    const app = makeApp(oid('x-12'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const distinct = new Set(listRes.body.data.map((r: any) => r.periodMonth));
    expect(summaryRes.body.data.byPeriod).toHaveLength(distinct.size);
  });
  it('[X-13] byPeriod length equals distinct periodMonths', async () => {
    const app = makeApp(oid('x-13'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const distinct = new Set(listRes.body.data.map((r: any) => r.periodMonth));
    expect(summaryRes.body.data.byPeriod).toHaveLength(distinct.size);
  });
  it('[X-14] byPeriod length equals distinct periodMonths', async () => {
    const app = makeApp(oid('x-14'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const distinct = new Set(listRes.body.data.map((r: any) => r.periodMonth));
    expect(summaryRes.body.data.byPeriod).toHaveLength(distinct.size);
  });
  it('[X-15] byPeriod length equals distinct periodMonths', async () => {
    const app = makeApp(oid('x-15'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const distinct = new Set(listRes.body.data.map((r: any) => r.periodMonth));
    expect(summaryRes.body.data.byPeriod).toHaveLength(distinct.size);
  });
  it('[X-16] byPeriod length equals distinct periodMonths', async () => {
    const app = makeApp(oid('x-16'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const distinct = new Set(listRes.body.data.map((r: any) => r.periodMonth));
    expect(summaryRes.body.data.byPeriod).toHaveLength(distinct.size);
  });
  it('[X-17] byPeriod length equals distinct periodMonths', async () => {
    const app = makeApp(oid('x-17'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const distinct = new Set(listRes.body.data.map((r: any) => r.periodMonth));
    expect(summaryRes.body.data.byPeriod).toHaveLength(distinct.size);
  });
  it('[X-18] byPeriod length equals distinct periodMonths', async () => {
    const app = makeApp(oid('x-18'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const distinct = new Set(listRes.body.data.map((r: any) => r.periodMonth));
    expect(summaryRes.body.data.byPeriod).toHaveLength(distinct.size);
  });
  it('[X-19] byPeriod length equals distinct periodMonths', async () => {
    const app = makeApp(oid('x-19'));
    const [listRes, summaryRes] = await Promise.all([request(app).get('/api/commissions'), request(app).get('/api/commissions/summary')]);
    const distinct = new Set(listRes.body.data.map((r: any) => r.periodMonth));
    expect(summaryRes.body.data.byPeriod).toHaveLength(distinct.size);
  });
});

// ─── Suite Y: Repeated fetch stability ───────────────────────────────────────
describe('GET /:id stability across repeated calls', () => {
  it('[Y-0] same record returns same commissionAmount on repeat', async () => {
    const app = makeApp(oid('y-0'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0].id;
    const r1 = await request(app).get('/api/commissions/' + id);
    const r2 = await request(app).get('/api/commissions/' + id);
    expect(r1.body.data.commissionAmount).toBe(r2.body.data.commissionAmount);
  });
  it('[Y-1] same record returns same commissionAmount on repeat', async () => {
    const app = makeApp(oid('y-1'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0].id;
    const r1 = await request(app).get('/api/commissions/' + id);
    const r2 = await request(app).get('/api/commissions/' + id);
    expect(r1.body.data.commissionAmount).toBe(r2.body.data.commissionAmount);
  });
  it('[Y-2] same record returns same commissionAmount on repeat', async () => {
    const app = makeApp(oid('y-2'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0].id;
    const r1 = await request(app).get('/api/commissions/' + id);
    const r2 = await request(app).get('/api/commissions/' + id);
    expect(r1.body.data.commissionAmount).toBe(r2.body.data.commissionAmount);
  });
  it('[Y-3] same record returns same commissionAmount on repeat', async () => {
    const app = makeApp(oid('y-3'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0].id;
    const r1 = await request(app).get('/api/commissions/' + id);
    const r2 = await request(app).get('/api/commissions/' + id);
    expect(r1.body.data.commissionAmount).toBe(r2.body.data.commissionAmount);
  });
  it('[Y-4] same record returns same commissionAmount on repeat', async () => {
    const app = makeApp(oid('y-4'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0].id;
    const r1 = await request(app).get('/api/commissions/' + id);
    const r2 = await request(app).get('/api/commissions/' + id);
    expect(r1.body.data.commissionAmount).toBe(r2.body.data.commissionAmount);
  });
  it('[Y-5] same record returns same commissionAmount on repeat', async () => {
    const app = makeApp(oid('y-5'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0].id;
    const r1 = await request(app).get('/api/commissions/' + id);
    const r2 = await request(app).get('/api/commissions/' + id);
    expect(r1.body.data.commissionAmount).toBe(r2.body.data.commissionAmount);
  });
  it('[Y-6] same record returns same commissionAmount on repeat', async () => {
    const app = makeApp(oid('y-6'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0].id;
    const r1 = await request(app).get('/api/commissions/' + id);
    const r2 = await request(app).get('/api/commissions/' + id);
    expect(r1.body.data.commissionAmount).toBe(r2.body.data.commissionAmount);
  });
  it('[Y-7] same record returns same commissionAmount on repeat', async () => {
    const app = makeApp(oid('y-7'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0].id;
    const r1 = await request(app).get('/api/commissions/' + id);
    const r2 = await request(app).get('/api/commissions/' + id);
    expect(r1.body.data.commissionAmount).toBe(r2.body.data.commissionAmount);
  });
  it('[Y-8] same record returns same commissionAmount on repeat', async () => {
    const app = makeApp(oid('y-8'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0].id;
    const r1 = await request(app).get('/api/commissions/' + id);
    const r2 = await request(app).get('/api/commissions/' + id);
    expect(r1.body.data.commissionAmount).toBe(r2.body.data.commissionAmount);
  });
  it('[Y-9] same record returns same commissionAmount on repeat', async () => {
    const app = makeApp(oid('y-9'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0].id;
    const r1 = await request(app).get('/api/commissions/' + id);
    const r2 = await request(app).get('/api/commissions/' + id);
    expect(r1.body.data.commissionAmount).toBe(r2.body.data.commissionAmount);
  });
  it('[Y-10] same record returns same commissionAmount on repeat', async () => {
    const app = makeApp(oid('y-10'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0].id;
    const r1 = await request(app).get('/api/commissions/' + id);
    const r2 = await request(app).get('/api/commissions/' + id);
    expect(r1.body.data.commissionAmount).toBe(r2.body.data.commissionAmount);
  });
  it('[Y-11] same record returns same commissionAmount on repeat', async () => {
    const app = makeApp(oid('y-11'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0].id;
    const r1 = await request(app).get('/api/commissions/' + id);
    const r2 = await request(app).get('/api/commissions/' + id);
    expect(r1.body.data.commissionAmount).toBe(r2.body.data.commissionAmount);
  });
  it('[Y-12] same record returns same commissionAmount on repeat', async () => {
    const app = makeApp(oid('y-12'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0].id;
    const r1 = await request(app).get('/api/commissions/' + id);
    const r2 = await request(app).get('/api/commissions/' + id);
    expect(r1.body.data.commissionAmount).toBe(r2.body.data.commissionAmount);
  });
  it('[Y-13] same record returns same commissionAmount on repeat', async () => {
    const app = makeApp(oid('y-13'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0].id;
    const r1 = await request(app).get('/api/commissions/' + id);
    const r2 = await request(app).get('/api/commissions/' + id);
    expect(r1.body.data.commissionAmount).toBe(r2.body.data.commissionAmount);
  });
  it('[Y-14] same record returns same commissionAmount on repeat', async () => {
    const app = makeApp(oid('y-14'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0].id;
    const r1 = await request(app).get('/api/commissions/' + id);
    const r2 = await request(app).get('/api/commissions/' + id);
    expect(r1.body.data.commissionAmount).toBe(r2.body.data.commissionAmount);
  });
  it('[Y-15] same record returns same commissionAmount on repeat', async () => {
    const app = makeApp(oid('y-15'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0].id;
    const r1 = await request(app).get('/api/commissions/' + id);
    const r2 = await request(app).get('/api/commissions/' + id);
    expect(r1.body.data.commissionAmount).toBe(r2.body.data.commissionAmount);
  });
  it('[Y-16] same record returns same commissionAmount on repeat', async () => {
    const app = makeApp(oid('y-16'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0].id;
    const r1 = await request(app).get('/api/commissions/' + id);
    const r2 = await request(app).get('/api/commissions/' + id);
    expect(r1.body.data.commissionAmount).toBe(r2.body.data.commissionAmount);
  });
  it('[Y-17] same record returns same commissionAmount on repeat', async () => {
    const app = makeApp(oid('y-17'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0].id;
    const r1 = await request(app).get('/api/commissions/' + id);
    const r2 = await request(app).get('/api/commissions/' + id);
    expect(r1.body.data.commissionAmount).toBe(r2.body.data.commissionAmount);
  });
  it('[Y-18] same record returns same commissionAmount on repeat', async () => {
    const app = makeApp(oid('y-18'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0].id;
    const r1 = await request(app).get('/api/commissions/' + id);
    const r2 = await request(app).get('/api/commissions/' + id);
    expect(r1.body.data.commissionAmount).toBe(r2.body.data.commissionAmount);
  });
  it('[Y-19] same record returns same commissionAmount on repeat', async () => {
    const app = makeApp(oid('y-19'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0].id;
    const r1 = await request(app).get('/api/commissions/' + id);
    const r2 = await request(app).get('/api/commissions/' + id);
    expect(r1.body.data.commissionAmount).toBe(r2.body.data.commissionAmount);
  });
  it('[Y-20] same record returns same commissionAmount on repeat', async () => {
    const app = makeApp(oid('y-20'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0].id;
    const r1 = await request(app).get('/api/commissions/' + id);
    const r2 = await request(app).get('/api/commissions/' + id);
    expect(r1.body.data.commissionAmount).toBe(r2.body.data.commissionAmount);
  });
  it('[Y-21] same record returns same commissionAmount on repeat', async () => {
    const app = makeApp(oid('y-21'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0].id;
    const r1 = await request(app).get('/api/commissions/' + id);
    const r2 = await request(app).get('/api/commissions/' + id);
    expect(r1.body.data.commissionAmount).toBe(r2.body.data.commissionAmount);
  });
  it('[Y-22] same record returns same commissionAmount on repeat', async () => {
    const app = makeApp(oid('y-22'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0].id;
    const r1 = await request(app).get('/api/commissions/' + id);
    const r2 = await request(app).get('/api/commissions/' + id);
    expect(r1.body.data.commissionAmount).toBe(r2.body.data.commissionAmount);
  });
  it('[Y-23] same record returns same commissionAmount on repeat', async () => {
    const app = makeApp(oid('y-23'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0].id;
    const r1 = await request(app).get('/api/commissions/' + id);
    const r2 = await request(app).get('/api/commissions/' + id);
    expect(r1.body.data.commissionAmount).toBe(r2.body.data.commissionAmount);
  });
  it('[Y-24] same record returns same commissionAmount on repeat', async () => {
    const app = makeApp(oid('y-24'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0].id;
    const r1 = await request(app).get('/api/commissions/' + id);
    const r2 = await request(app).get('/api/commissions/' + id);
    expect(r1.body.data.commissionAmount).toBe(r2.body.data.commissionAmount);
  });
  it('[Y-25] same record returns same commissionAmount on repeat', async () => {
    const app = makeApp(oid('y-25'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0].id;
    const r1 = await request(app).get('/api/commissions/' + id);
    const r2 = await request(app).get('/api/commissions/' + id);
    expect(r1.body.data.commissionAmount).toBe(r2.body.data.commissionAmount);
  });
  it('[Y-26] same record returns same commissionAmount on repeat', async () => {
    const app = makeApp(oid('y-26'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0].id;
    const r1 = await request(app).get('/api/commissions/' + id);
    const r2 = await request(app).get('/api/commissions/' + id);
    expect(r1.body.data.commissionAmount).toBe(r2.body.data.commissionAmount);
  });
  it('[Y-27] same record returns same commissionAmount on repeat', async () => {
    const app = makeApp(oid('y-27'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0].id;
    const r1 = await request(app).get('/api/commissions/' + id);
    const r2 = await request(app).get('/api/commissions/' + id);
    expect(r1.body.data.commissionAmount).toBe(r2.body.data.commissionAmount);
  });
  it('[Y-28] same record returns same commissionAmount on repeat', async () => {
    const app = makeApp(oid('y-28'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0].id;
    const r1 = await request(app).get('/api/commissions/' + id);
    const r2 = await request(app).get('/api/commissions/' + id);
    expect(r1.body.data.commissionAmount).toBe(r2.body.data.commissionAmount);
  });
  it('[Y-29] same record returns same commissionAmount on repeat', async () => {
    const app = makeApp(oid('y-29'));
    const list = await request(app).get('/api/commissions');
    const id = list.body.data[0].id;
    const r1 = await request(app).get('/api/commissions/' + id);
    const r2 = await request(app).get('/api/commissions/' + id);
    expect(r1.body.data.commissionAmount).toBe(r2.body.data.commissionAmount);
  });
});

// ─── Suite Z: Boundary and misc ──────────────────────────────────────────────
describe('Boundary and misc tests', () => {
  it('[Z-0] GET / with no query string returns 200', async () => {
    const app = makeApp(oid('z-0')); const res = await request(app).get('/api/commissions'); expect(res.status).toBe(200);
  });
  it('[Z-1] GET /summary with no query string returns 200', async () => {
    const app = makeApp(oid('z-1')); const res = await request(app).get('/api/commissions/summary'); expect(res.status).toBe(200);
  });
  it('[Z-2] GET /:id with valid id returns 200', async () => {
    const app = makeApp(oid('z-2')); const list = await request(app).get('/api/commissions'); const res = await request(app).get('/api/commissions/' + list.body.data[0].id); expect(res.status).toBe(200);
  });
  it('[Z-3] data length is non-negative integer', async () => {
    const app = makeApp(oid('z-3')); const res = await request(app).get('/api/commissions'); expect(res.body.data.length).toBeGreaterThanOrEqual(0); expect(Number.isInteger(res.body.data.length)).toBe(true);
  });
  it('[Z-4] PAID records have paymentReference', async () => {
    const app = makeApp(oid('z-4')); const res = await request(app).get('/api/commissions'); const paid = res.body.data.filter((r: any) => r.status === 'PAID'); paid.forEach((r: any) => expect(r.paymentReference).toBeTruthy());
  });
  it('[Z-5] byPeriod earned values non-negative', async () => {
    const app = makeApp(oid('z-5')); const res = await request(app).get('/api/commissions/summary'); res.body.data.byPeriod.forEach((bp: any) => expect(bp.earned).toBeGreaterThanOrEqual(0));
  });
  it('[Z-6] byPeriod paid values non-negative', async () => {
    const app = makeApp(oid('z-6')); const res = await request(app).get('/api/commissions/summary'); res.body.data.byPeriod.forEach((bp: any) => expect(bp.paid).toBeGreaterThanOrEqual(0));
  });
  it('[Z-7] list records all belong to org', async () => {
    const app = makeApp(oid('z-7')); const res = await request(app).get('/api/commissions'); res.body.data.forEach((r: any) => expect(r.partnerId).toBe(oid('z-7')));
  });
  it('[Z-8] empty status= string returns all 5', async () => {
    const app = makeApp(oid('z-8')); const res = await request(app).get('/api/commissions?status='); expect(res.body.data).toHaveLength(5);
  });
  it('[Z-9] empty period= string returns all 5', async () => {
    const app = makeApp(oid('z-9')); const res = await request(app).get('/api/commissions?period='); expect(res.body.data).toHaveLength(5);
  });
  it('[Z-10] GET / for org-z-10 returns non-null array', async () => {
    const app = makeApp(oid('z-10'));
    const res = await request(app).get('/api/commissions');
    expect(res.body.data).not.toBeNull();
    expect(Array.isArray(res.body.data)).toBe(true);
  });
  it('[Z-11] GET / for org-z-11 returns non-null array', async () => {
    const app = makeApp(oid('z-11'));
    const res = await request(app).get('/api/commissions');
    expect(res.body.data).not.toBeNull();
    expect(Array.isArray(res.body.data)).toBe(true);
  });
  it('[Z-12] GET / for org-z-12 returns non-null array', async () => {
    const app = makeApp(oid('z-12'));
    const res = await request(app).get('/api/commissions');
    expect(res.body.data).not.toBeNull();
    expect(Array.isArray(res.body.data)).toBe(true);
  });
  it('[Z-13] GET / for org-z-13 returns non-null array', async () => {
    const app = makeApp(oid('z-13'));
    const res = await request(app).get('/api/commissions');
    expect(res.body.data).not.toBeNull();
    expect(Array.isArray(res.body.data)).toBe(true);
  });
  it('[Z-14] GET / for org-z-14 returns non-null array', async () => {
    const app = makeApp(oid('z-14'));
    const res = await request(app).get('/api/commissions');
    expect(res.body.data).not.toBeNull();
    expect(Array.isArray(res.body.data)).toBe(true);
  });
  it('[Z-15] GET / for org-z-15 returns non-null array', async () => {
    const app = makeApp(oid('z-15'));
    const res = await request(app).get('/api/commissions');
    expect(res.body.data).not.toBeNull();
    expect(Array.isArray(res.body.data)).toBe(true);
  });
  it('[Z-16] GET / for org-z-16 returns non-null array', async () => {
    const app = makeApp(oid('z-16'));
    const res = await request(app).get('/api/commissions');
    expect(res.body.data).not.toBeNull();
    expect(Array.isArray(res.body.data)).toBe(true);
  });
  it('[Z-17] GET / for org-z-17 returns non-null array', async () => {
    const app = makeApp(oid('z-17'));
    const res = await request(app).get('/api/commissions');
    expect(res.body.data).not.toBeNull();
    expect(Array.isArray(res.body.data)).toBe(true);
  });
  it('[Z-18] GET / for org-z-18 returns non-null array', async () => {
    const app = makeApp(oid('z-18'));
    const res = await request(app).get('/api/commissions');
    expect(res.body.data).not.toBeNull();
    expect(Array.isArray(res.body.data)).toBe(true);
  });
  it('[Z-19] GET / for org-z-19 returns non-null array', async () => {
    const app = makeApp(oid('z-19'));
    const res = await request(app).get('/api/commissions');
    expect(res.body.data).not.toBeNull();
    expect(Array.isArray(res.body.data)).toBe(true);
  });
  it('[Z-20] GET / for org-z-20 returns non-null array', async () => {
    const app = makeApp(oid('z-20'));
    const res = await request(app).get('/api/commissions');
    expect(res.body.data).not.toBeNull();
    expect(Array.isArray(res.body.data)).toBe(true);
  });
  it('[Z-21] GET / for org-z-21 returns non-null array', async () => {
    const app = makeApp(oid('z-21'));
    const res = await request(app).get('/api/commissions');
    expect(res.body.data).not.toBeNull();
    expect(Array.isArray(res.body.data)).toBe(true);
  });
  it('[Z-22] GET / for org-z-22 returns non-null array', async () => {
    const app = makeApp(oid('z-22'));
    const res = await request(app).get('/api/commissions');
    expect(res.body.data).not.toBeNull();
    expect(Array.isArray(res.body.data)).toBe(true);
  });
  it('[Z-23] GET / for org-z-23 returns non-null array', async () => {
    const app = makeApp(oid('z-23'));
    const res = await request(app).get('/api/commissions');
    expect(res.body.data).not.toBeNull();
    expect(Array.isArray(res.body.data)).toBe(true);
  });
  it('[Z-24] GET / for org-z-24 returns non-null array', async () => {
    const app = makeApp(oid('z-24'));
    const res = await request(app).get('/api/commissions');
    expect(res.body.data).not.toBeNull();
    expect(Array.isArray(res.body.data)).toBe(true);
  });
  it('[Z-25] GET / for org-z-25 returns non-null array', async () => {
    const app = makeApp(oid('z-25'));
    const res = await request(app).get('/api/commissions');
    expect(res.body.data).not.toBeNull();
    expect(Array.isArray(res.body.data)).toBe(true);
  });
  it('[Z-26] GET / for org-z-26 returns non-null array', async () => {
    const app = makeApp(oid('z-26'));
    const res = await request(app).get('/api/commissions');
    expect(res.body.data).not.toBeNull();
    expect(Array.isArray(res.body.data)).toBe(true);
  });
  it('[Z-27] GET / for org-z-27 returns non-null array', async () => {
    const app = makeApp(oid('z-27'));
    const res = await request(app).get('/api/commissions');
    expect(res.body.data).not.toBeNull();
    expect(Array.isArray(res.body.data)).toBe(true);
  });
  it('[Z-28] GET / for org-z-28 returns non-null array', async () => {
    const app = makeApp(oid('z-28'));
    const res = await request(app).get('/api/commissions');
    expect(res.body.data).not.toBeNull();
    expect(Array.isArray(res.body.data)).toBe(true);
  });
  it('[Z-29] GET / for org-z-29 returns non-null array', async () => {
    const app = makeApp(oid('z-29'));
    const res = await request(app).get('/api/commissions');
    expect(res.body.data).not.toBeNull();
    expect(Array.isArray(res.body.data)).toBe(true);
  });
  it('[Z-30] GET / for org-z-30 returns non-null array', async () => {
    const app = makeApp(oid('z-30'));
    const res = await request(app).get('/api/commissions');
    expect(res.body.data).not.toBeNull();
    expect(Array.isArray(res.body.data)).toBe(true);
  });
  it('[Z-31] GET / for org-z-31 returns non-null array', async () => {
    const app = makeApp(oid('z-31'));
    const res = await request(app).get('/api/commissions');
    expect(res.body.data).not.toBeNull();
    expect(Array.isArray(res.body.data)).toBe(true);
  });
  it('[Z-32] GET / for org-z-32 returns non-null array', async () => {
    const app = makeApp(oid('z-32'));
    const res = await request(app).get('/api/commissions');
    expect(res.body.data).not.toBeNull();
    expect(Array.isArray(res.body.data)).toBe(true);
  });
  it('[Z-33] GET / for org-z-33 returns non-null array', async () => {
    const app = makeApp(oid('z-33'));
    const res = await request(app).get('/api/commissions');
    expect(res.body.data).not.toBeNull();
    expect(Array.isArray(res.body.data)).toBe(true);
  });
  it('[Z-34] GET / for org-z-34 returns non-null array', async () => {
    const app = makeApp(oid('z-34'));
    const res = await request(app).get('/api/commissions');
    expect(res.body.data).not.toBeNull();
    expect(Array.isArray(res.body.data)).toBe(true);
  });
  it('[Z-35] GET / for org-z-35 returns non-null array', async () => {
    const app = makeApp(oid('z-35'));
    const res = await request(app).get('/api/commissions');
    expect(res.body.data).not.toBeNull();
    expect(Array.isArray(res.body.data)).toBe(true);
  });
  it('[Z-36] GET / for org-z-36 returns non-null array', async () => {
    const app = makeApp(oid('z-36'));
    const res = await request(app).get('/api/commissions');
    expect(res.body.data).not.toBeNull();
    expect(Array.isArray(res.body.data)).toBe(true);
  });
  it('[Z-37] GET / for org-z-37 returns non-null array', async () => {
    const app = makeApp(oid('z-37'));
    const res = await request(app).get('/api/commissions');
    expect(res.body.data).not.toBeNull();
    expect(Array.isArray(res.body.data)).toBe(true);
  });
  it('[Z-38] GET / for org-z-38 returns non-null array', async () => {
    const app = makeApp(oid('z-38'));
    const res = await request(app).get('/api/commissions');
    expect(res.body.data).not.toBeNull();
    expect(Array.isArray(res.body.data)).toBe(true);
  });
  it('[Z-39] GET / for org-z-39 returns non-null array', async () => {
    const app = makeApp(oid('z-39'));
    const res = await request(app).get('/api/commissions');
    expect(res.body.data).not.toBeNull();
    expect(Array.isArray(res.body.data)).toBe(true);
  });
  it('[Z-40] GET / for org-z-40 returns non-null array', async () => {
    const app = makeApp(oid('z-40'));
    const res = await request(app).get('/api/commissions');
    expect(res.body.data).not.toBeNull();
    expect(Array.isArray(res.body.data)).toBe(true);
  });
  it('[Z-41] GET / for org-z-41 returns non-null array', async () => {
    const app = makeApp(oid('z-41'));
    const res = await request(app).get('/api/commissions');
    expect(res.body.data).not.toBeNull();
    expect(Array.isArray(res.body.data)).toBe(true);
  });
  it('[Z-42] GET / for org-z-42 returns non-null array', async () => {
    const app = makeApp(oid('z-42'));
    const res = await request(app).get('/api/commissions');
    expect(res.body.data).not.toBeNull();
    expect(Array.isArray(res.body.data)).toBe(true);
  });
  it('[Z-43] GET / for org-z-43 returns non-null array', async () => {
    const app = makeApp(oid('z-43'));
    const res = await request(app).get('/api/commissions');
    expect(res.body.data).not.toBeNull();
    expect(Array.isArray(res.body.data)).toBe(true);
  });
  it('[Z-44] GET / for org-z-44 returns non-null array', async () => {
    const app = makeApp(oid('z-44'));
    const res = await request(app).get('/api/commissions');
    expect(res.body.data).not.toBeNull();
    expect(Array.isArray(res.body.data)).toBe(true);
  });
  it('[Z-45] GET / for org-z-45 returns non-null array', async () => {
    const app = makeApp(oid('z-45'));
    const res = await request(app).get('/api/commissions');
    expect(res.body.data).not.toBeNull();
    expect(Array.isArray(res.body.data)).toBe(true);
  });
  it('[Z-46] GET / for org-z-46 returns non-null array', async () => {
    const app = makeApp(oid('z-46'));
    const res = await request(app).get('/api/commissions');
    expect(res.body.data).not.toBeNull();
    expect(Array.isArray(res.body.data)).toBe(true);
  });
  it('[Z-47] GET / for org-z-47 returns non-null array', async () => {
    const app = makeApp(oid('z-47'));
    const res = await request(app).get('/api/commissions');
    expect(res.body.data).not.toBeNull();
    expect(Array.isArray(res.body.data)).toBe(true);
  });
  it('[Z-48] GET / for org-z-48 returns non-null array', async () => {
    const app = makeApp(oid('z-48'));
    const res = await request(app).get('/api/commissions');
    expect(res.body.data).not.toBeNull();
    expect(Array.isArray(res.body.data)).toBe(true);
  });
  it('[Z-49] GET / for org-z-49 returns non-null array', async () => {
    const app = makeApp(oid('z-49'));
    const res = await request(app).get('/api/commissions');
    expect(res.body.data).not.toBeNull();
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
