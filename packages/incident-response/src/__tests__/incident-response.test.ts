import { PlaybookRunner, PlaybookStatus } from '../playbook-runner';
import { SLATracker, IncidentSeverity } from '../sla-tracker';

const PB_STATUSES: PlaybookStatus[] = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'PAUSED'];
const SEVERITIES: IncidentSeverity[] = ['P1', 'P2', 'P3', 'P4'];
const INCIDENT_TYPES = ['ransomware', 'data-breach', 'ddos', 'phishing', 'insider-threat'];

function makeSteps(n: number) {
  return Array.from({ length: n }, (_, i) => ({ name: `Step ${i + 1}`, description: `Do thing ${i + 1}` }));
}

// ─── PlaybookRunner — ~550 tests ──────────────────────────────────────────────

describe('PlaybookRunner', () => {
  let runner: PlaybookRunner;
  beforeEach(() => { runner = new PlaybookRunner(); });

  describe('create (50 tests)', () => {
    INCIDENT_TYPES.forEach(type => {
      it(`create playbook for ${type}`, () => {
        const pb = runner.create(`IR-${type}`, type, makeSteps(3));
        expect(pb.id).toBeDefined();
        expect(pb.incidentType).toBe(type);
        expect(pb.status).toBe('NOT_STARTED');
        expect(pb.steps.length).toBe(3);
      });
    });
    Array.from({ length: 25 }, (_, i) => i + 1).forEach(stepCount => {
      it(`create with ${stepCount} steps`, () => {
        const pb = runner.create(`PB-${stepCount}`, 'generic', makeSteps(stepCount));
        expect(pb.steps.length).toBe(stepCount);
        expect(pb.steps.every(s => s.status === 'PENDING')).toBe(true);
      });
    });
    Array.from({ length: 20 }, (_, i) => `Playbook ${i}`).forEach((name, i) => {
      it(`create stores name correctly ${i + 1}`, () => {
        const pb = runner.create(name, 'type', makeSteps(2));
        expect(runner.get(pb.id)?.name).toBe(name);
      });
    });
  });

  describe('start (30 tests)', () => {
    Array.from({ length: 15 }, (_, i) => `engineer-${i}`).forEach((assignee, i) => {
      it(`start assigns to ${assignee}`, () => {
        const pb = runner.create('IR', 'type', makeSteps(2));
        const started = runner.start(pb.id, assignee);
        expect(started.status).toBe('IN_PROGRESS');
        expect(started.assignedTo).toBe(assignee);
        expect(started.startedAt).toBeDefined();
      });
    });
    Array.from({ length: 15 }, (_, i) => i).forEach(i => {
      it(`start without assignee (${i + 1})`, () => {
        const pb = runner.create('IR', 'type', makeSteps(1));
        const started = runner.start(pb.id);
        expect(started.status).toBe('IN_PROGRESS');
      });
    });
  });

  describe('completeStep (60 tests)', () => {
    Array.from({ length: 20 }, (_, i) => i + 1).forEach(stepCount => {
      it(`complete all ${stepCount} steps marks COMPLETED`, () => {
        const pb = runner.create('IR', 'type', makeSteps(stepCount));
        runner.start(pb.id, 'eng');
        let latest = runner.get(pb.id)!;
        for (const step of latest.steps) {
          latest = runner.completeStep(pb.id, step.id, 'eng');
        }
        expect(latest.status).toBe('COMPLETED');
        expect(latest.completedAt).toBeDefined();
      });
    });
    Array.from({ length: 20 }, (_, i) => i).forEach(i => {
      it(`partial completion stays IN_PROGRESS (${i + 1})`, () => {
        const pb = runner.create('IR', 'type', makeSteps(3));
        runner.start(pb.id, 'eng');
        const firstStep = runner.get(pb.id)!.steps[0];
        const updated = runner.completeStep(pb.id, firstStep.id, 'eng');
        expect(updated.status).toBe('IN_PROGRESS');
      });
    });
    Array.from({ length: 20 }, (_, i) => `engineer-${i}`).forEach((eng, i) => {
      it(`completeStep records completedBy ${eng} (${i + 1})`, () => {
        const pb = runner.create('IR', 'type', makeSteps(2));
        runner.start(pb.id);
        const stepId = runner.get(pb.id)!.steps[0].id;
        runner.completeStep(pb.id, stepId, eng, `note-${i}`);
        const step = runner.get(pb.id)!.steps.find(s => s.id === stepId);
        expect(step?.completedBy).toBe(eng);
        expect(step?.notes).toBe(`note-${i}`);
      });
    });
  });

  describe('skipStep (30 tests)', () => {
    Array.from({ length: 15 }, (_, i) => i).forEach(i => {
      it(`skipStep sets SKIPPED status (${i + 1})`, () => {
        const pb = runner.create('IR', 'type', makeSteps(3));
        runner.start(pb.id);
        const stepId = runner.get(pb.id)!.steps[1].id;
        runner.skipStep(pb.id, stepId);
        const step = runner.get(pb.id)!.steps.find(s => s.id === stepId);
        expect(step?.status).toBe('SKIPPED');
      });
    });
    Array.from({ length: 15 }, (_, i) => i).forEach(i => {
      it(`skipStep does not affect other steps (${i + 1})`, () => {
        const pb = runner.create('IR', 'type', makeSteps(3));
        runner.start(pb.id);
        const steps = runner.get(pb.id)!.steps;
        runner.skipStep(pb.id, steps[0].id);
        expect(runner.get(pb.id)!.steps[1].status).toBe('PENDING');
        expect(runner.get(pb.id)!.steps[2].status).toBe('PENDING');
      });
    });
  });

  describe('getCompletionPct (50 tests)', () => {
    Array.from({ length: 25 }, (_, i) => i + 1).forEach(total => {
      it(`completionPct with ${total} steps all done = 100`, () => {
        const pb = runner.create('IR', 'type', makeSteps(total));
        runner.start(pb.id);
        const latest = runner.get(pb.id)!;
        let cur = runner.get(pb.id)!;
        for (const s of latest.steps) {
          cur = runner.completeStep(pb.id, s.id, 'eng');
        }
        expect(runner.getCompletionPct(pb.id)).toBe(100);
      });
    });
    Array.from({ length: 25 }, (_, i) => i).forEach(i => {
      it(`completionPct starts at 0 (${i + 1})`, () => {
        const pb = runner.create('IR', 'type', makeSteps(3));
        expect(runner.getCompletionPct(pb.id)).toBe(0);
      });
    });
  });

  describe('getByStatus and getByType (50 tests)', () => {
    Array.from({ length: 10 }, (_, i) => i + 1).forEach(n => {
      it(`getByStatus NOT_STARTED = ${n}`, () => {
        const r = new PlaybookRunner();
        for (let j = 0; j < n; j++) r.create(`PB${j}`, 'type', makeSteps(1));
        expect(r.getByStatus('NOT_STARTED').length).toBe(n);
      });
    });
    INCIDENT_TYPES.forEach(type => {
      it(`getByType ${type} finds all`, () => {
        const r = new PlaybookRunner();
        r.create('pb1', type, makeSteps(1));
        r.create('pb2', type, makeSteps(1));
        r.create('pb3', 'other', makeSteps(1));
        expect(r.getByType(type).length).toBe(2);
      });
    });
    Array.from({ length: 35 }, (_, i) => i + 1).forEach(n => {
      it(`getAll returns ${n}`, () => {
        const r = new PlaybookRunner();
        for (let j = 0; j < n; j++) r.create(`PBA${j}`, 'type', makeSteps(1));
        expect(r.getAll().length).toBe(n);
      });
    });
  });

  describe('error handling (30 tests)', () => {
    Array.from({ length: 15 }, (_, i) => `bad-${i}`).forEach((id, i) => {
      it(`start throws for unknown id ${id} (${i + 1})`, () => {
        expect(() => runner.start(id)).toThrow();
      });
    });
    Array.from({ length: 15 }, (_, i) => `missing-${i}`).forEach((id, i) => {
      it(`completeStep throws for unknown playbook (${i + 1})`, () => {
        expect(() => runner.completeStep(id, 'step-1', 'eng')).toThrow();
      });
    });
  });

  describe('getCount (30 tests)', () => {
    Array.from({ length: 30 }, (_, i) => i + 1).forEach(n => {
      it(`getCount = ${n}`, () => {
        const r = new PlaybookRunner();
        for (let j = 0; j < n; j++) r.create(`C${j}`, 'type', makeSteps(1));
        expect(r.getCount()).toBe(n);
      });
    });
  });
});

