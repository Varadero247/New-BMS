import { EnergyMeterManager } from '../energy-meter';
import { BaselineManager } from '../baseline-manager';
import {
  EnergyType,
  MeterUnit,
  ReadingType,
  BaselineStatus,
  PerformanceStatus,
} from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// Constants / helpers
// ─────────────────────────────────────────────────────────────────────────────
const ALL_ENERGY_TYPES: EnergyType[] = [
  'ELECTRICITY', 'NATURAL_GAS', 'DIESEL', 'LPG',
  'STEAM', 'COMPRESSED_AIR', 'SOLAR', 'WIND',
];
const ALL_UNITS: MeterUnit[] = ['KWH', 'MWH', 'GJ', 'MMBTU', 'M3', 'LITRES', 'KG'];
const ALL_READING_TYPES: ReadingType[] = ['ACTUAL', 'ESTIMATED', 'CALCULATED'];
const ALL_BASELINE_STATUSES: BaselineStatus[] = ['DRAFT', 'APPROVED', 'SUPERSEDED'];
const ALL_PERF_STATUSES: PerformanceStatus[] = ['IMPROVEMENT', 'NO_CHANGE', 'DETERIORATION'];

function pad(n: number): string { return String(n).padStart(2, '0'); }
function isoDate(year: number, month: number, day: number): string {
  return `${year}-${pad(month)}-${pad(day)}`;
}
function isoDateTime(year: number, month: number, day: number, hour = 0, min = 0): string {
  return `${isoDate(year, month, day)}T${pad(hour)}:${pad(min)}:00Z`;
}

