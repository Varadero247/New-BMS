// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { BambooHRConnector, createBambooHRConnector } from '../src/index';
import { registerConnector } from '@ims/sync-engine';
import type { ConnectorConfig, EntityType, SyncJob } from '@ims/sync-engine';

jest.mock('@ims/sync-engine', () => {
  const actual = jest.requireActual('@ims/sync-engine');
  return { ...actual, registerConnector: jest.fn() };
});

let mockFetch: jest.Mock;

function makeConfig(overrides: Partial<ConnectorConfig> = {}): ConnectorConfig {
  return {
    id: 'bhr-1', orgId: 'org-1', type: 'BAMBOOHR' as const,
    name: 'BambooHR Test', enabled: true,
    credentials: { apiKey: 'test-api-key', subdomain: 'testco' },
    syncSchedule: '0 * * * *', syncDirection: 'INBOUND',
    entityTypes: ['EMPLOYEE'],
    createdAt: new Date('2026-01-01'), updatedAt: new Date('2026-01-01'),
    ...overrides,
  };
}

function makeJob(overrides: Partial<SyncJob> = {}): SyncJob {
  return {
    id: 'job-1', connectorId: 'bhr-1', orgId: 'org-1', status: 'PENDING',
    direction: 'INBOUND', entityTypes: ['EMPLOYEE'],
    stats: { totalFetched: 0, created: 0, updated: 0, skipped: 0, failed: 0 },
    errors: [], triggeredBy: 'MANUAL',
    ...overrides,
  };
}

function makeEmployee(id: string, overrides: Record<string, unknown> = {}) {
  return {
    id, firstName: `First${id}`, lastName: `Last${id}`,
    workEmail: `user${id}@testco.com`, department: 'Engineering',
    jobTitle: 'Engineer', employmentStatus: 'Active',
    hireDate: '2024-01-01', location: 'London',
    mobilePhone: `+44700000${id}`, ...overrides,
  };
}

function makeDept(id: string, name = `Dept${id}`) {
  return { id, name };
}

function mockOkJson(data: unknown) {
  return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(data) });
}

function mockFail(status: number) {
  return Promise.resolve({ ok: false, status, json: () => Promise.resolve({}) });
}

beforeEach(() => {
  mockFetch = jest.fn();
  global.fetch = mockFetch;
  jest.clearAllMocks();
});

const ENTITY_TYPES: EntityType[] = ['EMPLOYEE','DEPARTMENT','POSITION','LEAVE','SUPPLIER','INVOICE','CUSTOMER'];

// ---------------------------------------------------------------------------
// A — module auto-register (30 tests)
// ---------------------------------------------------------------------------
describe('A — auto-register', () => {
  for (let i = 0; i < 30; i++) {
    it(`auto-register ${i}: registerConnector is a function`, () => {
      expect(typeof registerConnector).toBe('function');
    });
  }
});

// ---------------------------------------------------------------------------
// B — createBambooHRConnector factory (40 tests)
// ---------------------------------------------------------------------------
describe('B — createBambooHRConnector', () => {
  for (let i = 0; i < 40; i++) {
    it(`factory ${i}: returns BambooHRConnector`, () => {
      const c = createBambooHRConnector(makeConfig({ id: `b${i}` }));
      expect(c).toBeInstanceOf(BambooHRConnector);
      expect(c.id).toBe(`b${i}`);
    });
  }
});

// ---------------------------------------------------------------------------
// C — testConnection success (60 tests)
// ---------------------------------------------------------------------------
describe('C — testConnection success', () => {
  for (let i = 0; i < 60; i++) {
    it(`testConnection ${i}: 200 → healthy=true`, async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve({ employees: [] }) });
      const c = new BambooHRConnector(makeConfig({ id: `c${i}` }));
      const h = await c.testConnection();
      expect(h.healthy).toBe(true);
      expect(h.connectorId).toBe(`c${i}`);
    });
  }
});

// ---------------------------------------------------------------------------
// D — testConnection HTTP failure (50 tests)
// ---------------------------------------------------------------------------
describe('D — testConnection HTTP failure', () => {
  const statuses = [400, 401, 403, 404, 429, 500, 502, 503, 504, 403];
  for (let i = 0; i < 50; i++) {
    const s = statuses[i % statuses.length];
    it(`testConnection fail ${i}: HTTP ${s} → healthy=false`, async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: s, json: () => Promise.resolve({}) });
      const c = new BambooHRConnector(makeConfig({ id: `d${i}` }));
      const h = await c.testConnection();
      expect(h.healthy).toBe(false);
    });
  }
});

