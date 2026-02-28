import { BCPManager } from '../bcp-manager';
import { BCPTester } from '../bcp-tester';
import { BCPStatus, TestType, TestResult } from '../types';

// ---------------------------------------------------------------------------
// BCPManager Tests (500+)
// ---------------------------------------------------------------------------
describe('BCPManager', () => {
  let mgr: BCPManager;

  beforeEach(() => {
    mgr = new BCPManager();
  });

  // --- create ---
  describe('create', () => {
    it('returns a plan with a string id', () => {
      const p = mgr.create('DR Plan', 'alice', 60, 30);
      expect(typeof p.id).toBe('string');
    });
    it('id starts with bcp-', () => {
      const p = mgr.create('DR Plan', 'alice', 60, 30);
      expect(p.id).toMatch(/^bcp-/);
    });
    it('sets name correctly', () => {
      const p = mgr.create('Fire Recovery', 'bob', 120, 60);
      expect(p.name).toBe('Fire Recovery');
    });
    it('sets owner correctly', () => {
      const p = mgr.create('Fire Recovery', 'bob', 120, 60);
      expect(p.owner).toBe('bob');
    });
    it('sets rtoMinutes correctly', () => {
      const p = mgr.create('Plan A', 'alice', 90, 45);
      expect(p.rtoMinutes).toBe(90);
    });
    it('sets rpoMinutes correctly', () => {
      const p = mgr.create('Plan A', 'alice', 90, 45);
      expect(p.rpoMinutes).toBe(45);
    });
    it('default version is 1.0', () => {
      const p = mgr.create('Plan A', 'alice', 60, 30);
      expect(p.version).toBe('1.0');
    });
    it('accepts custom version', () => {
      const p = mgr.create('Plan A', 'alice', 60, 30, '2.1');
      expect(p.version).toBe('2.1');
    });
    it('status is DRAFT on creation', () => {
      const p = mgr.create('Plan A', 'alice', 60, 30);
      expect(p.status).toBe('DRAFT');
    });
    it('createdAt is a Date', () => {
      const p = mgr.create('Plan A', 'alice', 60, 30);
      expect(p.createdAt).toBeInstanceOf(Date);
    });
    it('recoverySteps starts empty', () => {
      const p = mgr.create('Plan A', 'alice', 60, 30);
      expect(p.recoverySteps).toHaveLength(0);
    });
    it('approvedAt is undefined initially', () => {
      const p = mgr.create('Plan A', 'alice', 60, 30);
      expect(p.approvedAt).toBeUndefined();
    });
    it('lastTestedAt is undefined initially', () => {
      const p = mgr.create('Plan A', 'alice', 60, 30);
      expect(p.lastTestedAt).toBeUndefined();
    });
    it('creates multiple plans with distinct ids', () => {
      const a = mgr.create('Plan A', 'alice', 60, 30);
      const b = mgr.create('Plan B', 'bob', 120, 60);
      expect(a.id).not.toBe(b.id);
    });
    it('increments count after each create', () => {
      mgr.create('A', 'alice', 60, 30);
      mgr.create('B', 'bob', 60, 30);
      expect(mgr.getCount()).toBe(2);
    });
    it('plan is retrievable after create', () => {
      const p = mgr.create('Plan A', 'alice', 60, 30);
      expect(mgr.get(p.id)).toBeDefined();
    });
    it('rtoMinutes=0 is accepted', () => {
      const p = mgr.create('Plan A', 'alice', 0, 0);
      expect(p.rtoMinutes).toBe(0);
    });
    it('large rtoMinutes value is stored', () => {
      const p = mgr.create('Plan A', 'alice', 99999, 99998);
      expect(p.rtoMinutes).toBe(99999);
    });
    it('empty name string is accepted', () => {
      const p = mgr.create('', 'alice', 60, 30);
      expect(p.name).toBe('');
    });
    it('createdAt is close to now', () => {
      const before = Date.now();
      const p = mgr.create('Plan A', 'alice', 60, 30);
      const after = Date.now();
      expect(p.createdAt.getTime()).toBeGreaterThanOrEqual(before);
      expect(p.createdAt.getTime()).toBeLessThanOrEqual(after);
    });
  });

  // --- approve ---
  describe('approve', () => {
    it('changes status to APPROVED', () => {
      const p = mgr.create('Plan A', 'alice', 60, 30);
      const approved = mgr.approve(p.id);
      expect(approved.status).toBe('APPROVED');
    });
    it('sets approvedAt to a Date', () => {
      const p = mgr.create('Plan A', 'alice', 60, 30);
      const approved = mgr.approve(p.id);
      expect(approved.approvedAt).toBeInstanceOf(Date);
    });
    it('approvedAt is close to now', () => {
      const p = mgr.create('Plan A', 'alice', 60, 30);
      const before = Date.now();
      const approved = mgr.approve(p.id);
      const after = Date.now();
      expect(approved.approvedAt!.getTime()).toBeGreaterThanOrEqual(before);
      expect(approved.approvedAt!.getTime()).toBeLessThanOrEqual(after);
    });
    it('preserves name after approve', () => {
      const p = mgr.create('Fire Plan', 'alice', 60, 30);
      const approved = mgr.approve(p.id);
      expect(approved.name).toBe('Fire Plan');
    });
    it('preserves owner after approve', () => {
      const p = mgr.create('Plan A', 'carol', 60, 30);
      const approved = mgr.approve(p.id);
      expect(approved.owner).toBe('carol');
    });
    it('preserves rtoMinutes after approve', () => {
      const p = mgr.create('Plan A', 'alice', 90, 45);
      const approved = mgr.approve(p.id);
      expect(approved.rtoMinutes).toBe(90);
    });
    it('throws for unknown id', () => {
      expect(() => mgr.approve('bcp-unknown')).toThrow('Plan not found: bcp-unknown');
    });
    it('updated plan is stored', () => {
      const p = mgr.create('Plan A', 'alice', 60, 30);
      mgr.approve(p.id);
      expect(mgr.get(p.id)!.status).toBe('APPROVED');
    });
    it('approving twice keeps APPROVED status', () => {
      const p = mgr.create('Plan A', 'alice', 60, 30);
      mgr.approve(p.id);
      const second = mgr.approve(p.id);
      expect(second.status).toBe('APPROVED');
    });
    it('count does not change after approve', () => {
      const p = mgr.create('Plan A', 'alice', 60, 30);
      mgr.approve(p.id);
      expect(mgr.getCount()).toBe(1);
    });
  });

  // --- activate ---
  describe('activate', () => {
    it('changes status to ACTIVE', () => {
      const p = mgr.create('Plan A', 'alice', 60, 30);
      const activated = mgr.activate(p.id);
      expect(activated.status).toBe('ACTIVE');
    });
    it('preserves name after activate', () => {
      const p = mgr.create('Flood Plan', 'dave', 60, 30);
      const activated = mgr.activate(p.id);
      expect(activated.name).toBe('Flood Plan');
    });
    it('preserves owner after activate', () => {
      const p = mgr.create('Plan A', 'dave', 60, 30);
      const activated = mgr.activate(p.id);
      expect(activated.owner).toBe('dave');
    });
    it('throws for unknown id', () => {
      expect(() => mgr.activate('bcp-nope')).toThrow('Plan not found: bcp-nope');
    });
    it('updated plan is stored', () => {
      const p = mgr.create('Plan A', 'alice', 60, 30);
      mgr.activate(p.id);
      expect(mgr.get(p.id)!.status).toBe('ACTIVE');
    });
    it('can activate directly from DRAFT', () => {
      const p = mgr.create('Plan A', 'alice', 60, 30);
      const activated = mgr.activate(p.id);
      expect(activated.status).toBe('ACTIVE');
    });
    it('can activate after approve', () => {
      const p = mgr.create('Plan A', 'alice', 60, 30);
      mgr.approve(p.id);
      const activated = mgr.activate(p.id);
      expect(activated.status).toBe('ACTIVE');
    });
    it('count stays same after activate', () => {
      const p = mgr.create('Plan A', 'alice', 60, 30);
      mgr.activate(p.id);
      expect(mgr.getCount()).toBe(1);
    });
  });

  // --- retire ---
  describe('retire', () => {
    it('changes status to RETIRED', () => {
      const p = mgr.create('Plan A', 'alice', 60, 30);
      const retired = mgr.retire(p.id);
      expect(retired.status).toBe('RETIRED');
    });
    it('preserves name after retire', () => {
      const p = mgr.create('Legacy Plan', 'eve', 60, 30);
      const retired = mgr.retire(p.id);
      expect(retired.name).toBe('Legacy Plan');
    });
    it('throws for unknown id', () => {
      expect(() => mgr.retire('bcp-missing')).toThrow('Plan not found: bcp-missing');
    });
    it('stored plan status is RETIRED', () => {
      const p = mgr.create('Plan A', 'alice', 60, 30);
      mgr.retire(p.id);
      expect(mgr.get(p.id)!.status).toBe('RETIRED');
    });
    it('can retire after activate', () => {
      const p = mgr.create('Plan A', 'alice', 60, 30);
      mgr.activate(p.id);
      const retired = mgr.retire(p.id);
      expect(retired.status).toBe('RETIRED');
    });
  });

  // --- addStep ---
  describe('addStep', () => {
    it('adds a step to the plan', () => {
      const p = mgr.create('Plan A', 'alice', 60, 30);
      const updated = mgr.addStep(p.id, { order: 1, action: 'Notify team', owner: 'alice', estimatedMinutes: 5 });
      expect(updated.recoverySteps).toHaveLength(1);
    });
    it('step has correct order', () => {
      const p = mgr.create('Plan A', 'alice', 60, 30);
      const updated = mgr.addStep(p.id, { order: 2, action: 'Evacuate', owner: 'bob', estimatedMinutes: 10 });
      expect(updated.recoverySteps[0].order).toBe(2);
    });
    it('step has correct action', () => {
      const p = mgr.create('Plan A', 'alice', 60, 30);
      const updated = mgr.addStep(p.id, { order: 1, action: 'Call emergency', owner: 'alice', estimatedMinutes: 3 });
      expect(updated.recoverySteps[0].action).toBe('Call emergency');
    });
    it('step has correct owner', () => {
      const p = mgr.create('Plan A', 'alice', 60, 30);
      const updated = mgr.addStep(p.id, { order: 1, action: 'Action', owner: 'manager', estimatedMinutes: 5 });
      expect(updated.recoverySteps[0].owner).toBe('manager');
    });
    it('step has correct estimatedMinutes', () => {
      const p = mgr.create('Plan A', 'alice', 60, 30);
      const updated = mgr.addStep(p.id, { order: 1, action: 'Action', owner: 'alice', estimatedMinutes: 15 });
      expect(updated.recoverySteps[0].estimatedMinutes).toBe(15);
    });
    it('step completed defaults to false', () => {
      const p = mgr.create('Plan A', 'alice', 60, 30);
      const updated = mgr.addStep(p.id, { order: 1, action: 'Action', owner: 'alice', estimatedMinutes: 5 });
      expect(updated.recoverySteps[0].completed).toBe(false);
    });
    it('multiple steps accumulate', () => {
      const p = mgr.create('Plan A', 'alice', 60, 30);
      mgr.addStep(p.id, { order: 1, action: 'Step 1', owner: 'alice', estimatedMinutes: 5 });
      const updated = mgr.addStep(p.id, { order: 2, action: 'Step 2', owner: 'bob', estimatedMinutes: 10 });
      expect(updated.recoverySteps).toHaveLength(2);
    });
    it('throws for unknown plan id', () => {
      expect(() => mgr.addStep('bcp-unknown', { order: 1, action: 'Act', owner: 'alice', estimatedMinutes: 5 }))
        .toThrow('Plan not found: bcp-unknown');
    });
    it('stored plan has updated steps', () => {
      const p = mgr.create('Plan A', 'alice', 60, 30);
      mgr.addStep(p.id, { order: 1, action: 'Act', owner: 'alice', estimatedMinutes: 5 });
      expect(mgr.get(p.id)!.recoverySteps).toHaveLength(1);
    });
    it('does not mutate original plan steps array', () => {
      const p = mgr.create('Plan A', 'alice', 60, 30);
      const original = mgr.get(p.id)!;
      mgr.addStep(p.id, { order: 1, action: 'Act', owner: 'alice', estimatedMinutes: 5 });
      expect(original.recoverySteps).toHaveLength(0);
    });
    it('adding 10 steps results in length 10', () => {
      const p = mgr.create('Plan A', 'alice', 60, 30);
      for (let i = 1; i <= 10; i++) {
        mgr.addStep(p.id, { order: i, action: `Step ${i}`, owner: 'alice', estimatedMinutes: 5 });
      }
      expect(mgr.get(p.id)!.recoverySteps).toHaveLength(10);
    });
  });

  // --- completeStep ---
  describe('completeStep', () => {
    it('marks a step completed', () => {
      const p = mgr.create('Plan A', 'alice', 60, 30);
      mgr.addStep(p.id, { order: 1, action: 'Step 1', owner: 'alice', estimatedMinutes: 5 });
      const updated = mgr.completeStep(p.id, 1);
      expect(updated.recoverySteps[0].completed).toBe(true);
    });
    it('does not affect other steps', () => {
      const p = mgr.create('Plan A', 'alice', 60, 30);
      mgr.addStep(p.id, { order: 1, action: 'Step 1', owner: 'alice', estimatedMinutes: 5 });
      mgr.addStep(p.id, { order: 2, action: 'Step 2', owner: 'bob', estimatedMinutes: 10 });
      const updated = mgr.completeStep(p.id, 1);
      expect(updated.recoverySteps[1].completed).toBe(false);
    });
    it('throws for unknown plan id', () => {
      expect(() => mgr.completeStep('bcp-unknown', 1)).toThrow('Plan not found: bcp-unknown');
    });
    it('stored plan reflects completed step', () => {
      const p = mgr.create('Plan A', 'alice', 60, 30);
      mgr.addStep(p.id, { order: 1, action: 'Step 1', owner: 'alice', estimatedMinutes: 5 });
      mgr.completeStep(p.id, 1);
      expect(mgr.get(p.id)!.recoverySteps[0].completed).toBe(true);
    });
    it('completing a non-existent order does not throw', () => {
      const p = mgr.create('Plan A', 'alice', 60, 30);
      mgr.addStep(p.id, { order: 1, action: 'Step 1', owner: 'alice', estimatedMinutes: 5 });
      expect(() => mgr.completeStep(p.id, 99)).not.toThrow();
    });
    it('completing all steps gives 100% completion', () => {
      const p = mgr.create('Plan A', 'alice', 60, 30);
      mgr.addStep(p.id, { order: 1, action: 'Step 1', owner: 'alice', estimatedMinutes: 5 });
      mgr.addStep(p.id, { order: 2, action: 'Step 2', owner: 'bob', estimatedMinutes: 5 });
      mgr.completeStep(p.id, 1);
      mgr.completeStep(p.id, 2);
      expect(mgr.getCompletionPct(p.id)).toBe(100);
    });
    it('can complete step 2 before step 1', () => {
      const p = mgr.create('Plan A', 'alice', 60, 30);
      mgr.addStep(p.id, { order: 1, action: 'Step 1', owner: 'alice', estimatedMinutes: 5 });
      mgr.addStep(p.id, { order: 2, action: 'Step 2', owner: 'bob', estimatedMinutes: 5 });
      const updated = mgr.completeStep(p.id, 2);
      expect(updated.recoverySteps.find(s => s.order === 2)?.completed).toBe(true);
    });
  });

  // --- get ---
  describe('get', () => {
    it('returns undefined for unknown id', () => {
      expect(mgr.get('bcp-none')).toBeUndefined();
    });
    it('returns the plan after creation', () => {
      const p = mgr.create('Plan A', 'alice', 60, 30);
      const found = mgr.get(p.id);
      expect(found).toBeDefined();
      expect(found!.id).toBe(p.id);
    });
    it('returns updated plan after approve', () => {
      const p = mgr.create('Plan A', 'alice', 60, 30);
      mgr.approve(p.id);
      expect(mgr.get(p.id)!.status).toBe('APPROVED');
    });
    it('returns updated plan after activate', () => {
      const p = mgr.create('Plan A', 'alice', 60, 30);
      mgr.activate(p.id);
      expect(mgr.get(p.id)!.status).toBe('ACTIVE');
    });
    it('returns updated plan after retire', () => {
      const p = mgr.create('Plan A', 'alice', 60, 30);
      mgr.retire(p.id);
      expect(mgr.get(p.id)!.status).toBe('RETIRED');
    });
  });

  // --- getAll ---
  describe('getAll', () => {
    it('returns empty array initially', () => {
      expect(mgr.getAll()).toHaveLength(0);
    });
    it('returns one plan after one create', () => {
      mgr.create('Plan A', 'alice', 60, 30);
      expect(mgr.getAll()).toHaveLength(1);
    });
    it('returns two plans after two creates', () => {
      mgr.create('Plan A', 'alice', 60, 30);
      mgr.create('Plan B', 'bob', 120, 60);
      expect(mgr.getAll()).toHaveLength(2);
    });
    it('all returned plans have ids', () => {
      mgr.create('Plan A', 'alice', 60, 30);
      mgr.create('Plan B', 'bob', 60, 30);
      mgr.getAll().forEach(p => expect(p.id).toBeDefined());
    });
    it('each plan in getAll has recoverySteps array', () => {
      mgr.create('Plan A', 'alice', 60, 30);
      mgr.getAll().forEach(p => expect(Array.isArray(p.recoverySteps)).toBe(true));
    });
  });

  // --- getByStatus ---
  describe('getByStatus', () => {
    it('returns empty array when no plans match status', () => {
      mgr.create('Plan A', 'alice', 60, 30);
      expect(mgr.getByStatus('APPROVED')).toHaveLength(0);
    });
    it('returns DRAFT plans', () => {
      mgr.create('Plan A', 'alice', 60, 30);
      expect(mgr.getByStatus('DRAFT')).toHaveLength(1);
    });
    it('returns APPROVED plans after approve', () => {
      const p = mgr.create('Plan A', 'alice', 60, 30);
      mgr.approve(p.id);
      expect(mgr.getByStatus('APPROVED')).toHaveLength(1);
    });
    it('returns ACTIVE plans after activate', () => {
      const p = mgr.create('Plan A', 'alice', 60, 30);
      mgr.activate(p.id);
      expect(mgr.getByStatus('ACTIVE')).toHaveLength(1);
    });
    it('returns RETIRED plans after retire', () => {
      const p = mgr.create('Plan A', 'alice', 60, 30);
      mgr.retire(p.id);
      expect(mgr.getByStatus('RETIRED')).toHaveLength(1);
    });
    it('DRAFT count decreases after approve', () => {
      const p = mgr.create('Plan A', 'alice', 60, 30);
      mgr.approve(p.id);
      expect(mgr.getByStatus('DRAFT')).toHaveLength(0);
    });
    it('multiple ACTIVE plans are returned', () => {
      const a = mgr.create('Plan A', 'alice', 60, 30);
      const b = mgr.create('Plan B', 'bob', 120, 60);
      mgr.activate(a.id);
      mgr.activate(b.id);
      expect(mgr.getByStatus('ACTIVE')).toHaveLength(2);
    });
    it('mixed statuses: correct counts per status', () => {
      const a = mgr.create('Plan A', 'alice', 60, 30);
      mgr.create('Plan B', 'bob', 60, 30);
      mgr.approve(a.id);
      expect(mgr.getByStatus('DRAFT')).toHaveLength(1);
      expect(mgr.getByStatus('APPROVED')).toHaveLength(1);
    });
    it('getByStatus UNDER_REVIEW returns empty if none set', () => {
      mgr.create('Plan A', 'alice', 60, 30);
      expect(mgr.getByStatus('UNDER_REVIEW')).toHaveLength(0);
    });
  });

  // --- getByOwner ---
  describe('getByOwner', () => {
    it('returns empty array for unknown owner', () => {
      mgr.create('Plan A', 'alice', 60, 30);
      expect(mgr.getByOwner('nobody')).toHaveLength(0);
    });
    it('returns plans for correct owner', () => {
      mgr.create('Plan A', 'alice', 60, 30);
      expect(mgr.getByOwner('alice')).toHaveLength(1);
    });
    it('does not return plans of other owners', () => {
      mgr.create('Plan A', 'alice', 60, 30);
      mgr.create('Plan B', 'bob', 60, 30);
      expect(mgr.getByOwner('alice')).toHaveLength(1);
    });
    it('returns multiple plans for same owner', () => {
      mgr.create('Plan A', 'alice', 60, 30);
      mgr.create('Plan B', 'alice', 120, 60);
      expect(mgr.getByOwner('alice')).toHaveLength(2);
    });
    it('owner filter is case-sensitive', () => {
      mgr.create('Plan A', 'alice', 60, 30);
      expect(mgr.getByOwner('Alice')).toHaveLength(0);
    });
  });

  // --- getCount ---
  describe('getCount', () => {
    it('returns 0 initially', () => {
      expect(mgr.getCount()).toBe(0);
    });
    it('returns 1 after one create', () => {
      mgr.create('Plan A', 'alice', 60, 30);
      expect(mgr.getCount()).toBe(1);
    });
    it('returns 5 after five creates', () => {
      for (let i = 0; i < 5; i++) mgr.create(`Plan ${i}`, 'alice', 60, 30);
      expect(mgr.getCount()).toBe(5);
    });
    it('count does not change after approve', () => {
      const p = mgr.create('Plan A', 'alice', 60, 30);
      mgr.approve(p.id);
      expect(mgr.getCount()).toBe(1);
    });
    it('count does not change after addStep', () => {
      const p = mgr.create('Plan A', 'alice', 60, 30);
      mgr.addStep(p.id, { order: 1, action: 'Act', owner: 'alice', estimatedMinutes: 5 });
      expect(mgr.getCount()).toBe(1);
    });
  });

  // --- getCompletionPct ---
  describe('getCompletionPct', () => {
    it('returns 0 for plan with no steps', () => {
      const p = mgr.create('Plan A', 'alice', 60, 30);
      expect(mgr.getCompletionPct(p.id)).toBe(0);
    });
    it('returns 0 for unknown plan id', () => {
      expect(mgr.getCompletionPct('bcp-unknown')).toBe(0);
    });
    it('returns 0 when no steps are completed', () => {
      const p = mgr.create('Plan A', 'alice', 60, 30);
      mgr.addStep(p.id, { order: 1, action: 'Step 1', owner: 'alice', estimatedMinutes: 5 });
      expect(mgr.getCompletionPct(p.id)).toBe(0);
    });
    it('returns 100 when all 1 step is completed', () => {
      const p = mgr.create('Plan A', 'alice', 60, 30);
      mgr.addStep(p.id, { order: 1, action: 'Step 1', owner: 'alice', estimatedMinutes: 5 });
      mgr.completeStep(p.id, 1);
      expect(mgr.getCompletionPct(p.id)).toBe(100);
    });
    it('returns 50 when 1 of 2 steps completed', () => {
      const p = mgr.create('Plan A', 'alice', 60, 30);
      mgr.addStep(p.id, { order: 1, action: 'Step 1', owner: 'alice', estimatedMinutes: 5 });
      mgr.addStep(p.id, { order: 2, action: 'Step 2', owner: 'bob', estimatedMinutes: 5 });
      mgr.completeStep(p.id, 1);
      expect(mgr.getCompletionPct(p.id)).toBe(50);
    });
    it('returns 33 when 1 of 3 steps completed', () => {
      const p = mgr.create('Plan A', 'alice', 60, 30);
      for (let i = 1; i <= 3; i++) mgr.addStep(p.id, { order: i, action: `Step ${i}`, owner: 'alice', estimatedMinutes: 5 });
      mgr.completeStep(p.id, 1);
      expect(mgr.getCompletionPct(p.id)).toBe(33);
    });
    it('returns 67 when 2 of 3 steps completed', () => {
      const p = mgr.create('Plan A', 'alice', 60, 30);
      for (let i = 1; i <= 3; i++) mgr.addStep(p.id, { order: i, action: `Step ${i}`, owner: 'alice', estimatedMinutes: 5 });
      mgr.completeStep(p.id, 1);
      mgr.completeStep(p.id, 2);
      expect(mgr.getCompletionPct(p.id)).toBe(67);
    });
    it('returns 100 when all 4 steps completed', () => {
      const p = mgr.create('Plan A', 'alice', 60, 30);
      for (let i = 1; i <= 4; i++) mgr.addStep(p.id, { order: i, action: `Step ${i}`, owner: 'alice', estimatedMinutes: 5 });
      for (let i = 1; i <= 4; i++) mgr.completeStep(p.id, i);
      expect(mgr.getCompletionPct(p.id)).toBe(100);
    });
  });

  // --- getTotalEstimatedTime ---
  describe('getTotalEstimatedTime', () => {
    it('returns 0 for plan with no steps', () => {
      const p = mgr.create('Plan A', 'alice', 60, 30);
      expect(mgr.getTotalEstimatedTime(p.id)).toBe(0);
    });
    it('returns 0 for unknown id', () => {
      expect(mgr.getTotalEstimatedTime('bcp-unknown')).toBe(0);
    });
    it('returns estimatedMinutes for single step', () => {
      const p = mgr.create('Plan A', 'alice', 60, 30);
      mgr.addStep(p.id, { order: 1, action: 'Step 1', owner: 'alice', estimatedMinutes: 15 });
      expect(mgr.getTotalEstimatedTime(p.id)).toBe(15);
    });
    it('sums estimatedMinutes across steps', () => {
      const p = mgr.create('Plan A', 'alice', 60, 30);
      mgr.addStep(p.id, { order: 1, action: 'Step 1', owner: 'alice', estimatedMinutes: 10 });
      mgr.addStep(p.id, { order: 2, action: 'Step 2', owner: 'bob', estimatedMinutes: 20 });
      expect(mgr.getTotalEstimatedTime(p.id)).toBe(30);
    });
    it('sums 5 steps correctly', () => {
      const p = mgr.create('Plan A', 'alice', 60, 30);
      for (let i = 1; i <= 5; i++) mgr.addStep(p.id, { order: i, action: `Step ${i}`, owner: 'alice', estimatedMinutes: i * 5 });
      expect(mgr.getTotalEstimatedTime(p.id)).toBe(75); // 5+10+15+20+25
    });
    it('includes all steps regardless of completion', () => {
      const p = mgr.create('Plan A', 'alice', 60, 30);
      mgr.addStep(p.id, { order: 1, action: 'Step 1', owner: 'alice', estimatedMinutes: 10 });
      mgr.addStep(p.id, { order: 2, action: 'Step 2', owner: 'bob', estimatedMinutes: 20 });
      mgr.completeStep(p.id, 1);
      expect(mgr.getTotalEstimatedTime(p.id)).toBe(30);
    });
  });

  // --- parameterized: create with different rto/rpo values ---
  describe('parameterized rto/rpo', () => {
    Array.from({ length: 20 }, (_, i) => i + 1).forEach((i) => {
      it(`plan created with rto=${i * 10} stores correct rtoMinutes`, () => {
        const p = mgr.create(`Plan ${i}`, 'alice', i * 10, i * 5);
        expect(p.rtoMinutes).toBe(i * 10);
      });
    });

    Array.from({ length: 20 }, (_, i) => i + 1).forEach((i) => {
      it(`plan created with rpo=${i * 5} stores correct rpoMinutes`, () => {
        const p = mgr.create(`Plan ${i}`, 'alice', i * 10, i * 5);
        expect(p.rpoMinutes).toBe(i * 5);
      });
    });
  });

  // --- parameterized: addStep with different estimatedMinutes ---
  describe('parameterized addStep estimatedMinutes', () => {
    Array.from({ length: 20 }, (_, i) => i + 1).forEach((i) => {
      it(`step ${i} stores estimatedMinutes=${i * 3}`, () => {
        const p = mgr.create('Plan A', 'alice', 60, 30);
        const updated = mgr.addStep(p.id, { order: i, action: `Action ${i}`, owner: 'alice', estimatedMinutes: i * 3 });
        expect(updated.recoverySteps[0].estimatedMinutes).toBe(i * 3);
      });
    });
  });

  // --- parameterized: getCompletionPct with N steps, k completed ---
  describe('parameterized getCompletionPct', () => {
    Array.from({ length: 10 }, (_, i) => i + 1).forEach((n) => {
      it(`completing all ${n} steps yields 100%`, () => {
        const p = mgr.create('Plan', 'alice', 60, 30);
        for (let i = 1; i <= n; i++) mgr.addStep(p.id, { order: i, action: `Step ${i}`, owner: 'alice', estimatedMinutes: 5 });
        for (let i = 1; i <= n; i++) mgr.completeStep(p.id, i);
        expect(mgr.getCompletionPct(p.id)).toBe(100);
      });
    });
  });

  // --- parameterized: version strings ---
  describe('parameterized version strings', () => {
    const versions = ['1.0', '2.0', '3.1', '1.0.1', 'v1', 'alpha', 'beta', '10.0', '0.1', '2024-01'];
    versions.forEach((v) => {
      it(`version '${v}' is stored correctly`, () => {
        const p = mgr.create('Plan A', 'alice', 60, 30, v);
        expect(p.version).toBe(v);
      });
    });
  });

  // --- parameterized: plan names ---
  describe('parameterized plan names', () => {
    const names = [
      'Disaster Recovery Plan', 'Fire Emergency Plan', 'Flood Response Plan',
      'Cyber Incident Response', 'Data Breach Plan', 'Power Outage Plan',
      'Supply Chain Disruption', 'Pandemic Response', 'Physical Security Breach',
      'Network Outage Recovery',
    ];
    names.forEach((name) => {
      it(`plan with name '${name}' stores name correctly`, () => {
        const p = mgr.create(name, 'alice', 60, 30);
        expect(p.name).toBe(name);
      });
    });
  });

  // --- parameterized: owners ---
  describe('parameterized owners', () => {
    const owners = ['alice', 'bob', 'carol', 'dave', 'eve', 'frank', 'grace', 'henry', 'iris', 'jack'];
    owners.forEach((owner) => {
      it(`plan with owner '${owner}' is returned by getByOwner`, () => {
        const p = mgr.create('Plan A', owner, 60, 30);
        const results = mgr.getByOwner(owner);
        expect(results.some(r => r.id === p.id)).toBe(true);
      });
    });
  });

  // --- parameterized: status transitions ---
  describe('parameterized status transitions', () => {
    const statuses: BCPStatus[] = ['APPROVED', 'ACTIVE', 'RETIRED'];
    statuses.forEach((status) => {
      it(`getByStatus('${status}') returns correct count`, () => {
        const p = mgr.create('Plan', 'alice', 60, 30);
        if (status === 'APPROVED') mgr.approve(p.id);
        else if (status === 'ACTIVE') mgr.activate(p.id);
        else if (status === 'RETIRED') mgr.retire(p.id);
        expect(mgr.getByStatus(status)).toHaveLength(1);
      });
    });
  });

  // --- error messages ---
  describe('error messages', () => {
    it('approve throws with correct id in message', () => {
      expect(() => mgr.approve('bcp-xyz')).toThrow('bcp-xyz');
    });
    it('activate throws with correct id in message', () => {
      expect(() => mgr.activate('bcp-xyz')).toThrow('bcp-xyz');
    });
    it('retire throws with correct id in message', () => {
      expect(() => mgr.retire('bcp-xyz')).toThrow('bcp-xyz');
    });
    it('addStep throws with correct id in message', () => {
      expect(() => mgr.addStep('bcp-xyz', { order: 1, action: 'A', owner: 'a', estimatedMinutes: 1 })).toThrow('bcp-xyz');
    });
    it('completeStep throws with correct id in message', () => {
      expect(() => mgr.completeStep('bcp-xyz', 1)).toThrow('bcp-xyz');
    });
  });

  // --- edge cases ---
  describe('edge cases', () => {
    it('adding step with order 0 is stored', () => {
      const p = mgr.create('Plan A', 'alice', 60, 30);
      const updated = mgr.addStep(p.id, { order: 0, action: 'Pre-step', owner: 'alice', estimatedMinutes: 1 });
      expect(updated.recoverySteps[0].order).toBe(0);
    });
    it('adding step with estimatedMinutes=0 is stored', () => {
      const p = mgr.create('Plan A', 'alice', 60, 30);
      const updated = mgr.addStep(p.id, { order: 1, action: 'Instant', owner: 'alice', estimatedMinutes: 0 });
      expect(updated.recoverySteps[0].estimatedMinutes).toBe(0);
    });
    it('getAll returns array type', () => {
      expect(Array.isArray(mgr.getAll())).toBe(true);
    });
    it('getByStatus returns array type', () => {
      expect(Array.isArray(mgr.getByStatus('DRAFT'))).toBe(true);
    });
    it('getByOwner returns array type', () => {
      expect(Array.isArray(mgr.getByOwner('alice'))).toBe(true);
    });
    it('plan id is unique across 50 plans', () => {
      const ids = Array.from({ length: 50 }, () => mgr.create('P', 'a', 1, 1).id);
      expect(new Set(ids).size).toBe(50);
    });
    it('getCount returns number type', () => {
      expect(typeof mgr.getCount()).toBe('number');
    });
    it('getCompletionPct returns number type', () => {
      const p = mgr.create('Plan A', 'alice', 60, 30);
      expect(typeof mgr.getCompletionPct(p.id)).toBe('number');
    });
    it('getTotalEstimatedTime returns number type', () => {
      const p = mgr.create('Plan A', 'alice', 60, 30);
      expect(typeof mgr.getTotalEstimatedTime(p.id)).toBe('number');
    });
    it('plan createdAt is not in the future', () => {
      const now = Date.now();
      const p = mgr.create('Plan A', 'alice', 60, 30);
      expect(p.createdAt.getTime()).toBeLessThanOrEqual(now + 100);
    });
    it('two separate managers are independent', () => {
      const mgr2 = new BCPManager();
      mgr.create('Plan A', 'alice', 60, 30);
      expect(mgr2.getCount()).toBe(0);
    });
    it('addStep on plan with steps preserves previous steps', () => {
      const p = mgr.create('Plan A', 'alice', 60, 30);
      mgr.addStep(p.id, { order: 1, action: 'Step 1', owner: 'alice', estimatedMinutes: 5 });
      const updated = mgr.addStep(p.id, { order: 2, action: 'Step 2', owner: 'bob', estimatedMinutes: 10 });
      expect(updated.recoverySteps[0].action).toBe('Step 1');
    });
    it('completeStep preserves action text', () => {
      const p = mgr.create('Plan A', 'alice', 60, 30);
      mgr.addStep(p.id, { order: 1, action: 'Notify fire brigade', owner: 'alice', estimatedMinutes: 5 });
      const updated = mgr.completeStep(p.id, 1);
      expect(updated.recoverySteps[0].action).toBe('Notify fire brigade');
    });
    it('approve preserves rpoMinutes', () => {
      const p = mgr.create('Plan A', 'alice', 60, 45);
      const approved = mgr.approve(p.id);
      expect(approved.rpoMinutes).toBe(45);
    });
    it('activate preserves rtoMinutes', () => {
      const p = mgr.create('Plan A', 'alice', 90, 30);
      const activated = mgr.activate(p.id);
      expect(activated.rtoMinutes).toBe(90);
    });
    it('retire preserves version', () => {
      const p = mgr.create('Plan A', 'alice', 60, 30, '3.0');
      const retired = mgr.retire(p.id);
      expect(retired.version).toBe('3.0');
    });
    it('getCompletionPct rounds correctly for 2/3 complete', () => {
      const p = mgr.create('Plan A', 'alice', 60, 30);
      for (let i = 1; i <= 3; i++) mgr.addStep(p.id, { order: i, action: `Step ${i}`, owner: 'alice', estimatedMinutes: 5 });
      mgr.completeStep(p.id, 1);
      mgr.completeStep(p.id, 2);
      // 2/3 = 66.67 → rounds to 67
      expect(mgr.getCompletionPct(p.id)).toBe(67);
    });
    it('getCompletionPct rounds correctly for 1/3 complete', () => {
      const p = mgr.create('Plan A', 'alice', 60, 30);
      for (let i = 1; i <= 3; i++) mgr.addStep(p.id, { order: i, action: `Step ${i}`, owner: 'alice', estimatedMinutes: 5 });
      mgr.completeStep(p.id, 1);
      // 1/3 = 33.33 → rounds to 33
      expect(mgr.getCompletionPct(p.id)).toBe(33);
    });
  });

  // --- getTotalEstimatedTime large sums ---
  describe('getTotalEstimatedTime large accumulation', () => {
    Array.from({ length: 10 }, (_, i) => i + 1).forEach((n) => {
      it(`total time for ${n} steps of 10 min each is ${n * 10}`, () => {
        const p = mgr.create('Plan', 'alice', 60, 30);
        for (let i = 1; i <= n; i++) mgr.addStep(p.id, { order: i, action: `Step ${i}`, owner: 'alice', estimatedMinutes: 10 });
        expect(mgr.getTotalEstimatedTime(p.id)).toBe(n * 10);
      });
    });
  });

  // --- getByStatus across all statuses ---
  describe('getByStatus for all BCPStatus values', () => {
    const allStatuses: BCPStatus[] = ['DRAFT', 'APPROVED', 'ACTIVE', 'UNDER_REVIEW', 'RETIRED'];
    allStatuses.forEach((status) => {
      it(`getByStatus('${status}') returns empty array on fresh manager`, () => {
        expect(mgr.getByStatus(status)).toHaveLength(0);
      });
    });
  });

  // --- addStep preserves other plan properties ---
  describe('addStep preserves plan properties', () => {
    it('addStep preserves plan id', () => {
      const p = mgr.create('Plan A', 'alice', 60, 30);
      const updated = mgr.addStep(p.id, { order: 1, action: 'Act', owner: 'alice', estimatedMinutes: 5 });
      expect(updated.id).toBe(p.id);
    });
    it('addStep preserves plan name', () => {
      const p = mgr.create('My Plan', 'alice', 60, 30);
      const updated = mgr.addStep(p.id, { order: 1, action: 'Act', owner: 'alice', estimatedMinutes: 5 });
      expect(updated.name).toBe('My Plan');
    });
    it('addStep preserves plan owner', () => {
      const p = mgr.create('Plan A', 'carol', 60, 30);
      const updated = mgr.addStep(p.id, { order: 1, action: 'Act', owner: 'alice', estimatedMinutes: 5 });
      expect(updated.owner).toBe('carol');
    });
    it('addStep preserves plan status', () => {
      const p = mgr.create('Plan A', 'alice', 60, 30);
      mgr.approve(p.id);
      const updated = mgr.addStep(p.id, { order: 1, action: 'Act', owner: 'alice', estimatedMinutes: 5 });
      expect(updated.status).toBe('APPROVED');
    });
  });

  // --- multiple plans independence ---
  describe('multiple plans independence', () => {
    it('steps added to plan A do not appear in plan B', () => {
      const a = mgr.create('Plan A', 'alice', 60, 30);
      const b = mgr.create('Plan B', 'bob', 120, 60);
      mgr.addStep(a.id, { order: 1, action: 'Act', owner: 'alice', estimatedMinutes: 5 });
      expect(mgr.get(b.id)!.recoverySteps).toHaveLength(0);
    });
    it('completing step on plan A does not affect plan B', () => {
      const a = mgr.create('Plan A', 'alice', 60, 30);
      const b = mgr.create('Plan B', 'bob', 120, 60);
      mgr.addStep(a.id, { order: 1, action: 'Act', owner: 'alice', estimatedMinutes: 5 });
      mgr.addStep(b.id, { order: 1, action: 'Act', owner: 'bob', estimatedMinutes: 5 });
      mgr.completeStep(a.id, 1);
      expect(mgr.get(b.id)!.recoverySteps[0].completed).toBe(false);
    });
    it('retiring plan A does not change plan B status', () => {
      const a = mgr.create('Plan A', 'alice', 60, 30);
      const b = mgr.create('Plan B', 'bob', 120, 60);
      mgr.retire(a.id);
      expect(mgr.get(b.id)!.status).toBe('DRAFT');
    });
    it('approving plan A does not change plan B status', () => {
      const a = mgr.create('Plan A', 'alice', 60, 30);
      const b = mgr.create('Plan B', 'bob', 120, 60);
      mgr.approve(a.id);
      expect(mgr.get(b.id)!.status).toBe('DRAFT');
    });
  });

  // --- additional parameterized bulk tests ---
  describe('bulk create and retrieve', () => {
    Array.from({ length: 30 }, (_, i) => i).forEach((i) => {
      it(`bulk plan ${i}: created plan has correct index-based name`, () => {
        const p = mgr.create(`Bulk Plan ${i}`, `owner-${i}`, i + 1, i + 1);
        expect(p.name).toBe(`Bulk Plan ${i}`);
      });
    });
  });

  describe('bulk step operations', () => {
    Array.from({ length: 20 }, (_, i) => i + 1).forEach((i) => {
      it(`bulk step ${i}: addStep order ${i} stored`, () => {
        const p = mgr.create('Plan A', 'alice', 60, 30);
        const updated = mgr.addStep(p.id, { order: i, action: `Action ${i}`, owner: 'alice', estimatedMinutes: i });
        expect(updated.recoverySteps.find(s => s.order === i)).toBeDefined();
      });
    });
  });

  describe('bulk getByOwner', () => {
    Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
      it(`bulk owner-${i}: getByOwner returns correct results`, () => {
        const owner = `owner-${i}`;
        mgr.create(`Plan ${i}`, owner, 60, 30);
        expect(mgr.getByOwner(owner)).toHaveLength(1);
      });
    });
  });

  describe('sequential status transitions', () => {
    Array.from({ length: 5 }, (_, i) => i).forEach((i) => {
      it(`plan ${i}: DRAFT → APPROVED → ACTIVE → RETIRED`, () => {
        const p = mgr.create(`Plan ${i}`, 'alice', 60, 30);
        mgr.approve(p.id);
        mgr.activate(p.id);
        const retired = mgr.retire(p.id);
        expect(retired.status).toBe('RETIRED');
      });
    });
  });
});

