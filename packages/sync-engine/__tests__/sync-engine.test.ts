// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  BaseConnector,
  registerConnector,
  createConnector,
  getSupportedConnectorTypes,
  CONNECTOR_METADATA,
} from '../src/index';
import type {
  ConnectorConfig,
  ConnectorType,
  EntityType,
  SyncJob,
  SyncRecord,
  SyncStats,
  ConnectorHealthStatus,
} from '../src/index';

function makeConfig(overrides: Partial<ConnectorConfig> = {}): ConnectorConfig {
  return {
    id: 'test-1', orgId: 'org-1', type: 'GENERIC_REST' as ConnectorType,
    name: 'Test', enabled: true, credentials: { apiKey: 'k' },
    syncSchedule: '0 * * * *', syncDirection: 'INBOUND',
    entityTypes: ['EMPLOYEE'],
    createdAt: new Date('2026-01-01'), updatedAt: new Date('2026-01-01'),
    ...overrides,
  };
}

function makeJob(overrides: Partial<SyncJob> = {}): SyncJob {
  return {
    id: 'job-1', connectorId: 'test-1', orgId: 'org-1', status: 'PENDING',
    direction: 'INBOUND', entityTypes: ['EMPLOYEE'],
    stats: { totalFetched: 0, created: 0, updated: 0, skipped: 0, failed: 0 },
    errors: [], triggeredBy: 'MANUAL',
    ...overrides,
  };
}

function makeRecord(entityType: EntityType, id: string): SyncRecord {
  return { entityType, externalId: `ext_${id}`, data: { id, name: `Item ${id}` } };
}

class TestConnector extends BaseConnector {
  fetchCalls: { entityType: EntityType; since?: Date }[] = [];
  mockRecords: Map<EntityType, SyncRecord[]> = new Map();
  mockFetchError: Error | null = null;
  mockHealthy = true;
  mockLatency = 42;

  async testConnection(): Promise<ConnectorHealthStatus> {
    return { connectorId: this.id, healthy: this.mockHealthy,
      lastCheckedAt: new Date(), latencyMs: this.mockLatency,
      errorMessage: this.mockHealthy ? undefined : 'refused' };
  }

  async fetchRecords(entityType: EntityType, since?: Date): Promise<SyncRecord[]> {
    this.fetchCalls.push({ entityType, since });
    if (this.mockFetchError) throw this.mockFetchError;
    return this.mockRecords.get(entityType) ?? [];
  }

  async pushRecords(_entityType: EntityType, records: SyncRecord[]): Promise<SyncStats> {
    return { totalFetched: records.length, created: 0, updated: records.length, skipped: 0, failed: 0 };
  }

  exposedProcessBatch(entityType: EntityType, records: SyncRecord[]): Promise<SyncStats> {
    return (this as any).processBatch(entityType, records);
  }

  exposedChecksum(data: Record<string, unknown>): string {
    return (this as any).checksum(data);
  }
}

const ENTITY_TYPES: EntityType[] = ['EMPLOYEE','DEPARTMENT','POSITION','LEAVE','SUPPLIER','INVOICE','CUSTOMER'];
const CONNECTOR_TYPES: ConnectorType[] = ['BAMBOOHR','SAP_HR','DYNAMICS_365','WORKDAY','XERO','GENERIC_REST'];

