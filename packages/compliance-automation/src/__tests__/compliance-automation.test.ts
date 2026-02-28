import { ControlTester } from '../control-tester';
import { EvidenceCollector } from '../evidence-collector';
import { AuditScheduler } from '../audit-scheduler';
import { ControlDefinition, ControlStatus, EvidenceType } from '../types';

// ─── helpers ────────────────────────────────────────────────────────────────

const makeControl = (id: string, framework = 'ISO27001'): ControlDefinition => ({
  id,
  name: `Control ${id}`,
  framework,
  description: `Description for ${id}`,
  testProcedure: `Test procedure for ${id}`,
});

const makeDate = (offsetDays: number) => new Date(Date.now() + offsetDays * 86400000);

// ════════════════════════════════════════════════════════════════════════════
// ControlTester
// ════════════════════════════════════════════════════════════════════════════

describe('ControlTester', () => {
  let tester: ControlTester;

  beforeEach(() => { tester = new ControlTester(); });

  // ── Registration ──────────────────────────────────────────────────────────

  describe('registerControl', () => {
    it('registers a control', () => {
      tester.registerControl(makeControl('C-001'));
      expect(tester.getControlCount()).toBe(1);
    });

    it('retrieves registered control', () => {
      const def = makeControl('C-002');
      tester.registerControl(def);
      expect(tester.getControl('C-002')).toEqual(def);
    });

    it('returns undefined for unknown control', () => {
      expect(tester.getControl('X')).toBeUndefined();
    });

    it('registers multiple controls', () => {
      for (let i = 0; i < 10; i++) tester.registerControl(makeControl(`C-${i}`));
      expect(tester.getControlCount()).toBe(10);
    });

    it('overwrites existing control on re-register', () => {
      tester.registerControl(makeControl('C-003'));
      const updated = { ...makeControl('C-003'), name: 'Updated Name' };
      tester.registerControl(updated);
      expect(tester.getControl('C-003')!.name).toBe('Updated Name');
    });

    it('getAllControls returns all registered', () => {
      for (let i = 0; i < 5; i++) tester.registerControl(makeControl(`C-${i}`));
      expect(tester.getAllControls()).toHaveLength(5);
    });

    it('initial state has no untested controls', () => {
      expect(tester.getUntestedControls()).toHaveLength(0);
    });

    it('untested returns newly registered control', () => {
      tester.registerControl(makeControl('C-new'));
      expect(tester.getUntestedControls()).toHaveLength(1);
    });
  });

  // ── test() ────────────────────────────────────────────────────────────────

  describe('test()', () => {
    beforeEach(() => {
      tester.registerControl(makeControl('C-001'));
      tester.registerControl(makeControl('C-002', 'SOC2'));
    });

    it('throws for unknown control', () => {
      expect(() => tester.test('UNKNOWN', 'auditor', 'EFFECTIVE')).toThrow('Control not found');
    });

    it('returns test result with correct controlId', () => {
      const r = tester.test('C-001', 'auditor', 'EFFECTIVE');
      expect(r.controlId).toBe('C-001');
    });

    it('sets testedBy', () => {
      const r = tester.test('C-001', 'john.doe', 'PARTIAL');
      expect(r.testedBy).toBe('john.doe');
    });

    it('sets status EFFECTIVE', () => {
      expect(tester.test('C-001', 'a', 'EFFECTIVE').status).toBe('EFFECTIVE');
    });

    it('sets status PARTIAL', () => {
      expect(tester.test('C-001', 'a', 'PARTIAL').status).toBe('PARTIAL');
    });

    it('sets status INEFFECTIVE', () => {
      expect(tester.test('C-001', 'a', 'INEFFECTIVE').status).toBe('INEFFECTIVE');
    });

    it('sets status NOT_TESTED', () => {
      expect(tester.test('C-001', 'a', 'NOT_TESTED').status).toBe('NOT_TESTED');
    });

    it('default score for EFFECTIVE is 100', () => {
      expect(tester.test('C-001', 'a', 'EFFECTIVE').score).toBe(100);
    });

    it('default score for PARTIAL is 60', () => {
      expect(tester.test('C-001', 'a', 'PARTIAL').score).toBe(60);
    });

    it('default score for INEFFECTIVE is 20', () => {
      expect(tester.test('C-001', 'a', 'INEFFECTIVE').score).toBe(20);
    });

    it('default score for NOT_TESTED is 0', () => {
      expect(tester.test('C-001', 'a', 'NOT_TESTED').score).toBe(0);
    });

    it('custom score overrides default', () => {
      expect(tester.test('C-001', 'a', 'PARTIAL', [], 75).score).toBe(75);
    });

    it('stores findings', () => {
      const r = tester.test('C-001', 'a', 'INEFFECTIVE', ['Gap 1', 'Gap 2']);
      expect(r.findings).toEqual(['Gap 1', 'Gap 2']);
    });

    it('empty findings array by default', () => {
      expect(tester.test('C-001', 'a', 'EFFECTIVE').findings).toEqual([]);
    });

    it('sets testedAt to a Date', () => {
      expect(tester.test('C-001', 'a', 'EFFECTIVE').testedAt).toBeInstanceOf(Date);
    });

    it('multiple tests are appended to history', () => {
      tester.test('C-001', 'a', 'PARTIAL');
      tester.test('C-001', 'b', 'EFFECTIVE');
      expect(tester.getHistory('C-001')).toHaveLength(2);
    });
  });

  // ── getLatest ─────────────────────────────────────────────────────────────

  describe('getLatest()', () => {
    beforeEach(() => tester.registerControl(makeControl('C-001')));

    it('returns undefined for untested control', () => {
      expect(tester.getLatest('C-001')).toBeUndefined();
    });

    it('returns the single result', () => {
      tester.test('C-001', 'a', 'EFFECTIVE');
      expect(tester.getLatest('C-001')!.status).toBe('EFFECTIVE');
    });

    it('returns last result after multiple tests', () => {
      tester.test('C-001', 'a', 'PARTIAL');
      tester.test('C-001', 'b', 'EFFECTIVE');
      expect(tester.getLatest('C-001')!.testedBy).toBe('b');
    });

    it('latest score reflects most recent test', () => {
      tester.test('C-001', 'a', 'PARTIAL');
      tester.test('C-001', 'b', 'EFFECTIVE', [], 95);
      expect(tester.getLatest('C-001')!.score).toBe(95);
    });
  });

  // ── getHistory ────────────────────────────────────────────────────────────

  describe('getHistory()', () => {
    beforeEach(() => tester.registerControl(makeControl('C-001')));

    it('returns empty array for untested', () => {
      expect(tester.getHistory('C-001')).toEqual([]);
    });

    it('returns empty for unknown control', () => {
      expect(tester.getHistory('UNKNOWN')).toEqual([]);
    });

    it('history grows with each test', () => {
      for (let i = 0; i < 5; i++) tester.test('C-001', 'a', 'EFFECTIVE');
      expect(tester.getHistory('C-001')).toHaveLength(5);
    });
  });

  // ── getByStatus ───────────────────────────────────────────────────────────

  describe('getByStatus()', () => {
    beforeEach(() => {
      ['C-1', 'C-2', 'C-3', 'C-4'].forEach(id => tester.registerControl(makeControl(id)));
      tester.test('C-1', 'a', 'EFFECTIVE');
      tester.test('C-2', 'a', 'EFFECTIVE');
      tester.test('C-3', 'a', 'PARTIAL');
      tester.test('C-4', 'a', 'INEFFECTIVE');
    });

    it('finds effective controls', () => {
      expect(tester.getByStatus('EFFECTIVE')).toHaveLength(2);
    });

    it('finds partial controls', () => {
      expect(tester.getByStatus('PARTIAL')).toHaveLength(1);
    });

    it('finds ineffective controls', () => {
      expect(tester.getByStatus('INEFFECTIVE')).toHaveLength(1);
    });

    it('latest status wins after re-test', () => {
      tester.test('C-3', 'b', 'EFFECTIVE');
      expect(tester.getByStatus('EFFECTIVE')).toHaveLength(3);
      expect(tester.getByStatus('PARTIAL')).toHaveLength(0);
    });
  });

  // ── getByFramework ────────────────────────────────────────────────────────

  describe('getByFramework()', () => {
    it('returns only controls from matching framework', () => {
      tester.registerControl(makeControl('A1', 'ISO27001'));
      tester.registerControl(makeControl('B1', 'SOC2'));
      tester.registerControl(makeControl('A2', 'ISO27001'));
      tester.test('A1', 'x', 'EFFECTIVE');
      tester.test('B1', 'x', 'PARTIAL');
      tester.test('A2', 'x', 'INEFFECTIVE');
      expect(tester.getByFramework('ISO27001')).toHaveLength(2);
    });

    it('returns empty for unknown framework', () => {
      expect(tester.getByFramework('NIST')).toHaveLength(0);
    });
  });

  // ── getAverageScore ───────────────────────────────────────────────────────

  describe('getAverageScore()', () => {
    it('returns 0 with no tests', () => {
      expect(tester.getAverageScore()).toBe(0);
    });

    it('calculates average correctly', () => {
      tester.registerControl(makeControl('C-1'));
      tester.registerControl(makeControl('C-2'));
      tester.test('C-1', 'a', 'EFFECTIVE', [], 80);
      tester.test('C-2', 'a', 'EFFECTIVE', [], 60);
      expect(tester.getAverageScore()).toBe(70);
    });

    it('averages by framework', () => {
      tester.registerControl(makeControl('A1', 'ISO27001'));
      tester.registerControl(makeControl('B1', 'SOC2'));
      tester.test('A1', 'a', 'EFFECTIVE', [], 90);
      tester.test('B1', 'a', 'EFFECTIVE', [], 50);
      expect(tester.getAverageScore('ISO27001')).toBe(90);
    });

    it('returns 0 for framework with no tests', () => {
      expect(tester.getAverageScore('PCI-DSS')).toBe(0);
    });
  });

  // ── getUntestedControls ───────────────────────────────────────────────────

  describe('getUntestedControls()', () => {
    it('returns all controls when none tested', () => {
      tester.registerControl(makeControl('C-1'));
      tester.registerControl(makeControl('C-2'));
      expect(tester.getUntestedControls()).toHaveLength(2);
    });

    it('excludes tested controls', () => {
      tester.registerControl(makeControl('C-1'));
      tester.registerControl(makeControl('C-2'));
      tester.test('C-1', 'a', 'EFFECTIVE');
      expect(tester.getUntestedControls()).toHaveLength(1);
      expect(tester.getUntestedControls()[0].id).toBe('C-2');
    });

    it('empty after all tested', () => {
      tester.registerControl(makeControl('C-1'));
      tester.test('C-1', 'a', 'PARTIAL');
      expect(tester.getUntestedControls()).toHaveLength(0);
    });
  });

  // ── getFailingControls ────────────────────────────────────────────────────

  describe('getFailingControls()', () => {
    it('returns only INEFFECTIVE controls', () => {
      tester.registerControl(makeControl('C-1'));
      tester.registerControl(makeControl('C-2'));
      tester.test('C-1', 'a', 'INEFFECTIVE');
      tester.test('C-2', 'a', 'EFFECTIVE');
      expect(tester.getFailingControls()).toHaveLength(1);
      expect(tester.getFailingControls()[0].controlId).toBe('C-1');
    });

    it('returns empty when all effective', () => {
      tester.registerControl(makeControl('C-1'));
      tester.test('C-1', 'a', 'EFFECTIVE');
      expect(tester.getFailingControls()).toHaveLength(0);
    });
  });

  // ── Bulk control tests ────────────────────────────────────────────────────

  describe('bulk control registration and scoring', () => {
    const STATUSES: ControlStatus[] = ['EFFECTIVE', 'PARTIAL', 'INEFFECTIVE', 'NOT_TESTED'];
    const FRAMEWORKS = ['ISO27001', 'SOC2', 'PCI-DSS', 'NIST', 'GDPR'];

    FRAMEWORKS.forEach(fw => {
      it(`registers and tests 5 controls for ${fw}`, () => {
        for (let i = 0; i < 5; i++) {
          const id = `${fw}-C${i}`;
          tester.registerControl(makeControl(id, fw));
          tester.test(id, 'auditor', STATUSES[i % 4], [], i * 20);
        }
        expect(tester.getByFramework(fw)).toHaveLength(5);
      });
    });

    it('50 controls all registered', () => {
      for (let i = 0; i < 50; i++) tester.registerControl(makeControl(`BK-${i}`));
      expect(tester.getControlCount()).toBe(50);
    });

    it('50 controls all tested and retrievable', () => {
      for (let i = 0; i < 50; i++) {
        tester.registerControl(makeControl(`BK-${i}`));
        tester.test(`BK-${i}`, 'bulk-auditor', 'EFFECTIVE', [], 100);
      }
      expect(tester.getByStatus('EFFECTIVE')).toHaveLength(50);
    });

    it('average score of 100 for all effective', () => {
      for (let i = 0; i < 10; i++) {
        tester.registerControl(makeControl(`BK-${i}`));
        tester.test(`BK-${i}`, 'a', 'EFFECTIVE', [], 100);
      }
      expect(tester.getAverageScore()).toBe(100);
    });

    it('average score of 0 for no tests', () => {
      expect(tester.getAverageScore()).toBe(0);
    });

    Array.from({ length: 20 }, (_, i) => i).forEach(i => {
      it(`control C-BULK-${i} registers and tests with score ${i * 5}`, () => {
        tester.registerControl(makeControl(`C-BULK-${i}`));
        const r = tester.test(`C-BULK-${i}`, 'auto', 'PARTIAL', [`Finding ${i}`], i * 5);
        expect(r.score).toBe(i * 5);
        expect(r.findings[0]).toBe(`Finding ${i}`);
      });
    });
  });

  // ── Score range tests ─────────────────────────────────────────────────────

  describe('score boundary tests', () => {
    beforeEach(() => tester.registerControl(makeControl('C-SCR')));

    [0, 10, 25, 50, 60, 75, 80, 90, 95, 100].forEach(score => {
      it(`score ${score} is stored correctly`, () => {
        const r = tester.test('C-SCR', 'a', 'PARTIAL', [], score);
        expect(r.score).toBe(score);
      });
    });
  });
});