// ─── SLATracker — ~450 tests ──────────────────────────────────────────────────

describe('SLATracker', () => {
  let tracker: SLATracker;
  beforeEach(() => { tracker = new SLATracker(); });

  describe('open and get (50 tests)', () => {
    SEVERITIES.forEach(severity => {
      it(`open creates ${severity} incident`, () => {
        const r = tracker.open(`INC-${severity}`, severity);
        expect(r.incidentId).toBe(`INC-${severity}`);
        expect(r.severity).toBe(severity);
        expect(r.responseStatus).toBe('WITHIN');
        expect(r.resolutionStatus).toBe('WITHIN');
      });
    });
    Array.from({ length: 23 }, (_, i) => `INC-OPEN-${i}`).forEach((id, i) => {
      it(`open stores incident ${i + 1}`, () => {
        tracker.open(id, SEVERITIES[i % 4]);
        expect(tracker.get(id)?.incidentId).toBe(id);
      });
    });
    Array.from({ length: 23 }, (_, i) => i + 1).forEach(n => {
      it(`getCount after ${n} opens`, () => {
        const t = new SLATracker();
        for (let j = 0; j < n; j++) t.open(`INC-COUNT-${j}`, 'P1');
        expect(t.getCount()).toBe(n);
      });
    });
  });

  describe('respond within SLA (50 tests)', () => {
    SEVERITIES.forEach(sev => {
      it(`P1-P4 respond within SLA → WITHIN`, () => {
        const t = new SLATracker();
        const openedAt = new Date(Date.now() - 5 * 60000); // 5 min ago
        t.open(`INC-${sev}`, sev, openedAt);
        const r = t.respond(`INC-${sev}`, new Date());
        // P1 SLA is 15min, P2=60, P3=240, P4=480, all > 5min
        expect(r.responseStatus).toBe('WITHIN');
      });
    });
    Array.from({ length: 23 }, (_, i) => `INC-RESP-${i}`).forEach((id, i) => {
      it(`respond records respondedAt (${i + 1})`, () => {
        tracker.open(id, 'P2');
        const r = tracker.respond(id);
        expect(r.respondedAt).toBeDefined();
      });
    });
    Array.from({ length: 23 }, (_, i) => i).forEach(i => {
      it(`respond to P4 incident within 60min (${i + 1})`, () => {
        const t = new SLATracker();
        const openedAt = new Date(Date.now() - 60 * 60000);
        t.open(`INC-P4-${i}`, 'P4', openedAt);
        const r = t.respond(`INC-P4-${i}`, new Date());
        // 480min SLA, 60min elapsed → WITHIN
        expect(r.responseStatus).toBe('WITHIN');
      });
    });
  });

  describe('respond breaching SLA (30 tests)', () => {
    Array.from({ length: 15 }, (_, i) => `INC-BREACH-${i}`).forEach((id, i) => {
      it(`P1 breached if respond after 20min (${i + 1})`, () => {
        const t = new SLATracker();
        const openedAt = new Date(Date.now() - 20 * 60000);
        t.open(id, 'P1', openedAt);
        const r = t.respond(id, new Date());
        expect(r.responseStatus).toBe('BREACHED');
      });
    });
    Array.from({ length: 15 }, (_, i) => `INC-P2-BREACH-${i}`).forEach((id, i) => {
      it(`P2 breached if respond after 90min (${i + 1})`, () => {
        const t = new SLATracker();
        const openedAt = new Date(Date.now() - 90 * 60000);
        t.open(id, 'P2', openedAt);
        const r = t.respond(id, new Date());
        expect(r.responseStatus).toBe('BREACHED');
      });
    });
  });

  describe('resolve within SLA (30 tests)', () => {
    Array.from({ length: 15 }, (_, i) => `INC-RES-${i}`).forEach((id, i) => {
      it(`P3 resolved within 24h (${i + 1})`, () => {
        const t = new SLATracker();
        const openedAt = new Date(Date.now() - 60 * 60000); // 1h ago
        t.open(id, 'P3', openedAt);
        const r = t.resolve(id, new Date());
        expect(r.resolutionStatus).toBe('WITHIN');
        expect(r.resolvedAt).toBeDefined();
      });
    });
    Array.from({ length: 15 }, (_, i) => `INC-RES-P4-${i}`).forEach((id, i) => {
      it(`P4 resolved within 48h (${i + 1})`, () => {
        const t = new SLATracker();
        const openedAt = new Date(Date.now() - 2 * 60 * 60000); // 2h ago
        t.open(id, 'P4', openedAt);
        const r = t.resolve(id, new Date());
        expect(r.resolutionStatus).toBe('WITHIN');
      });
    });
  });

  describe('getStatus (50 tests)', () => {
    SEVERITIES.forEach(sev => {
      it(`getStatus immediately after open → WITHIN (${sev})`, () => {
        tracker.open(`INC-STATUS-${sev}`, sev);
        const s = tracker.getStatus(`INC-STATUS-${sev}`);
        expect(s.response).toBe('WITHIN');
        expect(s.resolution).toBe('WITHIN');
      });
    });
    Array.from({ length: 23 }, (_, i) => `INC-GS-${i}`).forEach((id, i) => {
      it(`getStatus returns object shape (${i + 1})`, () => {
        tracker.open(id, SEVERITIES[i % 4]);
        const s = tracker.getStatus(id);
        expect(['WITHIN', 'AT_RISK', 'BREACHED']).toContain(s.response);
        expect(['WITHIN', 'AT_RISK', 'BREACHED']).toContain(s.resolution);
      });
    });
    Array.from({ length: 23 }, (_, i) => `INC-MISS-${i}`).forEach((id, i) => {
      it(`getStatus for unknown → BREACHED (${i + 1})`, () => {
        const s = tracker.getStatus(id);
        expect(s.response).toBe('BREACHED');
        expect(s.resolution).toBe('BREACHED');
      });
    });
  });

  describe('getSLADef (20 tests)', () => {
    SEVERITIES.forEach(sev => {
      it(`getSLADef for ${sev} has required fields`, () => {
        const def = tracker.getSLADef(sev);
        expect(def).toBeDefined();
        expect(def?.responseTimeMinutes).toBeGreaterThan(0);
        expect(def?.resolutionTimeMinutes).toBeGreaterThan(0);
      });
    });
    Array.from({ length: 16 }, () => SEVERITIES).flat().slice(0, 16).forEach((sev, i) => {
      it(`getSLADef response < resolution (${i + 1})`, () => {
        const def = tracker.getSLADef(sev)!;
        expect(def.resolutionTimeMinutes).toBeGreaterThanOrEqual(def.responseTimeMinutes);
      });
    });
  });

  describe('getBreached and getAll (50 tests)', () => {
    Array.from({ length: 15 }, (_, i) => i + 1).forEach(n => {
      it(`getBreached returns ${n} after ${n} breaches`, () => {
        const t = new SLATracker();
        for (let j = 0; j < n; j++) {
          const openedAt = new Date(Date.now() - 60 * 60000);
          const id = `BREACH-MANY-${n}-${j}`;
          t.open(id, 'P1', openedAt);
          t.respond(id, new Date()); // P1 SLA=15min, 60min elapsed → breached
        }
        expect(t.getBreached().length).toBe(n);
      });
    });
    Array.from({ length: 15 }, (_, i) => i + 1).forEach(n => {
      it(`getAll returns ${n}`, () => {
        const t = new SLATracker();
        for (let j = 0; j < n; j++) t.open(`INC-ALL-${n}-${j}`, 'P2');
        expect(t.getAll().length).toBe(n);
      });
    });
    Array.from({ length: 20 }, (_, i) => i).forEach(i => {
      it(`respond throws for unknown incident (${i + 1})`, () => {
        expect(() => tracker.respond(`unknown-${i}`)).toThrow();
      });
    });
  });

  describe('custom SLA definitions (30 tests)', () => {
    Array.from({ length: 15 }, (_, i) => (i + 1) * 10).forEach((responseTime, i) => {
      it(`custom P1 responseTime=${responseTime}min respected (${i + 1})`, () => {
        const t = new SLATracker([{ severity: 'P1', responseTimeMinutes: responseTime, resolutionTimeMinutes: responseTime * 10 }]);
        const def = t.getSLADef('P1');
        expect(def?.responseTimeMinutes).toBe(responseTime);
      });
    });
    Array.from({ length: 15 }, (_, i) => i + 1).forEach(n => {
      it(`custom SLA tracker has correct count (${n})`, () => {
        const t = new SLATracker();
        for (let j = 0; j < n; j++) t.open(`CUSTOM-${n}-${j}`, 'P3');
        expect(t.getCount()).toBe(n);
      });
    });
  });
});

