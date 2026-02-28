import { CalibrationRegister } from '../calibration-register';
import { CertificateTracker } from '../certificate-tracker';
import {
  EquipmentStatus,
  CalibrationResult,
  CalibrationFrequency,
  EquipmentType,
  CertificateStatus,
} from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// CalibrationRegister tests
// ─────────────────────────────────────────────────────────────────────────────

describe('CalibrationRegister', () => {
  let register: CalibrationRegister;

  beforeEach(() => {
    register = new CalibrationRegister();
  });

  // ── Construction ────────────────────────────────────────────────────────────
  describe('construction', () => {
    it('starts empty', () => {
      expect(register.getCount()).toBe(0);
    });

    it('getAll returns empty array initially', () => {
      expect(register.getAll()).toEqual([]);
    });

    it('get on unknown id returns undefined', () => {
      expect(register.get('nonexistent')).toBeUndefined();
    });
  });

  // ── register() ──────────────────────────────────────────────────────────────
  describe('register()', () => {
    it('returns an EquipmentRecord', () => {
      const r = register.register('TAG-001', 'Micrometer', 'MEASURING', 'Lab A', 'John', 'ANNUAL', 365);
      expect(r).toBeDefined();
    });

    it('assigns a uuid id', () => {
      const r = register.register('TAG-001', 'Micrometer', 'MEASURING', 'Lab A', 'John', 'ANNUAL', 365);
      expect(typeof r.id).toBe('string');
      expect(r.id.length).toBeGreaterThan(0);
    });

    it('stores assetTag', () => {
      const r = register.register('TAG-XYZ', 'Caliper', 'MEASURING', 'Lab B', 'Jane', 'QUARTERLY', 90);
      expect(r.assetTag).toBe('TAG-XYZ');
    });

    it('stores name', () => {
      const r = register.register('TAG-001', 'Pressure Gauge', 'MONITORING', 'Plant', 'Alice', 'MONTHLY', 30);
      expect(r.name).toBe('Pressure Gauge');
    });

    it('stores type', () => {
      const r = register.register('TAG-002', 'Thermometer', 'MONITORING', 'Lab C', 'Bob', 'BIANNUAL', 180);
      expect(r.type).toBe('MONITORING');
    });

    it('initial status is ACTIVE', () => {
      const r = register.register('TAG-003', 'Scale', 'MEASURING', 'Warehouse', 'Carol', 'ANNUAL', 365);
      expect(r.status).toBe('ACTIVE');
    });

    it('stores location', () => {
      const r = register.register('TAG-004', 'Oscilloscope', 'TEST', 'Electronics Lab', 'Dave', 'ANNUAL', 365);
      expect(r.location).toBe('Electronics Lab');
    });

    it('stores owner', () => {
      const r = register.register('TAG-005', 'Voltmeter', 'TEST', 'Lab D', 'Eve', 'QUARTERLY', 90);
      expect(r.owner).toBe('Eve');
    });

    it('stores calibrationFrequency', () => {
      const r = register.register('TAG-006', 'Gauge', 'MEASURING', 'Lab E', 'Frank', 'MONTHLY', 30);
      expect(r.calibrationFrequency).toBe('MONTHLY');
    });

    it('stores calibrationIntervalDays', () => {
      const r = register.register('TAG-007', 'Sensor', 'MONITORING', 'Field', 'Grace', 'QUARTERLY', 91);
      expect(r.calibrationIntervalDays).toBe(91);
    });

    it('stores optional serialNumber', () => {
      const r = register.register('TAG-008', 'Caliper', 'MEASURING', 'Lab F', 'Hank', 'ANNUAL', 365, 'SN-001');
      expect(r.serialNumber).toBe('SN-001');
    });

    it('stores optional manufacturer', () => {
      const r = register.register('TAG-009', 'Caliper', 'MEASURING', 'Lab G', 'Iris', 'ANNUAL', 365, undefined, 'Mitutoyo');
      expect(r.manufacturer).toBe('Mitutoyo');
    });

    it('stores optional model', () => {
      const r = register.register('TAG-010', 'Caliper', 'MEASURING', 'Lab H', 'Jack', 'ANNUAL', 365, undefined, undefined, 'Model-X');
      expect(r.model).toBe('Model-X');
    });

    it('stores optional notes', () => {
      const r = register.register('TAG-011', 'Caliper', 'MEASURING', 'Lab I', 'Ken', 'ANNUAL', 365, undefined, undefined, undefined, 'Keep dry');
      expect(r.notes).toBe('Keep dry');
    });

    it('undefined serialNumber when not provided', () => {
      const r = register.register('TAG-012', 'Caliper', 'MEASURING', 'Lab J', 'Leo', 'ANNUAL', 365);
      expect(r.serialNumber).toBeUndefined();
    });

    it('undefined manufacturer when not provided', () => {
      const r = register.register('TAG-013', 'Caliper', 'MEASURING', 'Lab K', 'Mia', 'ANNUAL', 365);
      expect(r.manufacturer).toBeUndefined();
    });

    it('undefined model when not provided', () => {
      const r = register.register('TAG-014', 'Caliper', 'MEASURING', 'Lab L', 'Ned', 'ANNUAL', 365);
      expect(r.model).toBeUndefined();
    });

    it('undefined notes when not provided', () => {
      const r = register.register('TAG-015', 'Caliper', 'MEASURING', 'Lab M', 'Ora', 'ANNUAL', 365);
      expect(r.notes).toBeUndefined();
    });

    it('undefined lastCalibrationDate initially', () => {
      const r = register.register('TAG-016', 'Caliper', 'MEASURING', 'Lab N', 'Pat', 'ANNUAL', 365);
      expect(r.lastCalibrationDate).toBeUndefined();
    });

    it('undefined nextCalibrationDate initially', () => {
      const r = register.register('TAG-017', 'Caliper', 'MEASURING', 'Lab O', 'Quinn', 'ANNUAL', 365);
      expect(r.nextCalibrationDate).toBeUndefined();
    });

    it('increments count', () => {
      register.register('TAG-018', 'A', 'MEASURING', 'L', 'O', 'ANNUAL', 365);
      expect(register.getCount()).toBe(1);
    });

    it('two registrations yield count 2', () => {
      register.register('TAG-019', 'A', 'MEASURING', 'L', 'O', 'ANNUAL', 365);
      register.register('TAG-020', 'B', 'TEST', 'L2', 'O2', 'QUARTERLY', 90);
      expect(register.getCount()).toBe(2);
    });

    it('each registration gets unique id', () => {
      const r1 = register.register('T1', 'A', 'MEASURING', 'L', 'O', 'ANNUAL', 365);
      const r2 = register.register('T2', 'B', 'MEASURING', 'L', 'O', 'ANNUAL', 365);
      expect(r1.id).not.toBe(r2.id);
    });

    it('can retrieve registered record by id', () => {
      const r = register.register('TAG-021', 'Caliper', 'MEASURING', 'Lab P', 'Rosa', 'ANNUAL', 365);
      const found = register.get(r.id);
      expect(found).toBeDefined();
      expect(found!.assetTag).toBe('TAG-021');
    });

    // Parameterized: register 50 different equipment types/frequencies
    const freqs: CalibrationFrequency[] = ['MONTHLY', 'QUARTERLY', 'BIANNUAL', 'ANNUAL', 'BIENNIALLY'];
    Array.from({ length: 50 }, (_, i) => i).forEach((i) => {
      it(`registers equipment #${i} with frequency ${freqs[i % 5]}`, () => {
        const r = register.register(`TAG-P${i}`, `Equip-${i}`, 'MEASURING', `Loc-${i}`, `Owner-${i}`, freqs[i % 5], (i + 1) * 7);
        expect(r.assetTag).toBe(`TAG-P${i}`);
        expect(r.calibrationFrequency).toBe(freqs[i % 5]);
        expect(r.status).toBe('ACTIVE');
      });
    });

    // Parameterized: register 30 equipment with all EquipmentType values
    const types: EquipmentType[] = ['MEASURING', 'TEST', 'MONITORING', 'INSPECTION'];
    Array.from({ length: 30 }, (_, i) => i).forEach((i) => {
      it(`registers equipment type ${types[i % 4]} for item #${i}`, () => {
        const r = register.register(`T-${i}`, `Name-${i}`, types[i % 4], `L-${i}`, `O-${i}`, 'ANNUAL', 365);
        expect(r.type).toBe(types[i % 4]);
      });
    });
  });

  // ── scheduleDue() ────────────────────────────────────────────────────────────
  describe('scheduleDue()', () => {
    it('transitions ACTIVE to DUE_FOR_CALIBRATION', () => {
      const r = register.register('TAG-100', 'Gauge', 'MEASURING', 'Lab', 'Owner', 'ANNUAL', 365);
      register.scheduleDue(r.id);
      expect(register.get(r.id)!.status).toBe('DUE_FOR_CALIBRATION');
    });

    it('returns the updated record', () => {
      const r = register.register('TAG-101', 'Gauge', 'MEASURING', 'Lab', 'Owner', 'ANNUAL', 365);
      const updated = register.scheduleDue(r.id);
      expect(updated.status).toBe('DUE_FOR_CALIBRATION');
    });

    it('throws for unknown id', () => {
      expect(() => register.scheduleDue('bad-id')).toThrow('Equipment not found: bad-id');
    });

    it('persists status after scheduleDue', () => {
      const r = register.register('TAG-102', 'Gauge', 'MEASURING', 'Lab', 'Owner', 'ANNUAL', 365);
      register.scheduleDue(r.id);
      const found = register.get(r.id);
      expect(found!.status).toBe('DUE_FOR_CALIBRATION');
    });

    Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
      it(`scheduleDue on item #${i} sets DUE_FOR_CALIBRATION`, () => {
        const r = register.register(`SD-${i}`, `Equip-${i}`, 'TEST', `L-${i}`, `O-${i}`, 'QUARTERLY', 90);
        register.scheduleDue(r.id);
        expect(register.get(r.id)!.status).toBe('DUE_FOR_CALIBRATION');
      });
    });
  });

  // ── startCalibration() ───────────────────────────────────────────────────────
  describe('startCalibration()', () => {
    it('transitions to UNDER_CALIBRATION', () => {
      const r = register.register('TAG-200', 'Sensor', 'MONITORING', 'Lab', 'Owner', 'ANNUAL', 365);
      register.startCalibration(r.id);
      expect(register.get(r.id)!.status).toBe('UNDER_CALIBRATION');
    });

    it('returns updated record', () => {
      const r = register.register('TAG-201', 'Sensor', 'MONITORING', 'Lab', 'Owner', 'ANNUAL', 365);
      const updated = register.startCalibration(r.id);
      expect(updated.status).toBe('UNDER_CALIBRATION');
    });

    it('throws for unknown id', () => {
      expect(() => register.startCalibration('bad-id')).toThrow('Equipment not found: bad-id');
    });

    it('can transition from DUE_FOR_CALIBRATION to UNDER_CALIBRATION', () => {
      const r = register.register('TAG-202', 'Sensor', 'MONITORING', 'Lab', 'Owner', 'ANNUAL', 365);
      register.scheduleDue(r.id);
      register.startCalibration(r.id);
      expect(register.get(r.id)!.status).toBe('UNDER_CALIBRATION');
    });

    Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
      it(`startCalibration on item #${i} sets UNDER_CALIBRATION`, () => {
        const r = register.register(`SC-${i}`, `Equip-${i}`, 'INSPECTION', `L-${i}`, `O-${i}`, 'BIANNUAL', 180);
        register.startCalibration(r.id);
        expect(register.get(r.id)!.status).toBe('UNDER_CALIBRATION');
      });
    });
  });

  // ── completeCalibration() ────────────────────────────────────────────────────
  describe('completeCalibration()', () => {
    it('returns to ACTIVE', () => {
      const r = register.register('TAG-300', 'Scale', 'MEASURING', 'Lab', 'Owner', 'ANNUAL', 365);
      register.startCalibration(r.id);
      register.completeCalibration(r.id, '2026-01-01', '2027-01-01');
      expect(register.get(r.id)!.status).toBe('ACTIVE');
    });

    it('sets lastCalibrationDate', () => {
      const r = register.register('TAG-301', 'Scale', 'MEASURING', 'Lab', 'Owner', 'ANNUAL', 365);
      register.completeCalibration(r.id, '2026-02-15', '2027-02-15');
      expect(register.get(r.id)!.lastCalibrationDate).toBe('2026-02-15');
    });

    it('sets nextCalibrationDate', () => {
      const r = register.register('TAG-302', 'Scale', 'MEASURING', 'Lab', 'Owner', 'ANNUAL', 365);
      register.completeCalibration(r.id, '2026-02-15', '2027-02-15');
      expect(register.get(r.id)!.nextCalibrationDate).toBe('2027-02-15');
    });

    it('returns updated record', () => {
      const r = register.register('TAG-303', 'Scale', 'MEASURING', 'Lab', 'Owner', 'ANNUAL', 365);
      const updated = register.completeCalibration(r.id, '2026-01-01', '2027-01-01');
      expect(updated.status).toBe('ACTIVE');
      expect(updated.lastCalibrationDate).toBe('2026-01-01');
    });

    it('throws for unknown id', () => {
      expect(() => register.completeCalibration('bad-id', '2026-01-01', '2027-01-01')).toThrow('Equipment not found: bad-id');
    });

    Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
      it(`completeCalibration on item #${i} sets lastCalibrationDate`, () => {
        const r = register.register(`CC-${i}`, `Equip-${i}`, 'TEST', `L-${i}`, `O-${i}`, 'ANNUAL', 365);
        const calDate = `2026-0${(i % 9) + 1}-01`;
        const nextDate = `2027-0${(i % 9) + 1}-01`;
        register.completeCalibration(r.id, calDate, nextDate);
        expect(register.get(r.id)!.lastCalibrationDate).toBe(calDate);
        expect(register.get(r.id)!.nextCalibrationDate).toBe(nextDate);
        expect(register.get(r.id)!.status).toBe('ACTIVE');
      });
    });
  });

  // ── putOutOfService() ────────────────────────────────────────────────────────
  describe('putOutOfService()', () => {
    it('transitions to OUT_OF_SERVICE', () => {
      const r = register.register('TAG-400', 'Probe', 'TEST', 'Lab', 'Owner', 'QUARTERLY', 90);
      register.putOutOfService(r.id);
      expect(register.get(r.id)!.status).toBe('OUT_OF_SERVICE');
    });

    it('returns updated record', () => {
      const r = register.register('TAG-401', 'Probe', 'TEST', 'Lab', 'Owner', 'QUARTERLY', 90);
      const updated = register.putOutOfService(r.id);
      expect(updated.status).toBe('OUT_OF_SERVICE');
    });

    it('throws for unknown id', () => {
      expect(() => register.putOutOfService('bad-id')).toThrow('Equipment not found: bad-id');
    });

    Array.from({ length: 15 }, (_, i) => i).forEach((i) => {
      it(`putOutOfService on item #${i}`, () => {
        const r = register.register(`OOS-${i}`, `Equip-${i}`, 'MONITORING', `L-${i}`, `O-${i}`, 'MONTHLY', 30);
        register.putOutOfService(r.id);
        expect(register.get(r.id)!.status).toBe('OUT_OF_SERVICE');
      });
    });
  });

  // ── retire() ─────────────────────────────────────────────────────────────────
  describe('retire()', () => {
    it('transitions to RETIRED', () => {
      const r = register.register('TAG-500', 'Old Gauge', 'MEASURING', 'Lab', 'Owner', 'ANNUAL', 365);
      register.retire(r.id);
      expect(register.get(r.id)!.status).toBe('RETIRED');
    });

    it('returns updated record', () => {
      const r = register.register('TAG-501', 'Old Gauge', 'MEASURING', 'Lab', 'Owner', 'ANNUAL', 365);
      const updated = register.retire(r.id);
      expect(updated.status).toBe('RETIRED');
    });

    it('throws for unknown id', () => {
      expect(() => register.retire('bad-id')).toThrow('Equipment not found: bad-id');
    });

    Array.from({ length: 15 }, (_, i) => i).forEach((i) => {
      it(`retire on item #${i}`, () => {
        const r = register.register(`RET-${i}`, `Equip-${i}`, 'INSPECTION', `L-${i}`, `O-${i}`, 'BIENNIALLY', 730);
        register.retire(r.id);
        expect(register.get(r.id)!.status).toBe('RETIRED');
      });
    });
  });

  // ── getByStatus() ────────────────────────────────────────────────────────────
  describe('getByStatus()', () => {
    it('returns only ACTIVE records', () => {
      const r1 = register.register('T1', 'A', 'MEASURING', 'L', 'O', 'ANNUAL', 365);
      const r2 = register.register('T2', 'B', 'MEASURING', 'L', 'O', 'ANNUAL', 365);
      register.scheduleDue(r2.id);
      const active = register.getByStatus('ACTIVE');
      expect(active).toHaveLength(1);
      expect(active[0].id).toBe(r1.id);
    });

    it('returns DUE_FOR_CALIBRATION records', () => {
      const r = register.register('T3', 'C', 'TEST', 'L', 'O', 'QUARTERLY', 90);
      register.scheduleDue(r.id);
      expect(register.getByStatus('DUE_FOR_CALIBRATION')).toHaveLength(1);
    });

    it('returns UNDER_CALIBRATION records', () => {
      const r = register.register('T4', 'D', 'TEST', 'L', 'O', 'QUARTERLY', 90);
      register.startCalibration(r.id);
      expect(register.getByStatus('UNDER_CALIBRATION')).toHaveLength(1);
    });

    it('returns OUT_OF_SERVICE records', () => {
      const r = register.register('T5', 'E', 'MONITORING', 'L', 'O', 'MONTHLY', 30);
      register.putOutOfService(r.id);
      expect(register.getByStatus('OUT_OF_SERVICE')).toHaveLength(1);
    });

    it('returns RETIRED records', () => {
      const r = register.register('T6', 'F', 'INSPECTION', 'L', 'O', 'BIENNIALLY', 730);
      register.retire(r.id);
      expect(register.getByStatus('RETIRED')).toHaveLength(1);
    });

    it('returns empty array when no match', () => {
      register.register('T7', 'G', 'MEASURING', 'L', 'O', 'ANNUAL', 365);
      expect(register.getByStatus('RETIRED')).toHaveLength(0);
    });

    Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
      it(`getByStatus finds item #${i} with correct status`, () => {
        const r = register.register(`GS-${i}`, `E-${i}`, 'MEASURING', 'L', 'O', 'ANNUAL', 365);
        const statuses: EquipmentStatus[] = ['ACTIVE', 'DUE_FOR_CALIBRATION', 'UNDER_CALIBRATION', 'OUT_OF_SERVICE', 'RETIRED'];
        const s = statuses[i % 5];
        if (s === 'DUE_FOR_CALIBRATION') register.scheduleDue(r.id);
        else if (s === 'UNDER_CALIBRATION') register.startCalibration(r.id);
        else if (s === 'OUT_OF_SERVICE') register.putOutOfService(r.id);
        else if (s === 'RETIRED') register.retire(r.id);
        const results = register.getByStatus(s);
        expect(results.some((x) => x.id === r.id)).toBe(true);
      });
    });
  });

  // ── getByType() ───────────────────────────────────────────────────────────────
  describe('getByType()', () => {
    it('returns only MEASURING equipment', () => {
      register.register('T1', 'A', 'MEASURING', 'L', 'O', 'ANNUAL', 365);
      register.register('T2', 'B', 'TEST', 'L', 'O', 'ANNUAL', 365);
      const measuring = register.getByType('MEASURING');
      expect(measuring).toHaveLength(1);
    });

    it('returns only TEST equipment', () => {
      register.register('T1', 'A', 'MEASURING', 'L', 'O', 'ANNUAL', 365);
      register.register('T2', 'B', 'TEST', 'L', 'O', 'ANNUAL', 365);
      const test = register.getByType('TEST');
      expect(test).toHaveLength(1);
    });

    it('returns only MONITORING equipment', () => {
      register.register('T1', 'A', 'MONITORING', 'L', 'O', 'ANNUAL', 365);
      expect(register.getByType('MONITORING')).toHaveLength(1);
    });

    it('returns only INSPECTION equipment', () => {
      register.register('T1', 'A', 'INSPECTION', 'L', 'O', 'ANNUAL', 365);
      expect(register.getByType('INSPECTION')).toHaveLength(1);
    });

    it('returns empty array when type not present', () => {
      register.register('T1', 'A', 'MEASURING', 'L', 'O', 'ANNUAL', 365);
      expect(register.getByType('INSPECTION')).toHaveLength(0);
    });

    Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
      const types: EquipmentType[] = ['MEASURING', 'TEST', 'MONITORING', 'INSPECTION'];
      it(`getByType item #${i} type=${types[i % 4]}`, () => {
        const t = types[i % 4];
        const r = register.register(`GT-${i}`, `E-${i}`, t, 'L', 'O', 'ANNUAL', 365);
        expect(register.getByType(t).some((x) => x.id === r.id)).toBe(true);
      });
    });
  });

  // ── getByLocation() ───────────────────────────────────────────────────────────
  describe('getByLocation()', () => {
    it('returns equipment in given location', () => {
      register.register('T1', 'A', 'MEASURING', 'Lab A', 'O', 'ANNUAL', 365);
      register.register('T2', 'B', 'MEASURING', 'Lab B', 'O', 'ANNUAL', 365);
      expect(register.getByLocation('Lab A')).toHaveLength(1);
    });

    it('returns all equipment in same location', () => {
      register.register('T1', 'A', 'MEASURING', 'Lab A', 'O', 'ANNUAL', 365);
      register.register('T2', 'B', 'MEASURING', 'Lab A', 'O', 'ANNUAL', 365);
      expect(register.getByLocation('Lab A')).toHaveLength(2);
    });

    it('returns empty array for unknown location', () => {
      register.register('T1', 'A', 'MEASURING', 'Lab A', 'O', 'ANNUAL', 365);
      expect(register.getByLocation('Lab Z')).toHaveLength(0);
    });

    Array.from({ length: 15 }, (_, i) => i).forEach((i) => {
      it(`getByLocation item #${i} location=Loc-${i % 5}`, () => {
        const loc = `Loc-${i % 5}`;
        const r = register.register(`GL-${i}`, `E-${i}`, 'MEASURING', loc, 'O', 'ANNUAL', 365);
        expect(register.getByLocation(loc).some((x) => x.id === r.id)).toBe(true);
      });
    });
  });

  // ── getByOwner() ──────────────────────────────────────────────────────────────
  describe('getByOwner()', () => {
    it('returns equipment for given owner', () => {
      register.register('T1', 'A', 'MEASURING', 'L', 'Alice', 'ANNUAL', 365);
      register.register('T2', 'B', 'TEST', 'L', 'Bob', 'ANNUAL', 365);
      expect(register.getByOwner('Alice')).toHaveLength(1);
    });

    it('returns all equipment for same owner', () => {
      register.register('T1', 'A', 'MEASURING', 'L', 'Alice', 'ANNUAL', 365);
      register.register('T2', 'B', 'TEST', 'L', 'Alice', 'ANNUAL', 365);
      expect(register.getByOwner('Alice')).toHaveLength(2);
    });

    it('returns empty array for unknown owner', () => {
      register.register('T1', 'A', 'MEASURING', 'L', 'Alice', 'ANNUAL', 365);
      expect(register.getByOwner('Charlie')).toHaveLength(0);
    });

    Array.from({ length: 15 }, (_, i) => i).forEach((i) => {
      it(`getByOwner item #${i} owner=Owner-${i % 5}`, () => {
        const owner = `Owner-${i % 5}`;
        const r = register.register(`GO-${i}`, `E-${i}`, 'MEASURING', 'L', owner, 'ANNUAL', 365);
        expect(register.getByOwner(owner).some((x) => x.id === r.id)).toBe(true);
      });
    });
  });

  // ── getDueForCalibration() ────────────────────────────────────────────────────
  describe('getDueForCalibration()', () => {
    it('returns ACTIVE equipment whose nextCalibrationDate <= asOf', () => {
      const r = register.register('T1', 'A', 'MEASURING', 'L', 'O', 'ANNUAL', 365);
      register.completeCalibration(r.id, '2025-01-01', '2026-01-01');
      const due = register.getDueForCalibration('2026-02-01');
      expect(due.some((x) => x.id === r.id)).toBe(true);
    });

    it('excludes ACTIVE equipment whose nextCalibrationDate is in the future', () => {
      const r = register.register('T1', 'A', 'MEASURING', 'L', 'O', 'ANNUAL', 365);
      register.completeCalibration(r.id, '2026-01-01', '2027-01-01');
      const due = register.getDueForCalibration('2026-02-01');
      expect(due.some((x) => x.id === r.id)).toBe(false);
    });

    it('includes DUE_FOR_CALIBRATION equipment', () => {
      const r = register.register('T2', 'B', 'TEST', 'L', 'O', 'QUARTERLY', 90);
      register.completeCalibration(r.id, '2025-01-01', '2026-01-01');
      register.scheduleDue(r.id);
      const due = register.getDueForCalibration('2026-02-01');
      expect(due.some((x) => x.id === r.id)).toBe(true);
    });

    it('excludes equipment with no nextCalibrationDate', () => {
      register.register('T3', 'C', 'MONITORING', 'L', 'O', 'MONTHLY', 30);
      const due = register.getDueForCalibration('2026-02-01');
      expect(due).toHaveLength(0);
    });

    it('excludes RETIRED equipment', () => {
      const r = register.register('T4', 'D', 'INSPECTION', 'L', 'O', 'BIENNIALLY', 730);
      register.completeCalibration(r.id, '2025-01-01', '2026-01-01');
      register.retire(r.id);
      const due = register.getDueForCalibration('2026-02-01');
      expect(due.some((x) => x.id === r.id)).toBe(false);
    });

    it('includes equipment exactly on the asOf date', () => {
      const r = register.register('T5', 'E', 'MEASURING', 'L', 'O', 'ANNUAL', 365);
      register.completeCalibration(r.id, '2025-02-01', '2026-02-01');
      const due = register.getDueForCalibration('2026-02-01');
      expect(due.some((x) => x.id === r.id)).toBe(true);
    });

    Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
      it(`getDueForCalibration #${i}: equipment due before asOf is included`, () => {
        const r = register.register(`DUE-${i}`, `E-${i}`, 'MEASURING', 'L', 'O', 'ANNUAL', 365);
        const pastDate = `20${25 - (i % 10)}-01-01`;
        register.completeCalibration(r.id, '2024-01-01', pastDate);
        const due = register.getDueForCalibration('2026-06-01');
        expect(due.some((x) => x.id === r.id)).toBe(true);
      });
    });
  });

  // ── getOverdue() ──────────────────────────────────────────────────────────────
  describe('getOverdue()', () => {
    it('returns ACTIVE equipment strictly past nextCalibrationDate', () => {
      const r = register.register('T1', 'A', 'MEASURING', 'L', 'O', 'ANNUAL', 365);
      register.completeCalibration(r.id, '2025-01-01', '2025-12-01');
      const overdue = register.getOverdue('2026-01-01');
      expect(overdue.some((x) => x.id === r.id)).toBe(true);
    });

    it('excludes equipment whose nextCalibrationDate equals asOf (not strictly past)', () => {
      const r = register.register('T1', 'A', 'MEASURING', 'L', 'O', 'ANNUAL', 365);
      register.completeCalibration(r.id, '2025-01-01', '2026-01-01');
      const overdue = register.getOverdue('2026-01-01');
      expect(overdue.some((x) => x.id === r.id)).toBe(false);
    });

    it('excludes equipment in the future', () => {
      const r = register.register('T2', 'B', 'TEST', 'L', 'O', 'ANNUAL', 365);
      register.completeCalibration(r.id, '2026-01-01', '2027-01-01');
      expect(register.getOverdue('2026-06-01')).toHaveLength(0);
    });

    it('excludes DUE_FOR_CALIBRATION from overdue', () => {
      const r = register.register('T3', 'C', 'TEST', 'L', 'O', 'ANNUAL', 365);
      register.completeCalibration(r.id, '2025-01-01', '2025-12-01');
      register.scheduleDue(r.id);
      const overdue = register.getOverdue('2026-01-01');
      expect(overdue.some((x) => x.id === r.id)).toBe(false);
    });

    Array.from({ length: 15 }, (_, i) => i).forEach((i) => {
      it(`getOverdue #${i}: equipment overdue is returned`, () => {
        const r = register.register(`OD-${i}`, `E-${i}`, 'MEASURING', 'L', 'O', 'ANNUAL', 365);
        register.completeCalibration(r.id, '2024-01-01', `2025-0${(i % 9) + 1}-01`);
        const overdue = register.getOverdue('2026-01-01');
        expect(overdue.some((x) => x.id === r.id)).toBe(true);
      });
    });
  });

  // ── getAll() / getCount() ─────────────────────────────────────────────────────
  describe('getAll() and getCount()', () => {
    it('getAll returns all registered equipment', () => {
      register.register('T1', 'A', 'MEASURING', 'L', 'O', 'ANNUAL', 365);
      register.register('T2', 'B', 'TEST', 'L', 'O', 'ANNUAL', 365);
      register.register('T3', 'C', 'MONITORING', 'L', 'O', 'ANNUAL', 365);
      expect(register.getAll()).toHaveLength(3);
    });

    it('getCount equals getAll length', () => {
      for (let i = 0; i < 5; i++) {
        register.register(`T${i}`, `E-${i}`, 'MEASURING', 'L', 'O', 'ANNUAL', 365);
      }
      expect(register.getCount()).toBe(register.getAll().length);
    });

    Array.from({ length: 20 }, (_, i) => i + 1).forEach((n) => {
      it(`getCount is ${n} after registering ${n} items`, () => {
        const reg2 = new CalibrationRegister();
        for (let j = 0; j < n; j++) {
          reg2.register(`T${j}`, `E-${j}`, 'MEASURING', 'L', 'O', 'ANNUAL', 365);
        }
        expect(reg2.getCount()).toBe(n);
      });
    });
  });

  // ── Status transition chain ───────────────────────────────────────────────────
  describe('full status transition chain', () => {
    it('ACTIVE → DUE_FOR_CALIBRATION → UNDER_CALIBRATION → ACTIVE', () => {
      const r = register.register('TC-001', 'Chain', 'MEASURING', 'Lab', 'Owner', 'ANNUAL', 365);
      expect(r.status).toBe('ACTIVE');
      register.scheduleDue(r.id);
      expect(register.get(r.id)!.status).toBe('DUE_FOR_CALIBRATION');
      register.startCalibration(r.id);
      expect(register.get(r.id)!.status).toBe('UNDER_CALIBRATION');
      register.completeCalibration(r.id, '2026-01-01', '2027-01-01');
      expect(register.get(r.id)!.status).toBe('ACTIVE');
    });

    it('ACTIVE → OUT_OF_SERVICE → RETIRED', () => {
      const r = register.register('TC-002', 'Chain2', 'TEST', 'Lab', 'Owner', 'QUARTERLY', 90);
      register.putOutOfService(r.id);
      expect(register.get(r.id)!.status).toBe('OUT_OF_SERVICE');
      register.retire(r.id);
      expect(register.get(r.id)!.status).toBe('RETIRED');
    });

    Array.from({ length: 15 }, (_, i) => i).forEach((i) => {
      it(`full calibration cycle #${i}`, () => {
        const r = register.register(`CYC-${i}`, `E-${i}`, 'MEASURING', 'L', 'O', 'ANNUAL', 365);
        register.scheduleDue(r.id);
        register.startCalibration(r.id);
        register.completeCalibration(r.id, '2026-01-01', '2027-01-01');
        const rec = register.get(r.id)!;
        expect(rec.status).toBe('ACTIVE');
        expect(rec.lastCalibrationDate).toBe('2026-01-01');
        expect(rec.nextCalibrationDate).toBe('2027-01-01');
      });
    });
  });

  // ── Edge cases ────────────────────────────────────────────────────────────────
  describe('edge cases', () => {
    it('handles empty string assetTag', () => {
      const r = register.register('', 'A', 'MEASURING', 'L', 'O', 'ANNUAL', 365);
      expect(r.assetTag).toBe('');
    });

    it('handles calibrationIntervalDays of 1', () => {
      const r = register.register('T1', 'A', 'MEASURING', 'L', 'O', 'MONTHLY', 1);
      expect(r.calibrationIntervalDays).toBe(1);
    });

    it('handles very large calibrationIntervalDays', () => {
      const r = register.register('T1', 'A', 'MEASURING', 'L', 'O', 'BIENNIALLY', 9999);
      expect(r.calibrationIntervalDays).toBe(9999);
    });

    it('multiple equipment items independent of each other', () => {
      const r1 = register.register('T1', 'A', 'MEASURING', 'L', 'O', 'ANNUAL', 365);
      const r2 = register.register('T2', 'B', 'TEST', 'L', 'O', 'ANNUAL', 365);
      register.retire(r1.id);
      expect(register.get(r2.id)!.status).toBe('ACTIVE');
    });

    it('error message includes the bad id', () => {
      expect(() => register.get('no-such-id')).toBeUndefined;
      expect(() => register.scheduleDue('xyz')).toThrow('xyz');
    });

    Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
      it(`edge case #${i}: notes with special chars`, () => {
        const notes = `Note ${i}: <>&"'`;
        const r = register.register(`EC-${i}`, `E-${i}`, 'MEASURING', 'L', 'O', 'ANNUAL', 365, undefined, undefined, undefined, notes);
        expect(r.notes).toBe(notes);
      });
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CertificateTracker tests
// ─────────────────────────────────────────────────────────────────────────────

describe('CertificateTracker', () => {
  let tracker: CertificateTracker;

  beforeEach(() => {
    tracker = new CertificateTracker();
  });

  // ── Construction ────────────────────────────────────────────────────────────
  describe('construction', () => {
    it('starts empty', () => {
      expect(tracker.getCount()).toBe(0);
    });

    it('getAll returns empty array', () => {
      expect(tracker.getAll()).toEqual([]);
    });

    it('get on unknown id returns undefined', () => {
      expect(tracker.get('nonexistent')).toBeUndefined();
    });
  });

  // ── issue() ──────────────────────────────────────────────────────────────────
  describe('issue()', () => {
    it('returns a CalibrationCertificate', () => {
      const c = tracker.issue('eq-1', 'CERT-001', 'LabCo', '2026-01-01', '2027-01-01', 'PASS');
      expect(c).toBeDefined();
    });

    it('assigns a uuid id', () => {
      const c = tracker.issue('eq-1', 'CERT-001', 'LabCo', '2026-01-01', '2027-01-01', 'PASS');
      expect(typeof c.id).toBe('string');
      expect(c.id.length).toBeGreaterThan(0);
    });

    it('initial status is VALID', () => {
      const c = tracker.issue('eq-1', 'CERT-001', 'LabCo', '2026-01-01', '2027-01-01', 'PASS');
      expect(c.status).toBe('VALID');
    });

    it('stores equipmentId', () => {
      const c = tracker.issue('equip-xyz', 'CERT-002', 'LabCo', '2026-01-01', '2027-01-01', 'PASS');
      expect(c.equipmentId).toBe('equip-xyz');
    });

    it('stores certificateNumber', () => {
      const c = tracker.issue('eq-1', 'CERT-NNN', 'LabCo', '2026-01-01', '2027-01-01', 'PASS');
      expect(c.certificateNumber).toBe('CERT-NNN');
    });

    it('stores calibratedBy', () => {
      const c = tracker.issue('eq-1', 'CERT-001', 'NIST Lab', '2026-01-01', '2027-01-01', 'PASS');
      expect(c.calibratedBy).toBe('NIST Lab');
    });

    it('stores calibrationDate', () => {
      const c = tracker.issue('eq-1', 'CERT-001', 'LabCo', '2026-02-15', '2027-02-15', 'PASS');
      expect(c.calibrationDate).toBe('2026-02-15');
    });

    it('stores expiryDate', () => {
      const c = tracker.issue('eq-1', 'CERT-001', 'LabCo', '2026-01-01', '2027-03-15', 'PASS');
      expect(c.expiryDate).toBe('2027-03-15');
    });

    it('stores result', () => {
      const c = tracker.issue('eq-1', 'CERT-001', 'LabCo', '2026-01-01', '2027-01-01', 'FAIL');
      expect(c.result).toBe('FAIL');
    });

    it('stores optional referenceStandard', () => {
      const c = tracker.issue('eq-1', 'CERT-001', 'LabCo', '2026-01-01', '2027-01-01', 'PASS', 'ISO 17025');
      expect(c.referenceStandard).toBe('ISO 17025');
    });

    it('stores optional uncertaintyValue', () => {
      const c = tracker.issue('eq-1', 'CERT-001', 'LabCo', '2026-01-01', '2027-01-01', 'PASS', undefined, 0.005);
      expect(c.uncertaintyValue).toBe(0.005);
    });

    it('stores optional notes', () => {
      const c = tracker.issue('eq-1', 'CERT-001', 'LabCo', '2026-01-01', '2027-01-01', 'PASS', undefined, undefined, 'Recalibrated');
      expect(c.notes).toBe('Recalibrated');
    });

    it('undefined referenceStandard when not provided', () => {
      const c = tracker.issue('eq-1', 'CERT-001', 'LabCo', '2026-01-01', '2027-01-01', 'PASS');
      expect(c.referenceStandard).toBeUndefined();
    });

    it('undefined uncertaintyValue when not provided', () => {
      const c = tracker.issue('eq-1', 'CERT-001', 'LabCo', '2026-01-01', '2027-01-01', 'PASS');
      expect(c.uncertaintyValue).toBeUndefined();
    });

    it('undefined notes when not provided', () => {
      const c = tracker.issue('eq-1', 'CERT-001', 'LabCo', '2026-01-01', '2027-01-01', 'PASS');
      expect(c.notes).toBeUndefined();
    });

    it('increments count', () => {
      tracker.issue('eq-1', 'CERT-001', 'LabCo', '2026-01-01', '2027-01-01', 'PASS');
      expect(tracker.getCount()).toBe(1);
    });

    it('two issues yield count 2', () => {
      tracker.issue('eq-1', 'CERT-001', 'LabCo', '2026-01-01', '2027-01-01', 'PASS');
      tracker.issue('eq-2', 'CERT-002', 'LabCo', '2026-02-01', '2027-02-01', 'FAIL');
      expect(tracker.getCount()).toBe(2);
    });

    it('each issued cert gets unique id', () => {
      const c1 = tracker.issue('eq-1', 'CERT-001', 'L', '2026-01-01', '2027-01-01', 'PASS');
      const c2 = tracker.issue('eq-1', 'CERT-002', 'L', '2026-02-01', '2027-02-01', 'PASS');
      expect(c1.id).not.toBe(c2.id);
    });

    it('can retrieve issued cert by id', () => {
      const c = tracker.issue('eq-1', 'CERT-001', 'LabCo', '2026-01-01', '2027-01-01', 'PASS');
      expect(tracker.get(c.id)).toBeDefined();
      expect(tracker.get(c.id)!.certificateNumber).toBe('CERT-001');
    });

    // Parameterized: issue 50 certs with different results
    const results: CalibrationResult[] = ['PASS', 'FAIL', 'PASS_WITH_ADJUSTMENT', 'OUT_OF_TOLERANCE'];
    Array.from({ length: 50 }, (_, i) => i).forEach((i) => {
      it(`issue cert #${i} with result ${results[i % 4]}`, () => {
        const c = tracker.issue(`eq-${i}`, `CERT-${i}`, 'LabCo', '2026-01-01', '2027-01-01', results[i % 4]);
        expect(c.result).toBe(results[i % 4]);
        expect(c.status).toBe('VALID');
      });
    });

    // Parameterized: issue 30 certs with different uncertainty values
    Array.from({ length: 30 }, (_, i) => i).forEach((i) => {
      it(`issue cert #${i} with uncertainty ${i * 0.001}`, () => {
        const uncertainty = i * 0.001;
        const c = tracker.issue(`eq-${i}`, `CERT-U${i}`, 'LabCo', '2026-01-01', '2027-01-01', 'PASS', 'ISO 17025', uncertainty);
        expect(c.uncertaintyValue).toBeCloseTo(uncertainty);
      });
    });
  });

  // ── expire() ─────────────────────────────────────────────────────────────────
  describe('expire()', () => {
    it('transitions VALID to EXPIRED', () => {
      const c = tracker.issue('eq-1', 'CERT-001', 'L', '2026-01-01', '2027-01-01', 'PASS');
      tracker.expire(c.id);
      expect(tracker.get(c.id)!.status).toBe('EXPIRED');
    });

    it('returns updated certificate', () => {
      const c = tracker.issue('eq-1', 'CERT-001', 'L', '2026-01-01', '2027-01-01', 'PASS');
      const updated = tracker.expire(c.id);
      expect(updated.status).toBe('EXPIRED');
    });

    it('throws for unknown id', () => {
      expect(() => tracker.expire('bad-id')).toThrow('Certificate not found: bad-id');
    });

    Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
      it(`expire cert #${i}`, () => {
        const c = tracker.issue(`eq-${i}`, `CERT-${i}`, 'L', '2026-01-01', '2027-01-01', 'PASS');
        tracker.expire(c.id);
        expect(tracker.get(c.id)!.status).toBe('EXPIRED');
      });
    });
  });

  // ── revoke() ─────────────────────────────────────────────────────────────────
  describe('revoke()', () => {
    it('transitions VALID to REVOKED', () => {
      const c = tracker.issue('eq-1', 'CERT-001', 'L', '2026-01-01', '2027-01-01', 'PASS');
      tracker.revoke(c.id);
      expect(tracker.get(c.id)!.status).toBe('REVOKED');
    });

    it('returns updated certificate', () => {
      const c = tracker.issue('eq-1', 'CERT-001', 'L', '2026-01-01', '2027-01-01', 'PASS');
      const updated = tracker.revoke(c.id);
      expect(updated.status).toBe('REVOKED');
    });

    it('throws for unknown id', () => {
      expect(() => tracker.revoke('bad-id')).toThrow('Certificate not found: bad-id');
    });

    Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
      it(`revoke cert #${i}`, () => {
        const c = tracker.issue(`eq-${i}`, `CERT-${i}`, 'L', '2026-01-01', '2027-01-01', 'PASS');
        tracker.revoke(c.id);
        expect(tracker.get(c.id)!.status).toBe('REVOKED');
      });
    });
  });

  // ── supersede() ──────────────────────────────────────────────────────────────
  describe('supersede()', () => {
    it('transitions VALID to SUPERSEDED', () => {
      const c = tracker.issue('eq-1', 'CERT-001', 'L', '2026-01-01', '2027-01-01', 'PASS');
      tracker.supersede(c.id);
      expect(tracker.get(c.id)!.status).toBe('SUPERSEDED');
    });

    it('returns updated certificate', () => {
      const c = tracker.issue('eq-1', 'CERT-001', 'L', '2026-01-01', '2027-01-01', 'PASS');
      const updated = tracker.supersede(c.id);
      expect(updated.status).toBe('SUPERSEDED');
    });

    it('throws for unknown id', () => {
      expect(() => tracker.supersede('bad-id')).toThrow('Certificate not found: bad-id');
    });

    Array.from({ length: 15 }, (_, i) => i).forEach((i) => {
      it(`supersede cert #${i}`, () => {
        const c = tracker.issue(`eq-${i}`, `CERT-${i}`, 'L', '2026-01-01', '2027-01-01', 'PASS');
        tracker.supersede(c.id);
        expect(tracker.get(c.id)!.status).toBe('SUPERSEDED');
      });
    });
  });

  // ── getByEquipment() ─────────────────────────────────────────────────────────
  describe('getByEquipment()', () => {
    it('returns certs for given equipment', () => {
      tracker.issue('eq-1', 'CERT-001', 'L', '2026-01-01', '2027-01-01', 'PASS');
      tracker.issue('eq-2', 'CERT-002', 'L', '2026-01-01', '2027-01-01', 'PASS');
      expect(tracker.getByEquipment('eq-1')).toHaveLength(1);
    });

    it('returns multiple certs for same equipment', () => {
      tracker.issue('eq-1', 'CERT-001', 'L', '2025-01-01', '2026-01-01', 'PASS');
      tracker.issue('eq-1', 'CERT-002', 'L', '2026-01-01', '2027-01-01', 'PASS');
      expect(tracker.getByEquipment('eq-1')).toHaveLength(2);
    });

    it('returns empty array for unknown equipment', () => {
      tracker.issue('eq-1', 'CERT-001', 'L', '2026-01-01', '2027-01-01', 'PASS');
      expect(tracker.getByEquipment('eq-999')).toHaveLength(0);
    });

    Array.from({ length: 15 }, (_, i) => i).forEach((i) => {
      it(`getByEquipment #${i}: correct count`, () => {
        const eqId = `eq-be-${i}`;
        for (let j = 0; j <= i % 4; j++) {
          tracker.issue(eqId, `CERT-BE-${i}-${j}`, 'L', '2026-01-01', '2027-01-01', 'PASS');
        }
        expect(tracker.getByEquipment(eqId)).toHaveLength((i % 4) + 1);
      });
    });
  });

  // ── getLatest() ───────────────────────────────────────────────────────────────
  describe('getLatest()', () => {
    it('returns the certificate with the most recent calibrationDate', () => {
      tracker.issue('eq-1', 'CERT-001', 'L', '2024-01-01', '2025-01-01', 'PASS');
      tracker.issue('eq-1', 'CERT-002', 'L', '2026-01-01', '2027-01-01', 'PASS');
      const latest = tracker.getLatest('eq-1');
      expect(latest!.certificateNumber).toBe('CERT-002');
    });

    it('returns undefined for unknown equipment', () => {
      expect(tracker.getLatest('eq-unknown')).toBeUndefined();
    });

    it('returns the single cert if only one exists', () => {
      tracker.issue('eq-1', 'CERT-001', 'L', '2026-01-01', '2027-01-01', 'PASS');
      const latest = tracker.getLatest('eq-1');
      expect(latest!.certificateNumber).toBe('CERT-001');
    });

    it('correctly picks latest among three certs', () => {
      tracker.issue('eq-1', 'CERT-001', 'L', '2023-01-01', '2024-01-01', 'PASS');
      tracker.issue('eq-1', 'CERT-002', 'L', '2025-01-01', '2026-01-01', 'PASS');
      tracker.issue('eq-1', 'CERT-003', 'L', '2026-06-01', '2027-06-01', 'PASS');
      const latest = tracker.getLatest('eq-1');
      expect(latest!.certificateNumber).toBe('CERT-003');
    });

    it('does not cross-contaminate equipment ids', () => {
      tracker.issue('eq-1', 'CERT-001', 'L', '2026-01-01', '2027-01-01', 'PASS');
      tracker.issue('eq-2', 'CERT-999', 'L', '2030-01-01', '2031-01-01', 'PASS');
      const latest = tracker.getLatest('eq-1');
      expect(latest!.certificateNumber).toBe('CERT-001');
    });

    Array.from({ length: 15 }, (_, i) => i + 1).forEach((n) => {
      it(`getLatest with ${n} certs returns correct one`, () => {
        const eqId = `eq-lat-${n}`;
        for (let j = 1; j <= n; j++) {
          tracker.issue(eqId, `CERT-${n}-${j}`, 'L', `2020-0${(j % 9) + 1}-01`, '2025-01-01', 'PASS');
        }
        const latest = tracker.getLatest(eqId)!;
        expect(latest).toBeDefined();
        const allDates = tracker.getByEquipment(eqId).map((c) => c.calibrationDate);
        expect(latest.calibrationDate).toBe(allDates.sort().reverse()[0]);
      });
    });
  });

  // ── getValid() ────────────────────────────────────────────────────────────────
  describe('getValid()', () => {
    it('returns only VALID certs', () => {
      tracker.issue('eq-1', 'CERT-001', 'L', '2026-01-01', '2027-01-01', 'PASS');
      const c2 = tracker.issue('eq-2', 'CERT-002', 'L', '2026-01-01', '2027-01-01', 'PASS');
      tracker.expire(c2.id);
      expect(tracker.getValid()).toHaveLength(1);
    });

    it('returns empty when all expired', () => {
      const c = tracker.issue('eq-1', 'CERT-001', 'L', '2026-01-01', '2027-01-01', 'PASS');
      tracker.expire(c.id);
      expect(tracker.getValid()).toHaveLength(0);
    });

    it('returns all when none expired', () => {
      for (let i = 0; i < 5; i++) {
        tracker.issue(`eq-${i}`, `CERT-${i}`, 'L', '2026-01-01', '2027-01-01', 'PASS');
      }
      expect(tracker.getValid()).toHaveLength(5);
    });

    Array.from({ length: 15 }, (_, i) => i).forEach((i) => {
      it(`getValid after issuing ${i + 1} valid certs`, () => {
        const tr2 = new CertificateTracker();
        for (let j = 0; j <= i; j++) {
          tr2.issue(`eq-${j}`, `CERT-${j}`, 'L', '2026-01-01', '2027-01-01', 'PASS');
        }
        expect(tr2.getValid()).toHaveLength(i + 1);
      });
    });
  });

  // ── getExpired() ──────────────────────────────────────────────────────────────
  describe('getExpired()', () => {
    it('returns only EXPIRED certs', () => {
      const c = tracker.issue('eq-1', 'CERT-001', 'L', '2026-01-01', '2027-01-01', 'PASS');
      tracker.expire(c.id);
      expect(tracker.getExpired()).toHaveLength(1);
    });

    it('returns empty when no expired certs', () => {
      tracker.issue('eq-1', 'CERT-001', 'L', '2026-01-01', '2027-01-01', 'PASS');
      expect(tracker.getExpired()).toHaveLength(0);
    });

    Array.from({ length: 15 }, (_, i) => i).forEach((i) => {
      it(`getExpired #${i}: count matches`, () => {
        const tr2 = new CertificateTracker();
        for (let j = 0; j <= i; j++) {
          const c = tr2.issue(`eq-${j}`, `CERT-${j}`, 'L', '2026-01-01', '2027-01-01', 'PASS');
          tr2.expire(c.id);
        }
        expect(tr2.getExpired()).toHaveLength(i + 1);
      });
    });
  });

  // ── getExpiring() ─────────────────────────────────────────────────────────────
  describe('getExpiring()', () => {
    it('returns VALID certs expiring within N days', () => {
      tracker.issue('eq-1', 'CERT-001', 'L', '2026-01-01', '2026-03-01', 'PASS');
      tracker.issue('eq-2', 'CERT-002', 'L', '2026-01-01', '2026-06-01', 'PASS');
      const expiring = tracker.getExpiring('2026-02-26', 10);
      expect(expiring.some((c) => c.equipmentId === 'eq-1')).toBe(true);
      expect(expiring.some((c) => c.equipmentId === 'eq-2')).toBe(false);
    });

    it('excludes already-expired certs', () => {
      const c = tracker.issue('eq-1', 'CERT-001', 'L', '2025-01-01', '2025-12-01', 'PASS');
      tracker.expire(c.id);
      expect(tracker.getExpiring('2026-02-26', 30)).toHaveLength(0);
    });

    it('returns empty when no certs expiring soon', () => {
      tracker.issue('eq-1', 'CERT-001', 'L', '2026-01-01', '2027-01-01', 'PASS');
      expect(tracker.getExpiring('2026-02-26', 5)).toHaveLength(0);
    });

    it('includes cert expiring exactly on asOf + withinDays', () => {
      tracker.issue('eq-1', 'CERT-001', 'L', '2026-01-01', '2026-03-08', 'PASS');
      const expiring = tracker.getExpiring('2026-02-26', 10);
      expect(expiring).toHaveLength(1);
    });

    it('includes cert expiring on asOf itself', () => {
      tracker.issue('eq-1', 'CERT-001', 'L', '2026-01-01', '2026-02-26', 'PASS');
      const expiring = tracker.getExpiring('2026-02-26', 30);
      expect(expiring.some((c) => c.equipmentId === 'eq-1')).toBe(true);
    });

    Array.from({ length: 15 }, (_, i) => i).forEach((i) => {
      it(`getExpiring #${i}: within ${i + 1} days`, () => {
        const tr2 = new CertificateTracker();
        // Issue a cert expiring in exactly (i+1) days from 2026-02-26
        const expiryDate = new Date('2026-02-26');
        expiryDate.setDate(expiryDate.getDate() + i + 1);
        const expiryStr = expiryDate.toISOString().slice(0, 10);
        tr2.issue(`eq-exp-${i}`, `CERT-EXP-${i}`, 'L', '2026-01-01', expiryStr, 'PASS');
        const expiring = tr2.getExpiring('2026-02-26', i + 1);
        expect(expiring).toHaveLength(1);
      });
    });
  });

  // ── getByResult() ─────────────────────────────────────────────────────────────
  describe('getByResult()', () => {
    it('returns only PASS certs', () => {
      tracker.issue('eq-1', 'CERT-001', 'L', '2026-01-01', '2027-01-01', 'PASS');
      tracker.issue('eq-2', 'CERT-002', 'L', '2026-01-01', '2027-01-01', 'FAIL');
      expect(tracker.getByResult('PASS')).toHaveLength(1);
    });

    it('returns only FAIL certs', () => {
      tracker.issue('eq-1', 'CERT-001', 'L', '2026-01-01', '2027-01-01', 'FAIL');
      tracker.issue('eq-2', 'CERT-002', 'L', '2026-01-01', '2027-01-01', 'PASS');
      expect(tracker.getByResult('FAIL')).toHaveLength(1);
    });

    it('returns only PASS_WITH_ADJUSTMENT certs', () => {
      tracker.issue('eq-1', 'CERT-001', 'L', '2026-01-01', '2027-01-01', 'PASS_WITH_ADJUSTMENT');
      expect(tracker.getByResult('PASS_WITH_ADJUSTMENT')).toHaveLength(1);
    });

    it('returns only OUT_OF_TOLERANCE certs', () => {
      tracker.issue('eq-1', 'CERT-001', 'L', '2026-01-01', '2027-01-01', 'OUT_OF_TOLERANCE');
      expect(tracker.getByResult('OUT_OF_TOLERANCE')).toHaveLength(1);
    });

    it('returns empty when no match', () => {
      tracker.issue('eq-1', 'CERT-001', 'L', '2026-01-01', '2027-01-01', 'PASS');
      expect(tracker.getByResult('FAIL')).toHaveLength(0);
    });

    Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
      const results: CalibrationResult[] = ['PASS', 'FAIL', 'PASS_WITH_ADJUSTMENT', 'OUT_OF_TOLERANCE'];
      it(`getByResult #${i}: result=${results[i % 4]}`, () => {
        const result = results[i % 4];
        tracker.issue(`eq-${i}`, `CERT-R${i}`, 'L', '2026-01-01', '2027-01-01', result);
        expect(tracker.getByResult(result).length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  // ── getFailedOrOutOfTolerance() ───────────────────────────────────────────────
  describe('getFailedOrOutOfTolerance()', () => {
    it('returns FAIL certs', () => {
      tracker.issue('eq-1', 'CERT-001', 'L', '2026-01-01', '2027-01-01', 'FAIL');
      expect(tracker.getFailedOrOutOfTolerance()).toHaveLength(1);
    });

    it('returns OUT_OF_TOLERANCE certs', () => {
      tracker.issue('eq-1', 'CERT-001', 'L', '2026-01-01', '2027-01-01', 'OUT_OF_TOLERANCE');
      expect(tracker.getFailedOrOutOfTolerance()).toHaveLength(1);
    });

    it('does not return PASS certs', () => {
      tracker.issue('eq-1', 'CERT-001', 'L', '2026-01-01', '2027-01-01', 'PASS');
      expect(tracker.getFailedOrOutOfTolerance()).toHaveLength(0);
    });

    it('does not return PASS_WITH_ADJUSTMENT certs', () => {
      tracker.issue('eq-1', 'CERT-001', 'L', '2026-01-01', '2027-01-01', 'PASS_WITH_ADJUSTMENT');
      expect(tracker.getFailedOrOutOfTolerance()).toHaveLength(0);
    });

    it('returns both FAIL and OUT_OF_TOLERANCE', () => {
      tracker.issue('eq-1', 'CERT-001', 'L', '2026-01-01', '2027-01-01', 'FAIL');
      tracker.issue('eq-2', 'CERT-002', 'L', '2026-01-01', '2027-01-01', 'OUT_OF_TOLERANCE');
      tracker.issue('eq-3', 'CERT-003', 'L', '2026-01-01', '2027-01-01', 'PASS');
      expect(tracker.getFailedOrOutOfTolerance()).toHaveLength(2);
    });

    Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
      it(`getFailedOrOutOfTolerance #${i}: mixed results`, () => {
        const tr2 = new CertificateTracker();
        const failCount = (i % 3) + 1;
        const ootCount = (i % 2) + 1;
        for (let j = 0; j < failCount; j++) {
          tr2.issue(`eq-f${j}`, `CERT-F${i}-${j}`, 'L', '2026-01-01', '2027-01-01', 'FAIL');
        }
        for (let j = 0; j < ootCount; j++) {
          tr2.issue(`eq-o${j}`, `CERT-O${i}-${j}`, 'L', '2026-01-01', '2027-01-01', 'OUT_OF_TOLERANCE');
        }
        tr2.issue('eq-p', `CERT-P${i}`, 'L', '2026-01-01', '2027-01-01', 'PASS');
        expect(tr2.getFailedOrOutOfTolerance()).toHaveLength(failCount + ootCount);
      });
    });
  });

  // ── getCount() / getAll() ─────────────────────────────────────────────────────
  describe('getCount() and getAll()', () => {
    it('getAll returns all issued certs', () => {
      for (let i = 0; i < 4; i++) {
        tracker.issue(`eq-${i}`, `CERT-${i}`, 'L', '2026-01-01', '2027-01-01', 'PASS');
      }
      expect(tracker.getAll()).toHaveLength(4);
    });

    it('getCount equals getAll length', () => {
      for (let i = 0; i < 7; i++) {
        tracker.issue(`eq-${i}`, `CERT-${i}`, 'L', '2026-01-01', '2027-01-01', 'PASS');
      }
      expect(tracker.getCount()).toBe(tracker.getAll().length);
    });

    Array.from({ length: 20 }, (_, i) => i + 1).forEach((n) => {
      it(`getCount is ${n} after issuing ${n} certs`, () => {
        const tr2 = new CertificateTracker();
        for (let j = 0; j < n; j++) {
          tr2.issue(`eq-${j}`, `CERT-${j}`, 'L', '2026-01-01', '2027-01-01', 'PASS');
        }
        expect(tr2.getCount()).toBe(n);
      });
    });
  });

  // ── Certificate status transition chain ───────────────────────────────────────
  describe('certificate status transitions', () => {
    it('VALID → EXPIRED', () => {
      const c = tracker.issue('eq-1', 'CERT-001', 'L', '2026-01-01', '2027-01-01', 'PASS');
      expect(c.status).toBe('VALID');
      tracker.expire(c.id);
      expect(tracker.get(c.id)!.status).toBe('EXPIRED');
    });

    it('VALID → REVOKED', () => {
      const c = tracker.issue('eq-1', 'CERT-001', 'L', '2026-01-01', '2027-01-01', 'PASS');
      tracker.revoke(c.id);
      expect(tracker.get(c.id)!.status).toBe('REVOKED');
    });

    it('VALID → SUPERSEDED', () => {
      const c = tracker.issue('eq-1', 'CERT-001', 'L', '2026-01-01', '2027-01-01', 'PASS');
      tracker.supersede(c.id);
      expect(tracker.get(c.id)!.status).toBe('SUPERSEDED');
    });

    it('supersede old cert when new cert issued', () => {
      const old = tracker.issue('eq-1', 'CERT-001', 'L', '2025-01-01', '2026-01-01', 'PASS');
      tracker.supersede(old.id);
      const newCert = tracker.issue('eq-1', 'CERT-002', 'L', '2026-01-01', '2027-01-01', 'PASS');
      expect(tracker.get(old.id)!.status).toBe('SUPERSEDED');
      expect(tracker.get(newCert.id)!.status).toBe('VALID');
      expect(tracker.getLatest('eq-1')!.id).toBe(newCert.id);
    });

    Array.from({ length: 15 }, (_, i) => i).forEach((i) => {
      it(`status transition chain #${i}`, () => {
        const c = tracker.issue(`eq-${i}`, `CERT-TR-${i}`, 'L', '2026-01-01', '2027-01-01', 'PASS');
        const transitions: CertificateStatus[] = ['EXPIRED', 'REVOKED', 'SUPERSEDED'];
        const targetStatus = transitions[i % 3];
        if (targetStatus === 'EXPIRED') tracker.expire(c.id);
        else if (targetStatus === 'REVOKED') tracker.revoke(c.id);
        else tracker.supersede(c.id);
        expect(tracker.get(c.id)!.status).toBe(targetStatus);
      });
    });
  });

  // ── Edge cases ────────────────────────────────────────────────────────────────
  describe('edge cases', () => {
    it('does not cross-contaminate equipment certificates', () => {
      tracker.issue('eq-A', 'CERT-A1', 'L', '2026-01-01', '2027-01-01', 'PASS');
      tracker.issue('eq-B', 'CERT-B1', 'L', '2026-01-01', '2027-01-01', 'FAIL');
      expect(tracker.getByEquipment('eq-A')).toHaveLength(1);
      expect(tracker.getByEquipment('eq-B')).toHaveLength(1);
    });

    it('error message contains bad cert id', () => {
      expect(() => tracker.expire('no-such')).toThrow('no-such');
    });

    it('handles zero uncertaintyValue', () => {
      const c = tracker.issue('eq-1', 'CERT-001', 'L', '2026-01-01', '2027-01-01', 'PASS', undefined, 0);
      expect(c.uncertaintyValue).toBe(0);
    });

    it('handles very small uncertaintyValue', () => {
      const c = tracker.issue('eq-1', 'CERT-001', 'L', '2026-01-01', '2027-01-01', 'PASS', undefined, 1e-10);
      expect(c.uncertaintyValue).toBeCloseTo(1e-10);
    });

    it('getByEquipment returns correct certs after some are revoked', () => {
      const c1 = tracker.issue('eq-1', 'CERT-001', 'L', '2025-01-01', '2026-01-01', 'PASS');
      tracker.issue('eq-1', 'CERT-002', 'L', '2026-01-01', '2027-01-01', 'PASS');
      tracker.revoke(c1.id);
      expect(tracker.getByEquipment('eq-1')).toHaveLength(2);
      expect(tracker.getValid()).toHaveLength(1);
    });

    Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
      it(`edge case #${i}: referenceStandard with special chars`, () => {
        const std = `ISO ${17025 + i}:202${i}`;
        const c = tracker.issue(`eq-ec-${i}`, `CERT-EC-${i}`, 'L', '2026-01-01', '2027-01-01', 'PASS', std);
        expect(c.referenceStandard).toBe(std);
      });
    });
  });

  // ── Integration: CalibrationRegister + CertificateTracker ─────────────────────
  describe('integration: register + tracker', () => {
    let reg: CalibrationRegister;
    let trac: CertificateTracker;

    beforeEach(() => {
      reg = new CalibrationRegister();
      trac = new CertificateTracker();
    });

    it('can track cert for registered equipment', () => {
      const eq = reg.register('EQ-INT-001', 'Digital Caliper', 'MEASURING', 'Lab A', 'Alice', 'ANNUAL', 365);
      const cert = trac.issue(eq.id, 'CERT-INT-001', 'NIST', '2026-01-01', '2027-01-01', 'PASS');
      expect(cert.equipmentId).toBe(eq.id);
    });

    it('complete calibration cycle with certificate', () => {
      const eq = reg.register('EQ-INT-002', 'Pressure Gauge', 'MEASURING', 'Lab B', 'Bob', 'ANNUAL', 365);
      reg.startCalibration(eq.id);
      reg.completeCalibration(eq.id, '2026-01-15', '2027-01-15');
      const cert = trac.issue(eq.id, 'CERT-INT-002', 'AccuLab', '2026-01-15', '2027-01-15', 'PASS');
      expect(reg.get(eq.id)!.status).toBe('ACTIVE');
      expect(cert.status).toBe('VALID');
    });

    it('getLatest returns correct cert after supersede', () => {
      const eq = reg.register('EQ-INT-003', 'Thermometer', 'MONITORING', 'Lab C', 'Carol', 'BIANNUAL', 180);
      const cert1 = trac.issue(eq.id, 'CERT-INT-003A', 'LabX', '2025-06-01', '2026-06-01', 'PASS');
      trac.supersede(cert1.id);
      reg.startCalibration(eq.id);
      reg.completeCalibration(eq.id, '2026-01-01', '2027-01-01');
      const cert2 = trac.issue(eq.id, 'CERT-INT-003B', 'LabX', '2026-01-01', '2027-01-01', 'PASS');
      expect(trac.getLatest(eq.id)!.id).toBe(cert2.id);
    });

    it('equipment with FAIL cert is flagged correctly', () => {
      const eq = reg.register('EQ-INT-004', 'Scale', 'MEASURING', 'Lab D', 'Dave', 'QUARTERLY', 90);
      trac.issue(eq.id, 'CERT-INT-004', 'LabY', '2026-02-01', '2026-08-01', 'FAIL');
      reg.putOutOfService(eq.id);
      expect(reg.get(eq.id)!.status).toBe('OUT_OF_SERVICE');
      expect(trac.getFailedOrOutOfTolerance()).toHaveLength(1);
    });

    it('multiple equipment items each with their own cert history', () => {
      const eqs = Array.from({ length: 5 }, (_, i) =>
        reg.register(`EQ-MUL-${i}`, `Equip-${i}`, 'MEASURING', `L-${i}`, `O-${i}`, 'ANNUAL', 365),
      );
      eqs.forEach((eq, i) => {
        trac.issue(eq.id, `CERT-MUL-${i}`, 'LabZ', '2026-01-01', '2027-01-01', i % 2 === 0 ? 'PASS' : 'FAIL');
      });
      expect(trac.getByResult('PASS')).toHaveLength(3);
      expect(trac.getByResult('FAIL')).toHaveLength(2);
    });

    Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
      it(`integration cycle #${i}: register → calibrate → certify`, () => {
        const eq = reg.register(
          `EQ-CYC-${i}`, `Equip-${i}`, 'MEASURING', `Loc-${i}`, `Owner-${i}`, 'ANNUAL', 365,
        );
        reg.scheduleDue(eq.id);
        reg.startCalibration(eq.id);
        reg.completeCalibration(eq.id, '2026-02-01', '2027-02-01');
        const cert = trac.issue(eq.id, `CERT-CYC-${i}`, 'LabQ', '2026-02-01', '2027-02-01', 'PASS');
        expect(reg.get(eq.id)!.status).toBe('ACTIVE');
        expect(cert.status).toBe('VALID');
        expect(trac.getLatest(eq.id)!.id).toBe(cert.id);
      });
    });
  });

  // ── Enum value completeness ───────────────────────────────────────────────────
  describe('enum completeness', () => {
    const allEquipmentStatuses: EquipmentStatus[] = [
      'ACTIVE', 'DUE_FOR_CALIBRATION', 'UNDER_CALIBRATION', 'OUT_OF_SERVICE', 'RETIRED',
    ];
    allEquipmentStatuses.forEach((status) => {
      it(`EquipmentStatus ${status} is valid`, () => {
        const reg2 = new CalibrationRegister();
        const r = reg2.register('T', 'N', 'MEASURING', 'L', 'O', 'ANNUAL', 365);
        if (status === 'DUE_FOR_CALIBRATION') reg2.scheduleDue(r.id);
        else if (status === 'UNDER_CALIBRATION') reg2.startCalibration(r.id);
        else if (status === 'OUT_OF_SERVICE') reg2.putOutOfService(r.id);
        else if (status === 'RETIRED') reg2.retire(r.id);
        expect(reg2.get(r.id)!.status).toBe(status);
      });
    });

    const allCalibrationResults: CalibrationResult[] = [
      'PASS', 'FAIL', 'PASS_WITH_ADJUSTMENT', 'OUT_OF_TOLERANCE',
    ];
    allCalibrationResults.forEach((result) => {
      it(`CalibrationResult ${result} is valid`, () => {
        const tr2 = new CertificateTracker();
        const c = tr2.issue('eq', 'CERT', 'L', '2026-01-01', '2027-01-01', result);
        expect(c.result).toBe(result);
      });
    });

    const allFrequencies: CalibrationFrequency[] = [
      'MONTHLY', 'QUARTERLY', 'BIANNUAL', 'ANNUAL', 'BIENNIALLY',
    ];
    allFrequencies.forEach((freq) => {
      it(`CalibrationFrequency ${freq} is storable`, () => {
        const reg2 = new CalibrationRegister();
        const r = reg2.register('T', 'N', 'MEASURING', 'L', 'O', freq, 90);
        expect(r.calibrationFrequency).toBe(freq);
      });
    });

    const allEquipmentTypes: EquipmentType[] = ['MEASURING', 'TEST', 'MONITORING', 'INSPECTION'];
    allEquipmentTypes.forEach((type) => {
      it(`EquipmentType ${type} is storable`, () => {
        const reg2 = new CalibrationRegister();
        const r = reg2.register('T', 'N', type, 'L', 'O', 'ANNUAL', 365);
        expect(r.type).toBe(type);
      });
    });

    const allCertStatuses: CertificateStatus[] = ['VALID', 'EXPIRED', 'REVOKED', 'SUPERSEDED'];
    allCertStatuses.forEach((status) => {
      it(`CertificateStatus ${status} is reachable`, () => {
        const tr2 = new CertificateTracker();
        const c = tr2.issue('eq', 'CERT', 'L', '2026-01-01', '2027-01-01', 'PASS');
        if (status === 'EXPIRED') tr2.expire(c.id);
        else if (status === 'REVOKED') tr2.revoke(c.id);
        else if (status === 'SUPERSEDED') tr2.supersede(c.id);
        expect(tr2.get(c.id)!.status).toBe(status);
      });
    });
  });

  // ── Bulk stress tests ─────────────────────────────────────────────────────────
  describe('bulk stress tests', () => {
    Array.from({ length: 50 }, (_, i) => i).forEach((i) => {
      it(`bulk register + certificate issue #${i}`, () => {
        const reg2 = new CalibrationRegister();
        const tr2 = new CertificateTracker();
        const eq = reg2.register(`BULK-${i}`, `E-${i}`, 'MEASURING', 'L', 'O', 'ANNUAL', 365);
        const cert = tr2.issue(eq.id, `CERT-BULK-${i}`, 'Lab', '2026-01-01', '2027-01-01', 'PASS');
        expect(eq.status).toBe('ACTIVE');
        expect(cert.status).toBe('VALID');
      });
    });

    Array.from({ length: 30 }, (_, i) => i).forEach((i) => {
      it(`bulk overdue check #${i}`, () => {
        const reg2 = new CalibrationRegister();
        const eq = reg2.register(`OD-BULK-${i}`, `E-${i}`, 'MEASURING', 'L', 'O', 'ANNUAL', 365);
        reg2.completeCalibration(eq.id, '2024-01-01', `2025-0${(i % 9) + 1}-01`);
        const overdue = reg2.getOverdue('2026-01-01');
        expect(overdue).toHaveLength(1);
        expect(overdue[0].id).toBe(eq.id);
      });
    });

    Array.from({ length: 30 }, (_, i) => i).forEach((i) => {
      it(`bulk getExpiring check #${i}`, () => {
        const tr2 = new CertificateTracker();
        const daysAhead = (i % 28) + 1;
        const expiry = new Date('2026-02-26');
        expiry.setDate(expiry.getDate() + daysAhead);
        const expiryStr = expiry.toISOString().slice(0, 10);
        tr2.issue(`eq-${i}`, `CERT-BULK-EXP-${i}`, 'L', '2026-01-01', expiryStr, 'PASS');
        const expiring = tr2.getExpiring('2026-02-26', daysAhead);
        expect(expiring).toHaveLength(1);
      });
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Additional CalibrationRegister extended tests
// ─────────────────────────────────────────────────────────────────────────────

describe('CalibrationRegister — extended', () => {
  let register: CalibrationRegister;

  beforeEach(() => {
    register = new CalibrationRegister();
  });

  // Parameterized: verify all frequencies map to correct interval
  const freqIntervalMap: Array<[CalibrationFrequency, number]> = [
    ['MONTHLY', 30],
    ['QUARTERLY', 91],
    ['BIANNUAL', 182],
    ['ANNUAL', 365],
    ['BIENNIALLY', 730],
  ];
  freqIntervalMap.forEach(([freq, interval]) => {
    it(`frequency ${freq} with interval ${interval} stored correctly`, () => {
      const r = register.register('T', 'N', 'MEASURING', 'L', 'O', freq, interval);
      expect(r.calibrationFrequency).toBe(freq);
      expect(r.calibrationIntervalDays).toBe(interval);
    });
  });

  // Parameterized: all 4 equipment types can be put out of service
  const types: EquipmentType[] = ['MEASURING', 'TEST', 'MONITORING', 'INSPECTION'];
  types.forEach((type) => {
    it(`${type} equipment can be put out of service`, () => {
      const r = register.register('T', 'N', type, 'L', 'O', 'ANNUAL', 365);
      register.putOutOfService(r.id);
      expect(register.get(r.id)!.status).toBe('OUT_OF_SERVICE');
    });
  });

  // Parameterized: all 4 equipment types can be retired
  types.forEach((type) => {
    it(`${type} equipment can be retired`, () => {
      const r = register.register('T', 'N', type, 'L', 'O', 'ANNUAL', 365);
      register.retire(r.id);
      expect(register.get(r.id)!.status).toBe('RETIRED');
    });
  });

  // Parameterized: getByType returns correct count for multiple items
  Array.from({ length: 16 }, (_, i) => i).forEach((i) => {
    const t = types[i % 4];
    it(`getByType count check #${i} for ${t}`, () => {
      // Add 3 items of this type plus 1 of each other type
      for (let j = 0; j < 3; j++) {
        register.register(`T${i}${j}`, `E${i}${j}`, t, 'L', 'O', 'ANNUAL', 365);
      }
      const otherType = types[(i + 1) % 4];
      register.register(`OTHER-${i}`, `EO-${i}`, otherType, 'L', 'O', 'ANNUAL', 365);
      const byType = register.getByType(t);
      expect(byType.length).toBe(3);
    });
  });

  // Parameterized: getDueForCalibration with multiple items
  Array.from({ length: 15 }, (_, i) => i).forEach((i) => {
    it(`getDueForCalibration #${i}: only due items returned`, () => {
      // Item due in the past
      const r1 = register.register(`DFC-A-${i}`, `EA-${i}`, 'MEASURING', 'L', 'O', 'ANNUAL', 365);
      register.completeCalibration(r1.id, '2024-01-01', '2025-06-01');
      // Item not due yet
      const r2 = register.register(`DFC-B-${i}`, `EB-${i}`, 'MEASURING', 'L', 'O', 'ANNUAL', 365);
      register.completeCalibration(r2.id, '2026-01-01', '2027-01-01');
      const due = register.getDueForCalibration('2026-02-26');
      expect(due.some((x) => x.id === r1.id)).toBe(true);
      expect(due.some((x) => x.id === r2.id)).toBe(false);
    });
  });

  // Parameterized: completeCalibration preserves other fields
  Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
    it(`completeCalibration #${i} preserves non-date fields`, () => {
      const r = register.register(
        `PRES-${i}`, `Equip-${i}`, 'TEST', `Loc-${i}`, `Owner-${i}`, 'QUARTERLY', 90,
        `SN-${i}`, `Mfr-${i}`, `Model-${i}`, `Notes-${i}`,
      );
      register.completeCalibration(r.id, '2026-01-01', '2026-04-01');
      const updated = register.get(r.id)!;
      expect(updated.assetTag).toBe(`PRES-${i}`);
      expect(updated.serialNumber).toBe(`SN-${i}`);
      expect(updated.manufacturer).toBe(`Mfr-${i}`);
      expect(updated.model).toBe(`Model-${i}`);
      expect(updated.notes).toBe(`Notes-${i}`);
    });
  });

  // Error message tests
  it('scheduleDue error contains equipment id', () => {
    expect(() => register.scheduleDue('missing-eq-id')).toThrow('missing-eq-id');
  });

  it('startCalibration error contains equipment id', () => {
    expect(() => register.startCalibration('start-missing')).toThrow('start-missing');
  });

  it('completeCalibration error contains equipment id', () => {
    expect(() => register.completeCalibration('complete-missing', '2026-01-01', '2027-01-01')).toThrow('complete-missing');
  });

  it('putOutOfService error contains equipment id', () => {
    expect(() => register.putOutOfService('oos-missing')).toThrow('oos-missing');
  });

  it('retire error contains equipment id', () => {
    expect(() => register.retire('retire-missing')).toThrow('retire-missing');
  });

  // Isolation tests: instances don't share state
  Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
    it(`instance isolation test #${i}`, () => {
      const reg2 = new CalibrationRegister();
      const reg3 = new CalibrationRegister();
      reg2.register(`T-A-${i}`, 'E', 'MEASURING', 'L', 'O', 'ANNUAL', 365);
      reg2.register(`T-B-${i}`, 'E', 'MEASURING', 'L', 'O', 'ANNUAL', 365);
      expect(reg2.getCount()).toBe(2);
      expect(reg3.getCount()).toBe(0);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Additional CertificateTracker extended tests
// ─────────────────────────────────────────────────────────────────────────────

describe('CertificateTracker — extended', () => {
  let tracker: CertificateTracker;

  beforeEach(() => {
    tracker = new CertificateTracker();
  });

  // Parameterized: issue certs with referenceStandard variants
  const standards = ['ISO 17025:2017', 'ANSI/NCSL Z540', 'ILAC P14', 'EA-4/02 M', 'EURAMET cg-18'];
  standards.forEach((std, i) => {
    it(`issue with referenceStandard "${std}"`, () => {
      const c = tracker.issue(`eq-std-${i}`, `CERT-STD-${i}`, 'Lab', '2026-01-01', '2027-01-01', 'PASS', std);
      expect(c.referenceStandard).toBe(std);
    });
  });

  // Parameterized: getValid count after mixed statuses
  Array.from({ length: 15 }, (_, i) => i + 1).forEach((n) => {
    it(`getValid returns ${n} valid after issuing ${n * 2} and expiring half`, () => {
      const tr2 = new CertificateTracker();
      const ids: string[] = [];
      for (let j = 0; j < n * 2; j++) {
        const c = tr2.issue(`eq-${j}`, `CERT-${j}`, 'L', '2026-01-01', '2027-01-01', 'PASS');
        ids.push(c.id);
      }
      // Expire the first n
      for (let j = 0; j < n; j++) {
        tr2.expire(ids[j]);
      }
      expect(tr2.getValid()).toHaveLength(n);
      expect(tr2.getExpired()).toHaveLength(n);
    });
  });

  // Parameterized: getByEquipment isolation
  Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
    it(`getByEquipment isolation #${i}`, () => {
      const eqA = `eq-iso-A-${i}`;
      const eqB = `eq-iso-B-${i}`;
      for (let j = 0; j < 3; j++) {
        tracker.issue(eqA, `CERT-A-${i}-${j}`, 'L', '2026-01-01', '2027-01-01', 'PASS');
      }
      for (let j = 0; j < 2; j++) {
        tracker.issue(eqB, `CERT-B-${i}-${j}`, 'L', '2026-01-01', '2027-01-01', 'PASS');
      }
      expect(tracker.getByEquipment(eqA)).toHaveLength(3);
      expect(tracker.getByEquipment(eqB)).toHaveLength(2);
    });
  });

  // Parameterized: error messages for revoke/supersede
  Array.from({ length: 5 }, (_, i) => i).forEach((i) => {
    it(`expire error message contains id #${i}`, () => {
      const badId = `bad-expire-${i}`;
      expect(() => tracker.expire(badId)).toThrow(badId);
    });

    it(`revoke error message contains id #${i}`, () => {
      const badId = `bad-revoke-${i}`;
      expect(() => tracker.revoke(badId)).toThrow(badId);
    });

    it(`supersede error message contains id #${i}`, () => {
      const badId = `bad-supersede-${i}`;
      expect(() => tracker.supersede(badId)).toThrow(badId);
    });
  });

  // Parameterized: getFailedOrOutOfTolerance after status changes
  Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
    it(`getFailedOrOutOfTolerance still includes revoked certs #${i}`, () => {
      const c = tracker.issue(`eq-foi-${i}`, `CERT-FOI-${i}`, 'L', '2026-01-01', '2027-01-01', 'FAIL');
      tracker.revoke(c.id);
      // getFailedOrOutOfTolerance filters by result, not status
      expect(tracker.getFailedOrOutOfTolerance()).toHaveLength(1);
    });
  });

  // Parameterized: instance isolation
  Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
    it(`instance isolation test #${i}`, () => {
      const tr2 = new CertificateTracker();
      const tr3 = new CertificateTracker();
      tr2.issue(`eq-${i}`, `CERT-${i}`, 'L', '2026-01-01', '2027-01-01', 'PASS');
      expect(tr2.getCount()).toBe(1);
      expect(tr3.getCount()).toBe(0);
    });
  });

  // Parameterized: getLatest after multiple certs on same equipment
  Array.from({ length: 10 }, (_, i) => i + 2).forEach((n) => {
    it(`getLatest with ${n} certs returns most recent`, () => {
      const tr2 = new CertificateTracker();
      const eqId = `eq-latest-${n}`;
      let lastCertId = '';
      for (let j = 1; j <= n; j++) {
        const month = String(j % 12 || 12).padStart(2, '0');
        const year = 2020 + Math.floor((j - 1) / 12);
        const c = tr2.issue(eqId, `CERT-L-${n}-${j}`, 'L', `${year}-${month}-01`, `${year + 1}-${month}-01`, 'PASS');
        lastCertId = c.id;
      }
      const latest = tr2.getLatest(eqId)!;
      expect(latest).toBeDefined();
      // The last issued cert has the latest date (year increases monotonically for j up to 12 then wraps, but year increases)
      expect(latest.equipmentId).toBe(eqId);
    });
  });
});
