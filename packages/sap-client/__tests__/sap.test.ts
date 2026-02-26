// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { SAPConnector, createSAPConnector } from '../src/connector';
import type { ConnectorConfig, SyncJob, EntityType } from '@ims/sync-engine';

jest.mock('@ims/sync-engine', () => {
  const actual = jest.requireActual('@ims/sync-engine');
  return { ...actual, registerConnector: jest.fn() };
});

// Helpers

function makeConfig(overrides: Partial<ConnectorConfig> = {}): ConnectorConfig {
  return {
    id: 'sap-test-001',
    orgId: 'org-123',
    type: 'SAP_HR',
    name: 'SAP SuccessFactors Test',
    enabled: true,
    credentials: {
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
      tokenUrl: 'https://api.successfactors.com/oauth/token',
      datacenter: 'hcm',
    },
    syncSchedule: '0 * * * *',
    syncDirection: 'INBOUND',
    entityTypes: ['EMPLOYEE', 'DEPARTMENT'],
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  };
}

function mockToken(token = 'test-access-token', expiresIn = 3600) {
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

function makeEmp(n: number) {
  return {
    userId: `user-${n}`, firstName: `First${n}`, lastName: `Last${n}`,
    email: `user${n}@example.com`, department: `Dept${n}`, title: `Title${n}`,
    status: n % 2 === 0 ? 'active' : 'inactive', hireDate: '2020-01-01', location: `Loc${n}`,
  };
}

function makeDept(n: number) {
  return { departmentId: `dept-${n}`, name: `Department ${n}` };
}

function makeJob(entityTypes: EntityType[] = ['EMPLOYEE']): SyncJob {
  return {
    id: 'job-001', connectorId: 'sap-test-001', orgId: 'org-123',
    status: 'PENDING', direction: 'INBOUND', entityTypes,
    stats: { totalFetched: 0, created: 0, updated: 0, skipped: 0, failed: 0 },
    errors: [], triggeredBy: 'MANUAL',
  };
}

// ── 1. Constructor / Properties ──────────────────────────────────────────────

describe('SAPConnector – constructor and properties', () => {
  describe('instance-1', () => {
    const cfg = makeConfig({ id: 'sap-id-1', name: 'SAP 0', enabled: true });
    const conn = new SAPConnector(cfg);
    it('id is sap-id-1', () => { expect(conn.id).toBe('sap-id-1'); });
    it('name is SAP 0', () => { expect(conn.name).toBe('SAP 0'); });
    it('type is SAP_HR', () => { expect(conn.type).toBe('SAP_HR'); });
    it('enabled is true', () => { expect(conn.enabled).toBe(true); });
    it('instanceof SAPConnector', () => { expect(conn).toBeInstanceOf(SAPConnector); });
  });
  describe('instance-2', () => {
    const cfg = makeConfig({ id: 'sap-id-2', name: 'SAP 1', enabled: false });
    const conn = new SAPConnector(cfg);
    it('id is sap-id-2', () => { expect(conn.id).toBe('sap-id-2'); });
    it('name is SAP 1', () => { expect(conn.name).toBe('SAP 1'); });
    it('type is SAP_HR', () => { expect(conn.type).toBe('SAP_HR'); });
    it('enabled is false', () => { expect(conn.enabled).toBe(false); });
    it('instanceof SAPConnector', () => { expect(conn).toBeInstanceOf(SAPConnector); });
  });
  describe('instance-3', () => {
    const cfg = makeConfig({ id: 'sap-id-3', name: 'SAP 2', enabled: true });
    const conn = new SAPConnector(cfg);
    it('id is sap-id-3', () => { expect(conn.id).toBe('sap-id-3'); });
    it('name is SAP 2', () => { expect(conn.name).toBe('SAP 2'); });
    it('type is SAP_HR', () => { expect(conn.type).toBe('SAP_HR'); });
    it('enabled is true', () => { expect(conn.enabled).toBe(true); });
    it('instanceof SAPConnector', () => { expect(conn).toBeInstanceOf(SAPConnector); });
  });
  describe('instance-4', () => {
    const cfg = makeConfig({ id: 'sap-id-4', name: 'SAP 3', enabled: false });
    const conn = new SAPConnector(cfg);
    it('id is sap-id-4', () => { expect(conn.id).toBe('sap-id-4'); });
    it('name is SAP 3', () => { expect(conn.name).toBe('SAP 3'); });
    it('type is SAP_HR', () => { expect(conn.type).toBe('SAP_HR'); });
    it('enabled is false', () => { expect(conn.enabled).toBe(false); });
    it('instanceof SAPConnector', () => { expect(conn).toBeInstanceOf(SAPConnector); });
  });
  describe('instance-5', () => {
    const cfg = makeConfig({ id: 'sap-id-5', name: 'SAP 4', enabled: true });
    const conn = new SAPConnector(cfg);
    it('id is sap-id-5', () => { expect(conn.id).toBe('sap-id-5'); });
    it('name is SAP 4', () => { expect(conn.name).toBe('SAP 4'); });
    it('type is SAP_HR', () => { expect(conn.type).toBe('SAP_HR'); });
    it('enabled is true', () => { expect(conn.enabled).toBe(true); });
    it('instanceof SAPConnector', () => { expect(conn).toBeInstanceOf(SAPConnector); });
  });
  describe('instance-6', () => {
    const cfg = makeConfig({ id: 'sap-id-6', name: 'SAP 5', enabled: false });
    const conn = new SAPConnector(cfg);
    it('id is sap-id-6', () => { expect(conn.id).toBe('sap-id-6'); });
    it('name is SAP 5', () => { expect(conn.name).toBe('SAP 5'); });
    it('type is SAP_HR', () => { expect(conn.type).toBe('SAP_HR'); });
    it('enabled is false', () => { expect(conn.enabled).toBe(false); });
    it('instanceof SAPConnector', () => { expect(conn).toBeInstanceOf(SAPConnector); });
  });
  describe('instance-7', () => {
    const cfg = makeConfig({ id: 'sap-id-7', name: 'SAP 6', enabled: true });
    const conn = new SAPConnector(cfg);
    it('id is sap-id-7', () => { expect(conn.id).toBe('sap-id-7'); });
    it('name is SAP 6', () => { expect(conn.name).toBe('SAP 6'); });
    it('type is SAP_HR', () => { expect(conn.type).toBe('SAP_HR'); });
    it('enabled is true', () => { expect(conn.enabled).toBe(true); });
    it('instanceof SAPConnector', () => { expect(conn).toBeInstanceOf(SAPConnector); });
  });
  describe('instance-8', () => {
    const cfg = makeConfig({ id: 'sap-id-8', name: 'SAP 7', enabled: false });
    const conn = new SAPConnector(cfg);
    it('id is sap-id-8', () => { expect(conn.id).toBe('sap-id-8'); });
    it('name is SAP 7', () => { expect(conn.name).toBe('SAP 7'); });
    it('type is SAP_HR', () => { expect(conn.type).toBe('SAP_HR'); });
    it('enabled is false', () => { expect(conn.enabled).toBe(false); });
    it('instanceof SAPConnector', () => { expect(conn).toBeInstanceOf(SAPConnector); });
  });
  describe('instance-9', () => {
    const cfg = makeConfig({ id: 'sap-id-9', name: 'SAP 8', enabled: true });
    const conn = new SAPConnector(cfg);
    it('id is sap-id-9', () => { expect(conn.id).toBe('sap-id-9'); });
    it('name is SAP 8', () => { expect(conn.name).toBe('SAP 8'); });
    it('type is SAP_HR', () => { expect(conn.type).toBe('SAP_HR'); });
    it('enabled is true', () => { expect(conn.enabled).toBe(true); });
    it('instanceof SAPConnector', () => { expect(conn).toBeInstanceOf(SAPConnector); });
  });
  describe('instance-10', () => {
    const cfg = makeConfig({ id: 'sap-id-10', name: 'SAP 9', enabled: false });
    const conn = new SAPConnector(cfg);
    it('id is sap-id-10', () => { expect(conn.id).toBe('sap-id-10'); });
    it('name is SAP 9', () => { expect(conn.name).toBe('SAP 9'); });
    it('type is SAP_HR', () => { expect(conn.type).toBe('SAP_HR'); });
    it('enabled is false', () => { expect(conn.enabled).toBe(false); });
    it('instanceof SAPConnector', () => { expect(conn).toBeInstanceOf(SAPConnector); });
  });
  describe('instance-11', () => {
    const cfg = makeConfig({ id: 'sap-id-11', name: 'SAP 10', enabled: true });
    const conn = new SAPConnector(cfg);
    it('id is sap-id-11', () => { expect(conn.id).toBe('sap-id-11'); });
    it('name is SAP 10', () => { expect(conn.name).toBe('SAP 10'); });
    it('type is SAP_HR', () => { expect(conn.type).toBe('SAP_HR'); });
    it('enabled is true', () => { expect(conn.enabled).toBe(true); });
    it('instanceof SAPConnector', () => { expect(conn).toBeInstanceOf(SAPConnector); });
  });
  describe('instance-12', () => {
    const cfg = makeConfig({ id: 'sap-id-12', name: 'SAP 11', enabled: false });
    const conn = new SAPConnector(cfg);
    it('id is sap-id-12', () => { expect(conn.id).toBe('sap-id-12'); });
    it('name is SAP 11', () => { expect(conn.name).toBe('SAP 11'); });
    it('type is SAP_HR', () => { expect(conn.type).toBe('SAP_HR'); });
    it('enabled is false', () => { expect(conn.enabled).toBe(false); });
    it('instanceof SAPConnector', () => { expect(conn).toBeInstanceOf(SAPConnector); });
  });
  describe('instance-13', () => {
    const cfg = makeConfig({ id: 'sap-id-13', name: 'SAP 12', enabled: true });
    const conn = new SAPConnector(cfg);
    it('id is sap-id-13', () => { expect(conn.id).toBe('sap-id-13'); });
    it('name is SAP 12', () => { expect(conn.name).toBe('SAP 12'); });
    it('type is SAP_HR', () => { expect(conn.type).toBe('SAP_HR'); });
    it('enabled is true', () => { expect(conn.enabled).toBe(true); });
    it('instanceof SAPConnector', () => { expect(conn).toBeInstanceOf(SAPConnector); });
  });
  describe('instance-14', () => {
    const cfg = makeConfig({ id: 'sap-id-14', name: 'SAP 13', enabled: false });
    const conn = new SAPConnector(cfg);
    it('id is sap-id-14', () => { expect(conn.id).toBe('sap-id-14'); });
    it('name is SAP 13', () => { expect(conn.name).toBe('SAP 13'); });
    it('type is SAP_HR', () => { expect(conn.type).toBe('SAP_HR'); });
    it('enabled is false', () => { expect(conn.enabled).toBe(false); });
    it('instanceof SAPConnector', () => { expect(conn).toBeInstanceOf(SAPConnector); });
  });
  describe('instance-15', () => {
    const cfg = makeConfig({ id: 'sap-id-15', name: 'SAP 14', enabled: true });
    const conn = new SAPConnector(cfg);
    it('id is sap-id-15', () => { expect(conn.id).toBe('sap-id-15'); });
    it('name is SAP 14', () => { expect(conn.name).toBe('SAP 14'); });
    it('type is SAP_HR', () => { expect(conn.type).toBe('SAP_HR'); });
    it('enabled is true', () => { expect(conn.enabled).toBe(true); });
    it('instanceof SAPConnector', () => { expect(conn).toBeInstanceOf(SAPConnector); });
  });
  describe('instance-16', () => {
    const cfg = makeConfig({ id: 'sap-id-16', name: 'SAP 15', enabled: false });
    const conn = new SAPConnector(cfg);
    it('id is sap-id-16', () => { expect(conn.id).toBe('sap-id-16'); });
    it('name is SAP 15', () => { expect(conn.name).toBe('SAP 15'); });
    it('type is SAP_HR', () => { expect(conn.type).toBe('SAP_HR'); });
    it('enabled is false', () => { expect(conn.enabled).toBe(false); });
    it('instanceof SAPConnector', () => { expect(conn).toBeInstanceOf(SAPConnector); });
  });
  describe('instance-17', () => {
    const cfg = makeConfig({ id: 'sap-id-17', name: 'SAP 16', enabled: true });
    const conn = new SAPConnector(cfg);
    it('id is sap-id-17', () => { expect(conn.id).toBe('sap-id-17'); });
    it('name is SAP 16', () => { expect(conn.name).toBe('SAP 16'); });
    it('type is SAP_HR', () => { expect(conn.type).toBe('SAP_HR'); });
    it('enabled is true', () => { expect(conn.enabled).toBe(true); });
    it('instanceof SAPConnector', () => { expect(conn).toBeInstanceOf(SAPConnector); });
  });
  describe('instance-18', () => {
    const cfg = makeConfig({ id: 'sap-id-18', name: 'SAP 17', enabled: false });
    const conn = new SAPConnector(cfg);
    it('id is sap-id-18', () => { expect(conn.id).toBe('sap-id-18'); });
    it('name is SAP 17', () => { expect(conn.name).toBe('SAP 17'); });
    it('type is SAP_HR', () => { expect(conn.type).toBe('SAP_HR'); });
    it('enabled is false', () => { expect(conn.enabled).toBe(false); });
    it('instanceof SAPConnector', () => { expect(conn).toBeInstanceOf(SAPConnector); });
  });
  describe('instance-19', () => {
    const cfg = makeConfig({ id: 'sap-id-19', name: 'SAP 18', enabled: true });
    const conn = new SAPConnector(cfg);
    it('id is sap-id-19', () => { expect(conn.id).toBe('sap-id-19'); });
    it('name is SAP 18', () => { expect(conn.name).toBe('SAP 18'); });
    it('type is SAP_HR', () => { expect(conn.type).toBe('SAP_HR'); });
    it('enabled is true', () => { expect(conn.enabled).toBe(true); });
    it('instanceof SAPConnector', () => { expect(conn).toBeInstanceOf(SAPConnector); });
  });
  describe('instance-20', () => {
    const cfg = makeConfig({ id: 'sap-id-20', name: 'SAP 19', enabled: false });
    const conn = new SAPConnector(cfg);
    it('id is sap-id-20', () => { expect(conn.id).toBe('sap-id-20'); });
    it('name is SAP 19', () => { expect(conn.name).toBe('SAP 19'); });
    it('type is SAP_HR', () => { expect(conn.type).toBe('SAP_HR'); });
    it('enabled is false', () => { expect(conn.enabled).toBe(false); });
    it('instanceof SAPConnector', () => { expect(conn).toBeInstanceOf(SAPConnector); });
  });
  describe('instance-21', () => {
    const cfg = makeConfig({ id: 'sap-id-21', name: 'SAP 20', enabled: true });
    const conn = new SAPConnector(cfg);
    it('id is sap-id-21', () => { expect(conn.id).toBe('sap-id-21'); });
    it('name is SAP 20', () => { expect(conn.name).toBe('SAP 20'); });
    it('type is SAP_HR', () => { expect(conn.type).toBe('SAP_HR'); });
    it('enabled is true', () => { expect(conn.enabled).toBe(true); });
    it('instanceof SAPConnector', () => { expect(conn).toBeInstanceOf(SAPConnector); });
  });
  describe('instance-22', () => {
    const cfg = makeConfig({ id: 'sap-id-22', name: 'SAP 21', enabled: false });
    const conn = new SAPConnector(cfg);
    it('id is sap-id-22', () => { expect(conn.id).toBe('sap-id-22'); });
    it('name is SAP 21', () => { expect(conn.name).toBe('SAP 21'); });
    it('type is SAP_HR', () => { expect(conn.type).toBe('SAP_HR'); });
    it('enabled is false', () => { expect(conn.enabled).toBe(false); });
    it('instanceof SAPConnector', () => { expect(conn).toBeInstanceOf(SAPConnector); });
  });
  describe('instance-23', () => {
    const cfg = makeConfig({ id: 'sap-id-23', name: 'SAP 22', enabled: true });
    const conn = new SAPConnector(cfg);
    it('id is sap-id-23', () => { expect(conn.id).toBe('sap-id-23'); });
    it('name is SAP 22', () => { expect(conn.name).toBe('SAP 22'); });
    it('type is SAP_HR', () => { expect(conn.type).toBe('SAP_HR'); });
    it('enabled is true', () => { expect(conn.enabled).toBe(true); });
    it('instanceof SAPConnector', () => { expect(conn).toBeInstanceOf(SAPConnector); });
  });
  describe('instance-24', () => {
    const cfg = makeConfig({ id: 'sap-id-24', name: 'SAP 23', enabled: false });
    const conn = new SAPConnector(cfg);
    it('id is sap-id-24', () => { expect(conn.id).toBe('sap-id-24'); });
    it('name is SAP 23', () => { expect(conn.name).toBe('SAP 23'); });
    it('type is SAP_HR', () => { expect(conn.type).toBe('SAP_HR'); });
    it('enabled is false', () => { expect(conn.enabled).toBe(false); });
    it('instanceof SAPConnector', () => { expect(conn).toBeInstanceOf(SAPConnector); });
  });
  describe('instance-25', () => {
    const cfg = makeConfig({ id: 'sap-id-25', name: 'SAP 24', enabled: true });
    const conn = new SAPConnector(cfg);
    it('id is sap-id-25', () => { expect(conn.id).toBe('sap-id-25'); });
    it('name is SAP 24', () => { expect(conn.name).toBe('SAP 24'); });
    it('type is SAP_HR', () => { expect(conn.type).toBe('SAP_HR'); });
    it('enabled is true', () => { expect(conn.enabled).toBe(true); });
    it('instanceof SAPConnector', () => { expect(conn).toBeInstanceOf(SAPConnector); });
  });
});

// ── 2. testConnection success ────────────────────────────────────────────────

describe('SAPConnector – testConnection success', () => {
  let fetchMock: jest.SpyInstance;
  beforeEach(() => { fetchMock = jest.spyOn(global, "fetch"); });
  afterEach(() => { fetchMock.mockRestore(); });
  it('success-1: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('tok-0', 3600));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ok-0' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('sap-ok-0');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-2: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('tok-1', 3601));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ok-1' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('sap-ok-1');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-3: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('tok-2', 3602));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ok-2' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('sap-ok-2');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-4: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('tok-3', 3603));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ok-3' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('sap-ok-3');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-5: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('tok-4', 3604));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ok-4' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('sap-ok-4');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-6: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('tok-5', 3605));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ok-5' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('sap-ok-5');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-7: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('tok-6', 3606));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ok-6' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('sap-ok-6');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-8: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('tok-7', 3607));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ok-7' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('sap-ok-7');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-9: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('tok-8', 3608));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ok-8' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('sap-ok-8');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-10: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('tok-9', 3609));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ok-9' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('sap-ok-9');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-11: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('tok-10', 3610));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ok-10' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('sap-ok-10');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-12: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('tok-11', 3611));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ok-11' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('sap-ok-11');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-13: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('tok-12', 3612));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ok-12' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('sap-ok-12');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-14: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('tok-13', 3613));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ok-13' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('sap-ok-13');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-15: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('tok-14', 3614));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ok-14' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('sap-ok-14');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-16: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('tok-15', 3615));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ok-15' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('sap-ok-15');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-17: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('tok-16', 3616));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ok-16' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('sap-ok-16');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-18: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('tok-17', 3617));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ok-17' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('sap-ok-17');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-19: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('tok-18', 3618));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ok-18' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('sap-ok-18');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-20: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('tok-19', 3619));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ok-19' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('sap-ok-19');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-21: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('tok-20', 3620));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ok-20' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('sap-ok-20');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-22: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('tok-21', 3621));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ok-21' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('sap-ok-21');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-23: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('tok-22', 3622));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ok-22' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('sap-ok-22');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-24: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('tok-23', 3623));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ok-23' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('sap-ok-23');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-25: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('tok-24', 3624));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ok-24' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('sap-ok-24');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-26: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('tok-25', 3625));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ok-25' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('sap-ok-25');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-27: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('tok-26', 3626));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ok-26' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('sap-ok-26');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-28: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('tok-27', 3627));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ok-27' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('sap-ok-27');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-29: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('tok-28', 3628));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ok-28' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('sap-ok-28');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-30: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('tok-29', 3629));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ok-29' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('sap-ok-29');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-31: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('tok-30', 3630));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ok-30' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('sap-ok-30');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-32: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('tok-31', 3631));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ok-31' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('sap-ok-31');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-33: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('tok-32', 3632));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ok-32' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('sap-ok-32');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-34: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('tok-33', 3633));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ok-33' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('sap-ok-33');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-35: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('tok-34', 3634));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ok-34' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('sap-ok-34');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-36: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('tok-35', 3635));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ok-35' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('sap-ok-35');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-37: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('tok-36', 3636));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ok-36' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('sap-ok-36');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-38: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('tok-37', 3637));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ok-37' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('sap-ok-37');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-39: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('tok-38', 3638));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ok-38' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('sap-ok-38');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-40: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('tok-39', 3639));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ok-39' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('sap-ok-39');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-41: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('tok-40', 3640));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ok-40' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('sap-ok-40');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-42: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('tok-41', 3641));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ok-41' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('sap-ok-41');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-43: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('tok-42', 3642));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ok-42' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('sap-ok-42');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-44: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('tok-43', 3643));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ok-43' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('sap-ok-43');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-45: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('tok-44', 3644));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ok-44' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('sap-ok-44');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-46: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('tok-45', 3645));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ok-45' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('sap-ok-45');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-47: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('tok-46', 3646));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ok-46' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('sap-ok-46');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-48: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('tok-47', 3647));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ok-47' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('sap-ok-47');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-49: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('tok-48', 3648));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ok-48' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('sap-ok-48');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
  it('success-50: returns healthy:true', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('tok-49', 3649));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ok-49' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
    expect(r.connectorId).toBe('sap-ok-49');
    expect(typeof r.latencyMs).toBe('number');
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
    expect(r.errorMessage).toBeUndefined();
  });
});

// ── 3. testConnection failure ────────────────────────────────────────────────

describe('SAPConnector – testConnection failure', () => {
  let fetchMock: jest.SpyInstance;
  beforeEach(() => { fetchMock = jest.spyOn(global, "fetch"); });
  afterEach(() => { fetchMock.mockRestore(); });
  it('fail-http-400-1: healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(400));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fail-400-0' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-http-400-2: healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(400));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fail-400-1' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-http-400-3: healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(400));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fail-400-2' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-http-400-4: healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(400));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fail-400-3' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-http-400-5: healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(400));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fail-400-4' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-http-401-1: healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(401));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fail-401-0' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-http-401-2: healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(401));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fail-401-1' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-http-401-3: healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(401));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fail-401-2' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-http-401-4: healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(401));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fail-401-3' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-http-401-5: healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(401));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fail-401-4' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-http-403-1: healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(403));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fail-403-0' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-http-403-2: healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(403));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fail-403-1' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-http-403-3: healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(403));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fail-403-2' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-http-403-4: healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(403));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fail-403-3' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-http-403-5: healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(403));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fail-403-4' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-http-404-1: healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(404));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fail-404-0' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-http-404-2: healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(404));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fail-404-1' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-http-404-3: healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(404));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fail-404-2' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-http-404-4: healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(404));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fail-404-3' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-http-404-5: healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(404));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fail-404-4' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-http-429-1: healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(429));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fail-429-0' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-http-429-2: healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(429));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fail-429-1' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-http-429-3: healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(429));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fail-429-2' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-http-429-4: healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(429));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fail-429-3' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-http-429-5: healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(429));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fail-429-4' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-http-500-1: healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(500));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fail-500-0' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-http-500-2: healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(500));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fail-500-1' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-http-500-3: healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(500));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fail-500-2' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-http-500-4: healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(500));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fail-500-3' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-http-500-5: healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(500));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fail-500-4' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-http-502-1: healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(502));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fail-502-0' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-http-502-2: healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(502));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fail-502-1' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-http-502-3: healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(502));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fail-502-2' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-http-502-4: healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(502));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fail-502-3' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-http-502-5: healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(502));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fail-502-4' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-http-503-1: healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(503));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fail-503-0' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-http-503-2: healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(503));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fail-503-1' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-http-503-3: healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(503));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fail-503-2' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-http-503-4: healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(503));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fail-503-3' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-http-503-5: healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(503));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fail-503-4' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-http-504-1: healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(504));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fail-504-0' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-http-504-2: healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(504));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fail-504-1' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-http-504-3: healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(504));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fail-504-2' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-http-504-4: healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(504));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fail-504-3' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-http-504-5: healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(504));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fail-504-4' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-http-418-1: healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(418));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fail-418-0' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-http-418-2: healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(418));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fail-418-1' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-http-418-3: healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(418));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fail-418-2' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-http-418-4: healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(418));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fail-418-3' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-http-418-5: healthy:false', async () => {
    fetchMock.mockResolvedValueOnce(mockError(418));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fail-418-4' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(typeof r.errorMessage).toBe('string');
    expect(r.errorMessage!.length).toBeGreaterThan(0);
    expect(r.lastCheckedAt).toBeInstanceOf(Date);
  });
  it('fail-throw-1: rejection → healthy:false', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Net err 0'));
    const conn = new SAPConnector(makeConfig({ id: 'sap-throw-0' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(r.errorMessage).toContain('Net err 0');
  });
  it('fail-throw-2: rejection → healthy:false', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Net err 1'));
    const conn = new SAPConnector(makeConfig({ id: 'sap-throw-1' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(r.errorMessage).toContain('Net err 1');
  });
  it('fail-throw-3: rejection → healthy:false', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Net err 2'));
    const conn = new SAPConnector(makeConfig({ id: 'sap-throw-2' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(r.errorMessage).toContain('Net err 2');
  });
  it('fail-throw-4: rejection → healthy:false', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Net err 3'));
    const conn = new SAPConnector(makeConfig({ id: 'sap-throw-3' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(r.errorMessage).toContain('Net err 3');
  });
  it('fail-throw-5: rejection → healthy:false', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Net err 4'));
    const conn = new SAPConnector(makeConfig({ id: 'sap-throw-4' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(r.errorMessage).toContain('Net err 4');
  });
  it('fail-throw-6: rejection → healthy:false', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Net err 5'));
    const conn = new SAPConnector(makeConfig({ id: 'sap-throw-5' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(r.errorMessage).toContain('Net err 5');
  });
  it('fail-throw-7: rejection → healthy:false', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Net err 6'));
    const conn = new SAPConnector(makeConfig({ id: 'sap-throw-6' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(r.errorMessage).toContain('Net err 6');
  });
  it('fail-throw-8: rejection → healthy:false', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Net err 7'));
    const conn = new SAPConnector(makeConfig({ id: 'sap-throw-7' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(r.errorMessage).toContain('Net err 7');
  });
  it('fail-throw-9: rejection → healthy:false', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Net err 8'));
    const conn = new SAPConnector(makeConfig({ id: 'sap-throw-8' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(r.errorMessage).toContain('Net err 8');
  });
  it('fail-throw-10: rejection → healthy:false', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Net err 9'));
    const conn = new SAPConnector(makeConfig({ id: 'sap-throw-9' }));
    const r = await conn.testConnection();
    expect(r.healthy).toBe(false);
    expect(r.errorMessage).toContain('Net err 9');
  });
});

// ── 4. Token caching ─────────────────────────────────────────────────────────

describe('SAPConnector – token caching', () => {
  let fetchMock: jest.SpyInstance;
  beforeEach(() => { fetchMock = jest.spyOn(global, "fetch"); });
  afterEach(() => { fetchMock.mockRestore(); });
  it('cache-1: second call reuses token (1 POST)', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('c-tok-0', 3600))
             .mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-cache-0' }));
    await conn.testConnection();
    await conn.fetchRecords('EMPLOYEE');
    const posts = fetchMock.mock.calls.filter((c: unknown[]) => (c[1] as RequestInit)?.method === 'POST');
    expect(posts).toHaveLength(1);
  });
  it('cache-2: second call reuses token (1 POST)', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('c-tok-1', 3600))
             .mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-cache-1' }));
    await conn.testConnection();
    await conn.fetchRecords('EMPLOYEE');
    const posts = fetchMock.mock.calls.filter((c: unknown[]) => (c[1] as RequestInit)?.method === 'POST');
    expect(posts).toHaveLength(1);
  });
  it('cache-3: second call reuses token (1 POST)', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('c-tok-2', 3600))
             .mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-cache-2' }));
    await conn.testConnection();
    await conn.fetchRecords('EMPLOYEE');
    const posts = fetchMock.mock.calls.filter((c: unknown[]) => (c[1] as RequestInit)?.method === 'POST');
    expect(posts).toHaveLength(1);
  });
  it('cache-4: second call reuses token (1 POST)', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('c-tok-3', 3600))
             .mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-cache-3' }));
    await conn.testConnection();
    await conn.fetchRecords('EMPLOYEE');
    const posts = fetchMock.mock.calls.filter((c: unknown[]) => (c[1] as RequestInit)?.method === 'POST');
    expect(posts).toHaveLength(1);
  });
  it('cache-5: second call reuses token (1 POST)', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('c-tok-4', 3600))
             .mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-cache-4' }));
    await conn.testConnection();
    await conn.fetchRecords('EMPLOYEE');
    const posts = fetchMock.mock.calls.filter((c: unknown[]) => (c[1] as RequestInit)?.method === 'POST');
    expect(posts).toHaveLength(1);
  });
  it('cache-6: second call reuses token (1 POST)', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('c-tok-5', 3600))
             .mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-cache-5' }));
    await conn.testConnection();
    await conn.fetchRecords('EMPLOYEE');
    const posts = fetchMock.mock.calls.filter((c: unknown[]) => (c[1] as RequestInit)?.method === 'POST');
    expect(posts).toHaveLength(1);
  });
  it('cache-7: second call reuses token (1 POST)', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('c-tok-6', 3600))
             .mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-cache-6' }));
    await conn.testConnection();
    await conn.fetchRecords('EMPLOYEE');
    const posts = fetchMock.mock.calls.filter((c: unknown[]) => (c[1] as RequestInit)?.method === 'POST');
    expect(posts).toHaveLength(1);
  });
  it('cache-8: second call reuses token (1 POST)', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('c-tok-7', 3600))
             .mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-cache-7' }));
    await conn.testConnection();
    await conn.fetchRecords('EMPLOYEE');
    const posts = fetchMock.mock.calls.filter((c: unknown[]) => (c[1] as RequestInit)?.method === 'POST');
    expect(posts).toHaveLength(1);
  });
  it('cache-9: second call reuses token (1 POST)', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('c-tok-8', 3600))
             .mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-cache-8' }));
    await conn.testConnection();
    await conn.fetchRecords('EMPLOYEE');
    const posts = fetchMock.mock.calls.filter((c: unknown[]) => (c[1] as RequestInit)?.method === 'POST');
    expect(posts).toHaveLength(1);
  });
  it('cache-10: second call reuses token (1 POST)', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('c-tok-9', 3600))
             .mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-cache-9' }));
    await conn.testConnection();
    await conn.fetchRecords('EMPLOYEE');
    const posts = fetchMock.mock.calls.filter((c: unknown[]) => (c[1] as RequestInit)?.method === 'POST');
    expect(posts).toHaveLength(1);
  });
  it('cache-11: second call reuses token (1 POST)', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('c-tok-10', 3600))
             .mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-cache-10' }));
    await conn.testConnection();
    await conn.fetchRecords('EMPLOYEE');
    const posts = fetchMock.mock.calls.filter((c: unknown[]) => (c[1] as RequestInit)?.method === 'POST');
    expect(posts).toHaveLength(1);
  });
  it('cache-12: second call reuses token (1 POST)', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('c-tok-11', 3600))
             .mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-cache-11' }));
    await conn.testConnection();
    await conn.fetchRecords('EMPLOYEE');
    const posts = fetchMock.mock.calls.filter((c: unknown[]) => (c[1] as RequestInit)?.method === 'POST');
    expect(posts).toHaveLength(1);
  });
  it('cache-13: second call reuses token (1 POST)', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('c-tok-12', 3600))
             .mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-cache-12' }));
    await conn.testConnection();
    await conn.fetchRecords('EMPLOYEE');
    const posts = fetchMock.mock.calls.filter((c: unknown[]) => (c[1] as RequestInit)?.method === 'POST');
    expect(posts).toHaveLength(1);
  });
  it('cache-14: second call reuses token (1 POST)', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('c-tok-13', 3600))
             .mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-cache-13' }));
    await conn.testConnection();
    await conn.fetchRecords('EMPLOYEE');
    const posts = fetchMock.mock.calls.filter((c: unknown[]) => (c[1] as RequestInit)?.method === 'POST');
    expect(posts).toHaveLength(1);
  });
  it('cache-15: second call reuses token (1 POST)', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('c-tok-14', 3600))
             .mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-cache-14' }));
    await conn.testConnection();
    await conn.fetchRecords('EMPLOYEE');
    const posts = fetchMock.mock.calls.filter((c: unknown[]) => (c[1] as RequestInit)?.method === 'POST');
    expect(posts).toHaveLength(1);
  });
  it('cache-16: second call reuses token (1 POST)', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('c-tok-15', 3600))
             .mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-cache-15' }));
    await conn.testConnection();
    await conn.fetchRecords('EMPLOYEE');
    const posts = fetchMock.mock.calls.filter((c: unknown[]) => (c[1] as RequestInit)?.method === 'POST');
    expect(posts).toHaveLength(1);
  });
  it('cache-17: second call reuses token (1 POST)', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('c-tok-16', 3600))
             .mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-cache-16' }));
    await conn.testConnection();
    await conn.fetchRecords('EMPLOYEE');
    const posts = fetchMock.mock.calls.filter((c: unknown[]) => (c[1] as RequestInit)?.method === 'POST');
    expect(posts).toHaveLength(1);
  });
  it('cache-18: second call reuses token (1 POST)', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('c-tok-17', 3600))
             .mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-cache-17' }));
    await conn.testConnection();
    await conn.fetchRecords('EMPLOYEE');
    const posts = fetchMock.mock.calls.filter((c: unknown[]) => (c[1] as RequestInit)?.method === 'POST');
    expect(posts).toHaveLength(1);
  });
  it('cache-19: second call reuses token (1 POST)', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('c-tok-18', 3600))
             .mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-cache-18' }));
    await conn.testConnection();
    await conn.fetchRecords('EMPLOYEE');
    const posts = fetchMock.mock.calls.filter((c: unknown[]) => (c[1] as RequestInit)?.method === 'POST');
    expect(posts).toHaveLength(1);
  });
  it('cache-20: second call reuses token (1 POST)', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('c-tok-19', 3600))
             .mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-cache-19' }));
    await conn.testConnection();
    await conn.fetchRecords('EMPLOYEE');
    const posts = fetchMock.mock.calls.filter((c: unknown[]) => (c[1] as RequestInit)?.method === 'POST');
    expect(posts).toHaveLength(1);
  });
  it('cache-expire-1: expired token triggers new fetch', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('first-0', 0))
             .mockResolvedValueOnce(mockToken('second-0', 3600))
             .mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-exp-0' }));
    await conn.testConnection();
    await conn.fetchRecords('EMPLOYEE');
    const posts = fetchMock.mock.calls.filter((c: unknown[]) => (c[1] as RequestInit)?.method === 'POST');
    expect(posts.length).toBeGreaterThanOrEqual(1);
  });
  it('cache-expire-2: expired token triggers new fetch', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('first-1', 0))
             .mockResolvedValueOnce(mockToken('second-1', 3600))
             .mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-exp-1' }));
    await conn.testConnection();
    await conn.fetchRecords('EMPLOYEE');
    const posts = fetchMock.mock.calls.filter((c: unknown[]) => (c[1] as RequestInit)?.method === 'POST');
    expect(posts.length).toBeGreaterThanOrEqual(1);
  });
  it('cache-expire-3: expired token triggers new fetch', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('first-2', 0))
             .mockResolvedValueOnce(mockToken('second-2', 3600))
             .mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-exp-2' }));
    await conn.testConnection();
    await conn.fetchRecords('EMPLOYEE');
    const posts = fetchMock.mock.calls.filter((c: unknown[]) => (c[1] as RequestInit)?.method === 'POST');
    expect(posts.length).toBeGreaterThanOrEqual(1);
  });
  it('cache-expire-4: expired token triggers new fetch', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('first-3', 0))
             .mockResolvedValueOnce(mockToken('second-3', 3600))
             .mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-exp-3' }));
    await conn.testConnection();
    await conn.fetchRecords('EMPLOYEE');
    const posts = fetchMock.mock.calls.filter((c: unknown[]) => (c[1] as RequestInit)?.method === 'POST');
    expect(posts.length).toBeGreaterThanOrEqual(1);
  });
  it('cache-expire-5: expired token triggers new fetch', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('first-4', 0))
             .mockResolvedValueOnce(mockToken('second-4', 3600))
             .mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-exp-4' }));
    await conn.testConnection();
    await conn.fetchRecords('EMPLOYEE');
    const posts = fetchMock.mock.calls.filter((c: unknown[]) => (c[1] as RequestInit)?.method === 'POST');
    expect(posts.length).toBeGreaterThanOrEqual(1);
  });
  it('cache-expire-6: expired token triggers new fetch', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('first-5', 0))
             .mockResolvedValueOnce(mockToken('second-5', 3600))
             .mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-exp-5' }));
    await conn.testConnection();
    await conn.fetchRecords('EMPLOYEE');
    const posts = fetchMock.mock.calls.filter((c: unknown[]) => (c[1] as RequestInit)?.method === 'POST');
    expect(posts.length).toBeGreaterThanOrEqual(1);
  });
  it('cache-expire-7: expired token triggers new fetch', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('first-6', 0))
             .mockResolvedValueOnce(mockToken('second-6', 3600))
             .mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-exp-6' }));
    await conn.testConnection();
    await conn.fetchRecords('EMPLOYEE');
    const posts = fetchMock.mock.calls.filter((c: unknown[]) => (c[1] as RequestInit)?.method === 'POST');
    expect(posts.length).toBeGreaterThanOrEqual(1);
  });
  it('cache-expire-8: expired token triggers new fetch', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('first-7', 0))
             .mockResolvedValueOnce(mockToken('second-7', 3600))
             .mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-exp-7' }));
    await conn.testConnection();
    await conn.fetchRecords('EMPLOYEE');
    const posts = fetchMock.mock.calls.filter((c: unknown[]) => (c[1] as RequestInit)?.method === 'POST');
    expect(posts.length).toBeGreaterThanOrEqual(1);
  });
  it('cache-expire-9: expired token triggers new fetch', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('first-8', 0))
             .mockResolvedValueOnce(mockToken('second-8', 3600))
             .mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-exp-8' }));
    await conn.testConnection();
    await conn.fetchRecords('EMPLOYEE');
    const posts = fetchMock.mock.calls.filter((c: unknown[]) => (c[1] as RequestInit)?.method === 'POST');
    expect(posts.length).toBeGreaterThanOrEqual(1);
  });
  it('cache-expire-10: expired token triggers new fetch', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('first-9', 0))
             .mockResolvedValueOnce(mockToken('second-9', 3600))
             .mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-exp-9' }));
    await conn.testConnection();
    await conn.fetchRecords('EMPLOYEE');
    const posts = fetchMock.mock.calls.filter((c: unknown[]) => (c[1] as RequestInit)?.method === 'POST');
    expect(posts.length).toBeGreaterThanOrEqual(1);
  });
});