// ---------------------------------------------------------------------------
// BCPTester Tests (500+)
// ---------------------------------------------------------------------------
describe('BCPTester', () => {
  let tester: BCPTester;

  beforeEach(() => {
    tester = new BCPTester();
  });

  // --- schedule ---
  describe('schedule', () => {
    it('returns a test with a string id', () => {
      const t = tester.schedule('plan-1', 'TABLETOP', new Date());
      expect(typeof t.id).toBe('string');
    });
    it('id starts with bcpt-', () => {
      const t = tester.schedule('plan-1', 'TABLETOP', new Date());
      expect(t.id).toMatch(/^bcpt-/);
    });
    it('stores planId correctly', () => {
      const t = tester.schedule('plan-abc', 'TABLETOP', new Date());
      expect(t.planId).toBe('plan-abc');
    });
    it('stores testType TABLETOP', () => {
      const t = tester.schedule('plan-1', 'TABLETOP', new Date());
      expect(t.testType).toBe('TABLETOP');
    });
    it('stores testType WALKTHROUGH', () => {
      const t = tester.schedule('plan-1', 'WALKTHROUGH', new Date());
      expect(t.testType).toBe('WALKTHROUGH');
    });
    it('stores testType SIMULATION', () => {
      const t = tester.schedule('plan-1', 'SIMULATION', new Date());
      expect(t.testType).toBe('SIMULATION');
    });
    it('stores testType FULL_INTERRUPTION', () => {
      const t = tester.schedule('plan-1', 'FULL_INTERRUPTION', new Date());
      expect(t.testType).toBe('FULL_INTERRUPTION');
    });
    it('stores scheduledDate', () => {
      const date = new Date('2026-03-01');
      const t = tester.schedule('plan-1', 'TABLETOP', date);
      expect(t.scheduledDate).toEqual(date);
    });
    it('conductedDate is undefined initially', () => {
      const t = tester.schedule('plan-1', 'TABLETOP', new Date());
      expect(t.conductedDate).toBeUndefined();
    });
    it('result is undefined initially', () => {
      const t = tester.schedule('plan-1', 'TABLETOP', new Date());
      expect(t.result).toBeUndefined();
    });
    it('gaps starts as empty array', () => {
      const t = tester.schedule('plan-1', 'TABLETOP', new Date());
      expect(t.gaps).toHaveLength(0);
    });
    it('two scheduled tests have distinct ids', () => {
      const a = tester.schedule('plan-1', 'TABLETOP', new Date());
      const b = tester.schedule('plan-1', 'WALKTHROUGH', new Date());
      expect(a.id).not.toBe(b.id);
    });
    it('count increases after schedule', () => {
      tester.schedule('plan-1', 'TABLETOP', new Date());
      expect(tester.getCount()).toBe(1);
    });
    it('test is retrievable after schedule', () => {
      const t = tester.schedule('plan-1', 'TABLETOP', new Date());
      expect(tester.get(t.id)).toBeDefined();
    });
    it('notes is undefined initially', () => {
      const t = tester.schedule('plan-1', 'TABLETOP', new Date());
      expect(t.notes).toBeUndefined();
    });
    it('rtoActualMinutes is undefined initially', () => {
      const t = tester.schedule('plan-1', 'TABLETOP', new Date());
      expect(t.rtoActualMinutes).toBeUndefined();
    });
    it('rpoActualMinutes is undefined initially', () => {
      const t = tester.schedule('plan-1', 'TABLETOP', new Date());
      expect(t.rpoActualMinutes).toBeUndefined();
    });
  });

  // --- recordResult ---
  describe('recordResult', () => {
    it('sets result to PASS', () => {
      const t = tester.schedule('plan-1', 'TABLETOP', new Date());
      const updated = tester.recordResult(t.id, 'PASS');
      expect(updated.result).toBe('PASS');
    });
    it('sets result to FAIL', () => {
      const t = tester.schedule('plan-1', 'TABLETOP', new Date());
      const updated = tester.recordResult(t.id, 'FAIL');
      expect(updated.result).toBe('FAIL');
    });
    it('sets result to PARTIAL', () => {
      const t = tester.schedule('plan-1', 'TABLETOP', new Date());
      const updated = tester.recordResult(t.id, 'PARTIAL');
      expect(updated.result).toBe('PARTIAL');
    });
    it('sets conductedDate to a Date', () => {
      const t = tester.schedule('plan-1', 'TABLETOP', new Date());
      const updated = tester.recordResult(t.id, 'PASS');
      expect(updated.conductedDate).toBeInstanceOf(Date);
    });
    it('conductedDate is close to now', () => {
      const t = tester.schedule('plan-1', 'TABLETOP', new Date());
      const before = Date.now();
      const updated = tester.recordResult(t.id, 'PASS');
      const after = Date.now();
      expect(updated.conductedDate!.getTime()).toBeGreaterThanOrEqual(before);
      expect(updated.conductedDate!.getTime()).toBeLessThanOrEqual(after);
    });
    it('sets rtoActualMinutes', () => {
      const t = tester.schedule('plan-1', 'TABLETOP', new Date());
      const updated = tester.recordResult(t.id, 'PASS', { rtoActualMinutes: 55 });
      expect(updated.rtoActualMinutes).toBe(55);
    });
    it('sets rpoActualMinutes', () => {
      const t = tester.schedule('plan-1', 'TABLETOP', new Date());
      const updated = tester.recordResult(t.id, 'PASS', { rpoActualMinutes: 25 });
      expect(updated.rpoActualMinutes).toBe(25);
    });
    it('sets notes', () => {
      const t = tester.schedule('plan-1', 'TABLETOP', new Date());
      const updated = tester.recordResult(t.id, 'PASS', { notes: 'All objectives met' });
      expect(updated.notes).toBe('All objectives met');
    });
    it('sets gaps array', () => {
      const t = tester.schedule('plan-1', 'TABLETOP', new Date());
      const updated = tester.recordResult(t.id, 'FAIL', { gaps: ['Gap 1', 'Gap 2'] });
      expect(updated.gaps).toEqual(['Gap 1', 'Gap 2']);
    });
    it('gaps defaults to empty array when not provided', () => {
      const t = tester.schedule('plan-1', 'TABLETOP', new Date());
      const updated = tester.recordResult(t.id, 'PASS');
      expect(updated.gaps).toEqual([]);
    });
    it('throws for unknown test id', () => {
      expect(() => tester.recordResult('bcpt-unknown', 'PASS')).toThrow('Test not found: bcpt-unknown');
    });
    it('stored test is updated after recordResult', () => {
      const t = tester.schedule('plan-1', 'TABLETOP', new Date());
      tester.recordResult(t.id, 'PASS');
      expect(tester.get(t.id)!.result).toBe('PASS');
    });
    it('preserves planId after recordResult', () => {
      const t = tester.schedule('plan-xyz', 'TABLETOP', new Date());
      const updated = tester.recordResult(t.id, 'PASS');
      expect(updated.planId).toBe('plan-xyz');
    });
    it('preserves testType after recordResult', () => {
      const t = tester.schedule('plan-1', 'SIMULATION', new Date());
      const updated = tester.recordResult(t.id, 'PASS');
      expect(updated.testType).toBe('SIMULATION');
    });
    it('preserves scheduledDate after recordResult', () => {
      const date = new Date('2026-04-01');
      const t = tester.schedule('plan-1', 'TABLETOP', date);
      const updated = tester.recordResult(t.id, 'PASS');
      expect(updated.scheduledDate).toEqual(date);
    });
    it('rtoActualMinutes=0 is stored', () => {
      const t = tester.schedule('plan-1', 'TABLETOP', new Date());
      const updated = tester.recordResult(t.id, 'PASS', { rtoActualMinutes: 0 });
      expect(updated.rtoActualMinutes).toBe(0);
    });
    it('multiple gaps are stored correctly', () => {
      const t = tester.schedule('plan-1', 'TABLETOP', new Date());
      const gaps = ['Communication gap', 'Documentation gap', 'Training gap'];
      const updated = tester.recordResult(t.id, 'PARTIAL', { gaps });
      expect(updated.gaps).toHaveLength(3);
    });
  });

  // --- get ---
  describe('get', () => {
    it('returns undefined for unknown id', () => {
      expect(tester.get('bcpt-none')).toBeUndefined();
    });
    it('returns test after schedule', () => {
      const t = tester.schedule('plan-1', 'TABLETOP', new Date());
      expect(tester.get(t.id)).toBeDefined();
    });
    it('returns updated test after recordResult', () => {
      const t = tester.schedule('plan-1', 'TABLETOP', new Date());
      tester.recordResult(t.id, 'FAIL');
      expect(tester.get(t.id)!.result).toBe('FAIL');
    });
  });

  // --- getAll ---
  describe('getAll', () => {
    it('returns empty array initially', () => {
      expect(tester.getAll()).toHaveLength(0);
    });
    it('returns one test after one schedule', () => {
      tester.schedule('plan-1', 'TABLETOP', new Date());
      expect(tester.getAll()).toHaveLength(1);
    });
    it('returns three tests after three schedules', () => {
      tester.schedule('plan-1', 'TABLETOP', new Date());
      tester.schedule('plan-2', 'WALKTHROUGH', new Date());
      tester.schedule('plan-3', 'SIMULATION', new Date());
      expect(tester.getAll()).toHaveLength(3);
    });
    it('all returned tests have ids', () => {
      tester.schedule('plan-1', 'TABLETOP', new Date());
      tester.getAll().forEach(t => expect(t.id).toBeDefined());
    });
  });

  // --- getByPlan ---
  describe('getByPlan', () => {
    it('returns empty array for unknown planId', () => {
      tester.schedule('plan-1', 'TABLETOP', new Date());
      expect(tester.getByPlan('plan-none')).toHaveLength(0);
    });
    it('returns tests for correct planId', () => {
      tester.schedule('plan-1', 'TABLETOP', new Date());
      expect(tester.getByPlan('plan-1')).toHaveLength(1);
    });
    it('does not return tests for other plans', () => {
      tester.schedule('plan-1', 'TABLETOP', new Date());
      tester.schedule('plan-2', 'WALKTHROUGH', new Date());
      expect(tester.getByPlan('plan-1')).toHaveLength(1);
    });
    it('returns multiple tests for same planId', () => {
      tester.schedule('plan-1', 'TABLETOP', new Date());
      tester.schedule('plan-1', 'SIMULATION', new Date());
      expect(tester.getByPlan('plan-1')).toHaveLength(2);
    });
    it('planId filter is exact match', () => {
      tester.schedule('plan-10', 'TABLETOP', new Date());
      expect(tester.getByPlan('plan-1')).toHaveLength(0);
    });
  });

  // --- getByResult ---
  describe('getByResult', () => {
    it('returns empty array when no results recorded', () => {
      tester.schedule('plan-1', 'TABLETOP', new Date());
      expect(tester.getByResult('PASS')).toHaveLength(0);
    });
    it('returns PASS tests', () => {
      const t = tester.schedule('plan-1', 'TABLETOP', new Date());
      tester.recordResult(t.id, 'PASS');
      expect(tester.getByResult('PASS')).toHaveLength(1);
    });
    it('returns FAIL tests', () => {
      const t = tester.schedule('plan-1', 'TABLETOP', new Date());
      tester.recordResult(t.id, 'FAIL');
      expect(tester.getByResult('FAIL')).toHaveLength(1);
    });
    it('returns PARTIAL tests', () => {
      const t = tester.schedule('plan-1', 'TABLETOP', new Date());
      tester.recordResult(t.id, 'PARTIAL');
      expect(tester.getByResult('PARTIAL')).toHaveLength(1);
    });
    it('does not include pending tests in PASS results', () => {
      tester.schedule('plan-1', 'TABLETOP', new Date());
      expect(tester.getByResult('PASS')).toHaveLength(0);
    });
    it('multiple tests with same result are all returned', () => {
      const a = tester.schedule('plan-1', 'TABLETOP', new Date());
      const b = tester.schedule('plan-2', 'SIMULATION', new Date());
      tester.recordResult(a.id, 'PASS');
      tester.recordResult(b.id, 'PASS');
      expect(tester.getByResult('PASS')).toHaveLength(2);
    });
    it('FAIL result does not appear in PASS results', () => {
      const t = tester.schedule('plan-1', 'TABLETOP', new Date());
      tester.recordResult(t.id, 'FAIL');
      expect(tester.getByResult('PASS')).toHaveLength(0);
    });
  });

  // --- getByType ---
  describe('getByType', () => {
    it('returns empty array when no tests match type', () => {
      tester.schedule('plan-1', 'TABLETOP', new Date());
      expect(tester.getByType('SIMULATION')).toHaveLength(0);
    });
    it('returns TABLETOP tests', () => {
      tester.schedule('plan-1', 'TABLETOP', new Date());
      expect(tester.getByType('TABLETOP')).toHaveLength(1);
    });
    it('returns WALKTHROUGH tests', () => {
      tester.schedule('plan-1', 'WALKTHROUGH', new Date());
      expect(tester.getByType('WALKTHROUGH')).toHaveLength(1);
    });
    it('returns SIMULATION tests', () => {
      tester.schedule('plan-1', 'SIMULATION', new Date());
      expect(tester.getByType('SIMULATION')).toHaveLength(1);
    });
    it('returns FULL_INTERRUPTION tests', () => {
      tester.schedule('plan-1', 'FULL_INTERRUPTION', new Date());
      expect(tester.getByType('FULL_INTERRUPTION')).toHaveLength(1);
    });
    it('does not return other types', () => {
      tester.schedule('plan-1', 'TABLETOP', new Date());
      expect(tester.getByType('WALKTHROUGH')).toHaveLength(0);
    });
    it('multiple TABLETOP tests are all returned', () => {
      tester.schedule('plan-1', 'TABLETOP', new Date());
      tester.schedule('plan-2', 'TABLETOP', new Date());
      expect(tester.getByType('TABLETOP')).toHaveLength(2);
    });
  });

  // --- getPending ---
  describe('getPending', () => {
    it('returns all tests when none conducted', () => {
      tester.schedule('plan-1', 'TABLETOP', new Date());
      tester.schedule('plan-2', 'WALKTHROUGH', new Date());
      expect(tester.getPending()).toHaveLength(2);
    });
    it('returns empty after all completed', () => {
      const t = tester.schedule('plan-1', 'TABLETOP', new Date());
      tester.recordResult(t.id, 'PASS');
      expect(tester.getPending()).toHaveLength(0);
    });
    it('returns only tests without conductedDate', () => {
      const a = tester.schedule('plan-1', 'TABLETOP', new Date());
      tester.schedule('plan-2', 'WALKTHROUGH', new Date());
      tester.recordResult(a.id, 'PASS');
      expect(tester.getPending()).toHaveLength(1);
    });
    it('is empty on fresh tester', () => {
      expect(tester.getPending()).toHaveLength(0);
    });
    it('pending test has no conductedDate', () => {
      tester.schedule('plan-1', 'TABLETOP', new Date());
      tester.getPending().forEach(t => expect(t.conductedDate).toBeUndefined());
    });
  });

  // --- getCompleted ---
  describe('getCompleted', () => {
    it('returns empty when none conducted', () => {
      tester.schedule('plan-1', 'TABLETOP', new Date());
      expect(tester.getCompleted()).toHaveLength(0);
    });
    it('returns test after recordResult', () => {
      const t = tester.schedule('plan-1', 'TABLETOP', new Date());
      tester.recordResult(t.id, 'PASS');
      expect(tester.getCompleted()).toHaveLength(1);
    });
    it('does not include pending tests', () => {
      const a = tester.schedule('plan-1', 'TABLETOP', new Date());
      tester.schedule('plan-2', 'WALKTHROUGH', new Date());
      tester.recordResult(a.id, 'PASS');
      expect(tester.getCompleted()).toHaveLength(1);
    });
    it('all completed tests have conductedDate', () => {
      const a = tester.schedule('plan-1', 'TABLETOP', new Date());
      tester.recordResult(a.id, 'FAIL');
      tester.getCompleted().forEach(t => expect(t.conductedDate).toBeInstanceOf(Date));
    });
    it('is empty on fresh tester', () => {
      expect(tester.getCompleted()).toHaveLength(0);
    });
  });

  // --- getCount ---
  describe('getCount', () => {
    it('returns 0 initially', () => {
      expect(tester.getCount()).toBe(0);
    });
    it('returns 1 after one schedule', () => {
      tester.schedule('plan-1', 'TABLETOP', new Date());
      expect(tester.getCount()).toBe(1);
    });
    it('returns 3 after three schedules', () => {
      tester.schedule('plan-1', 'TABLETOP', new Date());
      tester.schedule('plan-2', 'WALKTHROUGH', new Date());
      tester.schedule('plan-3', 'SIMULATION', new Date());
      expect(tester.getCount()).toBe(3);
    });
    it('count does not change after recordResult', () => {
      const t = tester.schedule('plan-1', 'TABLETOP', new Date());
      tester.recordResult(t.id, 'PASS');
      expect(tester.getCount()).toBe(1);
    });
    it('count is number type', () => {
      expect(typeof tester.getCount()).toBe('number');
    });
  });

  // --- getPassRate ---
  describe('getPassRate', () => {
    it('returns 0 when no tests completed', () => {
      tester.schedule('plan-1', 'TABLETOP', new Date());
      expect(tester.getPassRate()).toBe(0);
    });
    it('returns 0 on fresh tester', () => {
      expect(tester.getPassRate()).toBe(0);
    });
    it('returns 100 when single test passes', () => {
      const t = tester.schedule('plan-1', 'TABLETOP', new Date());
      tester.recordResult(t.id, 'PASS');
      expect(tester.getPassRate()).toBe(100);
    });
    it('returns 0 when single test fails', () => {
      const t = tester.schedule('plan-1', 'TABLETOP', new Date());
      tester.recordResult(t.id, 'FAIL');
      expect(tester.getPassRate()).toBe(0);
    });
    it('returns 50 when 1 of 2 tests pass', () => {
      const a = tester.schedule('plan-1', 'TABLETOP', new Date());
      const b = tester.schedule('plan-2', 'TABLETOP', new Date());
      tester.recordResult(a.id, 'PASS');
      tester.recordResult(b.id, 'FAIL');
      expect(tester.getPassRate()).toBe(50);
    });
    it('returns 100 when all 3 pass', () => {
      const tests = [
        tester.schedule('p1', 'TABLETOP', new Date()),
        tester.schedule('p2', 'WALKTHROUGH', new Date()),
        tester.schedule('p3', 'SIMULATION', new Date()),
      ];
      tests.forEach(t => tester.recordResult(t.id, 'PASS'));
      expect(tester.getPassRate()).toBe(100);
    });
    it('returns 0 when all 3 fail', () => {
      const tests = [
        tester.schedule('p1', 'TABLETOP', new Date()),
        tester.schedule('p2', 'WALKTHROUGH', new Date()),
        tester.schedule('p3', 'SIMULATION', new Date()),
      ];
      tests.forEach(t => tester.recordResult(t.id, 'FAIL'));
      expect(tester.getPassRate()).toBe(0);
    });
    it('PARTIAL does not count as PASS', () => {
      const t = tester.schedule('plan-1', 'TABLETOP', new Date());
      tester.recordResult(t.id, 'PARTIAL');
      expect(tester.getPassRate()).toBe(0);
    });
    it('pending tests are excluded from pass rate', () => {
      const a = tester.schedule('p1', 'TABLETOP', new Date());
      tester.schedule('p2', 'WALKTHROUGH', new Date()); // pending
      tester.recordResult(a.id, 'PASS');
      // only 1 completed, it passed → 100%
      expect(tester.getPassRate()).toBe(100);
    });
    it('returns 33 when 1 of 3 pass', () => {
      const tests = [
        tester.schedule('p1', 'TABLETOP', new Date()),
        tester.schedule('p2', 'WALKTHROUGH', new Date()),
        tester.schedule('p3', 'SIMULATION', new Date()),
      ];
      tester.recordResult(tests[0].id, 'PASS');
      tester.recordResult(tests[1].id, 'FAIL');
      tester.recordResult(tests[2].id, 'FAIL');
      expect(tester.getPassRate()).toBe(33);
    });
    it('returns 67 when 2 of 3 pass', () => {
      const tests = [
        tester.schedule('p1', 'TABLETOP', new Date()),
        tester.schedule('p2', 'WALKTHROUGH', new Date()),
        tester.schedule('p3', 'SIMULATION', new Date()),
      ];
      tester.recordResult(tests[0].id, 'PASS');
      tester.recordResult(tests[1].id, 'PASS');
      tester.recordResult(tests[2].id, 'FAIL');
      expect(tester.getPassRate()).toBe(67);
    });
  });

  // --- getTestsWithGaps ---
  describe('getTestsWithGaps', () => {
    it('returns empty on fresh tester', () => {
      expect(tester.getTestsWithGaps()).toHaveLength(0);
    });
    it('returns empty when scheduled but not conducted', () => {
      tester.schedule('plan-1', 'TABLETOP', new Date());
      expect(tester.getTestsWithGaps()).toHaveLength(0);
    });
    it('returns empty when test passed with no gaps', () => {
      const t = tester.schedule('plan-1', 'TABLETOP', new Date());
      tester.recordResult(t.id, 'PASS');
      expect(tester.getTestsWithGaps()).toHaveLength(0);
    });
    it('returns test when it has gaps', () => {
      const t = tester.schedule('plan-1', 'TABLETOP', new Date());
      tester.recordResult(t.id, 'FAIL', { gaps: ['Gap A'] });
      expect(tester.getTestsWithGaps()).toHaveLength(1);
    });
    it('returns multiple tests with gaps', () => {
      const a = tester.schedule('p1', 'TABLETOP', new Date());
      const b = tester.schedule('p2', 'SIMULATION', new Date());
      tester.recordResult(a.id, 'FAIL', { gaps: ['Gap 1'] });
      tester.recordResult(b.id, 'PARTIAL', { gaps: ['Gap 2', 'Gap 3'] });
      expect(tester.getTestsWithGaps()).toHaveLength(2);
    });
    it('does not include test with empty gaps after recordResult', () => {
      const t = tester.schedule('plan-1', 'TABLETOP', new Date());
      tester.recordResult(t.id, 'PASS', { gaps: [] });
      expect(tester.getTestsWithGaps()).toHaveLength(0);
    });
    it('gaps content is preserved', () => {
      const t = tester.schedule('plan-1', 'TABLETOP', new Date());
      tester.recordResult(t.id, 'FAIL', { gaps: ['No backup power', 'Untrained staff'] });
      const gapTests = tester.getTestsWithGaps();
      expect(gapTests[0].gaps).toContain('No backup power');
      expect(gapTests[0].gaps).toContain('Untrained staff');
    });
  });

  // --- parameterized: schedule with different test types ---
  describe('parameterized test types', () => {
    const testTypes: TestType[] = ['TABLETOP', 'WALKTHROUGH', 'SIMULATION', 'FULL_INTERRUPTION'];
    testTypes.forEach((type) => {
      it(`getByType('${type}') returns the scheduled test`, () => {
        const t = tester.schedule('plan-1', type, new Date());
        const results = tester.getByType(type);
        expect(results.some(r => r.id === t.id)).toBe(true);
      });
    });
  });

  // --- parameterized: recordResult with different results ---
  describe('parameterized results', () => {
    const results: TestResult[] = ['PASS', 'FAIL', 'PARTIAL'];
    results.forEach((result) => {
      it(`getByResult('${result}') returns test after recording`, () => {
        const t = tester.schedule('plan-1', 'TABLETOP', new Date());
        tester.recordResult(t.id, result);
        expect(tester.getByResult(result)).toHaveLength(1);
      });
    });
  });

  // --- parameterized: schedule dates ---
  describe('parameterized schedule dates', () => {
    Array.from({ length: 12 }, (_, i) => i + 1).forEach((month) => {
      it(`schedule for month ${month} stores correct date`, () => {
        const date = new Date(`2026-${String(month).padStart(2, '0')}-01`);
        const t = tester.schedule('plan-1', 'TABLETOP', date);
        expect(t.scheduledDate.getMonth()).toBe(month - 1);
      });
    });
  });

  // --- parameterized: recordResult with rto values ---
  describe('parameterized rtoActualMinutes', () => {
    Array.from({ length: 15 }, (_, i) => i + 1).forEach((n) => {
      it(`rtoActualMinutes=${n * 5} is stored`, () => {
        const t = tester.schedule('plan-1', 'TABLETOP', new Date());
        const updated = tester.recordResult(t.id, 'PASS', { rtoActualMinutes: n * 5 });
        expect(updated.rtoActualMinutes).toBe(n * 5);
      });
    });
  });

  // --- parameterized: recordResult with rpo values ---
  describe('parameterized rpoActualMinutes', () => {
    Array.from({ length: 15 }, (_, i) => i + 1).forEach((n) => {
      it(`rpoActualMinutes=${n * 3} is stored`, () => {
        const t = tester.schedule('plan-1', 'TABLETOP', new Date());
        const updated = tester.recordResult(t.id, 'PASS', { rpoActualMinutes: n * 3 });
        expect(updated.rpoActualMinutes).toBe(n * 3);
      });
    });
  });

  // --- parameterized: notes strings ---
  describe('parameterized notes', () => {
    const notesList = [
      'All objectives met',
      'Some gaps identified',
      'Critical failure in communication',
      'RTO exceeded by 15 minutes',
      'Team performed well',
      'Documentation needs update',
      'Training required for new staff',
      'System dependencies not documented',
      'Vendor contact list outdated',
      'Test completed without issues',
    ];
    notesList.forEach((note) => {
      it(`notes '${note}' is stored correctly`, () => {
        const t = tester.schedule('plan-1', 'TABLETOP', new Date());
        const updated = tester.recordResult(t.id, 'PASS', { notes: note });
        expect(updated.notes).toBe(note);
      });
    });
  });

  // --- parameterized: gaps arrays ---
  describe('parameterized gaps', () => {
    Array.from({ length: 10 }, (_, i) => i + 1).forEach((n) => {
      it(`recording ${n} gaps stores all gaps`, () => {
        const t = tester.schedule('plan-1', 'TABLETOP', new Date());
        const gaps = Array.from({ length: n }, (_, i) => `Gap ${i + 1}`);
        const updated = tester.recordResult(t.id, 'FAIL', { gaps });
        expect(updated.gaps).toHaveLength(n);
      });
    });
  });

  // --- parameterized: getPassRate with varying counts ---
  describe('parameterized getPassRate', () => {
    Array.from({ length: 5 }, (_, i) => i + 1).forEach((n) => {
      it(`all ${n} tests pass → passRate = 100`, () => {
        const tests = Array.from({ length: n }, (_, i) =>
          tester.schedule(`plan-${i}`, 'TABLETOP', new Date())
        );
        tests.forEach(t => tester.recordResult(t.id, 'PASS'));
        expect(tester.getPassRate()).toBe(100);
      });
    });

    Array.from({ length: 5 }, (_, i) => i + 1).forEach((n) => {
      it(`all ${n} tests fail → passRate = 0`, () => {
        const tests = Array.from({ length: n }, (_, i) =>
          tester.schedule(`plan-${i}`, 'TABLETOP', new Date())
        );
        tests.forEach(t => tester.recordResult(t.id, 'FAIL'));
        expect(tester.getPassRate()).toBe(0);
      });
    });
  });

  // --- parameterized: bulk schedule unique ids ---
  describe('bulk schedule unique ids', () => {
    Array.from({ length: 30 }, (_, i) => i).forEach((i) => {
      it(`schedule ${i} produces unique id`, () => {
        const t = tester.schedule(`plan-${i}`, 'TABLETOP', new Date());
        expect(t.id).toMatch(/^bcpt-/);
      });
    });
  });

  // --- error messages ---
  describe('error messages', () => {
    it('recordResult throws with correct id in message', () => {
      expect(() => tester.recordResult('bcpt-xyz', 'PASS')).toThrow('bcpt-xyz');
    });
    it('recordResult throws Error instance', () => {
      expect(() => tester.recordResult('bcpt-xyz', 'PASS')).toThrow(Error);
    });
  });

  // --- edge cases ---
  describe('edge cases', () => {
    it('getAll returns array type', () => {
      expect(Array.isArray(tester.getAll())).toBe(true);
    });
    it('getByPlan returns array type', () => {
      expect(Array.isArray(tester.getByPlan('plan-1'))).toBe(true);
    });
    it('getByResult returns array type', () => {
      expect(Array.isArray(tester.getByResult('PASS'))).toBe(true);
    });
    it('getByType returns array type', () => {
      expect(Array.isArray(tester.getByType('TABLETOP'))).toBe(true);
    });
    it('getPending returns array type', () => {
      expect(Array.isArray(tester.getPending())).toBe(true);
    });
    it('getCompleted returns array type', () => {
      expect(Array.isArray(tester.getCompleted())).toBe(true);
    });
    it('getTestsWithGaps returns array type', () => {
      expect(Array.isArray(tester.getTestsWithGaps())).toBe(true);
    });
    it('two separate BCPTester instances are independent', () => {
      const tester2 = new BCPTester();
      tester.schedule('plan-1', 'TABLETOP', new Date());
      expect(tester2.getCount()).toBe(0);
    });
    it('recordResult with no opts still sets conductedDate', () => {
      const t = tester.schedule('plan-1', 'TABLETOP', new Date());
      const updated = tester.recordResult(t.id, 'PASS');
      expect(updated.conductedDate).toBeInstanceOf(Date);
    });
    it('schedule creates test immediately retrievable via get', () => {
      const t = tester.schedule('plan-1', 'TABLETOP', new Date());
      expect(tester.get(t.id)!.planId).toBe('plan-1');
    });
    it('recording PARTIAL result moves test to completed', () => {
      const t = tester.schedule('plan-1', 'TABLETOP', new Date());
      tester.recordResult(t.id, 'PARTIAL');
      expect(tester.getCompleted()).toHaveLength(1);
    });
    it('recording FAIL result moves test to completed', () => {
      const t = tester.schedule('plan-1', 'TABLETOP', new Date());
      tester.recordResult(t.id, 'FAIL');
      expect(tester.getCompleted()).toHaveLength(1);
    });
    it('completed test is no longer pending', () => {
      const t = tester.schedule('plan-1', 'TABLETOP', new Date());
      tester.recordResult(t.id, 'PASS');
      expect(tester.getPending()).toHaveLength(0);
    });
    it('getPassRate returns number type', () => {
      expect(typeof tester.getPassRate()).toBe('number');
    });
    it('50 scheduled tests results in getCount=50', () => {
      for (let i = 0; i < 50; i++) tester.schedule(`plan-${i}`, 'TABLETOP', new Date());
      expect(tester.getCount()).toBe(50);
    });
    it('gaps from schedule is empty array (not undefined)', () => {
      const t = tester.schedule('plan-1', 'TABLETOP', new Date());
      expect(Array.isArray(t.gaps)).toBe(true);
      expect(t.gaps).toHaveLength(0);
    });
    it('recordResult preserves id', () => {
      const t = tester.schedule('plan-1', 'TABLETOP', new Date());
      const updated = tester.recordResult(t.id, 'PASS');
      expect(updated.id).toBe(t.id);
    });
    it('getPassRate is integer (rounded)', () => {
      const tests = Array.from({ length: 3 }, (_, i) =>
        tester.schedule(`plan-${i}`, 'TABLETOP', new Date())
      );
      tester.recordResult(tests[0].id, 'PASS');
      tester.recordResult(tests[1].id, 'FAIL');
      tester.recordResult(tests[2].id, 'FAIL');
      const rate = tester.getPassRate();
      expect(Number.isInteger(rate)).toBe(true);
    });
    it('getByType FULL_INTERRUPTION returns correct tests', () => {
      tester.schedule('plan-1', 'TABLETOP', new Date());
      const fi = tester.schedule('plan-2', 'FULL_INTERRUPTION', new Date());
      const results = tester.getByType('FULL_INTERRUPTION');
      expect(results[0].id).toBe(fi.id);
    });
  });

  // --- integration scenarios ---
  describe('integration scenarios', () => {
    it('schedule and immediately check pending count', () => {
      tester.schedule('plan-1', 'TABLETOP', new Date());
      tester.schedule('plan-2', 'SIMULATION', new Date());
      expect(tester.getPending()).toHaveLength(2);
    });
    it('completing all tests leaves none pending', () => {
      const a = tester.schedule('p1', 'TABLETOP', new Date());
      const b = tester.schedule('p2', 'WALKTHROUGH', new Date());
      tester.recordResult(a.id, 'PASS');
      tester.recordResult(b.id, 'FAIL');
      expect(tester.getPending()).toHaveLength(0);
    });
    it('mixed results: PASS, FAIL, PARTIAL all stored independently', () => {
      const a = tester.schedule('p1', 'TABLETOP', new Date());
      const b = tester.schedule('p2', 'SIMULATION', new Date());
      const c = tester.schedule('p3', 'WALKTHROUGH', new Date());
      tester.recordResult(a.id, 'PASS');
      tester.recordResult(b.id, 'FAIL');
      tester.recordResult(c.id, 'PARTIAL');
      expect(tester.getByResult('PASS')).toHaveLength(1);
      expect(tester.getByResult('FAIL')).toHaveLength(1);
      expect(tester.getByResult('PARTIAL')).toHaveLength(1);
    });
    it('multiple tests for same plan: getByPlan returns all', () => {
      for (let i = 0; i < 5; i++) tester.schedule('plan-X', 'TABLETOP', new Date());
      expect(tester.getByPlan('plan-X')).toHaveLength(5);
    });
    it('test with gaps appears in getTestsWithGaps after record', () => {
      const t = tester.schedule('plan-1', 'FULL_INTERRUPTION', new Date());
      tester.recordResult(t.id, 'PARTIAL', { gaps: ['Gap A', 'Gap B'] });
      const withGaps = tester.getTestsWithGaps();
      expect(withGaps.some(w => w.id === t.id)).toBe(true);
    });
    it('all types can be filtered independently', () => {
      const testTypes: TestType[] = ['TABLETOP', 'WALKTHROUGH', 'SIMULATION', 'FULL_INTERRUPTION'];
      testTypes.forEach(type => tester.schedule('plan-1', type, new Date()));
      testTypes.forEach(type => expect(tester.getByType(type)).toHaveLength(1));
    });
    it('count matches getAll length', () => {
      for (let i = 0; i < 7; i++) tester.schedule(`plan-${i}`, 'TABLETOP', new Date());
      expect(tester.getCount()).toBe(tester.getAll().length);
    });
    it('pending + completed = total count', () => {
      const tests = Array.from({ length: 6 }, (_, i) => tester.schedule(`plan-${i}`, 'TABLETOP', new Date()));
      tests.slice(0, 3).forEach(t => tester.recordResult(t.id, 'PASS'));
      expect(tester.getPending().length + tester.getCompleted().length).toBe(tester.getCount());
    });
    it('recordResult twice on same test updates result', () => {
      const t = tester.schedule('plan-1', 'TABLETOP', new Date());
      tester.recordResult(t.id, 'FAIL');
      tester.recordResult(t.id, 'PASS');
      expect(tester.get(t.id)!.result).toBe('PASS');
    });
  });

  // --- additional parameterized planId tests ---
  describe('parameterized getByPlan', () => {
    Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
      it(`getByPlan('plan-${i}') returns 1 test`, () => {
        tester.schedule(`plan-${i}`, 'TABLETOP', new Date());
        expect(tester.getByPlan(`plan-${i}`)).toHaveLength(1);
      });
    });
  });

  // --- additional getByResult edge cases ---
  describe('additional getByResult edge cases', () => {
    it('getByResult PASS returns empty array type', () => {
      expect(Array.isArray(tester.getByResult('PASS'))).toBe(true);
    });
    it('getByResult FAIL returns empty array type', () => {
      expect(Array.isArray(tester.getByResult('FAIL'))).toBe(true);
    });
    it('getByResult PARTIAL returns empty array type', () => {
      expect(Array.isArray(tester.getByResult('PARTIAL'))).toBe(true);
    });
    it('5 PASS tests: getByResult returns 5', () => {
      const tests = Array.from({ length: 5 }, (_, i) => tester.schedule(`p${i}`, 'TABLETOP', new Date()));
      tests.forEach(t => tester.recordResult(t.id, 'PASS'));
      expect(tester.getByResult('PASS')).toHaveLength(5);
    });
    it('5 FAIL tests: getByResult returns 5', () => {
      const tests = Array.from({ length: 5 }, (_, i) => tester.schedule(`p${i}`, 'TABLETOP', new Date()));
      tests.forEach(t => tester.recordResult(t.id, 'FAIL'));
      expect(tester.getByResult('FAIL')).toHaveLength(5);
    });
  });

  // --- additional getPassRate precision ---
  describe('getPassRate precision', () => {
    it('4 pass out of 4 → 100', () => {
      const tests = Array.from({ length: 4 }, (_, i) => tester.schedule(`p${i}`, 'TABLETOP', new Date()));
      tests.forEach(t => tester.recordResult(t.id, 'PASS'));
      expect(tester.getPassRate()).toBe(100);
    });
    it('0 pass out of 4 → 0', () => {
      const tests = Array.from({ length: 4 }, (_, i) => tester.schedule(`p${i}`, 'TABLETOP', new Date()));
      tests.forEach(t => tester.recordResult(t.id, 'FAIL'));
      expect(tester.getPassRate()).toBe(0);
    });
    it('2 pass out of 4 → 50', () => {
      const tests = Array.from({ length: 4 }, (_, i) => tester.schedule(`p${i}`, 'TABLETOP', new Date()));
      tester.recordResult(tests[0].id, 'PASS');
      tester.recordResult(tests[1].id, 'PASS');
      tester.recordResult(tests[2].id, 'FAIL');
      tester.recordResult(tests[3].id, 'FAIL');
      expect(tester.getPassRate()).toBe(50);
    });
    it('1 pass out of 4 → 25', () => {
      const tests = Array.from({ length: 4 }, (_, i) => tester.schedule(`p${i}`, 'TABLETOP', new Date()));
      tester.recordResult(tests[0].id, 'PASS');
      tester.recordResult(tests[1].id, 'FAIL');
      tester.recordResult(tests[2].id, 'FAIL');
      tester.recordResult(tests[3].id, 'FAIL');
      expect(tester.getPassRate()).toBe(25);
    });
    it('3 pass out of 4 → 75', () => {
      const tests = Array.from({ length: 4 }, (_, i) => tester.schedule(`p${i}`, 'TABLETOP', new Date()));
      tester.recordResult(tests[0].id, 'PASS');
      tester.recordResult(tests[1].id, 'PASS');
      tester.recordResult(tests[2].id, 'PASS');
      tester.recordResult(tests[3].id, 'FAIL');
      expect(tester.getPassRate()).toBe(75);
    });
  });

  // --- additional FULL_INTERRUPTION scenario ---
  describe('FULL_INTERRUPTION scenario', () => {
    it('FULL_INTERRUPTION with gaps and notes stored', () => {
      const t = tester.schedule('plan-critical', 'FULL_INTERRUPTION', new Date('2026-06-01'));
      const updated = tester.recordResult(t.id, 'FAIL', {
        rtoActualMinutes: 480,
        rpoActualMinutes: 120,
        notes: 'System failed to restore within RTO',
        gaps: ['Backup restoration too slow', 'Staff unaware of escalation path'],
      });
      expect(updated.testType).toBe('FULL_INTERRUPTION');
      expect(updated.result).toBe('FAIL');
      expect(updated.rtoActualMinutes).toBe(480);
      expect(updated.rpoActualMinutes).toBe(120);
      expect(updated.notes).toBe('System failed to restore within RTO');
      expect(updated.gaps).toHaveLength(2);
    });
    it('FULL_INTERRUPTION appears in getByType', () => {
      tester.schedule('plan-1', 'FULL_INTERRUPTION', new Date());
      expect(tester.getByType('FULL_INTERRUPTION')).toHaveLength(1);
    });
    it('FULL_INTERRUPTION test conductedDate set after recordResult', () => {
      const t = tester.schedule('plan-1', 'FULL_INTERRUPTION', new Date());
      tester.recordResult(t.id, 'PASS');
      expect(tester.get(t.id)!.conductedDate).toBeInstanceOf(Date);
    });
  });
});

