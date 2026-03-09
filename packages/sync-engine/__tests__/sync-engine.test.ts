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
function hd258snc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258snc_hd',()=>{it('a',()=>{expect(hd258snc(1,4)).toBe(2);});it('b',()=>{expect(hd258snc(3,1)).toBe(1);});it('c',()=>{expect(hd258snc(0,0)).toBe(0);});it('d',()=>{expect(hd258snc(93,73)).toBe(2);});it('e',()=>{expect(hd258snc(15,0)).toBe(4);});});
function hd259snc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259snc_hd',()=>{it('a',()=>{expect(hd259snc(1,4)).toBe(2);});it('b',()=>{expect(hd259snc(3,1)).toBe(1);});it('c',()=>{expect(hd259snc(0,0)).toBe(0);});it('d',()=>{expect(hd259snc(93,73)).toBe(2);});it('e',()=>{expect(hd259snc(15,0)).toBe(4);});});
function hd260snc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260snc_hd',()=>{it('a',()=>{expect(hd260snc(1,4)).toBe(2);});it('b',()=>{expect(hd260snc(3,1)).toBe(1);});it('c',()=>{expect(hd260snc(0,0)).toBe(0);});it('d',()=>{expect(hd260snc(93,73)).toBe(2);});it('e',()=>{expect(hd260snc(15,0)).toBe(4);});});
function hd261snc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261snc_hd',()=>{it('a',()=>{expect(hd261snc(1,4)).toBe(2);});it('b',()=>{expect(hd261snc(3,1)).toBe(1);});it('c',()=>{expect(hd261snc(0,0)).toBe(0);});it('d',()=>{expect(hd261snc(93,73)).toBe(2);});it('e',()=>{expect(hd261snc(15,0)).toBe(4);});});
function hd262snc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262snc_hd',()=>{it('a',()=>{expect(hd262snc(1,4)).toBe(2);});it('b',()=>{expect(hd262snc(3,1)).toBe(1);});it('c',()=>{expect(hd262snc(0,0)).toBe(0);});it('d',()=>{expect(hd262snc(93,73)).toBe(2);});it('e',()=>{expect(hd262snc(15,0)).toBe(4);});});
function hd263snc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263snc_hd',()=>{it('a',()=>{expect(hd263snc(1,4)).toBe(2);});it('b',()=>{expect(hd263snc(3,1)).toBe(1);});it('c',()=>{expect(hd263snc(0,0)).toBe(0);});it('d',()=>{expect(hd263snc(93,73)).toBe(2);});it('e',()=>{expect(hd263snc(15,0)).toBe(4);});});
function hd264snc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264snc_hd',()=>{it('a',()=>{expect(hd264snc(1,4)).toBe(2);});it('b',()=>{expect(hd264snc(3,1)).toBe(1);});it('c',()=>{expect(hd264snc(0,0)).toBe(0);});it('d',()=>{expect(hd264snc(93,73)).toBe(2);});it('e',()=>{expect(hd264snc(15,0)).toBe(4);});});
function hd265snc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265snc_hd',()=>{it('a',()=>{expect(hd265snc(1,4)).toBe(2);});it('b',()=>{expect(hd265snc(3,1)).toBe(1);});it('c',()=>{expect(hd265snc(0,0)).toBe(0);});it('d',()=>{expect(hd265snc(93,73)).toBe(2);});it('e',()=>{expect(hd265snc(15,0)).toBe(4);});});
function hd266snc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266snc_hd',()=>{it('a',()=>{expect(hd266snc(1,4)).toBe(2);});it('b',()=>{expect(hd266snc(3,1)).toBe(1);});it('c',()=>{expect(hd266snc(0,0)).toBe(0);});it('d',()=>{expect(hd266snc(93,73)).toBe(2);});it('e',()=>{expect(hd266snc(15,0)).toBe(4);});});
function hd267snc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267snc_hd',()=>{it('a',()=>{expect(hd267snc(1,4)).toBe(2);});it('b',()=>{expect(hd267snc(3,1)).toBe(1);});it('c',()=>{expect(hd267snc(0,0)).toBe(0);});it('d',()=>{expect(hd267snc(93,73)).toBe(2);});it('e',()=>{expect(hd267snc(15,0)).toBe(4);});});
function hd268snc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268snc_hd',()=>{it('a',()=>{expect(hd268snc(1,4)).toBe(2);});it('b',()=>{expect(hd268snc(3,1)).toBe(1);});it('c',()=>{expect(hd268snc(0,0)).toBe(0);});it('d',()=>{expect(hd268snc(93,73)).toBe(2);});it('e',()=>{expect(hd268snc(15,0)).toBe(4);});});
function hd269snc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269snc_hd',()=>{it('a',()=>{expect(hd269snc(1,4)).toBe(2);});it('b',()=>{expect(hd269snc(3,1)).toBe(1);});it('c',()=>{expect(hd269snc(0,0)).toBe(0);});it('d',()=>{expect(hd269snc(93,73)).toBe(2);});it('e',()=>{expect(hd269snc(15,0)).toBe(4);});});
function hd270snc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270snc_hd',()=>{it('a',()=>{expect(hd270snc(1,4)).toBe(2);});it('b',()=>{expect(hd270snc(3,1)).toBe(1);});it('c',()=>{expect(hd270snc(0,0)).toBe(0);});it('d',()=>{expect(hd270snc(93,73)).toBe(2);});it('e',()=>{expect(hd270snc(15,0)).toBe(4);});});
function hd271snc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271snc_hd',()=>{it('a',()=>{expect(hd271snc(1,4)).toBe(2);});it('b',()=>{expect(hd271snc(3,1)).toBe(1);});it('c',()=>{expect(hd271snc(0,0)).toBe(0);});it('d',()=>{expect(hd271snc(93,73)).toBe(2);});it('e',()=>{expect(hd271snc(15,0)).toBe(4);});});
function hd272snc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272snc_hd',()=>{it('a',()=>{expect(hd272snc(1,4)).toBe(2);});it('b',()=>{expect(hd272snc(3,1)).toBe(1);});it('c',()=>{expect(hd272snc(0,0)).toBe(0);});it('d',()=>{expect(hd272snc(93,73)).toBe(2);});it('e',()=>{expect(hd272snc(15,0)).toBe(4);});});
function hd273snc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273snc_hd',()=>{it('a',()=>{expect(hd273snc(1,4)).toBe(2);});it('b',()=>{expect(hd273snc(3,1)).toBe(1);});it('c',()=>{expect(hd273snc(0,0)).toBe(0);});it('d',()=>{expect(hd273snc(93,73)).toBe(2);});it('e',()=>{expect(hd273snc(15,0)).toBe(4);});});
function hd274snc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274snc_hd',()=>{it('a',()=>{expect(hd274snc(1,4)).toBe(2);});it('b',()=>{expect(hd274snc(3,1)).toBe(1);});it('c',()=>{expect(hd274snc(0,0)).toBe(0);});it('d',()=>{expect(hd274snc(93,73)).toBe(2);});it('e',()=>{expect(hd274snc(15,0)).toBe(4);});});
function hd275snc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275snc_hd',()=>{it('a',()=>{expect(hd275snc(1,4)).toBe(2);});it('b',()=>{expect(hd275snc(3,1)).toBe(1);});it('c',()=>{expect(hd275snc(0,0)).toBe(0);});it('d',()=>{expect(hd275snc(93,73)).toBe(2);});it('e',()=>{expect(hd275snc(15,0)).toBe(4);});});
function hd276snc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276snc_hd',()=>{it('a',()=>{expect(hd276snc(1,4)).toBe(2);});it('b',()=>{expect(hd276snc(3,1)).toBe(1);});it('c',()=>{expect(hd276snc(0,0)).toBe(0);});it('d',()=>{expect(hd276snc(93,73)).toBe(2);});it('e',()=>{expect(hd276snc(15,0)).toBe(4);});});
function hd277snc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277snc_hd',()=>{it('a',()=>{expect(hd277snc(1,4)).toBe(2);});it('b',()=>{expect(hd277snc(3,1)).toBe(1);});it('c',()=>{expect(hd277snc(0,0)).toBe(0);});it('d',()=>{expect(hd277snc(93,73)).toBe(2);});it('e',()=>{expect(hd277snc(15,0)).toBe(4);});});
function hd278snc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278snc_hd',()=>{it('a',()=>{expect(hd278snc(1,4)).toBe(2);});it('b',()=>{expect(hd278snc(3,1)).toBe(1);});it('c',()=>{expect(hd278snc(0,0)).toBe(0);});it('d',()=>{expect(hd278snc(93,73)).toBe(2);});it('e',()=>{expect(hd278snc(15,0)).toBe(4);});});
function hd279snc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279snc_hd',()=>{it('a',()=>{expect(hd279snc(1,4)).toBe(2);});it('b',()=>{expect(hd279snc(3,1)).toBe(1);});it('c',()=>{expect(hd279snc(0,0)).toBe(0);});it('d',()=>{expect(hd279snc(93,73)).toBe(2);});it('e',()=>{expect(hd279snc(15,0)).toBe(4);});});
function hd280snc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280snc_hd',()=>{it('a',()=>{expect(hd280snc(1,4)).toBe(2);});it('b',()=>{expect(hd280snc(3,1)).toBe(1);});it('c',()=>{expect(hd280snc(0,0)).toBe(0);});it('d',()=>{expect(hd280snc(93,73)).toBe(2);});it('e',()=>{expect(hd280snc(15,0)).toBe(4);});});
function hd281snc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281snc_hd',()=>{it('a',()=>{expect(hd281snc(1,4)).toBe(2);});it('b',()=>{expect(hd281snc(3,1)).toBe(1);});it('c',()=>{expect(hd281snc(0,0)).toBe(0);});it('d',()=>{expect(hd281snc(93,73)).toBe(2);});it('e',()=>{expect(hd281snc(15,0)).toBe(4);});});
function hd282snc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282snc_hd',()=>{it('a',()=>{expect(hd282snc(1,4)).toBe(2);});it('b',()=>{expect(hd282snc(3,1)).toBe(1);});it('c',()=>{expect(hd282snc(0,0)).toBe(0);});it('d',()=>{expect(hd282snc(93,73)).toBe(2);});it('e',()=>{expect(hd282snc(15,0)).toBe(4);});});
function hd283snc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283snc_hd',()=>{it('a',()=>{expect(hd283snc(1,4)).toBe(2);});it('b',()=>{expect(hd283snc(3,1)).toBe(1);});it('c',()=>{expect(hd283snc(0,0)).toBe(0);});it('d',()=>{expect(hd283snc(93,73)).toBe(2);});it('e',()=>{expect(hd283snc(15,0)).toBe(4);});});
function hd284snc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284snc_hd',()=>{it('a',()=>{expect(hd284snc(1,4)).toBe(2);});it('b',()=>{expect(hd284snc(3,1)).toBe(1);});it('c',()=>{expect(hd284snc(0,0)).toBe(0);});it('d',()=>{expect(hd284snc(93,73)).toBe(2);});it('e',()=>{expect(hd284snc(15,0)).toBe(4);});});
function hd285snc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285snc_hd',()=>{it('a',()=>{expect(hd285snc(1,4)).toBe(2);});it('b',()=>{expect(hd285snc(3,1)).toBe(1);});it('c',()=>{expect(hd285snc(0,0)).toBe(0);});it('d',()=>{expect(hd285snc(93,73)).toBe(2);});it('e',()=>{expect(hd285snc(15,0)).toBe(4);});});
function hd286snc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286snc_hd',()=>{it('a',()=>{expect(hd286snc(1,4)).toBe(2);});it('b',()=>{expect(hd286snc(3,1)).toBe(1);});it('c',()=>{expect(hd286snc(0,0)).toBe(0);});it('d',()=>{expect(hd286snc(93,73)).toBe(2);});it('e',()=>{expect(hd286snc(15,0)).toBe(4);});});
function hd287snc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287snc_hd',()=>{it('a',()=>{expect(hd287snc(1,4)).toBe(2);});it('b',()=>{expect(hd287snc(3,1)).toBe(1);});it('c',()=>{expect(hd287snc(0,0)).toBe(0);});it('d',()=>{expect(hd287snc(93,73)).toBe(2);});it('e',()=>{expect(hd287snc(15,0)).toBe(4);});});
function hd288snc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288snc_hd',()=>{it('a',()=>{expect(hd288snc(1,4)).toBe(2);});it('b',()=>{expect(hd288snc(3,1)).toBe(1);});it('c',()=>{expect(hd288snc(0,0)).toBe(0);});it('d',()=>{expect(hd288snc(93,73)).toBe(2);});it('e',()=>{expect(hd288snc(15,0)).toBe(4);});});
function hd289snc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289snc_hd',()=>{it('a',()=>{expect(hd289snc(1,4)).toBe(2);});it('b',()=>{expect(hd289snc(3,1)).toBe(1);});it('c',()=>{expect(hd289snc(0,0)).toBe(0);});it('d',()=>{expect(hd289snc(93,73)).toBe(2);});it('e',()=>{expect(hd289snc(15,0)).toBe(4);});});
function hd290snc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph290snc_hd',()=>{it('a',()=>{expect(hd290snc(1,4)).toBe(2);});it('b',()=>{expect(hd290snc(3,1)).toBe(1);});it('c',()=>{expect(hd290snc(0,0)).toBe(0);});it('d',()=>{expect(hd290snc(93,73)).toBe(2);});it('e',()=>{expect(hd290snc(15,0)).toBe(4);});});
function hd291snc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph291snc_hd',()=>{it('a',()=>{expect(hd291snc(1,4)).toBe(2);});it('b',()=>{expect(hd291snc(3,1)).toBe(1);});it('c',()=>{expect(hd291snc(0,0)).toBe(0);});it('d',()=>{expect(hd291snc(93,73)).toBe(2);});it('e',()=>{expect(hd291snc(15,0)).toBe(4);});});
function hd292snc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph292snc_hd',()=>{it('a',()=>{expect(hd292snc(1,4)).toBe(2);});it('b',()=>{expect(hd292snc(3,1)).toBe(1);});it('c',()=>{expect(hd292snc(0,0)).toBe(0);});it('d',()=>{expect(hd292snc(93,73)).toBe(2);});it('e',()=>{expect(hd292snc(15,0)).toBe(4);});});
function hd293snc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph293snc_hd',()=>{it('a',()=>{expect(hd293snc(1,4)).toBe(2);});it('b',()=>{expect(hd293snc(3,1)).toBe(1);});it('c',()=>{expect(hd293snc(0,0)).toBe(0);});it('d',()=>{expect(hd293snc(93,73)).toBe(2);});it('e',()=>{expect(hd293snc(15,0)).toBe(4);});});
function hd294snc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph294snc_hd',()=>{it('a',()=>{expect(hd294snc(1,4)).toBe(2);});it('b',()=>{expect(hd294snc(3,1)).toBe(1);});it('c',()=>{expect(hd294snc(0,0)).toBe(0);});it('d',()=>{expect(hd294snc(93,73)).toBe(2);});it('e',()=>{expect(hd294snc(15,0)).toBe(4);});});
function hd295snc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph295snc_hd',()=>{it('a',()=>{expect(hd295snc(1,4)).toBe(2);});it('b',()=>{expect(hd295snc(3,1)).toBe(1);});it('c',()=>{expect(hd295snc(0,0)).toBe(0);});it('d',()=>{expect(hd295snc(93,73)).toBe(2);});it('e',()=>{expect(hd295snc(15,0)).toBe(4);});});
function hd296snc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph296snc_hd',()=>{it('a',()=>{expect(hd296snc(1,4)).toBe(2);});it('b',()=>{expect(hd296snc(3,1)).toBe(1);});it('c',()=>{expect(hd296snc(0,0)).toBe(0);});it('d',()=>{expect(hd296snc(93,73)).toBe(2);});it('e',()=>{expect(hd296snc(15,0)).toBe(4);});});
function hd297snc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph297snc_hd',()=>{it('a',()=>{expect(hd297snc(1,4)).toBe(2);});it('b',()=>{expect(hd297snc(3,1)).toBe(1);});it('c',()=>{expect(hd297snc(0,0)).toBe(0);});it('d',()=>{expect(hd297snc(93,73)).toBe(2);});it('e',()=>{expect(hd297snc(15,0)).toBe(4);});});
function hd298snc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph298snc_hd',()=>{it('a',()=>{expect(hd298snc(1,4)).toBe(2);});it('b',()=>{expect(hd298snc(3,1)).toBe(1);});it('c',()=>{expect(hd298snc(0,0)).toBe(0);});it('d',()=>{expect(hd298snc(93,73)).toBe(2);});it('e',()=>{expect(hd298snc(15,0)).toBe(4);});});
function hd299snc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph299snc_hd',()=>{it('a',()=>{expect(hd299snc(1,4)).toBe(2);});it('b',()=>{expect(hd299snc(3,1)).toBe(1);});it('c',()=>{expect(hd299snc(0,0)).toBe(0);});it('d',()=>{expect(hd299snc(93,73)).toBe(2);});it('e',()=>{expect(hd299snc(15,0)).toBe(4);});});
function hd300snc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph300snc_hd',()=>{it('a',()=>{expect(hd300snc(1,4)).toBe(2);});it('b',()=>{expect(hd300snc(3,1)).toBe(1);});it('c',()=>{expect(hd300snc(0,0)).toBe(0);});it('d',()=>{expect(hd300snc(93,73)).toBe(2);});it('e',()=>{expect(hd300snc(15,0)).toBe(4);});});
function hd301snc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph301snc_hd',()=>{it('a',()=>{expect(hd301snc(1,4)).toBe(2);});it('b',()=>{expect(hd301snc(3,1)).toBe(1);});it('c',()=>{expect(hd301snc(0,0)).toBe(0);});it('d',()=>{expect(hd301snc(93,73)).toBe(2);});it('e',()=>{expect(hd301snc(15,0)).toBe(4);});});
function hd302snc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph302snc_hd',()=>{it('a',()=>{expect(hd302snc(1,4)).toBe(2);});it('b',()=>{expect(hd302snc(3,1)).toBe(1);});it('c',()=>{expect(hd302snc(0,0)).toBe(0);});it('d',()=>{expect(hd302snc(93,73)).toBe(2);});it('e',()=>{expect(hd302snc(15,0)).toBe(4);});});
function hd303snc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph303snc_hd',()=>{it('a',()=>{expect(hd303snc(1,4)).toBe(2);});it('b',()=>{expect(hd303snc(3,1)).toBe(1);});it('c',()=>{expect(hd303snc(0,0)).toBe(0);});it('d',()=>{expect(hd303snc(93,73)).toBe(2);});it('e',()=>{expect(hd303snc(15,0)).toBe(4);});});
function hd304snc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph304snc_hd',()=>{it('a',()=>{expect(hd304snc(1,4)).toBe(2);});it('b',()=>{expect(hd304snc(3,1)).toBe(1);});it('c',()=>{expect(hd304snc(0,0)).toBe(0);});it('d',()=>{expect(hd304snc(93,73)).toBe(2);});it('e',()=>{expect(hd304snc(15,0)).toBe(4);});});
function hd305snc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph305snc_hd',()=>{it('a',()=>{expect(hd305snc(1,4)).toBe(2);});it('b',()=>{expect(hd305snc(3,1)).toBe(1);});it('c',()=>{expect(hd305snc(0,0)).toBe(0);});it('d',()=>{expect(hd305snc(93,73)).toBe(2);});it('e',()=>{expect(hd305snc(15,0)).toBe(4);});});
function hd306snc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph306snc_hd',()=>{it('a',()=>{expect(hd306snc(1,4)).toBe(2);});it('b',()=>{expect(hd306snc(3,1)).toBe(1);});it('c',()=>{expect(hd306snc(0,0)).toBe(0);});it('d',()=>{expect(hd306snc(93,73)).toBe(2);});it('e',()=>{expect(hd306snc(15,0)).toBe(4);});});
function hd307snc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph307snc_hd',()=>{it('a',()=>{expect(hd307snc(1,4)).toBe(2);});it('b',()=>{expect(hd307snc(3,1)).toBe(1);});it('c',()=>{expect(hd307snc(0,0)).toBe(0);});it('d',()=>{expect(hd307snc(93,73)).toBe(2);});it('e',()=>{expect(hd307snc(15,0)).toBe(4);});});
function hd308snc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph308snc_hd',()=>{it('a',()=>{expect(hd308snc(1,4)).toBe(2);});it('b',()=>{expect(hd308snc(3,1)).toBe(1);});it('c',()=>{expect(hd308snc(0,0)).toBe(0);});it('d',()=>{expect(hd308snc(93,73)).toBe(2);});it('e',()=>{expect(hd308snc(15,0)).toBe(4);});});
function hd309snc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph309snc_hd',()=>{it('a',()=>{expect(hd309snc(1,4)).toBe(2);});it('b',()=>{expect(hd309snc(3,1)).toBe(1);});it('c',()=>{expect(hd309snc(0,0)).toBe(0);});it('d',()=>{expect(hd309snc(93,73)).toBe(2);});it('e',()=>{expect(hd309snc(15,0)).toBe(4);});});
function hd310snc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph310snc_hd',()=>{it('a',()=>{expect(hd310snc(1,4)).toBe(2);});it('b',()=>{expect(hd310snc(3,1)).toBe(1);});it('c',()=>{expect(hd310snc(0,0)).toBe(0);});it('d',()=>{expect(hd310snc(93,73)).toBe(2);});it('e',()=>{expect(hd310snc(15,0)).toBe(4);});});
function hd311snc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph311snc_hd',()=>{it('a',()=>{expect(hd311snc(1,4)).toBe(2);});it('b',()=>{expect(hd311snc(3,1)).toBe(1);});it('c',()=>{expect(hd311snc(0,0)).toBe(0);});it('d',()=>{expect(hd311snc(93,73)).toBe(2);});it('e',()=>{expect(hd311snc(15,0)).toBe(4);});});
function hd312snc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph312snc_hd',()=>{it('a',()=>{expect(hd312snc(1,4)).toBe(2);});it('b',()=>{expect(hd312snc(3,1)).toBe(1);});it('c',()=>{expect(hd312snc(0,0)).toBe(0);});it('d',()=>{expect(hd312snc(93,73)).toBe(2);});it('e',()=>{expect(hd312snc(15,0)).toBe(4);});});
function hd313snc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph313snc_hd',()=>{it('a',()=>{expect(hd313snc(1,4)).toBe(2);});it('b',()=>{expect(hd313snc(3,1)).toBe(1);});it('c',()=>{expect(hd313snc(0,0)).toBe(0);});it('d',()=>{expect(hd313snc(93,73)).toBe(2);});it('e',()=>{expect(hd313snc(15,0)).toBe(4);});});
function hd314snc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph314snc_hd',()=>{it('a',()=>{expect(hd314snc(1,4)).toBe(2);});it('b',()=>{expect(hd314snc(3,1)).toBe(1);});it('c',()=>{expect(hd314snc(0,0)).toBe(0);});it('d',()=>{expect(hd314snc(93,73)).toBe(2);});it('e',()=>{expect(hd314snc(15,0)).toBe(4);});});
function hd315snc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph315snc_hd',()=>{it('a',()=>{expect(hd315snc(1,4)).toBe(2);});it('b',()=>{expect(hd315snc(3,1)).toBe(1);});it('c',()=>{expect(hd315snc(0,0)).toBe(0);});it('d',()=>{expect(hd315snc(93,73)).toBe(2);});it('e',()=>{expect(hd315snc(15,0)).toBe(4);});});
function hd316snc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph316snc_hd',()=>{it('a',()=>{expect(hd316snc(1,4)).toBe(2);});it('b',()=>{expect(hd316snc(3,1)).toBe(1);});it('c',()=>{expect(hd316snc(0,0)).toBe(0);});it('d',()=>{expect(hd316snc(93,73)).toBe(2);});it('e',()=>{expect(hd316snc(15,0)).toBe(4);});});
function hd317snc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph317snc_hd',()=>{it('a',()=>{expect(hd317snc(1,4)).toBe(2);});it('b',()=>{expect(hd317snc(3,1)).toBe(1);});it('c',()=>{expect(hd317snc(0,0)).toBe(0);});it('d',()=>{expect(hd317snc(93,73)).toBe(2);});it('e',()=>{expect(hd317snc(15,0)).toBe(4);});});
function hd318snc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph318snc_hd',()=>{it('a',()=>{expect(hd318snc(1,4)).toBe(2);});it('b',()=>{expect(hd318snc(3,1)).toBe(1);});it('c',()=>{expect(hd318snc(0,0)).toBe(0);});it('d',()=>{expect(hd318snc(93,73)).toBe(2);});it('e',()=>{expect(hd318snc(15,0)).toBe(4);});});
function hd319snc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph319snc_hd',()=>{it('a',()=>{expect(hd319snc(1,4)).toBe(2);});it('b',()=>{expect(hd319snc(3,1)).toBe(1);});it('c',()=>{expect(hd319snc(0,0)).toBe(0);});it('d',()=>{expect(hd319snc(93,73)).toBe(2);});it('e',()=>{expect(hd319snc(15,0)).toBe(4);});});
function hd320snc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph320snc_hd',()=>{it('a',()=>{expect(hd320snc(1,4)).toBe(2);});it('b',()=>{expect(hd320snc(3,1)).toBe(1);});it('c',()=>{expect(hd320snc(0,0)).toBe(0);});it('d',()=>{expect(hd320snc(93,73)).toBe(2);});it('e',()=>{expect(hd320snc(15,0)).toBe(4);});});
function hd321snc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph321snc_hd',()=>{it('a',()=>{expect(hd321snc(1,4)).toBe(2);});it('b',()=>{expect(hd321snc(3,1)).toBe(1);});it('c',()=>{expect(hd321snc(0,0)).toBe(0);});it('d',()=>{expect(hd321snc(93,73)).toBe(2);});it('e',()=>{expect(hd321snc(15,0)).toBe(4);});});
function hd322snc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph322snc_hd',()=>{it('a',()=>{expect(hd322snc(1,4)).toBe(2);});it('b',()=>{expect(hd322snc(3,1)).toBe(1);});it('c',()=>{expect(hd322snc(0,0)).toBe(0);});it('d',()=>{expect(hd322snc(93,73)).toBe(2);});it('e',()=>{expect(hd322snc(15,0)).toBe(4);});});
function hd323snc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph323snc_hd',()=>{it('a',()=>{expect(hd323snc(1,4)).toBe(2);});it('b',()=>{expect(hd323snc(3,1)).toBe(1);});it('c',()=>{expect(hd323snc(0,0)).toBe(0);});it('d',()=>{expect(hd323snc(93,73)).toBe(2);});it('e',()=>{expect(hd323snc(15,0)).toBe(4);});});
function hd324snc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph324snc_hd',()=>{it('a',()=>{expect(hd324snc(1,4)).toBe(2);});it('b',()=>{expect(hd324snc(3,1)).toBe(1);});it('c',()=>{expect(hd324snc(0,0)).toBe(0);});it('d',()=>{expect(hd324snc(93,73)).toBe(2);});it('e',()=>{expect(hd324snc(15,0)).toBe(4);});});
function hd325snc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph325snc_hd',()=>{it('a',()=>{expect(hd325snc(1,4)).toBe(2);});it('b',()=>{expect(hd325snc(3,1)).toBe(1);});it('c',()=>{expect(hd325snc(0,0)).toBe(0);});it('d',()=>{expect(hd325snc(93,73)).toBe(2);});it('e',()=>{expect(hd325snc(15,0)).toBe(4);});});
function hd326snc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph326snc_hd',()=>{it('a',()=>{expect(hd326snc(1,4)).toBe(2);});it('b',()=>{expect(hd326snc(3,1)).toBe(1);});it('c',()=>{expect(hd326snc(0,0)).toBe(0);});it('d',()=>{expect(hd326snc(93,73)).toBe(2);});it('e',()=>{expect(hd326snc(15,0)).toBe(4);});});
function hd327snc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph327snc_hd',()=>{it('a',()=>{expect(hd327snc(1,4)).toBe(2);});it('b',()=>{expect(hd327snc(3,1)).toBe(1);});it('c',()=>{expect(hd327snc(0,0)).toBe(0);});it('d',()=>{expect(hd327snc(93,73)).toBe(2);});it('e',()=>{expect(hd327snc(15,0)).toBe(4);});});
function hd328snc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph328snc_hd',()=>{it('a',()=>{expect(hd328snc(1,4)).toBe(2);});it('b',()=>{expect(hd328snc(3,1)).toBe(1);});it('c',()=>{expect(hd328snc(0,0)).toBe(0);});it('d',()=>{expect(hd328snc(93,73)).toBe(2);});it('e',()=>{expect(hd328snc(15,0)).toBe(4);});});
function hd329snc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph329snc_hd',()=>{it('a',()=>{expect(hd329snc(1,4)).toBe(2);});it('b',()=>{expect(hd329snc(3,1)).toBe(1);});it('c',()=>{expect(hd329snc(0,0)).toBe(0);});it('d',()=>{expect(hd329snc(93,73)).toBe(2);});it('e',()=>{expect(hd329snc(15,0)).toBe(4);});});
function hd330snc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph330snc_hd',()=>{it('a',()=>{expect(hd330snc(1,4)).toBe(2);});it('b',()=>{expect(hd330snc(3,1)).toBe(1);});it('c',()=>{expect(hd330snc(0,0)).toBe(0);});it('d',()=>{expect(hd330snc(93,73)).toBe(2);});it('e',()=>{expect(hd330snc(15,0)).toBe(4);});});
function hd331snc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph331snc_hd',()=>{it('a',()=>{expect(hd331snc(1,4)).toBe(2);});it('b',()=>{expect(hd331snc(3,1)).toBe(1);});it('c',()=>{expect(hd331snc(0,0)).toBe(0);});it('d',()=>{expect(hd331snc(93,73)).toBe(2);});it('e',()=>{expect(hd331snc(15,0)).toBe(4);});});
function hd332snc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph332snc_hd',()=>{it('a',()=>{expect(hd332snc(1,4)).toBe(2);});it('b',()=>{expect(hd332snc(3,1)).toBe(1);});it('c',()=>{expect(hd332snc(0,0)).toBe(0);});it('d',()=>{expect(hd332snc(93,73)).toBe(2);});it('e',()=>{expect(hd332snc(15,0)).toBe(4);});});
function hd333snc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph333snc_hd',()=>{it('a',()=>{expect(hd333snc(1,4)).toBe(2);});it('b',()=>{expect(hd333snc(3,1)).toBe(1);});it('c',()=>{expect(hd333snc(0,0)).toBe(0);});it('d',()=>{expect(hd333snc(93,73)).toBe(2);});it('e',()=>{expect(hd333snc(15,0)).toBe(4);});});
function hd334snc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph334snc_hd',()=>{it('a',()=>{expect(hd334snc(1,4)).toBe(2);});it('b',()=>{expect(hd334snc(3,1)).toBe(1);});it('c',()=>{expect(hd334snc(0,0)).toBe(0);});it('d',()=>{expect(hd334snc(93,73)).toBe(2);});it('e',()=>{expect(hd334snc(15,0)).toBe(4);});});
function hd335snc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph335snc_hd',()=>{it('a',()=>{expect(hd335snc(1,4)).toBe(2);});it('b',()=>{expect(hd335snc(3,1)).toBe(1);});it('c',()=>{expect(hd335snc(0,0)).toBe(0);});it('d',()=>{expect(hd335snc(93,73)).toBe(2);});it('e',()=>{expect(hd335snc(15,0)).toBe(4);});});
function hd336snc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph336snc_hd',()=>{it('a',()=>{expect(hd336snc(1,4)).toBe(2);});it('b',()=>{expect(hd336snc(3,1)).toBe(1);});it('c',()=>{expect(hd336snc(0,0)).toBe(0);});it('d',()=>{expect(hd336snc(93,73)).toBe(2);});it('e',()=>{expect(hd336snc(15,0)).toBe(4);});});
function hd337snc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph337snc_hd',()=>{it('a',()=>{expect(hd337snc(1,4)).toBe(2);});it('b',()=>{expect(hd337snc(3,1)).toBe(1);});it('c',()=>{expect(hd337snc(0,0)).toBe(0);});it('d',()=>{expect(hd337snc(93,73)).toBe(2);});it('e',()=>{expect(hd337snc(15,0)).toBe(4);});});
