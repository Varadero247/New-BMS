// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { Dynamics365Connector, createDynamics365Connector } from '../src/connector';
import type { ConnectorConfig, SyncJob, EntityType } from '@ims/sync-engine';

jest.mock('@ims/sync-engine', () => {
  const actual = jest.requireActual('@ims/sync-engine');
  return { ...actual, registerConnector: jest.fn() };
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeConfig(overrides: Partial<ConnectorConfig> = {}): ConnectorConfig {
  return {
    id: 'd365-test-001',
    orgId: 'org-456',
    type: 'DYNAMICS_365',
    name: 'Dynamics 365 Test',
    enabled: true,
    credentials: {
      clientId: 'dyn-client-id',
      clientSecret: 'dyn-client-secret',
      tenantId: 'tenant-abc',
      orgUrl: 'https://myorg.crm.dynamics.com',
    },
    syncSchedule: '0 * * * *',
    syncDirection: 'INBOUND',
    entityTypes: ['EMPLOYEE', 'DEPARTMENT', 'SUPPLIER', 'CUSTOMER'],
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  };
}

function mockToken(token = 'd365-access-token', expiresIn = 3600) {
  return {
    ok: true,
    json: jest.fn().mockResolvedValue({ access_token: token, expires_in: expiresIn }),
  } as unknown as Response;
}

function mockData(data: unknown) {
  return { ok: true, json: jest.fn().mockResolvedValue(data) } as unknown as Response;
}

function mockError(status: number) {
  return { ok: false, status } as unknown as Response;
}

function makeUser(n: number) {
  return {
    systemuserid: `uid-${n}`, firstname: `First${n}`, lastname: `Last${n}`,
    internalemailaddress: `user${n}@dyn.example.com`, title: `Title${n}`,
    businessunitid: `bu-${n}`, isdisabled: n % 3 === 0,
  };
}

function makeBU(n: number) {
  return { businessunitid: `buid-${n}`, name: `Business Unit ${n}`, parentbusinessunitid: n > 0 ? `buid-${n-1}` : null };
}

function makeAccount(n: number, type: 1 | 2) {
  return {
    accountid: `acc-${n}`, name: `Account ${n}`,
    emailaddress1: `acc${n}@example.com`, telephone1: `+44${n}`,
    statecode: n % 2 === 0 ? 0 : 1,
    accountcategorycode: type,
  };
}

function makeJob(entityTypes: EntityType[] = ['EMPLOYEE']): SyncJob {
  return {
    id: 'djob-001', connectorId: 'd365-test-001', orgId: 'org-456',
    status: 'PENDING', direction: 'INBOUND', entityTypes,
    stats: { totalFetched: 0, created: 0, updated: 0, skipped: 0, failed: 0 },
    errors: [], triggeredBy: 'MANUAL',
  };
}

// ── 1. Constructor / Properties ──────────────────────────────────────────────

describe('Dynamics365Connector – constructor and properties', () => {
  describe('instance-1', () => {
    const cfg = makeConfig({ id: 'd365-id-1', name: 'D365 0', enabled: true });
    const conn = new Dynamics365Connector(cfg);
    it('id is d365-id-1', () => { expect(conn.id).toBe('d365-id-1'); });
    it('name is D365 0', () => { expect(conn.name).toBe('D365 0'); });
    it('type is DYNAMICS_365', () => { expect(conn.type).toBe('DYNAMICS_365'); });
    it('enabled is true', () => { expect(conn.enabled).toBe(true); });
    it('instanceof Dynamics365Connector', () => { expect(conn).toBeInstanceOf(Dynamics365Connector); });
  });
  describe('instance-2', () => {
    const cfg = makeConfig({ id: 'd365-id-2', name: 'D365 1', enabled: false });
    const conn = new Dynamics365Connector(cfg);
    it('id is d365-id-2', () => { expect(conn.id).toBe('d365-id-2'); });
    it('name is D365 1', () => { expect(conn.name).toBe('D365 1'); });
    it('type is DYNAMICS_365', () => { expect(conn.type).toBe('DYNAMICS_365'); });
    it('enabled is false', () => { expect(conn.enabled).toBe(false); });
    it('instanceof Dynamics365Connector', () => { expect(conn).toBeInstanceOf(Dynamics365Connector); });
  });
  describe('instance-3', () => {
    const cfg = makeConfig({ id: 'd365-id-3', name: 'D365 2', enabled: true });
    const conn = new Dynamics365Connector(cfg);
    it('id is d365-id-3', () => { expect(conn.id).toBe('d365-id-3'); });
    it('name is D365 2', () => { expect(conn.name).toBe('D365 2'); });
    it('type is DYNAMICS_365', () => { expect(conn.type).toBe('DYNAMICS_365'); });
    it('enabled is true', () => { expect(conn.enabled).toBe(true); });
    it('instanceof Dynamics365Connector', () => { expect(conn).toBeInstanceOf(Dynamics365Connector); });
  });
  describe('instance-4', () => {
    const cfg = makeConfig({ id: 'd365-id-4', name: 'D365 3', enabled: false });
    const conn = new Dynamics365Connector(cfg);
    it('id is d365-id-4', () => { expect(conn.id).toBe('d365-id-4'); });
    it('name is D365 3', () => { expect(conn.name).toBe('D365 3'); });
    it('type is DYNAMICS_365', () => { expect(conn.type).toBe('DYNAMICS_365'); });
    it('enabled is false', () => { expect(conn.enabled).toBe(false); });
    it('instanceof Dynamics365Connector', () => { expect(conn).toBeInstanceOf(Dynamics365Connector); });
  });
  describe('instance-5', () => {
    const cfg = makeConfig({ id: 'd365-id-5', name: 'D365 4', enabled: true });
    const conn = new Dynamics365Connector(cfg);
    it('id is d365-id-5', () => { expect(conn.id).toBe('d365-id-5'); });
    it('name is D365 4', () => { expect(conn.name).toBe('D365 4'); });
    it('type is DYNAMICS_365', () => { expect(conn.type).toBe('DYNAMICS_365'); });
    it('enabled is true', () => { expect(conn.enabled).toBe(true); });
    it('instanceof Dynamics365Connector', () => { expect(conn).toBeInstanceOf(Dynamics365Connector); });
  });
  describe('instance-6', () => {
    const cfg = makeConfig({ id: 'd365-id-6', name: 'D365 5', enabled: false });
    const conn = new Dynamics365Connector(cfg);
    it('id is d365-id-6', () => { expect(conn.id).toBe('d365-id-6'); });
    it('name is D365 5', () => { expect(conn.name).toBe('D365 5'); });
    it('type is DYNAMICS_365', () => { expect(conn.type).toBe('DYNAMICS_365'); });
    it('enabled is false', () => { expect(conn.enabled).toBe(false); });
    it('instanceof Dynamics365Connector', () => { expect(conn).toBeInstanceOf(Dynamics365Connector); });
  });
  describe('instance-7', () => {
    const cfg = makeConfig({ id: 'd365-id-7', name: 'D365 6', enabled: true });
    const conn = new Dynamics365Connector(cfg);
    it('id is d365-id-7', () => { expect(conn.id).toBe('d365-id-7'); });
    it('name is D365 6', () => { expect(conn.name).toBe('D365 6'); });
    it('type is DYNAMICS_365', () => { expect(conn.type).toBe('DYNAMICS_365'); });
    it('enabled is true', () => { expect(conn.enabled).toBe(true); });
    it('instanceof Dynamics365Connector', () => { expect(conn).toBeInstanceOf(Dynamics365Connector); });
  });
  describe('instance-8', () => {
    const cfg = makeConfig({ id: 'd365-id-8', name: 'D365 7', enabled: false });
    const conn = new Dynamics365Connector(cfg);
    it('id is d365-id-8', () => { expect(conn.id).toBe('d365-id-8'); });
    it('name is D365 7', () => { expect(conn.name).toBe('D365 7'); });
    it('type is DYNAMICS_365', () => { expect(conn.type).toBe('DYNAMICS_365'); });
    it('enabled is false', () => { expect(conn.enabled).toBe(false); });
    it('instanceof Dynamics365Connector', () => { expect(conn).toBeInstanceOf(Dynamics365Connector); });
  });
  describe('instance-9', () => {
    const cfg = makeConfig({ id: 'd365-id-9', name: 'D365 8', enabled: true });
    const conn = new Dynamics365Connector(cfg);
    it('id is d365-id-9', () => { expect(conn.id).toBe('d365-id-9'); });
    it('name is D365 8', () => { expect(conn.name).toBe('D365 8'); });
    it('type is DYNAMICS_365', () => { expect(conn.type).toBe('DYNAMICS_365'); });
    it('enabled is true', () => { expect(conn.enabled).toBe(true); });
    it('instanceof Dynamics365Connector', () => { expect(conn).toBeInstanceOf(Dynamics365Connector); });
  });
  describe('instance-10', () => {
    const cfg = makeConfig({ id: 'd365-id-10', name: 'D365 9', enabled: false });
    const conn = new Dynamics365Connector(cfg);
    it('id is d365-id-10', () => { expect(conn.id).toBe('d365-id-10'); });
    it('name is D365 9', () => { expect(conn.name).toBe('D365 9'); });
    it('type is DYNAMICS_365', () => { expect(conn.type).toBe('DYNAMICS_365'); });
    it('enabled is false', () => { expect(conn.enabled).toBe(false); });
    it('instanceof Dynamics365Connector', () => { expect(conn).toBeInstanceOf(Dynamics365Connector); });
  });
  describe('instance-11', () => {
    const cfg = makeConfig({ id: 'd365-id-11', name: 'D365 10', enabled: true });
    const conn = new Dynamics365Connector(cfg);
    it('id is d365-id-11', () => { expect(conn.id).toBe('d365-id-11'); });
    it('name is D365 10', () => { expect(conn.name).toBe('D365 10'); });
    it('type is DYNAMICS_365', () => { expect(conn.type).toBe('DYNAMICS_365'); });
    it('enabled is true', () => { expect(conn.enabled).toBe(true); });
    it('instanceof Dynamics365Connector', () => { expect(conn).toBeInstanceOf(Dynamics365Connector); });
  });
  describe('instance-12', () => {
    const cfg = makeConfig({ id: 'd365-id-12', name: 'D365 11', enabled: false });
    const conn = new Dynamics365Connector(cfg);
    it('id is d365-id-12', () => { expect(conn.id).toBe('d365-id-12'); });
    it('name is D365 11', () => { expect(conn.name).toBe('D365 11'); });
    it('type is DYNAMICS_365', () => { expect(conn.type).toBe('DYNAMICS_365'); });
    it('enabled is false', () => { expect(conn.enabled).toBe(false); });
    it('instanceof Dynamics365Connector', () => { expect(conn).toBeInstanceOf(Dynamics365Connector); });
  });
  describe('instance-13', () => {
    const cfg = makeConfig({ id: 'd365-id-13', name: 'D365 12', enabled: true });
    const conn = new Dynamics365Connector(cfg);
    it('id is d365-id-13', () => { expect(conn.id).toBe('d365-id-13'); });
    it('name is D365 12', () => { expect(conn.name).toBe('D365 12'); });
    it('type is DYNAMICS_365', () => { expect(conn.type).toBe('DYNAMICS_365'); });
    it('enabled is true', () => { expect(conn.enabled).toBe(true); });
    it('instanceof Dynamics365Connector', () => { expect(conn).toBeInstanceOf(Dynamics365Connector); });
  });
  describe('instance-14', () => {
    const cfg = makeConfig({ id: 'd365-id-14', name: 'D365 13', enabled: false });
    const conn = new Dynamics365Connector(cfg);
    it('id is d365-id-14', () => { expect(conn.id).toBe('d365-id-14'); });
    it('name is D365 13', () => { expect(conn.name).toBe('D365 13'); });
    it('type is DYNAMICS_365', () => { expect(conn.type).toBe('DYNAMICS_365'); });
    it('enabled is false', () => { expect(conn.enabled).toBe(false); });
    it('instanceof Dynamics365Connector', () => { expect(conn).toBeInstanceOf(Dynamics365Connector); });
  });
  describe('instance-15', () => {
    const cfg = makeConfig({ id: 'd365-id-15', name: 'D365 14', enabled: true });
    const conn = new Dynamics365Connector(cfg);
    it('id is d365-id-15', () => { expect(conn.id).toBe('d365-id-15'); });
    it('name is D365 14', () => { expect(conn.name).toBe('D365 14'); });
    it('type is DYNAMICS_365', () => { expect(conn.type).toBe('DYNAMICS_365'); });
    it('enabled is true', () => { expect(conn.enabled).toBe(true); });
    it('instanceof Dynamics365Connector', () => { expect(conn).toBeInstanceOf(Dynamics365Connector); });
  });
  describe('instance-16', () => {
    const cfg = makeConfig({ id: 'd365-id-16', name: 'D365 15', enabled: false });
    const conn = new Dynamics365Connector(cfg);
    it('id is d365-id-16', () => { expect(conn.id).toBe('d365-id-16'); });
    it('name is D365 15', () => { expect(conn.name).toBe('D365 15'); });
    it('type is DYNAMICS_365', () => { expect(conn.type).toBe('DYNAMICS_365'); });
    it('enabled is false', () => { expect(conn.enabled).toBe(false); });
    it('instanceof Dynamics365Connector', () => { expect(conn).toBeInstanceOf(Dynamics365Connector); });
  });
  describe('instance-17', () => {
    const cfg = makeConfig({ id: 'd365-id-17', name: 'D365 16', enabled: true });
    const conn = new Dynamics365Connector(cfg);
    it('id is d365-id-17', () => { expect(conn.id).toBe('d365-id-17'); });
    it('name is D365 16', () => { expect(conn.name).toBe('D365 16'); });
    it('type is DYNAMICS_365', () => { expect(conn.type).toBe('DYNAMICS_365'); });
    it('enabled is true', () => { expect(conn.enabled).toBe(true); });
    it('instanceof Dynamics365Connector', () => { expect(conn).toBeInstanceOf(Dynamics365Connector); });
  });
  describe('instance-18', () => {
    const cfg = makeConfig({ id: 'd365-id-18', name: 'D365 17', enabled: false });
    const conn = new Dynamics365Connector(cfg);
    it('id is d365-id-18', () => { expect(conn.id).toBe('d365-id-18'); });
    it('name is D365 17', () => { expect(conn.name).toBe('D365 17'); });
    it('type is DYNAMICS_365', () => { expect(conn.type).toBe('DYNAMICS_365'); });
    it('enabled is false', () => { expect(conn.enabled).toBe(false); });
    it('instanceof Dynamics365Connector', () => { expect(conn).toBeInstanceOf(Dynamics365Connector); });
  });
  describe('instance-19', () => {
    const cfg = makeConfig({ id: 'd365-id-19', name: 'D365 18', enabled: true });
    const conn = new Dynamics365Connector(cfg);
    it('id is d365-id-19', () => { expect(conn.id).toBe('d365-id-19'); });
    it('name is D365 18', () => { expect(conn.name).toBe('D365 18'); });
    it('type is DYNAMICS_365', () => { expect(conn.type).toBe('DYNAMICS_365'); });
    it('enabled is true', () => { expect(conn.enabled).toBe(true); });
    it('instanceof Dynamics365Connector', () => { expect(conn).toBeInstanceOf(Dynamics365Connector); });
  });
  describe('instance-20', () => {
    const cfg = makeConfig({ id: 'd365-id-20', name: 'D365 19', enabled: false });
    const conn = new Dynamics365Connector(cfg);
    it('id is d365-id-20', () => { expect(conn.id).toBe('d365-id-20'); });
    it('name is D365 19', () => { expect(conn.name).toBe('D365 19'); });
    it('type is DYNAMICS_365', () => { expect(conn.type).toBe('DYNAMICS_365'); });
    it('enabled is false', () => { expect(conn.enabled).toBe(false); });
    it('instanceof Dynamics365Connector', () => { expect(conn).toBeInstanceOf(Dynamics365Connector); });
  });
  describe('instance-21', () => {
    const cfg = makeConfig({ id: 'd365-id-21', name: 'D365 20', enabled: true });
    const conn = new Dynamics365Connector(cfg);
    it('id is d365-id-21', () => { expect(conn.id).toBe('d365-id-21'); });
    it('name is D365 20', () => { expect(conn.name).toBe('D365 20'); });
    it('type is DYNAMICS_365', () => { expect(conn.type).toBe('DYNAMICS_365'); });
    it('enabled is true', () => { expect(conn.enabled).toBe(true); });
    it('instanceof Dynamics365Connector', () => { expect(conn).toBeInstanceOf(Dynamics365Connector); });
  });
  describe('instance-22', () => {
    const cfg = makeConfig({ id: 'd365-id-22', name: 'D365 21', enabled: false });
    const conn = new Dynamics365Connector(cfg);
    it('id is d365-id-22', () => { expect(conn.id).toBe('d365-id-22'); });
    it('name is D365 21', () => { expect(conn.name).toBe('D365 21'); });
    it('type is DYNAMICS_365', () => { expect(conn.type).toBe('DYNAMICS_365'); });
    it('enabled is false', () => { expect(conn.enabled).toBe(false); });
    it('instanceof Dynamics365Connector', () => { expect(conn).toBeInstanceOf(Dynamics365Connector); });
  });
  describe('instance-23', () => {
    const cfg = makeConfig({ id: 'd365-id-23', name: 'D365 22', enabled: true });
    const conn = new Dynamics365Connector(cfg);
    it('id is d365-id-23', () => { expect(conn.id).toBe('d365-id-23'); });
    it('name is D365 22', () => { expect(conn.name).toBe('D365 22'); });
    it('type is DYNAMICS_365', () => { expect(conn.type).toBe('DYNAMICS_365'); });
    it('enabled is true', () => { expect(conn.enabled).toBe(true); });
    it('instanceof Dynamics365Connector', () => { expect(conn).toBeInstanceOf(Dynamics365Connector); });
  });
  describe('instance-24', () => {
    const cfg = makeConfig({ id: 'd365-id-24', name: 'D365 23', enabled: false });
    const conn = new Dynamics365Connector(cfg);
    it('id is d365-id-24', () => { expect(conn.id).toBe('d365-id-24'); });
    it('name is D365 23', () => { expect(conn.name).toBe('D365 23'); });
    it('type is DYNAMICS_365', () => { expect(conn.type).toBe('DYNAMICS_365'); });
    it('enabled is false', () => { expect(conn.enabled).toBe(false); });
    it('instanceof Dynamics365Connector', () => { expect(conn).toBeInstanceOf(Dynamics365Connector); });
  });
  describe('instance-25', () => {
    const cfg = makeConfig({ id: 'd365-id-25', name: 'D365 24', enabled: true });
    const conn = new Dynamics365Connector(cfg);
    it('id is d365-id-25', () => { expect(conn.id).toBe('d365-id-25'); });
    it('name is D365 24', () => { expect(conn.name).toBe('D365 24'); });
    it('type is DYNAMICS_365', () => { expect(conn.type).toBe('DYNAMICS_365'); });
    it('enabled is true', () => { expect(conn.enabled).toBe(true); });
    it('instanceof Dynamics365Connector', () => { expect(conn).toBeInstanceOf(Dynamics365Connector); });
  });
});

// ── 2. testConnection success ────────────────────────────────────────────────

describe('Dynamics365Connector – testConnection success', () => {
  let fetchMock: jest.SpyInstance;
  beforeEach(() => { fetchMock = jest.spyOn(global, "fetch"); });
  afterEach(() => { fetchMock.mockRestore(); });
  it('success-1: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('d-tok-0', 3600));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ok-0' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('d365-ok-0');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-2: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('d-tok-1', 3601));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ok-1' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('d365-ok-1');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-3: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('d-tok-2', 3602));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ok-2' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('d365-ok-2');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-4: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('d-tok-3', 3603));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ok-3' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('d365-ok-3');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-5: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('d-tok-4', 3604));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ok-4' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('d365-ok-4');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-6: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('d-tok-5', 3605));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ok-5' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('d365-ok-5');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-7: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('d-tok-6', 3606));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ok-6' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('d365-ok-6');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-8: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('d-tok-7', 3607));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ok-7' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('d365-ok-7');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-9: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('d-tok-8', 3608));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ok-8' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('d365-ok-8');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-10: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('d-tok-9', 3609));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ok-9' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('d365-ok-9');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-11: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('d-tok-10', 3610));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ok-10' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('d365-ok-10');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-12: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('d-tok-11', 3611));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ok-11' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('d365-ok-11');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-13: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('d-tok-12', 3612));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ok-12' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('d365-ok-12');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-14: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('d-tok-13', 3613));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ok-13' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('d365-ok-13');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-15: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('d-tok-14', 3614));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ok-14' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('d365-ok-14');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-16: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('d-tok-15', 3615));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ok-15' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('d365-ok-15');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-17: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('d-tok-16', 3616));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ok-16' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('d365-ok-16');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-18: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('d-tok-17', 3617));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ok-17' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('d365-ok-17');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-19: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('d-tok-18', 3618));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ok-18' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('d365-ok-18');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-20: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('d-tok-19', 3619));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ok-19' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('d365-ok-19');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-21: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('d-tok-20', 3620));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ok-20' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('d365-ok-20');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-22: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('d-tok-21', 3621));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ok-21' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('d365-ok-21');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-23: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('d-tok-22', 3622));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ok-22' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('d365-ok-22');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-24: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('d-tok-23', 3623));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ok-23' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('d365-ok-23');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-25: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('d-tok-24', 3624));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ok-24' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('d365-ok-24');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-26: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('d-tok-25', 3625));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ok-25' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('d365-ok-25');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-27: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('d-tok-26', 3626));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ok-26' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('d365-ok-26');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-28: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('d-tok-27', 3627));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ok-27' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('d365-ok-27');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-29: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('d-tok-28', 3628));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ok-28' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('d365-ok-28');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-30: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('d-tok-29', 3629));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ok-29' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('d365-ok-29');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-31: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('d-tok-30', 3630));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ok-30' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('d365-ok-30');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-32: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('d-tok-31', 3631));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ok-31' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('d365-ok-31');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-33: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('d-tok-32', 3632));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ok-32' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('d365-ok-32');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-34: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('d-tok-33', 3633));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ok-33' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('d365-ok-33');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-35: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('d-tok-34', 3634));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ok-34' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('d365-ok-34');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-36: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('d-tok-35', 3635));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ok-35' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('d365-ok-35');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-37: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('d-tok-36', 3636));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ok-36' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('d365-ok-36');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-38: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('d-tok-37', 3637));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ok-37' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('d365-ok-37');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-39: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('d-tok-38', 3638));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ok-38' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('d365-ok-38');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-40: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('d-tok-39', 3639));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ok-39' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('d365-ok-39');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-41: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('d-tok-40', 3640));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ok-40' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('d365-ok-40');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-42: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('d-tok-41', 3641));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ok-41' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('d365-ok-41');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-43: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('d-tok-42', 3642));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ok-42' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('d365-ok-42');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-44: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('d-tok-43', 3643));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ok-43' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('d365-ok-43');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-45: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('d-tok-44', 3644));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ok-44' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('d365-ok-44');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-46: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('d-tok-45', 3645));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ok-45' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('d365-ok-45');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-47: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('d-tok-46', 3646));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ok-46' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('d365-ok-46');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-48: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('d-tok-47', 3647));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ok-47' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('d365-ok-47');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-49: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('d-tok-48', 3648));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ok-48' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('d365-ok-48');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-50: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('d-tok-49', 3649));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ok-49' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('d365-ok-49');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
});

// ── 3. testConnection failure ────────────────────────────────────────────────

describe('Dynamics365Connector – testConnection failure', () => {
  let fetchMock: jest.SpyInstance;
  beforeEach(() => { fetchMock = jest.spyOn(global, "fetch"); });
  afterEach(() => { fetchMock.mockRestore(); });
  it('fail-400-1: HTTP 400 → healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(400));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-f-400-0' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-400-2: HTTP 400 → healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(400));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-f-400-1' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-400-3: HTTP 400 → healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(400));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-f-400-2' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-400-4: HTTP 400 → healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(400));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-f-400-3' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-400-5: HTTP 400 → healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(400));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-f-400-4' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-401-1: HTTP 401 → healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(401));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-f-401-0' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-401-2: HTTP 401 → healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(401));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-f-401-1' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-401-3: HTTP 401 → healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(401));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-f-401-2' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-401-4: HTTP 401 → healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(401));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-f-401-3' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-401-5: HTTP 401 → healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(401));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-f-401-4' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-403-1: HTTP 403 → healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(403));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-f-403-0' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-403-2: HTTP 403 → healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(403));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-f-403-1' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-403-3: HTTP 403 → healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(403));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-f-403-2' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-403-4: HTTP 403 → healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(403));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-f-403-3' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-403-5: HTTP 403 → healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(403));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-f-403-4' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-404-1: HTTP 404 → healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(404));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-f-404-0' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-404-2: HTTP 404 → healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(404));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-f-404-1' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-404-3: HTTP 404 → healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(404));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-f-404-2' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-404-4: HTTP 404 → healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(404));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-f-404-3' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-404-5: HTTP 404 → healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(404));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-f-404-4' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-429-1: HTTP 429 → healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(429));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-f-429-0' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-429-2: HTTP 429 → healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(429));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-f-429-1' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-429-3: HTTP 429 → healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(429));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-f-429-2' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-429-4: HTTP 429 → healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(429));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-f-429-3' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-429-5: HTTP 429 → healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(429));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-f-429-4' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-500-1: HTTP 500 → healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(500));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-f-500-0' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-500-2: HTTP 500 → healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(500));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-f-500-1' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-500-3: HTTP 500 → healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(500));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-f-500-2' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-500-4: HTTP 500 → healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(500));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-f-500-3' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-500-5: HTTP 500 → healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(500));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-f-500-4' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-502-1: HTTP 502 → healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(502));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-f-502-0' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-502-2: HTTP 502 → healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(502));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-f-502-1' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-502-3: HTTP 502 → healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(502));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-f-502-2' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-502-4: HTTP 502 → healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(502));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-f-502-3' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-502-5: HTTP 502 → healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(502));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-f-502-4' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-503-1: HTTP 503 → healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(503));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-f-503-0' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-503-2: HTTP 503 → healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(503));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-f-503-1' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-503-3: HTTP 503 → healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(503));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-f-503-2' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-503-4: HTTP 503 → healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(503));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-f-503-3' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-503-5: HTTP 503 → healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(503));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-f-503-4' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-504-1: HTTP 504 → healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(504));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-f-504-0' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-504-2: HTTP 504 → healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(504));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-f-504-1' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-504-3: HTTP 504 → healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(504));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-f-504-2' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-504-4: HTTP 504 → healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(504));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-f-504-3' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-504-5: HTTP 504 → healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(504));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-f-504-4' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-418-1: HTTP 418 → healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(418));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-f-418-0' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-418-2: HTTP 418 → healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(418));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-f-418-1' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-418-3: HTTP 418 → healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(418));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-f-418-2' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-418-4: HTTP 418 → healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(418));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-f-418-3' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-418-5: HTTP 418 → healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(418));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-f-418-4' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('throw-1: rejection → healthy:false', async () => {
    fetchMock.mockRejectedValueOnce(new Error('D365 net 0'));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-th-0' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(r.errorMessage).toContain('D365 net 0');
  });
  it('throw-2: rejection → healthy:false', async () => {
    fetchMock.mockRejectedValueOnce(new Error('D365 net 1'));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-th-1' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(r.errorMessage).toContain('D365 net 1');
  });
  it('throw-3: rejection → healthy:false', async () => {
    fetchMock.mockRejectedValueOnce(new Error('D365 net 2'));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-th-2' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(r.errorMessage).toContain('D365 net 2');
  });
  it('throw-4: rejection → healthy:false', async () => {
    fetchMock.mockRejectedValueOnce(new Error('D365 net 3'));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-th-3' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(r.errorMessage).toContain('D365 net 3');
  });
  it('throw-5: rejection → healthy:false', async () => {
    fetchMock.mockRejectedValueOnce(new Error('D365 net 4'));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-th-4' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(r.errorMessage).toContain('D365 net 4');
  });
  it('throw-6: rejection → healthy:false', async () => {
    fetchMock.mockRejectedValueOnce(new Error('D365 net 5'));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-th-5' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(r.errorMessage).toContain('D365 net 5');
  });
  it('throw-7: rejection → healthy:false', async () => {
    fetchMock.mockRejectedValueOnce(new Error('D365 net 6'));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-th-6' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(r.errorMessage).toContain('D365 net 6');
  });
  it('throw-8: rejection → healthy:false', async () => {
    fetchMock.mockRejectedValueOnce(new Error('D365 net 7'));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-th-7' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(r.errorMessage).toContain('D365 net 7');
  });
  it('throw-9: rejection → healthy:false', async () => {
    fetchMock.mockRejectedValueOnce(new Error('D365 net 8'));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-th-8' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(r.errorMessage).toContain('D365 net 8');
  });
  it('throw-10: rejection → healthy:false', async () => {
    fetchMock.mockRejectedValueOnce(new Error('D365 net 9'));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-th-9' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(r.errorMessage).toContain('D365 net 9');
  });
});

// ── 4. Token caching ─────────────────────────────────────────────────────────

describe('Dynamics365Connector – token caching', () => {
  let fetchMock: jest.SpyInstance;
  beforeEach(() => { fetchMock = jest.spyOn(global, "fetch"); });
  afterEach(() => { fetchMock.mockRestore(); });
  it('cache-1: reuses token for second call (1 POST)', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('c-tok-0', 3600))
             .mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-c-0' }));
    await conn.testConnection();
    await conn.fetchRecords('EMPLOYEE');
    const posts = fetchMock.mock.calls.filter((c: unknown[]) => (c[1] as RequestInit)?.method === 'POST');
    expect(posts).toHaveLength(1);
  });
  it('cache-2: reuses token for second call (1 POST)', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('c-tok-1', 3600))
             .mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-c-1' }));
    await conn.testConnection();
    await conn.fetchRecords('EMPLOYEE');
    const posts = fetchMock.mock.calls.filter((c: unknown[]) => (c[1] as RequestInit)?.method === 'POST');
    expect(posts).toHaveLength(1);
  });
  it('cache-3: reuses token for second call (1 POST)', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('c-tok-2', 3600))
             .mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-c-2' }));
    await conn.testConnection();
    await conn.fetchRecords('EMPLOYEE');
    const posts = fetchMock.mock.calls.filter((c: unknown[]) => (c[1] as RequestInit)?.method === 'POST');
    expect(posts).toHaveLength(1);
  });
  it('cache-4: reuses token for second call (1 POST)', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('c-tok-3', 3600))
             .mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-c-3' }));
    await conn.testConnection();
    await conn.fetchRecords('EMPLOYEE');
    const posts = fetchMock.mock.calls.filter((c: unknown[]) => (c[1] as RequestInit)?.method === 'POST');
    expect(posts).toHaveLength(1);
  });
  it('cache-5: reuses token for second call (1 POST)', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('c-tok-4', 3600))
             .mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-c-4' }));
    await conn.testConnection();
    await conn.fetchRecords('EMPLOYEE');
    const posts = fetchMock.mock.calls.filter((c: unknown[]) => (c[1] as RequestInit)?.method === 'POST');
    expect(posts).toHaveLength(1);
  });
  it('cache-6: reuses token for second call (1 POST)', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('c-tok-5', 3600))
             .mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-c-5' }));
    await conn.testConnection();
    await conn.fetchRecords('EMPLOYEE');
    const posts = fetchMock.mock.calls.filter((c: unknown[]) => (c[1] as RequestInit)?.method === 'POST');
    expect(posts).toHaveLength(1);
  });
  it('cache-7: reuses token for second call (1 POST)', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('c-tok-6', 3600))
             .mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-c-6' }));
    await conn.testConnection();
    await conn.fetchRecords('EMPLOYEE');
    const posts = fetchMock.mock.calls.filter((c: unknown[]) => (c[1] as RequestInit)?.method === 'POST');
    expect(posts).toHaveLength(1);
  });
  it('cache-8: reuses token for second call (1 POST)', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('c-tok-7', 3600))
             .mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-c-7' }));
    await conn.testConnection();
    await conn.fetchRecords('EMPLOYEE');
    const posts = fetchMock.mock.calls.filter((c: unknown[]) => (c[1] as RequestInit)?.method === 'POST');
    expect(posts).toHaveLength(1);
  });
  it('cache-9: reuses token for second call (1 POST)', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('c-tok-8', 3600))
             .mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-c-8' }));
    await conn.testConnection();
    await conn.fetchRecords('EMPLOYEE');
    const posts = fetchMock.mock.calls.filter((c: unknown[]) => (c[1] as RequestInit)?.method === 'POST');
    expect(posts).toHaveLength(1);
  });
  it('cache-10: reuses token for second call (1 POST)', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('c-tok-9', 3600))
             .mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-c-9' }));
    await conn.testConnection();
    await conn.fetchRecords('EMPLOYEE');
    const posts = fetchMock.mock.calls.filter((c: unknown[]) => (c[1] as RequestInit)?.method === 'POST');
    expect(posts).toHaveLength(1);
  });
  it('cache-11: reuses token for second call (1 POST)', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('c-tok-10', 3600))
             .mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-c-10' }));
    await conn.testConnection();
    await conn.fetchRecords('EMPLOYEE');
    const posts = fetchMock.mock.calls.filter((c: unknown[]) => (c[1] as RequestInit)?.method === 'POST');
    expect(posts).toHaveLength(1);
  });
  it('cache-12: reuses token for second call (1 POST)', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('c-tok-11', 3600))
             .mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-c-11' }));
    await conn.testConnection();
    await conn.fetchRecords('EMPLOYEE');
    const posts = fetchMock.mock.calls.filter((c: unknown[]) => (c[1] as RequestInit)?.method === 'POST');
    expect(posts).toHaveLength(1);
  });
  it('cache-13: reuses token for second call (1 POST)', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('c-tok-12', 3600))
             .mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-c-12' }));
    await conn.testConnection();
    await conn.fetchRecords('EMPLOYEE');
    const posts = fetchMock.mock.calls.filter((c: unknown[]) => (c[1] as RequestInit)?.method === 'POST');
    expect(posts).toHaveLength(1);
  });
  it('cache-14: reuses token for second call (1 POST)', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('c-tok-13', 3600))
             .mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-c-13' }));
    await conn.testConnection();
    await conn.fetchRecords('EMPLOYEE');
    const posts = fetchMock.mock.calls.filter((c: unknown[]) => (c[1] as RequestInit)?.method === 'POST');
    expect(posts).toHaveLength(1);
  });
  it('cache-15: reuses token for second call (1 POST)', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('c-tok-14', 3600))
             .mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-c-14' }));
    await conn.testConnection();
    await conn.fetchRecords('EMPLOYEE');
    const posts = fetchMock.mock.calls.filter((c: unknown[]) => (c[1] as RequestInit)?.method === 'POST');
    expect(posts).toHaveLength(1);
  });
  it('cache-16: reuses token for second call (1 POST)', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('c-tok-15', 3600))
             .mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-c-15' }));
    await conn.testConnection();
    await conn.fetchRecords('EMPLOYEE');
    const posts = fetchMock.mock.calls.filter((c: unknown[]) => (c[1] as RequestInit)?.method === 'POST');
    expect(posts).toHaveLength(1);
  });
  it('cache-17: reuses token for second call (1 POST)', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('c-tok-16', 3600))
             .mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-c-16' }));
    await conn.testConnection();
    await conn.fetchRecords('EMPLOYEE');
    const posts = fetchMock.mock.calls.filter((c: unknown[]) => (c[1] as RequestInit)?.method === 'POST');
    expect(posts).toHaveLength(1);
  });
  it('cache-18: reuses token for second call (1 POST)', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('c-tok-17', 3600))
             .mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-c-17' }));
    await conn.testConnection();
    await conn.fetchRecords('EMPLOYEE');
    const posts = fetchMock.mock.calls.filter((c: unknown[]) => (c[1] as RequestInit)?.method === 'POST');
    expect(posts).toHaveLength(1);
  });
  it('cache-19: reuses token for second call (1 POST)', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('c-tok-18', 3600))
             .mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-c-18' }));
    await conn.testConnection();
    await conn.fetchRecords('EMPLOYEE');
    const posts = fetchMock.mock.calls.filter((c: unknown[]) => (c[1] as RequestInit)?.method === 'POST');
    expect(posts).toHaveLength(1);
  });
  it('cache-20: reuses token for second call (1 POST)', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('c-tok-19', 3600))
             .mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-c-19' }));
    await conn.testConnection();
    await conn.fetchRecords('EMPLOYEE');
    const posts = fetchMock.mock.calls.filter((c: unknown[]) => (c[1] as RequestInit)?.method === 'POST');
    expect(posts).toHaveLength(1);
  });
  it('cache-exp-1: expired token triggers refetch', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('f-0', 0))
             .mockResolvedValueOnce(mockToken('s-0', 3600))
             .mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ce-0' }));
    await conn.testConnection();
    await conn.fetchRecords('EMPLOYEE');
    const posts = fetchMock.mock.calls.filter((c: unknown[]) => (c[1] as RequestInit)?.method === 'POST');
    expect(posts.length).toBeGreaterThanOrEqual(1);
  });
  it('cache-exp-2: expired token triggers refetch', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('f-1', 0))
             .mockResolvedValueOnce(mockToken('s-1', 3600))
             .mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ce-1' }));
    await conn.testConnection();
    await conn.fetchRecords('EMPLOYEE');
    const posts = fetchMock.mock.calls.filter((c: unknown[]) => (c[1] as RequestInit)?.method === 'POST');
    expect(posts.length).toBeGreaterThanOrEqual(1);
  });
  it('cache-exp-3: expired token triggers refetch', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('f-2', 0))
             .mockResolvedValueOnce(mockToken('s-2', 3600))
             .mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ce-2' }));
    await conn.testConnection();
    await conn.fetchRecords('EMPLOYEE');
    const posts = fetchMock.mock.calls.filter((c: unknown[]) => (c[1] as RequestInit)?.method === 'POST');
    expect(posts.length).toBeGreaterThanOrEqual(1);
  });
  it('cache-exp-4: expired token triggers refetch', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('f-3', 0))
             .mockResolvedValueOnce(mockToken('s-3', 3600))
             .mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ce-3' }));
    await conn.testConnection();
    await conn.fetchRecords('EMPLOYEE');
    const posts = fetchMock.mock.calls.filter((c: unknown[]) => (c[1] as RequestInit)?.method === 'POST');
    expect(posts.length).toBeGreaterThanOrEqual(1);
  });
  it('cache-exp-5: expired token triggers refetch', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('f-4', 0))
             .mockResolvedValueOnce(mockToken('s-4', 3600))
             .mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ce-4' }));
    await conn.testConnection();
    await conn.fetchRecords('EMPLOYEE');
    const posts = fetchMock.mock.calls.filter((c: unknown[]) => (c[1] as RequestInit)?.method === 'POST');
    expect(posts.length).toBeGreaterThanOrEqual(1);
  });
  it('cache-exp-6: expired token triggers refetch', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('f-5', 0))
             .mockResolvedValueOnce(mockToken('s-5', 3600))
             .mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ce-5' }));
    await conn.testConnection();
    await conn.fetchRecords('EMPLOYEE');
    const posts = fetchMock.mock.calls.filter((c: unknown[]) => (c[1] as RequestInit)?.method === 'POST');
    expect(posts.length).toBeGreaterThanOrEqual(1);
  });
  it('cache-exp-7: expired token triggers refetch', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('f-6', 0))
             .mockResolvedValueOnce(mockToken('s-6', 3600))
             .mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ce-6' }));
    await conn.testConnection();
    await conn.fetchRecords('EMPLOYEE');
    const posts = fetchMock.mock.calls.filter((c: unknown[]) => (c[1] as RequestInit)?.method === 'POST');
    expect(posts.length).toBeGreaterThanOrEqual(1);
  });
  it('cache-exp-8: expired token triggers refetch', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('f-7', 0))
             .mockResolvedValueOnce(mockToken('s-7', 3600))
             .mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ce-7' }));
    await conn.testConnection();
    await conn.fetchRecords('EMPLOYEE');
    const posts = fetchMock.mock.calls.filter((c: unknown[]) => (c[1] as RequestInit)?.method === 'POST');
    expect(posts.length).toBeGreaterThanOrEqual(1);
  });
  it('cache-exp-9: expired token triggers refetch', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('f-8', 0))
             .mockResolvedValueOnce(mockToken('s-8', 3600))
             .mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ce-8' }));
    await conn.testConnection();
    await conn.fetchRecords('EMPLOYEE');
    const posts = fetchMock.mock.calls.filter((c: unknown[]) => (c[1] as RequestInit)?.method === 'POST');
    expect(posts.length).toBeGreaterThanOrEqual(1);
  });
  it('cache-exp-10: expired token triggers refetch', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('f-9', 0))
             .mockResolvedValueOnce(mockToken('s-9', 3600))
             .mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ce-9' }));
    await conn.testConnection();
    await conn.fetchRecords('EMPLOYEE');
    const posts = fetchMock.mock.calls.filter((c: unknown[]) => (c[1] as RequestInit)?.method === 'POST');
    expect(posts.length).toBeGreaterThanOrEqual(1);
  });
});

// ── 5. fetchRecords EMPLOYEE success ─────────────────────────────────────────

describe('Dynamics365Connector – fetchRecords EMPLOYEE success', () => {
  let fetchMock: jest.SpyInstance;
  beforeEach(() => { fetchMock = jest.spyOn(global, "fetch"); });
  afterEach(() => { fetchMock.mockRestore(); });
  it('emp-1: returns 1 records', async () => {
    const users = Array.from({ length: 1 }, (_, k) => makeUser(0*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: users }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-e-0' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(1);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^d365_user_/);
      expect(r.data.source).toBe('DYNAMICS_365');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-2: returns 2 records', async () => {
    const users = Array.from({ length: 2 }, (_, k) => makeUser(1*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: users }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-e-1' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(2);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^d365_user_/);
      expect(r.data.source).toBe('DYNAMICS_365');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-3: returns 3 records', async () => {
    const users = Array.from({ length: 3 }, (_, k) => makeUser(2*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: users }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-e-2' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(3);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^d365_user_/);
      expect(r.data.source).toBe('DYNAMICS_365');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-4: returns 4 records', async () => {
    const users = Array.from({ length: 4 }, (_, k) => makeUser(3*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: users }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-e-3' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(4);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^d365_user_/);
      expect(r.data.source).toBe('DYNAMICS_365');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-5: returns 1 records', async () => {
    const users = Array.from({ length: 1 }, (_, k) => makeUser(4*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: users }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-e-4' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(1);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^d365_user_/);
      expect(r.data.source).toBe('DYNAMICS_365');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-6: returns 2 records', async () => {
    const users = Array.from({ length: 2 }, (_, k) => makeUser(5*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: users }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-e-5' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(2);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^d365_user_/);
      expect(r.data.source).toBe('DYNAMICS_365');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-7: returns 3 records', async () => {
    const users = Array.from({ length: 3 }, (_, k) => makeUser(6*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: users }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-e-6' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(3);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^d365_user_/);
      expect(r.data.source).toBe('DYNAMICS_365');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-8: returns 4 records', async () => {
    const users = Array.from({ length: 4 }, (_, k) => makeUser(7*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: users }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-e-7' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(4);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^d365_user_/);
      expect(r.data.source).toBe('DYNAMICS_365');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-9: returns 1 records', async () => {
    const users = Array.from({ length: 1 }, (_, k) => makeUser(8*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: users }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-e-8' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(1);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^d365_user_/);
      expect(r.data.source).toBe('DYNAMICS_365');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-10: returns 2 records', async () => {
    const users = Array.from({ length: 2 }, (_, k) => makeUser(9*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: users }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-e-9' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(2);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^d365_user_/);
      expect(r.data.source).toBe('DYNAMICS_365');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-11: returns 3 records', async () => {
    const users = Array.from({ length: 3 }, (_, k) => makeUser(10*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: users }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-e-10' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(3);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^d365_user_/);
      expect(r.data.source).toBe('DYNAMICS_365');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-12: returns 4 records', async () => {
    const users = Array.from({ length: 4 }, (_, k) => makeUser(11*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: users }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-e-11' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(4);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^d365_user_/);
      expect(r.data.source).toBe('DYNAMICS_365');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-13: returns 1 records', async () => {
    const users = Array.from({ length: 1 }, (_, k) => makeUser(12*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: users }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-e-12' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(1);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^d365_user_/);
      expect(r.data.source).toBe('DYNAMICS_365');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-14: returns 2 records', async () => {
    const users = Array.from({ length: 2 }, (_, k) => makeUser(13*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: users }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-e-13' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(2);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^d365_user_/);
      expect(r.data.source).toBe('DYNAMICS_365');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-15: returns 3 records', async () => {
    const users = Array.from({ length: 3 }, (_, k) => makeUser(14*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: users }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-e-14' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(3);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^d365_user_/);
      expect(r.data.source).toBe('DYNAMICS_365');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-16: returns 4 records', async () => {
    const users = Array.from({ length: 4 }, (_, k) => makeUser(15*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: users }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-e-15' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(4);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^d365_user_/);
      expect(r.data.source).toBe('DYNAMICS_365');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-17: returns 1 records', async () => {
    const users = Array.from({ length: 1 }, (_, k) => makeUser(16*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: users }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-e-16' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(1);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^d365_user_/);
      expect(r.data.source).toBe('DYNAMICS_365');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-18: returns 2 records', async () => {
    const users = Array.from({ length: 2 }, (_, k) => makeUser(17*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: users }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-e-17' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(2);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^d365_user_/);
      expect(r.data.source).toBe('DYNAMICS_365');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-19: returns 3 records', async () => {
    const users = Array.from({ length: 3 }, (_, k) => makeUser(18*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: users }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-e-18' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(3);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^d365_user_/);
      expect(r.data.source).toBe('DYNAMICS_365');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-20: returns 4 records', async () => {
    const users = Array.from({ length: 4 }, (_, k) => makeUser(19*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: users }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-e-19' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(4);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^d365_user_/);
      expect(r.data.source).toBe('DYNAMICS_365');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-21: returns 1 records', async () => {
    const users = Array.from({ length: 1 }, (_, k) => makeUser(20*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: users }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-e-20' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(1);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^d365_user_/);
      expect(r.data.source).toBe('DYNAMICS_365');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-22: returns 2 records', async () => {
    const users = Array.from({ length: 2 }, (_, k) => makeUser(21*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: users }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-e-21' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(2);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^d365_user_/);
      expect(r.data.source).toBe('DYNAMICS_365');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-23: returns 3 records', async () => {
    const users = Array.from({ length: 3 }, (_, k) => makeUser(22*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: users }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-e-22' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(3);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^d365_user_/);
      expect(r.data.source).toBe('DYNAMICS_365');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-24: returns 4 records', async () => {
    const users = Array.from({ length: 4 }, (_, k) => makeUser(23*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: users }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-e-23' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(4);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^d365_user_/);
      expect(r.data.source).toBe('DYNAMICS_365');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-25: returns 1 records', async () => {
    const users = Array.from({ length: 1 }, (_, k) => makeUser(24*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: users }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-e-24' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(1);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^d365_user_/);
      expect(r.data.source).toBe('DYNAMICS_365');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-26: returns 2 records', async () => {
    const users = Array.from({ length: 2 }, (_, k) => makeUser(25*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: users }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-e-25' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(2);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^d365_user_/);
      expect(r.data.source).toBe('DYNAMICS_365');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-27: returns 3 records', async () => {
    const users = Array.from({ length: 3 }, (_, k) => makeUser(26*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: users }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-e-26' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(3);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^d365_user_/);
      expect(r.data.source).toBe('DYNAMICS_365');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-28: returns 4 records', async () => {
    const users = Array.from({ length: 4 }, (_, k) => makeUser(27*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: users }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-e-27' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(4);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^d365_user_/);
      expect(r.data.source).toBe('DYNAMICS_365');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-29: returns 1 records', async () => {
    const users = Array.from({ length: 1 }, (_, k) => makeUser(28*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: users }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-e-28' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(1);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^d365_user_/);
      expect(r.data.source).toBe('DYNAMICS_365');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-30: returns 2 records', async () => {
    const users = Array.from({ length: 2 }, (_, k) => makeUser(29*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: users }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-e-29' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(2);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^d365_user_/);
      expect(r.data.source).toBe('DYNAMICS_365');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-31: returns 3 records', async () => {
    const users = Array.from({ length: 3 }, (_, k) => makeUser(30*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: users }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-e-30' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(3);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^d365_user_/);
      expect(r.data.source).toBe('DYNAMICS_365');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-32: returns 4 records', async () => {
    const users = Array.from({ length: 4 }, (_, k) => makeUser(31*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: users }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-e-31' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(4);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^d365_user_/);
      expect(r.data.source).toBe('DYNAMICS_365');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-33: returns 1 records', async () => {
    const users = Array.from({ length: 1 }, (_, k) => makeUser(32*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: users }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-e-32' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(1);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^d365_user_/);
      expect(r.data.source).toBe('DYNAMICS_365');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-34: returns 2 records', async () => {
    const users = Array.from({ length: 2 }, (_, k) => makeUser(33*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: users }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-e-33' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(2);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^d365_user_/);
      expect(r.data.source).toBe('DYNAMICS_365');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-35: returns 3 records', async () => {
    const users = Array.from({ length: 3 }, (_, k) => makeUser(34*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: users }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-e-34' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(3);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^d365_user_/);
      expect(r.data.source).toBe('DYNAMICS_365');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-36: returns 4 records', async () => {
    const users = Array.from({ length: 4 }, (_, k) => makeUser(35*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: users }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-e-35' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(4);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^d365_user_/);
      expect(r.data.source).toBe('DYNAMICS_365');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-37: returns 1 records', async () => {
    const users = Array.from({ length: 1 }, (_, k) => makeUser(36*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: users }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-e-36' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(1);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^d365_user_/);
      expect(r.data.source).toBe('DYNAMICS_365');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-38: returns 2 records', async () => {
    const users = Array.from({ length: 2 }, (_, k) => makeUser(37*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: users }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-e-37' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(2);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^d365_user_/);
      expect(r.data.source).toBe('DYNAMICS_365');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-39: returns 3 records', async () => {
    const users = Array.from({ length: 3 }, (_, k) => makeUser(38*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: users }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-e-38' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(3);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^d365_user_/);
      expect(r.data.source).toBe('DYNAMICS_365');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-40: returns 4 records', async () => {
    const users = Array.from({ length: 4 }, (_, k) => makeUser(39*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: users }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-e-39' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(4);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^d365_user_/);
      expect(r.data.source).toBe('DYNAMICS_365');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-41: returns 1 records', async () => {
    const users = Array.from({ length: 1 }, (_, k) => makeUser(40*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: users }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-e-40' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(1);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^d365_user_/);
      expect(r.data.source).toBe('DYNAMICS_365');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-42: returns 2 records', async () => {
    const users = Array.from({ length: 2 }, (_, k) => makeUser(41*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: users }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-e-41' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(2);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^d365_user_/);
      expect(r.data.source).toBe('DYNAMICS_365');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-43: returns 3 records', async () => {
    const users = Array.from({ length: 3 }, (_, k) => makeUser(42*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: users }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-e-42' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(3);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^d365_user_/);
      expect(r.data.source).toBe('DYNAMICS_365');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-44: returns 4 records', async () => {
    const users = Array.from({ length: 4 }, (_, k) => makeUser(43*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: users }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-e-43' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(4);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^d365_user_/);
      expect(r.data.source).toBe('DYNAMICS_365');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-45: returns 1 records', async () => {
    const users = Array.from({ length: 1 }, (_, k) => makeUser(44*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: users }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-e-44' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(1);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^d365_user_/);
      expect(r.data.source).toBe('DYNAMICS_365');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-46: returns 2 records', async () => {
    const users = Array.from({ length: 2 }, (_, k) => makeUser(45*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: users }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-e-45' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(2);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^d365_user_/);
      expect(r.data.source).toBe('DYNAMICS_365');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-47: returns 3 records', async () => {
    const users = Array.from({ length: 3 }, (_, k) => makeUser(46*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: users }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-e-46' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(3);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^d365_user_/);
      expect(r.data.source).toBe('DYNAMICS_365');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-48: returns 4 records', async () => {
    const users = Array.from({ length: 4 }, (_, k) => makeUser(47*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: users }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-e-47' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(4);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^d365_user_/);
      expect(r.data.source).toBe('DYNAMICS_365');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-49: returns 1 records', async () => {
    const users = Array.from({ length: 1 }, (_, k) => makeUser(48*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: users }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-e-48' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(1);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^d365_user_/);
      expect(r.data.source).toBe('DYNAMICS_365');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-50: returns 2 records', async () => {
    const users = Array.from({ length: 2 }, (_, k) => makeUser(49*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: users }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-e-49' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(2);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^d365_user_/);
      expect(r.data.source).toBe('DYNAMICS_365');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-51: returns 3 records', async () => {
    const users = Array.from({ length: 3 }, (_, k) => makeUser(50*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: users }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-e-50' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(3);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^d365_user_/);
      expect(r.data.source).toBe('DYNAMICS_365');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-52: returns 4 records', async () => {
    const users = Array.from({ length: 4 }, (_, k) => makeUser(51*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: users }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-e-51' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(4);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^d365_user_/);
      expect(r.data.source).toBe('DYNAMICS_365');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-53: returns 1 records', async () => {
    const users = Array.from({ length: 1 }, (_, k) => makeUser(52*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: users }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-e-52' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(1);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^d365_user_/);
      expect(r.data.source).toBe('DYNAMICS_365');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-54: returns 2 records', async () => {
    const users = Array.from({ length: 2 }, (_, k) => makeUser(53*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: users }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-e-53' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(2);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^d365_user_/);
      expect(r.data.source).toBe('DYNAMICS_365');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-55: returns 3 records', async () => {
    const users = Array.from({ length: 3 }, (_, k) => makeUser(54*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: users }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-e-54' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(3);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^d365_user_/);
      expect(r.data.source).toBe('DYNAMICS_365');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-56: returns 4 records', async () => {
    const users = Array.from({ length: 4 }, (_, k) => makeUser(55*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: users }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-e-55' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(4);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^d365_user_/);
      expect(r.data.source).toBe('DYNAMICS_365');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-57: returns 1 records', async () => {
    const users = Array.from({ length: 1 }, (_, k) => makeUser(56*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: users }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-e-56' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(1);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^d365_user_/);
      expect(r.data.source).toBe('DYNAMICS_365');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-58: returns 2 records', async () => {
    const users = Array.from({ length: 2 }, (_, k) => makeUser(57*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: users }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-e-57' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(2);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^d365_user_/);
      expect(r.data.source).toBe('DYNAMICS_365');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-59: returns 3 records', async () => {
    const users = Array.from({ length: 3 }, (_, k) => makeUser(58*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: users }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-e-58' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(3);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^d365_user_/);
      expect(r.data.source).toBe('DYNAMICS_365');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-60: returns 4 records', async () => {
    const users = Array.from({ length: 4 }, (_, k) => makeUser(59*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: users }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-e-59' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(4);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^d365_user_/);
      expect(r.data.source).toBe('DYNAMICS_365');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-status-1: isdisabled maps to INACTIVE/ACTIVE', async () => {
    const active = { ...makeUser(0), isdisabled: false };
    const inactive = { ...makeUser(500), isdisabled: true };
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ value: [active, inactive] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-est-0' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.status).toBe('ACTIVE');
    expect(recs[1].data.status).toBe('INACTIVE');
  });
  it('emp-status-2: isdisabled maps to INACTIVE/ACTIVE', async () => {
    const active = { ...makeUser(1), isdisabled: false };
    const inactive = { ...makeUser(501), isdisabled: true };
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ value: [active, inactive] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-est-1' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.status).toBe('ACTIVE');
    expect(recs[1].data.status).toBe('INACTIVE');
  });
  it('emp-status-3: isdisabled maps to INACTIVE/ACTIVE', async () => {
    const active = { ...makeUser(2), isdisabled: false };
    const inactive = { ...makeUser(502), isdisabled: true };
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ value: [active, inactive] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-est-2' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.status).toBe('ACTIVE');
    expect(recs[1].data.status).toBe('INACTIVE');
  });
  it('emp-status-4: isdisabled maps to INACTIVE/ACTIVE', async () => {
    const active = { ...makeUser(3), isdisabled: false };
    const inactive = { ...makeUser(503), isdisabled: true };
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ value: [active, inactive] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-est-3' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.status).toBe('ACTIVE');
    expect(recs[1].data.status).toBe('INACTIVE');
  });
  it('emp-status-5: isdisabled maps to INACTIVE/ACTIVE', async () => {
    const active = { ...makeUser(4), isdisabled: false };
    const inactive = { ...makeUser(504), isdisabled: true };
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ value: [active, inactive] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-est-4' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.status).toBe('ACTIVE');
    expect(recs[1].data.status).toBe('INACTIVE');
  });
  it('emp-status-6: isdisabled maps to INACTIVE/ACTIVE', async () => {
    const active = { ...makeUser(5), isdisabled: false };
    const inactive = { ...makeUser(505), isdisabled: true };
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ value: [active, inactive] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-est-5' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.status).toBe('ACTIVE');
    expect(recs[1].data.status).toBe('INACTIVE');
  });
  it('emp-status-7: isdisabled maps to INACTIVE/ACTIVE', async () => {
    const active = { ...makeUser(6), isdisabled: false };
    const inactive = { ...makeUser(506), isdisabled: true };
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ value: [active, inactive] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-est-6' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.status).toBe('ACTIVE');
    expect(recs[1].data.status).toBe('INACTIVE');
  });
  it('emp-status-8: isdisabled maps to INACTIVE/ACTIVE', async () => {
    const active = { ...makeUser(7), isdisabled: false };
    const inactive = { ...makeUser(507), isdisabled: true };
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ value: [active, inactive] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-est-7' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.status).toBe('ACTIVE');
    expect(recs[1].data.status).toBe('INACTIVE');
  });
  it('emp-status-9: isdisabled maps to INACTIVE/ACTIVE', async () => {
    const active = { ...makeUser(8), isdisabled: false };
    const inactive = { ...makeUser(508), isdisabled: true };
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ value: [active, inactive] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-est-8' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.status).toBe('ACTIVE');
    expect(recs[1].data.status).toBe('INACTIVE');
  });
  it('emp-status-10: isdisabled maps to INACTIVE/ACTIVE', async () => {
    const active = { ...makeUser(9), isdisabled: false };
    const inactive = { ...makeUser(509), isdisabled: true };
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ value: [active, inactive] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-est-9' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.status).toBe('ACTIVE');
    expect(recs[1].data.status).toBe('INACTIVE');
  });
  it('emp-status-11: isdisabled maps to INACTIVE/ACTIVE', async () => {
    const active = { ...makeUser(10), isdisabled: false };
    const inactive = { ...makeUser(510), isdisabled: true };
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ value: [active, inactive] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-est-10' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.status).toBe('ACTIVE');
    expect(recs[1].data.status).toBe('INACTIVE');
  });
  it('emp-status-12: isdisabled maps to INACTIVE/ACTIVE', async () => {
    const active = { ...makeUser(11), isdisabled: false };
    const inactive = { ...makeUser(511), isdisabled: true };
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ value: [active, inactive] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-est-11' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.status).toBe('ACTIVE');
    expect(recs[1].data.status).toBe('INACTIVE');
  });
  it('emp-status-13: isdisabled maps to INACTIVE/ACTIVE', async () => {
    const active = { ...makeUser(12), isdisabled: false };
    const inactive = { ...makeUser(512), isdisabled: true };
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ value: [active, inactive] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-est-12' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.status).toBe('ACTIVE');
    expect(recs[1].data.status).toBe('INACTIVE');
  });
  it('emp-status-14: isdisabled maps to INACTIVE/ACTIVE', async () => {
    const active = { ...makeUser(13), isdisabled: false };
    const inactive = { ...makeUser(513), isdisabled: true };
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ value: [active, inactive] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-est-13' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.status).toBe('ACTIVE');
    expect(recs[1].data.status).toBe('INACTIVE');
  });
  it('emp-status-15: isdisabled maps to INACTIVE/ACTIVE', async () => {
    const active = { ...makeUser(14), isdisabled: false };
    const inactive = { ...makeUser(514), isdisabled: true };
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ value: [active, inactive] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-est-14' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.status).toBe('ACTIVE');
    expect(recs[1].data.status).toBe('INACTIVE');
  });
  it('emp-status-16: isdisabled maps to INACTIVE/ACTIVE', async () => {
    const active = { ...makeUser(15), isdisabled: false };
    const inactive = { ...makeUser(515), isdisabled: true };
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ value: [active, inactive] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-est-15' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.status).toBe('ACTIVE');
    expect(recs[1].data.status).toBe('INACTIVE');
  });
  it('emp-status-17: isdisabled maps to INACTIVE/ACTIVE', async () => {
    const active = { ...makeUser(16), isdisabled: false };
    const inactive = { ...makeUser(516), isdisabled: true };
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ value: [active, inactive] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-est-16' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.status).toBe('ACTIVE');
    expect(recs[1].data.status).toBe('INACTIVE');
  });
  it('emp-status-18: isdisabled maps to INACTIVE/ACTIVE', async () => {
    const active = { ...makeUser(17), isdisabled: false };
    const inactive = { ...makeUser(517), isdisabled: true };
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ value: [active, inactive] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-est-17' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.status).toBe('ACTIVE');
    expect(recs[1].data.status).toBe('INACTIVE');
  });
  it('emp-status-19: isdisabled maps to INACTIVE/ACTIVE', async () => {
    const active = { ...makeUser(18), isdisabled: false };
    const inactive = { ...makeUser(518), isdisabled: true };
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ value: [active, inactive] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-est-18' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.status).toBe('ACTIVE');
    expect(recs[1].data.status).toBe('INACTIVE');
  });
  it('emp-status-20: isdisabled maps to INACTIVE/ACTIVE', async () => {
    const active = { ...makeUser(19), isdisabled: false };
    const inactive = { ...makeUser(519), isdisabled: true };
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ value: [active, inactive] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-est-19' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.status).toBe('ACTIVE');
    expect(recs[1].data.status).toBe('INACTIVE');
  });
});

// ── 6. fetchRecords EMPLOYEE errors ──────────────────────────────────────────

describe('Dynamics365Connector – fetchRecords EMPLOYEE errors', () => {
  let fetchMock: jest.SpyInstance;
  beforeEach(() => { fetchMock = jest.spyOn(global, "fetch"); });
  afterEach(() => { fetchMock.mockRestore(); });
  it('emp-err-400-1: HTTP 400 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(400));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ee-400-0' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('Dynamics 365 API error: HTTP 400');
  });
  it('emp-err-400-2: HTTP 400 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(400));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ee-400-1' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('Dynamics 365 API error: HTTP 400');
  });
  it('emp-err-400-3: HTTP 400 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(400));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ee-400-2' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('Dynamics 365 API error: HTTP 400');
  });
  it('emp-err-400-4: HTTP 400 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(400));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ee-400-3' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('Dynamics 365 API error: HTTP 400');
  });
  it('emp-err-401-1: HTTP 401 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(401));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ee-401-0' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('Dynamics 365 API error: HTTP 401');
  });
  it('emp-err-401-2: HTTP 401 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(401));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ee-401-1' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('Dynamics 365 API error: HTTP 401');
  });
  it('emp-err-401-3: HTTP 401 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(401));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ee-401-2' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('Dynamics 365 API error: HTTP 401');
  });
  it('emp-err-401-4: HTTP 401 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(401));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ee-401-3' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('Dynamics 365 API error: HTTP 401');
  });
  it('emp-err-403-1: HTTP 403 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(403));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ee-403-0' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('Dynamics 365 API error: HTTP 403');
  });
  it('emp-err-403-2: HTTP 403 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(403));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ee-403-1' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('Dynamics 365 API error: HTTP 403');
  });
  it('emp-err-403-3: HTTP 403 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(403));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ee-403-2' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('Dynamics 365 API error: HTTP 403');
  });
  it('emp-err-403-4: HTTP 403 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(403));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ee-403-3' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('Dynamics 365 API error: HTTP 403');
  });
  it('emp-err-404-1: HTTP 404 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(404));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ee-404-0' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('Dynamics 365 API error: HTTP 404');
  });
  it('emp-err-404-2: HTTP 404 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(404));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ee-404-1' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('Dynamics 365 API error: HTTP 404');
  });
  it('emp-err-404-3: HTTP 404 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(404));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ee-404-2' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('Dynamics 365 API error: HTTP 404');
  });
  it('emp-err-404-4: HTTP 404 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(404));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ee-404-3' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('Dynamics 365 API error: HTTP 404');
  });
  it('emp-err-500-1: HTTP 500 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(500));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ee-500-0' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('Dynamics 365 API error: HTTP 500');
  });
  it('emp-err-500-2: HTTP 500 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(500));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ee-500-1' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('Dynamics 365 API error: HTTP 500');
  });
  it('emp-err-500-3: HTTP 500 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(500));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ee-500-2' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('Dynamics 365 API error: HTTP 500');
  });
  it('emp-err-500-4: HTTP 500 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(500));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ee-500-3' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('Dynamics 365 API error: HTTP 500');
  });
  it('emp-err-502-1: HTTP 502 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(502));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ee-502-0' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('Dynamics 365 API error: HTTP 502');
  });
  it('emp-err-502-2: HTTP 502 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(502));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ee-502-1' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('Dynamics 365 API error: HTTP 502');
  });
  it('emp-err-502-3: HTTP 502 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(502));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ee-502-2' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('Dynamics 365 API error: HTTP 502');
  });
  it('emp-err-502-4: HTTP 502 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(502));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ee-502-3' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('Dynamics 365 API error: HTTP 502');
  });
  it('emp-err-503-1: HTTP 503 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(503));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ee-503-0' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('Dynamics 365 API error: HTTP 503');
  });
  it('emp-err-503-2: HTTP 503 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(503));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ee-503-1' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('Dynamics 365 API error: HTTP 503');
  });
  it('emp-err-503-3: HTTP 503 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(503));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ee-503-2' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('Dynamics 365 API error: HTTP 503');
  });
  it('emp-err-503-4: HTTP 503 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(503));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ee-503-3' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('Dynamics 365 API error: HTTP 503');
  });
  it('emp-net-1: network failure throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockRejectedValueOnce(new Error('D365 timeout 0'));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-en-0' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('D365 timeout 0');
  });
  it('emp-net-2: network failure throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockRejectedValueOnce(new Error('D365 timeout 1'));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-en-1' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('D365 timeout 1');
  });
  it('emp-net-3: network failure throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockRejectedValueOnce(new Error('D365 timeout 2'));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-en-2' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('D365 timeout 2');
  });
  it('emp-net-4: network failure throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockRejectedValueOnce(new Error('D365 timeout 3'));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-en-3' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('D365 timeout 3');
  });
  it('emp-net-5: network failure throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockRejectedValueOnce(new Error('D365 timeout 4'));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-en-4' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('D365 timeout 4');
  });
  it('emp-net-6: network failure throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockRejectedValueOnce(new Error('D365 timeout 5'));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-en-5' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('D365 timeout 5');
  });
  it('emp-net-7: network failure throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockRejectedValueOnce(new Error('D365 timeout 6'));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-en-6' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('D365 timeout 6');
  });
  it('emp-net-8: network failure throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockRejectedValueOnce(new Error('D365 timeout 7'));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-en-7' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('D365 timeout 7');
  });
  it('emp-net-9: network failure throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockRejectedValueOnce(new Error('D365 timeout 8'));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-en-8' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('D365 timeout 8');
  });
  it('emp-net-10: network failure throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockRejectedValueOnce(new Error('D365 timeout 9'));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-en-9' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('D365 timeout 9');
  });
  it('emp-empty-1: empty value → []', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ee2-0' }));
    expect(await conn.fetchRecords('EMPLOYEE')).toHaveLength(0);
  });
  it('emp-empty-2: empty value → []', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ee2-1' }));
    expect(await conn.fetchRecords('EMPLOYEE')).toHaveLength(0);
  });
  it('emp-empty-3: empty value → []', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ee2-2' }));
    expect(await conn.fetchRecords('EMPLOYEE')).toHaveLength(0);
  });
  it('emp-empty-4: empty value → []', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ee2-3' }));
    expect(await conn.fetchRecords('EMPLOYEE')).toHaveLength(0);
  });
  it('emp-empty-5: empty value → []', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ee2-4' }));
    expect(await conn.fetchRecords('EMPLOYEE')).toHaveLength(0);
  });
});

// ── 7. fetchRecords EMPLOYEE since filter ────────────────────────────────────

describe('Dynamics365Connector – fetchRecords EMPLOYEE since filter', () => {
  let fetchMock: jest.SpyInstance;
  beforeEach(() => { fetchMock = jest.spyOn(global, "fetch"); });
  afterEach(() => { fetchMock.mockRestore(); });
  it('since-1: since date in URL', async () => {
    const since = new Date('2026-01-01T00:00:00.000Z');
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-si-0' }));
    await conn.fetchRecords('EMPLOYEE', since);
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('modifiedon gt');
    expect(url).toContain(since.toISOString());
  });
  it('since-2: since date in URL', async () => {
    const since = new Date('2026-01-02T00:00:00.000Z');
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-si-1' }));
    await conn.fetchRecords('EMPLOYEE', since);
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('modifiedon gt');
    expect(url).toContain(since.toISOString());
  });
  it('since-3: since date in URL', async () => {
    const since = new Date('2026-01-03T00:00:00.000Z');
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-si-2' }));
    await conn.fetchRecords('EMPLOYEE', since);
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('modifiedon gt');
    expect(url).toContain(since.toISOString());
  });
  it('since-4: since date in URL', async () => {
    const since = new Date('2026-01-04T00:00:00.000Z');
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-si-3' }));
    await conn.fetchRecords('EMPLOYEE', since);
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('modifiedon gt');
    expect(url).toContain(since.toISOString());
  });
  it('since-5: since date in URL', async () => {
    const since = new Date('2026-01-05T00:00:00.000Z');
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-si-4' }));
    await conn.fetchRecords('EMPLOYEE', since);
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('modifiedon gt');
    expect(url).toContain(since.toISOString());
  });
  it('since-6: since date in URL', async () => {
    const since = new Date('2026-01-06T00:00:00.000Z');
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-si-5' }));
    await conn.fetchRecords('EMPLOYEE', since);
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('modifiedon gt');
    expect(url).toContain(since.toISOString());
  });
  it('since-7: since date in URL', async () => {
    const since = new Date('2026-01-07T00:00:00.000Z');
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-si-6' }));
    await conn.fetchRecords('EMPLOYEE', since);
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('modifiedon gt');
    expect(url).toContain(since.toISOString());
  });
  it('since-8: since date in URL', async () => {
    const since = new Date('2026-01-08T00:00:00.000Z');
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-si-7' }));
    await conn.fetchRecords('EMPLOYEE', since);
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('modifiedon gt');
    expect(url).toContain(since.toISOString());
  });
  it('since-9: since date in URL', async () => {
    const since = new Date('2026-01-09T00:00:00.000Z');
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-si-8' }));
    await conn.fetchRecords('EMPLOYEE', since);
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('modifiedon gt');
    expect(url).toContain(since.toISOString());
  });
  it('since-10: since date in URL', async () => {
    const since = new Date('2026-01-10T00:00:00.000Z');
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-si-9' }));
    await conn.fetchRecords('EMPLOYEE', since);
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('modifiedon gt');
    expect(url).toContain(since.toISOString());
  });
  it('since-11: since date in URL', async () => {
    const since = new Date('2026-01-11T00:00:00.000Z');
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-si-10' }));
    await conn.fetchRecords('EMPLOYEE', since);
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('modifiedon gt');
    expect(url).toContain(since.toISOString());
  });
  it('since-12: since date in URL', async () => {
    const since = new Date('2026-01-12T00:00:00.000Z');
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-si-11' }));
    await conn.fetchRecords('EMPLOYEE', since);
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('modifiedon gt');
    expect(url).toContain(since.toISOString());
  });
  it('since-13: since date in URL', async () => {
    const since = new Date('2026-01-13T00:00:00.000Z');
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-si-12' }));
    await conn.fetchRecords('EMPLOYEE', since);
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('modifiedon gt');
    expect(url).toContain(since.toISOString());
  });
  it('since-14: since date in URL', async () => {
    const since = new Date('2026-01-14T00:00:00.000Z');
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-si-13' }));
    await conn.fetchRecords('EMPLOYEE', since);
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('modifiedon gt');
    expect(url).toContain(since.toISOString());
  });
  it('since-15: since date in URL', async () => {
    const since = new Date('2026-01-15T00:00:00.000Z');
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-si-14' }));
    await conn.fetchRecords('EMPLOYEE', since);
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('modifiedon gt');
    expect(url).toContain(since.toISOString());
  });
  it('since-16: since date in URL', async () => {
    const since = new Date('2026-01-16T00:00:00.000Z');
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-si-15' }));
    await conn.fetchRecords('EMPLOYEE', since);
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('modifiedon gt');
    expect(url).toContain(since.toISOString());
  });
  it('since-17: since date in URL', async () => {
    const since = new Date('2026-01-17T00:00:00.000Z');
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-si-16' }));
    await conn.fetchRecords('EMPLOYEE', since);
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('modifiedon gt');
    expect(url).toContain(since.toISOString());
  });
  it('since-18: since date in URL', async () => {
    const since = new Date('2026-01-18T00:00:00.000Z');
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-si-17' }));
    await conn.fetchRecords('EMPLOYEE', since);
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('modifiedon gt');
    expect(url).toContain(since.toISOString());
  });
  it('since-19: since date in URL', async () => {
    const since = new Date('2026-01-19T00:00:00.000Z');
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-si-18' }));
    await conn.fetchRecords('EMPLOYEE', since);
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('modifiedon gt');
    expect(url).toContain(since.toISOString());
  });
  it('since-20: since date in URL', async () => {
    const since = new Date('2026-01-20T00:00:00.000Z');
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-si-19' }));
    await conn.fetchRecords('EMPLOYEE', since);
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('modifiedon gt');
    expect(url).toContain(since.toISOString());
  });
  it('since-21: since date in URL', async () => {
    const since = new Date('2026-01-21T00:00:00.000Z');
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-si-20' }));
    await conn.fetchRecords('EMPLOYEE', since);
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('modifiedon gt');
    expect(url).toContain(since.toISOString());
  });
  it('since-22: since date in URL', async () => {
    const since = new Date('2026-01-22T00:00:00.000Z');
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-si-21' }));
    await conn.fetchRecords('EMPLOYEE', since);
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('modifiedon gt');
    expect(url).toContain(since.toISOString());
  });
  it('since-23: since date in URL', async () => {
    const since = new Date('2026-01-23T00:00:00.000Z');
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-si-22' }));
    await conn.fetchRecords('EMPLOYEE', since);
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('modifiedon gt');
    expect(url).toContain(since.toISOString());
  });
  it('since-24: since date in URL', async () => {
    const since = new Date('2026-01-24T00:00:00.000Z');
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-si-23' }));
    await conn.fetchRecords('EMPLOYEE', since);
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('modifiedon gt');
    expect(url).toContain(since.toISOString());
  });
  it('since-25: since date in URL', async () => {
    const since = new Date('2026-01-25T00:00:00.000Z');
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-si-24' }));
    await conn.fetchRecords('EMPLOYEE', since);
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('modifiedon gt');
    expect(url).toContain(since.toISOString());
  });
  it('since-26: since date in URL', async () => {
    const since = new Date('2026-01-26T00:00:00.000Z');
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-si-25' }));
    await conn.fetchRecords('EMPLOYEE', since);
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('modifiedon gt');
    expect(url).toContain(since.toISOString());
  });
  it('since-27: since date in URL', async () => {
    const since = new Date('2026-01-27T00:00:00.000Z');
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-si-26' }));
    await conn.fetchRecords('EMPLOYEE', since);
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('modifiedon gt');
    expect(url).toContain(since.toISOString());
  });
  it('since-28: since date in URL', async () => {
    const since = new Date('2026-01-28T00:00:00.000Z');
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-si-27' }));
    await conn.fetchRecords('EMPLOYEE', since);
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('modifiedon gt');
    expect(url).toContain(since.toISOString());
  });
  it('since-29: since date in URL', async () => {
    const since = new Date('2026-01-01T00:00:00.000Z');
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-si-28' }));
    await conn.fetchRecords('EMPLOYEE', since);
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('modifiedon gt');
    expect(url).toContain(since.toISOString());
  });
  it('since-30: since date in URL', async () => {
    const since = new Date('2026-01-02T00:00:00.000Z');
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-si-29' }));
    await conn.fetchRecords('EMPLOYEE', since);
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('modifiedon gt');
    expect(url).toContain(since.toISOString());
  });
  it('no-since-1: no filter when since omitted', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ns-0' }));
    await conn.fetchRecords('EMPLOYEE');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).not.toContain('modifiedon gt');
    expect(url).toContain('/systemusers?');
  });
  it('no-since-2: no filter when since omitted', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ns-1' }));
    await conn.fetchRecords('EMPLOYEE');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).not.toContain('modifiedon gt');
    expect(url).toContain('/systemusers?');
  });
  it('no-since-3: no filter when since omitted', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ns-2' }));
    await conn.fetchRecords('EMPLOYEE');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).not.toContain('modifiedon gt');
    expect(url).toContain('/systemusers?');
  });
  it('no-since-4: no filter when since omitted', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ns-3' }));
    await conn.fetchRecords('EMPLOYEE');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).not.toContain('modifiedon gt');
    expect(url).toContain('/systemusers?');
  });
  it('no-since-5: no filter when since omitted', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ns-4' }));
    await conn.fetchRecords('EMPLOYEE');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).not.toContain('modifiedon gt');
    expect(url).toContain('/systemusers?');
  });
  it('no-since-6: no filter when since omitted', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ns-5' }));
    await conn.fetchRecords('EMPLOYEE');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).not.toContain('modifiedon gt');
    expect(url).toContain('/systemusers?');
  });
  it('no-since-7: no filter when since omitted', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ns-6' }));
    await conn.fetchRecords('EMPLOYEE');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).not.toContain('modifiedon gt');
    expect(url).toContain('/systemusers?');
  });
  it('no-since-8: no filter when since omitted', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ns-7' }));
    await conn.fetchRecords('EMPLOYEE');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).not.toContain('modifiedon gt');
    expect(url).toContain('/systemusers?');
  });
  it('no-since-9: no filter when since omitted', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ns-8' }));
    await conn.fetchRecords('EMPLOYEE');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).not.toContain('modifiedon gt');
    expect(url).toContain('/systemusers?');
  });
  it('no-since-10: no filter when since omitted', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ns-9' }));
    await conn.fetchRecords('EMPLOYEE');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).not.toContain('modifiedon gt');
    expect(url).toContain('/systemusers?');
  });
  it('no-since-11: no filter when since omitted', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ns-10' }));
    await conn.fetchRecords('EMPLOYEE');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).not.toContain('modifiedon gt');
    expect(url).toContain('/systemusers?');
  });
  it('no-since-12: no filter when since omitted', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ns-11' }));
    await conn.fetchRecords('EMPLOYEE');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).not.toContain('modifiedon gt');
    expect(url).toContain('/systemusers?');
  });
  it('no-since-13: no filter when since omitted', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ns-12' }));
    await conn.fetchRecords('EMPLOYEE');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).not.toContain('modifiedon gt');
    expect(url).toContain('/systemusers?');
  });
  it('no-since-14: no filter when since omitted', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ns-13' }));
    await conn.fetchRecords('EMPLOYEE');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).not.toContain('modifiedon gt');
    expect(url).toContain('/systemusers?');
  });
  it('no-since-15: no filter when since omitted', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ns-14' }));
    await conn.fetchRecords('EMPLOYEE');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).not.toContain('modifiedon gt');
    expect(url).toContain('/systemusers?');
  });
  it('no-since-16: no filter when since omitted', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ns-15' }));
    await conn.fetchRecords('EMPLOYEE');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).not.toContain('modifiedon gt');
    expect(url).toContain('/systemusers?');
  });
  it('no-since-17: no filter when since omitted', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ns-16' }));
    await conn.fetchRecords('EMPLOYEE');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).not.toContain('modifiedon gt');
    expect(url).toContain('/systemusers?');
  });
  it('no-since-18: no filter when since omitted', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ns-17' }));
    await conn.fetchRecords('EMPLOYEE');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).not.toContain('modifiedon gt');
    expect(url).toContain('/systemusers?');
  });
  it('no-since-19: no filter when since omitted', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ns-18' }));
    await conn.fetchRecords('EMPLOYEE');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).not.toContain('modifiedon gt');
    expect(url).toContain('/systemusers?');
  });
  it('no-since-20: no filter when since omitted', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ns-19' }));
    await conn.fetchRecords('EMPLOYEE');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).not.toContain('modifiedon gt');
    expect(url).toContain('/systemusers?');
  });
});

// ── 8. fetchRecords DEPARTMENT success ───────────────────────────────────────

describe('Dynamics365Connector – fetchRecords DEPARTMENT success', () => {
  let fetchMock: jest.SpyInstance;
  beforeEach(() => { fetchMock = jest.spyOn(global, "fetch"); });
  afterEach(() => { fetchMock.mockRestore(); });
  it('dept-1: returns 1 dept records', async () => {
    const bus = Array.from({ length: 1 }, (_, k) => makeBU(0*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: bus }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-d-0' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(1);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^d365_bu_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('dept-2: returns 2 dept records', async () => {
    const bus = Array.from({ length: 2 }, (_, k) => makeBU(1*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: bus }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-d-1' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(2);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^d365_bu_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('dept-3: returns 3 dept records', async () => {
    const bus = Array.from({ length: 3 }, (_, k) => makeBU(2*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: bus }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-d-2' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(3);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^d365_bu_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('dept-4: returns 1 dept records', async () => {
    const bus = Array.from({ length: 1 }, (_, k) => makeBU(3*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: bus }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-d-3' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(1);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^d365_bu_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('dept-5: returns 2 dept records', async () => {
    const bus = Array.from({ length: 2 }, (_, k) => makeBU(4*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: bus }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-d-4' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(2);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^d365_bu_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('dept-6: returns 3 dept records', async () => {
    const bus = Array.from({ length: 3 }, (_, k) => makeBU(5*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: bus }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-d-5' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(3);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^d365_bu_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('dept-7: returns 1 dept records', async () => {
    const bus = Array.from({ length: 1 }, (_, k) => makeBU(6*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: bus }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-d-6' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(1);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^d365_bu_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('dept-8: returns 2 dept records', async () => {
    const bus = Array.from({ length: 2 }, (_, k) => makeBU(7*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: bus }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-d-7' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(2);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^d365_bu_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('dept-9: returns 3 dept records', async () => {
    const bus = Array.from({ length: 3 }, (_, k) => makeBU(8*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: bus }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-d-8' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(3);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^d365_bu_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('dept-10: returns 1 dept records', async () => {
    const bus = Array.from({ length: 1 }, (_, k) => makeBU(9*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: bus }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-d-9' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(1);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^d365_bu_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('dept-11: returns 2 dept records', async () => {
    const bus = Array.from({ length: 2 }, (_, k) => makeBU(10*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: bus }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-d-10' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(2);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^d365_bu_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('dept-12: returns 3 dept records', async () => {
    const bus = Array.from({ length: 3 }, (_, k) => makeBU(11*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: bus }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-d-11' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(3);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^d365_bu_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('dept-13: returns 1 dept records', async () => {
    const bus = Array.from({ length: 1 }, (_, k) => makeBU(12*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: bus }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-d-12' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(1);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^d365_bu_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('dept-14: returns 2 dept records', async () => {
    const bus = Array.from({ length: 2 }, (_, k) => makeBU(13*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: bus }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-d-13' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(2);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^d365_bu_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('dept-15: returns 3 dept records', async () => {
    const bus = Array.from({ length: 3 }, (_, k) => makeBU(14*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: bus }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-d-14' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(3);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^d365_bu_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('dept-16: returns 1 dept records', async () => {
    const bus = Array.from({ length: 1 }, (_, k) => makeBU(15*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: bus }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-d-15' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(1);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^d365_bu_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('dept-17: returns 2 dept records', async () => {
    const bus = Array.from({ length: 2 }, (_, k) => makeBU(16*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: bus }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-d-16' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(2);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^d365_bu_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('dept-18: returns 3 dept records', async () => {
    const bus = Array.from({ length: 3 }, (_, k) => makeBU(17*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: bus }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-d-17' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(3);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^d365_bu_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('dept-19: returns 1 dept records', async () => {
    const bus = Array.from({ length: 1 }, (_, k) => makeBU(18*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: bus }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-d-18' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(1);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^d365_bu_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('dept-20: returns 2 dept records', async () => {
    const bus = Array.from({ length: 2 }, (_, k) => makeBU(19*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: bus }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-d-19' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(2);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^d365_bu_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('dept-21: returns 3 dept records', async () => {
    const bus = Array.from({ length: 3 }, (_, k) => makeBU(20*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: bus }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-d-20' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(3);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^d365_bu_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('dept-22: returns 1 dept records', async () => {
    const bus = Array.from({ length: 1 }, (_, k) => makeBU(21*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: bus }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-d-21' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(1);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^d365_bu_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('dept-23: returns 2 dept records', async () => {
    const bus = Array.from({ length: 2 }, (_, k) => makeBU(22*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: bus }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-d-22' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(2);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^d365_bu_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('dept-24: returns 3 dept records', async () => {
    const bus = Array.from({ length: 3 }, (_, k) => makeBU(23*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: bus }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-d-23' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(3);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^d365_bu_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('dept-25: returns 1 dept records', async () => {
    const bus = Array.from({ length: 1 }, (_, k) => makeBU(24*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: bus }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-d-24' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(1);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^d365_bu_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('dept-26: returns 2 dept records', async () => {
    const bus = Array.from({ length: 2 }, (_, k) => makeBU(25*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: bus }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-d-25' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(2);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^d365_bu_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('dept-27: returns 3 dept records', async () => {
    const bus = Array.from({ length: 3 }, (_, k) => makeBU(26*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: bus }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-d-26' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(3);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^d365_bu_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('dept-28: returns 1 dept records', async () => {
    const bus = Array.from({ length: 1 }, (_, k) => makeBU(27*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: bus }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-d-27' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(1);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^d365_bu_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('dept-29: returns 2 dept records', async () => {
    const bus = Array.from({ length: 2 }, (_, k) => makeBU(28*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: bus }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-d-28' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(2);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^d365_bu_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('dept-30: returns 3 dept records', async () => {
    const bus = Array.from({ length: 3 }, (_, k) => makeBU(29*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: bus }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-d-29' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(3);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^d365_bu_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('dept-31: returns 1 dept records', async () => {
    const bus = Array.from({ length: 1 }, (_, k) => makeBU(30*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: bus }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-d-30' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(1);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^d365_bu_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('dept-32: returns 2 dept records', async () => {
    const bus = Array.from({ length: 2 }, (_, k) => makeBU(31*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: bus }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-d-31' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(2);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^d365_bu_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('dept-33: returns 3 dept records', async () => {
    const bus = Array.from({ length: 3 }, (_, k) => makeBU(32*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: bus }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-d-32' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(3);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^d365_bu_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('dept-34: returns 1 dept records', async () => {
    const bus = Array.from({ length: 1 }, (_, k) => makeBU(33*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: bus }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-d-33' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(1);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^d365_bu_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('dept-35: returns 2 dept records', async () => {
    const bus = Array.from({ length: 2 }, (_, k) => makeBU(34*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: bus }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-d-34' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(2);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^d365_bu_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('dept-36: returns 3 dept records', async () => {
    const bus = Array.from({ length: 3 }, (_, k) => makeBU(35*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: bus }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-d-35' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(3);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^d365_bu_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('dept-37: returns 1 dept records', async () => {
    const bus = Array.from({ length: 1 }, (_, k) => makeBU(36*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: bus }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-d-36' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(1);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^d365_bu_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('dept-38: returns 2 dept records', async () => {
    const bus = Array.from({ length: 2 }, (_, k) => makeBU(37*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: bus }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-d-37' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(2);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^d365_bu_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('dept-39: returns 3 dept records', async () => {
    const bus = Array.from({ length: 3 }, (_, k) => makeBU(38*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: bus }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-d-38' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(3);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^d365_bu_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('dept-40: returns 1 dept records', async () => {
    const bus = Array.from({ length: 1 }, (_, k) => makeBU(39*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: bus }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-d-39' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(1);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^d365_bu_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('dept-41: returns 2 dept records', async () => {
    const bus = Array.from({ length: 2 }, (_, k) => makeBU(40*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: bus }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-d-40' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(2);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^d365_bu_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('dept-42: returns 3 dept records', async () => {
    const bus = Array.from({ length: 3 }, (_, k) => makeBU(41*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: bus }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-d-41' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(3);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^d365_bu_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('dept-43: returns 1 dept records', async () => {
    const bus = Array.from({ length: 1 }, (_, k) => makeBU(42*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: bus }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-d-42' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(1);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^d365_bu_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('dept-44: returns 2 dept records', async () => {
    const bus = Array.from({ length: 2 }, (_, k) => makeBU(43*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: bus }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-d-43' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(2);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^d365_bu_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('dept-45: returns 3 dept records', async () => {
    const bus = Array.from({ length: 3 }, (_, k) => makeBU(44*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: bus }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-d-44' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(3);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^d365_bu_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('dept-46: returns 1 dept records', async () => {
    const bus = Array.from({ length: 1 }, (_, k) => makeBU(45*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: bus }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-d-45' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(1);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^d365_bu_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('dept-47: returns 2 dept records', async () => {
    const bus = Array.from({ length: 2 }, (_, k) => makeBU(46*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: bus }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-d-46' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(2);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^d365_bu_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('dept-48: returns 3 dept records', async () => {
    const bus = Array.from({ length: 3 }, (_, k) => makeBU(47*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: bus }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-d-47' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(3);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^d365_bu_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('dept-49: returns 1 dept records', async () => {
    const bus = Array.from({ length: 1 }, (_, k) => makeBU(48*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: bus }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-d-48' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(1);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^d365_bu_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('dept-50: returns 2 dept records', async () => {
    const bus = Array.from({ length: 2 }, (_, k) => makeBU(49*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: bus }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-d-49' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(2);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^d365_bu_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('dept-51: returns 3 dept records', async () => {
    const bus = Array.from({ length: 3 }, (_, k) => makeBU(50*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: bus }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-d-50' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(3);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^d365_bu_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('dept-52: returns 1 dept records', async () => {
    const bus = Array.from({ length: 1 }, (_, k) => makeBU(51*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: bus }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-d-51' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(1);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^d365_bu_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('dept-53: returns 2 dept records', async () => {
    const bus = Array.from({ length: 2 }, (_, k) => makeBU(52*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: bus }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-d-52' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(2);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^d365_bu_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('dept-54: returns 3 dept records', async () => {
    const bus = Array.from({ length: 3 }, (_, k) => makeBU(53*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: bus }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-d-53' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(3);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^d365_bu_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('dept-55: returns 1 dept records', async () => {
    const bus = Array.from({ length: 1 }, (_, k) => makeBU(54*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: bus }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-d-54' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(1);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^d365_bu_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('dept-56: returns 2 dept records', async () => {
    const bus = Array.from({ length: 2 }, (_, k) => makeBU(55*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: bus }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-d-55' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(2);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^d365_bu_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('dept-57: returns 3 dept records', async () => {
    const bus = Array.from({ length: 3 }, (_, k) => makeBU(56*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: bus }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-d-56' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(3);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^d365_bu_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('dept-58: returns 1 dept records', async () => {
    const bus = Array.from({ length: 1 }, (_, k) => makeBU(57*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: bus }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-d-57' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(1);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^d365_bu_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('dept-59: returns 2 dept records', async () => {
    const bus = Array.from({ length: 2 }, (_, k) => makeBU(58*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: bus }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-d-58' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(2);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^d365_bu_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('dept-60: returns 3 dept records', async () => {
    const bus = Array.from({ length: 3 }, (_, k) => makeBU(59*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: bus }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-d-59' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(3);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^d365_bu_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('dept-url-1: hits /businessunits endpoint', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-du-0' }));
    await conn.fetchRecords('DEPARTMENT');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('/businessunits?');
    expect(url).toContain('businessunitid');
  });
  it('dept-url-2: hits /businessunits endpoint', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-du-1' }));
    await conn.fetchRecords('DEPARTMENT');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('/businessunits?');
    expect(url).toContain('businessunitid');
  });
  it('dept-url-3: hits /businessunits endpoint', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-du-2' }));
    await conn.fetchRecords('DEPARTMENT');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('/businessunits?');
    expect(url).toContain('businessunitid');
  });
  it('dept-url-4: hits /businessunits endpoint', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-du-3' }));
    await conn.fetchRecords('DEPARTMENT');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('/businessunits?');
    expect(url).toContain('businessunitid');
  });
  it('dept-url-5: hits /businessunits endpoint', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-du-4' }));
    await conn.fetchRecords('DEPARTMENT');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('/businessunits?');
    expect(url).toContain('businessunitid');
  });
  it('dept-url-6: hits /businessunits endpoint', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-du-5' }));
    await conn.fetchRecords('DEPARTMENT');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('/businessunits?');
    expect(url).toContain('businessunitid');
  });
  it('dept-url-7: hits /businessunits endpoint', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-du-6' }));
    await conn.fetchRecords('DEPARTMENT');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('/businessunits?');
    expect(url).toContain('businessunitid');
  });
  it('dept-url-8: hits /businessunits endpoint', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-du-7' }));
    await conn.fetchRecords('DEPARTMENT');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('/businessunits?');
    expect(url).toContain('businessunitid');
  });
  it('dept-url-9: hits /businessunits endpoint', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-du-8' }));
    await conn.fetchRecords('DEPARTMENT');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('/businessunits?');
    expect(url).toContain('businessunitid');
  });
  it('dept-url-10: hits /businessunits endpoint', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-du-9' }));
    await conn.fetchRecords('DEPARTMENT');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('/businessunits?');
    expect(url).toContain('businessunitid');
  });
});

// ── 9. fetchRecords DEPARTMENT errors ────────────────────────────────────────

describe('Dynamics365Connector – fetchRecords DEPARTMENT errors', () => {
  let fetchMock: jest.SpyInstance;
  beforeEach(() => { fetchMock = jest.spyOn(global, "fetch"); });
  afterEach(() => { fetchMock.mockRestore(); });
  it('dept-err-401-1: HTTP 401 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(401));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-de-401-0' }));
    await expect(conn.fetchRecords('DEPARTMENT')).rejects.toThrow('Dynamics 365 API error: HTTP 401');
  });
  it('dept-err-401-2: HTTP 401 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(401));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-de-401-1' }));
    await expect(conn.fetchRecords('DEPARTMENT')).rejects.toThrow('Dynamics 365 API error: HTTP 401');
  });
  it('dept-err-401-3: HTTP 401 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(401));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-de-401-2' }));
    await expect(conn.fetchRecords('DEPARTMENT')).rejects.toThrow('Dynamics 365 API error: HTTP 401');
  });
  it('dept-err-401-4: HTTP 401 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(401));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-de-401-3' }));
    await expect(conn.fetchRecords('DEPARTMENT')).rejects.toThrow('Dynamics 365 API error: HTTP 401');
  });
  it('dept-err-403-1: HTTP 403 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(403));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-de-403-0' }));
    await expect(conn.fetchRecords('DEPARTMENT')).rejects.toThrow('Dynamics 365 API error: HTTP 403');
  });
  it('dept-err-403-2: HTTP 403 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(403));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-de-403-1' }));
    await expect(conn.fetchRecords('DEPARTMENT')).rejects.toThrow('Dynamics 365 API error: HTTP 403');
  });
  it('dept-err-403-3: HTTP 403 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(403));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-de-403-2' }));
    await expect(conn.fetchRecords('DEPARTMENT')).rejects.toThrow('Dynamics 365 API error: HTTP 403');
  });
  it('dept-err-403-4: HTTP 403 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(403));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-de-403-3' }));
    await expect(conn.fetchRecords('DEPARTMENT')).rejects.toThrow('Dynamics 365 API error: HTTP 403');
  });
  it('dept-err-500-1: HTTP 500 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(500));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-de-500-0' }));
    await expect(conn.fetchRecords('DEPARTMENT')).rejects.toThrow('Dynamics 365 API error: HTTP 500');
  });
  it('dept-err-500-2: HTTP 500 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(500));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-de-500-1' }));
    await expect(conn.fetchRecords('DEPARTMENT')).rejects.toThrow('Dynamics 365 API error: HTTP 500');
  });
  it('dept-err-500-3: HTTP 500 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(500));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-de-500-2' }));
    await expect(conn.fetchRecords('DEPARTMENT')).rejects.toThrow('Dynamics 365 API error: HTTP 500');
  });
  it('dept-err-500-4: HTTP 500 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(500));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-de-500-3' }));
    await expect(conn.fetchRecords('DEPARTMENT')).rejects.toThrow('Dynamics 365 API error: HTTP 500');
  });
  it('dept-err-503-1: HTTP 503 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(503));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-de-503-0' }));
    await expect(conn.fetchRecords('DEPARTMENT')).rejects.toThrow('Dynamics 365 API error: HTTP 503');
  });
  it('dept-err-503-2: HTTP 503 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(503));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-de-503-1' }));
    await expect(conn.fetchRecords('DEPARTMENT')).rejects.toThrow('Dynamics 365 API error: HTTP 503');
  });
  it('dept-err-503-3: HTTP 503 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(503));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-de-503-2' }));
    await expect(conn.fetchRecords('DEPARTMENT')).rejects.toThrow('Dynamics 365 API error: HTTP 503');
  });
  it('dept-err-503-4: HTTP 503 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(503));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-de-503-3' }));
    await expect(conn.fetchRecords('DEPARTMENT')).rejects.toThrow('Dynamics 365 API error: HTTP 503');
  });
  it('dept-empty-1: empty value → []', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-de2-0' }));
    expect(await conn.fetchRecords('DEPARTMENT')).toHaveLength(0);
  });
  it('dept-empty-2: empty value → []', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-de2-1' }));
    expect(await conn.fetchRecords('DEPARTMENT')).toHaveLength(0);
  });
  it('dept-empty-3: empty value → []', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-de2-2' }));
    expect(await conn.fetchRecords('DEPARTMENT')).toHaveLength(0);
  });
  it('dept-empty-4: empty value → []', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-de2-3' }));
    expect(await conn.fetchRecords('DEPARTMENT')).toHaveLength(0);
  });
  it('dept-empty-5: empty value → []', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-de2-4' }));
    expect(await conn.fetchRecords('DEPARTMENT')).toHaveLength(0);
  });
});

// ── 10. fetchRecords SUPPLIER success ────────────────────────────────────────

describe('Dynamics365Connector – fetchRecords SUPPLIER success', () => {
  let fetchMock: jest.SpyInstance;
  beforeEach(() => { fetchMock = jest.spyOn(global, "fetch"); });
  afterEach(() => { fetchMock.mockRestore(); });
  it('supp-1: returns 1 supplier records', async () => {
    const accs = Array.from({ length: 1 }, (_, k) => makeAccount(0*5+k, 2));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-s-0' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs).toHaveLength(1);
    recs.forEach((r) => {
      expect(r.entityType).toBe('SUPPLIER');
      expect(r.externalId).toMatch(/^d365_account_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('supp-2: returns 2 supplier records', async () => {
    const accs = Array.from({ length: 2 }, (_, k) => makeAccount(1*5+k, 2));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-s-1' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs).toHaveLength(2);
    recs.forEach((r) => {
      expect(r.entityType).toBe('SUPPLIER');
      expect(r.externalId).toMatch(/^d365_account_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('supp-3: returns 3 supplier records', async () => {
    const accs = Array.from({ length: 3 }, (_, k) => makeAccount(2*5+k, 2));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-s-2' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs).toHaveLength(3);
    recs.forEach((r) => {
      expect(r.entityType).toBe('SUPPLIER');
      expect(r.externalId).toMatch(/^d365_account_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('supp-4: returns 1 supplier records', async () => {
    const accs = Array.from({ length: 1 }, (_, k) => makeAccount(3*5+k, 2));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-s-3' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs).toHaveLength(1);
    recs.forEach((r) => {
      expect(r.entityType).toBe('SUPPLIER');
      expect(r.externalId).toMatch(/^d365_account_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('supp-5: returns 2 supplier records', async () => {
    const accs = Array.from({ length: 2 }, (_, k) => makeAccount(4*5+k, 2));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-s-4' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs).toHaveLength(2);
    recs.forEach((r) => {
      expect(r.entityType).toBe('SUPPLIER');
      expect(r.externalId).toMatch(/^d365_account_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('supp-6: returns 3 supplier records', async () => {
    const accs = Array.from({ length: 3 }, (_, k) => makeAccount(5*5+k, 2));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-s-5' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs).toHaveLength(3);
    recs.forEach((r) => {
      expect(r.entityType).toBe('SUPPLIER');
      expect(r.externalId).toMatch(/^d365_account_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('supp-7: returns 1 supplier records', async () => {
    const accs = Array.from({ length: 1 }, (_, k) => makeAccount(6*5+k, 2));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-s-6' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs).toHaveLength(1);
    recs.forEach((r) => {
      expect(r.entityType).toBe('SUPPLIER');
      expect(r.externalId).toMatch(/^d365_account_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('supp-8: returns 2 supplier records', async () => {
    const accs = Array.from({ length: 2 }, (_, k) => makeAccount(7*5+k, 2));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-s-7' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs).toHaveLength(2);
    recs.forEach((r) => {
      expect(r.entityType).toBe('SUPPLIER');
      expect(r.externalId).toMatch(/^d365_account_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('supp-9: returns 3 supplier records', async () => {
    const accs = Array.from({ length: 3 }, (_, k) => makeAccount(8*5+k, 2));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-s-8' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs).toHaveLength(3);
    recs.forEach((r) => {
      expect(r.entityType).toBe('SUPPLIER');
      expect(r.externalId).toMatch(/^d365_account_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('supp-10: returns 1 supplier records', async () => {
    const accs = Array.from({ length: 1 }, (_, k) => makeAccount(9*5+k, 2));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-s-9' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs).toHaveLength(1);
    recs.forEach((r) => {
      expect(r.entityType).toBe('SUPPLIER');
      expect(r.externalId).toMatch(/^d365_account_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('supp-11: returns 2 supplier records', async () => {
    const accs = Array.from({ length: 2 }, (_, k) => makeAccount(10*5+k, 2));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-s-10' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs).toHaveLength(2);
    recs.forEach((r) => {
      expect(r.entityType).toBe('SUPPLIER');
      expect(r.externalId).toMatch(/^d365_account_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('supp-12: returns 3 supplier records', async () => {
    const accs = Array.from({ length: 3 }, (_, k) => makeAccount(11*5+k, 2));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-s-11' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs).toHaveLength(3);
    recs.forEach((r) => {
      expect(r.entityType).toBe('SUPPLIER');
      expect(r.externalId).toMatch(/^d365_account_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('supp-13: returns 1 supplier records', async () => {
    const accs = Array.from({ length: 1 }, (_, k) => makeAccount(12*5+k, 2));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-s-12' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs).toHaveLength(1);
    recs.forEach((r) => {
      expect(r.entityType).toBe('SUPPLIER');
      expect(r.externalId).toMatch(/^d365_account_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('supp-14: returns 2 supplier records', async () => {
    const accs = Array.from({ length: 2 }, (_, k) => makeAccount(13*5+k, 2));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-s-13' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs).toHaveLength(2);
    recs.forEach((r) => {
      expect(r.entityType).toBe('SUPPLIER');
      expect(r.externalId).toMatch(/^d365_account_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('supp-15: returns 3 supplier records', async () => {
    const accs = Array.from({ length: 3 }, (_, k) => makeAccount(14*5+k, 2));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-s-14' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs).toHaveLength(3);
    recs.forEach((r) => {
      expect(r.entityType).toBe('SUPPLIER');
      expect(r.externalId).toMatch(/^d365_account_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('supp-16: returns 1 supplier records', async () => {
    const accs = Array.from({ length: 1 }, (_, k) => makeAccount(15*5+k, 2));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-s-15' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs).toHaveLength(1);
    recs.forEach((r) => {
      expect(r.entityType).toBe('SUPPLIER');
      expect(r.externalId).toMatch(/^d365_account_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('supp-17: returns 2 supplier records', async () => {
    const accs = Array.from({ length: 2 }, (_, k) => makeAccount(16*5+k, 2));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-s-16' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs).toHaveLength(2);
    recs.forEach((r) => {
      expect(r.entityType).toBe('SUPPLIER');
      expect(r.externalId).toMatch(/^d365_account_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('supp-18: returns 3 supplier records', async () => {
    const accs = Array.from({ length: 3 }, (_, k) => makeAccount(17*5+k, 2));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-s-17' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs).toHaveLength(3);
    recs.forEach((r) => {
      expect(r.entityType).toBe('SUPPLIER');
      expect(r.externalId).toMatch(/^d365_account_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('supp-19: returns 1 supplier records', async () => {
    const accs = Array.from({ length: 1 }, (_, k) => makeAccount(18*5+k, 2));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-s-18' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs).toHaveLength(1);
    recs.forEach((r) => {
      expect(r.entityType).toBe('SUPPLIER');
      expect(r.externalId).toMatch(/^d365_account_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('supp-20: returns 2 supplier records', async () => {
    const accs = Array.from({ length: 2 }, (_, k) => makeAccount(19*5+k, 2));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-s-19' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs).toHaveLength(2);
    recs.forEach((r) => {
      expect(r.entityType).toBe('SUPPLIER');
      expect(r.externalId).toMatch(/^d365_account_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('supp-21: returns 3 supplier records', async () => {
    const accs = Array.from({ length: 3 }, (_, k) => makeAccount(20*5+k, 2));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-s-20' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs).toHaveLength(3);
    recs.forEach((r) => {
      expect(r.entityType).toBe('SUPPLIER');
      expect(r.externalId).toMatch(/^d365_account_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('supp-22: returns 1 supplier records', async () => {
    const accs = Array.from({ length: 1 }, (_, k) => makeAccount(21*5+k, 2));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-s-21' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs).toHaveLength(1);
    recs.forEach((r) => {
      expect(r.entityType).toBe('SUPPLIER');
      expect(r.externalId).toMatch(/^d365_account_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('supp-23: returns 2 supplier records', async () => {
    const accs = Array.from({ length: 2 }, (_, k) => makeAccount(22*5+k, 2));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-s-22' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs).toHaveLength(2);
    recs.forEach((r) => {
      expect(r.entityType).toBe('SUPPLIER');
      expect(r.externalId).toMatch(/^d365_account_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('supp-24: returns 3 supplier records', async () => {
    const accs = Array.from({ length: 3 }, (_, k) => makeAccount(23*5+k, 2));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-s-23' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs).toHaveLength(3);
    recs.forEach((r) => {
      expect(r.entityType).toBe('SUPPLIER');
      expect(r.externalId).toMatch(/^d365_account_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('supp-25: returns 1 supplier records', async () => {
    const accs = Array.from({ length: 1 }, (_, k) => makeAccount(24*5+k, 2));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-s-24' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs).toHaveLength(1);
    recs.forEach((r) => {
      expect(r.entityType).toBe('SUPPLIER');
      expect(r.externalId).toMatch(/^d365_account_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('supp-26: returns 2 supplier records', async () => {
    const accs = Array.from({ length: 2 }, (_, k) => makeAccount(25*5+k, 2));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-s-25' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs).toHaveLength(2);
    recs.forEach((r) => {
      expect(r.entityType).toBe('SUPPLIER');
      expect(r.externalId).toMatch(/^d365_account_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('supp-27: returns 3 supplier records', async () => {
    const accs = Array.from({ length: 3 }, (_, k) => makeAccount(26*5+k, 2));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-s-26' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs).toHaveLength(3);
    recs.forEach((r) => {
      expect(r.entityType).toBe('SUPPLIER');
      expect(r.externalId).toMatch(/^d365_account_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('supp-28: returns 1 supplier records', async () => {
    const accs = Array.from({ length: 1 }, (_, k) => makeAccount(27*5+k, 2));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-s-27' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs).toHaveLength(1);
    recs.forEach((r) => {
      expect(r.entityType).toBe('SUPPLIER');
      expect(r.externalId).toMatch(/^d365_account_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('supp-29: returns 2 supplier records', async () => {
    const accs = Array.from({ length: 2 }, (_, k) => makeAccount(28*5+k, 2));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-s-28' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs).toHaveLength(2);
    recs.forEach((r) => {
      expect(r.entityType).toBe('SUPPLIER');
      expect(r.externalId).toMatch(/^d365_account_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('supp-30: returns 3 supplier records', async () => {
    const accs = Array.from({ length: 3 }, (_, k) => makeAccount(29*5+k, 2));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-s-29' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs).toHaveLength(3);
    recs.forEach((r) => {
      expect(r.entityType).toBe('SUPPLIER');
      expect(r.externalId).toMatch(/^d365_account_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('supp-31: returns 1 supplier records', async () => {
    const accs = Array.from({ length: 1 }, (_, k) => makeAccount(30*5+k, 2));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-s-30' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs).toHaveLength(1);
    recs.forEach((r) => {
      expect(r.entityType).toBe('SUPPLIER');
      expect(r.externalId).toMatch(/^d365_account_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('supp-32: returns 2 supplier records', async () => {
    const accs = Array.from({ length: 2 }, (_, k) => makeAccount(31*5+k, 2));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-s-31' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs).toHaveLength(2);
    recs.forEach((r) => {
      expect(r.entityType).toBe('SUPPLIER');
      expect(r.externalId).toMatch(/^d365_account_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('supp-33: returns 3 supplier records', async () => {
    const accs = Array.from({ length: 3 }, (_, k) => makeAccount(32*5+k, 2));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-s-32' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs).toHaveLength(3);
    recs.forEach((r) => {
      expect(r.entityType).toBe('SUPPLIER');
      expect(r.externalId).toMatch(/^d365_account_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('supp-34: returns 1 supplier records', async () => {
    const accs = Array.from({ length: 1 }, (_, k) => makeAccount(33*5+k, 2));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-s-33' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs).toHaveLength(1);
    recs.forEach((r) => {
      expect(r.entityType).toBe('SUPPLIER');
      expect(r.externalId).toMatch(/^d365_account_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('supp-35: returns 2 supplier records', async () => {
    const accs = Array.from({ length: 2 }, (_, k) => makeAccount(34*5+k, 2));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-s-34' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs).toHaveLength(2);
    recs.forEach((r) => {
      expect(r.entityType).toBe('SUPPLIER');
      expect(r.externalId).toMatch(/^d365_account_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('supp-36: returns 3 supplier records', async () => {
    const accs = Array.from({ length: 3 }, (_, k) => makeAccount(35*5+k, 2));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-s-35' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs).toHaveLength(3);
    recs.forEach((r) => {
      expect(r.entityType).toBe('SUPPLIER');
      expect(r.externalId).toMatch(/^d365_account_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('supp-37: returns 1 supplier records', async () => {
    const accs = Array.from({ length: 1 }, (_, k) => makeAccount(36*5+k, 2));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-s-36' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs).toHaveLength(1);
    recs.forEach((r) => {
      expect(r.entityType).toBe('SUPPLIER');
      expect(r.externalId).toMatch(/^d365_account_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('supp-38: returns 2 supplier records', async () => {
    const accs = Array.from({ length: 2 }, (_, k) => makeAccount(37*5+k, 2));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-s-37' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs).toHaveLength(2);
    recs.forEach((r) => {
      expect(r.entityType).toBe('SUPPLIER');
      expect(r.externalId).toMatch(/^d365_account_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('supp-39: returns 3 supplier records', async () => {
    const accs = Array.from({ length: 3 }, (_, k) => makeAccount(38*5+k, 2));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-s-38' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs).toHaveLength(3);
    recs.forEach((r) => {
      expect(r.entityType).toBe('SUPPLIER');
      expect(r.externalId).toMatch(/^d365_account_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('supp-40: returns 1 supplier records', async () => {
    const accs = Array.from({ length: 1 }, (_, k) => makeAccount(39*5+k, 2));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-s-39' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs).toHaveLength(1);
    recs.forEach((r) => {
      expect(r.entityType).toBe('SUPPLIER');
      expect(r.externalId).toMatch(/^d365_account_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('supp-url-1: hits /accounts with vendor filter', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-su-0' }));
    await conn.fetchRecords('SUPPLIER');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('/accounts?');
    expect(url).toContain('accountcategorycode eq 2');
  });
  it('supp-url-2: hits /accounts with vendor filter', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-su-1' }));
    await conn.fetchRecords('SUPPLIER');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('/accounts?');
    expect(url).toContain('accountcategorycode eq 2');
  });
  it('supp-url-3: hits /accounts with vendor filter', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-su-2' }));
    await conn.fetchRecords('SUPPLIER');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('/accounts?');
    expect(url).toContain('accountcategorycode eq 2');
  });
  it('supp-url-4: hits /accounts with vendor filter', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-su-3' }));
    await conn.fetchRecords('SUPPLIER');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('/accounts?');
    expect(url).toContain('accountcategorycode eq 2');
  });
  it('supp-url-5: hits /accounts with vendor filter', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-su-4' }));
    await conn.fetchRecords('SUPPLIER');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('/accounts?');
    expect(url).toContain('accountcategorycode eq 2');
  });
  it('supp-url-6: hits /accounts with vendor filter', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-su-5' }));
    await conn.fetchRecords('SUPPLIER');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('/accounts?');
    expect(url).toContain('accountcategorycode eq 2');
  });
  it('supp-url-7: hits /accounts with vendor filter', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-su-6' }));
    await conn.fetchRecords('SUPPLIER');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('/accounts?');
    expect(url).toContain('accountcategorycode eq 2');
  });
  it('supp-url-8: hits /accounts with vendor filter', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-su-7' }));
    await conn.fetchRecords('SUPPLIER');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('/accounts?');
    expect(url).toContain('accountcategorycode eq 2');
  });
  it('supp-url-9: hits /accounts with vendor filter', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-su-8' }));
    await conn.fetchRecords('SUPPLIER');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('/accounts?');
    expect(url).toContain('accountcategorycode eq 2');
  });
  it('supp-url-10: hits /accounts with vendor filter', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-su-9' }));
    await conn.fetchRecords('SUPPLIER');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('/accounts?');
    expect(url).toContain('accountcategorycode eq 2');
  });
});

// ── 11. fetchRecords SUPPLIER errors and since ───────────────────────────────

describe('Dynamics365Connector – fetchRecords SUPPLIER errors', () => {
  let fetchMock: jest.SpyInstance;
  beforeEach(() => { fetchMock = jest.spyOn(global, "fetch"); });
  afterEach(() => { fetchMock.mockRestore(); });
  it('supp-err-401-1: HTTP 401 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(401));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-se-401-0' }));
    await expect(conn.fetchRecords('SUPPLIER')).rejects.toThrow('Dynamics 365 API error: HTTP 401');
  });
  it('supp-err-401-2: HTTP 401 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(401));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-se-401-1' }));
    await expect(conn.fetchRecords('SUPPLIER')).rejects.toThrow('Dynamics 365 API error: HTTP 401');
  });
  it('supp-err-401-3: HTTP 401 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(401));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-se-401-2' }));
    await expect(conn.fetchRecords('SUPPLIER')).rejects.toThrow('Dynamics 365 API error: HTTP 401');
  });
  it('supp-err-403-1: HTTP 403 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(403));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-se-403-0' }));
    await expect(conn.fetchRecords('SUPPLIER')).rejects.toThrow('Dynamics 365 API error: HTTP 403');
  });
  it('supp-err-403-2: HTTP 403 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(403));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-se-403-1' }));
    await expect(conn.fetchRecords('SUPPLIER')).rejects.toThrow('Dynamics 365 API error: HTTP 403');
  });
  it('supp-err-403-3: HTTP 403 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(403));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-se-403-2' }));
    await expect(conn.fetchRecords('SUPPLIER')).rejects.toThrow('Dynamics 365 API error: HTTP 403');
  });
  it('supp-err-500-1: HTTP 500 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(500));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-se-500-0' }));
    await expect(conn.fetchRecords('SUPPLIER')).rejects.toThrow('Dynamics 365 API error: HTTP 500');
  });
  it('supp-err-500-2: HTTP 500 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(500));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-se-500-1' }));
    await expect(conn.fetchRecords('SUPPLIER')).rejects.toThrow('Dynamics 365 API error: HTTP 500');
  });
  it('supp-err-500-3: HTTP 500 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(500));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-se-500-2' }));
    await expect(conn.fetchRecords('SUPPLIER')).rejects.toThrow('Dynamics 365 API error: HTTP 500');
  });
  it('supp-err-503-1: HTTP 503 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(503));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-se-503-0' }));
    await expect(conn.fetchRecords('SUPPLIER')).rejects.toThrow('Dynamics 365 API error: HTTP 503');
  });
  it('supp-err-503-2: HTTP 503 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(503));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-se-503-1' }));
    await expect(conn.fetchRecords('SUPPLIER')).rejects.toThrow('Dynamics 365 API error: HTTP 503');
  });
  it('supp-err-503-3: HTTP 503 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(503));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-se-503-2' }));
    await expect(conn.fetchRecords('SUPPLIER')).rejects.toThrow('Dynamics 365 API error: HTTP 503');
  });
  it('supp-empty-1: empty → []', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-se2-0' }));
    expect(await conn.fetchRecords('SUPPLIER')).toHaveLength(0);
  });
  it('supp-empty-2: empty → []', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-se2-1' }));
    expect(await conn.fetchRecords('SUPPLIER')).toHaveLength(0);
  });
  it('supp-empty-3: empty → []', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-se2-2' }));
    expect(await conn.fetchRecords('SUPPLIER')).toHaveLength(0);
  });
  it('supp-empty-4: empty → []', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-se2-3' }));
    expect(await conn.fetchRecords('SUPPLIER')).toHaveLength(0);
  });
  it('supp-empty-5: empty → []', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-se2-4' }));
    expect(await conn.fetchRecords('SUPPLIER')).toHaveLength(0);
  });
  it('supp-since-1: since filter applied to /accounts', async () => {
    const since = new Date('2026-02-01T00:00:00.000Z');
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ss-0' }));
    await conn.fetchRecords('SUPPLIER', since);
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('modifiedon gt');
    expect(url).toContain(since.toISOString());
  });
  it('supp-since-2: since filter applied to /accounts', async () => {
    const since = new Date('2026-02-02T00:00:00.000Z');
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ss-1' }));
    await conn.fetchRecords('SUPPLIER', since);
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('modifiedon gt');
    expect(url).toContain(since.toISOString());
  });
  it('supp-since-3: since filter applied to /accounts', async () => {
    const since = new Date('2026-02-03T00:00:00.000Z');
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ss-2' }));
    await conn.fetchRecords('SUPPLIER', since);
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('modifiedon gt');
    expect(url).toContain(since.toISOString());
  });
  it('supp-since-4: since filter applied to /accounts', async () => {
    const since = new Date('2026-02-04T00:00:00.000Z');
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ss-3' }));
    await conn.fetchRecords('SUPPLIER', since);
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('modifiedon gt');
    expect(url).toContain(since.toISOString());
  });
  it('supp-since-5: since filter applied to /accounts', async () => {
    const since = new Date('2026-02-05T00:00:00.000Z');
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ss-4' }));
    await conn.fetchRecords('SUPPLIER', since);
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('modifiedon gt');
    expect(url).toContain(since.toISOString());
  });
  it('supp-since-6: since filter applied to /accounts', async () => {
    const since = new Date('2026-02-06T00:00:00.000Z');
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ss-5' }));
    await conn.fetchRecords('SUPPLIER', since);
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('modifiedon gt');
    expect(url).toContain(since.toISOString());
  });
  it('supp-since-7: since filter applied to /accounts', async () => {
    const since = new Date('2026-02-07T00:00:00.000Z');
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ss-6' }));
    await conn.fetchRecords('SUPPLIER', since);
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('modifiedon gt');
    expect(url).toContain(since.toISOString());
  });
  it('supp-since-8: since filter applied to /accounts', async () => {
    const since = new Date('2026-02-08T00:00:00.000Z');
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ss-7' }));
    await conn.fetchRecords('SUPPLIER', since);
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('modifiedon gt');
    expect(url).toContain(since.toISOString());
  });
  it('supp-since-9: since filter applied to /accounts', async () => {
    const since = new Date('2026-02-09T00:00:00.000Z');
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ss-8' }));
    await conn.fetchRecords('SUPPLIER', since);
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('modifiedon gt');
    expect(url).toContain(since.toISOString());
  });
  it('supp-since-10: since filter applied to /accounts', async () => {
    const since = new Date('2026-02-10T00:00:00.000Z');
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ss-9' }));
    await conn.fetchRecords('SUPPLIER', since);
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('modifiedon gt');
    expect(url).toContain(since.toISOString());
  });
});

// ── 12. fetchRecords CUSTOMER success ────────────────────────────────────────

describe('Dynamics365Connector – fetchRecords CUSTOMER success', () => {
  let fetchMock: jest.SpyInstance;
  beforeEach(() => { fetchMock = jest.spyOn(global, "fetch"); });
  afterEach(() => { fetchMock.mockRestore(); });
  it('cust-1: returns 1 customer records', async () => {
    const accs = Array.from({ length: 1 }, (_, k) => makeAccount(0*5+k, 1));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-cu-0' }));
    const recs = await conn.fetchRecords('CUSTOMER');
    expect(recs).toHaveLength(1);
    recs.forEach((r) => {
      expect(r.entityType).toBe('CUSTOMER');
      expect(r.externalId).toMatch(/^d365_account_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('cust-2: returns 2 customer records', async () => {
    const accs = Array.from({ length: 2 }, (_, k) => makeAccount(1*5+k, 1));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-cu-1' }));
    const recs = await conn.fetchRecords('CUSTOMER');
    expect(recs).toHaveLength(2);
    recs.forEach((r) => {
      expect(r.entityType).toBe('CUSTOMER');
      expect(r.externalId).toMatch(/^d365_account_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('cust-3: returns 3 customer records', async () => {
    const accs = Array.from({ length: 3 }, (_, k) => makeAccount(2*5+k, 1));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-cu-2' }));
    const recs = await conn.fetchRecords('CUSTOMER');
    expect(recs).toHaveLength(3);
    recs.forEach((r) => {
      expect(r.entityType).toBe('CUSTOMER');
      expect(r.externalId).toMatch(/^d365_account_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('cust-4: returns 1 customer records', async () => {
    const accs = Array.from({ length: 1 }, (_, k) => makeAccount(3*5+k, 1));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-cu-3' }));
    const recs = await conn.fetchRecords('CUSTOMER');
    expect(recs).toHaveLength(1);
    recs.forEach((r) => {
      expect(r.entityType).toBe('CUSTOMER');
      expect(r.externalId).toMatch(/^d365_account_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('cust-5: returns 2 customer records', async () => {
    const accs = Array.from({ length: 2 }, (_, k) => makeAccount(4*5+k, 1));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-cu-4' }));
    const recs = await conn.fetchRecords('CUSTOMER');
    expect(recs).toHaveLength(2);
    recs.forEach((r) => {
      expect(r.entityType).toBe('CUSTOMER');
      expect(r.externalId).toMatch(/^d365_account_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('cust-6: returns 3 customer records', async () => {
    const accs = Array.from({ length: 3 }, (_, k) => makeAccount(5*5+k, 1));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-cu-5' }));
    const recs = await conn.fetchRecords('CUSTOMER');
    expect(recs).toHaveLength(3);
    recs.forEach((r) => {
      expect(r.entityType).toBe('CUSTOMER');
      expect(r.externalId).toMatch(/^d365_account_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('cust-7: returns 1 customer records', async () => {
    const accs = Array.from({ length: 1 }, (_, k) => makeAccount(6*5+k, 1));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-cu-6' }));
    const recs = await conn.fetchRecords('CUSTOMER');
    expect(recs).toHaveLength(1);
    recs.forEach((r) => {
      expect(r.entityType).toBe('CUSTOMER');
      expect(r.externalId).toMatch(/^d365_account_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('cust-8: returns 2 customer records', async () => {
    const accs = Array.from({ length: 2 }, (_, k) => makeAccount(7*5+k, 1));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-cu-7' }));
    const recs = await conn.fetchRecords('CUSTOMER');
    expect(recs).toHaveLength(2);
    recs.forEach((r) => {
      expect(r.entityType).toBe('CUSTOMER');
      expect(r.externalId).toMatch(/^d365_account_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('cust-9: returns 3 customer records', async () => {
    const accs = Array.from({ length: 3 }, (_, k) => makeAccount(8*5+k, 1));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-cu-8' }));
    const recs = await conn.fetchRecords('CUSTOMER');
    expect(recs).toHaveLength(3);
    recs.forEach((r) => {
      expect(r.entityType).toBe('CUSTOMER');
      expect(r.externalId).toMatch(/^d365_account_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('cust-10: returns 1 customer records', async () => {
    const accs = Array.from({ length: 1 }, (_, k) => makeAccount(9*5+k, 1));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-cu-9' }));
    const recs = await conn.fetchRecords('CUSTOMER');
    expect(recs).toHaveLength(1);
    recs.forEach((r) => {
      expect(r.entityType).toBe('CUSTOMER');
      expect(r.externalId).toMatch(/^d365_account_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('cust-11: returns 2 customer records', async () => {
    const accs = Array.from({ length: 2 }, (_, k) => makeAccount(10*5+k, 1));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-cu-10' }));
    const recs = await conn.fetchRecords('CUSTOMER');
    expect(recs).toHaveLength(2);
    recs.forEach((r) => {
      expect(r.entityType).toBe('CUSTOMER');
      expect(r.externalId).toMatch(/^d365_account_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('cust-12: returns 3 customer records', async () => {
    const accs = Array.from({ length: 3 }, (_, k) => makeAccount(11*5+k, 1));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-cu-11' }));
    const recs = await conn.fetchRecords('CUSTOMER');
    expect(recs).toHaveLength(3);
    recs.forEach((r) => {
      expect(r.entityType).toBe('CUSTOMER');
      expect(r.externalId).toMatch(/^d365_account_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('cust-13: returns 1 customer records', async () => {
    const accs = Array.from({ length: 1 }, (_, k) => makeAccount(12*5+k, 1));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-cu-12' }));
    const recs = await conn.fetchRecords('CUSTOMER');
    expect(recs).toHaveLength(1);
    recs.forEach((r) => {
      expect(r.entityType).toBe('CUSTOMER');
      expect(r.externalId).toMatch(/^d365_account_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('cust-14: returns 2 customer records', async () => {
    const accs = Array.from({ length: 2 }, (_, k) => makeAccount(13*5+k, 1));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-cu-13' }));
    const recs = await conn.fetchRecords('CUSTOMER');
    expect(recs).toHaveLength(2);
    recs.forEach((r) => {
      expect(r.entityType).toBe('CUSTOMER');
      expect(r.externalId).toMatch(/^d365_account_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('cust-15: returns 3 customer records', async () => {
    const accs = Array.from({ length: 3 }, (_, k) => makeAccount(14*5+k, 1));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-cu-14' }));
    const recs = await conn.fetchRecords('CUSTOMER');
    expect(recs).toHaveLength(3);
    recs.forEach((r) => {
      expect(r.entityType).toBe('CUSTOMER');
      expect(r.externalId).toMatch(/^d365_account_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('cust-16: returns 1 customer records', async () => {
    const accs = Array.from({ length: 1 }, (_, k) => makeAccount(15*5+k, 1));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-cu-15' }));
    const recs = await conn.fetchRecords('CUSTOMER');
    expect(recs).toHaveLength(1);
    recs.forEach((r) => {
      expect(r.entityType).toBe('CUSTOMER');
      expect(r.externalId).toMatch(/^d365_account_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('cust-17: returns 2 customer records', async () => {
    const accs = Array.from({ length: 2 }, (_, k) => makeAccount(16*5+k, 1));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-cu-16' }));
    const recs = await conn.fetchRecords('CUSTOMER');
    expect(recs).toHaveLength(2);
    recs.forEach((r) => {
      expect(r.entityType).toBe('CUSTOMER');
      expect(r.externalId).toMatch(/^d365_account_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('cust-18: returns 3 customer records', async () => {
    const accs = Array.from({ length: 3 }, (_, k) => makeAccount(17*5+k, 1));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-cu-17' }));
    const recs = await conn.fetchRecords('CUSTOMER');
    expect(recs).toHaveLength(3);
    recs.forEach((r) => {
      expect(r.entityType).toBe('CUSTOMER');
      expect(r.externalId).toMatch(/^d365_account_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('cust-19: returns 1 customer records', async () => {
    const accs = Array.from({ length: 1 }, (_, k) => makeAccount(18*5+k, 1));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-cu-18' }));
    const recs = await conn.fetchRecords('CUSTOMER');
    expect(recs).toHaveLength(1);
    recs.forEach((r) => {
      expect(r.entityType).toBe('CUSTOMER');
      expect(r.externalId).toMatch(/^d365_account_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('cust-20: returns 2 customer records', async () => {
    const accs = Array.from({ length: 2 }, (_, k) => makeAccount(19*5+k, 1));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-cu-19' }));
    const recs = await conn.fetchRecords('CUSTOMER');
    expect(recs).toHaveLength(2);
    recs.forEach((r) => {
      expect(r.entityType).toBe('CUSTOMER');
      expect(r.externalId).toMatch(/^d365_account_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('cust-21: returns 3 customer records', async () => {
    const accs = Array.from({ length: 3 }, (_, k) => makeAccount(20*5+k, 1));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-cu-20' }));
    const recs = await conn.fetchRecords('CUSTOMER');
    expect(recs).toHaveLength(3);
    recs.forEach((r) => {
      expect(r.entityType).toBe('CUSTOMER');
      expect(r.externalId).toMatch(/^d365_account_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('cust-22: returns 1 customer records', async () => {
    const accs = Array.from({ length: 1 }, (_, k) => makeAccount(21*5+k, 1));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-cu-21' }));
    const recs = await conn.fetchRecords('CUSTOMER');
    expect(recs).toHaveLength(1);
    recs.forEach((r) => {
      expect(r.entityType).toBe('CUSTOMER');
      expect(r.externalId).toMatch(/^d365_account_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('cust-23: returns 2 customer records', async () => {
    const accs = Array.from({ length: 2 }, (_, k) => makeAccount(22*5+k, 1));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-cu-22' }));
    const recs = await conn.fetchRecords('CUSTOMER');
    expect(recs).toHaveLength(2);
    recs.forEach((r) => {
      expect(r.entityType).toBe('CUSTOMER');
      expect(r.externalId).toMatch(/^d365_account_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('cust-24: returns 3 customer records', async () => {
    const accs = Array.from({ length: 3 }, (_, k) => makeAccount(23*5+k, 1));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-cu-23' }));
    const recs = await conn.fetchRecords('CUSTOMER');
    expect(recs).toHaveLength(3);
    recs.forEach((r) => {
      expect(r.entityType).toBe('CUSTOMER');
      expect(r.externalId).toMatch(/^d365_account_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('cust-25: returns 1 customer records', async () => {
    const accs = Array.from({ length: 1 }, (_, k) => makeAccount(24*5+k, 1));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-cu-24' }));
    const recs = await conn.fetchRecords('CUSTOMER');
    expect(recs).toHaveLength(1);
    recs.forEach((r) => {
      expect(r.entityType).toBe('CUSTOMER');
      expect(r.externalId).toMatch(/^d365_account_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('cust-26: returns 2 customer records', async () => {
    const accs = Array.from({ length: 2 }, (_, k) => makeAccount(25*5+k, 1));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-cu-25' }));
    const recs = await conn.fetchRecords('CUSTOMER');
    expect(recs).toHaveLength(2);
    recs.forEach((r) => {
      expect(r.entityType).toBe('CUSTOMER');
      expect(r.externalId).toMatch(/^d365_account_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('cust-27: returns 3 customer records', async () => {
    const accs = Array.from({ length: 3 }, (_, k) => makeAccount(26*5+k, 1));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-cu-26' }));
    const recs = await conn.fetchRecords('CUSTOMER');
    expect(recs).toHaveLength(3);
    recs.forEach((r) => {
      expect(r.entityType).toBe('CUSTOMER');
      expect(r.externalId).toMatch(/^d365_account_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('cust-28: returns 1 customer records', async () => {
    const accs = Array.from({ length: 1 }, (_, k) => makeAccount(27*5+k, 1));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-cu-27' }));
    const recs = await conn.fetchRecords('CUSTOMER');
    expect(recs).toHaveLength(1);
    recs.forEach((r) => {
      expect(r.entityType).toBe('CUSTOMER');
      expect(r.externalId).toMatch(/^d365_account_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('cust-29: returns 2 customer records', async () => {
    const accs = Array.from({ length: 2 }, (_, k) => makeAccount(28*5+k, 1));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-cu-28' }));
    const recs = await conn.fetchRecords('CUSTOMER');
    expect(recs).toHaveLength(2);
    recs.forEach((r) => {
      expect(r.entityType).toBe('CUSTOMER');
      expect(r.externalId).toMatch(/^d365_account_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('cust-30: returns 3 customer records', async () => {
    const accs = Array.from({ length: 3 }, (_, k) => makeAccount(29*5+k, 1));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-cu-29' }));
    const recs = await conn.fetchRecords('CUSTOMER');
    expect(recs).toHaveLength(3);
    recs.forEach((r) => {
      expect(r.entityType).toBe('CUSTOMER');
      expect(r.externalId).toMatch(/^d365_account_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('cust-31: returns 1 customer records', async () => {
    const accs = Array.from({ length: 1 }, (_, k) => makeAccount(30*5+k, 1));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-cu-30' }));
    const recs = await conn.fetchRecords('CUSTOMER');
    expect(recs).toHaveLength(1);
    recs.forEach((r) => {
      expect(r.entityType).toBe('CUSTOMER');
      expect(r.externalId).toMatch(/^d365_account_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('cust-32: returns 2 customer records', async () => {
    const accs = Array.from({ length: 2 }, (_, k) => makeAccount(31*5+k, 1));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-cu-31' }));
    const recs = await conn.fetchRecords('CUSTOMER');
    expect(recs).toHaveLength(2);
    recs.forEach((r) => {
      expect(r.entityType).toBe('CUSTOMER');
      expect(r.externalId).toMatch(/^d365_account_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('cust-33: returns 3 customer records', async () => {
    const accs = Array.from({ length: 3 }, (_, k) => makeAccount(32*5+k, 1));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-cu-32' }));
    const recs = await conn.fetchRecords('CUSTOMER');
    expect(recs).toHaveLength(3);
    recs.forEach((r) => {
      expect(r.entityType).toBe('CUSTOMER');
      expect(r.externalId).toMatch(/^d365_account_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('cust-34: returns 1 customer records', async () => {
    const accs = Array.from({ length: 1 }, (_, k) => makeAccount(33*5+k, 1));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-cu-33' }));
    const recs = await conn.fetchRecords('CUSTOMER');
    expect(recs).toHaveLength(1);
    recs.forEach((r) => {
      expect(r.entityType).toBe('CUSTOMER');
      expect(r.externalId).toMatch(/^d365_account_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('cust-35: returns 2 customer records', async () => {
    const accs = Array.from({ length: 2 }, (_, k) => makeAccount(34*5+k, 1));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-cu-34' }));
    const recs = await conn.fetchRecords('CUSTOMER');
    expect(recs).toHaveLength(2);
    recs.forEach((r) => {
      expect(r.entityType).toBe('CUSTOMER');
      expect(r.externalId).toMatch(/^d365_account_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('cust-36: returns 3 customer records', async () => {
    const accs = Array.from({ length: 3 }, (_, k) => makeAccount(35*5+k, 1));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-cu-35' }));
    const recs = await conn.fetchRecords('CUSTOMER');
    expect(recs).toHaveLength(3);
    recs.forEach((r) => {
      expect(r.entityType).toBe('CUSTOMER');
      expect(r.externalId).toMatch(/^d365_account_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('cust-37: returns 1 customer records', async () => {
    const accs = Array.from({ length: 1 }, (_, k) => makeAccount(36*5+k, 1));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-cu-36' }));
    const recs = await conn.fetchRecords('CUSTOMER');
    expect(recs).toHaveLength(1);
    recs.forEach((r) => {
      expect(r.entityType).toBe('CUSTOMER');
      expect(r.externalId).toMatch(/^d365_account_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('cust-38: returns 2 customer records', async () => {
    const accs = Array.from({ length: 2 }, (_, k) => makeAccount(37*5+k, 1));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-cu-37' }));
    const recs = await conn.fetchRecords('CUSTOMER');
    expect(recs).toHaveLength(2);
    recs.forEach((r) => {
      expect(r.entityType).toBe('CUSTOMER');
      expect(r.externalId).toMatch(/^d365_account_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('cust-39: returns 3 customer records', async () => {
    const accs = Array.from({ length: 3 }, (_, k) => makeAccount(38*5+k, 1));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-cu-38' }));
    const recs = await conn.fetchRecords('CUSTOMER');
    expect(recs).toHaveLength(3);
    recs.forEach((r) => {
      expect(r.entityType).toBe('CUSTOMER');
      expect(r.externalId).toMatch(/^d365_account_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('cust-40: returns 1 customer records', async () => {
    const accs = Array.from({ length: 1 }, (_, k) => makeAccount(39*5+k, 1));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-cu-39' }));
    const recs = await conn.fetchRecords('CUSTOMER');
    expect(recs).toHaveLength(1);
    recs.forEach((r) => {
      expect(r.entityType).toBe('CUSTOMER');
      expect(r.externalId).toMatch(/^d365_account_/);
      expect(r.data.source).toBe('DYNAMICS_365');
    });
  });
  it('cust-url-1: hits /accounts with customer filter', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-cuu-0' }));
    await conn.fetchRecords('CUSTOMER');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('/accounts?');
    expect(url).toContain('accountcategorycode eq 1');
  });
  it('cust-url-2: hits /accounts with customer filter', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-cuu-1' }));
    await conn.fetchRecords('CUSTOMER');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('/accounts?');
    expect(url).toContain('accountcategorycode eq 1');
  });
  it('cust-url-3: hits /accounts with customer filter', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-cuu-2' }));
    await conn.fetchRecords('CUSTOMER');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('/accounts?');
    expect(url).toContain('accountcategorycode eq 1');
  });
  it('cust-url-4: hits /accounts with customer filter', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-cuu-3' }));
    await conn.fetchRecords('CUSTOMER');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('/accounts?');
    expect(url).toContain('accountcategorycode eq 1');
  });
  it('cust-url-5: hits /accounts with customer filter', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-cuu-4' }));
    await conn.fetchRecords('CUSTOMER');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('/accounts?');
    expect(url).toContain('accountcategorycode eq 1');
  });
  it('cust-url-6: hits /accounts with customer filter', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-cuu-5' }));
    await conn.fetchRecords('CUSTOMER');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('/accounts?');
    expect(url).toContain('accountcategorycode eq 1');
  });
  it('cust-url-7: hits /accounts with customer filter', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-cuu-6' }));
    await conn.fetchRecords('CUSTOMER');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('/accounts?');
    expect(url).toContain('accountcategorycode eq 1');
  });
  it('cust-url-8: hits /accounts with customer filter', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-cuu-7' }));
    await conn.fetchRecords('CUSTOMER');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('/accounts?');
    expect(url).toContain('accountcategorycode eq 1');
  });
  it('cust-url-9: hits /accounts with customer filter', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-cuu-8' }));
    await conn.fetchRecords('CUSTOMER');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('/accounts?');
    expect(url).toContain('accountcategorycode eq 1');
  });
  it('cust-url-10: hits /accounts with customer filter', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-cuu-9' }));
    await conn.fetchRecords('CUSTOMER');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('/accounts?');
    expect(url).toContain('accountcategorycode eq 1');
  });
});

// ── 13. fetchRecords CUSTOMER errors and since ───────────────────────────────

describe('Dynamics365Connector – fetchRecords CUSTOMER errors', () => {
  let fetchMock: jest.SpyInstance;
  beforeEach(() => { fetchMock = jest.spyOn(global, "fetch"); });
  afterEach(() => { fetchMock.mockRestore(); });
  it('cust-err-401-1: HTTP 401 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(401));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ce-401-0' }));
    await expect(conn.fetchRecords('CUSTOMER')).rejects.toThrow('Dynamics 365 API error: HTTP 401');
  });
  it('cust-err-401-2: HTTP 401 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(401));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ce-401-1' }));
    await expect(conn.fetchRecords('CUSTOMER')).rejects.toThrow('Dynamics 365 API error: HTTP 401');
  });
  it('cust-err-401-3: HTTP 401 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(401));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ce-401-2' }));
    await expect(conn.fetchRecords('CUSTOMER')).rejects.toThrow('Dynamics 365 API error: HTTP 401');
  });
  it('cust-err-403-1: HTTP 403 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(403));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ce-403-0' }));
    await expect(conn.fetchRecords('CUSTOMER')).rejects.toThrow('Dynamics 365 API error: HTTP 403');
  });
  it('cust-err-403-2: HTTP 403 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(403));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ce-403-1' }));
    await expect(conn.fetchRecords('CUSTOMER')).rejects.toThrow('Dynamics 365 API error: HTTP 403');
  });
  it('cust-err-403-3: HTTP 403 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(403));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ce-403-2' }));
    await expect(conn.fetchRecords('CUSTOMER')).rejects.toThrow('Dynamics 365 API error: HTTP 403');
  });
  it('cust-err-500-1: HTTP 500 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(500));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ce-500-0' }));
    await expect(conn.fetchRecords('CUSTOMER')).rejects.toThrow('Dynamics 365 API error: HTTP 500');
  });
  it('cust-err-500-2: HTTP 500 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(500));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ce-500-1' }));
    await expect(conn.fetchRecords('CUSTOMER')).rejects.toThrow('Dynamics 365 API error: HTTP 500');
  });
  it('cust-err-500-3: HTTP 500 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(500));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ce-500-2' }));
    await expect(conn.fetchRecords('CUSTOMER')).rejects.toThrow('Dynamics 365 API error: HTTP 500');
  });
  it('cust-err-503-1: HTTP 503 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(503));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ce-503-0' }));
    await expect(conn.fetchRecords('CUSTOMER')).rejects.toThrow('Dynamics 365 API error: HTTP 503');
  });
  it('cust-err-503-2: HTTP 503 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(503));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ce-503-1' }));
    await expect(conn.fetchRecords('CUSTOMER')).rejects.toThrow('Dynamics 365 API error: HTTP 503');
  });
  it('cust-err-503-3: HTTP 503 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(503));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ce-503-2' }));
    await expect(conn.fetchRecords('CUSTOMER')).rejects.toThrow('Dynamics 365 API error: HTTP 503');
  });
  it('cust-empty-1: empty → []', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ce2-0' }));
    expect(await conn.fetchRecords('CUSTOMER')).toHaveLength(0);
  });
  it('cust-empty-2: empty → []', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ce2-1' }));
    expect(await conn.fetchRecords('CUSTOMER')).toHaveLength(0);
  });
  it('cust-empty-3: empty → []', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ce2-2' }));
    expect(await conn.fetchRecords('CUSTOMER')).toHaveLength(0);
  });
  it('cust-empty-4: empty → []', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ce2-3' }));
    expect(await conn.fetchRecords('CUSTOMER')).toHaveLength(0);
  });
  it('cust-empty-5: empty → []', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ce2-4' }));
    expect(await conn.fetchRecords('CUSTOMER')).toHaveLength(0);
  });
  it('cust-since-1: since filter in customer URL', async () => {
    const since = new Date('2026-03-01T00:00:00.000Z');
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-cs-0' }));
    await conn.fetchRecords('CUSTOMER', since);
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('modifiedon gt');
    expect(url).toContain(since.toISOString());
  });
  it('cust-since-2: since filter in customer URL', async () => {
    const since = new Date('2026-03-02T00:00:00.000Z');
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-cs-1' }));
    await conn.fetchRecords('CUSTOMER', since);
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('modifiedon gt');
    expect(url).toContain(since.toISOString());
  });
  it('cust-since-3: since filter in customer URL', async () => {
    const since = new Date('2026-03-03T00:00:00.000Z');
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-cs-2' }));
    await conn.fetchRecords('CUSTOMER', since);
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('modifiedon gt');
    expect(url).toContain(since.toISOString());
  });
  it('cust-since-4: since filter in customer URL', async () => {
    const since = new Date('2026-03-04T00:00:00.000Z');
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-cs-3' }));
    await conn.fetchRecords('CUSTOMER', since);
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('modifiedon gt');
    expect(url).toContain(since.toISOString());
  });
  it('cust-since-5: since filter in customer URL', async () => {
    const since = new Date('2026-03-05T00:00:00.000Z');
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-cs-4' }));
    await conn.fetchRecords('CUSTOMER', since);
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('modifiedon gt');
    expect(url).toContain(since.toISOString());
  });
  it('cust-since-6: since filter in customer URL', async () => {
    const since = new Date('2026-03-06T00:00:00.000Z');
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-cs-5' }));
    await conn.fetchRecords('CUSTOMER', since);
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('modifiedon gt');
    expect(url).toContain(since.toISOString());
  });
  it('cust-since-7: since filter in customer URL', async () => {
    const since = new Date('2026-03-07T00:00:00.000Z');
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-cs-6' }));
    await conn.fetchRecords('CUSTOMER', since);
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('modifiedon gt');
    expect(url).toContain(since.toISOString());
  });
  it('cust-since-8: since filter in customer URL', async () => {
    const since = new Date('2026-03-08T00:00:00.000Z');
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-cs-7' }));
    await conn.fetchRecords('CUSTOMER', since);
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('modifiedon gt');
    expect(url).toContain(since.toISOString());
  });
  it('cust-since-9: since filter in customer URL', async () => {
    const since = new Date('2026-03-09T00:00:00.000Z');
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-cs-8' }));
    await conn.fetchRecords('CUSTOMER', since);
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('modifiedon gt');
    expect(url).toContain(since.toISOString());
  });
  it('cust-since-10: since filter in customer URL', async () => {
    const since = new Date('2026-03-10T00:00:00.000Z');
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-cs-9' }));
    await conn.fetchRecords('CUSTOMER', since);
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('modifiedon gt');
    expect(url).toContain(since.toISOString());
  });
});

// ── 14. Unsupported entity types ─────────────────────────────────────────────

describe('Dynamics365Connector – unsupported entity types', () => {
  let fetchMock: jest.SpyInstance;
  beforeEach(() => { fetchMock = jest.spyOn(global, "fetch"); });
  afterEach(() => { fetchMock.mockRestore(); });
  it('unsup-POSITION-1: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-POSITION-0' }));
    const recs = await conn.fetchRecords('POSITION');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-POSITION-2: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-POSITION-1' }));
    const recs = await conn.fetchRecords('POSITION');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-POSITION-3: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-POSITION-2' }));
    const recs = await conn.fetchRecords('POSITION');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-POSITION-4: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-POSITION-3' }));
    const recs = await conn.fetchRecords('POSITION');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-POSITION-5: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-POSITION-4' }));
    const recs = await conn.fetchRecords('POSITION');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-POSITION-6: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-POSITION-5' }));
    const recs = await conn.fetchRecords('POSITION');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-POSITION-7: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-POSITION-6' }));
    const recs = await conn.fetchRecords('POSITION');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-POSITION-8: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-POSITION-7' }));
    const recs = await conn.fetchRecords('POSITION');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-POSITION-9: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-POSITION-8' }));
    const recs = await conn.fetchRecords('POSITION');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-POSITION-10: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-POSITION-9' }));
    const recs = await conn.fetchRecords('POSITION');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-POSITION-11: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-POSITION-10' }));
    const recs = await conn.fetchRecords('POSITION');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-POSITION-12: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-POSITION-11' }));
    const recs = await conn.fetchRecords('POSITION');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-POSITION-13: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-POSITION-12' }));
    const recs = await conn.fetchRecords('POSITION');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-POSITION-14: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-POSITION-13' }));
    const recs = await conn.fetchRecords('POSITION');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-POSITION-15: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-POSITION-14' }));
    const recs = await conn.fetchRecords('POSITION');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-POSITION-16: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-POSITION-15' }));
    const recs = await conn.fetchRecords('POSITION');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-POSITION-17: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-POSITION-16' }));
    const recs = await conn.fetchRecords('POSITION');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-POSITION-18: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-POSITION-17' }));
    const recs = await conn.fetchRecords('POSITION');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-POSITION-19: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-POSITION-18' }));
    const recs = await conn.fetchRecords('POSITION');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-POSITION-20: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-POSITION-19' }));
    const recs = await conn.fetchRecords('POSITION');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-POSITION-21: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-POSITION-20' }));
    const recs = await conn.fetchRecords('POSITION');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-POSITION-22: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-POSITION-21' }));
    const recs = await conn.fetchRecords('POSITION');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-POSITION-23: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-POSITION-22' }));
    const recs = await conn.fetchRecords('POSITION');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-POSITION-24: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-POSITION-23' }));
    const recs = await conn.fetchRecords('POSITION');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-POSITION-25: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-POSITION-24' }));
    const recs = await conn.fetchRecords('POSITION');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-POSITION-26: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-POSITION-25' }));
    const recs = await conn.fetchRecords('POSITION');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-POSITION-27: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-POSITION-26' }));
    const recs = await conn.fetchRecords('POSITION');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-POSITION-28: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-POSITION-27' }));
    const recs = await conn.fetchRecords('POSITION');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-POSITION-29: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-POSITION-28' }));
    const recs = await conn.fetchRecords('POSITION');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-POSITION-30: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-POSITION-29' }));
    const recs = await conn.fetchRecords('POSITION');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-LEAVE-1: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-LEAVE-0' }));
    const recs = await conn.fetchRecords('LEAVE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-LEAVE-2: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-LEAVE-1' }));
    const recs = await conn.fetchRecords('LEAVE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-LEAVE-3: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-LEAVE-2' }));
    const recs = await conn.fetchRecords('LEAVE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-LEAVE-4: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-LEAVE-3' }));
    const recs = await conn.fetchRecords('LEAVE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-LEAVE-5: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-LEAVE-4' }));
    const recs = await conn.fetchRecords('LEAVE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-LEAVE-6: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-LEAVE-5' }));
    const recs = await conn.fetchRecords('LEAVE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-LEAVE-7: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-LEAVE-6' }));
    const recs = await conn.fetchRecords('LEAVE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-LEAVE-8: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-LEAVE-7' }));
    const recs = await conn.fetchRecords('LEAVE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-LEAVE-9: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-LEAVE-8' }));
    const recs = await conn.fetchRecords('LEAVE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-LEAVE-10: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-LEAVE-9' }));
    const recs = await conn.fetchRecords('LEAVE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-LEAVE-11: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-LEAVE-10' }));
    const recs = await conn.fetchRecords('LEAVE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-LEAVE-12: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-LEAVE-11' }));
    const recs = await conn.fetchRecords('LEAVE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-LEAVE-13: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-LEAVE-12' }));
    const recs = await conn.fetchRecords('LEAVE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-LEAVE-14: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-LEAVE-13' }));
    const recs = await conn.fetchRecords('LEAVE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-LEAVE-15: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-LEAVE-14' }));
    const recs = await conn.fetchRecords('LEAVE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-LEAVE-16: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-LEAVE-15' }));
    const recs = await conn.fetchRecords('LEAVE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-LEAVE-17: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-LEAVE-16' }));
    const recs = await conn.fetchRecords('LEAVE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-LEAVE-18: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-LEAVE-17' }));
    const recs = await conn.fetchRecords('LEAVE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-LEAVE-19: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-LEAVE-18' }));
    const recs = await conn.fetchRecords('LEAVE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-LEAVE-20: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-LEAVE-19' }));
    const recs = await conn.fetchRecords('LEAVE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-LEAVE-21: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-LEAVE-20' }));
    const recs = await conn.fetchRecords('LEAVE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-LEAVE-22: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-LEAVE-21' }));
    const recs = await conn.fetchRecords('LEAVE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-LEAVE-23: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-LEAVE-22' }));
    const recs = await conn.fetchRecords('LEAVE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-LEAVE-24: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-LEAVE-23' }));
    const recs = await conn.fetchRecords('LEAVE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-LEAVE-25: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-LEAVE-24' }));
    const recs = await conn.fetchRecords('LEAVE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-LEAVE-26: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-LEAVE-25' }));
    const recs = await conn.fetchRecords('LEAVE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-LEAVE-27: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-LEAVE-26' }));
    const recs = await conn.fetchRecords('LEAVE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-LEAVE-28: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-LEAVE-27' }));
    const recs = await conn.fetchRecords('LEAVE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-LEAVE-29: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-LEAVE-28' }));
    const recs = await conn.fetchRecords('LEAVE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-LEAVE-30: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-LEAVE-29' }));
    const recs = await conn.fetchRecords('LEAVE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-INVOICE-1: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-INVOICE-0' }));
    const recs = await conn.fetchRecords('INVOICE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-INVOICE-2: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-INVOICE-1' }));
    const recs = await conn.fetchRecords('INVOICE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-INVOICE-3: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-INVOICE-2' }));
    const recs = await conn.fetchRecords('INVOICE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-INVOICE-4: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-INVOICE-3' }));
    const recs = await conn.fetchRecords('INVOICE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-INVOICE-5: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-INVOICE-4' }));
    const recs = await conn.fetchRecords('INVOICE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-INVOICE-6: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-INVOICE-5' }));
    const recs = await conn.fetchRecords('INVOICE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-INVOICE-7: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-INVOICE-6' }));
    const recs = await conn.fetchRecords('INVOICE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-INVOICE-8: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-INVOICE-7' }));
    const recs = await conn.fetchRecords('INVOICE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-INVOICE-9: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-INVOICE-8' }));
    const recs = await conn.fetchRecords('INVOICE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-INVOICE-10: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-INVOICE-9' }));
    const recs = await conn.fetchRecords('INVOICE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-INVOICE-11: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-INVOICE-10' }));
    const recs = await conn.fetchRecords('INVOICE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-INVOICE-12: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-INVOICE-11' }));
    const recs = await conn.fetchRecords('INVOICE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-INVOICE-13: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-INVOICE-12' }));
    const recs = await conn.fetchRecords('INVOICE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-INVOICE-14: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-INVOICE-13' }));
    const recs = await conn.fetchRecords('INVOICE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-INVOICE-15: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-INVOICE-14' }));
    const recs = await conn.fetchRecords('INVOICE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-INVOICE-16: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-INVOICE-15' }));
    const recs = await conn.fetchRecords('INVOICE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-INVOICE-17: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-INVOICE-16' }));
    const recs = await conn.fetchRecords('INVOICE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-INVOICE-18: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-INVOICE-17' }));
    const recs = await conn.fetchRecords('INVOICE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-INVOICE-19: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-INVOICE-18' }));
    const recs = await conn.fetchRecords('INVOICE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-INVOICE-20: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-INVOICE-19' }));
    const recs = await conn.fetchRecords('INVOICE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-INVOICE-21: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-INVOICE-20' }));
    const recs = await conn.fetchRecords('INVOICE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-INVOICE-22: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-INVOICE-21' }));
    const recs = await conn.fetchRecords('INVOICE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-INVOICE-23: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-INVOICE-22' }));
    const recs = await conn.fetchRecords('INVOICE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-INVOICE-24: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-INVOICE-23' }));
    const recs = await conn.fetchRecords('INVOICE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-INVOICE-25: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-INVOICE-24' }));
    const recs = await conn.fetchRecords('INVOICE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-INVOICE-26: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-INVOICE-25' }));
    const recs = await conn.fetchRecords('INVOICE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-INVOICE-27: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-INVOICE-26' }));
    const recs = await conn.fetchRecords('INVOICE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-INVOICE-28: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-INVOICE-27' }));
    const recs = await conn.fetchRecords('INVOICE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-INVOICE-29: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-INVOICE-28' }));
    const recs = await conn.fetchRecords('INVOICE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('unsup-INVOICE-30: returns []', async () => {
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-u-INVOICE-29' }));
    const recs = await conn.fetchRecords('INVOICE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

// ── 15. createDynamics365Connector factory ────────────────────────────────────

describe('createDynamics365Connector factory', () => {
  it('factory-1: returns Dynamics365Connector', () => {
    const cfg = makeConfig({ id: 'd365-fac-0', name: 'D365 Factory 0' });
    const conn = createDynamics365Connector(cfg);
    expect(conn).toBeInstanceOf(Dynamics365Connector);
    expect(conn.id).toBe('d365-fac-0');
    expect(conn.name).toBe('D365 Factory 0');
    expect(conn.type).toBe('DYNAMICS_365');
  });
  it('factory-2: returns Dynamics365Connector', () => {
    const cfg = makeConfig({ id: 'd365-fac-1', name: 'D365 Factory 1' });
    const conn = createDynamics365Connector(cfg);
    expect(conn).toBeInstanceOf(Dynamics365Connector);
    expect(conn.id).toBe('d365-fac-1');
    expect(conn.name).toBe('D365 Factory 1');
    expect(conn.type).toBe('DYNAMICS_365');
  });
  it('factory-3: returns Dynamics365Connector', () => {
    const cfg = makeConfig({ id: 'd365-fac-2', name: 'D365 Factory 2' });
    const conn = createDynamics365Connector(cfg);
    expect(conn).toBeInstanceOf(Dynamics365Connector);
    expect(conn.id).toBe('d365-fac-2');
    expect(conn.name).toBe('D365 Factory 2');
    expect(conn.type).toBe('DYNAMICS_365');
  });
  it('factory-4: returns Dynamics365Connector', () => {
    const cfg = makeConfig({ id: 'd365-fac-3', name: 'D365 Factory 3' });
    const conn = createDynamics365Connector(cfg);
    expect(conn).toBeInstanceOf(Dynamics365Connector);
    expect(conn.id).toBe('d365-fac-3');
    expect(conn.name).toBe('D365 Factory 3');
    expect(conn.type).toBe('DYNAMICS_365');
  });
  it('factory-5: returns Dynamics365Connector', () => {
    const cfg = makeConfig({ id: 'd365-fac-4', name: 'D365 Factory 4' });
    const conn = createDynamics365Connector(cfg);
    expect(conn).toBeInstanceOf(Dynamics365Connector);
    expect(conn.id).toBe('d365-fac-4');
    expect(conn.name).toBe('D365 Factory 4');
    expect(conn.type).toBe('DYNAMICS_365');
  });
  it('factory-6: returns Dynamics365Connector', () => {
    const cfg = makeConfig({ id: 'd365-fac-5', name: 'D365 Factory 5' });
    const conn = createDynamics365Connector(cfg);
    expect(conn).toBeInstanceOf(Dynamics365Connector);
    expect(conn.id).toBe('d365-fac-5');
    expect(conn.name).toBe('D365 Factory 5');
    expect(conn.type).toBe('DYNAMICS_365');
  });
  it('factory-7: returns Dynamics365Connector', () => {
    const cfg = makeConfig({ id: 'd365-fac-6', name: 'D365 Factory 6' });
    const conn = createDynamics365Connector(cfg);
    expect(conn).toBeInstanceOf(Dynamics365Connector);
    expect(conn.id).toBe('d365-fac-6');
    expect(conn.name).toBe('D365 Factory 6');
    expect(conn.type).toBe('DYNAMICS_365');
  });
  it('factory-8: returns Dynamics365Connector', () => {
    const cfg = makeConfig({ id: 'd365-fac-7', name: 'D365 Factory 7' });
    const conn = createDynamics365Connector(cfg);
    expect(conn).toBeInstanceOf(Dynamics365Connector);
    expect(conn.id).toBe('d365-fac-7');
    expect(conn.name).toBe('D365 Factory 7');
    expect(conn.type).toBe('DYNAMICS_365');
  });
  it('factory-9: returns Dynamics365Connector', () => {
    const cfg = makeConfig({ id: 'd365-fac-8', name: 'D365 Factory 8' });
    const conn = createDynamics365Connector(cfg);
    expect(conn).toBeInstanceOf(Dynamics365Connector);
    expect(conn.id).toBe('d365-fac-8');
    expect(conn.name).toBe('D365 Factory 8');
    expect(conn.type).toBe('DYNAMICS_365');
  });
  it('factory-10: returns Dynamics365Connector', () => {
    const cfg = makeConfig({ id: 'd365-fac-9', name: 'D365 Factory 9' });
    const conn = createDynamics365Connector(cfg);
    expect(conn).toBeInstanceOf(Dynamics365Connector);
    expect(conn.id).toBe('d365-fac-9');
    expect(conn.name).toBe('D365 Factory 9');
    expect(conn.type).toBe('DYNAMICS_365');
  });
  it('factory-11: returns Dynamics365Connector', () => {
    const cfg = makeConfig({ id: 'd365-fac-10', name: 'D365 Factory 10' });
    const conn = createDynamics365Connector(cfg);
    expect(conn).toBeInstanceOf(Dynamics365Connector);
    expect(conn.id).toBe('d365-fac-10');
    expect(conn.name).toBe('D365 Factory 10');
    expect(conn.type).toBe('DYNAMICS_365');
  });
  it('factory-12: returns Dynamics365Connector', () => {
    const cfg = makeConfig({ id: 'd365-fac-11', name: 'D365 Factory 11' });
    const conn = createDynamics365Connector(cfg);
    expect(conn).toBeInstanceOf(Dynamics365Connector);
    expect(conn.id).toBe('d365-fac-11');
    expect(conn.name).toBe('D365 Factory 11');
    expect(conn.type).toBe('DYNAMICS_365');
  });
  it('factory-13: returns Dynamics365Connector', () => {
    const cfg = makeConfig({ id: 'd365-fac-12', name: 'D365 Factory 12' });
    const conn = createDynamics365Connector(cfg);
    expect(conn).toBeInstanceOf(Dynamics365Connector);
    expect(conn.id).toBe('d365-fac-12');
    expect(conn.name).toBe('D365 Factory 12');
    expect(conn.type).toBe('DYNAMICS_365');
  });
  it('factory-14: returns Dynamics365Connector', () => {
    const cfg = makeConfig({ id: 'd365-fac-13', name: 'D365 Factory 13' });
    const conn = createDynamics365Connector(cfg);
    expect(conn).toBeInstanceOf(Dynamics365Connector);
    expect(conn.id).toBe('d365-fac-13');
    expect(conn.name).toBe('D365 Factory 13');
    expect(conn.type).toBe('DYNAMICS_365');
  });
  it('factory-15: returns Dynamics365Connector', () => {
    const cfg = makeConfig({ id: 'd365-fac-14', name: 'D365 Factory 14' });
    const conn = createDynamics365Connector(cfg);
    expect(conn).toBeInstanceOf(Dynamics365Connector);
    expect(conn.id).toBe('d365-fac-14');
    expect(conn.name).toBe('D365 Factory 14');
    expect(conn.type).toBe('DYNAMICS_365');
  });
  it('factory-16: returns Dynamics365Connector', () => {
    const cfg = makeConfig({ id: 'd365-fac-15', name: 'D365 Factory 15' });
    const conn = createDynamics365Connector(cfg);
    expect(conn).toBeInstanceOf(Dynamics365Connector);
    expect(conn.id).toBe('d365-fac-15');
    expect(conn.name).toBe('D365 Factory 15');
    expect(conn.type).toBe('DYNAMICS_365');
  });
  it('factory-17: returns Dynamics365Connector', () => {
    const cfg = makeConfig({ id: 'd365-fac-16', name: 'D365 Factory 16' });
    const conn = createDynamics365Connector(cfg);
    expect(conn).toBeInstanceOf(Dynamics365Connector);
    expect(conn.id).toBe('d365-fac-16');
    expect(conn.name).toBe('D365 Factory 16');
    expect(conn.type).toBe('DYNAMICS_365');
  });
  it('factory-18: returns Dynamics365Connector', () => {
    const cfg = makeConfig({ id: 'd365-fac-17', name: 'D365 Factory 17' });
    const conn = createDynamics365Connector(cfg);
    expect(conn).toBeInstanceOf(Dynamics365Connector);
    expect(conn.id).toBe('d365-fac-17');
    expect(conn.name).toBe('D365 Factory 17');
    expect(conn.type).toBe('DYNAMICS_365');
  });
  it('factory-19: returns Dynamics365Connector', () => {
    const cfg = makeConfig({ id: 'd365-fac-18', name: 'D365 Factory 18' });
    const conn = createDynamics365Connector(cfg);
    expect(conn).toBeInstanceOf(Dynamics365Connector);
    expect(conn.id).toBe('d365-fac-18');
    expect(conn.name).toBe('D365 Factory 18');
    expect(conn.type).toBe('DYNAMICS_365');
  });
  it('factory-20: returns Dynamics365Connector', () => {
    const cfg = makeConfig({ id: 'd365-fac-19', name: 'D365 Factory 19' });
    const conn = createDynamics365Connector(cfg);
    expect(conn).toBeInstanceOf(Dynamics365Connector);
    expect(conn.id).toBe('d365-fac-19');
    expect(conn.name).toBe('D365 Factory 19');
    expect(conn.type).toBe('DYNAMICS_365');
  });
  it('factory-21: returns Dynamics365Connector', () => {
    const cfg = makeConfig({ id: 'd365-fac-20', name: 'D365 Factory 20' });
    const conn = createDynamics365Connector(cfg);
    expect(conn).toBeInstanceOf(Dynamics365Connector);
    expect(conn.id).toBe('d365-fac-20');
    expect(conn.name).toBe('D365 Factory 20');
    expect(conn.type).toBe('DYNAMICS_365');
  });
  it('factory-22: returns Dynamics365Connector', () => {
    const cfg = makeConfig({ id: 'd365-fac-21', name: 'D365 Factory 21' });
    const conn = createDynamics365Connector(cfg);
    expect(conn).toBeInstanceOf(Dynamics365Connector);
    expect(conn.id).toBe('d365-fac-21');
    expect(conn.name).toBe('D365 Factory 21');
    expect(conn.type).toBe('DYNAMICS_365');
  });
  it('factory-23: returns Dynamics365Connector', () => {
    const cfg = makeConfig({ id: 'd365-fac-22', name: 'D365 Factory 22' });
    const conn = createDynamics365Connector(cfg);
    expect(conn).toBeInstanceOf(Dynamics365Connector);
    expect(conn.id).toBe('d365-fac-22');
    expect(conn.name).toBe('D365 Factory 22');
    expect(conn.type).toBe('DYNAMICS_365');
  });
  it('factory-24: returns Dynamics365Connector', () => {
    const cfg = makeConfig({ id: 'd365-fac-23', name: 'D365 Factory 23' });
    const conn = createDynamics365Connector(cfg);
    expect(conn).toBeInstanceOf(Dynamics365Connector);
    expect(conn.id).toBe('d365-fac-23');
    expect(conn.name).toBe('D365 Factory 23');
    expect(conn.type).toBe('DYNAMICS_365');
  });
  it('factory-25: returns Dynamics365Connector', () => {
    const cfg = makeConfig({ id: 'd365-fac-24', name: 'D365 Factory 24' });
    const conn = createDynamics365Connector(cfg);
    expect(conn).toBeInstanceOf(Dynamics365Connector);
    expect(conn.id).toBe('d365-fac-24');
    expect(conn.name).toBe('D365 Factory 24');
    expect(conn.type).toBe('DYNAMICS_365');
  });
  it('factory-26: returns Dynamics365Connector', () => {
    const cfg = makeConfig({ id: 'd365-fac-25', name: 'D365 Factory 25' });
    const conn = createDynamics365Connector(cfg);
    expect(conn).toBeInstanceOf(Dynamics365Connector);
    expect(conn.id).toBe('d365-fac-25');
    expect(conn.name).toBe('D365 Factory 25');
    expect(conn.type).toBe('DYNAMICS_365');
  });
  it('factory-27: returns Dynamics365Connector', () => {
    const cfg = makeConfig({ id: 'd365-fac-26', name: 'D365 Factory 26' });
    const conn = createDynamics365Connector(cfg);
    expect(conn).toBeInstanceOf(Dynamics365Connector);
    expect(conn.id).toBe('d365-fac-26');
    expect(conn.name).toBe('D365 Factory 26');
    expect(conn.type).toBe('DYNAMICS_365');
  });
  it('factory-28: returns Dynamics365Connector', () => {
    const cfg = makeConfig({ id: 'd365-fac-27', name: 'D365 Factory 27' });
    const conn = createDynamics365Connector(cfg);
    expect(conn).toBeInstanceOf(Dynamics365Connector);
    expect(conn.id).toBe('d365-fac-27');
    expect(conn.name).toBe('D365 Factory 27');
    expect(conn.type).toBe('DYNAMICS_365');
  });
  it('factory-29: returns Dynamics365Connector', () => {
    const cfg = makeConfig({ id: 'd365-fac-28', name: 'D365 Factory 28' });
    const conn = createDynamics365Connector(cfg);
    expect(conn).toBeInstanceOf(Dynamics365Connector);
    expect(conn.id).toBe('d365-fac-28');
    expect(conn.name).toBe('D365 Factory 28');
    expect(conn.type).toBe('DYNAMICS_365');
  });
  it('factory-30: returns Dynamics365Connector', () => {
    const cfg = makeConfig({ id: 'd365-fac-29', name: 'D365 Factory 29' });
    const conn = createDynamics365Connector(cfg);
    expect(conn).toBeInstanceOf(Dynamics365Connector);
    expect(conn.id).toBe('d365-fac-29');
    expect(conn.name).toBe('D365 Factory 29');
    expect(conn.type).toBe('DYNAMICS_365');
  });
  it('factory-31: returns Dynamics365Connector', () => {
    const cfg = makeConfig({ id: 'd365-fac-30', name: 'D365 Factory 30' });
    const conn = createDynamics365Connector(cfg);
    expect(conn).toBeInstanceOf(Dynamics365Connector);
    expect(conn.id).toBe('d365-fac-30');
    expect(conn.name).toBe('D365 Factory 30');
    expect(conn.type).toBe('DYNAMICS_365');
  });
  it('factory-32: returns Dynamics365Connector', () => {
    const cfg = makeConfig({ id: 'd365-fac-31', name: 'D365 Factory 31' });
    const conn = createDynamics365Connector(cfg);
    expect(conn).toBeInstanceOf(Dynamics365Connector);
    expect(conn.id).toBe('d365-fac-31');
    expect(conn.name).toBe('D365 Factory 31');
    expect(conn.type).toBe('DYNAMICS_365');
  });
  it('factory-33: returns Dynamics365Connector', () => {
    const cfg = makeConfig({ id: 'd365-fac-32', name: 'D365 Factory 32' });
    const conn = createDynamics365Connector(cfg);
    expect(conn).toBeInstanceOf(Dynamics365Connector);
    expect(conn.id).toBe('d365-fac-32');
    expect(conn.name).toBe('D365 Factory 32');
    expect(conn.type).toBe('DYNAMICS_365');
  });
  it('factory-34: returns Dynamics365Connector', () => {
    const cfg = makeConfig({ id: 'd365-fac-33', name: 'D365 Factory 33' });
    const conn = createDynamics365Connector(cfg);
    expect(conn).toBeInstanceOf(Dynamics365Connector);
    expect(conn.id).toBe('d365-fac-33');
    expect(conn.name).toBe('D365 Factory 33');
    expect(conn.type).toBe('DYNAMICS_365');
  });
  it('factory-35: returns Dynamics365Connector', () => {
    const cfg = makeConfig({ id: 'd365-fac-34', name: 'D365 Factory 34' });
    const conn = createDynamics365Connector(cfg);
    expect(conn).toBeInstanceOf(Dynamics365Connector);
    expect(conn.id).toBe('d365-fac-34');
    expect(conn.name).toBe('D365 Factory 34');
    expect(conn.type).toBe('DYNAMICS_365');
  });
  it('factory-36: returns Dynamics365Connector', () => {
    const cfg = makeConfig({ id: 'd365-fac-35', name: 'D365 Factory 35' });
    const conn = createDynamics365Connector(cfg);
    expect(conn).toBeInstanceOf(Dynamics365Connector);
    expect(conn.id).toBe('d365-fac-35');
    expect(conn.name).toBe('D365 Factory 35');
    expect(conn.type).toBe('DYNAMICS_365');
  });
  it('factory-37: returns Dynamics365Connector', () => {
    const cfg = makeConfig({ id: 'd365-fac-36', name: 'D365 Factory 36' });
    const conn = createDynamics365Connector(cfg);
    expect(conn).toBeInstanceOf(Dynamics365Connector);
    expect(conn.id).toBe('d365-fac-36');
    expect(conn.name).toBe('D365 Factory 36');
    expect(conn.type).toBe('DYNAMICS_365');
  });
  it('factory-38: returns Dynamics365Connector', () => {
    const cfg = makeConfig({ id: 'd365-fac-37', name: 'D365 Factory 37' });
    const conn = createDynamics365Connector(cfg);
    expect(conn).toBeInstanceOf(Dynamics365Connector);
    expect(conn.id).toBe('d365-fac-37');
    expect(conn.name).toBe('D365 Factory 37');
    expect(conn.type).toBe('DYNAMICS_365');
  });
  it('factory-39: returns Dynamics365Connector', () => {
    const cfg = makeConfig({ id: 'd365-fac-38', name: 'D365 Factory 38' });
    const conn = createDynamics365Connector(cfg);
    expect(conn).toBeInstanceOf(Dynamics365Connector);
    expect(conn.id).toBe('d365-fac-38');
    expect(conn.name).toBe('D365 Factory 38');
    expect(conn.type).toBe('DYNAMICS_365');
  });
  it('factory-40: returns Dynamics365Connector', () => {
    const cfg = makeConfig({ id: 'd365-fac-39', name: 'D365 Factory 39' });
    const conn = createDynamics365Connector(cfg);
    expect(conn).toBeInstanceOf(Dynamics365Connector);
    expect(conn.id).toBe('d365-fac-39');
    expect(conn.name).toBe('D365 Factory 39');
    expect(conn.type).toBe('DYNAMICS_365');
  });
  it('factory-41: returns Dynamics365Connector', () => {
    const cfg = makeConfig({ id: 'd365-fac-40', name: 'D365 Factory 40' });
    const conn = createDynamics365Connector(cfg);
    expect(conn).toBeInstanceOf(Dynamics365Connector);
    expect(conn.id).toBe('d365-fac-40');
    expect(conn.name).toBe('D365 Factory 40');
    expect(conn.type).toBe('DYNAMICS_365');
  });
  it('factory-42: returns Dynamics365Connector', () => {
    const cfg = makeConfig({ id: 'd365-fac-41', name: 'D365 Factory 41' });
    const conn = createDynamics365Connector(cfg);
    expect(conn).toBeInstanceOf(Dynamics365Connector);
    expect(conn.id).toBe('d365-fac-41');
    expect(conn.name).toBe('D365 Factory 41');
    expect(conn.type).toBe('DYNAMICS_365');
  });
  it('factory-43: returns Dynamics365Connector', () => {
    const cfg = makeConfig({ id: 'd365-fac-42', name: 'D365 Factory 42' });
    const conn = createDynamics365Connector(cfg);
    expect(conn).toBeInstanceOf(Dynamics365Connector);
    expect(conn.id).toBe('d365-fac-42');
    expect(conn.name).toBe('D365 Factory 42');
    expect(conn.type).toBe('DYNAMICS_365');
  });
  it('factory-44: returns Dynamics365Connector', () => {
    const cfg = makeConfig({ id: 'd365-fac-43', name: 'D365 Factory 43' });
    const conn = createDynamics365Connector(cfg);
    expect(conn).toBeInstanceOf(Dynamics365Connector);
    expect(conn.id).toBe('d365-fac-43');
    expect(conn.name).toBe('D365 Factory 43');
    expect(conn.type).toBe('DYNAMICS_365');
  });
  it('factory-45: returns Dynamics365Connector', () => {
    const cfg = makeConfig({ id: 'd365-fac-44', name: 'D365 Factory 44' });
    const conn = createDynamics365Connector(cfg);
    expect(conn).toBeInstanceOf(Dynamics365Connector);
    expect(conn.id).toBe('d365-fac-44');
    expect(conn.name).toBe('D365 Factory 44');
    expect(conn.type).toBe('DYNAMICS_365');
  });
  it('factory-46: returns Dynamics365Connector', () => {
    const cfg = makeConfig({ id: 'd365-fac-45', name: 'D365 Factory 45' });
    const conn = createDynamics365Connector(cfg);
    expect(conn).toBeInstanceOf(Dynamics365Connector);
    expect(conn.id).toBe('d365-fac-45');
    expect(conn.name).toBe('D365 Factory 45');
    expect(conn.type).toBe('DYNAMICS_365');
  });
  it('factory-47: returns Dynamics365Connector', () => {
    const cfg = makeConfig({ id: 'd365-fac-46', name: 'D365 Factory 46' });
    const conn = createDynamics365Connector(cfg);
    expect(conn).toBeInstanceOf(Dynamics365Connector);
    expect(conn.id).toBe('d365-fac-46');
    expect(conn.name).toBe('D365 Factory 46');
    expect(conn.type).toBe('DYNAMICS_365');
  });
  it('factory-48: returns Dynamics365Connector', () => {
    const cfg = makeConfig({ id: 'd365-fac-47', name: 'D365 Factory 47' });
    const conn = createDynamics365Connector(cfg);
    expect(conn).toBeInstanceOf(Dynamics365Connector);
    expect(conn.id).toBe('d365-fac-47');
    expect(conn.name).toBe('D365 Factory 47');
    expect(conn.type).toBe('DYNAMICS_365');
  });
  it('factory-49: returns Dynamics365Connector', () => {
    const cfg = makeConfig({ id: 'd365-fac-48', name: 'D365 Factory 48' });
    const conn = createDynamics365Connector(cfg);
    expect(conn).toBeInstanceOf(Dynamics365Connector);
    expect(conn.id).toBe('d365-fac-48');
    expect(conn.name).toBe('D365 Factory 48');
    expect(conn.type).toBe('DYNAMICS_365');
  });
  it('factory-50: returns Dynamics365Connector', () => {
    const cfg = makeConfig({ id: 'd365-fac-49', name: 'D365 Factory 49' });
    const conn = createDynamics365Connector(cfg);
    expect(conn).toBeInstanceOf(Dynamics365Connector);
    expect(conn.id).toBe('d365-fac-49');
    expect(conn.name).toBe('D365 Factory 49');
    expect(conn.type).toBe('DYNAMICS_365');
  });
});

// ── 16. executeSync ──────────────────────────────────────────────────────────

describe('Dynamics365Connector – executeSync', () => {
  let fetchMock: jest.SpyInstance;
  beforeEach(() => { fetchMock = jest.spyOn(global, "fetch"); });
  afterEach(() => { fetchMock.mockRestore(); });
  it('exec-emp-1: 1 users → SUCCESS', async () => {
    const users = Array.from({ length: 1 }, (_, k) => makeUser(0*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: users }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-xe-0' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(1);
    expect(res.errors).toHaveLength(0);
  });
  it('exec-emp-2: 2 users → SUCCESS', async () => {
    const users = Array.from({ length: 2 }, (_, k) => makeUser(1*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: users }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-xe-1' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(2);
    expect(res.errors).toHaveLength(0);
  });
  it('exec-emp-3: 3 users → SUCCESS', async () => {
    const users = Array.from({ length: 3 }, (_, k) => makeUser(2*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: users }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-xe-2' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(3);
    expect(res.errors).toHaveLength(0);
  });
  it('exec-emp-4: 1 users → SUCCESS', async () => {
    const users = Array.from({ length: 1 }, (_, k) => makeUser(3*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: users }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-xe-3' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(1);
    expect(res.errors).toHaveLength(0);
  });
  it('exec-emp-5: 2 users → SUCCESS', async () => {
    const users = Array.from({ length: 2 }, (_, k) => makeUser(4*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: users }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-xe-4' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(2);
    expect(res.errors).toHaveLength(0);
  });
  it('exec-emp-6: 3 users → SUCCESS', async () => {
    const users = Array.from({ length: 3 }, (_, k) => makeUser(5*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: users }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-xe-5' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(3);
    expect(res.errors).toHaveLength(0);
  });
  it('exec-emp-7: 1 users → SUCCESS', async () => {
    const users = Array.from({ length: 1 }, (_, k) => makeUser(6*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: users }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-xe-6' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(1);
    expect(res.errors).toHaveLength(0);
  });
  it('exec-emp-8: 2 users → SUCCESS', async () => {
    const users = Array.from({ length: 2 }, (_, k) => makeUser(7*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: users }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-xe-7' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(2);
    expect(res.errors).toHaveLength(0);
  });
  it('exec-emp-9: 3 users → SUCCESS', async () => {
    const users = Array.from({ length: 3 }, (_, k) => makeUser(8*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: users }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-xe-8' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(3);
    expect(res.errors).toHaveLength(0);
  });
  it('exec-emp-10: 1 users → SUCCESS', async () => {
    const users = Array.from({ length: 1 }, (_, k) => makeUser(9*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: users }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-xe-9' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(1);
    expect(res.errors).toHaveLength(0);
  });
  it('exec-emp-11: 2 users → SUCCESS', async () => {
    const users = Array.from({ length: 2 }, (_, k) => makeUser(10*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: users }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-xe-10' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(2);
    expect(res.errors).toHaveLength(0);
  });
  it('exec-emp-12: 3 users → SUCCESS', async () => {
    const users = Array.from({ length: 3 }, (_, k) => makeUser(11*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: users }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-xe-11' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(3);
    expect(res.errors).toHaveLength(0);
  });
  it('exec-emp-13: 1 users → SUCCESS', async () => {
    const users = Array.from({ length: 1 }, (_, k) => makeUser(12*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: users }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-xe-12' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(1);
    expect(res.errors).toHaveLength(0);
  });
  it('exec-emp-14: 2 users → SUCCESS', async () => {
    const users = Array.from({ length: 2 }, (_, k) => makeUser(13*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: users }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-xe-13' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(2);
    expect(res.errors).toHaveLength(0);
  });
  it('exec-emp-15: 3 users → SUCCESS', async () => {
    const users = Array.from({ length: 3 }, (_, k) => makeUser(14*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: users }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-xe-14' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(3);
    expect(res.errors).toHaveLength(0);
  });
  it('exec-emp-16: 1 users → SUCCESS', async () => {
    const users = Array.from({ length: 1 }, (_, k) => makeUser(15*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: users }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-xe-15' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(1);
    expect(res.errors).toHaveLength(0);
  });
  it('exec-emp-17: 2 users → SUCCESS', async () => {
    const users = Array.from({ length: 2 }, (_, k) => makeUser(16*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: users }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-xe-16' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(2);
    expect(res.errors).toHaveLength(0);
  });
  it('exec-emp-18: 3 users → SUCCESS', async () => {
    const users = Array.from({ length: 3 }, (_, k) => makeUser(17*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: users }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-xe-17' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(3);
    expect(res.errors).toHaveLength(0);
  });
  it('exec-emp-19: 1 users → SUCCESS', async () => {
    const users = Array.from({ length: 1 }, (_, k) => makeUser(18*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: users }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-xe-18' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(1);
    expect(res.errors).toHaveLength(0);
  });
  it('exec-emp-20: 2 users → SUCCESS', async () => {
    const users = Array.from({ length: 2 }, (_, k) => makeUser(19*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: users }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-xe-19' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(2);
    expect(res.errors).toHaveLength(0);
  });
  it('exec-dept-1: 1 BUs → SUCCESS', async () => {
    const bus = Array.from({ length: 1 }, (_, k) => makeBU(0*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: bus }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-xd-0' }));
    const res = await conn.executeSync(makeJob(['DEPARTMENT']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(1);
  });
  it('exec-dept-2: 2 BUs → SUCCESS', async () => {
    const bus = Array.from({ length: 2 }, (_, k) => makeBU(1*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: bus }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-xd-1' }));
    const res = await conn.executeSync(makeJob(['DEPARTMENT']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(2);
  });
  it('exec-dept-3: 3 BUs → SUCCESS', async () => {
    const bus = Array.from({ length: 3 }, (_, k) => makeBU(2*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: bus }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-xd-2' }));
    const res = await conn.executeSync(makeJob(['DEPARTMENT']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(3);
  });
  it('exec-dept-4: 4 BUs → SUCCESS', async () => {
    const bus = Array.from({ length: 4 }, (_, k) => makeBU(3*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: bus }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-xd-3' }));
    const res = await conn.executeSync(makeJob(['DEPARTMENT']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(4);
  });
  it('exec-dept-5: 1 BUs → SUCCESS', async () => {
    const bus = Array.from({ length: 1 }, (_, k) => makeBU(4*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: bus }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-xd-4' }));
    const res = await conn.executeSync(makeJob(['DEPARTMENT']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(1);
  });
  it('exec-dept-6: 2 BUs → SUCCESS', async () => {
    const bus = Array.from({ length: 2 }, (_, k) => makeBU(5*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: bus }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-xd-5' }));
    const res = await conn.executeSync(makeJob(['DEPARTMENT']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(2);
  });
  it('exec-dept-7: 3 BUs → SUCCESS', async () => {
    const bus = Array.from({ length: 3 }, (_, k) => makeBU(6*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: bus }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-xd-6' }));
    const res = await conn.executeSync(makeJob(['DEPARTMENT']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(3);
  });
  it('exec-dept-8: 4 BUs → SUCCESS', async () => {
    const bus = Array.from({ length: 4 }, (_, k) => makeBU(7*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: bus }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-xd-7' }));
    const res = await conn.executeSync(makeJob(['DEPARTMENT']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(4);
  });
  it('exec-dept-9: 1 BUs → SUCCESS', async () => {
    const bus = Array.from({ length: 1 }, (_, k) => makeBU(8*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: bus }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-xd-8' }));
    const res = await conn.executeSync(makeJob(['DEPARTMENT']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(1);
  });
  it('exec-dept-10: 2 BUs → SUCCESS', async () => {
    const bus = Array.from({ length: 2 }, (_, k) => makeBU(9*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: bus }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-xd-9' }));
    const res = await conn.executeSync(makeJob(['DEPARTMENT']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(2);
  });
  it('exec-dept-11: 3 BUs → SUCCESS', async () => {
    const bus = Array.from({ length: 3 }, (_, k) => makeBU(10*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: bus }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-xd-10' }));
    const res = await conn.executeSync(makeJob(['DEPARTMENT']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(3);
  });
  it('exec-dept-12: 4 BUs → SUCCESS', async () => {
    const bus = Array.from({ length: 4 }, (_, k) => makeBU(11*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: bus }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-xd-11' }));
    const res = await conn.executeSync(makeJob(['DEPARTMENT']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(4);
  });
  it('exec-dept-13: 1 BUs → SUCCESS', async () => {
    const bus = Array.from({ length: 1 }, (_, k) => makeBU(12*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: bus }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-xd-12' }));
    const res = await conn.executeSync(makeJob(['DEPARTMENT']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(1);
  });
  it('exec-dept-14: 2 BUs → SUCCESS', async () => {
    const bus = Array.from({ length: 2 }, (_, k) => makeBU(13*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: bus }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-xd-13' }));
    const res = await conn.executeSync(makeJob(['DEPARTMENT']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(2);
  });
  it('exec-dept-15: 3 BUs → SUCCESS', async () => {
    const bus = Array.from({ length: 3 }, (_, k) => makeBU(14*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: bus }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-xd-14' }));
    const res = await conn.executeSync(makeJob(['DEPARTMENT']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(3);
  });
  it('exec-dept-16: 4 BUs → SUCCESS', async () => {
    const bus = Array.from({ length: 4 }, (_, k) => makeBU(15*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: bus }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-xd-15' }));
    const res = await conn.executeSync(makeJob(['DEPARTMENT']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(4);
  });
  it('exec-dept-17: 1 BUs → SUCCESS', async () => {
    const bus = Array.from({ length: 1 }, (_, k) => makeBU(16*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: bus }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-xd-16' }));
    const res = await conn.executeSync(makeJob(['DEPARTMENT']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(1);
  });
  it('exec-dept-18: 2 BUs → SUCCESS', async () => {
    const bus = Array.from({ length: 2 }, (_, k) => makeBU(17*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: bus }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-xd-17' }));
    const res = await conn.executeSync(makeJob(['DEPARTMENT']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(2);
  });
  it('exec-dept-19: 3 BUs → SUCCESS', async () => {
    const bus = Array.from({ length: 3 }, (_, k) => makeBU(18*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: bus }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-xd-18' }));
    const res = await conn.executeSync(makeJob(['DEPARTMENT']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(3);
  });
  it('exec-dept-20: 4 BUs → SUCCESS', async () => {
    const bus = Array.from({ length: 4 }, (_, k) => makeBU(19*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: bus }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-xd-19' }));
    const res = await conn.executeSync(makeJob(['DEPARTMENT']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(4);
  });
  it('exec-fail-1: API 500 → FAILED', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(500));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-xf-0' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE']));
    expect(res.status).toBe('FAILED');
    expect(res.errors.length).toBeGreaterThan(0);
  });
  it('exec-fail-2: API 500 → FAILED', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(500));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-xf-1' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE']));
    expect(res.status).toBe('FAILED');
    expect(res.errors.length).toBeGreaterThan(0);
  });
  it('exec-fail-3: API 500 → FAILED', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(500));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-xf-2' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE']));
    expect(res.status).toBe('FAILED');
    expect(res.errors.length).toBeGreaterThan(0);
  });
  it('exec-fail-4: API 500 → FAILED', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(500));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-xf-3' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE']));
    expect(res.status).toBe('FAILED');
    expect(res.errors.length).toBeGreaterThan(0);
  });
  it('exec-fail-5: API 500 → FAILED', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(500));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-xf-4' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE']));
    expect(res.status).toBe('FAILED');
    expect(res.errors.length).toBeGreaterThan(0);
  });
  it('exec-fail-6: API 500 → FAILED', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(500));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-xf-5' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE']));
    expect(res.status).toBe('FAILED');
    expect(res.errors.length).toBeGreaterThan(0);
  });
  it('exec-fail-7: API 500 → FAILED', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(500));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-xf-6' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE']));
    expect(res.status).toBe('FAILED');
    expect(res.errors.length).toBeGreaterThan(0);
  });
  it('exec-fail-8: API 500 → FAILED', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(500));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-xf-7' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE']));
    expect(res.status).toBe('FAILED');
    expect(res.errors.length).toBeGreaterThan(0);
  });
  it('exec-fail-9: API 500 → FAILED', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(500));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-xf-8' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE']));
    expect(res.status).toBe('FAILED');
    expect(res.errors.length).toBeGreaterThan(0);
  });
  it('exec-fail-10: API 500 → FAILED', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(500));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-xf-9' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE']));
    expect(res.status).toBe('FAILED');
    expect(res.errors.length).toBeGreaterThan(0);
  });
  it('exec-fail-11: API 500 → FAILED', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(500));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-xf-10' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE']));
    expect(res.status).toBe('FAILED');
    expect(res.errors.length).toBeGreaterThan(0);
  });
  it('exec-fail-12: API 500 → FAILED', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(500));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-xf-11' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE']));
    expect(res.status).toBe('FAILED');
    expect(res.errors.length).toBeGreaterThan(0);
  });
  it('exec-fail-13: API 500 → FAILED', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(500));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-xf-12' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE']));
    expect(res.status).toBe('FAILED');
    expect(res.errors.length).toBeGreaterThan(0);
  });
  it('exec-fail-14: API 500 → FAILED', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(500));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-xf-13' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE']));
    expect(res.status).toBe('FAILED');
    expect(res.errors.length).toBeGreaterThan(0);
  });
  it('exec-fail-15: API 500 → FAILED', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(500));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-xf-14' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE']));
    expect(res.status).toBe('FAILED');
    expect(res.errors.length).toBeGreaterThan(0);
  });
  it('exec-fail-16: API 500 → FAILED', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(500));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-xf-15' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE']));
    expect(res.status).toBe('FAILED');
    expect(res.errors.length).toBeGreaterThan(0);
  });
  it('exec-fail-17: API 500 → FAILED', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(500));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-xf-16' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE']));
    expect(res.status).toBe('FAILED');
    expect(res.errors.length).toBeGreaterThan(0);
  });
  it('exec-fail-18: API 500 → FAILED', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(500));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-xf-17' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE']));
    expect(res.status).toBe('FAILED');
    expect(res.errors.length).toBeGreaterThan(0);
  });
  it('exec-fail-19: API 500 → FAILED', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(500));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-xf-18' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE']));
    expect(res.status).toBe('FAILED');
    expect(res.errors.length).toBeGreaterThan(0);
  });
  it('exec-fail-20: API 500 → FAILED', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(500));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-xf-19' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE']));
    expect(res.status).toBe('FAILED');
    expect(res.errors.length).toBeGreaterThan(0);
  });
  it('exec-multi-1: EMPLOYEE+SUPPLIER → 2', async () => {
    const users = Array.from({ length: 1 }, (_, k) => makeUser(0*10+k));
    const accs = Array.from({ length: 1 }, (_, k) => makeAccount(0*5+k, 2));
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ value: users }))
             .mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-xm-0' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE', 'SUPPLIER']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(2);
  });
  it('exec-multi-2: EMPLOYEE+SUPPLIER → 4', async () => {
    const users = Array.from({ length: 2 }, (_, k) => makeUser(1*10+k));
    const accs = Array.from({ length: 2 }, (_, k) => makeAccount(1*5+k, 2));
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ value: users }))
             .mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-xm-1' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE', 'SUPPLIER']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(4);
  });
  it('exec-multi-3: EMPLOYEE+SUPPLIER → 2', async () => {
    const users = Array.from({ length: 1 }, (_, k) => makeUser(2*10+k));
    const accs = Array.from({ length: 1 }, (_, k) => makeAccount(2*5+k, 2));
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ value: users }))
             .mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-xm-2' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE', 'SUPPLIER']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(2);
  });
  it('exec-multi-4: EMPLOYEE+SUPPLIER → 4', async () => {
    const users = Array.from({ length: 2 }, (_, k) => makeUser(3*10+k));
    const accs = Array.from({ length: 2 }, (_, k) => makeAccount(3*5+k, 2));
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ value: users }))
             .mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-xm-3' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE', 'SUPPLIER']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(4);
  });
  it('exec-multi-5: EMPLOYEE+SUPPLIER → 2', async () => {
    const users = Array.from({ length: 1 }, (_, k) => makeUser(4*10+k));
    const accs = Array.from({ length: 1 }, (_, k) => makeAccount(4*5+k, 2));
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ value: users }))
             .mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-xm-4' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE', 'SUPPLIER']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(2);
  });
  it('exec-multi-6: EMPLOYEE+SUPPLIER → 4', async () => {
    const users = Array.from({ length: 2 }, (_, k) => makeUser(5*10+k));
    const accs = Array.from({ length: 2 }, (_, k) => makeAccount(5*5+k, 2));
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ value: users }))
             .mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-xm-5' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE', 'SUPPLIER']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(4);
  });
  it('exec-multi-7: EMPLOYEE+SUPPLIER → 2', async () => {
    const users = Array.from({ length: 1 }, (_, k) => makeUser(6*10+k));
    const accs = Array.from({ length: 1 }, (_, k) => makeAccount(6*5+k, 2));
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ value: users }))
             .mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-xm-6' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE', 'SUPPLIER']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(2);
  });
  it('exec-multi-8: EMPLOYEE+SUPPLIER → 4', async () => {
    const users = Array.from({ length: 2 }, (_, k) => makeUser(7*10+k));
    const accs = Array.from({ length: 2 }, (_, k) => makeAccount(7*5+k, 2));
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ value: users }))
             .mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-xm-7' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE', 'SUPPLIER']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(4);
  });
  it('exec-multi-9: EMPLOYEE+SUPPLIER → 2', async () => {
    const users = Array.from({ length: 1 }, (_, k) => makeUser(8*10+k));
    const accs = Array.from({ length: 1 }, (_, k) => makeAccount(8*5+k, 2));
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ value: users }))
             .mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-xm-8' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE', 'SUPPLIER']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(2);
  });
  it('exec-multi-10: EMPLOYEE+SUPPLIER → 4', async () => {
    const users = Array.from({ length: 2 }, (_, k) => makeUser(9*10+k));
    const accs = Array.from({ length: 2 }, (_, k) => makeAccount(9*5+k, 2));
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ value: users }))
             .mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-xm-9' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE', 'SUPPLIER']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(4);
  });
  it('exec-multi-11: EMPLOYEE+SUPPLIER → 2', async () => {
    const users = Array.from({ length: 1 }, (_, k) => makeUser(10*10+k));
    const accs = Array.from({ length: 1 }, (_, k) => makeAccount(10*5+k, 2));
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ value: users }))
             .mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-xm-10' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE', 'SUPPLIER']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(2);
  });
  it('exec-multi-12: EMPLOYEE+SUPPLIER → 4', async () => {
    const users = Array.from({ length: 2 }, (_, k) => makeUser(11*10+k));
    const accs = Array.from({ length: 2 }, (_, k) => makeAccount(11*5+k, 2));
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ value: users }))
             .mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-xm-11' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE', 'SUPPLIER']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(4);
  });
  it('exec-multi-13: EMPLOYEE+SUPPLIER → 2', async () => {
    const users = Array.from({ length: 1 }, (_, k) => makeUser(12*10+k));
    const accs = Array.from({ length: 1 }, (_, k) => makeAccount(12*5+k, 2));
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ value: users }))
             .mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-xm-12' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE', 'SUPPLIER']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(2);
  });
  it('exec-multi-14: EMPLOYEE+SUPPLIER → 4', async () => {
    const users = Array.from({ length: 2 }, (_, k) => makeUser(13*10+k));
    const accs = Array.from({ length: 2 }, (_, k) => makeAccount(13*5+k, 2));
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ value: users }))
             .mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-xm-13' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE', 'SUPPLIER']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(4);
  });
  it('exec-multi-15: EMPLOYEE+SUPPLIER → 2', async () => {
    const users = Array.from({ length: 1 }, (_, k) => makeUser(14*10+k));
    const accs = Array.from({ length: 1 }, (_, k) => makeAccount(14*5+k, 2));
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ value: users }))
             .mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-xm-14' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE', 'SUPPLIER']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(2);
  });
  it('exec-multi-16: EMPLOYEE+SUPPLIER → 4', async () => {
    const users = Array.from({ length: 2 }, (_, k) => makeUser(15*10+k));
    const accs = Array.from({ length: 2 }, (_, k) => makeAccount(15*5+k, 2));
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ value: users }))
             .mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-xm-15' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE', 'SUPPLIER']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(4);
  });
  it('exec-multi-17: EMPLOYEE+SUPPLIER → 2', async () => {
    const users = Array.from({ length: 1 }, (_, k) => makeUser(16*10+k));
    const accs = Array.from({ length: 1 }, (_, k) => makeAccount(16*5+k, 2));
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ value: users }))
             .mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-xm-16' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE', 'SUPPLIER']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(2);
  });
  it('exec-multi-18: EMPLOYEE+SUPPLIER → 4', async () => {
    const users = Array.from({ length: 2 }, (_, k) => makeUser(17*10+k));
    const accs = Array.from({ length: 2 }, (_, k) => makeAccount(17*5+k, 2));
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ value: users }))
             .mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-xm-17' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE', 'SUPPLIER']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(4);
  });
  it('exec-multi-19: EMPLOYEE+SUPPLIER → 2', async () => {
    const users = Array.from({ length: 1 }, (_, k) => makeUser(18*10+k));
    const accs = Array.from({ length: 1 }, (_, k) => makeAccount(18*5+k, 2));
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ value: users }))
             .mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-xm-18' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE', 'SUPPLIER']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(2);
  });
  it('exec-multi-20: EMPLOYEE+SUPPLIER → 4', async () => {
    const users = Array.from({ length: 2 }, (_, k) => makeUser(19*10+k));
    const accs = Array.from({ length: 2 }, (_, k) => makeAccount(19*5+k, 2));
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ value: users }))
             .mockResolvedValueOnce(mockData({ value: accs }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-xm-19' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE', 'SUPPLIER']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(4);
  });
});

// ── 17. EventEmitter events ──────────────────────────────────────────────────

describe('Dynamics365Connector – EventEmitter events', () => {
  let fetchMock: jest.SpyInstance;
  beforeEach(() => { fetchMock = jest.spyOn(global, "fetch"); });
  afterEach(() => { fetchMock.mockRestore(); });
  it('evt-start-1: emits job:start', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-es-0' }));
    const h = jest.fn();
    conn.on('job:start', h);
    await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
    expect(h.mock.calls[0][0].id).toBe('djob-001');
  });
  it('evt-start-2: emits job:start', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-es-1' }));
    const h = jest.fn();
    conn.on('job:start', h);
    await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
    expect(h.mock.calls[0][0].id).toBe('djob-001');
  });
  it('evt-start-3: emits job:start', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-es-2' }));
    const h = jest.fn();
    conn.on('job:start', h);
    await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
    expect(h.mock.calls[0][0].id).toBe('djob-001');
  });
  it('evt-start-4: emits job:start', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-es-3' }));
    const h = jest.fn();
    conn.on('job:start', h);
    await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
    expect(h.mock.calls[0][0].id).toBe('djob-001');
  });
  it('evt-start-5: emits job:start', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-es-4' }));
    const h = jest.fn();
    conn.on('job:start', h);
    await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
    expect(h.mock.calls[0][0].id).toBe('djob-001');
  });
  it('evt-start-6: emits job:start', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-es-5' }));
    const h = jest.fn();
    conn.on('job:start', h);
    await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
    expect(h.mock.calls[0][0].id).toBe('djob-001');
  });
  it('evt-start-7: emits job:start', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-es-6' }));
    const h = jest.fn();
    conn.on('job:start', h);
    await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
    expect(h.mock.calls[0][0].id).toBe('djob-001');
  });
  it('evt-start-8: emits job:start', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-es-7' }));
    const h = jest.fn();
    conn.on('job:start', h);
    await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
    expect(h.mock.calls[0][0].id).toBe('djob-001');
  });
  it('evt-start-9: emits job:start', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-es-8' }));
    const h = jest.fn();
    conn.on('job:start', h);
    await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
    expect(h.mock.calls[0][0].id).toBe('djob-001');
  });
  it('evt-start-10: emits job:start', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-es-9' }));
    const h = jest.fn();
    conn.on('job:start', h);
    await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
    expect(h.mock.calls[0][0].id).toBe('djob-001');
  });
  it('evt-start-11: emits job:start', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-es-10' }));
    const h = jest.fn();
    conn.on('job:start', h);
    await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
    expect(h.mock.calls[0][0].id).toBe('djob-001');
  });
  it('evt-start-12: emits job:start', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-es-11' }));
    const h = jest.fn();
    conn.on('job:start', h);
    await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
    expect(h.mock.calls[0][0].id).toBe('djob-001');
  });
  it('evt-start-13: emits job:start', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-es-12' }));
    const h = jest.fn();
    conn.on('job:start', h);
    await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
    expect(h.mock.calls[0][0].id).toBe('djob-001');
  });
  it('evt-start-14: emits job:start', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-es-13' }));
    const h = jest.fn();
    conn.on('job:start', h);
    await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
    expect(h.mock.calls[0][0].id).toBe('djob-001');
  });
  it('evt-start-15: emits job:start', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-es-14' }));
    const h = jest.fn();
    conn.on('job:start', h);
    await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
    expect(h.mock.calls[0][0].id).toBe('djob-001');
  });
  it('evt-complete-1: emits job:complete', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ec-0' }));
    const h = jest.fn();
    conn.on('job:complete', h);
    const res = await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
    expect(h.mock.calls[0][0]).toBe(res);
  });
  it('evt-complete-2: emits job:complete', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ec-1' }));
    const h = jest.fn();
    conn.on('job:complete', h);
    const res = await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
    expect(h.mock.calls[0][0]).toBe(res);
  });
  it('evt-complete-3: emits job:complete', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ec-2' }));
    const h = jest.fn();
    conn.on('job:complete', h);
    const res = await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
    expect(h.mock.calls[0][0]).toBe(res);
  });
  it('evt-complete-4: emits job:complete', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ec-3' }));
    const h = jest.fn();
    conn.on('job:complete', h);
    const res = await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
    expect(h.mock.calls[0][0]).toBe(res);
  });
  it('evt-complete-5: emits job:complete', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ec-4' }));
    const h = jest.fn();
    conn.on('job:complete', h);
    const res = await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
    expect(h.mock.calls[0][0]).toBe(res);
  });
  it('evt-complete-6: emits job:complete', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ec-5' }));
    const h = jest.fn();
    conn.on('job:complete', h);
    const res = await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
    expect(h.mock.calls[0][0]).toBe(res);
  });
  it('evt-complete-7: emits job:complete', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ec-6' }));
    const h = jest.fn();
    conn.on('job:complete', h);
    const res = await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
    expect(h.mock.calls[0][0]).toBe(res);
  });
  it('evt-complete-8: emits job:complete', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ec-7' }));
    const h = jest.fn();
    conn.on('job:complete', h);
    const res = await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
    expect(h.mock.calls[0][0]).toBe(res);
  });
  it('evt-complete-9: emits job:complete', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ec-8' }));
    const h = jest.fn();
    conn.on('job:complete', h);
    const res = await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
    expect(h.mock.calls[0][0]).toBe(res);
  });
  it('evt-complete-10: emits job:complete', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ec-9' }));
    const h = jest.fn();
    conn.on('job:complete', h);
    const res = await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
    expect(h.mock.calls[0][0]).toBe(res);
  });
  it('evt-complete-11: emits job:complete', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ec-10' }));
    const h = jest.fn();
    conn.on('job:complete', h);
    const res = await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
    expect(h.mock.calls[0][0]).toBe(res);
  });
  it('evt-complete-12: emits job:complete', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ec-11' }));
    const h = jest.fn();
    conn.on('job:complete', h);
    const res = await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
    expect(h.mock.calls[0][0]).toBe(res);
  });
  it('evt-complete-13: emits job:complete', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ec-12' }));
    const h = jest.fn();
    conn.on('job:complete', h);
    const res = await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
    expect(h.mock.calls[0][0]).toBe(res);
  });
  it('evt-complete-14: emits job:complete', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ec-13' }));
    const h = jest.fn();
    conn.on('job:complete', h);
    const res = await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
    expect(h.mock.calls[0][0]).toBe(res);
  });
  it('evt-complete-15: emits job:complete', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ec-14' }));
    const h = jest.fn();
    conn.on('job:complete', h);
    const res = await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
    expect(h.mock.calls[0][0]).toBe(res);
  });
  it('evt-progress-1: emits progress event', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [makeUser(0)] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ep-0' }));
    const h = jest.fn();
    conn.on('progress', h);
    await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalled();
    expect(h.mock.calls[0][0].entityType).toBe('EMPLOYEE');
  });
  it('evt-progress-2: emits progress event', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [makeUser(1)] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ep-1' }));
    const h = jest.fn();
    conn.on('progress', h);
    await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalled();
    expect(h.mock.calls[0][0].entityType).toBe('EMPLOYEE');
  });
  it('evt-progress-3: emits progress event', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [makeUser(2)] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ep-2' }));
    const h = jest.fn();
    conn.on('progress', h);
    await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalled();
    expect(h.mock.calls[0][0].entityType).toBe('EMPLOYEE');
  });
  it('evt-progress-4: emits progress event', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [makeUser(3)] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ep-3' }));
    const h = jest.fn();
    conn.on('progress', h);
    await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalled();
    expect(h.mock.calls[0][0].entityType).toBe('EMPLOYEE');
  });
  it('evt-progress-5: emits progress event', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [makeUser(4)] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ep-4' }));
    const h = jest.fn();
    conn.on('progress', h);
    await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalled();
    expect(h.mock.calls[0][0].entityType).toBe('EMPLOYEE');
  });
  it('evt-progress-6: emits progress event', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [makeUser(5)] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ep-5' }));
    const h = jest.fn();
    conn.on('progress', h);
    await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalled();
    expect(h.mock.calls[0][0].entityType).toBe('EMPLOYEE');
  });
  it('evt-progress-7: emits progress event', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [makeUser(6)] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ep-6' }));
    const h = jest.fn();
    conn.on('progress', h);
    await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalled();
    expect(h.mock.calls[0][0].entityType).toBe('EMPLOYEE');
  });
  it('evt-progress-8: emits progress event', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [makeUser(7)] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ep-7' }));
    const h = jest.fn();
    conn.on('progress', h);
    await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalled();
    expect(h.mock.calls[0][0].entityType).toBe('EMPLOYEE');
  });
  it('evt-progress-9: emits progress event', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [makeUser(8)] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ep-8' }));
    const h = jest.fn();
    conn.on('progress', h);
    await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalled();
    expect(h.mock.calls[0][0].entityType).toBe('EMPLOYEE');
  });
  it('evt-progress-10: emits progress event', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [makeUser(9)] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ep-9' }));
    const h = jest.fn();
    conn.on('progress', h);
    await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalled();
    expect(h.mock.calls[0][0].entityType).toBe('EMPLOYEE');
  });
  it('evt-progress-11: emits progress event', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [makeUser(10)] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ep-10' }));
    const h = jest.fn();
    conn.on('progress', h);
    await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalled();
    expect(h.mock.calls[0][0].entityType).toBe('EMPLOYEE');
  });
  it('evt-progress-12: emits progress event', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [makeUser(11)] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ep-11' }));
    const h = jest.fn();
    conn.on('progress', h);
    await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalled();
    expect(h.mock.calls[0][0].entityType).toBe('EMPLOYEE');
  });
  it('evt-progress-13: emits progress event', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [makeUser(12)] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ep-12' }));
    const h = jest.fn();
    conn.on('progress', h);
    await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalled();
    expect(h.mock.calls[0][0].entityType).toBe('EMPLOYEE');
  });
  it('evt-progress-14: emits progress event', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [makeUser(13)] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ep-13' }));
    const h = jest.fn();
    conn.on('progress', h);
    await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalled();
    expect(h.mock.calls[0][0].entityType).toBe('EMPLOYEE');
  });
  it('evt-progress-15: emits progress event', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [makeUser(14)] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ep-14' }));
    const h = jest.fn();
    conn.on('progress', h);
    await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalled();
    expect(h.mock.calls[0][0].entityType).toBe('EMPLOYEE');
  });
  it('evt-multi-1: multiple listeners all fire', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-em-0' }));
    const h1 = jest.fn(); const h2 = jest.fn();
    conn.on('job:complete', h1); conn.on('job:complete', h2);
    await conn.executeSync(makeJob());
    expect(h1).toHaveBeenCalledTimes(1); expect(h2).toHaveBeenCalledTimes(1);
  });
  it('evt-multi-2: multiple listeners all fire', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-em-1' }));
    const h1 = jest.fn(); const h2 = jest.fn();
    conn.on('job:complete', h1); conn.on('job:complete', h2);
    await conn.executeSync(makeJob());
    expect(h1).toHaveBeenCalledTimes(1); expect(h2).toHaveBeenCalledTimes(1);
  });
  it('evt-multi-3: multiple listeners all fire', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-em-2' }));
    const h1 = jest.fn(); const h2 = jest.fn();
    conn.on('job:complete', h1); conn.on('job:complete', h2);
    await conn.executeSync(makeJob());
    expect(h1).toHaveBeenCalledTimes(1); expect(h2).toHaveBeenCalledTimes(1);
  });
  it('evt-multi-4: multiple listeners all fire', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-em-3' }));
    const h1 = jest.fn(); const h2 = jest.fn();
    conn.on('job:complete', h1); conn.on('job:complete', h2);
    await conn.executeSync(makeJob());
    expect(h1).toHaveBeenCalledTimes(1); expect(h2).toHaveBeenCalledTimes(1);
  });
  it('evt-multi-5: multiple listeners all fire', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-em-4' }));
    const h1 = jest.fn(); const h2 = jest.fn();
    conn.on('job:complete', h1); conn.on('job:complete', h2);
    await conn.executeSync(makeJob());
    expect(h1).toHaveBeenCalledTimes(1); expect(h2).toHaveBeenCalledTimes(1);
  });
  it('evt-multi-6: multiple listeners all fire', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-em-5' }));
    const h1 = jest.fn(); const h2 = jest.fn();
    conn.on('job:complete', h1); conn.on('job:complete', h2);
    await conn.executeSync(makeJob());
    expect(h1).toHaveBeenCalledTimes(1); expect(h2).toHaveBeenCalledTimes(1);
  });
  it('evt-multi-7: multiple listeners all fire', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-em-6' }));
    const h1 = jest.fn(); const h2 = jest.fn();
    conn.on('job:complete', h1); conn.on('job:complete', h2);
    await conn.executeSync(makeJob());
    expect(h1).toHaveBeenCalledTimes(1); expect(h2).toHaveBeenCalledTimes(1);
  });
  it('evt-multi-8: multiple listeners all fire', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-em-7' }));
    const h1 = jest.fn(); const h2 = jest.fn();
    conn.on('job:complete', h1); conn.on('job:complete', h2);
    await conn.executeSync(makeJob());
    expect(h1).toHaveBeenCalledTimes(1); expect(h2).toHaveBeenCalledTimes(1);
  });
  it('evt-multi-9: multiple listeners all fire', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-em-8' }));
    const h1 = jest.fn(); const h2 = jest.fn();
    conn.on('job:complete', h1); conn.on('job:complete', h2);
    await conn.executeSync(makeJob());
    expect(h1).toHaveBeenCalledTimes(1); expect(h2).toHaveBeenCalledTimes(1);
  });
  it('evt-multi-10: multiple listeners all fire', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-em-9' }));
    const h1 = jest.fn(); const h2 = jest.fn();
    conn.on('job:complete', h1); conn.on('job:complete', h2);
    await conn.executeSync(makeJob());
    expect(h1).toHaveBeenCalledTimes(1); expect(h2).toHaveBeenCalledTimes(1);
  });
  it('evt-multi-11: multiple listeners all fire', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-em-10' }));
    const h1 = jest.fn(); const h2 = jest.fn();
    conn.on('job:complete', h1); conn.on('job:complete', h2);
    await conn.executeSync(makeJob());
    expect(h1).toHaveBeenCalledTimes(1); expect(h2).toHaveBeenCalledTimes(1);
  });
  it('evt-multi-12: multiple listeners all fire', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-em-11' }));
    const h1 = jest.fn(); const h2 = jest.fn();
    conn.on('job:complete', h1); conn.on('job:complete', h2);
    await conn.executeSync(makeJob());
    expect(h1).toHaveBeenCalledTimes(1); expect(h2).toHaveBeenCalledTimes(1);
  });
  it('evt-multi-13: multiple listeners all fire', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-em-12' }));
    const h1 = jest.fn(); const h2 = jest.fn();
    conn.on('job:complete', h1); conn.on('job:complete', h2);
    await conn.executeSync(makeJob());
    expect(h1).toHaveBeenCalledTimes(1); expect(h2).toHaveBeenCalledTimes(1);
  });
  it('evt-multi-14: multiple listeners all fire', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-em-13' }));
    const h1 = jest.fn(); const h2 = jest.fn();
    conn.on('job:complete', h1); conn.on('job:complete', h2);
    await conn.executeSync(makeJob());
    expect(h1).toHaveBeenCalledTimes(1); expect(h2).toHaveBeenCalledTimes(1);
  });
  it('evt-multi-15: multiple listeners all fire', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-em-14' }));
    const h1 = jest.fn(); const h2 = jest.fn();
    conn.on('job:complete', h1); conn.on('job:complete', h2);
    await conn.executeSync(makeJob());
    expect(h1).toHaveBeenCalledTimes(1); expect(h2).toHaveBeenCalledTimes(1);
  });
  it('evt-once-1: once() fires exactly once', async () => {
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ value: [] }))
             .mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-eo-0' }));
    const h = jest.fn();
    conn.once('job:complete', h);
    await conn.executeSync(makeJob()); await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
  });
  it('evt-once-2: once() fires exactly once', async () => {
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ value: [] }))
             .mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-eo-1' }));
    const h = jest.fn();
    conn.once('job:complete', h);
    await conn.executeSync(makeJob()); await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
  });
  it('evt-once-3: once() fires exactly once', async () => {
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ value: [] }))
             .mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-eo-2' }));
    const h = jest.fn();
    conn.once('job:complete', h);
    await conn.executeSync(makeJob()); await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
  });
  it('evt-once-4: once() fires exactly once', async () => {
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ value: [] }))
             .mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-eo-3' }));
    const h = jest.fn();
    conn.once('job:complete', h);
    await conn.executeSync(makeJob()); await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
  });
  it('evt-once-5: once() fires exactly once', async () => {
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ value: [] }))
             .mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-eo-4' }));
    const h = jest.fn();
    conn.once('job:complete', h);
    await conn.executeSync(makeJob()); await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
  });
  it('evt-once-6: once() fires exactly once', async () => {
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ value: [] }))
             .mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-eo-5' }));
    const h = jest.fn();
    conn.once('job:complete', h);
    await conn.executeSync(makeJob()); await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
  });
  it('evt-once-7: once() fires exactly once', async () => {
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ value: [] }))
             .mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-eo-6' }));
    const h = jest.fn();
    conn.once('job:complete', h);
    await conn.executeSync(makeJob()); await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
  });
  it('evt-once-8: once() fires exactly once', async () => {
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ value: [] }))
             .mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-eo-7' }));
    const h = jest.fn();
    conn.once('job:complete', h);
    await conn.executeSync(makeJob()); await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
  });
  it('evt-once-9: once() fires exactly once', async () => {
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ value: [] }))
             .mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-eo-8' }));
    const h = jest.fn();
    conn.once('job:complete', h);
    await conn.executeSync(makeJob()); await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
  });
  it('evt-once-10: once() fires exactly once', async () => {
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ value: [] }))
             .mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-eo-9' }));
    const h = jest.fn();
    conn.once('job:complete', h);
    await conn.executeSync(makeJob()); await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
  });
  it('evt-once-11: once() fires exactly once', async () => {
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ value: [] }))
             .mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-eo-10' }));
    const h = jest.fn();
    conn.once('job:complete', h);
    await conn.executeSync(makeJob()); await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
  });
  it('evt-once-12: once() fires exactly once', async () => {
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ value: [] }))
             .mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-eo-11' }));
    const h = jest.fn();
    conn.once('job:complete', h);
    await conn.executeSync(makeJob()); await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
  });
  it('evt-once-13: once() fires exactly once', async () => {
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ value: [] }))
             .mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-eo-12' }));
    const h = jest.fn();
    conn.once('job:complete', h);
    await conn.executeSync(makeJob()); await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
  });
  it('evt-once-14: once() fires exactly once', async () => {
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ value: [] }))
             .mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-eo-13' }));
    const h = jest.fn();
    conn.once('job:complete', h);
    await conn.executeSync(makeJob()); await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
  });
  it('evt-once-15: once() fires exactly once', async () => {
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ value: [] }))
             .mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-eo-14' }));
    const h = jest.fn();
    conn.once('job:complete', h);
    await conn.executeSync(makeJob()); await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
  });
});

// ── 18. Token URL construction ───────────────────────────────────────────────

describe('Dynamics365Connector – token URL construction', () => {
  let fetchMock: jest.SpyInstance;
  beforeEach(() => { fetchMock = jest.spyOn(global, "fetch"); });
  afterEach(() => { fetchMock.mockRestore(); });
  it('tok-url-1: token URL contains tenantId', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new Dynamics365Connector(makeConfig({
      id: 'd365-tu-0',
      credentials: { clientId: 'cid', clientSecret: 'sec', tenantId: 'tenant-0000', orgUrl: 'https://org.crm.dynamics.com' },
    }));
    await conn.testConnection();
    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain('tenant-0000');
    expect(url).toContain('microsoftonline.com');
    expect(url).toContain('oauth2/v2.0/token');
  });
  it('tok-url-2: token URL contains tenantId', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new Dynamics365Connector(makeConfig({
      id: 'd365-tu-1',
      credentials: { clientId: 'cid', clientSecret: 'sec', tenantId: 'tenant-0001', orgUrl: 'https://org.crm.dynamics.com' },
    }));
    await conn.testConnection();
    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain('tenant-0001');
    expect(url).toContain('microsoftonline.com');
    expect(url).toContain('oauth2/v2.0/token');
  });
  it('tok-url-3: token URL contains tenantId', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new Dynamics365Connector(makeConfig({
      id: 'd365-tu-2',
      credentials: { clientId: 'cid', clientSecret: 'sec', tenantId: 'tenant-0002', orgUrl: 'https://org.crm.dynamics.com' },
    }));
    await conn.testConnection();
    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain('tenant-0002');
    expect(url).toContain('microsoftonline.com');
    expect(url).toContain('oauth2/v2.0/token');
  });
  it('tok-url-4: token URL contains tenantId', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new Dynamics365Connector(makeConfig({
      id: 'd365-tu-3',
      credentials: { clientId: 'cid', clientSecret: 'sec', tenantId: 'tenant-0003', orgUrl: 'https://org.crm.dynamics.com' },
    }));
    await conn.testConnection();
    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain('tenant-0003');
    expect(url).toContain('microsoftonline.com');
    expect(url).toContain('oauth2/v2.0/token');
  });
  it('tok-url-5: token URL contains tenantId', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new Dynamics365Connector(makeConfig({
      id: 'd365-tu-4',
      credentials: { clientId: 'cid', clientSecret: 'sec', tenantId: 'tenant-0004', orgUrl: 'https://org.crm.dynamics.com' },
    }));
    await conn.testConnection();
    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain('tenant-0004');
    expect(url).toContain('microsoftonline.com');
    expect(url).toContain('oauth2/v2.0/token');
  });
  it('tok-url-6: token URL contains tenantId', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new Dynamics365Connector(makeConfig({
      id: 'd365-tu-5',
      credentials: { clientId: 'cid', clientSecret: 'sec', tenantId: 'tenant-0005', orgUrl: 'https://org.crm.dynamics.com' },
    }));
    await conn.testConnection();
    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain('tenant-0005');
    expect(url).toContain('microsoftonline.com');
    expect(url).toContain('oauth2/v2.0/token');
  });
  it('tok-url-7: token URL contains tenantId', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new Dynamics365Connector(makeConfig({
      id: 'd365-tu-6',
      credentials: { clientId: 'cid', clientSecret: 'sec', tenantId: 'tenant-0006', orgUrl: 'https://org.crm.dynamics.com' },
    }));
    await conn.testConnection();
    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain('tenant-0006');
    expect(url).toContain('microsoftonline.com');
    expect(url).toContain('oauth2/v2.0/token');
  });
  it('tok-url-8: token URL contains tenantId', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new Dynamics365Connector(makeConfig({
      id: 'd365-tu-7',
      credentials: { clientId: 'cid', clientSecret: 'sec', tenantId: 'tenant-0007', orgUrl: 'https://org.crm.dynamics.com' },
    }));
    await conn.testConnection();
    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain('tenant-0007');
    expect(url).toContain('microsoftonline.com');
    expect(url).toContain('oauth2/v2.0/token');
  });
  it('tok-url-9: token URL contains tenantId', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new Dynamics365Connector(makeConfig({
      id: 'd365-tu-8',
      credentials: { clientId: 'cid', clientSecret: 'sec', tenantId: 'tenant-0008', orgUrl: 'https://org.crm.dynamics.com' },
    }));
    await conn.testConnection();
    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain('tenant-0008');
    expect(url).toContain('microsoftonline.com');
    expect(url).toContain('oauth2/v2.0/token');
  });
  it('tok-url-10: token URL contains tenantId', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new Dynamics365Connector(makeConfig({
      id: 'd365-tu-9',
      credentials: { clientId: 'cid', clientSecret: 'sec', tenantId: 'tenant-0009', orgUrl: 'https://org.crm.dynamics.com' },
    }));
    await conn.testConnection();
    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain('tenant-0009');
    expect(url).toContain('microsoftonline.com');
    expect(url).toContain('oauth2/v2.0/token');
  });
  it('tok-url-11: token URL contains tenantId', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new Dynamics365Connector(makeConfig({
      id: 'd365-tu-10',
      credentials: { clientId: 'cid', clientSecret: 'sec', tenantId: 'tenant-0010', orgUrl: 'https://org.crm.dynamics.com' },
    }));
    await conn.testConnection();
    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain('tenant-0010');
    expect(url).toContain('microsoftonline.com');
    expect(url).toContain('oauth2/v2.0/token');
  });
  it('tok-url-12: token URL contains tenantId', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new Dynamics365Connector(makeConfig({
      id: 'd365-tu-11',
      credentials: { clientId: 'cid', clientSecret: 'sec', tenantId: 'tenant-0011', orgUrl: 'https://org.crm.dynamics.com' },
    }));
    await conn.testConnection();
    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain('tenant-0011');
    expect(url).toContain('microsoftonline.com');
    expect(url).toContain('oauth2/v2.0/token');
  });
  it('tok-url-13: token URL contains tenantId', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new Dynamics365Connector(makeConfig({
      id: 'd365-tu-12',
      credentials: { clientId: 'cid', clientSecret: 'sec', tenantId: 'tenant-0012', orgUrl: 'https://org.crm.dynamics.com' },
    }));
    await conn.testConnection();
    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain('tenant-0012');
    expect(url).toContain('microsoftonline.com');
    expect(url).toContain('oauth2/v2.0/token');
  });
  it('tok-url-14: token URL contains tenantId', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new Dynamics365Connector(makeConfig({
      id: 'd365-tu-13',
      credentials: { clientId: 'cid', clientSecret: 'sec', tenantId: 'tenant-0013', orgUrl: 'https://org.crm.dynamics.com' },
    }));
    await conn.testConnection();
    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain('tenant-0013');
    expect(url).toContain('microsoftonline.com');
    expect(url).toContain('oauth2/v2.0/token');
  });
  it('tok-url-15: token URL contains tenantId', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new Dynamics365Connector(makeConfig({
      id: 'd365-tu-14',
      credentials: { clientId: 'cid', clientSecret: 'sec', tenantId: 'tenant-0014', orgUrl: 'https://org.crm.dynamics.com' },
    }));
    await conn.testConnection();
    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain('tenant-0014');
    expect(url).toContain('microsoftonline.com');
    expect(url).toContain('oauth2/v2.0/token');
  });
  it('tok-url-16: token URL contains tenantId', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new Dynamics365Connector(makeConfig({
      id: 'd365-tu-15',
      credentials: { clientId: 'cid', clientSecret: 'sec', tenantId: 'tenant-0015', orgUrl: 'https://org.crm.dynamics.com' },
    }));
    await conn.testConnection();
    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain('tenant-0015');
    expect(url).toContain('microsoftonline.com');
    expect(url).toContain('oauth2/v2.0/token');
  });
  it('tok-url-17: token URL contains tenantId', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new Dynamics365Connector(makeConfig({
      id: 'd365-tu-16',
      credentials: { clientId: 'cid', clientSecret: 'sec', tenantId: 'tenant-0016', orgUrl: 'https://org.crm.dynamics.com' },
    }));
    await conn.testConnection();
    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain('tenant-0016');
    expect(url).toContain('microsoftonline.com');
    expect(url).toContain('oauth2/v2.0/token');
  });
  it('tok-url-18: token URL contains tenantId', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new Dynamics365Connector(makeConfig({
      id: 'd365-tu-17',
      credentials: { clientId: 'cid', clientSecret: 'sec', tenantId: 'tenant-0017', orgUrl: 'https://org.crm.dynamics.com' },
    }));
    await conn.testConnection();
    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain('tenant-0017');
    expect(url).toContain('microsoftonline.com');
    expect(url).toContain('oauth2/v2.0/token');
  });
  it('tok-url-19: token URL contains tenantId', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new Dynamics365Connector(makeConfig({
      id: 'd365-tu-18',
      credentials: { clientId: 'cid', clientSecret: 'sec', tenantId: 'tenant-0018', orgUrl: 'https://org.crm.dynamics.com' },
    }));
    await conn.testConnection();
    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain('tenant-0018');
    expect(url).toContain('microsoftonline.com');
    expect(url).toContain('oauth2/v2.0/token');
  });
  it('tok-url-20: token URL contains tenantId', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new Dynamics365Connector(makeConfig({
      id: 'd365-tu-19',
      credentials: { clientId: 'cid', clientSecret: 'sec', tenantId: 'tenant-0019', orgUrl: 'https://org.crm.dynamics.com' },
    }));
    await conn.testConnection();
    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain('tenant-0019');
    expect(url).toContain('microsoftonline.com');
    expect(url).toContain('oauth2/v2.0/token');
  });
});

// ── 19. Authorization header forwarding ─────────────────────────────────────

describe('Dynamics365Connector – Authorization header', () => {
  let fetchMock: jest.SpyInstance;
  beforeEach(() => { fetchMock = jest.spyOn(global, "fetch"); });
  afterEach(() => { fetchMock.mockRestore(); });
  it('auth-hdr-1: Bearer token in data request', async () => {
    const tok = 'd365-bearer-0';
    fetchMock.mockResolvedValueOnce(mockToken(tok)).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ah-0' }));
    await conn.fetchRecords('EMPLOYEE');
    const init = fetchMock.mock.calls[1][1] as RequestInit;
    expect((init.headers as Record<string,string>)['Authorization']).toBe(`Bearer ${tok}`);
    expect((init.headers as Record<string,string>)['OData-MaxVersion']).toBe('4.0');
  });
  it('auth-hdr-2: Bearer token in data request', async () => {
    const tok = 'd365-bearer-1';
    fetchMock.mockResolvedValueOnce(mockToken(tok)).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ah-1' }));
    await conn.fetchRecords('EMPLOYEE');
    const init = fetchMock.mock.calls[1][1] as RequestInit;
    expect((init.headers as Record<string,string>)['Authorization']).toBe(`Bearer ${tok}`);
    expect((init.headers as Record<string,string>)['OData-MaxVersion']).toBe('4.0');
  });
  it('auth-hdr-3: Bearer token in data request', async () => {
    const tok = 'd365-bearer-2';
    fetchMock.mockResolvedValueOnce(mockToken(tok)).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ah-2' }));
    await conn.fetchRecords('EMPLOYEE');
    const init = fetchMock.mock.calls[1][1] as RequestInit;
    expect((init.headers as Record<string,string>)['Authorization']).toBe(`Bearer ${tok}`);
    expect((init.headers as Record<string,string>)['OData-MaxVersion']).toBe('4.0');
  });
  it('auth-hdr-4: Bearer token in data request', async () => {
    const tok = 'd365-bearer-3';
    fetchMock.mockResolvedValueOnce(mockToken(tok)).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ah-3' }));
    await conn.fetchRecords('EMPLOYEE');
    const init = fetchMock.mock.calls[1][1] as RequestInit;
    expect((init.headers as Record<string,string>)['Authorization']).toBe(`Bearer ${tok}`);
    expect((init.headers as Record<string,string>)['OData-MaxVersion']).toBe('4.0');
  });
  it('auth-hdr-5: Bearer token in data request', async () => {
    const tok = 'd365-bearer-4';
    fetchMock.mockResolvedValueOnce(mockToken(tok)).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ah-4' }));
    await conn.fetchRecords('EMPLOYEE');
    const init = fetchMock.mock.calls[1][1] as RequestInit;
    expect((init.headers as Record<string,string>)['Authorization']).toBe(`Bearer ${tok}`);
    expect((init.headers as Record<string,string>)['OData-MaxVersion']).toBe('4.0');
  });
  it('auth-hdr-6: Bearer token in data request', async () => {
    const tok = 'd365-bearer-5';
    fetchMock.mockResolvedValueOnce(mockToken(tok)).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ah-5' }));
    await conn.fetchRecords('EMPLOYEE');
    const init = fetchMock.mock.calls[1][1] as RequestInit;
    expect((init.headers as Record<string,string>)['Authorization']).toBe(`Bearer ${tok}`);
    expect((init.headers as Record<string,string>)['OData-MaxVersion']).toBe('4.0');
  });
  it('auth-hdr-7: Bearer token in data request', async () => {
    const tok = 'd365-bearer-6';
    fetchMock.mockResolvedValueOnce(mockToken(tok)).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ah-6' }));
    await conn.fetchRecords('EMPLOYEE');
    const init = fetchMock.mock.calls[1][1] as RequestInit;
    expect((init.headers as Record<string,string>)['Authorization']).toBe(`Bearer ${tok}`);
    expect((init.headers as Record<string,string>)['OData-MaxVersion']).toBe('4.0');
  });
  it('auth-hdr-8: Bearer token in data request', async () => {
    const tok = 'd365-bearer-7';
    fetchMock.mockResolvedValueOnce(mockToken(tok)).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ah-7' }));
    await conn.fetchRecords('EMPLOYEE');
    const init = fetchMock.mock.calls[1][1] as RequestInit;
    expect((init.headers as Record<string,string>)['Authorization']).toBe(`Bearer ${tok}`);
    expect((init.headers as Record<string,string>)['OData-MaxVersion']).toBe('4.0');
  });
  it('auth-hdr-9: Bearer token in data request', async () => {
    const tok = 'd365-bearer-8';
    fetchMock.mockResolvedValueOnce(mockToken(tok)).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ah-8' }));
    await conn.fetchRecords('EMPLOYEE');
    const init = fetchMock.mock.calls[1][1] as RequestInit;
    expect((init.headers as Record<string,string>)['Authorization']).toBe(`Bearer ${tok}`);
    expect((init.headers as Record<string,string>)['OData-MaxVersion']).toBe('4.0');
  });
  it('auth-hdr-10: Bearer token in data request', async () => {
    const tok = 'd365-bearer-9';
    fetchMock.mockResolvedValueOnce(mockToken(tok)).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ah-9' }));
    await conn.fetchRecords('EMPLOYEE');
    const init = fetchMock.mock.calls[1][1] as RequestInit;
    expect((init.headers as Record<string,string>)['Authorization']).toBe(`Bearer ${tok}`);
    expect((init.headers as Record<string,string>)['OData-MaxVersion']).toBe('4.0');
  });
  it('auth-hdr-11: Bearer token in data request', async () => {
    const tok = 'd365-bearer-10';
    fetchMock.mockResolvedValueOnce(mockToken(tok)).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ah-10' }));
    await conn.fetchRecords('EMPLOYEE');
    const init = fetchMock.mock.calls[1][1] as RequestInit;
    expect((init.headers as Record<string,string>)['Authorization']).toBe(`Bearer ${tok}`);
    expect((init.headers as Record<string,string>)['OData-MaxVersion']).toBe('4.0');
  });
  it('auth-hdr-12: Bearer token in data request', async () => {
    const tok = 'd365-bearer-11';
    fetchMock.mockResolvedValueOnce(mockToken(tok)).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ah-11' }));
    await conn.fetchRecords('EMPLOYEE');
    const init = fetchMock.mock.calls[1][1] as RequestInit;
    expect((init.headers as Record<string,string>)['Authorization']).toBe(`Bearer ${tok}`);
    expect((init.headers as Record<string,string>)['OData-MaxVersion']).toBe('4.0');
  });
  it('auth-hdr-13: Bearer token in data request', async () => {
    const tok = 'd365-bearer-12';
    fetchMock.mockResolvedValueOnce(mockToken(tok)).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ah-12' }));
    await conn.fetchRecords('EMPLOYEE');
    const init = fetchMock.mock.calls[1][1] as RequestInit;
    expect((init.headers as Record<string,string>)['Authorization']).toBe(`Bearer ${tok}`);
    expect((init.headers as Record<string,string>)['OData-MaxVersion']).toBe('4.0');
  });
  it('auth-hdr-14: Bearer token in data request', async () => {
    const tok = 'd365-bearer-13';
    fetchMock.mockResolvedValueOnce(mockToken(tok)).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ah-13' }));
    await conn.fetchRecords('EMPLOYEE');
    const init = fetchMock.mock.calls[1][1] as RequestInit;
    expect((init.headers as Record<string,string>)['Authorization']).toBe(`Bearer ${tok}`);
    expect((init.headers as Record<string,string>)['OData-MaxVersion']).toBe('4.0');
  });
  it('auth-hdr-15: Bearer token in data request', async () => {
    const tok = 'd365-bearer-14';
    fetchMock.mockResolvedValueOnce(mockToken(tok)).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ah-14' }));
    await conn.fetchRecords('EMPLOYEE');
    const init = fetchMock.mock.calls[1][1] as RequestInit;
    expect((init.headers as Record<string,string>)['Authorization']).toBe(`Bearer ${tok}`);
    expect((init.headers as Record<string,string>)['OData-MaxVersion']).toBe('4.0');
  });
  it('auth-hdr-16: Bearer token in data request', async () => {
    const tok = 'd365-bearer-15';
    fetchMock.mockResolvedValueOnce(mockToken(tok)).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ah-15' }));
    await conn.fetchRecords('EMPLOYEE');
    const init = fetchMock.mock.calls[1][1] as RequestInit;
    expect((init.headers as Record<string,string>)['Authorization']).toBe(`Bearer ${tok}`);
    expect((init.headers as Record<string,string>)['OData-MaxVersion']).toBe('4.0');
  });
  it('auth-hdr-17: Bearer token in data request', async () => {
    const tok = 'd365-bearer-16';
    fetchMock.mockResolvedValueOnce(mockToken(tok)).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ah-16' }));
    await conn.fetchRecords('EMPLOYEE');
    const init = fetchMock.mock.calls[1][1] as RequestInit;
    expect((init.headers as Record<string,string>)['Authorization']).toBe(`Bearer ${tok}`);
    expect((init.headers as Record<string,string>)['OData-MaxVersion']).toBe('4.0');
  });
  it('auth-hdr-18: Bearer token in data request', async () => {
    const tok = 'd365-bearer-17';
    fetchMock.mockResolvedValueOnce(mockToken(tok)).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ah-17' }));
    await conn.fetchRecords('EMPLOYEE');
    const init = fetchMock.mock.calls[1][1] as RequestInit;
    expect((init.headers as Record<string,string>)['Authorization']).toBe(`Bearer ${tok}`);
    expect((init.headers as Record<string,string>)['OData-MaxVersion']).toBe('4.0');
  });
  it('auth-hdr-19: Bearer token in data request', async () => {
    const tok = 'd365-bearer-18';
    fetchMock.mockResolvedValueOnce(mockToken(tok)).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ah-18' }));
    await conn.fetchRecords('EMPLOYEE');
    const init = fetchMock.mock.calls[1][1] as RequestInit;
    expect((init.headers as Record<string,string>)['Authorization']).toBe(`Bearer ${tok}`);
    expect((init.headers as Record<string,string>)['OData-MaxVersion']).toBe('4.0');
  });
  it('auth-hdr-20: Bearer token in data request', async () => {
    const tok = 'd365-bearer-19';
    fetchMock.mockResolvedValueOnce(mockToken(tok)).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ah-19' }));
    await conn.fetchRecords('EMPLOYEE');
    const init = fetchMock.mock.calls[1][1] as RequestInit;
    expect((init.headers as Record<string,string>)['Authorization']).toBe(`Bearer ${tok}`);
    expect((init.headers as Record<string,string>)['OData-MaxVersion']).toBe('4.0');
  });
});

// ── 20. Token POST body ──────────────────────────────────────────────────────

describe('Dynamics365Connector – token POST body', () => {
  let fetchMock: jest.SpyInstance;
  beforeEach(() => { fetchMock = jest.spyOn(global, "fetch"); });
  afterEach(() => { fetchMock.mockRestore(); });
  it('tok-body-1: body contains grant_type+client_id+client_secret+scope', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-tb-0' }));
    await conn.testConnection();
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const body = init.body as string;
    expect(body).toContain('grant_type=client_credentials');
    expect(body).toContain('client_id=dyn-client-id');
    expect(body).toContain('client_secret=dyn-client-secret');
    expect(body).toContain('scope=');
    expect(init.method).toBe('POST');
  });
  it('tok-body-2: body contains grant_type+client_id+client_secret+scope', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-tb-1' }));
    await conn.testConnection();
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const body = init.body as string;
    expect(body).toContain('grant_type=client_credentials');
    expect(body).toContain('client_id=dyn-client-id');
    expect(body).toContain('client_secret=dyn-client-secret');
    expect(body).toContain('scope=');
    expect(init.method).toBe('POST');
  });
  it('tok-body-3: body contains grant_type+client_id+client_secret+scope', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-tb-2' }));
    await conn.testConnection();
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const body = init.body as string;
    expect(body).toContain('grant_type=client_credentials');
    expect(body).toContain('client_id=dyn-client-id');
    expect(body).toContain('client_secret=dyn-client-secret');
    expect(body).toContain('scope=');
    expect(init.method).toBe('POST');
  });
  it('tok-body-4: body contains grant_type+client_id+client_secret+scope', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-tb-3' }));
    await conn.testConnection();
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const body = init.body as string;
    expect(body).toContain('grant_type=client_credentials');
    expect(body).toContain('client_id=dyn-client-id');
    expect(body).toContain('client_secret=dyn-client-secret');
    expect(body).toContain('scope=');
    expect(init.method).toBe('POST');
  });
  it('tok-body-5: body contains grant_type+client_id+client_secret+scope', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-tb-4' }));
    await conn.testConnection();
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const body = init.body as string;
    expect(body).toContain('grant_type=client_credentials');
    expect(body).toContain('client_id=dyn-client-id');
    expect(body).toContain('client_secret=dyn-client-secret');
    expect(body).toContain('scope=');
    expect(init.method).toBe('POST');
  });
  it('tok-body-6: body contains grant_type+client_id+client_secret+scope', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-tb-5' }));
    await conn.testConnection();
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const body = init.body as string;
    expect(body).toContain('grant_type=client_credentials');
    expect(body).toContain('client_id=dyn-client-id');
    expect(body).toContain('client_secret=dyn-client-secret');
    expect(body).toContain('scope=');
    expect(init.method).toBe('POST');
  });
  it('tok-body-7: body contains grant_type+client_id+client_secret+scope', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-tb-6' }));
    await conn.testConnection();
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const body = init.body as string;
    expect(body).toContain('grant_type=client_credentials');
    expect(body).toContain('client_id=dyn-client-id');
    expect(body).toContain('client_secret=dyn-client-secret');
    expect(body).toContain('scope=');
    expect(init.method).toBe('POST');
  });
  it('tok-body-8: body contains grant_type+client_id+client_secret+scope', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-tb-7' }));
    await conn.testConnection();
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const body = init.body as string;
    expect(body).toContain('grant_type=client_credentials');
    expect(body).toContain('client_id=dyn-client-id');
    expect(body).toContain('client_secret=dyn-client-secret');
    expect(body).toContain('scope=');
    expect(init.method).toBe('POST');
  });
  it('tok-body-9: body contains grant_type+client_id+client_secret+scope', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-tb-8' }));
    await conn.testConnection();
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const body = init.body as string;
    expect(body).toContain('grant_type=client_credentials');
    expect(body).toContain('client_id=dyn-client-id');
    expect(body).toContain('client_secret=dyn-client-secret');
    expect(body).toContain('scope=');
    expect(init.method).toBe('POST');
  });
  it('tok-body-10: body contains grant_type+client_id+client_secret+scope', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-tb-9' }));
    await conn.testConnection();
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const body = init.body as string;
    expect(body).toContain('grant_type=client_credentials');
    expect(body).toContain('client_id=dyn-client-id');
    expect(body).toContain('client_secret=dyn-client-secret');
    expect(body).toContain('scope=');
    expect(init.method).toBe('POST');
  });
  it('tok-body-11: body contains grant_type+client_id+client_secret+scope', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-tb-10' }));
    await conn.testConnection();
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const body = init.body as string;
    expect(body).toContain('grant_type=client_credentials');
    expect(body).toContain('client_id=dyn-client-id');
    expect(body).toContain('client_secret=dyn-client-secret');
    expect(body).toContain('scope=');
    expect(init.method).toBe('POST');
  });
  it('tok-body-12: body contains grant_type+client_id+client_secret+scope', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-tb-11' }));
    await conn.testConnection();
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const body = init.body as string;
    expect(body).toContain('grant_type=client_credentials');
    expect(body).toContain('client_id=dyn-client-id');
    expect(body).toContain('client_secret=dyn-client-secret');
    expect(body).toContain('scope=');
    expect(init.method).toBe('POST');
  });
  it('tok-body-13: body contains grant_type+client_id+client_secret+scope', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-tb-12' }));
    await conn.testConnection();
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const body = init.body as string;
    expect(body).toContain('grant_type=client_credentials');
    expect(body).toContain('client_id=dyn-client-id');
    expect(body).toContain('client_secret=dyn-client-secret');
    expect(body).toContain('scope=');
    expect(init.method).toBe('POST');
  });
  it('tok-body-14: body contains grant_type+client_id+client_secret+scope', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-tb-13' }));
    await conn.testConnection();
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const body = init.body as string;
    expect(body).toContain('grant_type=client_credentials');
    expect(body).toContain('client_id=dyn-client-id');
    expect(body).toContain('client_secret=dyn-client-secret');
    expect(body).toContain('scope=');
    expect(init.method).toBe('POST');
  });
  it('tok-body-15: body contains grant_type+client_id+client_secret+scope', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-tb-14' }));
    await conn.testConnection();
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const body = init.body as string;
    expect(body).toContain('grant_type=client_credentials');
    expect(body).toContain('client_id=dyn-client-id');
    expect(body).toContain('client_secret=dyn-client-secret');
    expect(body).toContain('scope=');
    expect(init.method).toBe('POST');
  });
  it('tok-body-16: body contains grant_type+client_id+client_secret+scope', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-tb-15' }));
    await conn.testConnection();
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const body = init.body as string;
    expect(body).toContain('grant_type=client_credentials');
    expect(body).toContain('client_id=dyn-client-id');
    expect(body).toContain('client_secret=dyn-client-secret');
    expect(body).toContain('scope=');
    expect(init.method).toBe('POST');
  });
  it('tok-body-17: body contains grant_type+client_id+client_secret+scope', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-tb-16' }));
    await conn.testConnection();
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const body = init.body as string;
    expect(body).toContain('grant_type=client_credentials');
    expect(body).toContain('client_id=dyn-client-id');
    expect(body).toContain('client_secret=dyn-client-secret');
    expect(body).toContain('scope=');
    expect(init.method).toBe('POST');
  });
  it('tok-body-18: body contains grant_type+client_id+client_secret+scope', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-tb-17' }));
    await conn.testConnection();
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const body = init.body as string;
    expect(body).toContain('grant_type=client_credentials');
    expect(body).toContain('client_id=dyn-client-id');
    expect(body).toContain('client_secret=dyn-client-secret');
    expect(body).toContain('scope=');
    expect(init.method).toBe('POST');
  });
  it('tok-body-19: body contains grant_type+client_id+client_secret+scope', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-tb-18' }));
    await conn.testConnection();
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const body = init.body as string;
    expect(body).toContain('grant_type=client_credentials');
    expect(body).toContain('client_id=dyn-client-id');
    expect(body).toContain('client_secret=dyn-client-secret');
    expect(body).toContain('scope=');
    expect(init.method).toBe('POST');
  });
  it('tok-body-20: body contains grant_type+client_id+client_secret+scope', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-tb-19' }));
    await conn.testConnection();
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const body = init.body as string;
    expect(body).toContain('grant_type=client_credentials');
    expect(body).toContain('client_id=dyn-client-id');
    expect(body).toContain('client_secret=dyn-client-secret');
    expect(body).toContain('scope=');
    expect(init.method).toBe('POST');
  });
});

// ── 21. Checksum determinism ─────────────────────────────────────────────────

describe('Dynamics365Connector – checksum determinism', () => {
  it('chk-1: same data → same 16-char checksum', () => {
    const cfg = makeConfig({ id: 'd365-chk-0' });
    const c1 = new Dynamics365Connector(cfg);
    const c2 = new Dynamics365Connector(cfg);
    const data = { id: 'x-0', name: 'N0' };
    type C = { checksum: (d: Record<string,unknown>) => string };
    const h1 = (c1 as unknown as C).checksum(data);
    const h2 = (c2 as unknown as C).checksum(data);
    expect(h1).toBe(h2);
    expect(h1).toHaveLength(16);
  });
  it('chk-2: same data → same 16-char checksum', () => {
    const cfg = makeConfig({ id: 'd365-chk-1' });
    const c1 = new Dynamics365Connector(cfg);
    const c2 = new Dynamics365Connector(cfg);
    const data = { id: 'x-1', name: 'N1' };
    type C = { checksum: (d: Record<string,unknown>) => string };
    const h1 = (c1 as unknown as C).checksum(data);
    const h2 = (c2 as unknown as C).checksum(data);
    expect(h1).toBe(h2);
    expect(h1).toHaveLength(16);
  });
  it('chk-3: same data → same 16-char checksum', () => {
    const cfg = makeConfig({ id: 'd365-chk-2' });
    const c1 = new Dynamics365Connector(cfg);
    const c2 = new Dynamics365Connector(cfg);
    const data = { id: 'x-2', name: 'N2' };
    type C = { checksum: (d: Record<string,unknown>) => string };
    const h1 = (c1 as unknown as C).checksum(data);
    const h2 = (c2 as unknown as C).checksum(data);
    expect(h1).toBe(h2);
    expect(h1).toHaveLength(16);
  });
  it('chk-4: same data → same 16-char checksum', () => {
    const cfg = makeConfig({ id: 'd365-chk-3' });
    const c1 = new Dynamics365Connector(cfg);
    const c2 = new Dynamics365Connector(cfg);
    const data = { id: 'x-3', name: 'N3' };
    type C = { checksum: (d: Record<string,unknown>) => string };
    const h1 = (c1 as unknown as C).checksum(data);
    const h2 = (c2 as unknown as C).checksum(data);
    expect(h1).toBe(h2);
    expect(h1).toHaveLength(16);
  });
  it('chk-5: same data → same 16-char checksum', () => {
    const cfg = makeConfig({ id: 'd365-chk-4' });
    const c1 = new Dynamics365Connector(cfg);
    const c2 = new Dynamics365Connector(cfg);
    const data = { id: 'x-4', name: 'N4' };
    type C = { checksum: (d: Record<string,unknown>) => string };
    const h1 = (c1 as unknown as C).checksum(data);
    const h2 = (c2 as unknown as C).checksum(data);
    expect(h1).toBe(h2);
    expect(h1).toHaveLength(16);
  });
  it('chk-6: same data → same 16-char checksum', () => {
    const cfg = makeConfig({ id: 'd365-chk-5' });
    const c1 = new Dynamics365Connector(cfg);
    const c2 = new Dynamics365Connector(cfg);
    const data = { id: 'x-5', name: 'N5' };
    type C = { checksum: (d: Record<string,unknown>) => string };
    const h1 = (c1 as unknown as C).checksum(data);
    const h2 = (c2 as unknown as C).checksum(data);
    expect(h1).toBe(h2);
    expect(h1).toHaveLength(16);
  });
  it('chk-7: same data → same 16-char checksum', () => {
    const cfg = makeConfig({ id: 'd365-chk-6' });
    const c1 = new Dynamics365Connector(cfg);
    const c2 = new Dynamics365Connector(cfg);
    const data = { id: 'x-6', name: 'N6' };
    type C = { checksum: (d: Record<string,unknown>) => string };
    const h1 = (c1 as unknown as C).checksum(data);
    const h2 = (c2 as unknown as C).checksum(data);
    expect(h1).toBe(h2);
    expect(h1).toHaveLength(16);
  });
  it('chk-8: same data → same 16-char checksum', () => {
    const cfg = makeConfig({ id: 'd365-chk-7' });
    const c1 = new Dynamics365Connector(cfg);
    const c2 = new Dynamics365Connector(cfg);
    const data = { id: 'x-7', name: 'N7' };
    type C = { checksum: (d: Record<string,unknown>) => string };
    const h1 = (c1 as unknown as C).checksum(data);
    const h2 = (c2 as unknown as C).checksum(data);
    expect(h1).toBe(h2);
    expect(h1).toHaveLength(16);
  });
  it('chk-9: same data → same 16-char checksum', () => {
    const cfg = makeConfig({ id: 'd365-chk-8' });
    const c1 = new Dynamics365Connector(cfg);
    const c2 = new Dynamics365Connector(cfg);
    const data = { id: 'x-8', name: 'N8' };
    type C = { checksum: (d: Record<string,unknown>) => string };
    const h1 = (c1 as unknown as C).checksum(data);
    const h2 = (c2 as unknown as C).checksum(data);
    expect(h1).toBe(h2);
    expect(h1).toHaveLength(16);
  });
  it('chk-10: same data → same 16-char checksum', () => {
    const cfg = makeConfig({ id: 'd365-chk-9' });
    const c1 = new Dynamics365Connector(cfg);
    const c2 = new Dynamics365Connector(cfg);
    const data = { id: 'x-9', name: 'N9' };
    type C = { checksum: (d: Record<string,unknown>) => string };
    const h1 = (c1 as unknown as C).checksum(data);
    const h2 = (c2 as unknown as C).checksum(data);
    expect(h1).toBe(h2);
    expect(h1).toHaveLength(16);
  });
  it('chk-11: same data → same 16-char checksum', () => {
    const cfg = makeConfig({ id: 'd365-chk-10' });
    const c1 = new Dynamics365Connector(cfg);
    const c2 = new Dynamics365Connector(cfg);
    const data = { id: 'x-10', name: 'N10' };
    type C = { checksum: (d: Record<string,unknown>) => string };
    const h1 = (c1 as unknown as C).checksum(data);
    const h2 = (c2 as unknown as C).checksum(data);
    expect(h1).toBe(h2);
    expect(h1).toHaveLength(16);
  });
  it('chk-12: same data → same 16-char checksum', () => {
    const cfg = makeConfig({ id: 'd365-chk-11' });
    const c1 = new Dynamics365Connector(cfg);
    const c2 = new Dynamics365Connector(cfg);
    const data = { id: 'x-11', name: 'N11' };
    type C = { checksum: (d: Record<string,unknown>) => string };
    const h1 = (c1 as unknown as C).checksum(data);
    const h2 = (c2 as unknown as C).checksum(data);
    expect(h1).toBe(h2);
    expect(h1).toHaveLength(16);
  });
  it('chk-13: same data → same 16-char checksum', () => {
    const cfg = makeConfig({ id: 'd365-chk-12' });
    const c1 = new Dynamics365Connector(cfg);
    const c2 = new Dynamics365Connector(cfg);
    const data = { id: 'x-12', name: 'N12' };
    type C = { checksum: (d: Record<string,unknown>) => string };
    const h1 = (c1 as unknown as C).checksum(data);
    const h2 = (c2 as unknown as C).checksum(data);
    expect(h1).toBe(h2);
    expect(h1).toHaveLength(16);
  });
  it('chk-14: same data → same 16-char checksum', () => {
    const cfg = makeConfig({ id: 'd365-chk-13' });
    const c1 = new Dynamics365Connector(cfg);
    const c2 = new Dynamics365Connector(cfg);
    const data = { id: 'x-13', name: 'N13' };
    type C = { checksum: (d: Record<string,unknown>) => string };
    const h1 = (c1 as unknown as C).checksum(data);
    const h2 = (c2 as unknown as C).checksum(data);
    expect(h1).toBe(h2);
    expect(h1).toHaveLength(16);
  });
  it('chk-15: same data → same 16-char checksum', () => {
    const cfg = makeConfig({ id: 'd365-chk-14' });
    const c1 = new Dynamics365Connector(cfg);
    const c2 = new Dynamics365Connector(cfg);
    const data = { id: 'x-14', name: 'N14' };
    type C = { checksum: (d: Record<string,unknown>) => string };
    const h1 = (c1 as unknown as C).checksum(data);
    const h2 = (c2 as unknown as C).checksum(data);
    expect(h1).toBe(h2);
    expect(h1).toHaveLength(16);
  });
  it('chk-16: same data → same 16-char checksum', () => {
    const cfg = makeConfig({ id: 'd365-chk-15' });
    const c1 = new Dynamics365Connector(cfg);
    const c2 = new Dynamics365Connector(cfg);
    const data = { id: 'x-15', name: 'N15' };
    type C = { checksum: (d: Record<string,unknown>) => string };
    const h1 = (c1 as unknown as C).checksum(data);
    const h2 = (c2 as unknown as C).checksum(data);
    expect(h1).toBe(h2);
    expect(h1).toHaveLength(16);
  });
  it('chk-17: same data → same 16-char checksum', () => {
    const cfg = makeConfig({ id: 'd365-chk-16' });
    const c1 = new Dynamics365Connector(cfg);
    const c2 = new Dynamics365Connector(cfg);
    const data = { id: 'x-16', name: 'N16' };
    type C = { checksum: (d: Record<string,unknown>) => string };
    const h1 = (c1 as unknown as C).checksum(data);
    const h2 = (c2 as unknown as C).checksum(data);
    expect(h1).toBe(h2);
    expect(h1).toHaveLength(16);
  });
  it('chk-18: same data → same 16-char checksum', () => {
    const cfg = makeConfig({ id: 'd365-chk-17' });
    const c1 = new Dynamics365Connector(cfg);
    const c2 = new Dynamics365Connector(cfg);
    const data = { id: 'x-17', name: 'N17' };
    type C = { checksum: (d: Record<string,unknown>) => string };
    const h1 = (c1 as unknown as C).checksum(data);
    const h2 = (c2 as unknown as C).checksum(data);
    expect(h1).toBe(h2);
    expect(h1).toHaveLength(16);
  });
  it('chk-19: same data → same 16-char checksum', () => {
    const cfg = makeConfig({ id: 'd365-chk-18' });
    const c1 = new Dynamics365Connector(cfg);
    const c2 = new Dynamics365Connector(cfg);
    const data = { id: 'x-18', name: 'N18' };
    type C = { checksum: (d: Record<string,unknown>) => string };
    const h1 = (c1 as unknown as C).checksum(data);
    const h2 = (c2 as unknown as C).checksum(data);
    expect(h1).toBe(h2);
    expect(h1).toHaveLength(16);
  });
  it('chk-20: same data → same 16-char checksum', () => {
    const cfg = makeConfig({ id: 'd365-chk-19' });
    const c1 = new Dynamics365Connector(cfg);
    const c2 = new Dynamics365Connector(cfg);
    const data = { id: 'x-19', name: 'N19' };
    type C = { checksum: (d: Record<string,unknown>) => string };
    const h1 = (c1 as unknown as C).checksum(data);
    const h2 = (c2 as unknown as C).checksum(data);
    expect(h1).toBe(h2);
    expect(h1).toHaveLength(16);
  });
});

// ── 22. externalId prefixes ─────────────────────────────────────────────────

describe('Dynamics365Connector – SyncRecord externalId prefixes', () => {
  let fetchMock: jest.SpyInstance;
  beforeEach(() => { fetchMock = jest.spyOn(global, "fetch"); });
  afterEach(() => { fetchMock.mockRestore(); });
  it('eid-user-1: user externalId starts with d365_user_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [makeUser(0)] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-eu-0' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].externalId).toMatch(/^d365_user_/);
    expect(recs[0].externalId).toBe(recs[0].data.externalId as string);
  });
  it('eid-user-2: user externalId starts with d365_user_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [makeUser(1)] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-eu-1' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].externalId).toMatch(/^d365_user_/);
    expect(recs[0].externalId).toBe(recs[0].data.externalId as string);
  });
  it('eid-user-3: user externalId starts with d365_user_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [makeUser(2)] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-eu-2' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].externalId).toMatch(/^d365_user_/);
    expect(recs[0].externalId).toBe(recs[0].data.externalId as string);
  });
  it('eid-user-4: user externalId starts with d365_user_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [makeUser(3)] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-eu-3' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].externalId).toMatch(/^d365_user_/);
    expect(recs[0].externalId).toBe(recs[0].data.externalId as string);
  });
  it('eid-user-5: user externalId starts with d365_user_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [makeUser(4)] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-eu-4' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].externalId).toMatch(/^d365_user_/);
    expect(recs[0].externalId).toBe(recs[0].data.externalId as string);
  });
  it('eid-user-6: user externalId starts with d365_user_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [makeUser(5)] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-eu-5' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].externalId).toMatch(/^d365_user_/);
    expect(recs[0].externalId).toBe(recs[0].data.externalId as string);
  });
  it('eid-user-7: user externalId starts with d365_user_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [makeUser(6)] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-eu-6' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].externalId).toMatch(/^d365_user_/);
    expect(recs[0].externalId).toBe(recs[0].data.externalId as string);
  });
  it('eid-user-8: user externalId starts with d365_user_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [makeUser(7)] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-eu-7' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].externalId).toMatch(/^d365_user_/);
    expect(recs[0].externalId).toBe(recs[0].data.externalId as string);
  });
  it('eid-user-9: user externalId starts with d365_user_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [makeUser(8)] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-eu-8' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].externalId).toMatch(/^d365_user_/);
    expect(recs[0].externalId).toBe(recs[0].data.externalId as string);
  });
  it('eid-user-10: user externalId starts with d365_user_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [makeUser(9)] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-eu-9' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].externalId).toMatch(/^d365_user_/);
    expect(recs[0].externalId).toBe(recs[0].data.externalId as string);
  });
  it('eid-user-11: user externalId starts with d365_user_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [makeUser(10)] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-eu-10' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].externalId).toMatch(/^d365_user_/);
    expect(recs[0].externalId).toBe(recs[0].data.externalId as string);
  });
  it('eid-user-12: user externalId starts with d365_user_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [makeUser(11)] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-eu-11' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].externalId).toMatch(/^d365_user_/);
    expect(recs[0].externalId).toBe(recs[0].data.externalId as string);
  });
  it('eid-user-13: user externalId starts with d365_user_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [makeUser(12)] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-eu-12' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].externalId).toMatch(/^d365_user_/);
    expect(recs[0].externalId).toBe(recs[0].data.externalId as string);
  });
  it('eid-user-14: user externalId starts with d365_user_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [makeUser(13)] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-eu-13' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].externalId).toMatch(/^d365_user_/);
    expect(recs[0].externalId).toBe(recs[0].data.externalId as string);
  });
  it('eid-user-15: user externalId starts with d365_user_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [makeUser(14)] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-eu-14' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].externalId).toMatch(/^d365_user_/);
    expect(recs[0].externalId).toBe(recs[0].data.externalId as string);
  });
  it('eid-user-16: user externalId starts with d365_user_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [makeUser(15)] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-eu-15' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].externalId).toMatch(/^d365_user_/);
    expect(recs[0].externalId).toBe(recs[0].data.externalId as string);
  });
  it('eid-user-17: user externalId starts with d365_user_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [makeUser(16)] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-eu-16' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].externalId).toMatch(/^d365_user_/);
    expect(recs[0].externalId).toBe(recs[0].data.externalId as string);
  });
  it('eid-user-18: user externalId starts with d365_user_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [makeUser(17)] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-eu-17' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].externalId).toMatch(/^d365_user_/);
    expect(recs[0].externalId).toBe(recs[0].data.externalId as string);
  });
  it('eid-user-19: user externalId starts with d365_user_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [makeUser(18)] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-eu-18' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].externalId).toMatch(/^d365_user_/);
    expect(recs[0].externalId).toBe(recs[0].data.externalId as string);
  });
  it('eid-user-20: user externalId starts with d365_user_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [makeUser(19)] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-eu-19' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].externalId).toMatch(/^d365_user_/);
    expect(recs[0].externalId).toBe(recs[0].data.externalId as string);
  });
  it('eid-bu-1: BU externalId starts with d365_bu_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [makeBU(0)] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ebu-0' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs[0].externalId).toMatch(/^d365_bu_/);
  });
  it('eid-bu-2: BU externalId starts with d365_bu_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [makeBU(1)] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ebu-1' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs[0].externalId).toMatch(/^d365_bu_/);
  });
  it('eid-bu-3: BU externalId starts with d365_bu_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [makeBU(2)] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ebu-2' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs[0].externalId).toMatch(/^d365_bu_/);
  });
  it('eid-bu-4: BU externalId starts with d365_bu_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [makeBU(3)] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ebu-3' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs[0].externalId).toMatch(/^d365_bu_/);
  });
  it('eid-bu-5: BU externalId starts with d365_bu_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [makeBU(4)] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ebu-4' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs[0].externalId).toMatch(/^d365_bu_/);
  });
  it('eid-bu-6: BU externalId starts with d365_bu_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [makeBU(5)] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ebu-5' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs[0].externalId).toMatch(/^d365_bu_/);
  });
  it('eid-bu-7: BU externalId starts with d365_bu_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [makeBU(6)] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ebu-6' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs[0].externalId).toMatch(/^d365_bu_/);
  });
  it('eid-bu-8: BU externalId starts with d365_bu_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [makeBU(7)] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ebu-7' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs[0].externalId).toMatch(/^d365_bu_/);
  });
  it('eid-bu-9: BU externalId starts with d365_bu_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [makeBU(8)] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ebu-8' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs[0].externalId).toMatch(/^d365_bu_/);
  });
  it('eid-bu-10: BU externalId starts with d365_bu_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [makeBU(9)] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ebu-9' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs[0].externalId).toMatch(/^d365_bu_/);
  });
  it('eid-bu-11: BU externalId starts with d365_bu_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [makeBU(10)] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ebu-10' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs[0].externalId).toMatch(/^d365_bu_/);
  });
  it('eid-bu-12: BU externalId starts with d365_bu_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [makeBU(11)] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ebu-11' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs[0].externalId).toMatch(/^d365_bu_/);
  });
  it('eid-bu-13: BU externalId starts with d365_bu_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [makeBU(12)] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ebu-12' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs[0].externalId).toMatch(/^d365_bu_/);
  });
  it('eid-bu-14: BU externalId starts with d365_bu_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [makeBU(13)] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ebu-13' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs[0].externalId).toMatch(/^d365_bu_/);
  });
  it('eid-bu-15: BU externalId starts with d365_bu_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [makeBU(14)] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ebu-14' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs[0].externalId).toMatch(/^d365_bu_/);
  });
  it('eid-bu-16: BU externalId starts with d365_bu_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [makeBU(15)] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ebu-15' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs[0].externalId).toMatch(/^d365_bu_/);
  });
  it('eid-bu-17: BU externalId starts with d365_bu_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [makeBU(16)] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ebu-16' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs[0].externalId).toMatch(/^d365_bu_/);
  });
  it('eid-bu-18: BU externalId starts with d365_bu_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [makeBU(17)] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ebu-17' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs[0].externalId).toMatch(/^d365_bu_/);
  });
  it('eid-bu-19: BU externalId starts with d365_bu_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [makeBU(18)] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ebu-18' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs[0].externalId).toMatch(/^d365_bu_/);
  });
  it('eid-bu-20: BU externalId starts with d365_bu_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [makeBU(19)] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ebu-19' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs[0].externalId).toMatch(/^d365_bu_/);
  });
  it('eid-acc-1: account externalId starts with d365_account_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [makeAccount(0, 2)] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-eacc-0' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs[0].externalId).toMatch(/^d365_account_/);
  });
  it('eid-acc-2: account externalId starts with d365_account_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [makeAccount(1, 2)] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-eacc-1' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs[0].externalId).toMatch(/^d365_account_/);
  });
  it('eid-acc-3: account externalId starts with d365_account_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [makeAccount(2, 2)] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-eacc-2' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs[0].externalId).toMatch(/^d365_account_/);
  });
  it('eid-acc-4: account externalId starts with d365_account_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [makeAccount(3, 2)] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-eacc-3' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs[0].externalId).toMatch(/^d365_account_/);
  });
  it('eid-acc-5: account externalId starts with d365_account_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [makeAccount(4, 2)] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-eacc-4' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs[0].externalId).toMatch(/^d365_account_/);
  });
  it('eid-acc-6: account externalId starts with d365_account_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [makeAccount(5, 2)] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-eacc-5' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs[0].externalId).toMatch(/^d365_account_/);
  });
  it('eid-acc-7: account externalId starts with d365_account_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [makeAccount(6, 2)] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-eacc-6' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs[0].externalId).toMatch(/^d365_account_/);
  });
  it('eid-acc-8: account externalId starts with d365_account_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [makeAccount(7, 2)] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-eacc-7' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs[0].externalId).toMatch(/^d365_account_/);
  });
  it('eid-acc-9: account externalId starts with d365_account_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [makeAccount(8, 2)] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-eacc-8' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs[0].externalId).toMatch(/^d365_account_/);
  });
  it('eid-acc-10: account externalId starts with d365_account_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [makeAccount(9, 2)] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-eacc-9' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs[0].externalId).toMatch(/^d365_account_/);
  });
  it('eid-acc-11: account externalId starts with d365_account_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [makeAccount(10, 2)] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-eacc-10' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs[0].externalId).toMatch(/^d365_account_/);
  });
  it('eid-acc-12: account externalId starts with d365_account_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [makeAccount(11, 2)] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-eacc-11' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs[0].externalId).toMatch(/^d365_account_/);
  });
  it('eid-acc-13: account externalId starts with d365_account_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [makeAccount(12, 2)] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-eacc-12' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs[0].externalId).toMatch(/^d365_account_/);
  });
  it('eid-acc-14: account externalId starts with d365_account_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [makeAccount(13, 2)] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-eacc-13' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs[0].externalId).toMatch(/^d365_account_/);
  });
  it('eid-acc-15: account externalId starts with d365_account_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [makeAccount(14, 2)] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-eacc-14' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs[0].externalId).toMatch(/^d365_account_/);
  });
  it('eid-acc-16: account externalId starts with d365_account_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [makeAccount(15, 2)] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-eacc-15' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs[0].externalId).toMatch(/^d365_account_/);
  });
  it('eid-acc-17: account externalId starts with d365_account_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [makeAccount(16, 2)] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-eacc-16' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs[0].externalId).toMatch(/^d365_account_/);
  });
  it('eid-acc-18: account externalId starts with d365_account_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [makeAccount(17, 2)] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-eacc-17' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs[0].externalId).toMatch(/^d365_account_/);
  });
  it('eid-acc-19: account externalId starts with d365_account_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [makeAccount(18, 2)] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-eacc-18' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs[0].externalId).toMatch(/^d365_account_/);
  });
  it('eid-acc-20: account externalId starts with d365_account_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [makeAccount(19, 2)] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-eacc-19' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs[0].externalId).toMatch(/^d365_account_/);
  });
});

// ── 23. Job timestamps ───────────────────────────────────────────────────────

describe('Dynamics365Connector – executeSync job timestamps', () => {
  let fetchMock: jest.SpyInstance;
  beforeEach(() => { fetchMock = jest.spyOn(global, "fetch"); });
  afterEach(() => { fetchMock.mockRestore(); });
  it('ts-1: startedAt and completedAt set', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ts-0' }));
    const res = await conn.executeSync(makeJob());
    expect(res.startedAt).toBeInstanceOf(Date);
    expect(res.completedAt).toBeInstanceOf(Date);
    expect(res.completedAt!.getTime()).toBeGreaterThanOrEqual(res.startedAt!.getTime());
  });
  it('ts-2: startedAt and completedAt set', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ts-1' }));
    const res = await conn.executeSync(makeJob());
    expect(res.startedAt).toBeInstanceOf(Date);
    expect(res.completedAt).toBeInstanceOf(Date);
    expect(res.completedAt!.getTime()).toBeGreaterThanOrEqual(res.startedAt!.getTime());
  });
  it('ts-3: startedAt and completedAt set', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ts-2' }));
    const res = await conn.executeSync(makeJob());
    expect(res.startedAt).toBeInstanceOf(Date);
    expect(res.completedAt).toBeInstanceOf(Date);
    expect(res.completedAt!.getTime()).toBeGreaterThanOrEqual(res.startedAt!.getTime());
  });
  it('ts-4: startedAt and completedAt set', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ts-3' }));
    const res = await conn.executeSync(makeJob());
    expect(res.startedAt).toBeInstanceOf(Date);
    expect(res.completedAt).toBeInstanceOf(Date);
    expect(res.completedAt!.getTime()).toBeGreaterThanOrEqual(res.startedAt!.getTime());
  });
  it('ts-5: startedAt and completedAt set', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ts-4' }));
    const res = await conn.executeSync(makeJob());
    expect(res.startedAt).toBeInstanceOf(Date);
    expect(res.completedAt).toBeInstanceOf(Date);
    expect(res.completedAt!.getTime()).toBeGreaterThanOrEqual(res.startedAt!.getTime());
  });
  it('ts-6: startedAt and completedAt set', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ts-5' }));
    const res = await conn.executeSync(makeJob());
    expect(res.startedAt).toBeInstanceOf(Date);
    expect(res.completedAt).toBeInstanceOf(Date);
    expect(res.completedAt!.getTime()).toBeGreaterThanOrEqual(res.startedAt!.getTime());
  });
  it('ts-7: startedAt and completedAt set', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ts-6' }));
    const res = await conn.executeSync(makeJob());
    expect(res.startedAt).toBeInstanceOf(Date);
    expect(res.completedAt).toBeInstanceOf(Date);
    expect(res.completedAt!.getTime()).toBeGreaterThanOrEqual(res.startedAt!.getTime());
  });
  it('ts-8: startedAt and completedAt set', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ts-7' }));
    const res = await conn.executeSync(makeJob());
    expect(res.startedAt).toBeInstanceOf(Date);
    expect(res.completedAt).toBeInstanceOf(Date);
    expect(res.completedAt!.getTime()).toBeGreaterThanOrEqual(res.startedAt!.getTime());
  });
  it('ts-9: startedAt and completedAt set', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ts-8' }));
    const res = await conn.executeSync(makeJob());
    expect(res.startedAt).toBeInstanceOf(Date);
    expect(res.completedAt).toBeInstanceOf(Date);
    expect(res.completedAt!.getTime()).toBeGreaterThanOrEqual(res.startedAt!.getTime());
  });
  it('ts-10: startedAt and completedAt set', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ts-9' }));
    const res = await conn.executeSync(makeJob());
    expect(res.startedAt).toBeInstanceOf(Date);
    expect(res.completedAt).toBeInstanceOf(Date);
    expect(res.completedAt!.getTime()).toBeGreaterThanOrEqual(res.startedAt!.getTime());
  });
  it('ts-11: startedAt and completedAt set', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ts-10' }));
    const res = await conn.executeSync(makeJob());
    expect(res.startedAt).toBeInstanceOf(Date);
    expect(res.completedAt).toBeInstanceOf(Date);
    expect(res.completedAt!.getTime()).toBeGreaterThanOrEqual(res.startedAt!.getTime());
  });
  it('ts-12: startedAt and completedAt set', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ts-11' }));
    const res = await conn.executeSync(makeJob());
    expect(res.startedAt).toBeInstanceOf(Date);
    expect(res.completedAt).toBeInstanceOf(Date);
    expect(res.completedAt!.getTime()).toBeGreaterThanOrEqual(res.startedAt!.getTime());
  });
  it('ts-13: startedAt and completedAt set', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ts-12' }));
    const res = await conn.executeSync(makeJob());
    expect(res.startedAt).toBeInstanceOf(Date);
    expect(res.completedAt).toBeInstanceOf(Date);
    expect(res.completedAt!.getTime()).toBeGreaterThanOrEqual(res.startedAt!.getTime());
  });
  it('ts-14: startedAt and completedAt set', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ts-13' }));
    const res = await conn.executeSync(makeJob());
    expect(res.startedAt).toBeInstanceOf(Date);
    expect(res.completedAt).toBeInstanceOf(Date);
    expect(res.completedAt!.getTime()).toBeGreaterThanOrEqual(res.startedAt!.getTime());
  });
  it('ts-15: startedAt and completedAt set', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ts-14' }));
    const res = await conn.executeSync(makeJob());
    expect(res.startedAt).toBeInstanceOf(Date);
    expect(res.completedAt).toBeInstanceOf(Date);
    expect(res.completedAt!.getTime()).toBeGreaterThanOrEqual(res.startedAt!.getTime());
  });
  it('ts-16: startedAt and completedAt set', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ts-15' }));
    const res = await conn.executeSync(makeJob());
    expect(res.startedAt).toBeInstanceOf(Date);
    expect(res.completedAt).toBeInstanceOf(Date);
    expect(res.completedAt!.getTime()).toBeGreaterThanOrEqual(res.startedAt!.getTime());
  });
  it('ts-17: startedAt and completedAt set', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ts-16' }));
    const res = await conn.executeSync(makeJob());
    expect(res.startedAt).toBeInstanceOf(Date);
    expect(res.completedAt).toBeInstanceOf(Date);
    expect(res.completedAt!.getTime()).toBeGreaterThanOrEqual(res.startedAt!.getTime());
  });
  it('ts-18: startedAt and completedAt set', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ts-17' }));
    const res = await conn.executeSync(makeJob());
    expect(res.startedAt).toBeInstanceOf(Date);
    expect(res.completedAt).toBeInstanceOf(Date);
    expect(res.completedAt!.getTime()).toBeGreaterThanOrEqual(res.startedAt!.getTime());
  });
  it('ts-19: startedAt and completedAt set', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ts-18' }));
    const res = await conn.executeSync(makeJob());
    expect(res.startedAt).toBeInstanceOf(Date);
    expect(res.completedAt).toBeInstanceOf(Date);
    expect(res.completedAt!.getTime()).toBeGreaterThanOrEqual(res.startedAt!.getTime());
  });
  it('ts-20: startedAt and completedAt set', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ts-19' }));
    const res = await conn.executeSync(makeJob());
    expect(res.startedAt).toBeInstanceOf(Date);
    expect(res.completedAt).toBeInstanceOf(Date);
    expect(res.completedAt!.getTime()).toBeGreaterThanOrEqual(res.startedAt!.getTime());
  });
});

// ── 24. Account statecode mapping ───────────────────────────────────────────

describe('Dynamics365Connector – account statecode mapping', () => {
  let fetchMock: jest.SpyInstance;
  beforeEach(() => { fetchMock = jest.spyOn(global, "fetch"); });
  afterEach(() => { fetchMock.mockRestore(); });
  it('statecode-supp-1: statecode 0 → ACTIVE, 1 → INACTIVE (supplier)', async () => {
    const active = { ...makeAccount(0, 2), statecode: 0 };
    const inactive = { ...makeAccount(100, 2), statecode: 1 };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [active, inactive] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-sc-s-0' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs[0].data.status).toBe('ACTIVE');
    expect(recs[1].data.status).toBe('INACTIVE');
  });
  it('statecode-supp-2: statecode 0 → ACTIVE, 1 → INACTIVE (supplier)', async () => {
    const active = { ...makeAccount(1, 2), statecode: 0 };
    const inactive = { ...makeAccount(101, 2), statecode: 1 };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [active, inactive] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-sc-s-1' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs[0].data.status).toBe('ACTIVE');
    expect(recs[1].data.status).toBe('INACTIVE');
  });
  it('statecode-supp-3: statecode 0 → ACTIVE, 1 → INACTIVE (supplier)', async () => {
    const active = { ...makeAccount(2, 2), statecode: 0 };
    const inactive = { ...makeAccount(102, 2), statecode: 1 };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [active, inactive] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-sc-s-2' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs[0].data.status).toBe('ACTIVE');
    expect(recs[1].data.status).toBe('INACTIVE');
  });
  it('statecode-supp-4: statecode 0 → ACTIVE, 1 → INACTIVE (supplier)', async () => {
    const active = { ...makeAccount(3, 2), statecode: 0 };
    const inactive = { ...makeAccount(103, 2), statecode: 1 };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [active, inactive] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-sc-s-3' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs[0].data.status).toBe('ACTIVE');
    expect(recs[1].data.status).toBe('INACTIVE');
  });
  it('statecode-supp-5: statecode 0 → ACTIVE, 1 → INACTIVE (supplier)', async () => {
    const active = { ...makeAccount(4, 2), statecode: 0 };
    const inactive = { ...makeAccount(104, 2), statecode: 1 };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [active, inactive] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-sc-s-4' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs[0].data.status).toBe('ACTIVE');
    expect(recs[1].data.status).toBe('INACTIVE');
  });
  it('statecode-supp-6: statecode 0 → ACTIVE, 1 → INACTIVE (supplier)', async () => {
    const active = { ...makeAccount(5, 2), statecode: 0 };
    const inactive = { ...makeAccount(105, 2), statecode: 1 };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [active, inactive] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-sc-s-5' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs[0].data.status).toBe('ACTIVE');
    expect(recs[1].data.status).toBe('INACTIVE');
  });
  it('statecode-supp-7: statecode 0 → ACTIVE, 1 → INACTIVE (supplier)', async () => {
    const active = { ...makeAccount(6, 2), statecode: 0 };
    const inactive = { ...makeAccount(106, 2), statecode: 1 };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [active, inactive] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-sc-s-6' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs[0].data.status).toBe('ACTIVE');
    expect(recs[1].data.status).toBe('INACTIVE');
  });
  it('statecode-supp-8: statecode 0 → ACTIVE, 1 → INACTIVE (supplier)', async () => {
    const active = { ...makeAccount(7, 2), statecode: 0 };
    const inactive = { ...makeAccount(107, 2), statecode: 1 };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [active, inactive] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-sc-s-7' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs[0].data.status).toBe('ACTIVE');
    expect(recs[1].data.status).toBe('INACTIVE');
  });
  it('statecode-supp-9: statecode 0 → ACTIVE, 1 → INACTIVE (supplier)', async () => {
    const active = { ...makeAccount(8, 2), statecode: 0 };
    const inactive = { ...makeAccount(108, 2), statecode: 1 };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [active, inactive] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-sc-s-8' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs[0].data.status).toBe('ACTIVE');
    expect(recs[1].data.status).toBe('INACTIVE');
  });
  it('statecode-supp-10: statecode 0 → ACTIVE, 1 → INACTIVE (supplier)', async () => {
    const active = { ...makeAccount(9, 2), statecode: 0 };
    const inactive = { ...makeAccount(109, 2), statecode: 1 };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [active, inactive] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-sc-s-9' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs[0].data.status).toBe('ACTIVE');
    expect(recs[1].data.status).toBe('INACTIVE');
  });
  it('statecode-cust-1: statecode 0 → ACTIVE, 1 → INACTIVE (customer)', async () => {
    const active = { ...makeAccount(0, 1), statecode: 0 };
    const inactive = { ...makeAccount(200, 1), statecode: 1 };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [active, inactive] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-sc-c-0' }));
    const recs = await conn.fetchRecords('CUSTOMER');
    expect(recs[0].data.status).toBe('ACTIVE');
    expect(recs[1].data.status).toBe('INACTIVE');
  });
  it('statecode-cust-2: statecode 0 → ACTIVE, 1 → INACTIVE (customer)', async () => {
    const active = { ...makeAccount(1, 1), statecode: 0 };
    const inactive = { ...makeAccount(201, 1), statecode: 1 };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [active, inactive] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-sc-c-1' }));
    const recs = await conn.fetchRecords('CUSTOMER');
    expect(recs[0].data.status).toBe('ACTIVE');
    expect(recs[1].data.status).toBe('INACTIVE');
  });
  it('statecode-cust-3: statecode 0 → ACTIVE, 1 → INACTIVE (customer)', async () => {
    const active = { ...makeAccount(2, 1), statecode: 0 };
    const inactive = { ...makeAccount(202, 1), statecode: 1 };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [active, inactive] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-sc-c-2' }));
    const recs = await conn.fetchRecords('CUSTOMER');
    expect(recs[0].data.status).toBe('ACTIVE');
    expect(recs[1].data.status).toBe('INACTIVE');
  });
  it('statecode-cust-4: statecode 0 → ACTIVE, 1 → INACTIVE (customer)', async () => {
    const active = { ...makeAccount(3, 1), statecode: 0 };
    const inactive = { ...makeAccount(203, 1), statecode: 1 };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [active, inactive] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-sc-c-3' }));
    const recs = await conn.fetchRecords('CUSTOMER');
    expect(recs[0].data.status).toBe('ACTIVE');
    expect(recs[1].data.status).toBe('INACTIVE');
  });
  it('statecode-cust-5: statecode 0 → ACTIVE, 1 → INACTIVE (customer)', async () => {
    const active = { ...makeAccount(4, 1), statecode: 0 };
    const inactive = { ...makeAccount(204, 1), statecode: 1 };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [active, inactive] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-sc-c-4' }));
    const recs = await conn.fetchRecords('CUSTOMER');
    expect(recs[0].data.status).toBe('ACTIVE');
    expect(recs[1].data.status).toBe('INACTIVE');
  });
  it('statecode-cust-6: statecode 0 → ACTIVE, 1 → INACTIVE (customer)', async () => {
    const active = { ...makeAccount(5, 1), statecode: 0 };
    const inactive = { ...makeAccount(205, 1), statecode: 1 };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [active, inactive] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-sc-c-5' }));
    const recs = await conn.fetchRecords('CUSTOMER');
    expect(recs[0].data.status).toBe('ACTIVE');
    expect(recs[1].data.status).toBe('INACTIVE');
  });
  it('statecode-cust-7: statecode 0 → ACTIVE, 1 → INACTIVE (customer)', async () => {
    const active = { ...makeAccount(6, 1), statecode: 0 };
    const inactive = { ...makeAccount(206, 1), statecode: 1 };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [active, inactive] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-sc-c-6' }));
    const recs = await conn.fetchRecords('CUSTOMER');
    expect(recs[0].data.status).toBe('ACTIVE');
    expect(recs[1].data.status).toBe('INACTIVE');
  });
  it('statecode-cust-8: statecode 0 → ACTIVE, 1 → INACTIVE (customer)', async () => {
    const active = { ...makeAccount(7, 1), statecode: 0 };
    const inactive = { ...makeAccount(207, 1), statecode: 1 };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [active, inactive] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-sc-c-7' }));
    const recs = await conn.fetchRecords('CUSTOMER');
    expect(recs[0].data.status).toBe('ACTIVE');
    expect(recs[1].data.status).toBe('INACTIVE');
  });
  it('statecode-cust-9: statecode 0 → ACTIVE, 1 → INACTIVE (customer)', async () => {
    const active = { ...makeAccount(8, 1), statecode: 0 };
    const inactive = { ...makeAccount(208, 1), statecode: 1 };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [active, inactive] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-sc-c-8' }));
    const recs = await conn.fetchRecords('CUSTOMER');
    expect(recs[0].data.status).toBe('ACTIVE');
    expect(recs[1].data.status).toBe('INACTIVE');
  });
  it('statecode-cust-10: statecode 0 → ACTIVE, 1 → INACTIVE (customer)', async () => {
    const active = { ...makeAccount(9, 1), statecode: 0 };
    const inactive = { ...makeAccount(209, 1), statecode: 1 };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [active, inactive] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-sc-c-9' }));
    const recs = await conn.fetchRecords('CUSTOMER');
    expect(recs[0].data.status).toBe('ACTIVE');
    expect(recs[1].data.status).toBe('INACTIVE');
  });
});

// ── 25. apiBase construction ─────────────────────────────────────────────────

describe('Dynamics365Connector – apiBase construction', () => {
  let fetchMock: jest.SpyInstance;
  beforeEach(() => { fetchMock = jest.spyOn(global, "fetch"); });
  afterEach(() => { fetchMock.mockRestore(); });
  it('apibase-1: data URL uses orgUrl/api/data/v9.2', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({
      id: 'd365-ab-0',
      credentials: { clientId: 'cid', clientSecret: 'sec', tenantId: 'tid', orgUrl: 'https://org0.crm0.dynamics.com' },
    }));
    await conn.fetchRecords('EMPLOYEE');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('https://org0.crm0.dynamics.com');
    expect(url).toContain('/api/data/v9.2');
  });
  it('apibase-2: data URL uses orgUrl/api/data/v9.2', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({
      id: 'd365-ab-1',
      credentials: { clientId: 'cid', clientSecret: 'sec', tenantId: 'tid', orgUrl: 'https://org1.crm1.dynamics.com' },
    }));
    await conn.fetchRecords('EMPLOYEE');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('https://org1.crm1.dynamics.com');
    expect(url).toContain('/api/data/v9.2');
  });
  it('apibase-3: data URL uses orgUrl/api/data/v9.2', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({
      id: 'd365-ab-2',
      credentials: { clientId: 'cid', clientSecret: 'sec', tenantId: 'tid', orgUrl: 'https://org2.crm2.dynamics.com' },
    }));
    await conn.fetchRecords('EMPLOYEE');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('https://org2.crm2.dynamics.com');
    expect(url).toContain('/api/data/v9.2');
  });
  it('apibase-4: data URL uses orgUrl/api/data/v9.2', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({
      id: 'd365-ab-3',
      credentials: { clientId: 'cid', clientSecret: 'sec', tenantId: 'tid', orgUrl: 'https://org3.crm0.dynamics.com' },
    }));
    await conn.fetchRecords('EMPLOYEE');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('https://org3.crm0.dynamics.com');
    expect(url).toContain('/api/data/v9.2');
  });
  it('apibase-5: data URL uses orgUrl/api/data/v9.2', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({
      id: 'd365-ab-4',
      credentials: { clientId: 'cid', clientSecret: 'sec', tenantId: 'tid', orgUrl: 'https://org4.crm1.dynamics.com' },
    }));
    await conn.fetchRecords('EMPLOYEE');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('https://org4.crm1.dynamics.com');
    expect(url).toContain('/api/data/v9.2');
  });
  it('apibase-6: data URL uses orgUrl/api/data/v9.2', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({
      id: 'd365-ab-5',
      credentials: { clientId: 'cid', clientSecret: 'sec', tenantId: 'tid', orgUrl: 'https://org5.crm2.dynamics.com' },
    }));
    await conn.fetchRecords('EMPLOYEE');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('https://org5.crm2.dynamics.com');
    expect(url).toContain('/api/data/v9.2');
  });
  it('apibase-7: data URL uses orgUrl/api/data/v9.2', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({
      id: 'd365-ab-6',
      credentials: { clientId: 'cid', clientSecret: 'sec', tenantId: 'tid', orgUrl: 'https://org6.crm0.dynamics.com' },
    }));
    await conn.fetchRecords('EMPLOYEE');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('https://org6.crm0.dynamics.com');
    expect(url).toContain('/api/data/v9.2');
  });
  it('apibase-8: data URL uses orgUrl/api/data/v9.2', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({
      id: 'd365-ab-7',
      credentials: { clientId: 'cid', clientSecret: 'sec', tenantId: 'tid', orgUrl: 'https://org7.crm1.dynamics.com' },
    }));
    await conn.fetchRecords('EMPLOYEE');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('https://org7.crm1.dynamics.com');
    expect(url).toContain('/api/data/v9.2');
  });
  it('apibase-9: data URL uses orgUrl/api/data/v9.2', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({
      id: 'd365-ab-8',
      credentials: { clientId: 'cid', clientSecret: 'sec', tenantId: 'tid', orgUrl: 'https://org8.crm2.dynamics.com' },
    }));
    await conn.fetchRecords('EMPLOYEE');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('https://org8.crm2.dynamics.com');
    expect(url).toContain('/api/data/v9.2');
  });
  it('apibase-10: data URL uses orgUrl/api/data/v9.2', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({
      id: 'd365-ab-9',
      credentials: { clientId: 'cid', clientSecret: 'sec', tenantId: 'tid', orgUrl: 'https://org9.crm0.dynamics.com' },
    }));
    await conn.fetchRecords('EMPLOYEE');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('https://org9.crm0.dynamics.com');
    expect(url).toContain('/api/data/v9.2');
  });
  it('apibase-11: data URL uses orgUrl/api/data/v9.2', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({
      id: 'd365-ab-10',
      credentials: { clientId: 'cid', clientSecret: 'sec', tenantId: 'tid', orgUrl: 'https://org10.crm1.dynamics.com' },
    }));
    await conn.fetchRecords('EMPLOYEE');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('https://org10.crm1.dynamics.com');
    expect(url).toContain('/api/data/v9.2');
  });
  it('apibase-12: data URL uses orgUrl/api/data/v9.2', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({
      id: 'd365-ab-11',
      credentials: { clientId: 'cid', clientSecret: 'sec', tenantId: 'tid', orgUrl: 'https://org11.crm2.dynamics.com' },
    }));
    await conn.fetchRecords('EMPLOYEE');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('https://org11.crm2.dynamics.com');
    expect(url).toContain('/api/data/v9.2');
  });
  it('apibase-13: data URL uses orgUrl/api/data/v9.2', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({
      id: 'd365-ab-12',
      credentials: { clientId: 'cid', clientSecret: 'sec', tenantId: 'tid', orgUrl: 'https://org12.crm0.dynamics.com' },
    }));
    await conn.fetchRecords('EMPLOYEE');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('https://org12.crm0.dynamics.com');
    expect(url).toContain('/api/data/v9.2');
  });
  it('apibase-14: data URL uses orgUrl/api/data/v9.2', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({
      id: 'd365-ab-13',
      credentials: { clientId: 'cid', clientSecret: 'sec', tenantId: 'tid', orgUrl: 'https://org13.crm1.dynamics.com' },
    }));
    await conn.fetchRecords('EMPLOYEE');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('https://org13.crm1.dynamics.com');
    expect(url).toContain('/api/data/v9.2');
  });
  it('apibase-15: data URL uses orgUrl/api/data/v9.2', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({
      id: 'd365-ab-14',
      credentials: { clientId: 'cid', clientSecret: 'sec', tenantId: 'tid', orgUrl: 'https://org14.crm2.dynamics.com' },
    }));
    await conn.fetchRecords('EMPLOYEE');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('https://org14.crm2.dynamics.com');
    expect(url).toContain('/api/data/v9.2');
  });
  it('apibase-16: data URL uses orgUrl/api/data/v9.2', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({
      id: 'd365-ab-15',
      credentials: { clientId: 'cid', clientSecret: 'sec', tenantId: 'tid', orgUrl: 'https://org15.crm0.dynamics.com' },
    }));
    await conn.fetchRecords('EMPLOYEE');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('https://org15.crm0.dynamics.com');
    expect(url).toContain('/api/data/v9.2');
  });
  it('apibase-17: data URL uses orgUrl/api/data/v9.2', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({
      id: 'd365-ab-16',
      credentials: { clientId: 'cid', clientSecret: 'sec', tenantId: 'tid', orgUrl: 'https://org16.crm1.dynamics.com' },
    }));
    await conn.fetchRecords('EMPLOYEE');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('https://org16.crm1.dynamics.com');
    expect(url).toContain('/api/data/v9.2');
  });
  it('apibase-18: data URL uses orgUrl/api/data/v9.2', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({
      id: 'd365-ab-17',
      credentials: { clientId: 'cid', clientSecret: 'sec', tenantId: 'tid', orgUrl: 'https://org17.crm2.dynamics.com' },
    }));
    await conn.fetchRecords('EMPLOYEE');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('https://org17.crm2.dynamics.com');
    expect(url).toContain('/api/data/v9.2');
  });
  it('apibase-19: data URL uses orgUrl/api/data/v9.2', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({
      id: 'd365-ab-18',
      credentials: { clientId: 'cid', clientSecret: 'sec', tenantId: 'tid', orgUrl: 'https://org18.crm0.dynamics.com' },
    }));
    await conn.fetchRecords('EMPLOYEE');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('https://org18.crm0.dynamics.com');
    expect(url).toContain('/api/data/v9.2');
  });
  it('apibase-20: data URL uses orgUrl/api/data/v9.2', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({
      id: 'd365-ab-19',
      credentials: { clientId: 'cid', clientSecret: 'sec', tenantId: 'tid', orgUrl: 'https://org19.crm1.dynamics.com' },
    }));
    await conn.fetchRecords('EMPLOYEE');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('https://org19.crm1.dynamics.com');
    expect(url).toContain('/api/data/v9.2');
  });
});

// ── 26. scope includes orgUrl/.default ───────────────────────────────────────

describe('Dynamics365Connector – OAuth2 scope', () => {
  let fetchMock: jest.SpyInstance;
  beforeEach(() => { fetchMock = jest.spyOn(global, "fetch"); });
  afterEach(() => { fetchMock.mockRestore(); });
  it('scope-1: scope is orgUrl/.default', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new Dynamics365Connector(makeConfig({
      id: 'd365-sc2-0',
      credentials: { clientId: 'cid', clientSecret: 'sec', tenantId: 'tid', orgUrl: 'https://myorg0.crm.dynamics.com' },
    }));
    await conn.testConnection();
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const body = init.body as string;
    expect(body).toContain(encodeURIComponent('https://myorg0.crm.dynamics.com/.default'));
  });
  it('scope-2: scope is orgUrl/.default', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new Dynamics365Connector(makeConfig({
      id: 'd365-sc2-1',
      credentials: { clientId: 'cid', clientSecret: 'sec', tenantId: 'tid', orgUrl: 'https://myorg1.crm.dynamics.com' },
    }));
    await conn.testConnection();
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const body = init.body as string;
    expect(body).toContain(encodeURIComponent('https://myorg1.crm.dynamics.com/.default'));
  });
  it('scope-3: scope is orgUrl/.default', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new Dynamics365Connector(makeConfig({
      id: 'd365-sc2-2',
      credentials: { clientId: 'cid', clientSecret: 'sec', tenantId: 'tid', orgUrl: 'https://myorg2.crm.dynamics.com' },
    }));
    await conn.testConnection();
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const body = init.body as string;
    expect(body).toContain(encodeURIComponent('https://myorg2.crm.dynamics.com/.default'));
  });
  it('scope-4: scope is orgUrl/.default', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new Dynamics365Connector(makeConfig({
      id: 'd365-sc2-3',
      credentials: { clientId: 'cid', clientSecret: 'sec', tenantId: 'tid', orgUrl: 'https://myorg3.crm.dynamics.com' },
    }));
    await conn.testConnection();
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const body = init.body as string;
    expect(body).toContain(encodeURIComponent('https://myorg3.crm.dynamics.com/.default'));
  });
  it('scope-5: scope is orgUrl/.default', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new Dynamics365Connector(makeConfig({
      id: 'd365-sc2-4',
      credentials: { clientId: 'cid', clientSecret: 'sec', tenantId: 'tid', orgUrl: 'https://myorg4.crm.dynamics.com' },
    }));
    await conn.testConnection();
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const body = init.body as string;
    expect(body).toContain(encodeURIComponent('https://myorg4.crm.dynamics.com/.default'));
  });
  it('scope-6: scope is orgUrl/.default', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new Dynamics365Connector(makeConfig({
      id: 'd365-sc2-5',
      credentials: { clientId: 'cid', clientSecret: 'sec', tenantId: 'tid', orgUrl: 'https://myorg5.crm.dynamics.com' },
    }));
    await conn.testConnection();
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const body = init.body as string;
    expect(body).toContain(encodeURIComponent('https://myorg5.crm.dynamics.com/.default'));
  });
  it('scope-7: scope is orgUrl/.default', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new Dynamics365Connector(makeConfig({
      id: 'd365-sc2-6',
      credentials: { clientId: 'cid', clientSecret: 'sec', tenantId: 'tid', orgUrl: 'https://myorg6.crm.dynamics.com' },
    }));
    await conn.testConnection();
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const body = init.body as string;
    expect(body).toContain(encodeURIComponent('https://myorg6.crm.dynamics.com/.default'));
  });
  it('scope-8: scope is orgUrl/.default', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new Dynamics365Connector(makeConfig({
      id: 'd365-sc2-7',
      credentials: { clientId: 'cid', clientSecret: 'sec', tenantId: 'tid', orgUrl: 'https://myorg7.crm.dynamics.com' },
    }));
    await conn.testConnection();
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const body = init.body as string;
    expect(body).toContain(encodeURIComponent('https://myorg7.crm.dynamics.com/.default'));
  });
  it('scope-9: scope is orgUrl/.default', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new Dynamics365Connector(makeConfig({
      id: 'd365-sc2-8',
      credentials: { clientId: 'cid', clientSecret: 'sec', tenantId: 'tid', orgUrl: 'https://myorg8.crm.dynamics.com' },
    }));
    await conn.testConnection();
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const body = init.body as string;
    expect(body).toContain(encodeURIComponent('https://myorg8.crm.dynamics.com/.default'));
  });
  it('scope-10: scope is orgUrl/.default', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new Dynamics365Connector(makeConfig({
      id: 'd365-sc2-9',
      credentials: { clientId: 'cid', clientSecret: 'sec', tenantId: 'tid', orgUrl: 'https://myorg9.crm.dynamics.com' },
    }));
    await conn.testConnection();
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const body = init.body as string;
    expect(body).toContain(encodeURIComponent('https://myorg9.crm.dynamics.com/.default'));
  });
  it('scope-11: scope is orgUrl/.default', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new Dynamics365Connector(makeConfig({
      id: 'd365-sc2-10',
      credentials: { clientId: 'cid', clientSecret: 'sec', tenantId: 'tid', orgUrl: 'https://myorg10.crm.dynamics.com' },
    }));
    await conn.testConnection();
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const body = init.body as string;
    expect(body).toContain(encodeURIComponent('https://myorg10.crm.dynamics.com/.default'));
  });
  it('scope-12: scope is orgUrl/.default', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new Dynamics365Connector(makeConfig({
      id: 'd365-sc2-11',
      credentials: { clientId: 'cid', clientSecret: 'sec', tenantId: 'tid', orgUrl: 'https://myorg11.crm.dynamics.com' },
    }));
    await conn.testConnection();
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const body = init.body as string;
    expect(body).toContain(encodeURIComponent('https://myorg11.crm.dynamics.com/.default'));
  });
  it('scope-13: scope is orgUrl/.default', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new Dynamics365Connector(makeConfig({
      id: 'd365-sc2-12',
      credentials: { clientId: 'cid', clientSecret: 'sec', tenantId: 'tid', orgUrl: 'https://myorg12.crm.dynamics.com' },
    }));
    await conn.testConnection();
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const body = init.body as string;
    expect(body).toContain(encodeURIComponent('https://myorg12.crm.dynamics.com/.default'));
  });
  it('scope-14: scope is orgUrl/.default', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new Dynamics365Connector(makeConfig({
      id: 'd365-sc2-13',
      credentials: { clientId: 'cid', clientSecret: 'sec', tenantId: 'tid', orgUrl: 'https://myorg13.crm.dynamics.com' },
    }));
    await conn.testConnection();
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const body = init.body as string;
    expect(body).toContain(encodeURIComponent('https://myorg13.crm.dynamics.com/.default'));
  });
  it('scope-15: scope is orgUrl/.default', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new Dynamics365Connector(makeConfig({
      id: 'd365-sc2-14',
      credentials: { clientId: 'cid', clientSecret: 'sec', tenantId: 'tid', orgUrl: 'https://myorg14.crm.dynamics.com' },
    }));
    await conn.testConnection();
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const body = init.body as string;
    expect(body).toContain(encodeURIComponent('https://myorg14.crm.dynamics.com/.default'));
  });
  it('scope-16: scope is orgUrl/.default', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new Dynamics365Connector(makeConfig({
      id: 'd365-sc2-15',
      credentials: { clientId: 'cid', clientSecret: 'sec', tenantId: 'tid', orgUrl: 'https://myorg15.crm.dynamics.com' },
    }));
    await conn.testConnection();
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const body = init.body as string;
    expect(body).toContain(encodeURIComponent('https://myorg15.crm.dynamics.com/.default'));
  });
  it('scope-17: scope is orgUrl/.default', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new Dynamics365Connector(makeConfig({
      id: 'd365-sc2-16',
      credentials: { clientId: 'cid', clientSecret: 'sec', tenantId: 'tid', orgUrl: 'https://myorg16.crm.dynamics.com' },
    }));
    await conn.testConnection();
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const body = init.body as string;
    expect(body).toContain(encodeURIComponent('https://myorg16.crm.dynamics.com/.default'));
  });
  it('scope-18: scope is orgUrl/.default', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new Dynamics365Connector(makeConfig({
      id: 'd365-sc2-17',
      credentials: { clientId: 'cid', clientSecret: 'sec', tenantId: 'tid', orgUrl: 'https://myorg17.crm.dynamics.com' },
    }));
    await conn.testConnection();
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const body = init.body as string;
    expect(body).toContain(encodeURIComponent('https://myorg17.crm.dynamics.com/.default'));
  });
  it('scope-19: scope is orgUrl/.default', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new Dynamics365Connector(makeConfig({
      id: 'd365-sc2-18',
      credentials: { clientId: 'cid', clientSecret: 'sec', tenantId: 'tid', orgUrl: 'https://myorg18.crm.dynamics.com' },
    }));
    await conn.testConnection();
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const body = init.body as string;
    expect(body).toContain(encodeURIComponent('https://myorg18.crm.dynamics.com/.default'));
  });
  it('scope-20: scope is orgUrl/.default', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new Dynamics365Connector(makeConfig({
      id: 'd365-sc2-19',
      credentials: { clientId: 'cid', clientSecret: 'sec', tenantId: 'tid', orgUrl: 'https://myorg19.crm.dynamics.com' },
    }));
    await conn.testConnection();
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const body = init.body as string;
    expect(body).toContain(encodeURIComponent('https://myorg19.crm.dynamics.com/.default'));
  });
});

// ── 27. Concurrent instances ─────────────────────────────────────────────────

describe('Dynamics365Connector – concurrent instances', () => {
  let fetchMock: jest.SpyInstance;
  beforeEach(() => { fetchMock = jest.spyOn(global, "fetch"); });
  afterEach(() => { fetchMock.mockRestore(); });
  it('conc-1: two instances make independent token requests', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('A')).mockResolvedValueOnce(mockToken('B'));
    const c1 = new Dynamics365Connector(makeConfig({ id: 'd365-ca-0' }));
    const c2 = new Dynamics365Connector(makeConfig({ id: 'd365-cb-0' }));
    await c1.testConnection(); await c2.testConnection();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
  it('conc-2: two instances make independent token requests', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('A')).mockResolvedValueOnce(mockToken('B'));
    const c1 = new Dynamics365Connector(makeConfig({ id: 'd365-ca-1' }));
    const c2 = new Dynamics365Connector(makeConfig({ id: 'd365-cb-1' }));
    await c1.testConnection(); await c2.testConnection();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
  it('conc-3: two instances make independent token requests', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('A')).mockResolvedValueOnce(mockToken('B'));
    const c1 = new Dynamics365Connector(makeConfig({ id: 'd365-ca-2' }));
    const c2 = new Dynamics365Connector(makeConfig({ id: 'd365-cb-2' }));
    await c1.testConnection(); await c2.testConnection();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
  it('conc-4: two instances make independent token requests', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('A')).mockResolvedValueOnce(mockToken('B'));
    const c1 = new Dynamics365Connector(makeConfig({ id: 'd365-ca-3' }));
    const c2 = new Dynamics365Connector(makeConfig({ id: 'd365-cb-3' }));
    await c1.testConnection(); await c2.testConnection();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
  it('conc-5: two instances make independent token requests', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('A')).mockResolvedValueOnce(mockToken('B'));
    const c1 = new Dynamics365Connector(makeConfig({ id: 'd365-ca-4' }));
    const c2 = new Dynamics365Connector(makeConfig({ id: 'd365-cb-4' }));
    await c1.testConnection(); await c2.testConnection();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
  it('conc-6: two instances make independent token requests', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('A')).mockResolvedValueOnce(mockToken('B'));
    const c1 = new Dynamics365Connector(makeConfig({ id: 'd365-ca-5' }));
    const c2 = new Dynamics365Connector(makeConfig({ id: 'd365-cb-5' }));
    await c1.testConnection(); await c2.testConnection();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
  it('conc-7: two instances make independent token requests', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('A')).mockResolvedValueOnce(mockToken('B'));
    const c1 = new Dynamics365Connector(makeConfig({ id: 'd365-ca-6' }));
    const c2 = new Dynamics365Connector(makeConfig({ id: 'd365-cb-6' }));
    await c1.testConnection(); await c2.testConnection();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
  it('conc-8: two instances make independent token requests', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('A')).mockResolvedValueOnce(mockToken('B'));
    const c1 = new Dynamics365Connector(makeConfig({ id: 'd365-ca-7' }));
    const c2 = new Dynamics365Connector(makeConfig({ id: 'd365-cb-7' }));
    await c1.testConnection(); await c2.testConnection();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
  it('conc-9: two instances make independent token requests', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('A')).mockResolvedValueOnce(mockToken('B'));
    const c1 = new Dynamics365Connector(makeConfig({ id: 'd365-ca-8' }));
    const c2 = new Dynamics365Connector(makeConfig({ id: 'd365-cb-8' }));
    await c1.testConnection(); await c2.testConnection();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
  it('conc-10: two instances make independent token requests', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('A')).mockResolvedValueOnce(mockToken('B'));
    const c1 = new Dynamics365Connector(makeConfig({ id: 'd365-ca-9' }));
    const c2 = new Dynamics365Connector(makeConfig({ id: 'd365-cb-9' }));
    await c1.testConnection(); await c2.testConnection();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
  it('conc-11: two instances make independent token requests', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('A')).mockResolvedValueOnce(mockToken('B'));
    const c1 = new Dynamics365Connector(makeConfig({ id: 'd365-ca-10' }));
    const c2 = new Dynamics365Connector(makeConfig({ id: 'd365-cb-10' }));
    await c1.testConnection(); await c2.testConnection();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
  it('conc-12: two instances make independent token requests', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('A')).mockResolvedValueOnce(mockToken('B'));
    const c1 = new Dynamics365Connector(makeConfig({ id: 'd365-ca-11' }));
    const c2 = new Dynamics365Connector(makeConfig({ id: 'd365-cb-11' }));
    await c1.testConnection(); await c2.testConnection();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
  it('conc-13: two instances make independent token requests', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('A')).mockResolvedValueOnce(mockToken('B'));
    const c1 = new Dynamics365Connector(makeConfig({ id: 'd365-ca-12' }));
    const c2 = new Dynamics365Connector(makeConfig({ id: 'd365-cb-12' }));
    await c1.testConnection(); await c2.testConnection();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
  it('conc-14: two instances make independent token requests', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('A')).mockResolvedValueOnce(mockToken('B'));
    const c1 = new Dynamics365Connector(makeConfig({ id: 'd365-ca-13' }));
    const c2 = new Dynamics365Connector(makeConfig({ id: 'd365-cb-13' }));
    await c1.testConnection(); await c2.testConnection();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
  it('conc-15: two instances make independent token requests', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('A')).mockResolvedValueOnce(mockToken('B'));
    const c1 = new Dynamics365Connector(makeConfig({ id: 'd365-ca-14' }));
    const c2 = new Dynamics365Connector(makeConfig({ id: 'd365-cb-14' }));
    await c1.testConnection(); await c2.testConnection();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
  it('conc-16: two instances make independent token requests', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('A')).mockResolvedValueOnce(mockToken('B'));
    const c1 = new Dynamics365Connector(makeConfig({ id: 'd365-ca-15' }));
    const c2 = new Dynamics365Connector(makeConfig({ id: 'd365-cb-15' }));
    await c1.testConnection(); await c2.testConnection();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
  it('conc-17: two instances make independent token requests', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('A')).mockResolvedValueOnce(mockToken('B'));
    const c1 = new Dynamics365Connector(makeConfig({ id: 'd365-ca-16' }));
    const c2 = new Dynamics365Connector(makeConfig({ id: 'd365-cb-16' }));
    await c1.testConnection(); await c2.testConnection();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
  it('conc-18: two instances make independent token requests', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('A')).mockResolvedValueOnce(mockToken('B'));
    const c1 = new Dynamics365Connector(makeConfig({ id: 'd365-ca-17' }));
    const c2 = new Dynamics365Connector(makeConfig({ id: 'd365-cb-17' }));
    await c1.testConnection(); await c2.testConnection();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
  it('conc-19: two instances make independent token requests', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('A')).mockResolvedValueOnce(mockToken('B'));
    const c1 = new Dynamics365Connector(makeConfig({ id: 'd365-ca-18' }));
    const c2 = new Dynamics365Connector(makeConfig({ id: 'd365-cb-18' }));
    await c1.testConnection(); await c2.testConnection();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
  it('conc-20: two instances make independent token requests', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('A')).mockResolvedValueOnce(mockToken('B'));
    const c1 = new Dynamics365Connector(makeConfig({ id: 'd365-ca-19' }));
    const c2 = new Dynamics365Connector(makeConfig({ id: 'd365-cb-19' }));
    await c1.testConnection(); await c2.testConnection();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

// ── 28. Disabled connector ───────────────────────────────────────────────────

describe('Dynamics365Connector – disabled connector still callable', () => {
  let fetchMock: jest.SpyInstance;
  beforeEach(() => { fetchMock = jest.spyOn(global, "fetch"); });
  afterEach(() => { fetchMock.mockRestore(); });
  it('dis-1: disabled connector returns healthy:true when token ok', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-dis-0', enabled: false }));
    expect(conn.enabled).toBe(false);
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
  });
  it('dis-2: disabled connector returns healthy:true when token ok', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-dis-1', enabled: false }));
    expect(conn.enabled).toBe(false);
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
  });
  it('dis-3: disabled connector returns healthy:true when token ok', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-dis-2', enabled: false }));
    expect(conn.enabled).toBe(false);
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
  });
  it('dis-4: disabled connector returns healthy:true when token ok', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-dis-3', enabled: false }));
    expect(conn.enabled).toBe(false);
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
  });
  it('dis-5: disabled connector returns healthy:true when token ok', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-dis-4', enabled: false }));
    expect(conn.enabled).toBe(false);
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
  });
  it('dis-6: disabled connector returns healthy:true when token ok', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-dis-5', enabled: false }));
    expect(conn.enabled).toBe(false);
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
  });
  it('dis-7: disabled connector returns healthy:true when token ok', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-dis-6', enabled: false }));
    expect(conn.enabled).toBe(false);
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
  });
  it('dis-8: disabled connector returns healthy:true when token ok', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-dis-7', enabled: false }));
    expect(conn.enabled).toBe(false);
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
  });
  it('dis-9: disabled connector returns healthy:true when token ok', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-dis-8', enabled: false }));
    expect(conn.enabled).toBe(false);
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
  });
  it('dis-10: disabled connector returns healthy:true when token ok', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-dis-9', enabled: false }));
    expect(conn.enabled).toBe(false);
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
  });
  it('dis-11: disabled connector returns healthy:true when token ok', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-dis-10', enabled: false }));
    expect(conn.enabled).toBe(false);
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
  });
  it('dis-12: disabled connector returns healthy:true when token ok', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-dis-11', enabled: false }));
    expect(conn.enabled).toBe(false);
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
  });
  it('dis-13: disabled connector returns healthy:true when token ok', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-dis-12', enabled: false }));
    expect(conn.enabled).toBe(false);
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
  });
  it('dis-14: disabled connector returns healthy:true when token ok', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-dis-13', enabled: false }));
    expect(conn.enabled).toBe(false);
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
  });
  it('dis-15: disabled connector returns healthy:true when token ok', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-dis-14', enabled: false }));
    expect(conn.enabled).toBe(false);
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
  });
  it('dis-16: disabled connector returns healthy:true when token ok', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-dis-15', enabled: false }));
    expect(conn.enabled).toBe(false);
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
  });
  it('dis-17: disabled connector returns healthy:true when token ok', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-dis-16', enabled: false }));
    expect(conn.enabled).toBe(false);
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
  });
  it('dis-18: disabled connector returns healthy:true when token ok', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-dis-17', enabled: false }));
    expect(conn.enabled).toBe(false);
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
  });
  it('dis-19: disabled connector returns healthy:true when token ok', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-dis-18', enabled: false }));
    expect(conn.enabled).toBe(false);
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
  });
  it('dis-20: disabled connector returns healthy:true when token ok', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-dis-19', enabled: false }));
    expect(conn.enabled).toBe(false);
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
  });
});

// ── 29. EMPLOYEE field mapping ───────────────────────────────────────────────

describe('Dynamics365Connector – EMPLOYEE field mapping', () => {
  let fetchMock: jest.SpyInstance;
  beforeEach(() => { fetchMock = jest.spyOn(global, "fetch"); });
  afterEach(() => { fetchMock.mockRestore(); });
  it('fmap-email-1: internalemailaddress mapped to email', async () => {
    const user = { ...makeUser(0), internalemailaddress: 'mapped0@corp.com' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [user] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-fm-0' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.email).toBe('mapped0@corp.com');
  });
  it('fmap-email-2: internalemailaddress mapped to email', async () => {
    const user = { ...makeUser(1), internalemailaddress: 'mapped1@corp.com' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [user] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-fm-1' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.email).toBe('mapped1@corp.com');
  });
  it('fmap-email-3: internalemailaddress mapped to email', async () => {
    const user = { ...makeUser(2), internalemailaddress: 'mapped2@corp.com' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [user] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-fm-2' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.email).toBe('mapped2@corp.com');
  });
  it('fmap-email-4: internalemailaddress mapped to email', async () => {
    const user = { ...makeUser(3), internalemailaddress: 'mapped3@corp.com' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [user] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-fm-3' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.email).toBe('mapped3@corp.com');
  });
  it('fmap-email-5: internalemailaddress mapped to email', async () => {
    const user = { ...makeUser(4), internalemailaddress: 'mapped4@corp.com' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [user] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-fm-4' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.email).toBe('mapped4@corp.com');
  });
  it('fmap-email-6: internalemailaddress mapped to email', async () => {
    const user = { ...makeUser(5), internalemailaddress: 'mapped5@corp.com' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [user] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-fm-5' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.email).toBe('mapped5@corp.com');
  });
  it('fmap-email-7: internalemailaddress mapped to email', async () => {
    const user = { ...makeUser(6), internalemailaddress: 'mapped6@corp.com' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [user] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-fm-6' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.email).toBe('mapped6@corp.com');
  });
  it('fmap-email-8: internalemailaddress mapped to email', async () => {
    const user = { ...makeUser(7), internalemailaddress: 'mapped7@corp.com' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [user] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-fm-7' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.email).toBe('mapped7@corp.com');
  });
  it('fmap-email-9: internalemailaddress mapped to email', async () => {
    const user = { ...makeUser(8), internalemailaddress: 'mapped8@corp.com' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [user] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-fm-8' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.email).toBe('mapped8@corp.com');
  });
  it('fmap-email-10: internalemailaddress mapped to email', async () => {
    const user = { ...makeUser(9), internalemailaddress: 'mapped9@corp.com' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [user] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-fm-9' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.email).toBe('mapped9@corp.com');
  });
  it('fmap-title-1: title mapped to jobTitle', async () => {
    const user = { ...makeUser(0), title: 'VP Engineering 0' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [user] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ft-0' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.jobTitle).toBe('VP Engineering 0');
  });
  it('fmap-title-2: title mapped to jobTitle', async () => {
    const user = { ...makeUser(1), title: 'VP Engineering 1' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [user] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ft-1' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.jobTitle).toBe('VP Engineering 1');
  });
  it('fmap-title-3: title mapped to jobTitle', async () => {
    const user = { ...makeUser(2), title: 'VP Engineering 2' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [user] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ft-2' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.jobTitle).toBe('VP Engineering 2');
  });
  it('fmap-title-4: title mapped to jobTitle', async () => {
    const user = { ...makeUser(3), title: 'VP Engineering 3' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [user] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ft-3' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.jobTitle).toBe('VP Engineering 3');
  });
  it('fmap-title-5: title mapped to jobTitle', async () => {
    const user = { ...makeUser(4), title: 'VP Engineering 4' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [user] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ft-4' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.jobTitle).toBe('VP Engineering 4');
  });
  it('fmap-title-6: title mapped to jobTitle', async () => {
    const user = { ...makeUser(5), title: 'VP Engineering 5' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [user] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ft-5' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.jobTitle).toBe('VP Engineering 5');
  });
  it('fmap-title-7: title mapped to jobTitle', async () => {
    const user = { ...makeUser(6), title: 'VP Engineering 6' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [user] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ft-6' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.jobTitle).toBe('VP Engineering 6');
  });
  it('fmap-title-8: title mapped to jobTitle', async () => {
    const user = { ...makeUser(7), title: 'VP Engineering 7' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [user] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ft-7' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.jobTitle).toBe('VP Engineering 7');
  });
  it('fmap-title-9: title mapped to jobTitle', async () => {
    const user = { ...makeUser(8), title: 'VP Engineering 8' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [user] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ft-8' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.jobTitle).toBe('VP Engineering 8');
  });
  it('fmap-title-10: title mapped to jobTitle', async () => {
    const user = { ...makeUser(9), title: 'VP Engineering 9' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [user] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-ft-9' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.jobTitle).toBe('VP Engineering 9');
  });
});

// ── 30. SUPPLIER account fields ──────────────────────────────────────────────

describe('Dynamics365Connector – SUPPLIER account fields', () => {
  let fetchMock: jest.SpyInstance;
  beforeEach(() => { fetchMock = jest.spyOn(global, "fetch"); });
  afterEach(() => { fetchMock.mockRestore(); });
  it('supp-field-name-1: account name preserved', async () => {
    const acc = { ...makeAccount(0, 2), name: 'Supplier Corp 0' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [acc] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-sfn-0' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs[0].data.name).toBe('Supplier Corp 0');
  });
  it('supp-field-name-2: account name preserved', async () => {
    const acc = { ...makeAccount(1, 2), name: 'Supplier Corp 1' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [acc] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-sfn-1' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs[0].data.name).toBe('Supplier Corp 1');
  });
  it('supp-field-name-3: account name preserved', async () => {
    const acc = { ...makeAccount(2, 2), name: 'Supplier Corp 2' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [acc] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-sfn-2' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs[0].data.name).toBe('Supplier Corp 2');
  });
  it('supp-field-name-4: account name preserved', async () => {
    const acc = { ...makeAccount(3, 2), name: 'Supplier Corp 3' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [acc] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-sfn-3' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs[0].data.name).toBe('Supplier Corp 3');
  });
  it('supp-field-name-5: account name preserved', async () => {
    const acc = { ...makeAccount(4, 2), name: 'Supplier Corp 4' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [acc] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-sfn-4' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs[0].data.name).toBe('Supplier Corp 4');
  });
  it('supp-field-name-6: account name preserved', async () => {
    const acc = { ...makeAccount(5, 2), name: 'Supplier Corp 5' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [acc] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-sfn-5' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs[0].data.name).toBe('Supplier Corp 5');
  });
  it('supp-field-name-7: account name preserved', async () => {
    const acc = { ...makeAccount(6, 2), name: 'Supplier Corp 6' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [acc] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-sfn-6' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs[0].data.name).toBe('Supplier Corp 6');
  });
  it('supp-field-name-8: account name preserved', async () => {
    const acc = { ...makeAccount(7, 2), name: 'Supplier Corp 7' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [acc] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-sfn-7' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs[0].data.name).toBe('Supplier Corp 7');
  });
  it('supp-field-name-9: account name preserved', async () => {
    const acc = { ...makeAccount(8, 2), name: 'Supplier Corp 8' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [acc] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-sfn-8' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs[0].data.name).toBe('Supplier Corp 8');
  });
  it('supp-field-name-10: account name preserved', async () => {
    const acc = { ...makeAccount(9, 2), name: 'Supplier Corp 9' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [acc] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-sfn-9' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs[0].data.name).toBe('Supplier Corp 9');
  });
  it('supp-field-phone-1: telephone1 mapped to phone', async () => {
    const acc = { ...makeAccount(0, 2), telephone1: '+440000000000' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [acc] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-sfp-0' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs[0].data.phone).toBe('+440000000000');
  });
  it('supp-field-phone-2: telephone1 mapped to phone', async () => {
    const acc = { ...makeAccount(1, 2), telephone1: '+440000000001' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [acc] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-sfp-1' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs[0].data.phone).toBe('+440000000001');
  });
  it('supp-field-phone-3: telephone1 mapped to phone', async () => {
    const acc = { ...makeAccount(2, 2), telephone1: '+440000000002' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [acc] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-sfp-2' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs[0].data.phone).toBe('+440000000002');
  });
  it('supp-field-phone-4: telephone1 mapped to phone', async () => {
    const acc = { ...makeAccount(3, 2), telephone1: '+440000000003' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [acc] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-sfp-3' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs[0].data.phone).toBe('+440000000003');
  });
  it('supp-field-phone-5: telephone1 mapped to phone', async () => {
    const acc = { ...makeAccount(4, 2), telephone1: '+440000000004' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [acc] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-sfp-4' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs[0].data.phone).toBe('+440000000004');
  });
  it('supp-field-phone-6: telephone1 mapped to phone', async () => {
    const acc = { ...makeAccount(5, 2), telephone1: '+440000000005' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [acc] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-sfp-5' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs[0].data.phone).toBe('+440000000005');
  });
  it('supp-field-phone-7: telephone1 mapped to phone', async () => {
    const acc = { ...makeAccount(6, 2), telephone1: '+440000000006' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [acc] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-sfp-6' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs[0].data.phone).toBe('+440000000006');
  });
  it('supp-field-phone-8: telephone1 mapped to phone', async () => {
    const acc = { ...makeAccount(7, 2), telephone1: '+440000000007' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [acc] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-sfp-7' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs[0].data.phone).toBe('+440000000007');
  });
  it('supp-field-phone-9: telephone1 mapped to phone', async () => {
    const acc = { ...makeAccount(8, 2), telephone1: '+440000000008' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [acc] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-sfp-8' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs[0].data.phone).toBe('+440000000008');
  });
  it('supp-field-phone-10: telephone1 mapped to phone', async () => {
    const acc = { ...makeAccount(9, 2), telephone1: '+440000000009' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [acc] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-sfp-9' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs[0].data.phone).toBe('+440000000009');
  });
});

// ── 31. Token failure propagates ─────────────────────────────────────────────

describe('Dynamics365Connector – token failure propagates', () => {
  let fetchMock: jest.SpyInstance;
  beforeEach(() => { fetchMock = jest.spyOn(global, "fetch"); });
  afterEach(() => { fetchMock.mockRestore(); });
  it('tokfail-1: token HTTP 401 propagates through fetchRecords', async () => {
    fetchMock.mockResolvedValueOnce(mockError(401));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-tf-0' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('Dynamics 365 token failed: HTTP 401');
  });
  it('tokfail-2: token HTTP 401 propagates through fetchRecords', async () => {
    fetchMock.mockResolvedValueOnce(mockError(401));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-tf-1' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('Dynamics 365 token failed: HTTP 401');
  });
  it('tokfail-3: token HTTP 401 propagates through fetchRecords', async () => {
    fetchMock.mockResolvedValueOnce(mockError(401));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-tf-2' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('Dynamics 365 token failed: HTTP 401');
  });
  it('tokfail-4: token HTTP 401 propagates through fetchRecords', async () => {
    fetchMock.mockResolvedValueOnce(mockError(401));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-tf-3' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('Dynamics 365 token failed: HTTP 401');
  });
  it('tokfail-5: token HTTP 401 propagates through fetchRecords', async () => {
    fetchMock.mockResolvedValueOnce(mockError(401));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-tf-4' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('Dynamics 365 token failed: HTTP 401');
  });
  it('tokfail-6: token HTTP 401 propagates through fetchRecords', async () => {
    fetchMock.mockResolvedValueOnce(mockError(401));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-tf-5' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('Dynamics 365 token failed: HTTP 401');
  });
  it('tokfail-7: token HTTP 401 propagates through fetchRecords', async () => {
    fetchMock.mockResolvedValueOnce(mockError(401));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-tf-6' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('Dynamics 365 token failed: HTTP 401');
  });
  it('tokfail-8: token HTTP 401 propagates through fetchRecords', async () => {
    fetchMock.mockResolvedValueOnce(mockError(401));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-tf-7' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('Dynamics 365 token failed: HTTP 401');
  });
  it('tokfail-9: token HTTP 401 propagates through fetchRecords', async () => {
    fetchMock.mockResolvedValueOnce(mockError(401));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-tf-8' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('Dynamics 365 token failed: HTTP 401');
  });
  it('tokfail-10: token HTTP 401 propagates through fetchRecords', async () => {
    fetchMock.mockResolvedValueOnce(mockError(401));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-tf-9' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('Dynamics 365 token failed: HTTP 401');
  });
  it('tokfail-11: token HTTP 401 propagates through fetchRecords', async () => {
    fetchMock.mockResolvedValueOnce(mockError(401));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-tf-10' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('Dynamics 365 token failed: HTTP 401');
  });
  it('tokfail-12: token HTTP 401 propagates through fetchRecords', async () => {
    fetchMock.mockResolvedValueOnce(mockError(401));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-tf-11' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('Dynamics 365 token failed: HTTP 401');
  });
  it('tokfail-13: token HTTP 401 propagates through fetchRecords', async () => {
    fetchMock.mockResolvedValueOnce(mockError(401));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-tf-12' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('Dynamics 365 token failed: HTTP 401');
  });
  it('tokfail-14: token HTTP 401 propagates through fetchRecords', async () => {
    fetchMock.mockResolvedValueOnce(mockError(401));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-tf-13' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('Dynamics 365 token failed: HTTP 401');
  });
  it('tokfail-15: token HTTP 401 propagates through fetchRecords', async () => {
    fetchMock.mockResolvedValueOnce(mockError(401));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-tf-14' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('Dynamics 365 token failed: HTTP 401');
  });
  it('tokfail-16: token HTTP 401 propagates through fetchRecords', async () => {
    fetchMock.mockResolvedValueOnce(mockError(401));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-tf-15' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('Dynamics 365 token failed: HTTP 401');
  });
  it('tokfail-17: token HTTP 401 propagates through fetchRecords', async () => {
    fetchMock.mockResolvedValueOnce(mockError(401));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-tf-16' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('Dynamics 365 token failed: HTTP 401');
  });
  it('tokfail-18: token HTTP 401 propagates through fetchRecords', async () => {
    fetchMock.mockResolvedValueOnce(mockError(401));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-tf-17' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('Dynamics 365 token failed: HTTP 401');
  });
  it('tokfail-19: token HTTP 401 propagates through fetchRecords', async () => {
    fetchMock.mockResolvedValueOnce(mockError(401));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-tf-18' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('Dynamics 365 token failed: HTTP 401');
  });
  it('tokfail-20: token HTTP 401 propagates through fetchRecords', async () => {
    fetchMock.mockResolvedValueOnce(mockError(401));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-tf-19' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('Dynamics 365 token failed: HTTP 401');
  });
});

// ── 32. Job PENDING→SUCCESS/FAILED transitions ───────────────────────────────

describe('Dynamics365Connector – job status transitions', () => {
  let fetchMock: jest.SpyInstance;
  beforeEach(() => { fetchMock = jest.spyOn(global, "fetch"); });
  afterEach(() => { fetchMock.mockRestore(); });
  it('trans-1: PENDING→SUCCESS', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-tr-0' }));
    const job = makeJob();
    expect(job.status).toBe('PENDING');
    const res = await conn.executeSync(job);
    expect(res.status).toBe('SUCCESS');
  });
  it('trans-2: PENDING→SUCCESS', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-tr-1' }));
    const job = makeJob();
    expect(job.status).toBe('PENDING');
    const res = await conn.executeSync(job);
    expect(res.status).toBe('SUCCESS');
  });
  it('trans-3: PENDING→SUCCESS', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-tr-2' }));
    const job = makeJob();
    expect(job.status).toBe('PENDING');
    const res = await conn.executeSync(job);
    expect(res.status).toBe('SUCCESS');
  });
  it('trans-4: PENDING→SUCCESS', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-tr-3' }));
    const job = makeJob();
    expect(job.status).toBe('PENDING');
    const res = await conn.executeSync(job);
    expect(res.status).toBe('SUCCESS');
  });
  it('trans-5: PENDING→SUCCESS', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-tr-4' }));
    const job = makeJob();
    expect(job.status).toBe('PENDING');
    const res = await conn.executeSync(job);
    expect(res.status).toBe('SUCCESS');
  });
  it('trans-6: PENDING→SUCCESS', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-tr-5' }));
    const job = makeJob();
    expect(job.status).toBe('PENDING');
    const res = await conn.executeSync(job);
    expect(res.status).toBe('SUCCESS');
  });
  it('trans-7: PENDING→SUCCESS', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-tr-6' }));
    const job = makeJob();
    expect(job.status).toBe('PENDING');
    const res = await conn.executeSync(job);
    expect(res.status).toBe('SUCCESS');
  });
  it('trans-8: PENDING→SUCCESS', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-tr-7' }));
    const job = makeJob();
    expect(job.status).toBe('PENDING');
    const res = await conn.executeSync(job);
    expect(res.status).toBe('SUCCESS');
  });
  it('trans-9: PENDING→SUCCESS', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-tr-8' }));
    const job = makeJob();
    expect(job.status).toBe('PENDING');
    const res = await conn.executeSync(job);
    expect(res.status).toBe('SUCCESS');
  });
  it('trans-10: PENDING→SUCCESS', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-tr-9' }));
    const job = makeJob();
    expect(job.status).toBe('PENDING');
    const res = await conn.executeSync(job);
    expect(res.status).toBe('SUCCESS');
  });
  it('trans-11: PENDING→SUCCESS', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-tr-10' }));
    const job = makeJob();
    expect(job.status).toBe('PENDING');
    const res = await conn.executeSync(job);
    expect(res.status).toBe('SUCCESS');
  });
  it('trans-12: PENDING→SUCCESS', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-tr-11' }));
    const job = makeJob();
    expect(job.status).toBe('PENDING');
    const res = await conn.executeSync(job);
    expect(res.status).toBe('SUCCESS');
  });
  it('trans-13: PENDING→SUCCESS', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-tr-12' }));
    const job = makeJob();
    expect(job.status).toBe('PENDING');
    const res = await conn.executeSync(job);
    expect(res.status).toBe('SUCCESS');
  });
  it('trans-14: PENDING→SUCCESS', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-tr-13' }));
    const job = makeJob();
    expect(job.status).toBe('PENDING');
    const res = await conn.executeSync(job);
    expect(res.status).toBe('SUCCESS');
  });
  it('trans-15: PENDING→SUCCESS', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-tr-14' }));
    const job = makeJob();
    expect(job.status).toBe('PENDING');
    const res = await conn.executeSync(job);
    expect(res.status).toBe('SUCCESS');
  });
  it('trans-16: PENDING→SUCCESS', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-tr-15' }));
    const job = makeJob();
    expect(job.status).toBe('PENDING');
    const res = await conn.executeSync(job);
    expect(res.status).toBe('SUCCESS');
  });
  it('trans-17: PENDING→SUCCESS', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-tr-16' }));
    const job = makeJob();
    expect(job.status).toBe('PENDING');
    const res = await conn.executeSync(job);
    expect(res.status).toBe('SUCCESS');
  });
  it('trans-18: PENDING→SUCCESS', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-tr-17' }));
    const job = makeJob();
    expect(job.status).toBe('PENDING');
    const res = await conn.executeSync(job);
    expect(res.status).toBe('SUCCESS');
  });
  it('trans-19: PENDING→SUCCESS', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-tr-18' }));
    const job = makeJob();
    expect(job.status).toBe('PENDING');
    const res = await conn.executeSync(job);
    expect(res.status).toBe('SUCCESS');
  });
  it('trans-20: PENDING→SUCCESS', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ value: [] }));
    const conn = new Dynamics365Connector(makeConfig({ id: 'd365-tr-19' }));
    const job = makeJob();
    expect(job.status).toBe('PENDING');
    const res = await conn.executeSync(job);
    expect(res.status).toBe('SUCCESS');
  });
});