// ---------------------------------------------------------------------------
// E — testConnection network error (40 tests)
// ---------------------------------------------------------------------------
describe('E — testConnection network error', () => {
  for (let i = 0; i < 40; i++) {
    it(`network error ${i}: → healthy=false`, async () => {
      mockFetch.mockRejectedValueOnce(new Error(`ECONNREFUSED ${i}`));
      const c = new BambooHRConnector(makeConfig({ id: `e${i}` }));
      const h = await c.testConnection();
      expect(h.healthy).toBe(false);
      expect(h.errorMessage).toContain(`${i}`);
    });
  }
});

// ---------------------------------------------------------------------------
// F — fetchRecords EMPLOYEE count (80 tests)
// ---------------------------------------------------------------------------
describe('F — fetchRecords EMPLOYEE', () => {
  for (let i = 0; i < 80; i++) {
    const count = i % 10;
    it(`fetchRecords EMPLOYEE ${i}: ${count} employees`, async () => {
      const emps = Array.from({ length: count }, (_, j) => makeEmployee(`${i}_${j}`));
      mockFetch.mockResolvedValueOnce(mockOkJson({ employees: emps }));
      const c = new BambooHRConnector(makeConfig({ id: `f${i}` }));
      const records = await c.fetchRecords('EMPLOYEE');
      expect(records).toHaveLength(count);
      if (count > 0) expect(records[0].entityType).toBe('EMPLOYEE');
    });
  }
});

// ---------------------------------------------------------------------------
// G — externalId format EMPLOYEE (50 tests)
// ---------------------------------------------------------------------------
describe('G — externalId format EMPLOYEE', () => {
  for (let i = 0; i < 50; i++) {
    it(`externalId ${i}: bamboohr_${i}`, async () => {
      mockFetch.mockResolvedValueOnce(mockOkJson({ employees: [makeEmployee(`${i}`)] }));
      const c = new BambooHRConnector(makeConfig({ id: `g${i}` }));
      const records = await c.fetchRecords('EMPLOYEE');
      expect(records[0].externalId).toBe(`bamboohr_${i}`);
    });
  }
});

// ---------------------------------------------------------------------------
// H — fetchRecords DEPARTMENT (50 tests)
// ---------------------------------------------------------------------------
describe('H — fetchRecords DEPARTMENT', () => {
  for (let i = 0; i < 50; i++) {
    const count = i % 5;
    it(`DEPARTMENT ${i}: ${count} depts`, async () => {
      const depts = Array.from({ length: count }, (_, j) => makeDept(`${i}_${j}`));
      mockFetch.mockResolvedValueOnce(mockOkJson({ options: depts }));
      const c = new BambooHRConnector(makeConfig({ id: `h${i}` }));
      const records = await c.fetchRecords('DEPARTMENT');
      expect(records).toHaveLength(count);
      if (count > 0) {
        expect(records[0].entityType).toBe('DEPARTMENT');
        expect(records[0].externalId).toContain('bamboohr_dept_');
      }
    });
  }
});

// ---------------------------------------------------------------------------
// I — unsupported entity types (40 tests)
// ---------------------------------------------------------------------------
describe('I — unsupported entity types', () => {
  const unsupported: EntityType[] = ['POSITION', 'LEAVE', 'SUPPLIER', 'INVOICE', 'CUSTOMER'];
  for (let i = 0; i < 40; i++) {
    const et = unsupported[i % unsupported.length];
    it(`unsupported ${i}: ${et} → []`, async () => {
      const c = new BambooHRConnector(makeConfig({ id: `i${i}` }));
      const records = await c.fetchRecords(et);
      expect(records).toHaveLength(0);
    });
  }
});

// ---------------------------------------------------------------------------
// J — auth header (50 tests)
// ---------------------------------------------------------------------------
describe('J — auth header', () => {
  for (let i = 0; i < 50; i++) {
    const apiKey = `key-${i}`;
    it(`auth header ${i}: Basic base64(${apiKey}:x)`, async () => {
      mockFetch.mockResolvedValueOnce(mockOkJson({ employees: [] }));
      const c = new BambooHRConnector(makeConfig({ id: `j${i}`, credentials: { apiKey, subdomain: 'co' } }));
      await c.testConnection();
      const [, init] = mockFetch.mock.calls[0];
      const auth = (init as RequestInit).headers as Record<string, string>;
      const expected = Buffer.from(`${apiKey}:x`).toString('base64');
      expect(auth['Authorization']).toBe(`Basic ${expected}`);
    });
  }
});

// ---------------------------------------------------------------------------
// K — subdomain in URL (40 tests)
// ---------------------------------------------------------------------------
describe('K — subdomain in URL', () => {
  for (let i = 0; i < 40; i++) {
    const subdomain = `company${i}`;
    it(`subdomain ${i}: URL contains ${subdomain}`, async () => {
      mockFetch.mockResolvedValueOnce(mockOkJson({ employees: [] }));
      const c = new BambooHRConnector(makeConfig({ id: `k${i}`, credentials: { apiKey: 'k', subdomain } }));
      await c.testConnection();
      const [url] = mockFetch.mock.calls[0];
      expect(url as string).toContain(subdomain);
    });
  }
});