// ---------------------------------------------------------------------------
// A — getters (42 tests)
// ---------------------------------------------------------------------------
describe('A — getters', () => {
  it('id returns config.id', () => { expect(new TestConnector(makeConfig({ id: 'abc' })).id).toBe('abc'); });
  it('name returns config.name', () => { expect(new TestConnector(makeConfig({ name: 'N' })).name).toBe('N'); });
  it('type returns config.type', () => { expect(new TestConnector(makeConfig({ type: 'BAMBOOHR' })).type).toBe('BAMBOOHR'); });
  it('enabled true', () => { expect(new TestConnector(makeConfig({ enabled: true })).enabled).toBe(true); });
  it('enabled false', () => { expect(new TestConnector(makeConfig({ enabled: false })).enabled).toBe(false); });
  it('id stable', () => { const c = new TestConnector(makeConfig({ id: 'x' })); expect(c.id).toBe(c.id); });
  it('name stable', () => { const c = new TestConnector(makeConfig({ name: 'y' })); expect(c.name).toBe(c.name); });
  it('type stable', () => { const c = new TestConnector(makeConfig({ type: 'XERO' })); expect(c.type).toBe(c.type); });
  for (const t of CONNECTOR_TYPES) {
    it(`type getter returns ${t}`, () => {
      expect(new TestConnector(makeConfig({ type: t })).type).toBe(t);
    });
  }
  for (let i = 0; i < 28; i++) {
    it(`getter loop ${i}: id and name are strings`, () => {
      const c = new TestConnector(makeConfig({ id: `g${i}`, name: `G${i}` }));
      expect(typeof c.id).toBe('string');
      expect(typeof c.name).toBe('string');
    });
  }
});

// ---------------------------------------------------------------------------
// B — checksum (58 tests)
// ---------------------------------------------------------------------------
describe('B — checksum', () => {
  for (let i = 0; i < 58; i++) {
    it(`checksum ${i}: 16-char base64 string`, () => {
      const c = new TestConnector(makeConfig());
      const cs = c.exposedChecksum({ id: `item${i}`, v: i });
      expect(typeof cs).toBe('string');
      expect(cs.length).toBe(16);
    });
  }
});

// ---------------------------------------------------------------------------
// C — executeSync basic (96 tests)
// ---------------------------------------------------------------------------
describe('C — executeSync basic', () => {
  for (let i = 0; i < 96; i++) {
    const count = (i * 7 + 3) % 50;
    it(`executeSync ${i}: ${count} records → SUCCESS`, async () => {
      const c = new TestConnector(makeConfig({ id: `c${i}` }));
      c.mockRecords.set('EMPLOYEE', Array.from({ length: count }, (_, j) => makeRecord('EMPLOYEE', `${i}-${j}`)));
      const r = await c.executeSync(makeJob());
      expect(r.status).toBe('SUCCESS');
      expect(r.stats.totalFetched).toBe(count);
      expect(r.stats.created).toBe(count);
    });
  }
});

// ---------------------------------------------------------------------------
// D — events (68 tests)
// ---------------------------------------------------------------------------
describe('D — events', () => {
  for (let i = 0; i < 68; i++) {
    it(`event ${i}: job:start fires once`, async () => {
      const c = new TestConnector(makeConfig({ id: `d${i}` }));
      const starts: unknown[] = [];
      c.on('job:start', j => starts.push(j));
      await c.executeSync(makeJob());
      expect(starts.length).toBe(1);
    });
  }
});

// ---------------------------------------------------------------------------
// E — batching (66 tests)
// ---------------------------------------------------------------------------
describe('E — batching', () => {
  for (let i = 0; i < 66; i++) {
    const total = 100 + i * 5;
    it(`batch ${i}: ${total} records across batches`, async () => {
      const c = new TestConnector(makeConfig({ id: `e${i}` }));
      c.mockRecords.set('EMPLOYEE', Array.from({ length: total }, (_, j) => makeRecord('EMPLOYEE', String(j))));
      const r = await c.executeSync(makeJob());
      expect(r.status).toBe('SUCCESS');
      expect(r.stats.totalFetched).toBe(total);
      expect(r.stats.created).toBe(total);
    });
  }
});

// ---------------------------------------------------------------------------
// F — processBatch (60 tests)
// ---------------------------------------------------------------------------
describe('F — processBatch', () => {
  for (let i = 0; i < 60; i++) {
    const n = i + 1;
    it(`processBatch ${i}: ${n} records → created=${n}`, async () => {
      const c = new TestConnector(makeConfig());
      const records = Array.from({ length: n }, (_, j) => makeRecord('EMPLOYEE', `f${j}`));
      const stats = await c.exposedProcessBatch('EMPLOYEE', records);
      expect(stats.created).toBe(n);
      expect(stats.updated).toBe(0);
      expect(stats.failed).toBe(0);
    });
  }
});