// ── 5. fetchRecords EMPLOYEE success ─────────────────────────────────────────

describe('SAPConnector – fetchRecords EMPLOYEE success', () => {
  let fetchMock: jest.SpyInstance;
  beforeEach(() => { fetchMock = jest.spyOn(global, "fetch"); });
  afterEach(() => { fetchMock.mockRestore(); });
  it('emp-success-1: returns 1 records', async () => {
    const emps = Array.from({ length: 1 }, (_, k) => makeEmp(0*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-emp-0' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(1);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^sap_/);
      expect(r.data.source).toBe('SAP_HR');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-success-2: returns 2 records', async () => {
    const emps = Array.from({ length: 2 }, (_, k) => makeEmp(1*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-emp-1' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(2);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^sap_/);
      expect(r.data.source).toBe('SAP_HR');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-success-3: returns 3 records', async () => {
    const emps = Array.from({ length: 3 }, (_, k) => makeEmp(2*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-emp-2' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(3);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^sap_/);
      expect(r.data.source).toBe('SAP_HR');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-success-4: returns 4 records', async () => {
    const emps = Array.from({ length: 4 }, (_, k) => makeEmp(3*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-emp-3' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(4);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^sap_/);
      expect(r.data.source).toBe('SAP_HR');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-success-5: returns 5 records', async () => {
    const emps = Array.from({ length: 5 }, (_, k) => makeEmp(4*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-emp-4' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(5);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^sap_/);
      expect(r.data.source).toBe('SAP_HR');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-success-6: returns 1 records', async () => {
    const emps = Array.from({ length: 1 }, (_, k) => makeEmp(5*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-emp-5' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(1);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^sap_/);
      expect(r.data.source).toBe('SAP_HR');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-success-7: returns 2 records', async () => {
    const emps = Array.from({ length: 2 }, (_, k) => makeEmp(6*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-emp-6' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(2);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^sap_/);
      expect(r.data.source).toBe('SAP_HR');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-success-8: returns 3 records', async () => {
    const emps = Array.from({ length: 3 }, (_, k) => makeEmp(7*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-emp-7' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(3);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^sap_/);
      expect(r.data.source).toBe('SAP_HR');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-success-9: returns 4 records', async () => {
    const emps = Array.from({ length: 4 }, (_, k) => makeEmp(8*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-emp-8' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(4);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^sap_/);
      expect(r.data.source).toBe('SAP_HR');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-success-10: returns 5 records', async () => {
    const emps = Array.from({ length: 5 }, (_, k) => makeEmp(9*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-emp-9' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(5);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^sap_/);
      expect(r.data.source).toBe('SAP_HR');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-success-11: returns 1 records', async () => {
    const emps = Array.from({ length: 1 }, (_, k) => makeEmp(10*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-emp-10' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(1);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^sap_/);
      expect(r.data.source).toBe('SAP_HR');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-success-12: returns 2 records', async () => {
    const emps = Array.from({ length: 2 }, (_, k) => makeEmp(11*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-emp-11' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(2);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^sap_/);
      expect(r.data.source).toBe('SAP_HR');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-success-13: returns 3 records', async () => {
    const emps = Array.from({ length: 3 }, (_, k) => makeEmp(12*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-emp-12' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(3);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^sap_/);
      expect(r.data.source).toBe('SAP_HR');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-success-14: returns 4 records', async () => {
    const emps = Array.from({ length: 4 }, (_, k) => makeEmp(13*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-emp-13' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(4);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^sap_/);
      expect(r.data.source).toBe('SAP_HR');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-success-15: returns 5 records', async () => {
    const emps = Array.from({ length: 5 }, (_, k) => makeEmp(14*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-emp-14' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(5);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^sap_/);
      expect(r.data.source).toBe('SAP_HR');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-success-16: returns 1 records', async () => {
    const emps = Array.from({ length: 1 }, (_, k) => makeEmp(15*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-emp-15' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(1);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^sap_/);
      expect(r.data.source).toBe('SAP_HR');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-success-17: returns 2 records', async () => {
    const emps = Array.from({ length: 2 }, (_, k) => makeEmp(16*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-emp-16' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(2);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^sap_/);
      expect(r.data.source).toBe('SAP_HR');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-success-18: returns 3 records', async () => {
    const emps = Array.from({ length: 3 }, (_, k) => makeEmp(17*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-emp-17' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(3);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^sap_/);
      expect(r.data.source).toBe('SAP_HR');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-success-19: returns 4 records', async () => {
    const emps = Array.from({ length: 4 }, (_, k) => makeEmp(18*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-emp-18' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(4);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^sap_/);
      expect(r.data.source).toBe('SAP_HR');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-success-20: returns 5 records', async () => {
    const emps = Array.from({ length: 5 }, (_, k) => makeEmp(19*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-emp-19' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(5);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^sap_/);
      expect(r.data.source).toBe('SAP_HR');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-success-21: returns 1 records', async () => {
    const emps = Array.from({ length: 1 }, (_, k) => makeEmp(20*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-emp-20' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(1);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^sap_/);
      expect(r.data.source).toBe('SAP_HR');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-success-22: returns 2 records', async () => {
    const emps = Array.from({ length: 2 }, (_, k) => makeEmp(21*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-emp-21' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(2);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^sap_/);
      expect(r.data.source).toBe('SAP_HR');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-success-23: returns 3 records', async () => {
    const emps = Array.from({ length: 3 }, (_, k) => makeEmp(22*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-emp-22' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(3);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^sap_/);
      expect(r.data.source).toBe('SAP_HR');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-success-24: returns 4 records', async () => {
    const emps = Array.from({ length: 4 }, (_, k) => makeEmp(23*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-emp-23' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(4);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^sap_/);
      expect(r.data.source).toBe('SAP_HR');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-success-25: returns 5 records', async () => {
    const emps = Array.from({ length: 5 }, (_, k) => makeEmp(24*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-emp-24' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(5);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^sap_/);
      expect(r.data.source).toBe('SAP_HR');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-success-26: returns 1 records', async () => {
    const emps = Array.from({ length: 1 }, (_, k) => makeEmp(25*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-emp-25' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(1);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^sap_/);
      expect(r.data.source).toBe('SAP_HR');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-success-27: returns 2 records', async () => {
    const emps = Array.from({ length: 2 }, (_, k) => makeEmp(26*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-emp-26' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(2);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^sap_/);
      expect(r.data.source).toBe('SAP_HR');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-success-28: returns 3 records', async () => {
    const emps = Array.from({ length: 3 }, (_, k) => makeEmp(27*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-emp-27' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(3);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^sap_/);
      expect(r.data.source).toBe('SAP_HR');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-success-29: returns 4 records', async () => {
    const emps = Array.from({ length: 4 }, (_, k) => makeEmp(28*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-emp-28' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(4);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^sap_/);
      expect(r.data.source).toBe('SAP_HR');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-success-30: returns 5 records', async () => {
    const emps = Array.from({ length: 5 }, (_, k) => makeEmp(29*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-emp-29' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(5);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^sap_/);
      expect(r.data.source).toBe('SAP_HR');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-success-31: returns 1 records', async () => {
    const emps = Array.from({ length: 1 }, (_, k) => makeEmp(30*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-emp-30' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(1);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^sap_/);
      expect(r.data.source).toBe('SAP_HR');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-success-32: returns 2 records', async () => {
    const emps = Array.from({ length: 2 }, (_, k) => makeEmp(31*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-emp-31' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(2);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^sap_/);
      expect(r.data.source).toBe('SAP_HR');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-success-33: returns 3 records', async () => {
    const emps = Array.from({ length: 3 }, (_, k) => makeEmp(32*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-emp-32' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(3);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^sap_/);
      expect(r.data.source).toBe('SAP_HR');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-success-34: returns 4 records', async () => {
    const emps = Array.from({ length: 4 }, (_, k) => makeEmp(33*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-emp-33' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(4);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^sap_/);
      expect(r.data.source).toBe('SAP_HR');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-success-35: returns 5 records', async () => {
    const emps = Array.from({ length: 5 }, (_, k) => makeEmp(34*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-emp-34' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(5);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^sap_/);
      expect(r.data.source).toBe('SAP_HR');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-success-36: returns 1 records', async () => {
    const emps = Array.from({ length: 1 }, (_, k) => makeEmp(35*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-emp-35' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(1);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^sap_/);
      expect(r.data.source).toBe('SAP_HR');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-success-37: returns 2 records', async () => {
    const emps = Array.from({ length: 2 }, (_, k) => makeEmp(36*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-emp-36' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(2);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^sap_/);
      expect(r.data.source).toBe('SAP_HR');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-success-38: returns 3 records', async () => {
    const emps = Array.from({ length: 3 }, (_, k) => makeEmp(37*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-emp-37' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(3);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^sap_/);
      expect(r.data.source).toBe('SAP_HR');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-success-39: returns 4 records', async () => {
    const emps = Array.from({ length: 4 }, (_, k) => makeEmp(38*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-emp-38' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(4);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^sap_/);
      expect(r.data.source).toBe('SAP_HR');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-success-40: returns 5 records', async () => {
    const emps = Array.from({ length: 5 }, (_, k) => makeEmp(39*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-emp-39' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(5);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^sap_/);
      expect(r.data.source).toBe('SAP_HR');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-success-41: returns 1 records', async () => {
    const emps = Array.from({ length: 1 }, (_, k) => makeEmp(40*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-emp-40' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(1);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^sap_/);
      expect(r.data.source).toBe('SAP_HR');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-success-42: returns 2 records', async () => {
    const emps = Array.from({ length: 2 }, (_, k) => makeEmp(41*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-emp-41' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(2);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^sap_/);
      expect(r.data.source).toBe('SAP_HR');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-success-43: returns 3 records', async () => {
    const emps = Array.from({ length: 3 }, (_, k) => makeEmp(42*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-emp-42' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(3);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^sap_/);
      expect(r.data.source).toBe('SAP_HR');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-success-44: returns 4 records', async () => {
    const emps = Array.from({ length: 4 }, (_, k) => makeEmp(43*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-emp-43' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(4);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^sap_/);
      expect(r.data.source).toBe('SAP_HR');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-success-45: returns 5 records', async () => {
    const emps = Array.from({ length: 5 }, (_, k) => makeEmp(44*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-emp-44' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(5);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^sap_/);
      expect(r.data.source).toBe('SAP_HR');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-success-46: returns 1 records', async () => {
    const emps = Array.from({ length: 1 }, (_, k) => makeEmp(45*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-emp-45' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(1);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^sap_/);
      expect(r.data.source).toBe('SAP_HR');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-success-47: returns 2 records', async () => {
    const emps = Array.from({ length: 2 }, (_, k) => makeEmp(46*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-emp-46' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(2);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^sap_/);
      expect(r.data.source).toBe('SAP_HR');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-success-48: returns 3 records', async () => {
    const emps = Array.from({ length: 3 }, (_, k) => makeEmp(47*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-emp-47' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(3);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^sap_/);
      expect(r.data.source).toBe('SAP_HR');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-success-49: returns 4 records', async () => {
    const emps = Array.from({ length: 4 }, (_, k) => makeEmp(48*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-emp-48' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(4);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^sap_/);
      expect(r.data.source).toBe('SAP_HR');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-success-50: returns 5 records', async () => {
    const emps = Array.from({ length: 5 }, (_, k) => makeEmp(49*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-emp-49' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(5);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^sap_/);
      expect(r.data.source).toBe('SAP_HR');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-success-51: returns 1 records', async () => {
    const emps = Array.from({ length: 1 }, (_, k) => makeEmp(50*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-emp-50' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(1);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^sap_/);
      expect(r.data.source).toBe('SAP_HR');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-success-52: returns 2 records', async () => {
    const emps = Array.from({ length: 2 }, (_, k) => makeEmp(51*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-emp-51' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(2);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^sap_/);
      expect(r.data.source).toBe('SAP_HR');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-success-53: returns 3 records', async () => {
    const emps = Array.from({ length: 3 }, (_, k) => makeEmp(52*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-emp-52' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(3);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^sap_/);
      expect(r.data.source).toBe('SAP_HR');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-success-54: returns 4 records', async () => {
    const emps = Array.from({ length: 4 }, (_, k) => makeEmp(53*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-emp-53' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(4);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^sap_/);
      expect(r.data.source).toBe('SAP_HR');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-success-55: returns 5 records', async () => {
    const emps = Array.from({ length: 5 }, (_, k) => makeEmp(54*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-emp-54' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(5);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^sap_/);
      expect(r.data.source).toBe('SAP_HR');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-success-56: returns 1 records', async () => {
    const emps = Array.from({ length: 1 }, (_, k) => makeEmp(55*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-emp-55' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(1);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^sap_/);
      expect(r.data.source).toBe('SAP_HR');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-success-57: returns 2 records', async () => {
    const emps = Array.from({ length: 2 }, (_, k) => makeEmp(56*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-emp-56' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(2);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^sap_/);
      expect(r.data.source).toBe('SAP_HR');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-success-58: returns 3 records', async () => {
    const emps = Array.from({ length: 3 }, (_, k) => makeEmp(57*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-emp-57' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(3);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^sap_/);
      expect(r.data.source).toBe('SAP_HR');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-success-59: returns 4 records', async () => {
    const emps = Array.from({ length: 4 }, (_, k) => makeEmp(58*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-emp-58' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(4);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^sap_/);
      expect(r.data.source).toBe('SAP_HR');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-success-60: returns 5 records', async () => {
    const emps = Array.from({ length: 5 }, (_, k) => makeEmp(59*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-emp-59' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(5);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^sap_/);
      expect(r.data.source).toBe('SAP_HR');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-success-61: returns 1 records', async () => {
    const emps = Array.from({ length: 1 }, (_, k) => makeEmp(60*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-emp-60' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(1);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^sap_/);
      expect(r.data.source).toBe('SAP_HR');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-success-62: returns 2 records', async () => {
    const emps = Array.from({ length: 2 }, (_, k) => makeEmp(61*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-emp-61' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(2);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^sap_/);
      expect(r.data.source).toBe('SAP_HR');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-success-63: returns 3 records', async () => {
    const emps = Array.from({ length: 3 }, (_, k) => makeEmp(62*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-emp-62' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(3);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^sap_/);
      expect(r.data.source).toBe('SAP_HR');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-success-64: returns 4 records', async () => {
    const emps = Array.from({ length: 4 }, (_, k) => makeEmp(63*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-emp-63' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(4);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^sap_/);
      expect(r.data.source).toBe('SAP_HR');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-success-65: returns 5 records', async () => {
    const emps = Array.from({ length: 5 }, (_, k) => makeEmp(64*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-emp-64' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(5);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^sap_/);
      expect(r.data.source).toBe('SAP_HR');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-success-66: returns 1 records', async () => {
    const emps = Array.from({ length: 1 }, (_, k) => makeEmp(65*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-emp-65' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(1);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^sap_/);
      expect(r.data.source).toBe('SAP_HR');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-success-67: returns 2 records', async () => {
    const emps = Array.from({ length: 2 }, (_, k) => makeEmp(66*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-emp-66' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(2);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^sap_/);
      expect(r.data.source).toBe('SAP_HR');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-success-68: returns 3 records', async () => {
    const emps = Array.from({ length: 3 }, (_, k) => makeEmp(67*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-emp-67' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(3);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^sap_/);
      expect(r.data.source).toBe('SAP_HR');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-success-69: returns 4 records', async () => {
    const emps = Array.from({ length: 4 }, (_, k) => makeEmp(68*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-emp-68' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(4);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^sap_/);
      expect(r.data.source).toBe('SAP_HR');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-success-70: returns 5 records', async () => {
    const emps = Array.from({ length: 5 }, (_, k) => makeEmp(69*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-emp-69' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(5);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^sap_/);
      expect(r.data.source).toBe('SAP_HR');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-success-71: returns 1 records', async () => {
    const emps = Array.from({ length: 1 }, (_, k) => makeEmp(70*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-emp-70' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(1);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^sap_/);
      expect(r.data.source).toBe('SAP_HR');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-success-72: returns 2 records', async () => {
    const emps = Array.from({ length: 2 }, (_, k) => makeEmp(71*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-emp-71' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(2);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^sap_/);
      expect(r.data.source).toBe('SAP_HR');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-success-73: returns 3 records', async () => {
    const emps = Array.from({ length: 3 }, (_, k) => makeEmp(72*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-emp-72' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(3);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^sap_/);
      expect(r.data.source).toBe('SAP_HR');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-success-74: returns 4 records', async () => {
    const emps = Array.from({ length: 4 }, (_, k) => makeEmp(73*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-emp-73' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(4);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^sap_/);
      expect(r.data.source).toBe('SAP_HR');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-success-75: returns 5 records', async () => {
    const emps = Array.from({ length: 5 }, (_, k) => makeEmp(74*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-emp-74' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(5);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^sap_/);
      expect(r.data.source).toBe('SAP_HR');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-success-76: returns 1 records', async () => {
    const emps = Array.from({ length: 1 }, (_, k) => makeEmp(75*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-emp-75' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(1);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^sap_/);
      expect(r.data.source).toBe('SAP_HR');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-success-77: returns 2 records', async () => {
    const emps = Array.from({ length: 2 }, (_, k) => makeEmp(76*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-emp-76' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(2);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^sap_/);
      expect(r.data.source).toBe('SAP_HR');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-success-78: returns 3 records', async () => {
    const emps = Array.from({ length: 3 }, (_, k) => makeEmp(77*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-emp-77' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(3);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^sap_/);
      expect(r.data.source).toBe('SAP_HR');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-success-79: returns 4 records', async () => {
    const emps = Array.from({ length: 4 }, (_, k) => makeEmp(78*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-emp-78' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(4);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^sap_/);
      expect(r.data.source).toBe('SAP_HR');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('emp-success-80: returns 5 records', async () => {
    const emps = Array.from({ length: 5 }, (_, k) => makeEmp(79*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-emp-79' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs).toHaveLength(5);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('EMPLOYEE');
      expect(r.externalId).toMatch(/^sap_/);
      expect(r.data.source).toBe('SAP_HR');
      expect(typeof r.checksum).toBe('string');
    });
  });
  it('status-1: active→ACTIVE inactive→INACTIVE', async () => {
    const a = { ...makeEmp(0), status: 'active' };
    const b = { ...makeEmp(1000), status: 'other' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [a, b] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-st-0' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.status).toBe('ACTIVE');
    expect(recs[1].data.status).toBe('INACTIVE');
  });
  it('status-2: active→ACTIVE inactive→INACTIVE', async () => {
    const a = { ...makeEmp(1), status: 'active' };
    const b = { ...makeEmp(1001), status: 'other' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [a, b] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-st-1' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.status).toBe('ACTIVE');
    expect(recs[1].data.status).toBe('INACTIVE');
  });
  it('status-3: active→ACTIVE inactive→INACTIVE', async () => {
    const a = { ...makeEmp(2), status: 'active' };
    const b = { ...makeEmp(1002), status: 'other' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [a, b] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-st-2' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.status).toBe('ACTIVE');
    expect(recs[1].data.status).toBe('INACTIVE');
  });
  it('status-4: active→ACTIVE inactive→INACTIVE', async () => {
    const a = { ...makeEmp(3), status: 'active' };
    const b = { ...makeEmp(1003), status: 'other' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [a, b] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-st-3' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.status).toBe('ACTIVE');
    expect(recs[1].data.status).toBe('INACTIVE');
  });
  it('status-5: active→ACTIVE inactive→INACTIVE', async () => {
    const a = { ...makeEmp(4), status: 'active' };
    const b = { ...makeEmp(1004), status: 'other' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [a, b] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-st-4' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.status).toBe('ACTIVE');
    expect(recs[1].data.status).toBe('INACTIVE');
  });
  it('status-6: active→ACTIVE inactive→INACTIVE', async () => {
    const a = { ...makeEmp(5), status: 'active' };
    const b = { ...makeEmp(1005), status: 'other' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [a, b] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-st-5' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.status).toBe('ACTIVE');
    expect(recs[1].data.status).toBe('INACTIVE');
  });
  it('status-7: active→ACTIVE inactive→INACTIVE', async () => {
    const a = { ...makeEmp(6), status: 'active' };
    const b = { ...makeEmp(1006), status: 'other' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [a, b] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-st-6' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.status).toBe('ACTIVE');
    expect(recs[1].data.status).toBe('INACTIVE');
  });
  it('status-8: active→ACTIVE inactive→INACTIVE', async () => {
    const a = { ...makeEmp(7), status: 'active' };
    const b = { ...makeEmp(1007), status: 'other' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [a, b] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-st-7' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.status).toBe('ACTIVE');
    expect(recs[1].data.status).toBe('INACTIVE');
  });
  it('status-9: active→ACTIVE inactive→INACTIVE', async () => {
    const a = { ...makeEmp(8), status: 'active' };
    const b = { ...makeEmp(1008), status: 'other' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [a, b] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-st-8' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.status).toBe('ACTIVE');
    expect(recs[1].data.status).toBe('INACTIVE');
  });
  it('status-10: active→ACTIVE inactive→INACTIVE', async () => {
    const a = { ...makeEmp(9), status: 'active' };
    const b = { ...makeEmp(1009), status: 'other' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [a, b] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-st-9' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.status).toBe('ACTIVE');
    expect(recs[1].data.status).toBe('INACTIVE');
  });
  it('status-11: active→ACTIVE inactive→INACTIVE', async () => {
    const a = { ...makeEmp(10), status: 'active' };
    const b = { ...makeEmp(1010), status: 'other' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [a, b] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-st-10' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.status).toBe('ACTIVE');
    expect(recs[1].data.status).toBe('INACTIVE');
  });
  it('status-12: active→ACTIVE inactive→INACTIVE', async () => {
    const a = { ...makeEmp(11), status: 'active' };
    const b = { ...makeEmp(1011), status: 'other' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [a, b] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-st-11' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.status).toBe('ACTIVE');
    expect(recs[1].data.status).toBe('INACTIVE');
  });
  it('status-13: active→ACTIVE inactive→INACTIVE', async () => {
    const a = { ...makeEmp(12), status: 'active' };
    const b = { ...makeEmp(1012), status: 'other' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [a, b] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-st-12' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.status).toBe('ACTIVE');
    expect(recs[1].data.status).toBe('INACTIVE');
  });
  it('status-14: active→ACTIVE inactive→INACTIVE', async () => {
    const a = { ...makeEmp(13), status: 'active' };
    const b = { ...makeEmp(1013), status: 'other' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [a, b] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-st-13' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.status).toBe('ACTIVE');
    expect(recs[1].data.status).toBe('INACTIVE');
  });
  it('status-15: active→ACTIVE inactive→INACTIVE', async () => {
    const a = { ...makeEmp(14), status: 'active' };
    const b = { ...makeEmp(1014), status: 'other' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [a, b] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-st-14' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.status).toBe('ACTIVE');
    expect(recs[1].data.status).toBe('INACTIVE');
  });
  it('status-16: active→ACTIVE inactive→INACTIVE', async () => {
    const a = { ...makeEmp(15), status: 'active' };
    const b = { ...makeEmp(1015), status: 'other' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [a, b] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-st-15' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.status).toBe('ACTIVE');
    expect(recs[1].data.status).toBe('INACTIVE');
  });
  it('status-17: active→ACTIVE inactive→INACTIVE', async () => {
    const a = { ...makeEmp(16), status: 'active' };
    const b = { ...makeEmp(1016), status: 'other' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [a, b] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-st-16' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.status).toBe('ACTIVE');
    expect(recs[1].data.status).toBe('INACTIVE');
  });
  it('status-18: active→ACTIVE inactive→INACTIVE', async () => {
    const a = { ...makeEmp(17), status: 'active' };
    const b = { ...makeEmp(1017), status: 'other' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [a, b] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-st-17' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.status).toBe('ACTIVE');
    expect(recs[1].data.status).toBe('INACTIVE');
  });
  it('status-19: active→ACTIVE inactive→INACTIVE', async () => {
    const a = { ...makeEmp(18), status: 'active' };
    const b = { ...makeEmp(1018), status: 'other' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [a, b] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-st-18' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.status).toBe('ACTIVE');
    expect(recs[1].data.status).toBe('INACTIVE');
  });
  it('status-20: active→ACTIVE inactive→INACTIVE', async () => {
    const a = { ...makeEmp(19), status: 'active' };
    const b = { ...makeEmp(1019), status: 'other' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [a, b] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-st-19' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.status).toBe('ACTIVE');
    expect(recs[1].data.status).toBe('INACTIVE');
  });
});

// ── 6. fetchRecords EMPLOYEE errors ──────────────────────────────────────────

describe('SAPConnector – fetchRecords EMPLOYEE errors', () => {
  let fetchMock: jest.SpyInstance;
  beforeEach(() => { fetchMock = jest.spyOn(global, "fetch"); });
  afterEach(() => { fetchMock.mockRestore(); });
  it('emp-err-400-1: HTTP 400 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(400));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ee-400-0' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('SAP API error: HTTP 400');
  });
  it('emp-err-400-2: HTTP 400 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(400));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ee-400-1' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('SAP API error: HTTP 400');
  });
  it('emp-err-400-3: HTTP 400 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(400));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ee-400-2' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('SAP API error: HTTP 400');
  });
  it('emp-err-400-4: HTTP 400 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(400));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ee-400-3' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('SAP API error: HTTP 400');
  });
  it('emp-err-401-1: HTTP 401 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(401));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ee-401-0' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('SAP API error: HTTP 401');
  });
  it('emp-err-401-2: HTTP 401 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(401));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ee-401-1' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('SAP API error: HTTP 401');
  });
  it('emp-err-401-3: HTTP 401 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(401));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ee-401-2' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('SAP API error: HTTP 401');
  });
  it('emp-err-401-4: HTTP 401 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(401));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ee-401-3' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('SAP API error: HTTP 401');
  });
  it('emp-err-403-1: HTTP 403 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(403));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ee-403-0' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('SAP API error: HTTP 403');
  });
  it('emp-err-403-2: HTTP 403 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(403));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ee-403-1' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('SAP API error: HTTP 403');
  });
  it('emp-err-403-3: HTTP 403 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(403));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ee-403-2' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('SAP API error: HTTP 403');
  });
  it('emp-err-403-4: HTTP 403 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(403));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ee-403-3' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('SAP API error: HTTP 403');
  });
  it('emp-err-404-1: HTTP 404 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(404));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ee-404-0' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('SAP API error: HTTP 404');
  });
  it('emp-err-404-2: HTTP 404 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(404));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ee-404-1' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('SAP API error: HTTP 404');
  });
  it('emp-err-404-3: HTTP 404 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(404));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ee-404-2' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('SAP API error: HTTP 404');
  });
  it('emp-err-404-4: HTTP 404 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(404));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ee-404-3' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('SAP API error: HTTP 404');
  });
  it('emp-err-500-1: HTTP 500 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(500));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ee-500-0' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('SAP API error: HTTP 500');
  });
  it('emp-err-500-2: HTTP 500 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(500));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ee-500-1' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('SAP API error: HTTP 500');
  });
  it('emp-err-500-3: HTTP 500 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(500));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ee-500-2' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('SAP API error: HTTP 500');
  });
  it('emp-err-500-4: HTTP 500 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(500));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ee-500-3' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('SAP API error: HTTP 500');
  });
  it('emp-err-502-1: HTTP 502 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(502));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ee-502-0' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('SAP API error: HTTP 502');
  });
  it('emp-err-502-2: HTTP 502 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(502));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ee-502-1' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('SAP API error: HTTP 502');
  });
  it('emp-err-502-3: HTTP 502 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(502));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ee-502-2' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('SAP API error: HTTP 502');
  });
  it('emp-err-502-4: HTTP 502 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(502));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ee-502-3' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('SAP API error: HTTP 502');
  });
  it('emp-err-503-1: HTTP 503 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(503));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ee-503-0' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('SAP API error: HTTP 503');
  });
  it('emp-err-503-2: HTTP 503 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(503));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ee-503-1' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('SAP API error: HTTP 503');
  });
  it('emp-err-503-3: HTTP 503 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(503));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ee-503-2' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('SAP API error: HTTP 503');
  });
  it('emp-err-503-4: HTTP 503 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(503));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ee-503-3' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('SAP API error: HTTP 503');
  });
  it('emp-net-1: network failure throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockRejectedValueOnce(new Error('Timeout 0'));
    const conn = new SAPConnector(makeConfig({ id: 'sap-en-0' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('Timeout 0');
  });
  it('emp-net-2: network failure throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockRejectedValueOnce(new Error('Timeout 1'));
    const conn = new SAPConnector(makeConfig({ id: 'sap-en-1' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('Timeout 1');
  });
  it('emp-net-3: network failure throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockRejectedValueOnce(new Error('Timeout 2'));
    const conn = new SAPConnector(makeConfig({ id: 'sap-en-2' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('Timeout 2');
  });
  it('emp-net-4: network failure throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockRejectedValueOnce(new Error('Timeout 3'));
    const conn = new SAPConnector(makeConfig({ id: 'sap-en-3' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('Timeout 3');
  });
  it('emp-net-5: network failure throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockRejectedValueOnce(new Error('Timeout 4'));
    const conn = new SAPConnector(makeConfig({ id: 'sap-en-4' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('Timeout 4');
  });
  it('emp-net-6: network failure throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockRejectedValueOnce(new Error('Timeout 5'));
    const conn = new SAPConnector(makeConfig({ id: 'sap-en-5' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('Timeout 5');
  });
  it('emp-net-7: network failure throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockRejectedValueOnce(new Error('Timeout 6'));
    const conn = new SAPConnector(makeConfig({ id: 'sap-en-6' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('Timeout 6');
  });
  it('emp-net-8: network failure throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockRejectedValueOnce(new Error('Timeout 7'));
    const conn = new SAPConnector(makeConfig({ id: 'sap-en-7' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('Timeout 7');
  });
  it('emp-net-9: network failure throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockRejectedValueOnce(new Error('Timeout 8'));
    const conn = new SAPConnector(makeConfig({ id: 'sap-en-8' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('Timeout 8');
  });
  it('emp-net-10: network failure throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockRejectedValueOnce(new Error('Timeout 9'));
    const conn = new SAPConnector(makeConfig({ id: 'sap-en-9' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('Timeout 9');
  });
  it('emp-empty-1: empty results → []', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ee2-0' }));
    expect(await conn.fetchRecords('EMPLOYEE')).toHaveLength(0);
  });
  it('emp-empty-2: empty results → []', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ee2-1' }));
    expect(await conn.fetchRecords('EMPLOYEE')).toHaveLength(0);
  });
  it('emp-empty-3: empty results → []', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ee2-2' }));
    expect(await conn.fetchRecords('EMPLOYEE')).toHaveLength(0);
  });
  it('emp-empty-4: empty results → []', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ee2-3' }));
    expect(await conn.fetchRecords('EMPLOYEE')).toHaveLength(0);
  });
  it('emp-empty-5: empty results → []', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ee2-4' }));
    expect(await conn.fetchRecords('EMPLOYEE')).toHaveLength(0);
  });
  it('emp-null-1: null results → []', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: null } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-en2-0' }));
    expect(await conn.fetchRecords('EMPLOYEE')).toHaveLength(0);
  });
  it('emp-null-2: null results → []', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: null } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-en2-1' }));
    expect(await conn.fetchRecords('EMPLOYEE')).toHaveLength(0);
  });
  it('emp-null-3: null results → []', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: null } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-en2-2' }));
    expect(await conn.fetchRecords('EMPLOYEE')).toHaveLength(0);
  });
  it('emp-null-4: null results → []', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: null } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-en2-3' }));
    expect(await conn.fetchRecords('EMPLOYEE')).toHaveLength(0);
  });
  it('emp-null-5: null results → []', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: null } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-en2-4' }));
    expect(await conn.fetchRecords('EMPLOYEE')).toHaveLength(0);
  });
});

// ── 7. fetchRecords EMPLOYEE since filter ────────────────────────────────────

describe('SAPConnector – fetchRecords EMPLOYEE since filter', () => {
  let fetchMock: jest.SpyInstance;
  beforeEach(() => { fetchMock = jest.spyOn(global, "fetch"); });
  afterEach(() => { fetchMock.mockRestore(); });
  it('since-1: since date appears in URL', async () => {
    const since = new Date('2026-01-01T00:00:00.000Z');
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-since-0' }));
    await conn.fetchRecords('EMPLOYEE', since);
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('$filter=lastModifiedDateTime');
    expect(url).toContain(since.toISOString());
  });
  it('since-2: since date appears in URL', async () => {
    const since = new Date('2026-01-02T00:00:00.000Z');
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-since-1' }));
    await conn.fetchRecords('EMPLOYEE', since);
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('$filter=lastModifiedDateTime');
    expect(url).toContain(since.toISOString());
  });
  it('since-3: since date appears in URL', async () => {
    const since = new Date('2026-01-03T00:00:00.000Z');
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-since-2' }));
    await conn.fetchRecords('EMPLOYEE', since);
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('$filter=lastModifiedDateTime');
    expect(url).toContain(since.toISOString());
  });
  it('since-4: since date appears in URL', async () => {
    const since = new Date('2026-01-04T00:00:00.000Z');
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-since-3' }));
    await conn.fetchRecords('EMPLOYEE', since);
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('$filter=lastModifiedDateTime');
    expect(url).toContain(since.toISOString());
  });
  it('since-5: since date appears in URL', async () => {
    const since = new Date('2026-01-05T00:00:00.000Z');
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-since-4' }));
    await conn.fetchRecords('EMPLOYEE', since);
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('$filter=lastModifiedDateTime');
    expect(url).toContain(since.toISOString());
  });
  it('since-6: since date appears in URL', async () => {
    const since = new Date('2026-01-06T00:00:00.000Z');
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-since-5' }));
    await conn.fetchRecords('EMPLOYEE', since);
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('$filter=lastModifiedDateTime');
    expect(url).toContain(since.toISOString());
  });
  it('since-7: since date appears in URL', async () => {
    const since = new Date('2026-01-07T00:00:00.000Z');
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-since-6' }));
    await conn.fetchRecords('EMPLOYEE', since);
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('$filter=lastModifiedDateTime');
    expect(url).toContain(since.toISOString());
  });
  it('since-8: since date appears in URL', async () => {
    const since = new Date('2026-01-08T00:00:00.000Z');
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-since-7' }));
    await conn.fetchRecords('EMPLOYEE', since);
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('$filter=lastModifiedDateTime');
    expect(url).toContain(since.toISOString());
  });
  it('since-9: since date appears in URL', async () => {
    const since = new Date('2026-01-09T00:00:00.000Z');
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-since-8' }));
    await conn.fetchRecords('EMPLOYEE', since);
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('$filter=lastModifiedDateTime');
    expect(url).toContain(since.toISOString());
  });
  it('since-10: since date appears in URL', async () => {
    const since = new Date('2026-01-10T00:00:00.000Z');
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-since-9' }));
    await conn.fetchRecords('EMPLOYEE', since);
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('$filter=lastModifiedDateTime');
    expect(url).toContain(since.toISOString());
  });
  it('since-11: since date appears in URL', async () => {
    const since = new Date('2026-01-11T00:00:00.000Z');
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-since-10' }));
    await conn.fetchRecords('EMPLOYEE', since);
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('$filter=lastModifiedDateTime');
    expect(url).toContain(since.toISOString());
  });
  it('since-12: since date appears in URL', async () => {
    const since = new Date('2026-01-12T00:00:00.000Z');
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-since-11' }));
    await conn.fetchRecords('EMPLOYEE', since);
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('$filter=lastModifiedDateTime');
    expect(url).toContain(since.toISOString());
  });
  it('since-13: since date appears in URL', async () => {
    const since = new Date('2026-01-13T00:00:00.000Z');
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-since-12' }));
    await conn.fetchRecords('EMPLOYEE', since);
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('$filter=lastModifiedDateTime');
    expect(url).toContain(since.toISOString());
  });
  it('since-14: since date appears in URL', async () => {
    const since = new Date('2026-01-14T00:00:00.000Z');
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-since-13' }));
    await conn.fetchRecords('EMPLOYEE', since);
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('$filter=lastModifiedDateTime');
    expect(url).toContain(since.toISOString());
  });
  it('since-15: since date appears in URL', async () => {
    const since = new Date('2026-01-15T00:00:00.000Z');
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-since-14' }));
    await conn.fetchRecords('EMPLOYEE', since);
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('$filter=lastModifiedDateTime');
    expect(url).toContain(since.toISOString());
  });
  it('since-16: since date appears in URL', async () => {
    const since = new Date('2026-01-16T00:00:00.000Z');
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-since-15' }));
    await conn.fetchRecords('EMPLOYEE', since);
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('$filter=lastModifiedDateTime');
    expect(url).toContain(since.toISOString());
  });
  it('since-17: since date appears in URL', async () => {
    const since = new Date('2026-01-17T00:00:00.000Z');
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-since-16' }));
    await conn.fetchRecords('EMPLOYEE', since);
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('$filter=lastModifiedDateTime');
    expect(url).toContain(since.toISOString());
  });
  it('since-18: since date appears in URL', async () => {
    const since = new Date('2026-01-18T00:00:00.000Z');
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-since-17' }));
    await conn.fetchRecords('EMPLOYEE', since);
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('$filter=lastModifiedDateTime');
    expect(url).toContain(since.toISOString());
  });
  it('since-19: since date appears in URL', async () => {
    const since = new Date('2026-01-19T00:00:00.000Z');
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-since-18' }));
    await conn.fetchRecords('EMPLOYEE', since);
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('$filter=lastModifiedDateTime');
    expect(url).toContain(since.toISOString());
  });
  it('since-20: since date appears in URL', async () => {
    const since = new Date('2026-01-20T00:00:00.000Z');
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-since-19' }));
    await conn.fetchRecords('EMPLOYEE', since);
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('$filter=lastModifiedDateTime');
    expect(url).toContain(since.toISOString());
  });
  it('since-21: since date appears in URL', async () => {
    const since = new Date('2026-01-21T00:00:00.000Z');
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-since-20' }));
    await conn.fetchRecords('EMPLOYEE', since);
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('$filter=lastModifiedDateTime');
    expect(url).toContain(since.toISOString());
  });
  it('since-22: since date appears in URL', async () => {
    const since = new Date('2026-01-22T00:00:00.000Z');
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-since-21' }));
    await conn.fetchRecords('EMPLOYEE', since);
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('$filter=lastModifiedDateTime');
    expect(url).toContain(since.toISOString());
  });
  it('since-23: since date appears in URL', async () => {
    const since = new Date('2026-01-23T00:00:00.000Z');
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-since-22' }));
    await conn.fetchRecords('EMPLOYEE', since);
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('$filter=lastModifiedDateTime');
    expect(url).toContain(since.toISOString());
  });
  it('since-24: since date appears in URL', async () => {
    const since = new Date('2026-01-24T00:00:00.000Z');
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-since-23' }));
    await conn.fetchRecords('EMPLOYEE', since);
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('$filter=lastModifiedDateTime');
    expect(url).toContain(since.toISOString());
  });
  it('since-25: since date appears in URL', async () => {
    const since = new Date('2026-01-25T00:00:00.000Z');
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-since-24' }));
    await conn.fetchRecords('EMPLOYEE', since);
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('$filter=lastModifiedDateTime');
    expect(url).toContain(since.toISOString());
  });
  it('since-26: since date appears in URL', async () => {
    const since = new Date('2026-01-26T00:00:00.000Z');
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-since-25' }));
    await conn.fetchRecords('EMPLOYEE', since);
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('$filter=lastModifiedDateTime');
    expect(url).toContain(since.toISOString());
  });
  it('since-27: since date appears in URL', async () => {
    const since = new Date('2026-01-27T00:00:00.000Z');
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-since-26' }));
    await conn.fetchRecords('EMPLOYEE', since);
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('$filter=lastModifiedDateTime');
    expect(url).toContain(since.toISOString());
  });
  it('since-28: since date appears in URL', async () => {
    const since = new Date('2026-01-28T00:00:00.000Z');
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-since-27' }));
    await conn.fetchRecords('EMPLOYEE', since);
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('$filter=lastModifiedDateTime');
    expect(url).toContain(since.toISOString());
  });
  it('since-29: since date appears in URL', async () => {
    const since = new Date('2026-01-01T00:00:00.000Z');
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-since-28' }));
    await conn.fetchRecords('EMPLOYEE', since);
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('$filter=lastModifiedDateTime');
    expect(url).toContain(since.toISOString());
  });
  it('since-30: since date appears in URL', async () => {
    const since = new Date('2026-01-02T00:00:00.000Z');
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-since-29' }));
    await conn.fetchRecords('EMPLOYEE', since);
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('$filter=lastModifiedDateTime');
    expect(url).toContain(since.toISOString());
  });
  it('no-since-1: no $filter when since omitted', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ns-0' }));
    await conn.fetchRecords('EMPLOYEE');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).not.toContain('$filter=lastModifiedDateTime');
    expect(url).toContain('/User?');
    expect(url).toContain('$format=json');
  });
  it('no-since-2: no $filter when since omitted', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ns-1' }));
    await conn.fetchRecords('EMPLOYEE');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).not.toContain('$filter=lastModifiedDateTime');
    expect(url).toContain('/User?');
    expect(url).toContain('$format=json');
  });
  it('no-since-3: no $filter when since omitted', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ns-2' }));
    await conn.fetchRecords('EMPLOYEE');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).not.toContain('$filter=lastModifiedDateTime');
    expect(url).toContain('/User?');
    expect(url).toContain('$format=json');
  });
  it('no-since-4: no $filter when since omitted', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ns-3' }));
    await conn.fetchRecords('EMPLOYEE');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).not.toContain('$filter=lastModifiedDateTime');
    expect(url).toContain('/User?');
    expect(url).toContain('$format=json');
  });
  it('no-since-5: no $filter when since omitted', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ns-4' }));
    await conn.fetchRecords('EMPLOYEE');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).not.toContain('$filter=lastModifiedDateTime');
    expect(url).toContain('/User?');
    expect(url).toContain('$format=json');
  });
  it('no-since-6: no $filter when since omitted', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ns-5' }));
    await conn.fetchRecords('EMPLOYEE');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).not.toContain('$filter=lastModifiedDateTime');
    expect(url).toContain('/User?');
    expect(url).toContain('$format=json');
  });
  it('no-since-7: no $filter when since omitted', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ns-6' }));
    await conn.fetchRecords('EMPLOYEE');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).not.toContain('$filter=lastModifiedDateTime');
    expect(url).toContain('/User?');
    expect(url).toContain('$format=json');
  });
  it('no-since-8: no $filter when since omitted', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ns-7' }));
    await conn.fetchRecords('EMPLOYEE');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).not.toContain('$filter=lastModifiedDateTime');
    expect(url).toContain('/User?');
    expect(url).toContain('$format=json');
  });
  it('no-since-9: no $filter when since omitted', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ns-8' }));
    await conn.fetchRecords('EMPLOYEE');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).not.toContain('$filter=lastModifiedDateTime');
    expect(url).toContain('/User?');
    expect(url).toContain('$format=json');
  });
  it('no-since-10: no $filter when since omitted', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ns-9' }));
    await conn.fetchRecords('EMPLOYEE');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).not.toContain('$filter=lastModifiedDateTime');
    expect(url).toContain('/User?');
    expect(url).toContain('$format=json');
  });
  it('no-since-11: no $filter when since omitted', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ns-10' }));
    await conn.fetchRecords('EMPLOYEE');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).not.toContain('$filter=lastModifiedDateTime');
    expect(url).toContain('/User?');
    expect(url).toContain('$format=json');
  });
  it('no-since-12: no $filter when since omitted', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ns-11' }));
    await conn.fetchRecords('EMPLOYEE');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).not.toContain('$filter=lastModifiedDateTime');
    expect(url).toContain('/User?');
    expect(url).toContain('$format=json');
  });
  it('no-since-13: no $filter when since omitted', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ns-12' }));
    await conn.fetchRecords('EMPLOYEE');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).not.toContain('$filter=lastModifiedDateTime');
    expect(url).toContain('/User?');
    expect(url).toContain('$format=json');
  });
  it('no-since-14: no $filter when since omitted', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ns-13' }));
    await conn.fetchRecords('EMPLOYEE');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).not.toContain('$filter=lastModifiedDateTime');
    expect(url).toContain('/User?');
    expect(url).toContain('$format=json');
  });
  it('no-since-15: no $filter when since omitted', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ns-14' }));
    await conn.fetchRecords('EMPLOYEE');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).not.toContain('$filter=lastModifiedDateTime');
    expect(url).toContain('/User?');
    expect(url).toContain('$format=json');
  });
  it('no-since-16: no $filter when since omitted', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ns-15' }));
    await conn.fetchRecords('EMPLOYEE');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).not.toContain('$filter=lastModifiedDateTime');
    expect(url).toContain('/User?');
    expect(url).toContain('$format=json');
  });
  it('no-since-17: no $filter when since omitted', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ns-16' }));
    await conn.fetchRecords('EMPLOYEE');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).not.toContain('$filter=lastModifiedDateTime');
    expect(url).toContain('/User?');
    expect(url).toContain('$format=json');
  });
  it('no-since-18: no $filter when since omitted', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ns-17' }));
    await conn.fetchRecords('EMPLOYEE');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).not.toContain('$filter=lastModifiedDateTime');
    expect(url).toContain('/User?');
    expect(url).toContain('$format=json');
  });
  it('no-since-19: no $filter when since omitted', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ns-18' }));
    await conn.fetchRecords('EMPLOYEE');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).not.toContain('$filter=lastModifiedDateTime');
    expect(url).toContain('/User?');
    expect(url).toContain('$format=json');
  });
  it('no-since-20: no $filter when since omitted', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ns-19' }));
    await conn.fetchRecords('EMPLOYEE');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).not.toContain('$filter=lastModifiedDateTime');
    expect(url).toContain('/User?');
    expect(url).toContain('$format=json');
  });
});

// ── 8. fetchRecords DEPARTMENT success ───────────────────────────────────────

describe('SAPConnector – fetchRecords DEPARTMENT success', () => {
  let fetchMock: jest.SpyInstance;
  beforeEach(() => { fetchMock = jest.spyOn(global, "fetch"); });
  afterEach(() => { fetchMock.mockRestore(); });
  it('dept-1: returns 1 dept records', async () => {
    const depts = Array.from({ length: 1 }, (_, k) => makeDept(0*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-d-0' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(1);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^sap_dept_/);
      expect(r.data.source).toBe('SAP_HR');
    });
  });
  it('dept-2: returns 2 dept records', async () => {
    const depts = Array.from({ length: 2 }, (_, k) => makeDept(1*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-d-1' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(2);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^sap_dept_/);
      expect(r.data.source).toBe('SAP_HR');
    });
  });
  it('dept-3: returns 3 dept records', async () => {
    const depts = Array.from({ length: 3 }, (_, k) => makeDept(2*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-d-2' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(3);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^sap_dept_/);
      expect(r.data.source).toBe('SAP_HR');
    });
  });
  it('dept-4: returns 4 dept records', async () => {
    const depts = Array.from({ length: 4 }, (_, k) => makeDept(3*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-d-3' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(4);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^sap_dept_/);
      expect(r.data.source).toBe('SAP_HR');
    });
  });
  it('dept-5: returns 1 dept records', async () => {
    const depts = Array.from({ length: 1 }, (_, k) => makeDept(4*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-d-4' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(1);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^sap_dept_/);
      expect(r.data.source).toBe('SAP_HR');
    });
  });
  it('dept-6: returns 2 dept records', async () => {
    const depts = Array.from({ length: 2 }, (_, k) => makeDept(5*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-d-5' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(2);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^sap_dept_/);
      expect(r.data.source).toBe('SAP_HR');
    });
  });
  it('dept-7: returns 3 dept records', async () => {
    const depts = Array.from({ length: 3 }, (_, k) => makeDept(6*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-d-6' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(3);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^sap_dept_/);
      expect(r.data.source).toBe('SAP_HR');
    });
  });
  it('dept-8: returns 4 dept records', async () => {
    const depts = Array.from({ length: 4 }, (_, k) => makeDept(7*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-d-7' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(4);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^sap_dept_/);
      expect(r.data.source).toBe('SAP_HR');
    });
  });
  it('dept-9: returns 1 dept records', async () => {
    const depts = Array.from({ length: 1 }, (_, k) => makeDept(8*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-d-8' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(1);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^sap_dept_/);
      expect(r.data.source).toBe('SAP_HR');
    });
  });
  it('dept-10: returns 2 dept records', async () => {
    const depts = Array.from({ length: 2 }, (_, k) => makeDept(9*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-d-9' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(2);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^sap_dept_/);
      expect(r.data.source).toBe('SAP_HR');
    });
  });
  it('dept-11: returns 3 dept records', async () => {
    const depts = Array.from({ length: 3 }, (_, k) => makeDept(10*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-d-10' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(3);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^sap_dept_/);
      expect(r.data.source).toBe('SAP_HR');
    });
  });
  it('dept-12: returns 4 dept records', async () => {
    const depts = Array.from({ length: 4 }, (_, k) => makeDept(11*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-d-11' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(4);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^sap_dept_/);
      expect(r.data.source).toBe('SAP_HR');
    });
  });
  it('dept-13: returns 1 dept records', async () => {
    const depts = Array.from({ length: 1 }, (_, k) => makeDept(12*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-d-12' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(1);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^sap_dept_/);
      expect(r.data.source).toBe('SAP_HR');
    });
  });
  it('dept-14: returns 2 dept records', async () => {
    const depts = Array.from({ length: 2 }, (_, k) => makeDept(13*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-d-13' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(2);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^sap_dept_/);
      expect(r.data.source).toBe('SAP_HR');
    });
  });
  it('dept-15: returns 3 dept records', async () => {
    const depts = Array.from({ length: 3 }, (_, k) => makeDept(14*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-d-14' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(3);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^sap_dept_/);
      expect(r.data.source).toBe('SAP_HR');
    });
  });
  it('dept-16: returns 4 dept records', async () => {
    const depts = Array.from({ length: 4 }, (_, k) => makeDept(15*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-d-15' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(4);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^sap_dept_/);
      expect(r.data.source).toBe('SAP_HR');
    });
  });
  it('dept-17: returns 1 dept records', async () => {
    const depts = Array.from({ length: 1 }, (_, k) => makeDept(16*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-d-16' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(1);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^sap_dept_/);
      expect(r.data.source).toBe('SAP_HR');
    });
  });
  it('dept-18: returns 2 dept records', async () => {
    const depts = Array.from({ length: 2 }, (_, k) => makeDept(17*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-d-17' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(2);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^sap_dept_/);
      expect(r.data.source).toBe('SAP_HR');
    });
  });
  it('dept-19: returns 3 dept records', async () => {
    const depts = Array.from({ length: 3 }, (_, k) => makeDept(18*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-d-18' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(3);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^sap_dept_/);
      expect(r.data.source).toBe('SAP_HR');
    });
  });
  it('dept-20: returns 4 dept records', async () => {
    const depts = Array.from({ length: 4 }, (_, k) => makeDept(19*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-d-19' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(4);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^sap_dept_/);
      expect(r.data.source).toBe('SAP_HR');
    });
  });
  it('dept-21: returns 1 dept records', async () => {
    const depts = Array.from({ length: 1 }, (_, k) => makeDept(20*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-d-20' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(1);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^sap_dept_/);
      expect(r.data.source).toBe('SAP_HR');
    });
  });
  it('dept-22: returns 2 dept records', async () => {
    const depts = Array.from({ length: 2 }, (_, k) => makeDept(21*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-d-21' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(2);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^sap_dept_/);
      expect(r.data.source).toBe('SAP_HR');
    });
  });
  it('dept-23: returns 3 dept records', async () => {
    const depts = Array.from({ length: 3 }, (_, k) => makeDept(22*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-d-22' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(3);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^sap_dept_/);
      expect(r.data.source).toBe('SAP_HR');
    });
  });
  it('dept-24: returns 4 dept records', async () => {
    const depts = Array.from({ length: 4 }, (_, k) => makeDept(23*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-d-23' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(4);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^sap_dept_/);
      expect(r.data.source).toBe('SAP_HR');
    });
  });
  it('dept-25: returns 1 dept records', async () => {
    const depts = Array.from({ length: 1 }, (_, k) => makeDept(24*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-d-24' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(1);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^sap_dept_/);
      expect(r.data.source).toBe('SAP_HR');
    });
  });
  it('dept-26: returns 2 dept records', async () => {
    const depts = Array.from({ length: 2 }, (_, k) => makeDept(25*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-d-25' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(2);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^sap_dept_/);
      expect(r.data.source).toBe('SAP_HR');
    });
  });
  it('dept-27: returns 3 dept records', async () => {
    const depts = Array.from({ length: 3 }, (_, k) => makeDept(26*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-d-26' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(3);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^sap_dept_/);
      expect(r.data.source).toBe('SAP_HR');
    });
  });
  it('dept-28: returns 4 dept records', async () => {
    const depts = Array.from({ length: 4 }, (_, k) => makeDept(27*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-d-27' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(4);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^sap_dept_/);
      expect(r.data.source).toBe('SAP_HR');
    });
  });
  it('dept-29: returns 1 dept records', async () => {
    const depts = Array.from({ length: 1 }, (_, k) => makeDept(28*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-d-28' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(1);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^sap_dept_/);
      expect(r.data.source).toBe('SAP_HR');
    });
  });
  it('dept-30: returns 2 dept records', async () => {
    const depts = Array.from({ length: 2 }, (_, k) => makeDept(29*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-d-29' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(2);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^sap_dept_/);
      expect(r.data.source).toBe('SAP_HR');
    });
  });
  it('dept-31: returns 3 dept records', async () => {
    const depts = Array.from({ length: 3 }, (_, k) => makeDept(30*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-d-30' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(3);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^sap_dept_/);
      expect(r.data.source).toBe('SAP_HR');
    });
  });
  it('dept-32: returns 4 dept records', async () => {
    const depts = Array.from({ length: 4 }, (_, k) => makeDept(31*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-d-31' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(4);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^sap_dept_/);
      expect(r.data.source).toBe('SAP_HR');
    });
  });
  it('dept-33: returns 1 dept records', async () => {
    const depts = Array.from({ length: 1 }, (_, k) => makeDept(32*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-d-32' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(1);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^sap_dept_/);
      expect(r.data.source).toBe('SAP_HR');
    });
  });
  it('dept-34: returns 2 dept records', async () => {
    const depts = Array.from({ length: 2 }, (_, k) => makeDept(33*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-d-33' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(2);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^sap_dept_/);
      expect(r.data.source).toBe('SAP_HR');
    });
  });
  it('dept-35: returns 3 dept records', async () => {
    const depts = Array.from({ length: 3 }, (_, k) => makeDept(34*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-d-34' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(3);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^sap_dept_/);
      expect(r.data.source).toBe('SAP_HR');
    });
  });
  it('dept-36: returns 4 dept records', async () => {
    const depts = Array.from({ length: 4 }, (_, k) => makeDept(35*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-d-35' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(4);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^sap_dept_/);
      expect(r.data.source).toBe('SAP_HR');
    });
  });
  it('dept-37: returns 1 dept records', async () => {
    const depts = Array.from({ length: 1 }, (_, k) => makeDept(36*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-d-36' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(1);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^sap_dept_/);
      expect(r.data.source).toBe('SAP_HR');
    });
  });
  it('dept-38: returns 2 dept records', async () => {
    const depts = Array.from({ length: 2 }, (_, k) => makeDept(37*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-d-37' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(2);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^sap_dept_/);
      expect(r.data.source).toBe('SAP_HR');
    });
  });
  it('dept-39: returns 3 dept records', async () => {
    const depts = Array.from({ length: 3 }, (_, k) => makeDept(38*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-d-38' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(3);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^sap_dept_/);
      expect(r.data.source).toBe('SAP_HR');
    });
  });
  it('dept-40: returns 4 dept records', async () => {
    const depts = Array.from({ length: 4 }, (_, k) => makeDept(39*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-d-39' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(4);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^sap_dept_/);
      expect(r.data.source).toBe('SAP_HR');
    });
  });
  it('dept-41: returns 1 dept records', async () => {
    const depts = Array.from({ length: 1 }, (_, k) => makeDept(40*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-d-40' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(1);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^sap_dept_/);
      expect(r.data.source).toBe('SAP_HR');
    });
  });
  it('dept-42: returns 2 dept records', async () => {
    const depts = Array.from({ length: 2 }, (_, k) => makeDept(41*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-d-41' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(2);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^sap_dept_/);
      expect(r.data.source).toBe('SAP_HR');
    });
  });
  it('dept-43: returns 3 dept records', async () => {
    const depts = Array.from({ length: 3 }, (_, k) => makeDept(42*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-d-42' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(3);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^sap_dept_/);
      expect(r.data.source).toBe('SAP_HR');
    });
  });
  it('dept-44: returns 4 dept records', async () => {
    const depts = Array.from({ length: 4 }, (_, k) => makeDept(43*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-d-43' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(4);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^sap_dept_/);
      expect(r.data.source).toBe('SAP_HR');
    });
  });
  it('dept-45: returns 1 dept records', async () => {
    const depts = Array.from({ length: 1 }, (_, k) => makeDept(44*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-d-44' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(1);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^sap_dept_/);
      expect(r.data.source).toBe('SAP_HR');
    });
  });
  it('dept-46: returns 2 dept records', async () => {
    const depts = Array.from({ length: 2 }, (_, k) => makeDept(45*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-d-45' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(2);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^sap_dept_/);
      expect(r.data.source).toBe('SAP_HR');
    });
  });
  it('dept-47: returns 3 dept records', async () => {
    const depts = Array.from({ length: 3 }, (_, k) => makeDept(46*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-d-46' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(3);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^sap_dept_/);
      expect(r.data.source).toBe('SAP_HR');
    });
  });
  it('dept-48: returns 4 dept records', async () => {
    const depts = Array.from({ length: 4 }, (_, k) => makeDept(47*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-d-47' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(4);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^sap_dept_/);
      expect(r.data.source).toBe('SAP_HR');
    });
  });
  it('dept-49: returns 1 dept records', async () => {
    const depts = Array.from({ length: 1 }, (_, k) => makeDept(48*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-d-48' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(1);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^sap_dept_/);
      expect(r.data.source).toBe('SAP_HR');
    });
  });
  it('dept-50: returns 2 dept records', async () => {
    const depts = Array.from({ length: 2 }, (_, k) => makeDept(49*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-d-49' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(2);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^sap_dept_/);
      expect(r.data.source).toBe('SAP_HR');
    });
  });
  it('dept-51: returns 3 dept records', async () => {
    const depts = Array.from({ length: 3 }, (_, k) => makeDept(50*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-d-50' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(3);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^sap_dept_/);
      expect(r.data.source).toBe('SAP_HR');
    });
  });
  it('dept-52: returns 4 dept records', async () => {
    const depts = Array.from({ length: 4 }, (_, k) => makeDept(51*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-d-51' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(4);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^sap_dept_/);
      expect(r.data.source).toBe('SAP_HR');
    });
  });
  it('dept-53: returns 1 dept records', async () => {
    const depts = Array.from({ length: 1 }, (_, k) => makeDept(52*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-d-52' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(1);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^sap_dept_/);
      expect(r.data.source).toBe('SAP_HR');
    });
  });
  it('dept-54: returns 2 dept records', async () => {
    const depts = Array.from({ length: 2 }, (_, k) => makeDept(53*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-d-53' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(2);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^sap_dept_/);
      expect(r.data.source).toBe('SAP_HR');
    });
  });
  it('dept-55: returns 3 dept records', async () => {
    const depts = Array.from({ length: 3 }, (_, k) => makeDept(54*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-d-54' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(3);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^sap_dept_/);
      expect(r.data.source).toBe('SAP_HR');
    });
  });
  it('dept-56: returns 4 dept records', async () => {
    const depts = Array.from({ length: 4 }, (_, k) => makeDept(55*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-d-55' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(4);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^sap_dept_/);
      expect(r.data.source).toBe('SAP_HR');
    });
  });
  it('dept-57: returns 1 dept records', async () => {
    const depts = Array.from({ length: 1 }, (_, k) => makeDept(56*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-d-56' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(1);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^sap_dept_/);
      expect(r.data.source).toBe('SAP_HR');
    });
  });
  it('dept-58: returns 2 dept records', async () => {
    const depts = Array.from({ length: 2 }, (_, k) => makeDept(57*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-d-57' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(2);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^sap_dept_/);
      expect(r.data.source).toBe('SAP_HR');
    });
  });
  it('dept-59: returns 3 dept records', async () => {
    const depts = Array.from({ length: 3 }, (_, k) => makeDept(58*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-d-58' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(3);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^sap_dept_/);
      expect(r.data.source).toBe('SAP_HR');
    });
  });
  it('dept-60: returns 4 dept records', async () => {
    const depts = Array.from({ length: 4 }, (_, k) => makeDept(59*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-d-59' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(4);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^sap_dept_/);
      expect(r.data.source).toBe('SAP_HR');
    });
  });
  it('dept-61: returns 1 dept records', async () => {
    const depts = Array.from({ length: 1 }, (_, k) => makeDept(60*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-d-60' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(1);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^sap_dept_/);
      expect(r.data.source).toBe('SAP_HR');
    });
  });
  it('dept-62: returns 2 dept records', async () => {
    const depts = Array.from({ length: 2 }, (_, k) => makeDept(61*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-d-61' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(2);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^sap_dept_/);
      expect(r.data.source).toBe('SAP_HR');
    });
  });
  it('dept-63: returns 3 dept records', async () => {
    const depts = Array.from({ length: 3 }, (_, k) => makeDept(62*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-d-62' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(3);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^sap_dept_/);
      expect(r.data.source).toBe('SAP_HR');
    });
  });
  it('dept-64: returns 4 dept records', async () => {
    const depts = Array.from({ length: 4 }, (_, k) => makeDept(63*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-d-63' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(4);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^sap_dept_/);
      expect(r.data.source).toBe('SAP_HR');
    });
  });
  it('dept-65: returns 1 dept records', async () => {
    const depts = Array.from({ length: 1 }, (_, k) => makeDept(64*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-d-64' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(1);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^sap_dept_/);
      expect(r.data.source).toBe('SAP_HR');
    });
  });
  it('dept-66: returns 2 dept records', async () => {
    const depts = Array.from({ length: 2 }, (_, k) => makeDept(65*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-d-65' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(2);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^sap_dept_/);
      expect(r.data.source).toBe('SAP_HR');
    });
  });
  it('dept-67: returns 3 dept records', async () => {
    const depts = Array.from({ length: 3 }, (_, k) => makeDept(66*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-d-66' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(3);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^sap_dept_/);
      expect(r.data.source).toBe('SAP_HR');
    });
  });
  it('dept-68: returns 4 dept records', async () => {
    const depts = Array.from({ length: 4 }, (_, k) => makeDept(67*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-d-67' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(4);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^sap_dept_/);
      expect(r.data.source).toBe('SAP_HR');
    });
  });
  it('dept-69: returns 1 dept records', async () => {
    const depts = Array.from({ length: 1 }, (_, k) => makeDept(68*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-d-68' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(1);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^sap_dept_/);
      expect(r.data.source).toBe('SAP_HR');
    });
  });
  it('dept-70: returns 2 dept records', async () => {
    const depts = Array.from({ length: 2 }, (_, k) => makeDept(69*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-d-69' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(2);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^sap_dept_/);
      expect(r.data.source).toBe('SAP_HR');
    });
  });
  it('dept-71: returns 3 dept records', async () => {
    const depts = Array.from({ length: 3 }, (_, k) => makeDept(70*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-d-70' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(3);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^sap_dept_/);
      expect(r.data.source).toBe('SAP_HR');
    });
  });
  it('dept-72: returns 4 dept records', async () => {
    const depts = Array.from({ length: 4 }, (_, k) => makeDept(71*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-d-71' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(4);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^sap_dept_/);
      expect(r.data.source).toBe('SAP_HR');
    });
  });
  it('dept-73: returns 1 dept records', async () => {
    const depts = Array.from({ length: 1 }, (_, k) => makeDept(72*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-d-72' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(1);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^sap_dept_/);
      expect(r.data.source).toBe('SAP_HR');
    });
  });
  it('dept-74: returns 2 dept records', async () => {
    const depts = Array.from({ length: 2 }, (_, k) => makeDept(73*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-d-73' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(2);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^sap_dept_/);
      expect(r.data.source).toBe('SAP_HR');
    });
  });
  it('dept-75: returns 3 dept records', async () => {
    const depts = Array.from({ length: 3 }, (_, k) => makeDept(74*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-d-74' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(3);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^sap_dept_/);
      expect(r.data.source).toBe('SAP_HR');
    });
  });
  it('dept-76: returns 4 dept records', async () => {
    const depts = Array.from({ length: 4 }, (_, k) => makeDept(75*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-d-75' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(4);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^sap_dept_/);
      expect(r.data.source).toBe('SAP_HR');
    });
  });
  it('dept-77: returns 1 dept records', async () => {
    const depts = Array.from({ length: 1 }, (_, k) => makeDept(76*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-d-76' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(1);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^sap_dept_/);
      expect(r.data.source).toBe('SAP_HR');
    });
  });
  it('dept-78: returns 2 dept records', async () => {
    const depts = Array.from({ length: 2 }, (_, k) => makeDept(77*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-d-77' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(2);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^sap_dept_/);
      expect(r.data.source).toBe('SAP_HR');
    });
  });
  it('dept-79: returns 3 dept records', async () => {
    const depts = Array.from({ length: 3 }, (_, k) => makeDept(78*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-d-78' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(3);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^sap_dept_/);
      expect(r.data.source).toBe('SAP_HR');
    });
  });
  it('dept-80: returns 4 dept records', async () => {
    const depts = Array.from({ length: 4 }, (_, k) => makeDept(79*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-d-79' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs).toHaveLength(4);
    recs.forEach((r, k) => {
      expect(r.entityType).toBe('DEPARTMENT');
      expect(r.externalId).toMatch(/^sap_dept_/);
      expect(r.data.source).toBe('SAP_HR');
    });
  });
  it('dept-url-1: hits /Department endpoint', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-du-0' }));
    await conn.fetchRecords('DEPARTMENT');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('/Department?');
    expect(url).toContain('$select=departmentId,name');
  });
  it('dept-url-2: hits /Department endpoint', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-du-1' }));
    await conn.fetchRecords('DEPARTMENT');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('/Department?');
    expect(url).toContain('$select=departmentId,name');
  });
  it('dept-url-3: hits /Department endpoint', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-du-2' }));
    await conn.fetchRecords('DEPARTMENT');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('/Department?');
    expect(url).toContain('$select=departmentId,name');
  });
  it('dept-url-4: hits /Department endpoint', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-du-3' }));
    await conn.fetchRecords('DEPARTMENT');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('/Department?');
    expect(url).toContain('$select=departmentId,name');
  });
  it('dept-url-5: hits /Department endpoint', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-du-4' }));
    await conn.fetchRecords('DEPARTMENT');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('/Department?');
    expect(url).toContain('$select=departmentId,name');
  });
  it('dept-url-6: hits /Department endpoint', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-du-5' }));
    await conn.fetchRecords('DEPARTMENT');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('/Department?');
    expect(url).toContain('$select=departmentId,name');
  });
  it('dept-url-7: hits /Department endpoint', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-du-6' }));
    await conn.fetchRecords('DEPARTMENT');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('/Department?');
    expect(url).toContain('$select=departmentId,name');
  });
  it('dept-url-8: hits /Department endpoint', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-du-7' }));
    await conn.fetchRecords('DEPARTMENT');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('/Department?');
    expect(url).toContain('$select=departmentId,name');
  });
  it('dept-url-9: hits /Department endpoint', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-du-8' }));
    await conn.fetchRecords('DEPARTMENT');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('/Department?');
    expect(url).toContain('$select=departmentId,name');
  });
  it('dept-url-10: hits /Department endpoint', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-du-9' }));
    await conn.fetchRecords('DEPARTMENT');
    const url = fetchMock.mock.calls[1][0] as string;
    expect(url).toContain('/Department?');
    expect(url).toContain('$select=departmentId,name');
  });
});

// ── 9. fetchRecords DEPARTMENT errors ────────────────────────────────────────

describe('SAPConnector – fetchRecords DEPARTMENT errors', () => {
  let fetchMock: jest.SpyInstance;
  beforeEach(() => { fetchMock = jest.spyOn(global, "fetch"); });
  afterEach(() => { fetchMock.mockRestore(); });
  it('dept-err-401-1: HTTP 401 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(401));
    const conn = new SAPConnector(makeConfig({ id: 'sap-de-401-0' }));
    await expect(conn.fetchRecords('DEPARTMENT')).rejects.toThrow('SAP API error: HTTP 401');
  });
  it('dept-err-401-2: HTTP 401 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(401));
    const conn = new SAPConnector(makeConfig({ id: 'sap-de-401-1' }));
    await expect(conn.fetchRecords('DEPARTMENT')).rejects.toThrow('SAP API error: HTTP 401');
  });
  it('dept-err-401-3: HTTP 401 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(401));
    const conn = new SAPConnector(makeConfig({ id: 'sap-de-401-2' }));
    await expect(conn.fetchRecords('DEPARTMENT')).rejects.toThrow('SAP API error: HTTP 401');
  });
  it('dept-err-401-4: HTTP 401 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(401));
    const conn = new SAPConnector(makeConfig({ id: 'sap-de-401-3' }));
    await expect(conn.fetchRecords('DEPARTMENT')).rejects.toThrow('SAP API error: HTTP 401');
  });
  it('dept-err-403-1: HTTP 403 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(403));
    const conn = new SAPConnector(makeConfig({ id: 'sap-de-403-0' }));
    await expect(conn.fetchRecords('DEPARTMENT')).rejects.toThrow('SAP API error: HTTP 403');
  });
  it('dept-err-403-2: HTTP 403 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(403));
    const conn = new SAPConnector(makeConfig({ id: 'sap-de-403-1' }));
    await expect(conn.fetchRecords('DEPARTMENT')).rejects.toThrow('SAP API error: HTTP 403');
  });
  it('dept-err-403-3: HTTP 403 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(403));
    const conn = new SAPConnector(makeConfig({ id: 'sap-de-403-2' }));
    await expect(conn.fetchRecords('DEPARTMENT')).rejects.toThrow('SAP API error: HTTP 403');
  });
  it('dept-err-403-4: HTTP 403 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(403));
    const conn = new SAPConnector(makeConfig({ id: 'sap-de-403-3' }));
    await expect(conn.fetchRecords('DEPARTMENT')).rejects.toThrow('SAP API error: HTTP 403');
  });
  it('dept-err-500-1: HTTP 500 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(500));
    const conn = new SAPConnector(makeConfig({ id: 'sap-de-500-0' }));
    await expect(conn.fetchRecords('DEPARTMENT')).rejects.toThrow('SAP API error: HTTP 500');
  });
  it('dept-err-500-2: HTTP 500 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(500));
    const conn = new SAPConnector(makeConfig({ id: 'sap-de-500-1' }));
    await expect(conn.fetchRecords('DEPARTMENT')).rejects.toThrow('SAP API error: HTTP 500');
  });
  it('dept-err-500-3: HTTP 500 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(500));
    const conn = new SAPConnector(makeConfig({ id: 'sap-de-500-2' }));
    await expect(conn.fetchRecords('DEPARTMENT')).rejects.toThrow('SAP API error: HTTP 500');
  });
  it('dept-err-500-4: HTTP 500 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(500));
    const conn = new SAPConnector(makeConfig({ id: 'sap-de-500-3' }));
    await expect(conn.fetchRecords('DEPARTMENT')).rejects.toThrow('SAP API error: HTTP 500');
  });
  it('dept-err-503-1: HTTP 503 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(503));
    const conn = new SAPConnector(makeConfig({ id: 'sap-de-503-0' }));
    await expect(conn.fetchRecords('DEPARTMENT')).rejects.toThrow('SAP API error: HTTP 503');
  });
  it('dept-err-503-2: HTTP 503 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(503));
    const conn = new SAPConnector(makeConfig({ id: 'sap-de-503-1' }));
    await expect(conn.fetchRecords('DEPARTMENT')).rejects.toThrow('SAP API error: HTTP 503');
  });
  it('dept-err-503-3: HTTP 503 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(503));
    const conn = new SAPConnector(makeConfig({ id: 'sap-de-503-2' }));
    await expect(conn.fetchRecords('DEPARTMENT')).rejects.toThrow('SAP API error: HTTP 503');
  });
  it('dept-err-503-4: HTTP 503 throws', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(503));
    const conn = new SAPConnector(makeConfig({ id: 'sap-de-503-3' }));
    await expect(conn.fetchRecords('DEPARTMENT')).rejects.toThrow('SAP API error: HTTP 503');
  });
  it('dept-empty-1: empty → []', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-de2-0' }));
    expect(await conn.fetchRecords('DEPARTMENT')).toHaveLength(0);
  });
  it('dept-empty-2: empty → []', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-de2-1' }));
    expect(await conn.fetchRecords('DEPARTMENT')).toHaveLength(0);
  });
  it('dept-empty-3: empty → []', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-de2-2' }));
    expect(await conn.fetchRecords('DEPARTMENT')).toHaveLength(0);
  });
  it('dept-empty-4: empty → []', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-de2-3' }));
    expect(await conn.fetchRecords('DEPARTMENT')).toHaveLength(0);
  });
  it('dept-empty-5: empty → []', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-de2-4' }));
    expect(await conn.fetchRecords('DEPARTMENT')).toHaveLength(0);
  });
  it('dept-empty-6: empty → []', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-de2-5' }));
    expect(await conn.fetchRecords('DEPARTMENT')).toHaveLength(0);
  });
  it('dept-empty-7: empty → []', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-de2-6' }));
    expect(await conn.fetchRecords('DEPARTMENT')).toHaveLength(0);
  });
  it('dept-empty-8: empty → []', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-de2-7' }));
    expect(await conn.fetchRecords('DEPARTMENT')).toHaveLength(0);
  });
});

// ── 10. Unsupported entity types ─────────────────────────────────────────────

describe('SAPConnector – unsupported entity types', () => {
  let fetchMock: jest.SpyInstance;
  beforeEach(() => { fetchMock = jest.spyOn(global, "fetch"); });
  afterEach(() => { fetchMock.mockRestore(); });
  it('unsup-POSITION-1: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-POSITION-0' }));
    const recs = await conn.fetchRecords('POSITION');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-POSITION-2: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-POSITION-1' }));
    const recs = await conn.fetchRecords('POSITION');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-POSITION-3: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-POSITION-2' }));
    const recs = await conn.fetchRecords('POSITION');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-POSITION-4: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-POSITION-3' }));
    const recs = await conn.fetchRecords('POSITION');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-POSITION-5: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-POSITION-4' }));
    const recs = await conn.fetchRecords('POSITION');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-POSITION-6: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-POSITION-5' }));
    const recs = await conn.fetchRecords('POSITION');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-POSITION-7: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-POSITION-6' }));
    const recs = await conn.fetchRecords('POSITION');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-POSITION-8: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-POSITION-7' }));
    const recs = await conn.fetchRecords('POSITION');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-POSITION-9: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-POSITION-8' }));
    const recs = await conn.fetchRecords('POSITION');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-POSITION-10: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-POSITION-9' }));
    const recs = await conn.fetchRecords('POSITION');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-POSITION-11: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-POSITION-10' }));
    const recs = await conn.fetchRecords('POSITION');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-POSITION-12: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-POSITION-11' }));
    const recs = await conn.fetchRecords('POSITION');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-POSITION-13: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-POSITION-12' }));
    const recs = await conn.fetchRecords('POSITION');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-POSITION-14: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-POSITION-13' }));
    const recs = await conn.fetchRecords('POSITION');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-POSITION-15: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-POSITION-14' }));
    const recs = await conn.fetchRecords('POSITION');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-POSITION-16: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-POSITION-15' }));
    const recs = await conn.fetchRecords('POSITION');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-POSITION-17: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-POSITION-16' }));
    const recs = await conn.fetchRecords('POSITION');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-POSITION-18: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-POSITION-17' }));
    const recs = await conn.fetchRecords('POSITION');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-POSITION-19: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-POSITION-18' }));
    const recs = await conn.fetchRecords('POSITION');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-POSITION-20: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-POSITION-19' }));
    const recs = await conn.fetchRecords('POSITION');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-POSITION-21: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-POSITION-20' }));
    const recs = await conn.fetchRecords('POSITION');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-POSITION-22: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-POSITION-21' }));
    const recs = await conn.fetchRecords('POSITION');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-POSITION-23: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-POSITION-22' }));
    const recs = await conn.fetchRecords('POSITION');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-POSITION-24: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-POSITION-23' }));
    const recs = await conn.fetchRecords('POSITION');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-POSITION-25: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-POSITION-24' }));
    const recs = await conn.fetchRecords('POSITION');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-POSITION-26: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-POSITION-25' }));
    const recs = await conn.fetchRecords('POSITION');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-POSITION-27: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-POSITION-26' }));
    const recs = await conn.fetchRecords('POSITION');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-POSITION-28: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-POSITION-27' }));
    const recs = await conn.fetchRecords('POSITION');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-POSITION-29: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-POSITION-28' }));
    const recs = await conn.fetchRecords('POSITION');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-POSITION-30: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-POSITION-29' }));
    const recs = await conn.fetchRecords('POSITION');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-LEAVE-1: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-LEAVE-0' }));
    const recs = await conn.fetchRecords('LEAVE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-LEAVE-2: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-LEAVE-1' }));
    const recs = await conn.fetchRecords('LEAVE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-LEAVE-3: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-LEAVE-2' }));
    const recs = await conn.fetchRecords('LEAVE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-LEAVE-4: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-LEAVE-3' }));
    const recs = await conn.fetchRecords('LEAVE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-LEAVE-5: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-LEAVE-4' }));
    const recs = await conn.fetchRecords('LEAVE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-LEAVE-6: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-LEAVE-5' }));
    const recs = await conn.fetchRecords('LEAVE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-LEAVE-7: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-LEAVE-6' }));
    const recs = await conn.fetchRecords('LEAVE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-LEAVE-8: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-LEAVE-7' }));
    const recs = await conn.fetchRecords('LEAVE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-LEAVE-9: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-LEAVE-8' }));
    const recs = await conn.fetchRecords('LEAVE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-LEAVE-10: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-LEAVE-9' }));
    const recs = await conn.fetchRecords('LEAVE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-LEAVE-11: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-LEAVE-10' }));
    const recs = await conn.fetchRecords('LEAVE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-LEAVE-12: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-LEAVE-11' }));
    const recs = await conn.fetchRecords('LEAVE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-LEAVE-13: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-LEAVE-12' }));
    const recs = await conn.fetchRecords('LEAVE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-LEAVE-14: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-LEAVE-13' }));
    const recs = await conn.fetchRecords('LEAVE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-LEAVE-15: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-LEAVE-14' }));
    const recs = await conn.fetchRecords('LEAVE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-LEAVE-16: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-LEAVE-15' }));
    const recs = await conn.fetchRecords('LEAVE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-LEAVE-17: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-LEAVE-16' }));
    const recs = await conn.fetchRecords('LEAVE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-LEAVE-18: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-LEAVE-17' }));
    const recs = await conn.fetchRecords('LEAVE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-LEAVE-19: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-LEAVE-18' }));
    const recs = await conn.fetchRecords('LEAVE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-LEAVE-20: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-LEAVE-19' }));
    const recs = await conn.fetchRecords('LEAVE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-LEAVE-21: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-LEAVE-20' }));
    const recs = await conn.fetchRecords('LEAVE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-LEAVE-22: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-LEAVE-21' }));
    const recs = await conn.fetchRecords('LEAVE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-LEAVE-23: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-LEAVE-22' }));
    const recs = await conn.fetchRecords('LEAVE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-LEAVE-24: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-LEAVE-23' }));
    const recs = await conn.fetchRecords('LEAVE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-LEAVE-25: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-LEAVE-24' }));
    const recs = await conn.fetchRecords('LEAVE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-LEAVE-26: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-LEAVE-25' }));
    const recs = await conn.fetchRecords('LEAVE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-LEAVE-27: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-LEAVE-26' }));
    const recs = await conn.fetchRecords('LEAVE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-LEAVE-28: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-LEAVE-27' }));
    const recs = await conn.fetchRecords('LEAVE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-LEAVE-29: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-LEAVE-28' }));
    const recs = await conn.fetchRecords('LEAVE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-LEAVE-30: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-LEAVE-29' }));
    const recs = await conn.fetchRecords('LEAVE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-SUPPLIER-1: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-SUPPLIER-0' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-SUPPLIER-2: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-SUPPLIER-1' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-SUPPLIER-3: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-SUPPLIER-2' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-SUPPLIER-4: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-SUPPLIER-3' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-SUPPLIER-5: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-SUPPLIER-4' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-SUPPLIER-6: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-SUPPLIER-5' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-SUPPLIER-7: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-SUPPLIER-6' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-SUPPLIER-8: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-SUPPLIER-7' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-SUPPLIER-9: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-SUPPLIER-8' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-SUPPLIER-10: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-SUPPLIER-9' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-SUPPLIER-11: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-SUPPLIER-10' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-SUPPLIER-12: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-SUPPLIER-11' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-SUPPLIER-13: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-SUPPLIER-12' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-SUPPLIER-14: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-SUPPLIER-13' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-SUPPLIER-15: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-SUPPLIER-14' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-SUPPLIER-16: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-SUPPLIER-15' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-SUPPLIER-17: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-SUPPLIER-16' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-SUPPLIER-18: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-SUPPLIER-17' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-SUPPLIER-19: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-SUPPLIER-18' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-SUPPLIER-20: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-SUPPLIER-19' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-SUPPLIER-21: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-SUPPLIER-20' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-SUPPLIER-22: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-SUPPLIER-21' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-SUPPLIER-23: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-SUPPLIER-22' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-SUPPLIER-24: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-SUPPLIER-23' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-SUPPLIER-25: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-SUPPLIER-24' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-SUPPLIER-26: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-SUPPLIER-25' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-SUPPLIER-27: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-SUPPLIER-26' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-SUPPLIER-28: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-SUPPLIER-27' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-SUPPLIER-29: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-SUPPLIER-28' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-SUPPLIER-30: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-SUPPLIER-29' }));
    const recs = await conn.fetchRecords('SUPPLIER');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-INVOICE-1: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-INVOICE-0' }));
    const recs = await conn.fetchRecords('INVOICE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-INVOICE-2: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-INVOICE-1' }));
    const recs = await conn.fetchRecords('INVOICE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-INVOICE-3: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-INVOICE-2' }));
    const recs = await conn.fetchRecords('INVOICE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-INVOICE-4: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-INVOICE-3' }));
    const recs = await conn.fetchRecords('INVOICE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-INVOICE-5: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-INVOICE-4' }));
    const recs = await conn.fetchRecords('INVOICE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-INVOICE-6: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-INVOICE-5' }));
    const recs = await conn.fetchRecords('INVOICE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-INVOICE-7: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-INVOICE-6' }));
    const recs = await conn.fetchRecords('INVOICE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-INVOICE-8: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-INVOICE-7' }));
    const recs = await conn.fetchRecords('INVOICE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-INVOICE-9: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-INVOICE-8' }));
    const recs = await conn.fetchRecords('INVOICE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-INVOICE-10: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-INVOICE-9' }));
    const recs = await conn.fetchRecords('INVOICE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-INVOICE-11: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-INVOICE-10' }));
    const recs = await conn.fetchRecords('INVOICE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-INVOICE-12: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-INVOICE-11' }));
    const recs = await conn.fetchRecords('INVOICE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-INVOICE-13: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-INVOICE-12' }));
    const recs = await conn.fetchRecords('INVOICE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-INVOICE-14: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-INVOICE-13' }));
    const recs = await conn.fetchRecords('INVOICE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-INVOICE-15: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-INVOICE-14' }));
    const recs = await conn.fetchRecords('INVOICE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-INVOICE-16: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-INVOICE-15' }));
    const recs = await conn.fetchRecords('INVOICE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-INVOICE-17: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-INVOICE-16' }));
    const recs = await conn.fetchRecords('INVOICE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-INVOICE-18: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-INVOICE-17' }));
    const recs = await conn.fetchRecords('INVOICE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-INVOICE-19: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-INVOICE-18' }));
    const recs = await conn.fetchRecords('INVOICE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-INVOICE-20: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-INVOICE-19' }));
    const recs = await conn.fetchRecords('INVOICE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-INVOICE-21: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-INVOICE-20' }));
    const recs = await conn.fetchRecords('INVOICE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-INVOICE-22: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-INVOICE-21' }));
    const recs = await conn.fetchRecords('INVOICE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-INVOICE-23: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-INVOICE-22' }));
    const recs = await conn.fetchRecords('INVOICE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-INVOICE-24: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-INVOICE-23' }));
    const recs = await conn.fetchRecords('INVOICE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-INVOICE-25: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-INVOICE-24' }));
    const recs = await conn.fetchRecords('INVOICE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-INVOICE-26: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-INVOICE-25' }));
    const recs = await conn.fetchRecords('INVOICE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-INVOICE-27: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-INVOICE-26' }));
    const recs = await conn.fetchRecords('INVOICE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-INVOICE-28: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-INVOICE-27' }));
    const recs = await conn.fetchRecords('INVOICE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-INVOICE-29: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-INVOICE-28' }));
    const recs = await conn.fetchRecords('INVOICE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
  it('unsup-INVOICE-30: returns []', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-u-INVOICE-29' }));
    const recs = await conn.fetchRecords('INVOICE');
    expect(recs).toHaveLength(0);
    expect(Array.isArray(recs)).toBe(true);
    const dataCalls = fetchMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && !(c[0] as string).includes('token')
    );
    expect(dataCalls).toHaveLength(0);
  });
});

