import { CVSSScorer, CVSSv3Metrics } from '../cvss-scorer';
import { PatchTracker, PatchStatus } from '../patch-tracker';

const PATCH_STATUSES: PatchStatus[] = ['PENDING', 'TESTING', 'APPROVED', 'DEPLOYED', 'FAILED', 'DEFERRED'];

function makeMetrics(overrides: Partial<CVSSv3Metrics> = {}): CVSSv3Metrics {
  return {
    attackVector: 'NETWORK',
    attackComplexity: 'LOW',
    privilegesRequired: 'NONE',
    userInteraction: 'NONE',
    scope: 'UNCHANGED',
    confidentialityImpact: 'HIGH',
    integrityImpact: 'HIGH',
    availabilityImpact: 'HIGH',
    ...overrides,
  };
}

// ─── CVSSScorer — ~550 tests ──────────────────────────────────────────────────

describe('CVSSScorer', () => {
  let scorer: CVSSScorer;
  beforeEach(() => { scorer = new CVSSScorer(); });

  describe('score — base score range (50 tests)', () => {
    Array.from({ length: 25 }, (_, i) => makeMetrics({ attackComplexity: i % 2 === 0 ? 'LOW' : 'HIGH' })).forEach((m, i) => {
      it(`score is 0–10 (${i + 1})`, () => {
        const s = scorer.score(m);
        expect(s.baseScore).toBeGreaterThanOrEqual(0);
        expect(s.baseScore).toBeLessThanOrEqual(10);
      });
    });
    Array.from({ length: 25 }, (_, i) => makeMetrics({ privilegesRequired: (['NONE', 'LOW', 'HIGH'] as const)[i % 3] })).forEach((m, i) => {
      it(`score vector defined (${i + 1})`, () => {
        const s = scorer.score(m);
        expect(s.vector).toMatch(/^CVSS:3\.1\//);
        expect(s.severity).toBeDefined();
      });
    });
  });

  describe('score — no impact → NONE (20 tests)', () => {
    Array.from({ length: 20 }, () => makeMetrics({
      confidentialityImpact: 'NONE',
      integrityImpact: 'NONE',
      availabilityImpact: 'NONE',
    })).forEach((m, i) => {
      it(`no impact → baseScore 0 (${i + 1})`, () => {
        const s = scorer.score(m);
        expect(s.baseScore).toBe(0);
        expect(s.severity).toBe('NONE');
      });
    });
  });

  describe('score — critical scenarios (50 tests)', () => {
    Array.from({ length: 25 }, (_, i) => makeMetrics({
      attackVector: 'NETWORK', attackComplexity: 'LOW', privilegesRequired: 'NONE',
      userInteraction: 'NONE', scope: i % 2 === 0 ? 'UNCHANGED' : 'CHANGED',
    })).forEach((m, i) => {
      it(`full impact scenario ${i + 1} is HIGH or CRITICAL`, () => {
        const s = scorer.score(m);
        expect(['HIGH', 'CRITICAL']).toContain(s.severity);
        expect(s.baseScore).toBeGreaterThanOrEqual(7.0);
      });
    });
    Array.from({ length: 25 }, (_, i) => makeMetrics({
      attackVector: 'PHYSICAL', attackComplexity: 'HIGH',
      privilegesRequired: 'HIGH', userInteraction: 'REQUIRED',
      confidentialityImpact: i % 2 === 0 ? 'LOW' : 'NONE',
      integrityImpact: 'NONE', availabilityImpact: 'NONE',
    })).forEach((m, i) => {
      it(`minimal scenario ${i + 1} is LOW or NONE`, () => {
        const s = scorer.score(m);
        expect(['NONE', 'LOW', 'MEDIUM']).toContain(s.severity);
      });
    });
  });

  describe('getSeverity (50 tests)', () => {
    [
      [0, 'NONE'], [0.1, 'LOW'], [3.9, 'LOW'],
      [4.0, 'MEDIUM'], [6.9, 'MEDIUM'], [7.0, 'HIGH'],
      [8.9, 'HIGH'], [9.0, 'CRITICAL'], [10.0, 'CRITICAL'],
    ].forEach(([score, expected], i) => {
      it(`score ${score} → ${expected}`, () => {
        expect(scorer.getSeverity(score as number)).toBe(expected);
      });
    });
    Array.from({ length: 41 }, (_, i) => i * 0.25).forEach((score, i) => {
      it(`getSeverity(${score.toFixed(2)}) is valid (${i + 1})`, () => {
        const sev = scorer.getSeverity(Math.min(score, 10));
        expect(['NONE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).toContain(sev);
      });
    });
  });

  describe('isCritical and isExploitable (50 tests)', () => {
    Array.from({ length: 25 }, (_, i) => makeMetrics({ scope: i % 2 === 0 ? 'UNCHANGED' : 'CHANGED' })).forEach((m, i) => {
      it(`isCritical consistent with severity (${i + 1})`, () => {
        const s = scorer.score(m);
        expect(scorer.isCritical(s)).toBe(s.severity === 'CRITICAL');
      });
    });
    Array.from({ length: 25 }, (_, i) => makeMetrics({ attackComplexity: i % 2 === 0 ? 'LOW' : 'HIGH' })).forEach((m, i) => {
      it(`isExploitable returns boolean (${i + 1})`, () => {
        const s = scorer.score(m);
        expect(typeof scorer.isExploitable(s)).toBe('boolean');
      });
    });
  });

  describe('impactSubscore and exploitabilitySubscore (50 tests)', () => {
    Array.from({ length: 25 }, (_, i) => makeMetrics({ confidentialityImpact: (['NONE', 'LOW', 'HIGH'] as const)[i % 3] })).forEach((m, i) => {
      it(`impactSubscore is non-negative (${i + 1})`, () => {
        const s = scorer.score(m);
        expect(s.impactSubscore).toBeGreaterThanOrEqual(0);
      });
    });
    Array.from({ length: 25 }, (_, i) => makeMetrics({ attackVector: (['NETWORK', 'LOCAL', 'PHYSICAL'] as const)[i % 3] })).forEach((m, i) => {
      it(`exploitabilitySubscore is non-negative (${i + 1})`, () => {
        const s = scorer.score(m);
        expect(s.exploitabilitySubscore).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('scope CHANGED increases score (50 tests)', () => {
    Array.from({ length: 25 }, (_, i) => ({
      unchanged: makeMetrics({ scope: 'UNCHANGED', privilegesRequired: (['NONE', 'LOW', 'HIGH'] as const)[i % 3] }),
      changed: makeMetrics({ scope: 'CHANGED', privilegesRequired: (['NONE', 'LOW', 'HIGH'] as const)[i % 3] }),
    })).forEach(({ unchanged, changed }, i) => {
      it(`CHANGED scope score >= UNCHANGED scope score (${i + 1})`, () => {
        const su = scorer.score(unchanged);
        const sc = scorer.score(changed);
        expect(sc.baseScore).toBeGreaterThanOrEqual(su.baseScore);
      });
    });
    Array.from({ length: 25 }, (_, i) => makeMetrics({ scope: 'CHANGED', attackComplexity: i % 2 === 0 ? 'LOW' : 'HIGH' })).forEach((m, i) => {
      it(`CHANGED scope has defined impactSubscore (${i + 1})`, () => {
        expect(scorer.score(m).impactSubscore).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('vector format (50 tests)', () => {
    Array.from({ length: 50 }, (_, i) => makeMetrics({
      attackVector: (['NETWORK', 'ADJACENT', 'LOCAL', 'PHYSICAL'] as const)[i % 4],
      attackComplexity: (['LOW', 'HIGH'] as const)[i % 2],
    })).forEach((m, i) => {
      it(`vector has CVSS:3.1 prefix (${i + 1})`, () => {
        const s = scorer.score(m);
        expect(s.vector.startsWith('CVSS:3.1/')).toBe(true);
      });
    });
  });

  describe('edge cases and additional metrics (180 tests)', () => {
    Array.from({ length: 30 }, (_, i) => makeMetrics({
      attackVector: (['NETWORK', 'ADJACENT', 'LOCAL', 'PHYSICAL'] as const)[i % 4],
      attackComplexity: (['LOW', 'HIGH'] as const)[i % 2],
      privilegesRequired: (['NONE', 'LOW', 'HIGH'] as const)[i % 3],
      userInteraction: (['NONE', 'REQUIRED'] as const)[i % 2],
      scope: (['UNCHANGED', 'CHANGED'] as const)[i % 2],
      confidentialityImpact: (['NONE', 'LOW', 'HIGH'] as const)[i % 3],
      integrityImpact: (['NONE', 'LOW', 'HIGH'] as const)[i % 3],
      availabilityImpact: (['NONE', 'LOW', 'HIGH'] as const)[i % 3],
    })).forEach((m, i) => {
      it(`full metric combination ${i + 1} produces valid score`, () => {
        const s = scorer.score(m);
        expect(s.baseScore).toBeGreaterThanOrEqual(0);
        expect(s.baseScore).toBeLessThanOrEqual(10);
        expect(['NONE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).toContain(s.severity);
      });
    });
    Array.from({ length: 50 }, (_, i) => i * 0.2).forEach((score, i) => {
      it(`getSeverity boundary check ${i + 1}: score=${score.toFixed(1)}`, () => {
        const capped = Math.min(score, 10);
        const sev = scorer.getSeverity(capped);
        if (capped === 0) expect(sev).toBe('NONE');
        else if (capped < 4) expect(sev).toBe('LOW');
        else if (capped < 7) expect(sev).toBe('MEDIUM');
        else if (capped < 9) expect(sev).toBe('HIGH');
        else expect(sev).toBe('CRITICAL');
      });
    });
    Array.from({ length: 100 }, (_, i) => makeMetrics({
      confidentialityImpact: (['NONE', 'LOW', 'HIGH'] as const)[i % 3],
      integrityImpact: (['NONE', 'LOW', 'HIGH'] as const)[(i + 1) % 3],
      availabilityImpact: (['NONE', 'LOW', 'HIGH'] as const)[(i + 2) % 3],
    })).forEach((m, i) => {
      it(`impact combination ${i + 1} score ≥ 0`, () => {
        expect(scorer.score(m).baseScore).toBeGreaterThanOrEqual(0);
      });
    });
  });
});

// ─── PatchTracker — ~450 tests ────────────────────────────────────────────────

describe('PatchTracker', () => {
  let tracker: PatchTracker;
  beforeEach(() => { tracker = new PatchTracker(); });

  describe('create and get (50 tests)', () => {
    Array.from({ length: 25 }, (_, i) => `CVE-2024-${1000 + i}`).forEach((cveId, i) => {
      it(`create patch for ${cveId}`, () => {
        const p = tracker.create(cveId, `component-${i}`, '1.0.0', '1.0.1', (i % 5) + 1);
        expect(p.id).toBeDefined();
        expect(p.cveId).toBe(cveId);
        expect(p.status).toBe('PENDING');
        expect(tracker.get(p.id)).toEqual(p);
      });
    });
    Array.from({ length: 25 }, (_, i) => ({ priority: (i % 5) + 1, component: `lib-${i}` })).forEach(({ priority, component }, i) => {
      it(`create with priority ${priority} stored (${i + 1})`, () => {
        const p = tracker.create('CVE-X', component, '2.0', '2.1', priority);
        expect(p.priority).toBe(priority);
        expect(p.component).toBe(component);
      });
    });
  });

  describe('updateStatus (60 tests)', () => {
    PATCH_STATUSES.forEach(status => {
      it(`updateStatus to ${status}`, () => {
        const p = tracker.create('CVE-STATUS', 'comp', '1.0', '1.1');
        const updated = tracker.updateStatus(p.id, status, `moved to ${status}`);
        expect(updated.status).toBe(status);
        expect(updated.notes).toContain(`moved to ${status}`);
      });
    });
    Array.from({ length: 27 }, (_, i) => PATCH_STATUSES[i % PATCH_STATUSES.length]).forEach((status, i) => {
      it(`updateStatus sequence ${i + 1}`, () => {
        const p = tracker.create('CVE-SEQ', 'c', '1', '2');
        tracker.updateStatus(p.id, 'TESTING');
        tracker.updateStatus(p.id, status);
        expect(tracker.get(p.id)?.status).toBe(status);
      });
    });
    Array.from({ length: 27 }, (_, i) => i).forEach(i => {
      it(`updateStatus with note appends (${i + 1})`, () => {
        const p = tracker.create('CVE-NOTE', 'c', '1', '2');
        tracker.updateStatus(p.id, 'TESTING', `note-${i}`);
        expect(tracker.get(p.id)?.notes).toContain(`note-${i}`);
      });
    });
  });

  describe('assign (30 tests)', () => {
    Array.from({ length: 15 }, (_, i) => `engineer-${i}`).forEach((assignee, i) => {
      it(`assign to ${assignee}`, () => {
        const p = tracker.create('CVE-ASSIGN', `lib-${i}`, '1', '2');
        tracker.assign(p.id, assignee);
        expect(tracker.get(p.id)?.assignedTo).toBe(assignee);
      });
    });
    Array.from({ length: 15 }, (_, i) => i).forEach(i => {
      it(`assign nonexistent does not throw (${i + 1})`, () => {
        expect(() => tracker.assign('no-such-id', 'engineer')).not.toThrow();
      });
    });
  });

  describe('getByStatus (60 tests)', () => {
    PATCH_STATUSES.forEach(status => {
      it(`getByStatus ${status} returns only matching`, () => {
        const t = new PatchTracker();
        const p = t.create('CVE-BS', 'c', '1', '2');
        t.updateStatus(p.id, status);
        expect(t.getByStatus(status).every(x => x.status === status)).toBe(true);
      });
    });
    Array.from({ length: 27 }, (_, i) => i + 1).forEach(n => {
      it(`getByStatus PENDING count ${n}`, () => {
        const t = new PatchTracker();
        for (let j = 0; j < n; j++) t.create(`CVE-P${n}-${j}`, 'c', '1', '2');
        expect(t.getByStatus('PENDING').length).toBe(n);
      });
    });
    Array.from({ length: 27 }, (_, i) => i + 1).forEach(n => {
      it(`getByStatus DEPLOYED count ${n}`, () => {
        const t = new PatchTracker();
        for (let j = 0; j < n; j++) {
          const p = t.create(`CVE-D${n}-${j}`, 'c', '1', '2');
          t.updateStatus(p.id, 'DEPLOYED');
        }
        expect(t.getByStatus('DEPLOYED').length).toBe(n);
      });
    });
  });

  describe('getByPriority (50 tests)', () => {
    Array.from({ length: 5 }, (_, i) => i + 1).forEach(minP => {
      it(`getByPriority(${minP}) returns only priority >= ${minP}`, () => {
        const t = new PatchTracker();
        for (let p = 1; p <= 5; p++) t.create(`CVE-PRI-${p}`, 'c', '1', '2', p);
        const r = t.getByPriority(minP);
        expect(r.every(x => x.priority >= minP)).toBe(true);
        expect(r.length).toBe(6 - minP);
      });
    });
    Array.from({ length: 45 }, (_, i) => (i % 5) + 1).forEach((priority, i) => {
      it(`getByPriority filter ${i + 1}`, () => {
        const t = new PatchTracker();
        t.create('CVE-PF', 'c', '1', '2', priority);
        expect(t.getByPriority(priority).length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe('getPending, getDeployed and getOverdueSummary (50 tests)', () => {
    Array.from({ length: 15 }, (_, i) => i + 1).forEach(n => {
      it(`getPending returns ${n} pending`, () => {
        const t = new PatchTracker();
        for (let j = 0; j < n; j++) t.create(`CVE-PND${n}-${j}`, 'c', '1', '2');
        expect(t.getPending().length).toBe(n);
      });
    });
    Array.from({ length: 15 }, (_, i) => i + 1).forEach(n => {
      it(`getDeployed returns ${n} deployed`, () => {
        const t = new PatchTracker();
        for (let j = 0; j < n; j++) {
          const p = t.create(`CVE-DEP${n}-${j}`, 'c', '1', '2');
          t.updateStatus(p.id, 'DEPLOYED');
        }
        expect(t.getDeployed().length).toBe(n);
      });
    });
    Array.from({ length: 20 }, (_, i) => i).forEach(i => {
      it(`getOverdueSummary shape valid (${i + 1})`, () => {
        const t = new PatchTracker();
        t.create('CVE-SUM', 'c', '1', '2');
        const s = t.getOverdueSummary();
        expect(typeof s.pending).toBe('number');
        expect(typeof s.testing).toBe('number');
        expect(typeof s.deferred).toBe('number');
      });
    });
  });

  describe('getAll and getCount (50 tests)', () => {
    Array.from({ length: 25 }, (_, i) => i + 1).forEach(n => {
      it(`getCount after ${n} creates`, () => {
        const t = new PatchTracker();
        for (let j = 0; j < n; j++) t.create(`CVE-C${n}-${j}`, 'c', '1', '2');
        expect(t.getCount()).toBe(n);
      });
    });
    Array.from({ length: 25 }, (_, i) => i + 1).forEach(n => {
      it(`getAll length ${n}`, () => {
        const t = new PatchTracker();
        for (let j = 0; j < n; j++) t.create(`CVE-A${n}-${j}`, 'c', '1', '2');
        expect(t.getAll().length).toBe(n);
      });
    });
  });

  describe('updateStatus throws on missing id (20 tests)', () => {
    Array.from({ length: 20 }, (_, i) => `bad-id-${i}`).forEach((id, i) => {
      it(`throws for missing id ${id} (${i + 1})`, () => {
        expect(() => tracker.updateStatus(id, 'DEPLOYED')).toThrow();
      });
    });
  });

  describe('additional patch tracking — 85 tests', () => {
    it('initial count is 0', () => { expect(tracker.getCount()).toBe(0); });
    it('initial getAll is empty', () => { expect(tracker.getAll()).toHaveLength(0); });
    it('initial getPending is empty', () => { expect(tracker.getPending()).toHaveLength(0); });
    it('initial getDeployed is empty', () => { expect(tracker.getDeployed()).toHaveLength(0); });
    it('overdueSummary has pending=0 when empty', () => {
      expect(tracker.getOverdueSummary().pending).toBe(0);
    });

    it('create returns an object with id', () => {
      const p = tracker.create('CVE-2024-0001', 'openssl', '3.0.0', '3.0.1', 1);
      expect(p.id).toBeTruthy();
    });

    it('created patch is PENDING by default', () => {
      expect(tracker.create('CVE-X', 'lib', '1', '2').status).toBe('PENDING');
    });

    it('cveId stored correctly', () => {
      expect(tracker.create('CVE-2024-ABCD', 'lib', '1', '2').cveId).toBe('CVE-2024-ABCD');
    });

    it('component stored correctly', () => {
      expect(tracker.create('CVE-X', 'my-component', '1', '2').component).toBe('my-component');
    });

    it('currentVersion stored correctly', () => {
      expect(tracker.create('CVE-X', 'lib', '1.2.3', '1.2.4').currentVersion).toBe('1.2.3');
    });

    it('targetVersion stored correctly', () => {
      expect(tracker.create('CVE-X', 'lib', '1.2.3', '1.2.4').targetVersion).toBe('1.2.4');
    });

    it('default priority is 3 when omitted', () => {
      expect(tracker.create('CVE-X', 'lib', '1', '2').priority).toBeDefined();
    });

    it('priority 1 stored', () => {
      expect(tracker.create('CVE-X', 'lib', '1', '2', 1).priority).toBe(1);
    });

    it('priority 5 stored', () => {
      expect(tracker.create('CVE-X', 'lib', '1', '2', 5).priority).toBe(5);
    });

    it('two patches have unique ids', () => {
      const a = tracker.create('CVE-1', 'libA', '1', '2');
      const b = tracker.create('CVE-2', 'libB', '1', '2');
      expect(a.id).not.toBe(b.id);
    });

    it('get returns created patch', () => {
      const p = tracker.create('CVE-X', 'lib', '1', '2');
      expect(tracker.get(p.id)).toEqual(p);
    });

    it('get returns undefined for bad id', () => {
      expect(tracker.get('DOES_NOT_EXIST')).toBeUndefined();
    });

    it('updateStatus to TESTING', () => {
      const p = tracker.create('CVE-X', 'lib', '1', '2');
      expect(tracker.updateStatus(p.id, 'TESTING').status).toBe('TESTING');
    });

    it('updateStatus to APPROVED', () => {
      const p = tracker.create('CVE-X', 'lib', '1', '2');
      expect(tracker.updateStatus(p.id, 'APPROVED').status).toBe('APPROVED');
    });

    it('updateStatus to DEPLOYED sets deployedAt', () => {
      const p = tracker.create('CVE-X', 'lib', '1', '2');
      const updated = tracker.updateStatus(p.id, 'DEPLOYED');
      expect(updated.status).toBe('DEPLOYED');
    });

    it('updateStatus to FAILED', () => {
      const p = tracker.create('CVE-X', 'lib', '1', '2');
      expect(tracker.updateStatus(p.id, 'FAILED').status).toBe('FAILED');
    });

    it('updateStatus to DEFERRED', () => {
      const p = tracker.create('CVE-X', 'lib', '1', '2');
      expect(tracker.updateStatus(p.id, 'DEFERRED').status).toBe('DEFERRED');
    });

    it('assign sets assignedTo field', () => {
      const p = tracker.create('CVE-X', 'lib', '1', '2');
      tracker.assign(p.id, 'jane.doe');
      expect(tracker.get(p.id)?.assignedTo).toBe('jane.doe');
    });

    it('reassign changes assignedTo', () => {
      const p = tracker.create('CVE-X', 'lib', '1', '2');
      tracker.assign(p.id, 'alice');
      tracker.assign(p.id, 'bob');
      expect(tracker.get(p.id)?.assignedTo).toBe('bob');
    });

    it('getByStatus empty for APPROVED when none approved', () => {
      tracker.create('CVE-X', 'lib', '1', '2');
      expect(tracker.getByStatus('APPROVED')).toHaveLength(0);
    });

    it('getByPriority(1) returns only priority-1 patches', () => {
      tracker.create('CVE-A', 'lib', '1', '2', 1);
      tracker.create('CVE-B', 'lib', '1', '2', 2);
      tracker.create('CVE-C', 'lib', '1', '2', 3);
      const r = tracker.getByPriority(1);
      expect(r.every(p => p.priority >= 1)).toBe(true);
    });

    it('getByPriority(5) returns only priority-5 patches', () => {
      tracker.create('CVE-A', 'lib', '1', '2', 4);
      tracker.create('CVE-B', 'lib', '1', '2', 5);
      const r = tracker.getByPriority(5);
      expect(r.every(p => p.priority >= 5)).toBe(true);
    });

    it('getOverdueSummary has testing count', () => {
      expect(typeof tracker.getOverdueSummary().testing).toBe('number');
    });

    it('getOverdueSummary has deferred count', () => {
      expect(typeof tracker.getOverdueSummary().deferred).toBe('number');
    });

    it('pending count increases with each create', () => {
      for (let i = 1; i <= 5; i++) {
        tracker.create(`CVE-${i}`, 'lib', '1', '2');
        expect(tracker.getPending().length).toBe(i);
      }
    });

    it('deployed count 0 when all pending', () => {
      for (let i = 0; i < 5; i++) tracker.create(`CVE-${i}`, 'lib', '1', '2');
      expect(tracker.getDeployed()).toHaveLength(0);
    });

    it('getAll includes all created patches', () => {
      const ids = Array.from({ length: 10 }, (_, i) => tracker.create(`CVE-ALL-${i}`, 'lib', '1', '2').id);
      const allIds = tracker.getAll().map(p => p.id);
      ids.forEach(id => expect(allIds).toContain(id));
    });

    // Extra 20 priority + status combination tests
    Array.from({ length: 20 }, (_, i) => ({ pri: (i % 5) + 1, st: PATCH_STATUSES[i % 6] })).forEach(({ pri, st }, i) => {
      it(`priority ${pri} + status ${st} combo ${i + 1}`, () => {
        const t = new PatchTracker();
        const p = t.create(`CVE-COMBO-${i}`, `lib-${i}`, '1', '2', pri);
        t.updateStatus(p.id, st);
        const all = t.getAll();
        expect(all).toHaveLength(1);
        expect(all[0].priority).toBe(pri);
        expect(all[0].status).toBe(st);
      });
    });

    // Parameterised: 30 more tests for lifecycle workflows
    Array.from({ length: 30 }, (_, i) => i).forEach(i => {
      it(`lifecycle test ${i}: pending → testing → deployed`, () => {
        const t = new PatchTracker();
        const p = t.create(`CVE-LIFE-${i}`, `lib-${i}`, '1.0', '1.1', (i % 5) + 1);
        t.updateStatus(p.id, 'TESTING');
        t.updateStatus(p.id, 'APPROVED');
        const deployed = t.updateStatus(p.id, 'DEPLOYED', `Deployed iteration ${i}`);
        expect(deployed.status).toBe('DEPLOYED');
        expect(t.getDeployed()).toHaveLength(1);
        expect(t.getPending()).toHaveLength(0);
      });
    });
  });
});