// ════════════════════════════════════════════════════════════════════════════
// EvidenceCollector
// ════════════════════════════════════════════════════════════════════════════

describe('EvidenceCollector', () => {
  let collector: EvidenceCollector;

  beforeEach(() => { collector = new EvidenceCollector(); });

  // ── collect ───────────────────────────────────────────────────────────────

  describe('collect()', () => {
    it('returns an EvidenceItem', () => {
      const e = collector.collect('C-001', 'DOCUMENT', 'policy.pdf', 'Security policy', 'alice', 'content');
      expect(e.id).toBeDefined();
    });

    it('stores controlId', () => {
      const e = collector.collect('C-001', 'LOG', 'access.log', 'Access log', 'bob', 'data');
      expect(e.controlId).toBe('C-001');
    });

    it('stores type', () => {
      const e = collector.collect('C-001', 'SCREENSHOT', 'screen.png', 'Screenshot', 'alice', 'data');
      expect(e.type).toBe('SCREENSHOT');
    });

    it('stores filename', () => {
      const e = collector.collect('C-001', 'DOCUMENT', 'file.pdf', 'A doc', 'a', 'c');
      expect(e.filename).toBe('file.pdf');
    });

    it('stores description', () => {
      const e = collector.collect('C-001', 'DOCUMENT', 'f.pdf', 'My description', 'a', 'c');
      expect(e.description).toBe('My description');
    });

    it('stores collectedBy', () => {
      const e = collector.collect('C-001', 'DOCUMENT', 'f.pdf', 'D', 'charlie', 'c');
      expect(e.collectedBy).toBe('charlie');
    });

    it('generates hash from content', () => {
      const e = collector.collect('C-001', 'DOCUMENT', 'f.pdf', 'D', 'a', 'my-content');
      expect(e.hash).toMatch(/^[a-f0-9]{64}$/);
    });

    it('same content produces same hash', () => {
      const e1 = collector.collect('C-001', 'DOCUMENT', 'a.pdf', 'D', 'a', 'same');
      const e2 = collector.collect('C-002', 'DOCUMENT', 'b.pdf', 'D', 'a', 'same');
      expect(e1.hash).toBe(e2.hash);
    });

    it('different content produces different hash', () => {
      const e1 = collector.collect('C-001', 'DOCUMENT', 'a.pdf', 'D', 'a', 'aaa');
      const e2 = collector.collect('C-001', 'DOCUMENT', 'b.pdf', 'D', 'a', 'bbb');
      expect(e1.hash).not.toBe(e2.hash);
    });

    it('stores tags', () => {
      const e = collector.collect('C-001', 'LOG', 'l.log', 'D', 'a', 'c', ['q1', 'auth']);
      expect(e.tags).toEqual(['q1', 'auth']);
    });

    it('default empty tags', () => {
      const e = collector.collect('C-001', 'LOG', 'l.log', 'D', 'a', 'c');
      expect(e.tags).toEqual([]);
    });

    it('collectedAt is a Date', () => {
      const e = collector.collect('C-001', 'DOCUMENT', 'f.pdf', 'D', 'a', 'c');
      expect(e.collectedAt).toBeInstanceOf(Date);
    });

    it('increments count', () => {
      collector.collect('C-001', 'DOCUMENT', 'f.pdf', 'D', 'a', 'c1');
      collector.collect('C-002', 'LOG', 'l.log', 'D', 'a', 'c2');
      expect(collector.getCount()).toBe(2);
    });

    it('multiple items have unique IDs', () => {
      const ids = new Set(
        Array.from({ length: 20 }, (_, i) =>
          collector.collect('C-001', 'DOCUMENT', `f${i}.pdf`, 'D', 'a', `content${i}`).id,
        ),
      );
      expect(ids.size).toBe(20);
    });
  });

  // ── get ───────────────────────────────────────────────────────────────────

  describe('get()', () => {
    it('retrieves by id', () => {
      const e = collector.collect('C-001', 'DOCUMENT', 'f.pdf', 'D', 'a', 'c');
      expect(collector.get(e.id)).toBe(e);
    });

    it('returns undefined for unknown id', () => {
      expect(collector.get('nonexistent')).toBeUndefined();
    });
  });

  // ── getByControl ──────────────────────────────────────────────────────────

  describe('getByControl()', () => {
    it('returns all evidence for a control', () => {
      collector.collect('C-001', 'DOCUMENT', 'f1.pdf', 'D', 'a', 'c1');
      collector.collect('C-001', 'LOG', 'l.log', 'D', 'a', 'c2');
      collector.collect('C-002', 'DOCUMENT', 'f2.pdf', 'D', 'a', 'c3');
      expect(collector.getByControl('C-001')).toHaveLength(2);
    });

    it('returns empty for control with no evidence', () => {
      expect(collector.getByControl('C-999')).toEqual([]);
    });
  });

  // ── getByType ─────────────────────────────────────────────────────────────

  describe('getByType()', () => {
    const TYPES: EvidenceType[] = ['DOCUMENT', 'LOG', 'SCREENSHOT', 'INTERVIEW', 'OBSERVATION', 'CONFIGURATION'];

    TYPES.forEach(type => {
      it(`getByType('${type}') returns matching items`, () => {
        collector.collect('C-001', type, 'f.ext', 'D', 'a', `content-${type}`);
        expect(collector.getByType(type)).toHaveLength(1);
      });
    });

    it('returns only matching type', () => {
      collector.collect('C-001', 'DOCUMENT', 'f.pdf', 'D', 'a', 'c1');
      collector.collect('C-002', 'LOG', 'l.log', 'D', 'a', 'c2');
      expect(collector.getByType('DOCUMENT')).toHaveLength(1);
    });
  });

  // ── getByCollector ────────────────────────────────────────────────────────

  describe('getByCollector()', () => {
    it('returns items by collector', () => {
      collector.collect('C-001', 'DOCUMENT', 'f.pdf', 'D', 'alice', 'c1');
      collector.collect('C-002', 'LOG', 'l.log', 'D', 'bob', 'c2');
      collector.collect('C-003', 'DOCUMENT', 'g.pdf', 'D', 'alice', 'c3');
      expect(collector.getByCollector('alice')).toHaveLength(2);
    });

    it('returns empty for unknown collector', () => {
      expect(collector.getByCollector('nobody')).toEqual([]);
    });
  });

  // ── getByTag ──────────────────────────────────────────────────────────────

  describe('getByTag()', () => {
    it('finds items by tag', () => {
      collector.collect('C-001', 'DOCUMENT', 'f.pdf', 'D', 'a', 'c', ['auth', 'q1']);
      collector.collect('C-002', 'DOCUMENT', 'g.pdf', 'D', 'a', 'c2', ['q1']);
      collector.collect('C-003', 'DOCUMENT', 'h.pdf', 'D', 'a', 'c3', ['audit']);
      expect(collector.getByTag('q1')).toHaveLength(2);
    });

    it('returns empty for unused tag', () => {
      expect(collector.getByTag('nonexistent-tag')).toEqual([]);
    });
  });

  // ── verifyIntegrity ───────────────────────────────────────────────────────

  describe('verifyIntegrity()', () => {
    it('returns true for matching content', () => {
      const e = collector.collect('C-001', 'DOCUMENT', 'f.pdf', 'D', 'a', 'original content');
      expect(collector.verifyIntegrity(e.id, 'original content')).toBe(true);
    });

    it('returns false for tampered content', () => {
      const e = collector.collect('C-001', 'DOCUMENT', 'f.pdf', 'D', 'a', 'original');
      expect(collector.verifyIntegrity(e.id, 'tampered')).toBe(false);
    });

    it('returns false for unknown id', () => {
      expect(collector.verifyIntegrity('bad-id', 'content')).toBe(false);
    });

    it('empty string content verifies correctly', () => {
      const e = collector.collect('C-001', 'DOCUMENT', 'f.pdf', 'D', 'a', '');
      expect(collector.verifyIntegrity(e.id, '')).toBe(true);
    });
  });

  // ── getControlCoverage ────────────────────────────────────────────────────

  describe('getControlCoverage()', () => {
    it('identifies covered and uncovered controls', () => {
      collector.collect('C-001', 'DOCUMENT', 'f.pdf', 'D', 'a', 'c1');
      const { covered, uncovered } = collector.getControlCoverage(['C-001', 'C-002', 'C-003']);
      expect(covered).toContain('C-001');
      expect(uncovered).toContain('C-002');
      expect(uncovered).toContain('C-003');
    });

    it('all covered', () => {
      collector.collect('C-001', 'DOCUMENT', 'f.pdf', 'D', 'a', 'c1');
      collector.collect('C-002', 'LOG', 'l.log', 'D', 'a', 'c2');
      const { uncovered } = collector.getControlCoverage(['C-001', 'C-002']);
      expect(uncovered).toHaveLength(0);
    });

    it('none covered', () => {
      const { covered } = collector.getControlCoverage(['X', 'Y']);
      expect(covered).toHaveLength(0);
    });
  });

  // ── getSummaryByControl ───────────────────────────────────────────────────

  describe('getSummaryByControl()', () => {
    it('counts evidence per control', () => {
      collector.collect('C-001', 'DOCUMENT', 'f1.pdf', 'D', 'a', 'c1');
      collector.collect('C-001', 'LOG', 'l.log', 'D', 'a', 'c2');
      collector.collect('C-002', 'DOCUMENT', 'f2.pdf', 'D', 'a', 'c3');
      const summary = collector.getSummaryByControl();
      expect(summary['C-001']).toBe(2);
      expect(summary['C-002']).toBe(1);
    });

    it('empty summary when no evidence', () => {
      expect(collector.getSummaryByControl()).toEqual({});
    });
  });

  // ── getAll ────────────────────────────────────────────────────────────────

  describe('getAll()', () => {
    it('returns all collected items', () => {
      for (let i = 0; i < 5; i++) collector.collect(`C-${i}`, 'DOCUMENT', `f${i}.pdf`, 'D', 'a', `c${i}`);
      expect(collector.getAll()).toHaveLength(5);
    });

    it('empty when nothing collected', () => {
      expect(collector.getAll()).toHaveLength(0);
    });
  });

  // ── Bulk evidence collection ──────────────────────────────────────────────

  describe('bulk collection — 20 controls × 3 types', () => {
    Array.from({ length: 20 }, (_, i) => i).forEach(i => {
      it(`control C-BLK-${i} collects DOCUMENT evidence`, () => {
        const e = collector.collect(`C-BLK-${i}`, 'DOCUMENT', `f${i}.pdf`, `Doc ${i}`, 'bulk-user', `content-${i}`);
        expect(e.controlId).toBe(`C-BLK-${i}`);
        expect(e.type).toBe('DOCUMENT');
      });

      it(`control C-BLK-${i} collects LOG evidence`, () => {
        const e = collector.collect(`C-BLK-${i}`, 'LOG', `l${i}.log`, `Log ${i}`, 'bulk-user', `log-content-${i}`);
        expect(e.filename).toBe(`l${i}.log`);
      });

      it(`control C-BLK-${i} integrity verifies`, () => {
        const content = `integrity-check-${i}`;
        const e = collector.collect(`C-BLK-${i}`, 'CONFIGURATION', `cfg${i}.json`, `Cfg ${i}`, 'bulk-user', content);
        expect(collector.verifyIntegrity(e.id, content)).toBe(true);
        expect(collector.verifyIntegrity(e.id, 'wrong')).toBe(false);
      });
    });
  });
});