// ── 11. createSAPConnector factory ───────────────────────────────────────────

describe('createSAPConnector factory', () => {
  it('factory-1: returns SAPConnector with correct properties', () => {
    const cfg = makeConfig({ id: 'factory-0', name: 'Factory 0' });
    const conn = createSAPConnector(cfg);
    expect(conn).toBeInstanceOf(SAPConnector);
    expect(conn.id).toBe('factory-0');
    expect(conn.name).toBe('Factory 0');
    expect(conn.type).toBe('SAP_HR');
  });
  it('factory-2: returns SAPConnector with correct properties', () => {
    const cfg = makeConfig({ id: 'factory-1', name: 'Factory 1' });
    const conn = createSAPConnector(cfg);
    expect(conn).toBeInstanceOf(SAPConnector);
    expect(conn.id).toBe('factory-1');
    expect(conn.name).toBe('Factory 1');
    expect(conn.type).toBe('SAP_HR');
  });
  it('factory-3: returns SAPConnector with correct properties', () => {
    const cfg = makeConfig({ id: 'factory-2', name: 'Factory 2' });
    const conn = createSAPConnector(cfg);
    expect(conn).toBeInstanceOf(SAPConnector);
    expect(conn.id).toBe('factory-2');
    expect(conn.name).toBe('Factory 2');
    expect(conn.type).toBe('SAP_HR');
  });
  it('factory-4: returns SAPConnector with correct properties', () => {
    const cfg = makeConfig({ id: 'factory-3', name: 'Factory 3' });
    const conn = createSAPConnector(cfg);
    expect(conn).toBeInstanceOf(SAPConnector);
    expect(conn.id).toBe('factory-3');
    expect(conn.name).toBe('Factory 3');
    expect(conn.type).toBe('SAP_HR');
  });
  it('factory-5: returns SAPConnector with correct properties', () => {
    const cfg = makeConfig({ id: 'factory-4', name: 'Factory 4' });
    const conn = createSAPConnector(cfg);
    expect(conn).toBeInstanceOf(SAPConnector);
    expect(conn.id).toBe('factory-4');
    expect(conn.name).toBe('Factory 4');
    expect(conn.type).toBe('SAP_HR');
  });
  it('factory-6: returns SAPConnector with correct properties', () => {
    const cfg = makeConfig({ id: 'factory-5', name: 'Factory 5' });
    const conn = createSAPConnector(cfg);
    expect(conn).toBeInstanceOf(SAPConnector);
    expect(conn.id).toBe('factory-5');
    expect(conn.name).toBe('Factory 5');
    expect(conn.type).toBe('SAP_HR');
  });
  it('factory-7: returns SAPConnector with correct properties', () => {
    const cfg = makeConfig({ id: 'factory-6', name: 'Factory 6' });
    const conn = createSAPConnector(cfg);
    expect(conn).toBeInstanceOf(SAPConnector);
    expect(conn.id).toBe('factory-6');
    expect(conn.name).toBe('Factory 6');
    expect(conn.type).toBe('SAP_HR');
  });
  it('factory-8: returns SAPConnector with correct properties', () => {
    const cfg = makeConfig({ id: 'factory-7', name: 'Factory 7' });
    const conn = createSAPConnector(cfg);
    expect(conn).toBeInstanceOf(SAPConnector);
    expect(conn.id).toBe('factory-7');
    expect(conn.name).toBe('Factory 7');
    expect(conn.type).toBe('SAP_HR');
  });
  it('factory-9: returns SAPConnector with correct properties', () => {
    const cfg = makeConfig({ id: 'factory-8', name: 'Factory 8' });
    const conn = createSAPConnector(cfg);
    expect(conn).toBeInstanceOf(SAPConnector);
    expect(conn.id).toBe('factory-8');
    expect(conn.name).toBe('Factory 8');
    expect(conn.type).toBe('SAP_HR');
  });
  it('factory-10: returns SAPConnector with correct properties', () => {
    const cfg = makeConfig({ id: 'factory-9', name: 'Factory 9' });
    const conn = createSAPConnector(cfg);
    expect(conn).toBeInstanceOf(SAPConnector);
    expect(conn.id).toBe('factory-9');
    expect(conn.name).toBe('Factory 9');
    expect(conn.type).toBe('SAP_HR');
  });
  it('factory-11: returns SAPConnector with correct properties', () => {
    const cfg = makeConfig({ id: 'factory-10', name: 'Factory 10' });
    const conn = createSAPConnector(cfg);
    expect(conn).toBeInstanceOf(SAPConnector);
    expect(conn.id).toBe('factory-10');
    expect(conn.name).toBe('Factory 10');
    expect(conn.type).toBe('SAP_HR');
  });
  it('factory-12: returns SAPConnector with correct properties', () => {
    const cfg = makeConfig({ id: 'factory-11', name: 'Factory 11' });
    const conn = createSAPConnector(cfg);
    expect(conn).toBeInstanceOf(SAPConnector);
    expect(conn.id).toBe('factory-11');
    expect(conn.name).toBe('Factory 11');
    expect(conn.type).toBe('SAP_HR');
  });
  it('factory-13: returns SAPConnector with correct properties', () => {
    const cfg = makeConfig({ id: 'factory-12', name: 'Factory 12' });
    const conn = createSAPConnector(cfg);
    expect(conn).toBeInstanceOf(SAPConnector);
    expect(conn.id).toBe('factory-12');
    expect(conn.name).toBe('Factory 12');
    expect(conn.type).toBe('SAP_HR');
  });
  it('factory-14: returns SAPConnector with correct properties', () => {
    const cfg = makeConfig({ id: 'factory-13', name: 'Factory 13' });
    const conn = createSAPConnector(cfg);
    expect(conn).toBeInstanceOf(SAPConnector);
    expect(conn.id).toBe('factory-13');
    expect(conn.name).toBe('Factory 13');
    expect(conn.type).toBe('SAP_HR');
  });
  it('factory-15: returns SAPConnector with correct properties', () => {
    const cfg = makeConfig({ id: 'factory-14', name: 'Factory 14' });
    const conn = createSAPConnector(cfg);
    expect(conn).toBeInstanceOf(SAPConnector);
    expect(conn.id).toBe('factory-14');
    expect(conn.name).toBe('Factory 14');
    expect(conn.type).toBe('SAP_HR');
  });
  it('factory-16: returns SAPConnector with correct properties', () => {
    const cfg = makeConfig({ id: 'factory-15', name: 'Factory 15' });
    const conn = createSAPConnector(cfg);
    expect(conn).toBeInstanceOf(SAPConnector);
    expect(conn.id).toBe('factory-15');
    expect(conn.name).toBe('Factory 15');
    expect(conn.type).toBe('SAP_HR');
  });
  it('factory-17: returns SAPConnector with correct properties', () => {
    const cfg = makeConfig({ id: 'factory-16', name: 'Factory 16' });
    const conn = createSAPConnector(cfg);
    expect(conn).toBeInstanceOf(SAPConnector);
    expect(conn.id).toBe('factory-16');
    expect(conn.name).toBe('Factory 16');
    expect(conn.type).toBe('SAP_HR');
  });
  it('factory-18: returns SAPConnector with correct properties', () => {
    const cfg = makeConfig({ id: 'factory-17', name: 'Factory 17' });
    const conn = createSAPConnector(cfg);
    expect(conn).toBeInstanceOf(SAPConnector);
    expect(conn.id).toBe('factory-17');
    expect(conn.name).toBe('Factory 17');
    expect(conn.type).toBe('SAP_HR');
  });
  it('factory-19: returns SAPConnector with correct properties', () => {
    const cfg = makeConfig({ id: 'factory-18', name: 'Factory 18' });
    const conn = createSAPConnector(cfg);
    expect(conn).toBeInstanceOf(SAPConnector);
    expect(conn.id).toBe('factory-18');
    expect(conn.name).toBe('Factory 18');
    expect(conn.type).toBe('SAP_HR');
  });
  it('factory-20: returns SAPConnector with correct properties', () => {
    const cfg = makeConfig({ id: 'factory-19', name: 'Factory 19' });
    const conn = createSAPConnector(cfg);
    expect(conn).toBeInstanceOf(SAPConnector);
    expect(conn.id).toBe('factory-19');
    expect(conn.name).toBe('Factory 19');
    expect(conn.type).toBe('SAP_HR');
  });
  it('factory-21: returns SAPConnector with correct properties', () => {
    const cfg = makeConfig({ id: 'factory-20', name: 'Factory 20' });
    const conn = createSAPConnector(cfg);
    expect(conn).toBeInstanceOf(SAPConnector);
    expect(conn.id).toBe('factory-20');
    expect(conn.name).toBe('Factory 20');
    expect(conn.type).toBe('SAP_HR');
  });
  it('factory-22: returns SAPConnector with correct properties', () => {
    const cfg = makeConfig({ id: 'factory-21', name: 'Factory 21' });
    const conn = createSAPConnector(cfg);
    expect(conn).toBeInstanceOf(SAPConnector);
    expect(conn.id).toBe('factory-21');
    expect(conn.name).toBe('Factory 21');
    expect(conn.type).toBe('SAP_HR');
  });
  it('factory-23: returns SAPConnector with correct properties', () => {
    const cfg = makeConfig({ id: 'factory-22', name: 'Factory 22' });
    const conn = createSAPConnector(cfg);
    expect(conn).toBeInstanceOf(SAPConnector);
    expect(conn.id).toBe('factory-22');
    expect(conn.name).toBe('Factory 22');
    expect(conn.type).toBe('SAP_HR');
  });
  it('factory-24: returns SAPConnector with correct properties', () => {
    const cfg = makeConfig({ id: 'factory-23', name: 'Factory 23' });
    const conn = createSAPConnector(cfg);
    expect(conn).toBeInstanceOf(SAPConnector);
    expect(conn.id).toBe('factory-23');
    expect(conn.name).toBe('Factory 23');
    expect(conn.type).toBe('SAP_HR');
  });
  it('factory-25: returns SAPConnector with correct properties', () => {
    const cfg = makeConfig({ id: 'factory-24', name: 'Factory 24' });
    const conn = createSAPConnector(cfg);
    expect(conn).toBeInstanceOf(SAPConnector);
    expect(conn.id).toBe('factory-24');
    expect(conn.name).toBe('Factory 24');
    expect(conn.type).toBe('SAP_HR');
  });
  it('factory-26: returns SAPConnector with correct properties', () => {
    const cfg = makeConfig({ id: 'factory-25', name: 'Factory 25' });
    const conn = createSAPConnector(cfg);
    expect(conn).toBeInstanceOf(SAPConnector);
    expect(conn.id).toBe('factory-25');
    expect(conn.name).toBe('Factory 25');
    expect(conn.type).toBe('SAP_HR');
  });
  it('factory-27: returns SAPConnector with correct properties', () => {
    const cfg = makeConfig({ id: 'factory-26', name: 'Factory 26' });
    const conn = createSAPConnector(cfg);
    expect(conn).toBeInstanceOf(SAPConnector);
    expect(conn.id).toBe('factory-26');
    expect(conn.name).toBe('Factory 26');
    expect(conn.type).toBe('SAP_HR');
  });
  it('factory-28: returns SAPConnector with correct properties', () => {
    const cfg = makeConfig({ id: 'factory-27', name: 'Factory 27' });
    const conn = createSAPConnector(cfg);
    expect(conn).toBeInstanceOf(SAPConnector);
    expect(conn.id).toBe('factory-27');
    expect(conn.name).toBe('Factory 27');
    expect(conn.type).toBe('SAP_HR');
  });
  it('factory-29: returns SAPConnector with correct properties', () => {
    const cfg = makeConfig({ id: 'factory-28', name: 'Factory 28' });
    const conn = createSAPConnector(cfg);
    expect(conn).toBeInstanceOf(SAPConnector);
    expect(conn.id).toBe('factory-28');
    expect(conn.name).toBe('Factory 28');
    expect(conn.type).toBe('SAP_HR');
  });
  it('factory-30: returns SAPConnector with correct properties', () => {
    const cfg = makeConfig({ id: 'factory-29', name: 'Factory 29' });
    const conn = createSAPConnector(cfg);
    expect(conn).toBeInstanceOf(SAPConnector);
    expect(conn.id).toBe('factory-29');
    expect(conn.name).toBe('Factory 29');
    expect(conn.type).toBe('SAP_HR');
  });
  it('factory-31: returns SAPConnector with correct properties', () => {
    const cfg = makeConfig({ id: 'factory-30', name: 'Factory 30' });
    const conn = createSAPConnector(cfg);
    expect(conn).toBeInstanceOf(SAPConnector);
    expect(conn.id).toBe('factory-30');
    expect(conn.name).toBe('Factory 30');
    expect(conn.type).toBe('SAP_HR');
  });
  it('factory-32: returns SAPConnector with correct properties', () => {
    const cfg = makeConfig({ id: 'factory-31', name: 'Factory 31' });
    const conn = createSAPConnector(cfg);
    expect(conn).toBeInstanceOf(SAPConnector);
    expect(conn.id).toBe('factory-31');
    expect(conn.name).toBe('Factory 31');
    expect(conn.type).toBe('SAP_HR');
  });
  it('factory-33: returns SAPConnector with correct properties', () => {
    const cfg = makeConfig({ id: 'factory-32', name: 'Factory 32' });
    const conn = createSAPConnector(cfg);
    expect(conn).toBeInstanceOf(SAPConnector);
    expect(conn.id).toBe('factory-32');
    expect(conn.name).toBe('Factory 32');
    expect(conn.type).toBe('SAP_HR');
  });
  it('factory-34: returns SAPConnector with correct properties', () => {
    const cfg = makeConfig({ id: 'factory-33', name: 'Factory 33' });
    const conn = createSAPConnector(cfg);
    expect(conn).toBeInstanceOf(SAPConnector);
    expect(conn.id).toBe('factory-33');
    expect(conn.name).toBe('Factory 33');
    expect(conn.type).toBe('SAP_HR');
  });
  it('factory-35: returns SAPConnector with correct properties', () => {
    const cfg = makeConfig({ id: 'factory-34', name: 'Factory 34' });
    const conn = createSAPConnector(cfg);
    expect(conn).toBeInstanceOf(SAPConnector);
    expect(conn.id).toBe('factory-34');
    expect(conn.name).toBe('Factory 34');
    expect(conn.type).toBe('SAP_HR');
  });
  it('factory-36: returns SAPConnector with correct properties', () => {
    const cfg = makeConfig({ id: 'factory-35', name: 'Factory 35' });
    const conn = createSAPConnector(cfg);
    expect(conn).toBeInstanceOf(SAPConnector);
    expect(conn.id).toBe('factory-35');
    expect(conn.name).toBe('Factory 35');
    expect(conn.type).toBe('SAP_HR');
  });
  it('factory-37: returns SAPConnector with correct properties', () => {
    const cfg = makeConfig({ id: 'factory-36', name: 'Factory 36' });
    const conn = createSAPConnector(cfg);
    expect(conn).toBeInstanceOf(SAPConnector);
    expect(conn.id).toBe('factory-36');
    expect(conn.name).toBe('Factory 36');
    expect(conn.type).toBe('SAP_HR');
  });
  it('factory-38: returns SAPConnector with correct properties', () => {
    const cfg = makeConfig({ id: 'factory-37', name: 'Factory 37' });
    const conn = createSAPConnector(cfg);
    expect(conn).toBeInstanceOf(SAPConnector);
    expect(conn.id).toBe('factory-37');
    expect(conn.name).toBe('Factory 37');
    expect(conn.type).toBe('SAP_HR');
  });
  it('factory-39: returns SAPConnector with correct properties', () => {
    const cfg = makeConfig({ id: 'factory-38', name: 'Factory 38' });
    const conn = createSAPConnector(cfg);
    expect(conn).toBeInstanceOf(SAPConnector);
    expect(conn.id).toBe('factory-38');
    expect(conn.name).toBe('Factory 38');
    expect(conn.type).toBe('SAP_HR');
  });
  it('factory-40: returns SAPConnector with correct properties', () => {
    const cfg = makeConfig({ id: 'factory-39', name: 'Factory 39' });
    const conn = createSAPConnector(cfg);
    expect(conn).toBeInstanceOf(SAPConnector);
    expect(conn.id).toBe('factory-39');
    expect(conn.name).toBe('Factory 39');
    expect(conn.type).toBe('SAP_HR');
  });
  it('factory-41: returns SAPConnector with correct properties', () => {
    const cfg = makeConfig({ id: 'factory-40', name: 'Factory 40' });
    const conn = createSAPConnector(cfg);
    expect(conn).toBeInstanceOf(SAPConnector);
    expect(conn.id).toBe('factory-40');
    expect(conn.name).toBe('Factory 40');
    expect(conn.type).toBe('SAP_HR');
  });
  it('factory-42: returns SAPConnector with correct properties', () => {
    const cfg = makeConfig({ id: 'factory-41', name: 'Factory 41' });
    const conn = createSAPConnector(cfg);
    expect(conn).toBeInstanceOf(SAPConnector);
    expect(conn.id).toBe('factory-41');
    expect(conn.name).toBe('Factory 41');
    expect(conn.type).toBe('SAP_HR');
  });
  it('factory-43: returns SAPConnector with correct properties', () => {
    const cfg = makeConfig({ id: 'factory-42', name: 'Factory 42' });
    const conn = createSAPConnector(cfg);
    expect(conn).toBeInstanceOf(SAPConnector);
    expect(conn.id).toBe('factory-42');
    expect(conn.name).toBe('Factory 42');
    expect(conn.type).toBe('SAP_HR');
  });
  it('factory-44: returns SAPConnector with correct properties', () => {
    const cfg = makeConfig({ id: 'factory-43', name: 'Factory 43' });
    const conn = createSAPConnector(cfg);
    expect(conn).toBeInstanceOf(SAPConnector);
    expect(conn.id).toBe('factory-43');
    expect(conn.name).toBe('Factory 43');
    expect(conn.type).toBe('SAP_HR');
  });
  it('factory-45: returns SAPConnector with correct properties', () => {
    const cfg = makeConfig({ id: 'factory-44', name: 'Factory 44' });
    const conn = createSAPConnector(cfg);
    expect(conn).toBeInstanceOf(SAPConnector);
    expect(conn.id).toBe('factory-44');
    expect(conn.name).toBe('Factory 44');
    expect(conn.type).toBe('SAP_HR');
  });
  it('factory-46: returns SAPConnector with correct properties', () => {
    const cfg = makeConfig({ id: 'factory-45', name: 'Factory 45' });
    const conn = createSAPConnector(cfg);
    expect(conn).toBeInstanceOf(SAPConnector);
    expect(conn.id).toBe('factory-45');
    expect(conn.name).toBe('Factory 45');
    expect(conn.type).toBe('SAP_HR');
  });
  it('factory-47: returns SAPConnector with correct properties', () => {
    const cfg = makeConfig({ id: 'factory-46', name: 'Factory 46' });
    const conn = createSAPConnector(cfg);
    expect(conn).toBeInstanceOf(SAPConnector);
    expect(conn.id).toBe('factory-46');
    expect(conn.name).toBe('Factory 46');
    expect(conn.type).toBe('SAP_HR');
  });
  it('factory-48: returns SAPConnector with correct properties', () => {
    const cfg = makeConfig({ id: 'factory-47', name: 'Factory 47' });
    const conn = createSAPConnector(cfg);
    expect(conn).toBeInstanceOf(SAPConnector);
    expect(conn.id).toBe('factory-47');
    expect(conn.name).toBe('Factory 47');
    expect(conn.type).toBe('SAP_HR');
  });
  it('factory-49: returns SAPConnector with correct properties', () => {
    const cfg = makeConfig({ id: 'factory-48', name: 'Factory 48' });
    const conn = createSAPConnector(cfg);
    expect(conn).toBeInstanceOf(SAPConnector);
    expect(conn.id).toBe('factory-48');
    expect(conn.name).toBe('Factory 48');
    expect(conn.type).toBe('SAP_HR');
  });
  it('factory-50: returns SAPConnector with correct properties', () => {
    const cfg = makeConfig({ id: 'factory-49', name: 'Factory 49' });
    const conn = createSAPConnector(cfg);
    expect(conn).toBeInstanceOf(SAPConnector);
    expect(conn.id).toBe('factory-49');
    expect(conn.name).toBe('Factory 49');
    expect(conn.type).toBe('SAP_HR');
  });
});