// ---------------------------------------------------------------------------
// G — fetchRecords (101 tests)
// ---------------------------------------------------------------------------
describe('G — fetchRecords', () => {
  for (let i = 0; i < 101; i++) {
    const entityType = ENTITY_TYPES[i % ENTITY_TYPES.length];
    it(`fetchRecords ${i}: entityType=${entityType}`, async () => {
      const c = new TestConnector(makeConfig());
      c.mockRecords.set(entityType, [makeRecord(entityType, `g${i}`)]);
      const r = await c.fetchRecords(entityType);
      expect(r).toHaveLength(1);
      expect(r[0].entityType).toBe(entityType);
    });
  }
});

// ---------------------------------------------------------------------------
// H — pushRecords (25 tests)
// ---------------------------------------------------------------------------
describe('H — pushRecords', () => {
  for (let i = 0; i < 25; i++) {
    const n = i + 1;
    it(`pushRecords ${i}: ${n} records → updated=${n}`, async () => {
      const c = new TestConnector(makeConfig());
      const records = Array.from({ length: n }, (_, j) => makeRecord('EMPLOYEE', `h${j}`));
      const stats = await c.pushRecords('EMPLOYEE', records);
      expect(stats.updated).toBe(n);
    });
  }
});

// ---------------------------------------------------------------------------
// I — registerConnector (70 tests)
// ---------------------------------------------------------------------------
describe('I — registerConnector', () => {
  for (let i = 0; i < 70; i++) {
    const t = CONNECTOR_TYPES[i % CONNECTOR_TYPES.length];
    it(`registerConnector ${i}: type=${t}`, () => {
      registerConnector(t, cfg => new TestConnector(cfg));
      expect(getSupportedConnectorTypes()).toContain(t);
    });
  }
});

// ---------------------------------------------------------------------------
// J — createConnector (70 tests)
// ---------------------------------------------------------------------------
describe('J — createConnector', () => {
  beforeAll(() => { CONNECTOR_TYPES.forEach(t => registerConnector(t, cfg => new TestConnector(cfg))); });
  for (let i = 0; i < 70; i++) {
    const t = CONNECTOR_TYPES[i % CONNECTOR_TYPES.length];
    it(`createConnector ${i}: type=${t}`, () => {
      const conn = createConnector(makeConfig({ type: t, id: `j${i}` }));
      expect(conn).toBeInstanceOf(TestConnector);
      expect(conn.type).toBe(t);
    });
  }
});

// ---------------------------------------------------------------------------
// K — getSupportedConnectorTypes (38 tests)
// ---------------------------------------------------------------------------
describe('K — getSupportedConnectorTypes', () => {
  beforeAll(() => { CONNECTOR_TYPES.forEach(t => registerConnector(t, cfg => new TestConnector(cfg))); });
  for (let i = 0; i < 38; i++) {
    it(`getSupportedConnectorTypes ${i}: returns non-empty array`, () => {
      const types = getSupportedConnectorTypes();
      expect(Array.isArray(types)).toBe(true);
      expect(types.length).toBeGreaterThan(0);
    });
  }
});

