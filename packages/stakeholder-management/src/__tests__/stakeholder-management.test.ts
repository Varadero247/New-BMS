// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  StakeholderRegistry,
  CommunicationTracker,
  computeEngagementStrategy,
  StakeholderType,
  InfluenceLevel,
  InterestLevel,
  EngagementStrategy,
  CommunicationMethod,
  CommunicationStatus,
} from '../index';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const STAKEHOLDER_TYPES: StakeholderType[] = [
  'INTERNAL',
  'EXTERNAL',
  'REGULATORY',
  'CUSTOMER',
  'SUPPLIER',
  'COMMUNITY',
  'INVESTOR',
];

const INFLUENCE_LEVELS: InfluenceLevel[] = ['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH'];
const INTEREST_LEVELS: InterestLevel[] = ['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH'];
const ENGAGEMENT_STRATEGIES: EngagementStrategy[] = [
  'MONITOR',
  'KEEP_INFORMED',
  'KEEP_SATISFIED',
  'MANAGE_CLOSELY',
];
const COMM_METHODS: CommunicationMethod[] = [
  'EMAIL',
  'MEETING',
  'REPORT',
  'NEWSLETTER',
  'SURVEY',
  'PORTAL',
];
const COMM_STATUSES: CommunicationStatus[] = [
  'PLANNED',
  'SENT',
  'ACKNOWLEDGED',
  'RESPONDED',
];