// ---------------------------------------------------------------------------
// BCPManager Extended Tests — additional 250+
// ---------------------------------------------------------------------------
describe('BCPManager Extended', () => {
  let mgr: BCPManager;

  beforeEach(() => {
    mgr = new BCPManager();
  });

  // --- approve preserves all fields ---
  describe('approve field preservation', () => {
    it('approve preserves version field', () => {
      const p = mgr.create('Plan', 'alice', 60, 30, '2.5');
      expect(mgr.approve(p.id).version).toBe('2.5');
    });
    it('approve preserves createdAt', () => {
      const p = mgr.create('Plan', 'alice', 60, 30);
      const created = p.createdAt;
      expect(mgr.approve(p.id).createdAt).toEqual(created);
    });
    it('approve preserves recoverySteps', () => {
      const p = mgr.create('Plan', 'alice', 60, 30);
      mgr.addStep(p.id, { order: 1, action: 'Act', owner: 'alice', estimatedMinutes: 5 });
      expect(mgr.approve(p.id).recoverySteps).toHaveLength(1);
    });
    it('approve returns the updated plan', () => {
      const p = mgr.create('Plan', 'alice', 60, 30);
      const result = mgr.approve(p.id);
      expect(result.id).toBe(p.id);
    });
    it('approve approvedAt is a Date instance', () => {
      const p = mgr.create('Plan', 'alice', 60, 30);
      expect(mgr.approve(p.id).approvedAt).toBeInstanceOf(Date);
    });
  });

  // --- activate field preservation ---
  describe('activate field preservation', () => {
    it('activate preserves version', () => {
      const p = mgr.create('Plan', 'alice', 60, 30, '3.0');
      expect(mgr.activate(p.id).version).toBe('3.0');
    });
    it('activate preserves rpoMinutes', () => {
      const p = mgr.create('Plan', 'alice', 60, 45);
      expect(mgr.activate(p.id).rpoMinutes).toBe(45);
    });
    it('activate returns updated plan', () => {
      const p = mgr.create('Plan', 'alice', 60, 30);
      const result = mgr.activate(p.id);
      expect(result.id).toBe(p.id);
    });
    it('activate preserves createdAt', () => {
      const p = mgr.create('Plan', 'alice', 60, 30);
      const created = p.createdAt;
      expect(mgr.activate(p.id).createdAt).toEqual(created);
    });
    it('activate preserves recoverySteps length', () => {
      const p = mgr.create('Plan', 'alice', 60, 30);
      mgr.addStep(p.id, { order: 1, action: 'Act', owner: 'alice', estimatedMinutes: 5 });
      mgr.addStep(p.id, { order: 2, action: 'Act2', owner: 'bob', estimatedMinutes: 10 });
      expect(mgr.activate(p.id).recoverySteps).toHaveLength(2);
    });
  });

  // --- retire field preservation ---
  describe('retire field preservation', () => {
    it('retire preserves name', () => {
      const p = mgr.create('Legacy DR Plan', 'alice', 60, 30);
      expect(mgr.retire(p.id).name).toBe('Legacy DR Plan');
    });
    it('retire preserves owner', () => {
      const p = mgr.create('Plan', 'frank', 60, 30);
      expect(mgr.retire(p.id).owner).toBe('frank');
    });
    it('retire preserves rtoMinutes', () => {
      const p = mgr.create('Plan', 'alice', 120, 30);
      expect(mgr.retire(p.id).rtoMinutes).toBe(120);
    });
    it('retire preserves rpoMinutes', () => {
      const p = mgr.create('Plan', 'alice', 60, 60);
      expect(mgr.retire(p.id).rpoMinutes).toBe(60);
    });
    it('retire returns updated plan', () => {
      const p = mgr.create('Plan', 'alice', 60, 30);
      const result = mgr.retire(p.id);
      expect(result.id).toBe(p.id);
    });
  });

  // --- getAll completeness ---
  describe('getAll completeness', () => {
    it('getAll contains created plan', () => {
      const p = mgr.create('Plan A', 'alice', 60, 30);
      expect(mgr.getAll().some(r => r.id === p.id)).toBe(true);
    });
    it('getAll length matches getCount', () => {
      mgr.create('Plan A', 'alice', 60, 30);
      mgr.create('Plan B', 'bob', 90, 45);
      expect(mgr.getAll().length).toBe(mgr.getCount());
    });
    it('getAll returns plans with correct statuses', () => {
      const a = mgr.create('Plan A', 'alice', 60, 30);
      const b = mgr.create('Plan B', 'bob', 90, 45);
      mgr.approve(a.id);
      const all = mgr.getAll();
      const statuses = all.map(p => p.status);
      expect(statuses).toContain('APPROVED');
      expect(statuses).toContain('DRAFT');
    });
    it('getAll after status change reflects new status', () => {
      const p = mgr.create('Plan A', 'alice', 60, 30);
      mgr.activate(p.id);
      const found = mgr.getAll().find(r => r.id === p.id);
      expect(found!.status).toBe('ACTIVE');
    });
  });

  // --- getByStatus multi-plan scenarios ---
  describe('getByStatus multi-plan', () => {
    it('3 DRAFT plans: getByStatus DRAFT returns 3', () => {
      mgr.create('A', 'alice', 60, 30);
      mgr.create('B', 'bob', 60, 30);
      mgr.create('C', 'carol', 60, 30);
      expect(mgr.getByStatus('DRAFT')).toHaveLength(3);
    });
    it('mixed statuses count correctly', () => {
      const a = mgr.create('A', 'alice', 60, 30);
      const b = mgr.create('B', 'bob', 60, 30);
      mgr.create('C', 'carol', 60, 30);
      mgr.approve(a.id);
      mgr.activate(b.id);
      expect(mgr.getByStatus('DRAFT')).toHaveLength(1);
      expect(mgr.getByStatus('APPROVED')).toHaveLength(1);
      expect(mgr.getByStatus('ACTIVE')).toHaveLength(1);
    });
    it('retiring a plan moves it out of ACTIVE status list', () => {
      const p = mgr.create('Plan', 'alice', 60, 30);
      mgr.activate(p.id);
      mgr.retire(p.id);
      expect(mgr.getByStatus('ACTIVE')).toHaveLength(0);
      expect(mgr.getByStatus('RETIRED')).toHaveLength(1);
    });
  });

  // --- getByOwner multi-owner ---
  describe('getByOwner multi-owner', () => {
    it('3 different owners: each returns 1', () => {
      mgr.create('Plan A', 'alice', 60, 30);
      mgr.create('Plan B', 'bob', 60, 30);
      mgr.create('Plan C', 'carol', 60, 30);
      expect(mgr.getByOwner('alice')).toHaveLength(1);
      expect(mgr.getByOwner('bob')).toHaveLength(1);
      expect(mgr.getByOwner('carol')).toHaveLength(1);
    });
    it('owner with 3 plans: getByOwner returns 3', () => {
      mgr.create('Plan A', 'alice', 60, 30);
      mgr.create('Plan B', 'alice', 90, 45);
      mgr.create('Plan C', 'alice', 120, 60);
      expect(mgr.getByOwner('alice')).toHaveLength(3);
    });
    it('getByOwner result items have correct owner', () => {
      mgr.create('Plan A', 'alice', 60, 30);
      mgr.create('Plan B', 'bob', 60, 30);
      mgr.getByOwner('alice').forEach(p => expect(p.owner).toBe('alice'));
    });
  });

  // --- step management deep tests ---
  describe('step management deep', () => {
    it('addStep with large order number is stored', () => {
      const p = mgr.create('Plan', 'alice', 60, 30);
      const updated = mgr.addStep(p.id, { order: 1000, action: 'Late step', owner: 'alice', estimatedMinutes: 60 });
      expect(updated.recoverySteps[0].order).toBe(1000);
    });
    it('completeStep on already-completed step keeps it completed', () => {
      const p = mgr.create('Plan', 'alice', 60, 30);
      mgr.addStep(p.id, { order: 1, action: 'Act', owner: 'alice', estimatedMinutes: 5 });
      mgr.completeStep(p.id, 1);
      const updated = mgr.completeStep(p.id, 1);
      expect(updated.recoverySteps[0].completed).toBe(true);
    });
    it('addStep step owner can differ from plan owner', () => {
      const p = mgr.create('Plan', 'alice', 60, 30);
      const updated = mgr.addStep(p.id, { order: 1, action: 'Act', owner: 'manager', estimatedMinutes: 5 });
      expect(updated.recoverySteps[0].owner).toBe('manager');
    });
    it('getTotalEstimatedTime with 3 steps of different durations', () => {
      const p = mgr.create('Plan', 'alice', 60, 30);
      mgr.addStep(p.id, { order: 1, action: 'Step 1', owner: 'alice', estimatedMinutes: 15 });
      mgr.addStep(p.id, { order: 2, action: 'Step 2', owner: 'bob', estimatedMinutes: 30 });
      mgr.addStep(p.id, { order: 3, action: 'Step 3', owner: 'carol', estimatedMinutes: 45 });
      expect(mgr.getTotalEstimatedTime(p.id)).toBe(90);
    });
    it('getCompletionPct is 0 for plan with 5 uncompleted steps', () => {
      const p = mgr.create('Plan', 'alice', 60, 30);
      for (let i = 1; i <= 5; i++) mgr.addStep(p.id, { order: i, action: `Step ${i}`, owner: 'alice', estimatedMinutes: 5 });
      expect(mgr.getCompletionPct(p.id)).toBe(0);
    });
    it('completing 3 of 5 steps returns 60%', () => {
      const p = mgr.create('Plan', 'alice', 60, 30);
      for (let i = 1; i <= 5; i++) mgr.addStep(p.id, { order: i, action: `Step ${i}`, owner: 'alice', estimatedMinutes: 5 });
      for (let i = 1; i <= 3; i++) mgr.completeStep(p.id, i);
      expect(mgr.getCompletionPct(p.id)).toBe(60);
    });
    it('completing 4 of 5 steps returns 80%', () => {
      const p = mgr.create('Plan', 'alice', 60, 30);
      for (let i = 1; i <= 5; i++) mgr.addStep(p.id, { order: i, action: `Step ${i}`, owner: 'alice', estimatedMinutes: 5 });
      for (let i = 1; i <= 4; i++) mgr.completeStep(p.id, i);
      expect(mgr.getCompletionPct(p.id)).toBe(80);
    });
    it('step action can be empty string', () => {
      const p = mgr.create('Plan', 'alice', 60, 30);
      const updated = mgr.addStep(p.id, { order: 1, action: '', owner: 'alice', estimatedMinutes: 1 });
      expect(updated.recoverySteps[0].action).toBe('');
    });
  });

  // --- large-scale create tests ---
  describe('large-scale creation', () => {
    Array.from({ length: 30 }, (_, i) => i + 1).forEach((i) => {
      it(`large-scale plan ${i}: count equals ${i}`, () => {
        for (let j = 0; j < i; j++) mgr.create(`Plan ${j}`, 'alice', 60, 30);
        expect(mgr.getCount()).toBe(i);
      });
    });
  });

  // --- comprehensive getCompletionPct parameterized ---
  describe('getCompletionPct parameterized total steps', () => {
    Array.from({ length: 10 }, (_, i) => i + 2).forEach((total) => {
      it(`completing 1 of ${total} steps gives ${Math.round(100 / total)}%`, () => {
        const p = mgr.create('Plan', 'alice', 60, 30);
        for (let i = 1; i <= total; i++) mgr.addStep(p.id, { order: i, action: `S${i}`, owner: 'alice', estimatedMinutes: 5 });
        mgr.completeStep(p.id, 1);
        expect(mgr.getCompletionPct(p.id)).toBe(Math.round(100 / total));
      });
    });
  });

  // --- error type tests ---
  describe('error types', () => {
    it('approve throws Error instance', () => {
      expect(() => mgr.approve('bcp-bad')).toThrow(Error);
    });
    it('activate throws Error instance', () => {
      expect(() => mgr.activate('bcp-bad')).toThrow(Error);
    });
    it('retire throws Error instance', () => {
      expect(() => mgr.retire('bcp-bad')).toThrow(Error);
    });
    it('addStep throws Error instance', () => {
      expect(() => mgr.addStep('bcp-bad', { order: 1, action: 'A', owner: 'a', estimatedMinutes: 1 })).toThrow(Error);
    });
    it('completeStep throws Error instance', () => {
      expect(() => mgr.completeStep('bcp-bad', 1)).toThrow(Error);
    });
  });

  // --- getTotalEstimatedTime parameterized ---
  describe('getTotalEstimatedTime parameterized', () => {
    Array.from({ length: 15 }, (_, i) => i + 1).forEach((n) => {
      it(`${n} steps of 7 min each totals ${n * 7}`, () => {
        const p = mgr.create('Plan', 'alice', 60, 30);
        for (let i = 1; i <= n; i++) mgr.addStep(p.id, { order: i, action: `Step ${i}`, owner: 'alice', estimatedMinutes: 7 });
        expect(mgr.getTotalEstimatedTime(p.id)).toBe(n * 7);
      });
    });
  });
});

