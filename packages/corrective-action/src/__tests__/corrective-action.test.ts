import { CAPAManager } from '../capa-manager';
import { ActionTracker } from '../action-tracker';
import {
  CAPAType,
  CAPAStatus,
  CAPAPriority,
  RootCauseCategory,
  VerificationResult,
  ActionStatus,
} from '../types';

// ─── helpers ─────────────────────────────────────────────────────────────────

const TYPES: CAPAType[] = ['CORRECTIVE', 'PREVENTIVE', 'IMPROVEMENT'];
const STATUSES: CAPAStatus[] = ['OPEN', 'UNDER_INVESTIGATION', 'ACTION_IN_PROGRESS', 'VERIFICATION', 'CLOSED', 'CANCELLED'];
const PRIORITIES: CAPAPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const RC_CATEGORIES: RootCauseCategory[] = ['HUMAN_ERROR', 'PROCESS', 'EQUIPMENT', 'MATERIAL', 'ENVIRONMENT', 'MANAGEMENT', 'UNKNOWN'];
const VERIFICATION_RESULTS: VerificationResult[] = ['EFFECTIVE', 'PARTIALLY_EFFECTIVE', 'NOT_EFFECTIVE'];
const ACTION_STATUSES: ActionStatus[] = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE'];

function makeManager() {
  return new CAPAManager();
}

function makeTracker() {
  return new ActionTracker();
}

function raiseBasic(mgr: CAPAManager, suffix: string | number = '1') {
  return mgr.raise(
    `capa-${suffix}`,
    `Title ${suffix}`,
    'CORRECTIVE',
    'HIGH',
    `Description ${suffix}`,
    'Audit',
    'user@example.com',
    '2026-01-01',
  );
}

function fullLifecycle(mgr: CAPAManager, id: string, verResult: VerificationResult = 'EFFECTIVE') {
  mgr.raise(id, `Title ${id}`, 'CORRECTIVE', 'HIGH', 'Desc', 'Audit', 'user@example.com', '2026-01-01');
  mgr.investigate(id, 'investigator@example.com');
  mgr.startAction(id, '2026-03-01');
  mgr.submitForVerification(id, 'Root cause text', 'PROCESS');
  mgr.close(id, 'closer@example.com', '2026-04-01', verResult);
}

// ═════════════════════════════════════════════════════════════════════════════
// CAPAManager — raise
// ═════════════════════════════════════════════════════════════════════════════