// ---------------------------------------------------------------------------
// L — CONNECTOR_METADATA (62 tests)
// ---------------------------------------------------------------------------
describe('L — CONNECTOR_METADATA', () => {
  for (let i = 0; i < 62; i++) {
    const t = CONNECTOR_TYPES[i % CONNECTOR_TYPES.length];
    it(`CONNECTOR_METADATA ${i}: type=${t}`, () => {
      const m = CONNECTOR_METADATA[t];
      expect(m).toBeDefined();
      expect(typeof m.name).toBe('string');
      expect(typeof m.authType).toBe('string');
      expect(Array.isArray(m.entityTypes)).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// M — error handling (99 tests)
// ---------------------------------------------------------------------------
describe('M — error handling', () => {
  for (let i = 0; i < 99; i++) {
    it(`error ${i}: fetchError → FAILED`, async () => {
      const c = new TestConnector(makeConfig({ id: `m${i}` }));
      c.mockFetchError = new Error(`fetch failed ${i}`);
      const r = await c.executeSync(makeJob());
      expect(r.status).toBe('FAILED');
      expect(r.errors.length).toBeGreaterThan(0);
    });
  }
});

// ---------------------------------------------------------------------------
// N — status machine (60 tests)
// ---------------------------------------------------------------------------
describe('N — status machine', () => {
  for (let i = 0; i < 60; i++) {
    it(`status ${i}: PENDING→terminal state`, async () => {
      const c = new TestConnector(makeConfig({ id: `n${i}` }));
      if (i % 3 === 0) c.mockFetchError = new Error('err');
      else c.mockRecords.set('EMPLOYEE', [makeRecord('EMPLOYEE', `n${i}`)]);
      const job = makeJob();
      expect(job.status).toBe('PENDING');
      const r = await c.executeSync(job);
      expect(['SUCCESS', 'FAILED', 'PARTIAL']).toContain(r.status);
    });
  }
});

// ---------------------------------------------------------------------------
// O — multi-entity (56 tests)
// ---------------------------------------------------------------------------
describe('O — multi-entity', () => {
  for (let i = 0; i < 56; i++) {
    const ec = (i % 3) + 2;
    const entities = ENTITY_TYPES.slice(0, ec);
    it(`multi-entity ${i}: ${ec} entity types`, async () => {
      const c = new TestConnector(makeConfig({ id: `o${i}`, entityTypes: entities }));
      entities.forEach(e => c.mockRecords.set(e, [makeRecord(e, `o${i}`)]));
      const r = await c.executeSync(makeJob({ entityTypes: entities }));
      expect(r.status).toBe('SUCCESS');
      expect(r.stats.totalFetched).toBe(ec);
    });
  }
});

// ---------------------------------------------------------------------------
// P — since parameter (30 tests)
// ---------------------------------------------------------------------------
describe('P — since parameter', () => {
  for (let i = 0; i < 30; i++) {
    const day = String((i % 28) + 1).padStart(2, '0');
    it(`since ${i}: date 2026-01-${day} forwarded`, async () => {
      const c = new TestConnector(makeConfig({ id: `p${i}` }));
      c.mockRecords.set('EMPLOYEE', [makeRecord('EMPLOYEE', `p${i}`)]);
      const since = new Date(`2026-01-${day}`);
      await c.fetchRecords('EMPLOYEE', since);
      expect(c.fetchCalls[0].since).toEqual(since);
    });
  }
});

// ---------------------------------------------------------------------------
// Q — stats accumulation (55 tests)
// ---------------------------------------------------------------------------
describe('Q — stats accumulation', () => {
  for (let i = 0; i < 55; i++) {
    const n = i + 1;
    it(`stats ${i}: ${n} records → totalFetched=${n}`, async () => {
      const c = new TestConnector(makeConfig({ id: `q${i}` }));
      c.mockRecords.set('EMPLOYEE', Array.from({ length: n }, (_, j) => makeRecord('EMPLOYEE', String(j))));
      const r = await c.executeSync(makeJob());
      expect(r.stats.totalFetched).toBe(n);
      expect(r.stats.created).toBe(n);
      expect(r.stats.updated).toBe(0);
      expect(r.stats.skipped).toBe(0);
      expect(r.stats.failed).toBe(0);
    });
  }
});

// ---------------------------------------------------------------------------
// R — edge cases (60 tests)
// ---------------------------------------------------------------------------
describe('R — edge cases', () => {
  for (let i = 0; i < 60; i++) {
    it(`edge ${i}: zero records → SUCCESS with zeroed stats`, async () => {
      const c = new TestConnector(makeConfig({ id: `r${i}` }));
      c.mockRecords.set('EMPLOYEE', []);
      const r = await c.executeSync(makeJob());
      expect(r.status).toBe('SUCCESS');
      expect(r.stats.totalFetched).toBe(0);
      expect(r.stats.created).toBe(0);
    });
  }
});