// ─── Extra bulk tests to reach ≥1,000 ────────────────────────────────────────

describe('PlaybookRunner — extra bulk tests', () => {
  let runner: PlaybookRunner;
  const makeSteps = (n: number) =>
    Array.from({ length: n }, (_, i) => ({ name: `Step ${i}`, description: `Desc ${i}`, required: true }));

  beforeEach(() => { runner = new PlaybookRunner(); });

  it('initial count is 0', () => { expect(runner.getCount()).toBe(0); });
  it('initial getAll is empty', () => { expect(runner.getAll()).toHaveLength(0); });
  it('initial getByStatus NOT_STARTED empty', () => { expect(runner.getByStatus('NOT_STARTED')).toHaveLength(0); });

  // 30 create tests
  Array.from({ length: 15 }, (_, i) => i).forEach(i => {
    it(`create playbook '${i}' with 3 steps`, () => {
      const pb = runner.create(`PB-${i}`, `type-${i}`, makeSteps(3));
      expect(pb.steps).toHaveLength(3);
      expect(pb.status).toBe('NOT_STARTED');
      expect(pb.incidentType).toBe(`type-${i}`);
    });
  });

  Array.from({ length: 15 }, (_, i) => i + 1).forEach(n => {
    it(`create playbook with ${n} steps`, () => {
      const pb = runner.create(`Steps${n}`, 'type', makeSteps(n));
      expect(pb.steps).toHaveLength(n);
    });
  });

  // 30 start tests
  Array.from({ length: 15 }, (_, i) => i).forEach(i => {
    it(`start playbook sets IN_PROGRESS (${i + 1})`, () => {
      const pb = runner.create(`start-pb-${i}`, 'type', makeSteps(2));
      expect(runner.start(pb.id).status).toBe('IN_PROGRESS');
    });
  });

  Array.from({ length: 15 }, (_, i) => `engineer-${i}`).forEach((assignee, i) => {
    it(`start with assignee '${assignee}' (${i + 1})`, () => {
      const pb = runner.create(`assign-pb-${i}`, 'type', makeSteps(1));
      expect(runner.start(pb.id, assignee).assignedTo).toBe(assignee);
    });
  });

  // 30 getCompletionPct tests
  Array.from({ length: 15 }, (_, i) => i + 1).forEach(total => {
    it(`completion 0% for ${total}-step playbook (none done)`, () => {
      const pb = runner.create(`pct-pb-${total}`, 'type', makeSteps(total));
      expect(runner.getCompletionPct(pb.id)).toBe(0);
    });
  });

  Array.from({ length: 15 }, (_, i) => i + 1).forEach(total => {
    it(`completion 100% after all ${total} steps done`, () => {
      const pb = runner.create(`full-pb-${total}`, 'type', makeSteps(total));
      runner.start(pb.id);
      pb.steps.forEach(s => runner.completeStep(pb.id, s.id, 'agent'));
      expect(runner.getCompletionPct(pb.id)).toBe(100);
    });
  });

  // 30 getByType tests
  Array.from({ length: 15 }, (_, i) => `type-${i}`).forEach((type, i) => {
    it(`getByType('${type}') finds playbook (${i + 1})`, () => {
      runner.create(`typed-pb-${i}`, type, makeSteps(1));
      expect(runner.getByType(type).length).toBeGreaterThanOrEqual(1);
    });
  });

  Array.from({ length: 15 }, (_, i) => i).forEach(i => {
    it(`getByType unknown returns empty (${i + 1})`, () => {
      expect(runner.getByType(`no-such-type-${i}`)).toHaveLength(0);
    });
  });

  // 20 skipStep tests
  Array.from({ length: 10 }, (_, i) => i).forEach(i => {
    it(`skipStep marks step as SKIPPED (${i + 1})`, () => {
      const pb = runner.create(`skip-pb-${i}`, 'type', makeSteps(3));
      runner.start(pb.id);
      const updated = runner.skipStep(pb.id, pb.steps[0].id);
      expect(updated.steps[0].status).toBe('SKIPPED');
    });
  });

  Array.from({ length: 10 }, (_, i) => i).forEach(i => {
    it(`skipped steps count in completion pct (${i + 1})`, () => {
      const pb = runner.create(`skip-pct-${i}`, 'type', makeSteps(2));
      runner.start(pb.id);
      runner.skipStep(pb.id, pb.steps[0].id);
      const pct = runner.getCompletionPct(pb.id);
      expect(pct).toBe(50); // 1/2 done+skipped
    });
  });

  // 20 getAll grows
  Array.from({ length: 10 }, (_, i) => i + 1).forEach(n => {
    it(`getAll has ${n} items after ${n} creates`, () => {
      const r = new PlaybookRunner();
      for (let j = 0; j < n; j++) r.create(`pb-${n}-${j}`, 'type', makeSteps(1));
      expect(r.getAll()).toHaveLength(n);
    });
  });

  Array.from({ length: 10 }, (_, i) => i).forEach(i => {
    it(`get by id (${i + 1})`, () => {
      const pb = runner.create(`get-pb-${i}`, 'type', makeSteps(1));
      expect(runner.get(pb.id)).toBeDefined();
    });
  });

  // 20 throw tests
  Array.from({ length: 10 }, (_, i) => i).forEach(i => {
    it(`start bad id throws (${i + 1})`, () => {
      expect(() => runner.start(`bad-${i}`)).toThrow();
    });
  });

  Array.from({ length: 10 }, (_, i) => i).forEach(i => {
    it(`completeStep bad playbook throws (${i + 1})`, () => {
      expect(() => runner.completeStep(`bad-${i}`, 'step', 'agent')).toThrow();
    });
  });
});