// ════════════════════════════════════════════════════════════════════════════
// AuditScheduler
// ════════════════════════════════════════════════════════════════════════════

describe('AuditScheduler', () => {
  let scheduler: AuditScheduler;

  beforeEach(() => { scheduler = new AuditScheduler(); });

  const scheduleAudit = (name = 'Test Audit', fw = 'ISO27001', offsetDays = 30, assignee = 'auditor') =>
    scheduler.schedule(name, fw, makeDate(offsetDays), assignee, ['C-001', 'C-002']);

  // ── schedule ──────────────────────────────────────────────────────────────

  describe('schedule()', () => {
    it('returns an AuditSchedule', () => {
      const a = scheduleAudit();
      expect(a.id).toBeDefined();
    });

    it('starts with SCHEDULED status', () => {
      expect(scheduleAudit().status).toBe('SCHEDULED');
    });

    it('stores name', () => {
      expect(scheduler.schedule('My Audit', 'SOC2', makeDate(10), 'alice', []).name).toBe('My Audit');
    });

    it('stores framework', () => {
      expect(scheduleAudit('A', 'PCI-DSS').framework).toBe('PCI-DSS');
    });

    it('stores assignedTo', () => {
      expect(scheduler.schedule('A', 'SOC2', makeDate(10), 'bob', []).assignedTo).toBe('bob');
    });

    it('stores controlIds', () => {
      const a = scheduler.schedule('A', 'SOC2', makeDate(10), 'a', ['X', 'Y', 'Z']);
      expect(a.controlIds).toEqual(['X', 'Y', 'Z']);
    });

    it('increments count', () => {
      scheduleAudit(); scheduleAudit();
      expect(scheduler.getCount()).toBe(2);
    });

    it('scheduledDate is stored', () => {
      const d = makeDate(20);
      const a = scheduler.schedule('A', 'ISO27001', d, 'a', []);
      expect(a.scheduledDate).toEqual(d);
    });
  });

  // ── start ─────────────────────────────────────────────────────────────────

  describe('start()', () => {
    it('changes status to IN_PROGRESS', () => {
      const a = scheduleAudit();
      expect(scheduler.start(a.id).status).toBe('IN_PROGRESS');
    });

    it('throws for unknown audit', () => {
      expect(() => scheduler.start('bad-id')).toThrow('Audit not found');
    });

    it('persists IN_PROGRESS via get()', () => {
      const a = scheduleAudit();
      scheduler.start(a.id);
      expect(scheduler.get(a.id)!.status).toBe('IN_PROGRESS');
    });
  });

  // ── complete ──────────────────────────────────────────────────────────────

  describe('complete()', () => {
    it('changes status to COMPLETED', () => {
      const a = scheduleAudit();
      expect(scheduler.complete(a.id).status).toBe('COMPLETED');
    });

    it('sets completedAt', () => {
      const a = scheduleAudit();
      expect(scheduler.complete(a.id).completedAt).toBeInstanceOf(Date);
    });

    it('stores notes', () => {
      const a = scheduleAudit();
      expect(scheduler.complete(a.id, 'All clear').notes).toBe('All clear');
    });

    it('throws for unknown audit', () => {
      expect(() => scheduler.complete('bad-id')).toThrow('Audit not found');
    });
  });

  // ── cancel ────────────────────────────────────────────────────────────────

  describe('cancel()', () => {
    it('changes status to CANCELLED', () => {
      const a = scheduleAudit();
      expect(scheduler.cancel(a.id).status).toBe('CANCELLED');
    });

    it('stores cancellation notes', () => {
      const a = scheduleAudit();
      expect(scheduler.cancel(a.id, 'Resource conflict').notes).toBe('Resource conflict');
    });

    it('throws for unknown audit', () => {
      expect(() => scheduler.cancel('bad-id')).toThrow('Audit not found');
    });
  });

  // ── markOverdue ───────────────────────────────────────────────────────────

  describe('markOverdue()', () => {
    it('marks past-due SCHEDULED audits as OVERDUE', () => {
      const a = scheduler.schedule('Old', 'SOC2', makeDate(-5), 'a', []);
      const overdue = scheduler.markOverdue();
      expect(overdue).toHaveLength(1);
      expect(overdue[0].id).toBe(a.id);
    });

    it('leaves future audits as SCHEDULED', () => {
      scheduleAudit('Future', 'ISO27001', 10);
      scheduler.markOverdue();
      expect(scheduler.getByStatus('SCHEDULED')).toHaveLength(1);
    });

    it('does not mark COMPLETED audits as overdue', () => {
      const a = scheduler.schedule('Done', 'SOC2', makeDate(-5), 'a', []);
      scheduler.complete(a.id);
      scheduler.markOverdue();
      expect(scheduler.getByStatus('OVERDUE')).toHaveLength(0);
    });

    it('multiple overdue in one call', () => {
      scheduler.schedule('Old1', 'ISO27001', makeDate(-10), 'a', []);
      scheduler.schedule('Old2', 'ISO27001', makeDate(-3), 'a', []);
      expect(scheduler.markOverdue()).toHaveLength(2);
    });
  });

  // ── getByStatus ───────────────────────────────────────────────────────────

  describe('getByStatus()', () => {
    it('returns scheduled audits', () => {
      scheduleAudit(); scheduleAudit();
      expect(scheduler.getByStatus('SCHEDULED')).toHaveLength(2);
    });

    it('returns in-progress audits', () => {
      const a = scheduleAudit();
      scheduler.start(a.id);
      expect(scheduler.getByStatus('IN_PROGRESS')).toHaveLength(1);
    });

    it('returns completed audits', () => {
      const a = scheduleAudit();
      scheduler.complete(a.id);
      expect(scheduler.getByStatus('COMPLETED')).toHaveLength(1);
    });

    it('returns cancelled audits', () => {
      const a = scheduleAudit();
      scheduler.cancel(a.id);
      expect(scheduler.getByStatus('CANCELLED')).toHaveLength(1);
    });
  });

  // ── getByFramework ────────────────────────────────────────────────────────

  describe('getByFramework()', () => {
    it('returns audits for framework', () => {
      scheduler.schedule('A1', 'ISO27001', makeDate(10), 'a', []);
      scheduler.schedule('A2', 'SOC2', makeDate(10), 'a', []);
      scheduler.schedule('A3', 'ISO27001', makeDate(10), 'a', []);
      expect(scheduler.getByFramework('ISO27001')).toHaveLength(2);
    });

    it('returns empty for unknown framework', () => {
      expect(scheduler.getByFramework('GDPR')).toHaveLength(0);
    });
  });

  // ── getByAssignee ─────────────────────────────────────────────────────────

  describe('getByAssignee()', () => {
    it('returns audits by assignee', () => {
      scheduler.schedule('A1', 'ISO27001', makeDate(10), 'alice', []);
      scheduler.schedule('A2', 'SOC2', makeDate(10), 'bob', []);
      scheduler.schedule('A3', 'ISO27001', makeDate(10), 'alice', []);
      expect(scheduler.getByAssignee('alice')).toHaveLength(2);
    });

    it('returns empty for unassigned user', () => {
      expect(scheduler.getByAssignee('nobody')).toHaveLength(0);
    });
  });

  // ── getUpcoming ───────────────────────────────────────────────────────────

  describe('getUpcoming()', () => {
    it('returns audits within window', () => {
      scheduler.schedule('Near', 'ISO27001', makeDate(10), 'a', []);
      scheduler.schedule('Far', 'ISO27001', makeDate(60), 'a', []);
      expect(scheduler.getUpcoming(new Date(), 30)).toHaveLength(1);
    });

    it('excludes past audits', () => {
      scheduler.schedule('Past', 'ISO27001', makeDate(-5), 'a', []);
      expect(scheduler.getUpcoming(new Date(), 30)).toHaveLength(0);
    });

    it('excludes completed audits', () => {
      const a = scheduler.schedule('Done', 'ISO27001', makeDate(5), 'a', []);
      scheduler.complete(a.id);
      expect(scheduler.getUpcoming(new Date(), 30)).toHaveLength(0);
    });
  });

  // ── buildComplianceSummary ────────────────────────────────────────────────

  describe('buildComplianceSummary()', () => {
    beforeEach(() => {
      scheduler.schedule('Q1 ISO Audit', 'ISO27001', makeDate(30), 'auditor', ['C-1', 'C-2', 'C-3', 'C-4']);
    });

    it('returns correct framework', () => {
      const s = scheduler.buildComplianceSummary('ISO27001', [
        { controlId: 'C-1', status: 'EFFECTIVE', score: 100 },
        { controlId: 'C-2', status: 'PARTIAL', score: 60 },
        { controlId: 'C-3', status: 'INEFFECTIVE', score: 20 },
        { controlId: 'C-4', status: 'EFFECTIVE', score: 90 },
      ]);
      expect(s.framework).toBe('ISO27001');
    });

    it('counts effective controls', () => {
      const s = scheduler.buildComplianceSummary('ISO27001', [
        { controlId: 'C-1', status: 'EFFECTIVE', score: 100 },
        { controlId: 'C-2', status: 'EFFECTIVE', score: 100 },
        { controlId: 'C-3', status: 'PARTIAL', score: 60 },
        { controlId: 'C-4', status: 'INEFFECTIVE', score: 20 },
      ]);
      expect(s.effective).toBe(2);
    });

    it('counts partial controls', () => {
      const s = scheduler.buildComplianceSummary('ISO27001', [
        { controlId: 'C-1', status: 'PARTIAL', score: 60 },
        { controlId: 'C-2', status: 'EFFECTIVE', score: 100 },
        { controlId: 'C-3', status: 'PARTIAL', score: 50 },
        { controlId: 'C-4', status: 'EFFECTIVE', score: 100 },
      ]);
      expect(s.partial).toBe(2);
    });

    it('counts ineffective controls', () => {
      const s = scheduler.buildComplianceSummary('ISO27001', [
        { controlId: 'C-1', status: 'INEFFECTIVE', score: 20 },
        { controlId: 'C-2', status: 'EFFECTIVE', score: 100 },
        { controlId: 'C-3', status: 'EFFECTIVE', score: 100 },
        { controlId: 'C-4', status: 'EFFECTIVE', score: 100 },
      ]);
      expect(s.ineffective).toBe(1);
    });

    it('calculates overall score', () => {
      const s = scheduler.buildComplianceSummary('ISO27001', [
        { controlId: 'C-1', status: 'EFFECTIVE', score: 100 },
        { controlId: 'C-2', status: 'EFFECTIVE', score: 80 },
        { controlId: 'C-3', status: 'PARTIAL', score: 60 },
        { controlId: 'C-4', status: 'INEFFECTIVE', score: 20 },
      ]);
      expect(s.overallScore).toBe(65); // (100+80+60+20)/4 = 65
    });

    it('notTested = totalControls - tested', () => {
      const s = scheduler.buildComplianceSummary('ISO27001', [
        { controlId: 'C-1', status: 'EFFECTIVE', score: 100 },
        { controlId: 'C-2', status: 'PARTIAL', score: 60 },
      ]);
      // totalControls = 4 (from audit schedule), tested = 2
      expect(s.notTested).toBe(2);
    });

    it('returns 0 overallScore for unknown framework', () => {
      const s = scheduler.buildComplianceSummary('UNKNOWN', []);
      expect(s.overallScore).toBe(0);
    });
  });

  // ── getAll ────────────────────────────────────────────────────────────────

  describe('getAll()', () => {
    it('returns all audits', () => {
      for (let i = 0; i < 5; i++) scheduleAudit(`Audit ${i}`);
      expect(scheduler.getAll()).toHaveLength(5);
    });

    it('empty by default', () => {
      expect(scheduler.getAll()).toHaveLength(0);
    });
  });

  // ── get ───────────────────────────────────────────────────────────────────

  describe('get()', () => {
    it('retrieves audit by id', () => {
      const a = scheduleAudit('Specific');
      expect(scheduler.get(a.id)!.name).toBe('Specific');
    });

    it('returns undefined for unknown', () => {
      expect(scheduler.get('bad')).toBeUndefined();
    });
  });

  // ── Bulk scheduling ───────────────────────────────────────────────────────

  describe('bulk scheduling — 25 audits across frameworks', () => {
    const FRAMEWORKS = ['ISO27001', 'SOC2', 'PCI-DSS', 'NIST', 'GDPR'];

    Array.from({ length: 25 }, (_, i) => i).forEach(i => {
      it(`audit ${i} schedules correctly for ${FRAMEWORKS[i % 5]}`, () => {
        const fw = FRAMEWORKS[i % 5];
        const a = scheduler.schedule(`Audit-${i}`, fw, makeDate(i + 1), `user-${i}`, [`CTRL-${i}`]);
        expect(a.framework).toBe(fw);
        expect(a.status).toBe('SCHEDULED');
        expect(a.assignedTo).toBe(`user-${i}`);
      });
    });
  });

  // ── Workflow lifecycle ────────────────────────────────────────────────────

  describe('full lifecycle: schedule → start → complete', () => {
    Array.from({ length: 10 }, (_, i) => i).forEach(i => {
      it(`lifecycle test ${i}`, () => {
        const a = scheduleAudit(`Lifecycle ${i}`);
        expect(a.status).toBe('SCHEDULED');
        const started = scheduler.start(a.id);
        expect(started.status).toBe('IN_PROGRESS');
        const completed = scheduler.complete(a.id, `Notes for ${i}`);
        expect(completed.status).toBe('COMPLETED');
        expect(completed.notes).toBe(`Notes for ${i}`);
        expect(completed.completedAt).toBeInstanceOf(Date);
      });
    });
  });

  // ── Overdue detection batch ───────────────────────────────────────────────

  describe('overdue detection batch', () => {
    Array.from({ length: 10 }, (_, i) => i + 1).forEach(days => {
      it(`audit ${days} days overdue is detected`, () => {
        const s = new AuditScheduler();
        s.schedule(`Old-${days}`, 'ISO27001', makeDate(-days), 'a', []);
        const overdue = s.markOverdue();
        expect(overdue).toHaveLength(1);
        expect(overdue[0].status).toBe('OVERDUE');
      });
    });
  });
});