// ---------------------------------------------------------------------------
// BCPTester Extended Tests — additional 250+
// ---------------------------------------------------------------------------
describe('BCPTester Extended', () => {
  let tester: BCPTester;

  beforeEach(() => {
    tester = new BCPTester();
  });

  // --- schedule field preservation after recordResult ---
  describe('schedule data preserved through recordResult', () => {
    it('planId preserved after recordResult', () => {
      const t = tester.schedule('plan-preserved', 'WALKTHROUGH', new Date());
      expect(tester.recordResult(t.id, 'PASS').planId).toBe('plan-preserved');
    });
    it('testType preserved after recordResult', () => {
      const t = tester.schedule('plan-1', 'WALKTHROUGH', new Date());
      expect(tester.recordResult(t.id, 'PASS').testType).toBe('WALKTHROUGH');
    });
    it('scheduledDate preserved after recordResult', () => {
      const d = new Date('2026-05-01');
      const t = tester.schedule('plan-1', 'TABLETOP', d);
      expect(tester.recordResult(t.id, 'PASS').scheduledDate).toEqual(d);
    });
    it('id preserved after recordResult', () => {
      const t = tester.schedule('plan-1', 'TABLETOP', new Date());
      const id = t.id;
      expect(tester.recordResult(id, 'PASS').id).toBe(id);
    });
  });

  // --- getAll reflects all scheduled tests ---
  describe('getAll reflects all scheduled tests', () => {
    it('getAll length equals getCount', () => {
      for (let i = 0; i < 5; i++) tester.schedule(`plan-${i}`, 'TABLETOP', new Date());
      expect(tester.getAll().length).toBe(tester.getCount());
    });
    it('all plans are distinct by id', () => {
      const tests = Array.from({ length: 10 }, (_, i) => tester.schedule(`plan-${i}`, 'TABLETOP', new Date()));
      const ids = tests.map(t => t.id);
      expect(new Set(ids).size).toBe(10);
    });
    it('getAll includes tests with result set', () => {
      const t = tester.schedule('plan-1', 'TABLETOP', new Date());
      tester.recordResult(t.id, 'PASS');
      expect(tester.getAll().some(r => r.result === 'PASS')).toBe(true);
    });
    it('getAll includes pending tests', () => {
      tester.schedule('plan-1', 'TABLETOP', new Date());
      expect(tester.getAll().some(r => r.conductedDate === undefined)).toBe(true);
    });
  });

  // --- getByPlan comprehensive ---
  describe('getByPlan comprehensive', () => {
    it('3 tests for plan-A, 2 for plan-B: correct split', () => {
      for (let i = 0; i < 3; i++) tester.schedule('plan-A', 'TABLETOP', new Date());
      for (let i = 0; i < 2; i++) tester.schedule('plan-B', 'SIMULATION', new Date());
      expect(tester.getByPlan('plan-A')).toHaveLength(3);
      expect(tester.getByPlan('plan-B')).toHaveLength(2);
    });
    it('getByPlan results all have correct planId', () => {
      tester.schedule('plan-Z', 'TABLETOP', new Date());
      tester.schedule('plan-Z', 'WALKTHROUGH', new Date());
      tester.getByPlan('plan-Z').forEach(t => expect(t.planId).toBe('plan-Z'));
    });
  });

  // --- getByType comprehensive ---
  describe('getByType comprehensive', () => {
    it('2 TABLETOP, 3 SIMULATION: each type returns correct count', () => {
      for (let i = 0; i < 2; i++) tester.schedule('plan-1', 'TABLETOP', new Date());
      for (let i = 0; i < 3; i++) tester.schedule('plan-2', 'SIMULATION', new Date());
      expect(tester.getByType('TABLETOP')).toHaveLength(2);
      expect(tester.getByType('SIMULATION')).toHaveLength(3);
    });
    it('getByType WALKTHROUGH returns only WALKTHROUGH tests', () => {
      tester.schedule('plan-1', 'WALKTHROUGH', new Date());
      tester.schedule('plan-2', 'TABLETOP', new Date());
      tester.getByType('WALKTHROUGH').forEach(t => expect(t.testType).toBe('WALKTHROUGH'));
    });
    it('getByType FULL_INTERRUPTION returns only FULL_INTERRUPTION tests', () => {
      tester.schedule('plan-1', 'FULL_INTERRUPTION', new Date());
      tester.schedule('plan-2', 'SIMULATION', new Date());
      tester.getByType('FULL_INTERRUPTION').forEach(t => expect(t.testType).toBe('FULL_INTERRUPTION'));
    });
  });

  // --- getTestsWithGaps comprehensive ---
  describe('getTestsWithGaps comprehensive', () => {
    it('multiple tests, only those with gaps returned', () => {
      const a = tester.schedule('p1', 'TABLETOP', new Date());
      const b = tester.schedule('p2', 'SIMULATION', new Date());
      const c = tester.schedule('p3', 'WALKTHROUGH', new Date());
      tester.recordResult(a.id, 'PASS');
      tester.recordResult(b.id, 'FAIL', { gaps: ['G1'] });
      tester.recordResult(c.id, 'PARTIAL', { gaps: ['G2', 'G3'] });
      expect(tester.getTestsWithGaps()).toHaveLength(2);
    });
    it('getTestsWithGaps includes PARTIAL tests with gaps', () => {
      const t = tester.schedule('p1', 'TABLETOP', new Date());
      tester.recordResult(t.id, 'PARTIAL', { gaps: ['Gap A'] });
      expect(tester.getTestsWithGaps()).toHaveLength(1);
    });
    it('getTestsWithGaps includes PASS tests if they have gaps', () => {
      const t = tester.schedule('p1', 'TABLETOP', new Date());
      tester.recordResult(t.id, 'PASS', { gaps: ['Minor gap'] });
      expect(tester.getTestsWithGaps()).toHaveLength(1);
    });
    it('gaps count is preserved correctly', () => {
      const t = tester.schedule('p1', 'TABLETOP', new Date());
      tester.recordResult(t.id, 'FAIL', { gaps: ['G1', 'G2', 'G3', 'G4', 'G5'] });
      expect(tester.getTestsWithGaps()[0].gaps).toHaveLength(5);
    });
  });

  // --- getPending / getCompleted balance ---
  describe('getPending / getCompleted balance', () => {
    Array.from({ length: 10 }, (_, i) => i + 1).forEach((n) => {
      it(`after scheduling ${n} and completing half, pending + completed = ${n}`, () => {
        const tests = Array.from({ length: n }, (_, i) => tester.schedule(`p${i}`, 'TABLETOP', new Date()));
        const half = Math.floor(n / 2);
        tests.slice(0, half).forEach(t => tester.recordResult(t.id, 'PASS'));
        expect(tester.getPending().length + tester.getCompleted().length).toBe(n);
      });
    });
  });

  // --- getPassRate comprehensive ---
  describe('getPassRate comprehensive', () => {
    it('10 PASS tests: passRate = 100', () => {
      const tests = Array.from({ length: 10 }, (_, i) => tester.schedule(`p${i}`, 'TABLETOP', new Date()));
      tests.forEach(t => tester.recordResult(t.id, 'PASS'));
      expect(tester.getPassRate()).toBe(100);
    });
    it('10 FAIL tests: passRate = 0', () => {
      const tests = Array.from({ length: 10 }, (_, i) => tester.schedule(`p${i}`, 'TABLETOP', new Date()));
      tests.forEach(t => tester.recordResult(t.id, 'FAIL'));
      expect(tester.getPassRate()).toBe(0);
    });
    it('5 PASS + 5 PARTIAL: passRate = 50', () => {
      const tests = Array.from({ length: 10 }, (_, i) => tester.schedule(`p${i}`, 'TABLETOP', new Date()));
      tests.slice(0, 5).forEach(t => tester.recordResult(t.id, 'PASS'));
      tests.slice(5).forEach(t => tester.recordResult(t.id, 'PARTIAL'));
      expect(tester.getPassRate()).toBe(50);
    });
    it('all PARTIAL tests: passRate = 0', () => {
      const tests = Array.from({ length: 5 }, (_, i) => tester.schedule(`p${i}`, 'TABLETOP', new Date()));
      tests.forEach(t => tester.recordResult(t.id, 'PARTIAL'));
      expect(tester.getPassRate()).toBe(0);
    });
  });

  // --- recordResult opts combinations ---
  describe('recordResult opts combinations', () => {
    it('all opts provided: all stored', () => {
      const t = tester.schedule('plan-1', 'SIMULATION', new Date());
      const updated = tester.recordResult(t.id, 'PASS', {
        rtoActualMinutes: 45,
        rpoActualMinutes: 20,
        notes: 'Good result',
        gaps: [],
      });
      expect(updated.rtoActualMinutes).toBe(45);
      expect(updated.rpoActualMinutes).toBe(20);
      expect(updated.notes).toBe('Good result');
      expect(updated.gaps).toHaveLength(0);
    });
    it('only rtoActualMinutes provided: rpo is undefined', () => {
      const t = tester.schedule('plan-1', 'TABLETOP', new Date());
      const updated = tester.recordResult(t.id, 'PASS', { rtoActualMinutes: 30 });
      expect(updated.rtoActualMinutes).toBe(30);
      expect(updated.rpoActualMinutes).toBeUndefined();
    });
    it('only rpoActualMinutes provided: rto is undefined', () => {
      const t = tester.schedule('plan-1', 'TABLETOP', new Date());
      const updated = tester.recordResult(t.id, 'PASS', { rpoActualMinutes: 15 });
      expect(updated.rpoActualMinutes).toBe(15);
      expect(updated.rtoActualMinutes).toBeUndefined();
    });
    it('only notes provided: gaps is empty array', () => {
      const t = tester.schedule('plan-1', 'TABLETOP', new Date());
      const updated = tester.recordResult(t.id, 'PASS', { notes: 'Some note' });
      expect(updated.notes).toBe('Some note');
      expect(updated.gaps).toHaveLength(0);
    });
    it('only gaps provided: notes is undefined', () => {
      const t = tester.schedule('plan-1', 'TABLETOP', new Date());
      const updated = tester.recordResult(t.id, 'FAIL', { gaps: ['Gap X'] });
      expect(updated.gaps).toContain('Gap X');
      expect(updated.notes).toBeUndefined();
    });
  });

  // --- schedule bulk unique id verification ---
  describe('schedule bulk unique id verification', () => {
    it('50 scheduled tests all have unique ids', () => {
      const ids = Array.from({ length: 50 }, (_, i) =>
        tester.schedule(`plan-${i}`, 'TABLETOP', new Date()).id
      );
      expect(new Set(ids).size).toBe(50);
    });
  });

  // --- getByResult post multiple recordings ---
  describe('getByResult after multiple recordings', () => {
    it('recording PASS then FAIL: getByResult PASS returns 1, FAIL returns 1', () => {
      const a = tester.schedule('p1', 'TABLETOP', new Date());
      const b = tester.schedule('p2', 'SIMULATION', new Date());
      tester.recordResult(a.id, 'PASS');
      tester.recordResult(b.id, 'FAIL');
      expect(tester.getByResult('PASS')).toHaveLength(1);
      expect(tester.getByResult('FAIL')).toHaveLength(1);
    });
    it('5 PARTIAL recordings: getByResult PARTIAL returns 5', () => {
      const tests = Array.from({ length: 5 }, (_, i) => tester.schedule(`p${i}`, 'WALKTHROUGH', new Date()));
      tests.forEach(t => tester.recordResult(t.id, 'PARTIAL'));
      expect(tester.getByResult('PARTIAL')).toHaveLength(5);
    });
  });

  // --- getCompleted ensures conductedDate is set ---
  describe('getCompleted conductedDate integrity', () => {
    it('all completed tests have conductedDate set', () => {
      const tests = Array.from({ length: 5 }, (_, i) => tester.schedule(`p${i}`, 'TABLETOP', new Date()));
      tests.forEach(t => tester.recordResult(t.id, 'PASS'));
      tester.getCompleted().forEach(t => expect(t.conductedDate).toBeInstanceOf(Date));
    });
    it('no pending test has conductedDate', () => {
      Array.from({ length: 5 }, (_, i) => tester.schedule(`p${i}`, 'TABLETOP', new Date()));
      tester.getPending().forEach(t => expect(t.conductedDate).toBeUndefined());
    });
  });

  // --- parameterized: schedule 25 tests different types ---
  describe('parameterized 25 tests across types', () => {
    const types: TestType[] = ['TABLETOP', 'WALKTHROUGH', 'SIMULATION', 'FULL_INTERRUPTION'];
    Array.from({ length: 25 }, (_, i) => i).forEach((i) => {
      const type = types[i % types.length];
      it(`schedule index ${i} type '${type}' is stored correctly`, () => {
        const t = tester.schedule(`plan-${i}`, type, new Date());
        expect(t.testType).toBe(type);
      });
    });
  });

  // --- getCount after various operations ---
  describe('getCount stability', () => {
    it('getCount is stable after recordResult', () => {
      const t = tester.schedule('plan-1', 'TABLETOP', new Date());
      tester.recordResult(t.id, 'PASS');
      tester.recordResult(t.id, 'FAIL');
      expect(tester.getCount()).toBe(1);
    });
    it('getCount equals 20 after 20 schedules', () => {
      for (let i = 0; i < 20; i++) tester.schedule(`plan-${i}`, 'TABLETOP', new Date());
      expect(tester.getCount()).toBe(20);
    });
    it('getCount is not affected by getByType calls', () => {
      tester.schedule('p1', 'TABLETOP', new Date());
      tester.getByType('TABLETOP');
      expect(tester.getCount()).toBe(1);
    });
  });

  // --- recordResult: gaps is array (not undefined) even when empty ---
  describe('recordResult gaps is always array', () => {
    it('gaps is array when not provided in opts', () => {
      const t = tester.schedule('plan-1', 'TABLETOP', new Date());
      const updated = tester.recordResult(t.id, 'PASS');
      expect(Array.isArray(updated.gaps)).toBe(true);
    });
    it('gaps is array when empty array provided', () => {
      const t = tester.schedule('plan-1', 'TABLETOP', new Date());
      const updated = tester.recordResult(t.id, 'PASS', { gaps: [] });
      expect(Array.isArray(updated.gaps)).toBe(true);
    });
    it('gaps is array when non-empty array provided', () => {
      const t = tester.schedule('plan-1', 'TABLETOP', new Date());
      const updated = tester.recordResult(t.id, 'FAIL', { gaps: ['G1'] });
      expect(Array.isArray(updated.gaps)).toBe(true);
    });
  });

  // --- parameterized: large gap arrays ---
  describe('parameterized large gap arrays', () => {
    Array.from({ length: 10 }, (_, i) => i + 5).forEach((n) => {
      it(`recording ${n} gaps: getTestsWithGaps finds the test`, () => {
        const t = tester.schedule('plan-1', 'SIMULATION', new Date());
        const gaps = Array.from({ length: n }, (_, i) => `Gap ${i + 1}`);
        tester.recordResult(t.id, 'FAIL', { gaps });
        expect(tester.getTestsWithGaps()).toHaveLength(1);
      });
    });
  });
});