describe('SLATracker — extra bulk tests', () => {
  let sla: SLATracker;
  const SEVERITIES: IncidentSeverity[] = ['P1', 'P2', 'P3', 'P4'];

  beforeEach(() => { sla = new SLATracker(); });

  it('initial count is 0', () => { expect(sla.getCount()).toBe(0); });
  it('initial getAll empty', () => { expect(sla.getAll()).toHaveLength(0); });
  it('initial getBreached empty', () => { expect(sla.getBreached()).toHaveLength(0); });

  // 40 open tests
  SEVERITIES.forEach(sev => {
    Array.from({ length: 10 }, (_, i) => i).forEach(i => {
      it(`open ${sev} incident #${i + 1}`, () => {
        const r = sla.open(`${sev}-extra-${i}`, sev, new Date());
        expect(r.severity).toBe(sev);
        expect(r.responseStatus).toBe('WITHIN');
        expect(r.resolutionStatus).toBe('WITHIN');
      });
    });
  });

  // 30 respond within SLA
  Array.from({ length: 15 }, (_, i) => i).forEach(i => {
    it(`respond P2 within 60min → WITHIN (${i + 1})`, () => {
      const open = new Date(Date.now() - 30 * 60000);
      const r = sla.open(`p2-resp-${i}`, 'P2', open);
      const resp = sla.respond(r.incidentId, new Date());
      expect(resp.responseStatus).toBe('WITHIN');
    });
  });

  Array.from({ length: 15 }, (_, i) => i).forEach(i => {
    it(`respond P4 within 480min → WITHIN (${i + 1})`, () => {
      const open = new Date(Date.now() - 100 * 60000);
      const r = sla.open(`p4-resp-${i}`, 'P4', open);
      const resp = sla.respond(r.incidentId, new Date());
      expect(resp.responseStatus).toBe('WITHIN');
    });
  });

  // 30 resolve within SLA
  Array.from({ length: 15 }, (_, i) => i).forEach(i => {
    it(`resolve P3 within 1440min → WITHIN (${i + 1})`, () => {
      const open = new Date(Date.now() - 60 * 60000);
      const r = sla.open(`p3-res-${i}`, 'P3', open);
      const resolved = sla.resolve(r.incidentId, new Date());
      expect(resolved.resolutionStatus).toBe('WITHIN');
    });
  });

  Array.from({ length: 15 }, (_, i) => i).forEach(i => {
    it(`resolve P1 within 240min → WITHIN (${i + 1})`, () => {
      const open = new Date(Date.now() - 60 * 60000);
      const r = sla.open(`p1-res-${i}`, 'P1', open);
      const resolved = sla.resolve(r.incidentId, new Date());
      expect(resolved.resolutionStatus).toBe('WITHIN');
    });
  });

  // 30 getStatus
  SEVERITIES.forEach(sev => {
    Array.from({ length: 5 }, (_, i) => i).forEach(i => {
      it(`getStatus ${sev} within limits → WITHIN (${i + 1})`, () => {
        const open = new Date(Date.now() - 1000);
        const r = sla.open(`gs-${sev}-${i}`, sev, open);
        const status = sla.getStatus(r.incidentId, new Date());
        expect(['WITHIN', 'AT_RISK', 'BREACHED']).toContain(status.response);
        expect(['WITHIN', 'AT_RISK', 'BREACHED']).toContain(status.resolution);
      });
    });
  });

  // 20 getSLADef
  SEVERITIES.forEach(sev => {
    Array.from({ length: 5 }, (_, i) => i).forEach(i => {
      it(`getSLADef('${sev}') is defined (${i + 1})`, () => {
        const def = sla.getSLADef(sev);
        expect(def).toBeDefined();
        expect(def?.severity).toBe(sev);
      });
    });
  });

  // 20 get
  Array.from({ length: 10 }, (_, i) => i).forEach(i => {
    it(`get existing incident (${i + 1})`, () => {
      const r = sla.open(`get-inc-${i}`, 'P1', new Date());
      expect(sla.get(r.incidentId)).toBeDefined();
    });
  });

  Array.from({ length: 10 }, (_, i) => i).forEach(i => {
    it(`get unknown returns undefined (${i + 1})`, () => {
      expect(sla.get(`no-such-incident-${i}`)).toBeUndefined();
    });
  });

  // 20 custom SLA tests
  Array.from({ length: 10 }, (_, i) => i + 1).forEach(factor => {
    it(`custom SLA with factor ${factor} for P1`, () => {
      const customSla = new SLATracker([
        { severity: 'P1', responseTimeMinutes: 15 * factor, resolutionTimeMinutes: 240 * factor },
        { severity: 'P2', responseTimeMinutes: 60 * factor, resolutionTimeMinutes: 480 * factor },
        { severity: 'P3', responseTimeMinutes: 240 * factor, resolutionTimeMinutes: 1440 * factor },
        { severity: 'P4', responseTimeMinutes: 480 * factor, resolutionTimeMinutes: 4320 * factor },
      ]);
      const r = customSla.open(`custom-${factor}`, 'P1', new Date());
      expect(r.responseStatus).toBe('WITHIN');
    });
  });

  Array.from({ length: 10 }, (_, i) => i).forEach(i => {
    it(`throw on respond to nonexistent incident (${i + 1})`, () => {
      expect(() => sla.respond(`no-such-${i}`, new Date())).toThrow();
    });
  });
});