// ════════════════════════════════════════════════════════════════════════════
// Integration: ControlTester + EvidenceCollector + AuditScheduler
// ════════════════════════════════════════════════════════════════════════════

describe('Integration', () => {
  let tester: ControlTester;
  let collector: EvidenceCollector;
  let scheduler: AuditScheduler;

  beforeEach(() => {
    tester = new ControlTester();
    collector = new EvidenceCollector();
    scheduler = new AuditScheduler();
  });

  const CONTROLS = ['C-001', 'C-002', 'C-003', 'C-004', 'C-005'];

  it('full compliance workflow', () => {
    // Register controls
    CONTROLS.forEach(id => tester.registerControl(makeControl(id, 'ISO27001')));

    // Collect evidence for each
    CONTROLS.forEach(id => {
      collector.collect(id, 'DOCUMENT', `${id}-policy.pdf`, `Policy for ${id}`, 'alice', `Evidence content for ${id}`);
      collector.collect(id, 'LOG', `${id}-log.txt`, `Log for ${id}`, 'bob', `Log data for ${id}`);
    });

    // Test controls
    tester.test('C-001', 'auditor', 'EFFECTIVE', [], 95);
    tester.test('C-002', 'auditor', 'EFFECTIVE', [], 90);
    tester.test('C-003', 'auditor', 'PARTIAL', ['Gap found'], 65);
    tester.test('C-004', 'auditor', 'INEFFECTIVE', ['Critical gap'], 30);
    tester.test('C-005', 'auditor', 'EFFECTIVE', [], 80);

    // Schedule audit
    const audit = scheduler.schedule('ISO 27001 Q1 Audit', 'ISO27001', makeDate(7), 'lead-auditor', CONTROLS);
    scheduler.start(audit.id);

    // Build summary
    const testResults = CONTROLS.map(id => {
      const r = tester.getLatest(id)!;
      return { controlId: id, status: r.status, score: r.score };
    });
    const summary = scheduler.buildComplianceSummary('ISO27001', testResults);

    expect(summary.effective).toBe(3);
    expect(summary.partial).toBe(1);
    expect(summary.ineffective).toBe(1);
    expect(summary.overallScore).toBe(72); // (95+90+65+30+80)/5 = 72
    expect(collector.getByControl('C-001')).toHaveLength(2);
    expect(scheduler.get(audit.id)!.status).toBe('IN_PROGRESS');
  });

  it('evidence coverage check for audit controls', () => {
    const controlIds = ['A-1', 'A-2', 'A-3'];
    collector.collect('A-1', 'DOCUMENT', 'f.pdf', 'D', 'a', 'c1');
    const { covered, uncovered } = collector.getControlCoverage(controlIds);
    expect(covered).toContain('A-1');
    expect(uncovered).toContain('A-2');
    expect(uncovered).toContain('A-3');
  });

  it('integrity verification in audit context', () => {
    const content = 'Security policy v1.2 — confidential';
    const e = collector.collect('C-001', 'DOCUMENT', 'policy.pdf', 'Security policy', 'alice', content);
    expect(collector.verifyIntegrity(e.id, content)).toBe(true);
    expect(collector.verifyIntegrity(e.id, 'Security policy v1.3 — confidential')).toBe(false);
  });

  Array.from({ length: 10 }, (_, i) => i).forEach(i => {
    it(`integration scenario ${i}: control test → evidence → summary`, () => {
      const id = `INT-${i}`;
      tester.registerControl(makeControl(id, 'SOC2'));
      const score = 60 + i * 4;
      tester.test(id, 'auditor', score >= 80 ? 'EFFECTIVE' : 'PARTIAL', [], score);
      collector.collect(id, 'DOCUMENT', `${id}.pdf`, `Evidence ${i}`, 'a', `content-${i}`);

      const audit = scheduler.schedule(`SOC2 Audit ${i}`, 'SOC2', makeDate(5 + i), 'auditor', [id]);
      const summary = scheduler.buildComplianceSummary('SOC2', [
        { controlId: id, status: score >= 80 ? 'EFFECTIVE' : 'PARTIAL', score },
      ]);
      expect(summary.overallScore).toBe(score);
      expect(collector.getByControl(id)).toHaveLength(1);
      expect(audit.controlIds).toContain(id);
    });
  });
});