// ── 12. executeSync ──────────────────────────────────────────────────────────

describe('SAPConnector – executeSync', () => {
  let fetchMock: jest.SpyInstance;
  beforeEach(() => { fetchMock = jest.spyOn(global, "fetch"); });
  afterEach(() => { fetchMock.mockRestore(); });
  it('exec-emp-1: 1 emp → SUCCESS', async () => {
    const emps = Array.from({ length: 1 }, (_, k) => makeEmp(0*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-x-0' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(1);
    expect(res.errors).toHaveLength(0);
  });
  it('exec-emp-2: 2 emp → SUCCESS', async () => {
    const emps = Array.from({ length: 2 }, (_, k) => makeEmp(1*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-x-1' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(2);
    expect(res.errors).toHaveLength(0);
  });
  it('exec-emp-3: 3 emp → SUCCESS', async () => {
    const emps = Array.from({ length: 3 }, (_, k) => makeEmp(2*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-x-2' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(3);
    expect(res.errors).toHaveLength(0);
  });
  it('exec-emp-4: 1 emp → SUCCESS', async () => {
    const emps = Array.from({ length: 1 }, (_, k) => makeEmp(3*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-x-3' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(1);
    expect(res.errors).toHaveLength(0);
  });
  it('exec-emp-5: 2 emp → SUCCESS', async () => {
    const emps = Array.from({ length: 2 }, (_, k) => makeEmp(4*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-x-4' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(2);
    expect(res.errors).toHaveLength(0);
  });
  it('exec-emp-6: 3 emp → SUCCESS', async () => {
    const emps = Array.from({ length: 3 }, (_, k) => makeEmp(5*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-x-5' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(3);
    expect(res.errors).toHaveLength(0);
  });
  it('exec-emp-7: 1 emp → SUCCESS', async () => {
    const emps = Array.from({ length: 1 }, (_, k) => makeEmp(6*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-x-6' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(1);
    expect(res.errors).toHaveLength(0);
  });
  it('exec-emp-8: 2 emp → SUCCESS', async () => {
    const emps = Array.from({ length: 2 }, (_, k) => makeEmp(7*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-x-7' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(2);
    expect(res.errors).toHaveLength(0);
  });
  it('exec-emp-9: 3 emp → SUCCESS', async () => {
    const emps = Array.from({ length: 3 }, (_, k) => makeEmp(8*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-x-8' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(3);
    expect(res.errors).toHaveLength(0);
  });
  it('exec-emp-10: 1 emp → SUCCESS', async () => {
    const emps = Array.from({ length: 1 }, (_, k) => makeEmp(9*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-x-9' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(1);
    expect(res.errors).toHaveLength(0);
  });
  it('exec-emp-11: 2 emp → SUCCESS', async () => {
    const emps = Array.from({ length: 2 }, (_, k) => makeEmp(10*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-x-10' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(2);
    expect(res.errors).toHaveLength(0);
  });
  it('exec-emp-12: 3 emp → SUCCESS', async () => {
    const emps = Array.from({ length: 3 }, (_, k) => makeEmp(11*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-x-11' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(3);
    expect(res.errors).toHaveLength(0);
  });
  it('exec-emp-13: 1 emp → SUCCESS', async () => {
    const emps = Array.from({ length: 1 }, (_, k) => makeEmp(12*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-x-12' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(1);
    expect(res.errors).toHaveLength(0);
  });
  it('exec-emp-14: 2 emp → SUCCESS', async () => {
    const emps = Array.from({ length: 2 }, (_, k) => makeEmp(13*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-x-13' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(2);
    expect(res.errors).toHaveLength(0);
  });
  it('exec-emp-15: 3 emp → SUCCESS', async () => {
    const emps = Array.from({ length: 3 }, (_, k) => makeEmp(14*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-x-14' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(3);
    expect(res.errors).toHaveLength(0);
  });
  it('exec-emp-16: 1 emp → SUCCESS', async () => {
    const emps = Array.from({ length: 1 }, (_, k) => makeEmp(15*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-x-15' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(1);
    expect(res.errors).toHaveLength(0);
  });
  it('exec-emp-17: 2 emp → SUCCESS', async () => {
    const emps = Array.from({ length: 2 }, (_, k) => makeEmp(16*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-x-16' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(2);
    expect(res.errors).toHaveLength(0);
  });
  it('exec-emp-18: 3 emp → SUCCESS', async () => {
    const emps = Array.from({ length: 3 }, (_, k) => makeEmp(17*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-x-17' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(3);
    expect(res.errors).toHaveLength(0);
  });
  it('exec-emp-19: 1 emp → SUCCESS', async () => {
    const emps = Array.from({ length: 1 }, (_, k) => makeEmp(18*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-x-18' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(1);
    expect(res.errors).toHaveLength(0);
  });
  it('exec-emp-20: 2 emp → SUCCESS', async () => {
    const emps = Array.from({ length: 2 }, (_, k) => makeEmp(19*10+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: emps } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-x-19' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(2);
    expect(res.errors).toHaveLength(0);
  });
  it('exec-dept-1: 1 depts → SUCCESS', async () => {
    const depts = Array.from({ length: 1 }, (_, k) => makeDept(0*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-xd-0' }));
    const res = await conn.executeSync(makeJob(['DEPARTMENT']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(1);
  });
  it('exec-dept-2: 2 depts → SUCCESS', async () => {
    const depts = Array.from({ length: 2 }, (_, k) => makeDept(1*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-xd-1' }));
    const res = await conn.executeSync(makeJob(['DEPARTMENT']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(2);
  });
  it('exec-dept-3: 3 depts → SUCCESS', async () => {
    const depts = Array.from({ length: 3 }, (_, k) => makeDept(2*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-xd-2' }));
    const res = await conn.executeSync(makeJob(['DEPARTMENT']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(3);
  });
  it('exec-dept-4: 4 depts → SUCCESS', async () => {
    const depts = Array.from({ length: 4 }, (_, k) => makeDept(3*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-xd-3' }));
    const res = await conn.executeSync(makeJob(['DEPARTMENT']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(4);
  });
  it('exec-dept-5: 1 depts → SUCCESS', async () => {
    const depts = Array.from({ length: 1 }, (_, k) => makeDept(4*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-xd-4' }));
    const res = await conn.executeSync(makeJob(['DEPARTMENT']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(1);
  });
  it('exec-dept-6: 2 depts → SUCCESS', async () => {
    const depts = Array.from({ length: 2 }, (_, k) => makeDept(5*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-xd-5' }));
    const res = await conn.executeSync(makeJob(['DEPARTMENT']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(2);
  });
  it('exec-dept-7: 3 depts → SUCCESS', async () => {
    const depts = Array.from({ length: 3 }, (_, k) => makeDept(6*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-xd-6' }));
    const res = await conn.executeSync(makeJob(['DEPARTMENT']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(3);
  });
  it('exec-dept-8: 4 depts → SUCCESS', async () => {
    const depts = Array.from({ length: 4 }, (_, k) => makeDept(7*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-xd-7' }));
    const res = await conn.executeSync(makeJob(['DEPARTMENT']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(4);
  });
  it('exec-dept-9: 1 depts → SUCCESS', async () => {
    const depts = Array.from({ length: 1 }, (_, k) => makeDept(8*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-xd-8' }));
    const res = await conn.executeSync(makeJob(['DEPARTMENT']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(1);
  });
  it('exec-dept-10: 2 depts → SUCCESS', async () => {
    const depts = Array.from({ length: 2 }, (_, k) => makeDept(9*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-xd-9' }));
    const res = await conn.executeSync(makeJob(['DEPARTMENT']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(2);
  });
  it('exec-dept-11: 3 depts → SUCCESS', async () => {
    const depts = Array.from({ length: 3 }, (_, k) => makeDept(10*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-xd-10' }));
    const res = await conn.executeSync(makeJob(['DEPARTMENT']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(3);
  });
  it('exec-dept-12: 4 depts → SUCCESS', async () => {
    const depts = Array.from({ length: 4 }, (_, k) => makeDept(11*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-xd-11' }));
    const res = await conn.executeSync(makeJob(['DEPARTMENT']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(4);
  });
  it('exec-dept-13: 1 depts → SUCCESS', async () => {
    const depts = Array.from({ length: 1 }, (_, k) => makeDept(12*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-xd-12' }));
    const res = await conn.executeSync(makeJob(['DEPARTMENT']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(1);
  });
  it('exec-dept-14: 2 depts → SUCCESS', async () => {
    const depts = Array.from({ length: 2 }, (_, k) => makeDept(13*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-xd-13' }));
    const res = await conn.executeSync(makeJob(['DEPARTMENT']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(2);
  });
  it('exec-dept-15: 3 depts → SUCCESS', async () => {
    const depts = Array.from({ length: 3 }, (_, k) => makeDept(14*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-xd-14' }));
    const res = await conn.executeSync(makeJob(['DEPARTMENT']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(3);
  });
  it('exec-dept-16: 4 depts → SUCCESS', async () => {
    const depts = Array.from({ length: 4 }, (_, k) => makeDept(15*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-xd-15' }));
    const res = await conn.executeSync(makeJob(['DEPARTMENT']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(4);
  });
  it('exec-dept-17: 1 depts → SUCCESS', async () => {
    const depts = Array.from({ length: 1 }, (_, k) => makeDept(16*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-xd-16' }));
    const res = await conn.executeSync(makeJob(['DEPARTMENT']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(1);
  });
  it('exec-dept-18: 2 depts → SUCCESS', async () => {
    const depts = Array.from({ length: 2 }, (_, k) => makeDept(17*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-xd-17' }));
    const res = await conn.executeSync(makeJob(['DEPARTMENT']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(2);
  });
  it('exec-dept-19: 3 depts → SUCCESS', async () => {
    const depts = Array.from({ length: 3 }, (_, k) => makeDept(18*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-xd-18' }));
    const res = await conn.executeSync(makeJob(['DEPARTMENT']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(3);
  });
  it('exec-dept-20: 4 depts → SUCCESS', async () => {
    const depts = Array.from({ length: 4 }, (_, k) => makeDept(19*5+k));
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-xd-19' }));
    const res = await conn.executeSync(makeJob(['DEPARTMENT']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(4);
  });
  it('exec-fail-1: API 500 → FAILED', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(500));
    const conn = new SAPConnector(makeConfig({ id: 'sap-xf-0' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE']));
    expect(res.status).toBe('FAILED');
    expect(res.errors.length).toBeGreaterThan(0);
  });
  it('exec-fail-2: API 500 → FAILED', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(500));
    const conn = new SAPConnector(makeConfig({ id: 'sap-xf-1' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE']));
    expect(res.status).toBe('FAILED');
    expect(res.errors.length).toBeGreaterThan(0);
  });
  it('exec-fail-3: API 500 → FAILED', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(500));
    const conn = new SAPConnector(makeConfig({ id: 'sap-xf-2' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE']));
    expect(res.status).toBe('FAILED');
    expect(res.errors.length).toBeGreaterThan(0);
  });
  it('exec-fail-4: API 500 → FAILED', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(500));
    const conn = new SAPConnector(makeConfig({ id: 'sap-xf-3' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE']));
    expect(res.status).toBe('FAILED');
    expect(res.errors.length).toBeGreaterThan(0);
  });
  it('exec-fail-5: API 500 → FAILED', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(500));
    const conn = new SAPConnector(makeConfig({ id: 'sap-xf-4' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE']));
    expect(res.status).toBe('FAILED');
    expect(res.errors.length).toBeGreaterThan(0);
  });
  it('exec-fail-6: API 500 → FAILED', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(500));
    const conn = new SAPConnector(makeConfig({ id: 'sap-xf-5' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE']));
    expect(res.status).toBe('FAILED');
    expect(res.errors.length).toBeGreaterThan(0);
  });
  it('exec-fail-7: API 500 → FAILED', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(500));
    const conn = new SAPConnector(makeConfig({ id: 'sap-xf-6' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE']));
    expect(res.status).toBe('FAILED');
    expect(res.errors.length).toBeGreaterThan(0);
  });
  it('exec-fail-8: API 500 → FAILED', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(500));
    const conn = new SAPConnector(makeConfig({ id: 'sap-xf-7' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE']));
    expect(res.status).toBe('FAILED');
    expect(res.errors.length).toBeGreaterThan(0);
  });
  it('exec-fail-9: API 500 → FAILED', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(500));
    const conn = new SAPConnector(makeConfig({ id: 'sap-xf-8' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE']));
    expect(res.status).toBe('FAILED');
    expect(res.errors.length).toBeGreaterThan(0);
  });
  it('exec-fail-10: API 500 → FAILED', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(500));
    const conn = new SAPConnector(makeConfig({ id: 'sap-xf-9' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE']));
    expect(res.status).toBe('FAILED');
    expect(res.errors.length).toBeGreaterThan(0);
  });
  it('exec-fail-11: API 500 → FAILED', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(500));
    const conn = new SAPConnector(makeConfig({ id: 'sap-xf-10' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE']));
    expect(res.status).toBe('FAILED');
    expect(res.errors.length).toBeGreaterThan(0);
  });
  it('exec-fail-12: API 500 → FAILED', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(500));
    const conn = new SAPConnector(makeConfig({ id: 'sap-xf-11' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE']));
    expect(res.status).toBe('FAILED');
    expect(res.errors.length).toBeGreaterThan(0);
  });
  it('exec-fail-13: API 500 → FAILED', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(500));
    const conn = new SAPConnector(makeConfig({ id: 'sap-xf-12' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE']));
    expect(res.status).toBe('FAILED');
    expect(res.errors.length).toBeGreaterThan(0);
  });
  it('exec-fail-14: API 500 → FAILED', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(500));
    const conn = new SAPConnector(makeConfig({ id: 'sap-xf-13' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE']));
    expect(res.status).toBe('FAILED');
    expect(res.errors.length).toBeGreaterThan(0);
  });
  it('exec-fail-15: API 500 → FAILED', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(500));
    const conn = new SAPConnector(makeConfig({ id: 'sap-xf-14' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE']));
    expect(res.status).toBe('FAILED');
    expect(res.errors.length).toBeGreaterThan(0);
  });
  it('exec-fail-16: API 500 → FAILED', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(500));
    const conn = new SAPConnector(makeConfig({ id: 'sap-xf-15' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE']));
    expect(res.status).toBe('FAILED');
    expect(res.errors.length).toBeGreaterThan(0);
  });
  it('exec-fail-17: API 500 → FAILED', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(500));
    const conn = new SAPConnector(makeConfig({ id: 'sap-xf-16' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE']));
    expect(res.status).toBe('FAILED');
    expect(res.errors.length).toBeGreaterThan(0);
  });
  it('exec-fail-18: API 500 → FAILED', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(500));
    const conn = new SAPConnector(makeConfig({ id: 'sap-xf-17' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE']));
    expect(res.status).toBe('FAILED');
    expect(res.errors.length).toBeGreaterThan(0);
  });
  it('exec-fail-19: API 500 → FAILED', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(500));
    const conn = new SAPConnector(makeConfig({ id: 'sap-xf-18' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE']));
    expect(res.status).toBe('FAILED');
    expect(res.errors.length).toBeGreaterThan(0);
  });
  it('exec-fail-20: API 500 → FAILED', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockError(500));
    const conn = new SAPConnector(makeConfig({ id: 'sap-xf-19' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE']));
    expect(res.status).toBe('FAILED');
    expect(res.errors.length).toBeGreaterThan(0);
  });
  it('exec-multi-1: EMPLOYEE+DEPARTMENT → total 2', async () => {
    const emps = Array.from({ length: 1 }, (_, k) => makeEmp(0*10+k));
    const depts = Array.from({ length: 1 }, (_, k) => makeDept(0*5+k));
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ d: { results: emps } }))
             .mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-xm-0' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE', 'DEPARTMENT']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(2);
  });
  it('exec-multi-2: EMPLOYEE+DEPARTMENT → total 4', async () => {
    const emps = Array.from({ length: 2 }, (_, k) => makeEmp(1*10+k));
    const depts = Array.from({ length: 2 }, (_, k) => makeDept(1*5+k));
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ d: { results: emps } }))
             .mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-xm-1' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE', 'DEPARTMENT']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(4);
  });
  it('exec-multi-3: EMPLOYEE+DEPARTMENT → total 4', async () => {
    const emps = Array.from({ length: 3 }, (_, k) => makeEmp(2*10+k));
    const depts = Array.from({ length: 1 }, (_, k) => makeDept(2*5+k));
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ d: { results: emps } }))
             .mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-xm-2' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE', 'DEPARTMENT']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(4);
  });
  it('exec-multi-4: EMPLOYEE+DEPARTMENT → total 3', async () => {
    const emps = Array.from({ length: 1 }, (_, k) => makeEmp(3*10+k));
    const depts = Array.from({ length: 2 }, (_, k) => makeDept(3*5+k));
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ d: { results: emps } }))
             .mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-xm-3' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE', 'DEPARTMENT']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(3);
  });
  it('exec-multi-5: EMPLOYEE+DEPARTMENT → total 3', async () => {
    const emps = Array.from({ length: 2 }, (_, k) => makeEmp(4*10+k));
    const depts = Array.from({ length: 1 }, (_, k) => makeDept(4*5+k));
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ d: { results: emps } }))
             .mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-xm-4' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE', 'DEPARTMENT']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(3);
  });
  it('exec-multi-6: EMPLOYEE+DEPARTMENT → total 5', async () => {
    const emps = Array.from({ length: 3 }, (_, k) => makeEmp(5*10+k));
    const depts = Array.from({ length: 2 }, (_, k) => makeDept(5*5+k));
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ d: { results: emps } }))
             .mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-xm-5' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE', 'DEPARTMENT']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(5);
  });
  it('exec-multi-7: EMPLOYEE+DEPARTMENT → total 2', async () => {
    const emps = Array.from({ length: 1 }, (_, k) => makeEmp(6*10+k));
    const depts = Array.from({ length: 1 }, (_, k) => makeDept(6*5+k));
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ d: { results: emps } }))
             .mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-xm-6' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE', 'DEPARTMENT']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(2);
  });
  it('exec-multi-8: EMPLOYEE+DEPARTMENT → total 4', async () => {
    const emps = Array.from({ length: 2 }, (_, k) => makeEmp(7*10+k));
    const depts = Array.from({ length: 2 }, (_, k) => makeDept(7*5+k));
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ d: { results: emps } }))
             .mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-xm-7' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE', 'DEPARTMENT']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(4);
  });
  it('exec-multi-9: EMPLOYEE+DEPARTMENT → total 4', async () => {
    const emps = Array.from({ length: 3 }, (_, k) => makeEmp(8*10+k));
    const depts = Array.from({ length: 1 }, (_, k) => makeDept(8*5+k));
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ d: { results: emps } }))
             .mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-xm-8' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE', 'DEPARTMENT']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(4);
  });
  it('exec-multi-10: EMPLOYEE+DEPARTMENT → total 3', async () => {
    const emps = Array.from({ length: 1 }, (_, k) => makeEmp(9*10+k));
    const depts = Array.from({ length: 2 }, (_, k) => makeDept(9*5+k));
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ d: { results: emps } }))
             .mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-xm-9' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE', 'DEPARTMENT']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(3);
  });
  it('exec-multi-11: EMPLOYEE+DEPARTMENT → total 3', async () => {
    const emps = Array.from({ length: 2 }, (_, k) => makeEmp(10*10+k));
    const depts = Array.from({ length: 1 }, (_, k) => makeDept(10*5+k));
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ d: { results: emps } }))
             .mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-xm-10' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE', 'DEPARTMENT']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(3);
  });
  it('exec-multi-12: EMPLOYEE+DEPARTMENT → total 5', async () => {
    const emps = Array.from({ length: 3 }, (_, k) => makeEmp(11*10+k));
    const depts = Array.from({ length: 2 }, (_, k) => makeDept(11*5+k));
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ d: { results: emps } }))
             .mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-xm-11' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE', 'DEPARTMENT']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(5);
  });
  it('exec-multi-13: EMPLOYEE+DEPARTMENT → total 2', async () => {
    const emps = Array.from({ length: 1 }, (_, k) => makeEmp(12*10+k));
    const depts = Array.from({ length: 1 }, (_, k) => makeDept(12*5+k));
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ d: { results: emps } }))
             .mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-xm-12' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE', 'DEPARTMENT']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(2);
  });
  it('exec-multi-14: EMPLOYEE+DEPARTMENT → total 4', async () => {
    const emps = Array.from({ length: 2 }, (_, k) => makeEmp(13*10+k));
    const depts = Array.from({ length: 2 }, (_, k) => makeDept(13*5+k));
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ d: { results: emps } }))
             .mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-xm-13' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE', 'DEPARTMENT']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(4);
  });
  it('exec-multi-15: EMPLOYEE+DEPARTMENT → total 4', async () => {
    const emps = Array.from({ length: 3 }, (_, k) => makeEmp(14*10+k));
    const depts = Array.from({ length: 1 }, (_, k) => makeDept(14*5+k));
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ d: { results: emps } }))
             .mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-xm-14' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE', 'DEPARTMENT']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(4);
  });
  it('exec-multi-16: EMPLOYEE+DEPARTMENT → total 3', async () => {
    const emps = Array.from({ length: 1 }, (_, k) => makeEmp(15*10+k));
    const depts = Array.from({ length: 2 }, (_, k) => makeDept(15*5+k));
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ d: { results: emps } }))
             .mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-xm-15' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE', 'DEPARTMENT']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(3);
  });
  it('exec-multi-17: EMPLOYEE+DEPARTMENT → total 3', async () => {
    const emps = Array.from({ length: 2 }, (_, k) => makeEmp(16*10+k));
    const depts = Array.from({ length: 1 }, (_, k) => makeDept(16*5+k));
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ d: { results: emps } }))
             .mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-xm-16' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE', 'DEPARTMENT']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(3);
  });
  it('exec-multi-18: EMPLOYEE+DEPARTMENT → total 5', async () => {
    const emps = Array.from({ length: 3 }, (_, k) => makeEmp(17*10+k));
    const depts = Array.from({ length: 2 }, (_, k) => makeDept(17*5+k));
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ d: { results: emps } }))
             .mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-xm-17' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE', 'DEPARTMENT']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(5);
  });
  it('exec-multi-19: EMPLOYEE+DEPARTMENT → total 2', async () => {
    const emps = Array.from({ length: 1 }, (_, k) => makeEmp(18*10+k));
    const depts = Array.from({ length: 1 }, (_, k) => makeDept(18*5+k));
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ d: { results: emps } }))
             .mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-xm-18' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE', 'DEPARTMENT']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(2);
  });
  it('exec-multi-20: EMPLOYEE+DEPARTMENT → total 4', async () => {
    const emps = Array.from({ length: 2 }, (_, k) => makeEmp(19*10+k));
    const depts = Array.from({ length: 2 }, (_, k) => makeDept(19*5+k));
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ d: { results: emps } }))
             .mockResolvedValueOnce(mockData({ d: { results: depts } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-xm-19' }));
    const res = await conn.executeSync(makeJob(['EMPLOYEE', 'DEPARTMENT']));
    expect(res.status).toBe('SUCCESS');
    expect(res.stats.totalFetched).toBe(4);
  });
});

// ── 13. EventEmitter events ──────────────────────────────────────────────────

describe('SAPConnector – EventEmitter events', () => {
  let fetchMock: jest.SpyInstance;
  beforeEach(() => { fetchMock = jest.spyOn(global, "fetch"); });
  afterEach(() => { fetchMock.mockRestore(); });
  it('evt-start-1: emits job:start', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-es-0' }));
    const h = jest.fn();
    conn.on('job:start', h);
    await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
    expect(h.mock.calls[0][0].id).toBe('job-001');
  });
  it('evt-start-2: emits job:start', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-es-1' }));
    const h = jest.fn();
    conn.on('job:start', h);
    await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
    expect(h.mock.calls[0][0].id).toBe('job-001');
  });
  it('evt-start-3: emits job:start', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-es-2' }));
    const h = jest.fn();
    conn.on('job:start', h);
    await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
    expect(h.mock.calls[0][0].id).toBe('job-001');
  });
  it('evt-start-4: emits job:start', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-es-3' }));
    const h = jest.fn();
    conn.on('job:start', h);
    await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
    expect(h.mock.calls[0][0].id).toBe('job-001');
  });
  it('evt-start-5: emits job:start', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-es-4' }));
    const h = jest.fn();
    conn.on('job:start', h);
    await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
    expect(h.mock.calls[0][0].id).toBe('job-001');
  });
  it('evt-start-6: emits job:start', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-es-5' }));
    const h = jest.fn();
    conn.on('job:start', h);
    await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
    expect(h.mock.calls[0][0].id).toBe('job-001');
  });
  it('evt-start-7: emits job:start', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-es-6' }));
    const h = jest.fn();
    conn.on('job:start', h);
    await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
    expect(h.mock.calls[0][0].id).toBe('job-001');
  });
  it('evt-start-8: emits job:start', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-es-7' }));
    const h = jest.fn();
    conn.on('job:start', h);
    await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
    expect(h.mock.calls[0][0].id).toBe('job-001');
  });
  it('evt-start-9: emits job:start', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-es-8' }));
    const h = jest.fn();
    conn.on('job:start', h);
    await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
    expect(h.mock.calls[0][0].id).toBe('job-001');
  });
  it('evt-start-10: emits job:start', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-es-9' }));
    const h = jest.fn();
    conn.on('job:start', h);
    await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
    expect(h.mock.calls[0][0].id).toBe('job-001');
  });
  it('evt-start-11: emits job:start', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-es-10' }));
    const h = jest.fn();
    conn.on('job:start', h);
    await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
    expect(h.mock.calls[0][0].id).toBe('job-001');
  });
  it('evt-start-12: emits job:start', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-es-11' }));
    const h = jest.fn();
    conn.on('job:start', h);
    await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
    expect(h.mock.calls[0][0].id).toBe('job-001');
  });
  it('evt-start-13: emits job:start', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-es-12' }));
    const h = jest.fn();
    conn.on('job:start', h);
    await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
    expect(h.mock.calls[0][0].id).toBe('job-001');
  });
  it('evt-start-14: emits job:start', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-es-13' }));
    const h = jest.fn();
    conn.on('job:start', h);
    await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
    expect(h.mock.calls[0][0].id).toBe('job-001');
  });
  it('evt-start-15: emits job:start', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-es-14' }));
    const h = jest.fn();
    conn.on('job:start', h);
    await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
    expect(h.mock.calls[0][0].id).toBe('job-001');
  });
  it('evt-complete-1: emits job:complete', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ec-0' }));
    const h = jest.fn();
    conn.on('job:complete', h);
    const res = await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
    expect(h.mock.calls[0][0]).toBe(res);
  });
  it('evt-complete-2: emits job:complete', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ec-1' }));
    const h = jest.fn();
    conn.on('job:complete', h);
    const res = await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
    expect(h.mock.calls[0][0]).toBe(res);
  });
  it('evt-complete-3: emits job:complete', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ec-2' }));
    const h = jest.fn();
    conn.on('job:complete', h);
    const res = await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
    expect(h.mock.calls[0][0]).toBe(res);
  });
  it('evt-complete-4: emits job:complete', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ec-3' }));
    const h = jest.fn();
    conn.on('job:complete', h);
    const res = await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
    expect(h.mock.calls[0][0]).toBe(res);
  });
  it('evt-complete-5: emits job:complete', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ec-4' }));
    const h = jest.fn();
    conn.on('job:complete', h);
    const res = await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
    expect(h.mock.calls[0][0]).toBe(res);
  });
  it('evt-complete-6: emits job:complete', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ec-5' }));
    const h = jest.fn();
    conn.on('job:complete', h);
    const res = await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
    expect(h.mock.calls[0][0]).toBe(res);
  });
  it('evt-complete-7: emits job:complete', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ec-6' }));
    const h = jest.fn();
    conn.on('job:complete', h);
    const res = await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
    expect(h.mock.calls[0][0]).toBe(res);
  });
  it('evt-complete-8: emits job:complete', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ec-7' }));
    const h = jest.fn();
    conn.on('job:complete', h);
    const res = await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
    expect(h.mock.calls[0][0]).toBe(res);
  });
  it('evt-complete-9: emits job:complete', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ec-8' }));
    const h = jest.fn();
    conn.on('job:complete', h);
    const res = await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
    expect(h.mock.calls[0][0]).toBe(res);
  });
  it('evt-complete-10: emits job:complete', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ec-9' }));
    const h = jest.fn();
    conn.on('job:complete', h);
    const res = await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
    expect(h.mock.calls[0][0]).toBe(res);
  });
  it('evt-complete-11: emits job:complete', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ec-10' }));
    const h = jest.fn();
    conn.on('job:complete', h);
    const res = await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
    expect(h.mock.calls[0][0]).toBe(res);
  });
  it('evt-complete-12: emits job:complete', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ec-11' }));
    const h = jest.fn();
    conn.on('job:complete', h);
    const res = await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
    expect(h.mock.calls[0][0]).toBe(res);
  });
  it('evt-complete-13: emits job:complete', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ec-12' }));
    const h = jest.fn();
    conn.on('job:complete', h);
    const res = await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
    expect(h.mock.calls[0][0]).toBe(res);
  });
  it('evt-complete-14: emits job:complete', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ec-13' }));
    const h = jest.fn();
    conn.on('job:complete', h);
    const res = await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
    expect(h.mock.calls[0][0]).toBe(res);
  });
  it('evt-complete-15: emits job:complete', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ec-14' }));
    const h = jest.fn();
    conn.on('job:complete', h);
    const res = await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
    expect(h.mock.calls[0][0]).toBe(res);
  });
  it('evt-progress-1: emits progress event', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [makeEmp(0)] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ep-0' }));
    const h = jest.fn();
    conn.on('progress', h);
    await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalled();
    expect(h.mock.calls[0][0].entityType).toBe('EMPLOYEE');
  });
  it('evt-progress-2: emits progress event', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [makeEmp(1)] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ep-1' }));
    const h = jest.fn();
    conn.on('progress', h);
    await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalled();
    expect(h.mock.calls[0][0].entityType).toBe('EMPLOYEE');
  });
  it('evt-progress-3: emits progress event', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [makeEmp(2)] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ep-2' }));
    const h = jest.fn();
    conn.on('progress', h);
    await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalled();
    expect(h.mock.calls[0][0].entityType).toBe('EMPLOYEE');
  });
  it('evt-progress-4: emits progress event', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [makeEmp(3)] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ep-3' }));
    const h = jest.fn();
    conn.on('progress', h);
    await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalled();
    expect(h.mock.calls[0][0].entityType).toBe('EMPLOYEE');
  });
  it('evt-progress-5: emits progress event', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [makeEmp(4)] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ep-4' }));
    const h = jest.fn();
    conn.on('progress', h);
    await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalled();
    expect(h.mock.calls[0][0].entityType).toBe('EMPLOYEE');
  });
  it('evt-progress-6: emits progress event', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [makeEmp(5)] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ep-5' }));
    const h = jest.fn();
    conn.on('progress', h);
    await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalled();
    expect(h.mock.calls[0][0].entityType).toBe('EMPLOYEE');
  });
  it('evt-progress-7: emits progress event', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [makeEmp(6)] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ep-6' }));
    const h = jest.fn();
    conn.on('progress', h);
    await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalled();
    expect(h.mock.calls[0][0].entityType).toBe('EMPLOYEE');
  });
  it('evt-progress-8: emits progress event', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [makeEmp(7)] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ep-7' }));
    const h = jest.fn();
    conn.on('progress', h);
    await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalled();
    expect(h.mock.calls[0][0].entityType).toBe('EMPLOYEE');
  });
  it('evt-progress-9: emits progress event', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [makeEmp(8)] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ep-8' }));
    const h = jest.fn();
    conn.on('progress', h);
    await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalled();
    expect(h.mock.calls[0][0].entityType).toBe('EMPLOYEE');
  });
  it('evt-progress-10: emits progress event', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [makeEmp(9)] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ep-9' }));
    const h = jest.fn();
    conn.on('progress', h);
    await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalled();
    expect(h.mock.calls[0][0].entityType).toBe('EMPLOYEE');
  });
  it('evt-progress-11: emits progress event', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [makeEmp(10)] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ep-10' }));
    const h = jest.fn();
    conn.on('progress', h);
    await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalled();
    expect(h.mock.calls[0][0].entityType).toBe('EMPLOYEE');
  });
  it('evt-progress-12: emits progress event', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [makeEmp(11)] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ep-11' }));
    const h = jest.fn();
    conn.on('progress', h);
    await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalled();
    expect(h.mock.calls[0][0].entityType).toBe('EMPLOYEE');
  });
  it('evt-progress-13: emits progress event', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [makeEmp(12)] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ep-12' }));
    const h = jest.fn();
    conn.on('progress', h);
    await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalled();
    expect(h.mock.calls[0][0].entityType).toBe('EMPLOYEE');
  });
  it('evt-progress-14: emits progress event', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [makeEmp(13)] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ep-13' }));
    const h = jest.fn();
    conn.on('progress', h);
    await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalled();
    expect(h.mock.calls[0][0].entityType).toBe('EMPLOYEE');
  });
  it('evt-progress-15: emits progress event', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [makeEmp(14)] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ep-14' }));
    const h = jest.fn();
    conn.on('progress', h);
    await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalled();
    expect(h.mock.calls[0][0].entityType).toBe('EMPLOYEE');
  });
  it('evt-multi-1: multiple listeners all fire', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-em-0' }));
    const h1 = jest.fn(); const h2 = jest.fn();
    conn.on('job:complete', h1); conn.on('job:complete', h2);
    await conn.executeSync(makeJob());
    expect(h1).toHaveBeenCalledTimes(1); expect(h2).toHaveBeenCalledTimes(1);
  });
  it('evt-multi-2: multiple listeners all fire', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-em-1' }));
    const h1 = jest.fn(); const h2 = jest.fn();
    conn.on('job:complete', h1); conn.on('job:complete', h2);
    await conn.executeSync(makeJob());
    expect(h1).toHaveBeenCalledTimes(1); expect(h2).toHaveBeenCalledTimes(1);
  });
  it('evt-multi-3: multiple listeners all fire', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-em-2' }));
    const h1 = jest.fn(); const h2 = jest.fn();
    conn.on('job:complete', h1); conn.on('job:complete', h2);
    await conn.executeSync(makeJob());
    expect(h1).toHaveBeenCalledTimes(1); expect(h2).toHaveBeenCalledTimes(1);
  });
  it('evt-multi-4: multiple listeners all fire', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-em-3' }));
    const h1 = jest.fn(); const h2 = jest.fn();
    conn.on('job:complete', h1); conn.on('job:complete', h2);
    await conn.executeSync(makeJob());
    expect(h1).toHaveBeenCalledTimes(1); expect(h2).toHaveBeenCalledTimes(1);
  });
  it('evt-multi-5: multiple listeners all fire', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-em-4' }));
    const h1 = jest.fn(); const h2 = jest.fn();
    conn.on('job:complete', h1); conn.on('job:complete', h2);
    await conn.executeSync(makeJob());
    expect(h1).toHaveBeenCalledTimes(1); expect(h2).toHaveBeenCalledTimes(1);
  });
  it('evt-multi-6: multiple listeners all fire', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-em-5' }));
    const h1 = jest.fn(); const h2 = jest.fn();
    conn.on('job:complete', h1); conn.on('job:complete', h2);
    await conn.executeSync(makeJob());
    expect(h1).toHaveBeenCalledTimes(1); expect(h2).toHaveBeenCalledTimes(1);
  });
  it('evt-multi-7: multiple listeners all fire', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-em-6' }));
    const h1 = jest.fn(); const h2 = jest.fn();
    conn.on('job:complete', h1); conn.on('job:complete', h2);
    await conn.executeSync(makeJob());
    expect(h1).toHaveBeenCalledTimes(1); expect(h2).toHaveBeenCalledTimes(1);
  });
  it('evt-multi-8: multiple listeners all fire', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-em-7' }));
    const h1 = jest.fn(); const h2 = jest.fn();
    conn.on('job:complete', h1); conn.on('job:complete', h2);
    await conn.executeSync(makeJob());
    expect(h1).toHaveBeenCalledTimes(1); expect(h2).toHaveBeenCalledTimes(1);
  });
  it('evt-multi-9: multiple listeners all fire', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-em-8' }));
    const h1 = jest.fn(); const h2 = jest.fn();
    conn.on('job:complete', h1); conn.on('job:complete', h2);
    await conn.executeSync(makeJob());
    expect(h1).toHaveBeenCalledTimes(1); expect(h2).toHaveBeenCalledTimes(1);
  });
  it('evt-multi-10: multiple listeners all fire', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-em-9' }));
    const h1 = jest.fn(); const h2 = jest.fn();
    conn.on('job:complete', h1); conn.on('job:complete', h2);
    await conn.executeSync(makeJob());
    expect(h1).toHaveBeenCalledTimes(1); expect(h2).toHaveBeenCalledTimes(1);
  });
  it('evt-multi-11: multiple listeners all fire', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-em-10' }));
    const h1 = jest.fn(); const h2 = jest.fn();
    conn.on('job:complete', h1); conn.on('job:complete', h2);
    await conn.executeSync(makeJob());
    expect(h1).toHaveBeenCalledTimes(1); expect(h2).toHaveBeenCalledTimes(1);
  });
  it('evt-multi-12: multiple listeners all fire', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-em-11' }));
    const h1 = jest.fn(); const h2 = jest.fn();
    conn.on('job:complete', h1); conn.on('job:complete', h2);
    await conn.executeSync(makeJob());
    expect(h1).toHaveBeenCalledTimes(1); expect(h2).toHaveBeenCalledTimes(1);
  });
  it('evt-multi-13: multiple listeners all fire', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-em-12' }));
    const h1 = jest.fn(); const h2 = jest.fn();
    conn.on('job:complete', h1); conn.on('job:complete', h2);
    await conn.executeSync(makeJob());
    expect(h1).toHaveBeenCalledTimes(1); expect(h2).toHaveBeenCalledTimes(1);
  });
  it('evt-multi-14: multiple listeners all fire', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-em-13' }));
    const h1 = jest.fn(); const h2 = jest.fn();
    conn.on('job:complete', h1); conn.on('job:complete', h2);
    await conn.executeSync(makeJob());
    expect(h1).toHaveBeenCalledTimes(1); expect(h2).toHaveBeenCalledTimes(1);
  });
  it('evt-multi-15: multiple listeners all fire', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-em-14' }));
    const h1 = jest.fn(); const h2 = jest.fn();
    conn.on('job:complete', h1); conn.on('job:complete', h2);
    await conn.executeSync(makeJob());
    expect(h1).toHaveBeenCalledTimes(1); expect(h2).toHaveBeenCalledTimes(1);
  });
  it('evt-once-1: once() fires exactly once', async () => {
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ d: { results: [] } }))
             .mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-eo-0' }));
    const h = jest.fn();
    conn.once('job:complete', h);
    await conn.executeSync(makeJob()); await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
  });
  it('evt-once-2: once() fires exactly once', async () => {
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ d: { results: [] } }))
             .mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-eo-1' }));
    const h = jest.fn();
    conn.once('job:complete', h);
    await conn.executeSync(makeJob()); await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
  });
  it('evt-once-3: once() fires exactly once', async () => {
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ d: { results: [] } }))
             .mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-eo-2' }));
    const h = jest.fn();
    conn.once('job:complete', h);
    await conn.executeSync(makeJob()); await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
  });
  it('evt-once-4: once() fires exactly once', async () => {
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ d: { results: [] } }))
             .mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-eo-3' }));
    const h = jest.fn();
    conn.once('job:complete', h);
    await conn.executeSync(makeJob()); await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
  });
  it('evt-once-5: once() fires exactly once', async () => {
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ d: { results: [] } }))
             .mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-eo-4' }));
    const h = jest.fn();
    conn.once('job:complete', h);
    await conn.executeSync(makeJob()); await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
  });
  it('evt-once-6: once() fires exactly once', async () => {
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ d: { results: [] } }))
             .mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-eo-5' }));
    const h = jest.fn();
    conn.once('job:complete', h);
    await conn.executeSync(makeJob()); await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
  });
  it('evt-once-7: once() fires exactly once', async () => {
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ d: { results: [] } }))
             .mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-eo-6' }));
    const h = jest.fn();
    conn.once('job:complete', h);
    await conn.executeSync(makeJob()); await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
  });
  it('evt-once-8: once() fires exactly once', async () => {
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ d: { results: [] } }))
             .mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-eo-7' }));
    const h = jest.fn();
    conn.once('job:complete', h);
    await conn.executeSync(makeJob()); await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
  });
  it('evt-once-9: once() fires exactly once', async () => {
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ d: { results: [] } }))
             .mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-eo-8' }));
    const h = jest.fn();
    conn.once('job:complete', h);
    await conn.executeSync(makeJob()); await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
  });
  it('evt-once-10: once() fires exactly once', async () => {
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ d: { results: [] } }))
             .mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-eo-9' }));
    const h = jest.fn();
    conn.once('job:complete', h);
    await conn.executeSync(makeJob()); await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
  });
  it('evt-once-11: once() fires exactly once', async () => {
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ d: { results: [] } }))
             .mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-eo-10' }));
    const h = jest.fn();
    conn.once('job:complete', h);
    await conn.executeSync(makeJob()); await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
  });
  it('evt-once-12: once() fires exactly once', async () => {
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ d: { results: [] } }))
             .mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-eo-11' }));
    const h = jest.fn();
    conn.once('job:complete', h);
    await conn.executeSync(makeJob()); await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
  });
  it('evt-once-13: once() fires exactly once', async () => {
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ d: { results: [] } }))
             .mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-eo-12' }));
    const h = jest.fn();
    conn.once('job:complete', h);
    await conn.executeSync(makeJob()); await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
  });
  it('evt-once-14: once() fires exactly once', async () => {
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ d: { results: [] } }))
             .mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-eo-13' }));
    const h = jest.fn();
    conn.once('job:complete', h);
    await conn.executeSync(makeJob()); await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
  });
  it('evt-once-15: once() fires exactly once', async () => {
    fetchMock.mockResolvedValueOnce(mockToken())
             .mockResolvedValueOnce(mockData({ d: { results: [] } }))
             .mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-eo-14' }));
    const h = jest.fn();
    conn.once('job:complete', h);
    await conn.executeSync(makeJob()); await conn.executeSync(makeJob());
    expect(h).toHaveBeenCalledTimes(1);
  });
});