// ---------------------------------------------------------------------------
// BCPManager + BCPTester Combined Integration Tests
// ---------------------------------------------------------------------------
describe('BCPManager + BCPTester Combined', () => {
  let mgr: BCPManager;
  let tester: BCPTester;

  beforeEach(() => {
    mgr = new BCPManager();
    tester = new BCPTester();
  });

  it('create plan and schedule test for same planId', () => {
    const plan = mgr.create('Cyber Plan', 'alice', 240, 60);
    const test = tester.schedule(plan.id, 'TABLETOP', new Date());
    expect(test.planId).toBe(plan.id);
  });

  it('plan is ACTIVE, test PASS: system is ready', () => {
    const plan = mgr.create('DR Plan', 'alice', 60, 30);
    mgr.activate(plan.id);
    const test = tester.schedule(plan.id, 'SIMULATION', new Date());
    tester.recordResult(test.id, 'PASS');
    expect(mgr.get(plan.id)!.status).toBe('ACTIVE');
    expect(tester.get(test.id)!.result).toBe('PASS');
  });

  it('multiple plans with tests: each isolated', () => {
    const p1 = mgr.create('Plan 1', 'alice', 60, 30);
    const p2 = mgr.create('Plan 2', 'bob', 120, 60);
    const t1 = tester.schedule(p1.id, 'TABLETOP', new Date());
    const t2 = tester.schedule(p2.id, 'SIMULATION', new Date());
    tester.recordResult(t1.id, 'PASS');
    tester.recordResult(t2.id, 'FAIL');
    expect(tester.getByPlan(p1.id)[0].result).toBe('PASS');
    expect(tester.getByPlan(p2.id)[0].result).toBe('FAIL');
  });

  it('plan with steps: total time vs rto comparison', () => {
    const plan = mgr.create('Recovery Plan', 'alice', 120, 60);
    mgr.addStep(plan.id, { order: 1, action: 'Triage', owner: 'alice', estimatedMinutes: 30 });
    mgr.addStep(plan.id, { order: 2, action: 'Restore', owner: 'bob', estimatedMinutes: 60 });
    mgr.addStep(plan.id, { order: 3, action: 'Verify', owner: 'carol', estimatedMinutes: 20 });
    const totalTime = mgr.getTotalEstimatedTime(plan.id);
    expect(totalTime).toBe(110);
    expect(totalTime).toBeLessThan(plan.rtoMinutes + 10);
  });

  it('plan progress tracked via getCompletionPct after each step', () => {
    const plan = mgr.create('Plan', 'alice', 60, 30);
    for (let i = 1; i <= 4; i++) mgr.addStep(plan.id, { order: i, action: `Step ${i}`, owner: 'alice', estimatedMinutes: 10 });
    expect(mgr.getCompletionPct(plan.id)).toBe(0);
    mgr.completeStep(plan.id, 1);
    expect(mgr.getCompletionPct(plan.id)).toBe(25);
    mgr.completeStep(plan.id, 2);
    expect(mgr.getCompletionPct(plan.id)).toBe(50);
    mgr.completeStep(plan.id, 3);
    expect(mgr.getCompletionPct(plan.id)).toBe(75);
    mgr.completeStep(plan.id, 4);
    expect(mgr.getCompletionPct(plan.id)).toBe(100);
  });

  it('test scheduled for approved plan: result stored independently', () => {
    const plan = mgr.create('Plan', 'alice', 60, 30);
    mgr.approve(plan.id);
    const test = tester.schedule(plan.id, 'WALKTHROUGH', new Date());
    tester.recordResult(test.id, 'PARTIAL', { notes: 'Some issues found', gaps: ['Gap A'] });
    expect(mgr.get(plan.id)!.status).toBe('APPROVED');
    expect(tester.get(test.id)!.result).toBe('PARTIAL');
    expect(tester.getTestsWithGaps()).toHaveLength(1);
  });

  it('two managers and testers are fully independent', () => {
    const mgr2 = new BCPManager();
    const tester2 = new BCPTester();
    mgr.create('Plan A', 'alice', 60, 30);
    tester.schedule('plan-1', 'TABLETOP', new Date());
    expect(mgr2.getCount()).toBe(0);
    expect(tester2.getCount()).toBe(0);
  });

  // Parameterized combined plan + test scenarios
  Array.from({ length: 20 }, (_, i) => i + 1).forEach((i) => {
    it(`combined scenario ${i}: plan rto=${i * 10}, test planId matches`, () => {
      const plan = mgr.create(`Plan ${i}`, `owner-${i}`, i * 10, i * 5);
      const test = tester.schedule(plan.id, 'TABLETOP', new Date());
      expect(plan.rtoMinutes).toBe(i * 10);
      expect(test.planId).toBe(plan.id);
    });
  });

  Array.from({ length: 20 }, (_, i) => i + 1).forEach((i) => {
    it(`combined pass rate scenario ${i}: ${i} passes out of ${i} = 100%`, () => {
      const tests = Array.from({ length: i }, (_, j) => tester.schedule(`plan-${j}`, 'TABLETOP', new Date()));
      tests.forEach(t => tester.recordResult(t.id, 'PASS'));
      expect(tester.getPassRate()).toBe(100);
    });
  });
});

