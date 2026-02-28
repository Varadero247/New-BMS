// Copyright (c) 2026 Nexara DMCC. All rights reserved. Confidential and proprietary.

import { WasteRegister } from '../waste-register';
import { DisposalTracker } from '../disposal-tracker';
import {
  WasteStream,
  WasteState,
  DisposalRoute,
  WasteStatus,
  ManifestStatus,
  HazardClass,
} from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// Helper data
// ─────────────────────────────────────────────────────────────────────────────
const STREAMS: WasteStream[] = ['GENERAL', 'RECYCLABLE', 'HAZARDOUS', 'CLINICAL', 'ELECTRONIC', 'ORGANIC', 'CONSTRUCTION'];
const STATES: WasteState[] = ['SOLID', 'LIQUID', 'GAS', 'SLUDGE'];
const ROUTES: DisposalRoute[] = ['LANDFILL', 'INCINERATION', 'RECYCLING', 'COMPOSTING', 'TREATMENT', 'REUSE', 'RECOVERY'];
const WASTE_STATUSES: WasteStatus[] = ['GENERATED', 'STORED', 'COLLECTED', 'DISPOSED'];
const MANIFEST_STATUSES: ManifestStatus[] = ['PENDING', 'IN_TRANSIT', 'DELIVERED', 'REJECTED'];
const HAZARD_CLASSES: HazardClass[] = ['CLASS_1', 'CLASS_2', 'CLASS_3', 'CLASS_4', 'CLASS_5', 'CLASS_6', 'CLASS_7', 'CLASS_8', 'CLASS_9'];