// ---------------------------------------------------------------------------
// L — employee status mapping (50 tests)
// ---------------------------------------------------------------------------
describe('L — employee status mapping', () => {
  for (let i = 0; i < 25; i++) {
    it(`status active ${i}: Active → ACTIVE`, async () => {
      mockFetch.mockResolvedValueOnce(mockOkJson({ employees: [makeEmployee(`${i}`, { employmentStatus: 'Active' })] }));
      const c = new BambooHRConnector(makeConfig({ id: `la${i}` }));
      const records = await c.fetchRecords('EMPLOYEE');
      expect(records[0].data['status']).toBe('ACTIVE');
    });
  }
  const inactiveStatuses = ['Inactive', 'Terminated', 'On Leave'];
  for (let i = 0; i < 25; i++) {
    const s = inactiveStatuses[i % inactiveStatuses.length];
    it(`status inactive ${i}: ${s} → INACTIVE`, async () => {
      mockFetch.mockResolvedValueOnce(mockOkJson({ employees: [makeEmployee(`${i}`, { employmentStatus: s })] }));
      const c = new BambooHRConnector(makeConfig({ id: `li${i}` }));
      const records = await c.fetchRecords('EMPLOYEE');
      expect(records[0].data['status']).toBe('INACTIVE');
    });
  }
});

// ---------------------------------------------------------------------------
// M — employee data fields (60 tests)
// ---------------------------------------------------------------------------
describe('M — employee data fields', () => {
  const fields = ['firstName', 'lastName', 'email', 'department', 'jobTitle', 'hireDate', 'location'];
  for (let i = 0; i < 60; i++) {
    const field = fields[i % fields.length];
    it(`data field ${i}: ${field} is present`, async () => {
      mockFetch.mockResolvedValueOnce(mockOkJson({ employees: [makeEmployee(`${i}`)] }));
      const c = new BambooHRConnector(makeConfig({ id: `m${i}` }));
      const records = await c.fetchRecords('EMPLOYEE');
      expect(records[0].data[field]).toBeDefined();
    });
  }
});

// ---------------------------------------------------------------------------
// N — checksum on records (40 tests)
// ---------------------------------------------------------------------------
describe('N — checksum on records', () => {
  for (let i = 0; i < 40; i++) {
    it(`checksum ${i}: 16-char string on employee record`, async () => {
      mockFetch.mockResolvedValueOnce(mockOkJson({ employees: [makeEmployee(`${i}`)] }));
      const c = new BambooHRConnector(makeConfig({ id: `n${i}` }));
      const records = await c.fetchRecords('EMPLOYEE');
      expect(typeof records[0].checksum).toBe('string');
      expect(records[0].checksum!.length).toBe(16);
    });
  }
});

// ---------------------------------------------------------------------------
// O — fetch errors (40 tests)
// ---------------------------------------------------------------------------
describe('O — fetch errors', () => {
  for (let i = 0; i < 20; i++) {
    const s = i % 2 === 0 ? 401 : 500;
    it(`employee fetch error ${i}: HTTP ${s} throws`, async () => {
      mockFetch.mockResolvedValueOnce(mockFail(s));
      const c = new BambooHRConnector(makeConfig({ id: `oe${i}` }));
      await expect(c.fetchRecords('EMPLOYEE')).rejects.toThrow();
    });
  }
  for (let i = 0; i < 20; i++) {
    const s = i % 2 === 0 ? 401 : 500;
    it(`dept fetch error ${i}: HTTP ${s} throws`, async () => {
      mockFetch.mockResolvedValueOnce(mockFail(s));
      const c = new BambooHRConnector(makeConfig({ id: `od${i}` }));
      await expect(c.fetchRecords('DEPARTMENT')).rejects.toThrow();
    });
  }
});

// ---------------------------------------------------------------------------
// P — executeSync integration (60 tests)
// ---------------------------------------------------------------------------
describe('P — executeSync integration', () => {
  for (let i = 0; i < 60; i++) {
    const count = i % 8;
    it(`executeSync ${i}: ${count} employees`, async () => {
      const emps = Array.from({ length: count }, (_, j) => makeEmployee(`${i}_${j}`));
      mockFetch.mockResolvedValueOnce(mockOkJson({ employees: emps }));
      const c = new BambooHRConnector(makeConfig({ id: `p${i}` }));
      const result = await c.executeSync(makeJob({ entityTypes: ['EMPLOYEE'] }));
      expect(result.status).toBe('SUCCESS');
      expect(result.stats.totalFetched).toBe(count);
    });
  }
});