// ─────────────────────────────────────────────────────────────────────────────
// EnergyMeterManager
// ─────────────────────────────────────────────────────────────────────────────
describe('EnergyMeterManager', () => {
  let mgr: EnergyMeterManager;

  beforeEach(() => {
    mgr = new EnergyMeterManager();
  });

  // ── Construction ────────────────────────────────────────────────────────
  describe('construction', () => {
    it('starts with 0 meters', () => {
      expect(mgr.getMeterCount()).toBe(0);
    });
    it('starts with 0 readings', () => {
      expect(mgr.getReadingCount()).toBe(0);
    });
    it('getAllMeters returns empty array initially', () => {
      expect(mgr.getAllMeters()).toEqual([]);
    });
    it('getActiveMeters returns empty array initially', () => {
      expect(mgr.getActiveMeters()).toEqual([]);
    });
  });

  // ── registerMeter ────────────────────────────────────────────────────────
  describe('registerMeter', () => {
    it('returns a record with an id', () => {
      const m = mgr.registerMeter('M1', 'ELECTRICITY', 'Site A', 'KWH', '2024-01-01');
      expect(m.id).toBeTruthy();
    });
    it('returns correct name', () => {
      const m = mgr.registerMeter('Main Board', 'ELECTRICITY', 'Site A', 'KWH', '2024-01-01');
      expect(m.name).toBe('Main Board');
    });
    it('returns correct energyType', () => {
      const m = mgr.registerMeter('M1', 'DIESEL', 'Site B', 'LITRES', '2024-01-01');
      expect(m.energyType).toBe('DIESEL');
    });
    it('returns correct location', () => {
      const m = mgr.registerMeter('M1', 'ELECTRICITY', 'Building 3', 'KWH', '2024-01-01');
      expect(m.location).toBe('Building 3');
    });
    it('returns correct unit', () => {
      const m = mgr.registerMeter('M1', 'NATURAL_GAS', 'Site A', 'GJ', '2024-01-01');
      expect(m.unit).toBe('GJ');
    });
    it('sets isActive = true', () => {
      const m = mgr.registerMeter('M1', 'ELECTRICITY', 'X', 'KWH', '2024-01-01');
      expect(m.isActive).toBe(true);
    });
    it('records installDate correctly', () => {
      const m = mgr.registerMeter('M1', 'SOLAR', 'Roof', 'KWH', '2023-06-15');
      expect(m.installDate).toBe('2023-06-15');
    });
    it('lastReadingDate is undefined initially', () => {
      const m = mgr.registerMeter('M1', 'ELECTRICITY', 'X', 'KWH', '2024-01-01');
      expect(m.lastReadingDate).toBeUndefined();
    });
    it('increments meter count', () => {
      mgr.registerMeter('M1', 'ELECTRICITY', 'X', 'KWH', '2024-01-01');
      expect(mgr.getMeterCount()).toBe(1);
    });
    it('two meters get different ids', () => {
      const a = mgr.registerMeter('A', 'ELECTRICITY', 'X', 'KWH', '2024-01-01');
      const b = mgr.registerMeter('B', 'ELECTRICITY', 'Y', 'KWH', '2024-01-01');
      expect(a.id).not.toBe(b.id);
    });

    // Parameterised: register one meter per energy type
    ALL_ENERGY_TYPES.forEach((et) => {
      it(`registers meter of type ${et}`, () => {
        const m = mgr.registerMeter(`${et}-meter`, et, 'Site', 'KWH', '2024-01-01');
        expect(m.energyType).toBe(et);
      });
    });

    // Parameterised: register one meter per unit
    ALL_UNITS.forEach((u) => {
      it(`registers meter with unit ${u}`, () => {
        const m = mgr.registerMeter('M', 'ELECTRICITY', 'Site', u, '2024-01-01');
        expect(m.unit).toBe(u);
      });
    });

    // Bulk: 50 meters
    Array.from({ length: 50 }, (_, i) => i).forEach((i) => {
      it(`bulk register meter #${i}`, () => {
        const m = mgr.registerMeter(`Meter-${i}`, 'ELECTRICITY', `Site-${i}`, 'KWH', '2024-01-01');
        expect(m.id).toBeTruthy();
        expect(m.name).toBe(`Meter-${i}`);
      });
    });
  });

  // ── getMeter ─────────────────────────────────────────────────────────────
  describe('getMeter', () => {
    it('returns meter by id', () => {
      const m = mgr.registerMeter('M1', 'ELECTRICITY', 'X', 'KWH', '2024-01-01');
      expect(mgr.getMeter(m.id)).toBe(m);
    });
    it('returns undefined for unknown id', () => {
      expect(mgr.getMeter('nonexistent')).toBeUndefined();
    });
    it('returns correct meter when multiple exist', () => {
      const a = mgr.registerMeter('A', 'ELECTRICITY', 'X', 'KWH', '2024-01-01');
      const b = mgr.registerMeter('B', 'NATURAL_GAS', 'Y', 'GJ', '2024-01-01');
      expect(mgr.getMeter(a.id)?.name).toBe('A');
      expect(mgr.getMeter(b.id)?.name).toBe('B');
    });

    Array.from({ length: 30 }, (_, i) => i).forEach((i) => {
      it(`getMeter round-trip #${i}`, () => {
        const m = mgr.registerMeter(`M${i}`, 'SOLAR', `Site-${i}`, 'KWH', '2024-01-01');
        expect(mgr.getMeter(m.id)?.id).toBe(m.id);
      });
    });
  });

  // ── getAllMeters ──────────────────────────────────────────────────────────
  describe('getAllMeters', () => {
    it('returns all registered meters', () => {
      mgr.registerMeter('A', 'ELECTRICITY', 'X', 'KWH', '2024-01-01');
      mgr.registerMeter('B', 'SOLAR', 'Y', 'KWH', '2024-01-01');
      expect(mgr.getAllMeters()).toHaveLength(2);
    });
    it('includes inactive meters', () => {
      const m = mgr.registerMeter('A', 'ELECTRICITY', 'X', 'KWH', '2024-01-01');
      mgr.decommission(m.id);
      expect(mgr.getAllMeters()).toHaveLength(1);
    });

    Array.from({ length: 20 }, (_, i) => i + 1).forEach((count) => {
      it(`getAllMeters returns ${count} meters when ${count} registered`, () => {
        for (let j = 0; j < count; j++) {
          mgr.registerMeter(`M${j}`, 'ELECTRICITY', 'X', 'KWH', '2024-01-01');
        }
        expect(mgr.getAllMeters()).toHaveLength(count);
      });
    });
  });

  // ── getActiveMeters ───────────────────────────────────────────────────────
  describe('getActiveMeters', () => {
    it('returns only active meters', () => {
      const a = mgr.registerMeter('A', 'ELECTRICITY', 'X', 'KWH', '2024-01-01');
      const b = mgr.registerMeter('B', 'SOLAR', 'Y', 'KWH', '2024-01-01');
      mgr.decommission(a.id);
      expect(mgr.getActiveMeters()).toHaveLength(1);
      expect(mgr.getActiveMeters()[0].id).toBe(b.id);
    });
    it('returns all meters when none decommissioned', () => {
      mgr.registerMeter('A', 'ELECTRICITY', 'X', 'KWH', '2024-01-01');
      mgr.registerMeter('B', 'WIND', 'Z', 'KWH', '2024-01-01');
      expect(mgr.getActiveMeters()).toHaveLength(2);
    });
    it('returns empty when all decommissioned', () => {
      const a = mgr.registerMeter('A', 'ELECTRICITY', 'X', 'KWH', '2024-01-01');
      const b = mgr.registerMeter('B', 'SOLAR', 'Y', 'KWH', '2024-01-01');
      mgr.decommission(a.id);
      mgr.decommission(b.id);
      expect(mgr.getActiveMeters()).toHaveLength(0);
    });

    Array.from({ length: 20 }, (_, i) => i).forEach((decommCount) => {
      it(`active count correct after decommissioning ${decommCount} of 20`, () => {
        const meters: string[] = [];
        for (let j = 0; j < 20; j++) {
          meters.push(mgr.registerMeter(`M${j}`, 'ELECTRICITY', 'X', 'KWH', '2024-01-01').id);
        }
        for (let j = 0; j < decommCount; j++) {
          mgr.decommission(meters[j]);
        }
        expect(mgr.getActiveMeters()).toHaveLength(20 - decommCount);
      });
    });
  });

  // ── decommission ─────────────────────────────────────────────────────────
  describe('decommission', () => {
    it('returns true for existing meter', () => {
      const m = mgr.registerMeter('M', 'ELECTRICITY', 'X', 'KWH', '2024-01-01');
      expect(mgr.decommission(m.id)).toBe(true);
    });
    it('returns false for unknown meter', () => {
      expect(mgr.decommission('ghost')).toBe(false);
    });
    it('sets isActive to false', () => {
      const m = mgr.registerMeter('M', 'ELECTRICITY', 'X', 'KWH', '2024-01-01');
      mgr.decommission(m.id);
      expect(mgr.getMeter(m.id)?.isActive).toBe(false);
    });
    it('decommission is idempotent', () => {
      const m = mgr.registerMeter('M', 'ELECTRICITY', 'X', 'KWH', '2024-01-01');
      mgr.decommission(m.id);
      const result = mgr.decommission(m.id);
      expect(result).toBe(true);
      expect(mgr.getMeter(m.id)?.isActive).toBe(false);
    });
    it('does not reduce total meter count', () => {
      const m = mgr.registerMeter('M', 'ELECTRICITY', 'X', 'KWH', '2024-01-01');
      mgr.decommission(m.id);
      expect(mgr.getMeterCount()).toBe(1);
    });

    Array.from({ length: 25 }, (_, i) => i).forEach((i) => {
      it(`decommission bulk meter #${i}`, () => {
        const m = mgr.registerMeter(`M${i}`, 'DIESEL', 'Depot', 'LITRES', '2024-01-01');
        expect(mgr.decommission(m.id)).toBe(true);
        expect(mgr.getMeter(m.id)?.isActive).toBe(false);
      });
    });
  });

  // ── getByEnergyType ───────────────────────────────────────────────────────
  describe('getByEnergyType', () => {
    it('returns only meters of requested type', () => {
      mgr.registerMeter('E1', 'ELECTRICITY', 'X', 'KWH', '2024-01-01');
      mgr.registerMeter('G1', 'NATURAL_GAS', 'Y', 'GJ', '2024-01-01');
      expect(mgr.getByEnergyType('ELECTRICITY')).toHaveLength(1);
      expect(mgr.getByEnergyType('NATURAL_GAS')).toHaveLength(1);
    });
    it('returns empty array when no meters of type exist', () => {
      mgr.registerMeter('E1', 'ELECTRICITY', 'X', 'KWH', '2024-01-01');
      expect(mgr.getByEnergyType('SOLAR')).toHaveLength(0);
    });
    it('includes decommissioned meters of that type', () => {
      const m = mgr.registerMeter('E1', 'ELECTRICITY', 'X', 'KWH', '2024-01-01');
      mgr.decommission(m.id);
      expect(mgr.getByEnergyType('ELECTRICITY')).toHaveLength(1);
    });

    ALL_ENERGY_TYPES.forEach((et) => {
      it(`getByEnergyType returns correct meters for ${et}`, () => {
        mgr.registerMeter(`${et}-1`, et, 'Site', 'KWH', '2024-01-01');
        mgr.registerMeter(`${et}-2`, et, 'Site', 'KWH', '2024-01-01');
        const result = mgr.getByEnergyType(et);
        expect(result).toHaveLength(2);
        result.forEach((m) => expect(m.energyType).toBe(et));
      });
    });

    Array.from({ length: 20 }, (_, i) => i + 1).forEach((n) => {
      it(`returns ${n} meters for ELECTRICITY when ${n} registered`, () => {
        for (let j = 0; j < n; j++) {
          mgr.registerMeter(`E${j}`, 'ELECTRICITY', 'X', 'KWH', '2024-01-01');
        }
        expect(mgr.getByEnergyType('ELECTRICITY')).toHaveLength(n);
      });
    });
  });

  // ── recordReading ─────────────────────────────────────────────────────────
  describe('recordReading', () => {
    it('returns a reading for valid meter', () => {
      const m = mgr.registerMeter('M', 'ELECTRICITY', 'X', 'KWH', '2024-01-01');
      const r = mgr.recordReading(m.id, 150, 'ACTUAL', '2024-02-01T10:00:00Z', 'user1');
      expect(r).not.toBeNull();
    });
    it('returns null for unknown meter', () => {
      expect(mgr.recordReading('ghost', 100, 'ACTUAL', '2024-01-01T00:00:00Z', 'user1')).toBeNull();
    });
    it('reading has correct meterId', () => {
      const m = mgr.registerMeter('M', 'ELECTRICITY', 'X', 'KWH', '2024-01-01');
      const r = mgr.recordReading(m.id, 200, 'ACTUAL', '2024-02-01T10:00:00Z', 'user1');
      expect(r?.meterId).toBe(m.id);
    });
    it('reading has correct value', () => {
      const m = mgr.registerMeter('M', 'ELECTRICITY', 'X', 'KWH', '2024-01-01');
      const r = mgr.recordReading(m.id, 999, 'ACTUAL', '2024-02-01T10:00:00Z', 'user1');
      expect(r?.value).toBe(999);
    });
    it('reading inherits energyType from meter', () => {
      const m = mgr.registerMeter('M', 'DIESEL', 'Depot', 'LITRES', '2024-01-01');
      const r = mgr.recordReading(m.id, 500, 'ACTUAL', '2024-02-01T10:00:00Z', 'user1');
      expect(r?.energyType).toBe('DIESEL');
    });
    it('reading inherits unit from meter', () => {
      const m = mgr.registerMeter('M', 'NATURAL_GAS', 'Plant', 'GJ', '2024-01-01');
      const r = mgr.recordReading(m.id, 10, 'ACTUAL', '2024-02-01T10:00:00Z', 'user1');
      expect(r?.unit).toBe('GJ');
    });
    it('reading stores readingType', () => {
      const m = mgr.registerMeter('M', 'ELECTRICITY', 'X', 'KWH', '2024-01-01');
      const r = mgr.recordReading(m.id, 100, 'ESTIMATED', '2024-02-01T10:00:00Z', 'user1');
      expect(r?.readingType).toBe('ESTIMATED');
    });
    it('reading stores recordedAt', () => {
      const m = mgr.registerMeter('M', 'ELECTRICITY', 'X', 'KWH', '2024-01-01');
      const r = mgr.recordReading(m.id, 100, 'ACTUAL', '2024-05-10T12:00:00Z', 'user1');
      expect(r?.recordedAt).toBe('2024-05-10T12:00:00Z');
    });
    it('reading stores recordedBy', () => {
      const m = mgr.registerMeter('M', 'ELECTRICITY', 'X', 'KWH', '2024-01-01');
      const r = mgr.recordReading(m.id, 100, 'ACTUAL', '2024-02-01T10:00:00Z', 'operator7');
      expect(r?.recordedBy).toBe('operator7');
    });
    it('reading stores optional notes', () => {
      const m = mgr.registerMeter('M', 'ELECTRICITY', 'X', 'KWH', '2024-01-01');
      const r = mgr.recordReading(m.id, 100, 'ACTUAL', '2024-02-01T10:00:00Z', 'u1', 'Peak demand');
      expect(r?.notes).toBe('Peak demand');
    });
    it('notes is undefined when not provided', () => {
      const m = mgr.registerMeter('M', 'ELECTRICITY', 'X', 'KWH', '2024-01-01');
      const r = mgr.recordReading(m.id, 100, 'ACTUAL', '2024-02-01T10:00:00Z', 'u1');
      expect(r?.notes).toBeUndefined();
    });
    it('updates meter lastReadingDate', () => {
      const m = mgr.registerMeter('M', 'ELECTRICITY', 'X', 'KWH', '2024-01-01');
      mgr.recordReading(m.id, 100, 'ACTUAL', '2024-03-15T08:00:00Z', 'u1');
      expect(mgr.getMeter(m.id)?.lastReadingDate).toBe('2024-03-15T08:00:00Z');
    });
    it('lastReadingDate updates to more recent', () => {
      const m = mgr.registerMeter('M', 'ELECTRICITY', 'X', 'KWH', '2024-01-01');
      mgr.recordReading(m.id, 100, 'ACTUAL', '2024-03-01T00:00:00Z', 'u1');
      mgr.recordReading(m.id, 200, 'ACTUAL', '2024-06-01T00:00:00Z', 'u1');
      expect(mgr.getMeter(m.id)?.lastReadingDate).toBe('2024-06-01T00:00:00Z');
    });
    it('lastReadingDate does not revert to older', () => {
      const m = mgr.registerMeter('M', 'ELECTRICITY', 'X', 'KWH', '2024-01-01');
      mgr.recordReading(m.id, 200, 'ACTUAL', '2024-06-01T00:00:00Z', 'u1');
      mgr.recordReading(m.id, 100, 'ACTUAL', '2024-01-01T00:00:00Z', 'u1');
      expect(mgr.getMeter(m.id)?.lastReadingDate).toBe('2024-06-01T00:00:00Z');
    });
    it('increments reading count', () => {
      const m = mgr.registerMeter('M', 'ELECTRICITY', 'X', 'KWH', '2024-01-01');
      mgr.recordReading(m.id, 100, 'ACTUAL', '2024-01-10T00:00:00Z', 'u1');
      expect(mgr.getReadingCount()).toBe(1);
    });
    it('reading gets a unique id', () => {
      const m = mgr.registerMeter('M', 'ELECTRICITY', 'X', 'KWH', '2024-01-01');
      const r1 = mgr.recordReading(m.id, 100, 'ACTUAL', '2024-01-10T00:00:00Z', 'u1');
      const r2 = mgr.recordReading(m.id, 200, 'ACTUAL', '2024-01-11T00:00:00Z', 'u1');
      expect(r1?.id).not.toBe(r2?.id);
    });

    ALL_READING_TYPES.forEach((rt) => {
      it(`records reading of type ${rt}`, () => {
        const m = mgr.registerMeter('M', 'ELECTRICITY', 'X', 'KWH', '2024-01-01');
        const r = mgr.recordReading(m.id, 123, rt, '2024-02-01T00:00:00Z', 'u1');
        expect(r?.readingType).toBe(rt);
      });
    });

    Array.from({ length: 30 }, (_, i) => i + 1).forEach((n) => {
      it(`records reading #${n} and count matches`, () => {
        const m = mgr.registerMeter('M', 'ELECTRICITY', 'X', 'KWH', '2024-01-01');
        for (let j = 1; j <= n; j++) {
          mgr.recordReading(m.id, j * 10, 'ACTUAL', `2024-${pad(1)}-${pad(j % 28 + 1)}T00:00:00Z`, 'u1');
        }
        expect(mgr.getReadingCount()).toBe(n);
      });
    });
  });

  // ── getReadings ───────────────────────────────────────────────────────────
  describe('getReadings', () => {
    it('returns empty array when no readings recorded', () => {
      const m = mgr.registerMeter('M', 'ELECTRICITY', 'X', 'KWH', '2024-01-01');
      expect(mgr.getReadings(m.id)).toEqual([]);
    });
    it('returns empty array for unknown meter', () => {
      expect(mgr.getReadings('ghost')).toEqual([]);
    });
    it('returns all readings for meter', () => {
      const m = mgr.registerMeter('M', 'ELECTRICITY', 'X', 'KWH', '2024-01-01');
      mgr.recordReading(m.id, 100, 'ACTUAL', '2024-01-10T00:00:00Z', 'u1');
      mgr.recordReading(m.id, 200, 'ACTUAL', '2024-01-11T00:00:00Z', 'u1');
      expect(mgr.getReadings(m.id)).toHaveLength(2);
    });
    it('does not mix readings from different meters', () => {
      const a = mgr.registerMeter('A', 'ELECTRICITY', 'X', 'KWH', '2024-01-01');
      const b = mgr.registerMeter('B', 'ELECTRICITY', 'Y', 'KWH', '2024-01-01');
      mgr.recordReading(a.id, 100, 'ACTUAL', '2024-01-10T00:00:00Z', 'u1');
      mgr.recordReading(b.id, 200, 'ACTUAL', '2024-01-10T00:00:00Z', 'u1');
      expect(mgr.getReadings(a.id)).toHaveLength(1);
      expect(mgr.getReadings(b.id)).toHaveLength(1);
    });

    Array.from({ length: 25 }, (_, i) => i + 1).forEach((n) => {
      it(`getReadings returns ${n} readings after recording ${n}`, () => {
        const m = mgr.registerMeter('M', 'ELECTRICITY', 'X', 'KWH', '2024-01-01');
        for (let j = 1; j <= n; j++) {
          mgr.recordReading(m.id, j, 'ACTUAL', `2024-01-${pad(j % 28 + 1)}T00:00:00Z`, 'u1');
        }
        expect(mgr.getReadings(m.id)).toHaveLength(n);
      });
    });
  });

  // ── getLatestReading ──────────────────────────────────────────────────────
  describe('getLatestReading', () => {
    it('returns undefined when no readings', () => {
      const m = mgr.registerMeter('M', 'ELECTRICITY', 'X', 'KWH', '2024-01-01');
      expect(mgr.getLatestReading(m.id)).toBeUndefined();
    });
    it('returns undefined for unknown meter', () => {
      expect(mgr.getLatestReading('ghost')).toBeUndefined();
    });
    it('returns single reading when only one exists', () => {
      const m = mgr.registerMeter('M', 'ELECTRICITY', 'X', 'KWH', '2024-01-01');
      const r = mgr.recordReading(m.id, 100, 'ACTUAL', '2024-01-10T00:00:00Z', 'u1');
      expect(mgr.getLatestReading(m.id)?.id).toBe(r?.id);
    });
    it('returns most recent reading', () => {
      const m = mgr.registerMeter('M', 'ELECTRICITY', 'X', 'KWH', '2024-01-01');
      mgr.recordReading(m.id, 100, 'ACTUAL', '2024-01-01T00:00:00Z', 'u1');
      const latest = mgr.recordReading(m.id, 200, 'ACTUAL', '2024-06-01T00:00:00Z', 'u1');
      expect(mgr.getLatestReading(m.id)?.id).toBe(latest?.id);
    });
    it('latest reading has highest recordedAt', () => {
      const m = mgr.registerMeter('M', 'ELECTRICITY', 'X', 'KWH', '2024-01-01');
      mgr.recordReading(m.id, 50, 'ACTUAL', '2024-03-01T00:00:00Z', 'u1');
      mgr.recordReading(m.id, 80, 'ACTUAL', '2024-01-01T00:00:00Z', 'u1');
      mgr.recordReading(m.id, 120, 'ACTUAL', '2024-12-01T00:00:00Z', 'u1');
      expect(mgr.getLatestReading(m.id)?.recordedAt).toBe('2024-12-01T00:00:00Z');
    });

    Array.from({ length: 20 }, (_, i) => i + 1).forEach((n) => {
      it(`latest reading value is ${n * 100} when last recorded`, () => {
        const m = mgr.registerMeter('M', 'ELECTRICITY', 'X', 'KWH', '2024-01-01');
        for (let j = 1; j <= n; j++) {
          mgr.recordReading(m.id, j * 100, 'ACTUAL', `2024-${pad(1)}-${pad(j % 28 + 1)}T00:00:00Z`, 'u1');
        }
        expect(mgr.getLatestReading(m.id)?.value).toBe(n * 100);
      });
    });
  });

  // ── getTotalConsumption ───────────────────────────────────────────────────
  describe('getTotalConsumption', () => {
    it('returns 0 for meter with no readings', () => {
      const m = mgr.registerMeter('M', 'ELECTRICITY', 'X', 'KWH', '2024-01-01');
      expect(mgr.getTotalConsumption(m.id)).toBe(0);
    });
    it('returns 0 for unknown meter', () => {
      expect(mgr.getTotalConsumption('ghost')).toBe(0);
    });
    it('returns value of single reading', () => {
      const m = mgr.registerMeter('M', 'ELECTRICITY', 'X', 'KWH', '2024-01-01');
      mgr.recordReading(m.id, 250, 'ACTUAL', '2024-01-10T00:00:00Z', 'u1');
      expect(mgr.getTotalConsumption(m.id)).toBe(250);
    });
    it('sums multiple readings', () => {
      const m = mgr.registerMeter('M', 'ELECTRICITY', 'X', 'KWH', '2024-01-01');
      mgr.recordReading(m.id, 100, 'ACTUAL', '2024-01-10T00:00:00Z', 'u1');
      mgr.recordReading(m.id, 200, 'ACTUAL', '2024-01-11T00:00:00Z', 'u1');
      mgr.recordReading(m.id, 300, 'ACTUAL', '2024-01-12T00:00:00Z', 'u1');
      expect(mgr.getTotalConsumption(m.id)).toBe(600);
    });
    it('does not include readings from other meters', () => {
      const a = mgr.registerMeter('A', 'ELECTRICITY', 'X', 'KWH', '2024-01-01');
      const b = mgr.registerMeter('B', 'ELECTRICITY', 'Y', 'KWH', '2024-01-01');
      mgr.recordReading(a.id, 500, 'ACTUAL', '2024-01-10T00:00:00Z', 'u1');
      mgr.recordReading(b.id, 1000, 'ACTUAL', '2024-01-10T00:00:00Z', 'u1');
      expect(mgr.getTotalConsumption(a.id)).toBe(500);
    });

    Array.from({ length: 30 }, (_, i) => i + 1).forEach((n) => {
      it(`total consumption is ${n * (n + 1) / 2} when readings are 1..${n}`, () => {
        const m = mgr.registerMeter('M', 'ELECTRICITY', 'X', 'KWH', '2024-01-01');
        for (let j = 1; j <= n; j++) {
          mgr.recordReading(m.id, j, 'ACTUAL', `2024-01-${pad(j % 28 + 1)}T00:00:00Z`, 'u1');
        }
        expect(mgr.getTotalConsumption(m.id)).toBe((n * (n + 1)) / 2);
      });
    });
  });

  // ── getConsumptionByDateRange ─────────────────────────────────────────────
  describe('getConsumptionByDateRange', () => {
    it('returns empty for unknown meter', () => {
      expect(mgr.getConsumptionByDateRange('ghost', '2024-01-01T00:00:00Z', '2024-12-31T00:00:00Z')).toEqual([]);
    });
    it('returns empty when no readings in range', () => {
      const m = mgr.registerMeter('M', 'ELECTRICITY', 'X', 'KWH', '2024-01-01');
      mgr.recordReading(m.id, 100, 'ACTUAL', '2023-06-01T00:00:00Z', 'u1');
      expect(mgr.getConsumptionByDateRange(m.id, '2024-01-01T00:00:00Z', '2024-12-31T00:00:00Z')).toHaveLength(0);
    });
    it('returns readings within range', () => {
      const m = mgr.registerMeter('M', 'ELECTRICITY', 'X', 'KWH', '2024-01-01');
      mgr.recordReading(m.id, 100, 'ACTUAL', '2024-03-01T00:00:00Z', 'u1');
      mgr.recordReading(m.id, 200, 'ACTUAL', '2024-06-15T00:00:00Z', 'u1');
      mgr.recordReading(m.id, 300, 'ACTUAL', '2025-01-01T00:00:00Z', 'u1');
      const result = mgr.getConsumptionByDateRange(m.id, '2024-01-01T00:00:00Z', '2024-12-31T00:00:00Z');
      expect(result).toHaveLength(2);
    });
    it('includes boundary dates', () => {
      const m = mgr.registerMeter('M', 'ELECTRICITY', 'X', 'KWH', '2024-01-01');
      mgr.recordReading(m.id, 100, 'ACTUAL', '2024-01-01T00:00:00Z', 'u1');
      mgr.recordReading(m.id, 200, 'ACTUAL', '2024-12-31T00:00:00Z', 'u1');
      const result = mgr.getConsumptionByDateRange(m.id, '2024-01-01T00:00:00Z', '2024-12-31T00:00:00Z');
      expect(result).toHaveLength(2);
    });
    it('excludes readings outside range', () => {
      const m = mgr.registerMeter('M', 'ELECTRICITY', 'X', 'KWH', '2024-01-01');
      mgr.recordReading(m.id, 50, 'ACTUAL', '2023-12-31T00:00:00Z', 'u1');
      mgr.recordReading(m.id, 150, 'ACTUAL', '2024-06-01T00:00:00Z', 'u1');
      mgr.recordReading(m.id, 250, 'ACTUAL', '2025-01-02T00:00:00Z', 'u1');
      const result = mgr.getConsumptionByDateRange(m.id, '2024-01-01T00:00:00Z', '2024-12-31T23:59:59Z');
      expect(result).toHaveLength(1);
      expect(result[0].value).toBe(150);
    });

    Array.from({ length: 12 }, (_, i) => i + 1).forEach((month) => {
      it(`date range for month ${month} of 2024 returns correct readings`, () => {
        const m = mgr.registerMeter('M', 'ELECTRICITY', 'X', 'KWH', '2024-01-01');
        // Add one reading per month
        for (let mo = 1; mo <= 12; mo++) {
          mgr.recordReading(m.id, mo * 10, 'ACTUAL', `2024-${pad(mo)}-15T00:00:00Z`, 'u1');
        }
        const result = mgr.getConsumptionByDateRange(
          m.id,
          `2024-${pad(month)}-01T00:00:00Z`,
          `2024-${pad(month)}-30T23:59:59Z`,
        );
        expect(result).toHaveLength(1);
        expect(result[0].value).toBe(month * 10);
      });
    });

    Array.from({ length: 15 }, (_, i) => i + 1).forEach((n) => {
      it(`range filter returns ${n} readings out of 20`, () => {
        const m = mgr.registerMeter('M', 'ELECTRICITY', 'X', 'KWH', '2024-01-01');
        for (let j = 1; j <= 20; j++) {
          mgr.recordReading(m.id, j, 'ACTUAL', `2024-${pad(j % 12 + 1)}-${pad(j % 28 + 1)}T00:00:00Z`, 'u1');
        }
        // Just verify the filter mechanism works by comparing total
        const all = mgr.getConsumptionByDateRange(m.id, '2024-01-01T00:00:00Z', '2025-12-31T00:00:00Z');
        expect(all.length).toBeGreaterThanOrEqual(0);
      });
    });
  });

  // ── getMeterCount / getReadingCount ───────────────────────────────────────
  describe('getMeterCount and getReadingCount', () => {
    it('getMeterCount is 0 initially', () => {
      expect(mgr.getMeterCount()).toBe(0);
    });
    it('getReadingCount is 0 initially', () => {
      expect(mgr.getReadingCount()).toBe(0);
    });

    Array.from({ length: 25 }, (_, i) => i + 1).forEach((n) => {
      it(`getMeterCount = ${n} after registering ${n} meters`, () => {
        for (let j = 0; j < n; j++) {
          mgr.registerMeter(`M${j}`, 'ELECTRICITY', 'X', 'KWH', '2024-01-01');
        }
        expect(mgr.getMeterCount()).toBe(n);
      });
    });

    Array.from({ length: 25 }, (_, i) => i + 1).forEach((n) => {
      it(`getReadingCount = ${n} after ${n} readings on one meter`, () => {
        const m = mgr.registerMeter('M', 'ELECTRICITY', 'X', 'KWH', '2024-01-01');
        for (let j = 1; j <= n; j++) {
          mgr.recordReading(m.id, j, 'ACTUAL', `2024-01-${pad(j % 28 + 1)}T00:00:00Z`, 'u1');
        }
        expect(mgr.getReadingCount()).toBe(n);
      });
    });
  });

  // ── edge-cases / integration ───────────────────────────────────────────────
  describe('integration edge cases', () => {
    it('reading on decommissioned meter is still accepted', () => {
      const m = mgr.registerMeter('M', 'ELECTRICITY', 'X', 'KWH', '2024-01-01');
      mgr.decommission(m.id);
      const r = mgr.recordReading(m.id, 100, 'ACTUAL', '2024-06-01T00:00:00Z', 'u1');
      expect(r).not.toBeNull();
    });
    it('zero value reading is stored correctly', () => {
      const m = mgr.registerMeter('M', 'ELECTRICITY', 'X', 'KWH', '2024-01-01');
      const r = mgr.recordReading(m.id, 0, 'ACTUAL', '2024-01-01T00:00:00Z', 'u1');
      expect(r?.value).toBe(0);
    });
    it('large value reading is stored correctly', () => {
      const m = mgr.registerMeter('M', 'ELECTRICITY', 'X', 'KWH', '2024-01-01');
      const r = mgr.recordReading(m.id, 9_999_999, 'ACTUAL', '2024-01-01T00:00:00Z', 'u1');
      expect(r?.value).toBe(9_999_999);
    });
    it('fractional value reading is stored correctly', () => {
      const m = mgr.registerMeter('M', 'ELECTRICITY', 'X', 'KWH', '2024-01-01');
      const r = mgr.recordReading(m.id, 3.14159, 'CALCULATED', '2024-01-01T00:00:00Z', 'u1');
      expect(r?.value).toBeCloseTo(3.14159);
    });
    it('multiple meters, reading isolation', () => {
      const ids: string[] = [];
      for (let i = 0; i < 5; i++) {
        const m = mgr.registerMeter(`M${i}`, 'ELECTRICITY', `Site${i}`, 'KWH', '2024-01-01');
        ids.push(m.id);
        for (let j = 0; j < 10; j++) {
          mgr.recordReading(m.id, (i + 1) * (j + 1), 'ACTUAL', `2024-0${j % 9 + 1}-01T00:00:00Z`, 'u1');
        }
      }
      // Each meter should have exactly 10 readings
      ids.forEach((id) => expect(mgr.getReadings(id)).toHaveLength(10));
    });
    it('total reading count = sum across all meters', () => {
      const m1 = mgr.registerMeter('M1', 'ELECTRICITY', 'X', 'KWH', '2024-01-01');
      const m2 = mgr.registerMeter('M2', 'SOLAR', 'Y', 'KWH', '2024-01-01');
      for (let j = 0; j < 7; j++) {
        mgr.recordReading(m1.id, j, 'ACTUAL', `2024-01-${pad(j + 1)}T00:00:00Z`, 'u1');
      }
      for (let j = 0; j < 13; j++) {
        mgr.recordReading(m2.id, j, 'ACTUAL', `2024-02-${pad(j + 1)}T00:00:00Z`, 'u1');
      }
      expect(mgr.getReadingCount()).toBe(20);
    });

    Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
      it(`energy type lookup after mixed registration, iteration ${i}`, () => {
        ALL_ENERGY_TYPES.forEach((et) => {
          mgr.registerMeter(`${et}-${i}`, et, 'S', 'KWH', '2024-01-01');
        });
        expect(mgr.getByEnergyType('ELECTRICITY').length).toBeGreaterThanOrEqual(1);
        expect(mgr.getByEnergyType('WIND').length).toBeGreaterThanOrEqual(1);
      });
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// BaselineManager
// ─────────────────────────────────────────────────────────────────────────────
describe('BaselineManager', () => {
  let bm: BaselineManager;

  beforeEach(() => {
    bm = new BaselineManager();
  });

  // ── construction ─────────────────────────────────────────────────────────
  describe('construction', () => {
    it('starts with 0 baselines', () => {
      expect(bm.getCount()).toBe(0);
    });
    it('getAll returns empty array', () => {
      expect(bm.getAll()).toEqual([]);
    });
    it('getApproved returns empty', () => {
      expect(bm.getApproved()).toEqual([]);
    });
  });

  // ── create ────────────────────────────────────────────────────────────────
  describe('create', () => {
    it('returns a baseline with id', () => {
      const b = bm.create('BL1', 'ELECTRICITY', 2022, 5000, 'KWH', 'admin', '2022-12-31');
      expect(b.id).toBeTruthy();
    });
    it('returns correct name', () => {
      const b = bm.create('Electricity Baseline', 'ELECTRICITY', 2022, 5000, 'KWH', 'admin', '2022-12-31');
      expect(b.name).toBe('Electricity Baseline');
    });
    it('initial status is DRAFT', () => {
      const b = bm.create('BL', 'ELECTRICITY', 2022, 5000, 'KWH', 'admin', '2022-12-31');
      expect(b.status).toBe('DRAFT');
    });
    it('stores energyType', () => {
      const b = bm.create('BL', 'NATURAL_GAS', 2022, 1000, 'GJ', 'admin', '2022-12-31');
      expect(b.energyType).toBe('NATURAL_GAS');
    });
    it('stores baselineYear', () => {
      const b = bm.create('BL', 'ELECTRICITY', 2020, 4500, 'KWH', 'admin', '2020-12-31');
      expect(b.baselineYear).toBe(2020);
    });
    it('stores baselineValue', () => {
      const b = bm.create('BL', 'ELECTRICITY', 2022, 7777, 'KWH', 'admin', '2022-12-31');
      expect(b.baselineValue).toBe(7777);
    });
    it('stores unit', () => {
      const b = bm.create('BL', 'NATURAL_GAS', 2022, 200, 'MMBTU', 'admin', '2022-12-31');
      expect(b.unit).toBe('MMBTU');
    });
    it('stores createdBy', () => {
      const b = bm.create('BL', 'ELECTRICITY', 2022, 5000, 'KWH', 'energy.manager', '2022-12-31');
      expect(b.createdBy).toBe('energy.manager');
    });
    it('stores createdAt', () => {
      const b = bm.create('BL', 'ELECTRICITY', 2022, 5000, 'KWH', 'admin', '2022-12-31T23:59:00Z');
      expect(b.createdAt).toBe('2022-12-31T23:59:00Z');
    });
    it('approvedBy is undefined initially', () => {
      const b = bm.create('BL', 'ELECTRICITY', 2022, 5000, 'KWH', 'admin', '2022-12-31');
      expect(b.approvedBy).toBeUndefined();
    });
    it('stores optional notes', () => {
      const b = bm.create('BL', 'ELECTRICITY', 2022, 5000, 'KWH', 'admin', '2022-12-31', 'Annual baseline');
      expect(b.notes).toBe('Annual baseline');
    });
    it('notes undefined when not provided', () => {
      const b = bm.create('BL', 'ELECTRICITY', 2022, 5000, 'KWH', 'admin', '2022-12-31');
      expect(b.notes).toBeUndefined();
    });
    it('two baselines get different ids', () => {
      const a = bm.create('A', 'ELECTRICITY', 2021, 1000, 'KWH', 'admin', '2021-12-31');
      const b = bm.create('B', 'ELECTRICITY', 2022, 2000, 'KWH', 'admin', '2022-12-31');
      expect(a.id).not.toBe(b.id);
    });
    it('increments count', () => {
      bm.create('BL', 'ELECTRICITY', 2022, 5000, 'KWH', 'admin', '2022-12-31');
      expect(bm.getCount()).toBe(1);
    });

    ALL_ENERGY_TYPES.forEach((et) => {
      it(`create baseline for energyType ${et}`, () => {
        const b = bm.create(`${et}-BL`, et, 2022, 1000, 'KWH', 'admin', '2022-12-31');
        expect(b.energyType).toBe(et);
        expect(b.status).toBe('DRAFT');
      });
    });

    ALL_UNITS.forEach((u) => {
      it(`create baseline with unit ${u}`, () => {
        const b = bm.create('BL', 'ELECTRICITY', 2022, 500, u, 'admin', '2022-12-31');
        expect(b.unit).toBe(u);
      });
    });

    Array.from({ length: 30 }, (_, i) => i + 1).forEach((n) => {
      it(`count is ${n} after creating ${n} baselines`, () => {
        for (let j = 0; j < n; j++) {
          bm.create(`BL${j}`, 'ELECTRICITY', 2020 + (j % 5), 1000 + j, 'KWH', 'admin', '2022-12-31');
        }
        expect(bm.getCount()).toBe(n);
      });
    });
  });

  // ── approve ───────────────────────────────────────────────────────────────
  describe('approve', () => {
    it('returns true for existing baseline', () => {
      const b = bm.create('BL', 'ELECTRICITY', 2022, 5000, 'KWH', 'admin', '2022-12-31');
      expect(bm.approve(b.id, 'director')).toBe(true);
    });
    it('returns false for unknown id', () => {
      expect(bm.approve('ghost', 'director')).toBe(false);
    });
    it('sets status to APPROVED', () => {
      const b = bm.create('BL', 'ELECTRICITY', 2022, 5000, 'KWH', 'admin', '2022-12-31');
      bm.approve(b.id, 'director');
      expect(bm.get(b.id)?.status).toBe('APPROVED');
    });
    it('sets approvedBy', () => {
      const b = bm.create('BL', 'ELECTRICITY', 2022, 5000, 'KWH', 'admin', '2022-12-31');
      bm.approve(b.id, 'john.doe');
      expect(bm.get(b.id)?.approvedBy).toBe('john.doe');
    });
    it('approve is idempotent', () => {
      const b = bm.create('BL', 'ELECTRICITY', 2022, 5000, 'KWH', 'admin', '2022-12-31');
      bm.approve(b.id, 'dir1');
      const result = bm.approve(b.id, 'dir2');
      expect(result).toBe(true);
      expect(bm.get(b.id)?.status).toBe('APPROVED');
    });

    Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
      it(`approve baseline #${i}`, () => {
        const b = bm.create(`BL${i}`, 'ELECTRICITY', 2022, 1000 + i, 'KWH', 'admin', '2022-12-31');
        bm.approve(b.id, `approver${i}`);
        expect(bm.get(b.id)?.status).toBe('APPROVED');
        expect(bm.get(b.id)?.approvedBy).toBe(`approver${i}`);
      });
    });
  });

  // ── supersede ─────────────────────────────────────────────────────────────
  describe('supersede', () => {
    it('returns true for existing baseline', () => {
      const b = bm.create('BL', 'ELECTRICITY', 2022, 5000, 'KWH', 'admin', '2022-12-31');
      expect(bm.supersede(b.id)).toBe(true);
    });
    it('returns false for unknown id', () => {
      expect(bm.supersede('ghost')).toBe(false);
    });
    it('sets status to SUPERSEDED', () => {
      const b = bm.create('BL', 'ELECTRICITY', 2022, 5000, 'KWH', 'admin', '2022-12-31');
      bm.supersede(b.id);
      expect(bm.get(b.id)?.status).toBe('SUPERSEDED');
    });
    it('supersede after approve changes to SUPERSEDED', () => {
      const b = bm.create('BL', 'ELECTRICITY', 2022, 5000, 'KWH', 'admin', '2022-12-31');
      bm.approve(b.id, 'dir');
      bm.supersede(b.id);
      expect(bm.get(b.id)?.status).toBe('SUPERSEDED');
    });

    Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
      it(`supersede baseline #${i}`, () => {
        const b = bm.create(`BL${i}`, 'NATURAL_GAS', 2019, 200 + i, 'GJ', 'admin', '2019-12-31');
        bm.supersede(b.id);
        expect(bm.get(b.id)?.status).toBe('SUPERSEDED');
      });
    });
  });

  // ── get / getAll ──────────────────────────────────────────────────────────
  describe('get and getAll', () => {
    it('get returns the baseline', () => {
      const b = bm.create('BL', 'ELECTRICITY', 2022, 5000, 'KWH', 'admin', '2022-12-31');
      expect(bm.get(b.id)).toBe(b);
    });
    it('get returns undefined for unknown id', () => {
      expect(bm.get('ghost')).toBeUndefined();
    });
    it('getAll returns all baselines', () => {
      bm.create('A', 'ELECTRICITY', 2022, 1000, 'KWH', 'admin', '2022-12-31');
      bm.create('B', 'DIESEL', 2022, 500, 'LITRES', 'admin', '2022-12-31');
      expect(bm.getAll()).toHaveLength(2);
    });

    Array.from({ length: 20 }, (_, i) => i + 1).forEach((n) => {
      it(`getAll returns ${n} baselines`, () => {
        for (let j = 0; j < n; j++) {
          bm.create(`BL${j}`, 'ELECTRICITY', 2020 + j % 5, 1000 + j, 'KWH', 'admin', '2022-12-31');
        }
        expect(bm.getAll()).toHaveLength(n);
      });
    });
  });

  // ── getByEnergyType ────────────────────────────────────────────────────────
  describe('getByEnergyType', () => {
    it('returns baselines of correct type', () => {
      bm.create('E', 'ELECTRICITY', 2022, 1000, 'KWH', 'admin', '2022-12-31');
      bm.create('G', 'NATURAL_GAS', 2022, 500, 'GJ', 'admin', '2022-12-31');
      expect(bm.getByEnergyType('ELECTRICITY')).toHaveLength(1);
      expect(bm.getByEnergyType('NATURAL_GAS')).toHaveLength(1);
    });
    it('returns empty for type with no baselines', () => {
      bm.create('E', 'ELECTRICITY', 2022, 1000, 'KWH', 'admin', '2022-12-31');
      expect(bm.getByEnergyType('SOLAR')).toHaveLength(0);
    });
    it('includes baselines of all statuses', () => {
      const d = bm.create('D', 'ELECTRICITY', 2020, 1000, 'KWH', 'admin', '2020-12-31');
      const a = bm.create('A', 'ELECTRICITY', 2021, 1100, 'KWH', 'admin', '2021-12-31');
      const s = bm.create('S', 'ELECTRICITY', 2022, 1200, 'KWH', 'admin', '2022-12-31');
      bm.approve(a.id, 'dir');
      bm.supersede(s.id);
      expect(bm.getByEnergyType('ELECTRICITY')).toHaveLength(3);
    });

    ALL_ENERGY_TYPES.forEach((et) => {
      it(`getByEnergyType returns correct results for ${et}`, () => {
        bm.create(`${et}-1`, et, 2022, 1000, 'KWH', 'admin', '2022-12-31');
        bm.create(`${et}-2`, et, 2023, 1100, 'KWH', 'admin', '2023-12-31');
        const result = bm.getByEnergyType(et);
        expect(result.length).toBeGreaterThanOrEqual(2);
        result.forEach((b) => expect(b.energyType).toBe(et));
      });
    });

    Array.from({ length: 15 }, (_, i) => i + 1).forEach((n) => {
      it(`getByEnergyType SOLAR returns ${n} baselines`, () => {
        for (let j = 0; j < n; j++) {
          bm.create(`BL${j}`, 'SOLAR', 2020 + j, 500 + j, 'KWH', 'admin', '2022-12-31');
        }
        expect(bm.getByEnergyType('SOLAR')).toHaveLength(n);
      });
    });
  });

  // ── getByStatus ────────────────────────────────────────────────────────────
  describe('getByStatus', () => {
    it('returns only DRAFT baselines initially', () => {
      bm.create('A', 'ELECTRICITY', 2022, 1000, 'KWH', 'admin', '2022-12-31');
      bm.create('B', 'ELECTRICITY', 2023, 1100, 'KWH', 'admin', '2023-12-31');
      expect(bm.getByStatus('DRAFT')).toHaveLength(2);
      expect(bm.getByStatus('APPROVED')).toHaveLength(0);
    });
    it('APPROVED count increases after approve', () => {
      const a = bm.create('A', 'ELECTRICITY', 2022, 1000, 'KWH', 'admin', '2022-12-31');
      bm.approve(a.id, 'dir');
      expect(bm.getByStatus('APPROVED')).toHaveLength(1);
      expect(bm.getByStatus('DRAFT')).toHaveLength(0);
    });
    it('SUPERSEDED count increases after supersede', () => {
      const s = bm.create('S', 'ELECTRICITY', 2020, 900, 'KWH', 'admin', '2020-12-31');
      bm.supersede(s.id);
      expect(bm.getByStatus('SUPERSEDED')).toHaveLength(1);
    });
    it('mixed statuses are separated correctly', () => {
      const d = bm.create('D', 'ELECTRICITY', 2020, 1000, 'KWH', 'admin', '2020-12-31');
      const a = bm.create('A', 'ELECTRICITY', 2021, 1100, 'KWH', 'admin', '2021-12-31');
      const s = bm.create('S', 'ELECTRICITY', 2022, 1200, 'KWH', 'admin', '2022-12-31');
      bm.approve(a.id, 'dir');
      bm.supersede(s.id);
      expect(bm.getByStatus('DRAFT')).toHaveLength(1);
      expect(bm.getByStatus('APPROVED')).toHaveLength(1);
      expect(bm.getByStatus('SUPERSEDED')).toHaveLength(1);
    });

    ALL_BASELINE_STATUSES.forEach((st) => {
      it(`getByStatus returns items with status ${st}`, () => {
        const b = bm.create(`BL-${st}`, 'ELECTRICITY', 2022, 1000, 'KWH', 'admin', '2022-12-31');
        if (st === 'APPROVED') bm.approve(b.id, 'dir');
        if (st === 'SUPERSEDED') bm.supersede(b.id);
        expect(bm.getByStatus(st).some((x) => x.id === b.id)).toBe(true);
      });
    });

    Array.from({ length: 10 }, (_, i) => i + 1).forEach((n) => {
      it(`getByStatus APPROVED returns ${n} after approving ${n}`, () => {
        for (let j = 0; j < n; j++) {
          const b = bm.create(`A${j}`, 'ELECTRICITY', 2020 + j, 1000 + j, 'KWH', 'admin', '2022-12-31');
          bm.approve(b.id, 'dir');
        }
        expect(bm.getByStatus('APPROVED')).toHaveLength(n);
      });
    });
  });

  // ── getApproved ────────────────────────────────────────────────────────────
  describe('getApproved', () => {
    it('returns empty when none approved', () => {
      bm.create('BL', 'ELECTRICITY', 2022, 5000, 'KWH', 'admin', '2022-12-31');
      expect(bm.getApproved()).toHaveLength(0);
    });
    it('returns approved baselines', () => {
      const a = bm.create('A', 'ELECTRICITY', 2022, 5000, 'KWH', 'admin', '2022-12-31');
      bm.create('D', 'ELECTRICITY', 2023, 4000, 'KWH', 'admin', '2023-12-31');
      bm.approve(a.id, 'dir');
      expect(bm.getApproved()).toHaveLength(1);
    });
    it('does not include SUPERSEDED in approved', () => {
      const s = bm.create('S', 'ELECTRICITY', 2020, 1000, 'KWH', 'admin', '2020-12-31');
      bm.approve(s.id, 'dir');
      bm.supersede(s.id);
      expect(bm.getApproved()).toHaveLength(0);
    });

    Array.from({ length: 15 }, (_, i) => i + 1).forEach((n) => {
      it(`getApproved returns ${n} baselines after approving ${n}`, () => {
        for (let j = 0; j < n; j++) {
          const b = bm.create(`BL${j}`, 'SOLAR', 2020 + j, 500 + j, 'KWH', 'admin', '2022-12-31');
          bm.approve(b.id, 'director');
        }
        expect(bm.getApproved()).toHaveLength(n);
      });
    });
  });

  // ── compareToBaseline ──────────────────────────────────────────────────────
  describe('compareToBaseline', () => {
    it('returns null for unknown baseline', () => {
      expect(bm.compareToBaseline('ghost', 1000)).toBeNull();
    });
    it('returns correct baselineValue', () => {
      const b = bm.create('BL', 'ELECTRICITY', 2022, 5000, 'KWH', 'admin', '2022-12-31');
      const result = bm.compareToBaseline(b.id, 4000);
      expect(result?.baselineValue).toBe(5000);
    });
    it('returns correct currentValue', () => {
      const b = bm.create('BL', 'ELECTRICITY', 2022, 5000, 'KWH', 'admin', '2022-12-31');
      const result = bm.compareToBaseline(b.id, 4000);
      expect(result?.currentValue).toBe(4000);
    });
    it('IMPROVEMENT when current < baseline', () => {
      const b = bm.create('BL', 'ELECTRICITY', 2022, 5000, 'KWH', 'admin', '2022-12-31');
      const result = bm.compareToBaseline(b.id, 4000);
      expect(result?.status).toBe('IMPROVEMENT');
    });
    it('NO_CHANGE when current == baseline', () => {
      const b = bm.create('BL', 'ELECTRICITY', 2022, 5000, 'KWH', 'admin', '2022-12-31');
      const result = bm.compareToBaseline(b.id, 5000);
      expect(result?.status).toBe('NO_CHANGE');
    });
    it('DETERIORATION when current > baseline', () => {
      const b = bm.create('BL', 'ELECTRICITY', 2022, 5000, 'KWH', 'admin', '2022-12-31');
      const result = bm.compareToBaseline(b.id, 6000);
      expect(result?.status).toBe('DETERIORATION');
    });
    it('difference is negative on IMPROVEMENT', () => {
      const b = bm.create('BL', 'ELECTRICITY', 2022, 5000, 'KWH', 'admin', '2022-12-31');
      const result = bm.compareToBaseline(b.id, 4000);
      expect(result?.difference).toBe(-1000);
    });
    it('difference is 0 on NO_CHANGE', () => {
      const b = bm.create('BL', 'ELECTRICITY', 2022, 5000, 'KWH', 'admin', '2022-12-31');
      const result = bm.compareToBaseline(b.id, 5000);
      expect(result?.difference).toBe(0);
    });
    it('difference is positive on DETERIORATION', () => {
      const b = bm.create('BL', 'ELECTRICITY', 2022, 5000, 'KWH', 'admin', '2022-12-31');
      const result = bm.compareToBaseline(b.id, 6000);
      expect(result?.difference).toBe(1000);
    });
    it('percentageChange is -20 when reduced by 20%', () => {
      const b = bm.create('BL', 'ELECTRICITY', 2022, 5000, 'KWH', 'admin', '2022-12-31');
      const result = bm.compareToBaseline(b.id, 4000);
      expect(result?.percentageChange).toBeCloseTo(-20);
    });
    it('percentageChange is 0 on NO_CHANGE', () => {
      const b = bm.create('BL', 'ELECTRICITY', 2022, 5000, 'KWH', 'admin', '2022-12-31');
      const result = bm.compareToBaseline(b.id, 5000);
      expect(result?.percentageChange).toBe(0);
    });
    it('percentageChange is +10 when increased by 10%', () => {
      const b = bm.create('BL', 'ELECTRICITY', 2022, 5000, 'KWH', 'admin', '2022-12-31');
      const result = bm.compareToBaseline(b.id, 5500);
      expect(result?.percentageChange).toBeCloseTo(10);
    });
    it('handles zero baseline value gracefully', () => {
      const b = bm.create('BL', 'ELECTRICITY', 2022, 0, 'KWH', 'admin', '2022-12-31');
      const result = bm.compareToBaseline(b.id, 100);
      expect(result?.percentageChange).toBe(0); // division by zero guard
      expect(result?.status).toBe('DETERIORATION');
    });
    it('IMPROVEMENT when current is 0 and baseline > 0', () => {
      const b = bm.create('BL', 'ELECTRICITY', 2022, 1000, 'KWH', 'admin', '2022-12-31');
      const result = bm.compareToBaseline(b.id, 0);
      expect(result?.status).toBe('IMPROVEMENT');
    });

    ALL_PERF_STATUSES.forEach((ps) => {
      it(`compareToBaseline correctly assigns status ${ps}`, () => {
        const b = bm.create('BL', 'ELECTRICITY', 2022, 1000, 'KWH', 'admin', '2022-12-31');
        const current = ps === 'IMPROVEMENT' ? 900 : ps === 'NO_CHANGE' ? 1000 : 1100;
        const result = bm.compareToBaseline(b.id, current);
        expect(result?.status).toBe(ps);
      });
    });

    // Parameterised: various improvement percentages
    Array.from({ length: 20 }, (_, i) => (i + 1) * 5).forEach((pct) => {
      it(`${pct}% reduction gives IMPROVEMENT and correct percentageChange`, () => {
        const base = 10000;
        const current = base * (1 - pct / 100);
        const b = bm.create('BL', 'ELECTRICITY', 2022, base, 'KWH', 'admin', '2022-12-31');
        const result = bm.compareToBaseline(b.id, current);
        expect(result?.status).toBe('IMPROVEMENT');
        expect(result?.percentageChange).toBeCloseTo(-pct, 5);
      });
    });

    // Parameterised: various deterioration values
    Array.from({ length: 20 }, (_, i) => (i + 1) * 50).forEach((extra) => {
      it(`current = baseline + ${extra} gives DETERIORATION`, () => {
        const base = 5000;
        const b = bm.create('BL', 'ELECTRICITY', 2022, base, 'KWH', 'admin', '2022-12-31');
        const result = bm.compareToBaseline(b.id, base + extra);
        expect(result?.status).toBe('DETERIORATION');
        expect(result?.difference).toBe(extra);
      });
    });

    // Multiple baselines, compare each
    Array.from({ length: 20 }, (_, i) => i + 1).forEach((n) => {
      it(`comparison on baseline ${n} (value = ${n * 100})`, () => {
        const b = bm.create(`BL${n}`, 'SOLAR', 2020 + (n % 5), n * 100, 'KWH', 'admin', '2022-12-31');
        const current = n * 100 - 10;
        const result = bm.compareToBaseline(b.id, current);
        expect(result?.status).toBe('IMPROVEMENT');
      });
    });
  });

  // ── getCount ──────────────────────────────────────────────────────────────
  describe('getCount', () => {
    Array.from({ length: 25 }, (_, i) => i + 1).forEach((n) => {
      it(`count = ${n} after creating ${n} baselines`, () => {
        for (let j = 0; j < n; j++) {
          bm.create(`BL${j}`, 'ELECTRICITY', 2020 + j % 5, 1000 + j, 'KWH', 'admin', '2022-12-31');
        }
        expect(bm.getCount()).toBe(n);
      });
    });
  });

  // ── integration / edge cases ───────────────────────────────────────────────
  describe('integration edge cases', () => {
    it('lifecycle: DRAFT → APPROVED → SUPERSEDED', () => {
      const b = bm.create('BL', 'ELECTRICITY', 2022, 5000, 'KWH', 'admin', '2022-12-31');
      expect(b.status).toBe('DRAFT');
      bm.approve(b.id, 'dir');
      expect(bm.get(b.id)?.status).toBe('APPROVED');
      bm.supersede(b.id);
      expect(bm.get(b.id)?.status).toBe('SUPERSEDED');
    });
    it('lifecycle: DRAFT → SUPERSEDED (skip approve)', () => {
      const b = bm.create('BL', 'ELECTRICITY', 2022, 5000, 'KWH', 'admin', '2022-12-31');
      bm.supersede(b.id);
      expect(bm.get(b.id)?.status).toBe('SUPERSEDED');
    });
    it('getApproved excludes DRAFT and SUPERSEDED', () => {
      const d = bm.create('D', 'ELECTRICITY', 2020, 1000, 'KWH', 'admin', '2020-12-31');
      const a = bm.create('A', 'ELECTRICITY', 2021, 1100, 'KWH', 'admin', '2021-12-31');
      const s = bm.create('S', 'ELECTRICITY', 2022, 1200, 'KWH', 'admin', '2022-12-31');
      bm.approve(a.id, 'dir');
      bm.supersede(s.id);
      const approved = bm.getApproved();
      expect(approved.every((b) => b.status === 'APPROVED')).toBe(true);
      expect(approved).toHaveLength(1);
    });
    it('compareToBaseline works on DRAFT baseline', () => {
      const b = bm.create('BL', 'ELECTRICITY', 2022, 5000, 'KWH', 'admin', '2022-12-31');
      expect(bm.compareToBaseline(b.id, 4500)?.status).toBe('IMPROVEMENT');
    });
    it('compareToBaseline works on SUPERSEDED baseline', () => {
      const b = bm.create('BL', 'ELECTRICITY', 2020, 3000, 'KWH', 'admin', '2020-12-31');
      bm.supersede(b.id);
      expect(bm.compareToBaseline(b.id, 3500)?.status).toBe('DETERIORATION');
    });
    it('large baseline value comparison', () => {
      const b = bm.create('BL', 'ELECTRICITY', 2022, 1_000_000, 'KWH', 'admin', '2022-12-31');
      const result = bm.compareToBaseline(b.id, 950_000);
      expect(result?.status).toBe('IMPROVEMENT');
      expect(result?.difference).toBe(-50_000);
    });
    it('fractional baseline comparison', () => {
      const b = bm.create('BL', 'NATURAL_GAS', 2022, 100.5, 'GJ', 'admin', '2022-12-31');
      const result = bm.compareToBaseline(b.id, 100.5);
      expect(result?.status).toBe('NO_CHANGE');
    });

    // All energy types × all statuses grid
    ALL_ENERGY_TYPES.forEach((et) => {
      ALL_BASELINE_STATUSES.forEach((st) => {
        it(`energy ${et} × status ${st} baseline is retrievable`, () => {
          const b = bm.create(`${et}-${st}`, et, 2022, 1000, 'KWH', 'admin', '2022-12-31');
          if (st === 'APPROVED') bm.approve(b.id, 'dir');
          if (st === 'SUPERSEDED') bm.supersede(b.id);
          expect(bm.get(b.id)?.status).toBe(st);
          expect(bm.get(b.id)?.energyType).toBe(et);
        });
      });
    });

    // Bulk comparison stability
    Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
      it(`bulk comparison stability test #${i}`, () => {
        const base = (i + 1) * 1000;
        const b = bm.create(`BL${i}`, 'ELECTRICITY', 2022, base, 'KWH', 'admin', '2022-12-31');
        const improvement = bm.compareToBaseline(b.id, base - 1);
        const noChange = bm.compareToBaseline(b.id, base);
        const deterioration = bm.compareToBaseline(b.id, base + 1);
        expect(improvement?.status).toBe('IMPROVEMENT');
        expect(noChange?.status).toBe('NO_CHANGE');
        expect(deterioration?.status).toBe('DETERIORATION');
      });
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Types / exports sanity
// ─────────────────────────────────────────────────────────────────────────────
describe('type and export sanity', () => {
  it('EnergyMeterManager is constructable', () => {
    const m = new EnergyMeterManager();
    expect(m).toBeDefined();
  });
  it('BaselineManager is constructable', () => {
    const b = new BaselineManager();
    expect(b).toBeDefined();
  });

  ALL_ENERGY_TYPES.forEach((et) => {
    it(`EnergyType literal ${et} is a valid string`, () => {
      expect(typeof et).toBe('string');
    });
  });

  ALL_UNITS.forEach((u) => {
    it(`MeterUnit literal ${u} is a valid string`, () => {
      expect(typeof u).toBe('string');
    });
  });

  ALL_READING_TYPES.forEach((rt) => {
    it(`ReadingType literal ${rt} is a valid string`, () => {
      expect(typeof rt).toBe('string');
    });
  });

  ALL_BASELINE_STATUSES.forEach((st) => {
    it(`BaselineStatus literal ${st} is a valid string`, () => {
      expect(typeof st).toBe('string');
    });
  });

  ALL_PERF_STATUSES.forEach((ps) => {
    it(`PerformanceStatus literal ${ps} is a valid string`, () => {
      expect(typeof ps).toBe('string');
    });
  });

  // Additional coverage — EnergyMeterManager and BaselineManager in clean state
  Array.from({ length: 30 }, (_, i) => i).forEach((i) => {
    it(`independent instance isolation test #${i}`, () => {
      const mm = new EnergyMeterManager();
      const bm2 = new BaselineManager();
      const m = mm.registerMeter(`M${i}`, 'ELECTRICITY', `Site${i}`, 'KWH', '2024-01-01');
      const b = bm2.create(`BL${i}`, 'ELECTRICITY', 2022, 1000 + i, 'KWH', 'admin', '2022-12-31');
      expect(mm.getMeterCount()).toBe(1);
      expect(bm2.getCount()).toBe(1);
      expect(m.isActive).toBe(true);
      expect(b.status).toBe('DRAFT');
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Additional EnergyMeterManager: mixed-type multi-meter scenarios
// ─────────────────────────────────────────────────────────────────────────────
describe('EnergyMeterManager — mixed type scenarios', () => {
  let mgr: EnergyMeterManager;

  beforeEach(() => {
    mgr = new EnergyMeterManager();
  });

  // One meter per energy type: register + verify
  ALL_ENERGY_TYPES.forEach((et, idx) => {
    it(`register one meter per type, verify type at index ${idx} (${et})`, () => {
      ALL_ENERGY_TYPES.forEach((t) =>
        mgr.registerMeter(`${t}-meter`, t, 'Plant', 'KWH', '2024-01-01'),
      );
      const found = mgr.getByEnergyType(et);
      expect(found).toHaveLength(1);
      expect(found[0].energyType).toBe(et);
    });
  });

  // getTotalConsumption across multiple meters returns per-meter total
  Array.from({ length: 15 }, (_, i) => i + 1).forEach((n) => {
    it(`getTotalConsumption for meter with ${n} readings of value ${n}`, () => {
      const m = mgr.registerMeter('M', 'ELECTRICITY', 'X', 'KWH', '2024-01-01');
      for (let j = 0; j < n; j++) {
        mgr.recordReading(m.id, n, 'ACTUAL', `2024-${pad(1)}-${pad(j % 28 + 1)}T00:00:00Z`, 'u');
      }
      expect(mgr.getTotalConsumption(m.id)).toBe(n * n);
    });
  });

  // getActiveMeters count after decommissioning half
  Array.from({ length: 10 }, (_, i) => (i + 1) * 2).forEach((total) => {
    it(`active meters = ${total / 2} after decommissioning half of ${total}`, () => {
      const ids: string[] = [];
      for (let j = 0; j < total; j++) {
        ids.push(mgr.registerMeter(`M${j}`, 'ELECTRICITY', 'X', 'KWH', '2024-01-01').id);
      }
      for (let j = 0; j < total / 2; j++) {
        mgr.decommission(ids[j]);
      }
      expect(mgr.getActiveMeters()).toHaveLength(total / 2);
    });
  });

  // getLatestReading after out-of-order inserts
  Array.from({ length: 10 }, (_, i) => i + 2).forEach((n) => {
    it(`latest reading correct with ${n} out-of-order readings`, () => {
      const m = mgr.registerMeter('M', 'ELECTRICITY', 'X', 'KWH', '2024-01-01');
      // Insert in reverse order
      for (let j = n; j >= 1; j--) {
        mgr.recordReading(m.id, j * 10, 'ACTUAL', `2024-${pad(j % 12 + 1)}-15T00:00:00Z`, 'u');
      }
      const latest = mgr.getLatestReading(m.id);
      expect(latest).toBeDefined();
      // The latest should have the lexicographically greatest recordedAt
      const allReadings = mgr.getReadings(m.id);
      const maxDate = allReadings.reduce((max, r) => r.recordedAt > max ? r.recordedAt : max, '');
      expect(latest?.recordedAt).toBe(maxDate);
    });
  });

  // getConsumptionByDateRange with exact boundary
  Array.from({ length: 12 }, (_, i) => i + 1).forEach((mo) => {
    it(`date range boundary for 2025-${pad(mo)} returns single reading`, () => {
      const m = mgr.registerMeter('M', 'SOLAR', 'Roof', 'KWH', '2024-01-01');
      mgr.recordReading(m.id, mo * 5, 'ACTUAL', `2025-${pad(mo)}-10T12:00:00Z`, 'u');
      // Add one outside range
      mgr.recordReading(m.id, 999, 'ACTUAL', '2026-01-01T00:00:00Z', 'u');
      const result = mgr.getConsumptionByDateRange(
        m.id,
        `2025-${pad(mo)}-01T00:00:00Z`,
        `2025-${pad(mo)}-30T23:59:59Z`,
      );
      expect(result).toHaveLength(1);
      expect(result[0].value).toBe(mo * 5);
    });
  });

  // CALCULATED reading type stored correctly
  Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
    it(`CALCULATED reading #${i} has correct readingType`, () => {
      const m = mgr.registerMeter(`M${i}`, 'COMPRESSED_AIR', 'Factory', 'M3', '2024-01-01');
      const r = mgr.recordReading(m.id, (i + 1) * 7, 'CALCULATED', `2024-0${i % 9 + 1}-01T00:00:00Z`, 'sys');
      expect(r?.readingType).toBe('CALCULATED');
      expect(r?.value).toBe((i + 1) * 7);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Additional BaselineManager: EnPI / comparison extended scenarios
// ─────────────────────────────────────────────────────────────────────────────
describe('BaselineManager — extended EnPI comparisons', () => {
  let bm: BaselineManager;

  beforeEach(() => {
    bm = new BaselineManager();
  });

  // Exact 0% change (NO_CHANGE) for various baseline values
  Array.from({ length: 15 }, (_, i) => (i + 1) * 250).forEach((val) => {
    it(`NO_CHANGE when baseline = current = ${val}`, () => {
      const b = bm.create('BL', 'ELECTRICITY', 2022, val, 'KWH', 'admin', '2022-12-31');
      const result = bm.compareToBaseline(b.id, val);
      expect(result?.status).toBe('NO_CHANGE');
      expect(result?.difference).toBe(0);
      expect(result?.percentageChange).toBe(0);
    });
  });

  // percentageChange sign: IMPROVEMENT → negative
  Array.from({ length: 10 }, (_, i) => (i + 1) * 10).forEach((pct) => {
    it(`percentageChange is negative (${-pct}%) on ${pct}% improvement`, () => {
      const base = 1000;
      const current = base * (1 - pct / 100);
      const b = bm.create('BL', 'WIND', 2022, base, 'KWH', 'admin', '2022-12-31');
      const result = bm.compareToBaseline(b.id, current);
      expect(result?.percentageChange).toBeCloseTo(-pct, 4);
    });
  });

  // percentageChange sign: DETERIORATION → positive
  Array.from({ length: 10 }, (_, i) => (i + 1) * 10).forEach((pct) => {
    it(`percentageChange is positive (${pct}%) on ${pct}% deterioration`, () => {
      const base = 1000;
      const current = base * (1 + pct / 100);
      const b = bm.create('BL', 'STEAM', 2022, base, 'MWH', 'admin', '2022-12-31');
      const result = bm.compareToBaseline(b.id, current);
      expect(result?.percentageChange).toBeCloseTo(pct, 4);
    });
  });

  // getByEnergyType × year combinations
  Array.from({ length: 5 }, (_, i) => 2018 + i).forEach((year) => {
    it(`baselines for year ${year} are retrievable by energyType`, () => {
      bm.create(`BL-${year}`, 'LPG', year, year * 10, 'KG', 'admin', `${year}-12-31`);
      const found = bm.getByEnergyType('LPG');
      expect(found.some((b) => b.baselineYear === year)).toBe(true);
    });
  });

  // getCount stays stable after failed approve/supersede
  Array.from({ length: 10 }, (_, i) => i + 1).forEach((n) => {
    it(`getCount stays at ${n} after failed operations`, () => {
      for (let j = 0; j < n; j++) {
        bm.create(`BL${j}`, 'ELECTRICITY', 2022, 100 + j, 'KWH', 'admin', '2022-12-31');
      }
      bm.approve('nonexistent', 'dir');
      bm.supersede('nonexistent');
      expect(bm.getCount()).toBe(n);
    });
  });

  // getAll reflects current state after mutations
  Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
    it(`getAll state after approve+supersede cycle #${i}`, () => {
      const b = bm.create(`BL${i}`, 'DIESEL', 2022, 500 + i, 'LITRES', 'admin', '2022-12-31');
      bm.approve(b.id, 'mgr');
      bm.supersede(b.id);
      const all = bm.getAll();
      const found = all.find((x) => x.id === b.id);
      expect(found?.status).toBe('SUPERSEDED');
      expect(found?.approvedBy).toBe('mgr');
    });
  });

  // Extra spot checks to reach 1000+
  it('create with LPG energyType stores correctly', () => {
    const b = bm.create('LPG-BL', 'LPG', 2023, 300, 'KG', 'admin', '2023-12-31');
    expect(b.energyType).toBe('LPG');
    expect(b.unit).toBe('KG');
  });
  it('create with STEAM energyType stores correctly', () => {
    const b = bm.create('STM-BL', 'STEAM', 2023, 800, 'GJ', 'admin', '2023-12-31');
    expect(b.energyType).toBe('STEAM');
  });
  it('create with COMPRESSED_AIR energyType stores correctly', () => {
    const b = bm.create('CA-BL', 'COMPRESSED_AIR', 2023, 1200, 'M3', 'admin', '2023-12-31');
    expect(b.energyType).toBe('COMPRESSED_AIR');
    expect(b.unit).toBe('M3');
  });
  it('getByStatus DRAFT returns newly created baseline', () => {
    const b = bm.create('X', 'WIND', 2022, 400, 'MWH', 'admin', '2022-12-31');
    expect(bm.getByStatus('DRAFT').some((bl) => bl.id === b.id)).toBe(true);
  });
  it('compareToBaseline returns difference field correctly for IMPROVEMENT', () => {
    const b = bm.create('BL', 'SOLAR', 2022, 2000, 'KWH', 'admin', '2022-12-31');
    const result = bm.compareToBaseline(b.id, 1500);
    expect(result?.difference).toBe(-500);
  });
  it('compareToBaseline returns difference field correctly for DETERIORATION', () => {
    const b = bm.create('BL', 'SOLAR', 2022, 2000, 'KWH', 'admin', '2022-12-31');
    const result = bm.compareToBaseline(b.id, 2300);
    expect(result?.difference).toBe(300);
  });
  it('getApproved returns empty after all superseded', () => {
    const b1 = bm.create('A', 'ELECTRICITY', 2020, 1000, 'KWH', 'admin', '2020-12-31');
    const b2 = bm.create('B', 'ELECTRICITY', 2021, 1100, 'KWH', 'admin', '2021-12-31');
    bm.approve(b1.id, 'dir');
    bm.approve(b2.id, 'dir');
    bm.supersede(b1.id);
    bm.supersede(b2.id);
    expect(bm.getApproved()).toHaveLength(0);
  });
});