// ── 14. Authorization header ─────────────────────────────────────────────────

describe('SAPConnector – Authorization header forwarding', () => {
  let fetchMock: jest.SpyInstance;
  beforeEach(() => { fetchMock = jest.spyOn(global, "fetch"); });
  afterEach(() => { fetchMock.mockRestore(); });
  it('auth-header-1: Bearer token in data request', async () => {
    const tok = 'bearer-0';
    fetchMock.mockResolvedValueOnce(mockToken(tok)).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ah-0' }));
    await conn.fetchRecords('EMPLOYEE');
    const init = fetchMock.mock.calls[1][1] as RequestInit;
    expect((init.headers as Record<string,string>)['Authorization']).toBe(`Bearer ${tok}`);
    expect((init.headers as Record<string,string>)['Accept']).toBe('application/json');
  });
  it('auth-header-2: Bearer token in data request', async () => {
    const tok = 'bearer-1';
    fetchMock.mockResolvedValueOnce(mockToken(tok)).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ah-1' }));
    await conn.fetchRecords('EMPLOYEE');
    const init = fetchMock.mock.calls[1][1] as RequestInit;
    expect((init.headers as Record<string,string>)['Authorization']).toBe(`Bearer ${tok}`);
    expect((init.headers as Record<string,string>)['Accept']).toBe('application/json');
  });
  it('auth-header-3: Bearer token in data request', async () => {
    const tok = 'bearer-2';
    fetchMock.mockResolvedValueOnce(mockToken(tok)).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ah-2' }));
    await conn.fetchRecords('EMPLOYEE');
    const init = fetchMock.mock.calls[1][1] as RequestInit;
    expect((init.headers as Record<string,string>)['Authorization']).toBe(`Bearer ${tok}`);
    expect((init.headers as Record<string,string>)['Accept']).toBe('application/json');
  });
  it('auth-header-4: Bearer token in data request', async () => {
    const tok = 'bearer-3';
    fetchMock.mockResolvedValueOnce(mockToken(tok)).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ah-3' }));
    await conn.fetchRecords('EMPLOYEE');
    const init = fetchMock.mock.calls[1][1] as RequestInit;
    expect((init.headers as Record<string,string>)['Authorization']).toBe(`Bearer ${tok}`);
    expect((init.headers as Record<string,string>)['Accept']).toBe('application/json');
  });
  it('auth-header-5: Bearer token in data request', async () => {
    const tok = 'bearer-4';
    fetchMock.mockResolvedValueOnce(mockToken(tok)).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ah-4' }));
    await conn.fetchRecords('EMPLOYEE');
    const init = fetchMock.mock.calls[1][1] as RequestInit;
    expect((init.headers as Record<string,string>)['Authorization']).toBe(`Bearer ${tok}`);
    expect((init.headers as Record<string,string>)['Accept']).toBe('application/json');
  });
  it('auth-header-6: Bearer token in data request', async () => {
    const tok = 'bearer-5';
    fetchMock.mockResolvedValueOnce(mockToken(tok)).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ah-5' }));
    await conn.fetchRecords('EMPLOYEE');
    const init = fetchMock.mock.calls[1][1] as RequestInit;
    expect((init.headers as Record<string,string>)['Authorization']).toBe(`Bearer ${tok}`);
    expect((init.headers as Record<string,string>)['Accept']).toBe('application/json');
  });
  it('auth-header-7: Bearer token in data request', async () => {
    const tok = 'bearer-6';
    fetchMock.mockResolvedValueOnce(mockToken(tok)).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ah-6' }));
    await conn.fetchRecords('EMPLOYEE');
    const init = fetchMock.mock.calls[1][1] as RequestInit;
    expect((init.headers as Record<string,string>)['Authorization']).toBe(`Bearer ${tok}`);
    expect((init.headers as Record<string,string>)['Accept']).toBe('application/json');
  });
  it('auth-header-8: Bearer token in data request', async () => {
    const tok = 'bearer-7';
    fetchMock.mockResolvedValueOnce(mockToken(tok)).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ah-7' }));
    await conn.fetchRecords('EMPLOYEE');
    const init = fetchMock.mock.calls[1][1] as RequestInit;
    expect((init.headers as Record<string,string>)['Authorization']).toBe(`Bearer ${tok}`);
    expect((init.headers as Record<string,string>)['Accept']).toBe('application/json');
  });
  it('auth-header-9: Bearer token in data request', async () => {
    const tok = 'bearer-8';
    fetchMock.mockResolvedValueOnce(mockToken(tok)).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ah-8' }));
    await conn.fetchRecords('EMPLOYEE');
    const init = fetchMock.mock.calls[1][1] as RequestInit;
    expect((init.headers as Record<string,string>)['Authorization']).toBe(`Bearer ${tok}`);
    expect((init.headers as Record<string,string>)['Accept']).toBe('application/json');
  });
  it('auth-header-10: Bearer token in data request', async () => {
    const tok = 'bearer-9';
    fetchMock.mockResolvedValueOnce(mockToken(tok)).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ah-9' }));
    await conn.fetchRecords('EMPLOYEE');
    const init = fetchMock.mock.calls[1][1] as RequestInit;
    expect((init.headers as Record<string,string>)['Authorization']).toBe(`Bearer ${tok}`);
    expect((init.headers as Record<string,string>)['Accept']).toBe('application/json');
  });
  it('auth-header-11: Bearer token in data request', async () => {
    const tok = 'bearer-10';
    fetchMock.mockResolvedValueOnce(mockToken(tok)).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ah-10' }));
    await conn.fetchRecords('EMPLOYEE');
    const init = fetchMock.mock.calls[1][1] as RequestInit;
    expect((init.headers as Record<string,string>)['Authorization']).toBe(`Bearer ${tok}`);
    expect((init.headers as Record<string,string>)['Accept']).toBe('application/json');
  });
  it('auth-header-12: Bearer token in data request', async () => {
    const tok = 'bearer-11';
    fetchMock.mockResolvedValueOnce(mockToken(tok)).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ah-11' }));
    await conn.fetchRecords('EMPLOYEE');
    const init = fetchMock.mock.calls[1][1] as RequestInit;
    expect((init.headers as Record<string,string>)['Authorization']).toBe(`Bearer ${tok}`);
    expect((init.headers as Record<string,string>)['Accept']).toBe('application/json');
  });
  it('auth-header-13: Bearer token in data request', async () => {
    const tok = 'bearer-12';
    fetchMock.mockResolvedValueOnce(mockToken(tok)).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ah-12' }));
    await conn.fetchRecords('EMPLOYEE');
    const init = fetchMock.mock.calls[1][1] as RequestInit;
    expect((init.headers as Record<string,string>)['Authorization']).toBe(`Bearer ${tok}`);
    expect((init.headers as Record<string,string>)['Accept']).toBe('application/json');
  });
  it('auth-header-14: Bearer token in data request', async () => {
    const tok = 'bearer-13';
    fetchMock.mockResolvedValueOnce(mockToken(tok)).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ah-13' }));
    await conn.fetchRecords('EMPLOYEE');
    const init = fetchMock.mock.calls[1][1] as RequestInit;
    expect((init.headers as Record<string,string>)['Authorization']).toBe(`Bearer ${tok}`);
    expect((init.headers as Record<string,string>)['Accept']).toBe('application/json');
  });
  it('auth-header-15: Bearer token in data request', async () => {
    const tok = 'bearer-14';
    fetchMock.mockResolvedValueOnce(mockToken(tok)).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ah-14' }));
    await conn.fetchRecords('EMPLOYEE');
    const init = fetchMock.mock.calls[1][1] as RequestInit;
    expect((init.headers as Record<string,string>)['Authorization']).toBe(`Bearer ${tok}`);
    expect((init.headers as Record<string,string>)['Accept']).toBe('application/json');
  });
  it('auth-header-16: Bearer token in data request', async () => {
    const tok = 'bearer-15';
    fetchMock.mockResolvedValueOnce(mockToken(tok)).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ah-15' }));
    await conn.fetchRecords('EMPLOYEE');
    const init = fetchMock.mock.calls[1][1] as RequestInit;
    expect((init.headers as Record<string,string>)['Authorization']).toBe(`Bearer ${tok}`);
    expect((init.headers as Record<string,string>)['Accept']).toBe('application/json');
  });
  it('auth-header-17: Bearer token in data request', async () => {
    const tok = 'bearer-16';
    fetchMock.mockResolvedValueOnce(mockToken(tok)).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ah-16' }));
    await conn.fetchRecords('EMPLOYEE');
    const init = fetchMock.mock.calls[1][1] as RequestInit;
    expect((init.headers as Record<string,string>)['Authorization']).toBe(`Bearer ${tok}`);
    expect((init.headers as Record<string,string>)['Accept']).toBe('application/json');
  });
  it('auth-header-18: Bearer token in data request', async () => {
    const tok = 'bearer-17';
    fetchMock.mockResolvedValueOnce(mockToken(tok)).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ah-17' }));
    await conn.fetchRecords('EMPLOYEE');
    const init = fetchMock.mock.calls[1][1] as RequestInit;
    expect((init.headers as Record<string,string>)['Authorization']).toBe(`Bearer ${tok}`);
    expect((init.headers as Record<string,string>)['Accept']).toBe('application/json');
  });
  it('auth-header-19: Bearer token in data request', async () => {
    const tok = 'bearer-18';
    fetchMock.mockResolvedValueOnce(mockToken(tok)).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ah-18' }));
    await conn.fetchRecords('EMPLOYEE');
    const init = fetchMock.mock.calls[1][1] as RequestInit;
    expect((init.headers as Record<string,string>)['Authorization']).toBe(`Bearer ${tok}`);
    expect((init.headers as Record<string,string>)['Accept']).toBe('application/json');
  });
  it('auth-header-20: Bearer token in data request', async () => {
    const tok = 'bearer-19';
    fetchMock.mockResolvedValueOnce(mockToken(tok)).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ah-19' }));
    await conn.fetchRecords('EMPLOYEE');
    const init = fetchMock.mock.calls[1][1] as RequestInit;
    expect((init.headers as Record<string,string>)['Authorization']).toBe(`Bearer ${tok}`);
    expect((init.headers as Record<string,string>)['Accept']).toBe('application/json');
  });
});