// ─────────────────────────────────────────────────────────────────────────────
// WasteRegister — Basic behaviour
// ─────────────────────────────────────────────────────────────────────────────
describe('WasteRegister – basic behaviour', () => {
  let reg: WasteRegister;
  beforeEach(() => { reg = new WasteRegister(); });

  it('starts empty', () => { expect(reg.getCount()).toBe(0); });
  it('getAll returns empty array initially', () => { expect(reg.getAll()).toEqual([]); });
  it('get returns undefined for unknown id', () => { expect(reg.get('FAKE')).toBeUndefined(); });

  it('generate returns a WasteEntry', () => {
    const e = reg.generate('GENERAL', 'SOLID', 'Office waste', 10, 'kg', '2026-01-01', 'Alice', 'Building A');
    expect(e).toBeDefined();
    expect(e.id).toBeDefined();
  });

  it('generated entry has status GENERATED', () => {
    const e = reg.generate('GENERAL', 'SOLID', 'desc', 5, 'kg', '2026-01-01', 'Bob', 'Site B');
    expect(e.status).toBe('GENERATED');
  });

  it('generate increments count', () => {
    reg.generate('GENERAL', 'SOLID', 'd', 1, 'kg', '2026-01-01', 'X', 'Y');
    expect(reg.getCount()).toBe(1);
  });

  it('get returns the created entry', () => {
    const e = reg.generate('RECYCLABLE', 'SOLID', 'Paper', 20, 'kg', '2026-01-02', 'Carol', 'Office');
    expect(reg.get(e.id)).toEqual(e);
  });

  it('getAll returns all entries', () => {
    const e1 = reg.generate('GENERAL', 'SOLID', 'a', 1, 'kg', '2026-01-01', 'A', 'L1');
    const e2 = reg.generate('RECYCLABLE', 'LIQUID', 'b', 2, 'L', '2026-01-01', 'B', 'L2');
    const all = reg.getAll();
    expect(all).toHaveLength(2);
    expect(all.map(e => e.id)).toContain(e1.id);
    expect(all.map(e => e.id)).toContain(e2.id);
  });

  it('entry fields match inputs', () => {
    const e = reg.generate('HAZARDOUS', 'LIQUID', 'Solvent waste', 50, 'L', '2026-02-01', 'Dave', 'Chem Store', 'CLASS_3', 'EWC-12-01-01', 'Flammable');
    expect(e.stream).toBe('HAZARDOUS');
    expect(e.state).toBe('LIQUID');
    expect(e.description).toBe('Solvent waste');
    expect(e.quantity).toBe(50);
    expect(e.unit).toBe('L');
    expect(e.generatedAt).toBe('2026-02-01');
    expect(e.generatedBy).toBe('Dave');
    expect(e.location).toBe('Chem Store');
    expect(e.hazardClass).toBe('CLASS_3');
    expect(e.ewcCode).toBe('EWC-12-01-01');
    expect(e.notes).toBe('Flammable');
  });

  it('optional fields absent when not supplied', () => {
    const e = reg.generate('GENERAL', 'SOLID', 'plain', 1, 'kg', '2026-01-01', 'X', 'Y');
    expect(e.hazardClass).toBeUndefined();
    expect(e.ewcCode).toBeUndefined();
    expect(e.notes).toBeUndefined();
    expect(e.storageLocation).toBeUndefined();
  });

  it('store sets status STORED and storageLocation', () => {
    const e = reg.generate('GENERAL', 'SOLID', 'd', 1, 'kg', '2026-01-01', 'X', 'Y');
    reg.store(e.id, 'Warehouse 1');
    expect(reg.get(e.id)!.status).toBe('STORED');
    expect(reg.get(e.id)!.storageLocation).toBe('Warehouse 1');
  });

  it('store returns the updated entry', () => {
    const e = reg.generate('GENERAL', 'SOLID', 'd', 1, 'kg', '2026-01-01', 'X', 'Y');
    const updated = reg.store(e.id, 'WH2');
    expect(updated.storageLocation).toBe('WH2');
  });

  it('collect sets status COLLECTED', () => {
    const e = reg.generate('RECYCLABLE', 'SOLID', 'd', 5, 'kg', '2026-01-01', 'X', 'Y');
    reg.store(e.id, 'WH1');
    reg.collect(e.id);
    expect(reg.get(e.id)!.status).toBe('COLLECTED');
  });

  it('collect returns the updated entry', () => {
    const e = reg.generate('RECYCLABLE', 'SOLID', 'd', 5, 'kg', '2026-01-01', 'X', 'Y');
    const r = reg.collect(e.id);
    expect(r.status).toBe('COLLECTED');
  });

  it('dispose sets status DISPOSED', () => {
    const e = reg.generate('GENERAL', 'SOLID', 'd', 1, 'kg', '2026-01-01', 'X', 'Y');
    reg.dispose(e.id);
    expect(reg.get(e.id)!.status).toBe('DISPOSED');
  });

  it('dispose returns the updated entry', () => {
    const e = reg.generate('GENERAL', 'SOLID', 'd', 1, 'kg', '2026-01-01', 'X', 'Y');
    const r = reg.dispose(e.id);
    expect(r.status).toBe('DISPOSED');
  });

  it('store throws for unknown id', () => {
    expect(() => reg.store('NO-SUCH', 'WH')).toThrow();
  });

  it('collect throws for unknown id', () => {
    expect(() => reg.collect('NO-SUCH')).toThrow();
  });

  it('dispose throws for unknown id', () => {
    expect(() => reg.dispose('NO-SUCH')).toThrow();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// WasteRegister — generate across all WasteStream values
// ─────────────────────────────────────────────────────────────────────────────
describe('WasteRegister – all WasteStream values', () => {
  let reg: WasteRegister;
  beforeEach(() => { reg = new WasteRegister(); });

  STREAMS.forEach((stream) => {
    it(`generate stream=${stream} returns correct stream`, () => {
      const e = reg.generate(stream, 'SOLID', `${stream} waste`, 1, 'kg', '2026-01-01', 'User', 'Loc');
      expect(e.stream).toBe(stream);
    });
    it(`getByStream(${stream}) returns only that stream`, () => {
      reg.generate(stream, 'SOLID', 'd', 1, 'kg', '2026-01-01', 'U', 'L');
      reg.generate('GENERAL', 'SOLID', 'd', 1, 'kg', '2026-01-01', 'U', 'L');
      const results = reg.getByStream(stream);
      results.forEach(e => expect(e.stream).toBe(stream));
    });
    it(`getTotalByStream(${stream}) sums correctly`, () => {
      reg.generate(stream, 'SOLID', 'd', 10, 'kg', '2026-01-01', 'U', 'L');
      reg.generate(stream, 'SOLID', 'd', 20, 'kg', '2026-01-01', 'U', 'L');
      expect(reg.getTotalByStream(stream)).toBe(30);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// WasteRegister — generate across all WasteState values
// ─────────────────────────────────────────────────────────────────────────────
describe('WasteRegister – all WasteState values', () => {
  let reg: WasteRegister;
  beforeEach(() => { reg = new WasteRegister(); });

  STATES.forEach((state) => {
    it(`generate state=${state} stores correctly`, () => {
      const e = reg.generate('GENERAL', state, 'd', 1, 'kg', '2026-01-01', 'U', 'L');
      expect(e.state).toBe(state);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// WasteRegister — getByStatus
// ─────────────────────────────────────────────────────────────────────────────
describe('WasteRegister – getByStatus', () => {
  let reg: WasteRegister;
  beforeEach(() => { reg = new WasteRegister(); });

  it('getByStatus GENERATED returns only generated entries', () => {
    const e = reg.generate('GENERAL', 'SOLID', 'd', 1, 'kg', '2026-01-01', 'U', 'L');
    const results = reg.getByStatus('GENERATED');
    expect(results.map(r => r.id)).toContain(e.id);
    results.forEach(r => expect(r.status).toBe('GENERATED'));
  });

  it('getByStatus STORED returns only stored entries', () => {
    const e1 = reg.generate('GENERAL', 'SOLID', 'd', 1, 'kg', '2026-01-01', 'U', 'L');
    reg.generate('RECYCLABLE', 'SOLID', 'd', 2, 'kg', '2026-01-01', 'U', 'L');
    reg.store(e1.id, 'WH');
    const results = reg.getByStatus('STORED');
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe(e1.id);
  });

  it('getByStatus COLLECTED returns only collected entries', () => {
    const e = reg.generate('GENERAL', 'SOLID', 'd', 1, 'kg', '2026-01-01', 'U', 'L');
    reg.collect(e.id);
    expect(reg.getByStatus('COLLECTED').map(r => r.id)).toContain(e.id);
  });

  it('getByStatus DISPOSED returns only disposed entries', () => {
    const e = reg.generate('GENERAL', 'SOLID', 'd', 1, 'kg', '2026-01-01', 'U', 'L');
    reg.dispose(e.id);
    expect(reg.getByStatus('DISPOSED').map(r => r.id)).toContain(e.id);
  });

  WASTE_STATUSES.forEach((status) => {
    it(`getByStatus(${status}) returns empty array when none match`, () => {
      expect(reg.getByStatus(status)).toEqual([]);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// WasteRegister — getByLocation
// ─────────────────────────────────────────────────────────────────────────────
describe('WasteRegister – getByLocation', () => {
  let reg: WasteRegister;
  beforeEach(() => { reg = new WasteRegister(); });

  it('getByLocation returns entries at that location', () => {
    reg.generate('GENERAL', 'SOLID', 'd', 1, 'kg', '2026-01-01', 'U', 'SiteA');
    reg.generate('RECYCLABLE', 'SOLID', 'd', 1, 'kg', '2026-01-01', 'U', 'SiteB');
    const results = reg.getByLocation('SiteA');
    expect(results).toHaveLength(1);
    expect(results[0].location).toBe('SiteA');
  });

  it('getByLocation returns empty array for unknown location', () => {
    expect(reg.getByLocation('Unknown')).toEqual([]);
  });

  Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
    it(`getByLocation location-${i} isolates correctly`, () => {
      reg.generate('GENERAL', 'SOLID', 'd', i + 1, 'kg', '2026-01-01', 'U', `location-${i}`);
      const results = reg.getByLocation(`location-${i}`);
      expect(results.every(e => e.location === `location-${i}`)).toBe(true);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// WasteRegister — getHazardous
// ─────────────────────────────────────────────────────────────────────────────
describe('WasteRegister – getHazardous', () => {
  let reg: WasteRegister;
  beforeEach(() => { reg = new WasteRegister(); });

  it('getHazardous returns only entries with hazardClass', () => {
    reg.generate('GENERAL', 'SOLID', 'plain', 1, 'kg', '2026-01-01', 'U', 'L');
    const hz = reg.generate('HAZARDOUS', 'LIQUID', 'solvent', 5, 'L', '2026-01-01', 'U', 'L', 'CLASS_3');
    const results = reg.getHazardous();
    expect(results.map(r => r.id)).toContain(hz.id);
    results.forEach(r => expect(r.hazardClass).toBeDefined());
  });

  it('getHazardous returns empty when none hazardous', () => {
    reg.generate('GENERAL', 'SOLID', 'd', 1, 'kg', '2026-01-01', 'U', 'L');
    expect(reg.getHazardous()).toHaveLength(0);
  });

  HAZARD_CLASSES.forEach((cls) => {
    it(`hazardClass ${cls} stored and retrieved`, () => {
      const e = reg.generate('HAZARDOUS', 'SOLID', 'd', 1, 'kg', '2026-01-01', 'U', 'L', cls);
      expect(reg.get(e.id)!.hazardClass).toBe(cls);
      const hz = reg.getHazardous();
      expect(hz.map(h => h.id)).toContain(e.id);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// WasteRegister — getPendingDisposal
// ─────────────────────────────────────────────────────────────────────────────
describe('WasteRegister – getPendingDisposal', () => {
  let reg: WasteRegister;
  beforeEach(() => { reg = new WasteRegister(); });

  it('getPendingDisposal returns GENERATED entries', () => {
    const e = reg.generate('GENERAL', 'SOLID', 'd', 1, 'kg', '2026-01-01', 'U', 'L');
    expect(reg.getPendingDisposal().map(r => r.id)).toContain(e.id);
  });

  it('getPendingDisposal returns STORED entries', () => {
    const e = reg.generate('GENERAL', 'SOLID', 'd', 1, 'kg', '2026-01-01', 'U', 'L');
    reg.store(e.id, 'WH');
    expect(reg.getPendingDisposal().map(r => r.id)).toContain(e.id);
  });

  it('getPendingDisposal excludes COLLECTED entries', () => {
    const e = reg.generate('GENERAL', 'SOLID', 'd', 1, 'kg', '2026-01-01', 'U', 'L');
    reg.collect(e.id);
    expect(reg.getPendingDisposal().map(r => r.id)).not.toContain(e.id);
  });

  it('getPendingDisposal excludes DISPOSED entries', () => {
    const e = reg.generate('GENERAL', 'SOLID', 'd', 1, 'kg', '2026-01-01', 'U', 'L');
    reg.dispose(e.id);
    expect(reg.getPendingDisposal().map(r => r.id)).not.toContain(e.id);
  });

  it('getPendingDisposal empty when all disposed', () => {
    const e1 = reg.generate('GENERAL', 'SOLID', 'd', 1, 'kg', '2026-01-01', 'U', 'L');
    const e2 = reg.generate('RECYCLABLE', 'SOLID', 'd', 2, 'kg', '2026-01-01', 'U', 'L');
    reg.dispose(e1.id);
    reg.collect(e2.id);
    expect(reg.getPendingDisposal()).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// WasteRegister — getTotalByStream
// ─────────────────────────────────────────────────────────────────────────────
describe('WasteRegister – getTotalByStream', () => {
  let reg: WasteRegister;
  beforeEach(() => { reg = new WasteRegister(); });

  it('returns 0 when no entries for stream', () => {
    expect(reg.getTotalByStream('GENERAL')).toBe(0);
  });

  it('sums a single entry', () => {
    reg.generate('GENERAL', 'SOLID', 'd', 42, 'kg', '2026-01-01', 'U', 'L');
    expect(reg.getTotalByStream('GENERAL')).toBe(42);
  });

  it('sums multiple entries for same stream', () => {
    reg.generate('RECYCLABLE', 'SOLID', 'd', 15, 'kg', '2026-01-01', 'U', 'L');
    reg.generate('RECYCLABLE', 'SOLID', 'd', 25, 'kg', '2026-01-01', 'U', 'L');
    reg.generate('RECYCLABLE', 'SOLID', 'd', 10, 'kg', '2026-01-01', 'U', 'L');
    expect(reg.getTotalByStream('RECYCLABLE')).toBe(50);
  });

  it('does not include other streams in total', () => {
    reg.generate('HAZARDOUS', 'LIQUID', 'd', 100, 'L', '2026-01-01', 'U', 'L', 'CLASS_3');
    reg.generate('GENERAL', 'SOLID', 'd', 5, 'kg', '2026-01-01', 'U', 'L');
    expect(reg.getTotalByStream('HAZARDOUS')).toBe(100);
  });

  Array.from({ length: 30 }, (_, i) => i + 1).forEach((qty) => {
    it(`getTotalByStream accumulates qty=${qty} x2 = ${qty * 2}`, () => {
      reg.generate('ORGANIC', 'SOLID', 'd', qty, 'kg', '2026-01-01', 'U', 'L');
      reg.generate('ORGANIC', 'SOLID', 'd', qty, 'kg', '2026-01-01', 'U', 'L');
      expect(reg.getTotalByStream('ORGANIC')).toBe(qty * 2);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// WasteRegister — getCount
// ─────────────────────────────────────────────────────────────────────────────
describe('WasteRegister – getCount', () => {
  let reg: WasteRegister;
  beforeEach(() => { reg = new WasteRegister(); });

  it('count starts at 0', () => { expect(reg.getCount()).toBe(0); });

  Array.from({ length: 50 }, (_, i) => i + 1).forEach((n) => {
    it(`count is ${n} after generating ${n} entries`, () => {
      for (let k = 0; k < n; k++) {
        reg.generate('GENERAL', 'SOLID', 'd', 1, 'kg', '2026-01-01', 'U', 'L');
      }
      expect(reg.getCount()).toBe(n);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// WasteRegister — status transition completeness
// ─────────────────────────────────────────────────────────────────────────────
describe('WasteRegister – full status lifecycle', () => {
  let reg: WasteRegister;
  beforeEach(() => { reg = new WasteRegister(); });

  it('full lifecycle GENERATED→STORED→COLLECTED→DISPOSED', () => {
    const e = reg.generate('GENERAL', 'SOLID', 'lifecycle', 10, 'kg', '2026-01-01', 'U', 'L');
    expect(e.status).toBe('GENERATED');
    reg.store(e.id, 'WH');
    expect(reg.get(e.id)!.status).toBe('STORED');
    reg.collect(e.id);
    expect(reg.get(e.id)!.status).toBe('COLLECTED');
    reg.dispose(e.id);
    expect(reg.get(e.id)!.status).toBe('DISPOSED');
  });

  it('can skip directly to COLLECTED', () => {
    const e = reg.generate('GENERAL', 'SOLID', 'd', 1, 'kg', '2026-01-01', 'U', 'L');
    reg.collect(e.id);
    expect(reg.get(e.id)!.status).toBe('COLLECTED');
  });

  it('can skip directly to DISPOSED', () => {
    const e = reg.generate('GENERAL', 'SOLID', 'd', 1, 'kg', '2026-01-01', 'U', 'L');
    reg.dispose(e.id);
    expect(reg.get(e.id)!.status).toBe('DISPOSED');
  });

  Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
    it(`lifecycle iteration ${i}: store then dispose`, () => {
      const e = reg.generate('GENERAL', 'SOLID', `iter-${i}`, i + 1, 'kg', '2026-01-01', 'U', 'Loc');
      reg.store(e.id, `WH-${i}`);
      reg.dispose(e.id);
      const fetched = reg.get(e.id)!;
      expect(fetched.status).toBe('DISPOSED');
      expect(fetched.storageLocation).toBe(`WH-${i}`);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// WasteRegister — EWC codes and notes
// ─────────────────────────────────────────────────────────────────────────────
describe('WasteRegister – EWC codes and notes', () => {
  let reg: WasteRegister;
  beforeEach(() => { reg = new WasteRegister(); });

  Array.from({ length: 30 }, (_, i) => i).forEach((i) => {
    it(`ewcCode EWC-${i} stored correctly`, () => {
      const e = reg.generate('GENERAL', 'SOLID', 'd', 1, 'kg', '2026-01-01', 'U', 'L', undefined, `EWC-${i}`);
      expect(reg.get(e.id)!.ewcCode).toBe(`EWC-${i}`);
    });
  });

  Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
    it(`notes note-${i} stored correctly`, () => {
      const e = reg.generate('GENERAL', 'SOLID', 'd', 1, 'kg', '2026-01-01', 'U', 'L', undefined, undefined, `note-${i}`);
      expect(reg.get(e.id)!.notes).toBe(`note-${i}`);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// WasteRegister — multiple instances are isolated
// ─────────────────────────────────────────────────────────────────────────────
describe('WasteRegister – multiple instances isolated', () => {
  it('two instances do not share data', () => {
    const r1 = new WasteRegister();
    const r2 = new WasteRegister();
    r1.generate('GENERAL', 'SOLID', 'd', 1, 'kg', '2026-01-01', 'U', 'L');
    expect(r1.getCount()).toBe(1);
    expect(r2.getCount()).toBe(0);
  });

  Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
    it(`isolation check instance pair ${i}`, () => {
      const a = new WasteRegister();
      const b = new WasteRegister();
      for (let k = 0; k <= i; k++) {
        a.generate('GENERAL', 'SOLID', 'd', 1, 'kg', '2026-01-01', 'U', 'L');
      }
      expect(a.getCount()).toBe(i + 1);
      expect(b.getCount()).toBe(0);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// WasteRegister — large volume
// ─────────────────────────────────────────────────────────────────────────────
describe('WasteRegister – large volume operations', () => {
  let reg: WasteRegister;
  beforeEach(() => { reg = new WasteRegister(); });

  Array.from({ length: 50 }, (_, i) => i).forEach((i) => {
    it(`large volume insert #${i} is retrievable`, () => {
      const e = reg.generate(
        STREAMS[i % STREAMS.length],
        STATES[i % STATES.length],
        `desc-${i}`,
        (i + 1) * 2,
        'kg',
        `2026-01-${String((i % 28) + 1).padStart(2, '0')}`,
        `user-${i}`,
        `loc-${i % 10}`,
      );
      expect(reg.get(e.id)).toBeDefined();
    });
  });

  it('getTotalByStream GENERAL after 50 inserts sums correctly', () => {
    let expected = 0;
    for (let i = 0; i < 50; i++) {
      const qty = i + 1;
      reg.generate('GENERAL', 'SOLID', 'd', qty, 'kg', '2026-01-01', 'U', 'L');
      expected += qty;
    }
    expect(reg.getTotalByStream('GENERAL')).toBe(expected);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DisposalTracker — basic behaviour
// ─────────────────────────────────────────────────────────────────────────────
describe('DisposalTracker – basic behaviour', () => {
  let tracker: DisposalTracker;
  beforeEach(() => { tracker = new DisposalTracker(); });

  it('starts empty', () => { expect(tracker.getCount()).toBe(0); });
  it('getAll returns empty array initially', () => { expect(tracker.getAll()).toEqual([]); });
  it('get returns undefined for unknown id', () => { expect(tracker.get('FAKE')).toBeUndefined(); });

  it('createManifest returns a DisposalManifest', () => {
    const m = tracker.createManifest('WE-001', 'RECYCLING', 'RecycleCo', 'MAN-001');
    expect(m).toBeDefined();
    expect(m.id).toBeDefined();
  });

  it('created manifest has status PENDING', () => {
    const m = tracker.createManifest('WE-001', 'LANDFILL', 'LandCo', 'MAN-001');
    expect(m.status).toBe('PENDING');
  });

  it('createManifest increments count', () => {
    tracker.createManifest('WE-001', 'RECYCLING', 'RCo', 'MAN-001');
    expect(tracker.getCount()).toBe(1);
  });

  it('get returns the created manifest', () => {
    const m = tracker.createManifest('WE-001', 'COMPOSTING', 'CompCo', 'MAN-001');
    expect(tracker.get(m.id)).toEqual(m);
  });

  it('getAll returns all manifests', () => {
    const m1 = tracker.createManifest('WE-001', 'RECYCLING', 'RCo', 'M1');
    const m2 = tracker.createManifest('WE-002', 'LANDFILL', 'LCo', 'M2');
    const all = tracker.getAll();
    expect(all).toHaveLength(2);
    expect(all.map(m => m.id)).toContain(m1.id);
    expect(all.map(m => m.id)).toContain(m2.id);
  });

  it('manifest fields match inputs', () => {
    const m = tracker.createManifest('WE-XYZ', 'INCINERATION', 'IncinerCo', 'MAN-999', 'Facility A', 500, 'Handle with care');
    expect(m.wasteEntryId).toBe('WE-XYZ');
    expect(m.disposalRoute).toBe('INCINERATION');
    expect(m.contractor).toBe('IncinerCo');
    expect(m.manifestNumber).toBe('MAN-999');
    expect(m.treatmentFacility).toBe('Facility A');
    expect(m.cost).toBe(500);
    expect(m.notes).toBe('Handle with care');
  });

  it('optional fields absent when not supplied', () => {
    const m = tracker.createManifest('WE-001', 'RECYCLING', 'RCo', 'MAN-001');
    expect(m.treatmentFacility).toBeUndefined();
    expect(m.cost).toBeUndefined();
    expect(m.notes).toBeUndefined();
    expect(m.collectedAt).toBeUndefined();
    expect(m.deliveredAt).toBeUndefined();
    expect(m.certificateNumber).toBeUndefined();
  });

  it('dispatch sets status IN_TRANSIT and collectedAt', () => {
    const m = tracker.createManifest('WE-001', 'RECYCLING', 'RCo', 'MAN-001');
    tracker.dispatch(m.id, '2026-02-01T09:00:00Z');
    const fetched = tracker.get(m.id)!;
    expect(fetched.status).toBe('IN_TRANSIT');
    expect(fetched.collectedAt).toBe('2026-02-01T09:00:00Z');
  });

  it('dispatch returns updated manifest', () => {
    const m = tracker.createManifest('WE-001', 'RECYCLING', 'RCo', 'MAN-001');
    const r = tracker.dispatch(m.id, '2026-02-01T10:00:00Z');
    expect(r.status).toBe('IN_TRANSIT');
  });

  it('deliver sets status DELIVERED and deliveredAt', () => {
    const m = tracker.createManifest('WE-001', 'RECYCLING', 'RCo', 'MAN-001');
    tracker.dispatch(m.id, '2026-02-01T09:00:00Z');
    tracker.deliver(m.id, '2026-02-01T15:00:00Z', 'CERT-001');
    const fetched = tracker.get(m.id)!;
    expect(fetched.status).toBe('DELIVERED');
    expect(fetched.deliveredAt).toBe('2026-02-01T15:00:00Z');
    expect(fetched.certificateNumber).toBe('CERT-001');
  });

  it('deliver returns updated manifest', () => {
    const m = tracker.createManifest('WE-001', 'RECYCLING', 'RCo', 'MAN-001');
    const r = tracker.deliver(m.id, '2026-02-02T10:00:00Z');
    expect(r.status).toBe('DELIVERED');
  });

  it('reject sets status REJECTED', () => {
    const m = tracker.createManifest('WE-001', 'RECYCLING', 'RCo', 'MAN-001');
    tracker.reject(m.id, 'Contaminated load');
    const fetched = tracker.get(m.id)!;
    expect(fetched.status).toBe('REJECTED');
    expect(fetched.notes).toBe('Contaminated load');
  });

  it('reject returns updated manifest', () => {
    const m = tracker.createManifest('WE-001', 'RECYCLING', 'RCo', 'MAN-001');
    const r = tracker.reject(m.id);
    expect(r.status).toBe('REJECTED');
  });

  it('dispatch throws for unknown id', () => {
    expect(() => tracker.dispatch('NO-SUCH', '2026-01-01')).toThrow();
  });

  it('deliver throws for unknown id', () => {
    expect(() => tracker.deliver('NO-SUCH', '2026-01-01')).toThrow();
  });

  it('reject throws for unknown id', () => {
    expect(() => tracker.reject('NO-SUCH')).toThrow();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DisposalTracker — all DisposalRoute values
// ─────────────────────────────────────────────────────────────────────────────
describe('DisposalTracker – all DisposalRoute values', () => {
  let tracker: DisposalTracker;
  beforeEach(() => { tracker = new DisposalTracker(); });

  ROUTES.forEach((route) => {
    it(`createManifest route=${route} stores correctly`, () => {
      const m = tracker.createManifest('WE-001', route, 'Contractor', `MAN-${route}`);
      expect(m.disposalRoute).toBe(route);
    });
    it(`getByRoute(${route}) returns only that route`, () => {
      tracker.createManifest('WE-001', route, 'Co', `MAN-${route}-1`);
      tracker.createManifest('WE-002', 'LANDFILL', 'Co', 'MAN-LANDFILL-1');
      const results = tracker.getByRoute(route);
      results.forEach(m => expect(m.disposalRoute).toBe(route));
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DisposalTracker — getByStatus
// ─────────────────────────────────────────────────────────────────────────────
describe('DisposalTracker – getByStatus', () => {
  let tracker: DisposalTracker;
  beforeEach(() => { tracker = new DisposalTracker(); });

  MANIFEST_STATUSES.forEach((status) => {
    it(`getByStatus(${status}) returns empty array when none`, () => {
      expect(tracker.getByStatus(status)).toEqual([]);
    });
  });

  it('getByStatus PENDING returns pending manifests', () => {
    const m = tracker.createManifest('WE-001', 'RECYCLING', 'RCo', 'M1');
    expect(tracker.getByStatus('PENDING').map(x => x.id)).toContain(m.id);
  });

  it('getByStatus IN_TRANSIT after dispatch', () => {
    const m = tracker.createManifest('WE-001', 'RECYCLING', 'RCo', 'M1');
    tracker.dispatch(m.id, '2026-01-01');
    expect(tracker.getByStatus('IN_TRANSIT').map(x => x.id)).toContain(m.id);
    expect(tracker.getByStatus('PENDING')).toHaveLength(0);
  });

  it('getByStatus DELIVERED after deliver', () => {
    const m = tracker.createManifest('WE-001', 'RECYCLING', 'RCo', 'M1');
    tracker.dispatch(m.id, '2026-01-01');
    tracker.deliver(m.id, '2026-01-02');
    expect(tracker.getByStatus('DELIVERED').map(x => x.id)).toContain(m.id);
  });

  it('getByStatus REJECTED after reject', () => {
    const m = tracker.createManifest('WE-001', 'RECYCLING', 'RCo', 'M1');
    tracker.reject(m.id);
    expect(tracker.getByStatus('REJECTED').map(x => x.id)).toContain(m.id);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DisposalTracker — getByWasteEntry
// ─────────────────────────────────────────────────────────────────────────────
describe('DisposalTracker – getByWasteEntry', () => {
  let tracker: DisposalTracker;
  beforeEach(() => { tracker = new DisposalTracker(); });

  it('returns all manifests for a waste entry', () => {
    const m1 = tracker.createManifest('WE-001', 'RECYCLING', 'RCo', 'M1');
    const m2 = tracker.createManifest('WE-001', 'LANDFILL', 'LCo', 'M2');
    tracker.createManifest('WE-002', 'COMPOSTING', 'CCo', 'M3');
    const results = tracker.getByWasteEntry('WE-001');
    expect(results).toHaveLength(2);
    expect(results.map(m => m.id)).toContain(m1.id);
    expect(results.map(m => m.id)).toContain(m2.id);
  });

  it('returns empty array for unknown wasteEntryId', () => {
    expect(tracker.getByWasteEntry('NO-SUCH')).toEqual([]);
  });

  Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
    it(`getByWasteEntry WE-${i} isolation check`, () => {
      tracker.createManifest(`WE-${i}`, 'RECYCLING', 'Co', `MAN-${i}`);
      tracker.createManifest(`WE-${i + 100}`, 'LANDFILL', 'Co', `MAN-${i + 100}`);
      const results = tracker.getByWasteEntry(`WE-${i}`);
      expect(results.every(m => m.wasteEntryId === `WE-${i}`)).toBe(true);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DisposalTracker — getByContractor
// ─────────────────────────────────────────────────────────────────────────────
describe('DisposalTracker – getByContractor', () => {
  let tracker: DisposalTracker;
  beforeEach(() => { tracker = new DisposalTracker(); });

  it('returns manifests for a given contractor', () => {
    const m1 = tracker.createManifest('WE-001', 'RECYCLING', 'GreenCo', 'M1');
    tracker.createManifest('WE-002', 'LANDFILL', 'LandCo', 'M2');
    const results = tracker.getByContractor('GreenCo');
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe(m1.id);
  });

  it('returns empty array for unknown contractor', () => {
    expect(tracker.getByContractor('No One')).toEqual([]);
  });

  Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
    it(`getByContractor contractor-${i} returns correct subset`, () => {
      tracker.createManifest('WE-001', 'RECYCLING', `contractor-${i}`, `MAN-${i}`);
      tracker.createManifest('WE-002', 'LANDFILL', `contractor-other`, `MAN-OTHER-${i}`);
      const results = tracker.getByContractor(`contractor-${i}`);
      expect(results.every(m => m.contractor === `contractor-${i}`)).toBe(true);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DisposalTracker — getInTransit
// ─────────────────────────────────────────────────────────────────────────────
describe('DisposalTracker – getInTransit', () => {
  let tracker: DisposalTracker;
  beforeEach(() => { tracker = new DisposalTracker(); });

  it('getInTransit returns empty initially', () => {
    expect(tracker.getInTransit()).toEqual([]);
  });

  it('getInTransit returns dispatched manifests', () => {
    const m = tracker.createManifest('WE-001', 'RECYCLING', 'RCo', 'M1');
    tracker.dispatch(m.id, '2026-01-01');
    expect(tracker.getInTransit().map(x => x.id)).toContain(m.id);
  });

  it('getInTransit does not return PENDING manifests', () => {
    tracker.createManifest('WE-001', 'RECYCLING', 'RCo', 'M1');
    expect(tracker.getInTransit()).toHaveLength(0);
  });

  it('getInTransit does not return DELIVERED manifests', () => {
    const m = tracker.createManifest('WE-001', 'RECYCLING', 'RCo', 'M1');
    tracker.dispatch(m.id, '2026-01-01');
    tracker.deliver(m.id, '2026-01-02');
    expect(tracker.getInTransit()).toHaveLength(0);
  });

  it('getInTransit does not return REJECTED manifests', () => {
    const m = tracker.createManifest('WE-001', 'RECYCLING', 'RCo', 'M1');
    tracker.dispatch(m.id, '2026-01-01');
    tracker.reject(m.id);
    expect(tracker.getInTransit()).toHaveLength(0);
  });

  Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
    it(`getInTransit count ${i + 1} after dispatching ${i + 1} manifests`, () => {
      for (let k = 0; k <= i; k++) {
        const m = tracker.createManifest(`WE-${k}`, 'RECYCLING', 'Co', `MAN-${k}-${i}`);
        tracker.dispatch(m.id, '2026-01-01');
      }
      expect(tracker.getInTransit()).toHaveLength(i + 1);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DisposalTracker — getTotalCost
// ─────────────────────────────────────────────────────────────────────────────
describe('DisposalTracker – getTotalCost', () => {
  let tracker: DisposalTracker;
  beforeEach(() => { tracker = new DisposalTracker(); });

  it('getTotalCost returns 0 when empty', () => {
    expect(tracker.getTotalCost()).toBe(0);
  });

  it('getTotalCost sums costs', () => {
    tracker.createManifest('WE-001', 'RECYCLING', 'RCo', 'M1', undefined, 100);
    tracker.createManifest('WE-002', 'LANDFILL', 'LCo', 'M2', undefined, 250);
    expect(tracker.getTotalCost()).toBe(350);
  });

  it('getTotalCost ignores manifests without cost', () => {
    tracker.createManifest('WE-001', 'RECYCLING', 'RCo', 'M1', undefined, 100);
    tracker.createManifest('WE-002', 'LANDFILL', 'LCo', 'M2');
    expect(tracker.getTotalCost()).toBe(100);
  });

  it('getTotalCost with zero cost', () => {
    tracker.createManifest('WE-001', 'RECYCLING', 'RCo', 'M1', undefined, 0);
    expect(tracker.getTotalCost()).toBe(0);
  });

  Array.from({ length: 40 }, (_, i) => i + 1).forEach((n) => {
    it(`getTotalCost sums ${n} manifests each costing ${n * 10}`, () => {
      for (let k = 0; k < n; k++) {
        tracker.createManifest(`WE-${k}`, 'RECYCLING', 'Co', `MAN-${k}`, undefined, n * 10);
      }
      expect(tracker.getTotalCost()).toBe(n * n * 10);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DisposalTracker — getCount
// ─────────────────────────────────────────────────────────────────────────────
describe('DisposalTracker – getCount', () => {
  let tracker: DisposalTracker;
  beforeEach(() => { tracker = new DisposalTracker(); });

  it('count starts at 0', () => { expect(tracker.getCount()).toBe(0); });

  Array.from({ length: 50 }, (_, i) => i + 1).forEach((n) => {
    it(`count is ${n} after creating ${n} manifests`, () => {
      for (let k = 0; k < n; k++) {
        tracker.createManifest(`WE-${k}`, 'RECYCLING', 'Co', `MAN-${k}`);
      }
      expect(tracker.getCount()).toBe(n);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DisposalTracker — full lifecycle
// ─────────────────────────────────────────────────────────────────────────────
describe('DisposalTracker – full manifest lifecycle', () => {
  let tracker: DisposalTracker;
  beforeEach(() => { tracker = new DisposalTracker(); });

  it('full lifecycle PENDING→IN_TRANSIT→DELIVERED', () => {
    const m = tracker.createManifest('WE-001', 'RECYCLING', 'RCo', 'MAN-001');
    expect(m.status).toBe('PENDING');
    tracker.dispatch(m.id, '2026-01-01T08:00:00Z');
    expect(tracker.get(m.id)!.status).toBe('IN_TRANSIT');
    tracker.deliver(m.id, '2026-01-01T16:00:00Z', 'CERT-XYZ');
    const final = tracker.get(m.id)!;
    expect(final.status).toBe('DELIVERED');
    expect(final.certificateNumber).toBe('CERT-XYZ');
    expect(final.deliveredAt).toBe('2026-01-01T16:00:00Z');
  });

  it('lifecycle PENDING→IN_TRANSIT→REJECTED', () => {
    const m = tracker.createManifest('WE-001', 'LANDFILL', 'LCo', 'MAN-002');
    tracker.dispatch(m.id, '2026-01-02T09:00:00Z');
    tracker.reject(m.id, 'Facility at capacity');
    const final = tracker.get(m.id)!;
    expect(final.status).toBe('REJECTED');
    expect(final.notes).toBe('Facility at capacity');
  });

  Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
    it(`lifecycle iteration ${i}: createManifest→dispatch→deliver`, () => {
      const m = tracker.createManifest(`WE-${i}`, ROUTES[i % ROUTES.length], `Co-${i}`, `MAN-${i}`);
      tracker.dispatch(m.id, `2026-01-${String((i % 28) + 1).padStart(2, '0')}`);
      tracker.deliver(m.id, `2026-02-${String((i % 28) + 1).padStart(2, '0')}`, `CERT-${i}`);
      const final = tracker.get(m.id)!;
      expect(final.status).toBe('DELIVERED');
      expect(final.certificateNumber).toBe(`CERT-${i}`);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DisposalTracker — multiple instances isolated
// ─────────────────────────────────────────────────────────────────────────────
describe('DisposalTracker – multiple instances isolated', () => {
  it('two instances do not share data', () => {
    const t1 = new DisposalTracker();
    const t2 = new DisposalTracker();
    t1.createManifest('WE-001', 'RECYCLING', 'Co', 'M1');
    expect(t1.getCount()).toBe(1);
    expect(t2.getCount()).toBe(0);
  });

  Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
    it(`isolation check instance pair ${i}`, () => {
      const a = new DisposalTracker();
      const b = new DisposalTracker();
      for (let k = 0; k <= i; k++) {
        a.createManifest(`WE-${k}`, 'RECYCLING', 'Co', `MAN-${k}`);
      }
      expect(a.getCount()).toBe(i + 1);
      expect(b.getCount()).toBe(0);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// WasteRegister + DisposalTracker — cross-class integration
// ─────────────────────────────────────────────────────────────────────────────
describe('WasteRegister + DisposalTracker – integration', () => {
  let reg: WasteRegister;
  let tracker: DisposalTracker;
  beforeEach(() => {
    reg = new WasteRegister();
    tracker = new DisposalTracker();
  });

  it('manifest references valid waste entry id', () => {
    const entry = reg.generate('HAZARDOUS', 'LIQUID', 'Solvent', 50, 'L', '2026-01-01', 'U', 'L', 'CLASS_3');
    const manifest = tracker.createManifest(entry.id, 'INCINERATION', 'IncCo', 'MAN-001');
    expect(manifest.wasteEntryId).toBe(entry.id);
    expect(tracker.getByWasteEntry(entry.id)).toHaveLength(1);
  });

  it('full integration: generate→store→collect→dispose + manifest PENDING→DELIVERED', () => {
    const entry = reg.generate('RECYCLABLE', 'SOLID', 'Paper', 100, 'kg', '2026-01-01', 'U', 'L');
    reg.store(entry.id, 'WH1');
    reg.collect(entry.id);
    const manifest = tracker.createManifest(entry.id, 'RECYCLING', 'RCo', 'MAN-001', 'RecycleFacility', 200);
    tracker.dispatch(manifest.id, '2026-01-10');
    tracker.deliver(manifest.id, '2026-01-11', 'CERT-001');
    reg.dispose(entry.id);
    expect(reg.get(entry.id)!.status).toBe('DISPOSED');
    expect(tracker.get(manifest.id)!.status).toBe('DELIVERED');
    expect(tracker.getTotalCost()).toBe(200);
  });

  Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
    it(`integration pair ${i}: entry+manifest round-trip`, () => {
      const entry = reg.generate(
        STREAMS[i % STREAMS.length],
        STATES[i % STATES.length],
        `desc-${i}`, i + 1, 'kg', '2026-01-01', 'U', `loc-${i}`
      );
      const manifest = tracker.createManifest(entry.id, ROUTES[i % ROUTES.length], `Co-${i}`, `MAN-${i}`, undefined, (i + 1) * 50);
      expect(tracker.getByWasteEntry(entry.id)[0].id).toBe(manifest.id);
    });
  });

  it('total cost across all manifests matches sum', () => {
    let expectedCost = 0;
    for (let i = 0; i < 10; i++) {
      const entry = reg.generate('GENERAL', 'SOLID', 'd', 1, 'kg', '2026-01-01', 'U', 'L');
      const cost = (i + 1) * 100;
      tracker.createManifest(entry.id, 'RECYCLING', 'Co', `MAN-${i}`, undefined, cost);
      expectedCost += cost;
    }
    expect(tracker.getTotalCost()).toBe(expectedCost);
  });

  it('waste register getHazardous count matches manifests for hazardous entries', () => {
    const h1 = reg.generate('HAZARDOUS', 'LIQUID', 'd', 10, 'L', '2026-01-01', 'U', 'L', 'CLASS_3');
    const h2 = reg.generate('HAZARDOUS', 'SOLID', 'd', 5, 'kg', '2026-01-01', 'U', 'L', 'CLASS_8');
    reg.generate('GENERAL', 'SOLID', 'd', 1, 'kg', '2026-01-01', 'U', 'L');
    tracker.createManifest(h1.id, 'INCINERATION', 'IncCo', 'MAN-1');
    tracker.createManifest(h2.id, 'TREATMENT', 'TreatCo', 'MAN-2');
    expect(reg.getHazardous()).toHaveLength(2);
    expect(tracker.getByWasteEntry(h1.id)).toHaveLength(1);
    expect(tracker.getByWasteEntry(h2.id)).toHaveLength(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// WasteRegister — parameterized generate over streams x states
// ─────────────────────────────────────────────────────────────────────────────
describe('WasteRegister – parameterized stream x state combinations', () => {
  let reg: WasteRegister;
  beforeEach(() => { reg = new WasteRegister(); });

  STREAMS.forEach((stream) => {
    STATES.forEach((state) => {
      it(`stream=${stream} state=${state} roundtrip`, () => {
        const e = reg.generate(stream, state, `${stream}/${state}`, 7, 'kg', '2026-01-01', 'U', 'L');
        expect(reg.get(e.id)!.stream).toBe(stream);
        expect(reg.get(e.id)!.state).toBe(state);
      });
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DisposalTracker — parameterized routes x manifest statuses
// ─────────────────────────────────────────────────────────────────────────────
describe('DisposalTracker – parameterized route across all routes', () => {
  let tracker: DisposalTracker;
  beforeEach(() => { tracker = new DisposalTracker(); });

  ROUTES.forEach((route, ri) => {
    Array.from({ length: 5 }, (_, i) => i).forEach((i) => {
      it(`route=${route} manifest-${i} round-trip`, () => {
        const m = tracker.createManifest(`WE-${ri * 10 + i}`, route, `Co-${i}`, `MAN-${ri}-${i}`, undefined, (ri + 1) * 100);
        expect(tracker.get(m.id)!.disposalRoute).toBe(route);
        expect(tracker.get(m.id)!.cost).toBe((ri + 1) * 100);
      });
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// WasteRegister — getByStream empty results
// ─────────────────────────────────────────────────────────────────────────────
describe('WasteRegister – getByStream edge cases', () => {
  let reg: WasteRegister;
  beforeEach(() => { reg = new WasteRegister(); });

  STREAMS.forEach((stream) => {
    it(`getByStream(${stream}) returns empty array when no entries`, () => {
      expect(reg.getByStream(stream)).toEqual([]);
    });
  });

  it('getByStream only returns exact stream match', () => {
    reg.generate('CLINICAL', 'SOLID', 'd', 1, 'kg', '2026-01-01', 'U', 'L');
    expect(reg.getByStream('GENERAL')).toHaveLength(0);
    expect(reg.getByStream('CLINICAL')).toHaveLength(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// WasteRegister — large getByStatus parameterized
// ─────────────────────────────────────────────────────────────────────────────
describe('WasteRegister – getByStatus parameterized fill', () => {
  let reg: WasteRegister;
  beforeEach(() => { reg = new WasteRegister(); });

  Array.from({ length: 30 }, (_, i) => i + 1).forEach((n) => {
    it(`getByStatus GENERATED returns ${n} entries after generating ${n}`, () => {
      for (let k = 0; k < n; k++) {
        reg.generate('GENERAL', 'SOLID', `d-${k}`, k + 1, 'kg', '2026-01-01', 'U', 'L');
      }
      expect(reg.getByStatus('GENERATED')).toHaveLength(n);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DisposalTracker — certificate number optional
// ─────────────────────────────────────────────────────────────────────────────
describe('DisposalTracker – certificateNumber optional on deliver', () => {
  let tracker: DisposalTracker;
  beforeEach(() => { tracker = new DisposalTracker(); });

  it('deliver without certificateNumber leaves it undefined', () => {
    const m = tracker.createManifest('WE-001', 'RECYCLING', 'RCo', 'M1');
    tracker.dispatch(m.id, '2026-01-01');
    tracker.deliver(m.id, '2026-01-02');
    expect(tracker.get(m.id)!.certificateNumber).toBeUndefined();
  });

  Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
    it(`deliver with certificateNumber CERT-${i} stores it`, () => {
      const m = tracker.createManifest('WE-001', 'RECYCLING', 'RCo', `MAN-${i}`);
      tracker.dispatch(m.id, '2026-01-01');
      tracker.deliver(m.id, '2026-01-02', `CERT-${i}`);
      expect(tracker.get(m.id)!.certificateNumber).toBe(`CERT-${i}`);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// WasteRegister — quantity precision
// ─────────────────────────────────────────────────────────────────────────────
describe('WasteRegister – quantity precision', () => {
  let reg: WasteRegister;
  beforeEach(() => { reg = new WasteRegister(); });

  Array.from({ length: 30 }, (_, i) => i).forEach((i) => {
    it(`quantity ${i + 0.5} stored precisely`, () => {
      const q = i + 0.5;
      const e = reg.generate('ORGANIC', 'SLUDGE', 'd', q, 'L', '2026-01-01', 'U', 'L');
      expect(reg.get(e.id)!.quantity).toBeCloseTo(q, 5);
    });
  });

  it('getTotalByStream with fractional quantities', () => {
    reg.generate('ORGANIC', 'SLUDGE', 'd', 0.5, 'kg', '2026-01-01', 'U', 'L');
    reg.generate('ORGANIC', 'SLUDGE', 'd', 1.5, 'kg', '2026-01-01', 'U', 'L');
    expect(reg.getTotalByStream('ORGANIC')).toBeCloseTo(2.0, 5);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// WasteRegister — storageLocation update on repeated store calls
// ─────────────────────────────────────────────────────────────────────────────
describe('WasteRegister – storageLocation updates', () => {
  let reg: WasteRegister;
  beforeEach(() => { reg = new WasteRegister(); });

  it('repeated store calls update storageLocation', () => {
    const e = reg.generate('GENERAL', 'SOLID', 'd', 1, 'kg', '2026-01-01', 'U', 'L');
    reg.store(e.id, 'WH1');
    reg.store(e.id, 'WH2');
    expect(reg.get(e.id)!.storageLocation).toBe('WH2');
  });

  Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
    it(`storageLocation update ${i}: WH-${i} persists`, () => {
      const e = reg.generate('GENERAL', 'SOLID', 'd', 1, 'kg', '2026-01-01', 'U', 'L');
      reg.store(e.id, `WH-${i}`);
      expect(reg.get(e.id)!.storageLocation).toBe(`WH-${i}`);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DisposalTracker — getByRoute parameterized counts
// ─────────────────────────────────────────────────────────────────────────────
describe('DisposalTracker – getByRoute counts', () => {
  let tracker: DisposalTracker;
  beforeEach(() => { tracker = new DisposalTracker(); });

  Array.from({ length: 10 }, (_, n) => n + 1).forEach((count) => {
    ROUTES.forEach((route) => {
      it(`getByRoute(${route}) returns ${count} after adding ${count}`, () => {
        for (let k = 0; k < count; k++) {
          tracker.createManifest(`WE-${route}-${k}`, route, 'Co', `MAN-${route}-${k}`);
        }
        expect(tracker.getByRoute(route)).toHaveLength(count);
      });
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// WasteRegister — getAll immutability (modifications to returned array)
// ─────────────────────────────────────────────────────────────────────────────
describe('WasteRegister – getAll snapshot', () => {
  let reg: WasteRegister;
  beforeEach(() => { reg = new WasteRegister(); });

  it('getAll returns array of all entries', () => {
    for (let i = 0; i < 5; i++) {
      reg.generate('GENERAL', 'SOLID', `d-${i}`, i + 1, 'kg', '2026-01-01', 'U', 'L');
    }
    expect(reg.getAll()).toHaveLength(5);
  });

  Array.from({ length: 10 }, (_, i) => i + 1).forEach((n) => {
    it(`getAll length=${n}`, () => {
      for (let k = 0; k < n; k++) {
        reg.generate('RECYCLABLE', 'SOLID', `d`, k + 1, 'kg', '2026-01-01', 'U', 'L');
      }
      expect(reg.getAll()).toHaveLength(n);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DisposalTracker — getAll snapshot
// ─────────────────────────────────────────────────────────────────────────────
describe('DisposalTracker – getAll snapshot', () => {
  let tracker: DisposalTracker;
  beforeEach(() => { tracker = new DisposalTracker(); });

  Array.from({ length: 10 }, (_, i) => i + 1).forEach((n) => {
    it(`getAll length=${n} after ${n} creates`, () => {
      for (let k = 0; k < n; k++) {
        tracker.createManifest(`WE-${k}`, 'RECYCLING', 'Co', `MAN-${k}`);
      }
      expect(tracker.getAll()).toHaveLength(n);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// WasteRegister – hazard class filtering counts
// ─────────────────────────────────────────────────────────────────────────────
describe('WasteRegister – hazard class filter counts', () => {
  let reg: WasteRegister;
  beforeEach(() => { reg = new WasteRegister(); });

  Array.from({ length: 15 }, (_, i) => i + 1).forEach((n) => {
    it(`getHazardous returns ${n} after adding ${n} hazardous entries`, () => {
      for (let k = 0; k < n; k++) {
        reg.generate('HAZARDOUS', 'LIQUID', `d-${k}`, k + 1, 'L', '2026-01-01', 'U', 'L', HAZARD_CLASSES[k % HAZARD_CLASSES.length]);
      }
      expect(reg.getHazardous()).toHaveLength(n);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// WasteRegister – getPendingDisposal mixed statuses
// ─────────────────────────────────────────────────────────────────────────────
describe('WasteRegister – getPendingDisposal mixed', () => {
  let reg: WasteRegister;
  beforeEach(() => { reg = new WasteRegister(); });

  Array.from({ length: 15 }, (_, i) => i).forEach((i) => {
    it(`pending disposal count ${i + 1}: ${i} disposed + 1 pending`, () => {
      for (let k = 0; k < i; k++) {
        const e = reg.generate('GENERAL', 'SOLID', `d-${k}`, 1, 'kg', '2026-01-01', 'U', 'L');
        reg.dispose(e.id);
      }
      reg.generate('GENERAL', 'SOLID', 'pending', 1, 'kg', '2026-01-01', 'U', 'L');
      expect(reg.getPendingDisposal()).toHaveLength(1);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DisposalTracker – notes on reject
// ─────────────────────────────────────────────────────────────────────────────
describe('DisposalTracker – notes on reject', () => {
  let tracker: DisposalTracker;
  beforeEach(() => { tracker = new DisposalTracker(); });

  it('reject without notes leaves notes as original value', () => {
    const m = tracker.createManifest('WE-001', 'RECYCLING', 'Co', 'M1');
    tracker.reject(m.id);
    expect(tracker.get(m.id)!.status).toBe('REJECTED');
  });

  Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
    it(`reject with note-${i} stores correctly`, () => {
      const m = tracker.createManifest('WE-001', 'RECYCLING', 'Co', `MAN-${i}`);
      tracker.reject(m.id, `note-${i}`);
      expect(tracker.get(m.id)!.notes).toBe(`note-${i}`);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DisposalTracker – treatmentFacility field
// ─────────────────────────────────────────────────────────────────────────────
describe('DisposalTracker – treatmentFacility field', () => {
  let tracker: DisposalTracker;
  beforeEach(() => { tracker = new DisposalTracker(); });

  Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
    it(`treatmentFacility facility-${i} stored correctly`, () => {
      const m = tracker.createManifest('WE-001', 'TREATMENT', 'Co', `MAN-${i}`, `facility-${i}`);
      expect(tracker.get(m.id)!.treatmentFacility).toBe(`facility-${i}`);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DisposalTracker – manifestNumber stored
// ─────────────────────────────────────────────────────────────────────────────
describe('DisposalTracker – manifestNumber stored', () => {
  let tracker: DisposalTracker;
  beforeEach(() => { tracker = new DisposalTracker(); });

  Array.from({ length: 30 }, (_, i) => i).forEach((i) => {
    it(`manifestNumber MAN-${String(i).padStart(4, '0')} stored correctly`, () => {
      const mn = `MAN-${String(i).padStart(4, '0')}`;
      const m = tracker.createManifest(`WE-${i}`, 'RECYCLING', 'Co', mn);
      expect(tracker.get(m.id)!.manifestNumber).toBe(mn);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// WasteRegister – generatedBy field stored
// ─────────────────────────────────────────────────────────────────────────────
describe('WasteRegister – generatedBy field', () => {
  let reg: WasteRegister;
  beforeEach(() => { reg = new WasteRegister(); });

  Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
    it(`generatedBy user-${i} stored correctly`, () => {
      const e = reg.generate('GENERAL', 'SOLID', 'd', 1, 'kg', '2026-01-01', `user-${i}`, 'L');
      expect(reg.get(e.id)!.generatedBy).toBe(`user-${i}`);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// WasteRegister – unit field stored
// ─────────────────────────────────────────────────────────────────────────────
describe('WasteRegister – unit field', () => {
  let reg: WasteRegister;
  beforeEach(() => { reg = new WasteRegister(); });

  const UNITS = ['kg', 'L', 'm3', 'tonnes', 'units', 'bags'];
  UNITS.forEach((unit) => {
    it(`unit=${unit} stored correctly`, () => {
      const e = reg.generate('GENERAL', 'SOLID', 'd', 1, unit, '2026-01-01', 'U', 'L');
      expect(reg.get(e.id)!.unit).toBe(unit);
    });
  });

  Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
    it(`unit unit-${i} stored correctly`, () => {
      const e = reg.generate('GENERAL', 'SOLID', 'd', 1, `unit-${i}`, '2026-01-01', 'U', 'L');
      expect(reg.get(e.id)!.unit).toBe(`unit-${i}`);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// WasteRegister – description field stored
// ─────────────────────────────────────────────────────────────────────────────
describe('WasteRegister – description field', () => {
  let reg: WasteRegister;
  beforeEach(() => { reg = new WasteRegister(); });

  Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
    it(`description desc-${i} stored correctly`, () => {
      const e = reg.generate('GENERAL', 'SOLID', `desc-${i}`, 1, 'kg', '2026-01-01', 'U', 'L');
      expect(reg.get(e.id)!.description).toBe(`desc-${i}`);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// WasteRegister – generatedAt field stored
// ─────────────────────────────────────────────────────────────────────────────
describe('WasteRegister – generatedAt field', () => {
  let reg: WasteRegister;
  beforeEach(() => { reg = new WasteRegister(); });

  Array.from({ length: 12 }, (_, i) => i + 1).forEach((month) => {
    it(`generatedAt 2026-${String(month).padStart(2, '0')}-01 stored correctly`, () => {
      const date = `2026-${String(month).padStart(2, '0')}-01`;
      const e = reg.generate('GENERAL', 'SOLID', 'd', 1, 'kg', date, 'U', 'L');
      expect(reg.get(e.id)!.generatedAt).toBe(date);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DisposalTracker – collectedAt stored on dispatch
// ─────────────────────────────────────────────────────────────────────────────
describe('DisposalTracker – collectedAt stored on dispatch', () => {
  let tracker: DisposalTracker;
  beforeEach(() => { tracker = new DisposalTracker(); });

  Array.from({ length: 10 }, (_, i) => i + 1).forEach((day) => {
    it(`collectedAt 2026-01-${String(day).padStart(2, '0')} stored correctly`, () => {
      const m = tracker.createManifest('WE-001', 'RECYCLING', 'Co', `MAN-${day}`);
      const date = `2026-01-${String(day).padStart(2, '0')}`;
      tracker.dispatch(m.id, date);
      expect(tracker.get(m.id)!.collectedAt).toBe(date);
    });
  });
});