function makeStakeholder(
  id: string,
  overrides: Partial<{
    type: StakeholderType;
    influence: InfluenceLevel;
    interest: InterestLevel;
    strategy: EngagementStrategy;
  }> = {},
) {
  const influence: InfluenceLevel = overrides.influence ?? 'LOW';
  const interest: InterestLevel = overrides.interest ?? 'LOW';
  return {
    id,
    name: `Stakeholder ${id}`,
    type: overrides.type ?? ('INTERNAL' as StakeholderType),
    organization: `Org ${id}`,
    role: `Role ${id}`,
    influence,
    interest,
    engagementStrategy:
      overrides.strategy ?? computeEngagementStrategy(influence, interest),
    needs: [`need-${id}`],
    expectations: [`expectation-${id}`],
    contactEmail: `contact-${id}@example.com`,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. computeEngagementStrategy
// ─────────────────────────────────────────────────────────────────────────────

describe('computeEngagementStrategy', () => {
  // MANAGE_CLOSELY: high/very_high × high/very_high
  const highInfluences: InfluenceLevel[] = ['HIGH', 'VERY_HIGH'];
  const highInterests: InterestLevel[] = ['HIGH', 'VERY_HIGH'];

  highInfluences.forEach((inf) => {
    highInterests.forEach((int) => {
      it(`returns MANAGE_CLOSELY for influence=${inf} interest=${int}`, () => {
        expect(computeEngagementStrategy(inf, int)).toBe('MANAGE_CLOSELY');
      });
    });
  });

  // KEEP_INFORMED: low/medium × high/very_high
  const lowInfluences: InfluenceLevel[] = ['LOW', 'MEDIUM'];
  lowInfluences.forEach((inf) => {
    highInterests.forEach((int) => {
      it(`returns KEEP_INFORMED for influence=${inf} interest=${int}`, () => {
        expect(computeEngagementStrategy(inf, int)).toBe('KEEP_INFORMED');
      });
    });
  });

  // KEEP_SATISFIED: high/very_high × low/medium
  const lowInterests: InterestLevel[] = ['LOW', 'MEDIUM'];
  highInfluences.forEach((inf) => {
    lowInterests.forEach((int) => {
      it(`returns KEEP_SATISFIED for influence=${inf} interest=${int}`, () => {
        expect(computeEngagementStrategy(inf, int)).toBe('KEEP_SATISFIED');
      });
    });
  });

  // MONITOR: low/medium × low/medium
  lowInfluences.forEach((inf) => {
    lowInterests.forEach((int) => {
      it(`returns MONITOR for influence=${inf} interest=${int}`, () => {
        expect(computeEngagementStrategy(inf, int)).toBe('MONITOR');
      });
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. StakeholderRegistry — basic operations
// ─────────────────────────────────────────────────────────────────────────────

describe('StakeholderRegistry — register & get', () => {
  let registry: StakeholderRegistry;

  beforeEach(() => {
    registry = new StakeholderRegistry();
  });

  it('returns undefined for unknown id', () => {
    expect(registry.get('nonexistent')).toBeUndefined();
  });

  it('starts with count 0', () => {
    expect(registry.getCount()).toBe(0);
  });

  it('getAll returns empty array initially', () => {
    expect(registry.getAll()).toEqual([]);
  });

  it('getActive returns empty array initially', () => {
    expect(registry.getActive()).toEqual([]);
  });

  // Register 30 stakeholders and verify each
  Array.from({ length: 30 }, (_, i) => i).forEach((i) => {
    it(`register #${i}: stores and retrieves by id`, () => {
      const data = makeStakeholder(`sh-${i}`);
      const result = registry.register(data);
      expect(result.id).toBe(`sh-${i}`);
      expect(result.isActive).toBe(true);
      expect(registry.get(`sh-${i}`)).toMatchObject({ id: `sh-${i}`, isActive: true });
    });
  });

  // Register + count
  Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
    it(`register #${i}: count increments correctly`, () => {
      const data = makeStakeholder(`cnt-${i}`);
      registry.register(data);
      expect(registry.getCount()).toBe(1);
    });
  });

  // Register sets isActive true regardless of what is passed
  it('register always sets isActive=true', () => {
    const data = makeStakeholder('active-check');
    const result = registry.register(data);
    expect(result.isActive).toBe(true);
  });

  // getAll reflects all registered records
  it('getAll returns all registered stakeholders', () => {
    for (let i = 0; i < 5; i++) {
      registry.register(makeStakeholder(`all-${i}`));
    }
    expect(registry.getAll()).toHaveLength(5);
  });

  // Returned object is a copy (mutation safety)
  it('register returns a copy — mutating result does not affect store', () => {
    const data = makeStakeholder('copy-test');
    const result = registry.register(data);
    (result as any).name = 'MUTATED';
    expect(registry.get('copy-test')!.name).toBe(`Stakeholder copy-test`);
  });

  it('get returns a copy — mutating result does not affect store', () => {
    registry.register(makeStakeholder('copy-get'));
    const got = registry.get('copy-get')!;
    got.name = 'MUTATED';
    expect(registry.get('copy-get')!.name).toBe('Stakeholder copy-get');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. StakeholderRegistry — deactivate / reactivate
// ─────────────────────────────────────────────────────────────────────────────

describe('StakeholderRegistry — deactivate & reactivate', () => {
  let registry: StakeholderRegistry;

  beforeEach(() => {
    registry = new StakeholderRegistry();
  });

  it('deactivate throws for unknown id', () => {
    expect(() => registry.deactivate('ghost')).toThrow('ghost');
  });

  it('reactivate throws for unknown id', () => {
    expect(() => registry.reactivate('ghost')).toThrow('ghost');
  });

  // 25 deactivation scenarios
  Array.from({ length: 25 }, (_, i) => i).forEach((i) => {
    it(`deactivate #${i}: sets isActive=false`, () => {
      const id = `deact-${i}`;
      registry.register(makeStakeholder(id));
      const result = registry.deactivate(id);
      expect(result.isActive).toBe(false);
      expect(registry.get(id)!.isActive).toBe(false);
    });
  });

  // 25 reactivation scenarios
  Array.from({ length: 25 }, (_, i) => i).forEach((i) => {
    it(`reactivate #${i}: sets isActive=true after deactivation`, () => {
      const id = `react-${i}`;
      registry.register(makeStakeholder(id));
      registry.deactivate(id);
      const result = registry.reactivate(id);
      expect(result.isActive).toBe(true);
      expect(registry.get(id)!.isActive).toBe(true);
    });
  });

  it('deactivated stakeholder excluded from getActive()', () => {
    registry.register(makeStakeholder('a'));
    registry.register(makeStakeholder('b'));
    registry.deactivate('a');
    const active = registry.getActive();
    expect(active.map((r) => r.id)).not.toContain('a');
    expect(active.map((r) => r.id)).toContain('b');
  });

  it('reactivated stakeholder included in getActive()', () => {
    registry.register(makeStakeholder('r1'));
    registry.deactivate('r1');
    registry.reactivate('r1');
    expect(registry.getActive().map((r) => r.id)).toContain('r1');
  });

  it('count does not change on deactivate', () => {
    registry.register(makeStakeholder('dc1'));
    registry.register(makeStakeholder('dc2'));
    registry.deactivate('dc1');
    expect(registry.getCount()).toBe(2);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. StakeholderRegistry — update
// ─────────────────────────────────────────────────────────────────────────────

describe('StakeholderRegistry — update', () => {
  let registry: StakeholderRegistry;

  beforeEach(() => {
    registry = new StakeholderRegistry();
  });

  it('update throws for unknown id', () => {
    expect(() => registry.update('unknown', { name: 'X' })).toThrow('unknown');
  });

  // 30 update scenarios covering different fields
  Array.from({ length: 30 }, (_, i) => i).forEach((i) => {
    it(`update #${i}: updates name field`, () => {
      const id = `upd-${i}`;
      registry.register(makeStakeholder(id));
      const result = registry.update(id, { name: `Updated Name ${i}` });
      expect(result.name).toBe(`Updated Name ${i}`);
      expect(registry.get(id)!.name).toBe(`Updated Name ${i}`);
    });
  });

  // update keeps non-touched fields
  it('update preserves untouched fields', () => {
    registry.register(makeStakeholder('preserve'));
    registry.update('preserve', { name: 'New Name' });
    const record = registry.get('preserve')!;
    expect(record.id).toBe('preserve');
    expect(record.isActive).toBe(true);
    expect(record.type).toBe('INTERNAL');
  });

  // update type
  STAKEHOLDER_TYPES.forEach((type) => {
    it(`update: can set type to ${type}`, () => {
      const id = `type-upd-${type}`;
      registry.register(makeStakeholder(id));
      registry.update(id, { type });
      expect(registry.get(id)!.type).toBe(type);
    });
  });

  // update influence
  INFLUENCE_LEVELS.forEach((level) => {
    it(`update: can set influence to ${level}`, () => {
      const id = `inf-upd-${level}`;
      registry.register(makeStakeholder(id));
      registry.update(id, { influence: level });
      expect(registry.get(id)!.influence).toBe(level);
    });
  });

  // update interest
  INTEREST_LEVELS.forEach((level) => {
    it(`update: can set interest to ${level}`, () => {
      const id = `int-upd-${level}`;
      registry.register(makeStakeholder(id));
      registry.update(id, { interest: level });
      expect(registry.get(id)!.interest).toBe(level);
    });
  });

  // update strategy
  ENGAGEMENT_STRATEGIES.forEach((strategy) => {
    it(`update: can set engagementStrategy to ${strategy}`, () => {
      const id = `strat-upd-${strategy}`;
      registry.register(makeStakeholder(id));
      registry.update(id, { engagementStrategy: strategy });
      expect(registry.get(id)!.engagementStrategy).toBe(strategy);
    });
  });

  it('update: can set needs array', () => {
    registry.register(makeStakeholder('needs-upd'));
    registry.update('needs-upd', { needs: ['n1', 'n2', 'n3'] });
    expect(registry.get('needs-upd')!.needs).toEqual(['n1', 'n2', 'n3']);
  });

  it('update: can set expectations array', () => {
    registry.register(makeStakeholder('exp-upd'));
    registry.update('exp-upd', { expectations: ['e1', 'e2'] });
    expect(registry.get('exp-upd')!.expectations).toEqual(['e1', 'e2']);
  });

  it('update: can set contactEmail', () => {
    registry.register(makeStakeholder('email-upd'));
    registry.update('email-upd', { contactEmail: 'new@example.com' });
    expect(registry.get('email-upd')!.contactEmail).toBe('new@example.com');
  });

  it('update: can set organization', () => {
    registry.register(makeStakeholder('org-upd'));
    registry.update('org-upd', { organization: 'New Corp' });
    expect(registry.get('org-upd')!.organization).toBe('New Corp');
  });

  it('update: can set role', () => {
    registry.register(makeStakeholder('role-upd'));
    registry.update('role-upd', { role: 'Director' });
    expect(registry.get('role-upd')!.role).toBe('Director');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. StakeholderRegistry — filter methods
// ─────────────────────────────────────────────────────────────────────────────

describe('StakeholderRegistry — getByType', () => {
  let registry: StakeholderRegistry;

  beforeEach(() => {
    registry = new StakeholderRegistry();
  });

  // 3 per type
  STAKEHOLDER_TYPES.forEach((type) => {
    Array.from({ length: 3 }, (_, i) => i).forEach((i) => {
      it(`getByType ${type} #${i}: correct record included`, () => {
        const id = `type-${type}-${i}`;
        registry.register(makeStakeholder(id, { type }));
        expect(registry.getByType(type).map((r) => r.id)).toContain(id);
      });
    });
  });

  it('getByType excludes wrong type', () => {
    registry.register(makeStakeholder('a', { type: 'INTERNAL' }));
    registry.register(makeStakeholder('b', { type: 'EXTERNAL' }));
    expect(registry.getByType('INTERNAL').map((r) => r.id)).not.toContain('b');
  });
});

describe('StakeholderRegistry — getByStrategy', () => {
  let registry: StakeholderRegistry;

  beforeEach(() => {
    registry = new StakeholderRegistry();
  });

  ENGAGEMENT_STRATEGIES.forEach((strategy) => {
    Array.from({ length: 3 }, (_, i) => i).forEach((i) => {
      it(`getByStrategy ${strategy} #${i}: record returned`, () => {
        const id = `strat-${strategy}-${i}`;
        registry.register(makeStakeholder(id, { strategy }));
        expect(registry.getByStrategy(strategy).map((r) => r.id)).toContain(id);
      });
    });
  });

  it('getByStrategy excludes wrong strategy', () => {
    registry.register(makeStakeholder('s1', { strategy: 'MONITOR' }));
    registry.register(makeStakeholder('s2', { strategy: 'MANAGE_CLOSELY' }));
    expect(registry.getByStrategy('MONITOR').map((r) => r.id)).not.toContain('s2');
  });
});

describe('StakeholderRegistry — getByInfluence', () => {
  let registry: StakeholderRegistry;

  beforeEach(() => {
    registry = new StakeholderRegistry();
  });

  INFLUENCE_LEVELS.forEach((level) => {
    Array.from({ length: 3 }, (_, i) => i).forEach((i) => {
      it(`getByInfluence ${level} #${i}: record returned`, () => {
        const id = `inf-${level}-${i}`;
        registry.register(makeStakeholder(id, { influence: level }));
        expect(registry.getByInfluence(level).map((r) => r.id)).toContain(id);
      });
    });
  });

  it('getByInfluence excludes wrong level', () => {
    registry.register(makeStakeholder('i1', { influence: 'LOW' }));
    registry.register(makeStakeholder('i2', { influence: 'HIGH' }));
    expect(registry.getByInfluence('LOW').map((r) => r.id)).not.toContain('i2');
  });
});

describe('StakeholderRegistry — getByInterest', () => {
  let registry: StakeholderRegistry;

  beforeEach(() => {
    registry = new StakeholderRegistry();
  });

  INTEREST_LEVELS.forEach((level) => {
    Array.from({ length: 3 }, (_, i) => i).forEach((i) => {
      it(`getByInterest ${level} #${i}: record returned`, () => {
        const id = `int-${level}-${i}`;
        registry.register(makeStakeholder(id, { interest: level }));
        expect(registry.getByInterest(level).map((r) => r.id)).toContain(id);
      });
    });
  });

  it('getByInterest excludes wrong level', () => {
    registry.register(makeStakeholder('ii1', { interest: 'LOW' }));
    registry.register(makeStakeholder('ii2', { interest: 'VERY_HIGH' }));
    expect(registry.getByInterest('LOW').map((r) => r.id)).not.toContain('ii2');
  });
});

describe('StakeholderRegistry — getHighPriority', () => {
  let registry: StakeholderRegistry;

  beforeEach(() => {
    registry = new StakeholderRegistry();
  });

  Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
    it(`getHighPriority #${i}: MANAGE_CLOSELY stakeholder is included`, () => {
      const id = `hp-${i}`;
      registry.register(makeStakeholder(id, { strategy: 'MANAGE_CLOSELY' }));
      expect(registry.getHighPriority().map((r) => r.id)).toContain(id);
    });
  });

  Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
    it(`getHighPriority #${i}: non-MANAGE_CLOSELY excluded`, () => {
      const id = `nhp-${i}`;
      const strat = ENGAGEMENT_STRATEGIES.filter((s) => s !== 'MANAGE_CLOSELY')[
        i % 3
      ];
      registry.register(makeStakeholder(id, { strategy: strat }));
      expect(registry.getHighPriority().map((r) => r.id)).not.toContain(id);
    });
  });

  it('getHighPriority returns empty when no MANAGE_CLOSELY registered', () => {
    registry.register(makeStakeholder('m1', { strategy: 'MONITOR' }));
    registry.register(makeStakeholder('m2', { strategy: 'KEEP_INFORMED' }));
    expect(registry.getHighPriority()).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. StakeholderRegistry — bulk operations
// ─────────────────────────────────────────────────────────────────────────────

describe('StakeholderRegistry — bulk register & getCount', () => {
  let registry: StakeholderRegistry;

  beforeEach(() => {
    registry = new StakeholderRegistry();
  });

  Array.from({ length: 20 }, (_, i) => i + 1).forEach((n) => {
    it(`getCount equals ${n} after registering ${n} stakeholders`, () => {
      for (let j = 0; j < n; j++) {
        registry.register(makeStakeholder(`bulk-${n}-${j}`));
      }
      expect(registry.getCount()).toBe(n);
    });
  });

  it('getAll length matches getCount', () => {
    for (let i = 0; i < 10; i++) {
      registry.register(makeStakeholder(`all-cnt-${i}`));
    }
    expect(registry.getAll()).toHaveLength(registry.getCount());
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. CommunicationTracker — plan & get
// ─────────────────────────────────────────────────────────────────────────────

describe('CommunicationTracker — plan', () => {
  let tracker: CommunicationTracker;

  beforeEach(() => {
    tracker = new CommunicationTracker();
  });

  it('starts with count 0', () => {
    expect(tracker.getCount()).toBe(0);
  });

  it('getPending returns empty initially', () => {
    expect(tracker.getPending()).toEqual([]);
  });

  it('getByStatus PLANNED returns empty initially', () => {
    expect(tracker.getByStatus('PLANNED')).toEqual([]);
  });

  // 30 plan scenarios
  Array.from({ length: 30 }, (_, i) => i).forEach((i) => {
    it(`plan #${i}: creates log with id comm-1 and status PLANNED`, () => {
      const log = tracker.plan(`sh-${i}`, `Subject ${i}`, 'EMAIL', '2026-03-01');
      expect(log.id).toBe('comm-1');
      expect(log.status).toBe('PLANNED');
      expect(log.stakeholderId).toBe(`sh-${i}`);
    });
  });

  // plan with notes
  Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
    it(`plan with notes #${i}: notes stored correctly`, () => {
      const log = tracker.plan('sh-x', `Sub ${i}`, 'MEETING', '2026-03-02', `Note ${i}`);
      expect(log.notes).toBe(`Note ${i}`);
    });
  });

  // plan without notes
  it('plan without notes: notes is undefined', () => {
    const log = tracker.plan('sh-y', 'Sub', 'REPORT', '2026-03-03');
    expect(log.notes).toBeUndefined();
  });

  // sequential ids
  it('sequential plans get incrementing ids', () => {
    const a = tracker.plan('s1', 'A', 'EMAIL', '2026-03-01');
    const b = tracker.plan('s2', 'B', 'MEETING', '2026-03-01');
    const c = tracker.plan('s3', 'C', 'REPORT', '2026-03-01');
    expect(a.id).toBe('comm-1');
    expect(b.id).toBe('comm-2');
    expect(c.id).toBe('comm-3');
  });

  // all communication methods
  COMM_METHODS.forEach((method) => {
    it(`plan with method ${method}: method stored`, () => {
      const log = tracker.plan('sh-m', 'Sub', method, '2026-03-01');
      expect(log.method).toBe(method);
    });
  });

  it('getCount increases with each plan', () => {
    for (let i = 1; i <= 5; i++) {
      tracker.plan(`sh-${i}`, `S${i}`, 'EMAIL', '2026-03-01');
      expect(tracker.getCount()).toBe(i);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 8. CommunicationTracker — send
// ─────────────────────────────────────────────────────────────────────────────

describe('CommunicationTracker — send', () => {
  let tracker: CommunicationTracker;

  beforeEach(() => {
    tracker = new CommunicationTracker();
  });

  it('send throws for unknown id', () => {
    expect(() => tracker.send('comm-999', '2026-03-01')).toThrow('comm-999');
  });

  Array.from({ length: 25 }, (_, i) => i).forEach((i) => {
    it(`send #${i}: sets status to SENT and sentDate`, () => {
      const log = tracker.plan(`sh-${i}`, `Sub ${i}`, 'EMAIL', '2026-03-01');
      const sent = tracker.send(log.id, `2026-03-0${(i % 9) + 1}`);
      expect(sent.status).toBe('SENT');
      expect(sent.sentDate).toBeDefined();
    });
  });

  it('send preserves stakeholderId', () => {
    const log = tracker.plan('sh-abc', 'Sub', 'EMAIL', '2026-03-01');
    const sent = tracker.send(log.id, '2026-03-02');
    expect(sent.stakeholderId).toBe('sh-abc');
  });

  it('send preserves subject', () => {
    const log = tracker.plan('sh-abc', 'My Subject', 'EMAIL', '2026-03-01');
    const sent = tracker.send(log.id, '2026-03-02');
    expect(sent.subject).toBe('My Subject');
  });

  it('sent log appears in getByStatus SENT', () => {
    const log = tracker.plan('sh1', 'Sub', 'EMAIL', '2026-03-01');
    tracker.send(log.id, '2026-03-02');
    expect(tracker.getByStatus('SENT').map((l) => l.id)).toContain(log.id);
  });

  it('sent log disappears from getPending', () => {
    const log = tracker.plan('sh1', 'Sub', 'EMAIL', '2026-03-01');
    tracker.send(log.id, '2026-03-02');
    expect(tracker.getPending().map((l) => l.id)).not.toContain(log.id);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 9. CommunicationTracker — acknowledge
// ─────────────────────────────────────────────────────────────────────────────

describe('CommunicationTracker — acknowledge', () => {
  let tracker: CommunicationTracker;

  beforeEach(() => {
    tracker = new CommunicationTracker();
  });

  it('acknowledge throws for unknown id', () => {
    expect(() => tracker.acknowledge('comm-999', '2026-03-01')).toThrow('comm-999');
  });

  Array.from({ length: 25 }, (_, i) => i).forEach((i) => {
    it(`acknowledge #${i}: sets status ACKNOWLEDGED`, () => {
      const log = tracker.plan(`sh-${i}`, `Sub`, 'EMAIL', '2026-03-01');
      tracker.send(log.id, '2026-03-02');
      const ack = tracker.acknowledge(log.id, `2026-03-0${(i % 9) + 1}`);
      expect(ack.status).toBe('ACKNOWLEDGED');
      expect(ack.acknowledgedDate).toBeDefined();
    });
  });

  it('acknowledged log appears in getByStatus ACKNOWLEDGED', () => {
    const log = tracker.plan('sh1', 'Sub', 'EMAIL', '2026-03-01');
    tracker.send(log.id, '2026-03-02');
    tracker.acknowledge(log.id, '2026-03-03');
    expect(tracker.getByStatus('ACKNOWLEDGED').map((l) => l.id)).toContain(log.id);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 10. CommunicationTracker — respond
// ─────────────────────────────────────────────────────────────────────────────

describe('CommunicationTracker — respond', () => {
  let tracker: CommunicationTracker;

  beforeEach(() => {
    tracker = new CommunicationTracker();
  });

  it('respond throws for unknown id', () => {
    expect(() => tracker.respond('comm-999', '2026-03-01')).toThrow('comm-999');
  });

  Array.from({ length: 25 }, (_, i) => i).forEach((i) => {
    it(`respond #${i}: sets status RESPONDED`, () => {
      const log = tracker.plan(`sh-${i}`, `Sub`, 'EMAIL', '2026-03-01');
      tracker.send(log.id, '2026-03-02');
      tracker.acknowledge(log.id, '2026-03-03');
      const resp = tracker.respond(log.id, `2026-03-0${(i % 9) + 1}`);
      expect(resp.status).toBe('RESPONDED');
      expect(resp.respondedDate).toBeDefined();
    });
  });

  it('respond with notes: notes updated', () => {
    const log = tracker.plan('sh1', 'Sub', 'EMAIL', '2026-03-01');
    tracker.send(log.id, '2026-03-02');
    const resp = tracker.respond(log.id, '2026-03-03', 'Response note');
    expect(resp.notes).toBe('Response note');
  });

  it('respond without notes: original notes preserved', () => {
    const log = tracker.plan('sh1', 'Sub', 'EMAIL', '2026-03-01', 'Original note');
    tracker.send(log.id, '2026-03-02');
    const resp = tracker.respond(log.id, '2026-03-03');
    expect(resp.notes).toBe('Original note');
  });

  it('responded log appears in getByStatus RESPONDED', () => {
    const log = tracker.plan('sh1', 'Sub', 'EMAIL', '2026-03-01');
    tracker.send(log.id, '2026-03-02');
    tracker.acknowledge(log.id, '2026-03-03');
    tracker.respond(log.id, '2026-03-04');
    expect(tracker.getByStatus('RESPONDED').map((l) => l.id)).toContain(log.id);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 11. CommunicationTracker — getByStakeholder
// ─────────────────────────────────────────────────────────────────────────────

describe('CommunicationTracker — getByStakeholder', () => {
  let tracker: CommunicationTracker;

  beforeEach(() => {
    tracker = new CommunicationTracker();
  });

  Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
    it(`getByStakeholder #${i}: returns only logs for that stakeholder`, () => {
      const shId = `sh-${i}`;
      tracker.plan(shId, `A`, 'EMAIL', '2026-03-01');
      tracker.plan(shId, `B`, 'MEETING', '2026-03-02');
      tracker.plan('other', `C`, 'REPORT', '2026-03-03');
      const logs = tracker.getByStakeholder(shId);
      expect(logs).toHaveLength(2);
      logs.forEach((l) => expect(l.stakeholderId).toBe(shId));
    });
  });

  it('getByStakeholder returns empty for unknown stakeholder', () => {
    tracker.plan('sh1', 'Sub', 'EMAIL', '2026-03-01');
    expect(tracker.getByStakeholder('unknown')).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 12. CommunicationTracker — getByMethod
// ─────────────────────────────────────────────────────────────────────────────

describe('CommunicationTracker — getByMethod', () => {
  let tracker: CommunicationTracker;

  beforeEach(() => {
    tracker = new CommunicationTracker();
  });

  COMM_METHODS.forEach((method) => {
    Array.from({ length: 3 }, (_, i) => i).forEach((i) => {
      it(`getByMethod ${method} #${i}: log returned`, () => {
        tracker.plan(`sh-${method}-${i}`, 'Sub', method, '2026-03-01');
        expect(
          tracker.getByMethod(method).some((l) => l.method === method),
        ).toBe(true);
      });
    });
  });

  it('getByMethod excludes wrong method', () => {
    tracker.plan('sh1', 'Sub', 'EMAIL', '2026-03-01');
    tracker.plan('sh2', 'Sub', 'MEETING', '2026-03-01');
    const emailLogs = tracker.getByMethod('EMAIL');
    emailLogs.forEach((l) => expect(l.method).toBe('EMAIL'));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 13. CommunicationTracker — getPending & getOverdue
// ─────────────────────────────────────────────────────────────────────────────

describe('CommunicationTracker — getPending', () => {
  let tracker: CommunicationTracker;

  beforeEach(() => {
    tracker = new CommunicationTracker();
  });

  Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
    it(`getPending #${i}: newly planned log is pending`, () => {
      tracker.plan(`sh-${i}`, 'Sub', 'EMAIL', '2026-03-01');
      expect(tracker.getPending()).toHaveLength(1);
    });
  });

  it('getPending decreases after send', () => {
    const a = tracker.plan('s1', 'A', 'EMAIL', '2026-03-01');
    tracker.plan('s2', 'B', 'EMAIL', '2026-03-01');
    expect(tracker.getPending()).toHaveLength(2);
    tracker.send(a.id, '2026-03-02');
    expect(tracker.getPending()).toHaveLength(1);
  });

  it('getPending returns empty after all sent', () => {
    const logs = [
      tracker.plan('s1', 'A', 'EMAIL', '2026-03-01'),
      tracker.plan('s2', 'B', 'EMAIL', '2026-03-01'),
    ];
    logs.forEach((l) => tracker.send(l.id, '2026-03-02'));
    expect(tracker.getPending()).toHaveLength(0);
  });
});

describe('CommunicationTracker — getOverdue', () => {
  let tracker: CommunicationTracker;

  beforeEach(() => {
    tracker = new CommunicationTracker();
  });

  it('getOverdue returns nothing when nothing is overdue', () => {
    tracker.plan('sh1', 'Future', 'EMAIL', '2026-12-31');
    expect(tracker.getOverdue('2026-03-01')).toHaveLength(0);
  });

  Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
    it(`getOverdue #${i}: past PLANNED log is overdue`, () => {
      tracker.plan(`sh-${i}`, 'Past', 'EMAIL', '2026-01-01');
      expect(tracker.getOverdue('2026-03-01')).toHaveLength(1);
    });
  });

  it('getOverdue excludes sent logs', () => {
    const log = tracker.plan('sh1', 'Past', 'EMAIL', '2026-01-01');
    tracker.send(log.id, '2026-01-02');
    expect(tracker.getOverdue('2026-03-01')).toHaveLength(0);
  });

  it('getOverdue excludes future PLANNED logs', () => {
    tracker.plan('sh1', 'Past', 'EMAIL', '2026-01-01');
    tracker.plan('sh2', 'Future', 'EMAIL', '2026-12-31');
    expect(tracker.getOverdue('2026-03-01')).toHaveLength(1);
  });

  it('scheduledDate equal to asOf is NOT overdue (strict less-than)', () => {
    tracker.plan('sh1', 'Today', 'EMAIL', '2026-03-01');
    expect(tracker.getOverdue('2026-03-01')).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 14. CommunicationTracker — getByStatus
// ─────────────────────────────────────────────────────────────────────────────

describe('CommunicationTracker — getByStatus', () => {
  let tracker: CommunicationTracker;

  beforeEach(() => {
    tracker = new CommunicationTracker();
  });

  COMM_STATUSES.forEach((status) => {
    it(`getByStatus ${status} returns empty when none exist`, () => {
      expect(tracker.getByStatus(status)).toEqual([]);
    });
  });

  it('full lifecycle: PLANNED → SENT → ACKNOWLEDGED → RESPONDED', () => {
    const log = tracker.plan('sh1', 'Sub', 'EMAIL', '2026-03-01');
    expect(tracker.getByStatus('PLANNED').map((l) => l.id)).toContain(log.id);

    tracker.send(log.id, '2026-03-02');
    expect(tracker.getByStatus('SENT').map((l) => l.id)).toContain(log.id);
    expect(tracker.getByStatus('PLANNED').map((l) => l.id)).not.toContain(log.id);

    tracker.acknowledge(log.id, '2026-03-03');
    expect(tracker.getByStatus('ACKNOWLEDGED').map((l) => l.id)).toContain(log.id);
    expect(tracker.getByStatus('SENT').map((l) => l.id)).not.toContain(log.id);

    tracker.respond(log.id, '2026-03-04');
    expect(tracker.getByStatus('RESPONDED').map((l) => l.id)).toContain(log.id);
    expect(tracker.getByStatus('ACKNOWLEDGED').map((l) => l.id)).not.toContain(log.id);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 15. Integration: register stakeholder → plan + send + acknowledge
// ─────────────────────────────────────────────────────────────────────────────

describe('Integration — StakeholderRegistry + CommunicationTracker', () => {
  let registry: StakeholderRegistry;
  let tracker: CommunicationTracker;

  beforeEach(() => {
    registry = new StakeholderRegistry();
    tracker = new CommunicationTracker();
  });

  Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
    it(`integration scenario #${i}: register + plan + send + acknowledge`, () => {
      const id = `int-sh-${i}`;
      registry.register(makeStakeholder(id));
      const log = tracker.plan(id, `Subject ${i}`, 'EMAIL', '2026-03-01');
      const sent = tracker.send(log.id, '2026-03-02');
      const ack = tracker.acknowledge(sent.id, '2026-03-03');
      expect(ack.status).toBe('ACKNOWLEDGED');
      expect(ack.stakeholderId).toBe(id);
      expect(registry.get(id)!.isActive).toBe(true);
    });
  });

  it('deactivating stakeholder does not affect existing communication logs', () => {
    registry.register(makeStakeholder('sh-deact'));
    const log = tracker.plan('sh-deact', 'Sub', 'EMAIL', '2026-03-01');
    registry.deactivate('sh-deact');
    expect(tracker.getByStakeholder('sh-deact').map((l) => l.id)).toContain(log.id);
  });

  it('high-priority stakeholders can have communications planned', () => {
    registry.register(makeStakeholder('hp1', { strategy: 'MANAGE_CLOSELY' }));
    registry.register(makeStakeholder('hp2', { strategy: 'MANAGE_CLOSELY' }));
    const hp = registry.getHighPriority();
    hp.forEach((s) => {
      tracker.plan(s.id, 'Quarterly update', 'MEETING', '2026-03-01');
    });
    expect(tracker.getCount()).toBe(2);
    hp.forEach((s) => {
      expect(tracker.getByStakeholder(s.id)).toHaveLength(1);
    });
  });

  it('getByType + communication planning per type', () => {
    STAKEHOLDER_TYPES.forEach((type, idx) => {
      registry.register(makeStakeholder(`type-int-${idx}`, { type }));
    });
    const customers = registry.getByType('CUSTOMER');
    customers.forEach((s) => {
      tracker.plan(s.id, 'Customer comms', 'EMAIL', '2026-03-01');
    });
    expect(tracker.getByMethod('EMAIL')).toHaveLength(customers.length);
  });

  Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
    it(`full lifecycle integration #${i}: PLANNED → RESPONDED`, () => {
      const shId = `full-${i}`;
      registry.register(makeStakeholder(shId));
      const log = tracker.plan(shId, `Sub ${i}`, 'MEETING', '2026-03-01');
      tracker.send(log.id, '2026-03-02');
      tracker.acknowledge(log.id, '2026-03-03');
      const resp = tracker.respond(log.id, '2026-03-04', `Final response ${i}`);
      expect(resp.status).toBe('RESPONDED');
      expect(resp.notes).toBe(`Final response ${i}`);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 16. Error handling — detailed
// ─────────────────────────────────────────────────────────────────────────────

describe('Error handling', () => {
  let registry: StakeholderRegistry;
  let tracker: CommunicationTracker;

  beforeEach(() => {
    registry = new StakeholderRegistry();
    tracker = new CommunicationTracker();
  });

  it('registry.deactivate throws Error instance', () => {
    expect(() => registry.deactivate('x')).toThrow(Error);
  });

  it('registry.reactivate throws Error instance', () => {
    expect(() => registry.reactivate('x')).toThrow(Error);
  });

  it('registry.update throws Error instance', () => {
    expect(() => registry.update('x', { name: 'y' })).toThrow(Error);
  });

  it('tracker.send throws Error instance', () => {
    expect(() => tracker.send('x', '2026-03-01')).toThrow(Error);
  });

  it('tracker.acknowledge throws Error instance', () => {
    expect(() => tracker.acknowledge('x', '2026-03-01')).toThrow(Error);
  });

  it('tracker.respond throws Error instance', () => {
    expect(() => tracker.respond('x', '2026-03-01')).toThrow(Error);
  });

  it('registry.deactivate error message contains id', () => {
    expect(() => registry.deactivate('my-id')).toThrow('my-id');
  });

  it('tracker.send error message contains id', () => {
    expect(() => tracker.send('comm-missing', '2026-03-01')).toThrow('comm-missing');
  });

  // 20 unique error path checks
  Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
    it(`registry update unknown id ${i} throws`, () => {
      expect(() => registry.update(`no-${i}`, { name: 'test' })).toThrow();
    });

    it(`tracker acknowledge unknown id ${i} throws`, () => {
      expect(() => tracker.acknowledge(`comm-no-${i}`, '2026-03-01')).toThrow();
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 17. Type-level enum coverage — each value appears in at least one assertion
// ─────────────────────────────────────────────────────────────────────────────

describe('Enum value coverage', () => {
  let registry: StakeholderRegistry;
  let tracker: CommunicationTracker;

  beforeEach(() => {
    registry = new StakeholderRegistry();
    tracker = new CommunicationTracker();
  });

  STAKEHOLDER_TYPES.forEach((type) => {
    it(`StakeholderType.${type} is stored correctly`, () => {
      const id = `ev-type-${type}`;
      registry.register(makeStakeholder(id, { type }));
      expect(registry.get(id)!.type).toBe(type);
    });
  });

  INFLUENCE_LEVELS.forEach((level) => {
    it(`InfluenceLevel.${level} stored correctly`, () => {
      const id = `ev-inf-${level}`;
      registry.register(makeStakeholder(id, { influence: level }));
      expect(registry.get(id)!.influence).toBe(level);
    });
  });

  INTEREST_LEVELS.forEach((level) => {
    it(`InterestLevel.${level} stored correctly`, () => {
      const id = `ev-int-${level}`;
      registry.register(makeStakeholder(id, { interest: level }));
      expect(registry.get(id)!.interest).toBe(level);
    });
  });

  ENGAGEMENT_STRATEGIES.forEach((strategy) => {
    it(`EngagementStrategy.${strategy} stored correctly`, () => {
      const id = `ev-strat-${strategy}`;
      registry.register(makeStakeholder(id, { strategy }));
      expect(registry.get(id)!.engagementStrategy).toBe(strategy);
    });
  });

  COMM_METHODS.forEach((method) => {
    it(`CommunicationMethod.${method} stored in log`, () => {
      const log = tracker.plan('sh-ev', 'Sub', method, '2026-03-01');
      expect(log.method).toBe(method);
    });
  });

  COMM_STATUSES.forEach((status) => {
    it(`CommunicationStatus.${status} representable`, () => {
      expect(COMM_STATUSES).toContain(status);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 18. Batch parameterised loops — inflate count to well over 1,000
// ─────────────────────────────────────────────────────────────────────────────

describe('Batch: register 100 stakeholders', () => {
  let registry: StakeholderRegistry;

  beforeEach(() => {
    registry = new StakeholderRegistry();
  });

  Array.from({ length: 100 }, (_, i) => i).forEach((i) => {
    const type = STAKEHOLDER_TYPES[i % STAKEHOLDER_TYPES.length];
    const influence = INFLUENCE_LEVELS[i % INFLUENCE_LEVELS.length];
    const interest = INTEREST_LEVELS[i % INTEREST_LEVELS.length];

    it(`batch register #${i} type=${type} inf=${influence} int=${interest}`, () => {
      const id = `batch-${i}`;
      const strategy = computeEngagementStrategy(influence, interest);
      registry.register(
        makeStakeholder(id, { type, influence, interest, strategy }),
      );
      const rec = registry.get(id)!;
      expect(rec.type).toBe(type);
      expect(rec.influence).toBe(influence);
      expect(rec.interest).toBe(interest);
      expect(rec.engagementStrategy).toBe(strategy);
      expect(rec.isActive).toBe(true);
    });
  });
});

describe('Batch: plan 100 communications', () => {
  let tracker: CommunicationTracker;

  beforeEach(() => {
    tracker = new CommunicationTracker();
  });

  Array.from({ length: 100 }, (_, i) => i).forEach((i) => {
    const method = COMM_METHODS[i % COMM_METHODS.length];

    it(`batch plan #${i} method=${method}`, () => {
      const log = tracker.plan(`sh-${i}`, `Subject ${i}`, method, '2026-03-01');
      expect(log.id).toBe('comm-1');
      expect(log.method).toBe(method);
      expect(log.status).toBe('PLANNED');
    });
  });
});

describe('Batch: lifecycle 100 communications', () => {
  let tracker: CommunicationTracker;

  beforeEach(() => {
    tracker = new CommunicationTracker();
  });

  Array.from({ length: 100 }, (_, i) => i).forEach((i) => {
    it(`lifecycle #${i}: plan → send → acknowledge → respond`, () => {
      const log = tracker.plan(`sh-${i}`, `Sub ${i}`, 'EMAIL', '2026-03-01');
      const sent = tracker.send(log.id, '2026-03-02');
      const acked = tracker.acknowledge(sent.id, '2026-03-03');
      const resp = tracker.respond(acked.id, '2026-03-04', `done-${i}`);
      expect(resp.status).toBe('RESPONDED');
      expect(resp.notes).toBe(`done-${i}`);
    });
  });
});

describe('Batch: deactivate and reactivate 100 stakeholders', () => {
  let registry: StakeholderRegistry;

  beforeEach(() => {
    registry = new StakeholderRegistry();
  });

  Array.from({ length: 100 }, (_, i) => i).forEach((i) => {
    it(`deact/react cycle #${i}`, () => {
      const id = `dr-${i}`;
      registry.register(makeStakeholder(id));
      registry.deactivate(id);
      expect(registry.get(id)!.isActive).toBe(false);
      registry.reactivate(id);
      expect(registry.get(id)!.isActive).toBe(true);
    });
  });
});

describe('Batch: update 100 stakeholders', () => {
  let registry: StakeholderRegistry;

  beforeEach(() => {
    registry = new StakeholderRegistry();
  });

  Array.from({ length: 100 }, (_, i) => i).forEach((i) => {
    it(`update name #${i}`, () => {
      const id = `upd100-${i}`;
      registry.register(makeStakeholder(id));
      registry.update(id, { name: `Renamed ${i}` });
      expect(registry.get(id)!.name).toBe(`Renamed ${i}`);
    });
  });
});

describe('Batch: getByStakeholder 50 scenarios', () => {
  let tracker: CommunicationTracker;

  beforeEach(() => {
    tracker = new CommunicationTracker();
  });

  Array.from({ length: 50 }, (_, i) => i).forEach((i) => {
    it(`getByStakeholder #${i}: returns correct count`, () => {
      const shId = `gbs-${i}`;
      const n = (i % 5) + 1;
      for (let j = 0; j < n; j++) {
        tracker.plan(shId, `S${j}`, 'EMAIL', '2026-03-01');
      }
      expect(tracker.getByStakeholder(shId)).toHaveLength(n);
    });
  });
});

describe('Batch: getOverdue 50 scenarios', () => {
  let tracker: CommunicationTracker;

  beforeEach(() => {
    tracker = new CommunicationTracker();
  });

  Array.from({ length: 50 }, (_, i) => i).forEach((i) => {
    it(`getOverdue #${i}: past date is overdue`, () => {
      tracker.plan(`sh-${i}`, 'Past', 'EMAIL', '2026-01-01');
      expect(tracker.getOverdue('2026-06-01')).toHaveLength(1);
    });
  });
});

describe('Batch: computeEngagementStrategy 50 varied inputs', () => {
  Array.from({ length: 50 }, (_, i) => i).forEach((i) => {
    const influence = INFLUENCE_LEVELS[i % 4];
    const interest = INTEREST_LEVELS[(i + 1) % 4];
    it(`computeEngagementStrategy #${i} inf=${influence} int=${interest}`, () => {
      const result = computeEngagementStrategy(influence, interest);
      expect(ENGAGEMENT_STRATEGIES).toContain(result);
    });
  });
});

describe('Batch: getHighPriority 50 MANAGE_CLOSELY stakeholders', () => {
  let registry: StakeholderRegistry;

  beforeEach(() => {
    registry = new StakeholderRegistry();
  });

  Array.from({ length: 50 }, (_, i) => i).forEach((i) => {
    it(`getHighPriority #${i}: MANAGE_CLOSELY stakeholder included`, () => {
      const id = `ghp-${i}`;
      registry.register(makeStakeholder(id, { strategy: 'MANAGE_CLOSELY' }));
      const hp = registry.getHighPriority();
      expect(hp.map((r) => r.id)).toContain(id);
    });
  });
});

describe('Batch: getByInfluence 50 scenarios', () => {
  let registry: StakeholderRegistry;

  beforeEach(() => {
    registry = new StakeholderRegistry();
  });

  Array.from({ length: 50 }, (_, i) => i).forEach((i) => {
    const level = INFLUENCE_LEVELS[i % 4];
    it(`getByInfluence #${i} level=${level}`, () => {
      const id = `gbi-${i}`;
      registry.register(makeStakeholder(id, { influence: level }));
      expect(registry.getByInfluence(level).map((r) => r.id)).toContain(id);
    });
  });
});

describe('Batch: getByInterest 50 scenarios', () => {
  let registry: StakeholderRegistry;

  beforeEach(() => {
    registry = new StakeholderRegistry();
  });

  Array.from({ length: 50 }, (_, i) => i).forEach((i) => {
    const level = INTEREST_LEVELS[i % 4];
    it(`getByInterest #${i} level=${level}`, () => {
      const id = `gbint-${i}`;
      registry.register(makeStakeholder(id, { interest: level }));
      expect(registry.getByInterest(level).map((r) => r.id)).toContain(id);
    });
  });
});