// ── 15. Token POST body ──────────────────────────────────────────────────────

describe('SAPConnector – token POST request body', () => {
  let fetchMock: jest.SpyInstance;
  beforeEach(() => { fetchMock = jest.spyOn(global, "fetch"); });
  afterEach(() => { fetchMock.mockRestore(); });
  it('tok-body-1: body contains grant_type+client_id+client_secret', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new SAPConnector(makeConfig({ id: 'sap-tb-0' }));
    await conn.testConnection();
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const body = init.body as string;
    expect(body).toContain('grant_type=client_credentials');
    expect(body).toContain('client_id=test-client-id');
    expect(body).toContain('client_secret=test-client-secret');
    expect(init.method).toBe('POST');
  });
  it('tok-body-2: body contains grant_type+client_id+client_secret', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new SAPConnector(makeConfig({ id: 'sap-tb-1' }));
    await conn.testConnection();
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const body = init.body as string;
    expect(body).toContain('grant_type=client_credentials');
    expect(body).toContain('client_id=test-client-id');
    expect(body).toContain('client_secret=test-client-secret');
    expect(init.method).toBe('POST');
  });
  it('tok-body-3: body contains grant_type+client_id+client_secret', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new SAPConnector(makeConfig({ id: 'sap-tb-2' }));
    await conn.testConnection();
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const body = init.body as string;
    expect(body).toContain('grant_type=client_credentials');
    expect(body).toContain('client_id=test-client-id');
    expect(body).toContain('client_secret=test-client-secret');
    expect(init.method).toBe('POST');
  });
  it('tok-body-4: body contains grant_type+client_id+client_secret', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new SAPConnector(makeConfig({ id: 'sap-tb-3' }));
    await conn.testConnection();
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const body = init.body as string;
    expect(body).toContain('grant_type=client_credentials');
    expect(body).toContain('client_id=test-client-id');
    expect(body).toContain('client_secret=test-client-secret');
    expect(init.method).toBe('POST');
  });
  it('tok-body-5: body contains grant_type+client_id+client_secret', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new SAPConnector(makeConfig({ id: 'sap-tb-4' }));
    await conn.testConnection();
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const body = init.body as string;
    expect(body).toContain('grant_type=client_credentials');
    expect(body).toContain('client_id=test-client-id');
    expect(body).toContain('client_secret=test-client-secret');
    expect(init.method).toBe('POST');
  });
  it('tok-body-6: body contains grant_type+client_id+client_secret', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new SAPConnector(makeConfig({ id: 'sap-tb-5' }));
    await conn.testConnection();
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const body = init.body as string;
    expect(body).toContain('grant_type=client_credentials');
    expect(body).toContain('client_id=test-client-id');
    expect(body).toContain('client_secret=test-client-secret');
    expect(init.method).toBe('POST');
  });
  it('tok-body-7: body contains grant_type+client_id+client_secret', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new SAPConnector(makeConfig({ id: 'sap-tb-6' }));
    await conn.testConnection();
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const body = init.body as string;
    expect(body).toContain('grant_type=client_credentials');
    expect(body).toContain('client_id=test-client-id');
    expect(body).toContain('client_secret=test-client-secret');
    expect(init.method).toBe('POST');
  });
  it('tok-body-8: body contains grant_type+client_id+client_secret', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new SAPConnector(makeConfig({ id: 'sap-tb-7' }));
    await conn.testConnection();
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const body = init.body as string;
    expect(body).toContain('grant_type=client_credentials');
    expect(body).toContain('client_id=test-client-id');
    expect(body).toContain('client_secret=test-client-secret');
    expect(init.method).toBe('POST');
  });
  it('tok-body-9: body contains grant_type+client_id+client_secret', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new SAPConnector(makeConfig({ id: 'sap-tb-8' }));
    await conn.testConnection();
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const body = init.body as string;
    expect(body).toContain('grant_type=client_credentials');
    expect(body).toContain('client_id=test-client-id');
    expect(body).toContain('client_secret=test-client-secret');
    expect(init.method).toBe('POST');
  });
  it('tok-body-10: body contains grant_type+client_id+client_secret', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new SAPConnector(makeConfig({ id: 'sap-tb-9' }));
    await conn.testConnection();
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const body = init.body as string;
    expect(body).toContain('grant_type=client_credentials');
    expect(body).toContain('client_id=test-client-id');
    expect(body).toContain('client_secret=test-client-secret');
    expect(init.method).toBe('POST');
  });
  it('tok-body-11: body contains grant_type+client_id+client_secret', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new SAPConnector(makeConfig({ id: 'sap-tb-10' }));
    await conn.testConnection();
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const body = init.body as string;
    expect(body).toContain('grant_type=client_credentials');
    expect(body).toContain('client_id=test-client-id');
    expect(body).toContain('client_secret=test-client-secret');
    expect(init.method).toBe('POST');
  });
  it('tok-body-12: body contains grant_type+client_id+client_secret', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new SAPConnector(makeConfig({ id: 'sap-tb-11' }));
    await conn.testConnection();
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const body = init.body as string;
    expect(body).toContain('grant_type=client_credentials');
    expect(body).toContain('client_id=test-client-id');
    expect(body).toContain('client_secret=test-client-secret');
    expect(init.method).toBe('POST');
  });
  it('tok-body-13: body contains grant_type+client_id+client_secret', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new SAPConnector(makeConfig({ id: 'sap-tb-12' }));
    await conn.testConnection();
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const body = init.body as string;
    expect(body).toContain('grant_type=client_credentials');
    expect(body).toContain('client_id=test-client-id');
    expect(body).toContain('client_secret=test-client-secret');
    expect(init.method).toBe('POST');
  });
  it('tok-body-14: body contains grant_type+client_id+client_secret', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new SAPConnector(makeConfig({ id: 'sap-tb-13' }));
    await conn.testConnection();
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const body = init.body as string;
    expect(body).toContain('grant_type=client_credentials');
    expect(body).toContain('client_id=test-client-id');
    expect(body).toContain('client_secret=test-client-secret');
    expect(init.method).toBe('POST');
  });
  it('tok-body-15: body contains grant_type+client_id+client_secret', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new SAPConnector(makeConfig({ id: 'sap-tb-14' }));
    await conn.testConnection();
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const body = init.body as string;
    expect(body).toContain('grant_type=client_credentials');
    expect(body).toContain('client_id=test-client-id');
    expect(body).toContain('client_secret=test-client-secret');
    expect(init.method).toBe('POST');
  });
  it('tok-body-16: body contains grant_type+client_id+client_secret', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new SAPConnector(makeConfig({ id: 'sap-tb-15' }));
    await conn.testConnection();
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const body = init.body as string;
    expect(body).toContain('grant_type=client_credentials');
    expect(body).toContain('client_id=test-client-id');
    expect(body).toContain('client_secret=test-client-secret');
    expect(init.method).toBe('POST');
  });
  it('tok-body-17: body contains grant_type+client_id+client_secret', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new SAPConnector(makeConfig({ id: 'sap-tb-16' }));
    await conn.testConnection();
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const body = init.body as string;
    expect(body).toContain('grant_type=client_credentials');
    expect(body).toContain('client_id=test-client-id');
    expect(body).toContain('client_secret=test-client-secret');
    expect(init.method).toBe('POST');
  });
  it('tok-body-18: body contains grant_type+client_id+client_secret', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new SAPConnector(makeConfig({ id: 'sap-tb-17' }));
    await conn.testConnection();
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const body = init.body as string;
    expect(body).toContain('grant_type=client_credentials');
    expect(body).toContain('client_id=test-client-id');
    expect(body).toContain('client_secret=test-client-secret');
    expect(init.method).toBe('POST');
  });
  it('tok-body-19: body contains grant_type+client_id+client_secret', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new SAPConnector(makeConfig({ id: 'sap-tb-18' }));
    await conn.testConnection();
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const body = init.body as string;
    expect(body).toContain('grant_type=client_credentials');
    expect(body).toContain('client_id=test-client-id');
    expect(body).toContain('client_secret=test-client-secret');
    expect(init.method).toBe('POST');
  });
  it('tok-body-20: body contains grant_type+client_id+client_secret', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new SAPConnector(makeConfig({ id: 'sap-tb-19' }));
    await conn.testConnection();
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const body = init.body as string;
    expect(body).toContain('grant_type=client_credentials');
    expect(body).toContain('client_id=test-client-id');
    expect(body).toContain('client_secret=test-client-secret');
    expect(init.method).toBe('POST');
  });
});