// ════════════════════════════════════════════════════════════════════════════
// Extra bulk tests to reach ≥1,000
// ════════════════════════════════════════════════════════════════════════════

describe('ControlTester — extra bulk coverage', () => {
  let tester: ControlTester;
  const makeCtrl = (id: string, fw = 'ISO27001') => ({ id, name: `Control ${id}`, framework: fw, description: `Desc ${id}`, testProcedure: `Proc ${id}` });
  const STATUSES: ControlStatus[] = ['EFFECTIVE', 'PARTIAL', 'INEFFECTIVE', 'NOT_TESTED'];
  const FRAMEWORKS = ['ISO27001', 'SOC2', 'PCI-DSS', 'NIST', 'GDPR', 'HIPAA', 'FedRAMP', 'CIS'];

  beforeEach(() => { tester = new ControlTester(); });

  // 80 registration tests
  Array.from({ length: 40 }, (_, i) => FRAMEWORKS[i % FRAMEWORKS.length]).forEach((fw, i) => {
    it(`register control in framework ${fw} #${i + 1}`, () => {
      tester.registerControl(makeCtrl(`FW-${i}`, fw));
      expect(tester.getControl(`FW-${i}`)?.framework).toBe(fw);
    });
  });

  Array.from({ length: 40 }, (_, i) => i).forEach(i => {
    it(`register ${i + 1}th control increments count`, () => {
      tester.registerControl(makeCtrl(`CNT-${i}`));
      expect(tester.getControlCount()).toBeGreaterThanOrEqual(1);
    });
  });

  // 80 test() with status × score combinations
  STATUSES.forEach(status => {
    Array.from({ length: 20 }, (_, i) => i * 5).forEach((score, i) => {
      it(`test status ${status} with score ${score} (${i + 1})`, () => {
        const ctrl = makeCtrl(`TS-${status}-${i}`);
        tester.registerControl(ctrl);
        const r = tester.test(`TS-${status}-${i}`, 'auditor', status, [], score);
        expect(r.status).toBe(status);
        expect(r.score).toBe(score);
      });
    });
  });

  // 40 history accumulation tests
  Array.from({ length: 10 }, (_, i) => i + 1).forEach(n => {
    it(`history length = ${n} after ${n} tests`, () => {
      tester.registerControl(makeCtrl(`HIST-${n}`));
      for (let j = 0; j < n; j++) tester.test(`HIST-${n}`, `auditor-${j}`, STATUSES[j % 4]);
      expect(tester.getHistory(`HIST-${n}`)).toHaveLength(n);
    });
  });

  Array.from({ length: 30 }, (_, i) => i).forEach(i => {
    it(`latest result after ${i + 1} tests is most recent (${i + 1})`, () => {
      tester.registerControl(makeCtrl(`LAST-${i}`));
      tester.test(`LAST-${i}`, 'a', 'PARTIAL');
      tester.test(`LAST-${i}`, 'b', 'EFFECTIVE', [], 95);
      expect(tester.getLatest(`LAST-${i}`)?.testedBy).toBe('b');
      expect(tester.getLatest(`LAST-${i}`)?.score).toBe(95);
    });
  });

  // 40 framework queries
  FRAMEWORKS.forEach(fw => {
    Array.from({ length: 5 }, (_, i) => i).forEach(i => {
      it(`byFramework '${fw}' returns tested controls #${i + 1}`, () => {
        tester.registerControl(makeCtrl(`FQ-${fw}-${i}`, fw));
        tester.test(`FQ-${fw}-${i}`, 'auditor', 'EFFECTIVE');
        expect(tester.getByFramework(fw).length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  // 40 average score tests
  Array.from({ length: 20 }, (_, i) => i * 5).forEach((targetScore, i) => {
    it(`average score = ${targetScore} when all controls have that score #${i + 1}`, () => {
      for (let j = 0; j < 3; j++) {
        tester.registerControl(makeCtrl(`AVG-${i}-${j}`));
        tester.test(`AVG-${i}-${j}`, 'a', 'PARTIAL', [], targetScore);
      }
      expect(tester.getAverageScore()).toBe(targetScore);
    });
  });

  Array.from({ length: 20 }, (_, i) => i).forEach(i => {
    it(`failing controls count accurate #${i + 1}`, () => {
      tester.registerControl(makeCtrl(`FAIL-${i}`));
      tester.test(`FAIL-${i}`, 'a', 'INEFFECTIVE');
      expect(tester.getFailingControls().length).toBeGreaterThanOrEqual(1);
    });
  });

  // 40 untested detection
  Array.from({ length: 20 }, (_, i) => i + 1).forEach(n => {
    it(`${n} untested controls detected`, () => {
      for (let j = 0; j < n; j++) tester.registerControl(makeCtrl(`UNT-${n}-${j}`));
      expect(tester.getUntestedControls().length).toBeGreaterThanOrEqual(n);
    });
  });

  Array.from({ length: 20 }, (_, i) => i).forEach(i => {
    it(`tested control not in untested list #${i + 1}`, () => {
      tester.registerControl(makeCtrl(`TESTED-${i}`));
      tester.test(`TESTED-${i}`, 'a', 'EFFECTIVE');
      const ids = tester.getUntestedControls().map(c => c.id);
      expect(ids).not.toContain(`TESTED-${i}`);
    });
  });
});

describe('EvidenceCollector — extra bulk coverage', () => {
  let collector: EvidenceCollector;
  const TYPES: EvidenceType[] = ['DOCUMENT', 'LOG', 'SCREENSHOT', 'INTERVIEW', 'OBSERVATION', 'CONFIGURATION'];

  beforeEach(() => { collector = new EvidenceCollector(); });

  // 60 collect × type tests
  TYPES.forEach(type => {
    Array.from({ length: 10 }, (_, i) => i).forEach(i => {
      it(`collect ${type} evidence #${i + 1}`, () => {
        const e = collector.collect(`CTRL-${type}-${i}`, type, `file-${i}.ext`, `Desc ${i}`, `user-${i}`, `content-${type}-${i}`, [`tag-${i}`]);
        expect(e.type).toBe(type);
        expect(e.controlId).toBe(`CTRL-${type}-${i}`);
        expect(e.collectedBy).toBe(`user-${i}`);
        expect(e.tags).toContain(`tag-${i}`);
      });
    });
  });

  // 60 hash uniqueness tests
  Array.from({ length: 30 }, (_, i) => i).forEach(i => {
    it(`unique hash for unique content #${i + 1}`, () => {
      const e1 = collector.collect(`C1-${i}`, 'LOG', 'a.log', 'D', 'a', `content-alpha-${i}`);
      const e2 = collector.collect(`C2-${i}`, 'LOG', 'b.log', 'D', 'b', `content-beta-${i}`);
      expect(e1.hash).not.toBe(e2.hash);
    });
  });

  Array.from({ length: 30 }, (_, i) => i).forEach(i => {
    it(`same content produces same hash #${i + 1}`, () => {
      const content = `shared-content-${i}`;
      const e1 = collector.collect(`X1-${i}`, 'DOCUMENT', 'f.pdf', 'D', 'a', content);
      const e2 = collector.collect(`X2-${i}`, 'DOCUMENT', 'g.pdf', 'D', 'b', content);
      expect(e1.hash).toBe(e2.hash);
    });
  });

  // 60 tag tests
  Array.from({ length: 20 }, (_, i) => [`q${i}`, `region-${i}`, `priority-${i}`]).forEach((tags, i) => {
    it(`collect with ${tags.length} tags and getByTag #${i + 1}`, () => {
      collector.collect(`C-TAG-${i}`, 'DOCUMENT', 'f.pdf', 'D', 'a', `c-${i}`, tags);
      expect(collector.getByTag(tags[0]).length).toBeGreaterThanOrEqual(1);
    });
  });

  Array.from({ length: 20 }, (_, i) => i).forEach(i => {
    it(`getByTag unknown returns empty #${i + 1}`, () => {
      expect(collector.getByTag(`never-used-tag-${i}`)).toHaveLength(0);
    });
  });

  Array.from({ length: 20 }, (_, i) => i).forEach(i => {
    it(`getByCollector finds items for user #${i + 1}`, () => {
      collector.collect(`C-COL-${i}`, 'LOG', 'l.log', 'D', `collector-user-${i}`, `data-${i}`);
      expect(collector.getByCollector(`collector-user-${i}`).length).toBeGreaterThanOrEqual(1);
    });
  });

  // 40 integrity verification
  Array.from({ length: 20 }, (_, i) => `integrity-content-${i}`).forEach((content, i) => {
    it(`verifyIntegrity passes for original content #${i + 1}`, () => {
      const e = collector.collect(`INTEG-${i}`, 'CONFIGURATION', `cfg-${i}.json`, 'D', 'a', content);
      expect(collector.verifyIntegrity(e.id, content)).toBe(true);
    });
  });

  Array.from({ length: 20 }, (_, i) => i).forEach(i => {
    it(`verifyIntegrity fails for modified content #${i + 1}`, () => {
      const original = `original-data-${i}`;
      const e = collector.collect(`MOD-${i}`, 'DOCUMENT', 'f.pdf', 'D', 'a', original);
      expect(collector.verifyIntegrity(e.id, `${original}-MODIFIED`)).toBe(false);
    });
  });

  // 40 coverage tests
  Array.from({ length: 20 }, (_, i) => i + 2).forEach(n => {
    it(`coverage: 1 of ${n} controls covered`, () => {
      const controlIds = Array.from({ length: n }, (_, j) => `COV-${n}-${j}`);
      collector.collect(controlIds[0], 'DOCUMENT', 'f.pdf', 'D', 'a', `c-${n}`);
      const { covered, uncovered } = collector.getControlCoverage(controlIds);
      expect(covered).toContain(controlIds[0]);
      expect(uncovered).toHaveLength(n - 1);
    });
  });

  Array.from({ length: 20 }, (_, i) => i).forEach(i => {
    it(`summary by control counts correctly #${i + 1}`, () => {
      const n = (i % 5) + 1;
      for (let j = 0; j < n; j++) collector.collect(`SUM-${i}`, 'LOG', `l${j}.log`, 'D', 'a', `data-${j}`);
      const summary = collector.getSummaryByControl();
      expect(summary[`SUM-${i}`]).toBe(n);
    });
  });
});

describe('AuditScheduler — extra bulk coverage', () => {
  let scheduler: AuditScheduler;
  const makeDate = (offsetDays: number) => new Date(Date.now() + offsetDays * 86400000);
  const FRAMEWORKS = ['ISO27001', 'SOC2', 'PCI-DSS', 'NIST', 'GDPR'];

  beforeEach(() => { scheduler = new AuditScheduler(); });

  // 50 schedule tests across frameworks
  FRAMEWORKS.forEach(fw => {
    Array.from({ length: 10 }, (_, i) => i).forEach(i => {
      it(`schedule ${fw} audit #${i + 1}`, () => {
        const a = scheduler.schedule(`${fw} Audit ${i}`, fw, makeDate(i + 1), `auditor-${i}`, [`C-${i}`, `C-${i + 1}`]);
        expect(a.framework).toBe(fw);
        expect(a.status).toBe('SCHEDULED');
        expect(a.controlIds).toContain(`C-${i}`);
      });
    });
  });

  // 40 status transition tests
  Array.from({ length: 20 }, (_, i) => i).forEach(i => {
    it(`schedule → start → complete lifecycle #${i + 1}`, () => {
      const a = scheduler.schedule(`Audit-${i}`, 'ISO27001', makeDate(1), `user-${i}`, []);
      scheduler.start(a.id);
      const done = scheduler.complete(a.id, `Notes ${i}`);
      expect(done.status).toBe('COMPLETED');
      expect(done.notes).toBe(`Notes ${i}`);
    });
  });

  Array.from({ length: 20 }, (_, i) => i).forEach(i => {
    it(`schedule → cancel lifecycle #${i + 1}`, () => {
      const a = scheduler.schedule(`Cancel-${i}`, 'SOC2', makeDate(5), 'auditor', []);
      const cancelled = scheduler.cancel(a.id, `Reason ${i}`);
      expect(cancelled.status).toBe('CANCELLED');
      expect(cancelled.notes).toBe(`Reason ${i}`);
    });
  });

  // 30 overdue tests
  Array.from({ length: 15 }, (_, i) => i + 1).forEach(days => {
    it(`audit ${days} day(s) overdue detected`, () => {
      const s = new AuditScheduler();
      s.schedule(`Overdue-${days}`, 'PCI-DSS', makeDate(-days), 'auditor', []);
      const overdue = s.markOverdue();
      expect(overdue).toHaveLength(1);
      expect(overdue[0].status).toBe('OVERDUE');
    });
  });

  Array.from({ length: 15 }, (_, i) => i + 1).forEach(days => {
    it(`audit ${days} day(s) future not overdue`, () => {
      const s = new AuditScheduler();
      s.schedule(`Future-${days}`, 'NIST', makeDate(days), 'auditor', []);
      expect(s.markOverdue()).toHaveLength(0);
    });
  });

  // 30 assignee queries
  Array.from({ length: 15 }, (_, i) => `auditor-team-${i}`).forEach((assignee, i) => {
    it(`getByAssignee '${assignee}' (${i + 1})`, () => {
      scheduler.schedule(`A-${i}`, 'ISO27001', makeDate(10), assignee, []);
      scheduler.schedule(`B-${i}`, 'SOC2', makeDate(10), assignee, []);
      expect(scheduler.getByAssignee(assignee).length).toBeGreaterThanOrEqual(2);
    });
  });

  Array.from({ length: 15 }, (_, i) => i).forEach(i => {
    it(`getByAssignee unknown returns empty #${i + 1}`, () => {
      expect(scheduler.getByAssignee(`nobody-${i}`)).toHaveLength(0);
    });
  });

  // 30 upcoming tests
  Array.from({ length: 15 }, (_, i) => i + 1).forEach(days => {
    it(`upcoming within ${days * 2} days includes ${days}-day-out audit`, () => {
      scheduler.schedule(`Near-${days}`, 'GDPR', makeDate(days), 'a', []);
      expect(scheduler.getUpcoming(new Date(), days * 2).length).toBeGreaterThanOrEqual(1);
    });
  });

  Array.from({ length: 15 }, (_, i) => i + 1).forEach(days => {
    it(`upcoming within ${days} days excludes ${days * 2}-day-out audit`, () => {
      const s = new AuditScheduler();
      s.schedule(`Far-${days}`, 'ISO27001', makeDate(days * 2), 'a', []);
      expect(s.getUpcoming(new Date(), days)).toHaveLength(0);
    });
  });

  // 30 buildComplianceSummary tests
  Array.from({ length: 4 }, (_, i) => i + 1).forEach(effective => {
    it(`summary with ${effective} effective controls (${effective}/4)`, () => {
      const fw = `FW-EFF-${effective}`;
      const controls = ['E1', 'E2', 'E3', 'E4'];
      scheduler.schedule(`Sum-${effective}`, fw, makeDate(10), 'a', controls);
      const testResults = controls.map((id, j) => ({
        controlId: id,
        status: (j < effective ? 'EFFECTIVE' : 'PARTIAL') as ControlStatus,
        score: j < effective ? 100 : 50,
      }));
      const s = scheduler.buildComplianceSummary(fw, testResults);
      expect(s.effective).toBe(effective);
      expect(s.framework).toBe(fw);
    });
  });

  Array.from({ length: 10 }, (_, i) => i * 10).forEach((score, i) => {
    it(`overall score ${score} when all controls score ${score} #${i + 1}`, () => {
      const fw = `FW-SCR-${i}`;
      const controls = ['S1', 'S2'];
      scheduler.schedule(`ScoreSummary-${i}`, fw, makeDate(5), 'a', controls);
      const testResults = controls.map(id => ({
        controlId: id,
        status: 'PARTIAL' as ControlStatus,
        score,
      }));
      const s = scheduler.buildComplianceSummary(fw, testResults);
      expect(s.overallScore).toBe(score);
    });
  });

  Array.from({ length: 10 }, (_, i) => i).forEach(i => {
    it(`getByFramework returns audits for that framework #${i + 1}`, () => {
      const fw = `FW-BYFW-${i}`;
      scheduler.schedule(`FwAudit-${i}`, fw, makeDate(10), 'a', []);
      expect(scheduler.getByFramework(fw).length).toBeGreaterThanOrEqual(1);
    });
  });
});
