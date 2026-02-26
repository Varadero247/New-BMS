// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import express, { type Response, type NextFunction } from 'express';
import request from 'supertest';

jest.mock('@ims/auth', () => ({
  authenticate: (req: any, _: any, next: any) => {
    req.user = req.__testUser ?? { id: 'u1', organisationId: 'org-cert-test', role: 'ADMIN', email: 'admin@test.com' };
    next();
  },
  writeRoleGuard: (...roles: string[]) => (req: any, res: any, next: any) => {
    if (roles.includes(req.user?.role)) next();
    else res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Forbidden' } });
  },
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import certificationRouter from '../src/routes/certification';

function makeApp(orgId: string, role = 'ADMIN') {
  const app = express();
  app.use(express.json());
  app.use((req: any, _res: Response, next: NextFunction) => {
    req.__testUser = { id: 'u1', organisationId: orgId, role, email: 'admin@test.com' };
    next();
  });
  app.use('/api/certifications', certificationRouter);
  return app;
}

function oid(suffix: string) { return `org-cert-${suffix}`; }

const TIERS = ['REGISTERED', 'CERTIFIED', 'GOLD', 'PLATINUM'] as const;

// ─── Suite A: GET /requirements no tier ──────────────────────────────────────
describe('GET /api/certifications/requirements — no tier filter', () => {
  it('[A-0] returns 200 and success:true', async () => {
    const app = makeApp(oid('a-0'));
    const res = await request(app).get('/api/certifications/requirements');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-1] returns 200 and success:true', async () => {
    const app = makeApp(oid('a-1'));
    const res = await request(app).get('/api/certifications/requirements');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-2] returns 200 and success:true', async () => {
    const app = makeApp(oid('a-2'));
    const res = await request(app).get('/api/certifications/requirements');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-3] returns 200 and success:true', async () => {
    const app = makeApp(oid('a-3'));
    const res = await request(app).get('/api/certifications/requirements');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-4] returns 200 and success:true', async () => {
    const app = makeApp(oid('a-4'));
    const res = await request(app).get('/api/certifications/requirements');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-5] returns 200 and success:true', async () => {
    const app = makeApp(oid('a-5'));
    const res = await request(app).get('/api/certifications/requirements');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-6] returns 200 and success:true', async () => {
    const app = makeApp(oid('a-6'));
    const res = await request(app).get('/api/certifications/requirements');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-7] returns 200 and success:true', async () => {
    const app = makeApp(oid('a-7'));
    const res = await request(app).get('/api/certifications/requirements');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-8] returns 200 and success:true', async () => {
    const app = makeApp(oid('a-8'));
    const res = await request(app).get('/api/certifications/requirements');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-9] returns 200 and success:true', async () => {
    const app = makeApp(oid('a-9'));
    const res = await request(app).get('/api/certifications/requirements');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-10] returns 200 and success:true', async () => {
    const app = makeApp(oid('a-10'));
    const res = await request(app).get('/api/certifications/requirements');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-11] returns 200 and success:true', async () => {
    const app = makeApp(oid('a-11'));
    const res = await request(app).get('/api/certifications/requirements');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-12] returns 200 and success:true', async () => {
    const app = makeApp(oid('a-12'));
    const res = await request(app).get('/api/certifications/requirements');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-13] returns 200 and success:true', async () => {
    const app = makeApp(oid('a-13'));
    const res = await request(app).get('/api/certifications/requirements');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-14] returns 200 and success:true', async () => {
    const app = makeApp(oid('a-14'));
    const res = await request(app).get('/api/certifications/requirements');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-15] returns 200 and success:true', async () => {
    const app = makeApp(oid('a-15'));
    const res = await request(app).get('/api/certifications/requirements');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-16] returns 200 and success:true', async () => {
    const app = makeApp(oid('a-16'));
    const res = await request(app).get('/api/certifications/requirements');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-17] returns 200 and success:true', async () => {
    const app = makeApp(oid('a-17'));
    const res = await request(app).get('/api/certifications/requirements');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-18] returns 200 and success:true', async () => {
    const app = makeApp(oid('a-18'));
    const res = await request(app).get('/api/certifications/requirements');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-19] returns 200 and success:true', async () => {
    const app = makeApp(oid('a-19'));
    const res = await request(app).get('/api/certifications/requirements');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-20] returns 200 and success:true', async () => {
    const app = makeApp(oid('a-20'));
    const res = await request(app).get('/api/certifications/requirements');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-21] returns 200 and success:true', async () => {
    const app = makeApp(oid('a-21'));
    const res = await request(app).get('/api/certifications/requirements');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-22] returns 200 and success:true', async () => {
    const app = makeApp(oid('a-22'));
    const res = await request(app).get('/api/certifications/requirements');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-23] returns 200 and success:true', async () => {
    const app = makeApp(oid('a-23'));
    const res = await request(app).get('/api/certifications/requirements');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-24] returns 200 and success:true', async () => {
    const app = makeApp(oid('a-24'));
    const res = await request(app).get('/api/certifications/requirements');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-25] returns 200 and success:true', async () => {
    const app = makeApp(oid('a-25'));
    const res = await request(app).get('/api/certifications/requirements');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-26] returns 200 and success:true', async () => {
    const app = makeApp(oid('a-26'));
    const res = await request(app).get('/api/certifications/requirements');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-27] returns 200 and success:true', async () => {
    const app = makeApp(oid('a-27'));
    const res = await request(app).get('/api/certifications/requirements');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-28] returns 200 and success:true', async () => {
    const app = makeApp(oid('a-28'));
    const res = await request(app).get('/api/certifications/requirements');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-29] returns 200 and success:true', async () => {
    const app = makeApp(oid('a-29'));
    const res = await request(app).get('/api/certifications/requirements');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-30] returns 200 and success:true', async () => {
    const app = makeApp(oid('a-30'));
    const res = await request(app).get('/api/certifications/requirements');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-31] returns 200 and success:true', async () => {
    const app = makeApp(oid('a-31'));
    const res = await request(app).get('/api/certifications/requirements');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-32] returns 200 and success:true', async () => {
    const app = makeApp(oid('a-32'));
    const res = await request(app).get('/api/certifications/requirements');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-33] returns 200 and success:true', async () => {
    const app = makeApp(oid('a-33'));
    const res = await request(app).get('/api/certifications/requirements');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-34] returns 200 and success:true', async () => {
    const app = makeApp(oid('a-34'));
    const res = await request(app).get('/api/certifications/requirements');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-35] returns 200 and success:true', async () => {
    const app = makeApp(oid('a-35'));
    const res = await request(app).get('/api/certifications/requirements');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-36] returns 200 and success:true', async () => {
    const app = makeApp(oid('a-36'));
    const res = await request(app).get('/api/certifications/requirements');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-37] returns 200 and success:true', async () => {
    const app = makeApp(oid('a-37'));
    const res = await request(app).get('/api/certifications/requirements');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-38] returns 200 and success:true', async () => {
    const app = makeApp(oid('a-38'));
    const res = await request(app).get('/api/certifications/requirements');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-39] returns 200 and success:true', async () => {
    const app = makeApp(oid('a-39'));
    const res = await request(app).get('/api/certifications/requirements');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-40] returns 200 and success:true', async () => {
    const app = makeApp(oid('a-40'));
    const res = await request(app).get('/api/certifications/requirements');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-41] returns 200 and success:true', async () => {
    const app = makeApp(oid('a-41'));
    const res = await request(app).get('/api/certifications/requirements');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-42] returns 200 and success:true', async () => {
    const app = makeApp(oid('a-42'));
    const res = await request(app).get('/api/certifications/requirements');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-43] returns 200 and success:true', async () => {
    const app = makeApp(oid('a-43'));
    const res = await request(app).get('/api/certifications/requirements');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-44] returns 200 and success:true', async () => {
    const app = makeApp(oid('a-44'));
    const res = await request(app).get('/api/certifications/requirements');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-45] returns 200 and success:true', async () => {
    const app = makeApp(oid('a-45'));
    const res = await request(app).get('/api/certifications/requirements');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-46] returns 200 and success:true', async () => {
    const app = makeApp(oid('a-46'));
    const res = await request(app).get('/api/certifications/requirements');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-47] returns 200 and success:true', async () => {
    const app = makeApp(oid('a-47'));
    const res = await request(app).get('/api/certifications/requirements');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-48] returns 200 and success:true', async () => {
    const app = makeApp(oid('a-48'));
    const res = await request(app).get('/api/certifications/requirements');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[A-49] returns 200 and success:true', async () => {
    const app = makeApp(oid('a-49'));
    const res = await request(app).get('/api/certifications/requirements');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

// ─── Suite B: GET /requirements shape ────────────────────────────────────────
describe('GET /api/certifications/requirements — data shape', () => {
  const appB = makeApp(oid('b-shape'));
  it('[B-0] data has REGISTERED key', async () => {
    const res = await request(appB).get('/api/certifications/requirements');
    expect(res.body.data).toHaveProperty('REGISTERED');
  });
  it('[B-1] data has CERTIFIED key', async () => {
    const res = await request(appB).get('/api/certifications/requirements');
    expect(res.body.data).toHaveProperty('CERTIFIED');
  });
  it('[B-2] data has GOLD key', async () => {
    const res = await request(appB).get('/api/certifications/requirements');
    expect(res.body.data).toHaveProperty('GOLD');
  });
  it('[B-3] data has PLATINUM key', async () => {
    const res = await request(appB).get('/api/certifications/requirements');
    expect(res.body.data).toHaveProperty('PLATINUM');
  });
  it('[B-4] REGISTERED has 2 requirements', async () => {
    const res = await request(appB).get('/api/certifications/requirements');
    expect(res.body.data.REGISTERED).toHaveLength(2);
  });
  it('[B-5] CERTIFIED has 3 requirements', async () => {
    const res = await request(appB).get('/api/certifications/requirements');
    expect(res.body.data.CERTIFIED).toHaveLength(3);
  });
  it('[B-6] GOLD has 3 requirements', async () => {
    const res = await request(appB).get('/api/certifications/requirements');
    expect(res.body.data.GOLD).toHaveLength(3);
  });
  it('[B-7] PLATINUM has 4 requirements', async () => {
    const res = await request(appB).get('/api/certifications/requirements');
    expect(res.body.data.PLATINUM).toHaveLength(4);
  });
  it('[B-8] REGISTERED reqs have id', async () => {
    const res = await request(appB).get('/api/certifications/requirements');
    res.body.data.REGISTERED.forEach((r: any) => expect(r).toHaveProperty('id'));
  });
  it('[B-9] REGISTERED reqs have title', async () => {
    const res = await request(appB).get('/api/certifications/requirements');
    res.body.data.REGISTERED.forEach((r: any) => expect(r).toHaveProperty('title'));
  });
  it('[B-10] REGISTERED reqs have description', async () => {
    const res = await request(appB).get('/api/certifications/requirements');
    res.body.data.REGISTERED.forEach((r: any) => expect(r).toHaveProperty('description'));
  });
  it('[B-11] REGISTERED reqs have type', async () => {
    const res = await request(appB).get('/api/certifications/requirements');
    res.body.data.REGISTERED.forEach((r: any) => expect(r).toHaveProperty('type'));
  });
  it('[B-12] REGISTERED reqs have mandatory', async () => {
    const res = await request(appB).get('/api/certifications/requirements');
    res.body.data.REGISTERED.forEach((r: any) => expect(r).toHaveProperty('mandatory'));
  });
  it('[B-13] GOLD reqs have id', async () => {
    const res = await request(appB).get('/api/certifications/requirements');
    res.body.data.GOLD.forEach((r: any) => expect(r).toHaveProperty('id'));
  });
  it('[B-14] PLATINUM reqs have id', async () => {
    const res = await request(appB).get('/api/certifications/requirements');
    res.body.data.PLATINUM.forEach((r: any) => expect(r).toHaveProperty('id'));
  });
  it('[B-15] REGISTERED req ids are reg-1 and reg-2', async () => {
    const res = await request(appB).get('/api/certifications/requirements');
    const ids = res.body.data.REGISTERED.map((r: any) => r.id).sort(); expect(ids).toEqual(['reg-1', 'reg-2']);
  });
  it('[B-16] GOLD req ids are gold-1 gold-2 gold-3', async () => {
    const res = await request(appB).get('/api/certifications/requirements');
    const ids = res.body.data.GOLD.map((r: any) => r.id).sort(); expect(ids).toEqual(['gold-1', 'gold-2', 'gold-3']);
  });
  it('[B-17] PLATINUM req ids plat-1..4', async () => {
    const res = await request(appB).get('/api/certifications/requirements');
    const ids = res.body.data.PLATINUM.map((r: any) => r.id).sort(); expect(ids).toEqual(['plat-1', 'plat-2', 'plat-3', 'plat-4']);
  });
  it('[B-18] REGISTERED both mandatory', async () => {
    const res = await request(appB).get('/api/certifications/requirements');
    expect(res.body.data.REGISTERED.every((r: any) => r.mandatory === true)).toBe(true);
  });
  it('[B-19] CERTIFIED cert-3 not mandatory', async () => {
    const res = await request(appB).get('/api/certifications/requirements');
    const r = res.body.data.CERTIFIED.find((req: any) => req.id === 'cert-3'); expect(r.mandatory).toBe(false);
  });
  it('[B-20] GOLD all mandatory', async () => {
    const res = await request(appB).get('/api/certifications/requirements');
    expect(res.body.data.GOLD.every((r: any) => r.mandatory === true)).toBe(true);
  });
  it('[B-21] PLATINUM all mandatory', async () => {
    const res = await request(appB).get('/api/certifications/requirements');
    expect(res.body.data.PLATINUM.every((r: any) => r.mandatory === true)).toBe(true);
  });
  it('[B-22] req types are valid', async () => {
    const res = await request(appB).get('/api/certifications/requirements');
    const vt = new Set(['EXAM','TRAINING','CASE_STUDY','REFERENCE','REVENUE']); res.body.data.REGISTERED.forEach((r: any) => expect(vt.has(r.type)).toBe(true));
  });
  it('[B-23] reg-1 type REFERENCE', async () => {
    const res = await request(appB).get('/api/certifications/requirements');
    const r = res.body.data.REGISTERED.find((req: any) => req.id === 'reg-1'); expect(r.type).toBe('REFERENCE');
  });
  it('[B-24] reg-2 type TRAINING', async () => {
    const res = await request(appB).get('/api/certifications/requirements');
    const r = res.body.data.REGISTERED.find((req: any) => req.id === 'reg-2'); expect(r.type).toBe('TRAINING');
  });
  it('[B-25] cert-1 type EXAM', async () => {
    const res = await request(appB).get('/api/certifications/requirements');
    const r = res.body.data.CERTIFIED.find((req: any) => req.id === 'cert-1'); expect(r.type).toBe('EXAM');
  });
  it('[B-26] cert-2 type CASE_STUDY', async () => {
    const res = await request(appB).get('/api/certifications/requirements');
    const r = res.body.data.CERTIFIED.find((req: any) => req.id === 'cert-2'); expect(r.type).toBe('CASE_STUDY');
  });
  it('[B-27] cert-3 type REVENUE', async () => {
    const res = await request(appB).get('/api/certifications/requirements');
    const r = res.body.data.CERTIFIED.find((req: any) => req.id === 'cert-3'); expect(r.type).toBe('REVENUE');
  });
  it('[B-28] gold-3 targetValue 100000', async () => {
    const res = await request(appB).get('/api/certifications/requirements');
    const r = res.body.data.GOLD.find((req: any) => req.id === 'gold-3'); expect(r.targetValue).toBe(100000);
  });
  it('[B-29] plat-2 targetValue 10', async () => {
    const res = await request(appB).get('/api/certifications/requirements');
    const r = res.body.data.PLATINUM.find((req: any) => req.id === 'plat-2'); expect(r.targetValue).toBe(10);
  });
});

// ─── Suite C: GET /requirements with tier filter ──────────────────────────────
describe('GET /api/certifications/requirements?tier= with valid tier', () => {
  it('[C-REGISTERED-0] tier=REGISTERED returns 2 requirements', async () => {
    const app = makeApp(oid('c-registered-0'));
    const res = await request(app).get('/api/certifications/requirements?tier=REGISTERED');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tier).toBe('REGISTERED');
    expect(res.body.data.requirements).toHaveLength(2);
  });
  it('[C-REGISTERED-1] tier=REGISTERED returns 2 requirements', async () => {
    const app = makeApp(oid('c-registered-1'));
    const res = await request(app).get('/api/certifications/requirements?tier=REGISTERED');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tier).toBe('REGISTERED');
    expect(res.body.data.requirements).toHaveLength(2);
  });
  it('[C-REGISTERED-2] tier=REGISTERED returns 2 requirements', async () => {
    const app = makeApp(oid('c-registered-2'));
    const res = await request(app).get('/api/certifications/requirements?tier=REGISTERED');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tier).toBe('REGISTERED');
    expect(res.body.data.requirements).toHaveLength(2);
  });
  it('[C-REGISTERED-3] tier=REGISTERED returns 2 requirements', async () => {
    const app = makeApp(oid('c-registered-3'));
    const res = await request(app).get('/api/certifications/requirements?tier=REGISTERED');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tier).toBe('REGISTERED');
    expect(res.body.data.requirements).toHaveLength(2);
  });
  it('[C-REGISTERED-4] tier=REGISTERED returns 2 requirements', async () => {
    const app = makeApp(oid('c-registered-4'));
    const res = await request(app).get('/api/certifications/requirements?tier=REGISTERED');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tier).toBe('REGISTERED');
    expect(res.body.data.requirements).toHaveLength(2);
  });
  it('[C-REGISTERED-5] tier=REGISTERED returns 2 requirements', async () => {
    const app = makeApp(oid('c-registered-5'));
    const res = await request(app).get('/api/certifications/requirements?tier=REGISTERED');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tier).toBe('REGISTERED');
    expect(res.body.data.requirements).toHaveLength(2);
  });
  it('[C-REGISTERED-6] tier=REGISTERED returns 2 requirements', async () => {
    const app = makeApp(oid('c-registered-6'));
    const res = await request(app).get('/api/certifications/requirements?tier=REGISTERED');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tier).toBe('REGISTERED');
    expect(res.body.data.requirements).toHaveLength(2);
  });
  it('[C-REGISTERED-7] tier=REGISTERED returns 2 requirements', async () => {
    const app = makeApp(oid('c-registered-7'));
    const res = await request(app).get('/api/certifications/requirements?tier=REGISTERED');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tier).toBe('REGISTERED');
    expect(res.body.data.requirements).toHaveLength(2);
  });
  it('[C-REGISTERED-8] tier=REGISTERED returns 2 requirements', async () => {
    const app = makeApp(oid('c-registered-8'));
    const res = await request(app).get('/api/certifications/requirements?tier=REGISTERED');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tier).toBe('REGISTERED');
    expect(res.body.data.requirements).toHaveLength(2);
  });
  it('[C-REGISTERED-9] tier=REGISTERED returns 2 requirements', async () => {
    const app = makeApp(oid('c-registered-9'));
    const res = await request(app).get('/api/certifications/requirements?tier=REGISTERED');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tier).toBe('REGISTERED');
    expect(res.body.data.requirements).toHaveLength(2);
  });
  it('[C-CERTIFIED-0] tier=CERTIFIED returns 3 requirements', async () => {
    const app = makeApp(oid('c-certified-0'));
    const res = await request(app).get('/api/certifications/requirements?tier=CERTIFIED');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tier).toBe('CERTIFIED');
    expect(res.body.data.requirements).toHaveLength(3);
  });
  it('[C-CERTIFIED-1] tier=CERTIFIED returns 3 requirements', async () => {
    const app = makeApp(oid('c-certified-1'));
    const res = await request(app).get('/api/certifications/requirements?tier=CERTIFIED');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tier).toBe('CERTIFIED');
    expect(res.body.data.requirements).toHaveLength(3);
  });
  it('[C-CERTIFIED-2] tier=CERTIFIED returns 3 requirements', async () => {
    const app = makeApp(oid('c-certified-2'));
    const res = await request(app).get('/api/certifications/requirements?tier=CERTIFIED');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tier).toBe('CERTIFIED');
    expect(res.body.data.requirements).toHaveLength(3);
  });
  it('[C-CERTIFIED-3] tier=CERTIFIED returns 3 requirements', async () => {
    const app = makeApp(oid('c-certified-3'));
    const res = await request(app).get('/api/certifications/requirements?tier=CERTIFIED');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tier).toBe('CERTIFIED');
    expect(res.body.data.requirements).toHaveLength(3);
  });
  it('[C-CERTIFIED-4] tier=CERTIFIED returns 3 requirements', async () => {
    const app = makeApp(oid('c-certified-4'));
    const res = await request(app).get('/api/certifications/requirements?tier=CERTIFIED');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tier).toBe('CERTIFIED');
    expect(res.body.data.requirements).toHaveLength(3);
  });
  it('[C-CERTIFIED-5] tier=CERTIFIED returns 3 requirements', async () => {
    const app = makeApp(oid('c-certified-5'));
    const res = await request(app).get('/api/certifications/requirements?tier=CERTIFIED');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tier).toBe('CERTIFIED');
    expect(res.body.data.requirements).toHaveLength(3);
  });
  it('[C-CERTIFIED-6] tier=CERTIFIED returns 3 requirements', async () => {
    const app = makeApp(oid('c-certified-6'));
    const res = await request(app).get('/api/certifications/requirements?tier=CERTIFIED');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tier).toBe('CERTIFIED');
    expect(res.body.data.requirements).toHaveLength(3);
  });
  it('[C-CERTIFIED-7] tier=CERTIFIED returns 3 requirements', async () => {
    const app = makeApp(oid('c-certified-7'));
    const res = await request(app).get('/api/certifications/requirements?tier=CERTIFIED');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tier).toBe('CERTIFIED');
    expect(res.body.data.requirements).toHaveLength(3);
  });
  it('[C-CERTIFIED-8] tier=CERTIFIED returns 3 requirements', async () => {
    const app = makeApp(oid('c-certified-8'));
    const res = await request(app).get('/api/certifications/requirements?tier=CERTIFIED');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tier).toBe('CERTIFIED');
    expect(res.body.data.requirements).toHaveLength(3);
  });
  it('[C-CERTIFIED-9] tier=CERTIFIED returns 3 requirements', async () => {
    const app = makeApp(oid('c-certified-9'));
    const res = await request(app).get('/api/certifications/requirements?tier=CERTIFIED');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tier).toBe('CERTIFIED');
    expect(res.body.data.requirements).toHaveLength(3);
  });
  it('[C-GOLD-0] tier=GOLD returns 3 requirements', async () => {
    const app = makeApp(oid('c-gold-0'));
    const res = await request(app).get('/api/certifications/requirements?tier=GOLD');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tier).toBe('GOLD');
    expect(res.body.data.requirements).toHaveLength(3);
  });
  it('[C-GOLD-1] tier=GOLD returns 3 requirements', async () => {
    const app = makeApp(oid('c-gold-1'));
    const res = await request(app).get('/api/certifications/requirements?tier=GOLD');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tier).toBe('GOLD');
    expect(res.body.data.requirements).toHaveLength(3);
  });
  it('[C-GOLD-2] tier=GOLD returns 3 requirements', async () => {
    const app = makeApp(oid('c-gold-2'));
    const res = await request(app).get('/api/certifications/requirements?tier=GOLD');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tier).toBe('GOLD');
    expect(res.body.data.requirements).toHaveLength(3);
  });
  it('[C-GOLD-3] tier=GOLD returns 3 requirements', async () => {
    const app = makeApp(oid('c-gold-3'));
    const res = await request(app).get('/api/certifications/requirements?tier=GOLD');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tier).toBe('GOLD');
    expect(res.body.data.requirements).toHaveLength(3);
  });
  it('[C-GOLD-4] tier=GOLD returns 3 requirements', async () => {
    const app = makeApp(oid('c-gold-4'));
    const res = await request(app).get('/api/certifications/requirements?tier=GOLD');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tier).toBe('GOLD');
    expect(res.body.data.requirements).toHaveLength(3);
  });
  it('[C-GOLD-5] tier=GOLD returns 3 requirements', async () => {
    const app = makeApp(oid('c-gold-5'));
    const res = await request(app).get('/api/certifications/requirements?tier=GOLD');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tier).toBe('GOLD');
    expect(res.body.data.requirements).toHaveLength(3);
  });
  it('[C-GOLD-6] tier=GOLD returns 3 requirements', async () => {
    const app = makeApp(oid('c-gold-6'));
    const res = await request(app).get('/api/certifications/requirements?tier=GOLD');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tier).toBe('GOLD');
    expect(res.body.data.requirements).toHaveLength(3);
  });
  it('[C-GOLD-7] tier=GOLD returns 3 requirements', async () => {
    const app = makeApp(oid('c-gold-7'));
    const res = await request(app).get('/api/certifications/requirements?tier=GOLD');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tier).toBe('GOLD');
    expect(res.body.data.requirements).toHaveLength(3);
  });
  it('[C-GOLD-8] tier=GOLD returns 3 requirements', async () => {
    const app = makeApp(oid('c-gold-8'));
    const res = await request(app).get('/api/certifications/requirements?tier=GOLD');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tier).toBe('GOLD');
    expect(res.body.data.requirements).toHaveLength(3);
  });
  it('[C-GOLD-9] tier=GOLD returns 3 requirements', async () => {
    const app = makeApp(oid('c-gold-9'));
    const res = await request(app).get('/api/certifications/requirements?tier=GOLD');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tier).toBe('GOLD');
    expect(res.body.data.requirements).toHaveLength(3);
  });
  it('[C-PLATINUM-0] tier=PLATINUM returns 4 requirements', async () => {
    const app = makeApp(oid('c-platinum-0'));
    const res = await request(app).get('/api/certifications/requirements?tier=PLATINUM');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tier).toBe('PLATINUM');
    expect(res.body.data.requirements).toHaveLength(4);
  });
  it('[C-PLATINUM-1] tier=PLATINUM returns 4 requirements', async () => {
    const app = makeApp(oid('c-platinum-1'));
    const res = await request(app).get('/api/certifications/requirements?tier=PLATINUM');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tier).toBe('PLATINUM');
    expect(res.body.data.requirements).toHaveLength(4);
  });
  it('[C-PLATINUM-2] tier=PLATINUM returns 4 requirements', async () => {
    const app = makeApp(oid('c-platinum-2'));
    const res = await request(app).get('/api/certifications/requirements?tier=PLATINUM');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tier).toBe('PLATINUM');
    expect(res.body.data.requirements).toHaveLength(4);
  });
  it('[C-PLATINUM-3] tier=PLATINUM returns 4 requirements', async () => {
    const app = makeApp(oid('c-platinum-3'));
    const res = await request(app).get('/api/certifications/requirements?tier=PLATINUM');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tier).toBe('PLATINUM');
    expect(res.body.data.requirements).toHaveLength(4);
  });
  it('[C-PLATINUM-4] tier=PLATINUM returns 4 requirements', async () => {
    const app = makeApp(oid('c-platinum-4'));
    const res = await request(app).get('/api/certifications/requirements?tier=PLATINUM');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tier).toBe('PLATINUM');
    expect(res.body.data.requirements).toHaveLength(4);
  });
  it('[C-PLATINUM-5] tier=PLATINUM returns 4 requirements', async () => {
    const app = makeApp(oid('c-platinum-5'));
    const res = await request(app).get('/api/certifications/requirements?tier=PLATINUM');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tier).toBe('PLATINUM');
    expect(res.body.data.requirements).toHaveLength(4);
  });
  it('[C-PLATINUM-6] tier=PLATINUM returns 4 requirements', async () => {
    const app = makeApp(oid('c-platinum-6'));
    const res = await request(app).get('/api/certifications/requirements?tier=PLATINUM');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tier).toBe('PLATINUM');
    expect(res.body.data.requirements).toHaveLength(4);
  });
  it('[C-PLATINUM-7] tier=PLATINUM returns 4 requirements', async () => {
    const app = makeApp(oid('c-platinum-7'));
    const res = await request(app).get('/api/certifications/requirements?tier=PLATINUM');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tier).toBe('PLATINUM');
    expect(res.body.data.requirements).toHaveLength(4);
  });
  it('[C-PLATINUM-8] tier=PLATINUM returns 4 requirements', async () => {
    const app = makeApp(oid('c-platinum-8'));
    const res = await request(app).get('/api/certifications/requirements?tier=PLATINUM');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tier).toBe('PLATINUM');
    expect(res.body.data.requirements).toHaveLength(4);
  });
  it('[C-PLATINUM-9] tier=PLATINUM returns 4 requirements', async () => {
    const app = makeApp(oid('c-platinum-9'));
    const res = await request(app).get('/api/certifications/requirements?tier=PLATINUM');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tier).toBe('PLATINUM');
    expect(res.body.data.requirements).toHaveLength(4);
  });
});