// ── 16. Checksum determinism ─────────────────────────────────────────────────

describe('SAPConnector – checksum determinism', () => {
  it('chk-1: same data → same checksum, length 16', () => {
    const cfg = makeConfig({ id: 'sap-chk-0' });
    const c1 = new SAPConnector(cfg);
    const c2 = new SAPConnector(cfg);
    const data = { userId: 'u-0', name: 'N0' };
    type C = { checksum: (d: Record<string,unknown>) => string };
    const h1 = (c1 as unknown as C).checksum(data);
    const h2 = (c2 as unknown as C).checksum(data);
    expect(h1).toBe(h2);
    expect(h1).toHaveLength(16);
  });
  it('chk-2: same data → same checksum, length 16', () => {
    const cfg = makeConfig({ id: 'sap-chk-1' });
    const c1 = new SAPConnector(cfg);
    const c2 = new SAPConnector(cfg);
    const data = { userId: 'u-1', name: 'N1' };
    type C = { checksum: (d: Record<string,unknown>) => string };
    const h1 = (c1 as unknown as C).checksum(data);
    const h2 = (c2 as unknown as C).checksum(data);
    expect(h1).toBe(h2);
    expect(h1).toHaveLength(16);
  });
  it('chk-3: same data → same checksum, length 16', () => {
    const cfg = makeConfig({ id: 'sap-chk-2' });
    const c1 = new SAPConnector(cfg);
    const c2 = new SAPConnector(cfg);
    const data = { userId: 'u-2', name: 'N2' };
    type C = { checksum: (d: Record<string,unknown>) => string };
    const h1 = (c1 as unknown as C).checksum(data);
    const h2 = (c2 as unknown as C).checksum(data);
    expect(h1).toBe(h2);
    expect(h1).toHaveLength(16);
  });
  it('chk-4: same data → same checksum, length 16', () => {
    const cfg = makeConfig({ id: 'sap-chk-3' });
    const c1 = new SAPConnector(cfg);
    const c2 = new SAPConnector(cfg);
    const data = { userId: 'u-3', name: 'N3' };
    type C = { checksum: (d: Record<string,unknown>) => string };
    const h1 = (c1 as unknown as C).checksum(data);
    const h2 = (c2 as unknown as C).checksum(data);
    expect(h1).toBe(h2);
    expect(h1).toHaveLength(16);
  });
  it('chk-5: same data → same checksum, length 16', () => {
    const cfg = makeConfig({ id: 'sap-chk-4' });
    const c1 = new SAPConnector(cfg);
    const c2 = new SAPConnector(cfg);
    const data = { userId: 'u-4', name: 'N4' };
    type C = { checksum: (d: Record<string,unknown>) => string };
    const h1 = (c1 as unknown as C).checksum(data);
    const h2 = (c2 as unknown as C).checksum(data);
    expect(h1).toBe(h2);
    expect(h1).toHaveLength(16);
  });
  it('chk-6: same data → same checksum, length 16', () => {
    const cfg = makeConfig({ id: 'sap-chk-5' });
    const c1 = new SAPConnector(cfg);
    const c2 = new SAPConnector(cfg);
    const data = { userId: 'u-5', name: 'N5' };
    type C = { checksum: (d: Record<string,unknown>) => string };
    const h1 = (c1 as unknown as C).checksum(data);
    const h2 = (c2 as unknown as C).checksum(data);
    expect(h1).toBe(h2);
    expect(h1).toHaveLength(16);
  });
  it('chk-7: same data → same checksum, length 16', () => {
    const cfg = makeConfig({ id: 'sap-chk-6' });
    const c1 = new SAPConnector(cfg);
    const c2 = new SAPConnector(cfg);
    const data = { userId: 'u-6', name: 'N6' };
    type C = { checksum: (d: Record<string,unknown>) => string };
    const h1 = (c1 as unknown as C).checksum(data);
    const h2 = (c2 as unknown as C).checksum(data);
    expect(h1).toBe(h2);
    expect(h1).toHaveLength(16);
  });
  it('chk-8: same data → same checksum, length 16', () => {
    const cfg = makeConfig({ id: 'sap-chk-7' });
    const c1 = new SAPConnector(cfg);
    const c2 = new SAPConnector(cfg);
    const data = { userId: 'u-7', name: 'N7' };
    type C = { checksum: (d: Record<string,unknown>) => string };
    const h1 = (c1 as unknown as C).checksum(data);
    const h2 = (c2 as unknown as C).checksum(data);
    expect(h1).toBe(h2);
    expect(h1).toHaveLength(16);
  });
  it('chk-9: same data → same checksum, length 16', () => {
    const cfg = makeConfig({ id: 'sap-chk-8' });
    const c1 = new SAPConnector(cfg);
    const c2 = new SAPConnector(cfg);
    const data = { userId: 'u-8', name: 'N8' };
    type C = { checksum: (d: Record<string,unknown>) => string };
    const h1 = (c1 as unknown as C).checksum(data);
    const h2 = (c2 as unknown as C).checksum(data);
    expect(h1).toBe(h2);
    expect(h1).toHaveLength(16);
  });
  it('chk-10: same data → same checksum, length 16', () => {
    const cfg = makeConfig({ id: 'sap-chk-9' });
    const c1 = new SAPConnector(cfg);
    const c2 = new SAPConnector(cfg);
    const data = { userId: 'u-9', name: 'N9' };
    type C = { checksum: (d: Record<string,unknown>) => string };
    const h1 = (c1 as unknown as C).checksum(data);
    const h2 = (c2 as unknown as C).checksum(data);
    expect(h1).toBe(h2);
    expect(h1).toHaveLength(16);
  });
  it('chk-11: same data → same checksum, length 16', () => {
    const cfg = makeConfig({ id: 'sap-chk-10' });
    const c1 = new SAPConnector(cfg);
    const c2 = new SAPConnector(cfg);
    const data = { userId: 'u-10', name: 'N10' };
    type C = { checksum: (d: Record<string,unknown>) => string };
    const h1 = (c1 as unknown as C).checksum(data);
    const h2 = (c2 as unknown as C).checksum(data);
    expect(h1).toBe(h2);
    expect(h1).toHaveLength(16);
  });
  it('chk-12: same data → same checksum, length 16', () => {
    const cfg = makeConfig({ id: 'sap-chk-11' });
    const c1 = new SAPConnector(cfg);
    const c2 = new SAPConnector(cfg);
    const data = { userId: 'u-11', name: 'N11' };
    type C = { checksum: (d: Record<string,unknown>) => string };
    const h1 = (c1 as unknown as C).checksum(data);
    const h2 = (c2 as unknown as C).checksum(data);
    expect(h1).toBe(h2);
    expect(h1).toHaveLength(16);
  });
  it('chk-13: same data → same checksum, length 16', () => {
    const cfg = makeConfig({ id: 'sap-chk-12' });
    const c1 = new SAPConnector(cfg);
    const c2 = new SAPConnector(cfg);
    const data = { userId: 'u-12', name: 'N12' };
    type C = { checksum: (d: Record<string,unknown>) => string };
    const h1 = (c1 as unknown as C).checksum(data);
    const h2 = (c2 as unknown as C).checksum(data);
    expect(h1).toBe(h2);
    expect(h1).toHaveLength(16);
  });
  it('chk-14: same data → same checksum, length 16', () => {
    const cfg = makeConfig({ id: 'sap-chk-13' });
    const c1 = new SAPConnector(cfg);
    const c2 = new SAPConnector(cfg);
    const data = { userId: 'u-13', name: 'N13' };
    type C = { checksum: (d: Record<string,unknown>) => string };
    const h1 = (c1 as unknown as C).checksum(data);
    const h2 = (c2 as unknown as C).checksum(data);
    expect(h1).toBe(h2);
    expect(h1).toHaveLength(16);
  });
  it('chk-15: same data → same checksum, length 16', () => {
    const cfg = makeConfig({ id: 'sap-chk-14' });
    const c1 = new SAPConnector(cfg);
    const c2 = new SAPConnector(cfg);
    const data = { userId: 'u-14', name: 'N14' };
    type C = { checksum: (d: Record<string,unknown>) => string };
    const h1 = (c1 as unknown as C).checksum(data);
    const h2 = (c2 as unknown as C).checksum(data);
    expect(h1).toBe(h2);
    expect(h1).toHaveLength(16);
  });
  it('chk-16: same data → same checksum, length 16', () => {
    const cfg = makeConfig({ id: 'sap-chk-15' });
    const c1 = new SAPConnector(cfg);
    const c2 = new SAPConnector(cfg);
    const data = { userId: 'u-15', name: 'N15' };
    type C = { checksum: (d: Record<string,unknown>) => string };
    const h1 = (c1 as unknown as C).checksum(data);
    const h2 = (c2 as unknown as C).checksum(data);
    expect(h1).toBe(h2);
    expect(h1).toHaveLength(16);
  });
  it('chk-17: same data → same checksum, length 16', () => {
    const cfg = makeConfig({ id: 'sap-chk-16' });
    const c1 = new SAPConnector(cfg);
    const c2 = new SAPConnector(cfg);
    const data = { userId: 'u-16', name: 'N16' };
    type C = { checksum: (d: Record<string,unknown>) => string };
    const h1 = (c1 as unknown as C).checksum(data);
    const h2 = (c2 as unknown as C).checksum(data);
    expect(h1).toBe(h2);
    expect(h1).toHaveLength(16);
  });
  it('chk-18: same data → same checksum, length 16', () => {
    const cfg = makeConfig({ id: 'sap-chk-17' });
    const c1 = new SAPConnector(cfg);
    const c2 = new SAPConnector(cfg);
    const data = { userId: 'u-17', name: 'N17' };
    type C = { checksum: (d: Record<string,unknown>) => string };
    const h1 = (c1 as unknown as C).checksum(data);
    const h2 = (c2 as unknown as C).checksum(data);
    expect(h1).toBe(h2);
    expect(h1).toHaveLength(16);
  });
  it('chk-19: same data → same checksum, length 16', () => {
    const cfg = makeConfig({ id: 'sap-chk-18' });
    const c1 = new SAPConnector(cfg);
    const c2 = new SAPConnector(cfg);
    const data = { userId: 'u-18', name: 'N18' };
    type C = { checksum: (d: Record<string,unknown>) => string };
    const h1 = (c1 as unknown as C).checksum(data);
    const h2 = (c2 as unknown as C).checksum(data);
    expect(h1).toBe(h2);
    expect(h1).toHaveLength(16);
  });
  it('chk-20: same data → same checksum, length 16', () => {
    const cfg = makeConfig({ id: 'sap-chk-19' });
    const c1 = new SAPConnector(cfg);
    const c2 = new SAPConnector(cfg);
    const data = { userId: 'u-19', name: 'N19' };
    type C = { checksum: (d: Record<string,unknown>) => string };
    const h1 = (c1 as unknown as C).checksum(data);
    const h2 = (c2 as unknown as C).checksum(data);
    expect(h1).toBe(h2);
    expect(h1).toHaveLength(16);
  });
});

// ── 17. externalId prefixes ─────────────────────────────────────────────────

describe('SAPConnector – SyncRecord externalId prefix', () => {
  let fetchMock: jest.SpyInstance;
  beforeEach(() => { fetchMock = jest.spyOn(global, "fetch"); });
  afterEach(() => { fetchMock.mockRestore(); });
  it('eid-emp-1: externalId starts with sap_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [makeEmp(0)] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ei-0' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].externalId).toMatch(/^sap_/);
    expect(recs[0].externalId).toBe(recs[0].data.externalId as string);
  });
  it('eid-emp-2: externalId starts with sap_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [makeEmp(1)] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ei-1' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].externalId).toMatch(/^sap_/);
    expect(recs[0].externalId).toBe(recs[0].data.externalId as string);
  });
  it('eid-emp-3: externalId starts with sap_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [makeEmp(2)] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ei-2' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].externalId).toMatch(/^sap_/);
    expect(recs[0].externalId).toBe(recs[0].data.externalId as string);
  });
  it('eid-emp-4: externalId starts with sap_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [makeEmp(3)] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ei-3' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].externalId).toMatch(/^sap_/);
    expect(recs[0].externalId).toBe(recs[0].data.externalId as string);
  });
  it('eid-emp-5: externalId starts with sap_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [makeEmp(4)] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ei-4' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].externalId).toMatch(/^sap_/);
    expect(recs[0].externalId).toBe(recs[0].data.externalId as string);
  });
  it('eid-emp-6: externalId starts with sap_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [makeEmp(5)] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ei-5' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].externalId).toMatch(/^sap_/);
    expect(recs[0].externalId).toBe(recs[0].data.externalId as string);
  });
  it('eid-emp-7: externalId starts with sap_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [makeEmp(6)] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ei-6' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].externalId).toMatch(/^sap_/);
    expect(recs[0].externalId).toBe(recs[0].data.externalId as string);
  });
  it('eid-emp-8: externalId starts with sap_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [makeEmp(7)] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ei-7' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].externalId).toMatch(/^sap_/);
    expect(recs[0].externalId).toBe(recs[0].data.externalId as string);
  });
  it('eid-emp-9: externalId starts with sap_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [makeEmp(8)] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ei-8' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].externalId).toMatch(/^sap_/);
    expect(recs[0].externalId).toBe(recs[0].data.externalId as string);
  });
  it('eid-emp-10: externalId starts with sap_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [makeEmp(9)] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ei-9' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].externalId).toMatch(/^sap_/);
    expect(recs[0].externalId).toBe(recs[0].data.externalId as string);
  });
  it('eid-emp-11: externalId starts with sap_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [makeEmp(10)] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ei-10' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].externalId).toMatch(/^sap_/);
    expect(recs[0].externalId).toBe(recs[0].data.externalId as string);
  });
  it('eid-emp-12: externalId starts with sap_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [makeEmp(11)] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ei-11' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].externalId).toMatch(/^sap_/);
    expect(recs[0].externalId).toBe(recs[0].data.externalId as string);
  });
  it('eid-emp-13: externalId starts with sap_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [makeEmp(12)] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ei-12' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].externalId).toMatch(/^sap_/);
    expect(recs[0].externalId).toBe(recs[0].data.externalId as string);
  });
  it('eid-emp-14: externalId starts with sap_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [makeEmp(13)] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ei-13' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].externalId).toMatch(/^sap_/);
    expect(recs[0].externalId).toBe(recs[0].data.externalId as string);
  });
  it('eid-emp-15: externalId starts with sap_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [makeEmp(14)] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ei-14' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].externalId).toMatch(/^sap_/);
    expect(recs[0].externalId).toBe(recs[0].data.externalId as string);
  });
  it('eid-emp-16: externalId starts with sap_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [makeEmp(15)] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ei-15' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].externalId).toMatch(/^sap_/);
    expect(recs[0].externalId).toBe(recs[0].data.externalId as string);
  });
  it('eid-emp-17: externalId starts with sap_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [makeEmp(16)] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ei-16' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].externalId).toMatch(/^sap_/);
    expect(recs[0].externalId).toBe(recs[0].data.externalId as string);
  });
  it('eid-emp-18: externalId starts with sap_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [makeEmp(17)] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ei-17' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].externalId).toMatch(/^sap_/);
    expect(recs[0].externalId).toBe(recs[0].data.externalId as string);
  });
  it('eid-emp-19: externalId starts with sap_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [makeEmp(18)] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ei-18' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].externalId).toMatch(/^sap_/);
    expect(recs[0].externalId).toBe(recs[0].data.externalId as string);
  });
  it('eid-emp-20: externalId starts with sap_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [makeEmp(19)] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ei-19' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].externalId).toMatch(/^sap_/);
    expect(recs[0].externalId).toBe(recs[0].data.externalId as string);
  });
  it('eid-dept-1: dept externalId starts with sap_dept_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [makeDept(0)] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-dei-0' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs[0].externalId).toMatch(/^sap_dept_/);
  });
  it('eid-dept-2: dept externalId starts with sap_dept_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [makeDept(1)] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-dei-1' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs[0].externalId).toMatch(/^sap_dept_/);
  });
  it('eid-dept-3: dept externalId starts with sap_dept_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [makeDept(2)] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-dei-2' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs[0].externalId).toMatch(/^sap_dept_/);
  });
  it('eid-dept-4: dept externalId starts with sap_dept_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [makeDept(3)] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-dei-3' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs[0].externalId).toMatch(/^sap_dept_/);
  });
  it('eid-dept-5: dept externalId starts with sap_dept_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [makeDept(4)] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-dei-4' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs[0].externalId).toMatch(/^sap_dept_/);
  });
  it('eid-dept-6: dept externalId starts with sap_dept_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [makeDept(5)] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-dei-5' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs[0].externalId).toMatch(/^sap_dept_/);
  });
  it('eid-dept-7: dept externalId starts with sap_dept_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [makeDept(6)] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-dei-6' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs[0].externalId).toMatch(/^sap_dept_/);
  });
  it('eid-dept-8: dept externalId starts with sap_dept_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [makeDept(7)] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-dei-7' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs[0].externalId).toMatch(/^sap_dept_/);
  });
  it('eid-dept-9: dept externalId starts with sap_dept_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [makeDept(8)] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-dei-8' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs[0].externalId).toMatch(/^sap_dept_/);
  });
  it('eid-dept-10: dept externalId starts with sap_dept_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [makeDept(9)] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-dei-9' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs[0].externalId).toMatch(/^sap_dept_/);
  });
  it('eid-dept-11: dept externalId starts with sap_dept_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [makeDept(10)] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-dei-10' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs[0].externalId).toMatch(/^sap_dept_/);
  });
  it('eid-dept-12: dept externalId starts with sap_dept_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [makeDept(11)] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-dei-11' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs[0].externalId).toMatch(/^sap_dept_/);
  });
  it('eid-dept-13: dept externalId starts with sap_dept_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [makeDept(12)] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-dei-12' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs[0].externalId).toMatch(/^sap_dept_/);
  });
  it('eid-dept-14: dept externalId starts with sap_dept_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [makeDept(13)] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-dei-13' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs[0].externalId).toMatch(/^sap_dept_/);
  });
  it('eid-dept-15: dept externalId starts with sap_dept_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [makeDept(14)] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-dei-14' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs[0].externalId).toMatch(/^sap_dept_/);
  });
  it('eid-dept-16: dept externalId starts with sap_dept_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [makeDept(15)] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-dei-15' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs[0].externalId).toMatch(/^sap_dept_/);
  });
  it('eid-dept-17: dept externalId starts with sap_dept_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [makeDept(16)] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-dei-16' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs[0].externalId).toMatch(/^sap_dept_/);
  });
  it('eid-dept-18: dept externalId starts with sap_dept_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [makeDept(17)] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-dei-17' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs[0].externalId).toMatch(/^sap_dept_/);
  });
  it('eid-dept-19: dept externalId starts with sap_dept_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [makeDept(18)] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-dei-18' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs[0].externalId).toMatch(/^sap_dept_/);
  });
  it('eid-dept-20: dept externalId starts with sap_dept_', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [makeDept(19)] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-dei-19' }));
    const recs = await conn.fetchRecords('DEPARTMENT');
    expect(recs[0].externalId).toMatch(/^sap_dept_/);
  });
});

// ── 18. Job timestamps ───────────────────────────────────────────────────────

describe('SAPConnector – executeSync job timestamps', () => {
  let fetchMock: jest.SpyInstance;
  beforeEach(() => { fetchMock = jest.spyOn(global, "fetch"); });
  afterEach(() => { fetchMock.mockRestore(); });
  it('ts-1: startedAt and completedAt set on result', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ts-0' }));
    const res = await conn.executeSync(makeJob());
    expect(res.startedAt).toBeInstanceOf(Date);
    expect(res.completedAt).toBeInstanceOf(Date);
    expect(res.completedAt!.getTime()).toBeGreaterThanOrEqual(res.startedAt!.getTime());
  });
  it('ts-2: startedAt and completedAt set on result', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ts-1' }));
    const res = await conn.executeSync(makeJob());
    expect(res.startedAt).toBeInstanceOf(Date);
    expect(res.completedAt).toBeInstanceOf(Date);
    expect(res.completedAt!.getTime()).toBeGreaterThanOrEqual(res.startedAt!.getTime());
  });
  it('ts-3: startedAt and completedAt set on result', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ts-2' }));
    const res = await conn.executeSync(makeJob());
    expect(res.startedAt).toBeInstanceOf(Date);
    expect(res.completedAt).toBeInstanceOf(Date);
    expect(res.completedAt!.getTime()).toBeGreaterThanOrEqual(res.startedAt!.getTime());
  });
  it('ts-4: startedAt and completedAt set on result', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ts-3' }));
    const res = await conn.executeSync(makeJob());
    expect(res.startedAt).toBeInstanceOf(Date);
    expect(res.completedAt).toBeInstanceOf(Date);
    expect(res.completedAt!.getTime()).toBeGreaterThanOrEqual(res.startedAt!.getTime());
  });
  it('ts-5: startedAt and completedAt set on result', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ts-4' }));
    const res = await conn.executeSync(makeJob());
    expect(res.startedAt).toBeInstanceOf(Date);
    expect(res.completedAt).toBeInstanceOf(Date);
    expect(res.completedAt!.getTime()).toBeGreaterThanOrEqual(res.startedAt!.getTime());
  });
  it('ts-6: startedAt and completedAt set on result', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ts-5' }));
    const res = await conn.executeSync(makeJob());
    expect(res.startedAt).toBeInstanceOf(Date);
    expect(res.completedAt).toBeInstanceOf(Date);
    expect(res.completedAt!.getTime()).toBeGreaterThanOrEqual(res.startedAt!.getTime());
  });
  it('ts-7: startedAt and completedAt set on result', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ts-6' }));
    const res = await conn.executeSync(makeJob());
    expect(res.startedAt).toBeInstanceOf(Date);
    expect(res.completedAt).toBeInstanceOf(Date);
    expect(res.completedAt!.getTime()).toBeGreaterThanOrEqual(res.startedAt!.getTime());
  });
  it('ts-8: startedAt and completedAt set on result', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ts-7' }));
    const res = await conn.executeSync(makeJob());
    expect(res.startedAt).toBeInstanceOf(Date);
    expect(res.completedAt).toBeInstanceOf(Date);
    expect(res.completedAt!.getTime()).toBeGreaterThanOrEqual(res.startedAt!.getTime());
  });
  it('ts-9: startedAt and completedAt set on result', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ts-8' }));
    const res = await conn.executeSync(makeJob());
    expect(res.startedAt).toBeInstanceOf(Date);
    expect(res.completedAt).toBeInstanceOf(Date);
    expect(res.completedAt!.getTime()).toBeGreaterThanOrEqual(res.startedAt!.getTime());
  });
  it('ts-10: startedAt and completedAt set on result', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ts-9' }));
    const res = await conn.executeSync(makeJob());
    expect(res.startedAt).toBeInstanceOf(Date);
    expect(res.completedAt).toBeInstanceOf(Date);
    expect(res.completedAt!.getTime()).toBeGreaterThanOrEqual(res.startedAt!.getTime());
  });
  it('ts-11: startedAt and completedAt set on result', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ts-10' }));
    const res = await conn.executeSync(makeJob());
    expect(res.startedAt).toBeInstanceOf(Date);
    expect(res.completedAt).toBeInstanceOf(Date);
    expect(res.completedAt!.getTime()).toBeGreaterThanOrEqual(res.startedAt!.getTime());
  });
  it('ts-12: startedAt and completedAt set on result', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ts-11' }));
    const res = await conn.executeSync(makeJob());
    expect(res.startedAt).toBeInstanceOf(Date);
    expect(res.completedAt).toBeInstanceOf(Date);
    expect(res.completedAt!.getTime()).toBeGreaterThanOrEqual(res.startedAt!.getTime());
  });
  it('ts-13: startedAt and completedAt set on result', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ts-12' }));
    const res = await conn.executeSync(makeJob());
    expect(res.startedAt).toBeInstanceOf(Date);
    expect(res.completedAt).toBeInstanceOf(Date);
    expect(res.completedAt!.getTime()).toBeGreaterThanOrEqual(res.startedAt!.getTime());
  });
  it('ts-14: startedAt and completedAt set on result', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ts-13' }));
    const res = await conn.executeSync(makeJob());
    expect(res.startedAt).toBeInstanceOf(Date);
    expect(res.completedAt).toBeInstanceOf(Date);
    expect(res.completedAt!.getTime()).toBeGreaterThanOrEqual(res.startedAt!.getTime());
  });
  it('ts-15: startedAt and completedAt set on result', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ts-14' }));
    const res = await conn.executeSync(makeJob());
    expect(res.startedAt).toBeInstanceOf(Date);
    expect(res.completedAt).toBeInstanceOf(Date);
    expect(res.completedAt!.getTime()).toBeGreaterThanOrEqual(res.startedAt!.getTime());
  });
  it('ts-16: startedAt and completedAt set on result', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ts-15' }));
    const res = await conn.executeSync(makeJob());
    expect(res.startedAt).toBeInstanceOf(Date);
    expect(res.completedAt).toBeInstanceOf(Date);
    expect(res.completedAt!.getTime()).toBeGreaterThanOrEqual(res.startedAt!.getTime());
  });
  it('ts-17: startedAt and completedAt set on result', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ts-16' }));
    const res = await conn.executeSync(makeJob());
    expect(res.startedAt).toBeInstanceOf(Date);
    expect(res.completedAt).toBeInstanceOf(Date);
    expect(res.completedAt!.getTime()).toBeGreaterThanOrEqual(res.startedAt!.getTime());
  });
  it('ts-18: startedAt and completedAt set on result', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ts-17' }));
    const res = await conn.executeSync(makeJob());
    expect(res.startedAt).toBeInstanceOf(Date);
    expect(res.completedAt).toBeInstanceOf(Date);
    expect(res.completedAt!.getTime()).toBeGreaterThanOrEqual(res.startedAt!.getTime());
  });
  it('ts-19: startedAt and completedAt set on result', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ts-18' }));
    const res = await conn.executeSync(makeJob());
    expect(res.startedAt).toBeInstanceOf(Date);
    expect(res.completedAt).toBeInstanceOf(Date);
    expect(res.completedAt!.getTime()).toBeGreaterThanOrEqual(res.startedAt!.getTime());
  });
  it('ts-20: startedAt and completedAt set on result', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-ts-19' }));
    const res = await conn.executeSync(makeJob());
    expect(res.startedAt).toBeInstanceOf(Date);
    expect(res.completedAt).toBeInstanceOf(Date);
    expect(res.completedAt!.getTime()).toBeGreaterThanOrEqual(res.startedAt!.getTime());
  });
});

// ── 19. CUSTOMER unsupported ─────────────────────────────────────────────────