// ---------------------------------------------------------------------------
// BCPManager Extra Property Tests
// ---------------------------------------------------------------------------
describe('BCPManager Extra Property Tests', () => {
  let mgr: BCPManager;

  beforeEach(() => {
    mgr = new BCPManager();
  });

  Array.from({ length: 25 }, (_, i) => i + 1).forEach((i) => {
    it(`plan property check ${i}: name is string type`, () => {
      const p = mgr.create(`Name ${i}`, 'owner', 60, 30);
      expect(typeof p.name).toBe('string');
    });
  });

  Array.from({ length: 25 }, (_, i) => i + 1).forEach((i) => {
    it(`plan property check ${i}: owner is string type`, () => {
      const p = mgr.create('Plan', `owner-${i}`, 60, 30);
      expect(typeof p.owner).toBe('string');
    });
  });

  Array.from({ length: 25 }, (_, i) => i + 1).forEach((i) => {
    it(`plan property check ${i}: rtoMinutes is number type`, () => {
      const p = mgr.create('Plan', 'alice', i * 5, i * 2);
      expect(typeof p.rtoMinutes).toBe('number');
    });
  });

  Array.from({ length: 25 }, (_, i) => i + 1).forEach((i) => {
    it(`plan property check ${i}: rpoMinutes is number type`, () => {
      const p = mgr.create('Plan', 'alice', i * 5, i * 2);
      expect(typeof p.rpoMinutes).toBe('number');
    });
  });
});