// ─── Suite D: GET /requirements invalid tier ─────────────────────────────────
describe('GET /api/certifications/requirements — invalid tier returns 400', () => {
  it('[D-0] tier=INVALID rep=0 returns 400', async () => {
    const app = makeApp(oid('d-0-0'));
    const res = await request(app).get('/api/certifications/requirements?tier=INVALID');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  it('[D-1] tier=INVALID rep=1 returns 400', async () => {
    const app = makeApp(oid('d-0-1'));
    const res = await request(app).get('/api/certifications/requirements?tier=INVALID');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  it('[D-2] tier=INVALID rep=2 returns 400', async () => {
    const app = makeApp(oid('d-0-2'));
    const res = await request(app).get('/api/certifications/requirements?tier=INVALID');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  it('[D-3] tier=INVALID rep=3 returns 400', async () => {
    const app = makeApp(oid('d-0-3'));
    const res = await request(app).get('/api/certifications/requirements?tier=INVALID');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  it('[D-4] tier=INVALID rep=4 returns 400', async () => {
    const app = makeApp(oid('d-0-4'));
    const res = await request(app).get('/api/certifications/requirements?tier=INVALID');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  it('[D-5] tier=BRONZE rep=0 returns 400', async () => {
    const app = makeApp(oid('d-1-0'));
    const res = await request(app).get('/api/certifications/requirements?tier=BRONZE');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  it('[D-6] tier=BRONZE rep=1 returns 400', async () => {
    const app = makeApp(oid('d-1-1'));
    const res = await request(app).get('/api/certifications/requirements?tier=BRONZE');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  it('[D-7] tier=BRONZE rep=2 returns 400', async () => {
    const app = makeApp(oid('d-1-2'));
    const res = await request(app).get('/api/certifications/requirements?tier=BRONZE');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  it('[D-8] tier=BRONZE rep=3 returns 400', async () => {
    const app = makeApp(oid('d-1-3'));
    const res = await request(app).get('/api/certifications/requirements?tier=BRONZE');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  it('[D-9] tier=BRONZE rep=4 returns 400', async () => {
    const app = makeApp(oid('d-1-4'));
    const res = await request(app).get('/api/certifications/requirements?tier=BRONZE');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  it('[D-10] tier=SILVER rep=0 returns 400', async () => {
    const app = makeApp(oid('d-2-0'));
    const res = await request(app).get('/api/certifications/requirements?tier=SILVER');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  it('[D-11] tier=SILVER rep=1 returns 400', async () => {
    const app = makeApp(oid('d-2-1'));
    const res = await request(app).get('/api/certifications/requirements?tier=SILVER');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  it('[D-12] tier=SILVER rep=2 returns 400', async () => {
    const app = makeApp(oid('d-2-2'));
    const res = await request(app).get('/api/certifications/requirements?tier=SILVER');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  it('[D-13] tier=SILVER rep=3 returns 400', async () => {
    const app = makeApp(oid('d-2-3'));
    const res = await request(app).get('/api/certifications/requirements?tier=SILVER');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  it('[D-14] tier=SILVER rep=4 returns 400', async () => {
    const app = makeApp(oid('d-2-4'));
    const res = await request(app).get('/api/certifications/requirements?tier=SILVER');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  it('[D-15] tier=BASIC rep=0 returns 400', async () => {
    const app = makeApp(oid('d-3-0'));
    const res = await request(app).get('/api/certifications/requirements?tier=BASIC');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  it('[D-16] tier=BASIC rep=1 returns 400', async () => {
    const app = makeApp(oid('d-3-1'));
    const res = await request(app).get('/api/certifications/requirements?tier=BASIC');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  it('[D-17] tier=BASIC rep=2 returns 400', async () => {
    const app = makeApp(oid('d-3-2'));
    const res = await request(app).get('/api/certifications/requirements?tier=BASIC');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  it('[D-18] tier=BASIC rep=3 returns 400', async () => {
    const app = makeApp(oid('d-3-3'));
    const res = await request(app).get('/api/certifications/requirements?tier=BASIC');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  it('[D-19] tier=BASIC rep=4 returns 400', async () => {
    const app = makeApp(oid('d-3-4'));
    const res = await request(app).get('/api/certifications/requirements?tier=BASIC');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

// ─── Suite E: GET /api/certifications — list ─────────────────────────────────
describe('GET /api/certifications — list', () => {
  it('[E-0] returns 200 and success:true for org-e-0', async () => {
    const app = makeApp(oid('e-0'));
    const res = await request(app).get('/api/certifications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[E-1] returns 200 and success:true for org-e-1', async () => {
    const app = makeApp(oid('e-1'));
    const res = await request(app).get('/api/certifications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[E-2] returns 200 and success:true for org-e-2', async () => {
    const app = makeApp(oid('e-2'));
    const res = await request(app).get('/api/certifications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[E-3] returns 200 and success:true for org-e-3', async () => {
    const app = makeApp(oid('e-3'));
    const res = await request(app).get('/api/certifications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[E-4] returns 200 and success:true for org-e-4', async () => {
    const app = makeApp(oid('e-4'));
    const res = await request(app).get('/api/certifications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[E-5] returns 200 and success:true for org-e-5', async () => {
    const app = makeApp(oid('e-5'));
    const res = await request(app).get('/api/certifications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[E-6] returns 200 and success:true for org-e-6', async () => {
    const app = makeApp(oid('e-6'));
    const res = await request(app).get('/api/certifications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[E-7] returns 200 and success:true for org-e-7', async () => {
    const app = makeApp(oid('e-7'));
    const res = await request(app).get('/api/certifications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[E-8] returns 200 and success:true for org-e-8', async () => {
    const app = makeApp(oid('e-8'));
    const res = await request(app).get('/api/certifications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[E-9] returns 200 and success:true for org-e-9', async () => {
    const app = makeApp(oid('e-9'));
    const res = await request(app).get('/api/certifications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[E-10] returns 200 and success:true for org-e-10', async () => {
    const app = makeApp(oid('e-10'));
    const res = await request(app).get('/api/certifications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[E-11] returns 200 and success:true for org-e-11', async () => {
    const app = makeApp(oid('e-11'));
    const res = await request(app).get('/api/certifications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[E-12] returns 200 and success:true for org-e-12', async () => {
    const app = makeApp(oid('e-12'));
    const res = await request(app).get('/api/certifications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[E-13] returns 200 and success:true for org-e-13', async () => {
    const app = makeApp(oid('e-13'));
    const res = await request(app).get('/api/certifications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[E-14] returns 200 and success:true for org-e-14', async () => {
    const app = makeApp(oid('e-14'));
    const res = await request(app).get('/api/certifications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[E-15] returns 200 and success:true for org-e-15', async () => {
    const app = makeApp(oid('e-15'));
    const res = await request(app).get('/api/certifications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[E-16] returns 200 and success:true for org-e-16', async () => {
    const app = makeApp(oid('e-16'));
    const res = await request(app).get('/api/certifications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[E-17] returns 200 and success:true for org-e-17', async () => {
    const app = makeApp(oid('e-17'));
    const res = await request(app).get('/api/certifications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[E-18] returns 200 and success:true for org-e-18', async () => {
    const app = makeApp(oid('e-18'));
    const res = await request(app).get('/api/certifications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[E-19] returns 200 and success:true for org-e-19', async () => {
    const app = makeApp(oid('e-19'));
    const res = await request(app).get('/api/certifications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[E-20] returns 200 and success:true for org-e-20', async () => {
    const app = makeApp(oid('e-20'));
    const res = await request(app).get('/api/certifications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[E-21] returns 200 and success:true for org-e-21', async () => {
    const app = makeApp(oid('e-21'));
    const res = await request(app).get('/api/certifications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[E-22] returns 200 and success:true for org-e-22', async () => {
    const app = makeApp(oid('e-22'));
    const res = await request(app).get('/api/certifications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[E-23] returns 200 and success:true for org-e-23', async () => {
    const app = makeApp(oid('e-23'));
    const res = await request(app).get('/api/certifications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[E-24] returns 200 and success:true for org-e-24', async () => {
    const app = makeApp(oid('e-24'));
    const res = await request(app).get('/api/certifications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[E-25] returns 200 and success:true for org-e-25', async () => {
    const app = makeApp(oid('e-25'));
    const res = await request(app).get('/api/certifications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[E-26] returns 200 and success:true for org-e-26', async () => {
    const app = makeApp(oid('e-26'));
    const res = await request(app).get('/api/certifications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[E-27] returns 200 and success:true for org-e-27', async () => {
    const app = makeApp(oid('e-27'));
    const res = await request(app).get('/api/certifications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[E-28] returns 200 and success:true for org-e-28', async () => {
    const app = makeApp(oid('e-28'));
    const res = await request(app).get('/api/certifications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[E-29] returns 200 and success:true for org-e-29', async () => {
    const app = makeApp(oid('e-29'));
    const res = await request(app).get('/api/certifications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[E-30] returns 200 and success:true for org-e-30', async () => {
    const app = makeApp(oid('e-30'));
    const res = await request(app).get('/api/certifications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[E-31] returns 200 and success:true for org-e-31', async () => {
    const app = makeApp(oid('e-31'));
    const res = await request(app).get('/api/certifications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[E-32] returns 200 and success:true for org-e-32', async () => {
    const app = makeApp(oid('e-32'));
    const res = await request(app).get('/api/certifications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[E-33] returns 200 and success:true for org-e-33', async () => {
    const app = makeApp(oid('e-33'));
    const res = await request(app).get('/api/certifications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[E-34] returns 200 and success:true for org-e-34', async () => {
    const app = makeApp(oid('e-34'));
    const res = await request(app).get('/api/certifications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[E-35] returns 200 and success:true for org-e-35', async () => {
    const app = makeApp(oid('e-35'));
    const res = await request(app).get('/api/certifications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[E-36] returns 200 and success:true for org-e-36', async () => {
    const app = makeApp(oid('e-36'));
    const res = await request(app).get('/api/certifications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[E-37] returns 200 and success:true for org-e-37', async () => {
    const app = makeApp(oid('e-37'));
    const res = await request(app).get('/api/certifications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[E-38] returns 200 and success:true for org-e-38', async () => {
    const app = makeApp(oid('e-38'));
    const res = await request(app).get('/api/certifications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[E-39] returns 200 and success:true for org-e-39', async () => {
    const app = makeApp(oid('e-39'));
    const res = await request(app).get('/api/certifications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[E-40] returns 200 and success:true for org-e-40', async () => {
    const app = makeApp(oid('e-40'));
    const res = await request(app).get('/api/certifications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[E-41] returns 200 and success:true for org-e-41', async () => {
    const app = makeApp(oid('e-41'));
    const res = await request(app).get('/api/certifications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[E-42] returns 200 and success:true for org-e-42', async () => {
    const app = makeApp(oid('e-42'));
    const res = await request(app).get('/api/certifications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[E-43] returns 200 and success:true for org-e-43', async () => {
    const app = makeApp(oid('e-43'));
    const res = await request(app).get('/api/certifications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[E-44] returns 200 and success:true for org-e-44', async () => {
    const app = makeApp(oid('e-44'));
    const res = await request(app).get('/api/certifications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[E-45] returns 200 and success:true for org-e-45', async () => {
    const app = makeApp(oid('e-45'));
    const res = await request(app).get('/api/certifications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[E-46] returns 200 and success:true for org-e-46', async () => {
    const app = makeApp(oid('e-46'));
    const res = await request(app).get('/api/certifications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[E-47] returns 200 and success:true for org-e-47', async () => {
    const app = makeApp(oid('e-47'));
    const res = await request(app).get('/api/certifications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[E-48] returns 200 and success:true for org-e-48', async () => {
    const app = makeApp(oid('e-48'));
    const res = await request(app).get('/api/certifications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[E-49] returns 200 and success:true for org-e-49', async () => {
    const app = makeApp(oid('e-49'));
    const res = await request(app).get('/api/certifications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

// ─── Suite F: GET /api/certifications — shape ────────────────────────────────
describe('GET /api/certifications — response shape', () => {
  const appF = makeApp(oid('f-shape'));
  it('[F-0] has data property', async () => {
    const res = await request(appF).get('/api/certifications');
    expect(res.body).toHaveProperty('data');
  });
  it('[F-1] data has currentTier', async () => {
    const res = await request(appF).get('/api/certifications');
    expect(res.body.data).toHaveProperty('currentTier');
  });
  it('[F-2] data has certifications', async () => {
    const res = await request(appF).get('/api/certifications');
    expect(res.body.data).toHaveProperty('certifications');
  });
  it('[F-3] certifications is array', async () => {
    const res = await request(appF).get('/api/certifications');
    expect(Array.isArray(res.body.data.certifications)).toBe(true);
  });
  it('[F-4] currentTier defaults to REGISTERED', async () => {
    const res = await request(appF).get('/api/certifications');
    expect(res.body.data.currentTier).toBe('REGISTERED');
  });
  it('[F-5] empty org has empty certs', async () => {
    const res = await request(appF).get('/api/certifications');
    expect(res.body.data.certifications).toHaveLength(0);
  });
  it('[F-6] currentTier is valid tier', async () => {
    const res = await request(appF).get('/api/certifications');
    expect(['REGISTERED','CERTIFIED','GOLD','PLATINUM']).toContain(res.body.data.currentTier);
  });
  it('[F-7] data is not null', async () => {
    const res = await request(appF).get('/api/certifications');
    expect(res.body.data).not.toBeNull();
  });
  it('[F-8] success is true', async () => {
    const res = await request(appF).get('/api/certifications');
    expect(res.body.success).toBe(true);
  });
  it('[F-9] certifications not null', async () => {
    const res = await request(appF).get('/api/certifications');
    expect(res.body.data.certifications).not.toBeNull();
  });
  it('[F-10] content-type json', async () => {
    const res = await request(appF).get('/api/certifications');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[F-11] status 200', async () => {
    const res = await request(appF).get('/api/certifications');
    expect(res.status).toBe(200);
  });
  it('[F-12] certifications length non-negative', async () => {
    const res = await request(appF).get('/api/certifications');
    expect(res.body.data.certifications.length).toBeGreaterThanOrEqual(0);
  });
  it('[F-13] currentTier is a string', async () => {
    const res = await request(appF).get('/api/certifications');
    expect(typeof res.body.data.currentTier).toBe('string');
  });
  it('[F-14] certifications array defined', async () => {
    const res = await request(appF).get('/api/certifications');
    expect(res.body.data.certifications).toBeDefined();
  });
  it('[F-15] currentTier defined', async () => {
    const res = await request(appF).get('/api/certifications');
    expect(res.body.data.currentTier).toBeDefined();
  });
  it('[F-16] response body is object', async () => {
    const res = await request(appF).get('/api/certifications');
    expect(typeof res.body).toBe('object');
  });
  it('[F-17] response body not array', async () => {
    const res = await request(appF).get('/api/certifications');
    expect(Array.isArray(res.body)).toBe(false);
  });
  it('[F-18] data is object', async () => {
    const res = await request(appF).get('/api/certifications');
    expect(typeof res.body.data).toBe('object');
  });
  it('[F-19] no success:false', async () => {
    const res = await request(appF).get('/api/certifications');
    expect(res.body.success).not.toBe(false);
  });
});

// ─── Suite G: POST /api/certifications — create ───────────────────────────────
describe('POST /api/certifications — create', () => {
  it('[G-REGISTERED-0] returns 201 for REGISTERED tier', async () => {
    const app = makeApp(oid('g-registered-0'));
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
  it('[G-REGISTERED-1] returns 201 for REGISTERED tier', async () => {
    const app = makeApp(oid('g-registered-1'));
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
  it('[G-REGISTERED-2] returns 201 for REGISTERED tier', async () => {
    const app = makeApp(oid('g-registered-2'));
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
  it('[G-REGISTERED-3] returns 201 for REGISTERED tier', async () => {
    const app = makeApp(oid('g-registered-3'));
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
  it('[G-REGISTERED-4] returns 201 for REGISTERED tier', async () => {
    const app = makeApp(oid('g-registered-4'));
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
  it('[G-REGISTERED-5] returns 201 for REGISTERED tier', async () => {
    const app = makeApp(oid('g-registered-5'));
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
  it('[G-REGISTERED-6] returns 201 for REGISTERED tier', async () => {
    const app = makeApp(oid('g-registered-6'));
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
  it('[G-REGISTERED-7] returns 201 for REGISTERED tier', async () => {
    const app = makeApp(oid('g-registered-7'));
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
  it('[G-REGISTERED-8] returns 201 for REGISTERED tier', async () => {
    const app = makeApp(oid('g-registered-8'));
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
  it('[G-REGISTERED-9] returns 201 for REGISTERED tier', async () => {
    const app = makeApp(oid('g-registered-9'));
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
  it('[G-REGISTERED-10] returns 201 for REGISTERED tier', async () => {
    const app = makeApp(oid('g-registered-10'));
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
  it('[G-REGISTERED-11] returns 201 for REGISTERED tier', async () => {
    const app = makeApp(oid('g-registered-11'));
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
  it('[G-REGISTERED-12] returns 201 for REGISTERED tier', async () => {
    const app = makeApp(oid('g-registered-12'));
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
  it('[G-REGISTERED-13] returns 201 for REGISTERED tier', async () => {
    const app = makeApp(oid('g-registered-13'));
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
  it('[G-REGISTERED-14] returns 201 for REGISTERED tier', async () => {
    const app = makeApp(oid('g-registered-14'));
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
  it('[G-REGISTERED-15] returns 201 for REGISTERED tier', async () => {
    const app = makeApp(oid('g-registered-15'));
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
  it('[G-REGISTERED-16] returns 201 for REGISTERED tier', async () => {
    const app = makeApp(oid('g-registered-16'));
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
  it('[G-REGISTERED-17] returns 201 for REGISTERED tier', async () => {
    const app = makeApp(oid('g-registered-17'));
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
  it('[G-REGISTERED-18] returns 201 for REGISTERED tier', async () => {
    const app = makeApp(oid('g-registered-18'));
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
  it('[G-REGISTERED-19] returns 201 for REGISTERED tier', async () => {
    const app = makeApp(oid('g-registered-19'));
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
  it('[G-CERTIFIED-0] returns 201 for CERTIFIED tier', async () => {
    const app = makeApp(oid('g-certified-0'));
    const res = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
  it('[G-CERTIFIED-1] returns 201 for CERTIFIED tier', async () => {
    const app = makeApp(oid('g-certified-1'));
    const res = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
  it('[G-CERTIFIED-2] returns 201 for CERTIFIED tier', async () => {
    const app = makeApp(oid('g-certified-2'));
    const res = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
  it('[G-CERTIFIED-3] returns 201 for CERTIFIED tier', async () => {
    const app = makeApp(oid('g-certified-3'));
    const res = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
  it('[G-CERTIFIED-4] returns 201 for CERTIFIED tier', async () => {
    const app = makeApp(oid('g-certified-4'));
    const res = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
  it('[G-CERTIFIED-5] returns 201 for CERTIFIED tier', async () => {
    const app = makeApp(oid('g-certified-5'));
    const res = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
  it('[G-CERTIFIED-6] returns 201 for CERTIFIED tier', async () => {
    const app = makeApp(oid('g-certified-6'));
    const res = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
  it('[G-CERTIFIED-7] returns 201 for CERTIFIED tier', async () => {
    const app = makeApp(oid('g-certified-7'));
    const res = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
  it('[G-CERTIFIED-8] returns 201 for CERTIFIED tier', async () => {
    const app = makeApp(oid('g-certified-8'));
    const res = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
  it('[G-CERTIFIED-9] returns 201 for CERTIFIED tier', async () => {
    const app = makeApp(oid('g-certified-9'));
    const res = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
  it('[G-CERTIFIED-10] returns 201 for CERTIFIED tier', async () => {
    const app = makeApp(oid('g-certified-10'));
    const res = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
  it('[G-CERTIFIED-11] returns 201 for CERTIFIED tier', async () => {
    const app = makeApp(oid('g-certified-11'));
    const res = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
  it('[G-CERTIFIED-12] returns 201 for CERTIFIED tier', async () => {
    const app = makeApp(oid('g-certified-12'));
    const res = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
  it('[G-CERTIFIED-13] returns 201 for CERTIFIED tier', async () => {
    const app = makeApp(oid('g-certified-13'));
    const res = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
  it('[G-CERTIFIED-14] returns 201 for CERTIFIED tier', async () => {
    const app = makeApp(oid('g-certified-14'));
    const res = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
  it('[G-CERTIFIED-15] returns 201 for CERTIFIED tier', async () => {
    const app = makeApp(oid('g-certified-15'));
    const res = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
  it('[G-CERTIFIED-16] returns 201 for CERTIFIED tier', async () => {
    const app = makeApp(oid('g-certified-16'));
    const res = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
  it('[G-CERTIFIED-17] returns 201 for CERTIFIED tier', async () => {
    const app = makeApp(oid('g-certified-17'));
    const res = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
  it('[G-CERTIFIED-18] returns 201 for CERTIFIED tier', async () => {
    const app = makeApp(oid('g-certified-18'));
    const res = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
  it('[G-CERTIFIED-19] returns 201 for CERTIFIED tier', async () => {
    const app = makeApp(oid('g-certified-19'));
    const res = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
  it('[G-GOLD-0] returns 201 for GOLD tier', async () => {
    const app = makeApp(oid('g-gold-0'));
    const res = await request(app).post('/api/certifications').send({ tier: 'GOLD' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
  it('[G-GOLD-1] returns 201 for GOLD tier', async () => {
    const app = makeApp(oid('g-gold-1'));
    const res = await request(app).post('/api/certifications').send({ tier: 'GOLD' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
  it('[G-GOLD-2] returns 201 for GOLD tier', async () => {
    const app = makeApp(oid('g-gold-2'));
    const res = await request(app).post('/api/certifications').send({ tier: 'GOLD' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
  it('[G-GOLD-3] returns 201 for GOLD tier', async () => {
    const app = makeApp(oid('g-gold-3'));
    const res = await request(app).post('/api/certifications').send({ tier: 'GOLD' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
  it('[G-GOLD-4] returns 201 for GOLD tier', async () => {
    const app = makeApp(oid('g-gold-4'));
    const res = await request(app).post('/api/certifications').send({ tier: 'GOLD' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
  it('[G-GOLD-5] returns 201 for GOLD tier', async () => {
    const app = makeApp(oid('g-gold-5'));
    const res = await request(app).post('/api/certifications').send({ tier: 'GOLD' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
  it('[G-GOLD-6] returns 201 for GOLD tier', async () => {
    const app = makeApp(oid('g-gold-6'));
    const res = await request(app).post('/api/certifications').send({ tier: 'GOLD' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
  it('[G-GOLD-7] returns 201 for GOLD tier', async () => {
    const app = makeApp(oid('g-gold-7'));
    const res = await request(app).post('/api/certifications').send({ tier: 'GOLD' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
  it('[G-GOLD-8] returns 201 for GOLD tier', async () => {
    const app = makeApp(oid('g-gold-8'));
    const res = await request(app).post('/api/certifications').send({ tier: 'GOLD' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
  it('[G-GOLD-9] returns 201 for GOLD tier', async () => {
    const app = makeApp(oid('g-gold-9'));
    const res = await request(app).post('/api/certifications').send({ tier: 'GOLD' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
  it('[G-GOLD-10] returns 201 for GOLD tier', async () => {
    const app = makeApp(oid('g-gold-10'));
    const res = await request(app).post('/api/certifications').send({ tier: 'GOLD' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
  it('[G-GOLD-11] returns 201 for GOLD tier', async () => {
    const app = makeApp(oid('g-gold-11'));
    const res = await request(app).post('/api/certifications').send({ tier: 'GOLD' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
  it('[G-GOLD-12] returns 201 for GOLD tier', async () => {
    const app = makeApp(oid('g-gold-12'));
    const res = await request(app).post('/api/certifications').send({ tier: 'GOLD' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
  it('[G-GOLD-13] returns 201 for GOLD tier', async () => {
    const app = makeApp(oid('g-gold-13'));
    const res = await request(app).post('/api/certifications').send({ tier: 'GOLD' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
  it('[G-GOLD-14] returns 201 for GOLD tier', async () => {
    const app = makeApp(oid('g-gold-14'));
    const res = await request(app).post('/api/certifications').send({ tier: 'GOLD' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
  it('[G-GOLD-15] returns 201 for GOLD tier', async () => {
    const app = makeApp(oid('g-gold-15'));
    const res = await request(app).post('/api/certifications').send({ tier: 'GOLD' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
  it('[G-GOLD-16] returns 201 for GOLD tier', async () => {
    const app = makeApp(oid('g-gold-16'));
    const res = await request(app).post('/api/certifications').send({ tier: 'GOLD' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
  it('[G-GOLD-17] returns 201 for GOLD tier', async () => {
    const app = makeApp(oid('g-gold-17'));
    const res = await request(app).post('/api/certifications').send({ tier: 'GOLD' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
  it('[G-GOLD-18] returns 201 for GOLD tier', async () => {
    const app = makeApp(oid('g-gold-18'));
    const res = await request(app).post('/api/certifications').send({ tier: 'GOLD' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
  it('[G-GOLD-19] returns 201 for GOLD tier', async () => {
    const app = makeApp(oid('g-gold-19'));
    const res = await request(app).post('/api/certifications').send({ tier: 'GOLD' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
  it('[G-PLATINUM-0] returns 201 for PLATINUM tier', async () => {
    const app = makeApp(oid('g-platinum-0'));
    const res = await request(app).post('/api/certifications').send({ tier: 'PLATINUM' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
  it('[G-PLATINUM-1] returns 201 for PLATINUM tier', async () => {
    const app = makeApp(oid('g-platinum-1'));
    const res = await request(app).post('/api/certifications').send({ tier: 'PLATINUM' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
  it('[G-PLATINUM-2] returns 201 for PLATINUM tier', async () => {
    const app = makeApp(oid('g-platinum-2'));
    const res = await request(app).post('/api/certifications').send({ tier: 'PLATINUM' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
  it('[G-PLATINUM-3] returns 201 for PLATINUM tier', async () => {
    const app = makeApp(oid('g-platinum-3'));
    const res = await request(app).post('/api/certifications').send({ tier: 'PLATINUM' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
  it('[G-PLATINUM-4] returns 201 for PLATINUM tier', async () => {
    const app = makeApp(oid('g-platinum-4'));
    const res = await request(app).post('/api/certifications').send({ tier: 'PLATINUM' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
  it('[G-PLATINUM-5] returns 201 for PLATINUM tier', async () => {
    const app = makeApp(oid('g-platinum-5'));
    const res = await request(app).post('/api/certifications').send({ tier: 'PLATINUM' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
  it('[G-PLATINUM-6] returns 201 for PLATINUM tier', async () => {
    const app = makeApp(oid('g-platinum-6'));
    const res = await request(app).post('/api/certifications').send({ tier: 'PLATINUM' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
  it('[G-PLATINUM-7] returns 201 for PLATINUM tier', async () => {
    const app = makeApp(oid('g-platinum-7'));
    const res = await request(app).post('/api/certifications').send({ tier: 'PLATINUM' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
  it('[G-PLATINUM-8] returns 201 for PLATINUM tier', async () => {
    const app = makeApp(oid('g-platinum-8'));
    const res = await request(app).post('/api/certifications').send({ tier: 'PLATINUM' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
  it('[G-PLATINUM-9] returns 201 for PLATINUM tier', async () => {
    const app = makeApp(oid('g-platinum-9'));
    const res = await request(app).post('/api/certifications').send({ tier: 'PLATINUM' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
  it('[G-PLATINUM-10] returns 201 for PLATINUM tier', async () => {
    const app = makeApp(oid('g-platinum-10'));
    const res = await request(app).post('/api/certifications').send({ tier: 'PLATINUM' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
  it('[G-PLATINUM-11] returns 201 for PLATINUM tier', async () => {
    const app = makeApp(oid('g-platinum-11'));
    const res = await request(app).post('/api/certifications').send({ tier: 'PLATINUM' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
  it('[G-PLATINUM-12] returns 201 for PLATINUM tier', async () => {
    const app = makeApp(oid('g-platinum-12'));
    const res = await request(app).post('/api/certifications').send({ tier: 'PLATINUM' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
  it('[G-PLATINUM-13] returns 201 for PLATINUM tier', async () => {
    const app = makeApp(oid('g-platinum-13'));
    const res = await request(app).post('/api/certifications').send({ tier: 'PLATINUM' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
  it('[G-PLATINUM-14] returns 201 for PLATINUM tier', async () => {
    const app = makeApp(oid('g-platinum-14'));
    const res = await request(app).post('/api/certifications').send({ tier: 'PLATINUM' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
  it('[G-PLATINUM-15] returns 201 for PLATINUM tier', async () => {
    const app = makeApp(oid('g-platinum-15'));
    const res = await request(app).post('/api/certifications').send({ tier: 'PLATINUM' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
  it('[G-PLATINUM-16] returns 201 for PLATINUM tier', async () => {
    const app = makeApp(oid('g-platinum-16'));
    const res = await request(app).post('/api/certifications').send({ tier: 'PLATINUM' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
  it('[G-PLATINUM-17] returns 201 for PLATINUM tier', async () => {
    const app = makeApp(oid('g-platinum-17'));
    const res = await request(app).post('/api/certifications').send({ tier: 'PLATINUM' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
  it('[G-PLATINUM-18] returns 201 for PLATINUM tier', async () => {
    const app = makeApp(oid('g-platinum-18'));
    const res = await request(app).post('/api/certifications').send({ tier: 'PLATINUM' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
  it('[G-PLATINUM-19] returns 201 for PLATINUM tier', async () => {
    const app = makeApp(oid('g-platinum-19'));
    const res = await request(app).post('/api/certifications').send({ tier: 'PLATINUM' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
});

// ─── Suite H: POST /api/certifications — response shape ──────────────────────
describe('POST /api/certifications — response data shape', () => {
  it('[H-0] data has id', async () => {
    const app = makeApp(oid('h-0')); const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' }); expect(res.body.data).toHaveProperty('id');
  });
  it('[H-1] data has partnerId', async () => {
    const app = makeApp(oid('h-1')); const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' }); expect(res.body.data).toHaveProperty('partnerId');
  });
  it('[H-2] data has tier', async () => {
    const app = makeApp(oid('h-2')); const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' }); expect(res.body.data).toHaveProperty('tier');
  });
  it('[H-3] data has competencyArea', async () => {
    const app = makeApp(oid('h-3')); const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' }); expect(res.body.data).toHaveProperty('competencyArea');
  });
  it('[H-4] data has status', async () => {
    const app = makeApp(oid('h-4')); const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' }); expect(res.body.data).toHaveProperty('status');
  });
  it('[H-5] data has requirements', async () => {
    const app = makeApp(oid('h-5')); const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' }); expect(res.body.data).toHaveProperty('requirements');
  });
  it('[H-6] data has createdAt', async () => {
    const app = makeApp(oid('h-6')); const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' }); expect(res.body.data).toHaveProperty('createdAt');
  });
  it('[H-7] data has updatedAt', async () => {
    const app = makeApp(oid('h-7')); const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' }); expect(res.body.data).toHaveProperty('updatedAt');
  });
  it('[H-8] data.status is IN_PROGRESS', async () => {
    const app = makeApp(oid('h-8')); const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' }); expect(res.body.data.status).toBe('IN_PROGRESS');
  });
  it('[H-9] data.tier is REGISTERED', async () => {
    const app = makeApp(oid('h-9')); const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' }); expect(res.body.data.tier).toBe('REGISTERED');
  });
  it('[H-10] data.requirements is array', async () => {
    const app = makeApp(oid('h-10')); const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' }); expect(Array.isArray(res.body.data.requirements)).toBe(true);
  });
  it('[H-11] REGISTERED has 2 requirements', async () => {
    const app = makeApp(oid('h-11')); const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' }); expect(res.body.data.requirements).toHaveLength(2);
  });
  it('[H-12] data.id is non-empty string', async () => {
    const app = makeApp(oid('h-12')); const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' }); expect(typeof res.body.data.id).toBe('string'); expect(res.body.data.id.length).toBeGreaterThan(0);
  });
  it('[H-13] data.id starts with pcert_', async () => {
    const app = makeApp(oid('h-13')); const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' }); expect(res.body.data.id).toMatch(/^pcert_/);
  });
  it('[H-14] data.partnerId matches org', async () => {
    const app = makeApp(oid('h-14')); const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' }); expect(res.body.data.partnerId).toBe(oid('h-14'));
  });
  it('[H-15] requirements have requirementId', async () => {
    const app = makeApp(oid('h-15')); const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' }); res.body.data.requirements.forEach((r: any) => expect(r).toHaveProperty('requirementId'));
  });
  it('[H-16] requirements have met:false', async () => {
    const app = makeApp(oid('h-16')); const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' }); res.body.data.requirements.forEach((r: any) => expect(r.met).toBe(false));
  });
  it('[H-17] competencyArea defaults IMPLEMENTATION', async () => {
    const app = makeApp(oid('h-17')); const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' }); expect(res.body.data.competencyArea).toBe('IMPLEMENTATION');
  });
  it('[H-18] createdAt is valid date', async () => {
    const app = makeApp(oid('h-18')); const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' }); expect(new Date(res.body.data.createdAt).getTime()).not.toBeNaN();
  });
  it('[H-19] updatedAt is valid date', async () => {
    const app = makeApp(oid('h-19')); const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' }); expect(new Date(res.body.data.updatedAt).getTime()).not.toBeNaN();
  });
  it('[H-20] CERTIFIED has 3 requirements', async () => {
    const app = makeApp(oid('h-20')); const res = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' }); expect(res.body.data.requirements).toHaveLength(3);
  });
  it('[H-21] CERTIFIED status IN_PROGRESS', async () => {
    const app = makeApp(oid('h-21')); const res = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' }); expect(res.body.data.status).toBe('IN_PROGRESS');
  });
  it('[H-22] GOLD has 3 requirements', async () => {
    const app = makeApp(oid('h-22')); const res = await request(app).post('/api/certifications').send({ tier: 'GOLD' }); expect(res.body.data.requirements).toHaveLength(3);
  });
  it('[H-23] GOLD status IN_PROGRESS', async () => {
    const app = makeApp(oid('h-23')); const res = await request(app).post('/api/certifications').send({ tier: 'GOLD' }); expect(res.body.data.status).toBe('IN_PROGRESS');
  });
  it('[H-24] PLATINUM has 4 requirements', async () => {
    const app = makeApp(oid('h-24')); const res = await request(app).post('/api/certifications').send({ tier: 'PLATINUM' }); expect(res.body.data.requirements).toHaveLength(4);
  });
  it('[H-25] PLATINUM status IN_PROGRESS', async () => {
    const app = makeApp(oid('h-25')); const res = await request(app).post('/api/certifications').send({ tier: 'PLATINUM' }); expect(res.body.data.status).toBe('IN_PROGRESS');
  });
  it('[H-26] CERTIFIED id starts pcert_', async () => {
    const app = makeApp(oid('h-26')); const res = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' }); expect(res.body.data.id).toMatch(/^pcert_/);
  });
  it('[H-27] GOLD id starts pcert_', async () => {
    const app = makeApp(oid('h-27')); const res = await request(app).post('/api/certifications').send({ tier: 'GOLD' }); expect(res.body.data.id).toMatch(/^pcert_/);
  });
  it('[H-28] PLATINUM all reqs met:false', async () => {
    const app = makeApp(oid('h-28')); const res = await request(app).post('/api/certifications').send({ tier: 'PLATINUM' }); expect(res.body.data.requirements.every((r: any) => r.met === false)).toBe(true);
  });
  it('[H-29] REGISTERED all reqs met:false', async () => {
    const app = makeApp(oid('h-29')); const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' }); expect(res.body.data.requirements.every((r: any) => r.met === false)).toBe(true);
  });
});

// ─── Suite I: POST invalid tier ──────────────────────────────────────────────
describe('POST /api/certifications — invalid tier returns 400', () => {
  it('[I-0] tier=BRONZE rep=0 returns 400', async () => {
    const app = makeApp(oid('i-0-0'));
    const res = await request(app).post('/api/certifications').send({ tier: 'BRONZE' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  it('[I-1] tier=BRONZE rep=1 returns 400', async () => {
    const app = makeApp(oid('i-0-1'));
    const res = await request(app).post('/api/certifications').send({ tier: 'BRONZE' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  it('[I-2] tier=BRONZE rep=2 returns 400', async () => {
    const app = makeApp(oid('i-0-2'));
    const res = await request(app).post('/api/certifications').send({ tier: 'BRONZE' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  it('[I-3] tier=BRONZE rep=3 returns 400', async () => {
    const app = makeApp(oid('i-0-3'));
    const res = await request(app).post('/api/certifications').send({ tier: 'BRONZE' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  it('[I-4] tier=BRONZE rep=4 returns 400', async () => {
    const app = makeApp(oid('i-0-4'));
    const res = await request(app).post('/api/certifications').send({ tier: 'BRONZE' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  it('[I-5] tier=SILVER rep=0 returns 400', async () => {
    const app = makeApp(oid('i-1-0'));
    const res = await request(app).post('/api/certifications').send({ tier: 'SILVER' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  it('[I-6] tier=SILVER rep=1 returns 400', async () => {
    const app = makeApp(oid('i-1-1'));
    const res = await request(app).post('/api/certifications').send({ tier: 'SILVER' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  it('[I-7] tier=SILVER rep=2 returns 400', async () => {
    const app = makeApp(oid('i-1-2'));
    const res = await request(app).post('/api/certifications').send({ tier: 'SILVER' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  it('[I-8] tier=SILVER rep=3 returns 400', async () => {
    const app = makeApp(oid('i-1-3'));
    const res = await request(app).post('/api/certifications').send({ tier: 'SILVER' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  it('[I-9] tier=SILVER rep=4 returns 400', async () => {
    const app = makeApp(oid('i-1-4'));
    const res = await request(app).post('/api/certifications').send({ tier: 'SILVER' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  it('[I-10] tier=BASIC rep=0 returns 400', async () => {
    const app = makeApp(oid('i-2-0'));
    const res = await request(app).post('/api/certifications').send({ tier: 'BASIC' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  it('[I-11] tier=BASIC rep=1 returns 400', async () => {
    const app = makeApp(oid('i-2-1'));
    const res = await request(app).post('/api/certifications').send({ tier: 'BASIC' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  it('[I-12] tier=BASIC rep=2 returns 400', async () => {
    const app = makeApp(oid('i-2-2'));
    const res = await request(app).post('/api/certifications').send({ tier: 'BASIC' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  it('[I-13] tier=BASIC rep=3 returns 400', async () => {
    const app = makeApp(oid('i-2-3'));
    const res = await request(app).post('/api/certifications').send({ tier: 'BASIC' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  it('[I-14] tier=BASIC rep=4 returns 400', async () => {
    const app = makeApp(oid('i-2-4'));
    const res = await request(app).post('/api/certifications').send({ tier: 'BASIC' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  it('[I-15] tier=PREMIER rep=0 returns 400', async () => {
    const app = makeApp(oid('i-3-0'));
    const res = await request(app).post('/api/certifications').send({ tier: 'PREMIER' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  it('[I-16] tier=PREMIER rep=1 returns 400', async () => {
    const app = makeApp(oid('i-3-1'));
    const res = await request(app).post('/api/certifications').send({ tier: 'PREMIER' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  it('[I-17] tier=PREMIER rep=2 returns 400', async () => {
    const app = makeApp(oid('i-3-2'));
    const res = await request(app).post('/api/certifications').send({ tier: 'PREMIER' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  it('[I-18] tier=PREMIER rep=3 returns 400', async () => {
    const app = makeApp(oid('i-3-3'));
    const res = await request(app).post('/api/certifications').send({ tier: 'PREMIER' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  it('[I-19] tier=PREMIER rep=4 returns 400', async () => {
    const app = makeApp(oid('i-3-4'));
    const res = await request(app).post('/api/certifications').send({ tier: 'PREMIER' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  it('[I-20] tier=ASSOCIATE rep=0 returns 400', async () => {
    const app = makeApp(oid('i-4-0'));
    const res = await request(app).post('/api/certifications').send({ tier: 'ASSOCIATE' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  it('[I-21] tier=ASSOCIATE rep=1 returns 400', async () => {
    const app = makeApp(oid('i-4-1'));
    const res = await request(app).post('/api/certifications').send({ tier: 'ASSOCIATE' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  it('[I-22] tier=ASSOCIATE rep=2 returns 400', async () => {
    const app = makeApp(oid('i-4-2'));
    const res = await request(app).post('/api/certifications').send({ tier: 'ASSOCIATE' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  it('[I-23] tier=ASSOCIATE rep=3 returns 400', async () => {
    const app = makeApp(oid('i-4-3'));
    const res = await request(app).post('/api/certifications').send({ tier: 'ASSOCIATE' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  it('[I-24] tier=ASSOCIATE rep=4 returns 400', async () => {
    const app = makeApp(oid('i-4-4'));
    const res = await request(app).post('/api/certifications').send({ tier: 'ASSOCIATE' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  it('[I-25] tier=EXPERT rep=0 returns 400', async () => {
    const app = makeApp(oid('i-5-0'));
    const res = await request(app).post('/api/certifications').send({ tier: 'EXPERT' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  it('[I-26] tier=EXPERT rep=1 returns 400', async () => {
    const app = makeApp(oid('i-5-1'));
    const res = await request(app).post('/api/certifications').send({ tier: 'EXPERT' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  it('[I-27] tier=EXPERT rep=2 returns 400', async () => {
    const app = makeApp(oid('i-5-2'));
    const res = await request(app).post('/api/certifications').send({ tier: 'EXPERT' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  it('[I-28] tier=EXPERT rep=3 returns 400', async () => {
    const app = makeApp(oid('i-5-3'));
    const res = await request(app).post('/api/certifications').send({ tier: 'EXPERT' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  it('[I-29] tier=EXPERT rep=4 returns 400', async () => {
    const app = makeApp(oid('i-5-4'));
    const res = await request(app).post('/api/certifications').send({ tier: 'EXPERT' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  it('[I-30] tier=MASTER rep=0 returns 400', async () => {
    const app = makeApp(oid('i-6-0'));
    const res = await request(app).post('/api/certifications').send({ tier: 'MASTER' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  it('[I-31] tier=MASTER rep=1 returns 400', async () => {
    const app = makeApp(oid('i-6-1'));
    const res = await request(app).post('/api/certifications').send({ tier: 'MASTER' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  it('[I-32] tier=MASTER rep=2 returns 400', async () => {
    const app = makeApp(oid('i-6-2'));
    const res = await request(app).post('/api/certifications').send({ tier: 'MASTER' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  it('[I-33] tier=MASTER rep=3 returns 400', async () => {
    const app = makeApp(oid('i-6-3'));
    const res = await request(app).post('/api/certifications').send({ tier: 'MASTER' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  it('[I-34] tier=MASTER rep=4 returns 400', async () => {
    const app = makeApp(oid('i-6-4'));
    const res = await request(app).post('/api/certifications').send({ tier: 'MASTER' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  it('[I-35] tier=NONE rep=0 returns 400', async () => {
    const app = makeApp(oid('i-7-0'));
    const res = await request(app).post('/api/certifications').send({ tier: 'NONE' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  it('[I-36] tier=NONE rep=1 returns 400', async () => {
    const app = makeApp(oid('i-7-1'));
    const res = await request(app).post('/api/certifications').send({ tier: 'NONE' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  it('[I-37] tier=NONE rep=2 returns 400', async () => {
    const app = makeApp(oid('i-7-2'));
    const res = await request(app).post('/api/certifications').send({ tier: 'NONE' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  it('[I-38] tier=NONE rep=3 returns 400', async () => {
    const app = makeApp(oid('i-7-3'));
    const res = await request(app).post('/api/certifications').send({ tier: 'NONE' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  it('[I-39] tier=NONE rep=4 returns 400', async () => {
    const app = makeApp(oid('i-7-4'));
    const res = await request(app).post('/api/certifications').send({ tier: 'NONE' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

// ─── Suite J: POST missing tier ──────────────────────────────────────────────
describe('POST /api/certifications — missing tier returns 400', () => {
  it('[J-0] missing tier returns 400', async () => {
    const app = makeApp(oid('j-0'));
    const res = await request(app).post('/api/certifications').send({ });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  it('[J-1] missing tier returns 400', async () => {
    const app = makeApp(oid('j-1'));
    const res = await request(app).post('/api/certifications').send({ });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  it('[J-2] missing tier returns 400', async () => {
    const app = makeApp(oid('j-2'));
    const res = await request(app).post('/api/certifications').send({ });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  it('[J-3] missing tier returns 400', async () => {
    const app = makeApp(oid('j-3'));
    const res = await request(app).post('/api/certifications').send({ });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  it('[J-4] missing tier returns 400', async () => {
    const app = makeApp(oid('j-4'));
    const res = await request(app).post('/api/certifications').send({ });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  it('[J-5] missing tier returns 400', async () => {
    const app = makeApp(oid('j-5'));
    const res = await request(app).post('/api/certifications').send({ });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  it('[J-6] missing tier returns 400', async () => {
    const app = makeApp(oid('j-6'));
    const res = await request(app).post('/api/certifications').send({ });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  it('[J-7] missing tier returns 400', async () => {
    const app = makeApp(oid('j-7'));
    const res = await request(app).post('/api/certifications').send({ });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  it('[J-8] missing tier returns 400', async () => {
    const app = makeApp(oid('j-8'));
    const res = await request(app).post('/api/certifications').send({ });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  it('[J-9] missing tier returns 400', async () => {
    const app = makeApp(oid('j-9'));
    const res = await request(app).post('/api/certifications').send({ });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  it('[J-10] missing tier returns 400', async () => {
    const app = makeApp(oid('j-10'));
    const res = await request(app).post('/api/certifications').send({ });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  it('[J-11] missing tier returns 400', async () => {
    const app = makeApp(oid('j-11'));
    const res = await request(app).post('/api/certifications').send({ });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  it('[J-12] missing tier returns 400', async () => {
    const app = makeApp(oid('j-12'));
    const res = await request(app).post('/api/certifications').send({ });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  it('[J-13] missing tier returns 400', async () => {
    const app = makeApp(oid('j-13'));
    const res = await request(app).post('/api/certifications').send({ });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  it('[J-14] missing tier returns 400', async () => {
    const app = makeApp(oid('j-14'));
    const res = await request(app).post('/api/certifications').send({ });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  it('[J-15] missing tier returns 400', async () => {
    const app = makeApp(oid('j-15'));
    const res = await request(app).post('/api/certifications').send({ });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  it('[J-16] missing tier returns 400', async () => {
    const app = makeApp(oid('j-16'));
    const res = await request(app).post('/api/certifications').send({ });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  it('[J-17] missing tier returns 400', async () => {
    const app = makeApp(oid('j-17'));
    const res = await request(app).post('/api/certifications').send({ });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  it('[J-18] missing tier returns 400', async () => {
    const app = makeApp(oid('j-18'));
    const res = await request(app).post('/api/certifications').send({ });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  it('[J-19] missing tier returns 400', async () => {
    const app = makeApp(oid('j-19'));
    const res = await request(app).post('/api/certifications').send({ });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

// ─── Suite K: POST competencyArea ────────────────────────────────────────────
describe('POST /api/certifications — competencyArea', () => {
  it('[K-0] competencyArea=IMPLEMENTATION rep=0: accepted', async () => {
    const app = makeApp(oid('k-implementation-0'));
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED', competencyArea: 'IMPLEMENTATION' });
    expect(res.status).toBe(201);
    expect(res.body.data.competencyArea).toBe('IMPLEMENTATION');
  });
  it('[K-1] competencyArea=IMPLEMENTATION rep=1: accepted', async () => {
    const app = makeApp(oid('k-implementation-1'));
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED', competencyArea: 'IMPLEMENTATION' });
    expect(res.status).toBe(201);
    expect(res.body.data.competencyArea).toBe('IMPLEMENTATION');
  });
  it('[K-2] competencyArea=IMPLEMENTATION rep=2: accepted', async () => {
    const app = makeApp(oid('k-implementation-2'));
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED', competencyArea: 'IMPLEMENTATION' });
    expect(res.status).toBe(201);
    expect(res.body.data.competencyArea).toBe('IMPLEMENTATION');
  });
  it('[K-3] competencyArea=IMPLEMENTATION rep=3: accepted', async () => {
    const app = makeApp(oid('k-implementation-3'));
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED', competencyArea: 'IMPLEMENTATION' });
    expect(res.status).toBe(201);
    expect(res.body.data.competencyArea).toBe('IMPLEMENTATION');
  });
  it('[K-4] competencyArea=IMPLEMENTATION rep=4: accepted', async () => {
    const app = makeApp(oid('k-implementation-4'));
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED', competencyArea: 'IMPLEMENTATION' });
    expect(res.status).toBe(201);
    expect(res.body.data.competencyArea).toBe('IMPLEMENTATION');
  });
  it('[K-5] competencyArea=IMPLEMENTATION rep=5: accepted', async () => {
    const app = makeApp(oid('k-implementation-5'));
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED', competencyArea: 'IMPLEMENTATION' });
    expect(res.status).toBe(201);
    expect(res.body.data.competencyArea).toBe('IMPLEMENTATION');
  });
  it('[K-6] competencyArea=TRAINING rep=0: accepted', async () => {
    const app = makeApp(oid('k-training-0'));
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED', competencyArea: 'TRAINING' });
    expect(res.status).toBe(201);
    expect(res.body.data.competencyArea).toBe('TRAINING');
  });
  it('[K-7] competencyArea=TRAINING rep=1: accepted', async () => {
    const app = makeApp(oid('k-training-1'));
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED', competencyArea: 'TRAINING' });
    expect(res.status).toBe(201);
    expect(res.body.data.competencyArea).toBe('TRAINING');
  });
  it('[K-8] competencyArea=TRAINING rep=2: accepted', async () => {
    const app = makeApp(oid('k-training-2'));
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED', competencyArea: 'TRAINING' });
    expect(res.status).toBe(201);
    expect(res.body.data.competencyArea).toBe('TRAINING');
  });
  it('[K-9] competencyArea=TRAINING rep=3: accepted', async () => {
    const app = makeApp(oid('k-training-3'));
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED', competencyArea: 'TRAINING' });
    expect(res.status).toBe(201);
    expect(res.body.data.competencyArea).toBe('TRAINING');
  });
  it('[K-10] competencyArea=TRAINING rep=4: accepted', async () => {
    const app = makeApp(oid('k-training-4'));
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED', competencyArea: 'TRAINING' });
    expect(res.status).toBe(201);
    expect(res.body.data.competencyArea).toBe('TRAINING');
  });
  it('[K-11] competencyArea=TRAINING rep=5: accepted', async () => {
    const app = makeApp(oid('k-training-5'));
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED', competencyArea: 'TRAINING' });
    expect(res.status).toBe(201);
    expect(res.body.data.competencyArea).toBe('TRAINING');
  });
  it('[K-12] competencyArea=SUPPORT rep=0: accepted', async () => {
    const app = makeApp(oid('k-support-0'));
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED', competencyArea: 'SUPPORT' });
    expect(res.status).toBe(201);
    expect(res.body.data.competencyArea).toBe('SUPPORT');
  });
  it('[K-13] competencyArea=SUPPORT rep=1: accepted', async () => {
    const app = makeApp(oid('k-support-1'));
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED', competencyArea: 'SUPPORT' });
    expect(res.status).toBe(201);
    expect(res.body.data.competencyArea).toBe('SUPPORT');
  });
  it('[K-14] competencyArea=SUPPORT rep=2: accepted', async () => {
    const app = makeApp(oid('k-support-2'));
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED', competencyArea: 'SUPPORT' });
    expect(res.status).toBe(201);
    expect(res.body.data.competencyArea).toBe('SUPPORT');
  });
  it('[K-15] competencyArea=SUPPORT rep=3: accepted', async () => {
    const app = makeApp(oid('k-support-3'));
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED', competencyArea: 'SUPPORT' });
    expect(res.status).toBe(201);
    expect(res.body.data.competencyArea).toBe('SUPPORT');
  });
  it('[K-16] competencyArea=SUPPORT rep=4: accepted', async () => {
    const app = makeApp(oid('k-support-4'));
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED', competencyArea: 'SUPPORT' });
    expect(res.status).toBe(201);
    expect(res.body.data.competencyArea).toBe('SUPPORT');
  });
  it('[K-17] competencyArea=SUPPORT rep=5: accepted', async () => {
    const app = makeApp(oid('k-support-5'));
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED', competencyArea: 'SUPPORT' });
    expect(res.status).toBe(201);
    expect(res.body.data.competencyArea).toBe('SUPPORT');
  });
  it('[K-18] competencyArea=SALES rep=0: accepted', async () => {
    const app = makeApp(oid('k-sales-0'));
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED', competencyArea: 'SALES' });
    expect(res.status).toBe(201);
    expect(res.body.data.competencyArea).toBe('SALES');
  });
  it('[K-19] competencyArea=SALES rep=1: accepted', async () => {
    const app = makeApp(oid('k-sales-1'));
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED', competencyArea: 'SALES' });
    expect(res.status).toBe(201);
    expect(res.body.data.competencyArea).toBe('SALES');
  });
  it('[K-20] competencyArea=SALES rep=2: accepted', async () => {
    const app = makeApp(oid('k-sales-2'));
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED', competencyArea: 'SALES' });
    expect(res.status).toBe(201);
    expect(res.body.data.competencyArea).toBe('SALES');
  });
  it('[K-21] competencyArea=SALES rep=3: accepted', async () => {
    const app = makeApp(oid('k-sales-3'));
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED', competencyArea: 'SALES' });
    expect(res.status).toBe(201);
    expect(res.body.data.competencyArea).toBe('SALES');
  });
  it('[K-22] competencyArea=SALES rep=4: accepted', async () => {
    const app = makeApp(oid('k-sales-4'));
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED', competencyArea: 'SALES' });
    expect(res.status).toBe(201);
    expect(res.body.data.competencyArea).toBe('SALES');
  });
  it('[K-23] competencyArea=SALES rep=5: accepted', async () => {
    const app = makeApp(oid('k-sales-5'));
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED', competencyArea: 'SALES' });
    expect(res.status).toBe(201);
    expect(res.body.data.competencyArea).toBe('SALES');
  });
  it('[K-24] competencyArea=TECHNICAL rep=0: accepted', async () => {
    const app = makeApp(oid('k-technical-0'));
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED', competencyArea: 'TECHNICAL' });
    expect(res.status).toBe(201);
    expect(res.body.data.competencyArea).toBe('TECHNICAL');
  });
  it('[K-25] competencyArea=TECHNICAL rep=1: accepted', async () => {
    const app = makeApp(oid('k-technical-1'));
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED', competencyArea: 'TECHNICAL' });
    expect(res.status).toBe(201);
    expect(res.body.data.competencyArea).toBe('TECHNICAL');
  });
  it('[K-26] competencyArea=TECHNICAL rep=2: accepted', async () => {
    const app = makeApp(oid('k-technical-2'));
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED', competencyArea: 'TECHNICAL' });
    expect(res.status).toBe(201);
    expect(res.body.data.competencyArea).toBe('TECHNICAL');
  });
  it('[K-27] competencyArea=TECHNICAL rep=3: accepted', async () => {
    const app = makeApp(oid('k-technical-3'));
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED', competencyArea: 'TECHNICAL' });
    expect(res.status).toBe(201);
    expect(res.body.data.competencyArea).toBe('TECHNICAL');
  });
  it('[K-28] competencyArea=TECHNICAL rep=4: accepted', async () => {
    const app = makeApp(oid('k-technical-4'));
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED', competencyArea: 'TECHNICAL' });
    expect(res.status).toBe(201);
    expect(res.body.data.competencyArea).toBe('TECHNICAL');
  });
  it('[K-29] competencyArea=TECHNICAL rep=5: accepted', async () => {
    const app = makeApp(oid('k-technical-5'));
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED', competencyArea: 'TECHNICAL' });
    expect(res.status).toBe(201);
    expect(res.body.data.competencyArea).toBe('TECHNICAL');
  });
});

// ─── Suite L: PATCH /:id/requirements/:reqId — mark met ─────────────────────
describe('PATCH /api/certifications/:id/requirements/:reqId — mark met', () => {
  it('[L-0] marks requirement as met and returns 200', async () => {
    const app = makeApp(oid('l-0'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[L-1] marks requirement as met and returns 200', async () => {
    const app = makeApp(oid('l-1'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[L-2] marks requirement as met and returns 200', async () => {
    const app = makeApp(oid('l-2'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[L-3] marks requirement as met and returns 200', async () => {
    const app = makeApp(oid('l-3'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[L-4] marks requirement as met and returns 200', async () => {
    const app = makeApp(oid('l-4'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[L-5] marks requirement as met and returns 200', async () => {
    const app = makeApp(oid('l-5'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[L-6] marks requirement as met and returns 200', async () => {
    const app = makeApp(oid('l-6'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[L-7] marks requirement as met and returns 200', async () => {
    const app = makeApp(oid('l-7'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[L-8] marks requirement as met and returns 200', async () => {
    const app = makeApp(oid('l-8'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[L-9] marks requirement as met and returns 200', async () => {
    const app = makeApp(oid('l-9'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[L-10] marks requirement as met and returns 200', async () => {
    const app = makeApp(oid('l-10'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[L-11] marks requirement as met and returns 200', async () => {
    const app = makeApp(oid('l-11'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[L-12] marks requirement as met and returns 200', async () => {
    const app = makeApp(oid('l-12'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[L-13] marks requirement as met and returns 200', async () => {
    const app = makeApp(oid('l-13'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[L-14] marks requirement as met and returns 200', async () => {
    const app = makeApp(oid('l-14'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[L-15] marks requirement as met and returns 200', async () => {
    const app = makeApp(oid('l-15'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[L-16] marks requirement as met and returns 200', async () => {
    const app = makeApp(oid('l-16'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[L-17] marks requirement as met and returns 200', async () => {
    const app = makeApp(oid('l-17'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[L-18] marks requirement as met and returns 200', async () => {
    const app = makeApp(oid('l-18'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[L-19] marks requirement as met and returns 200', async () => {
    const app = makeApp(oid('l-19'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[L-20] marks requirement as met and returns 200', async () => {
    const app = makeApp(oid('l-20'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[L-21] marks requirement as met and returns 200', async () => {
    const app = makeApp(oid('l-21'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[L-22] marks requirement as met and returns 200', async () => {
    const app = makeApp(oid('l-22'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[L-23] marks requirement as met and returns 200', async () => {
    const app = makeApp(oid('l-23'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[L-24] marks requirement as met and returns 200', async () => {
    const app = makeApp(oid('l-24'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[L-25] marks requirement as met and returns 200', async () => {
    const app = makeApp(oid('l-25'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[L-26] marks requirement as met and returns 200', async () => {
    const app = makeApp(oid('l-26'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[L-27] marks requirement as met and returns 200', async () => {
    const app = makeApp(oid('l-27'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[L-28] marks requirement as met and returns 200', async () => {
    const app = makeApp(oid('l-28'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[L-29] marks requirement as met and returns 200', async () => {
    const app = makeApp(oid('l-29'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[L-30] marks requirement as met and returns 200', async () => {
    const app = makeApp(oid('l-30'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[L-31] marks requirement as met and returns 200', async () => {
    const app = makeApp(oid('l-31'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[L-32] marks requirement as met and returns 200', async () => {
    const app = makeApp(oid('l-32'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[L-33] marks requirement as met and returns 200', async () => {
    const app = makeApp(oid('l-33'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[L-34] marks requirement as met and returns 200', async () => {
    const app = makeApp(oid('l-34'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[L-35] marks requirement as met and returns 200', async () => {
    const app = makeApp(oid('l-35'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[L-36] marks requirement as met and returns 200', async () => {
    const app = makeApp(oid('l-36'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[L-37] marks requirement as met and returns 200', async () => {
    const app = makeApp(oid('l-37'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[L-38] marks requirement as met and returns 200', async () => {
    const app = makeApp(oid('l-38'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[L-39] marks requirement as met and returns 200', async () => {
    const app = makeApp(oid('l-39'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[L-40] marks requirement as met and returns 200', async () => {
    const app = makeApp(oid('l-40'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[L-41] marks requirement as met and returns 200', async () => {
    const app = makeApp(oid('l-41'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[L-42] marks requirement as met and returns 200', async () => {
    const app = makeApp(oid('l-42'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[L-43] marks requirement as met and returns 200', async () => {
    const app = makeApp(oid('l-43'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[L-44] marks requirement as met and returns 200', async () => {
    const app = makeApp(oid('l-44'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[L-45] marks requirement as met and returns 200', async () => {
    const app = makeApp(oid('l-45'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[L-46] marks requirement as met and returns 200', async () => {
    const app = makeApp(oid('l-46'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[L-47] marks requirement as met and returns 200', async () => {
    const app = makeApp(oid('l-47'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[L-48] marks requirement as met and returns 200', async () => {
    const app = makeApp(oid('l-48'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[L-49] marks requirement as met and returns 200', async () => {
    const app = makeApp(oid('l-49'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

// ─── Suite M: PATCH — requirement met:true ────────────────────────────────────
describe('PATCH — requirement marked met:true', () => {
  it('[M-0] patched requirement has met:true', async () => {
    const app = makeApp(oid('m-0'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const req = res.body.data.requirements.find((r: any) => r.requirementId === 'reg-1');
    expect(req.met).toBe(true);
  });
  it('[M-1] patched requirement has met:true', async () => {
    const app = makeApp(oid('m-1'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const req = res.body.data.requirements.find((r: any) => r.requirementId === 'reg-1');
    expect(req.met).toBe(true);
  });
  it('[M-2] patched requirement has met:true', async () => {
    const app = makeApp(oid('m-2'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const req = res.body.data.requirements.find((r: any) => r.requirementId === 'reg-1');
    expect(req.met).toBe(true);
  });
  it('[M-3] patched requirement has met:true', async () => {
    const app = makeApp(oid('m-3'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const req = res.body.data.requirements.find((r: any) => r.requirementId === 'reg-1');
    expect(req.met).toBe(true);
  });
  it('[M-4] patched requirement has met:true', async () => {
    const app = makeApp(oid('m-4'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const req = res.body.data.requirements.find((r: any) => r.requirementId === 'reg-1');
    expect(req.met).toBe(true);
  });
  it('[M-5] patched requirement has met:true', async () => {
    const app = makeApp(oid('m-5'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const req = res.body.data.requirements.find((r: any) => r.requirementId === 'reg-1');
    expect(req.met).toBe(true);
  });
  it('[M-6] patched requirement has met:true', async () => {
    const app = makeApp(oid('m-6'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const req = res.body.data.requirements.find((r: any) => r.requirementId === 'reg-1');
    expect(req.met).toBe(true);
  });
  it('[M-7] patched requirement has met:true', async () => {
    const app = makeApp(oid('m-7'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const req = res.body.data.requirements.find((r: any) => r.requirementId === 'reg-1');
    expect(req.met).toBe(true);
  });
  it('[M-8] patched requirement has met:true', async () => {
    const app = makeApp(oid('m-8'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const req = res.body.data.requirements.find((r: any) => r.requirementId === 'reg-1');
    expect(req.met).toBe(true);
  });
  it('[M-9] patched requirement has met:true', async () => {
    const app = makeApp(oid('m-9'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const req = res.body.data.requirements.find((r: any) => r.requirementId === 'reg-1');
    expect(req.met).toBe(true);
  });
  it('[M-10] patched requirement has met:true', async () => {
    const app = makeApp(oid('m-10'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const req = res.body.data.requirements.find((r: any) => r.requirementId === 'reg-1');
    expect(req.met).toBe(true);
  });
  it('[M-11] patched requirement has met:true', async () => {
    const app = makeApp(oid('m-11'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const req = res.body.data.requirements.find((r: any) => r.requirementId === 'reg-1');
    expect(req.met).toBe(true);
  });
  it('[M-12] patched requirement has met:true', async () => {
    const app = makeApp(oid('m-12'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const req = res.body.data.requirements.find((r: any) => r.requirementId === 'reg-1');
    expect(req.met).toBe(true);
  });
  it('[M-13] patched requirement has met:true', async () => {
    const app = makeApp(oid('m-13'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const req = res.body.data.requirements.find((r: any) => r.requirementId === 'reg-1');
    expect(req.met).toBe(true);
  });
  it('[M-14] patched requirement has met:true', async () => {
    const app = makeApp(oid('m-14'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const req = res.body.data.requirements.find((r: any) => r.requirementId === 'reg-1');
    expect(req.met).toBe(true);
  });
  it('[M-15] patched requirement has met:true', async () => {
    const app = makeApp(oid('m-15'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const req = res.body.data.requirements.find((r: any) => r.requirementId === 'reg-1');
    expect(req.met).toBe(true);
  });
  it('[M-16] patched requirement has met:true', async () => {
    const app = makeApp(oid('m-16'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const req = res.body.data.requirements.find((r: any) => r.requirementId === 'reg-1');
    expect(req.met).toBe(true);
  });
  it('[M-17] patched requirement has met:true', async () => {
    const app = makeApp(oid('m-17'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const req = res.body.data.requirements.find((r: any) => r.requirementId === 'reg-1');
    expect(req.met).toBe(true);
  });
  it('[M-18] patched requirement has met:true', async () => {
    const app = makeApp(oid('m-18'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const req = res.body.data.requirements.find((r: any) => r.requirementId === 'reg-1');
    expect(req.met).toBe(true);
  });
  it('[M-19] patched requirement has met:true', async () => {
    const app = makeApp(oid('m-19'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const req = res.body.data.requirements.find((r: any) => r.requirementId === 'reg-1');
    expect(req.met).toBe(true);
  });
  it('[M-20] patched requirement has met:true', async () => {
    const app = makeApp(oid('m-20'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const req = res.body.data.requirements.find((r: any) => r.requirementId === 'reg-1');
    expect(req.met).toBe(true);
  });
  it('[M-21] patched requirement has met:true', async () => {
    const app = makeApp(oid('m-21'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const req = res.body.data.requirements.find((r: any) => r.requirementId === 'reg-1');
    expect(req.met).toBe(true);
  });
  it('[M-22] patched requirement has met:true', async () => {
    const app = makeApp(oid('m-22'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const req = res.body.data.requirements.find((r: any) => r.requirementId === 'reg-1');
    expect(req.met).toBe(true);
  });
  it('[M-23] patched requirement has met:true', async () => {
    const app = makeApp(oid('m-23'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const req = res.body.data.requirements.find((r: any) => r.requirementId === 'reg-1');
    expect(req.met).toBe(true);
  });
  it('[M-24] patched requirement has met:true', async () => {
    const app = makeApp(oid('m-24'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const req = res.body.data.requirements.find((r: any) => r.requirementId === 'reg-1');
    expect(req.met).toBe(true);
  });
  it('[M-25] patched requirement has met:true', async () => {
    const app = makeApp(oid('m-25'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const req = res.body.data.requirements.find((r: any) => r.requirementId === 'reg-1');
    expect(req.met).toBe(true);
  });
  it('[M-26] patched requirement has met:true', async () => {
    const app = makeApp(oid('m-26'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const req = res.body.data.requirements.find((r: any) => r.requirementId === 'reg-1');
    expect(req.met).toBe(true);
  });
  it('[M-27] patched requirement has met:true', async () => {
    const app = makeApp(oid('m-27'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const req = res.body.data.requirements.find((r: any) => r.requirementId === 'reg-1');
    expect(req.met).toBe(true);
  });
  it('[M-28] patched requirement has met:true', async () => {
    const app = makeApp(oid('m-28'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const req = res.body.data.requirements.find((r: any) => r.requirementId === 'reg-1');
    expect(req.met).toBe(true);
  });
  it('[M-29] patched requirement has met:true', async () => {
    const app = makeApp(oid('m-29'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const req = res.body.data.requirements.find((r: any) => r.requirementId === 'reg-1');
    expect(req.met).toBe(true);
  });
});

// ─── Suite N: PATCH — evidence stored ────────────────────────────────────────
describe('PATCH — evidence stored', () => {
  it('[N-0] evidence is stored in the requirement', async () => {
    const app = makeApp(oid('n-0'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const evidence = 'Evidence doc 0';
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1').send({ evidence });
    const req = res.body.data.requirements.find((r: any) => r.requirementId === 'reg-1');
    expect(req.evidence).toBe(evidence);
  });
  it('[N-1] evidence is stored in the requirement', async () => {
    const app = makeApp(oid('n-1'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const evidence = 'Evidence doc 1';
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1').send({ evidence });
    const req = res.body.data.requirements.find((r: any) => r.requirementId === 'reg-1');
    expect(req.evidence).toBe(evidence);
  });
  it('[N-2] evidence is stored in the requirement', async () => {
    const app = makeApp(oid('n-2'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const evidence = 'Evidence doc 2';
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1').send({ evidence });
    const req = res.body.data.requirements.find((r: any) => r.requirementId === 'reg-1');
    expect(req.evidence).toBe(evidence);
  });
  it('[N-3] evidence is stored in the requirement', async () => {
    const app = makeApp(oid('n-3'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const evidence = 'Evidence doc 3';
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1').send({ evidence });
    const req = res.body.data.requirements.find((r: any) => r.requirementId === 'reg-1');
    expect(req.evidence).toBe(evidence);
  });
  it('[N-4] evidence is stored in the requirement', async () => {
    const app = makeApp(oid('n-4'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const evidence = 'Evidence doc 4';
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1').send({ evidence });
    const req = res.body.data.requirements.find((r: any) => r.requirementId === 'reg-1');
    expect(req.evidence).toBe(evidence);
  });
  it('[N-5] evidence is stored in the requirement', async () => {
    const app = makeApp(oid('n-5'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const evidence = 'Evidence doc 5';
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1').send({ evidence });
    const req = res.body.data.requirements.find((r: any) => r.requirementId === 'reg-1');
    expect(req.evidence).toBe(evidence);
  });
  it('[N-6] evidence is stored in the requirement', async () => {
    const app = makeApp(oid('n-6'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const evidence = 'Evidence doc 6';
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1').send({ evidence });
    const req = res.body.data.requirements.find((r: any) => r.requirementId === 'reg-1');
    expect(req.evidence).toBe(evidence);
  });
  it('[N-7] evidence is stored in the requirement', async () => {
    const app = makeApp(oid('n-7'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const evidence = 'Evidence doc 7';
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1').send({ evidence });
    const req = res.body.data.requirements.find((r: any) => r.requirementId === 'reg-1');
    expect(req.evidence).toBe(evidence);
  });
  it('[N-8] evidence is stored in the requirement', async () => {
    const app = makeApp(oid('n-8'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const evidence = 'Evidence doc 8';
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1').send({ evidence });
    const req = res.body.data.requirements.find((r: any) => r.requirementId === 'reg-1');
    expect(req.evidence).toBe(evidence);
  });
  it('[N-9] evidence is stored in the requirement', async () => {
    const app = makeApp(oid('n-9'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const evidence = 'Evidence doc 9';
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1').send({ evidence });
    const req = res.body.data.requirements.find((r: any) => r.requirementId === 'reg-1');
    expect(req.evidence).toBe(evidence);
  });
  it('[N-10] evidence is stored in the requirement', async () => {
    const app = makeApp(oid('n-10'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const evidence = 'Evidence doc 10';
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1').send({ evidence });
    const req = res.body.data.requirements.find((r: any) => r.requirementId === 'reg-1');
    expect(req.evidence).toBe(evidence);
  });
  it('[N-11] evidence is stored in the requirement', async () => {
    const app = makeApp(oid('n-11'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const evidence = 'Evidence doc 11';
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1').send({ evidence });
    const req = res.body.data.requirements.find((r: any) => r.requirementId === 'reg-1');
    expect(req.evidence).toBe(evidence);
  });
  it('[N-12] evidence is stored in the requirement', async () => {
    const app = makeApp(oid('n-12'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const evidence = 'Evidence doc 12';
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1').send({ evidence });
    const req = res.body.data.requirements.find((r: any) => r.requirementId === 'reg-1');
    expect(req.evidence).toBe(evidence);
  });
  it('[N-13] evidence is stored in the requirement', async () => {
    const app = makeApp(oid('n-13'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const evidence = 'Evidence doc 13';
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1').send({ evidence });
    const req = res.body.data.requirements.find((r: any) => r.requirementId === 'reg-1');
    expect(req.evidence).toBe(evidence);
  });
  it('[N-14] evidence is stored in the requirement', async () => {
    const app = makeApp(oid('n-14'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const evidence = 'Evidence doc 14';
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1').send({ evidence });
    const req = res.body.data.requirements.find((r: any) => r.requirementId === 'reg-1');
    expect(req.evidence).toBe(evidence);
  });
  it('[N-15] evidence is stored in the requirement', async () => {
    const app = makeApp(oid('n-15'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const evidence = 'Evidence doc 15';
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1').send({ evidence });
    const req = res.body.data.requirements.find((r: any) => r.requirementId === 'reg-1');
    expect(req.evidence).toBe(evidence);
  });
  it('[N-16] evidence is stored in the requirement', async () => {
    const app = makeApp(oid('n-16'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const evidence = 'Evidence doc 16';
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1').send({ evidence });
    const req = res.body.data.requirements.find((r: any) => r.requirementId === 'reg-1');
    expect(req.evidence).toBe(evidence);
  });
  it('[N-17] evidence is stored in the requirement', async () => {
    const app = makeApp(oid('n-17'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const evidence = 'Evidence doc 17';
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1').send({ evidence });
    const req = res.body.data.requirements.find((r: any) => r.requirementId === 'reg-1');
    expect(req.evidence).toBe(evidence);
  });
  it('[N-18] evidence is stored in the requirement', async () => {
    const app = makeApp(oid('n-18'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const evidence = 'Evidence doc 18';
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1').send({ evidence });
    const req = res.body.data.requirements.find((r: any) => r.requirementId === 'reg-1');
    expect(req.evidence).toBe(evidence);
  });
  it('[N-19] evidence is stored in the requirement', async () => {
    const app = makeApp(oid('n-19'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const evidence = 'Evidence doc 19';
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1').send({ evidence });
    const req = res.body.data.requirements.find((r: any) => r.requirementId === 'reg-1');
    expect(req.evidence).toBe(evidence);
  });
});

// ─── Suite O: PATCH — completedAt set ────────────────────────────────────────
describe('PATCH — completedAt set', () => {
  it('[O-0] completedAt is set after patch', async () => {
    const app = makeApp(oid('o-0'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const req = res.body.data.requirements.find((r: any) => r.requirementId === 'reg-1');
    expect(req.completedAt).toBeTruthy();
  });
  it('[O-1] completedAt is set after patch', async () => {
    const app = makeApp(oid('o-1'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const req = res.body.data.requirements.find((r: any) => r.requirementId === 'reg-1');
    expect(req.completedAt).toBeTruthy();
  });
  it('[O-2] completedAt is set after patch', async () => {
    const app = makeApp(oid('o-2'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const req = res.body.data.requirements.find((r: any) => r.requirementId === 'reg-1');
    expect(req.completedAt).toBeTruthy();
  });
  it('[O-3] completedAt is set after patch', async () => {
    const app = makeApp(oid('o-3'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const req = res.body.data.requirements.find((r: any) => r.requirementId === 'reg-1');
    expect(req.completedAt).toBeTruthy();
  });
  it('[O-4] completedAt is set after patch', async () => {
    const app = makeApp(oid('o-4'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const req = res.body.data.requirements.find((r: any) => r.requirementId === 'reg-1');
    expect(req.completedAt).toBeTruthy();
  });
  it('[O-5] completedAt is set after patch', async () => {
    const app = makeApp(oid('o-5'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const req = res.body.data.requirements.find((r: any) => r.requirementId === 'reg-1');
    expect(req.completedAt).toBeTruthy();
  });
  it('[O-6] completedAt is set after patch', async () => {
    const app = makeApp(oid('o-6'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const req = res.body.data.requirements.find((r: any) => r.requirementId === 'reg-1');
    expect(req.completedAt).toBeTruthy();
  });
  it('[O-7] completedAt is set after patch', async () => {
    const app = makeApp(oid('o-7'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const req = res.body.data.requirements.find((r: any) => r.requirementId === 'reg-1');
    expect(req.completedAt).toBeTruthy();
  });
  it('[O-8] completedAt is set after patch', async () => {
    const app = makeApp(oid('o-8'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const req = res.body.data.requirements.find((r: any) => r.requirementId === 'reg-1');
    expect(req.completedAt).toBeTruthy();
  });
  it('[O-9] completedAt is set after patch', async () => {
    const app = makeApp(oid('o-9'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const req = res.body.data.requirements.find((r: any) => r.requirementId === 'reg-1');
    expect(req.completedAt).toBeTruthy();
  });
  it('[O-10] completedAt is set after patch', async () => {
    const app = makeApp(oid('o-10'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const req = res.body.data.requirements.find((r: any) => r.requirementId === 'reg-1');
    expect(req.completedAt).toBeTruthy();
  });
  it('[O-11] completedAt is set after patch', async () => {
    const app = makeApp(oid('o-11'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const req = res.body.data.requirements.find((r: any) => r.requirementId === 'reg-1');
    expect(req.completedAt).toBeTruthy();
  });
  it('[O-12] completedAt is set after patch', async () => {
    const app = makeApp(oid('o-12'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const req = res.body.data.requirements.find((r: any) => r.requirementId === 'reg-1');
    expect(req.completedAt).toBeTruthy();
  });
  it('[O-13] completedAt is set after patch', async () => {
    const app = makeApp(oid('o-13'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const req = res.body.data.requirements.find((r: any) => r.requirementId === 'reg-1');
    expect(req.completedAt).toBeTruthy();
  });
  it('[O-14] completedAt is set after patch', async () => {
    const app = makeApp(oid('o-14'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const req = res.body.data.requirements.find((r: any) => r.requirementId === 'reg-1');
    expect(req.completedAt).toBeTruthy();
  });
  it('[O-15] completedAt is set after patch', async () => {
    const app = makeApp(oid('o-15'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const req = res.body.data.requirements.find((r: any) => r.requirementId === 'reg-1');
    expect(req.completedAt).toBeTruthy();
  });
  it('[O-16] completedAt is set after patch', async () => {
    const app = makeApp(oid('o-16'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const req = res.body.data.requirements.find((r: any) => r.requirementId === 'reg-1');
    expect(req.completedAt).toBeTruthy();
  });
  it('[O-17] completedAt is set after patch', async () => {
    const app = makeApp(oid('o-17'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const req = res.body.data.requirements.find((r: any) => r.requirementId === 'reg-1');
    expect(req.completedAt).toBeTruthy();
  });
  it('[O-18] completedAt is set after patch', async () => {
    const app = makeApp(oid('o-18'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const req = res.body.data.requirements.find((r: any) => r.requirementId === 'reg-1');
    expect(req.completedAt).toBeTruthy();
  });
  it('[O-19] completedAt is set after patch', async () => {
    const app = makeApp(oid('o-19'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const req = res.body.data.requirements.find((r: any) => r.requirementId === 'reg-1');
    expect(req.completedAt).toBeTruthy();
  });
});

// ─── Suite P: PATCH — 404 for unknown cert ───────────────────────────────────
describe('PATCH /:id/requirements/:reqId — 404 for unknown cert', () => {
  it('[P-0] unknown cert returns 404', async () => {
    const app = makeApp(oid('p-0'));
    const res = await request(app).patch('/api/certifications/unknown-cert-0/requirements/reg-1');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[P-1] unknown cert returns 404', async () => {
    const app = makeApp(oid('p-1'));
    const res = await request(app).patch('/api/certifications/unknown-cert-1/requirements/reg-1');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[P-2] unknown cert returns 404', async () => {
    const app = makeApp(oid('p-2'));
    const res = await request(app).patch('/api/certifications/unknown-cert-2/requirements/reg-1');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[P-3] unknown cert returns 404', async () => {
    const app = makeApp(oid('p-3'));
    const res = await request(app).patch('/api/certifications/unknown-cert-3/requirements/reg-1');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[P-4] unknown cert returns 404', async () => {
    const app = makeApp(oid('p-4'));
    const res = await request(app).patch('/api/certifications/unknown-cert-4/requirements/reg-1');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[P-5] unknown cert returns 404', async () => {
    const app = makeApp(oid('p-5'));
    const res = await request(app).patch('/api/certifications/unknown-cert-5/requirements/reg-1');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[P-6] unknown cert returns 404', async () => {
    const app = makeApp(oid('p-6'));
    const res = await request(app).patch('/api/certifications/unknown-cert-6/requirements/reg-1');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[P-7] unknown cert returns 404', async () => {
    const app = makeApp(oid('p-7'));
    const res = await request(app).patch('/api/certifications/unknown-cert-7/requirements/reg-1');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[P-8] unknown cert returns 404', async () => {
    const app = makeApp(oid('p-8'));
    const res = await request(app).patch('/api/certifications/unknown-cert-8/requirements/reg-1');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[P-9] unknown cert returns 404', async () => {
    const app = makeApp(oid('p-9'));
    const res = await request(app).patch('/api/certifications/unknown-cert-9/requirements/reg-1');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[P-10] unknown cert returns 404', async () => {
    const app = makeApp(oid('p-10'));
    const res = await request(app).patch('/api/certifications/unknown-cert-10/requirements/reg-1');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[P-11] unknown cert returns 404', async () => {
    const app = makeApp(oid('p-11'));
    const res = await request(app).patch('/api/certifications/unknown-cert-11/requirements/reg-1');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[P-12] unknown cert returns 404', async () => {
    const app = makeApp(oid('p-12'));
    const res = await request(app).patch('/api/certifications/unknown-cert-12/requirements/reg-1');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[P-13] unknown cert returns 404', async () => {
    const app = makeApp(oid('p-13'));
    const res = await request(app).patch('/api/certifications/unknown-cert-13/requirements/reg-1');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[P-14] unknown cert returns 404', async () => {
    const app = makeApp(oid('p-14'));
    const res = await request(app).patch('/api/certifications/unknown-cert-14/requirements/reg-1');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[P-15] unknown cert returns 404', async () => {
    const app = makeApp(oid('p-15'));
    const res = await request(app).patch('/api/certifications/unknown-cert-15/requirements/reg-1');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[P-16] unknown cert returns 404', async () => {
    const app = makeApp(oid('p-16'));
    const res = await request(app).patch('/api/certifications/unknown-cert-16/requirements/reg-1');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[P-17] unknown cert returns 404', async () => {
    const app = makeApp(oid('p-17'));
    const res = await request(app).patch('/api/certifications/unknown-cert-17/requirements/reg-1');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[P-18] unknown cert returns 404', async () => {
    const app = makeApp(oid('p-18'));
    const res = await request(app).patch('/api/certifications/unknown-cert-18/requirements/reg-1');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[P-19] unknown cert returns 404', async () => {
    const app = makeApp(oid('p-19'));
    const res = await request(app).patch('/api/certifications/unknown-cert-19/requirements/reg-1');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[P-20] unknown cert returns 404', async () => {
    const app = makeApp(oid('p-20'));
    const res = await request(app).patch('/api/certifications/unknown-cert-20/requirements/reg-1');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[P-21] unknown cert returns 404', async () => {
    const app = makeApp(oid('p-21'));
    const res = await request(app).patch('/api/certifications/unknown-cert-21/requirements/reg-1');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[P-22] unknown cert returns 404', async () => {
    const app = makeApp(oid('p-22'));
    const res = await request(app).patch('/api/certifications/unknown-cert-22/requirements/reg-1');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[P-23] unknown cert returns 404', async () => {
    const app = makeApp(oid('p-23'));
    const res = await request(app).patch('/api/certifications/unknown-cert-23/requirements/reg-1');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[P-24] unknown cert returns 404', async () => {
    const app = makeApp(oid('p-24'));
    const res = await request(app).patch('/api/certifications/unknown-cert-24/requirements/reg-1');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[P-25] unknown cert returns 404', async () => {
    const app = makeApp(oid('p-25'));
    const res = await request(app).patch('/api/certifications/unknown-cert-25/requirements/reg-1');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[P-26] unknown cert returns 404', async () => {
    const app = makeApp(oid('p-26'));
    const res = await request(app).patch('/api/certifications/unknown-cert-26/requirements/reg-1');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[P-27] unknown cert returns 404', async () => {
    const app = makeApp(oid('p-27'));
    const res = await request(app).patch('/api/certifications/unknown-cert-27/requirements/reg-1');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[P-28] unknown cert returns 404', async () => {
    const app = makeApp(oid('p-28'));
    const res = await request(app).patch('/api/certifications/unknown-cert-28/requirements/reg-1');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[P-29] unknown cert returns 404', async () => {
    const app = makeApp(oid('p-29'));
    const res = await request(app).patch('/api/certifications/unknown-cert-29/requirements/reg-1');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[P-30] unknown cert returns 404', async () => {
    const app = makeApp(oid('p-30'));
    const res = await request(app).patch('/api/certifications/unknown-cert-30/requirements/reg-1');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[P-31] unknown cert returns 404', async () => {
    const app = makeApp(oid('p-31'));
    const res = await request(app).patch('/api/certifications/unknown-cert-31/requirements/reg-1');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[P-32] unknown cert returns 404', async () => {
    const app = makeApp(oid('p-32'));
    const res = await request(app).patch('/api/certifications/unknown-cert-32/requirements/reg-1');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[P-33] unknown cert returns 404', async () => {
    const app = makeApp(oid('p-33'));
    const res = await request(app).patch('/api/certifications/unknown-cert-33/requirements/reg-1');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[P-34] unknown cert returns 404', async () => {
    const app = makeApp(oid('p-34'));
    const res = await request(app).patch('/api/certifications/unknown-cert-34/requirements/reg-1');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[P-35] unknown cert returns 404', async () => {
    const app = makeApp(oid('p-35'));
    const res = await request(app).patch('/api/certifications/unknown-cert-35/requirements/reg-1');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[P-36] unknown cert returns 404', async () => {
    const app = makeApp(oid('p-36'));
    const res = await request(app).patch('/api/certifications/unknown-cert-36/requirements/reg-1');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[P-37] unknown cert returns 404', async () => {
    const app = makeApp(oid('p-37'));
    const res = await request(app).patch('/api/certifications/unknown-cert-37/requirements/reg-1');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[P-38] unknown cert returns 404', async () => {
    const app = makeApp(oid('p-38'));
    const res = await request(app).patch('/api/certifications/unknown-cert-38/requirements/reg-1');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[P-39] unknown cert returns 404', async () => {
    const app = makeApp(oid('p-39'));
    const res = await request(app).patch('/api/certifications/unknown-cert-39/requirements/reg-1');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

// ─── Suite Q: PATCH — 403 for cross-org ──────────────────────────────────────
describe('PATCH /:id/requirements/:reqId — 403 for cross-org', () => {
  it('[Q-0] cross-org access returns 403', async () => {
    const appA = makeApp(oid('q-a-0'));
    const appB = makeApp(oid('q-b-0'));
    const create = await request(appA).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(appB).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[Q-1] cross-org access returns 403', async () => {
    const appA = makeApp(oid('q-a-1'));
    const appB = makeApp(oid('q-b-1'));
    const create = await request(appA).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(appB).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[Q-2] cross-org access returns 403', async () => {
    const appA = makeApp(oid('q-a-2'));
    const appB = makeApp(oid('q-b-2'));
    const create = await request(appA).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(appB).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[Q-3] cross-org access returns 403', async () => {
    const appA = makeApp(oid('q-a-3'));
    const appB = makeApp(oid('q-b-3'));
    const create = await request(appA).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(appB).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[Q-4] cross-org access returns 403', async () => {
    const appA = makeApp(oid('q-a-4'));
    const appB = makeApp(oid('q-b-4'));
    const create = await request(appA).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(appB).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[Q-5] cross-org access returns 403', async () => {
    const appA = makeApp(oid('q-a-5'));
    const appB = makeApp(oid('q-b-5'));
    const create = await request(appA).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(appB).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[Q-6] cross-org access returns 403', async () => {
    const appA = makeApp(oid('q-a-6'));
    const appB = makeApp(oid('q-b-6'));
    const create = await request(appA).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(appB).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[Q-7] cross-org access returns 403', async () => {
    const appA = makeApp(oid('q-a-7'));
    const appB = makeApp(oid('q-b-7'));
    const create = await request(appA).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(appB).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[Q-8] cross-org access returns 403', async () => {
    const appA = makeApp(oid('q-a-8'));
    const appB = makeApp(oid('q-b-8'));
    const create = await request(appA).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(appB).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[Q-9] cross-org access returns 403', async () => {
    const appA = makeApp(oid('q-a-9'));
    const appB = makeApp(oid('q-b-9'));
    const create = await request(appA).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(appB).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[Q-10] cross-org access returns 403', async () => {
    const appA = makeApp(oid('q-a-10'));
    const appB = makeApp(oid('q-b-10'));
    const create = await request(appA).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(appB).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[Q-11] cross-org access returns 403', async () => {
    const appA = makeApp(oid('q-a-11'));
    const appB = makeApp(oid('q-b-11'));
    const create = await request(appA).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(appB).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[Q-12] cross-org access returns 403', async () => {
    const appA = makeApp(oid('q-a-12'));
    const appB = makeApp(oid('q-b-12'));
    const create = await request(appA).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(appB).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[Q-13] cross-org access returns 403', async () => {
    const appA = makeApp(oid('q-a-13'));
    const appB = makeApp(oid('q-b-13'));
    const create = await request(appA).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(appB).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[Q-14] cross-org access returns 403', async () => {
    const appA = makeApp(oid('q-a-14'));
    const appB = makeApp(oid('q-b-14'));
    const create = await request(appA).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(appB).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[Q-15] cross-org access returns 403', async () => {
    const appA = makeApp(oid('q-a-15'));
    const appB = makeApp(oid('q-b-15'));
    const create = await request(appA).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(appB).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[Q-16] cross-org access returns 403', async () => {
    const appA = makeApp(oid('q-a-16'));
    const appB = makeApp(oid('q-b-16'));
    const create = await request(appA).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(appB).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[Q-17] cross-org access returns 403', async () => {
    const appA = makeApp(oid('q-a-17'));
    const appB = makeApp(oid('q-b-17'));
    const create = await request(appA).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(appB).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[Q-18] cross-org access returns 403', async () => {
    const appA = makeApp(oid('q-a-18'));
    const appB = makeApp(oid('q-b-18'));
    const create = await request(appA).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(appB).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[Q-19] cross-org access returns 403', async () => {
    const appA = makeApp(oid('q-a-19'));
    const appB = makeApp(oid('q-b-19'));
    const create = await request(appA).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(appB).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[Q-20] cross-org access returns 403', async () => {
    const appA = makeApp(oid('q-a-20'));
    const appB = makeApp(oid('q-b-20'));
    const create = await request(appA).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(appB).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[Q-21] cross-org access returns 403', async () => {
    const appA = makeApp(oid('q-a-21'));
    const appB = makeApp(oid('q-b-21'));
    const create = await request(appA).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(appB).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[Q-22] cross-org access returns 403', async () => {
    const appA = makeApp(oid('q-a-22'));
    const appB = makeApp(oid('q-b-22'));
    const create = await request(appA).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(appB).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[Q-23] cross-org access returns 403', async () => {
    const appA = makeApp(oid('q-a-23'));
    const appB = makeApp(oid('q-b-23'));
    const create = await request(appA).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(appB).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[Q-24] cross-org access returns 403', async () => {
    const appA = makeApp(oid('q-a-24'));
    const appB = makeApp(oid('q-b-24'));
    const create = await request(appA).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(appB).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[Q-25] cross-org access returns 403', async () => {
    const appA = makeApp(oid('q-a-25'));
    const appB = makeApp(oid('q-b-25'));
    const create = await request(appA).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(appB).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[Q-26] cross-org access returns 403', async () => {
    const appA = makeApp(oid('q-a-26'));
    const appB = makeApp(oid('q-b-26'));
    const create = await request(appA).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(appB).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[Q-27] cross-org access returns 403', async () => {
    const appA = makeApp(oid('q-a-27'));
    const appB = makeApp(oid('q-b-27'));
    const create = await request(appA).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(appB).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[Q-28] cross-org access returns 403', async () => {
    const appA = makeApp(oid('q-a-28'));
    const appB = makeApp(oid('q-b-28'));
    const create = await request(appA).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(appB).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[Q-29] cross-org access returns 403', async () => {
    const appA = makeApp(oid('q-a-29'));
    const appB = makeApp(oid('q-b-29'));
    const create = await request(appA).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(appB).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[Q-30] cross-org access returns 403', async () => {
    const appA = makeApp(oid('q-a-30'));
    const appB = makeApp(oid('q-b-30'));
    const create = await request(appA).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(appB).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[Q-31] cross-org access returns 403', async () => {
    const appA = makeApp(oid('q-a-31'));
    const appB = makeApp(oid('q-b-31'));
    const create = await request(appA).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(appB).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[Q-32] cross-org access returns 403', async () => {
    const appA = makeApp(oid('q-a-32'));
    const appB = makeApp(oid('q-b-32'));
    const create = await request(appA).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(appB).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[Q-33] cross-org access returns 403', async () => {
    const appA = makeApp(oid('q-a-33'));
    const appB = makeApp(oid('q-b-33'));
    const create = await request(appA).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(appB).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[Q-34] cross-org access returns 403', async () => {
    const appA = makeApp(oid('q-a-34'));
    const appB = makeApp(oid('q-b-34'));
    const create = await request(appA).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(appB).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[Q-35] cross-org access returns 403', async () => {
    const appA = makeApp(oid('q-a-35'));
    const appB = makeApp(oid('q-b-35'));
    const create = await request(appA).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(appB).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[Q-36] cross-org access returns 403', async () => {
    const appA = makeApp(oid('q-a-36'));
    const appB = makeApp(oid('q-b-36'));
    const create = await request(appA).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(appB).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[Q-37] cross-org access returns 403', async () => {
    const appA = makeApp(oid('q-a-37'));
    const appB = makeApp(oid('q-b-37'));
    const create = await request(appA).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(appB).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[Q-38] cross-org access returns 403', async () => {
    const appA = makeApp(oid('q-a-38'));
    const appB = makeApp(oid('q-b-38'));
    const create = await request(appA).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(appB).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[Q-39] cross-org access returns 403', async () => {
    const appA = makeApp(oid('q-a-39'));
    const appB = makeApp(oid('q-b-39'));
    const create = await request(appA).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(appB).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});

// ─── Suite R: PATCH — 404 for unknown reqId ──────────────────────────────────
describe('PATCH /:id/requirements/:reqId — 404 for unknown reqId', () => {
  it('[R-0] unknown reqId returns 404', async () => {
    const app = makeApp(oid('r-0'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/non-existent-0');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[R-1] unknown reqId returns 404', async () => {
    const app = makeApp(oid('r-1'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/non-existent-1');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[R-2] unknown reqId returns 404', async () => {
    const app = makeApp(oid('r-2'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/non-existent-2');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[R-3] unknown reqId returns 404', async () => {
    const app = makeApp(oid('r-3'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/non-existent-3');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[R-4] unknown reqId returns 404', async () => {
    const app = makeApp(oid('r-4'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/non-existent-4');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[R-5] unknown reqId returns 404', async () => {
    const app = makeApp(oid('r-5'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/non-existent-5');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[R-6] unknown reqId returns 404', async () => {
    const app = makeApp(oid('r-6'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/non-existent-6');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[R-7] unknown reqId returns 404', async () => {
    const app = makeApp(oid('r-7'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/non-existent-7');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[R-8] unknown reqId returns 404', async () => {
    const app = makeApp(oid('r-8'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/non-existent-8');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[R-9] unknown reqId returns 404', async () => {
    const app = makeApp(oid('r-9'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/non-existent-9');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[R-10] unknown reqId returns 404', async () => {
    const app = makeApp(oid('r-10'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/non-existent-10');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[R-11] unknown reqId returns 404', async () => {
    const app = makeApp(oid('r-11'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/non-existent-11');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[R-12] unknown reqId returns 404', async () => {
    const app = makeApp(oid('r-12'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/non-existent-12');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[R-13] unknown reqId returns 404', async () => {
    const app = makeApp(oid('r-13'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/non-existent-13');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[R-14] unknown reqId returns 404', async () => {
    const app = makeApp(oid('r-14'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/non-existent-14');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[R-15] unknown reqId returns 404', async () => {
    const app = makeApp(oid('r-15'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/non-existent-15');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[R-16] unknown reqId returns 404', async () => {
    const app = makeApp(oid('r-16'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/non-existent-16');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[R-17] unknown reqId returns 404', async () => {
    const app = makeApp(oid('r-17'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/non-existent-17');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[R-18] unknown reqId returns 404', async () => {
    const app = makeApp(oid('r-18'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/non-existent-18');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[R-19] unknown reqId returns 404', async () => {
    const app = makeApp(oid('r-19'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/non-existent-19');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[R-20] unknown reqId returns 404', async () => {
    const app = makeApp(oid('r-20'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/non-existent-20');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[R-21] unknown reqId returns 404', async () => {
    const app = makeApp(oid('r-21'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/non-existent-21');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[R-22] unknown reqId returns 404', async () => {
    const app = makeApp(oid('r-22'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/non-existent-22');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[R-23] unknown reqId returns 404', async () => {
    const app = makeApp(oid('r-23'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/non-existent-23');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[R-24] unknown reqId returns 404', async () => {
    const app = makeApp(oid('r-24'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/non-existent-24');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[R-25] unknown reqId returns 404', async () => {
    const app = makeApp(oid('r-25'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/non-existent-25');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[R-26] unknown reqId returns 404', async () => {
    const app = makeApp(oid('r-26'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/non-existent-26');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[R-27] unknown reqId returns 404', async () => {
    const app = makeApp(oid('r-27'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/non-existent-27');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[R-28] unknown reqId returns 404', async () => {
    const app = makeApp(oid('r-28'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/non-existent-28');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  it('[R-29] unknown reqId returns 404', async () => {
    const app = makeApp(oid('r-29'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/non-existent-29');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

// ─── Suite S: Auto-submit — REGISTERED all mandatory met ─────────────────────
describe('Auto-submit: REGISTERED tier when all mandatory reqs met', () => {
  it('[S-0] status becomes SUBMITTED after both mandatory reqs met', async () => {
    const app = makeApp(oid('s-0'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-2');
    expect(res.body.data.status).toBe('SUBMITTED');
  });
  it('[S-1] status becomes SUBMITTED after both mandatory reqs met', async () => {
    const app = makeApp(oid('s-1'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-2');
    expect(res.body.data.status).toBe('SUBMITTED');
  });
  it('[S-2] status becomes SUBMITTED after both mandatory reqs met', async () => {
    const app = makeApp(oid('s-2'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-2');
    expect(res.body.data.status).toBe('SUBMITTED');
  });
  it('[S-3] status becomes SUBMITTED after both mandatory reqs met', async () => {
    const app = makeApp(oid('s-3'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-2');
    expect(res.body.data.status).toBe('SUBMITTED');
  });
  it('[S-4] status becomes SUBMITTED after both mandatory reqs met', async () => {
    const app = makeApp(oid('s-4'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-2');
    expect(res.body.data.status).toBe('SUBMITTED');
  });
  it('[S-5] status becomes SUBMITTED after both mandatory reqs met', async () => {
    const app = makeApp(oid('s-5'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-2');
    expect(res.body.data.status).toBe('SUBMITTED');
  });
  it('[S-6] status becomes SUBMITTED after both mandatory reqs met', async () => {
    const app = makeApp(oid('s-6'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-2');
    expect(res.body.data.status).toBe('SUBMITTED');
  });
  it('[S-7] status becomes SUBMITTED after both mandatory reqs met', async () => {
    const app = makeApp(oid('s-7'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-2');
    expect(res.body.data.status).toBe('SUBMITTED');
  });
  it('[S-8] status becomes SUBMITTED after both mandatory reqs met', async () => {
    const app = makeApp(oid('s-8'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-2');
    expect(res.body.data.status).toBe('SUBMITTED');
  });
  it('[S-9] status becomes SUBMITTED after both mandatory reqs met', async () => {
    const app = makeApp(oid('s-9'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-2');
    expect(res.body.data.status).toBe('SUBMITTED');
  });
  it('[S-10] status becomes SUBMITTED after both mandatory reqs met', async () => {
    const app = makeApp(oid('s-10'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-2');
    expect(res.body.data.status).toBe('SUBMITTED');
  });
  it('[S-11] status becomes SUBMITTED after both mandatory reqs met', async () => {
    const app = makeApp(oid('s-11'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-2');
    expect(res.body.data.status).toBe('SUBMITTED');
  });
  it('[S-12] status becomes SUBMITTED after both mandatory reqs met', async () => {
    const app = makeApp(oid('s-12'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-2');
    expect(res.body.data.status).toBe('SUBMITTED');
  });
  it('[S-13] status becomes SUBMITTED after both mandatory reqs met', async () => {
    const app = makeApp(oid('s-13'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-2');
    expect(res.body.data.status).toBe('SUBMITTED');
  });
  it('[S-14] status becomes SUBMITTED after both mandatory reqs met', async () => {
    const app = makeApp(oid('s-14'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-2');
    expect(res.body.data.status).toBe('SUBMITTED');
  });
  it('[S-15] status becomes SUBMITTED after both mandatory reqs met', async () => {
    const app = makeApp(oid('s-15'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-2');
    expect(res.body.data.status).toBe('SUBMITTED');
  });
  it('[S-16] status becomes SUBMITTED after both mandatory reqs met', async () => {
    const app = makeApp(oid('s-16'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-2');
    expect(res.body.data.status).toBe('SUBMITTED');
  });
  it('[S-17] status becomes SUBMITTED after both mandatory reqs met', async () => {
    const app = makeApp(oid('s-17'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-2');
    expect(res.body.data.status).toBe('SUBMITTED');
  });
  it('[S-18] status becomes SUBMITTED after both mandatory reqs met', async () => {
    const app = makeApp(oid('s-18'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-2');
    expect(res.body.data.status).toBe('SUBMITTED');
  });
  it('[S-19] status becomes SUBMITTED after both mandatory reqs met', async () => {
    const app = makeApp(oid('s-19'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-2');
    expect(res.body.data.status).toBe('SUBMITTED');
  });
  it('[S-20] status becomes SUBMITTED after both mandatory reqs met', async () => {
    const app = makeApp(oid('s-20'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-2');
    expect(res.body.data.status).toBe('SUBMITTED');
  });
  it('[S-21] status becomes SUBMITTED after both mandatory reqs met', async () => {
    const app = makeApp(oid('s-21'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-2');
    expect(res.body.data.status).toBe('SUBMITTED');
  });
  it('[S-22] status becomes SUBMITTED after both mandatory reqs met', async () => {
    const app = makeApp(oid('s-22'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-2');
    expect(res.body.data.status).toBe('SUBMITTED');
  });
  it('[S-23] status becomes SUBMITTED after both mandatory reqs met', async () => {
    const app = makeApp(oid('s-23'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-2');
    expect(res.body.data.status).toBe('SUBMITTED');
  });
  it('[S-24] status becomes SUBMITTED after both mandatory reqs met', async () => {
    const app = makeApp(oid('s-24'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-2');
    expect(res.body.data.status).toBe('SUBMITTED');
  });
  it('[S-25] status becomes SUBMITTED after both mandatory reqs met', async () => {
    const app = makeApp(oid('s-25'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-2');
    expect(res.body.data.status).toBe('SUBMITTED');
  });
  it('[S-26] status becomes SUBMITTED after both mandatory reqs met', async () => {
    const app = makeApp(oid('s-26'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-2');
    expect(res.body.data.status).toBe('SUBMITTED');
  });
  it('[S-27] status becomes SUBMITTED after both mandatory reqs met', async () => {
    const app = makeApp(oid('s-27'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-2');
    expect(res.body.data.status).toBe('SUBMITTED');
  });
  it('[S-28] status becomes SUBMITTED after both mandatory reqs met', async () => {
    const app = makeApp(oid('s-28'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-2');
    expect(res.body.data.status).toBe('SUBMITTED');
  });
  it('[S-29] status becomes SUBMITTED after both mandatory reqs met', async () => {
    const app = makeApp(oid('s-29'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-2');
    expect(res.body.data.status).toBe('SUBMITTED');
  });
  it('[S-30] status becomes SUBMITTED after both mandatory reqs met', async () => {
    const app = makeApp(oid('s-30'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-2');
    expect(res.body.data.status).toBe('SUBMITTED');
  });
  it('[S-31] status becomes SUBMITTED after both mandatory reqs met', async () => {
    const app = makeApp(oid('s-31'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-2');
    expect(res.body.data.status).toBe('SUBMITTED');
  });
  it('[S-32] status becomes SUBMITTED after both mandatory reqs met', async () => {
    const app = makeApp(oid('s-32'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-2');
    expect(res.body.data.status).toBe('SUBMITTED');
  });
  it('[S-33] status becomes SUBMITTED after both mandatory reqs met', async () => {
    const app = makeApp(oid('s-33'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-2');
    expect(res.body.data.status).toBe('SUBMITTED');
  });
  it('[S-34] status becomes SUBMITTED after both mandatory reqs met', async () => {
    const app = makeApp(oid('s-34'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-2');
    expect(res.body.data.status).toBe('SUBMITTED');
  });
  it('[S-35] status becomes SUBMITTED after both mandatory reqs met', async () => {
    const app = makeApp(oid('s-35'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-2');
    expect(res.body.data.status).toBe('SUBMITTED');
  });
  it('[S-36] status becomes SUBMITTED after both mandatory reqs met', async () => {
    const app = makeApp(oid('s-36'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-2');
    expect(res.body.data.status).toBe('SUBMITTED');
  });
  it('[S-37] status becomes SUBMITTED after both mandatory reqs met', async () => {
    const app = makeApp(oid('s-37'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-2');
    expect(res.body.data.status).toBe('SUBMITTED');
  });
  it('[S-38] status becomes SUBMITTED after both mandatory reqs met', async () => {
    const app = makeApp(oid('s-38'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-2');
    expect(res.body.data.status).toBe('SUBMITTED');
  });
  it('[S-39] status becomes SUBMITTED after both mandatory reqs met', async () => {
    const app = makeApp(oid('s-39'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-2');
    expect(res.body.data.status).toBe('SUBMITTED');
  });
});

// ─── Suite T: Partial mandatory reqs — stays IN_PROGRESS ─────────────────────
describe('Auto-submit: partial mandatory — stays IN_PROGRESS', () => {
  it('[T-0] marking only reg-1 keeps status IN_PROGRESS', async () => {
    const app = makeApp(oid('t-0'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.body.data.status).toBe('IN_PROGRESS');
  });
  it('[T-1] marking only reg-1 keeps status IN_PROGRESS', async () => {
    const app = makeApp(oid('t-1'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.body.data.status).toBe('IN_PROGRESS');
  });
  it('[T-2] marking only reg-1 keeps status IN_PROGRESS', async () => {
    const app = makeApp(oid('t-2'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.body.data.status).toBe('IN_PROGRESS');
  });
  it('[T-3] marking only reg-1 keeps status IN_PROGRESS', async () => {
    const app = makeApp(oid('t-3'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.body.data.status).toBe('IN_PROGRESS');
  });
  it('[T-4] marking only reg-1 keeps status IN_PROGRESS', async () => {
    const app = makeApp(oid('t-4'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.body.data.status).toBe('IN_PROGRESS');
  });
  it('[T-5] marking only reg-1 keeps status IN_PROGRESS', async () => {
    const app = makeApp(oid('t-5'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.body.data.status).toBe('IN_PROGRESS');
  });
  it('[T-6] marking only reg-1 keeps status IN_PROGRESS', async () => {
    const app = makeApp(oid('t-6'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.body.data.status).toBe('IN_PROGRESS');
  });
  it('[T-7] marking only reg-1 keeps status IN_PROGRESS', async () => {
    const app = makeApp(oid('t-7'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.body.data.status).toBe('IN_PROGRESS');
  });
  it('[T-8] marking only reg-1 keeps status IN_PROGRESS', async () => {
    const app = makeApp(oid('t-8'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.body.data.status).toBe('IN_PROGRESS');
  });
  it('[T-9] marking only reg-1 keeps status IN_PROGRESS', async () => {
    const app = makeApp(oid('t-9'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.body.data.status).toBe('IN_PROGRESS');
  });
  it('[T-10] marking only reg-1 keeps status IN_PROGRESS', async () => {
    const app = makeApp(oid('t-10'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.body.data.status).toBe('IN_PROGRESS');
  });
  it('[T-11] marking only reg-1 keeps status IN_PROGRESS', async () => {
    const app = makeApp(oid('t-11'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.body.data.status).toBe('IN_PROGRESS');
  });
  it('[T-12] marking only reg-1 keeps status IN_PROGRESS', async () => {
    const app = makeApp(oid('t-12'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.body.data.status).toBe('IN_PROGRESS');
  });
  it('[T-13] marking only reg-1 keeps status IN_PROGRESS', async () => {
    const app = makeApp(oid('t-13'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.body.data.status).toBe('IN_PROGRESS');
  });
  it('[T-14] marking only reg-1 keeps status IN_PROGRESS', async () => {
    const app = makeApp(oid('t-14'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.body.data.status).toBe('IN_PROGRESS');
  });
  it('[T-15] marking only reg-1 keeps status IN_PROGRESS', async () => {
    const app = makeApp(oid('t-15'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.body.data.status).toBe('IN_PROGRESS');
  });
  it('[T-16] marking only reg-1 keeps status IN_PROGRESS', async () => {
    const app = makeApp(oid('t-16'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.body.data.status).toBe('IN_PROGRESS');
  });
  it('[T-17] marking only reg-1 keeps status IN_PROGRESS', async () => {
    const app = makeApp(oid('t-17'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.body.data.status).toBe('IN_PROGRESS');
  });
  it('[T-18] marking only reg-1 keeps status IN_PROGRESS', async () => {
    const app = makeApp(oid('t-18'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.body.data.status).toBe('IN_PROGRESS');
  });
  it('[T-19] marking only reg-1 keeps status IN_PROGRESS', async () => {
    const app = makeApp(oid('t-19'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.body.data.status).toBe('IN_PROGRESS');
  });
  it('[T-20] marking only reg-1 keeps status IN_PROGRESS', async () => {
    const app = makeApp(oid('t-20'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.body.data.status).toBe('IN_PROGRESS');
  });
  it('[T-21] marking only reg-1 keeps status IN_PROGRESS', async () => {
    const app = makeApp(oid('t-21'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.body.data.status).toBe('IN_PROGRESS');
  });
  it('[T-22] marking only reg-1 keeps status IN_PROGRESS', async () => {
    const app = makeApp(oid('t-22'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.body.data.status).toBe('IN_PROGRESS');
  });
  it('[T-23] marking only reg-1 keeps status IN_PROGRESS', async () => {
    const app = makeApp(oid('t-23'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.body.data.status).toBe('IN_PROGRESS');
  });
  it('[T-24] marking only reg-1 keeps status IN_PROGRESS', async () => {
    const app = makeApp(oid('t-24'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.body.data.status).toBe('IN_PROGRESS');
  });
  it('[T-25] marking only reg-1 keeps status IN_PROGRESS', async () => {
    const app = makeApp(oid('t-25'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.body.data.status).toBe('IN_PROGRESS');
  });
  it('[T-26] marking only reg-1 keeps status IN_PROGRESS', async () => {
    const app = makeApp(oid('t-26'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.body.data.status).toBe('IN_PROGRESS');
  });
  it('[T-27] marking only reg-1 keeps status IN_PROGRESS', async () => {
    const app = makeApp(oid('t-27'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.body.data.status).toBe('IN_PROGRESS');
  });
  it('[T-28] marking only reg-1 keeps status IN_PROGRESS', async () => {
    const app = makeApp(oid('t-28'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.body.data.status).toBe('IN_PROGRESS');
  });
  it('[T-29] marking only reg-1 keeps status IN_PROGRESS', async () => {
    const app = makeApp(oid('t-29'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.body.data.status).toBe('IN_PROGRESS');
  });
});

// ─── Suite U: GET / after POST — cert appears in array ───────────────────────
describe('GET / after POST — certifications array updated', () => {
  it('[U-0] GET / after POST shows new certification', async () => {
    const app = makeApp(oid('u-0'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).get('/api/certifications');
    expect(res.body.data.certifications.some((c: any) => c.id === certId)).toBe(true);
  });
  it('[U-1] GET / after POST shows new certification', async () => {
    const app = makeApp(oid('u-1'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).get('/api/certifications');
    expect(res.body.data.certifications.some((c: any) => c.id === certId)).toBe(true);
  });
  it('[U-2] GET / after POST shows new certification', async () => {
    const app = makeApp(oid('u-2'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).get('/api/certifications');
    expect(res.body.data.certifications.some((c: any) => c.id === certId)).toBe(true);
  });
  it('[U-3] GET / after POST shows new certification', async () => {
    const app = makeApp(oid('u-3'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).get('/api/certifications');
    expect(res.body.data.certifications.some((c: any) => c.id === certId)).toBe(true);
  });
  it('[U-4] GET / after POST shows new certification', async () => {
    const app = makeApp(oid('u-4'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).get('/api/certifications');
    expect(res.body.data.certifications.some((c: any) => c.id === certId)).toBe(true);
  });
  it('[U-5] GET / after POST shows new certification', async () => {
    const app = makeApp(oid('u-5'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).get('/api/certifications');
    expect(res.body.data.certifications.some((c: any) => c.id === certId)).toBe(true);
  });
  it('[U-6] GET / after POST shows new certification', async () => {
    const app = makeApp(oid('u-6'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).get('/api/certifications');
    expect(res.body.data.certifications.some((c: any) => c.id === certId)).toBe(true);
  });
  it('[U-7] GET / after POST shows new certification', async () => {
    const app = makeApp(oid('u-7'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).get('/api/certifications');
    expect(res.body.data.certifications.some((c: any) => c.id === certId)).toBe(true);
  });
  it('[U-8] GET / after POST shows new certification', async () => {
    const app = makeApp(oid('u-8'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).get('/api/certifications');
    expect(res.body.data.certifications.some((c: any) => c.id === certId)).toBe(true);
  });
  it('[U-9] GET / after POST shows new certification', async () => {
    const app = makeApp(oid('u-9'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).get('/api/certifications');
    expect(res.body.data.certifications.some((c: any) => c.id === certId)).toBe(true);
  });
  it('[U-10] GET / after POST shows new certification', async () => {
    const app = makeApp(oid('u-10'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).get('/api/certifications');
    expect(res.body.data.certifications.some((c: any) => c.id === certId)).toBe(true);
  });
  it('[U-11] GET / after POST shows new certification', async () => {
    const app = makeApp(oid('u-11'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).get('/api/certifications');
    expect(res.body.data.certifications.some((c: any) => c.id === certId)).toBe(true);
  });
  it('[U-12] GET / after POST shows new certification', async () => {
    const app = makeApp(oid('u-12'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).get('/api/certifications');
    expect(res.body.data.certifications.some((c: any) => c.id === certId)).toBe(true);
  });
  it('[U-13] GET / after POST shows new certification', async () => {
    const app = makeApp(oid('u-13'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).get('/api/certifications');
    expect(res.body.data.certifications.some((c: any) => c.id === certId)).toBe(true);
  });
  it('[U-14] GET / after POST shows new certification', async () => {
    const app = makeApp(oid('u-14'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).get('/api/certifications');
    expect(res.body.data.certifications.some((c: any) => c.id === certId)).toBe(true);
  });
  it('[U-15] GET / after POST shows new certification', async () => {
    const app = makeApp(oid('u-15'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).get('/api/certifications');
    expect(res.body.data.certifications.some((c: any) => c.id === certId)).toBe(true);
  });
  it('[U-16] GET / after POST shows new certification', async () => {
    const app = makeApp(oid('u-16'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).get('/api/certifications');
    expect(res.body.data.certifications.some((c: any) => c.id === certId)).toBe(true);
  });
  it('[U-17] GET / after POST shows new certification', async () => {
    const app = makeApp(oid('u-17'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).get('/api/certifications');
    expect(res.body.data.certifications.some((c: any) => c.id === certId)).toBe(true);
  });
  it('[U-18] GET / after POST shows new certification', async () => {
    const app = makeApp(oid('u-18'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).get('/api/certifications');
    expect(res.body.data.certifications.some((c: any) => c.id === certId)).toBe(true);
  });
  it('[U-19] GET / after POST shows new certification', async () => {
    const app = makeApp(oid('u-19'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).get('/api/certifications');
    expect(res.body.data.certifications.some((c: any) => c.id === certId)).toBe(true);
  });
});

// ─── Suite V: writeRoleGuard — 403 for non-ADMIN/MANAGER ─────────────────────
describe('POST/PATCH — 403 for VIEWER role', () => {
  it('[V-post-0] VIEWER role POST returns 403', async () => {
    const app = makeApp(oid('v-post-0'), 'VIEWER');
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[V-post-1] VIEWER role POST returns 403', async () => {
    const app = makeApp(oid('v-post-1'), 'VIEWER');
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[V-post-2] VIEWER role POST returns 403', async () => {
    const app = makeApp(oid('v-post-2'), 'VIEWER');
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[V-post-3] VIEWER role POST returns 403', async () => {
    const app = makeApp(oid('v-post-3'), 'VIEWER');
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[V-post-4] VIEWER role POST returns 403', async () => {
    const app = makeApp(oid('v-post-4'), 'VIEWER');
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[V-post-5] VIEWER role POST returns 403', async () => {
    const app = makeApp(oid('v-post-5'), 'VIEWER');
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[V-post-6] VIEWER role POST returns 403', async () => {
    const app = makeApp(oid('v-post-6'), 'VIEWER');
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[V-post-7] VIEWER role POST returns 403', async () => {
    const app = makeApp(oid('v-post-7'), 'VIEWER');
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[V-post-8] VIEWER role POST returns 403', async () => {
    const app = makeApp(oid('v-post-8'), 'VIEWER');
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[V-post-9] VIEWER role POST returns 403', async () => {
    const app = makeApp(oid('v-post-9'), 'VIEWER');
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[V-post-10] VIEWER role POST returns 403', async () => {
    const app = makeApp(oid('v-post-10'), 'VIEWER');
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[V-post-11] VIEWER role POST returns 403', async () => {
    const app = makeApp(oid('v-post-11'), 'VIEWER');
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[V-post-12] VIEWER role POST returns 403', async () => {
    const app = makeApp(oid('v-post-12'), 'VIEWER');
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[V-post-13] VIEWER role POST returns 403', async () => {
    const app = makeApp(oid('v-post-13'), 'VIEWER');
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[V-post-14] VIEWER role POST returns 403', async () => {
    const app = makeApp(oid('v-post-14'), 'VIEWER');
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
  it('[V-patch-0] VIEWER role PATCH returns 403', async () => {
    const appAdmin = makeApp(oid('v-pa-0'));
    const create = await request(appAdmin).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const appViewer = makeApp(oid('v-pa-0'), 'VIEWER');
    const res = await request(appViewer).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(403);
  });
  it('[V-patch-1] VIEWER role PATCH returns 403', async () => {
    const appAdmin = makeApp(oid('v-pa-1'));
    const create = await request(appAdmin).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const appViewer = makeApp(oid('v-pa-1'), 'VIEWER');
    const res = await request(appViewer).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(403);
  });
  it('[V-patch-2] VIEWER role PATCH returns 403', async () => {
    const appAdmin = makeApp(oid('v-pa-2'));
    const create = await request(appAdmin).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const appViewer = makeApp(oid('v-pa-2'), 'VIEWER');
    const res = await request(appViewer).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(403);
  });
  it('[V-patch-3] VIEWER role PATCH returns 403', async () => {
    const appAdmin = makeApp(oid('v-pa-3'));
    const create = await request(appAdmin).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const appViewer = makeApp(oid('v-pa-3'), 'VIEWER');
    const res = await request(appViewer).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(403);
  });
  it('[V-patch-4] VIEWER role PATCH returns 403', async () => {
    const appAdmin = makeApp(oid('v-pa-4'));
    const create = await request(appAdmin).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const appViewer = makeApp(oid('v-pa-4'), 'VIEWER');
    const res = await request(appViewer).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(403);
  });
  it('[V-patch-5] VIEWER role PATCH returns 403', async () => {
    const appAdmin = makeApp(oid('v-pa-5'));
    const create = await request(appAdmin).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const appViewer = makeApp(oid('v-pa-5'), 'VIEWER');
    const res = await request(appViewer).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(403);
  });
  it('[V-patch-6] VIEWER role PATCH returns 403', async () => {
    const appAdmin = makeApp(oid('v-pa-6'));
    const create = await request(appAdmin).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const appViewer = makeApp(oid('v-pa-6'), 'VIEWER');
    const res = await request(appViewer).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(403);
  });
  it('[V-patch-7] VIEWER role PATCH returns 403', async () => {
    const appAdmin = makeApp(oid('v-pa-7'));
    const create = await request(appAdmin).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const appViewer = makeApp(oid('v-pa-7'), 'VIEWER');
    const res = await request(appViewer).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(403);
  });
  it('[V-patch-8] VIEWER role PATCH returns 403', async () => {
    const appAdmin = makeApp(oid('v-pa-8'));
    const create = await request(appAdmin).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const appViewer = makeApp(oid('v-pa-8'), 'VIEWER');
    const res = await request(appViewer).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(403);
  });
  it('[V-patch-9] VIEWER role PATCH returns 403', async () => {
    const appAdmin = makeApp(oid('v-pa-9'));
    const create = await request(appAdmin).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const appViewer = makeApp(oid('v-pa-9'), 'VIEWER');
    const res = await request(appViewer).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(403);
  });
  it('[V-patch-10] VIEWER role PATCH returns 403', async () => {
    const appAdmin = makeApp(oid('v-pa-10'));
    const create = await request(appAdmin).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const appViewer = makeApp(oid('v-pa-10'), 'VIEWER');
    const res = await request(appViewer).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(403);
  });
  it('[V-patch-11] VIEWER role PATCH returns 403', async () => {
    const appAdmin = makeApp(oid('v-pa-11'));
    const create = await request(appAdmin).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const appViewer = makeApp(oid('v-pa-11'), 'VIEWER');
    const res = await request(appViewer).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(403);
  });
  it('[V-patch-12] VIEWER role PATCH returns 403', async () => {
    const appAdmin = makeApp(oid('v-pa-12'));
    const create = await request(appAdmin).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const appViewer = makeApp(oid('v-pa-12'), 'VIEWER');
    const res = await request(appViewer).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(403);
  });
  it('[V-patch-13] VIEWER role PATCH returns 403', async () => {
    const appAdmin = makeApp(oid('v-pa-13'));
    const create = await request(appAdmin).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const appViewer = makeApp(oid('v-pa-13'), 'VIEWER');
    const res = await request(appViewer).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(403);
  });
  it('[V-patch-14] VIEWER role PATCH returns 403', async () => {
    const appAdmin = makeApp(oid('v-pa-14'));
    const create = await request(appAdmin).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const appViewer = makeApp(oid('v-pa-14'), 'VIEWER');
    const res = await request(appViewer).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(403);
  });
});

// ─── Suite W: MANAGER role allowed ───────────────────────────────────────────
describe('POST/PATCH — MANAGER role allowed', () => {
  it('[W-post-0] MANAGER role POST returns 201', async () => {
    const app = makeApp(oid('w-post-0'), 'MANAGER');
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    expect(res.status).toBe(201);
  });
  it('[W-post-1] MANAGER role POST returns 201', async () => {
    const app = makeApp(oid('w-post-1'), 'MANAGER');
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    expect(res.status).toBe(201);
  });
  it('[W-post-2] MANAGER role POST returns 201', async () => {
    const app = makeApp(oid('w-post-2'), 'MANAGER');
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    expect(res.status).toBe(201);
  });
  it('[W-post-3] MANAGER role POST returns 201', async () => {
    const app = makeApp(oid('w-post-3'), 'MANAGER');
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    expect(res.status).toBe(201);
  });
  it('[W-post-4] MANAGER role POST returns 201', async () => {
    const app = makeApp(oid('w-post-4'), 'MANAGER');
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    expect(res.status).toBe(201);
  });
  it('[W-post-5] MANAGER role POST returns 201', async () => {
    const app = makeApp(oid('w-post-5'), 'MANAGER');
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    expect(res.status).toBe(201);
  });
  it('[W-post-6] MANAGER role POST returns 201', async () => {
    const app = makeApp(oid('w-post-6'), 'MANAGER');
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    expect(res.status).toBe(201);
  });
  it('[W-post-7] MANAGER role POST returns 201', async () => {
    const app = makeApp(oid('w-post-7'), 'MANAGER');
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    expect(res.status).toBe(201);
  });
  it('[W-post-8] MANAGER role POST returns 201', async () => {
    const app = makeApp(oid('w-post-8'), 'MANAGER');
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    expect(res.status).toBe(201);
  });
  it('[W-post-9] MANAGER role POST returns 201', async () => {
    const app = makeApp(oid('w-post-9'), 'MANAGER');
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    expect(res.status).toBe(201);
  });
  it('[W-patch-0] MANAGER role PATCH returns 200', async () => {
    const app = makeApp(oid('w-patch-0'), 'MANAGER');
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(200);
  });
  it('[W-patch-1] MANAGER role PATCH returns 200', async () => {
    const app = makeApp(oid('w-patch-1'), 'MANAGER');
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(200);
  });
  it('[W-patch-2] MANAGER role PATCH returns 200', async () => {
    const app = makeApp(oid('w-patch-2'), 'MANAGER');
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(200);
  });
  it('[W-patch-3] MANAGER role PATCH returns 200', async () => {
    const app = makeApp(oid('w-patch-3'), 'MANAGER');
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(200);
  });
  it('[W-patch-4] MANAGER role PATCH returns 200', async () => {
    const app = makeApp(oid('w-patch-4'), 'MANAGER');
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(200);
  });
  it('[W-patch-5] MANAGER role PATCH returns 200', async () => {
    const app = makeApp(oid('w-patch-5'), 'MANAGER');
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(200);
  });
  it('[W-patch-6] MANAGER role PATCH returns 200', async () => {
    const app = makeApp(oid('w-patch-6'), 'MANAGER');
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(200);
  });
  it('[W-patch-7] MANAGER role PATCH returns 200', async () => {
    const app = makeApp(oid('w-patch-7'), 'MANAGER');
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(200);
  });
  it('[W-patch-8] MANAGER role PATCH returns 200', async () => {
    const app = makeApp(oid('w-patch-8'), 'MANAGER');
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(200);
  });
  it('[W-patch-9] MANAGER role PATCH returns 200', async () => {
    const app = makeApp(oid('w-patch-9'), 'MANAGER');
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.status).toBe(200);
  });
});

// ─── Suite X: GET /requirements per tier — detailed ──────────────────────────
describe('GET /requirements per tier — detailed shape', () => {
  it('[X-0] tier=REGISTERED reg-1 type=REFERENCE', async () => {
    const app = makeApp(oid('x-0'));
    const res = await request(app).get('/api/certifications/requirements?tier=REGISTERED');
    const req = res.body.data.requirements.find((r: any) => r.id === 'reg-1');
    expect(req).toBeDefined();
    expect(req.type).toBe('REFERENCE');
  });
  it('[X-1] tier=REGISTERED reg-1 has description', async () => {
    const app = makeApp(oid('x-1'));
    const res = await request(app).get('/api/certifications/requirements?tier=REGISTERED');
    const req = res.body.data.requirements.find((r: any) => r.id === 'reg-1');
    expect(req.description).toBeTruthy();
  });
  it('[X-2] tier=REGISTERED reg-1 has title', async () => {
    const app = makeApp(oid('x-2'));
    const res = await request(app).get('/api/certifications/requirements?tier=REGISTERED');
    const req = res.body.data.requirements.find((r: any) => r.id === 'reg-1');
    expect(req.title).toBeTruthy();
  });
  it('[X-3] tier=REGISTERED reg-2 type=TRAINING', async () => {
    const app = makeApp(oid('x-3'));
    const res = await request(app).get('/api/certifications/requirements?tier=REGISTERED');
    const req = res.body.data.requirements.find((r: any) => r.id === 'reg-2');
    expect(req).toBeDefined();
    expect(req.type).toBe('TRAINING');
  });
  it('[X-4] tier=REGISTERED reg-2 has description', async () => {
    const app = makeApp(oid('x-4'));
    const res = await request(app).get('/api/certifications/requirements?tier=REGISTERED');
    const req = res.body.data.requirements.find((r: any) => r.id === 'reg-2');
    expect(req.description).toBeTruthy();
  });
  it('[X-5] tier=REGISTERED reg-2 has title', async () => {
    const app = makeApp(oid('x-5'));
    const res = await request(app).get('/api/certifications/requirements?tier=REGISTERED');
    const req = res.body.data.requirements.find((r: any) => r.id === 'reg-2');
    expect(req.title).toBeTruthy();
  });
  it('[X-6] tier=CERTIFIED cert-1 type=EXAM', async () => {
    const app = makeApp(oid('x-6'));
    const res = await request(app).get('/api/certifications/requirements?tier=CERTIFIED');
    const req = res.body.data.requirements.find((r: any) => r.id === 'cert-1');
    expect(req).toBeDefined();
    expect(req.type).toBe('EXAM');
  });
  it('[X-7] tier=CERTIFIED cert-1 has description', async () => {
    const app = makeApp(oid('x-7'));
    const res = await request(app).get('/api/certifications/requirements?tier=CERTIFIED');
    const req = res.body.data.requirements.find((r: any) => r.id === 'cert-1');
    expect(req.description).toBeTruthy();
  });
  it('[X-8] tier=CERTIFIED cert-1 has title', async () => {
    const app = makeApp(oid('x-8'));
    const res = await request(app).get('/api/certifications/requirements?tier=CERTIFIED');
    const req = res.body.data.requirements.find((r: any) => r.id === 'cert-1');
    expect(req.title).toBeTruthy();
  });
  it('[X-9] tier=CERTIFIED cert-2 type=CASE_STUDY', async () => {
    const app = makeApp(oid('x-9'));
    const res = await request(app).get('/api/certifications/requirements?tier=CERTIFIED');
    const req = res.body.data.requirements.find((r: any) => r.id === 'cert-2');
    expect(req).toBeDefined();
    expect(req.type).toBe('CASE_STUDY');
  });
  it('[X-10] tier=CERTIFIED cert-2 has description', async () => {
    const app = makeApp(oid('x-10'));
    const res = await request(app).get('/api/certifications/requirements?tier=CERTIFIED');
    const req = res.body.data.requirements.find((r: any) => r.id === 'cert-2');
    expect(req.description).toBeTruthy();
  });
  it('[X-11] tier=CERTIFIED cert-2 has title', async () => {
    const app = makeApp(oid('x-11'));
    const res = await request(app).get('/api/certifications/requirements?tier=CERTIFIED');
    const req = res.body.data.requirements.find((r: any) => r.id === 'cert-2');
    expect(req.title).toBeTruthy();
  });
  it('[X-12] tier=CERTIFIED cert-3 type=REVENUE', async () => {
    const app = makeApp(oid('x-12'));
    const res = await request(app).get('/api/certifications/requirements?tier=CERTIFIED');
    const req = res.body.data.requirements.find((r: any) => r.id === 'cert-3');
    expect(req).toBeDefined();
    expect(req.type).toBe('REVENUE');
  });
  it('[X-13] tier=CERTIFIED cert-3 has description', async () => {
    const app = makeApp(oid('x-13'));
    const res = await request(app).get('/api/certifications/requirements?tier=CERTIFIED');
    const req = res.body.data.requirements.find((r: any) => r.id === 'cert-3');
    expect(req.description).toBeTruthy();
  });
  it('[X-14] tier=CERTIFIED cert-3 has title', async () => {
    const app = makeApp(oid('x-14'));
    const res = await request(app).get('/api/certifications/requirements?tier=CERTIFIED');
    const req = res.body.data.requirements.find((r: any) => r.id === 'cert-3');
    expect(req.title).toBeTruthy();
  });
  it('[X-15] tier=GOLD gold-1 type=EXAM', async () => {
    const app = makeApp(oid('x-15'));
    const res = await request(app).get('/api/certifications/requirements?tier=GOLD');
    const req = res.body.data.requirements.find((r: any) => r.id === 'gold-1');
    expect(req).toBeDefined();
    expect(req.type).toBe('EXAM');
  });
  it('[X-16] tier=GOLD gold-1 has description', async () => {
    const app = makeApp(oid('x-16'));
    const res = await request(app).get('/api/certifications/requirements?tier=GOLD');
    const req = res.body.data.requirements.find((r: any) => r.id === 'gold-1');
    expect(req.description).toBeTruthy();
  });
  it('[X-17] tier=GOLD gold-1 has title', async () => {
    const app = makeApp(oid('x-17'));
    const res = await request(app).get('/api/certifications/requirements?tier=GOLD');
    const req = res.body.data.requirements.find((r: any) => r.id === 'gold-1');
    expect(req.title).toBeTruthy();
  });
  it('[X-18] tier=GOLD gold-2 type=REFERENCE', async () => {
    const app = makeApp(oid('x-18'));
    const res = await request(app).get('/api/certifications/requirements?tier=GOLD');
    const req = res.body.data.requirements.find((r: any) => r.id === 'gold-2');
    expect(req).toBeDefined();
    expect(req.type).toBe('REFERENCE');
  });
  it('[X-19] tier=GOLD gold-2 has description', async () => {
    const app = makeApp(oid('x-19'));
    const res = await request(app).get('/api/certifications/requirements?tier=GOLD');
    const req = res.body.data.requirements.find((r: any) => r.id === 'gold-2');
    expect(req.description).toBeTruthy();
  });
  it('[X-20] tier=GOLD gold-2 has title', async () => {
    const app = makeApp(oid('x-20'));
    const res = await request(app).get('/api/certifications/requirements?tier=GOLD');
    const req = res.body.data.requirements.find((r: any) => r.id === 'gold-2');
    expect(req.title).toBeTruthy();
  });
  it('[X-21] tier=GOLD gold-3 type=REVENUE', async () => {
    const app = makeApp(oid('x-21'));
    const res = await request(app).get('/api/certifications/requirements?tier=GOLD');
    const req = res.body.data.requirements.find((r: any) => r.id === 'gold-3');
    expect(req).toBeDefined();
    expect(req.type).toBe('REVENUE');
  });
  it('[X-22] tier=GOLD gold-3 has description', async () => {
    const app = makeApp(oid('x-22'));
    const res = await request(app).get('/api/certifications/requirements?tier=GOLD');
    const req = res.body.data.requirements.find((r: any) => r.id === 'gold-3');
    expect(req.description).toBeTruthy();
  });
  it('[X-23] tier=GOLD gold-3 has title', async () => {
    const app = makeApp(oid('x-23'));
    const res = await request(app).get('/api/certifications/requirements?tier=GOLD');
    const req = res.body.data.requirements.find((r: any) => r.id === 'gold-3');
    expect(req.title).toBeTruthy();
  });
  it('[X-24] tier=PLATINUM plat-1 type=EXAM', async () => {
    const app = makeApp(oid('x-24'));
    const res = await request(app).get('/api/certifications/requirements?tier=PLATINUM');
    const req = res.body.data.requirements.find((r: any) => r.id === 'plat-1');
    expect(req).toBeDefined();
    expect(req.type).toBe('EXAM');
  });
  it('[X-25] tier=PLATINUM plat-1 has description', async () => {
    const app = makeApp(oid('x-25'));
    const res = await request(app).get('/api/certifications/requirements?tier=PLATINUM');
    const req = res.body.data.requirements.find((r: any) => r.id === 'plat-1');
    expect(req.description).toBeTruthy();
  });
  it('[X-26] tier=PLATINUM plat-1 has title', async () => {
    const app = makeApp(oid('x-26'));
    const res = await request(app).get('/api/certifications/requirements?tier=PLATINUM');
    const req = res.body.data.requirements.find((r: any) => r.id === 'plat-1');
    expect(req.title).toBeTruthy();
  });
  it('[X-27] tier=PLATINUM plat-2 type=REFERENCE', async () => {
    const app = makeApp(oid('x-27'));
    const res = await request(app).get('/api/certifications/requirements?tier=PLATINUM');
    const req = res.body.data.requirements.find((r: any) => r.id === 'plat-2');
    expect(req).toBeDefined();
    expect(req.type).toBe('REFERENCE');
  });
  it('[X-28] tier=PLATINUM plat-2 has description', async () => {
    const app = makeApp(oid('x-28'));
    const res = await request(app).get('/api/certifications/requirements?tier=PLATINUM');
    const req = res.body.data.requirements.find((r: any) => r.id === 'plat-2');
    expect(req.description).toBeTruthy();
  });
  it('[X-29] tier=PLATINUM plat-2 has title', async () => {
    const app = makeApp(oid('x-29'));
    const res = await request(app).get('/api/certifications/requirements?tier=PLATINUM');
    const req = res.body.data.requirements.find((r: any) => r.id === 'plat-2');
    expect(req.title).toBeTruthy();
  });
});

// ─── Suite Y: Content-Type headers ───────────────────────────────────────────
describe('Content-Type headers', () => {
  it('[Y-req-0] GET /requirements returns json', async () => {
    const app = makeApp(oid('y-req-0'));
    const res = await request(app).get('/api/certifications/requirements');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Y-req-1] GET /requirements returns json', async () => {
    const app = makeApp(oid('y-req-1'));
    const res = await request(app).get('/api/certifications/requirements');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Y-req-2] GET /requirements returns json', async () => {
    const app = makeApp(oid('y-req-2'));
    const res = await request(app).get('/api/certifications/requirements');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Y-req-3] GET /requirements returns json', async () => {
    const app = makeApp(oid('y-req-3'));
    const res = await request(app).get('/api/certifications/requirements');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Y-req-4] GET /requirements returns json', async () => {
    const app = makeApp(oid('y-req-4'));
    const res = await request(app).get('/api/certifications/requirements');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Y-req-5] GET /requirements returns json', async () => {
    const app = makeApp(oid('y-req-5'));
    const res = await request(app).get('/api/certifications/requirements');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Y-req-6] GET /requirements returns json', async () => {
    const app = makeApp(oid('y-req-6'));
    const res = await request(app).get('/api/certifications/requirements');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Y-req-7] GET /requirements returns json', async () => {
    const app = makeApp(oid('y-req-7'));
    const res = await request(app).get('/api/certifications/requirements');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Y-req-8] GET /requirements returns json', async () => {
    const app = makeApp(oid('y-req-8'));
    const res = await request(app).get('/api/certifications/requirements');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Y-req-9] GET /requirements returns json', async () => {
    const app = makeApp(oid('y-req-9'));
    const res = await request(app).get('/api/certifications/requirements');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Y-list-0] GET / returns json', async () => {
    const app = makeApp(oid('y-list-0'));
    const res = await request(app).get('/api/certifications');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Y-list-1] GET / returns json', async () => {
    const app = makeApp(oid('y-list-1'));
    const res = await request(app).get('/api/certifications');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Y-list-2] GET / returns json', async () => {
    const app = makeApp(oid('y-list-2'));
    const res = await request(app).get('/api/certifications');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Y-list-3] GET / returns json', async () => {
    const app = makeApp(oid('y-list-3'));
    const res = await request(app).get('/api/certifications');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Y-list-4] GET / returns json', async () => {
    const app = makeApp(oid('y-list-4'));
    const res = await request(app).get('/api/certifications');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Y-list-5] GET / returns json', async () => {
    const app = makeApp(oid('y-list-5'));
    const res = await request(app).get('/api/certifications');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Y-list-6] GET / returns json', async () => {
    const app = makeApp(oid('y-list-6'));
    const res = await request(app).get('/api/certifications');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Y-list-7] GET / returns json', async () => {
    const app = makeApp(oid('y-list-7'));
    const res = await request(app).get('/api/certifications');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Y-list-8] GET / returns json', async () => {
    const app = makeApp(oid('y-list-8'));
    const res = await request(app).get('/api/certifications');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Y-list-9] GET / returns json', async () => {
    const app = makeApp(oid('y-list-9'));
    const res = await request(app).get('/api/certifications');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Y-post-0] POST / returns json', async () => {
    const app = makeApp(oid('y-post-0'));
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Y-post-1] POST / returns json', async () => {
    const app = makeApp(oid('y-post-1'));
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Y-post-2] POST / returns json', async () => {
    const app = makeApp(oid('y-post-2'));
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Y-post-3] POST / returns json', async () => {
    const app = makeApp(oid('y-post-3'));
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Y-post-4] POST / returns json', async () => {
    const app = makeApp(oid('y-post-4'));
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Y-post-5] POST / returns json', async () => {
    const app = makeApp(oid('y-post-5'));
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Y-post-6] POST / returns json', async () => {
    const app = makeApp(oid('y-post-6'));
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Y-post-7] POST / returns json', async () => {
    const app = makeApp(oid('y-post-7'));
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Y-post-8] POST / returns json', async () => {
    const app = makeApp(oid('y-post-8'));
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Y-post-9] POST / returns json', async () => {
    const app = makeApp(oid('y-post-9'));
    const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Y-patch-0] PATCH returns json', async () => {
    const app = makeApp(oid('y-patch-0'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Y-patch-1] PATCH returns json', async () => {
    const app = makeApp(oid('y-patch-1'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Y-patch-2] PATCH returns json', async () => {
    const app = makeApp(oid('y-patch-2'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Y-patch-3] PATCH returns json', async () => {
    const app = makeApp(oid('y-patch-3'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Y-patch-4] PATCH returns json', async () => {
    const app = makeApp(oid('y-patch-4'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Y-patch-5] PATCH returns json', async () => {
    const app = makeApp(oid('y-patch-5'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Y-patch-6] PATCH returns json', async () => {
    const app = makeApp(oid('y-patch-6'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Y-patch-7] PATCH returns json', async () => {
    const app = makeApp(oid('y-patch-7'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Y-patch-8] PATCH returns json', async () => {
    const app = makeApp(oid('y-patch-8'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('[Y-patch-9] PATCH returns json', async () => {
    const app = makeApp(oid('y-patch-9'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
});

// ─── Suite Z: Misc boundary ───────────────────────────────────────────────────
describe('Misc boundary and edge tests', () => {
  it('[Z-0] REGISTERED tier has 2 reqs', async () => {
    const app = makeApp(oid('z-0')); const res = await request(app).get('/api/certifications/requirements?tier=REGISTERED'); expect(res.body.data.requirements).toHaveLength(2);
  });
  it('[Z-1] PLATINUM tier has 4 reqs', async () => {
    const app = makeApp(oid('z-1')); const res = await request(app).get('/api/certifications/requirements?tier=PLATINUM'); expect(res.body.data.requirements).toHaveLength(4);
  });
  it('[Z-2] POST null tier returns 400', async () => {
    const app = makeApp(oid('z-2')); const res = await request(app).post('/api/certifications').send({ tier: null }); expect(res.status).toBe(400);
  });
  it('[Z-3] POST number tier returns 400', async () => {
    const app = makeApp(oid('z-3')); const res = await request(app).post('/api/certifications').send({ tier: 123 }); expect(res.status).toBe(400);
  });
  it('[Z-4] PATCH no body works', async () => {
    const app = makeApp(oid('z-4')); const c = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' }); const res = await request(app).patch('/api/certifications/' + c.body.data.id + '/requirements/reg-1').send({}); expect(res.status).toBe(200);
  });
  it('[Z-5] new cert has no score', async () => {
    const app = makeApp(oid('z-5')); const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' }); expect(res.body.data.score).toBeUndefined();
  });
  it('[Z-6] new cert has no certificationNumber', async () => {
    const app = makeApp(oid('z-6')); const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' }); expect(res.body.data.certificationNumber).toBeUndefined();
  });
  it('[Z-7] new cert has no issuedAt', async () => {
    const app = makeApp(oid('z-7')); const res = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' }); expect(res.body.data.issuedAt).toBeUndefined();
  });
  it('[Z-8] org isolation: orgs do not share certs', async () => {
    const appA = makeApp(oid('z-8a')); const appB = makeApp(oid('z-8b')); await request(appA).post('/api/certifications').send({ tier: 'REGISTERED' }); const resB = await request(appB).get('/api/certifications'); expect(resB.body.data.certifications).toHaveLength(0);
  });
  it('[Z-9] PATCH 404 error code NOT_FOUND', async () => {
    const app = makeApp(oid('z-9')); const res = await request(app).patch('/api/certifications/bad-id/requirements/reg-1'); expect(res.body.error?.code).toBe('NOT_FOUND');
  });
  it('[Z-10] CERTIFIED auto-submit: cert-1+cert-2 → SUBMITTED', async () => {
    const app = makeApp(oid('z-10')); const c = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' }); const cId = c.body.data.id; await request(app).patch('/api/certifications/' + cId + '/requirements/cert-1'); const res = await request(app).patch('/api/certifications/' + cId + '/requirements/cert-2'); expect(res.body.data.status).toBe('SUBMITTED');
  });
  it('[Z-11] CERTIFIED cert-3 alone stays IN_PROGRESS', async () => {
    const app = makeApp(oid('z-11')); const c = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' }); const cId = c.body.data.id; const res = await request(app).patch('/api/certifications/' + cId + '/requirements/cert-3'); expect(res.body.data.status).toBe('IN_PROGRESS');
  });
  it('[Z-12] PATCH 403 error code FORBIDDEN', async () => {
    const appA = makeApp(oid('z-12a')); const appB = makeApp(oid('z-12b')); const c = await request(appA).post('/api/certifications').send({ tier: 'REGISTERED' }); const res = await request(appB).patch('/api/certifications/' + c.body.data.id + '/requirements/reg-1'); expect(res.body.error?.code).toBe('FORBIDDEN');
  });
  it('[Z-13] POST 400 error code VALIDATION_ERROR', async () => {
    const app = makeApp(oid('z-13')); const res = await request(app).post('/api/certifications').send({ tier: 'NOPE' }); expect(res.body.error?.code).toBe('VALIDATION_ERROR');
  });
  it('[Z-14] GET /requirements 400 error code VALIDATION_ERROR', async () => {
    const app = makeApp(oid('z-14')); const res = await request(app).get('/api/certifications/requirements?tier=BAD'); expect(res.body.error?.code).toBe('VALIDATION_ERROR');
  });
  it('[Z-15] multiple certs same org ok', async () => {
    const app = makeApp(oid('z-15')); const r1 = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' }); const r2 = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' }); expect(r1.status).toBe(201); expect(r2.status).toBe(201);
  });
  it('[Z-16] updatedAt set after PATCH', async () => {
    const app = makeApp(oid('z-16')); const c = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' }); const res = await request(app).patch('/api/certifications/' + c.body.data.id + '/requirements/reg-1'); expect(new Date(res.body.data.updatedAt).getTime()).not.toBeNaN();
  });
  it('[Z-17] currentTier REGISTERED for IN_PROGRESS cert', async () => {
    const app = makeApp(oid('z-17')); await request(app).post('/api/certifications').send({ tier: 'REGISTERED' }); const res = await request(app).get('/api/certifications'); expect(res.body.data.currentTier).toBe('REGISTERED');
  });
  it('[Z-18] cert in list has all required fields', async () => {
    const app = makeApp(oid('z-18')); await request(app).post('/api/certifications').send({ tier: 'GOLD' }); const res = await request(app).get('/api/certifications'); const cert = res.body.data.certifications[0]; expect(cert).toHaveProperty('id'); expect(cert).toHaveProperty('tier'); expect(cert).toHaveProperty('status'); expect(cert).toHaveProperty('requirements');
  });
  it('[Z-19] GOLD has 3 GOLD req ids', async () => {
    const app = makeApp(oid('z-19')); const res = await request(app).get('/api/certifications/requirements?tier=GOLD'); const ids = res.body.data.requirements.map((r: any) => r.id).sort(); expect(ids).toEqual(['gold-1', 'gold-2', 'gold-3']);
  });
  it('[Z-20] GET / returns 200 for org-z-20', async () => {
    const app = makeApp(oid('z-20'));
    const res = await request(app).get('/api/certifications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[Z-21] GET / returns 200 for org-z-21', async () => {
    const app = makeApp(oid('z-21'));
    const res = await request(app).get('/api/certifications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[Z-22] GET / returns 200 for org-z-22', async () => {
    const app = makeApp(oid('z-22'));
    const res = await request(app).get('/api/certifications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[Z-23] GET / returns 200 for org-z-23', async () => {
    const app = makeApp(oid('z-23'));
    const res = await request(app).get('/api/certifications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[Z-24] GET / returns 200 for org-z-24', async () => {
    const app = makeApp(oid('z-24'));
    const res = await request(app).get('/api/certifications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[Z-25] GET / returns 200 for org-z-25', async () => {
    const app = makeApp(oid('z-25'));
    const res = await request(app).get('/api/certifications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[Z-26] GET / returns 200 for org-z-26', async () => {
    const app = makeApp(oid('z-26'));
    const res = await request(app).get('/api/certifications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[Z-27] GET / returns 200 for org-z-27', async () => {
    const app = makeApp(oid('z-27'));
    const res = await request(app).get('/api/certifications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[Z-28] GET / returns 200 for org-z-28', async () => {
    const app = makeApp(oid('z-28'));
    const res = await request(app).get('/api/certifications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[Z-29] GET / returns 200 for org-z-29', async () => {
    const app = makeApp(oid('z-29'));
    const res = await request(app).get('/api/certifications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[Z-30] GET / returns 200 for org-z-30', async () => {
    const app = makeApp(oid('z-30'));
    const res = await request(app).get('/api/certifications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[Z-31] GET / returns 200 for org-z-31', async () => {
    const app = makeApp(oid('z-31'));
    const res = await request(app).get('/api/certifications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[Z-32] GET / returns 200 for org-z-32', async () => {
    const app = makeApp(oid('z-32'));
    const res = await request(app).get('/api/certifications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[Z-33] GET / returns 200 for org-z-33', async () => {
    const app = makeApp(oid('z-33'));
    const res = await request(app).get('/api/certifications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[Z-34] GET / returns 200 for org-z-34', async () => {
    const app = makeApp(oid('z-34'));
    const res = await request(app).get('/api/certifications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[Z-35] GET / returns 200 for org-z-35', async () => {
    const app = makeApp(oid('z-35'));
    const res = await request(app).get('/api/certifications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[Z-36] GET / returns 200 for org-z-36', async () => {
    const app = makeApp(oid('z-36'));
    const res = await request(app).get('/api/certifications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[Z-37] GET / returns 200 for org-z-37', async () => {
    const app = makeApp(oid('z-37'));
    const res = await request(app).get('/api/certifications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[Z-38] GET / returns 200 for org-z-38', async () => {
    const app = makeApp(oid('z-38'));
    const res = await request(app).get('/api/certifications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[Z-39] GET / returns 200 for org-z-39', async () => {
    const app = makeApp(oid('z-39'));
    const res = await request(app).get('/api/certifications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[Z-40] GET / returns 200 for org-z-40', async () => {
    const app = makeApp(oid('z-40'));
    const res = await request(app).get('/api/certifications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[Z-41] GET / returns 200 for org-z-41', async () => {
    const app = makeApp(oid('z-41'));
    const res = await request(app).get('/api/certifications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[Z-42] GET / returns 200 for org-z-42', async () => {
    const app = makeApp(oid('z-42'));
    const res = await request(app).get('/api/certifications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[Z-43] GET / returns 200 for org-z-43', async () => {
    const app = makeApp(oid('z-43'));
    const res = await request(app).get('/api/certifications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[Z-44] GET / returns 200 for org-z-44', async () => {
    const app = makeApp(oid('z-44'));
    const res = await request(app).get('/api/certifications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[Z-45] GET / returns 200 for org-z-45', async () => {
    const app = makeApp(oid('z-45'));
    const res = await request(app).get('/api/certifications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[Z-46] GET / returns 200 for org-z-46', async () => {
    const app = makeApp(oid('z-46'));
    const res = await request(app).get('/api/certifications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[Z-47] GET / returns 200 for org-z-47', async () => {
    const app = makeApp(oid('z-47'));
    const res = await request(app).get('/api/certifications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[Z-48] GET / returns 200 for org-z-48', async () => {
    const app = makeApp(oid('z-48'));
    const res = await request(app).get('/api/certifications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('[Z-49] GET / returns 200 for org-z-49', async () => {
    const app = makeApp(oid('z-49'));
    const res = await request(app).get('/api/certifications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

// ─── Suite AA: CERTIFIED auto-submit ─────────────────────────────────────────
describe('Auto-submit: CERTIFIED tier — all mandatory met', () => {
  it('[AA-0] CERTIFIED status becomes SUBMITTED after cert-1 and cert-2 met', async () => {
    const app = makeApp(oid('aa-0'));
    const create = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    const certId = create.body.data.id;
    await request(app).patch('/api/certifications/' + certId + '/requirements/cert-1');
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/cert-2');
    expect(res.body.data.status).toBe('SUBMITTED');
  });
  it('[AA-1] CERTIFIED status becomes SUBMITTED after cert-1 and cert-2 met', async () => {
    const app = makeApp(oid('aa-1'));
    const create = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    const certId = create.body.data.id;
    await request(app).patch('/api/certifications/' + certId + '/requirements/cert-1');
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/cert-2');
    expect(res.body.data.status).toBe('SUBMITTED');
  });
  it('[AA-2] CERTIFIED status becomes SUBMITTED after cert-1 and cert-2 met', async () => {
    const app = makeApp(oid('aa-2'));
    const create = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    const certId = create.body.data.id;
    await request(app).patch('/api/certifications/' + certId + '/requirements/cert-1');
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/cert-2');
    expect(res.body.data.status).toBe('SUBMITTED');
  });
  it('[AA-3] CERTIFIED status becomes SUBMITTED after cert-1 and cert-2 met', async () => {
    const app = makeApp(oid('aa-3'));
    const create = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    const certId = create.body.data.id;
    await request(app).patch('/api/certifications/' + certId + '/requirements/cert-1');
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/cert-2');
    expect(res.body.data.status).toBe('SUBMITTED');
  });
  it('[AA-4] CERTIFIED status becomes SUBMITTED after cert-1 and cert-2 met', async () => {
    const app = makeApp(oid('aa-4'));
    const create = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    const certId = create.body.data.id;
    await request(app).patch('/api/certifications/' + certId + '/requirements/cert-1');
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/cert-2');
    expect(res.body.data.status).toBe('SUBMITTED');
  });
  it('[AA-5] CERTIFIED status becomes SUBMITTED after cert-1 and cert-2 met', async () => {
    const app = makeApp(oid('aa-5'));
    const create = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    const certId = create.body.data.id;
    await request(app).patch('/api/certifications/' + certId + '/requirements/cert-1');
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/cert-2');
    expect(res.body.data.status).toBe('SUBMITTED');
  });
  it('[AA-6] CERTIFIED status becomes SUBMITTED after cert-1 and cert-2 met', async () => {
    const app = makeApp(oid('aa-6'));
    const create = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    const certId = create.body.data.id;
    await request(app).patch('/api/certifications/' + certId + '/requirements/cert-1');
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/cert-2');
    expect(res.body.data.status).toBe('SUBMITTED');
  });
  it('[AA-7] CERTIFIED status becomes SUBMITTED after cert-1 and cert-2 met', async () => {
    const app = makeApp(oid('aa-7'));
    const create = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    const certId = create.body.data.id;
    await request(app).patch('/api/certifications/' + certId + '/requirements/cert-1');
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/cert-2');
    expect(res.body.data.status).toBe('SUBMITTED');
  });
  it('[AA-8] CERTIFIED status becomes SUBMITTED after cert-1 and cert-2 met', async () => {
    const app = makeApp(oid('aa-8'));
    const create = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    const certId = create.body.data.id;
    await request(app).patch('/api/certifications/' + certId + '/requirements/cert-1');
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/cert-2');
    expect(res.body.data.status).toBe('SUBMITTED');
  });
  it('[AA-9] CERTIFIED status becomes SUBMITTED after cert-1 and cert-2 met', async () => {
    const app = makeApp(oid('aa-9'));
    const create = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    const certId = create.body.data.id;
    await request(app).patch('/api/certifications/' + certId + '/requirements/cert-1');
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/cert-2');
    expect(res.body.data.status).toBe('SUBMITTED');
  });
  it('[AA-10] CERTIFIED status becomes SUBMITTED after cert-1 and cert-2 met', async () => {
    const app = makeApp(oid('aa-10'));
    const create = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    const certId = create.body.data.id;
    await request(app).patch('/api/certifications/' + certId + '/requirements/cert-1');
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/cert-2');
    expect(res.body.data.status).toBe('SUBMITTED');
  });
  it('[AA-11] CERTIFIED status becomes SUBMITTED after cert-1 and cert-2 met', async () => {
    const app = makeApp(oid('aa-11'));
    const create = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    const certId = create.body.data.id;
    await request(app).patch('/api/certifications/' + certId + '/requirements/cert-1');
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/cert-2');
    expect(res.body.data.status).toBe('SUBMITTED');
  });
  it('[AA-12] CERTIFIED status becomes SUBMITTED after cert-1 and cert-2 met', async () => {
    const app = makeApp(oid('aa-12'));
    const create = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    const certId = create.body.data.id;
    await request(app).patch('/api/certifications/' + certId + '/requirements/cert-1');
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/cert-2');
    expect(res.body.data.status).toBe('SUBMITTED');
  });
  it('[AA-13] CERTIFIED status becomes SUBMITTED after cert-1 and cert-2 met', async () => {
    const app = makeApp(oid('aa-13'));
    const create = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    const certId = create.body.data.id;
    await request(app).patch('/api/certifications/' + certId + '/requirements/cert-1');
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/cert-2');
    expect(res.body.data.status).toBe('SUBMITTED');
  });
  it('[AA-14] CERTIFIED status becomes SUBMITTED after cert-1 and cert-2 met', async () => {
    const app = makeApp(oid('aa-14'));
    const create = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    const certId = create.body.data.id;
    await request(app).patch('/api/certifications/' + certId + '/requirements/cert-1');
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/cert-2');
    expect(res.body.data.status).toBe('SUBMITTED');
  });
  it('[AA-15] CERTIFIED status becomes SUBMITTED after cert-1 and cert-2 met', async () => {
    const app = makeApp(oid('aa-15'));
    const create = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    const certId = create.body.data.id;
    await request(app).patch('/api/certifications/' + certId + '/requirements/cert-1');
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/cert-2');
    expect(res.body.data.status).toBe('SUBMITTED');
  });
  it('[AA-16] CERTIFIED status becomes SUBMITTED after cert-1 and cert-2 met', async () => {
    const app = makeApp(oid('aa-16'));
    const create = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    const certId = create.body.data.id;
    await request(app).patch('/api/certifications/' + certId + '/requirements/cert-1');
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/cert-2');
    expect(res.body.data.status).toBe('SUBMITTED');
  });
  it('[AA-17] CERTIFIED status becomes SUBMITTED after cert-1 and cert-2 met', async () => {
    const app = makeApp(oid('aa-17'));
    const create = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    const certId = create.body.data.id;
    await request(app).patch('/api/certifications/' + certId + '/requirements/cert-1');
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/cert-2');
    expect(res.body.data.status).toBe('SUBMITTED');
  });
  it('[AA-18] CERTIFIED status becomes SUBMITTED after cert-1 and cert-2 met', async () => {
    const app = makeApp(oid('aa-18'));
    const create = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    const certId = create.body.data.id;
    await request(app).patch('/api/certifications/' + certId + '/requirements/cert-1');
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/cert-2');
    expect(res.body.data.status).toBe('SUBMITTED');
  });
  it('[AA-19] CERTIFIED status becomes SUBMITTED after cert-1 and cert-2 met', async () => {
    const app = makeApp(oid('aa-19'));
    const create = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    const certId = create.body.data.id;
    await request(app).patch('/api/certifications/' + certId + '/requirements/cert-1');
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/cert-2');
    expect(res.body.data.status).toBe('SUBMITTED');
  });
  it('[AA-20] CERTIFIED status becomes SUBMITTED after cert-1 and cert-2 met', async () => {
    const app = makeApp(oid('aa-20'));
    const create = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    const certId = create.body.data.id;
    await request(app).patch('/api/certifications/' + certId + '/requirements/cert-1');
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/cert-2');
    expect(res.body.data.status).toBe('SUBMITTED');
  });
  it('[AA-21] CERTIFIED status becomes SUBMITTED after cert-1 and cert-2 met', async () => {
    const app = makeApp(oid('aa-21'));
    const create = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    const certId = create.body.data.id;
    await request(app).patch('/api/certifications/' + certId + '/requirements/cert-1');
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/cert-2');
    expect(res.body.data.status).toBe('SUBMITTED');
  });
  it('[AA-22] CERTIFIED status becomes SUBMITTED after cert-1 and cert-2 met', async () => {
    const app = makeApp(oid('aa-22'));
    const create = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    const certId = create.body.data.id;
    await request(app).patch('/api/certifications/' + certId + '/requirements/cert-1');
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/cert-2');
    expect(res.body.data.status).toBe('SUBMITTED');
  });
  it('[AA-23] CERTIFIED status becomes SUBMITTED after cert-1 and cert-2 met', async () => {
    const app = makeApp(oid('aa-23'));
    const create = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    const certId = create.body.data.id;
    await request(app).patch('/api/certifications/' + certId + '/requirements/cert-1');
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/cert-2');
    expect(res.body.data.status).toBe('SUBMITTED');
  });
  it('[AA-24] CERTIFIED status becomes SUBMITTED after cert-1 and cert-2 met', async () => {
    const app = makeApp(oid('aa-24'));
    const create = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    const certId = create.body.data.id;
    await request(app).patch('/api/certifications/' + certId + '/requirements/cert-1');
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/cert-2');
    expect(res.body.data.status).toBe('SUBMITTED');
  });
  it('[AA-25] CERTIFIED status becomes SUBMITTED after cert-1 and cert-2 met', async () => {
    const app = makeApp(oid('aa-25'));
    const create = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    const certId = create.body.data.id;
    await request(app).patch('/api/certifications/' + certId + '/requirements/cert-1');
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/cert-2');
    expect(res.body.data.status).toBe('SUBMITTED');
  });
  it('[AA-26] CERTIFIED status becomes SUBMITTED after cert-1 and cert-2 met', async () => {
    const app = makeApp(oid('aa-26'));
    const create = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    const certId = create.body.data.id;
    await request(app).patch('/api/certifications/' + certId + '/requirements/cert-1');
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/cert-2');
    expect(res.body.data.status).toBe('SUBMITTED');
  });
  it('[AA-27] CERTIFIED status becomes SUBMITTED after cert-1 and cert-2 met', async () => {
    const app = makeApp(oid('aa-27'));
    const create = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    const certId = create.body.data.id;
    await request(app).patch('/api/certifications/' + certId + '/requirements/cert-1');
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/cert-2');
    expect(res.body.data.status).toBe('SUBMITTED');
  });
  it('[AA-28] CERTIFIED status becomes SUBMITTED after cert-1 and cert-2 met', async () => {
    const app = makeApp(oid('aa-28'));
    const create = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    const certId = create.body.data.id;
    await request(app).patch('/api/certifications/' + certId + '/requirements/cert-1');
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/cert-2');
    expect(res.body.data.status).toBe('SUBMITTED');
  });
  it('[AA-29] CERTIFIED status becomes SUBMITTED after cert-1 and cert-2 met', async () => {
    const app = makeApp(oid('aa-29'));
    const create = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    const certId = create.body.data.id;
    await request(app).patch('/api/certifications/' + certId + '/requirements/cert-1');
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/cert-2');
    expect(res.body.data.status).toBe('SUBMITTED');
  });
});


// ─── Suite BB: Optional req alone does not trigger submit ─────────────────────
describe('CERTIFIED tier — optional cert-3 alone does not trigger submit', () => {
  it('[BB-0] marking only cert-3 keeps status IN_PROGRESS', async () => {
    const app = makeApp(oid('bb-0'));
    const create = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/cert-3');
    expect(res.body.data.status).toBe('IN_PROGRESS');
  });
  it('[BB-1] marking only cert-3 keeps status IN_PROGRESS', async () => {
    const app = makeApp(oid('bb-1'));
    const create = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/cert-3');
    expect(res.body.data.status).toBe('IN_PROGRESS');
  });
  it('[BB-2] marking only cert-3 keeps status IN_PROGRESS', async () => {
    const app = makeApp(oid('bb-2'));
    const create = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/cert-3');
    expect(res.body.data.status).toBe('IN_PROGRESS');
  });
  it('[BB-3] marking only cert-3 keeps status IN_PROGRESS', async () => {
    const app = makeApp(oid('bb-3'));
    const create = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/cert-3');
    expect(res.body.data.status).toBe('IN_PROGRESS');
  });
  it('[BB-4] marking only cert-3 keeps status IN_PROGRESS', async () => {
    const app = makeApp(oid('bb-4'));
    const create = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/cert-3');
    expect(res.body.data.status).toBe('IN_PROGRESS');
  });
  it('[BB-5] marking only cert-3 keeps status IN_PROGRESS', async () => {
    const app = makeApp(oid('bb-5'));
    const create = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/cert-3');
    expect(res.body.data.status).toBe('IN_PROGRESS');
  });
  it('[BB-6] marking only cert-3 keeps status IN_PROGRESS', async () => {
    const app = makeApp(oid('bb-6'));
    const create = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/cert-3');
    expect(res.body.data.status).toBe('IN_PROGRESS');
  });
  it('[BB-7] marking only cert-3 keeps status IN_PROGRESS', async () => {
    const app = makeApp(oid('bb-7'));
    const create = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/cert-3');
    expect(res.body.data.status).toBe('IN_PROGRESS');
  });
  it('[BB-8] marking only cert-3 keeps status IN_PROGRESS', async () => {
    const app = makeApp(oid('bb-8'));
    const create = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/cert-3');
    expect(res.body.data.status).toBe('IN_PROGRESS');
  });
  it('[BB-9] marking only cert-3 keeps status IN_PROGRESS', async () => {
    const app = makeApp(oid('bb-9'));
    const create = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/cert-3');
    expect(res.body.data.status).toBe('IN_PROGRESS');
  });
  it('[BB-10] marking only cert-3 keeps status IN_PROGRESS', async () => {
    const app = makeApp(oid('bb-10'));
    const create = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/cert-3');
    expect(res.body.data.status).toBe('IN_PROGRESS');
  });
  it('[BB-11] marking only cert-3 keeps status IN_PROGRESS', async () => {
    const app = makeApp(oid('bb-11'));
    const create = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/cert-3');
    expect(res.body.data.status).toBe('IN_PROGRESS');
  });
  it('[BB-12] marking only cert-3 keeps status IN_PROGRESS', async () => {
    const app = makeApp(oid('bb-12'));
    const create = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/cert-3');
    expect(res.body.data.status).toBe('IN_PROGRESS');
  });
  it('[BB-13] marking only cert-3 keeps status IN_PROGRESS', async () => {
    const app = makeApp(oid('bb-13'));
    const create = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/cert-3');
    expect(res.body.data.status).toBe('IN_PROGRESS');
  });
  it('[BB-14] marking only cert-3 keeps status IN_PROGRESS', async () => {
    const app = makeApp(oid('bb-14'));
    const create = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/cert-3');
    expect(res.body.data.status).toBe('IN_PROGRESS');
  });
  it('[BB-15] marking only cert-3 keeps status IN_PROGRESS', async () => {
    const app = makeApp(oid('bb-15'));
    const create = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/cert-3');
    expect(res.body.data.status).toBe('IN_PROGRESS');
  });
  it('[BB-16] marking only cert-3 keeps status IN_PROGRESS', async () => {
    const app = makeApp(oid('bb-16'));
    const create = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/cert-3');
    expect(res.body.data.status).toBe('IN_PROGRESS');
  });
  it('[BB-17] marking only cert-3 keeps status IN_PROGRESS', async () => {
    const app = makeApp(oid('bb-17'));
    const create = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/cert-3');
    expect(res.body.data.status).toBe('IN_PROGRESS');
  });
  it('[BB-18] marking only cert-3 keeps status IN_PROGRESS', async () => {
    const app = makeApp(oid('bb-18'));
    const create = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/cert-3');
    expect(res.body.data.status).toBe('IN_PROGRESS');
  });
  it('[BB-19] marking only cert-3 keeps status IN_PROGRESS', async () => {
    const app = makeApp(oid('bb-19'));
    const create = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/cert-3');
    expect(res.body.data.status).toBe('IN_PROGRESS');
  });
});


// ─── Suite CC: updatedAt set after PATCH ──────────────────────────────────────
describe('PATCH — updatedAt is a valid date', () => {
  it('[CC-0] updatedAt valid date after patch', async () => {
    const app = makeApp(oid('cc-0'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(new Date(res.body.data.updatedAt).getTime()).not.toBeNaN();
  });
  it('[CC-1] updatedAt valid date after patch', async () => {
    const app = makeApp(oid('cc-1'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(new Date(res.body.data.updatedAt).getTime()).not.toBeNaN();
  });
  it('[CC-2] updatedAt valid date after patch', async () => {
    const app = makeApp(oid('cc-2'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(new Date(res.body.data.updatedAt).getTime()).not.toBeNaN();
  });
  it('[CC-3] updatedAt valid date after patch', async () => {
    const app = makeApp(oid('cc-3'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(new Date(res.body.data.updatedAt).getTime()).not.toBeNaN();
  });
  it('[CC-4] updatedAt valid date after patch', async () => {
    const app = makeApp(oid('cc-4'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(new Date(res.body.data.updatedAt).getTime()).not.toBeNaN();
  });
  it('[CC-5] updatedAt valid date after patch', async () => {
    const app = makeApp(oid('cc-5'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(new Date(res.body.data.updatedAt).getTime()).not.toBeNaN();
  });
  it('[CC-6] updatedAt valid date after patch', async () => {
    const app = makeApp(oid('cc-6'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(new Date(res.body.data.updatedAt).getTime()).not.toBeNaN();
  });
  it('[CC-7] updatedAt valid date after patch', async () => {
    const app = makeApp(oid('cc-7'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(new Date(res.body.data.updatedAt).getTime()).not.toBeNaN();
  });
  it('[CC-8] updatedAt valid date after patch', async () => {
    const app = makeApp(oid('cc-8'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(new Date(res.body.data.updatedAt).getTime()).not.toBeNaN();
  });
  it('[CC-9] updatedAt valid date after patch', async () => {
    const app = makeApp(oid('cc-9'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(new Date(res.body.data.updatedAt).getTime()).not.toBeNaN();
  });
  it('[CC-10] updatedAt valid date after patch', async () => {
    const app = makeApp(oid('cc-10'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(new Date(res.body.data.updatedAt).getTime()).not.toBeNaN();
  });
  it('[CC-11] updatedAt valid date after patch', async () => {
    const app = makeApp(oid('cc-11'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(new Date(res.body.data.updatedAt).getTime()).not.toBeNaN();
  });
  it('[CC-12] updatedAt valid date after patch', async () => {
    const app = makeApp(oid('cc-12'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(new Date(res.body.data.updatedAt).getTime()).not.toBeNaN();
  });
  it('[CC-13] updatedAt valid date after patch', async () => {
    const app = makeApp(oid('cc-13'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(new Date(res.body.data.updatedAt).getTime()).not.toBeNaN();
  });
  it('[CC-14] updatedAt valid date after patch', async () => {
    const app = makeApp(oid('cc-14'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(new Date(res.body.data.updatedAt).getTime()).not.toBeNaN();
  });
  it('[CC-15] updatedAt valid date after patch', async () => {
    const app = makeApp(oid('cc-15'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(new Date(res.body.data.updatedAt).getTime()).not.toBeNaN();
  });
  it('[CC-16] updatedAt valid date after patch', async () => {
    const app = makeApp(oid('cc-16'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(new Date(res.body.data.updatedAt).getTime()).not.toBeNaN();
  });
  it('[CC-17] updatedAt valid date after patch', async () => {
    const app = makeApp(oid('cc-17'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(new Date(res.body.data.updatedAt).getTime()).not.toBeNaN();
  });
  it('[CC-18] updatedAt valid date after patch', async () => {
    const app = makeApp(oid('cc-18'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(new Date(res.body.data.updatedAt).getTime()).not.toBeNaN();
  });
  it('[CC-19] updatedAt valid date after patch', async () => {
    const app = makeApp(oid('cc-19'));
    const create = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const certId = create.body.data.id;
    const res = await request(app).patch('/api/certifications/' + certId + '/requirements/reg-1');
    expect(new Date(res.body.data.updatedAt).getTime()).not.toBeNaN();
  });
});


// ─── Suite DD: Error response shape ───────────────────────────────────────────
describe('Error response shape for PATCH errors', () => {
  it('[DD-0] 404 has success:false', async () => {
    const app = makeApp(oid('dd-0')); const res = await request(app).patch('/api/certifications/bad/requirements/reg-1'); expect(res.body.success).toBe(false);
  });
  it('[DD-1] 404 has error object', async () => {
    const app = makeApp(oid('dd-1')); const res = await request(app).patch('/api/certifications/bad/requirements/reg-1'); expect(res.body).toHaveProperty('error');
  });
  it('[DD-2] 404 error code is NOT_FOUND', async () => {
    const app = makeApp(oid('dd-2')); const res = await request(app).patch('/api/certifications/bad/requirements/reg-1'); expect(res.body.error.code).toBe('NOT_FOUND');
  });
  it('[DD-3] 403 has success:false', async () => {
    const appA = makeApp(oid('dd-3a')); const appB = makeApp(oid('dd-3b')); const c = await request(appA).post('/api/certifications').send({ tier: 'REGISTERED' }); const res = await request(appB).patch('/api/certifications/' + c.body.data.id + '/requirements/reg-1'); expect(res.body.success).toBe(false);
  });
  it('[DD-4] 403 error code is FORBIDDEN', async () => {
    const appA = makeApp(oid('dd-4a')); const appB = makeApp(oid('dd-4b')); const c = await request(appA).post('/api/certifications').send({ tier: 'REGISTERED' }); const res = await request(appB).patch('/api/certifications/' + c.body.data.id + '/requirements/reg-1'); expect(res.body.error.code).toBe('FORBIDDEN');
  });
  it('[DD-5] unknown reqId 404 NOT_FOUND', async () => {
    const app = makeApp(oid('dd-5')); const c = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' }); const res = await request(app).patch('/api/certifications/' + c.body.data.id + '/requirements/does-not-exist'); expect(res.body.error.code).toBe('NOT_FOUND');
  });
  it('[DD-6] POST invalid tier 400 has error', async () => {
    const app = makeApp(oid('dd-6')); const res = await request(app).post('/api/certifications').send({ tier: 'FAKE' }); expect(res.body).toHaveProperty('error');
  });
  it('[DD-7] GET /requirements invalid tier 400 has error', async () => {
    const app = makeApp(oid('dd-7')); const res = await request(app).get('/api/certifications/requirements?tier=FAKE'); expect(res.body).toHaveProperty('error');
  });
  it('[DD-8] POST 400 VALIDATION_ERROR', async () => {
    const app = makeApp(oid('dd-8')); const res = await request(app).post('/api/certifications').send({ tier: 'NOPE' }); expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
  it('[DD-9] GET /requirements 400 VALIDATION_ERROR', async () => {
    const app = makeApp(oid('dd-9')); const res = await request(app).get('/api/certifications/requirements?tier=BAD'); expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});


// ─── Suite EE: Multiple certs same org ────────────────────────────────────────
describe('POST multiple certifications for the same org', () => {
  it('[EE-0] org-ee-0 can hold multiple certifications', async () => {
    const app = makeApp(oid('ee-0'));
    const r1 = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const r2 = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    expect(r1.status).toBe(201);
    expect(r2.status).toBe(201);
    const list = await request(app).get('/api/certifications');
    expect(list.body.data.certifications.length).toBeGreaterThanOrEqual(2);
  });
  it('[EE-1] org-ee-1 can hold multiple certifications', async () => {
    const app = makeApp(oid('ee-1'));
    const r1 = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const r2 = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    expect(r1.status).toBe(201);
    expect(r2.status).toBe(201);
    const list = await request(app).get('/api/certifications');
    expect(list.body.data.certifications.length).toBeGreaterThanOrEqual(2);
  });
  it('[EE-2] org-ee-2 can hold multiple certifications', async () => {
    const app = makeApp(oid('ee-2'));
    const r1 = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const r2 = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    expect(r1.status).toBe(201);
    expect(r2.status).toBe(201);
    const list = await request(app).get('/api/certifications');
    expect(list.body.data.certifications.length).toBeGreaterThanOrEqual(2);
  });
  it('[EE-3] org-ee-3 can hold multiple certifications', async () => {
    const app = makeApp(oid('ee-3'));
    const r1 = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const r2 = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    expect(r1.status).toBe(201);
    expect(r2.status).toBe(201);
    const list = await request(app).get('/api/certifications');
    expect(list.body.data.certifications.length).toBeGreaterThanOrEqual(2);
  });
  it('[EE-4] org-ee-4 can hold multiple certifications', async () => {
    const app = makeApp(oid('ee-4'));
    const r1 = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const r2 = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    expect(r1.status).toBe(201);
    expect(r2.status).toBe(201);
    const list = await request(app).get('/api/certifications');
    expect(list.body.data.certifications.length).toBeGreaterThanOrEqual(2);
  });
  it('[EE-5] org-ee-5 can hold multiple certifications', async () => {
    const app = makeApp(oid('ee-5'));
    const r1 = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const r2 = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    expect(r1.status).toBe(201);
    expect(r2.status).toBe(201);
    const list = await request(app).get('/api/certifications');
    expect(list.body.data.certifications.length).toBeGreaterThanOrEqual(2);
  });
  it('[EE-6] org-ee-6 can hold multiple certifications', async () => {
    const app = makeApp(oid('ee-6'));
    const r1 = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const r2 = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    expect(r1.status).toBe(201);
    expect(r2.status).toBe(201);
    const list = await request(app).get('/api/certifications');
    expect(list.body.data.certifications.length).toBeGreaterThanOrEqual(2);
  });
  it('[EE-7] org-ee-7 can hold multiple certifications', async () => {
    const app = makeApp(oid('ee-7'));
    const r1 = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const r2 = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    expect(r1.status).toBe(201);
    expect(r2.status).toBe(201);
    const list = await request(app).get('/api/certifications');
    expect(list.body.data.certifications.length).toBeGreaterThanOrEqual(2);
  });
  it('[EE-8] org-ee-8 can hold multiple certifications', async () => {
    const app = makeApp(oid('ee-8'));
    const r1 = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const r2 = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    expect(r1.status).toBe(201);
    expect(r2.status).toBe(201);
    const list = await request(app).get('/api/certifications');
    expect(list.body.data.certifications.length).toBeGreaterThanOrEqual(2);
  });
  it('[EE-9] org-ee-9 can hold multiple certifications', async () => {
    const app = makeApp(oid('ee-9'));
    const r1 = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const r2 = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    expect(r1.status).toBe(201);
    expect(r2.status).toBe(201);
    const list = await request(app).get('/api/certifications');
    expect(list.body.data.certifications.length).toBeGreaterThanOrEqual(2);
  });
  it('[EE-10] org-ee-10 can hold multiple certifications', async () => {
    const app = makeApp(oid('ee-10'));
    const r1 = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const r2 = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    expect(r1.status).toBe(201);
    expect(r2.status).toBe(201);
    const list = await request(app).get('/api/certifications');
    expect(list.body.data.certifications.length).toBeGreaterThanOrEqual(2);
  });
  it('[EE-11] org-ee-11 can hold multiple certifications', async () => {
    const app = makeApp(oid('ee-11'));
    const r1 = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const r2 = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    expect(r1.status).toBe(201);
    expect(r2.status).toBe(201);
    const list = await request(app).get('/api/certifications');
    expect(list.body.data.certifications.length).toBeGreaterThanOrEqual(2);
  });
  it('[EE-12] org-ee-12 can hold multiple certifications', async () => {
    const app = makeApp(oid('ee-12'));
    const r1 = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const r2 = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    expect(r1.status).toBe(201);
    expect(r2.status).toBe(201);
    const list = await request(app).get('/api/certifications');
    expect(list.body.data.certifications.length).toBeGreaterThanOrEqual(2);
  });
  it('[EE-13] org-ee-13 can hold multiple certifications', async () => {
    const app = makeApp(oid('ee-13'));
    const r1 = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const r2 = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    expect(r1.status).toBe(201);
    expect(r2.status).toBe(201);
    const list = await request(app).get('/api/certifications');
    expect(list.body.data.certifications.length).toBeGreaterThanOrEqual(2);
  });
  it('[EE-14] org-ee-14 can hold multiple certifications', async () => {
    const app = makeApp(oid('ee-14'));
    const r1 = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const r2 = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    expect(r1.status).toBe(201);
    expect(r2.status).toBe(201);
    const list = await request(app).get('/api/certifications');
    expect(list.body.data.certifications.length).toBeGreaterThanOrEqual(2);
  });
  it('[EE-15] org-ee-15 can hold multiple certifications', async () => {
    const app = makeApp(oid('ee-15'));
    const r1 = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const r2 = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    expect(r1.status).toBe(201);
    expect(r2.status).toBe(201);
    const list = await request(app).get('/api/certifications');
    expect(list.body.data.certifications.length).toBeGreaterThanOrEqual(2);
  });
  it('[EE-16] org-ee-16 can hold multiple certifications', async () => {
    const app = makeApp(oid('ee-16'));
    const r1 = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const r2 = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    expect(r1.status).toBe(201);
    expect(r2.status).toBe(201);
    const list = await request(app).get('/api/certifications');
    expect(list.body.data.certifications.length).toBeGreaterThanOrEqual(2);
  });
  it('[EE-17] org-ee-17 can hold multiple certifications', async () => {
    const app = makeApp(oid('ee-17'));
    const r1 = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const r2 = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    expect(r1.status).toBe(201);
    expect(r2.status).toBe(201);
    const list = await request(app).get('/api/certifications');
    expect(list.body.data.certifications.length).toBeGreaterThanOrEqual(2);
  });
  it('[EE-18] org-ee-18 can hold multiple certifications', async () => {
    const app = makeApp(oid('ee-18'));
    const r1 = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const r2 = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    expect(r1.status).toBe(201);
    expect(r2.status).toBe(201);
    const list = await request(app).get('/api/certifications');
    expect(list.body.data.certifications.length).toBeGreaterThanOrEqual(2);
  });
  it('[EE-19] org-ee-19 can hold multiple certifications', async () => {
    const app = makeApp(oid('ee-19'));
    const r1 = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const r2 = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    expect(r1.status).toBe(201);
    expect(r2.status).toBe(201);
    const list = await request(app).get('/api/certifications');
    expect(list.body.data.certifications.length).toBeGreaterThanOrEqual(2);
  });
  it('[EE-20] org-ee-20 can hold multiple certifications', async () => {
    const app = makeApp(oid('ee-20'));
    const r1 = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const r2 = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    expect(r1.status).toBe(201);
    expect(r2.status).toBe(201);
    const list = await request(app).get('/api/certifications');
    expect(list.body.data.certifications.length).toBeGreaterThanOrEqual(2);
  });
  it('[EE-21] org-ee-21 can hold multiple certifications', async () => {
    const app = makeApp(oid('ee-21'));
    const r1 = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const r2 = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    expect(r1.status).toBe(201);
    expect(r2.status).toBe(201);
    const list = await request(app).get('/api/certifications');
    expect(list.body.data.certifications.length).toBeGreaterThanOrEqual(2);
  });
  it('[EE-22] org-ee-22 can hold multiple certifications', async () => {
    const app = makeApp(oid('ee-22'));
    const r1 = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const r2 = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    expect(r1.status).toBe(201);
    expect(r2.status).toBe(201);
    const list = await request(app).get('/api/certifications');
    expect(list.body.data.certifications.length).toBeGreaterThanOrEqual(2);
  });
  it('[EE-23] org-ee-23 can hold multiple certifications', async () => {
    const app = makeApp(oid('ee-23'));
    const r1 = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const r2 = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    expect(r1.status).toBe(201);
    expect(r2.status).toBe(201);
    const list = await request(app).get('/api/certifications');
    expect(list.body.data.certifications.length).toBeGreaterThanOrEqual(2);
  });
  it('[EE-24] org-ee-24 can hold multiple certifications', async () => {
    const app = makeApp(oid('ee-24'));
    const r1 = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const r2 = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    expect(r1.status).toBe(201);
    expect(r2.status).toBe(201);
    const list = await request(app).get('/api/certifications');
    expect(list.body.data.certifications.length).toBeGreaterThanOrEqual(2);
  });
  it('[EE-25] org-ee-25 can hold multiple certifications', async () => {
    const app = makeApp(oid('ee-25'));
    const r1 = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const r2 = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    expect(r1.status).toBe(201);
    expect(r2.status).toBe(201);
    const list = await request(app).get('/api/certifications');
    expect(list.body.data.certifications.length).toBeGreaterThanOrEqual(2);
  });
  it('[EE-26] org-ee-26 can hold multiple certifications', async () => {
    const app = makeApp(oid('ee-26'));
    const r1 = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const r2 = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    expect(r1.status).toBe(201);
    expect(r2.status).toBe(201);
    const list = await request(app).get('/api/certifications');
    expect(list.body.data.certifications.length).toBeGreaterThanOrEqual(2);
  });
  it('[EE-27] org-ee-27 can hold multiple certifications', async () => {
    const app = makeApp(oid('ee-27'));
    const r1 = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const r2 = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    expect(r1.status).toBe(201);
    expect(r2.status).toBe(201);
    const list = await request(app).get('/api/certifications');
    expect(list.body.data.certifications.length).toBeGreaterThanOrEqual(2);
  });
  it('[EE-28] org-ee-28 can hold multiple certifications', async () => {
    const app = makeApp(oid('ee-28'));
    const r1 = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const r2 = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    expect(r1.status).toBe(201);
    expect(r2.status).toBe(201);
    const list = await request(app).get('/api/certifications');
    expect(list.body.data.certifications.length).toBeGreaterThanOrEqual(2);
  });
  it('[EE-29] org-ee-29 can hold multiple certifications', async () => {
    const app = makeApp(oid('ee-29'));
    const r1 = await request(app).post('/api/certifications').send({ tier: 'REGISTERED' });
    const r2 = await request(app).post('/api/certifications').send({ tier: 'CERTIFIED' });
    expect(r1.status).toBe(201);
    expect(r2.status).toBe(201);
    const list = await request(app).get('/api/certifications');
    expect(list.body.data.certifications.length).toBeGreaterThanOrEqual(2);
  });
});