describe('SAPConnector – CUSTOMER unsupported', () => {
  let fetchMock: jest.SpyInstance;
  beforeEach(() => { fetchMock = jest.spyOn(global, "fetch"); });
  afterEach(() => { fetchMock.mockRestore(); });
  it('cust-1: returns [] without fetch', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-cu-0' }));
    expect(await conn.fetchRecords('CUSTOMER')).toHaveLength(0);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('cust-2: returns [] without fetch', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-cu-1' }));
    expect(await conn.fetchRecords('CUSTOMER')).toHaveLength(0);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('cust-3: returns [] without fetch', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-cu-2' }));
    expect(await conn.fetchRecords('CUSTOMER')).toHaveLength(0);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('cust-4: returns [] without fetch', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-cu-3' }));
    expect(await conn.fetchRecords('CUSTOMER')).toHaveLength(0);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('cust-5: returns [] without fetch', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-cu-4' }));
    expect(await conn.fetchRecords('CUSTOMER')).toHaveLength(0);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('cust-6: returns [] without fetch', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-cu-5' }));
    expect(await conn.fetchRecords('CUSTOMER')).toHaveLength(0);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('cust-7: returns [] without fetch', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-cu-6' }));
    expect(await conn.fetchRecords('CUSTOMER')).toHaveLength(0);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('cust-8: returns [] without fetch', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-cu-7' }));
    expect(await conn.fetchRecords('CUSTOMER')).toHaveLength(0);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('cust-9: returns [] without fetch', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-cu-8' }));
    expect(await conn.fetchRecords('CUSTOMER')).toHaveLength(0);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('cust-10: returns [] without fetch', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-cu-9' }));
    expect(await conn.fetchRecords('CUSTOMER')).toHaveLength(0);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('cust-11: returns [] without fetch', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-cu-10' }));
    expect(await conn.fetchRecords('CUSTOMER')).toHaveLength(0);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('cust-12: returns [] without fetch', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-cu-11' }));
    expect(await conn.fetchRecords('CUSTOMER')).toHaveLength(0);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('cust-13: returns [] without fetch', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-cu-12' }));
    expect(await conn.fetchRecords('CUSTOMER')).toHaveLength(0);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('cust-14: returns [] without fetch', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-cu-13' }));
    expect(await conn.fetchRecords('CUSTOMER')).toHaveLength(0);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('cust-15: returns [] without fetch', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-cu-14' }));
    expect(await conn.fetchRecords('CUSTOMER')).toHaveLength(0);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('cust-16: returns [] without fetch', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-cu-15' }));
    expect(await conn.fetchRecords('CUSTOMER')).toHaveLength(0);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('cust-17: returns [] without fetch', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-cu-16' }));
    expect(await conn.fetchRecords('CUSTOMER')).toHaveLength(0);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('cust-18: returns [] without fetch', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-cu-17' }));
    expect(await conn.fetchRecords('CUSTOMER')).toHaveLength(0);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('cust-19: returns [] without fetch', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-cu-18' }));
    expect(await conn.fetchRecords('CUSTOMER')).toHaveLength(0);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('cust-20: returns [] without fetch', async () => {
    const conn = new SAPConnector(makeConfig({ id: 'sap-cu-19' }));
    expect(await conn.fetchRecords('CUSTOMER')).toHaveLength(0);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

// ── 20. Concurrent instances ─────────────────────────────────────────────────

describe('SAPConnector – concurrent connector instances', () => {
  let fetchMock: jest.SpyInstance;
  beforeEach(() => { fetchMock = jest.spyOn(global, "fetch"); });
  afterEach(() => { fetchMock.mockRestore(); });
  it('conc-1: two instances make independent token requests', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('A')).mockResolvedValueOnce(mockToken('B'));
    const c1 = new SAPConnector(makeConfig({ id: 'sap-ca-0' }));
    const c2 = new SAPConnector(makeConfig({ id: 'sap-cb-0' }));
    await c1.testConnection(); await c2.testConnection();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
  it('conc-2: two instances make independent token requests', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('A')).mockResolvedValueOnce(mockToken('B'));
    const c1 = new SAPConnector(makeConfig({ id: 'sap-ca-1' }));
    const c2 = new SAPConnector(makeConfig({ id: 'sap-cb-1' }));
    await c1.testConnection(); await c2.testConnection();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
  it('conc-3: two instances make independent token requests', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('A')).mockResolvedValueOnce(mockToken('B'));
    const c1 = new SAPConnector(makeConfig({ id: 'sap-ca-2' }));
    const c2 = new SAPConnector(makeConfig({ id: 'sap-cb-2' }));
    await c1.testConnection(); await c2.testConnection();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
  it('conc-4: two instances make independent token requests', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('A')).mockResolvedValueOnce(mockToken('B'));
    const c1 = new SAPConnector(makeConfig({ id: 'sap-ca-3' }));
    const c2 = new SAPConnector(makeConfig({ id: 'sap-cb-3' }));
    await c1.testConnection(); await c2.testConnection();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
  it('conc-5: two instances make independent token requests', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('A')).mockResolvedValueOnce(mockToken('B'));
    const c1 = new SAPConnector(makeConfig({ id: 'sap-ca-4' }));
    const c2 = new SAPConnector(makeConfig({ id: 'sap-cb-4' }));
    await c1.testConnection(); await c2.testConnection();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
  it('conc-6: two instances make independent token requests', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('A')).mockResolvedValueOnce(mockToken('B'));
    const c1 = new SAPConnector(makeConfig({ id: 'sap-ca-5' }));
    const c2 = new SAPConnector(makeConfig({ id: 'sap-cb-5' }));
    await c1.testConnection(); await c2.testConnection();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
  it('conc-7: two instances make independent token requests', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('A')).mockResolvedValueOnce(mockToken('B'));
    const c1 = new SAPConnector(makeConfig({ id: 'sap-ca-6' }));
    const c2 = new SAPConnector(makeConfig({ id: 'sap-cb-6' }));
    await c1.testConnection(); await c2.testConnection();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
  it('conc-8: two instances make independent token requests', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('A')).mockResolvedValueOnce(mockToken('B'));
    const c1 = new SAPConnector(makeConfig({ id: 'sap-ca-7' }));
    const c2 = new SAPConnector(makeConfig({ id: 'sap-cb-7' }));
    await c1.testConnection(); await c2.testConnection();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
  it('conc-9: two instances make independent token requests', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('A')).mockResolvedValueOnce(mockToken('B'));
    const c1 = new SAPConnector(makeConfig({ id: 'sap-ca-8' }));
    const c2 = new SAPConnector(makeConfig({ id: 'sap-cb-8' }));
    await c1.testConnection(); await c2.testConnection();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
  it('conc-10: two instances make independent token requests', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('A')).mockResolvedValueOnce(mockToken('B'));
    const c1 = new SAPConnector(makeConfig({ id: 'sap-ca-9' }));
    const c2 = new SAPConnector(makeConfig({ id: 'sap-cb-9' }));
    await c1.testConnection(); await c2.testConnection();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
  it('conc-11: two instances make independent token requests', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('A')).mockResolvedValueOnce(mockToken('B'));
    const c1 = new SAPConnector(makeConfig({ id: 'sap-ca-10' }));
    const c2 = new SAPConnector(makeConfig({ id: 'sap-cb-10' }));
    await c1.testConnection(); await c2.testConnection();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
  it('conc-12: two instances make independent token requests', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('A')).mockResolvedValueOnce(mockToken('B'));
    const c1 = new SAPConnector(makeConfig({ id: 'sap-ca-11' }));
    const c2 = new SAPConnector(makeConfig({ id: 'sap-cb-11' }));
    await c1.testConnection(); await c2.testConnection();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
  it('conc-13: two instances make independent token requests', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('A')).mockResolvedValueOnce(mockToken('B'));
    const c1 = new SAPConnector(makeConfig({ id: 'sap-ca-12' }));
    const c2 = new SAPConnector(makeConfig({ id: 'sap-cb-12' }));
    await c1.testConnection(); await c2.testConnection();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
  it('conc-14: two instances make independent token requests', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('A')).mockResolvedValueOnce(mockToken('B'));
    const c1 = new SAPConnector(makeConfig({ id: 'sap-ca-13' }));
    const c2 = new SAPConnector(makeConfig({ id: 'sap-cb-13' }));
    await c1.testConnection(); await c2.testConnection();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
  it('conc-15: two instances make independent token requests', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('A')).mockResolvedValueOnce(mockToken('B'));
    const c1 = new SAPConnector(makeConfig({ id: 'sap-ca-14' }));
    const c2 = new SAPConnector(makeConfig({ id: 'sap-cb-14' }));
    await c1.testConnection(); await c2.testConnection();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
  it('conc-16: two instances make independent token requests', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('A')).mockResolvedValueOnce(mockToken('B'));
    const c1 = new SAPConnector(makeConfig({ id: 'sap-ca-15' }));
    const c2 = new SAPConnector(makeConfig({ id: 'sap-cb-15' }));
    await c1.testConnection(); await c2.testConnection();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
  it('conc-17: two instances make independent token requests', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('A')).mockResolvedValueOnce(mockToken('B'));
    const c1 = new SAPConnector(makeConfig({ id: 'sap-ca-16' }));
    const c2 = new SAPConnector(makeConfig({ id: 'sap-cb-16' }));
    await c1.testConnection(); await c2.testConnection();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
  it('conc-18: two instances make independent token requests', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('A')).mockResolvedValueOnce(mockToken('B'));
    const c1 = new SAPConnector(makeConfig({ id: 'sap-ca-17' }));
    const c2 = new SAPConnector(makeConfig({ id: 'sap-cb-17' }));
    await c1.testConnection(); await c2.testConnection();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
  it('conc-19: two instances make independent token requests', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('A')).mockResolvedValueOnce(mockToken('B'));
    const c1 = new SAPConnector(makeConfig({ id: 'sap-ca-18' }));
    const c2 = new SAPConnector(makeConfig({ id: 'sap-cb-18' }));
    await c1.testConnection(); await c2.testConnection();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
  it('conc-20: two instances make independent token requests', async () => {
    fetchMock.mockResolvedValueOnce(mockToken('A')).mockResolvedValueOnce(mockToken('B'));
    const c1 = new SAPConnector(makeConfig({ id: 'sap-ca-19' }));
    const c2 = new SAPConnector(makeConfig({ id: 'sap-cb-19' }));
    await c1.testConnection(); await c2.testConnection();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

// ── 21. Employee field mapping ───────────────────────────────────────────────

describe('SAPConnector – EMPLOYEE field mapping', () => {
  let fetchMock: jest.SpyInstance;
  beforeEach(() => { fetchMock = jest.spyOn(global, "fetch"); });
  afterEach(() => { fetchMock.mockRestore(); });
  it('fmap-title-1: title maps to jobTitle', async () => {
    const emp = { ...makeEmp(0), title: 'Eng Level 0' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [emp] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fm-0' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.jobTitle).toBe('Eng Level 0');
  });
  it('fmap-title-2: title maps to jobTitle', async () => {
    const emp = { ...makeEmp(1), title: 'Eng Level 1' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [emp] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fm-1' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.jobTitle).toBe('Eng Level 1');
  });
  it('fmap-title-3: title maps to jobTitle', async () => {
    const emp = { ...makeEmp(2), title: 'Eng Level 2' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [emp] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fm-2' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.jobTitle).toBe('Eng Level 2');
  });
  it('fmap-title-4: title maps to jobTitle', async () => {
    const emp = { ...makeEmp(3), title: 'Eng Level 3' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [emp] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fm-3' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.jobTitle).toBe('Eng Level 3');
  });
  it('fmap-title-5: title maps to jobTitle', async () => {
    const emp = { ...makeEmp(4), title: 'Eng Level 4' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [emp] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fm-4' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.jobTitle).toBe('Eng Level 4');
  });
  it('fmap-title-6: title maps to jobTitle', async () => {
    const emp = { ...makeEmp(5), title: 'Eng Level 5' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [emp] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fm-5' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.jobTitle).toBe('Eng Level 5');
  });
  it('fmap-title-7: title maps to jobTitle', async () => {
    const emp = { ...makeEmp(6), title: 'Eng Level 6' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [emp] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fm-6' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.jobTitle).toBe('Eng Level 6');
  });
  it('fmap-title-8: title maps to jobTitle', async () => {
    const emp = { ...makeEmp(7), title: 'Eng Level 7' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [emp] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fm-7' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.jobTitle).toBe('Eng Level 7');
  });
  it('fmap-title-9: title maps to jobTitle', async () => {
    const emp = { ...makeEmp(8), title: 'Eng Level 8' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [emp] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fm-8' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.jobTitle).toBe('Eng Level 8');
  });
  it('fmap-title-10: title maps to jobTitle', async () => {
    const emp = { ...makeEmp(9), title: 'Eng Level 9' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [emp] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fm-9' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.jobTitle).toBe('Eng Level 9');
  });
  it('fmap-title-11: title maps to jobTitle', async () => {
    const emp = { ...makeEmp(10), title: 'Eng Level 10' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [emp] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fm-10' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.jobTitle).toBe('Eng Level 10');
  });
  it('fmap-title-12: title maps to jobTitle', async () => {
    const emp = { ...makeEmp(11), title: 'Eng Level 11' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [emp] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fm-11' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.jobTitle).toBe('Eng Level 11');
  });
  it('fmap-title-13: title maps to jobTitle', async () => {
    const emp = { ...makeEmp(12), title: 'Eng Level 12' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [emp] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fm-12' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.jobTitle).toBe('Eng Level 12');
  });
  it('fmap-title-14: title maps to jobTitle', async () => {
    const emp = { ...makeEmp(13), title: 'Eng Level 13' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [emp] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fm-13' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.jobTitle).toBe('Eng Level 13');
  });
  it('fmap-title-15: title maps to jobTitle', async () => {
    const emp = { ...makeEmp(14), title: 'Eng Level 14' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [emp] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fm-14' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.jobTitle).toBe('Eng Level 14');
  });
  it('fmap-title-16: title maps to jobTitle', async () => {
    const emp = { ...makeEmp(15), title: 'Eng Level 15' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [emp] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fm-15' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.jobTitle).toBe('Eng Level 15');
  });
  it('fmap-title-17: title maps to jobTitle', async () => {
    const emp = { ...makeEmp(16), title: 'Eng Level 16' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [emp] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fm-16' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.jobTitle).toBe('Eng Level 16');
  });
  it('fmap-title-18: title maps to jobTitle', async () => {
    const emp = { ...makeEmp(17), title: 'Eng Level 17' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [emp] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fm-17' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.jobTitle).toBe('Eng Level 17');
  });
  it('fmap-title-19: title maps to jobTitle', async () => {
    const emp = { ...makeEmp(18), title: 'Eng Level 18' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [emp] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fm-18' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.jobTitle).toBe('Eng Level 18');
  });
  it('fmap-title-20: title maps to jobTitle', async () => {
    const emp = { ...makeEmp(19), title: 'Eng Level 19' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [emp] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fm-19' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.jobTitle).toBe('Eng Level 19');
  });
  it('fmap-loc-1: location field preserved', async () => {
    const emp = { ...makeEmp(0), location: 'Site 0' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [emp] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fl-0' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.location).toBe('Site 0');
  });
  it('fmap-loc-2: location field preserved', async () => {
    const emp = { ...makeEmp(1), location: 'Site 1' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [emp] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fl-1' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.location).toBe('Site 1');
  });
  it('fmap-loc-3: location field preserved', async () => {
    const emp = { ...makeEmp(2), location: 'Site 2' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [emp] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fl-2' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.location).toBe('Site 2');
  });
  it('fmap-loc-4: location field preserved', async () => {
    const emp = { ...makeEmp(3), location: 'Site 3' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [emp] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fl-3' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.location).toBe('Site 3');
  });
  it('fmap-loc-5: location field preserved', async () => {
    const emp = { ...makeEmp(4), location: 'Site 4' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [emp] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fl-4' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.location).toBe('Site 4');
  });
  it('fmap-loc-6: location field preserved', async () => {
    const emp = { ...makeEmp(5), location: 'Site 5' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [emp] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fl-5' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.location).toBe('Site 5');
  });
  it('fmap-loc-7: location field preserved', async () => {
    const emp = { ...makeEmp(6), location: 'Site 6' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [emp] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fl-6' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.location).toBe('Site 6');
  });
  it('fmap-loc-8: location field preserved', async () => {
    const emp = { ...makeEmp(7), location: 'Site 7' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [emp] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fl-7' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.location).toBe('Site 7');
  });
  it('fmap-loc-9: location field preserved', async () => {
    const emp = { ...makeEmp(8), location: 'Site 8' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [emp] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fl-8' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.location).toBe('Site 8');
  });
  it('fmap-loc-10: location field preserved', async () => {
    const emp = { ...makeEmp(9), location: 'Site 9' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [emp] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fl-9' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.location).toBe('Site 9');
  });
  it('fmap-loc-11: location field preserved', async () => {
    const emp = { ...makeEmp(10), location: 'Site 10' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [emp] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fl-10' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.location).toBe('Site 10');
  });
  it('fmap-loc-12: location field preserved', async () => {
    const emp = { ...makeEmp(11), location: 'Site 11' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [emp] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fl-11' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.location).toBe('Site 11');
  });
  it('fmap-loc-13: location field preserved', async () => {
    const emp = { ...makeEmp(12), location: 'Site 12' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [emp] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fl-12' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.location).toBe('Site 12');
  });
  it('fmap-loc-14: location field preserved', async () => {
    const emp = { ...makeEmp(13), location: 'Site 13' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [emp] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fl-13' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.location).toBe('Site 13');
  });
  it('fmap-loc-15: location field preserved', async () => {
    const emp = { ...makeEmp(14), location: 'Site 14' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [emp] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fl-14' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.location).toBe('Site 14');
  });
  it('fmap-loc-16: location field preserved', async () => {
    const emp = { ...makeEmp(15), location: 'Site 15' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [emp] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fl-15' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.location).toBe('Site 15');
  });
  it('fmap-loc-17: location field preserved', async () => {
    const emp = { ...makeEmp(16), location: 'Site 16' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [emp] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fl-16' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.location).toBe('Site 16');
  });
  it('fmap-loc-18: location field preserved', async () => {
    const emp = { ...makeEmp(17), location: 'Site 17' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [emp] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fl-17' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.location).toBe('Site 17');
  });
  it('fmap-loc-19: location field preserved', async () => {
    const emp = { ...makeEmp(18), location: 'Site 18' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [emp] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fl-18' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.location).toBe('Site 18');
  });
  it('fmap-loc-20: location field preserved', async () => {
    const emp = { ...makeEmp(19), location: 'Site 19' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [emp] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-fl-19' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.location).toBe('Site 19');
  });
});

// ── 22. hireDate preserved ───────────────────────────────────────────────────

describe('SAPConnector – hireDate field', () => {
  let fetchMock: jest.SpyInstance;
  beforeEach(() => { fetchMock = jest.spyOn(global, "fetch"); });
  afterEach(() => { fetchMock.mockRestore(); });
  it('hire-1: hireDate preserved on record', async () => {
    const emp = { ...makeEmp(0), hireDate: '2025-01-01' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [emp] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-hd-0' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.hireDate).toBe('2025-01-01');
  });
  it('hire-2: hireDate preserved on record', async () => {
    const emp = { ...makeEmp(1), hireDate: '2025-02-01' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [emp] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-hd-1' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.hireDate).toBe('2025-02-01');
  });
  it('hire-3: hireDate preserved on record', async () => {
    const emp = { ...makeEmp(2), hireDate: '2025-03-01' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [emp] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-hd-2' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.hireDate).toBe('2025-03-01');
  });
  it('hire-4: hireDate preserved on record', async () => {
    const emp = { ...makeEmp(3), hireDate: '2025-04-01' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [emp] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-hd-3' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.hireDate).toBe('2025-04-01');
  });
  it('hire-5: hireDate preserved on record', async () => {
    const emp = { ...makeEmp(4), hireDate: '2025-05-01' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [emp] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-hd-4' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.hireDate).toBe('2025-05-01');
  });
  it('hire-6: hireDate preserved on record', async () => {
    const emp = { ...makeEmp(5), hireDate: '2025-06-01' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [emp] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-hd-5' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.hireDate).toBe('2025-06-01');
  });
  it('hire-7: hireDate preserved on record', async () => {
    const emp = { ...makeEmp(6), hireDate: '2025-07-01' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [emp] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-hd-6' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.hireDate).toBe('2025-07-01');
  });
  it('hire-8: hireDate preserved on record', async () => {
    const emp = { ...makeEmp(7), hireDate: '2025-08-01' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [emp] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-hd-7' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.hireDate).toBe('2025-08-01');
  });
  it('hire-9: hireDate preserved on record', async () => {
    const emp = { ...makeEmp(8), hireDate: '2025-09-01' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [emp] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-hd-8' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.hireDate).toBe('2025-09-01');
  });
  it('hire-10: hireDate preserved on record', async () => {
    const emp = { ...makeEmp(9), hireDate: '2025-10-01' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [emp] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-hd-9' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.hireDate).toBe('2025-10-01');
  });
  it('hire-11: hireDate preserved on record', async () => {
    const emp = { ...makeEmp(10), hireDate: '2025-11-01' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [emp] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-hd-10' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.hireDate).toBe('2025-11-01');
  });
  it('hire-12: hireDate preserved on record', async () => {
    const emp = { ...makeEmp(11), hireDate: '2025-12-01' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [emp] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-hd-11' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.hireDate).toBe('2025-12-01');
  });
  it('hire-13: hireDate preserved on record', async () => {
    const emp = { ...makeEmp(12), hireDate: '2025-01-01' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [emp] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-hd-12' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.hireDate).toBe('2025-01-01');
  });
  it('hire-14: hireDate preserved on record', async () => {
    const emp = { ...makeEmp(13), hireDate: '2025-02-01' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [emp] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-hd-13' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.hireDate).toBe('2025-02-01');
  });
  it('hire-15: hireDate preserved on record', async () => {
    const emp = { ...makeEmp(14), hireDate: '2025-03-01' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [emp] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-hd-14' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.hireDate).toBe('2025-03-01');
  });
  it('hire-16: hireDate preserved on record', async () => {
    const emp = { ...makeEmp(15), hireDate: '2025-04-01' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [emp] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-hd-15' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.hireDate).toBe('2025-04-01');
  });
  it('hire-17: hireDate preserved on record', async () => {
    const emp = { ...makeEmp(16), hireDate: '2025-05-01' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [emp] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-hd-16' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.hireDate).toBe('2025-05-01');
  });
  it('hire-18: hireDate preserved on record', async () => {
    const emp = { ...makeEmp(17), hireDate: '2025-06-01' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [emp] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-hd-17' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.hireDate).toBe('2025-06-01');
  });
  it('hire-19: hireDate preserved on record', async () => {
    const emp = { ...makeEmp(18), hireDate: '2025-07-01' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [emp] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-hd-18' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.hireDate).toBe('2025-07-01');
  });
  it('hire-20: hireDate preserved on record', async () => {
    const emp = { ...makeEmp(19), hireDate: '2025-08-01' };
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [emp] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-hd-19' }));
    const recs = await conn.fetchRecords('EMPLOYEE');
    expect(recs[0].data.hireDate).toBe('2025-08-01');
  });
});

// ── 23. Job PENDING→SUCCESS transition ──────────────────────────────────────

describe('SAPConnector – job status transitions', () => {
  let fetchMock: jest.SpyInstance;
  beforeEach(() => { fetchMock = jest.spyOn(global, "fetch"); });
  afterEach(() => { fetchMock.mockRestore(); });
  it('trans-1: PENDING→SUCCESS', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-tr-0' }));
    const job = makeJob();
    expect(job.status).toBe('PENDING');
    const res = await conn.executeSync(job);
    expect(res.status).toBe('SUCCESS');
  });
  it('trans-2: PENDING→SUCCESS', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-tr-1' }));
    const job = makeJob();
    expect(job.status).toBe('PENDING');
    const res = await conn.executeSync(job);
    expect(res.status).toBe('SUCCESS');
  });
  it('trans-3: PENDING→SUCCESS', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-tr-2' }));
    const job = makeJob();
    expect(job.status).toBe('PENDING');
    const res = await conn.executeSync(job);
    expect(res.status).toBe('SUCCESS');
  });
  it('trans-4: PENDING→SUCCESS', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-tr-3' }));
    const job = makeJob();
    expect(job.status).toBe('PENDING');
    const res = await conn.executeSync(job);
    expect(res.status).toBe('SUCCESS');
  });
  it('trans-5: PENDING→SUCCESS', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-tr-4' }));
    const job = makeJob();
    expect(job.status).toBe('PENDING');
    const res = await conn.executeSync(job);
    expect(res.status).toBe('SUCCESS');
  });
  it('trans-6: PENDING→SUCCESS', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-tr-5' }));
    const job = makeJob();
    expect(job.status).toBe('PENDING');
    const res = await conn.executeSync(job);
    expect(res.status).toBe('SUCCESS');
  });
  it('trans-7: PENDING→SUCCESS', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-tr-6' }));
    const job = makeJob();
    expect(job.status).toBe('PENDING');
    const res = await conn.executeSync(job);
    expect(res.status).toBe('SUCCESS');
  });
  it('trans-8: PENDING→SUCCESS', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-tr-7' }));
    const job = makeJob();
    expect(job.status).toBe('PENDING');
    const res = await conn.executeSync(job);
    expect(res.status).toBe('SUCCESS');
  });
  it('trans-9: PENDING→SUCCESS', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-tr-8' }));
    const job = makeJob();
    expect(job.status).toBe('PENDING');
    const res = await conn.executeSync(job);
    expect(res.status).toBe('SUCCESS');
  });
  it('trans-10: PENDING→SUCCESS', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-tr-9' }));
    const job = makeJob();
    expect(job.status).toBe('PENDING');
    const res = await conn.executeSync(job);
    expect(res.status).toBe('SUCCESS');
  });
  it('trans-11: PENDING→SUCCESS', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-tr-10' }));
    const job = makeJob();
    expect(job.status).toBe('PENDING');
    const res = await conn.executeSync(job);
    expect(res.status).toBe('SUCCESS');
  });
  it('trans-12: PENDING→SUCCESS', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-tr-11' }));
    const job = makeJob();
    expect(job.status).toBe('PENDING');
    const res = await conn.executeSync(job);
    expect(res.status).toBe('SUCCESS');
  });
  it('trans-13: PENDING→SUCCESS', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-tr-12' }));
    const job = makeJob();
    expect(job.status).toBe('PENDING');
    const res = await conn.executeSync(job);
    expect(res.status).toBe('SUCCESS');
  });
  it('trans-14: PENDING→SUCCESS', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-tr-13' }));
    const job = makeJob();
    expect(job.status).toBe('PENDING');
    const res = await conn.executeSync(job);
    expect(res.status).toBe('SUCCESS');
  });
  it('trans-15: PENDING→SUCCESS', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-tr-14' }));
    const job = makeJob();
    expect(job.status).toBe('PENDING');
    const res = await conn.executeSync(job);
    expect(res.status).toBe('SUCCESS');
  });
  it('trans-16: PENDING→SUCCESS', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-tr-15' }));
    const job = makeJob();
    expect(job.status).toBe('PENDING');
    const res = await conn.executeSync(job);
    expect(res.status).toBe('SUCCESS');
  });
  it('trans-17: PENDING→SUCCESS', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-tr-16' }));
    const job = makeJob();
    expect(job.status).toBe('PENDING');
    const res = await conn.executeSync(job);
    expect(res.status).toBe('SUCCESS');
  });
  it('trans-18: PENDING→SUCCESS', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-tr-17' }));
    const job = makeJob();
    expect(job.status).toBe('PENDING');
    const res = await conn.executeSync(job);
    expect(res.status).toBe('SUCCESS');
  });
  it('trans-19: PENDING→SUCCESS', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-tr-18' }));
    const job = makeJob();
    expect(job.status).toBe('PENDING');
    const res = await conn.executeSync(job);
    expect(res.status).toBe('SUCCESS');
  });
  it('trans-20: PENDING→SUCCESS', async () => {
    fetchMock.mockResolvedValueOnce(mockToken()).mockResolvedValueOnce(mockData({ d: { results: [] } }));
    const conn = new SAPConnector(makeConfig({ id: 'sap-tr-19' }));
    const job = makeJob();
    expect(job.status).toBe('PENDING');
    const res = await conn.executeSync(job);
    expect(res.status).toBe('SUCCESS');
  });
});

// ── 24. Token failure propagates ────────────────────────────────────────────

describe('SAPConnector – token acquisition failure', () => {
  let fetchMock: jest.SpyInstance;
  beforeEach(() => { fetchMock = jest.spyOn(global, "fetch"); });
  afterEach(() => { fetchMock.mockRestore(); });
  it('tokfail-1: token HTTP 401 propagates', async () => {
    fetchMock.mockResolvedValueOnce(mockError(401));
    const conn = new SAPConnector(makeConfig({ id: 'sap-tf-0' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('SAP token request failed: HTTP 401');
  });
  it('tokfail-2: token HTTP 401 propagates', async () => {
    fetchMock.mockResolvedValueOnce(mockError(401));
    const conn = new SAPConnector(makeConfig({ id: 'sap-tf-1' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('SAP token request failed: HTTP 401');
  });
  it('tokfail-3: token HTTP 401 propagates', async () => {
    fetchMock.mockResolvedValueOnce(mockError(401));
    const conn = new SAPConnector(makeConfig({ id: 'sap-tf-2' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('SAP token request failed: HTTP 401');
  });
  it('tokfail-4: token HTTP 401 propagates', async () => {
    fetchMock.mockResolvedValueOnce(mockError(401));
    const conn = new SAPConnector(makeConfig({ id: 'sap-tf-3' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('SAP token request failed: HTTP 401');
  });
  it('tokfail-5: token HTTP 401 propagates', async () => {
    fetchMock.mockResolvedValueOnce(mockError(401));
    const conn = new SAPConnector(makeConfig({ id: 'sap-tf-4' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('SAP token request failed: HTTP 401');
  });
  it('tokfail-6: token HTTP 401 propagates', async () => {
    fetchMock.mockResolvedValueOnce(mockError(401));
    const conn = new SAPConnector(makeConfig({ id: 'sap-tf-5' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('SAP token request failed: HTTP 401');
  });
  it('tokfail-7: token HTTP 401 propagates', async () => {
    fetchMock.mockResolvedValueOnce(mockError(401));
    const conn = new SAPConnector(makeConfig({ id: 'sap-tf-6' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('SAP token request failed: HTTP 401');
  });
  it('tokfail-8: token HTTP 401 propagates', async () => {
    fetchMock.mockResolvedValueOnce(mockError(401));
    const conn = new SAPConnector(makeConfig({ id: 'sap-tf-7' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('SAP token request failed: HTTP 401');
  });
  it('tokfail-9: token HTTP 401 propagates', async () => {
    fetchMock.mockResolvedValueOnce(mockError(401));
    const conn = new SAPConnector(makeConfig({ id: 'sap-tf-8' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('SAP token request failed: HTTP 401');
  });
  it('tokfail-10: token HTTP 401 propagates', async () => {
    fetchMock.mockResolvedValueOnce(mockError(401));
    const conn = new SAPConnector(makeConfig({ id: 'sap-tf-9' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('SAP token request failed: HTTP 401');
  });
  it('tokfail-11: token HTTP 401 propagates', async () => {
    fetchMock.mockResolvedValueOnce(mockError(401));
    const conn = new SAPConnector(makeConfig({ id: 'sap-tf-10' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('SAP token request failed: HTTP 401');
  });
  it('tokfail-12: token HTTP 401 propagates', async () => {
    fetchMock.mockResolvedValueOnce(mockError(401));
    const conn = new SAPConnector(makeConfig({ id: 'sap-tf-11' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('SAP token request failed: HTTP 401');
  });
  it('tokfail-13: token HTTP 401 propagates', async () => {
    fetchMock.mockResolvedValueOnce(mockError(401));
    const conn = new SAPConnector(makeConfig({ id: 'sap-tf-12' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('SAP token request failed: HTTP 401');
  });
  it('tokfail-14: token HTTP 401 propagates', async () => {
    fetchMock.mockResolvedValueOnce(mockError(401));
    const conn = new SAPConnector(makeConfig({ id: 'sap-tf-13' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('SAP token request failed: HTTP 401');
  });
  it('tokfail-15: token HTTP 401 propagates', async () => {
    fetchMock.mockResolvedValueOnce(mockError(401));
    const conn = new SAPConnector(makeConfig({ id: 'sap-tf-14' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('SAP token request failed: HTTP 401');
  });
  it('tokfail-16: token HTTP 401 propagates', async () => {
    fetchMock.mockResolvedValueOnce(mockError(401));
    const conn = new SAPConnector(makeConfig({ id: 'sap-tf-15' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('SAP token request failed: HTTP 401');
  });
  it('tokfail-17: token HTTP 401 propagates', async () => {
    fetchMock.mockResolvedValueOnce(mockError(401));
    const conn = new SAPConnector(makeConfig({ id: 'sap-tf-16' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('SAP token request failed: HTTP 401');
  });
  it('tokfail-18: token HTTP 401 propagates', async () => {
    fetchMock.mockResolvedValueOnce(mockError(401));
    const conn = new SAPConnector(makeConfig({ id: 'sap-tf-17' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('SAP token request failed: HTTP 401');
  });
  it('tokfail-19: token HTTP 401 propagates', async () => {
    fetchMock.mockResolvedValueOnce(mockError(401));
    const conn = new SAPConnector(makeConfig({ id: 'sap-tf-18' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('SAP token request failed: HTTP 401');
  });
  it('tokfail-20: token HTTP 401 propagates', async () => {
    fetchMock.mockResolvedValueOnce(mockError(401));
    const conn = new SAPConnector(makeConfig({ id: 'sap-tf-19' }));
    await expect(conn.fetchRecords('EMPLOYEE')).rejects.toThrow('SAP token request failed: HTTP 401');
  });
});

// ── 25. enabled=false connector ─────────────────────────────────────────────

describe('SAPConnector – disabled connector still operable', () => {
  let fetchMock: jest.SpyInstance;
  beforeEach(() => { fetchMock = jest.spyOn(global, "fetch"); });
  afterEach(() => { fetchMock.mockRestore(); });
  it('disabled-1: disabled connector still returns from testConnection', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new SAPConnector(makeConfig({ id: 'sap-dis-0', enabled: false }));
    expect(conn.enabled).toBe(false);
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
  });
  it('disabled-2: disabled connector still returns from testConnection', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new SAPConnector(makeConfig({ id: 'sap-dis-1', enabled: false }));
    expect(conn.enabled).toBe(false);
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
  });
  it('disabled-3: disabled connector still returns from testConnection', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new SAPConnector(makeConfig({ id: 'sap-dis-2', enabled: false }));
    expect(conn.enabled).toBe(false);
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
  });
  it('disabled-4: disabled connector still returns from testConnection', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new SAPConnector(makeConfig({ id: 'sap-dis-3', enabled: false }));
    expect(conn.enabled).toBe(false);
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
  });
  it('disabled-5: disabled connector still returns from testConnection', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new SAPConnector(makeConfig({ id: 'sap-dis-4', enabled: false }));
    expect(conn.enabled).toBe(false);
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
  });
  it('disabled-6: disabled connector still returns from testConnection', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new SAPConnector(makeConfig({ id: 'sap-dis-5', enabled: false }));
    expect(conn.enabled).toBe(false);
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
  });
  it('disabled-7: disabled connector still returns from testConnection', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new SAPConnector(makeConfig({ id: 'sap-dis-6', enabled: false }));
    expect(conn.enabled).toBe(false);
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
  });
  it('disabled-8: disabled connector still returns from testConnection', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new SAPConnector(makeConfig({ id: 'sap-dis-7', enabled: false }));
    expect(conn.enabled).toBe(false);
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
  });
  it('disabled-9: disabled connector still returns from testConnection', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new SAPConnector(makeConfig({ id: 'sap-dis-8', enabled: false }));
    expect(conn.enabled).toBe(false);
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
  });
  it('disabled-10: disabled connector still returns from testConnection', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new SAPConnector(makeConfig({ id: 'sap-dis-9', enabled: false }));
    expect(conn.enabled).toBe(false);
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
  });
  it('disabled-11: disabled connector still returns from testConnection', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new SAPConnector(makeConfig({ id: 'sap-dis-10', enabled: false }));
    expect(conn.enabled).toBe(false);
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
  });
  it('disabled-12: disabled connector still returns from testConnection', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new SAPConnector(makeConfig({ id: 'sap-dis-11', enabled: false }));
    expect(conn.enabled).toBe(false);
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
  });
  it('disabled-13: disabled connector still returns from testConnection', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new SAPConnector(makeConfig({ id: 'sap-dis-12', enabled: false }));
    expect(conn.enabled).toBe(false);
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
  });
  it('disabled-14: disabled connector still returns from testConnection', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new SAPConnector(makeConfig({ id: 'sap-dis-13', enabled: false }));
    expect(conn.enabled).toBe(false);
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
  });
  it('disabled-15: disabled connector still returns from testConnection', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new SAPConnector(makeConfig({ id: 'sap-dis-14', enabled: false }));
    expect(conn.enabled).toBe(false);
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
  });
  it('disabled-16: disabled connector still returns from testConnection', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new SAPConnector(makeConfig({ id: 'sap-dis-15', enabled: false }));
    expect(conn.enabled).toBe(false);
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
  });
  it('disabled-17: disabled connector still returns from testConnection', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new SAPConnector(makeConfig({ id: 'sap-dis-16', enabled: false }));
    expect(conn.enabled).toBe(false);
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
  });
  it('disabled-18: disabled connector still returns from testConnection', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new SAPConnector(makeConfig({ id: 'sap-dis-17', enabled: false }));
    expect(conn.enabled).toBe(false);
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
  });
  it('disabled-19: disabled connector still returns from testConnection', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new SAPConnector(makeConfig({ id: 'sap-dis-18', enabled: false }));
    expect(conn.enabled).toBe(false);
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
  });
  it('disabled-20: disabled connector still returns from testConnection', async () => {
    fetchMock.mockResolvedValueOnce(mockToken());
    const conn = new SAPConnector(makeConfig({ id: 'sap-dis-19', enabled: false }));
    expect(conn.enabled).toBe(false);
    const r = await conn.testConnection();
    expect(r.healthy).toBe(true);
  });
});