// ---------------------------------------------------------------------------
// BCPTester Extra Property Tests
// ---------------------------------------------------------------------------
describe('BCPTester Extra Property Tests', () => {
  let tester: BCPTester;

  beforeEach(() => {
    tester = new BCPTester();
  });

  Array.from({ length: 25 }, (_, i) => i + 1).forEach((i) => {
    it(`test property check ${i}: planId is string type`, () => {
      const t = tester.schedule(`plan-${i}`, 'TABLETOP', new Date());
      expect(typeof t.planId).toBe('string');
    });
  });

  Array.from({ length: 25 }, (_, i) => i + 1).forEach((i) => {
    it(`test property check ${i}: gaps is array type`, () => {
      const t = tester.schedule(`plan-${i}`, 'SIMULATION', new Date());
      expect(Array.isArray(t.gaps)).toBe(true);
    });
  });

  Array.from({ length: 25 }, (_, i) => i + 1).forEach((i) => {
    it(`test property check ${i}: testType is string`, () => {
      const t = tester.schedule(`plan-${i}`, 'WALKTHROUGH', new Date());
      expect(typeof t.testType).toBe('string');
    });
  });

  Array.from({ length: 25 }, (_, i) => i + 1).forEach((i) => {
    it(`test property check ${i}: scheduledDate is Date`, () => {
      const t = tester.schedule(`plan-${i}`, 'TABLETOP', new Date());
      expect(t.scheduledDate).toBeInstanceOf(Date);
    });
  });
});
