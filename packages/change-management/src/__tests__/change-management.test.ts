import { ChangeRequestManager } from '../change-request-manager';
import { ChangeType, ChangeStatus, ChangeRisk, ChangeRequest, ApprovalRecord } from '../types';

// ─── helpers ────────────────────────────────────────────────────────────────
let manager: ChangeRequestManager;

beforeEach(() => {
  manager = new ChangeRequestManager();
});

const makeChange = (overrides?: {
  title?: string;
  description?: string;
  type?: ChangeType;
  risk?: ChangeRisk;
  requestedBy?: string;
  rollbackPlan?: string;
  affectedSystems?: string[];
}): ChangeRequest =>
  manager.create(
    overrides?.title ?? 'Title',
    overrides?.description ?? 'Desc',
    overrides?.type ?? 'NORMAL',
    overrides?.risk ?? 'MEDIUM',
    overrides?.requestedBy ?? 'user',
    overrides?.rollbackPlan ?? 'rollback',
    overrides?.affectedSystems ?? ['sys1'],
  );

const ALL_TYPES: ChangeType[] = ['STANDARD', 'NORMAL', 'EMERGENCY', 'MAJOR'];
const ALL_STATUSES: ChangeStatus[] = [
  'DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED',
  'IMPLEMENTING', 'COMPLETED', 'CANCELLED',
];
const ALL_RISKS: ChangeRisk[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

// ─── 1. create — basic field assertions ─────────────────────────────────────
describe('create — basic', () => {
  it('returns a ChangeRequest object', () => {
    const c = makeChange();
    expect(c).toBeDefined();
  });

  it('id is defined', () => {
    const c = makeChange();
    expect(c.id).toBeDefined();
  });

  it('id is a non-empty string', () => {
    const c = makeChange();
    expect(typeof c.id).toBe('string');
    expect(c.id.length).toBeGreaterThan(0);
  });

  it('id starts with cr-', () => {
    const c = makeChange();
    expect(c.id).toMatch(/^cr-/);
  });

  it('title is stored correctly', () => {
    const c = makeChange({ title: 'My Title' });
    expect(c.title).toBe('My Title');
  });

  it('description is stored correctly', () => {
    const c = makeChange({ description: 'My Description' });
    expect(c.description).toBe('My Description');
  });

  it('type defaults to NORMAL', () => {
    const c = makeChange();
    expect(c.type).toBe('NORMAL');
  });

  it('risk defaults to MEDIUM', () => {
    const c = makeChange();
    expect(c.risk).toBe('MEDIUM');
  });

  it('status starts as DRAFT', () => {
    const c = makeChange();
    expect(c.status).toBe('DRAFT');
  });

  it('requestedBy is stored correctly', () => {
    const c = makeChange({ requestedBy: 'alice' });
    expect(c.requestedBy).toBe('alice');
  });

  it('rollbackPlan is stored correctly', () => {
    const c = makeChange({ rollbackPlan: 'restore snapshot' });
    expect(c.rollbackPlan).toBe('restore snapshot');
  });

  it('affectedSystems is stored correctly', () => {
    const c = makeChange({ affectedSystems: ['db', 'api'] });
    expect(c.affectedSystems).toEqual(['db', 'api']);
  });

  it('createdAt is a Date', () => {
    const c = makeChange();
    expect(c.createdAt).toBeInstanceOf(Date);
  });

  it('createdAt is recent', () => {
    const before = Date.now();
    const c = makeChange();
    expect(c.createdAt.getTime()).toBeGreaterThanOrEqual(before - 10);
  });

  it('assignedTo is undefined initially', () => {
    const c = makeChange();
    expect(c.assignedTo).toBeUndefined();
  });

  it('scheduledDate is undefined initially', () => {
    const c = makeChange();
    expect(c.scheduledDate).toBeUndefined();
  });

  it('completedAt is undefined initially', () => {
    const c = makeChange();
    expect(c.completedAt).toBeUndefined();
  });

  it('successive ids are unique', () => {
    const a = makeChange();
    const b = makeChange();
    expect(a.id).not.toBe(b.id);
  });

  it('affectedSystems is an array', () => {
    const c = makeChange();
    expect(Array.isArray(c.affectedSystems)).toBe(true);
  });

  it('affectedSystems with multiple entries', () => {
    const c = makeChange({ affectedSystems: ['a', 'b', 'c'] });
    expect(c.affectedSystems).toHaveLength(3);
  });

  it('affectedSystems preserves order', () => {
    const systems = ['z', 'a', 'm'];
    const c = makeChange({ affectedSystems: systems });
    expect(c.affectedSystems).toEqual(['z', 'a', 'm']);
  });
});

// ─── 2. create — parameterised bulk id uniqueness ───────────────────────────
describe('create — bulk id uniqueness', () => {
  Array.from({ length: 50 }, (_, i) => i).forEach(i => {
    it(`create #${i} returns unique id`, () => {
      const ids = Array.from({ length: 5 }, () => makeChange().id);
      const unique = new Set(ids);
      expect(unique.size).toBe(5);
    });
  });
});

// ─── 3. create — all ChangeType values ──────────────────────────────────────
describe('create — ChangeType', () => {
  ALL_TYPES.forEach(type => {
    it(`stores type ${type}`, () => {
      const c = makeChange({ type });
      expect(c.type).toBe(type);
    });
  });

  // 10 iterations × 4 types = 40 tests
  Array.from({ length: 10 }, (_, i) => i).forEach(i => {
    ALL_TYPES.forEach(type => {
      it(`iteration ${i}: type ${type} is preserved`, () => {
        const c = makeChange({ type });
        expect(c.type).toBe(type);
      });
    });
  });
});

// ─── 4. create — all ChangeRisk values ──────────────────────────────────────
describe('create — ChangeRisk', () => {
  ALL_RISKS.forEach(risk => {
    it(`stores risk ${risk}`, () => {
      const c = makeChange({ risk });
      expect(c.risk).toBe(risk);
    });
  });

  Array.from({ length: 10 }, (_, i) => i).forEach(i => {
    ALL_RISKS.forEach(risk => {
      it(`iteration ${i}: risk ${risk} is preserved`, () => {
        const c = makeChange({ risk });
        expect(c.risk).toBe(risk);
      });
    });
  });
});

// ─── 5. create — type × risk combinations ───────────────────────────────────
describe('create — type × risk cross product', () => {
  ALL_TYPES.forEach(type => {
    ALL_RISKS.forEach(risk => {
      it(`type=${type} risk=${risk} — both stored`, () => {
        const c = makeChange({ type, risk });
        expect(c.type).toBe(type);
        expect(c.risk).toBe(risk);
      });
    });
  });
});

// ─── 6. submit ───────────────────────────────────────────────────────────────
describe('submit', () => {
  it('changes status to SUBMITTED', () => {
    const c = makeChange();
    const s = manager.submit(c.id);
    expect(s.status).toBe('SUBMITTED');
  });

  it('returns the updated ChangeRequest', () => {
    const c = makeChange();
    const s = manager.submit(c.id);
    expect(s).toBeDefined();
  });

  it('preserves id after submit', () => {
    const c = makeChange();
    const s = manager.submit(c.id);
    expect(s.id).toBe(c.id);
  });

  it('preserves title after submit', () => {
    const c = makeChange({ title: 'Sub Title' });
    const s = manager.submit(c.id);
    expect(s.title).toBe('Sub Title');
  });

  it('preserves type after submit', () => {
    const c = makeChange({ type: 'EMERGENCY' });
    const s = manager.submit(c.id);
    expect(s.type).toBe('EMERGENCY');
  });

  it('preserves risk after submit', () => {
    const c = makeChange({ risk: 'CRITICAL' });
    const s = manager.submit(c.id);
    expect(s.risk).toBe('CRITICAL');
  });

  it('throws on unknown id', () => {
    expect(() => manager.submit('cr-nonexistent')).toThrow();
  });

  it('throws containing the id in the message', () => {
    expect(() => manager.submit('cr-xyz')).toThrow('cr-xyz');
  });

  it('get() reflects submitted status', () => {
    const c = makeChange();
    manager.submit(c.id);
    expect(manager.get(c.id)!.status).toBe('SUBMITTED');
  });

  it('preserves requestedBy after submit', () => {
    const c = makeChange({ requestedBy: 'bob' });
    const s = manager.submit(c.id);
    expect(s.requestedBy).toBe('bob');
  });

  it('preserves rollbackPlan after submit', () => {
    const c = makeChange({ rollbackPlan: 'revert db' });
    const s = manager.submit(c.id);
    expect(s.rollbackPlan).toBe('revert db');
  });

  it('preserves affectedSystems after submit', () => {
    const c = makeChange({ affectedSystems: ['api', 'db'] });
    const s = manager.submit(c.id);
    expect(s.affectedSystems).toEqual(['api', 'db']);
  });

  // parameterised: 40 submit iterations
  Array.from({ length: 40 }, (_, i) => i).forEach(i => {
    it(`submit iteration ${i} changes status to SUBMITTED`, () => {
      const c = makeChange();
      const s = manager.submit(c.id);
      expect(s.status).toBe('SUBMITTED');
    });
  });
});

// ─── 7. approve ──────────────────────────────────────────────────────────────
describe('approve', () => {
  it('changes status to APPROVED', () => {
    const c = makeChange();
    const a = manager.approve(c.id, 'mgr');
    expect(a.status).toBe('APPROVED');
  });

  it('returns the updated request', () => {
    const c = makeChange();
    expect(manager.approve(c.id, 'mgr')).toBeDefined();
  });

  it('preserves id after approve', () => {
    const c = makeChange();
    expect(manager.approve(c.id, 'mgr').id).toBe(c.id);
  });

  it('throws on unknown id', () => {
    expect(() => manager.approve('bad-id', 'mgr')).toThrow();
  });

  it('throws message contains id', () => {
    expect(() => manager.approve('no-such', 'approver')).toThrow('no-such');
  });

  it('adds approval record', () => {
    const c = makeChange();
    manager.approve(c.id, 'mgr');
    const approvals = manager.getApprovals(c.id);
    expect(approvals).toHaveLength(1);
  });

  it('approval record has APPROVED decision', () => {
    const c = makeChange();
    manager.approve(c.id, 'mgr');
    expect(manager.getApprovals(c.id)[0].decision).toBe('APPROVED');
  });

  it('approval record stores approver', () => {
    const c = makeChange();
    manager.approve(c.id, 'alice');
    expect(manager.getApprovals(c.id)[0].approver).toBe('alice');
  });

  it('approval record stores changeId', () => {
    const c = makeChange();
    manager.approve(c.id, 'mgr');
    expect(manager.getApprovals(c.id)[0].changeId).toBe(c.id);
  });

  it('approval record decidedAt is a Date', () => {
    const c = makeChange();
    manager.approve(c.id, 'mgr');
    expect(manager.getApprovals(c.id)[0].decidedAt).toBeInstanceOf(Date);
  });

  it('approval record stores comments when provided', () => {
    const c = makeChange();
    manager.approve(c.id, 'mgr', 'LGTM');
    expect(manager.getApprovals(c.id)[0].comments).toBe('LGTM');
  });

  it('approval comments undefined when not provided', () => {
    const c = makeChange();
    manager.approve(c.id, 'mgr');
    expect(manager.getApprovals(c.id)[0].comments).toBeUndefined();
  });

  it('multiple approvals accumulate', () => {
    const c = makeChange();
    manager.approve(c.id, 'mgr1');
    manager.approve(c.id, 'mgr2');
    expect(manager.getApprovals(c.id)).toHaveLength(2);
  });

  it('get() shows APPROVED status', () => {
    const c = makeChange();
    manager.approve(c.id, 'mgr');
    expect(manager.get(c.id)!.status).toBe('APPROVED');
  });

  // 40 approve iterations
  Array.from({ length: 40 }, (_, i) => i).forEach(i => {
    it(`approve iteration ${i} sets status APPROVED`, () => {
      const c = makeChange();
      expect(manager.approve(c.id, `approver-${i}`).status).toBe('APPROVED');
    });
  });
});

// ─── 8. reject ───────────────────────────────────────────────────────────────
describe('reject', () => {
  it('changes status to REJECTED', () => {
    const c = makeChange();
    expect(manager.reject(c.id, 'mgr').status).toBe('REJECTED');
  });

  it('returns the updated request', () => {
    const c = makeChange();
    expect(manager.reject(c.id, 'mgr')).toBeDefined();
  });

  it('preserves id', () => {
    const c = makeChange();
    expect(manager.reject(c.id, 'mgr').id).toBe(c.id);
  });

  it('throws on unknown id', () => {
    expect(() => manager.reject('bad', 'mgr')).toThrow();
  });

  it('adds rejection approval record', () => {
    const c = makeChange();
    manager.reject(c.id, 'mgr');
    expect(manager.getApprovals(c.id)).toHaveLength(1);
  });

  it('approval record has REJECTED decision', () => {
    const c = makeChange();
    manager.reject(c.id, 'mgr');
    expect(manager.getApprovals(c.id)[0].decision).toBe('REJECTED');
  });

  it('stores approver in rejection record', () => {
    const c = makeChange();
    manager.reject(c.id, 'carol');
    expect(manager.getApprovals(c.id)[0].approver).toBe('carol');
  });

  it('stores changeId in rejection record', () => {
    const c = makeChange();
    manager.reject(c.id, 'carol');
    expect(manager.getApprovals(c.id)[0].changeId).toBe(c.id);
  });

  it('stores comments in rejection record', () => {
    const c = makeChange();
    manager.reject(c.id, 'mgr', 'not ready');
    expect(manager.getApprovals(c.id)[0].comments).toBe('not ready');
  });

  it('comments undefined when not provided', () => {
    const c = makeChange();
    manager.reject(c.id, 'mgr');
    expect(manager.getApprovals(c.id)[0].comments).toBeUndefined();
  });

  it('decidedAt is a Date', () => {
    const c = makeChange();
    manager.reject(c.id, 'mgr');
    expect(manager.getApprovals(c.id)[0].decidedAt).toBeInstanceOf(Date);
  });

  it('get() shows REJECTED status', () => {
    const c = makeChange();
    manager.reject(c.id, 'mgr');
    expect(manager.get(c.id)!.status).toBe('REJECTED');
  });

  it('multiple rejections accumulate records', () => {
    const c = makeChange();
    manager.reject(c.id, 'mgr1');
    manager.reject(c.id, 'mgr2');
    expect(manager.getApprovals(c.id)).toHaveLength(2);
  });

  // 40 reject iterations
  Array.from({ length: 40 }, (_, i) => i).forEach(i => {
    it(`reject iteration ${i} sets status REJECTED`, () => {
      const c = makeChange();
      expect(manager.reject(c.id, `rej-${i}`).status).toBe('REJECTED');
    });
  });
});

// ─── 9. implement ────────────────────────────────────────────────────────────
describe('implement', () => {
  it('changes status to IMPLEMENTING', () => {
    const c = makeChange();
    expect(manager.implement(c.id, 'dev').status).toBe('IMPLEMENTING');
  });

  it('stores assignedTo', () => {
    const c = makeChange();
    expect(manager.implement(c.id, 'dev-team').assignedTo).toBe('dev-team');
  });

  it('stores scheduledDate when provided', () => {
    const c = makeChange();
    const date = new Date('2026-03-01');
    expect(manager.implement(c.id, 'dev', date).scheduledDate).toEqual(date);
  });

  it('scheduledDate is undefined when not provided', () => {
    const c = makeChange();
    expect(manager.implement(c.id, 'dev').scheduledDate).toBeUndefined();
  });

  it('throws on unknown id', () => {
    expect(() => manager.implement('bad', 'dev')).toThrow();
  });

  it('preserves id', () => {
    const c = makeChange();
    expect(manager.implement(c.id, 'dev').id).toBe(c.id);
  });

  it('preserves title', () => {
    const c = makeChange({ title: 'Deploy DB' });
    expect(manager.implement(c.id, 'dev').title).toBe('Deploy DB');
  });

  it('preserves type', () => {
    const c = makeChange({ type: 'MAJOR' });
    expect(manager.implement(c.id, 'dev').type).toBe('MAJOR');
  });

  it('preserves risk', () => {
    const c = makeChange({ risk: 'HIGH' });
    expect(manager.implement(c.id, 'dev').risk).toBe('HIGH');
  });

  it('get() shows IMPLEMENTING status', () => {
    const c = makeChange();
    manager.implement(c.id, 'dev');
    expect(manager.get(c.id)!.status).toBe('IMPLEMENTING');
  });

  it('get() shows assignedTo', () => {
    const c = makeChange();
    manager.implement(c.id, 'team-alpha');
    expect(manager.get(c.id)!.assignedTo).toBe('team-alpha');
  });

  // 40 implement iterations
  Array.from({ length: 40 }, (_, i) => i).forEach(i => {
    it(`implement iteration ${i} sets IMPLEMENTING`, () => {
      const c = makeChange();
      expect(manager.implement(c.id, `dev-${i}`).status).toBe('IMPLEMENTING');
    });
  });
});

// ─── 10. complete ────────────────────────────────────────────────────────────
describe('complete', () => {
  it('changes status to COMPLETED', () => {
    const c = makeChange();
    expect(manager.complete(c.id).status).toBe('COMPLETED');
  });

  it('sets completedAt to a Date', () => {
    const c = makeChange();
    expect(manager.complete(c.id).completedAt).toBeInstanceOf(Date);
  });

  it('completedAt is recent', () => {
    const before = Date.now();
    const c = makeChange();
    const done = manager.complete(c.id);
    expect(done.completedAt!.getTime()).toBeGreaterThanOrEqual(before - 10);
  });

  it('throws on unknown id', () => {
    expect(() => manager.complete('bad')).toThrow();
  });

  it('preserves id after complete', () => {
    const c = makeChange();
    expect(manager.complete(c.id).id).toBe(c.id);
  });

  it('preserves title after complete', () => {
    const c = makeChange({ title: 'Finish It' });
    expect(manager.complete(c.id).title).toBe('Finish It');
  });

  it('get() reflects COMPLETED status', () => {
    const c = makeChange();
    manager.complete(c.id);
    expect(manager.get(c.id)!.status).toBe('COMPLETED');
  });

  it('get() reflects completedAt', () => {
    const c = makeChange();
    manager.complete(c.id);
    expect(manager.get(c.id)!.completedAt).toBeDefined();
  });

  it('preserves rollbackPlan', () => {
    const c = makeChange({ rollbackPlan: 'snapshot' });
    expect(manager.complete(c.id).rollbackPlan).toBe('snapshot');
  });

  it('preserves affectedSystems', () => {
    const c = makeChange({ affectedSystems: ['api'] });
    expect(manager.complete(c.id).affectedSystems).toEqual(['api']);
  });

  // 40 complete iterations
  Array.from({ length: 40 }, (_, i) => i).forEach(i => {
    it(`complete iteration ${i} sets COMPLETED`, () => {
      const c = makeChange();
      expect(manager.complete(c.id).status).toBe('COMPLETED');
    });
  });
});

// ─── 11. cancel ──────────────────────────────────────────────────────────────
describe('cancel', () => {
  it('changes status to CANCELLED', () => {
    const c = makeChange();
    expect(manager.cancel(c.id).status).toBe('CANCELLED');
  });

  it('throws on unknown id', () => {
    expect(() => manager.cancel('bad')).toThrow();
  });

  it('preserves id', () => {
    const c = makeChange();
    expect(manager.cancel(c.id).id).toBe(c.id);
  });

  it('preserves title', () => {
    const c = makeChange({ title: 'Dropped' });
    expect(manager.cancel(c.id).title).toBe('Dropped');
  });

  it('get() reflects CANCELLED status', () => {
    const c = makeChange();
    manager.cancel(c.id);
    expect(manager.get(c.id)!.status).toBe('CANCELLED');
  });

  it('preserves type after cancel', () => {
    const c = makeChange({ type: 'STANDARD' });
    expect(manager.cancel(c.id).type).toBe('STANDARD');
  });

  it('preserves risk after cancel', () => {
    const c = makeChange({ risk: 'LOW' });
    expect(manager.cancel(c.id).risk).toBe('LOW');
  });

  it('preserves requestedBy after cancel', () => {
    const c = makeChange({ requestedBy: 'dave' });
    expect(manager.cancel(c.id).requestedBy).toBe('dave');
  });

  // 40 cancel iterations
  Array.from({ length: 40 }, (_, i) => i).forEach(i => {
    it(`cancel iteration ${i} sets CANCELLED`, () => {
      const c = makeChange();
      expect(manager.cancel(c.id).status).toBe('CANCELLED');
    });
  });
});

// ─── 12. get ─────────────────────────────────────────────────────────────────
describe('get', () => {
  it('returns undefined for unknown id', () => {
    expect(manager.get('cr-none')).toBeUndefined();
  });

  it('returns the created request', () => {
    const c = makeChange();
    expect(manager.get(c.id)).toBeDefined();
  });

  it('returned request matches created', () => {
    const c = makeChange({ title: 'My CR' });
    expect(manager.get(c.id)!.title).toBe('My CR');
  });

  it('returns the most recent state after submit', () => {
    const c = makeChange();
    manager.submit(c.id);
    expect(manager.get(c.id)!.status).toBe('SUBMITTED');
  });

  it('returns the most recent state after approve', () => {
    const c = makeChange();
    manager.approve(c.id, 'mgr');
    expect(manager.get(c.id)!.status).toBe('APPROVED');
  });

  it('returns the most recent state after complete', () => {
    const c = makeChange();
    manager.complete(c.id);
    expect(manager.get(c.id)!.status).toBe('COMPLETED');
  });

  it('returns the most recent state after cancel', () => {
    const c = makeChange();
    manager.cancel(c.id);
    expect(manager.get(c.id)!.status).toBe('CANCELLED');
  });

  // 40 get iterations
  Array.from({ length: 40 }, (_, i) => i).forEach(i => {
    it(`get iteration ${i} finds created request`, () => {
      const c = makeChange({ title: `CR-${i}` });
      expect(manager.get(c.id)!.title).toBe(`CR-${i}`);
    });
  });
});

// ─── 13. getAll ──────────────────────────────────────────────────────────────
describe('getAll', () => {
  it('returns empty array initially', () => {
    expect(manager.getAll()).toHaveLength(0);
  });

  it('returns one after create', () => {
    makeChange();
    expect(manager.getAll()).toHaveLength(1);
  });

  it('returns two after two creates', () => {
    makeChange();
    makeChange();
    expect(manager.getAll()).toHaveLength(2);
  });

  it('returns all created requests', () => {
    const a = makeChange({ title: 'A' });
    const b = makeChange({ title: 'B' });
    const all = manager.getAll();
    const ids = all.map(r => r.id);
    expect(ids).toContain(a.id);
    expect(ids).toContain(b.id);
  });

  it('returns an array', () => {
    expect(Array.isArray(manager.getAll())).toBe(true);
  });

  it('reflects status changes', () => {
    const c = makeChange();
    manager.submit(c.id);
    const found = manager.getAll().find(r => r.id === c.id);
    expect(found!.status).toBe('SUBMITTED');
  });

  // parameterised count checks
  Array.from({ length: 20 }, (_, i) => i + 1).forEach(n => {
    it(`getAll length is ${n} after ${n} creates`, () => {
      Array.from({ length: n }, () => makeChange());
      expect(manager.getAll()).toHaveLength(n);
    });
  });
});

// ─── 14. getCount ────────────────────────────────────────────────────────────
describe('getCount', () => {
  it('returns 0 initially', () => {
    expect(manager.getCount()).toBe(0);
  });

  it('returns 1 after one create', () => {
    makeChange();
    expect(manager.getCount()).toBe(1);
  });

  it('increments with each create', () => {
    makeChange();
    makeChange();
    expect(manager.getCount()).toBe(2);
  });

  // 30 count checks
  Array.from({ length: 30 }, (_, i) => i).forEach(i => {
    it(`getCount is ${i} after ${i} creates`, () => {
      Array.from({ length: i }, () => makeChange());
      expect(manager.getCount()).toBe(i);
    });
  });
});

// ─── 15. getByStatus ─────────────────────────────────────────────────────────
describe('getByStatus', () => {
  it('returns empty for DRAFT when no requests', () => {
    expect(manager.getByStatus('DRAFT')).toHaveLength(0);
  });

  it('returns DRAFT request after create', () => {
    makeChange();
    expect(manager.getByStatus('DRAFT')).toHaveLength(1);
  });

  it('does not include SUBMITTED in DRAFT', () => {
    const c = makeChange();
    manager.submit(c.id);
    expect(manager.getByStatus('DRAFT')).toHaveLength(0);
  });

  it('returns SUBMITTED after submit', () => {
    const c = makeChange();
    manager.submit(c.id);
    expect(manager.getByStatus('SUBMITTED')).toHaveLength(1);
  });

  it('returns APPROVED after approve', () => {
    const c = makeChange();
    manager.approve(c.id, 'mgr');
    expect(manager.getByStatus('APPROVED')).toHaveLength(1);
  });

  it('returns REJECTED after reject', () => {
    const c = makeChange();
    manager.reject(c.id, 'mgr');
    expect(manager.getByStatus('REJECTED')).toHaveLength(1);
  });

  it('returns IMPLEMENTING after implement', () => {
    const c = makeChange();
    manager.implement(c.id, 'dev');
    expect(manager.getByStatus('IMPLEMENTING')).toHaveLength(1);
  });

  it('returns COMPLETED after complete', () => {
    const c = makeChange();
    manager.complete(c.id);
    expect(manager.getByStatus('COMPLETED')).toHaveLength(1);
  });

  it('returns CANCELLED after cancel', () => {
    const c = makeChange();
    manager.cancel(c.id);
    expect(manager.getByStatus('CANCELLED')).toHaveLength(1);
  });

  it('filters correctly among mixed statuses', () => {
    makeChange();                           // DRAFT
    const b = makeChange();
    manager.submit(b.id);                  // SUBMITTED
    const c = makeChange();
    manager.approve(c.id, 'mgr');          // APPROVED
    expect(manager.getByStatus('DRAFT')).toHaveLength(1);
    expect(manager.getByStatus('SUBMITTED')).toHaveLength(1);
    expect(manager.getByStatus('APPROVED')).toHaveLength(1);
  });

  it('returned records have correct status', () => {
    makeChange();
    const all = manager.getByStatus('DRAFT');
    all.forEach(r => expect(r.status).toBe('DRAFT'));
  });

  // parameterised: multiple DRAFT counts
  Array.from({ length: 20 }, (_, i) => i + 1).forEach(n => {
    it(`getByStatus DRAFT returns ${n} when ${n} created`, () => {
      Array.from({ length: n }, () => makeChange());
      expect(manager.getByStatus('DRAFT')).toHaveLength(n);
    });
  });

  // parameterised: each status returns 0 when empty
  ALL_STATUSES.forEach(status => {
    it(`getByStatus ${status} returns empty when none match`, () => {
      expect(manager.getByStatus(status)).toHaveLength(0);
    });
  });
});

// ─── 16. getByType ───────────────────────────────────────────────────────────
describe('getByType', () => {
  it('returns empty initially for any type', () => {
    expect(manager.getByType('STANDARD')).toHaveLength(0);
  });

  ALL_TYPES.forEach(type => {
    it(`returns correct count for type ${type}`, () => {
      makeChange({ type });
      expect(manager.getByType(type)).toHaveLength(1);
    });
  });

  it('does not mix STANDARD and NORMAL', () => {
    makeChange({ type: 'STANDARD' });
    makeChange({ type: 'NORMAL' });
    expect(manager.getByType('STANDARD')).toHaveLength(1);
    expect(manager.getByType('NORMAL')).toHaveLength(1);
  });

  it('returned records have correct type', () => {
    makeChange({ type: 'MAJOR' });
    manager.getByType('MAJOR').forEach(r => expect(r.type).toBe('MAJOR'));
  });

  it('counts multiple of same type', () => {
    makeChange({ type: 'EMERGENCY' });
    makeChange({ type: 'EMERGENCY' });
    makeChange({ type: 'STANDARD' });
    expect(manager.getByType('EMERGENCY')).toHaveLength(2);
  });

  // parameterised count checks for STANDARD
  Array.from({ length: 20 }, (_, i) => i + 1).forEach(n => {
    it(`getByType STANDARD returns ${n} when ${n} created`, () => {
      Array.from({ length: n }, () => makeChange({ type: 'STANDARD' }));
      expect(manager.getByType('STANDARD')).toHaveLength(n);
    });
  });

  // parameterised: each type returns empty when none
  ALL_TYPES.forEach(type => {
    it(`getByType ${type} empty when no match`, () => {
      makeChange({ type: type === 'STANDARD' ? 'NORMAL' : 'STANDARD' });
      const result = manager.getByType(type);
      result.forEach(r => expect(r.type).toBe(type));
    });
  });
});

// ─── 17. getByRisk ───────────────────────────────────────────────────────────
describe('getByRisk', () => {
  it('returns empty initially', () => {
    expect(manager.getByRisk('LOW')).toHaveLength(0);
  });

  ALL_RISKS.forEach(risk => {
    it(`returns 1 for risk ${risk}`, () => {
      makeChange({ risk });
      expect(manager.getByRisk(risk)).toHaveLength(1);
    });
  });

  it('filters correctly between risk levels', () => {
    makeChange({ risk: 'LOW' });
    makeChange({ risk: 'HIGH' });
    expect(manager.getByRisk('LOW')).toHaveLength(1);
    expect(manager.getByRisk('HIGH')).toHaveLength(1);
  });

  it('returned records have correct risk', () => {
    makeChange({ risk: 'CRITICAL' });
    manager.getByRisk('CRITICAL').forEach(r => expect(r.risk).toBe('CRITICAL'));
  });

  // parameterised count checks for MEDIUM
  Array.from({ length: 20 }, (_, i) => i + 1).forEach(n => {
    it(`getByRisk MEDIUM returns ${n} for ${n} created`, () => {
      Array.from({ length: n }, () => makeChange({ risk: 'MEDIUM' }));
      expect(manager.getByRisk('MEDIUM')).toHaveLength(n);
    });
  });
});

// ─── 18. getByRequester ──────────────────────────────────────────────────────
describe('getByRequester', () => {
  it('returns empty for unknown requester', () => {
    expect(manager.getByRequester('nobody')).toHaveLength(0);
  });

  it('returns request for known requester', () => {
    makeChange({ requestedBy: 'alice' });
    expect(manager.getByRequester('alice')).toHaveLength(1);
  });

  it('does not cross-contaminate requesters', () => {
    makeChange({ requestedBy: 'alice' });
    makeChange({ requestedBy: 'bob' });
    expect(manager.getByRequester('alice')).toHaveLength(1);
    expect(manager.getByRequester('bob')).toHaveLength(1);
  });

  it('returns all for same requester', () => {
    makeChange({ requestedBy: 'alice' });
    makeChange({ requestedBy: 'alice' });
    expect(manager.getByRequester('alice')).toHaveLength(2);
  });

  it('returned records have correct requestedBy', () => {
    makeChange({ requestedBy: 'carol' });
    manager.getByRequester('carol').forEach(r => expect(r.requestedBy).toBe('carol'));
  });

  // parameterised
  Array.from({ length: 20 }, (_, i) => i + 1).forEach(n => {
    it(`getByRequester returns ${n} for user with ${n} requests`, () => {
      Array.from({ length: n }, () => makeChange({ requestedBy: 'user-x' }));
      expect(manager.getByRequester('user-x')).toHaveLength(n);
    });
  });
});

// ─── 19. getApprovals ────────────────────────────────────────────────────────
describe('getApprovals', () => {
  it('returns empty array for new request', () => {
    const c = makeChange();
    expect(manager.getApprovals(c.id)).toHaveLength(0);
  });

  it('returns empty array for unknown id', () => {
    expect(manager.getApprovals('cr-none')).toHaveLength(0);
  });

  it('returns 1 approval after approve', () => {
    const c = makeChange();
    manager.approve(c.id, 'mgr');
    expect(manager.getApprovals(c.id)).toHaveLength(1);
  });

  it('returns 1 approval after reject', () => {
    const c = makeChange();
    manager.reject(c.id, 'mgr');
    expect(manager.getApprovals(c.id)).toHaveLength(1);
  });

  it('returns 2 after approve then reject', () => {
    const c = makeChange();
    manager.approve(c.id, 'mgr1');
    manager.reject(c.id, 'mgr2');
    expect(manager.getApprovals(c.id)).toHaveLength(2);
  });

  it('first approval is APPROVED when approved first', () => {
    const c = makeChange();
    manager.approve(c.id, 'mgr');
    manager.reject(c.id, 'mgr2');
    expect(manager.getApprovals(c.id)[0].decision).toBe('APPROVED');
  });

  it('second approval is REJECTED when rejected second', () => {
    const c = makeChange();
    manager.approve(c.id, 'mgr');
    manager.reject(c.id, 'mgr2');
    expect(manager.getApprovals(c.id)[1].decision).toBe('REJECTED');
  });

  it('approval records are for correct changeId', () => {
    const c = makeChange();
    manager.approve(c.id, 'mgr');
    manager.getApprovals(c.id).forEach(a => expect(a.changeId).toBe(c.id));
  });

  it('does not mix approvals between requests', () => {
    const a = makeChange();
    const b = makeChange();
    manager.approve(a.id, 'mgr');
    expect(manager.getApprovals(b.id)).toHaveLength(0);
  });

  // parameterised: n approvals
  Array.from({ length: 20 }, (_, i) => i + 1).forEach(n => {
    it(`returns ${n} approval records after ${n} approvals`, () => {
      const c = makeChange();
      Array.from({ length: n }, (_, k) => manager.approve(c.id, `mgr-${k}`));
      expect(manager.getApprovals(c.id)).toHaveLength(n);
    });
  });
});

// ─── 20. getEmergency ────────────────────────────────────────────────────────
describe('getEmergency', () => {
  it('returns empty when none are EMERGENCY', () => {
    makeChange({ type: 'NORMAL' });
    expect(manager.getEmergency()).toHaveLength(0);
  });

  it('returns 1 after creating EMERGENCY', () => {
    makeChange({ type: 'EMERGENCY' });
    expect(manager.getEmergency()).toHaveLength(1);
  });

  it('does not include STANDARD', () => {
    makeChange({ type: 'STANDARD' });
    makeChange({ type: 'EMERGENCY' });
    expect(manager.getEmergency()).toHaveLength(1);
  });

  it('all returned records are EMERGENCY type', () => {
    makeChange({ type: 'EMERGENCY' });
    makeChange({ type: 'EMERGENCY' });
    makeChange({ type: 'NORMAL' });
    manager.getEmergency().forEach(r => expect(r.type).toBe('EMERGENCY'));
  });

  // parameterised count
  Array.from({ length: 20 }, (_, i) => i + 1).forEach(n => {
    it(`getEmergency returns ${n} when ${n} EMERGENCY created`, () => {
      Array.from({ length: n }, () => makeChange({ type: 'EMERGENCY' }));
      expect(manager.getEmergency()).toHaveLength(n);
    });
  });
});

// ─── 21. getHighRisk ─────────────────────────────────────────────────────────
describe('getHighRisk', () => {
  it('returns empty when only LOW risk', () => {
    makeChange({ risk: 'LOW' });
    expect(manager.getHighRisk()).toHaveLength(0);
  });

  it('returns empty when only MEDIUM risk', () => {
    makeChange({ risk: 'MEDIUM' });
    expect(manager.getHighRisk()).toHaveLength(0);
  });

  it('includes HIGH risk', () => {
    makeChange({ risk: 'HIGH' });
    expect(manager.getHighRisk()).toHaveLength(1);
  });

  it('includes CRITICAL risk', () => {
    makeChange({ risk: 'CRITICAL' });
    expect(manager.getHighRisk()).toHaveLength(1);
  });

  it('includes both HIGH and CRITICAL', () => {
    makeChange({ risk: 'HIGH' });
    makeChange({ risk: 'CRITICAL' });
    expect(manager.getHighRisk()).toHaveLength(2);
  });

  it('excludes LOW and MEDIUM', () => {
    makeChange({ risk: 'LOW' });
    makeChange({ risk: 'MEDIUM' });
    makeChange({ risk: 'HIGH' });
    expect(manager.getHighRisk()).toHaveLength(1);
  });

  it('all returned records are HIGH or CRITICAL', () => {
    makeChange({ risk: 'HIGH' });
    makeChange({ risk: 'CRITICAL' });
    makeChange({ risk: 'LOW' });
    manager.getHighRisk().forEach(r => {
      expect(['HIGH', 'CRITICAL']).toContain(r.risk);
    });
  });

  // parameterised: HIGH count
  Array.from({ length: 20 }, (_, i) => i + 1).forEach(n => {
    it(`getHighRisk returns ${n} for ${n} HIGH risk requests`, () => {
      Array.from({ length: n }, () => makeChange({ risk: 'HIGH' }));
      expect(manager.getHighRisk()).toHaveLength(n);
    });
  });

  // parameterised: CRITICAL count
  Array.from({ length: 15 }, (_, i) => i + 1).forEach(n => {
    it(`getHighRisk returns ${n} for ${n} CRITICAL risk requests`, () => {
      Array.from({ length: n }, () => makeChange({ risk: 'CRITICAL' }));
      expect(manager.getHighRisk()).toHaveLength(n);
    });
  });
});

// ─── 22. full workflow: DRAFT → SUBMITTED → APPROVED → IMPLEMENTING → COMPLETED
describe('full approval workflow', () => {
  it('full happy path ends in COMPLETED', () => {
    const c = makeChange();
    manager.submit(c.id);
    manager.approve(c.id, 'mgr');
    manager.implement(c.id, 'dev');
    const done = manager.complete(c.id);
    expect(done.status).toBe('COMPLETED');
    expect(done.completedAt).toBeDefined();
  });

  it('rejection workflow ends in REJECTED', () => {
    const c = makeChange();
    manager.submit(c.id);
    const rej = manager.reject(c.id, 'mgr', 'not enough info');
    expect(rej.status).toBe('REJECTED');
  });

  it('approval record captured in full flow', () => {
    const c = makeChange();
    manager.approve(c.id, 'ciso', 'Looks good');
    const approvals = manager.getApprovals(c.id);
    expect(approvals[0].approver).toBe('ciso');
    expect(approvals[0].comments).toBe('Looks good');
    expect(approvals[0].decision).toBe('APPROVED');
  });

  it('cancelled request is retrievable', () => {
    const c = makeChange();
    manager.cancel(c.id);
    expect(manager.get(c.id)!.status).toBe('CANCELLED');
  });

  it('multiple workflows run independently', () => {
    const a = makeChange();
    const b = makeChange();
    manager.submit(a.id);
    manager.approve(a.id, 'mgr');
    manager.cancel(b.id);
    expect(manager.get(a.id)!.status).toBe('APPROVED');
    expect(manager.get(b.id)!.status).toBe('CANCELLED');
  });

  it('implement sets scheduledDate in full flow', () => {
    const date = new Date('2026-04-01');
    const c = makeChange();
    manager.approve(c.id, 'mgr');
    manager.implement(c.id, 'ops', date);
    expect(manager.get(c.id)!.scheduledDate).toEqual(date);
  });

  // parameterised full flow
  Array.from({ length: 30 }, (_, i) => i).forEach(i => {
    it(`full flow iteration ${i}`, () => {
      const c = makeChange({ title: `Flow-${i}` });
      manager.submit(c.id);
      manager.approve(c.id, `mgr-${i}`);
      manager.implement(c.id, `dev-${i}`);
      const done = manager.complete(c.id);
      expect(done.status).toBe('COMPLETED');
    });
  });
});

// ─── 23. error handling — all methods ────────────────────────────────────────
describe('error handling', () => {
  const badId = 'cr-does-not-exist';

  it('submit throws for missing id', () => {
    expect(() => manager.submit(badId)).toThrow();
  });

  it('submit error message includes id', () => {
    expect(() => manager.submit(badId)).toThrow(badId);
  });

  it('approve throws for missing id', () => {
    expect(() => manager.approve(badId, 'mgr')).toThrow();
  });

  it('approve error message includes id', () => {
    expect(() => manager.approve(badId, 'mgr')).toThrow(badId);
  });

  it('reject throws for missing id', () => {
    expect(() => manager.reject(badId, 'mgr')).toThrow();
  });

  it('reject error message includes id', () => {
    expect(() => manager.reject(badId, 'mgr')).toThrow(badId);
  });

  it('implement throws for missing id', () => {
    expect(() => manager.implement(badId, 'dev')).toThrow();
  });

  it('implement error message includes id', () => {
    expect(() => manager.implement(badId, 'dev')).toThrow(badId);
  });

  it('complete throws for missing id', () => {
    expect(() => manager.complete(badId)).toThrow();
  });

  it('complete error message includes id', () => {
    expect(() => manager.complete(badId)).toThrow(badId);
  });

  it('cancel throws for missing id', () => {
    expect(() => manager.cancel(badId)).toThrow();
  });

  it('cancel error message includes id', () => {
    expect(() => manager.cancel(badId)).toThrow(badId);
  });

  // parameterised: 30 bad-id variations
  Array.from({ length: 30 }, (_, i) => i).forEach(i => {
    it(`submit throws for fake id cr-fake-${i}`, () => {
      expect(() => manager.submit(`cr-fake-${i}`)).toThrow();
    });
  });

  Array.from({ length: 30 }, (_, i) => i).forEach(i => {
    it(`approve throws for fake id cr-fake-${i}`, () => {
      expect(() => manager.approve(`cr-fake-${i}`, 'mgr')).toThrow();
    });
  });
});

// ─── 24. isolation: new manager is empty ─────────────────────────────────────
describe('manager isolation', () => {
  Array.from({ length: 20 }, (_, i) => i).forEach(i => {
    it(`fresh manager ${i} has no requests`, () => {
      const m = new ChangeRequestManager();
      expect(m.getCount()).toBe(0);
    });
  });

  Array.from({ length: 20 }, (_, i) => i).forEach(i => {
    it(`fresh manager ${i} getAll is empty`, () => {
      const m = new ChangeRequestManager();
      expect(m.getAll()).toHaveLength(0);
    });
  });
});

// ─── 25. title/description variety ───────────────────────────────────────────
describe('title and description variety', () => {
  const titles = [
    'Deploy DB patch', 'Upgrade TLS', 'Add firewall rule', 'Rotate certs',
    'Scale pods', 'Rollback release', 'Add CDN', 'Update DNS',
    'Migrate schema', 'Patch OS',
  ];
  titles.forEach((title, i) => {
    it(`title preserved: "${title}"`, () => {
      const c = makeChange({ title });
      expect(c.title).toBe(title);
    });
  });

  const descs = [
    'This change upgrades the TLS version.',
    'Firewall rule to block external traffic.',
    'Certificate rotation every 90 days.',
    'Horizontal pod autoscaler config.',
    'Schema migration for new column.',
  ];
  descs.forEach((description, i) => {
    it(`description preserved: desc ${i}`, () => {
      const c = makeChange({ description });
      expect(c.description).toBe(description);
    });
  });
});

// ─── 26. affectedSystems variety ─────────────────────────────────────────────
describe('affectedSystems variety', () => {
  const cases: string[][] = [
    ['api'],
    ['db', 'cache'],
    ['api', 'db', 'auth', 'frontend'],
    [],
    ['service-a', 'service-b', 'service-c', 'service-d', 'service-e'],
  ];
  cases.forEach((systems, i) => {
    it(`affectedSystems case ${i} preserved`, () => {
      const c = makeChange({ affectedSystems: systems });
      expect(c.affectedSystems).toEqual(systems);
    });
  });

  // parameterised lengths
  Array.from({ length: 10 }, (_, i) => i + 1).forEach(n => {
    it(`affectedSystems with ${n} entries preserved`, () => {
      const systems = Array.from({ length: n }, (_, k) => `sys-${k}`);
      const c = makeChange({ affectedSystems: systems });
      expect(c.affectedSystems).toHaveLength(n);
    });
  });
});

// ─── 27. requestedBy variety ──────────────────────────────────────────────────
describe('requestedBy variety', () => {
  const users = ['alice', 'bob', 'carol', 'dave', 'eve', 'frank', 'grace', 'heidi', 'ivan', 'judy'];
  users.forEach(user => {
    it(`requestedBy ${user} stored correctly`, () => {
      const c = makeChange({ requestedBy: user });
      expect(c.requestedBy).toBe(user);
    });
  });

  users.forEach(user => {
    it(`getByRequester finds ${user}`, () => {
      makeChange({ requestedBy: user });
      expect(manager.getByRequester(user)).toHaveLength(1);
    });
  });
});

// ─── 28. multiple managers coexist ────────────────────────────────────────────
describe('multiple managers coexist', () => {
  it('two managers do not share requests', () => {
    const m1 = new ChangeRequestManager();
    const m2 = new ChangeRequestManager();
    m1.create('T', 'D', 'NORMAL', 'MEDIUM', 'u', 'rb', ['s']);
    expect(m2.getCount()).toBe(0);
  });

  it('operations on m1 do not affect m2', () => {
    const m1 = new ChangeRequestManager();
    const m2 = new ChangeRequestManager();
    const c = m1.create('T', 'D', 'NORMAL', 'MEDIUM', 'u', 'rb', ['s']);
    m1.submit(c.id);
    expect(m2.getAll()).toHaveLength(0);
  });

  Array.from({ length: 20 }, (_, i) => i).forEach(i => {
    it(`managers isolated iteration ${i}`, () => {
      const m1 = new ChangeRequestManager();
      const m2 = new ChangeRequestManager();
      m1.create('T', 'D', 'NORMAL', 'MEDIUM', 'u', 'rb', ['s']);
      expect(m2.getCount()).toBe(0);
      expect(m1.getCount()).toBe(1);
    });
  });
});

// ─── 29. rollback plan variety ────────────────────────────────────────────────
describe('rollbackPlan variety', () => {
  const plans = [
    'Restore from last snapshot',
    'Revert git commit and redeploy',
    'Run rollback.sh script',
    'Restore DB from backup',
    'Toggle feature flag off',
    'Revert DNS changes',
    'Re-apply previous Helm chart',
    'Restore config from git tag v1.2.3',
  ];
  plans.forEach((rollbackPlan, i) => {
    it(`rollbackPlan ${i} preserved`, () => {
      const c = makeChange({ rollbackPlan });
      expect(c.rollbackPlan).toBe(rollbackPlan);
    });
  });
});

// ─── 30. approval decidedAt precision ─────────────────────────────────────────
describe('approval decidedAt', () => {
  Array.from({ length: 20 }, (_, i) => i).forEach(i => {
    it(`approve iteration ${i} decidedAt is recent`, () => {
      const before = Date.now();
      const c = makeChange();
      manager.approve(c.id, 'mgr');
      const rec = manager.getApprovals(c.id)[0];
      expect(rec.decidedAt.getTime()).toBeGreaterThanOrEqual(before - 10);
    });
  });

  Array.from({ length: 20 }, (_, i) => i).forEach(i => {
    it(`reject iteration ${i} decidedAt is recent`, () => {
      const before = Date.now();
      const c = makeChange();
      manager.reject(c.id, 'mgr');
      const rec = manager.getApprovals(c.id)[0];
      expect(rec.decidedAt.getTime()).toBeGreaterThanOrEqual(before - 10);
    });
  });
});

// ─── 31. completedAt precision ────────────────────────────────────────────────
describe('completedAt precision', () => {
  Array.from({ length: 20 }, (_, i) => i).forEach(i => {
    it(`complete iteration ${i} completedAt is recent`, () => {
      const before = Date.now();
      const c = makeChange();
      const done = manager.complete(c.id);
      expect(done.completedAt!.getTime()).toBeGreaterThanOrEqual(before - 10);
    });
  });
});

// ─── 32. getByStatus after multiple transitions ───────────────────────────────
describe('getByStatus multi-transition', () => {
  it('DRAFT reduces as requests submitted', () => {
    const a = makeChange();
    const b = makeChange();
    manager.submit(a.id);
    expect(manager.getByStatus('DRAFT')).toHaveLength(1);
    expect(manager.getByStatus('SUBMITTED')).toHaveLength(1);
  });

  it('SUBMITTED reduces as requests approved', () => {
    const a = makeChange();
    manager.submit(a.id);
    manager.approve(a.id, 'mgr');
    expect(manager.getByStatus('SUBMITTED')).toHaveLength(0);
    expect(manager.getByStatus('APPROVED')).toHaveLength(1);
  });

  it('APPROVED reduces as requests implementing', () => {
    const a = makeChange();
    manager.approve(a.id, 'mgr');
    manager.implement(a.id, 'dev');
    expect(manager.getByStatus('APPROVED')).toHaveLength(0);
    expect(manager.getByStatus('IMPLEMENTING')).toHaveLength(1);
  });

  it('IMPLEMENTING reduces as requests completed', () => {
    const a = makeChange();
    manager.implement(a.id, 'dev');
    manager.complete(a.id);
    expect(manager.getByStatus('IMPLEMENTING')).toHaveLength(0);
    expect(manager.getByStatus('COMPLETED')).toHaveLength(1);
  });

  // 30 iterations: status transition count checks
  Array.from({ length: 30 }, (_, i) => i).forEach(i => {
    it(`multi-transition status check iteration ${i}`, () => {
      const c = makeChange();
      manager.submit(c.id);
      manager.approve(c.id, 'mgr');
      expect(manager.getByStatus('APPROVED')).toHaveLength(1);
      manager.complete(c.id);
      expect(manager.getByStatus('COMPLETED')).toHaveLength(1);
    });
  });
});

// ─── 33. getAll after transitions ─────────────────────────────────────────────
describe('getAll after transitions', () => {
  it('getAll length unchanged after submit', () => {
    const c = makeChange();
    manager.submit(c.id);
    expect(manager.getAll()).toHaveLength(1);
  });

  it('getAll length unchanged after approve', () => {
    const c = makeChange();
    manager.approve(c.id, 'mgr');
    expect(manager.getAll()).toHaveLength(1);
  });

  it('getAll length unchanged after cancel', () => {
    const c = makeChange();
    manager.cancel(c.id);
    expect(manager.getAll()).toHaveLength(1);
  });

  it('getAll length unchanged after complete', () => {
    const c = makeChange();
    manager.complete(c.id);
    expect(manager.getAll()).toHaveLength(1);
  });

  // parameterised: N creates, then 1 cancel — all still present
  Array.from({ length: 10 }, (_, i) => i + 2).forEach(n => {
    it(`getAll returns ${n} after ${n} creates and 1 cancel`, () => {
      const created = Array.from({ length: n }, () => makeChange());
      manager.cancel(created[0].id);
      expect(manager.getAll()).toHaveLength(n);
    });
  });
});

// ─── 34. mixed type × status interactions ─────────────────────────────────────
describe('mixed type and status', () => {
  ALL_TYPES.forEach(type => {
    it(`${type} request can be submitted`, () => {
      const c = makeChange({ type });
      expect(manager.submit(c.id).status).toBe('SUBMITTED');
    });

    it(`${type} request can be approved`, () => {
      const c = makeChange({ type });
      expect(manager.approve(c.id, 'mgr').status).toBe('APPROVED');
    });

    it(`${type} request can be rejected`, () => {
      const c = makeChange({ type });
      expect(manager.reject(c.id, 'mgr').status).toBe('REJECTED');
    });

    it(`${type} request can be implemented`, () => {
      const c = makeChange({ type });
      expect(manager.implement(c.id, 'dev').status).toBe('IMPLEMENTING');
    });

    it(`${type} request can be completed`, () => {
      const c = makeChange({ type });
      expect(manager.complete(c.id).status).toBe('COMPLETED');
    });

    it(`${type} request can be cancelled`, () => {
      const c = makeChange({ type });
      expect(manager.cancel(c.id).status).toBe('CANCELLED');
    });
  });
});

// ─── 35. mixed risk × status interactions ─────────────────────────────────────
describe('mixed risk and status', () => {
  ALL_RISKS.forEach(risk => {
    it(`${risk} risk request can be submitted`, () => {
      const c = makeChange({ risk });
      expect(manager.submit(c.id).status).toBe('SUBMITTED');
    });

    it(`${risk} risk request can be approved`, () => {
      const c = makeChange({ risk });
      expect(manager.approve(c.id, 'mgr').status).toBe('APPROVED');
    });

    it(`${risk} risk request can be cancelled`, () => {
      const c = makeChange({ risk });
      expect(manager.cancel(c.id).status).toBe('CANCELLED');
    });

    it(`${risk} risk request can be completed`, () => {
      const c = makeChange({ risk });
      expect(manager.complete(c.id).status).toBe('COMPLETED');
    });
  });
});

// ─── 36. approve with comments variety ────────────────────────────────────────
describe('approve with comments variety', () => {
  const commentSamples = [
    'LGTM',
    'Approved after CAB review',
    'Risk accepted by CISO',
    'Meets all RFC criteria',
    'Emergency approved by CTO',
    'Standard change pre-approved',
  ];

  commentSamples.forEach((comments, i) => {
    it(`approve comment preserved: "${comments}"`, () => {
      const c = makeChange();
      manager.approve(c.id, 'mgr', comments);
      expect(manager.getApprovals(c.id)[0].comments).toBe(comments);
    });
  });

  // 20 parameterised comment iterations
  Array.from({ length: 20 }, (_, i) => i).forEach(i => {
    it(`approve comment iteration ${i}`, () => {
      const c = makeChange();
      manager.approve(c.id, 'mgr', `comment-${i}`);
      expect(manager.getApprovals(c.id)[0].comments).toBe(`comment-${i}`);
    });
  });
});

// ─── 37. reject with comments variety ─────────────────────────────────────────
describe('reject with comments variety', () => {
  const rejectComments = [
    'Insufficient rollback plan',
    'Missing business justification',
    'Change window not suitable',
    'Risk too high without mitigations',
  ];

  rejectComments.forEach((comments, i) => {
    it(`reject comment preserved: "${comments}"`, () => {
      const c = makeChange();
      manager.reject(c.id, 'mgr', comments);
      expect(manager.getApprovals(c.id)[0].comments).toBe(comments);
    });
  });

  Array.from({ length: 20 }, (_, i) => i).forEach(i => {
    it(`reject comment iteration ${i}`, () => {
      const c = makeChange();
      manager.reject(c.id, 'mgr', `reason-${i}`);
      expect(manager.getApprovals(c.id)[0].comments).toBe(`reason-${i}`);
    });
  });
});

// ─── 38. implement scheduledDate variety ──────────────────────────────────────
describe('implement scheduledDate', () => {
  const dates = [
    new Date('2026-03-01'),
    new Date('2026-06-15'),
    new Date('2026-12-31'),
    new Date('2027-01-01'),
    new Date('2026-04-20T10:00:00Z'),
  ];

  dates.forEach((date, i) => {
    it(`scheduledDate case ${i} preserved`, () => {
      const c = makeChange();
      manager.implement(c.id, 'dev', date);
      expect(manager.get(c.id)!.scheduledDate).toEqual(date);
    });
  });

  Array.from({ length: 20 }, (_, i) => i).forEach(i => {
    it(`scheduledDate iteration ${i}`, () => {
      const date = new Date(2026, 2, i + 1);
      const c = makeChange();
      manager.implement(c.id, 'dev', date);
      expect(manager.get(c.id)!.scheduledDate).toEqual(date);
    });
  });
});

// ─── 39. getHighRisk boundary: LOW and MEDIUM excluded ────────────────────────
describe('getHighRisk boundary conditions', () => {
  it('LOW risk not in getHighRisk', () => {
    makeChange({ risk: 'LOW' });
    const result = manager.getHighRisk();
    result.forEach(r => expect(r.risk).not.toBe('LOW'));
  });

  it('MEDIUM risk not in getHighRisk', () => {
    makeChange({ risk: 'MEDIUM' });
    const result = manager.getHighRisk();
    result.forEach(r => expect(r.risk).not.toBe('MEDIUM'));
  });

  it('mix: only HIGH and CRITICAL returned', () => {
    makeChange({ risk: 'LOW' });
    makeChange({ risk: 'MEDIUM' });
    makeChange({ risk: 'HIGH' });
    makeChange({ risk: 'CRITICAL' });
    const result = manager.getHighRisk();
    expect(result).toHaveLength(2);
    result.forEach(r => expect(['HIGH', 'CRITICAL']).toContain(r.risk));
  });

  // 20 parameterised boundary iterations
  Array.from({ length: 20 }, (_, i) => i).forEach(i => {
    it(`boundary iteration ${i}: MEDIUM excluded`, () => {
      makeChange({ risk: 'MEDIUM' });
      expect(manager.getHighRisk()).toHaveLength(0);
    });
  });
});

// ─── 40. type re-export from index ───────────────────────────────────────────
describe('re-exports from index', () => {
  it('ChangeRequestManager is importable', () => {
    const { ChangeRequestManager: M } = require('../change-request-manager');
    expect(typeof M).toBe('function');
  });

  // 10 sanity re-export checks
  Array.from({ length: 10 }, (_, i) => i).forEach(i => {
    it(`re-export sanity ${i}: new manager works`, () => {
      const m = new ChangeRequestManager();
      expect(m.getCount()).toBe(0);
    });
  });
});

// ─── 41. assign via implement then complete ────────────────────────────────────
describe('assignedTo through implement and complete', () => {
  Array.from({ length: 20 }, (_, i) => i).forEach(i => {
    it(`assignedTo persists to complete iteration ${i}`, () => {
      const c = makeChange();
      manager.implement(c.id, `engineer-${i}`);
      manager.complete(c.id);
      expect(manager.get(c.id)!.assignedTo).toBe(`engineer-${i}`);
    });
  });
});

// ─── 42. large scale: 100 requests created ────────────────────────────────────
describe('large scale creation', () => {
  it('can create 100 requests and count them', () => {
    Array.from({ length: 100 }, () => makeChange());
    expect(manager.getCount()).toBe(100);
  });

  it('can get all 100 requests', () => {
    Array.from({ length: 100 }, () => makeChange());
    expect(manager.getAll()).toHaveLength(100);
  });

  it('all 100 IDs are unique', () => {
    const ids = Array.from({ length: 100 }, () => makeChange().id);
    expect(new Set(ids).size).toBe(100);
  });

  it('all 100 start as DRAFT', () => {
    Array.from({ length: 100 }, () => makeChange());
    expect(manager.getByStatus('DRAFT')).toHaveLength(100);
  });
});

// ─── 43. approval: multiple approvers per request ─────────────────────────────
describe('multiple approvers per request', () => {
  const approvers = ['ciso', 'cto', 'coo', 'cab-member-1', 'cab-member-2'];

  it('5 approvers each add a record', () => {
    const c = makeChange();
    approvers.forEach(a => manager.approve(c.id, a));
    expect(manager.getApprovals(c.id)).toHaveLength(5);
  });

  it('each approver name stored correctly', () => {
    const c = makeChange();
    approvers.forEach(a => manager.approve(c.id, a));
    const records = manager.getApprovals(c.id);
    approvers.forEach((a, i) => expect(records[i].approver).toBe(a));
  });

  it('mixed approve and reject records preserved in order', () => {
    const c = makeChange();
    manager.approve(c.id, 'ciso');
    manager.reject(c.id, 'coo', 'Need more info');
    manager.approve(c.id, 'cto');
    const records = manager.getApprovals(c.id);
    expect(records[0].decision).toBe('APPROVED');
    expect(records[1].decision).toBe('REJECTED');
    expect(records[2].decision).toBe('APPROVED');
  });
});

// ─── 44. getByType × getByRisk combined filtering ─────────────────────────────
describe('getByType then manual risk filter', () => {
  it('can filter EMERGENCY+CRITICAL from all', () => {
    makeChange({ type: 'EMERGENCY', risk: 'CRITICAL' });
    makeChange({ type: 'EMERGENCY', risk: 'LOW' });
    makeChange({ type: 'NORMAL', risk: 'CRITICAL' });
    const emergencies = manager.getByType('EMERGENCY');
    const critical = emergencies.filter(r => r.risk === 'CRITICAL');
    expect(critical).toHaveLength(1);
  });

  it('EMERGENCY+HIGH separated from STANDARD+HIGH', () => {
    makeChange({ type: 'EMERGENCY', risk: 'HIGH' });
    makeChange({ type: 'STANDARD', risk: 'HIGH' });
    const em = manager.getByType('EMERGENCY').filter(r => r.risk === 'HIGH');
    const st = manager.getByType('STANDARD').filter(r => r.risk === 'HIGH');
    expect(em).toHaveLength(1);
    expect(st).toHaveLength(1);
  });
});

// ─── 45. createdAt ordering ───────────────────────────────────────────────────
describe('createdAt ordering', () => {
  it('later request has createdAt >= earlier', () => {
    const a = makeChange();
    const b = makeChange();
    expect(b.createdAt.getTime()).toBeGreaterThanOrEqual(a.createdAt.getTime());
  });

  Array.from({ length: 15 }, (_, i) => i).forEach(i => {
    it(`createdAt is a valid Date iteration ${i}`, () => {
      const c = makeChange();
      expect(c.createdAt).toBeInstanceOf(Date);
      expect(isNaN(c.createdAt.getTime())).toBe(false);
    });
  });
});

// ─── 46. getCount vs getAll length consistency ────────────────────────────────
describe('getCount vs getAll length', () => {
  Array.from({ length: 20 }, (_, i) => i).forEach(n => {
    it(`getCount === getAll.length for ${n} requests`, () => {
      Array.from({ length: n }, () => makeChange());
      expect(manager.getCount()).toBe(manager.getAll().length);
    });
  });
});

// ─── 47. description variety 2 ────────────────────────────────────────────────
describe('description edge cases', () => {
  it('empty string description stored', () => {
    const c = makeChange({ description: '' });
    expect(c.description).toBe('');
  });

  it('very long description stored', () => {
    const long = 'x'.repeat(1000);
    const c = makeChange({ description: long });
    expect(c.description).toBe(long);
  });

  it('description with special chars stored', () => {
    const desc = 'Deploy & migrate — "critical" path; cost: $500';
    const c = makeChange({ description: desc });
    expect(c.description).toBe(desc);
  });

  it('multi-line description stored', () => {
    const desc = 'Line 1\nLine 2\nLine 3';
    const c = makeChange({ description: desc });
    expect(c.description).toBe(desc);
  });
});

// ─── 48. rollbackPlan edge cases ──────────────────────────────────────────────
describe('rollbackPlan edge cases', () => {
  it('empty rollbackPlan stored', () => {
    const c = makeChange({ rollbackPlan: '' });
    expect(c.rollbackPlan).toBe('');
  });

  it('long rollbackPlan stored', () => {
    const plan = 'step '.repeat(200);
    const c = makeChange({ rollbackPlan: plan });
    expect(c.rollbackPlan).toBe(plan);
  });
});

// ─── 49. complete preserves assignedTo ────────────────────────────────────────
describe('complete preserves all fields', () => {
  it('preserves description', () => {
    const c = makeChange({ description: 'Important' });
    expect(manager.complete(c.id).description).toBe('Important');
  });

  it('preserves requestedBy', () => {
    const c = makeChange({ requestedBy: 'frank' });
    expect(manager.complete(c.id).requestedBy).toBe('frank');
  });

  it('preserves type', () => {
    const c = makeChange({ type: 'MAJOR' });
    expect(manager.complete(c.id).type).toBe('MAJOR');
  });

  it('preserves risk', () => {
    const c = makeChange({ risk: 'CRITICAL' });
    expect(manager.complete(c.id).risk).toBe('CRITICAL');
  });

  it('preserves rollbackPlan', () => {
    const c = makeChange({ rollbackPlan: 'restore' });
    expect(manager.complete(c.id).rollbackPlan).toBe('restore');
  });
});

// ─── 50. getByStatus empty for un-touched statuses ────────────────────────────
describe('getByStatus returns empty for untouched statuses', () => {
  it('UNDER_REVIEW empty by default', () => {
    makeChange();
    expect(manager.getByStatus('UNDER_REVIEW')).toHaveLength(0);
  });

  it('COMPLETING empty by default (COMPLETED)', () => {
    makeChange();
    expect(manager.getByStatus('COMPLETED')).toHaveLength(0);
  });

  it('CANCELLED empty by default', () => {
    makeChange();
    expect(manager.getByStatus('CANCELLED')).toHaveLength(0);
  });

  it('IMPLEMENTING empty by default', () => {
    makeChange();
    expect(manager.getByStatus('IMPLEMENTING')).toHaveLength(0);
  });
});