describe('CAPAManager.raise', () => {
  let mgr: CAPAManager;
  beforeEach(() => { mgr = makeManager(); });

  it('returns a record with status OPEN', () => {
    const r = raiseBasic(mgr);
    expect(r.status).toBe('OPEN');
  });

  it('stores the correct id', () => {
    const r = raiseBasic(mgr, 'x1');
    expect(r.id).toBe('capa-x1');
  });

  it('stores the correct title', () => {
    const r = raiseBasic(mgr, 42);
    expect(r.title).toBe('Title 42');
  });

  it('increments count after each raise', () => {
    raiseBasic(mgr, 'a');
    raiseBasic(mgr, 'b');
    expect(mgr.getCount()).toBe(2);
  });

  it('returns undefined for get on missing id before raise', () => {
    expect(mgr.get('nonexistent')).toBeUndefined();
  });

  it('get returns the record after raise', () => {
    raiseBasic(mgr, 'g1');
    expect(mgr.get('capa-g1')).toBeDefined();
  });

  // Parameterized: raise 200 records with different types
  Array.from({ length: 200 }, (_, i) => i).forEach(i => {
    it(`raise #${i} — type correctly stored (${TYPES[i % TYPES.length]})`, () => {
      const type = TYPES[i % TYPES.length];
      mgr.raise(`id-t${i}`, `T${i}`, type, 'LOW', 'D', 'S', 'u', '2026-01-01');
      expect(mgr.get(`id-t${i}`)?.type).toBe(type);
    });
  });

  // Parameterized: raise 200 records with different priorities
  Array.from({ length: 200 }, (_, i) => i).forEach(i => {
    it(`raise #${i} — priority correctly stored (${PRIORITIES[i % PRIORITIES.length]})`, () => {
      const priority = PRIORITIES[i % PRIORITIES.length];
      mgr.raise(`id-p${i}`, `T${i}`, 'CORRECTIVE', priority, 'D', 'S', 'u', '2026-01-01');
      expect(mgr.get(`id-p${i}`)?.priority).toBe(priority);
    });
  });

  // Various sources
  Array.from({ length: 50 }, (_, i) => i).forEach(i => {
    it(`raise #${i} — source stored correctly`, () => {
      const source = `source-${i}`;
      mgr.raise(`id-src${i}`, 'T', 'CORRECTIVE', 'LOW', 'D', source, 'u', '2026-01-01');
      expect(mgr.get(`id-src${i}`)?.source).toBe(source);
    });
  });

  // raisedBy
  Array.from({ length: 50 }, (_, i) => i).forEach(i => {
    it(`raise #${i} — raisedBy stored correctly`, () => {
      mgr.raise(`id-rb${i}`, 'T', 'CORRECTIVE', 'LOW', 'D', 'S', `user${i}@x.com`, '2026-01-01');
      expect(mgr.get(`id-rb${i}`)?.raisedBy).toBe(`user${i}@x.com`);
    });
  });

  // raisedAt
  Array.from({ length: 50 }, (_, i) => i).forEach(i => {
    it(`raise #${i} — raisedAt stored`, () => {
      const ts = `2026-0${(i % 9) + 1}-01`;
      mgr.raise(`id-ra${i}`, 'T', 'CORRECTIVE', 'LOW', 'D', 'S', 'u', ts);
      expect(mgr.get(`id-ra${i}`)?.raisedAt).toBe(ts);
    });
  });

  it('raise does not set assignedTo by default', () => {
    const r = raiseBasic(mgr);
    expect(r.assignedTo).toBeUndefined();
  });

  it('raise does not set targetDate by default', () => {
    const r = raiseBasic(mgr);
    expect(r.targetDate).toBeUndefined();
  });

  it('raise does not set rootCause by default', () => {
    const r = raiseBasic(mgr);
    expect(r.rootCause).toBeUndefined();
  });

  it('raise does not set closedAt by default', () => {
    const r = raiseBasic(mgr);
    expect(r.closedAt).toBeUndefined();
  });

  it('raise does not set verificationResult by default', () => {
    const r = raiseBasic(mgr);
    expect(r.verificationResult).toBeUndefined();
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// CAPAManager.investigate
// ═════════════════════════════════════════════════════════════════════════════

describe('CAPAManager.investigate', () => {
  let mgr: CAPAManager;
  beforeEach(() => { mgr = makeManager(); });

  it('transitions status to UNDER_INVESTIGATION', () => {
    raiseBasic(mgr, 'i1');
    const r = mgr.investigate('capa-i1', 'inv@x.com');
    expect(r.status).toBe('UNDER_INVESTIGATION');
  });

  it('sets assignedTo on investigate', () => {
    raiseBasic(mgr, 'i2');
    const r = mgr.investigate('capa-i2', 'bob@x.com');
    expect(r.assignedTo).toBe('bob@x.com');
  });

  it('throws on unknown id', () => {
    expect(() => mgr.investigate('bad-id', 'x')).toThrow();
  });

  // Parameterized: 100 records investigated with different assignees
  Array.from({ length: 100 }, (_, i) => i).forEach(i => {
    it(`investigate #${i} — assignedTo stored`, () => {
      mgr.raise(`inv-${i}`, 'T', 'CORRECTIVE', 'LOW', 'D', 'S', 'u', '2026-01-01');
      const r = mgr.investigate(`inv-${i}`, `assignee${i}@x.com`);
      expect(r.assignedTo).toBe(`assignee${i}@x.com`);
    });
  });

  it('get reflects status after investigate', () => {
    raiseBasic(mgr, 'ig1');
    mgr.investigate('capa-ig1', 'a@x.com');
    expect(mgr.get('capa-ig1')?.status).toBe('UNDER_INVESTIGATION');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// CAPAManager.startAction
// ═════════════════════════════════════════════════════════════════════════════

describe('CAPAManager.startAction', () => {
  let mgr: CAPAManager;
  beforeEach(() => { mgr = makeManager(); });

  it('transitions status to ACTION_IN_PROGRESS', () => {
    raiseBasic(mgr, 'sa1');
    mgr.investigate('capa-sa1', 'inv@x.com');
    const r = mgr.startAction('capa-sa1', '2026-06-01');
    expect(r.status).toBe('ACTION_IN_PROGRESS');
  });

  it('sets targetDate', () => {
    raiseBasic(mgr, 'sa2');
    const r = mgr.startAction('capa-sa2', '2026-07-15');
    expect(r.targetDate).toBe('2026-07-15');
  });

  it('throws on unknown id', () => {
    expect(() => mgr.startAction('no-id', '2026-01-01')).toThrow();
  });

  // Parameterized: 100 records with various target dates
  Array.from({ length: 100 }, (_, i) => i).forEach(i => {
    it(`startAction #${i} — targetDate stored`, () => {
      mgr.raise(`sa-${i}`, 'T', 'CORRECTIVE', 'LOW', 'D', 'S', 'u', '2026-01-01');
      const td = `2026-${String((i % 11) + 1).padStart(2, '0')}-01`;
      const r = mgr.startAction(`sa-${i}`, td);
      expect(r.targetDate).toBe(td);
    });
  });

  it('get reflects status after startAction', () => {
    raiseBasic(mgr, 'sag1');
    mgr.startAction('capa-sag1', '2026-05-01');
    expect(mgr.get('capa-sag1')?.status).toBe('ACTION_IN_PROGRESS');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// CAPAManager.submitForVerification
// ═════════════════════════════════════════════════════════════════════════════

describe('CAPAManager.submitForVerification', () => {
  let mgr: CAPAManager;
  beforeEach(() => { mgr = makeManager(); });

  it('transitions status to VERIFICATION', () => {
    raiseBasic(mgr, 'sv1');
    const r = mgr.submitForVerification('capa-sv1', 'RC text', 'HUMAN_ERROR');
    expect(r.status).toBe('VERIFICATION');
  });

  it('sets rootCause', () => {
    raiseBasic(mgr, 'sv2');
    const r = mgr.submitForVerification('capa-sv2', 'Operator fatigue', 'HUMAN_ERROR');
    expect(r.rootCause).toBe('Operator fatigue');
  });

  it('throws on unknown id', () => {
    expect(() => mgr.submitForVerification('nope', 'rc', 'PROCESS')).toThrow();
  });

  // Parameterized: all root cause categories
  RC_CATEGORIES.forEach(cat => {
    it(`submitForVerification with category ${cat}`, () => {
      mgr.raise(`rc-${cat}`, 'T', 'CORRECTIVE', 'LOW', 'D', 'S', 'u', '2026-01-01');
      const r = mgr.submitForVerification(`rc-${cat}`, 'text', cat);
      expect(r.rootCauseCategory).toBe(cat);
    });
  });

  // Parameterized: 100 records, various categories and root cause texts
  Array.from({ length: 100 }, (_, i) => i).forEach(i => {
    it(`submitForVerification #${i} — fields stored correctly`, () => {
      const cat = RC_CATEGORIES[i % RC_CATEGORIES.length];
      mgr.raise(`sfv-${i}`, 'T', 'CORRECTIVE', 'LOW', 'D', 'S', 'u', '2026-01-01');
      const r = mgr.submitForVerification(`sfv-${i}`, `root cause ${i}`, cat);
      expect(r.rootCause).toBe(`root cause ${i}`);
      expect(r.rootCauseCategory).toBe(cat);
      expect(r.status).toBe('VERIFICATION');
    });
  });

  it('get reflects status after submitForVerification', () => {
    raiseBasic(mgr, 'svg1');
    mgr.submitForVerification('capa-svg1', 'rc', 'PROCESS');
    expect(mgr.get('capa-svg1')?.status).toBe('VERIFICATION');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// CAPAManager.close
// ═════════════════════════════════════════════════════════════════════════════

describe('CAPAManager.close', () => {
  let mgr: CAPAManager;
  beforeEach(() => { mgr = makeManager(); });

  it('transitions status to CLOSED', () => {
    raiseBasic(mgr, 'cl1');
    const r = mgr.close('capa-cl1', 'closer@x.com', '2026-04-01', 'EFFECTIVE');
    expect(r.status).toBe('CLOSED');
  });

  it('sets closedBy', () => {
    raiseBasic(mgr, 'cl2');
    const r = mgr.close('capa-cl2', 'mgr@x.com', '2026-04-01', 'EFFECTIVE');
    expect(r.closedBy).toBe('mgr@x.com');
  });

  it('sets closedAt', () => {
    raiseBasic(mgr, 'cl3');
    const r = mgr.close('capa-cl3', 'x', '2026-05-15', 'EFFECTIVE');
    expect(r.closedAt).toBe('2026-05-15');
  });

  it('throws on unknown id', () => {
    expect(() => mgr.close('bad', 'x', '2026-01-01', 'EFFECTIVE')).toThrow();
  });

  // Parameterized: all verification results
  VERIFICATION_RESULTS.forEach(vr => {
    it(`close with verificationResult=${vr}`, () => {
      mgr.raise(`cl-vr-${vr}`, 'T', 'CORRECTIVE', 'LOW', 'D', 'S', 'u', '2026-01-01');
      const r = mgr.close(`cl-vr-${vr}`, 'x', '2026-06-01', vr);
      expect(r.verificationResult).toBe(vr);
    });
  });

  // Parameterized: 100 closures
  Array.from({ length: 100 }, (_, i) => i).forEach(i => {
    it(`close #${i} — all fields set`, () => {
      const vr = VERIFICATION_RESULTS[i % VERIFICATION_RESULTS.length];
      mgr.raise(`cl-loop-${i}`, 'T', 'CORRECTIVE', 'LOW', 'D', 'S', 'u', '2026-01-01');
      const r = mgr.close(`cl-loop-${i}`, `closer${i}@x.com`, '2026-06-01', vr);
      expect(r.status).toBe('CLOSED');
      expect(r.verificationResult).toBe(vr);
      expect(r.closedBy).toBe(`closer${i}@x.com`);
    });
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// CAPAManager.cancel
// ═════════════════════════════════════════════════════════════════════════════

describe('CAPAManager.cancel', () => {
  let mgr: CAPAManager;
  beforeEach(() => { mgr = makeManager(); });

  it('transitions status to CANCELLED', () => {
    raiseBasic(mgr, 'ca1');
    const r = mgr.cancel('capa-ca1');
    expect(r.status).toBe('CANCELLED');
  });

  it('throws on unknown id', () => {
    expect(() => mgr.cancel('bad')).toThrow();
  });

  // Parameterized: 80 cancellations
  Array.from({ length: 80 }, (_, i) => i).forEach(i => {
    it(`cancel #${i} — status is CANCELLED`, () => {
      mgr.raise(`can-${i}`, 'T', 'CORRECTIVE', 'LOW', 'D', 'S', 'u', '2026-01-01');
      const r = mgr.cancel(`can-${i}`);
      expect(r.status).toBe('CANCELLED');
    });
  });

  it('get reflects CANCELLED after cancel', () => {
    raiseBasic(mgr, 'cag1');
    mgr.cancel('capa-cag1');
    expect(mgr.get('capa-cag1')?.status).toBe('CANCELLED');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// CAPAManager.getAll / getCount
// ═════════════════════════════════════════════════════════════════════════════

describe('CAPAManager.getAll / getCount', () => {
  let mgr: CAPAManager;
  beforeEach(() => { mgr = makeManager(); });

  it('getAll returns empty array initially', () => {
    expect(mgr.getAll()).toEqual([]);
  });

  it('getCount returns 0 initially', () => {
    expect(mgr.getCount()).toBe(0);
  });

  it('getAll returns all raised records', () => {
    raiseBasic(mgr, 'a');
    raiseBasic(mgr, 'b');
    raiseBasic(mgr, 'c');
    expect(mgr.getAll()).toHaveLength(3);
  });

  // Parameterized: raise N records, verify getAll length and getCount
  Array.from({ length: 50 }, (_, i) => i + 1).forEach(n => {
    it(`after raising ${n} records, getCount=${n} and getAll.length=${n}`, () => {
      for (let j = 0; j < n; j++) {
        mgr.raise(`ga-${n}-${j}`, 'T', 'CORRECTIVE', 'LOW', 'D', 'S', 'u', '2026-01-01');
      }
      expect(mgr.getCount()).toBe(n);
      expect(mgr.getAll()).toHaveLength(n);
    });
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// CAPAManager.getByStatus
// ═════════════════════════════════════════════════════════════════════════════

describe('CAPAManager.getByStatus', () => {
  let mgr: CAPAManager;
  beforeEach(() => { mgr = makeManager(); });

  it('getByStatus OPEN returns only OPEN records', () => {
    raiseBasic(mgr, 's1');
    raiseBasic(mgr, 's2');
    mgr.cancel('capa-s2');
    expect(mgr.getByStatus('OPEN')).toHaveLength(1);
  });

  it('getByStatus CANCELLED after cancel', () => {
    raiseBasic(mgr, 's3');
    mgr.cancel('capa-s3');
    expect(mgr.getByStatus('CANCELLED')).toHaveLength(1);
  });

  it('getByStatus CLOSED after full lifecycle', () => {
    fullLifecycle(mgr, 'lc1');
    expect(mgr.getByStatus('CLOSED')).toHaveLength(1);
  });

  // Parameterized: each status
  STATUSES.forEach(status => {
    it(`getByStatus('${status}') returns correct records`, () => {
      // raise 3, transition to status
      for (let i = 0; i < 3; i++) {
        const id = `stat-${status}-${i}`;
        mgr.raise(id, 'T', 'CORRECTIVE', 'LOW', 'D', 'S', 'u', '2026-01-01');
        if (status === 'UNDER_INVESTIGATION') mgr.investigate(id, 'a@x.com');
        else if (status === 'ACTION_IN_PROGRESS') mgr.startAction(id, '2026-06-01');
        else if (status === 'VERIFICATION') mgr.submitForVerification(id, 'rc', 'PROCESS');
        else if (status === 'CLOSED') { mgr.submitForVerification(id, 'rc', 'PROCESS'); mgr.close(id, 'x', '2026-01-01', 'EFFECTIVE'); }
        else if (status === 'CANCELLED') mgr.cancel(id);
      }
      const results = mgr.getByStatus(status);
      expect(results.every(r => r.status === status)).toBe(true);
    });
  });

  it('getByStatus returns empty for status with no records', () => {
    raiseBasic(mgr, 'open1');
    expect(mgr.getByStatus('CLOSED')).toHaveLength(0);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// CAPAManager.getByType
// ═════════════════════════════════════════════════════════════════════════════

describe('CAPAManager.getByType', () => {
  let mgr: CAPAManager;
  beforeEach(() => { mgr = makeManager(); });

  TYPES.forEach(type => {
    it(`getByType('${type}') returns correct records`, () => {
      for (let i = 0; i < 5; i++) {
        mgr.raise(`bt-${type}-${i}`, 'T', type, 'LOW', 'D', 'S', 'u', '2026-01-01');
      }
      // Also add some of other types
      const otherType = TYPES.find(t => t !== type) ?? TYPES[0];
      mgr.raise(`bt-other-0`, 'T', otherType, 'LOW', 'D', 'S', 'u', '2026-01-01');
      const results = mgr.getByType(type);
      expect(results).toHaveLength(5);
      expect(results.every(r => r.type === type)).toBe(true);
    });
  });

  // Parameterized: 60 records with rotating types, verify counts
  Array.from({ length: 60 }, (_, i) => i).forEach(i => {
    it(`getByType loop #${i} — type=${TYPES[i % TYPES.length]}`, () => {
      const type = TYPES[i % TYPES.length];
      mgr.raise(`gbt-${i}`, 'T', type, 'LOW', 'D', 'S', 'u', '2026-01-01');
      const found = mgr.getByType(type);
      expect(found.some(r => r.id === `gbt-${i}`)).toBe(true);
    });
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// CAPAManager.getByPriority
// ═════════════════════════════════════════════════════════════════════════════

describe('CAPAManager.getByPriority', () => {
  let mgr: CAPAManager;
  beforeEach(() => { mgr = makeManager(); });

  PRIORITIES.forEach(priority => {
    it(`getByPriority('${priority}') returns correct records`, () => {
      for (let i = 0; i < 4; i++) {
        mgr.raise(`gbp-${priority}-${i}`, 'T', 'CORRECTIVE', priority, 'D', 'S', 'u', '2026-01-01');
      }
      const results = mgr.getByPriority(priority);
      expect(results).toHaveLength(4);
      expect(results.every(r => r.priority === priority)).toBe(true);
    });
  });

  // Parameterized: 80 records
  Array.from({ length: 80 }, (_, i) => i).forEach(i => {
    it(`getByPriority loop #${i} — priority=${PRIORITIES[i % PRIORITIES.length]}`, () => {
      const priority = PRIORITIES[i % PRIORITIES.length];
      mgr.raise(`gbpr-${i}`, 'T', 'CORRECTIVE', priority, 'D', 'S', 'u', '2026-01-01');
      const found = mgr.getByPriority(priority);
      expect(found.some(r => r.id === `gbpr-${i}`)).toBe(true);
    });
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// CAPAManager.getByAssignee
// ═════════════════════════════════════════════════════════════════════════════

describe('CAPAManager.getByAssignee', () => {
  let mgr: CAPAManager;
  beforeEach(() => { mgr = makeManager(); });

  it('returns only records assigned to given user', () => {
    raiseBasic(mgr, 'as1');
    raiseBasic(mgr, 'as2');
    mgr.investigate('capa-as1', 'alice@x.com');
    mgr.investigate('capa-as2', 'bob@x.com');
    const aliceRecords = mgr.getByAssignee('alice@x.com');
    expect(aliceRecords).toHaveLength(1);
    expect(aliceRecords[0].assignedTo).toBe('alice@x.com');
  });

  it('returns empty if no records assigned to user', () => {
    raiseBasic(mgr, 'as3');
    expect(mgr.getByAssignee('nobody@x.com')).toHaveLength(0);
  });

  // Parameterized: 80 records assigned to alternating users
  Array.from({ length: 80 }, (_, i) => i).forEach(i => {
    it(`getByAssignee loop #${i} — finds record`, () => {
      const assignee = `user${i % 5}@x.com`;
      mgr.raise(`gba-${i}`, 'T', 'CORRECTIVE', 'LOW', 'D', 'S', 'u', '2026-01-01');
      mgr.investigate(`gba-${i}`, assignee);
      const found = mgr.getByAssignee(assignee);
      expect(found.some(r => r.id === `gba-${i}`)).toBe(true);
    });
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// CAPAManager.getOverdue
// ═════════════════════════════════════════════════════════════════════════════

describe('CAPAManager.getOverdue', () => {
  let mgr: CAPAManager;
  beforeEach(() => { mgr = makeManager(); });

  it('returns records with targetDate before asOf and not closed/cancelled', () => {
    raiseBasic(mgr, 'od1');
    mgr.startAction('capa-od1', '2025-12-01');
    const overdue = mgr.getOverdue('2026-01-01');
    expect(overdue).toHaveLength(1);
  });

  it('does not return closed records even if targetDate < asOf', () => {
    raiseBasic(mgr, 'od2');
    mgr.startAction('capa-od2', '2025-12-01');
    mgr.close('capa-od2', 'x', '2026-01-01', 'EFFECTIVE');
    expect(mgr.getOverdue('2026-06-01')).toHaveLength(0);
  });

  it('does not return cancelled records', () => {
    raiseBasic(mgr, 'od3');
    mgr.startAction('capa-od3', '2025-12-01');
    mgr.cancel('capa-od3');
    expect(mgr.getOverdue('2026-06-01')).toHaveLength(0);
  });

  it('does not return records with no targetDate', () => {
    raiseBasic(mgr, 'od4');
    expect(mgr.getOverdue('2026-06-01')).toHaveLength(0);
  });

  it('does not return records where targetDate >= asOf', () => {
    raiseBasic(mgr, 'od5');
    mgr.startAction('capa-od5', '2026-12-01');
    expect(mgr.getOverdue('2026-01-01')).toHaveLength(0);
  });

  // Parameterized: 80 overdue checks
  Array.from({ length: 80 }, (_, i) => i).forEach(i => {
    it(`getOverdue loop #${i} — overdue record found`, () => {
      mgr.raise(`od-loop-${i}`, 'T', 'CORRECTIVE', 'LOW', 'D', 'S', 'u', '2026-01-01');
      mgr.startAction(`od-loop-${i}`, '2025-06-01');
      const od = mgr.getOverdue('2026-01-01');
      expect(od.some(r => r.id === `od-loop-${i}`)).toBe(true);
    });
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// CAPAManager.getCritical
// ═════════════════════════════════════════════════════════════════════════════

describe('CAPAManager.getCritical', () => {
  let mgr: CAPAManager;
  beforeEach(() => { mgr = makeManager(); });

  it('returns only CRITICAL priority records', () => {
    mgr.raise('c1', 'T', 'CORRECTIVE', 'CRITICAL', 'D', 'S', 'u', '2026-01-01');
    mgr.raise('c2', 'T', 'CORRECTIVE', 'HIGH', 'D', 'S', 'u', '2026-01-01');
    mgr.raise('c3', 'T', 'CORRECTIVE', 'CRITICAL', 'D', 'S', 'u', '2026-01-01');
    const critical = mgr.getCritical();
    expect(critical).toHaveLength(2);
    expect(critical.every(r => r.priority === 'CRITICAL')).toBe(true);
  });

  it('returns empty if no CRITICAL records', () => {
    mgr.raise('nc1', 'T', 'CORRECTIVE', 'HIGH', 'D', 'S', 'u', '2026-01-01');
    expect(mgr.getCritical()).toHaveLength(0);
  });

  // Parameterized: 60 critical records
  Array.from({ length: 60 }, (_, i) => i).forEach(i => {
    it(`getCritical loop #${i} — found in critical list`, () => {
      mgr.raise(`crit-${i}`, 'T', 'CORRECTIVE', 'CRITICAL', 'D', 'S', 'u', '2026-01-01');
      const found = mgr.getCritical();
      expect(found.some(r => r.id === `crit-${i}`)).toBe(true);
    });
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// CAPAManager.getEffectiveness
// ═════════════════════════════════════════════════════════════════════════════

describe('CAPAManager.getEffectiveness', () => {
  let mgr: CAPAManager;
  beforeEach(() => { mgr = makeManager(); });

  it('returns zeros when no closed records', () => {
    expect(mgr.getEffectiveness()).toEqual({ effective: 0, partiallyEffective: 0, notEffective: 0, total: 0 });
  });

  it('counts EFFECTIVE correctly', () => {
    fullLifecycle(mgr, 'eff1', 'EFFECTIVE');
    fullLifecycle(mgr, 'eff2', 'EFFECTIVE');
    const eff = mgr.getEffectiveness();
    expect(eff.effective).toBe(2);
    expect(eff.total).toBe(2);
  });

  it('counts PARTIALLY_EFFECTIVE correctly', () => {
    fullLifecycle(mgr, 'pe1', 'PARTIALLY_EFFECTIVE');
    const eff = mgr.getEffectiveness();
    expect(eff.partiallyEffective).toBe(1);
    expect(eff.total).toBe(1);
  });

  it('counts NOT_EFFECTIVE correctly', () => {
    fullLifecycle(mgr, 'ne1', 'NOT_EFFECTIVE');
    const eff = mgr.getEffectiveness();
    expect(eff.notEffective).toBe(1);
    expect(eff.total).toBe(1);
  });

  it('counts mix of all three', () => {
    fullLifecycle(mgr, 'm1', 'EFFECTIVE');
    fullLifecycle(mgr, 'm2', 'PARTIALLY_EFFECTIVE');
    fullLifecycle(mgr, 'm3', 'NOT_EFFECTIVE');
    const eff = mgr.getEffectiveness();
    expect(eff.effective).toBe(1);
    expect(eff.partiallyEffective).toBe(1);
    expect(eff.notEffective).toBe(1);
    expect(eff.total).toBe(3);
  });

  it('does not count open records in effectiveness', () => {
    raiseBasic(mgr, 'open-eff');
    fullLifecycle(mgr, 'eff-closed', 'EFFECTIVE');
    const eff = mgr.getEffectiveness();
    expect(eff.total).toBe(1);
  });

  // Parameterized: 60 effectiveness computations
  Array.from({ length: 60 }, (_, i) => i).forEach(i => {
    it(`getEffectiveness loop #${i} — total increments`, () => {
      const vr = VERIFICATION_RESULTS[i % VERIFICATION_RESULTS.length];
      fullLifecycle(mgr, `eff-loop-${i}`, vr);
      const eff = mgr.getEffectiveness();
      expect(eff.total).toBeGreaterThanOrEqual(1);
    });
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// CAPAManager — error paths
// ═════════════════════════════════════════════════════════════════════════════

describe('CAPAManager — error paths', () => {
  let mgr: CAPAManager;
  beforeEach(() => { mgr = makeManager(); });

  it('get returns undefined for missing id', () => {
    expect(mgr.get('no-such-id')).toBeUndefined();
  });

  it('investigate throws for missing id', () => {
    expect(() => mgr.investigate('x', 'a')).toThrow();
  });

  it('startAction throws for missing id', () => {
    expect(() => mgr.startAction('x', '2026-01-01')).toThrow();
  });

  it('submitForVerification throws for missing id', () => {
    expect(() => mgr.submitForVerification('x', 'rc', 'PROCESS')).toThrow();
  });

  it('close throws for missing id', () => {
    expect(() => mgr.close('x', 'a', '2026-01-01', 'EFFECTIVE')).toThrow();
  });

  it('cancel throws for missing id', () => {
    expect(() => mgr.cancel('x')).toThrow();
  });

  // Parameterized: 30 error throw checks for investigate
  Array.from({ length: 30 }, (_, i) => i).forEach(i => {
    it(`investigate throws on missing id #${i}`, () => {
      expect(() => mgr.investigate(`missing-${i}`, 'a')).toThrow();
    });
  });

  // Parameterized: 30 error throw checks for cancel
  Array.from({ length: 30 }, (_, i) => i).forEach(i => {
    it(`cancel throws on missing id #${i}`, () => {
      expect(() => mgr.cancel(`missing-cancel-${i}`)).toThrow();
    });
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// ActionTracker — addAction
// ═════════════════════════════════════════════════════════════════════════════

describe('ActionTracker.addAction', () => {
  let tracker: ActionTracker;
  beforeEach(() => { tracker = makeTracker(); });

  it('returns an action with PENDING status', () => {
    const a = tracker.addAction('capa-1', 'Fix leak', 'alice@x.com', '2026-03-01');
    expect(a.status).toBe('PENDING');
  });

  it('id starts with act-', () => {
    const a = tracker.addAction('c1', 'D', 'u', '2026-01-01');
    expect(a.id).toMatch(/^act-/);
  });

  it('capaId is stored', () => {
    const a = tracker.addAction('capa-xyz', 'D', 'u', '2026-01-01');
    expect(a.capaId).toBe('capa-xyz');
  });

  it('description is stored', () => {
    const a = tracker.addAction('c1', 'Install guard rail', 'u', '2026-01-01');
    expect(a.description).toBe('Install guard rail');
  });

  it('assignedTo is stored', () => {
    const a = tracker.addAction('c1', 'D', 'bob@x.com', '2026-01-01');
    expect(a.assignedTo).toBe('bob@x.com');
  });

  it('dueDate is stored', () => {
    const a = tracker.addAction('c1', 'D', 'u', '2026-06-15');
    expect(a.dueDate).toBe('2026-06-15');
  });

  it('completedDate is undefined by default', () => {
    const a = tracker.addAction('c1', 'D', 'u', '2026-01-01');
    expect(a.completedDate).toBeUndefined();
  });

  it('notes is undefined by default', () => {
    const a = tracker.addAction('c1', 'D', 'u', '2026-01-01');
    expect(a.notes).toBeUndefined();
  });

  it('getCount increments', () => {
    tracker.addAction('c1', 'D', 'u', '2026-01-01');
    tracker.addAction('c1', 'D', 'u', '2026-01-01');
    expect(tracker.getCount()).toBe(2);
  });

  // Parameterized: ids have act- prefix and are positive integers
  Array.from({ length: 100 }, (_, i) => i).forEach(i => {
    it(`addAction sequence #${i} — id matches act-<number>`, () => {
      const a = tracker.addAction('c', 'D', 'u', '2026-01-01');
      expect(a.id).toMatch(/^act-\d+$/);
      const seq = parseInt(a.id.replace('act-', ''), 10);
      expect(seq).toBeGreaterThan(0);
    });
  });

  // Parameterized: 100 records with various capaIds
  Array.from({ length: 100 }, (_, i) => i).forEach(i => {
    it(`addAction #${i} — capaId capa-${i} stored`, () => {
      const a = tracker.addAction(`capa-${i}`, 'D', 'u', '2026-01-01');
      expect(a.capaId).toBe(`capa-${i}`);
    });
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// ActionTracker.start
// ═════════════════════════════════════════════════════════════════════════════

describe('ActionTracker.start', () => {
  let tracker: ActionTracker;
  beforeEach(() => { tracker = makeTracker(); });

  it('transitions to IN_PROGRESS', () => {
    const a = tracker.addAction('c1', 'D', 'u', '2026-01-01');
    const r = tracker.start(a.id);
    expect(r.status).toBe('IN_PROGRESS');
  });

  it('throws for unknown id', () => {
    expect(() => tracker.start('no-id')).toThrow();
  });

  // Parameterized: 80 start transitions
  Array.from({ length: 80 }, (_, i) => i).forEach(i => {
    it(`start loop #${i} — status IN_PROGRESS`, () => {
      const a = tracker.addAction('c', 'D', 'u', '2026-01-01');
      const r = tracker.start(a.id);
      expect(r.status).toBe('IN_PROGRESS');
    });
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// ActionTracker.complete
// ═════════════════════════════════════════════════════════════════════════════

describe('ActionTracker.complete', () => {
  let tracker: ActionTracker;
  beforeEach(() => { tracker = makeTracker(); });

  it('transitions to COMPLETED', () => {
    const a = tracker.addAction('c1', 'D', 'u', '2026-01-01');
    const r = tracker.complete(a.id, '2026-04-01');
    expect(r.status).toBe('COMPLETED');
  });

  it('sets completedDate', () => {
    const a = tracker.addAction('c1', 'D', 'u', '2026-01-01');
    const r = tracker.complete(a.id, '2026-05-10');
    expect(r.completedDate).toBe('2026-05-10');
  });

  it('sets notes when provided', () => {
    const a = tracker.addAction('c1', 'D', 'u', '2026-01-01');
    const r = tracker.complete(a.id, '2026-04-01', 'All done');
    expect(r.notes).toBe('All done');
  });

  it('notes remains undefined when not provided', () => {
    const a = tracker.addAction('c1', 'D', 'u', '2026-01-01');
    const r = tracker.complete(a.id, '2026-04-01');
    expect(r.notes).toBeUndefined();
  });

  it('throws for unknown id', () => {
    expect(() => tracker.complete('no-id', '2026-01-01')).toThrow();
  });

  // Parameterized: 80 completions with notes
  Array.from({ length: 80 }, (_, i) => i).forEach(i => {
    it(`complete loop #${i} — status COMPLETED and notes stored`, () => {
      const a = tracker.addAction('c', 'D', 'u', '2026-01-01');
      const r = tracker.complete(a.id, '2026-04-01', `note ${i}`);
      expect(r.status).toBe('COMPLETED');
      expect(r.notes).toBe(`note ${i}`);
    });
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// ActionTracker.markOverdue
// ═════════════════════════════════════════════════════════════════════════════

describe('ActionTracker.markOverdue', () => {
  let tracker: ActionTracker;
  beforeEach(() => { tracker = makeTracker(); });

  it('transitions to OVERDUE', () => {
    const a = tracker.addAction('c1', 'D', 'u', '2026-01-01');
    const r = tracker.markOverdue(a.id);
    expect(r.status).toBe('OVERDUE');
  });

  it('throws for unknown id', () => {
    expect(() => tracker.markOverdue('no-id')).toThrow();
  });

  // Parameterized: 80 overdue transitions
  Array.from({ length: 80 }, (_, i) => i).forEach(i => {
    it(`markOverdue loop #${i} — status OVERDUE`, () => {
      const a = tracker.addAction('c', 'D', 'u', '2026-01-01');
      const r = tracker.markOverdue(a.id);
      expect(r.status).toBe('OVERDUE');
    });
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// ActionTracker.getByCAPA
// ═════════════════════════════════════════════════════════════════════════════

describe('ActionTracker.getByCAPA', () => {
  let tracker: ActionTracker;
  beforeEach(() => { tracker = makeTracker(); });

  it('returns actions for the given capaId', () => {
    tracker.addAction('capa-a', 'D1', 'u', '2026-01-01');
    tracker.addAction('capa-a', 'D2', 'u', '2026-01-01');
    tracker.addAction('capa-b', 'D3', 'u', '2026-01-01');
    const results = tracker.getByCAPA('capa-a');
    expect(results).toHaveLength(2);
  });

  it('returns empty for capaId with no actions', () => {
    expect(tracker.getByCAPA('nonexistent')).toHaveLength(0);
  });

  it('all returned actions have matching capaId', () => {
    tracker.addAction('capa-x', 'D', 'u', '2026-01-01');
    tracker.addAction('capa-x', 'D', 'u', '2026-01-01');
    const results = tracker.getByCAPA('capa-x');
    expect(results.every(a => a.capaId === 'capa-x')).toBe(true);
  });

  // Parameterized: 80 per-CAPA lookup checks
  Array.from({ length: 80 }, (_, i) => i).forEach(i => {
    it(`getByCAPA loop #${i} — finds added action`, () => {
      const capaId = `capa-bc-${i}`;
      tracker.addAction(capaId, 'D', 'u', '2026-01-01');
      const results = tracker.getByCAPA(capaId);
      expect(results.some(a => a.capaId === capaId)).toBe(true);
    });
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// ActionTracker.getByAssignee
// ═════════════════════════════════════════════════════════════════════════════

describe('ActionTracker.getByAssignee', () => {
  let tracker: ActionTracker;
  beforeEach(() => { tracker = makeTracker(); });

  it('returns actions for the given assignee', () => {
    tracker.addAction('c1', 'D', 'alice@x.com', '2026-01-01');
    tracker.addAction('c1', 'D', 'bob@x.com', '2026-01-01');
    const results = tracker.getByAssignee('alice@x.com');
    expect(results).toHaveLength(1);
    expect(results[0].assignedTo).toBe('alice@x.com');
  });

  it('returns empty for unknown assignee', () => {
    expect(tracker.getByAssignee('nobody@x.com')).toHaveLength(0);
  });

  // Parameterized: 80 assignee lookups
  Array.from({ length: 80 }, (_, i) => i).forEach(i => {
    it(`getByAssignee loop #${i} — finds action`, () => {
      const assignee = `user${i}@x.com`;
      tracker.addAction('c', 'D', assignee, '2026-01-01');
      const found = tracker.getByAssignee(assignee);
      expect(found.some(a => a.assignedTo === assignee)).toBe(true);
    });
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// ActionTracker.getByStatus
// ═════════════════════════════════════════════════════════════════════════════

describe('ActionTracker.getByStatus', () => {
  let tracker: ActionTracker;
  beforeEach(() => { tracker = makeTracker(); });

  it('getByStatus PENDING returns pending actions', () => {
    tracker.addAction('c1', 'D', 'u', '2026-01-01');
    expect(tracker.getByStatus('PENDING')).toHaveLength(1);
  });

  it('getByStatus IN_PROGRESS returns started actions', () => {
    const a = tracker.addAction('c1', 'D', 'u', '2026-01-01');
    tracker.start(a.id);
    expect(tracker.getByStatus('IN_PROGRESS')).toHaveLength(1);
  });

  it('getByStatus COMPLETED returns completed actions', () => {
    const a = tracker.addAction('c1', 'D', 'u', '2026-01-01');
    tracker.complete(a.id, '2026-04-01');
    expect(tracker.getByStatus('COMPLETED')).toHaveLength(1);
  });

  it('getByStatus OVERDUE returns overdue actions', () => {
    const a = tracker.addAction('c1', 'D', 'u', '2026-01-01');
    tracker.markOverdue(a.id);
    expect(tracker.getByStatus('OVERDUE')).toHaveLength(1);
  });

  // Parameterized: all action statuses
  ACTION_STATUSES.forEach(status => {
    it(`getByStatus('${status}') returns correct records`, () => {
      for (let i = 0; i < 3; i++) {
        const a = tracker.addAction('c', 'D', 'u', '2026-01-01');
        if (status === 'IN_PROGRESS') tracker.start(a.id);
        else if (status === 'COMPLETED') tracker.complete(a.id, '2026-04-01');
        else if (status === 'OVERDUE') tracker.markOverdue(a.id);
      }
      const results = tracker.getByStatus(status);
      expect(results.every(a => a.status === status)).toBe(true);
    });
  });

  // Parameterized: 60 per-status lookups
  Array.from({ length: 60 }, (_, i) => i).forEach(i => {
    it(`getByStatus loop #${i}`, () => {
      const a = tracker.addAction('c', 'D', 'u', '2026-01-01');
      const status = ACTION_STATUSES[i % ACTION_STATUSES.length];
      if (status === 'IN_PROGRESS') tracker.start(a.id);
      else if (status === 'COMPLETED') tracker.complete(a.id, '2026-01-01');
      else if (status === 'OVERDUE') tracker.markOverdue(a.id);
      const found = tracker.getByStatus(status);
      expect(found.some(x => x.id === a.id)).toBe(true);
    });
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// ActionTracker.getPending / getOverdue
// ═════════════════════════════════════════════════════════════════════════════

describe('ActionTracker.getPending / getOverdue', () => {
  let tracker: ActionTracker;
  beforeEach(() => { tracker = makeTracker(); });

  it('getPending returns only PENDING actions', () => {
    tracker.addAction('c1', 'D', 'u', '2026-01-01');
    const a2 = tracker.addAction('c1', 'D', 'u', '2026-01-01');
    tracker.start(a2.id);
    expect(tracker.getPending()).toHaveLength(1);
    expect(tracker.getPending()[0].status).toBe('PENDING');
  });

  it('getOverdue returns only OVERDUE actions', () => {
    const a = tracker.addAction('c1', 'D', 'u', '2026-01-01');
    tracker.markOverdue(a.id);
    const b = tracker.addAction('c1', 'D', 'u', '2026-01-01');
    tracker.start(b.id);
    expect(tracker.getOverdue()).toHaveLength(1);
    expect(tracker.getOverdue()[0].status).toBe('OVERDUE');
  });

  it('getPending returns empty when all are started', () => {
    const a = tracker.addAction('c1', 'D', 'u', '2026-01-01');
    tracker.start(a.id);
    expect(tracker.getPending()).toHaveLength(0);
  });

  it('getOverdue returns empty when none are overdue', () => {
    tracker.addAction('c1', 'D', 'u', '2026-01-01');
    expect(tracker.getOverdue()).toHaveLength(0);
  });

  // Parameterized: 60 getPending checks
  Array.from({ length: 60 }, (_, i) => i).forEach(i => {
    it(`getPending loop #${i} — newly added action appears`, () => {
      const a = tracker.addAction('c', 'D', 'u', '2026-01-01');
      expect(tracker.getPending().some(x => x.id === a.id)).toBe(true);
    });
  });

  // Parameterized: 60 getOverdue checks
  Array.from({ length: 60 }, (_, i) => i).forEach(i => {
    it(`getOverdue loop #${i} — marked action appears`, () => {
      const a = tracker.addAction('c', 'D', 'u', '2026-01-01');
      tracker.markOverdue(a.id);
      expect(tracker.getOverdue().some(x => x.id === a.id)).toBe(true);
    });
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// ActionTracker.getCompletionRate
// ═════════════════════════════════════════════════════════════════════════════

describe('ActionTracker.getCompletionRate', () => {
  let tracker: ActionTracker;
  beforeEach(() => { tracker = makeTracker(); });

  it('returns 0 when no actions for capaId', () => {
    expect(tracker.getCompletionRate('no-capa')).toBe(0);
  });

  it('returns 0 when no actions are completed', () => {
    tracker.addAction('c1', 'D', 'u', '2026-01-01');
    tracker.addAction('c1', 'D', 'u', '2026-01-01');
    expect(tracker.getCompletionRate('c1')).toBe(0);
  });

  it('returns 100 when all actions are completed', () => {
    const a = tracker.addAction('c1', 'D', 'u', '2026-01-01');
    const b = tracker.addAction('c1', 'D', 'u', '2026-01-01');
    tracker.complete(a.id, '2026-01-10');
    tracker.complete(b.id, '2026-01-11');
    expect(tracker.getCompletionRate('c1')).toBe(100);
  });

  it('returns 50 when half are completed', () => {
    const a = tracker.addAction('c1', 'D', 'u', '2026-01-01');
    tracker.addAction('c1', 'D', 'u', '2026-01-01');
    tracker.complete(a.id, '2026-01-10');
    expect(tracker.getCompletionRate('c1')).toBe(50);
  });

  it('returns 25 when 1 of 4 are completed', () => {
    const actions = [
      tracker.addAction('cx', 'D', 'u', '2026-01-01'),
      tracker.addAction('cx', 'D', 'u', '2026-01-01'),
      tracker.addAction('cx', 'D', 'u', '2026-01-01'),
      tracker.addAction('cx', 'D', 'u', '2026-01-01'),
    ];
    tracker.complete(actions[0].id, '2026-01-10');
    expect(tracker.getCompletionRate('cx')).toBe(25);
  });

  it('returns 75 when 3 of 4 are completed', () => {
    const actions = [
      tracker.addAction('cy', 'D', 'u', '2026-01-01'),
      tracker.addAction('cy', 'D', 'u', '2026-01-01'),
      tracker.addAction('cy', 'D', 'u', '2026-01-01'),
      tracker.addAction('cy', 'D', 'u', '2026-01-01'),
    ];
    tracker.complete(actions[0].id, '2026-01-01');
    tracker.complete(actions[1].id, '2026-01-01');
    tracker.complete(actions[2].id, '2026-01-01');
    expect(tracker.getCompletionRate('cy')).toBe(75);
  });

  // Parameterized: 80 completion rate checks
  Array.from({ length: 80 }, (_, i) => i).forEach(i => {
    it(`getCompletionRate loop #${i} — 100% after completing all`, () => {
      const capaId = `cr-capa-${i}`;
      const a = tracker.addAction(capaId, 'D', 'u', '2026-01-01');
      tracker.complete(a.id, '2026-04-01');
      expect(tracker.getCompletionRate(capaId)).toBe(100);
    });
  });

  // Parameterized: 60 zero completion rate checks
  Array.from({ length: 60 }, (_, i) => i).forEach(i => {
    it(`getCompletionRate loop #${i} — 0% when action pending`, () => {
      const capaId = `cr-zero-${i}`;
      tracker.addAction(capaId, 'D', 'u', '2026-01-01');
      expect(tracker.getCompletionRate(capaId)).toBe(0);
    });
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// ActionTracker.getCount
// ═════════════════════════════════════════════════════════════════════════════

describe('ActionTracker.getCount', () => {
  let tracker: ActionTracker;
  beforeEach(() => { tracker = makeTracker(); });

  it('returns 0 initially', () => {
    expect(tracker.getCount()).toBe(0);
  });

  // Parameterized: 60 count checks
  Array.from({ length: 60 }, (_, i) => i + 1).forEach(n => {
    it(`after adding ${n} actions, getCount=${n}`, () => {
      for (let j = 0; j < n; j++) {
        tracker.addAction('c', 'D', 'u', '2026-01-01');
      }
      expect(tracker.getCount()).toBe(n);
    });
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// ActionTracker — error paths
// ═════════════════════════════════════════════════════════════════════════════

describe('ActionTracker — error paths', () => {
  let tracker: ActionTracker;
  beforeEach(() => { tracker = makeTracker(); });

  it('start throws for unknown id', () => {
    expect(() => tracker.start('bad-id')).toThrow();
  });

  it('complete throws for unknown id', () => {
    expect(() => tracker.complete('bad-id', '2026-01-01')).toThrow();
  });

  it('markOverdue throws for unknown id', () => {
    expect(() => tracker.markOverdue('bad-id')).toThrow();
  });

  // Parameterized: 30 start throws
  Array.from({ length: 30 }, (_, i) => i).forEach(i => {
    it(`start throws for missing id #${i}`, () => {
      expect(() => tracker.start(`missing-start-${i}`)).toThrow();
    });
  });

  // Parameterized: 30 complete throws
  Array.from({ length: 30 }, (_, i) => i).forEach(i => {
    it(`complete throws for missing id #${i}`, () => {
      expect(() => tracker.complete(`missing-complete-${i}`, '2026-01-01')).toThrow();
    });
  });

  // Parameterized: 30 markOverdue throws
  Array.from({ length: 30 }, (_, i) => i).forEach(i => {
    it(`markOverdue throws for missing id #${i}`, () => {
      expect(() => tracker.markOverdue(`missing-overdue-${i}`)).toThrow();
    });
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// Integration: Full CAPA lifecycle with actions
// ═════════════════════════════════════════════════════════════════════════════

describe('Integration: Full CAPA lifecycle with actions', () => {
  let mgr: CAPAManager;
  let tracker: ActionTracker;
  beforeEach(() => {
    mgr = makeManager();
    tracker = makeTracker();
  });

  it('full lifecycle: raise → investigate → startAction → verify → close', () => {
    mgr.raise('int-1', 'Safety violation', 'CORRECTIVE', 'CRITICAL', 'Machine guard missing', 'Audit', 'auditor@x.com', '2026-01-10');
    expect(mgr.getByStatus('OPEN')).toHaveLength(1);

    mgr.investigate('int-1', 'safety@x.com');
    expect(mgr.getByStatus('UNDER_INVESTIGATION')).toHaveLength(1);

    const a1 = tracker.addAction('int-1', 'Install new guard', 'tech@x.com', '2026-02-01');
    const a2 = tracker.addAction('int-1', 'Retrain operators', 'trainer@x.com', '2026-02-15');
    expect(tracker.getByCAPA('int-1')).toHaveLength(2);
    expect(tracker.getCompletionRate('int-1')).toBe(0);

    tracker.start(a1.id);
    tracker.complete(a1.id, '2026-01-25', 'Guard installed successfully');
    tracker.start(a2.id);
    tracker.complete(a2.id, '2026-02-10', 'Training completed');
    expect(tracker.getCompletionRate('int-1')).toBe(100);

    mgr.startAction('int-1', '2026-02-15');
    mgr.submitForVerification('int-1', 'Missing machine guard due to process gap', 'PROCESS');
    mgr.close('int-1', 'manager@x.com', '2026-03-01', 'EFFECTIVE');

    expect(mgr.getByStatus('CLOSED')).toHaveLength(1);
    expect(mgr.getEffectiveness()).toEqual({ effective: 1, partiallyEffective: 0, notEffective: 0, total: 1 });
  });

  it('full lifecycle with cancellation', () => {
    mgr.raise('int-2', 'Minor deviation', 'PREVENTIVE', 'LOW', 'Possible future issue', 'Risk Assessment', 'ra@x.com', '2026-01-15');
    tracker.addAction('int-2', 'Review procedure', 'analyst@x.com', '2026-02-01');
    mgr.cancel('int-2');
    expect(mgr.getByStatus('CANCELLED')).toHaveLength(1);
    expect(tracker.getByCAPA('int-2')).toHaveLength(1);
  });

  it('multiple CAPAs with mixed outcomes', () => {
    fullLifecycle(mgr, 'mix-1', 'EFFECTIVE');
    fullLifecycle(mgr, 'mix-2', 'PARTIALLY_EFFECTIVE');
    fullLifecycle(mgr, 'mix-3', 'NOT_EFFECTIVE');
    raiseBasic(mgr, 'mix-4'); // still open
    mgr.cancel('capa-mix-4'); // cancelled

    const eff = mgr.getEffectiveness();
    expect(eff.effective).toBe(1);
    expect(eff.partiallyEffective).toBe(1);
    expect(eff.notEffective).toBe(1);
    expect(eff.total).toBe(3);
    expect(mgr.getByStatus('CANCELLED')).toHaveLength(1);
  });

  it('overdue detection with action tracker', () => {
    mgr.raise('od-int', 'Overdue CAPA', 'CORRECTIVE', 'HIGH', 'D', 'S', 'u', '2026-01-01');
    mgr.startAction('od-int', '2025-12-01');
    const a = tracker.addAction('od-int', 'Implement fix', 'eng@x.com', '2025-12-01');
    tracker.markOverdue(a.id);

    expect(mgr.getOverdue('2026-01-01')).toHaveLength(1);
    expect(tracker.getOverdue()).toHaveLength(1);
  });

  it('critical CAPA tracking across multiple', () => {
    for (let i = 0; i < 5; i++) {
      mgr.raise(`crit-int-${i}`, 'T', 'CORRECTIVE', 'CRITICAL', 'D', 'S', 'u', '2026-01-01');
    }
    for (let i = 0; i < 3; i++) {
      mgr.raise(`high-int-${i}`, 'T', 'CORRECTIVE', 'HIGH', 'D', 'S', 'u', '2026-01-01');
    }
    expect(mgr.getCritical()).toHaveLength(5);
    expect(mgr.getByPriority('HIGH')).toHaveLength(3);
  });

  it('action completion rate reflects partial completion', () => {
    const capaId = 'partial-capa';
    mgr.raise(capaId, 'T', 'CORRECTIVE', 'MEDIUM', 'D', 'S', 'u', '2026-01-01');
    const actions = [];
    for (let i = 0; i < 4; i++) {
      actions.push(tracker.addAction(capaId, `action ${i}`, 'u', '2026-03-01'));
    }
    tracker.complete(actions[0].id, '2026-03-01');
    tracker.complete(actions[1].id, '2026-03-02');
    expect(tracker.getCompletionRate(capaId)).toBe(50);
  });

  // Parameterized: 50 full lifecycle integration tests
  Array.from({ length: 50 }, (_, i) => i).forEach(i => {
    it(`full lifecycle integration #${i}`, () => {
      const id = `lifecycle-${i}`;
      const vr = VERIFICATION_RESULTS[i % VERIFICATION_RESULTS.length];
      const priority = PRIORITIES[i % PRIORITIES.length];
      const type = TYPES[i % TYPES.length];

      mgr.raise(id, `Title ${i}`, type, priority, `Desc ${i}`, 'Audit', 'u@x.com', '2026-01-01');
      mgr.investigate(id, `investigator${i}@x.com`);
      const a = tracker.addAction(id, `Action ${i}`, `worker${i}@x.com`, '2026-03-01');
      tracker.start(a.id);
      tracker.complete(a.id, '2026-03-15');
      mgr.startAction(id, '2026-03-01');
      mgr.submitForVerification(id, `Root cause ${i}`, RC_CATEGORIES[i % RC_CATEGORIES.length]);
      mgr.close(id, 'mgr@x.com', '2026-04-01', vr);

      expect(mgr.get(id)?.status).toBe('CLOSED');
      expect(mgr.get(id)?.verificationResult).toBe(vr);
      expect(tracker.getCompletionRate(id)).toBe(100);
    });
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// Types — shape validation
// ═════════════════════════════════════════════════════════════════════════════

describe('Types — shape validation', () => {
  let mgr: CAPAManager;
  let tracker: ActionTracker;
  beforeEach(() => {
    mgr = makeManager();
    tracker = makeTracker();
  });

  it('CAPARecord has all required fields', () => {
    const r = raiseBasic(mgr);
    expect(r).toHaveProperty('id');
    expect(r).toHaveProperty('title');
    expect(r).toHaveProperty('type');
    expect(r).toHaveProperty('priority');
    expect(r).toHaveProperty('status');
    expect(r).toHaveProperty('description');
    expect(r).toHaveProperty('source');
    expect(r).toHaveProperty('raisedBy');
    expect(r).toHaveProperty('raisedAt');
  });

  it('CAPAAction has all required fields', () => {
    const a = tracker.addAction('c1', 'D', 'u', '2026-01-01');
    expect(a).toHaveProperty('id');
    expect(a).toHaveProperty('capaId');
    expect(a).toHaveProperty('description');
    expect(a).toHaveProperty('assignedTo');
    expect(a).toHaveProperty('dueDate');
    expect(a).toHaveProperty('status');
  });

  // Parameterized: all CAPA types valid
  TYPES.forEach(type => {
    it(`type '${type}' is valid`, () => {
      const r = mgr.raise(`type-${type}`, 'T', type, 'LOW', 'D', 'S', 'u', '2026-01-01');
      expect(r.type).toBe(type);
    });
  });

  // Parameterized: all priorities valid
  PRIORITIES.forEach(p => {
    it(`priority '${p}' is valid`, () => {
      const r = mgr.raise(`prio-${p}`, 'T', 'CORRECTIVE', p, 'D', 'S', 'u', '2026-01-01');
      expect(r.priority).toBe(p);
    });
  });

  // Parameterized: all root cause categories
  RC_CATEGORIES.forEach(cat => {
    it(`rootCauseCategory '${cat}' is valid`, () => {
      mgr.raise(`rc-cat-${cat}`, 'T', 'CORRECTIVE', 'LOW', 'D', 'S', 'u', '2026-01-01');
      const r = mgr.submitForVerification(`rc-cat-${cat}`, 'text', cat);
      expect(r.rootCauseCategory).toBe(cat);
    });
  });

  // Parameterized: all verification results
  VERIFICATION_RESULTS.forEach(vr => {
    it(`verificationResult '${vr}' is valid`, () => {
      fullLifecycle(mgr, `vr-test-${vr}`, vr);
      expect(mgr.get(`vr-test-${vr}`)?.verificationResult).toBe(vr);
    });
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// Immutability: returned objects should be copies
// ═════════════════════════════════════════════════════════════════════════════

describe('Immutability', () => {
  let mgr: CAPAManager;
  let tracker: ActionTracker;
  beforeEach(() => {
    mgr = makeManager();
    tracker = makeTracker();
  });

  it('modifying returned CAPARecord does not mutate stored record', () => {
    raiseBasic(mgr, 'imm1');
    const r = mgr.get('capa-imm1')!;
    (r as { status: string }).status = 'CANCELLED';
    expect(mgr.get('capa-imm1')?.status).toBe('OPEN');
  });

  it('modifying returned CAPAAction does not mutate stored action', () => {
    const a = tracker.addAction('c1', 'D', 'u', '2026-01-01');
    const copy = tracker.getByCAPA('c1')[0];
    (copy as { status: string }).status = 'COMPLETED';
    expect(tracker.getByStatus('PENDING')).toHaveLength(1);
  });

  it('modifying getAll result does not mutate stored records', () => {
    raiseBasic(mgr, 'imm2');
    const all = mgr.getAll();
    (all[0] as { status: string }).status = 'CANCELLED';
    expect(mgr.getAll()[0].status).toBe('OPEN');
  });
});