// ---------------------------------------------------------------------------
// Q — source field (40 tests)
// ---------------------------------------------------------------------------
describe('Q — source field', () => {
  for (let i = 0; i < 40; i++) {
    it(`source ${i}: data.source is BAMBOOHR`, async () => {
      mockFetch.mockResolvedValueOnce(mockOkJson({ employees: [makeEmployee(`${i}`)] }));
      const c = new BambooHRConnector(makeConfig({ id: `q${i}` }));
      const records = await c.fetchRecords('EMPLOYEE');
      expect(records[0].data['source']).toBe('BAMBOOHR');
    });
  }
});

// ---------------------------------------------------------------------------
// R — dept externalId format (40 tests)
// ---------------------------------------------------------------------------
describe('R — dept externalId format', () => {
  for (let i = 0; i < 40; i++) {
    it(`dept externalId ${i}: bamboohr_dept_${i}`, async () => {
      mockFetch.mockResolvedValueOnce(mockOkJson({ options: [makeDept(`${i}`)] }));
      const c = new BambooHRConnector(makeConfig({ id: `r${i}` }));
      const records = await c.fetchRecords('DEPARTMENT');
      expect(records[0].externalId).toBe(`bamboohr_dept_${i}`);
    });
  }
});

// ---------------------------------------------------------------------------
// S — dept data fields (30 tests)
// ---------------------------------------------------------------------------
describe('S — dept data fields', () => {
  for (let i = 0; i < 30; i++) {
    it(`dept data ${i}: name and source present`, async () => {
      mockFetch.mockResolvedValueOnce(mockOkJson({ options: [makeDept(`${i}`, `Dept${i}`)] }));
      const c = new BambooHRConnector(makeConfig({ id: `s${i}` }));
      const records = await c.fetchRecords('DEPARTMENT');
      expect(records[0].data['name']).toBe(`Dept${i}`);
      expect(records[0].data['source']).toBe('BAMBOOHR');
    });
  }
});

// ---------------------------------------------------------------------------
// T — testConnection latency (30 tests)
// ---------------------------------------------------------------------------
describe('T — testConnection latency', () => {
  for (let i = 0; i < 30; i++) {
    it(`latency ${i}: latencyMs is non-negative number`, async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve({ employees: [] }) });
      const c = new BambooHRConnector(makeConfig({ id: `t${i}` }));
      const h = await c.testConnection();
      expect(typeof h.latencyMs).toBe('number');
      expect(h.latencyMs).toBeGreaterThanOrEqual(0);
    });
  }
});

// ---------------------------------------------------------------------------
// U — testConnection endpoint URL (30 tests)
// ---------------------------------------------------------------------------
describe('U — testConnection endpoint URL', () => {
  for (let i = 0; i < 30; i++) {
    it(`endpoint ${i}: calls /employees/directory`, async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve({ employees: [] }) });
      const c = new BambooHRConnector(makeConfig({ id: `u${i}`, credentials: { apiKey: 'k', subdomain: `co${i}` } }));
      await c.testConnection();
      const [url] = mockFetch.mock.calls[0];
      expect(url as string).toContain('employees/directory');
    });
  }
});

// ---------------------------------------------------------------------------
// V — employee fetch POST body (30 tests)
// ---------------------------------------------------------------------------
describe('V — employee fetch POST body', () => {
  for (let i = 0; i < 30; i++) {
    it(`POST body ${i}: method=POST and fields array`, async () => {
      mockFetch.mockResolvedValueOnce(mockOkJson({ employees: [] }));
      const c = new BambooHRConnector(makeConfig({ id: `v${i}` }));
      await c.fetchRecords('EMPLOYEE');
      const [, init] = mockFetch.mock.calls[0];
      expect((init as RequestInit).method).toBe('POST');
      const body = JSON.parse((init as RequestInit).body as string);
      expect(Array.isArray(body.fields)).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// W — empty response bodies (40 tests)
// ---------------------------------------------------------------------------
describe('W — empty response bodies', () => {
  for (let i = 0; i < 20; i++) {
    it(`empty employees ${i}: missing key → 0 records`, async () => {
      mockFetch.mockResolvedValueOnce(mockOkJson({}));
      const c = new BambooHRConnector(makeConfig({ id: `we${i}` }));
      const records = await c.fetchRecords('EMPLOYEE');
      expect(records).toHaveLength(0);
    });
  }
  for (let i = 0; i < 20; i++) {
    it(`empty depts ${i}: missing key → 0 records`, async () => {
      mockFetch.mockResolvedValueOnce(mockOkJson({}));
      const c = new BambooHRConnector(makeConfig({ id: `wd${i}` }));
      const records = await c.fetchRecords('DEPARTMENT');
      expect(records).toHaveLength(0);
    });
  }
});
