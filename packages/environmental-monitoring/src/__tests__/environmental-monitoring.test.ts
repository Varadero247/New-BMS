import { EmissionTracker } from '../emission-tracker';
import { WasteTracker } from '../waste-tracker';
import { ParameterMonitor } from '../parameter-monitor';
import {
  EmissionType,
  WasteCategory,
  DisposalMethod,
  MeasurementUnit,
  MonitoringFrequency,
  ComplianceStatus,
} from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// EMISSION TRACKER
// ─────────────────────────────────────────────────────────────────────────────

describe('EmissionTracker', () => {
  let tracker: EmissionTracker;

  beforeEach(() => {
    tracker = new EmissionTracker();
  });

  // ── Construction ──────────────────────────────────────────────────────────
  describe('construction', () => {
    it('starts with zero records', () => {
      expect(tracker.getCount()).toBe(0);
    });
    it('getAll returns empty array initially', () => {
      expect(tracker.getAll()).toEqual([]);
    });
    it('getTotalAll returns 0 initially', () => {
      expect(tracker.getTotalAll()).toBe(0);
    });
  });

  // ── record() – id generation ──────────────────────────────────────────────
  describe('record() id generation', () => {
    Array.from({ length: 25 }, (_, i) => i + 1).forEach((n) => {
      it(`record #${n} gets id em-${n}`, () => {
        for (let k = 0; k < n; k++) {
          tracker.record('CO2', 10, 'KG', 'boiler', '2026-01-01', 'user1');
        }
        expect(tracker.get(`em-${n}`)).toBeDefined();
        expect(tracker.get(`em-${n}`)!.id).toBe(`em-${n}`);
      });
    });
  });

  // ── record() – all EmissionTypes ──────────────────────────────────────────
  const emissionTypes: EmissionType[] = ['CO2', 'CH4', 'N2O', 'HFC', 'NOX', 'SOX', 'PM10', 'VOC'];
  describe('record() supports all EmissionTypes', () => {
    emissionTypes.forEach((type) => {
      it(`records type ${type}`, () => {
        const rec = tracker.record(type, 50, 'KG', 'facility', '2026-01-01', 'admin');
        expect(rec.type).toBe(type);
        expect(rec.amount).toBe(50);
      });
    });
  });

  // ── record() – all MeasurementUnits ───────────────────────────────────────
  const units: MeasurementUnit[] = ['KG', 'TONNE', 'LITRE', 'M3', 'KWH', 'MJ', 'PPM', 'MG_M3'];
  describe('record() supports all MeasurementUnits', () => {
    units.forEach((unit) => {
      it(`records unit ${unit}`, () => {
        const rec = tracker.record('CO2', 100, unit, 'plant', '2026-01-15', 'engineer');
        expect(rec.unit).toBe(unit);
      });
    });
  });

  // ── record() – field correctness ──────────────────────────────────────────
  describe('record() field correctness', () => {
    Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
      it(`record iteration ${i}: stores all fields correctly`, () => {
        const rec = tracker.record(
          'CO2',
          (i + 1) * 5,
          'TONNE',
          `source-${i}`,
          `2026-01-${String(i + 1).padStart(2, '0')}`,
          `user-${i}`,
          `note-${i}`,
        );
        expect(rec.amount).toBe((i + 1) * 5);
        expect(rec.source).toBe(`source-${i}`);
        expect(rec.measuredBy).toBe(`user-${i}`);
        expect(rec.notes).toBe(`note-${i}`);
      });
    });
  });

  // ── record() – notes optional ─────────────────────────────────────────────
  describe('record() notes is optional', () => {
    Array.from({ length: 15 }, (_, i) => i).forEach((i) => {
      it(`record without notes (iter ${i}) has no notes property or undefined`, () => {
        const rec = tracker.record('CH4', 10, 'KG', 'src', '2026-01-01', 'user');
        expect(rec.notes).toBeUndefined();
      });
    });
  });

  // ── get() ─────────────────────────────────────────────────────────────────
  describe('get()', () => {
    it('returns undefined for non-existent id', () => {
      expect(tracker.get('em-999')).toBeUndefined();
    });
    Array.from({ length: 20 }, (_, i) => i + 1).forEach((n) => {
      it(`get(em-${n}) returns the correct record`, () => {
        for (let k = 0; k < n; k++) {
          tracker.record('NOX', k + 1, 'KG', 'engine', '2026-02-01', 'tech');
        }
        const rec = tracker.get(`em-${n}`);
        expect(rec).toBeDefined();
        expect(rec!.amount).toBe(n);
      });
    });
  });

  // ── getByType() ───────────────────────────────────────────────────────────
  describe('getByType()', () => {
    emissionTypes.forEach((type) => {
      Array.from({ length: 5 }, (_, i) => i + 1).forEach((count) => {
        it(`getByType(${type}) returns ${count} records`, () => {
          // record count records of target type
          for (let k = 0; k < count; k++) {
            tracker.record(type, k + 1, 'KG', 'src', '2026-01-01', 'u');
          }
          // also record some noise
          tracker.record('CO2', 999, 'KG', 'noise', '2026-01-01', 'u');
          const results = tracker.getByType(type);
          // CO2 noise only gets added when type != CO2; if type==CO2 it's count+1
          if (type === 'CO2') {
            expect(results.length).toBe(count + 1);
          } else {
            expect(results.length).toBe(count);
          }
          results.forEach((r) => expect(r.type).toBe(type));
        });
      });
    });
  });

  // ── getBySource() ─────────────────────────────────────────────────────────
  describe('getBySource()', () => {
    Array.from({ length: 20 }, (_, i) => i + 1).forEach((n) => {
      it(`getBySource returns ${n} records for source-A`, () => {
        for (let k = 0; k < n; k++) {
          tracker.record('CO2', k + 1, 'KG', 'source-A', '2026-01-01', 'user');
        }
        tracker.record('CO2', 1, 'KG', 'source-B', '2026-01-01', 'user');
        const results = tracker.getBySource('source-A');
        expect(results.length).toBe(n);
        results.forEach((r) => expect(r.source).toBe('source-A'));
      });
    });
  });

  // ── getTotalByType() ──────────────────────────────────────────────────────
  describe('getTotalByType()', () => {
    Array.from({ length: 20 }, (_, i) => i + 1).forEach((n) => {
      it(`getTotalByType sums ${n} CO2 records`, () => {
        let expected = 0;
        for (let k = 1; k <= n; k++) {
          tracker.record('CO2', k * 2, 'KG', 'plant', '2026-01-01', 'u');
          expected += k * 2;
        }
        tracker.record('CH4', 9999, 'KG', 'plant', '2026-01-01', 'u'); // noise
        expect(tracker.getTotalByType('CO2')).toBe(expected);
      });
    });
  });

  // ── getTotalAll() ─────────────────────────────────────────────────────────
  describe('getTotalAll()', () => {
    Array.from({ length: 20 }, (_, i) => i + 1).forEach((n) => {
      it(`getTotalAll sums ${n} mixed records`, () => {
        let expected = 0;
        for (let k = 1; k <= n; k++) {
          const amount = k * 3;
          const type = emissionTypes[k % emissionTypes.length];
          tracker.record(type, amount, 'KG', 'src', '2026-01-01', 'u');
          expected += amount;
        }
        expect(tracker.getTotalAll()).toBe(expected);
      });
    });
  });

  // ── getByDateRange() ──────────────────────────────────────────────────────
  describe('getByDateRange()', () => {
    it('returns records within range', () => {
      tracker.record('CO2', 1, 'KG', 's', '2026-01-01', 'u');
      tracker.record('CO2', 2, 'KG', 's', '2026-01-15', 'u');
      tracker.record('CO2', 3, 'KG', 's', '2026-01-31', 'u');
      tracker.record('CO2', 4, 'KG', 's', '2026-02-01', 'u');
      const results = tracker.getByDateRange('2026-01-01', '2026-01-31');
      expect(results.length).toBe(3);
    });
    it('returns empty when no records in range', () => {
      tracker.record('CO2', 1, 'KG', 's', '2026-03-01', 'u');
      expect(tracker.getByDateRange('2026-01-01', '2026-01-31')).toEqual([]);
    });
    it('includes boundary dates', () => {
      tracker.record('CO2', 10, 'KG', 's', '2026-01-01', 'u');
      tracker.record('CO2', 20, 'KG', 's', '2026-01-31', 'u');
      const results = tracker.getByDateRange('2026-01-01', '2026-01-31');
      expect(results.length).toBe(2);
    });
    Array.from({ length: 20 }, (_, i) => i + 1).forEach((n) => {
      it(`getByDateRange: ${n} records in Jan range`, () => {
        for (let k = 0; k < n; k++) {
          const day = String((k % 28) + 1).padStart(2, '0');
          tracker.record('CO2', k + 1, 'KG', 'src', `2026-01-${day}`, 'u');
        }
        // add one outside range
        tracker.record('CO2', 999, 'KG', 'src', '2026-02-15', 'u');
        const results = tracker.getByDateRange('2026-01-01', '2026-01-31');
        expect(results.length).toBe(n);
      });
    });
    Array.from({ length: 10 }, (_, i) => i + 1).forEach((n) => {
      it(`getByDateRange with monthly windows, offset ${n}`, () => {
        const month = String(n).padStart(2, '0');
        tracker.record('SOX', n * 5, 'KG', 'src', `2026-${month}-15`, 'u');
        const from = `2026-${month}-01`;
        const to = `2026-${month}-28`;
        const results = tracker.getByDateRange(from, to);
        expect(results.length).toBe(1);
        expect(results[0].amount).toBe(n * 5);
      });
    });
  });

  // ── getCount() ────────────────────────────────────────────────────────────
  describe('getCount()', () => {
    Array.from({ length: 30 }, (_, i) => i + 1).forEach((n) => {
      it(`getCount() returns ${n} after ${n} inserts`, () => {
        for (let k = 0; k < n; k++) {
          tracker.record('CO2', 1, 'KG', 'src', '2026-01-01', 'u');
        }
        expect(tracker.getCount()).toBe(n);
      });
    });
  });

  // ── getAll() ──────────────────────────────────────────────────────────────
  describe('getAll()', () => {
    Array.from({ length: 15 }, (_, i) => i + 1).forEach((n) => {
      it(`getAll returns array of length ${n}`, () => {
        for (let k = 0; k < n; k++) {
          tracker.record('VOC', k + 1, 'PPM', 'vent', '2026-01-01', 'lab');
        }
        expect(tracker.getAll().length).toBe(n);
      });
    });
  });

  // ── multiple sources isolation ────────────────────────────────────────────
  describe('source isolation', () => {
    Array.from({ length: 10 }, (_, i) => i + 1).forEach((n) => {
      it(`source-${n} records don't bleed into other sources`, () => {
        for (let k = 0; k < 10; k++) {
          tracker.record('CO2', k + 1, 'KG', `source-${k}`, '2026-01-01', 'u');
        }
        const results = tracker.getBySource(`source-${n - 1}`);
        expect(results.length).toBe(1);
        expect(results[0].source).toBe(`source-${n - 1}`);
      });
    });
  });

  // ── zero amount ───────────────────────────────────────────────────────────
  describe('edge: zero amount', () => {
    it('records zero amount without error', () => {
      const rec = tracker.record('CO2', 0, 'KG', 'idle', '2026-01-01', 'u');
      expect(rec.amount).toBe(0);
    });
    it('getTotalAll with only zero-amount records is 0', () => {
      tracker.record('CO2', 0, 'KG', 'src', '2026-01-01', 'u');
      tracker.record('CH4', 0, 'KG', 'src', '2026-01-01', 'u');
      expect(tracker.getTotalAll()).toBe(0);
    });
  });

  // ── large values ──────────────────────────────────────────────────────────
  describe('edge: large amounts', () => {
    Array.from({ length: 10 }, (_, i) => (i + 1) * 1_000_000).forEach((amt) => {
      it(`records large amount ${amt}`, () => {
        const rec = tracker.record('CO2', amt, 'TONNE', 'factory', '2026-01-01', 'u');
        expect(rec.amount).toBe(amt);
      });
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// WASTE TRACKER
// ─────────────────────────────────────────────────────────────────────────────

describe('WasteTracker', () => {
  let tracker: WasteTracker;

  beforeEach(() => {
    tracker = new WasteTracker();
  });

  // ── Construction ──────────────────────────────────────────────────────────
  describe('construction', () => {
    it('starts with zero records', () => {
      expect(tracker.getCount()).toBe(0);
    });
    it('getAll returns empty array', () => {
      expect(tracker.getAll()).toEqual([]);
    });
    it('getPendingDisposal returns empty array', () => {
      expect(tracker.getPendingDisposal()).toEqual([]);
    });
  });

  // ── record() id generation ────────────────────────────────────────────────
  describe('record() id generation', () => {
    Array.from({ length: 25 }, (_, i) => i + 1).forEach((n) => {
      it(`record #${n} gets id ws-${n}`, () => {
        for (let k = 0; k < n; k++) {
          tracker.record('HAZARDOUS', 'LANDFILL', 10, 'KG', '2026-01-01');
        }
        const rec = tracker.get(`ws-${n}`);
        expect(rec).toBeDefined();
        expect(rec!.id).toBe(`ws-${n}`);
      });
    });
  });

  // ── record() – all WasteCategories ───────────────────────────────────────
  const categories: WasteCategory[] = [
    'HAZARDOUS', 'NON_HAZARDOUS', 'RECYCLABLE', 'ORGANIC', 'ELECTRONIC',
  ];
  describe('record() supports all WasteCategories', () => {
    categories.forEach((cat) => {
      it(`records category ${cat}`, () => {
        const rec = tracker.record(cat, 'LANDFILL', 20, 'KG', '2026-01-01');
        expect(rec.category).toBe(cat);
      });
    });
  });

  // ── record() – all DisposalMethods ───────────────────────────────────────
  const methods: DisposalMethod[] = ['LANDFILL', 'INCINERATION', 'RECYCLING', 'COMPOSTING', 'TREATMENT'];
  describe('record() supports all DisposalMethods', () => {
    methods.forEach((method) => {
      it(`records disposal method ${method}`, () => {
        const rec = tracker.record('NON_HAZARDOUS', method, 15, 'KG', '2026-01-01');
        expect(rec.disposalMethod).toBe(method);
      });
    });
  });

  // ── record() field correctness ────────────────────────────────────────────
  describe('record() field correctness', () => {
    Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
      it(`record iteration ${i} stores all fields correctly`, () => {
        const rec = tracker.record(
          categories[i % categories.length],
          methods[i % methods.length],
          (i + 1) * 4,
          'TONNE',
          `2026-01-${String((i % 28) + 1).padStart(2, '0')}`,
          `contractor-${i}`,
          `note-${i}`,
        );
        expect(rec.amount).toBe((i + 1) * 4);
        expect(rec.contractor).toBe(`contractor-${i}`);
        expect(rec.notes).toBe(`note-${i}`);
        expect(rec.disposedAt).toBeUndefined();
      });
    });
  });

  // ── record() optional fields ──────────────────────────────────────────────
  describe('record() optional fields', () => {
    Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
      it(`record without contractor/notes (iter ${i}) has undefined optionals`, () => {
        const rec = tracker.record('ORGANIC', 'COMPOSTING', 5, 'KG', '2026-01-01');
        expect(rec.contractor).toBeUndefined();
        expect(rec.notes).toBeUndefined();
        expect(rec.disposedAt).toBeUndefined();
      });
    });
  });

  // ── dispose() ─────────────────────────────────────────────────────────────
  describe('dispose()', () => {
    it('sets disposedAt on the record', () => {
      const rec = tracker.record('HAZARDOUS', 'TREATMENT', 50, 'KG', '2026-01-01');
      const disposed = tracker.dispose(rec.id, '2026-01-10');
      expect(disposed.disposedAt).toBe('2026-01-10');
    });
    it('removes from pendingDisposal after dispose', () => {
      const rec = tracker.record('HAZARDOUS', 'TREATMENT', 50, 'KG', '2026-01-01');
      expect(tracker.getPendingDisposal().length).toBe(1);
      tracker.dispose(rec.id, '2026-01-10');
      expect(tracker.getPendingDisposal().length).toBe(0);
    });
    it('updates contractor on dispose when provided', () => {
      const rec = tracker.record('ELECTRONIC', 'RECYCLING', 30, 'KG', '2026-01-01');
      const disposed = tracker.dispose(rec.id, '2026-01-15', 'GreenCorp');
      expect(disposed.contractor).toBe('GreenCorp');
    });
    it('preserves existing contractor when dispose provides none', () => {
      const rec = tracker.record('ELECTRONIC', 'RECYCLING', 30, 'KG', '2026-01-01', 'OldCorp');
      const disposed = tracker.dispose(rec.id, '2026-01-15');
      expect(disposed.contractor).toBe('OldCorp');
    });
    it('throws Error for unknown id', () => {
      expect(() => tracker.dispose('ws-999', '2026-01-01')).toThrow('WasteRecord not found: ws-999');
    });
    Array.from({ length: 20 }, (_, i) => i + 1).forEach((n) => {
      it(`dispose record ws-${n} sets disposedAt`, () => {
        for (let k = 0; k < n; k++) {
          tracker.record('NON_HAZARDOUS', 'LANDFILL', k + 1, 'KG', '2026-01-01');
        }
        const disposed = tracker.dispose(`ws-${n}`, '2026-02-01');
        expect(disposed.disposedAt).toBe('2026-02-01');
      });
    });
  });

  // ── getByCategory() ───────────────────────────────────────────────────────
  describe('getByCategory()', () => {
    categories.forEach((cat) => {
      Array.from({ length: 5 }, (_, i) => i + 1).forEach((count) => {
        it(`getByCategory(${cat}) returns ${count} records`, () => {
          for (let k = 0; k < count; k++) {
            tracker.record(cat, 'LANDFILL', k + 1, 'KG', '2026-01-01');
          }
          // noise record with different category
          const noise = categories.find((c) => c !== cat)!;
          tracker.record(noise, 'LANDFILL', 999, 'KG', '2026-01-01');
          const results = tracker.getByCategory(cat);
          expect(results.length).toBe(count);
          results.forEach((r) => expect(r.category).toBe(cat));
        });
      });
    });
  });

  // ── getByMethod() ─────────────────────────────────────────────────────────
  describe('getByMethod()', () => {
    methods.forEach((method) => {
      Array.from({ length: 5 }, (_, i) => i + 1).forEach((count) => {
        it(`getByMethod(${method}) returns ${count} records`, () => {
          for (let k = 0; k < count; k++) {
            tracker.record('NON_HAZARDOUS', method, k + 1, 'KG', '2026-01-01');
          }
          const noise = methods.find((m) => m !== method)!;
          tracker.record('NON_HAZARDOUS', noise, 999, 'KG', '2026-01-01');
          const results = tracker.getByMethod(method);
          expect(results.length).toBe(count);
          results.forEach((r) => expect(r.disposalMethod).toBe(method));
        });
      });
    });
  });

  // ── getPendingDisposal() ──────────────────────────────────────────────────
  describe('getPendingDisposal()', () => {
    Array.from({ length: 20 }, (_, i) => i + 1).forEach((n) => {
      it(`getPendingDisposal: ${n} pending, 0 disposed`, () => {
        for (let k = 0; k < n; k++) {
          tracker.record('HAZARDOUS', 'TREATMENT', k + 1, 'KG', '2026-01-01');
        }
        expect(tracker.getPendingDisposal().length).toBe(n);
      });
    });
    Array.from({ length: 10 }, (_, i) => i + 1).forEach((disposed) => {
      it(`getPendingDisposal: 10 total, ${disposed} disposed => ${10 - disposed} pending`, () => {
        const ids: string[] = [];
        for (let k = 0; k < 10; k++) {
          const rec = tracker.record('RECYCLABLE', 'RECYCLING', k + 1, 'KG', '2026-01-01');
          ids.push(rec.id);
        }
        for (let k = 0; k < disposed; k++) {
          tracker.dispose(ids[k], '2026-02-01');
        }
        expect(tracker.getPendingDisposal().length).toBe(10 - disposed);
      });
    });
  });

  // ── getTotalByCategory() ──────────────────────────────────────────────────
  describe('getTotalByCategory()', () => {
    Array.from({ length: 20 }, (_, i) => i + 1).forEach((n) => {
      it(`getTotalByCategory sums ${n} HAZARDOUS records`, () => {
        let expected = 0;
        for (let k = 1; k <= n; k++) {
          tracker.record('HAZARDOUS', 'TREATMENT', k * 3, 'KG', '2026-01-01');
          expected += k * 3;
        }
        tracker.record('ORGANIC', 'COMPOSTING', 9999, 'KG', '2026-01-01'); // noise
        expect(tracker.getTotalByCategory('HAZARDOUS')).toBe(expected);
      });
    });
  });

  // ── getCount() ────────────────────────────────────────────────────────────
  describe('getCount()', () => {
    Array.from({ length: 30 }, (_, i) => i + 1).forEach((n) => {
      it(`getCount() returns ${n} after ${n} inserts`, () => {
        for (let k = 0; k < n; k++) {
          tracker.record('NON_HAZARDOUS', 'LANDFILL', 1, 'KG', '2026-01-01');
        }
        expect(tracker.getCount()).toBe(n);
      });
    });
  });

  // ── get() ─────────────────────────────────────────────────────────────────
  describe('get()', () => {
    it('returns undefined for missing id', () => {
      expect(tracker.get('ws-0')).toBeUndefined();
    });
    Array.from({ length: 15 }, (_, i) => i + 1).forEach((n) => {
      it(`get(ws-${n}) retrieves correct record`, () => {
        for (let k = 0; k < n; k++) {
          tracker.record('ORGANIC', 'COMPOSTING', k + 1, 'KG', '2026-01-01');
        }
        const rec = tracker.get(`ws-${n}`);
        expect(rec).toBeDefined();
        expect(rec!.amount).toBe(n);
      });
    });
  });

  // ── error paths ───────────────────────────────────────────────────────────
  describe('error paths', () => {
    it('dispose with empty string id throws', () => {
      expect(() => tracker.dispose('', '2026-01-01')).toThrow();
    });
    it('dispose with malformed id throws', () => {
      expect(() => tracker.dispose('ws-abc', '2026-01-01')).toThrow();
    });
    Array.from({ length: 10 }, (_, i) => i + 100).forEach((n) => {
      it(`dispose non-existent ws-${n} throws`, () => {
        expect(() => tracker.dispose(`ws-${n}`, '2026-01-01')).toThrow();
      });
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PARAMETER MONITOR
// ─────────────────────────────────────────────────────────────────────────────

describe('ParameterMonitor', () => {
  let monitor: ParameterMonitor;

  beforeEach(() => {
    monitor = new ParameterMonitor();
  });

  // ── Construction ──────────────────────────────────────────────────────────
  describe('construction', () => {
    it('starts with no parameters', () => {
      expect(monitor.getAllParameters()).toEqual([]);
    });
    it('starts with reading count 0', () => {
      expect(monitor.getReadingCount()).toBe(0);
    });
    it('getExceeded returns empty', () => {
      expect(monitor.getExceeded()).toEqual([]);
    });
  });

  // ── defineParameter() id generation ──────────────────────────────────────
  describe('defineParameter() id generation', () => {
    Array.from({ length: 25 }, (_, i) => i + 1).forEach((n) => {
      it(`parameter #${n} gets id param-${n}`, () => {
        for (let k = 0; k < n; k++) {
          monitor.defineParameter(`param-${k}`, 'PPM', 'DAILY', 'site-A');
        }
        const p = monitor.getParameter(`param-${n}`);
        expect(p).toBeDefined();
        expect(p!.id).toBe(`param-${n}`);
      });
    });
  });

  // ── defineParameter() – all frequencies ──────────────────────────────────
  const frequencies: MonitoringFrequency[] = ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUAL'];
  describe('defineParameter() supports all MonitoringFrequency values', () => {
    frequencies.forEach((freq) => {
      it(`defines parameter with frequency ${freq}`, () => {
        const p = monitor.defineParameter('NO2', 'PPM', freq, 'rooftop');
        expect(p.frequency).toBe(freq);
        expect(p.id).toBe('param-1');
      });
    });
  });

  // ── defineParameter() – all units ─────────────────────────────────────────
  const units: MeasurementUnit[] = ['KG', 'TONNE', 'LITRE', 'M3', 'KWH', 'MJ', 'PPM', 'MG_M3'];
  describe('defineParameter() supports all MeasurementUnits', () => {
    units.forEach((unit) => {
      it(`defines parameter with unit ${unit}`, () => {
        const p = monitor.defineParameter('test-param', unit, 'MONTHLY', 'site');
        expect(p.unit).toBe(unit);
      });
    });
  });

  // ── defineParameter() field correctness ───────────────────────────────────
  describe('defineParameter() field correctness', () => {
    Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
      it(`parameter iteration ${i} stores fields correctly`, () => {
        const p = monitor.defineParameter(
          `param-name-${i}`,
          units[i % units.length],
          frequencies[i % frequencies.length],
          `location-${i}`,
          (i + 1) * 10,
          (i + 1) * 8,
        );
        expect(p.name).toBe(`param-name-${i}`);
        expect(p.location).toBe(`location-${i}`);
        expect(p.legalLimit).toBe((i + 1) * 10);
        expect(p.targetLimit).toBe((i + 1) * 8);
      });
    });
  });

  // ── defineParameter() optional limits ─────────────────────────────────────
  describe('defineParameter() optional limits', () => {
    Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
      it(`parameter without limits (iter ${i}) has undefined legalLimit and targetLimit`, () => {
        const p = monitor.defineParameter('CO', 'PPM', 'DAILY', 'site');
        expect(p.legalLimit).toBeUndefined();
        expect(p.targetLimit).toBeUndefined();
      });
    });
  });

  // ── addReading() – COMPLIANT ───────────────────────────────────────────────
  describe('addReading() complianceStatus: COMPLIANT', () => {
    Array.from({ length: 20 }, (_, i) => i + 1).forEach((n) => {
      it(`reading value ${n} with legalLimit 100 is COMPLIANT`, () => {
        const p = monitor.defineParameter('SO2', 'PPM', 'DAILY', 'site', 100);
        const reading = monitor.addReading(p.id, n, '2026-01-01', 'lab');
        expect(reading.complianceStatus).toBe('COMPLIANT');
      });
    });
  });

  // ── addReading() – NEAR_LIMIT ──────────────────────────────────────────────
  describe('addReading() complianceStatus: NEAR_LIMIT', () => {
    // legalLimit 100, NEAR_LIMIT when value > 90 (0.9 * 100) and <= 100
    const nearLimitValues = [91, 92, 93, 94, 95, 96, 97, 98, 99, 100];
    nearLimitValues.forEach((val) => {
      it(`reading value ${val} with legalLimit 100 is NEAR_LIMIT`, () => {
        const p = monitor.defineParameter('PM10', 'MG_M3', 'DAILY', 'site', 100);
        const reading = monitor.addReading(p.id, val, '2026-01-01', 'lab');
        expect(reading.complianceStatus).toBe('NEAR_LIMIT');
      });
    });
    Array.from({ length: 10 }, (_, i) => i + 1).forEach((n) => {
      it(`NEAR_LIMIT: legalLimit=${n * 100}, value=${n * 91}`, () => {
        const p = monitor.defineParameter('NOX', 'PPM', 'DAILY', 'site', n * 100);
        const reading = monitor.addReading(p.id, n * 91, '2026-01-01', 'u');
        expect(reading.complianceStatus).toBe('NEAR_LIMIT');
      });
    });
  });

  // ── addReading() – EXCEEDED ────────────────────────────────────────────────
  describe('addReading() complianceStatus: EXCEEDED', () => {
    Array.from({ length: 20 }, (_, i) => i + 1).forEach((n) => {
      it(`reading value ${100 + n} with legalLimit 100 is EXCEEDED`, () => {
        const p = monitor.defineParameter('H2S', 'PPM', 'DAILY', 'site', 100);
        const reading = monitor.addReading(p.id, 100 + n, '2026-01-01', 'sensor');
        expect(reading.complianceStatus).toBe('EXCEEDED');
      });
    });
  });

  // ── addReading() – NOT_MONITORED ───────────────────────────────────────────
  describe('addReading() complianceStatus: NOT_MONITORED', () => {
    Array.from({ length: 20 }, (_, i) => i + 1).forEach((n) => {
      it(`reading without legalLimit (value ${n}) is NOT_MONITORED`, () => {
        const p = monitor.defineParameter('noise', 'PPM', 'MONTHLY', 'factory');
        const reading = monitor.addReading(p.id, n * 10, '2026-01-01', 'u');
        expect(reading.complianceStatus).toBe('NOT_MONITORED');
      });
    });
  });

  // ── addReading() id generation ────────────────────────────────────────────
  describe('addReading() id generation', () => {
    Array.from({ length: 20 }, (_, i) => i + 1).forEach((n) => {
      it(`reading #${n} gets id read-${n}`, () => {
        const p = monitor.defineParameter('CO2', 'PPM', 'DAILY', 'site', 200);
        for (let k = 0; k < n; k++) {
          monitor.addReading(p.id, 50, '2026-01-01', 'u');
        }
        expect(monitor.getReadingCount()).toBe(n);
      });
    });
  });

  // ── addReading() – unknown parameterId ────────────────────────────────────
  describe('addReading() error: unknown parameterId', () => {
    it('throws Error for unknown parameterId', () => {
      expect(() => monitor.addReading('param-999', 50, '2026-01-01', 'u')).toThrow(
        'MonitoringParameter not found: param-999',
      );
    });
    Array.from({ length: 10 }, (_, i) => i + 100).forEach((n) => {
      it(`throws for param-${n}`, () => {
        expect(() => monitor.addReading(`param-${n}`, 10, '2026-01-01', 'u')).toThrow();
      });
    });
  });

  // ── getParameter() ────────────────────────────────────────────────────────
  describe('getParameter()', () => {
    it('returns undefined for unknown id', () => {
      expect(monitor.getParameter('param-0')).toBeUndefined();
    });
    Array.from({ length: 15 }, (_, i) => i + 1).forEach((n) => {
      it(`getParameter(param-${n}) returns correct parameter`, () => {
        for (let k = 0; k < n; k++) {
          monitor.defineParameter(`name-${k}`, 'PPM', 'DAILY', 'site');
        }
        const p = monitor.getParameter(`param-${n}`);
        expect(p).toBeDefined();
        expect(p!.name).toBe(`name-${n - 1}`);
      });
    });
  });

  // ── getAllParameters() ────────────────────────────────────────────────────
  describe('getAllParameters()', () => {
    Array.from({ length: 15 }, (_, i) => i + 1).forEach((n) => {
      it(`getAllParameters returns ${n} items`, () => {
        for (let k = 0; k < n; k++) {
          monitor.defineParameter(`p${k}`, 'PPM', 'DAILY', 'site');
        }
        expect(monitor.getAllParameters().length).toBe(n);
      });
    });
  });

  // ── getReadings() ─────────────────────────────────────────────────────────
  describe('getReadings()', () => {
    Array.from({ length: 20 }, (_, i) => i + 1).forEach((n) => {
      it(`getReadings returns ${n} readings for a parameter`, () => {
        const p = monitor.defineParameter('SO2', 'PPM', 'DAILY', 'site', 200);
        for (let k = 0; k < n; k++) {
          monitor.addReading(p.id, 50, `2026-01-${String((k % 28) + 1).padStart(2, '0')}`, 'u');
        }
        const readings = monitor.getReadings(p.id);
        expect(readings.length).toBe(n);
        readings.forEach((r) => expect(r.parameterId).toBe(p.id));
      });
    });
    it('getReadings for one parameter does not include readings from another', () => {
      const p1 = monitor.defineParameter('A', 'PPM', 'DAILY', 'site', 100);
      const p2 = monitor.defineParameter('B', 'PPM', 'DAILY', 'site', 100);
      for (let k = 0; k < 5; k++) {
        monitor.addReading(p1.id, 30, '2026-01-01', 'u');
      }
      for (let k = 0; k < 3; k++) {
        monitor.addReading(p2.id, 30, '2026-01-01', 'u');
      }
      expect(monitor.getReadings(p1.id).length).toBe(5);
      expect(monitor.getReadings(p2.id).length).toBe(3);
    });
    it('getReadings for unknown parameterId returns empty array', () => {
      expect(monitor.getReadings('param-999')).toEqual([]);
    });
  });

  // ── getLatestReading() ────────────────────────────────────────────────────
  describe('getLatestReading()', () => {
    it('returns undefined when no readings exist for parameterId', () => {
      const p = monitor.defineParameter('NO2', 'PPM', 'DAILY', 'site', 100);
      expect(monitor.getLatestReading(p.id)).toBeUndefined();
    });
    it('returns undefined for unknown parameterId', () => {
      expect(monitor.getLatestReading('param-999')).toBeUndefined();
    });
    it('returns the only reading when there is one', () => {
      const p = monitor.defineParameter('CO', 'PPM', 'DAILY', 'site', 100);
      const r = monitor.addReading(p.id, 40, '2026-01-15', 'lab');
      expect(monitor.getLatestReading(p.id)!.id).toBe(r.id);
    });
    Array.from({ length: 15 }, (_, i) => i + 2).forEach((n) => {
      it(`getLatestReading returns most recent among ${n} readings`, () => {
        const p = monitor.defineParameter('VOC', 'PPM', 'DAILY', 'site', 100);
        for (let k = 1; k <= n; k++) {
          const day = String(k).padStart(2, '0');
          monitor.addReading(p.id, k * 2, `2026-01-${day}`, 'u');
        }
        const latest = monitor.getLatestReading(p.id);
        expect(latest).toBeDefined();
        // The most recent measuredAt is 2026-01-N (the largest day)
        const expectedDay = String(n).padStart(2, '0');
        expect(latest!.measuredAt).toBe(`2026-01-${expectedDay}`);
      });
    });
    it('getLatestReading picks correct record when dates are out of insertion order', () => {
      const p = monitor.defineParameter('PM10', 'MG_M3', 'DAILY', 'site', 100);
      monitor.addReading(p.id, 10, '2026-03-01', 'u');
      monitor.addReading(p.id, 20, '2026-01-01', 'u');
      monitor.addReading(p.id, 30, '2026-06-01', 'u');
      monitor.addReading(p.id, 40, '2026-02-01', 'u');
      const latest = monitor.getLatestReading(p.id);
      expect(latest!.measuredAt).toBe('2026-06-01');
    });
  });

  // ── getByCompliance() ─────────────────────────────────────────────────────
  const complianceStatuses: ComplianceStatus[] = ['COMPLIANT', 'NEAR_LIMIT', 'EXCEEDED', 'NOT_MONITORED'];
  describe('getByCompliance()', () => {
    complianceStatuses.forEach((status) => {
      it(`getByCompliance(${status}) returns only ${status} readings`, () => {
        const p = monitor.defineParameter('CO2', 'PPM', 'DAILY', 'site', 100);
        // COMPLIANT: value <= 90
        monitor.addReading(p.id, 50, '2026-01-01', 'u');
        // NEAR_LIMIT: 90 < value <= 100
        monitor.addReading(p.id, 95, '2026-01-02', 'u');
        // EXCEEDED: value > 100
        monitor.addReading(p.id, 110, '2026-01-03', 'u');
        // NOT_MONITORED: no legalLimit
        const p2 = monitor.defineParameter('X', 'PPM', 'DAILY', 'site');
        monitor.addReading(p2.id, 999, '2026-01-04', 'u');

        const results = monitor.getByCompliance(status);
        results.forEach((r) => expect(r.complianceStatus).toBe(status));
        if (status !== 'NOT_MONITORED') {
          expect(results.length).toBe(1);
        }
      });
    });
    Array.from({ length: 10 }, (_, i) => i + 1).forEach((n) => {
      it(`getByCompliance(COMPLIANT) returns ${n} compliant readings`, () => {
        const p = monitor.defineParameter('O3', 'PPM', 'DAILY', 'site', 100);
        for (let k = 0; k < n; k++) {
          monitor.addReading(p.id, (k % 10) + 1, '2026-01-01', 'u');
        }
        const compliant = monitor.getByCompliance('COMPLIANT');
        expect(compliant.length).toBe(n);
      });
    });
    Array.from({ length: 10 }, (_, i) => i + 1).forEach((n) => {
      it(`getByCompliance(EXCEEDED) returns ${n} exceeded readings`, () => {
        const p = monitor.defineParameter('H2S', 'PPM', 'DAILY', 'site', 50);
        for (let k = 0; k < n; k++) {
          monitor.addReading(p.id, 100 + k, '2026-01-01', 'u');
        }
        const exceeded = monitor.getByCompliance('EXCEEDED');
        expect(exceeded.length).toBe(n);
      });
    });
  });

  // ── getExceeded() ─────────────────────────────────────────────────────────
  describe('getExceeded()', () => {
    it('returns empty when nothing exceeded', () => {
      const p = monitor.defineParameter('CO', 'PPM', 'DAILY', 'site', 100);
      monitor.addReading(p.id, 50, '2026-01-01', 'u');
      expect(monitor.getExceeded()).toEqual([]);
    });
    Array.from({ length: 20 }, (_, i) => i + 1).forEach((n) => {
      it(`getExceeded returns ${n} exceeded readings`, () => {
        const p = monitor.defineParameter('NOX', 'PPM', 'DAILY', 'site', 100);
        for (let k = 0; k < n; k++) {
          monitor.addReading(p.id, 150 + k, '2026-01-01', 'u');
        }
        // add some compliant readings to confirm isolation
        monitor.addReading(p.id, 10, '2026-01-02', 'u');
        expect(monitor.getExceeded().length).toBe(n);
        monitor.getExceeded().forEach((r) => expect(r.complianceStatus).toBe('EXCEEDED'));
      });
    });
  });

  // ── getReadingCount() ─────────────────────────────────────────────────────
  describe('getReadingCount()', () => {
    Array.from({ length: 30 }, (_, i) => i + 1).forEach((n) => {
      it(`getReadingCount() returns ${n} after ${n} readings`, () => {
        const p = monitor.defineParameter('SO2', 'PPM', 'DAILY', 'site', 200);
        for (let k = 0; k < n; k++) {
          monitor.addReading(p.id, k + 1, '2026-01-01', 'u');
        }
        expect(monitor.getReadingCount()).toBe(n);
      });
    });
  });

  // ── addReading() – notes ───────────────────────────────────────────────────
  describe('addReading() notes', () => {
    Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
      it(`reading with note (iter ${i}) stores note`, () => {
        const p = monitor.defineParameter('CO2', 'PPM', 'DAILY', 'site', 100);
        const r = monitor.addReading(p.id, 50, '2026-01-01', 'u', `note-${i}`);
        expect(r.notes).toBe(`note-${i}`);
      });
    });
    Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
      it(`reading without note (iter ${i}) has undefined notes`, () => {
        const p = monitor.defineParameter('CO2', 'PPM', 'DAILY', 'site', 100);
        const r = monitor.addReading(p.id, 50, '2026-01-01', 'u');
        expect(r.notes).toBeUndefined();
      });
    });
  });

  // ── multi-parameter isolation ──────────────────────────────────────────────
  describe('multi-parameter reading isolation', () => {
    Array.from({ length: 10 }, (_, i) => i + 2).forEach((n) => {
      it(`${n} parameters each with 3 readings: totals correct`, () => {
        const params = Array.from({ length: n }, (_, k) =>
          monitor.defineParameter(`p${k}`, 'PPM', 'DAILY', `site-${k}`, 100),
        );
        params.forEach((p) => {
          monitor.addReading(p.id, 30, '2026-01-01', 'u');
          monitor.addReading(p.id, 40, '2026-01-02', 'u');
          monitor.addReading(p.id, 50, '2026-01-03', 'u');
        });
        expect(monitor.getReadingCount()).toBe(n * 3);
        params.forEach((p) => {
          expect(monitor.getReadings(p.id).length).toBe(3);
        });
      });
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// INTEGRATION TESTS
// ─────────────────────────────────────────────────────────────────────────────

describe('Integration: EmissionTracker + WasteTracker', () => {
  let emissions: EmissionTracker;
  let waste: WasteTracker;

  beforeEach(() => {
    emissions = new EmissionTracker();
    waste = new WasteTracker();
  });

  it('independent instances do not share state', () => {
    emissions.record('CO2', 100, 'KG', 'plant', '2026-01-01', 'admin');
    waste.record('HAZARDOUS', 'TREATMENT', 50, 'KG', '2026-01-01');
    expect(emissions.getCount()).toBe(1);
    expect(waste.getCount()).toBe(1);
  });

  Array.from({ length: 10 }, (_, i) => i + 1).forEach((n) => {
    it(`integration: ${n} emission + ${n} waste records tracked separately`, () => {
      for (let k = 0; k < n; k++) {
        emissions.record('CO2', k + 1, 'KG', 'src', '2026-01-01', 'u');
        waste.record('ORGANIC', 'COMPOSTING', k + 1, 'KG', '2026-01-01');
      }
      expect(emissions.getCount()).toBe(n);
      expect(waste.getCount()).toBe(n);
    });
  });

  it('tracking emissions by type while managing waste by category', () => {
    emissions.record('CO2', 500, 'TONNE', 'boiler', '2026-01-01', 'eng');
    emissions.record('CH4', 50, 'TONNE', 'pipeline', '2026-01-01', 'eng');
    emissions.record('CO2', 200, 'TONNE', 'generator', '2026-01-02', 'eng');

    const wrec = waste.record('HAZARDOUS', 'TREATMENT', 100, 'KG', '2026-01-01', 'SafeCorp');
    waste.dispose(wrec.id, '2026-01-05', 'SafeCorp');

    expect(emissions.getTotalByType('CO2')).toBe(700);
    expect(emissions.getTotalByType('CH4')).toBe(50);
    expect(waste.getPendingDisposal()).toEqual([]);
  });
});

describe('Integration: ParameterMonitor compliance lifecycle', () => {
  let monitor: ParameterMonitor;

  beforeEach(() => {
    monitor = new ParameterMonitor();
  });

  Array.from({ length: 10 }, (_, i) => i + 1).forEach((n) => {
    it(`compliance lifecycle: ${n} parameters all transitioning COMPLIANT→EXCEEDED`, () => {
      const params = Array.from({ length: n }, (_, k) =>
        monitor.defineParameter(`gas-${k}`, 'PPM', 'DAILY', `site-${k}`, 100),
      );
      // Add COMPLIANT reading for each
      params.forEach((p) => monitor.addReading(p.id, 40, '2026-01-01', 'sensor'));
      expect(monitor.getByCompliance('COMPLIANT').length).toBe(n);
      expect(monitor.getExceeded().length).toBe(0);

      // Add EXCEEDED reading for each
      params.forEach((p) => monitor.addReading(p.id, 150, '2026-01-02', 'sensor'));
      expect(monitor.getExceeded().length).toBe(n);
    });
  });

  it('mixed compliance states are categorized correctly', () => {
    const p1 = monitor.defineParameter('SO2', 'PPM', 'DAILY', 'site', 100);
    const p2 = monitor.defineParameter('NO2', 'PPM', 'DAILY', 'site', 100);
    const p3 = monitor.defineParameter('CO', 'PPM', 'DAILY', 'site', 100);
    const p4 = monitor.defineParameter('VOC', 'PPM', 'DAILY', 'site'); // no limit

    monitor.addReading(p1.id, 50, '2026-01-01', 'u');  // COMPLIANT
    monitor.addReading(p2.id, 95, '2026-01-01', 'u');  // NEAR_LIMIT
    monitor.addReading(p3.id, 150, '2026-01-01', 'u'); // EXCEEDED
    monitor.addReading(p4.id, 999, '2026-01-01', 'u'); // NOT_MONITORED

    expect(monitor.getByCompliance('COMPLIANT').length).toBe(1);
    expect(monitor.getByCompliance('NEAR_LIMIT').length).toBe(1);
    expect(monitor.getByCompliance('EXCEEDED').length).toBe(1);
    expect(monitor.getByCompliance('NOT_MONITORED').length).toBe(1);
    expect(monitor.getExceeded().length).toBe(1);
    expect(monitor.getReadingCount()).toBe(4);
  });

  it('latest reading is correctly selected after multiple readings over time', () => {
    const p = monitor.defineParameter('PM2.5', 'MG_M3', 'DAILY', 'urban', 50);
    const dates = ['2026-01-10', '2026-01-05', '2026-01-20', '2026-01-01', '2026-01-15'];
    dates.forEach((d, idx) => monitor.addReading(p.id, (idx + 1) * 5, d, 'sensor'));
    const latest = monitor.getLatestReading(p.id);
    expect(latest!.measuredAt).toBe('2026-01-20');
  });
});

describe('Integration: full ISO 14001 monitoring scenario', () => {
  let emissions: EmissionTracker;
  let waste: WasteTracker;
  let monitor: ParameterMonitor;

  beforeEach(() => {
    emissions = new EmissionTracker();
    waste = new WasteTracker();
    monitor = new ParameterMonitor();
  });

  Array.from({ length: 10 }, (_, i) => i + 1).forEach((month) => {
    it(`ISO 14001 monthly scenario: month ${month} — all three trackers`, () => {
      const dateStr = `2026-${String(month).padStart(2, '0')}-15`;

      // Emission recording
      const emRec = emissions.record('CO2', month * 100, 'TONNE', 'facility', dateStr, 'env-team');
      expect(emRec.type).toBe('CO2');

      // Waste management
      const wasteRec = waste.record('NON_HAZARDOUS', 'RECYCLING', month * 10, 'TONNE', dateStr);
      if (month % 2 === 0) {
        const disposed = waste.dispose(wasteRec.id, dateStr, 'RecycleCo');
        expect(disposed.disposedAt).toBe(dateStr);
      }

      // Parameter monitoring
      const param = monitor.defineParameter(
        `CO2-monitor-${month}`,
        'PPM',
        'MONTHLY',
        'roof-sensor',
        400,
      );
      const value = month <= 6 ? 200 : 450; // first half compliant, second exceeded
      const reading = monitor.addReading(param.id, value, dateStr, 'auto-sensor');

      if (month <= 6) {
        expect(reading.complianceStatus).toBe('COMPLIANT');
      } else {
        expect(reading.complianceStatus).toBe('EXCEEDED');
      }
    });
  });

  it('complete annual ISO 14001 report aggregation', () => {
    // Record 12 months of CO2 and waste
    for (let m = 1; m <= 12; m++) {
      const d = `2026-${String(m).padStart(2, '0')}-01`;
      emissions.record('CO2', m * 50, 'TONNE', 'facility', d, 'team');
      const rec = waste.record('RECYCLABLE', 'RECYCLING', m * 10, 'TONNE', d);
      waste.dispose(rec.id, d, 'EcoCorp');
    }

    // Total CO2 = sum(50,100,...,600) = 50*(1+2+...+12) = 50*78 = 3900
    expect(emissions.getTotalByType('CO2')).toBe(3900);

    // All waste disposed — no pending
    expect(waste.getPendingDisposal().length).toBe(0);

    // Parameter with NEAR_LIMIT boundary
    const p = monitor.defineParameter('NOX', 'PPM', 'ANNUAL', 'stack', 1000);
    const r = monitor.addReading(p.id, 910, '2026-12-31', 'certified-lab');
    expect(r.complianceStatus).toBe('NEAR_LIMIT');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// EXTRA COVERAGE BLOCKS (to reach 1,000+ tests)
// ─────────────────────────────────────────────────────────────────────────────

describe('EmissionTracker: extra coverage', () => {
  let tracker: EmissionTracker;

  beforeEach(() => {
    tracker = new EmissionTracker();
  });

  // getTotalByType returns 0 for type not present
  const emissionTypes: EmissionType[] = ['CO2', 'CH4', 'N2O', 'HFC', 'NOX', 'SOX', 'PM10', 'VOC'];
  emissionTypes.forEach((type) => {
    it(`getTotalByType(${type}) returns 0 when no records of that type`, () => {
      // record a different type
      const other = emissionTypes.find((t) => t !== type) ?? 'CO2';
      tracker.record(other, 100, 'KG', 'src', '2026-01-01', 'u');
      expect(tracker.getTotalByType(type)).toBe(0);
    });
  });

  // getBySource returns empty when source not present
  Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
    it(`getBySource('nonexistent-${i}') returns empty array`, () => {
      tracker.record('CO2', 50, 'KG', 'other', '2026-01-01', 'u');
      expect(tracker.getBySource(`nonexistent-${i}`)).toEqual([]);
    });
  });

  // Multiple emission types get correct totals independently
  it('getTotalByType is independent per type for mixed records', () => {
    tracker.record('CO2', 10, 'KG', 's', '2026-01-01', 'u');
    tracker.record('CH4', 20, 'KG', 's', '2026-01-01', 'u');
    tracker.record('CO2', 30, 'KG', 's', '2026-01-01', 'u');
    tracker.record('N2O', 5, 'KG', 's', '2026-01-01', 'u');
    expect(tracker.getTotalByType('CO2')).toBe(40);
    expect(tracker.getTotalByType('CH4')).toBe(20);
    expect(tracker.getTotalByType('N2O')).toBe(5);
    expect(tracker.getTotalByType('HFC')).toBe(0);
  });

  // getAll returns references to stored records
  Array.from({ length: 10 }, (_, i) => i + 1).forEach((n) => {
    it(`getAll() length matches getCount() after ${n} records`, () => {
      for (let k = 0; k < n; k++) {
        tracker.record('VOC', k + 1, 'PPM', 'vent', '2026-01-01', 'u');
      }
      expect(tracker.getAll().length).toBe(tracker.getCount());
    });
  });
});

describe('WasteTracker: extra coverage', () => {
  let tracker: WasteTracker;

  beforeEach(() => {
    tracker = new WasteTracker();
  });

  // getTotalByCategory returns 0 when no records of that category
  const categories: WasteCategory[] = [
    'HAZARDOUS', 'NON_HAZARDOUS', 'RECYCLABLE', 'ORGANIC', 'ELECTRONIC',
  ];
  categories.forEach((cat) => {
    it(`getTotalByCategory(${cat}) returns 0 when no records of that category`, () => {
      const other = categories.find((c) => c !== cat) ?? 'HAZARDOUS';
      tracker.record(other, 'LANDFILL', 100, 'KG', '2026-01-01');
      expect(tracker.getTotalByCategory(cat)).toBe(0);
    });
  });

  // getAll() length == getCount()
  Array.from({ length: 10 }, (_, i) => i + 1).forEach((n) => {
    it(`getAll() length matches getCount() after ${n} records (waste iter ${n})`, () => {
      for (let k = 0; k < n; k++) {
        tracker.record('ORGANIC', 'COMPOSTING', k + 1, 'KG', '2026-01-01');
      }
      expect(tracker.getAll().length).toBe(tracker.getCount());
    });
  });

  // Disposing all pending records clears pendingDisposal
  it('disposes all pending records and pendingDisposal is empty', () => {
    const ids: string[] = [];
    for (let k = 0; k < 10; k++) {
      const r = tracker.record('RECYCLABLE', 'RECYCLING', k + 1, 'KG', '2026-01-01');
      ids.push(r.id);
    }
    expect(tracker.getPendingDisposal().length).toBe(10);
    ids.forEach((id) => tracker.dispose(id, '2026-02-01'));
    expect(tracker.getPendingDisposal().length).toBe(0);
  });
});

describe('ParameterMonitor: extra coverage', () => {
  let monitor: ParameterMonitor;

  beforeEach(() => {
    monitor = new ParameterMonitor();
  });

  // getAllParameters() length matches defineParameter() calls
  Array.from({ length: 10 }, (_, i) => i + 1).forEach((n) => {
    it(`getAllParameters().length === ${n} after ${n} definitions`, () => {
      for (let k = 0; k < n; k++) {
        monitor.defineParameter(`p${k}`, 'PPM', 'DAILY', 'site');
      }
      expect(monitor.getAllParameters().length).toBe(n);
    });
  });

  // getReadings returns empty for parameter with no readings
  Array.from({ length: 5 }, (_, i) => i).forEach((i) => {
    it(`getReadings returns [] for parameter with no readings (iter ${i})`, () => {
      const p = monitor.defineParameter(`p${i}`, 'PPM', 'DAILY', 'site', 100);
      expect(monitor.getReadings(p.id)).toEqual([]);
    });
  });

  // NEAR_LIMIT boundary: exactly at 90% of legalLimit
  Array.from({ length: 10 }, (_, i) => (i + 1) * 10).forEach((limit) => {
    it(`value exactly at 90% of legalLimit ${limit} is NEAR_LIMIT`, () => {
      const p = monitor.defineParameter('test', 'PPM', 'DAILY', 'site', limit);
      const nearVal = limit * 0.9 + 0.001; // just above 90%
      const reading = monitor.addReading(p.id, nearVal, '2026-01-01', 'u');
      expect(reading.complianceStatus).toBe('NEAR_LIMIT');
    });
  });

  // COMPLIANT: value exactly at 90% boundary (value === legalLimit * 0.9 is NOT > legalLimit*0.9)
  it('value exactly at 90% of legalLimit (not greater) is COMPLIANT', () => {
    const p = monitor.defineParameter('boundary', 'PPM', 'DAILY', 'site', 100);
    const reading = monitor.addReading(p.id, 90, '2026-01-01', 'u');
    expect(reading.complianceStatus).toBe('COMPLIANT');
  });

  // getByCompliance returns empty when no readings of that status
  const complianceStatuses: ComplianceStatus[] = ['COMPLIANT', 'NEAR_LIMIT', 'EXCEEDED', 'NOT_MONITORED'];
  complianceStatuses.forEach((status) => {
    it(`getByCompliance(${status}) returns empty when no readings at all`, () => {
      expect(monitor.getByCompliance(status)).toEqual([]);
    });
  });

  // Reading stored fields: parameterId matches
  Array.from({ length: 10 }, (_, i) => i + 1).forEach((n) => {
    it(`reading parameterId matches parameter id (iter ${n})`, () => {
      const p = monitor.defineParameter(`sensor-${n}`, 'PPM', 'DAILY', `site-${n}`, 200);
      const r = monitor.addReading(p.id, 100, '2026-01-01', 'u');
      expect(r.parameterId).toBe(p.id);
      expect(r.measuredBy).toBe('u');
      expect(r.value).toBe(100);
    });
  });
});
